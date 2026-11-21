import type { Dial, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C altimeter (instrument panel), DCS: one needle that goes round once
 * every 1,000 ft, a ten-thousands / thousands / hundreds counter, the
 * barometric setting ("Kollsman") window, the PNEU flag, the barometric
 * setting knob and the ELEC/PNEU mode lever.
 *
 * Reference: the guide's p. 51 image (286 x 283 JPEG, extracted with
 * `pdfimages -j -f 51 -l 51`, image 017), rectified with one affine
 * (`scripts/gauge-dial.py`, blob map in docs/cockpit/): 49 of the 50 ticks
 * found (100 ft is under the needle), the centre fitted to the inner tick
 * ends, tick angle rms 0.47°. The image is almost square-on (stretch 0.996).
 * The scale is linear: 360° per 1,000 ft, a major tick every 100 ft and a
 * minor tick every 20 ft (four between majors; the guide's text says 10-foot
 * minor ticks, the image shows 20-foot spacing). Values below are rectified
 * reference pixels (relative to the dial centre inside the dial), converted
 * to mm by `tracer`.
 */
const PX = 3.23;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 51';

/** Dial centre on the rectified image. */
const C: Pt = [150.70, 148.61];
/** Numeral or legend centred at (x, y) px from the dial centre, `cap` and `w` px. */
const lg = (text: string, x: number, y: number, cap: number, w?: number) => ({ text, at: pt(x, y), cap: mm(cap), ...(w ? { width: mm(w) } : {}) });
/** Rectangle outline in px, as an absolute path. */
const box = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
/** Circle outline in mm (written in mm, since `path` would scale the arc flags). */
const ring = (x: number, y: number, r: number) => {
  const [cx, cy] = pt(x, y), rr = mm(r);
  return `M${+(cx - rr).toFixed(3)} ${cy}a${rr} ${rr} 0 1 0 ${+(2 * rr).toFixed(3)} 0a${rr} ${rr} 0 1 0 ${-(2 * rr).toFixed(3)} 0`;
};
/** Plate centre and the half spacing of the corner screws and the round marks, px (mirrored about the dial centre). */
const SCREW = 128.6, MARK = 55;

/**
 * ELEC/PNEU mode lever, measured on the guide image zoomed 10x: a flat lever
 * with a round head (radius 9.5 px) about its pivot and a stem 9.5 px wide
 * hanging 39.5 px below the pivot to a square end. It hangs straight down at
 * rest and is swung `swing` degrees, tip left toward ELEC, and only `pneu` degrees
 * right toward PNEU, so it clears the plate edge and corner screw (Nathan, 2026-11-20).
 */
const LEVER = { pivot: [262, 238.8] as [number, number], head: 9.5, half: 4.75, reach: 39.5, swing: 30, pneu: 6, pin: 2.6 };
function modeLever(deg: number) {
  const [px, py] = LEVER.pivot, a = (deg * Math.PI) / 180, { head, half, reach } = LEVER;
  // Turn (clockwise on screen) about the pivot; outline points relative to the pivot, stem pointing down.
  const P = (u: number, v: number) => `${(px + u * Math.cos(a) - v * Math.sin(a)).toFixed(2)} ${(py + u * Math.sin(a) + v * Math.cos(a)).toFixed(2)}`;
  const join = Math.sqrt(head * head - half * half), arc: string[] = [];
  // Head: from the right side of the stem round over the top to the left side (32 steps).
  // Screen angles: the right join is at t0 below the horizontal, the left join at π − t0; sweep up over the top.
  const t0 = Math.atan2(join, half), t1 = Math.PI - t0 - Math.PI * 2;
  for (let i = 0; i <= 32; i++) {
    const t = t0 + ((t1 - t0) * i) / 32;
    arc.push(P(head * Math.cos(t), head * Math.sin(t)));
  }
  const outline = `M${P(half, reach)}L${arc.join('L')}L${P(-half, reach)}Z`;
  // Pivot pin.
  const pin = Array.from({ length: 16 }, (_, i) => P(LEVER.pin * Math.cos((i * Math.PI) / 8), LEVER.pin * Math.sin((i * Math.PI) / 8)));
  return { d: path(outline), parts: [path(`M${pin.join('L')}Z`)] };
}

const dial: Dial = {
  bezel: mm(120), face: mm(116.5), hub: mm(2.5),
  // One turn is 1,000 ft: 0 at 12 o'clock (residuals under 1.3°, no trend).
  scale: [[0, 0], [1000, 360]],
  turn: 1000,
  ticks: [
    { from: 0, to: 900, step: 100, r: [mm(96.2), mm(112.1)], width: mm(3.3) },
    { from: 20, to: 980, step: 20, skip: 100, r: [mm(102.1), mm(112.0)], width: mm(2.25) },
  ],
  legends: [
    lg('0', -0.5, -81.2, 24, 15.4), lg('1', 52.0, -62.7, 24, 7), lg('2', 81.4, -25.4, 24, 15.6), lg('3', 82.1, 36.4, 24, 15.75),
    lg('4', 43.7, 67.7, 24, 17.75), lg('5', 1.6, 82.1, 24, 15.4), lg('6', -49.7, 65.6, 24, 15.25), lg('7', -81.3, 30.8, 24, 11.1),
    lg('8', -82.6, -30.7, 24, 11.5), lg('9', -52.0, -62.7, 24, 14.6),
    lg('ALT', 24.8, -40.6, 17, 42),
    lg('1000 FT', -59.9, 23.1, 3.5, 18), lg('100 FT', -24.9, 32.2, 3.5, 15), lg('IN.HG', 47.3, 24.4, 4, 18.75),
  ],
  // Counter frames (line centres): ten-thousands and thousands box x 69–115, hundreds slot 115.5–136.5 (y 120–178),
  // fixed-zeros box 137.5–186, boxes y 131–165; barometric window 171–220 x 176–196 with an index under it at x 197.5.
  marks: path(
    box(-81.7, -17.61, -35.7, 16.39) + box(-35.2, -28.61, -14.2, 29.39) + box(-13.2, -17.61, 35.3, 16.39) +
    box(20.3, 27.39, 69.3, 47.39) + 'M44.8 52.4L46.8 48.9L48.8 52.4Z',
  ),
  needle: mm(103.5),
  needleArt: 'blade',
  // Hatched ten-thousands drum, thousands drum, hundreds drum (rolling, in its own slot) and two fixed zeros.
  // Drum centres x 82, 104.5, 126, 146, 170.5 and digit centres y 147 on the rectified image.
  counter: {
    indicator: 'altitude', at: pt(-23.2, -1.6), drums: 5, fixed: 2, still: true, unit: 100, hatch: 1, stroked: true,
    places: [-45.5, -23, -1.5, 18.5, 43].map(mm), pitch: mm(21), roll: mm(27), window: [mm(115), mm(29)], cap: mm(25), width: mm(12.5),
    slots: [{ drum: 2, h: mm(58) }],
  },
  // Yellow PNEU flag, x 85.5–121.5, y 104.5–119.5.
  flags: [{ indicator: 'pneu', at: pt(-47.2, -36.6), size: [mm(36), mm(15)], legend: 'PNEU', cap: mm(8), width: mm(25), paint: 'yellow' }],
};

export const altimeter: PanelSpec = {
  id: 'altimeter',
  title: 'Altimeter',
  canvas: [mm(307), mm(303)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics — DCS F-16C Viper Early Access Guide (EN, 16 August 2026)',
    page: 51,
    image: 'p. 51 altimeter image (286 x 283 JPEG, image 017)',
    rectify: 'python3 -I scripts/gauge-dial.py fit <image.png> <scratch> docs/cockpit/f16c-altimeter-dial-map.json (x\' = 0.99983x + 0.00081y + 10.00, y\' = 0.00081x + 0.99617y + 10.00; output 307 x 303)',
    pxPerMm: PX,
    scale: 'The corner screw heads (about 13.4 px across) are the shared `screw-small` (4.2 mm), giving 3.23 px/mm; the dial face is then 72 mm across, the same as the 3-inch RPM indicator\'s, and the corner screws 79.6 mm apart.',
    shown: { altitude: '8092', baro: '29.92', pneu: 'shown', mode: 'centre', 'baro-set': '0' },
    unresolved: [
      'Physical size rests on the corner screws: the guide gives no dimension.',
      'The guide\'s text says the minor ticks are 10 ft; the image has four minor ticks between the 100-ft majors, so they are drawn every 20 ft.',
      'The 1 is under the needle blade; it is placed opposite the 9 and its width is a guess.',
      'No hub shows at the dial centre (the needle\'s thin shaft crosses the counter); a small pivot is drawn.',
      'The needle blade is drawn symmetric; in the image its right edge bulges slightly.',
      'The two zeros after the hundreds drum are drawn as fixed drums; whether they are printed on the face cannot be seen.',
      'The hundreds drum rolls with the needle, as the image shows (1 a little below centre at 8,092 ft); the thousands and ten-thousands drums turn only as the hundreds drum rolls from 9 to 0. Below 10,000 ft the ten-thousands drum shows hatching. Readings below 0 ft (the guide gives −1,000 ft) are not drawn.',
      'The barometric window drums are drawn flat and evenly spaced (the image spacing varies from 10.6 to 12.4 px). Its range (28.10–31.00 in Hg) is not stated in the guide.',
      'The mode lever is traced as a flat lever (Nathan: a lever, not a toggle). It springs back to hanging straight down, as the image shows it, beside the PNEU legend. The guide (p. 51) says the switch is held momentarily to ELEC or PNEU. It swings 30° left toward ELEC but only 6° right toward PNEU, which keeps its square end about 1.8 px clear of the corner screw (Nathan, 2026-11-20). Neither swing is stated. No other guide image or photo was found to confirm it.',
      'The barometric setting knob shows only as a faint round outline (about 6.8 mm radius); it is drawn as a plain domed knob with no index.',
      'Eight faint round marks sit on the case on the screw lines (about 55 px either side of the centre lines); they are drawn as fine circles. The top left corner is hidden by another part in the image; its screw and marks are drawn by symmetry.',
      'Cold-and-dark readings are not stated in the guide; the needle, counters and PNEU flag are drawn as the image shows them.',
    ],
  },
  plate: [
    // Instrument case front, square on the dial centre: right edge 295.8 and bottom edge 291.7 measured
    // (panel-zoom), the left and top edges are outside the image crop; drawn ±144 px about the centre.
    { d: path(`M${C[0] - 136} ${C[1] - 144}H${C[0] + 136}Q${C[0] + 144} ${C[1] - 144} ${C[0] + 144} ${C[1] - 136}V${C[1] + 136}Q${C[0] + 144} ${C[1] + 144} ${C[0] + 136} ${C[1] + 144}H${C[0] - 136}Q${C[0] - 144} ${C[1] + 144} ${C[0] - 144} ${C[1] + 136}V${C[1] - 136}Q${C[0] - 144} ${C[1] - 144} ${C[0] - 136} ${C[1] - 144}Z`) },
  ],
  engraving: [
    { kind: 'path', pen: 'fine', d: [[-1, -1], [1, -1], [-1, 1], [1, 1]].flatMap(([sx, sy]) => [ring(C[0] + sx * SCREW, C[1] + sy * MARK, 6), ring(C[0] + sx * MARK, C[1] + sy * SCREW, 6)]).join('') },
    { kind: 'text', at: pt(240.5, 276.3), text: 'ELEC', cap: mm(11.5), width: mm(34) },
    ...([['P', 221], ['N', 232.7], ['E', 245.2], ['U', 257.5]] as const).map(([t, y]) => ({ kind: 'text' as const, at: pt(281.5, y), text: t, cap: mm(10.5), width: mm(8) })),
  ],
  placements: [
    { component: 'gauge', indicator: 'altitude', at: pt(...C), dial },
    { component: 'counter', at: pt(196.4, 187.5), counter: {
      indicator: 'baro', at: [0, 0], drums: 4, fixed: 0, unit: 0.01, stroked: true,
      pitch: mm(11.43), roll: mm(17.5), window: [mm(49), mm(20)], cap: mm(15), width: mm(7),
    } },
    { component: 'knob-plain-small', control: 'baro-set', at: pt(50, 256.7) },
    ...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => ({ component: 'screw-small' as const, at: pt(C[0] + sx * SCREW, C[1] + sy * SCREW) })),
    // Mode lever, drawn last so it swings over the corner screw: traced one-off (flat keyhole lever: round head about the pivot, flat stem to a square end).
    { component: 'traced', control: 'mode', at: pt(...LEVER.pivot), shapes: { elec: modeLever(LEVER.swing), centre: modeLever(0), pneu: modeLever(-LEVER.pneu) }, hit: [mm(LEVER.pivot[0] - 22), mm(LEVER.pivot[1] - 12), mm(44), mm(54)] },
  ],
  controls: [
    {
      id: 'baro-set', name: 'Barometric setting knob', type: 'rotary', cyclic: true, initial: '0', source: src,
      description: 'Sets the altimeter setting shown in the barometric ("Kollsman") window, in inches of mercury. Set the local QNH so the altimeter reads altitude above mean sea level; on the ground it should then read the field elevation.',
      positions: Array.from({ length: 12 }, (_, i) => ({ id: String(i), label: `step ${i}`, angle: i * 30 })),
    },
    {
      id: 'mode', name: 'Altimeter mode lever (ELEC / PNEU)', type: 'toggle', travel: 'horizontal', initial: 'centre', source: src,
      description: 'Held momentarily left to ELEC (primary: the altimeter is driven by the central air data computer, CADC) or right to PNEU (secondary: driven by static pressure from the pitot-static system). The altimeter drops back to PNEU by itself if the CADC or its electric servo fails; the PNEU flag shows whenever it is in PNEU.',
      positions: [
        { id: 'elec', label: 'ELEC', hold: 'momentary', spring: 'centre' },
        { id: 'centre', label: 'Rest' },
        { id: 'pneu', label: 'PNEU', hold: 'momentary', spring: 'centre' },
      ],
    },
  ],
  indicators: [
    {
      id: 'altitude', name: 'Altitude (needle and counter)', type: 'gauge', unit: 'ft', rest: 8092, range: [0, 80000, 10],
      restNote: 'as pictured, about 8,100 ft',
      description: 'Barometric altitude. The needle goes round once every 1,000 ft on the outer scale (numbers are hundreds of feet, ticks every 20 ft); the counter shows ten-thousands, thousands and hundreds of feet, with hatching on the ten-thousands drum below 10,000 ft. Its range is −1,000 to 80,000 ft.',
      source: src,
    },
    {
      id: 'baro', name: 'Barometric ("Kollsman") window', type: 'counter', unit: 'in Hg', rest: 29.92, range: [28.1, 31, 0.01],
      restNote: 'as pictured, 29.92 in Hg',
      description: 'The altimeter setting in inches of mercury, set with the barometric setting knob. The F-16 uses QNH, so with the local setting the altimeter reads altitude above mean sea level.',
      source: src,
    },
    {
      id: 'pneu', name: 'PNEU flag', type: 'display', restPage: 'shown', pages: [{ id: 'shown', label: 'Shown' }, { id: 'hidden', label: 'Hidden' }],
      restNote: 'shown',
      description: 'Shows when the altimeter is working in PNEU (pneumatic) mode, from static pressure alone, instead of ELEC from the central air data computer. It reverts to PNEU by itself if the CADC or the altimeter\'s electric servo fails.',
      source: src,
    },
  ],
};
