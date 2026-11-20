import type { Dial, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';
import { PAINTS, PAPER } from '../components.ts';

/**
 * F-16C OXYGEN regulator panel (right console), DCS: FLOW blinker, OXYGEN PSI
 * supply gauge, and three levers along the bottom: EMERGENCY (red), the
 * diluter lever (100% / NORM) and SUPPLY (PBG / ON / OFF).
 *
 * Reference: the guide's p. 77 "OXYGEN Regulator Panel" image (440 x 235 JPEG,
 * `pdfimages -j -f 77 -l 77`, image 008). The four DZUS sit square (columns
 * x 21 and 416.5, rows y 45.5 and 188), so the image is traced without a warp.
 * Values below are pixels on that image.
 *
 * DZUS notches (panel-edge and panel-zoom 4-5x): the right notches' inner edge
 * measures x 400-400.5 (top and bottom), the floors y 60 (top) and 171 (bottom)
 * against DZUS rows 45 and 188. Drawn mirrored about the panel centre (x
 * 218.75): inner edges x 37.5 and 400, floors 16 px from the DZUS rows at
 * y 61 and 172, inner radius 8 px. The OXYGEN title sits on the face between
 * the left notches.
 */
const PX = 2.97;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 77';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
const dot = (x: number, y: number) => `<circle cx="${mm(x)}" cy="${mm(y)}" r="${mm(2)}" fill="var(--panel-ink,#161616)" stroke="none"/>`;

const NX = [37.5, 400], NY = [61, 172], R = 8;
const OUT = { x0: 7.5, x1: 430, y0: 8, y1: 230 };
const FACE = `M${NX[0]} ${OUT.y0}H${NX[1]}V${NY[0] - R}Q${NX[1]} ${NY[0]} ${NX[1] + R} ${NY[0]}H${OUT.x1}V${NY[1]}H${NX[1] + R}Q${NX[1]} ${NY[1]} ${NX[1]} ${NY[1] + R}V${OUT.y1}` +
  `H${NX[0]}V${NY[1] + R}Q${NX[0]} ${NY[1]} ${NX[0] - R} ${NY[1]}H${OUT.x0}V${NY[0]}H${NX[0] - R}Q${NX[0]} ${NY[0]} ${NX[0]} ${NY[0] - R}Z`;

/** Lever legend lines (dot centres): EMERGENCY / NORMAL / TEST MASK, 100% / NORM, PBG / ON / OFF. */
const EM_Y = { emergency: 160.5, normal: 184.5, 'test-mask': 208.5 };
const DIL_Y = { '100': 160.5, norm: 207 };
const SUP_Y = { pbg: 160, on: 184, off: 210 };

/**
 * OXYGEN PSI dial, centre (281.5, 76) on the hub (272-291 x 66-86). Tick angles from gauge-dial.py blobs about that
 * centre: lines every 5 psi from 0 (316.1°) to 100 (70.1°), majors at 0, 25 (344.9°), 50 (373.8°), 75 (402.2°) and
 * 100 (430.1°), 28.5° a major, linear; above 100 the scale closes up and is marked by dots: 150 at 118.4°, 250 at
 * 148°, 350 at 179.8°, 450 at 211.8° (one dot under each numeral), with dots at 125 (99.4°) and 400 (196.3°).
 * Tick radii: majors 36.6-44, minors 40.5-44.3, dots at 37.
 */
const lg = (text: string, x: number, y: number, cap: number, w?: number) => ({ text, at: pt(x - 281.5, y - 76) as Pt, cap: mm(cap), ...(w ? { width: mm(w) } : {}) });
const dial: Dial = {
  bezel: mm(48), face: mm(45.5), hub: mm(9.5),
  scale: [[0, 316.1], [100, 430.1], [125, 459.4], [150, 478.4], [250, 508], [350, 539.8], [400, 556.3], [450, 571.8]],
  // Green normal band behind the 10-55 psi ticks (the guide's normal operating range).
  fills: [{ from: 10, to: 55, r: [mm(24), mm(44.3)], paint: 'green' }],
  ticks: [
    { from: 0, to: 100, step: 25, r: [mm(36.6), mm(44)], width: mm(2.4) },
    { from: 5, to: 95, step: 5, skip: 25, r: [mm(40.5), mm(44.3)], width: mm(1.8) },
    { from: 125, to: 125, step: 25, r: [mm(35), mm(39)], width: mm(2.3), dot: true },
    { from: 150, to: 450, step: 100, r: [mm(35), mm(39)], width: mm(2.3), dot: true },
    { from: 400, to: 400, step: 50, r: [mm(35), mm(39)], width: mm(2.3), dot: true },
  ],
  legends: [
    lg('0', 258.5, 52.5, 10), lg('25', 273, 45, 10, 11), lg('50', 292, 45, 10, 11), lg('75', 301.5, 54, 10, 11),
    lg('100', 311, 64.5, 9, 17), lg('150', 306, 89.5, 9, 15), lg('250', 294, 99.5, 9, 15.5), lg('350', 279, 103.5, 9, 15),
    lg('450', 264, 98.5, 9, 15), lg('OXYGEN', 255, 70, 7, 25), lg('PSI', 255, 78.5, 7, 11),
  ],
  needle: mm(31),
  needleArt: 'wedge',
  // Measured 10.5 px wide at the hub edge (r 10) and 2 px at the tip (r 31): 14.5 px at the centre.
  needleBase: mm(14.5),
};

const circle = (cx: number, cy: number, r: number, extra = '') => `<circle cx="${mm(cx)}" cy="${mm(cy)}" r="${mm(r)}" fill="${PAPER}" stroke-width="0.4"${extra}/>`;
/**
 * Levers, square-on (how they work from the real regulator; shapes and layout from the guide). Each is a long paddle
 * lying in its slot, hinged inside the panel at the far end, so the paddle fills the slot in every position and its
 * grip end (EMERGENCY's white tab, SUPPLY's round knob, the diluter's foot) stands at the selected legend. Outlines
 * traced on the guide image: EMERGENCY red x 65-87.3, y 151.7-222.7, left edge bowed out to x 65 below the middle,
 * white tab 22.7 x 16.6 px left of it; diluter cream x 204-226, y 144-227, foot widening to x 197 over its last 22 px;
 * SUPPLY green x 340-380, y 141-226, top corners rounded, knob 35 px across on its left edge.
 */
const shape = (d: string, fill: string) => `<path d="${path(d)}" fill="${fill}" stroke-width="0.4"/>`;
const EM_X = 76;
const EM_BODY = 'M68 152H87V223H72Q64 202 65 182Q65 162 68 152Z';
const emergencyLever = (y: number) => shape(EM_BODY, PAINTS.red) + shape(`M50 ${y - 8.3}H73V${y + 8.3}H50Z`, PAPER);
const DIL_X = 212, DIL_PIVOT = 183.75;
/** Diluter lever with its foot down (1, NORM, as the guide shows it) or up (-1, 100%, mirrored about the pivot). */
function diluterLever(dir: -1 | 1) {
  const Y = (v: number) => +(dir > 0 ? v : 2 * DIL_PIVOT - v).toFixed(2);
  return shape(`M204 ${Y(144)}H226V${Y(227)}H197V${Y(213)}Q198 ${Y(207)} 204 ${Y(203)}Z`, PAPER);
}
const SUP_X = 359, KNOB_X = 340;
const SUP_BODY = 'M340 141H375Q380 141 380 146V226H340Z';
const supplyLever = (y: number) => shape(SUP_BODY, PAINTS.green) +
  `<circle cx="${mm(KNOB_X)}" cy="${mm(y)}" r="${mm(17.5)}" fill="${PAPER}" stroke-width="0.4"/><circle cx="${mm(KNOB_X)}" cy="${mm(y)}" r="${mm(14)}" fill="none" stroke-width="0.25"/>`;
/** A cable: an ink line with a thin paper core. */
const cable = (d: string) => `<path d="${path(d)}" fill="none" stroke-width="1.1"/><path d="${path(d)}" fill="none" stroke="${PAPER}" stroke-width="0.35"/>`;

export const oxygen: PanelSpec = {
  id: 'oxygen',
  title: 'OXYGEN regulator panel',
  canvas: [mm(440), mm(235)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 77,
    image: 'p. 77 "OXYGEN Regulator Panel" image, 440 x 235 px',
    rectify: 'none: the four DZUS sit on a square (columns x 21 / 416.5, rows y 45.5 / 188)',
    pxPerMm: PX,
    scale: 'DZUS heads (about 25 px across) match the shared 8.5 mm head at 2.97 px/mm; the DZUS columns are then 133 mm apart, as on AIR COND and the HUD control panel.',
    shown: { emergency: 'normal', diluter: 'norm', supply: 'on', flow: 'flow', pressure: '34' },
    unresolved: [
      'The guide marks EMERGENCY and the diluter lever not implemented (N/I) in DCS; both are modelled as levers that move between their legends.',
      'The three levers are long paddles hinged inside the panel, so each fills its slot in every position and only its grip end (EMERGENCY tab, SUPPLY knob, diluter foot) moves to the selected legend; grip ends are drawn square-on at their legend lines (the camera shows them a few px higher). The guide shows each only in one position (EMERGENCY at NORMAL, diluter at NORM, SUPPLY at ON). Whether TEST MASK springs back is not stated; all positions are drawn as stable.',
      'Colours: EMERGENCY red, SUPPLY green and the dial\'s green 10-55 psi band, as the guide shows them; the band\'s ends are taken from the guide\'s normal range, the image does not resolve them. The needle is drawn uncoloured. The dial is traced up to 100 psi tick by tick; above 100 only the dots under the numerals (and two between) resolve.',
      'The black cable loops between the top clips are drawn as the guide shows them; the guide does not say what they are. The small round fitting below the left clip is not described in the guide; it is drawn as a plain ring.',
      'The FLOW blinker shows white for flow in the guide; cold and dark (no flow) it shows black.',
    ],
  },
  plate: [
    { d: path('M2 4H436V233H2Z') },
    { d: path(FACE), raised: true },
  ],
  engraving: [
    // Vertical OXYGEN title, between the left notches.
    ...['O', 'X', 'Y', 'G', 'E', 'N'].map((c, i) => L([13.5, 75 + i * 16.5], c, 12.5, 10)),
    L([103.5, 63.5], 'FLOW', 12.5, 40),
    L([135, 160.5], 'EMERGENCY', 12.5, 73), L([123.5, 184.5], 'NORMAL', 12.5, 51),
    L([113.5, 203], 'TEST', 12.5, 30), L([114.5, 217], 'MASK', 12.5, 33),
    L([250, 160.5], '100%', 12.5, 28), L([253.5, 207], 'NORM', 12.5, 35),
    L([349.5, 127.5], 'SUPPLY', 13, 52), L([317.5, SUP_Y.pbg], 'PBG', 12.5, 25), L([318, SUP_Y.on], 'ON', 12.5, 18), L([318, SUP_Y.off], 'OFF', 12.5, 25),
    { kind: 'svg', markup: [dot(92.5, 160.5), dot(92.5, 184.5), dot(92.5, 208.5), dot(231, 160.5), dot(231, 207)].join('') },
    // Printed cross right of the diluter lever.
    { kind: 'path', pen: 'fine', d: path('M273 147H281M277 143V151') },
    // Lever slots (EMERGENCY, diluter) and the SUPPLY lever's recess.
    { kind: 'path', pen: 'medium', d: path('M48 150H90V226H48ZM193 140H230V231H193ZM333 139H383V228H333Z') },
    // Cable clip tabs under the top screws.
    { kind: 'svg', markup: [[210, 26], [171, 49], [354, 26], [353, 97]].map(([x, y]) => circle(x, y, 8.5)).join('') },
    { kind: 'path', pen: 'medium', d: path('M203 23L188 29L189 33L203 30ZM177 55L191 72L195 69L182 52ZM351 34V57H357V34ZM357 91L366 84L362 81L353 88Z') },
    // Cable loops between the clips (black wires in the sim; their purpose is not described in the guide).
    { kind: 'svg', markup: cable('M190 30C204 34 226 56 222 78C219 92 203 90 199 78C196 70 197 66 193 68') + cable('M356 50C364 38 392 38 398 56C402 70 386 72 372 73C362 74 356 80 358 90') },
    // Fitting below the left clip.
    { kind: 'svg', markup: `${circle(193, 118, 6.5)}${circle(193, 118, 3.5)}` },
  ],
  placements: [
    { component: 'dzus', at: pt(21, 45.5) }, { component: 'dzus', at: pt(416.5, 45.5) },
    { component: 'dzus', at: pt(21, 188) }, { component: 'dzus', at: pt(416.5, 188) },
    { component: 'screw-small', at: pt(210, 26) }, { component: 'screw-small', at: pt(171, 49) },
    { component: 'screw-small', at: pt(354, 26) }, { component: 'screw-small', at: pt(353, 97) },
    { component: 'screw-small', at: pt(150, 213) },
    { component: 'blinker', indicator: 'flow', at: pt(104.5, 87.5), size: [mm(49), mm(19)], dark: 'no-flow' },
    { component: 'gauge', indicator: 'pressure', at: pt(281.5, 76), dial },
    {
      component: 'traced', control: 'emergency', at: pt(EM_X, EM_Y.normal), hit: [mm(46), mm(144), mm(46), mm(82)],
      shapes: Object.fromEntries(Object.entries(EM_Y).map(([id, y]) => [id, { d: '', svg: emergencyLever(y) }])),
    },
    {
      component: 'traced', control: 'diluter', at: pt(DIL_X, DIL_PIVOT), hit: [mm(192), mm(138), mm(36), mm(94)],
      shapes: { '100': { d: '', svg: diluterLever(-1) }, norm: { d: '', svg: diluterLever(1) } },
    },
    {
      component: 'traced', control: 'supply', at: pt(SUP_X, SUP_Y.on), hit: [mm(320), mm(138), mm(64), mm(92)],
      shapes: Object.fromEntries(Object.entries(SUP_Y).map(([id, y]) => [id, { d: '', svg: supplyLever(y) }])),
    },
  ],
  controls: [
    {
      id: 'emergency', name: 'EMERGENCY lever', type: 'toggle', travel: 'vertical', initial: 'normal', source: src,
      positions: [
        { id: 'emergency', label: 'EMERGENCY', hold: 'stable' },
        { id: 'normal', label: 'NORMAL', hold: 'stable' },
        { id: 'test-mask', label: 'TEST MASK', hold: 'stable' },
      ],
      description: 'Controls positive-pressure breathing. EMERGENCY gives the most oxygen under positive pressure (the pilot uses it to check the mask for leaks). NORMAL gives positive pressure only above 28,000 ft cockpit altitude. TEST MASK gives the most oxygen under positive pressure for life-support crews to leak-test the mask. Not implemented in DCS.',
    },
    {
      id: 'diluter', name: 'Diluter lever', type: 'toggle', travel: 'vertical', initial: 'norm', source: src,
      positions: [{ id: '100', label: '100%', hold: 'stable' }, { id: 'norm', label: 'NORM', hold: 'stable' }],
      description: 'Sets the mix of cockpit air and oxygen. 100% gives the pilot pure oxygen; NORM mixes cockpit air with oxygen according to cockpit altitude. Not implemented in DCS (the after-start EPU check still sets it to 100% and back).',
    },
    {
      id: 'supply', name: 'SUPPLY lever', type: 'toggle', travel: 'vertical', initial: 'off', source: src,
      positions: [{ id: 'pbg', label: 'PBG', hold: 'stable' }, { id: 'on', label: 'ON', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      description: 'Turns the oxygen supply to the mask on or off. ON supplies oxygen without pressure breathing. PBG (pressure breathing for G) also gives pressure breathing above 4 G, to raise G tolerance and reduce fatigue. OFF shuts off the supply to the mask.',
    },
  ],
  indicators: [
    {
      id: 'flow', name: 'FLOW indicator', type: 'display',
      pages: [{ id: 'no-flow', label: 'Black (no flow)' }, { id: 'flow', label: 'White (oxygen flowing)' }], restPage: 'no-flow',
      description: 'Blinks between white and black as the pilot breathes: white while oxygen is flowing, black with no flow.', source: src,
    },
    {
      id: 'pressure', name: 'OXYGEN SUPPLY indicator', type: 'gauge', unit: 'psi', rest: 0, range: [0, 450, 1],
      description: 'Oxygen pressure at the regulator, in psi. Normal operation is between 10 and 55 psi.', source: src,
    },
  ],
};
