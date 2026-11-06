import assert from 'node:assert/strict';
import test from 'node:test';
import { ATTACK_STEPS, EXAMPLE, GEO_QUESTIONS, TLE_CATS, codesMatch, groundMissFt, headingsInZone, laserZone, offDeg, spillFraction, spotDiameterM, tleCat } from '../../src/lessons/precision-targeting/lesson-model.mjs';

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('bearing difference wraps through north', () => {
  assert.equal(offDeg(350, 10), 20);
  assert.equal(offDeg(10, 350), 20);
  assert.equal(offDeg(200, 20), 180);
});

test('laser zones follow JP 3-09.3 Figure III-9: 20° safety wedge, 10–45° preferred, 120° attack zone', () => {
  assert.equal(laserZone(205, 200).zone, 'safety');
  assert.equal(laserZone(195, 200).zone, 'safety');
  assert.equal(laserZone(210, 200).zone, 'preferred');
  assert.equal(laserZone(245, 200).zone, 'preferred');
  assert.equal(laserZone(250, 200).zone, 'attack');
  assert.equal(laserZone(260, 200).zone, 'attack');
  assert.equal(laserZone(261, 200).zone, 'outside');
  assert.equal(laserZone(20, 200).zone, 'outside');
  assert.equal(laserZone(358, 5).zone, 'safety');
});

test('the worked attack is consistent: every briefed heading is in the attack zone, the IN heading is preferred', () => {
  assert.ok(headingsInZone(EXAMPLE.fah[0], EXAMPLE.fah[1], EXAMPLE.laserTargetLine));
  assert.equal(laserZone(EXAMPLE.inHeading, EXAMPLE.laserTargetLine).zone, 'preferred');
  assert.ok(EXAMPLE.inHeading >= EXAMPLE.fah[0] && EXAMPLE.inHeading <= EXAMPLE.fah[1]);
  const said = ATTACK_STEPS.map((s) => s.said).join(' ');
  assert.match(said, new RegExp(`laser target line ${EXAMPLE.laserTargetLine}`));
  assert.match(said, new RegExp(`IN heading ${EXAMPLE.inHeading}`));
  assert.match(said, new RegExp(`time of fall ${EXAMPLE.timeOfFall} seconds`));
  assert.ok(said.split(EXAMPLE.code).length > 3, 'the code is used throughout');
  // The briefed window's offsets quoted in the step are right.
  const offs = [EXAMPLE.fah[0], EXAMPLE.fah[1]].map((h) => laserZone(h, EXAMPLE.laserTargetLine).off).sort((a, b) => a - b);
  assert.match(said, new RegExp(`${offs[0]}° to ${offs[1]}° off`));
  assert.match(said, new RegExp(`${laserZone(EXAMPLE.inHeading, EXAMPLE.laserTargetLine).off}° off the line`));
  assert.equal(headingsInZone(195, 215, 200), false);
});

test('beam divergence matches the one-milliradian example (JP 3-09.3, p. III-53)', () => {
  near(spotDiameterM(1000), 1, 1e-9);
  near(spotDiameterM(3000), 3, 1e-9);
  assert.equal(spillFraction(1, 3), 0);
  assert.equal(spillFraction(3, 3), 0, 'a round spot as wide as the box still fits inside it');
  assert.ok(spillFraction(3.5, 3) > 0);
  near(spillFraction(6, 3), 1 - 9 / (Math.PI * 9), 0.02);
});

test('impact angle: a steeper angle shrinks the miss from the same vertical error', () => {
  near(groundMissFt(20, 45), 20, 1e-9);
  assert.equal(groundMissFt(20, 90), 0);
  assert.ok(Math.abs(groundMissFt(20, 30)) > Math.abs(groundMissFt(20, 60)));
  assert.ok(groundMissFt(20, 30) > 0, 'too high goes long');
  assert.ok(groundMissFt(-20, 30) < 0, 'too low goes short');
  assert.throws(() => groundMissFt(10, 0), RangeError);
});

test('TLE categories follow JP 3-09.3 Figure III-5', () => {
  assert.deepEqual(TLE_CATS.map((c) => c.cat), ['I', 'II', 'III', 'IV', 'V', 'VI']);
  assert.equal(tleCat(20), 'I');
  assert.equal(tleCat(21), 'II');
  assert.equal(tleCat(40), 'II');
  assert.equal(tleCat(100), 'III');
  assert.equal(tleCat(301), 'V');
  assert.equal(tleCat(5000), 'VI');
});

test('laser codes must match and be four digits', () => {
  assert.equal(codesMatch({ designator: '1688', weapon: '1688' }).ok, true);
  assert.equal(codesMatch({ designator: '1511', weapon: '1688' }).ok, false);
  assert.equal(codesMatch({ designator: '1511', tracker: '1512' }).ok, false);
  assert.equal(codesMatch({ designator: '688', weapon: '688' }).ok, false);
});

test('every question has its answer among the options and an outcome 1–6', () => {
  for (const q of GEO_QUESTIONS) {
    assert.ok(q.options.includes(q.answer), q.ask);
    assert.ok(q.outcome >= 1 && q.outcome <= 6);
  }
  // Geometry questions agree with the model.
  const label = { preferred: 'Yes: preferred', attack: 'Yes: inside the attack zone', safety: 'No: inside the safety zone', outside: 'No: outside the attack zone' };
  for (const q of GEO_QUESTIONS.filter((x) => x.ask.startsWith('Laser target line 200'))) {
    const hdg = Number(q.ask.match(/heading (?:of )?(\d+)/)[1]);
    assert.equal(q.answer, label[laserZone(hdg, 200).zone], q.ask);
  }
  assert.equal(tleCat(40), GEO_QUESTIONS.find((q) => q.ask.includes('40 ft')).answer.replace('CAT ', ''));
});
