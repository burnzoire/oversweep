import type { IndicatorDef, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C SPEED BRAKE position indicator (left auxiliary console, below the
 * landing gear panel, beside the CMDS panel), DCS. Not a catalogue panel of its
 * own: `speedBrakeParts` draws its housing below the landing gear panel's
 * lower-left tab, which carries the SPEED BRAKE legend: a housing with one
 * square window. The window shows
 * CLOSED with the speedbrakes fully retracted, nine dots with them open at any
 * angle, and a striped pattern without power.
 *
 * Reference: the guide's p. 57 close-ups (images 005, dots, and 008, CLOSED,
 * 91 x 154 px each, `pdfimages -j -f 57 -l 57`), almost square-on. Values are
 * reference pixels of image 008, converted to mm by `tracer`; the dots are
 * measured on image 005, which registers with it.
 */
const PX = 4.76;
const { mm } = tracer(PX);
const src = 'DCS F-16C guide p. 57 (item 12)';
/** The legend's letter height and line width (mm), for the host panel's engraving. */
export const LEGEND = { cap: mm(14), width: mm(44) };

/** Window centre and size (reference px). */
const WIN: [number, number] = [45.5, 99.5], WIN_W = 41, WIN_H = 47;
/** Dot grid: columns and rows measured on image 005, as offsets from the window centre. */
const DOT_X = [31, 46, 61].map(x => mm(x - WIN[0])), DOT_Y = [84, 98, 113].map(y => mm(y - WIN[1])), DOT_R = mm(4);
const dots = DOT_Y.flatMap(y => DOT_X.map(x => `<circle cx="${x}" cy="${y}" r="${DOT_R}" fill="#161616" stroke="none"/>`)).join('');
/**
 * No power: diagonal black and white stripes across the window, rising to the
 * right ("/"), four white bands across. The guide does not picture this face;
 * it follows a photo of the real indicator (Nathan, 2026-11-21).
 */
const stripes = (() => {
  const w = mm(WIN_W) / 2, h = mm(WIN_H) / 2, step = mm(13), out: string[] = [];
  for (let k = -w - h; k < w + h; k += step) out.push(`M${(k - h).toFixed(2)} ${h.toFixed(2)}L${(k + h).toFixed(2)} ${(-h).toFixed(2)}`);
  return `<clipPath id="sb-stripes"><rect x="${-w}" y="${-h}" width="${2 * w}" height="${2 * h}"/></clipPath><path d="${out.join('')}" clip-path="url(#sb-stripes)" fill="none" stroke="#161616" stroke-width="${mm(13 / Math.SQRT2 / 2)}"/>`;
})();

/**
 * The indicator's housing and window for a host panel, with this drawing's own
 * top-left corner put at `origin` (mm on the host's canvas). The SPEED BRAKE
 * legend is the host's: it is engraved on the landing gear panel. Values below
 * are reference pixels of image 008, as measured; `LEGEND` gives the legend's
 * size there (letters 14 px tall, each line 44 px wide).
 */
export function speedBrakeParts(origin: Pt, id = 'speed-brake') {
  const { pt, path } = tracer(PX, [origin[0] * PX, origin[1] * PX]);
  const indicator: IndicatorDef = {
    id, name: 'SPEED BRAKE position indicator', type: 'display',
    pages: [{ id: 'closed', label: 'CLOSED' }, { id: 'open', label: 'Nine dots (open)' }, { id: 'off', label: 'Stripes (no power)' }],
    restPage: 'off',
    description: 'Shows CLOSED when the speedbrakes are fully retracted, a pattern of nine dots when they are open at any angle, and a striped pattern when the indicator has no power.',
    source: src,
  };
  return {
    plate: [
      // Housing front face, rounded lower corners.
      { d: path('M20 66H73V141Q73 145 69 145H24Q20 145 20 141Z') },
    ] satisfies PanelSpec['plate'],
    engraving: [
      // The window's bezel: a raised frame 3 px round the window.
      { kind: 'path', d: path('M22 73H70V127H22Z'), pen: 'fine' },
    ] satisfies PanelSpec['engraving'],
    placements: [
      {
        component: 'flag-window', indicator: id, at: pt(...WIN), size: [mm(WIN_W), mm(WIN_H)], r: mm(3),
        faces: {
          closed: { legend: { text: 'CLOSED', cap: mm(7.5), width: mm(37) } },
          open: { svg: dots },
          off: { svg: stripes },
        },
      },
    ] satisfies PanelSpec['placements'],
    indicator,
    unresolved: [
      'SPEED BRAKE indicator: traced from the guide\'s p. 57 close-ups (images 005 and 008, 91 x 154 px, almost square-on; legend letters 14 px tall at the landing gear panel\'s 2.94 mm engraving height, so 4.76 px/mm); the housing\'s top face, which the camera sees from above, is left out. The housing hangs just below the panel\'s lower-left tab, centred under its legend.',
      'SPEED BRAKE indicator: the guide shows CLOSED and the nine dots light on a dark window; they are drawn black on white. The striped no-power face is described but not pictured in the guide; it is drawn as black and white stripes rising to the right, as in a photo of the real indicator.',
    ],
  };
}
