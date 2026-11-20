import type { Placement } from '../types';

/**
 * Face-on drawings of the F-16C HOTAS switches for their control pads: each switch seen square to its own face,
 * as every panel is drawn, centred in a 50 x 50 mm canvas. Shapes follow the clean flight-manual line drawing
 * and the DCS guide's switch diagrams and renders (pp. 83–89), cross-checked against photos of real grips: concentric
 * trim hat with its NOSE DOWN / NOSE UP / L WING / R WING legends, ribbed square TMS cap in a round bezel, round DMS cap
 * with four raised blocks at its rim, round CMS with a raised cross, red weapon release and trigger, rectangular
 * transmit block, round knurled cursor/enable, knurled MAN RNG and ANT ELEV wheels, slotted round DOG FIGHT and
 * SPD BRK cylinder ends.
 * A held four-way switch is drawn rocked a little toward the direction pushed.
 */
export const FACE: [number, number] = [50, 50];
const C = 25, INK = '#161616', PAPER = 'var(--panel-paper,#fff)', RED = 'var(--panel-red,#b3262a)';
const W = { heavy: 0.6, medium: 0.4, fine: 0.25 };
const f = (v: number) => +v.toFixed(2);
const line = (d: string, w: keyof typeof W = 'medium', fill = 'none') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${W[w]}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circle = (r: number, w: keyof typeof W = 'medium', fill = PAPER, x = C, y = C) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" stroke="${INK}" stroke-width="${W[w]}"/>`;
const rect = (w: number, h: number, r: number, pen: keyof typeof W = 'medium', x = C, y = C) => `<rect x="${f(x - w / 2)}" y="${f(y - h / 2)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}" fill="${PAPER}" stroke="${INK}" stroke-width="${W[pen]}"/>`;
const cover = (svg: string) => svg; // parts are drawn on paper, so a moved cap hides the centred one under it
const g = (dx: number, dy: number, body: string) => (dx || dy ? `<g transform="translate(${f(dx)} ${f(dy)})">${body}</g>` : body);
const text = (s: string, x: number, y: number, rot = 0) => `<text x="${f(x)}" y="${f(y)}" font-size="2.6" font-weight="700" text-anchor="middle" dominant-baseline="central"${rot ? ` transform="rotate(${rot} ${f(x)} ${f(y)})"` : ''} fill="${INK}" stroke="none">${s}</text>`;
/** Card labels round a switch: what each direction does (DCS guide function tables); left and right read along the side. */
const around = (up: string, down: string, left = '', right = '', r = 19.6) =>
  text(up, C, C - r) + text(down, C, C + r) + (left ? text(left, C - r, C, -90) : '') + (right ? text(right, C + r, C, 90) : '');
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

/** Knurl teeth round the rim of a circle of radius r, `depth` deep, turned `deg`. */
const knurl = (r: number, depth: number, n: number, deg = 0) => {
  let k = '';
  for (let i = 0; i < n; i++) {
    const t = ((i / n) * 360 + deg) * Math.PI / 180;
    k += `M${f(C + Math.sin(t) * (r - depth))} ${f(C - Math.cos(t) * (r - depth))}L${f(C + Math.sin(t) * r)} ${f(C - Math.cos(t) * r)}`;
  }
  return line(k, 'fine');
};

export const STICK_FACES: Record<string, { canvas: [number, number]; placements: Placement[]; hit?: [number, number, number, number] }> = {
  trim: { canvas: FACE, placements: fourWay('trim-ud', 'trim-lr', HAT_IDS,
    circle(17, 'heavy') + around('NOSE DOWN', 'NOSE UP', 'L WING', 'R WING'),
    circle(13.5) + [11, 8.8, 6.8, 4.9, 3.1].map(r => circle(r, 'fine', 'none')).join('') + circle(1.2, 'fine', 'none')) },
  tms: { canvas: FACE, placements: fourWay('tms-ud', 'tms-lr', HAT_IDS, circle(16, 'heavy') + around('DESIGNATE', 'REJECT', 'SCAN / NCTR', 'TGT STEP', 18.6),
    rect(19, 19, 2.6) + line([-6, -3, 0, 3, 6].map(y => `M${C - 7.5} ${C + y}H${C + 7.5}`).join(''), 'fine')) },
  dms: { canvas: FACE, placements: fourWay('dms-ud', 'dms-lr', HAT_IDS, circle(16, 'heavy') + around('SOI HUD', 'SOI MFD', 'LEFT MFD', 'RIGHT MFD', 18.6),
    circle(13) + circle(7.5, 'fine', 'none') + [[0, -10.4], [10.4, 0], [0, 10.4], [-10.4, 0]].map(([x, y]) => rect(x ? 3.6 : 6, x ? 6 : 3.6, 0.8, 'medium', C + x, C + y)).join('')) },
  cms: { canvas: FACE, placements: fourWay('cms-ud', 'cms-lr', HAT_IDS, circle(16, 'heavy') + around('PRGM 1–4', 'AUTO / ECM ON', 'PRGM 6', 'STOP', 18.6),
    circle(12.5) + line(`M${C - 2} ${C - 12.3}V${C - 2}H${C - 12.3}M${C + 2} ${C - 12.3}V${C - 2}H${C + 12.3}M${C - 2} ${C + 12.3}V${C + 2}H${C - 12.3}M${C + 2} ${C + 12.3}V${C + 2}H${C + 12.3}`, 'medium')) },
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
    out: circle(15, 'heavy') + circle(10.5, 'medium', RED),
    in: circle(15, 'heavy') + circle(9.6, 'medium', RED),
  }) }] },
  // Rudder pedals from above, forward up the page: the pushed pedal goes forward and the other comes back.
  pedals: { canvas: FACE, hit: [5, 12, 40, 26], placements: (() => {
    const pedal = (x: number, dy: number) => g(0, dy, rect(12, 17, 2, 'heavy', x) + line([-5, -2, 1, 4].map(y => `M${f(x - 4)} ${C + y}H${f(x + 4)}`).join(''), 'fine'));
    const both = (dl: number) => text('LEFT', C - 11, C - 16) + text('RIGHT', C + 11, C - 16) + line(`M${C} ${C - 12}V${C + 12}`, 'fine') + pedal(C - 11, dl) + pedal(C + 11, -dl);
    return [{ component: 'traced', control: 'rudder', at: [C, C], shapes: shapes({ left: both(-4), neutral: both(0), right: both(4) }) }] as Placement[];
  })() },
  'msl-step': { canvas: FACE, placements: [{ component: 'traced', control: 'msl-step', at: [C, C], shapes: shapes({
    out: circle(11, 'heavy') + circle(7.5), in: circle(11, 'heavy') + circle(6.8) + circle(5, 'fine', 'none'),
  }) }] },
  'expand-fov': { canvas: FACE, placements: [{ component: 'traced', control: 'expand-fov', at: [C, C], shapes: shapes({
    out: circle(12, 'heavy') + circle(9),
    in: circle(12, 'heavy') + circle(8.2) + circle(6.6, 'fine', 'none'),
  }) }] },
};

/** Knurled wheel or knob seen from its face; the knurl turns `deg` with it (it has no index mark). */
const knob = (deg: number, pressed = false, label = '') => {
  const r = pressed ? 12.3 : 13;
  return circle(16.5, 'heavy') + circle(r) + knurl(r, 1.8, 36, deg) + circle(r - 1.8, 'fine', 'none') +
    (label ? `<text x="${C}" y="${C + 1.2}" font-size="3.4" font-weight="700" text-anchor="middle" fill="${INK}" stroke="none">${label}</text>` : '');
};

/** Three-position slide: a slot along `axis` with the slider at -1, 0 or 1. */
const slide = (axis: 'x' | 'y', at: number, labels: string[] = [], slotted = true) => {
  const slot = axis === 'y' ? rect(13, 36, 2, 'heavy') : rect(36, 13, 2, 'heavy');
  const [dx, dy] = axis === 'y' ? [0, at * 10] : [at * 10, 0];
  // round cylinder end with a slot across the direction of travel
  const cap = circle(5.6) + (slotted ? (axis === 'y' ? rect(8, 1.6, 0.8, 'fine') : rect(1.6, 8, 0.8, 'fine')) : '');
  const ends = axis === 'x' ? text(labels[0], C - 11, C - 9.5) + text(labels[1], C + 11, C - 9.5) : text(labels[0], C, C - 20.5) + text(labels[1], C, C + 20.5);
  return slot + (labels.length ? ends : '') + g(dx, dy, cap);
};

const SB = ['EXTEND', 'RETRACT'];
export const THROTTLE_FACES = (manRng: number[], antElev: number[]): Record<string, { canvas: [number, number]; placements: Placement[]; hit?: [number, number, number, number] }> => ({
  comm: { canvas: FACE, placements: fourWay('comm-ud', 'comm-lr', { ud: ['fwd', 'center', 'aft'], lr: ['left', 'center', 'right'] }, circle(16, 'heavy') + around('VHF', 'UHF', 'IFF OUT', 'IFF IN', 18.6),
    rect(22, 15, 1.6) + rect(18, 11, 1, 'fine')) },
  cursor: { canvas: FACE, placements: [
    ...fourWay('cursor-ud', 'cursor-lr', { ud: ['up', 'center', 'down'], lr: ['aft', 'center', 'fwd'] }, circle(16.5, 'heavy') + text('PRESS: ENABLE', C, C + 19.6), circle(12.5) + knurl(12.5, 1.6, 36) + circle(10.9, 'fine', 'none')),
    { component: 'traced', control: 'enable', at: [C, C], shapes: shapes({ out: '', in: circle(11.8) + knurl(11.8, 1.5, 36) + circle(10.3, 'fine', 'none') + circle(8.6, 'fine', 'none') }) },
  ] },
  'man-rng': { canvas: FACE, placements: [
    { component: 'traced', control: 'man-rng', at: [C, C], shapes: shapes(Object.fromEntries(manRng.map(v => [`p${v}`, knob(v * 0.9) + text('TURN: RANGE  PRESS: UNCAGE', C, C + 19.6)]))) },
    { component: 'traced', control: 'uncage', at: [C, C], shapes: shapes({ out: '', in: knob(0, true) + text('TURN: RANGE  PRESS: UNCAGE', C, C + 19.6) }) },
  ] },
  'ant-elev': { canvas: FACE, placements: [{ component: 'traced', control: 'ant-elev', at: [C, C], shapes: shapes(Object.fromEntries(antElev.map(v => [v > 0 ? `u${v}` : v < 0 ? `d${-v}` : 'center', knob(v * 0.3) + around('UP', 'DOWN')]))) }] },
  dogfight: { canvas: FACE, hit: [12, 8, 26, 34], placements: [{ component: 'traced', control: 'dogfight', at: [C, C], shapes: shapes(Object.fromEntries((['dogfight', 'center', 'msl-ovrd'] as const).map((id, i) => {
    const dy = (i - 1) * 4;
    const cap = circle(12) + circle(10, 'fine', 'none') + rect(15, 2.6, 1.3, 'fine');
    return [id, rect(26, 34, 13, 'heavy') + around('DOGFIGHT', 'MSL OVRD', '', '', 19.8) + g(0, dy, cap)];
  }))) }] },
  'spd-brk': { canvas: FACE, hit: [7, 18.5, 36, 13], placements: [{ component: 'traced', control: 'spd-brk', at: [C, C], shapes: shapes({ aft: slide('x', -1, SB), off: slide('x', 0, SB), fwd: slide('x', 1, SB) }) }] },
});
