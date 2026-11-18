import type { PanelSpec, Rect } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C TEST panel (left console, aft of the ELEC and EPU panels), DCS.
 *
 * Reference: the guide's p. 72 "TEST Panel" cockpit image (237 x 323 JPEG,
 * extracted with `pdfimages -j -f 72 -l 72`, the smaller of the two JPEGs).
 * The camera is almost square-on (both DZUS heads on one row, the TEST
 * letters, lamp module and legends upright), so the image is used as is:
 *   python3 -I scripts/panel-trace.py <p72-013.png> <out> 61,10=61,18 200.5,10=200.5,18 61,300=61,308 200.5,300=200.5,308 237 331
 * (no warp: an 8 px strip is added above the crop for the plate top). The image is cropped just below the two upper DZUS and just
 * below MAINT; the panel's lower part and bottom edge come from the left
 * console overview (p. 62 image, 1152 x 608), scaled by the DZUS-to-MAINT
 * screw distance (304 px here, 127 px there, x 2.39).
 * Measurements below are in reference pixels and stored in mm.
 */
const PX = 3.35;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 72–73';
const T = (x: number, y: number, text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(x, y), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
/** FLCS PWR lamp module (2 x 2 lenses), measured 51 x 51.5 px. */
const LW = mm(51), LH = mm(51.5);
const cw = (LW - 1.8) / 2, ch = (LH - 1.8) / 2;
const cell = (c: number, r: number): Rect => [+(0.9 + c * cw).toFixed(3), +(0.9 + r * ch).toFixed(3), +cw.toFixed(3), +ch.toFixed(3)];
/** Toggle pivots on their legends' centre lines (px). */
const OBOGS: [number, number] = [129, 90.5];
const PROBE: [number, number] = [37, 202.5];
const EPUGEN: [number, number] = [113, 202.5];
const FLCS: [number, number] = [171.5, 286];

export const test: PanelSpec = {
  id: 'test',
  title: 'TEST panel',
  canvas: [mm(239), mm(392)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 72,
    image: 'p. 72 "TEST Panel" cockpit image, 237 x 323 px; lower part from the p. 62 left console overview',
    rectify: 'python3 -I scripts/panel-trace.py <p72-013.png> <out> 61,10=61,18 200.5,10=200.5,18 61,300=61,308 200.5,300=200.5,308 237 331 (no warp, 8 px added at the top: the image is square-on)',
    pxPerMm: PX,
    scale: 'DZUS heads measure 28.5 px (8.5 mm), giving 3.35 px/mm. The toggle grommets (35 px) then match toggle-large, the white test-button caps (37.5 px across) push-round-flat, and the FLCS PWR TEST bushing the MAIN PWR lever-lock.',
    shown: { obogs: 'off', 'probe-heat': 'heat', 'epu-gen': 'off', 'flcs-pwr-test': 'test' },
    unresolved: [
      'The top edge is cropped just above the DZUS heads. A faint step about 13 px below their centres (y 31.5) may be the edge of a raised face; it is too faint to trace, so the plate is drawn as one layer. Its top edge (y 3) is in the 8 px strip added above the crop, 15 px above the DZUS centres as scaled from the p. 62 overview.',
      'The plate is not symmetric about the two DZUS (x 5 to 234 against DZUS at 61 and 200.5); the p. 62 overview shows the same offset, so it is kept.',
      'Below MAINT the guide image is cropped. The plate bottom (y 389) and the small screw at (161, 346) are scaled from the p. 62 overview, which is too coarse to show DZUS or cut-outs on that edge; none are drawn.',
      'The FLCS PWR TEST lever hides the T of TEST; the legend is centred over the lever like MAINT.',
      'The long rule beside the FLCS PWR lights leans about 4° in the guide image while everything else is upright; it is drawn as it is printed there.',
      'The guide does not say whether PROBE HEAT TEST is spring-loaded; it is drawn as stable. FLCS PWR TEST is held at TEST and released (p. 134), so TEST springs back to NORM; MAINT is drawn stable.',
    ],
  },
  plate: [
    // One layer. Left edge x 5 and right edge x 234 by brightness step
    // (scripts/panel-edge.py rows 38–328); top 3 and bottom 389 scaled from
    // the p. 62 overview (15 px above the DZUS centres; 155 overview px below them).
    { d: path('M7 3H232Q234 3 234 5V385Q234 389 230 389H9Q5 389 5 385V5Q5 3 7 3Z') },
  ],
  engraving: [
    T(64.5, 48, 'FIRE &', 12, 35), T(63.5, 62, 'OHEAT DETECT', 12, 81),
    T(129, 48, 'OBOGS', 12, 36), T(129, 62, 'BIT', 12, 18), T(129, 119, 'OFF', 12, 28),
    T(197.5, 48, 'MAL &', 12, 31), T(197, 62, 'IND LTS', 12, 42),
    // Panel title, one letter above the next.
    T(24, 83.5, 'T', 12, 10), T(24, 100.5, 'E', 12, 10), T(24, 115.5, 'S', 12, 10), T(24, 131, 'T', 12, 10),
    T(41, 154, 'PROBE', 12, 36.5), T(39.5, 168.5, 'HEAT', 12, 29), T(74.5, 202.5, 'OFF', 12, 21), T(34, 234, 'TEST', 12, 27.5),
    T(116, 168.5, 'EPU/GEN', 12, 50), T(112, 235, 'OFF', 12, 21.5),
    T(190, 130.5, 'FLCS', 12, 28.5), T(191, 145.5, 'PWR', 12, 22.5), T(177.5, 160, 'L', 10), T(197.5, 160, 'R', 10),
    { kind: 'path', pen: 'fine', d: path('M188.5 154V166') },
    // Channel key: C H A N down the right edge, a rule left of it, and 1 over 2 against the lamp rows.
    T(226, 131, 'C', 9), T(226, 142.5, 'H', 9), T(226, 153.5, 'A', 9), T(226, 165.5, 'N', 9),
    { kind: 'path', pen: 'fine', d: path('M219.5 127V166') },
    T(223.5, 187.5, '1', 9), { kind: 'path', pen: 'fine', d: path('M219 196.5H229') }, T(223.5, 206, '2', 9),
    T(172.5, 254, 'TEST', 12, 27.5), T(210.5, 286, 'NORM', 12, 31), T(170, 315, 'MAINT', 12, 32),
    { kind: 'path', pen: 'fine', d: path('M151.5 147L140 320') },
  ],
  placements: [
    { component: 'dzus', at: pt(61, 18) },
    { component: 'dzus', at: pt(200.5, 18) },
    { component: 'screw-medium', at: pt(39, 135.5) },
    { component: 'screw-medium', at: pt(158, 135.5) },
    { component: 'screw', at: pt(204, 322) },
    { component: 'screw-small', at: pt(161, 346) },
    { component: 'push-round-flat', control: 'fire-oheat', at: pt(59, 90) },
    { component: 'push-round-flat', control: 'mal-ind-lts', at: pt(194, 90) },
    { component: 'toggle-large', control: 'obogs', at: pt(...OBOGS) },
    { component: 'toggle-large', control: 'probe-heat', at: pt(...PROBE) },
    { component: 'toggle-large', control: 'epu-gen', at: pt(...EPUGEN) },
    { component: 'toggle-large-cylinder', control: 'flcs-pwr-test', at: pt(...FLCS) },
    { component: 'lamp-module', at: pt(160, 169.5), size: [LW, LH], lamps: [
      { indicator: 'flcs-pwr-c', legend: 'C', rect: cell(0, 0), cap: mm(9) },
      { indicator: 'flcs-pwr-a', legend: 'A', rect: cell(1, 0), cap: mm(9) },
      { indicator: 'flcs-pwr-d', legend: 'D', rect: cell(0, 1), cap: mm(9) },
      { indicator: 'flcs-pwr-b', legend: 'B', rect: cell(1, 1), cap: mm(9) },
    ] },
  ],
  controls: [
    {
      id: 'fire-oheat', name: 'FIRE & OHEAT DETECT test button', type: 'pushbutton',
      positions: [{ id: 'out', label: 'Released', hold: 'stable' }, { id: 'in', label: 'Pressed', hold: 'momentary', spring: 'out' }],
      initial: 'out',
      description: 'Tests the circuit continuity of the fire and overheat detection systems. The ENG FIRE warning light and the OVERHEAT caution light come on, which in turn lights MASTER CAUTION.',
      source: src,
    },
    {
      id: 'obogs', name: 'OBOGS BIT switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'bit', label: 'BIT', hold: 'momentary', spring: 'off' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off',
      description: 'Tests the on-board oxygen generation system (OBOGS). Moved momentarily to BIT, it lights the OXY LOW warning for 10 seconds. If the monitor finds no fault the light goes out; if OXY LOW stays lit, a fault has been detected.',
      source: src,
    },
    {
      id: 'mal-ind-lts', name: 'MAL & IND LTS test button', type: 'pushbutton',
      positions: [{ id: 'out', label: 'Released', hold: 'stable' }, { id: 'in', label: 'Pressed', hold: 'momentary', spring: 'out' }],
      initial: 'out',
      description: 'Lights every warning, caution and indicator light to check they work, and tests the voice messages.',
      source: src,
    },
    {
      id: 'probe-heat', name: 'PROBE HEAT switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'heat', label: 'PROBE HEAT', hold: 'stable' },
        { id: 'off', label: 'OFF', hold: 'stable' },
        { id: 'test', label: 'TEST', hold: 'stable' },
      ],
      initial: 'off',
      description: 'Controls the air data probe heaters and the probe heat monitor on the ground; in flight the pitot, fuselage air data, AoA and total temperature probes and the monitor are always on. HEAT: heats the probes on the ground and enables the monitor. OFF: no probe heat on the ground. TEST: tests the monitor; the PROBE HEAT caution flashes after a good test. If it does not come on, or does not flash, the monitor is inoperative.',
      source: src,
    },
    {
      id: 'epu-gen', name: 'EPU/GEN test switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'test', label: 'TEST', hold: 'momentary', spring: 'off' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off',
      description: 'Held momentarily at TEST on the ground, tests the EPU generator and EPU PMG (permanent magnet generator) output to the FLCS channels without using hydrazine.',
      source: src,
    },
    {
      id: 'flcs-pwr-test', name: 'FLCS PWR TEST switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'test', label: 'TEST', hold: 'momentary', spring: 'norm' },
        { id: 'norm', label: 'NORM', hold: 'stable' },
        { id: 'maint', label: 'MAINT', hold: 'stable' },
      ],
      initial: 'norm',
      protections: [{ kind: 'latch', verified: false, note: 'Lever-lock switch (lock insert visible in the bushing). In DCS it moves with a plain click; the real pull-to-unlock is not simulated here.' }],
      description: 'Tests power output to the flight control system (FLCS) with MAIN PWR at BATT or MAIN PWR. TEST: tests output to the four FLCS channels; held during Before Engine Start and released. NORM: tests EPU PMG availability when the EPU/GEN switch is at TEST and MAIN PWR at MAIN PWR. MAINT: maintenance tests by ground crew.',
      source: `${src}; held and released per p. 134`,
    },
  ],
  indicators: ([['a', 'A'], ['b', 'B'], ['c', 'C'], ['d', 'D']] as const).map(([id, ch]) => ({
    id: `flcs-pwr-${id}`, name: `FLCS PWR ${ch} light`, type: 'lamp' as const, colour: 'green' as const,
    description: `Lit when FLCS channel ${ch} is receiving power while FLCS PWR TEST is held at TEST.`,
    source: src,
  })),
};
