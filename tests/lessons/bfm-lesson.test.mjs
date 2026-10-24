import assert from 'node:assert/strict';
import test from 'node:test';
import { geometry, levelTurn, maxNoseLow, pursuit, radialG, speedBand } from '../../src/lessons/bfm/lesson-model.mjs';

// Expected values are derived by hand, not by calling the model.
const near = (actual, expected, tolerance, label) =>
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} not within ${tolerance} of ${expected}`);

test('level turn: 2 G is a 60° bank', () => {
  // n = 2 → φ = arccos(0.5) = 60°, a = g√3 = 16.9856 m/s².
  // V = 300 kt = 154.333 m/s → r = 154.333² / 16.9856 = 1402.3 m = 4,600.7 ft;
  // ω = 16.9856 / 154.333 = 0.110058 rad/s = 6.306°/s.
  const t = levelTurn({ speed: 300, g: 2 });
  near(t.bank, 60, 1e-9, 'bank');
  near(t.radius, 4600.7, 0.5, 'radius');
  near(t.rate, 6.306, 0.001, 'rate');
});

test('level turn: T-45 corner and load limit', () => {
  // 410 kt = 210.922 m/s; √(7.33² − 1) = 7.2615; a = 71.210 m/s².
  // r = 44,488 / 71.210 = 624.7 m = 2,049.7 ft; ω = 0.33762 rad/s = 19.34°/s.
  const t = levelTurn({ speed: 410, g: 7.33 });
  near(t.bank, 82.159, 0.001, 'bank');
  near(t.radius, 2049.7, 0.5, 'radius');
  near(t.rate, 19.34, 0.01, 'rate');
  // Rate scales with 1/V and radius with V² at fixed G.
  const half = levelTurn({ speed: 205, g: 7.33 });
  near(half.rate / t.rate, 2, 1e-9, 'rate ratio');
  near(t.radius / half.radius, 4, 1e-9, 'radius ratio');
});

test('level turn rejects impossible inputs', () => {
  assert.equal(levelTurn({ speed: 300, g: 1 }), null);
  assert.equal(levelTurn({ speed: 0, g: 3 }), null);
  assert.equal(levelTurn({ speed: Number.NaN, g: 3 }), null);
});

test('radial G around a loop matches the source example', () => {
  // P-1289 p. 4-5: constant 4 G gives about 3 at the bottom, 5 at the top.
  near(radialG(4, 0), 3, 1e-12, 'bottom');
  near(radialG(4, 180), 5, 1e-12, 'top');
  near(radialG(4, 90), 4, 1e-12, 'vertical');
  near(radialG(4, 60), 3.5, 1e-12, '60°');
});

test('10% rule', () => {
  assert.equal(maxNoseLow(5000), 50);
  assert.equal(maxNoseLow(1000), 10);
  assert.equal(maxNoseLow(0), 0);
  assert.equal(maxNoseLow(9500), 90);
  assert.equal(maxNoseLow(-1), null);
});

test('T-45 airspeed bands and pull type', () => {
  assert.deepEqual(speedBand(410), { bands: ['corner'], pull: 'corner', belowVertical: false });
  assert.deepEqual(speedBand(300), { bands: ['sustained', 'vertical'], pull: 'lift', belowVertical: false });
  assert.deepEqual(speedBand(160), { bands: ['radius'], pull: 'lift', belowVertical: true });
  assert.equal(speedBand(450).pull, 'load');
  assert.equal(speedBand(0), null);
});

test('geometry: dead astern in the control zone range', () => {
  // Bandit 2,500 ft straight ahead, same heading: AON 0, aspect 180, AOT 0.
  // Its turn circles are centred 3,000 ft abeam it: (±3000, 2500), √(3000² + 2500²) = 3,905 ft away.
  const g = geometry({ x: 0, y: 0, heading: 0 }, { x: 0, y: 2500, heading: 0 });
  near(g.range, 2500, 1e-9, 'range');
  near(g.aon, 0, 1e-9, 'aon'); near(g.aspect, 180, 1e-9, 'aspect'); near(g.aot, 0, 1e-9, 'aot');
  assert.equal(g.behindLine, true);
  assert.equal(g.inControlRange, true);
  assert.equal(g.inBubble, false);
});

test('geometry: beam aspect inside the bubble', () => {
  // Bandit 1,000 ft ahead heading east: you are on its 3/9 line (aspect 90, not behind it).
  // Its right turn circle is centred at (0, −2000): 2,000 ft from you, inside 3,000 ft.
  const g = geometry({ x: 0, y: 0, heading: 0 }, { x: 0, y: 1000, heading: 90 });
  near(g.aspect, 90, 1e-9, 'aspect');
  assert.equal(g.behindLine, false);
  assert.equal(g.inControlRange, false);
  assert.equal(g.inBubble, true);
  // Bandit 3,000 ft at 45° right, head-on: AON 45; bearing back to you is 225°, its nose 225° → aspect 0.
  const h = geometry({ x: 0, y: 0, heading: 0 }, { x: 3000 * Math.SQRT1_2, y: 3000 * Math.SQRT1_2, heading: 225 });
  near(h.aon, 45, 1e-9, 'aon'); near(h.aspect, 0, 1e-9, 'aspect'); near(h.aot, 180, 1e-9, 'aot');
  assert.equal(geometry({ x: 1, y: 1, heading: 0 }, { x: 1, y: 1, heading: 0 }), null);
});

test('pursuit illustration: lead closes most, lag least', () => {
  const closest = (mode) => Math.min(...pursuit({ mode }).map((p) => p.range));
  const lead = closest('lead'), pure = closest('pure'), lag = closest('lag');
  assert(lead < pure && pure < lag, `${lead} < ${pure} < ${lag}`);
  near(pursuit({ mode: 'pure' })[0].range, 6000, 1e-9, 'start range');
  assert.throws(() => pursuit({ mode: 'sideways' }), RangeError);
});
