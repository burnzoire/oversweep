import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C ENG & JET START control panel (left console), DCS.
 *
 * Reference: the guide's p. 63 cockpit image (228 x 552 JPEG, extracted with
 * `pdfimages -j -f 63 -l 63`), rectified on the four DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p63.jpg> <out> 18,23 212,32 16,506 207,507
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 3.26;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 63';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

export const engJetStart: PanelSpec = {
  id: 'eng-jet-start',
  title: 'ENG & JET START control panel',
  canvas: [mm(226), mm(552)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 63,
    image: 'p. 63 "ENG & JET START Control Panel" cockpit image, 228 x 552 px',
    rectify: 'python3 -I scripts/panel-trace.py <p63.jpg> <out> 18,23 212,32 16,506 207,507',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads (about 28 px) match. The large lever-lock bushings then measure the shared 5.2 mm radius.',
    shown: { 'jfs': 'off', 'eng-cont-guard': 'closed', 'eng-cont': 'pri', 'ab-reset': 'norm', 'max-power': 'off' },
    unresolved: [
      'The camera sits to the right of the panel, so every lever and bushing appears shifted left; each pivot is set on the centre line of its legends.',
      'The ENG CONT switch is hidden by its closed guard except the lever tip; a plain medium toggle is assumed, so the guard can shut it.',
      'The JFS, AB RESET and MAX POWER bushings show a lock-insert slot, so they are drawn as large lever-lock toggles. The guide text does not say.',
      'The guide does not give the RUN light colour; green is used.',
      'MAX POWER\'s OFF legend is mostly hidden by the lever; only the F is visible.',
      'The two wire bails beside MAX POWER are drawn as fixed bars seen from the front.',
    ],
  },
  plate: [{ d: path('M7 2H219Q224 2 224 7V545Q224 550 219 550H7Q2 550 2 545V7Q2 2 7 2Z') }],
  engraving: [
    // Vertical panel name and the FRICTION bracket on the left edge.
    ...([['E', 80], ['N', 98], ['G', 115], ['&', 143], ['J', 185], ['E', 200], ['T', 215], ['S', 253], ['T', 270], ['A', 287], ['R', 303], ['T', 320]] as const)
      .map(([t, y]) => L([10, y], t, 13, 9)),
    ...([['F', 367], ['R', 381], ['I', 395], ['C', 409], ['T', 423], ['I', 437], ['O', 451], ['N', 465]] as const)
      .map(([t, y]) => L([8, y], t, 8)),
    { kind: 'path', d: path('M6 351H17V476M6 361L8 356L10 361ZM6 472L8 477L10 472Z') },
    L([113, 13], 'JET FUEL', 8.5, 49),
    { kind: 'path', d: path('M37 11H82M143 11H188') },
    L([63, 33], 'RUN', 8.5, 21),
    L([148, 33], 'START 1', 8.5, 43),
    L([185, 63], 'OFF', 8.5, 20),
    L([149, 92], 'START 2', 8.5, 43),
    { kind: 'path', d: path('M37 127H188') },
    L([113, 139], 'ENG CONT', 8.5, 53),
    L([113, 151], 'PRI', 8.5, 13),
    L([113, 257], 'SEC', 8.5, 20),
    L([113, 315], 'AB RESET', 8.5, 53),
    L([150, 345], 'NORM', 8.5, 29),
    L([112, 375], 'ENG DATA', 8.5, 55),
    L([167, 418], '+', 7),
    L([113, 461], 'MAX POWER', 8.5, 66),
    L([113, 529], 'OFF', 8.5, 20),
    // Wire bails either side of MAX POWER, equidistant from its pivot (the camera skews them).
    { kind: 'path', pen: 'heavy', d: path('M62.5 471Q62.5 467 66 467Q69.5 467 69.5 471V526Q69.5 530 66 530Q62.5 530 62.5 526ZM156.5 471Q156.5 467 160 467Q163.5 467 163.5 471V526Q163.5 530 160 530Q156.5 530 156.5 526Z') },
  ],
  placements: [
    { component: 'dzus', at: pt(17, 27), cut: 'up-left' },
    { component: 'dzus', at: pt(209, 27), cut: 'up-right' },
    { component: 'dzus', at: pt(16, 507), cut: 'down-left' },
    { component: 'dzus', at: pt(209, 507), cut: 'down-right' },
    { component: 'screw-medium', at: pt(112, 106) },
    { component: 'screw-medium', at: pt(177, 273) },
    { component: 'screw-medium', at: pt(111, 418) },
    { component: 'lamp-round', indicator: 'jfs-run', at: pt(61, 65) },
    { component: 'toggle-large-lock', control: 'jfs', at: pt(149, 62) },
    { component: 'toggle-medium', control: 'eng-cont', at: pt(113, 180) },
    { component: 'guard-flip', control: 'eng-cont-guard', at: pt(113, 247), size: [mm(51), mm(85)], paint: 'red' },
    { component: 'toggle-large-lock', control: 'ab-reset', at: pt(113, 345) },
    { component: 'toggle-large-lock', control: 'max-power', at: pt(113, 488) },
  ],
  controls: [
    {
      id: 'jfs', name: 'JFS switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'start-1', label: 'START 1', hold: 'magnetic', releasesTo: 'off' },
        { id: 'off', label: 'OFF', hold: 'stable' },
        { id: 'start-2', label: 'START 2', hold: 'magnetic', releasesTo: 'off' },
      ],
      initial: 'off',
      protections: [{ kind: 'latch', verified: false, note: 'The guide image shows a lever-lock slot in the bushing, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }],
      description: 'Starts the jet fuel starter (JFS) using the brake/JFS accumulators. START 1 uses one accumulator, START 2 uses both (needed above 38°C, below −7°C, or for an airstart below 20,000 feet). OFF shuts the JFS down. On a ground start the switch returns to OFF by itself at 55% engine RPM; in flight it must be moved to OFF by hand. The JFS can be started with the FUEL MASTER switch OFF.',
      source: src,
    },
    {
      id: 'eng-cont-guard', name: 'ENG CONT switch guard', type: 'guard',
      positions: [{ id: 'closed', label: 'Closed', hold: 'stable' }, { id: 'open', label: 'Open', hold: 'stable' }],
      initial: 'closed',
      guards: { control: 'eng-cont', closesTo: 'pri' },
      description: 'Red guard over the ENG CONT switch, keeping it at PRI. Closing the guard pushes the switch back to PRI.',
      source: src,
    },
    {
      id: 'eng-cont', name: 'ENG CONT switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'pri', label: 'PRI', hold: 'stable' }, { id: 'sec', label: 'SEC', hold: 'stable' }],
      initial: 'pri',
      protections: [{ kind: 'guard', guard: 'eng-cont-guard', blockedWhen: 'closed', verified: false, note: 'Cannot leave PRI while the guard is closed. Open the guard first.' }],
      description: 'Selects the engine control mode. PRI: the digital electronic engine control (DEC) manages fuel flow, speed and temperature limits and the nozzle; the normal mode. SEC: hydromechanical control by the main engine control (MEC) only, used if the DEC fails, and the SEC caution light comes on. In SEC the afterburner is unavailable, the nozzle stays closed, limiting is off and thrust is reduced, with higher thrust at idle. The DEC can also select SEC by itself.',
      source: src,
    },
    {
      id: 'ab-reset', name: 'AB RESET switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'ab-reset', label: 'AB RESET', hold: 'momentary', spring: 'norm' },
        { id: 'norm', label: 'NORM', hold: 'stable' },
        { id: 'eng-data', label: 'ENG DATA', hold: 'momentary', spring: 'norm' },
      ],
      initial: 'norm',
      protections: [{ kind: 'latch', verified: false, note: 'The guide image shows a lever-lock slot in the bushing, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }],
      description: 'Spring-loaded to NORM. ENG DATA (held momentarily) records 8 seconds of engine data in the engine monitoring system computer, from 6 seconds before to 2 seconds after. AB RESET has no function with the F110-GE-129 engine.',
      source: src,
    },
    {
      id: 'max-power', name: 'MAX POWER switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'max-power', label: 'MAX POWER', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off',
      protections: [{ kind: 'latch', verified: false, note: 'The guide image shows a lever-lock slot in the bushing, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }],
      description: 'Has no function with the F110-GE-129 engine.',
      source: src,
    },
  ],
  indicators: [
    { id: 'jfs-run', name: 'RUN light', type: 'lamp', colour: 'green', description: 'Lights within 30 seconds of starting the JFS, to show the jet fuel starter is running at its governed speed.', source: src },
  ],
};
