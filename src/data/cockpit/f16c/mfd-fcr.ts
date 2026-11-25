import type { MfdDisplay } from '../types';
import { tracer } from '../trace.ts';
import { c, f, poly, w } from './mfd-had.ts';
import { ASEC, asecDeg, type MrmView } from './mrm.ts';
import { MOMENTS, scaleFor, type MomentId } from './aim120-scene.ts';

/**
 * F-16C Fire Control Radar (FCR) air-to-air format, for the shared MFD (`mfd.ts`). Traced from the guide's FCR
 * air-to-air format figure (p. 394, 660 x 660 px, `pdfimages -j -f 394 -l 394`, image 002), checked against p. 410
 * (RWS, 80 NM), p. 411 (A3 scan limits), p. 405 and p. 417 (a bugged target in SAM) and p. 421 (STT). All come from
 * the same square-on camera as the p. 122 MFD image and the HAD, so they share its pixel grid (screen centre 329.5,
 * 330; 4.8 px/mm); values below are pixels on those images.
 *
 * Measured on p. 394: the B-scope fills the frame (x 110-551.5, y 107-548): range 0 at y 548, the full scale 441 px
 * above it (green range marks at a quarter, half and three quarters of the scale, y 438, 327.5, 217.5, x 538-553);
 * azimuth ±60° across the frame about x 330.75 (3.68 px a degree; the p. 411 scan limits at ±30° are 221.5 px apart).
 * The acquisition cursor is two bars 28 px apart, 29 px tall; its altitude limits are printed 18 px right of its
 * centre, 12.5 px above and 13.5 px below. The elevation scale (cyan) has ticks every 10° (36.5 px) at x 149-163,
 * the 0° tick longer (149-167); its caret is a sideways T. The azimuth scale has white ticks every 10° at y 507-522,
 * the 0° tick taller (502-522); its caret is a T standing on the format-select row. The horizon line (cyan) runs
 * x 220-312 and 351-442 at y 327.5 with 6 px ticks down at its ends.
 *
 * One scene, the radar procedures' (an illustration, not traced): a combat air patrol at 28,000 ft heading 360°, the
 * CAP point (the selected steerpoint) 10 NM ahead. Contacts are placed by azimuth (° off the nose) and range (NM);
 * the picture holds still while each step is read.
 */
const PX = 4.8;
const { mm } = tracer(PX);
export const SC: [number, number] = [329.5, 330];
type Page = MfdDisplay['pages'][number];
type P = [number, number];

/* ------------------------------------------------------------------ geometry */

export const AZ0 = 330.75, PX_DEG = 220.75 / 60, R0 = 548, RH = 441;
export type Scale = 20 | 40 | 80;
export const local = ([x, y]: P): P => [f(mm(x - SC[0])), f(mm(y - SC[1]))];
/** Where a point at `az` degrees off the nose and `nm` range is drawn on the B-scope. */
export const scope = (az: number, nm: number, scale: Scale): P => [AZ0 + az * PX_DEG, R0 - (nm / scale) * RH];
/** Azimuth and range of a B-scope point. */
const unscope = ([x, y]: P, scale: Scale) => ({ az: (x - AZ0) / PX_DEG, nm: ((R0 - y) / RH) * scale });

/** Ownship altitude (ft) and the selected steerpoint (the CAP point), NM east and north of the jet. */
export const OWN_ALT = 28000;
const STPT: P = [0, 10];
/**
 * Half the vertical coverage of the 4-bar scan. Not in the guide: fitted to its cursor altitude limits (p. 394: 31
 * and 15 at 14.1 NM; p. 410: 41 and 05 at 30.7 NM, both about ±5.4°), with the antenna at 0°.
 */
const HALF_4B = 5.4;
/**
 * Fewer bars, less height. The beam is 4.6° tall (Lockheed Martin MLU Pilot's Guide 16PR14341 p. 134), so the 4-bar
 * coverage (10.8°) puts the bars about 2.07° apart; two bars then cover 6.7° (±3.3°) and one bar the beam, 4.6° (±2.3°).
 */
const HALF: Record<Bars, number> = { 4: HALF_4B, 3: (4.6 + (2 * HALF_4B - 4.6) * (2 / 3)) / 2, 2: (4.6 + (2 * HALF_4B - 4.6) / 3) / 2, 1: 2.3 };
export type Bars = 4 | 3 | 2 | 1;
export const FT_NM = 6076.1;
const tan = (d: number) => Math.tan((d * Math.PI) / 180);
/** The search volume's altitude limits (thousands of ft) at a range, for the antenna `el` degrees up and a bar count. */
export const limits = (nm: number, el = 0, bars: Bars = 4) => {
  const r = nm * FT_NM, h = HALF[bars];
  return [Math.round((OWN_ALT + r * tan(el + h)) / 1000), Math.round((OWN_ALT + r * tan(el - h)) / 1000)] as const;
};
/** ANT ELEV knob travel to antenna elevation: full travel (100 %) taken as the antenna's ±60° limit (Falcon BMS TO 1F-16CMAM-34-1-1 p. 184; DCS gives no range). */
export const ANT_DEG_PER_PCT = 0.6;
/** Bearing (° magnetic, 001-360) and range (NM) from the steerpoint to a point given by azimuth and range off a heading. */
export const fromStpt = (az: number, nm: number, hdg = 360) => {
  const b = ((az + hdg) * Math.PI) / 180;
  const x = nm * Math.sin(b) - STPT[0], y = nm * Math.cos(b) - STPT[1];
  const brg = Math.round(((Math.atan2(x, y) * 180) / Math.PI + 360) % 360) || 360;
  return { brg, nm: Math.round(Math.hypot(x, y)) };
};
export const pad = (v: number, n: number) => String(Math.abs(v)).padStart(n, '0');

/* ------------------------------------------------------------------ contacts */

/**
 * The scene's aircraft: `az`/`nm` where they are (off a 360° heading), `alt` (thousands of ft), `hot` whether they fly toward the jet,
 * `vsrOnly` too far for RWS, seen only in VSR's high-PRF search.
 */
export interface Contact { az: number; nm: number; alt: number; hot: boolean; vsrOnly?: boolean; /** Only on the ANT ELEV pages (`vcheck`): under the level volume, found by tilting it down. */ low?: boolean }
export const CONTACTS = {
  /** The group: a two-ship, hot (heading 150°, 10° off a line straight at the jet), 45 NM north-northwest at 25,000 ft. */
  lead: { az: -20, nm: 45, alt: 25, hot: true },
  wing: { az: -23.5, nm: 46, alt: 25, hot: true },
  /** A single going away, 30 NM to the right, low. */
  single: { az: 40, nm: 30, alt: 15, hot: false },
  /** A fast mover nose on, 70 NM out: beyond RWS's detection range, inside VSR's. */
  far: { az: 8, nm: 70, alt: 33, hot: true, vsrOnly: true },
  /** A single 25 NM out, 10° left, at 12,000 ft: just under the level four-bar volume there (its floor is about 13,600 ft), inside it 3° down. */
  low: { az: -10, nm: 25, alt: 12, hot: true, low: true },
} satisfies Record<string, Contact>;
export type ContactId = keyof typeof CONTACTS;

/* -------------------------------------------------------------------- frame */

/** SOI frame (p. 394): a line round the format, broken for the option labels, with short drops at each break along the top. */
const FRAME = [
  poly([[110.5, 113], [110.5, 107.5], [165, 107.5], [165, 112]]), poly([[207, 112], [207, 107.5], [238, 107.5], [238, 112]]),
  poly([[280, 112], [280, 107.5], [309, 107.5], [309, 112]]), poly([[357, 112], [357, 107.5], [380, 107.5], [380, 112]]),
  poly([[432, 112], [432, 107.5], [449, 107.5], [449, 112]]), poly([[505, 112], [505, 107.5], [551.5, 107.5], [551.5, 195]]),
  poly([[551.5, 213], [551.5, 547.5], [505, 547.5]]), poly([[455, 547.5], [430, 547.5]]), poly([[383, 547.5], [358, 547.5]]),
  poly([[305, 547.5], [284, 547.5]]), poly([[240, 547.5], [213, 547.5]]), poly([[160, 547.5], [110.5, 547.5], [110.5, 470]]),
  poly([[110.5, 430], [110.5, 418]]), poly([[110.5, 378], [110.5, 350]]), poly([[110.5, 310], [110.5, 255]]), poly([[110.5, 190], [110.5, 113]]),
].join('');

/* ------------------------------------------------------------------ symbols */

export const rect = (x0: number, y0: number, x1: number, y1: number) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);
export const ring = ([x, y]: P, r: number, n = 36) => poly(Array.from({ length: n }, (_, i): P => [x + r * Math.sin((2 * Math.PI * i) / n), y - r * Math.cos((2 * Math.PI * i) / n)]), true);
/** Search target (p. 394, p. 404): a filled square, 16 x 12 px, its hot line (4 x 9 px) below it when hot, above when cold. */
export const searchTarget = ([x, y]: P, hot: boolean | null) =>
  rect(x - 8, y - 6, x + 8, y + 6) + (hot === null ? '' : hot ? rect(x - 2, y + 6, x + 2, y + 15) : rect(x - 2, y - 15, x + 2, y - 6));
/** Bugged target (p. 417): a ring (r 12.5) round a filled disc (r 8.5), the heading line (toward the jet when hot) leaving the ring. */
export const bugged = ([x, y]: P, hot: boolean) => ({
  marks: ring([x, y], 12.5) + poly(hot ? [[x, y + 12.5], [x, y + 18]] : [[x, y - 12.5], [x, y - 18]]),
  fills: ring([x, y], 8.5, 24),
});
/** Collision antenna train angle (p. 405, p. 417): a filled cross pattée, 16 px across, at the target's range. */
export const cata = ([x, y]: P) => {
  const a = 8, b = 2.2, t = 5;
  return poly([[x - b, y - b], [x - t, y - a], [x + t, y - a], [x + b, y - b], [x + a, y - t], [x + a, y + t], [x + b, y + b], [x + t, y + a], [x - t, y + a], [x - b, y + b], [x - a, y + t], [x - a, y - t]], true);
};
/** Steerpoint "wedding cake" (p. 394): a 24 x 8 px base, a 12 x 12 tier and a 4 px cap. */
const cake = ([x, y]: P) => rect(x - 12, y - 4, x + 12, y + 4) + rect(x - 6, y - 16, x + 6, y - 4) + rect(x - 2, y - 20, x + 2, y - 16);
/** Acquisition cursor (p. 394): two bars 28 px apart and 29 px tall, about its own centre (the moving part, in mm). */
export const CURSOR_BARS = (() => {
  const q = ([x, y]: P) => `${f(mm(x))} ${f(mm(y))}`;
  return `M${q([-14, -14.5])}L${q([-14, 14.5])}M${q([14, -14.5])}L${q([14, 14.5])}`;
})();
/** Azimuth scan limits at ±30° about the cursor's azimuth (p. 411: cyan, y 144-511), about x 0 (they move with the cursor, sideways only). */
const LIMITS_X = (() => {
  const q = ([x, y]: P) => `${f(mm(x))} ${f(mm(y - SC[1]))}`;
  const d = 30 * PX_DEG;
  return `M${q([-d, 144])}L${q([-d, 511])}M${q([d, 144])}L${q([d, 511])}`;
})();
/** Spotlight scan limits, ±10° about the cursor (p. 383). */
const LIMITS_X10 = (() => {
  const q = ([x, y]: P) => `${f(mm(x))} ${f(mm(y - SC[1]))}`;
  const d = 10 * PX_DEG;
  return `M${q([-d, 144])}L${q([-d, 511])}M${q([d, 144])}L${q([d, 511])}`;
})();

/* ---------------------------------------------------------------- AIM-120 */

/**
 * AIM-120 symbology on the FCR (p. 598 image, the same 660 px grid). The missile scale stands on the right of the
 * B-scope: its bar at x 513.3, zero at y 436.7; the guide's figure (40 NM scale) puts the target-range caret at the
 * bugged target's range (26.8 NM, measured off the B-scope) 140.7 px up the bar, so the scale is taken as 210 px for
 * the radar's range scale. RPI is the bar's top, with a tick right to x 531.7; the box from RTR to RMIN is 18 px wide;
 * ROPT a circle (r 4.5) on the bar's left; RAERO a triangle pointing left (13 x 12 px). The closure and caret end at
 * x 512.5, the pre-launch pole 14.7 px under them; the post-launch pole and time (or the pre-launch time) are right
 * aligned at x 537, 10 and 27.3 px under the bar. The ASEC (r 49.4 at RPI, centre 331.9, 329) and the ASC (r 4.5) are
 * white; the guide's figure shows the large circle only, so the small one is scaled from the HUD's (p. 597).
 */
const DLZ_X = 513.3, DLZ_0 = 436.7, DLZ_H = 210;
const ASEC_C: P = [331.9, 329], ASEC_R = 49.4;
function mrmMarks(m: MrmView, scale: Scale) {
  const words: Page['words'] = [];
  let marks = '';
  if (m.rdy) words.push(w(m.rdy, 332, 511));
  if (m.nm === undefined || !m.dlz) return { words, marks };
  const y = (nm: number) => DLZ_0 - (Math.min(nm, scale) / scale) * DLZ_H;
  const d = m.dlz;
  marks += poly([[DLZ_X, y(d.min)], [DLZ_X, y(d.pi)], [531.7, y(d.pi)]]) + rect(DLZ_X, y(d.tr), 531.7, y(d.min));
  marks += ring([DLZ_X - 4.5, y(d.opt)], 4.5) + poly([[514, y(d.aero)], [527, y(d.aero) - 6], [527, y(d.aero) + 6]], true);
  const ty = y(m.nm);
  words.push(w(`${m.closure}>`, 512.5, ty, 'end'));
  if (m.pre) words.push(w(m.pre[0], 500, ty + 14.7, 'end'));
  const lines = m.post ?? (m.pre ? [m.pre[1]] : []);
  lines.forEach((t, i) => words.push(w(t, 537, DLZ_0 + 10 + 17.3 * i, 'end')));
  if (m.asec !== undefined) {
    const r = (ASEC_R * asecDeg(m.asec)) / ASEC.large;
    marks += ring(ASEC_C, r);
    if (m.asc) {
      const k = (v: number) => Math.max(-1.6, Math.min(1.6, v)) * r;
      marks += ring([ASEC_C[0] + k(m.asc[0]), ASEC_C[1] + k(m.asc[1])], 4.5);
    }
  }
  return { words, marks };
}
/**
 * The AIM-120 target marks (p. 598 key): a rectangular tail behind the symbol once a missile is in flight (drawn 10 x 6
 * px, on the far side of the ring from the heading line, from the key's proportions), flashing once the missile is
 * active; a red X (26 px) over it for the last 8 s, flashing for 5 s after.
 */
function mrmTarget([x, y]: P, hot: boolean, m: MrmView, out: { fills: string; flashFill: string; red: string; redFlash: string }) {
  if (m.tail) {
    const t = hot ? rect(x - 5, y - 19, x + 5, y - 13) : rect(x - 5, y + 13, x + 5, y + 19);
    if (m.tail === 'flash') out.flashFill += t; else out.fills += t;
  }
  if (m.x) {
    const xx = poly([[x - 13, y - 13], [x + 13, y + 13]]) + poly([[x + 13, y - 13], [x - 13, y + 13]]);
    if (m.x === 'flash') out.redFlash += xx; else out.red += xx;
  }
}

/* -------------------------------------------------------------------- state */

export type Sub = 'RWS' | 'VSR' | 'SAM' | 'STT';
export interface FcrState {
  soi: boolean;
  scale: Scale;
  sub: Sub;
  az: 'A6' | 'A3' | 'A2';
  /** The cursor (B-scope px), or `free` while it is slewed by hand (the procedure moves it), or none (STT). */
  cursor: P | 'free' | null;
  /** The contact the cursor rests on (its altitude printed below it). */
  over?: ContactId;
  /** The bugged target (SAM primary, STT). */
  bug?: ContactId;
  /** In A3, the scan's centre (° off the nose): contacts outside ±30° of it are no longer refreshed and drop off. */
  scanAz?: number;
  /** The antenna's azimuth (° off the nose) at the moment pictured. */
  ant: number;
  /** The search sub-mode STT was entered from, when VSR. */
  from?: 'VSR';
  /** The jet's heading (° magnetic): 360 unless it has turned onto the collision course (347). */
  hdg?: number;
  /** `none`: none of the scene's contacts are drawn (the page draws its own). */
  scene?: 'none';
  /** Contacts are drawn only while inside the scanned volume (set by ANT ELEV and the bars). */
  vcheck?: boolean;
  /** No steerpoint symbol (the jet has flown on: the picture's own geometry puts it elsewhere). */
  noStpt?: boolean;
  /** Antenna elevation set with ANT ELEV (° up); 0 by default. */
  el?: number;
  /** Elevation bars (4 by default). */
  bars?: Bars;
  /** Spotlight scan (TMS forward held): A1 4B about the cursor while held (p. 383). */
  spot?: boolean;
  /** Contacts moved from their place in the scene (AIM-120 shots: the lead closing), azimuth off 360° and range. */
  moved?: Partial<Record<ContactId, { az: number; nm: number }>>;
  /** AIM-120 symbology (p. 598): the status word, and with a bugged target the missile scale, ASEC and ASC. */
  mrm?: MrmView;
}
/** A point's azimuth off the nose on a heading (the scene is laid out on 360°). */
const off = (az: number, hdg = 360) => ((az + 360 - hdg + 540) % 360) - 180;
/** Where the steerpoint (10 NM north) lies off the nose. */
const stptAz = (hdg = 360) => off(0, hdg);

/**
 * The bugged target's data along the top (p. 405 items 1-4): aspect, ground track, airspeed and closure. The scenario's
 * lead is at 340° from the jet, so the line of sight back to the jet is 160°; it flies 150°, so the jet is 10° right of
 * its nose. Aspect counts tens of degrees from the target's tail (p. 405: 0 = tail-on, 18 = nose-on), so 170° right
 * reads 17R. It flies 280 KCAS (about 404 KTAS at 25,000 ft). The jet flies 550 KTAS (0.92 Mach at 28,000 ft).
 * Collision course: the jet's speed across the line of sight must match the target's, 404 sin 10° = 550 sin L, a lead
 * L of 7.3° right of the target, so the CATA is at 347° (12.7° left of the nose on 360°, 7.3° right of the lead). On
 * the 347° heading they close at 550 cos 7° + 404 cos 10° = 944 kt (on 360°, 550 cos 20° + 398 = 915 kt).
 * `CATA_HDG` is the lead's collision heading (° magnetic).
 */
export const CATA_HDG = 347;
const cos = (d: number) => Math.cos((d * Math.PI) / 180);
/**
 * The far contact (VSR) flies 188°, straight at the jet (aspect 18, nose-on, its CATA on top of it), at 400 KCAS (about
 * 628 KTAS, Mach 1.08, at 33,000 ft): closure 550 cos 8° + 628 = 1173 kt. Its track shows to the nearest 10°.
 */
const TOI: Partial<Record<ContactId, { aspect: string; track: string; kcas: string; closure: (hdg: number) => number; cata: number }>> = {
  lead: { aspect: '17R', track: '150°', kcas: '280', closure: hdg => Math.round(550 * cos(340 - hdg) + 404 * cos(10)), cata: CATA_HDG },
  far: { aspect: '18', track: '190°', kcas: '400', closure: hdg => Math.round(550 * cos(8 - (hdg - 360)) + 628), cata: 368 },
};
const toiData = (k: ContactId, hdg = 360, mrm?: MrmView) => {
  const t = TOI[k]!;
  /** With AIM-120 symbology the moment carries its own aspect and closure (`aim120-scene.ts`). */
  const a = mrm?.aspect, aspect = a === undefined ? t.aspect : Math.round(Math.abs(a) / 10) >= 18 ? '18' : `${Math.round(Math.abs(a) / 10)}${a > 0 ? 'R' : 'L'}`;
  return [w(aspect, 128, 136.5, 'start'), w(t.track, 186, 136.5, 'start'), w(t.kcas, 405, 136.5), w(`+${mrm?.closure ?? t.closure(hdg)}K`, 513.5, 136.5, 'end')];
};

export function fcr(id: string, s: FcrState): Page {
  // SAM and STT keep the search sub-mode's label (pp. 417, 421 show RWS); STT entered from VSR is assumed to keep VSR.
  const sub = s.sub === 'VSR' || s.from === 'VSR' ? 'VSR' : 'RWS';
  const words: Page['words'] = [
    w('CRM', 185.5, 117.5), w(sub, 258.5, 117.5), ...(sub === 'VSR' ? [] : [w('NORM', 332, 117.5)]), w('OVRD', 405, 117.5), w('CNTL', 477, 117.5),
    w('CONT', 551.5, 204.5, 'end'),
    w(String(s.scale), 128.5, 223),
    w('A', 117.5, 321), w(s.spot ? '1' : s.az[1], 117.5, 341), w(String(s.spot ? 4 : s.bars ?? 4), 117.5, 389), w('B', 117.5, 408.5),
    w('M4', 112.5, 462.5, 'start'), w('NONE', 180, 518),
    w('SWAP', 186, 538.5), w('FCR', 259, 538.5, undefined, true), w('TEST', 332, 538.5), w('DTE', 405, 538.5), w('DCLT', 477.5, 538.5),
  ];
  // Range scale arrows as the HSD's (p. 394 measures the same 113-145 px).
  let marks = poly([[129, 192], [145, 208], [113, 208]], true) + poly([[113, 237], [145, 237], [129, 254]], true);
  let fills = '';
  const paths: NonNullable<Page['paths']> = [];
  const cyan: string[] = [];
  // Elevation scale (cyan): ticks every 10° from +30° to -30°, the 0° tick longer; the caret at the antenna's elevation (0°).
  for (const k of [-3, -2, -1, 1, 2, 3]) cyan.push(poly([[149, 327.5 - k * 36.5], [163, 327.5 - k * 36.5]]));
  // The caret (a sideways T) moves 3.65 px a degree with the antenna (p. 397 item 20: ±60° over the scale).
  const ey = 327.5 - (s.el ?? 0) * 3.65;
  cyan.push(poly([[149, 327.5], [167, 327.5]]), poly([[136, ey], [147, ey]]) + poly([[147.5, ey - 5.5], [147.5, ey + 5.5]]));
  // Horizon line (level flight), cyan.
  cyan.push(poly([[220, 334], [220, 327.5], [312, 327.5]]) + poly([[351, 327.5], [442, 327.5], [442, 334]]));
  // Azimuth scale: white ticks every 10° from -30° to +30°, the 0° tick taller; the antenna caret (cyan T) on the format row.
  for (const k of [-3, -2, -1, 1, 2, 3]) marks += poly([[AZ0 + k * 36.75, 507], [AZ0 + k * 36.75, 522]]);
  marks += poly([[AZ0, 502], [AZ0, 522]]);
  const ax = AZ0 + s.ant * PX_DEG;
  cyan.push(poly([[ax - 5, 527], [ax + 5, 527]]) + poly([[ax, 527], [ax, 540]]));
  // Range marks (green) at a quarter, a half and three quarters of the scale.
  paths.push({ d: [217.5, 327.5, 438].map(y => poly([[538, y], [553, y]])).join(''), c: 'green' });
  // Aircraft reference symbol (p. 396 item 14): the steering line off the W's centre toward the steerpoint (p. 394 shows
  // it at the W's left end; here 1 px per degree off the nose, pegged at 21 px, as on the HSD).
  const sx = 133.5 + Math.max(-21, Math.min(21, stptAz(s.hdg)));
  cyan.push(poly([[112, 515], [122, 515], [128, 527], [133.5, 515], [139, 527], [144.5, 515], [155, 515]]) + poly([[sx, 503], [sx, 539]]));
  // SOI frame, or NOT SOI.
  let fine = '';
  if (s.soi) fine += FRAME;
  else words.push(w('NOT SOI', 331, 160));

  const tgt = { fills: '', flashFill: '', red: '', redFlash: '' };
  // Scene: the steerpoint, then the contacts the radar shows in this sub-mode.
  if (!s.noStpt) fills += cake(scope(stptAz(s.hdg), 10, s.scale));
  const shown = (Object.entries(CONTACTS) as [ContactId, Contact][]).filter(([k, t]) => {
    if (s.sub === 'STT') return k === s.bug;
    if (s.scene === 'none' || ((t as Contact).low && !s.vcheck)) return false;
    if (s.vcheck) {
      // Seen only inside the scanned volume: within the bars' half-height of the antenna, as seen from the jet.
      const tel = (Math.atan2((t.alt * 1000 - OWN_ALT) / FT_NM, t.nm) * 180) / Math.PI;
      if (Math.abs(tel - (s.el ?? 0)) > HALF[s.spot ? 4 : s.bars ?? 4]) return false;
    }
    if (s.az === 'A3' && Math.abs(off(t.az, s.hdg) - (s.scanAz ?? 0)) > 30) return false;
    if (s.sub === 'VSR') return t.hot;
    return !t.vsrOnly;
  });
  for (const [k, t0] of shown) {
    const t = { ...t0, ...s.moved?.[k] };
    const p = scope(off(t.az, s.hdg), t.nm, s.scale);
    if (p[1] < 112) continue;
    if (k === s.bug) {
      const b = bugged(p, t.hot);
      marks += b.marks; fills += b.fills + cata(scope(off(TOI[k]!.cata - 360, s.hdg), t.nm, s.scale));
      words.push(w(pad(t.alt, 2), p[0], p[1] + 28));
      if (s.mrm) mrmTarget(p, t.hot, s.mrm, tgt);
    } else {
      fills += searchTarget(p, s.sub === 'VSR' ? null : t.hot);
      if (k === s.over) words.push(w(pad(t.alt, 2), p[0], p[1] + 28));
    }
  }
  if (s.bug) {
    words.push(...toiData(s.bug, s.hdg, s.mrm));
    // SAM track indicators (p. 418): crosses on the elevation and azimuth scales at the primary target's elevation and azimuth.
    if (s.sub === 'SAM') {
      const t = { ...CONTACTS[s.bug], ...s.moved?.[s.bug] }, el = (Math.atan2((t.alt * 1000 - OWN_ALT) / FT_NM, t.nm) * 180) / Math.PI;
      const ey = 327.5 - el * 3.65, tx = AZ0 + off(t.az, s.hdg) * PX_DEG;
      cyan.push(poly([[139, ey], [151, ey]]) + poly([[145, ey - 6], [145, ey + 6]]) + poly([[tx - 6, 528], [tx + 6, 528]]) + poly([[tx, 520], [tx, 536]]));
    }
  }
  // Cursor: its altitude limits and the bearing and range from the steerpoint (left column); none while slewed or in STT.
  let cursor: Page['cursor'];
  // The cursor stays on the format when the FCR is not the SOI; it just does not answer the cursor switch.
  if (s.cursor) {
    const at = s.cursor === 'free' ? null : s.cursor;
    cursor = { d: CURSOR_BARS, at: at ? [f(mm(at[0] - SC[0])), f(mm(at[1] - SC[1]))] : [0, 0] };
    if (at) {
      const { az, nm } = unscope(at, s.scale);
      const [hi, lo] = limits(nm, s.el ?? 0, s.spot ? 4 : s.bars ?? 4);
      words.push(c(w(pad(hi, 2), at[0] + 18, at[1] - 12.5, 'start'), hi < 0 ? 'red' : 'cyan'), c(w(pad(lo, 2), at[0] + 18, at[1] + 13.5, 'start'), lo < 0 ? 'red' : 'white'));
      const b = fromStpt(az, nm, s.hdg);
      words.push(w(pad(b.brg, 3), 112.5, 440, 'start'), w(pad(b.nm, 2), 151, 440, 'start'));
    }
  }
  // In STT there is no cursor: the field gives the bearing and range from the steerpoint to the bugged target (p. 421).
  if (s.sub === 'STT' && s.bug) {
    const t = { ...CONTACTS[s.bug], ...s.moved?.[s.bug] }, b = fromStpt(off(t.az, s.hdg), t.nm, s.hdg);
    words.push(w(pad(b.brg, 3), 112.5, 440, 'start'), w(pad(b.nm, 2), 151, 440, 'start'));
  }
  paths.push({ d: cyan.join(''), c: 'cyan' });
  if (s.mrm) {
    const m = mrmMarks(s.mrm, s.scale);
    words.push(...m.words); marks += m.marks;
    fills += tgt.fills;
    if (tgt.red) paths.push({ d: tgt.red, c: 'red' });
  }
  const page: Page = { id, words, marks, fills, fine, paths, ...(cursor ? { cursor } : {}), ...(tgt.flashFill ? { flashFill: tgt.flashFill } : {}) };
  if (tgt.redFlash) page.paths!.push({ d: tgt.redFlash, c: 'red', blink: true });
  if (s.spot && cursor) page.cursorX = { d: LIMITS_X10, c: 'cyan' };
  else if (s.az === 'A3' && cursor && s.sub !== 'STT') page.cursorX = { d: LIMITS_X, c: 'cyan' };
  return page;
}

/* -------------------------------------------------------------------- pages */

/** The cursor's resting place as the guide shows it (p. 394: centred, 14.1 NM on the 40 NM scale). */
export const HOME: P = [333, 392.5];
const on = (k: ContactId, scale: Scale, hdg = 360): P => scope(off(CONTACTS[k].az, hdg), CONTACTS[k].nm, scale);

/** The states the radar procedures pass through. */
export const FCR_STATES = {
  'fcr-not-soi': { soi: false, scale: 40, sub: 'RWS', az: 'A6', cursor: HOME, ant: -12.5 },
  'fcr-40': { soi: true, scale: 40, sub: 'RWS', az: 'A6', cursor: HOME, ant: -12.5 },
  'fcr-80': { soi: true, scale: 80, sub: 'RWS', az: 'A6', cursor: HOME, ant: 22 },
  'fcr-80-a3': { soi: true, scale: 80, sub: 'RWS', az: 'A3', cursor: HOME, ant: 14 },
  'fcr-80-a3-free': { soi: true, scale: 80, sub: 'RWS', az: 'A3', cursor: 'free', ant: -8, scanAz: -20 },
  'fcr-80-a3-lead': { soi: true, scale: 80, sub: 'RWS', az: 'A3', cursor: on('lead', 80), over: 'lead', ant: -28, scanAz: -20 },
  'fcr-sam': { soi: true, scale: 80, sub: 'SAM', az: 'A3', cursor: on('lead', 80), bug: 'lead', ant: -2, scanAz: -20 },
  'fcr-sam-turned': { soi: true, scale: 80, sub: 'SAM', az: 'A3', cursor: on('lead', 80, 347), bug: 'lead', ant: 18, hdg: 347, scanAz: -7 },
  'fcr-stt': { soi: true, scale: 80, sub: 'STT', az: 'A3', cursor: null, bug: 'lead', ant: 0, hdg: 347 },
  'fcr-rws-turned': { soi: true, scale: 80, sub: 'RWS', az: 'A3', cursor: on('lead', 80, 347), over: 'lead', ant: -20, hdg: 347, scanAz: -7 },
  'fcr-vsr': { soi: true, scale: 80, sub: 'VSR', az: 'A6', cursor: HOME, ant: 30 },
  'fcr-vsr-free': { soi: true, scale: 80, sub: 'VSR', az: 'A6', cursor: 'free', ant: -20 },
  'fcr-vsr-far': { soi: true, scale: 80, sub: 'VSR', az: 'A6', cursor: on('far', 80), over: 'far', ant: 5 },
  'fcr-vsr-stt': { soi: true, scale: 80, sub: 'STT', az: 'A6', cursor: null, bug: 'far', ant: 8, from: 'VSR' },
} satisfies Record<string, FcrState>;
/**
 * The AIM-120 single-target shot (see `aim120-scene.ts`): before the bug, the radar as the RWS procedure leaves it at
 * 40 NM, A6, with the missile status word; then one page per moment of the shot, the lead bugged in SAM.
 */
const R = { rdy: 'RDY' } as const;
const AIM_STATES: Record<string, FcrState> = {
  'fcr-msl': { soi: false, scale: 40, sub: 'RWS', az: 'A6', cursor: HOME, ant: -12.5, mrm: { rdy: '' } },
  'fcr-msl-rdy': { soi: false, scale: 40, sub: 'RWS', az: 'A6', cursor: HOME, ant: -12.5, mrm: R },
  'fcr-msl-soi': { soi: true, scale: 40, sub: 'RWS', az: 'A6', cursor: HOME, ant: 20, mrm: R },
  'fcr-msl-80': { soi: true, scale: 80, sub: 'RWS', az: 'A6', cursor: HOME, ant: 22, mrm: R },
  'fcr-msl-80-free': { soi: true, scale: 80, sub: 'RWS', az: 'A6', cursor: 'free', ant: -8, mrm: R },
  'fcr-msl-80-lead': { soi: true, scale: 80, sub: 'RWS', az: 'A6', cursor: on('lead', 80), over: 'lead', ant: -28, mrm: R },
  ...Object.fromEntries((Object.entries(MOMENTS) as [MomentId, (typeof MOMENTS)[MomentId]][]).map(([k, m]) => [`fcr-aim-${k}`, {
    soi: true, scale: scaleFor(m.nm), sub: 'SAM', az: 'A6', cursor: scope(((m.brg - m.hdg + 540) % 360) - 180, m.nm, scaleFor(m.nm)), bug: 'lead', ant: 0, hdg: m.hdg,
    moved: { lead: { az: m.brg - 360, nm: m.nm }, wing: { az: m.brg - 363.5, nm: m.nm + 1 } }, mrm: m.view,
  } satisfies FcrState])),
};
export type FcrPage = keyof typeof FCR_STATES;

/**
 * Finding the low single (the basic radar controls procedure): from A3 with the cursor at home (28 NM on the 80 NM
 * scale), the ANT ELEV knob (every 5 % of travel, `d5` = 5 % down) tilts the volume; the single shows once the volume
 * reaches down to it. With the antenna 3° down the cursor goes onto it and OSB 17 thins the bars. Contacts are seen only
 * inside the scanned volume (`vcheck`).
 */
export const ANT_STOPS = Array.from({ length: 41 }, (_, i) => 100 - i * 5);
export const antId = (v: number) => (v > 0 ? `u${v}` : v < 0 ? `d${-v}` : 'center');
const AIM: P = scope(10, 30, 40);
const elStates: Record<string, FcrState> = {};
const elLabels: Record<string, string> = {};
for (const v of ANT_STOPS) {
  const el = v * ANT_DEG_PER_PCT, id = antId(v);
  elStates[`fcr-80-a3-${id}`] = { ...FCR_STATES['fcr-80-a3'], el, vcheck: true };
  elLabels[`fcr-80-a3-${id}`] = `FCR: A3, antenna ${el}°`;
}
const DOWN = 5 * -ANT_DEG_PER_PCT;
elStates['fcr-80-a3-low-free'] = { ...FCR_STATES['fcr-80-a3-free'], scanAz: -10, el: DOWN, vcheck: true };
elLabels['fcr-80-a3-low-free'] = 'FCR: antenna 3° down, cursor being slewed';
elStates['fcr-80-a3-low'] = { soi: true, scale: 80, sub: 'RWS', az: 'A3', cursor: on('low', 80), over: 'low', ant: -14, scanAz: -10, el: DOWN, vcheck: true };
elLabels['fcr-80-a3-low'] = 'FCR: antenna 3° down, cursor on the low single';
elStates['fcr-80-a3-low-2b'] = { ...elStates['fcr-80-a3-low'], bars: 2 };
elLabels['fcr-80-a3-low-2b'] = 'FCR: cursor on the low single, two bars';
const volStates = elStates, volLabels = elLabels;
export const fcrPages: Page[] = [...Object.entries(FCR_STATES), ...Object.entries(volStates), ...Object.entries(AIM_STATES)].map(([id, s]) => fcr(id, s as FcrState));
export const aimFcrLabels: Record<string, string> = Object.fromEntries(Object.entries(AIM_STATES).map(([id, s]) => [id,
  `FCR with AIM-120: ${s.bug ? `SAM, lead ${s.moved?.lead?.nm} NM${s.mrm?.post ? `, missile ${s.mrm.post[1]}` : ''}${s.mrm?.x ? ', X' : ''}` : `RWS ${s.scale} NM${s.soi ? '' : ', not SOI'}${s.mrm?.rdy ? ', RDY' : ''}`}`]));
/** The cursor's slew onto the lead in A6 (the AIM-120 shot). */
export const AIM_SLEW = { start: local(HOME), target: local(on('lead', 80)), reach: f(mm(9)), speed: f(mm(140)), box: [...local([125, 125]), ...local([537, 500])] as [number, number, number, number] };
export const fcrPageLabels: Record<FcrPage, string> = {
  'fcr-not-soi': 'FCR air-to-air (CRM RWS, 40 NM, A6 4B), not SOI',
  'fcr-40': 'FCR air-to-air: SOI, 40 NM, the single contact to the right',
  'fcr-80': 'FCR: 80 NM, the group 45 NM ahead and left',
  'fcr-80-a3': 'FCR: A3, scan limits ±30° about the cursor',
  'fcr-80-a3-free': 'FCR: cursor being slewed',
  'fcr-80-a3-lead': 'FCR: cursor on the lead contact, its altitude shown',
  'fcr-sam': 'FCR: SAM, the lead bugged',
  'fcr-sam-turned': 'FCR: SAM, turned 13° left to put the CATA on the nose',
  'fcr-stt': 'FCR: STT on the lead',
  'fcr-rws-turned': 'FCR: back in RWS, the cursor still on the lead',
  'fcr-vsr': 'FCR: VSR, only nose-on contacts, a far contact found',
  'fcr-vsr-free': 'FCR VSR: cursor being slewed',
  'fcr-vsr-far': 'FCR VSR: cursor on the far contact',
  'fcr-vsr-stt': 'FCR: STT on the far contact (from VSR)',
  ...volLabels,
} as Record<FcrPage, string>;

/* ------------------------------------------------------------------- helpers */

/** A hint box in p. 394 pixels (`#x0 y0 x1 y1` in mm about the screen centre). */
export const fcrBox = (x0: number, y0: number, x1: number, y1: number) => `#${[x0 - SC[0], y0 - SC[1], x1 - SC[0], y1 - SC[1]].map(v => f(mm(v))).join(' ')}`;
/** A hint ring round a contact on a scale. */
export const fcrSpot = (k: ContactId, scale: Scale, r = 14) => { const [x, y] = on(k, scale); return fcrBox(x - r, y - r, x + r, y + r); };
/** A hint ring round a scope point. */
export const fcrAt = (az: number, nm: number, scale: Scale, r = 14) => { const [x, y] = scope(az, nm, scale); return fcrBox(x - r, y - r, x + r, y + r); };
/** Slews: from the cursor's home onto the lead (RWS, 80 NM) or onto the far contact (VSR). */
const slewTo = (k: ContactId) => ({
  start: local(HOME), target: local(on(k, 80)), reach: f(mm(9)), speed: f(mm(140)),
  box: [...local([125, 125]), ...local([537, 500])] as [number, number, number, number],
});
export const FCR_SLEW = {
  lead: slewTo('lead'), far: slewTo('far'), low: slewTo('low'),
  aim: { start: local(HOME), target: local(AIM), reach: f(mm(9)), speed: f(mm(140)), box: [...local([125, 125]), ...local([537, 500])] as [number, number, number, number] },
};
/** Hint box round the called position on the 40 NM scale. */
export const fcrAim = (r = 16) => fcrBox(AIM[0] - r, AIM[1] - r, AIM[0] + r, AIM[1] + r);
