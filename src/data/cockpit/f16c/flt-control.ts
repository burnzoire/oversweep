import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C FLT CONTROL panel (left console), DCS.
 *
 * Reference: the guide's p. 71 "FLT CONTROL Panel" cockpit image (440 x 350
 * JPEG, extracted with `pdfimages -j -f 71 -l 71`, image 002), rectified on
 * the four DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p71-002.png> <out> 33,35=24,36 421,37=422,36 15,308=24,309 422,310=422,309
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 3.15;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 71';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
const latch = [{ kind: 'latch' as const, verified: false, note: 'A lever-lock slot in the bushing marks it as a lever-lock toggle, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }];

export const fltControl: PanelSpec = {
  id: 'flt-control',
  title: 'FLT CONTROL panel',
  canvas: [mm(446), mm(348)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 71,
    image: 'p. 71 "FLT CONTROL Panel" cockpit image, 440 x 350 px',
    rectify: 'python3 -I scripts/panel-trace.py <p71-002.png> <out> 33,35=24,36 421,37=422,36 15,308=24,309 422,310=422,309',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads (about 27 px across on the zoom) match.',
    shown: { 'digital-backup': 'off', 'alt-flaps': 'norm', 'manual-tf-flyup': 'disable', 'le-flaps': 'auto', 'flcs-reset': 'off', 'flcs-bit': 'off' },
    unresolved: [
      'The camera sits low and to the left, so the left DZUS column leans in the photo; the panel is squared on the four DZUS and drawn symmetric about them.',
      'The MANUAL TF FLY-UP legend is mostly hidden by its lever; FLY-UP and DISABLE are read from the guide text and the visible letters.',
      'DIGITAL BACKUP, ALT FLAPS, MANUAL TF FLY-UP, LE FLAPS and BIT show a lock-insert slot in the bushing, so they are drawn as lever-lock toggles; FLCS RESET shows the orange-red grommet of a plain toggle. The guide text does not say which are lever-locks.',
      'Only MANUAL TF FLY-UP leans away from the camera (DISABLE); the other levers lean towards it, so they are shown at their lower positions (OFF, NORM, AUTO, OFF).',
      'The top edges of the corner notches are hidden under the DZUS rims; they are mirrored from the bottom notches (13.5 px from the DZUS centre).',
      'The two wire bails beside FLCS RESET are drawn as fixed bars seen from the front.',
    ],
  },
  plate: [
    { d: path('M11 0H435Q439 0 439 4V342Q439 346 435 346H11Q7 346 7 342V4Q7 0 11 0Z') },
    // Raised face plate, cut away round the four corner DZUS. Inner edges by brightness gradient (px):
    // TL x 35.5, TR x 402.5, BL x 38.5 / y 294.5, BR x 404.5 / y 298.5; mirrored about the DZUS centre
    // (x 223, y 173) at the means: x 40 / 406, y 49.5 / 296.5. Inner corner radius 10 px.
    { d: path('M40 0H406V39.5Q406 49.5 416 49.5H439V296.5H416Q406 296.5 406 306.5V346H40V306.5Q40 296.5 30 296.5H7V49.5H30Q40 49.5 40 39.5Z'), raised: true },
  ],
  engraving: [
    // Vertical panel name down the left edge.
    ...([['F', 83], ['L', 102], ['T', 121], ['C', 153], ['O', 171], ['N', 189.5], ['T', 208], ['R', 226], ['O', 245], ['L', 264]] as const)
      .map(([t, y]) => L([22, y], t, 13, 9)),
    L([146, 13], 'DIGITAL', 9, 41),
    L([146, 28], 'BACKUP', 9, 41),
    L([146, 98], 'OFF', 9, 20),
    L([294, 12], 'ALT FLAPS', 9, 59),
    L([294, 28], 'EXTEND', 9, 40),
    L([294, 97], 'NORM', 9, 29),
    L([220.5, 109], 'MANUAL TF', 9, 60),
    L([220.5, 124], 'FLY-UP', 9, 38),
    L([220.5, 139], 'DISABLE', 9, 45),
    L([220.5, 208], 'ENABLE', 9, 41),
    L([95, 155], '+', 7),
    L([118.5, 241], 'LE FLAPS', 9, 53),
    L([118.5, 255], 'LOCK', 9, 26),
    L([118.5, 319], 'AUTO', 9, 27),
    L([246, 240], 'FLCS', 9, 24),
    L([246, 255], 'RESET', 9, 32),
    L([246, 318], 'OFF', 9, 19),
    L([363.5, 254], 'BIT', 9, 14),
    L([363.5, 318], 'OFF', 9, 17),
    // Wire bails either side of FLCS RESET, equidistant from its pivot (the camera skews them).
    { kind: 'path', pen: 'heavy', d: path('M186.5 252Q186.5 248 190 248Q193.5 248 193.5 252V316Q193.5 320 190 320Q186.5 320 186.5 316ZM298.5 252Q298.5 248 302 248Q305.5 248 305.5 252V316Q305.5 320 302 320Q298.5 320 298.5 316Z') },
  ],
  placements: [
    { component: 'dzus', at: pt(24, 36) },
    { component: 'dzus', at: pt(422, 36) },
    { component: 'dzus', at: pt(24, 310) },
    { component: 'dzus', at: pt(422, 310) },
    { component: 'screw', at: pt(74, 57.5) },
    { component: 'screw', at: pt(372, 57.5) },
    { component: 'screw', at: pt(74, 214) },
    { component: 'screw', at: pt(372, 214) },
    { component: 'toggle-large-lock', control: 'digital-backup', at: pt(146, 63) },
    { component: 'toggle-large-lock', control: 'alt-flaps', at: pt(294, 62.5) },
    { component: 'toggle-large-lock', control: 'manual-tf-flyup', at: pt(220.5, 174) },
    { component: 'lamp-module', at: pt(306, 144), size: [mm(51), mm(50)], lamps: [
      { indicator: 'flcs-run', legend: 'RUN', rect: [mm(4), mm(4), mm(43), mm(20)], width: mm(18), cap: mm(9) },
      { indicator: 'flcs-fail', legend: 'FAIL', rect: [mm(4), mm(26), mm(43), mm(20)], width: mm(17), cap: mm(9) },
    ] },
    { component: 'toggle-large-lock', control: 'le-flaps', at: pt(118.5, 287) },
    { component: 'toggle-large', control: 'flcs-reset', at: pt(246, 286.5) },
    { component: 'toggle-large-lock', control: 'flcs-bit', at: pt(363.5, 286) },
  ],
  controls: [
    {
      id: 'digital-backup', name: 'DIGITAL BACKUP switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'backup', label: 'DIGITAL BACKUP', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off', protections: latch,
      description: 'Selects the flight control computer (FLCC) backup software. When it is on, the DBU ON warning light on the right eyebrow panel lights and the HUD shows a flashing WARN message.',
      source: src,
    },
    {
      id: 'alt-flaps', name: 'ALT FLAPS switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'extend', label: 'EXTEND', hold: 'stable' }, { id: 'norm', label: 'NORM', hold: 'stable' }],
      initial: 'norm', protections: latch,
      description: 'EXTEND lowers the trailing-edge flaps by hand at low speed before landing, if they have not come down with the landing gear. NORM leaves the trailing-edge flaps scheduled automatically by the flight control system.',
      source: src,
    },
    {
      id: 'manual-tf-flyup', name: 'MANUAL TF FLY-UP switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'disable', label: 'DISABLE', hold: 'stable' }, { id: 'enable', label: 'ENABLE', hold: 'stable' }],
      initial: 'disable', protections: latch,
      description: 'A terrain-following radar function. It is not used in the Block 50 F-16.',
      source: src,
    },
    {
      id: 'le-flaps', name: 'LE FLAPS switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'lock', label: 'LOCK', hold: 'stable' }, { id: 'auto', label: 'AUTO', hold: 'stable' }],
      initial: 'auto', protections: latch,
      description: 'LOCK holds the leading-edge flaps where they are and lights the FLCS warning light; it might be used after a leading-edge flap failure with the flaps uneven. AUTO leaves the leading-edge flaps scheduled automatically by the flight control system. Not implemented in DCS.',
      source: src,
    },
    {
      id: 'flcs-reset', name: 'FLCS RESET switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'reset', label: 'FLCS RESET', hold: 'momentary', spring: 'off' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off',
      description: 'Held to RESET, clears flight control system servo and electrical failures and resets the FLCS warning light, MASTER CAUTION, CADC and FLCS caution lights and the pilot fault list display, if the faults have actually cleared. Springs back to OFF.',
      source: src,
    },
    {
      id: 'flcs-bit', name: 'BIT switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'bit', label: 'BIT', hold: 'magnetic', releasesTo: 'off', holdWhile: 'the FLCS BIT is running' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off', protections: latch,
      description: 'Starts the flight control system built-in test, with weight on wheels and ground speed below 28 knots. The test moves the flight control surfaces and runs for about 45 seconds; the switch is held magnetically at BIT meanwhile and drops back to OFF when the test ends. Done during start-up.',
      source: src,
    },
  ],
  indicators: [
    { id: 'flcs-run', name: 'RUN light', type: 'lamp', colour: 'green', description: 'Lights while a flight control system BIT is running and goes out when the test is complete.', source: src },
    { id: 'flcs-fail', name: 'FAIL light', type: 'lamp', colour: 'red', description: 'Lights if the flight control system BIT finds a problem; the failure is shown on the pilot fault list display.', source: src },
  ],
};
