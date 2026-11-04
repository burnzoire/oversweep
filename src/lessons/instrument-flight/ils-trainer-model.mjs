// The instrument trainer's hand-flown ILS run: a random start and wind, the
// aircraft flown by the attitude model, the needles from the ILS model, and
// the score at the DA. Pure functions, so the browser and the tests share it.
//
// Sourced: the needle scaling (ils-model.mjs) and the limits: discontinue on
// full-scale localizer; do not descend below localizer minimums more than one
// dot low or two dots high (AFMAN 11-217 Vol 1, p. 210); below the DA only
// with the runway environment in sight and in position to land (p. 209).
// Invented for the exercise and labelled so: the aircraft (attitude-model.mjs),
// the approach speed, the field elevation, the DA and localizer minimums, the
// wind and start ranges, how often the runway is in sight, and "in position"
// meaning within one dot on both needles at the DA.
import { levelTrim, initialState, norm, step } from './attitude-model.mjs';
import { ILS, FT_PER_NM, feetPerDot, glideSlopeHeight, needles } from './ils-model.mjs';

const D = Math.PI / 180;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export const RUN = Object.freeze({
  speed: 140, // KIAS on final, invented; true airspeed taken as equal
  dragK: 3, // gear and flaps down: three times the clean drag, invented
  tdze: 400, // ft, touchdown zone elevation, invented
  da: ILS.daHeight, // ft above the touchdown zone (DA 600 ft on the altimeter)
  locMins: 400, // ft above the touchdown zone, invented localizer minimums
  startNm: [3.8, 4.4], // range at the start: about 90 seconds to the DA
  startLocDots: [0.6, 1.6], // localizer offset at the start, either side
  startGsDots: [0.6, 1.3], // below the glide slope at the start (intercept from below)
  intercept: [20, 30], // degrees of intercept heading
  windKt: [0, 25],
  visualChance: 0.6, // chance the runway environment is in sight at the DA
  decisionSeconds: 3, // time to decide at the DA
  sampleEvery: 0.25, // s between recorded samples
});

// A small seedable random generator, so a run can be repeated.
export function rng(seed = Date.now()) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const between = (r, [lo, hi]) => lo + r() * (hi - lo);

/** A new run: a random course, wind and start offset. */
export function newRun(seed = Date.now()) {
  const r = rng(seed);
  const course = 10 * (1 + Math.floor(r() * 36));
  const windFrom = Math.round(r() * 36) * 10 || 360;
  const windKt = Math.round(between(r, RUN.windKt));
  const range = between(r, RUN.startNm);
  const side = r() < 0.5 ? -1 : 1; // +1: right of the course
  const per = feetPerDot(range);
  const right = side * between(r, RUN.startLocDots) * per.loc;
  const height = glideSlopeHeight(range) - between(r, RUN.startGsDots) * per.gs;
  const heading = norm(course - side * Math.round(between(r, RUN.intercept)));
  const trim = levelTrim(RUN.speed, { dragK: RUN.dragK });
  const s = initialState({ ...trim, speed: RUN.speed, heading, altitude: RUN.tdze + height, drag: RUN.dragK });
  const visual = r() < RUN.visualChance;
  const run = {
    seed, course, windFrom, windKt, visual,
    s, pos: { range, right, height },
    input: { pitch: trim.pitch, bank: 0, power: trim.power },
    t: 0, nextSample: 0, samples: [],
    capturedAt: undefined, inside: 0, tracked: 0,
    worst: { loc: 0, low: 0, high: 0 }, speedRange: [RUN.speed, RUN.speed],
    busts: [], phase: 'flying', decision: undefined, decisionAt: undefined,
  };
  record(run);
  return run;
}

export const wind = (run) => ({ from: run.windFrom, kt: run.windKt });

// Crosswind (from the right positive) and headwind components on the course.
export function windComponents(run) {
  const rel = (run.windFrom - run.course) * D;
  return { cross: run.windKt * Math.sin(rel), head: run.windKt * Math.cos(rel) };
}
// The heading that holds the course in this wind at the approach speed.
export const driftCorrection = (run) => Math.asin(clamp(windComponents(run).cross / RUN.speed, -1, 1)) / D;

function record(run) {
  const { s, pos } = run, n = needles(pos);
  run.needles = n;
  if (run.t + 1e-9 >= run.nextSample) {
    run.samples.push({ t: run.t, ...pos, loc: n.loc, gs: n.gs, pitch: s.pitch, bank: s.bank, heading: s.heading, speed: s.speed, vsi: s.vsi, power: s.power, altitude: s.altitude, rate: s.rate });
    run.nextSample += RUN.sampleEvery;
  }
}

const bust = (run, rule) => {
  if (!run.busts.some((b) => b.rule === rule)) run.busts.push({ t: run.t, range: run.pos.range, right: run.pos.right, height: run.pos.height, rule });
};

/** The limits the needles break right now (AFMAN 11-217 Vol 1, p. 210). */
export function limitsNow(run) {
  const n = run.needles, out = [];
  if (run.capturedAt === undefined) return out;
  if (Math.abs(n.loc) >= 2) out.push('full-scale localizer');
  if (run.pos.height < RUN.locMins) {
    if (n.gs > 1) out.push('more than one dot low below localizer minimums');
    if (n.gs <= -2) out.push('full scale high below localizer minimums');
  }
  return out;
}

/** Advance the run by dt seconds with the pilot's input targets. */
export function advance(run, input, dt) {
  if (run.phase !== 'flying') return run;
  Object.assign(run.input, input);
  const s = step(run.s, run.input, dt);
  const rel = (s.heading - run.course) * D;
  const windTo = (run.windFrom + 180 - run.course) * D;
  const gamma = Math.asin(clamp(s.vs / (s.speed * 101.27), -1, 1));
  const v = s.speed * Math.cos(gamma);
  const along = v * Math.cos(rel) + run.windKt * Math.cos(windTo); // kt toward the runway
  const cross = v * Math.sin(rel) + run.windKt * Math.sin(windTo); // kt to the right
  run.s = s;
  run.t += dt;
  run.pos = {
    range: run.pos.range - (along * dt) / 3600,
    right: run.pos.right + (cross * dt * FT_PER_NM) / 3600,
    height: s.altitude - RUN.tdze,
  };
  run.speedRange = [Math.min(run.speedRange[0], s.speed), Math.max(run.speedRange[1], s.speed)];
  const n = needles(run.pos);
  run.needles = n;
  const within = Math.abs(n.loc) <= 1 && Math.abs(n.gs) <= 1;
  if (run.capturedAt === undefined && within) run.capturedAt = run.t;
  if (run.capturedAt !== undefined) {
    run.tracked += dt;
    if (within) run.inside += dt;
    run.worst.loc = Math.max(run.worst.loc, Math.abs(n.loc));
    run.worst.low = Math.max(run.worst.low, n.gs);
    run.worst.high = Math.max(run.worst.high, -n.gs);
  }
  for (const rule of limitsNow(run)) bust(run, rule);
  record(run);
  if (run.pos.height <= RUN.da) { run.phase = 'decision'; run.decisionAt = { ...run.pos, loc: n.loc, gs: n.gs, t: run.t }; }
  else if (run.pos.range <= 0) { run.phase = 'done'; run.decision = 'none'; run.decisionAt = { ...run.pos, loc: n.loc, gs: n.gs, t: run.t }; }
  return run;
}

/**
 * The optional auto power assist: sets the power that holds the approach
 * speed (proportional plus integral on the airspeed error), so a beginner
 * flies pitch for the glide path only. An exercise assist, not a model of
 * any aircraft's autothrottle. Returns the power to use.
 */
export function autoPower(run, dt) {
  const err = RUN.speed - run.s.speed;
  run.autoI = clamp((run.autoI ?? run.s.power) + 1.5 * err * dt, 0, 100);
  return clamp(run.autoI + 4 * err, 0, 100);
}

/** The pilot goes missed before the DA. */
export function goMissed(run) {
  if (run.phase !== 'flying') return run;
  run.phase = 'done';
  run.decision = 'early-missed';
  run.earlyReasons = limitsNow(run);
  run.decisionAt = { ...run.pos, loc: run.needles.loc, gs: run.needles.gs, t: run.t };
  return run;
}

/** At the DA: 'land', 'missed' or 'late' (no decision in time). */
export function decide(run, choice) {
  if (run.phase !== 'decision') return run;
  run.phase = 'done';
  run.decision = choice;
  return run;
}

// In position to land, for this exercise: within one dot on both needles.
export const inPosition = (at) => Math.abs(at.loc) <= 1 && Math.abs(at.gs) <= 1;

/** The debrief: the verdict, each finding, and the numbers. */
export function grade(run) {
  const items = [];
  const at = run.decisionAt;
  const pct = run.tracked > 0 ? (100 * run.inside) / run.tracked : 0;
  let correct;
  if (run.capturedAt === undefined) items.push(['bad', 'You never had both needles within one dot.']);
  if (run.decision === 'early-missed') {
    correct = run.earlyReasons.length > 0;
    items.push(correct
      ? ['good', `Right to go missed: ${run.earlyReasons.join(' and ')}.`]
      : ['warn', 'You went missed with the needles within limits. Safe, but the approach could have continued to the DA.']);
  } else if (run.decision === 'none') {
    correct = false;
    items.push(['bad', 'You reached the runway without descending to the DA: the approach needed a missed approach long before.']);
  } else {
    const should = run.visual && inPosition(at) ? 'land' : 'missed';
    const why = !run.visual ? 'no runway environment in sight at the DA'
      : inPosition(at) ? 'runway environment in sight and within one dot on both needles'
        : 'runway environment in sight, but not in position to land (more than one dot off)';
    correct = run.decision === should;
    if (run.decision === 'late') items.push(['bad', `No decision in ${RUN.decisionSeconds} seconds: at the DA it is immediate. You should have ${should === 'land' ? 'continued to land' : 'gone missed'} (${why}).`]);
    else items.push([correct ? 'good' : 'bad', `${correct ? 'Right' : 'Wrong'} decision: you ${run.decision === 'land' ? 'continued to land' : 'went missed'} with ${why}.`]);
  }
  for (const b of run.busts) {
    if (run.decision === 'early-missed' && b.t >= run.decisionAt.t - 3) continue;
    items.push(['bad', `Limit broken at ${b.range.toFixed(1)} NM, ${Math.round(b.height)} ft: ${b.rule}. ${b.rule.startsWith('full-scale') ? 'Discontinue the approach.' : 'Do not descend until back within limits.'}`]);
  }
  if (run.capturedAt !== undefined) {
    if (pct >= 90) items.push(['good', `Within one dot ${Math.round(pct)}% of the time after capture.`]);
    else items.push([pct >= 70 ? 'warn' : 'bad', `Within one dot only ${Math.round(pct)}% of the time after capture.`]);
  }
  const busted = run.busts.some((b) => !(run.decision === 'early-missed' && b.t >= run.decisionAt.t - 3));
  const result = correct && !busted && pct >= 70 ? 'ok' : correct ? 'marginal' : 'failed';
  return { result, correct, pct, items, at, worst: run.worst, captured: run.capturedAt };
}
