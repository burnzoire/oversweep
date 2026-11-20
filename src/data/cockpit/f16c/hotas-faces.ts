import type { Placement } from '../types';

/**
 * Face-on drawings of the F-16C HOTAS switches for their control pads: each switch seen square to its own face,
 * as every panel is drawn, centred in a 50 x 50 mm canvas. Shapes follow the clean flight-manual line drawing
 * (concentric trim hat, ridged TMS, four-tab DMS, square transmit cap, oval cursor cap, knurled MAN RNG knob).
 * A held four-way switch is drawn rocked a little toward the direction pushed.
 */
export const FACE: [number, number] = [50, 50];
const C = 25, INK = '#161616', PAPER = 'var(--panel-paper,#fff)';
const W = { heavy: 0.6, medium: 0.4, fine: 0.25 };
const f = (v: number) => +v.toFixed(2);
const line = (d: string, w: keyof typeof W = 'medium', fill = 'none') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${W[w]}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle = (r: number, w: keyof typeof W = 'medium', fill = PAPER, x = C, y = C) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${INK}" stroke-width="${W[w]}"/>`;
const ellipse = (rx: number, ry: number, w: keyof typeof W = 'medium', fill = PAPER, x = C, y = C) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" stroke="${INK}" stroke-width="${W[w]}"/>`;
const rect = (w: number, h: number, r: number, pen: keyof typeof W = 'medium', x = C, y = C) => `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${PAPER}" stroke="${INK}" stroke-width="${W[pen]}"/>`;
const cover = (svg: string) => svg; // parts are drawn on paper, so a moved cap hides the centred one under it
const g = (dx: number, dy: number, body: string) => (dx || dy ? `<g transform="translate(${f(dx)} ${f(dy)})">${body}</g>` : body);
const shapes = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, { d: '', svg: v }]));

/** A four-way switch: `ud` draws the switch centred or rocked up/down; `lr` redraws it rocked left/right over that. */
function fourWay(ud: string, lr: string, ids: { ud: [string, string, string]; lr: [string, string, string] }, housing: string, cap: string, throw_ = 2.2): Placement[] {
  const at = (dx: number, dy: number) => housing + g(dx, dy, cap);
  return [
    { component: 'traced', control: ud, at: [C, C], shapes: shapes({ [ids.ud[0]]: at(0, -throw_), [ids.ud[1]]: at(0, 0), [ids.ud[2]]: at(0, throw_) }) },
    { component: 'traced', control: lr, at: [C, C], shapes: shapes({ [ids.lr[0]]: cover(at(-throw_, 0)), [ids.lr[1]]: '', [ids.lr[2]]: cover(at(throw_, 0)) }) },
  ];
}
const HAT_IDS = { ud: ['fwd', 'center', 'aft'] as [string, string, string], lr: ['left', 'center', 'right'] as [string, string, string] };

/** Chords of a circle of radius r at 45 degrees, `n` of them, as fine ridges. */
const ridges = (r: number, n: number, gap: number) => {
  let d = '';
  for (let i = 0; i < n; i++) {
    const o = (i - (n - 1) / 2) * gap, h = Math.sqrt(Math.max(0, r * r - o * o));
    const ux = Math.SQRT1_2, uy = -Math.SQRT1_2, nx = Math.SQRT1_2, ny = Math.SQRT1_2;
    d += `M${f(C + nx * o - ux * h)} ${f(C + ny * o - uy * h)}L${f(C + nx * o + ux * h)} ${f(C + ny * o + uy * h)}`;
  }
  return line(d, 'fine');
};

export const STICK_FACES: Record<string, { canvas: [number, number]; placements: Placement[] }> = {
  trim: { canvas: FACE, placements: fourWay('trim-ud', 'trim-lr', HAT_IDS, circle(17, 'heavy'),
    circle(13.5) + [11, 8.8, 6.8, 4.9, 3.1].map(r => circle(r, 'fine', 'none')).join('') + circle(1.2, 'fine', 'none')) },
  tms: { canvas: FACE, placements: fourWay('tms-ud', 'tms-lr', HAT_IDS, circle(16, 'heavy'), circle(12) + ridges(11.4, 6, 3.6)) },
  dms: { canvas: FACE, placements: fourWay('dms-ud', 'dms-lr', HAT_IDS, circle(16, 'heavy'),
    circle(12.5) + [[0, -9], [9, 0], [0, 9], [-9, 0]].map(([x, y]) => rect(x ? 3.6 : 6, x ? 6 : 3.6, 0.6, 'medium', C + x, C + y)).join('')) },
  cms: { canvas: FACE, placements: fourWay('cms-ud', 'cms-lr', HAT_IDS, rect(30, 22, 3, 'heavy'),
    rect(22, 14, 2) + line(`M${C - 6} ${C - 4.5}V${C + 4.5}M${C} ${C - 4.5}V${C + 4.5}M${C + 6} ${C - 4.5}V${C + 4.5}`, 'fine')) },
  // The stick senses force: its grip top, with an arrow for the force applied.
  stick: { canvas: FACE, placements: (() => {
    const grip = rect(24, 30, 9, 'heavy') + line(`M${C - 7} ${C - 9}H${C + 7}`, 'fine');
    const arrow = (dx: number, dy: number) => {
      const x1 = C + dx * 19, y1 = C + dy * 19, x0 = C + dx * 5, y0 = C + dy * 5, px = -dy * 3, py = dx * 3;
      return line(`M${x0} ${y0}L${x1 - dx * 4} ${y1 - dy * 4}`, 'heavy') + line(`M${x1} ${y1}L${x1 - dx * 5 + px} ${y1 - dy * 5 + py}L${x1 - dx * 5 - px} ${y1 - dy * 5 - py}Z`, 'fine', INK);
    };
    return [
      { component: 'traced', control: 'pitch', at: [C, C], shapes: shapes({ fwd: grip + arrow(0, -1), neutral: grip, aft: grip + arrow(0, 1) }) },
      { component: 'traced', control: 'roll', at: [C, C], shapes: shapes({ left: arrow(-1, 0), neutral: '', right: arrow(1, 0) }) },
    ] as Placement[];
  })() },
  'weapon-release': { canvas: FACE, placements: [{ component: 'traced', control: 'weapon-release', at: [C, C], shapes: shapes({
    out: circle(15, 'heavy') + circle(10.5) + circle(7) + circle(3, 'fine', 'none'),
    in: circle(15, 'heavy') + circle(10.5) + circle(6.3) + circle(4.2, 'fine', 'none') + circle(2.4, 'fine', 'none'),
  }) }] },
  'msl-step': { canvas: FACE, placements: [{ component: 'traced', control: 'msl-step', at: [C, C], shapes: shapes({
    out: circle(11, 'heavy') + circle(7.5), in: circle(11, 'heavy') + circle(6.8) + circle(5, 'fine', 'none'),
  }) }] },
  'expand-fov': { canvas: FACE, placements: [{ component: 'traced', control: 'expand-fov', at: [C, C], shapes: shapes({
    out: circle(12, 'heavy') + circle(9) + line(`M${C - 5} ${C}H${C + 5}M${C} ${C - 5}V${C + 5}`, 'heavy'),
    in: circle(12, 'heavy') + circle(8.2) + circle(6.8, 'fine', 'none') + line(`M${C - 4.4} ${C}H${C + 4.4}M${C} ${C - 4.4}V${C + 4.4}`, 'heavy'),
  }) }] },
};

/** Knurled knob seen from its face, index line at `deg` (clockwise from up). */
const knob = (deg: number, pressed = false) => {
  const r = pressed ? 12.3 : 13, a = (deg * Math.PI) / 180;
  let k = '';
  for (let i = 0; i < 40; i++) {
    const t = (i / 40) * 2 * Math.PI;
    k += `M${f(C + Math.sin(t) * (r - 1.6))} ${f(C - Math.cos(t) * (r - 1.6))}L${f(C + Math.sin(t) * r)} ${f(C - Math.cos(t) * r)}`;
  }
  return circle(16.5, 'heavy') + circle(r) + line(k, 'fine') + circle(r - 1.6, 'fine', 'none') +
    line(`M${C} ${C}L${f(C + Math.sin(a) * (r - 2.5))} ${f(C - Math.cos(a) * (r - 2.5))}`, 'heavy');
};

/** Three-position slide: a slot along `axis` with the slider at -1, 0 or 1. */
const slide = (axis: 'x' | 'y', at: number, ridged = true) => {
  const slot = axis === 'y' ? rect(13, 36, 2, 'heavy') : rect(36, 13, 2, 'heavy');
  const [dx, dy] = axis === 'y' ? [0, at * 10] : [at * 10, 0];
  const cap = rect(10, 10, 1.5) + (ridged ? line(axis === 'y' ? `M${C - 3.5} ${C - 2}H${C + 3.5}M${C - 3.5} ${C}H${C + 3.5}M${C - 3.5} ${C + 2}H${C + 3.5}` : `M${C - 2} ${C - 3.5}V${C + 3.5}M${C} ${C - 3.5}V${C + 3.5}M${C + 2} ${C - 3.5}V${C + 3.5}`, 'fine') : '');
  return slot + g(dx, dy, cap);
};

export const THROTTLE_FACES = (manRng: number[]): Record<string, { canvas: [number, number]; placements: Placement[] }> => ({
  comm: { canvas: FACE, placements: fourWay('comm-ud', 'comm-lr', { ud: ['fwd', 'center', 'aft'], lr: ['left', 'center', 'right'] }, circle(16, 'heavy'),
    rect(17, 17, 1.6) + rect(12.5, 12.5, 1, 'fine')) },
  cursor: { canvas: FACE, placements: [
    ...fourWay('cursor-ud', 'cursor-lr', { ud: ['up', 'center', 'down'], lr: ['aft', 'center', 'fwd'] }, ellipse(12, 19, 'heavy'), ellipse(8.5, 15) + ellipse(5, 10.5, 'fine', 'none')),
    { component: 'traced', control: 'enable', at: [C, C], shapes: shapes({ out: '', in: ellipse(8.5, 15) + ellipse(6.6, 12.6, 'fine', 'none') + ellipse(4.2, 8.6, 'fine', 'none') }) },
  ] },
  'man-rng': { canvas: FACE, placements: [
    { component: 'traced', control: 'man-rng', at: [C, C], shapes: shapes(Object.fromEntries(manRng.map(v => [`p${v}`, knob(-135 + 2.7 * v)]))) },
    { component: 'traced', control: 'uncage', at: [C, C], shapes: shapes({ out: '', in: circle(16.5, 'heavy') + circle(12.3) + circle(10.4, 'fine', 'none') }) },
  ] },
  'ant-elev': { canvas: FACE, placements: [{ component: 'thumbwheel', control: 'ant-elev', at: [C, C], size: [12, 30] }] },
  dogfight: { canvas: FACE, placements: [{ component: 'traced', control: 'dogfight', at: [C, C], shapes: shapes({ dogfight: slide('y', -1), center: slide('y', 0), 'msl-ovrd': slide('y', 1) }) }] },
  'spd-brk': { canvas: FACE, placements: [{ component: 'traced', control: 'spd-brk', at: [C, C], shapes: shapes({ aft: slide('x', -1), off: slide('x', 0), fwd: slide('x', 1) }) }] },
});
