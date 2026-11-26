# FCR ground map radar picture: ChatGPT image prompt

The picture under the FCR ground map format (`GM_MAP` in `src/data/cockpit/f16c/mfd-fcr-gm.ts`, file `public/images/cockpit/radar/gm-map.webp`) is now a procedural texture from `scripts/gm-radar-map.py`. It reads as noise, so the final art is to be painted by ChatGPT over the to-scale placeholder (`python3 -I scripts/gm-radar-map.py out.png --placeholder`, 489 px square), as for the Maverick seeker video.

Geometry: plan view (map view), north is NOT up, the jet's heading is up. The jet is at the bottom centre, 10 NM scale, 44.1 px a nautical mile. Abu al-Duhur's two parallel runways are the pair of dark strips in the middle (about 70 px long, 4 px wide, 6 px apart), 4 NM (176 px) ahead of the bottom edge. The black corners at the bottom are outside the scanned sector and must stay black.

Reference for the look: the guide's own ground map figures (DCS F-16C guide pp. 437 and 443 show real radar maps of this kind; Nathan has them).

Prompt (attach the placeholder):

```
Make a 489 x 489 px square greyscale image that exactly matches the layout of the attached placeholder: the same black corners at the bottom, the same two dark runway strips in the same place. It is a synthetic aperture / ground mapping radar picture of open farmland in Syria seen from above, like the display of an F-16 fire control radar in ground map mode. Style: monochrome, no colour, no text, no symbols, no grid, no sky, no perspective, flat plan view. Radar look: strong grainy speckle, slightly blurry (about 150 ft resolution per pixel at 10 NM across the picture is 489 px, so features are soft), with high-contrast patchwork fields: large irregular patches of different brightness (bright rough ground, dark smooth ground), thin dark winding lines for wadis and streams, faint straight bright lines for roads and field boundaries, a few small bright clusters for villages, and brighter returns from hills toward the top corners. Smooth surfaces (runways, taxiways, still water) are nearly black. The air base around the runways is a smoother, slightly darker area with a few small bright dots for hangars at the ends of the runways. Keep the runways exactly as in the placeholder. Mean brightness mid-grey, dark enough that white text on top stays readable.
```

Swap: save the result as `public/images/cockpit/radar/gm-map.webp` (489 x 489, WebP). Nothing else changes.
