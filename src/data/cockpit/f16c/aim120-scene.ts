import type { Dlz, MrmView } from './mrm.ts';

/**
 * The AIM-120 single-target shot's scene, shared by the FCR (`mfd-fcr.ts`) and HUD (`hud.ts`) pages. It continues the
 * radar procedures' scene: a CAP at 28,000 ft and 550 KTAS, heading 360°; the lead of a hot two-ship 45 NM out on
 * 340° at 25,000 ft, flying 150° at 404 KTAS (aspect 17R). On the 347° collision heading the bearing holds at 340° and
 * the range closes at 944 kt; cranked to 030° after the shot (the target 50° left, inside the radar's ±60°) it closes
 * at 751 kt.
 *
 * An illustration, not the sim's numbers (the guide gives none): the launch zone is held at RAERO 38, ROPT 35, RPI
 * 32, RTR 9 and RMIN 1 NM; the missile is taken to close on the target at 2,000 kt (0.557 NM/s) and to go active 10
 * NM from it. Times and poles follow from those: launched at 32 NM, active after 39 s, impact after 57 s.
 */
export const DLZ: Dlz = { aero: 38, opt: 35, pi: 32, tr: 9, min: 1 };
const MSL = 0.557, ACTIVE = 10;
const CLOSE = { collision: 944 / 3600, crank: 751 / 3600 };
/** Pre-launch pole and time for a shot now at `nm`, the jet closing at `c` NM/s (blank beyond RAERO). */
const pre = (nm: number, c: number): [string, string] | undefined => {
  if (nm > DLZ.aero) return undefined;
  const t = (nm - ACTIVE) / MSL;
  return [`${Math.round(nm - t * c)}M`, `A${Math.round(t)}`];
};
/** The shot: launched at RPI. */
const LAUNCH = DLZ.pi, T_ACTIVE = (LAUNCH - ACTIVE) / MSL, T_HIT = LAUNCH / MSL;
/** Range `t` s after launch, the jet cranked from 2 s after it. */
const after = (t: number) => LAUNCH - 2 * CLOSE.collision - Math.max(0, t - 2) * CLOSE.crank;
const post = (t: number): [string, string] => (t < T_ACTIVE
  ? [`${Math.round(after(T_ACTIVE))}M`, `A${Math.round(T_ACTIVE - t)}`]
  : [`${Math.round(after(T_HIT))}F`, `T${Math.max(0, Math.round(T_HIT - t))}`]);

/** One moment of the shot: the jet's heading, the lead's range, and the AIM-120 symbology. */
export interface Moment { hdg: number; nm: number; view: MrmView }
const r1 = (v: number) => Math.round(v * 10) / 10;
const closing = (nm: number, hdg: number): Moment => ({
  hdg, nm, view: {
    rdy: 'RDY', nm, closure: hdg === 360 ? 915 : 944, dlz: DLZ, pre: pre(nm, CLOSE.collision),
    asec: nm <= DLZ.pi ? 'large' : 'small', asc: hdg === 360 ? [-1.6, 0] : nm <= DLZ.pi ? [0.05, 0.6] : [0, 0], aspect: 170,
  },
});
const flying = (t: number): Moment => {
  const nm = r1(after(t));
  return {
    hdg: 30, nm, view: {
      rdy: 'RDY', nm, closure: 751, dlz: DLZ, pre: pre(nm, CLOSE.crank), post: t < T_HIT + 0.5 ? post(t) : undefined,
      asec: 'large', asc: [-1.6, 0.6], aspect: 170,
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
  launched: { ...flying(1), hdg: 347 },
  t10: flying(10),
  t20: flying(20),
  t30: flying(30),
  active: flying(Math.ceil(T_ACTIVE)),
  last8: flying(Math.ceil(T_HIT - 8)),
  impact: flying(Math.ceil(T_HIT + 1)),
} satisfies Record<string, Moment>;
export type MomentId = keyof typeof MOMENTS;
/** Seconds after launch of the post-launch moments, for the procedure's player. */
export const SHOT_TIMES = { t10: 10, t20: 20, t30: 30, active: Math.ceil(T_ACTIVE), last8: Math.ceil(T_HIT - 8), impact: Math.ceil(T_HIT + 1) };
