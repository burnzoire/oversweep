import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FRAME_6B_140_SEC, RADAR_QUESTIONS, RWR_STEPS, altitudeAt, clock, closureKt, elevationExact, elevationRule, frameSeconds, inNotch, inVolume,
  notchHalfWidth, ownRadialKt, rel, scanCoverage,
} from '../../src/lessons/sensors/radar-model.mjs';
import { SA_QUESTIONS, SECTORS, TRACKS, crossCheck, known } from '../../src/lessons/sensors/sa-model.mjs';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the elevation rule gives the training instruction\'s worked example (P-825 p. 8-7)', () => {
  // 10,000 ft above at 20 NM is 5 degrees; 4 degrees high at 20 NM is 8,000 ft.
  assert.equal(elevationRule(10000, 20), 5);
  assert.equal(altitudeAt(0, 4, 20), 8000);
  // The rule is within about 6% of the exact angle at intercept ranges.
  near(elevationExact(10000, 20) / elevationRule(10000, 20), 0.94, 0.01);
});

test('the scan volume covers what its bars reach, and more bars take longer', () => {
  const cov = scanCoverage({ ownAltFt: 20000, antElevDeg: 5, bars: 1, rangeNm: 20 });
  assert.ok(inVolume(cov, 30000));
  assert.ok(!inVolume(scanCoverage({ ownAltFt: 20000, antElevDeg: 0, bars: 2, rangeNm: 20 }), 30000));
  assert.equal(frameSeconds(6, 140), FRAME_6B_140_SEC);
  assert.ok(frameSeconds(2, 140) < frameSeconds(6, 140));
});

test('the notch is centred on the beam: at 90 TA the target closes only at the fighter\'s speed (P-825 p. 8-5)', () => {
  near(ownRadialKt(450, 90), 0, 1e-9);
  near(closureKt(300, 300, 90), 300, 1e-9);
  assert.equal(closureKt(300, 300, 0), 600);
  assert.ok(inNotch(450, 90, 60));
  assert.ok(!inNotch(450, 0, 60) && !inNotch(450, 180, 60));
  // Symmetric about the beam, and wider for a slower target or a wider gate.
  const h = notchHalfWidth(450, 60);
  assert.ok(inNotch(450, 90 + h - 0.1, 60) && !inNotch(450, 90 + h + 0.5, 60));
  assert.ok(notchHalfWidth(200, 60) > h && notchHalfWidth(450, 100) > h);
  assert.equal(notchHalfWidth(50, 60), 90);
});

test('the warning receiver steps put the threat on the beam after the turn (P-825 pp. 16-12 to 16-13)', () => {
  assert.equal(clock(rel(60, 360)), 2);
  assert.equal(clock(rel(330, 360)), 11);
  const beam = RWR_STEPS.find((s) => s.phase === 'Beam');
  const ai = beam.threats.find((t) => t.id === 'AI');
  assert.equal(clock(rel(ai.bearing, beam.heading)), 9);
  // The shortest turn to the beam from north: right to 060 (60 degrees) rather than left to 240.
  assert.ok(Math.abs(beam.heading - 360 + 360) % 360 <= 90);
  for (const s of RWR_STEPS) assert.ok(s.href.startsWith('#'));
});

test('lookout drops the lowest sectors first and places the radar by position (MCH 11-F16v5 pp. 22-24)', () => {
  assert.deepEqual(SECTORS.map((s) => s.id), ['1', '1A', '2', '3', '4']);
  assert.deepEqual(crossCheck('lead', 'light'), ['1', '1A', '2', '3', 'Radar', '4']);
  assert.deepEqual(crossCheck('wing', 'light'), ['1', '1A', '2', '3', '4', 'Radar']);
  assert.deepEqual(crossCheck('wing', 'busy'), ['1', '1A', '2']);
  assert.deepEqual(crossCheck('lead', 'hard-turn'), ['1']);
});

test('the invented picture: the hostile group is correlated, the RWR alone gives a bearing, the unknown stays unknown', () => {
  const all = ['eyes', 'radar', 'rwr', 'control', 'link'];
  const north = TRACKS.find((t) => t.id === 'north'), east = TRACKS.find((t) => t.id === 'east'), sam = TRACKS.find((t) => t.id === 'sam');
  assert.ok(known(north, all).correlated && known(north, all).identity);
  assert.ok(known(north, ['rwr']).bearingOnly);
  assert.ok(!known(north, ['radar']).identity);
  assert.ok(!known(east, all).identity && !known(east, all).correlated);
  assert.ok(known(sam, ['rwr']).bearingOnly && !known(sam, ['link', 'rwr']).bearingOnly);
});

test('IFF identifies the friend that replies; no reply adds no identity and no correlation', () => {
  const all = ['eyes', 'radar', 'rwr', 'control', 'link', 'iff'];
  const wing = TRACKS.find((t) => t.id === 'wing'), north = TRACKS.find((t) => t.id === 'north'), east = TRACKS.find((t) => t.id === 'east');
  assert.ok(known(wing, ['iff']).identity);
  assert.ok(!known(north, ['radar', 'iff']).identity && known(north, ['radar', 'iff']).noReply);
  assert.ok(!known(north, ['iff']).by.length);
  assert.ok(!known(east, all).identity && !known(east, all).correlated && known(east, all).noReply);
});

test('every question has its answer among its options and cites a source', () => {
  for (const q of [...RADAR_QUESTIONS, ...SA_QUESTIONS]) {
    assert.ok(q.options.includes(q.answer), q.ask);
    assert.match(q.why, /\[\d\]/);
  }
  assert.deepEqual([...new Set(RADAR_QUESTIONS.map((q) => q.outcome))].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual([...new Set(SA_QUESTIONS.map((q) => q.outcome))].sort(), [1, 2, 3, 4, 5, 6, 7]);
});
