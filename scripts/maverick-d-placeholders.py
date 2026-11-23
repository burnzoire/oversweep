#!/usr/bin/env python3
"""AGM-65D boresight and TGP handoff: seeker and pod video placeholders, to scale.

    python3 -I scripts/maverick-d-placeholders.py <out-dir>

Same method as `maverick-placeholders.py`: a ground plane seen through a pinhole camera from the jet, every unit
drawn as the box its real size projects to (numbered), plus roads for composition. ChatGPT (Nathan) paints the final
art over the boxes with the prompts in docs/art/maverick-d-seeker-prompts.md. Infrared, white-hot: warm things light.

Two scenes, each seen by the Maverick (AGM-65D, IR) and by the targeting pod:
- boresight: steerpoint 3, a road junction by a brickworks; the kiln chimney is the boresight point. 8,000 ft, 10 NM.
- target: steerpoint 5, a farm-track junction; two T-72s and a BMP-2 parked by a tree line. 8,000 ft, 5 NM.

Assumed (the DCS guide gives no figure): Maverick fields of view 5 degrees wide and 2.5 narrow (as the PRE shot), pod 1 degree
(NARO, as the guide's boresight image p. 679 shows it). Each image spans K times its field of view so it can be slewed under the crosshairs.
Writes <name>.webp and prints, per view, the image px of the points the WPN and TGP pages need.
"""
import json, math, sys
from PIL import Image, ImageDraw, ImageFont

N, K, FT, NM = 768, 1.6, 0.3048, 1852.0
FOV = {'mav-wide': 5.0, 'mav-narrow': 2.5, 'tgp': 1.0}
UNITS = {
    'T-72B': (6.95, 3.59, 2.23), 'BMP-2': (6.72, 3.15, 2.45),
    'Kiln': (80.0, 24.0, 10.0), 'Chimney': (4.0, 4.0, 40.0), 'Shed': (40.0, 12.0, 6.0),
    'House': (12.0, 8.0, 5.0), 'Barn': (20.0, 10.0, 7.0), 'Trees': (120.0, 12.0, 10.0),
}
WARM = {'T-72B', 'BMP-2', 'Chimney', 'Kiln'}
SCENES = {
    'boresight': {
        'alt_ft': 8000, 'slant_nm': 10,
        'units': [('Kiln', (20.0, 45.0), 90.0), ('Chimney', (66.0, 45.0), 0.0), ('Shed', (20.0, 18.0), 90.0),
                  ('Shed', (20.0, 72.0), 90.0), ('House', (-30.0, -25.0), 0.0), ('House', (-35.0, 30.0), 90.0)],
        'roads': [[(-900.0, 0.0), (900.0, 0.0)], [(0.0, -900.0), (0.0, 900.0)]],
        'aim': 'Chimney',
    },
    'target': {
        'alt_ft': 8000, 'slant_nm': 5,
        'units': [('T-72B', (35.0, 25.0), 10.0), ('T-72B', (55.0, 50.0), 25.0), ('BMP-2', (15.0, 55.0), 300.0),
                  ('Trees', (40.0, 72.0), 90.0), ('Barn', (-40.0, 25.0), 0.0), ('House', (-30.0, -25.0), 90.0)],
        'roads': [[(-900.0, 0.0), (900.0, 0.0)], [(0.0, 0.0), (0.0, 900.0)]],
        'aim': 'T-72B',
    },
}
ROAD_W = 6.0


def camera(sc):
    alt, slant = sc['alt_ft'] * FT, sc['slant_nm'] * NM
    return (0.0, -math.sqrt(slant ** 2 - alt ** 2), alt)


def projector(cam, aim, fov):
    f = [aim[0] - cam[0], aim[1] - cam[1], -cam[2]]
    m = math.sqrt(sum(v * v for v in f)); f = [v / m for v in f]
    r = [f[1], -f[0], 0.0]; m = math.hypot(r[0], r[1]); r = [v / m for v in r]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    focal = (N / 2) / math.tan(math.radians(fov * K) / 2)
    def p(x, y, z=0.0):
        d = [x - cam[0], y - cam[1], z - cam[2]]
        zf = sum(a * b for a, b in zip(d, f))
        return (N / 2 + focal * sum(a * b for a, b in zip(d, r)) / zf, N / 2 - focal * sum(a * b for a, b in zip(d, u)) / zf)
    return p


def box2d(p, name, at, heading):
    L, W, H = UNITS[name]
    h = math.radians(heading)
    ax, ay, bx, by = math.sin(h), math.cos(h), math.cos(h), -math.sin(h)
    pts = [p(at[0] + ax * a + bx * b, at[1] + ay * a + by * b, z) for a in (-L / 2, L / 2) for b in (-W / 2, W / 2) for z in (0, H)]
    return [min(q[0] for q in pts), min(q[1] for q in pts), max(q[0] for q in pts), max(q[1] for q in pts)]


def render(sc, fov):
    """Centred on the steerpoint (the junction, origin)."""
    p = projector(camera(sc), (0.0, 0.0), fov)
    im = Image.new('RGB', (N, N), (60, 60, 60))
    d = ImageDraw.Draw(im)
    font = ImageFont.load_default()
    for k in range(-20, 21):
        g = 100 * k
        for a, b in (((g, -1500), (g, 1500)), ((-1500, g), (1500, g))):
            d.line([p(*a), p(*b)], fill=(68, 68, 68), width=1)
    for (x0, y0), (x1, y1) in sc['roads']:
        L = math.hypot(x1 - x0, y1 - y0); nx, ny = -(y1 - y0) / L * ROAD_W / 2, (x1 - x0) / L * ROAD_W / 2
        d.polygon([p(x0 + nx, y0 + ny), p(x1 + nx, y1 + ny), p(x1 - nx, y1 - ny), p(x0 - nx, y0 - ny)], fill=(85, 85, 85))
    boxes = []
    for i, (n, at, hd) in enumerate(sc['units'], 1):
        b = box2d(p, n, at, hd)
        boxes.append({'n': i, 'unit': n, 'size_m': UNITS[n], 'heading': hd, 'box_px': [round(v, 1) for v in b]})
        d.rectangle(b, fill=(240, 240, 240) if n in WARM else (120, 120, 120), outline=(255, 255, 255))
        d.text((b[0], b[1] - 11), str(i), fill=(255, 220, 90), font=font)
    return im, boxes, p


def main():
    out = sys.argv[1]
    meta = {}
    for name, sc in SCENES.items():
        aim = next(at for n, at, _ in sc['units'] if n == sc['aim'])
        h = UNITS[sc['aim']][2]
        for sensor in FOV:
            im, boxes, p = render(sc, FOV[sensor])
            key = f'{sensor}-{name}'
            im.save(f'{out}/{key}.webp', quality=60, method=6)
            im.save(f'{out}/{key}.png')
            # The steerpoint is the image centre; the aim point (the chimney's middle, the tank) in image px.
            ax, ay = p(aim[0], aim[1], h / 2)
            meta[key] = {'fov_deg': FOV[sensor], 'span_deg': FOV[sensor] * K, 'spi': [N / 2, N / 2], 'aim': [round(ax, 1), round(ay, 1)], 'boxes': boxes}
        cam = camera(sc)
        meta[name] = {'alt_ft': sc['alt_ft'], 'slant_nm': sc['slant_nm'], 'depression_deg': round(math.degrees(math.atan2(cam[2], -cam[1])), 1)}
    json.dump(meta, open(f'{out}/maverick-d-video.json', 'w'), indent=1)
    for k, v in meta.items():
        print(k, {a: b for a, b in v.items() if a != 'boxes'}, [(b['unit'], [round(x) for x in b['box_px']]) for b in v.get('boxes', [])])


main()
