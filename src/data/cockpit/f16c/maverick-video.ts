/**
 * AGM-65 seeker video under the WPN format's symbology: generated stills (ChatGPT, from Nathan, 2026-11-23) painted
 * over the to-scale placeholders of `scripts/maverick-placeholders.py` with the prompts in
 * docs/art/maverick-seeker-prompts.md. Black-and-white TV (AGM-65H) pictures, 768 px square, each spanning 1.6 times
 * the seeker's field of view so the picture can be slewed; the glass shows the middle part. Assumed fields of view:
 * 5 degrees wide, 2.5 narrow. The art draws the vehicles about 2.5 to 3 times their true size at this range.
 *
 * Served as files from public/ (each MFD page that shows one would otherwise inline the whole picture).
 */
const base = ((import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/').replace(/\/+$/, '');
const file = (name: string) => `${base}/images/cockpit/maverick/${name}.webp`;

/** PRE scene, AGM-65H (TV), wide field of view: steerpoint 5 (the crossroads) and the column on the north-east road. */
export const MAV_TV_WIDE = file('tv-wide');
/** BORE: the same scene through the seeker on the jet's boresight, 8.5 degrees above the line to the crossroads. */
export const MAV_TV_BORE = file('tv-bore');
/** Narrow field of view, centred on the lead T-72 (under the crosshairs). */
export const MAV_TV_NARROW = file('tv-narrow');
/** In the wide picture (image px, 768 px image): the crossroads and the lead T-72, measured on the art. */
export const MAV_TV_SPI: [number, number] = [352, 326];
export const MAV_TV_LEAD: [number, number] = [447, 290];
/** The third T-72, the last tank of the column (the BMP-2 and the truck follow it). */
export const MAV_TV_TANK3: [number, number] = [498, 274];
/** Image px per glass px: the image (768 px) spans 1.6 times the glass (489 px on the 660 px MFD grid). */
export const MAV_VIDEO_K = 1.6;

/*
 * AGM-65D (infrared, white-hot) and targeting pod pictures for the boresight and TGP handoff procedure: to-scale
 * generated art (ChatGPT, from Nathan) painted over the to-scale placeholders of
 * `scripts/maverick-d-placeholders.py` with the prompts in docs/art/maverick-d-seeker-prompts.md.
 */
/** Boresight scene, steerpoint 3 (a road junction by a brickworks), 10 NM from the jet at 8,000 ft. */
export const MAV_IR_B_WIDE = file('ir-mav-wide-boresight');
export const MAV_IR_B_NARROW = file('ir-mav-narrow-boresight');
export const TGP_IR_B = file('ir-tgp-boresight');
/** Target scene, steerpoint 5 (a farm-track junction), two T-72s and a BMP-2 by a tree line, 5 NM from the jet. */
export const MAV_IR_T_WIDE = file('ir-mav-wide-target');
export const MAV_IR_T_NARROW = file('ir-mav-narrow-target');
export const TGP_IR_T = file('ir-tgp-target');
/**
 * Where things are in each picture (image px on the 768 px picture): the steerpoint junction (`spi`), the chimney or
 * the lead T-72 (`aim`), and `k`, how many glasses the picture spans. The art (ChatGPT, from Nathan, 2026-11-24) is
 * cropped round the two points and `k` set so both can be slewed under the crosshairs without the picture's edge showing.
 */
export const IR = {
  bWide: { spi: [257.3, 428.4], aim: [510.7, 339.6], k: 1.75 },
  bNarrow: { spi: [192.6, 463.8], aim: [575.4, 304.2], k: 2.49 },
  bTgp: { spi: [136.7, 512.1], aim: [631.3, 255.9], k: 3.9 },
  tWide: { spi: [312.5, 403.7], aim: [455.5, 364.3], k: 1.6 },
  tNarrow: { spi: [333.4, 402.7], aim: [434.6, 365.3], k: 1.6 },
  tTgp: { spi: [327.3, 411.7], aim: [440.7, 356.3], k: 1.6 },
} as const satisfies Record<string, { spi: readonly [number, number]; aim: readonly [number, number]; k: number }>;
export type IrPic = (typeof IR)[keyof typeof IR];
/** The page offset (page units, from px via `mm`) that puts picture point `p` under crosshairs at `cross` (660 px grid), the glass centred at 329.5, 330. */
export const underIn = (pic: { k: number }, cross: readonly [number, number], p: readonly [number, number]): [number, number] => {
  const g = 489 / (768 / pic.k);
  const c = [384 + (cross[0] - 329.5) / g, 384 + (cross[1] - 330) / g];
  return [(p[0] - c[0]) * g, (p[1] - c[1]) * g];
};
