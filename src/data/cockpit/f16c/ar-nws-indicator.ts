import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C AR status / NWS indicator (instrument panel, right of the HUD), DCS:
 * three square lights (RDY, AR/NWS, DISC) stacked in an upright housing under
 * a hood that wraps its left, top and right sides, with a flat dimming tab out
 * of its right side.
 *
 * Reference: the guide's p. 45 "AR Status/NWS Indicator" image (154 x 294
 * JPEG, extracted with `pdfimages -j -f 45 -l 45`, image 013) for the legends
 * and scale; the layout (separate square lenses, hood, tab, screw) is squared
 * up from a photo of a real unit Nathan supplied (2026-11-20), since the guide
 * shows the housing only at an angle. Values are reference pixels at the
 * guide image's scale, converted to mm by `tracer`.
 */
const PX = 5.65;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 45';

/** Dimming tab: a flat bar out of the housing's right side, 46 px long and 22 px deep (photo), level with the foot of RDY as in the guide; swung up to `SWING` degrees down. */
const PIVOT: [number, number] = [113, 105], REACH = 46, HALF = 11, SWING = 45;
const STEPS = Array.from({ length: 11 }, (_, i) => i * 10);
function tab(deg: number) {
  const a = (deg * Math.PI) / 180, P = (u: number, v: number) => pt(PIVOT[0] + u * Math.cos(a) - v * Math.sin(a), PIVOT[1] + u * Math.sin(a) + v * Math.cos(a)).join(' ');
  // The bar starts inside the housing so its root stays hidden behind the side as it swings.
  return `M${P(-12, -HALF)}L${P(REACH, -HALF)}L${P(REACH, HALF)}L${P(-12, HALF)}Z`;
}
/** One square lens module (55 x 54 px) at its top-left corner; the lens inside the frame carries the legend. */
const LENS = 55, LENS_H = 54;
const lens = (y: number, l: { indicator: string; legend: string; width: number | number[]; cap: number }) => ({
  component: 'lamp-module' as const, at: pt(36.5, y), size: [mm(LENS), mm(LENS_H)] as [number, number],
  lamps: [{ ...l, rect: [mm(5), mm(5), mm(LENS - 10), mm(LENS_H - 10)] as [number, number, number, number], width: Array.isArray(l.width) ? l.width.map(mm) : mm(l.width), cap: mm(l.cap) }],
});

export const arNwsIndicator: PanelSpec = {
  id: 'ar-nws-indicator',
  title: 'AR status / NWS indicator',
  canvas: [mm(170), mm(294)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 45,
    image: 'p. 45 "AR Status/NWS Indicator" image, 154 x 294 px',
    rectify: 'none: laid out square-on from the photo of a real unit (0.317 guide px a photo px, from the 205 photo px lens pitch against the guide\'s 65 px legend pitch; the lens centres sit on the guide\'s legends) and checked against the guide image',
    pxPerMm: PX,
    scale: 'No shared component on this image. The legends (13 px cap height) are taken as the shared lamp legend height (2.3 mm), giving 5.65 px/mm; the housing is then 18.4 mm wide over the hood (its front face 310 photo px wide, between the hood\'s side sheets; the left side wall the camera sees at an angle is left out).',
    shown: { 'dimming-lever': 'up' },
    unresolved: [
      'The lights are shown lit in the guide (RDY pale blue, AR/NWS green, DISC red); they are drawn unlit here.',
      'The guide shows the dimming tab level with the foot of RDY; the photo of a real unit shows it at mid height. The guide\'s place is drawn. Its travel (taken as 45° down) and whether it has detents are not shown in the guide or the photo. It is read in percent of travel, 10 % a click.',
      'The hood is a thin sheet folded round the left, top and right of the housing, so square-on it shows only as a thin edge. Its depth is not drawn.',
      'The housing\'s mounting below the crop is not drawn. It sits right of the HUD.',
      'Physical size rests on the legend height: the guide gives no dimension.',
    ],
  },
  plate: [
    // Stand below the housing, between the hood's side flanges.
    { d: path('M24 278H104V292H24Z') },
    // Housing face.
    { d: path('M15 53H113V278H15Z') },
    // Hood: a thin sheet round the left, top and right, its side flanges running down past the face.
    { d: path('M12 50H116V292H113V53H15V292H12Z'), raised: true },
  ],
  engraving: [],
  placements: [
    lens(66, { indicator: 'rdy', legend: 'RDY', width: 22.5, cap: 13.5 }),
    lens(131, { indicator: 'ar-nws', legend: 'AR\nNWS', width: [14, 25.5], cap: 13.3 }),
    lens(196, { indicator: 'disc', legend: 'DISC', width: 27, cap: 14 }),
    { component: 'screw-small', at: pt(89, 264) },
    {
      component: 'traced', control: 'dimming-lever', at: pt(...PIVOT),
      shapes: Object.fromEntries(STEPS.map(v => [v === 0 ? 'up' : `down-${v}`, { d: tab((v / 100) * SWING) }])),
      hit: [mm(115), mm(88), mm(53), mm(76)], under: true,
    },
  ],
  controls: [
    {
      id: 'dimming-lever', name: 'Dimming tab', type: 'rotary', travel: 'vertical',
      positions: STEPS.map(v => ({ id: v === 0 ? 'up' : `down-${v}`, label: v === 0 ? 'Up (brightest)' : `${v}% down${v === 100 ? ' (dimmest)' : ''}`, hold: 'stable' as const, angle: +((v / 100) * SWING).toFixed(1) })),
      initial: 'up',
      description: 'Rotating the tab downward dims the indicator lights. It turns without detents and is read in percent of its travel, 10 % a click.',
      source: src,
    },
  ],
  indicators: [
    { id: 'rdy', name: 'RDY light', type: 'lamp', colour: 'blue', description: 'The aerial refuelling door is open and ready.', source: src },
    { id: 'ar-nws', name: 'AR/NWS light', type: 'lamp', colour: 'green', description: 'In the air: the refuelling boom is latched. On the ground: nosewheel steering is engaged and steered with the rudder pedals.', source: src },
    { id: 'disc', name: 'DISC light', type: 'lamp', colour: 'red', description: 'The refuelling boom has disconnected. After a 3-second delay the system recycles to ready.', source: src },
  ],
};
