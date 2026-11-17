import type { ControlPosition, PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C AUDIO 1 and AUDIO 2 control panels (left console), DCS.
 *
 * Reference: the guide's p. 65 "AUDIO 1 & AUDIO 2 Control Panels" cockpit
 * image (440 x 341 JPEG, `pdfimages -j -f 65 -l 65`, image 002). Both panels
 * are in one image and the camera is nearly square-on, so it is traced
 * unrectified. Measurements below are in reference pixels and stored in mm.
 */
const PX = 434 / 146.05;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 65';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
/** A curved arrow from a to tip through control point c, with an open head at the tip (reference px). */
const arrow = (a: [number, number], c: [number, number], tip: [number, number]) => {
  const dx = tip[0] - c[0], dy = tip[1] - c[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, h = 6, w = 3.5;
  const b = [tip[0] - ux * h, tip[1] - uy * h];
  return { kind: 'path' as const, d: path(`M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${tip[0]} ${tip[1]}M${(b[0] - uy * w).toFixed(1)} ${(b[1] + ux * w).toFixed(1)}L${tip[0]} ${tip[1]}L${(b[0] + uy * w).toFixed(1)} ${(b[1] - ux * w).toFixed(1)}`) };
};
const tick = (c: [number, number], a: number, r0: number, r1: number) => {
  const s = Math.sin(a * Math.PI / 180), k = -Math.cos(a * Math.PI / 180);
  return `M${(c[0] + r0 * s).toFixed(1)} ${(c[1] + r0 * k).toFixed(1)}L${(c[0] + r1 * s).toFixed(1)} ${(c[1] + r1 * k).toFixed(1)}`;
};

/**
 * Knob columns, squared under their titles: the AUDIO 2 knobs sit in the same
 * columns as the AUDIO 1 knobs above them (titles measured x 83, 179, 272, 362).
 */
const X1 = 83, X2 = 180, X3 = 272, X4 = 362;
/** Rows: AUDIO 1 volume knobs, COMM mode knobs (centre fitted to the OFF and GD ticks), TF/THREAT, AUDIO 2 knobs. */
const Y_VOL = 66, Y_MODE = 171.5, Y_LOW = 179, Y_A2 = 284;
const MODE_1: [number, number] = [X1, Y_MODE], MODE_2: [number, number] = [X2, Y_MODE];
/** OFF and GD ticks measured at -42° and +42° on both mode knobs; SQL straight up. */
const MODE_ANGLE = 42;
const mode: ControlPosition[] = [
  { id: 'off', label: 'OFF', angle: -MODE_ANGLE, hold: 'stable' },
  { id: 'sql', label: 'SQL', angle: 0, hold: 'stable' },
  { id: 'gd', label: 'GD', angle: MODE_ANGLE, hold: 'stable' },
];
/**
 * Volume knobs turn continuously; modelled as seven detents 45° apart from
 * fully anticlockwise to fully clockwise (INC). `off` names the first one
 * where the knob also switches the receiver off.
 */
const volume = (off: boolean): ControlPosition[] => Array.from({ length: 7 }, (_, i) => ({
  id: i === 0 ? (off ? 'off' : 'min') : i === 6 ? 'max' : `v${i}`,
  label: i === 0 ? (off ? 'OFF' : 'Minimum') : i === 6 ? 'INC (maximum)' : `Volume ${i}`,
  angle: -135 + 45 * i,
  hold: 'stable' as const,
}));

export const audio: PanelSpec = {
  id: 'audio',
  title: 'AUDIO 1 & 2 panels',
  canvas: [mm(440), mm(341)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 65,
    image: 'p. 65 "AUDIO 1 & AUDIO 2 Control Panels" cockpit image, 440 x 341 px',
    rectify: 'not rectified: the camera is nearly square-on; AUDIO 1 DZUS fitted at (18.8, 46.7), (426, 49), (17, 186) and (424, 185); AUDIO 2 at (424, 266) and (15.6, 300)',
    pxPerMm: PX,
    scale: 'Same scale as the FUEL panel on the same console (434 px = 5.75 in); the DZUS heads (about 25 px) match the shared 8.5 mm head, and the panels measure 3.0 in (AUDIO 1) and 1.5 in (AUDIO 2) tall, whole MS25212 steps.',
    shown: {
      'comm1-vol': 'v5', 'comm2-vol': 'v4', 'secure-voice': 'max', msl: 'v4',
      'comm1-mode': 'sql', 'comm2-mode': 'sql', tf: 'min', threat: 'v5',
      intercom: 'max', tacan: 'min', ils: 'off', 'hot-mic': 'off',
    },
    unresolved: [
      'The volume knobs turn continuously and their stops are not marked; each is modelled with seven detents 45° apart, fully anticlockwise to INC.',
      'Knob faces stand tall and the camera looks down on them, so each knob is placed on its title column and row rather than where its face appears.',
      'AUDIO 2 has only two DZUS, at the top right and bottom left, 39 px in from opposite edges; they are drawn point-symmetric about the panel centre, as measured, not mirrored to one height.',
      'The bottom-left notch on AUDIO 2: only the part of its inner edge below the fastener is visible (x 34.5 from y 310 down); its top is drawn point-symmetric to the top-right notch.',
      'The HOT MIC CIPHER lever points straight at the camera; it is drawn as a plain toggle in the round grommet seen in the image. The guide does not say whether any position is spring-loaded; all three are modelled stable.',
    ],
  },
  plate: [
    // AUDIO 1: 3.0 in tall (y 0.5–224.5), standard width centred on the DZUS columns.
    { d: path('M9.5 0.5H435.5Q439.5 0.5 439.5 4.5V220.5Q439.5 224.5 435.5 224.5H9.5Q5.5 224.5 5.5 220.5V4.5Q5.5 0.5 9.5 0.5Z') },
    // Raised face, notched round the four DZUS. Notch edges measured by
    // brightness step (px): left x 35.5 (21 rows agree), right x 409.5–410
    // (zoom); top-left notch bottom about 60.5, top-right about 66; bottom-left
    // notch top about 177 (weak), bottom-right about 168–172. Drawn mirrored:
    // x 35.5 / 409.5, top notches to y 63, bottom notches from y 171, inner
    // corners rounded at 12 px.
    { d: path('M35.5 0.5H409.5V51Q409.5 63 421.5 63H439.5V171H421.5Q409.5 171 409.5 183V224.5H35.5V183Q35.5 171 23.5 171H5.5V63H23.5Q35.5 63 35.5 51Z'), raised: true },
    // AUDIO 2: 1.5 in tall (y 226.5–339.5).
    { d: path('M9.5 226.5H435.5Q439.5 226.5 439.5 230.5V335.5Q439.5 339.5 435.5 339.5H9.5Q5.5 339.5 5.5 335.5V230.5Q5.5 226.5 9.5 226.5Z') },
    // Raised face with two notches: top right (inner edge x 409.5, bottom y
    // 284, measured on the cut sheet) and bottom left (inner edge x 34.5–35.5 measured below
    // the fastener; top y 282, point-symmetric to the top-right notch).
    { d: path('M5.5 226.5H409.5V272Q409.5 284 421.5 284H439.5V339.5H35.5V294Q35.5 282 23.5 282H5.5Z'), raised: true },
  ],
  engraving: [
    // Vertical panel names.
    ...[...'AUDIO'].map((t, i) => L([11, 80 + 18.5 * i], t, 15, t === 'I' ? 3 : 11)),
    L([23, 122], '1', 15, 7),
    ...[...'AUDIO'].map((t, i) => L([42, 247 + 19.5 * i], t, 15, t === 'I' ? 3 : 11)),
    L([53, 325], '2', 15, 9),
    // Divider between the radio and the warning-tone knobs.
    { kind: 'path', pen: 'medium', d: path('M237 18V212') },
    // Volume knobs, AUDIO 1.
    L([X1, 13], 'COMM 1', 11, 42),
    L([X2, 13], 'COMM 2', 11, 44),
    L([X3, 15], 'SECURE', 11, 42),
    L([X3, 28], 'VOICE', 11, 30),
    L([X4, 16], 'MSL', 11, 22),
    arrow([115, 31], [126, 45], [128, 67]), L([128, 77], 'INC', 10, 18), L([41, 93], 'OFF', 10, 21),
    arrow([211, 33], [222, 47], [223, 70]), L([223, 77], 'INC', 10, 18), L([138, 94], 'OFF', 10, 21),
    arrow([300, 48], [307, 55], [308, 68]), L([308, 78], 'INC', 10, 18),
    arrow([391, 36], [404, 50], [407, 72]), L([407, 79], 'INC', 10, 18),
    // COMM mode knobs: legends on their detent lines, with ticks.
    ...[MODE_1, MODE_2].flatMap(c => [
      L([c[0] - 33, 132], 'OFF', 10, 21), L([c[0], 122], 'SQL', 10, 22), L([c[0] + 31, 132], 'GD', 10, 13),
      { kind: 'path' as const, pen: 'medium' as const, d: path(tick(c, -MODE_ANGLE, 37, 44) + tick(c, 0, 37, 44) + tick(c, MODE_ANGLE, 37, 44)) },
    ]),
    // TF and THREAT.
    L([X3, 144], 'TF', 11, 13),
    L([X4, 144], 'THREAT', 11, 42),
    arrow([299, 157], [306, 164], [308, 180]), L([306, 186], 'INC', 10, 18),
    arrow([387, 157], [393, 164], [393, 178]), L([394, 186], 'INC', 10, 18),
    // Printed crosses.
    { kind: 'path', pen: 'fine', d: path('M338 109H346M342 105V113M131 258H139M135 254V262') },
    // AUDIO 2.
    L([X1, 242], 'INTERCOM', 11, 56),
    L([X2, 241], 'TACAN', 11, 38),
    L([X3, 241], 'ILS', 11, 17),
    arrow([112, 252], [126, 262], [129, 285]),
    arrow([205, 252], [212, 260], [213, 275]), L([214, 285], 'INC', 10, 18),
    arrow([298, 252], [305, 259], [306, 273]), L([307, 284], 'INC', 10, 18), L([242, 302], 'OFF', 10, 21),
    L([366, 239], 'HOT', 10, 21),
    L([366, 254], 'MIC', 10, 17),
    L([400, 292], 'OFF', 10, 21),
    L([366, 326], 'CIPHER', 10, 38),
  ],
  placements: [
    // AUDIO 1 DZUS, mirrored about the plate centre (x 222.5) at the mean heights.
    { component: 'dzus', at: pt(18.5, 48) },
    { component: 'dzus', at: pt(426.5, 48) },
    { component: 'dzus', at: pt(18.5, 185.5) },
    { component: 'dzus', at: pt(426.5, 185.5) },
    // AUDIO 2 DZUS, point-symmetric about the plate centre (222.5, 283).
    { component: 'dzus', at: pt(426.5, 266) },
    { component: 'dzus', at: pt(18.5, 300) },
    // Plate hold-down screws.
    { component: 'screw', at: pt(135, 22) },
    { component: 'screw', at: pt(322, 23) },
    { component: 'screw', at: pt(328, 200) },
    { component: 'screw', at: pt(338, 247) },
    { component: 'screw', at: pt(123, 317) },
    { component: 'knob-knurled-large', control: 'comm1-vol', at: pt(X1, Y_VOL) },
    { component: 'knob-knurled-large', control: 'comm2-vol', at: pt(X2, Y_VOL) },
    { component: 'knob-knurled-small', control: 'secure-voice', at: pt(X3, Y_VOL) },
    { component: 'knob-round', control: 'msl', at: pt(X4, Y_VOL) },
    { component: 'knob-bar-thick-large', control: 'comm1-mode', at: pt(...MODE_1) },
    { component: 'knob-bar-thick-large', control: 'comm2-mode', at: pt(...MODE_2) },
    { component: 'knob-knurled-small', control: 'tf', at: pt(X3, Y_LOW) },
    { component: 'knob-round-small', control: 'threat', at: pt(X4, Y_LOW) },
    { component: 'knob-cross', control: 'intercom', at: pt(X1, Y_A2) },
    { component: 'knob-cross-small', control: 'tacan', at: pt(X2, Y_A2) },
    { component: 'knob-round-small', control: 'ils', at: pt(X3, Y_A2) },
    { component: 'toggle-large', control: 'hot-mic', at: pt(366, 290) },
  ],
  controls: [
    {
      id: 'comm1-vol', name: 'COMM 1 power/volume knob', type: 'rotary', positions: volume(true), initial: 'off',
      description: 'Sets the UHF radio volume; turning it clockwise increases it. Fully anticlockwise turns the UHF radio off.',
      source: src,
    },
    {
      id: 'comm2-vol', name: 'COMM 2 power/volume knob', type: 'rotary', positions: volume(true), initial: 'off',
      description: 'Sets the VHF radio volume; turning it clockwise increases it. Fully anticlockwise turns the VHF radio off.',
      source: src,
    },
    {
      id: 'secure-voice', name: 'SECURE VOICE volume knob', type: 'rotary', positions: volume(false), initial: 'min',
      description: 'Secure voice volume. It has no function in DCS.',
      source: src,
    },
    {
      id: 'msl', name: 'MSL volume knob', type: 'rotary', positions: volume(false), initial: 'min',
      description: 'Sets the volume of the selected AIM-9 missile\'s seeker tone; clockwise increases it.',
      source: src,
    },
    {
      id: 'comm1-mode', name: 'COMM 1 mode knob', type: 'rotary', positions: mode, initial: 'sql',
      description: 'Squelch and guard for the UHF radio. OFF disables squelch, SQL enables it, GD tunes the radio to 243.0 MHz and disables the separate guard receiver (no effect with the IFF C & I knob at BACK UP).',
      source: src,
    },
    {
      id: 'comm2-mode', name: 'COMM 2 mode knob', type: 'rotary', positions: mode, initial: 'sql',
      description: 'Squelch and guard for the VHF radio. OFF disables squelch, SQL enables it, GD tunes the radio to 121.5 MHz.',
      source: src,
    },
    {
      id: 'tf', name: 'TF volume knob', type: 'rotary', positions: volume(false), initial: 'min',
      description: 'Terrain-following warning volume. It has no function in DCS.',
      source: src,
    },
    {
      id: 'threat', name: 'THREAT volume knob', type: 'rotary', positions: volume(false), initial: 'min',
      description: 'Sets the volume of the ALR-56M radar warning receiver tones; clockwise increases it.',
      source: src,
    },
    {
      id: 'intercom', name: 'INTERCOM volume knob', type: 'rotary', positions: volume(false), initial: 'min',
      description: 'Sets the intercom volume, used to talk to the ground crew or, through the boom, the tanker\'s boom operator. It also sets the volume of the landing gear and low speed warning tones and the voice messages.',
      source: src,
    },
    {
      id: 'tacan', name: 'TACAN volume knob', type: 'rotary', positions: volume(false), initial: 'min',
      description: 'Sets the volume of the TACAN station\'s Morse identifier; clockwise increases it.',
      source: src,
    },
    {
      id: 'ils', name: 'ILS power/volume knob', type: 'rotary', positions: volume(true), initial: 'off',
      description: 'Sets the volume of the tuned localizer\'s Morse identifier; clockwise increases it. Fully anticlockwise to OFF turns the ILS receiver off.',
      source: src,
    },
    {
      id: 'hot-mic', name: 'HOT MIC CIPHER switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'hot-mic', label: 'HOT MIC', hold: 'stable' },
        { id: 'off', label: 'OFF', hold: 'stable' },
        { id: 'cipher', label: 'CIPHER', hold: 'stable' },
      ],
      initial: 'off',
      description: 'HOT MIC opens the intercom to the ground crew, or to the boom operator while the boom is seated; a UHF or VHF transmission overrides it. CIPHER filters out non-secure UHF and VHF signals when secure voice is on. OFF disables both. Not implemented in DCS.',
      source: src,
    },
  ],
  indicators: [],
};
