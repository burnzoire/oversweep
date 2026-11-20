import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C AR status / NWS indicator (instrument panel, left of the HUD), DCS:
 * three lights (RDY, AR/NWS, DISC) in one upright housing, with a dimming
 * lever out of its right side.
 *
 * Reference: the guide's p. 45 "AR Status/NWS Indicator" image (154 x 294
 * JPEG, extracted with `pdfimages -j -f 45 -l 45`, image 013). The face is
 * square-on (its side edges are vertical), so it is traced unrectified.
 * Values are reference pixels, converted to mm by `tracer`.
 */
const PX = 5.65;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 45';

/** Dimming lever: pivot on the housing's right edge, tab 14 px deep to a round end 45 px out; swung up to `SWING` degrees down. */
const PIVOT: [number, number] = [100.5, 105], REACH = 44.5, HALF = 7, SWING = 45;
const STEPS = Array.from({ length: 11 }, (_, i) => i * 10);
function tab(deg: number) {
  const a = (deg * Math.PI) / 180, P = (u: number, v: number) => pt(PIVOT[0] + u * Math.cos(a) - v * Math.sin(a), PIVOT[1] + u * Math.sin(a) + v * Math.cos(a)).join(' ');
  const end = Array.from({ length: 13 }, (_, k) => { const t = -Math.PI / 2 + (k * Math.PI) / 12; return P(REACH - HALF + HALF * Math.cos(t), HALF * Math.sin(t)); });
  return `M${P(0, -HALF)}L${end.join('L')}L${P(0, HALF)}Z`;
}

export const arNwsIndicator: PanelSpec = {
  id: 'ar-nws-indicator',
  title: 'AR status / NWS indicator',
  canvas: [mm(154), mm(294)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 45,
    image: 'p. 45 "AR Status/NWS Indicator" image, 154 x 294 px',
    rectify: 'none: the face is square-on (side edges vertical), traced as extracted',
    pxPerMm: PX,
    scale: 'No shared component on this image. The legends (13 px cap height) are taken as the shared lamp legend height (2.3 mm), giving 5.65 px/mm; the housing is then 15.8 mm wide.',
    shown: { 'dimming-lever': 'up' },
    unresolved: [
      'The lights are shown lit in the guide (RDY pale blue, AR/NWS green, DISC red); they are drawn unlit here.',
      'The dimming lever is seen end-on from the side: its pivot is taken on the housing edge, its travel (about 45° down) and whether it has detents are not shown. It is read in percent of travel, 10 % a click.',
      'The housing is drawn square-on: a hood block across the top, the lens below it, the lever out of the right side and the stand below. The strip down its left side in the close-up is the housing\'s side seen at an angle and is not drawn. The hood\'s depth is taken from the close-up (y 8 to 52); the guide\'s p. 44 cockpit view is too small to measure it.',
      'The housing\'s mounting below the crop is not drawn. It sits right of the HUD.',
      'Physical size rests on the legend height: the guide gives no dimension.',
    ],
  },
  plate: [
    // Stand below the housing, to the image crop.
    { d: path('M14 245H91V292H14Z') },
    // Hood across the top of the housing, over the lens (the guide's p. 44 cockpit view shows it as a separate block).
    { d: path('M18 8H95Q101 8 101 14V52H12V14Q12 8 18 8Z'), raised: true },
  ],
  engraving: [],
  placements: [
    {
      component: 'lamp-module', at: pt(12, 52), size: [mm(89), mm(200)], undivided: true,
      lamps: [
        { indicator: 'rdy', legend: 'RDY', rect: [mm(5.5), mm(24), mm(64), mm(34)], width: mm(22.5), cap: mm(13.5) },
        { indicator: 'ar-nws', legend: 'AR\nNWS', rect: [mm(5.5), mm(82), mm(64), mm(46)], width: [mm(14), mm(25.5)], cap: mm(13.3) },
        { indicator: 'disc', legend: 'DISC', rect: [mm(5.5), mm(155), mm(64), mm(34)], width: mm(27), cap: mm(14) },
      ],
    },
    {
      component: 'traced', control: 'dimming-lever', at: pt(...PIVOT),
      shapes: Object.fromEntries(STEPS.map(v => [v === 0 ? 'up' : `down-${v}`, { d: tab((v / 100) * SWING) }])),
      hit: [mm(101), mm(80), mm(52), mm(90)],
    },
  ],
  controls: [
    {
      id: 'dimming-lever', name: 'Dimming lever', type: 'rotary', travel: 'vertical',
      positions: STEPS.map(v => ({ id: v === 0 ? 'up' : `down-${v}`, label: v === 0 ? 'Up (brightest)' : `${v}% down${v === 100 ? ' (dimmest)' : ''}`, hold: 'stable' as const, angle: +((v / 100) * SWING).toFixed(1) })),
      initial: 'up',
      description: 'Rotating the lever downward dims the indicator lights. It turns without detents and is read in percent of its travel, 10 % a click.',
      source: src,
    },
  ],
  indicators: [
    { id: 'rdy', name: 'RDY light', type: 'lamp', colour: 'blue', description: 'The aerial refuelling door is open and ready.', source: src },
    { id: 'ar-nws', name: 'AR/NWS light', type: 'lamp', colour: 'green', description: 'In the air: the refuelling boom is latched. On the ground: nosewheel steering is engaged and steered with the rudder pedals.', source: src },
    { id: 'disc', name: 'DISC light', type: 'lamp', colour: 'red', description: 'The refuelling boom has disconnected. After a 3-second delay the system recycles to ready.', source: src },
  ],
};
