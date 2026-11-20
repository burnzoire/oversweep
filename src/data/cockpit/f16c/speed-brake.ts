import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C SPEED BRAKE position indicator (left auxiliary console, below the
 * landing gear panel, beside the CMDS panel), DCS: a small legend plate
 * reading SPEED BRAKE over a housing with one square window. The window shows
 * CLOSED with the speedbrakes fully retracted, nine dots with them open at any
 * angle, and a striped pattern without power.
 *
 * Reference: the guide's p. 57 close-ups (images 005, dots, and 008, CLOSED,
 * 91 x 154 px each, `pdfimages -j -f 57 -l 57`), almost square-on. Values are
 * reference pixels of image 008, converted to mm by `tracer`; the dots are
 * measured on image 005, which registers with it.
 */
const PX = 4.76;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 57 (item 12)';

/** Window centre and size (reference px). */
const WIN: [number, number] = [45.5, 99.5], WIN_W = 41, WIN_H = 47;
/** Dot grid: columns and rows measured on image 005, as offsets from the window centre. */
const DOT_X = [31, 46, 61].map(x => mm(x - WIN[0])), DOT_Y = [84, 98, 113].map(y => mm(y - WIN[1])), DOT_R = mm(4);
const dots = DOT_Y.flatMap(y => DOT_X.map(x => `<circle cx="${x}" cy="${y}" r="${DOT_R}" fill="#161616" stroke="none"/>`)).join('');
/** No power: diagonal stripes across the window (the guide does not picture this face). */
const stripes = (() => {
  const w = mm(WIN_W) / 2, h = mm(WIN_H) / 2, step = mm(8), out: string[] = [];
  for (let k = -w - h; k < w + h; k += step) out.push(`M${(k - h).toFixed(2)} ${(-h).toFixed(2)}L${(k + h).toFixed(2)} ${h.toFixed(2)}`);
  return `<clipPath id="sb-stripes"><rect x="${-w}" y="${-h}" width="${2 * w}" height="${2 * h}"/></clipPath><path d="${out.join('')}" clip-path="url(#sb-stripes)" fill="none" stroke="#161616" stroke-width="${mm(4)}"/>`;
})();

export const speedBrake: PanelSpec = {
  id: 'speed-brake',
  title: 'SPEED BRAKE position indicator',
  canvas: [mm(80), mm(152)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 57,
    image: 'p. 57 SPEED BRAKE indicator close-ups, 91 x 154 px (image 008 CLOSED, image 005 nine dots); also item 12 of the p. 55 landing gear image',
    rectify: 'none: the close-ups are close to square-on; the housing\'s top face, which the camera sees from above (y 52–68), is left out',
    pxPerMm: PX,
    scale: 'No fastener in the crop. The legend is taken at the landing gear panel\'s engraving height (9 px at 3.06 px/mm, 2.94 mm); the SPEED BRAKE letters are 14 px tall here, giving 4.76 px/mm. The window is then 8.6 x 9.9 mm.',
    shown: { indicator: 'closed' },
    unresolved: [
      'The guide shows CLOSED and the nine dots light on a dark window; they are drawn black on white here.',
      'The striped no-power face is described but not pictured in the guide; it is drawn as diagonal stripes.',
      'The legend plate\'s top and left edges are outside the crop; it is drawn symmetric about the legend.',
      'Physical size rests on the legend height: the guide gives no dimension.',
    ],
  },
  plate: [
    // Legend plate above the housing.
    { d: path('M5 4H72V50H5Z') },
    // Housing front face, rounded lower corners.
    { d: path('M20 66H73V141Q73 145 69 145H24Q20 145 20 141Z') },
  ],
  engraving: [
    { kind: 'text', at: pt(38.5, 21), text: 'SPEED', cap: mm(14), width: mm(44) },
    { kind: 'text', at: pt(38.5, 39), text: 'BRAKE', cap: mm(14), width: mm(44) },
    // The window's bezel: a raised frame 3 px round the window.
    { kind: 'path', d: path('M22 73H70V127H22Z'), pen: 'fine' },
  ],
  placements: [
    {
      component: 'flag-window', indicator: 'indicator', at: pt(...WIN), size: [mm(WIN_W), mm(WIN_H)], r: mm(3),
      faces: {
        closed: { legend: { text: 'CLOSED', cap: mm(7.5), width: mm(37) } },
        open: { svg: dots },
        off: { svg: stripes },
      },
    },
  ],
  controls: [],
  indicators: [
    {
      id: 'indicator', name: 'SPEED BRAKE indicator', type: 'display',
      pages: [{ id: 'closed', label: 'CLOSED' }, { id: 'open', label: 'Nine dots (open)' }, { id: 'off', label: 'Stripes (no power)' }],
      restPage: 'off',
      description: 'Shows CLOSED when the speedbrakes are fully retracted, a pattern of nine dots when they are open at any angle, and a striped pattern when the indicator has no power.',
      source: src,
    },
  ],
};
