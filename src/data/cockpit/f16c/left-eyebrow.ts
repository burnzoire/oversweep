import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C left eyebrow (glareshield, left of the HUD), DCS.
 *
 * Reference: the guide's p. 45 cockpit image (483 x 625 JPEG, extracted with
 * `pdfimages -j -f 45 -l 45`), turned 55° so the F-ACK, TF-FAIL and MASTER CAUTION
 * legends read level, and cropped at (0, 250). The eyebrow bends twice and is seen
 * steeply from below, so the items are laid out on one straight strip at their
 * spacing along it; sizes are widths across the strip, with heights taken square.
 */
const PX = 3.42;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 45';
const Y = 85;                    // strip centre line
const B = mm(65);                // square pushbutton size
const CELL: [number, number] = [mm(68), mm(80)];
const pushed = [
  { id: 'out', label: 'Released', hold: 'stable' as const },
  { id: 'in', label: 'Pressed', hold: 'momentary' as const, spring: 'out' },
];

export const leftEyebrow: PanelSpec = {
  id: 'left-eyebrow',
  title: 'Left eyebrow',
  canvas: [mm(790), mm(170)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 45,
    image: 'p. 45 "Left Eyebrow Lights" cockpit image, 483 x 625 px',
    rectify: 'turn 55°, crop at (0, 250); not rectified (the strip bends)',
    pxPerMm: PX,
    scale: 'No fasteners are visible, so the scale is assumed: the square pushbuttons (65 px across) are taken as 0.75 in.',
    shown: { 'master-caution': 'out', 'f-ack': 'out', 'iff-ident': 'out' },
    unresolved: [
      'The eyebrow bends twice and is seen steeply from below; it is drawn straightened, and heights are estimated from widths.',
      'The scale is assumed, not measured.',
      'Two blank square caps between IFF IDENT and F-ACK, and the blank cell beside TF-FAIL, have no function in the guide; they are drawn as unlit blanks.',
      'The guide does not give the TF-FAIL or MASTER CAUTION colours; the image shows TF-FAIL red and MASTER CAUTION amber.',
    ],
  },
  plate: [{ d: path('M6 2H784Q788 2 788 6V164Q788 168 784 168H6Q2 168 2 164V6Q2 2 6 2Z') }],
  engraving: [],
  placements: [
    { component: 'push-square', control: 'iff-ident', at: pt(60, Y), size: [B, B], legend: [
      { text: 'IFF', cap: 3.2, y: -2.6, width: mm(21) },
      { text: 'IDENT', cap: 3.2, y: 2.6, width: mm(40) },
    ] },
    { component: 'lamp-module', at: pt(133 - 32.5, Y - 32.5), size: [B, B], lamps: [] },
    { component: 'lamp-module', at: pt(230 - 32.5, Y - 32.5), size: [B, B], lamps: [] },
    { component: 'push-square', control: 'f-ack', at: pt(312, Y), size: [B, B], legend: [{ text: 'F-ACK', cap: 3.4, y: 0, width: mm(42) }] },
    { component: 'lamp-module', at: pt(402.5, Y - 40), size: CELL, lamps: [
      { indicator: 'tf-fail', legend: 'TF-FAIL', rect: [1.3, 1.3, +(CELL[0] - 2.6).toFixed(2), +(CELL[1] - 2.6).toFixed(2)], cap: 3.2, width: mm(41) },
    ] },
    { component: 'lamp-module', at: pt(470.5, Y - 40), size: CELL, lamps: [] },
    { component: 'push-square', control: 'master-caution', indicator: 'master-caution', at: pt(698, Y), size: [mm(132), mm(132)], legend: [
      { text: 'MASTER', cap: 5, y: -8.5, width: mm(75) },
      { text: 'CAUTION', cap: 5, y: -0.5, width: mm(80) },
      { text: 'PRESS TO RESET', cap: 2.2, y: 7.5, width: mm(74) },
    ] },
  ],
  controls: [
    {
      id: 'iff-ident', name: 'IFF IDENT button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Makes the transponder send an identification-of-position reply, briefly highlighting your position to controllers answering non-Mode 4 interrogations.',
      source: src,
    },
    {
      id: 'f-ack', name: 'F-ACK button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Fault acknowledge: acknowledges the fault shown on the pilot fault list display (PFLD) and, depending on its type and severity, clears it from the list.',
      source: src,
    },
    {
      id: 'master-caution', name: 'MASTER CAUTION button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Press to reset the MASTER CAUTION light, ready for the next caution.',
      source: src,
    },
  ],
  indicators: [
    { id: 'tf-fail', name: 'TF-FAIL warning light', type: 'lamp', colour: 'red', description: 'Not functional in the Block 50.', source: src },
    { id: 'master-caution', name: 'MASTER CAUTION light', type: 'lamp', colour: 'amber', description: 'Lights whenever a light comes on on the caution light panel. Press it to reset.', source: src },
  ],
};
