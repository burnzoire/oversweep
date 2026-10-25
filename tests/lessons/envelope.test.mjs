import assert from 'node:assert/strict';
import test from 'node:test';
import { fittingScale, kmToNm, mToFt, region } from '../../src/lib/envelope.ts';

const close = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b}`);
const env = (o) => ({ basis: 'test', cite: [1], minRangeKm: null, minAltM: null, ...o });

test('unit conversions use the exact international definitions', () => {
  // 1 NM = 1,852 m exactly; 1 ft = 0.3048 m exactly.
  close(kmToNm(1.852), 1, 1e-12, 'NM');
  close(mToFt(18288), 60000, 1e-9, 'ft'); // the SA-2 museum ceiling round-trips
  close(kmToNm(43.45), 23.46, 0.01, 'SA-2 slant range 27 mi = 43.45 km');
});

test('the region is bounded by slant range and altitude', () => {
  // SA-6 figures: 4–24 km, 50 m–14 km. Worked by hand:
  // at the floor (0.05 km) the outer edge is sqrt(24² − 0.05²) = 23.99995 km;
  // at the ceiling (14 km) it is sqrt(576 − 196) = sqrt(380) = 19.4936 km,
  // and the inner edge is sqrt(max(16 − 196, 0)) = 0 (overhead is beyond 4 km slant).
  const r = region(env({ minRangeKm: 4, maxRangeKm: 24, minAltM: 50, maxAltM: 14000 }));
  close(r.outer[0][0], 23.99995, 1e-4, 'outer at floor');
  close(r.outer.at(-1)[0], 19.4936, 1e-4, 'outer at ceiling');
  close(r.outer.at(-1)[1], 14, 1e-12, 'ceiling');
  close(r.inner[0][0], 0, 1e-12, 'inner at ceiling');
  // Inner edge at the floor: sqrt(16 − 0.0025) = 3.99969 km.
  close(r.inner.at(-1)[0], 3.99969, 1e-4, 'inner at floor');
  for (const [x, y] of [...r.outer, ...r.inner]) {
    assert.ok(y >= 0.05 - 1e-12 && y <= 14 + 1e-12);
    assert.ok(Math.hypot(x, y) <= 24 + 1e-9);
  }
});

test('missing limits default to the ground and the launcher; a missing ceiling has no region', () => {
  const r = region(env({ maxRangeKm: 40, maxAltM: 20000 }));
  assert.equal(r.floorKm, 0);
  assert.ok(r.inner.every(([x]) => x === 0));
  assert.equal(region(env({ minRangeKm: 0.8, maxRangeKm: 6.5, minAltM: 10, maxAltM: null })), null);
});

test('a ceiling above the maximum slant range is clipped to it', () => {
  const r = region(env({ maxRangeKm: 10, maxAltM: 20000 }));
  close(r.ceilingKm, 10, 1e-12, 'clipped ceiling');
});

test('impossible limits are rejected', () => {
  assert.throws(() => region(env({ minRangeKm: 10, maxRangeKm: 5, maxAltM: 1000 })));
  assert.throws(() => region(env({ maxRangeKm: 5, minAltM: 3000, maxAltM: 1000 })));
});

test('the figure picks the smallest scale that holds the envelope', () => {
  assert.equal(fittingScale(env({ maxRangeKm: 4.2, maxAltM: 2300 })).id, 'point'); // SA-7: 2.3 NM, 7,546 ft
  assert.equal(fittingScale(env({ maxRangeKm: 24, maxAltM: 14000 })).id, 'short'); // SA-6: 13.0 NM, 45,932 ft
  assert.equal(fittingScale(env({ maxRangeKm: 50, maxAltM: 27000 })).id, 'medium'); // SA-4: 27.0 NM, 88,583 ft
  assert.equal(fittingScale(env({ maxRangeKm: 250, maxAltM: 29200 })).id, 'long'); // SA-5: 135 NM
});
