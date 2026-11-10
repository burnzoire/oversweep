import assert from 'node:assert/strict';
import test from 'node:test';
import { ADMIN, PICKS, PICK_OPTIONS, RADIUS, SPEED, SPREAD, TACTICAL, adminPositions, tacticalPositions, turnEnd, wallTurn } from '../../src/lessons/formation/division-model.mjs';

const close = (a, b, msg, tol = 1e-9) => assert.ok(Math.abs(a - b) < tol, `${msg}: ${a} vs ${b}`);

test('fingertip strong right puts the second element on the right, #4 outboard of #3 (FAST p. 8-9)', () => {
  const [, two, three, four] = adminPositions('fingertip', 1);
  assert.ok(two.x < 0 && three.x > 0 && four.x > three.x);
  assert.equal(four.ref, 3, '#4 flies on #3');
  const left = adminPositions('fingertip', -1);
  assert.ok(left[2].x < 0 && left[3].x < left[2].x);
});

test('echelon puts every wingman on one side, each on the bearing line of the one ahead (p. 10)', () => {
  const pts = adminPositions('echelon', -1);
  assert.ok(pts.slice(1).every((p) => p.x < 0));
  for (let i = 1; i < pts.length; i++) {
    close(pts[i].x - pts[i - 1].x, pts[1].x - pts[0].x, `step ${i} x`);
    assert.equal(pts[i].ref, i);
  }
});

test('diamond: #4 in the slot directly behind lead, on the bearing lines of #2 and #3 (pp. 11, 29)', () => {
  const [lead, two, three, four] = adminPositions('diamond', 1);
  close(four.x, lead.x, 'slot behind lead');
  close(four.x - two.x, -two.x, "symmetric off #2");
  close(Math.hypot(four.x - three.x, four.y - three.y), Math.hypot(three.x, three.y), 'same distance off #3');
});

test('every close configuration draws the size it describes', () => {
  for (const f of ADMIN) assert.equal(adminPositions(f.id, 1).length, f.count, f.id);
});

test('division wall: line abreast, order -2 -1 -3 -4, 0.8-1.0 nm apart (P-1288 p. 7-1)', () => {
  const pts = tacticalPositions('wall', 1).sort((a, b) => a.x - b.x);
  assert.deepEqual(pts.map((p) => p.n), [2, 1, 3, 4]);
  for (const p of pts) close(p.y, 0, 'abreast');
  assert.ok(SPREAD >= 0.8 && SPREAD <= 1.0);
});

test('fluid four: section leads in spread, wingmen in tac wing 0.2-0.6 nm aft and outside (pp. 6-9, 7-2)', () => {
  const [one, two, three, four] = tacticalPositions('fluid', 1);
  close(three.x - one.x, SPREAD, 'spread');
  for (const [w, l] of [[two, one], [four, three]]) {
    const d = Math.hypot(w.x - l.x, w.y - l.y);
    assert.ok(d >= 0.2 && d <= 0.6, `tac wing ${d}`);
    assert.ok(w.y > l.y, 'aft');
  }
  assert.ok(two.x < one.x && four.x > three.x, 'wingmen on the outside');
});

test('tac turn left in wall: -4 (outside) turns first, -2 last, all roll out line abreast heading west', () => {
  const t0 = wallTurn('tac', -1, 0);
  const order = [...t0].sort((a, b) => a.start - b.start).map((p) => p.n);
  assert.deepEqual(order, [4, 3, 1, 2]);
  const end = wallTurn('tac', -1, turnEnd('tac') + 5);
  for (const p of end) close(p.h, -90, `-${p.n} heading`, 1e-6);
  for (const p of end) close(p.x, end[0].x, `-${p.n} abreast`, 1e-9);
  const ys = end.map((p) => p.y);
  close(Math.max(...ys) - Math.min(...ys), 3 * SPREAD, 'spacing kept');
});

test('in-place turn: all four turn together through 180° and swap sides (pp. 5-8, 7-5)', () => {
  const start = wallTurn('inplace', 1, 0);
  assert.ok(start.every((p) => p.start === 0));
  const end = wallTurn('inplace', 1, turnEnd('inplace') + 3);
  for (const p of end) close(p.h, 180, 'reciprocal', 1e-6);
  for (const p of end) close(p.y, end[0].y, 'abreast');
  for (const [a, b] of [[start, end]]) for (let i = 0; i < 4; i++) close(b[i].x - a[i].x, 2 * RADIUS, 'displaced one turn diameter');
  assert.ok(SPEED > 0);
});

test('quiz answers are among the options, and each tactical formation is cited', () => {
  for (const q of PICKS) assert.ok(PICK_OPTIONS.includes(q.answer), q.answer);
  for (const f of TACTICAL) assert.match(f.cite, /^\[\d/);
});
