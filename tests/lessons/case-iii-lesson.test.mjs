import assert from 'node:assert/strict';
import test from 'node:test';
import { eatPlan, holdEntry, pointToPoint, reciprocal, tacanPosition, timeEnroute } from '../../src/lessons/case-iii/lesson-model.mjs';

// Expected values are derived by hand from the station frame (x east, y north,
// x = DME·sin(radial), y = DME·cos(radial)), not by calling the model.
const near = (actual, expected, tolerance, label) =>
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} not within ${tolerance} of ${expected}`);

test('radial/DME positions and reciprocals', () => {
  const east = tacanPosition({ radial: 90, dme: 20 });
  near(east.x, 20, 1e-12, 'x'); near(east.y, 0, 1e-12, 'y');
  assert.equal(reciprocal(180), 0);
  assert.equal(reciprocal(10), 190);
  assert.equal(reciprocal(350), 170);
  assert.equal(reciprocal(-90), 90);
});

test('point-to-point course and distance', () => {
  // (20, 0) → (0, −20): dx −20, dy −20 → 225°, 20√2 NM.
  let r = pointToPoint({ radial: 90, dme: 20 }, { radial: 180, dme: 20 });
  near(r.course, 225, 1e-9, 'course'); near(r.distance, 20 * Math.SQRT2, 1e-9, 'distance');
  // Same radial, inbound from 30 to 21 DME: 180°, 9 NM.
  r = pointToPoint({ radial: 0, dme: 30 }, { radial: 360, dme: 21 });
  near(r.course, 180, 1e-9, 'course'); near(r.distance, 9, 1e-9, 'distance');
  // (0, 10) → (10, 0): 135°, 10√2 NM.
  r = pointToPoint({ radial: 0, dme: 10 }, { radial: 90, dme: 10 });
  near(r.course, 135, 1e-9, 'course'); near(r.distance, 10 * Math.SQRT2, 1e-9, 'distance');
  // From the station itself the track equals the target radial.
  r = pointToPoint({ radial: 270, dme: 0 }, { radial: 45, dme: 10 });
  near(r.course, 45, 1e-9, 'course'); near(r.distance, 10, 1e-9, 'distance');
  // Trainer-style case, BRC 000: 090°/30 DME to the 180°/21 DME fix.
  // dx −30, dy −21 → 180° + atan(30/21) = 235.008°; √1341 = 36.620 NM.
  r = pointToPoint({ radial: 90, dme: 30 }, { radial: 180, dme: 21 });
  near(r.course, 235.008, 0.001, 'course'); near(r.distance, 36.620, 0.001, 'distance');
  assert.equal(pointToPoint({ radial: 10, dme: 5 }, { radial: 370, dme: 5 }).course, null);
});

test('time en route at a fixed rate', () => {
  assert.equal(timeEnroute(25 / 6, 250), 60);
  near(timeEnroute(21, 250), 302.4, 1e-9, '21 NM');
  assert.equal(timeEnroute(0, 250), 0);
});

test('hold entry sectors, right-hand pattern', () => {
  const entry = (heading) => holdEntry({ inboundCourse: 0, heading, turns: 'right' }).entry;
  for (const h of [0, 90, 109, 290, 330]) assert.equal(entry(h), 'direct', `heading ${h}`);
  for (const h of [110, 150, 179]) assert.equal(entry(h), 'teardrop', `heading ${h}`);
  for (const h of [180, 270, 289]) assert.equal(entry(h), 'parallel', `heading ${h}`);
});

test('hold entry sectors, left-hand pattern mirror the right-hand ones', () => {
  const entry = (heading) => holdEntry({ inboundCourse: 0, heading, turns: 'left' }).entry;
  for (const h of [0, 270, 251, 70, 30]) assert.equal(entry(h), 'direct', `heading ${h}`);
  for (const h of [250, 210, 181]) assert.equal(entry(h), 'teardrop', `heading ${h}`);
  for (const h of [180, 90, 71]) assert.equal(entry(h), 'parallel', `heading ${h}`);
  // Rotated inbound course 270: heading 160 is 110° anticlockwise → teardrop.
  assert.equal(holdEntry({ inboundCourse: 270, heading: 160, turns: 'left' }).entry, 'teardrop');
  assert.equal(holdEntry({ inboundCourse: 0, heading: 112, turns: 'right' }).nearBoundary, true);
  assert.equal(holdEntry({ inboundCourse: 0, heading: 140, turns: 'right' }).nearBoundary, false);
});

test('EAT plans with 120 s turns and 60 s legs', () => {
  assert.deepEqual(eatPlan({ secondsToEat: 720 }), { kind: 'exact', standard: 360, circuits: 2 });
  // 900 = 360 + (240 + 2·150); 180 s slack is too short for a separate circuit.
  assert.deepEqual(eatPlan({ secondsToEat: 900 }), {
    kind: 'adjust', standard: 360, slack: 180, shorten: null, extend: { circuits: 1, legSeconds: 150 },
  });
  // 660 = 360 + (240 + 2·30) = 240 + 2·210.
  assert.deepEqual(eatPlan({ secondsToEat: 660 }), {
    kind: 'adjust', standard: 360, slack: 300, shorten: { circuits: 1, legSeconds: 30 }, extend: { circuits: 0, legSeconds: 210 },
  });
  assert.deepEqual(eatPlan({ secondsToEat: 300 }), {
    kind: 'adjust', standard: 360, slack: 300, shorten: { circuits: 0, legSeconds: 30 }, extend: null,
  });
  assert.deepEqual(eatPlan({ secondsToEat: 200 }), { kind: 'short', standard: 360, minimum: 240, secondsToEat: 200 });
  assert.deepEqual(eatPlan({ secondsToEat: -30 }), { kind: 'late', standard: 360, lateBy: 30 });
});

test('invalid inputs are rejected', () => {
  assert.throws(() => tacanPosition({ radial: NaN, dme: 1 }), RangeError);
  assert.throws(() => pointToPoint({ radial: 0, dme: -1 }, { radial: 0, dme: 1 }), RangeError);
  assert.throws(() => timeEnroute(1, 0), RangeError);
  assert.throws(() => holdEntry({ inboundCourse: 0, heading: 0, turns: 'up' }), RangeError);
  assert.throws(() => eatPlan({ secondsToEat: Infinity }), RangeError);
  assert.throws(() => eatPlan({ secondsToEat: 600, turnSeconds: 0 }), RangeError);
});
