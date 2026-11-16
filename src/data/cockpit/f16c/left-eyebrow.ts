import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C left eyebrow (glareshield, left of the HUD), DCS.
 *
 * Reference: the guide's p. 45 cockpit image (483 x 625 JPEG, extracted with
 * `pdfimages -j -f 45 -l 45`), traced unrectified. The eyebrow runs down and
 * left from the HUD at 45° (MASTER CAUTION, TF-FAIL, F-ACK and a blank cap),
 * then bends straight down the canopy side (a blank cap and IFF IDENT). Each item
 * is placed at its centre in the image, turned with its segment, and drawn
 * square-on at full size (the camera foreshortens them across the strip).
 */
const PX = 3.16;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 45';
const SLOPE = -45;               // upper segment, degrees clockwise
const B = mm(60);                // square pushbutton size
const MC = mm(125);              // MASTER CAUTION size
const TF: [number, number] = [mm(62), mm(62)];
/** Top-left of a w x h module centred on (x, y) in reference px (modules turn about their centre). */
const tl = (x: number, y: number, [w, h]: [number, number]) => [+(mm(x) - w / 2).toFixed(3), +(mm(y) - h / 2).toFixed(3)] as [number, number];
const pushed = [
  { id: 'out', label: 'Released', hold: 'stable' as const },
  { id: 'in', label: 'Pressed', hold: 'momentary' as const, spring: 'out' },
];

export const leftEyebrow: PanelSpec = {
  id: 'left-eyebrow',
  title: 'Left eyebrow',
  canvas: [mm(483), mm(625)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 45,
    image: 'p. 45 "Left Eyebrow Lights" cockpit image, 483 x 625 px',
    rectify: 'none: traced on the image as extracted; items placed by their centres',
    pxPerMm: PX,
    scale: 'No fasteners are visible, so the scale is assumed: the square pushbuttons (about 60 px across) are taken as 0.75 in.',
    shown: { 'master-caution': 'out', 'f-ack': 'out', 'iff-ident': 'out' },
    unresolved: [
      'The eyebrow is seen steeply from below; items are drawn square-on at their image centres, and the strip outline is simplified to two straight segments.',
      'The image crops the strip at its top and left, so the outline stops at the canvas edge. MASTER CAUTION, cut off in the image, is moved 25 px down the strip so it fits.',
      'The scale is assumed, not measured.',
      'Two blank square caps and the blank cell beside TF-FAIL have no function in the guide; they are drawn as unlit blanks.',
      'The guide does not give the TF-FAIL or MASTER CAUTION colours; the image shows TF-FAIL red and MASTER CAUTION amber.',
    ],
  },
  // Upper segment: from x + y = 389 to 600; lower segment: x = 2 to 85.
  plate: [{ d: path('M387 2L2 387V623H85V515L481 119V2Z') }],
  engraving: [],
  placements: [
    { component: 'push-square', control: 'master-caution', indicator: 'master-caution', at: pt(396, 92), rotate: SLOPE, size: [MC, MC], legend: [
      { text: 'MASTER', cap: 5, y: -8, width: mm(75) },
      { text: 'CAUTION', cap: 5, y: 0, width: mm(80) },
      { text: 'PRESS TO RESET', cap: 2.2, y: 8, width: mm(74) },
    ] },
    // TF-FAIL and the blank cell beside it: two square cells side by side along the strip.
    { component: 'lamp-module', at: tl(235, 254, TF), rotate: SLOPE, size: TF, lamps: [
      { indicator: 'tf-fail', legend: 'TF-FAIL', rect: [1.3, 1.3, +(TF[0] - 2.6).toFixed(2), +(TF[1] - 2.6).toFixed(2)], cap: 3, width: mm(41) },
    ] },
    { component: 'lamp-module', at: tl(279, 210, TF), rotate: SLOPE, size: TF, lamps: [] },
    { component: 'push-square', control: 'f-ack', at: pt(142, 345), rotate: SLOPE, size: [B, B], legend: [{ text: 'F-ACK', cap: 3.4, y: 0, width: mm(42) }] },
    { component: 'lamp-module', at: tl(80, 402, [B, B]), rotate: SLOPE, size: [B, B], lamps: [] },
    { component: 'lamp-module', at: tl(47, 495, [B, B]), size: [B, B], lamps: [] },
    { component: 'push-square', control: 'iff-ident', at: pt(37, 580), size: [B, B], legend: [
      { text: 'IFF', cap: 3.2, y: -2.6, width: mm(21) },
      { text: 'IDENT', cap: 3.2, y: 2.6, width: mm(40) },
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
