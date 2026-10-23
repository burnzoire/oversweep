const assert = require('node:assert/strict');
const { holdPosition } = require('../../src/experiences/case-iii/model.cjs');
// Independent arithmetic: synthetic 250 NM/hour / 60 = 25/6 NM per 60 s;
// radius = (25/6 NM) / (pi/2 rad) = 25/(3*pi) NM.
const r = 25 / (3 * Math.PI), leg = 25 / 6;
const cases = [
  [0, 0, 21, 0], [60, -r, 21-r, 270],
  [120, -2*r, 21, 180], [180, -2*r, 21+leg, 180],
  [240, -r, 21+leg+r, 90], [300, 0, 21+leg, 0], [360, 0, 21, 0],
];
for (const [t,x,y,h] of cases) {
  const p = holdPosition(t);
  assert(Math.abs(p.x-x) < 1e-10); assert(Math.abs(p.y-y) < 1e-10); assert.equal(p.h,h);
  assert.deepEqual(holdPosition(t),p);
  assert.equal(holdPosition(t,359).h,(359+h)%360);
}
for (const bad of [-1,NaN,Infinity,'60',null]) assert.throws(()=>holdPosition(bad),RangeError);
assert.throws(()=>holdPosition(0,NaN),RangeError);
assert.deepEqual(holdPosition(720),holdPosition(0));
console.log('Independent hold geometry reference cases, wrap, determinism and invalid inputs: PASS.');
