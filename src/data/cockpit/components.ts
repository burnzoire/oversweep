/**
 * Shared component artwork, in the common drawing unit (mm).
 *
 * Each component owns its fixed dimensions and is drawn around its pivot
 * (0,0): the bushing centre of a toggle, the shaft of a rotary, the centre of a
 * pushbutton, the hinge line of a guard. Artwork knows nothing about how a
 * control behaves; it only draws the static base and one moving part per
 * position it is asked for. Movement lives in `ControlDef` (types.ts).
 *
 * Style: black line on white, as in old flight-manual illustrations. Bezels,
 * rings and plate edges use `cased()` (heavy ink line with a thin white core)
 * and every stroke snaps to one of three pens.
 */
import type { Pen } from './types';

export const INK = 'var(--panel-ink,#161616)';
export const PAPER = 'var(--panel-paper,#fff)';
/**
 * Lettering. MS 33558 is a monoline gothic; the closest bundled-free stack is a
 * condensed sans, stretched to the measured width of each legend.
 */
export const FONT = "'DIN Condensed','Roboto Condensed','Arial Narrow','Liberation Sans Narrow','Helvetica Neue',Arial,sans-serif";

export const PENS: Record<Pen, number> = { fine: 0.25, medium: 0.4, heavy: 0.6 };
export const n = (v: number) => +v.toFixed(3);
export const sw = (p: Pen) => `stroke-width="${PENS[p]}"`;
export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const rad = (deg: number) => (deg * Math.PI) / 180;
/** Point at `deg` clockwise from 12 o'clock. */
export const polar = (r: number, deg: number): [number, number] => [r * Math.sin(rad(deg)), -r * Math.cos(rad(deg))];

/** Heavy outline with a thin white core: the double-line engraving look. */
export function cased(el: string, p: Pen = 'heavy') {
  const w = PENS[p];
  return el.replace(/\/>$/, ` stroke-width="${w}"/>`) +
    el.replace(/ (fill|class)="[^"]*"/g, '').replace(/\/>$/, ` fill="none" stroke="${PAPER}" stroke-width="${n(w * 0.34)}"/>`);
}

/** Legend text with its cap height in mm, optionally locked to a measured width. */
export function text(x: number, y: number, s: string, cap: number, width?: number, anchor = 'middle') {
  const fit = width ? ` textLength="${n(width)}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text x="${n(x)}" y="${n(y + cap / 2)}" font-size="${n(cap / 0.72)}" text-anchor="${anchor}"${fit} fill="${INK}" stroke="none">${esc(s)}</text>`;
}

/* ------------------------------------------------------------- fasteners */

export const FASTENERS = {
  /** Quarter-turn DZUS stud head. */
  dzus: { r: 4.25 },
  /** Panel screw in a countersunk well. */
  screw: { r: 3.4 },
  'screw-medium': { r: 2.8 },
  'screw-small': { r: 2.1 },
} as const;

export function fastener(kind: keyof typeof FASTENERS) {
  const r = FASTENERS[kind].r;
  if (kind === 'dzus') {
    const w = r * 0.16;
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.76)}" ${sw('fine')}/>` +
      `<path d="M${n(-w)} ${n(-r * 0.76)}V${n(r * 0.76)}M${n(w)} ${n(-r * 0.76)}V${n(r * 0.76)}" ${sw('medium')}/>`;
  }
  const c = r * 0.42;
  return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'medium') + `<circle r="${n(r * 0.66)}" ${sw('fine')}/>` +
    `<path d="M${n(-c)} 0H${n(c)}M0 ${n(-c)}V${n(c)}" ${sw('heavy')}/>`;
}

/* --------------------------------------------------------------- toggles */

/**
 * Toggle switches seen square-on. `r` is the bushing bezel radius; the lever
 * leans toward the selected position and its projected length is `reach`.
 * Proportions follow the approved JFS panel artwork: a lever that flares from
 * the bushing to a ball about half the bezel radius.
 */
export const TOGGLES = {
  'toggle-large': { r: 5.2, reach: 7.0, ball: 2.5, cap: 'ball' },
  'toggle-medium': { r: 4.0, reach: 5.9, ball: 1.95, cap: 'ball' },
  'toggle-small': { r: 3.0, reach: 4.4, ball: 1.5, cap: 'ball' },
  /**
   * Pull-to-unlock (lever-lock) switch, MAIN PWR. Proportions from the
   * Honeywell MICRO SWITCH TL-series mounting drawing (p. 45): 15/32 in
   * bushing, lever 26.7 mm above the bushing, cap 10.7 mm dia, 34° total
   * travel (17° each side). Scaled to this bushing, seen square-on the lever
   * projects only ~26.7·sin 17° and the cap stays almost face-on (cos 17°).
   * `ball` is the cap radius.
   */
  'toggle-large-cylinder': { r: 5.2, reach: 4.9, ball: 3.45, cap: 'cylinder' },
  /** Medium bushing with a large square paddle cap (AIR REFUEL). */
  'toggle-large-square': { r: 4.0, reach: 6.2, ball: 3.6, cap: 'square' },
} as const;

/** Lever lean for each position in travel order: -1 toward the first, 0 straight out, 1 toward the last. */
export function toggleLeans(count: number) {
  return count === 3 ? [-1, 0, 1] : count === 2 ? [-1, 1] : Array.from({ length: count }, (_, i) => -1 + (2 * i) / (count - 1));
}

export function toggleBase(art: keyof typeof TOGGLES) {
  const { r, cap } = TOGGLES[art];
  if (cap === 'cylinder') {
    // Lever-lock: round bushing (no hex nut on the panel face) with the
    // locking insert showing: a slot the lever travels in, with a detent
    // notch at each latched position (top, centre, bottom).
    const ri = r * 0.6, sw2 = r * 0.2, sl = r * 0.48, nd = r * 0.12;
    const notches = [-sl * 0.85, 0, sl * 0.85].map(y => `M${n(-sw2)} ${n(y - nd)}H${n(-sw2 - nd)}V${n(y + nd)}H${n(-sw2)}M${n(sw2)} ${n(y - nd)}H${n(sw2 + nd)}V${n(y + nd)}H${n(sw2)}`).join('');
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.82)}" ${sw('fine')}/>` +
      cased(`<circle r="${n(ri)}" fill="${PAPER}"/>`, 'medium') +
      `<rect x="${n(-sw2)}" y="${n(-sl)}" width="${n(sw2 * 2)}" height="${n(sl * 2)}" rx="${n(sw2)}" ${sw('medium')}/><path d="${notches}" ${sw('fine')}/>`;
  }
  const hex = Array.from({ length: 6 }, (_, i) => polar(r * 0.74, 30 + i * 60)).map(([x, y]) => `${n(x)} ${n(y)}`).join('L');
  return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<path d="M${hex}Z" fill="${PAPER}" ${sw('medium')}/>` +
    `<circle r="${n(r * 0.42)}" ${sw('fine')}/>`;
}

/**
 * The moving lever at lean `k` (-1..1) along +y (vertical travel, down = +1).
 * Horizontal travel is the same drawing rotated by the renderer.
 */
export function toggleLever(art: keyof typeof TOGGLES, k: number) {
  const { r, reach, ball, cap } = TOGGLES[art];
  const L = reach * k;
  const w0 = cap === 'cylinder' ? ball * 0.58 : r * 0.3, w1 = cap === 'cylinder' ? ball * 0.62 : ball * 0.62;
  // Mushroom cap: the lever leans only ~17° from the panel normal, so the cap stays almost square to the
  // viewer (a near-circle); a smaller ring marks the dome.
  const face = (ry: number) => cased(`<ellipse cy="${n(L)}" rx="${ball}" ry="${n(ry)}" fill="${PAPER}"/>`, 'medium') +
    `<ellipse cy="${n(L)}" rx="${n(ball * 0.55)}" ry="${n(ry * 0.55)}" ${sw('fine')}/>`;
  const tip = cap === 'cylinder'
    ? face(Math.abs(k) < 1e-6 ? ball : ball * 0.96)
    : cap === 'square'
    ? cased(`<rect x="${n(-ball)}" y="${n(L - ball * 0.9)}" width="${n(ball * 2)}" height="${n(ball * 1.8)}" rx="${n(ball * 0.18)}" fill="${PAPER}"/>`, 'medium') +
      `<rect x="${n(-ball * 0.62)}" y="${n(L - ball * 0.52)}" width="${n(ball * 1.24)}" height="${n(ball * 1.04)}" rx="${n(ball * 0.1)}" fill="${PAPER}" ${sw('fine')}/>`
    : cased(`<circle cy="${n(L)}" r="${ball}" fill="${PAPER}"/>`, 'medium') + `<circle cx="${n(-ball * 0.3)}" cy="${n(L - ball * 0.3)}" r="${n(ball * 0.32)}" ${sw('fine')}/>`;
  if (Math.abs(k) < 1e-6) return tip;
  const s = Math.sign(k);
  // Shaft: semicircle on the bushing side, straight flanks out to the ball.
  const shaft = cap === 'cylinder'
    // Thick lever with a round base (the cylinder seen end-on at the pivot), slightly wider at the cap.
    ? `<path d="M${n(-w0)} 0A${n(w0)} ${n(w0)} 0 0 ${s > 0 ? 1 : 0} ${n(w0)} 0L${n(w1)} ${n(L)}H${n(-w1)}Z" fill="${PAPER}" ${sw('medium')}/>`
    : `<path d="M${n(-w0)} 0A${n(w0)} ${n(w0)} 0 0 ${s > 0 ? 1 : 0} ${n(w0)} 0L${n(w1)} ${n(L)}H${n(-w1)}Z" fill="${PAPER}" ${sw('medium')}/>`;
  return shaft + tip;
}

/* --------------------------------------------------------------- rotaries */

export const ROTARIES = {
  /** Bar-pointer selector on a round skirt (ENG FEED). */
  'rotary-pointer': { skirt: 10.2, bar: 9.6, barBack: 4.8, barFront: 3.4 },
} as const;

export function rotaryBase(art: keyof typeof ROTARIES) {
  const { skirt } = ROTARIES[art];
  return cased(`<circle r="${skirt}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(skirt * 0.9)}" ${sw('fine')}/>`;
}

/** The knob drawn pointing at 12 o'clock; the renderer rotates it to the detent. */
export function rotaryKnob(art: keyof typeof ROTARIES) {
  const { bar, barBack, barFront } = ROTARIES[art];
  const body = `M${-barFront} ${-bar}Q0 ${n(-bar - 1.2)} ${barFront} ${-bar}L${barBack} ${n(bar * 0.82)}Q0 ${n(bar * 1.08)} ${-barBack} ${n(bar * 0.82)}Z`;
  return cased(`<path d="${body}" fill="${PAPER}"/>`, 'heavy') +
    `<path d="M0 ${n(-bar + 0.9)}V${n(-bar * 0.25)}" ${sw('heavy')}/>`;
}

/* ------------------------------------------------------------ pushbuttons */

export const PUSHES = {
  'push-round-large': { r: 6.6, cap: 4.5 },
} as const;

export function pushBase(art: keyof typeof PUSHES) {
  const { r } = PUSHES[art];
  return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.84)}" ${sw('fine')}/>`;
}

/** Cap out (`in` false) or pressed in (drawn smaller with a deeper shadow ring). */
export function pushCap(art: keyof typeof PUSHES, pressed: boolean) {
  const { cap } = PUSHES[art];
  const c = pressed ? cap * 0.9 : cap;
  return cased(`<circle r="${n(c)}" fill="${PAPER}"/>`, 'medium') + (pressed ? `<circle r="${n(c * 0.8)}" ${sw('fine')}/>` : '');
}

/* ----------------------------------------------------------------- guards */

/**
 * Flip guard, hinged along its bottom edge (the pivot), covering a toggle when
 * closed. `size` is the closed footprint. Open, it stands up toward the viewer
 * and is seen edge-on as a short band at the hinge.
 */
export function guardArt(size: [number, number], open: boolean) {
  const [w, h] = size;
  const x = -w / 2;
  if (open) {
    const band = h * 0.2;
    return cased(`<rect x="${n(x)}" y="${n(-band)}" width="${n(w)}" height="${n(band)}" rx="0.6" fill="${PAPER}"/>`, 'heavy') +
      `<path d="M${n(x + 1)} ${n(-band * 0.5)}H${n(-x - 1)}" ${sw('fine')}/>`;
  }
  // Closed: U-shaped cover with a notch at the top for the lever and side slots.
  const notch = w * 0.4, nd = h * 0.27;
  const d = `M${n(x)} ${n(-h)}H${n(-notch / 2)}V${n(-h + nd)}Q0 ${n(-h + nd + 1.2)} ${n(notch / 2)} ${n(-h + nd)}V${n(-h)}H${n(-x)}V-1.2Q${n(-x)} 0 ${n(-x - 1.2)} 0H${n(x + 1.2)}Q${n(x)} 0 ${n(x)} -1.2Z`;
  return cased(`<path d="${d}" fill="${PAPER}"/>`, 'heavy') +
    `<path d="M${n(x + 1.4)} ${n(-h * 0.7)}V${n(-h * 0.22)}M${n(-x - 1.4)} ${n(-h * 0.7)}V${n(-h * 0.22)}M${n(x)} ${n(-h * 0.14)}H${n(-x)}M${n(x)} ${n(-h * 0.08)}H${n(-x)}" ${sw('fine')}/>`;
}

/* ------------------------------------------------------------ lamp module */

/** Bezel around a set of lamp cells; `size` in mm, origin top-left. */
export function lampModuleFrame(size: [number, number]) {
  const [w, h] = size, i = 0.9;
  return cased(`<rect width="${n(w)}" height="${n(h)}" rx="1.2" fill="${PAPER}"/>`, 'heavy') +
    `<rect x="${i}" y="${i}" width="${n(w - 2 * i)}" height="${n(h - 2 * i)}" rx="0.6" fill="${PAPER}" ${sw('fine')}/>`;
}
