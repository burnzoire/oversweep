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
import type { ControlDef, Cut, Dial, PanelSpec, Placement, Pt } from './types';
import {
  FASTENERS, FONT, INK, LAMPS, PAPER, PUSHES, ROTARIES, TOGGLES, cased, esc, fastener, guardArt, painted, PAINTS, lampModuleFrame, lampRoundBezel, n,
  gaugeBezel, gaugeHub, gearKnob, gearSlot, knobArt, needleArt, polar, KNOBS, pushBase, pushCap, pushSquareBase, pushSquareCap, rotaryBase, rotaryKnob, sw, text, toggleBase, toggleLeans, toggleLever,
} from './components.ts';

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
export function dialAngle(dial: Dial, value: number) {
  const k = dial.scale;
  if (value <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    const [v0, a0] = k[i - 1], [v1, a1] = k[i];
    if (value <= v1) return a0 + ((a1 - a0) * (value - v0)) / (v1 - v0);
  }
  return k[k.length - 1][1];
}

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

/** Dial art: bezel, face, painted ticks and sectors, legends, needle (turned to `value`), hub. */
function gauge(dial: Dial, indicator: string, value: number) {
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
  s += `<g data-indicator="${indicator}"><circle class="lens" r="${n(dial.face)}" stroke="none"/>` +
    `<g data-needle="${indicator}" transform="rotate(${n(dialAngle(dial, value))})">${needleArt(dial.needle)}</g></g>`;
  return s + gaugeHub(dial.hub);
}

function placement(spec: PanelSpec, p: Placement, state: Record<string, string>): string {
  switch (p.component) {
    case 'gauge': {
      const ind = spec.indicators.find(i => i.id === p.indicator);
      const value = state[p.indicator] !== undefined ? Number(state[p.indicator]) : ind?.rest ?? p.dial.scale[0][0];
      return at(p.at, gauge(p.dial, p.indicator, value), ' data-art="gauge"');
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
      case 'knob-fine-knurl-small': case 'knob-knurled-small': case 'knob-knurled': case 'knob-knurled-edge': case 'knob-knurled-skirt': case 'knob-bar': case 'knob-lobed': case 'knob-bar-medium': case 'knob-knurled-mini': case 'knob-radio-large': case 'knob-bar-thick': case 'knob-spindle': case 'knob-knurled-large': case 'knob-round': case 'knob-round-small': case 'knob-cross': case 'knob-cross-small': {
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
        const r = p.dial.bezel;
        return [{ kind: 'indicator', id: p.indicator, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
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
