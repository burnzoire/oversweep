import assert from 'node:assert/strict';
import test from 'node:test';
import { aimEntry, arrivalSectors, driftCorrection, entryQuestion, entryTrack, holdingPattern, marginFromBoundary, seventyMethod, vviFor } from '../../src/lessons/instrument-flight/lesson-model.mjs';

test('AIM entry sectors for right turns: direct -70 to +110, teardrop to the outbound course, parallel the rest (AIM 5-3-8)', () => {
  const cases = { 360: 'Direct', 290: 'Direct', 110: 'Direct', 111: 'Teardrop', 180: 'Teardrop', 181: 'Parallel', 289: 'Parallel' };
  for (const [h, e] of Object.entries(cases)) assert.equal(aimEntry(360, Number(h)), e, `heading ${h}`);
});

test('left turns mirror the sectors', () => {
  assert.equal(aimEntry(90, 90 - 150, 'left'), 'Teardrop');
  assert.equal(aimEntry(90, 90 + 150, 'left'), 'Parallel');
  assert.equal(aimEntry(90, 90 + 100, 'left'), 'Parallel');
  assert.equal(aimEntry(90, 90 - 100, 'left'), 'Direct');
});

test('arrival sectors are 180, 70 and 110 degrees wide and match the heading rule', () => {
  for (const turn of ['right', 'left']) {
    const s = arrivalSectors(40, turn);
    const width = ([a, b]) => ((b - a) + 360) % 360 || 360;
    assert.deepEqual([width(s.Direct), width(s.Teardrop), width(s.Parallel)], [180, 70, 110]);
    for (const [entry, [a]] of Object.entries(s)) {
      const from = (a + 5) % 360; // just inside the sector
      assert.equal(aimEntry(40, (from + 180) % 360, turn), entry, `${turn} ${entry}`);
    }
  }
});

test('70 degree method: direct only within 70 degrees of the inbound course (AFMAN 11-217 p. 154)', () => {
  assert.equal(seventyMethod(360, 70), 'Direct');
  assert.equal(seventyMethod(360, 290), 'Direct');
  assert.equal(seventyMethod(360, 71), 'Parallel');
  assert.equal(seventyMethod(360, 180), 'Parallel');
});

test('quiz questions stay at least 10 degrees from a sector line', () => {
  let seed = 1;
  const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 200; i++) {
    const q = entryQuestion(random);
    assert.ok(marginFromBoundary(q.inbound, q.heading, q.turn) >= 10);
    assert.equal(q.answer, aimEntry(q.inbound, q.heading, q.turn));
  }
});

test('tracks start and end at the fix, and the pattern lies on the holding side', () => {
  const p = holdingPattern(360, 'right');
  assert.deepEqual(p[0], [0, 0]);
  assert.deepEqual(p.at(-1), [0, 0]);
  assert.ok(Math.max(...p.map(([x]) => x)) > 30); // right turns: east of a northbound course
  assert.ok(Math.min(...holdingPattern(360, 'left').map(([x]) => x)) < -30);
  for (const h of [90, 150, 250]) assert.deepEqual(entryTrack(360, h).points.at(-1), [0, 0]);
});

test('rules of thumb: VVI for 3 and 2.5 degrees, drift correction (AFMAN 11-217 pp. 158, 208)', () => {
  assert.equal(vviFor(180), 900);
  assert.equal(vviFor(180, 2.5), 700);
  assert.equal(driftCorrection(30, 180), 10);
});

test('entry tracks keep heading continuity on the way back to the fix', () => {
  const bearing = ([x1, y1], [x2, y2]) => (Math.atan2(x2 - x1, y2 - y1) * 180 / Math.PI + 360) % 360;
  for (const turn of ['right', 'left']) for (let h = 5; h <= 360; h += 5) {
    const pts = entryTrack(360, h, turn).points.filter((p, i, a) => !i || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 0.5);
    for (let i = 2; i < pts.length; i++) {
      const d = Math.abs(((bearing(pts[i - 1], pts[i]) - bearing(pts[i - 2], pts[i - 1])) + 540) % 360 - 180);
      assert.ok(d <= 12, `${turn} heading ${h}: ${d.toFixed(1)}° jump at point ${i}`);
    }
  }
});
