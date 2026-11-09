import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ASPECT_ITEMS, CRANK_AO, LS_ITEMS, QUESTIONS, STEPS, aspectWord, banditHeading, closure, collisionAo, cutAndHca, fighterHeading,
  fly, losRate, lsExact, lsRule, positions, rMax, rNe, rangeAt, shotZone, timeoutRange, tofSec,
} from '../../src/lessons/bvr/lesson-model.mjs';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the LS rule gives the training instruction\'s 40K gates (P-825 pp. 8-2, 10-9)', () => {
  assert.equal(lsRule(20, 20), 40000);
  assert.equal(lsRule(15, 30), 45000);
  assert.equal(lsRule(30, 15), 45000);
  // The rule approximates SR x sin(TA) within about 5% at these angles.
  near(lsExact(20, 20) / lsRule(20, 20), 1.04, 0.01);
  // P-825 p. 9-2: 30 TA at 30 NM is 15 NM of lateral separation.
  near(lsExact(30, 30) / 6076.12, 15, 1e-9);
});

test('headings follow TA and AO, and AA = 180 - TA', () => {
  // Bandit due north showing 0 TA flies straight at the fighter.
  assert.equal(banditHeading(0), 180);
  // 30 L TA: the fighter is on the bandit's left, so it heads 210.
  assert.equal(banditHeading(-30), 210);
  assert.equal(fighterHeading(0), 0);
  assert.equal(fighterHeading(30), 330);
});

test('co-speed collision: AO equals TA on the opposite side, no drift, constant bearing (P-825 p. 9-2)', () => {
  for (const ta of [-60, -30, -10, 10, 45]) {
    const ao = collisionAo(ta);
    near(ao, -ta, 1e-9);
    near(losRate(ta, ao, 20), 0, 1e-9);
    const later = fly(ta, ao, 20, 60);
    near(later.bb, 0, 1e-6);
    near(later.ta, ta, 1e-6);
    near(later.ao, ao, 1e-6);
    assert.ok(later.sr < 20);
  }
  // Collision bearing is half the cut (P-825 p. 9-20).
  const g = cutAndHca(30, -30);
  near(Math.abs(g.cb), 30, 1e-9);
  near(g.hca, 120, 1e-9);
});

test('off collision the contact drifts away from collision bearing (P-825 p. 9-2)', () => {
  // 30 R TA, collision AO is 30 L; pointing at the bandit (AO 0) puts the
  // fighter right of collision, so the contact drifts right, away from it.
  assert.ok(losRate(30, 0, 20) > 0);
  assert.ok(losRate(-30, 0, 20) < 0);
});

test('flying the bandit reciprocal keeps LS and lets TA and AO grow (P-825 pp. 9-4, 10-10)', () => {
  const ta = 20, ao = 20; // FH = BR: zero cut
  assert.equal(cutAndHca(ta, ao).cut, 0);
  const start = lsExact(ta, 20);
  const later = fly(ta, ao, 20, 60);
  near(lsExact(later.ta, later.sr), start, 1);
  assert.ok(Math.abs(later.ta) > ta && Math.abs(later.ao) > ao);
});

test('closure is highest nose-on and equal to the fighter\'s speed at 90 TA (P-825 p. 8-5)', () => {
  assert.equal(closure(0, 0), 600);
  near(closure(90, 0), 300, 1e-9);
});

test('aspect words match the controller\'s ranges (P-825 p. 5-8)', () => {
  assert.equal(aspectWord(10), 'HOT');
  assert.equal(aspectWord(-45), 'FLANK');
  assert.equal(aspectWord(90), 'BEAM');
  assert.equal(aspectWord(150), 'DRAG');
  assert.equal(aspectWord(65), undefined);
  for (const q of ASPECT_ITEMS) assert.ok(q.answer, `TA ${q.ta} must have a word`);
  for (const q of LS_ITEMS) assert.equal(q.answer, q.ta * q.sr * 100);
});

test('time of flight rule and the crank (P-825 pp. 15-9, 16-11)', () => {
  assert.equal(tofSec(20, 'forward'), 40);
  assert.equal(tofSec(20, 'beam'), 60);
  assert.equal(tofSec(20, 'rear'), 80);
  // Pressing straight on, both aircraft close 300 kt for the 40 s time of flight.
  near(timeoutRange(20, 0), 20 - 2 * (300 * 40) / 3600, 1e-9);
  assert.ok(timeoutRange(20, CRANK_AO) > timeoutRange(20, 0));
});

test('the illustrative zone is longest hot and shortest in the rear quarter, with RNE inside', () => {
  assert.ok(rMax(0) > rMax(90) && rMax(90) > rMax(180));
  for (const ta of [0, 60, 120, 180]) assert.ok(rNe(ta) < rMax(ta));
  assert.equal(shotZone(0, 0.3), 'rne');
  assert.equal(shotZone(0, 0.8), 'lar');
  assert.equal(shotZone(180, 0.8), 'outside');
  assert.equal(shotZone(0, 0.02), 'inside');
});

test('the worked intercept follows the training timeline', () => {
  const ranges = STEPS.map((_, i) => rangeAt(i));
  assert.deepEqual(STEPS.slice(0, 5).map((s) => s.range), [50, 35, 30, 25, 20]);
  for (let i = 0; i < 5; i++) near(ranges[i], STEPS[i].range, 0.05);
  // Commit no closer than 35 NM, meld no earlier than 25, shoot at 20 (P-825 pp. 16-5, 17-26, 16-11).
  assert.ok(ranges[1] >= 35 && ranges[3] <= 25.05);
  // The crank keeps the section outside 10 NM at timeout, and turning out holds the range.
  assert.ok(ranges[5] > 10);
  assert.ok(ranges[6] >= ranges[5] - 0.1);
  assert.equal(positions(5).missiles.length, 2);
});

test('every quiz question has its answer among its options', () => {
  for (const q of QUESTIONS) assert.ok(q.options.includes(q.answer), q.ask);
  assert.deepEqual([...new Set(QUESTIONS.map((q) => q.outcome))].sort(), [3, 4, 5, 6]);
});
