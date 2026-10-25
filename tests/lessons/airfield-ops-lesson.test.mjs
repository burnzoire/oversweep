import assert from 'node:assert/strict';
import test from 'node:test';
import {
  AIRFIELD, NAVY_CALLSIGN, NM, RADIO_CALLS, SM, baseBearing, designator, ends, gearDisks, heightOnPath, lightSignal, markingsFor,
  meatball, overhead, papi,
  parallelNames, pathAngle, pattern, radioCalls, runwayForWind, runwayLights, thresholdStripes, turn, windComponents,
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

test('PAPI boundaries: a unit turns white only above its setting', () => {
  // Settings 2°30′, 2°50′, 3°10′, 3°30′: exactly on a setting still shows red for that unit.
  assert.equal(papi(2.5).white, 0);
  assert.equal(papi(2.51).white, 1);
  assert.equal(papi(2 + 50 / 60).white, 1);
  assert.equal(papi(2.84).white, 2);
  assert.equal(papi(3.5).white, 3);
  assert.equal(papi(3.51).white, 4);
});

test('a wind exactly between two runways keeps the first listed', () => {
  // 045° is 45° off both runway 9 and runway 36.
  assert.equal(runwayForWind({ wind: 45, speed: 10, runways: [90, 270, 180, 360] }).runway, 90);
  assert.equal(runwayForWind({ wind: 45, speed: 10, runways: [360, 90] }).runway, 360);
});

test('the overhead initial is measured up to the break point', () => {
  // A 3 NM initial ending at a break 4,000 ft past the threshold starts 18,228 − 4,000 = 14,228 ft out.
  const o = overhead({ breakAt: 4000, initial: 3 * NM });
  near(o.points.start[0], 4000 - 3 * 6076.115, 0.01, 'start');
  assert.deepEqual(o.points.break, [4000, 0]);
});

test('radio calls: who to call and when', () => {
  // AIM 4-3-2: initial callup about 15 miles out. AC 90-66C ¶10.4.1: self-announce about 10 miles out.
  const first = (key) => RADIO_CALLS[key].find((c) => c.you);
  assert.equal(first('towered-inbound').at.nm, 15);
  assert.equal(first('towered-inbound').station, 'Cedar Tower');
  assert.equal(radioCalls(false, 'inbound').find((c) => c.id === 'ten').at.nm, 10);
  assert.equal(radioCalls(true, 'sideways'), null);
  // AIM 4-3-14: after landing, stay on tower until told to contact ground.
  const inbound = radioCalls(true, 'inbound');
  const toGround = inbound.findIndex((c) => c.station === 'Cedar Ground');
  assert.match(inbound[toGround - 1].them, /contact ground/);
  // AIM 4-3-14: ground before engine start, tower only when ready for takeoff.
  assert.deepEqual(radioCalls(true, 'outbound').filter((c) => c.you).map((c) => c.station),
    ['Cedar Ground', 'Cedar Ground', 'Cedar Tower', 'Cedar Tower']);
});

test('CTAF self-announcements follow AC 90-66C', () => {
  const calls = [...RADIO_CALLS['nontowered-inbound'], ...RADIO_CALLS['nontowered-outbound']]
    .filter((c) => c.you && c.freq.startsWith('CTAF'));
  assert(calls.length >= 5);
  for (const c of calls) {
    const said = c.you.replace(/^"|\.?"$/g, '');
    // ¶10.1(2): the airport name at the beginning and end of each call.
    assert(said.startsWith(`${AIRFIELD} traffic`) && said.endsWith(AIRFIELD), said);
    // ¶9.8.1: the runway number, never "active runway"; no "please advise".
    assert(!/active|please advise/i.test(said), said);
    // ¶10.3: avoid "to" and "for".
    assert(!/\b(to|for)\b/i.test(said), said);
  }
});

test('IFLOLS meatball follows NAVEDTRA 14342A', () => {
  // p. 5-52: the ball rises above the datum as the pilot rises above the glide slope,
  // and slides off the top more than 3/4 degree above it.
  assert.equal(meatball(3.5, 3.5).position, 0);
  assert.match(meatball(3.5, 3.5).label, /on glide slope/);
  assert(meatball(3.8, 3.5).position > 0);
  near(meatball(3.875, 3.5).position, 0.5, 1e-9, 'half way up');
  assert.equal(meatball(4.25, 3.5).visible, true);
  assert.equal(meatball(4.26, 3.5).visible, false);
  assert.match(meatball(4.4, 3.5).label, /off the top/);
  // Low: below the datum, then red in the bottom cell (lowest fifth: below −0.45°).
  assert.equal(meatball(3.2, 3.5).red, false);
  assert.equal(meatball(3.0, 3.5).red, true);
  assert.equal(meatball(Number.NaN, 3.5), null);
});

test('arresting gear disks: 10 ft circles 30 ft on center across the runway', () => {
  // AIM 2-3-14.2 and NAVEDTRA p. 4-9. 150 ft: floor((150 − 10) / 30) + 1 = 5 disks, at 0 and ±30, ±60 ft.
  assert.deepEqual(gearDisks(150), [-60, -30, 0, 30, 60]);
  assert.equal(gearDisks(200).length, 7);
  assert.equal(gearDisks(0), null);
});

test('Navy field calls follow the overhead and the Hollywood Script order', () => {
  const inbound = radioCalls('navy', 'inbound');
  const ids = inbound.map((c) => c.id);
  // Course rules before tower; the initial, the numbers and the 180 in that order.
  assert(ids.indexOf('course-rules') < ids.indexOf('initial'));
  assert(ids.indexOf('initial') < ids.indexOf('numbers') && ids.indexOf('numbers') < ids.indexOf('one-eighty'));
  const initial = inbound.find((c) => c.id === 'initial');
  assert(initial.at.nm >= 3 && initial.at.nm <= 5, 'initial is 3 to 5 miles');
  assert.match(inbound.find((c) => c.id === 'one-eighty').you, /gear/);
  assert.match(inbound.find((c) => c.id === 'one-eighty').them, /cleared to land/);
  // Tower hands off to ground only after landing.
  const toGround = inbound.findIndex((c) => c.station === 'Cedar Ground');
  assert.match(inbound[toGround - 1].them, /contact ground/);
  for (const c of [...inbound, ...radioCalls('navy', 'outbound')]) if (c.you) assert(c.you.includes(NAVY_CALLSIGN), c.you);
  assert.deepEqual(radioCalls('navy', 'outbound').filter((c) => c.you).map((c) => c.station),
    ['KATT Base', 'Cedar Ground', 'Cedar Tower', 'Departure']);
});
