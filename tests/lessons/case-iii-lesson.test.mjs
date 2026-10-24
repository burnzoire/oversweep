import assert from 'node:assert/strict';
import test from 'node:test';
import { approachProfile, entryPath, eatPlan, holdingTurnRate, finalCorrection, marshalFix, pointToPoint, profileAltitude, reciprocal, tacanPosition, timeEnroute, turnAmount, turnSeconds } from '../../src/lessons/case-iii/lesson-model.mjs';

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
// y north. Racetrack: 250 NM/hour, 180° per 120 s (1.5°/s), 60 s legs, so a
// racetrack turn has radius (250/3600·120)/π ≈ 2.653 NM and a leg is 4.167 NM.
// Entry turns: AIM 5-3-8 j 8, 3°/s or 30° bank, whichever needs less bank.
// At 250 kt = 128.611 m/s, 3°/s needs atan(0.0523599·128.611/9.80665) = 34.48°
// of bank, so 30° applies: 9.80665·tan 30°/128.611 = 0.044022 rad/s =
// 2.5223°/s, radius 128.611/0.044022 = 2921.5 m = 1.5775 NM.
const R = 250 / 30 / Math.PI, LEG = 250 / 60, ER = 1.5775;
const xs = (path) => path.points.map((p) => p.x);
const lastTrack = (r) => {
  const [p, q] = r.points.slice(-2);
  return (Math.atan2(q.x - p.x, q.y - p.y) * 180 / Math.PI + 360) % 360;
};
const near0 = (deg) => Math.min(deg, 360 - deg);

test('AIM holding turn rate: 3°/s or 30° bank, whichever needs less bank', () => {
  near(holdingTurnRate(250), 2.5223, 1e-4, '250 kt');
  // 120 kt = 61.733 m/s: 30° of bank would give 5.255°/s, so 3°/s needs less bank.
  assert.equal(holdingTurnRate(120), 3);
  assert.throws(() => holdingTurnRate(0), RangeError);
});

test('direct entry turns in the hold direction and joins the inbound course', () => {
  // Right hold, inbound 000°, arriving on 000°: the first turn is right, about
  // 180°, then the aircraft cuts onto the outbound leg 2R east of the course.
  const r = entryPath({ inboundCourse: 0, heading: 0, turns: 'right', entry: 'direct' });
  assert.equal(r.firstTurn.direction, 'right');
  near(r.firstTurn.degrees, 180, 5, 'first turn');
  assert(Math.min(...xs(r)) > -0.2, 'stays on the holding side');
  assert(!r.circuit && r.established && r.miss < 0.1, `established at the fix (${r.miss})`);
  assert(near0(lastTrack(r)) < 2, 'ends tracking 000°');
  for (const [turns, heading] of [['right', 90], ['left', 270], ['left', 90]]) {
    const p = entryPath({ inboundCourse: 0, heading, turns, entry: 'direct' });
    assert.equal(p.firstTurn.direction, turns);
    assert(p.established && !p.circuit, `direct ${turns} from ${heading}° joins`);
  }
});

test('teardrop entry: one-minute leg, then the turn back crosses and corrects', () => {
  // Right hold, inbound 000°, arriving on 180°: holding side east, leg heading 150°.
  const r = entryPath({ inboundCourse: 0, heading: 180, turns: 'right', entry: 'teardrop' });
  assert.equal(r.legHeading, 150);
  assert.deepEqual(r.firstTurn, { direction: 'left', degrees: 30 });
  // Left 30° at entry radius: ER·(1 − cos 30°) = 0.211 NM east; one minute on
  // 150°: 4.167·sin 30° = 2.083 NM east, total 2.295 NM. A full-rate right turn
  // from 150° to 000° moves ER·(1 + cos 30°) = 2.944 NM west: past the course
  // by 0.649 NM.
  const turnStart = r.points[Math.ceil(30 / 2.5223) + 60];
  near(turnStart.x, ER * (1 - Math.cos(Math.PI / 6)) + LEG / 2, 0.03, 'leg end x');
  near(r.crossed, 0.649, 0.05, 'crossing');
  assert.equal(r.secondTurn.direction, 'right');
  assert(r.secondTurn.degrees > 210, `turn back ${r.secondTurn.degrees}°`);
  assert(!r.circuit && r.established && near0(lastTrack(r)) < 2, 'established inbound at the fix');
  // Left hold, inbound 040°: outbound 220°, 30° toward the north-west holding side is 250°.
  assert.equal(entryPath({ inboundCourse: 40, heading: 220, turns: 'left', entry: 'teardrop' }).legHeading, 250);
});

test('parallel entry: non-holding side, more than 180° back, corrected on the first circuit', () => {
  // Left hold, inbound 000°, arriving on 090°: turn right 90° onto 180°, east of the course.
  const r = entryPath({ inboundCourse: 0, heading: 90, turns: 'left', entry: 'parallel' });
  assert.equal(r.legHeading, 180);
  assert.deepEqual(r.firstTurn, { direction: 'right', degrees: 90 });
  // A 90° turn at entry radius from heading 090° ends ER east and ER south of the fix.
  const end = r.points[Math.round(90 / 2.5223)];
  near(end.x, ER, 0.05, 'turn end x'); near(end.y, -ER, 0.05, 'turn end y');
  assert(r.points.slice(1, 90).every((p) => p.x > 0), 'outbound leg on the non-holding (east) side');
  // Turning left from 180° through 000° to a 45° cut (315°) is 225°.
  assert.deepEqual(r.secondTurn, { direction: 'left', degrees: 225 });
  // One minute leaves too little room to finish the 45° intercept by the fix.
  assert(r.atFix.offset > 0.1 && !r.atFix.established, 'not yet lined up at the fix');
  assert(r.circuit && r.established && near0(lastTrack(r)) < 2 && r.miss < 0.1, 'established after one circuit');
});

test('entry joins are judged over the whole turn back and from on-course starts', () => {
  // Parallel flown along the inbound course (arriving on the outbound heading):
  // rotated and mirrored versions of the same geometry behave the same way.
  const base = entryPath({ inboundCourse: 0, heading: 180, turns: 'right', entry: 'parallel' });
  for (const [inboundCourse, turns] of [[10, 'right'], [0, 'left'], [10, 'left'], [250, 'right']]) {
    const r = entryPath({ inboundCourse, heading: inboundCourse + 180, turns, entry: 'parallel' });
    assert.equal(r.circuit, base.circuit, `parallel ${turns} ${inboundCourse}°`);
    near(r.atFix.offset, base.atFix.offset, 0.05, `parallel ${turns} ${inboundCourse}° offset at fix`);
    assert(r.established, `parallel ${turns} ${inboundCourse}° ends established`);
  }
});

test('entry paths stay finite and end established on the inbound course', () => {
  for (const turns of ['left', 'right']) for (const entry of ['direct', 'teardrop', 'parallel']) {
    for (let inboundCourse = 0; inboundCourse < 360; inboundCourse += 45) for (let heading = 0; heading < 360; heading += 15) {
      const r = entryPath({ inboundCourse, heading, turns, entry });
      const label = `${entry} ${turns} ${inboundCourse}/${heading}`;
      assert(r.points.length < 1500, `${label}: ${r.points.length} s`);
      assert(r.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)), label);
      assert(r.established && r.miss < 0.1, `${label}: established ${r.established}, miss ${r.miss}`);
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

// CV-1 example profile, derived by hand from P-816 values: at 250 kt a minute
// covers 250/60 = 4.1667 NM, so 4,000 ft/min loses 960 ft/NM and 2,000 ft/min
// loses 480 ft/NM.
test('CV-1 example profile from angels 7 at 22 DME', () => {
  const p = approachProfile({ angels: 7 });
  assert.deepEqual(p.fix, { dme: 22, altitude: 7000 });
  // 2,000 ft to platform at 960 ft/NM = 2.0833 NM → 19.917 DME.
  near(p.platformDme, 22 - 2000 / 960, 1e-9, 'platform');
  near(p.platformDme, 19.917, 0.001, 'platform rounded');
  // 3,800 ft to 1,200 ft at 480 ft/NM = 7.9167 NM → 12.000 DME.
  near(p.levelDme, 12.0, 0.001, 'level-off');
  // Self-contained GCA check altitudes, P-816 p. 2-25.
  for (const [nm, ft] of [[3, 1200], [2, 800], [1, 400], [0.5, 200]]) near(profileAltitude(p, nm), ft, 1e-9, `${nm} NM`);
  near(profileAltitude(p, 21), 7000 - 960, 1e-9, '21 DME');
  near(profileAltitude(p, 16), 5000 - (p.platformDme - 16) * 480, 1e-9, '16 DME');
  assert.equal(profileAltitude(p, 8), 1200);
  assert.equal(profileAltitude(p, 30), 7000);
});

test('higher marshal altitudes reach platform close to 20 DME', () => {
  // Angels 14: 29 DME, 9,000 ft to lose at 960 ft/NM = 9.375 NM → 19.625 DME.
  near(approachProfile({ angels: 14 }).platformDme, 19.625, 1e-9, 'angels 14');
  // Angels 6: 21 DME, 1,000 ft → 1.0417 NM → 19.958 DME; level-off 12.042.
  const six = approachProfile({ angels: 6 });
  near(six.platformDme, 19.958, 0.001, 'angels 6 platform');
  near(six.levelDme, 12.042, 0.001, 'angels 6 level');
  assert.throws(() => marshalFix(5), RangeError);
  assert.throws(() => marshalFix(7.5), RangeError);
});

test('final-bearing correction rule', () => {
  // P-816 p. 2-26 example: marshal on the 160 radial, expected final bearing 015.
  // Inbound 340°; 015° is 35° right of it → 30° correction at 20 DME.
  // The final-bearing line extends aft along the 195 radial, 35° clockwise of
  // the aircraft's 160 radial: west of an aircraft heading 340°, so turn left.
  assert.deepEqual(finalCorrection({ marshalRadial: 160, finalBearing: 15 }), { inbound: 340, offset: 35, kind: 'thirty', turn: 'left' });
  // Mirror: 352° is 8° left of 000°; its line runs aft on the 172 radial, east of
  // an aircraft on the 180 radial heading 000°, so turn right.
  assert.deepEqual(finalCorrection({ marshalRadial: 180, finalBearing: 352 }), { inbound: 0, offset: -8, kind: 'gradual', turn: 'right' });
  assert.deepEqual(finalCorrection({ marshalRadial: 190, finalBearing: 0 }), { inbound: 10, offset: -10, kind: 'gradual', turn: 'right' });
  assert.deepEqual(finalCorrection({ marshalRadial: 200, finalBearing: 20 }), { inbound: 20, offset: 0, kind: 'none', turn: null });
});

test('timed turns', () => {
  assert.equal(turnAmount(40, 310, 'left'), 90);
  assert.equal(turnAmount(40, 310, 'right'), 270);
  assert.equal(turnAmount(350, 10, 'right'), 20);
  // One F-14 needle width: 360° in 4 min = 1.5°/s, so the marshal's 180° turn takes 120 s.
  assert.equal(turnSeconds(180, 360 / 240), 120);
  assert.equal(turnSeconds(90, 3), 30);
  assert.throws(() => turnSeconds(90, 0), RangeError);
  assert.throws(() => turnAmount(0, 90, 'up'), RangeError);
});
