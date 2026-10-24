import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BLEED, GFT, KTFT, SIGMA_15K, availableG, bleed, flatScissors, fly, highYoYo, levelCircle, liftAxis, lowYoYo,
  relative, rollingScissors, splitS, summary,
} from '../../src/lessons/bfm/maneuvers.mjs';
import { VIEWS, gridStep, render } from '../../src/lessons/bfm/ribbon.mjs';

const near = (actual, expected, tolerance, label) =>
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} not within ${tolerance} of ${expected}`);

test('available G: lift-limited below corner, load-limited above', () => {
  // 7.33 × (205/410)² = 1.8325; capped at 7.33 above 410 KIAS.
  near(availableG(205), 1.8325, 1e-9, 'half corner');
  near(availableG(410), 7.33, 1e-9, 'corner');
  near(availableG(500), 7.33, 1e-9, 'above corner');
});

test('bleed is calibrated to the source corner figure', () => {
  // P-1289 p. 4-4: 8 kt/s in a max-performance pull at 410 KIAS (7.33 G).
  near(bleed(410, 7.33), 8, 1e-9, 'corner bleed');
  near(BLEED, 8 / (7.33 ** 2 - 1), 1e-12, 'coefficient');
  near(bleed(300, 1), 0, 1e-12, '1 G holds speed');
});

test('fly: 1 G straight and level holds height and speed', () => {
  const v = 300 * KTFT;
  const track = fly({ p: [0, 0, 0], v: [0, v, 0], maxTime: 10, control: () => [0, 0, GFT] });
  near(track.at(-1).p[2], 0, 1e-6, 'height');
  near(track.at(-1).p[1], v * track.at(-1).t, 1e-3, 'distance');
  near(Math.hypot(...track.at(-1).v), v, 1e-6, 'speed');
});

test('fly: a 4 G level turn has the textbook radius', () => {
  // Without bleed, a level turn at 350 kt (590.73 ft/s) and 4 G has horizontal
  // acceleration g√15 = 124.61 ft/s², so r = 590.73² / 124.61 = 2,800 ft.
  const v = 350 * KTFT;
  const track = fly({
    p: [0, 0, 0], v: [0, v, 0], maxTime: 20, drag: false,
    control: (s) => {
      const h = Math.hypot(s.v[0], s.v[1]);
      const right = [s.v[1] / h, -s.v[0] / h, 0];
      return [right[0] * GFT * Math.sqrt(15), right[1] * GFT * Math.sqrt(15), GFT];
    },
  });
  const xs = track.map((s) => s.p[0]);
  near((Math.max(...xs) - Math.min(...xs)) / 2, 2800.4, 3, 'radius');
  near(Math.max(...track.map((s) => Math.abs(s.p[2]))), 0, 1, 'height held');
});

test('split-S: matches the source altitude and reverses heading', () => {
  // P-1289 p. 4-7: about 6,000–6,500 ft for a T-45 pure nose-low maneuver.
  for (const speed of [150, 250, 300]) {
    const s = summary(splitS({ speed })[0].track, SIGMA_15K);
    assert(s.altitudeLoss > 6000 && s.altitudeLoss < 6500, `${speed} KIAS: ${s.altitudeLoss} ft`);
    near(s.headingChange, 180, 3, `${speed} KIAS heading change`);
    assert(s.exitSpeed > s.entrySpeed, 'comes out faster');
  }
  // The lift axis points down while inverted after the roll.
  const t = splitS()[0].track;
  const inverted = t.find((s) => s.t > 3.6);
  assert(liftAxis(inverted)[2] < -0.9, 'canopy down after the roll');
});

test('high yo-yo: kills closure and stays out of the in-close region', () => {
  const [bandit, own] = highYoYo();
  const r = relative(own.track, bandit.track);
  const s = summary(own.track);
  assert(s.altitudeGain > 1000 && s.altitudeGain < 2000, `climb ${s.altitudeGain}`);
  assert(s.minSpeed < s.entrySpeed - 50, 'trades airspeed for altitude');
  assert(r.every((x) => x.range > 2000 && x.behind), 'never in close, never ahead');
  const end = r.at(-1);
  assert(end.range >= 2000 && end.range <= 4000 && end.aot < 45, 'ends in the control zone band');
  const none = relative(...highYoYo({ yoyo: false }).reverse().map((a) => a.track)).at(-1);
  assert(none.range < 2000, `without it: ${none.range} ft`);
});

test('low yo-yo: nose low inside the turn, then back up', () => {
  const [bandit, own] = lowYoYo();
  const s = summary(own.track);
  assert(s.altitudeLoss > 1000, `dive ${s.altitudeLoss}`);
  assert(s.maxSpeed > s.entrySpeed, 'speeds up going down');
  const r = relative(own.track, bandit.track);
  assert(Math.abs(r.at(-1).dz) < 500, 'back near the bandit altitude');
  assert(r.every((x) => x.behind), 'stays behind');
});

test('scissors: paths cross and drift downrange', () => {
  const [b, o] = rollingScissors();
  // Opposite sides of the downrange axis, the same height: mirror images.
  const i = Math.round(5 / 0.05);
  near(o.track[i].p[0], -b.track[i].p[0], 1e-9, 'mirror x');
  near(o.track[i].p[2], b.track[i].p[2], 1e-9, 'same height');
  assert(Math.max(...o.track.map((s) => s.p[2])) > 1900, 'over the top');
  const [fb, fo] = flatScissors();
  const xs = fo.track.map((s) => s.p[0]);
  assert(xs.some((x) => x > 1000) && xs.some((x) => x < -1000), 'weaves both ways');
  assert(fo.track.at(-1).p[1] > fo.track[0].p[1], 'drifts downrange');
  assert(fb.track.length === fo.track.length);
});

test('level circle: radius and load factor', () => {
  // 350 kt on a 3,000 ft circle: a = 590.73²/3000 = 116.32 ft/s² = 3.615 g;
  // n = √(3.615² + 1) = 3.751.
  const c = levelCircle({ speed: 350, r: 3000, maxTime: 5 });
  for (const s of c) near(Math.hypot(s.p[0], s.p[1]), 3000, 1e-6, 'radius');
  near(c[0].g, 3.751, 0.001, 'load factor');
});

test('ribbon: top view of a level turn shows the canopy side throughout', () => {
  const c = levelCircle({ speed: 350, r: 3000, maxTime: 10 });
  const fig = render([{ id: 'own', label: 'YOU', track: c }], VIEWS.top(), [0, 0, 320, 230]);
  assert(fig.shapes.length > 30);
  assert(fig.shapes.every((s) => s.face === 'top'));
  // Everything fits in the box.
  for (const s of fig.shapes) for (const [x, y] of s.pts) assert(x >= 0 && x <= 320 && y >= 0 && y <= 230, `${x},${y}`);
  assert(fig.feetPerUnit > 0);
});

test('ribbon: the split-S shows its underside from above while inverted', () => {
  const fig = render(splitS(), VIEWS.top(), [0, 0, 320, 230]);
  assert(fig.shapes.some((s) => s.face === 'under') && fig.shapes.some((s) => s.face === 'top'));
  // Painter's order: farthest first.
  for (let i = 1; i < fig.shapes.length; i++) assert(fig.shapes[i - 1].depth >= fig.shapes[i].depth);
  // The perspective view has a ground grid and no scale bar.
  const persp = render(splitS(), VIEWS.perspective(-60, 20), [0, 0, 640, 330]);
  assert(persp.grid > 0 && persp.feetPerUnit === null);
});

test('ribbon: grid step stays readable', () => {
  assert.equal(gridStep(3000), 500);
  assert.equal(gridStep(9000), 2000);
  assert.equal(gridStep(30000), 5000);
});
