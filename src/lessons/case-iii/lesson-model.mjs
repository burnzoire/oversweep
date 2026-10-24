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

/**
 * Flies one holding entry, as the FAA AIM describes it, from the fix.
 * The aircraft starts over the fix on `heading`. Turns are flown at a constant
 * rate (180° in `turnSeconds`) and straight legs at `rate` NM/hour, with no
 * wind. Fix frame: fix at the origin, x east, y north, NM.
 *   direct:   turn in the hold's direction onto the outbound heading, fly the
 *             outbound leg, turn in the hold's direction inbound and home.
 *   teardrop: turn the short way to 30° from the outbound course toward the
 *             holding side, fly `legSeconds`, turn in the hold's direction
 *             onto the inbound course and home.
 *   parallel: turn the short way onto the outbound heading, fly `legSeconds`,
 *             turn in the hold's direction until pointing at the fix and home.
 * The AIM does not say which way to make the first teardrop or parallel turn;
 * the model turns the short way. Homing also turns the short way and stops at
 * the closest approach to the fix. It does not choose an entry: the AIM's entry figure assigns the sectors.
 * Returns the flown `points`, each named turn's direction and size, and
 * `miss`, the closest distance (NM) to the fix on the way back.
 */
export function entryPath({ inboundCourse, heading, turns, entry, rate = 250, turnSeconds = 120, legSeconds = 60 }) {
  finite('Inbound course', inboundCourse);
  finite('Heading', heading);
  finite('Rate', rate);
  finite('Turn time', turnSeconds);
  finite('Leg time', legSeconds);
  if (turns !== 'left' && turns !== 'right') throw new RangeError('Turns must be "left" or "right".');
  if (!['direct', 'teardrop', 'parallel'].includes(entry)) throw new RangeError('Entry must be direct, teardrop or parallel.');
  if (rate <= 0 || turnSeconds <= 0 || legSeconds < 0) throw new RangeError('Rate and turn time must be positive and leg time not negative.');
  const hold = turns === 'right' ? 1 : -1;
  const inbound = norm(inboundCourse), outbound = norm(inbound + 180);
  const step = rate / 3600, turnRate = 180 / turnSeconds; // NM and degrees per second
  let x = 0, y = 0, hdg = norm(heading);
  const points = [{ x, y }];
  // Fly one second while changing heading by `delta`, using the mean heading.
  const fly = (delta) => {
    const mean = (hdg + delta / 2) * D;
    x += step * Math.sin(mean); y += step * Math.cos(mean); hdg = norm(hdg + delta);
    points.push({ x, y });
  };
  const away = (target, dir) => (dir > 0 ? norm(target - hdg) : norm(hdg - target));
  const shortWay = (target) => (norm(target - hdg) <= 180 ? 1 : -1);
  const named = (dir, degrees) => ({ direction: dir > 0 ? 'right' : 'left', degrees });
  // Turn in direction `dir` (+1 right, −1 left) onto `target`.
  const turnTo = (target, dir) => {
    let left = away(target, dir), turned = 0;
    while (left > 1e-9) { const d = Math.min(turnRate, left); fly(dir * d); left -= d; turned += d; }
    return named(dir, turned);
  };
  const straight = (seconds) => { for (let t = 0; t < seconds; t++) fly(0); };
  const bearingToFix = () => norm(Math.atan2(-x, -y) / D);
  // Optionally turn in direction `dir` until the fix is ahead (at most one
  // full turn), then home on it the short way.
  const home = (dir) => {
    let turned = 0, t = 0;
    for (; dir && turned < 360; t++) {
      const off = away(bearingToFix(), dir) % (360 - 1e-9);
      if (off <= turnRate) { fly(dir * off); turned += off; break; }
      fly(dir * turnRate); turned += turnRate;
    }
    // Stop at the closest approach to the fix.
    for (let last = Infinity; t < 3600 && Math.hypot(x, y) < last; t++) {
      last = Math.hypot(x, y);
      const off = norm(bearingToFix() - hdg), want = off <= 180 ? off : off - 360;
      fly(Math.max(-turnRate, Math.min(turnRate, want)));
    }
    return dir ? named(dir, turned) : null;
  };
  const result = { entry, turns, inboundCourse: inbound, heading: norm(heading), points };
  if (entry === 'direct') {
    result.firstTurn = turnTo(outbound, hold);
    straight(legSeconds);
    result.secondTurn = turnTo(inbound, hold);
    home(0);
  } else if (entry === 'teardrop') {
    result.legHeading = norm(outbound - hold * 30);
    result.firstTurn = turnTo(result.legHeading, shortWay(result.legHeading));
    straight(legSeconds);
    result.secondTurn = turnTo(inbound, hold);
    home(0);
  } else {
    result.legHeading = outbound;
    result.firstTurn = turnTo(outbound, shortWay(outbound));
    straight(legSeconds);
    result.secondTurn = home(hold);
  }
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
