import assert from 'node:assert/strict';
import test from 'node:test';
import { FORMATIONS, LEAD_CHANGE, PICKS, PICK_OPTIONS, SPACING, centreDistance, iimcBreakup, positions } from '../../src/lessons/formation/helo-model.mjs';

const close = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} vs ${b}`);

test('spacing is edge to edge in rotor disks, so centres are one disk further apart (TC 3-04.1-4, p. 214)', () => {
  assert.deepEqual(SPACING.map((s) => s.gap), [2, 4, 8, 12]);
  assert.equal(centreDistance(4), 5);
});

test('staggered: chalk 2 sets the side and chalk 3 flies in trail directly behind lead (p. 224)', () => {
  const [lead, c2, c3, c4] = positions('staggered', 4, 4, 1);
  assert.equal(lead.x, 0);
  assert.ok(c2.x > 0, 'staggered right puts chalk 2 on the right');
  close(c3.x, 0, 'chalk 3 behind lead');
  assert.ok(c3.y > c2.y);
  assert.ok(c4.x > 0);
  close(Math.hypot(c2.x, c2.y), 5, 'close spacing centre distance');
});

test('echelon puts every wingman on one side; trail puts them all behind', () => {
  assert.ok(positions('echelon', 5, 4, -1).slice(1).every((p) => p.x < 0));
  for (const p of positions('trail', 5, 8)) close(p.x, 0, `chalk ${p.chalk}`);
});

test('the V and combat spread are drawn at the sizes the circular describes', () => {
  const v = positions('v', 5, 4);
  assert.equal(v.length, 3);
  assert.ok(v[1].x * v[2].x < 0, 'one wingman each side');
  const s = positions('combat-spread', 4, 4);
  assert.equal(s.length, 2);
  close(s[1].y, 0, 'abeam');
});

test('every manoeuvring formation has a zone and every formation a citation', () => {
  for (const f of FORMATIONS) {
    assert.ok(f.cite && f.where && f.use, f.id);
    if (f.kind === 'manoeuvring' && f.id !== 'combat-spread') assert.ok(f.zone, f.id);
  }
});

test('IIMC breakup: 10° times chalk number, even chalks to the staggered side, 500 ft per chalk (pp. 220–221)', () => {
  const left = iimcBreakup(5, 'left');
  assert.deepEqual(left.map((p) => [p.turn, p.dir, p.climb]), [[0, 'straight', 0], [20, 'left', 500], [30, 'right', 1000], [40, 'left', 1500], [50, 'right', 2000]]);
  assert.deepEqual(iimcBreakup(3, 'right').map((p) => p.dir), ['straight', 'right', 'left']);
});

test('the lead change moves lead at least eight disks out and ends with the former lead in trail (p. 218)', () => {
  assert.ok(LEAD_CHANGE[2].at[0][0] <= -8);
  const end = LEAD_CHANGE.at(-1).at;
  assert.ok(end[0][1] > Math.max(end[1][1], end[2][1]), 'former lead behind the others');
  assert.equal(LEAD_CHANGE.at(-1).lead, 2);
});

test('formation quiz answers are among the options', () => {
  for (const q of PICKS) assert.ok(PICK_OPTIONS.includes(q.answer), q.ask);
});
