#!/usr/bin/env python3
"""Maverick seeker video placeholders, drawn to scale: python3 -I scripts/maverick-placeholders.py <out-dir>

Each scene is a ground plane seen through a pinhole camera from the jet's position, with every unit drawn as the
box its real size projects to (labelled by number), plus the road and buildings for composition. ChatGPT (Nathan)
paints the final art over these boxes; the prompts are in docs/art/maverick-seeker-prompts.md, generated from the
same numbers (`--prompts`). Writes <name>.webp and <name>.json (each box's image px) per view, and prints sizes.

Assumed (the DCS guide gives no figure): seeker fields of view 5 degrees wide, 2.5 narrow (the WPN page's expand
brackets outline half the picture). Each image spans K times the field of view so the picture can be slewed.
"""
import json, math, sys
from PIL import Image, ImageDraw, ImageFont

N = 768          # image px, square
K = 1.6          # image span / field of view (the glass shows the middle 1/K)
FOV = {'wide': 5.0, 'narrow': 2.5}
FT = 0.3048

# Units: name, length, width, height (m), from public data.
UNITS = {
    'T-72B': (6.95, 3.59, 2.23),   # hull without gun (9.53 m with it)
    'BMP-2': (6.72, 3.15, 2.45),
    'Ural-4320': (7.37, 2.50, 2.87),
    'House': (12.0, 8.0, 5.0),
}

# PRE scene: steerpoint 5 is a crossroads (origin, x east, y north, metres). An armoured column on the NE-SW road,
# heading south-west, 40 m apart, the lead T-72 about 170 m north-east of the crossroads; two farm houses.
SW = (-math.sqrt(.5), -math.sqrt(.5))
LEAD = (120.0, 120.0)
COLUMN = [('T-72B', 0), ('T-72B', 1), ('T-72B', 2), ('BMP-2', 3), ('Ural-4320', 4)]
PRE_UNITS = [(n, (LEAD[0] - SW[0] * 40 * k, LEAD[1] - SW[1] * 40 * k), 225.0) for n, k in COLUMN] + [
    ('House', (-32.0, 26.0), 0.0), ('House', (38.0, -30.0), 90.0)]
ROADS = [[(-600.0, 0.0), (600.0, 0.0)], [(LEAD[0] + 500 * -SW[0], LEAD[1] + 500 * -SW[1]), (LEAD[0] + 700 * SW[0], LEAD[1] + 700 * SW[1])]]
ROAD_W = 7.0

# The jet: 8,000 ft above the target area, 4 NM slant range, the target area dead ahead (north).
ALT = 8000 * FT
SLANT = 4 * 1852.0
GROUND = math.sqrt(SLANT ** 2 - ALT ** 2)
CAM = (0.0, -GROUND, ALT)
# The jet's boresight is above the line of sight to the target by this much (degrees): the pointer cross's depression.
SEEKER_DOWN = 8.5


def basis(aim):
    """Camera axes looking from CAM at the ground point `aim`: forward, right, up (unit vectors)."""
    f = [aim[0] - CAM[0], aim[1] - CAM[1], 0.0 - CAM[2]]
    m = math.sqrt(sum(v * v for v in f)); f = [v / m for v in f]
    r = [f[1], -f[0], 0.0]; m = math.hypot(r[0], r[1]); r = [v / m for v in r]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    return f, r, u


def projector(aim, fov):
    f, r, u = basis(aim)
    focal = (N / 2) / math.tan(math.radians(fov * K) / 2)
    def p(x, y, z=0.0):
        d = [x - CAM[0], y - CAM[1], z - CAM[2]]
        zf = sum(a * b for a, b in zip(d, f))
        return (N / 2 + focal * sum(a * b for a, b in zip(d, r)) / zf, N / 2 - focal * sum(a * b for a, b in zip(d, u)) / zf)
    return p


def box2d(p, name, at, heading):
    L, W, H = UNITS[name]
    h = math.radians(heading)
    ax, ay = math.sin(h), math.cos(h)          # along the unit's length
    bx, by = math.cos(h), -math.sin(h)         # across it
    pts = [p(at[0] + ax * a + bx * b, at[1] + ay * a + by * b, z) for a in (-L / 2, L / 2) for b in (-W / 2, W / 2) for z in (0, H)]
    xs, ys = [q[0] for q in pts], [q[1] for q in pts]
    return [min(xs), min(ys), max(xs), max(ys)]


def render(name, aim, fov, units, roads, ir, offset=(0.0, 0.0)):
    """`offset`: image px to shift the scene by, so a chosen point lands under the WPN crosshair, not the image centre."""
    p0 = projector(aim, fov)
    p = lambda x, y, z=0.0: tuple(v + o for v, o in zip(p0(x, y, z), offset))
    sky, ground, road, unit, line, text = ((25, 25, 25), (55, 55, 55), (40, 40, 40), (235, 235, 235), (230, 230, 230), (255, 220, 90)) if ir else \
        ((200, 200, 200), (150, 150, 150), (110, 110, 110), (40, 40, 40), (250, 250, 250), (255, 220, 0))
    im = Image.new('RGB', (N, N), ground)
    d = ImageDraw.Draw(im)
    font = ImageFont.load_default()
    # 100 m ground grid, faint, to show the perspective.
    for k in range(-20, 21):
        g = 100 * k
        for seg in (((g, -1500), (g, 1500)), ((-1500, g), (1500, g))):
            a, b = p(*seg[0]), p(*seg[1])
            d.line([a, b], fill=tuple(c + (8 if ir else -12) for c in ground), width=1)
    for rd in roads:
        (x0, y0), (x1, y1) = rd
        L = math.hypot(x1 - x0, y1 - y0); nx, ny = -(y1 - y0) / L * ROAD_W / 2, (x1 - x0) / L * ROAD_W / 2
        d.polygon([p(x0 + nx, y0 + ny), p(x1 + nx, y1 + ny), p(x1 - nx, y1 - ny), p(x0 - nx, y0 - ny)], fill=road)
    boxes = []
    for i, (n, at, hd) in enumerate(units, 1):
        b = [v + o for v, o in zip(box2d(p0, n, at, hd), offset * 2)]
        boxes.append({'n': i, 'unit': n, 'size_m': UNITS[n], 'heading': hd, 'box_px': [round(v, 1) for v in b]})
        d.rectangle(b, fill=unit, outline=line)
        d.text((b[0], b[1] - 11), str(i), fill=text, font=font)
    return im, boxes


def main():
    out = sys.argv[1]
    views = {}
    # WPN crosshair: 4.7 px left of and 7.2 px above the glass centre on the 660 px MFD grid (489 px glass).
    cross = (-4.7 / 489 * N / K, -7.2 / 489 * N / K)
    # Wide, slaved to the steerpoint (the crossroads under the crosshair): pans as the seeker is slewed.
    views['tv-wide'] = render('tv-wide', (0.0, 0.0), FOV['wide'], PRE_UNITS, ROADS, False, cross)
    # Wide, BORE: the seeker on the jet's boresight, which is 8.5 degrees above the line to the crossroads (the jet in a
    # shallow dive): it looks at ground about 6 km beyond the target area.
    bore = math.radians(math.degrees(math.asin(ALT / SLANT)) - SEEKER_DOWN)
    views['tv-bore'] = render('tv-bore', (0.0, -GROUND + ALT / math.tan(bore)), FOV['wide'], PRE_UNITS, ROADS, False, cross)
    # Narrow, on the lead T-72 (under the crosshair).
    views['tv-narrow'] = render('tv-narrow', LEAD, FOV['narrow'], PRE_UNITS, ROADS, False, cross)
    meta = {}
    for k, (im, boxes) in views.items():
        im.save(f'{out}/{k}.webp', quality=60, method=6)
        meta[k] = {'fov_deg': FOV['narrow' if 'narrow' in k else 'wide'], 'span_deg': FOV['narrow' if 'narrow' in k else 'wide'] * K, 'px': N, 'boxes': boxes}
    # The lead tank's place in the wide picture, relative to the crosshair (image px): the slew target.
    p = projector((0.0, 0.0), FOV['wide'])
    lx, ly = p(*LEAD, 1.1)
    meta['lead-from-cross-wide'] = [lx - N / 2, ly - N / 2]
    meta['camera'] = {'alt_ft': 8000, 'slant_nm': 4, 'depression_deg': round(math.degrees(math.asin(ALT / SLANT)), 1)}
    json.dump(meta, open(f'{out}/maverick-video.json', 'w'), indent=1)
    print(json.dumps({k: v for k, v in meta.items() if not isinstance(v, dict) or 'boxes' not in v}))
    for k in views:
        print(k, [(b['unit'], [round(v) for v in b['box_px']]) for b in meta[k]['boxes'][:2]])


main()
