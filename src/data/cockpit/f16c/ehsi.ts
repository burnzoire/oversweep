import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C Electronic Horizontal Situation Indicator (EHSI), DCS: a colour LCD
 * in a square bezel on the instrument panel, below the ADI, with the HDG and
 * CRS knobs and the M (mode) button.
 *
 * Reference: the guide's p. 230 image (550 x 550 JPEG, `pdfimages -j -f 230
 * -l 230`, image 002). The camera is square-on, so it was not warped. Values
 * below are reference pixels.
 *
 * Symbology (centre 274.5, 269 from the lubber lines): lubber lines r 181–202
 * every 45°; card ticks every 5° to r 180, from r 156 (10°) or 168 (5°);
 * letters and numbers every 30°, 25.5 px high centred on r 141.5 (the E's
 * bars, ray at 13°). Course arrow r 83–126 with its tail r 84–127; bearing
 * pointer r 162–198 with its tail r 163–189 (cyan pixels by radius). The
 * deviation dots sit 42.5 and 85 px either side of the course line; the
 * deviation bar runs ±81 px. In the image the card shows heading 076, the
 * course arrow 065 (11.4° left of the lubber), the bearing pointer 069, the
 * heading marker 105, range 15.9 NM and the deviation bar 0.72 dot right.
 */
const PX = 5.6;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 230–231';
const C: [number, number] = [274.5, 269];
const rel = (x: number, y: number): [number, number] => [mm(x - C[0]), mm(y - C[1])];

/** Rounded rectangle in reference px. */
const rrect = (x0: number, y0: number, x1: number, y1: number, r: number) =>
  `M${x0 + r} ${y0}H${x1 - r}Q${x1} ${y0} ${x1} ${y0 + r}V${y1 - r}Q${x1} ${y1} ${x1 - r} ${y1}H${x0 + r}Q${x0} ${y1} ${x0} ${y1 - r}V${y0 + r}Q${x0} ${y0} ${x0 + r} ${y0}Z`;
/**
 * Screen: left 69, right 480 (panel-edge row 270), top 50, bottom 476 (columns 200, 350); the bottom corners are
 * cut away on a 45° line round the knobs (zoom of the bottom-left corner, mirrored for the right).
 */
const SCREEN = 'M84 50H465Q480 50 480 65V380Q480 386 475 391L412 459Q397 476 380 476H169Q152 476 137 459L74 391Q69 386 69 380V65Q69 50 84 50Z';

/**
 * Raised bezel (Nathan's mark-up, 4-way symmetric): the full plate with each corner cut away for its screws. From the
 * top or bottom edge the cut runs straight in at x 50 / 500 for about 21 px, turns on a short fillet and runs at 45° to
 * the side edge 77 px from the corner. The base plate shows in the cut-away corners.
 */
const BEZEL = 'M50 3H500V24Q500 30 504 34L547 77V473L504 516Q500 520 500 526V547H50V526Q50 520 46 516L3 473V77L46 34Q50 30 50 24Z';

const rotary = (id: string, name: string, description: string) => ({
  id, name, type: 'rotary' as const, cyclic: true, initial: '0', source: src, description,
  positions: Array.from({ length: 12 }, (_, i) => ({ id: String(i), label: `step ${i}`, angle: i * 30 })),
});

export const ehsi: PanelSpec = {
  id: 'ehsi',
  title: 'Electronic HSI (EHSI)',
  canvas: [mm(550), mm(550)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide (EN, 16 August 2026)',
    page: 230,
    image: 'p. 230 EHSI image (550 x 550 JPEG)',
    rectify: 'none: square-on (corner screws at 25,25 and 525,525)',
    pxPerMm: PX,
    scale: 'The four corner screw wells (about 19 px radius) are taken as the shared panel screw (3.4 mm), giving 5.6 px/mm; the bezel is then 98 mm (3.9 in) square. The p. 44 overview puts the EHSI at about 1.2 times the altimeter dial width, which agrees within a few per cent.',
    shown: { screen: 'on', heading: '76.4', 'heading-set': '105', course: '65', bearing: '69.2', deviation: '0.72', range: '15.9', 'course-set': '65', mode: 'nav', 'to-from': 'none', notice: 'brt' },
    unresolved: [
      'The display is drawn black on white like the rest of the cockpit; in the sim the card is white, the pointers cyan and the heading marker yellow on a black screen.',
      'The to-from indicator is not shown in the guide image ("Not shown"); it is drawn as a small triangle on the course line, 60 px from the centre, which is a guess at its place and size.',
      'Mode legends: the image shows NAV; TCN is drawn the same way. The guide names the ILS modes NAV/PLS and TCN/PLS but does not show their legends, so they are set in the same lettering, centred where NAV is, and may be off in width or place.',
      'The notice above the aircraft (BRT in the image) shows only for a moment after a mode change or a brightness adjustment; procedures pick it. Of the flags only the warning flag (INU/ATT, p. 232) is drawn; the range and CDI flags are not.',
      'The HDG and CRS knobs are dials that turn without end. The guide documents a push for each (HDG in ATT mode: ADJ HDG; CRS: BRT); the pushes are not modelled on this page. Each click turns a knob one step; what a step does is up to the procedure.',
      'The small Phillips screws are drawn at the shared tiny-screw size (1.0 mm); the hex socket screws at 3.0 mm.',
      'The bearing and course arrowheads are measured from the image at about 16 px wide and 20 px long; the lines 5 px wide.',
      'Cold and dark, the screen is blank; pick "On" in the Instruments list (or a procedure turns it on).',
    ],
  },
  plate: [
    // Base plate: the image edges (3–547), corner radius about 18 px. It carries the small Phillips screws.
    { d: path(rrect(3, 3, 547, 547, 18)) },
    { d: path(BEZEL), raised: true },
  ],
  engraving: [
    { kind: 'path', d: path(SCREEN), pen: 'medium' },
  ],
  placements: [
    { component: 'hsi', at: pt(...C), hsi: {
      screen: path(SCREEN),
      card: { r: mm(180), major: mm(156), minor: mm(168), width: mm(4), labelR: mm(141.5), cap: mm(25.5), labelWidth: mm(30) },
      lubbers: { cardinal: [mm(181), mm(202)], diagonal: [mm(181), mm(202)], width: mm(4.5) },
      // Aircraft symbol (blob 258–292 x 254–287): fuselage, wings and tail.
      aircraft: `M0 ${mm(-15)}V${mm(18)}M${mm(-16.5)} ${mm(-5)}H${mm(16.5)}M${mm(-8.5)} ${mm(12)}H${mm(8.5)}`,
      // Heading marker (zoom at 105°): two solid squares between the 10° marks either side, r 171–183, gap 3.
      marker: { r: [mm(171), mm(183)], w: mm(24), gap: mm(3) },
      course: { head: [mm(83), mm(126)], tail: [mm(84), mm(127)], arrow: [mm(16), mm(20)], width: mm(5), cdi: mm(81), dot: mm(42.5), dotR: mm(6), toFrom: mm(60) },
      bearing: { head: [mm(162), mm(198)], tail: [mm(163), mm(189)], arrow: [mm(16), mm(20)], width: mm(5) },
      // Readouts (bright blobs): range 77–121 x 72–97 with its tenths box 125–144; course 428–472 x 72–96.
      range: { at: rel(99, 84.5), cap: mm(24.5), width: mm(44) },
      courseSet: { at: rel(450, 84), cap: mm(24), width: mm(44) },
      mode: { at: rel(359, 457.5), cap: mm(19) },
      // BRT notice above the aircraft symbol (blob 255–292 x 235–248).
      notice: { at: rel(273.5, 241.5), cap: mm(13), charWidth: mm(37 / 3) },
      // INU warning flag, guide p. 232 item 18 (same render as p. 230): red box 77–101 x 128–199, letters I 131–148, N 156–170, U 180–198.
      warning: { at: rel(89, 163.5), size: [mm(24), mm(71)], cap: mm(17), pitch: mm(24.5) },
      legends: [
        { text: 'NM', at: rel(88.5, 110.5), cap: mm(17), width: mm(23) },
        { text: 'CRS', at: rel(455.5, 110), cap: mm(18), width: mm(33) },
        // HDG and CRS step diagonally along the cut corners, beside their knobs.
        { text: 'H', at: rel(112, 411), cap: mm(17) }, { text: 'D', at: rel(123, 423), cap: mm(17) }, { text: 'G', at: rel(137, 435), cap: mm(17) },
        { text: 'C', at: rel(412, 435), cap: mm(17) }, { text: 'R', at: rel(426, 423), cap: mm(17) }, { text: 'S', at: rel(437, 411), cap: mm(17) },
      ],
    } },
    { component: 'knob-plain', control: 'hdg', at: pt(85, 484) },
    { component: 'knob-plain', control: 'crs', at: pt(464, 484) },
    { component: 'push-square', control: 'mode', at: pt(275, 513), size: [mm(46), mm(46)], legend: [{ text: 'M', cap: mm(22), y: 0 }] },
    // Hex socket head screws in the bezel's corner pockets; small Phillips screws beside them on the base plate.
    { component: 'screw-hex', at: pt(25, 25) }, { component: 'screw-hex', at: pt(525, 25) },
    { component: 'screw-hex', at: pt(25, 525) }, { component: 'screw-hex', at: pt(525, 525) },
    { component: 'screw-tiny', at: pt(9.5, 59) }, { component: 'screw-tiny', at: pt(540.5, 59) },
    { component: 'screw-tiny', at: pt(9.5, 491) }, { component: 'screw-tiny', at: pt(540.5, 491) },
  ],
  controls: [
    rotary('hdg', 'HDG (heading set) knob', 'Turns the heading marker round the compass card; with the autopilot ROLL switch at HDG SEL the jet turns to it. The guide also lists a push in ATT mode to adjust the compass heading (ADJ HDG).'),
    rotary('crs', 'CRS (course set / brightness) knob', 'Sets the desired course: the course arrow and the CRS readout. Pushed, it adjusts the display brightness (BRT).'),
    {
      id: 'mode', name: 'M (instrument mode) button', type: 'pushbutton', initial: 'out', source: src,
      description: 'Steps the instrument mode in the order NAV (steerpoint), NAV/PLS, TCN (TACAN station), TCN/PLS and back to NAV; the PLS modes add the ILS. The new mode shows in front of the aircraft symbol for a second.',
      positions: [{ id: 'out', label: 'OUT' }, { id: 'in', label: 'PRESSED', hold: 'momentary', spring: 'out' }],
    },
  ],
  indicators: [
    { id: 'screen', name: 'EHSI screen', type: 'display', restPage: 'off', pages: [{ id: 'off', label: 'Off (blank)' }, { id: 'on', label: 'On' }], restNote: 'blank', description: 'The whole picture. It is blank until the jet has power.', source: src },
    { id: 'heading', name: 'Compass card (heading)', type: 'display', unit: '°', rest: 0, range: [0, 359, 1], restNote: 'blank (screen off)', description: 'Magnetic heading compass: turns so the heading sits under the top lubber line. Numbers every 30°, long ticks every 10°, short ticks every 5°. The lubber lines mark 45° steps round the aircraft.', source: src },
    { id: 'heading-set', name: 'Heading marker', type: 'display', unit: '°', rest: 0, range: [0, 359, 1], restNote: 'blank (screen off)', description: 'The heading set with the HDG knob; the autopilot follows it in HDG SEL.', source: src },
    { id: 'course', name: 'Course arrow', type: 'display', unit: '°', rest: 0, range: [0, 359, 1], restNote: 'blank (screen off)', description: 'Desired course, set with the CRS knob. The deviation bar and dots turn with it.', source: src },
    { id: 'bearing', name: 'Bearing pointer', type: 'display', unit: '°', rest: 0, range: [0, 359, 1], restNote: 'blank (screen off)', description: 'Bearing to the steerpoint (NAV) or to the TACAN station (TCN), when the signal is valid.', source: src },
    { id: 'deviation', name: 'Course deviation bar', type: 'display', unit: 'dots', rest: 0, range: [-2.5, 2.5, 0.05], restNote: 'blank (screen off)', description: 'How far the jet is off the selected course. In NAV and TCN the inner dots are 5° and the outer dots 10°; with an ILS localizer (PLS modes) 1.25° and 2.5°. On the course arrow means on course. Positive values put the bar right of the course arrow: the course lies to the right, so the jet is left of it.', source: src },
    { id: 'range', name: 'Range readout', type: 'display', unit: 'NM', rest: 0, range: [0, 999.9, 0.1], restNote: 'blank (screen off)', description: 'Range in nautical miles to the steerpoint (NAV) or to the TACAN station with valid DME (TCN); the boxed fourth digit is tenths.', source: src },
    { id: 'course-set', name: 'Course readout', type: 'display', unit: '°', rest: 0, range: [0, 359, 1], restNote: 'blank (screen off)', description: 'The desired course set with the CRS knob, in degrees.', source: src },
    { id: 'mode', name: 'Mode legend', type: 'display', restPage: 'nav', restNote: 'blank (screen off)', pages: [{ id: 'nav', label: 'NAV' }, { id: 'nav-pls', label: 'NAV/PLS' }, { id: 'tcn', label: 'TCN' }, { id: 'tcn-pls', label: 'TCN/PLS' }], description: 'The instrument mode the M button selected: the navigation source the bearing pointer, range and deviation bar use.', source: src },
    { id: 'notice', name: 'Notice', type: 'display', restPage: 'none', restNote: 'blank', pages: [{ id: 'none', label: 'Not shown' }, { id: 'brt', label: 'BRT' }, { id: 'nav', label: 'NAV' }, { id: 'tcn', label: 'TCN' }, { id: 'nav-pls', label: 'NAV/PLS' }, { id: 'tcn-pls', label: 'TCN/PLS' }, { id: 'adj-hdg', label: 'ADJ HDG' }], description: 'A word shown in front of the aircraft symbol for about a second: the new mode after the M button, BRT while the brightness is being set, or ADJ HDG while the compass heading is being adjusted.', source: src },
    { id: 'warning', name: 'Warning flag', type: 'display', restPage: 'none', restNote: 'blank (screen off)', pages: [{ id: 'none', label: 'Not shown' }, { id: 'inu', label: 'INU' }, { id: 'att', label: 'ATT' }], description: 'Red flag left of the compass when the EHSI has no good INS data: INU while the INU is off, not aligned or failed; ATT when the INS knob is at ATT (attitude only).', source: 'DCS F-16C guide p. 232 (item 18)' },
    { id: 'to-from', name: 'To-from indicator', type: 'display', restPage: 'none', restNote: 'blank (screen off)', pages: [{ id: 'none', label: 'Not shown' }, { id: 'to', label: 'TO' }, { id: 'from', label: 'FROM' }], description: 'TACAN only: points the same way as the course arrow when flying the course takes you to the station, the other way when it takes you away from it.', source: src },
  ],
};
