// A generic flight instrument panel in SVG: the "basic T" layout, with the
// attitude indicator top centre, airspeed to its left, altimeter to its
// right and the heading (HSI) below it, plus a turn and slip indicator, a
// vertical speed indicator and a power gauge. Generic, not any one aircraft.
// Used by the attitude instrument flying and instrument procedures pages.
import { drawHsi, el, polar } from './hsi.mjs';

const D = Math.PI / 180;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
let uid = 0;

function dial(svg, cx, cy, r) {
  svg.append(el('circle', { cx, cy, r: r + 6, class: 'bezel' }), el('circle', { cx, cy, r, class: 'face' }));
}
function needle(svg, cx, cy, len, deg, cls = 'needle', back = 10) {
  const [x, y] = polar(cx, cy, len, deg), [bx, by] = polar(cx, cy, back, deg + 180);
  svg.append(el('line', { x1: bx, y1: by, x2: x, y2: y, class: cls }));
}
function ticks(svg, cx, cy, r, from, to, step, len, cls = 'tick') {
  for (let d = from; d <= to + 1e-9; d += step) {
    const [x1, y1] = polar(cx, cy, r, d), [x2, y2] = polar(cx, cy, r - len, d);
    svg.append(el('line', { x1, y1, x2, y2, class: cls }));
  }
}
function label(svg, cx, cy, r, deg, text, cls = 'num') {
  const [x, y] = polar(cx, cy, r, deg);
  svg.append(el('text', { x, y: y + 4, class: cls, 'text-anchor': 'middle' }, text));
}
function caption(svg, cx, y, text) {
  svg.append(el('text', { x: cx, y, class: 'cap', 'text-anchor': 'middle' }, text));
}

/**
 * Attitude indicator. Pitch in degrees (nose up positive), bank in degrees
 * (right positive). `ils` adds localizer and glide slope bars in dots.
 * `failed` shows an OFF flag.
 */
export function adi(svg, cx, cy, r, { pitch = 0, bank = 0, ils, failed = false } = {}) {
  const id = `adi-clip-${++uid}`;
  const k = r / 28; // px per degree of pitch
  const defs = el('defs');
  const clip = el('clipPath', { id });
  clip.append(el('circle', { cx, cy, r }));
  defs.append(clip);
  svg.append(defs, el('circle', { cx, cy, r: r + 6, class: 'bezel' }));
  const ball = el('g', { 'clip-path': `url(#${id})` });
  const horizon = el('g', { transform: `rotate(${-bank} ${cx} ${cy}) translate(0 ${pitch * k})` });
  horizon.append(
    el('rect', { x: cx - 4 * r, y: cy - 4 * r, width: 8 * r, height: 4 * r, class: 'sky' }),
    el('rect', { x: cx - 4 * r, y: cy, width: 8 * r, height: 4 * r, class: 'ground' }),
    el('line', { x1: cx - 4 * r, y1: cy, x2: cx + 4 * r, y2: cy, class: 'horizon' }),
  );
  for (let p = -90; p <= 90; p += 5) {
    if (!p) continue;
    const y = cy - p * k, w = p % 10 ? r * 0.14 : r * 0.3;
    horizon.append(el('line', { x1: cx - w, y1: y, x2: cx + w, y2: y, class: 'ladder' }));
    if (!(p % 10)) {
      horizon.append(el('text', { x: cx - w - 4, y: y + 4, class: 'ladnum', 'text-anchor': 'end' }, String(Math.abs(p))));
      horizon.append(el('text', { x: cx + w + 4, y: y + 4, class: 'ladnum' }, String(Math.abs(p))));
    }
  }
  ball.append(horizon);
  svg.append(ball);
  // Bank scale: 10, 20, 30, 60 and 90° each side, fixed to the case.
  for (const b of [-90, -60, -30, -20, -10, 10, 20, 30, 60, 90]) {
    const len = Math.abs(b) % 30 ? 6 : 11;
    const [x1, y1] = polar(cx, cy, r, b), [x2, y2] = polar(cx, cy, r - len, b);
    svg.append(el('line', { x1, y1, x2, y2, class: 'bankmark' }));
  }
  svg.append(el('path', { d: `M${cx} ${cy - r} l-6 -9 h12 z`, class: 'bankzero' }));
  // Sky pointer: turns with the horizon, so it always points up the sky.
  const [px, py] = polar(cx, cy, r - 2, -bank);
  svg.append(el('path', { d: 'M0 0 L-7 11 L7 11 Z', class: 'skyptr', transform: `translate(${px} ${py}) rotate(${-bank})` }));
  // Miniature aircraft, fixed.
  const w = r * 0.55;
  svg.append(el('path', { d: `M${cx - w} ${cy} H${cx - w * 0.35} L${cx - w * 0.18} ${cy + 9} L${cx} ${cy} L${cx + w * 0.18} ${cy + 9} L${cx + w * 0.35} ${cy} H${cx + w}`, class: 'mini' }));
  svg.append(el('circle', { cx, cy, r: 3, class: 'minidot' }));
  if (ils) {
    const dot = r * 0.2;
    for (const kd of [-2, -1, 1, 2]) {
      svg.append(el('circle', { cx: cx + kd * dot, cy: cy + r * 0.8, r: 2.5, class: 'ilsdot' }));
      svg.append(el('circle', { cx: cx + r * 0.8, cy: cy + kd * dot, r: 2.5, class: 'ilsdot' }));
    }
    const lx = cx + clamp(ils.loc, -2, 2) * dot, gy = cy - clamp(ils.gs, -2, 2) * dot;
    svg.append(el('line', { x1: lx, y1: cy - r * 0.6, x2: lx, y2: cy + r * 0.6, class: 'ilsbar' }));
    svg.append(el('line', { x1: cx - r * 0.6, y1: gy, x2: cx + r * 0.6, y2: gy, class: 'ilsbar' }));
  }
  if (failed) {
    svg.append(el('rect', { x: cx - r * 0.75, y: cy - r * 0.62, width: 34, height: 18, class: 'flag' }));
    svg.append(el('text', { x: cx - r * 0.75 + 17, y: cy - r * 0.62 + 13, class: 'flagtxt', 'text-anchor': 'middle' }, 'OFF'));
  }
}

// Airspeed: 0 to 400 kt over 320° of the dial, needle from the top.
export function asi(svg, cx, cy, r, kt) {
  dial(svg, cx, cy, r);
  const a = (v) => (clamp(v, 0, 400) / 400) * 320;
  ticks(svg, cx, cy, r, 0, 320, 8, 6);
  for (let v = 0; v <= 400; v += 50) {
    ticks(svg, cx, cy, r, a(v), a(v), 1, 12, 'tick major');
    label(svg, cx, cy, r - 24, a(v), String(v));
  }
  svg.append(el('text', { x: cx, y: cy + r * 0.45, class: 'unit', 'text-anchor': 'middle' }, 'KNOTS'));
  needle(svg, cx, cy, r - 8, a(kt));
}

// Altimeter: long needle hundreds, short needle thousands, and a counter.
export function altimeter(svg, cx, cy, r, ft) {
  dial(svg, cx, cy, r);
  ticks(svg, cx, cy, r, 0, 358, 7.2, 6);
  for (let n = 0; n < 10; n++) {
    ticks(svg, cx, cy, r, n * 36, n * 36, 1, 12, 'tick major');
    label(svg, cx, cy, r - 24, n * 36, String(n));
  }
  const f = Math.max(0, ft);
  needle(svg, cx, cy, r * 0.5, ((f % 10000) / 10000) * 360, 'needle wide', 6);
  needle(svg, cx, cy, r - 8, ((f % 1000) / 1000) * 360);
  svg.append(el('rect', { x: cx - 30, y: cy + r * 0.36, width: 60, height: 20, class: 'window' }));
  svg.append(el('text', { x: cx, y: cy + r * 0.36 + 15, class: 'counter', 'text-anchor': 'middle' }, (Math.round(f / 10) * 10).toLocaleString('en-US')));
}

// Vertical speed: zero at nine o'clock, ±4,000 ft/min over ±170°.
export function vsi(svg, cx, cy, r, fpm) {
  dial(svg, cx, cy, r);
  const a = (v) => 270 + (clamp(v, -4000, 4000) / 4000) * 170;
  for (let v = -4000; v <= 4000; v += 500) ticks(svg, cx, cy, r, a(v), a(v), 1, v % 1000 ? 6 : 12, v % 1000 ? 'tick' : 'tick major');
  for (let v = -3; v <= 3; v++) label(svg, cx, cy, r - 24, a(v * 1000), String(Math.abs(v)));
  svg.append(el('text', { x: cx - r * 0.42, y: cy - r * 0.3, class: 'unit', 'text-anchor': 'middle' }, 'UP'));
  svg.append(el('text', { x: cx - r * 0.42, y: cy + r * 0.38, class: 'unit', 'text-anchor': 'middle' }, 'DOWN'));
  svg.append(el('text', { x: cx + r * 0.25, y: cy + r * 0.3, class: 'unit', 'text-anchor': 'middle' }, '×1000 FT/MIN'));
  needle(svg, cx, cy, r - 8, a(fpm));
}

// Turn and slip: the needle is on the mark at standard rate (3°/s).
export function turnSlip(svg, cx, cy, r, rate, slip = 0) {
  dial(svg, cx, cy, r);
  const mark = 22;
  for (const d of [-mark, 0, mark]) ticks(svg, cx, cy, r, d, d, 1, d ? 16 : 10, 'tick major');
  svg.append(el('text', { x: cx - r * 0.55, y: cy - r * 0.05, class: 'unit', 'text-anchor': 'middle' }, 'L'));
  svg.append(el('text', { x: cx + r * 0.55, y: cy - r * 0.05, class: 'unit', 'text-anchor': 'middle' }, 'R'));
  svg.append(el('text', { x: cx, y: cy + r * 0.88, class: 'unit', 'text-anchor': 'middle' }, 'MARK = 3°/S'));
  needle(svg, cx, cy + r * 0.25, r * 0.95, clamp((rate / 3) * mark, -45, 45), 'needle wide', 0);
  // Inclinometer: the ball sits in a curved tube, centred when coordinated.
  const ty = cy + r * 0.55, tw = r * 0.55;
  svg.append(el('path', { d: `M${cx - tw} ${ty - 4} Q${cx} ${ty + 10} ${cx + tw} ${ty - 4}`, class: 'tube' }));
  for (const s of [-1, 1]) svg.append(el('line', { x1: cx + s * 9, y1: ty - 6, x2: cx + s * 9, y2: ty + 10, class: 'tick' }));
  const bx = cx + clamp(slip, -1, 1) * tw * 0.8;
  svg.append(el('circle', { cx: bx, cy: ty + 3 - Math.abs(slip) * 4, r: 6, class: 'ball' }));
}

// Power: a vertical bar, 0 to 100 %.
export function power(svg, x, y, h, pct) {
  const w = 18, p = clamp(pct, 0, 100) / 100;
  svg.append(el('rect', { x, y, width: w, height: h, class: 'face' }));
  svg.append(el('rect', { x, y: y + h * (1 - p), width: w, height: h * p, class: 'powerfill' }));
  for (let v = 0; v <= 100; v += 25) svg.append(el('line', { x1: x + w, y1: y + h * (1 - v / 100), x2: x + w + 6, y2: y + h * (1 - v / 100), class: 'tick' }));
  svg.append(el('text', { x: x + w / 2, y: y + h + 16, class: 'cap', 'text-anchor': 'middle' }, 'POWER'));
  svg.append(el('text', { x: x + w / 2, y: y - 6, class: 'unit', 'text-anchor': 'middle' }, `${Math.round(pct)}%`));
}

// Where each instrument sits on the panel. Wide: the basic T in a 700 × 470
// box. Narrow (phones): two columns, so the dials stay readable.
export const PANEL = Object.freeze({
  width: 700, height: 470,
  power: { x: 22, y: 140, h: 190 },
  asi: { cx: 165, cy: 120, r: 88, name: 'AIRSPEED' },
  adi: { cx: 385, cy: 120, r: 92, name: 'ATTITUDE' },
  alt: { cx: 605, cy: 120, r: 88, name: 'ALTIMETER' },
  turn: { cx: 165, cy: 345, r: 80, name: 'TURN AND SLIP' },
  hsi: { cx: 385, cy: 345, r: 78, name: 'HEADING (HSI)' },
  vsi: { cx: 605, cy: 345, r: 80, name: 'VERTICAL SPEED' },
});
export const PANEL_NARROW = Object.freeze({
  width: 470, height: 700,
  power: { x: 14, y: 160, h: 380 },
  asi: { cx: 150, cy: 112, r: 86, name: 'AIRSPEED' },
  adi: { cx: 360, cy: 112, r: 88, name: 'ATTITUDE' },
  hsi: { cx: 150, cy: 345, r: 74, name: 'HEADING (HSI)' },
  alt: { cx: 360, cy: 345, r: 86, name: 'ALTIMETER' },
  turn: { cx: 150, cy: 578, r: 80, name: 'TURN AND SLIP' },
  vsi: { cx: 360, cy: 578, r: 80, name: 'VERTICAL SPEED' },
});
// Phones get the narrow layout; decided from the drawn width.
export const isNarrow = (svg) => (svg.clientWidth || svg.parentElement?.clientWidth || 999) < 520;

export const CONTROL = new Set(['adi', 'power']);

/**
 * Draw the whole panel from a flight state. `highlight` rings one
 * instrument (the crosscheck), `groups` tags each instrument control or
 * performance, `ils` adds needles to the ADI and HSI, `dme` a distance on
 * the HSI.
 */
export function drawPanel(svg, s, { highlight, groups = true, ils, course, dme, dimmed = [] } = {}) {
  const at = isNarrow(svg) ? PANEL_NARROW : PANEL;
  svg.setAttribute('viewBox', `0 0 ${at.width} ${at.height}`);
  svg.replaceChildren(el('rect', { x: 0, y: 0, width: at.width, height: at.height, class: 'panel' }));
  const ring = (key) => {
    const p = at[key];
    if (key === 'power') return el('rect', { x: p.x - 8, y: p.y - 26, width: 34, height: p.h + 52, class: 'scanring', rx: 6 });
    return el('circle', { cx: p.cx, cy: p.cy, r: p.r + 14, class: 'scanring' });
  };
  power(svg, at.power.x, at.power.y, at.power.h, s.power);
  asi(svg, at.asi.cx, at.asi.cy, at.asi.r, s.speed);
  adi(svg, at.adi.cx, at.adi.cy, at.adi.r, { pitch: s.pitch, bank: s.bank, ils, failed: s.adiFailed });
  altimeter(svg, at.alt.cx, at.alt.cy, at.alt.r, s.altitude);
  turnSlip(svg, at.turn.cx, at.turn.cy, at.turn.r, s.rate, s.slip ?? 0);
  const hsiOpts = { heading: s.heading, course: course ?? s.bug ?? s.heading, toFrom: false, dots: ils?.loc ?? 0, gs: ils?.gs };
  if (s.bug !== undefined) hsiOpts.bug = s.bug;
  if (dme !== undefined) hsiOpts.dme = dme;
  drawHsi(svg, at.hsi.cx, at.hsi.cy, at.hsi.r, hsiOpts);
  for (const key of ['asi', 'adi', 'alt', 'turn', 'hsi', 'vsi']) {
    const p = at[key];
    caption(svg, p.cx, p.cy + p.r + 22, p.name);
    if (groups) {
      const control = CONTROL.has(key);
      svg.append(el('text', { x: p.cx, y: p.cy + p.r + 34, class: control ? 'grp control' : 'grp', 'text-anchor': 'middle' }, control ? 'CONTROL' : 'PERFORMANCE'));
    }
  }
  vsi(svg, at.vsi.cx, at.vsi.cy, at.vsi.r, s.vsi);
  if (groups) svg.append(el('text', { x: at.power.x + 9, y: at.power.y + at.power.h + 28, class: 'grp control', 'text-anchor': 'middle' }, 'CONTROL'));
  for (const key of dimmed) {
    const p = at[key];
    if (p?.cx) svg.append(el('circle', { cx: p.cx, cy: p.cy, r: p.r + 7, class: 'dimmer' }));
  }
  if (highlight) svg.append(ring(highlight));
}
