import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C left sidewall controls above the throttle, DCS: CHAFF/FLARE dispense
 * button, canopy handle and canopy switch.
 *
 * Reference: square-on DCS ModelViewer screenshots of the cockpit model's left
 * sidewall supplied by Nathan (2026-11-18): shot 1 handle locked, shot 2
 * unlocked (same camera, 1576 x 904), and an oblique shot showing the canopy
 * switch behind the handle. The guide (pp. 73, 708) describes the controls;
 * its images are too oblique to trace. Values are shot-1 pixels, stored in
 * mm with the canvas origin at shot pixel (580, 225).
 */
const PX = 2.46;
const { mm } = tracer(PX);
const OX = 580, OY = 225;
const q = (x: number, y: number): [number, number] => [mm(x - OX), mm(y - OY)];
/** Shifts and scales every "x y" pair of an M/L/Q/Z path typed in shot pixels. */
const path = (d: string, dx = 0) => d.replace(/(-?\d*\.?\d+)[ ,](-?\d*\.?\d+)/g, (_, x, y) => q(+x + dx, +y).join(' '));
/** The handle outlines were read off 3x grids whose labels sit right of their lines; the first overlay showed them 8 px right. */
const HX = -8;
const src = 'DCS F-16C guide p. 73';

export const sidewallControls: PanelSpec = {
  id: 'sidewall-controls',
  title: 'Sidewall controls',
  canvas: [mm(520), mm(305)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026); layout from DCS ModelViewer screenshots of the cockpit model',
    page: 73,
    image: 'DCS ModelViewer, left sidewall square-on (shot 1, handle locked), 1576 x 904 px',
    rectify: 'none: the ModelViewer camera looks square-on at the wall',
    pxPerMm: PX,
    scale: 'The ModelViewer cursor read (0.144031, -0.384863, -0.014372) m at shot pixel (347, 290) and (0.272327, -0.329241, -0.014372) m at (662, 152): 344 px for 139.8 mm, so 2.46 px/mm in the wall plane.',
    shown: { 'canopy-handle': 'locked', 'chaff-flare': 'out' },
    unresolved: [
      'The canopy switch is hidden behind the handle in the square-on shots. Its position is from Nathan\'s mark on shot 2 (behind the stem, above the foot) and its bracket from the oblique shot scaled by the CHAFF/FLARE bezel; it is drawn over the handle so it can be used.',
      'The switch\'s grommet measures about 7 mm across in the oblique shot; it is drawn as the shared small toggle (6 mm).',
      'Unlocked, the handle swings out about its top hinge; the drawing is its square-on outline in shot 2. The tan linkage at the end of the upper arm is not drawn.',
      'The wall\'s top edge is hidden behind the canopy sill hardware right of x 760 px; it is drawn straight on from the measured left part (230.5 px at 600, 238.5 px at 740). The bolted bracket at the lower left is outside the drawn part.',
      'The guide does not give the canopy switch\'s legends; none are printed on the wall.',
    ],
  },
  plate: [
    // Wall. Top edge measured at x 600–740 (230.5–238.5 px). The throttle
    // cut-out edge measured by column: 453.5 (590), 454.5 (620), 459.5 (660),
    // 467.5 (700), 478.5 (740), 493.5 (780), 528.5 (820). Slot hole x 783–800,
    // y 300–347.
    { d: path('M580 229 L1100 259 L1100 530 L822 530 L780 493.5 Q740 478.5 700 467.5 Q660 459 620 454.5 L580 453 Z ') +
      path('M783 308.5 Q783 300 791.5 300 Q800 300 800 308.5 L800 338.5 Q800 347 791.5 347 Q783 347 783 338.5 Z') },
    // Canopy switch bracket: a pointed plate standing off the wall.
    { d: path('M1000 369 L1026 398 L1024 456 L976 456 L974 398 Z'), raised: true },
  ],
  engraving: [],
  placements: [
    // Bezel x 613–700 (r 43.5 px), centre (656.5, 362.5); CHAFF over FLARE with
    // corner brackets top left and bottom right.
    { component: 'push-round-bezel', control: 'chaff-flare', at: q(656.5, 362.5), legend: [
      { text: 'CHAFF', cap: 4.3, y: -0.6, width: 15.4 },
      { text: 'FLARE', cap: 4.3, y: 4.2, width: 15.4 },
    ], marks: 'M-9.1 -1.4V-3.4H-6.7M9.1 4.6V6.6H6.7' },
    // Canopy handle (yellow), hinged along its top block. Outlines traced off
    // shots 1 (locked) and 2 (unlocked) at 3x.
    { component: 'traced', control: 'canopy-handle', at: q(1015 + HX, 270), paint: 'yellow', shapes: {
      locked: {
        d: path('M795 350 L945 349 Q952 348 955 340 L897 318 L897 298 L990 328 L990 262 L1030 262 L1040 278 L1040 322 L1088 322 L1088 382 L1070 382 L1070 352 L1020 352 L1015 360 L1015 428 L1078 428 L1078 505 L983 505 L983 465 Q983 455 990 455 L990 362 L800 372 L800 415 L795 415 Z', HX),
        lines: path('M1015 428 L1015 505 M990 322 L1040 322', HX),
      },
      unlocked: {
        d: path('M796 335 L955 326 Q960 324 958 320 L897 303 L888 283 L990 303 L990 282 L1040 282 L1040 302 L1092 302 L1092 352 L1015 352 L1015 412 L1080 412 L1080 400 L1088 400 L1088 480 L1015 480 L1015 470 L990 470 Q985 470 985 460 L985 452 L993 450 L993 345 L803 352 L803 360 L796 360 Z', HX),
        lines: path('M1015 412 L1015 480 M990 302 L1040 302', HX),
      },
    } },
    { component: 'toggle-small', control: 'canopy', at: q(1000, 420) },
  ],
  controls: [
    {
      id: 'chaff-flare', name: 'CHAFF/FLARE dispense button', type: 'pushbutton',
      positions: [{ id: 'out', label: 'Out', hold: 'stable' }, { id: 'in', label: 'Pressed', hold: 'momentary', spring: 'out' }],
      initial: 'out',
      description: 'Dispenses Manual Program 5 when the CMDS mode is Manual, Semi-automatic or Automatic. It works independently of the countermeasures management switch on the side stick.',
      source: 'DCS F-16C guide p. 708',
    },
    {
      id: 'canopy-handle', name: 'Canopy handle', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'unlocked', label: 'Unlocked', hold: 'stable' }, { id: 'locked', label: 'Locked', hold: 'stable' }],
      initial: 'locked',
      description: 'Locks and unlocks the canopy and inflates or deflates its pressure seal. Unlocked (pulled outward): the seal deflates and the CANOPY warning light comes on; set it here before lowering the canopy. It also limits the throttle\'s full travel. Locked (against the cockpit wall): the canopy is locked and the seal inflated.',
      source: src,
    },
    {
      id: 'canopy', name: 'Canopy switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'up', label: 'Up', hold: 'stable' },
        { id: 'center', label: 'Center', hold: 'stable' },
        { id: 'down', label: 'Down', hold: 'momentary', spring: 'center' },
      ],
      initial: 'center',
      description: 'Drives the canopy actuator. Up: with the canopy handle unlocked, raises the canopy to full extension, then snaps back to center by itself. Center: stops canopy motion. Down: lowers the canopy; spring-loaded to center, so hold it until the canopy is down.',
      source: src,
    },
  ],
  indicators: [],
};
