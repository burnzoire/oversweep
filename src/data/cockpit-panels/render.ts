import type { Annunciator, Part, PanelSpec, PushButton, ToggleSwitch } from './types';

/**
 * Draws a PanelSpec as NATOPS-style line art (black line on white, mm user units).
 * Pure string output so the same drawing can be rendered by Astro and by the
 * trace-overlay script (scripts/panel-overlay.mjs).
 */
const INK = 'var(--panel-ink,#171717)';
const FONT = "'Arial Narrow','Roboto Condensed','Liberation Sans Narrow','Helvetica Neue',sans-serif";
/** Reference units per millimetre-equivalent line weight (set per panel). */
let U = 1;
const n = (v: number) => +v.toFixed(2);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/** Cap height in mm → font size, so `size` matches what is measured on the reference. */
function text(x: number, y: number, s: string, cap: number, width?: number, anchor = 'middle') {
  const fit = width ? ` textLength="${n(width)}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${n(x)}" y="${n(y + cap / 2)}" font-size="${n(cap / 0.72)}" text-anchor="${anchor}"${fit}>${esc(s)}</text>`;
}

function dzus([x, y]: [number, number], r: number, slot = -30) {
  const w = r * 0.12, l = r * 0.6;
  return `<g class="dzus" transform="translate(${n(x)} ${n(y)})"><circle r="${n(r)}" fill="#fff"/><circle r="${n(r * 0.72)}" stroke-width="${n(0.3*U)}"/>` +
    `<g transform="rotate(${slot})"><path d="M${n(-w)} ${n(-l)}V${n(l)}M${n(w)} ${n(-l)}V${n(l)}" stroke-width="${n(0.35*U)}"/></g></g>`;
}

function screw([x, y]: [number, number], r: number) {
  const c = r * 0.42;
  return `<g class="screw" transform="translate(${n(x)} ${n(y)})"><circle r="${n(r)}" fill="#fff"/><circle r="${n(r * 0.66)}" stroke-width="${n(0.25*U)}"/>` +
    `<path d="M${n(-c)} 0H${n(c)}M0 ${n(-c)}V${n(c)}" stroke-width="${n(0.45*U)}"/></g>`;
}

/** Lever offsets for each position, top to bottom: -1 up, 0 centre, 1 down. */
export function toggleOffsets(t: ToggleSwitch) {
  const k = t.positions.length === 3 ? [-1, 0, 1] : [-1, 1];
  return t.positions.map((p, i) => ({ id: p.id, k: k[i] }));
}

function toggle(t: ToggleSwitch) {
  const [x, y] = t.at, L = t.r * 1.05;
  return `<g class="toggle" data-toggle="${t.id}" transform="translate(${n(x)} ${n(y)})">` +
    `<circle r="${n(t.r)}" fill="#fff"/><circle r="${n(t.r * 0.78)}" stroke-width="${n(0.3*U)}"/><circle r="${n(t.r * 0.5)}" stroke-width="${n(0.3*U)}"/>` +
    `<path class="shaft" d="M${n(-t.r * 0.18)} 0H${n(t.r * 0.18)}L${n(t.r * 0.23)} ${n(L)}H${n(-t.r * 0.23)}Z" fill="#fff" stroke-width="${n(0.35*U)}"/>` +
    `<g class="tip"><circle r="${n(t.r * 0.4)}" fill="#fff" stroke-width="${n(0.4*U)}"/><circle r="${n(t.r * 0.24)}" stroke-width="${n(0.2*U)}"/></g></g>`;
}

function pushbutton(b: PushButton) {
  const [x, y] = b.at;
  return `<g class="pushbutton" data-pushbutton="${b.id}" transform="translate(${n(x)} ${n(y)})">` +
    `<circle r="${n(b.r)}" fill="#fff"/><circle r="${n(b.r * 0.86)}" stroke-width="${n(0.25*U)}"/>` +
    `<g class="cap"><circle r="${n(b.r * 0.66)}" fill="#fff" stroke-width="${n(0.45*U)}"/><path d="M${n(-b.r * 0.38)} ${n(-b.r * 0.3)}A${n(b.r * 0.5)} ${n(b.r * 0.5)} 0 0 1 ${n(b.r * 0.3)} ${n(-b.r * 0.42)}" stroke-width="${n(0.25*U)}"/></g></g>`;
}

function annunciator(a: Annunciator) {
  const [x, y] = a.at, [w, h] = a.size, inset = 0.9 * U;
  const lx = x + inset, ly = y + inset, lw = w - inset * 2, lh = h - inset * 2;
  const ch = lh / a.cells.length;
  let s = `<g class="annunciator ${a.colour ?? 'amber'}"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(0.9 * U)}" fill="#fff"/>` +
    `<rect x="${n(lx)}" y="${n(ly)}" width="${n(lw)}" height="${n(lh)}" rx="${n(0.4 * U)}" stroke-width="${n(0.3*U)}"/>`;
  a.cells.forEach((c, i) => {
    const cy = ly + ch * i;
    s += `<g class="lamp"${c.lamp ? ` data-lamp="${c.lamp}"` : ''}><rect class="lens" x="${n(lx + 0.3 * U)}" y="${n(cy + 0.3 * U)}" width="${n(lw - 0.6 * U)}" height="${n(ch - 0.6 * U)}" rx="${n(0.3 * U)}" stroke="none"/>`;
    s += c.text ? text(lx + lw / 2, cy + ch / 2, c.text, a.cap ?? 3 * U, c.width) : `<path d="M${n(lx + lw * 0.2)} ${n(cy + ch / 2)}H${n(lx + lw * 0.8)}" stroke-width="${n(0.35*U)}"/>`;
    s += '</g>';
    if (i) s += `<path d="M${n(lx)} ${n(cy)}H${n(lx + lw)}" stroke-width="${n(0.2*U)}"/>`;
  });
  return s + '</g>';
}

function part(p: Part): string {
  switch (p.kind) {
    case 'dzus': return dzus(p.at, p.r, p.slot);
    case 'screw': return screw(p.at, p.r);
    case 'rule': return `<path d="M${n(p.from[0])} ${n(p.from[1])}L${n(p.to[0])} ${n(p.to[1])}" stroke-width="${n(0.35*U)}"/>`;
    case 'label': return text(p.at[0], p.at[1], p.text, p.size, p.width, p.anchor);
    case 'toggle': return toggle(p);
    case 'pushbutton': return pushbutton(p);
    case 'annunciator': return annunciator(p);
  }
}

/** Per-panel CSS: lever positions keyed on the root's state attribute, lit lamps, pressed caps. */
function stateCss(spec: PanelSpec) {
  const c = '.cockpit-panel-svg';
  let css = `${c} .lamp .lens{fill:transparent;transition:fill .15s}${c} .amber .lamp.lit .lens{fill:#ffbd42}${c} .green .lamp.lit .lens{fill:#5fd068}${c} .red .lamp.lit .lens{fill:#ff6b5b}` +
    `${c} .shaft,${c} .tip,${c} .pushbutton .cap{transition:transform .18s ease-out}` +
    `@media(prefers-reduced-motion:reduce){${c} .shaft,${c} .tip,${c} .pushbutton .cap,${c} .lamp .lens{transition:none}}`;
  for (const p of spec.parts) {
    if (p.kind === 'toggle') {
      const L = p.r * 1.05, attr = `data-${p.stateAttr ?? p.id}`;
      for (const o of toggleOffsets(p)) {
        const sel = o.id === p.initial ? `[data-toggle="${p.id}"]` : `[${attr}="${o.id}"] [data-toggle="${p.id}"]`;
        css += `${sel} .shaft{transform:scaleY(${o.k})}${sel} .tip{transform:translateY(${n(o.k * L)}px)}`;
      }
    }
    if (p.kind === 'pushbutton') {
      css += `:has(>[data-press="${p.id}"]:active,>[data-press="${p.id}"].pulse)>svg [data-pushbutton="${p.id}"] .cap{transform:scale(.88)}`;
    }
  }
  return css;
}

export function renderPanelSvg(spec: PanelSpec, opts: { title?: boolean } = {}) {
  U = spec.unit ?? 1;
  const [w, h] = spec.size;
  const plates = spec.plates.map(p =>
    (p.raised ? `<path d="${p.d}" transform="translate(${n(0.45 * U)} ${n(0.45 * U)})" stroke="#9a9a9a" stroke-width="${n(0.5*U)}"/>` : '') +
    `<path d="${p.d}" fill="#fff" stroke-width="${p.raised ? 0.45 : 0.35}"/>`).join('');
  return `<svg class="cockpit-panel-svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${opts.title ? `role="img" aria-label="${esc(spec.title)}"` : 'aria-hidden="true"'}>` +
    `<style>${stateCss(spec)}</style>` +
    `<g fill="none" stroke="${INK}" stroke-width="${n(0.35*U)}" stroke-linejoin="round" font-family="${FONT}" font-weight="600">` +
    `<g class="plates">${plates}</g>` +
    `<g class="parts">${spec.parts.map(part).join('')}</g></g></svg>`
    .replace(/<text /g, `<text fill="${INK}" stroke="none" `);
}

/** Hit zones in percent of the panel, generated from the same coordinates as the art. */
export function hitZones(spec: PanelSpec) {
  const [w, h] = spec.size;
  const pct = (v: number, of: number) => `${n((v / of) * 100)}%`;
  return spec.parts.flatMap(p => {
    if (p.kind !== 'toggle' && p.kind !== 'pushbutton') return [];
    const d = p.kind === 'toggle' ? p.r * 2.4 : p.r * 2;
    return [{ part: p, style: `left:${pct(p.at[0], w)};top:${pct(p.at[1], h)};width:${pct(d, w)}` }];
  });
}
