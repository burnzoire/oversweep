/**
 * The takeoff roll of the F-16C takeoff procedure: an AB takeoff at 28,000 lb from the start of Batumi's runway 13,
 * sampled by time for the HUD and the ground picture behind it.
 *
 * Fixed by the guide (p. 146): takeoff speed at 28,000 lb is 156 KCAS; pull back 15 knots below it in AB (141); take-off
 * attitude 8-12°; NWS disengaged at 70 knots; gear up after a positive rate of climb and in before 300 KCAS.
 *
 * An illustration, not the sim's numbers (the guide gives none): 2.5 kt/s at 90% RPM for 4 s after the brakes come off,
 * then the afterburner lights and the acceleration rises to 9.5 kt/s (about 0.5 g, a roll of about 2,200 ft to 156 kt);
 * rotation at 6° a second to 10.5°; a climb angle building to about 7° with the pitch held; gear up 3 s after liftoff
 * and 6 s in transit.
 */
export const TAKEOFF = { weight: 28000, rotate: 141, liftoff: 156, field: 33, eye: 8.5, start: 40, pitchOnGround: 0.5, pitchTakeoff: 10.5 } as const;

const KT = 1.6878; // feet a second per knot
const smooth = (x: number) => { const c = Math.min(1, Math.max(0, x)); return c * c * (3 - 2 * c); };

/** Seconds from brake release: AB lit at 4 s; the speed marks are found below. */
const T_AB = 4, ACC_90 = 2.5, ACC_AB = 9.5, ACC_AIR = 10, ACC_CLEAN = 9;
const accel = (t: number, airborne: boolean, geared: boolean) =>
  t < T_AB ? ACC_90 : (airborne ? (geared ? ACC_AIR : ACC_CLEAN) : ACC_90 + (ACC_AB - ACC_90) * smooth((t - T_AB) / 2));

export interface Frame {
  t: number;
  /** Feet along the runway from its start. */
  u: number;
  /** KCAS. */
  kt: number;
  pitch: number;
  /** Climb angle of the flight path (°). */
  gamma: number;
  /** Feet above the runway. */
  agl: number;
  /** Gear extension, 1 down and locked, 0 up and locked. */
  gear: number;
  /** Feet a second up. */
  vv: number;
}

const DT = 0.02, END = 40;
const frames: Frame[] = [];
export const T: { thrust: number; v70: number; rotate: number; liftoff: number; positive: number; gearDone: number } = { thrust: T_AB, v70: 0, rotate: 0, liftoff: 0, positive: 0, gearDone: 0 };
(() => {
  let u = TAKEOFF.start, kt = 0, agl = 0, airborne = false, tl = Infinity, trot = Infinity;
  for (let i = 0; i <= END / DT; i++) {
    const t = i * DT;
    if (!T.v70 && kt >= 70) T.v70 = t;
    if (trot === Infinity && kt >= TAKEOFF.rotate) { trot = t; T.rotate = t; }
    if (!airborne && kt >= TAKEOFF.liftoff) { airborne = true; tl = t; T.liftoff = t; T.positive = t + 3; T.gearDone = t + 3 + 6; }
    const pitch = TAKEOFF.pitchOnGround + (TAKEOFF.pitchTakeoff - TAKEOFF.pitchOnGround) * smooth((t - trot) / 1.7);
    const gamma = airborne ? 7 * (1 - Math.exp(-(t - tl) / 3.5)) : 0;
    const vv = airborne ? kt * KT * Math.sin((gamma * Math.PI) / 180) : 0;
    const gear = t < tl + 3 ? 1 : 1 - smooth((t - tl - 3) / 6);
    frames.push({ t, u, kt, pitch, gamma, agl, gear, vv });
    kt += accel(t, airborne, t < tl + 3) * DT;
    u += kt * KT * DT;
    agl += vv * DT;
  }
})();

/** The jet `t` seconds after the brakes come off. */
export function takeoffAt(t: number): Frame {
  const f = Math.min(frames.length - 1, Math.max(0, t / DT)), i = Math.floor(f), k = f - i;
  const a = frames[i], b = frames[Math.min(frames.length - 1, i + 1)];
  const m = (x: number, y: number) => x + (y - x) * k;
  return { t, u: m(a.u, b.u), kt: m(a.kt, b.kt), pitch: m(a.pitch, b.pitch), gamma: m(a.gamma, b.gamma), agl: m(a.agl, b.agl), gear: m(a.gear, b.gear), vv: m(a.vv, b.vv) };
}

/** The HUD readings for a frame. Velocity reads 0 below the scale's 60 kt; altitude is the field's 33 ft plus the height above it. */
export function takeoffHud(f: Frame) {
  const alt = TAKEOFF.field + f.agl;
  const fpm = f.gamma - f.pitch;
  return {
    'hud.velocity': f.kt < 60 ? 0 : Math.round(f.kt),
    'hud.mach': +(f.kt / 661.5).toFixed(2),
    'hud.altitude': Math.round(alt / 10) * 10,
    'hud.radar-alt': Math.round(f.agl / 10) * 10,
    'hud.heading': 130,
    'hud.pitch': +f.pitch.toFixed(2),
    'hud.fpm-elevation': +fpm.toFixed(2),
    'hud.fpm-azimuth': 0,
    'hud.roll': 0,
    'hud.g': 1,
    'hud.max-g': 1,
    // Steerpoint 1, 20 NM straight ahead and far above the horizon's resolution: the diamond sits on the horizon.
    'hud.steerpoint-azimuth': 0,
    'hud.steerpoint-elevation': -+f.pitch.toFixed(2),
    'hud.steering-cue': 0,
    'hud.steering': 0,
  };
}
