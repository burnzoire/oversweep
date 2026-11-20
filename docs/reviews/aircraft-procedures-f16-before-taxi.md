# Aircraft Procedures — F-16C after engine start & before taxi (issue #389)

## Scope
From a running engine at idle (the state Engine Start ends in): the after-start checks (guide pp. 137–140), a Stored Heading INS alignment (pp. 169–171) and the before-taxi checks (p. 142), ending with the INS at NAV and the chocks out. 59 steps on the shared cockpit panels. Taxi (guide p. 142, steps 7–10) is a separate procedure.

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026): After Engine Start pp. 137–140, Taxi p. 141 (state at mission start), Before Taxi p. 142, INS Alignment, the INS knob and the INS DED page pp. 169–171. No community guide is cited or followed.
- Incirlik field elevation (191 ft): the Syria map airfield data in the Encyclopedia.

## Playable on built panels
Every step moves or reads a built panel. Warning light tests (TEST panel with lamps lit while the button is held), AVIONICS POWER, INS knob and the DED INS page, SNSR PWR, HUD (SYM knob, ALIGN cue), C & I knob (IFF), SEC check (ENG CONT guard and switch, throttle, nozzle and RPM readings), FLCS BIT (FLT CONTROL panel, RUN light, switch back to OFF by itself), ECM, speed brake (throttle card), wheels lights, standby attitude indicator uncage (OFF flag), FUEL QTY SEL through every position (TEST with FWD/AFT FUEL LOW, RSVR, INT WING, EXT WING, EXT CTR, NORM; no external tanks, so EXT reads zero), EPU fuel, DTE page and LOAD (left MFD), HMCS knob, DBU (DBU ON warning), trim (MANUAL TRIM panel and stick trim card), MPO, AR status lights, oxygen diluter and the throttle 10% above idle for the EPU check, EPU test, backup UHF function knob, altimeter (ELEC and PNEU, barometric setting), exterior lights, INS to NAV.

## Confirms
Steps that only read an indication end with a confirm (SEC and PRI nozzle, wheels, EPU fuel, EPU lights, canopy, HUD altitude, alignment complete), and the steps that move the stick and rudder pedals through their travel (cycling and operating the controls), which are explained rather than clicked (Nathan, 2026-11-20), and the chocks.

## Modelling choices
- Rudder pedals are a card on the side stick page (plan view, pushed pedal forward); they are not in the stick figure. This procedure does not use them.
- The backup UHF CHAN and frequency displays light when the function knob leaves OFF (CHAN only in PRESET): preset 1, 330.500, matching the DED UHF line; TEST DISPLAY lights every segment.
- Only trim presses a step asks for move the trim pointers; at DISC (outside the DISC check) a press is refused. "Trim back to centre" ends only when both pointers are centred.
- Stick trim moves the PITCH and ROLL TRIM pointers one dot a press with TRIM/AP DISC at NORM (nothing at DISC); the manual trim wheels do not add to them in this procedure.
- The EHSI comes on with the avionics showing the red INU warning flag (guide p. 232, item 18), ringed on step 6, and clears when the aligned INS goes to NAV (ATT if the knob is at ATT). Its range and CDI flags are not drawn, so the readouts show values throughout.
- The throttle has an "Idle + 10% RPM" stop for the EPU check; it is not a detent in the jet.
- The altimeter mode lever swings 6° right to PNEU (30° left to ELEC) so it clears the corner screw; the guide says it is held momentarily to either.
- Mission-dependent steps use one illustrative choice: UHF function to BOTH; exterior lights by day (MASTER NORM, ANTI-COLL 1, position lights BRT); HMCS symbology 50%. The DTC load and HMCS alignment on the DED are not modelled beyond the button presses.

## Illustrative, not sourced
- The alignment is compressed to about 20 seconds; the DED page times (0.0/99, 0.5/90, 0.8/62, 1.1/30, 1.5/10) are assumed stages. The status meanings (99, 90, 62, 10) and RDY/ALIGN behaviour are the guide's; the INS DED page layout and its asterisks on LAT follow the guide's figure on p. 170. The true heading (232.0°) is illustrative.
- Engine indications (RPM 68%, SEC idle 64%, MIL 92%, nozzle closing to 8% in SEC) are illustrative inside the guide's limits (nozzle 10% or less in SEC, above 94% in PRI, RPM 85% at MIL). The SEC check and EPU check may instead be done before takeoff, as the guide says.
- Altimeter: starts with a PNEU flag and 29.92; the 29.97 setting and the PNEU reading 25 ft above ELEC are assumed to show the ±75 ft check.
- PROBE HEAT flashing, the lamp tests' horn and voice alerts are not modelled (the caution lights steadily).

## Unverified in the sim
- That the DED shows the INS page automatically when the INS knob goes to STOR HDG (the guide says it does for NORM and STOR HDG).
- That turning the INS knob through ALIGN NORM on the way to NAV does not restart the alignment.
- Whether the HUD ALIGN cue replaces the maximum G readout in the lower left exactly as drawn (the guide figure p. 171 shows it at lower left).
