import type { MfdDisplay } from '../types';
import { tracer } from '../trace.ts';
import { f, poly, w } from './mfd-had.ts';
import { AZ0, FRAME, PX_DEG, fcrBox, local, pad } from './mfd-fcr.ts';
import { HSD_HEADING, JET, SPT, bearingRange } from './mfd-hsd.ts';
import { LAT0, LON0, NM_LAT, NM_LON } from './hud-ground.ts';

/**
 * F-16C Fire Control Radar (FCR) ground map (GM) format, for the shared MFD (`mfd.ts`). Laid out on the guide's GM
 * figures (p. 437 GM mode, p. 443 Fixed Target Track, p. 223 the markpoint figures), which come from the same
 * square-on camera as the air-to-air format and the HSD, so they share the 660 px grid (screen centre 329.5, 330; 4.8
 * px/mm); values below are pixels on those images.
 *
 * Read off p. 437 and p. 443: the top row GM, the range-scale switching option (AUTO or MAN), the field of view (NORM),
 * OVRD and CNTL; the range scale with its arrows, A6 (azimuth scan) and EGM (processing) down the left; BARO, FZ (OSB 7),
 * SP (the snowplow, OSB 8), CZ (cursor zero, OSB 9, only once the cursor has been slewed) and TGT (the sighting point,
 * OSB 10) down the right; the format-select row SWAP, FCR, FLCS, TEST, DCLT; cyan elevation and azimuth scales and
 * the antenna carets. The crosshairs run the whole width and height of the picture through the acquisition cursor.
 * Range arcs (white) are drawn every quarter of the scale about the ownship, and the scanned sector is the picture's
 * edges at 30° to the horizontal from the bottom of the format (x 245 and 416.5, y 548). In Fixed Target Track (p. 443):
 * the map frozen and FZ highlighted, a solid diamond at the centre of the crosshairs, the cursor's latitude and
 * longitude at the top right, the bearing (magnetic) and slant range to the target at the lower left, and the ownship
 * (an X) where it lies in relation to the map.
 *
 * One scene, the FCR markpoint procedure's: the HUD markpoint scenario's jet (level at 3,000 ft above the ground, 4
 * NM short of the southern runway's midpoint, heading 267°), the radar on the 10 NM scale. The picture is a generated
 * illustration of the air base under radar (`scripts/gm-radar-map.py`, the same numbers), not a copy of the guide's.
 * Positions are placed as the B-scope is: the jet at the bottom centre (x 330.75, y 548), 44.1 px a nautical mile.
 */
const PX = 4.8;
const { mm } = tracer(PX);
type Page = MfdDisplay['pages'][number];
type P = [number, number];

const base = ((import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/').replace(/\/+$/, '');
/** The radar picture: 489 px, one pixel of the 660 px grid each, its top left at (85, 85.5). Served as a file (every page would otherwise inline it). */
export const GM_MAP = `${base}/images/cockpit/radar/gm-map.webp`;

export const GM_SCALE = 10;
const OWN: P = [AZ0, 548], PX_NM = 441 / GM_SCALE;
const H = (HSD_HEADING * Math.PI) / 180;
const FWD: P = [Math.sin(H), Math.cos(H)], RIGHT: P = [Math.cos(H), -Math.sin(H)];
const AGL = 3000, FT_NM = 6076.12;

/** The ground point (NM east, north of the runway midpoint) a format pixel shows, and the pixel of a ground point. */
const ground = ([x, y]: P): P => {
  const fwd = (OWN[1] - y) / PX_NM, right = (x - OWN[0]) / PX_NM;
  return [JET.start[0] + fwd * FWD[0] + right * RIGHT[0], JET.start[1] + fwd * FWD[1] + right * RIGHT[1]];
};
export const gmPx = (g: P): P => {
  const dx = g[0] - JET.start[0], dy = g[1] - JET.start[1];
  return [OWN[0] + (dx * RIGHT[0] + dy * RIGHT[1]) * PX_NM, OWN[1] - (dx * FWD[0] + dy * FWD[1]) * PX_NM];
};
/** The markpoint's landmark, the southern runway's midpoint, and where the crosshairs start (as the sim leaves them is not shown by the guide: illustrative). */
export const GM_TARGET = gmPx(SPT.mark);
export const GM_START: P = [396, 248];

/** Latitude or longitude in the format's DD° MM.MMM style (minutes unpadded, as p. 443 shows 37° 2.383). */
const dm = (deg: number, pos: string, neg: string, padDeg: number) => {
  const a = Math.abs(deg), d = Math.floor(a);
  let m = +((a - d) * 60).toFixed(3), dd = d;
  if (m >= 60) { m = 0; dd += 1; }
  return `${String(dd).padStart(padDeg, ' ')}° ${m.toFixed(3)} ${deg >= 0 ? pos : neg}`;
};
const coords = (g: P) => [dm(LAT0 + g[1] / NM_LAT, 'N', 'S', 2), dm(LON0 + g[0] / NM_LON, 'E', 'W', 2)];

interface GmState {
  soi: boolean;
  /** The crosshairs (format px), or `free` while the procedure slews them. */
  cursor: P | 'free';
  /** Cursor slews accumulated (the CZ option shows). */
  cz?: boolean;
  /** Fixed Target Track: the map frozen, FZ highlighted, the diamond, coordinates, bearing and range. */
  hold?: boolean;
}

const RANGE_ARROWS = poly([[129, 192], [145, 208], [113, 208]], true) + poly([[113, 237], [145, 237], [129, 254]], true);
/** Range arcs every quarter of the scale about the ownship, in the picture's box, inside the scanned sector. */
const ARCS = (() => {
  const t = Math.tan(Math.PI / 6), inside = ([x, y]: P) => x >= 111 && x <= 551 && y >= 108.5 && y <= 528 && y <= 548 - (245 - x) * t && y <= 548 - (x - 416.5) * t;
  let d = '';
  for (const r of [PX_NM * 2.5, PX_NM * 5, PX_NM * 7.5]) {
    let pen = false;
    for (let a = -90; a <= 90; a += 0.5) {
      const p: P = [OWN[0] + r * Math.sin((a * Math.PI) / 180), OWN[1] - r * Math.cos((a * Math.PI) / 180)];
      if (inside(p)) { d += `${pen ? 'L' : 'M'}${f(mm(p[0] - 329.5))} ${f(mm(p[1] - 330))}`; pen = true; } else pen = false;
    }
  }
  return d;
})();
/** The crosshairs: the vertical line over the whole height of the picture (it follows the cursor sideways) and the horizontal over its width (up and down). */
const V_LINE = `M0 ${f(mm(108.5 - 330))}V${f(mm(548 - 330))}`;
const H_LINE = `M${f(mm(110.5 - 329.5))} 0H${f(mm(551.5 - 329.5))}`;
/** Aircraft reference symbol (the W) with the steering line toward the selected steerpoint (the AA format's, p. 394). */
const refSymbol = (rel: number) => {
  const sx = 133.5 + Math.max(-21, Math.min(21, rel));
  return poly([[112, 515], [122, 515], [128, 527], [133.5, 515], [139, 527], [144.5, 515], [155, 515]]) + poly([[sx, 503], [sx, 539]]);
};

function gm(id: string, s: GmState): Page {
  const at = s.cursor === 'free' ? null : s.cursor;
  const words: Page['words'] = [
    w('GM', 185.5, 117.5), w('MAN', 258.5, 117.5), w('NORM', 332, 117.5), w('OVRD', 405, 117.5), w('CNTL', 477, 117.5),
    w(String(GM_SCALE), 128.5, 223),
    w('A', 117.5, 321), w('6', 117.5, 341), w('E', 117.5, 389), w('G', 117.5, 408.5), w('M', 117.5, 428),
    ...['B', 'A', 'R', 'O'].map((ch, i) => w(ch, 551.5, 160 + i * 17.5, 'end')),
    w('FZ', 551.5, 258, 'end', s.hold), w('SP', 551.5, 328, 'end'),
    ...(s.cz ? ['C', 'Z'].map((ch, i) => w(ch, 551.5, 387 + i * 17, 'end')) : []),
    ...['T', 'G', 'T'].map((ch, i) => w(ch, 551.5, 437 + i * 18, 'end')),
    w('SWAP', 186, 538.5), w('FCR', 259, 538.5, undefined, true), w('FLCS', 332, 538.5), w('TEST', 405, 538.5), w('DCLT', 477.5, 538.5),
  ];
  const marks = RANGE_ARROWS;
  let fills = '';
  const fine = ARCS;
  const cyan: string[] = [];
  // Elevation scale (cyan): ticks every 10°, the caret at the antenna's depression, which follows the cursor's range down to the ground (flat earth, 3,000 ft up).
  const rangeNm = at ? Math.hypot((OWN[1] - at[1]) / PX_NM, (at[0] - OWN[0]) / PX_NM) : 4;
  const el = -Math.min(60, (Math.atan2(AGL / FT_NM, Math.max(rangeNm, 0.5)) * 180) / Math.PI);
  for (const k of [-3, -2, -1, 1, 2, 3]) cyan.push(poly([[149, 327.5 - k * 36.5], [163, 327.5 - k * 36.5]]));
  const ey = 327.5 - el * 3.65;
  cyan.push(poly([[149, 327.5], [167, 327.5]]), poly([[136, ey], [147, ey]]) + poly([[147.5, ey - 5.5], [147.5, ey + 5.5]]));
  // Azimuth scale (cyan here, p. 437): ticks every 10°, the antenna caret under the cursor's azimuth.
  for (const k of [-3, -2, -1, 1, 2, 3]) cyan.push(poly([[AZ0 + k * 36.75, 507], [AZ0 + k * 36.75, 522]]));
  cyan.push(poly([[AZ0, 502], [AZ0, 522]]));
  const az = at ? (Math.atan2(at[0] - OWN[0], OWN[1] - at[1]) * 180) / Math.PI : 0, ax = AZ0 + az * PX_DEG;
  cyan.push(poly([[ax - 5, 527], [ax + 5, 527]]) + poly([[ax, 527], [ax, 540]]));
  // The selected steerpoint (3) is 4.5° left of the nose: the steering line leans that way on the aircraft reference symbol.
  const rel = ((bearingRange(JET.start, SPT[3]).brg - HSD_HEADING + 540) % 360) - 180;
  cyan.push(refSymbol(rel));

  const page: Page = { id, words, marks, fine: (s.soi ? FRAME : '') + fine, fills, video: GM_MAP, videoScale: 1, paths: [{ d: cyan.join(''), c: 'cyan' }] };
  if (!s.soi) words.push(w('NOT SOI', 331, 160));
  if (s.cursor !== 'free' || at) {
    // Crosshairs through the acquisition cursor: the lines span the picture, so they follow the cursor on one axis each.
    page.cursor = { d: '', at: at ? [f(mm(at[0] - 329.5)), f(mm(at[1] - 330))] : [0, 0] };
  } else page.cursor = { d: '', at: [0, 0] };
  page.cursorX = { d: V_LINE, c: 'white' };
  page.cursorY = { d: H_LINE, c: 'white' };
  if (at && !s.hold) {
    // The cursor's bearing (° magnetic) and range from the selected steerpoint.
    const b = bearingRange(SPT[3], ground(at));
    words.push(w(`${pad(Math.round(b.brg) % 360, 3)} ${pad(Math.round(b.nm), 2)}`, 112.5, 480, 'start'));
  }
  if (s.hold && at) {
    const g = ground(at), b = bearingRange(JET.start, g);
    const slant = Math.hypot(b.nm, AGL / FT_NM);
    // The held point is the HUD mark's: the MARK page's coordinates (N 35°43.938', E 037°06.246'), written as the format's style.
    const [lat, lon] = at === GM_TARGET ? ['35° 43.938 N', '37° 6.246 E'] : coords(g);
    words.push(w(lat, 526, 152, 'end'), w(lon, 526, 170, 'end'), w(`${pad(Math.round(b.brg), 3)}°`, 160, 492, 'start'), w(`${slant.toFixed(1)} NM`, 160, 510, 'start'));
    // The solid diamond at the centre of the crosshairs, and the ownship's X where it lies on the map (inside the format here, just above the format-select row).
    const [x, y] = at;
    fills += poly([[x, y - 6], [x + 6, y], [x, y + 6], [x - 6, y]], true);
    page.fills = fills;
    page.paths!.push({ d: poly([[OWN[0] - 6, 521], [OWN[0] + 6, 533]]) + poly([[OWN[0] + 6, 521], [OWN[0] - 6, 533]]), c: 'white' });
  }
  return page;
}

export const GM_STATES = {
  'gm-not-soi': { soi: false, cursor: GM_START },
  'gm': { soi: true, cursor: GM_START },
  'gm-free': { soi: true, cursor: 'free', cz: true },
  'gm-on': { soi: true, cursor: GM_TARGET, cz: true },
  'gm-ftt': { soi: true, cursor: GM_TARGET, cz: true, hold: true },
} satisfies Record<string, GmState>;
export const gmPages: Page[] = Object.entries(GM_STATES).map(([id, s]) => gm(id, s as GmState));
export const gmPageLabels: Record<keyof typeof GM_STATES, string> = {
  'gm-not-soi': 'FCR ground map (GM, 10 NM), not SOI',
  'gm': 'FCR ground map: SOI, crosshairs not slewed',
  'gm-free': 'FCR ground map: crosshairs being slewed (CZ shown)',
  'gm-on': 'FCR ground map: crosshairs on the runway midpoint',
  'gm-ftt': 'FCR ground map: Fixed Target Track on the runway midpoint (FZ, diamond)',
};
/** The crosshairs' slew from where they start onto the runway midpoint. */
export const GM_SLEW = {
  start: local(GM_START), target: local(GM_TARGET), reach: f(mm(9)), speed: f(mm(140)),
  box: [...local([125, 125]), ...local([537, 520])] as [number, number, number, number],
};
/** A hint box round a point on the map (format px). */
export const gmBox = fcrBox;
/** A hint box round a ground point of the scene (NM east, north of the runway midpoint). */
export const gmSpot = (g: P, r = 14) => { const [x, y] = gmPx(g); return fcrBox(x - r, y - r, x + r, y + r); };
