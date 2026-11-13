import assert from 'node:assert/strict';
import test from 'node:test';
import { jinkOffset } from '../../src/lessons/abnormal/aaa-jink.mjs';

const near = (a, b, tol) => assert(Math.abs(a - b) <= tol, `${a} not within ${tol} of ${b}`);

// Expected values worked by hand: 450 kt = 759.5 ft/s; at 4 g the horizontal
// acceleration is 32.174 x sqrt(15) = 124.6 ft/s^2, radius 759.5^2 / 124.6 =
// 4,629 ft. In 3 s the jet flies 2,278 ft of arc, 0.492 rad: x = 2,188 ft,
// y = 550 ft, so it is about 557 ft from the point 2,278 ft straight ahead.
test('a 4 g turn at 450 kt over a 3 s time of flight', () => {
  const r = jinkOffset({ speedKt: 450, tofS: 3, loadG: 4 });
  near(r.predictedFt, 2278.5, 1);
  near(r.turnRadiusFt, 4629, 5);
  near(r.offsetFt, 557, 3);
  near(r.headingChangeDeg, 28.2, 0.2);
});

test('for short times the offset approaches half a t squared', () => {
  // 1 s at 4 g: 0.5 x 124.6 x 1 = 62.3 ft.
  near(jinkOffset({ speedKt: 450, tofS: 1, loadG: 4 }).offsetFt, 62.3, 0.5);
});

test('holding 1 g, no turn, leaves the aircraft on the predicted point', () => {
  const r = jinkOffset({ speedKt: 400, tofS: 5, loadG: 1 });
  assert.equal(r.offsetFt, 0);
  assert.equal(r.headingChangeDeg, 0);
});

test('the offset grows with time of flight and with g', () => {
  const a = jinkOffset({ speedKt: 450, tofS: 2, loadG: 3 }).offsetFt;
  assert(jinkOffset({ speedKt: 450, tofS: 4, loadG: 3 }).offsetFt > a);
  assert(jinkOffset({ speedKt: 450, tofS: 2, loadG: 5 }).offsetFt > a);
});

test('bad inputs throw', () => {
  assert.throws(() => jinkOffset({ speedKt: 0, tofS: 1, loadG: 2 }));
  assert.throws(() => jinkOffset({ speedKt: 400, tofS: -1, loadG: 2 }));
  assert.throws(() => jinkOffset({ speedKt: 400, tofS: 1, loadG: 0.5 }));
});
