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
const AC: [number, number] = [82, 80];   // ANTI-COLL knob
const MS: [number, number] = [238, 222]; // MASTER knob
/** Four detents for the continuous dimmers, 90° apart; the reference shows each at the third. */
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
    shown: { 'anti-coll': 'off', flash: 'steady', 'wing-tail': 'off', fuselage: 'off', form: 'mid', master: 'norm', 'aerial-refueling': 'mid' },
    unresolved: [
      'FORM and AERIAL REFUELING are continuous dimmers; they are modelled with four detents 90° apart (OFF to BRT). Where the dimmer stops at each end is not shown.',
      'The ANTI-COLL detent angles are taken from the directions of their legends from the knob centre, so they are not evenly spaced.',
      'The plate edges are cropped in the reference; the drawn edges sit just inside the crop.',
      'All three toggles show the orange-red grommet of plain toggles.',
    ],
  },
  plate: [{ d: path('M6 2H478Q482 2 482 6V278Q482 282 478 282H6Q2 282 2 278V6Q2 2 6 2Z') }],
  engraving: [
    // Vertical "EXT" and "LIGHTING".
    ...([['E', 122], ['X', 140], ['T', 163]] as const).map(([t, y]) => L([15, y], t, 14, 9)),
    ...([['L', 70], ['I', 88], ['G', 112], ['H', 133], ['T', 155], ['I', 175], ['N', 194], ['G', 215]] as const).map(([t, y]) => t === 'I' ? L([37, y], t, 14) : L([37, y], t, 14, 9)),
    // ANTI-COLL selector.
    L([94, 18], 'ANTI-COLL', 12, 68),
    L([66, 116], 'OFF', 10, 20),
    ...([['1', 54, 95], ['2', 54, 70], ['3', 66, 49], ['4', 88, 42], ['A', 113, 49], ['B', 127, 70], ['C', 125, 95]] as const).map(([t, x, y]) => L([x, y], t, 10)),
    // POSITION switches.
    L([240, 14], 'POSITION', 12, 55),
    { kind: 'path', d: path('M193 14H210M270 14H287') },
    L([195, 35], 'FLASH', 10, 40),
    L([193, 116], 'STEADY', 10.5, 47),
    L([285, 35], 'WING/TAIL', 12, 67),
    L([397, 35], 'FUSELAGE', 12, 62),
    L([343, 62], 'BRT', 10, 23),
    L([342, 95], 'OFF', 10, 22),
    L([343, 129], 'DIM', 10, 20),
    { kind: 'path', d: path('M287 62H328M358 62H398M313 95H326M358 95H371M287 129H328M358 129H398') },
    // FORM dimmer.
    L([108, 174], 'FORM', 12, 33),
    L([154, 235], 'BRT', 10, 22),
    { kind: 'path', d: arrow([138, 185], [153, 196], [155, 222]) },
    // MASTER selector.
    L([239, 137], 'MASTER', 12, 48),
    L([239, 157], 'COVERT', 10, 38),
    { kind: 'path', d: path('M216 150H262V164H216Z') },
    { kind: 'path', d: path('M197 178Q203 160 216 157M262 157Q275 160 283 176') },
    L([239, 172], 'A-C', 10, 22),
    L([196, 183], 'ALL', 10, 22),
    L([281, 183], 'FORM', 10, 32),
    L([182, 222], 'OFF', 10, 22),
    L([299, 222], 'NORM', 10, 32),
    L([300, 193], '+', 8),
    { kind: 'path', d: path(`M208 191L213 196M${MS[0]} 179V185M268 191L263 196M193 222H201M274 222H283`) },
    // AERIAL REFUELING dimmer.
    L([369, 165], 'AERIAL REFUELING', 12, 112),
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
    { component: 'toggle-large', control: 'flash', at: pt(193, 76) },
    { component: 'toggle-large', control: 'wing-tail', at: pt(290, 95) },
    { component: 'toggle-large', control: 'fuselage', at: pt(397, 95) },
    { component: 'knob-knurled', control: 'form', at: pt(88, 225) },
    { component: 'knob-bar-thick', control: 'master', at: pt(...MS) },
    { component: 'knob-lobed', control: 'aerial-refueling', at: pt(355, 225) },
  ],
  controls: [
    {
      id: 'anti-coll', name: 'ANTI-COLL knob', type: 'rotary',
      positions: [
        { id: 'off', label: 'OFF', angle: -155, hold: 'stable' },
        { id: '1', label: '1', angle: -118, hold: 'stable' },
        { id: '2', label: '2', angle: -72, hold: 'stable' },
        { id: '3', label: '3', angle: -30, hold: 'stable' },
        { id: '4', label: '4', angle: 8, hold: 'stable' },
        { id: 'a', label: 'A', angle: 45, hold: 'stable' },
        { id: 'b', label: 'B', angle: 78, hold: 'stable' },
        { id: 'c', label: 'C', angle: 110, hold: 'stable' },
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
