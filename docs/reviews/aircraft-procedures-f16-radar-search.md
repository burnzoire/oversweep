# Aircraft Procedures — F-16C radar: RWS, VSR, bug and lock (issue #531)

## Scope
Three guided exercises on the shared cockpit panels (left MFD with the FCR air-to-air format, stick TMS/DMS cards, throttle RDR CURSOR card, HUD), on a combat air patrol at 28,000 ft, 0.92 Mach, heading 360°, in the NAV master mode:
- **RWS search** (`radar-rws`, 9 steps): DMS aft to make the FCR the SOI, read the mode, range scale, search volume, cursor and a contact, step the range up to 80 NM, narrow the scan to A3 and slew the cursor onto the lead of a hot two-ship.
- **Bug and lock (SAM, STT)** (`radar-bug-lock`, 8 steps): TMS forward to bug the lead (SAM), read aspect, track, speed and closure, find the CATA and turn onto it (HUD target designator box appears), TMS forward to STT, TMS aft back to SAM, TMS aft to RWS.
- **VSR search** (`radar-vsr`, 5 steps): OSB 2 to VSR (cold contact drops, a far hot contact appears at 70 NM), slew onto it, TMS forward straight to STT, TMS aft back to VSR.

Menu: Manual → Aircraft → F-16C Viper → Systems → Radar (APG-68), an article page (`systems/radar/`) that is the parent of the radar procedures. The menu also gains planned TWS, Two targets, Dogfight modes and Identify contacts under Radar; a Datalink (TNDL) group (#528–#530) and IFF split from "Datalink and IFF"; and the agreed Air-to-air weapons nesting (air combat setup, gun, AIM-9 and AIM-120 shots, all planned).

## New cockpit parts
- **FCR air-to-air format** (`mfd-fcr.ts`), traced from the p. 394 figure (660 x 660 px, the HAD/HSD grid) and checked against pp. 411, 417 and 421: B-scope (range 0 at y 548, full scale 441 px; azimuth ±60° over x 110–551.5), mode/sub-mode row, range scale and arrows, azimuth width and bars, elevation scale and caret, azimuth caret, horizon line, A3/A1 scan-limit lines, acquisition cursor with its altitude numbers, B/R field, NOT SOI, search targets with hot lines, bugged target with heading stub, SAM track crosses, CATA, TOI data row (aspect, track, speed, closure), steerpoint "wedding cake".
- **HUD**: air-to-air target locator line (from the boresight cross, with the angle off) and target designator box with the target's altitude (p. 406).
- Glossary: CRM, B-scope, Situation awareness mode, CATA added to the F-16C avionics terms.

## Sources
Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026): HOTAS pp. 84–87; SOI p. 331; FCR pp. 375–383; air-to-air format and symbols pp. 394–397, 404; TOI data and HUD symbology pp. 405–406; CRM pp. 408–409; RWS pp. 410–411; VSR p. 412; SAM pp. 417–418; STT p. 421. No community guide is cited or followed.

## Illustrative, not sourced
- The scenario geometry: lead 45 NM, 20° left, 25,000 ft, heading 150, 280 KCAS (aspect 1R, closure 921 kt, 950 on the collision heading 347); wingman 46 NM, 23.5° left; single 30 NM, 40° right, 15,000 ft, cold; far contact 70 NM, 8° right, 33,000 ft, 400 KCAS, closure 1205 kt.
- The cursor altitude numbers: worked out from the guide's figures (about ±5.4° for 4 bars). 2-bar coverage is not given.

## Assumptions to check in the sim
- ANT ELEV gearing is not published; it is described, not used as an action.
- SAM and STT keep the RWS sub-mode label (as the guide figures show); STT entered from VSR keeps VSR.
- NOT SOI hides the acquisition cursor.
- The HUD target locator line's length and the "F" prefix on its angle.
- Weapon status (RDY) is omitted in NAV; cursor altitude numbers and B/R field are hidden while slewing.
- The picture holds still between steps (no target motion).

## Checks
- `npx tsc --noEmit`, `node --test tests/*.test.mjs` (33 pass), `npm run check` (777 pages), `python3 scripts/check_docs.py`: pass.
- All three procedures driven to the end in Playwright: every hint link rings its target, every confirm button shows its own text, no page errors.
- Onion-skin overlays of the format against pp. 394, 411, 417 and 421 and of the HUD cues against p. 406.
