import type { MfdDisplay } from '../types';
import { tracer } from '../trace.ts';
import { f, poly, w, c } from './mfd-had.ts';
import {
  AZ0, CURSOR_BARS, FT_NM, HOME, OWN_ALT, PX_DEG, R0, RH, SC, bugged, cata, fcr, fcrBox, limits, local, pad, scope, searchTarget,
  type Bars, type Scale,
} from './mfd-fcr.ts';

/**
 * F-16C FCR air-to-air format, the multi-target sub-modes: Track While Scan (TWS), Dual Target SAM (DT SAM) and Dual Target
 * Track (DTT). The format's chrome comes from `mfd-fcr.ts`; this file adds the target symbols traced from the guide's key
 * (p. 404: track target yellow, system track target white, bugged target ringed; the stem is the target's ground track,
 * its square turned with it) and the figures on pp. 413-421 (TWS and the Cursor and Bugged Target pages, SAM, DT SAM,
 * DTT, STT), and the range cut at 10 NM that DTT draws (p. 420, a fine dotted green line).
 *
 * One scene, an illustration: the radar procedures' CAP at 28,000 ft, 550 KTAS, heading 360°, and four contacts flying in
 * straight lines. Positions, aspect, closure and the collision bearing (CATA) are worked out from the lines they fly (`geo`),
 * not typed in, so the numbers on every page agree with each other. The picture holds still while each step is read.
 */
const PX = 4.8;
const { mm } = tracer(PX);
type Page = MfdDisplay['pages'][number];
type P = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const n180 = (d: number) => ((d + 540) % 360) - 180;

/** True airspeed (kt) for a calibrated airspeed at an altitude, ISA troposphere, compressibility included. */
export const tas = (kcas: number, ft: number) => {
  const a0 = 661.4786, T = 288.15 - 0.0019812 * ft, pr = (T / 288.15) ** 5.25588;
  const qc = (1 + 0.2 * (kcas / a0) ** 2) ** 3.5 - 1;
  const M = Math.sqrt(5 * (((qc / pr) + 1) ** (2 / 7) - 1));
  return M * a0 * Math.sqrt(T / 288.15);
};

/** The jet's speed (550 KTAS: 0.92 Mach at 28,000 ft, as in the radar procedures). */
const JET = 550;
export type Key = 'lead' | 'wing' | 'mid' | 'single';
interface Ship { az: number; nm: number; alt: number; trk: number; kcas: number; ktas: number }
/** `az`/`nm`: where it is at the start, off a 360° heading; `alt`: thousands of ft; `trk`: its ground track (° magnetic). */
export const SHIPS: Record<Key, Ship> = {
  /** The radar procedures' lead: hot, 45 NM out, 20° left, 25,000 ft, 280 KCAS (about 404 KTAS). */
  lead: { az: -20, nm: 45, alt: 25, trk: 150, kcas: 280, ktas: 404 },
  /** Its wingman, about 11 NM abeam to the right. */
  wing: { az: -6, nm: 47, alt: 25, trk: 150, kcas: 280, ktas: 404 },
  /** A fast high single, 38 NM out and 12° right, nearly nose-on. */
  mid: { az: 12, nm: 38, alt: 31, trk: 200, kcas: 300, ktas: tas(300, 31000) },
  /** A single going away, 55 NM out, 40° right, low. */
  single: { az: 40, nm: 55, alt: 15, trk: 60, kcas: 300, ktas: tas(300, 15000) },
};
const KEYS = Object.keys(SHIPS) as Key[];

/** A contact `t` seconds on, seen from the jet flying straight on heading `h` since the start. */
export function geo(k: Key, t = 0, h = 360) {
  const s = SHIPS[k];
  const x0 = s.nm * Math.sin(rad(s.az)), y0 = s.nm * Math.cos(rad(s.az));
  const tx = x0 + ((s.ktas * t) / 3600) * Math.sin(rad(s.trk)), ty = y0 + ((s.ktas * t) / 3600) * Math.cos(rad(s.trk));
  const jx = ((JET * t) / 3600) * Math.sin(rad(h)), jy = ((JET * t) / 3600) * Math.cos(rad(h));
  const dx = tx - jx, dy = ty - jy, nm = Math.hypot(dx, dy), brg = (deg(Math.atan2(dx, dy)) + 360) % 360;
  const vx = s.ktas * Math.sin(rad(s.trk)) - JET * Math.sin(rad(h)), vy = s.ktas * Math.cos(rad(s.trk)) - JET * Math.cos(rad(h));
  const closure = Math.round(-(dx * vx + dy * vy) / nm);
  // Aspect, in tens of degrees round from the target's tail (0 tail-on, 18 nose-on), R when the jet is right of its nose.
  const rel = n180(brg + 180 - s.trk), tens = Math.round((180 - Math.abs(rel)) / 10);
  const aspect = tens === 0 || tens === 18 ? String(tens) : `${tens}${rel > 0 ? 'R' : 'L'}`;
  // Collision course: the jet's speed across the line of sight matches the target's.
  const cataHdg = brg + deg(Math.asin(Math.max(-1, Math.min(1, (s.ktas * Math.sin(rad(s.trk - brg))) / JET))));
  return {
    az: n180(brg - h), nm, alt: s.alt, hot: Math.abs(rel) < 90, closure, aspect, cataAz: n180(cataHdg - h), brg, jx, jy,
    track: `${pad(Math.round(s.trk / 10) * 10 % 360 || 360, 3)}°`, kcas: String(s.kcas), el: deg(Math.atan2((s.alt * 1000 - OWN_ALT) / FT_NM, nm)),
  };
}

/* ------------------------------------------------------------------ symbols */

const rot = ([x, y]: P, [cx, cy]: P, th: number): P => [cx + x * Math.cos(rad(th)) - y * Math.sin(rad(th)), cy + x * Math.sin(rad(th)) + y * Math.cos(rad(th))];
/** Track target (p. 404 key): a 16 px square turned to the ground track, its stem (4 x 10 px) off the nose side. */
const trackShape = (p: P, th: number) =>
  poly([[-8, -8], [8, -8], [8, 8], [-8, 8]].map(q => rot(q as P, p, th)), true) + poly([[-2, -8], [2, -8], [2, -18], [-2, -18]].map(q => rot(q as P, p, th)), true);

/* -------------------------------------------------------------------- pages */

type Sym = 'search' | 'track' | 'system' | 'bug' | 'bugd' | 'second';
interface Spec {
  scale: Scale;
  sub: 'RWS' | 'VSR' | 'TWS';
  az: 'A6' | 'A3' | 'A2';
  bars: 4 | 3;
  syms: Partial<Record<Key, Sym>>;
  /** The cursor: on a contact, at home, being slewed, or gone. */
  cursor?: Key | 'home' | 'free';
  /** Scan limit lines (cyan): about the cursor, or about a contact. */
  lim?: 'cursor' | Key;
  /** Crosses on the scales for these contacts (SAM and DT SAM track indicators). */
  sam?: Key[];
  /** Seconds on from the start, and the jet's heading since. */
  t?: number;
  hdg?: number;
  /** STT: no cursor, no scan. */
  stt?: boolean;
  /** DTT's range cut at 10 NM. */
  ten?: boolean;
  ant: number;
}
const LIM = { A6: 60, A3: 30, A2: 25 } as const;

function two(id: string, s: Spec): Page {
  const h = s.hdg ?? 360, t = s.t ?? 0;
  const base = fcr(id, { soi: true, scale: s.scale, sub: s.sub === 'VSR' ? 'VSR' : 'RWS', az: s.az, bars: s.bars as Bars, cursor: null, ant: s.ant, hdg: h, scene: 'none', noStpt: t > 0 });
  const words = base.words.map(x => (s.sub === 'TWS' && x.t === 'RWS' ? { ...x, t: 'TWS' } : x));
  let marks = base.marks ?? '', fills = base.fills ?? '';
  const paths = [...(base.paths ?? [])];
  const yellow: string[] = [], cyan: string[] = [];
  const at = (k: Key): P => { const g = geo(k, t, h); return scope(g.az, g.nm, s.scale); };
  let toi: Key | undefined;
  for (const k of KEYS) {
    const sym = s.syms[k];
    if (!sym) continue;
    const g = geo(k, t, h), p = at(k), th = SHIPS[k].trk - h;
    if (p[1] < 112 || p[1] > 548) continue;
    const alt = w(pad(g.alt, 2), p[0], p[1] + (sym === 'track' || sym === 'system' ? 30 : 28));
    if (sym === 'search') {
      fills += searchTarget(p, s.sub === 'VSR' ? null : g.hot);
      if (s.cursor === k) words.push(alt);
    } else if (sym === 'second') {
      fills += searchTarget(p, g.hot);
      words.push(alt);
    } else if (sym === 'track') {
      yellow.push(trackShape(p, th));
      words.push(c(alt, 'yellow'));
    } else if (sym === 'system') {
      fills += trackShape(p, th);
      words.push(alt);
    } else if (sym === 'bug') {
      // Bugged track target (p. 404): the system symbol in a ring, its stem leaving the ring.
      fills += trackShape(p, th); marks += poly(Array.from({ length: 36 }, (_, i): P => [p[0] + 12.5 * Math.sin((2 * Math.PI * i) / 36), p[1] - 12.5 * Math.cos((2 * Math.PI * i) / 36)]), true);
      if (Math.abs(g.cataAz) <= 60) fills += cata(scope(g.cataAz, g.nm, s.scale));
      words.push(alt); toi = k;
    } else {
      // Bugged search target (SAM primary, STT): the ring round a disc (p. 417).
      const b = bugged(p, g.hot);
      marks += b.marks; fills += b.fills + (Math.abs(g.cataAz) <= 60 ? cata(scope(g.cataAz, g.nm, s.scale)) : '');
      words.push(alt); toi = k;
    }
  }
  if (yellow.length) paths.push({ d: yellow.join(''), c: 'yellow', fill: true });
  // The bugged target's data along the top (p. 405 items 1-4) and, in STT, the bearing and range from the steerpoint to it.
  if (toi) {
    const g = geo(toi, t, h);
    words.push(w(g.aspect, 128, 136.5, 'start'), w(g.track, 186, 136.5, 'start'), w(g.kcas, 405, 136.5), w(`${g.closure < 0 ? '-' : '+'}${Math.abs(g.closure)}K`, 513.5, 136.5, 'end'));
  }
  // SAM track indicators (p. 418): crosses on the elevation and azimuth scales at each tracked contact's elevation and azimuth.
  for (const k of s.sam ?? []) {
    const g = geo(k, t, h), ey = 327.5 - g.el * 3.65, tx = AZ0 + g.az * PX_DEG;
    cyan.push(poly([[139, ey], [151, ey]]) + poly([[145, ey - 6], [145, ey + 6]]) + poly([[tx - 6, 528], [tx + 6, 528]]) + poly([[tx, 520], [tx, 536]]));
  }
  // Scan limit lines about a contact (the scan is centred on it) or, via `cursorX` below, about the cursor.
  if (s.lim && s.lim !== 'cursor') {
    const x = at(s.lim)[0], d = LIM[s.az] * PX_DEG;
    cyan.push(poly([[x - d, 144], [x - d, 511]]) + poly([[x + d, 144], [x + d, 511]]));
  }
  if (s.ten) paths.push({ d: poly([[113, R0 - (10 / s.scale) * RH], [549, R0 - (10 / s.scale) * RH]]), c: 'green', pen: 'fine', dash: true });
  // The cursor, with its altitude limits and the bearing and range from the steerpoint (left column).
  let cursor: Page['cursor'];
  let cursorP: P | undefined;
  if (s.cursor === 'free') cursor = { d: CURSOR_BARS, at: [0, 0] };
  else if (s.cursor) {
    cursorP = s.cursor === 'home' ? HOME : at(s.cursor);
    cursor = { d: CURSOR_BARS, at: local(cursorP) };
    const az = (cursorP[0] - AZ0) / PX_DEG, nm = ((R0 - cursorP[1]) / RH) * s.scale;
    const [hi, lo] = limits(nm, 0, s.bars);
    words.push(c(w(pad(hi, 2), cursorP[0] + 18, cursorP[1] - 12.5, 'start'), 'cyan'), w(pad(lo, 2), cursorP[0] + 18, cursorP[1] + 13.5, 'start'));
    const gg = geo('lead', t, h);
    const cx = gg.jx + nm * Math.sin(rad(h + az)), cy = gg.jy + nm * Math.cos(rad(h + az));
    words.push(w(pad(Math.round((deg(Math.atan2(cx, cy - 10)) + 360) % 360) || 360, 3), 112.5, 440, 'start'), w(pad(Math.round(Math.hypot(cx, cy - 10)), 2), 151, 440, 'start'));
  }
  if (s.stt && toi) {
    const g = geo(toi, t, h), cx = g.jx + g.nm * Math.sin(rad(h + g.az)), cy = g.jy + g.nm * Math.cos(rad(h + g.az));
    words.push(w(pad(Math.round((deg(Math.atan2(cx, cy - 10)) + 360) % 360) || 360, 3), 112.5, 440, 'start'), w(pad(Math.round(Math.hypot(cx, cy - 10)), 2), 151, 440, 'start'));
  }
  paths.push({ d: cyan.join(''), c: 'cyan' });
  const page: Page = { ...base, words, marks, fills, paths, ...(cursor ? { cursor } : {}) };
  if (s.lim === 'cursor' && cursor) {
    const d = LIM[s.az] * PX_DEG, q = (x: number, y: number) => local([SC[0] + x, y]).join(' ');
    page.cursorX = { d: `M${q(-d, 144)}L${q(-d, 511)}M${q(d, 144)}L${q(d, 511)}`, c: 'cyan' };
  }
  return page;
}
const all = (sym: Sym): Partial<Record<Key, Sym>> => ({ lead: sym, wing: sym, mid: sym, single: sym });
const T = { sub: 'TWS', scale: 80, az: 'A6', bars: 4 } as const;
const TWO: Record<string, [string, Spec]> = {
  /* Track While Scan: RWS, VSR on the way, TWS searching, then the tracks formed. */
  'tw-rws': ['RWS 80 NM A6, four contacts', { scale: 80, sub: 'RWS', az: 'A6', bars: 4, syms: all('search'), cursor: 'home', ant: 20 }],
  'tw-vsr': ['VSR (one press of OSB 2): only the nose-on contacts', { scale: 80, sub: 'VSR', az: 'A6', bars: 4, syms: { lead: 'search', wing: 'search', mid: 'search' }, cursor: 'home', ant: -15 }],
  'tw-search': ['TWS: search targets, tracks not yet formed', { ...T, syms: all('search'), cursor: 'home', ant: 30 }],
  'tw-tracks': ['TWS: four track targets', { ...T, syms: all('track'), cursor: 'home', ant: -25 }],
  'tw-cur-free': ['TWS: cursor being slewed', { ...T, syms: all('track'), cursor: 'free', ant: 10 }],
  'tw-cur-lead': ['TWS: cursor on the lead track', { ...T, syms: all('track'), cursor: 'lead', ant: -18 }],
  'tw-lead-sys': ['TWS: the lead upgraded to a system track, A2 3B about it', { scale: 80, sub: 'TWS', az: 'A2', bars: 3, syms: { ...all('track'), lead: 'system' }, cursor: 'lead', lim: 'cursor', ant: -12 }],
  'tw-wing-free': ['TWS: cursor being slewed to the wingman', { ...T, syms: { ...all('track'), lead: 'system' }, cursor: 'free', ant: 6 }],
  'tw-cur-wing': ['TWS: cursor on the wingman track', { ...T, syms: { ...all('track'), lead: 'system' }, cursor: 'wing', ant: -4 }],
  'tw-two-sys': ['TWS: lead and wingman system tracks, A2 3B about the cursor', { scale: 80, sub: 'TWS', az: 'A2', bars: 3, syms: { ...all('track'), lead: 'system', wing: 'system' }, cursor: 'wing', lim: 'cursor', ant: -8 }],
  'tw-bug-lead': ['TWS: the lead bugged, A2 3B about it', { scale: 80, sub: 'TWS', az: 'A2', bars: 3, syms: { ...all('track'), lead: 'bug', wing: 'system' }, cursor: 'wing', lim: 'lead', ant: -14 }],
  'tw-bug-wing': ['TWS: the wingman bugged, A2 3B about it', { scale: 80, sub: 'TWS', az: 'A2', bars: 3, syms: { ...all('track'), lead: 'system', wing: 'bug' }, cursor: 'wing', lim: 'wing', ant: -4 }],
  'tw-down': ['TWS: back to four track targets', { ...T, syms: all('track'), cursor: 'wing', ant: 12 }],
  'tw-purged': ['TWS: tracks purged, search targets only', { ...T, syms: all('search'), cursor: 'wing', ant: -20 }],
  'tw-rws-end': ['RWS again, the cursor where it was left', { scale: 80, sub: 'RWS', az: 'A6', bars: 4, syms: all('search'), cursor: 'wing', ant: 25 }],
  /* Two targets: SAM on the lead, DT SAM with the wingman, the swap, DTT inside 10 NM, STT. Only the pair is inside the A3 scan. */
  'dt-start': ['RWS 80 NM A3, the cursor on the lead', { scale: 80, sub: 'RWS', az: 'A3', bars: 4, syms: { lead: 'search', wing: 'search' }, cursor: 'lead', lim: 'cursor', ant: -14 }],
  'dt-sam': ['SAM: the lead bugged, primary', { scale: 80, sub: 'RWS', az: 'A3', bars: 4, syms: { lead: 'bugd', wing: 'search' }, cursor: 'lead', lim: 'cursor', sam: ['lead'], ant: -20 }],
  'dt-free': ['SAM: cursor being slewed to the wingman', { scale: 80, sub: 'RWS', az: 'A3', bars: 4, syms: { lead: 'bugd', wing: 'search' }, cursor: 'free', lim: 'cursor', sam: ['lead'], ant: 3 }],
  'dt-wing': ['SAM: cursor on the wingman', { scale: 80, sub: 'RWS', az: 'A3', bars: 4, syms: { lead: 'bugd', wing: 'search' }, cursor: 'wing', lim: 'cursor', sam: ['lead'], ant: -9 }],
  'dt-dtsam': ['DT SAM: the lead primary, the wingman secondary', { scale: 80, sub: 'RWS', az: 'A3', bars: 4, syms: { lead: 'bugd', wing: 'second' }, cursor: 'wing', lim: 'cursor', sam: ['lead', 'wing'], ant: -16 }],
  'dt-swap': ['DT SAM: the wingman primary, the lead secondary', { scale: 80, sub: 'RWS', az: 'A3', bars: 4, syms: { lead: 'second', wing: 'bugd' }, cursor: 'wing', lim: 'cursor', sam: ['lead', 'wing'], ant: -5 }],
  'dt-dtt': ['DTT: both inside 10 NM, 20 NM scale', { scale: 20, sub: 'RWS', az: 'A3', bars: 4, syms: { lead: 'second', wing: 'bugd' }, cursor: 'lead', t: 138, hdg: 347, ten: true, ant: 3 }],
  'dt-stt': ['STT on the lead', { scale: 20, sub: 'RWS', az: 'A3', bars: 4, syms: { lead: 'bugd' }, stt: true, t: 138, hdg: 347, ant: 0 }],
};
export const twoPages: Page[] = Object.entries(TWO).map(([id, [, s]]) => two(id, s));
export const twoPageLabels: Record<string, string> = Object.fromEntries(Object.entries(TWO).map(([id, [label]]) => [id, `FCR ${label}`]));

/* ------------------------------------------------------------------- helpers */

/** A hint ring round a contact (px about the p. 394 centre) at a time and heading. */
export const twoSpot = (k: Key, scale: Scale = 80, t = 0, h = 360, r = 14) => {
  const g = geo(k, t, h), [x, y] = scope(g.az, g.nm, scale);
  return fcrBox(x - r, y - r, x + r, y + r);
};
const slewBetween = (from: P, to: P) => ({
  start: local(from), target: local(to), reach: f(mm(9)), speed: f(mm(140)),
  box: [...local([125, 125]), ...local([537, 500])] as [number, number, number, number],
});
const pos = (k: Key): P => { const g = geo(k); return scope(g.az, g.nm, 80); };
/** Slews: the cursor from home to the lead, from the lead to the wingman (TWS); from the lead to the wingman (DT SAM). */
export const TWO_SLEW = { lead: slewBetween(HOME, pos('lead')), wing: slewBetween(pos('lead'), pos('wing')) };
/** A hint ring round a contact's collision-course cross (CATA). */
export const twoCata = (k: Key, scale: Scale = 80, t = 0, h = 360) => {
  const g = geo(k, t, h), [x, y] = scope(g.cataAz, g.nm, scale);
  return fcrBox(x - 10, y - 10, x + 10, y + 10);
};
/** Hint rings on the two scan limit lines (half-width `half` degrees) about a contact. */
export const twoLines = (k: Key, half: number, scale: Scale = 80) => {
  const g = geo(k), x = scope(g.az, g.nm, scale)[0], d = half * PX_DEG;
  return [fcrBox(x - d - 5, 150, x - d + 5, 505), fcrBox(x + d - 5, 150, x + d + 5, 505)];
};
