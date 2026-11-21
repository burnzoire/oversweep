import type { MfdColour, MfdDisplay } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C HARM Attack Display (HAD) and its Threat (THRT) page, for the shared
 * MFD (`mfd.ts`). Traced from the guide's HTS chapter: p. 539 (the HAD with a
 * designated SEAD target, 30 NM depressed) and p. 534 (THRT page). Both are
 * 660 x 660 px images from the same square-on camera as the p. 122 MFD image,
 * so they share its pixel grid (screen centre 329.5, 330; 4.8 px/mm). Values
 * below are pixels on those images.
 *
 * The HAD is built as one tactical picture (the p. 539 scene) drawn in several
 * states, so a procedure can step through it:
 * - `had-not-soi`: no frame, NOT SOI in the middle (as p. 530 shows it);
 * - `had`: SOI (the frame round the format, p. 539), the HAD cursor in the centre;
 * - `had-up` / `had-left`: the cursor slewed part of the way to the SA-6;
 * - `had-hover`: the cursor on the SA-6, its expanded data along the top;
 * - `had-designated`: the SA-6 designated as the SEAD target (boxed), as p. 539;
 * - `had-exp1` / `had-exp2`: the Expand fields of view, 2:1 and 4:1 about the
 *   cursor, range rings, DEP and the range scale removed (pp. 530 item 2, 537).
 */
const PX = 4.8;
const { mm } = tracer(PX);
const SC: [number, number] = [329.5, 330];

type Word = MfdDisplay['pages'][number]['words'][number];
type Page = MfdDisplay['pages'][number];
const w = (t: string, x: number, y: number, a?: Word['a'], inv?: boolean): Word =>
  ({ t, at: [mm(x - SC[0]), mm(y - SC[1])], ...(a ? { a } : {}), ...(inv ? { inv } : {}) });
/** A word in a colour. */
const c = (word: Word, colour: MfdColour): Word => ({ ...word, c: colour });
const L = (t: string, y: number, inv?: boolean) => w(t, 111.5, y, 'start', inv);
const R = (t: string, y: number) => w(t, 551.5, y, 'end');

type P = [number, number];
const f = (v: number) => +v.toFixed(3);
/** A point in image px to path mm, relative to the screen centre. */
const q = ([x, y]: P) => `${f(mm(x - SC[0]))} ${f(mm(y - SC[1]))}`;
const poly = (pts: P[], close = false) => `M${pts.map(q).join('L')}${close ? 'Z' : ''}`;

/* ------------------------------------------------------------------ clipping */

/** The HAD's drawing area: inside the frame (p. 539: x 111-553, y 108-548), above the format-select row. */
const BOX = { x0: 113, x1: 551, y0: 110, y1: 528 };
function clipSeg(a: P, b: P): [P, P] | null {
  let t0 = 0, t1 = 1;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const [p, qq] of [[-dx, a[0] - BOX.x0], [dx, BOX.x1 - a[0]], [-dy, a[1] - BOX.y0], [dy, BOX.y1 - a[1]]] as const) {
    if (p === 0) { if (qq < 0) return null; continue; }
    const r = qq / p;
    if (p < 0) { if (r > t1) return null; if (r > t0) t0 = r; } else { if (r < t0) return null; if (r < t1) t1 = r; }
  }
  return [[a[0] + t0 * dx, a[1] + t0 * dy], [a[0] + t1 * dx, a[1] + t1 * dy]];
}
const inside = ([x, y]: P) => x >= BOX.x0 && x <= BOX.x1 && y >= BOX.y0 && y <= BOX.y1;
/** A circle as the runs of a 240-gon that fall inside the drawing area. */
function clipCircle(c: P, r: number) {
  const n = 240, pts: P[] = Array.from({ length: n + 1 }, (_, i) => [c[0] + r * Math.sin(2 * Math.PI * i / n), c[1] - r * Math.cos(2 * Math.PI * i / n)]);
  let d = '', run: P[] = [];
  const flush = () => { if (run.length > 1) d += poly(run); run = []; };
  for (const p of pts) { if (inside(p)) run.push(p); else flush(); }
  flush();
  return d;
}

/* --------------------------------------------------------------------- scene */

/** Route symbols: square (initial point), circle (steerpoint), triangle (target; solid = selected). Half-size in px. */
type Sym = { at: P; kind: 'square' | 'circle' | 'tri' | 'tri-solid'; r: number };
const S = {
  ip1: { at: [301.7, 414.5], kind: 'square', r: 6.5 },
  ip2: { at: [265, 431.5], kind: 'square', r: 6.5 },
  tgt: { at: [308.5, 264], kind: 'tri-solid', r: 7 },
  tgt2: { at: [280, 243.5], kind: 'tri', r: 6 },
  sp1: { at: [381.7, 211.7], kind: 'circle', r: 6 },
  sp2: { at: [508.3, 203.3], kind: 'circle', r: 6 },
} satisfies Record<string, Sym>;
/** Route 1 (active, white, drawn medium) and route 2 (grey, drawn fine), from off the bottom of the format. */
const ROUTE1: (P | Sym)[] = [[400.7, 548], S.ip1, S.tgt, S.sp1, [445.5, 100]];
const ROUTE2: (P | Sym)[] = [[386.7, 530], S.ip2, S.tgt2, S.sp1, S.sp2, [570, 164]];
/** Ownship (ring centre, fitted to the three magenta rings: 332.2, 421) and the ring radii at 30 NM depressed (10, 20, 30 NM). */
const OWN: P = [332.5, 421];
const RINGS = [92.2, 184.4, 276.6];
/** Threat radars (HTS-detected): the SA-6 the procedure works with and an SA-8. */
const SA6: P = [254, 253], SA8: P = [428.3, 470];
/** Flight members 2 and 3 (PPLI circles, heading stalk, altitude in thousands of feet below). */
const MEMBERS: [string, P, P][] = [['2', [290.7, 445], [290.5, 470]], ['3', [380, 453.3], [379.3, 477.3]]];

/**
 * A hint ring round part of the HAD: a box in p. 539 pixels as `#x0 y0 x1 y1` in the page's own units,
 * appended to `right-mfd.display` in a procedure step's hints.
 */
export const hadSpot = (x0: number, y0: number, x1: number, y1: number) => `#${[x0 - SC[0], y0 - SC[1], x1 - SC[0], y1 - SC[1]].map(v => f(mm(v))).join(' ')}`;

interface View { k: number; about: P; to: P }
const NORM: View = { k: 1, about: [0, 0], to: [0, 0] };
const tf = (v: View, [x, y]: P): P => [v.to[0] + v.k * (x - v.about[0]), v.to[1] + v.k * (y - v.about[1])];

function routeMarks(r: (P | Sym)[], v: View) {
  const pts = r.map(p => (Array.isArray(p) ? { at: tf(v, p), r: 0 } : { at: tf(v, p.at), r: p.r }));
  let d = '';
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const dx = b.at[0] - a.at[0], dy = b.at[1] - a.at[1], len = Math.hypot(dx, dy);
    if (len <= a.r + b.r) continue;
    const ux = dx / len, uy = dy / len;
    const s = clipSeg([a.at[0] + ux * a.r, a.at[1] + uy * a.r], [b.at[0] - ux * b.r, b.at[1] - uy * b.r]);
    if (s) d += poly(s);
  }
  return d;
}
function symMarks(s: Sym, v: View): { line: string; fill: string } {
  const [x, y] = tf(v, s.at);
  if (!inside([x, y])) return { line: '', fill: '' };
  const r = s.r;
  if (s.kind === 'square') return { line: poly([[x - r, y - r], [x + r, y - r], [x + r, y + r], [x - r, y + r]], true), fill: '' };
  if (s.kind === 'circle') return { line: clipCircle([x, y], r), fill: '' };
  // Triangles: p. 539 solid 13 px wide, apex 7.5 px above the centre; hollow 11 px wide.
  const tri = poly([[x, y - r - 1], [x + r - 0.5, y + r * 0.6], [x - r + 0.5, y + r * 0.6]], true);
  return s.kind === 'tri' ? { line: tri, fill: '' } : { line: '', fill: tri };
}

/* --------------------------------------------------------------- page pieces */

/** Format-select row along the bottom (OSB 15-11): the guide's mission has SMS and HSD in the first two slots. */
export const hadBottom = (slot3: string) => [
  w('SWAP', 186, 538.5), w('SMS', 259, 538.5), w('HSD', 332, 538.5), w(slot3, 405, 538.5, undefined, true), w('DCLT', 477.5, 538.5),
];
/** SOI frame (p. 539): a thin line round the format, broken for the option labels. */
const FRAME = [
  poly([[111, 190], [111, 108], [165, 108]]), poly([[208, 108], [304, 108]]), poly([[357, 108], [377, 108]]), poly([[433, 108], [448, 108]]),
  poly([[518, 108], [547, 108], [553, 113], [553, 313]]), poly([[553, 347], [553, 383]]), poly([[553, 417], [553, 457]]), poly([[553, 488], [553, 548], [505, 548]]),
  poly([[111, 255], [111, 320]]), poly([[111, 340], [111, 465]]), poly([[111, 548], [160, 548]]),
  poly([[215, 548], [240, 548]]), poly([[280, 548], [313, 548]]), poly([[352, 548], [383, 548]]), poly([[428, 548], [450, 548]]),
].join('');
/** Range scale (OSB 20 up, OSB 19 down) with the scale between the arrows (p. 539: 30 NM). */
const RANGE = { words: [w('30', 128.5, 223)], marks: poly([[129, 192], [145, 208], [113, 208]], true) + poly([[113, 237], [145, 237], [129, 254]], true) };
/** Bullseye: range inside the pointer circle, bearing below, line-of-sight pointer on the circle (p. 539 items 26). */
const BULL = {
  words: [c(w('54', 133.5, 508.5), 'cyan'), c(w('054', 133.5, 537), 'cyan')],
  marks: clipCircle([133.3, 508.3], 15.7),
  fill: poly([[121, 485], [131, 492], [121, 499]], true),
};
/** HAD cursor: two short bars (as the p. 537 expanded images show them, 7 px apart), 16 px long, here 18 px apart so a symbol under it still reads. */
const cursor = ([x, y]: P) => poly([[x - 8, y - 9], [x + 8, y - 9]]) + poly([[x - 8, y + 9], [x + 8, y + 9]]);
/** Expanded threat data along the top (p. 539 items 19-22): major-axis bearing, major and minor axis lengths, PGM level. */
const DATA = [w('335°  5.1NM  3633FT', 116.5, 135.5, 'start'), w('PGM2', 453, 135.5, 'start')];

interface HadState { soi: boolean; fov: 'NORM' | 'EXP1' | 'EXP2'; cursor?: P; data?: boolean; designated?: boolean }
function had(id: string, s: HadState): Page {
  const exp = s.fov !== 'NORM';
  const cur = s.cursor ?? [329.5, 330];
  const v: View = exp ? { k: s.fov === 'EXP1' ? 2 : 4, about: cur, to: [329.5, 330] } : NORM;
  const words: Word[] = [];
  let marks = '', fine = '', fills = '';
  const paths: NonNullable<Page['paths']> = [];
  const cyan = (d: string) => { if (d) paths.push({ d, c: 'cyan' }); };
  // Fixed labels.
  if (!exp) words.push(w('DEP', 186, 117.5), ...RANGE.words);
  words.push(w(s.fov, 332.5, 117.5, undefined, exp), w('THRT', 406, 117.5), w('CNTL', 478, 117.5));
  words.push(L('TM', 330.5), w('MEM', 112, 473.5, 'start'), R('FR', 320.5), R('ON', 337.5), R('GS', 392), R('OF', 408.5), w('T', 548, 464), w('I', 548, 480.5));
  words.push(...BULL.words, ...hadBottom('HAD'));
  paths.push({ d: BULL.marks, c: 'cyan', pen: 'fine' }, { d: BULL.fill, c: 'cyan', fill: true });
  if (!exp) marks += RANGE.marks;
  if (s.soi) fine += FRAME + (exp ? poly([[165, 108], [208, 108]]) + poly([[111, 190], [111, 255]]) : '');
  else words.push(w('NOT SOI', 331, 223));
  if (s.data) words.push(...DATA);
  // Scene.
  // Range rings magenta; route 1 white, route 2 (not active) grey.
  if (!exp) paths.push({ d: RINGS.map(r => clipCircle(OWN, r)).join(''), c: 'magenta' });
  marks += routeMarks(ROUTE1, v);
  let grey = routeMarks(ROUTE2, v);
  for (const sym of Object.values(S) as Sym[]) { const m = symMarks(sym, v); (sym === S.tgt2 || sym === S.ip2 ? (grey += m.line) : (marks += m.line)); fills += m.fill; }
  paths.push({ d: grey, c: 'grey', pen: 'fine' });
  const [ox, oy] = tf(v, OWN);
  if (inside([ox, oy])) cyan(poly([[ox, oy - 5], [ox, oy + 22]]) + poly([[ox - 12, oy], [ox + 11, oy]]) + poly([[ox - 4.5, oy + 18], [ox + 4.5, oy + 18]]));
  for (const [n, at, alt] of MEMBERS) {
    const [x, y] = tf(v, at);
    if (!inside([x, y])) continue;
    cyan(clipCircle([x, y], 10) + poly([[x, y - 10], [x, y - 22]]));
    words.push(c(w(n, x, y), 'cyan'), c(w('20', x + alt[0] - at[0], y + alt[1] - at[1]), 'cyan'));
  }
  // Threat radars in their emission-state colours as p. 539 shows them: the SA-6 white, the SA-8 green (searching).
  for (const [t, p, col] of [['6', SA6, 'white'], ['8', SA8, 'green']] as [string, P, MfdColour][]) {
    const [x, y] = tf(v, p);
    if (!inside([x, y])) continue;
    // Designated SEAD target (p. 539): the symbol in a highlighted box, 34 x 25 px.
    if (t === '6' && s.designated) { fills += poly([[x - 17, y - 12.5], [x + 17, y - 12.5], [x + 17, y + 12.5], [x - 17, y + 12.5]], true); words.push(w(t, x, y, undefined, true)); }
    else words.push(c(w(t, x, y), col));
  }
  if (s.soi && !s.designated) marks += cursor(tf(v, cur));
  return { id, words, marks, fine, fills, paths };
}

/* ------------------------------------------------------------------ THRT page */

/** Threat classes down the sides (p. 534): CLASS 1-5 left, 6-10 right, 71.4 px apart; classes 1 and 2 highlighted. */
const CLASS_Y = (k: number) => 188.5 + 71.4 * k;
const thrt: Page = {
  id: 'had-thrt',
  words: [
    w('CLASS', 186, 119), w('11', 182.5, 140), w('MAN', 258, 119, undefined, true), w('SITE', 330, 119), w('ALL', 330.5, 140),
    w('THRT', 404, 119, undefined, true), w('ALL', 477, 119),
    w('SCT  0:22', 279, 172.5, 'start'), w('HTS OFP', 337.5, 307), w('ID 0042', 338, 323),
    ...[1, 2, 3, 4, 5].flatMap(n => [L('CLASS', CLASS_Y(n - 1), n <= 2), L(String(n), CLASS_Y(n - 1) + 22.5, n <= 2)]),
    ...[6, 7, 8, 9, 10].flatMap(n => [R('CLASS', CLASS_Y(n - 6)), R(String(n), CLASS_Y(n - 6) + 22.5)]),
    ...hadBottom('HAD'),
  ],
};

/** Every HAD page, in the order the procedure meets them. Cursor positions are on the p. 539 picture. */
export const hadPages: Page[] = [
  had('had-not-soi', { soi: false, fov: 'NORM' }),
  had('had', { soi: true, fov: 'NORM' }),
  had('had-up', { soi: true, fov: 'NORM', cursor: [329.5, SA6[1]] }),
  had('had-left', { soi: true, fov: 'NORM', cursor: [SA6[0], 330] }),
  had('had-hover', { soi: true, fov: 'NORM', cursor: SA6, data: true }),
  had('had-designated', { soi: true, fov: 'NORM', cursor: SA6, data: true, designated: true }),
  had('had-exp1', { soi: true, fov: 'EXP1', cursor: SA6, data: true }),
  had('had-exp2', { soi: true, fov: 'EXP2', cursor: SA6, data: true }),
  thrt,
];
export const hadPageLabels: Record<string, string> = {
  'had-not-soi': 'HAD format, not SOI',
  had: 'HAD format, SOI, cursor centred',
  'had-up': 'HAD: cursor slewed up',
  'had-left': 'HAD: cursor slewed left',
  'had-hover': 'HAD: cursor on the SA-6, expanded data shown',
  'had-designated': 'HAD: SA-6 designated as the SEAD target',
  'had-exp1': 'HAD: EXP1 field of view (2:1)',
  'had-exp2': 'HAD: EXP2 field of view (4:1)',
  'had-thrt': 'HAD Threat (THRT) page',
};
