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
 * - `had-free`: the cursor slewed by hand (a page `cursor` the procedure moves);
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
/**
 * Where a scene point (p. 539 px, 30 NM depressed) is drawn: the range scale and DEP/CEN set where the ownship sits
 * and how many px per NM (`Geo`), a turn swings the picture about the ownship (heading up: a turn left moves
 * everything clockwise), then an Expand view (`View`) enlarges about the cursor.
 */
interface Geo { own: P; k: number; rot: number; /** Where the jet is in the scene (it flies on after the turn). */ pos?: P }
const GEO30: Geo = { own: OWN, k: 1, rot: 0 };
const geoPt = (g: Geo, [x, y]: P): P => {
  const [px, py] = g.pos ?? OWN, a = (g.rot * Math.PI) / 180, dx = (x - px) * g.k, dy = (y - py) * g.k;
  return [g.own[0] + dx * Math.cos(a) - dy * Math.sin(a), g.own[1] + dx * Math.sin(a) + dy * Math.cos(a)];
};
let GEO: Geo = GEO30;
const tf = (v: View, p: P): P => { const [x, y] = geoPt(GEO, p); return [v.to[0] + v.k * (x - v.about[0]), v.to[1] + v.k * (y - v.about[1])]; };

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
export const FRAME = [
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
const DATA: [string, string] = ['335°  5.1NM  3633FT', 'PGM2'];

/** A threat radar on the picture: its number, where it is (p. 539 px), its emission-state colour. */
interface Threat { t: string; at: P; c: MfdColour }
interface HadState {
  soi: boolean; fov: 'NORM' | 'EXP1' | 'EXP2'; cursor?: P; designated?: string; free?: boolean;
  /** Expanded data along the top (major-axis bearing and lengths; PGM level), for the radar under the cursor or designated. */
  data?: [string, string];
  /** Range scale and format: DEP 30 (the p. 539 picture), DEP 60, or CEN 40; `rot` a turn in degrees (+ = picture clockwise). */
  scale?: 'DEP30' | 'DEP60' | 'CEN40'; rot?: number;
  /** Route 2 shown (NAV2 on the CNTL page); the threats on the picture; the CNTL page labels instead of the base page's. */
  nav2?: boolean; threats?: Threat[]; cntl?: { nav2: boolean };
  /**
   * A teaching overlay, not part of the HAD: the bearing line each scan measured (from where the jet was, scene
   * points) and the error ellipse they leave (`at`, major-axis bearing in degrees, major and minor axes in NM).
   */
  aid?: { from: P[]; to: P; ellipse: [number, number, number] };
  /** Where the jet has flown to in the scene (default: where p. 539 has it). The wingmen fly with it. */
  pos?: P;
  /** Pre-planned threats from the DTC (p. 531 item 11): a ring the size of the threat's engagement zone, yellow, red once inside it. */
  ppt?: { at: P; nm: number }[];
}
/**
 * Range scales (p. 531 item 6): DEP 15/30/60/120/240 NM, CEN 10/20/40/80/160 NM. Depressed keeps the ownship where
 * p. 539 has it, with the rings at a third, two thirds and the full scale (p. 530 item 5), so DEP 60 halves the px
 * per NM. Centered puts the ownship mid-picture with rings at half and full scale; the guide has no Centered image,
 * so the outer ring is drawn 200 px round the middle of the drawing area (assumed, `source.unresolved`).
 */
const SCALES = {
  DEP30: { label: '30', dep: 'DEP', own: OWN, k: 1, rings: RINGS },
  DEP60: { label: '60', dep: 'DEP', own: OWN, k: 0.5, rings: RINGS },
  CEN40: { label: '40', dep: 'CEN', own: [332, 319] as P, k: 200 / 40 / (RINGS[2] / 30), rings: [100, 200] },
} as const;
/** The p. 539 threats: the SA-6 white (as p. 537 draws it before designation; white is not a p. 531 emission colour), the SA-8 green (in HTS memory). */
const P539_THREATS: Threat[] = [{ t: '6', at: SA6, c: 'white' }, { t: '8', at: SA8, c: 'green' }];
/** A designated SEAD target's box (p. 539: 34 x 25 px about the symbol; wider for two characters). */
const desBox = ([x, y]: P, t: string) => { const h = t.length > 1 ? 21 : 17; return poly([[x - h, y - 12.5], [x + h, y - 12.5], [x + h, y + 12.5], [x - h, y + 12.5]], true); };
/** Bullseye line-of-sight pointer, swung round its circle by a turn. */
const bullPointer = (rot: number) => {
  const a = (rot * Math.PI) / 180, [cx, cy] = [133.3, 508.3];
  const r = ([x, y]: P): P => [cx + (x - cx) * Math.cos(a) - (y - cy) * Math.sin(a), cy + (x - cx) * Math.sin(a) + (y - cy) * Math.cos(a)];
  return poly(([[121, 485], [131, 492], [121, 499]] as P[]).map(r), true);
};
const local = ([x, y]: P): P => [f(mm(x - SC[0])), f(mm(y - SC[1]))];
/**
 * The cursor slewed by hand (`had-free`): the procedure moves it in the page's units, from the centre toward the SA-6.
 * `reach`: how close counts as on the radar; `speed`: travel at full deflection, per second; `box`: where it can go.
 */
export const HAD_SLEW = {
  start: local([329.5, 330]), target: local(SA6), reach: f(mm(9)), speed: f(mm(140)),
  box: [...local([BOX.x0 + 10, BOX.y0 + 10]), ...local([BOX.x1 - 10, BOX.y1 - 10])] as [number, number, number, number],
};
/** NM in scene px (the p. 539 picture is DEP 30). */
const NM = RINGS[2] / 30;
/** Runs of a polyline that fall inside the drawing area. */
function clipRuns(pts: P[]) {
  let d = '', run: P[] = [];
  const flush = () => { if (run.length > 1) d += poly(run); run = []; };
  for (const p of pts) { if (inside(p)) run.push(p); else flush(); }
  flush();
  return d;
}
/** The teaching overlay: each scan's bearing line, run on 8 NM past the radar so the crossings show, and the error ellipse. */
function aidMarks(a: NonNullable<HadState['aid']>, v: View) {
  let d = '';
  for (const o of a.from) {
    const dx = a.to[0] - o[0], dy = a.to[1] - o[1], len = Math.hypot(dx, dy), past = (8 * NM) / len;
    const seg = clipSeg(tf(v, o), tf(v, [a.to[0] + dx * past, a.to[1] + dy * past]));
    if (seg) d += poly(seg);
  }
  const [brg, maj, min] = a.ellipse, r = (brg * Math.PI) / 180;
  const u: P = [Math.sin(r), -Math.cos(r)], n: P = [Math.cos(r), Math.sin(r)];
  const pts: P[] = Array.from({ length: 121 }, (_, i) => {
    const t = (2 * Math.PI * i) / 120, A = (maj / 2) * NM * Math.cos(t), B = (min / 2) * NM * Math.sin(t);
    return tf(v, [a.to[0] + A * u[0] + B * n[0], a.to[1] + A * u[1] + B * n[1]]);
  });
  return d + clipRuns(pts);
}
function had(id: string, s: HadState): Page {
  const sc = SCALES[s.scale ?? 'DEP30'];
  GEO = { own: sc.own, k: sc.k, rot: s.rot ?? 0, pos: s.pos };
  const exp = s.fov !== 'NORM';
  // The cursor sits on a scene point (`cursor`) or in the middle of the format.
  const cur: P = s.cursor ? geoPt(GEO, s.cursor) : [329.5, 330];
  const v: View = exp ? { k: s.fov === 'EXP1' ? 2 : 4, about: cur, to: [329.5, 330] } : NORM;
  const words: Word[] = [];
  let marks = '', fine = '', fills = '';
  const paths: NonNullable<Page['paths']> = [];
  const cyan = (d: string) => { if (d) paths.push({ d, c: 'cyan' }); };
  // Fixed labels: the base page's (p. 539), or the Control page's (p. 535: PRE, TER and TBL1, NAV1-3, SAM, LINE1-4, PAGE 1).
  if (s.cntl) {
    const row = (k: number) => 188.5 + 71.4 * k;
    words.push(w('PRE', 186, 117.5, undefined, !!s.ppt?.length), w('TER', 258, 117.5), w('TBL1', 258, 135), w('NORM', 332.5, 117.5), w('CNTL', 478, 117.5, undefined, true));
    words.push(L('NAV1', row(0), true), L('NAV2', row(1), s.cntl.nav2), L('NAV3', row(2), true), L('SAM', row(3), true), w('MEM', 112, 473.5, 'start'));
    words.push(...[1, 2, 3, 4].map(k => ({ ...R(`LINE${k}`, row(k - 1)), inv: true })), R('PAGE', 463), R('1', 481));
  } else {
    if (!exp) words.push(w(sc.dep, 186, 117.5), w(sc.label, 128.5, 223));
    words.push(w(s.fov, 332.5, 117.5, undefined, exp), w('THRT', 406, 117.5), w('CNTL', 478, 117.5));
    words.push(L('TM', 330.5), w('MEM', 112, 473.5, 'start'), R('FR', 320.5), R('ON', 337.5), R('GS', 392), R('OF', 408.5), w('T', 548, 464), w('I', 548, 480.5));
    if (!exp) marks += RANGE.marks;
  }
  // The bullseye goes in the expanded views (p. 537).
  words.push(...(exp ? [] : BULL.words), ...hadBottom('HAD'));
  if (!exp) paths.push({ d: BULL.marks, c: 'cyan', pen: 'fine' }, { d: bullPointer(s.rot ?? 0), c: 'cyan', fill: true });
  if (s.soi) fine += FRAME + (exp ? poly([[165, 108], [208, 108]]) + poly([[111, 190], [111, 255]]) : '');
  else words.push(w('NOT SOI', 331, 223));
  if (s.data && !s.cntl) words.push(w(s.data[0], 116.5, 135.5, 'start'), w(s.data[1], 453, 135.5, 'start'));
  // Scene.
  // Range rings magenta; route 1 white, route 2 (not active) grey.
  if (!exp) paths.push({ d: sc.rings.map(r => clipCircle(sc.own, r)).join(''), c: 'magenta' });
  marks += routeMarks(ROUTE1, v);
  const nav2 = s.cntl ? s.cntl.nav2 : s.nav2 ?? true;
  let grey = nav2 ? routeMarks(ROUTE2, v) : '';
  for (const sym of Object.values(S) as Sym[]) {
    const m = symMarks(sym, v), route2 = sym === S.tgt2 || sym === S.ip2;
    if (route2) { if (nav2) grey += m.line; } else marks += m.line;
    if (!route2 || nav2) fills += m.fill;
  }
  if (grey) paths.push({ d: grey, c: 'grey', pen: 'fine' });
  const [ox, oy] = tf(v, s.pos ?? OWN);
  if (inside([ox, oy])) cyan(poly([[ox, oy - 5], [ox, oy + 22]]) + poly([[ox - 12, oy], [ox + 11, oy]]) + poly([[ox - 4.5, oy + 18], [ox + 4.5, oy + 18]]));
  const fly = (q: P): P => (s.pos ? [q[0] + s.pos[0] - OWN[0], q[1] + s.pos[1] - OWN[1]] : q);
  for (const [n, at0, alt0] of MEMBERS) {
    const at = fly(at0), alt = fly(alt0);
    const [x, y] = tf(v, at);
    if (!inside([x, y])) continue;
    cyan(clipCircle([x, y], 10) + poly([[x, y - 10], [x, y - 22]]));
    words.push(c(w(n, x, y), 'cyan'), c(w('20', x + alt[0] - at[0], y + alt[1] - at[1]), 'cyan'));
  }
  // Pre-planned threat rings (p. 531 item 11): yellow, red once the jet is inside one. Shown unless PRE is off (p. 535).
  for (const t of s.ppt ?? []) {
    const [px, py] = s.pos ?? OWN, inside = Math.hypot(t.at[0] - px, t.at[1] - py) < t.nm * NM;
    const ring = clipCircle(tf(v, t.at), t.nm * NM * sc.k * v.k);
    if (ring) paths.push({ d: ring, c: inside ? 'red' : 'yellow', pen: 'fine' });
  }
  // Threat radars in their emission-state colours (p. 531 item 7); the designated SEAD target in a highlighted box (p. 539).
  for (const th of s.threats ?? P539_THREATS) {
    const [x, y] = tf(v, th.at);
    if (!inside([x, y])) continue;
    if (th.t === s.designated) { fills += desBox([x, y], th.t); words.push(w(th.t, x, y, undefined, true)); }
    else words.push(c(w(th.t, x, y), th.c));
  }
  if (s.soi && !s.designated && !s.free && !s.cntl) marks += cursor(exp ? [329.5, 330] : cur);
  const page: Page = { id, words, marks, fine, fills, paths };
  if (s.aid) page.aid = aidMarks(s.aid, v);
  if (s.free) page.cursor = { d: `M${f(mm(-8))} ${f(mm(-9))}H${f(mm(8))}M${f(mm(-8))} ${f(mm(9))}H${f(mm(8))}`, at: HAD_SLEW.start };
  GEO = GEO30;
  return page;
}
/** Where a scene point is drawn at a scale and turn (for cursor positions and hint rings). */
export const hadAt = (scale: keyof typeof SCALES, rot: number, p: P, pos?: P): P => {
  GEO = { own: SCALES[scale].own, k: SCALES[scale].k, rot, pos };
  const q = tf(NORM, p);
  GEO = GEO30;
  return [f(q[0]), f(q[1])];
};

/* ------------------------------------------------------------------ THRT page */

/**
 * Threat classes down the sides (p. 534): CLASS 1-5 left, 6-10 right, 71.4 px apart; highlighted classes are in the
 * scan (p. 534 shows 1, 2 and MAN). SCT is the scan cycle time: p. 534 reads 0:22 with classes 1, 2 and MAN; the
 * guide gives no other values, so the shorter time with only MAN highlighted is illustrative (`source.unresolved`).
 */
const CLASS_Y = (k: number) => 188.5 + 71.4 * k;
const thrtPage = (id: string, on: number[], man: boolean, sct: string): Page => ({
  id,
  words: [
    w('CLASS', 186, 119), w('11', 182.5, 140), w('MAN', 258, 119, undefined, man), w('SITE', 330, 119), w('ALL', 330.5, 140),
    w('THRT', 404, 119, undefined, true), w('ALL', 477, 119),
    w(`SCT  ${sct}`, 279, 172.5, 'start'), w('HTS OFP', 337.5, 307), w('ID 0042', 338, 323),
    ...[1, 2, 3, 4, 5].flatMap(n => [L('CLASS', CLASS_Y(n - 1), on.includes(n)), L(String(n), CLASS_Y(n - 1) + 22.5, on.includes(n))]),
    ...[6, 7, 8, 9, 10].flatMap(n => [R('CLASS', CLASS_Y(n - 6)), R(String(n), CLASS_Y(n - 6) + 22.5)]),
    ...hadBottom('HAD'),
  ],
});
const thrt = thrtPage('had-thrt', [1, 2], true, '0:22');

/* ------------------------------------------------- advanced HTS procedure */

/**
 * The advanced procedure ("locating and targeting radars") works the same p. 539 picture, with the SA-6 now
 * searching (yellow) and, once the scan is narrowed to the manual class and the range scale doubled, a new SA-11
 * FIRE DOME ("11", class 1) 50 NM ahead and 3 NM right. Its emission colours follow p. 531 (yellow search, red
 * track, green memory). The ellipse data and PGM levels as the picture turns are illustrative: the guide gives the
 * behaviour (pp. 528, 541: dead ahead PGM 4-5, off to the side PGM 3-2, AOA no better than PGM 2), not values.
 */
const SA11: P = [OWN[0] + 3 * NM, OWN[1] - 50 * NM];
/** The turn: about 50° left puts the SA-11 well off the right side of the nose (picture swings clockwise). */
export const TURN = 50;
/**
 * The advanced scenario's SA-6 sits further out than p. 539's (28 NM, 30° left of the nose), so the turn that ranges
 * the SA-11 ends about 17 NM from it, outside its roughly 13 NM (24 km) reach.
 */
const SA6X: P = [OWN[0] - 14 * NM, OWN[1] - 24.2 * NM];
const Y6: Threat = { t: '6', at: SA6X, c: 'yellow' };
const T_START: Threat[] = [Y6, { t: '8', at: SA8, c: 'green' }];
const T_11 = (c: MfdColour): Threat[] => [Y6, { t: '11', at: SA11, c }];
// After the turn the SA-6, passed about 17 NM away, tracks the jet; the distant 11 keeps searching.
const T_TURN = (red: boolean): Threat[] => [{ ...Y6, c: red ? 'red' : 'yellow' }, { t: '11', at: SA11, c: 'yellow' }];
const PGM: Record<number, [string, string]> = {
  5: ['004°  21.4NM  1.8NM', 'PGM5'], 4: ['008°  12.6NM  1.5NM', 'PGM4'],
  3: ['012°  6.2NM  1.1NM', 'PGM3'], 2: ['016°  2.3NM  2950FT', 'PGM2'],
};
/** The briefed SA-6 is loaded as a pre-planned threat, with a ring at its missiles' reach (about 13 NM, 24 km). */
const base = { soi: true, fov: 'NORM' as const, ppt: [{ at: SA6X, nm: 13 }] };
/**
 * Where the jet was at each scan, for the teaching overlay. The guide gives no scan spacing; 4 NM apart is
 * illustrative. Before the turn the jet flies straight up the picture; after it, 50° left, so the earlier points trail
 * behind on the new heading and, beyond the turn point, back down the old one. The jet flies on after the turn, so
 * the picture moves under it scan by scan.
 */
const STEP = 4 * NM, HDG: P = [-Math.sin((TURN * Math.PI) / 180), -Math.cos((TURN * Math.PI) / 180)];
/** Where the jet is `n` drawn scans after the turn: flying on along the new heading from the turn point. */
const flown = (n: number): P => [OWN[0] + n * STEP * HDG[0], OWN[1] + n * STEP * HDG[1]];
const track = (after: number): P[] => [
  ...Array.from({ length: after + 1 }, (_, j) => flown(after - j)),
  ...[1, 2, 3].map((j): P => [OWN[0], OWN[1] + j * STEP]),
];
/** The ellipse each PGM page's data describes: major-axis bearing (deg), major and minor axes (NM). */
const ELLIPSE: Record<number, [number, number, number]> = { 5: [4, 21.4, 1.8], 4: [8, 12.6, 1.5], 3: [12, 6.2, 1.1], 2: [16, 2.3, 2950 / 6076] };
/** Where the jet is once the scans are done. */
const FLOWN = flown(3);
const aid = (after: number, n: number) => ({ from: track(after), to: SA11, ellipse: ELLIPSE[n] });
const hadx: Page[] = [
  had('hadx', { ...base, threats: T_START }),
  thrtPage('had-thrt-c1', [2], true, '0:22'),
  thrtPage('had-thrt-man', [], true, '0:08'),
  had('hadx-cntl', { ...base, threats: T_START, cntl: { nav2: true } }),
  had('hadx-cntl-nav2', { ...base, threats: T_START, cntl: { nav2: false } }),
  had('hadx-n', { ...base, threats: T_START, nav2: false }),
  had('hadx-60', { ...base, threats: T_11('yellow'), nav2: false, scale: 'DEP60' }),
  had('hadx-cen', { ...base, threats: T_11('yellow'), nav2: false, scale: 'CEN40' }),
  had('hadx-60-free', { ...base, threats: T_11('yellow'), nav2: false, scale: 'DEP60', free: true }),
  had('hadx-60-hover', { ...base, threats: T_11('yellow'), nav2: false, scale: 'DEP60', cursor: SA11, data: PGM[5] }),
  had('hadx-des', { ...base, threats: T_11('yellow'), nav2: false, scale: 'DEP60', designated: '11', data: PGM[5] }),
  had('hadx-des-aid', { ...base, threats: T_11('yellow'), nav2: false, scale: 'DEP60', designated: '11', data: PGM[5], aid: aid(0, 5) }),
  ...[5, 4, 3, 2].map(n => had(`hadx-t${n}`, { ...base, threats: T_TURN(n <= 3), nav2: false, scale: 'DEP60', rot: TURN, designated: '11', data: PGM[n], aid: aid(5 - n, n), pos: flown(5 - n) })),
  had('hadx-t11', { ...base, threats: T_TURN(true), nav2: false, scale: 'DEP60', rot: TURN, designated: '11', data: PGM[2], pos: FLOWN }),
  had('hadx-t-des6', { ...base, threats: T_TURN(true), nav2: false, scale: 'DEP60', rot: TURN, designated: '6', data: ['344°  4.6NM  3300FT', 'PGM2'], pos: FLOWN }),
  had('hadx-t-notsoi', { ...base, soi: false, threats: T_TURN(true), nav2: false, scale: 'DEP60', rot: TURN, designated: '11', data: PGM[2], pos: FLOWN }),
  had('hadx-t-tracked', { ...base, soi: false, threats: T_TURN(true), nav2: false, scale: 'DEP60', rot: TURN, pos: FLOWN }),
];
/** Where things are on the advanced pages (p. 539 px), for hint rings and the cursor slew. */
export const HADX = {
  sa11: hadAt('DEP60', 0, SA11), sa11Turned: hadAt('DEP60', TURN, SA11, FLOWN), sa6Turned: hadAt('DEP60', TURN, SA6X, FLOWN), sa6At60: hadAt('DEP60', 0, SA6X),
  slew: { ...HAD_SLEW, target: local(hadAt('DEP60', 0, SA11)) },
};

/** Every HAD page, in the order the procedure meets them. Cursor positions are on the p. 539 picture. */
export const hadPages: Page[] = [
  had('had-not-soi', { soi: false, fov: 'NORM' }),
  had('had', { soi: true, fov: 'NORM' }),
  had('had-free', { soi: true, fov: 'NORM', free: true }),
  had('had-hover', { soi: true, fov: 'NORM', cursor: SA6, data: DATA }),
  had('had-designated', { soi: true, fov: 'NORM', cursor: SA6, data: DATA, designated: '6' }),
  had('had-exp1', { soi: true, fov: 'EXP1', cursor: SA6, data: DATA }),
  had('had-exp2', { soi: true, fov: 'EXP2', cursor: SA6, data: DATA }),
  thrt,
  ...hadx,
];
export const hadPageLabels: Record<string, string> = {
  'had-not-soi': 'HAD format, not SOI',
  had: 'HAD format, SOI, cursor centred',
  'had-free': 'HAD: cursor being slewed',
  'had-hover': 'HAD: cursor on the SA-6, expanded data shown',
  'had-designated': 'HAD: SA-6 designated as the SEAD target',
  'had-exp1': 'HAD: EXP1 field of view (2:1)',
  'had-exp2': 'HAD: EXP2 field of view (4:1)',
  'had-thrt': 'HAD Threat (THRT) page',
  hadx: 'HAD (advanced): SOI, the SA-6 searching',
  'had-thrt-c1': 'THRT page: class 1 off',
  'had-thrt-man': 'THRT page: only the manual class in the scan',
  'hadx-cntl': 'HAD Control (CNTL) page 1',
  'hadx-cntl-nav2': 'CNTL page: NAV2 off',
  'hadx-n': 'HAD: route 2 hidden',
  'hadx-60': 'HAD: 60 NM depressed, SA-11 ahead',
  'hadx-cen': 'HAD: 40 NM centered',
  'hadx-60-free': 'HAD 60 NM: cursor being slewed',
  'hadx-60-hover': 'HAD 60 NM: cursor on the SA-11, PGM5',
  'hadx-des': 'HAD 60 NM: SA-11 designated, PGM5',
  'hadx-des-aid': 'HAD 60 NM: SA-11 designated, with the scan bearings and error ellipse drawn on',
  'hadx-t5': 'HAD after the turn: PGM5, bearings drawn on',
  'hadx-t4': 'HAD after the turn: PGM4, bearings drawn on',
  'hadx-t3': 'HAD after the turn: PGM3, the SA-6 tracking (red), bearings drawn on',
  'hadx-t2': 'HAD after the turn: PGM2, bearings drawn on',
  'hadx-t11': 'HAD after the turn: SA-11 designated at PGM2',
  'hadx-t-des6': 'HAD: TMS right stepped to the SA-6',
  'hadx-t-notsoi': 'HAD not SOI, SA-11 still designated',
  'hadx-t-tracked': 'HAD not SOI, designation dropped once the pod tracks',
};
