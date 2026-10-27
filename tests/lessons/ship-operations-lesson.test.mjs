import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  CASE_I, CHARLIE, DLQ_RULES, FT_PER_NM, LENSES, ballPicture, dlqStatus, lensThickness, planOf, readComment, splitPass,
} from '../../src/lessons/ship-operations/lesson-model.mjs';

const near = (actual, expected, tolerance, message) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${message ?? ''} expected ${expected} ± ${tolerance}, got ${actual}`);

test('lenses carry the FTI cell counts and coverage', () => {
  assert.deepEqual([LENSES.FLOLS.cells, LENSES.FLOLS.coverage], [5, 1.5]);
  assert.deepEqual([LENSES.IFLOLS.cells, LENSES.IFLOLS.coverage], [12, 1.7]);
});

test('the wedge narrows toward the lens', () => {
  // P-1211 Figure 5 draws 180 ft at a mile, which is the 1.7° wedge.
  near(lensThickness(FT_PER_NM, LENSES.IFLOLS), 180, 1);
  near(lensThickness(FT_PER_NM, LENSES.FLOLS), 159, 1);
  assert.ok(lensThickness(500) < lensThickness(6000));
});

test('the ball sits on the datum on the glideslope, and goes red when low', () => {
  const on = ballPicture(0, 6000);
  assert.equal(on.cell, 3);
  assert.equal(on.position, 0);
  assert.equal(on.red, false);
  const low = ballPicture(-60, 6000);
  assert.ok(low.visible);
  assert.equal(low.red, true);
  assert.equal(ballPicture(60, 6000).cell, 1);
  // The same height error is off the lens in close.
  assert.equal(ballPicture(20, FT_PER_NM).visible, true);
  assert.equal(ballPicture(20, 500).visible, false);
  assert.equal(ballPicture(20, 500).position, 1);
});

test('ball picture rejects bad input', () => {
  assert.throws(() => ballPicture(0, 0), RangeError);
  assert.throws(() => ballPicture(NaN, 1000), RangeError);
  assert.throws(() => lensThickness(Infinity), RangeError);
});

test('pattern paths join up and end at the landing spot', () => {
  for (const path of [CASE_I, CHARLIE]) {
    for (let i = 1; i < path.length; i += 1) {
      const prev = path[i - 1].pts.at(-1), next = path[i].pts[0];
      if (path === CHARLIE && i === 1) continue; // the Delta is a holding pattern, not joined
      assert.deepEqual(next.slice(0, 2), prev.slice(0, 2), `${path[i].id} starts where ${path[i - 1].id} ends`);
    }
  }
  assert.ok(CASE_I.find((s) => s.id === 'touchdown').pts.some(([x, y, h]) => x === 0 && y === 0 && h === 0));
  assert.deepEqual(CHARLIE.at(-1).pts.at(-1), [0, 0]);
  assert.equal(CASE_I[0].pts[0][2], 800);
  // P-1211: 600 ft at the abeam, 450 ft at the 90, 325-375 ft at the 45.
  assert.equal(CASE_I.find((s) => s.id === 'abeam').pts[0][2], 600);
  assert.equal(CASE_I.find((s) => s.id === 'ninety').pts[0][2], 450);
  const at45 = CASE_I.find((s) => s.id === 'fortyfive').pts[0][2];
  assert.ok(at45 >= 325 && at45 <= 375);
  assert.ok(CASE_I.flatMap((s) => s.pts).every(([, , h]) => h <= 800));
  assert.equal(planOf(CHARLIE).length, CHARLIE.reduce((n, s) => n + s.pts.length, 0));
});

test('the page lists the same pattern steps as the model', () => {
  const page = readFileSync(new URL('../../src/pages/manual/naval-operations/[module].astro', import.meta.url), 'utf8');
  const ids = (mode) => [...page.split(`data-steps="${mode}"`)[1].split('</ol>')[0].matchAll(/data-step="([a-z0-9]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids('case1'), CASE_I.map((s) => s.id));
  assert.deepEqual(ids('charlie'), CHARLIE.map((s) => s.id));
});

test('single-spot deck landing currency', () => {
  assert.equal(dlqStatus({ deck: 'single', in90: 4 }).status, 'current');
  const ref = dlqStatus({ deck: 'single', in90: 2, in180: 5 });
  assert.equal(ref.status, 'refresher');
  assert.match(ref.needs.join(' '), /4 field deck landings, then 6 shipboard/);
  const init = dlqStatus({ deck: 'single', in90: 0, in180: 3 });
  assert.equal(init.status, 'initial');
  assert.match(init.needs.join(' '), /6 field deck landings, then 6 single-spot/);
  assert.equal(dlqStatus({ deck: 'single', mode: 'night', in90: 10 }).status, 'not-covered');
  assert.equal(DLQ_RULES.single.initial.withinDays, 10);
});

test('multispot day and night deck landing currency', () => {
  assert.equal(dlqStatus({ deck: 'multi', in9mo: 4 }).status, 'current');
  assert.match(dlqStatus({ deck: 'multi', in9mo: 3 }).needs.join(' '), /5 day field deck landings, then 5 day shipboard/);
  assert.match(dlqStatus({ deck: 'multi', mode: 'night', in9mo: 0, night90: 10 }).needs[0], /Requalify by day first/);
  assert.equal(dlqStatus({ deck: 'multi', mode: 'night', in9mo: 5, night90: 6, hoursSinceNight: 24 }).status, 'current');
  assert.equal(dlqStatus({ deck: 'multi', mode: 'night', in9mo: 5, night90: 6, hoursSinceNight: 96 }).status, 'refresher');
  assert.equal(dlqStatus({ deck: 'multi', mode: 'night', in9mo: 5, night90: 6, hoursSinceNight: 96, dayLandingIn24h: true }).status, 'current');
  const lapsed = dlqStatus({ deck: 'multi', mode: 'night', in9mo: 5, night90: 5, hoursSinceNight: 24 });
  assert.equal(lapsed.status, 'initial');
  assert.match(lapsed.needs.join(' '), /6 night field deck landings, then 6 night shipboard/);
});

test('deck landing currency rejects bad input', () => {
  assert.throws(() => dlqStatus({ deck: 'single', in90: -1 }), RangeError);
  assert.throws(() => dlqStatus({ deck: 'multi', in9mo: NaN }), RangeError);
  assert.throws(() => dlqStatus({ deck: 'raft' }), RangeError);
  assert.throws(() => dlqStatus({ deck: 'multi', mode: 'dusk', in9mo: 5 }), RangeError);
});

test('LSO comments split into the grading symbols', () => {
  const codes = new Map([['EG', 'Eased gun'], ['IW', 'In the wires'], ['LO', 'Low'], ['IC', 'In close'], ['S', 'Settle'], ['SLO', 'Slow'], ['F', 'Fast'], ['X', 'At the start'], ['L-R', 'Left to right']]);
  assert.deepEqual(readComment('EGIW', codes).map((r) => r.map((t) => t.code)), [['EG', 'IW']]);
  assert.deepEqual(readComment('egiw', codes)[0].map((t) => t.meaning), ['Eased gun', 'In the wires']);
  const slight = readComment('(F)X', codes);
  assert.deepEqual(slight[0].map((t) => [t.code, Boolean(t.slight)]), [['F', true], ['X', false]]);
  // Two readings, fewest symbols first.
  assert.deepEqual(readComment('SLOIC', codes).map((r) => r.map((t) => t.code)), [['SLO', 'IC'], ['S', 'LO', 'IC']]);
  assert.deepEqual(readComment('L-R IC', codes)[0].map((t) => t.code), ['L-R', 'IC']);
  assert.deepEqual(readComment('QQ', codes), []);
  assert.deepEqual(readComment('', codes), []);
});

test('the page lists every lettered symbol in P-1211 Figures 7 and 8', () => {
  const page = readFileSync(new URL('../../src/pages/manual/naval-operations/[module].astro', import.meta.url), 'utf8');
  const listed = new Set([...page.matchAll(/data-code="([^"]+)" data-kind="(where|fault)"/g)].map((m) => m[1]));
  for (const code of ['EG', 'IW', 'LO', 'IC', 'X', 'IM', 'AR', 'TL', 'OW', 'AW', 'IT', 'OT', 'NERD', 'TMRD', 'COCO', 'OSCB', 'L-R', 'R-L', 'LUL', 'LUR', 'TWA', 'TCA']) assert.ok(listed.has(code), code);
  assert.equal(listed.size, 71);
});

test('real comments read with their marks', () => {
  const codes = new Map([['SLO', 'Slow'], ['LO', 'Low'], ['IC', 'In close'], ['AR', 'At the ramp'], ['NEP', 'Not enough power'], ['CO', 'Come-on'], ['IM', 'In the middle'], ['H', 'High'], ['P', 'Power'], ['BC', 'Ball call']]);
  const places = new Set(['IC', 'AR', 'IM']);
  const [r] = readComment('(LO)SLOIC-AR', codes, 4, places);
  assert.deepEqual(r.map((t) => [t.code, Boolean(t.slight), t.meaning]), [['LO', true, 'Low'], ['SLO', false, 'Slow'], ['IC', false, 'In close'], ['-', false, 'to'], ['AR', false, 'At the ramp']]);
  // A hyphen that isn't between two places is left unread.
  assert.equal(readComment('NEP-BC', codes, 4, places)[0][1].meaning, '');
  assert.deepEqual(readComment('NEP.COIM LOIC', codes, 4, places)[0].map((t) => t.code), ['NEP', '.', 'CO', 'IM', 'LO', 'IC']);
  const marked = readComment('_H_ [P]IC', codes, 4, places)[0];
  assert.deepEqual(marked.map((t) => [t.code, Boolean(t.strong), Boolean(t.missed)]), [['H', true, false], ['P', false, true], ['IC', false, false]]);
  assert.deepEqual(splitPass('(OK) OC NEP-BC LOIC 2'), { grade: '(OK)', wire: 2, comment: 'OC NEP-BC LOIC' });
  assert.deepEqual(splitPass('LOIC'), { grade: null, wire: null, comment: 'LOIC' });
});
