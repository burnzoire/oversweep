"""Rectify a panel reference image and draw a measuring grid.

Usage:
  python3 -I scripts/panel-trace.py <ref.jpg> <out-dir> x1,y1 x2,y2 x3,y3 x4,y4 [W H]
The four points (x,y, or x,y=X,Y to fix their targets) are the centres of features that form a rectangle on the real
panel (usually the corner DZUS fasteners), in order TL TR BL BR. They are warped to
the axis-aligned rectangle with the same mean width/height, so measurements on
<out>/rect.png are orthographic. Writes rect.png, grid.png (3x, 10 px grid) and
prints detected circles (fasteners, screws, knobs) as x y r.
Needs opencv-python-headless.
"""
import sys, os
import cv2, numpy as np

ref, out, *pts = sys.argv[1:]
size = [int(v) for v in pts[4:6]] if len(pts) >= 6 else None
xy = lambda t: [float(v) for v in t.split(',')]
src = np.float32([xy(p.split('=')[0]) for p in pts[:4]])
tl, tr, bl, br = src
w = (np.linalg.norm(tr - tl) + np.linalg.norm(br - bl)) / 2
h = (np.linalg.norm(bl - tl) + np.linalg.norm(br - tr)) / 2
x0, y0 = (tl + bl)[0] / 2, (tl + tr)[1] / 2
dst = np.float32([[x0, y0], [x0 + w, y0], [x0, y0 + h], [x0 + w, y0 + h]])
if all('=' in p for p in pts[:4]):  # explicit targets: x,y=X,Y
    dst = np.float32([xy(p.split('=')[1]) for p in pts[:4]])
im = cv2.imread(ref)
W, H = size or (im.shape[1], im.shape[0])
r = cv2.warpPerspective(im, cv2.getPerspectiveTransform(src, dst), (W, H), flags=cv2.INTER_CUBIC)
os.makedirs(out, exist_ok=True)
cv2.imwrite(os.path.join(out, 'rect.png'), r)
s = 3
g = cv2.resize(r, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC)
for x in range(0, W, 10):
    cv2.line(g, (x * s, 0), (x * s, H * s), (60, 60, 255) if x % 50 == 0 else (200, 120, 0), 1)
    if x % 50 == 0: cv2.putText(g, str(x), (x * s + 2, 12), 0, .4, (0, 255, 255), 1)
for y in range(0, H, 10):
    cv2.line(g, (0, y * s), (W * s, y * s), (60, 60, 255) if y % 50 == 0 else (200, 120, 0), 1)
    if y % 50 == 0: cv2.putText(g, str(y), (2, y * s + 12), 0, .4, (0, 255, 255), 1)
cv2.imwrite(os.path.join(out, 'grid.png'), g)
gray = cv2.medianBlur(cv2.cvtColor(r, cv2.COLOR_BGR2GRAY), 3)
c = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1.2, 30, param1=90, param2=22, minRadius=6, maxRadius=40)
for x, y, rad in (np.round(c[0]).astype(int) if c is not None else []):
    print(x, y, rad)
