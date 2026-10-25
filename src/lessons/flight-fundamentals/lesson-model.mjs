// Pure numerical models for the Flight Fundamentals module. No DOM access.
//
// SI internally; knots, feet and pounds at the boundary. Speeds are true
// airspeed in still air unless a function says otherwise. Angles in degrees.

export const G0 = 9.80665; // m/s², standard gravity
export const KT = 1852 / 3600; // m/s per knot
export const FT = 0.3048; // m per foot
export const LBF = 4.4482216152605; // N per pound-force
export const RHO0 = 1.225; // kg/m³, ISA sea level

const rad = (d) => d * Math.PI / 180;
const deg = (r) => r * 180 / Math.PI;

// An invented light airplane with round numbers, used only to put figures on
// the equations. It is not any real type.
export const EXAMPLE = {
  weight: 2300, // lb
  wingArea: 174, // ft²
  clMax: 1.6, // flaps up
  cd0: 0.031, // zero-lift (parasite) drag coefficient
  aspectRatio: 7.4,
  oswald: 0.75,
};

// Lift coefficient against angle of attack for an illustrative cambered
// section: linear from zero lift at −2° at 0.1 per degree up to a knee 4°
// before the critical angle, then a parabola that keeps the slope at the knee
// and flattens to zero slope at the critical angle, where CL peaks at
// CLmax = 0.1 × 14 + 0.1 × 4 / 2 = 1.6. Past it the flow separates and lift
// falls away (shape illustrative only).
export const AIRFOIL = { zeroLift: -2, slope: 0.1, knee: 12, critical: 16 };
export const clMaxOf = (a = AIRFOIL) => a.slope * (a.knee - a.zeroLift) + a.slope * (a.critical - a.knee) / 2;
export function liftCoefficient(alpha, a = AIRFOIL) {
  if (!Number.isFinite(alpha)) return null;
  if (alpha <= a.knee) return a.slope * (alpha - a.zeroLift);
  const span = a.critical - a.knee;
  if (alpha <= a.critical) {
    const x = alpha - a.knee;
    return a.slope * (a.knee - a.zeroLift) + a.slope * x - a.slope / (2 * span) * x * x;
  }
  return Math.max(0.6 * clMaxOf(a), clMaxOf(a) - 0.04 * (alpha - a.critical) ** 1.3);
}
// Angle of attack that gives a lift coefficient on the unstalled side, or null
// if it needs more than CLmax.
export function alphaFor(cl, a = AIRFOIL) {
  if (!Number.isFinite(cl) || cl > clMaxOf(a) + 1e-12) return null;
  let lo = -10, hi = a.critical;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (liftCoefficient(mid, a) < cl) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

const q = (speedKt, rho = RHO0) => 0.5 * rho * (speedKt * KT) ** 2; // Pa
const area = (p) => p.wingArea * FT * FT;
const weight = (p) => p.weight * LBF;

// Lift L = ½ρV²·S·CL, in pounds.
export const lift = ({ speed, cl, plane = EXAMPLE, rho = RHO0 }) => q(speed, rho) * area(plane) * cl / LBF;

// Lift coefficient needed to carry load factor n at a speed.
export const requiredCl = ({ speed, n = 1, plane = EXAMPLE, rho = RHO0 }) =>
  speed > 0 ? n * weight(plane) / (q(speed, rho) * area(plane)) : null;

// 1 G stall speed: the speed at which CLmax just carries the weight.
export function stallSpeed({ n = 1, plane = EXAMPLE, rho = RHO0 } = {}) {
  if (!(n > 0)) return null;
  return Math.sqrt(2 * n * weight(plane) / (rho * area(plane) * plane.clMax)) / KT;
}

// Level, coordinated turn: n = 1/cos φ; the horizontal lift component
// L sin φ = W tan φ supplies the centripetal force, so r = V²/(g tan φ) and
// ω = g tan φ / V.
export function loadFactor(bank) {
  if (!(bank >= 0) || bank >= 90) return null;
  return 1 / Math.cos(rad(bank));
}
export function levelTurn({ speed, bank }) {
  const n = loadFactor(bank);
  if (n === null || !(speed > 0)) return null;
  const v = speed * KT;
  if (bank === 0) return { n: 1, radius: Infinity, rate: 0, fullTurn: Infinity };
  const a = G0 * Math.tan(rad(bank));
  const rate = deg(a / v);
  return { n, radius: v * v / a / FT, rate, fullTurn: 360 / rate };
}
// Stall speed rises with the square root of load factor.
export const stallSpeedAt = (vs1, n) => (vs1 > 0 && n > 0 ? vs1 * Math.sqrt(n) : null);

// The stall boundary of a V-n diagram: the most load factor CLmax can make
// at a speed, n = (V / Vs1)². Maneuvering speed sits where it meets the limit
// load: VA = Vs1·√n_limit.
export const maxLoadFactor = (speed, vs1) => (speed >= 0 && vs1 > 0 ? (speed / vs1) ** 2 : null);
export const maneuveringSpeed = (vs1, limit) => (vs1 > 0 && limit > 0 ? vs1 * Math.sqrt(limit) : null);

// Drag in steady level flight, pounds: parasite D_p = q·S·CD0 grows with V²;
// induced D_i = k·W²/(q·S) with k = 1/(π·e·AR) falls with 1/V². Their sum is
// least where they are equal, which is the L/Dmax speed.
export function dragPolar(plane = EXAMPLE) {
  const k = 1 / (Math.PI * plane.oswald * plane.aspectRatio);
  const at = (speed, rho = RHO0) => {
    const qs = q(speed, rho) * area(plane);
    const parasite = qs * plane.cd0 / LBF;
    const induced = k * weight(plane) ** 2 / qs / LBF;
    return { parasite, induced, total: parasite + induced };
  };
  const ldMax = 1 / (2 * Math.sqrt(k * plane.cd0));
  const minDragSpeed = (rho = RHO0) =>
    Math.sqrt(2 * weight(plane) / (rho * area(plane)) * Math.sqrt(k / plane.cd0)) / KT;
  return { k, at, ldMax, minDragSpeed, minDrag: plane.weight / ldMax };
}

// Steady straight climb or descent at flight-path angle γ (positive up):
// along the path T = D + W sin γ; across it L = W cos γ.
export function steadyPath({ gamma, drag, plane = EXAMPLE }) {
  if (!(Math.abs(gamma) < 90) || !(drag >= 0)) return null;
  const w = plane.weight;
  return { lift: w * Math.cos(rad(gamma)), thrust: drag + w * Math.sin(rad(gamma)), weight: w, drag };
}

// Specific energy (energy height), feet: Es = h + V²/2g, V true airspeed.
export function energyHeight(altitude, speed) {
  if (!Number.isFinite(altitude) || !(speed >= 0)) return null;
  return altitude + (speed * KT) ** 2 / (2 * G0) / FT;
}
// Airspeed left after trading altitude for speed at constant energy height.
export function speedAt(es, altitude) {
  const head = es - altitude;
  if (!(head >= 0)) return null;
  return Math.sqrt(2 * G0 * head * FT) / KT;
}

// Response of a disturbed system over time, for the stability figure.
// static: 'positive' returns toward zero, 'neutral' stays, 'negative' diverges.
// dynamic (only with positive static stability): 'positive' damped
// oscillation, 'neutral' constant amplitude, 'negative' growing.
export function stabilityResponse({ kind, t }) {
  const w = 2 * Math.PI / 4; // 4 s period, illustrative
  switch (kind) {
    case 'static-positive': return Math.exp(-0.9 * t);
    case 'static-neutral': return 1;
    case 'static-negative': return Math.exp(0.35 * t);
    case 'dynamic-positive': return Math.exp(-0.25 * t) * Math.cos(w * t);
    case 'dynamic-neutral': return Math.cos(w * t);
    case 'dynamic-negative': return Math.exp(0.12 * t) * Math.cos(w * t);
    default: return null;
  }
}
