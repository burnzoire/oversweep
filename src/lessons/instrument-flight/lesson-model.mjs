// Models for the Instrument Flying module: holding pattern entries and the
// questions built from them. No DOM here; lesson-ui.mjs draws.
//
// Sources (see docs/reviews/instrument-flight-evidence.md):
//   AFMAN 11-217 Vol 1 (2010), pp. 151–158: holding, the 70 degree and AIM
//   entry methods, timing, bank, maximum speeds, drift correction.
//   AIM 5-3-8: the parallel, teardrop and direct entries, the 70 degree line,
//   heading within ±5 degrees, turns at 3°/s or 30° of bank.

export const norm = (deg) => ((deg % 360) + 360) % 360;
// Signed angle from a to b, in (-180, 180].
export const diff = (a, b) => { const d = norm(b - a); return d > 180 ? d - 360 : d; };
export const three = (deg) => String(Math.round(norm(deg)) || 360).padStart(3, '0');

export const ENTRIES = ['Direct', 'Teardrop', 'Parallel'];

// The AIM method (AFMAN Technique B): the entry from the aircraft's heading at
// the fix, relative to the inbound holding course. For right turns the sectors
// are, by heading: direct from inbound -70° to inbound +110° (180° wide),
// teardrop from +110° to the outbound course (70°), parallel from the
// outbound course round to -70° (110°). The two boundary lines are the
// holding course and the 70° line through the fix. Left turns mirror it.
export function aimEntry(inbound, heading, turn = 'right') {
  const s = turn === 'left' ? -1 : 1;
  const t = s * diff(inbound, heading);
  if (t >= -70 && t <= 110) return 'Direct';
  if (t > 110) return 'Teardrop';
  return 'Parallel';
}

// Degrees from the nearest sector boundary; within 5° the AIM accepts either.
export function marginFromBoundary(inbound, heading, turn = 'right') {
  const s = turn === 'left' ? -1 : 1;
  const t = s * diff(inbound, heading);
  return Math.min(...[-70, 110, 180, -180].map((b) => Math.abs(t - b)));
}

// AFMAN Technique A, the 70 degree method: direct if the inbound course is
// within 70° of the heading, otherwise turn outbound the shorter way to
// parallel the holding course.
export function seventyMethod(inbound, heading) {
  return Math.abs(diff(inbound, heading)) <= 70 ? 'Direct' : 'Parallel';
}

// Bearings from the fix (clockwise from, to) of the region an aircraft
// arrives from for each AIM entry. An aircraft on heading H comes from H+180.
export function arrivalSectors(inbound, turn = 'right') {
  const s = turn === 'left' ? -1 : 1;
  const span = (a, b) => (s > 0 ? [norm(inbound + a), norm(inbound + b)] : [norm(inbound - b), norm(inbound - a)]);
  return { Direct: span(110, 290), Teardrop: span(290, 360), Parallel: span(0, 110) };
}

// A schematic no-wind track: 1-minute legs, standard-rate (3°/s) turns, one
// unit a second, fix at the origin, x east and y north.
const D = Math.PI / 180;
const unit = (h) => [Math.sin(h * D), Math.cos(h * D)];
export const TURN_RATE = 3;
export const LEG_S = 60;

function flyer(start, heading) {
  const pts = [start];
  let [x, y] = start, h = heading;
  return {
    get heading() { return h; },
    get points() { return pts; },
    straight(sec) { const [ux, uy] = unit(h); x += ux * sec; y += uy * sec; pts.push([x, y]); },
    // Turn in direction dir (+1 right, -1 left) until heading `to`, or through
    // `through` degrees when given.
    turn(dir, to, through) {
      let left = through ?? norm(dir * (to - h));
      while (left > 0) {
        const step = Math.min(TURN_RATE, left);
        const [ux, uy] = unit(h + dir * step / 2);
        x += ux * step / TURN_RATE * 1; y += uy * step / TURN_RATE * 1;
        h = norm(h + dir * step); left -= step;
        pts.push([x, y]);
      }
    },
    to(p) { pts.push(p); [x, y] = p; },
  };
}

// The holding pattern itself, starting at the fix, as a closed track.
export function holdingPattern(inbound, turn = 'right') {
  const s = turn === 'left' ? -1 : 1;
  const f = flyer([0, 0], inbound);
  f.turn(s, inbound + 180);
  f.straight(LEG_S);
  f.turn(s, inbound);
  f.to([0, 0]);
  return f.points;
}

// The entry track from the fix until back at the fix, for an AIM entry.
export function entryTrack(inbound, heading, turn = 'right') {
  const s = turn === 'left' ? -1 : 1;
  const entry = aimEntry(inbound, heading, turn);
  const f = flyer([0, 0], heading);
  if (entry === 'Direct') {
    f.turn(s, inbound + 180);
    f.straight(LEG_S);
    f.turn(s, inbound);
  } else if (entry === 'Teardrop') {
    // A 30° teardrop on the holding side, then turn the holding direction.
    const out = norm(inbound + 180 - s * 30);
    f.turn(Math.sign(diff(heading, out)) || s, out);
    f.straight(LEG_S);
    f.turn(s, inbound);
  } else {
    // Parallel the holding course outbound on the non-holding side, then turn
    // toward the holding side through more than 180° and back to the fix.
    const out = norm(inbound + 180);
    f.turn(Math.sign(diff(heading, out)) || -s, out);
    f.straight(LEG_S);
    f.turn(-s, inbound - s * 45);
  }
  f.to([0, 0]);
  return { entry, points: f.points };
}

// Holding entry questions: random inbound course, turn direction and heading,
// kept at least 10° from a sector boundary so the answer is not a judgment call.
export function entryQuestion(random = Math.random) {
  for (;;) {
    const inbound = 10 * (1 + Math.floor(random() * 36));
    const turn = random() < 0.7 ? 'right' : 'left';
    const heading = 5 * (1 + Math.floor(random() * 72));
    if (marginFromBoundary(inbound, heading, turn) < 10) continue;
    return { inbound, turn, heading, answer: aimEntry(inbound, heading, turn) };
  }
}

// AFMAN 11-217 Table 8.1 and note (p. 153–154): maximum holding speeds.
export const HOLDING_SPEEDS = [
  { band: 'Minimum holding altitude through 6,000 ft', kias: 200 },
  { band: 'Above 6,000 ft through 14,000 ft', kias: 230 },
  { band: 'Above 14,000 ft', kias: 265 },
];

// AFMAN 11-217 p. 208: approximate descent rate on final for a glidepath.
export const vviFor = (groundspeed, slope = 3) =>
  slope === 3 ? groundspeed * 10 / 2 : slope === 2.5 ? groundspeed * 10 / 2 - 200 : NaN;

// AFMAN 11-217 p. 158: crosswind drift correction, and tripled outbound.
export const driftCorrection = (crosswindKt, tasKt) => crosswindKt / (tasKt / 60);
