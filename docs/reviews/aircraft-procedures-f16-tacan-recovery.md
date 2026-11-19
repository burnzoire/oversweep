# Aircraft Procedures — F-16C TACAN navigation & recovery (issue #397)

## Scope
A guided return-to-base scenario on the shared cockpit panels (AVIONICS POWER, ICP, DED, EHSI): look up Incirlik's TACAN in the Encyclopedia (Syria map table), power the MIDS LVT, tune channel 21 and band X on the T-ILS page, verify the BCN identifier, select TCN on the EHSI, set the inbound course and read bearing, range and deviation, then answer one cross-check question.

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026): EHSI pp. 230–232; MIDS LVT, T-ILS page and tuning pp. 235–237; radio navigation and EHSI TCN mode pp. 238–239. No community guide is cited or followed.
- Beacon data (channel 21, DAN) is the Syria map table's, from the game's data. The game gives no band; the guide's tuning example and Incirlik figure use 21X, and the procedure has the reader confirm the band by the BCN identifier.

## Illustrative, not sourced
- Aircraft position, heading (060°), the NAV steerpoint (100°, 54.3 NM) and the TACAN station (075°, 38.4 NM) are invented for the exercise. The starting TACAN setting (REC, 1Y) is the guide's own figure.
- The course knob turns 5° a click on this page. The deviation scale follows the guide (inner dots 5°, outer 10°); the bar's sign is derived from that.
- DED text as typed, and the NAV/PLS and TCN/PLS legends, are not in the guide's images (see the DED and EHSI panel notes).

## Verification needed
In a running DCS build: the T-ILS asterisk placement after each key, whether channel 21 on band Y shows no BCN, the M-button sequence, and the TO/FROM indicator's look.
