import assert from 'node:assert/strict';
import test from 'node:test';
import { AIRFRAMES, checkpointErrors, offsets, solveReference } from '../../src/lessons/formation/sight-model.mjs';
import { CALLS, CALL_OPTIONS, FORMATIONS } from '../../src/lessons/formation/lesson-model.mjs';

const t6 = AIRFRAMES['t-6b'];
const ref = solveReference(t6);

test('the T-6B parade reference lines up all three VT-6 checkpoints within the figure tolerance', () => {
  for (const [id, deg] of Object.entries(checkpointErrors(t6, ref))) assert.ok(deg <= 1.5, `${id}: ${deg.toFixed(2)}°`);
});

test('the reference is a plausible right-side parade: aft of the wingline, stepped down, wingtips clear', () => {
  const [x, y, z] = ref, halfSpan = 5.09;
  assert.ok(x < 0 && z < 1, `aft and below the lead pilot: ${ref}`);
  assert.ok(y - 2 * halfSpan > 0, 'the wingman’s left wingtip is outboard of the lead’s right wingtip');
  const { bearing } = offsets(ref, ref, t6);
  assert.ok(bearing > 15 && bearing < 50, `bearing ${bearing}`);
});

test('moving the wingman names the error: forward is acute, aft sucked, up high, down low, out wide', () => {
  const move = (d) => offsets(ref.map((v, i) => v + d[i]), ref, t6).words;
  assert.ok(move([1, 0, 0]).includes('acute'));
  assert.ok(move([-1, 0, 0]).includes('sucked'));
  assert.ok(move([0, 0, 1]).includes('high'));
  assert.ok(move([0, 0, -1]).includes('low'));
  assert.ok(move([0, 1.5, 0]).includes('wide'));
  assert.deepEqual(move([0, 0, 0]), []);
});

test('moving off the reference breaks a checkpoint', () => {
  const up = checkpointErrors(t6, [ref[0], ref[1], ref[2] + 1]);
  assert.ok(up.altitude > 1.5, 'a metre high breaks the step-down picture');
  const fwd = checkpointErrors(t6, [ref[0] + 2, ref[1], ref[2]]);
  assert.ok(Math.max(fwd.bearing, fwd.closure) > 1.5, 'two metres acute breaks bearing or closure');
});

test('formations: bearings ordered, ranges ordered, tactical formations wider than administrative', () => {
  for (const f of FORMATIONS) {
    assert.ok(f.bearing[0] <= f.bearing[1] && f.range[0] <= f.range[1], f.id);
    assert.ok(f.range[1] <= f.scale, `${f.id} fits its drawing scale`);
  }
  const max = (id) => FORMATIONS.find((f) => f.id === id).range[1];
  assert.ok(max('cruise') < max('combat-cruise') && max('combat-cruise') < max('combat-spread'));
});

test('every call quiz answer is a distinct option', () => {
  assert.equal(new Set(CALL_OPTIONS).size, CALLS.length);
});
