import type { MfdDisplay } from '../types';
import { tracer } from '../trace.ts';
import { MAV_TV_BORE, MAV_TV_LEAD, MAV_TV_TANK3, MAV_TV_NARROW, MAV_TV_SPI, MAV_TV_WIDE, MAV_VIDEO_K } from './maverick-video.ts';

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
function sms(id: string, mode: MavMode, power: 'off' | 'on' | 'ready'): Page {
  return {
    id, words: [
      ...top('A-G', mode, '', 'INV', 'CNTL'),
      w('2AG65H', 551.5, RIGHT_Y[0], 'end'),
      ...(power === 'ready' ? [w('RDY', 385, 185)] : []),
      w('PWR', 551.5, 249, 'end'), w(power === 'off' ? 'OFF' : 'ON', 551.5, 265, 'end'),
      w('RP', 551.5, 320, 'end'), w('1', 551.5, 336, 'end'),
      w('STEP', 111.5, LEFT_Y[1], 'start'),
      w('3', 118, 470), w('7', 546, 470),
      ...(power === 'ready' ? [w('RDY', 332.5, 505)] : []),
      ...row('SMS'),
    ],
    // The next station to fire is outlined (as on the HARM SMS page, p. 659).
    paths: [{ d: poly([[111, 461.5], [125, 461.5], [125, 478.5], [111, 478.5]], true), c: 'white', pen: 'fine' }],
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
}
function wpn(s: Wpn): Page {
  const words: Word[] = [
    ...top('OPER', s.mode, 'FOV'),
    w('BSGT', 111.5, LEFT_Y[0], 'start'),
    w(`${s.count}AG65H`, 551.5, RIGHT_Y[0], 'end'), w('HOC', 551.5, RIGHT_Y[1], 'end'),
    // Station: the Missile Boresight Correlator's status (S: slave) over the next station to fire (p. 673).
    ...(s.station === '3' ? [w('S', 132, 455.5), w('3', 132, 472)] : [w('S', 505, 455.5), w('7', 505, 472)]),
    ...(s.ready ? [w('RDY', 330, 504)] : []),
    ...(s.tti ? [w(s.tti, 494, 504, 'end')] : []),
    ...(s.range ? [w(`${s.range}>`, 536, larY(s.range), 'end')] : []),
    ...(s.soi ? [] : [w('NOT SOI', 330, 218)]),
    ...row('WPN'),
  ];
  const sx = s.station === '3' ? 132 : 505;
  return {
    id: s.id, words, video: s.video, ...(s.pan ? { pan: true, videoScale: MAV_VIDEO_K, cursor: { d: '', at: MAV_SLEW.start } } : { videoScale: MAV_VIDEO_K }),
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
