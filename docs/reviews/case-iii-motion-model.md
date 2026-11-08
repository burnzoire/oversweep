# Case III trainer: speed, motion and marshal timing (issue #39)

Trainer revision 9. This record covers the audit of the old motion model, the
sources checked, the model now used, and what remains unverified.

## Previous behaviour (revision 8), reproduced from the code

| Item | Revision 8 | Consequence |
| --- | --- | --- |
| Map movement outside the hold | `x += sin(h)·v/3600·dt`, where `v` is the displayed KIAS | 250 KIAS at 6,000 ft plotted at 250 kt; ISA true airspeed is 273.4 kt (8.6% short). |
| Wind and ship | None; Mother was a stationary point | Against a carrier making 15 kt into a 10 kt wind, closure inbound would be 248 kt and opening outbound 298 kt; both plotted as 250. |
| Hold path | `holdPosition(t)`: closed-form racetrack at a fixed 250 NM/h, independent of commanded KIAS | Commanding 300 KIAS in the hold changed the airspeed readout but not the path or timing; every circuit was exactly 360 s. |
| Hold entry | Position snapped to the fix and heading to BRC when within 0.7 NM | A jump of up to 0.7 NM and any heading change, at entry. |
| Hold exit | `waiting` mode held the aircraft stationary at the fix until EAT | EAT was `ceil((t + d/250·3600 + 380)/60)·60` from the inbound call. After one 360 s circuit the aircraft sat still at the fix for about 20–80 s (more if navigation was indirect). |
| EAT assessment | ±10 s at the fix, met by waiting | Timing was never managed by flying; the exercise could not teach adjusting the pattern. |

## Sources checked

1. **CV NATOPS, NAVAIR 00-80T-105, 31 July 2009.** Publisher: COMNAVAIRSYSCOM.
   Read 8 November 2026 from a [third-party PDF mirror](https://server.3rd-wing.net/public/Bureau_VF31/Docs%20F-14%20r%C3%A9el/CV-NATOPS-JUL09.pdf)
   with `pdftotext -layout`.
   **Rights:** the title page carries Distribution Statement C (US Government
   agencies and their contractors). The manual is not copied, uploaded or
   quoted here. It is cited by locator, and its content is paraphrased only,
   from a publicly reachable mirror the trainer notes already link to. The
   2009 edition may not be current.
   - §6.4.1.1, p. 6-6: the jet and turboprop marshal pattern is a left-hand racetrack of six minutes. Its inbound leg passes over the holding fix, and the fix is defined relative to the expected final bearing, not BRC.
   - §6.4.4, p. 6-8: each pilot manages the holding pattern so as to leave marshal at the assigned EAT. Early or late departures are reported to marshal.
   - §6.4.7.2, p. 6-9: jets and turboprops descend at 250 KIAS and 4,000 ft/min to platform, then at 2,000 ft/min. Transition to landing configuration normally starts at the 8-nm fix.
   - Glossary p. 20, 8-nm DME fix: jets cross it level at 1,200 ft and 250 KIAS, and normally begin the landing-configuration transition there.
   - Glossary p. 22, 6-nm DME fix: jets cross it level at 1,200 ft in landing configuration.
2. **CNATRA P-816 (01-14), CV Procedures (UMFO), T-45C.** [murphysys.com mirror](https://murphysys.com/dcs/P-816.pdf). No distribution statement was found in the extracted text. It is already the module's source [1].
   - p. 2-19: ideally, the marshal fix is the 180° radial relative to BRC. This is the basis for the trainer's BRC-referenced fix.
   - p. 2-20: "Two-minute turns and one-minute legs are normally used for the pattern." Strict management of the pattern is needed to arrive at the fix at push time; its example uses one 6-minute and one 5-minute pattern. The aircraft must be at the fix on airspeed (250 kt), ready to commence at EAT plus or minus 10 seconds.
   - p. 2-26: landing checks start at 10 DME, the aircraft crosses 6 DME at 150 kt, and the gear is down by 8 DME.
   - Glossary, "Axial Winds": wind down the ship's axis created by the ship's forward movement.

## Model now used (revision 9)

- **KIAS to TAS.** ISA density ratio σ = (1 − 6.8756×10⁻⁶·h)^4.2559; TAS = KIAS/√σ, treating IAS as EAS. 250 KIAS: 273.4 KTAS at 6,000 ft, 254.4 at 1,200 ft. Compressibility and position error are ignored (a few knots at these speeds).
- **Carrier frame.** Everything is plotted relative to Mother. The TACAN and the marshal fix move with her (they are a radial and DME from the ship).
- **Wind and ship.** Fixed exercise assumptions, not procedure: ship 15 kt on BRC, natural wind 10 kt from BRC. Relative to the ship, that is 25 kt of wind over the deck along its axis, from the bow. P-816's "axial winds" names only the part the ship's movement makes. Not configurable: the exercise needs one steady, visible effect on timing, and a fixed axial value keeps the debrief comparable between sorties.
- **Wind correction.** The direct heading help and the final-bearing tracker crab for the airflow, so the displayed track, bearings and ranges match the flown path.
- **Hold.** Left-hand, 1.5°/s turns (two minutes per 180°, P-816 p. 2-20), with the inbound leg crossing the fix (CV NATOPS §6.4.1.1). The inbound course is BRC because the trainer places the fix on the 180° radial from BRC (P-816 p. 2-19), not from the expected final bearing as CV NATOPS does. The outbound leg is set by the player in seconds and timed once on the outbound course. The pattern drifts with the airflow, so the same leg times give a different circuit time from still air:

  | Airflow along the deck | Outbound | Circuit |
  | --- | --- | --- |
  | Calm, ship stopped | 60 s | 360 s (the six-minute pattern) |
  | 25 kt | 29.8 s (one-minute inbound) | 330 s |
  | 25 kt | 60 s | 396 s |

- **Entry and exit.** The hold starts at the aircraft's actual position and heading. The pilot turns to the outbound heading in whichever direction reaches the outbound course sooner, then intercepts it. There is no jump at entry, and no waiting at the fix: the exit is the inbound fix crossing.
- **EAT.** Assigned at the inbound call as the predicted transit plus 10 minutes, rounded up to the minute, so every entry can make it with one adjusted circuit or two. Commencing is accepted over the fix within ±10 s of EAT (P-816). An amended EAT is placed after the next circuit the player can still adjust.

The deterministic checks are in `tests/case-iii/model.cjs` (TAS, ship-relative velocity, crab, calm 360 s baseline, 120 s turns, racetrack geometry, 25 kt circuit arithmetic, time/distance on a straight leg, entry and exit continuity, EAT outbound solutions in calm and wind) and `tests/case-iii/sortie.cjs` (planned crossing coaching, pause over the fix, early crossing, late EAT amendment, ten full sorties, plotted motion against KIAS and TAS outside the hold and on final).

## Unresolved

- **10 DME slowing.** The trainer asks for 200 KIAS from 10 DME and configuration at 8 DME. CV NATOPS has jets at 250 KIAS level at the 8-nm fix, beginning the transition there, and configured by 6 nm; P-816 starts landing checks at 10 DME and crosses 6 DME at 150 kt. The trainer's 10 DME cue is between the two and stays labelled as an exercise setpoint.
- **135 KIAS on-speed, 280/225 KIAS gear/flap gates.** Still unverified for the F-14B; labelled as exercise values.
- **Hold entries.** Real direct, parallel and teardrop entries are not modelled.
- **Wind direction.** Real recovery wind need not be axial; a crosswind component would add crab on the inbound leg and drift across it. Not modelled.
- **Applicability.** The two-minute turns and the ±10 s EAT tolerance come from a T-45C UMFO training publication (P-816) and are applied here to an F-14B exercise. CV NATOPS gives the six-minute pattern and the duty to depart at EAT, but neither a turn rate nor a tolerance.
- **Source currency.** The CV NATOPS edition is 2009 and read from a third-party mirror; the current edition was not available.
