import type { Dial, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C hydraulic pressure indicators, HYD PRESS A and B (right auxiliary
 * console), DCS.
 *
 * Reference: the guide's p. 61 image (220 x 321 JPEG, extracted with
 * `pdfimages -j -f 61 -l 61`, image 002), rectified with one affine fitted to
 * both dials (`scripts/gauge-dial.py`): every tick found, each dial's centre
 * fitted to the inner tick ends, tick angle rms 0.17° (A) and 0.24° (B).
 * Tick angles, radii and legend boxes were read off each dial unwrapped about
 * its centre. Values are rectified reference pixels (relative to the dial
 * centre inside a dial), converted to mm by `tracer`.
 *
 * Scale: 0 to 4,000 psi, a tick every 500 psi, numerals 0, 1, 2 and 4 (×1000).
 * The spacing is not quite even (36–43° per 500 psi), so the scale is a knot
 * per tick, each the mean of the two dials.
 */
const PX = 2.94;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 61';
const lg = (text: string, x: number, y: number, cap: number, w?: number) => ({ text, at: pt(x, y) as Pt, cap: mm(cap), ...(w ? { width: mm(w) } : {}) });

const dial: Dial = {
  bezel: mm(55), face: mm(50.5), hub: mm(17.5),
  scale: [[0, 115.74], [500, 153.67], [1000, 189.36], [1500, 229.18], [2000, 267.0], [2500, 304.37], [3000, 345.0], [3500, 386.9], [4000, 430.09]],
  ticks: [
    { from: 0, to: 4000, step: 1000, r: [mm(37.5), mm(47.5)], width: mm(2.4) },
    { from: 500, to: 3500, step: 1000, r: [mm(38.5), mm(47.5)], width: mm(1.5) },
  ],
  legends: [
    lg('0', 30.8, 11.8, 8.5, 5.1), lg('1', -5.5, 30.3, 7.4, 1.6), lg('2', -32.0, 0.1, 8.5, 5.1), lg('4', 29.4, -13.4, 8.1, 5.5),
    lg('HYD', -1.5, -19.5, 9.5, 24), lg('X1000', 2.5, 18.5, 6.2, 31),
  ],
  needle: mm(47.5),
  needleArt: 'wedge',
};

export const hydPressure: PanelSpec = {
  id: 'hyd-pressure',
  title: 'Hydraulic pressure indicators',
  canvas: [mm(245), mm(330)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 61,
    image: 'p. 61 "Hydraulic Pressure (System A & System B) Indicators" image, 220 x 321 px',
    rectify: 'python3 -I scripts/gauge-dial.py fit <p61-002.png> <scratch> <map.json> (one affine for both dials: x\' = 0.99007x − 0.02229y + 17.16, y\' = −0.02229x + 0.94993y + 14.90; output 245 x 330). Blob map: A 4:0,7:500,8:1000,10:1500,12:2000,13:2500,14:3000,0:3500,3:4000; B 4:0,6:500,7:1000,9:1500,11:2000,13:2500,14:3000,0:3500,2:4000.',
    pxPerMm: PX,
    scale: 'The placard\'s hold-down screw (20 px across) is the shared `screw` (6.8 mm), giving 2.94 px/mm; the dials are then 37 mm across.',
    shown: { 'hyd-a': '3000', 'hyd-b': '3000' },
    unresolved: [
      'The needle covers the top of the scale on both dials, so whether a 3 is printed at 3,000 psi cannot be seen; none is drawn.',
      'The image is cropped on every side; the console edges and a fastener cut off at the right edge are not drawn.',
      'Physical size rests on the screw: the guide gives no dimension.',
      'Cold-and-dark needle position (0 psi) is not stated in the guide.',
    ],
  },
  plate: [
    // Console face, to the image crop.
    { d: path('M10 8H233V322H10Z') },
    // Black HYD PRESS placard: a band across the top and a leg down the right
    // to B, the inner corner a large curve and the top right corner cut on a
    // diagonal (edges read off the grid: top 14, left 17, band bottom 72, leg
    // left 150, leg bottom 175, chamfer (183, 14) to the crop at (233, 88)).
    { d: path('M22 14H183L233 88V175H157Q150 175 150 168V110Q150 72 112 72H22Q17 72 17 67V19Q17 14 22 14Z'), raised: true },
  ],
  engraving: [
    { kind: 'text', at: pt(76.7, 28.5), text: 'HYD PRESS', cap: mm(16), width: mm(90) },
    { kind: 'text', at: pt(76, 58), text: 'A', cap: mm(13) },
    { kind: 'text', at: pt(179, 160), text: 'B', cap: mm(13) },
    { kind: 'path', pen: 'fine', d: path('M193 111H201M197 107V115') },
  ],
  placements: [
    { component: 'screw', at: pt(172, 67) },
    { component: 'screw-medium', at: pt(77, 88) },
    { component: 'screw-medium', at: pt(77, 233) },
    { component: 'screw-medium', at: pt(108, 311) },
    { component: 'gauge', indicator: 'hyd-a', at: pt(72.98, 163.36), dial },
    { component: 'gauge', indicator: 'hyd-b', at: pt(166.61, 259.99), dial },
  ],
  controls: [],
  indicators: [
    { id: 'hyd-a', name: 'HYD PRESS A indicator', type: 'gauge', unit: 'psi', rest: 0, range: [0, 4000, 50], description: 'Pressure in hydraulic system A, 0 to 4,000 psi in 500 psi steps (numbers ×1000). Normal is 2,850 to 3,250 psi.', source: src },
    { id: 'hyd-b', name: 'HYD PRESS B indicator', type: 'gauge', unit: 'psi', rest: 0, range: [0, 4000, 50], description: 'Pressure in hydraulic system B, 0 to 4,000 psi in 500 psi steps (numbers ×1000). Normal is 2,850 to 3,250 psi.', source: src },
  ],
};
