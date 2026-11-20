"""Tiny SVG geometry helpers for the HOTAS generators: transform absolute path data and shapes.

Paths use absolute M L H V C Q Z only (H/V become L after a rotation). Coordinates are reference
pixels of the trace image; `xf` maps them to page mm with an optional rotation about a pivot first.
"""
import math
import re

TOK = re.compile(r'[MLHVCQZ]|-?\d*\.?\d+(?:e-?\d+)?')


def xf(d, dx=0.0, dy=0.0, k=1.0, rot=0.0, about=(0.0, 0.0), sx=0.0, sy=0.0):
    """Shift by (sx, sy) and rotate `rot` degrees clockwise about `about` (both in reference px), then map to page: p*k + (dx, dy)."""
    a = math.radians(rot)
    ca, sa = math.cos(a), math.sin(a)

    def P(x, y):
        x, y = x + sx, y + sy
        if rot:
            ux, uy = x - about[0], y - about[1]
            x, y = about[0] + ux * ca - uy * sa, about[1] + ux * sa + uy * ca
        return f'{x * k + dx:.2f} {y * k + dy:.2f}'

    out, cmd, cur, i = [], None, (0.0, 0.0), 0
    t = TOK.findall(d)
    while i < len(t):
        if t[i] in 'MLHVCQZ':
            cmd = t[i]
            i += 1
            if cmd == 'Z':
                out.append('Z')
                continue
        n = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'Q': 4}[cmd]
        v = [float(x) for x in t[i:i + n]]
        i += n
        if cmd == 'H':
            cur = (v[0], cur[1])
            out.append('L' + P(*cur))
        elif cmd == 'V':
            cur = (cur[0], v[0])
            out.append('L' + P(*cur))
        else:
            pts = [(v[j], v[j + 1]) for j in range(0, n, 2)]
            cur = pts[-1]
            out.append(cmd + ' '.join(P(*p) for p in pts))
            if cmd == 'M':
                cmd = 'L'
    return ''.join(out)


def ell(cx, cy, rx, ry=None):
    """Ellipse as path data (two arcs approximated by four cubics) so it transforms like any path."""
    ry = rx if ry is None else ry
    c = 0.5523
    return (f'M{cx - rx} {cy}C{cx - rx} {cy - ry * c} {cx - rx * c} {cy - ry} {cx} {cy - ry}'
            f'C{cx + rx * c} {cy - ry} {cx + rx} {cy - ry * c} {cx + rx} {cy}'
            f'C{cx + rx} {cy + ry * c} {cx + rx * c} {cy + ry} {cx} {cy + ry}'
            f'C{cx - rx * c} {cy + ry} {cx - rx} {cy + ry * c} {cx - rx} {cy}Z')


INK = '#161616'
PAPER = '#ffffff'
PEN = {'heavy': 0.6, 'medium': 0.4, 'fine': 0.25}


def path(d, pen='medium', fill=None):
    f = fill or 'none'
    return f'<path d="{d}" fill="{f}" fill-rule="evenodd" stroke="{INK}" stroke-width="{PEN[pen]}" stroke-linecap="round" stroke-linejoin="round"/>'


def cover(d):
    """Paper fill with no outline (hides what a moved part used to cover)."""
    return f'<path d="{d}" fill="{PAPER}" stroke="none"/>'
