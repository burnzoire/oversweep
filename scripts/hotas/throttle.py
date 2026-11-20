"""Generate src/data/cockpit/f16c/throttle-grip-art.ts: F-16C throttle grip line art, traced from the
flight-manual figure "Throttle Grip" (Wikimedia Commons, F-16_Throttle.jpg, 497 x 317 px, CC BY-SA 3.0,
falcon4.wikidot.com), seen from inboard with forward to the right. Coordinates are pixels of that image,
drawn at 1 px = 1 mm and moved onto the page.

    python3 -I scripts/hotas/throttle.py > src/data/cockpit/f16c/throttle-grip-art.ts
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from svgxf import xf, ell, path, cover, INK  # noqa: E402

T = dict(dx=-12, dy=-70)


def p(d, pen='medium', fill=None, **kw): return path(xf(d, **T, **kw), pen, fill)


def dashed(d, pen='medium', fill=None, **kw): return p(d, pen, fill, **kw).replace('/>', ' stroke-dasharray="2.4 1.6"/>')


def text(x, y, s, cap=3.4, rot=0, anchor='middle'):
    x, y = x + T['dx'], y + T['dy']
    tr = f' transform="rotate({rot} {x:.2f} {y:.2f})"' if rot else ''
    return (f'<text x="{x:.2f}" y="{y:.2f}" font-size="{cap / 0.72:.2f}" font-weight="700" text-anchor="{anchor}" '
            f'dominant-baseline="central" fill="{INK}" stroke="none"{tr}>{s}</text>')


# ------------------------------------------------------------------ fixed parts
BRACKET = [
    'M55 160C58 152 62 140 66 133Q71 127.5 78 128Q85 129 87 138C88 146 90 153 94 156',
    'M55 160Q53 162.5 49 162.5L31 162.5L31 180L94 180M89 180L89 245M37 245L94 245M94 140.5L94 258'
    'M47 245L47 255Q47 258 50 258L94 258',
    'M31 180Q38 183 36 187Q33 191 26 192Q20 196 19 205Q19 215 24 222L23 236Q24 241 30 241Q35 241 37 245',
    'M31 162.5L22 162.5Q16.5 162.5 16.5 171.2Q16.5 180 22 180L31 180',  # end of the throttle arm
]
HOLE = ell(76, 137, 3.2)
BODY = [
    # inboard face: palm scoop, then up to the communications switch
    'M94 140.5L109 140.5Q112 140.5 114 145C118 154 124 162 132 166C140 170 148 171.5 156 171.5'
    'C166 171.5 176 168 184 162C192 155 197 147 201 138C204 130 207 120 209.5 110',
    'M243 99C245 94 249 92 251 94L256 110',            # boss under MAN RNG, left side
    'M256 110Q269 117 282 110',                         # boss, lower edge
    'M283 99C287 102 292 106 295.5 111',                # top edge forward to ANT ELEV
    'M303 140C302 144 299 147 297 150',                 # forward edge under ANT ELEV
    'M292 162C288 166 283 171 279 176',                 # down to the cursor control
    'M258 206C245 205.5 234 208 227 214C220 221 214 231 207 236C198 242 185 251 170 257'
    'C150 264 130 270 110 271C101 271 96 266 94 258',   # lower edge back to the arm
    'M253 114L250 125',                                 # crease under the boss
]
COMM_HOUSING = [ell(227.5, 105, 15, 7.5), ell(227.5, 104, 12, 6)]
COMM_ARROWS = ('M231.5 124.5L228.7 129.5L234.3 129.5ZM231.5 141L228.7 136L234.3 136Z'
               'M223 132.5L228 129.7L228 135.3ZM240.5 132.5L235.5 129.7L235.5 135.3Z')
DF_HOUSING = ['M290 133C285 134 282 140 282 148C282 155 285 160 291 161.5L297 162',
              'M291 136C287 138 285 143 285 149C285 154 287 158 292 159']
CURSOR_HOUSING = ['M262 178.5C259.5 179 257.6 185 257.6 193C257.6 201 259.5 207 262 207.5',
                  'M262 178.5L272.5 176.5M262 207.5L273 210']
BLACKOUT = ('M139 212Q140 206 147 206Q153 206 155 210L166 234L167 238L166 241L172 266L159 271L149 253'
            'L141 237L141 233L142 230Z')  # hidden on the outboard side (dashed in the figure)

LEGENDS = [
    (231.5, 118, 'VHF', 3.6, 0, 'middle'), (231.5, 146.5, 'UHF', 3.6, 0, 'middle'),
    (220.5, 132.5, 'OUT', 3.6, 0, 'end'), (245, 132.5, 'IN', 3.6, 0, 'start'),
    (269, 122, 'MAN RNG', 3.0, 14, 'middle'), (266.5, 128.5, 'UNCAGE', 3.0, 14, 'middle'),
    (269.5, 144, 'DOG', 3.0, -78, 'middle'), (279, 145.5, 'FIGHT', 3.0, -78, 'middle'),
    (293.5, 123, 'ANT ELEV', 2.6, 64, 'middle'),
    (255, 176, 'CURSOR', 3.0, -74, 'middle'), (263.5, 181.5, 'ENABLE', 3.0, -74, 'middle'),
]


def static():
    s = ''.join(p(d, 'medium') for d in BRACKET) + p(HOLE, 'fine')
    s += ''.join(p(d, 'heavy') for d in BODY)
    s += dashed(BLACKOUT, 'medium')
    s += ''.join(p(d, 'medium') for d in COMM_HOUSING) + p(COMM_ARROWS, 'fine', INK)
    s += ''.join(p(d, 'medium') for d in DF_HOUSING) + ''.join(p(d, 'medium') for d in CURSOR_HOUSING)
    return s + ''.join(text(*l) for l in LEGENDS)


# ------------------------------------------------------------------ moving parts
COMM_CAP = 'M220 93L230 86.5L240.5 92L240.5 102.5L230.5 108.5L220 103Z'
COMM_EDGES = 'M220 93L230.3 98.2L240.5 92M230.3 98.2L230.5 108.5'
COMM_AREA = 'M219 92.4L230 85.6L241.4 91.5L241.4 103.1L230.5 109.6L219 103.6Z'


def comm(sx=0, sy=0):
    return p(COMM_CAP, 'medium', '#ffffff', sx=sx, sy=sy) + p(COMM_EDGES, 'fine', sx=sx, sy=sy)


MR_C, MR_ROT = (270.5, 90.5), 22


def man_rng(phase=0.0, sy=0.0):
    """Knurled MAN RNG/UNCAGE knob; `phase` (0..1) slides the knurl round as it turns, `sy` presses it in."""
    side = 'M258.3 92L255.3 103.5C258 109 266 111.5 273 111C277 110.5 280 109 281 107L282.5 95Z'
    s = p(side, 'medium', '#ffffff', sy=sy)
    k = ''
    for i in range(11):
        t = (i + phase) / 11
        if t > 1: continue
        x0, y0 = 258.6 + 23.4 * t, 93.4 + 4.2 * t - 3.0 * (1 - abs(2 * t - 1)) * 0  # along the top face's lower edge
        y0 = 92.2 + 6.4 * t if t < 0.6 else 96 + 1.5 * (t - 0.6)
        x1, y1 = 255.8 + 25 * t, 104 + 7 * (t if t < 0.55 else 1.1 - t)
        k += f'M{x0:.2f} {y0:.2f}L{x1:.2f} {y1:.2f}'
    s += p(k, 'fine', sy=sy)
    return s + p(ell(*MR_C, 12.6, 7), 'medium', '#ffffff', rot=MR_ROT, about=MR_C, sy=sy)


MR_AREA = 'M256 84L270 79L286 86L284 111L256 112Z'


def ant_elev(phase=0.0):
    """ANT ELEV thumbwheel edge-on, knurl sliding along the wheel by `phase`."""
    s = p('M295 111C300 116 304.5 122 305 128C305.5 133 304.5 137 303 140L296 139C297.5 137 298.3 134 298 130'
          'C297.5 124 294 118 290 113Z', 'medium', '#ffffff')
    k = ''
    for i in range(10):
        t = (i + phase) / 10
        if t > 1: continue
        # points on the inner and outer arcs at the same height
        y = 113 + 26 * t
        xi = 290 + 8 * min(1, (y - 113) / 17) - max(0, (y - 130) / 9) * 2
        xo = 295.5 + 9.5 * min(1, (y - 111) / 17) - max(0, (y - 128) / 12) * 2
        k += f'M{xi:.2f} {y:.2f}L{xo:.2f} {y - 1.2:.2f}'
    return s + p(k, 'fine')


def dogfight(sy=0.0):
    cap = 'M293 141L299.5 139.5L300 159L293.5 158Z'
    hatch = ''.join(f'M293.2 {143 + 3 * i}L299.7 {140.5 + 3 * i}' for i in range(6))
    return p(cap, 'medium', '#ffffff', sy=sy) + p(hatch, 'fine', sy=sy)


DF_AREA = 'M292 134L301 134L301.5 165L292 165Z'


def cursor(sx=0.0, sy=0.0, pressed=False):
    rx = 6.2 if pressed else 7.5
    return p(ell(274 - (1.5 if pressed else 0), 193.3, rx, 16.8), 'medium', '#ffffff', sx=sx, sy=sy) + \
        p(ell(274 - (1.5 if pressed else 0), 193.3, rx * 0.55, 10), 'fine', sx=sx, sy=sy)


CURSOR_AREA = ell(274, 193.3, 9.5, 18.6)
SPD = 'M287 166.5L292.5 162.5L297.5 169L292 173Z'


def spd_brk(pos):
    sx = {'aft': -2.2, 'off': 0, 'fwd': 2.2}[pos]
    return dashed(SPD, 'medium', sx=sx, sy=-sx * 0.8)


# Positions of the analog controls (% of travel).
MAN_RNG = list(range(0, 101, 10))
ANT_ELEV = list(range(100, -101, -20))


def box(x0, y0, x1, y1):
    return [round(x0 + T['dx'], 2), round(y0 + T['dy'], 2), round(x1 - x0, 2), round(y1 - y0, 2)]


def main():
    out = {
        'static': static(),
        'commUd': {'fwd': comm(sy=-1.6), 'center': comm(), 'aft': comm(sy=1.6)},
        'commLr': {'left': cover(xf(COMM_AREA, **T)) + comm(sx=-1.6), 'center': '', 'right': cover(xf(COMM_AREA, **T)) + comm(sx=1.6)},
        'manRng': {f'p{v}': man_rng(phase=v / 100) for v in MAN_RNG},
        'uncage': {'out': '', 'in': cover(xf(MR_AREA, **T)) + man_rng(sy=1.6)},
        'antElev': {(f'u{v}' if v > 0 else f'd{-v}' if v < 0 else 'center'): ant_elev(phase=(v + 100) / 200) for v in ANT_ELEV},
        'dogfight': {'dogfight': dogfight(-2.6), 'center': dogfight(), 'msl-ovrd': dogfight(2.6)},
        'cursorUd': {'up': cursor(sy=-1.6), 'center': cursor(), 'down': cursor(sy=1.6)},
        'cursorLr': {'aft': cover(xf(CURSOR_AREA, **T)) + cursor(sx=-1.6), 'center': '', 'fwd': cover(xf(CURSOR_AREA, **T)) + cursor(sx=1.6)},
        'enable': {'out': '', 'in': cover(xf(CURSOR_AREA, **T)) + cursor(pressed=True)},
        'spdBrk': {pos: spd_brk(pos) for pos in ('aft', 'off', 'fwd')},
    }
    hits = {
        'commUd': box(224, 86, 234, 111), 'commLr': box(216, 93.5, 242, 103.5),
        'manRng': box(254, 81, 285, 99), 'uncage': box(256, 99, 283, 113),
        'antElev': box(289, 109, 307, 142),
        'dogfight': box(291, 136, 302, 162),
        'cursorUd': box(268, 175, 281, 211), 'cursorLr': box(263, 187, 285, 199.6), 'enable': box(270, 190, 278, 196.6),
        'spdBrk': box(283, 160, 301, 175),
    }
    print('// Generated by scripts/hotas/throttle.py from the manual figure; do not edit by hand.')
    print(f'export const ART = {json.dumps(out, indent=1)} as const;')
    print(f'export const HITS = {json.dumps(hits)} as const;')
    print(f'export const MAN_RNG = {json.dumps(MAN_RNG)};')
    print(f'export const ANT_ELEV = {json.dumps(ANT_ELEV)};')


if __name__ == '__main__':
    main()
