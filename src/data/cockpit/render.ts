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
import type { ControlDef, Cut, PanelSpec, Placement, Pt } from './types';
import {
  FASTENERS, FONT, INK, LAMPS, PAPER, PUSHES, ROTARIES, TOGGLES, cased, esc, fastener, guardArt, lampModuleFrame, lampRoundBezel, n,
  pushBase, pushCap, rotaryBase, rotaryKnob, sw, text, toggleBase, toggleLeans, toggleLever,
} from './components.ts';

const at = ([x, y]: Pt, body: string, extra = '') => `<g transform="translate(${n(x)} ${n(y)})"${extra}>${body}</g>`;

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
 * The slot cut in the face plate around a DZUS fastener: a U with its round
 * end about the fastener, running out to the plate edge (clipped to the plate).
 * Absolute coordinates, so the plate clip applies directly.
 */
function dzusCut([x, y]: Pt, dir: Cut) {
  const c = FASTENERS.dzus.cut, far = 1000;
  const [ux, uy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  const [px, py] = [-uy, ux]; // perpendicular
  const P = (a: number, b: number) => `${n(x + px * a + ux * b)} ${n(y + py * a + uy * b)}`;
  return `<path d="M${P(-c, far)}L${P(-c, 0)}A${n(c)} ${n(c)} 0 0 0 ${P(c, 0)}L${P(c, far)}" ${sw('medium')}/>`;
}

function placement(spec: PanelSpec, p: Placement, state: Record<string, string>): string {
  switch (p.component) {
    case 'dzus': case 'screw': case 'screw-medium': case 'screw-small':
      return (p.component === 'dzus' && p.cut ? `<g clip-path="url(#plate-${spec.id})">${dzusCut(p.at, p.cut)}</g>` : '') +
        at(p.at, fastener(p.component), ` class="${p.component}"`);
    case 'toggle-large': case 'toggle-medium': case 'toggle-small': case 'toggle-large-cylinder': case 'toggle-large-square': case 'toggle-large-lock': {
      const c = controlOf(spec, p.control), leans = toggleLeans(c.positions.length);
      const rot = c.travel === 'horizontal' ? ' transform="rotate(-90)"' : '';
      return at(p.at, toggleBase(p.component) + moving(c, state[c.id] ?? c.initial, i => toggleLever(p.component as keyof typeof TOGGLES, leans[i]), rot), ` data-art="${p.component}"`);
    }
    case 'rotary-pointer': {
      const c = controlOf(spec, p.control);
      return at(p.at, rotaryBase(p.component) + moving(c, state[c.id] ?? c.initial, i =>
        `<g transform="rotate(${c.positions[i].angle ?? 0})">${rotaryKnob(p.component as 'rotary-pointer')}</g>`), ` data-art="${p.component}"`);
    }
    case 'push-round-large': {
      const c = controlOf(spec, p.control);
      return at(p.at, pushBase(p.component) + moving(c, state[c.id] ?? c.initial, i => pushCap(p.component as 'push-round-large', i > 0)), ` data-art="${p.component}"`);
    }
    case 'guard-flip': {
      const c = controlOf(spec, p.control);
      return at(p.at, moving(c, state[c.id] ?? c.initial, i => guardArt(p.size, c.positions[i].id !== 'closed')), ` data-art="guard-flip"`);
    }
    case 'lamp-module': {
      const [w, h] = p.size;
      let s = lampModuleFrame(p.size);
      const cells = [...p.lamps].sort((a, b) => a.rect[1] - b.rect[1]);
      cells.forEach((l, i) => {
        const [x, y, cw, ch] = l.rect;
        s += `<g data-indicator="${l.indicator}"><rect class="lens" x="${n(x)}" y="${n(y)}" width="${n(cw)}" height="${n(ch)}" rx="0.4" stroke="none"/>` +
          (l.legend ? text(x + cw / 2, y + ch / 2, l.legend, 2.3, l.width) : '') + '</g>';
        if (i) s += `<path d="M0.9 ${n(y - 0.3)}H${n(w - 0.9)}" ${sw('fine')}/>`;
      });
      void h;
      return at(p.at, s, ' data-art="lamp-module"');
    }
    case 'lamp-round': {
      const { lens } = LAMPS[p.component];
      return at(p.at, lampRoundBezel(p.component) +
        `<g data-indicator="${p.indicator}"><circle class="lens" r="${lens}" ${sw('medium')}/></g>`, ' data-art="lamp-round"');
    }
  }
}

/** Pivot crosshairs, component names and lamp rectangles: the placement guide. */
function guideLayer(spec: PanelSpec) {
  const blue = '#1565ff';
  let s = `<g class="placement-guide" stroke="${blue}" fill="none" stroke-width="0.2" font-size="1.8" font-family="${FONT}">`;
  for (const p of spec.placements) {
    const [x, y] = p.at;
    s += `<path d="M${n(x - 2)} ${n(y)}H${n(x + 2)}M${n(x)} ${n(y - 2)}V${n(y + 2)}"/>`;
    const name = 'control' in p ? `${p.control} · ${p.component}` : p.component;
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
    cased(`<path d="${p.d}" fill="${PAPER}"/>`, i === 0 || p.raised ? 'heavy' : 'medium')).join('');
  const engraving = spec.engraving.map(e => e.kind === 'text'
    ? text(e.at[0], e.at[1], e.text, e.cap, e.width, e.anchor)
    : `<path d="${e.d}" ${sw(e.pen ?? 'medium')}/>`).join('');
  return `<svg class="cockpit-svg" viewBox="0 0 ${n(w)} ${n(h)}" xmlns="http://www.w3.org/2000/svg" ${opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true"'}>` +
    `<g fill="none" stroke="${INK}" stroke-linejoin="round" stroke-linecap="round" font-family="${FONT}" font-weight="600">` +
    `<defs><clipPath id="plate-${spec.id}"><path d="${spec.plate[0].d}"/></clipPath></defs>` +
    `<g class="plate">${plate}</g><g class="engraving">${engraving}</g>` +
    `<g class="components">${spec.placements.map(p => placement(spec, p, state)).join('')}</g></g>` +
    (opts.guide ? guideLayer(spec) : '') + '</svg>';
}

/* ------------------------------------------------------------- hit zones */

export interface HitZone {
  kind: 'control' | 'indicator';
  id: string;
  /** Box in mm (x, y, w, h). */
  box: [number, number, number, number];
  round?: boolean;
}

/** Hit zones in mm, from the same placements and component dimensions as the art. */
export function hitZones(spec: PanelSpec): HitZone[] {
  return spec.placements.flatMap((p): HitZone[] => {
    const [x, y] = p.at;
    switch (p.component) {
      case 'toggle-large': case 'toggle-medium': case 'toggle-small': case 'toggle-large-cylinder': case 'toggle-large-square': case 'toggle-large-lock': {
        const t = TOGGLES[p.component], c = controlOf(spec, p.control);
        const long = 2 * (t.reach + t.ball) + 1, wide = 2.6 * t.r;
        const [bw, bh] = c.travel === 'horizontal' ? [long, wide] : [wide, long];
        return [{ kind: 'control', id: p.control, box: [x - bw / 2, y - bh / 2, bw, bh] }];
      }
      case 'rotary-pointer': {
        const r = ROTARIES[p.component].skirt * 1.15;
        return [{ kind: 'control', id: p.control, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'push-round-large': {
        const r = PUSHES[p.component].r;
        return [{ kind: 'control', id: p.control, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'guard-flip': {
        // The lower half of the closed guard: the upper half is left to the switch it covers.
        const [gw, gh] = p.size;
        return [{ kind: 'control', id: p.control, box: [x - gw / 2, y - gh * 0.5, gw, gh * 0.5] }];
      }
      case 'lamp-round': {
        const r = LAMPS[p.component].r;
        return [{ kind: 'indicator', id: p.indicator, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'lamp-module':
        return p.lamps.map(l => ({ kind: 'indicator', id: l.indicator, box: [x + l.rect[0], y + l.rect[1], l.rect[2], l.rect[3]] as [number, number, number, number] }));
      default:
        return [];
    }
  });
}

export { FASTENERS };
