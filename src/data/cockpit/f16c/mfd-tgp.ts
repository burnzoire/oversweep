import type { MfdDisplay } from '../types';
import { tracer } from '../trace.ts';
import { FRAME, hadBottom } from './mfd-had.ts';
import { TGP_VIDEO_SA11, TGP_VIDEO_SA6, TGP_VIDEO_STPT } from './tgp-video.ts';
import { IR, underIn, TGP_IR_B, TGP_IR_T } from './maverick-video.ts';

/**
 * F-16C Targeting Pod (TGP) MFD format, A-G mode, for the shared MFD (`mfd.ts`). Traced from the guide's p. 495
 * image (660 x 660 px, same square-on camera as the p. 122 MFD and the HAD images: screen centre 329.5, 330;
 * 4.8 px/mm). It shows the pod in Slave mode (large line-of-sight crosshairs, no track mode word: p. 497 items 16,
 * 29), which is what it does when another sensor owns the system point of interest (SPI), so it is drawn that way.
 *
 * The sensor video is a generated still per SPI (`tgp-video.ts`), not traced from the guide. The coordinate block, HQ, radar altitude, meterstick, range
 * and time to go are drawn smaller than the format's words, as p. 495 shows them (about three quarters size).
 * Values per state are the scenario's: the SPI's position (the selected steerpoint, then the HTS-designated SA-6
 * or SA-11), slant range E (estimated) and a meterstick scaled from p. 495's (62 m at 2.4 NM) by range. The
 * coordinate confidence word (HQ) is shown only for the steerpoint; for an HTS SPI it is left blank (assumed:
 * p. 496 blanks it for poor quality). TOT (laser-guided bombs only, p. 498 item 24) is left out.
 */
const PX = 4.8;
const { mm } = tracer(PX);
const SC: [number, number] = [329.5, 330];
type Page = MfdDisplay['pages'][number];
type Word = Page['words'][number];
const w = (t: string, x: number, y: number, a?: Word['a'], inv?: boolean, s?: number): Word =>
  ({ t, at: [mm(x - SC[0]), mm(y - SC[1])], ...(a ? { a } : {}), ...(inv ? { inv } : {}), ...(s ? { s } : {}) });
const SMALL = 0.75;
const sm = (t: string, x: number, y: number, a: Word['a']) => w(t, x, y, a, false, SMALL);
type P = [number, number];
const q = ([x, y]: P) => `${+mm(x - SC[0]).toFixed(3)} ${+mm(y - SC[1]).toFixed(3)}`;
const poly = (pts: P[], close = false) => `M${pts.map(q).join('L')}${close ? 'Z' : ''}`;

/** Letters stacked beside an OSB (p. 495: LST, MT on the left; NT, SP, CZ, TGT on the right), 17 px apart. */
const stack = (t: string, x: number, y: number) => [...t].map((ch, k) => w(ch, x, y + (k - (t.length - 1) / 2) * 17));
/** Line-of-sight crosshairs (large: Slave), centre 332.5, 327.5, arms out to 98 px with a 10 px gap. */
const X: P = [332.5, 327.5];
const CROSS = poly([[X[0] - 98, X[1]], [X[0] - 10, X[1]]]) + poly([[X[0] + 10, X[1]], [X[0] + 98, X[1]]]) +
  poly([[X[0], X[1] - 98], [X[0], X[1] - 10]]) + poly([[X[0], X[1] + 10], [X[0], X[1] + 98]]);
/** Small crosshairs: the pod in a track mode (p. 497 item 16). The guide gives no image of them here; their size is assumed. */
const CROSS_SMALL = poly([[X[0] - 34, X[1]], [X[0] - 6, X[1]]]) + poly([[X[0] + 6, X[1]], [X[0] + 34, X[1]]]) +
  poly([[X[0], X[1] - 34], [X[0], X[1] - 6]]) + poly([[X[0], X[1] + 6], [X[0], X[1] + 34]]);
/** Point track box about the tracked target (p. 498 image, item 27), scaled from that image to about 76 px square. */
const TRACK_BOX = poly([[X[0] - 38, X[1] - 38], [X[0] + 38, X[1] - 38], [X[0] + 38, X[1] + 38], [X[0] - 38, X[1] + 38]], true);
/** Field-of-view brackets (WIDE): corners at x 276/388.5, y 272.5/383.5, arms 22 px. */
const BRACKETS = ([[276, 272.5, 1, 1], [388.5, 272.5, -1, 1], [276, 383.5, 1, -1], [388.5, 383.5, -1, -1]] as const)
  .map(([x, y, sx, sy]) => poly([[x + sx * 22, y], [x, y], [x, y + sy * 22]])).join('');
/** North-pointing cue (p. 495 item 9): a line with the arrowhead on the north end, a bow-tie across it. */
const NORTH = poly([[409, 172.5], [472.5, 172.5]]) + poly([[434, 163], [449, 182], [449, 163], [434, 182]], true);
const NORTH_FILL = poly([[407.5, 172.5], [417, 167.5], [417, 177.5]], true);
/** Aircraft reference symbol, cyan (as on p. 495; the same symbol as the DTE page's, p. 127 item 16). */
const ARS = poly([[114.5, 503], [114.5, 539]]) + poly([[112, 515], [122, 515], [128, 527], [133.5, 515], [139, 527], [144.5, 515], [155, 515]]);

interface Spi { lat: string; lon: string; elv: string; hq: boolean; range: string; meter: string; ttg: string; video?: string }
const SPI: Record<string, Spi> = {
  stpt: { lat: '036:25.012', lon: '037:14.986', elv: '+1320', hq: true, range: 'E17.4', meter: '450', ttg: '002:08', video: TGP_VIDEO_STPT },
  sa6: { lat: '036:26.214', lon: '037:07.692', elv: '+1442', hq: false, range: 'E20.1', meter: '519', ttg: '002:28', video: TGP_VIDEO_SA6 },
  sa6Near: { lat: '036:32.200', lon: '037:00.740', elv: '+1442', hq: false, range: 'E17.4', meter: '450', ttg: '002:08', video: TGP_VIDEO_SA6 },
  sa11: { lat: '036:58.031', lon: '037:21.874', elv: '+1680', hq: false, range: 'E50.1', meter: '1294', ttg: '006:08', video: TGP_VIDEO_SA11 },
  sa11Near: { lat: '036:58.031', lon: '037:21.874', elv: '+1680', hq: false, range: 'E44.1', meter: '1139', ttg: '005:24', video: TGP_VIDEO_SA11 },
  sa11Track: { lat: '036:58.044', lon: '037:21.851', elv: '+1674', hq: false, range: 'T44.0', meter: '1137', ttg: '005:24', video: TGP_VIDEO_SA11 },
};
/**
 * With the AGM-65 selected (guide p. 679 image): NARO, the stations along the bottom with the Missile Boresight
 * Correlator's letter over the next one (as on the WPN format), and a picture larger than the glass that the pod
 * slews (`at`, page mm, the picture's offset under the crosshairs). Placed from the p. 679 image by its SWAP and TGP
 * labels (1.56 grid px per image px).
 */
interface Mav { mbc: string; next: '3' | '7'; at: [number, number]; k: number }
function tgp(id: string, spi: Spi, soi: boolean, track = false, mav?: Mav): Page {
  const words: Word[] = [
    w('A-G', 186, 117.5), w('PTR', 258, 117.5), w(mav ? 'NARO' : 'WIDE', 332, 117.5), w('OVRD', 405, 117.5), w('CNTL', 478, 117.5),
    sm(spi.lat, 180, 140, 'start'), sm(spi.lon, 180, 153.5, 'start'), sm(spi.elv, 272.5, 170, 'end'),
    ...(spi.hq ? [sm('HQ', 190, 181, 'start')] : []),
    w('1.0X', 332.5, 144), sm('18600', 531, 144, 'end'), w('WHOT', 551.5, 186, 'end'),
    ...stack('LST', 117, 185), ...stack('MT', 117, 330.5), ...stack('NT', 547, 259.5), ...stack('SP', 547, 330.5), ...stack('CZ', 547, 402.5), ...stack('TGT', 547, 472),
    sm(spi.meter, 441.5, 313.5, 'start'), sm(spi.range, 167.5, 511, 'start'), sm(spi.ttg, 520, 492.5, 'end'),
    // In a track mode: tracking sensor and mode (p. 499 items 28-29) under the crosshairs, placed from the p. 498 image; blank in Slave.
    ...(track ? [sm('IR POINT', 344, 482, 'middle')] : []),
    ...(mav ? [w(mav.next === '3' ? mav.mbc : '', 174.5, 435.5), w('3', 174.5, 454.5), w(mav.next === '7' ? mav.mbc : '', 492, 432), w('7', 492, 451)].filter(x => x.t) : []),
    ...hadBottom('TGP'),
  ];
  return {
    id, words, marks: (track ? CROSS_SMALL + TRACK_BOX : CROSS) + (mav ? '' : BRACKETS) + NORTH, fills: NORTH_FILL, fine: soi ? FRAME : '',
    paths: [{ d: ARS, c: 'cyan' }, ...(mav ? [{ d: STATION_BOX[mav.next], c: 'white' as const, pen: 'fine' as const }] : [])],
    ...(spi.video ? { video: spi.video } : {}),
    ...(mav ? { pan: true, videoScale: mav.k, cursor: { d: '', at: mav.at } } : {}),
  };
}
/** The next station's box (the p. 679 image highlights it). */
const STATION_BOX = { '3': poly([[167.5, 446], [181.5, 446], [181.5, 463], [167.5, 463]], true), '7': poly([[485, 442.5], [499, 442.5], [499, 459.5], [485, 459.5]], true) };
/** The page offset that puts point `p` of a picture under the pod's crosshairs. */
const at = (pic: { k: number }, p: readonly [number, number]): [number, number] => { const [x, y] = underIn(pic, X, p); return [mm(x), mm(y)]; };
/** The pod slewed by hand onto the chimney (boresighting) and onto the lead T-72 (the handoff): about 3 s at full deflection. */
const podSlew = (pic: { k: number; spi: readonly [number, number]; aim: readonly [number, number] }) => {
  const start = at(pic, pic.spi), target = at(pic, pic.aim);
  return { start, target, reach: mm(7), speed: Math.max(mm(110), Math.hypot(target[0] - start[0], target[1] - start[1]) / 3), box: [mm(-1500), mm(-1500), mm(1500), mm(1500)] as [number, number, number, number] };
};
export const TGP_SLEW_B = { ...podSlew(IR.bTgp), what: 'chimney' };
export const TGP_SLEW_T = { ...podSlew(IR.tTgp), what: 'tank' };
/** The AGM-65D scenario's steerpoints 3 (10 NM, the brickworks) and 5 (5 NM, the T-72s); meterstick for NARO (assumed a quarter of WIDE's). */
const STPT3: Spi = { lat: '036:21.840', lon: '037:04.215', elv: '+1210', hq: true, range: 'E10.0', meter: '65', ttg: '001:15', video: TGP_IR_B };
const STPT5: Spi = { lat: '036:33.106', lon: '037:09.874', elv: '+1355', hq: true, range: 'E5.0', meter: '32', ttg: '000:31', video: TGP_IR_T };
const PB = { at: at(IR.bTgp, IR.bTgp.spi), k: IR.bTgp.k }, PB1 = { at: at(IR.bTgp, IR.bTgp.aim), k: IR.bTgp.k };
const PT = { at: at(IR.tTgp, IR.tTgp.spi), k: IR.tTgp.k }, PT1 = { at: at(IR.tTgp, IR.tTgp.aim), k: IR.tTgp.k };
const tgpD: Page[] = [
  tgp('tgp-b', STPT3, false, false, { mbc: 'S', next: '3', ...PB }), tgp('tgp-b-soi', STPT3, true, false, { mbc: 'S', next: '3', ...PB }),
  tgp('tgp-b-on', STPT3, false, false, { mbc: 'S', next: '3', ...PB1 }), tgp('tgp-b-on7', STPT3, false, false, { mbc: 'S', next: '7', ...PB1 }),
  // Cursor Zero: the slew is removed and the pod is back on steerpoint 3.
  tgp('tgp-b-cz', STPT3, false, false, { mbc: 'S', next: '7', ...PB }),
  // The shot starts from station 7, next after boresighting.
  tgp('tgp-t', STPT5, false, false, { mbc: 'S', next: '7', ...PT }), tgp('tgp-t-soi', STPT5, true, false, { mbc: 'S', next: '7', ...PT }),
  ...['1', '2', 'T', 'C'].map(l => tgp(`tgp-t-${l}`, STPT5, true, false, { mbc: l, next: '7', ...PT1 })),
  tgp('tgp-t-3', STPT5, true, false, { mbc: 'S', next: '3', ...PT1 }),
];
export const tgpPages: Page[] = [
  tgp('tgp', SPI.stpt, false), tgp('tgp-soi', SPI.stpt, true),
  tgp('tgp-sa6', SPI.sa6, false), tgp('tgp-sa6-near', SPI.sa6Near, false), tgp('tgp-sa11', SPI.sa11, false), tgp('tgp-sa11-near', SPI.sa11Near, false), tgp('tgp-sa11-soi', SPI.sa11Near, true), tgp('tgp-sa11-track', SPI.sa11Track, true, true), ...tgpD,
];
export const tgpPageLabels: Record<string, string> = {
  tgp: 'TGP format: Slave, on the selected steerpoint',
  'tgp-soi': 'TGP format, SOI: Slave, on the selected steerpoint',
  'tgp-sa6': 'TGP format: slaved to the HTS-designated SA-6',
  'tgp-sa6-near': 'TGP format: slaved to the SA-6, after the turn',
  'tgp-sa11': 'TGP format: slaved to the HTS-designated SA-11',
  'tgp-sa11-near': 'TGP format: slaved to the SA-11, after the turn',
  'tgp-sa11-soi': 'TGP format, SOI: slaved to the SA-11',
  'tgp-sa11-track': 'TGP format, SOI: Point track on the SA-11 site, the pod owns the SPI',
  'tgp-b': 'TGP format, AGM-65D selected: NARO, on steerpoint 3',
  'tgp-b-soi': 'TGP format, SOI: NARO, slewed by hand toward the chimney',
  'tgp-b-on': 'TGP format: on the brickworks chimney, station 3 next',
  'tgp-b-on7': 'TGP format: on the chimney, station 7 next',
  'tgp-b-cz': 'TGP format: slews zeroed (CZ), back on steerpoint 3',
  'tgp-t': 'TGP format, AGM-65D selected: on steerpoint 5',
  'tgp-t-soi': 'TGP format, SOI: slewed by hand toward the lead T-72',
  'tgp-t-1': 'TGP format, SOI: on the T-72, correlator slewing (1)',
  'tgp-t-2': 'TGP format, SOI: on the T-72, correlator matching the pictures (2)',
  'tgp-t-T': 'TGP format, SOI: on the T-72, missile commanded to track (T)',
  'tgp-t-C': 'TGP format, SOI: handoff complete (C)',
  'tgp-t-3': 'TGP format, SOI: after the shot, station 3 next',
};
