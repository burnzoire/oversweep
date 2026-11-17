#!/usr/bin/env python3
"""Measure round pointer dials (gauges) on a guide image. Needs numpy + opencv (pip install opencv-python-headless).

Steps (all files go in <dir>; run with python3 -I):
  blobs <image> <dir> <name> cx cy rin rout thr
      Bright elongated blobs (ticks) in the ring rin..rout px around a rough centre.
      Writes <name>-blobs.json and <name>-blobs.png (each blob numbered) to read off which blob is which value.
  fit <image> <dir> <map.json>
      map.json: {"<name>": {"pairs": "blob:value,...", "breaks": [values where the scale may bend],
                             "classes": {"<value>": "<tick class>", ...} or "classes_every": [[step, "class"], ...]}}
      One affine (stretch ratio and axis) for the whole image and one centre per dial: centres are fitted to
      the INNER tick ends with one radius per tick class (outer ends hide under the bezel lip), and the stretch
      is the one that makes every dial's ticks fall on a smooth scale. Writes rect.png (rectified image) and
      rect.json (affine and dial centres in rect.png pixels).
  polar <dir> <name> <rmax>
      Unwraps one dial of rect.png about its centre: <name>-polar.png (x = angle, 4 px/deg; y = radius, 8 px/px,
      grid every 10 deg / 5 px) and <name>-polar.npy for `ticks` and `needle`.
  ticks <dir> <name> rin rout <angle>...
      For each approximate angle: the tick's centre angle, inner and outer radius and width (half-brightness).
  needle <dir> <name> a0 a1
      Needle width (px) against radius between angles a0..a1.
  glyphs <dir> <name> rmin rmax thr
      Numeral and legend boxes (centre relative to the dial centre, width, height) between rmin..rmax.
"""
import json, math, os, sys
import cv2
import numpy as np


def blobs(image, d, name, cx, cy, rin, rout, thr, S=6):
    g = cv2.cvtColor(cv2.imread(image), cv2.COLOR_BGR2GRAY)
    big = cv2.resize(g, None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
    yy, xx = np.mgrid[0:big.shape[0], 0:big.shape[1]]
    rr = np.hypot(xx / S - cx, yy / S - cy)
    m = ((big > thr) & (rr > rin) & (rr < rout)).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    out = []
    for i in range(1, n):
        if st[i, 4] < S * S: continue
        ys, xs = np.nonzero(lab == i); xs = xs / S; ys = ys / S
        mx, my = xs.mean(), ys.mean()
        w, v = np.linalg.eigh(np.cov(np.vstack([xs - mx, ys - my]))); u = v[:, 1]
        p = (xs - mx) * u[0] + (ys - my) * u[1]
        out.append(dict(x=mx, y=my, len=4 * math.sqrt(w[1]), wid=4 * math.sqrt(max(w[0], 1e-6)),
                        ang=math.degrees(math.atan2(mx - cx, cy - my)) % 360,
                        e1=(mx + u[0] * p.min(), my + u[1] * p.min()), e2=(mx + u[0] * p.max(), my + u[1] * p.max())))
    out.sort(key=lambda o: o['ang'])
    json.dump(out, open(f'{d}/{name}-blobs.json', 'w'))
    vis = cv2.cvtColor(big, cv2.COLOR_GRAY2BGR)
    for k, o in enumerate(out):
        cv2.line(vis, tuple(int(c * S) for c in o['e1']), tuple(int(c * S) for c in o['e2']), (0, 0, 255), 2)
        cv2.putText(vis, str(k), (int(o['x'] * S) + 4, int(o['y'] * S)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 255), 1)
    x0, y0 = max(0, int((cx - rout - 3) * S)), max(0, int((cy - rout - 3) * S))
    cv2.imwrite(f'{d}/{name}-blobs.png', vis[y0:y0 + int((2 * rout + 6) * S), x0:x0 + int((2 * rout + 6) * S)])
    for k, o in enumerate(out): print(k, 'ang %.1f len %.1f wid %.1f' % (o['ang'], o['len'], o['wid']))


def _mat(ratio, phi):
    t = math.radians(phi); R = np.array([[math.cos(t), -math.sin(t)], [math.sin(t), math.cos(t)]])
    return R @ np.diag([ratio, 1]) @ R.T


def fit(image, d, mapfile):
    M = json.load(open(mapfile)); D = {}
    for k, g in M.items():
        if k.startswith('_'): continue
        B = json.load(open(f'{d}/{k}-blobs.json'))
        pr = [tuple(map(float, p.split(':'))) for p in g['pairs'].split(',')]
        P = np.array([[B[int(i)]['x'], B[int(i)]['y']] for i, _ in pr]); v = np.array([x for _, x in pr]); c = P.mean(0)
        I = np.array([min([B[int(i)]['e1'], B[int(i)]['e2']], key=lambda p: math.hypot(p[0] - c[0], p[1] - c[1])) for i, _ in pr])
        cls = g.get('classes', {})
        def cl(x):
            if str(int(x)) in cls: return cls[str(int(x))]
            for step, name in g.get('classes_every', []):
                if x % step == 0: return name
            return 'minor'
        bps = g.get('breaks', [])
        X = np.column_stack([np.ones_like(v), v] + [np.maximum(0, v - b) for b in bps])
        D[k] = dict(P=P, I=I, v=v, X=X, o=np.argsort(v), cl=[cl(x) for x in v])

    def centre(Q, cl):
        idx = [i for i, c in enumerate(cl) if c]; labs = sorted(set(cl[i] for i in idx)); c = Q[idx].mean(0)
        for _ in range(30):
            dd = Q[idx] - c; dist = np.hypot(dd[:, 0], dd[:, 1]); u = dd / dist[:, None]
            R = {l: np.mean([dist[j] for j, i in enumerate(idx) if cl[i] == l]) for l in labs}
            J = np.array([[-u[j, 0], -u[j, 1]] + [(-1 if cl[i] == l else 0) for l in labs] for j, i in enumerate(idx)])
            r = np.array([dist[j] - R[cl[i]] for j, i in enumerate(idx)])
            c = c + np.linalg.lstsq(J, -r, rcond=None)[0][:2]
        dd = Q[idx] - c; dist = np.hypot(dd[:, 0], dd[:, 1])
        R = {l: np.mean([dist[j] for j, i in enumerate(idx) if cl[i] == l]) for l in labs}
        return c, np.array([dist[j] - R[cl[i]] for j, i in enumerate(idx)])

    def per(k, A):
        g = D[k]; c, rres = centre(g['I'] @ A.T, g['cl']); q = g['P'] @ A.T - c
        ang = np.degrees(np.arctan2(q[:, 0], -q[:, 1])); a = ang.copy(); a[g['o']] = np.degrees(np.unwrap(np.radians(ang[g['o']])))
        coef = np.linalg.lstsq(g['X'], a, rcond=None)[0]
        return a - g['X'] @ coef, c, rres

    best = None
    for ratio in np.arange(0.94, 1.061, 0.004):
        for phi in range(0, 180, 6):
            A = _mat(ratio, phi); s = 0
            for k in D:
                res, _, rres = per(k, A); s += (res ** 2).mean() + (rres ** 2).mean()
            if best is None or s < best[0]: best = (s, ratio, phi)
    _, ratio, phi = best; A = _mat(ratio, phi)
    img = cv2.imread(image); h, w = img.shape[:2]; pad = 10
    cor = np.array([[0, 0], [w, 0], [0, h], [w, h]]) @ A.T; off = -cor.min(0) + pad
    W, H = (int(np.ceil(v)) for v in cor.max(0) - cor.min(0) + 2 * pad)
    Maff = np.hstack([A, off[:, None]])
    cv2.imwrite(f'{d}/rect.png', cv2.warpAffine(img, Maff, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=(150, 140, 130)))
    out = dict(M=Maff.tolist(), size=[W, H], centres={})
    print('stretch %.3f along %d deg; rect.png %d x %d; x\' = %.5fx %+.5fy %+.2f, y\' = %.5fx %+.5fy %+.2f' % (ratio, phi, W, H, *Maff[0], *Maff[1]))
    for k in D:
        res, c, rres = per(k, A); out['centres'][k] = (c + off).tolist()
        print('%s centre %.2f %.2f  tick angle rms %.2f deg, inner-end radius rms %.2f px (residual by value: %s)' % (
            k, *(c + off), math.sqrt((res ** 2).mean()), math.sqrt((rres ** 2).mean()),
            ' '.join('%g:%+.1f' % (D[k]['v'][i], res[i]) for i in D[k]['o'])))
    json.dump(out, open(f'{d}/rect.json', 'w'))


def polar(d, name, rmax):
    R = json.load(open(f'{d}/rect.json')); cx, cy = R['centres'][name]
    img = cv2.cvtColor(cv2.imread(f'{d}/rect.png'), cv2.COLOR_BGR2GRAY).astype(np.float32)
    th = np.radians(np.arange(1440) / 4.0); rr = np.arange(int(rmax * 8)) / 8.0
    P = cv2.remap(img, (cx + np.outer(rr, np.sin(th))).astype(np.float32), (cy - np.outer(rr, np.cos(th))).astype(np.float32), cv2.INTER_CUBIC)
    np.save(f'{d}/{name}-polar.npy', P)
    v = cv2.cvtColor(cv2.normalize(P, None, 0, 255, cv2.NORM_MINMAX).astype(np.uint8), cv2.COLOR_GRAY2BGR)
    for a in range(0, 360, 10): cv2.line(v, (a * 4, 0), (a * 4, len(rr)), (0, 0, 255) if a % 30 == 0 else (0, 0, 160), 1)
    for r in range(0, int(rmax), 5):
        cv2.line(v, (0, r * 8), (1440, r * 8), (0, 255, 0) if r % 10 == 0 else (0, 120, 0), 1); cv2.putText(v, str(r), (2, r * 8 - 2), 0, 0.4, (0, 255, 255), 1)
    for a in range(0, 360, 30): cv2.putText(v, str(a), (a * 4 + 2, 12), 0, 0.4, (0, 255, 255), 1)
    cv2.imwrite(f'{d}/{name}-polar.png', v)


def ticks(d, name, rlo, rhi, angles, win=6):
    P = np.load(f'{d}/{name}-polar.npy'); bg = np.median(P); lo, hi = int(rlo * 8), int(rhi * 8)
    for a in angles:
        ai = int(round(a * 4)); prof = P[lo:hi][:, [(ai + j) % 1440 for j in range(-win, win + 1)]].max(0)
        col = ai - win + int(np.argmax(prof))
        cs = list(range(col - 4, col + 5)); wt = np.clip([P[lo:hi, c % 1440].max() - bg for c in cs], 0, None)
        acen = (np.dot(wt, cs) / wt.sum()) / 4
        rad = P[:, [(col + k) % 1440 for k in (-1, 0, 1)]].max(1); m = lo + int(np.argmax(rad[lo:hi])); thr = bg + 0.5 * (rad[m] - bg)
        i0 = i1 = m
        while i0 > 0 and rad[i0 - 1] > thr: i0 -= 1
        while i1 < len(rad) - 1 and rad[i1 + 1] > thr: i1 += 1
        row = P[(i0 + i1) // 2]; t2 = bg + 0.5 * (row[col % 1440] - bg); a0 = a1 = col
        while row[(a0 - 1) % 1440] > t2 and col - a0 < 40: a0 -= 1
        while row[(a1 + 1) % 1440] > t2 and a1 - col < 40: a1 += 1
        print('near %6.2f: angle %6.2f  r %5.1f-%5.1f  width %.2f px' % (a, acen % 360, i0 / 8, i1 / 8, (a1 - a0 + 1) / 4 * math.pi / 180 * (i0 + i1) / 16))


def needle(d, name, a0, a1):
    P = np.load(f'{d}/{name}-polar.npy'); bg = np.median(P); peak = P[:, int(a0 * 4):int(a1 * 4)].max()
    for r8 in range(0, P.shape[0], 4):
        on = np.nonzero(P[r8, int(a0 * 4):int(a1 * 4)] > bg + 0.5 * (peak - bg))[0]
        if len(on): print('r %5.1f  angle %6.2f  width %5.2f px' % (r8 / 8, a0 + (on.min() + on.max()) / 8, (on.max() - on.min() + 1) / 4 * math.pi / 180 * r8 / 8))


def glyphs(d, name, rmin, rmax, thr, gap=2.2, S=8):
    R = json.load(open(f'{d}/rect.json')); cx, cy = R['centres'][name]
    big = cv2.resize(cv2.cvtColor(cv2.imread(f'{d}/rect.png'), cv2.COLOR_BGR2GRAY), None, fx=S, fy=S, interpolation=cv2.INTER_CUBIC)
    n, _, st, cen = cv2.connectedComponentsWithStats((big > thr).astype(np.uint8))
    items = [[x / S, y / S, (x + w) / S, (y + h) / S] for i, (x, y, w, h, a) in enumerate(st) if i and a >= S * S * 0.8
             and rmin < math.hypot(cen[i][0] / S - cx, cen[i][1] / S - cy) < rmax]
    near = lambda b, o: b[0] - gap <= o[2] and o[0] - gap <= b[2] and min(b[3], o[3]) - max(b[1], o[1]) >= 0.4 * min(b[3] - b[1], o[3] - o[1])
    groups = [[b] for b in items]; merged = True
    while merged:
        merged = False
        for i in range(len(groups)):
            for j in range(i + 1, len(groups)):
                if any(near(b, o) for b in groups[i] for o in groups[j]): groups[i] += groups.pop(j); merged = True; break
            if merged: break
    for G in groups:
        x0, y0 = min(b[0] for b in G), min(b[1] for b in G); x1, y1 = max(b[2] for b in G), max(b[3] for b in G)
        print('centre %6.2f %6.2f  w %5.2f h %5.2f' % ((x0 + x1) / 2 - cx, (y0 + y1) / 2 - cy, x1 - x0, y1 - y0))


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a: sys.exit(__doc__)
    f = lambda xs: [float(x) for x in xs]
    if a[0] == 'blobs': blobs(a[1], a[2], a[3], *f(a[4:9]))
    elif a[0] == 'fit': fit(a[1], a[2], a[3])
    elif a[0] == 'polar': polar(a[1], a[2], float(a[3]))
    elif a[0] == 'ticks': ticks(a[1], a[2], float(a[3]), float(a[4]), f(a[5:]))
    elif a[0] == 'needle': needle(a[1], a[2], *f(a[3:5]))
    elif a[0] == 'glyphs': glyphs(a[1], a[2], *f(a[3:6]))
    else: sys.exit(__doc__)
