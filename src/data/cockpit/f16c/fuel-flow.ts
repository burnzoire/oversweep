import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C FUEL FLOW indicator (instrument panel, below the engine instruments),
 * DCS: a five-drum counter in pounds per hour behind a rounded face, on a
 * square flange held by four screws.
 *
 * Reference: the guide's p. 50 image (330 x 253 JPEG, `pdfimages -j -f 50 -l 50`,
 * image 002). The camera is almost square-on; the image was squared up on the
 * four flange screws. Values below are rectified reference pixels.
 *
 * Counter: digits 37.5 px tall and 23.5 px wide, drum centres 34.4 px apart
 * (taken from the dark gaps between drums), so the drums are centred on
 * (157.7, 123.8). The two right-hand drums print only zeros and stay still
 * (they are level with the 6, while the hundreds drum has rolled); the left
 * drum shows a blank for 0. The hundreds drum shows through a taller slot
 * (82–167 px) with the next digits above and below; 4 and 6 sit 44 px from the
 * 5 (bottom of the 4 at 95, top of the 6 at 146).
 */
const PX = 4.08;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 50';

/** Rounded rectangle in reference px. */
const rrect = (x0: number, y0: number, x1: number, y1: number, r: number) =>
  `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
const text = (t: string, x: number, y: number, cap: number, w: number) => ({ kind: 'text' as const, text: t, at: pt(x, y), cap: mm(cap), width: mm(w) });

export const fuelFlow: PanelSpec = {
  id: 'fuel-flow',
  title: 'Fuel flow indicator',
  canvas: [mm(321), mm(251)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide (EN, 16 August 2026)',
    page: 50,
    image: 'p. 50 fuel flow indicator image (330 x 253 JPEG)',
    rectify: 'python3 -I scripts/panel-trace.py <image.png> <scratch> 29,29=30,30 291,31=292,30 31,220=30,221 292,220=292,221 330 253',
    pxPerMm: PX,
    scale: 'No shared component on this image. The flange (311 px wide) is taken as 3 in, the same class as the fuel quantity and RPM dials, giving 4.08 px/mm; the screw heads (about 14 px radius) then match the shared panel screw (3.4 mm).',
    shown: { 'fuel-flow': '6510' },
    unresolved: [
      'Physical size: the guide gives no dimension; the flange is assumed 3 in wide.',
      'The drums are cylinders; the digits above and below the hundreds drum\'s 5 are foreshortened in the image. They are drawn flat, 44 px apart (their apparent spacing).',
      'Cold-and-dark reading is not stated in the guide; the counter is drawn as the image shows it.',
      'Whether the thousands drum also blanks a leading 0 cannot be seen (it shows 6). It is drawn printing 0.',
      'The drum window edges are barely visible on the black face, so they are not outlined; the window is where the digits are cut off. Faint light lines under the two left drums (y 146–147) are drum edges catching the light and are not drawn.',
      'The instrument panel around the flange is outside the guide image.',
    ],
  },
  plate: [
    // Flange: left 5, right 316, top 7, bottom 243.5 (panel-edge.py), corners about 8 px.
    { d: path(rrect(5, 7, 316, 243.5, 8)) },
  ],
  engraving: [
    // Face: left 50.5, right 269.5, top 51.5, bottom 203 (panel-edge.py), corner radius about 22 px.
    { kind: 'path', d: path(rrect(50.5, 51.5, 269.5, 203, 22)), pen: 'medium' },
    text('FUEL', 97, 78, 26, 72), text('FLOW', 222, 77.5, 25.5, 76), text('PPH', 158, 181.5, 17.5, 38),
  ],
  placements: [
    { component: 'counter', at: pt(157.7, 123.8), counter: {
      indicator: 'fuel-flow', at: [0, 0], drums: 5, fixed: 2, unit: 100, blank: 1, still: true,
      pitch: mm(34.4), roll: mm(44), window: [mm(172), mm(45)], cap: mm(37.5), width: mm(23.5),
      slots: [{ drum: 2, h: mm(85) }],
    } },
    { component: 'screw', at: pt(30, 30) }, { component: 'screw', at: pt(292, 30) },
    { component: 'screw', at: pt(30, 221) }, { component: 'screw', at: pt(292, 221) },
  ],
  controls: [],
  indicators: [
    {
      id: 'fuel-flow', name: 'FUEL FLOW counter', type: 'counter', unit: 'PPH', rest: 6510, range: [0, 99900, 100],
      restNote: 'drawn as the guide shows it, about 6,500 PPH',
      description: 'Fuel flow to the engine in pounds per hour (PPH), in 100-pound steps; the last two drums are fixed zeros.',
      source: src,
    },
  ],
};
