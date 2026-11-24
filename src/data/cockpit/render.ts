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
import type { AttitudeBall, ControlDef, MfdDisplay, Cut, Rect, Dial, DrumCounter, HsiDisplay, HudDisplay, HudTape, IndicatorDef, PanelSpec, Placement, Pt, ReadoutFormat, TextDisplay } from './types';
import { formatReadout } from './readout.ts';
import {
  FASTENERS, FONT, INK, LAMPS, PAPER, PUSHES, ROTARIES, TOGGLES, cased, esc, fastener, guardArt, painted, PAINTS, lampModuleFrame, lampRoundBezel, n,
  thumbwheelArt, rockerBase, rockerCap, hatBase, hatLever,
  gaugeBezel, gaugeHub, ledSegments, LED_CHARS, halfDisc, lineNeedleArt, stepNeedleArt, bladeNeedleArt, drumStrip, paddlePointerArt, PADDLE_POINTER, wedgeNeedleArt, gearKnob, gearSlot, leverSlot, slotLeverArt, SLOT_LEVER, knobArt, needleArt, polar, KNOBS, pushBase, pushCap, pushSquareBase, pushSquareCap, rotaryBase, rotaryKnob, sw, text, toggleBase, toggleLeans, toggleLever,
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
export const dialAngle = (dial: Dial, value: number) => scaleAngle(dial.scale, value, dial.turn);

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
  const drumX = (k: number) => c.at[0] + (c.places ? c.places[k] : (k - (c.drums - 1) / 2) * c.pitch);
  // The window, plus any taller slot a drum shows through (the clip is their union).
  const rects = [[c.at[0] - w / 2, c.at[1] - h / 2, w, h], ...(c.slots ?? []).map(t => [drumX(t.drum) - c.pitch / 2, c.at[1] - t.h / 2, c.pitch, t.h])]
    .map(([x, y, rw, rh]) => `<rect x="${n(x)}" y="${n(y)}" width="${n(rw)}" height="${n(rh)}"`);
  let s = `<defs><clipPath id="${clip}">${rects.map(r => r + '/>').join('')}</clipPath></defs><g clip-path="url(#${clip})">`;
  pos.forEach((p, k) => {
    s += `<g transform="translate(${n(drumX(k))} ${n(c.at[1])})"><g data-drum="${c.indicator}" data-place="${k}" transform="translate(0 ${n(-p * c.roll)})">${drumStrip(c.roll, c.cap, c.width, k >= c.drums - c.fixed, k < (c.blank ?? 0), c.stroked, k < (c.hatch ?? 0))}</g></g>`;
  });
  return s + `</g><g data-indicator="${c.indicator}">${rects.map(r => r + ' class="lens" stroke="none"/>').join('')}</g>`;
}

/** Dial art: bezel, face, painted ticks and sectors, legends, counter, needle or pointers (turned to their values), hub. */
/** Warning flag in a face window: the flag with its legend (page `shown`) or the empty window (page `hidden`). */
function flag(f: NonNullable<Dial['flags']>[number], current: string) {
  const [w, h] = f.size, box = `x="${n(f.at[0] - w / 2)}" y="${n(f.at[1] - h / 2)}" width="${n(w)}" height="${n(h)}"`;
  const shown = painted(f.paint, `<rect ${box} fill="${PAPER}" ${sw('fine')}/>`) + text(f.at[0], f.at[1], f.legend, f.cap, f.width);
  const pg = (id: string, body: string) => `<g data-page-of="${f.indicator}" data-page="${id}"${id === current ? '' : ' display="none"'}>${body}</g>`;
  return `<g data-indicator="${f.indicator}"><rect class="lens" ${box} stroke="none"/>${pg('shown', shown)}${pg('hidden', `<rect ${box} fill="none" ${sw('fine')}/>`)}</g>`;
}

function gauge(spec: PanelSpec, dial: Dial, indicator: string | undefined, value: (id: string) => number, page: (id: string) => string) {
  let s = gaugeBezel(dial.bezel, dial.face, dial.half);
  for (const f of dial.fills ?? []) s += `<path d="${sector(f.r[0], f.r[1], dialAngle(dial, f.from), dialAngle(dial, f.to))}" fill="${f.paint ? PAINTS[f.paint] : INK}" ${f.paint ? 'stroke="none"' : sw('fine')}/>`;
  for (const t of dial.ticks) {
    if (t.dot) {
      s += tickValues(t).map(v => { const [x, y] = polar((t.r[0] + t.r[1]) / 2, dialAngle(dial, v)); return `<circle cx="${n(x)}" cy="${n(y)}" r="${n(t.width / 2)}" fill="${INK}" stroke="none"/>`; }).join('');
      continue;
    }
    const d = tickValues(t).map(v => {
      const a = dialAngle(dial, v), [x0, y0] = polar(t.r[0], a), [x1, y1] = polar(t.r[1], a);
      return `M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`;
    }).join('');
    s += `<path d="${d}" stroke-width="${n(t.width)}" stroke-linecap="butt"/>`;
  }
  if (dial.marks) s += `<path d="${dial.marks}" ${sw('medium')}/>`;
  s += dial.legends.map(l => text(l.at[0], l.at[1], l.text, l.cap, l.width)).join('');
  if (dial.counter) s += counter(dial.counter, value(dial.counter.indicator), `drums-${spec.id}-${dial.counter.indicator}`);
  for (const f of dial.flags ?? []) s += flag(f, page(f.indicator));
  if (indicator && dial.needle) s += `<g data-indicator="${indicator}">${dial.half ? `<path class="lens" d="${halfDisc(dial.face, dial.half)}" stroke="none"/>` : `<circle class="lens" r="${n(dial.face)}" stroke="none"/>`}` +
    `<g data-needle="${indicator}" transform="rotate(${n(dialAngle(dial, value(indicator)))})">${dial.needleArt === 'wedge' ? wedgeNeedleArt(dial.needle, dial.needleBase) : dial.needleArt === 'blade' ? bladeNeedleArt(dial.needle) : dial.needleArt === 'line' ? lineNeedleArt(dial.needle) : dial.needleArt === 'step' ? stepNeedleArt(dial.needle) : needleArt(dial.needle)}</g></g>`;
  for (const p of dial.pointers ?? []) s += `<g data-indicator="${p.indicator}"><g data-needle="${p.indicator}" transform="rotate(${n(dialAngle(dial, value(p.indicator)))})">${paddlePointerArt(p.legend)}</g></g>`;
  return s + gaugeHub(dial.hub);
}

/** What the page needs to move a reading: a needle's scale or a counter's drums, and the range to try. */
export type Reading =
  /** `turn`: value of one full turn (the needle goes round more than once); `counter`: drums that show the same reading. */
  | { kind: 'needle'; scale: Dial['scale']; turn?: number; counter?: { drums: number; fixed: number; unit: number; roll: number; still?: boolean }; range: [number, number, number] }
  /** Moves sideways (or along y with `axis: 'y'`) by `per` mm a unit (HSI deviation bar, HUD symbols). */
  | { kind: 'shift'; per: number; axis?: 'y'; range: [number, number, number] }
  /** A printed number (HUD data fields). */
  | { kind: 'number'; format: ReadoutFormat; range: [number, number, number] }
  /** A moving tape and its readout box (HUD velocity, altitude, heading): the tape moves `per` mm a unit along `axis`. */
  | { kind: 'tape'; per: number; axis: 'x' | 'y'; format: ReadoutFormat; range: [number, number, number] }
  /** A digit readout: `digits` whole digits, zero-padded, plus a boxed tenths digit when `tenths`. */
  | { kind: 'digits'; digits: number; tenths?: boolean; range: [number, number, number] }
  /** A display that shows one of several pages. */
  | { kind: 'page'; pages: { id: string; label: string }[]; rest: string }
  | { kind: 'counter'; drums: number; fixed: number; unit: number; roll: number; still?: boolean; range: [number, number, number] };

/** Every gauge and counter reading on a panel, by indicator id. */
export function readings(spec: PanelSpec): Record<string, Reading> {
  const out: Record<string, Reading> = {};
  const ind = (id: string) => spec.indicators.find(i => i.id === id);
  const page = (id: string) => { const i = ind(id); if (i?.pages) out[id] = { kind: 'page', pages: i.pages, rest: i.restPage ?? i.pages[0].id }; };
  const drums = (c: DrumCounter) => { out[c.indicator] = { kind: 'counter', drums: c.drums, fixed: c.fixed, unit: c.unit, roll: c.roll, ...(c.still ? { still: true } : {}), range: ind(c.indicator)?.range ?? [0, c.unit * 10 ** (c.drums - c.fixed) - c.unit, c.unit / 10] }; };
  for (const p of spec.placements) {
    if (p.component === 'counter') drums(p.counter);
    if (p.component === 'text-display' || p.component === 'mfd-display' || p.component === 'blinker' || p.component === 'flag-window' || p.component === 'led-display') page(p.indicator);
    if (p.component === 'hsi') {
      const turn = (id: string, sign: number) => { out[id] = { kind: 'needle', scale: [[0, 0], [360, 360 * sign]], range: ind(id)?.range ?? [0, 359, 1] }; };
      turn('heading', -1); turn('heading-set', 1); turn('course', 1); turn('bearing', 1);
      out.deviation = { kind: 'shift', per: p.hsi.course.dot, range: ind('deviation')?.range ?? [-2.5, 2.5, 0.1] };
      out.range = { kind: 'digits', digits: 3, tenths: true, range: ind('range')?.range ?? [0, 999.9, 0.1] };
      out['course-set'] = { kind: 'digits', digits: 3, range: ind('course-set')?.range ?? [0, 359, 1] };
      for (const id of ['screen', 'mode', 'to-from', 'notice', 'warning']) page(id);
    }
    if (p.component === 'hud') {
      const h = p.hud, r = (id: string, d: [number, number, number]) => ind(id)?.range ?? d;
      const shift = (id: string, per: number, axis: 'x' | 'y', d: [number, number, number]) => { out[id] = { kind: 'shift', per, ...(axis === 'y' ? { axis } : {}), range: r(id, d) }; };
      shift('fpm-azimuth', h.deg, 'x', [-10, 10, 0.1]); shift('fpm-elevation', -h.deg, 'y', [-20, 5, 0.1]);
      shift('pitch', h.deg, 'y', [-90, 90, 0.5]); shift('steering-cue', h.deg, 'x', [-10, 10, 0.1]);
      shift('steerpoint-azimuth', h.deg, 'x', [-15, 15, 0.1]); shift('steerpoint-elevation', -h.deg, 'y', [-25, 10, 0.1]);
      out.roll = { kind: 'needle', scale: [[-180, 180], [180, -180]], range: r('roll', [-180, 180, 1]) };
      out.steering = { kind: 'needle', scale: [[-180, -180], [180, 180]], range: r('steering', [-180, 180, 1]) };
      const tape = (id: string, t: HudTape) => { out[id] = { kind: 'tape', per: t.axis === 'y' ? t.per : -t.per, axis: t.axis, format: t.readout.format, range: r(id, [t.from, t.to, 1]) }; };
      tape('velocity', h.velocity); tape('altitude', h.altitude); tape('heading', h.heading);
      for (const id of ['screen', 'velocity-mode']) page(id);
      if (h.cues) { page(h.cues.id); shift('harm-asl', h.deg, 'x', [-10, 10, 0.1]); }
      for (const f of h.fields) {
        if (ind(f.indicator)?.pages) page(f.indicator);
        else out[f.indicator] = { kind: 'number', format: f.format ?? {}, range: r(f.indicator, [0, 999, 1]) };
      }
    }
    if (p.component === 'attitude') {
      out.pitch = { kind: 'shift', per: p.ball.deg, axis: 'y', range: ind('pitch')?.range ?? [-90, 90, 1] };
      out.roll = { kind: 'needle', scale: [[-180, 180], [180, -180]], range: ind('roll')?.range ?? [-180, 180, 1] };
      page('off-flag');
    }
    if (p.component !== 'gauge') continue;
    const { dial } = p;
    const lo = dial.scale[0][0], hi = dial.scale[dial.scale.length - 1][0];
    const needle = (id: string) => { out[id] = { kind: 'needle', scale: dial.scale, ...(dial.turn ? { turn: dial.turn } : {}), range: ind(id)?.range ?? [lo, hi, 10 ** Math.floor(Math.log10((hi - lo) / 100))] }; };
    if (p.indicator) needle(p.indicator);
    for (const q of dial.pointers ?? []) needle(q.indicator);
    const c = dial.counter;
    if (c && c.indicator === p.indicator) {
      const r = out[c.indicator] as Extract<Reading, { kind: 'needle' }>;
      r.counter = { drums: c.drums, fixed: c.fixed, unit: c.unit, roll: c.roll, ...(c.still ? { still: true } : {}) };
    } else if (c) drums(c);
    for (const f of dial.flags ?? []) page(f.indicator);
  }
  return out;
}

/** Indicator ids the HSI picture draws (see `HsiDisplay`). */
export const HSI_INDICATORS = ['screen', 'heading', 'heading-set', 'course', 'bearing', 'deviation', 'range', 'course-set', 'mode', 'to-from', 'notice', 'warning'] as const;

/** Indicator ids every HUD picture draws (see `HudDisplay`); its data fields add their own. */
export const HUD_INDICATORS = ['screen', 'fpm-azimuth', 'fpm-elevation', 'pitch', 'roll', 'steering-cue', 'steering', 'steerpoint-azimuth', 'steerpoint-elevation', 'velocity', 'altitude', 'heading', 'velocity-mode'] as const;

/** Every indicator a placement shows (lamps, needles, counters, displays). */
export function placementIndicators(p: Placement): string[] {
  switch (p.component) {
    case 'lamp-module': return p.lamps.map(l => l.indicator);
    case 'lamp-round': return [p.indicator];
    case 'push-square': case 'gear-handle': return p.indicator ? [p.indicator] : [];
    case 'gauge': return dialIndicators(p);
    case 'counter': return [p.counter.indicator];
    case 'text-display': case 'mfd-display': case 'blinker': case 'flag-window': case 'led-display': return [p.indicator];
    case 'hsi': return [...HSI_INDICATORS];
    case 'hud': return [...HUD_INDICATORS, ...(p.hud.cues ? [p.hud.cues.id, 'harm-asl'] : []), ...p.hud.fields.map(f => f.indicator)];
    case 'attitude': return ['pitch', 'roll', 'off-flag'];
    default: return [];
  }
}

/** Monospace face for character displays. */
const MONO = "'DejaVu Sans Mono','Menlo','Consolas','Liberation Mono',monospace";

/** One display character centred on (x, y); `^` is the up/down field arrow. */
function displayChar(x: number, y: number, ch: string, cap: number, width: number, fill: string) {
  if (ch === '^') {
    const a = width * 0.55, t = cap * 0.48, g = cap * 0.05;
    return `<path d="M${n(x)} ${n(y - t - g)}L${n(x + a)} ${n(y - g)}H${n(x - a)}ZM${n(x)} ${n(y + t + g)}L${n(x + a)} ${n(y + g)}H${n(x - a)}Z" fill="${fill}" stroke="none"/>`;
  }
  return `<text x="${n(x)}" y="${n(y + cap / 2)}" font-family="${MONO}" font-weight="700" font-size="${n(cap / 0.73)}" text-anchor="middle" textLength="${n(width)}" lengthAdjust="spacingAndGlyphs" fill="${fill}" stroke="none">${esc(ch)}</text>`;
}

/** Character display: bezel, screen, and one group per page (only `current` shown). */
function textDisplay(d: TextDisplay, ind: IndicatorDef | undefined, id: string, current: string) {
  const [bw, bh] = d.bezel, [sw_, sh] = d.screen;
  let s = cased(`<rect x="${n(-bw / 2)}" y="${n(-bh / 2)}" width="${n(bw)}" height="${n(bh)}" rx="1.6" fill="${PAPER}"/>`, 'heavy') +
    `<rect x="${n(-sw_ / 2)}" y="${n(-sh / 2)}" width="${n(sw_)}" height="${n(sh)}" rx="0.8" fill="${MFD_GLASS}" stroke="none"/>` +
    `<g data-indicator="${id}"><rect class="lens" x="${n(-sw_ / 2)}" y="${n(-sh / 2)}" width="${n(sw_)}" height="${n(sh)}" rx="0.8" ${sw('medium')}/></g>`;
  const [dx, dy] = d.pitch, ch = d.cap * 1.45;
  for (const pg of ind?.pages ?? []) {
    const lines = d.pages.find(q => q.id === pg.id)?.lines ?? [];
    let g = '';
    lines.forEach((line, row) => {
      let col = 0, inverse = false;
      for (const c of line) {
        if (c === '{') { inverse = true; continue; }
        if (c === '}') { inverse = false; continue; }
        const x = d.origin[0] + col * dx, y = d.origin[1] + row * dy;
        if (inverse) g += `<rect x="${n(x - dx / 2)}" y="${n(y - ch / 2)}" width="${n(dx)}" height="${n(ch)}" fill="${INK}" stroke="none"/>`;
        if (c !== ' ') g += displayChar(x, y, c, d.cap, d.width, inverse ? PAPER : INK);
        col++;
      }
    });
    s += `<g data-page-of="${id}" data-page="${pg.id}"${pg.id === current ? '' : ' display="none"'}>${onGlass(SCREEN.ded, g)}</g>`;
  }
  return s;
}

/** Format display (MFD): the screen opening and glass, and one group per page of fixed-pitch words (only `current` shown). */
/** MFD glass and symbology colours, sampled off the guide's MFD images (p. 539): white text and route, magenta range rings, cyan ownship, flight members and bullseye, green/yellow/red threat states. */
export const MFD_COLOURS = { white: '#f2f3f7', grey: '#b9bcc6', cyan: '#3cc3cf', magenta: '#b443cf', green: '#45c08e', yellow: '#efd14a', red: '#ff4a42' } as const;
const MFD_GLASS = '#0b0c10';
/** Teaching overlays on a display (not part of the sim's picture): orange, unlike any MFD symbology colour. */
const MFD_AID = '#ff9a3c';
/** Every electronic screen is drawn lit on dark glass in the sim's colours (Nathan, 2026-11-21), sampled off the guide's images: DED yellow-green (p. 544), UHF LEDs yellow (p. 262), EHSI white with cyan course and bearing pointers and a yellow heading marker (p. 230), HUD green (p. 90). */
export const SCREEN = { glass: MFD_GLASS, ded: '#d6f46a', led: '#f2d64b', ehsi: '#f2f3f7', ehsiCyan: '#52bddd', ehsiYellow: '#efd14a', hud: '#5cf08a' } as const;
/** A group drawing in `ink` over the glass: the shared INK/PAPER become the screen's colour and the glass. */
const onGlass = (ink: string, body: string, paper: string = MFD_GLASS) => `<g style="--panel-ink:${ink};--panel-paper:${paper}" stroke="${ink}">${body}</g>`;
/** The HUD's symbology is seen against a desaturated blue sky (Nathan, 2026-11-21): lighter toward the horizon. */
const HUD_SKY = ['#3f5468', '#6f8293'] as const;
/** Each video clip gets its own id: both MFDs carry the same pages, and a clip defined in a hidden page of the other display does not apply. */
let videoClips = 0;
function mfdDisplay(d: MfdDisplay, ind: IndicatorDef | undefined, id: string, current: string) {
  const o = d.opening / 2, g = o - d.inset;
  let s = `<rect x="${n(-o)}" y="${n(-o)}" width="${n(2 * o)}" height="${n(2 * o)}" rx="${n(d.r)}" fill="${PAPER}" ${sw('heavy')}/>` +
    `<rect x="${n(-g)}" y="${n(-g)}" width="${n(2 * g)}" height="${n(2 * g)}" rx="${n(Math.max(0, d.r - d.inset))}" fill="${MFD_GLASS}" stroke="none"/>` +
    `<g data-indicator="${id}"><rect class="lens" x="${n(-g)}" y="${n(-g)}" width="${n(2 * g)}" height="${n(2 * g)}" rx="${n(Math.max(0, d.r - d.inset))}" ${sw('fine')}/></g>`;
  const W = MFD_COLOURS.white;
  for (const pg of ind?.pages ?? []) {
    const page = d.pages.find(q => q.id === pg.id);
    const clip = `mfd-video-${++videoClips}`;
    // The video fills the glass, or is larger (`videoScale`) and slews under it: a panned picture moves opposite to the cursor.
    const vg = g * (page?.videoScale ?? 1), at = page?.pan && page.cursor ? page.cursor.at : [0, 0];
    const image = page?.video ? `<image data-video href="${page.video}" x="${n(-vg)}" y="${n(-vg)}" width="${n(2 * vg)}" height="${n(2 * vg)}" preserveAspectRatio="xMidYMid slice" opacity="0.9"/>` : '';
    let body = page?.video ? `<clipPath id="${clip}"><rect x="${n(-g)}" y="${n(-g)}" width="${n(2 * g)}" height="${n(2 * g)}" rx="${n(Math.max(0, d.r - d.inset))}"/></clipPath><g clip-path="url(#${clip})">` +
      (page.pan ? `<g data-pan="${id}" transform="translate(${n(-at[0])} ${n(-at[1])})">${image}</g>` : image) + '</g>' : '';
    if (page?.fills) body += `<path d="${page.fills}" fill="${W}" stroke="none"/>`;
    for (const p of page?.paths ?? []) if (p.fill) body += `<path d="${p.d}" fill="${MFD_COLOURS[p.c]}" stroke="none"/>`;
    for (const w of page?.words ?? []) {
      const k0 = w.s ?? 1, pitch = d.pitch * k0, width = d.width * k0, cap = d.cap * k0;
      const ink = (w.t.length - 1) * pitch + width, x0 = w.a === 'start' ? w.at[0] : w.a === 'end' ? w.at[0] - ink : w.at[0] - ink / 2;
      const y = w.at[1], colour = MFD_COLOURS[w.c ?? 'white'], fill = w.inv ? MFD_GLASS : colour;
      if (w.inv) body += `<rect x="${n(x0 - d.pad[0])}" y="${n(y - cap / 2 - d.pad[1])}" width="${n(ink + 2 * d.pad[0])}" height="${n(cap + 2 * d.pad[1])}" fill="${colour}" stroke="none"/>`;
      [...w.t].forEach((c, k) => { if (c !== ' ') body += displayChar(x0 + width / 2 + k * pitch, y, c, cap, width, fill); });
    }
    if (page?.marks) body += `<path d="${page.marks}" fill="none" stroke="${W}" ${sw('medium')}/>`;
    if (page?.fine) body += `<path d="${page.fine}" fill="none" stroke="${W}" ${sw('fine')}/>`;
    if (page?.flash || page?.flashFill) body += `<g><animate attributeName="opacity" values="1;0" calcMode="discrete" dur="0.8s" repeatCount="indefinite"/>${page.flashFill ? `<path d="${page.flashFill}" fill="${W}" stroke="none"/>` : ''}${page.flash ? `<path d="${page.flash}" fill="none" stroke="${W}" ${sw('medium')}/>` : ''}</g>`;
    for (const p of page?.paths ?? []) if (!p.fill) body += `<path d="${p.d}" fill="none" stroke="${MFD_COLOURS[p.c]}" ${sw(p.pen ?? 'medium')}${p.dash ? ' stroke-dasharray="2.2 1.4"' : ''}>${p.blink ? '<animate attributeName="opacity" values="1;0" calcMode="discrete" dur="0.8s" repeatCount="indefinite"/>' : ''}</path>`;
    if (page?.aid) body += `<path data-aid d="${page.aid}" fill="none" stroke="${MFD_AID}" stroke-dasharray="1.2 0.8" ${sw('fine')}/>`;
    if (page?.cursorX && page.cursor) body += `<g data-cursor-x="${id}" transform="translate(${n(page.cursor.at[0])} 0)"><path d="${page.cursorX.d}" fill="none" stroke="${MFD_COLOURS[page.cursorX.c]}" ${sw('medium')}/></g>`;
    if (page?.cursor && !page.pan) body += `<g data-cursor="${id}" transform="translate(${n(page.cursor.at[0])} ${n(page.cursor.at[1])})"><path d="${page.cursor.d}" fill="none" stroke="${W}" ${sw('medium')}/></g>`;
    s += `<g data-page-of="${id}" data-page="${pg.id}"${pg.id === current ? '' : ' display="none"'}>${body}</g>`;
  }
  return s;
}

/** Pointer along +y = up (nose), turned by its group: a shaft from r0 to the arrow, an arrowhead at r1, and a tail. */
function hsiPointer(head: [number, number], tail: [number, number], [aw, al]: [number, number], width: number) {
  return `<path d="M0 ${n(-head[0])}V${n(-(head[1] - al * 0.6))}M0 ${n(tail[0])}V${n(tail[1])}" stroke-width="${n(width)}" stroke-linecap="butt"/>` +
    `<path d="M0 ${n(-head[1])}L${n(aw / 2)} ${n(-(head[1] - al))}H${n(-aw / 2)}Z" fill="${INK}" stroke="none"/>`;
}

/** Digits for a readout value: whole part zero-padded to `digits`, and the tenths digit. */
export function readoutDigits(v: number, digits: number, tenths: boolean) {
  const t = Math.round(Math.max(0, v) * (tenths ? 10 : 1));
  const whole = tenths ? Math.floor(t / 10) : t;
  return { whole: String(whole % 10 ** digits).padStart(digits, '0'), tenth: tenths ? String(t % 10) : '' };
}

function hsi(spec: PanelSpec, h: HsiDisplay, value: (id: string) => number, pageOf: (id: string) => string) {
  const ind = (id: string) => spec.indicators.find(i => i.id === id);
  const pages = (id: string, draw: (page: string) => string) => (ind(id)?.pages ?? []).map(pg =>
    `<g data-page-of="${id}" data-page="${pg.id}"${pg.id === pageOf(id) ? '' : ' display="none"'}>${draw(pg.id)}</g>`).join('');
  const { card, lubbers, course, bearing, marker } = h;
  // Compass card: a tick every 5°, long every 10°, a letter or number every 30°.
  let ticks = '';
  for (let a = 0; a < 360; a += 5) {
    const [x0, y0] = polar(a % 10 ? card.minor : card.major, a), [x1, y1] = polar(card.r, a);
    ticks += `M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`;
  }
  const names = ['N', '3', '6', 'E', '12', '15', 'S', '21', '24', 'W', '30', '33'];
  const labels = names.map((t, k) => `<g transform="rotate(${k * 30})">${text(0, -card.labelR, t, card.cap, t.length > 1 ? card.labelWidth : undefined)}</g>`).join('');
  let lub = '';
  for (let a = 0; a < 360; a += 45) {
    const [r0, r1] = a % 90 ? lubbers.diagonal : lubbers.cardinal, [x0, y0] = polar(r0, a), [x1, y1] = polar(r1, a);
    lub += `M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`;
  }
  // Heading marker: two solid squares either side of the set heading, between the card's 10° marks.
  const gap = marker.gap, side = (marker.w - gap) / 2, my = -marker.r[1], mh = marker.r[1] - marker.r[0];
  // The card tick under the gap is masked so the gap reads as two squares.
  const markerArt = `<rect x="${n(-gap / 2)}" y="${n(my)}" width="${n(gap)}" height="${n(mh)}" fill="${PAPER}" stroke="none"/>` + `<path d="M${n(-marker.w / 2)} ${n(my)}h${n(side)}v${n(mh)}h${n(-side)}ZM${n(gap / 2)} ${n(my)}h${n(side)}v${n(mh)}h${n(-side)}Z" fill="${INK}" stroke="none"/>`;
  const dots = [-2, -1, 1, 2].map(k => `<circle cx="${n(k * course.dot)}" r="${n(course.dotR)}" fill="${INK}" stroke="none"/>`).join('');
  const tri = (dir: number) => `<path d="M0 ${n(-dir * course.toFrom - dir * course.arrow[1] * 0.5)}L${n(course.arrow[0] * 0.4)} ${n(-dir * course.toFrom + dir * course.arrow[1] * 0.3)}H${n(-course.arrow[0] * 0.4)}Z" fill="${INK}" stroke="none"/>`;
  const turned = (id: string, deg: number, body: string) =>
    `<g data-indicator="${id}"><g data-needle="${id}" transform="rotate(${n(deg)})">${body}</g></g>`;
  const crs = turned('course', value('course'), onGlass(SCREEN.ehsiCyan,
    hsiPointer(course.head, course.tail, course.arrow, course.width) + dots +
    `<g data-indicator="deviation"><g data-shift="deviation" transform="translate(${n(value('deviation') * course.dot)} 0)"><path d="M0 ${n(-course.cdi)}V${n(course.cdi)}" stroke-width="${n(course.width)}" stroke-linecap="butt"/></g></g>` +
    `<g data-indicator="to-from">${pages('to-from', pg => pg === 'to' ? tri(1) : pg === 'from' ? tri(-1) : '')}</g>`));
  const cardGroup = turned('heading', -value('heading'),
    `<path d="${ticks}" stroke-width="${n(card.width)}" stroke-linecap="butt"/>` + labels +
    turned('heading-set', value('heading-set'), onGlass(SCREEN.ehsiYellow, markerArt)) +
    turned('bearing', value('bearing'), onGlass(SCREEN.ehsiCyan, hsiPointer(bearing.head, bearing.tail, bearing.arrow, bearing.width))) + crs);
  const rd = readoutDigits(value('range'), 3, true), cd = readoutDigits(value('course-set'), 3, false);
  const R = h.range, C = h.courseSet, tw = R.width / 3;
  const readouts =
    `<g data-indicator="range"><g data-digits="range">${text(R.at[0], R.at[1], rd.whole, R.cap, R.width)}` +
    `<rect x="${n(R.at[0] + R.width / 2 + 0.2)}" y="${n(R.at[1] - R.cap * 0.7)}" width="${n(tw + 0.6)}" height="${n(R.cap * 1.4)}" fill="${INK}" stroke="none"/>` +
    `<text x="${n(R.at[0] + R.width / 2 + 0.5 + tw / 2)}" y="${n(R.at[1] + R.cap / 2)}" font-size="${n(R.cap / 0.72)}" text-anchor="middle" fill="${PAPER}" stroke="none">${rd.tenth}</text></g></g>` +
    `<g data-indicator="course-set"><g data-digits="course-set">${text(C.at[0], C.at[1], cd.whole, C.cap, C.width)}</g></g>`;
  // The PLS legends are longer than NAV and TCN: set smaller and moved left so they clear the CRS legend (not in the guide's image).
  const mode = `<g data-indicator="mode">${pages('mode', pg => {
    const word = ind('mode')?.pages?.find(q => q.id === pg)?.label ?? '';
    return word.length > 3 ? text(h.mode.at[0] - 0.9 * h.mode.cap, h.mode.at[1], word, h.mode.cap * 0.8) : text(h.mode.at[0], h.mode.at[1], word, h.mode.cap);
  })}</g>`;
  const notice = `<g data-indicator="notice">${pages('notice', pg => {
    const word = pg === 'none' ? '' : ind('notice')?.pages?.find(q => q.id === pg)?.label ?? '';
    return word ? text(h.notice.at[0], h.notice.at[1], word, h.notice.cap, h.notice.charWidth ? h.notice.charWidth * word.length : undefined) : '';
  })}</g>`;
  // Warning flag: a red box with its word stacked one letter a line in paper colour (INU, ATT).
  const W = h.warning;
  const warning = `<g data-indicator="warning">${pages('warning', pg => {
    const word = pg === 'none' ? '' : ind('warning')?.pages?.find(q => q.id === pg)?.label ?? '';
    if (!word) return '';
    const top = W.at[1] - W.size[1] / 2, first = W.at[1] - (word.length - 1) * W.pitch / 2;
    return `<rect x="${n(W.at[0] - W.size[0] / 2)}" y="${n(top)}" width="${n(W.size[0])}" height="${n(W.size[1])}" fill="${PAINTS.red}" stroke="none"/>` +
      [...word].map((ch, k) => `<text x="${n(W.at[0])}" y="${n(first + k * W.pitch + W.cap / 2)}" font-size="${n(W.cap / 0.72)}" text-anchor="middle" fill="${PAPER}" stroke="none">${esc(ch)}</text>`).join('');
  })}</g>`;
  const on = `<path d="${lub}" stroke-width="${n(lubbers.width)}" stroke-linecap="butt"/>` + cardGroup +
    `<path d="${h.aircraft}" ${sw('heavy')}/>` + readouts + mode + notice + warning + h.legends.map(l => text(l.at[0], l.at[1], l.text, l.cap, l.width)).join('');
  return `<g data-page-of="screen" data-page="on"${pageOf('screen') === 'on' ? '' : ' display="none"'}>${on}</g><g data-page-of="screen" data-page="off"${pageOf('screen') === 'off' ? '' : ' display="none"'}></g>`;
}

const HUD_PEN = 0.5;

/** HUD lettering: fixed-width, `pitch` mm a character, centred on y. */
function hudText(x: number, y: number, s: string, font: HudDisplay['font'], anchor: 'start' | 'middle' | 'end' = 'start') {
  return `<text x="${n(x)}" y="${n(y + font.cap / 2)}" font-family="${MONO}" font-size="${n(font.pitch / 0.602)}" text-anchor="${anchor}"${squeeze(s, font.pitch * 0.3)} fill="${INK}" stroke="none">${esc(s)}</text>`;
}
/** HUD lettering is fixed pitch, but a comma is a narrow mark: pull it and the next character in by `d` each side (Nathan, 2026-11-23). */
const squeeze = (s: string, d: number) => {
  const dx = Array.from(s, (c, i) => (c === ',' ? -d : s[i - 1] === ',' ? -d : 0));
  return dx.some(v => v) ? ` dx="${dx.map(n).join(' ')}"` : '';
};

/** A tape's ticks and labels at reading zero, relative to its origin (the page moves them by the reading). */
function hudTape(t: HudTape, font: HudDisplay['font']) {
  const dir = t.axis === 'y' ? -1 : 1;
  const P = (a: number, c: number) => t.axis === 'y' ? `${n(c)} ${n(a)}` : `${n(a)} ${n(c)}`;
  const on = (u: number, k: number) => Math.abs(u / k - Math.round(u / k)) < 1e-9;
  let ticks = '', labels = '';
  for (let i = 0; ; i++) {
    const u = t.from + i * t.minor;
    if (u > t.to + 1e-9) break;
    const a = dir * u * t.per;
    ticks += `M${P(a, t.edge)}L${P(a, t.edge + (on(u, t.major) ? t.majorLength : t.minorLength))}`;
    if (on(u, t.label)) {
      const shown = t.axis === 'x' ? ((u % 360) + 360) % 360 : u;
      const s = String(Math.round(shown / t.labelDiv)).padStart(t.labelPad, '0') + (t.labelSuffix ?? '');
      const [x, y] = t.axis === 'y' ? [t.labelOffset, a] : [a, t.labelOffset];
      labels += hudText(x, y, s, font, 'middle');
    }
  }
  return { ticks: `<path d="${ticks}" stroke-width="${HUD_PEN}" stroke-linecap="butt" fill="none"/>`, labels };
}

function hud(spec: PanelSpec, h: HudDisplay, value: (id: string) => number, pageOf: (id: string) => string) {
  const ind = (id: string) => spec.indicators.find(i => i.id === id);
  const pages = (id: string, draw: (page: string) => string) => (ind(id)?.pages ?? []).map(pg =>
    `<g data-page-of="${id}" data-page="${pg.id}"${pg.id === pageOf(id) ? '' : ' display="none"'}>${draw(pg.id)}</g>`).join('');
  const word = (id: string, pg: string) => pg === 'none' ? '' : ind(id)?.pages?.find(q => q.id === pg)?.label ?? '';
  const D = h.deg, F = h.font, pen = `stroke-width="${HUD_PEN}" fill="none"`;
  // `k` scales the page's move for this copy (−1 undoes a parent's shift).
  const shift = (id: string, axis: 'x' | 'y', per: number, body: string, k = 1) =>
    `<g data-indicator="${id}"><g data-shift="${id}"${k === 1 ? '' : ` data-k="${k}"`} transform="translate(${axis === 'x' ? `${n(value(id) * per * k)} 0` : `0 ${n(value(id) * per * k)}`})">${body}</g></g>`;
  const turned = (id: string, deg: number, body: string) => `<g data-indicator="${id}"><g data-needle="${id}" transform="rotate(${n(deg)})">${body}</g></g>`;
  const clip = `hud-glass-${spec.id}`;
  // Attitude bars: solid climb bars with their ticks down, dashed dive bars with their ticks up, labels toward the horizon.
  const L = h.ladder;
  let bars = `<path d="M${n(-L.horizon)} 0H${n(-L.gap)}M${n(L.gap)} 0H${n(L.horizon)}" ${pen}/>`;
  for (let p = -90; p <= 90; p += 5) {
    if (p === 0 || (Math.abs(p) > 60 && p % 10)) continue;
    const y = -p * D, up = p > 0, t = up ? L.tick : -L.tick, x1 = L.gap + L.length;
    const dash = up ? '' : ` stroke-dasharray="${n(L.dash[0])} ${n(L.dash[1])}"`;
    bars += [-1, 1].map(s => `<path d="M${n(s * L.gap)} ${n(y)}H${n(s * x1)}" ${pen}${dash}/><path d="M${n(s * L.gap)} ${n(y)}V${n(y + t)}" ${pen}/>` +
      hudText(s * (x1 - L.labelInset), y + (up ? L.labelDrop[0] : -L.labelDrop[1]), String(Math.abs(p)), F, 'middle')).join('');
  }
  const fpm = `<circle r="${n(h.fpm.r)}" ${pen}/><path d="M${n(-h.fpm.wing)} 0H${n(-h.fpm.r)}M${n(h.fpm.r)} 0H${n(h.fpm.wing)}M0 ${n(-h.fpm.r)}V${n(-h.fpm.tail)}" ${pen}/>`;
  const cue = shift('steering-cue', 'x', D, `<circle r="${n(h.steering.r)}" ${pen}/>` + turned('steering', value('steering'), `<path d="M0 ${n(-h.steering.r)}V${n(-h.steering.line)}" ${pen}/>`));
  // The bars sit on the boresight by pitch alone; they are caged to the marker in azimuth and turn with roll about it
  // (shifted to the marker's height, turned, shifted back).
  const ladder = shift('fpm-azimuth', 'x', D, shift('fpm-elevation', 'y', -D,
    turned('roll', -value('roll'), shift('fpm-elevation', 'y', -D, shift('pitch', 'y', D, bars), -1))));
  const attitude = ladder + shift('fpm-azimuth', 'x', D, shift('fpm-elevation', 'y', -D, fpm + cue));
  const b = h.boresight.arm, dm = h.diamond;
  const fixed = `<path d="M${n(-b)} 0H${n(b)}M0 ${n(-b)}V${n(b)}" ${pen}/>`;
  const steerpoint = shift('steerpoint-azimuth', 'x', D, shift('steerpoint-elevation', 'y', -D, `<path d="M0 ${n(-dm)}L${n(dm)} 0L0 ${n(dm)}L${n(-dm)} 0Z" ${pen}/>`));
  // Tapes: ticks and labels move inside windows fixed on the HUD; the index and readout box stay put. A HUD only adds light, so
  // the box is an outline and the symbol generator leaves the tape out of it: a mask cuts the box (and a pen's width round it) out.
  const tape = (id: string, t: HudTape, sfx = '') => {
    const [ax, ay] = t.at, deep = 40, along = t.axis === 'y';
    const rect = (a0: number, a1: number) => along ? `M${n(-deep)} ${n(a0)}H${n(deep)}V${n(a1)}H${n(-deep)}Z` : `M${n(a0)} ${n(-deep)}H${n(a1)}V${n(deep)}H${n(a0)}Z`;
    const lw = t.labelWindow ?? t.window, per = along ? t.per : -t.per, ra = t.readout, art = hudTape(t, F);
    const moving = (body: string) => `<g data-shift="${id}" transform="translate(${along ? `0 ${n(value(id) * per)}` : `${n(value(id) * per)} 0`})">${body}</g>`;
    return `<clipPath id="${clip}-${id}${sfx}-t"><path d="${rect(-t.window, t.window)}"/></clipPath>` +
      `<clipPath id="${clip}-${id}${sfx}-l"><path clip-rule="evenodd" d="${rect(-lw, lw)}${t.labelGap ? rect(-t.labelGap, t.labelGap) : ''}"/></clipPath>` +
      `<mask id="${clip}-${id}${sfx}-m" maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">` +
      `<rect x="-10000" y="-10000" width="20000" height="20000" fill="#fff"/><path d="${t.box}" fill="#000" stroke="#000" stroke-width="${n(HUD_PEN * 3)}"/></mask>` +
      `<g data-indicator="${id}"><g mask="url(#${clip}-${id}${sfx}-m)"><g transform="translate(${n(ax)} ${n(ay)})">` +
      `<g clip-path="url(#${clip}-${id}${sfx}-t)">${moving(art.ticks)}</g><g clip-path="url(#${clip}-${id}${sfx}-l)">${moving(art.labels)}</g></g></g>` +
      `<path d="${t.index}" ${pen}/><path d="${t.box}" ${pen}/>` +
      `<g data-number="${id}">${hudText(ra.at[0], ra.at[1], formatReadout(value(id), ra.format), F, ra.anchor)}</g></g>`;
  };
  const R = h.roll, [cx, cy] = R.centre;
  const rollTicks = R.ticks.map(a => {
    const r1 = R.longAt.includes(a) ? R.r[2] : R.r[1], s = Math.sin(a * Math.PI / 180), c = Math.cos(a * Math.PI / 180);
    return `M${n(cx + R.r[0] * s)} ${n(cy + R.r[0] * c)}L${n(cx + r1 * s)} ${n(cy + r1 * c)}`;
  }).join('');
  const [ca, cb, cw] = R.caret;
  const rollArt = `<path d="${rollTicks}" ${pen}/><g transform="translate(${n(cx)} ${n(cy)})">` +
    turned('roll', -value('roll'), `<path d="M0 ${n(ca)}L${n(cw / 2)} ${n(cb)}H${n(-cw / 2)}Z" ${pen}/>`) + '</g>';
  const fields = h.fields.map(f => {
    const pre = f.prefix ? hudText(f.prefix.at[0], f.prefix.at[1], f.prefix.text, F) : '';
    const body = ind(f.indicator)?.pages ? pages(f.indicator, pg => hudText(f.at[0], f.at[1], word(f.indicator, pg), F, f.anchor))
      : `<g data-number="${f.indicator}">${hudText(f.at[0], f.at[1], formatReadout(value(f.indicator), f.format), F, f.anchor)}</g>`;
    return pre + `<g data-indicator="${f.indicator}">${body}</g>`;
  }).join('');
  const mode = `<g data-indicator="velocity-mode">${pages('velocity-mode', pg => hudText(h.velocityMode[0], h.velocityMode[1], word('velocity-mode', pg), F, 'middle'))}</g>`;
  const cues = h.cues ? `<g data-indicator="${h.cues.id}">${pages(h.cues.id, pg => {
    const c = h.cues!.pages.find(q => q.id === pg)!;
    return (c.scene ?? '') + `<path d="${c.art}" ${pen}/>` + (c.steer ? shift('harm-asl', 'x', D, `<path d="${c.steer}" ${pen}/>`) : '') + c.texts.map(t => hudText(t.at[0], t.at[1], t.t, F, t.anchor)).join('') +
      (c.flash ? `<path d="${c.flash}" ${pen}><animate attributeName="opacity" values="1;0" calcMode="discrete" dur="0.4s" repeatCount="indefinite"/></path>` : '');
  })}</g>` : '';
  const heading = h.cues?.heading
    ? `<g data-indicator="${h.cues.id}">${pages(h.cues.id, pg => pg === 'none' || h.cues!.pages.find(q => q.id === pg)?.keepHeading ? tape('heading', h.heading) : tape('heading', h.cues!.heading!, '-hi'))}</g>`
    : tape('heading', h.heading);
  const on = `<g clip-path="url(#${clip})">` + fixed + steerpoint + attitude + rollArt + cues +
    tape('velocity', h.velocity) + tape('altitude', h.altitude) + heading + mode +
    h.boxes.map(d => `<path d="${d}" ${pen}/>`).join('') + fields + '</g>';
  return `<clipPath id="${clip}"><path d="${h.glass}"/></clipPath>` +
    `<g data-page-of="screen" data-page="on"${pageOf('screen') === 'on' ? '' : ' display="none"'}>${on}</g><g data-page-of="screen" data-page="off"${pageOf('screen') === 'off' ? '' : ' display="none"'}></g>`;
}

/** Standby attitude indicator: face with the fixed bank scale, the sphere (pitch then roll) through the window, the aircraft symbol and the OFF flag. */
function attitude(spec: PanelSpec, a: AttitudeBall, value: (id: string) => number, pageOf: (id: string) => string) {
  const clip = `sai-window-${spec.id}`, D = a.deg, W = a.window, big = W * 6;
  let s = gaugeBezel(a.bezel, a.face);
  s += a.ticks.map(t => { const [x0, y0] = polar(t.r[0], t.angle), [x1, y1] = polar(t.r[1], t.angle); return `<path d="M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}" stroke-width="${n(t.width)}" stroke-linecap="butt"/>`; }).join('');
  const [ia, ib, ih] = a.index;
  s += `<path d="M0 ${n(ia)}L${n(ih)} ${n(ib)}H${n(-ih)}Z" fill="${PAPER}" ${sw('medium')}/>`;
  // Sphere: ground below the horizon (faint), the horizon, bars and their split labels.
  const lab = a.label;
  let sphere = `<rect x="${n(-big)}" y="0" width="${n(2 * big)}" height="${n(big)}" fill="${INK}" fill-opacity="0.1" stroke="none"/>` +
    `<path d="M${n(-big)} 0H${n(big)}" ${sw('heavy')}/>`;
  for (const b of a.bars) {
    const y = -b.pitch * D;
    sphere += `<path d="M${n(-b.half)} ${n(y)}H${n(b.half)}" ${sw('medium')}/>`;
    if (b.label) {
      const [l, r] = b.label, wl = lab.widths[l], wr = lab.widths[r];
      sphere += text(-(lab.gap + wl / 2), y, l, lab.cap, wl) + text(lab.gap + wr / 2, y, r, lab.cap, wr);
    }
  }
  const [pa, pb, ph] = a.pointer;
  const pitch = `<g data-indicator="pitch"><g data-shift="pitch" transform="translate(0 ${n(value('pitch') * D)})">${sphere}</g></g>`;
  const ball = `<g data-indicator="roll"><g data-needle="roll" transform="rotate(${n(-value('roll'))})">${pitch}<path d="M0 ${n(pa)}L${n(ph)} ${n(pb)}H${n(-ph)}Z" fill="${PAPER}" ${sw('medium')}/></g></g>`;
  const box = (r: Rect, extra: string) => `<rect x="${n(r[0])}" y="${n(r[1])}" width="${n(r[2])}" height="${n(r[3])}" ${extra}/>`;
  const pg = (id: string, body: string) => `<g data-page-of="off-flag" data-page="${id}"${pageOf('off-flag') === id ? '' : ' display="none"'}>${body}</g>`;
  const [fx, fy, fw, fh] = a.flag.shown;
  const flag = `<g data-indicator="off-flag">` +
    pg('shown', painted('red', box(a.flag.shown, `fill="${PAPER}" ${sw('medium')}`)) + text(fx + fw / 2, fy + fh / 2, 'OFF', a.flag.cap)) +
    pg('hidden', box(a.flag.hidden, `fill="${PAPER}" ${sw('fine')}`)) + '</g>';
  s += `<clipPath id="${clip}"><circle r="${n(W)}"/></clipPath><circle r="${n(W)}" fill="${PAPER}" ${sw('medium')}/>` +
    `<g clip-path="url(#${clip})">${ball}${flag}</g>` +
    `<path d="${a.aircraft.wings}" fill="${PAPER}" ${sw('medium')}/><path d="${a.aircraft.w}" fill="none" ${sw('heavy')}/>` +
    `<circle r="${n(a.aircraft.dot)}" fill="${PAPER}" ${sw('medium')}/>` + `<circle r="${n(W)}" fill="none" ${sw('heavy')}/>`;
  return s;
}

/** Letters of `t` set round a circle of radius |arc| about the origin: along the top (arc > 0) or the bottom (arc < 0), `width` along the arc. */
function arcText(t: string, arc: number, cap: number, width: number) {
  const R = Math.abs(arc), step = width / t.length;
  return [...t].map((ch, i) => {
    const a = ((i - (t.length - 1) / 2) * step) / R * 180 / Math.PI, phi = arc > 0 ? a : 180 - a;
    const [x, y] = polar(R, phi);
    return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(arc > 0 ? a : -a)})">${text(0, 0, ch, cap)}</g>`;
  }).join('');
}

/** Pull-to-cage knob: scale marks, knurled rim, face printing and pointer turned with the knob; pulled shows the knob's side as an outer rim. */
function cageKnob(spec: PanelSpec, p: Extract<Placement, { component: 'cage-knob' }>, state: Record<string, string>) {
  const turnC = controlOf(spec, p.control), pullC = controlOf(spec, p.pull), knurl = Array.from({ length: 48 }, (_, k) => {
    const [x0, y0] = polar(p.face, k * 7.5), [x1, y1] = polar(p.r - 0.3, k * 7.5);
    return `M${n(x0)} ${n(y0)}L${n(x1)} ${n(y1)}`;
  }).join('');
  const marks = (p.marks ?? []).map(m => `<path d="${m.d}" ${m.fill ? `fill="${PAPER}" ` : ''}${sw(m.pen)}/>`).join('');
  const pulled = moving(pullC, state[pullC.id] ?? pullC.initial, i => i ? `<circle r="${n(p.r + 1.2)}" fill="${PAPER}" ${sw('medium')}/>` : '');
  const nd = p.needle;
  const pointer = nd ? cased(`<path d="M${n(-nd.half)} ${n(-nd.r[0])}L0 ${n(-nd.r[1])}L${n(nd.half)} ${n(-nd.r[0])}Z" fill="${PAPER}"/>`, 'medium') : '';
  const knob = moving(turnC, state[turnC.id] ?? turnC.initial, i => {
    const a = turnC.positions[i].angle ?? 0, print = a - (nd?.rest ?? 0);
    return (nd ? `<g transform="rotate(${n(a)})">${pointer}</g>` : '') + `<g transform="rotate(${n(print)})">` +
      cased(`<circle r="${n(p.r)}" fill="${PAPER}"/>`, 'heavy') + `<path d="${knurl}" ${sw('fine')}/><circle r="${n(p.face)}" fill="${PAPER}" ${sw('medium')}/>` +
      p.legend.map(l => l.arc ? arcText(l.text, l.arc, l.cap, l.width ?? l.cap * l.text.length) : text(l.at[0], l.at[1], l.text, l.cap, l.width)).join('') + '</g>';
  });
  return at(p.at, marks + pulled + knob, ' data-art="cage-knob"');
}

/** Every indicator a dial shows: its needle, its pointers and its counter. */
export function dialIndicators(p: Extract<Placement, { component: 'gauge' }>) {
  const ids = [...(p.indicator ? [p.indicator] : []), ...(p.dial.pointers ?? []).map(q => q.indicator), ...(p.dial.counter ? [p.dial.counter.indicator] : []), ...(p.dial.flags ?? []).map(f => f.indicator)];
  return [...new Set(ids)];
}

function placement(spec: PanelSpec, p: Placement, state: Record<string, string>): string {
  switch (p.component) {
    case 'gauge': {
      const value = (id: string) => state[id] !== undefined ? Number(state[id]) : spec.indicators.find(i => i.id === id)?.rest ?? p.dial.scale[0][0];
      const page = (id: string) => { const i = spec.indicators.find(d => d.id === id); return state[id] ?? i?.restPage ?? i?.pages?.[0]?.id ?? ''; };
      return at(p.at, gauge(spec, p.dial, p.indicator, value, page), ' data-art="gauge"');
    }
    case 'counter': {
      const c = p.counter, v = state[c.indicator] !== undefined ? Number(state[c.indicator]) : spec.indicators.find(i => i.id === c.indicator)?.rest ?? 0;
      return at(p.at, counter(c, v, `drums-${spec.id}-${c.indicator}`), ' data-art="counter"');
    }
    case 'thumbwheel': {
      // A wheel rolled left and right is the same wheel turned a quarter: drawn upright, then turned so its top is on the left.
      const c = controlOf(spec, p.control), k = c.positions.length, across = c.travel === 'horizontal';
      const size: [number, number] = across ? [p.size[1], p.size[0]] : p.size;
      return at(p.at, moving(c, state[c.id] ?? c.initial, i => thumbwheelArt(size, (i * 2.6 / k) % 1), across ? ' transform="rotate(-90)"' : ''), ' data-art="thumbwheel"');
    }
    case 'code-wheel': {
      const c = controlOf(spec, p.control), [w, h] = p.window, [tx, ty] = p.tab.at, [tw, th] = p.tab.size;
      const win = cased(`<rect x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" rx="0.4" fill="${PAPER}"/>`, 'heavy');
      const slot = `<rect x="${n(tx - tw / 2 - 0.8)}" y="${n(ty - th / 2 - 0.8)}" width="${n(tw + 1.6)}" height="${n(th + 1.6)}" rx="0.6" fill="${PAPER}" ${sw('fine')}/>`;
      const tab = cased(`<rect x="${n(tx - tw / 2)}" y="${n(ty - th / 2)}" width="${n(tw)}" height="${n(th)}" rx="0.5" fill="${PAPER}"/>`, 'medium');
      return at(p.at, win + slot + tab + moving(c, state[c.id] ?? c.initial, i => text(0, 0, c.positions[i].label, p.cap, p.width)), ' data-art="code-wheel"');
    }
    case 'rocker': {
      const c = controlOf(spec, p.control), mid = (c.positions.length - 1) / 2;
      return at(p.at, rockerBase(p.size) + moving(c, state[c.id] ?? c.initial, i => rockerCap(p.size, Math.sign(i - mid), p.arrows, p.legend)), ' data-art="rocker"');
    }
    case 'hat': {
      // The up/down lever is drawn by its control; off centre left or right, the cross control redraws the well and the lever.
      const v = controlOf(spec, p.control), h = controlOf(spec, p.cross), vm = (v.positions.length - 1) / 2, hm = (h.positions.length - 1) / 2;
      const lean = p.length * Math.sin(p.tilt * Math.PI / 180);
      return at(p.at, hatBase(p.r) +
        moving(v, state[v.id] ?? v.initial, i => hatLever(p.lever, 0, Math.sign(i - vm) * lean)) +
        moving(h, state[h.id] ?? h.initial, i => i === hm ? '' : `<circle r="${n(p.r * 0.86)}" fill="${PAPER}" ${sw('fine')}/>` + hatLever(p.lever, Math.sign(i - hm) * lean, 0)), ' data-art="hat"');
    }
    case 'blinker': {
      const ind = spec.indicators.find(i => i.id === p.indicator), cur = state[p.indicator] ?? ind?.restPage ?? p.dark, [w, h] = p.size;
      const win = (fill: string) => `<rect x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" rx="${n(h / 2)}" fill="${fill}" ${sw('medium')}/>`;
      return at(p.at, `<g data-indicator="${p.indicator}">` + (ind?.pages ?? []).map(pg =>
        `<g data-page-of="${p.indicator}" data-page="${pg.id}"${pg.id === cur ? '' : ' display="none"'}>${win(pg.id === p.dark ? INK : PAPER)}</g>`).join('') + '</g>', ' data-art="blinker"');
    }
    case 'flag-window': {
      const ind = spec.indicators.find(i => i.id === p.indicator), cur = state[p.indicator] ?? ind?.restPage ?? '', [w, h] = p.size;
      const box = `x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" rx="${n(p.r)}"`;
      return at(p.at, `<g data-indicator="${p.indicator}"><rect ${box} fill="${PAPER}" stroke="none"/>` + (ind?.pages ?? []).map(pg => {
        const f = p.faces[pg.id] ?? {};
        return `<g data-page-of="${p.indicator}" data-page="${pg.id}"${pg.id === cur ? '' : ' display="none"'}>${f.svg ?? ''}${f.legend ? text(0, 0, f.legend.text, f.legend.cap, f.legend.width) : ''}</g>`;
      }).join('') + `<rect ${box} fill="none" ${sw('medium')}/></g>`, ' data-art="flag-window"');
    }
    case 'led-display': {
      const ind = spec.indicators.find(i => i.id === p.indicator), cur = state[p.indicator] ?? ind?.restPage ?? 'off';
      const lit = (page: string) => {
        if (page === 'off') return '';
        const chars = page === 'test' ? p.cells.map(() => 'all') : [...page.replace('.', '')].reverse().slice(0, p.cells.length).reverse();
        const pad = p.cells.length - chars.length;
        const segs = p.cells.flatMap((c, k) => {
          const ch = chars[k - pad], all = ledSegments(c.at[0], c.at[1], c.size[0], c.size[1]);
          return ch === undefined ? [] : ch === 'all' ? all : (LED_CHARS[ch] ?? []).map(i => all[i]);
        });
        const dot = p.dot && (page === 'test' || page.includes('.')) ? `<circle cx="${n(p.dot.at[0])}" cy="${n(p.dot.at[1])}" r="${n(p.dot.r)}"/>` : '';
        return `<path d="${segs.join('')}"/>` + dot;
      };
      // Dark window round the cells, the unlit segments faint, the lit ones in LED yellow.
      const xs = p.cells.flatMap(c => [c.at[0] - c.size[0] / 2, c.at[0] + c.size[0] / 2]), ys = p.cells.flatMap(c => [c.at[1] - c.size[1] / 2, c.at[1] + c.size[1] / 2]);
      const [x0, x1, y0, y1] = [Math.min(...xs) - 1.6, Math.max(...xs) + 1.6, Math.min(...ys) - 1.3, Math.max(...ys) + 1.3];
      const faint = p.cells.flatMap(c => ledSegments(c.at[0], c.at[1], c.size[0], c.size[1])).join('');
      return at(p.at, `<rect x="${n(x0)}" y="${n(y0)}" width="${n(x1 - x0)}" height="${n(y1 - y0)}" rx="0.6" fill="${MFD_GLASS}" stroke="none"/>` +
        `<path d="${faint}" fill="${SCREEN.led}" fill-opacity="0.1" stroke="none"/>` +
        `<g data-indicator="${p.indicator}" fill="${SCREEN.led}" stroke="none">` + (ind?.pages ?? []).map(pg =>
        `<g data-page-of="${p.indicator}" data-page="${pg.id}"${pg.id === cur ? '' : ' display="none"'}>${lit(pg.id)}</g>`).join('') + '</g>', ' data-art="led-display"');
    }
    case 'mfd-display': {
      const ind = spec.indicators.find(i => i.id === p.indicator);
      return at(p.at, mfdDisplay(p.display, ind, p.indicator, state[p.indicator] ?? ind?.restPage ?? 'off'), ' data-art="mfd-display"');
    }
    case 'text-display': {
      const ind = spec.indicators.find(i => i.id === p.indicator);
      return at(p.at, textDisplay(p.display, ind, p.indicator, state[p.indicator] ?? ind?.restPage ?? 'off'), ' data-art="text-display"');
    }
    case 'hsi': {
      const ind = (id: string) => spec.indicators.find(i => i.id === id);
      const value = (id: string) => state[id] !== undefined ? Number(state[id]) : ind(id)?.rest ?? 0;
      const pageOf = (id: string) => state[id] ?? ind(id)?.restPage ?? ind(id)?.pages?.[0]?.id ?? '';
      return `<path d="${p.hsi.screen}" fill="${MFD_GLASS}" stroke="none"/><g data-indicator="screen"><path class="lens" d="${p.hsi.screen}" stroke="none"/></g>` + at(p.at, onGlass(SCREEN.ehsi, hsi(spec, p.hsi, value, pageOf)), ' data-art="hsi"');
    }
    case 'hud': {
      const ind = (id: string) => spec.indicators.find(i => i.id === id);
      const value = (id: string) => state[id] !== undefined ? Number(state[id]) : ind(id)?.rest ?? 0;
      const pageOf = (id: string) => state[id] ?? ind(id)?.restPage ?? ind(id)?.pages?.[0]?.id ?? '';
      const sky = `hud-sky-${spec.id}`;
      return at(p.at, `<linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HUD_SKY[0]}"/><stop offset="1" stop-color="${HUD_SKY[1]}"/></linearGradient>` +
        `<path d="${p.hud.glass}" fill="url(#${sky})" stroke="none"/><g data-indicator="screen"><path class="lens" d="${p.hud.glass}" stroke="none"/></g>` + onGlass(SCREEN.hud, hud(spec, p.hud, value, pageOf), HUD_SKY[0]), ' data-art="hud"');
    }
    case 'attitude': {
      const ind = (id: string) => spec.indicators.find(i => i.id === id);
      const value = (id: string) => state[id] !== undefined ? Number(state[id]) : ind(id)?.rest ?? 0;
      const pageOf = (id: string) => state[id] ?? ind(id)?.restPage ?? ind(id)?.pages?.[0]?.id ?? '';
      return at(p.at, attitude(spec, p.ball, value, pageOf), ' data-art="attitude"');
    }
    case 'cage-knob': return cageKnob(spec, p, state);
    case 'dzus': case 'screw': case 'screw-medium': case 'screw-small': case 'screw-hex': case 'screw-tiny':
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
    case 'rotary-pointer': case 'rotary-pointer-large': case 'rotary-pointer-medium': case 'rotary-bar-broad': {
      const c = controlOf(spec, p.control);
      return at(p.at, rotaryBase(p.component) + moving(c, state[c.id] ?? c.initial, i =>
        `<g transform="rotate(${c.positions[i].angle ?? 0})">${rotaryKnob(p.component)}</g>`), ` data-art="${p.component}"`);
    }
    case 'knob-fine-knurl-small': case 'knob-knurled-small': case 'knob-knurled': case 'knob-knurled-edge': case 'knob-knurled-skirt': case 'knob-bar': case 'knob-lobed': case 'knob-bar-medium': case 'knob-knurled-mini': case 'knob-radio-large': case 'knob-bar-thick': case 'knob-spindle': case 'knob-knurled-large': case 'knob-knurled-small-edge': case 'knob-round': case 'knob-round-small': case 'knob-cross': case 'knob-cross-small': case 'knob-plain': case 'knob-plain-small': case 'knob-plain-index': case 'knob-round-tail': {
      const c = controlOf(spec, p.control);
      return at(p.at, moving(c, state[c.id] ?? c.initial, i =>
        `<g transform="rotate(${c.positions[i].angle ?? 0})">${knobArt(p.component)}</g>`), ` data-art="${p.component}"`);
    }
    case 'push-round-small': case 'push-round-medium': case 'push-round-large': case 'push-round-xl': case 'push-round-flat': case 'push-round-xxl': case 'push-round-bezel': case 'push-round-wide': case 'push-round-plain': {
      const c = controlOf(spec, p.control), art = p.component;
      // Cap printing shrinks with the cap when pressed.
      const print = (pressed: boolean) => {
        if (!p.legend && !p.marks) return '';
        const k = pressed ? 0.9 : 1;
        return `<g transform="scale(${k})">` + (p.legend ?? []).map(l => text(0, l.y, l.text, l.cap, l.width)).join('') +
          (p.marks ? `<path d="${p.marks}" fill="none" ${sw('fine')}/>` : '') + '</g>';
      };
      // A painted button is painted whole: cap and skirt (DN LOCK REL).
      if (p.paintCapOnly) return at(p.at, pushBase(art) + moving(c, state[c.id] ?? c.initial, i => painted(p.paint, pushCap(art, i > 0)) + print(i > 0)), ` data-art="${p.component}"`);
      return at(p.at, painted(p.paint, pushBase(art) + moving(c, state[c.id] ?? c.initial, i => pushCap(art, i > 0) + print(i > 0))), ` data-art="${p.component}"`);
    }
    case 'gear-handle': {
      // Knob centred on the slot at each end of its travel (first position at the top).
      const c = controlOf(spec, p.control), last = c.positions.length - 1;
      return at(p.at, gearSlot(p.travel) + moving(c, state[c.id] ?? c.initial, i => gearKnob(p.size, p.travel * (i / last - 0.5), p.indicator)), ' data-art="gear-handle"');
    }
    case 'traced': {
      const c = controlOf(spec, p.control);
      const tw = p.tween ? ` data-tween="${p.tween.drag?.axis ?? ''}"${p.tween.drag?.from ? ` data-drag-from="${p.tween.drag.from}"` : ''}` : '';
      return `<g data-art="traced">` + painted(p.paint, moving(c, state[c.id] ?? c.initial, i => {
        const sh = p.shapes[c.positions[i].id];
        return sh ? (sh.d ? cased(`<path d="${sh.d}" fill="${PAPER}" fill-rule="evenodd"/>`) : '') + (sh.parts ?? []).map(d => cased(`<path d="${d}" fill="${PAPER}"/>`)).join('') + (sh.lines ? `<path d="${sh.lines}" fill="none" ${sw('fine')}/>` : '') + (sh.legend ?? []).map(l => text(l.at[0], l.at[1], l.text, l.cap, l.width)).join('') + (sh.svg ?? '') : '';
      }, tw)) + '</g>';
    }
    case 'slot-lever': {
      // The arm pivots under the slot, first position at the left: its knob swings across `travel` while its root
      // moves only the slot's length (less the root's own width).
      const c = controlOf(spec, p.control), last = c.positions.length - 1;
      const slot = p.slot ?? p.travel + SLOT_LEVER.root, rootTravel = slot - SLOT_LEVER.root;
      return turn(p.rotate, p.at[0], p.at[1], at(p.at, leverSlot(slot - SLOT_LEVER.root) + moving(c, state[c.id] ?? c.initial, i => slotLeverArt(p.travel * (i / last - 0.5), rootTravel * (i / last - 0.5))), ' data-art="slot-lever"'));
    }
    case 'push-square': {
      const c = controlOf(spec, p.control), [w, h] = p.size, li = 2.2;
      // The legend is fixed on top of the moving cap; on a lit button it is the lamp's lens.
      const legend = p.legend.map(l => text(l.x ?? 0, l.y, l.text, l.cap, l.width)).join('');
      const face = p.indicator
        ? `<g data-indicator="${p.indicator}"><rect class="lens" x="${n(-w / 2 + li)}" y="${n(-h / 2 + li)}" width="${n(w - 2 * li)}" height="${n(h - 2 * li)}" rx="0.5" stroke="none"/>${legend}</g>`
        : legend;
      return at(p.at, turn(p.rotate, 0, 0, pushSquareBase(p.size) + moving(c, state[c.id] ?? c.initial, i => pushSquareCap(p.size, i > 0) + (p.marks ? `<path d="${p.marks}" fill="none" ${sw('medium')}/>` : '')) + face), ' data-art="push-square"');
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
  // Parts that come out from behind the housing (`under`) are drawn before the plate.
  const under = spec.placements.filter(p => 'under' in p && p.under).map(p => placement(spec, p, state)).join('');
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
    if (e.kind === 'svg') return e.markup;
    return `<path d="${e.d}" ${sw(e.pen ?? 'medium')}${e.faint ? ' stroke-opacity="0.3"' : ''}/>`;
  }).join('');
  return `<svg class="cockpit-svg" viewBox="0 0 ${n(w)} ${n(h)}" xmlns="http://www.w3.org/2000/svg" ${opts.label ? `role="img" aria-label="${esc(opts.label)}"` : 'aria-hidden="true"'}>` +
    `<g fill="none" stroke="${INK}" stroke-linejoin="round" stroke-linecap="round" font-family="${FONT}" font-weight="600">` +
    (spec.plate.length || clips ? `<defs>${spec.plate.length ? `<clipPath id="plate-${spec.id}"><path d="${spec.plate[spec.plate.length - 1].d}"/></clipPath><clipPath id="base-${spec.id}"><path d="${spec.plate[0].d}"/></clipPath>` : ''}${clips}</defs>` : '') +
    (under ? `<g class="components under">${under}</g>` : '') + `<g class="plate">${plate}</g><g class="engraving">${engraving}</g>` +
    `<g class="components">${spec.placements.filter(p => !('under' in p && p.under)).map(p => placement(spec, p, state)).join('')}</g></g>` +
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
  /** Shown only while its control is at this position (hit areas that move with the part). */
  pos?: string;
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
      case 'rotary-pointer': case 'rotary-pointer-large': case 'rotary-pointer-medium': case 'rotary-bar-broad': {
        const r = ROTARIES[p.component].skirt * 1.15;
        return [{ kind: 'control', id: p.control, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'knob-fine-knurl-small': case 'knob-knurled-small': case 'knob-knurled': case 'knob-knurled-edge': case 'knob-knurled-skirt': case 'knob-bar': case 'knob-lobed': case 'knob-bar-medium': case 'knob-knurled-mini': case 'knob-radio-large': case 'knob-bar-thick': case 'knob-spindle': case 'knob-knurled-large': case 'knob-knurled-small-edge': case 'knob-round': case 'knob-round-small': case 'knob-cross': case 'knob-cross-small': case 'knob-plain': case 'knob-plain-small': case 'knob-plain-index': case 'knob-round-tail': {
        const r = KNOBS[p.component].r * 1.1;
        return [{ kind: 'control', id: p.control, box: [x - r, y - r, 2 * r, 2 * r], round: true }];
      }
      case 'code-wheel': {
        const [w, h] = p.window, [tx, ty] = p.tab.at, [tw, th] = p.tab.size, x0 = Math.min(-w / 2, tx - tw / 2) - 0.8, x1 = Math.max(w / 2, tx + tw / 2) + 0.8;
        return [{ kind: 'control', id: p.control, box: [x + x0, y - h / 2 - 0.8, x1 - x0, ty + th / 2 + h / 2 + 1.6] }];
      }
      case 'thumbwheel': case 'rocker': {
        const [w, h] = p.size;
        return [{ kind: 'control', id: p.control, box: [x - w / 2, y - h / 2, w, h] }];
      }
      case 'hat': {
        const r = p.r * 1.2;
        return [
          { kind: 'control', id: p.control, box: [x - r * 0.6, y - r * 1.25, r * 1.2, r * 2.5] },
          { kind: 'control', id: p.cross, box: [x - r * 1.5, y - r * 0.5, r * 3, r] },
        ];
      }
      case 'led-display': {
        const xs = p.cells.flatMap(c => [c.at[0] - c.size[0], c.at[0] + c.size[0]]), ys = p.cells.flatMap(c => [c.at[1] - c.size[1], c.at[1] + c.size[1]]);
        const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
        return [{ kind: 'indicator', id: p.indicator, box: [x + x0, y + y0, Math.max(...xs) - x0, Math.max(...ys) - y0] }];
      }
      case 'blinker': case 'flag-window': {
        const [w, h] = p.size;
        return [{ kind: 'indicator', id: p.indicator, box: [x - w / 2, y - h / 2, w, h] }];
      }
      case 'mfd-display': {
        const o = p.display.opening;
        return [{ kind: 'indicator', id: p.indicator, box: [x - o / 2, y - o / 2, o, o] }];
      }
      case 'text-display': {
        const [w, h] = p.display.bezel;
        return [{ kind: 'indicator', id: p.indicator, box: [x - w / 2, y - h / 2, w, h] }];
      }
      case 'hsi': {
        const nums = (p.hsi.screen.match(/-?\d*\.?\d+/g) ?? []).map(Number);
        const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
        const x0 = Math.min(...xs), y0 = Math.min(...ys);
        return [{ kind: 'indicator', id: 'screen', box: [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0] }];
      }
      case 'attitude': {
        const a = p.ball, w = a.window, [fx, fy, fw, fh] = a.flag.shown;
        return [
          { kind: 'indicator', id: 'pitch', box: [x - w * 0.6, y - w * 0.85, w * 1.2, w * 1.4] },
          { kind: 'indicator', id: 'roll', box: [x - a.face * 0.5, y + w * 0.6, a.face, a.face - w * 0.6] },
          { kind: 'indicator', id: 'off-flag', box: [x + fx, y + fy, fw, fh] },
        ];
      }
      case 'cage-knob': {
        const r = p.r * 1.1;
        return [
          { kind: 'control', id: p.control, box: [x - r, y - r, 2 * r, 2 * r], round: true },
          { kind: 'control', id: p.pull, box: [x - p.face * 0.5, y - p.face * 0.5, p.face, p.face] },
        ];
      }
      case 'hud': {
        const nums = (p.hud.glass.match(/-?\d*\.?\d+/g) ?? []).map(Number);
        const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
        const x0 = Math.min(...xs), y0 = Math.min(...ys);
        return [{ kind: 'indicator', id: 'screen', box: [x + x0, y + y0, Math.max(...xs) - x0, Math.max(...ys) - y0] }];
      }
      case 'gear-handle': {
        const [w, h] = p.size, bh = p.travel + h;
        return [{ kind: 'control', id: p.control, box: [x - w / 2, y - bh / 2, w, bh] }];
      }
      case 'traced': {
        if (p.hits) return Object.entries(p.hits).map(([pos, h]) => ({ kind: 'control', id: p.control, box: h.box, rotate: h.rotate, pos }));
        if (p.hit) return [{ kind: 'control', id: p.control, box: p.hit }];
        // Bounds of every position's outline.
        const nums = Object.values(p.shapes).flatMap(sh => (sh.d.match(/-?\d*\.?\d+/g) ?? []).map(Number));
        const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
        const x0 = Math.min(...xs), y0 = Math.min(...ys);
        return [{ kind: 'control', id: p.control, box: [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0] }];
      }
      case 'slot-lever': {
        // The slot and the lever's knob below it (seen from above); turned levers get the turned box's bounds.
        const { root, disc, blade, neck, thick } = SLOT_LEVER, w = p.travel + Math.max(root, disc);
        const top = -blade / 2 - 2, bottom = blade / 2 + neck[1] + thick + 2, h = bottom - top, mid = (top + bottom) / 2;
        const a = ((p.rotate ?? 0) * Math.PI) / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
        const cx = x - mid * Math.sin(a), cy = y + mid * Math.cos(a);
        const bw = w * c + h * s, bh = w * s + h * c;
        return [{ kind: 'control', id: p.control, box: [cx - bw / 2, cy - bh / 2, bw, bh] }];
      }
      case 'push-round-small': case 'push-round-medium': case 'push-round-large': case 'push-round-xl': case 'push-round-flat': case 'push-round-xxl': case 'push-round-bezel': case 'push-round-wide': case 'push-round-plain': {
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
        const half = p.dial.half;
        if (p.indicator) zones.push(half
          ? { kind: 'indicator', id: p.indicator, box: half === 'left' ? [x - r, y - r, r, 2 * r] : half === 'right' ? [x, y - r, r, 2 * r] : half === 'up' ? [x - r, y - r, 2 * r, r] : [x - r, y, 2 * r, r] }
          : { kind: 'indicator', id: p.indicator, box: [x - r, y - r, 2 * r, 2 * r], round: true });
        // Pointers: a round zone over the letters at the pointer's cold-and-dark reading.
        for (const q of p.dial.pointers ?? []) {
          const rest = spec.indicators.find(i => i.id === q.indicator)?.rest ?? p.dial.scale[0][0];
          const [px, py] = polar((PADDLE_POINTER.outer + PADDLE_POINTER.inner) / 2, dialAngle(p.dial, rest)), zr = 4.5;
          zones.push({ kind: 'indicator', id: q.indicator, box: [x + px - zr, y + py - zr, 2 * zr, 2 * zr], round: true });
        }
        const c = p.dial.counter;
        if (c && c.indicator !== p.indicator) zones.push({ kind: 'indicator', id: c.indicator, box: [x + c.at[0] - c.window[0] / 2, y + c.at[1] - c.window[1] / 2, c.window[0], c.window[1]] });
        for (const f of p.dial.flags ?? []) zones.push({ kind: 'indicator', id: f.indicator, box: [x + f.at[0] - f.size[0] / 2, y + f.at[1] - f.size[1] / 2, f.size[0], f.size[1]] });
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
