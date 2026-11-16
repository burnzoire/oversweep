import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C ELEC control panel (left console), DCS.
 *
 * Reference: the guide's p. 64 cockpit image (330 x 440 JPEG, extracted with
 * `pdfimages -j -f 64 -l 64`), rectified on the four DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p64.jpg> <out> 22,67=28,64 307,59=304,64 40,387=28,390 309,392=304,390 332 442
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 4.54;
const { pt, mm, path } = tracer(PX);
/** Lamp module: fixed component size, cells split top/bottom. */
const LW = mm(70), LH = mm(76);
const cellTop = [0.9, 0.9, LW - 1.8, (LH - 1.8) / 2] as [number, number, number, number];
const cellBot = [0.9, 0.9 + (LH - 1.8) / 2, LW - 1.8, (LH - 1.8) / 2] as [number, number, number, number];
const cellAll = [0.9, 0.9, LW - 1.8, LH - 1.8] as [number, number, number, number];
const src = 'DCS F-16C guide p. 64';
const src2 = 'DCS F-16C guide pp. 64–65';

export const elec: PanelSpec = {
  id: 'elec',
  title: 'ELEC control panel',
  canvas: [mm(330), mm(442)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 64,
    image: 'p. 64 "ELEC Control Panel" cockpit image, 330 x 440 px',
    rectify: 'python3 -I scripts/panel-trace.py <p64.jpg> <out> 22,67=28,64 307,59=304,64 40,387=28,390 309,392=304,390 332 442',
    pxPerMm: PX,
    shown: { 'main-pwr': 'main-pwr' },
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads match. The FUEL panel fixes that size (its full width taken as a standard 5.75 in console panel).',
    unresolved: [
      'Left, top and bottom plate edges are cropped in the reference; the drawn edges sit just inside the crop.',
      'The lower edge of the MAIN PWR bushing is hidden by the lever in the reference.',
      'The lamp modules differ by up to 2 px in the rectified image; one module size is used for all five.',
    ],
  },
  plate: [
    { d: path('M9 0H321Q325 0 325 4V438Q325 442 321 442H9Q5 442 5 438V4Q5 0 9 0Z') },
    { raised: true, d: path('M13 5H178Q182 5 182 9V292Q182 297 187 297H258Q263 297 263 302V333Q263 338 258 338H13Q9 338 9 334V9Q9 5 13 5Z') },
  ],
  engraving: [
    { kind: 'text', at: pt(99, 32), text: 'MAIN PWR', cap: mm(14), width: mm(76) },
    { kind: 'text', at: pt(149, 81), text: 'BATT', cap: mm(15), width: mm(41) },
    { kind: 'text', at: pt(95, 128), text: 'OFF', cap: mm(14), width: mm(28) },
    { kind: 'text', at: pt(78, 173), text: '+', cap: mm(10) },
    { kind: 'text', at: pt(122, 184), text: 'CAUTION', cap: mm(14), width: mm(65) },
    { kind: 'text', at: pt(122, 204), text: 'RESET', cap: mm(14), width: mm(48) },
    { kind: 'text', at: pt(20, 172), text: 'E', cap: mm(20), width: mm(12) },
    { kind: 'text', at: pt(20, 198), text: 'L', cap: mm(20), width: mm(12) },
    { kind: 'text', at: pt(20, 225), text: 'E', cap: mm(20), width: mm(12) },
    { kind: 'text', at: pt(20, 251), text: 'C', cap: mm(20), width: mm(12) },
    { kind: 'path', d: path('M97 321H128M222 321H253') },
    { kind: 'text', at: pt(175, 321), text: 'ACFT BATT', cap: mm(16), width: mm(86) },
  ],
  placements: [
    { component: 'dzus', at: pt(26, 64) },
    { component: 'dzus', at: pt(304, 64) },
    { component: 'dzus', at: pt(25, 390) },
    { component: 'dzus', at: pt(304, 390) },
    { component: 'screw', at: pt(147, 123) },
    { component: 'screw', at: pt(61, 293) },
    { component: 'screw-small', at: pt(77, 370) },
    { component: 'toggle-large-cylinder', control: 'main-pwr', at: pt(97, 81) },
    { component: 'push-round-large', control: 'caution-reset', at: pt(122, 257) },
    { component: 'lamp-module', at: pt(192, 48), size: [LW, LH], lamps: [
      { indicator: 'flcs-pmg', legend: 'FLCS PMG', rect: cellTop, width: mm(49) },
      { indicator: 'main-gen', legend: 'MAIN GEN', rect: cellBot, width: mm(49) },
    ] },
    { component: 'lamp-module', at: pt(192, 128), size: [LW, LH], lamps: [
      { indicator: 'stby-gen', legend: 'STBY GEN', rect: cellTop, width: mm(49) },
    ] },
    { component: 'lamp-module', at: pt(192, 210), size: [LW, LH], lamps: [
      { indicator: 'epu-gen', legend: 'EPU GEN', rect: cellTop, width: mm(46) },
      { indicator: 'epu-pmg', legend: 'EPU PMG', rect: cellBot, width: mm(47) },
    ] },
    { component: 'lamp-module', at: pt(104, 347), size: [LW, LH], lamps: [
      { indicator: 'to-flcs', legend: 'TO FLCS', rect: cellTop, width: mm(44) },
      { indicator: 'flcs-rly', legend: 'FLCS RLY', rect: cellBot, width: mm(51) },
    ] },
    { component: 'lamp-module', at: pt(192, 347), size: [LW, LH], lamps: [
      { indicator: 'acft-batt-fail', legend: 'FAIL', rect: cellAll, width: mm(25) },
    ] },
  ],
  controls: [
    {
      id: 'main-pwr', name: 'MAIN PWR switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'main-pwr', label: 'MAIN PWR', hold: 'stable' },
        { id: 'batt', label: 'BATT', hold: 'stable' },
        { id: 'off', label: 'OFF', hold: 'stable' },
      ],
      initial: 'off',
      protections: [{
        kind: 'latch', verified: false,
        note: 'Large, mechanically latched three-position switch. In DCS it moves with a plain click on the upper or lower half; the real lever-lock release is not simulated here.',
      }],
      description: 'Selects the electrical power source. MAIN PWR connects the main generator or external power and enables the standby generator. BATT disconnects them, resets the main generator and puts battery power on the battery bus only. OFF disconnects the main generator and external power and disables the standby generator.',
      source: src,
    },
    {
      id: 'caution-reset', name: 'ELEC CAUTION RESET button', type: 'pushbutton',
      positions: [
        { id: 'out', label: 'Released', hold: 'stable' },
        { id: 'in', label: 'Pressed', hold: 'momentary', spring: 'out' },
      ],
      initial: 'out',
      description: 'Clears the MASTER CAUTION and ELEC SYS caution lights and resets the main and standby generators.',
      source: src2,
    },
  ],
  indicators: [
    { id: 'flcs-pmg', name: 'FLCS PMG light', type: 'lamp', colour: 'amber', description: 'In flight, lit if no FLCS branch is receiving power from the FLCS permanent magnet generator. On the ground, lit after 60 seconds on the wheels if one or more branches are not receiving PMG power.', source: src2 },
    { id: 'main-gen', name: 'MAIN GEN light', type: 'lamp', colour: 'amber', description: 'Lit when no external or main generator power is connected to the non-essential AC buses.', source: src2 },
    { id: 'stby-gen', name: 'STBY GEN light', type: 'lamp', colour: 'amber', description: 'Lit when standby generator power is not available.', source: src2 },
    { id: 'epu-gen', name: 'EPU GEN light', type: 'lamp', colour: 'amber', description: 'Lit when the EPU has been commanded on but is not powering both emergency buses. Inhibited on the ground with the engine running and the EPU switch OFF.', source: src2 },
    { id: 'epu-pmg', name: 'EPU PMG light', type: 'lamp', colour: 'amber', description: 'Lit when the EPU has been commanded on but its permanent magnet generator is not powering all FLCS branches.', source: src2 },
    { id: 'acft-batt-fail', name: 'ACFT BATT FAIL light', type: 'lamp', colour: 'amber', description: 'In flight, battery failure (20 volts or less). On the ground, after 60 seconds on the wheels, battery or battery charger failure.', source: src2 },
    { id: 'to-flcs', name: 'ACFT BATT TO FLCS light', type: 'lamp', colour: 'amber', description: 'On the ground, lit when battery power is going to one or more FLCS branches. In flight, lit if one or more branches are on the battery bus at 25 volts or less.', source: src2 },
    { id: 'flcs-rly', name: 'ACFT BATT FLCS RLY light', type: 'lamp', colour: 'amber', description: 'Lit if one or more FLCS branches get less than 20 volts from the battery bus or are not connected to it. Reset with FLCS RESET on the FLT CONTROL panel.', source: src2 },
  ],
};
