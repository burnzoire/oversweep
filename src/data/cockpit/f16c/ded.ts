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

/**
 * TACAN states of the T-ILS and CNI pages for the TACAN recovery procedure, laid out as the guide's tuning figures
 * (p. 237) show them: line 1 mode and ILS status, line 3 the beacon identifier and (while the asterisks are not on
 * the channel) the asterisks round CMD STRG, line 4 channel, line 5 band. The ILS side is the figure's: ON, CMD STRG,
 * 108.10, course 0°.
 */
const tcnLines = (o: { mode: 'REC' | 'T/R'; bcn?: string; chan: string; band: 'X' | 'Y'; onChan?: boolean; edit?: boolean }) => [
  ` TCN ${o.mode}     ILS  ON    `,
  '',
  o.onChan ? `${o.bcn ? `BCN ${o.bcn}` : ''}`.padEnd(15) + 'CMD STRG ' : `${o.bcn ? `BCN ${o.bcn}` : '       '}{*}      {*}CMD STRG `,
  o.onChan ? `CHAN{*}${o.edit ? `{${o.chan.padStart(3)}}` : o.chan.padStart(3)}{*}   FRQ  108.10 ` : `CHAN${o.chan.padStart(4)}    FRQ  108.10 `,
  `BAND ${o.band}(0)   CRS    0°   `,
];
const cniLines = (t: string, stpt = 4) => [
  ` UHF  330.50  STPT ^${String(stpt).padStart(3)} `,
  '                257°010 ',
  ' VHF  147.25   14:14:18 ',
  '                0:03:50 ',
  ` M   4   1337      ${t}`,
];
const cniTcn = (t: string) => cniLines(t);

/**
 * STPT page states for the steerpoint entry procedure, laid out as the guide's STPT figure (p. 207) and its DEST DIR
 * entry figures (pp. 212-213) show them: line 1 the steerpoint number (asterisks round it, the up/down field arrow)
 * and MAN sequencing, then LAT, LNG, ELEV and TOS. An empty steerpoint reads N 00°00.000', E000°00.000', 0FT, 00:00:00.
 * A field being typed is highlighted whole with its asterisks. The characters typed so far are drawn left to right
 * (the ° . ' marks as they are reached); the guide shows only the finished entry, so partial states are assumed.
 */
type SField = 'num' | 'lat' | 'lon' | 'elev';
interface SData { n: number; lat: string; lon: string; elev: string; tos: string }
const SP4: SData = { n: 4, lat: "N 35°44.295'", lon: "E037°02.898'", elev: '823FT', tos: '09:01:35' };
const SP5_EMPTY: SData = { n: 5, lat: "N 00°00.000'", lon: "E000°00.000'", elev: '0FT', tos: '00:00:00' };
const SP5_LAT = "N 36°35.822'", SP5_LON = "E036°35.014'", SP5_ELEV = '892FT';
/** A field's cells: columns either side of the value are blank, asterisk boxes (focus) or the highlighted whole (typing). */
const stptField = (value: string, width: number, focus: boolean, typed: boolean, pad = '') =>
  typed ? `{*${pad}${value.padEnd(width)}*}` : focus ? `{*}${pad}${value}{*}` : ` ${pad}${value} `;
const stptLines = (d: SData, focus?: SField, typed?: string) => {
  const on = (f: SField) => focus === f, ed = (f: SField) => focus === f && typed !== undefined;
  const num = ed('num') ? ` ${typed!.padStart(2)}` : ` ${String(d.n).padStart(2)}`;
  return [
    '      STPT ' + (ed('num') ? `{*${num}*}` : on('num') ? `{*}${num}{*}` : ` ${num} `) + '^ MAN',
    '    LAT' + stptField(ed('lat') ? typed! : d.lat, 12, on('lat'), ed('lat')),
    '    LNG' + stptField(ed('lon') ? typed! : d.lon, 12, on('lon'), ed('lon')),
    '   ELEV' + stptField(ed('elev') ? `${typed}FT`.padStart(5) : d.elev.padStart(5), 5, on('elev'), ed('elev'), '  '),
    '    TOS ' + d.tos,
  ];
};
/** Hemisphere letter, digits and the marks between them, as far as they are typed (the marks appear once reached). */
const typedPosition = (hemi: string, digits: string, deg: number) => {
  const gap = deg === 2 ? ' ' : '';
  const d = digits.slice(0, deg), m = digits.slice(deg, deg + 2), f = digits.slice(deg + 2);
  return `${hemi}${digits ? gap : ''}${d}${d.length === deg ? '°' : ''}${m}${m.length === 2 ? '.' : ''}${f}${f.length === 3 ? "'" : ''}`;
};
export interface SPage { id: string; label: string; lines: string[] }
/** Steerpoint 5 is entered as N 36°35.822', E036°35.014', 892 ft: the figure values of the guide's STPT page. */
const stptPages = (): SPage[] => {
  const withLat = { ...SP5_EMPTY, lat: SP5_LAT }, withLon = { ...withLat, lon: SP5_LON }, done = { ...withLon, elev: SP5_ELEV };
  const out: SPage[] = [
    { id: 'cni-5', label: 'CNI page, steerpoint 5 selected', lines: cniLines('T 21X', 5) },
    { id: 'stpt-4', label: 'STPT page: steerpoint 4, asterisks on the number', lines: stptLines(SP4, 'num') },
    { id: 'stpt-5-edit', label: 'STPT: typing 5', lines: stptLines(SP5_EMPTY, 'num', '5') },
    { id: 'stpt-5-empty', label: 'STPT: steerpoint 5 selected, empty', lines: stptLines(SP5_EMPTY, 'num') },
    { id: 'stpt-lat-0', label: 'STPT: asterisks on LAT', lines: stptLines(SP5_EMPTY, 'lat') },
  ];
  const field = (key: SField, text: (i: number) => string, n: number, before: SData, after: SData, name: string, next?: SField) => {
    for (let i = 1; i <= n; i++) out.push({ id: `stpt-${key}-${i}`, label: `STPT: typing ${name} (key ${i} of ${n})`, lines: stptLines(before, key, text(i)) });
    out.push({ id: `stpt-${key}-done`, label: `STPT: ${name} accepted`, lines: stptLines(after, key) });
    if (next) out.push({ id: `stpt-${next}-0`, label: `STPT: asterisks on ${next === 'lon' ? 'LNG' : 'ELEV'}`, lines: stptLines(after, next) });
  };
  field('lat', i => typedPosition('N', '3635822'.slice(0, i - 1), 2), 8, SP5_EMPTY, withLat, 'latitude', 'lon');
  field('lon', i => typedPosition('E', '03635014'.slice(0, i - 1), 3), 9, withLat, withLon, 'longitude', 'elev');
  field('elev', i => '892'.slice(0, i), 3, withLon, done, 'elevation');
  return out;
};
const STPT_PAGES = stptPages();
/**
 * INS page states for the after-start procedure (a Stored Heading alignment at Incirlik), laid out as the guide's INS
 * figure (p. 170) shows them: line 1 elapsed minutes / status, RDY and the selected steerpoint; then LAT, LNG, SALT and
 * THDG with G/S. The position is Incirlik's from the airfield data; the true heading is illustrative. The times are
 * assumed (the guide gives about 90 s for a Stored Heading alignment) and the asterisks sit on LAT as the figure shows.
 */
const insLines = (status: string, rdy: boolean, mode: 'align' | 'nav' = 'align') => [
  (`INS ${status}` + (rdy ? ' RDY' : '')).padEnd(21) + '  1',
  mode === 'align' ? "LAT {*}N 37°00.1'{*}" : "LAT  N 37°00.1'",
  "LNG  E035°25.6'",
  'SALT    191FT',
  'THDG  232.0°  G/S    0',
];
const INS_PAGES: SPage[] = [
  { id: 'ins-0', label: 'INS page: alignment started (0.0/99)', lines: insLines('00.0/99', false) },
  { id: 'ins-1', label: 'INS page: attitude attained, coarse alignment begins (0.5/90)', lines: insLines('00.5/90', false) },
  { id: 'ins-2', label: 'INS page: coarse alignment usable, RDY (0.8/62)', lines: insLines('00.8/62', true) },
  { id: 'ins-3', label: 'INS page: fine alignment under way, RDY (1.1/30)', lines: insLines('01.1/30', true) },
  { id: 'ins-4', label: 'INS page: fully aligned, RDY (1.5/10)', lines: insLines('01.5/10', true) },
  { id: 'ins-4-off', label: 'INS page: fully aligned, RDY blank (the flash)', lines: insLines('01.5/10', false) },
  { id: 'ins-nav', label: 'INS page: INS knob in NAV, RDY removed', lines: insLines('01.5/10', false, 'nav') },
];

/**
 * LIST, MISC and HTS (manual threat class) pages for the advanced HTS procedure, laid out on the 24-cell grid as
 * the guide's p. 121 figure (1207 x 786 JPEG, image 000: the LIST and MISC pages and the empty HTS MAN page; cells
 * fitted 10 px apart) and the p. 538 HTS figure (550 x 209 px, pitch 20.9 px, first cell centre x 33) show them.
 * LIST and MISC: each entry's key character inverse. HTS: line 1 HTS MAN and the selected steerpoint with the
 * up/down arrow (cols 8-14, 22-23); entries 1-4 at col 1 and 5-8 at col 10, each a four-cell code field (cols 3-6,
 * 12-15) between its asterisk cells; an empty slot reads XXXX. The codes are the ALIC codes of Appendix B: 108 the
 * SA-6 STRAIGHT FLUSH, 115 the SA-11 FIRE DOME. The guide shows only finished entries: a code being typed is drawn
 * highlighted and right-aligned in its field, which is assumed.
 */
const LIST_LINES = ['          LIST', '{1}DEST {2}BNGO {3}VIP  {R}INTG', '{4}NAV  {5}MAN  {6}INS  {E}DLNK', '{7}CMDS {8}MODE {9}VRP  {0}MISC'];
const MISC_LINES = ['          MISC', '{1}CORR {2}MAGV {3}OFP  {R}HMCS', '{4}INSM {5}LASR {6}GPS  {E}HTS', '{7}DRNG {8}BULL {9}     {0}HARM'];
const htsLines = (codes: string[], focus: number, typing?: string) => {
  const field = (k: number) => {
    const v = (k === focus && typing !== undefined ? typing : codes[k] ?? '').padStart(4);
    const shown = v.trim() ? v : 'XXXX';
    return k === focus ? (typing !== undefined ? `{*${shown}*}` : `{*}${shown}{*}`) : ` ${shown} `;
  };
  return ['        HTS MAN       4^', ...[0, 1, 2, 3].map(r => ` ${r + 1}${field(r)}  ${r + 5}${field(r + 4)}`)];
};
const HTS_PAGES: SPage[] = [
  { id: 'list', label: 'LIST page', lines: LIST_LINES },
  { id: 'misc', label: 'MISC page (LIST, 0)', lines: MISC_LINES },
  { id: 'hts-1', label: 'HTS page: manual class empty, asterisks on entry 1', lines: htsLines([], 0) },
  ...['1', '10', '108'].map((t, i) => ({ id: `hts-1-t${i + 1}`, label: `HTS page: typing ${t} in entry 1`, lines: htsLines([], 0, t) })),
  { id: 'hts-1-done', label: 'HTS page: entry 1 is 108 (SA-6)', lines: htsLines(['108'], 0) },
  { id: 'hts-2', label: 'HTS page: asterisks on entry 2', lines: htsLines(['108'], 1) },
  ...['1', '11', '115'].map((t, i) => ({ id: `hts-2-t${i + 1}`, label: `HTS page: typing ${t} in entry 2`, lines: htsLines(['108'], 1, t) })),
  { id: 'hts-2-done', label: 'HTS page: entry 2 is 115 (SA-11)', lines: htsLines(['108', '115'], 1) },
];

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
      'The TACAN states (T-ILS pages and the two extra CNI pages) follow the guide\'s tuning figures on p. 237. How the display shows a digit as it is typed (here right-aligned and highlighted, as the figure shows 21) and the first asterisk position after the page opens are read from that figure. The ILS side is the figure\'s own (ON, CMD STRG, 108.10, course 0°) and is not part of the TACAN procedure.',
      'The STPT page states (steerpoint 5, empty and as entered) follow the guide\'s STPT figure (p. 207) and DEST DIR entry figures (pp. 212–213): column places from the figures. The guide does not show a field part-typed, so the characters typed so far are drawn left to right, with the ° . and \' marks added as they are reached, and the elevation as typed digits before FT; that, and whether the asterisks stay on a field after ENTR, are assumed. TOS is left at 00:00:00.',
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
        // TACAN procedure states: MIDS LVT off (no TACAN field), on with the old setting, and the T-ILS page as it is tuned.
        { id: 'cni-blank', lines: cniTcn('     ') },
        { id: 'cni-1x', lines: cniTcn('T  1X') },
        { id: 'tils-rec-1x', lines: tcnLines({ mode: 'REC', chan: '1', band: 'X' }) },
        { id: 'tils-tr-1x', lines: tcnLines({ mode: 'T/R', chan: '1', band: 'X' }) },
        { id: 'tils-tr-1x-chan', lines: tcnLines({ mode: 'T/R', chan: '1', band: 'X', onChan: true }) },
        { id: 'tils-tr-2-edit', lines: tcnLines({ mode: 'T/R', chan: '2', band: 'X', onChan: true, edit: true }) },
        { id: 'tils-tr-21-edit', lines: tcnLines({ mode: 'T/R', chan: '21', band: 'X', onChan: true, edit: true }) },
        { id: 'tils-tr-21x', lines: tcnLines({ mode: 'T/R', bcn: 'DAN', chan: '21', band: 'X', onChan: true }) },
        // Steerpoint entry procedure states (STPT page, steerpoint 5).
        // SEAD page (p. 544 figure, 550 x 209 px; grid fitted: pitch 21 px, first cell centre x 55): the designated SEAD target's position, elevation and time on target.
        { id: 'sead', lines: ['   SEAD', ' LAT  N 36°26.2\'', ' LNG  E037°07.7\'', ' ELV  1442FT', ' TOT  00:05:34'] },
        ...STPT_PAGES.map(({ id, lines }) => ({ id, lines })),
        ...INS_PAGES.map(({ id, lines }) => ({ id, lines })),
        ...HTS_PAGES.map(({ id, lines }) => ({ id, lines })),
      ],
    } },
  ],
  controls: [],
  indicators: [
    {
      id: 'display', name: 'DED', type: 'display', restPage: 'off',
      pages: [{ id: 'off', label: 'Off (blank)' }, { id: 'cni', label: 'CNI page' }, { id: 't-ils', label: 'T-ILS page (TACAN/ILS)' }, { id: 'sead', label: 'SEAD page (designated HTS target)' },
        { id: 'cni-blank', label: 'CNI page, MIDS LVT off (no TACAN field)' }, { id: 'cni-1x', label: 'CNI page, TACAN 1X' },
        { id: 'tils-rec-1x', label: 'T-ILS: REC, channel 1, band X' }, { id: 'tils-tr-1x', label: 'T-ILS: T/R, channel 1, band X' },
        { id: 'tils-tr-1x-chan', label: 'T-ILS: asterisks on CHAN' }, { id: 'tils-tr-2-edit', label: 'T-ILS: typing 2' },
        { id: 'tils-tr-21-edit', label: 'T-ILS: typing 21' }, { id: 'tils-tr-21x', label: 'T-ILS: 21X, beacon DAN' },
        ...STPT_PAGES.map(({ id, label }) => ({ id, label })),
        ...INS_PAGES.map(({ id, label }) => ({ id, label })),
        ...HTS_PAGES.map(({ id, label }) => ({ id, label }))],
      restNote: 'blank',
      description: 'Five lines of 24 characters. The CNI page (communications, navigation, IFF) is the home page: UHF and VHF frequencies or channels, the selected steerpoint number, the wind direction (magnetic) and speed, the system time (Zulu), the hack time when one is set, the IFF/transponder modes and Mode 3 code (not implemented in DCS), and the TACAN channel and band. The ICP override buttons and, from the CNI page, the priority function keys call up other pages; DCS RTN returns to CNI. The STPT page (key 4) shows the selected steerpoint\'s position, elevation and time over steerpoint, and edits them. The T-ILS page (key 1) sets the TACAN mode, channel and band and the ILS frequency and course. Asterisks mark the field that new data goes into.',
      source: src,
    },
  ],
};
