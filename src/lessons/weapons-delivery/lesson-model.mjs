/* Pure, deterministic models for the Weapons Delivery module.
 * Pattern numbers, initial sight settings and error sensitivities are the
 * T-45 Weapons FTI's (CNATRA P-1219, (4-03), pp. 21-23, 36 and 39). The
 * trajectory sketch is a no-drag point-mass fall, drawn only for its shape;
 * misses come from the FTI's table, not from the sketch.
 * Educational models, not validated procedure or aircraft performance.
 */

const D = Math.PI / 180;
const G_FT = 32.174;
const FPS_PER_KT = 1.68781;

// P-1219 Figures 10-12 (pp. 21-23) and the initial sight settings on p. 36.
export const PATTERNS = {
  30: { dive: 30, patternAlt: 8000, patternKias: 250, release: 3000, minRelease: 2700, releaseKtas: 450, mils: 128, initialMils: 65, radalt: 1700, weather: '8,500/5' },
  20: { dive: 20, patternAlt: 6000, patternKias: 300, release: 2000, minRelease: 1800, releaseKtas: 450, mils: 130, initialMils: 70, radalt: 1200, weather: '6,500/5' },
  10: { dive: 10, patternAlt: 2500, patternKias: 350, release: 1000, minRelease: 900, releaseKtas: 450, mils: 117, initialMils: 55, radalt: 600, weather: '3,000/5' },
};

// P-1219 Figure 20 (p. 39), bomb rows: an error of 1° of dive, 10 kt of
// airspeed, or the given release-altitude change each moves the hit `miss` ft.
// Steep, fast or low is long; shallow, slow or high is short.
export const SENSITIVITY = {
  30: { miss: 50, altFt: 100 },
  20: { miss: 50, altFt: 100 },
  10: { miss: 80, altFt: 70 },
};

function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number.`);
}

/**
 * Where a bomb hits along the run-in line, in ft (positive long, negative
 * short), from the FTI's error sensitivities, with the pipper on the aimpoint
 * at release, wings level and correct g. Errors add or cancel (P-1219 p. 42).
 */
export function bombMiss(dive, { diveError = 0, speedError = 0, altError = 0 } = {}) {
  const s = SENSITIVITY[dive];
  if (!s) throw new RangeError(`No sensitivities for a ${dive}° delivery.`);
  for (const [k, v] of Object.entries({ diveError, speedError, altError })) finite(k, v);
  const parts = {
    dive: s.miss * diveError,
    speed: s.miss * speedError / 10,
    alt: -s.miss * altError / s.altFt,
  };
  return { ...parts, total: parts.dive + parts.speed + parts.alt };
}

/** Release below the FTI's minimum release altitude for that pattern. */
export const belowMinimum = (dive, altError) => PATTERNS[dive].release + altError < PATTERNS[dive].minRelease;

/** Wind offset aimpoint distance in ft: D = 1.7 × T × W (P-1219 p. 3). */
export function offsetAimpoint(timeOfFall, windKt) {
  finite('timeOfFall', timeOfFall); finite('windKt', windKt);
  return 1.7 * timeOfFall * windKt;
}

/**
 * No-drag fall from a release at `alt` ft in a `dive`° dive at `ktas`:
 * time of fall (s), down-range travel (ft), slant range (ft), and the
 * trajectory drop below the flight path (degrees). Shape only: real bombs
 * have drag, and the sight setting also carries the angle of attack.
 */
export function vacuumFall(alt, dive, ktas) {
  for (const [k, v] of Object.entries({ alt, dive, ktas })) finite(k, v);
  const v = ktas * FPS_PER_KT;
  const vy = v * Math.sin(dive * D);
  const t = (-vy + Math.sqrt(vy * vy + 2 * G_FT * alt)) / G_FT;
  const range = v * Math.cos(dive * D) * t;
  return { time: t, range, slant: Math.hypot(range, alt), drop: Math.atan2(alt, range) / D - dive };
}

/** Points (x down-range from release, y height) along that no-drag fall. */
export function vacuumPath(alt, dive, ktas, steps = 24) {
  const { time } = vacuumFall(alt, dive, ktas);
  const v = ktas * FPS_PER_KT;
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = time * i / steps;
    return [v * Math.cos(dive * D) * t, alt - v * Math.sin(dive * D) * t - G_FT * t * t / 2];
  });
}

/** Mils in a degree: 6,400 mils to a circle (P-1219 p. 29). */
export const milsFromDegrees = (deg) => deg * 6400 / 360;

/**
 * One quiz question: a delivery with one or two errors, and the hit the FTI's
 * table gives for it, rounded to the nearest 10 ft.
 */
export function missQuestion(random = Math.random) {
  const dives = [30, 20, 10];
  const dive = dives[Math.floor(random() * dives.length)];
  const pick = (xs) => xs[Math.floor(random() * xs.length)];
  const kinds = pick([['diveError'], ['speedError'], ['altError'], ['diveError', 'speedError'], ['diveError', 'altError']]);
  const errors = { diveError: 0, speedError: 0, altError: 0 };
  for (const k of kinds) {
    if (k === 'diveError') errors.diveError = pick([-2, -1, 1, 2]);
    if (k === 'speedError') errors.speedError = pick([-20, -10, 10, 20]);
    if (k === 'altError') errors.altError = pick([1, 2]) * SENSITIVITY[dive].altFt;
  }
  const total = Math.round(bombMiss(dive, errors).total / 10) * 10 || 0;
  return { dive, errors, total };
}

/** "100 ft long", "50 ft short" or "On target". */
export function describeMiss(ft) {
  const r = Math.round(ft);
  if (r === 0) return 'On target';
  return `${Math.abs(r).toLocaleString('en-US')} ft ${r > 0 ? 'long' : 'short'}`;
}

// The T-45 pop-up pattern attack (P-1219 p. 45), in order, for Figure 2.
export const POP_STEPS = [
  { id: 'ingress', title: 'Run-in', text: 'Turn in over the run-in line with the target about 4 NM off the nose, at MRT, ingressing level at 700–1,000 ft AGL.' },
  { id: 'pop', title: 'Pull-up point', text: 'At about 2.5 NM the target is about 5° down in the HUD. Roll 30° of bank away from the pattern and pull to 30° nose up with 17 units: about 30° of heading change.' },
  { id: 'climb', title: 'Climb', text: 'At 30° nose up, roll wings level in the climb and reacquire the target. The pop is offset to one side so you keep the target in sight.' },
  { id: 'rollin', title: 'Roll-in', text: 'Passing 2,000 ft AGL, roll to put the lift vector on the target and pull down. Only a few seconds pass between wings level in the climb and the pull-down.' },
  { id: 'track', title: 'Track', text: 'Roll out in a standard 10° dive over the run-in line and track as in the low pattern, here with CCIP.' },
  { id: 'release', title: 'Release', text: 'Release wings level in about 1 g, no lower than the minimum release altitude.' },
  { id: 'recover', title: 'Recover', text: 'Recover straight ahead to 1,000 ft AGL, call off, and turn to the abeam.' },
];
