import type { ControlDef, MfdDisplay, PanelSpec, Placement } from '../types';
import { tracer } from '../trace.ts';
import { hadBottom, hadPageLabels, hadPages } from './mfd-had.ts';
import { tgpPageLabels, tgpPages } from './mfd-tgp.ts';
import { harmPageLabels, harmPages } from './mfd-harm.ts';
import { hsdPageLabels, hsdPages } from './mfd-hsd.ts';
import { aimFcrLabels, fcrPageLabels, fcrPages } from './mfd-fcr.ts';
import { twoPageLabels, twoPages } from './mfd-fcr-two.ts';
import { gmPageLabels, gmPages } from './mfd-fcr-gm.ts';
import { smsAaPageLabels, smsAaPages } from './mfd-sms-aa.ts';
import { maverickDPageLabels, maverickDPages, maverickPageLabels, maverickPages } from './mfd-maverick.ts';

/**
 * F-16C Multi-Function Displays (MFD), DCS: the left and right MFDs are the
 * same unit, so one build makes both. A 4 x 4 in screen framed by twenty
 * Option Select Buttons (OSB 1-5 along the top left to right, 6-10 down the
 * right, 11-15 along the bottom right to left, 16-20 up the left) and four
 * rockers in the corners (GAIN, SYM, BRT, CON).
 *
 * Reference: the guide's p. 122 MFD image (660 x 660 JPEG, `pdfimages -j -f
 * 122 -l 122`, image 002). The camera is square-on (OSB rows and columns are
 * straight and evenly spaced: rows 78.6 px apart, the outer rows 290 px either
 * side of the centre both ways), so the image is traced without a warp. The
 * DTE format pages are the p. 127 and p. 128 images (same camera, same
 * bezel). Values below are pixels on those images.
 *
 * Words on the screen are fixed pitch: 12.65 px apart, about 11 px wide and
 * 13.5 px high (fitted to the 3-, 4- and 5-letter words: 37, 50 and 63 px).
 * Left-column words start at x 111.5, right-column words end at x 551.5.
 */
const PX = 4.8;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 122-123';
const dteSrc = 'DCS F-16C guide pp. 127-128';

/** Screen centre (opening 70-589 px both ways). */
const SC: [number, number] = [329.5, 330];
const CX = 329.5, CY = 330.5;
/** OSB pitch and the outer row/column offsets from the centre. */
const P = 78.6, ROW = 290, COL = 292;
const col = [-2, -1, 0, 1, 2].map(k => CX + k * P), row = [-2, -1, 0, 1, 2].map(k => CY + k * P);

/** OSB n's centre in px: 1-5 top L→R, 6-10 right T→B, 11-15 bottom R→L, 16-20 left B→T. */
function osbAt(k: number): [number, number] {
  if (k <= 5) return [col[k - 1], CY - ROW];
  if (k <= 10) return [CX + COL, row[k - 6]];
  if (k <= 15) return [col[15 - k], CY + ROW];
  return [CX - COL, row[20 - k]];
}
/** OSB: housing 56 px square, cap 46 px, the cap's raised square 32 px (6.7 mm). */
const OSB = mm(56), SQ = mm(32) / 2;
const osbMarks = `M${-SQ} ${-SQ}H${SQ}V${SQ}H${-SQ}Z`;

/** Rockers: cap 45 x 66 px in the side columns, 240 px above and below the centre; legend 9.5 px high, 9 px above the cap centre. */
const ROCKERS: [id: string, label: string, x: number, y: number][] = [
  ['gain', 'GAIN', CX - COL, CY - 240], ['sym', 'SYM', CX + COL, CY - 240],
  ['brt', 'BRT', CX - COL, CY + 240], ['con', 'CON', CX + COL, CY + 240],
];

/* -------------------------------------------------------------- screen pages */

const W = 11, PITCH = 12.65, CAP = 13.5;
type Word = MfdDisplay['pages'][number]['words'][number];
/** A word in image px: `a` is which end of the ink `x` is. */
const w = (t: string, x: number, y: number, a?: Word['a'], inv?: boolean): Word =>
  ({ t, at: [mm(x - SC[0]), mm(y - SC[1])], ...(a ? { a } : {}), ...(inv ? { inv } : {}) });
const L = (t: string, y: number, inv?: boolean) => w(t, 111.5, y, 'start', inv);
const R = (t: string, y: number) => w(t, 551.5, y, 'end');
/** The format-select row along the bottom (OSB 15-11), the current format inverse. */
const bottom = (cur: 'FCR' | 'DTE') => [
  w('SWAP', 186, 538.5), w('FCR', 259, 538.5, undefined, cur === 'FCR'), w('TEST', 332, 538.5),
  w('DTE', 405, 538.5, undefined, cur === 'DTE'), w('DCLT', 477.5, 538.5),
];
/** Aircraft reference symbol (p. 127 item 16): a vertical bar with the watermark beside it. */
const ars = `M114.5 503V539M112 515H122L128 527L133.5 515L139 527L144.5 515H155`
  .replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)|([HV])(-?\d+\.?\d*)/g, (m, x, y, c, v) =>
    x !== undefined ? `${mm(+x - SC[0])} ${mm(+y - SC[1])}` : `${c}${mm(+v - (c === 'H' ? SC[0] : SC[1]))}`);
const dteTop = [w('DTC ID', 331, 229.5), w('SEADSTRIKE', 329, 248)];

export const mfdDisplay: MfdDisplay = {
  opening: mm(519), r: mm(63), inset: mm(15),
  cap: mm(CAP), width: mm(W), pitch: mm(PITCH), pad: [mm(3), mm(3.2)],
  pages: [
    { id: 'off', words: [] },
    {
      id: 'menu', words: [
        w('BLANK', 184, 116.5), w('HAD', 258, 116.5), w('RCCE', 404, 116), w('RESET', 477, 116), w('MENU', 476.5, 143.5),
        L('FCR', 185.5, true), L('TGP', 257.5), L('WPN', 328.5), L('TFR', 400.5), L('FLIR', 472),
        R('SMS', 184.5), R('HSD', 256.5), R('DTE', 328), R('TEST', 400), R('FLCS', 471),
        ...bottom('FCR'),
      ],
    },
    {
      // MENU for an empty third format slot (OSB 12) in the guide's HTS mission (SMS, HSD and HAD slots, pp. 530-539).
      id: 'menu-blank', words: [
        w('BLANK', 184, 116.5), w('HAD', 258, 116.5), w('RCCE', 404, 116), w('RESET', 477, 116), w('MENU', 476.5, 143.5),
        L('FCR', 185.5), L('TGP', 257.5), L('WPN', 328.5), L('TFR', 400.5), L('FLIR', 472),
        R('SMS', 184.5), R('HSD', 256.5), R('DTE', 328), R('TEST', 400), R('FLCS', 471),
        ...hadBottom('BLANK'),
      ],
    },
    ...hadPages.map(p => (p.id.startsWith('had-thrt') ? { ...p, paths: [{ d: ars, c: 'cyan' as const }] } : p)),
    ...tgpPages,
    ...harmPages,
    ...maverickPages,
    ...maverickDPages,
    ...hsdPages,
    ...fcrPages,
    ...twoPages,
    ...gmPages,
    ...smsAaPages,
    {
      id: 'dte', words: [
        w('ON', 184.5, 117), w('CLSD', 257.5, 117), w('LOAD', 331, 116.5), w('FCR', 404, 116.5),
        L('MPD', 185.5), L('COMM', 257.5), L('INV', 329.5), L('PROF', 400.5), L('MSMD', 472),
        R('ELINT', 185.5), R('SMDL', 256.5), R('TNDL', 320), R('A', 336.5), R('NCTR', 400), R('PAGE', 464), R('1', 481),
        ...dteTop, w('TNDL INIT REQD', 319, 377),
        ...bottom('DTE'),
      ],
      paths: [{ d: ars, c: 'cyan' }],
    },
    {
      id: 'dte-2', words: [
        w('ON', 184.5, 117), L('GPS', 186.5), L('COLR', 258.5),
        ...dteTop, R('PAGE', 464), R('2', 481),
        ...bottom('DTE'),
      ],
      paths: [{ d: ars, c: 'cyan' }],
    },
  ],
};

/* ------------------------------------------------------------------ controls */

const OSB_USE: Record<number, string> = {
  1: 'top row, far left', 5: 'top row, far right', 6: 'right column, top', 10: 'right column, bottom',
  11: 'bottom row, far right', 15: 'bottom row, far left', 16: 'left column, bottom', 20: 'left column, top',
};
const osb = (k: number): ControlDef => ({
  id: `osb-${k}`, name: `OSB ${k}`, type: 'pushbutton', source: src,
  positions: [{ id: 'out', label: 'OUT' }, { id: 'in', label: 'PRESSED', hold: 'momentary', spring: 'out' }], initial: 'out',
  description: `Option Select Button ${k}${OSB_USE[k] ? ` (${OSB_USE[k]})` : ''}: selects the option whose text is shown beside it on the screen. Highlighted text means the option is on or in progress.`,
});
const ROCKER_TEXT: Record<string, string> = {
  gain: 'Adjusts the intensity of the sensor video, independently of the symbology and of the display\'s own brightness and contrast. On the FCR format in ground map or sea mode it sets the radar map underlay; in GMT mode, the moving-target gain; on the TGP format with manual gain control, the pod\'s FLIR gain.',
  sym: 'Adjusts the intensity of the MFD symbology, independently of the sensor video and of the display\'s brightness and contrast.',
  brt: 'Adjusts the overall brightness of the display.',
  con: 'Adjusts the overall contrast of the display.',
};
const rocker = (id: string, label: string): ControlDef => ({
  id, name: `${label} rocker`, type: 'toggle', travel: 'vertical', source: 'DCS F-16C guide p. 123', initial: 'center',
  positions: [
    { id: 'up', label: 'UP (increase)', hold: 'momentary', spring: 'center' },
    { id: 'center', label: 'CENTRE' },
    { id: 'down', label: 'DOWN (decrease)', hold: 'momentary', spring: 'center' },
  ],
  description: `${ROCKER_TEXT[id]} Held up or down, the setting keeps changing until it reaches its limit.`,
});

/** Bottom-corner screw covers (centres from the guide) and the raised corner blocks and ridges round the OSBs. */
const BOSSES = [[31, 630], [628, 630]] as const;
const LO = CX - 2.5 * P, HI = CX + 2.5 * P, TOP = CY - 2.5 * P, BOT = CY + 2.5 * P, RW = 3.5, N = 22;
const ridges = [-1.5, -0.5, 0.5, 1.5].flatMap(k => {
  const x = CX + k * P, y = CY + k * P;
  return [`M${x - RW} 3H${x + RW}V70H${x - RW}Z`, `M${x - RW} 590H${x + RW}V657H${x - RW}Z`, `M3 ${y - RW}H70V${y + RW}H3Z`, `M590 ${y - RW}H657V${y + RW}H590Z`];
});
const [bl, br] = BOSSES;
const RAISED = [
  `M3 21Q3 3 21 3H${LO}V${TOP}H3Z`, `M${HI} 3H639Q657 3 657 21V${TOP}H${HI}Z`,
  `M3 ${BOT}H${LO}V657H${bl[0] + N}V${bl[1]}Q${bl[0] + N} ${bl[1] - N} ${bl[0]} ${bl[1] - N}H3Z`,
  `M${HI} ${BOT}H657V${br[1] - N}H${br[0]}Q${br[0] - N} ${br[1] - N} ${br[0] - N} ${br[1]}V657H${HI}Z`,
  ...ridges,
].join('');

function build(side: 'left' | 'right'): PanelSpec {
  const Side = side === 'left' ? 'Left' : 'Right';
  return {
    id: `${side}-mfd`,
    title: `${Side} MFD`,
    canvas: [mm(660), mm(660)],
    source: {
      variant: 'DCS F-16C Viper (Block 50)',
      manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
      page: 122,
      image: 'p. 122 MFD image, 660 x 660 px; DTE format pages p. 127 and p. 128, HAD p. 539 and THRT p. 534 (same camera)',
      rectify: 'none: square-on (OSB rows and columns straight and evenly spaced)',
      pxPerMm: PX,
      scale: 'The guide gives the display as 4 x 4 in. The glass inside the screen opening is 489 px across (opening 519 px less a 15 px bevel each side), taken as 4 in: 4.8 px/mm. The whole unit is then about 137 mm square.',
      shown: { display: 'menu' },
      unresolved: [
        'The guide\'s pictures are of one MFD; the left and right units are drawn the same. Which format each shows at power-up depends on the loaded data and is not drawn: procedures pick the page.',
        'The screen is drawn in the sim\'s colours on dark glass (colours sampled off the guide\'s images): white words, highlighted words inverse, cyan aircraft reference symbol; on the HAD magenta range rings, cyan ownship, flight members and bullseye, grey inactive route, threats in their emission-state colour (p. 531: yellow search, red track, red flashing launch, green in memory). The SA-6 is white before it is designated, as the p. 537 image shows it; white is not one of the p. 531 states.',
        'The DTC file name (SEADSTRIKE) and the TNDL INIT REQD advisory are the guide\'s example; they change with the mission.',
        'HAD pages (HTS): the screen is one tactical picture, traced from the p. 539 image (30 NM depressed, the SA-6 designated) and drawn in the states a procedure steps through. The HAD cursor is drawn as the two short bars seen in the p. 537 expanded images; the guide does not show it in the normal field of view. The expanded fields of view are worked out from the guide\'s description (2:1 and 4:1 about the cursor, rings, DEP, the range scale and the bullseye removed, as the p. 537 images show), not traced.',
        'The empty format slot is labelled BLANK, after the BLANK format at OSB 1 on MENU; the guide does not picture an empty slot.',
        'The two screws along the bottom sit 82 px in from each side. The screw covers in the bottom corners are drawn as plain rings, 28 px across, in cut-outs in the raised corners.',
        'The OSB caps\' raised squares and the rockers\' arrows are traced from the guide; how far each rocker rocks is not shown.',
      ],
    },
    plate: [
      // Bezel: 3-657 px both ways, corners about 18 px round (the image is cropped close at the corners).
      { d: path('M21 3H639Q657 3 657 21V639Q657 657 639 657H21Q3 657 3 639V21Q3 3 21 3Z') },
      // Raised corner blocks (out to 133 px from the centre lines' outer OSBs: edge at 136 on the bottom row) and
      // ridges between the OSBs, 7 px wide at the half-pitch lines (measured 287-293, 365.5-371.5, 444-450 on the
      // bottom row), standing to the corners' height. The bottom corners are cut away round the screw covers.
      { d: path(RAISED), raised: true },
    ],
    engraving: [
      // Round screw covers in the bottom corners.
      { kind: 'svg', markup: BOSSES.map(([x, y]) => `<circle cx="${mm(x)}" cy="${mm(y)}" r="${mm(14)}" fill="none" stroke-width="0.4"/><circle cx="${mm(x)}" cy="${mm(y)}" r="${mm(9)}" fill="none" stroke-width="0.25"/>`).join('') },
    ],
    placements: [
      { component: 'mfd-display', indicator: 'display', at: pt(...SC), display: mfdDisplay },
      ...Array.from({ length: 20 }, (_, i): Placement => ({
        component: 'push-square', control: `osb-${i + 1}`, at: pt(...osbAt(i + 1)), size: [OSB, OSB], legend: [], marks: osbMarks,
      })),
      ...ROCKERS.map(([id, label, x, y]): Placement => ({
        component: 'rocker', control: id, at: pt(x, y), size: [mm(47), mm(68)], arrows: 'legend',
        legend: { text: label, cap: mm(9.5), y: mm(-9), width: mm(label.length > 3 ? 32 : 30) },
      })),
      { component: 'screw-medium', at: pt(23.5, 19) },
      { component: 'screw-medium', at: pt(635.5, 19) },
      { component: 'screw-medium', at: pt(82, 628) },
      { component: 'screw-medium', at: pt(578, 628) },
    ],
    controls: [...Array.from({ length: 20 }, (_, i) => osb(i + 1)), ...ROCKERS.map(([id, label]) => rocker(id, label))],
    indicators: [
      {
        id: 'display', name: `${Side} MFD screen`, type: 'display',
        pages: [
          { id: 'off', label: 'Off (blank)' },
          { id: 'menu', label: 'MENU format (format select)' },
          { id: 'dte', label: 'DTE format, page 1' },
          { id: 'dte-2', label: 'DTE format, page 2' },
          { id: 'menu-blank', label: 'MENU format for an empty (BLANK) format slot' },
          ...Object.entries(hadPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(tgpPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(harmPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(maverickPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(maverickDPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(hsdPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(fcrPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(twoPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(gmPageLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(aimFcrLabels).map(([id, label]) => ({ id, label })),
          ...Object.entries(smsAaPageLabels).map(([id, label]) => ({ id, label })),
        ],
        restPage: 'off',
        description: 'A 4 x 4 in colour LCD showing the selected format. MENU lists the formats that can be assigned to the highlighted format-select button along the bottom (OSB 12-14). The DTE format loads mission data from the data transfer cartridge: LOAD (OSB 3) loads every partition, or each partition loads on its own button (MPD, COMM, ELINT on page 1; GPS, COLR on page 2; PAGE at OSB 10 changes page). The HAD (HARM Attack Display) format shows the radars the HTS pod has located, over the route and range rings: OSB 1 DEP/CEN, OSB 3 field of view, OSB 4 THRT (threat classes in each HTS scan), OSB 5 CNTL, OSB 19/20 range scale. The TGP format shows the targeting pod video and symbology: in Slave mode (large crosshairs) the pod looks at the system point of interest, with its coordinates and elevation top left. The HAD Control (CNTL) page turns the routes, lines and pre-planned threats on the HAD on or off. With the AGM-65 Maverick selected, the WPN format shows the missile seeker’s video under the crosshairs, pointer cross and launch range scale. The display is powered by the MFD switch on the AVIONICS POWER panel.',
        source: `${src}; ${dteSrc}; DCS F-16C guide pp. 530-539 (HAD), p. 495 (TGP), pp. 659-662 (HARM SMS, WPN), pp. 672-673 (Maverick SMS, WPN), p. 599 (SMS air-to-air), p. 598 (FCR AIM-120 symbology)`,
      },
    ],
  };
}

export const leftMfd = build('left');
export const rightMfd = build('right');
