import type { Dial, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C engine instruments (instrument panel, right of the standby ADI), DCS:
 * engine OIL pressure, NOZ POS, RPM and FTIT, top to bottom.
 *
 * Reference: the guide's p. 50 image (220 x 588 JPEG, extracted with
 * `pdfimages -j -f 50 -l 50`). The four dials are circles seen through one
 * camera, so the image was rectified with one affine fitted to all four
 * (`scripts/gauge-dial.py`, blob map in docs/cockpit/): every printed tick was found, each dial's centre
 * fitted to the inner ends of its ticks (the outer ends hide under the bezel
 * lip), and the stretch chosen that makes all four sets of ticks fall on
 * smooth scales. Each dial was then unwrapped about its centre and every tick
 * angle, tick radius, numeral box and needle width read off the unwrapped
 * strip. Values below are rectified reference pixels relative to each dial's
 * centre, converted to mm by `tracer`.
 *
 * Scales: OIL and NOZ POS are linear (ticks within 1.3° and 0.6° rms of a
 * straight fit). RPM is linear to 60 % and then spreads out (1 % ticks grow
 * from 3.9° to 4.9° apart between 65 and 110 %), and FTIT's 700–1000 °C band
 * narrows slightly toward 1000; those scales are tables of knots taken from
 * local or quadratic fits to the measured ticks (RPM within 0.5°, FTIT 1.1° rms).
 */
const PX = 2.0;
const { pt, mm } = tracer(PX);
const src = 'DCS F-16C guide p. 50';

/** Tick radii and widths in reference px. */
const run = (from: number, to: number, step: number, inner: number, outer: number, width: number, skip?: number): Dial['ticks'][number] =>
  ({ from, to, step, ...(skip ? { skip } : {}), r: [mm(inner), mm(outer)], width: mm(width) });
/** Numeral or legend centred at (x, y) px from the dial centre, `cap` and `w` px. */
const lg = (text: string, x: number, y: number, cap: number, w: number) => ({ text, at: pt(x, y) as Pt, cap: mm(cap), width: mm(w) });
const MAJOR = 2.0, MINOR = 1.5;

const oil: Dial = {
  bezel: mm(41.5), face: mm(38.3), hub: mm(9),
  scale: [[0, 109.72], [100, 431.25]],
  ticks: [run(0, 100, 10, 28.8, 35.3, MAJOR), run(5, 95, 10, 31.7, 35.3, MINOR)],
  legends: [
    lg('0', 23.76, 8.71, 6.9, 4.75), lg('20', 2.13, 23.46, 7.1, 10.25), lg('40', -19.8, 11.15, 7.1, 10.4),
    lg('60', -19.18, -12.16, 7.1, 10.1), lg('80', 3.7, -23.23, 7.0, 10.1), lg('100', 20.07, -8.1, 7.0, 12.1),
    lg('OIL', 0.2, 12.77, 5.5, 10.6),
  ],
  needle: mm(27.5),
};

const noz: Dial = {
  bezel: mm(59), face: mm(56.3), hub: mm(12),
  // The last knot carries the scale to the short extra tick 6.5° past 100.
  scale: [[0, 66.61], [100, 291.51], [102.9, 298.0]],
  ticks: [run(0, 100, 20, 41.0, 52.0, MAJOR), run(10, 90, 20, 45.9, 52.0, MINOR), run(102.9, 102.9, 1, 45.9, 52.0, MINOR)],
  legends: [
    lg('0', 32.97, -14.52, 9.6, 6.2), lg('20', 30.01, 11.48, 9.6, 13.4), lg('40', 15.57, 31.11, 9.6, 13.75),
    lg('60', -14.05, 32.17, 9.6, 13.75), lg('80', -28.55, 12.73, 9.6, 13.5), lg('100', -27.3, -13.14, 9.5, 17.25),
    lg('NOZ POS', 0.22, -35.5, 9.4, 51.1), lg('% OPEN', 0.2, -24.0, 8.0, 35.75),
  ],
  needle: mm(33.5),
};

const rpm: Dial = {
  bezel: mm(74.6), face: mm(71.5), hub: mm(11.5),
  scale: [
    // 0–60 %: one straight fit; 60 and 65 are the centres of the two long ticks either side of the solid band,
    // measured directly; above 65 % each knot is a local straight fit through the 1 % ticks within ±3 %.
    [0, 353.41], [55, 456.36], [60, 464.7],
    [65, 475.5], [66, 478.92], [70, 495.28], [75, 516.47], [80, 539.16], [85, 561.72], [90, 584.48], [95, 608.36], [100, 632.64], [105, 656.95], [110, 680.75],
  ],
  ticks: [
    run(0, 50, 10, 52.5, 68.2, MAJOR), run(5, 55, 10, 57.7, 68.2, MINOR),
    run(60, 65, 5, 54.2, 68.2, MAJOR),
    run(70, 110, 5, 51.3, 68.2, MAJOR), run(66, 109, 1, 56.4, 68.2, MINOR, 5),
  ],
  // 60–65 % is a solid band between the two long ticks.
  fills: [{ from: 60, to: 65, r: [mm(58.5), mm(68.2)] }],
  legends: [
    lg('0', -5.27, -43.74, 11.3, 7.6), lg('20', 20.67, -37.8, 11.4, 15.25), lg('40', 39.48, -16.67, 11.4, 16.4),
    lg('60', 42.42, 13.89, 11.5, 16.0), lg('70', 27.54, 37.58, 11.6, 14.25), lg('80', 0.67, 43.7, 11.6, 15.5),
    lg('90', -27.2, 28.9, 11.0, 16.2), lg('100', -39.46, -3.11, 11.75, 18.75), lg('110', -29.58, -31.86, 11.5, 14.25),
    lg('RPM', 0.29, -29.11, 9.0, 20.75), lg('PERCENT', 0.54, -17.99, 7.75, 35.75),
  ],
  needle: mm(50.5),
};

const ftit: Dial = {
  bezel: mm(76.8), face: mm(72.5), hub: mm(12),
  scale: [
    [200, 104.25], [300, 124.89], [400, 145.85], [500, 167.13], [600, 188.73], [700, 210.7],
    [750, 241.07], [800, 271.08], [850, 300.83], [900, 330.3], [950, 359.51], [1000, 388.6], [1200, 425.5],
  ],
  ticks: [
    run(200, 700, 100, 56.3, 69.3, MAJOR), run(250, 650, 100, 60.1, 69.3, MINOR),
    run(750, 950, 50, 56.5, 69.3, MAJOR), run(710, 990, 10, 61.2, 69.3, MINOR, 50),
    run(1000, 1200, 100, 56.3, 69.3, MAJOR), run(1050, 1150, 100, 61.0, 69.3, MINOR),
  ],
  legends: [
    lg('2', 48.36, 12.24, 11.6, 7.6), lg('3', 40.23, 26.99, 11.6, 7.4), lg('4', 27.17, 38.74, 11.6, 8.0),
    lg('5', 12.11, 46.3, 11.6, 7.6), lg('6', -7.02, 47.55, 11.5, 7.4), lg('7', -24.27, 41.24, 11.6, 6.9),
    lg('8', -50.27, -2.26, 11.6, 7.6), lg('9', -23.96, -41.32, 11.5, 7.25), lg('10', 21.61, -44.51, 11.6, 10.9),
    lg('11', 36.0, -35.7, 11.0, 6.9), lg('12', 44.61, -21.38, 11.6, 10.4),
    lg('FTIT', 0.17, -33.38, 11.1, 28.5), lg('°C×100', -1.39, -22.5, 7.1, 29.9),
  ],
  needle: mm(48.5),
};

export const engineInstruments: PanelSpec = {
  id: 'engine-instruments',
  title: 'Engine instruments',
  canvas: [mm(249), mm(597)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide (EN, 16 August 2026)',
    page: 50,
    image: 'p. 50 engine instruments image (220 x 588 JPEG)',
    rectify: 'python3 -I scripts/gauge-dial.py fit <image.png> <scratch> docs/cockpit/f16c-engine-instruments-dial-map.json (one affine for all four dials: x\' = 0.98618x − 0.01902y + 21.18, y\' = −0.01902x + 0.97382y + 14.18; output 249 x 597)',
    pxPerMm: PX,
    scale: 'No shared component on this image. RPM and FTIT are taken as 3-inch class instruments: the RPM bezel (149 px across) is drawn about 75 mm, giving 2.0 px/mm; OIL and NOZ POS keep their size relative to it.',
    shown: { oil: '51', 'noz-pos': '0', rpm: '93.9', ftit: '776' },
    unresolved: [
      'Physical size: the guide gives no dimension; the scale assumes a 3-inch class RPM indicator.',
      'NOZ POS has a short tick about 6.5° past 100 % that the guide does not describe; drawn as printed.',
      'RPM 60–65 % is a solid band with a long tick at each end; the guide only says minor ticks are every 1 % above 65 %.',
      'Tick widths are read from a blurred image (full width at half brightness, less about 20 %).',
      'Cold-and-dark needle positions (OIL 0, NOZ POS 0, RPM 0, FTIT at its 200 °C stop) are not stated in the guide.',
      'The instrument panel around the dials is outside the guide image, so no plate is drawn.',
    ],
  },
  plate: [],
  engraving: [],
  placements: [
    { component: 'gauge', indicator: 'oil', at: pt(72.24, 69.6), dial: oil },
    { component: 'gauge', indicator: 'noz-pos', at: pt(90.93, 179.02), dial: noz },
    { component: 'gauge', indicator: 'rpm', at: pt(100.58, 330.11), dial: rpm },
    { component: 'gauge', indicator: 'ftit', at: pt(131.21, 492.82), dial: ftit },
  ],
  controls: [],
  indicators: [
    {
      id: 'oil', name: 'Engine OIL pressure indicator', type: 'gauge', unit: 'psi', rest: 0,
      description: 'Oil pressure in the engine\'s self-contained lubrication system, 0 to 100 psi: long ticks every 10 psi, short ticks at the 5s. Normal is 15 psi on the ground at idle and 60 psi in the air at military power and above.',
      source: src,
    },
    {
      id: 'noz-pos', name: 'Engine NOZ POS indicator', type: 'gauge', unit: '% open', rest: 0,
      description: 'Exhaust nozzle position as a percentage open: long ticks every 20 %, short ticks at the 10s.',
      source: src,
    },
    {
      id: 'rpm', name: 'Engine RPM indicator', type: 'gauge', unit: '%', rest: 0,
      description: 'Engine RPM in percent, from the engine alternator, 0 to 110 %: ticks every 5 % up to 60 %, then every 1 % above 65 % on a spread-out scale, with long ticks every 5 %.',
      source: src,
    },
    {
      id: 'ftit', name: 'Engine FTIT indicator', type: 'gauge', unit: '°C', rest: 200,
      description: 'Fan turbine inlet temperature (FTIT), an average in °C ×100, from 200 to 1,200 °C. The 700–1,000 °C working band is spread out with ticks every 10 °C and long ticks every 50 °C; below 700 and above 1,000 °C the ticks are every 50 °C, long every 100 °C.',
      source: src,
    },
  ],
};
