import assert from 'node:assert/strict';
import test from 'node:test';
import { entryPath, eatPlan, pointToPoint, reciprocal, tacanPosition, timeEnroute } from '../../src/lessons/case-iii/lesson-model.mjs';

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

// Entry paths: hand-derived from the AIM entry definitions. Fix frame: x east,
// y north. Trainer geometry: 250 NM/hour, 180° per 120 s (1.5°/s), 60 s legs,
// so a 180° turn has radius (250/3600·120)/π ≈ 2.653 NM and a leg is 4.167 NM.
const R = 250 / 30 / Math.PI, LEG = 250 / 60;
const xs = (path) => path.points.map((p) => p.x);

test('direct entry turns in the hold direction onto the outbound heading', () => {
  // Right hold, inbound 000°, arriving on 000°: turn right 180° onto 180°.
  const r = entryPath({ inboundCourse: 0, heading: 0, turns: 'right', entry: 'direct' });
  assert.deepEqual(r.firstTurn, { direction: 'right', degrees: 180 });
  assert.deepEqual(r.secondTurn, { direction: 'right', degrees: 180 });
  // The turn ends 2R east of the fix, the leg runs south; all on the holding (east) side.
  const end = r.points[120];
  near(end.x, 2 * R, 0.01, 'turn end x'); near(end.y, 0, 0.01, 'turn end y');
  near(r.points[180].y, -LEG, 0.01, 'leg end y');
  assert(Math.min(...xs(r)) > -0.05, 'stays on the holding side');
  assert(r.miss < 0.2, `returns to the fix (${r.miss})`);
  // Left hold arriving on 090°: the hold-direction turn onto 180° is 270°.
  assert.deepEqual(entryPath({ inboundCourse: 0, heading: 90, turns: 'left', entry: 'direct' }).firstTurn, { direction: 'left', degrees: 270 });
});

test('teardrop entry flies 30° toward the holding side for one minute', () => {
  // Right hold, inbound 000°, arriving on 180°: holding side east, leg heading 150°.
  const r = entryPath({ inboundCourse: 0, heading: 180, turns: 'right', entry: 'teardrop' });
  assert.equal(r.legHeading, 150);
  assert.deepEqual(r.firstTurn, { direction: 'left', degrees: 30 });
  // Then a right turn from 150° to 000°: 210°.
  assert.deepEqual(r.secondTurn, { direction: 'right', degrees: 210 });
  // A 30° turn at 1.5°/s takes 20 s; then 60 s on 150° puts the aircraft east of the fix.
  assert(r.points[80].x > 2, 'leg ends on the holding side');
  assert(r.miss < 0.2, `returns to the fix (${r.miss})`);
  // Left hold, inbound 040°: outbound 220°, 30° toward the north-west holding side is 250°.
  assert.equal(entryPath({ inboundCourse: 40, heading: 220, turns: 'left', entry: 'teardrop' }).legHeading, 250);
});

test('parallel entry flies the non-holding side, then turns more than 180°', () => {
  // Left hold, inbound 000°, arriving on 090°: turn right 90° onto 180°, east of the course.
  const r = entryPath({ inboundCourse: 0, heading: 90, turns: 'left', entry: 'parallel' });
  assert.equal(r.legHeading, 180);
  assert.deepEqual(r.firstTurn, { direction: 'right', degrees: 90 });
  // A 90° turn of radius R from heading 090° ends R east and R south of the fix.
  near(r.points[60].x, R, 0.01, 'turn end x'); near(r.points[60].y, -R, 0.01, 'turn end y');
  assert(r.points.slice(1, 121).every((p) => p.x > 0), 'outbound leg on the non-holding (east) side');
  assert.equal(r.secondTurn.direction, 'left');
  assert(r.secondTurn.degrees > 180, `turn back ${r.secondTurn.degrees}° exceeds 180°`);
  assert(r.miss < 0.2, `returns to the fix (${r.miss})`);
});

test('entry paths stay finite and come back to the fix area', () => {
  for (const turns of ['left', 'right']) for (const entry of ['direct', 'teardrop', 'parallel']) {
    for (let inboundCourse = 0; inboundCourse < 360; inboundCourse += 45) for (let heading = 0; heading < 360; heading += 15) {
      const r = entryPath({ inboundCourse, heading, turns, entry });
      assert(r.points.length < 900, `${entry} ${turns} ${inboundCourse}/${heading}: ${r.points.length} s`);
      assert(r.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)));
      assert(Number.isFinite(r.miss) && r.miss < 4 * R, `${entry} ${turns} ${inboundCourse}/${heading}: miss ${r.miss}`);
    }
  }
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
  assert.throws(() => entryPath({ inboundCourse: 0, heading: 0, turns: 'up', entry: 'direct' }), RangeError);
  assert.throws(() => entryPath({ inboundCourse: 0, heading: 0, turns: 'left', entry: 'hold' }), RangeError);
  assert.throws(() => eatPlan({ secondsToEat: Infinity }), RangeError);
  assert.throws(() => eatPlan({ secondsToEat: 600, turnSeconds: 0 }), RangeError);
});
