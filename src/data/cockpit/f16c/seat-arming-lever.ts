import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';
import { INK, PAINTS, PENS, text } from '../components.ts';

/**
 * F-16C ejection seat arming lever (left side of the seat bucket, beside the
 * CMDS panel), DCS. Upright, it disarms the seat: a flat lever whose face is a
 * yellow flag with two columns of black diamonds either side of a black band
 * lettered EJECTION CONTROLS LOCKED in yellow, on a grey metal top. Armed, it is rotated aft and down
 * until flush with the seat, so seen from the front only its edge shows.
 *
 * Reference: the guide's p. 81 image of the lever in the disarmed position
 * (440 x 611 JPEG, `pdfimages -j -f 81 -l 81`, image 007). Values are
 * reference pixels less 160 in x (the crop starts at x 160), converted to mm
 * by `tracer`.
 */
const PX = 2.7;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 81';

/** Lever centre line and pivot (reference px, x less 160). */
const CX = 63, PIVOT: [number, number] = [CX, 300];
/** Diamonds: two columns, tip to tip, 15.5 px a row from y 80 (measured). */
const DIAMOND_X = [41, 85], DIAMOND_W = 8.5, DIAMOND_H = 7.75;
const diamonds = Array.from({ length: 11 }, (_, k) => 80 + 15.5 * k).flatMap(y => DIAMOND_X.map(x =>
  `M${mm(x)} ${mm(y - DIAMOND_H)}L${mm(x + DIAMOND_W)} ${mm(y)}L${mm(x)} ${mm(y + DIAMOND_H)}L${mm(x - DIAMOND_W)} ${mm(y)}Z`)).join('');
/** The yellow flag on the lever face: square top, lower corners drawn in to the stem. */
const FLAG = path('M30 62H96V240L90 246H36L30 240Z');
const flag = `<path d="${FLAG}" fill="${PAINTS.yellow}" stroke="${INK}" stroke-width="${PENS.medium}"/>` +
  `<path d="${diamonds}" fill="${INK}" stroke="none"/>` +
  `<path d="${path('M53 86Q53 75 64 75Q75 75 75 86V229Q75 240 64 240Q53 240 53 229Z')}" fill="${INK}" stroke="none"/>` +
  // The legend is yellow on a black band down the middle of the flag.
  `<g transform="translate(${mm(64)} ${mm(158)}) rotate(-90)">${text(0, 0, 'EJECTION CONTROLS LOCKED', mm(10), mm(150)).replace(`fill="${INK}"`, `fill="${PAINTS.yellow}"`)}</g>`;

export const seatArmingLever: PanelSpec = {
  id: 'seat-arming-lever',
  title: 'Ejection seat arming lever',
  canvas: [mm(126), mm(334)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 81,
    image: 'p. 81 "Ejection Seat Arming Lever (Disarmed position)" image, 440 x 611 px (image 007); the lever at x 190–256',
    rectify: 'none: the lever faces the camera; it is squared up about its centre line (x 223 in the image), the flag\'s left and right edges made parallel',
    pxPerMm: PX,
    scale: 'The CMDS panel\'s DZUS head beside the lever is 23 px across: at the shared 8.5 mm DZUS size that is 2.7 px/mm, taken for the lever, which stands at about the same distance from the camera. The flag is then 24 mm wide and 66 mm tall.',
    shown: { 'arming-lever': 'disarmed' },
    unresolved: [
      'The guide pictures the armed position only from above, flush with the seat; square-on from the front only the lever\'s edge shows, drawn as a thin bar at the seat surface. The angle it turns through (taken as 90° aft) is not given.',
      'The seat bucket round the lever (cushion, side rail) is drawn as a plain strip with the lever\'s slot.',
      'The grey top of the lever is plain metal in the image; its top corners are drawn rounded as they appear.',
      'The ejection handle and the emergency manual chute lever (both not implemented in DCS) are catalogued separately under Ejection seat.',
    ],
  },
  plate: [
    // Seat bucket surface the lever folds down onto, with the slot it lies in.
    { d: path('M8 300H118V330H8Z') },
  ],
  engraving: [
    { kind: 'path', d: path('M28 300V306H98V300'), pen: 'fine' },
  ],
  placements: [
    {
      component: 'traced', control: 'arming-lever', at: pt(...PIVOT), hit: [mm(26), mm(10), mm(74), mm(298)],
      shapes: {
        // Upright: grey metal top, the yellow flag below it, a narrow stem down to the pivot.
        disarmed: { d: path('M41 14H85Q91 14 91 20V62H35V20Q35 14 41 14ZM46 246H80V300H46Z'), svg: flag },
        // Folded aft and down, flush with the seat: its edge in the slot.
        armed: { d: path('M30 300H96V306H30Z') },
      },
    },
  ],
  controls: [
    {
      id: 'arming-lever', name: 'Ejection seat arming lever', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'disarmed', label: 'Up (disarmed)', hold: 'stable' },
        { id: 'armed', label: 'Down (armed)', hold: 'stable' },
      ],
      initial: 'disarmed',
      description: 'Arms the ejection handle and its mechanisms. Upright, the seat is disarmed and the SEAT NOT ARMED caution light is lit. Rotated aft and down until flush with the seat, the seat is armed and the caution goes out. It is armed as late as possible before takeoff to prevent an inadvertent ejection on the ground.',
      source: src + '; p. 144 (Before Takeoff, step 12)',
    },
  ],
  indicators: [],
};
