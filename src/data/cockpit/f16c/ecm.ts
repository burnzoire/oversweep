import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C ECM control panel (left console), DCS.
 *
 * Reference: the guide's p. 706 "ECM Control Panel" cockpit image (408 x 181
 * JPEG, extracted with `pdfimages -j -f 706 -l 706`), rectified on the four
 * DZUS fastener centres:
 *   python3 -I scripts/panel-trace.py <p706.jpg> <out> 16,37 391,37 15,143 390,142
 * Measurements below are in rectified pixels and stored in mm.
 */
const PX = 3.2;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 706–707';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
/** Module buttons: centres of the 4 x 2 matrix and the button size, in reference px. */
const COLS = [167.5, 225.5, 284, 342.5], ROWS = [65.5, 124.5], B: [number, number] = [mm(53), mm(51)];
const latched = [
  { id: 'out', label: 'Out (off)', hold: 'stable' as const },
  { id: 'in', label: 'In (on)', hold: 'stable' as const },
];
const pushed = [
  { id: 'out', label: 'Released', hold: 'stable' as const },
  { id: 'in', label: 'Pressed', hold: 'momentary' as const, spring: 'out' },
];
const modules = [
  { id: 'band-1', legend: '1', d: 'Enables or disables the band 1 module of the pod: pressed in and held for on, pressed again to pop out for off.' },
  { id: 'band-2', legend: '2', d: 'Enables or disables the band 2 module, latching in for on.' },
  { id: 'band-3', legend: '3', d: 'Enables or disables the band 3 module, latching in for on.' },
  { id: 'band-4', legend: '4', d: 'Enables or disables the band 4 module, latching in for on.' },
  { id: 'band-5', legend: '5', d: 'Enables or disables the band 5 module, latching in for on.' },
  { id: 'blank', legend: '', d: 'Unmarked button for a growth module in the pod, latching in for on.' },
  { id: 'frm', legend: 'FRM', d: 'No function in DCS.' },
  { id: 'spl', legend: 'SPL', d: 'No function in DCS.' },
];

export const ecm: PanelSpec = {
  id: 'ecm',
  title: 'ECM control panel',
  canvas: [mm(408), mm(181)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 706,
    image: 'p. 706 "ECM Control Panel" cockpit image, 408 x 181 px',
    rectify: 'python3 -I scripts/panel-trace.py <p706.jpg> <out> 16,37 391,37 15,143 390,142',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads (about 27 px) match.',
    shown: { power: 'off', xmit: '1' },
    unresolved: [
      'The OFF legend under the power switch is hidden by its lever in the reference; it is placed on the switch\'s centre line below the bushing.',
      'Each module button carries four status lights (S, A, F, T) along its top; they are unlit and barely readable in the reference, so they are not drawn.',
      'RESET (red) and BIT (white) look like lit buttons; the guide gives them no light function, so they are drawn as plain buttons.',
      'DIM is a smooth round knob in the reference; it is drawn with a short index bar so its turn shows. It is modelled with four detents.',
      'The power switch bushing shows a lock slot, so it is drawn as a lever-lock; XMIT shows a plain grommet.',
      'The plate edges are cropped in the reference; the drawn edges sit just inside the crop.',
    ],
  },
  plate: [{ d: path('M6 2H402Q406 2 406 6V175Q406 179 402 179H6Q2 179 2 175V6Q2 2 6 2Z') }],
  engraving: [
    ...([['E', 75], ['C', 92], ['M', 109]] as const).map(([t, y]) => L([11, y], t, 13, 10)),
    L([64, 11], 'OPR', 9.5, 21),
    ...([['S', 24], ['T', 35], ['B', 46], ['Y', 57]] as const).map(([t, y]) => L([89, y], t, 9.5, 7)),
    L([64, 64], 'OFF', 9.5, 21),
    ...([['1', 79], ['2', 91], ['3', 103]] as const).map(([t, y]) => L([88, y], t, 9.5)),
    L([54, 121], 'DIM', 9.5, 21),
    L([108, 121], 'XMIT', 9.5, 28),
    L([54, 170], 'RESET', 9.5, 34),
    L([120, 170], 'BIT', 9.5, 18),
    // Module button housing: a raised frame round the 4 x 2 matrix.
    { kind: 'path', pen: 'medium', d: path('M137 31H373V154H137Z') },
  ],
  placements: [
    { component: 'dzus', at: pt(15.5, 37) },
    { component: 'dzus', at: pt(390.5, 37) },
    { component: 'dzus', at: pt(15.5, 142.5) },
    { component: 'dzus', at: pt(390.5, 142.5) },
    { component: 'toggle-large-lock', control: 'power', at: pt(64, 37) },
    { component: 'knob-plain-small', control: 'dim', at: pt(54, 95) },
    { component: 'toggle-large', control: 'xmit', at: pt(112, 91) },
    { component: 'push-round-small', control: 'reset', at: pt(53, 145) },
    { component: 'push-round-small', control: 'bit', at: pt(120, 145) },
    ...modules.map((m, i) => ({
      component: 'push-square' as const, control: m.id, at: pt(COLS[i % 4], ROWS[Math.floor(i / 4)]), size: B,
      legend: m.legend ? [{ text: m.legend, cap: mm(10), y: 0, ...(m.legend.length > 1 ? { width: mm(m.legend.length * 9) } : {}) }] : [],
    })),
  ],
  controls: [
    {
      id: 'power', name: 'ECM power switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'opr', label: 'OPR', hold: 'stable' }, { id: 'stby', label: 'STBY', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off',
      description: 'Powers the ECM pod. OFF: no power. STBY: the pod warms up (about 3 minutes) but neither processes threat signals nor jams. OPR: the pod processes threats and its transmitters work as set on this panel and the hands-on controls; it will not jam until warm-up is complete.',
      source: src,
    },
    {
      id: 'xmit', name: 'XMIT switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: '1', label: '1', hold: 'stable' }, { id: '2', label: '2', hold: 'stable' }, { id: '3', label: '3', hold: 'stable' }],
      initial: '1',
      description: 'Sets the pod\'s mode. 1: deception jamming, avionics priority; the pod jams reactively when the jet is tracked or engaged, and the radar keeps working at reduced detection and lock ranges. 2: deception jamming, ECM priority; the radar goes to standby unless AIM-120 is selected. 1 and 2 need the CMDS MODE knob at SEMI or AUTO. 3: continuous noise jamming, ECM priority, radar in standby; it needs CMDS MODE at MAN and makes the jet easier to detect.',
      source: src,
    },
    {
      id: 'dim', name: 'DIM knob', type: 'rotary',
      positions: [
        { id: 'min', label: 'Dim', angle: -120, hold: 'stable' },
        { id: 'low', label: 'Low', angle: -40, hold: 'stable' },
        { id: 'high', label: 'High', angle: 40, hold: 'stable' },
        { id: 'max', label: 'Bright', angle: 120, hold: 'stable' },
      ],
      initial: 'high',
      description: 'Sets the brightness of the status lights on the module buttons.',
      source: src,
    },
    {
      id: 'reset', name: 'RESET button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'No function in DCS.',
      source: src,
    },
    {
      id: 'bit', name: 'BIT button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Runs a built-in test of the ECM pod. Not implemented in DCS.',
      source: src,
    },
    ...modules.map(m => ({
      id: m.id, name: m.legend ? `ECM module button ${m.legend}` : 'ECM module button (blank)', type: 'pushbutton' as const,
      positions: latched, initial: 'out', description: m.d, source: src,
    })),
  ],
  indicators: [],
};
