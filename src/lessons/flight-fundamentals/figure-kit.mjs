// Drawing helpers shared by the Flight Fundamentals modules' figure scripts:
// SVG elements, arrows, plotting boxes and form plumbing. No models here.
const SVG = 'http://www.w3.org/2000/svg';
export const rad = (d) => d * Math.PI / 180;
export const r0 = (v) => Math.round(v).toLocaleString('en-US');
export const f1 = (v) => v.toFixed(1);
export const f2 = (v) => v.toFixed(2);

export function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
export const frame = (w, h) => el('rect', { x: 1, y: 1, width: w - 2, height: h - 2, class: 'frame' });
export const label = (x, y, text, cls = 'lbl', extra = {}) => el('text', { x, y, class: cls, ...extra }, text);
export const fields = (root) => Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
export const setOut = (root, name, text) => { const o = root.querySelector(`output[for="${name}"]`); if (o) o.textContent = text; };
export const say = (out, lines) => out.replaceChildren(...lines.map((t) => Object.assign(document.createElement('p'), { textContent: t })));

// Arrow from (x1, y1) to (x2, y2) with a filled head; nothing for a zero vector.
export function arrow(x1, y1, x2, y2, cls) {
  const g = el('g', { class: `vec ${cls}` });
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return g;
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len, h = Math.min(10, len * 0.5);
  g.append(
    el('line', { x1, y1, x2: x2 - ux * h * 0.8, y2: y2 - uy * h * 0.8 }),
    el('path', { d: `M${x2} ${y2} L${x2 - ux * h - uy * h * 0.45} ${y2 - uy * h + ux * h * 0.45} L${x2 - ux * h + uy * h * 0.45} ${y2 - uy * h - ux * h * 0.45}Z`, class: 'head' }),
  );
  return g;
}

// A plotting box: maps data to screen and draws the axes, grid and labels.
export function plot(svg, { x, y, w, h, xr, yr, xticks, yticks, xlabel, ylabel, xfmt = r0, yfmt = r0 }) {
  const X = (v) => x + (v - xr[0]) / (xr[1] - xr[0]) * w;
  const Y = (v) => y + h - (v - yr[0]) / (yr[1] - yr[0]) * h;
  for (const t of xticks) {
    svg.append(el('line', { x1: X(t), y1: y, x2: X(t), y2: y + h, class: 'grid' }));
    svg.append(label(X(t), y + h + 15, xfmt(t), 'lbl small', { 'text-anchor': 'middle' }));
  }
  for (const t of yticks) {
    svg.append(el('line', { x1: x, y1: Y(t), x2: x + w, y2: Y(t), class: 'grid' }));
    svg.append(label(x - 6, Y(t) + 4, yfmt(t), 'lbl small', { 'text-anchor': 'end' }));
  }
  svg.append(el('rect', { x, y, width: w, height: h, class: 'thin' }));
  svg.append(label(x + w / 2, y + h + 32, xlabel, 'lbl small', { 'text-anchor': 'middle' }));
  svg.append(label(x - 44, y + h / 2, ylabel, 'lbl small', { 'text-anchor': 'middle', transform: `rotate(-90 ${x - 44} ${y + h / 2})` }));
  const path = (fn, from, to, n = 120) => {
    // Samples outside the plot are left out, and the line restarts where it
    // comes back in, so a curve is clipped rather than flattened at the edge.
    let d = '', pen = false;
    for (let i = 0; i <= n; i++) {
      const v = from + (to - from) * i / n, r = fn(v);
      if (r === null || !Number.isFinite(r) || r < yr[0] || r > yr[1]) { pen = false; continue; }
      d += `${pen ? 'L' : 'M'}${X(v).toFixed(1)} ${Y(r).toFixed(1)}`;
      pen = true;
    }
    return d;
  };
  return { X, Y, path };
}
export const range = (a, b, step) => Array.from({ length: Math.floor((b - a) / step + 1e-9) + 1 }, (_, i) => a + i * step);
