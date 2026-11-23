import type { MfdDisplay } from '../types';
import { tracer } from '../trace.ts';
import { IR_AIM, IR_SPI, MAV_IR_B_NARROW, MAV_IR_B_WIDE, MAV_IR_T_NARROW, MAV_IR_T_WIDE, MAV_TV_BORE, MAV_TV_LEAD, MAV_TV_TANK3, MAV_TV_NARROW, MAV_TV_SPI, MAV_TV_WIDE, MAV_VIDEO_K } from './maverick-video.ts';

/**
 * F-16C AGM-65 Maverick formats for the shared MFD (`mfd.ts`): the SMS page with AG65 selected (guide p. 672) and
 * the WPN page showing the seeker's video (p. 673). Words sit on the formats' fixed layout (as `mfd-harm.ts`: top
 * row OSB 1-5 at x 186, 258, 332, 405, 478; bottom row OSB 15-11; left column OSB 20-16 and right column OSB 6-10
 * at the HAD's rows). The WPN symbols are traced from the p. 673 image (584 x 568 px, the same MFD seen square-on):
 * its OSBs give x = 329.5 + (x - 290.5) * 1.164 and y = 330.5 + (y - 289) * 1.19 on the 660 px MFD grid.
 *
 * The seeker video is a to-scale placeholder (`maverick-video.ts`), to be replaced by generated art.
 */
const PX = 4.8;
const { mm } = tracer(PX);
const SC: [number, number] = [329.5, 330];
type Page = MfdDisplay['pages'][number];
type Word = Page['words'][number];
type P = [number, number];
const w = (t: string, x: number, y: number, a?: Word['a'], inv?: boolean): Word =>
  ({ t, at: [mm(x - SC[0]), mm(y - SC[1])], ...(a ? { a } : {}), ...(inv ? { inv } : {}) });
const q = ([x, y]: P) => `${+mm(x - SC[0]).toFixed(3)} ${+mm(y - SC[1]).toFixed(3)}`;
const poly = (pts: P[], close = false) => `M${pts.map(q).join('L')}${close ? 'Z' : ''}`;

const TOP = [186, 258, 332, 405, 478], TOP_Y = 116.5;
const BOT = [186, 259, 332, 405, 477.5], BOT_Y = 538.5;
const LEFT_Y = [185.5, 257.5, 329.5, 400.5, 472];
const RIGHT_Y = [184.5, 256.5, 328, 400, 471];
const top = (...t: string[]) => t.map((s, i) => (s ? w(s, TOP[i], TOP_Y) : null)).filter((x): x is Word => !!x);
const row = (cur: 'SMS' | 'WPN') => [
  w('SWAP', BOT[0], BOT_Y), w('SMS', BOT[1], BOT_Y, undefined, cur === 'SMS'), w('HSD', BOT[2], BOT_Y),
  w('WPN', BOT[3], BOT_Y, undefined, cur === 'WPN'), w(cur === 'WPN' ? 'DCLT' : 'S-J', BOT[4], BOT_Y),
];

/* ------------------------------------------------------------------ SMS page */

export type MavMode = 'PRE' | 'VIS' | 'BORE';
/** SMS page (p. 672): A-G (OSB 1), sub-mode (OSB 2), INV (OSB 4), CNTL (OSB 5), weapon (OSB 6), power (OSB 7), release pulses (OSB 8), STEP (OSB 19), stations 3 and 7, station 3 next. */
/** `status`: the weapon status word once warmed up (RDY armed, SIM with MASTER ARM at SIMULATE, p. 674). */
function sms(id: string, mode: MavMode, power: 'off' | 'on' | 'ready', type: 'H' | 'D' = 'H', status: 'RDY' | 'SIM' = 'RDY', next: '3' | '7' = '3'): Page {
  return {
    id, words: [
      ...top('A-G', mode, '', 'INV', 'CNTL'),
      w(`2AG65${type}`, 551.5, RIGHT_Y[0], 'end'),
      ...(power === 'ready' ? [w(status, 385, 185)] : []),
      w('PWR', 551.5, 249, 'end'), w(power === 'off' ? 'OFF' : 'ON', 551.5, 265, 'end'),
      w('RP', 551.5, 320, 'end'), w('1', 551.5, 336, 'end'),
      w('STEP', 111.5, LEFT_Y[1], 'start'),
      w('3', 118, 470), w('7', 546, 470),
      ...(power === 'ready' ? [w(status, 332.5, 505)] : []),
      ...row('SMS'),
    ],
    // The next station to fire is outlined (as on the HARM SMS page, p. 659).
    paths: [{ d: next === '3' ? poly([[111, 461.5], [125, 461.5], [125, 478.5], [111, 478.5]], true) : poly([[539, 461.5], [553, 461.5], [553, 478.5], [539, 478.5]], true), c: 'white', pen: 'fine' }],
  };
}

/* ------------------------------------------------------------------ WPN page */

/** Crosshairs (the missile's line of sight and tracking gate), p. 673: vertical at x 286.5, horizontal at y 282.5. */
export const MAV_CROSS: P = [324.8, 322.8];
const [CX, CY] = MAV_CROSS;
/** Pointer cross and reticle depression: 30.5 image px per 5 degrees (p. 673), so 7.26 grid px a degree. */
const DEG = 7.26;
/** The crosshairs run edge to edge of the format (p. 673: x 100-478, y 97-460); tracking, they open round the target. */
/**
 * Not tracking, the crosshairs stand open round the middle of the picture; locked on a target this small they close
 * (sim screenshots from Nathan: a gap about 7% of the glass before lock, unbroken lines at lock).
 */
const OPEN = 18;
function crosshairs(gate = 0, dx = 0, dy = 0) {
  const x = CX + dx, y = CY + dy;
  if (!gate) return poly([[108, y], [548, y]]) + poly([[x, 102], [x, 534]]);
  return poly([[108, y], [x - gate, y]]) + poly([[x + gate, y], [548, y]]) + poly([[x, 102], [x, y - gate]]) + poly([[x, y + gate], [x, 534]]);
}
/** Reticle depression marks at 5, 10 and 15 degrees under the crosshairs (p. 673: 21 image px wide). */
const DEPRESSION = [5, 10, 15].map(d => poly([[CX - 12, CY + d * DEG], [CX + 12, CY + d * DEG]])).join('');
/** Pointer cross: where the seeker looks, from the boresight (degrees right and down); arms 62 x 58 image px. */
const pointer = (az: number, down: number) => {
  const x = CX + az * DEG, y = CY + down * DEG;
  return poly([[x - 36, y], [x + 36, y]]) + poly([[x, y - 35], [x, y + 35]]);
};
/** Expand-FOV brackets: the narrow field of view's edges, shown in wide (p. 673: corners 189 image px apart, arms 13). */
const BRACKETS = ([[-1, -1], [1, -1], [-1, 1], [1, 1]] as const)
  .map(([sx, sy]) => { const x = CX + sx * 110, y = CY + sy * 110; return poly([[x - sx * 15, y], [x, y], [x, y - sy * 15]]); }).join('');
/** Launch acceptable region (p. 673): a staple on the right, maximum range at the top, minimum at the bottom; the caret and the present range beside it. */
const LAR = { x: 543, top: 356, bottom: 447, max: 8, min: 1 };
const LAR_STAPLE = poly([[LAR.x - 14, LAR.top], [LAR.x, LAR.top], [LAR.x, LAR.bottom], [LAR.x - 14, LAR.bottom]]);
const larY = (nm: number) => LAR.bottom - ((nm - LAR.min) / (LAR.max - LAR.min)) * (LAR.bottom - LAR.top);
/** SOI frame round the format, broken for the WPN page's words. */
const FRAME = [
  poly([[111, 170], [111, 108], [158, 108]]), poly([[214, 108], [236, 108]]), poly([[280, 108], [310, 108]]), poly([[354, 108], [547, 108], [553, 113], [553, 170]]),
  poly([[553, 199], [553, 242]]), poly([[553, 271], [553, 548], [505, 548]]),
  poly([[111, 201], [111, 548], [158, 548]]),
  poly([[214, 548], [238, 548]]), poly([[280, 548], [311, 548]]), poly([[353, 548], [384, 548]]), poly([[426, 548], [450, 548]]),
].join('');

/** Glass px per page unit: the image's 768 px span MAV_VIDEO_K times the 489 px glass. */
const IMG = (v: number) => v * (489 / (768 / MAV_VIDEO_K));
/** The crosshairs' place in the (centred) picture, image px. */
const CROSS_IMG: P = [384 + (CX - SC[0]) / IMG(1), 384 + (CY - SC[1]) / IMG(1)];
/** The video offset (page mm) that puts picture point `p` (image px) under the crosshairs. */
const under = (p: P): P => [mm(IMG(p[0] - CROSS_IMG[0])), mm(IMG(p[1] - CROSS_IMG[1]))];
/**
 * Slew: from the crossroads (the steerpoint the seeker is slaved to) to the lead T-72, under the crosshairs. Landing on
 * any of the three tanks counts (`along`); the picture then settles on the lead.
 */
export const MAV_SLEW = {
  start: under(MAV_TV_SPI), target: under(MAV_TV_LEAD), along: under(MAV_TV_TANK3), reach: mm(7), speed: mm(110),
  box: [mm(-140), mm(-140), mm(140), mm(140)] as [number, number, number, number],
};

interface Wpn {
  id: string; mode: MavMode; video: string; wide: boolean; soi: boolean; pan?: boolean;
  /** Seeker direction from the boresight, degrees right and down. */
  ptr: [number, number]; track?: boolean; station: '3' | '7'; count: number; range?: number; tti?: string; ready: boolean;
  /** AGM-65D pages: the type, the status word (SIM at MASTER ARM SIMULATE), the MBC letter over the station (S unless
   * named, p. 673), HANDOFF IN PROGRESS (p. 687), and where the panned picture sits (page mm; the slew start if not named). */
  type?: 'H' | 'D'; status?: 'RDY' | 'SIM'; mbc?: string; handoff?: boolean; at?: [number, number];
}
function wpn(s: Wpn): Page {
  const words: Word[] = [
    ...top('OPER', s.mode, 'FOV'),
    w('BSGT', 111.5, LEFT_Y[0], 'start'),
    w(`${s.count}AG65${s.type ?? 'H'}`, 551.5, RIGHT_Y[0], 'end'), w('HOC', 551.5, RIGHT_Y[1], 'end'),
    // Station: the Missile Boresight Correlator's status (S: slave) over the next station to fire (p. 673).
    ...(s.station === '3' ? [w(s.mbc ?? 'S', 132, 455.5), w('3', 132, 472)] : [w(s.mbc ?? 'S', 505, 455.5), w('7', 505, 472)]),
    ...(s.ready ? [w(s.status ?? 'RDY', 330, 504)] : []),
    // Where HANDOFF IN PROGRESS is written is assumed (the guide shows no image of it): under NOT SOI.
    ...(s.handoff ? [w('HANDOFF IN', 330, 238), w('PROGRESS', 330, 256)] : []),
    ...(s.tti ? [w(s.tti, 494, 504, 'end')] : []),
    ...(s.range ? [w(`${s.range}>`, 536, larY(s.range), 'end')] : []),
    ...(s.soi ? [] : [w('NOT SOI', 330, 218)]),
    ...row('WPN'),
  ];
  const sx = s.station === '3' ? 132 : 505;
  return {
    id: s.id, words, video: s.video, ...(s.pan ? { pan: true, videoScale: MAV_VIDEO_K, cursor: { d: '', at: s.at ?? MAV_SLEW.start } } : { videoScale: MAV_VIDEO_K }),
    marks: crosshairs(s.track ? 0 : OPEN) + DEPRESSION + pointer(...s.ptr) + (s.wide ? BRACKETS : '') + (s.range ? LAR_STAPLE : ''),
    fine: s.soi ? FRAME : '',
    paths: [{ d: poly([[sx - 7, 463.5], [sx + 7, 463.5], [sx + 7, 480.5], [sx - 7, 480.5]], true), c: 'white', pen: 'fine' }],
  };
}

/** Seeker angles in the scenario: the jet in a shallow dive, the target area 8.5 degrees under the boresight. */
const AT_SPI: [number, number] = [0, 8.5], AT_LEAD: [number, number] = [0.9, 8.2];
const pre = { mode: 'PRE' as const, station: '3' as const, count: 2, range: 4, tti: '000:24', ready: true };
export const maverickPages: Page[] = [
  sms('sms-ag65-off', 'BORE', 'off'), sms('sms-ag65-on', 'BORE', 'on'), sms('sms-ag65', 'BORE', 'ready'), sms('sms-ag65-pre', 'PRE', 'ready'),
  wpn({ id: 'wpn-mav-bore', mode: 'BORE', video: MAV_TV_BORE, wide: true, soi: false, ptr: [0, 0], station: '3', count: 2, ready: true }),
  wpn({ id: 'wpn-mav-pre-notsoi', ...pre, video: MAV_TV_WIDE, wide: true, soi: false, pan: true, ptr: AT_SPI }),
  wpn({ id: 'wpn-mav-pre', ...pre, video: MAV_TV_WIDE, wide: true, soi: true, pan: true, ptr: AT_SPI }),
  wpn({ id: 'wpn-mav-narrow', ...pre, video: MAV_TV_NARROW, wide: false, soi: true, ptr: AT_LEAD }),
  wpn({ id: 'wpn-mav-track', ...pre, video: MAV_TV_NARROW, wide: false, soi: true, ptr: AT_LEAD, track: true }),
  // After the shot: station 7 is next, its seeker video on the same picture, not tracking.
  wpn({ id: 'wpn-mav-7', ...pre, station: '7', count: 1, video: MAV_TV_NARROW, wide: false, soi: true, ptr: AT_LEAD }),
];
/* ------------------------------------------- AGM-65D boresight and TGP handoff */

type IP = readonly [number, number];
const add = (a: IP, b: IP): P => [a[0] + b[0], a[1] + b[1]];
const mid = (a: IP, b: IP, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/**
 * Each missile's seeker is a little out of line with the pod until it is boresighted (illustrative: about 0.1 to 0.2
 * degrees), so slaved to the steerpoint it looks just beside it. Narrow-picture px, the point under the crosshairs.
 */
const ERR3: IP = [30, 22], ERR7: IP = [-26, 18];
const slewD = (from: IP, to: IP) => ({ start: under(from as P), target: under(to as P), reach: mm(6), speed: mm(45), box: [mm(-140), mm(-140), mm(140), mm(140)] as [number, number, number, number] });
/** Boresighting: station 3's seeker from beside steerpoint 3 onto the chimney, then station 7's from beside the chimney. */
export const MAV_D_SLEW3 = { ...slewD(add(IR_SPI, ERR3), IR_AIM.bNarrow), what: 'chimney' };
export const MAV_D_SLEW7 = { ...slewD(add(IR_AIM.bNarrow, ERR7), IR_AIM.bNarrow), what: 'chimney' };
/** Seeker angles: boresight scene 10 NM ahead at 8,000 ft, the jet level (7.6 degrees down plus 2 of nose-up); target scene in a shallow dive. */
const B_PTR: [number, number] = [0, 9.6], T_PTR: [number, number] = [0, 8.3], T_PTR_TANK: [number, number] = [0.22, 8.25];
const bD = { type: 'D' as const, mode: 'PRE' as const, count: 2, ready: true, status: 'SIM' as const, ptr: B_PTR };
const tD = { type: 'D' as const, mode: 'PRE' as const, station: '7' as const, count: 2, ready: true, range: 5, tti: '000:31' };
const bNar = (id: string, at: IP, o: Partial<Wpn> = {}) => wpn({ id, ...bD, station: '3', video: MAV_IR_B_NARROW, wide: false, soi: true, pan: true, at: under(at as P), ...o });
const tNar = (id: string, at: IP, o: Partial<Wpn> = {}) => wpn({ id, ...tD, video: MAV_IR_T_NARROW, wide: false, soi: false, pan: true, at: under(at as P), ptr: T_PTR, ...o });
export const maverickDPages: Page[] = [
  sms('sms-d-off', 'BORE', 'off', 'D'), sms('sms-d-on', 'BORE', 'on', 'D'), sms('sms-d', 'BORE', 'ready', 'D', 'SIM'), sms('sms-d-pre', 'PRE', 'ready', 'D', 'SIM'),
  // After boresighting station 7 is next to fire, so the shot starts there.
  sms('sms-d-pre7', 'PRE', 'ready', 'D', 'SIM', '7'), sms('sms-d-pre-off', 'PRE', 'off', 'D', 'RDY', '7'), sms('sms-d-pre-on', 'PRE', 'on', 'D', 'RDY', '7'), sms('sms-d-pre-rdy', 'PRE', 'ready', 'D', 'RDY', '7'),
  // Boresighting, steerpoint 3, MASTER ARM at SIMULATE.
  wpn({ id: 'wpn-d-b-wide', ...bD, station: '3', video: MAV_IR_B_WIDE, wide: true, soi: false, pan: true, at: under(add(IR_SPI, [ERR3[0] / 2, ERR3[1] / 2])) }),
  bNar('wpn-d-b-narrow', add(IR_SPI, ERR3), { soi: false }),
  bNar('wpn-d-b', add(IR_SPI, ERR3)),
  bNar('wpn-d-b-track', IR_AIM.bNarrow, { track: true }),
  bNar('wpn-d-b-slaved', IR_AIM.bNarrow),
  bNar('wpn-d-b7', add(IR_AIM.bNarrow, ERR7), { station: '7' }),
  bNar('wpn-d-b7-track', IR_AIM.bNarrow, { station: '7', track: true }),
  bNar('wpn-d-b7-slaved', IR_AIM.bNarrow, { station: '7' }),
  // The shot, steerpoint 5, armed: the seeker follows the pod as the correlator hands the tank off (S, 1, 2, T, C).
  wpn({ id: 'wpn-d-t-wide', ...tD, video: MAV_IR_T_WIDE, wide: true, soi: false, pan: true, at: under(IR_SPI as P), ptr: T_PTR }),
  tNar('wpn-d-t', IR_SPI),
  tNar('wpn-d-t-1', mid(IR_SPI, IR_AIM.tNarrow, 0.55), { mbc: '1', handoff: true, ptr: mid(T_PTR, T_PTR_TANK, 0.55) }),
  tNar('wpn-d-t-2', add(IR_AIM.tNarrow, [5, 3]), { mbc: '2', handoff: true, ptr: T_PTR_TANK }),
  tNar('wpn-d-t-T', IR_AIM.tNarrow, { mbc: 'T', handoff: true, track: true, ptr: T_PTR_TANK }),
  tNar('wpn-d-t-C', IR_AIM.tNarrow, { mbc: 'C', track: true, ptr: T_PTR_TANK }),
  tNar('wpn-d-t-3', IR_AIM.tNarrow, { station: '3', count: 1, soi: false, ptr: T_PTR_TANK }),
];
export const maverickDPageLabels: Record<string, string> = {
  'sms-d-off': 'SMS format: AG65D selected, BORE, powered off',
  'sms-d-on': 'SMS format: AG65D, BORE, powered on and warming up',
  'sms-d': 'SMS format: AG65D, BORE, ready, MASTER ARM at SIMULATE',
  'sms-d-pre': 'SMS format: AG65D, PRE, MASTER ARM at SIMULATE',
  'sms-d-pre7': 'SMS format: AG65D, PRE, SIM, station 7 next',
  'sms-d-pre-off': 'SMS format: AG65D, PRE, powered off',
  'sms-d-pre-on': 'SMS format: AG65D, PRE, powered on and warming up',
  'sms-d-pre-rdy': 'SMS format: AG65D, PRE, armed and ready',
  'wpn-d-b-wide': 'WPN format: AGM-65D in PRE on steerpoint 3, wide, SIM, not SOI',
  'wpn-d-b-narrow': 'WPN format: AGM-65D, narrow field of view, beside steerpoint 3, not SOI',
  'wpn-d-b': 'WPN format, SOI: AGM-65D station 3, the seeker slewed by hand',
  'wpn-d-b-track': 'WPN format, SOI: station 3 tracking the chimney',
  'wpn-d-b-slaved': 'WPN format, SOI: station 3 boresighted, following the pod onto the chimney',
  'wpn-d-b7': 'WPN format, SOI: station 7 next, its seeker beside the chimney',
  'wpn-d-b7-track': 'WPN format, SOI: station 7 tracking the chimney',
  'wpn-d-b7-slaved': 'WPN format, SOI: station 7 boresighted, on the chimney',
  'wpn-d-t-wide': 'WPN format: AGM-65D in PRE on steerpoint 5, wide, armed, not SOI',
  'wpn-d-t': 'WPN format: narrow, on steerpoint 5, not SOI',
  'wpn-d-t-1': 'WPN format: handoff in progress, correlator slewing to the pod line of sight (1)',
  'wpn-d-t-2': 'WPN format: handoff in progress, correlator matching the pictures (2)',
  'wpn-d-t-T': 'WPN format: handoff, the missile commanded to track (T)',
  'wpn-d-t-C': 'WPN format: handoff complete (C), tracking the lead T-72',
  'wpn-d-t-3': 'WPN format: after the shot, station 3 next',
};

export const maverickPageLabels: Record<string, string> = {
  'sms-ag65-off': 'SMS format: AG65 selected, BORE, Mavericks powered off',
  'sms-ag65-on': 'SMS format: AG65, BORE, powered on and warming up',
  'sms-ag65': 'SMS format: AG65, BORE, warmed up and ready',
  'sms-ag65-pre': 'SMS format: AG65, PRE, ready',
  'wpn-mav-bore': 'WPN format: AGM-65H in BORE, seeker on the boresight, not SOI',
  'wpn-mav-pre-notsoi': 'WPN format: AGM-65H in PRE, seeker slaved to the steerpoint, not SOI',
  'wpn-mav-pre': 'WPN format, SOI: AGM-65H in PRE, wide field of view, the seeker slewed by hand',
  'wpn-mav-narrow': 'WPN format, SOI: PRE, narrow field of view on the lead tank',
  'wpn-mav-track': 'WPN format, SOI: PRE, tracking the lead tank',
  'wpn-mav-7': 'WPN format, SOI: after the shot, station 7 next',
};
