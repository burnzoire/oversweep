import type { Dlz, MrmView } from './mrm.ts';

/**
 * The AIM-120 single-target shot's scene, shared by the FCR (`mfd-fcr.ts`) and HUD (`hud.ts`) pages. It continues the
 * radar procedures' scene: a CAP at 28,000 ft and 550 KTAS, heading 360°; the lead of a hot two-ship 45 NM out on
 * 340° at 25,000 ft, flying 150° at 404 KTAS (aspect 17R). On the 347° collision heading the bearing holds at 340° and
 * the range closes at 944 kt. The playback centres the contact in azimuth through rollout and the smoke view.
 * After the shot the jet cranks right to hold the target 50° left, inside the radar's ±60°:
 * 030° at first, easing back to about 016° by impact as the bearing drifts left; the closure is then about 755 kt.
 * The radar steps down from 80 to 40 NM once the bugged target is inside 40% of the scale (p. 405), at launch.
 *
 * An illustration, not the sim's numbers (the guide gives none): the launch zone is held at RAERO 38, ROPT 35, RPI
 * 32, RTR 9 and RMIN 1 NM; the missile is taken to close on the target at 2,000 kt (0.557 NM/s) and to go active 10
 * NM from it. Times and poles follow from those: launched at 32 NM, active after 39 s, impact after 57 s.
 */
export const DLZ: Dlz = { aero: 38, opt: 35, pi: 32, tr: 9, min: 1 };
const MSL = 0.557, ACTIVE = 10;
const CLOSE = { collision: 944 / 3600 };
/** The FCR range scale (and so the missile scale's) for the target at `nm`: 80 NM, stepping down inside 40% of it (p. 405). */
export const scaleFor = (nm: number) => (nm < 0.4 * 80 ? 40 : 80);
/** Pre-launch pole and time for a shot now at `nm`, the jet closing at `c` NM/s (blank beyond RAERO). */
const pre = (nm: number, c: number): [string, string] | undefined => {
  if (nm > DLZ.aero) return undefined;
  const t = (nm - ACTIVE) / MSL;
  return [`${Math.round(nm - t * c)}M`, `A${Math.round(t)}`];
};
/** The shot: launched at RPI. */
const LAUNCH = DLZ.pi, T_ACTIVE = (LAUNCH - ACTIVE) / MSL, T_HIT = LAUNCH / MSL;
/**
 * The jet and the target after launch, by relative motion on a flat earth: the target 32 NM on 340°, flying 150° at
 * 404 kt; the jet on 347° for 2 s, then holding the target 50° left at 550 kt. Range (NM), the target's bearing and
 * the jet's heading (degrees), and closure (kt), every whole second.
 */
interface Fix { nm: number; brg: number; hdg: number; closure: number }
const TRACK: Fix[] = (() => {
  const v = (h: number, kt: number) => [kt * Math.sin(h * Math.PI / 180) / 3600, kt * Math.cos(h * Math.PI / 180) / 3600];
  const tv = v(150, 404), out: Fix[] = [], dt = 0.05;
  let [tx, ty] = [32 * Math.sin(340 * Math.PI / 180), 32 * Math.cos(340 * Math.PI / 180)], ox = 0, oy = 0;
  for (let i = 0; i <= 70 / dt; i++) {
    const t = i * dt, dx = tx - ox, dy = ty - oy, nm = Math.hypot(dx, dy);
    const brg = ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360, hdg = t < 2 ? 347 : (brg + 50) % 360, ov = v(hdg, 550);
    if (Math.abs(t - Math.round(t)) < dt / 2) out[Math.round(t)] = { nm, brg, hdg, closure: -((dx * (tv[0] - ov[0]) + dy * (tv[1] - ov[1])) / nm) * 3600 };
    ox += ov[0] * dt; oy += ov[1] * dt; tx += tv[0] * dt; ty += tv[1] * dt;
  }
  return out;
})();
const at = (t: number) => TRACK[Math.round(t)];
/** The target's aspect (degrees off its tail, right positive) with it on bearing `brg` from the jet, flying 150°. */
const aspectAt = (brg: number) => { const off = ((brg - 180 - 150 + 540) % 360) - 180; return Math.sign(off || 1) * (180 - Math.abs(off)); };
const post = (t: number): [string, string] => (t < T_ACTIVE
  ? [`${Math.round(at(T_ACTIVE).nm)}M`, `A${Math.round(T_ACTIVE - t)}`]
  : [`${Math.round(at(T_HIT).nm)}F`, `T${Math.max(0, Math.round(T_HIT - t))}`]);

/** Presentation values shared by the two displays, sampled once per animation frame. */
export interface AircraftState {
  heading: number;
  bank: number;
  pitch: number;
  range: number;
  bearing: number;
  closure: number;
}

interface Moment {
  aircraft: AircraftState;
  view: Omit<MrmView, 'nm' | 'closure'>;
}

// Illustrative nose-up attitude for level flight in this HUD view.
const LEVEL_PITCH = 3.75;

const level = (heading: number, range: number, bearing: number, closure: number): AircraftState =>
  ({ heading, bank: 0, pitch: LEVEL_PITCH, range, bearing, closure });

const r1 = (v: number) => Math.round(v * 10) / 10;
const closing = (nm: number, hdg: number): Moment => ({
  aircraft: level(hdg, nm, 340, hdg === 360 ? 915 : 944),
  view: {
    rdy: 'RDY', dlz: DLZ, pre: pre(nm, CLOSE.collision),
    asec: Math.min(1, Math.max(0, (DLZ.opt - nm) / (DLZ.opt - DLZ.pi))), asc: hdg === 360 ? [-1.6, 0] : nm <= DLZ.pi ? [0.05, 0.6] : [0, 0], aspect: 170,
  },
});
const flying = (t: number): Moment => {
  const f = at(t), nm = r1(f.nm);
  return {
    aircraft: level(Math.round(f.hdg) || 360, nm, f.brg, Math.round(f.closure)),
    view: {
      rdy: 'RDY', dlz: DLZ, pre: pre(nm, f.closure / 3600), post: t < T_HIT + 0.5 ? post(t) : undefined,
      asec: 1, asc: [-1.6, 0.6], aspect: aspectAt(f.brg),
      tail: t < T_ACTIVE ? 'on' : 'flash', ...(t >= T_HIT - 8 ? { x: t > T_HIT ? 'flash' as const : 'on' as const } : {}),
    },
  };
};

/** The moments the procedure passes through (FCR page `fcr-<id>`, HUD cue page `mrm-<id>`). */
export const MOMENTS = {
  bugged: closing(45, 360),
  turned: closing(44.2, 347),
  c42: closing(42, 347),
  c38: closing(38, 347),
  c35: closing(35, 347),
  rpi: closing(32, 347),
  launched: (m => ({ ...m, view: { ...m.view, asc: [0.05, 0.6] as [number, number] } }))(flying(1)),
  cranked: flying(4),
  t10: flying(10),
  t20: flying(20),
  t30: flying(30),
  active: flying(Math.ceil(T_ACTIVE)),
} satisfies Record<string, Moment>;
export type MomentId = keyof typeof MOMENTS;
/** Seconds after launch of the post-launch moments, and seconds after the turn of the closing ones, for the procedure's player. */
export const SHOT_TIMES = { cranked: 4, t10: 10, t20: 20, t30: 30, active: Math.ceil(T_ACTIVE), turned: 0, c42: Math.round(2.2 / CLOSE.collision), c38: Math.round(6.2 / CLOSE.collision), c35: Math.round(9.2 / CLOSE.collision), rpi: Math.round(12.2 / CLOSE.collision) };

export interface SceneFrame extends Moment {
  id: MomentId;
  scale: ReturnType<typeof scaleFor>;
  trail: number;
  trailOpacity: number;
}

const centredContact = new Set<MomentId>(['turned', 'c42', 'c38', 'c35', 'rpi', 'launched']);

export function sceneFrame(id: MomentId): SceneFrame {
  const moment = MOMENTS[id];
  // Both displays use this playback framing. The scenario's authored geometry supplies the other readings.
  const aircraft = centredContact.has(id) ? { ...moment.aircraft, bearing: moment.aircraft.heading } : moment.aircraft;
  return { ...moment, aircraft, id, scale: scaleFor(aircraft.range), trail: 0, trailOpacity: 0 };
}

export function sceneView({ aircraft, view }: SceneFrame): MrmView {
  return { ...view, nm: aircraft.range, closure: Math.round(aircraft.closure) };
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const relativeBearing = (bearing: number, heading: number) => ((bearing - heading + 540) % 360) - 180;
const mixAngle = (a: number, b: number, t: number) => a + relativeBearing(b, a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);

/** Roll in over the first quarter, hold the bank, and roll out over the last quarter. */
const bankAmount = (progress: number) => ease(Math.min(1, 4 * progress, 4 * (1 - progress)));

interface SceneKeyframe { seconds: number; frame: SceneFrame }

export interface SceneMotion {
  keyframes: SceneKeyframe[];
  ms: number;
  bank?: number;
}

/** The existing scene poses, with a presentation-only bank and smoke transition. */
export const SCENE_MOTIONS = {
  turn: { keyframes: [{ seconds: 0, frame: sceneFrame('bugged') }, { seconds: 3, frame: sceneFrame('turned') }], ms: 2200, bank: -24 },
  close: { keyframes: (['turned', 'c42', 'c38', 'c35', 'rpi'] as const).map(id => ({ seconds: SHOT_TIMES[id], frame: sceneFrame(id) })), ms: 6400 },
  away: { keyframes: [{ seconds: 0, frame: sceneFrame('launched') }, { seconds: 6, frame: { ...sceneFrame('launched'), trail: 0.85, trailOpacity: 1 } }], ms: 3200 },
  crank: { keyframes: [{ seconds: 0, frame: sceneFrame('launched') }, { seconds: SHOT_TIMES.cranked, frame: sceneFrame('cranked') }], ms: 2600, bank: 30 },
  support: { keyframes: (['cranked', 't10', 't20', 't30', 'active'] as const).map(id => ({ seconds: SHOT_TIMES[id], frame: sceneFrame(id) })), ms: 6400 },
} satisfies Record<string, SceneMotion>;

/** Keep discrete indications on their authored keyframes and ease the geometry between them. */
export function sampleScene(motion: SceneMotion, seconds: number, start = motion.keyframes[0].frame): SceneFrame {
  const keys = motion.keyframes;
  const last = keys[keys.length - 1];
  if (seconds <= keys[0].seconds) return start;
  if (seconds >= last.seconds) return last.frame;

  const next = keys.findIndex(key => seconds < key.seconds);
  const left = keys[next - 1], right = keys[next];
  const a = next === 1 ? start : left.frame, b = right.frame;
  const progress = (seconds - left.seconds) / (right.seconds - left.seconds);
  // Ease at the ends of a longer sequence without stopping at every intermediate keyframe.
  let t = progress;
  if (keys.length === 2) t = ease(progress);
  else if (next === 1) t = progress * progress * (2 - progress);
  else if (next === keys.length - 1) t = 1 - (1 - progress) ** 2 * (1 + progress);
  const from = a.aircraft, to = b.aircraft;
  const aircraft: AircraftState = {
    heading: mixAngle(from.heading, to.heading, t),
    bank: mix(from.bank, to.bank, t) + (motion.bank ?? 0) * bankAmount(progress),
    pitch: mix(from.pitch, to.pitch, t),
    range: mix(from.range, to.range, t),
    bearing: mixAngle(from.bearing, to.bearing, t),
    closure: mix(from.closure, to.closure, t),
  };
  const interpolate = (a: number | undefined, b: number | undefined) => a === undefined || b === undefined ? a : mix(a, b, t);
  const { asc, post } = a.view;
  const view: SceneFrame['view'] = {
    ...a.view,
    aspect: interpolate(a.view.aspect, b.view.aspect),
    asec: interpolate(a.view.asec, b.view.asec),
    asc: asc && b.view.asc ? [mix(asc[0], b.view.asc[0], t), mix(asc[1], b.view.asc[1], t)] : asc,
    post: post && b.view.post && post[1][0] === b.view.post[1][0]
      ? [post[0], post[1][0] + Math.round(mix(Number(post[1].slice(1)), Number(b.view.post[1].slice(1)), progress))]
      : post,
  };
  return {
    ...a, aircraft, view,
    trail: a.trail && !b.trail ? a.trail : mix(a.trail, b.trail, t),
    trailOpacity: !a.trail ? b.trailOpacity : mix(a.trailOpacity, b.trailOpacity, t),
  };
}
