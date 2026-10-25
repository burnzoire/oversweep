// Presentation for the Air Navigation module's interactive figures. Geometry
// and rules come from lesson-model.mjs; this file reads inputs and draws.
import {
  ARC_LEAD_TABLE, INTERCEPT_METHODS, arcLeads, chordArc, diff, fixOf, formatDD, formatDM, formatDMS, headings, hsi,
  interceptHeading, leadNm, norm, parseCoordinate, pointToPoint, radialSpacing, relativeBearing, resolution,
  routeFlight, slantRange, tacanPosition, toMGRS, toUTM, windTriangle,
} from './lesson-model.mjs';
import { quickQuiz, termQuiz, withDistractors } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const D = Math.PI / 180;
const r0 = (v) => Math.round(v).toLocaleString('en-US');
const deg3 = (v) => String(Math.round(norm(v)) % 360).padStart(3, '0');
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
function drawHsi(svg, cx, cy, r, { heading, radial, course, dme, toFrom = true }) {
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
  const L = r * 0.55, dot = r * 0.18;
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
  svg.append(jet(cx, cy, 0, 'acft', 1.3));
  svg.append(el('text', { x: cx - r, y: cy - r - 6, class: 'lbl small mono' }, `CRS ${deg3(course)}`));
  if (dme !== undefined) svg.append(el('text', { x: cx + r, y: cy - r - 6, class: 'lbl small mono', 'text-anchor': 'end' }, `${dme.toFixed(1)} NM`));
  return view;
}

/* ---------- Figure 4: where am I? ---------- */
function setupHsi(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const radial = num(root, 'radial'), dme = num(root, 'dme'), heading = num(root, 'hdg'), course = num(root, 'crs'), alt = num(root, 'alt');
    show(root, 'radial', `${deg3(radial)}°`); show(root, 'dme', `${dme} NM`); show(root, 'hdg', `${deg3(heading)}°`);
    show(root, 'crs', `${deg3(course)}°`); show(root, 'alt', `${r0(alt)} ft`);
    const slant = slantRange(dme, alt);
    svg.replaceChildren();
    // Plan view, north up.
    const cx = 160, cy = 165, scale = 125 / 60;
    svg.append(el('circle', { cx, cy, r: 125, class: 'grid' }), el('circle', { cx, cy, r: 62.5, class: 'grid' }));
    svg.append(el('text', { x: cx + 4, y: cy - 128, class: 'lbl small' }, 'N · 60 NM'), el('text', { x: cx + 4, y: cy - 66, class: 'lbl small' }, '30'));
    // Selected course drawn through the station.
    const [c1x, c1y] = polar(cx, cy, 140, course), [c2x, c2y] = polar(cx, cy, 140, course + 180);
    svg.append(el('line', { x1: c2x, y1: c2y, x2: c1x, y2: c1y, class: 'ln dashed' }));
    svg.append(el('text', { x: c1x, y: c1y, class: 'lbl small', 'text-anchor': 'middle' }, `CRS ${deg3(course)}`));
    const [px, py] = polar(cx, cy, dme * scale, radial);
    svg.append(el('line', { x1: cx, y1: cy, x2: px, y2: py, class: 'ln on' }));
    station(svg, cx, cy, 'TACAN');
    svg.append(jet(px, py, heading, 'acft', 1.2));
    svg.append(el('text', { x: px + 12, y: py + 18, class: 'lbl small on' }, `R-${deg3(radial)}`));
    const view = drawHsi(svg, 480, 165, 120, { heading, radial, course, dme: slant });
    svg.append(el('text', { x: 20, y: 316, class: 'lbl small' }, 'PLAN VIEW, NORTH UP'), el('text', { x: 480, y: 316, class: 'lbl small', 'text-anchor': 'middle' }, 'HSI, HEADING UP'));
    const side = Math.abs(view.deviation) < 0.5 ? 'centred' : `${Math.abs(view.deviation).toFixed(0)}° ${view.deviation > 0 ? 'right' : 'left'}${view.fullScale ? ' (full scale)' : ''}`;
    const lines = [
      para(`You are on the ${deg3(radial)} radial at ${dme} NM: the tail of the bearing pointer shows ${deg3(view.tail)}, the head ${deg3(view.head)}, the course to the station.`),
      para(`With ${deg3(course)} set the HSI shows ${view.toFrom} and the course bar ${side}; the bar sits on the side the course lies, whatever your heading.`),
      para(`DME reads ${slant.toFixed(1)} NM slant range at ${r0(alt)} ft${alt / 1000 > dme ? ': more than your ground distance, so a timed ground speed check here would mislead' : ''}.`, 'derived'),
    ];
    if (dme < 2) lines.push(para('Close to the station: expect the TACAN bearing to swing through the cone of confusion; TACAN station passage is minimum DME.', 'derived'));
    out.replaceChildren(...lines);
  }
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
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

/* ---------- Figure 5: intercept a course ---------- */
function setupIntercept(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), method = field(root, 'method');
  function draw() {
    const m = method.value, course = num(root, 'crs'), radial = num(root, 'radial'), dme = num(root, 'dme'), gs = num(root, 'gs');
    show(root, 'crs', `${deg3(course)}°`); show(root, 'radial', `${deg3(radial)}°`); show(root, 'dme', `${dme} NM`); show(root, 'gs', `${gs} kt`);
    const spec = INTERCEPT_METHODS[m];
    const icpt = interceptHeading({ method: m, course, radial });
    svg.replaceChildren();
    const cx = 230, cy = 165, scale = 140 / 40;
    svg.append(el('circle', { cx, cy, r: 140, class: 'grid' }), el('text', { x: cx + 4, y: cy - 144, class: 'lbl small' }, 'N · 40 NM'));
    // The desired course line: inbound along the reciprocal radial, outbound along the radial.
    const courseRadial = spec.inbound ? norm(course + 180) : course;
    const [ex, ey] = polar(cx, cy, 150, courseRadial);
    svg.append(el('line', { x1: cx, y1: cy, x2: ex, y2: ey, class: 'ln heavy' }));
    const mid = polar(cx, cy, 75, courseRadial);
    arrow(svg, ...polar(cx, cy, 95, courseRadial), ...polar(cx, cy, spec.inbound ? 70 : 120, courseRadial), 'ln');
    svg.append(el('text', { x: ex, y: ey + (ey > cy ? 14 : -6), class: 'lbl small', 'text-anchor': 'middle' }, `R-${deg3(courseRadial)}`));
    station(svg, cx, cy, 'TACAN');
    const p = tacanPosition({ radial, dme });
    const P = [cx + p.x * scale, cy - p.y * scale];
    const lines = [];
    if (icpt.onCourse) {
      svg.append(jet(...P, course, 'acft', 1.2));
      out.replaceChildren(para('You are already on the course line: turn to the course and track it.'));
      return;
    }
    // Intercept leg, the turn onto course (radius 1% of ground speed) and the lead point.
    const v = [Math.sin(icpt.heading * D), Math.cos(icpt.heading * D)], u = [Math.sin(courseRadial * D), Math.cos(courseRadial * D)];
    const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
    const t = -cross([p.x, p.y], u) / cross(v, u);
    const meets = Number.isFinite(t) && t > 0 && t < 120;
    const lead = leadNm(gs, icpt.angle);
    if (meets) {
      const X = { x: p.x + t * v[0], y: p.y + t * v[1] };
      const R = gs / 100, th = icpt.angle * D, a = Math.min(t, R * Math.tan(th / 2));
      const S = { x: X.x - a * v[0], y: X.y - a * v[1] };
      const along = spec.inbound ? -1 : 1; // course direction along the radial line u
      const dirOut = [u[0] * along, u[1] * along];
      // Roll out on the course in the direction it is flown.
      const head = Math.sign(diff(course, icpt.heading)) || 1;
      const Rend = { x: X.x + a * dirOut[0], y: X.y + a * dirOut[1] };
      const scr = (q) => [cx + q.x * scale, cy - q.y * scale];
      svg.append(el('line', { x1: P[0], y1: P[1], x2: scr(S)[0], y2: scr(S)[1], class: 'flown' }));
      const r = R * Math.tan(th / 2) <= t ? R : a / Math.tan(th / 2);
      svg.append(el('path', { d: `M${scr(S).join(' ')} A${r * scale} ${r * scale} 0 0 ${head > 0 ? 1 : 0} ${scr(Rend).join(' ')}`, class: 'flown' }));
      svg.append(el('line', { x1: scr(X)[0], y1: scr(X)[1], x2: P[0], y2: P[1], class: 'thin dotted' }));
      svg.append(el('circle', { cx: scr(S)[0], cy: scr(S)[1], r: 4, class: 'pointer' }));
      svg.append(el('text', { x: scr(S)[0] + 8, y: scr(S)[1] - 6, class: 'lbl small on' }, 'TURN'));
    }
    svg.append(jet(...P, icpt.heading, 'acft', 1.2));
    const X0 = 450;
    [['METHOD', spec.label.split(' (')[0].toUpperCase()], ['BEARING POINTER', `HEAD ${deg3(radial + 180)} · TAIL ${deg3(radial)}`], ['INTERCEPT HEADING', `${deg3(icpt.heading)}°`],
      ['INTERCEPT ANGLE', `${icpt.angle.toFixed(0)}°`], ['LEAD (FTI RULE)', `${lead.nm.toFixed(1)} NM`], ['= RADIALS AT THIS DME', (lead.nm / radialSpacing(dme)).toFixed(0)]]
      .forEach(([k, val], i) => {
        svg.append(el('text', { x: X0, y: 34 + i * 46, class: 'lbl small' }, k), el('text', { x: X0, y: 56 + i * 46, class: `lbl${i === 2 ? ' big on' : ''} mono` }, val));
      });
    lines.push(para(`${spec.inbound ? `Look from the course ${deg3(course)} to the head of the pointer ${deg3(radial + 180)}` : `Look from the tail of the pointer ${deg3(radial)} to the course ${deg3(course)}`}, then ${m === 'thirty' ? '30°' : m === 'fortyfive' ? '45°' : `as many degrees again (${Math.min(icpt.off, 45).toFixed(0)}°, at most 45°)`} beyond: heading ${deg3(icpt.heading)}°.`));
    lines.push(para(`Lead: 1% of ${gs} kt is ${(gs / 100).toFixed(1)} NM for a 90° intercept; for ${icpt.angle.toFixed(0)}° use ${lead.label}, ${lead.nm.toFixed(1)} NM. At ${dme} NM the radials are ${radialSpacing(dme).toFixed(2)} NM apart.`, 'derived'));
    if (!icpt.valid) lines.push(para('This intercept is steeper than 90°: the FTI limits the intercept angle to 90°. Choose another method or turn to a 90° intercept.', 'bad'));
    else if (!meets) lines.push(para('On this heading you would not meet the course line ahead of you. Check the method suits where you are: inbound methods for courses to the station, outbound methods for courses from it.', 'bad'));
    out.replaceChildren(...lines);
  }
  root.querySelectorAll('input, select').forEach((i) => i.addEventListener('input', draw));
  draw();
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

const blocks = { coords: setupCoords, compass: setupCompass, wind: setupWind, hsi: setupHsi, 'hsi-quiz': setupHsiQuiz, intercept: setupIntercept, arc: setupArc, p2p: setupP2p, route: setupRoute, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
