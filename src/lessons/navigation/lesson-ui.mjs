// Presentation for the Air Navigation module's interactive figures. Geometry
// and rules come from lesson-model.mjs; this file reads inputs and draws.
import {
  ARC_LEAD_TABLE, HSI_BAR, arcLeads, courseFlight, chordArc, diff, formatDD, formatDM, formatDMS, headings, hsi,
  norm, parseCoordinate, pointToPoint, relativeBearing, resolution,
  routeFlight, tacanPosition, toMGRS, toUTM, windTriangle,
} from './lesson-model.mjs';
import { quickQuiz, termQuiz, withDistractors } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const D = Math.PI / 180;
const r0 = (v) => Math.round(v).toLocaleString('en-US');
// North is written 360, as headings, courses and radials are.
const deg3 = (v) => String(Math.round(norm(v)) % 360 || 360).padStart(3, '0');
// Hours:minutes or minutes:seconds, rounded as a whole so 59.6 never prints as :60.
const clock = (units) => { const t = Math.round(units * 60); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
function para(text, cls) {
  const p = document.createElement('p');
  p.textContent = text;
  if (cls) p.className = cls;
  return p;
}
const num = (root, name) => +root.querySelector(`[name="${name}"]`).value;
const field = (root, name) => root.querySelector(`[name="${name}"]`);
function show(root, name, text) {
  const o = root.querySelector(`output[for="${name}"]`);
  if (o) o.textContent = text;
}
// Screen point of a compass direction at radius r around (cx, cy), with
// `up` the direction drawn at the top.
const polar = (cx, cy, r, dir, up = 0) => [cx + r * Math.sin((dir - up) * D), cy - r * Math.cos((dir - up) * D)];
// Plan-view jet, nose up before rotation.
const JET = 'M0 -11 L2 -4 L10 2 L10 4 L2 2 L1.5 8 L5 10 L5 11.5 L0 10.5 L-5 11.5 L-5 10 L-1.5 8 L-2 2 L-10 4 L-10 2 L-2 -4 Z';
const jet = (x, y, heading, cls = 'acft', scale = 1) => el('path', { d: JET, class: cls, transform: `translate(${x} ${y}) rotate(${heading}) scale(${scale})` });
// A station symbol: hexagon for TACAN-type stations.
function station(svg, x, y, label = 'STATION') {
  const pts = [...Array(6)].map((_, k) => polar(x, y, 7, 30 + k * 60).join(',')).join(' ');
  svg.append(el('polygon', { points: pts, class: 'box' }), el('circle', { cx: x, cy: y, r: 1.6, class: 'fill' }));
  if (label) svg.append(el('text', { x: x + 10, y: y - 9, class: 'lbl small' }, label));
}
function arrow(svg, x1, y1, x2, y2, cls = 'ln') {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 8;
  svg.append(el('line', { x1, y1, x2, y2, class: cls }));
  svg.append(el('path', { d: `M${x2} ${y2} L${x2 - h * Math.cos(a - 0.4)} ${y2 - h * Math.sin(a - 0.4)} L${x2 - h * Math.cos(a + 0.4)} ${y2 - h * Math.sin(a + 0.4)} Z`, class: cls.includes('on') ? 'pointer' : 'fill' }));
}
// Compass rose: ticks every 10°, cardinal letters and 30° numbers. `up` is
// the direction at the top (heading-up cards rotate with heading).
function rose(svg, cx, cy, r, up = 0, { labels = true } = {}) {
  svg.append(el('circle', { cx, cy, r, class: 'frame' }));
  for (let d = 0; d < 360; d += 5) {
    const len = d % 30 === 0 ? 10 : d % 10 === 0 ? 6 : 3;
    const [x1, y1] = polar(cx, cy, r, d, up), [x2, y2] = polar(cx, cy, r - len, d, up);
    svg.append(el('line', { x1, y1, x2, y2, class: 'thin' }));
  }
  if (!labels) return;
  for (let d = 0; d < 360; d += 30) {
    const [x, y] = polar(cx, cy, r - 20, d, up);
    const text = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[d] ?? String(d / 10);
    svg.append(el('text', { x, y: y + 4, class: `lbl${d % 90 ? ' small' : ''}`, 'text-anchor': 'middle', transform: `rotate(${d - up} ${x} ${y})` }, text));
  }
}

/* ---------- Figure 1: write a position ---------- */
const COORD_PRESETS = {
  example: ['N30 21.00', 'W087 19.20'],
  equator: ['0', '0'],
  south: [`S33 51 24`, `E151 12 55`],
  north: ['N60 30', 'E005 30'],
};
function setupCoords(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), rows = root.querySelector('tbody');
  const lat = field(root, 'lat'), lon = field(root, 'lon');
  function row(name, value, size) {
    const tr = document.createElement('tr');
    const th = Object.assign(document.createElement('th'), { scope: 'row', textContent: name });
    tr.append(th, Object.assign(document.createElement('td'), { textContent: value, className: 'mono' }), Object.assign(document.createElement('td'), { textContent: size }));
    return tr;
  }
  const m = (v) => (v >= 100 ? `${r0(v)} m` : v >= 10 ? `${v.toFixed(0)} m` : `${v.toFixed(1)} m`);
  function draw() {
    let la, lo;
    try {
      la = parseCoordinate(lat.value, 'lat');
      lo = parseCoordinate(lon.value, 'lon');
    } catch (error) {
      out.replaceChildren(para(error.message, 'bad'));
      return;
    }
    const sec = num(root, 'sec'), mins = num(root, 'mins'), digits = num(root, 'digits');
    const res = resolution(la, { dmsDecimals: sec, dmDecimals: mins, ddDecimals: 4, mgrsDigits: digits });
    const size = (r) => `${m(r.ns)} north–south, ${m(r.ew)} east–west`;
    const lines = [
      row('Degrees, minutes, seconds', `${formatDMS(la, 'lat', sec)} ${formatDMS(lo, 'lon', sec)}`, size(res.dms)),
      row('Degrees, decimal minutes', `${formatDM(la, 'lat', mins)} ${formatDM(lo, 'lon', mins)}`, size(res.dm)),
      row('Decimal degrees', `${formatDD(la, 'lat')} ${formatDD(lo, 'lon')}`, size(res.dd)),
    ];
    let grid = null;
    try {
      grid = toMGRS(la, lo, digits);
      lines.push(row(`MGRS, ${digits} digits`, grid.text, `${m(res.mgrs)} square`));
    } catch (error) {
      lines.push(row('MGRS', 'none: polar area', 'UPS, not covered here'));
    }
    rows.replaceChildren(...lines);
    svg.replaceChildren();
    if (!grid) {
      out.replaceChildren(para('MGRS letters cover 80°S to 84°N here; the polar areas use the UPS grid.'));
      return;
    }
    const { easting, northing } = toUTM(la, lo);
    // Three zoom panels: the 100 km square, the 10 km square, the 1 km square.
    const panels = [[100000, '100,000 M SQUARE'], [10000, '10,000 M'], [1000, '1,000 M']];
    panels.forEach(([size, label], k) => {
      const X = 20 + k * 210, Y = 30, W = 180;
      const e = (easting % size) / size, n = (northing % size) / size;
      svg.append(el('text', { x: X, y: 20, class: 'lbl small' }, label));
      svg.append(el('rect', { x: X, y: Y, width: W, height: W, class: 'frame' }));
      for (let i = 1; i < 10; i++) {
        svg.append(el('line', { x1: X + i * W / 10, y1: Y, x2: X + i * W / 10, y2: Y + W, class: 'grid' }));
        svg.append(el('line', { x1: X, y1: Y + i * W / 10, x2: X + W, y2: Y + i * W / 10, class: 'grid' }));
      }
      // The next panel's square, the one this reference's digits name.
      const level = Math.log10(100000 / size);
      const named = digits / 2 > level;
      if (named) svg.append(el('rect', { x: X + Math.floor(e * 10) * W / 10, y: Y + W - (Math.floor(n * 10) + 1) * W / 10, width: W / 10, height: W / 10, class: 'box on', opacity: 0.35 }));
      svg.append(el('circle', { cx: X + e * W, cy: Y + W - n * W, r: 4, class: 'pointer' }));
      if (k === 0) svg.append(el('text', { x: X + 4, y: Y + W - 6, class: 'lbl small' }, grid.square));
      if (k < 2) svg.append(el('path', { d: `M${X + W + 6} ${Y + W / 2} L${X + W + 24} ${Y + W / 2}`, class: 'thin' }));
    });
    svg.append(el('text', { x: 20, y: 236, class: 'lbl small' }, 'SHADED: THE SQUARE THE NEXT DIGIT PAIR NAMES  ·  DOT: THE POSITION  ·  READ RIGHT, THEN UP'));
    out.replaceChildren(
      para(`${grid.gzd} is the grid zone (UTM zone ${parseInt(grid.gzd, 10)}, latitude band ${grid.gzd.slice(-1)}); ${grid.square} names the 100,000-metre square; ${grid.easting || '—'} is the easting and ${grid.northing || '—'} the northing within it.`),
      para(`Each added pair of digits divides the square by ten. The digits are cut off, not rounded, so the reference names the south-west corner of a ${m(res.mgrs)} square that contains the position.`, 'derived'),
    );
  }
  root.querySelectorAll('input, select').forEach((i) => i.addEventListener('input', draw));
  root.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => {
    [lat.value, lon.value] = COORD_PRESETS[b.dataset.preset];
    draw();
  }));
  draw();
}

/* ---------- Figure 2: headings and bearings ---------- */
function setupCompass(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const th = num(root, 'th'), v = num(root, 'var'), dev = num(root, 'dev'), tb = num(root, 'tb');
    show(root, 'th', `${deg3(th)}°`);
    show(root, 'var', v ? `${Math.abs(v)}° ${v > 0 ? 'east' : 'west'}` : 'none');
    show(root, 'dev', dev ? `${dev > 0 ? '+' : '−'}${Math.abs(dev)}°` : 'none');
    show(root, 'tb', `${deg3(tb)}°`);
    const h = headings({ trueHeading: th, variation: v, deviation: dev });
    const rb = relativeBearing(th, tb);
    svg.replaceChildren();
    const cx = 170, cy = 160, r = 130;
    rose(svg, cx, cy, r, 0);
    // True and magnetic north.
    arrow(svg, cx, cy, ...polar(cx, cy, r - 30, 0), 'ln heavy');
    svg.append(el('text', { x: cx + 6, y: cy - r + 44, class: 'lbl small' }, 'TN'));
    if (v) {
      arrow(svg, cx, cy, ...polar(cx, cy, r - 40, v), 'ln dashed');
      const [mx, my] = polar(cx, cy, r - 52, v);
      svg.append(el('text', { x: mx + 6, y: my, class: 'lbl small' }, 'MN'));
    }
    // Object and its bearing line; relative bearing arc from the nose.
    const [ox, oy] = polar(cx, cy, r - 4, tb);
    svg.append(el('line', { x1: cx, y1: cy, x2: ox, y2: oy, class: 'ln dashed on' }));
    svg.append(el('path', { d: 'M0 -9 L8 6 L-8 6 Z', class: 'pointer', transform: `translate(${ox} ${oy})` }));
    const arcR = 46, [ax, ay] = polar(cx, cy, arcR, th), [bx, by] = polar(cx, cy, arcR, tb);
    svg.append(el('path', { d: `M${ax} ${ay} A${arcR} ${arcR} 0 ${rb > 180 ? 1 : 0} 1 ${bx} ${by}`, class: 'ln on' }));
    const [lx, ly] = polar(cx, cy, arcR + 14, th + rb / 2);
    svg.append(el('text', { x: lx, y: ly + 4, class: 'lbl small on', 'text-anchor': 'middle' }, 'RB'));
    svg.append(el('line', { x1: cx, y1: cy, x2: polar(cx, cy, r - 12, th)[0], y2: polar(cx, cy, r - 12, th)[1], class: 'thin dotted' }));
    svg.append(jet(cx, cy, th, 'acft', 1.6));
    // Readout panel.
    const X = 340;
    const lines = [
      ['TRUE HEADING', `${deg3(h.true)}°`], ['VARIATION', v ? `${Math.abs(v)}° ${v > 0 ? 'E: SUBTRACT' : 'W: ADD'}` : '0°'],
      ['MAGNETIC HEADING', `${deg3(h.magnetic)}°`], ['DEVIATION (CARD)', dev ? `${dev > 0 ? '+' : '−'}${Math.abs(dev)}°` : '0°'],
      ['COMPASS HEADING', `${deg3(h.compass)}°`], ['', ''], ['TRUE BEARING TO OBJECT', `${deg3(tb)}°`],
      ['MAGNETIC BEARING', `${deg3(tb - v)}°`], ['RELATIVE BEARING', `${deg3(rb)}°`],
    ];
    lines.forEach(([k, val], i) => {
      if (!k) return;
      svg.append(el('text', { x: X, y: 40 + i * 28, class: 'lbl small' }, k));
      svg.append(el('text', { x: 620, y: 40 + i * 28, class: `lbl${k === 'VARIATION' ? '' : ' big'} mono${/COMPASS|RELATIVE/.test(k) ? ' on' : ''}`, 'text-anchor': 'end' }, val));
    });
    out.replaceChildren(
      para(`Fly ${deg3(h.compass)}° on the compass for a true heading of ${deg3(h.true)}°. The object is ${deg3(rb)}° clockwise from the nose: true bearing ${deg3(tb)}° minus true heading ${deg3(th)}°.`),
    );
  }
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
}

/* ---------- Figure 3: wind triangle ---------- */
function setupWind(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const course = num(root, 'tc'), tas = num(root, 'tas'), wf = num(root, 'wf'), ws = num(root, 'ws'), v = num(root, 'var'), dist = num(root, 'dist');
    show(root, 'tc', `${deg3(course)}°`); show(root, 'tas', `${tas} kt`); show(root, 'wf', `${deg3(wf)}°`); show(root, 'ws', `${ws} kt`);
    show(root, 'var', v ? `${Math.abs(v)}° ${v > 0 ? 'E' : 'W'}` : 'none'); show(root, 'dist', `${dist} NM`);
    svg.replaceChildren();
    let w;
    try {
      w = windTriangle({ course, tas, windFrom: wf, windSpeed: ws });
    } catch (error) {
      out.replaceChildren(para(error.message, 'bad'));
      return;
    }
    // One hour of each motion, scaled to fit. Origin E; wind blows downwind.
    const s = 330 / Math.max(tas + ws, 1);
    const E = [60, 200];
    const pt = (dir, len, from = E) => [from[0] + len * s * Math.sin(dir * D), from[1] - len * s * Math.cos(dir * D)];
    // Fit: shift so the whole triangle stays in the frame.
    const W = pt(wf + 180, ws), P = pt(course, w.groundSpeed);
    const xs = [E[0], W[0], P[0]], ys = [E[1], W[1], P[1]];
    const dx = 215 - (Math.min(...xs) + Math.max(...xs)) / 2, dy = 150 - (Math.min(...ys) + Math.max(...ys)) / 2;
    const sh = ([x, y]) => [x + dx, y + dy];
    const [e, wp, p] = [E, W, P].map(sh);
    svg.append(el('line', { x1: 30, y1: 20, x2: 30, y2: 60, class: 'thin' }), el('text', { x: 26, y: 16, class: 'lbl small' }, 'TN'));
    arrow(svg, ...e, ...p, 'ln heavy');
    arrow(svg, ...e, ...wp, 'ln dashed');
    arrow(svg, ...wp, ...p, 'ln on');
    // Each label sits on its own line, pushed away from the triangle's centre.
    const mid = [(e[0] + wp[0] + p[0]) / 3, (e[1] + wp[1] + p[1]) / 3];
    const lab = (a, b, text, cls = 'lbl small') => {
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      let n = [(a[1] - b[1]) / len, (b[0] - a[0]) / len];
      if (n[0] * (m[0] - mid[0]) + n[1] * (m[1] - mid[1]) < 0) n = [-n[0], -n[1]];
      const anchor = n[0] > 0.4 ? 'start' : n[0] < -0.4 ? 'end' : 'middle';
      svg.append(el('text', { x: m[0] + n[0] * 10, y: m[1] + n[1] * 10 + (n[1] > 0 ? 10 : n[1] < -0.4 ? -2 : 4), class: cls, 'text-anchor': anchor }, text));
    };
    lab(e, p, `TC ${deg3(course)}° · GS ${r0(w.groundSpeed)}`);
    if (ws) lab(e, wp, `WIND ${r0(ws)}`);
    lab(wp, p, `TH ${deg3(w.heading)}° · TAS ${tas}`, 'lbl small on');
    for (const [q, name] of [[e, 'E'], [p, 'P']]) {
      const d = Math.hypot(q[0] - mid[0], q[1] - mid[1]) || 1;
      svg.append(el('text', { x: q[0] + (q[0] - mid[0]) / d * 14, y: q[1] + (q[1] - mid[1]) / d * 14 + 4, class: 'lbl', 'text-anchor': 'middle' }, name));
    }
    const mh = headings({ trueHeading: w.heading, variation: v }).magnetic;
    const side = w.wca > 0.05 ? 'right' : w.wca < -0.05 ? 'left' : null;
    const X = 440;
    [['WIND CORRECTION', side ? `${Math.abs(w.wca).toFixed(0)}° ${side.toUpperCase()}` : '0°'], ['TRUE HEADING', `${deg3(w.heading)}°`],
      ['MAGNETIC HEADING', `${deg3(mh)}°`], ['GROUND SPEED', `${r0(w.groundSpeed)} kt`], ['TIME', clock(dist / w.groundSpeed)]]
      .forEach(([k, val], i) => {
        svg.append(el('text', { x: X, y: 40 + i * 52, class: 'lbl small' }, k), el('text', { x: X, y: 64 + i * 52, class: 'lbl big mono' }, val));
      });
    out.replaceChildren(
      para(`Head ${deg3(w.heading)}° true (${deg3(mh)}° magnetic) to track ${deg3(course)}°: the wind is from the ${side ?? 'nose or tail'}${side ? `, so turn ${Math.abs(w.wca).toFixed(0)}° into it` : ''}. Ground speed ${r0(w.groundSpeed)} kt; ${dist} NM takes ${(dist / w.groundSpeed * 60).toFixed(0)} minutes.`),
    );
  }
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  root.querySelector('[data-phak]')?.addEventListener('click', () => {
    Object.entries({ tc: 90, tas: 120, wf: 45, ws: 40, var: 0, dist: 220 }).forEach(([k, val]) => { field(root, k).value = val; });
    draw();
  });
  draw();
}

/* ---------- HSI drawing shared by Figure 4 and its quiz ---------- */
// Optional extras: `bug` draws the heading bug, `track` the ground-track
// marker, and `aim` a sight line from the aircraft to the top of the CDI bar.
function drawHsi(svg, cx, cy, r, { heading, radial, course, dme, toFrom = true, bug, track, aim = false }) {
  const view = hsi({ radial, course });
  rose(svg, cx, cy, r, heading);
  // Lubber line and fixed aircraft.
  svg.append(el('path', { d: `M${cx} ${cy - r - 2} L${cx - 6} ${cy - r - 12} L${cx + 6} ${cy - r - 12} Z`, class: 'fill' }));
  for (const b of [45, 90, 135, 180, 225, 270, 315]) {
    const [x1, y1] = polar(cx, cy, r + 2, b), [x2, y2] = polar(cx, cy, r + 9, b);
    svg.append(el('line', { x1, y1, x2, y2, class: 'ln' }));
  }
  // Bearing pointer: head points to the station, tail sits on your radial.
  const [hx, hy] = polar(cx, cy, r - 2, view.head, heading), [tx, ty] = polar(cx, cy, r - 2, view.tail, heading);
  svg.append(el('line', { x1: tx, y1: ty, x2: hx, y2: hy, class: 'ln heavy on' }));
  svg.append(el('path', { d: 'M0 -12 L7 4 L-7 4 Z', class: 'pointer', transform: `translate(${hx} ${hy}) rotate(${view.head - heading})` }));
  svg.append(el('rect', { x: -5, y: -3, width: 10, height: 6, class: 'box on', transform: `translate(${tx} ${ty}) rotate(${view.tail - heading})` }));
  // Course arrow and CDI bar, rotated to the selected course.
  const g = el('g', { transform: `rotate(${course - heading} ${cx} ${cy})` });
  const L = r * HSI_BAR.halfLength, dot = r * HSI_BAR.dot;
  g.append(el('line', { x1: cx, y1: cy - r + 14, x2: cx, y2: cy - L - 4, class: 'ln heavy' }));
  g.append(el('path', { d: `M${cx} ${cy - r + 10} L${cx - 6} ${cy - r + 22} L${cx + 6} ${cy - r + 22} Z`, class: 'fill' }));
  g.append(el('line', { x1: cx, y1: cy + L + 4, x2: cx, y2: cy + r - 14, class: 'ln heavy' }));
  for (const k of [-2, -1, 1, 2]) g.append(el('circle', { cx: cx + k * dot, cy, r: 3, class: 'dot' }));
  g.append(el('line', { x1: cx + view.dots * dot, y1: cy - L, x2: cx + view.dots * dot, y2: cy + L, class: 'cdi' }));
  if (toFrom) {
    const y = view.toFrom === 'TO' ? cy - L * 0.6 : cy + L * 0.6;
    g.append(el('path', { d: view.toFrom === 'TO' ? `M${cx + dot * 1.5} ${y - 7} l7 12 l-14 0 Z` : `M${cx + dot * 1.5} ${y + 7} l7 -12 l-14 0 Z`, class: 'fill' }));
  }
  svg.append(g);
  if (aim) {
    // The top end of the bar, in screen space after the course rotation.
    const a = (course - heading) * D, bx = view.dots * dot, by = -L;
    const ex = cx + bx * Math.cos(a) - by * Math.sin(a), ey = cy + bx * Math.sin(a) + by * Math.cos(a);
    svg.append(el('line', { x1: cx, y1: cy - 14, x2: ex, y2: ey, class: 'thin dotted' }), el('circle', { cx: ex, cy: ey, r: 5, class: 'thin' }));
  }
  if (bug !== undefined) {
    const [bx, by] = polar(cx, cy, r + 1, bug, heading);
    svg.append(el('path', { d: 'M-7 0 L-7 -7 L-3 -7 L0 -3 L3 -7 L7 -7 L7 0 Z', class: 'box on', transform: `translate(${bx} ${by}) rotate(${bug - heading})` }));
  }
  if (track !== undefined) {
    const [gx, gy] = polar(cx, cy, r - 30, track, heading);
    svg.append(el('path', { d: 'M0 -6 L5 0 L0 6 L-5 0 Z', class: 'box', transform: `translate(${gx} ${gy})` }));
  }
  svg.append(jet(cx, cy, 0, 'acft', 1.3));
  svg.append(el('text', { x: cx - r, y: cy - r - 6, class: 'lbl small mono' }, `CRS ${deg3(course)}`));
  if (dme !== undefined) svg.append(el('text', { x: cx + r, y: cy - r - 6, class: 'lbl small mono', 'text-anchor': 'end' }, `${dme.toFixed(1)} NM`));
  return view;
}

// Read the HSI: preset positions, one question each.
const HSI_CASES = [
  { heading: 90, radial: 270, course: 90, dme: 18 }, { heading: 340, radial: 135, course: 315, dme: 25 },
  { heading: 180, radial: 20, course: 200, dme: 32 }, { heading: 45, radial: 300, course: 120, dme: 12 },
  { heading: 270, radial: 90, course: 90, dme: 40 }, { heading: 0, radial: 225, course: 45, dme: 22 },
  { heading: 210, radial: 160, course: 160, dme: 15 }, { heading: 120, radial: 350, course: 170, dme: 28 },
];
function setupHsiQuiz(root) {
  const svg = root.querySelector('svg');
  quickQuiz({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') }, {
    items: HSI_CASES,
    show: (c, prompt) => {
      svg.replaceChildren();
      drawHsi(svg, 160, 150, 120, c);
      prompt.textContent = `Heading ${deg3(c.heading)}. Which radial are you on?`;
    },
    options: (c) => withDistractors(c.radial, [c.radial, norm(c.radial + 180), c.heading, norm(c.heading + 180), c.course, norm(c.radial + 90), norm(c.radial - 90)].filter((v, i, a) => a.indexOf(v) === i)),
    label: (v) => `R-${deg3(v)}`,
    isRight: (c, v) => v === c.radial,
    feedback: (c, v, right) => (right ? `Correct: the tail of the pointer reads ${deg3(c.radial)}.`
      : v === norm(c.radial + 180) ? `Not quite: ${deg3(v)} is the head, the bearing to the station. You are on R-${deg3(c.radial)}, under the tail.`
        : `Not quite: read the tail of the bearing pointer, ${deg3(c.radial)}. Heading and course setting do not change your radial.`),
  });
}

/* ---------- Figure 4: watch the HSI fly ---------- */
// Each scene starts the same simulated aircraft somewhere against one course.
// `until` ends a scene early (homing would otherwise circle the station).
const WIND = { windFrom: 270, windSpeed: 40 };
const FLY_SCENES = [
  { id: 'cross', label: 'Fly across the course', course: 360, radial: 215, dme: 18, heading: 60, mode: 'hold', seconds: 420,
    intro: 'Holding heading 060 across the inbound 360 course. Watch the bar: it stays on the side the course is, comes alive within 10°, centres as you cross, then moves to the other side.' },
  { id: 'thirty', label: '30° method', course: 360, radial: 210, dme: 25, heading: 360, mode: 'method', method: 'thirty', seconds: 520,
    intro: 'On the 210 radial, inbound course 360 set. The pointer head reads 030; 30° beyond it is the intercept heading, 060.' },
  { id: 'double', label: 'Double the angle', course: 360, radial: 200, dme: 20, heading: 360, mode: 'method', method: 'double', seconds: 440,
    intro: 'On the 200 radial: the pointer head (020) is 20° from the course, so turn 20° beyond it, to 040.' },
  { id: 'picture', label: 'Aim at the top of the bar', course: 360, radial: 200, dme: 20, heading: 360, mode: 'picture', seconds: 440,
    intro: 'The nose goes on the top end of the bar. While the bar is pinned that is about 33°; as it centres the intercept angle shrinks by itself.' },
  { id: 'pictureWind', label: 'Top of the bar, crosswind', course: 360, radial: 200, dme: 20, heading: 360, mode: 'picture', seconds: 520, range: 15, ...WIND,
    intro: 'The same, with a 40 kt wind from the west. Watch where it settles.' },
  { id: 'pictureTrack', label: 'Top of the bar, ground-track marker', course: 360, radial: 200, dme: 20, heading: 360, mode: 'pictureTrack', seconds: 520, range: 15, ...WIND,
    intro: 'The same wind, but now the ground-track marker (the diamond) goes on the top of the bar, so the crab is built in.' },
  { id: 'homing', label: 'Homing in a crosswind', course: 360, radial: 180, dme: 20, heading: 360, mode: 'homing', seconds: 600, range: 12, until: (s) => s.range < 1.2, ...WIND,
    intro: 'Bearing pointer kept on the nose, no wind correction, 40 kt from the west. The aircraft gets there, but on a curved path that drifts off the course.' },
  { id: 'track', label: 'Tracking in a crosswind', course: 360, radial: 180, dme: 20, heading: 360, mode: 'track', seconds: 320, range: 12, ...WIND,
    intro: 'Same wind, tracking instead: the ground-track marker held on the course, the nose crabbed into the wind.' },
  { id: 'passage', label: 'Station passage', course: 360, radial: 180, dme: 8, heading: 360, mode: 'track', seconds: 260, range: 12,
    intro: 'Tracking inbound on 360 with 360 still set. Over the station the bearing pointer swings, the TO arrow becomes FROM, and the same course takes you outbound.' },
  { id: 'outbound', label: '45° method outbound', course: 60, radial: 30, dme: 5, heading: 30, mode: 'method', method: 'fortyfive', seconds: 420, range: 20,
    intro: 'Outbound on the 030 radial, cleared to the 060 radial outbound. Look from the pointer tail (030) to the course (060) and 45° beyond: 105.' },
  { id: 'manual', label: 'Fly it yourself', course: 360, radial: 210, dme: 20, heading: 360, mode: 'hold', seconds: 1200,
    intro: 'You have the aircraft. Set the heading bug with the buttons (or the arrow keys on the figure) and intercept the inbound 360 course.' },
];
const PHASE_TEXT = {
  intercept: (s) => `Holding the intercept heading, ${deg3(s.interceptHeading)}.`,
  rollout: (s) => `Lead point: turning onto ${deg3(s.course)} so the turn finishes on the course.`,
};
function setupFly(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const play = root.querySelector('[data-play]'), scenes = root.querySelector('[data-scenes]'), steer = root.querySelector('[data-steer]');
  let scene = FLY_SCENES[1], sim, trail, frame = null, last = 0, carry = 0, said = '';
  const headingUp = () => root.querySelector('[name="view"]:checked').value === 'up';
  const speed = () => num(root, 'speed');
  const finished = () => { const s = sim.state(); return s.t >= scene.seconds || Math.hypot(s.x, s.y) > 45 || scene.until?.(s); };
  function load(next) {
    stop();
    scene = next;
    sim = courseFlight(scene);
    trail = [sim.state()];
    said = '';
    scenes.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.scene === scene.id)));
    steer.hidden = scene.id !== 'manual';
    draw();
  }
  // What is happening now, in words; announced only when it changes.
  function narrate(s) {
    const lines = [scene.intro];
    let now;
    if (s.cone) now = 'Over the station: the bearing pointer swings and the TO/FROM arrow flips. Hold heading until it settles.';
    else if (PHASE_TEXT[s.phase] && scene.mode === 'method') now = PHASE_TEXT[s.phase](s);
    else if (scene.mode.startsWith('picture') && Math.abs(s.deviation) >= 0.25) now = `${s.fullScale ? 'Bar pinned at full scale' : 'Bar alive'}: the top of the bar is ${Math.abs(s.aim).toFixed(0)}° ${s.aim > 0 ? 'right' : 'left'} of the course, so the ${scene.mode === 'pictureTrack' ? 'ground track' : 'nose'} points there.`;
    else if (s.fullScale) now = 'Bar pinned at full scale: you are 10° or more off the course.';
    else if (Math.abs(s.deviation) < 0.25) now = `Bar centred: on the course${Math.abs(s.drift) >= 1 ? `, crabbing ${Math.abs(s.drift).toFixed(0)}° into the wind` : ''}.`;
    else now = `Bar alive: ${Math.abs(s.deviation).toFixed(1)}° off, course to the ${s.deviation > 0 ? 'right' : 'left'}.`;
    if (finished()) now = summary(s);
    if (now !== said) { said = now; out.replaceChildren(...lines.map((t) => para(t, 'derived')), para(now)); }
  }
  function summary(s) {
    if (scene.id === 'homing') return `Homing reached the station from the ${deg3(s.radial)} radial, not along the course: the path curved downwind.`;
    if (scene.id === 'pictureWind') return `Settled ${Math.abs(s.xtk).toFixed(1)} NM downwind of the course with the bar ${Math.abs(s.dots).toFixed(1)} dot out: there the angle to the top of the bar is used up as crab against the wind, so nothing is left to close the course. Use the ground-track marker, or add crab, to centre it.`;
    if (Math.abs(s.xtk) < 0.1) return `Established on ${deg3(s.course)}${Math.abs(s.drift) >= 1 ? ` with ${Math.abs(s.drift).toFixed(0)}° of crab` : ''}, ${s.toFrom} the station at ${s.range.toFixed(1)} NM.`;
    return `${Math.abs(s.xtk).toFixed(1)} NM ${s.xtk > 0 ? 'left' : 'right'} of the course line.`;
  }
  function draw() {
    const s = sim.state();
    svg.replaceChildren();
    // Plan view: station-centred and north up, or aircraft-centred and heading up like the HSI.
    // Side by side when there is room, plan view above the HSI on a phone.
    const narrow = root.clientWidth < 560, ring = scene.range ?? 25;
    svg.setAttribute('viewBox', narrow ? '0 0 330 690' : '0 0 640 335');
    const cx = 165, cy = 170, R = 140, k = R / ring, up = headingUp() ? s.heading : 0;
    const hx = narrow ? 165 : 470, hy = narrow ? 510 : 170, foot = narrow ? 680 : 326;
    const ox = headingUp() ? s.x : 0, oy = headingUp() ? s.y : 0;
    const scr = (q) => { const dx = (q.x - ox) * k, dy = (q.y - oy) * k, a = -up * D; return [cx + dx * Math.cos(a) + dy * Math.sin(a), cy + dx * Math.sin(a) - dy * Math.cos(a)]; };
    const clip = el('clipPath', { id: 'fly-clip' });
    clip.append(el('circle', { cx, cy, r: R }));
    svg.append(clip);
    const g = el('g', { 'clip-path': 'url(#fly-clip)' });
    svg.append(el('circle', { cx, cy, r: R, class: 'frame' }));
    const far = (dir, n) => scr({ x: n * Math.sin(dir * D), y: n * Math.cos(dir * D) });
    const [a1, b1] = far(s.course, 80), [a2, b2] = far(s.course + 180, 80);
    g.append(el('line', { x1: a2, y1: b2, x2: a1, y2: b1, class: 'ln heavy' }));
    [-30, -15, 15, 30].forEach((n) => { const [mx, my] = far(s.course + 180, n); g.append(el('path', { d: 'M0 -7 L5 3 L-5 3 Z', class: 'fill', transform: `translate(${mx} ${my}) rotate(${s.course - up})` })); });
    // The ±10° wedge where the bar is alive, either side of the course.
    for (const side of [-10, 10]) {
      const [p1, q1] = far(s.course + 180 + side, 80), [p2, q2] = far(s.course + side, 80);
      g.append(el('line', { x1: p1, y1: q1, x2: p2, y2: q2, class: 'thin dotted' }));
    }
    g.append(el('path', { d: `M${trail.map((q) => scr(q).join(' ')).join(' L')}`, class: 'flown' }));
    const [sx, sy] = scr({ x: 0, y: 0 });
    station(g, sx, sy, 'TACAN');
    svg.append(g);
    svg.append(jet(...scr(s), s.heading - up, 'acft', 1.2));
    const [nx, ny] = polar(cx, cy, R + 10, 0, up);
    svg.append(el('text', { x: nx, y: ny + 4, class: 'lbl', 'text-anchor': 'middle' }, 'N'));
    if (scene.windSpeed) {
      const wx = 30, wy = 30, toward = scene.windFrom + 180 - up;
      arrow(svg, ...polar(wx, wy, 16, toward + 180), ...polar(wx, wy, 16, toward), 'ln');
      svg.append(el('text', { x: wx - 22, y: wy + 30, class: 'lbl small' }, `WIND ${deg3(scene.windFrom)}/${scene.windSpeed}`));
    }
    svg.append(el('text', { x: narrow ? 165 : 20, y: narrow ? 334 : foot, class: 'lbl small', 'text-anchor': narrow ? 'middle' : 'start' }, `PLAN VIEW, ${headingUp() ? 'HEADING' : 'NORTH'} UP · ${ring} NM RING`));
    // HSI, heading up.
    const showBug = scene.mode === 'hold', showTrack = true, aim = scene.mode.startsWith('picture');
    drawHsi(svg, hx, hy, 120, { heading: s.heading, radial: s.radial, course: s.course, dme: s.range, bug: showBug ? s.bug : undefined, track: showTrack ? s.track : undefined, aim });
    svg.append(el('text', { x: hx, y: foot, class: 'lbl small', 'text-anchor': 'middle' }, `HSI · HDG ${deg3(s.heading)} · GS ${r0(s.groundSpeed)} KT · ${clock(s.t / 60)}`));
    narrate(s);
  }
  function run(seconds) {
    for (let i = 0; i < seconds && !finished(); i++) {
      sim.step();
      if (sim.state().t % 4 === 0) trail.push(sim.state());
    }
    trail.push(sim.state());
    draw();
  }
  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    carry += dt * speed();
    const whole = Math.floor(carry);
    carry -= whole;
    if (whole) run(whole);
    if (finished()) return stop();
    frame = requestAnimationFrame(tick);
  }
  function stop() { if (frame) cancelAnimationFrame(frame); frame = null; play.textContent = 'Play'; }
  play.addEventListener('click', () => {
    if (frame) return stop();
    if (finished()) load(scene);
    if (reduceMotion()) { run(60); return; }
    play.textContent = 'Pause';
    last = performance.now();
    carry = 0;
    frame = requestAnimationFrame(tick);
  });
  root.querySelector('[data-step]').addEventListener('click', () => { stop(); if (finished()) load(scene); run(10); });
  root.querySelector('[data-reset]').addEventListener('click', () => load(scene));
  for (const sc of FLY_SCENES) {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: sc.label });
    b.dataset.scene = sc.id;
    b.addEventListener('click', () => { load(sc); });
    scenes.append(b);
  }
  const turnBug = (by) => { if (scene.mode !== 'hold') return; sim.setBug(sim.state().bug + by); if (!frame && !finished()) run(0); else draw(); };
  steer.querySelectorAll('[data-turn]').forEach((b) => b.addEventListener('click', () => turnBug(+b.dataset.turn)));
  root.addEventListener('keydown', (e) => {
    if (scene.id !== 'manual' || !['ArrowLeft', 'ArrowRight'].includes(e.key) || e.target.matches('input, select')) return;
    e.preventDefault();
    turnBug(e.key === 'ArrowLeft' ? -5 : 5);
  });
  root.querySelectorAll('input, select').forEach((i) => i.addEventListener('input', draw));
  window.addEventListener('resize', () => { if (!frame) draw(); });
  load(scene);
}

/* ---------- Figure 6: DME arcs ---------- */
function setupArc(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const arc = num(root, 'arc'), gs = num(root, 'gs'), ahead = num(root, 'ahead');
    show(root, 'arc', `${arc} DME`); show(root, 'gs', `${gs} kt`); show(root, 'ahead', `${ahead}°`);
    const leads = arcLeads({ groundSpeed: gs, arc, inbound: true });
    const outbound = arcLeads({ groundSpeed: gs, arc, inbound: false });
    const fly = chordArc({ arc, ahead, sweep: 90, start: 180, clockwise: true });
    svg.replaceChildren();
    const reach = arc + 6, cx = 420, cy = 30, scale = 225 / reach;
    const scr = (q) => [cx + q.x * scale, cy - q.y * scale];
    // The arc, 180 to 270 clockwise, and the radials every 10°.
    for (let r = 180; r <= 270; r += 10) {
      const [x, y] = polar(cx, cy, reach * scale, r);
      svg.append(el('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'grid' }));
      const [tx, ty] = polar(cx, cy, reach * scale + 12, r);
      svg.append(el('text', { x: tx, y: ty + 4, class: 'lbl small', 'text-anchor': 'middle' }, deg3(r)));
    }
    const [ax, ay] = polar(cx, cy, arc * scale, 180), [bx, by] = polar(cx, cy, arc * scale, 270);
    svg.append(el('path', { d: `M${ax} ${ay} A${arc * scale} ${arc * scale} 0 0 1 ${bx} ${by}`, class: 'ln dashed' }));
    svg.append(el('path', { d: `M${fly.path.map((q) => scr(q).join(' ')).join(' L')}`, class: 'flown' }));
    for (const q of fly.turns) svg.append(el('circle', { cx: scr(q)[0], cy: scr(q)[1], r: 2.5, class: 'dot done' }));
    // Radial-to-arc: outbound on the 180 radial, turn at arc − 1% GS.
    const lp = polar(cx, cy, outbound.leadDme * scale, 180);
    svg.append(el('circle', { cx: lp[0], cy: lp[1], r: 4, class: 'pointer' }));
    svg.append(el('text', { x: lp[0] + 8, y: lp[1] + 4, class: 'lbl small on' }, `TURN ${outbound.leadDme.toFixed(1)} DME`));
    // Arc-to-radial: leave the arc for the 270 radial the lead radials early.
    const leadRadial = 270 - leads.leadRadials;
    const [lx, ly] = polar(cx, cy, arc * scale, leadRadial);
    svg.append(el('line', { x1: cx, y1: cy, x2: polar(cx, cy, reach * scale, leadRadial)[0], y2: polar(cx, cy, reach * scale, leadRadial)[1], class: 'ln dashed on' }));
    svg.append(el('circle', { cx: lx, cy: ly, r: 4, class: 'pointer' }));
    svg.append(el('text', { x: lx + 18, y: ly + 16, class: 'lbl small on' }, `LEAD R-${deg3(leadRadial)}`));
    station(svg, cx, cy, 'TACAN');
    svg.append(el('text', { x: 20, y: 304, class: 'lbl small' }, `CHORD METHOD, POINTER ${ahead}° AHEAD / BEHIND THE WINGTIP · NO WIND · NOT TO SCALE FOR TURNS`));
    const row = ARC_LEAD_TABLE.find((r) => r.dme === arc);
    out.replaceChildren(
      para(`Joining the ${arc} DME arc from a radial: start the turn ${leads.leadNm.toFixed(1)} NM early, at ${leads.leadDme.toFixed(1)} DME inbound or ${outbound.leadDme.toFixed(1)} DME outbound.`),
      para(`Leaving the arc for a radial: lead by 60 ÷ ${arc} × ${(gs / 100).toFixed(1)} = ${leads.leadRadials.toFixed(1)} radials${row?.inbound ? `; at 10 DME and closer the FTI's table at 250 kt adds a correction (inbound turn ${row.inbound}, outbound ${row.outbound} radials)` : ''}.`),
      para(`Holding the arc: the FTI suggests the ${leads.method === 'chord' ? 'chord method beyond 12 DME' : 'angle-of-bank method at 12 DME or less'}. Flown by chords here, the DME wanders between ${fly.minDme.toFixed(1)} and ${fly.maxDme.toFixed(1)} over ${fly.legs} legs.`, 'derived'),
    );
  }
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
}

/* ---------- Figure 7: point to point ---------- */
function setupP2p(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const guess = field(root, 'guess');
  let revealed = false;
  function draw() {
    const from = { radial: num(root, 'fr'), dme: num(root, 'fd') }, to = { radial: num(root, 'tr'), dme: num(root, 'td') };
    const sol = pointToPoint(from, to);
    svg.replaceChildren();
    // The HSI as a plotting board: the farther fix on the rose's edge.
    const cx = 170, cy = 160, R = 130, far = Math.max(from.dme, to.dme, 1), s = R / far;
    rose(svg, cx, cy, R, 0);
    station(svg, cx, cy, '');
    const a = tacanPosition(from), b = tacanPosition(to);
    const A = [cx + a.x * s, cy - a.y * s], B = [cx + b.x * s, cy - b.y * s];
    svg.append(el('circle', { cx: A[0], cy: A[1], r: 5, class: 'pointer' }), el('text', { x: A[0] + 8, y: A[1] - 6, class: 'lbl small on' }, 'YOU'));
    svg.append(el('path', { d: 'M0 -7 L6 5 L-6 5 Z', class: 'box', transform: `translate(${B[0]} ${B[1]})` }), el('text', { x: B[0] + 8, y: B[1] - 6, class: 'lbl small' }, 'FIX'));
    if (revealed && sol.course !== null) {
      arrow(svg, ...A, ...B, 'ln on');
      // Same line moved parallel through the centre: read the course at the rose edge.
      const [ex, ey] = polar(cx, cy, R, sol.course), [sx, sy] = polar(cx, cy, R * 0.6, sol.course + 180);
      arrow(svg, sx, sy, ex, ey, 'ln dashed on');
      svg.append(el('text', { x: ex, y: ey - 10, class: 'lbl on', 'text-anchor': 'middle' }, deg3(sol.course)));
    }
    svg.append(el('text', { x: 340, y: 40, class: 'lbl small' }, `YOU: R-${deg3(from.radial)} / ${from.dme} NM`), el('text', { x: 340, y: 62, class: 'lbl small' }, `FIX: R-${deg3(to.radial)} / ${to.dme} NM`));
    svg.append(el('text', { x: 340, y: 84, class: 'lbl small' }, `ROSE EDGE = ${far} NM`));
    if (revealed && sol.course !== null) {
      svg.append(el('text', { x: 340, y: 130, class: 'lbl small' }, 'COURSE TO THE FIX'), el('text', { x: 340, y: 154, class: 'lbl big mono on' }, `${deg3(sol.course)}°`));
      svg.append(el('text', { x: 340, y: 190, class: 'lbl small' }, 'DISTANCE'), el('text', { x: 340, y: 214, class: 'lbl big mono' }, `${sol.distance.toFixed(1)} NM`));
    }
    return sol;
  }
  function check(reveal) {
    const sol = draw();
    if (sol.course === null) { out.replaceChildren(para('You are already at the fix.')); return; }
    const g = guess.value.trim() === '' ? null : +guess.value;
    const lines = [];
    if (g !== null && Number.isFinite(g)) {
      const err = Math.abs(diff(g, sol.course));
      lines.push(para(err <= 10 ? `Good estimate: ${deg3(g)}° is within ${err.toFixed(0)}° of ${deg3(sol.course)}°.` : `Your ${deg3(g)}° is ${err.toFixed(0)}° away from ${deg3(sol.course)}°.`, err <= 10 ? '' : 'bad'));
    }
    if (reveal || g !== null) lines.push(para(`The course to the fix is ${deg3(sol.course)}° for ${sol.distance.toFixed(1)} NM, with no wind. The dashed arrow is the same line moved through the centre of the rose, where the course is read.`, 'derived'));
    out.replaceChildren(...lines);
  }
  root.querySelectorAll('input:not([name="guess"])').forEach((i) => i.addEventListener('input', () => { revealed = false; draw(); out.replaceChildren(); }));
  root.querySelector('[data-check]').addEventListener('click', () => { revealed = true; check(false); });
  root.querySelector('[data-reveal]').addEventListener('click', () => { revealed = true; check(true); });
  root.querySelector('[data-new]').addEventListener('click', () => {
    const r = () => Math.floor(Math.random() * 36) * 10;
    field(root, 'fr').value = r(); field(root, 'fd').value = 10 + Math.floor(Math.random() * 40);
    field(root, 'tr').value = r(); field(root, 'td').value = 8 + Math.floor(Math.random() * 30);
    guess.value = '';
    revealed = false;
    draw();
    out.replaceChildren();
  });
  draw();
}

/* ---------- Figure 8: waypoints and direct-to ---------- */
// An invented route in NM, x east and y north.
const ROUTE = [{ x: -44, y: -26, name: '1' }, { x: -18, y: 4, name: '2' }, { x: 12, y: -6, name: '3' }, { x: 34, y: 22, name: '4' }, { x: 2, y: 34, name: '5' }];
function setupRoute(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const play = root.querySelector('[data-play]'), direct = root.querySelector('[data-direct]');
  let sim, trail, timer = null;
  const gs = () => num(root, 'gs');
  const flyOver = () => root.querySelector('[name="wpt"]:checked').value === 'over';
  function reset() {
    stop();
    sim = routeFlight({ waypoints: ROUTE, groundSpeed: gs(), flyOver: flyOver() });
    trail = [sim.state()];
    draw();
  }
  function draw() {
    const s = sim.state();
    show(root, 'gs', `${gs()} kt`);
    svg.replaceChildren();
    const cx = 230, cy = 170, k = 3.4;
    const scr = (q) => [cx + q.x * k, cy - q.y * k];
    svg.append(el('path', { d: `M${ROUTE.map((w) => scr(w).join(' ')).join(' L')}`, class: 'ln dashed' }));
    ROUTE.forEach((w, i) => {
      const [x, y] = scr(w), on = i === s.active && !s.done;
      const star = flyOver() ? 'M0 -8 L8 0 L0 8 L-8 0 Z' : 'M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z';
      svg.append(el('path', { d: star, class: on ? 'pointer' : 'box', transform: `translate(${x} ${y})` }));
      if (flyOver()) svg.append(el('circle', { cx: x, cy: y, r: 11, class: 'thin' }));
      svg.append(el('text', { x: x + 12, y: y - 8, class: `lbl${on ? ' on' : ''}` }, `WP ${w.name}`));
    });
    if (!s.done && s.leg === 'DF') {
      const from = scr(trail.at(-1)), to = scr(ROUTE[s.active]);
      svg.append(el('line', { x1: from[0], y1: from[1], x2: to[0], y2: to[1], class: 'thin dotted' }));
    }
    svg.append(el('path', { d: `M${trail.map((q) => scr(q).join(' ')).join(' L')}`, class: 'flown' }));
    svg.append(jet(...scr(s), s.heading, 'acft', 1.1));
    // Data block and CDI (±4.0 NM full scale with the gear up, as on the T-45C).
    const X = 470;
    const xtk = s.xtk, bar = Math.max(-1, Math.min(1, -xtk / 4));
    const rows = s.done ? [['ROUTE', 'COMPLETE']] : [
      ['STEERING', `WP ${ROUTE[s.active].name} · ${s.leg}`], ['BEARING / DIST', `${deg3(s.bearing)}° / ${s.distance.toFixed(1)}`],
      ['TIME TO GO', clock(s.timeToGo / 60)],
      ['DESIRED TRACK', `${deg3(s.desiredTrack)}°`], ['CROSS-TRACK', `${Math.abs(xtk).toFixed(2)} NM ${Math.abs(xtk) < 0.005 ? '' : xtk > 0 ? 'R' : 'L'}`],
    ];
    rows.forEach(([kk, val], i) => svg.append(el('text', { x: X, y: 30 + i * 42, class: 'lbl small' }, kk), el('text', { x: X, y: 50 + i * 42, class: 'lbl mono' }, val)));
    const cdiY = 260;
    svg.append(el('text', { x: X, y: cdiY - 14, class: 'lbl small' }, 'CDI ±4.0 NM'));
    for (const d of [-1, -0.5, 0.5, 1]) svg.append(el('circle', { cx: X + 70 + d * 60, cy: cdiY, r: 3, class: 'dot' }));
    svg.append(el('line', { x1: X + 70, y1: cdiY - 14, x2: X + 70, y2: cdiY + 14, class: 'thin' }));
    if (!s.done) svg.append(el('line', { x1: X + 70 + bar * 60, y1: cdiY - 18, x2: X + 70 + bar * 60, y2: cdiY + 18, class: 'cdi' }));
    svg.append(el('text', { x: 20, y: 324, class: 'lbl small' }, `${flyOver() ? 'FLY-OVER' : 'FLY-BY'} WAYPOINTS · ${gs()} KT · 30° BANK · NO WIND · CONSTRUCTED ROUTE`));
    const lines = [];
    if (s.done) lines.push(para(`Route complete in ${Math.round(s.t / 60)} minutes.`));
    else lines.push(para(`${s.leg === 'DF' ? 'Direct-to-fix leg' : 'Track-to-fix leg'} to WP ${ROUTE[s.active].name}: ${s.distance.toFixed(1)} NM on bearing ${deg3(s.bearing)}°.`));
    out.replaceChildren(...lines);
  }
  function run(seconds) {
    for (let i = 0; i < seconds && !sim.state().done; i++) {
      sim.step(1);
      if (i % 4 === 0) trail.push(sim.state());
    }
    trail.push(sim.state());
    draw();
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = 'Fly'; }
  play.addEventListener('click', () => {
    if (timer) return stop();
    if (sim.state().done) reset();
    if (reduceMotion()) { run(120); return; }
    play.textContent = 'Pause';
    timer = setInterval(() => { run(8); if (sim.state().done) stop(); }, 60);
  });
  root.querySelector('[data-step]').addEventListener('click', () => { stop(); run(60); });
  root.querySelector('[data-reset]').addEventListener('click', reset);
  ROUTE.slice(1).forEach((w, i) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: `Direct WP ${w.name}` });
    b.addEventListener('click', () => { if (sim.state().done) reset(); sim.directTo(i + 1); draw(); });
    direct.append(b);
  });
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', reset));
  reset();
}

function setupTerms(root) { termQuiz(root, { hideTerm: true }); }

const blocks = { coords: setupCoords, compass: setupCompass, wind: setupWind, fly: setupFly, 'hsi-quiz': setupHsiQuiz, arc: setupArc, p2p: setupP2p, route: setupRoute, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
