import assert from 'node:assert/strict';
import test from 'node:test';
import { RECOVERIES, UNUSUAL, hubAndSpoke, initialState, levelTrim, standardRateBank, step, turnRate } from '../../src/lessons/instrument-flight/attitude-model.mjs';
import { ILS, feetPerDot, glideSlopeHeight, ilsLimits, needles, scriptedApproach } from '../../src/lessons/instrument-flight/ils-model.mjs';

const fly = (s, input, seconds, dt = 0.05) => { for (let t = 0; t < seconds; t += dt) s = step(s, input, dt); return s; };

test('the invented trainer is in balance at its cruise trim', () => {
  const s = fly(initialState(), levelTrim(250), 30);
  assert.ok(Math.abs(s.speed - 250) < 0.5 && Math.abs(s.altitude - 5000) < 5 && Math.abs(s.vs) < 10);
});

test('attitude changes at once; the VSI lags the vertical speed (control and performance)', () => {
  const s = fly(initialState(), { pitch: 10, power: 70 }, 2);
  assert.ok(Math.abs(s.pitch - 10) < 1e-9, 'the attitude indicator is already there');
  assert.ok(s.vs > 0 && s.vsi < s.vs, `vs ${s.vs} vsi ${s.vsi}`);
});

test('turn rate is g·tan(bank)/speed: 30° at 250 kt is about 2.5°/s; standard rate bank grows with speed', () => {
  assert.ok(Math.abs(turnRate(30, 250) - 2.52) < 0.02);
  assert.ok(Math.abs(turnRate(standardRateBank(250), 250) - 3) < 1e-9);
  assert.ok(standardRateBank(300) > standardRateBank(150));
});

test('every unusual attitude picture has its own recovery, and the hub returns between spokes', () => {
  assert.equal(new Set(RECOVERIES).size, UNUSUAL.length);
  const order = hubAndSpoke(2);
  order.forEach((x, i) => assert.equal(x === 'adi', i % 2 === 0));
});

test('ILS needles: on the beams they centre; full scale is 2.5° and 0.7° (P-1204 p. 1-2) at two dots', () => {
  const on = needles({ range: 5, right: 0, height: glideSlopeHeight(5) });
  assert.ok(Math.abs(on.loc) < 1e-9 && Math.abs(on.gs) < 1e-9);
  const x = 5 * 6076;
  const full = needles({ range: 5, right: -Math.tan(2.5 * Math.PI / 180) * (x + ILS.runway + ILS.locBeyond), height: glideSlopeHeight(5) });
  assert.ok(Math.abs(full.loc - 2) < 1e-6, 'left of course: bar full right');
  assert.ok(needles({ range: 5, right: 0, height: glideSlopeHeight(5) - 100 }).gs > 0, 'low: glide slope above');
});

test('the same error in feet is more dots close in', () => {
  const far = needles({ range: 8, right: 300, height: glideSlopeHeight(8) });
  const near = needles({ range: 1, right: 300, height: glideSlopeHeight(1) });
  assert.ok(Math.abs(near.loc) > 2 * Math.abs(far.loc));
  assert.ok(feetPerDot(1).loc < feetPerDot(8).loc);
});

test('ILS limits (AFMAN 11-217 p. 210): full-scale localizer, one dot low, two dots high', () => {
  assert.equal(ilsLimits({ loc: 2, gs: 0 }).ok, false);
  assert.equal(ilsLimits({ loc: 0, gs: 1.2 }).ok, false);
  assert.equal(ilsLimits({ loc: 0, gs: -2 }).ok, false);
  assert.equal(ilsLimits({ loc: 0.5, gs: 0.8 }).ok, true);
  assert.equal(ilsLimits({ loc: 0, gs: -1.5 }).ok, true);
});

test('the scripted approach ends on the centerline and the glide slope', () => {
  const path = scriptedApproach();
  const end = path.at(-1);
  assert.ok(Math.abs(end.loc) < 0.2 && Math.abs(end.gs) < 0.3, JSON.stringify(end));
});
