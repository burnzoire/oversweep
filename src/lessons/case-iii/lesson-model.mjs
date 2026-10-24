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
 * Holding entry from the arrival heading at the fix, by the module's own
 * practice rule (an unverified construction, not taken from the AIM figure):
 * direct 180°, teardrop 70°, parallel 110°, bounded by the 70° line on the
 * holding side and the inbound course line. `offset` is the arrival heading
 * measured from the inbound course in the direction of the hold's turns.
 * `nearBoundary` marks offsets within 5° of a sector boundary, where the
 * `alternative` entry across that boundary is also acceptable.
 */
export function holdEntry({ inboundCourse, heading, turns }) {
  finite('Inbound course', inboundCourse);
  finite('Heading', heading);
  if (turns !== 'left' && turns !== 'right') throw new RangeError('Turns must be "left" or "right".');
  const offset = turns === 'right' ? norm(heading - inboundCourse) : norm(inboundCourse - heading);
  const entry = offset < 110 || offset >= 290 ? 'direct' : offset < 180 ? 'teardrop' : 'parallel';
  // Each boundary separates two entries; near one, the other entry is also acceptable.
  const boundaries = [[110, 'direct', 'teardrop'], [180, 'teardrop', 'parallel'], [290, 'parallel', 'direct']];
  const near = boundaries.find(([b]) => Math.abs(offset - b) <= 5);
  const alternative = near ? near.slice(1).find((e) => e !== entry) : null;
  return { entry, offset, nearBoundary: Boolean(near), alternative };
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
