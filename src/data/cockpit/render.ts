/**
 * Assembles a PanelSpec into SVG (string output, so Astro pages and the review
 * scripts draw exactly the same thing). There is no panel-specific code: every
 * panel is plate + engraving + shared components placed by pivot.
 *
 * Moving parts are separate groups, one per position:
 *   <g data-move="<control>"><g data-pos="<position>">…</g>…</g>
 * Only the current position is displayed (`display="none"` on the others);
 * the client engine flips them. Lamps are `<g data-indicator="<id>">` with a
 * `.lens` rect that lights when the group gets the `lit` class.
 */
import type { ControlDef, Cut, Dial, DrumCounter, PanelSpec, Placement, Pt } from './types';
import {
  FASTENERS, FONT, INK, LAMPS, PAPER, PUSHES, ROTARIES, TOGGLES, cased, esc, fastener, guardArt, painted, PAINTS, lampModuleFrame, lampRoundBezel, n,
  gaugeBezel, gaugeHub, drumStrip, paddlePointerArt, PADDLE_POINTER, gearKnob, gearSlot, knobArt, needleArt, polar, KNOBS, pushBase, pushCap, pushSquareBase, pushSquareCap, rotaryBase, rotaryKnob, sw, text, toggleBase, toggleLeans, toggleLever,
} from './components.ts';
import { drumPositions, scaleAngle } from './dial.ts';
export { drumPositions };

const at = ([x, y]: Pt, body: string, extra = '') => `<g transform="translate(${n(x)} ${n(y)})"${extra}>${body}</g>`;

/** Turns `body` by `deg` (clockwise) about (cx, cy); unchanged when there is no turn. */
const turn = (deg: number | undefined, cx: number, cy: number, body: string) =>
  deg ? `<g transform="rotate(${deg} ${n(cx)} ${n(cy)})">${body}</g>` : body;

/** Axis-aligned box around a w x h rectangle centred on (cx, cy), turned by `deg`. */
export function controlOf(spec: PanelSpec, id: string): ControlDef {
  const c = spec.controls.find(c => c.id === id);
  if (!c) throw new Error(`${spec.id}: placement refers to unknown control "${id}"`);
  return c;
}

/** One `<g data-pos>` per position; only `current` is displayed. */
function moving(c: ControlDef, current: string, draw: (posIndex: number) => string, transform = '') {
  return `<g data-move="${c.id}"${transform}>` + c.positions.map((p, i) =>
    `<g data-pos="${p.id}"${p.id === current ? '' : ' display="none"'}>${draw(i)}</g>`).join('') + '</g>';
}

/**
 * The face plate cut away around a DZUS fastener toward a plate corner: two
 * straight edges running out to the plate edges, joined by a quarter round
 * about the fastener on the side away from the corner (clipped to the plate).
 * Absolute coordinates, so the plate clip applies directly.
 */
function dzusCut([x, y]: Pt, corner: Cut) {
  const c = FASTENERS.dzus.cut, far = 1000;
  const sy = corner.startsWith('up') ? -1 : 1, sx = corner.endsWith('left') ? -1 : 1;
  const ax = x - sx * c, by = y - sy * c;
  const edge = `M${n(ax)} ${n(y + sy * far)}V${n(y)}A${n(c)} ${n(c)} 0 0 ${sx * sy < 0 ? 0 : 1} ${n(x)} ${n(by)}H${n(x + sx * far)}`;
  // On a layered panel the notch clears the upper layers' borders inside it.
  return { hole: `<path d="${edge}V${n(y + sy * far)}Z" fill="${PAPER}" stroke="none"/>`, edge: `<path d="${edge}" ${sw('medium')}/>` };
}

/** Needle angle (degrees clockwise from 12 o'clock) for `value`, linear between the dial's scale knots, clamped at the ends. */
export const dialAngle = (dial: Dial, value: number) => scaleAngle(dial.scale, value);

/** Every tick value of a run, without the values another run draws. */
export function tickValues(t: Dial['ticks'][number]) {
  const out: number[] = [];
  for (let i = 0; ; i++) {
    const v = +(t.from + i * t.step).toFixed(6);
    if (v > t.to + 1e-9) break;
    if (t.skip && Math.abs(v / t.skip - Math.round(v / t.skip)) < 1e-9) continue;
    out.push(v);
  }
  return out;
}

/** Ring sector between two radii and two angles (clockwise from 12 o'clock). */
function sector(r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = polar(r1, a0), [x1, y1] = polar(r1, a1), [x2, y2] = polar(r0, a1), [x3, y3] = polar(r0, a0), big = a1 - a0 > 180 ? 1 : 0;
  return `M${n(x0)} ${n(y0)}A${n(r1)} ${n(r1)} 0 ${big} 1 ${n(x1)} ${n(y1)}L${n(x2)} ${n(y2)}A${n(r0)} ${n(r0)} 0 ${big} 0 ${n(x3)} ${n(y3)}Z`;
}

/** Drum counter (totalizer): drums behind a window, each turned to its odometer position. */
function counter(c: DrumCounter, value: number, clip: string) {
  const [w, h] = c.window, pos = drumPositions(value, c.drums, c.fixed, c.unit, c.still);
  const drumX = (k: number) => c.at[0] + (k - (c.drums - 1) / 2) * c.pitch;
  // The window, plus any taller slot a drum shows through (the clip is their union).
  const rects = [[c.at[0] - w / 2, c.at[1] - h / 2, w, h], ...(c.slots ?? []).map(t => [drumX(t.drum) - c.pitch / 2, c.at[1] - t.h / 2, c.pitch, t.h])]
    .map(([x, y, rw, rh]) => `<rect x="${n(x)}" y="${n(y)}" width="${n(rw)}" height="${n(rh)}"`);
  let s = `<defs><clipPath id="${clip}">${rects.map(r => r + '/>').join('')}</clipPath></defs><g clip-path="url(#${clip})">`;
  pos.forEach((p, k) => {
    s += `<g transform="translate(${n(drumX(k))} ${n(c.at[1])})"><g data-drum="${c.indicator}" data-place="${k}" transform="translate(0 ${n(-p * c.roll)})">${drumStrip(c.roll, c.cap, c.width, k >= c.drums - c.fixed, k < (c.blank ?? 0), c.stroked)}</g></g>`;
  });
  return s + `</g><g data-indicator="${c.indicator}">${rects.map(r => r + ' class="lens" stroke="none"/>').join('')}</g>`;
}

/** Dial art: bezel, face, painted ticks and sectors, legends, counter, needle or pointers (turned to their values), hub. */
function gauge(spec: PanelSpec, dial: Dial, indicator: string | undefined, value: (id: string) => number) {
  let s = gaugeBezel(dial.bezel, dial.face);
  for (const f of dial.fills ?? []) s += `<path d="${sector(f.r[0], f.r[1], dialAngle(dial, f.from), dialAngle(dial, f.to))}" fill="${INK}" ${sw('fine')}/>`;
  for (const t of dial.ticks) {
    const d = tickValues(t).map(v => {
      const a = dialAngle(dial, v), [x0, y0] = polar(t.r[0], a), [x1, y1] = polar(t.r[1], a);
      return `M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`;
    }).join('');
    s += `<path d="${d}" stroke-width="${n(t.width)}" stroke-linecap="butt"/>`;
  }
  s += dial.legends.map(l => text(l.at[0], l.at[1], l.text, l.cap, l.width)).join('');
  if (dial.counter) s += counter(dial.counter, value(dial.counter.indicator), `drums-${spec.id}-${dial.counter.indicator}`);
  if (indicator && dial.needle) s += `<g data-indicator="${indicator}"><circle class="lens" r="${n(dial.face)}" stroke="none"/>` +
    `<g data-needle="${indicator}" transform="rotate(${n(dialAngle(dial, value(indicator)))})">${needleArt(dial.needle)}</g></g>`;
  for (const p of dial.pointers ?? []) s += `<g data-indicator="${p.indicator}"><g data-needle="${p.indicator}" transform="rotate(${n(dialAngle(dial, value(p.indicator)))})">${paddlePointerArt(p.legend)}</g></g>`;
  return s + gaugeHub(dial.hub);
}

/** What the page needs to move a reading: a needle's scale or a counter's drums, and the range to try. */
export type Reading =
  | { kind: 'needle'; scale: Dial['scale']; range: [number, number, number] }
  | { kind: 'counter'; drums: number; fixed: number; unit: number; roll: number; still?: boolean; range: [number, number, number] };

/** Every gauge and counter reading on a panel, by indicator id. */
export function readings(spec: PanelSpec): Record<string, Reading> {
  const out: Record<string, Reading> = {};
  const ind = (id: string) => spec.indicators.find(i => i.id === id);
  const drums = (c: DrumCounter) => { out[c.indicator] = { kind: 'counter', drums: c.drums, fixed: c.fixed, unit: c.unit, roll: c.roll, ...(c.still ? { still: true } : {}), range: ind(c.indicator)?.range ?? [0, c.unit * 10 ** (c.drums - c.fixed) - c.unit, c.unit / 10] }; };
  for (const p of spec.placements) {
    if (p.component === 'counter') drums(p.counter);
    if (p.component !== 'gauge') continue;
    const { dial } = p;
    const lo = dial.scale[0][0], hi = dial.scale[dial.scale.length - 1][0];
    const needle = (id: string) => { out[id] = { kind: 'needle', scale: dial.scale, range: ind(id)?.range ?? [lo, hi, 10 ** Math.floor(Math.log10((hi - lo) / 100))] }; };
    if (p.indicator) needle(p.indicator);
    for (const q of dial.pointers ?? []) needle(q.indicator);
    if (dial.counter) drums(dial.counter);
  }
  return out;
}

/** Every indicator a dial shows: its needle, its pointers and its counter. */
export function dialIndicators(p: Extract<Placement, { component: 'gauge' }>) {
  return [...(p.indicator ? [p.indicator] : []), ...(p.dial.pointers ?? []).map(q => q.indicator), ...(p.dial.counter ? [p.dial.counter.indicator] : [])];
}

function placement(spec: PanelSpec, p: Placement, state: Record<string, string>): string {
  switch (p.component) {
    case 'gauge': {
      const value = (id: string) => state[id] !== undefined ? Number(state[id]) : spec.indicators.find(i => i.id === id)?.rest ?? p.dial.scale[0][0];
      return at(p.at, gauge(spec, p.dial, p.indicator, value), ' data-art="gauge"');
    }
    case 'counter': {
      const c = p.counter, v = state[c.indicator] !== undefined ? Number(state[c.indicator]) : spec.indicators.find(i => i.id === c.indicator)?.rest ?? 0;
      return at(p.at, counter(c, v, `drums-${spec.id}-${c.indicator}`), ' data-art="counter"');
    }
    case 'dzus': case 'screw': case 'screw-medium': case 'screw-small':
      if (p.component === 'dzus' && p.cut) {
        // The notch edges end at the top layer's outline. On a layered panel the notch first clears
        // the upper layers inside the base plate, then the base plate's border is drawn again.
        const { hole, edge } = dzusCut(p.at, p.cut);
        const cut = (spec.plate.length > 1
          ? `<g clip-path="url(#base-${spec.id})">${hole}</g>` + cased(`<path d="${spec.plate[0].d}" fill="none"/>`, 'heavy') : '') +
          `<g clip-path="url(#plate-${spec.id})">${edge}</g>`;
        return cut + at(p.at, fastener(p.component), ` class="${p.component}"`);
      }
      return at(p.at, fastener(p.component), ` class="${p.component}"`);
    case 'toggle-large': case 'toggle-medium': case 'toggle-small': case 'toggle-large-cylinder': case 'toggle-large-square': case 'toggle-large-lock': case 'toggle-paddle-wide': case 'toggle-hook': case 'toggle-mini-hex': {
      const c = controlOf(spec, p.control), leans = toggleLeans(c.positions.length);
      const rot = c.travel === 'horizontal' ? ' transform="rotate(-90)"' : '';
      return at(p.at, toggleBase(p.component) + moving(c, state[c.id] ?? c.initial, i => painted(p.paint, toggleLever(p.component as keyof typeof TOGGLES, leans[i], c.positions.length)), rot), ` data-art="${p.component}"`);
    }
    case 'rotary-pointer': case 'rotary-pointer-large': case 'rotary-pointer-medium': {
      const c = controlOf(spec, p.control);
      return at(p.at, rotaryBase(p.component) + moving(c, state[c.id] ?? c.initial, i =>
        `<g transform="rotate(${c.positions[i].angle ?? 0})">${rotaryKnob(p.component)}</g>`), ` data-art="${p.component}"`);
    }
    case 'knob-fine-knurl-small': case 'knob-knurled-small': case 'knob-knurled': case 'knob-knurled-edge': case 'knob-knurled-skirt': case 'knob-bar': case 'knob-lobed': case 'knob-bar-medium': case 'knob-knurled-mini': case 'knob-radio-large': case 'knob-bar-thick': case 'knob-spindle': case 'knob-knurled-large': case 'knob-knurled-small-edge': case 'knob-round': case 'knob-round-small': case 'knob-cross': case 'knob-cross-small': {
      const c = controlOf(spec, p.control);
      return at(p.at, moving(c, state[c.id] ?? c.initial, i =>
        `<g transform="rotate(${c.positions[i].angle ?? 0})">${knobArt(p.component)}</g>`), ` data-art="${p.component}"`);
    }
    case 'push-round-small': case 'push-round-medium': case 'push-round-large': case 'push-round-xl': case 'push-round-xxl': {
      const c = controlOf(spec, p.control), art = p.component;
      // A painted button is painted whole: cap and skirt (DN LOCK REL).
      return at(p.at, painted(p.paint, pushBase(art) + moving(c, state[c.id] ?? c.initial, i => pushCap(art, i > 0))), ` data-art="${p.component}"`);
    }
    case 'gear-handle': {
      // Knob centred on the slot at each end of its travel (first position at the top).
      const c = controlOf(spec, p.control), last = c.positions.length - 1;
      return at(p.at, gearSlot(p.travel) + moving(c, state[c.id] ?? c.initial, i => gearKnob(p.size, p.travel * (i / last - 0.5), p.indicator)), ' data-art="gear-handle"');
    }
    case 'push-square': {
      const c = controlOf(spec, p.control), [w, h] = p.size, li = 2.2;
      // The legend is fixed on top of the moving cap; on a lit button it is the lamp's lens.
      const legend = p.legend.map(l => text(0, l.y, l.text, l.cap, l.width)).join('');
      const face = p.indicator
        ? `<g data-indicator="${p.indicator}"><rect class="lens" x="${n(-w / 2 + li)}" y="${n(-h / 2 + li)}" width="${n(w - 2 * li)}" height="${n(h - 2 * li)}" rx="0.5" stroke="none"/>${legend}</g>`
        : legend;
      return at(p.at, turn(p.rotate, 0, 0, pushSquareBase(p.size) + moving(c, state[c.id] ?? c.initial, i => pushSquareCap(p.size, i > 0)) + face), ' data-art="push-square"');
    }
    case 'guard-flip': {
      const c = controlOf(spec, p.control);
      return at(p.at, turn(p.rotate, 0, 0, moving(c, state[c.id] ?? c.initial, i => painted(p.paint, guardArt(p.size, c.positions[i].id !== 'closed')))), ` data-art="guard-flip"`);
    }
    case 'lamp-module': {
      const [w, h] = p.size;
      let s = lampModuleFrame(p.size);
      const cells = [...p.lamps].sort((a, b) => a.rect[1] - b.rect[1]);
      cells.forEach((l, i) => {
        const [x, y, cw, ch] = l.rect;
        s += `<g data-indicator="${l.indicator}"><rect class="lens" x="${n(x)}" y="${n(y)}" width="${n(cw)}" height="${n(ch)}" rx="0.4" stroke="none"/>` +
          (l.halves
            ? l.legend.split('\n').map((t, k) => text(x + cw / 2, y + ch * (k ? 0.75 : 0.25), t, l.cap ?? 2.3, lineWidth(l.width, k))).join('')
            : legendLines(x + cw / 2, y + ch / 2, l.legend, l.cap ?? 2.3, l.width)) + '</g>';
        if (l.halves) s += `<path d="M0.9 ${n(y + ch / 2)}H${n(w - 0.9)}" ${sw('fine')}/>`;
        if (i) s += `<path d="M0.9 ${n(y - 0.3)}H${n(w - 0.9)}" ${sw('fine')}/>`;
      });
      // An unused module shows a dash across its blank lens.
      if (p.blank) s += `<path d="M${n(w * 0.22)} ${n(h / 2)}H${n(w * 0.78)}" ${sw('medium')}/>`;
      return at(p.at, turn(p.rotate, w / 2, h / 2, s), ' data-art="lamp-module"');
    }
    case 'lamp-round': {
      const { lens } = LAMPS[p.component];
      return at(p.at, lampRoundBezel(p.component) +
        `<g data-indicator="${p.indicator}"><circle class="lens" r="${lens}" ${sw('medium')}/></g>`, ' data-art="lamp-round"');
    }
  }
}

/** Lamp legend, centred on (x, y); `\n` splits it into stacked lines, each fitted to `width`. */
const lineWidth = (w: number | number[] | undefined, k: number) => Array.isArray(w) ? w[k] : w;

function legendLines(x: number, y: number, legend: string, cap: number, width?: number | number[]) {
  const lines = legend ? legend.split('\n') : [], lead = cap * 1.35;
  return lines.map((t, i) => text(x, y + (i - (lines.length - 1) / 2) * lead, t, cap, lineWidth(width, i))).join('');
}

/** Pivot crosshairs, component names and lamp rectangles: the placement guide. */
function guideLayer(spec: PanelSpec) {
  const blue = '#1565ff';
  let s = `<g class="placement-guide" stroke="${blue}" fill="none" stroke-width="0.2" font-size="1.8" font-family="${FONT}">`;
  for (const p of spec.placements) {
    const [x, y] = p.at;
    s += `<path d="M${n(x - 2)} ${n(y)}H${n(x + 2)}M${n(x)} ${n(y - 2)}V${n(y + 2)}"/>`;
    const name = 'control' in p ? `${p.control} · ${p.component}` : 'indicator' in p ? `${p.indicator} · ${p.component}` : p.component;
    if (p.component !== 'dzus' && !p.component.startsWith('screw')) s += `<text x="${n(x + 2.2)}" y="${n(y - 1)}" fill="${blue}" stroke="none">${esc(name)}</text>`;
    if (p.component === 'lamp-module') {
      for (const l of p.lamps) s += `<rect x="${n(x + l.rect[0])}" y="${n(y + l.rect[1])}" width="${n(l.rect[2])}" height="${n(l.rect[3])}" stroke-dasharray="0.8 0.6"/>`;
    }
  }
  return s + '</g>';
}

export interface RenderOptions {
  /** Control positions to draw (default: each control's initial position). */
  state?: Record<string, string>;
  /** Overlay the placement guide (pivots, ids, lamp rectangles). */
  guide?: boolean;
  /** Accessible name; omitted = decorative (aria-hidden). */
  label?: string;
}

export function renderPanel(spec: PanelSpec, opts: RenderOptions = {}) {
  const [w, h] = spec.canvas, state = opts.state ?? {};
  const plate = spec.plate.map((p, i) =>
    (p.raised ? `<path d="${p.d}" transform="translate(0.45 0.45)" ${sw('medium')}/>` : '') +
    cased(`<path d="${p.d}" fill="${PAPER}" fill-rule="evenodd"/>`, i === 0 || p.raised ? 'heavy' : 'medium')).join('');
  let clips = '';
  const engraving = spec.engraving.map((e, i) => {
    if (e.kind === 'text') return e.rotate ? `<g transform="rotate(${e.rotate} ${n(e.at[0])} ${n(e.at[1])})">${text(e.at[0], e.at[1], e.text, e.cap, e.width, e.anchor)}</g>` : text(e.at[0], e.at[1], e.text, e.cap, e.width, e.anchor);
    if (e.kind === 'fill') {
      const id = `paint-${spec.id}-${i}`;
      if (e.clip) clips += `<clipPath id="${id}"><path d="${e.clip}" clip-rule="evenodd"/></clipPath>`;
      return `<path d="${e.d}" fill="${PAINTS[e.paint]}" stroke="none"${e.clip ? ` clip-path="url(#${id})"` : ''}/>`;
    }
    return `<path d="${e.d}" ${sw(e.pen ?? 'medium')}${e.faint ? ' stroke-opacity="0.3"' : ''}/>`;
  }).join('');
  return `<svg class="cockpit-svg" viewBox="0 0 ${n(w)} ${n(h)}" xmlns="http://www.w3.org/2000/svg" ${opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true"'}>` +
    `<g fill="none" stroke="${INK}" stroke-linejoin="round" stroke-linecap="round" font-family="${FONT}" font-weight="600">` +
    (spec.plate.length || clips ? `<defs>${spec.plate.length ? `<clipPath id="plate-${spec.id}"><path d="${spec.plate[spec.plate.length - 1].d}"/></clipPath><clipPath id="base-${spec.id}"><path d="${spec.plate[0].d}"/></clipPath>` : ''}${clips}</defs>` : '') +
    `<g class="plate">${plate}</g><g class="engraving">${engraving}</g>` +
    `<g class="components">${spec.placements.map(p => placement(spec, p, state)).join('')}</g></g>` +
    (opts.guide ? guideLayer(spec) : '') + '</svg>';
}

/* ------------------------------------------------------------- hit zones */

export interface HitZone {
  kind: 'control' | 'indicator';
  id: string;
  /** Box in mm (x, y, w, h), before `rotate`. */
  box: [number, number, number, number];
  round?: boolean;
  /** Turn in degrees about the box centre, for items drawn turned (eyebrow lights). */
  rotate?: number;
}

/** Hit zones in mm, from the same placements and component dimensions as the art. */
export function hitZones(spec: PanelSpec): HitZone[] {
  return spec.placements.flatMap((p): HitZone[] => {
    const [x, y] = p.at;
    switch (p.component) {
      case 'toggle-large': case 'toggle-medium': case 'toggle-small': case 'toggle-large-cylinder': case 'toggle-large-square': case 'toggle-large-lock': case 'toggle-paddle-wide': case 'toggle-hook': case 'toggle-mini-hex': {
        const t = TOGGLES[p.component], c = controlOf(spec, p.control);
        const isWide = t.cap === 'wide';
        const long = isWide ? 2 * t.reach + 8.2 : 2 * (t.reach + t.ball) + 1, wide = isWide ? 2 * t.ball + 1 : 2.6 * t.r;
        const [bw, bh] = c.travel === 'horizontal' ? [long, wide] : [wide, long];
        return [{ kind: 'control', id: p.control, box: [x - bw / 2, y - bh / 2, bw, bh] }];
      }
      case 'rotary-pointer': case 'rotary-pointer-large': case 'rotary-pointer-medium': {
        const r = ROTARIES[p.component].skirt * 1.15;
        return [{ kind: 'control', id: p.control, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'knob-fine-knurl-small': case 'knob-knurled-small': case 'knob-knurled': case 'knob-knurled-edge': case 'knob-knurled-skirt': case 'knob-bar': case 'knob-lobed': case 'knob-bar-medium': case 'knob-knurled-mini': case 'knob-radio-large': case 'knob-bar-thick': case 'knob-spindle': case 'knob-knurled-large': case 'knob-knurled-small-edge': case 'knob-round': case 'knob-round-small': case 'knob-cross': case 'knob-cross-small': {
        const r = KNOBS[p.component].r * 1.1;
        return [{ kind: 'control', id: p.control, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'gear-handle': {
        const [w, h] = p.size, bh = p.travel + h;
        return [{ kind: 'control', id: p.control, box: [x - w / 2, y - bh / 2, w, bh] }];
      }
      case 'push-round-small': case 'push-round-medium': case 'push-round-large': case 'push-round-xl': case 'push-round-xxl': {
        const r = PUSHES[p.component].r;
        return [{ kind: 'control', id: p.control, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'push-square': {
        const [w, h] = p.size;
        return [{ kind: 'control', id: p.control, box: [x - w / 2, y - h / 2, w, h], rotate: p.rotate }];
      }
      case 'guard-flip': {
        // The lower half of the closed guard: the upper half is left to the switch it covers.
        const [gw, gh] = p.size, a = (p.rotate ?? 0) * Math.PI / 180;
        if (!a) return [{ kind: 'control', id: p.control, box: [x - gw / 2, y - gh * 0.5, gw, gh * 0.5] }];
        // A turned guard: the same hinge-side half, turned about the hinge (square turns only).
        const pts = [[-gw / 2, -gh * 0.5], [gw / 2, -gh * 0.5], [-gw / 2, 0], [gw / 2, 0]]
          .map(([u, v]) => [x + u * Math.cos(a) - v * Math.sin(a), y + u * Math.sin(a) + v * Math.cos(a)]);
        const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
        const x0 = Math.min(...xs), y0 = Math.min(...ys);
        return [{ kind: 'control', id: p.control, box: [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0] }];
      }
      case 'gauge': {
        const r = p.dial.bezel, zones: HitZone[] = [];
        if (p.indicator) zones.push({ kind: 'indicator', id: p.indicator, box: [x - r, y - r, 2 * r, 2 * r], round: true });
        // Pointers: a round zone over the letters at the pointer's cold-and-dark reading.
        for (const q of p.dial.pointers ?? []) {
          const rest = spec.indicators.find(i => i.id === q.indicator)?.rest ?? p.dial.scale[0][0];
          const [px, py] = polar((PADDLE_POINTER.outer + PADDLE_POINTER.inner) / 2, dialAngle(p.dial, rest)), zr = 4.5;
          zones.push({ kind: 'indicator', id: q.indicator, box: [x + px - zr, y + py - zr, 2 * zr, 2 * zr], round: true });
        }
        const c = p.dial.counter;
        if (c) zones.push({ kind: 'indicator', id: c.indicator, box: [x + c.at[0] - c.window[0] / 2, y + c.at[1] - c.window[1] / 2, c.window[0], c.window[1]] });
        return zones;
      }
      case 'counter': {
        const c = p.counter;
        return [{ kind: 'indicator', id: c.indicator, box: [x + c.at[0] - c.window[0] / 2, y + c.at[1] - c.window[1] / 2, c.window[0], c.window[1]] }];
      }
      case 'lamp-round': {
        const r = LAMPS[p.component].r;
        return [{ kind: 'indicator', id: p.indicator, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'lamp-module':
        return p.lamps.map(l => {
          // A turned module turns its cells about the module centre.
          const [mw, mh] = p.size, a = (p.rotate ?? 0) * Math.PI / 180;
          const dx = l.rect[0] + l.rect[2] / 2 - mw / 2, dy = l.rect[1] + l.rect[3] / 2 - mh / 2;
          const cx = x + mw / 2 + dx * Math.cos(a) - dy * Math.sin(a), cy = y + mh / 2 + dx * Math.sin(a) + dy * Math.cos(a);
          return { kind: 'indicator' as const, id: l.indicator, box: [cx - l.rect[2] / 2, cy - l.rect[3] / 2, l.rect[2], l.rect[3]] as [number, number, number, number], rotate: p.rotate };
        });
      default:
        return [];
    }
  });
}

export { FASTENERS };
