import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';
import { INK } from '../components.ts';

/**
 * F-16C HMCS control panel (left auxiliary console), DCS: one SYMBOLOGY INT
 * knob that sets the brightness of the helmet-mounted cueing system's
 * symbology, OFF fully anticlockwise.
 *
 * Reference: the guide's p. 57 "HMCS Control Panel" image (418 x 123 JPEG,
 * `pdfimages -j -f 57 -l 57`, image 002). The plate's edges are straight and
 * square in the image, so it is traced without a warp. Values below are pixels
 * on that image.
 *
 * Plate 4.5-117.5 high (panel-edge columns 120-122), right edge x 412. The
 * right DZUS (centre 392, 49, about 26 px across) sits in a corner notch whose
 * inner edges measure x 377.5 (rows 10-30) and y 63.5 (columns 400-406). The
 * left DZUS is mostly cut off by the crop: its head shows at x 0-5, y 58-80,
 * beside a vertical edge at x 6.5 that runs only from y 58 down (rows 62-110;
 * none on rows 15-55). That is a bottom-left notch, the right one turned
 * through 180° about the plate centre: DZUS at (-8, 73), notch edges x 6.5 and
 * y 58.5, plate from x -28. The reference is padded 30 px on the left for the
 * review, so values below are image px + 30 in x (`X`).
 */
const PX = 3.06, OX = 30;
const { pt: pt0, mm, path: path0 } = tracer(PX);
const pt = (x: number, y: number) => pt0(x + OX, y);
/** Shift an absolute M/L/Q/H path's x values by OX. */
const path = (d: string) => path0(d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)|H(-?\d+\.?\d*)/g, (m, x, y, h) =>
  x !== undefined ? `${+x + OX} ${y}` : `H${+h + OX}`));
const src = 'DCS F-16C guide p. 57';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

/** Knob: centred under SYMBOLOGY INT. OFF is at 231° (towards the OFF legend); fully clockwise is at 135° (where the guide's knob points), 264° of travel. */
const KNOB: [number, number] = [225, 72];
const OFF = -129, FULL = 135;
const STEPS = Array.from({ length: 10 }, (_, i) => (i + 1) * 10);

export const hmcs: PanelSpec = {
  id: 'hmcs',
  title: 'HMCS control panel',
  canvas: [mm(418 + OX), mm(123)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 57,
    image: 'p. 57 "HMCS Control Panel" image, 418 x 123 px',
    rectify: 'none: the plate edges are straight and square in the image; padded 30 px on the left (the crop cuts off the left DZUS)',
    pxPerMm: PX,
    scale: 'The DZUS head (about 26 px across) matches the shared 8.5 mm head at 3.06 px/mm; the DZUS are then 131 mm apart across the panel and the plate 144 x 37 mm, a standard 5.75 in console panel.',
    shown: { symbology: '100' },
    unresolved: [
      'The guide\'s crop cuts off the left end of the plate. Its DZUS and bottom-left notch are placed by the head and notch edge that show at the crop and by turning the right-hand DZUS and notch through 180° about the plate centre; the plate\'s left edge (x -28) is inferred from that, not seen.',
      'The knob is a potentiometer with an OFF stop; the guide gives no detents. It is read in percent of travel, 10 % a click. Its travel (OFF at the OFF legend, about 264° to fully clockwise, where the guide\'s knob points) is measured off the image, not stated.',
      'The knob is drawn as the shared small knurled knob (as EXT LIGHTING ANTI-COLL), square-on; its 50 px top face in the image is the camera looking down on a tall knob.',
      'The curved INC arrow is traced from the image as a printed line with a filled head.',
    ],
  },
  plate: [
    { d: path('M-28 4.5H412V117.5H-28Z') },
  ],
  engraving: [
    // Vertical HMCS title.
    L([20, 31.7], 'H', 11, 8), L([20, 50], 'M', 11, 9), L([20, 68.3], 'C', 11, 8), L([20, 87.3], 'S', 11, 8),
    L([KNOB[0], 22.5], 'SYMBOLOGY', 11, 68), L([KNOB[0], 36], 'INT', 11, 17),
    L([196, 99.5], 'OFF', 9.5, 18), L([260, 75.5], 'INC', 9.5, 15),
    // INC arrow, clockwise down the knob's right side.
    { kind: 'path', pen: 'medium', d: path('M248.5 40.5Q255 52 256.5 63') },
    { kind: 'svg', markup: `<path d="${path('M252.5 61.5L260.5 61L257.5 70Z')}" fill="${INK}" stroke="none"/>` },
  ],
  placements: [
    { component: 'dzus', at: pt(392, 49), cut: 'up-right' },
    { component: 'dzus', at: pt(-8, 73), cut: 'down-left' },
    { component: 'screw-small', at: pt(90, 99) },
    { component: 'screw-small', at: pt(269, 27) },
    { component: 'knob-knurled-small', control: 'symbology', at: pt(...KNOB) },
  ],
  controls: [
    {
      id: 'symbology', name: 'SYMBOLOGY INT knob', type: 'rotary',
      positions: [
        { id: 'off', label: 'OFF', hold: 'stable', angle: OFF },
        ...STEPS.map(v => ({ id: String(v), label: `${v}%${v === 100 ? ' (brightest)' : ''}`, hold: 'stable' as const, angle: +(OFF + ((FULL - OFF) * v) / 100).toFixed(1) })),
      ],
      initial: 'off',
      description: 'Sets the brightness of the HMCS symbology projected onto the helmet visor: clockwise brighter. At OFF the symbology is removed from the visor. It turns without detents past OFF and is read in percent of its travel, 10 % a click.',
      source: src,
    },
  ],
  indicators: [],
};
