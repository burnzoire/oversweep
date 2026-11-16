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
const MC: [number, number] = [mm(140), mm(85)]; // MASTER CAUTION face, along x across the strip
/**
 * MASTER CAUTION runs off the top and right of the image, so the drawing has a 30 px
 * margin above and to the right of it: every image y below is shifted down by OY.
 */
const OY = 30;
const P = (x: number, y: number) => pt(x, y + OY);
const TF: [number, number] = [mm(62), mm(62)];
/** Top-left of a w x h module centred on (x, y) in reference px (modules turn about their centre). */
const tl = (x: number, y: number, [w, h]: [number, number]) => [+(mm(x) - w / 2).toFixed(3), +(mm(y + OY) - h / 2).toFixed(3)] as [number, number];
/** Rectangle w x h (px) centred on (x, y), turned `deg` clockwise; an SVG path in reference px. */
const box = (x: number, y0: number, w: number, h: number, deg = 0) => {
  const y = y0 + OY, a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return 'M' + [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
    .map(([u, v]) => `${(x + u * c - v * s).toFixed(1)} ${(y + u * s + v * c).toFixed(1)}`).join('L') + 'Z';
};
const pushed = [
  { id: 'out', label: 'Released', hold: 'stable' as const },
  { id: 'in', label: 'Pressed', hold: 'momentary' as const, spring: 'out' },
];

export const leftEyebrow: PanelSpec = {
  id: 'left-eyebrow',
  title: 'Left eyebrow',
  canvas: [mm(513), mm(655)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 45,
    image: 'p. 45 "Left Eyebrow Lights" cockpit image, 483 x 625 px',
    rectify: 'none: traced on the image as extracted, with a 30 px margin added above and to the right; items placed by their centres',
    pxPerMm: PX,
    scale: 'No fasteners are visible, so the scale is assumed: the square pushbuttons (about 60 px across) are taken as 0.75 in.',
    shown: { 'master-caution': 'out', 'f-ack': 'out', 'iff-ident': 'out' },
    unresolved: [
      'The eyebrow is seen steeply from below; items are drawn square-on at their image centres. The housings are traced as their front faces, with sizes across the strip estimated; the strip is two straight runs joined by a smooth bend.',
      'The image crops the strip at its top and left, and cuts off the far corners of MASTER CAUTION; its face is measured on the two visible edges and centred on its legend.',
      'The scale is assumed, not measured.',
      'Two blank square caps and the blank cell beside TF-FAIL have no function in the guide; they are drawn as unlit blanks.',
      'The guide does not give the TF-FAIL or MASTER CAUTION colours; the image shows TF-FAIL red and MASTER CAUTION amber.',
    ],
  },
  // The eyebrow (in drawing px, image y + 30): upper segment from x + y = 419 to 630, lower segment x = 2 to 85,
  // joined by a smooth bend.
  // On it, the raised housings behind the lights, traced from the image: each is the
  // front face only (the camera also shows their sides), about 8 px proud of what it holds.
  plate: [
    { d: path('M417 2L58.6 360.4Q2 417 2 497V653H85V585Q85 545 113.3 516.7L511 119V2Z') },
    { raised: true, d: path(box(349, 131, 99, 56, SLOPE)) },               // screw block, under the MASTER CAUTION housing
    { raised: true, d: path(box(425, 60, 156, 101, SLOPE)) },             // MASTER CAUTION
    { raised: true, d: path(box(257, 232, 140, 78, SLOPE)) },              // TF-FAIL and its blank cell
    // One housing from F-ACK down to IFF IDENT, 76 px wide, bending smoothly from the 45° run to vertical.
    { raised: true, d: path('M147.6 315.6L53.5 410.8Q4 460.3 4 530.3V655H80V531.7Q80 491.7 108.3 463.4L201.4 369.4Z') },
  ],
  engraving: [],
  placements: [
    { component: 'screw-medium', at: P(349, 131) },
    // Face measured on its two visible edges, centred on its legend (the image cuts off its far corners).
    { component: 'push-square', control: 'master-caution', indicator: 'master-caution', at: P(425, 60), rotate: SLOPE, size: MC, legend: [
      { text: 'MASTER', cap: 5.6, y: -5.6, width: mm(78) },
      { text: 'CAUTION', cap: 5.6, y: 0.6, width: mm(83) },
      { text: 'PRESS TO RESET', cap: 2.6, y: 5.6, width: mm(78) },
    ] },
    // TF-FAIL and the blank cell beside it: two square cells side by side along the strip.
    { component: 'lamp-module', at: tl(235, 254, TF), rotate: SLOPE, size: TF, lamps: [
      { indicator: 'tf-fail', legend: 'TF-FAIL', rect: [1.3, 1.3, +(TF[0] - 2.6).toFixed(2), +(TF[1] - 2.6).toFixed(2)], cap: 3, width: mm(41) },
    ] },
    { component: 'lamp-module', at: tl(279, 210, TF), rotate: SLOPE, size: TF, lamps: [] },
    { component: 'push-square', control: 'f-ack', at: P(142, 345), rotate: SLOPE, size: [B, B], legend: [{ text: 'F-ACK', cap: 3.4, y: 0, width: mm(42) }] },
    { component: 'lamp-module', at: tl(80, 402, [B, B]), rotate: SLOPE, size: [B, B], lamps: [] },
    { component: 'lamp-module', at: tl(47, 495, [B, B]), size: [B, B], lamps: [] },
    { component: 'push-square', control: 'iff-ident', at: P(37, 580), size: [B, B], legend: [
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
