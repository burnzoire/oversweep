import type { Annunciator, Dial, Handle, Lamp, Part, PanelSpec, PushButton, Rotary, ToggleSwitch } from './types';

/**
 * Draws a PanelSpec as NATOPS-style line art (black line on white).
 * Pure string output so the same drawing can be rendered by Astro and by the
 * trace-overlay script (scripts/panel-overlay.mjs).
 */
const INK = 'var(--panel-ink,#171717)';
const FONT = "'Arial Narrow','Roboto Condensed','Liberation Sans Narrow','Helvetica Neue',sans-serif";
/** Reference units per millimetre-equivalent line weight (set per panel while rendering). */
let U = 1;
let PANEL = '';
let uid = 0;
const n = (v: number) => +v.toFixed(2);
/**
 * Line weights snap to three pens (fine, medium, heavy) so the drawing reads as
 * deliberate ink rather than many slightly different hairlines.
 */
const PENS = [0.4, 0.6, 0.9];
const pen = (mm: number) => PENS.reduce((a, b) => (Math.abs(b - mm) < Math.abs(a - mm) ? b : a));
const sw = (mm: number) => `stroke-width="${n(pen(mm) * U)}"`;
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
/**
 * Old-manual ink: a heavy outline with a thin white line down its middle, so
 * bezels, rings and plate edges read as the double-line engraving of a
 * flight-manual illustration. `el` is one self-closing element without a stroke width.
 */
const cased = (el: string, mm: number) =>
  el.replace(/\/>$/, ` ${sw(mm)}/>`) +
  el.replace(/ (fill|class)="[^"]*"/g, '').replace(/\/>$/, ` fill="none" stroke="#fff" stroke-width="${n(pen(mm) * 0.34 * U)}"/>`);
const attrs = (a: Record<string, string> = {}) => Object.entries(a).map(([k, v]) => ` ${k}="${esc(v)}"`).join('');
const rad = (deg: number) => (deg * Math.PI) / 180;
/** Point at `deg` clockwise from 12 o'clock. */
const polar = (x: number, y: number, r: number, deg: number): [number, number] => [x + r * Math.sin(rad(deg)), y - r * Math.cos(rad(deg))];

/** Piecewise-linear value → angle, shared with the page script. */
export function dialAngle(value: number, stops: readonly (readonly [number, number])[]) {
  const i = stops.findIndex(([v]) => value <= v);
  if (i === 0) return stops[0][1];
  if (i < 0) return stops[stops.length - 1][1];
  const [lo, a] = stops[i - 1], [hi, b] = stops[i];
  return a + ((b - a) * (value - lo)) / (hi - lo);
}

/** Cap height → font size, so `cap` matches what is measured on the reference. */
function text(x: number, y: number, s: string, cap: number, width?: number, anchor = 'middle', extra = '') {
  const lines = s.split('\n');
  const gap = cap * 1.45;
  const longest = Math.max(...lines.map(l => l.length));
  return lines.map((line, i) => {
    const ly = y + (i - (lines.length - 1) / 2) * gap;
    /** `width` is the longest line's measured width; shorter lines scale by character count. */
    const fit = width ? ` textLength="${n((width * line.length) / longest)}" lengthAdjust="spacingAndGlyphs"` : '';
    return `<text x="${n(x)}" y="${n(ly + cap / 2)}" font-size="${n(cap / 0.72)}" text-anchor="${anchor}"${fit}${extra}>${esc(line)}</text>`;
  }).join('');
}

function dzus([x, y]: [number, number], r: number, slot = -30) {
  const w = r * 0.12, l = r * 0.6;
  return `<g class="dzus" transform="translate(${n(x)} ${n(y)})">${cased(`<circle r="${n(r)}" fill="#fff"/>`, 0.75)}<circle r="${n(r * 0.74)}" ${sw(0.35)}/>` +
    `<g transform="rotate(${slot})"><path d="M${n(-w * 1.3)} ${n(-r * 0.74)}V${n(r * 0.74)}M${n(w * 1.3)} ${n(-r * 0.74)}V${n(r * 0.74)}" ${sw(0.5)}/></g></g>`;
}

function screw([x, y]: [number, number], r: number) {
  const c = r * 0.42;
  return `<g class="screw" transform="translate(${n(x)} ${n(y)})">${cased(`<circle r="${n(r)}" fill="#fff"/>`, 0.6)}<circle r="${n(r * 0.7)}" ${sw(0.25)}/>` +
    `<path d="M${n(-c)} 0H${n(c)}M0 ${n(-c)}V${n(c)}" ${sw(0.8)}/><path d="M${n(-c)} 0H${n(c)}M0 ${n(-c)}V${n(c)}" stroke="#fff" ${sw(0.25)}/></g>`;
}

/** Lever lean for each position, top to bottom: -1 up, 0 centre, 1 down. */
export function toggleOffsets(t: ToggleSwitch) {
  const k = t.positions.length === 3 ? [-1, 0, 1] : [-1, 1];
  return t.positions.map((p, i) => ({ id: p.id, k: p.k ?? k[i] }));
}

/**
 * Toggle lever seen from the front. The bat is drawn as chunky as on the real
 * switch: a lever that flares from the bushing to a ball about the bushing's
 * own size (measured on the DCS guide images), so it reads at a glance.
 */
function toggle(t: ToggleSwitch) {
  const [x, y] = t.at, r = t.r, L = r * (t.reach ?? 1.05);
  const face = t.face ?? 'bat';
  /** Lever half-width at the bushing and at the tip. */
  const [w0, w1] = face === 'paddle' ? [0.3, 0.42] : face === 'rocker' ? [0.5, 0.5] : face === 'square' ? [0.32, 0.5] : [0.3, 0.5];
  const tip = face === 'paddle'
    ? cased(`<rect x="${n(-r * 0.62)}" y="${n(-r * 0.42)}" width="${n(r * 1.24)}" height="${n(r * 0.84)}" rx="${n(r * 0.3)}" fill="#fff"/>`, 0.6)
    : face === 'rocker'
      ? cased(`<rect x="${n(-r * 2.6)}" y="${n(-r * 0.9)}" width="${n(r * 5.2)}" height="${n(r * 1.8)}" rx="${n(r * 0.9)}" fill="#fff"/>`, 0.6) +
        [-1.7, 0, 1.7].map(o => `<circle cx="${n(r * o)}" r="${n(r * 0.6)}" fill="#fff" ${sw(0.4)}/>`).join('')
    : face === 'square'
      ? cased(`<rect x="${n(-r * 0.78)}" y="${n(-r * 0.7)}" width="${n(r * 1.56)}" height="${n(r * 1.4)}" rx="${n(r * 0.18)}" fill="#fff"/>`, 0.6) +
        `<rect x="${n(-r * 0.5)}" y="${n(-r * 0.44)}" width="${n(r)}" height="${n(r * 0.88)}" rx="${n(r * 0.1)}" fill="#fff" ${sw(0.4)}/>`
      : cased(`<circle r="${n(r * 0.66)}" fill="#fff"/>`, 0.6) + `<circle r="${n(r * 0.34)}" ${sw(0.4)}/>`;
  /** Hex nut on the bushing, flats top and bottom. */
  const hex = Array.from({ length: 6 }, (_, i) => polar(0, 0, r * 0.72, 30 + i * 60)).map(([px, py]) => `${n(px)} ${n(py)}`).join('L');
  return `<g class="toggle" data-toggle="${t.id}" transform="translate(${n(x)} ${n(y)})">` +
    cased(`<circle r="${n(r)}" fill="#fff"/>`, 0.6) + `<path d="M${hex}Z" ${sw(0.4)}/>` +
    `<path class="shaft" d="M${n(-r * w0)} 0A${n(r * w0)} ${n(r * w0)} 0 0 1 ${n(r * w0)} 0L${n(r * w1)} ${n(L)}H${n(-r * w1)}Z" fill="#fff" ${sw(0.6)}/>` +
    `<g class="tip">${tip}</g></g>`;
}

function rotary(k: Rotary) {
  const [x, y] = k.at, r = k.r;
  let knob: string;
  if ((k.knob ?? 'pointer') === 'pointer') {
    knob = `<path d="M${n(-r * 0.36)} ${n(r * 0.92)}L${n(-r * 0.24)} ${n(-r * 0.98)}Q0 ${n(-r * 1.12)} ${n(r * 0.24)} ${n(-r * 0.98)}L${n(r * 0.36)} ${n(r * 0.92)}Q0 ${n(r * 1.04)} ${n(-r * 0.36)} ${n(r * 0.92)}Z" fill="#fff" ${sw(0.6)}/>` +
      `<path d="M0 ${n(-r * 0.92)}V${n(-r * 0.35)}" ${sw(0.5)}/>`;
  } else {
    const flutes = 18, pts: string[] = [];
    for (let i = 0; i < flutes * 2; i++) {
      const [px, py] = polar(0, 0, i % 2 ? r * 0.9 : r, (i * 180) / flutes);
      pts.push(`${n(px)} ${n(py)}`);
    }
    knob = `<path d="M${pts.join('L')}Z" fill="#fff" ${sw(0.45)}/>${cased(`<circle r="${n(r * 0.72)}" fill="#fff"/>`, 0.55)}<path d="M0 ${n(-r * 0.95)}V${n(-r * 0.2)}" ${sw(0.6)}/>`;
  }
  return `<g class="rotary" data-rotary="${k.id}" transform="translate(${n(x)} ${n(y)})">${cased(`<circle r="${n(r * 1.08)}" fill="#fff"/>`, 0.7)}<g class="knob">${knob}</g></g>`;
}

function pushbutton(b: PushButton) {
  if (b.bare) return '';
  const [x, y] = b.at, r = b.r;
  if (b.shape === 'square') {
    return `<g class="pushbutton" data-pushbutton="${b.id}" transform="translate(${n(x)} ${n(y)})">` +
      cased(`<rect x="${n(-r)}" y="${n(-r)}" width="${n(2 * r)}" height="${n(2 * r)}" rx="${n(r * 0.14)}" fill="#fff"/>`, 0.7) +
      `<g class="cap">${cased(`<rect x="${n(-r * 0.72)}" y="${n(-r * 0.72)}" width="${n(r * 1.44)}" height="${n(r * 1.44)}" rx="${n(r * 0.1)}" fill="#fff"/>`, 0.55)}</g></g>`;
  }
  return `<g class="pushbutton" data-pushbutton="${b.id}" transform="translate(${n(x)} ${n(y)})">` +
    cased(`<circle r="${n(r)}" fill="#fff"/>`, 0.75) + `<circle r="${n(r * 0.84)}" ${sw(0.35)}/>` +
    `<g class="cap">${cased(`<circle r="${n(r * 0.66)}" fill="#fff"/>`, 0.65)}</g></g>`;
}

function handle(h: Handle) {
  return `<g class="handle" data-handle="${h.id}" transform="translate(${n(h.at[0])} ${n(h.at[1])})"><g class="handle-body">${cased(`<path d="${h.d}" fill="#fff"/>`, 0.6)}</g></g>`;
}

function annunciator(a: Annunciator) {
  const [x, y] = a.at, [w, h] = a.size, inset = a.inset ?? 0.9 * U;
  const lx = x + inset, ly = y + inset, lw = w - inset * 2, lh = h - inset * 2;
  const ch = lh / a.cells.length;
  let s = `<g class="annunciator ${a.colour ?? 'amber'}">`;
  if (inset > 0) {
    s += cased(`<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(1.4 * U)}" fill="#fff"/>`, 0.7);
    s += `<rect x="${n(lx)}" y="${n(ly)}" width="${n(lw)}" height="${n(lh)}" rx="${n(0.7 * U)}" fill="#fff" ${sw(0.4)}/>`;
  } else s += cased(`<rect x="${n(lx)}" y="${n(ly)}" width="${n(lw)}" height="${n(lh)}" rx="${n(0.5 * U)}" fill="#fff"/>`, 0.6);
  a.cells.forEach((c, i) => {
    const cy = ly + ch * i;
    s += `<g class="lamp"${c.lamp ? ` data-lamp="${c.lamp}"` : ''}${attrs(c.attrs)}><rect class="lens" x="${n(lx + 0.3 * U)}" y="${n(cy + 0.3 * U)}" width="${n(lw - 0.6 * U)}" height="${n(ch - 0.6 * U)}" rx="${n(0.3 * U)}" stroke="none"/>`;
    s += c.text ? text(lx + lw / 2, cy + ch / 2, c.text, a.cap ?? 3 * U, c.width) : `<path d="M${n(lx + lw * 0.3)} ${n(cy + ch / 2)}H${n(lx + lw * 0.7)}" ${sw(0.35)}/>`;
    s += '</g>';
    if (i && a.divider !== false) s += `<path d="M${n(lx)} ${n(cy)}H${n(lx + lw)}" ${sw(0.3)}/>`;
  });
  return s + '</g>';
}

function lamp(l: Lamp) {
  const [x, y] = l.at;
  return `<g class="annunciator ${l.colour ?? 'amber'}"><g class="lamp"${l.lamp ? ` data-lamp="${l.lamp}"` : ''}${attrs(l.attrs)} transform="translate(${n(x)} ${n(y)})">` +
    cased(`<circle r="${n(l.r)}" fill="#fff"/>`, 0.65) + `<circle class="lens" r="${n(l.r * 0.72)}" ${sw(0.35)}/></g></g>`;
}

function dial(d: Dial) {
  const [x, y] = d.at, r = d.r;
  let s = `<g class="dial">`;
  s += cased(`<circle cx="${n(x)}" cy="${n(y)}" r="${n(r * 1.12)}" fill="#fff"/>`, 0.85) + `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r * 1.04)}" ${sw(0.35)}/>`;
  if (d.ring) {
    const [a0, a1] = d.ring, [sx, sy] = polar(x, y, r, a0), [ex, ey] = polar(x, y, r, a1);
    s += `<path d="M${n(sx)} ${n(sy)}A${n(r)} ${n(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${n(ex)} ${n(ey)}" ${sw(0.3)}/>`;
  }
  for (const t of d.ticks) {
    for (let v = t.from; v <= t.to + 1e-9; v += t.step) {
      const a = dialAngle(v, d.stops), [ox, oy] = polar(x, y, r, a), [ix, iy] = polar(x, y, r - t.len, a);
      s += `<path d="M${n(ox)} ${n(oy)}L${n(ix)} ${n(iy)}" ${sw(t.width ?? 0.35)}/>`;
    }
  }
  for (const nm of d.numerals) {
    const [tx, ty] = polar(x, y, nm.radius, dialAngle(nm.value, d.stops));
    s += text(tx, ty, nm.text, nm.size);
  }
  for (const l of d.labels ?? []) s += text(l.at[0], l.at[1], l.text, l.size, l.width);
  const L = d.needleLength, a0 = dialAngle(d.initial, d.stops);
  s += `<g data-needle="${d.needle}" data-pivot="${n(x)} ${n(y)}" data-stops="${esc(JSON.stringify(d.stops))}" transform="translate(${n(x)} ${n(y)}) rotate(${n(a0)})">` +
    `<path d="M${n(-L * 0.05)} ${n(L * 0.14)}L${n(-L * 0.055)} ${n(-L * 0.2)}L${n(-L * 0.022)} ${n(-L * 0.8)}L0 ${n(-L)}L${n(L * 0.022)} ${n(-L * 0.8)}L${n(L * 0.055)} ${n(-L * 0.2)}L${n(L * 0.05)} ${n(L * 0.14)}Z" fill="${INK}" stroke="none"/>` +
    `<circle r="${n(L * 0.06)}" fill="#fff" ${sw(0.4)}/></g>`;
  return s + '</g>';
}

function hatch(at: [number, number], size: [number, number], gap = 4 * U, rx = 0) {
  const [x, y] = at, [w, h] = size, id = `${PANEL}-hatch-${uid++}`;
  let stripes = '';
  for (let o = -h; o < w + h; o += gap * 2) {
    stripes += `M${n(x + o)} ${n(y + h)}L${n(x + o + h)} ${n(y)}L${n(x + o + h + gap)} ${n(y)}L${n(x + o + gap)} ${n(y + h)}Z`;
  }
  return `<clipPath id="${id}"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}"/></clipPath>` +
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" fill="#fff"/>` +
    `<path clip-path="url(#${id})" d="${stripes}" fill="${INK}" stroke="none"/>` +
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rx)}" ${sw(0.6)}/>`;
}

function part(p: Part): string {
  switch (p.kind) {
    case 'dzus': return dzus(p.at, p.r, p.slot);
    case 'screw': return screw(p.at, p.r);
    case 'rule': return `<path d="M${n(p.from[0])} ${n(p.from[1])}L${n(p.to[0])} ${n(p.to[1])}" ${sw(p.width ?? 0.45)}/>`;
    case 'label': return text(p.at[0], p.at[1], p.text, p.size, p.width, p.anchor,
      (p.rotate ? ` transform="rotate(${p.rotate} ${n(p.at[0])} ${n(p.at[1])})"` : '') + (p.weight ? ` font-weight="${p.weight}"` : ''));
    case 'path': return `<path d="${p.d}"${p.fill ? ` fill="${p.fill}"` : ''} ${sw(p.width ?? 0.45)}${p.dash ? ` stroke-dasharray="${p.dash}"` : ''}/>`;
    case 'hatch': return hatch(p.at, p.size, p.gap, p.rx);
    case 'toggle': return toggle(p);
    case 'rotary': return rotary(p);
    case 'pushbutton': return pushbutton(p);
    case 'handle': return handle(p);
    case 'annunciator': return annunciator(p);
    case 'lamp': return lamp(p);
    case 'dial': return dial(p);
  }
}

/** Per-panel CSS: control positions keyed on state, lit lamps, pressed caps. */
function stateCss(spec: PanelSpec) {
  const c = '.cockpit-panel-svg', root = `[data-panel-id="${spec.id}"]`;
  let css = `${c} .lamp .lens{fill:transparent;transition:fill .15s}${c} .amber .lamp.lit .lens{fill:#ffbd42}${c} .green .lamp.lit .lens{fill:#5fd068}${c} .red .lamp.lit .lens{fill:#ff6b5b}` +
    `${c} .shaft,${c} .tip,${c} .knob,${c} .handle-body,${c} .pushbutton .cap{transition:transform .18s ease-out}` +
    `@media(prefers-reduced-motion:reduce){${c} .shaft,${c} .tip,${c} .knob,${c} .handle-body,${c} .pushbutton .cap,${c} .lamp .lens{transition:none}}`;
  /** Selector for "control `id` is at position `pos`". */
  const when = (id: string, pos: string, stateAttr?: string) =>
    stateAttr ? `${root}[data-${stateAttr}="${pos}"]` : `${root}:has(>[data-hit="${id}"][data-position="${pos}"])`;
  for (const p of spec.parts) {
    if (p.kind === 'toggle') {
      const L = p.r * (p.reach ?? 1.05);
      for (const o of toggleOffsets(p)) {
        const sel = o.id === p.initial ? `${root} [data-toggle="${p.id}"]` : `${when(p.id, o.id, p.stateAttr)} [data-toggle="${p.id}"]`;
        css += `${sel} .shaft{transform:scaleY(${o.k})}${sel} .tip{transform:translateY(${n(o.k * L)}px)}`;
      }
    }
    if (p.kind === 'rotary') {
      for (const o of p.positions) {
        const sel = o.id === p.initial ? `${root} [data-rotary="${p.id}"]` : `${when(p.id, o.id)} [data-rotary="${p.id}"]`;
        css += `${sel} .knob{transform:rotate(${o.angle}deg)}`;
      }
    }
    if (p.kind === 'handle') {
      for (const o of p.positions) {
        const pressed = p.pressedBy && o.id !== p.initial ? `${root}:has(>[data-press="${p.pressedBy}"][aria-pressed="true"]) [data-handle="${p.id}"]` : '';
        const sel = o.id === p.initial ? `${root} [data-handle="${p.id}"]` : pressed || `${when(p.id, o.id)} [data-handle="${p.id}"]`;
        css += `${sel} .handle-body{transform:translate(${n(o.dx ?? 0)}px,${n(o.dy ?? 0)}px)}`;
      }
    }
    if (p.kind === 'pushbutton' && !p.bare) {
      css += `${root}:has(>[data-press="${p.id}"]:active,>[data-press="${p.id}"].pulse) [data-pushbutton="${p.id}"] .cap{transform:scale(.88)}`;
    }
  }
  return css;
}

export function renderPanelSvg(spec: PanelSpec, opts: { title?: boolean } = {}) {
  U = spec.unit ?? 1;
  PANEL = spec.id;
  uid = 0;
  const [w, h] = spec.size;
  /** The outer plate and raised plates get the cased double edge; the outer one is heaviest. */
  const plates = spec.plates.map((p, i) =>
    (p.raised ? `<path d="${p.d}" transform="translate(${n(0.6 * U)} ${n(0.6 * U)})" ${sw(0.5)}/>` : '') +
    (p.raised || i === 0 ? cased(`<path d="${p.d}" fill="${p.fill ?? '#fff'}"/>`, i === 0 ? 1 : 0.75)
      : `<path d="${p.d}" fill="${p.fill ?? '#fff'}" ${sw(0.45)}/>`)).join('');
  return (`<svg class="cockpit-panel-svg" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" ${opts.title ? `role="img" aria-label="${esc(spec.title)}"` : 'aria-hidden="true"'}>` +
    `<style>${stateCss(spec)}</style>` +
    `<g fill="none" stroke="${INK}" stroke-width="${n(0.45 * U)}" stroke-linejoin="round" stroke-linecap="round" font-family="${FONT}" font-weight="700">` +
    `<g class="plates">${plates}</g>` +
    `<g class="parts">${spec.parts.map(part).join('')}</g></g></svg>`)
    .replace(/<text /g, `<text fill="${INK}" stroke="none" `);
}

/** Hit zones in percent of the panel, generated from the same coordinates as the art. */
export type HitZone = { part: ToggleSwitch | Rotary | PushButton | Handle; style: string };

export function hitZones(spec: PanelSpec): HitZone[] {
  const [w, h] = spec.size;
  const pct = (v: number, of: number) => `${n((v / of) * 100)}%`;
  return spec.parts.flatMap((p): HitZone[] => {
    if (p.kind === 'toggle' || p.kind === 'rotary') {
      const d = p.r * (p.hit ?? 2.4);
      return [{ part: p, style: `left:${pct(p.at[0], w)};top:${pct(p.at[1], h)};width:${pct(d, w)};aspect-ratio:1` }];
    }
    if (p.kind === 'pushbutton') {
      return [{ part: p, style: `left:${pct(p.at[0], w)};top:${pct(p.at[1], h)};width:${pct(p.r * 2, w)};aspect-ratio:1` }];
    }
    if (p.kind === 'handle') {
      if (p.pressedBy) return [];
      const [ox, oy] = p.hitOffset ?? [0, 0];
      return [{ part: p, style: `left:${pct(p.at[0] + ox, w)};top:${pct(p.at[1] + oy, h)};width:${pct(p.hitSize[0], w)};height:${pct(p.hitSize[1], h)}` }];
    }
    return [];
  });
}
