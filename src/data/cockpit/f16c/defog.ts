import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C DEFOG lever (left console, outboard edge), DCS.
 *
 * Reference: the guide's p. 74 "DEFOG Lever" image (330 x 126 JPEG,
 * `pdfimages -png -f 74 -l 74`, image 005), rectified on the corners of the
 * MIN–DEFOG–MAX placard (edges measured with scripts/panel-edge.py):
 *   python3 -I scripts/panel-trace.py <p74-005.png> <out> 18.2,75.2 302.3,80.8 14.3,94.0 300.2,99.8 330 126
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 2.6;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 74';
const T = (at: [number, number], text: string, cap: number, width: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), width: mm(width) });

export const defog: PanelSpec = {
  id: 'defog',
  title: 'DEFOG lever',
  canvas: [mm(320), mm(112)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 74,
    image: 'p. 74 "DEFOG Lever" image, 330 x 126 px',
    rectify: 'python3 -I scripts/panel-trace.py <p74-005.png> <out> 18.2,75.2 302.3,80.8 14.3,94.0 300.2,99.8 330 126',
    pxPerMm: PX,
    scale: 'No console panel shares the p. 74 image. On the p. 62 left console overview the FLT CONTROL panel\'s top DZUS pair (a full-width console panel, about 132 mm between DZUS columns as on AIR COND and EXT LIGHTING) is 169 px apart, and the DEFOG placard from the middle of DEFOG to its right end is 70 px, about 55 mm; that is 144 px on p. 74, so 2.6 px/mm.',
    shown: { defog: 'mid' },
    unresolved: [
      'Scale: the sill is nearer the p. 62 camera than the console the scale was taken from, so the lever and placard may be drawn up to about a fifth too large.',
      'The mounting plate\'s right and bottom edges are outside the p. 74 image; the drawn outline stops at the crop. Its top edge reads 31.5–39.5 px across the image (faint toward the right) and is drawn level at 33.',
      'The lever is drawn from straight above: the blade shows only its top edge and the mushroom knob reaches inboard over the placard. The arm pivots under the console, so it leans along the slot and its knob swings out to the ends of the MIN and MAX marking lines; the pivot depth is not in the guide, so the leaning edge runs straight from the slot to the knob. The neck has a straight waist; its sizes are estimated.',
      'The lever moves smoothly between MIN and MAX; it is drawn with five evenly spaced stops. Any detents in the simulator are unconfirmed.',
    ],
  },
  plate: [
    // DEFOG mounting plate. Edges measured with scripts/panel-edge.py: left
    // x 5.5–6.5 (rows 50–70), top y 31.5 (cols 100–200; 36.5–39.5 further
    // right, where the edge is faint), drawn square at y 33 with the top-left
    // corner rounded at 21 px as the image shows. Right and bottom edges are
    // outside the image; the outline stops at the crop.
    { d: path('M6 112V54Q6 33 27 33H316V112Z') },
    // MIN–DEFOG–MAX placard, measured edges x 16.5–302, y 78–96.5.
    { d: path('M16.5 78H302V96.5H16.5Z'), raised: true },
  ],
  engraving: [
    T([28, 87.25], 'MIN', 7, 17),
    T([158, 87.25], 'DEFOG', 11, 46),
    T([288.5, 87.25], 'MAX', 7, 17),
    { kind: 'path', pen: 'medium', d: path('M40 87.25H130M186 87.25H278') },
  ],
  placements: [
    // Slot measured x 106–230, y 64–70. The arm pivots under the slot, so its root moves only along the slot while
    // the knob swings out to x 49 and 287, the ends of the MIN and MAX markings.
    { component: 'slot-lever', control: 'defog', at: pt(168, 67), travel: mm(238), slot: mm(124) },
  ],
  controls: [
    {
      id: 'defog', name: 'DEFOG lever', type: 'toggle', travel: 'horizontal',
      positions: [
        { id: 'min', label: 'MIN', hold: 'stable' },
        { id: 'quarter', label: '¼', hold: 'stable' },
        { id: 'mid', label: '½', hold: 'stable' },
        { id: 'three-quarter', label: '¾', hold: 'stable' },
        { id: 'max', label: 'MAX', hold: 'stable' },
      ],
      initial: 'mid',
      description: 'Moved forward and back to de-fog the canopy. MIN: most of the airflow goes to the vents behind the seat. MAX: most of the airflow goes to the forward canopy area and the air vent at the bottom of the center instrument panel; at full MAX with the AIR COND TEMP knob at AUTO, the air flow is set to full warm for 3 minutes, and pulling the lever back and returning it to MAX restarts the 3 minutes.',
      source: src,
    },
  ],
  indicators: [],
};
