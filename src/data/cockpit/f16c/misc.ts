import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C Miscellaneous (MISC) panel (main instrument panel, upper left), DCS.
 *
 * Reference: the guide's p. 47 "Miscellaneous (MISC) Panel" image (302 x 828,
 * `pdfimages -png -f 47 -l 47`, image 002). The camera is nearly square-on (the
 * right edge, the rule under SIMULATE and the legend rows are straight and
 * level), so the image is traced without a warp:
 *   python3 -I scripts/panel-trace.py <p47-002.png> <out> 0,0=0,0 302,0=302,0 0,828=0,828 302,828=302,828 302 828
 * It is a small image: legend and lever positions are read off the 3x grid and
 * 3x zooms (scripts/panel-zoom.py), to about a pixel (0.25 mm).
 * Values below are reference pixels, stored in mm.
 */
const PX = 4.33;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 47';
const T = (x: number, y: number, text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(x, y), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

/** Toggle pivots on their legends' centre lines (px). */
const RF: [number, number] = [216, 124];
const LASER: [number, number] = [145, 305];
const MASTER: [number, number] = [181.5, 509.5];
const ROLL: [number, number] = [66, 764];
const PITCH: [number, number] = [185.5, 764];

export const misc: PanelSpec = {
  id: 'misc',
  title: 'MISC panel',
  canvas: [mm(292), mm(828)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 47,
    image: 'p. 47 "Miscellaneous (MISC) Panel" cockpit image, 302 x 828 px',
    rectify: 'python3 -I scripts/panel-trace.py <p47-002.png> <out> 0,0=0,0 302,0=302,0 0,828=0,828 302,828=302,828 302 828 (no warp: the image is square-on)',
    pxPerMm: PX,
    scale: 'The toggle grommets measure 45 px across; taken as the 10.4 mm grommet the toggle components share, that gives 4.33 px/mm. The two screws (26 px, screw-medium 5.6 mm), the ECM lamp bezel (53 px, lamp-round 11.6 mm) and the ALT REL button (52 px bezel, 40 px cap, push-round-large) then match.',
    shown: { rf: 'norm', 'laser-arm': 'off', 'master-arm': 'off', roll: 'att-hold', pitch: 'off' },
    unresolved: [
      'The image is small (4.3 px a millimetre), so legends and pivots are placed to about a quarter of a millimetre. No DZUS fasteners show: the panel is held by the two screws the image shows and is drawn as one layer.',
      'Plate outline: the top edge (y 8) and the diagonal top-left edge run under the glareshield rim; the left edge (x 72) and the curve out to the wider bottom part (MISC, ROLL) follow the edge of the rim beside the panel, and the bottom edge (y 823) is at the foot of the image. All are traced from the edge of the rim, not a clean plate edge.',
      'LASER ARM: the OFF legend is mostly hidden under the lever (only the F shows), so it is centred under the lever, where the visible F puts it. The pivot sits between the bushing (y 301) and the legends\' centre line (y 309).',
      'The cross engraved below LASER ARM (x 129, y 400) is drawn as it is printed; the guide does not say what it marks.',
      'Lever types: RF, LASER ARM, MASTER ARM and PITCH show a lock slot in the bushing and a broad mushroom cap, so they are drawn as lever-locks (the MAIN PWR part); ROLL shows the round orange-red grommet of a plain toggle. In DCS they all move with a plain click.',
      'The guide does not say which positions hold. RF, LASER ARM, MASTER ARM and ROLL are drawn as stable. PITCH is drawn magnetically held at ALT HOLD and ATT HOLD, dropping to A/P OFF (the guide\'s autopilot chapter, p. 130: the autopilot disengages to A/P OFF).',
      'ADV MODE is drawn unlit with its ACTIVE and STBY legends; the guide says it is not used in the Block 50.',
    ],
  },
  plate: [
    // One layer. Right edge x 285, top y 8 (corner 6 px), diagonal top-left edge from (170, 8) to (80, 112), the left edge sloping
    // out to x 62 at the rule's height, then a rounded shoulder and a straight diagonal out to x 2 at y 740 and straight down the foot of the wider bottom part (Nathan, 2026-11-23: curve
    // at the shoulder only); the right edge bends in, concave, from y 640 to x 268 at the bottom edge (y 823).
    { d: path('M166 6H284Q290 6 290 12V690Q284 730 272 783L268 820H4V740L5 697Q30 655 50 612L99 91Z') },
  ],
  engraving: [
    // RF: NORM (up; RF above it), QUIET (centre, down the right of the lever), SILENT (down).
    T(216, 58.5, 'RF', 12, 20), T(216, 79.5, 'NORM', 12, 38),
    T(256, 91, 'Q', 11), T(256, 107.5, 'U', 11), T(256, 124, 'I', 11), T(256, 140.5, 'E', 11), T(256, 157, 'T', 11),
    T(216.5, 169.5, 'SILENT', 12, 53),
    // ECM light in a ruled box (left and bottom rules).
    T(221, 214.5, 'ECM', 15, 40),
    { kind: 'path', pen: 'fine', d: path('M184.5 176V309H262') },
    T(145, 245, 'LASER', 12, 51), T(146, 264.5, 'ARM', 12, 32), T(145, 354, 'OFF', 12, 26),
    { kind: 'path', pen: 'fine', d: path('M123 400H135M129 394V406') },
    T(224, 337.5, 'ALT REL', 15, 76),
    T(181.5, 462.5, 'MASTER ARM', 16, 100), T(233, 513.5, 'OFF', 12, 27), T(181.5, 556, 'SIMULATE', 12, 73),
    { kind: 'path', pen: 'fine', d: path('M68 567.5H277') },
    T(225, 615.5, 'ADV', 12, 30), T(226, 635.5, 'MODE', 12, 42),
    T(63, 700, 'ROLL', 16, 46), T(65, 720, 'HDG SEL', 12, 64), T(113.5, 757.5, 'ATT', 12, 27), T(114, 775, 'HOLD', 12, 38), T(69, 808, 'STRG SEL', 12, 72),
    T(185, 700, 'PITCH', 16, 52), T(184.5, 720, 'ALT HOLD', 12, 75), T(230, 757.5, 'A/P', 12, 30), T(231, 775, 'OFF', 12, 28), T(186, 808, 'ATT HOLD', 12, 73),
    // Panel title, one letter above the next.
    T(18, 732, 'M', 18, 16), T(18, 758, 'I', 18), T(18, 786, 'S', 18, 14), T(18, 813, 'C', 18, 14),
  ],
  placements: [
    { component: 'screw-medium', at: pt(117, 151) },
    { component: 'screw-medium', at: pt(262, 666.5) },
    { component: 'toggle-large-cylinder', control: 'rf', at: pt(...RF) },
    { component: 'lamp-round', indicator: 'ecm', at: pt(221.5, 258) },
    { component: 'toggle-large-cylinder', control: 'laser-arm', at: pt(...LASER) },
    { component: 'push-round-large', control: 'alt-rel', at: pt(226, 379), paint: 'red', paintCapOnly: true },
    { component: 'toggle-large-cylinder', control: 'master-arm', at: pt(...MASTER) },
    {
      component: 'push-square', control: 'adv-mode', indicator: 'adv-mode', at: pt(159.5, 624), size: [mm(81), mm(78)],
      marks: 'M-8 0H8',
      legend: [{ text: 'ACTIVE', cap: mm(10), y: mm(-14), width: mm(34) }, { text: 'STBY', cap: mm(10), y: mm(14), width: mm(26) }],
    },
    { component: 'toggle-large', control: 'roll', at: pt(...ROLL) },
    { component: 'toggle-large-cylinder', control: 'pitch', at: pt(...PITCH) },
  ],
  controls: [
    {
      id: 'rf', name: 'RF switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'norm', label: 'NORM', hold: 'stable' },
        { id: 'quiet', label: 'QUIET', hold: 'stable' },
        { id: 'silent', label: 'SILENT', hold: 'stable' },
      ],
      initial: 'norm',
      protections: [{ kind: 'latch', verified: false, note: 'Lever-lock switch (lock slot visible in the bushing). In DCS it moves with a plain click.' }],
      description: 'Radio Frequency switch: controls the aircraft\'s emissions. NORM: all emissions permitted. QUIET: emissions limited to the fire control radar in its tracking modes or air combat modes, AIFF interrogations, low-power datalink, ECM if enabled by hand (MAN or SEMI) and the radar altimeter. SILENT: limited to the radar in air combat modes, AIFF interrogations and ECM enabled by hand.',
      source: src,
    },
    {
      id: 'laser-arm', name: 'LASER ARM switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'arm', label: 'LASER ARM', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off',
      protections: [{ kind: 'latch', verified: false, note: 'Lever-lock switch (lock slot visible in the bushing). In DCS it moves with a plain click.' }],
      description: 'Arms the targeting pod\'s laser designator and ranger (with a pod fitted and powered). LASER ARM: the laser may fire if the pod is not masked. OFF: laser firing inhibited.',
      source: src,
    },
    {
      id: 'alt-rel', name: 'ALT REL button', type: 'pushbutton',
      positions: [{ id: 'out', label: 'Released', hold: 'stable' }, { id: 'in', label: 'Pressed', hold: 'momentary', spring: 'out' }],
      initial: 'out',
      description: 'Alternate release: a backup to the weapon release button on the side stick, for use if that button fails.',
      source: src,
    },
    {
      id: 'master-arm', name: 'MASTER ARM switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'arm', label: 'MASTER ARM', hold: 'stable' },
        { id: 'off', label: 'OFF', hold: 'stable' },
        { id: 'simulate', label: 'SIMULATE', hold: 'stable' },
      ],
      initial: 'off',
      protections: [{ kind: 'latch', verified: false, note: 'Lever-lock switch (lock slot visible in the bushing). In DCS it moves with a plain click.' }],
      description: 'Enables or inhibits weapon release. MASTER ARM: the fire control radar and stores management system give weapon cues and symbology, and weapon release and emergency jettison are permitted (the HUD shows ARM). OFF: weapon release inhibited; emergency jettison still permitted. SIMULATE: cues and symbology as in MASTER ARM, but release inhibited (the HUD shows SIM); emergency jettison permitted.',
      source: `${src}; HUD master arm status p. 91`,
    },
    {
      id: 'adv-mode', name: 'ADV MODE button', type: 'pushbutton',
      positions: [{ id: 'out', label: 'Released', hold: 'stable' }, { id: 'in', label: 'Pressed', hold: 'momentary', spring: 'out' }],
      initial: 'out',
      description: 'Advanced Mode: a terrain-following radar function, not used in the Block 50 F-16.',
      source: src,
    },
    {
      id: 'roll', name: 'Autopilot ROLL switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'hdg-sel', label: 'HDG SEL', hold: 'stable' },
        { id: 'att-hold', label: 'ATT HOLD', hold: 'stable' },
        { id: 'strg-sel', label: 'STRG SEL', hold: 'stable' },
      ],
      initial: 'att-hold',
      description: 'Selects the autopilot\'s roll mode once PITCH engages it. HDG SEL: turns to and holds the heading set on the EHSI. ATT HOLD: holds the bank angle. STRG SEL: steers to the selected steerpoint.',
      source: `${src}; autopilot pp. 130–131`,
    },
    {
      id: 'pitch', name: 'Autopilot PITCH switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'alt-hold', label: 'ALT HOLD', hold: 'magnetic', releasesTo: 'off' },
        { id: 'off', label: 'A/P OFF', hold: 'stable' },
        { id: 'att-hold', label: 'ATT HOLD', hold: 'magnetic', releasesTo: 'off' },
      ],
      initial: 'off',
      protections: [{ kind: 'latch', verified: false, note: 'Lever-lock switch (lock slot visible in the bushing). In DCS it moves with a plain click.' }],
      description: 'Engages the autopilot and selects its pitch mode. ALT HOLD: holds the altitude. ATT HOLD: holds the pitch attitude. A/P OFF: autopilot off. The switch is held in ALT HOLD or ATT HOLD while the autopilot is engaged and drops to A/P OFF when it disengages.',
      source: `${src}; autopilot pp. 130–131`,
    },
  ],
  indicators: [
    { id: 'ecm', name: 'ECM light', type: 'lamp', description: 'Lit while the ECM pod (if fitted and powered) is actively jamming.', source: src },
    { id: 'adv-mode', name: 'ADV MODE lights', type: 'lamp', description: 'ACTIVE and STBY legends of the Advanced Mode button (terrain following); not used in the Block 50.', source: src },
  ],
};
