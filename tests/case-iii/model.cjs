const assert = require('node:assert/strict');
const m = require('../../src/experiences/case-iii/model.cjs');
const near = (a, b, tol, msg) => assert(Math.abs(a - b) <= tol, `${msg}: ${a} vs ${b} (±${tol})`);

// TAS from KIAS: independent ISA density ratios (sigma 0.8359 at 6,000 ft,
// 0.9654 at 1,200 ft). TAS = EAS / sqrt(sigma).
near(m.tasFromKias(250, 0), 250, 1e-9, 'sea level TAS');
near(m.tasFromKias(250, 6000), 250 / Math.sqrt(0.8359), 0.2, '6,000 ft TAS');
near(m.tasFromKias(135, 1200), 135 / Math.sqrt(0.9654), 0.1, '1,200 ft TAS');
assert.throws(() => m.tasFromKias(NaN, 0), RangeError);
assert.throws(() => m.tasFromKias(-1, 0), RangeError);
console.log('KIAS to TAS (ISA, IAS treated as EAS): PASS.');

// Velocity relative to the ship: 25 kt of airflow down the deck from the bow.
assert.equal(m.airflow(), 25);
assert.equal(m.airflow(m.CALM), 0);
const inbound = m.velocity(0, 273), outbound = m.velocity(180, 273), abeam = m.velocity(270, 273);
near(inbound.vy, -248, 1e-9, 'inbound closure');
near(outbound.vy, 298, 1e-9, 'outbound opening');
near(abeam.vx, -273, 1e-9, 'abeam x'); near(abeam.vy, 25, 1e-9, 'abeam drift');
// Crab: heading to make good a track 90° to the airflow is asin(25/273) into it.
const crab = m.headingForTrack(90, 273), crabbed = m.velocity(crab, 273);
near(crabbed.vy, 0, 1e-9, 'track held'); near(m.speedAlongTrack(90, 273), Math.sqrt(273 ** 2 - 25 ** 2), 1e-9, 'crabbed speed');
near(m.speedAlongTrack(0, 273), 248, 1e-9, 'inbound speed along track');
assert.equal(m.headingForTrack(37, 250, m.CALM), 37);
console.log('Ship-relative velocity, wind correction and speed along track: PASS.');

// Calm, stationary-ship baseline: 2-min turns + 1-min legs = 6 minutes at any TAS.
for (const tas of [250, 273.4, 300]) {
  const c = m.nominalCircuit({ tas, env: m.CALM, outbound: 60 }, 1);
  near(c.duration, 360, 0.3, `calm circuit at ${tas} KTAS`);
  near(m.outboundForMinuteInbound(tas, m.CALM), 60, 1e-9, 'calm outbound');
}
// Turn duration: 180° at 1.5°/s is 120 s.
{
  let st = { ...m.FIX, h: 0, leg: 'turnOut', legT: 0, circuit: 0 }, t = 0;
  while (st.leg === 'turnOut') { st = m.holdStep(st, 0.25, { tas: 273, env: m.CALM, outbound: 60 }).state; t += 0.25; }
  near(t, 120, 0.25, 'turn duration'); assert.equal(st.h, 180);
}
// Calm geometry: outbound leg displaced 2R to port, R = TAS*120/(pi*3600).
{
  const tas = 250, r = tas * 120 / Math.PI / 3600, c = m.nominalCircuit({ tas, env: m.CALM, outbound: 60 }, 1);
  near(Math.min(...c.points.map(p => p.x)), -2 * r, 0.01, 'calm racetrack width');
  near(Math.max(...c.points.map(p => p.y)), 21 + tas / 60 + r, 0.02, 'calm racetrack length');
}
console.log('Calm baseline: six-minute circuit, two-minute turns and racetrack geometry: PASS.');

// Moving ship and wind: closure condition for a 60 s inbound leg.
{
  const tas = m.tasFromKias(250, 6000), w = 25, o = m.outboundForMinuteInbound(tas);
  near(o, (60 * (tas - w) - 240 * w) / (tas + w), 1e-9, 'analytic outbound');
  const c = m.nominalCircuit({ tas, outbound: o }, 1);
  near(c.duration, 240 + o + 60, 1.5, 'wind circuit = turns + legs');
  const c60 = m.nominalCircuit({ tas, outbound: 60 }, 1);
  const tin = (60 * (tas + w) + 240 * w) / (tas - w);
  near(c60.duration, 300 + tin, 1.5, 'wind circuit with 60 s outbound');
  assert(c60.duration > 390 && c.duration < 335, 'airflow changes the circuit time');
}
console.log('25 kt airflow: inbound-leg closure and circuit times match independent arithmetic: PASS.');

// Elapsed-time/distance consistency: straight flight covers speed x time.
{
  let st = { x: 0, y: 21, h: 0, leg: 'in', legT: 0, circuit: 0 };
  st = { ...st, y: 30 };
  const r = m.holdStep(st, 60, { tas: 273, outbound: 60 });
  assert.equal(r.fixAt, null);
  near(30 - r.state.y, 248 / 60, 1e-6, 'one minute inbound at 248 kt closure');
}
console.log('Elapsed time and distance agree on a straight leg: PASS.');

// Hold entry continuity: the hold starts where the aircraft is, no jump.
{
  const s0 = m.holdStart(0.4, 21.3, 25), r = m.holdStep(s0, 0.1, { tas: 273, outbound: 30 });
  assert(Math.hypot(r.state.x - 0.4, r.state.y - 21.3) < 273 / 3600 * 0.1 + 0.01, 'no jump on entry');
  assert.throws(() => m.holdStart(NaN, 0, 0), RangeError);
}
// Exit continuity: the fix crossing is reported inside a step, at the fix.
{
  let st = m.holdStart(0, 21, 0), t = 0, crossing = null;
  while (crossing === null && t < 900) { const r = m.holdStep(st, 0.5, { tas: 273, outbound: 30 }); if (r.fixAt !== null) crossing = t + r.fixAt; st = r.state; t += 0.5; }
  assert(crossing !== null, 'circuit returns to the fix');
  near(Math.abs(st.x), 0, 0.05, 'on the inbound course at the fix');
  near(st.y, 21, 0.05, 'at the fix');
  near(crossing, m.timeToFix(m.holdStart(0, 21, 0), { tas: 273, outbound: 30 }), 0.3, 'prediction matches flown crossing');
}
console.log('Hold entry and fix-crossing continuity: PASS.');

// EAT planning: the solved outbound leg puts the crossing on the requested time.
for (const env of [m.CALM, m.ENV]) {
  const st = m.holdStart(0.2, 21.1, 10), params = { tas: 273, env };
  for (const target of [330, 380, 420]) {
    const o = m.outboundFor(st, params, target);
    assert(o !== null, `solvable ${target}`);
    near(m.timeToFix(st, { ...params, outbound: o }), target, 1, `crossing at ${target}`);
  }
  assert.equal(m.outboundFor(st, params, 60), null, 'too soon is unsolvable');
}
assert.equal(m.outboundFor({ ...m.FIX, h: 0, leg: 'in', legT: 0, circuit: 0 }, { tas: 273 }, 400), null, 'outbound leg already flown');
console.log('EAT outbound solution in calm and 25 kt airflow: PASS.');
