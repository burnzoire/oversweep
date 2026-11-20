"""Vectorise the clean HOTAS line drawing (side stick and throttle grip) into cockpit art.

  python3 -I scripts/hotas/clean.py <clean-ref.png> stick|throttle > src/data/cockpit/f16c/<part>-art.ts

The reference is a clean, label-free redraw of the flight-manual figures. Ink is traced with potrace into
filled outlines; every moving part is cut out of the drawing by a region polygon (reference px), traced on
its own with a paper silhouette under it, and moved per position by an SVG transform. Page units are mm:
page = (ref - origin) * K.
"""
import json
import math
import sys

import cv2
import numpy as np
import potrace
from scipy import ndimage

K = 0.375  # mm per reference px
UP = 3  # upscale before tracing, for smoother curves
INK, PAPER, RED = '#161616', 'var(--panel-paper,#fff)', 'var(--panel-red,#b3262a)'
THRESH = 96  # darker than this is ink; thins the drawing's 2.8 px strokes to about 2 px (0.75 mm)

IM = None


def load(p):
    global IM
    IM = cv2.imread(p, 0)


def poly_mask(shape, poly):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.array(poly, np.int32)], 1)
    return m.astype(bool)


def circle(cx, cy, r, n=48):
    return [(cx + r * math.cos(2 * math.pi * i / n), cy + r * math.sin(2 * math.pi * i / n)) for i in range(n)]


def ellipse(cx, cy, rx, ry, n=48):
    return [(cx + rx * math.cos(2 * math.pi * i / n), cy + ry * math.sin(2 * math.pi * i / n)) for i in range(n)]


class View:
    """A rectangle of the reference placed on the page at `at` (mm)."""

    def __init__(self, x0, y0, x1, y1, at):
        self.box, self.at = (x0, y0, x1, y1), at
        big = cv2.resize(IM[y0:y1, x0:x1], None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
        self.ink = big < THRESH

    def P(self, x, y):
        """Upscaled crop px -> page mm."""
        return (x / UP * K + self.at[0], y / UP * K + self.at[1])

    def p(self, x, y):
        """Reference px -> page mm."""
        return ((x - self.box[0]) * K + self.at[0], (y - self.box[1]) * K + self.at[1])

    def region(self, poly):
        x0, y0 = self.box[:2]
        return poly_mask(self.ink.shape, [((x - x0) * UP, (y - y0) * UP) for x, y in poly])

    def trace(self, mask):
        if not mask.any():
            return ''
        pl = potrace.Bitmap(~mask).trace(turdsize=8, alphamax=1.0, opticurve=True, opttolerance=0.2)
        f = lambda pt: '%.1f %.1f' % self.P(pt.x, pt.y)
        out = []
        for c in pl:
            out.append('M' + f(c.start_point))
            for s in c.segments:
                out.append(('L' + f(s.c) + 'L' + f(s.end_point)) if s.is_corner else ('C' + f(s.c1) + ' ' + f(s.c2) + ' ' + f(s.end_point)))
            out.append('Z')
        return ''.join(out)


def ink(d):
    return f'<path d="{d}" fill="{INK}" fill-rule="evenodd" stroke="none"/>' if d else ''


def paper(d, fill=PAPER):
    return f'<path d="{d}" fill="{fill}" stroke="none"/>' if d else ''


class Part:
    """A moving part: its ink and a paper silhouette, cut out of the view by a region polygon."""

    def __init__(self, view, poly, extra_paper=None, fill=PAPER, close=2):
        self.v, self.poly, self.fill = view, poly, fill
        r = view.region(poly)
        self.mask = view.ink & r
        sil = ndimage.binary_fill_holes(ndimage.binary_closing(self.mask, iterations=close))
        self.d, self.sil = view.trace(self.mask), view.trace(sil)
        self.cover = extra_paper or self.sil  # paper over the part's rest place when it moves

    def art(self, dx=0.0, dy=0.0, rot=0.0, about=None, scale=None):
        """Ink over paper, moved by (dx, dy) reference px and/or turned `rot` degrees about `about` (ref px)."""
        tf = []
        if dx or dy:
            tf.append(f'translate({dx * K:.2f} {dy * K:.2f})')
        if rot:
            ax, ay = self.v.p(*about)
            tf.append(f'rotate({rot} {ax:.2f} {ay:.2f})')
        if scale:
            cx, cy = self.v.p(*scale[1])
            tf.append(f'translate({cx:.2f} {cy:.2f}) scale({scale[0]}) translate({-cx:.2f} {-cy:.2f})')
        body = paper(self.sil, self.fill) + ink(self.d)
        g = f'<g transform="{" ".join(tf)}">{body}</g>' if tf else body
        return (paper(self.cover) if (tf and self.cover) else '') + g

    def hit(self, also=()):
        xs, ys = zip(*self.poly, *also)
        (x0, y0), (x1, y1) = self.v.p(min(xs), min(ys)), self.v.p(max(xs), max(ys))
        return [round(x0, 2), round(y0, 2), round(x1 - x0, 2), round(y1 - y0, 2)]


def static(view, parts):
    keep = view.ink.copy()
    for pt in parts:
        keep &= ~view.region(pt.poly)
    return ink(view.trace(keep))


def arrow(x0, x1, y, label):
    d = 1 if x1 > x0 else -1
    return (f'<path d="M{x0} {y}L{x1 - d * 5} {y}" fill="none" stroke="{INK}" stroke-width="0.6" stroke-linecap="round"/>'
            f'<path d="M{x1} {y}L{x1 - d * 6} {y - 3}L{x1 - d * 6} {y + 3}Z" fill="{INK}" stroke="none"/>'
            f'<text x="{(x0 + x1) / 2}" y="{y - 3.5}" font-size="4.2" font-weight="400" text-anchor="middle" fill="{INK}" stroke="none">{label}</text>')


def box(view, x0, y0, x1, y1):
    (a, b), (c, d) = view.p(x0, y0), view.p(x1, y1)
    return [round(a, 2), round(b, 2), round(c - a, 2), round(d - b, 2)]


def hat_hits(view, cx, cy, rx, ry):
    return (box(view, cx - rx * 0.45, cy - ry * 1.15, cx + rx * 0.45, cy + ry * 1.15),
            box(view, cx - rx * 1.15, cy - ry * 0.4, cx + rx * 1.15, cy + ry * 0.4))


def stick():
    side = View(1205, 88, 1600, 662, (0, 12))
    rear = View(1785, 88, 1995, 662, (156, 12))
    # Side view (left side; forward is to the left).
    # The trigger and weapon release are red (DCS guide render, p. 83).
    trig = Part(side, fill=RED, close=14, poly=[(1318, 252), (1345, 257), (1346, 282), (1322, 304), (1294, 304), (1296, 292), (1320, 270)])
    paddle = Part(side, [(1306, 397), (1337, 393), (1352, 470), (1357, 527), (1340, 529), (1327, 531), (1321, 470)])
    pinky = Part(side, circle(1433, 473.5, 13.9))
    # Rear view (looking forward; the pilot's left is on the left).
    wpn = Part(rear, ellipse(1833, 122, 17, 15), fill=RED)
    trim = Part(rear, ellipse(1915, 139, 35, 28))
    tms = Part(rear, circle(1843, 200, 25))
    dms = Part(rear, circle(1910, 200, 25.2))
    cms = Part(rear, [(1788, 318), (1826, 289), (1846, 303), (1836, 314), (1803, 336)])
    msl = Part(rear, [(1959, 128), (1988, 128), (1988, 172), (1959, 172)])
    parts_side, parts_rear = [trig, paddle, pinky], [wpn, trim, tms, dms, cms, msl]

    # The trigger is red all over: the part behind its moving face, out to the grip line, is painted under the outline.
    w = side.region([(1316, 243), (1346, 243), (1394, 301), (1330, 301), (1294, 304), (1296, 292), (1320, 270)])
    behind = ndimage.binary_fill_holes(ndimage.binary_closing(side.ink & w, iterations=2)) & w & ~trig.mask
    out = {'rearStatic': static(rear, parts_rear), 'sideStatic': paper(side.trace(behind), RED) + static(side, parts_side)}
    out['trigger'] = {'first': trig.art(rot=-6, about=(1336, 252)), 'out': trig.art(), 'second': trig.art(rot=-12, about=(1336, 252))}
    out['paddle'] = {'out': paddle.art(), 'in': paddle.art(rot=7, about=(1336, 548))}
    out['pinky'] = {'out': pinky.art(), 'in': pinky.art(scale=(0.86, (1433, 473.5)))}
    out['weaponRelease'] = {'out': wpn.art(), 'in': wpn.art(dy=3.5)}
    out['mslStep'] = {'out': msl.art(), 'in': msl.art(dx=-3.5)}
    for name, pt in (('trim', trim), ('tms', tms), ('dms', dms), ('cms', cms)):
        t = 4
        out[name + 'Ud'] = {'fwd': pt.art(dy=-t), 'center': pt.art(), 'aft': pt.art(dy=t)}
        out[name + 'Lr'] = {'left': pt.art(dx=-t), 'center': '', 'right': pt.art(dx=t)}
    # Stick force arrows over each view's head.
    sx, rx = side.p(1420, 0)[0], rear.p(1905, 0)[0]
    out['pitch'] = {'fwd': arrow(sx - 4, sx - 36, 7, 'Push'), 'neutral': '', 'aft': arrow(sx + 4, sx + 36, 7, 'Pull')}
    out['roll'] = {'left': arrow(rx - 6, rx - 32, 7, 'Left'), 'neutral': '', 'right': arrow(rx + 6, rx + 32, 7, 'Right')}

    hits = {
        'pitch': box(side, 1452, 330, 1505, 500),
        'roll': box(rear, 1862, 262, 1930, 500),
        'trigger': trig.hit(also=[(1394, 301)]), 'paddle': paddle.hit(), 'pinky': pinky.hit(),
        'weaponRelease': wpn.hit(), 'mslStep': msl.hit(),
    }
    for name, (cx, cy, rx_, ry_) in {'trim': (1915, 139, 35, 28), 'tms': (1843, 200, 25, 25), 'dms': (1910, 200, 25, 25), 'cms': (1816, 312, 20, 16)}.items():
        hits[name + 'Ud'], hits[name + 'Lr'] = hat_hits(rear, cx, cy, rx_, ry_)
    caps = {'side': side.p(1400, 0)[0], 'rear': rear.p(1890, 0)[0], 'y': side.p(0, 662)[1] + 6}
    return out, hits, caps


def throttle():
    v = View(112, 95, 892, 652, (2, 2))
    comm = Part(v, [(649, 145), (680, 124), (707, 139), (707, 180), (682, 195), (651, 180)])
    knob = Part(v, [(737, 160), (751, 119), (795, 109), (830, 124), (827, 160), (812, 193), (790, 201), (752, 180)])
    wheel = Part(v, [(853, 191), (871, 199), (886, 236), (888, 286), (877, 293), (866, 283), (864, 240), (849, 206)])
    dog = Part(v, [(829, 262), (885, 268), (871, 341), (832, 328)])
    cur = Part(v, [(807, 372), (838, 376), (838, 432), (829, 462), (809, 468), (786, 456), (804, 385)])
    parts = [comm, knob, wheel, dog, cur]
    out = {'static': static(v, parts)}
    s = 4
    out['commUd'] = {'fwd': comm.art(dy=-s), 'center': comm.art(), 'aft': comm.art(dy=s)}
    out['commLr'] = {'left': comm.art(dx=-s), 'center': '', 'right': comm.art(dx=s)}

    # MAN RNG: an index line on the knob's top face turns with the knob.
    c, rx, ry, tilt = (797, 141), 31, 21, math.radians(20)

    def man_rng(val, dy=0):
        a = math.radians(-135 + 2.7 * val - 90)
        ex, ey = rx * 0.8 * math.cos(a), ry * 0.8 * math.sin(a)
        x1, y1 = c[0] + ex * math.cos(tilt) - ey * math.sin(tilt), c[1] + ex * math.sin(tilt) + ey * math.cos(tilt) + dy
        (px, py), (qx, qy) = v.p(c[0], c[1] + dy), v.p(x1, y1)
        return f'<path d="M{px:.2f} {py:.2f}L{qx:.2f} {qy:.2f}" fill="none" stroke="{INK}" stroke-width="0.5" stroke-linecap="round"/>'

    MAN = list(range(0, 101, 10))
    out['manRng'] = {f'p{x}': man_rng(x) for x in MAN}
    out['uncage'] = {'out': knob.art(), 'in': knob.art(dy=4) + man_rng(0, 4)}

    # ANT ELEV: the knurl slides along the wheel inside its outline as it rolls.
    clip = f'<clipPath id="ant-elev-clip"><path d="{wheel.sil}"/></clipPath>'
    pitch = 8.0

    def ant(val):
        sh = (val / 20.0 * 2.7) % pitch
        g = ''.join(f'<g transform="translate(0 {(sh - k * pitch) * K:.2f})">{ink(wheel.d)}</g>' for k in (0, 1))
        return clip + paper(wheel.sil) + f'<g clip-path="url(#ant-elev-clip)">{g}</g>'

    ANT = list(range(100, -101, -20))
    out['antElev'] = {(f'u{x}' if x > 0 else f'd{-x}' if x < 0 else 'center'): ant(x) for x in ANT}
    out['dogfight'] = {'dogfight': dog.art(dy=-6), 'center': dog.art(), 'msl-ovrd': dog.art(dy=6)}
    out['cursorUd'] = {'up': cur.art(dy=-s), 'center': cur.art(), 'down': cur.art(dy=s)}
    out['cursorLr'] = {'aft': cur.art(dx=-s), 'center': '', 'fwd': cur.art(dx=s)}
    out['enable'] = {'out': '', 'in': cur.art(scale=(0.92, (815, 420)))}
    # SPD BRK is behind the grip in this view (the manual figure says "not shown"): dashed where it points.
    spd = [(843, 343), (858, 338), (864, 356), (849, 361)]

    def spd_brk(dx):
        d = 'M' + 'L'.join('%.2f %.2f' % v.p(x + dx, y) for x, y in spd) + 'Z'
        return f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="0.4" stroke-dasharray="1.2 1"/>'

    out['spdBrk'] = {'aft': spd_brk(-5), 'off': spd_brk(0), 'fwd': spd_brk(5)}
    knob_hit = knob.hit()
    hits = {
        'commUd': box(v, 668, 120, 690, 198), 'commLr': box(v, 645, 148, 712, 172),
        'manRng': [knob_hit[0], knob_hit[1], knob_hit[2], round(knob_hit[3] * 0.5, 2)],
        'uncage': [knob_hit[0], round(knob_hit[1] + knob_hit[3] * 0.5, 2), knob_hit[2], round(knob_hit[3] * 0.5, 2)],
        'antElev': wheel.hit(), 'dogfight': dog.hit(),
        'cursorUd': box(v, 806, 368, 826, 470), 'cursorLr': box(v, 784, 405, 842, 438), 'enable': box(v, 808, 411, 822, 428),
        'spdBrk': box(v, 838, 334, 870, 365),
    }
    return out, hits, {'MAN_RNG': MAN, 'ANT_ELEV': ANT}


def main():
    load(sys.argv[1])
    which = sys.argv[2]
    print(f'// Generated by scripts/hotas/clean.py from the clean HOTAS line drawing; do not edit by hand.')
    print('/* eslint-disable */')
    if which == 'stick':
        out, hits, caps = stick()
        print(f'export const ART = {json.dumps(out)} as const;')
        print(f'export const HITS = {json.dumps(hits)} as const;')
        print(f'export const CAPTIONS = {json.dumps({k: round(x, 2) for k, x in caps.items()})} as const;')
    else:
        out, hits, extra = throttle()
        print(f'export const ART = {json.dumps(out)} as const;')
        print(f'export const HITS = {json.dumps(hits)} as const;')
        for k, x in extra.items():
            print(f'export const {k} = {json.dumps(x)};')


if __name__ == '__main__':
    main()
