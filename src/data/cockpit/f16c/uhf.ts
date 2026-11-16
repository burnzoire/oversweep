import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C UHF backup control panel (left console), DCS.
 *
 * Reference: the guide's p. 262 "UHF Backup Control Panel" cockpit image
 * (550 x 460 JPEG, extracted with `pdfimages -j -f 262 -l 262`). The image is
 * square-on (the four outer DZUS columns are vertical to within a pixel), so it
 * is traced unrectified. Measurements below are in reference pixels and stored
 * in mm.
 */
const PX = 3.75;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 259–260';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
/** Manual frequency knobs, left to right (reference px). */
const FK: [number, number][] = [75, 176, 277, 378, 479].map(x => [x, 273]);
/** Function and mode selector centres (reference px). */
const FN: [number, number] = [126, 398], MD: [number, number] = [428, 398];
/** A legend's centre on a detent line, `r` reference px from the knob centre. */
const onDetent = ([x, y]: [number, number], a: number, r: number): [number, number] =>
  [+(x + r * Math.sin(a * Math.PI / 180)).toFixed(1), +(y - r * Math.cos(a * Math.PI / 180)).toFixed(1)];
const digits = Array.from({ length: 10 }, (_, d) => ({ id: String(d), label: String(d), angle: d * 36, hold: 'stable' as const }));
const pushed = [
  { id: 'out', label: 'Released', hold: 'stable' as const },
  { id: 'in', label: 'Pressed', hold: 'momentary' as const, spring: 'out' },
];
/**
 * Unlit 10-segment LED digit (outlines only), centred on (cx, cy), half-size
 * w x h in reference px: the seven bars with the middle bar split in two, and
 * two diagonals (centre to top right, bottom left to centre), as the lit
 * digits in the reference show.
 */
const led = (cx: number, cy: number, w: number, h: number) => {
  const t = Math.min(w, h) * 0.3, g = t * 0.35, f = (v: number) => +v.toFixed(2);
  const hz = (x1: number, x2: number, y: number) =>
    `M${f(x1)} ${f(y)}L${f(x1 + t / 2)} ${f(y - t / 2)}H${f(x2 - t / 2)}L${f(x2)} ${f(y)}L${f(x2 - t / 2)} ${f(y + t / 2)}H${f(x1 + t / 2)}Z`;
  const vt = (x: number, y1: number, y2: number) =>
    `M${f(x)} ${f(y1)}L${f(x + t / 2)} ${f(y1 + t / 2)}V${f(y2 - t / 2)}L${f(x)} ${f(y2)}L${f(x - t / 2)} ${f(y2 - t / 2)}V${f(y1 + t / 2)}Z`;
  const dg = (x1: number, y1: number, x2: number, y2: number) => {
    const l = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / l * t * 0.3, ny = (x2 - x1) / l * t * 0.3;
    return `M${f(x1 + nx)} ${f(y1 + ny)}L${f(x2 + nx)} ${f(y2 + ny)}L${f(x2 - nx)} ${f(y2 - ny)}L${f(x1 - nx)} ${f(y1 - ny)}Z`;
  };
  const [l, r, tp, bt] = [cx - w, cx + w, cy - h, cy + h];
  return [
    hz(l + g, r - g, tp), hz(l + g, r - g, bt), hz(l + g, cx - g, cy), hz(cx + g, r - g, cy),
    vt(l, tp + g, cy - g), vt(l, cy + g, bt - g), vt(r, tp + g, cy - g), vt(r, cy + g, bt - g),
    dg(cx + g + t / 2, cy - g - t / 2, r - g - t / 2, tp + g + t / 2), dg(l + g + t / 2, bt - g - t / 2, cx - g - t / 2, cy + g + t / 2),
  ].join('');
};

/** Preset card table: column and row rules (reference px). */
const COLS = [42, 63.5, 117, 136.5, 185, 210, 266.5], ROWS = [15, 30, 44, 58, 72.5, 87, 101, 116];
const card = [
  ...COLS.map(x => `M${x} ${ROWS[0]}V${ROWS[ROWS.length - 1]}`),
  ...ROWS.map(y => `M${COLS[0]} ${y}H${COLS[COLS.length - 1]}`),
].join('');
/** Row labels: the header row (CH, FREQ) then channels 1 to 20 down the three column pairs. */
const cardText = [
  L([52.7, 22.5], 'CH', 5.5),
  L([90, 22.5], 'FREQ', 5.5, 15),
  ...Array.from({ length: 20 }, (_, i) => {
    const ch = i + 1, col = ch <= 6 ? 0 : ch <= 13 ? 1 : 2, row = ch <= 6 ? ch : ch <= 13 ? ch - 7 : ch - 14;
    const x = (COLS[col * 2] + COLS[col * 2 + 1]) / 2, y = (ROWS[row] + ROWS[row + 1]) / 2;
    return L([x, y], String(ch), 5.5);
  }),
];

export const uhf: PanelSpec = {
  id: 'uhf',
  title: 'UHF backup control panel',
  canvas: [mm(550), mm(460)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 262,
    image: 'p. 262 "UHF Backup Control Panel" cockpit image, 550 x 460 px',
    rectify: 'none: the image is square-on (DZUS columns at x 18 and x 529 are vertical), traced as extracted',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads (about 32 px) match.',
    shown: { chan: '4', 'freq-1': '3', 'freq-2': '6', 'freq-3': '0', 'freq-4': '4', 'freq-5': '00', function: 'both', mode: 'preset' },
    unresolved: [
      'The CHAN and frequency displays are drawn unlit, with faint outlines of their 10-segment digits; the digits they show (04 and 360.400 in the reference) depend on the radio state, not on the knobs alone.',
      'The preset card is a write-on card; only its rules, headings and channel numbers are drawn.',
      'CHAN detents are taken as 18° apart (20 presets), from the bar angle at preset 4. The frequency digit knobs are taken as 36° apart, matching their bar angles at 6, 0 and 4.',
      'The TONE and SQUELCH switches are seen end-on in the reference, so their lever positions are not readable. TONE is drawn as a spring-loaded switch toward TONE.',
      'VOL has no function in DCS; it is modelled with four detents.',
      'The plate edges are cropped in the reference; the drawn edges sit just inside the crop.',
    ],
  },
  plate: [
    { d: path('M6 2H544Q548 2 548 6V454Q548 458 544 458H6Q2 458 2 454V6Q2 2 6 2Z') },
    // Raised face: only the DZUS corners are cut away; the preset card sits on the face.
    // Cut-outs measured from the reference (px, brightness gradient plus 5x crops):
    // top-left x <= 37, y <= 126; top-right x >= 510, y <= 136.5; lower strips
    // x <= 43.5 below y 320 and x >= 505 below y 323. The unrectified reference
    // sits a few px lower on the right, so the left and right cut-outs (and their
    // DZUS) are drawn mirrored about the centre at the mean heights: top cut-outs
    // down to y 133, lower strips from y 321.5. All four are the same width
    // (35 px, the top-left's, which the preset card bounds). Inner corners
    // rounded at 12 px.
    { d: path('M37 2H513V121Q513 133 525 133H548V321.5H525Q513 321.5 513 333.5V458H37V333.5Q37 321.5 25 321.5H2V133H25Q37 133 37 121Z'), raised: true },
    // Preset channel card.
    { d: path('M42 9H272Q277 9 277 14V117Q277 122 272 122H42Q37 122 37 117V14Q37 9 42 9Z'), raised: true },
  ],
  engraving: [
    { kind: 'path', pen: 'fine', d: path(card) },
    ...cardText,
    // CHAN.
    L([365, 28], 'CHAN', 12, 44),
    { kind: 'path', pen: 'heavy', d: path('M339 63H391V106H339Z') },
    { kind: 'path', pen: 'fine', d: path('M343 67H387V102H343Z') },
    { kind: 'path', pen: 'fine', faint: true, d: path(led(354, 84.5, 9, 12.5) + led(376, 84.5, 9, 12.5)) },
    // TEST DISPLAY and STATUS.
    L([56, 163], 'TEST', 11, 28),
    L([57, 176], 'DISPLAY', 10, 49),
    L([483, 177], 'STATUS', 11, 39),
    // Frequency display, the digit underline bars and the leaders to their knobs.
    { kind: 'path', pen: 'heavy', d: path('M180 156H378V197H180Z') },
    { kind: 'path', pen: 'fine', d: path('M182 158H376V195H182Z') },
    { kind: 'path', pen: 'fine', faint: true, d: path([0, 1, 2, 3, 4, 5].map(k => led(194.5 + 33 * k, 176.5, 9.5, 13.5)).join('') + 'M275 189.5H277V191.5H275Z') },
    { kind: 'path', pen: 'heavy', d: path('M178 202H207M213 202H238M248 202H278M283 202H312M317 202H377') },
    // Leaders from each digit bar to the rim of its knob.
    { kind: 'path', d: path([190, 226, 263, 297, 345].map((x, i) => {
      const [cx, cy] = FK[i], dx = x - cx, dy = 204 - cy, l = Math.hypot(dx, dy), r = 28;
      return `M${x} 204L${(cx + dx / l * r).toFixed(1)} ${(cy + dy / l * r).toFixed(1)}`;
    }).join('')) },
    // A-3-2 knob.
    ...([['2', -117], ['3', -90], ['A', -57]] as const).map(([t, a]) => L(onDetent(FK[0], a, 40), t, 10)),
    // Function knob.
    ...([['OFF', -58, 26], ['MAIN', -25, 33], ['BOTH', 25, 37], ['ADF', 58, 26]] as const).map(([t, a, w]) => L(onDetent(FN, a, 70), t, 11.5, w)),
    // VOL.
    L([277, 336], 'VOL', 11.5, 26),
    // Mode knob.
    ...([['MNL', -37, 27], ['PRESET', 0, 51], ['GRD', 37, 25]] as const).map(([t, a, w]) => L(onDetent(MD, a, 67), t, 11.5, w)),
    // TONE and SQUELCH.
    L([187, 432], 'T', 10),
    L([244, 432], 'TONE', 10, 28),
    L([330.5, 411.5], 'SQUELCH', 10, 46),
    L([302, 432], 'OFF', 10, 21),
    L([359, 432], 'ON', 10, 15),
    // Vertical "UHF" and the part number.
    ...([['U', 217], ['H', 241], ['F', 264]] as const).map(([t, y]) => L([530, y], t, 15, 13)),
    L([525, 372], '806', 8, 18),
  ],
  placements: [
    ...([[18, 58.5], [18, 115.5], [18, 345], [18, 398.5], [532, 58.5], [532, 115.5], [532, 345], [532, 398.5]] as const)
      .map(([x, y]) => ({ component: 'dzus' as const, at: pt(x, y) })),
    ...([[15, 159], [15, 300.5], [535, 159], [535, 300.5], [310, 20], [477, 24], [75, 438], [275, 440], [478, 440]] as const)
      .map(([x, y]) => ({ component: 'screw' as const, at: pt(x, y) })),
    { component: 'knob-spindle', control: 'chan', at: pt(465, 87) },
    { component: 'push-round-medium', control: 'test-display', at: pt(104, 170) },
    { component: 'push-round-medium', control: 'status', at: pt(445, 177) },
    ...FK.map(([x, y], i) => ({ component: 'knob-bar-medium' as const, control: `freq-${i + 1}`, at: pt(x, y) })),
    { component: 'knob-radio-large', control: 'function', at: pt(...FN) },
    { component: 'knob-knurled-mini', control: 'vol', at: pt(277, 368) },
    { component: 'knob-radio-large', control: 'mode', at: pt(...MD) },
    { component: 'toggle-mini-hex', control: 'tone', at: pt(213, 432) },
    { component: 'toggle-mini-hex', control: 'squelch', at: pt(330.5, 432) },
  ],
  controls: [
    {
      id: 'chan', name: 'CHAN knob', type: 'rotary', cyclic: true,
      positions: Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1), label: `Preset ${i + 1}`, angle: i * 18, hold: 'stable' as const })),
      initial: '1',
      description: 'Selects one of the 20 preset channels. In PRESET mode the radio tunes the selected channel and the CHAN window shows its number; in MNL and GRD the window is blank.',
      source: src,
    },
    {
      id: 'test-display', name: 'TEST DISPLAY button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Lights every segment of the CHAN and frequency displays while held, to check them.',
      source: src,
    },
    {
      id: 'status', name: 'STATUS button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Shows the frequency the radio is tuned to in the frequency display while pressed.',
      source: src,
    },
    {
      id: 'freq-1', name: 'Manual frequency knob 1 (A-3-2)', type: 'rotary',
      positions: [
        { id: '2', label: '2', angle: -117, hold: 'stable' },
        { id: '3', label: '3', angle: -90, hold: 'stable' },
        { id: 'a', label: 'A', angle: -57, hold: 'stable' },
      ],
      initial: '3',
      description: 'Sets the first digit (2 or 3) of the manual frequency. A selects anti-jam (HAVE QUICK) mode, which is not implemented in DCS.',
      source: src,
    },
    ...[2, 3, 4].map(k => ({
      id: `freq-${k}`, name: `Manual frequency knob ${k}`, type: 'rotary' as const, cyclic: true, positions: digits, initial: '0',
      description: `Sets digit ${k} of the manual frequency, used in MNL mode.`,
      source: src,
    })),
    {
      id: 'freq-5', name: 'Manual frequency knob 5', type: 'rotary', cyclic: true,
      positions: ['00', '25', '50', '75'].map((id, i) => ({ id, label: id, angle: i * 90, hold: 'stable' as const })),
      initial: '00',
      description: 'Sets the last two digits of the manual frequency (00, 25, 50 or 75), used in MNL mode.',
      source: src,
    },
    {
      id: 'function', name: 'Function knob', type: 'rotary',
      positions: [
        { id: 'off', label: 'OFF', angle: -58, hold: 'stable' },
        { id: 'main', label: 'MAIN', angle: -25, hold: 'stable' },
        { id: 'both', label: 'BOTH', angle: 25, hold: 'stable' },
        { id: 'adf', label: 'ADF', angle: 58, hold: 'stable' },
      ],
      initial: 'off',
      description: 'OFF removes power from the backup radio. MAIN works the radio on the selected preset or manual frequency, with the guard receiver off. BOTH adds the guard receiver on 243.0 MHz. ADF has no function in DCS.',
      source: src,
    },
    {
      id: 'vol', name: 'VOL knob', type: 'rotary',
      positions: [
        { id: 'min', label: 'Min', angle: -135, hold: 'stable' },
        { id: 'low', label: 'Low', angle: -45, hold: 'stable' },
        { id: 'high', label: 'High', angle: 45, hold: 'stable' },
        { id: 'max', label: 'Max', angle: 135, hold: 'stable' },
      ],
      initial: 'high',
      description: 'Volume control for the backup radio. No function in DCS.',
      source: src,
    },
    {
      id: 'mode', name: 'Mode knob', type: 'rotary',
      positions: [
        { id: 'mnl', label: 'MNL', angle: -37, hold: 'stable' },
        { id: 'preset', label: 'PRESET', angle: 0, hold: 'stable' },
        { id: 'grd', label: 'GRD', angle: 37, hold: 'stable' },
      ],
      initial: 'preset',
      description: 'MNL tunes the frequency set on the five manual frequency knobs. PRESET tunes the preset channel selected on the CHAN knob. GRD tunes the guard frequency, 243.0 MHz, and turns the separate guard receiver off.',
      source: src,
    },
    {
      id: 'tone', name: 'TONE switch', type: 'toggle', travel: 'horizontal',
      positions: [{ id: 'off', label: 'Off', hold: 'stable' }, { id: 'tone', label: 'TONE', hold: 'momentary', spring: 'off' }],
      initial: 'off',
      description: 'Transmits a tone on the selected frequency while held. Not implemented in DCS.',
      source: src,
    },
    {
      id: 'squelch', name: 'SQUELCH switch', type: 'toggle', travel: 'horizontal',
      positions: [{ id: 'off', label: 'OFF', hold: 'stable' }, { id: 'on', label: 'ON', hold: 'stable' }],
      initial: 'on',
      description: 'Turns the receiver squelch on or off. With it off, background noise is heard when no one is transmitting.',
      source: src,
    },
  ],
  indicators: [],
};
