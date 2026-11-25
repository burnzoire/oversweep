import type { MfdDisplay } from '../types';
import { clipCircle, clipSeg, f, poly, w } from './mfd-had.ts';

/**
 * F-16C Horizontal Situation Display (HSD) base page, for the shared MFD (`mfd.ts`). Traced from the guide's
 * "HSD Navigation Information" figure (p. 230, 660 x 660 px, `pdfimages -j -f 230 -l 230`, image 037) and checked
 * against the HSD MFD format figure (p. 358, image 002). Both come from the same square-on camera as the p. 122 MFD
 * image and the HAD figures, so they share the HAD's pixel grid (screen centre 329.5, 330; 4.8 px/mm); values below are
 * pixels on those images.
 *
 * Measured on p. 230 (DEP, 60 NM): the ownship symbol at 332.5, 421 with the HAD's (bar 23 px, stalk 27, tail bar 9);
 * range rings magenta at a third and two thirds of the scale (92.2, 184.4 px) and the full scale (276.6); the inner
 * ring's cardinal marks: north a filled arrow pointing out (15 x 8 px), south a 13 px tick across the ring, east and
 * west 6 px ticks inward (p. 359 item 6). Steerpoints are 6 px circles, the selected one solid, joined by the route
 * line, which stops at each circle. The aircraft reference symbol (p. 358 item 12) at the lower left: arms 112.4-154.4
 * at y 515.6, a W between them and the steering line through x 134.4, y 503-540.
 *
 * One scene, the markpoint procedure's (an illustration, not traced): heading 267° along Abu al-Duhur's runway, the
 * route from steerpoint 2 (behind) to 3 and on to 4, 5 NM south of the airfield. Positions are in NM east and north
 * of the runway midpoint. The page is heading up: a point's bearing from the jet, less the heading, is its angle from
 * straight up. The radar is silent, so no FCR search volume or ghost cursor is drawn (p. 358 items 8-10).
 */
type Page = MfdDisplay['pages'][number];
type P = [number, number];

const OWN: P = [332.5, 421];
const RINGS = [92.2, 184.4, 276.6];
/** Drawing area, as the HAD's: inside the frame and above the format-select row. */
const BOX = { x0: 113, x1: 551, y0: 110, y1: 528 };
const inBox = ([x, y]: P) => x >= BOX.x0 && x <= BOX.x1 && y >= BOX.y0 && y <= BOX.y1;

/** The scenario's heading (magnetic, and the map is drawn in the same frame). */
export const HSD_HEADING = 267;
const DIR: P = [Math.sin((HSD_HEADING * Math.PI) / 180), Math.cos((HSD_HEADING * Math.PI) / 180)];
/** The jet: 4 NM short of the runway midpoint, over it, and 8 NM on past it. */
export const JET = { start: [-4 * DIR[0], -4 * DIR[1]] as P, over: [0, 0] as P, on: [8 * DIR[0], 8 * DIR[1]] as P };
/** Route steerpoints 2, 3 and 4 and markpoint 26 (stored over the runway midpoint). */
export const SPT = { 2: [14, -6] as P, 3: [-29.7, -4.2] as P, 4: [-46, 9] as P, mark: [0, 0] as P };
/** Local map coordinates for the manual-entry exercise, centred on the briefed checkpoint. */
export const MANUAL_CHECKPOINT: P = [0, 0];
const MANUAL_JET: P = [-10, 3];

/** Bearing (°, magnetic) and range (NM) from the jet to a point. */
export const bearingRange = (from: P, to: P) => {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  return { brg: ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360, nm: Math.hypot(dx, dy) };
};

interface HsdState {
  jet: P;
  /** Selected steerpoint: 3 or the markpoint (26). */
  sel: 3 | 26;
  /** Markpoint 26's position when stored (the cyan X shown). */
  mark: P | false;
  /** Range scale (DEP): 30 or 60 NM. */
  scale: 30 | 60;
}

/** Where a map point is drawn: heading up about the ownship, at the range scale's px per NM. */
const at = (s: HsdState, p: P): P => {
  const k = RINGS[2] / s.scale, dx = p[0] - s.jet[0], dy = p[1] - s.jet[1];
  const a = (HSD_HEADING * Math.PI) / 180;
  // Rotate the east/north offset so the heading points up the screen (screen y down).
  const rx = dx * Math.cos(a) - dy * Math.sin(a), ry = dx * Math.sin(a) + dy * Math.cos(a);
  return [OWN[0] + rx * k, OWN[1] - ry * k];
};
/** A point at a screen bearing (° clockwise from up) and radius about a centre. */
const polar = (cx: P, deg: number, r: number): P => [cx[0] + r * Math.sin((deg * Math.PI) / 180), cx[1] - r * Math.cos((deg * Math.PI) / 180)];

/** Fixed labels (p. 230): top row, range scale with its arrows, the right column, and the format-select row (HSD current). */
function labels(scale: number) {
  return [
    w('DEP', 186, 117.5), w('DCPL', 259.5, 117.5), w('NORM', 332.5, 117.5), w('MSG', 405, 117.5), w('CNTL', 477.5, 117.5),
    w(String(scale), 128.5, 223),
    w('XMT', 551.5, 178, 'end'), w('TNDL', 551.5, 195, 'end'), w('FZ', 551.5, 258, 'end'), w('FR', 551.5, 392, 'end'), w('ON', 551.5, 408.5, 'end'),
    w('SWAP', 186, 538.5), w('SMS', 259, 538.5), w('HSD', 332, 538.5, undefined, true), w('TGP', 405, 538.5), w('DCLT', 477.5, 538.5),
  ];
}
const RANGE_ARROWS = poly([[129, 192], [145, 208], [113, 208]], true) + poly([[113, 237], [145, 237], [129, 254]], true);

/** The inner ring's cardinal marks (p. 359 item 6), turned with the heading. */
function cardinals() {
  const r = RINGS[0], n = -HSD_HEADING;
  const tick = (deg: number, r0: number, r1: number) => poly([polar(OWN, deg, r0), polar(OWN, deg, r1)]);
  const marks = tick(n + 180, r - 6.5, r + 6.5) + tick(n + 90, r - 6, r) + tick(n - 90, r - 6, r);
  // North: a filled arrow from the ring outward, 15 px long, 8 px across its base.
  const base = polar(OWN, n, r), tip = polar(OWN, n, r + 15), side = (s: number): P => polar(base, n + 90 * s, 4);
  return { marks, fill: poly([side(1), tip, side(-1)], true) };
}

/** Route line between steerpoint circles (stopping at each 6 px circle), clipped to the drawing area. */
function routeLine(pts: P[]) {
  let d = '';
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    if (len <= 12) continue;
    const ux = dx / len, uy = dy / len, s = clipSeg([a[0] + ux * 6, a[1] + uy * 6], [b[0] - ux * 6, b[1] - uy * 6]);
    if (s) d += poly(s);
  }
  return d;
}

/**
 * Aircraft reference symbol (p. 358 item 12): the W watermark and its steering line, offset toward the selected
 * steerpoint. The guide gives no scale for the offset: here 1 px per 2° of relative bearing, pegged at 20 px.
 */
function reference(rel: number) {
  const off = Math.max(-20, Math.min(20, rel / 2)), y = 515.6;
  const wm = poly([[112.4, y], [123, y], [129.6, 528], [134.4, 519], [139.2, 528], [146, y], [154.4, y]]);
  const x = 134.4 + off;
  return wm + poly([[x, 503], [x, 540]]);
}

function hsd(id: string, s: HsdState): Page {
  const words = labels(s.scale);
  let marks = RANGE_ARROWS, fills = '';
  const paths: NonNullable<Page['paths']> = [];
  const card = cardinals();
  paths.push({ d: RINGS.map(r => clipCircle(OWN, r)).join('') + card.marks, c: 'magenta' }, { d: card.fill, c: 'magenta', fill: true });
  // Route 2 → 3 → 4, white; the selected steerpoint solid.
  const route = [SPT[2], SPT[3], SPT[4]].map(p => at(s, p));
  marks += routeLine(route);
  ([2, 3, 4] as const).forEach((n, i) => {
    const p = route[i];
    if (!inBox(p)) return;
    if (n === s.sel) fills += poly(Array.from({ length: 24 }, (_, j) => polar(p, j * 15, 6)), true);
    else marks += clipCircle(p, 6);
  });
  // Markpoint 26: a small cyan X (p. 205), sized as the X on the p. 358 figure (8 x 9 px).
  if (s.mark) {
    const [x, y] = at(s, s.mark);
    if (inBox([x, y])) paths.push({ d: poly([[x - 4, y - 4.5], [x + 4, y + 4.5]]) + poly([[x + 4, y - 4.5], [x - 4, y + 4.5]]), c: 'cyan' });
  }
  // Ownship (cyan).
  const [ox, oy] = OWN;
  paths.push({ d: poly([[ox, oy - 5], [ox, oy + 22]]) + poly([[ox - 12, oy], [ox + 11, oy]]) + poly([[ox - 4.5, oy + 18], [ox + 4.5, oy + 18]]), c: 'cyan' });
  const target = s.sel === 26 && s.mark ? s.mark : SPT[3];
  const rel = ((bearingRange(s.jet, target).brg - HSD_HEADING + 540) % 360) - 180;
  paths.push({ d: reference(rel), c: 'cyan' });
  return { id, words, marks, fills, paths };
}

/** A hint ring round a map point on these pages (a `#x0 y0 x1 y1` box in mm about the screen centre). */
const PX = 4.8;
const mmv = (v: number) => f(v / PX);
export const hsdSpot = (s: HsdState, p: P, r = 12) => {
  const [x, y] = at(s, p);
  return `#${[x - r - 329.5, y - r - 330, x + r - 329.5, y + r - 330].map(mmv).join(' ')}`;
};
/** A hint box in p. 230 pixels. */
export const hsdBox = (x0: number, y0: number, x1: number, y1: number) => `#${[x0 - 329.5, y0 - 330, x1 - 329.5, y1 - 330].map(mmv).join(' ')}`;

/** The states the markpoint procedure passes through. */
export const HSD_STATES = {
  'hsd-manual-start': { jet: MANUAL_JET, sel: 3, mark: false, scale: 60 },
  'hsd-manual-saved': { jet: MANUAL_JET, sel: 3, mark: MANUAL_CHECKPOINT, scale: 60 },
  'hsd-manual-selected': { jet: MANUAL_JET, sel: 26, mark: MANUAL_CHECKPOINT, scale: 60 },
  'hsd-start': { jet: JET.start, sel: 3, mark: false, scale: 60 },
  'hsd-over': { jet: JET.over, sel: 3, mark: false, scale: 60 },
  'hsd-marked': { jet: JET.over, sel: 3, mark: SPT.mark, scale: 60 },
  'hsd-on': { jet: JET.on, sel: 3, mark: SPT.mark, scale: 60 },
  'hsd-mark-sel': { jet: JET.on, sel: 26, mark: SPT.mark, scale: 60 },
  'hsd-mark-30': { jet: JET.on, sel: 26, mark: SPT.mark, scale: 30 },
} satisfies Record<string, HsdState>;
export const hsdPages: Page[] = Object.entries(HSD_STATES).map(([id, s]) => hsd(id, s as HsdState));
export const hsdPageLabels: Record<keyof typeof HSD_STATES, string> = {
  'hsd-manual-start': 'HSD (60 NM, depressed): steerpoint 3 selected, no markpoint stored',
  'hsd-manual-saved': 'HSD: manual markpoint 26 stored, steerpoint 3 selected',
  'hsd-manual-selected': 'HSD: manual markpoint 26 selected',
  'hsd-start': 'HSD (60 NM, depressed): steerpoint 3 selected, the jet north of the route',
  'hsd-over': 'HSD: over the runway midpoint',
  'hsd-marked': 'HSD: markpoint 26 stored under the ownship (cyan X)',
  'hsd-on': 'HSD: 8 NM on, markpoint 26 behind',
  'hsd-mark-sel': 'HSD: markpoint 26 selected, steerpoint 3 hollow',
  'hsd-mark-30': 'HSD (30 NM, depressed): markpoint 26 selected',
};
