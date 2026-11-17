import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C EPU (emergency power unit) control panel (left console), DCS.
 *
 * Reference: the guide's p. 64 "EPU Control Panel" cockpit image (350 x 158
 * JPEG, extracted with `pdfimages -j -f 64 -l 64`, image 002), rectified on
 * the four DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p64-002.png> <out> 26,22 327,25 33,140 335,134 350 158
 * The panel is shown as the guide shows it, as installed: its legends run
 * across the console (turned 90° clockwise), and the switch throws left/right.
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 3.25;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 64';
/** Legend turned 90° clockwise, centred on `at` (px); cap = glyph height, width = run length (px). */
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), rotate: 90, ...(width ? { width: mm(width) } : {}) });
/** Switch pivot: on the OFF/ON legends' centre line (y) and under NORM (x). */
const PIVOT: [number, number] = [94.5, 77.25];
/** Lamp module: the shared module size (ELEC), cells split top/bottom before turning. */
const LW = 15.419, LH = 16.740;
const cellTop = [0.9, 0.9, LW - 1.8, (LH - 1.8) / 2] as [number, number, number, number];
const cellBot = [0.9, 0.9 + (LH - 1.8) / 2, LW - 1.8, (LH - 1.8) / 2] as [number, number, number, number];
/** Module centre (px) on the rectified reference; `at` is its unturned top-left corner. */
const MOD: [number, number] = [271, 81.5];
/** Split guard: two covers hinged along the top edge, one over each half of the switch. */
const COVER: [number, number] = [mm(23), mm(71)];
const closedOpen = [{ id: 'closed', label: 'Closed', hold: 'stable' as const }, { id: 'open', label: 'Open', hold: 'stable' as const }];

export const epu: PanelSpec = {
  id: 'epu',
  title: 'EPU control panel',
  canvas: [mm(350), mm(158)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 64,
    image: 'p. 64 "EPU Control Panel" cockpit image, 350 x 158 px',
    rectify: 'python3 -I scripts/panel-trace.py <p64-002.png> <out> 26,22 327,25 33,140 335,134 350 158',
    pxPerMm: PX,
    scale: 'DZUS heads measure 26–28 px (8.5 mm) and the HYDRAZN/AIR module 50 x 55 px, the same module as on ELEC (15.4 x 16.7 mm); 3.25 px/mm fits both.',
    shown: { 'epu-off-cover': 'closed', 'epu-on-cover': 'closed', epu: 'norm' },
    unresolved: [
      'The plate\'s left and right edges are cropped in the reference; the drawn edges sit at the crop.',
      'The guard is drawn as two covers, one over the OFF throw and one over the ON throw, from the seam down its middle and the hinge blocks at both top corners. The guide text does not describe the guard; how the covers open in the simulator is to be confirmed.',
      'The switch bushing is mostly hidden by the guard; a silver ring shows below it rather than the orange grommet of other plain toggles. It is drawn as a large plain toggle, since a guard must be able to shut it.',
      'The guard\'s hinge blocks on the plate are not drawn.',
    ],
  },
  plate: [
    { d: path('M2 6.5H349V149.5H2Z') },
    // Raised face, notched round the four corner DZUS. Notch edges measured by
    // brightness gradient on the rectified reference (px): TL right 41, bottom
    // 37.5; TR left about 309, bottom about 37.5; BL right 46.5, top 121.5; BR
    // left 314.5, top 116.5. Plate top 6.5, bottom 149.5. Drawn mirrored about
    // the DZUS centre line (x 178): x 44 / 312; top notches to y 37.5, bottom
    // notches from y 119 (mean of 121.5 and 116.5); inner corners rounded at
    // 12 px (read off the BL notch). DZUS at the measured rows, 22.75 and 138.
    { d: path('M44 6.5H312V25.5Q312 37.5 324 37.5H349V119H324Q312 119 312 131V149.5H44V131Q44 119 32 119H2V37.5H32Q44 37.5 44 25.5Z'), raised: true },
  ],
  engraving: [
    // Title, one letter above the next (read with the panel turned): E P U.
    L([225, 18.3], 'E', 13, 8), L([206, 18.3], 'P', 13, 8), L([188.5, 18.3], 'U', 13, 8),
    L([53.5, PIVOT[1]], 'OFF', 9, 18), L([135.5, PIVOT[1]], 'ON', 9, 13), L([PIVOT[0], 122.5], 'NORM', 9, 29),
    // Printed cross.
    { kind: 'path', pen: 'fine', d: path('M175.5 53.5H183.5M179.5 49.5V57.5') },
  ],
  placements: [
    { component: 'dzus', at: pt(28.5, 22.75) },
    { component: 'dzus', at: pt(327.5, 22.75) },
    { component: 'dzus', at: pt(28.5, 138) },
    { component: 'dzus', at: pt(327.5, 138) },
    { component: 'screw', at: pt(14, 76) },
    { component: 'toggle-large', control: 'epu', at: pt(...PIVOT) },
    { component: 'guard-flip', control: 'epu-off-cover', at: pt(PIVOT[0] - 11.5, 17), size: COVER, half: 'left', rotate: 180 },
    { component: 'guard-flip', control: 'epu-on-cover', at: pt(PIVOT[0] + 11.5, 17), size: COVER, half: 'right', rotate: 180 },
    { component: 'lamp-round', indicator: 'epu-run', at: pt(199.5, 112.5) },
    { component: 'lamp-module', at: [+(mm(MOD[0]) - LW / 2).toFixed(3), +(mm(MOD[1]) - LH / 2).toFixed(3)], size: [LW, LH], rotate: 90, lamps: [
      { indicator: 'hydrazn', legend: 'HYDRAZN', rect: cellTop, cap: 2.8, width: mm(34) },
      { indicator: 'air', legend: 'AIR', rect: cellBot, cap: 2.8, width: mm(12) },
    ] },
  ],
  controls: [
    {
      id: 'epu-off-cover', name: 'EPU switch cover (OFF)', type: 'guard', positions: closedOpen, initial: 'closed',
      guards: { control: 'epu', closesTo: 'norm', when: ['off'] },
      description: 'Red cover over the OFF side of the EPU switch. Closed, it keeps the switch out of OFF; closing it with the switch at OFF pushes it back to NORM.',
      source: `${src} (image); the cover's behaviour is not in the guide text`,
    },
    {
      id: 'epu-on-cover', name: 'EPU switch cover (ON)', type: 'guard', positions: closedOpen, initial: 'closed',
      guards: { control: 'epu', closesTo: 'norm', when: ['on'] },
      description: 'Red cover over the ON side of the EPU switch. Closed, it keeps the switch out of ON; closing it with the switch at ON pushes it back to NORM.',
      source: `${src} (image); the cover's behaviour is not in the guide text`,
    },
    {
      id: 'epu', name: 'EPU switch', type: 'toggle', travel: 'horizontal',
      positions: [
        { id: 'off', label: 'OFF', hold: 'stable' },
        { id: 'norm', label: 'NORM', hold: 'stable' },
        { id: 'on', label: 'ON', hold: 'stable' },
      ],
      initial: 'norm',
      protections: [
        { kind: 'guard', guard: 'epu-off-cover', blockedWhen: 'closed', to: ['off'], verified: false, note: 'The OFF cover is closed. Open it first.' },
        { kind: 'guard', guard: 'epu-on-cover', blockedWhen: 'closed', to: ['on'], verified: false, note: 'The ON cover is closed. Open it first.' },
      ],
      description: 'Sets the EPU to automatic operation or commands it on or off. OFF: commands the EPU off on the ground, and in flight unless both the main and standby generators have failed; if the switch has stayed at OFF since takeoff, EPU operation is inhibited in flight. NORM: normal operation; if set to NORM at any time since takeoff, the EPU starts automatically when main and standby generator power is lost or both hydraulic systems fail (not on the ground with the engine shut down). ON: commands the EPU on.',
      source: src,
    },
  ],
  indicators: [
    { id: 'epu-run', name: 'EPU run light', type: 'lamp', colour: 'green', description: 'Lit when the EPU is running and its hydraulic pump discharge pressure is above 2,000 psi.', source: src },
    { id: 'hydrazn', name: 'HYDRAZN light', type: 'lamp', colour: 'amber', description: 'Lit when the EPU is running on hydrazine, which is usually needed when engine rpm drops below about 82–90 % (depending on pressure altitude) or the engine has failed.', source: src },
    { id: 'air', name: 'AIR light', type: 'lamp', colour: 'amber', description: 'Lit when the EPU is running on engine bleed air.', source: src },
  ],
};
