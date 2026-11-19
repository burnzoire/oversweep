import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C Data Entry Display (DED), DCS: a five-line, 24-character display to
 * the right of the ICP. It has no controls of its own; the ICP drives it.
 *
 * Reference: the guide's p. 101 figure (1203 x 1069 JPEG, `pdfimages -j -f
 * 101 -l 101`, image 000), which shows each DED page in its bezel. The CNI
 * page (crop 0,280–285,400) is the trace reference; the T-ILS page (crop
 * 148,573–433,693) has the same bezel and grid. Both are square-on, so there
 * is no warp. Values below are pixels in the CNI crop.
 *
 * Character grid, fitted to the lit characters of both pages (cells with no
 * ink between them): pitch 9.92 px, 24 cells from x 22.5 (first cell centre
 * 27.5); five lines 16.25 px apart, centred 27 to 92; characters 12 px high
 * and about 7 px wide. Bezel 10.5–271.5 x 10.5–107.5 (panel-edge row 60,
 * column 140), screen inside it about 4.5 px in.
 *
 * Pages are drawn as the guide shows them (the CNI page with its example
 * frequencies and steerpoint, the T-ILS page with its example TACAN channel).
 * Procedures pick the page (cockpit:indicate `pages`); issue #350.
 */
const PX = 3.57;
const { pt, mm } = tracer(PX);
const src = 'DCS F-16C guide p. 101';
const C: [number, number] = [141, 59];
const rel = (x: number, y: number): [number, number] => [mm(x - C[0]), mm(y - C[1])];

export const ded: PanelSpec = {
  id: 'ded',
  title: 'Data entry display (DED)',
  canvas: [mm(285), mm(120)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide (EN, 16 August 2026)',
    page: 101,
    image: 'p. 101 DED pages figure (1203 x 1069 JPEG), CNI page crop 0,280–285,400',
    rectify: 'none: square-on; crop with PIL Image.crop((0, 280, 285, 400))',
    pxPerMm: PX,
    scale: 'No shared component on the DED. Its lettering was measured against the ICP in the p. 44 instrument panel overview: the ICP corner screws are 169 px apart there (136.4 mm on the ICP drawing, 1.24 px/mm) and the CNI text line (first to last character) about 78 px, so it is 63 mm long; it is 225 px in the figure, so the guide figure 3.57 px/mm. The bezel is then 73 mm wide and the characters 3.4 mm high.',
    shown: { display: 'cni' },
    unresolved: [
      'Physical size is scaled from the perspective overview (the DED sits in the instrument panel, angled slightly toward the pilot), so it may be a few per cent off.',
      'The DED font is drawn with a bold monospace face, not the display\'s own dot shapes. The up/down field arrow (CNI line 1) is drawn as two triangles.',
      'The asterisks that bracket the selected field show in the guide as lit boxes with a dark asterisk; they are drawn inverse. The left box on the T-ILS page spills into the next cell in the guide; it is drawn in its own cell.',
      'Cold and dark, the DED is blank; the CNI page is shown when the reader picks it.',
      'The instrument panel around the bezel is not in the figure.',
    ],
  },
  plate: [],
  engraving: [],
  placements: [
    { component: 'text-display', indicator: 'display', at: pt(...C), display: {
      bezel: [mm(261), mm(97)], screen: [mm(252), mm(88)],
      cols: 24, rows: 5, pitch: [mm(9.92), mm(16.25)], origin: rel(27.46, 26.5), cap: mm(12), width: mm(8),
      pages: [
        { id: 'cni', lines: [
          ' UHF  330.50  STPT ^  4 ',
          '                257°010 ',
          ' VHF  147.25   14:14:18 ',
          '                0:03:50 ',
          ' M   4   1337      T 21X',
        ] },
        { id: 't-ils', lines: [
          ' TCN T/R     ILS  ON    ',
          '',
          'BCN DAN{*}      {*}CMD STRG ',
          'CHAN  21    FRQ  109.30 ',
          'BAND X(0)   CRS   50°   ',
        ] },
      ],
    } },
  ],
  controls: [],
  indicators: [
    {
      id: 'display', name: 'DED', type: 'display', restPage: 'off',
      pages: [{ id: 'off', label: 'Off (blank)' }, { id: 'cni', label: 'CNI page' }, { id: 't-ils', label: 'T-ILS page (TACAN/ILS)' }],
      restNote: 'blank',
      description: 'Five lines of 24 characters. The CNI page (communications, navigation, IFF) is the home page: UHF and VHF frequencies or channels, the selected steerpoint number, the wind direction (magnetic) and speed, the system time (Zulu), the hack time when one is set, the IFF/transponder modes and Mode 3 code (not implemented in DCS), and the TACAN channel and band. The ICP override buttons and, from the CNI page, the priority function keys call up other pages; DCS RTN returns to CNI. The T-ILS page (key 1) sets the TACAN mode, channel and band and the ILS frequency and course. Asterisks mark the field that new data goes into.',
      source: src,
    },
  ],
};
