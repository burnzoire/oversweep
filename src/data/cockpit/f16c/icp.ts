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
const column = (t: string, x: number, y: number, pitch: number, cap: number, widths?: number[]): Engraving[] =>
  [...t].map((c, i) => text(c, x, y + i * pitch, cap, widths?.[i]));

/**
 * Plate corners cut round the corner screws (all in px): the cut is a circle of radius CUT round the screw that runs
 * on as a vertical line, tangent to it, out to the end of the plate (Nathan).
 */
const SCREWS: [number, number][] = [[31, 26], [631, 26], [31, 451], [631, 451]];
const CUT = 25;
const f = (v: number) => +v.toFixed(1);
/** Where the cut circle round screw (sx, sy) meets the vertical edge x, toward the plate's middle. */
const meet = ([sx, sy]: [number, number], x: number) => f(sy + Math.sign(240 - sy) * Math.sqrt(CUT ** 2 - (x - sx) ** 2));
const [tl, tr, bl, br] = SCREWS.map((s, i) => meet(s, i % 2 ? 610 : 50));
const [xl, xr] = [SCREWS[0][0] + CUT, SCREWS[1][0] - CUT];
const arc = `A${CUT} ${CUT} 0 0 0`;
/** OFF blocks between the wheels: y 217–267, out to x 10 and 650, corner radius 4. */
const FACE = `M${xl} 2H${xr}V${SCREWS[1][1]}${arc} 610 ${tr}V217H646Q650 217 650 221V263Q650 267 646 267H610V${br}${arc} ${xr} ${SCREWS[3][1]}V478` +
  `H${xl}V${SCREWS[2][1]}${arc} 50 ${bl}V267H14Q10 267 10 263V221Q10 217 14 217H50V${tl}${arc} ${xl} ${SCREWS[0][1]}Z`;
const BAR = `M${xl} 8H${xr}V${SCREWS[1][1]}${arc} 610 ${tr}V81Q610 87 604 87H56Q50 87 50 81V${tl}${arc} ${xl} ${SCREWS[0][1]}Z`;

/* Keypad: caps 65 px square on a 90 px pitch (panel-edge rows 140/230/320, columns 120/210/300). */
const COLS = [120.5, 210.5, 300.5], ROWS = [142.5, 233.5, 323.5];
const KEY = [mm(65) + 2, mm(65) + 2] as [number, number];
const MSEL_X = 389, RCL_X = 418;

/**
 * Keypad ridges (zoom of the keypad): bars about 6 px wide centred between the keys, vertical at x 165.5, 255.5
 * and 345 (y 100–358), horizontal at y 188 and 278.5 (x 78–352), and three round bumps, between 2 and 5
 * (212, 188) and between 6 and 9 (287 and 317, 278.5). Drawn as one outlined shape: the outlines first, then
 * the fills over them, so the crossings join.
 */
const RIDGE_W = 6;
const RIDGE_RECTS = [
  // Placed from Nathan's marked-up side-by-side: full-height ridges between the key columns, a short one between
  // 9 and M-SEL (below the 6/9 cross ridge only), one between 3/6 and RCL/ENTR, and the cross ridges running from inside ICP out past RCL/ENTR.
  ...[[165, 108, 358], [256, 108, 358], [345, 277.5, 356], [360, 105, 279]].map(([x, y0, y1]) => [x - RIDGE_W / 2, y0, RIDGE_W, y1 - y0]),
  ...[187.5, 277.5].map(y => [96, y - RIDGE_W / 2, 352, RIDGE_W]),
].map(([x, y, w, h]) => `<rect x="${mm(x)}" y="${mm(y)}" width="${mm(w)}" height="${mm(h)}" rx="${mm(2)}"`);
const BUMPS = [[212, 188], [287, 278.5], [317, 278.5]].map(([x, y]) => `<circle cx="${mm(x)}" cy="${mm(y)}" r="${mm(5)}"`);
const RIDGES = `<g stroke="var(--panel-ink,#161616)" stroke-width="0.8">${[...RIDGE_RECTS, ...BUMPS].map(e => e + ' fill="none"/>').join('')}</g>` +
  `<g fill="var(--panel-paper,#fff)" stroke="none">${[...RIDGE_RECTS, ...BUMPS].map(e => e + '/>').join('')}</g>` +
  `<g fill="none" stroke="var(--panel-ink,#161616)" stroke-width="0.25">${BUMPS.map(e => e.replace(/r="([\d.]+)"/, (_, r) => `r="${+(r * 0.55).toFixed(3)}"`) + '/>').join('')}</g>`;

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
    // It carries the corner screws and the thumbwheels.
    { d: path(rrect(3, 2, 657, 478, 14)) },
    // Face plate: its sides run down beside the thumbwheels at x 50 and 610 (zoom of both side strips) and jut out
    // between each pair of wheels round the OFF legend (y 217–267); its corners are cut round the corner screws.
    { d: path(FACE), raised: true },
    // Raised top bar carrying the override and master mode buttons, y 8–87 (columns 140, 425, 520), the same width
    // as the face plate, its top corners cut round the screws like the face plate's.
    { d: path(BAR), raised: true },
  ],
  engraving: [
    // Keypad ridges (under the keys): raised bars between the rows and columns, with the locating bumps.
    { kind: 'svg', markup: RIDGES },
    // Large legends: letter boxes measured on the rectified image (bright blobs), one letter under another.
    ...column('SYM', 66, 118.5, 23.2, 17, [8, 10, 10]),
    ...column('ICP', 72, 215, 29.7, 20, [3, 10, 11]),
    ...column('BRT', 65.5, 314.5, 23, 17, [9, 9, 8]),
    text('OFF', 31.5, 234, 11.5, 23), text('OFF', 72, 415, 12, 24),
    ...column('RET', 583, 120, 23.5, 16.5, [8, 8, 7]),
    ...column('DEPR', 596, 108, 23, 16, [8, 8, 7, 8]),
    ...column('CONT', 593.5, 281, 21, 16, [8, 9, 8, 8]),
    ...column('FLIR', 502, 227, 24.2, 18.5, [9, 9, 3, 10]),
    // FLIR rules above and below the legend (x 503, y 108–170 in the guide, run on to the legend as Nathan asked; x 500.5, y 317–438).
    { kind: 'path', d: path('M502 108V210M502 317V438'), pen: 'heavy' },
    // GAIN/LVL/AUTO at the DRIFT C/O size, lined up on the toggle (Nathan).
    text('GAIN', 537, 348, 14, 40), text('LVL', 588, 386.5, 14, 30), text('AUTO', 537, 425, 14, 44),
    text('DRIFT C/O', 383, 378, 14, 90), text('NORM', 444, 417.5, 14, 52), text('WARN RESET', 388, 458, 14, 105),
    text('RTN', 204.5, 418, 14, 34), text('SEQ', 309.5, 418, 14, 34),
    // DCS arrows above and below the well, filled (zoom: tips 361 and 474, heads 13 px wide and 14 long, 5 px shafts).
    { kind: 'svg', markup: `<path d="${path('M257 361.5L263.5 375.5H259.5V383.5H254.5V375.5H250.5ZM257 474.5L263.5 460.5H259.5V452.5H254.5V460.5H250.5Z')}" fill="var(--panel-ink,#161616)" stroke="none"/>` },
  ],
  placements: [
    ...TOP.map((b): Placement => ({
      component: 'push-round-wide', control: b.id, at: pt(b.x, 48),
      legend: b.legend[1]
        // COM legends (blobs): COM 31 px wide, 17 high, centred 13 px above the button centre; digit 14 high, 15 below.
        ? [{ text: b.legend[0], cap: mm(17), y: mm(-13), width: mm(31) }, { text: b.legend[1], cap: mm(14), y: mm(15) }]
        : [{ text: b.legend[0], cap: mm(16), y: mm(1), width: mm(b.legend[0].length === 4 ? 34 : b.legend[0] === 'IFF' ? 22 : 31) }],
    })),
    ...KEYS.map((k): Placement => ({
      component: 'push-square', control: k.id, at: pt(k.x, k.y), size: KEY,
      legend: [
        // Tall condensed legends (Nathan): the function word top-centre, 5 px under the cap's top edge, the digit below.
        ...(k.fn ? [{ text: k.fn, cap: mm(15), y: mm(-21), width: mm(k.fn.length * 8.2) }] : []),
        { text: k.digit, cap: mm(25), y: mm(9.5), width: mm(14) },
        ...(k.corner ? [{ text: k.corner, cap: mm(9), y: mm(17), x: mm(22) }] : []),
      ],
    })),
    { component: 'push-square', control: 'rcl', at: pt(RCL_X, ROWS[0]), size: KEY, legend: [{ text: 'RCL', cap: mm(13), y: 0, width: mm(30) }] },
    { component: 'push-square', control: 'entr', at: pt(RCL_X, ROWS[1]), size: KEY, legend: [{ text: 'ENTR', cap: mm(13), y: 0, width: mm(38) }] },
    { component: 'push-round-plain', control: 'wx', at: pt(543.5, 159), legend: [{ text: 'WX', cap: mm(13), y: 0 }] },
    // Rocker arrows (zoom): FLIR has arrows with shafts, the DED rocker two long narrow triangles.
    { component: 'rocker', control: 'flir-incdec', at: pt(543.5, 263), size: [mm(47), mm(93)], arrows: 'arrow' },
    { component: 'rocker', control: 'ded-incdec', at: pt(121, 424), size: [mm(48), mm(92)], arrows: 'spike' },
    // DCS lever top: a 22 px square (its tall look in the guide is the camera seeing the lever's side).
    { component: 'hat', control: 'dcs-ud', cross: 'dcs-lr', at: pt(257, 418), r: mm(30), lever: [mm(22), mm(22)], throw: mm(9) },
    { component: 'toggle-large', control: 'drift-warn', at: pt(383, 418) },
    { component: 'toggle-large', control: 'flir-mode', at: pt(537, 386.5) },
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
