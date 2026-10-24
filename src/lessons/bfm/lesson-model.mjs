// Pure numerical models for the BFM module. No DOM access.
//
// Plan-view frame: x east (ft), y north (ft); headings and bearings are degrees
// clockwise from north (a local reference, not magnetic or true). Speeds are
// knots; the level-turn model treats them as true airspeed in still air.

export const G0 = 9.80665; // m/s², standard gravity
export const KT = 1852 / 3600; // m/s per knot
export const FT = 0.3048; // m per foot

// Source figures for the T-45C (CNATRA P-1289, pp. 4-3 to 4-5, 5-2 to 5-3).
export const T45 = {
  corner: 410, // KIAS
  loadLimit: 7.33, // G, above 5,000 ft
  cornerBleed: 8, // kt/s in a max-performance pull at corner
  bubbleRadius: 3000, // ft, typical turn radius used for the bubble
  controlZone: [2000, 4000], // ft behind the maneuvering aircraft
};

const rad = (d) => d * Math.PI / 180;
const deg = (r) => r * 180 / Math.PI;
export const norm = (a) => ((a % 360) + 360) % 360;
// Smallest angle between two directions, 0–180.
export const between = (a, b) => { const d = Math.abs(norm(a) - norm(b)); return d > 180 ? 360 - d : d; };
const bearing = (from, to) => norm(deg(Math.atan2(to.x - from.x, to.y - from.y)));

// Level, coordinated turn at load factor n and true airspeed V:
// bank φ = arccos(1/n); radial acceleration a = g·√(n² − 1);
// radius r = V²/a; rate ω = a/V.
export function levelTurn({ speed, g }) {
  if (!(speed > 0) || !(g > 1)) return null;
  const v = speed * KT;
  const a = G0 * Math.sqrt(g * g - 1);
  return { bank: deg(Math.acos(1 / g)), radius: v * v / a / FT, rate: deg(a / v) };
}

// Radial G in a wings-level vertical turn at load factor n: gravity's radial
// component is −cos θ, where θ is the pitch angle around the loop (0 at the
// bottom, 90 pointing straight up, 180 inverted at the top).
export const radialG = (n, theta) => n - Math.cos(rad(theta));

// P-1289 p. 4-8 rule of thumb: maximum nose-low degrees is 10% of the altitude
// above the deck in feet (5,000 ft → 50°). Capped at 90° (pure nose-low).
export function maxNoseLow(aboveDeck) {
  if (!(aboveDeck >= 0)) return null;
  return Math.min(90, aboveDeck / 100);
}

// P-1289 T-45 airspeed bands (KIAS) and the max-performance pull that applies.
export const BANDS = [
  { id: 'radius', lo: 140, hi: 180, label: 'Minimum radius' },
  { id: 'sustained', lo: 240, hi: 330, label: 'Best sustained turn rate' },
  { id: 'vertical', lo: 300, hi: 300, label: 'Minimum vertical airspeed' },
  { id: 'tactical', lo: 350, hi: 350, label: 'Tactical vertical airspeed' },
  { id: 'corner', lo: 410, hi: 410, label: 'Corner airspeed' },
];
export function speedBand(kias) {
  if (!(kias > 0)) return null;
  return {
    bands: BANDS.filter((b) => kias >= b.lo && kias <= b.hi).map((b) => b.id),
    pull: kias > T45.corner ? 'load' : kias < T45.corner ? 'lift' : 'corner',
    belowVertical: kias < 300,
  };
}

// Relative geometry of fighter and bandit, each { x, y, heading }.
// aon: bandit's angle off the fighter's nose (measured at the fighter).
// aspect: target aspect, the angle from the bandit's nose to the fighter.
// aot: the fighter's angle off the bandit's tail, 180 − aspect.
export function geometry(fighter, bandit) {
  const range = Math.hypot(bandit.x - fighter.x, bandit.y - fighter.y);
  if (range === 0) return null;
  const los = bearing(fighter, bandit);
  const back = bearing(bandit, fighter);
  const aon = between(los, fighter.heading);
  const aspect = between(back, bandit.heading);
  // The bandit's two max-performance turn circles sit abeam it, one each side.
  const centres = [-90, 90].map((side) => {
    const b = rad(bandit.heading + side);
    return { x: bandit.x + T45.bubbleRadius * Math.sin(b), y: bandit.y + T45.bubbleRadius * Math.cos(b) };
  });
  const inBubble = centres.some((c) => Math.hypot(fighter.x - c.x, fighter.y - c.y) < T45.bubbleRadius);
  return {
    range, los, aon, aspect, aot: 180 - aspect,
    behindLine: aspect > 90,
    inBubble,
    inControlRange: aspect > 90 && range >= T45.controlZone[0] && range <= T45.controlZone[1],
    centres,
  };
}

// Kinematic pursuit illustration. The bandit flies a constant-speed level turn;
// the fighter flies at constant speed and turns toward an aim point at most
// maxRate °/s. Lead aims ahead of the bandit along its velocity, lag behind it.
// Not an energy or performance model.
export function pursuit({ mode, steps = 240, dt = 0.1, aim = 1.5 }) {
  const bv = 350 * KT / FT; // ft/s
  const fv = 350 * KT / FT;
  const bRate = rad(deg(bv / T45.bubbleRadius)); // rad/s for a 3,000 ft circle
  const fRate = rad(15);
  const lead = { lead: aim, pure: 0, lag: -aim }[mode];
  if (lead === undefined) throw new RangeError(`Unknown pursuit mode: ${mode}`);
  let b = { x: 0, y: 0, h: rad(90) };
  let f = { x: -6000 * Math.sin(rad(45)), y: -6000 * Math.cos(rad(45)), h: rad(90) };
  const track = [];
  for (let i = 0; i <= steps; i++) {
    const g = geometry({ x: f.x, y: f.y, heading: deg(f.h) }, { x: b.x, y: b.y, heading: deg(b.h) });
    track.push({ t: i * dt, fighter: { ...f }, bandit: { ...b }, range: g?.range ?? 0, aot: g?.aot ?? 0 });
    const target = { x: b.x + lead * bv * Math.sin(b.h), y: b.y + lead * bv * Math.cos(b.h) };
    const want = Math.atan2(target.x - f.x, target.y - f.y);
    let err = want - f.h;
    err = Math.atan2(Math.sin(err), Math.cos(err));
    f.h += Math.max(-fRate * dt, Math.min(fRate * dt, err));
    f = { x: f.x + fv * Math.sin(f.h) * dt, y: f.y + fv * Math.cos(f.h) * dt, h: f.h };
    b.h += bRate * dt;
    b = { x: b.x + bv * Math.sin(b.h) * dt, y: b.y + bv * Math.cos(b.h) * dt, h: b.h };
  }
  return track;
}
