import type { ControlDef, Dial, PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C MANUAL TRIM panel (left console), DCS.
 *
 * Reference: the guide's p. 72 "MANUAL TRIM Panel" cockpit image (440 x 321
 * JPEG, extracted with `pdfimages -j -f 72 -l 72`, image 002), rectified on
 * the four DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p72-002.png> <out> 16.5,42.5=16,42.5 423.5,42.5=424,42.5 14.5,279.5=16,278 424.5,276.5=424,278
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 3.15;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 72';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

/**
 * The ROLL and PITCH TRIM indicators: half-disc windows with seven printed
 * dots and a straight pointer from the centre of the flat edge. Dots measured
 * on both windows at about 24° apart (roll 20/31, 49/55, 73/78°; pitch 21/23,
 * 43/44, 65/67° either side of the pointer at rest), radius about 33 px; face
 * radius 39 px. The value is trim in dot steps, positive towards L WING DN
 * (roll) and NOSE UP (pitch).
 */
const trimDial = (half: 'left' | 'down', rest: number): Dial => ({
  half,
  bezel: mm(42), face: mm(39), hub: 0,
  scale: [[-3, rest - 72], [3, rest + 72]],
  ticks: [{ from: -3, to: 3, step: 1, r: [mm(31), mm(35)], width: mm(4.5), dot: true }],
  legends: [],
  needle: mm(35),
  needleArt: 'line',
});

const slug = (s: string) => s.toLowerCase().replace(/ /g, '-');
/** Trim wheels: continuous, modelled with a detent at each indicator dot (three each way from the centre). */
const wheel = (id: string, name: string, travel: 'vertical' | 'horizontal', first: string, last: string, description: string): ControlDef => ({
  id, name, type: 'rotary', travel,
  // Thumbwheel detents carry a nominal angle (the wheel turns about 20° a step); only their order is drawn.
  positions: [...[3, 2, 1].map(k => [`${slug(first)}-${k}`, `${first} ${k}`]), ['center', 'Centre'], ...[1, 2, 3].map(k => [`${slug(last)}-${k}`, `${last} ${k}`])]
    .map(([pid, label], i) => ({ id: pid, label, hold: 'stable' as const, angle: (i - 3) * 20 })),
  initial: 'center', description, source: src,
});

// YAW TRIM scale: eleven dots on a 45 px circle about the knob, 15.26° apart from 13.7° (L) to 166.3° (R),
// measured on the eight visible dots (the middle three are hidden by the right bail).
const YAW: [number, number] = [104, 256];
const yawAngle = (k: number) => 13.7 + 15.26 * k;
const yawDots = Array.from({ length: 11 }, (_, k) => {
  const a = yawAngle(k) * Math.PI / 180;
  return `<circle cx="${mm(YAW[0] + 45 * Math.sin(a))}" cy="${mm(YAW[1] - 45 * Math.cos(a))}" r="${mm(2.4)}" fill="var(--panel-ink,#161616)" stroke="none"/>`;
}).join('');

export const manualTrim: PanelSpec = {
  id: 'manual-trim',
  title: 'MANUAL TRIM panel',
  canvas: [mm(440), mm(321)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 72,
    image: 'p. 72 "MANUAL TRIM Panel" cockpit image, 440 x 321 px',
    rectify: 'python3 -I scripts/panel-trace.py <p72-002.png> <out> 16.5,42.5=16,42.5 423.5,42.5=424,42.5 14.5,279.5=16,278 424.5,276.5=424,278',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads (about 27 px across) match. It comes out the same as the FLT CONTROL panel beside it.',
    shown: { 'roll-trim': 'center', 'pitch-trim': 'center', 'yaw-trim': 'center', 'trim-ap-disc': 'norm', 'roll-trim-ind': '0', 'pitch-trim-ind': '0' },
    unresolved: [
      'The trim wheels and the YAW TRIM knob turn without detents in DCS; they are modelled with a step for each indicator dot (three each way for roll and pitch, five each way for yaw). Rolling a wheel does not move its indicator on this page (no systems logic).',
      'Which way the indicators move for each trim direction is not stated; the pointer is taken to swing towards the L WING DN and NOSE UP legends for that trim.',
      'The middle three YAW TRIM dots are hidden behind the right bail; eleven evenly spaced dots are drawn from the eight visible ones.',
      'The camera sits to the left, so the bails and the YAW TRIM knob look shifted left; the bails are drawn equidistant from the knob centre, which is fixed by its dot circle.',
      'The TRIM/AP DISC bushing shows a lock-insert slot and a flat-topped cap, so it is drawn as a flat-top lever-lock toggle. Its NORM legend is mostly hidden by the lever.',
      'The top edges of the corner notches are hidden under the DZUS rims; they are mirrored from the bottom notches (16 px from the DZUS centre).',
    ],
  },
  plate: [
    { d: path('M12 2H428Q432 2 432 6V315Q432 319 428 319H12Q8 319 8 315V6Q8 2 12 2Z') },
    // Raised face plate, cut away round the four corner DZUS. Inner edges by brightness gradient (px):
    // TL x 31, TR x 409.5, BL x 32.5 / y 260.5, BR x 407 / y 263.5; mirrored about the DZUS centre
    // (x 220, y 160.25) at the means: x 31.7 / 408.3, y 58.5 / 262. Inner corner radius 10 px.
    { d: path('M31.7 2H408.3V48.5Q408.3 58.5 418.3 58.5H432V262H418.3Q408.3 262 408.3 272V319H31.7V272Q31.7 262 21.7 262H8V58.5H21.7Q31.7 58.5 31.7 48.5Z'), raised: true },
  ],
  engraving: [
    // Vertical panel name down the left edge.
    ...([['M', 78.5], ['A', 95.5], ['N', 112.5], ['U', 130], ['A', 147.5], ['L', 165], ['T', 191.5], ['R', 209], ['I', 226], ['M', 243]] as const)
      .map(([t, y]) => L([14, y], t, 15, t === 'I' ? undefined : 10)),
    // ROLL TRIM: title between rules, wheel slot, legends either side of a double arrow.
    L([109.5, 33.5], 'ROLL TRIM', 11, 57),
    { kind: 'path', d: path('M46 33H78M141 33H173') },
    { kind: 'path', pen: 'medium', d: path('M50 45H76Q80 45 80 49V154Q80 158 76 158H50Q46 158 46 154V49Q46 45 50 45Z') },
    L([110.5, 62.5], 'L WING DN', 9, 55),
    L([111, 134], 'R WING DN', 9, 56),
    { kind: 'path', d: path('M90.5 76V121M87.5 78L90.5 71L93.5 78ZM87.5 119L90.5 126L93.5 119ZM87.5 98.5L90.5 95L93.5 98.5L90.5 102Z') },
    // YAW TRIM: raised housing (outer edge and its lip) with a label plate, dot scale, wire bails.
    { kind: 'path', pen: 'heavy', d: path('M50 319V197Q50 188 58 184L99 163Q106 155 115 154Q124 154 129 161L192 268Q196 275 196 283V319') },
    { kind: 'path', pen: 'fine', d: path('M54.5 319V199Q54.5 191.5 61 188L101 167.5Q107 160 115 159.5Q121.5 159.5 125 165L187.5 270Q191.5 276.5 191.5 283V319') },
    { kind: 'path', pen: 'fine', d: path('M79 183H134V205H79Z') },
    L([106, 195], 'YAW TRIM', 12, 48),
    L([104, 211.5], 'L', 9, 6),
    L([104.5, 300.5], 'R', 9, 7),
    { kind: 'svg', markup: yawDots },
    { kind: 'path', pen: 'heavy', d: path('M50.5 238Q50.5 234 54 234Q57.5 234 57.5 238V274Q57.5 278 54 278Q50.5 278 50.5 274ZM150.5 238Q150.5 234 154 234Q157.5 234 157.5 238V274Q157.5 278 154 278Q150.5 278 150.5 274Z') },
    // TRIM/AP DISC.
    L([318.5, 14], 'TRIM/AP DISC', 10, 79),
    L([318.5, 32], 'NORM', 10, 31),
    L([318.5, 97], 'DISC', 10, 22),
    L([247.5, 85], '+', 7),
    // PITCH TRIM: title between rules, legends either side of a double arrow, wheel slot.
    L([311.5, 154.5], 'PITCH TRIM', 11, 61),
    { kind: 'path', d: path('M250 154H275M348 154H373') },
    L([271.5, 238], 'NOSE', 10, 27),
    L([272.5, 250.5], 'UP', 10, 13),
    L([346.5, 238], 'NOSE', 10, 27),
    L([347, 251], 'DN', 10, 14),
    { kind: 'path', d: path('M289 249.5H328M291 246.5L284 249.5L291 252.5ZM326 246.5L333 249.5L326 252.5ZM306 249.5L309.5 246.5L313 249.5L309.5 252.5Z') },
    { kind: 'path', pen: 'medium', d: path('M260 262H365Q369 262 369 266V292Q369 296 365 296H260Q256 296 256 292V266Q256 262 260 262Z') },
  ],
  placements: [
    { component: 'dzus', at: pt(16, 42.5) },
    { component: 'dzus', at: pt(424, 42.5) },
    { component: 'dzus', at: pt(16, 278) },
    { component: 'dzus', at: pt(424, 278) },
    { component: 'screw-medium', at: pt(367, 44.5) },
    { component: 'screw-medium', at: pt(114, 166) },
    { component: 'screw-medium', at: pt(178, 283) },
    { component: 'thumbwheel', control: 'roll-trim', at: pt(63, 101.5), size: [mm(26), mm(100)] },
    { component: 'gauge', indicator: 'roll-trim-ind', at: pt(168, 97.5), dial: trimDial('left', 270) },
    { component: 'knob-plain-index', control: 'yaw-trim', at: pt(...YAW) },
    { component: 'toggle-large-cylinder', control: 'trim-ap-disc', at: pt(318.5, 65) },
    { component: 'gauge', indicator: 'pitch-trim-ind', at: pt(311.5, 171), dial: trimDial('down', 180) },
    { component: 'thumbwheel', control: 'pitch-trim', at: pt(312.5, 279), size: [mm(100), mm(24)] },
  ],
  controls: [
    wheel('roll-trim', 'ROLL TRIM wheel', 'vertical', 'L WING DN', 'R WING DN', 'Trims the aircraft in roll by hand: roll it up for left wing down, down for right wing down. The indicator beside it shows how much manual roll trim is applied.'),
    {
      id: 'yaw-trim', name: 'YAW TRIM knob', type: 'rotary',
      positions: Array.from({ length: 11 }, (_, k) => ({
        id: k < 5 ? `l-${5 - k}` : k === 5 ? 'center' : `r-${k - 5}`,
        label: k < 5 ? `L ${5 - k}` : k === 5 ? 'Centre' : `R ${k - 5}`,
        hold: 'stable' as const, angle: +yawAngle(k).toFixed(1),
      })),
      initial: 'center',
      description: 'Trims the aircraft in yaw. The amount of manual yaw trim is read from the knob index against the dot scale round it, L at the top, R at the bottom.',
      source: src,
    },
    {
      id: 'trim-ap-disc', name: 'TRIM/AP DISC switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'norm', label: 'NORM', hold: 'stable' }, { id: 'disc', label: 'DISC', hold: 'stable' }],
      initial: 'norm',
      protections: [{ kind: 'latch', verified: false, note: 'The guide image shows a lever-lock slot in the bushing, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }],
      description: 'NORM: pitch and roll trim from either the four-way trim switch on the side stick or this panel, and the autopilot can be engaged. DISC: pitch and roll trim from this panel only; the stick trim switch is disabled and the autopilot cannot be engaged.',
      source: src,
    },
    wheel('pitch-trim', 'PITCH TRIM wheel', 'horizontal', 'NOSE UP', 'NOSE DN', 'Trims the aircraft in pitch by hand: roll it left for nose up, right for nose down. The indicator above it shows how much manual pitch trim is applied.'),
  ],
  indicators: [
    { id: 'roll-trim-ind', name: 'ROLL TRIM indicator', type: 'gauge', unit: 'dots', rest: 0, range: [-3, 3, 0.5], description: 'Shows the manual roll trim applied: the pointer at the middle dot is no trim; readings here count dots towards L WING DN.', source: src },
    { id: 'pitch-trim-ind', name: 'PITCH TRIM indicator', type: 'gauge', unit: 'dots', rest: 0, range: [-3, 3, 0.5], description: 'Shows the manual pitch trim applied: the pointer at the middle dot is no trim; readings here count dots towards NOSE UP.', source: src },
  ],
};
