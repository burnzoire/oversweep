/* Profile-view flight model for an invented light single-engine helicopter.
 * Two dimensions: x forward along the ground, z up. SI units inside, knots,
 * feet and percent at the edges. Every number in HELI and LIMITS is invented
 * for the exercise: no real type's performance, inertia or limits.
 *
 * The rotor is a uniform-inflow blade-element model: thrust from collective
 * pitch and inflow, rotor power from induced, climb and profile terms, and
 * rotor rpm from the balance of engine power and rotor power on an invented
 * rotor inertia. Induced velocity follows momentum theory, with Johnson's
 * empirical curve where momentum theory fails in a slow descent, and a
 * ground-effect reduction near the ground. The cyclic sets a pitch attitude
 * the fuselage follows with a short lag; the disk tilts with the fuselage.
 * Educational model only, not validated against any helicopter.
 */
(function (root) {
  'use strict';
  const KT = 0.514444, FT = 0.3048, FPM = FT / 60, G = 9.80665, RHO = 1.225;
  const DEG = Math.PI / 180;

  const HELI = Object.freeze({
    emptyMass: 1100,          // kg, with crew
    fuelMass: 180,            // kg at full fuel
    radius: 5.0,              // m
    tipSpeed: 205,            // m/s at 100% rotor rpm
    solidity: 0.045,
    liftSlope: 5.7,           // per radian
    profileDrag: 0.009,       // blade section drag coefficient
    stallCtSigma: 0.12,       // blade loading where the rotor stalls
    inertia: 700,             // kg m², rotor
    inducedFactor: 1.15,
    flatPlate: 0.85,          // m², fuselage drag in forward flight
    flatPlateVertical: 3.5,   // m², fuselage drag in a vertical descent
    pitchLow: 1.0 * DEG,      // collective full down, 75% radius
    pitchHigh: 13 * DEG,      // collective full up
    engineMaxPower: 190e3,    // W
    accessoryPower: 6e3,      // W, tail rotor and transmission at 100% rpm
    mastHeight: 2.6,          // m, rotor hub above the skids
    pitchRange: 25,           // degrees of attitude for full cyclic travel
    pitchLag: 0.55,           // s
    collectivePitchCoupling: 9, // degrees nose down as the collective goes from cruise to full down
  });

  const LIMITS = Object.freeze({
    rpmGreenLow: 90, rpmGreenHigh: 108, rpmOverspeed: 115, rpmUnrecoverable: 70,
    softSink: 300, hardSink: 600, crashSink: 900,   // fpm at touchdown
    slowRun: 20, fastRun: 40,                       // kt groundspeed at touchdown
    tailStrikePitch: 12, noseLowPitch: -6,          // degrees at touchdown
    flareHeight: 60, levelHeight: 12,               // ft, the instructor's cues
  });

  const area = Math.PI * HELI.radius ** 2;
  const omega100 = HELI.tipSpeed / HELI.radius;
  const massFor = fuel => HELI.emptyMass + HELI.fuelMass * clamp(fuel, 0, 1);
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // Induced velocity ratio v = vi / vh against the axial flow x = Vn / vh
  // (positive down through the disk, as in a climb) and the edgewise flow
  // t = Vt / vh. Momentum theory where it holds; Johnson's empirical fit in
  // the vortex-ring and turbulent-wake states of a slow descent.
  function axialInduced(x) {
    if (x >= 0) return -x / 2 + Math.sqrt(x * x / 4 + 1);
    if (x <= -2) return -x / 2 - Math.sqrt(x * x / 4 - 1);
    return 1 - 1.125 * x - 1.372 * x * x - 1.718 * x ** 3 - 0.655 * x ** 4;
  }
  function momentumInduced(x, t) {
    let v = 1 / Math.max(t, 1);
    for (let i = 0; i < 30; i++) {
      const s = Math.sqrt(t * t + (x + v) ** 2);
      const f = v * s - 1, df = s + v * (x + v) / s;
      v = Math.max(1e-4, v - f / df);
    }
    return v;
  }
  function inducedRatio(x, t) {
    const edge = 1.6;
    if (t >= edge) return momentumInduced(x, t);
    const w = (t / edge) ** 2 * (3 - 2 * t / edge);
    return (1 - w) * axialInduced(x) + w * momentumInduced(x, Math.max(t, 0.05));
  }

  // Rotor thrust and power at one instant. The disk normal is tilted forward
  // by the nose-down pitch attitude.
  function rotor(state) {
    const omega = Math.max(state.rpm / 100 * omega100, 1);
    const tip = omega * HELI.radius;
    const tilt = -state.pitch * DEG;
    const nx = Math.sin(tilt), nz = Math.cos(tilt);
    const through = state.u * nx + state.w * nz;             // + down through the disk
    const edgewise = Math.abs(state.u * nz - state.w * nx);
    const mu = edgewise / tip, lc = through / tip;
    const pitch = HELI.pitchLow + (HELI.pitchHigh - HELI.pitchLow) * clamp(state.collective, 0, 1);
    const k = HELI.solidity * HELI.liftSlope / 2;
    const hub = Math.max(state.h + HELI.mastHeight, 0.5);
    const ground = hub > HELI.radius / 4 ? 1 - (HELI.radius / (4 * hub)) ** 2 : 0;
    let ct = 0, li = 0.03;
    for (let i = 0; i < 40; i++) {
      const target = k * (pitch * (1 / 3 + mu * mu / 2) - (lc + li) / 2);
      ct += 0.5 * (target - ct);
      const vh = Math.sqrt(Math.max(Math.abs(ct) * RHO * area * tip * tip, 1) / (2 * RHO * area));
      const v = inducedRatio(through / vh, edgewise / vh) * vh * ground * Math.sign(ct || 1);
      li += 0.5 * (v / tip - li);
    }
    const stallLimit = HELI.stallCtSigma * HELI.solidity;
    // Once rotor rpm has decayed past recovery the blades stay stalled and
    // the rotor gives only a fraction of its thrust.
    const stalled = ct > stallLimit || Boolean(state.rotorLost);
    const ctUsed = Math.min(ct, stallLimit) * (state.rotorLost ? 0.3 : 1);
    // Past the stall the blades keep the drag of the higher angle of attack.
    const stallDrag = stalled ? 1 + 30 * (ct / stallLimit - 1) : 1;
    const cp0 = HELI.solidity * HELI.profileDrag / 8 * (1 + 4.6 * mu * mu) * stallDrag;
    const cp = ctUsed * (lc + HELI.inducedFactor * li) + cp0;
    const scale = RHO * area * tip * tip;
    return { thrust: ctUsed * scale, power: cp * scale * tip, ctSigma: ct / HELI.solidity, stalled, tilt, ground };
  }

  function newState({ altitudeFt = 1000, speedKt = 80, fuel = 0.6 } = {}) {
    const state = {
      t: 0, x: 0, h: altitudeFt * FT, u: speedKt * KT, w: 0, rpm: 100, engineRpm: 100,
      pitch: 0, cyclic: 0, collective: 0.5, mass: massFor(fuel), engine: true, onGround: false,
    };
    return trim(state);
  }

  // Collective and attitude for steady level flight with the engine running.
  function trim(state) {
    const residual = (c, p) => {
      const r = rotor({ ...state, collective: c, pitch: p, w: 0 });
      const drag = 0.5 * RHO * HELI.flatPlate * state.u * state.u;
      return [r.thrust * Math.sin(r.tilt) - drag, r.thrust * Math.cos(r.tilt) - state.mass * G];
    };
    let c = 0.5, p = -state.u / KT / 20;
    for (let i = 0; i < 40; i++) {
      const [f1, f2] = residual(c, p);
      const d = 1e-4;
      const [a1, a2] = residual(c + d, p), [b1, b2] = residual(c, p + d * 50);
      const j11 = (a1 - f1) / d, j21 = (a2 - f2) / d, j12 = (b1 - f1) / (d * 50), j22 = (b2 - f2) / (d * 50);
      const det = j11 * j22 - j12 * j21;
      if (!det) break;
      c -= (f1 * j22 - f2 * j12) / det;
      p -= (j11 * f2 - j21 * f1) / det;
      c = clamp(c, 0, 1); p = clamp(p, -HELI.pitchRange, HELI.pitchRange);
    }
    Object.assign(state, { collective: c, pitch: p, cyclic: pitchToCyclic(p, c, c) });
    state.trimCollective = c;
    return state;
  }

  // Cyclic +1 is full forward. The attitude it sets drops as the collective
  // goes down from its trimmed cruise position, so holding the nose up after
  // a collective reduction needs aft cyclic.
  function targetPitch(cyclic, collective, trimCollective) {
    return -HELI.pitchRange * clamp(cyclic, -1, 1) - HELI.collectivePitchCoupling * clamp(trimCollective - collective, -1, 1);
  }
  function pitchToCyclic(pitch, collective, trimCollective) {
    return clamp(-(pitch + HELI.collectivePitchCoupling * (trimCollective - collective)) / HELI.pitchRange, -1, 1);
  }

  function failEngine(state) { state.engine = false; return state; }

  // Advance by dt seconds with the controls in `input` ({collective, cyclic}, both clamped).
  function step(state, input, dt) {
    if (state.onGround) return state;
    state.collective = clamp(input.collective, 0, 1);
    state.cyclic = clamp(input.cyclic, -1, 1);
    const sub = Math.max(1, Math.ceil(dt / 0.01)), h = dt / sub;
    for (let i = 0; i < sub && !state.onGround; i++) integrate(state, h);
    return state;
  }

  function integrate(state, dt) {
    const r = rotor(state);
    const omega = Math.max(state.rpm / 100 * omega100, 1);
    const accessory = HELI.accessoryPower * (state.rpm / 100) ** 3;
    // Governed engine: holds 100% while power lasts. A failed engine winds
    // down and the freewheeling unit leaves the rotor turning on its own.
    let engine = 0;
    if (state.engine) {
      engine = clamp(r.power + accessory + (100 - state.rpm) * 4e4, 0, HELI.engineMaxPower);
      state.engineRpm = state.rpm;
    } else {
      state.engineRpm = Math.max(0, state.engineRpm - 35 * dt);
    }
    const domega = (engine - r.power - accessory) / (HELI.inertia * omega);
    state.rpm = Math.max(0, state.rpm + domega / omega100 * 100 * dt);
    if (!state.engine) {
      state.minRpm = Math.min(state.minRpm ?? 100, state.rpm);
      state.maxRpm = Math.max(state.maxRpm ?? 100, state.rpm);
      if (state.rpm < LIMITS.rpmUnrecoverable) state.rotorLost = true;
    }

    const dragX = 0.5 * RHO * HELI.flatPlate * Math.abs(state.u) * state.u;
    const dragZ = 0.5 * RHO * HELI.flatPlateVertical * Math.abs(state.w) * state.w;
    const ax = (r.thrust * Math.sin(r.tilt) - dragX) / state.mass;
    const az = (r.thrust * Math.cos(r.tilt) - dragZ) / state.mass - G;
    state.u += ax * dt; state.w += az * dt;
    state.x += state.u * dt; state.h += state.w * dt;

    const goal = targetPitch(state.cyclic, state.collective, state.trimCollective);
    state.pitch += (goal - state.pitch) * Math.min(1, dt / HELI.pitchLag);
    state.t += dt;
    state.stalled = r.stalled;
    state.ground = r.ground;
    if (state.h <= 0) {
      state.h = 0;
      state.onGround = true;
      state.touchdown = { sink: -state.w / FPM, groundspeed: state.u / KT, pitch: state.pitch, rpm: state.rpm, t: state.t };
    }
  }

  // Readouts in the units the cockpit shows.
  function readout(state) {
    return {
      airspeed: state.u / KT, altitude: state.h / FT, vsi: state.w / FPM, rpm: state.rpm,
      engineRpm: state.engineRpm, pitch: state.pitch, collective: state.collective, cyclic: state.cyclic,
    };
  }

  // Touchdown verdict: each item is ok, marginal or failed, with a reason.
  function grade(touchdown, history = {}) {
    const items = [];
    if (history.rotorLost) items.push(['failed', `Rotor rpm fell below ${LIMITS.rpmUnrecoverable}%: the blades stalled and could not recover.`]);
    const sink = touchdown.sink, gs = Math.abs(touchdown.groundspeed), p = touchdown.pitch;
    items.push(sink <= LIMITS.softSink ? ['ok', `Touchdown at ${Math.round(sink)} fpm: cushioned.`]
      : sink <= LIMITS.hardSink ? ['marginal', `Touchdown at ${Math.round(sink)} fpm: firm.`]
      : sink <= LIMITS.crashSink ? ['failed', `Touchdown at ${Math.round(sink)} fpm: hard landing, likely damage.`]
      : ['failed', `Touchdown at ${Math.round(sink)} fpm: crash.`]);
    items.push(gs <= LIMITS.slowRun ? ['ok', `Groundspeed ${Math.round(gs)} kt: a slow run-on.`]
      : gs <= LIMITS.fastRun ? ['marginal', `Groundspeed ${Math.round(gs)} kt: a long ground run.`]
      : ['failed', `Groundspeed ${Math.round(gs)} kt: too fast for the skids.`]);
    items.push(p > LIMITS.tailStrikePitch ? ['failed', `Pitch ${p.toFixed(0)}° nose up: tail strike.`]
      : p < LIMITS.noseLowPitch ? ['failed', `Pitch ${Math.abs(p).toFixed(0)}° nose down: the skid toes dig in.`]
      : ['ok', `Pitch ${p.toFixed(0)}°: close to level.`]);
    if (history.minRpm !== undefined)
      items.push(history.minRpm < LIMITS.rpmGreenLow ? ['marginal', `Rotor rpm fell to ${Math.round(history.minRpm)}% in the descent.`]
        : ['ok', `Rotor rpm stayed at or above ${Math.round(history.minRpm)}%.`]);
    if (history.maxRpm !== undefined && history.maxRpm > LIMITS.rpmOverspeed)
      items.push(['marginal', `Rotor overspeed to ${Math.round(history.maxRpm)}%.`]);
    const worst = items.some(i => i[0] === 'failed') ? 'failed' : items.some(i => i[0] === 'marginal') ? 'marginal' : 'ok';
    return { result: worst, items };
  }

  const api = Object.freeze({ HELI, LIMITS, KT, FT, FPM, newState, failEngine, step, rotor, readout, grade, targetPitch, inducedRatio });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AutorotationModel = api;
})(globalThis);
