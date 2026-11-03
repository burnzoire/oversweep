import assert from 'node:assert/strict';
import test from 'node:test';
import { BURN, JAMMERS, METHOD_QUESTIONS, PACKAGE_STEPS, SCENE, burnthroughNm, echo, horizonNm, insideWez, jamming, lineOfSight, lowestVisibleFt } from '../../src/lessons/sead/lesson-model.mjs';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('radar horizon matches the 4/3-earth examples (Wikipedia, Radar horizon)', () => {
  // 75 ft mast: about 12 statute miles; 1 mile altitude: about 102 statute miles.
  near(horizonNm(75) * 1.15078, 12, 0.5);
  near(horizonNm(5280) * 1.15078, 102, 1.5);
  assert.equal(horizonNm(0), 0);
  assert.throws(() => horizonNm(-1), RangeError);
});

test('two horizons add: an aircraft is seen just inside their sum and hidden just beyond', () => {
  const sum = horizonNm(50) + horizonNm(1000);
  assert.equal(lineOfSight({ radarFt: 50, targetFt: 1000, rangeNm: sum - 0.5 }).visible, true);
  const far = lineOfSight({ radarFt: 50, targetFt: 1000, rangeNm: sum + 0.5 });
  assert.equal(far.visible, false);
  assert.equal(far.blockedBy, 'horizon');
});

test('the lowest visible height is where the target horizon closes the gap', () => {
  const ft = lowestVisibleFt(50, 30);
  near(horizonNm(50) + horizonNm(ft), 30, 1e-3);
  assert.equal(lowestVisibleFt(50, 5), 0);
  assert.equal(lineOfSight({ radarFt: 50, targetFt: ft + 20, rangeNm: 30 }).visible, true);
  assert.equal(lineOfSight({ radarFt: 50, targetFt: ft - 20, rangeNm: 30 }).visible, false);
});

test('a ridge masks a low aircraft the horizon alone would not hide', () => {
  const ridge = { atNm: 12, ft: 1200 };
  assert.equal(lineOfSight({ radarFt: 50, targetFt: 1000, rangeNm: 20 }).visible, true);
  const masked = lineOfSight({ radarFt: 50, targetFt: 1000, rangeNm: 20, ridge });
  assert.equal(masked.blockedBy, 'ridge');
  assert.equal(lineOfSight({ radarFt: 50, targetFt: 10000, rangeNm: 20, ridge }).visible, true);
});

test('burnthrough is where echo equals jamming, and a stand-off jammer is burned through farther out (USNA 11.2.2.4, 11.2.2.7)', () => {
  near(echo(BURN.ssjNm), jamming(BURN.ssjNm), 1e-12);
  for (const g of JAMMERS.filter((x) => x.jammerNm)) {
    const r = burnthroughNm(g.id, g.jammerNm);
    near(echo(r), jamming(g.jammerNm), 1e-9);
    assert.ok(r > BURN.ssjNm, `${g.id} should burn through beyond the self-screening range`);
  }
  assert.ok(burnthroughNm('standoff', 40) > burnthroughNm('forward', 15));
  assert.throws(() => burnthroughNm('standoff'), RangeError);
});

test('the invented package keeps the jammer outside the engagement zone and strikes inside it', () => {
  for (const s of PACKAGE_STEPS) if (s.soj) assert.equal(insideWez(s.soj), false, s.id);
  assert.equal(insideWez(PACKAGE_STEPS.find((s) => s.id === 'strike').strike), true);
  assert.equal(insideWez(SCENE.target), true);
  assert.equal(PACKAGE_STEPS.find((s) => s.id === 'magnum').samRadar, 'on');
  assert.equal(PACKAGE_STEPS.at(-1).samRadar, 'destroyed');
  for (const s of PACKAGE_STEPS) assert.ok(['jp', 'usna', 'wiki'].includes(s.cite) && s.page && s.href.startsWith('#'), s.id);
});

test('every outcome 1-6 has a quiz question, and every answer is an option', () => {
  assert.deepEqual([...new Set(METHOD_QUESTIONS.map((q) => q.outcome))].sort(), [1, 2, 3, 4, 5, 6]);
  for (const q of METHOD_QUESTIONS) assert.ok(q.options.includes(q.answer), q.ask);
});
