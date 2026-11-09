import assert from 'node:assert/strict';
import test from 'node:test';
import { glideCheck } from '../../src/lessons/abnormal/glide-check.mjs';

// Expected values are worked by hand from the published rules, not by the model.
test('T-6 rule: the stan notes worked examples', () => {
  // 5 NM: 1/2 x 5 + 3 = 5.5 -> 5,500 ft AGL to reach high key.
  assert.equal(glideCheck({ rule: 't6', distanceNm: 5, heightFt: 5500 }).neededHighKey, 5500);
  // 11,000 ft: (11 - 3) x 2 = 16 NM to high key.
  assert.equal(glideCheck({ rule: 't6', distanceNm: 16, heightFt: 11000 }).reachHighKeyNm, 16);
  assert.equal(glideCheck({ rule: 't6', distanceNm: 16, heightFt: 11000 }).target, 'high');
});

test('T-6 rule: low key only, and out of reach', () => {
  // 10 NM: high key needs 8,000, low key 6,500. 7,000 ft reaches low key only.
  const r = glideCheck({ rule: 't6', distanceNm: 10, heightFt: 7000 });
  assert.equal(r.neededLowKey, 6500);
  assert.equal(r.target, 'low');
  assert.equal(r.marginFt, -1000);
  assert.equal(glideCheck({ rule: 't6', distanceNm: 10, heightFt: 6000 }).target, 'none');
});

test('BMS F-16 rule: 1,000 ft per NM plus a 7,000 ft high key', () => {
  // 13 NM (the training mission's start): 13,000 + 7,000 = 20,000 ft; it starts at 21,000.
  const r = glideCheck({ rule: 'f16bms', distanceNm: 13, heightFt: 21000 });
  assert.equal(r.neededHighKey, 20000);
  assert.equal(r.reachHighKeyNm, 14);
  assert.equal(r.target, 'high');
});

test('rejects bad input', () => {
  assert.throws(() => glideCheck({ rule: 'x', distanceNm: 1, heightFt: 1 }));
  assert.throws(() => glideCheck({ rule: 't6', distanceNm: -1, heightFt: 1 }));
  assert.throws(() => glideCheck({ rule: 't6', distanceNm: NaN, heightFt: 1 }));
});
