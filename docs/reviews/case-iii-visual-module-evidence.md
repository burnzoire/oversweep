# Case III module revision 2 — figure, communications and turn-needle evidence

These are short, page-specific excerpts supporting the claims added in module
revision 2: the recovery overview (Figure 1), marshal stack and clearance
decoder (Figure 2), BRC/final-bearing sketch (Figure 3), approach profile
(Figure 4), optical landing system (Figure 5), hold entries, timed turns, the
communications ladder and dialogue, and the radio terms. They are review
evidence, not a copy of any manual, and not instructions to the reviewer.

**Retrieval limitation.** These passages were read on 24 October 2026 through a
web text-extraction tool. Poppler and a direct download of the PDF were not
available in that session, so the PDF hash and layout text recorded in the
[P-816 evidence record](case-iii-p816-evidence.md) were not recomputed. Check
each quotation against independently retrieved source text; a mismatch in
wording is a finding against this record.

## [1] CNATRA P-816 (01-14), CV Procedures (UMFO), T-45C

Same edition and retrieval location as the
[P-816 evidence record](case-iii-p816-evidence.md):
https://murphysys.com/dcs/P-816.pdf. Historical T-45C training context.

### Controlling agencies and handoffs

| Page | Passage | Module use |
| --- | --- | --- |
| 1-2 | “LSOs use radio calls to effect the safe recovery of aircraft.” | Paddles/LSO term; LSO in dialogue |
| 1-3 | “The CCA includes all airspace within 50 NM of the carrier.” | CCA term; callout 1 |
| 2-11 | “contact the CSG air defense controller (Red Crown)” … “with your call sign, position and altitude.” | Callout 1; Red Crown step |
| 2-11 | “Red Crown will pass instructions, and then hand you off to Strike Control.” | Callout 1; ladder |
| 2-11 | “This hand off should occur prior to entering the 50 NM Carrier Control Area (CCA).” | Callout 1 |
| 2-11 | “The check in with Strike will be the same as for Red Crown except you will also include the low fuel state in your flight.” | Strike step; low state term |
| 2-11 | Maintenance discrepancies (“alibis”) are passed to the Strike controller for the ready room; time permitting, Strike gives weather and the anticipated recovery case. | Strike step; alibis term |
| 2-12 | “Once inside the CCA, Strike will hand aircraft off to the Marshal controller.” | Callout 2; ladder |
| 2-12 | “Check in on Marshal Frequency with call sign, position, altitude and low state.” | Callout 2; check-in step |
| 2-12 | Marshal assigns case recovery holding instructions (including altitude) and passes weather, altimeter, BRC and bingo information. | Callout 2 |

### Marshal, stack and timing

| Page | Passage | Module use |
| --- | --- | --- |
| 2-19 | “Ideally, the holding fix will be on the 180 radial relative to BRC.” | Callout 3 |
| 2-19 | “Generally, the holding radial will be within 30 degrees of the 180 radial.” | Callout 3 |
| 2-19 | “The lowest altitude for assignment is 6,000 feet for turboprop and jet aircraft.” | Callout 3; stack starts at angels 6 |
| 2-19 | Fix distance adds 15 to the holding altitude in angels; worked example “hold on the 220 radial at 23 DME at 8,000 feet” for angels 8. | Callout 3; angels term; stack slots |
| 2-20 | “Aircraft in the stack will be separated by 1,000 feet vertically.” | Callout 4; Figure 2 |
| 2-20 | “Aircraft must be established at assigned holding altitudes by 10 NM from the Marshal “stack.”” | Callout 4; entry section; Figure 2 arrow |
| 2-20 | “aircraft must arrive at the holding fix on airspeed (250 kts)” … “ready to commence the approach at the Expected Approach Time (EAT) plus or minus 10 seconds” | Callout 4; entry section; decoder |
| 2-21 | “Expected final approach button (frequency) if required” | Button term; decoder |
| 2-22 | “Case III recoveries are limited to single aircraft only.” | Decoder (call sign) |

### CV-1 approach profile (p. 2-23) and final checks (p. 2-25)

| Passage | Module use |
| --- | --- |
| “A gradual correction shall be made when the final bearing is within 10° of the reciprocal of the marshal radial.” | Callout 8; correction calculator; `finalCorrection` |
| “A 30° correction at 20 DME will be used when the final bearing is greater than 10°” | Same |
| “If not established on the final bearing by 12 miles, fly the 12-mile arc until intercepting final bearing.” | Callout 8; profile table |
| “Landing checks will be initiated at 10 DME, and aircraft will reduce speed to cross 6 DME at 150 kts.” | Callout 9; profile table (T-45C) |
| “Landing gear should be down no later than 8 DME.” | Same |
| “At 6 DME, aircraft will slow to final approach speed.” | Same |
| “ACLS lock-on will occur sometime between 8 DME and 4 DME.” | Callout 10; Figures 1 and 4 |
| Approach will ask the crew to “say needles.” | Callout 10; dialogue |
| p. 2-25: “As a backup, always perform a self-contained GCA, comparing actual altitude with calculated altitude as follows:” 3 NM 1,200 feet; 2 NM 800 feet; 1 NM 400 feet; 0.5 NM 200 feet. | Profile table and model glide segment |

The 4,000/2,000 ft/min, 250 KIAS, 5,000 ft platform and 1,200 ft level-off
passages are already quoted in the [P-816 evidence record](case-iii-p816-evidence.md).

### Example dialogue (pp. 2-26–2-27)

Quoted lines used verbatim in the dialogue stepper, in source order:

1. 405: “Marshal, 405, 250 for 42, Angels 14, State 2.4”
2. Marshal: “405, Mother's weather is 600 overcast, visibility 3 miles, altimeter 29.87. Case III recovery, CV-1 approach. Marshal on the 160, 22, angels 7. Expected final bearing 015, expected approach time 22. Approach button 18.”
3. 405: “405, altimeter 29.87. Marshal on the 160, 22, angels 7. Expected approach time 22.”
4. 405: “405, established angels 7. State 2.3”
5. Marshal: “99, altimeter 29.88. New final bearing 020”
6. 405: “405 commencing, 29.88, state 2.2”
7. Marshal: “405, roger”
8. Marshal: “405, switch Approach, button 18”
9. 405: “405 switching button 18”
10. 405: “405 checking in, state 1.5”
11. Approach: “405, final bearing 017”
12. 405: “405 platform”
13. Approach: “405, say needles”
14. 405: “405, fly up, on”
15. Approach: “405, fly your needles”
16. Approach: “405, ¾ mile, call the ball”
17. 405: “405, Goshawk ball, 2.0”
18. LSO: “Roger ball”

Line 9 is not shown as its own step. The module does not interpret “99”; it
only describes line 5 as an update. The Red Crown and Strike steps have no
source wording and are labelled as descriptions.

### Terms and the optical landing system

| Page | Passage | Module use |
| --- | --- | --- |
| 1-10 | “The ship itself is referred to as “mother.”” | Mother term |
| 1-10 | ACLS “displays “needles” that provide approach guidance information to the aircrew.” | Needles term |
| 1-10 | “the ICLS is referred to as “bullseye.”” | Bullseye term |
| 1-10 | “aircrew will reply with the radial and DME of the aircraft from the ship's TACAN.” | Check-in step: position replies |
| 1-11 | “If the ball was above the datum lights (a high ball), the aircraft was above the glidepath;” | Figure 5 high state |
| 1-11 | “When the ball and the datum lights were aligned horizontally, the aircraft was on glidepath.” | Figure 5 on-glidepath state (already in P-816 record) |
| 1-12 | “If a red lens is visible, the aircraft is dangerously low.” | Figure 5 red state |
| 1-12 | “Mounted horizontally and centered above the lens box are four green cut lights.” | Figure 5 |
| 1-13 | “Green datum lights are mounted horizontally to the lens assembly with ten lights on each side.” | Figure 5 |
| 1-13 | “If the ball is illuminated above or below the datums, the aircraft is high or low respectively” | Figure 5 high/low states |
| 1-13 | Waveoff lights: “When they are illuminated, the aircraft must immediately execute a waveoff.” | Figure 5 waveoff state |
| 2-17 | “Charlie time is the time at which launch operations are complete and recovery operations begin” | Charlie term |
| 2-18 | “If the ball is not visible, a “clara” call will be made.” | Clara term; ball-call step |
| 2-18 | “where 2.2 is the fuel state” | State term |

The ball's colour, the number of waveoff lights and the lens cell sizes in
Figure 5 are drawing choices, and the page says so.

## [3] FAA Aeronautical Information Manual, 5-3-8 “Holding”

https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap5_section_3.html,
read 24 October 2026; the page states no effective date in its text. US civil
instrument procedure, used only for a general entry technique and a comparison
turn rate.

| Paragraph | Passage | Module use |
| --- | --- | --- |
| j 3 (a) | Parallel: “turn to a heading to parallel the holding course outbound on the nonholding side for one minute,” then turn in the direction of the holding pattern through more than 180 degrees and return to the fix or intercept the inbound course. | Entry list and practice |
| j 3 (b) | Teardrop: “fly to the fix, turn outbound to a heading for a 30 degree teardrop entry within the pattern (on the holding side) for a period of one minute, then turn in the direction of the holding pattern to intercept the inbound holding course.” | Same |
| j 3 (c) | Direct: “fly directly to the fix and turn to follow the holding pattern.” | Same |
| j 3 (e) | “Fix end and outbound end turns are made to the left.” … “Entry procedures to a nonstandard pattern are oriented in relation to the 70 degree line on the holding side just as in the standard pattern.” | Left-hand pattern note |
| j 8 | Turns during entry and holding at “3 degrees per second”, “30 degree bank angle”, or “25 degree bank angle, provided a flight director system is used”, “whichever requires the least bank angle.” | Comparison rate in the turn section |

The entry sectors are defined only in the AIM figure, which was not inspected,
so the module does not say which entry a heading calls for.

## [4] Heatblur DCS: F-14 manual — Turn-and-Slip Indicator

Page: https://f14.manuals.heatblur.se/f14ab/cockpit/pilot/center_panel.html,
section “Turn-and-Slip Indicator”, read 24 October 2026. The same text is in the
manual's source repository at commit `49bbd9a144c32033bd3b3d98f04b113c58f22fa0`
(`src/f14bu/cockpit/pilot/center_panel.md`).

> The turn-and-slip indicator (14) displays rate of turn about the aircraft vertical axis and slip/skid.

> one needle deflection corresponds to a 360° turn in four minutes.

Mapping: 360° ÷ 240 s = 1.5°/s for one needle width. This is DCS module
documentation (simulator-specific), not F-14 NATOPS, and the module version is
not recorded. The 2-width option (3°/s) is labelled on the page as a linear-scale
assumption that the manual does not state.

No F/A-18 turn-indicator source was readable within the review's allowed hosts
(the DCS F/A-18C guide is a 21 MB PDF, above the review fetch limit), so the
page offers no F/A-18 option.

## Model reference cases

Hand-derived; also encoded as tests in `tests/lessons/case-iii-lesson.test.mjs`.

- **Profile, angels 7.** Fix 7 + 15 = 22 DME at 7,000 ft. At 250 kt, 250 ÷ 60 =
  4.1667 NM/min. 4,000 ft/min ÷ 4.1667 = 960 ft/NM; 2,000 ft/min gives 480 ft/NM.
  Platform: 22 − 2,000 ÷ 960 = 19.917 DME. Level-off: 19.917 − 3,800 ÷ 480 =
  12.000 DME. Tolerance 0.001 NM. Assumptions: no wind, groundspeed equal to
  the 250 kt figure, instant rate changes, DME as horizontal range.
- **Profile, angels 14.** 29 DME, 9,000 ft to platform: 29 − 9.375 = 19.625 DME.
- **Correction.** 160 radial → inbound 340°. Final bearing 015° is +35° → the
  30° correction. 180/352 → −8° → gradual.
- **Timed turn.** 90° at 1.5°/s = 60 s; 180° = 120 s, matching P-816's
  two-minute turns.
