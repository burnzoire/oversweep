import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C AVIONICS POWER panel (right console), DCS.
 *
 * Reference: the guide's p. 78 "AVIONICS POWER Control Panel" cockpit image
 * (440 x 288 JPEG, extracted with `pdfimages -j -f 78 -l 78`, image 011),
 * rectified on the four DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p78-011.jpg> <out> 20,38 423,42.5 16.5,247.5 422.5,251
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 3.1;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 78–79';
const L = (at: [number, number], text: string, cap: number, width?: number, rotate?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}), ...(rotate ? { rotate } : {}) });
/** Radial tick about c from r0 to r1 at angle a (clockwise from 12 o'clock), in reference px. */
const tick = (c: [number, number], a: number, r0: number, r1: number) => {
  const s = Math.sin(a * Math.PI / 180), k = -Math.cos(a * Math.PI / 180);
  return `M${(c[0] + r0 * s).toFixed(1)} ${(c[1] + r0 * k).toFixed(1)}L${(c[0] + r1 * s).toFixed(1)} ${(c[1] + r1 * k).toFixed(1)}`;
};
/** Point at radius r and angle a (clockwise from 12 o'clock) about c, in reference px. */
const polar = (c: [number, number], r: number, a: number): [number, number] =>
  [+(c[0] + r * Math.sin(a * Math.PI / 180)).toFixed(1), +(c[1] - r * Math.cos(a * Math.PI / 180)).toFixed(1)];
/** Clockwise arc about c from angle a0 to a1 (reference px in), returned in mm; path() would scale the arc flags. */
const arcMm = (c: [number, number], r: number, a0: number, a1: number) => {
  const [x0, y0] = polar(c, r, a0), [x1, y1] = polar(c, r, a1);
  return `M${mm(x0)} ${mm(y0)}A${mm(r)} ${mm(r)} 0 0 1 ${mm(x1)} ${mm(y1)}`;
};
/** Switch pivots: x on the OFF legends' measured centres, y on the bushing row. */
const SW: Record<string, [number, number]> = {
  mmc: [67, 70], 'st-sta': [140.5, 70], mfd: [218, 70], ufc: [295, 70], map: [368, 70],
  gps: [192.5, 160], dl: [268, 160],
};
/**
 * Dial centres from a circle fitted through the printed tick marks (INS
 * 112.3, 220.8; MIDS 348.7, 218.9), squared onto one row.
 */
const INS: [number, number] = [112, 220], MIDS: [number, number] = [349, 220];
/** INS detents: measured tick angles (the spacing varies on the plate). */
const INS_POS = [
  { id: 'off', label: 'OFF', angle: -130 },
  { id: 'stor-hdg', label: 'ALIGN STOR HDG', angle: -72 },
  { id: 'norm', label: 'ALIGN NORM', angle: -27 },
  { id: 'nav', label: 'NAV', angle: 19 },
  { id: 'cal', label: 'CAL', angle: 52 },
  { id: 'in-flt-align', label: 'IN FLT ALIGN', angle: 114 },
  { id: 'att', label: 'ATT', angle: 149 },
] as const;
/** MIDS LVT detents: ticks measured at -46°, 3° and 49°; drawn evenly at 45° steps. */
const MIDS_POS = [
  { id: 'zero', label: 'ZERO', angle: -45 },
  { id: 'off', label: 'OFF', angle: 0 },
  { id: 'on', label: 'ON', angle: 45 },
] as const;
const onOff = [{ id: 'on', label: 'On', hold: 'stable' as const }, { id: 'off', label: 'OFF', hold: 'stable' as const }];
const latch = [{ kind: 'latch' as const, verified: false, note: 'The guide image shows a lever-lock slot in the bushing, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }];
const sw = (id: string, name: string, description: string) =>
  ({ id, name, type: 'toggle' as const, travel: 'vertical' as const, positions: onOff, initial: 'off', latched: true, protections: latch, description, source: src });

export const avionicsPower: PanelSpec = {
  id: 'avionics-power',
  title: 'AVIONICS POWER panel',
  canvas: [mm(440), mm(288)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 78,
    image: 'p. 78 "AVIONICS POWER Control Panel" cockpit image, 440 x 288 px',
    rectify: 'python3 -I scripts/panel-trace.py <p78-011.jpg> <out> 20,38 423,42.5 16.5,247.5 422.5,251',
    pxPerMm: PX,
    scale: 'Same scale as the other right-console panel images (3.1 px/mm); the DZUS heads (about 26 px across) match the shared 8.5 mm head.',
    shown: { mmc: 'on', 'st-sta': 'on', mfd: 'on', ufc: 'on', map: 'off', gps: 'on', dl: 'on', ins: 'nav', mids: 'on' },
    unresolved: [
      'The switch titles sit up and to the left of their switches in the reference (by about 6 mm) and are traced where they are printed; the MMC and ST STA titles are partly hidden by the lever caps, so their widths are estimated.',
      'The bushings show the lever-lock slot on every switch, so all seven are drawn as lever-locks: flat-topped caps, except MFD\'s rounded cap. Their levers are drawn square-on.',
      'The INS knob detents are at the measured tick angles, which are unevenly spaced on the plate. The MIDS LVT ticks measure within 3° of 45° steps and are drawn evenly.',
      'Whether MIDS LVT ZERO needs a pull to select is not shown; it moves with a plain click.',
      'Both knobs stand proud of the panel, so their centres come from the printed ticks, not the knob outlines.',
    ],
  },
  plate: [
    { d: path('M6 2H434Q438 2 438 6V282Q438 286 434 286H6Q2 286 2 282V6Q2 2 6 2Z') },
    // Raised face, notched round the four corner DZUS. Notch edges measured by
    // brightness gradient on the rectified reference (px): TL x 34.5, bottom about
    // 57; TR x 403.5, bottom about 56; BL x 33.5, top 232.5; BR x 403.5, top about
    // 233. Drawn mirrored about x 220 at the mean width (33 px): x 35 / 405, top
    // notches to y 57, bottom notches from y 232, inner corners rounded at 12 px.
    { d: path('M35 2H405V45Q405 57 417 57H438V232H417Q405 232 405 244V286H35V244Q35 232 23 232H2V57H23Q35 57 35 45Z'), raised: true },
  ],
  engraving: [
    // Vertical title: AVIONICS beside POWER.
    ...[...'AVIONICS'].map((t, i) => L([13, 72 + 20 * i], t, 13, t === 'I' ? 3 : 10)),
    ...[...'POWER'].map((t, i) => L([29, 102 + 20 * i], t, 13, t === 'W' ? 13 : 10)),
    // Switch titles (traced where printed) and OFF legends (on the pivots).
    L([56, 24], 'MMC', 9.5, 25), L([124, 24], 'ST STA', 9.5, 37), L([200, 24], 'MFD', 9.5, 24),
    L([271, 24], 'UFC', 9.5, 22), L([346, 24], 'MAP', 9.5, 22),
    L([164, 131], 'GPS', 9.5, 21), L([240, 131], 'DL', 9.5, 14),
    ...Object.entries(SW).map(([, [x, y]]) => L([x, y + 45], 'OFF', 9.5, 19)),
    L([220, 150], '+', 7),
    // INS dial: bracketed title, ALIGN bracket over STOR HDG and NORM, ticks.
    L([INS[0], 146], 'INS', 9.5, 20),
    { kind: 'path', d: path(`M${INS[0] - 44} 152L${INS[0] - 38} 146H${INS[0] - 14}M${INS[0] + 14} 146H${INS[0] + 38}L${INS[0] + 44} 152`) },
    // ALIGN bracket: an arc about the INS pivot (r 70) over STOR HDG and NORM,
    // ends turned in radially toward the pivot (pie edges), broken for the
    // ALIGN legend, which sits tangential to the knob at the arc's middle.
    { kind: 'path', d: arcMm(INS, 70, -70, -62) + arcMm(INS, 70, -36, -28) + path(tick(INS, -70, 63, 70) + tick(INS, -28, 63, 70)) },
    L(polar(INS, 70, -49), 'ALIGN', 9.5, 30, -49),
    L([56, 206], 'STOR', 9.5, 27), L([59, 218], 'HDG', 9.5, 23),
    L([93, 175], 'NORM', 9.5, 31), L([133, 172], 'NAV', 9.5, 21), L([159, 192], 'CAL', 9.5, 19),
    L([177, 236], 'IN FLT', 9.5, 32), L([177, 250], 'ALIGN', 9.5, 30),
    L([145, 270], 'ATT', 9.5, 21), L([66, 254], 'OFF', 9.5, 21),
    { kind: 'path', pen: 'medium', d: path(INS_POS.map(p => tick(INS, p.angle, 37, 44)).join('')) },
    // MIDS LVT dial.
    L([MIDS[0], 152], 'MIDS LVT', 9.5, 52),
    { kind: 'path', d: path(`M${MIDS[0] - 45} 157L${MIDS[0] - 40} 152H${MIDS[0] - 31}M${MIDS[0] + 31} 152H${MIDS[0] + 40}L${MIDS[0] + 45} 157`) },
    L([MIDS[0], 169], 'OFF', 9.5, 18), L([306, 186], 'ZERO', 9.5, 27), L([389, 186], 'ON', 9.5, 13),
    { kind: 'path', pen: 'medium', d: path(MIDS_POS.map(p => tick(MIDS, p.angle, 37, 44)).join('')) },
  ],
  placements: [
    { component: 'dzus', at: pt(18.5, 40) },
    { component: 'dzus', at: pt(421.5, 40) },
    { component: 'dzus', at: pt(18.5, 249) },
    { component: 'dzus', at: pt(421.5, 249) },
    { component: 'screw-medium', at: pt(103, 95) },
    { component: 'screw-medium', at: pt(332, 94) },
    { component: 'screw-medium', at: pt(284, 244) },
    ...Object.entries(SW).map(([id, at]) => ({ component: id === 'mfd' ? 'toggle-large-lock' as const : 'toggle-large-cylinder' as const, control: id, at: pt(...at) })),
    { component: 'rotary-pointer-medium', control: 'ins', at: pt(...INS) },
    { component: 'rotary-pointer-medium', control: 'mids', at: pt(...MIDS) },
  ],
  controls: [
    sw('mmc', 'MMC switch', 'Powers the Modular Mission Computer.'),
    sw('st-sta', 'ST STA switch', 'Powers the underwing and fuselage centreline stores stations.'),
    sw('mfd', 'MFD switch', 'Powers the two cockpit Multi-Function Displays.'),
    sw('ufc', 'UFC switch', 'Powers the Upfront Controls (ICP and DED).'),
    sw('map', 'MAP switch', 'Not functional in the Block 50 F-16.'),
    sw('gps', 'GPS switch', 'Powers the GPS receiver. The receiver needs a clear view of the sky, so inside a hangar or shelter it may not get timing or position data until the jet taxies clear.'),
    sw('dl', 'DL switch', 'Powers the Secure Modem Datalink (SMDL). Not implemented in DCS.'),
    {
      id: 'ins', name: 'INS knob', type: 'rotary', positions: INS_POS.map(p => ({ ...p, hold: 'stable' as const })), initial: 'off',
      description: 'Sets the INS operating mode and alignment method. OFF removes INS power (leave it at OFF for at least 10 seconds on aircraft power before moving it or shutting down). STOR HDG starts a quicker stored-heading alignment, valid only if the jet has not moved since the last good alignment. NORM starts a normal gyrocompass alignment from manually entered position. NAV is normal navigation after a successful alignment. CAL has no function. IN FLT ALIGN starts an in-flight alignment (hold a steady attitude and heading; the INS is in attitude mode until a coarse alignment completes). ATT gives pitch, roll and heading only. Do not move the jet, or load or reconfigure stores, during a ground alignment.',
      source: src,
    },
    {
      id: 'mids', name: 'MIDS LVT knob', type: 'rotary', positions: MIDS_POS.map(p => ({ ...p, hold: 'stable' as const })), initial: 'off',
      description: 'Powers the MIDS Link 16 terminal (ON) or removes its power (OFF). ZERO erases the sensitive data held in its memory.',
      source: src,
    },
  ],
  indicators: [],
};
