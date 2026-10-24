/* Pure, deterministic models for the Case III learning module.
 * Angles: degrees clockwise from magnetic north, wrapped to [0, 360).
 * Station frame: Mother's TACAN at the origin, x east, y north, distances NM.
 * Radial = magnetic bearing FROM the station; DME treated as horizontal range.
 * No wind, drift, magnetic-variation change or acceleration. Educational
 * simplifications, not validated procedure or aircraft performance.
 */

const D = Math.PI / 180;

export const norm = (angle) => ((angle % 360) + 360) % 360;

function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number.`);
}

function fix(name, { radial, dme }) {
  finite(`${name} radial`, radial);
  finite(`${name} DME`, dme);
  if (dme < 0) throw new RangeError(`${name} DME must not be negative.`);
}

/** Station-frame position of a radial/DME fix. */
export function tacanPosition({ radial, dme }) {
  fix('Position', { radial, dme });
  return { x: dme * Math.sin(radial * D), y: dme * Math.cos(radial * D) };
}

/** Reciprocal course: the inbound course to the station along a radial. */
export function reciprocal(radial) {
  finite('Radial', radial);
  return norm(radial + 180);
}

/**
 * Direct track and distance from one radial/DME position to another.
 * `course` is null when both positions coincide.
 */
export function pointToPoint(from, to) {
  fix('From', from);
  fix('To', to);
  const a = tacanPosition(from), b = tacanPosition(to);
  const dx = b.x - a.x, dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  return { course: distance < 1e-9 ? null : norm(Math.atan2(dx, dy) / D), distance };
}

/** Time in seconds to cover `distance` NM at a fixed `rate` NM/hour. */
export function timeEnroute(distance, rate) {
  finite('Distance', distance);
  finite('Rate', rate);
  if (distance < 0) throw new RangeError('Distance must not be negative.');
  if (rate <= 0) throw new RangeError('Rate must be positive.');
  return (distance / rate) * 3600;
}

/** Standard gravity (m/s²) and metres per nautical mile. */
const G = 9.80665, M_PER_NM = 1852;

/**
 * Rate of turn (°/s) for the FAA AIM 5-3-8 j 8 holding turn: 3° per second
 * or `bank` degrees of bank, whichever needs less bank, at `rate` NM/hour.
 * Coordinated level turn: rate = g·tan(bank) / speed.
 */
export function holdingTurnRate(rate = 250, bank = 30) {
  finite('Rate', rate);
  finite('Bank', bank);
  if (rate <= 0 || bank <= 0 || bank >= 90) throw new RangeError('Rate must be positive and bank between 0° and 90°.');
  const speed = (rate * M_PER_NM) / 3600;
  return Math.min(3, (G * Math.tan(bank * D)) / speed / D);
}

/**
 * Flies one holding entry, as the FAA AIM describes it, from the fix, and
 * joins the inbound course. The aircraft starts over the fix on `heading`.
 * Entry turns are flown at `entryTurnRate` (default: the AIM j 8 holding
 * rate, `holdingTurnRate(rate)`), racetrack turns at 180° in `turnSeconds`
 * (P-816's two-minute turns), legs for `legSeconds` at `rate` NM/hour, with
 * no wind. Fix frame: fix at the origin, x east, y north, NM.
 *   direct:   turn in the hold's direction to intercept the racetrack's
 *             outbound leg, follow it until `legSeconds` past abeam the fix,
 *             then make the racetrack turn (P-816 rate) onto the inbound
 *             course. Entry turns are tighter than racetrack turns, so the
 *             model intercepts the outbound leg rather than flying the
 *             outbound heading from wherever the first turn ends.
 *   teardrop: turn the short way to 30° from the outbound course toward the
 *             holding side, fly `legSeconds`, then turn in the hold's direction
 *             to intercept the inbound course.
 *   parallel: turn the short way onto the outbound heading, fly `legSeconds`,
 *             then turn in the hold's direction through more than 180° to
 *             intercept the inbound course.
 * Joining a course: turn in the given direction until the heading reaches
 * the joining heading, which cuts the course at up to `cutAngle` (the AIM
 * gives no intercept angle; 45° is this model's choice) and eases off as the
 * offset shrinks, so that a turn at the same rate rolls out on the course.
 * If the turn back is too wide to roll out without crossing, the aircraft
 * crosses and corrects back; `crossed` is how far (NM) it went past. If it
 * is not on the inbound course by the fix (`atFix`), it flies one racetrack
 * circuit (`circuit`), correcting onto the outbound leg and then the inbound
 * course, as a holding aircraft would on its next circuit. The AIM
 * does not say which way to make the first teardrop or parallel turn; the
 * model turns the short way. It does not choose an entry: the AIM's entry
 * figure assigns the sectors.
 * Returns the flown `points`, each named turn's direction and size, the
 * `entryTurnRate` used, `crossed`, `atFix` (offset and whether established
 * when the entry first reaches the fix), `circuit`, whether the aircraft ends
 * `established` on the inbound course (within 0.05 NM and 2°) at the fix,
 * and `miss`, its distance (NM) from the fix at the end.
 */
export function entryPath({
  inboundCourse, heading, turns, entry, rate = 250, turnSeconds = 120, legSeconds = 60,
  entryTurnRate = holdingTurnRate(rate), cutAngle = 45,
}) {
  finite('Inbound course', inboundCourse);
  finite('Heading', heading);
  finite('Rate', rate);
  finite('Turn time', turnSeconds);
  finite('Leg time', legSeconds);
  finite('Entry turn rate', entryTurnRate);
  if (turns !== 'left' && turns !== 'right') throw new RangeError('Turns must be "left" or "right".');
  if (!['direct', 'teardrop', 'parallel'].includes(entry)) throw new RangeError('Entry must be direct, teardrop or parallel.');
  if (rate <= 0 || turnSeconds <= 0 || legSeconds < 0 || entryTurnRate <= 0) throw new RangeError('Rate, turn time and turn rate must be positive and leg time not negative.');
  const hold = turns === 'right' ? 1 : -1;
  const inbound = norm(inboundCourse), outbound = norm(inbound + 180);
  const step = rate / 3600, patternRate = 180 / turnSeconds; // NM and degrees per second
  const radiusAt = (turnRate) => step / (turnRate * D);
  // The racetrack's outbound leg runs one pattern-turn diameter out on the holding side.
  const sideX = Math.cos(inbound * D) * hold, sideY = -Math.sin(inbound * D) * hold;
  const outboundTrack = { course: outbound, x: 2 * radiusAt(patternRate) * sideX, y: 2 * radiusAt(patternRate) * sideY };
  const inboundTrack = { course: inbound, x: 0, y: 0 };
  const legHeading = entry === 'teardrop' ? norm(outbound - hold * 30) : entry === 'parallel' ? outbound : undefined;

  let x = 0, y = 0, hdg = norm(heading);
  const points = [{ x, y }];
  let watch = null; // called after every move of the final join
  const move = (delta) => {
    const mean = (hdg + delta / 2) * D;
    x += step * Math.sin(mean); y += step * Math.cos(mean); hdg = norm(hdg + delta);
    points.push({ x, y });
    if (watch) watch();
  };
  const away = (target, dir) => (dir > 0 ? norm(target - hdg) : norm(hdg - target));
  const shortWay = (target) => (norm(target - hdg) <= 180 ? 1 : -1);
  const named = (dir, degrees) => ({ direction: dir > 0 ? 'right' : 'left', degrees });
  const turnTo = (target, dir, turnRate) => {
    let left = away(target, dir), turned = 0;
    while (left > 1e-9) { const d = Math.min(turnRate, left); move(dir * d); left -= d; turned += d; }
    return named(dir, Math.round(turned));
  };
  const straight = (seconds) => { for (let t = 0; t < seconds; t++) move(0); };
  // Offset right of a track (NM) and distance along it from its reference point.
  const offset = (t) => (x - t.x) * Math.cos(t.course * D) - (y - t.y) * Math.sin(t.course * D);
  const along = (t) => (x - t.x) * Math.sin(t.course * D) + (y - t.y) * Math.cos(t.course * D);
  // Heading error from which a turn at `turnRate` rolls out on the course
  // (offset = radius·(1 − cos error)), capped at the cut angle and, close
  // in, at 30° per NM of offset so the last correction eases on smoothly.
  const courseHeading = (t, turnRate) => {
    const e = Math.abs(offset(t)), radius = radiusAt(turnRate);
    const cut = Math.min(cutAngle, 30 * e, Math.acos(1 - Math.min(e, radius) / radius) / D);
    return norm(t.course - Math.sign(offset(t)) * cut);
  };
  // Turn in `dir` until the heading reaches the course-joining heading, then
  // keep joining (rate-limited) until `done`. The turn's size is the furthest
  // it swings in `dir`.
  const join = (t, dir, turnRate, done, limit = 1200) => {
    let swing = 0, most = 0;
    for (let n = 0; n < 720 / turnRate; n++) {
      const left = away(courseHeading(t, turnRate), dir);
      if (left <= turnRate || left > 360 - turnRate) break;
      move(dir * turnRate); swing += turnRate; most = Math.max(most, swing);
    }
    for (let n = 0; n < limit && !done(); n++) {
      const off = norm(courseHeading(t, turnRate) - hdg), want = off <= 180 ? off : off - 360;
      const d = Math.max(-turnRate, Math.min(turnRate, want));
      move(d); swing += dir * d; most = Math.max(most, swing);
    }
    return named(dir, Math.round(most));
  };

  const result = { entry, turns, inboundCourse: inbound, heading: norm(heading), entryTurnRate, points };
  if (legHeading !== undefined) result.legHeading = legHeading;
  let finalRate = entryTurnRate;
  if (entry === 'direct') {
    result.firstTurn = join(outboundTrack, hold, entryTurnRate,
      () => along(outboundTrack) >= legSeconds * step);
    finalRate = patternRate;
  } else {
    result.firstTurn = turnTo(legHeading, shortWay(legHeading), entryTurnRate);
    straight(legSeconds);
  }
  // The final turn starts on one side of the inbound course; record the
  // furthest the path then goes past it, over every second of the join.
  // Starting on the course (a parallel entry flown along it), a turn in the
  // hold's direction first carries the aircraft to the non-holding side.
  const startOffset = offset(inboundTrack);
  const startSide = Math.abs(startOffset) < 0.05 ? -hold : Math.sign(startOffset);
  let crossed = 0;
  watch = () => { crossed = Math.max(crossed, -startSide * offset(inboundTrack)); };
  result.secondTurn = join(inboundTrack, hold, finalRate, () => along(inboundTrack) >= 0);
  watch = null;
  const onCourse = () => {
    const [p, q] = points.slice(-2);
    const track = norm(Math.atan2(q.x - p.x, q.y - p.y) / D);
    return Math.abs(offset(inboundTrack)) < 0.05 && Math.abs(((track - inbound + 540) % 360) - 180) < 2;
  };
  result.crossed = crossed;
  // Not yet on the inbound course at the fix: as in any hold, keep going round
  // the racetrack (P-816 turns and legs) and correct on the first circuit.
  result.atFix = { offset: Math.abs(offset(inboundTrack)), established: onCourse() };
  result.circuit = !result.atFix.established;
  if (result.circuit) {
    join(outboundTrack, hold, patternRate, () => along(outboundTrack) >= legSeconds * step);
    join(inboundTrack, hold, patternRate, () => along(inboundTrack) >= 0);
  }
  result.established = along(inboundTrack) >= 0 && onCourse();
  result.miss = Math.hypot(x, y);
  return result;
}

/**
 * Plans hold circuits so the aircraft leaves the fix inbound at EAT.
 * A circuit is two 180° turns of `turnSeconds` each plus an outbound and an
 * inbound leg of equal time (no wind). The standard circuit uses
 * `legSeconds` legs. Returns the number of standard circuits and the
 * outbound/inbound leg time for one adjusted final circuit, or a late/short
 * result when no circuit fits.
 */
export function eatPlan({ secondsToEat, turnSeconds = 120, legSeconds = 60 }) {
  finite('Time to EAT', secondsToEat);
  finite('Turn time', turnSeconds);
  finite('Leg time', legSeconds);
  if (turnSeconds <= 0 || legSeconds < 0) throw new RangeError('Turn time must be positive and leg time not negative.');
  const standard = 2 * turnSeconds + 2 * legSeconds;
  const minimum = 2 * turnSeconds;
  if (secondsToEat < 0) return { kind: 'late', standard, lateBy: -secondsToEat };
  if (secondsToEat < minimum) return { kind: 'short', standard, minimum, secondsToEat };
  const full = Math.floor(secondsToEat / standard);
  const slack = secondsToEat - full * standard;
  if (slack === 0) return { kind: 'exact', standard, circuits: full };
  // Shorten: fly `full` standard circuits plus one short circuit holding the slack.
  const shorten = slack >= minimum ? { circuits: full, legSeconds: (slack - minimum) / 2 } : null;
  // Extend: fly one fewer standard circuit and stretch the last to absorb the slack.
  const extend = full >= 1 ? { circuits: full - 1, legSeconds: (standard + slack - minimum) / 2 } : null;
  return { kind: 'adjust', standard, slack, shorten, extend };
}

/* ---------- CV-1 approach profile (P-816 example) ----------
 * Source values: marshal fix at (angels + 15) DME, lowest assignment angels 6
 * (p. 2-19); commence at 4,000 ft/min and 250 KIAS, 2,000 ft/min from the
 * 5,000 ft platform, level at 1,200 ft (p. 2-23); self-contained GCA check
 * altitudes of 1,200 ft at 3 NM down to 200 ft at 0.5 NM (p. 2-25).
 * Educational assumptions: no wind, groundspeed equal to the 250 kt figure,
 * instant rate changes, DME as horizontal range and the GCA check altitudes
 * joined as a straight line. Not a performance model.
 */
export const CV1 = Object.freeze({
  rate: 250, penetrationFpm: 4000, platformFt: 5000, platformFpm: 2000,
  levelFt: 1200, glideStartNm: 3, glideFtPerNm: 400, lowestAngels: 6,
});

/** Marshal fix range and altitude for an assigned altitude in angels. */
export function marshalFix(angels) {
  finite('Angels', angels);
  if (!Number.isInteger(angels) || angels < CV1.lowestAngels) throw new RangeError(`Angels must be a whole number of at least ${CV1.lowestAngels}.`);
  return { dme: angels + 15, altitude: angels * 1000 };
}

/**
 * Key points of the example profile from the fix to the ship.
 * Feet lost per NM = descent rate (ft/min) ÷ groundspeed (NM/min).
 */
export function approachProfile({ angels, rate = CV1.rate }) {
  finite('Rate', rate);
  if (rate <= 0) throw new RangeError('Rate must be positive.');
  const fix = marshalFix(angels);
  const nmPerMin = rate / 60;
  const platformDme = fix.dme - (fix.altitude - CV1.platformFt) / (CV1.penetrationFpm / nmPerMin);
  const levelDme = platformDme - (CV1.platformFt - CV1.levelFt) / (CV1.platformFpm / nmPerMin);
  return {
    fix, platformDme, levelDme, glideDme: CV1.glideStartNm,
    points: [[fix.dme, fix.altitude], [platformDme, CV1.platformFt], [levelDme, CV1.levelFt], [CV1.glideStartNm, CV1.levelFt], [0, 0]],
  };
}

/** Profile altitude (ft) at a range (NM) from the ship, by linear interpolation. */
export function profileAltitude(profile, dme) {
  finite('DME', dme);
  const p = profile.points;
  if (dme >= p[0][0]) return p[0][1];
  if (dme <= 0) return 0;
  for (let i = 1; i < p.length; i++) {
    const [d1, a1] = p[i - 1], [d2, a2] = p[i];
    if (dme >= d2) return a2 + ((dme - d2) / (d1 - d2)) * (a1 - a2);
  }
  return 0;
}

/**
 * Correction from the marshal inbound course to the final bearing (P-816
 * p. 2-23): gradual within 10°, otherwise a 30° correction at 20 DME.
 * `offset` is signed: positive when the final bearing is right of inbound.
 * `turn` is the side to turn to intercept, which is opposite to `offset`:
 * a final bearing δ right of inbound extends aft along radial R + δ, which
 * lies to the left of an aircraft on radial R flying inbound.
 */
export function finalCorrection({ marshalRadial, finalBearing }) {
  finite('Marshal radial', marshalRadial);
  finite('Final bearing', finalBearing);
  const inbound = reciprocal(marshalRadial);
  const offset = ((norm(finalBearing) - inbound + 540) % 360) - 180;
  const kind = offset === 0 ? 'none' : Math.abs(offset) <= 10 ? 'gradual' : 'thirty';
  return { inbound, offset, kind, turn: offset === 0 ? null : offset > 0 ? 'left' : 'right' };
}

/* ---------- Timed turns ---------- */

/** Degrees turned from `from` to `to` turning `direction` ('left' | 'right'). */
export function turnAmount(from, to, direction) {
  finite('From heading', from);
  finite('To heading', to);
  if (direction !== 'left' && direction !== 'right') throw new RangeError('Direction must be "left" or "right".');
  return direction === 'right' ? norm(to - from) : norm(from - to);
}

/** Seconds to turn `degrees` at a constant `rate` in degrees per second. */
export function turnSeconds(degrees, rate) {
  finite('Degrees', degrees);
  finite('Turn rate', rate);
  if (degrees < 0) throw new RangeError('Degrees must not be negative.');
  if (rate <= 0) throw new RangeError('Turn rate must be positive.');
  return degrees / rate;
}
