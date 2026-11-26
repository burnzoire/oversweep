# Aircraft Procedures — F-16C markpoints (issue #441)

## Scope
A guided exercise on the shared cockpit panels (ICP, DED, stick TMS card, right MFD with the HSD): in the NAV master mode with steerpoint 3 selected, open the MARK page, select OFLY, fly over the middle of Abu al-Duhur's runway and store markpoint 26 with TMS forward, fly on, make the markpoint the selected steerpoint with M-SEL, return to the CNI page and find the markpoint on the HSD at a closer range scale. Menu: Manual → Aircraft → F-16C Viper → Navigation → Markpoints → Overfly (OFLY) mark (slug `markpoint-ofly`). The Markpoints article (navigation/markpoints/) is the parent of the five markpoint procedures.

## New cockpit parts
- **DED MARK page** (`ded.ts`, `markLines`): line 1 MARK, the sensor option between asterisk cells (cols 6–11), the displayed markpoint and up/down arrow (cols 15–17), STPT highlighted (cols 19–22) when the markpoint is the selected steerpoint; LAT, LNG, ELEV and MGRS below. Columns measured on the p. 219, 220 and 225 figures (550 x 209 px, pitch 20.9 px).
- **HSD base page** (`mfd-hsd.ts`): traced from the p. 230 HSD figure (660 x 660 px, the HAD's grid) and checked against p. 358: labels (DEP, DCPL, NORM, MSG, CNTL; range scale with arrows; XMT/TNDL, FZ, FR ON; SWAP, SMS, HSD, TGP, DCLT), ownship, magenta range rings at a third, two thirds and the full scale, the inner ring's cardinal marks (p. 359 item 6), the route and steerpoint circles (selected solid), the aircraft reference symbol (item 12), and the markpoint as a small cyan X (p. 205). Range scales DEP 30 and 60.

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026): steerpoint ranges and the markpoint symbol pp. 205–206; Storing a Markpoint and the MARK DED page pp. 219–220; Storing a Markpoint using OFLY p. 225; HSD navigation information p. 230; HSD MFD format pp. 358–359; ICP p. 99; CNI page p. 103; HOTAS pp. 83–84. No community guide is cited or followed.
- The markpoint's stored position is Abu al-Duhur's runway midpoint from the DCS Syria map's airfield data (35.7323 N, 37.1041 E, 820 ft): N 35°43.938′, E 037°06.246′. The guide's own OFLY example (p. 225) was stored at the same airfield and also reads 820 ft. MGRS (37SCV 28541/55914) is computed from the latitude and longitude; the guide's figure values check against the same computation to within a metre.

## Illustrative, not sourced
- The jet's track (heading 267°, 3,000 ft above the ground, 4 NM short of the runway), the route (steerpoints 2, 3, 4; the airfield about 5 NM north of it) and the ranges (steerpoint 3 34 NM at the start and 22 NM after flying on 8 NM; markpoint 8 NM behind).
- The aircraft reference symbol's steering line offset: the guide gives no scale; drawn 1 px per 2° of relative bearing, pegged at 20 px.

## Assumptions to check in the sim
- With the radar silent and no targeting pod, one SEQ press goes from HUD to OFLY. The guide lists the options HUD, FCR, TGP, OFLY but does not say whether unavailable ones are skipped; the step says to press again if FCR or TGP shows.
- Before a markpoint is stored, the MARK page shows 26 with zeros (as the guide's p. 225 OFLY figure does), and after storing it still shows 26 (the guide's stored figure).
- After the store the asterisks stay on the sensor option, so M-SEL selects the markpoint without moving them (the p. 220 figure shows them there).
- How the HSD draws a markpoint once it is the selected steerpoint: drawn as the same cyan X. Steerpoint 3 turns hollow (p. 359 item 13).
- After a store the MARK page still shows 26, as the p. 225 figure does. The p. 220 text (item 6) says the displayed number "will automatically increment up to the next steerpoint number" after a store; if DCS moves it to 27, M-SEL would select an empty markpoint.
- The MARK page opens with HUD as the sensor option (the pp. 219–220 figures show HUD; no text says it is the default), and it stays on the DED until left.
- Opening the MARK page on HUD puts the FCR into AGR (pp. 219, 221); what that does with the radar silent is not stated.
- The guide conflicts on MGRS: p. 220 item 5 says the MARK page's MGRS field can be changed with the keypad, p. 225 says a markpoint cannot be entered in MGRS. The article follows p. 225.
- The X is sized as the X on the p. 358 figure (8 x 9 px); that one is not cyan, so it may be a different symbol.

## Checks
- `node --experimental-strip-types --test tests/aircraft-procedures.test.mjs tests/cockpit.test.mjs tests/manual-menu.test.mjs`: pass.
- Walked every step in the running page (Playwright): each move completes its step, every hint ring lands on its indication, the confirm buttons carry the step's own text, no console errors.

## HUD mark (markpoint-hud)

Sources: Eagle Dynamics DCS F-16C guide pp. 219-222 (MARK page, HUD and HMCS steps), 340 (markpoint cursor), 449 (AGR), 92 (flight path marker), 358-359 (HSD). In-simulator verification pending (no DCS build recorded).

Built: `hud-ground.ts` draws Abu al-Duhur from the OSM plan in true angular scale (jet level, 3,000 ft AGL, 4 NM short of the southern runway's midpoint, heading 267) behind the HUD symbology (new `ground` HUD indicator); mark cue pages (`mark-caged`, `mark-free`, `mark-on`); a HUD slew in the HTS engine; MARK/HSD states for a point stored 4 NM ahead.

Assumptions (check in the sim): the mark cue's look (a small ring with a centre dot, about the size of the flight path marker's circle; caged, a small ring inside the marker) is read off the p. 221 figures and not specified; the sensor option reads HUD when the MARK page opens; the cue stays drawn after storing and after M-SEL; the HUD diamond for the markpoint is drawn at the point's ground elevation; the ground-stabilised cue looks the same as the slewed one. The HMCS extension is covered in a note, not as steps.

## FCR mark (markpoint-fcr)

Sources: Eagle Dynamics DCS F-16C guide pp. 219–220 (MARK page, FCR sensor option, the CZ note), 223 (storing a markpoint using FCR, with its figures), 437 (GM mode), 443–444 (FTT mode), 189 and 341 (Cursor Zero), 358–359 (HSD). In-simulator verification pending (no DCS build recorded). Built on the HUD mark's scene (jet level at 3,000 ft above the ground, 4 NM short of the southern runway's midpoint, heading 267°, steerpoint 3 selected, markpoint 26 stored over the runway midpoint), so the MARK and HSD pages are the HUD mark's, with the FCR sensor option.

Built: `mfd-fcr-gm.ts`, the FCR ground map format (GM, FTT) laid out on the guide's pp. 437, 443 and 223 figures, with the radar picture as a generated image (`scripts/gm-radar-map.py`, `public/images/cockpit/radar/gm-map.webp`, from the airfield's map data); crosshairs that follow the cursor on both axes (a `cursorY` option beside `cursorX`); MARK page states with the FCR sensor option; the engine's `markpoint-fcr` scenario.

Assumptions (check in the sim):
- The crosshairs start away from the target at mid-screen. In the sim they start on the SPI, the selected steerpoint, which here (steerpoint 3, 34 NM away) is beyond the 10 NM scale; the scenario sets range scale switching to MAN so the scale stays put, as the guide's own FCR markpoint figures show (MAN).
- The radar picture is an illustration: pavement dark, buildings bright, farmland speckled. The runways are drawn about 4 px wide, wider than their true width at this scale, as the radar's resolution would blur them. The sector's lower edges follow the guide's p. 437 figure (30° to the horizontal from x 245 and 416.5 at the bottom of the format).
- The antenna elevation caret is placed for a level jet at 3,000 ft above flat ground and the cursor's range; the azimuth caret follows the cursor.
- In FTT the ownship X is drawn just above the format-select row, below the map, where it lies at the bottom centre (the guide shows it pinned at the edge only when the ownship is beyond the map).
- The held point's coordinates are written as the MARK page's (N 35°43.938', E 037°06.246'); the elevation stored (820 ft) is the ground's, as in the HUD mark.
- The radar stays in FTT, with the diamond, after the markpoint is stored. The guide does not show that page.
- CZ is a note in the store step (Nathan, 2026-11-26: a CZ step shows nothing without another sensor visibly resetting), with a hint ring on the CZ label.
- TTG, the gain scale, EGM/RGM and the snowplow are drawn as labels only, with no function.
- The sensor option reads FCR when MARK opens because the radar is already in FTT (p. 220); the SEQ route is a note.

## Checks (FCR mark)
- `npm test`, `tsc --noEmit` and `npm run build` pass; `check_site.mjs` and `check_encyclopedia.mjs` pass.
- Walked every step in the running page (Playwright): the DMS, TMS, ICP and OSB moves complete their steps, the crosshairs slew onto the runway midpoint, every confirm carries the step's own text, no console errors.

- SME review (2026-11-26, READY) low findings applied: the CZ caution now says zeroing "may be necessary"; the lower-left bearing/range field is no longer described for the pre-hold ground map (p. 396 is the air-to-air format); the CZ step was dropped for a note in the store step (see assumptions). Not applied here (belongs to the HUD mark, PR #553): the explicit SEQ to HUD in its MARK step.
