import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C EXT LIGHTING control panel (left console), DCS.
 *
 * Reference: the guide's p. 69 "EXT LIGHTING Control Panel" cockpit image
 * (484 x 284 JPEG, extracted with `pdfimages -j -f 69 -l 69`), rectified on the
 * four DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p69.jpg> <out> 19,46.5 462,46.3 16,242 464.7,243
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 3.3;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 69–70';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
/** A curved arrow from a to tip through control point c, with an open head at the tip (reference px). */
const arrow = (a: [number, number], c: [number, number], tip: [number, number]) => {
  const dx = tip[0] - c[0], dy = tip[1] - c[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, h = 6, w = 3.5;
  const b = [tip[0] - ux * h, tip[1] - uy * h];
  return path(`M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${tip[0]} ${tip[1]}M${(b[0] - uy * w).toFixed(1)} ${(b[1] + ux * w).toFixed(1)}L${tip[0]} ${tip[1]}L${(b[0] + uy * w).toFixed(1)} ${(b[1] - ux * w).toFixed(1)}`);
};
const AC: [number, number] = [87, 76];   // ANTI-COLL knob (centre from its legend ring and lit face)
const MS: [number, number] = [238, 222]; // MASTER knob
/** ANTI-COLL detents, evenly spaced; legends sit on a circle round the knob along each detent. */
const ACP = ['OFF', '1', '2', '3', '4', 'A', 'B', 'C'].map((t, i) => ({ t, angle: -150 + 38 * i }));
const acLegend = (a: number, rr: number): [number, number] =>
  [+(AC[0] + rr * Math.sin(a * Math.PI / 180)).toFixed(1), +(AC[1] - rr * Math.cos(a * Math.PI / 180)).toFixed(1)];
/** Four detents for the continuous dimmers, 90° apart; the reference shows both at OFF. */
const dimmer = [
  { id: 'off', label: 'OFF', angle: -135, hold: 'stable' as const },
  { id: 'dim', label: 'DIM', angle: -45, hold: 'stable' as const },
  { id: 'mid', label: 'MEDIUM', angle: 45, hold: 'stable' as const },
  { id: 'brt', label: 'BRT', angle: 135, hold: 'stable' as const },
];

export const extLighting: PanelSpec = {
  id: 'ext-lighting',
  title: 'EXT LIGHTING control panel',
  canvas: [mm(484), mm(284)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 69,
    image: 'p. 69 "EXT LIGHTING Control Panel" cockpit image, 484 x 284 px',
    rectify: 'python3 -I scripts/panel-trace.py <p69.jpg> <out> 19,46.5 462,46.3 16,242 464.7,243',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads (about 28 px) match.',
    shown: { 'anti-coll': 'off', flash: 'steady', 'wing-tail': 'off', fuselage: 'off', form: 'off', master: 'norm', 'aerial-refueling': 'off' },
    unresolved: [
      'FORM and AERIAL REFUELING are continuous dimmers; they are modelled with four detents 90° apart (OFF to BRT). Where the dimmer stops at each end is not shown.',
      'The ANTI-COLL legends look unevenly spaced in the reference because of the camera angle; the detents are drawn evenly, 38° apart, with each legend on its detent line.',
      'The plate edges are cropped in the reference; the drawn edges sit just inside the crop.',
      'All three toggles show the orange-red grommet of plain toggles.',
    ],
  },
  plate: [
    { d: path('M6 2H478Q482 2 482 6V278Q482 282 478 282H6Q2 282 2 278V6Q2 2 6 2Z') },
    // Raised face plate, cut away round the four corner DZUS.
    // Edges measured from the reference by brightness gradient (px): TL x 35.5 / y 66,
    // TR x 445.5 / y 64.5, BL x 34.5 / y 223.5, BR x 443.5 / y 222.5; inner corner
    // radius 14 px (measured about 10 px at BR, enlarged on review against the source).
    { d: path('M35.5 2H445.5V50.5Q445.5 64.5 459.5 64.5H482V222.5H457.5Q443.5 222.5 443.5 236.5V282H34.5V237.5Q34.5 223.5 20.5 223.5H2V66H21.5Q35.5 66 35.5 52Z'), raised: true },
  ],
  engraving: [
    // Vertical "EXT" and "LIGHTING".
    ...([['E', 122], ['X', 140], ['T', 163]] as const).map(([t, y]) => L([15, y], t, 14, 9)),
    ...([['L', 0], ['I', 1], ['G', 2], ['H', 3], ['T', 4], ['I', 5], ['N', 6], ['G', 7]] as const).map(([t, k]) => [t, 76 + 19.4 * k] as const).map(([t, y]) => t === 'I' ? L([37, y], t, 14) : L([37, y], t, 14, 9)),
    // ANTI-COLL selector.
    L([AC[0], 18], 'ANTI-COLL', 12, 68),
    ...ACP.map(({ t, angle }) => t === 'OFF' ? L(acLegend(angle, 40), t, 10, 20) : L(acLegend(angle, 34), t, 10)),
    // POSITION switches.
    L([240, 14], 'POSITION', 12, 55),
    { kind: 'path', d: path('M193 14H210M270 14H287') },
    L([194, 35], 'FLASH', 10, 40),
    L([194, 116], 'STEADY', 10.5, 47),
    L([288, 35], 'WING/TAIL', 12, 67),
    L([397, 35], 'FUSELAGE', 12, 62),
    L([342.5, 62], 'BRT', 10, 23),
    L([342.5, 95], 'OFF', 10, 22),
    L([342.5, 129], 'DIM', 10, 20),
    { kind: 'path', d: path('M287 62H328M358 62H398M313 95H326M358 95H371M287 129H328M358 129H398') },
    // FORM dimmer.
    L([97, 174], 'FORM', 12, 33),
    L([154, 235], 'BRT', 10, 22),
    { kind: 'path', d: arrow([138, 185], [153, 196], [155, 222]) },
    // MASTER selector.
    L([238, 137], 'MASTER', 12, 48),
    L([238, 157], 'COVERT', 10, 38),
    { kind: 'path', d: path('M215 150H261V164H215Z') },
    { kind: 'path', d: path('M197 178Q203 160 215 157M261 157Q273 160 279 178') },
    L([238, 172], 'A-C', 10, 22),
    L([196, 183], 'ALL', 10, 22),
    L([280, 183], 'FORM', 10, 32),
    L([182, 222], 'OFF', 10, 22),
    L([299, 222], 'NORM', 10, 32),
    L([300, 193], '+', 8),
    { kind: 'path', d: path(`M208 191L213 196M${MS[0]} 179V185M268 191L263 196M193 222H201M274 222H283`) },
    // AERIAL REFUELING dimmer.
    L([368, 165], 'AERIAL REFUELING', 12, 112),
    L([421, 231], 'BRT', 10, 22),
    { kind: 'path', d: arrow([400, 177], [414, 190], [418, 218]) },
  ],
  placements: [
    { component: 'dzus', at: pt(17.5, 46.4) },
    { component: 'dzus', at: pt(462, 46.4) },
    { component: 'dzus', at: pt(17.5, 242.4) },
    { component: 'dzus', at: pt(462, 242.4) },
    { component: 'screw-medium', at: pt(147, 22) },
    { component: 'screw-medium', at: pt(342, 22) },
    { component: 'screw-medium', at: pt(187, 248) },
    { component: 'knob-knurled-small', control: 'anti-coll', at: pt(...AC) },
    { component: 'toggle-large', control: 'flash', at: pt(194, 75.5) },
    { component: 'toggle-large', control: 'wing-tail', at: pt(288, 95) },
    { component: 'toggle-large', control: 'fuselage', at: pt(397, 95) },
    { component: 'knob-knurled', control: 'form', at: pt(97, 222) },
    { component: 'knob-bar-thick', control: 'master', at: pt(...MS) },
    { component: 'knob-lobed', control: 'aerial-refueling', at: pt(368, 220) },
  ],
  controls: [
    {
      id: 'anti-coll', name: 'ANTI-COLL knob', type: 'rotary',
      positions: [
        ...ACP.map(({ t, angle }) => ({ id: t.toLowerCase(), label: t, angle, hold: 'stable' as const })),
      ],
      initial: 'off',
      description: 'Turns the anti-collision strobe on the tail off, or selects one of its seven flash patterns (1 to 4, A to C).',
      source: src,
    },
    {
      id: 'flash', name: 'POSITION FLASH/STEADY switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'flash', label: 'FLASH', hold: 'stable' }, { id: 'steady', label: 'STEADY', hold: 'stable' }],
      initial: 'steady',
      description: 'Makes the wing and tail position lights flash or burn steady.',
      source: src,
    },
    {
      id: 'wing-tail', name: 'POSITION WING/TAIL switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'brt', label: 'BRT', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }, { id: 'dim', label: 'DIM', hold: 'stable' }],
      initial: 'off',
      description: 'Sets the red and green wingtip and intake position lights and the white tail position light to bright or dim. At OFF the wingtip lights follow the FORM knob instead.',
      source: src,
    },
    {
      id: 'fuselage', name: 'FUSELAGE switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'brt', label: 'BRT', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }, { id: 'dim', label: 'DIM', hold: 'stable' }],
      initial: 'off',
      description: 'Sets the fuselage lights that light the vertical tail to bright, dim or off.',
      source: src,
    },
    {
      id: 'form', name: 'FORM knob', type: 'rotary', positions: dimmer, initial: 'off',
      description: 'Sets the brightness of the formation lights: red and green on each wingtip and white on the top and bottom of the centre fuselage. It works on the wingtip lights only with the WING/TAIL switch at OFF.',
      source: src,
    },
    {
      id: 'master', name: 'MASTER knob', type: 'rotary',
      positions: [
        { id: 'off', label: 'OFF', angle: -90, hold: 'stable' },
        { id: 'all', label: 'COVERT ALL', angle: -45, hold: 'stable' },
        { id: 'a-c', label: 'COVERT A-C', angle: 0, hold: 'stable' },
        { id: 'form', label: 'COVERT FORM', angle: 45, hold: 'stable' },
        { id: 'norm', label: 'NORM', angle: 90, hold: 'stable' },
      ],
      initial: 'off',
      description: 'Sets the exterior lighting master mode. OFF turns every exterior light off. COVERT ALL keeps every light off except the air refueling lights. COVERT A-C keeps only the anti-collision light off. COVERT FORM keeps the position, fuselage and formation lights off. NORM hands every light to its own switch or knob. The air refueling lights also need AR REFUEL open on the FUEL panel.',
      source: src,
    },
    {
      id: 'aerial-refueling', name: 'AERIAL REFUELING knob', type: 'rotary', positions: dimmer, initial: 'off',
      description: 'Sets the brightness of the lights on the dorsal refueling receptacle, for the boom operator at night. Works only with AR REFUEL on the FUEL panel at OPEN.',
      source: src,
    },
  ],
  indicators: [],
};
