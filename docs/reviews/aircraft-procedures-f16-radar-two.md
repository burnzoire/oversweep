# Aircraft Procedures — F-16C radar: TWS, two targets (DT SAM, DTT)

## Scope
Two guided exercises on the shared cockpit panels (left MFD FCR air-to-air format, stick TMS card, throttle RDR CURSOR card), on the radar procedures' combat air patrol (28,000 ft, 0.92 Mach, heading 360°, NAV master mode):
- **TWS: track several targets** (`radar-tws`, 10 steps): OSB 2 twice (RWS, VSR, TWS), tracks form on four contacts, cursor onto the lead and TMS forward (system track, A2 3B about the cursor), cursor onto the wingman and TMS forward, TMS right (closest system track bugged), TMS right again (bug steps to the wingman), TMS aft four times (reject bug, downgrade, purge, RWS).
- **Two targets (DT SAM, DTT)** (`radar-two-targets`, 7 steps): TMS forward bugs the lead in SAM, the cursor onto the wingman and TMS forward (DT SAM), TMS right (swap primary), turn to 347° and fly 138 s (DTT inside 10 NM, 20 NM scale, 10 NM line), TMS forward on the lead (STT).

Menu: both sit under Systems → Radar (APG-68), replacing the planned "TWS" and "Two targets" items. New engine feature: a step's move can need several presses (`do.times`, page after each press from `after['<step>-<n>']`).

## New cockpit parts
`mfd-fcr-two.ts` (22 pages) on the FCR format of `mfd-fcr.ts`: track target (yellow square turned to the ground track, stem off its nose, altitude below), system track (white), bugged track (ring), SAM secondary (search square), two-target track crosses on the scales, scan limits about a contact or the cursor (A2 ±25°), DTT's fine dotted 10 NM line, 20 NM scale, 3-bar coverage.
Glossary (f16c-avionics): System track, DT SAM, DTT.

## Sources
Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026): target symbols and key p. 404; TOI data p. 405; TWS pp. 413-416 (track and system tracks, 10 tracks, 13 s stale drop, cursor and bugged target, A2 3B ±25°, TMS actions); SAM pp. 417-418; DT SAM p. 419; DTT p. 420; STT p. 421. Symbols traced from the p. 404 key and the figures on pp. 413-421 (sizes read off the figure pixels: square 16 px, stem 4 x 10 px, ring r 12.5). No community guide is cited or followed.

## Worked out, not typed
One scene of four contacts flying straight lines at constant speed (`geo` in `mfd-fcr-two.ts`). Positions, aspect (tens of degrees from the target's tail, jet right of its nose is R), closure and the collision bearing (CATA) come from that geometry, so every page agrees; the lead's numbers match the earlier radar procedures (17R, +915K, CATA 347°). True airspeed from calibrated airspeed uses the ISA compressible formula (280 KCAS at 25,000 ft gives 404.5 kt, matching the earlier 404). DTT frame: 138 s on a straight 347° course, lead 8.8 NM, wingman 14.9 NM at 44°; the wingman's CATA (83° off the nose) is off the screen and is not drawn.

## Illustrative, not sourced
Scenario positions and speeds; the contacts hold still while a step is read. Four-bar coverage ±5.4° (fitted earlier), 3-bar ±4.4° derived from the 4.6° beam (MLU Pilot's Guide p. 134) with bars 2.07° apart.

## Assumptions to check in the sim
- After the bug is rejected with the cursor still on a system track, the cursor-target A2 3B volume returns (drawn that way).
- With two system tracks and no bug, TMS right bugs the closest by range (p. 415); the lead (45 NM) before the wingman (47 NM).
- The cursor stays where it was when TMS right bugs a target (p. 415 figure shows the cursor away from the bug).
- Track symbols turn to ground track relative to the jet's heading (B-scope is nose-up); stem is the nose.
- DT SAM and DTT keep the RWS label on the top row (pp. 419-420 figures), as SAM and STT do.
- The DT SAM secondary is drawn as a search square (p. 419 figure) with its altitude under it.
- DTT drops to STT by itself on the closer target inside 3 NM (p. 420), stated not animated; TMS aft takes four presses to get from a bugged target to RWS (p. 416).
- Track dropping after 13 s outside the narrow volume is stated, not animated.

## Checks
`npx tsc --noEmit`, `node --test tests/*.test.mjs`, `npm run build`, `python3 scripts/check_docs.py`. Both procedures driven to the end in Chromium: every OSB, TMS press (including the repeated ones) and both cursor slews, no page errors.
