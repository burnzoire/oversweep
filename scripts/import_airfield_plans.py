#!/usr/bin/env python3
"""Fetch an airfield's layout from OpenStreetMap for its airfield map figure.

Usage: python3 scripts/import_airfield_plans.py <record-slug> <lat> <lon> [--box=<degrees>]

With --box, for a disused field that OSM no longer maps as an aerodrome, it
skips the aerodrome search and keeps the aeroway features (abandoned ones
included) within that many degrees of the point.

Finds the OSM aerodrome at the airfield reference point with Nominatim,
downloads the map data over its bounding box from the main OSM API, and keeps
the aeroway features inside the aerodrome area: runways, taxiways, aprons,
hangars, terminals and helipads. Lines are simplified to about 2 m and coordinates rounded to six
decimal places. Writes src/data/airfield-plans/<slug>.json with the source,
the retrieval date and the ODbL licence, which the figure credits.
"""
import datetime
import hashlib
import json
import math
import os
import pathlib
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET

AGENT = 'oversweep-airfield-plans/1 (github.com/burnzoire/oversweep)'
NOMINATIM = 'https://nominatim.openstreetmap.org/search?q=aerodrome&viewbox={w},{n},{e},{s}&bounded=1&format=json&limit=10'
API = 'https://api.openstreetmap.org/api/0.6/map?bbox={w},{s},{e},{n}'
KEEP = {'runway', 'taxiway', 'apron', 'hangar', 'terminal', 'helipad', 'navigationaid', 'holding_position'}
DRAWN = {'runway', 'taxiway', 'apron', 'hangar', 'terminal', 'helipad'}
# Raw downloads are kept between runs, to spare the API's bandwidth limit.
CACHE = pathlib.Path(os.environ.get('OSM_CACHE', '/tmp/osm-cache'))
CACHE.mkdir(parents=True, exist_ok=True)
OUT = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'data' / 'airfield-plans'


def get(url):
    """One API response, cached between runs."""
    cached = CACHE / (hashlib.sha1(url.encode()).hexdigest())
    for attempt in range(6):
        try:
            if not cached.exists():
                req = urllib.request.Request(url, headers={'User-Agent': AGENT})
                with urllib.request.urlopen(req, timeout=180) as r:
                    cached.write_bytes(r.read())
            return cached.read_bytes()
        except urllib.error.HTTPError as e:
            if e.code == 400 or attempt == 5:
                raise
            # 509 is the API's bandwidth limit: wait it out.
            time.sleep(90 if e.code == 509 else 2 ** attempt)


def find_aerodrome(lat, lon):
    """The bounding box of the smallest OSM aerodrome near the point, from Nominatim."""
    d = 0.05
    found = json.loads(get(NOMINATIM.format(w=lon - d, n=lat + d, e=lon + d, s=lat - d)))
    found = [x for x in found if x.get('class') == 'aeroway' and x.get('type') == 'aerodrome']
    if not found:
        sys.exit(f'Nominatim finds no aerodrome near {lat}, {lon}.')
    box = lambda x: [float(v) for v in x['boundingbox']]
    holds = [x for x in found if box(x)[0] <= lat <= box(x)[1] and box(x)[2] <= lon <= box(x)[3]]
    best = min(holds or found, key=lambda x: (box(x)[1] - box(x)[0]) * (box(x)[3] - box(x)[2]))
    return box(best)


def fetch(s, n, w, e, tile_deg=0.01):
    """The map data over a box in tiles, since the API refuses areas with too many nodes."""
    root = ET.Element('osm')
    seen = set()
    rows, cols = max(1, math.ceil((n - s) / tile_deg)), max(1, math.ceil((e - w) / tile_deg))
    for i in range(rows):
        for j in range(cols):
            ts, tw = s + (n - s) * i / rows, w + (e - w) * j / cols
            tn, te = ts + (n - s) / rows, tw + (e - w) / cols
            try:
                part = ET.fromstring(get(API.format(w=round(tw, 5), s=round(ts, 5), e=round(te, 5), n=round(tn, 5))))
            except urllib.error.HTTPError as err:
                if err.code != 400 or tile_deg < 0.002:
                    raise
                # Still too dense: this tile again in smaller pieces.
                part = fetch(ts, tn, tw, te, tile_deg / 2)
            for el in part:
                key = (el.tag, el.get('id'))
                if el.get('id') and key not in seen:
                    seen.add(key)
                    root.append(el)
    return root


def inside(pt, ring):
    """Ray casting; pt and ring as (lat, lon)."""
    y, x = pt
    hit = False
    for (y1, x1), (y2, x2) in zip(ring, ring[1:] + ring[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            hit = not hit
    return hit


def simplify(points, tol_m=2.0):
    """Douglas-Peucker in a local flat projection."""
    if len(points) < 3:
        return points
    lat0 = points[0][0]
    k = 111132 * math.cos(math.radians(lat0))
    xy = [((lon - points[0][1]) * k, (lat - lat0) * 111132) for lat, lon in points]

    def rec(i, j):
        (ax, ay), (bx, by) = xy[i], xy[j]
        dx, dy = bx - ax, by - ay
        length = math.hypot(dx, dy)
        far, idx = 0.0, None
        for m in range(i + 1, j):
            px, py = xy[m]
            # A closed ring starts and ends at one point: measure from it.
            d = abs(dy * (px - ax) - dx * (py - ay)) / length if length else math.hypot(px - ax, py - ay)
            if d > far:
                far, idx = d, m
        if idx is None or far <= tol_m:
            return [i, j]
        return rec(i, idx)[:-1] + rec(idx, j)

    return [points[m] for m in rec(0, len(points) - 1)]


def main():
    slug, lat, lon = sys.argv[1], float(sys.argv[2]), float(sys.argv[3])
    box = next((float(a.split('=')[1]) for a in sys.argv[4:] if a.startswith('--box=')), None)
    s, n, w, e = bounds = (lat - box, lat + box, lon - box, lon + box) if box else find_aerodrome(lat, lon)
    margin = 0.002
    url = API.format(w=round(w - margin, 5), s=round(s - margin, 5), e=round(e + margin, 5), n=round(n + margin, 5))
    root = fetch(s - margin, n + margin, w - margin, e + margin)
    nodes = {n.get('id'): (float(n.get('lat')), float(n.get('lon'))) for n in root.iter('node')}
    tags = lambda el: {t.get('k'): t.get('v') for t in el.iter('tag')}
    ways = {}
    for w in root.iter('way'):
        refs = [nd.get('ref') for nd in w.iter('nd')]
        if all(r in nodes for r in refs):
            ways[w.get('id')] = ([nodes[r] for r in refs], tags(w))

    # Areas: closed ways, and multipolygon relations with their outer ways joined.
    areas = []
    for wid, (pts, t) in ways.items():
        if len(pts) > 3 and pts[0] == pts[-1]:
            areas.append((f'way/{wid}', [pts], t))
    for rel in root.iter('relation'):
        t = tags(rel)
        if t.get('type') != 'multipolygon':
            continue
        outers = [ways[m.get('ref')][0] for m in rel.iter('member') if m.get('type') == 'way' and m.get('role') == 'outer' and m.get('ref') in ways]
        rings, pending = [], [list(o) for o in outers]
        while pending:
            ring = pending.pop(0)
            grew = True
            while ring[0] != ring[-1] and grew:
                grew = False
                for o in pending:
                    if o[0] == ring[-1]:
                        ring += o[1:]
                    elif o[-1] == ring[-1]:
                        ring += o[-2::-1]
                    else:
                        continue
                    pending.remove(o)
                    grew = True
                    break
            if ring[0] == ring[-1]:
                rings.append(ring)
        if rings:
            areas.append((f'relation/{rel.get("id")}', rings, t))

    if box:
        aid, arings, atags = None, [], {}
        within = lambda pts: sum(bounds[0] <= p[0] <= bounds[1] and bounds[2] <= p[1] <= bounds[3] for p in pts) * 2 >= len(pts)
    else:
        aerodromes = [(oid, rings, t) for oid, rings, t in areas if t.get('aeroway') == 'aerodrome' and any(inside((lat, lon), r[:-1]) for r in rings)]
        if not aerodromes:
            sys.exit(f'No OSM aerodrome area contains {lat}, {lon}.')
        # The smallest aerodrome area containing the point.
        span = lambda rings: (max(p[0] for r in rings for p in r) - min(p[0] for r in rings for p in r)) * (max(p[1] for r in rings for p in r) - min(p[1] for r in rings for p in r))
        aid, arings, atags = min(aerodromes, key=lambda a: span(a[1]))
        within = lambda pts: sum(any(inside(p, r[:-1]) for r in arings) for p in pts) * 2 >= len(pts)

    features = []
    seen = set()
    for oid, rings, t in areas:
        kind = t.get('aeroway')
        if kind in DRAWN and kind not in ('runway', 'taxiway') and within(rings[0]):
            seen.add(oid)
            features.append({'type': kind, 'area': True, **({'ref': t['ref']} if t.get('ref') else {}), 'rings': [[[round(a, 6), round(b, 6)] for a, b in simplify(r)] for r in rings]})
    for wid, (pts, t) in ways.items():
        kind = t.get('aeroway')
        if kind not in ('runway', 'taxiway') or not within(pts):
            continue
        closed = len(pts) > 3 and pts[0] == pts[-1] and t.get('area') == 'yes'
        f = {'type': kind, 'area': closed}
        if t.get('ref'):
            f['ref'] = t['ref']
        if t.get('width'):
            try:
                f['widthM'] = float(t['width'].split()[0])
            except ValueError:
                pass
        if t.get('surface'):
            f['surface'] = t['surface']
        f['rings' if closed else 'line'] = [[[round(a, 6), round(b, 6)] for a, b in simplify(pts)]] if closed else [[round(a, 6), round(b, 6)] for a, b in simplify(pts)]
        features.append(f)

    out = {
        'record': slug,
        'source': {
            'title': f'OpenStreetMap aerodrome {aid} and the aeroway features inside it' if aid else 'OpenStreetMap aeroway features at the disused airfield',
            'publisher': 'OpenStreetMap contributors',
            'url': f'https://www.openstreetmap.org/{aid}' if aid else f'https://www.openstreetmap.org/?mlat={lat}&mlon={lon}#map=15/{lat}/{lon}',
            'api': url,
            'licence': 'ODbL 1.0',
            'licenceUrl': 'https://opendatacommons.org/licenses/odbl/1-0/',
            'retrieved': datetime.date.today().isoformat(),
        },
        'aerodrome': {'name': atags.get('name:en') or atags.get('name'), 'rings': [[[round(a, 6), round(b, 6)] for a, b in simplify(r, 5)] for r in arings]},
        'features': sorted(features, key=lambda f: ['apron', 'taxiway', 'runway', 'hangar', 'terminal', 'helipad'].index(f['type'])),
    }
    OUT.mkdir(parents=True, exist_ok=True)
    path = OUT / f'{slug}.json'
    path.write_text(json.dumps(out, separators=(',', ':'), ensure_ascii=False) + '\n')
    counts = {k: sum(f['type'] == k for f in features) for k in DRAWN}
    print(path.name, out['aerodrome']['name'], counts, f'{path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
