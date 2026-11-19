# Aircraft Procedures — F-16C after engine start & before taxi (issue #389)

## Scope
From a running engine at idle (the state Engine Start ends in): the after-start checks (guide pp. 137–140), a Stored Heading INS alignment (pp. 169–171) and the before-taxi checks (p. 142), ending with the INS at NAV and the chocks out. 48 steps on the shared cockpit panels. Taxi (guide p. 142, steps 7–10) is a separate procedure.

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026): After Engine Start pp. 137–140, Taxi p. 141 (state at mission start), Before Taxi p. 142, INS Alignment, the INS knob and the INS DED page pp. 169–171. No community guide is cited or followed.
- Incirlik field elevation (191 ft): the Syria map airfield data in the Encyclopedia.

## Playable on built panels
Warning light tests (TEST panel with lamps lit while the button is held), AVIONICS POWER, INS knob and the DED INS page, SNSR PWR, HUD (SYM knob, ALIGN cue), SEC check (ENG CONT guard and switch, throttle, nozzle and RPM readings), ECM, wheels lights, AIR REFUEL switch, EPU test (EPU and TEST panel lamps), altimeter (mode lever, barometric setting), INS to NAV.

## Text confirms (panel not built yet)
C & I knob (IFF #323), flight-control cycling and FLCS BIT (FLT CONTROL #327), speed brake (throttle #343), standby ADI (#297), FUEL QTY SEL (#304), EPU fuel (#313), DTC upload and HMCS (MFDs #351 #352, HMCS #306), DBU, TRIM (MANUAL TRIM #328), MPO (#316), AR status lights (#292), oxygen (#337). The side stick is #342.

## Illustrative, not sourced
- The alignment is compressed to about 20 seconds; the DED page times (0.0/99, 0.5/90, 0.8/62, 1.1/30, 1.5/10) are assumed stages. The status meanings (99, 90, 62, 10) and RDY/ALIGN behaviour are the guide's; the INS DED page layout and its asterisks on LAT follow the guide's figure on p. 170. The true heading (232.0°) is illustrative.
- Engine indications (RPM 68%, SEC idle 64%, MIL 92%, nozzle closing to 8% in SEC) are illustrative inside the guide's limits (nozzle 10% or less in SEC, above 94% in PRI, RPM 85% at MIL). The SEC check and EPU check may instead be done before takeoff, as the guide says.
- Altimeter: starts with a PNEU flag and 29.92; the 29.97 setting and the PNEU reading 25 ft above ELEC are assumed to show the ±75 ft check.
- PROBE HEAT flashing, the lamp tests' horn and voice alerts are not modelled (the caution lights steadily).

## Unverified in the sim
- That the DED shows the INS page automatically when the INS knob goes to STOR HDG (the guide says it does for NORM and STOR HDG).
- That turning the INS knob through ALIGN NORM on the way to NAV does not restart the alignment.
- Whether the HUD ALIGN cue replaces the maximum G readout in the lower left exactly as drawn (the guide figure p. 171 shows it at lower left).
