import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C FUEL control panel (left console), DCS. Holds the ENG FEED knob.
 *
 * Reference: the guide's p. 67 cockpit image (445 x 177 JPEG, extracted with
 * `pdfimages -j -f 67 -l 67`). Its four DZUS fasteners already form a
 * rectangle to within 3 px, so it is used unwarped:
 *   python3 -I scripts/panel-trace.py <p67.jpg> <out> 0,0 445,0 0,177 445,177
 * Measurements below are in reference pixels and stored in mm.
 */
const PX = 434 / 146.05;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 67';

export const fuel: PanelSpec = {
  id: 'fuel',
  title: 'FUEL control panel',
  canvas: [mm(445), mm(177)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 67,
    image: 'p. 67 "FUEL Control Panel" cockpit image, 445 x 177 px',
    rectify: 'python3 -I scripts/panel-trace.py <p67.jpg> <out> 0,0 445,0 0,177 445,177',
    pxPerMm: PX,
    scale: 'Plate width (434 px) taken as a standard 5.75 in (146.05 mm) console panel. This fixes the DZUS head size used on every panel.',
    shown: { 'fuel-master-guard': 'closed', 'fuel-master': 'master', 'tank-inerting': 'off', 'eng-feed': 'norm', 'air-refuel': 'close' },
    unresolved: [
      'Levers stand proud of the panel and the camera is off-axis, so bushings appear shifted; each toggle pivot is set on the centre line of its legends.',
      'ENG FEED tick marks are not evenly spaced in the image: NORM measures 44° and FWD 52° either side of AFT. The measured angles are used; the reference cannot show whether the spacing comes from the cockpit model or the camera.',
      'The ENG FEED knob stands proud of the panel, so its top is offset by the camera angle; its centre and detents come from the printed ticks, not the knob.',
      'The FUEL MASTER switch is hidden by its closed guard except for the lever tip; its bushing size is not visible and the medium toggle is assumed.',
      'TANK INERTING lever points almost straight at the camera; its OFF position is inferred from the legend layout. The lever hides its bushing, but it has a big ball and no grommet, so it is drawn as a lever-lock like AIR REFUEL.',
      'AIR REFUEL shows a lock-insert slot in its bushing, so it is drawn as a lever-lock switch; the guide text does not say.',
    ],
  },
  plate: [{ d: path('M8 3H432Q437 3 437 8V165Q437 170 432 170H8Q3 170 3 165V8Q3 3 8 3Z') }],
  engraving: [
    { kind: 'text', at: pt(45, 61), text: 'F', cap: mm(12), width: mm(8) },
    { kind: 'text', at: pt(45, 80.5), text: 'U', cap: mm(12), width: mm(9) },
    { kind: 'text', at: pt(45, 100), text: 'E', cap: mm(12), width: mm(8) },
    { kind: 'text', at: pt(45, 119.5), text: 'L', cap: mm(12), width: mm(7) },
    { kind: 'text', at: pt(81, 21), text: 'MASTER', cap: mm(9), width: mm(43) },
    { kind: 'text', at: pt(82, 133), text: 'OFF', cap: mm(9), width: mm(21) },
    { kind: 'text', at: pt(158, 54), text: 'TANK', cap: mm(9), width: mm(28) },
    { kind: 'text', at: pt(160, 68), text: 'INERTING', cap: mm(9), width: mm(48) },
    { kind: 'text', at: pt(163, 138), text: 'OFF', cap: mm(9), width: mm(21) },
    { kind: 'text', at: pt(268, 24), text: 'ENG FEED', cap: mm(9), width: mm(52) },
    { kind: 'text', at: pt(205, 49), text: '+', cap: mm(7) },
    { kind: 'text', at: pt(268, 44), text: 'AFT', cap: mm(9), width: mm(16) },
    { kind: 'text', at: pt(214, 64), text: 'NORM', cap: mm(9), width: mm(30) },
    { kind: 'text', at: pt(317, 64), text: 'FWD', cap: mm(9), width: mm(23) },
    { kind: 'text', at: pt(207, 102), text: 'OFF', cap: mm(9), width: mm(20) },
    { kind: 'path', d: path('M268 52V60M237 69L243 74M306 72L300 76M221 103H229') },
    { kind: 'text', at: pt(368, 24), text: 'AIR REFUEL', cap: mm(9), width: mm(62) },
    { kind: 'text', at: pt(368, 43), text: 'OPEN', cap: mm(9), width: mm(28) },
    { kind: 'text', at: pt(370, 108), text: 'CLOSE', cap: mm(9), width: mm(35) },
  ],
  placements: [
    { component: 'dzus', at: pt(17, 43) },
    { component: 'dzus', at: pt(427, 43) },
    { component: 'dzus', at: pt(17, 128) },
    { component: 'dzus', at: pt(427, 131) },
    { component: 'screw-medium', at: pt(165, 25) },
    { component: 'screw-medium', at: pt(342, 147) },
    { component: 'toggle-medium', control: 'fuel-master', at: pt(81.5, 41) },
    { component: 'guard-flip', control: 'fuel-master-guard', at: pt(81.5, 117), size: [mm(49), mm(91)] },
    { component: 'toggle-large-lock', control: 'tank-inerting', at: pt(161, 104) },
    { component: 'rotary-pointer', control: 'eng-feed', at: pt(268, 103) },
    { component: 'toggle-large-square', control: 'air-refuel', at: pt(368, 67) },
  ],
  controls: [
    {
      id: 'fuel-master-guard', name: 'FUEL MASTER switch guard', type: 'guard',
      positions: [{ id: 'closed', label: 'Closed', hold: 'stable' }, { id: 'open', label: 'Open', hold: 'stable' }],
      initial: 'closed',
      guards: { control: 'fuel-master', closesTo: 'master' },
      description: 'Red guard over the FUEL MASTER switch. The switch is normally kept at MASTER with the guard closed; closing the guard pushes the switch back to MASTER.',
      source: src,
    },
    {
      id: 'fuel-master', name: 'FUEL MASTER switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'master', label: 'MASTER', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'master',
      protections: [{ kind: 'guard', guard: 'fuel-master-guard', blockedWhen: 'closed', verified: false, note: 'Cannot leave MASTER while the guard is closed. Open the guard first.' }],
      description: 'Opens or closes the main fuel shutoff valve to the engine.',
      source: src,
    },
    {
      id: 'tank-inerting', name: 'TANK INERTING switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'on', label: 'TANK INERTING', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off', latched: true,
      protections: [{ kind: 'latch', verified: false, note: 'Drawn as a lever-lock switch, like AIR REFUEL. It moves with a plain click; the lock is not simulated.' }],
      description: 'At TANK INERTING, halon is pumped into the fuel tanks to lower internal pressure and the risk of fire, for example after battle damage.',
      source: src,
    },
    {
      id: 'eng-feed', name: 'ENG FEED knob', type: 'rotary',
      positions: [
        { id: 'off', label: 'OFF', angle: -90, hold: 'stable' },
        { id: 'norm', label: 'NORM', angle: -44, hold: 'stable' },
        { id: 'aft', label: 'AFT', angle: 0, hold: 'stable' },
        { id: 'fwd', label: 'FWD', angle: 52, hold: 'stable' },
      ],
      initial: 'off',
      description: 'Selects the fuel boost pumps. OFF: both pumps off, the engine is fed through the fuel flow proportioner. NORM: both pumps on, centre of gravity kept automatically. AFT: aft pump only, fuel moves forward and the CG shifts forward. FWD: forward pump only, fuel moves aft and the CG shifts rearward.',
      source: src,
    },
    {
      id: 'air-refuel', name: 'AIR REFUEL switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'open', label: 'OPEN', hold: 'stable' }, { id: 'close', label: 'CLOSE', hold: 'stable' }],
      initial: 'close',
      protections: [{ kind: 'latch', verified: false, note: 'The guide image shows a lever-lock slot in the bushing, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }],
      description: 'OPEN opens the refuelling door, depressurises the tanks for refuelling and turns on the AR floodlights; below 400 knots it also sets the FLCS gains to takeoff and landing. CLOSE reverses this.',
      source: src,
    },
  ],
  indicators: [],
};
