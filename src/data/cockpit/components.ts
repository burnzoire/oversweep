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
  dzus: { r: 4.25, cut: 5.1 },
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
   * `ball` is the cap radius. Lever and cap enlarged 50% (Nathan, 2026-11-17).
   */
  'toggle-large-cylinder': { r: 5.2, reach: 6.4, ball: 5.18, cap: 'cylinder', lock: true },
  /**
   * Medium bushing with a flat lever widening (trapezoid) to a square paddle
   * (AIR REFUEL). The guide image shows a lock-insert slot in the bushing, so
   * it is drawn as a lever-lock base. `ball` is half the paddle width.
   */
  'toggle-large-square': { r: 4.0, reach: 4.6, ball: 3.3, cap: 'square', lock: true },
  /** Large lever-lock: a shaft widening from a lock-insert bushing to a domed cap (IFF M-4 CODE / REPLY). Lever and cap enlarged 50% (Nathan, 2026-11-17). */
  'toggle-large-lock': { r: 6.24, reach: 7.2, ball: 5.04, cap: 'dome', lock: true },
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

export function toggleLever(art: keyof typeof TOGGLES, k: number) {
  const t = TOGGLES[art], { r, reach, ball, cap } = t;
  const L = reach * k;
  const w0 = cap === 'cylinder' ? ball * 0.58 : 'hex' in t ? r * 0.17 : r * 0.3, w1 = cap === 'dome' ? ball * 0.8 : ball * 0.62;
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
  /** Bar-pointer selector on a round skirt (ENG FEED). */
  'rotary-pointer': { skirt: 10.2, bar: 9.6, barBack: 4.8, barFront: 3.4 },
  /** Larger bar-pointer selector (AIR COND TEMP and AIR SOURCE). */
  'rotary-pointer-large': { skirt: 13, bar: 12.2, barBack: 6.1, barFront: 4.3 },
  /** Mid-size selector, 11.6 mm skirt, with a broad block grip that chamfers to a pointed front (AVIONICS POWER INS and MIDS LVT). */
  'rotary-pointer-medium': { skirt: 11.6, bar: 10.9, barBack: 6.2, barFront: 2.8, block: true },
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
  /**
   * Large radio selector (UHF backup function and mode knobs): a broad skirt
   * with a raised centre boss, a flat lever running from the boss to the rim
   * opposite the pointer, and a white index bar set into the rim at the
   * pointing end. The whole knob turns.
   */
  'knob-radio-large': { r: 12.4, lobes: 0, ridge: [0, 0], lever: true },
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
    // pointed front, chamfered shoulders, broad back with rounded corners.
    const R = ROTARIES[art].skirt, k = (v: number) => n(v * R);
    const body = `M${k(-0.07)} ${k(-0.93)}Q0 ${k(-0.97)} ${k(0.07)} ${k(-0.93)}L${k(0.44)} ${k(-0.42)}L${k(0.56)} ${k(0.7)}` +
      `Q${k(0.57)} ${k(0.82)} ${k(0.45)} ${k(0.84)}H${k(-0.45)}Q${k(-0.57)} ${k(0.82)} ${k(-0.56)} ${k(0.7)}L${k(-0.44)} ${k(-0.42)}Z`;
    return cased(`<path d="${body}" fill="${PAPER}"/>`, 'heavy') + `<path d="M0 ${k(-0.8)}V0" ${sw('heavy')}/>`;
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
  /** Gear panel DN LOCK REL. */
  'push-round-xl': { r: 7.8, cap: 6.0 },
  /** Gear panel EMER STORES JETTISON: a large flat cap with a circle-and-square mark at its centre. */
  'push-round-xxl': { r: 14, cap: 10.5, mark: true },
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
