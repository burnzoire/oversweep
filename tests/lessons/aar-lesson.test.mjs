import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BOOM, CALLS, CALL_OPTIONS, FLOWS, HOSE, SIGNALS, SIGNAL_OPTIONS, SPOTS,
  boomCall, directorLights, hoseState, inEnvelope, rvDelta, spotOf, turnRadiusNm,
} from '../../src/lessons/aar/lesson-model.mjs';

test('every flow step places both receivers on a spot that exists', () => {
  for (const [kind, flow] of Object.entries(FLOWS)) {
    assert.ok(flow.steps.length >= 4, kind);
    for (const step of flow.steps) {
      for (const [rx, at] of Object.entries(step.at)) {
        const p = spotOf(at);
        assert.ok(Array.isArray(p) && p.length === 2, `${kind} "${step.title}" ${rx}: ${JSON.stringify(at)}`);
      }
    }
  }
  assert.ok(SPOTS.astern.boom[1] > SPOTS.contact.boom[1], 'astern is aft of contact');
});

test('director lights and boom calls point the receiver toward the contact position', () => {
  const aftLow = directorLights({ x: 20, z: 3 });
  assert.equal(aftLow.fore.cmd, 'FORWARD');
  assert.equal(aftLow.fore.size, 2);
  assert.equal(aftLow.elevation.cmd, 'UP');
  assert.equal(aftLow.elevation.size, 1);
  const forwardHigh = directorLights({ x: -3, z: -6 });
  assert.equal(forwardHigh.fore.cmd, 'AFT');
  assert.equal(forwardHigh.elevation.cmd, 'DOWN');
  const onSpot = directorLights({ x: 0, z: 1 });
  assert.equal(onSpot.fore.cmd, null);
  assert.equal(onSpot.elevation.cmd, null);
  assert.equal(boomCall(BOOM.astern), 'FORWARD 50');
  assert.equal(boomCall({ x: 1, z: 4 }), 'UP 4');
  assert.equal(boomCall({ x: -2, z: 0 }), 'BACK 2');
  assert.equal(boomCall({ x: 0, z: 0 }), null);
  assert.ok(inEnvelope({ x: 0, z: 0 }) && !inEnvelope(BOOM.astern));
});

test('the drogue light goes green only between valve open and the end of the hose range', () => {
  assert.equal(hoseState(0, false).light, 'amber');
  assert.equal(hoseState(HOSE.valveOpen - 1, true).fuel, false);
  assert.equal(hoseState(HOSE.valveOpen, true).light, 'green');
  assert.equal(hoseState(HOSE.valveOpen + HOSE.range, true).fuel, true);
  assert.equal(hoseState(HOSE.valveOpen + HOSE.range + 1, true).fuel, false);
});

test('the point-parallel tanker rolls out on the receiver track the set distance ahead', () => {
  for (const tankerKt of [300, 380, 450]) {
    const rv = rvDelta({ tankerKt, receiverKt: tankerKt + 50 });
    const end = rv.at(rv.turnH);
    assert.ok(Math.abs(end.tanker[0]) < 1e-9, 'tanker on the receiver track');
    assert.ok(Math.abs(end.tanker[1] - end.receiver[1] - 1) < 1e-9, '1 NM ahead');
    assert.equal(end.tankerHdg, 0);
    const start = rv.at(0);
    assert.ok(Math.abs(Math.hypot(start.tanker[0] - start.receiver[0], start.tanker[1] - start.receiver[1]) - rv.turnRangeNm) < 1e-9);
  }
  // At 380 kt and 25° the radius is about 4.5 NM.
  assert.ok(Math.abs(turnRadiusNm(380, 25) - 4.5) < 0.1);
});

test('quiz answers are unique and every question explains itself', () => {
  for (const [items, options] of [[CALLS, CALL_OPTIONS], [SIGNALS, SIGNAL_OPTIONS]]) {
    assert.equal(new Set(options).size, options.length);
    for (const item of items) assert.ok(item.why.includes('[1'), item.q);
  }
});
