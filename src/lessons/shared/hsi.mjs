// The HSI and compass rose, shared by Air Navigation (Figure 4 and its quiz)
// and the instrument flight modules' panels and ILS figure.
import { HSI_BAR, hsi } from '../navigation/lesson-model.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const D = Math.PI / 180;
// North is written 360, as headings, courses and radials are.
const deg3 = (v) => String(Math.round(((v % 360) + 360) % 360) % 360 || 360).padStart(3, '0');
export function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
// Screen point of a compass direction at radius r around (cx, cy), with
// `up` the direction drawn at the top.
export const polar = (cx, cy, r, dir, up = 0) => [cx + r * Math.sin((dir - up) * D), cy - r * Math.cos((dir - up) * D)];
// Plan-view jet, nose up before rotation.
const JET = 'M0 -11 L2 -4 L10 2 L10 4 L2 2 L1.5 8 L5 10 L5 11.5 L0 10.5 L-5 11.5 L-5 10 L-1.5 8 L-2 2 L-10 4 L-10 2 L-2 -4 Z';
export const jet = (x, y, heading, cls = 'acft', scale = 1) => el('path', { d: JET, class: cls, transform: `translate(${x} ${y}) rotate(${heading}) scale(${scale})` });
// Compass rose: ticks every 10°, cardinal letters and 30° numbers. `up` is
// the direction at the top (heading-up cards rotate with heading).
export function rose(svg, cx, cy, r, up = 0, { labels = true } = {}) {
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

// Optional extras: `bug` draws the heading bug, `track` the ground-track
// marker. For a localizer, leave out `radial` and pass the course bar's
// deflection in `dots` (±2 is full scale) and the glide slope's in `gs`
// (positive: the glide slope is above you, so the pointer sits high).
export function drawHsi(svg, cx, cy, r, { heading, radial, course, dme, toFrom = true, bug, track, dots, gs }) {
  const loc = radial === undefined;
  const view = loc ? { dots: Math.max(-2, Math.min(2, dots ?? 0)) } : hsi({ radial, course });
  rose(svg, cx, cy, r, heading);
  // Lubber line and fixed aircraft.
  svg.append(el('path', { d: `M${cx} ${cy - r - 2} L${cx - 6} ${cy - r - 12} L${cx + 6} ${cy - r - 12} Z`, class: 'fill' }));
  for (const b of [45, 90, 135, 180, 225, 270, 315]) {
    const [x1, y1] = polar(cx, cy, r + 2, b), [x2, y2] = polar(cx, cy, r + 9, b);
    svg.append(el('line', { x1, y1, x2, y2, class: 'ln' }));
  }
  // Bearing pointer: head points to the station, tail sits on your radial.
  if (!loc) {
    const [hx, hy] = polar(cx, cy, r - 2, view.head, heading), [tx, ty] = polar(cx, cy, r - 2, view.tail, heading);
    svg.append(el('line', { x1: tx, y1: ty, x2: hx, y2: hy, class: 'ln heavy on' }));
    svg.append(el('path', { d: 'M0 -12 L7 4 L-7 4 Z', class: 'pointer', transform: `translate(${hx} ${hy}) rotate(${view.head - heading})` }));
    svg.append(el('rect', { x: -5, y: -3, width: 10, height: 6, class: 'box on', transform: `translate(${tx} ${ty}) rotate(${view.tail - heading})` }));
  }
  // Course arrow and CDI bar, rotated to the selected course.
  const g = el('g', { transform: `rotate(${course - heading} ${cx} ${cy})` });
  const L = r * HSI_BAR.halfLength, dot = r * HSI_BAR.dot;
  g.append(el('line', { x1: cx, y1: cy - r + 14, x2: cx, y2: cy - L - 4, class: 'ln heavy' }));
  g.append(el('path', { d: `M${cx} ${cy - r + 10} L${cx - 6} ${cy - r + 22} L${cx + 6} ${cy - r + 22} Z`, class: 'fill' }));
  g.append(el('line', { x1: cx, y1: cy + L + 4, x2: cx, y2: cy + r - 14, class: 'ln heavy' }));
  for (const k of [-2, -1, 1, 2]) g.append(el('circle', { cx: cx + k * dot, cy, r: 3, class: 'dot' }));
  g.append(el('line', { x1: cx + view.dots * dot, y1: cy - L, x2: cx + view.dots * dot, y2: cy + L, class: 'cdi' }));
  if (toFrom && !loc) {
    const y = view.toFrom === 'TO' ? cy - L * 0.6 : cy + L * 0.6;
    g.append(el('path', { d: view.toFrom === 'TO' ? `M${cx + dot * 1.5} ${y - 7} l7 12 l-14 0 Z` : `M${cx + dot * 1.5} ${y + 7} l7 -12 l-14 0 Z`, class: 'fill' }));
  }
  svg.append(g);
  if (bug !== undefined) {
    const [bx, by] = polar(cx, cy, r + 1, bug, heading);
    svg.append(el('path', { d: 'M-7 0 L-7 -7 L-3 -7 L0 -3 L3 -7 L7 -7 L7 0 Z', class: 'box on', transform: `translate(${bx} ${by}) rotate(${bug - heading})` }));
  }
  if (track !== undefined) {
    const [gx, gy] = polar(cx, cy, r - 30, track, heading);
    svg.append(el('path', { d: 'M0 -6 L5 0 L0 6 L-5 0 Z', class: 'box', transform: `translate(${gx} ${gy})` }));
  }
  svg.append(jet(cx, cy, 0, 'acft', 1.3));
  if (gs !== undefined) {
    // Glide slope scale beside the card: centre mark, two dots each way.
    const x = cx + r + 16;
    svg.append(el('line', { x1: x - 7, y1: cy, x2: x + 7, y2: cy, class: 'ln' }));
    for (const k of [-2, -1, 1, 2]) svg.append(el('circle', { cx: x, cy: cy + k * dot, r: 3, class: 'dot' }));
    const g = Math.max(-2, Math.min(2, gs));
    svg.append(el('path', { d: 'M0 0 L9 -6 L9 6 Z', class: 'pointer', transform: `translate(${x - 2} ${cy - g * dot})` }));
    svg.append(el('text', { x, y: cy + 2.5 * dot + 12, class: 'lbl small', 'text-anchor': 'middle' }, 'GS'));
  }
  svg.append(el('text', { x: cx - r, y: cy - r - 6, class: 'lbl small mono' }, `CRS ${deg3(course)}`));
  if (dme !== undefined) svg.append(el('text', { x: cx + r, y: cy - r - 6, class: 'lbl small mono', 'text-anchor': 'end' }, `${dme.toFixed(1)} NM`));
  return view;
}

