/* Pure, deterministic models for the Air Navigation module.
 * Angles: degrees clockwise from north, wrapped to [0, 360). Station frame:
 * the TACAN or VOR at the origin, x east, y north, distances in NM, radials
 * magnetic with no variation change across the plot. Rules of thumb are the
 * T-45C instrument FTI's (CNATRA P-1204); the wind triangle is the FAA PHAK's.
 * Educational models, not validated procedure or aircraft performance.
 */
import { norm, pointToPoint, reciprocal, tacanPosition } from '../case-iii/lesson-model.mjs';

export { norm, pointToPoint, reciprocal, tacanPosition };

const D = Math.PI / 180;
const FT_PER_NM = 6076;
const M_PER_NM = 1852;

function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number.`);
}

/** Signed difference a − b in (−180, 180]: positive when a is clockwise of b. */
export function diff(a, b) {
  const d = ((a - b) % 360 + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}

/* ---------- Writing a position ---------- */

// Latitude: N/S, two-digit degrees. Longitude: E/W, three-digit degrees.
const AXES = {
  lat: { max: 90, width: 2, plus: 'N', minus: 'S' },
  lon: { max: 180, width: 3, plus: 'E', minus: 'W' },
};

/**
 * Reads a latitude or longitude typed as decimal degrees ("-87.32"), degrees
 * and decimal minutes ("N30 21.0") or degrees, minutes and seconds
 * ("30°21'00\"N", "087 19 12 W"). A hemisphere letter overrides the sign.
 */
export function parseCoordinate(text, axis) {
  const spec = AXES[axis];
  if (!spec) throw new RangeError('Axis must be lat or lon.');
  const raw = String(text).trim().toUpperCase();
  const hemi = raw.match(/[NSEW]/g);
  if (hemi && (hemi.length > 1 || ![spec.plus, spec.minus].includes(hemi[0])))
    throw new RangeError(`Use ${spec.plus} or ${spec.minus} for ${axis === 'lat' ? 'latitude' : 'longitude'}.`);
  const negative = /^-/.test(raw.replace(/^[NSEW]\s*/, '')) || hemi?.[0] === spec.minus;
  const parts = raw.replace(/[NSEW°'"′″-]/g, ' ').trim().split(/[\s,]+/).filter(Boolean).map(Number);
  if (!parts.length || parts.length > 3 || parts.some((p) => !Number.isFinite(p) || p < 0))
    throw new RangeError('Enter degrees, degrees and minutes, or degrees, minutes and seconds.');
  const [deg, min = 0, sec = 0] = parts;
  if ((parts.length > 1 && !Number.isInteger(deg)) || (parts.length > 2 && !Number.isInteger(min)) || min >= 60 || sec >= 60)
    throw new RangeError('Minutes and seconds run from 0 to 59; only the last part may have decimals.');
  const value = deg + min / 60 + sec / 3600;
  if (value > spec.max) throw new RangeError(`${axis === 'lat' ? 'Latitude' : 'Longitude'} cannot exceed ${spec.max}°.`);
  return negative ? -value : value;
}

const pad = (n, width) => String(n).padStart(width, '0');

// Splits |value| into whole degrees and the rest at a rounding unit, carrying
// a rounded-up 60 into the next unit so 29.99999° never prints as 29°60'.
function split(value, units, decimals) {
  const scale = units * 10 ** decimals;
  const total = Math.round(Math.abs(value) * scale);
  return { deg: Math.floor(total / scale), rest: (total % scale) / 10 ** decimals };
}

/** Degrees, minutes and seconds: N30°21'00". */
export function formatDMS(value, axis, decimals = 0) {
  const spec = AXES[axis];
  const { deg, rest } = split(value, 3600, decimals);
  const min = Math.floor(rest / 60), sec = (rest - min * 60).toFixed(decimals);
  const secText = decimals ? sec.padStart(3 + decimals, '0') : pad(sec, 2);
  return `${value < 0 ? spec.minus : spec.plus}${pad(deg, spec.width)}°${pad(min, 2)}'${secText}"`;
}

/** Degrees and decimal minutes: N30°21.00'. */
export function formatDM(value, axis, decimals = 2) {
  const spec = AXES[axis];
  const { deg, rest } = split(value, 60, decimals);
  const min = rest.toFixed(decimals);
  return `${value < 0 ? spec.minus : spec.plus}${pad(deg, spec.width)}°${min.padStart(3 + decimals - (decimals ? 0 : 1), '0')}'`;
}

/** Decimal degrees with a hemisphere letter: N30.3500°. */
export function formatDD(value, axis, decimals = 4) {
  const spec = AXES[axis];
  const [deg, frac = ''] = Math.abs(value).toFixed(decimals).split('.');
  return `${value < 0 ? spec.minus : spec.plus}${pad(deg, spec.width)}${frac ? `.${frac}` : ''}°`;
}

/**
 * Ground size of the last digit of each format, in metres, from one minute of
 * latitude = 1 NM. East–west sizes shrink with the cosine of latitude.
 */
export function resolution(lat, { dmsDecimals = 0, dmDecimals = 2, ddDecimals = 4, mgrsDigits = 10 } = {}) {
  const ns = (minutes) => minutes * M_PER_NM;
  const ew = (minutes) => ns(minutes) * Math.cos(lat * D);
  const sec = 10 ** -dmsDecimals / 60, dm = 10 ** -dmDecimals, dd = 10 ** -ddDecimals * 60;
  return {
    dms: { ns: ns(sec), ew: ew(sec) }, dm: { ns: ns(dm), ew: ew(dm) }, dd: { ns: ns(dd), ew: ew(dd) },
    mgrs: 10 ** (5 - mgrsDigits / 2),
  };
}

// WGS 84 ellipsoid and the UTM projection constants.
const A = 6378137, F = 1 / 298.257223563, K0 = 0.9996;

/** UTM zone, including the Norway (32V) and Svalbard (31X–37X) exceptions. */
export function utmZone(lat, lon) {
  let zone = Math.floor((lon + 180) / 6) + 1;
  if (lon >= 180) zone = 60;
  if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) zone = 32;
  if (lat >= 72 && lat < 84) {
    if (lon >= 0 && lon < 9) zone = 31;
    else if (lon >= 9 && lon < 21) zone = 33;
    else if (lon >= 21 && lon < 33) zone = 35;
    else if (lon >= 33 && lon < 42) zone = 37;
  }
  return zone;
}

/** Latitude band letter, C to X without I and O; X runs 72°N to 84°N. */
export function latitudeBand(lat) {
  if (lat < -80 || lat >= 84) return null;
  return 'CDEFGHJKLMNPQRSTUVWX'[Math.min(19, Math.floor((lat + 80) / 8))];
}

/** WGS 84 UTM easting and northing in metres (Krüger series, sub-millimetre). */
export function toUTM(lat, lon) {
  finite('Latitude', lat);
  finite('Longitude', lon);
  if (lat < -80 || lat >= 84) throw new RangeError('UTM covers 80°S to 84°N; the polar areas use UPS.');
  const zone = utmZone(lat, lon);
  const n = F / (2 - F);
  const a = A / (1 + n) * (1 + n ** 2 / 4 + n ** 4 / 64);
  const alpha = [n / 2 - 2 * n ** 2 / 3 + 5 * n ** 3 / 16, 13 * n ** 2 / 48 - 3 * n ** 3 / 5, 61 * n ** 3 / 240];
  const phi = lat * D, dl = (lon - (zone * 6 - 183)) * D;
  const e2n = 2 * Math.sqrt(n) / (1 + n);
  const t = Math.sinh(Math.atanh(Math.sin(phi)) - e2n * Math.atanh(e2n * Math.sin(phi)));
  const xi = Math.atan2(t, Math.cos(dl)), eta = Math.atanh(Math.sin(dl) / Math.sqrt(1 + t * t));
  let x = eta, y = xi;
  alpha.forEach((al, j) => {
    const k = 2 * (j + 1);
    x += al * Math.cos(k * xi) * Math.sinh(k * eta);
    y += al * Math.sin(k * xi) * Math.cosh(k * eta);
  });
  return { zone, band: latitudeBand(lat), easting: 500000 + K0 * a * x, northing: (lat < 0 ? 10000000 : 0) + K0 * a * y };
}

/**
 * MGRS reference: grid zone designation, 100,000-metre square letters, then
 * easting and northing to `digits` total digits (2 to 10). Digits are
 * truncated, not rounded, so a reference names the square's south-west corner.
 */
export function toMGRS(lat, lon, digits = 10) {
  if (![2, 4, 6, 8, 10].includes(digits)) throw new RangeError('MGRS uses 2, 4, 6, 8 or 10 digits.');
  const { zone, band, easting, northing } = toUTM(lat, lon);
  const set = zone % 3;
  const columns = ['STUVWXYZ', 'ABCDEFGH', 'JKLMNPQR'][set];
  const column = columns[Math.floor(easting / 100000) - 1];
  const rows = 'ABCDEFGHJKLMNPQRSTUV';
  const row = rows[(Math.floor(northing / 100000) + (zone % 2 ? 0 : 5)) % 20];
  const half = digits / 2;
  const cut = (m) => pad(Math.floor((Math.floor(m) % 100000) / 10 ** (5 - half)), half);
  const e = cut(easting), nn = cut(northing);
  return { gzd: `${pad(zone, 2)}${band}`, square: `${column}${row}`, easting: e, northing: nn, text: `${pad(zone, 2)}${band} ${column}${row} ${e} ${nn}` };
}

/* ---------- Direction ---------- */

/**
 * True heading → magnetic → compass (PHAK 16-9): variation in degrees, east
 * positive ("east is least": subtract); deviation as the card's correction,
 * added to magnetic heading.
 */
export function headings({ trueHeading, variation = 0, deviation = 0 }) {
  finite('True heading', trueHeading);
  finite('Variation', variation);
  finite('Deviation', deviation);
  const magnetic = norm(trueHeading - variation);
  return { true: norm(trueHeading), magnetic, compass: norm(magnetic + deviation) };
}

/** Relative bearing: from the nose, clockwise, to the object (NAVEDTRA 2-11, 2-12). */
export const relativeBearing = (heading, bearing) => norm(bearing - heading);

/**
 * Wind triangle (PHAK 16-13 to 16-15): course and wind direction (from) on
 * the same north reference, speeds in knots. `wca` is positive right.
 */
export function windTriangle({ course, tas, windFrom, windSpeed }) {
  for (const [name, v] of [['Course', course], ['True airspeed', tas], ['Wind direction', windFrom], ['Wind speed', windSpeed]]) finite(name, v);
  if (tas <= 0) throw new RangeError('True airspeed must be positive.');
  if (windSpeed < 0) throw new RangeError('Wind speed must not be negative.');
  const angle = (windFrom - course) * D;
  const cross = windSpeed * Math.sin(angle);
  if (Math.abs(cross) >= tas) throw new RangeError('The crosswind is at least the airspeed: no heading holds this course.');
  const wca = Math.asin(cross / tas) / D;
  const groundSpeed = tas * Math.cos(wca * D) - windSpeed * Math.cos(angle);
  if (groundSpeed <= 0) throw new RangeError('The headwind is at least the airspeed: no progress along this course.');
  return { wca, heading: norm(course + wca), groundSpeed, crosswind: cross, headwind: windSpeed * Math.cos(angle) };
}

/** Minutes to fly `distance` NM at `groundSpeed` knots. */
export function minutesFor(distance, groundSpeed) {
  finite('Distance', distance);
  finite('Ground speed', groundSpeed);
  if (groundSpeed <= 0) throw new RangeError('Ground speed must be positive.');
  return (distance / groundSpeed) * 60;
}

/* ---------- Radials, bearing pointer and CDI ---------- */

/** Station-frame position → radial and horizontal range. */
export function fixOf({ x, y }) {
  const range = Math.hypot(x, y);
  return { radial: range < 1e-9 ? 0 : norm(Math.atan2(x, y) / D), range };
}

/** DME is slant range: horizontal range and height above the station combined. */
export function slantRange(range, altitudeFt) {
  finite('Range', range);
  finite('Altitude', altitudeFt);
  return Math.hypot(range, Math.max(0, altitudeFt) / FT_PER_NM);
}

/**
 * What the HSI shows (P-1204 pp. 12–13): bearing-pointer head (bearing to the
 * station) and tail (the radial you are on), TO or FROM for the selected
 * course, and course deviation. `deviation` is signed: positive means the
 * course is to your right, so the CDI bar sits right. Full scale is 10°,
 * 5° a dot, as for TACAN and VOR steering.
 */
export function hsi({ radial, course }) {
  finite('Radial', radial);
  finite('Course', course);
  const from = Math.abs(diff(radial, course)) < 90;
  // Deviation is measured from the course's own radial: the course itself
  // FROM, its reciprocal TO.
  const reference = from ? course : norm(course + 180);
  const off = diff(radial, reference);
  const deviation = from ? -off : off;
  return {
    head: norm(radial + 180), tail: norm(radial), toFrom: from ? 'FROM' : 'TO',
    deviation, dots: Math.max(-2, Math.min(2, deviation / 5)), fullScale: Math.abs(deviation) >= 10,
  };
}

/* ---------- Course intercepts (P-1204 pp. 65–70) ---------- */

export const INTERCEPT_METHODS = {
  thirty: { label: '30-degree method (inbound)', inbound: true },
  double: { label: 'Double angle off the bow (inbound)', inbound: true },
  passage: { label: 'Immediately after station passage (outbound)', inbound: false },
  fortyfive: { label: '45-degree method (outbound)', inbound: false },
};

/**
 * Intercept heading by one of the FTI's methods. Inbound: look from the
 * desired course to the head of the bearing pointer and 30° (or as many
 * degrees again, at most 45°) beyond. Outbound: look from the tail of the
 * bearing pointer to the desired course and 45° (or as many degrees again, at
 * most 45°) beyond. Returns the heading, the intercept angle to the course
 * and whether that angle is within the FTI's 90° limit.
 */
export function interceptHeading({ method, course, radial }) {
  const spec = INTERCEPT_METHODS[method];
  if (!spec) throw new RangeError('Unknown intercept method.');
  finite('Course', course);
  finite('Radial', radial);
  const head = norm(radial + 180), tail = norm(radial);
  let heading, off;
  if (spec.inbound) {
    off = diff(head, course);
    const beyond = method === 'thirty' ? 30 : Math.min(Math.abs(off), 45);
    heading = norm(head + Math.sign(off) * beyond);
  } else {
    off = diff(course, tail);
    const beyond = method === 'fortyfive' ? 45 : Math.min(Math.abs(off), 45);
    heading = norm(course + Math.sign(off) * beyond);
  }
  const angle = Math.abs(diff(heading, course));
  return { heading, angle, off: Math.abs(off), onCourse: Math.abs(off) < 0.5, valid: angle <= 90 && Math.abs(off) < 90 };
}

/**
 * Lead before the course or arc (P-1204 pp. 65, 72): 1% of ground speed in NM
 * for a 90° turn; about 2/3 for 60°, 1/3 for 45°, very little for 30° or less.
 * Angles between those take the nearest listed ratio.
 */
export function leadNm(groundSpeed, turn = 90) {
  finite('Ground speed', groundSpeed);
  finite('Turn', turn);
  const full = groundSpeed / 100;
  const steps = [[90, 1, 'a 90° turn'], [60, 2 / 3, 'about 60°: 2/3'], [45, 1 / 3, 'about 45°: 1/3'], [30, 0, '30° or less: very little']];
  const [, ratio, label] = steps.reduce((best, s) => (Math.abs(s[0] - Math.min(turn, 90)) < Math.abs(best[0] - Math.min(turn, 90)) ? s : best));
  return { nm: full * ratio, full, ratio, label };
}

/** Distance between adjacent radials: 1 NM at 60 DME (P-1204 p. 66). */
export const radialSpacing = (dme) => dme / 60;

/* ---------- DME: ground speed checks and arcs (P-1204 pp. 71–76) ---------- */

/** Ground speed from a timed DME change flying direct to or from the station. */
export function groundSpeedCheck({ nm, minutes }) {
  finite('Distance', nm);
  finite('Time', minutes);
  if (minutes <= 0) throw new RangeError('Time must be positive.');
  return (Math.abs(nm) / minutes) * 60;
}

/** The FTI is only valid when DME ≥ altitude in thousands of feet. */
export const gsCheckValid = (dme, altitudeFt) => dme >= altitudeFt / 1000;

/**
 * Arc leads at a ground speed: radial-to-arc lead DME (arc DME plus 1% of
 * ground speed inbound, minus outbound) and arc-to-radial lead in radials
 * (60 ÷ arc DME × 1% of ground speed).
 */
export function arcLeads({ groundSpeed, arc, inbound = true, turn = 90 }) {
  finite('Ground speed', groundSpeed);
  finite('Arc', arc);
  if (arc <= 0) throw new RangeError('Arc DME must be positive.');
  const lead = leadNm(groundSpeed, turn);
  return {
    leadDme: inbound ? arc + lead.nm : arc - lead.nm,
    leadNm: lead.nm, ratioLabel: lead.label,
    leadRadials: (60 / arc) * (groundSpeed / 100),
    method: arc > 12 ? 'chord' : 'bank',
  };
}

/** The FTI's table of approximate lead radials at 250 KGS, including the inside-10-DME corrections. */
export const ARC_LEAD_TABLE = Object.freeze([
  { dme: 20, ninety: 7.5, inbound: null, outbound: null },
  { dme: 15, ninety: 10, inbound: null, outbound: null },
  { dme: 10, ninety: 15, inbound: 18, outbound: 13 },
  { dme: 7, ninety: 21, inbound: 27, outbound: 16 },
  { dme: 5, ninety: 30, inbound: 40, outbound: 20 },
]);

/**
 * Chord method around an arc: straight legs, turning to put the bearing
 * pointer `ahead` degrees ahead of the 90° benchmark each time it falls the
 * same amount behind. Turns are instantaneous; no wind. Returns the flown
 * path and its DME extremes over `sweep` degrees of arc.
 */
export function chordArc({ arc, ahead = 10, sweep = 90, start = 180, clockwise = true, step = 0.02 }) {
  finite('Arc', arc);
  finite('Ahead', ahead);
  if (arc <= 0 || ahead <= 0 || ahead >= 45) throw new RangeError('Arc must be positive and the lead between 0 and 45°.');
  const turn = clockwise ? 1 : -1;
  let { x, y } = tacanPosition({ radial: start, dme: arc });
  const bearingTo = () => norm(Math.atan2(-x, -y) / D);
  // Station on the inside wing: clockwise arcs keep it on the right.
  let heading = norm(bearingTo() - turn * (90 - ahead));
  const path = [{ x, y }], turns = [];
  let swept = 0, prev = start, min = arc, max = arc;
  for (let i = 0; i < 200000 && swept < sweep; i++) {
    x += step * Math.sin(heading * D);
    y += step * Math.cos(heading * D);
    const { radial, range } = fixOf({ x, y });
    swept += turn * diff(radial, prev);
    prev = radial;
    min = Math.min(min, range);
    max = Math.max(max, range);
    const relative = diff(bearingTo(), heading) * turn;
    if (relative >= 90 + ahead) {
      heading = norm(bearingTo() - turn * (90 - ahead));
      turns.push({ x, y });
    }
    if (i % 5 === 0) path.push({ x, y });
  }
  path.push({ x, y });
  return { path, turns, minDme: min, maxDme: max, legs: turns.length + 1 };
}

/* ---------- Waypoints, direct-to and steering ---------- */

const G = 9.80665;
const KT = M_PER_NM / 3600;

/** Level-turn radius in NM at a ground speed (no wind) and bank angle. */
export function turnRadius(groundSpeed, bank = 30) {
  return ((groundSpeed * KT) ** 2 / (G * Math.tan(bank * D))) / M_PER_NM;
}

/** Fly-by turn anticipation: start the turn R·tan(Δ/2) before the waypoint. */
export const anticipation = (groundSpeed, change, bank = 30) => turnRadius(groundSpeed, bank) * Math.tan(Math.abs(change) * D / 2);

const bearing = (a, b) => norm(Math.atan2(b.x - a.x, b.y - a.y) / D);
const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

/** Cross-track (positive: right of the leg) and along-track distance from a leg's start. */
export function legGeometry(from, to, p) {
  const len = distance(from, to);
  if (len < 1e-9) return { xtk: 0, along: 0, length: 0 };
  const ux = (to.x - from.x) / len, uy = (to.y - from.y) / len;
  const dx = p.x - from.x, dy = p.y - from.y;
  return { xtk: dx * uy - dy * ux, along: dx * ux + dy * uy, length: len };
}

/**
 * A route flight in steps of `dt` seconds. Track-to-fix legs join the
 * waypoints; `directTo(i)` starts a direct-to-fix leg from the present
 * position. Fly-by waypoints sequence at the turn-anticipation distance;
 * fly-over waypoints only once overhead. Steering asks for at most a 45°
 * intercept (4° per 0.1 NM off track) and turns at the bank angle's rate.
 */
export function routeFlight({ waypoints, groundSpeed = 300, bank = 30, flyOver = false, start, heading }) {
  if (!Array.isArray(waypoints) || waypoints.length < 2) throw new RangeError('A route needs at least two waypoints.');
  const rate = (G * Math.tan(bank * D)) / (groundSpeed * KT) / D;
  const s = { x: start?.x ?? waypoints[0].x, y: start?.y ?? waypoints[0].y, heading: heading ?? bearing(waypoints[0], waypoints[1]), active: 1, legFrom: { ...waypoints[0] }, leg: 'TF', done: false, t: 0 };
  function sequence() {
    s.legFrom = { ...waypoints[s.active] };
    s.leg = 'TF';
    s.active += 1;
    if (s.active >= waypoints.length) s.done = true;
  }
  function state() {
    const to = waypoints[Math.min(s.active, waypoints.length - 1)];
    const g = legGeometry(s.legFrom, to, s);
    return {
      x: s.x, y: s.y, heading: s.heading, t: s.t, active: s.active, leg: s.leg, done: s.done,
      bearing: bearing(s, to), distance: distance(s, to), xtk: g.xtk, desiredTrack: bearing(s.legFrom, to),
      timeToGo: (distance(s, to) / groundSpeed) * 3600,
    };
  }
  function step(dt = 1) {
    if (s.done) return state();
    const to = waypoints[s.active];
    const g = legGeometry(s.legFrom, to, s);
    const track = bearing(s.legFrom, to);
    const want = norm(track - Math.max(-45, Math.min(45, g.xtk * 40)));
    const turn = diff(want, s.heading);
    s.heading = norm(s.heading + Math.max(-rate * dt, Math.min(rate * dt, turn)));
    const d = groundSpeed * dt / 3600;
    s.x += d * Math.sin(s.heading * D);
    s.y += d * Math.cos(s.heading * D);
    s.t += dt;
    const next = waypoints[s.active + 1];
    const togo = g.length - legGeometry(s.legFrom, to, s).along;
    const change = next ? diff(bearing(to, next), track) : 0;
    const lead = !flyOver && next ? anticipation(groundSpeed, change, bank) : 0;
    if (togo <= Math.max(lead, 0.05)) sequence();
    return state();
  }
  function directTo(i) {
    if (i < 1 || i >= waypoints.length) throw new RangeError('No such waypoint.');
    s.legFrom = { x: s.x, y: s.y };
    s.active = i;
    s.leg = 'DF';
    s.done = false;
    return state();
  }
  return { step, directTo, state, turnRate: rate };
}

/* ---------- Flying a course on the HSI ---------- */

/**
 * The simplified HSI drawn by the figures: the CDI bar's half-length and the
 * dot spacing, both as fractions of the rose radius. The "aim at the top of
 * the bar" picture depends on their ratio.
 */
export const HSI_BAR = Object.freeze({ halfLength: 0.55, dot: 0.18 });

/**
 * Heading change toward the course when the nose is pointed at the top end
 * of the deflected CDI bar: the bar is drawn `dots` dots off the course
 * arrow's axis and reaches `halfLength` ahead of the centre, so the angle is
 * atan(offset / halfLength). Signed like `dots` (positive: course to the right).
 */
export const barAimAngle = (dots) => Math.atan((dots * HSI_BAR.dot) / HSI_BAR.halfLength) / D;

/**
 * Signed distance from the line of a course through the station, in NM:
 * positive when the course line is to the right of an aircraft flying the
 * course's direction (the same sense as the CDI bar).
 */
export function crossTrack({ x, y }, course) {
  return -(x * Math.cos(course * D) - y * Math.sin(course * D));
}

export const PILOT_MODES = Object.freeze({
  hold: 'Hold heading',
  homing: 'Homing: bearing pointer on the nose',
  track: 'Track the course',
  method: 'FTI intercept method, then track',
  picture: 'Aim the nose at the top of the bar',
  pictureTrack: 'Aim the ground-track marker at the top of the bar',
});

/**
 * Fly an aircraft against one TACAN/VOR course, one simulated second per
 * step. The station is at the origin and positions are in NM (x east, y
 * north); all directions are magnetic with no variation. The simulated pilot
 * turns at a half standard rate, 1.5°/s, the FTI's rate for intercepts, and
 * through the cone of confusion (within 1 NM of the station) holds heading.
 *
 * Modes: `hold` keeps the heading bug; `homing` keeps the bearing pointer's
 * head on the nose; `track` crabs into the wind and steers off any cross-track
 * error; `method` turns to the FTI intercept heading (`method` names an
 * INTERCEPT_METHODS key), holds it, starts the turn onto the course where a
 * 1.5°/s turn rolls out on it, then tracks; `picture` points the nose at the
 * top end of the CDI bar; `pictureTrack` puts the ground track there instead.
 */
export function courseFlight({ course, radial, dme, heading, tas = 250, windFrom = 0, windSpeed = 0, mode = 'hold', method = 'thirty', rate = 1.5 }) {
  for (const [name, v] of [['Course', course], ['Radial', radial], ['Range', dme], ['Heading', heading], ['True airspeed', tas]]) finite(name, v);
  if (!PILOT_MODES[mode]) throw new RangeError('Unknown pilot mode.');
  const p = tacanPosition({ radial, dme });
  const wind = { x: -windSpeed * Math.sin(windFrom * D), y: -windSpeed * Math.cos(windFrom * D) };
  const s = { x: p.x, y: p.y, heading: norm(heading), bug: norm(heading), course: norm(course), t: 0, phase: 'start', interceptHeading: null };
  if (mode === 'method') {
    const icpt = interceptHeading({ method, course, radial });
    s.interceptHeading = icpt.heading;
    s.phase = icpt.onCourse ? 'track' : 'intercept';
  }
  // Heading that makes good a ground track, from the wind triangle.
  const headingFor = (track) => {
    if (!windSpeed) return norm(track);
    try { return windTriangle({ course: track, tas, windFrom, windSpeed }).heading; } catch { return norm(track); }
  };
  const radius = () => (tas / 3600) / (rate * D);
  function state() {
    const { radial: r, range } = fixOf(s);
    const view = hsi({ radial: r, course: s.course });
    const vx = tas * Math.sin(s.heading * D) + wind.x, vy = tas * Math.cos(s.heading * D) + wind.y;
    return {
      x: s.x, y: s.y, t: s.t, heading: s.heading, bug: s.bug, course: s.course, phase: s.phase, mode,
      radial: r, range, ...view, xtk: crossTrack(s, s.course),
      groundSpeed: Math.hypot(vx, vy), track: norm(Math.atan2(vx, vy) / D), drift: diff(norm(Math.atan2(vx, vy) / D), s.heading),
      cone: range < 1, aim: barAimAngle(view.dots), interceptHeading: s.interceptHeading,
    };
  }
  function want(st) {
    if (st.cone && mode !== 'hold') return s.heading;
    const trackFix = () => headingFor(norm(s.course - Math.max(-30, Math.min(30, st.xtk * -30))));
    switch (mode) {
      case 'hold': return s.bug;
      case 'homing': return st.head;
      case 'track': return trackFix();
      case 'picture': return norm(s.course + st.aim);
      case 'pictureTrack': return headingFor(norm(s.course + st.aim));
      case 'method': {
        if (s.phase === 'intercept') {
          const angle = Math.abs(diff(s.interceptHeading, s.course));
          const lead = radius() * (1 - Math.cos(angle * D));
          const closing = Math.sign(st.xtk) === Math.sign(diff(s.heading, s.course));
          if (Math.abs(diff(s.heading, s.interceptHeading)) < 1 && closing && Math.abs(st.xtk) <= lead + 0.02) s.phase = 'rollout';
          else return s.interceptHeading;
        }
        if (s.phase === 'rollout' && Math.abs(diff(s.heading, headingFor(s.course))) < 2) s.phase = 'track';
        return s.phase === 'rollout' ? headingFor(s.course) : trackFix();
      }
    }
  }
  function step() {
    const st = state();
    const turn = diff(want(st), s.heading);
    s.heading = norm(s.heading + Math.max(-rate, Math.min(rate, turn)));
    if (s.phase === 'start') s.phase = 'flying';
    const vx = tas * Math.sin(s.heading * D) + wind.x, vy = tas * Math.cos(s.heading * D) + wind.y;
    s.x += vx / 3600;
    s.y += vy / 3600;
    s.t += 1;
    return state();
  }
  return {
    step, state,
    setBug(h) { finite('Heading', h); s.bug = norm(h); return state(); },
    setCourse(c) { finite('Course', c); s.course = norm(c); return state(); },
  };
}
