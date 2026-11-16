import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C Interior LIGHTING panel (right console), DCS.
 *
 * Reference: the guide's p. 76 "Interior LIGHTING Control Panel" cockpit image
 * (440 x 352 JPEG, extracted with `pdfimages -j -f 76 -l 76`, image 002). The
 * camera is nearly square-on, so it is traced unrectified. Measurements below
 * are in reference pixels and stored in mm.
 */
const PX = 3.1;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 76';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
/** A curved arrow from a to tip through control point c, with an open head at the tip (reference px). */
const arrow = (a: [number, number], c: [number, number], tip: [number, number]) => {
  const dx = tip[0] - c[0], dy = tip[1] - c[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, h = 6, w = 3.5;
  const b = [tip[0] - ux * h, tip[1] - uy * h];
  return path(`M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${tip[0]} ${tip[1]}M${(b[0] - uy * w).toFixed(1)} ${(b[1] + ux * w).toFixed(1)}L${tip[0]} ${tip[1]}L${(b[0] + uy * w).toFixed(1)} ${(b[1] - ux * w).toFixed(1)}`);
};
/** Knob centres, squared under their titles. */
const P_CONS: [number, number] = [100, 88], P_INST: [number, number] = [225, 88], P_DED: [number, number] = [349, 88];
/** FLOOD CONSOLES sits at its collar's centre (collar edges measured x 61/136, y 227/303); the tall knob's top looks lower only through the camera. */
const F_CONS: [number, number] = [98, 265], F_INST: [number, number] = [237, 272];
/** Four detents for the continuous dimmers, 90° apart (fully anticlockwise is off). */
const dimmer = [
  { id: 'off', label: 'Off', angle: -135, hold: 'stable' as const },
  { id: 'dim', label: 'Dim', angle: -45, hold: 'stable' as const },
  { id: 'mid', label: 'Medium', angle: 45, hold: 'stable' as const },
  { id: 'brt', label: 'BRT', angle: 135, hold: 'stable' as const },
];
/** FLOOD CONSOLES: OFF and HIGH INT ticks measured on the collar (-159° and 167°); two detents between them, evenly spaced. */
const FLOOD_OFF = -159, FLOOD_HIGH = 167;
const floodCons = [
  { id: 'off', label: 'OFF', angle: FLOOD_OFF, hold: 'stable' as const },
  { id: 'dim', label: 'Dim', angle: FLOOD_OFF + (FLOOD_HIGH - FLOOD_OFF) / 3, hold: 'stable' as const },
  { id: 'brt', label: 'Bright', angle: FLOOD_OFF + (2 * (FLOOD_HIGH - FLOOD_OFF)) / 3, hold: 'stable' as const },
  { id: 'high-int', label: 'HIGH INT', angle: FLOOD_HIGH, hold: 'stable' as const },
];
const tick = (c: [number, number], a: number, r0: number, r1: number) => {
  const s = Math.sin(a * Math.PI / 180), k = -Math.cos(a * Math.PI / 180);
  return `M${(c[0] + r0 * s).toFixed(1)} ${(c[1] + r0 * k).toFixed(1)}L${(c[0] + r1 * s).toFixed(1)} ${(c[1] + r1 * k).toFixed(1)}`;
};

export const interiorLighting: PanelSpec = {
  id: 'interior-lighting',
  title: 'Interior LIGHTING panel',
  canvas: [mm(440), mm(352)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 76,
    image: 'p. 76 "Interior LIGHTING Control Panel" cockpit image, 440 x 352 px',
    rectify: 'not rectified: the camera is nearly square-on; the four DZUS were fitted at (19.5, 45.5), (423.5, 48.5), (18, 313) and (417.5, 309.5)',
    pxPerMm: PX,
    scale: 'Same scale as the other right-console panel images (3.1 px/mm); the DZUS heads (about 25 px across) match the shared 8.5 mm head.',
    shown: { 'primary-consoles': 'off', 'primary-inst-pnl': 'off', 'primary-ded': 'brt', 'flood-consoles': 'off', 'flood-inst-pnl': 'off', 'mal-ind-lts': 'brt' },
    unresolved: [
      'The knob detents are not marked on the plate apart from FLOOD CONSOLES OFF and HIGH INT; the dimmers are modelled with four evenly spaced detents.',
      'The DATA ENTRY DISPLAY knob points between two modelled detents in the reference; it is shown at BRT.',
      'The DZUS sit a few px lower on the right in the unrectified reference; the corner notches and fasteners are drawn mirrored left to right at the mean heights.',
    ],
  },
  plate: [
    { d: path('M6 2H434Q438 2 438 6V346Q438 350 434 350H6Q2 350 2 346V6Q2 2 6 2Z') },
    // Raised face, notched round the four corner DZUS. Notch edges measured by
    // brightness gradient (px): TL x 34.5, bottom about 62; TR x 407.5, bottom
    // about 60 (meets the fastener rim); BL x 33–35, top 294–299; BR x 400.5,
    // top about 297. Drawn mirrored: x 34 / 406, top notches to y 62, bottom
    // notches from y 297, inner corners rounded at 12 px (the source rounds them
    // close to the fastener radius).
    { d: path('M34 2H406V50Q406 62 418 62H438V297H418Q406 297 406 309V350H34V309Q34 297 22 297H2V62H22Q34 62 34 50Z'), raised: true },
  ],
  engraving: [
    // Vertical panel name.
    ...[...'LIGHTING'].map((t, i) => L([17, 110 + 20 * i], t, 13, t === 'I' ? 3 : 10)),
    // PRIMARY group.
    L([224, 17], 'PRIMARY', 10, 50),
    { kind: 'path', pen: 'medium', d: path('M96 17H192M256 17H346') },
    L([P_CONS[0], 37], 'CONSOLES', 10, 54),
    L([P_INST[0], 38], 'INST PNL', 10, 50),
    L([P_DED[0], 30], 'DATA ENTRY', 10, 66),
    L([P_DED[0], 44], 'DISPLAY', 10, 48),
    ...[P_CONS, P_INST, P_DED].flatMap(([x]) => [
      { kind: 'path' as const, d: arrow([x + 34, 55], [x + 43, 66], [x + 45, 84]) },
      L([x + 47, 97], 'BRT', 10, 22),
    ]),
    // FLOOD group.
    L([167, 186], 'FLOOD', 10, 40),
    { kind: 'path', pen: 'medium', d: path('M94 186H143M191 186H239') },
    L([F_CONS[0], 203], 'CONSOLES', 10, 54),
    // Collar round the FLOOD CONSOLES knob (r 38 px), with the OFF and HIGH INT ticks.
    // Written in mm directly: path() would scale the arc flags.
    { kind: 'path', pen: 'medium', d: `M${mm(F_CONS[0] - 38)} ${mm(F_CONS[1])}A${mm(38)} ${mm(38)} 0 1 0 ${mm(F_CONS[0] + 38)} ${mm(F_CONS[1])}A${mm(38)} ${mm(38)} 0 1 0 ${mm(F_CONS[0] - 38)} ${mm(F_CONS[1])}Z` },
    { kind: 'path', pen: 'medium', d: path(tick(F_CONS, FLOOD_OFF, 38, 45) + tick(F_CONS, FLOOD_HIGH, 38, 45)) },
    L([75, 322], 'OFF', 10, 20),
    L([126, 322], 'HIGH INT', 10, 50),
    L([F_INST[0], 220], 'INST PNL', 10, 50),
    { kind: 'path', d: arrow([270, 242], [279, 253], [280, 270]) },
    L([284, 283], 'BRT', 10, 22),
    // MAL & IND LTS.
    L([344, 203], 'MAL &', 10, 34),
    L([344, 216], 'IND LTS', 10, 44),
    L([344, 236], 'BRT', 10, 22),
    L([344, 299], 'DIM', 10, 20),
    // Printed cross between the PRIMARY knobs and the screws.
    { kind: 'path', pen: 'fine', d: path('M288 164H296M292 160V168') },
  ],
  placements: [
    { component: 'dzus', at: pt(19, 47) },
    { component: 'dzus', at: pt(421, 47) },
    { component: 'dzus', at: pt(19, 311) },
    { component: 'dzus', at: pt(421, 311) },
    { component: 'screw-medium', at: pt(51, 167) },
    { component: 'screw-medium', at: pt(345, 167) },
    { component: 'screw-medium', at: pt(169, 312) },
    { component: 'knob-knurled-edge', control: 'primary-consoles', at: pt(...P_CONS) },
    { component: 'knob-knurled-edge', control: 'primary-inst-pnl', at: pt(...P_INST) },
    { component: 'knob-knurled-edge', control: 'primary-ded', at: pt(...P_DED) },
    { component: 'knob-knurled-skirt', control: 'flood-consoles', at: pt(...F_CONS) },
    { component: 'knob-lobed', control: 'flood-inst-pnl', at: pt(...F_INST) },
    { component: 'toggle-medium', control: 'mal-ind-lts', at: pt(344, 267) },
  ],
  controls: [
    {
      id: 'primary-consoles', name: 'PRIMARY CONSOLES knob', type: 'rotary', positions: dimmer, initial: 'off',
      description: 'Sets the brightness of the panel backlighting on the left auxiliary console, left console and right console.',
      source: src,
    },
    {
      id: 'primary-inst-pnl', name: 'PRIMARY INST PNL knob', type: 'rotary', positions: dimmer, initial: 'off',
      description: 'Sets the brightness of the panel backlighting on the instrument panel and right auxiliary console. Turning it fully anticlockwise also sets the malfunction and indicator lights to BRT.',
      source: src,
    },
    {
      id: 'primary-ded', name: 'PRIMARY DATA ENTRY DISPLAY knob', type: 'rotary', positions: dimmer, initial: 'brt',
      description: 'Sets the brightness of the DED and PFLD displays.',
      source: src,
    },
    {
      id: 'flood-consoles', name: 'FLOOD CONSOLES knob', type: 'rotary', positions: floodCons, initial: 'off',
      description: 'Sets the flood light intensity on the left auxiliary console, left console and right console. Turning it past the HIGH INT detent also sets the malfunction and indicator lights to BRT.',
      source: src,
    },
    {
      id: 'flood-inst-pnl', name: 'FLOOD INST PNL knob', type: 'rotary', positions: dimmer, initial: 'off',
      description: 'Sets the flood light intensity on the instrument panel and right auxiliary console.',
      source: src,
    },
    {
      id: 'mal-ind-lts', name: 'MAL & IND LTS switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'brt', label: 'BRT', hold: 'stable' }, { id: 'dim', label: 'DIM', hold: 'stable' }],
      initial: 'brt',
      description: 'Sets the malfunction and indicator lights and the CMDS expendable counters to BRT or DIM. BRT is selected automatically if the FLOOD CONSOLES knob goes past HIGH INT, if the PRIMARY INST PNL knob is turned fully anticlockwise, or if emergency DC power is lost.',
      source: src,
    },
  ],
  indicators: [],
};
