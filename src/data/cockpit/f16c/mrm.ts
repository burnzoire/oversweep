/**
 * F-16C AIM-120 (medium range missile, MRM) symbology shared by the HUD (`hud.ts`) and the FCR (`mfd-fcr.ts`): one
 * description of the engagement at a moment, drawn on both (guide pp. 593-598).
 *
 * The launch zone ranges, times and poles in the procedures' scenes are an illustration worked out for each scene's
 * speeds and ranges, not values computed by the sim: the guide gives no AIM-120 performance figures. They keep the
 * guide's order (RMIN < RTR < RPI < ROPT < RAERO) and proportions (p. 595 figure: RPI about 85% of RAERO, RTR about a
 * quarter).
 */

/** The linear missile scale's ranges (NM), guide p. 595-596. */
export interface Dlz { aero: number; opt: number; pi: number; tr: number; min: number }

/** The AIM-120 symbology at one moment. */
export interface MrmView {
  /** The missile status word (SMS, FCR and HUD), blank with MASTER ARM off. */
  rdy: 'RDY' | 'SIM' | '';
  /** The FCR target of interest's range (NM) and closure (kt); none without a bugged target. */
  nm?: number;
  closure?: number;
  dlz?: Dlz;
  /** Pre-launch pole and time (`21M`, `A40`), shown once inside RAERO. */
  pre?: [pole: string, time: string];
  /** Post-launch pole and time of the missile of interest (`24M`, `A30`, then `20F`, `T17`). */
  post?: [pole: string, time: string];
  /** Allowable steering error circle size, 0 (small, beyond ROPT) to 1 (largest, at RPI and inside), p. 594. */
  asec?: number;
  /** Attack steering cue, in ASEC radii off its centre (right, down); it stops at 1.6 radii. */
  asc?: [number, number];
  /** Target aspect angle (degrees from the target's tail, right positive) for the HUD's aspect caret. */
  aspect?: number;
  /** The FCR target's AIM-120 marks: the tail once a missile is in flight (`flash` once it is active); the X over the last 8 s. */
  tail?: 'on' | 'flash';
  x?: 'on' | 'flash';
}

/** Missile reticle and diamond (boresight launch, p. 593): the diamond 6° below the boresight cross, the reticle's radius 7.6°. */
export const RETICLE = { down: 6, r: 7.6 };
/** ASEC, p. 594 and p. 597 (HUD figure px, 27.45 px a degree): centred 6° below the boresight; radius 59 px (2.15°) at RPI, 23.7 px (0.86°) beyond. */
export const ASEC = { down: 6, large: 2.15, small: 0.863, asc: 0.24 };
/** The ASEC radius (degrees) for a size from 0 to 1. */
export const asecDeg = (f: number) => ASEC.small + (ASEC.large - ASEC.small) * f;
