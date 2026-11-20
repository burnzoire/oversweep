import type { Dial, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C EPU fuel quantity indicator (right auxiliary console), DCS.
 *
 * Reference: the guide's p. 61 "EPU Fuel Quantity Indicator" image (220 x 226
 * JPEG, extracted with `pdfimages -j -f 61 -l 61`, image 005), rectified with
 * one affine (`scripts/gauge-dial.py`, blob map in docs/cockpit/): 20 of the
 * 21 ticks found (100 % is under the needle), the centre fitted to the inner
 * tick ends, tick angle rms 0.08°. The scale is linear, 2.39° per percent,
 * a long tick every 10 % and a short one every 5 %. Values below are
 * rectified reference pixels (relative to the dial centre inside the dial),
 * converted to mm by `tracer`.
 */
const PX = 3.93;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 61';
const lg = (text: string, x: number, y: number, cap: number, w?: number) => ({ text, at: pt(x, y) as Pt, cap: mm(cap), ...(w ? { width: mm(w) } : {}) });

const dial: Dial = {
  bezel: mm(108), face: mm(98), hub: mm(30.5),
  scale: [[0, 237.24], [100, 476.5]],
  ticks: [
    { from: 0, to: 100, step: 10, r: [mm(76.3), mm(96)], width: mm(3.0) },
    { from: 5, to: 95, step: 10, r: [mm(83), mm(96)], width: mm(1.9) },
  ],
  legends: [
    lg('0', -54.6, 36.8, 15.9, 10.4), lg('20', -55.1, -20.0, 16.4, 22.8), lg('40', -29.3, -54.4, 16, 23.9),
    lg('60', 21.9, -56.5, 16, 23.2), lg('80', 54.0, -25.8, 16.4, 22.1), lg('100', 46, 32.5, 15, 26),
    lg('EPU FUEL', 5, 63.6, 16, 90), lg('% REMAIN', 6.6, 79.5, 11, 64),
  ],
  needle: mm(94),
  needleArt: 'step',
};

export const epuFuel: PanelSpec = {
  id: 'epu-fuel',
  title: 'EPU fuel quantity indicator',
  canvas: [mm(252), mm(248)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 61,
    image: 'p. 61 "EPU Fuel Quantity Indicator" image, 220 x 226 px',
    rectify: 'python3 -I scripts/gauge-dial.py fit <p61-005.png> <scratch> docs/cockpit/f16c-epu-fuel-dial-map.json (x\' = 1.04748x + 0.00499y + 10.00, y\' = 0.00499x + 1.00052y + 10.00; output 252 x 248)',
    pxPerMm: PX,
    scale: 'The mounting screw heads (about 16.5 px across) are the shared `screw-small` (4.2 mm), as on the altimeter, giving 3.93 px/mm; the dial face is then 50 mm across, a 2-inch instrument.',
    shown: { 'epu-fuel': '100' },
    unresolved: [
      'The needle covers most of the 100 numeral and the 100 % tick; the numeral is placed where its visible 1 and 0 put it, the tick by the scale.',
      'The guide says the gauge reads in 5 % increments; the needle is shown at 100 % in the guide. What it shows cold and dark is not stated; 100 % (a full EPU tank) is used.',
      'Physical size rests on the screws: the guide gives no dimension.',
      'The image is cropped on every side; the console face is drawn to the crop.',
    ],
  },
  plate: [
    { d: path('M10 10H242V238H10Z') },
  ],
  engraving: [],
  placements: [
    { component: 'screw-small', at: pt(217, 31) },
    { component: 'screw-small', at: pt(36.7, 221.7) },
    { component: 'gauge', indicator: 'epu-fuel', at: pt(118.81, 123.39), dial },
  ],
  controls: [],
  indicators: [
    { id: 'epu-fuel', name: 'EPU FUEL indicator', type: 'gauge', unit: '%', rest: 100, range: [0, 100, 1], description: 'Hydrazine left in the EPU tank, 0 to 100 % in 5 % steps. At 100 % the EPU can run for about 10 to 15 minutes.', source: src },
  ],
};
