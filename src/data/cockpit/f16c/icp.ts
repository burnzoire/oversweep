import type { ControlDef, Engraving, PanelSpec, Placement } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C Integrated Control Panel (ICP), DCS: the upfront panel above the
 * instrument panel's centre. Override and master mode buttons along a raised
 * top bar, the priority function / data entry keypad, RCL and ENTR, the DED
 * increment/decrement rocker, the Data Control Switch (DCS, "dobber"), DRIFT
 * C/O & WARN RESET, the TFR/FLIR controls and four thumbwheels in the sides.
 *
 * Reference: the guide's p. 99 image (660 x 480 JPEG, `pdfimages -j -f 99
 * -l 99`, image 002), squared up on the four corner screws. Values below are
 * rectified reference pixels.
 *
 * The ICP only reports presses (`cockpit:change`); what the DED shows is up to
 * the procedure that uses it (issue #349).
 */
const PX = 4.4;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 99–100';

/** Rounded rectangle in reference px. */
const rrect = (x0: number, y0: number, x1: number, y1: number, r: number) =>
  `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
const text = (t: string, x: number, y: number, cap: number, w?: number): Engraving =>
  ({ kind: 'text', text: t, at: pt(x, y), cap: mm(cap), ...(w ? { width: mm(w) } : {}) });
/** A word printed one letter under another (SYM, ICP, FLIR …): first letter centre, letter pitch. */
const column = (t: string, x: number, y: number, pitch: number, cap: number): Engraving[] =>
  [...t].map((c, i) => text(c, x, y + i * pitch, cap));

/* Keypad: caps 65 px square on a 90 px pitch (panel-edge rows 140/230/320, columns 120/210/300). */
const COLS = [120.5, 210.5, 300.5], ROWS = [142.5, 233.5, 323.5];
const KEY = [mm(65) + 2, mm(65) + 2] as [number, number];
const MSEL_X = 389, RCL_X = 418;

/** Priority function keys: digit, function legend above it, compass letter beside it. */
const KEYS: { id: string; digit: string; fn?: string; corner?: string; x: number; y: number; name: string; desc: string }[] = [
  { id: 'key-1', digit: '1', fn: 'T-ILS', x: COLS[0], y: ROWS[0], name: '1 / T-ILS key', desc: 'From the CNI page, calls the TACAN/ILS (T-ILS) page; otherwise enters the digit 1.' },
  { id: 'key-2', digit: '2', fn: 'ALOW', corner: 'N', x: COLS[1], y: ROWS[0], name: '2 / ALOW key', desc: 'From the CNI page, calls the ALOW (altitude low) page; otherwise enters 2, or N in a latitude.' },
  { id: 'key-3', digit: '3', x: COLS[2], y: ROWS[0], name: '3 key', desc: 'Enters the digit 3.' },
  { id: 'key-4', digit: '4', fn: 'STPT', corner: 'W', x: COLS[0], y: ROWS[1], name: '4 / STPT key', desc: 'From the CNI page, calls the STPT (steerpoint) page; otherwise enters 4, or W in a longitude.' },
  { id: 'key-5', digit: '5', fn: 'CRUS', x: COLS[1], y: ROWS[1], name: '5 / CRUS key', desc: 'From the CNI page, calls the CRUS (cruise) page; otherwise enters 5.' },
  { id: 'key-6', digit: '6', fn: 'TIME', corner: 'E', x: COLS[2], y: ROWS[1], name: '6 / TIME key', desc: 'From the CNI page, calls the TIME page; otherwise enters 6, or E in a longitude.' },
  { id: 'key-7', digit: '7', fn: 'MARK', x: COLS[0], y: ROWS[2], name: '7 / MARK key', desc: 'From the CNI page, calls the MARK page; otherwise enters 7.' },
  { id: 'key-8', digit: '8', fn: 'FIX', corner: 'S', x: COLS[1], y: ROWS[2], name: '8 / FIX key', desc: 'From the CNI page, calls the FIX page; otherwise enters 8, or S in a latitude.' },
  { id: 'key-9', digit: '9', fn: 'A-CAL', x: COLS[2], y: ROWS[2], name: '9 / A-CAL key', desc: 'From the CNI page, calls the A-CAL (altitude calibration) page; otherwise enters 9.' },
  { id: 'key-0', digit: '0', fn: 'M-SEL', corner: '-', x: MSEL_X, y: ROWS[2], name: '0 / M-SEL key', desc: 'Mode select: cycles modes or settings on some DED pages; also enters 0, or a negative value.' },
];

/** Override and master mode buttons on the raised top bar (detected circles, y 48). */
const TOP: { id: string; legend: [string, string?]; x: number; name: string; desc: string }[] = [
  { id: 'com1', legend: ['COM', '1'], x: 92, name: 'COM 1 override button', desc: 'Shows the UHF DED page; a second press returns the DED to the page it showed before.' },
  { id: 'com2', legend: ['COM', '2'], x: 187, name: 'COM 2 override button', desc: 'Shows the VHF DED page; a second press returns the DED to the page it showed before.' },
  { id: 'iff', legend: ['IFF'], x: 284, name: 'IFF override button', desc: 'Shows the IFF DED page; a second press returns the DED to the page it showed before.' },
  { id: 'list', legend: ['LIST'], x: 379, name: 'LIST override button', desc: 'Shows the LIST DED page of less frequently used pages; a second press returns the DED to the page it showed before.' },
  { id: 'a-a', legend: ['A-A'], x: 477, name: 'A-A master mode button', desc: 'Selects the air-to-air master mode; pressing it again in A-A returns to NAV.' },
  { id: 'a-g', legend: ['A-G'], x: 569, name: 'A-G master mode button', desc: 'Selects the air-to-ground master mode; pressing it again in A-G returns to NAV.' },
];

const push = (id: string, name: string, description: string, source = src): ControlDef => ({
  id, name, type: 'pushbutton', description, source,
  positions: [{ id: 'out', label: 'OUT' }, { id: 'in', label: 'PRESSED', hold: 'momentary', spring: 'out' }], initial: 'out',
});
/** Thumbwheel detents, top to bottom; `off` at the bottom where a wheel has an OFF stop. */
const wheel = (id: string, name: string, steps: [id: string, label: string][], initial: string, description: string): ControlDef => ({
  id, name, type: 'rotary', travel: 'vertical', description, source: src, initial,
  positions: steps.map(([pid, label], i) => ({ id: pid, label, angle: i * 30 })),
});
const BRIGHT: [string, string][] = [['5', '5 (brightest)'], ['4', '4'], ['3', '3'], ['2', '2'], ['1', '1 (dimmest)']];
const rocker = (id: string, name: string, description: string): ControlDef => ({
  id, name, type: 'toggle', travel: 'vertical', description, source: src, initial: 'center',
  positions: [
    { id: 'up', label: 'UP (increment)', hold: 'momentary', spring: 'center' },
    { id: 'center', label: 'CENTRE' },
    { id: 'down', label: 'DOWN (decrement)', hold: 'momentary', spring: 'center' },
  ],
});

export const icp: PanelSpec = {
  id: 'icp',
  title: 'Integrated control panel (ICP)',
  canvas: [mm(660), mm(480)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide (EN, 16 August 2026)',
    page: 99,
    image: 'p. 99 ICP image (660 x 480 JPEG)',
    rectify: 'python3 -I scripts/panel-trace.py <image.png> <scratch> 26,27=31,26 634,24=631,26 37,451=31,451 628,452=631,451 660 480',
    pxPerMm: PX,
    scale: 'The four corner screws (heads about 15 px radius) are taken as the shared panel screw (3.4 mm), giving 4.4 px/mm; the panel is then 148 mm (5.8 in) wide, the common upfront and console panel width.',
    shown: { 'drift-warn': 'norm', 'flir-mode': 'lvl', 'dcs-ud': 'center', 'dcs-lr': 'center', 'ded-incdec': 'center', 'flir-incdec': 'center' },
    unresolved: [
      'The keypad caps stand tall; the guide camera sees their tops shifted from their bases. Each key is drawn where its top face is, on one 90 px grid.',
      'The thumbwheels are seen edge-on in the panel sides; the guide does not show how many detents they have. SYM and BRT are drawn with five brightness steps and an OFF stop at the bottom (the OFF legends sit below them), CONT with five steps, RET DEPR in 20-mil steps from 0 to 260 mils (guide p. 99). Which way RET DEPR rolls to lower the reticle is not stated; down is drawn as more depression.',
      'The HUD symbology brightness the reader sees, and every DED page change, depend on aircraft power and are left to the procedures (no systems logic on this page).',
      'The DCS lever is drawn as a flat block in a round well; the guide image shows its top only.',
      'The FLIR GAIN/LVL/AUTO switch has three positions; whether any is spring-loaded is not stated (no function in the Block 50).',
    ],
  },
  plate: [
    // Base plate: left 3, right 657 (panel-edge row 95), top 2, bottom 478 (the image crop; screws sit symmetric 26/451).
    { d: path(rrect(3, 2, 657, 478, 14)) },
    // Raised top bar carrying the override and master mode buttons: x 47–613 (rows 75), y 8–87 (columns 140, 425, 520).
    { d: path(rrect(47, 8, 613, 87, 8)), raised: true },
  ],
  engraving: [
    ...column('SYM', 64, 118, 23, 16),
    ...column('ICP', 76, 215, 28, 24),
    ...column('BRT', 64, 317, 23, 16),
    text('OFF', 27, 240, 11, 22), text('OFF', 70, 412, 11, 22),
    ...column('RET', 580, 102, 28, 14),
    ...column('DEPR', 599, 112, 23, 14),
    ...column('CONT', 592, 280, 22, 16),
    ...column('FLIR', 499, 187, 36.7, 20),
    // FLIR rules above and below the legend.
    { kind: 'path', d: path('M500 105V160M500 318V435'), pen: 'heavy' },
    text('GAIN', 539, 341, 12, 34), text('LVL', 588, 382, 12, 26), text('AUTO', 537, 432, 12, 38),
    text('DRIFT C/O', 382, 372, 14, 90), text('NORM', 444, 417.5, 14, 52), text('WARN RESET', 388, 458, 14, 105),
    text('RTN', 210, 418, 14, 34), text('SEQ', 310, 418, 14, 34),
    // DCS arrows above and below the well.
    { kind: 'path', d: path('M257 362L263 376H251ZM257 372V388M257 472L263 458H251ZM257 462V446'), pen: 'medium' },
  ],
  placements: [
    ...TOP.map((b): Placement => ({
      component: 'push-round-wide', control: b.id, at: pt(b.x, 48),
      legend: b.legend[1]
        ? [{ text: b.legend[0], cap: mm(11), y: mm(-8), width: mm(28) }, { text: b.legend[1], cap: mm(11), y: mm(10) }]
        : [{ text: b.legend[0], cap: mm(12), y: 0, ...(b.legend[0].length > 3 ? { width: mm(36) } : {}) }],
    })),
    ...KEYS.map((k): Placement => ({
      component: 'push-square', control: k.id, at: pt(k.x, k.y), size: KEY,
      legend: [
        ...(k.fn ? [{ text: k.fn, cap: mm(12), y: mm(-15), width: mm(k.fn.length * 8.6) }] : []),
        { text: k.digit, cap: mm(22), y: mm(11) },
        ...(k.corner ? [{ text: k.corner, cap: mm(9), y: mm(17), x: mm(22) }] : []),
      ],
    })),
    { component: 'push-square', control: 'rcl', at: pt(RCL_X, ROWS[0]), size: KEY, legend: [{ text: 'RCL', cap: mm(13), y: 0, width: mm(30) }] },
    { component: 'push-square', control: 'entr', at: pt(RCL_X, ROWS[1]), size: KEY, legend: [{ text: 'ENTR', cap: mm(13), y: 0, width: mm(38) }] },
    { component: 'push-round-plain', control: 'wx', at: pt(543.5, 159), legend: [{ text: 'WX', cap: mm(13), y: 0 }] },
    { component: 'rocker', control: 'flir-incdec', at: pt(543.5, 263), size: [mm(47), mm(93)] },
    { component: 'rocker', control: 'ded-incdec', at: pt(121, 424), size: [mm(48), mm(92)] },
    { component: 'hat', control: 'dcs-ud', cross: 'dcs-lr', at: pt(257, 418), r: mm(30), lever: [mm(24), mm(42)], throw: mm(9) },
    { component: 'toggle-large', control: 'drift-warn', at: pt(383, 418) },
    { component: 'toggle-medium', control: 'flir-mode', at: pt(537, 386.5) },
    { component: 'thumbwheel', control: 'sym', at: pt(27, 138), size: [mm(44), mm(148)] },
    { component: 'thumbwheel', control: 'brt', at: pt(27, 347), size: [mm(44), mm(148)] },
    { component: 'thumbwheel', control: 'ret-depr', at: pt(633, 138), size: [mm(44), mm(148)] },
    { component: 'thumbwheel', control: 'cont', at: pt(633, 347), size: [mm(44), mm(148)] },
    { component: 'screw', at: pt(31, 26) }, { component: 'screw', at: pt(631, 26) },
    { component: 'screw', at: pt(31, 451) }, { component: 'screw', at: pt(631, 451) },
  ],
  controls: [
    ...TOP.map(b => push(b.id, b.name, b.desc)),
    ...KEYS.map(k => push(k.id, k.name, k.desc + ' With the CNI page showing, the priority functions; on any other page, data entry.')),
    push('rcl', 'RCL (recall) button', 'First press erases the last digit typed, like a backspace key; a second press rejects all the new data and restores what was there.'),
    push('entr', 'ENTR (enter) button', 'Accepts the new data into the highlighted DED field.'),
    push('wx', 'TFR WX button', 'Terrain-following radar weather mode. Not used in the Block 50.', 'DCS F-16C guide p. 100 (item 14)'),
    rocker('ded-incdec', 'DED increment/decrement rocker', 'Steps the selected DED field up or down; fields that it can change show an up/down arrow beside them. The DCS chooses the field.'),
    rocker('flir-incdec', 'FLIR increment/decrement rocker', 'FLIR control. Not used in the Block 50.'),
    {
      id: 'dcs-ud', name: 'Data control switch (DCS) up/down', type: 'toggle', travel: 'vertical', initial: 'center', source: src,
      description: 'The "dobber". Up and down move the asterisks (the selected field) through the fields of the DED page; what else it does depends on the page.',
      positions: [
        { id: 'up', label: 'UP', hold: 'momentary', spring: 'center' },
        { id: 'center', label: 'CENTRE' },
        { id: 'down', label: 'DOWN', hold: 'momentary', spring: 'center' },
      ],
    },
    {
      id: 'dcs-lr', name: 'Data control switch (DCS) RTN/SEQ', type: 'toggle', travel: 'horizontal', initial: 'center', source: src,
      description: 'RTN returns the DED to the CNI page, erasing any data entered but not accepted. SEQ steps through the sub-pages or data fields of the page shown.',
      positions: [
        { id: 'rtn', label: 'RTN', hold: 'momentary', spring: 'center' },
        { id: 'center', label: 'CENTRE' },
        { id: 'seq', label: 'SEQ', hold: 'momentary', spring: 'center' },
      ],
    },
    {
      id: 'drift-warn', name: 'DRIFT C/O & WARN RESET switch', type: 'toggle', travel: 'vertical', initial: 'norm', source: src,
      description: 'DRIFT C/O cages the flight path marker and attitude bars to the HUD centre (for crosswind, sideslip or a degraded INS). NORM lets them drift with the true flight path. WARN RESET (spring-loaded back to NORM) clears HUD warnings and their voice messages and resets the maximum-G readout to 1.0.',
      positions: [
        { id: 'drift', label: 'DRIFT C/O' },
        { id: 'norm', label: 'NORM' },
        { id: 'warn-reset', label: 'WARN RESET', hold: 'momentary', spring: 'norm' },
      ],
    },
    {
      id: 'flir-mode', name: 'FLIR GAIN/LVL/AUTO switch', type: 'toggle', travel: 'vertical', initial: 'lvl', source: 'DCS F-16C guide p. 100 (item 14)',
      description: 'FLIR gain and level mode. Not used in the Block 50.',
      positions: [{ id: 'gain', label: 'GAIN' }, { id: 'lvl', label: 'LVL' }, { id: 'auto', label: 'AUTO' }],
    },
    wheel('sym', 'SYM wheel', [...BRIGHT, ['off', 'OFF']], 'off', 'HUD symbology brightness: roll up to brighten, down to dim, to OFF at the bottom.'),
    wheel('brt', 'BRT wheel', [...BRIGHT, ['off', 'OFF']], 'off', 'HUD raster brightness. Not used in the Block 50.'),
    wheel('cont', 'CONT wheel', [['5', '5 (most)'], ['4', '4'], ['3', '3'], ['2', '2'], ['1', '1 (least)']], '1', 'HUD raster contrast. Not used in the Block 50.'),
    wheel('ret-depr', 'RET DEPR wheel', Array.from({ length: 14 }, (_, i): [string, string] => [String(i * 20), `${i * 20} MIL`]), '0', 'Reticle depression: sets the depressible reticle shown in the HUD in manual (MAN) bombing, 0 to 260 milliradians.'),
  ],
  indicators: [],
};
