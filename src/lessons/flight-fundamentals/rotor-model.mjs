// Pure numerical models for the Rotor-Wing Principles of Flight module. No DOM
// access. Knots, feet, pounds and shaft horsepower at the boundary; SI inside.
import { FT, KT, LBF, RHO0 } from './lesson-model.mjs';

const rad = (d) => d * Math.PI / 180;
const deg = (r) => r * 180 / Math.PI;
const HP = 745.7; // W per horsepower

// An invented utility helicopter with round numbers, used only to put figures
// on the ideas. It is not any real type; its size is of the order of a
// medium utility helicopter's. Blade pitch is quoted at 75% of the radius,
// with the blade twisted 8° nose-down from root to tip.
export const ROTOR = {
  radius: 27, // ft
  rpm: 260,
  blades: 4,
  chord: 1.75, // ft
  twist: -8, // degrees of pitch change from root to tip
  cd0: 0.010, // blade profile drag coefficient
  kappa: 1.15, // induced power factor over ideal momentum theory
  flatPlate: 25, // ft², equivalent parasite area of the airframe
  weight: 16000, // lb
  powerAvailable: 2000, // shp at sea level, falling with density
};
export const CRITICAL_AOA = 15; // degrees, about (FAA-H-8083-21B p. 11-15)
export const SPEED_OF_SOUND = 661.5; // kt, ISA sea level

const omegaOf = (r) => r.rpm * 2 * Math.PI / 60; // rad/s
const tipSpeed = (r) => omegaOf(r) * r.radius * FT; // m/s
const diskArea = (r) => Math.PI * (r.radius * FT) ** 2; // m²
export const solidity = (r = ROTOR) => r.blades * r.chord / (Math.PI * r.radius);

// ISA troposphere density at a density altitude in feet.
export function densityAt(altitude) {
  if (!Number.isFinite(altitude) || altitude > 36000) return null;
  return RHO0 * (1 - 6.8756e-6 * altitude) ** 4.2559;
}

// Rotor in forward flight, seen from above. A blade element at radius r meets
// the air at Ω·r plus the forward speed on the advancing side and Ω·r minus it
// on the retreating side (at 90° and 270° of azimuth). Inboard of V/Ω on the
// retreating side the air meets the blade from its trailing edge: reverse flow.
// Lift varies with the square of velocity, so the ratio of the tip speeds
// squared shows how unequal the two sides would be without flapping
// (FM 3-04.203 ¶1-29 to 1-33; FAA-H-8083-21B p. 2-20). The advancing tip's
// Mach number is its speed over the sea-level speed of sound.
export function rotorSpeeds({ speed, radius = ROTOR.radius, rpm = ROTOR.rpm }) {
  if (!(speed >= 0) || !(radius > 0) || !(rpm > 0)) return null;
  const omega = rpm * 2 * Math.PI / 60; // rad/s
  const tip = omega * radius * FT / KT; // knots
  const advancing = tip + speed, retreating = tip - speed;
  return {
    tip, advancing, retreating,
    mu: speed / tip, // advance ratio
    reverseRadius: Math.min(radius, speed * KT / FT / omega), // ft from the hub
    tipLiftRatio: retreating > 0 ? (advancing / retreating) ** 2 : null,
    advancingMach: advancing / SPEED_OF_SOUND,
  };
}

// One blade element in a hover, seen end-on. The rotational relative wind is
// Ω·r, flowing in the plane of rotation; induced flow comes down through the
// disk; their resultant meets the blade at the inflow angle φ below the plane.
// The blade's pitch (angle of incidence) is set by the collective and twist;
// its angle of attack is the pitch less the inflow angle
// (FAA-H-8083-21B pp. 2-8 to 2-13).
export function bladeElement({ station, pitch, induced, rotor = ROTOR }) {
  if (!(station > 0 && station <= 1) || !Number.isFinite(pitch) || !(induced >= 0)) return null;
  const rotational = omegaOf(rotor) * station * rotor.radius; // ft/s
  const localPitch = pitch + rotor.twist * (station - 0.75);
  const inflow = deg(Math.atan2(induced, rotational));
  const aoa = localPitch - inflow;
  return {
    rotational: rotational * FT / KT, // kt
    resultant: Math.hypot(rotational, induced) * FT / KT, // kt
    pitch: localPitch, inflow, aoa, stalled: aoa > CRITICAL_AOA,
  };
}

// Cyclic and gyroscopic precession, rotor turning counterclockwise seen from
// above, so a blade passes the nose, then the left side, the tail and the right
// side. A force on the disk shows as a deflection about 90° later in rotation,
// so to tip the disk toward the stick, the pitch is least 90° before the blade
// reaches that side and greatest 90° after (FAA-H-8083-21B pp. 2-17, 3-4).
export const POSITIONS = ['nose', 'left', 'tail', 'right']; // in the order a blade meets them
export function cyclicPitch(direction) {
  const i = POSITIONS.indexOf(direction);
  if (i < 0) return null;
  const at = (k) => POSITIONS[(i + k + 4) % 4];
  return { tiltDown: direction, tiltUp: at(2), leastPitch: at(-1), mostPitch: at(1) };
}

// Power required in level flight, shp, by momentum and blade-element theory
// in their simplest textbook forms. Induced power: thrust times the induced
// velocity, which in a hover is √(T / 2ρA) and falls as forward speed brings
// more air through the disk (Glauert's relation), times a factor for losses.
// Profile power: the blades' own drag, rising a little with advance ratio.
// Parasite power: the airframe's drag, rising with the cube of the speed.
export function powerRequired({ speed, weight = ROTOR.weight, rho = RHO0, rotor = ROTOR }) {
  if (!(speed >= 0) || !(weight > 0) || !(rho > 0)) return null;
  const T = weight * LBF, A = diskArea(rotor), vt = tipSpeed(rotor), v = speed * KT;
  const vh = Math.sqrt(T / (2 * rho * A));
  const vi = Math.sqrt((-v * v + Math.sqrt(v ** 4 + 4 * vh ** 4)) / 2);
  const mu = v / vt;
  const induced = rotor.kappa * T * vi / HP;
  const profile = solidity(rotor) * rotor.cd0 / 8 * rho * A * vt ** 3 * (1 + 4.65 * mu * mu) / HP;
  const parasite = 0.5 * rho * rotor.flatPlate * FT * FT * v ** 3 / HP;
  return { induced, profile, parasite, total: induced + profile + parasite, inducedVelocity: vi / FT, hoverInducedVelocity: vh / FT };
}
// Power available, shp: the example engine's sea-level rating, falling in
// proportion to density (illustrative).
export const powerAvailable = (rho = RHO0, rotor = ROTOR) => rotor.powerAvailable * rho / RHO0;

// The power curve's landmarks: the speed for minimum power (VY in the FAA's
// figure) and the highest level-flight speed the available power reaches (VH).
export function powerCurve({ weight = ROTOR.weight, rho = RHO0, rotor = ROTOR, top = 200 } = {}) {
  const at = (speed) => powerRequired({ speed, weight, rho, rotor }).total;
  let vy = 0;
  for (let s = 0; s <= top; s += 0.5) if (at(s) < at(vy)) vy = s;
  const available = powerAvailable(rho, rotor);
  let vh = null;
  if (at(vy) <= available) {
    let lo = vy, hi = top;
    if (at(hi) <= available) vh = hi;
    else {
      for (let i = 0; i < 50; i++) { const mid = (lo + hi) / 2; if (at(mid) <= available) lo = mid; else hi = mid; }
      vh = lo;
    }
  }
  const hover = at(0);
  return { vy, minPower: at(vy), hover, available, canHover: hover <= available, vh };
}

// Vortex ring state: the FAA's combination of conditions likely to cause it in
// any helicopter: a vertical or nearly vertical descent of at least 300 fpm,
// the rotor using some of the available power (20 to 100 percent), and
// horizontal speed slower than effective translational lift, which the same
// handbook puts between about 16 and 24 knots (FAA-H-8083-21B pp. 2-22,
// 11-10). Between 16 and 24 kt the check reports the edge of ETL.
export const ETL = [16, 24];
export function vortexRingCheck({ descent, speed, power }) {
  if (![descent, speed, power].every(Number.isFinite) || speed < 0) return null;
  const descending = descent >= 300;
  const powered = power >= 20 && power <= 100;
  const belowEtl = speed < ETL[0];
  const atEtl = speed >= ETL[0] && speed <= ETL[1];
  return { descending, powered, belowEtl, atEtl, likely: descending && powered && belowEtl };
}

// Autorotation regions along the blade in a vertical autorotation. The
// handbook's normal sizes: the inner 25% of the radius is stalled, the
// driving region lies between 25 and 70%, and the outer 30% is the driven
// region. Raising the collective moves the equilibrium points inboard, so the
// driven and stall regions grow, the driving region shrinks and rotor rpm
// falls; lowering it does the opposite (FAA-H-8083-21B pp. 2-25 to 2-26).
// `collective` is a step from the balanced setting, −3 (down) to +3 (up); the
// boundary movement per step is illustrative, chosen only to show the
// direction the handbook describes.
export function autorotationRegions(collective) {
  if (!Number.isFinite(collective) || Math.abs(collective) > 3) return null;
  const stallEdge = 0.25 + 0.03 * collective; // fraction of radius
  const drivenEdge = 0.70 - 0.05 * collective;
  return {
    stall: stallEdge, driving: drivenEdge - stallEdge, driven: 1 - drivenEdge,
    stallEdge, drivenEdge,
    rpm: collective > 0 ? 'falling' : collective < 0 ? 'rising' : 'steady',
  };
}

// Load factor a level, coordinated turn asks of the rotor: 1 / cos(bank).
export const turnLoad = (bank) => (bank >= 0 && bank < 90 ? 1 / Math.cos(rad(bank)) : null);
