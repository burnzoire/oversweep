"""Generate src/data/cockpit/f16c/stick-art.ts: F-16C side stick controller line art, traced from the
flight-manual figure "Side Stick Controller (SSC)" (Wikimedia Commons, F-16_Side_Stick_Controller.jpg,
579 x 308 px, CC BY-SA 3.0, falcon4.wikidot.com). Coordinates below are pixels of that image; the left
side view and the rear view are both drawn at 1 px = 1 mm and moved onto the page.

    python3 -I scripts/hotas/stick.py > src/data/cockpit/f16c/stick-art.ts
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from svgxf import xf, ell, path, cover  # noqa: E402

SIDE = dict(dx=-95, dy=-60)   # left side view, forward to the left
REAR = dict(dx=-205, dy=-60)  # from behind, looking forward

# ---------------------------------------------------------------- left side view
BODY = ('M110 118L152.5 85Q156 82.8 160 83.2L166 84.6L183 84.8L183.5 103L181 105.8L206 147'
        'C212 156 220 175 223 190L224.5 236L181.5 236L181.5 178C181 170 176 165 170 161'
        'C167 157 163 151 157 144.5C152 140.5 143 137 133 137C125 137.5 118 139.5 113 138.5'
        'C108 137.5 104.5 133 104.3 127.5C104.3 123 106.5 120.5 110 118Z')
SIDE_FINE = [
    'M108.5 135L174 94.5',  # edge of the head's top face
    # TMS knurl seen edge-on
    'M166 84.6L172.5 95L176.5 103L181 105.8M169.5 85L176 96M173.5 85L179.5 95.5M177.5 85L182.5 93.5M181 85L183.3 89',
    # DMS seen edge-on, with its two nubs
    'M184.6 107.8L188.8 104.6L198.6 119.6L195 122.8M188.8 104.6L190.6 102.6L192.6 104.2L190.3 106.9'
    'M198.6 119.6L201 118.6L201.9 121.2L196.9 124M187.4 109.4L196.6 122',
    # CMS cap and its housing
    'M186 151Q186 146.5 197 146Q208 146.5 208 151L207 158Q197 162 187 158ZM187 154Q197 157 207 154'
    'M191 151.5L203 150.5M197 151L196.5 155',
    'M186.5 160L187 184Q188 192 194 197Q200 192 206 184M194 197L194 236M206 149L207.5 175L208 236'
    'M209.5 151C213 160 214.5 170 215 185L215.5 236',
]
SIDE_BASE = [
    'M170 236.7L193 236.7M193 236.7L243 236.7Q247 236.7 247 240.7Q247 244.7 243 244.7L193 244.7Z'
    'M230 244.7L230 255.5Q229.5 258.3 226.5 258.3L150 258.3',
    'M182 258.5L181 274M224.5 259L217 283.5M179.2 274.2L217.5 283.3L213.3 293.3L178 284ZM179 277.5L216.2 286.8',
    'M158 258.5L172 258.5L172 263L158 263M172 260L177 260L177 268L172 268Z',
]
TRIGGER = ('M153 141C155 145 155.5 152 150 159.5L160 159.5L160.5 163L168 163L170 160.5L168.5 159.5'
           'C164 153.5 160.5 148 157 144.5Z')
TRIGGER_PIVOT, TRIGGER_TURN = (155, 142), {'first': -6, 'out': 0, 'second': -12}

PADDLE = ('M141.5 203Q141.5 199.5 145 199.3L148 199.3Q150.5 199.5 151 202.5L153 212.5L156 225L157.8 249'
          'L149.8 251L148.5 227L145.5 215Z')
PADDLE_GROOVE = 'M144 205L148 222'
PADDLE_PIVOT, PADDLE_TURN = (153, 256), {'out': 0, 'in': 9}
CLAMP = 'M151 237.5L158 237.5L158 249L151 249ZM158 240.5L170 240.5L170 249L158 249Z'
CLAMP_FINE = 'M162 240.5L162 249M166 240.5L166 249M170 236.7L170 249'
PINKY = (189.8, 225)

# ---------------------------------------------------------------- rear view
REAR_BODY = ('M389.5 140L389.5 92Q389.5 87.2 394.5 86.8L442 83.8Q446.6 83.6 446.6 88L446.2 128Q445.6 138 441 147'
             'L441 232Q441 236.8 446 237M389.5 140C391 145 397 149.5 407.5 151L407.5 232Q407.5 236.8 402.5 237')
REAR_FINE = [
    'M392.5 127C393 138 398.5 145.5 410.5 147.5L410.5 234M441.6 108C441 120 438.5 130 437 140L437 234'
    'M415 142.2Q423 144.4 431 142.2M414 185Q423.5 187.6 433 185',
    'M389.4 170L390 176L404 166.5M390 176L407.5 203',  # thumb rest under the CMS
    'M408.8 98.2L415 98.6',  # rib between the weapon release and trim housings
]
REAR_BASE = [
    'M390 237L462.3 237Q466 237 466 240.75Q466 244.5 462.3 244.5L393.7 244.5Q390 244.5 390 240.75Q390 237 393.7 237Z'
    'M394.4 244.5L394.4 257Q394.4 259 396.4 259L446.4 259Q448.4 259 448.4 257L448.4 244.5'
    'M403.4 259L403.4 290Q424.4 293.5 445.4 290L445.4 259',
    'M403.4 278.4Q424.4 281.2 445.4 278.4' + ell(423.6, 268, 2),
]
# Housings (fixed) and the moving part of each switch on the rear face.
WR = (399.7, 96.6)
TRIM = (429.4, 97.8)
TMS = (400.6, 119.4)
DMS = (430, 120.6)
HOUSINGS = [ell(*WR, 9.1, 8.4), ell(*TRIM, 14.4, 11.6), ell(429.4, 97.4, 12.4, 9.8), ell(*TMS, 10, 9.4), ell(*DMS, 9.4, 8.4)]


def rect(x, y, w, h):
    return f'M{x} {y}L{x + w} {y}L{x + w} {y + h}L{x} {y + h}Z'


def trim_cone(): return ''.join(ell(429.6 + 0.2 * i, 96.6 - 0.6 * i, rx, ry) for i, (rx, ry) in enumerate([(10, 7.8), (7.8, 6), (5.6, 4.2), (3.4, 2.5), (1.3, 1)]))
def tms_knurl(): return ell(*TMS, 8, 7.4) + 'M393.5 115L404.5 127.5M397.5 112L408 124.5M395.4 113.4L406.3 126M394 118.8L400.5 112.6M396.2 121.4L403.2 114.6M398.6 124L405.6 117.4M401.3 126.6L407.4 120.6'
def dms_hat(): return ell(*DMS, 6.6, 5.8) + rect(428.4, 113.2, 3.2, 2.4) + rect(428.4, 125.6, 3.2, 2.4) + rect(422, 119.4, 2.4, 2.6) + rect(435.6, 119.4, 2.4, 2.6)
CMS_BLOCK = 'M386.3 166.3L400 155.6L403.8 160L389.4 170ZM392 165.2L402 158'

# Each four-way switch: moving art, the area it can uncover (paper cover), its throw in px.
HATS = {
    'trim': (trim_cone, ell(*TRIM, 12.2, 9.6), 1.6),
    'tms': (tms_knurl, ell(*TMS, 9.8, 9.2), 1.4),
    'dms': (dms_hat, ell(*DMS, 9.2, 8.2), 1.4),
    'cms': (lambda: CMS_BLOCK, 'M384 166L400.5 153L406.5 160L389.8 172.6Z', 1.4),
}


def side(d, pen='medium', fill=None, **kw): return path(xf(d, **SIDE, **kw), pen, fill)
def rear(d, pen='medium', fill=None, **kw): return path(xf(d, **REAR, **kw), pen, fill)


def side_static():
    s = side(BODY, 'heavy', '#ffffff') + ''.join(side(d, 'fine') for d in SIDE_FINE)
    return s + ''.join(side(d, 'medium') for d in SIDE_BASE)


def trigger(pos):
    t = TRIGGER_TURN[pos]
    return side(TRIGGER, 'medium', '#ffffff', rot=t, about=TRIGGER_PIVOT) + side_static()


def paddle(pos):
    t = PADDLE_TURN[pos]
    return (side(PADDLE, 'medium', '#ffffff', rot=t, about=PADDLE_PIVOT) + side(PADDLE_GROOVE, 'fine', rot=t, about=PADDLE_PIVOT)
            + side(CLAMP, 'medium', '#ffffff') + side(CLAMP_FINE, 'fine')
            + side(ell(*PADDLE_PIVOT, 4.5), 'medium', '#ffffff') + side(ell(*PADDLE_PIVOT, 1.2), 'fine'))


def pinky(pos):
    x, y = PINKY
    return side(ell(x, y, 3.3), 'medium', '#ffffff') + (side(ell(x, y, 1.4), 'fine') if pos == 'out' else side(ell(x, y, 2.2), 'fine') + side(ell(x, y, 0.9), 'fine'))


def weapon_release(pos):
    d = 1.0 if pos == 'in' else 0
    return rear(ell(399.7, 96, 7, 6.4), 'fine') + rear(ell(399.7, 95.2 + d * 0.6, 5.2, 4.6 - d * 0.6), 'fine') + rear(ell(399.6, 92.6 + d * 1.4, 3.6, 2.6 - d * 0.4), 'medium', '#ffffff')


def msl_step(pos):
    return rear(ell(448.6, 103, 2.4 if pos == 'out' else 1.3, 4.4), 'medium', '#ffffff')


def hat(name, axis, pos):
    art, area, throw = HATS[name]
    off = {'fwd': -throw, 'aft': throw, 'left': -throw, 'right': throw}.get(pos, 0)
    sx, sy = (off, 0) if axis == 'lr' else (0, off)
    if axis == 'lr' and pos == 'center':
        return ''  # the up/down part draws the centred switch
    pen = 'medium' if name == 'cms' else 'fine'
    a = rear(art(), pen, '#ffffff' if name == 'cms' else None, sx=sx, sy=sy)
    return (cover(xf(area, **REAR)) + a) if off else a


def rear_static():
    s = rear(REAR_BODY, 'heavy') + ''.join(rear(d, 'fine') for d in REAR_FINE) + ''.join(rear(d, 'medium') for d in REAR_BASE)
    return s + ''.join(rear(d, 'medium') for d in HOUSINGS)


def arrow(x0, x1, y, label):
    """Force arrow in page mm from x0 to x1 (head at x1) with a small label above."""
    d = 1 if x1 > x0 else -1
    shaft = f'M{x0} {y}L{x1 - d * 5} {y}'
    head = f'M{x1} {y}L{x1 - d * 6} {y - 3}L{x1 - d * 6} {y + 3}Z'
    t = f'<text x="{(x0 + x1) / 2}" y="{y - 3.5}" font-size="4.2" font-weight="400" text-anchor="middle" fill="#161616" stroke="none">{label}</text>'
    return path(shaft, 'heavy') + path(head, 'fine', '#161616') + t


def box(x0, y0, x1, y1, t):
    """Click area in page mm from a px box in view t."""
    return [round(x0 + t['dx'], 2), round(y0 + t['dy'], 2), round(x1 - x0, 2), round(y1 - y0, 2)]


def main():
    out = {
        'rearStatic': rear_static(),
        'trigger': {p: trigger(p) for p in TRIGGER_TURN},
        'paddle': {p: paddle(p) for p in PADDLE_TURN},
        'pinky': {p: pinky(p) for p in ('out', 'in')},
        'weaponRelease': {p: weapon_release(p) for p in ('out', 'in')},
        'mslStep': {p: msl_step(p) for p in ('out', 'in')},
    }
    out['pitch'] = {'fwd': arrow(62, 30, 9, 'Push'), 'neutral': '', 'aft': arrow(72, 104, 9, 'Pull')}
    out['roll'] = {'left': arrow(214, 190, 9, 'Left'), 'neutral': '', 'right': arrow(232, 256, 9, 'Right')}
    for name in HATS:
        out[name + 'Ud'] = {p: hat(name, 'ud', p) for p in ('fwd', 'center', 'aft')}
        out[name + 'Lr'] = {p: hat(name, 'lr', p) for p in ('left', 'center', 'right')}
    hits = {
        'pitch': box(181.5, 160, 224.5, 236, SIDE),
        'roll': box(407.5, 152, 441, 236, REAR),
        'trigger': box(144, 138, 173, 166, SIDE),
        'paddle': box(138, 196, 160, 252, SIDE),
        'pinky': box(185, 220.5, 194.5, 229.5, SIDE),
        'weaponRelease': box(390.6, 88.2, 408.8, 105, REAR),
        'mslStep': box(445.5, 97, 452, 109, REAR),
    }
    for name, (cx, cy, rx, ry) in {'trim': (*TRIM, 14.4, 11.6), 'tms': (*TMS, 10, 9.4), 'dms': (*DMS, 9.4, 8.4), 'cms': (395, 163, 9.5, 8.5)}.items():
        hits[name + 'Ud'] = box(cx - rx * 0.45, cy - ry * 1.15, cx + rx * 0.45, cy + ry * 1.15, REAR)
        hits[name + 'Lr'] = box(cx - rx * 1.15, cy - ry * 0.4, cx + rx * 1.15, cy + ry * 0.4, REAR)
    print('// Generated by scripts/hotas/stick.py from the manual figure; do not edit by hand.')
    print('/* eslint-disable */')
    print(f'export const ART = {json.dumps(out, indent=1)} as const;')
    print(f'export const HITS = {json.dumps(hits)} as const;')


if __name__ == '__main__':
    main()
