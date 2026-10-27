import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PATTERNS, POP_STEPS, SENSITIVITY, belowMinimum, bombMiss, describeMiss, milsFromDegrees, missQuestion, offsetAimpoint, vacuumFall, vacuumPath,
} from '../../src/lessons/weapons-delivery/lesson-model.mjs';

const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message ?? ''} expected ${expected} ± ${tolerance}, got ${actual}`);

test('patterns carry the FTI numbers', () => {
  assert.deepEqual([PATTERNS[30].release, PATTERNS[30].minRelease, PATTERNS[30].mils], [3000, 2700, 128]);
  assert.deepEqual([PATTERNS[20].release, PATTERNS[20].minRelease, PATTERNS[20].mils], [2000, 1800, 130]);
  assert.deepEqual([PATTERNS[10].release, PATTERNS[10].minRelease, PATTERNS[10].mils], [1000, 900, 117]);
  for (const p of Object.values(PATTERNS)) assert.equal(p.releaseKtas, 450);
});

test('error directions follow the FTI: steep, fast or low is long', () => {
  assert.equal(bombMiss(30, { diveError: 1 }).total, 50);
  assert.equal(bombMiss(30, { speedError: 10 }).total, 50);
  assert.equal(bombMiss(30, { altError: 100 }).total, -50);
  assert.equal(bombMiss(10, { altError: -70 }).total, 80);
  assert.equal(bombMiss(20, { diveError: -1 }).total, -50);
});

test('errors add or cancel as in the FTI examples', () => {
  // 1° shallow and 10 kt slow: 100 ft short; 1° shallow and 10 kt fast: none.
  assert.equal(bombMiss(30, { diveError: -1, speedError: -10 }).total, -100);
  assert.equal(bombMiss(30, { diveError: -1, speedError: 10 }).total, 0);
  // 2° steep corrected by releasing 200 ft high.
  assert.equal(bombMiss(30, { diveError: 2, altError: 200 }).total, 0);
  assert.throws(() => bombMiss(45, {}), RangeError);
  assert.throws(() => bombMiss(30, { diveError: NaN }), RangeError);
});

test('minimum release altitude is flagged', () => {
  assert.equal(belowMinimum(30, -300), false);
  assert.equal(belowMinimum(30, -350), true);
  assert.equal(belowMinimum(10, -150), true);
});

test('offset aimpoint matches the FTI example', () => {
  near(offsetAimpoint(7, 12), 142.8, 1e-9);
  near(milsFromDegrees(1), 17.8, 0.1);
});

test('no-drag fall is consistent and ends on the ground', () => {
  const f = vacuumFall(3000, 30, 450);
  near(f.slant, Math.hypot(f.range, 3000), 1e-6);
  assert.ok(f.drop > 0 && f.time > 0);
  const path = vacuumPath(3000, 30, 450);
  near(path.at(-1)[1], 0, 1e-6);
  near(path.at(-1)[0], f.range, 1e-6);
  // Same directions as the table: a steeper dive drops less.
  assert.ok(vacuumFall(3000, 31, 450).drop < f.drop);
});

test('quiz questions are answered from the table', () => {
  let seed = 1;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 50; i++) {
    const q = missQuestion(random);
    assert.ok(SENSITIVITY[q.dive]);
    assert.ok(q.total % 10 === 0);
    near(q.total, bombMiss(q.dive, q.errors).total, 5);
  }
  assert.equal(describeMiss(0), 'On target');
  assert.equal(describeMiss(-100), '100 ft short');
  assert.equal(describeMiss(150), '150 ft long');
  assert.equal(POP_STEPS.length, 7);
});
