import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C AIR COND control panel (right console), DCS.
 *
 * Reference: the guide's p. 76 cockpit image (440 x 176 JPEG, extracted with
 * `pdfimages -j -f 76 -l 76`, the smaller of the two), rectified on the four
 * DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p76.jpg> <out> 20,45.5 423,42 21,136 419.5,127
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 3.1;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 76';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

/** Arc about (cx, cy) in reference px, angles clockwise from 12 o'clock; returned in mm. */
const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)].map(v => mm(v)).join(' ');
  return `M${p(a0)}A${mm(r)} ${mm(r)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
};
/** Radial tick about (cx, cy) from r0 to r1 at angle a; returned in mm. */
const tick = (cx: number, cy: number, r0: number, r1: number, a: number) => {
  const p = (r: number) => [cx + r * Math.sin(a * Math.PI / 180), cy - r * Math.cos(a * Math.PI / 180)].map(v => mm(v)).join(' ');
  return `M${p(r0)}L${p(r1)}`;
};
const T: [number, number] = [148.5, 90]; // TEMP knob pivot
const TR = 52;                           // TEMP dial radius

export const airCond: PanelSpec = {
  id: 'air-cond',
  title: 'AIR COND control panel',
  canvas: [mm(440), mm(176)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 76,
    image: 'p. 76 "AIR COND Control Panel" cockpit image, 440 x 176 px',
    rectify: 'python3 -I scripts/panel-trace.py <p76.jpg> <out> 20,45.5 423,42 21,136 419.5,127',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads (about 26 px) match. The DZUS spacing then gives the standard 5.75 in console panel width.',
    shown: { temp: 'auto', 'air-source': 'norm' },
    unresolved: [
      'The TEMP knob turns continuously through its AUTO and MAN ranges; it is modelled with detents at the printed legends (TEMP OFF, the COOL, AUTO and WARM ends of each range, and MAN). The guide marks TEMP as not implemented.',
      'Whether TEMP can turn straight from MAN COOL back to TEMP OFF is not shown; the model stops at both ends.',
      'Both knobs stand proud of the panel, so their pivots come from the dial arcs and tick marks, not the knob outlines.',
      'The left and right plate edges are cropped in the reference.',
    ],
  },
  plate: [
    { d: path('M6 2H434Q438 2 438 6V170Q438 174 434 174H6Q2 174 2 170V6Q2 2 6 2Z') },
    // Raised face, notched round the four corner DZUS. Notch edges measured by
    // brightness gradient on the rectified reference (px): TL x 36.5, bottom 62.5;
    // TR x 403.5, bottom 61.5; BL x 35.5, top about 115; BR x 404.5, top 116.5.
    // Drawn mirrored: x 36 / 404, top notches to y 62, bottom notches from
    // y 116, inner corners rounded at 8 px.
    { d: path('M36 2H404V54Q404 62 412 62H438V116H412Q404 116 404 124V174H36V124Q36 116 28 116H2V62H28Q36 62 36 54Z'), raised: true },
  ],
  engraving: [
    // Vertical "AIR COND" in two columns.
    ...([['A', 76], ['I', 92], ['R', 108]] as const).map(([t, y]) => L([33, y], t, 12, 8)),
    ...([['C', 64], ['O', 80], ['N', 97], ['D', 114]] as const).map(([t, y]) => L([47, y], t, 12, 8)),
    // TEMP dial: AUTO and MAN arcs, with the end ticks and the TEMP OFF ticks.
    L([148, 16], 'TEMP', 8.5, 27),
    L([148, 35], 'AUTO', 8.5, 28),
    L([93, 58], 'COOL', 8.5, 27),
    L([205, 56], 'WARM', 8.5, 31),
    L([82, 83], 'TEMP', 8.5, 25),
    L([82, 97], 'OFF', 8.5, 19),
    L([92, 123], 'COOL', 8.5, 27),
    L([205, 122], 'WARM', 8.5, 31),
    L([147, 144], 'MAN', 8.5, 24),
    { kind: 'path', d: [
      arc(...T, TR, -63, -17), arc(...T, TR, 17, 63), arc(...T, TR, 117, 165), arc(...T, TR, 195, 243),
      ...[-63, 63, 117, 243].map(a => tick(...T, TR - 6, TR, a)),
      ...[-78, -90, -102].map(a => tick(...T, TR - 12, TR - 2, a)),
    ].join('') },
    // AIR SOURCE dial.
    L([330, 17], 'AIR SOURCE', 8.5, 63),
    L([282, 37], 'DUMP', 8.5, 28),
    L([375, 37], 'RAM', 8.5, 23),
    L([255, 70], 'NORM', 8.5, 30),
    L([259, 113], 'OFF', 8.5, 19),
    { kind: 'path', d: path('M299 39H306L311 47M362 39H355L350 47M272 69H281L288 72M272 110H281L288 107') },
    L([247, 143], '+', 7),
  ],
  placements: [
    { component: 'dzus', at: pt(20, 43.75) },
    { component: 'dzus', at: pt(420, 43.75) },
    { component: 'dzus', at: pt(20, 131.5) },
    { component: 'dzus', at: pt(420, 131.5) },
    { component: 'screw-medium', at: pt(62, 143) },
    { component: 'screw-medium', at: pt(247, 32) },
    { component: 'rotary-pointer-large', control: 'temp', at: pt(...T) },
    { component: 'rotary-pointer-large', control: 'air-source', at: pt(330.5, 89.5) },
  ],
  controls: [
    {
      id: 'temp', name: 'TEMP knob', type: 'rotary',
      positions: [
        { id: 'off', label: 'TEMP OFF', angle: -90, hold: 'stable' },
        { id: 'auto-cool', label: 'AUTO (COOL)', angle: -63, hold: 'stable' },
        { id: 'auto', label: 'AUTO', angle: 0, hold: 'stable' },
        { id: 'auto-warm', label: 'AUTO (WARM)', angle: 63, hold: 'stable' },
        { id: 'man-warm', label: 'MAN (WARM)', angle: 117, hold: 'stable' },
        { id: 'man', label: 'MAN', angle: 180, hold: 'stable' },
        { id: 'man-cool', label: 'MAN (COOL)', angle: 243, hold: 'stable' },
      ],
      initial: 'auto',
      description: 'Sets cockpit temperature, automatically in the AUTO range or manually in the MAN range, each from COOL to WARM. Not implemented in DCS.',
      source: src,
    },
    {
      id: 'air-source', name: 'AIR SOURCE knob', type: 'rotary',
      positions: [
        { id: 'off', label: 'OFF', angle: -113, hold: 'stable' },
        { id: 'norm', label: 'NORM', angle: -67, hold: 'stable' },
        { id: 'dump', label: 'DUMP', angle: -25, hold: 'stable' },
        { id: 'ram', label: 'RAM', angle: 25, hold: 'stable' },
      ],
      initial: 'norm',
      description: 'Selects the air source for cockpit and avionics ventilation. OFF closes all engine bleed air valves: air conditioning, cooling and pressurization stop (including G-suit, pressure breathing, OBOGS, canopy seal and fuel tank pressurization). NORM runs the environmental control and pressurization systems automatically. DUMP dumps cockpit pressure and ventilates with conditioned bleed air. RAM dumps cockpit pressure, closes the bleed air valves and ventilates with outside ram air, with the same losses as OFF. In OFF or RAM, fuel cannot transfer from external tanks.',
      source: src,
    },
  ],
  indicators: [],
};
