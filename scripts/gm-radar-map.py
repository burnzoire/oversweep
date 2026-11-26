#!/usr/bin/env python3
"""Radar ground map picture for the FCR mark procedure: python3 -I scripts/gm-radar-map.py <out.webp> [--placeholder]

A plan-position radar picture of Abu al-Duhur air base as the F-16C's FCR (GM mode) would show it from the markpoint
scenario's jet: level 4 NM short of the southern runway's midpoint, heading 267, on the 10 NM range scale. It is an
illustration drawn from the air base's map data (src/data/airfield-plans/abu-al-duhur.json), not a copy of the guide's
figures: smooth pavement (runways, taxiways) is dark, hangars and aprons are bright, the surrounding farmland a speckled
grey, with the contrast and the sector's edges taken from the guide's GM figures (pp. 437, 443). Each pixel is one pixel of
the 660 px MFD figure grid the cockpit formats are traced on (4.8 px a mm), so the image is laid straight under the
format: its top left corner is that grid's (85, 85.5), 489 px square (the glass). The same numbers are in
src/data/cockpit/f16c/mfd-fcr-gm.ts.
"""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

N = 489
ORIGIN = (85.0, 85.5)          # the glass's top left, on the 660 px grid
OWN = (330.75, 548.0)          # the jet: the B-scope's azimuth centre and range zero
PX_NM = 441 / 10               # 10 NM scale
HEADING = math.radians(267)
FWD = (math.sin(HEADING), math.cos(HEADING))
RIGHT = (math.cos(HEADING), -math.sin(HEADING))
plan = json.load(open('src/data/airfield-plans/abu-al-duhur.json'))
LAT0, LON0 = (35.732934 + 35.731725) / 2, (37.087827 + 37.120655) / 2
NM_LON = 60 * math.cos(math.radians(LAT0))
JET = (-4 * FWD[0], -4 * FWD[1])

def to_px(lat, lon):
    e, n = (lon - LON0) * NM_LON, (lat - LAT0) * 60
    dx, dy = e - JET[0], n - JET[1]
    f, r = dx * FWD[0] + dy * FWD[1], dx * RIGHT[0] + dy * RIGHT[1]
    return (OWN[0] + r * PX_NM - ORIGIN[0], OWN[1] - f * PX_NM - ORIGIN[1])

rng = np.random.default_rng(11)
def smooth(a, s):
    # Gaussian blur in the Fourier domain (wraps at the edges, which the texture does not mind).
    fy, fx = np.fft.fftfreq(a.shape[0])[:, None], np.fft.fftfreq(a.shape[1])[None, :]
    return np.real(np.fft.ifft2(np.fft.fft2(a) * np.exp(-2 * (np.pi * s) ** 2 * (fx ** 2 + fy ** 2))))

# Farmland: speckle (radar returns are exponentially distributed), under slow patches of brighter and darker ground.
speckle = rng.exponential(1.0, (N, N))
speckle = smooth(speckle, 0.9)
speckle = (speckle - speckle.mean()) / speckle.std()
patch = smooth(rng.normal(0, 1, (N, N)), 7) + 0.6 * smooth(rng.normal(0, 1, (N, N)), 20)
patch = patch / patch.std()
ridge = smooth(rng.normal(0, 1, (N, N)), 4)
ridge = ridge / ridge.std()
ground = 92 + 14 * patch + 22 * speckle + 6 * ridge

def layer(draw_fn, blur=0.0):
    im = Image.new('L', (N * 3, N * 3), 0)
    draw_fn(ImageDraw.Draw(im), lambda p: ((p[0]) * 3, (p[1]) * 3))
    im = im.resize((N, N), Image.LANCZOS)
    if blur:
        im = im.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(im, dtype=np.float32) / 255

feat = plan['features']
def ring_poly(d, s, rings, fill):
    for r in rings:
        d.polygon([s(to_px(*p)) for p in r], fill=fill)
def line_path(d, s, pts, width, fill):
    q = [s(to_px(*p)) for p in pts]
    d.line(q, fill=fill, width=int(width * 3), joint='curve')

aero = layer(lambda d, s: ring_poly(d, s, plan['aerodrome']['rings'], 255), 1.0)
apron = np.clip(2.0 * layer(lambda d, s: [ring_poly(d, s, f['rings'], 255) for f in feat if f['type'] == 'apron'], 1.4), 0, 1)
hangar = np.clip(2.2 * layer(lambda d, s: [ring_poly(d, s, f['rings'], 255) for f in feat if f['type'] == 'hangar'], 1.6), 0, 1)
taxi = layer(lambda d, s: [line_path(d, s, f['line'], 1.4, 255) for f in feat if f['type'] == 'taxiway'], 0.7)
# Runways are 150 ft wide (a pixel at this scale); drawn 3 px wide, as a radar's resolution blurs them.
run = layer(lambda d, s: [line_path(d, s, f['line'], 4.6, 255) for f in feat if f['type'] == 'runway'], 0.8)

# The base's ground is smoother (mown and levelled) than the fields; pavement is smooth and dark; buildings return strongly.
img = ground * (1 - 0.55 * aero) + (70 + 8 * speckle) * 0.55 * aero
img = img * (1 - 0.7 * taxi) + 28 * 0.7 * taxi
img = img * (1 - 0.5 * apron) + 150 * 0.5 * apron
img = img * (1 - 0.92 * run) + 10 * 0.92 * run
img = img * (1 - hangar) + (235 + 10 * speckle) * hangar

# The scan sector: A6 is +-60 deg about the jet; the guide's figure draws its edge from the bottom of the format
# (x 245 and 419, y 548) out at 30 deg to the horizontal (p. 437), so below that line the glass is black.
yy, xx = np.mgrid[0:N, 0:N]
gx, gy = xx + ORIGIN[0], yy + ORIGIN[1]
t = math.tan(math.radians(30))
inside = (gy <= 548) & (gy <= 548 - (245 - gx) * t) & (gy <= 548 - (gx - 416.5) * t)
img = np.where(inside, img, 0)
# Tone: the range falls off a little with distance, as the return weakens.
rng_nm = np.hypot(gx - OWN[0], gy - OWN[1]) / PX_NM
img = img * (1.0 - 0.012 * rng_nm) * 0.82
if '--placeholder' in sys.argv:
    # To-scale guide for painting the final art (ChatGPT, prompt in docs/art/gm-radar-prompts.md): flat tones, one per kind of ground.
    flat = np.full((N, N), 120.0)
    flat = flat * (1 - aero) + 85 * aero
    flat = flat * (1 - apron) + 170 * apron
    flat = flat * (1 - taxi) + 45 * taxi
    flat = flat * (1 - run) + 8 * run
    flat = flat * (1 - hangar) + 240 * hangar
    img = np.where(inside, flat, 0)
out = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8), 'L')
out.save(sys.argv[1], quality=72, method=6)
print('wrote', sys.argv[1], out.size)
