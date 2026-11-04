import assert from 'node:assert/strict';
import test from 'node:test';
import { RUN, advance, autoPower, decide, driftCorrection, goMissed, grade, newRun, windComponents } from '../../src/lessons/instrument-flight/ils-trainer-model.mjs';
import { levelTrim } from '../../src/lessons/instrument-flight/attitude-model.mjs';

const level = levelTrim(RUN.speed, { dragK: RUN.dragK });
const descent = levelTrim(RUN.speed, { dragK: RUN.dragK, gamma: -3 });

// A simple scripted pilot: intercept, wind-corrected heading, then pitch and
// power for the glide slope with small corrections. Returns the run at the DA.
function fly(seed, { sloppy = 0 } = {}) {
  const run = newRun(seed);
  let onGs = false;
  while (run.phase === 'flying') {
    const n = run.needles, s = run.s;
    const want = run.course + Math.max(-30, Math.min(30, n.loc * 12)) + driftCorrection(run) + sloppy;
    const err = ((want - s.heading + 540) % 360) - 180;
    onGs = onGs || n.gs < 0.3;
    const t = onGs ? descent : level;
    advance(run, { bank: Math.max(-25, Math.min(25, err * 2)), pitch: t.pitch + (onGs ? n.gs * 1.2 : 0), power: t.power + (RUN.speed - s.speed) * 2 }, 0.05);
  }
  return run;
}

test('every run starts below the glide slope, off the localizer, on an intercept heading, within needle range', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const run = newRun(seed);
    assert.ok(run.needles.gs > 0.5 && run.needles.gs < 1.4, `seed ${seed}: gs ${run.needles.gs}`);
    assert.ok(Math.abs(run.needles.loc) > 0.5 && Math.abs(run.needles.loc) < 1.7, `seed ${seed}: loc ${run.needles.loc}`);
    assert.ok(run.windKt >= RUN.windKt[0] && run.windKt <= RUN.windKt[1]);
  }
  assert.deepEqual(newRun(42).pos, newRun(42).pos, 'a seed repeats a run');
});

test('the aircraft is in balance on the approach: level at level trim, 3° down at descent trim', () => {
  const run = newRun(7);
  run.windKt = 0;
  for (let i = 0; i < 400; i++) advance(run, { ...level, bank: 0 }, 0.05);
  assert.ok(Math.abs(run.s.vs) < 30 && Math.abs(run.s.speed - RUN.speed) < 1, `vs ${run.s.vs} speed ${run.s.speed}`);
  const r2 = newRun(7);
  for (let i = 0; i < 400; i++) advance(r2, { ...descent, bank: 0 }, 0.05);
  const fpm = RUN.speed * 101.27 * Math.sin(3 * Math.PI / 180);
  assert.ok(Math.abs(-r2.s.vs - fpm) < 40 && Math.abs(r2.s.speed - RUN.speed) < 2, `vs ${r2.s.vs}`);
});

test('a well-flown run reaches the DA in about 90 seconds, inside one dot, and the right decision scores ok', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const run = fly(seed);
    assert.equal(run.phase, 'decision', `seed ${seed}`);
    assert.ok(run.t > 60 && run.t < 140, `seed ${seed}: ${run.t} s`);
    decide(run, run.visual ? 'land' : 'missed');
    const g = grade(run);
    assert.equal(g.result, 'ok', `seed ${seed}: ${JSON.stringify(g.items)}`);
    assert.ok(g.pct > 90);
  }
});

test('wind: the drift correction holds the course; ignoring it lets the localizer drift', () => {
  // Find a run with a strong crosswind.
  let seed = 1;
  while (Math.abs(windComponents(newRun(seed)).cross) < 15) seed++;
  const good = fly(seed), bad = fly(seed, { sloppy: -driftCorrection(newRun(seed)) });
  const late = (run) => { const last = run.samples.filter((p) => p.t > run.t - 30); return last.reduce((a, p) => a + Math.abs(p.loc), 0) / last.length; };
  assert.ok(late(good) < 0.1 && late(bad) > 2 * late(good), `${late(bad)} vs ${late(good)}`);
});

test('the decision: land only in sight and in position; late or wrong is a wrong call', () => {
  const run = fly(3);
  const at = run.decisionAt;
  const copy = () => ({ ...run, busts: [...run.busts], decisionAt: { ...at } });
  for (const visual of [true, false]) {
    for (const choice of ['land', 'missed', 'late']) {
      const r = { ...copy(), visual, phase: 'decision' };
      decide(r, choice);
      const g = grade(r);
      assert.equal(g.correct, choice === (visual ? 'land' : 'missed'), `${visual} ${choice}`);
    }
  }
  const off = { ...copy(), visual: true, phase: 'decision', decisionAt: { ...at, loc: 1.5 } };
  decide(off, 'land');
  assert.equal(grade(off).correct, false, 'in sight but more than one dot off: go missed');
});

test('limits: full-scale localizer is a broken limit, and going missed on it is right', () => {
  const run = newRun(5);
  run.capturedAt = 0; run.locCapturedAt = 0;
  run.pos.right += 6000 * Math.sign(run.pos.right || 1);
  advance(run, run.input, 0.05);
  assert.ok(run.busts.some((b) => b.rule === 'full-scale localizer'));
  goMissed(run);
  const g = grade(run);
  assert.equal(g.correct, true);
  assert.ok(!g.items.some(([, text]) => text.startsWith('Limit broken')), 'a prompt missed is not marked as a broken limit');
});

test('limits: more than one dot low below localizer minimums is recorded', () => {
  const run = fly(9);
  const low = newRun(9);
  low.capturedAt = 0;
  low.pos = { range: 1, right: 0, height: 250 };
  low.s = { ...low.s, altitude: RUN.tdze + 250 };
  advance(low, low.input, 0.05);
  assert.ok(low.busts.some((b) => b.rule.startsWith('more than one dot low')), JSON.stringify(low.busts));
  assert.equal(run.busts.length, 0, 'a well-flown run breaks no limit');
});

test('the run records samples for the replay, in time order', () => {
  const run = fly(11);
  assert.ok(run.samples.length > 200);
  for (let i = 1; i < run.samples.length; i++) assert.ok(run.samples[i].t > run.samples[i - 1].t);
  assert.ok(run.samples.every((p) => Number.isFinite(p.loc) && Number.isFinite(p.gs) && Number.isFinite(p.height)));
});

test('fuzz: random inputs never produce non-finite state', () => {
  let x = 1;
  const r = () => (x = (x * 16807) % 2147483647) / 2147483647;
  for (let seed = 1; seed <= 30; seed++) {
    const run = newRun(seed);
    for (let i = 0; i < 4000 && run.phase === 'flying'; i++) advance(run, { pitch: -15 + r() * 40, bank: -30 + r() * 60, power: r() * 100 }, 0.02 + r() * 0.08);
    for (const v of [run.pos.range, run.pos.right, run.pos.height, run.s.speed, run.s.heading]) assert.ok(Number.isFinite(v));
  }
});

test('auto power holds the approach speed through a level-off and a descent', () => {
  const run = newRun(13);
  for (let i = 0; i < 600; i++) advance(run, { pitch: level.pitch, bank: 0, power: autoPower(run, 0.05) }, 0.05);
  assert.ok(Math.abs(run.s.speed - RUN.speed) < 1, `level ${run.s.speed}`);
  for (let i = 0; i < 600 && run.phase === 'flying'; i++) advance(run, { pitch: descent.pitch, bank: 0, power: autoPower(run, 0.05) }, 0.05);
  assert.ok(Math.abs(run.s.speed - RUN.speed) < 1.5, `descending ${run.s.speed}`);
});

test('windscreen: on the centreline and glide path the runway is ahead, below the horizon', async () => {
  const { project, SCREEN, visibilityAt } = await import('../../src/lessons/instrument-flight/windscreen.mjs');
  const at = { range: 2860 / 6076, right: 0, height: 200, pitch: 6.5, bank: 0, heading: 90, course: 90 };
  const thr = project(at, 0, 0), horizon = project({ ...at, height: 0 }, 1e7, 0);
  assert.ok(Math.abs(thr[0] - SCREEN.width / 2) < 0.5, 'centred');
  assert.ok(thr[1] > horizon[1] && thr[1] < SCREEN.height, 'below the horizon and on the screen');
  // Right of the centreline: the runway appears to the left.
  assert.ok(project({ ...at, right: 200 }, 0, 0)[0] < SCREEN.width / 2);
  // Right bank raises the right side of the horizon.
  const banked = { ...at, height: 0, bank: 15 };
  assert.ok(project(banked, 1e7, 1e6)[1] < project(banked, 1e7, -1e6)[1]);
  assert.equal(project(at, -4000, 0), null, 'behind the eye');
  assert.equal(visibilityAt(RUN.da, false, RUN.da), 0);
  assert.equal(visibilityAt(RUN.da, true, RUN.da), 1);
  assert.equal(visibilityAt(RUN.da + 200, true, RUN.da), 0);
});
