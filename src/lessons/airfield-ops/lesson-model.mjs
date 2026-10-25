// Pure numerical models for the Airfield Operations module. No DOM access.
//
// Runway frame: x along the landing direction (ft, 0 at the landing threshold),
// y to the right of the landing direction (ft). Directions are degrees clockwise
// from magnetic north; wind is the direction it blows FROM, in the same
// reference as the runway. Speeds are knots; turn geometry treats them as true
// airspeed in still air.

export const G0 = 9.80665; // m/s², standard gravity
export const KT = 1852 / 3600; // m/s per knot
export const FT = 0.3048; // m per foot
export const NM = 1852 / FT; // ft per nautical mile (≈ 6,076.1)
export const SM = 5280; // ft per statute mile

const rad = (d) => d * Math.PI / 180;
const deg = (r) => r * 180 / Math.PI;
export const norm = (a) => ((a % 360) + 360) % 360;
const signed = (a) => { const d = norm(a); return d > 180 ? d - 360 : d; };

// AIM 2-3-3.2: "The runway number is the whole number nearest one-tenth the
// magnetic azimuth of the centerline of the runway." North is runway 36, not 0.
// An azimuth exactly halfway (e.g. 185°) is rounded up here; the AIM does not
// say how a tie is broken.
export function designator(azimuth) {
  if (!Number.isFinite(azimuth)) return null;
  const n = Math.round(norm(azimuth) / 10);
  return n === 0 ? 36 : n;
}

// Both ends of one strip: the reciprocal end is 180° from the first.
export const ends = (azimuth) => [designator(azimuth), designator(azimuth + 180)];

// AIM 2-3-3.2: parallel runways take L and R, or L, C and R, "left to right
// when viewed from the direction of approach". From the reciprocal end the
// order is reversed, so the same strip is L from one end and R from the other.
export function parallelSuffixes(count) {
  return { 1: [''], 2: ['L', 'R'], 3: ['L', 'C', 'R'] }[count] ?? null;
}
export function parallelNames(azimuth, count) {
  const s = parallelSuffixes(count);
  if (!s || designator(azimuth) === null) return null;
  const [a, b] = ends(azimuth);
  // Strip i counted left to right from the approach to end a.
  return s.map((suffix, i) => ({ near: `${a}${suffix}`, far: `${b}${s[s.length - 1 - i]}` }));
}

// AIM Table 2-3-2: number of runway threshold stripes by runway width.
export const THRESHOLD_STRIPES = { 60: 4, 75: 6, 100: 8, 150: 12, 200: 16 };
export const thresholdStripes = (width) => THRESHOLD_STRIPES[width] ?? null;

// AIM Table 2-3-1: marking elements by runway type. Footnoted visual-runway
// elements: threshold on runways used by international commercial transports;
// aiming point on runways 4,000 ft or longer used by jet aircraft.
export const MARKINGS = {
  visual: ['designation', 'centerline'],
  nonprecision: ['designation', 'centerline', 'threshold', 'aiming'],
  precision: ['designation', 'centerline', 'threshold', 'aiming', 'touchdown', 'sides'],
};
export function markingsFor(type, { international = false, jet4000 = false } = {}) {
  const base = MARKINGS[type];
  if (!base) return null;
  const extra = type === 'visual' ? [international && 'threshold', jet4000 && 'aiming'].filter(Boolean) : [];
  return [...base, ...extra];
}

// Touchdown zone bar groups beyond the threshold, AIM 2-3-3.5: groups of one,
// two and three bars in pairs, coded in 500 ft increments; the aiming point is
// about 1,000 ft in (2-3-3.4). The AIM text gives the coding, not each group's
// bar count, so the counts below (fewer bars further in) are illustrative.
export const TOUCHDOWN_GROUPS = [
  { at: 500, bars: 3 }, { at: 1000, bars: 0, aiming: true }, { at: 1500, bars: 3 },
  { at: 2000, bars: 2 }, { at: 2500, bars: 2 }, { at: 3000, bars: 1 },
];

// Wind components on a runway. θ = wind direction − runway direction.
// Headwind = V·cos θ (negative is a tailwind); crosswind = V·sin θ, positive
// from the right of the landing direction.
export function windComponents({ wind, speed, runway }) {
  if (![wind, speed, runway].every(Number.isFinite) || speed < 0) return null;
  const theta = signed(wind - runway);
  return { angle: theta, head: speed * Math.cos(rad(theta)), cross: speed * Math.sin(rad(theta)) };
}

// AIM 4-3-6.2: "ATC will assign the runway/s most nearly aligned with the wind
// when 5 knots or more." Below 5 knots the calm-wind runway is used unless
// another is operationally advantageous. `runways` are candidate landing
// directions (one per runway end), `calm` the calm-wind direction.
export function runwayForWind({ wind, speed, runways, calm }) {
  if (!runways?.length || !Number.isFinite(speed)) return null;
  if (speed < 5) return { runway: calm ?? runways[0], reason: 'calm' };
  const best = runways.reduce((a, b) => (Math.abs(signed(wind - b)) < Math.abs(signed(wind - a)) ? b : a));
  return { runway: best, reason: 'wind' };
}

// PAPI with four light units. Each unit shows white above its setting angle and
// red below it. The AIM depicts the indications (FIG 2-1-5) only as an image:
// more than 3.5° all white, 3.2° three white, 3.0° two and two, 2.8° one white,
// less than 2.5° all red. The setting angles here are an assumption that
// reproduces those labels: 30 and 10 minutes of arc either side of a 3° path.
export const PAPI_SETTINGS = [2.5, 2 + 50 / 60, 3 + 10 / 60, 3.5];
export function papi(angle, path = 3) {
  if (!Number.isFinite(angle)) return null;
  const settings = PAPI_SETTINGS.map((s) => s - 3 + path);
  // Lights listed left to right as the pilot sees them: whites fill from the left.
  const white = settings.filter((s) => angle > s).length;
  const lights = [...Array(4)].map((_, i) => (i < white ? 'white' : 'red'));
  const label = ['Low', 'Slightly low', 'On glide path', 'Slightly high', 'High'][white];
  return { white, lights, label };
}

// Glide path geometry: height above the touchdown point at a distance, or the
// angle from a height and distance.
export const heightOnPath = (distanceFt, angle) => distanceFt * Math.tan(rad(angle));
export const pathAngle = (heightFt, distanceFt) => (distanceFt > 0 ? deg(Math.atan2(heightFt, distanceFt)) : null);

// Level, coordinated turn at bank φ and true airspeed V: radius V²/(g·tan φ),
// rate g·tan φ / V. Returned in ft, °/s and seconds per 180°.
export function turn({ speed, bank }) {
  if (!(speed > 0) || !(bank > 0 && bank < 90)) return null;
  const v = speed * KT;
  const a = G0 * Math.tan(rad(bank));
  const rate = deg(a / v);
  return { radius: v * v / a / FT, rate, half: 180 / rate, load: 1 / Math.cos(rad(bank)) };
}

// The rectangular pattern, as waypoints in the runway frame. Left traffic puts
// the downwind leg on the left of the landing direction (y < 0).
// Sources: AIM 4-3-3 (legs; departure leg to at least 1/2 mile beyond the
// runway end; final at least 1/4 mile); AFH ch. 8 p. 8-3 (downwind about 1/2
// to 1 mile out; base turn about 45° from the approach end); AC 90-66C 11.3
// (45° entry abeam the midpoint).
export function pattern({ length = 5000, offset = 0.75 * NM, side = 'left' } = {}) {
  const s = side === 'right' ? 1 : -1;
  const y = s * offset;
  const upwindEnd = length + 0.5 * SM;
  // Base turn where the approach end is 45° behind abeam: as far out as the
  // downwind is offset. The final leg is then that long, over 1/4 mile.
  const baseAt = -offset;
  const legs = {
    departure: [[length, 0], [upwindEnd, 0]],
    crosswind: [[upwindEnd, 0], [upwindEnd, y]],
    downwind: [[upwindEnd, y], [baseAt, y]],
    base: [[baseAt, y], [baseAt, 0]],
    final: [[baseAt, 0], [0, 0]],
  };
  // 45° entry: joins downwind abeam the runway midpoint, from the outside.
  const mid = length / 2;
  const entryRun = 1 * NM;
  const entry = [[mid + entryRun, y + s * entryRun], [mid, y]];
  // Departure exits: straight out, or a 45° turn toward the pattern side
  // (AC 90-66C 11.8) after passing the departure end at pattern altitude.
  const exits = {
    straight: [[length, 0], [length + 2 * NM, 0]],
    turn45: [[length, 0], [upwindEnd, 0], [upwindEnd + 1.5 * NM, s * 1.5 * NM]],
  };
  return { legs, entry, exits, side, offset, upwindEnd, baseAt, mid };
}

// Base-turn bearing check: the angle from abeam at which the approach end lies
// behind the aircraft on downwind. AFH ch. 8 p. 8-3: about 45°.
export const baseBearing = (offset, beyond) => deg(Math.atan2(beyond, offset));

// The overhead maneuver (Pilot/Controller Glossary): initial approach 3 to 5
// miles; altitude at least 500 ft above the conventional pattern; break into
// the first of two 180° turns; roll-out on final not less than 1/4 mile from
// the landing threshold and not less than 300 ft above the ground.
// Geometry: semicircles of the turn radius for both 180° turns; downwind is
// 2r from the runway. `breakAt` is the break point's distance past the
// threshold along the runway; `extend` is how far past abeam the threshold
// the downwind runs before the final turn. Descent is linear from the break
// altitude to the roll-out height over the path from break to roll-out.
export function overhead({ speed = 300, bank = 60, breakAt = 2500, extend = 2000, initial = 3 * NM, patternAlt = 1000, above = 500, rollHeight = 300 } = {}) {
  const t = turn({ speed, bank });
  if (!t) return null;
  const r = t.radius;
  const finalStart = -extend; // x where the final turn begins on downwind
  const rollout = -extend; // a 180° turn returns to the same x on the centreline
  const turnLen = Math.PI * r;
  const downwind = breakAt - finalStart;
  const pathLen = 2 * turnLen + downwind;
  const breakAlt = patternAlt + above;
  return {
    radius: r, rate: t.rate, load: t.load, spacing: 2 * r,
    rollout: -rollout, // distance before the threshold (ft)
    rolloutOk: -rollout >= SM / 4,
    rollHeight, rollHeightOk: rollHeight >= 300,
    altitudeOk: above >= 500,
    initialOk: initial >= 3 * NM && initial <= 5 * NM,
    breakAlt, downwind, pathLen,
    descentGradient: (breakAlt - rollHeight) / pathLen,
    seconds: pathLen / (speed * KT / FT),
    points: { start: [-initial, 0], break: [breakAt, 0], abeam: [breakAt, -2 * r], final: [finalStart, -2 * r], rollout: [rollout, 0] },
  };
}

// AIM TBL 4-3-13, Traffic control light signals.
export const LIGHT_SIGNALS = [
  { id: 'steady-green', colour: 'Steady green', ground: 'Cleared for takeoff', air: 'Cleared to land', vehicle: 'Cleared to cross, proceed or go' },
  { id: 'flashing-green', colour: 'Flashing green', ground: 'Cleared for taxi', air: 'Return for landing (to be followed by steady green at the proper time)', vehicle: 'Not applicable' },
  { id: 'steady-red', colour: 'Steady red', ground: 'STOP', air: 'Give way to other aircraft and continue circling', vehicle: 'STOP' },
  { id: 'flashing-red', colour: 'Flashing red', ground: 'Taxi clear of the runway in use', air: 'Airport unsafe, do not land', vehicle: 'Clear the taxiway/runway' },
  { id: 'flashing-white', colour: 'Flashing white', ground: 'Return to starting point on airport', air: 'Not applicable', vehicle: 'Return to starting point on airport' },
  { id: 'alternating', colour: 'Alternating red and green', ground: 'Exercise extreme caution', air: 'Exercise extreme caution', vehicle: 'Exercise extreme caution' },
];
export const lightSignal = (id, who) => LIGHT_SIGNALS.find((s) => s.id === id)?.[who] ?? null;

// Runway lighting seen at a point `remaining` ft before the far end of an
// instrument runway of `length` ft (AIM 2-1-4.2, 2-1-5.1).
export function runwayLights({ length, remaining }) {
  if (!(length > 0) || !(remaining >= 0) || remaining > length) return null;
  const caution = Math.min(2000, length / 2);
  return {
    edge: remaining <= caution ? 'yellow' : 'white',
    centerline: remaining <= 1000 ? 'red' : remaining <= 3000 ? 'red/white' : 'white',
    caution,
  };
}
