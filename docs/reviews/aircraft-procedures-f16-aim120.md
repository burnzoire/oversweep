# Aircraft Procedures — F-16C AIM-120 single-target and BORE shots (issue #533)

## Scope
Two guided exercises on the shared cockpit panels, each starting from an AWACS BRAA call. Menu: Manual → Aircraft → F-16C Viper → Weapons and tactics → Air-to-air weapons → AIM-120.
- **Single-target shot** (`aim120-single-target`, 16 steps): DOG FIGHT switch to missile override, SMS check, MASTER ARM, FCR the SOI, range scale to 80, slew to and bug the lead of a two-ship in SAM, then turn to the collision heading, close through RAERO, ROPT and RPI, fire, crank, support the missile to active and watch it to impact. A player runs the closing and support phases on a timer.
- **BORE shot** (`aim120-bore`, 7 steps): a visual bandit, A-A master mode, SMS BORE, MASTER ARM, put the diamond on the bandit, fire.
- The AIM-120 article (weapons-and-tactics/air-to-air/aim-120/) is the parent; the two-target and TWS shots stay planned in the menu until the radar's TWS and two-target formats exist.

## New cockpit parts
- **SMS A-A page** (`mfd-sms-aa.ts`): traced from the p. 599 figure (660 x 660 px, same MFD as p. 122): AAM/MSL, INV, SLAVE/BORE, RDY, nA120B, stations 1, M, 3 / 7, M, 9 with the selected one inverse, the lower RDY, and the format row.
- **FCR AIM-120 symbology** (`mfd-fcr.ts`, `mrm.ts`): the missile scale (RAERO triangle, ROPT ring, RPI–RTR box, RMIN, closure caret, pre-launch pole and timer, post-launch pole and timer), the ASEC and ASC, RDY, the target's missile tail (flashing once active) and X (last 8 s, flashing after termination), from pp. 595–598.
- **HUD AIM-120 cues** (`hud.ts`): missile reticle and diamond for the boresight shot (p. 593), TD box with diamond, target locator line, ASEC with aspect caret, ASC, the DLZ, poles and timers (pp. 594–597); an outside-world scene layer under the symbology carries the visual bandit (silhouette and contrail). Master-mode words 4 MRM and 3 MRM.
- Rendering: MFD pages can carry a blinking group; coloured paths can blink; HUD cue pages can carry a scene.

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026): master modes pp. 558–559; "AIM-120 AMRAAM" pp. 590–607 (guidance 590–591, launch modes 592 and 600, HUD 593–597, FCR 598, SMS 599, firing 600–607). No community guide is cited or followed.

## Illustrative, not sourced
- The scene: own jet 28,000 ft, 550 KTAS, heading 360°; a hot two-ship 45 NM out on 340° at 25,000 ft, flying 150° at 404 KTAS. Collision heading 347° (closure 944 kt); crank to 030° (751 kt). The BORE bandit: 005°, 6 NM, 28,000 ft.
- The launch zone: RAERO 38, ROPT 35, RPI 32, RTR 9, RMIN 1 NM, kept in the guide's order and roughly the p. 595 figure's proportions. The missile closing at 0.557 NM/s and going active 10 NM from the target; times and poles follow from these (launch at 32 NM, active about 39 s, impact about 57 s). The guide gives no AIM-120 performance figures.

## Assumptions to check in the sim
- The FCR missile scale's full length is the FCR range scale (measured on the p. 595 close-up, 377 px = full scale).
- The next station after station 1 is 9 (the SMS steps outboard-opposite); the p. 599 figure shows station 1 selected only.
- The small ASEC on the FCR is scaled from the HUD's large/small ratio (p. 594); the FCR figure shows only the large one.
- The HUD TD box is sized from the p. 594 figure, slightly different from PR #532's.
- The missile tail's size and position on the FCR target (p. 598 figure only).
- Selecting missile override does not change the FCR's mode or range scale.
- The crank keeps the launch zone values fixed (the sim recomputes them continuously).

## Checks
- `node --experimental-strip-types --test tests/aircraft-procedures.test.mjs tests/cockpit.test.mjs tests/manual-menu.test.mjs`: pass.
- Walked every step of both procedures in the running page (Playwright): each move completes its step, the hint rings land on their indications, the confirm buttons carry the step's own text, no console errors.
