// Three-dimensional maneuver models for the BFM module's ribbon figures. No DOM.
//
// Frame: x east, y north, z up, all in feet; time in seconds. Each aircraft is a
// point mass flying at the end of its lift vector: the pilot sets the lift
// vector's direction (by rolling) and size (by pulling G), and gravity acts
// down. Thrust is taken to balance drag at 1 G; pulling more bleeds energy by
// an induced-drag term, B(n² − 1)(V_corner/V)², with B set so that a 7.33 G
// pull at the 410 KIAS corner bleeds 8 kt/s, the source's T-45 figure. That is
// enough to show the shape of each maneuver and why the vertical changes speed
// and closure. It is not an aircraft performance model: there is no thrust
// limit, drag rise or altitude effect.
import { T45 } from './lesson-model.mjs';

export const GFT = 32.174; // ft/s², standard gravity
export const KTFT = 1.68781; // ft/s per knot

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a) => { const l = len(a); return l ? mul(a, 1 / l) : [0, 0, 0]; };
const perp = (a, axis) => sub(a, mul(axis, dot(a, axis))); // part of a at right angles to unit axis
const UP = [0, 0, 1];
const rad = (d) => d * Math.PI / 180;
const deg = (r) => r * 180 / Math.PI;

// Load factor available at a speed (kt): lift-limited below corner, n grows
// with V², and load-limited at and above it (T-45 example: 410 KIAS, 7.33 G).
// Speeds are treated as true airspeed at sea level, as in the level-turn model.
export const availableG = (kt) => Math.min(T45.loadLimit, T45.loadLimit * (kt / T45.corner) ** 2);

// Heading (degrees clockwise from north) and pitch (degrees above the horizon)
// of a velocity vector.
export const heading = (v) => ((deg(Math.atan2(v[0], v[1])) % 360) + 360) % 360;
export const pitch = (v) => deg(Math.atan2(v[2], Math.hypot(v[0], v[1])));

// Fly one aircraft. `control(state)` returns the wanted lift acceleration
// (ft/s², any direction; the part along the velocity is ignored) and may return
// null to end the run. Lift is capped at the G available at the current speed,
// and at `gLimit` if the pilot is flying a lower pull.
// The speed follows from total energy: V²/2 + gh, less the bleed.
export const BLEED = T45.cornerBleed / (T45.loadLimit ** 2 - 1); // kt/s per (n² − 1) at corner
export const bleed = (kt, g) => BLEED * Math.max(-1, g * g - 1) * (T45.corner / kt) ** 2; // kt/s
// `sigma` is the air density ratio: G and bleed follow indicated airspeed,
// IAS = TAS·√σ, while the path follows true airspeed.
export function fly({ p, v, control, dt = 0.05, maxTime = 60, gLimit = Infinity, drag = true, sigma = 1 }) {
  let e0 = dot(v, v) / 2 + GFT * p[2];
  const track = [];
  for (let t = 0; t <= maxTime + 1e-9; t += dt) {
    const s = { t, p, v, speed: len(v) / KTFT * Math.sqrt(sigma) }; // KIAS
    const want = control(s);
    if (!want) break;
    const vh = unit(v);
    let lift = perp(want, vh);
    const cap = Math.min(gLimit, availableG(s.speed)) * GFT;
    if (len(lift) > cap) lift = mul(unit(lift), cap);
    track.push({ t, p, v, lift, g: len(lift) / GFT });
    if (drag) e0 -= len(v) * bleed(s.speed, len(lift) / GFT) * KTFT * dt;
    // Turn the velocity by lift and gravity, then set its size from energy.
    const a = add(lift, [0, 0, -GFT]);
    const turned = add(v, mul(a, dt));
    const next = add(p, mul(add(v, turned), dt / 2));
    const speed = Math.sqrt(Math.max(1, 2 * (e0 - GFT * next[2])));
    p = next;
    v = mul(unit(turned), speed);
  }
  return track;
}

// Lift needed to turn the velocity toward `dir` at up to `rate` °/s while
// holding the flight path against gravity: a pilot's lift-vector placement.
function steer(s, dir, rate) {
  const vh = unit(s.v);
  const off = Math.acos(Math.max(-1, Math.min(1, dot(vh, unit(dir)))));
  const side = unit(perp(dir, vh));
  const w = Math.min(rad(rate), off * 1.5); // close the error in about 0.7 s
  return add(mul(side, len(s.v) * w), mul(perp(UP, vh), GFT));
}

// A level, constant-speed turn (the bandit in the yo-yo figures): radius r ft,
// `sense` +1 turns right (clockwise seen from above), −1 left.
export function levelCircle({ speed, r, sense = 1, centre = [0, 0], start = 0, z = 0, dt = 0.05, maxTime = 30 }) {
  const v = speed * KTFT, w = v / r;
  const track = [];
  for (let t = 0; t <= maxTime + 1e-9; t += dt) {
    const a = rad(start) + sense * w * t; // bearing of the aircraft from the centre
    const p = [centre[0] + r * Math.sin(a), centre[1] + r * Math.cos(a), z];
    const vel = [sense * v * Math.cos(a), -sense * v * Math.sin(a), 0];
    const inward = [-Math.sin(a), -Math.cos(a), 0];
    const lift = add(mul(inward, v * w), [0, 0, GFT]);
    track.push({ t, p, v: vel, lift, g: len(lift) / GFT });
  }
  return track;
}

// Lift direction (unit, at right angles to the velocity) at each sample: the
// way the canopy points. Ribbons are drawn in the wing plane, across it.
export function liftAxis(s) {
  const vh = unit(s.v);
  const l = perp(s.lift, vh);
  return len(l) > 1e-6 ? unit(l) : unit(perp(UP, vh));
}

/* ---------- Maneuvers ---------- */

// Split-S: from level flight, roll inverted, then pull through the bottom to
// level flight on the reverse heading. A pure nose-low, wings-level pull.
// ISA density ratio at 15,000 ft, inside the T-45 training block.
export const SIGMA_15K = 0.6292;
export function splitS({ speed = 250, rollRate = 120, sigma = SIGMA_15K, leadIn = 2 } = {}) {
  const h0 = [0, 1, 0]; // entry heading north
  const wing = [1, 0, 0]; // right wing at entry
  let phase = 'roll', rolled = 0, pulledDown = false, levelUntil = null;
  const track = fly({
    p: [0, 0, 0], v: mul(h0, speed / Math.sqrt(sigma) * KTFT), maxTime: 40, sigma,
    control: (s) => {
      const vh = unit(s.v);
      if (phase === 'roll') {
        // Level for `leadIn` seconds, then roll at a light 0.5 G: the lift
        // vector turns from up, through the right wing, to down.
        if (s.t < leadIn) return mul(perp(UP, vh), GFT);
        rolled = Math.min(180, (s.t - leadIn) * rollRate);
        if (rolled >= 180) phase = 'pull';
        const a = rad(rolled);
        return mul(add(mul(perp(UP, vh), Math.cos(a)), mul(wing, Math.sin(a))), 0.5 * GFT);
      }
      if (phase === 'pull') {
        // Maximum-performance pull in the vertical plane, canopy toward the
        // inside of the loop (down at the start, back to up at the end).
        if (s.v[2] < 0) pulledDown = true;
        if (pulledDown && s.v[2] >= 0) { phase = 'level'; levelUntil = s.t + 3; }
        const inside = unit(cross(vh, wing));
        return mul(inside, availableG(s.speed) * GFT);
      }
      if (s.t > levelUntil) return null;
      return mul(perp(UP, vh), GFT);
    },
  });
  return [{ id: 'own', label: 'YOU', track }];
}

// Shared start for the yo-yos: a bandit in a level 350 kt, 3,000 ft right turn.
const banditTurn = (maxTime) => levelCircle({ speed: 350, r: T45.bubbleRadius, sense: 1, start: 270, maxTime });

// Point on the bandit's track at time t (nearest sample).
const at = (track, t) => track[Math.min(track.length - 1, Math.max(0, Math.round(t / (track[1].t - track[0].t))))];

function chase({ bandit, p, v, plan, maxTime, gLimit }) {
  // plan(s, b) returns { aim: [x, y, z], rate } for the fighter at state s,
  // given the bandit sample b at the same time.
  return fly({
    p, v, maxTime, gLimit,
    control: (s) => {
      const b = at(bandit, s.t);
      const { aim, rate } = plan(s, b);
      return steer(s, sub(aim, s.p), rate);
    },
  });
}

// Relative numbers through a run: range, closure (kt, positive closing),
// angle off the bandit's tail (measured at the bandit, between its tail and the
// fighter), and the fighter's height above the bandit.
export function relative(fighter, bandit) {
  return fighter.map((f, i) => {
    const b = bandit[Math.min(i, bandit.length - 1)];
    const los = sub(b.p, f.p);
    const range = len(los);
    const closure = -dot(sub(b.v, f.v), unit(los)) / KTFT;
    const aot = deg(Math.acos(Math.max(-1, Math.min(1, dot(unit(mul(b.v, -1)), unit(mul(los, -1)))))));
    return { t: f.t, range, closure, aot, behind: aot < 90, dz: f.p[2] - b.p[2], speed: len(f.v) / KTFT };
  });
}

// Start a fighter `range` ft from the bandit's first sample, `aot` degrees off
// its tail toward `side` (+1 inside the turn, −1 outside), pointing at it.
function startBehind(b0, { range, aot, side, speed, parallel = false }) {
  const back = unit(mul(b0.v, -1));
  const inward = unit(mul([b0.p[0], b0.p[1], 0], -1)); // toward the turn centre at the origin
  const dir = unit(add(mul(back, Math.cos(rad(aot))), mul(inward, side * Math.sin(rad(aot)))));
  const p = add(b0.p, mul(dir, range));
  return { p, v: mul(unit(parallel ? b0.v : sub(b0.p, p)), speed * KTFT) };
}

// High yo-yo: the fighter, fast and closing at high angle off, rolls away and
// pulls up out of the bandit's plane of motion, then rolls back and comes down
// behind it, trading airspeed and closure for altitude. Without it, the same
// pursuit overshoots the bandit's flight path.
export const HIGH = { range: 2500, aot: 45, speed: 450, rate: 16, climb: 1500, upFor: 3 };
export function highYoYo({ yoyo = true, ...o } = {}) {
  const c = { ...HIGH, ...o };
  const T = 14;
  const bandit = banditTurn(T);
  const { p, v } = startBehind(bandit[0], { ...c, side: 1 });
  const track = chase({
    bandit, p, v, maxTime: T,
    plan: (s, b) => {
      // Up: aim above and behind the bandit, out of its plane of motion…
      if (yoyo && s.t < c.upFor) return { aim: add(add(b.p, [0, 0, c.climb]), mul(unit(b.v), -1000)), rate: c.rate };
      // …then roll back and pull down to pure pursuit.
      return { aim: b.p, rate: c.rate };
    },
  });
  return [
    { id: 'bandit', label: 'BANDIT', track: bandit },
    { id: 'own', label: 'YOU', track },
  ];
}

// Low yo-yo: the fighter, on the bandit's own turn circle at the same speed,
// cannot bring its nose to bear in a level turn: pulling harder only bleeds
// speed. It drops its nose inside the bandit's turn and well in front of it
// (lead), letting gravity add to the turn and keep its speed up, then works
// the nose back up toward the bandit as range closes.
export const LOW = { trail: 60, speed: 310, dive: 3000, lead: 1500, downFor: 6 };
export function lowYoYo({ yoyo = true, ...o } = {}) {
  const c = { ...LOW, ...o };
  const T = 18;
  const bandit = banditTurn(T);
  // Start on the bandit's circle, `trail` degrees of turn behind it.
  const a = rad(270 - c.trail), r = T45.bubbleRadius, w = c.speed * KTFT;
  const p = [r * Math.sin(a), r * Math.cos(a), 0];
  const v = [w * Math.cos(a), -w * Math.sin(a), 0];
  const track = chase({
    bandit, p, v, maxTime: T,
    plan: (s, b) => {
      // Nose low, inside the turn and in front of the bandit…
      if (yoyo && s.t < c.downFor) return { aim: add(add(b.p, [0, 0, -c.dive]), mul(unit(b.v), c.lead)), rate: 30 };
      // …then back up toward the bandit. Without the yo-yo: pure pursuit, level.
      return { aim: b.p, rate: 30 };
    },
  });
  return [
    { id: 'bandit', label: 'BANDIT', track: bandit },
    { id: 'own', label: 'YOU', track },
  ];
}

// Path given as a function of time, with velocity and lift found by finite
// differences (lift = path acceleration + gravity, at right angles to the path).
function traced(fn, { maxTime, dt = 0.05 }) {
  const out = [];
  const h = 1e-3;
  for (let t = 0; t <= maxTime + 1e-9; t += dt) {
    const p = fn(t), pa = fn(t - h), pb = fn(t + h);
    const v = mul(sub(pb, pa), 1 / (2 * h));
    const acc = mul(add(sub(pb, mul(p, 2)), pa), 1 / (h * h));
    const lift = perp(add(acc, [0, 0, GFT]), unit(v));
    out.push({ t, p, v, lift, g: len(lift) / GFT });
  }
  return out;
}

// Rolling scissors: both aircraft, inside each other's bubble, roll over the
// top of each other in opposite directions. Seen from behind, each traces a
// loop; their flight paths cross over the top and again at the bottom while
// both drift downrange. A fixed-shape illustration (each loop 2,000 ft across,
// 30 s, slower over the top), not a solution of the fight.
export function rollingScissors({ loops = 1.25 } = {}) {
  const R = 1000, period = 20, drift = 220; // ft, s, ft/s downrange
  const T = loops * period;
  // Phase runs faster at the bottom than over the top, as energy is traded.
  const phase = (t) => { const w = 2 * Math.PI * t / period; return w - 0.35 * Math.sin(w); };
  const path = (side, lag) => (t) => {
    const a = phase(t);
    return [side * R * Math.sin(a), drift * t - lag, R * (1 - Math.cos(a))];
  };
  return [
    { id: 'bandit', label: 'BANDIT', track: traced(path(-1, -250), { maxTime: T }) },
    { id: 'own', label: 'YOU', track: traced(path(1, 250), { maxTime: T }) },
  ];
}

// Flat scissors: a slow, high-AOA weave in the horizontal, each aircraft
// reversing toward the other as their flight paths cross, trading airspeed for
// altitude to slow downrange travel. Fixed-shape illustration.
export function flatScissors({ crossings = 4 } = {}) {
  const A = 1200, half = 8, drift = 90; // ft, s per reversal, ft/s downrange
  const T = crossings * half;
  const path = (side, lag) => (t) => {
    const w = Math.PI * t / half;
    return [side * A * Math.sin(w), drift * t - lag, 150 * (1 - Math.cos(2 * w)) + 15 * t];
  };
  return [
    { id: 'bandit', label: 'BANDIT', track: traced(path(-1, -200), { maxTime: T }) },
    { id: 'own', label: 'YOU', track: traced(path(1, 200), { maxTime: T }) },
  ];
}

// Summary of a single aircraft's run; speeds in KIAS at density ratio sigma.
export function summary(track, sigma = 1) {
  const z = track.map((s) => s.p[2]);
  const speeds = track.map((s) => len(s.v) / KTFT * Math.sqrt(sigma));
  return {
    altitudeLoss: track[0].p[2] - Math.min(...z),
    altitudeGain: Math.max(...z) - track[0].p[2],
    entrySpeed: speeds[0], exitSpeed: speeds.at(-1),
    minSpeed: Math.min(...speeds), maxSpeed: Math.max(...speeds),
    maxG: Math.max(...track.map((s) => s.g)),
    headingChange: ((heading(track.at(-1).v) - heading(track[0].v)) % 360 + 360) % 360,
    time: track.at(-1).t,
  };
}
