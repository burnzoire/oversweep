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
