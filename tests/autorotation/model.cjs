const assert = require('node:assert/strict');
const M = require('../../src/experiences/autorotation/model.cjs');

// Hold an airspeed in a full-down autorotation long enough to settle, and
// report the steady descent (fpm, positive down) and rotor rpm.
function steadyAuto(kt, { fuel = 0.6, collective = 0 } = {}) {
  const s = M.failEngine(M.newState({ altitudeFt: 20000, speedKt: kt, fuel }));
  let cyclic = s.cyclic, last = 0;
  for (let i = 0; i < 1200; i++) {
    const error = s.u / M.KT - kt;
    cyclic -= 0.0002 * error + 0.02 * (error - last); last = error;
    M.step(s, { collective, cyclic }, 0.05);
  }
  return { sink: -s.w / M.FPM, rpm: s.rpm, kt: s.u / M.KT };
}

// A scripted pilot flying the textbook sequence: down collective, hold
// 60 kt, flare, level the skids, cushion with collective.
function fly(opts, { react = 0.3, flare = 60, flarePitch = 18 } = {}) {
  const s = M.failEngine(M.newState(opts));
  let collective = s.collective, last = s.u / M.KT, phase = 'glide';
  while (!s.onGround && s.t < 200) {
    if (s.t < react) { M.step(s, { collective, cyclic: s.cyclic }, 0.02); continue; }
    const ft = s.h / M.FT, kt = s.u / M.KT, acc = (kt - last) / 0.02; last = kt;
    if (phase === 'glide' && ft < flare) phase = 'flare';
    if (phase === 'flare' && ft < 10) phase = 'level';
    let pitch = phase === 'glide' ? -3 + 0.6 * (kt - 60) + 1.5 * acc : phase === 'flare' ? flarePitch : 3;
    if (phase === 'glide') collective = s.rpm > 107 ? collective + 0.008 : Math.max(0, collective - 0.033);
    if (ft < 6) collective = Math.min(1, Math.max(0, collective + 0.06 * (-s.w / M.FPM - 150) / 1000));
    pitch = Math.max(-20, Math.min(20, pitch));
    const cyclic = (-pitch - M.HELI.collectivePitchCoupling * (s.trimCollective - collective)) / M.HELI.pitchRange;
    M.step(s, { collective, cyclic }, 0.02);
  }
  return s;
}

// HFH 11-2: descent rate is high at zero airspeed, least around 50-60 kt in a
// typical helicopter, and rises again at higher speed.
const hover = steadyAuto(0), best = steadyAuto(50), fast = steadyAuto(110);
assert(hover.sink > best.sink + 800, `vertical ${hover.sink} vs 50 kt ${best.sink}`);
assert(fast.sink > best.sink + 500, `110 kt ${fast.sink} vs 50 kt ${best.sink}`);
assert(best.sink > 1200 && best.sink < 2400, `steady autorotation at 50 kt: ${best.sink} fpm`);
for (const r of [hover, best, fast]) assert(r.rpm > M.LIMITS.rpmGreenLow && r.rpm < M.LIMITS.rpmOverspeed, `rpm ${r.rpm}`);

// HFH 11-3: raising the collective lowers rotor rpm; heavier helicopters
// need more collective to control it (HFH 11-2).
assert(steadyAuto(55, { collective: 0.15 }).rpm < best.rpm - 3);
assert(steadyAuto(55, { fuel: 1 }).rpm > steadyAuto(55, { fuel: 0 }).rpm);

// Engine running: the trim holds level flight at 100% rpm.
const cruise = M.newState({ altitudeFt: 1000, speedKt: 90 });
const before = { h: cruise.h, u: cruise.u };
for (let i = 0; i < 100; i++) M.step(cruise, { collective: cruise.collective, cyclic: cruise.cyclic }, 0.05);
assert(Math.abs(cruise.h - before.h) < 3 && Math.abs(cruise.u - before.u) < 1 && Math.abs(cruise.rpm - 100) < 0.5);

// NAVWEPS 407 / HFH 11-2: with no collective reduction the rotor slows fast
// and keeps slowing until it is lost.
const late = M.failEngine(M.newState({ altitudeFt: 1000, speedKt: 90 }));
M.step(late, { collective: late.collective, cyclic: late.cyclic }, 2);
assert(late.rpm < M.LIMITS.rpmGreenLow, `rpm after 2 s unattended: ${late.rpm}`);
M.step(late, { collective: late.collective, cyclic: late.cyclic }, 3);
assert(late.rotorLost);

// The textbook sequence from cruise lands softly; a hover at 300 ft, in the
// low-and-slow area of a height-velocity diagram, does not.
const good = fly({ altitudeFt: 1000, speedKt: 90 });
assert(good.onGround && good.touchdown.sink < M.LIMITS.hardSink, `touchdown ${JSON.stringify(good.touchdown)}`);
assert.notEqual(M.grade(good.touchdown, good).result, 'failed');
const hv = fly({ altitudeFt: 300, speedKt: 0 });
assert(hv.touchdown.sink > M.LIMITS.crashSink, `300 ft hover: ${hv.touchdown.sink} fpm`);
assert.equal(M.grade(hv.touchdown, hv).result, 'failed');
// Slow reaction costs rotor rpm.
assert(fly({ altitudeFt: 1000, speedKt: 100 }, { react: 2 }).minRpm < fly({ altitudeFt: 1000, speedKt: 100 }).minRpm - 10);

// Grading thresholds and determinism.
const g = M.grade({ sink: 200, groundspeed: 10, pitch: 3 }, { minRpm: 95, maxRpm: 108 });
assert.equal(g.result, 'ok');
assert.equal(M.grade({ sink: 200, groundspeed: 10, pitch: 15 }).result, 'failed');
assert.equal(M.grade({ sink: 450, groundspeed: 10, pitch: 3 }).result, 'marginal');
assert.equal(M.grade({ sink: 200, groundspeed: 10, pitch: 3 }, { rotorLost: true }).result, 'failed');
assert.deepEqual(fly({ altitudeFt: 800, speedKt: 70 }).touchdown, fly({ altitudeFt: 800, speedKt: 70 }).touchdown);

console.log('Autorotation model: descent-rate curve, rpm control, trim, rpm decay, textbook and H/V landings, grading: PASS.');
