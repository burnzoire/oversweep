# Four-Ship and Display Formations — source evidence

Short excerpts, with page references, behind the claims in the Four-Ship and Display
Formations module (`src/pages/manual/formation-flying/_Division.astro`), its model
(`src/lessons/formation/division-model.mjs`) and the terms added to
`content/encyclopedia/terminology/formation.md`. They are review evidence, not a copy
of the sources, and not instructions to the reviewer.

```review-sources
source: https://patchwiki.biligame.com/images/falconbms/f/fc/gydmumyx1j1cbxoeofygk3pgl1hk8w5.pdf
pages: 13; 47-48; 61; 63-70
```

```review-sources
source: https://www.cnatra.navy.mil/tw4/vt35/assets/docs/training/tiltrotor-form-procedures.pdf
pages: 9; 81-83; 85
```

```review-sources
source: https://assets.publishing.service.gov.uk/media/6970ee71011505255b2d42fd/RA2335_Issue_14.pdf
pages: 2-4; 6-7; 21-23
```

```review-sources
source: https://assets.nicepagecdn.com/272793ad/6169412/files/FASTFormationVer3.014Nov2024-compressed_2.pdf
pages: 8-13; 22-24; 29; 35; 37
```

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/e78/33zl8132hi71d3tv0194vvkzpzl3mrr6/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf
pages: 293-295
```

**Retrieval.** All sources were read on 10 November 2026 and reduced to text with
Poppler `pdftotext -layout`; figures were checked as rendered pages. The `pages:` lines
are PDF pages. In CNATRA P-1288 printed page 1-3 is PDF 13, 5-7 and 5-8 are PDF 47–48,
6-9 is PDF 61 and 7-1 to 7-8 are PDF 63–70. In RA 2335, the FAST guide and the DCS
F-16C guide the printed page is the PDF page. The VT-35 brief has no page numbers and is
cited by slide title; cnatra.navy.mil serves it only with the TrustID intermediate certificate (see `scripts/prepare_review_sources.py`), and slides 81–82 were checked as rendered pages. Slide 82 draws three aircraft and gives no −4 assignment. Check each quotation against independently retrieved text, and
treat a wording mismatch as a finding against this record.

**Military sources first.** P-1288 is a Navy publication cleared for public release; the
CNATRA public publications folder now returns 404, so a third-party copy is cited. Air
Force AFMAN 11-248 and the T-6/T-38 formation guidance were not found on a readable public
host. No US military display-team publication was found; the UK MAA regulation is the
military display source. The FAST guide is civilian and supplementary, used only for the
close four-ship configurations, configuration changes and signals.

## [1] CNATRA P-1288 (Rev. 01-23), Tactical Formation T-45 Strike, 23 January 2023

| Page | Passage | Module use |
| --- | --- | --- |
| 1-3 | Combat spread: "Wing will fly on Lead's 90-degree bearing line (abeam or 3/9 line) at a distance of .8 to 1.0 nm, and 1,000 ft above or below Lead's altitude at 300 KIAS" | Tactical intro |
| 5-7 | Tac turn "flow heading changes by 90 degrees, and the Fighters swap sides"; wing begins "just prior to being able to look down Lead's intakes" | Turns; Figure 3 |
| 5-8 | In-place turn "changes flow heading by 180 degrees, and causes the Fighters to swap sides … Both Fighters should begin and finish their turn at the same time" | Turns; Figure 3; term |
| 6-9 | Tac wing "Lead's cruise bearing line or aft, 0.2-0.6 nm, and no lower than 1,000 ft below Lead's altitude"; "utilize geometry to flow to the outside and inside of the turn" | Tactical table; Figure 2; term |
| 7-1 | "tactical doctrine for Large Force Employment has, at its core, several divisions"; rendezvous "As -4 … be sure to put -3 between your aircraft and the lead section"; division wall "four fighters line abreast in combat spread … -1 and -3 at 0.8-1.0 nm abeam … -2 and -4 maintaining the same abeam distance … An altitude de-confliction game plan will be briefed" | Lede; Example; Tactical; Admin |
| 7-2 | Figure 7-1 (Lion 12, 11, 13, 14 left to right, altitudes 12, 11, 13, 14); fluid four "-1 and -3 in combat spread … wingmen in Tac Wing … 'Standard Formation' or 'ATC Spread,' in which all aircraft are within 1nm and 100' feet"; "Lion, flow 360, deploy." "No response is required"; -4 to Tac Wing off -3 then to Combat Spread | Example; Tactical; Figure 2 |
| 7-3 | Yardstick example "-1 40X, -2, 103X, -3 104X, and -4 41X"; collapse to parade, "cleared to join", "As -4, you must keep -3 between yourself and -1"; fence-out calls; battle damage checks | Admin; Example |
| 7-4 | Tactical rejoin; maneuvers "initiated by the Division Lead with no response required … 300 KIAS and 14 units AOA"; wall tac turn "The wingman on the outside of the called turn will simply turn for 90 degrees … Each subsequent aircraft will turn when the preceding aircraft's intakes are approaching. Only tac turns for 90 degrees" | Turns; Figure 3; Admin |
| 7-5 | In-place turns in wall "generally used to egress a target area after executing simultaneous air-to-surface target attacks … Only turns requiring 180 degrees" | Turns |
| 7-6 | Tac turns in fluid four (section lead turns into the other, wingman flows to inside, second wingman ends "on the outside of the formation looking through his/her Section Lead") | Turns |
| 7-7 | In-place turns in fluid four | Turns |
| 7-8 | Flight sequence | Example |

## [2] VT-35, Tiltrotor Formation and Aerial Refueling Procedures, 29 September 2021

| Slide (PDF page) | Passage | Module use |
| --- | --- | --- |
| Formation Description (9) | "Section = 2 aircraft … Division = 3 or 4 aircraft, largest maneuver element or two sections … Flight = 2 or more maneuver elements / 5 or more aircraft" | Organisation; term |
| Division Combat Cruise (81) | Sections in combat cruise; 0.5 NM; "-3 Sets Interval", "-2 Balances Flight", "Heavy Left"; 30° and 45° lines | Tactical; Figure 2 |
| Division IIMC Breakup Packages (Echelon/Parade) (82) | Lead: base heading, "BASE ALTITUDE +1000 FEET"; -2: maintain sight, if lost "TURN 30° AWAY … RETURN TO BASE HDG AFTER 30 SECS", "CLIMB, TO BASE ALTITUDE +500 FEET"; -3: "CONTINUE TURN 60° AWAY FROM BASE HDG … AFTER 30 SECS", "CLIMB TO BASE ALTITUDE"; comms; "ALL ACFT SHOULD BEGIN SQUAWKING"; reversal "DASH 3 to base heading, DASH 2 to base heading minus 30 degrees, LD to base heading minus 60 degrees" | Lost sight; quiz |
| Balanced Division (Combat Cruise) (83) | "ASSIGNMENTS PER POSITION REMAIN THE SAME … REGARDLESS OF THE FLIGHT'S GEOMETRY" | Lost sight |
| Fluid Four (85) | "Flight in Combat Spread; Sections in Combat Cruise; Wingman on outside; Wingman change sides during large turns to remain on outside using radius of turn" | Tactical table |

## [3] UK MAA RA 2335 Issue 14, January 2026

| Page | Passage | Module use |
| --- | --- | --- |
| 2 | Crowd line "the closest edge of any area … accessible to Spectators"; display area MSDs | Term |
| 3 | 12. Display Team "A single, formation or group of Aircraft … flying as one single display 'act' throughout"; 24. Flypast "without manoeuvring … will not include Aerobatic Manoeuvres but may include up to 3 pre-planned passes"; 25. High Energy ">1200 kg" | Display; terms |
| 4 | High energy "or if the Aircraft display speed >150 KIAS" | Display |
| 6 | Footnote 24 "A Display Team is classed as a single Display Item" | Display |
| 7 | Table 1 note "Any Flying Display with a High Energy Display Team of 3 or more Aircraft should be categorized as a minimum Tier 2" | Display |
| 21 | Table 5 weather minima: formations 1000 ft / 5 km; aerobatic piston formations 1000; jet/turboprop formations 1500; para 99 "Aerobatic Manoeuvres – All Aircraft. 500 feet MSD" outside the display area | Display table |
| 22 | Table 6: fixed wing 100/100/300, fixed-wing close formation 250/300/300 ft | Display table; terms |
| 23 | para 102c "230 m"; "(1) High Speed Aircraft … in excess of 300 KIAS … towards a Spectator Area … 450 m"; d. dual spectator areas | Display table |

## [4] FAST, Formation Pilots' Knowledge Guide v3.0, 14 November 2024

| Page | Passage | Module use |
| --- | --- | --- |
| 8 | #1–#4, two elements, #3 deputy lead; "#4 will fly off #3"; "never more than two aircraft in an element"; basic configurations "fingertip, echelon, and trail" | Organisation; Close |
| 9 | Fingertip strong left/right; bearing line "normally in the 30° to 45° range aft of Lead"; changes "executed from the fingertip position"; vic with phantom #4; 5-ship vic | Close; Figure 1 |
| 10 | Echelon "used in the traffic pattern, and to position aircraft for pitchouts … Lead can only turn away"; trail close, extended, tail chase | Close; Figure 1 |
| 11 | Diamond: "#4 … into the 'slot' … often used as a building-block to assemble mass formations" | Close; Display |
| 12 | Route "two to four ship-widths out to a maximum of 500 feet"; rudder wag; wing rock; "stack down when inside the turn and fly echelon when outside" | Close; Signals |
| 13 | Phantom wingman | Organisation |
| 22 | "significant change in the dynamics of the flight"; 4-ship fingertip turn "outside aircraft will stack up while the inside aircraft will stack down"; "Lead will not exceed the capabilities of the least proficient wingman" | Lede; Close |
| 23–24 | Cross-under from 4-ship fingertip gives echelon; signals #3 first then #2; double-pump; element cross-under, "#4 will cross #3's six"; errors | Changes; Signals |
| 29 | Diamond signal and transition | Changes; Signals |
| 35 | Lead change, stable platform, signals and radio calls | Lead change |
| 37 | Pitchout and straight-ahead rejoin, "+10 knots or +10%", "200'-500'" | Pitchout |

## [5] DCS: F-16C Viper Early Access Guide

| Page | Passage | Module use |
| --- | --- | --- |
| 293 | 4-ship flights of two elements; close formation hinders SA; line abreast close 1 NM, open 1½ NM | Sim panel |
| 294 | Trail 1 / 1½ NM; wedge; echelon close ⅓ NM | Sim panel |
| 295 | Finger four close 250 ft, open 500 ft; spread four elements ½ / 1 NM, wingmen 250 / 500 ft | Sim panel |

## Derived and invented content

- The opening sortie is invented and labelled; each step's procedure is cited.
- Figure 1 draws bearing lines at 35° (inside the 30–45° range) with schematic spacing.
- Figure 2 draws tac wing at 0.4 nm, 45° aft (the source gives 0.2–0.6 nm on the cruise bearing line or aft, but no angle), and lays out division combat cruise after the VT-35 slide, where only the 0.5 nm interval is given.
- Figure 3 uses an illustrative 0.3 nm turn radius at 300 KIAS; tac turn delays are computed so the flight rolls out line abreast, standing in for the "intakes approaching" cue.
