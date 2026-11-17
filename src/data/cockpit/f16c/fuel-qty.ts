import type { Dial, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C fuel quantity indicator (right auxiliary console), DCS: two tank
 * pointers, AL and FR, on a 0–4,200 lb scale, and a five-drum TOTAL counter.
 *
 * Reference: the guide's p. 58 image (220 x 226 JPEG, extracted with
 * `pdfimages -j -f 58 -l 58`, image 002). The image was rectified with one
 * affine (`scripts/gauge-dial.py`, blob map in docs/cockpit/): every printed
 * tick was found, the centre fitted to the inner tick ends and the stretch
 * chosen that puts the ticks on a smooth scale. The scale is linear: 0–42
 * (×100 lb) fits one straight line within 0.4°. Ticks, numerals, the counter
 * and the pointers were then measured on the rectified image about that
 * centre; each pointer was measured turned upright. Values below are
 * rectified reference pixels relative to the dial centre, converted to mm by
 * `tracer`.
 */
const PX = 2.7;
const { pt, mm } = tracer(PX);
const src = 'DCS F-16C guide p. 58';

const run = (from: number, to: number, step: number, inner: number, outer: number, width: number, skip?: number): Dial['ticks'][number] =>
  ({ from, to, step, ...(skip ? { skip } : {}), r: [mm(inner), mm(outer)], width: mm(width) });
/** Numeral or legend centred at (x, y) px from the dial centre, `cap` and `w` px. */
const lg = (text: string, x: number, y: number, cap: number, w: number) => ({ text, at: pt(x, y) as Pt, cap: mm(cap), width: mm(w) });

const dial: Dial = {
  bezel: mm(105), face: mm(95), hub: mm(20.5),
  // Pounds: one straight fit through the major ticks (0 at 233.57°, 5.959° per 100 lb).
  scale: [[0, 233.57], [4200, 483.83]],
  ticks: [run(0, 4000, 500, 78.3, 91.8, 2.9), run(100, 4200, 100, 83.0, 91.8, 1.85, 500)],
  legends: [
    lg('0', -55.6, 43.2, 13, 8.6), lg('5', -70.0, 8.2, 13.2, 8.6), lg('10', -62.3, -26.1, 13.2, 13), lg('15', -39.5, -52.4, 13.1, 13),
    lg('20', -8.5, -69.5, 13.2, 17.6), lg('25', 26.4, -62.5, 13, 18.75), lg('30', 50.5, -40.0, 13, 18), lg('35', 65.0, -10.0, 13, 18.1),
    lg('40', 59.8, 26.7, 13.1, 18.25),
    lg('FUEL', 3.5, -39.0, 11.7, 45), lg('SEL LBS x 100', -0.7, 30.3, 6.6, 72.5), lg('TOTAL', 4.0, 68.9, 10.8, 44.25), lg('LBS', 4.5, 81.8, 6.9, 17.1),
  ],
  // FR is drawn over AL: its paddle covers the gap between the two shafts in the guide image.
  pointers: [
    { indicator: 'al', art: 'paddle', legend: ['A', 'L'] },
    { indicator: 'fr', art: 'paddle', legend: ['F', 'R'] },
  ],
  counter: {
    indicator: 'total', at: pt(2.2, 48.9), drums: 5, fixed: 2, unit: 100,
    pitch: mm(13.3), roll: mm(20.5), window: [mm(66.5), mm(25)], cap: mm(18.5), width: mm(8.4),
  },
};

export const fuelQty: PanelSpec = {
  id: 'fuel-qty',
  title: 'Fuel quantity indicator',
  canvas: [mm(242), mm(244)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide (EN, 16 August 2026)',
    page: 58,
    image: 'p. 58 fuel quantity indicator image (220 x 226 JPEG)',
    rectify: 'python3 -I scripts/gauge-dial.py fit <image.png> <scratch> docs/cockpit/f16c-fuel-qty-dial-map.json (x\' = 0.97927x − 0.02853y + 16.45, y\' = −0.02853x + 0.96073y + 16.28; output 242 x 244)',
    pxPerMm: PX,
    scale: 'No shared component on this image. The dial is taken as the same 3-inch class as the RPM indicator: its face (95 px radius) is drawn the size of the RPM face, giving 2.7 px/mm.',
    shown: { al: '2840', fr: '3280', total: '7170' },
    unresolved: [
      'Physical size: the guide gives no dimension; the scale assumes a 3-inch class dial.',
      'Cold-and-dark readings are not stated in the guide; the pointers and counter are drawn where the guide image shows them.',
      'The red imbalance mark at a pointer\'s base is not visible in the guide image, so it is not drawn.',
      'The pointers overlap near the hub. Both are drawn with the same paddle on the anticlockwise side, which matches the merged white shape in the image; the part of AL under FR cannot be seen.',
      'The L of FUEL and the 3 of 30 are under the pointers; their size follows the visible letters.',
      'The counter window has no visible edge in the image; its height is where the rolling digits are cut off. The last two drums show only zeros and roll with the hundreds drum, as in the image.',
      'Tick widths are read from a blurred image (full width at half brightness, less about 20 %).',
      'The instrument panel around the dial is outside the guide image, so no plate is drawn.',
    ],
  },
  plate: [],
  engraving: [],
  placements: [
    { component: 'gauge', at: pt(115.09, 123.63), dial },
  ],
  controls: [],
  indicators: [
    {
      id: 'al', name: 'AL pointer', type: 'gauge', unit: 'lb', rest: 2840, range: [0, 4200, 10],
      restNote: 'drawn as the guide shows it, 2,840 lb',
      description: 'Fuel in the aft and left (AL) tanks, read on the scale in hundreds of pounds. The FUEL QTY SEL knob chooses which internal or external tanks the two pointers show. If AL and FR drift too far apart, red shows at the base of a pointer: a fuel imbalance, corrected with the ENG FEED knob on the FUEL panel.',
      source: src,
    },
    {
      id: 'fr', name: 'FR pointer', type: 'gauge', unit: 'lb', rest: 3280, range: [0, 4200, 10],
      restNote: 'drawn as the guide shows it, 3,280 lb',
      description: 'Fuel in the forward and right (FR) tanks, read on the scale in hundreds of pounds. The FUEL QTY SEL knob chooses which internal or external tanks the two pointers show. If AL and FR drift too far apart, red shows at the base of a pointer: a fuel imbalance, corrected with the ENG FEED knob on the FUEL panel.',
      source: src,
    },
    {
      id: 'total', name: 'TOTAL fuel counter', type: 'counter', unit: 'lb', rest: 7170, range: [0, 15000, 10],
      restNote: 'drawn as the guide shows it, about 7,170 lb',
      description: 'Total fuel remaining in all tanks, in pounds, on a five-drum counter.',
      source: src,
    },
  ],
};
