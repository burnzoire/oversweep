/* Pure, deterministic motion and marshal-hold model for the Case III trainer.
 *
 * Frame: carrier-relative. Headings are degrees relative to BRC (0 = flying
 * the ship's course); x is NM to starboard, y is NM astern. Mother's TACAN
 * moves with the ship, so the marshal fix (0, 21) moves with it too.
 *
 * Airspeed: displayed KIAS is converted to true airspeed with the ISA density
 * ratio, treating IAS as equivalent airspeed (no instrument, position or
 * compressibility error). Below 10,000 ft at 250 KIAS that omission is a few
 * knots at most.
 *
 * Wind and ship: fixed exercise assumptions, not procedure values. The ship
 * steams on BRC at `shipKnots`; the natural wind blows from BRC at
 * `windKnots`. In the carrier frame both add up to an axial airflow from the
 * bow that carries the aircraft astern at shipKnots + windKnots.
 *
 * Hold: left-hand racetrack, 180° turns at 1.5°/s (two-minute turns), the
 * inbound leg flown on BRC to pass over the fix, and an outbound leg whose
 * length the pilot sets to manage the push time. With no relative airflow a
 * 60 s outbound leg gives the six-minute pattern; with airflow the same
 * timing gives a different circuit, which is the point of managing it.
 */
(function (root) {
  'use strict';
  const D = Math.PI / 180;
  const HOLD_TURN_RATE = 1.5; // deg/s: 180° in 120 s
  const INTERCEPT_TURN_RATE = 3; // deg/s, the trainer's normal heading change rate
  const FIX = Object.freeze({ x: 0, y: 21 });
  const ENV = Object.freeze({ shipKnots: 15, windKnots: 10 });
  const CALM = Object.freeze({ shipKnots: 0, windKnots: 0 });
  const MAX_STEP = 0.25;

  const norm = a => (a % 360 + 360) % 360;
  const delta = (target, current) => ((target - current + 540) % 360) - 180;
  const finite = (...values) => values.every(Number.isFinite);

  function tasFromKias(kias, altitudeFt) {
    if (!finite(kias, altitudeFt) || kias < 0) throw new RangeError('KIAS and altitude must be finite; KIAS non-negative.');
    const h = Math.min(Math.max(altitudeFt, 0), 36089);
    const sigma = Math.pow(1 - 6.8756e-6 * h, 4.2559);
    return kias / Math.sqrt(sigma);
  }

  function airflow(env = ENV) {
    return env.shipKnots + env.windKnots;
  }

  /* Velocity relative to the ship, knots: vx starboard, vy astern. */
  function velocity(relHeading, tas, env = ENV) {
    return { vx: tas * Math.sin(relHeading * D), vy: -tas * Math.cos(relHeading * D) + airflow(env) };
  }

  /* Heading that makes good `relTrack` over the moving deck. */
  function headingForTrack(relTrack, tas, env = ENV) {
    const w = airflow(env);
    if (tas <= 0) return norm(relTrack);
    const s = Math.max(-1, Math.min(1, (w * Math.sin(relTrack * D)) / tas));
    return norm(relTrack - Math.asin(s) / D);
  }

  /* Speed made good along `relTrack` relative to the ship, knots. */
  function speedAlongTrack(relTrack, tas, env = ENV) {
    const h = headingForTrack(relTrack, tas, env);
    return tas * Math.cos((h - relTrack) * D) - airflow(env) * Math.cos(relTrack * D);
  }

  function advance(p, relHeading, tas, env, dt) {
    const v = velocity(relHeading, tas, env);
    return { x: p.x + v.vx / 3600 * dt, y: p.y + v.vy / 3600 * dt };
  }

  /* Outbound time that gives a 60 s inbound leg in a steady axial airflow:
   * astern drift over the circuit must equal the leg difference. */
  function outboundForMinuteInbound(tas, env = ENV) {
    const w = airflow(env);
    return Math.max(0, (60 * (tas - w) - 240 * w) / (tas + w));
  }

  function holdStart(x, y, relHeading) {
    if (!finite(x, y, relHeading)) throw new RangeError('Hold start must be finite.');
    return { x, y, h: norm(relHeading), leg: 'entry', legT: 0, circuit: 0 };
  }

  /* Air-mass turn radius at the hold rate; axial airflow adds no lateral drift. */
  function holdRadius(tas) {
    return tas / 3600 * (180 / HOLD_TURN_RATE) / Math.PI;
  }

  function turnLeft(h, rate, dt) {
    return norm(h - rate * dt);
  }

  /* One integration step of at most MAX_STEP seconds. */
  function holdSubstep(st, dt, tas, env, outbound) {
    let { x, y, h, leg, legT, circuit } = st;
    let passedFix = false;
    legT += dt;
    if (leg === 'entry') {
      // Turn onto the outbound heading in whichever direction reaches the
      // outbound course (2R to port of the inbound course) sooner.
      const outH = headingForTrack(180, tas, env);
      if (!st.dir) {
        // Fly both entries ahead (shortest outbound leg) and keep the quicker.
        const left = timeToFix({ ...st, dir: -1 }, { tas, env, outbound: 0 }) ?? Infinity;
        const right = timeToFix({ ...st, dir: 1 }, { tas, env, outbound: 0 }) ?? Infinity;
        st = { ...st, dir: left <= right ? -1 : 1 };
      }
      const remaining = st.dir < 0 ? norm(h - outH) : norm(outH - h), turn = Math.min(remaining, HOLD_TURN_RATE * dt);
      h = norm(h + st.dir * turn);
      if (remaining - turn < 1e-6) { h = outH; leg = 'out'; legT = 0; }
    } else if (leg === 'turnOut') {
      const outH = headingForTrack(180, tas, env), remaining = norm(h - outH);
      if (remaining <= HOLD_TURN_RATE * dt) { h = outH; leg = 'out'; legT = 0; } else h = turnLeft(h, HOLD_TURN_RATE, dt);
    } else if (leg === 'out') {
      // Track the outbound course, 2R to port of the inbound course, so the
      // inbound turn rolls out on it. After an entry the intercept comes
      // first; the timed leg starts once established on the course.
      const offset = x + 2 * holdRadius(tas), want = norm(headingForTrack(180, tas, env) + Math.max(-30, Math.min(30, offset * 40)));
      h = norm(h + Math.max(-INTERCEPT_TURN_RATE * dt, Math.min(INTERCEPT_TURN_RATE * dt, delta(want, h))));
      if (Math.abs(offset) >= 0.1) legT = 0; // timing starts once on the outbound course
      else if (legT >= outbound) { leg = 'turnIn'; legT = 0; }
    } else if (leg === 'turnIn') {
      const inH = headingForTrack(0, tas, env), remaining = norm(h - inH);
      if (remaining <= HOLD_TURN_RATE * dt || remaining > 359) { h = inH; leg = 'in'; legT = 0; } else h = turnLeft(h, HOLD_TURN_RATE, dt);
    } else if (leg === 'in') {
      // Track the inbound course (x = 0) toward the fix: up to 30° intercept.
      const want = norm(headingForTrack(0, tas, env) - Math.max(-30, Math.min(30, x * 40)));
      h = norm(h + Math.max(-INTERCEPT_TURN_RATE * dt, Math.min(INTERCEPT_TURN_RATE * dt, delta(want, h))));
    }
    const p = advance({ x, y }, h, tas, env, dt);
    if (leg === 'in' && y > FIX.y && p.y <= FIX.y) {
      passedFix = true; leg = 'turnOut'; legT = 0; circuit += 1;
    }
    return { state: { x: p.x, y: p.y, h, leg, legT, circuit, ...(leg === 'entry' ? { dir: st.dir } : {}) }, passedFix };
  }

  /* Advance the hold by dt seconds. Returns the new state and, if the
   * aircraft crossed the fix inbound, the elapsed time at the crossing. */
  function holdStep(state, dt, params) {
    const { tas, env = ENV, outbound } = params;
    if (!finite(dt, tas, outbound) || dt < 0 || tas <= 0 || outbound < 0) throw new RangeError('Hold step needs finite dt, TAS > 0 and outbound >= 0.');
    let st = state, elapsed = 0, fixAt = null;
    while (elapsed < dt - 1e-9) {
      const step = Math.min(MAX_STEP, dt - elapsed);
      const r = holdSubstep(st, step, tas, env, outbound);
      st = r.state; elapsed += step;
      if (r.passedFix && fixAt === null) fixAt = elapsed;
    }
    return { state: st, fixAt };
  }

  /* Seconds until the next inbound fix crossing, or null beyond maxSeconds. */
  function timeToFix(state, params, maxSeconds = 1800) {
    let st = state, t = 0;
    while (t < maxSeconds) {
      const r = holdStep(st, 1, params);
      if (r.fixAt !== null) return t + r.fixAt;
      st = r.state; t += 1;
    }
    return null;
  }

  /* Outbound leg (s) that puts the next fix crossing `seconds` from now,
   * or null when no leg from 0 to maxOutbound can. Only meaningful before
   * the outbound leg ends. */
  function outboundFor(state, params, seconds, maxOutbound = 240) {
    if (state.leg !== 'entry' && state.leg !== 'turnOut' && state.leg !== 'out') return null;
    const at = o => timeToFix(state, { ...params, outbound: o });
    const lo = at(0), hi = at(maxOutbound);
    if (lo === null || hi === null || seconds < lo || seconds > hi) return null;
    let a = 0, b = maxOutbound;
    for (let i = 0; i < 30; i++) { const m = (a + b) / 2; if (at(m) < seconds) a = m; else b = m; }
    return (a + b) / 2;
  }

  /* A full circuit started at the fix inbound: duration and path points. */
  function nominalCircuit(params, sampleEvery = 3) {
    let st = { ...FIX, h: headingForTrack(0, params.tas, params.env ?? ENV), leg: 'turnOut', legT: 0, circuit: 0 };
    const points = [{ x: st.x, y: st.y }];
    for (let t = 0; t < 1800; t += sampleEvery) {
      const r = holdStep(st, sampleEvery, params);
      st = r.state;
      if (r.fixAt !== null) { points.push({ ...FIX }); return { duration: t + r.fixAt, points }; }
      points.push({ x: st.x, y: st.y });
    }
    return { duration: null, points };
  }

  const api = Object.freeze({ ENV, CALM, FIX, HOLD_TURN_RATE, tasFromKias, airflow, velocity, headingForTrack, speedAlongTrack, outboundForMinuteInbound, holdStart, holdStep, timeToFix, outboundFor, nominalCircuit });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CaseIIIModel = api;
})(globalThis);
