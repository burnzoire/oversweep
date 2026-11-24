# Aircraft Procedures — F-16C markpoints (issue #441)

## Scope
A guided exercise on the shared cockpit panels (ICP, DED, stick TMS card, right MFD with the HSD): in the NAV master mode with steerpoint 3 selected, open the MARK page, select OFLY, fly over the middle of Abu al-Duhur's runway and store markpoint 26 with TMS forward, fly on, make the markpoint the selected steerpoint with M-SEL, return to the CNI page and find the markpoint on the HSD at a closer range scale. Menu: Manual → Aircraft → F-16C Viper → Navigation → Markpoints.

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
- The X is sized as the X on the p. 358 figure (8 x 9 px); that one is not cyan, so it may be a different symbol.

## Checks
- `node --experimental-strip-types --test tests/aircraft-procedures.test.mjs tests/cockpit.test.mjs tests/manual-menu.test.mjs`: pass.
- Walked every step in the running page (Playwright): each move completes its step, every hint ring lands on its indication, the confirm buttons carry the step's own text, no console errors.
