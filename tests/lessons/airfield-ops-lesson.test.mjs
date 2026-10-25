import assert from 'node:assert/strict';
import test from 'node:test';
import {
  NM, SM, baseBearing, designator, ends, heightOnPath, lightSignal, markingsFor, overhead, papi,
  parallelNames, pathAngle, pattern, runwayForWind, runwayLights, thresholdStripes, turn, windComponents,
} from '../../src/lessons/airfield-ops/lesson-model.mjs';

// Expected values are derived by hand or quoted from the AIM, not produced by the model.
const near = (actual, expected, tolerance, label) =>
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} not within ${tolerance} of ${expected}`);

test('runway designators follow the AIM examples', () => {
  // AIM 4-3-6.1: "183 degrees is runway 18" and "87 degrees is runway 9".
  assert.equal(designator(183), 18);
  assert.equal(designator(87), 9);
  // 4° → 0.4 → 0, which is written 36; 355° → 35.5 → 36; 354° → 35.4 → 35.
  assert.equal(designator(4), 36);
  assert.equal(designator(355), 36);
  assert.equal(designator(354), 35);
  assert.equal(designator(-90), 27);
  assert.equal(designator(Number.NaN), null);
});

test('reciprocal ends and parallel suffixes', () => {
  // 87° + 180° = 267° → 26.7 → 27.
  assert.deepEqual(ends(87), [9, 27]);
  assert.deepEqual(ends(183), [18, 36]);
  // Left to right from the approach to 9: 9L, 9R. Seen from 27 the left strip is on the right.
  assert.deepEqual(parallelNames(87, 2), [{ near: '9L', far: '27R' }, { near: '9R', far: '27L' }]);
  assert.deepEqual(parallelNames(183, 3).map((s) => s.near + '/' + s.far), ['18L/36R', '18C/36C', '18R/36L']);
  assert.equal(parallelNames(87, 4), null);
});

test('threshold stripes and marking elements follow AIM tables 2-3-1 and 2-3-2', () => {
  assert.equal(thresholdStripes(60), 4);
  assert.equal(thresholdStripes(150), 12);
  assert.equal(thresholdStripes(200), 16);
  assert.equal(thresholdStripes(120), null);
  assert.deepEqual(markingsFor('visual'), ['designation', 'centerline']);
  assert(markingsFor('visual', { jet4000: true }).includes('aiming'));
  assert(markingsFor('precision').includes('touchdown'));
  assert(!markingsFor('nonprecision').includes('touchdown'));
});

test('wind components', () => {
  // Wind 120° at 20 kt on runway heading 090°: θ = 30°.
  // Headwind 20 cos 30° = 17.3205 kt; crosswind 20 sin 30° = 10 kt from the right.
  const w = windComponents({ wind: 120, speed: 20, runway: 90 });
  near(w.angle, 30, 1e-12, 'angle');
  near(w.head, 17.3205, 1e-4, 'head');
  near(w.cross, 10, 1e-9, 'cross');
  // Wind 360° at 15 kt on runway 270°: θ = 90°, all crosswind from the right.
  const x = windComponents({ wind: 360, speed: 15, runway: 270 });
  near(x.head, 0, 1e-9, 'head');
  near(x.cross, 15, 1e-9, 'cross');
  // Wind straight down the runway from behind: 20 kt tailwind.
  near(windComponents({ wind: 90, speed: 20, runway: 270 }).head, -20, 1e-9, 'tail');
  // Wind from the left is a negative crosswind.
  near(windComponents({ wind: 60, speed: 20, runway: 90 }).cross, -10, 1e-9, 'left');
  assert.equal(windComponents({ wind: 90, speed: -1, runway: 90 }), null);
});

test('runway most nearly aligned with the wind at 5 kt or more', () => {
  const runways = [90, 270, 180, 360];
  // 120°: 30° off runway 9, 60° off runway 18.
  assert.deepEqual(runwayForWind({ wind: 120, speed: 10, runways, calm: 270 }), { runway: 90, reason: 'wind' });
  assert.deepEqual(runwayForWind({ wind: 120, speed: 4, runways, calm: 270 }), { runway: 270, reason: 'calm' });
  assert.deepEqual(runwayForWind({ wind: 350, speed: 5, runways, calm: 270 }), { runway: 360, reason: 'wind' });
});

test('PAPI indications match the AIM figure labels', () => {
  // FIG 2-1-5: >3.5° high; 3.2° slightly high; 3° on path; 2.8° slightly low; <2.5° low.
  assert.equal(papi(3.6).white, 4);
  assert.equal(papi(3.2).white, 3);
  assert.equal(papi(3.0).white, 2);
  assert.equal(papi(3.0).label, 'On glide path');
  assert.equal(papi(2.8).white, 1);
  assert.equal(papi(2.4).white, 0);
  assert.deepEqual(papi(3.0).lights, ['white', 'white', 'red', 'red']);
  assert.equal(papi(Number.NaN), null);
});

test('glide path height', () => {
  // tan 3° = 0.0524078; 1 NM = 6,076.12 ft → 318.43 ft.
  near(heightOnPath(NM, 3), 318.43, 0.01, 'height');
  near(pathAngle(318.43, NM), 3, 1e-4, 'angle');
  assert.equal(pathAngle(100, 0), null);
});

test('level turn by bank angle', () => {
  // 300 kt = 154.333 m/s; tan 60° = 1.73205 → a = 16.9856 m/s².
  // r = 154.333² / 16.9856 = 1402.3 m = 4,600.7 ft; ω = 0.110058 rad/s = 6.306°/s; 180° in 28.55 s.
  const t = turn({ speed: 300, bank: 60 });
  near(t.radius, 4600.7, 0.5, 'radius');
  near(t.rate, 6.306, 0.001, 'rate');
  near(t.half, 28.55, 0.01, 'half');
  near(t.load, 2, 1e-9, 'load');
  assert.equal(turn({ speed: 300, bank: 90 }), null);
  assert.equal(turn({ speed: 0, bank: 30 }), null);
});

test('overhead maneuver geometry and glossary limits', () => {
  // Radius 4,600.7 ft as above; downwind 2r = 9,201.4 ft from the runway.
  // Path: two semicircles π·4,600.7 = 14,453.6 ft each, plus downwind 2,500 + 2,000 = 4,500 ft → 33,407 ft.
  // At 506.34 ft/s (300 kt) that is 65.98 s.
  const o = overhead({ speed: 300, bank: 60, breakAt: 2500, extend: 2000 });
  near(o.spacing, 9201.4, 1, 'spacing');
  near(o.pathLen, 33407, 3, 'path');
  near(o.seconds, 65.98, 0.02, 'seconds');
  assert.equal(o.rollout, 2000);
  // 1/4 statute mile is 1,320 ft.
  assert.equal(o.rolloutOk, true);
  assert.equal(overhead({ extend: 1000 }).rolloutOk, false);
  assert.equal(o.breakAlt, 1500);
  assert.equal(overhead({ above: 400 }).altitudeOk, false);
  assert.equal(overhead({ initial: 2 * NM }).initialOk, false);
  assert.equal(overhead({ bank: 0 }), null);
  near(SM / 4, 1320, 1e-9, 'quarter mile');
});

test('rectangular pattern geometry', () => {
  const p = pattern({ length: 5000, offset: 4000, side: 'left' });
  // Departure leg runs 1/2 statute mile past the 5,000 ft runway: 7,640 ft.
  assert.equal(p.upwindEnd, 7640);
  assert.deepEqual(p.legs.downwind, [[7640, -4000], [-4000, -4000]]);
  assert.deepEqual(p.legs.final, [[-4000, 0], [0, 0]]);
  assert.equal(pattern({ side: 'right', offset: 4000 }).legs.base[0][1], 4000);
  // Base turn with the approach end 45° behind abeam when beyond = offset.
  near(baseBearing(4000, 4000), 45, 1e-12, 'bearing');
});

test('runway lighting by distance remaining', () => {
  // 8,000 ft instrument runway: caution zone is the last 2,000 ft.
  assert.deepEqual(runwayLights({ length: 8000, remaining: 1500 }), { edge: 'yellow', centerline: 'red/white', caution: 2000 });
  assert.equal(runwayLights({ length: 8000, remaining: 500 }).centerline, 'red');
  assert.equal(runwayLights({ length: 8000, remaining: 5000 }).centerline, 'white');
  // 3,000 ft runway: half the length, 1,500 ft, is less than 2,000 ft.
  assert.equal(runwayLights({ length: 3000, remaining: 1800 }).edge, 'white');
  assert.equal(runwayLights({ length: 3000, remaining: 1400 }).edge, 'yellow');
  assert.equal(runwayLights({ length: 3000, remaining: 4000 }), null);
});

test('light gun signals follow AIM TBL 4-3-13', () => {
  assert.equal(lightSignal('flashing-green', 'ground'), 'Cleared for taxi');
  assert.equal(lightSignal('steady-red', 'air'), 'Give way to other aircraft and continue circling');
  assert.equal(lightSignal('flashing-red', 'air'), 'Airport unsafe, do not land');
  assert.equal(lightSignal('flashing-white', 'air'), 'Not applicable');
  assert.equal(lightSignal('blue', 'air'), null);
});
