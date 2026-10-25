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
// bar count; the counts below follow the usual FAA layout (3, aiming point,
// 2, 2, 1, 1) and are unverified against a text source.
export const TOUCHDOWN_GROUPS = [
  { at: 500, bars: 3 }, { at: 1000, bars: 0, aiming: true }, { at: 1500, bars: 2 },
  { at: 2000, bars: 2 }, { at: 2500, bars: 1 }, { at: 3000, bars: 1 },
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
// when 5 knots or more." A tie keeps the first runway listed. Below 5 knots the calm-wind runway is used unless
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
    points: { start: [breakAt - initial, 0], break: [breakAt, 0], abeam: [breakAt, -2 * r], final: [finalStart, -2 * r], rollout: [rollout, 0] },
  };
}

// AIM 4-3-13, Traffic control light signals (the table in that paragraph).
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

// Who to call, and when, arriving at and leaving an airfield. Towered calls
// follow AIM 4-3-2, 4-3-14, 4-3-18 and 4-3-21; non-towered (CTAF) calls follow
// AC 90-66C ¶9 to 10. The wording is an illustrative example in the formats
// those paragraphs give; the controller's replies are typical, not quoted.
// `at` is a distance in NM on the way in or out, or a spot on the airfield.
// `label` names a step where the spot alone does not. `cite` holds [source, place] pairs: aim4 is AIM chapter 4 section 3, ac is AC 90-66C.
export const AIRFIELD = 'Cedar';
export const CALLSIGN = 'Navy 405';
export const RADIO_CALLS = {
  'towered-inbound': [
    { id: 'atis', at: { nm: 20 }, station: 'ATIS', freq: 'ATIS frequency (listen only)',
      you: null, them: '"Cedar information Bravo… wind two six zero at eight… landing and departing runway two seven… advise on initial contact you have information Bravo."',
      note: 'Well before the initial call, listen to the recorded airport information so the tower does not have to read you the weather and runway. Say you have it on first contact.',
      cite: [] },
    { id: 'initial', at: { nm: 15 }, station: 'Cedar Tower', freq: 'Tower (local control)',
      you: '"Cedar Tower, Navy 405, fifteen miles northeast, three thousand five hundred, inbound, landing, have information Bravo."',
      them: '"Navy 405, Cedar Tower, enter left downwind runway two seven, report midfield."',
      note: 'Make the initial call about 15 miles out. Inside the surface area you must keep two-way radio contact with the tower, and the tower issues the instructions that shape your path, such as which leg to join.',
      cite: [['aim4', '4-3-2']] },
    { id: 'downwind', at: { spot: 'downwind' }, station: 'Cedar Tower', freq: 'Tower (local control)',
      you: '"Navy 405, midfield left downwind."',
      them: '"Navy 405, runway two seven, cleared to land."',
      note: 'Fly the entry the tower gave you and make the reports it asked for. A landing clearance is always required; until you hear "cleared to land", you are not.',
      cite: [['aim4', '4-3-2']] },
    { id: 'rollout', at: { spot: 'exit' }, station: 'Cedar Tower', freq: 'Tower (local control)',
      you: '"Left at Bravo, ground point niner, Navy 405."',
      them: '"Navy 405, turn left at Bravo, contact ground point niner."',
      theyFirst: true,
      note: 'Exit the runway and stay on the tower frequency. Do not change to ground control until the controller tells you to; then change immediately and get a taxi clearance.',
      cite: [['aim4', '4-3-14'], ['aim4', '4-3-21']] },
    { id: 'taxi-in', at: { spot: 'clear' }, station: 'Cedar Ground', freq: 'Ground control',
      you: '"Cedar Ground, Navy 405, clear of runway two seven at Bravo, taxi to the west ramp."',
      them: '"Navy 405, taxi to the west ramp via Bravo, Alpha."',
      note: 'Always state where you are on the airport when you ask for taxi instructions, and read back the taxi instructions you are given.',
      cite: [['aim4', '4-3-18']] },
  ],
  'towered-outbound': [
    { id: 'atis', label: 'ATIS, on the ramp', at: { spot: 'ramp' }, station: 'ATIS', freq: 'ATIS frequency (listen only)',
      you: null, them: '"Cedar information Charlie… departing runway two seven… advise on initial contact you have information Charlie."',
      note: 'Before calling anyone, listen to the current airport information.',
      cite: [] },
    { id: 'startup', label: 'Before engine start', at: { spot: 'ramp' }, station: 'Cedar Ground', freq: 'Ground control or clearance delivery',
      you: '"Cedar Ground, Navy 405, west ramp, V-F-R departure northbound, have information Charlie."',
      them: '"Navy 405, Cedar Ground, runway two seven, taxi via Alpha, hold short of runway one eight."',
      note: 'Call ground control or clearance delivery before starting engines, stating your position on the airport. Where departure delays are expected to exceed 15 minutes, gate hold procedures apply and this call is how you get a start time.',
      cite: [['aim4', '4-3-14'], ['aim4', '4-3-15'], ['aim4', '4-3-18']] },
    { id: 'readback', label: 'Taxi readback', at: { spot: 'ramp' }, station: 'Cedar Ground', freq: 'Ground control',
      you: '"Runway two seven, taxi via Alpha, hold short of runway one eight, Navy 405."',
      them: null,
      note: 'Read back the taxi instructions. ATC must get a readback of every runway hold short instruction. A taxi instruction to the departure runway is not a clearance to enter or cross any runway.',
      cite: [['aim4', '4-3-18']] },
    { id: 'ready', at: { spot: 'hold' }, station: 'Cedar Tower', freq: 'Tower (local control)',
      you: '"Cedar Tower, Navy 405, holding short runway two seven, ready, northbound departure."',
      them: '"Navy 405, runway two seven, cleared for takeoff, right turn northbound approved."',
      note: 'Stay on the ground frequency through taxi and runup, then change to the tower when ready to request takeoff clearance. A clearance is needed before entering the runway or taking off. Turbine aircraft are assumed ready when they reach the runway unless they say otherwise.',
      cite: [['aim4', '4-3-14'], ['aim4', '4-3-18']] },
    { id: 'leaving', at: { nm: 6 }, station: 'Cedar Tower', freq: 'Tower (local control)',
      you: '"Navy 405, request frequency change."',
      them: '"Navy 405, frequency change approved."',
      note: 'Keep two-way contact with the tower inside the surface area unless the tower authorizes otherwise. Leave the frequency when the tower tells you to change or approves it.',
      cite: [['aim4', '4-3-2']] },
  ],
  'nontowered-inbound': [
    { id: 'weather', at: { nm: 20 }, station: 'Cedar UNICOM, or the automated weather', freq: 'UNICOM or AWOS/ASOS',
      you: '"Cedar UNICOM, Navy 405, request wind and runway in use."',
      them: '"Navy 405, Cedar UNICOM, wind two six zero at eight, traffic using runway two seven."',
      note: 'With no tower, nobody gives you the runway. A UNICOM, where there is one, may give the wind and weather on request, but UNICOM operators are not required to talk to you, and they cannot clear you for anything.',
      cite: [['ac', '9.3']] },
    { id: 'ten', at: { nm: 10 }, station: 'Cedar traffic', freq: 'CTAF (common traffic advisory frequency)',
      you: '"Cedar traffic, Navy 405, T-45, ten miles northeast, three thousand five hundred, inbound, landing runway two seven, Cedar."',
      them: null,
      note: 'About 10 miles out, monitor the CTAF and self-announce your call sign, aircraft type, position, altitude and intentions. Say the airport\'s published name at the start and end of each call, use the runway number rather than "the active", and avoid "to" and "for", which sound like numbers.',
      cite: [['ac', '9.5'], ['ac', '9.8.1'], ['ac', '10.1'], ['ac', '10.3'], ['ac', '10.4.1']] },
    { id: 'enter', at: { spot: 'entry' }, station: 'Cedar traffic', freq: 'CTAF',
      you: '"Cedar traffic, Navy 405, entering left downwind runway two seven, Cedar."',
      them: null,
      note: 'Enter at traffic pattern altitude on a 45° track to the downwind leg abeam the runway midpoint, and announce it.',
      cite: [['ac', '9.11.2'], ['ac', '11.3']] },
    { id: 'base', at: { spot: 'base' }, station: 'Cedar traffic', freq: 'CTAF',
      you: '"Cedar traffic, Navy 405, left base runway two seven, Cedar."',
      them: null,
      note: 'Report each leg so others can fit in behind you. Report where you are, not your guess at the landing order: "number three" helps nobody.',
      cite: [['ac', '9.11.2'], ['ac', '10.1']] },
    { id: 'final', at: { spot: 'final' }, station: 'Cedar traffic', freq: 'CTAF',
      you: '"Cedar traffic, Navy 405, final runway two seven, full stop, Cedar."',
      them: null,
      note: 'There is no landing clearance at a non-towered field: you look, listen and decide. Traffic that hears you and may conflict should answer without being asked; "any traffic in the area, please advise" is not a recognized call.',
      cite: [['ac', '9.8.1'], ['ac', '9.11.2']] },
    { id: 'clear', at: { spot: 'clear' }, station: 'Cedar traffic', freq: 'CTAF',
      you: '"Cedar traffic, Navy 405, clear of runway two seven, Cedar."',
      them: null,
      note: 'A "clear of the runway" call, like the example in the AC\'s appendix, tells the aircraft behind you that the runway is free. Keep monitoring the CTAF while you taxi in.',
      cite: [['ac', 'App. B']] },
  ],
  'nontowered-outbound': [
    { id: 'listen', label: 'Engine start: listen', at: { spot: 'ramp' }, station: 'Cedar traffic', freq: 'CTAF',
      you: null, them: '"Cedar traffic, Cessna 52 Romeo, left base runway two seven, Cedar."',
      note: 'Monitor the CTAF from engine start, through taxi and after departure. Listening first tells you which runway others are using and who is in the pattern.',
      cite: [['ac', '10.4.2']] },
    { id: 'taxi', label: 'Before taxi', at: { spot: 'ramp' }, station: 'Cedar traffic', freq: 'CTAF',
      you: '"Cedar traffic, Navy 405, T-45, west ramp, taxiing runway two seven, Cedar."',
      them: null,
      note: 'Announce your intentions before you taxi; the AC asks departures to do so "a minimum of 10 minutes prior to taxi". Avoid back-taxiing on the runway where you can: it increases the risk of a surface collision.',
      cite: [['ac', '9.5'], ['ac', '10.4.2']] },
    { id: 'depart', at: { spot: 'hold' }, station: 'Cedar traffic', freq: 'CTAF',
      you: '"Cedar traffic, Navy 405, departing runway two seven, northbound departure, Cedar."',
      them: null,
      note: 'Before entering the runway, check final for traffic and announce the runway and your direction of flight. Nobody clears you for takeoff; an IFR release from ATC is not a takeoff clearance either.',
      cite: [['ac', '9.5'], ['ac', '10.4.3']] },
    { id: 'exit', at: { nm: 3 }, station: 'Cedar traffic', freq: 'CTAF',
      you: null,
      them: null,
      note: 'Leave the pattern straight out, or with a 45° turn in the pattern direction (left for left traffic) beyond the departure end once at pattern altitude. Keep monitoring the CTAF after departure; an IFR departure monitors it until in contact with ATC.',
      cite: [['ac', '10.4.3'], ['ac', '11.8']] },
  ],
};
export const radioCalls = (towered, direction) => RADIO_CALLS[`${towered ? 'towered' : 'nontowered'}-${direction}`] ?? null;
