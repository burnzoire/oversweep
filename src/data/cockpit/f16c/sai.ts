import type { AttitudeBall, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C standby attitude indicator (SAI, instrument panel), DCS.
 *
 * Reference: the guide's p. 49 "Standby Attitude Indicator (SAI)" image (329 x
 * 314 JPEG, extracted with `pdfimages -j -f 49 -l 49`, image 002), rectified on
 * three corner screws and the fourth corner by symmetry (it is under the knob)
 * to a square case (see `source.rectify`). Values below are rectified reference
 * pixels (relative to the sphere window centre inside the instrument),
 * converted to mm by `tracer`.
 *
 * The sphere's lines were measured across the window, square to their tilt
 * (the sphere is banked about 6° left in the image): the horizon, a short bar
 * 13 px either side, long bars 28 px (10°) and 58 px (20°) either side, and
 * CLI–MB / DI–VE split by a short bar between them (15°), so about 2.85 px a
 * degree near the centre.
 */
const PX = 3.44;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 49';

/** Sphere window centre, and the PULL TO CAGE knob centre (rectified px). */
const C: Pt = [156.5, 152], K: Pt = [281, 281];
/** Pitch trim scale round the knob: ticks every 5° from −25° (9 o'clock) to +25° (12 o'clock), 9° apart. */
const TRIM_DEG = 1.8, TRIM_MID = 315;
const trimTicks = Array.from({ length: 11 }, (_, k) => {
  const v = -25 + 5 * k, a = ((TRIM_MID + v * TRIM_DEG) * Math.PI) / 180, major = Math.abs(v) === 25;
  const [r0, r1] = major ? [43, 60] : [46, 57];
  const P = (r: number) => `${(K[0] + r * Math.sin(a)).toFixed(2)} ${(K[1] - r * Math.cos(a)).toFixed(2)}`;
  return { d: `M${P(r0)}L${P(r1)}`, major };
});
/** Index at the middle of the trim scale (0°), pointing at the knob. */
const idx = (() => {
  const a = (TRIM_MID * Math.PI) / 180, P = (r: number, s: number) => `${(K[0] + r * Math.sin(a) + s * Math.cos(a)).toFixed(2)} ${(K[1] - r * Math.cos(a) + s * Math.sin(a)).toFixed(2)}`;
  return `M${P(44, 0)}L${P(62, 5)}L${P(62, -5)}Z`;
})();

const bars: AttitudeBall['bars'] = [
  { pitch: 5, half: mm(9.5) }, { pitch: -5, half: mm(9.5) },
  { pitch: 10, half: mm(53) }, { pitch: -10, half: mm(53) },
  { pitch: 15, half: mm(9), label: ['CLI', 'MB'] }, { pitch: -15, half: mm(9), label: ['DI', 'VE'] },
  { pitch: 20, half: mm(57) }, { pitch: -20, half: mm(57) },
  // Beyond the image: long bars every 10° (extrapolated).
  ...[30, 40, 50, 60, 70, 80].flatMap(v => [{ pitch: v, half: mm(57) }, { pitch: -v, half: mm(57) }]),
];
const tick = (angle: number, r0: number, r1: number, w: number) => ({ angle, r: [mm(r0), mm(r1)] as [number, number], width: mm(w) });

const ball: AttitudeBall = {
  bezel: mm(128), face: mm(113), window: mm(84),
  deg: mm(2.85),
  bars,
  label: { cap: mm(9), gap: mm(11), widths: { CLI: mm(17), MB: mm(16), DI: mm(13), VE: mm(15) } },
  pointer: [mm(86), mm(64), mm(7)],
  index: [mm(88), mm(110), mm(8)],
  ticks: [
    ...[10, 20].flatMap(v => [tick(180 - v, 88, 104, 4), tick(180 + v, 88, 104, 4)]),
    tick(150, 86, 109, 4.5), tick(210, 86, 109, 4.5),
    tick(120, 87, 108, 5), tick(240, 87, 108, 5),
    tick(90, 85.5, 108.5, 5.5), tick(270, 85.5, 108.5, 5.5),
  ],
  aircraft: {
    wings: path('M-63 -2H-25V2H-63ZM25 -2H63V2H25Z'),
    w: path('M-28 5Q-18.5 23 -9 6M9 6Q18.5 23 28 5'),
    dot: mm(6),
  },
  flag: { shown: [mm(34), mm(-9), mm(52), mm(18)], hidden: [mm(59), mm(6), mm(27), mm(5)], cap: mm(9) },
};

export const sai: PanelSpec = {
  id: 'sai',
  title: 'Standby attitude indicator',
  canvas: [mm(330), mm(326)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 49,
    image: 'p. 49 "Standby Attitude Indicator (SAI)" image, 329 x 314 px',
    rectify: 'python3 -I scripts/panel-trace.py <p49-002.png> <scratch> 22,14=22,14 296,13=296,14 23,282=22,288 297,281=296,288 330 320 (the corner screws to a square; the bottom right screw is under the knob and taken by symmetry)',
    pxPerMm: PX,
    scale: 'The SAI is taken as a 3-inch class instrument like the altimeter: its corner screws (274 px apart) are drawn the altimeter\'s 79.6 mm apart, giving 3.44 px/mm; the screw heads (about 18 px) are then the shared `screw-medium`.',
    shown: { pitch: '-1', roll: '-6', 'off-flag': 'hidden', 'pitch-trim': 'zero', cage: 'in' },
    unresolved: [
      'The sphere is drawn black on white with a faint ground half; in the sim the sky is light blue and the ground dark brown.',
      'Only ±20° of the sphere shows in the image. Its pitch scale is taken as linear (2.85 px a degree) and the long bars every 10° beyond 20° are extrapolated, unlabelled.',
      'The OFF flag is mostly out of sight in the image (only its tip shows at the right of the window); its shown size and place are not in the image and are drawn as a red flag across the right of the window. The guide says it is red.',
      'The pitch trim scale reads ±25° (guide text). Its ticks are 9° apart round the knob from 9 o\'clock to 12 o\'clock, and its middle mark is drawn as a triangle; which way the knob turns for nose up, and its arrow, are not shown.',
      'PULL TO CAGE is printed curved round the knob face in the sim; it is set straight here. Pulling the knob shows its side as a second rim.',
      'The aircraft symbol is drawn fixed at the window centre; the pitch trim knob moves it up and down in the sim (no systems logic here).',
      'Physical size rests on the corner screws: the guide gives no dimension.',
    ],
  },
  plate: [
    { d: path('M2 1H328V318H2Z') },
  ],
  engraving: [
    ...trimTicks.map(t => ({ kind: 'path' as const, pen: t.major ? 'heavy' as const : 'medium' as const, d: path(t.d) })),
    { kind: 'path', pen: 'medium', d: path(idx) },
  ],
  placements: [
    ...[[22, 14], [296, 14], [22, 288]].map(([x, y]) => ({ component: 'screw-medium' as const, at: pt(x, y) })),
    { component: 'screw-small', at: pt(296, 231) },
    { component: 'screw-small', at: pt(234, 292) },
    { component: 'attitude', at: pt(...C), ball },
    {
      component: 'cage-knob', control: 'pitch-trim', pull: 'cage', at: pt(...K), r: mm(38), face: mm(33),
      legend: [
        { text: 'PULL', at: pt(-1, -22), cap: mm(12), width: mm(36) },
        { text: 'TO', at: pt(0, 0), cap: mm(12), width: mm(20) },
        { text: 'CAGE', at: pt(0, 21), cap: mm(12), width: mm(40) },
      ],
    },
  ],
  controls: [
    {
      id: 'pitch-trim', name: 'PULL TO CAGE knob (turn)', type: 'rotary',
      positions: Array.from({ length: 11 }, (_, k) => {
        const v = -25 + 5 * k;
        return { id: v === 0 ? 'zero' : v < 0 ? `down-${-v}` : `up-${v}`, label: v === 0 ? '0° (index)' : `${Math.abs(v)}° ${v < 0 ? 'down' : 'up'}`, angle: v * TRIM_DEG, hold: 'stable' as const };
      }),
      initial: 'zero',
      description: 'Turning the knob moves the aircraft symbol up or down against the sphere, read on the pitch trim scale (±25°, a mark every 5°). With the knob arrow at the white index the trim is zero. The knob turns without detents; it moves 5° a click here.',
      source: src,
    },
    {
      id: 'cage', name: 'PULL TO CAGE knob (pull)', type: 'pushbutton',
      positions: [
        { id: 'in', label: 'In', hold: 'stable' },
        { id: 'pulled', label: 'Pulled (caged)', hold: 'stable' },
      ],
      initial: 'in',
      description: 'Pulling the knob cages the sphere level whatever the aircraft\'s attitude, and the OFF flag shows. Pulled and turned anticlockwise, it locks caged. In flight, cage it wings level with the nose 4° above the horizon.',
      source: src,
    },
  ],
  indicators: [
    { id: 'pitch', name: 'Attitude sphere (pitch)', type: 'display', unit: '°', rest: 0, range: [-90, 90, 1], description: 'Pitch against the aircraft symbol: the light half (sky) above the horizon in a climb, the dark half (ground) in a dive. Bars every 5° near the horizon, CLIMB and DIVE at 15°. The SAI sits 4° nose down against the ADI when both are at their pitch trim index.', source: src },
    { id: 'roll', name: 'Attitude sphere (bank)', type: 'display', unit: '°', rest: 0, range: [-180, 180, 1], description: 'Bank: the pointer on the sphere against the fixed bank scale (10° and 20° short marks, 30°, 60° and 90° long marks) and the white triangle index at 0°.', source: src },
    { id: 'off-flag', name: 'OFF flag', type: 'display', pages: [{ id: 'hidden', label: 'Hidden' }, { id: 'shown', label: 'Shown' }], restPage: 'shown', description: 'Red OFF flag: the SAI is caged or has lost electrical power.', source: src },
  ],
};
