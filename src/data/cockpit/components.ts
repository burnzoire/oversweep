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
 * Warning paints (sRGB approximations of FED-STD-595 colours): insignia red
 * FS 11136 for guards, insignia yellow FS 33538 for hazard stripes and
 * caution caps. Only parts the guide shows painted get them.
 */
export const PAINTS = {
  red: 'var(--panel-red,#b3262a)',
  yellow: 'var(--panel-yellow,#f2b807)',
} as const;
/** A moving part drawn in a paint: its paper fills take the colour, ink lines stay black. */
export const painted = (paint: keyof typeof PAINTS | undefined, body: string) =>
  paint ? `<g style="--panel-paper:${PAINTS[paint]}">${body}</g>` : body;
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
  dzus: { r: 4.25, cut: 5.1 },
  /** Panel screw in a countersunk well. */
  screw: { r: 3.4 },
  'screw-medium': { r: 2.8 },
  'screw-small': { r: 2.1 },
  /** Socket head cap screw with a hexagon socket (EHSI bezel). */
  'screw-hex': { r: 3.0 },
  /** Small Phillips screw on a lower layer. */
  'screw-tiny': { r: 1.0 },
} as const;

export function fastener(kind: keyof typeof FASTENERS) {
  const r = FASTENERS[kind].r;
  if (kind === 'dzus') {
    const w = r * 0.16;
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.76)}" ${sw('fine')}/>` +
      `<path d="M${n(-w)} ${n(-r * 0.76)}V${n(r * 0.76)}M${n(w)} ${n(-r * 0.76)}V${n(r * 0.76)}" ${sw('medium')}/>`;
  }
  if (kind === 'screw-hex') {
    const h = r * 0.46, hex = Array.from({ length: 6 }, (_, k) => { const a = Math.PI / 3 * k; return `${n(h * Math.cos(a))} ${n(h * Math.sin(a))}`; });
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'medium') + `<circle r="${n(r * 0.8)}" ${sw('fine')}/>` +
      `<path d="M${hex.join('L')}Z" fill="${INK}" stroke="none"/>`;
  }
  if (kind === 'screw-tiny') {
    const c = r * 0.55;
    return `<circle r="${r}" fill="${PAPER}" ${sw('fine')}/>` + `<path d="M${n(-c)} 0H${n(c)}M0 ${n(-c)}V${n(c)}" ${sw('medium')}/>`;
  }
  const c = r * 0.42;
  return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'medium') + `<circle r="${n(r * 0.66)}" ${sw('fine')}/>` +
    `<path d="M${n(-c)} 0H${n(c)}M0 ${n(-c)}V${n(c)}" ${sw('heavy')}/>`;
}

/* --------------------------------------------------------------- toggles */

/**
 * Toggle switches seen square-on. `r` is the bushing bezel radius; the lever
 * leans toward the selected position and its projected length is `reach`.
 * Ball levers are one teardrop outline from the lever root to a ball about
 * 0.6 of the bezel radius; seen square-on with a real ~17-20° lean, the ball
 * sits about one bezel radius off centre.
 */
export const TOGGLES = {
  'toggle-large': { r: 5.2, reach: 5.6, ball: 3.2, cap: 'ball' },
  'toggle-medium': { r: 4.0, reach: 4.3, ball: 2.5, cap: 'ball' },
  'toggle-small': { r: 3.0, reach: 3.2, ball: 1.9, cap: 'ball' },
  /** Miniature toggle on a hex nut with a thin lever and a small ball tip (UHF backup TONE and SQUELCH). `r` is the nut's corner radius. */
  'toggle-mini-hex': { r: 3.4, reach: 3.4, ball: 1.25, cap: 'ball', hex: true },
  /**
   * Pull-to-unlock (lever-lock) switch, MAIN PWR. Proportions from the
   * Honeywell MICRO SWITCH TL-series mounting drawing (p. 45): 15/32 in
   * bushing, lever 26.7 mm above the bushing, cap 10.7 mm dia, 34° total
   * travel (17° each side). Scaled to this bushing, seen square-on the lever
   * projects only ~26.7·sin 17° and the cap stays almost face-on (cos 17°).
   * `ball` is the cap radius. Cap enlarged 50% (Nathan, 2026-11-17).
   */
  // `shift`: the whole lever translates this far (mm) toward the lean when it
  // actuates: the lever-lock mechanism carries it to the end of its slot, so in
  // the guide it looks pivoted off-centre (Nathan, 2026-11-17).
  'toggle-large-cylinder': { r: 5.2, reach: 6.4, ball: 5.18, cap: 'cylinder', lock: true, shift: 2.5 },
  /**
   * Medium bushing with a flat lever widening (trapezoid) to a square paddle
   * (AIR REFUEL). The guide image shows a lock-insert slot in the bushing, so
   * it is drawn as a lever-lock base. `ball` is half the paddle width.
   */
  'toggle-large-square': { r: 4.0, reach: 4.6, ball: 3.3, cap: 'square', lock: true },
  /** Large lever-lock: a shaft widening from a lock-insert bushing to a domed cap (IFF M-4 CODE / REPLY). Cap the same diameter as the flat-top's (Nathan); throw long enough that the shaft shows below the cap, a little shorter on two-position switches (`reach2`) (Nathan, 2026-11-17). Bushing the same size as the flat-top's (Nathan). */
  'toggle-large-lock': { r: 5.2, reach: 9.4, reach2: 8.8, ball: 5.18, cap: 'dome', lock: true },
  /**
   * One-off HOOK lever: a round bushing with an oblong slot and a flat
   * vertical paddle (rectangle, semicircle end toward the pivot) overhanging
   * well past the bushing toward the selected position (UP: over the HOOK
   * plate). `reach` is the paddle's far end from the pivot; `ball` is half its width.
   * Seen square-on, not with the guide image's low camera angle, so the
   * paddle starts at the pivot and reaches about 15.5 mm from it.
   */
  'toggle-hook': { r: 4.4, reach: 15.5, ball: 4.1, cap: 'hook' },
  /** Plain toggle with a wide flat paddle, with three round grip bosses along its end (gear panel LIGHTS). `ball` is half the paddle width. */
  'toggle-paddle-wide': { r: 4.0, reach: 4.6, ball: 10, cap: 'wide' },
} as const;

/** Lever lean for each position in travel order: -1 toward the first, 0 straight out, 1 toward the last. */
export function toggleLeans(count: number) {
  return count === 3 ? [-1, 0, 1] : count === 2 ? [-1, 1] : Array.from({ length: count }, (_, i) => -1 + (2 * i) / (count - 1));
}

export function toggleBase(art: keyof typeof TOGGLES) {
  const t = TOGGLES[art], r = t.r;
  if (t.cap === 'hook') {
    // Round bushing with the oblong slot the tongue travels in.
    const sl = r * 0.55, sw2 = r * 0.24;
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.78)}" ${sw('fine')}/>` +
      `<rect x="${n(-sw2)}" y="${n(-sl)}" width="${n(sw2 * 2)}" height="${n(sl * 2)}" rx="${n(sw2)}" ${sw('medium')}/>`;
  }
  if ('lock' in t && t.lock) {
    // Lever-lock: round bushing (no hex nut on the panel face) with the
    // locking insert showing: a slot the lever travels in, with a detent
    // notch at each latched position (top, centre, bottom).
    const ri = r * 0.6, sw2 = r * 0.2, sl = r * 0.48, nd = r * 0.12;
    const notches = [-sl * 0.85, 0, sl * 0.85].map(y => `M${n(-sw2)} ${n(y - nd)}H${n(-sw2 - nd)}V${n(y + nd)}H${n(-sw2)}M${n(sw2)} ${n(y - nd)}H${n(sw2 + nd)}V${n(y + nd)}H${n(sw2)}`).join('');
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.82)}" ${sw('fine')}/>` +
      cased(`<circle r="${n(ri)}" fill="${PAPER}"/>`, 'medium') +
      `<rect x="${n(-sw2)}" y="${n(-sl)}" width="${n(sw2 * 2)}" height="${n(sl * 2)}" ${sw('medium')}/><path d="${notches}" ${sw('fine')}/>`;
  }
  if ('hex' in t) {
    // Hex mounting nut (flats top and bottom) round the threaded bushing and its lever hole.
    const hx = Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * 2 * Math.PI; return `${n(r * Math.cos(a))} ${n(r * Math.sin(a))}`; });
    return cased(`<path d="M${hx.join('L')}Z" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.62)}" ${sw('fine')}/>` +
      `<circle r="${n(r * 0.34)}" ${sw('fine')}/>`;
  }
  // Plain toggle: the bushing is covered by a round water-resistant grommet
  // (orange-red in the jet), a raised ring with the lever rising from its centre.
  return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + cased(`<circle r="${n(r * 0.72)}" fill="${PAPER}"/>`, 'medium') +
    `<circle r="${n(r * 0.6)}" ${sw('fine')}/><circle r="${n(r * 0.44)}" ${sw('fine')}/>`;
}

/**
 * The moving lever at lean `k` (-1..1) along +y (vertical travel, down = +1).
 * Horizontal travel is the same drawing rotated by the renderer.
 */
/** How far a lever-lock's shaft base moves toward the lean (mm): the lift-and-shift into its detent. */
const LOCK_SHIFT = 0.7;

export function toggleLever(art: keyof typeof TOGGLES, k: number, count = 0) {
  const t = TOGGLES[art], lever = leverOnPivot(art, k, count);
  // A lever-lock with `shift` translates as a whole toward the lean when it actuates.
  return 'shift' in t && t.shift && Math.abs(k) > 1e-6 ? `<g transform="translate(0 ${n(Math.sign(k) * t.shift)})">${lever}</g>` : lever;
}

/** Lever length (mm) for a switch with `count` positions: `reach2` for two-position switches where given. */
export function toggleReach(art: keyof typeof TOGGLES, count = 0) {
  const t = TOGGLES[art];
  return count === 2 && 'reach2' in t ? t.reach2 : t.reach;
}

function leverOnPivot(art: keyof typeof TOGGLES, k: number, count = 0) {
  const t = TOGGLES[art], { r, ball, cap } = t, reach = toggleReach(art, count);
  const L = reach * k;
  const w0 = cap === 'cylinder' ? ball * 0.58 : cap === 'dome' ? ball * 0.36 : 'hex' in t ? r * 0.17 : r * 0.3, w1 = cap === 'dome' ? ball * 0.8 : ball * 0.62;
  // Mushroom cap: the lever leans only ~17° from the panel normal, so the cap stays almost square to the
  // viewer (a near-circle). Its top is nearly flat, so no inner ring.
  const face = (ry: number) => cased(`<ellipse cy="${n(L)}" rx="${ball}" ry="${n(ry)}" fill="${PAPER}"/>`, 'medium');
  if (cap === 'hook') {
    // Traced from the guide image: a flat vertical paddle, a rectangle with a
    // semicircular end at the pivot and a square-cornered far end overhanging
    // well above the bushing. The paddle always points up; moving to DN it
    // does not flip, it slides down by the lever's square-on throw.
    const dy = k > 0 ? r * 1.6 : 0, c = r * 0.1 + ball;
    const paddle = `<path d="M${n(-ball)} ${n(dy - reach)}H${n(ball)}V${n(dy - c)}A${ball} ${ball} 0 0 1 ${n(-ball)} ${n(dy - c)}Z" fill="${PAPER}"/>`;
    return cased(paddle, 'medium');
  }
  if (cap === 'wide') {
    // Wide paddle end (seen almost end-on at the real lean): a long pill with three round grip bosses.
    const hh = 3.6, x = ball;
    const pill = cased(`<rect x="${n(-x)}" y="${n(L - hh)}" width="${n(2 * x)}" height="${n(2 * hh)}" rx="${n(hh)}" fill="${PAPER}"/>`, 'medium') +
      [-2 * x / 3, 0, 2 * x / 3].map(cx => `<circle cx="${n(cx)}" cy="${n(L)}" r="${n(hh * 0.7)}" ${sw('fine')}/>`).join('');
    if (Math.abs(k) < 1e-6) return pill;
    const y1 = L - Math.sign(k) * hh;
    return `<path d="M${n(-r * 0.3)} 0L${n(-x * 0.8)} ${n(y1)}H${n(x * 0.8)}L${n(r * 0.3)} 0Z" fill="${PAPER}" ${sw('medium')}/>` + pill;
  }
  const tip = cap === 'cylinder'
    ? face(Math.abs(k) < 1e-6 ? ball : ball * 0.96)
    : cap === 'square'
    // Square paddle end, nearly face-on at the real lean.
    ? cased(`<rect x="${n(-ball)}" y="${n(L - ball * 0.92)}" width="${n(ball * 2)}" height="${n(ball * 1.84)}" rx="${n(ball * 0.12)}" fill="${PAPER}"/>`, 'medium')
    : cap === 'dome' && Math.abs(k) > 1e-6
    // Domed cap (Nathan 2026-11-17): a sphere with depth, i.e. drawn out along the
    // lever axis. Leaning 17°, square-on it is two round ends of the cap radius,
    // 0.41 of the radius apart (a short stadium), with the far end's near edge
    // showing just inside the near end: "(( )" with the pivot on the left.
    ? (() => {
      const sg = Math.sign(k), d = Math.abs(L), b = ball, e = ball * 0.41, Y = (y: number) => n(sg * y);
      const sw0 = sg > 0 ? 0 : 1;
      return cased(`<path d="M${n(-b)} ${Y(d)}A${b} ${b} 0 0 ${sw0} ${n(b)} ${Y(d)}V${Y(d - e)}A${b} ${b} 0 0 ${sw0} ${n(-b)} ${Y(d - e)}Z" fill="${PAPER}"/>`, 'medium') +
        `<path d="M${n(-b)} ${Y(d)}A${b} ${b} 0 0 ${1 - sw0} ${n(b)} ${Y(d)}" ${sw('fine')}/>`;
    })()
    : cased(`<circle cy="${n(L)}" r="${ball}" fill="${PAPER}"/>`, 'medium');
  if (Math.abs(k) < 1e-6) return tip;
  const s = Math.sign(k);
  // The base of the shaft is a circle centred on the pivot (the bushing
  // centre); the lever's rounded root is that circle. A lever-lock's lever is
  // lifted and shifted into the detent notch at the end of its slot, so its
  // base sits a little toward the lean.
  const lock = 'lock' in t && t.lock;
  const y0 = lock ? s * LOCK_SHIFT : 0;
  const arc = `A${n(w0)} ${n(w0)} 0 0 ${s > 0 ? 1 : 0}`;
  if (cap === 'square') {
    // Flat lever widening from the root to the paddle: a trapezoid under the face.
    const y1 = L - s * ball * 0.6;
    return `<path d="M${n(-w0)} ${n(y0)}${arc} ${n(w0)} ${n(y0)}L${n(ball * 0.9)} ${n(y1)}H${n(-ball * 0.9)}Z" fill="${PAPER}" ${sw('medium')}/>` + tip;
  }
  if (cap === 'ball') {
    // Teardrop: one outline from the round lever root, along the common
    // tangents, around the ball. Lever along +y, mirrored for an upward lean.
    const rc = y0 * s, d = Math.abs(L), r0 = w0, r1 = ball, a = Math.asin(Math.min(0.95, (r1 - r0) / (d - rc)));
    const ca = Math.cos(a), sa = Math.sin(a), Y = (y: number) => n(s * y);
    const p0r = [r0 * ca, rc - r0 * sa], p0l = [-r0 * ca, rc - r0 * sa];
    const p1r = [r1 * ca, d - r1 * sa], p1l = [-r1 * ca, d - r1 * sa];
    const sweep = s > 0 ? 1 : 0;
    const drop = `<path d="M${n(p0r[0])} ${Y(p0r[1])}L${n(p1r[0])} ${Y(p1r[1])}A${r1} ${r1} 0 1 ${sweep} ${n(p1l[0])} ${Y(p1l[1])}` +
      `L${n(p0l[0])} ${Y(p0l[1])}A${n(r0)} ${n(r0)} 0 0 ${sweep} ${n(p0r[0])} ${Y(p0r[1])}Z" fill="${PAPER}"/>`;
    // Top of the bulbous tip: the ball's own outline on the lever side, left
    // unjoined from the teardrop so the ball reads as a smooth dome.
    const rt = r1 * 0.97, e = 0.85, tx = rt * Math.sin(e), ty = d - rt * Math.cos(e);
    const top = `<path d="M${n(-tx)} ${Y(ty)}A${n(rt)} ${n(rt)} 0 0 ${s > 0 ? 1 : 0} ${n(tx)} ${Y(ty)}" fill="none" ${sw('fine')}/>`;
    return cased(drop, 'medium') + top;
  }
  // Shaft: round root at the bushing, straight flanks widening out to the cap
  // (cylinder: flat mushroom cap; dome: rounded cap a little wider than the shaft).
  const shaft = `<path d="M${n(-w0)} ${n(y0)}${arc} ${n(w0)} ${n(y0)}L${n(w1)} ${n(L)}H${n(-w1)}Z" fill="${PAPER}" ${sw('medium')}/>`;
  return shaft + tip;
}

/* --------------------------------------------------------------- rotaries */

export const ROTARIES = {
  /** Pointer selector on a round skirt; the grip has a wide waist, pinches to a point at the index and to a narrow tail at the back (ENG FEED, AUDIO 1 COMM mode knobs). */
  'rotary-pointer': { skirt: 10.2, bar: 9.6, barBack: 3.4, barFront: 0, waist: 5.8 },
  /** Larger bar-pointer selector (AIR COND TEMP and AIR SOURCE). */
  'rotary-pointer-large': { skirt: 13, bar: 12.2, barBack: 6.1, barFront: 4.3 },
  /** Mid-size selector, 11.6 mm skirt, with a broad block grip that chamfers to a pointed front (AVIONICS POWER INS and MIDS LVT). */
  'rotary-pointer-medium': { skirt: 11.6, bar: 10.9, barBack: 6.2, barFront: 2.8, block: true },
  /**
   * F-16C IFF MASTER (guide p. 67, 3.3 px/mm): a broad bar grip over a round skirt, flat at the back, its front end
   * rounded to the full width; `bar` is the front end's reach, `barBack` the back end's, `half` the half width.
   */
  'rotary-bar-broad': { skirt: 9.4, bar: 10.0, barBack: 12.4, barFront: 0, half: 5.8 },
} as const;

/**
 * Knobs that turn as a whole, with no fixed skirt: the body is the moving part.
 * `r` is the body radius (mm); `lobes` > 0 scallops the rim (knurled grip);
 * `ridge` is the raised bar across the face as [half-length, half-width] in
 * fractions of `r`; the white index line runs from the centre out along the
 * bar to the pointing end.
 */
export const KNOBS = {
  /** Small round knob with very fine grip lines round the rim and no index (ECM DIM). */
  'knob-fine-knurl-small': { r: 4.8, lobes: 32, ridge: [0, 0], fine: true },
  /** Small knurled selector (EXT LIGHTING ANTI-COLL). */
  'knob-knurled-small': { r: 7.9, lobes: 12, ridge: [0.82, 0.16] },
  /** Knurled dimmer (EXT LIGHTING FORM). */
  'knob-knurled': { r: 9.4, lobes: 12, ridge: [0.82, 0.13] },
  /** Knurled dimmer whose white index runs square-ended right out to the rim (Interior LIGHTING). */
  'knob-knurled-edge': { r: 9.4, lobes: 12, ridge: [0.94, 0.13], edge: true },
  /** As knob-knurled-edge, with the index carried on across a fixed collar to its rim (`reach`, mm; FLOOD CONSOLES). */
  'knob-knurled-skirt': { r: 9.4, lobes: 12, ridge: [0.94, 0.13], edge: true, reach: 12.26 },
  /** Plain round knob with a wide raised bar (EXT LIGHTING MASTER). */
  'knob-bar': { r: 10, lobes: 0, ridge: [0.96, 0.22], bar: true },
  /** Round base under a three-armed grip with deep hollows between the arms, index bar along one arm (EXT LIGHTING AERIAL REFUELING). */
  'knob-lobed': { r: 10.4, lobes: 0, ridge: [0.7, 0.13], grip: 3 },
  /** Round knob crossed by a broad raised grip band that runs rim to rim (EXT LIGHTING MASTER). */
  'knob-bar-thick': { r: 10, lobes: 0, ridge: [1, 0.4], band: true },
  /** Round knob with a wide raised bar, smaller than knob-bar (UHF backup CHAN and frequency knobs). */
  'knob-bar-medium': { r: 7.2, lobes: 0, ridge: [0.96, 0.22], bar: true },
  /** Round knob crossed by a spindle grip, thickest at the centre and tapering to rounded ends; no index line (UHF backup CHAN). */
  'knob-spindle': { r: 10, lobes: 0, ridge: [0.95, 0.3], spindle: true },
  /** Very small knurled knob (UHF backup VOL). */
  'knob-knurled-mini': { r: 4.8, lobes: 12, ridge: [0.8, 0.16] },
  /** Large knurled volume knob (AUDIO 1 COMM 1 and COMM 2); tapers to a smaller scalloped top face with channels down the recesses; index runs out to the rim. */
  'knob-knurled-large': { r: 11.2, lobes: 8, ridge: [0.94, 0.1], edge: true, taper: 0.84 },
  /** Small knurled knob whose index runs square-ended out to the rim (AUDIO 1 SECURE VOICE and TF). */
  'knob-knurled-small-edge': { r: 7.9, lobes: 8, ridge: [0.94, 0.16], edge: true, taper: 0.84 },
  /** Round knob crossed by a straight raised grip band along the index axis; index from the centre to the rim (AUDIO 1 MSL). */
  'knob-round': { r: 10, lobes: 0, ridge: [0.98, 0.1], edge: true, fin: 0.3 },
  /** Smaller knob-round, same grip (AUDIO 1 THREAT, AUDIO 2 ILS). */
  'knob-round-small': { r: 7.4, lobes: 0, ridge: [0.98, 0.1], edge: true, fin: 0.3 },
  /** Cross knob on a round base: four straight arms ending on the base circle, the base filling the gaps, index along one arm (AUDIO 2 INTERCOM). */
  'knob-cross': { r: 11, lobes: 0, ridge: [0.98, 0.1], cross: 0.42 },
  /** Small four-lobed cross knob (AUDIO 2 TACAN). */
  'knob-cross-small': { r: 7.9, lobes: 0, ridge: [0.98, 0.13], cross: 0.42 },
  /**
   * Large radio selector (UHF backup function and mode knobs): a broad skirt
   * with a raised centre boss, a flat lever running from the boss to the rim
   * opposite the pointer, and a white index bar set into the rim at the
   * pointing end. The whole knob turns.
   */
  'knob-radio-large': { r: 12.4, lobes: 0, ridge: [0, 0], lever: true },
  /** Plain round knob with a domed top and no index (F-16C EHSI HDG and CRS: they turn without end). */
  'knob-plain': { r: 7.7, lobes: 0, ridge: [0, 0], plain: true },
  /** Smaller plain domed knob (F-16C altimeter barometric setting knob). */
  'knob-plain-small': { r: 6.8, lobes: 0, ridge: [0, 0], plain: true },
  /**
   * Round domed knob with a rectangular tail grip running back past the rim, opposite the index (F-16C FUEL QTY SEL;
   * guide p. 54: body about 41 px radius at 3.66 px/mm, tail about 23 px wide reaching about 57 px behind the centre, drawn shorter and wider square-on: half-width 0.38 r, reach 1.15 r, Nathan 2026-11-20).
   * The tail has no front edge, so it rises smoothly out of the dome; the index runs from the centre to the front rim.
   */
  'knob-round-tail': { r: 11.2, lobes: 0, ridge: [0, 0], tail: [0.38, 1.15] },
  /** Plain round domed knob with a white index line from the centre to the rim (F-16C YAW TRIM; guide p. 72, about 29 px radius at 3.15 px/mm). */
  'knob-plain-index': { r: 9.2, lobes: 0, ridge: [0, 0], plain: true, index: true },
  /** F-16C IFF C & I: a plain round knob with an index line from the centre to the rim (guide p. 67, 33 px radius at 3.3 px/mm). */
  'knob-plain-index-large': { r: 10.0, lobes: 0, ridge: [0, 0], plain: true, index: true },
} as const;

/** A KNOBS body pointing at 12 o'clock; the renderer turns it to the detent. */
export function knobArt(art: keyof typeof KNOBS) {
  const { r, lobes, ridge } = KNOBS[art];
  if ('lever' in KNOBS[art]) {
    // Traced from the guide's p. 262 UHF mode knob (proportions of r).
    const k = (v: number) => n(v * r);
    const lever = `M${k(-0.19)} ${k(-0.21)}L${k(-0.27)} ${k(0.08)}V${k(0.9)}Q0 ${k(1.03)} ${k(0.27)} ${k(0.9)}V${k(0.08)}L${k(0.19)} ${k(-0.21)}Q0 ${k(-0.28)} ${k(-0.19)} ${k(-0.21)}Z`;
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') +
      `<circle r="${k(0.69)}" ${sw('fine')}/>` +
      `<path d="${lever}" fill="${PAPER}" ${sw('medium')}/>` +
      // Indicator: only the white index set into the rim (nothing at the centre).
      `<rect x="${k(-0.075)}" y="${k(-1.04)}" width="${k(0.15)}" height="${k(0.33)}" rx="${k(0.02)}" fill="${PAPER}" ${sw('heavy')}/>`;
  }
  if ('tail' in KNOBS[art]) {
    // Tail half-width and reach (fractions of r); filled closed but outlined open at the front so it blends into the dome.
    const [hw, reach] = (KNOBS[art] as { tail: readonly [number, number] }).tail, w = n(hw * r), y0 = n(0.12 * r), y1 = n(reach * r);
    const back = `V${n(reach * r - 0.08 * r)}Q${w} ${y1} ${n(hw * r - 0.08 * r)} ${y1}H${n(-hw * r + 0.08 * r)}Q${-w} ${y1} ${-w} ${n(reach * r - 0.08 * r)}V${y0}`;
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.78)}" ${sw('fine')}/>` +
      `<path d="M${w} ${y0}${back}Z" fill="${PAPER}" stroke="none"/>` + cased(`<path d="M${w} ${y0}${back}" fill="none"/>`, 'heavy') +
      `<path d="M0 0V${n(-r * 0.92)}" stroke-width="0.9" stroke-linecap="round"/>`;
  }
  if ('plain' in KNOBS[art]) return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.78)}" ${sw('fine')}/>` +
    ('index' in KNOBS[art] ? `<path d="M0 0V${n(-r * 0.92)}" stroke-width="0.9" stroke-linecap="round"/>` : '');
  let rim: string;
  if (!lobes) rim = `<circle r="${r}" fill="${PAPER}"/>`;
  else {
    // Scalloped rim: a bump per lobe (shallow for knurling, deep for broad lobes).
    const depth = 'fine' in KNOBS[art] ? 0.035 : lobes > 6 ? 0.06 : 0.26, N = lobes * 16, pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * 2 * Math.PI, rr = r * (1 - depth / 2 + (depth / 2) * Math.cos(lobes * a));
      pts.push(`${n(rr * Math.sin(a))} ${n(-rr * Math.cos(a))}`);
    }
    rim = `<path d="M${pts.join('L')}Z" fill="${PAPER}"/>`;
  }
  const [hl, hw] = ridge.map(f => f * r);
  const t = KNOBS[art];
  if ('spindle' in t) {
    // Spindle grip: half-width hw at the centre, narrowing to round ends; the grip itself is the pointer.
    const we = hw * 0.45, yt = hl - we, cx = 2 * hw - we;
    const grip = `M${n(-we)} ${n(-yt)}A${n(we)} ${n(we)} 0 0 1 ${n(we)} ${n(-yt)}Q${n(cx)} 0 ${n(we)} ${n(yt)}` +
      `A${n(we)} ${n(we)} 0 0 1 ${n(-we)} ${n(yt)}Q${n(-cx)} 0 ${n(-we)} ${n(-yt)}Z`;
    return cased(rim, 'heavy') + `<path d="${grip}" fill="${PAPER}" ${sw('medium')}/>`;
  }
  if ('band' in t) {
    // Grip band clipped by the rim; the index runs from the rim to the centre.
    const yc = n(Math.sqrt(r * r - hw * hw));
    const band = `M${n(-hw)} -${yc}V${yc}A${r} ${r} 0 0 0 ${n(hw)} ${yc}V-${yc}A${r} ${r} 0 0 0 ${n(-hw)} -${yc}Z`;
    return cased(rim, 'heavy') + `<path d="${band}" fill="${PAPER}" ${sw('medium')}/>` +
      `<rect x="${n(-hw * 0.3)}" y="${n(-r * 0.85)}" width="${n(hw * 0.6)}" height="${n(r * 0.85)}" fill="${PAPER}" ${sw('medium')}/>`;
  }
  if ('grip' in t) {
    // Three-armed grip: rounded arm ends near the rim, deep hollows between them.
    const N = 144, pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      // Each arm is a round-ended spoke (capsule) from the centre; find where this ray leaves their union.
      const a = (i / N) * 2 * Math.PI, L = 0.64 * r, w = 0.33 * r;
      const inside = (d: number) => Array.from({ length: t.grip }, (_, k) => (k / t.grip) * 2 * Math.PI).some(b => {
        const x = d * Math.sin(a - b), y = d * Math.cos(a - b), py = Math.max(0, Math.min(L, y));
        return Math.hypot(x, y - py) <= w;
      });
      let lo = 0, hi: number = r;
      for (let j = 0; j < 30; j++) { const m = (lo + hi) / 2; if (inside(m)) lo = m; else hi = m; }
      const rr = lo;
      pts.push(`${n(rr * Math.sin(a))} ${n(-rr * Math.cos(a))}`);
    }
    return cased(rim, 'heavy') + `<circle r="${n(r * 0.9)}" ${sw('fine')}/>` +
      cased(`<path d="M${pts.join("L")}Z" fill="${PAPER}"/>`, "heavy") + armIndex(0.64 * r, 0.33 * r, hw);
  }
  // Bar knobs: the raised bar is the grip and runs across the centre. Other
  // knobs: the white indicator bar starts at the centre and runs out to the
  // pointing end.
  if ('bar' in t) return cased(rim, 'heavy') +
    `<rect x="${n(-hw)}" y="${n(-hl)}" width="${n(2 * hw)}" height="${n(2 * hl)}" rx="${n(hw * 0.6)}" fill="${PAPER}" ${sw('medium')}/>` +
    `<path d="M0 ${n(-hl + hw)}V0" ${sw('heavy')}/>`;
  if ('reach' in t) {
    // Index carried across the collar: the strip from the knob rim to the collar rim, under the knob.
    const out = `<rect x="${n(-hw)}" y="${n(-t.reach)}" width="${n(2 * hw)}" height="${n(t.reach - r * 0.9)}" fill="${PAPER}" ${sw('medium')}/>` +
      `<path d="M0 ${n(-t.reach)}V${n(-r * 0.9)}" ${sw('heavy')}/>`;
    return out + cased(rim, 'heavy') +
      `<rect x="${n(-hw)}" y="${n(-hl)}" width="${n(2 * hw)}" height="${n(hl)}" fill="${PAPER}" ${sw('medium')}/>` +
      `<path d="M0 ${n(-hl)}V0" ${sw('heavy')}/>`;
  }
  if ('cross' in t) {
    // Cross cut from a round base: two straight arms (half-width cross x r) whose ends are the base circle, small fillets where they meet.
    const w = t.cross * r, f = w * 0.55, N = 288, pts: string[] = [];
    const sdf = (x: number, y: number) => {
      const d0 = Math.abs(x) - w, d1 = Math.abs(y) - w, h = Math.max(f - Math.abs(d0 - d1), 0) / f;
      return Math.max(Math.min(d0, d1) - (h * h * f) / 4, Math.hypot(x, y) - r);
    };
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * 2 * Math.PI;
      let lo = 0, hi = r * 1.2;
      for (let j = 0; j < 32; j++) { const m = (lo + hi) / 2; if (sdf(m * Math.sin(a), -m * Math.cos(a)) <= 0) lo = m; else hi = m; }
      pts.push(`${n(lo * Math.sin(a))} ${n(-lo * Math.cos(a))}`);
    }
    // The round base fills the gaps between the arms.
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<path d="M${pts.join('L')}Z" fill="${PAPER}" ${sw('medium')}/>` +
      `<rect x="${n(-hw)}" y="${n(-hl)}" width="${n(2 * hw)}" height="${n(hl)}" fill="${PAPER}" ${sw('medium')}/>` +
      `<path d="M0 ${n(-hl)}V0" ${sw('heavy')}/>`;
  }
  if ('fin' in t) {
    // Straight grip band across the knob along the index axis, rim to rim (half-width fin x r).
    const w = t.fin * r, yc = n(Math.sqrt(r * r - w * w));
    const grip = `M${n(-w)} -${yc}V${yc}A${r} ${r} 0 0 0 ${n(w)} ${yc}V-${yc}A${r} ${r} 0 0 0 ${n(-w)} -${yc}Z`;
    return cased(rim, 'heavy') + `<path d="${grip}" fill="${PAPER}" ${sw('medium')}/>` +
      `<rect x="${n(-hw)}" y="${n(-hl)}" width="${n(2 * hw)}" height="${n(hl)}" fill="${PAPER}" ${sw('medium')}/>` +
      `<path d="M0 ${n(-hl)}V0" ${sw('heavy')}/>`;
  }
  if ('taper' in t && lobes) {
    // Tapered knurled knob: a round base and a smaller top face (taper x r), each with a deliberate round
    // scallop cut at every recess, and a channel from each top-face scallop down to the base scallop below it.
    const s = t.taper, nr = 0.4 * r * Math.sin(Math.PI / lobes);
    const scallops = (R: number, q: number) => {
      const N = lobes * 24, pts: string[] = [];
      for (let i = 0; i <= N; i++) {
        const a = (i / N) * 2 * Math.PI, k = Math.round((a * lobes) / (2 * Math.PI) - 0.5), b = ((2 * k + 1) * Math.PI) / lobes;
        // Ray from the centre: the rim at R, or the near side of the scallop circle (radius q, centred just outside the rim at b).
        const Rc = R + 0.3 * q, cx = Rc * Math.sin(b), cy = -Rc * Math.cos(b), ux = Math.sin(a), uy = -Math.cos(a);
        const p = ux * cx + uy * cy, disc = p * p - (Rc * Rc - q * q);
        const rr = disc > 0 && p - Math.sqrt(disc) < R ? p - Math.sqrt(disc) : R;
        pts.push(`${n(rr * ux)} ${n(rr * uy)}`);
      }
      return `M${pts.join('L')}Z`;
    };
    // Channels join each top-face scallop's two corners to the matching corners of the base scallop.
    const Rc = r + 0.3 * nr, phi = Math.acos((r * r + Rc * Rc - nr * nr) / (2 * r * Rc));
    const ch = Array.from({ length: lobes }, (_, k) => [-phi, phi].map(d => {
      const a = ((2 * k + 1) * Math.PI) / lobes + d, r0 = s * r;
      return `M${n(r0 * Math.sin(a))} ${n(-r0 * Math.cos(a))}L${n(r * Math.sin(a))} ${n(-r * Math.cos(a))}`;
    }).join('')).join('');
    const top = scallops(s * r, nr * s);
    rim = `<path d="${scallops(r, nr)}" fill="${PAPER}"/>`;
    // A plain round base under the knob shows in the base scallops. Inner lines (top face, channels) are light so the outline and index lead.
    return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + rim.replace(/\/>$/, ` ${sw('medium')}/>`) + `<path d="${ch}" ${sw('fine')} stroke-opacity="0.45"/>` + `<path d="${top}" fill="${PAPER}" ${sw('fine')} stroke-opacity="0.45"/>` +
      `<rect x="${n(-hw)}" y="${n(-hl)}" width="${n(2 * hw)}" height="${n(hl)}" fill="${PAPER}" ${sw('medium')}/>` +
      `<path d="M0 ${n(-hl)}V0" ${sw('heavy')}/>`;
  }
  if ('edge' in t) return cased(rim, 'heavy') +
    `<rect x="${n(-hw)}" y="${n(-hl)}" width="${n(2 * hw)}" height="${n(hl)}" fill="${PAPER}" ${sw('medium')}/>` +
    `<path d="M0 ${n(-hl)}V0" ${sw('heavy')}/>`;
  return cased(rim, 'heavy') + (hl ? indicator(hl, hw) : '');
}

/**
 * A grip arm's white index bar: from the centre out to the arm's round end
 * (arm length `L`, half-width `w`), flush with the edge, with no cap of its own.
 */
function armIndex(L: number, w: number, hw: number) {
  const yc = L + Math.sqrt(w * w - hw * hw);
  return `<path d="M${n(-hw)} 0V${n(-yc)}A${n(w)} ${n(w)} 0 0 1 ${n(hw)} ${n(-yc)}V0Z" fill="${PAPER}" ${sw('medium')}/>` +
    `<path d="M0 ${n(-L - w)}V0" ${sw('heavy')}/>`;
}

/** A knob's white indicator bar from the centre out to `hl`, with its index line. */
function indicator(hl: number, hw: number) {
  return `<rect x="${n(-hw)}" y="${n(-hl)}" width="${n(2 * hw)}" height="${n(hl + hw)}" rx="${n(hw * 0.6)}" fill="${PAPER}" ${sw('medium')}/>` +
    `<path d="M0 ${n(-hl + hw)}V0" ${sw('heavy')}/>`;
}

export function rotaryBase(art: keyof typeof ROTARIES) {
  const { skirt } = ROTARIES[art];
  return cased(`<circle r="${skirt}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(skirt * 0.9)}" ${sw('fine')}/>`;
}

/** The knob drawn pointing at 12 o'clock; the renderer rotates it to the detent. */
export function rotaryKnob(art: keyof typeof ROTARIES) {
  const { bar, barBack, barFront } = ROTARIES[art];
  if ('block' in ROTARIES[art]) {
    // Block grip traced from the guide's p. 78 INS knob (fractions of the skirt):
    // pointed front, chamfered shoulders, parallel sides, square back with rounded corners.
    const R = ROTARIES[art].skirt, k = (v: number) => n(v * R);
    // Long sides parallel, square to the back edge (Nathan, 2026-11-17).
    const body = `M${k(-0.07)} ${k(-0.93)}Q0 ${k(-0.97)} ${k(0.07)} ${k(-0.93)}L${k(0.5)} ${k(-0.42)}V${k(0.84)}` +
      `Q${k(0.5)} ${k(0.96)} ${k(0.38)} ${k(0.96)}H${k(-0.38)}Q${k(-0.5)} ${k(0.96)} ${k(-0.5)} ${k(0.84)}V${k(-0.42)}Z`;
    return cased(`<path d="${body}" fill="${PAPER}"/>`, 'heavy') + `<path d="M0 ${k(-0.8)}V0" ${sw('heavy')}/>`;
  }
  if ('half' in ROTARIES[art]) {
    const H = (ROTARIES[art] as { half: number }).half, f = bar - H;
    const body = `M${n(-H)} ${n(barBack)}V${n(-f)}A${n(H)} ${n(H)} 0 0 1 ${n(H)} ${n(-f)}V${n(barBack)}Z`;
    return cased(`<path d="${body}" fill="${PAPER}"/>`, 'heavy') + `<path d="M0 0V${n(-bar + 1.2)}" stroke-width="0.9" stroke-linecap="round"/>`;
  }
  if ('waist' in ROTARIES[art]) {
    // Traced from the guide's p. 65 COMM mode knobs: point at the front, widest just behind the centre, narrow rounded tail.
    const W = (ROTARIES[art] as { waist: number }).waist, T = barBack, k = (v: number) => n(v);
    // A short straight point (about 1.4 mm each side), then curved out to the waist.
    const dx = 0.62, dy = 0.79, px = 1.4 * dx, py = -bar + 1.4 * dy;
    // Curved from the point to the waist; straight sides from the waist back to a wide, flat tail.
    const body = `M0 ${k(-bar)}L${k(px)} ${k(py)}C${k(px + 0.9 * dx)} ${k(py + 0.9 * dy)} ${k(W)} ${k(-bar * 0.3)} ${k(W)} ${k(bar * 0.2)}` +
      `L${k(T)} ${k(bar * 0.9)}Q${k(T)} ${k(bar)} ${k(T - 0.6)} ${k(bar)}H${k(-(T - 0.6))}Q${k(-T)} ${k(bar)} ${k(-T)} ${k(bar * 0.9)}` +
      `L${k(-W)} ${k(bar * 0.2)}C${k(-W)} ${k(-bar * 0.3)} ${k(-px - 0.9 * dx)} ${k(py + 0.9 * dy)} ${k(-px)} ${k(py)}Z`;
    return cased(`<path d="${body}" fill="${PAPER}"/>`, 'heavy') + `<path d="M0 ${n(-bar + 0.9)}V0" ${sw('heavy')}/>`;
  }
  const body = `M${-barFront} ${-bar}Q0 ${n(-bar - 1.2)} ${barFront} ${-bar}L${barBack} ${n(bar * 0.82)}Q0 ${n(bar * 1.08)} ${-barBack} ${n(bar * 0.82)}Z`;
  return cased(`<path d="${body}" fill="${PAPER}"/>`, 'heavy') +
    `<path d="M0 ${n(-bar + 0.9)}V0" ${sw('heavy')}/>`;
}

/* ------------------------------------------------------------ pushbuttons */

export const PUSHES = {
  /** Small round button (ECM RESET and BIT). */
  'push-round-small': { r: 3.4, cap: 2.5 },
  /** Medium round button (UHF backup TEST DISPLAY and STATUS). */
  'push-round-medium': { r: 4.1, cap: 3.2 },
  'push-round-large': { r: 6.6, cap: 4.5 },
  /** Large flat cap in a thin rim (F-16C TEST panel FIRE & OHEAT DETECT, MAL & IND LTS). */
  'push-round-flat': { r: 6.3, cap: 5.6 },
  /** Plain round cap with a printed legend (F-16C ICP WX). */
  'push-round-plain': { r: 5.5, cap: 4.9 },
  /** Wide flat cap with printed legend in a thin rim (F-16C ICP override and master mode buttons). */
  'push-round-wide': { r: 6.9, cap: 6.2 },
  /** Gear panel DN LOCK REL. */
  'push-round-xl': { r: 7.8, cap: 6.0 },
  /** Gear panel EMER STORES JETTISON: a large flat cap with a circle-and-square mark at its centre. */
  'push-round-xxl': { r: 14, cap: 10.5, mark: true },
  /** Large cap in a wide bezel (F-16C CHAFF/FLARE dispense button). */
  'push-round-bezel': { r: 17.7, cap: 13.4 },
} as const;

export function pushBase(art: keyof typeof PUSHES) {
  const { r } = PUSHES[art];
  return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.84)}" ${sw('fine')}/>`;
}

/** Cap out (`in` false) or pressed in (drawn smaller with a deeper shadow ring). */
export function pushCap(art: keyof typeof PUSHES, pressed: boolean) {
  const { cap } = PUSHES[art];
  const c = pressed ? cap * 0.9 : cap, t = PUSHES[art];
  // Centre mark (EMER STORES JETTISON): a square overlaid on a circle, sized from the guide image.
  const q = c * 0.3, m = 'mark' in t && t.mark
    ? `<circle r="${n(c * 0.35)}" ${sw('fine')}/><rect x="${n(-q)}" y="${n(-q)}" width="${n(2 * q)}" height="${n(2 * q)}" rx="${n(q * 0.12)}" ${sw('fine')}/>`
    : '';
  return cased(`<circle r="${n(c)}" fill="${PAPER}"/>`, 'medium') + (pressed ? `<circle r="${n(c * 0.8)}" ${sw('fine')}/>` : '') + m;
}

/** Square pushbutton housing, `size` in mm, centred on the origin. */
export function pushSquareBase([w, h]: [number, number]) {
  return cased(`<rect x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" rx="1.2" fill="${PAPER}"/>`, 'heavy');
}

/** Square pushbutton cap, inset in its housing; pressed, it sinks (smaller, with a shadow line). */
export function pushSquareCap([w, h]: [number, number], pressed: boolean) {
  const i = pressed ? 1.5 : 1.0, cw = w - 2 * i, ch = h - 2 * i;
  return cased(`<rect x="${n(-cw / 2)}" y="${n(-ch / 2)}" width="${n(cw)}" height="${n(ch)}" rx="0.8" fill="${PAPER}"/>`, 'medium') +
    (pressed ? `<rect x="${n(-cw / 2 + 0.6)}" y="${n(-ch / 2 + 0.6)}" width="${n(cw - 1.2)}" height="${n(ch - 1.2)}" rx="0.5" fill="none" ${sw('fine')}/>` : '');
}

/* ---------------------------------------------------------- gear handle */

/** Landing gear handle slot, `travel` mm long (UP to DN knob centres), centred on the origin. */
export function gearSlot(travel: number) {
  const h = travel / 2 + 2, w = 1.6;
  return cased(`<rect x="${n(-w)}" y="${n(-h)}" width="${n(2 * w)}" height="${n(2 * h)}" rx="${n(w)}" fill="${PAPER}"/>`, 'medium');
}

/**
 * The gear handle's wheel-shaped knob seen square-on: the tyre is edge-on, so it
 * shows as a tall rounded block with tread ribs across it. `size` in mm, centred on `y`.
 */
export function gearKnob([w, h]: [number, number], y: number, indicator?: string) {
  // A wheel seen on its tread: a barrel-shaped tyre with circumferential
  // grooves (vertical, bowed out like the tyre's curve).
  const t = y - h / 2, b = y + h / 2, sh = h * 0.07;
  const body = `M${n(-w / 2)} ${n(t + sh * 2)}Q${n(-w / 2)} ${n(t)} 0 ${n(t)}Q${n(w / 2)} ${n(t)} ${n(w / 2)} ${n(t + sh * 2)}V${n(b - sh * 2)}Q${n(w / 2)} ${n(b)} 0 ${n(b)}Q${n(-w / 2)} ${n(b)} ${n(-w / 2)} ${n(b - sh * 2)}Z`;
  // Only the lower shoulder shows a line; the top rolls over with no sheath.
  const shoulders = `M${n(-w / 2 + 0.4)} ${n(b - sh * 2)}Q0 ${n(b - sh * 0.6)} ${n(w / 2 - 0.4)} ${n(b - sh * 2)}`;
  const grooves = [-0.32, -0.16, 0, 0.16, 0.32].map(f => {
    const x = f * w, bow = f * w * 0.25;
    return `M${n(x)} ${n(t + sh * 2.2)}Q${n(x + bow)} ${n(y)} ${n(x)} ${n(b - sh * 2.2)}`;
  }).join('');
  // The whole tyre is the translucent red lens of the handle light.
  const lens = indicator ? `<g data-indicator="${indicator}"><path class="lens" d="${body}" stroke="none"/></g>` : '';
  return cased(`<path d="${body}" fill="${PAPER}"/>`, 'heavy') + lens +
    `<path d="${shoulders}" ${sw('medium')}/><path d="${grooves}" ${sw('fine')}/>`;
}

/* ------------------------------------------------------------ slot lever */

/**
 * Slot lever (F-16C DEFOG), from the DCS F-16C guide p. 74: a flat blade
 * standing out of a straight slot, its face turned inboard, with a mushroom
 * knob on that face (the disc's long axis runs fore and aft in the guide
 * image). Drawn straight down from above (Nathan, 2026-11-18): the vertical
 * blade shows only its top edge along the slot, and the knob reaches inboard
 * (down, over the placard) from it: a neck widening from the blade to the
 * disc, then the disc edge-on.
 * mm: slot height, blade width and thickness, neck widths (blade, disc) and
 * length, disc diameter and thickness.
 */
export const SLOT_LEVER = { slotH: 2.3, root: 10.8, blade: 2.2, neck: [4.5, 9, 7], disc: 16.5, thick: 4.2 } as const;

/** The slot, long enough for the lever root at both ends of `travel`, centred on the origin. */
export function leverSlot(travel: number) {
  const { slotH, root } = SLOT_LEVER, w = travel + root;
  return `<rect x="${n(-w / 2)}" y="${n(-slotH / 2)}" width="${n(w)}" height="${n(slotH)}" fill="${INK}" stroke="none"/>`;
}

/** The lever with its blade centred at `x` on the slot line. */
export function slotLeverArt(x: number) {
  const { root, blade, neck: [nw0, nw1, nl], disc, thick } = SLOT_LEVER;
  const y0 = blade / 2, y1 = y0 + nl;
  const stem = `M${n(x - nw0 / 2)} ${n(y0 - 0.3)}L${n(x - nw1 / 2)} ${n(y1 + thick * 0.3)}H${n(x + nw1 / 2)}L${n(x + nw0 / 2)} ${n(y0 - 0.3)}Z`;
  return cased(`<rect x="${n(x - root / 2)}" y="${n(-blade / 2)}" width="${n(root)}" height="${n(blade)}" rx="0.4" fill="${PAPER}"/>`) +
    cased(`<path d="${stem}" fill="${PAPER}"/>`) +
    cased(`<rect x="${n(x - disc / 2)}" y="${n(y1)}" width="${n(disc)}" height="${n(thick)}" rx="${n(thick / 2)}" fill="${PAPER}"/>`);
}

/* ----------------------------------------------------------------- guards */

/**
 * Flip guard, hinged along its bottom edge (the pivot), covering a toggle when
 * closed. `size` is the closed footprint. Open, it stands up toward the viewer
 * and is seen edge-on as a short band at the hinge.
 *
 * Traced from the FUEL MASTER and EPU guards in the DCS F-16C guide (pp. 64,
 * 67): one bent sheet of aluminium, its long sides folded down into flanges
 * (the fold lines), a small cut-out in each side about halfway up, two prongs
 * either side of the lever slot at the free end, and hinge plates fixed to the
 * panel at both hinge corners.
 */
export function guardArt(size: [number, number], open: boolean) {
  const [w, h] = size;
  const x = -w / 2;
  // Hinge plates: fixed to the panel at the hinge corners, half under the guard.
  const pw = w * 0.09, pl = h * 0.08;
  const plates = [x, -x].map(px => cased(`<rect x="${n(px - pw / 2)}" y="${n(-pl)}" width="${n(pw)}" height="${n(pl * 1.6)}" rx="0.3" fill="${PAPER}"/>`, 'medium')).join('');
  if (open) {
    const band = h * 0.2;
    return plates + cased(`<rect x="${n(x)}" y="${n(-band)}" width="${n(w)}" height="${n(band)}" rx="0.6" fill="${PAPER}"/>`, 'heavy') +
      `<path d="M${n(x + 1)} ${n(-band * 0.5)}H${n(-x - 1)}" ${sw('fine')}/>`;
  }
  // Closed: outline from the hinge's left corner round the left side (with its
  // cut-out), over the left prong, down into the lever slot and out again.
  const notch = w * 0.4, nd = h * 0.27, r = w * 0.15;
  const cd = w * 0.07, c0 = -h * 0.48, c1 = -h * 0.56;
  const side = (sx: number) => ({ ex: sx * -x, ix: sx * (-x - cd) });
  const L = side(-1), R = side(1);
  const d = `M${n(L.ex + 1.2)} 0Q${n(L.ex)} 0 ${n(L.ex)} -1.2V${n(c0)}H${n(L.ix)}V${n(c1)}H${n(L.ex)}` +
    `V${n(-h + r)}Q${n(L.ex)} ${n(-h)} ${n(L.ex + r)} ${n(-h)}H${n(-notch / 2 - r)}Q${n(-notch / 2)} ${n(-h)} ${n(-notch / 2)} ${n(-h + r)}` +
    `V${n(-h + nd - notch / 2)}A${n(notch / 2)} ${n(notch / 2)} 0 0 0 ${n(notch / 2)} ${n(-h + nd - notch / 2)}` +
    `V${n(-h + r)}Q${n(notch / 2)} ${n(-h)} ${n(notch / 2 + r)} ${n(-h)}H${n(R.ex - r)}Q${n(R.ex)} ${n(-h)} ${n(R.ex)} ${n(-h + r)}` +
    `V${n(c1)}H${n(R.ix)}V${n(c0)}H${n(R.ex)}V-1.2Q${n(R.ex)} 0 ${n(R.ex - 1.2)} 0Z`;
  // Fold lines of the side flanges, broken at the cut-outs; a line across near the hinge.
  const f = w * 0.13;
  const folds = `M${n(x + f)} ${n(-h * 0.06)}V${n(c0)}M${n(x + f)} ${n(c1)}V${n(-h + r)}` +
    `M${n(-x - f)} ${n(-h * 0.06)}V${n(c0)}M${n(-x - f)} ${n(c1)}V${n(-h + r)}M${n(x)} ${n(-h * 0.06)}H${n(-x)}`;
  return plates + cased(`<path d="${d}" fill="${PAPER}"/>`, 'heavy') + `<path d="${folds}" ${sw('fine')}/>`;
}

/* ------------------------------------------------------------ lamp module */

export const LAMPS = {
  /** Round indicator: bezel and lens (JFS RUN). */
  'lamp-round': { r: 5.8, lens: 4.4 },
} as const;

/** Round lamp bezel; the lens is drawn by the renderer as the lit element. */
export function lampRoundBezel(art: keyof typeof LAMPS) {
  const { r, lens } = LAMPS[art];
  return cased(`<circle r="${r}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n((r + lens) / 2)}" ${sw('fine')}/>`;
}

/** Bezel around a set of lamp cells; `size` in mm, origin top-left. */
export function lampModuleFrame(size: [number, number]) {
  const [w, h] = size, i = 0.9;
  return cased(`<rect width="${n(w)}" height="${n(h)}" rx="1.2" fill="${PAPER}"/>`, 'heavy') +
    `<rect x="${i}" y="${i}" width="${n(w - 2 * i)}" height="${n(h - 2 * i)}" rx="0.6" fill="${PAPER}" ${sw('fine')}/>`;
}

/* ----------------------------------------------------------------- gauges */

/**
 * The pointer shared by the F-16C engine instruments (OIL, NOZ POS, RPM,
 * FTIT): measured on the guide's p. 50 image, all four have the same
 * parallel shank 3.6 mm wide from under the hub, tapering over its last
 * 6.5 mm to a rounded tip 0.9 mm wide. Only the length differs per dial.
 * Drawn pointing at 12 o'clock from the dial centre; the renderer turns it.
 */
export const NEEDLE = { base: 3.6, taper: 6.5, tip: 0.9 } as const;

export function needleArt(length: number) {
  const { base, taper, tip } = NEEDLE, b = base / 2, t = tip / 2, y = -(length - t), s = -(length - taper);
  return `<path d="M${n(-b)} 0V${n(s)}L${n(-t)} ${n(y)}A${n(t)} ${n(t)} 0 0 1 ${n(t)} ${n(y)}L${n(b)} ${n(s)}V0Z" fill="${INK}" ${sw('fine')}/>`;
}

/**
 * Straight line pointer of the F-16C manual trim indicators, in mm: a thin
 * bar from the centre with a small square block at the tip. Measured on the
 * guide's p. 72 image (3.15 px/mm): bar about 2 px, block about 5 px square.
 * Drawn pointing at 12 o'clock from the dial centre.
 */
export const LINE_NEEDLE = { width: 0.6, block: 1.6 } as const;

export function lineNeedleArt(length: number) {
  const w = LINE_NEEDLE.width / 2, b = LINE_NEEDLE.block / 2;
  return `<path d="M${n(-w)} 0V${n(-length + 2 * b)}H${n(w)}V0Z" fill="${INK}" stroke="none"/>` +
    `<rect x="${n(-b)}" y="${n(-length)}" width="${n(2 * b)}" height="${n(2 * b)}" rx="0.3" fill="${INK}" ${sw('fine')}/>`;
}

/**
 * Wedge pointer of the F-16C HYD PRESS indicators, in mm: straight sides from
 * `base` wide at the dial centre (hidden under the hub) to `tip` wide at its
 * length. Measured on the guide's p. 61 image (2.94 px/mm): 5.8 mm wide where
 * it leaves the 6 mm hub, 0.5 mm at the tip. Drawn pointing at 12 o'clock.
 */
export const WEDGE_NEEDLE = { base: 9.0, tip: 0.5 } as const;

export function wedgeNeedleArt(length: number) {
  const b = WEDGE_NEEDLE.base / 2, t = WEDGE_NEEDLE.tip / 2;
  return `<path d="M${n(-b)} 0L${n(-t)} ${n(-length)}H${n(t)}L${n(b)} 0Z" fill="${INK}" ${sw('fine')}/>`;
}

/**
 * Stepped pointer of the F-16C EPU FUEL indicator, in mm, pointing at 12
 * o'clock from the dial centre: a broad parallel shank `base` wide out to
 * `shank`, closing over to a narrow parallel tip `tip` wide by `neck`, square
 * at the end. Measured on the guide's p. 61 EPU FUEL image (3.93 px/mm):
 * 13.3 px wide to 66 px, 6.2 px from 78 px to its end.
 */
export const STEP_NEEDLE = { base: 3.38, shank: 16.8, neck: 19.8, tip: 1.55 } as const;

export function stepNeedleArt(length: number) {
  const { base, shank, neck, tip } = STEP_NEEDLE, b = base / 2, t = tip / 2;
  return `<path d="M${n(-b)} 0V${n(-shank)}L${n(-t)} ${n(-neck)}V${n(-length)}H${n(t)}V${n(-neck)}L${n(b)} ${n(-shank)}V0Z" fill="${INK}" ${sw('fine')}/>`;
}

/**
 * Altimeter needle (F-16C), in mm, pointing at 12 o'clock from the dial
 * centre: a thin shaft out to `shaft`, a broad blade widening to `width`
 * by `full`, parallel-sided to `taper`, closing to a point at the tip.
 * Measured on the guide's p. 51 image turned upright.
 */
export const BLADE_NEEDLE = { stem: 0.5, shaft: 13.9, full: 17.0, width: 2.8, taper: 27.2 } as const;

export function bladeNeedleArt(length: number) {
  const { stem, shaft, full, width, taper } = BLADE_NEEDLE, s = stem / 2, w = width / 2;
  return `<path d="M${n(-s)} 0V${n(-shaft)}L${n(-w)} ${n(-full)}V${n(-taper)}L0 ${n(-length)}L${n(w)} ${n(-taper)}V${n(-full)}L${n(s)} ${n(-shaft)}V0Z" fill="${INK}" ${sw('fine')}/>`;
}

/**
 * Broad tank pointer of the F-16C fuel quantity indicator (AL and FR share
 * it), in mm, pointing at 12 o'clock from the dial centre. Measured on the
 * guide's p. 58 image (2.7 px/mm) with each pointer turned upright: a parallel
 * shaft 4.4 mm wide to 26.7 mm, tapering to a point at 31.9 mm; a paddle on
 * its anticlockwise side out to 16.5 mm, whose outer edge leans in toward the
 * hub. The two tank letters are printed upright along the shaft, outer letter
 * first, with a bar between them.
 */
export const PADDLE_POINTER = { half: 2.22, taper: 26.67, tip: 31.85, paddleTop: 16.48, paddleLeft: 6.0, paddleRoot: 2.85, outer: 24.8, inner: 19.7, bar: 22.0, cap: 3.5 } as const;

export function paddlePointerArt([outer, inner]: [string, string]) {
  const p = PADDLE_POINTER, h = p.half;
  const letter = (y: number, t: string) => text(0, -y, t, p.cap).replace(`fill="${INK}"`, `fill="${PAPER}"`);
  return `<path d="M${n(h)} 0V${n(-p.taper)}L0 ${n(-p.tip)}L${n(-h)} ${n(-p.taper)}V${n(-p.paddleTop)}H${n(-p.paddleLeft)}L${n(-p.paddleRoot)} 0Z" fill="${INK}" ${sw('fine')}/>` +
    letter(p.outer, outer) + letter(p.inner, inner) +
    `<path d="M${n(-h + 0.6)} ${n(-p.bar)}H${n(h - 0.6)}" stroke="${PAPER}" ${sw('fine')}/>`;
}

/**
 * Stroked counter digits (uniform-stroke instrument lettering, as on the
 * F-16C FUEL FLOW drums, guide p. 50): centre lines in a box drawn 37.5 high
 * and 23.1 wide outside the stroke, centred on the origin. The 0, 5 and 6 are
 * traced from the guide (straight diagonal tail on the 6, flat top on the 5);
 * the other digits are drawn in the same style.
 */
const DIGIT_STROKE = 5.2, DIGIT_H = 37.5, DIGIT_W = 23.1;
const STROKE_DIGITS: Record<string, string> = {
  0: 'M0 -16.4C5.1 -16.4 9.2 -9.1 9.2 0S5.1 16.4 0 16.4S-9.2 9.1 -9.2 0S-5.1 -16.4 0 -16.4Z',
  1: 'M-5 -11.4L1 -16.4V16.4',
  2: 'M-8.8 -9.5C-8.8 -14 -5 -16.4 0 -16.4C5 -16.4 8.8 -13.5 8.8 -8.5C8.8 -4 6 -1 -9.2 16.4H9.2',
  3: 'M-8.5 -16.4H8.5L-1 -2.2C5.6 -2.6 9.2 1.6 9.2 6.8C9.2 12.4 5 16.4 -0.2 16.4C-4.4 16.4 -7.8 14.4 -9.2 11',
  4: 'M4.5 16.4V-16.4L-9.2 7H9.2',
  5: 'M7.8 -16.4H-7.6L-8.4 -1.2C-6.2 -2.6 -3.4 -3.4 -0.4 -3.4C5.2 -3.4 9.2 0.8 9.2 6.5C9.2 12.2 5 16.4 -0.4 16.4C-4.4 16.4 -7.6 14.4 -9.2 11.2',
  6: 'M6.5 -16.4L-7.38 1.17M9.4 7A9.4 9.4 0 1 1 -9.4 7A9.4 9.4 0 1 1 9.4 7Z',
  7: 'M-9.2 -16.4H9.2L-2 16.4',
  8: 'M0 -16.4C4.2 -16.4 7.6 -12.7 7.6 -8.2S4.2 0 0 0S-7.6 -3.7 -7.6 -8.2S-4.2 -16.4 0 -16.4ZM0 0C5 0 9.2 3.3 9.2 8.2S5 16.4 0 16.4S-9.2 13.1 -9.2 8.2S-5 0 0 0Z',
  9: 'M-6.5 16.4L7.38 -1.17M-9.4 -7A9.4 9.4 0 1 1 9.4 -7A9.4 9.4 0 1 1 -9.4 -7Z',
};
function strokeDigit(d: number, y: number, cap: number, width: number) {
  return `<path transform="translate(0 ${n(y)}) scale(${n(width / DIGIT_W)} ${n(cap / DIGIT_H)})" d="${STROKE_DIGITS[d]}" fill="none" stroke="${INK}" stroke-width="${DIGIT_STROKE}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/**
 * Diagonal hatching a drum shows in place of 0 (F-16C altimeter ten-thousands
 * drum below 10,000 ft), centred on (0, y): four stripes running down to the
 * right across a cell 1.45 digit widths wide and 1.08 caps high (measured on
 * the guide's p. 51 image), each clipped to the cell.
 */
export function drumHatch(y: number, cap: number, width: number) {
  const w = width * 1.45, h = cap * 1.08, k = 0.52, stripes = 4, gap = (w + k * h) / stripes;
  const x0 = -w / 2, x1 = w / 2, y0 = y - h / 2, y1 = y + h / 2;
  let d = '';
  // Stripe i: x = c + k (y' - y0) for y' in the cell, spread evenly across every line that crosses the cell.
  for (let i = 0; i < stripes; i++) {
    const c = x0 - k * h + gap * (i + 0.5);
    let ya = y0, yb = y1;
    if (c < x0) ya = y0 + (x0 - c) / k;
    if (c + k * h > x1) yb = y0 + (x1 - c) / k;
    if (yb <= ya) continue;
    d += `M${n(c + k * (ya - y0))} ${n(ya)}L${n(c + k * (yb - y0))} ${n(yb)}`;
  }
  return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${n(width * 0.17)}" stroke-linecap="butt"/>`;
}

/** One drum of a counter: digits 0–9 and 0 again (or only zeros), `roll` apart, centred on the origin at 0. `stroked` draws the shared stroked digits instead of type. */
export function drumStrip(roll: number, cap: number, width: number, zeros = false, blank = false, stroked = false, hatch = false) {
  let s = '';
  for (let i = -1; i <= 10; i++) {
    const d = zeros ? 0 : (i + 10) % 10;
    if (hatch && d === 0) { s += drumHatch(i * roll, cap, width); continue; }
    if (blank && d === 0) continue;
    s += stroked ? strokeDigit(d, i * roll, cap, width) : text(0, i * roll, String(d), cap, width);
  }
  return s;
}

/**
 * Half disc of radius r on one side of the origin (the flat edge runs through the origin): `left` bulges to the
 * left, `down` downwards (F-16C trim indicators).
 */
export function halfDisc(r: number, half: 'left' | 'right' | 'up' | 'down') {
  const [x0, y0, x1, y1, sweep] = { left: [0, -r, 0, r, 0], right: [0, -r, 0, r, 1], up: [-r, 0, r, 0, 1], down: [-r, 0, r, 0, 0] }[half];
  return `M${n(x0)} ${n(y0)}A${n(r)} ${n(r)} 0 0 ${sweep} ${n(x1)} ${n(y1)}Z`;
}

/** Bezel ring with the dial face inside it, centred on the origin; with `half`, a half-disc window (flat edge through the centre). */
export function gaugeBezel(bezel: number, face: number, half?: 'left' | 'right' | 'up' | 'down') {
  if (half) return cased(`<path d="${halfDisc(bezel, half)}" fill="${PAPER}"/>`, 'heavy') + `<path d="${halfDisc(face, half)}" ${sw('medium')}/>`;
  return cased(`<circle r="${n(bezel)}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(face)}" ${sw('medium')}/>`;
}

/** Hub cap over the needle root (none when r is 0). */
export function gaugeHub(r: number) {
  if (!r) return '';
  return cased(`<circle r="${n(r)}" fill="${PAPER}"/>`, 'medium') + `<circle r="${n(r * 0.45)}" ${sw('fine')}/>`;
}

/* ------------------------------------------------- thumbwheels, rockers, hats */

/**
 * Knurled thumbwheel standing out of a slot, seen square-on (w, h centred on
 * the origin): a rounded outline with ribs that crowd together towards the
 * top and bottom as the wheel curves away. `phase` (0–1, one rib pitch) turns
 * the ribs, so each detent shows them in a different place.
 */
export const THUMBWHEEL = { ribs: 18 } as const;
export function thumbwheelArt([w, h]: [number, number], phase: number) {
  const r = Math.min(w, h) * 0.22, x0 = -w / 2 + 0.7, x1 = w / 2 - 0.7;
  let ribs = '';
  for (let k = 0; k < THUMBWHEEL.ribs; k++) {
    const a = -Math.PI / 2 + ((k + phase) / THUMBWHEEL.ribs) * Math.PI;
    const y = (h / 2 - 0.8) * Math.sin(a);
    if (Math.abs(y) > h / 2 - 1) continue;
    ribs += `M${n(x0)} ${n(y)}H${n(x1)}`;
  }
  return cased(`<rect x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" fill="${PAPER}"/>`, 'heavy') +
    `<path d="${ribs}" ${sw('medium')}/>`;
}

/** Rocker housing (w, h centred on the origin). */
export function rockerBase([w, h]: [number, number]) {
  return cased(`<rect x="${n(-w / 2)}" y="${n(-h / 2)}" width="${n(w)}" height="${n(h)}" rx="1.2" fill="${PAPER}"/>`, 'heavy');
}

/**
 * Rocker cap with its up and down arrows, filled; `tilt` -1 pressed at the top, 1 at the bottom, 0 at rest (the
 * pressed half sinks). Arrow proportions from the F-16C ICP (guide p. 99): `arrow` heads 0.27 w wide from
 * 0.34 h to 0.17 h out with 0.11 w shafts to 0.03 h; `spike` triangles 0.26 w wide from 0.3 h to 0.054 h.
 */
export function rockerCap([w, h]: [number, number], tilt: number, arrows: 'arrow' | 'spike') {
  const cw = w - 2, ch = h - 2;
  const one = (s: number) => arrows === 'spike'
    ? `M0 ${n(s * 0.3 * h)}L${n(0.13 * w)} ${n(s * 0.054 * h)}H${n(-0.13 * w)}Z`
    : `M0 ${n(s * 0.339 * h)}L${n(0.134 * w)} ${n(s * 0.172 * h)}H${n(0.053 * w)}V${n(s * 0.032 * h)}H${n(-0.053 * w)}V${n(s * 0.172 * h)}H${n(-0.134 * w)}Z`;
  let s = cased(`<rect x="${n(-cw / 2)}" y="${n(-ch / 2)}" width="${n(cw)}" height="${n(ch)}" rx="0.8" fill="${PAPER}"/>`, 'medium') +
    `<path d="${one(-1)}${one(1)}" fill="${INK}" stroke="none"/>`;
  if (tilt) {
    const y0 = tilt < 0 ? -ch / 2 + 0.6 : 0.3, y1 = tilt < 0 ? -0.3 : ch / 2 - 0.6;
    s += `<rect x="${n(-cw / 2 + 0.6)}" y="${n(y0)}" width="${n(cw - 1.2)}" height="${n(y1 - y0)}" rx="0.5" fill="none" ${sw('fine')}/>`;
  }
  return s;
}

/** Four-way switch well (radius r) with its inner lip. */
export function hatBase(r: number) {
  return cased(`<circle r="${n(r)}" fill="${PAPER}"/>`, 'heavy') + `<circle r="${n(r * 0.86)}" ${sw('fine')}/>`;
}

/** Four-way switch lever top (w, h), moved (dx, dy) off centre. */
/**
 * Hat lever seen square-on: a square stick on a pivot under the panel. Centred it shows only its top face; held in a
 * direction it leans, so the top face moves by (dx, dy) and the side facing the lean shows between the stick's root
 * (a square at the pivot) and the top face.
 */
export function hatLever([w, h]: [number, number], dx: number, dy: number) {
  const top = `<rect x="${n(dx - w / 2)}" y="${n(dy - h / 2)}" width="${n(w)}" height="${n(h)}" rx="0.7" fill="${PAPER}"/>`;
  if (!dx && !dy) return cased(top, 'medium');
  // Outline of the root square swept to the top square (their convex hull), drawn first as the stick's side.
  const [x0, x1, y0, y1] = [-w / 2, w / 2, -h / 2, h / 2];
  const hull = dy ? (dy < 0
    ? `M${n(x0)} ${n(y1)}L${n(x0)} ${n(y0 + dy)}H${n(x1)}L${n(x1)} ${n(y1)}Z`
    : `M${n(x0)} ${n(y0)}L${n(x0)} ${n(y1 + dy)}H${n(x1)}L${n(x1)} ${n(y0)}Z`)
    : (dx < 0
    ? `M${n(x1)} ${n(y0)}L${n(x0 + dx)} ${n(y0)}V${n(y1)}L${n(x1)} ${n(y1)}Z`
    : `M${n(x0)} ${n(y0)}L${n(x1 + dx)} ${n(y0)}V${n(y1)}L${n(x0)} ${n(y1)}Z`);
  return cased(`<path d="${hull}" fill="${PAPER}"/>`, 'medium') + cased(top, 'medium');
}
