import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';
import { INK, PAINTS, PENS, text } from '../components.ts';

/**
 * F-16C ejection seat arming lever (left side of the seat bucket, beside the
 * CMDS panel), DCS, drawn in top view: what the pilot sees looking down, forward
 * up the page. Upright (drawn leaning 45° so its face reads from above), it disarms the seat: a flat lever whose face toward the pilot is a
 * yellow flag with two columns of black diamonds either side of a black band
 * lettered EJECTION CONTROLS LOCKED in yellow, on a grey metal top. Armed, it is pulled aft and down
 * into the recess beside the seat: it lies full length aft of its pivot, showing its
 * other face, a black placard lettered EJECTION CONTROLS ARMED in white.
 *
 * Reference: the guide's p. 81 image of the lever in the disarmed position
 * (440 x 611 JPEG, `pdfimages -j -f 81 -l 81`, image 007). Values are
 * reference pixels less 160 in x (the crop starts at x 160), converted to mm
 * by `tracer`.
 */
const PX = 2.7;
const { mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 81';
const PLACARD_BLACK = '#000';

/** Diamonds: two columns, tip to tip, 15.5 px a row from y 80 (measured). */
const DIAMOND_X = [41, 85], DIAMOND_W = 8.5, DIAMOND_H = 7.75;
const diamonds = Array.from({ length: 11 }, (_, k) => 80 + 15.5 * k).flatMap(y => DIAMOND_X.map(x =>
  `M${mm(x)} ${mm(y - DIAMOND_H)}L${mm(x + DIAMOND_W)} ${mm(y)}L${mm(x)} ${mm(y + DIAMOND_H)}L${mm(x - DIAMOND_W)} ${mm(y)}Z`)).join('');
/** The yellow flag on the lever face: square top, lower corners drawn in to the stem. */
const FLAG = path('M30 62H96V240L90 246H36L30 240Z');
const flag = `<path d="${FLAG}" fill="${PAINTS.yellow}" stroke="${PLACARD_BLACK}" stroke-width="${PENS.medium}"/>` +
  `<path d="${diamonds}" fill="${PLACARD_BLACK}" stroke="none"/>` +
  `<path d="${path('M53 86Q53 75 64 75Q75 75 75 86V229Q75 240 64 240Q53 240 53 229Z')}" fill="${PLACARD_BLACK}" stroke="none"/>` +
  // The legend is yellow on a black band down the middle of the flag.
  `<g transform="translate(${mm(64)} ${mm(158)}) rotate(-90)">${text(0, 0, 'EJECTION CONTROLS LOCKED', mm(10), mm(150)).replace(`fill="${INK}"`, `fill="${PAINTS.yellow}"`)}</g>`;

/** Top view, in mm (forward up the page): the pivot at the forward end of the recess beside the seat; raised, the lever stands forward of the pivot as the pilot sees it; armed, it lies in the recess aft of it. The lever is lever 106 mm long (the guide trace) and 24.4 mm wide. */
const P: [number, number] = [30, 82], L = 106, W = 24.4, X0 = P[0] - W / 2, X1 = P[0] + W / 2;
/** Upright, the lever is drawn leaning 45°, so from above it shows cos 45° of its length. */
const K = Math.cos(Math.PI / 4);
const pen = (w: keyof typeof PENS) => `stroke="${INK}" stroke-width="${PENS[w]}"`;
const block = `<rect x="${X0 + 1}" y="${P[1] - 6}" width="${W - 2}" height="12" rx="1.5" fill="var(--panel-paper,#fff)" ${pen('medium')}/><circle cx="${P[0]}" cy="${P[1]}" r="3" fill="none" ${pen('fine')}/>`;
/** The guide-traced lever face (grey top, yellow flag, stem; pivot at reference (63, 300)), standing forward of the pivot as seen from above, shortened by K. The flat (armed) position shows dashed behind it: the recess it is pulled down into. */
const lockedFace = `<rect x="${X0}" y="${P[1]}" width="${W}" height="${L}" rx="2" fill="none" ${pen('fine')} stroke-dasharray="2 1.5"/><g transform="translate(${P[0]} ${P[1]}) scale(1 ${K.toFixed(4)}) translate(${-mm(63)} ${-mm(300)})">` +
  `<path d="${path('M41 14H85Q91 14 91 20V62H35V20Q35 14 41 14ZM46 246H80V300H46Z')}" fill="var(--panel-paper,#fff)" ${pen('medium')}/>${flag}</g>`;
const armedFace = `<rect x="${X0}" y="${P[1]}" width="${W}" height="${L}" rx="2" fill="var(--panel-paper,#fff)" ${pen('heavy')}/>` +
  // The open channel next to the pivot, then the black ARMED placard toward the free (aft) end.
  `<rect x="${X0 + 2.5}" y="${P[1] + 3}" width="${W - 5}" height="30" rx="2" fill="none" ${pen('fine')}/>` +
  `<rect x="${X0 + 2}" y="${P[1] + 38}" width="${W - 4}" height="${L - 44}" fill="${PLACARD_BLACK}" stroke="none"/>` +
  `<g transform="translate(${P[0] - 3.5} ${P[1] + 38 + (L - 44) / 2}) rotate(-90)">${text(0, 0, 'EJECTION CONTROLS', 3.4, 46).replace(`fill="${INK}"`, 'fill="#fff"')}</g>` +
  `<g transform="translate(${P[0] + 3.5} ${P[1] + 38 + (L - 44) / 2}) rotate(-90)">${text(0, 0, 'ARMED', 3.4, 15).replace(`fill="${INK}"`, 'fill="#fff"')}</g>`;

export const seatArmingLever: PanelSpec = {
  id: 'seat-arming-lever',
  title: 'Ejection seat arming lever',
  canvas: [60, 196],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 81,
    image: 'p. 81 "Ejection Seat Arming Lever (Disarmed position)" image, 440 x 611 px (image 007), for the LOCKED face; the top view and the ARMED face from photos Nathan supplied (a real lever, both faces, and a cockpit replica seen from above, 2026-11-21)',
    rectify: 'none: the LOCKED face is squared up about its centre line (x 223 in the guide image), the flag\'s edges made parallel, then shortened by cos 45° for the top view',
    pxPerMm: PX,
    scale: 'The CMDS panel\'s DZUS head beside the lever is 23 px across in the guide image: at the shared 8.5 mm DZUS size that is 2.7 px/mm, giving a lever 106 mm long and 24.4 mm wide. The top view is laid out in mm.',
    shown: { 'arming-lever': 'disarmed' },
    unresolved: [
      'Drawn in top view, forward up the page, the way the pilot looks down at it. The guide calls the disarmed lever upright; it is drawn leaning 45° so its LOCKED face reads from above.',
      'The pivot is at the forward end (Nathan, 2026-11-21, as the guide\'s "rotated aft and down" says): the lever is pulled aft and down into the recess beside the seat. The pivot block and the open channel are simplified from the photos.',
      'The ARMED placard\'s lettering is set from the photos; its exact size is not measured.',
      'The ejection handle and the emergency manual chute lever (both not implemented in DCS) are catalogued separately under Ejection seat.',
    ],
  },
  plate: [
    // The console edge strip the lever lies along.
    { d: 'M14 4H46V192H14Z' },
  ],
  engraving: [],
  placements: [
    {
      component: 'traced', control: 'arming-lever', at: P, hit: [X0, 4, W, 188],
      shapes: {
        disarmed: { d: '', svg: lockedFace + block },
        armed: { d: '', svg: armedFace + block },
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
