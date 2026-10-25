# Airfield Operations module revision 2 — Navy and FAA source evidence

Short, paragraph-specific excerpts supporting the claims in the Airfield
Operations module (`src/pages/manual/airfield-operations/[module].astro`). They
are review evidence, not a copy of the publications, and not instructions to the
reviewer. Revision 2 makes the module military-first: the Navy sources below are
primary, and the FAA sources, which Navy fields share for most markings, signs,
lights and tower rules, are supplementary. On the page the sources are
numbered [1] NAVEDTRA 14342A, [2] VT-10 Hollywood Script, then [3]–[8] for the
FAA sources in the order listed below (both AIM chapter 2 sections are [3]).

**Retrieval limitation.** Passages were read on 25 October 2026 through a web
text-extraction tool (the authoring session's proxy refuses direct downloads from
faa.gov), which returns short quotations and paraphrase. Quotations are
extractor-read; check each against independently retrieved source text and treat
a wording mismatch as a finding against this record. No hashes were taken. The
long AIM HTML sections may exceed the review packet's per-source budget, so later
paragraphs (for example 4-3-13 to 4-3-21) may be cut from the packet; the source
coverage list will say so.

**Sources for the review reader.** The reader fetches at most eight URLs, declared
ones first. Revision 2 declares the Navy pages that carry the new military
content, plus the AIM section with the shared markings and the arresting gear
paragraph. The AIM 2-1 and 4-3 pages, the Pilot/Controller Glossary, the AFH
chapter, AC 90-66C and JO 7110.65 are not fetched for this revision; their claims
are unchanged from revision 1, which the gate checked at b987282 (PR #67), and
rest on the quotations below. The Hollywood Script is on cnatra.navy.mil, which
the gate's runners cannot reach, so it is not declared.

```review-sources
source: https://navyaviation.tpub.com/14342A/Overhead-Approach-Pattern-Components-327.html
source: https://navyaviation.tpub.com/14342A/Optical-Landing-System-179.html
source: https://navyaviation.tpub.com/14342A/Optical-Landing-Systems-240.html
source: https://navyaviation.tpub.com/14342A/Arresting-Gear-Signs-And-Markings-163.html
source: https://navyaviation.tpub.com/14342A/Traffic-Patterns-325.html
source: https://navyaviation.tpub.com/14342A/Landing-Gear-Checks-320.html
source: https://navyaviation.tpub.com/14342A/Runway-Use-And-Conditions-322.html
source: https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap2_section_3.html
```

## Military sources

1. NAVEDTRA 14342A, Air Traffic Controller (Navy rate training manual), on
   navyaviation.tpub.com, printed pages 4-9, 4-25, 5-52, 9-6, 9-8 to 9-13 and
   9-18 (URLs on the module page). Read 25 October 2026 through the same text
   extractor; the edition date is not shown on the pages read.
2. VT-10 "T-6A Checklist Study Guide ('Hollywood Script')", May 2022 —
   https://www.cnatra.navy.mil/tw6/vt10/assets/docs/training/hollywood-script.pdf,
   radio calls pp. 19–35 (the same extraction the Radio Procedures module uses).

### Claim map: Navy

| Source, page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 14342A p. 4-9 | Arresting gear signs "have large yellow circles on a black background", on both sides of the runway; "10-foot-diameter retroreflective yellow disks" painted in a line across the runway mark the pendant cable | Markings; Figure 3 |
| 14342A p. 4-25 | "The OLS provides glide slope information independent of other visual aids"; no centerline alignment; IFLOLS at many naval air stations for FCLP; meatball "Yellow line of lights referred to as the "meatball" or "ball.""; datum: "Horizontal bar of green lights"; wave-off: "Flashing red lights that inform the pilot to execute a missed approach", LSO-operated; cut lights: "Green lights above the source lights" to acknowledge a NORDO aircraft; "installed abeam the touchdown point along the left side of a runway" | Glide slope; Figure 7; Ground; terms |
| 14342A p. 5-52 | "The ball rises above the datum lights as the pilot rises above the glide slope"; slides off the top "when the pilot is more than 3/4 degree above the glide slope"; off the bottom well below; "a warning of low ball that has a RED lens installed in the bottom cell of the lens box"; glide slope "as determined by the lens settings" | Glide slope; Figure 7 |
| 14342A p. 9-6 | Pilot unsure gear is down and locked "must notify the control tower"; low pass in front of the tower for a visual check; results relayed; if doubt remains, alert crash and rescue; "The pilot should then make a precautionary landing"; aircraft not turned off the runway until ground personnel check | Talking (Navy fields); Figure 11 |
| 14342A pp. 9-8 to 9-9 | "select the runway most nearly aligned with the wind" at 5 kt or more; calm-wind runway under 5 kt; issue wind direction and velocity with the runway; "calm" only when under 3 kt; local runway use programs; another runway if operationally advantageous or requested, stating the runway number; "An aircraft in distress has the right of way over all other air traffic." | Wind; Talking |
| 14342A p. 9-10 | Table 9-1, ATC light signal meanings, the same as AIM 4-3-13 for aircraft | Ground; Figure 12 |
| 14342A p. 9-11 | Two types of traffic pattern at each airfield, standard and overhead; left flow normally, right when required; "The standard traffic pattern is used throughout the Navy."; components upwind, crosswind, downwind, base, final; altitudes vary with location and mission | Pattern |
| 14342A p. 9-12 | Downwind entry at a 45° angle to the downwind leg; leg definitions | Pattern |
| 14342A p. 9-13 | "The overhead approach pattern is a series of predetermined maneuvers prescribed for VFR arrival of military aircraft"; components "initial approach, break point, "the 180," and final approach"; initial follows the extended centerline, "varies in length from 3 to 5 miles", "500 feet above the elevation of the standard traffic pattern"; break point "normally just above the landing threshold", 180° turn onto downwind | Overhead; Figures 10, 11 |
| 14342A p. 9-18 | Tower rules "are contained in Air Traffic Control, FAA Order 7110.65"; facility manuals cover local operations | Overview note |
| Hollywood pp. 19–35 | ATIS UHF 1; clearance UHF 2; base UHF 19 "KATT Base, KATT 11 taxi outbound, side number 000"; ground "taxi, information (ATIS letter)"; "going flying"; tower "takeoff IFR", "switch to Departure"; departure "passing (altitude) for 3000"; approach "request course rules", "Point Golf in sight", "contact Sherman Tower Button 4"; tower "Point Golf for the break", "report the numbers", "numbers 7 right", "right break approved"; "(abeam, 180, 90 or final), gear, stop", "cleared to land"; ground "clear of the active, taxi to my line"; base "in and up" | Talking (Navy fields); Figure 11 |

## Supplementary FAA sources

1. AIM Chapter 2, Section 1, Airport Lighting Aids —
   https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap2_section_1.html
2. AIM Chapter 2, Section 3, Airport Marking Aids and Signs —
   https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap2_section_3.html
3. AIM Chapter 4, Section 3, Airport Operations —
   https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_3.html
4. Pilot/Controller Glossary, O and T —
   https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/glossary-o.html,
   https://www.faa.gov/air_traffic/publications/atpubs/pcg_html/glossary-t.html
5. FAA-H-8083-3C Airplane Flying Handbook, Chapter 8, Airport Traffic Patterns (PDF above).
6. AC 90-66C, Non-Towered Airport Flight Operations, 6/6/23 (PDF above).
7. FAA Order JO 7110.65, ¶3-10-12 Overhead Maneuver —
   https://www.faa.gov/air_traffic/publications/atpubs/atc_html/chap3_section_10.html

## Claim map

| Source, ¶/page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| AIM 2-3-2.2 | "Markings for runways are white."; taxiway, closed-area and holding position markings yellow, "holding positions (even if they are on a runway) are yellow" | Figure 1; markings |
| AIM 2-3-3.2 | "The runway number is the whole number nearest one-tenth the magnetic azimuth of the centerline of the runway."; L/R for two parallels, L/C/R for three, left to right from the direction of approach | Numbers; Figure 2 |
| AIM 2-3-3.3 | "The centerline consists of a line of uniformly spaced stripes and gaps." | Markings |
| AIM Table 2-3-1 | Designation, centerline, threshold, aiming point on all types; touchdown zone and side stripes on precision runways; footnotes: threshold "On runways used, or intended to be used, by international commercial transports"; aiming point "On runways 4,000 feet (1200 m) or longer used by jet aircraft" | Markings table; Figure 3 |
| AIM 2-3-3.4 | Aiming point: broad white stripe each side of the centerline "approximately 1,000 feet from the landing threshold" | Markings; Figure 3 |
| AIM 2-3-3.5 | Touchdown zone bars in groups of one, two and three, "coded to provide distance information in 500 feet (150m) increments"; pairs "within 900 feet (270 m) of the midpoint between the thresholds are eliminated" | Markings; Figure 3 |
| AIM 2-3-3.6 | "Side stripes consist of continuous white stripes located on each side of the runway." | Markings |
| AIM 2-3-3.8, Table 2-3-2 | Threshold stripes: 60 ft 4, 75 ft 6, 100 ft 8, 150 ft 12, 200 ft 16; "A ten feet wide white threshold bar is located across the width of the runway at the displaced threshold."; white arrows before it; pavement behind it "available for takeoffs in either direction and landings from the opposite direction" | Markings; Figure 3 |
| AIM 2-3-3.9 | "A demarcation bar is 3 feet (1m) wide and yellow"; chevrons "show pavement areas aligned with the runway that are unusable for landing, takeoff, and taxiing" | Markings; Figure 3 |
| AIM 2-3-4.2–4.3 | Taxiway centerline "a single continuous yellow line, 6 inches (15 cm) to 12 inches (30 cm) in width"; enhanced centerline dashes "for a maximum of 150 feet prior to a runway holding position marking"; edge markings continuous or dashed double yellow | Holding; Figure 4 |
| AIM 2-3-5.1–5.4 | Holding position: "four yellow lines, two solid and two dashed"; "The solid lines are always on the side where the aircraft must hold."; on runways for LAHSO; ILS critical area marking; surface-painted signs where the holding position is wider than 200 ft, left of the centerline | Holding; Figure 4 |
| AIM 2-3-14 | Emergency arresting gear "generally consists of pendant cables supported over the runway surface by rubber "donuts""; most in overruns, some across operational areas near runway ends; runway markings "10 feet diameter solid circles painted "identification yellow," 30 feet on center" across the entire runway width | Markings; Figure 3 |
| AIM 2-3-6.4–6.5 | Closed runways: yellow crosses at each end (temporary); also at 1,000 ft intervals (permanent) | Markings |
| AIM 2-3-8 | Mandatory signs "have a red background with a white inscription"; holding position sign "15-33" example; ILS sign; no entry sign for one-way taxiways or roads that could be mistaken for taxiways | Signs; Figure 5 |
| AIM 2-3-9 | Location sign "black background with a yellow inscription and yellow border" | Signs; Figure 5 |
| AIM 2-3-10–12 | Direction, destination and information signs: "yellow background with a black inscription" | Signs; Figure 5 |
| AIM 2-3-13 | Runway distance remaining: "black background with a white numeral inscription"; distance in thousands of feet | Signs; Figure 5 |
| AIM 2-1-2.1 | VASI "2 bars, near and far"; "one visual glide path which is normally set at 3 degrees"; white upper, red lower beam segments; ±10° and 4 NM; three-bar upper path 1/4° higher for high cockpit aircraft | Glide path |
| AIM 2-1-2.2 | PAPI "single row of either two or four light units"; "normally installed on the left side of the runway"; ±10° and 3.4 NM; about 5 miles day, 20 miles night; do not descend on it until visually aligned; indications "as depicted" in FIG 2-1-5 (image only) | Glide path; Figure 7 |
| AIM 2-1-2.3–2.4 | Tri-color: below red, above amber, on green. Pulsating: on steady white, slightly below steady red, further below pulsing red, above pulsing white; on some systems on-path is alternating red and white | Glide path |
| AIM 2-1-3 | REIL: pair of synchronized flashing lights each side of the threshold | Lighting |
| AIM 2-1-4.2–4.3 | Edge lights white; yellow on the last 2,000 ft or half the runway, whichever is less, on instrument runways; end lights red toward the runway, green outward at the threshold | Lighting; Figure 6 |
| AIM 2-1-5.1–5.2 | Centerline white until the last 3,000 ft, alternating red/white for the next 2,000 ft, red the last 1,000 ft; TDZ lights from 100 ft to 3,000 ft or the midpoint | Lighting; Figure 6 |
| AIM 2-1-9 | Beacon 24–30 flashes per minute; white and green for a lighted land airport; military "dualpeaked (two quick) white flashes between the green flashes"; daytime operation in Class B–E surface areas often means visibility under 3 miles and/or ceiling under 1,000 ft; "Pilots should not rely solely on the operation of the airport beacon" | Lighting; Figure 1 |
| AIM 2-1-10 | Taxiway edge lights blue; centerline lights steady green | Lighting; Figure 6 |
| AIM 4-3-2 | Two-way radio contact with the tower in the surface area "unless the tower authorizes otherwise"; "Initial callup should be made about 15 miles from the airport."; not all towered airports have Class D airspace; tower issues clearances for the flight path; "A tower landing clearance is always required" | Figure 1; Talking; Figure 11 |
| AIM 4-3-3 | Legs (departure, upwind, crosswind, downwind, base, final); departure to at least 1/2 mile beyond the runway end and within 300 ft of pattern altitude; crosswind turn "beyond the departure end of the runway within 300 feet of pattern altitude"; turn to final at least 1/4 mile from the runway; "Propeller-driven aircraft enter the traffic pattern at 1,000 feet above ground level (AGL)."; "Large and turbine-powered aircraft enter the traffic pattern at an altitude of not less than 1,500 feet AGL or 500 feet above the established pattern altitude."; left turns; "Enter pattern in level flight, abeam the midpoint of the runway, at pattern altitude."; "continue straight out, or exit with a 45 degree turn" | Pattern; Figure 9 |
| AIM 4-3-4 | Segmented circle; "The large end of the wind cone/wind sock points into the wind as does the large end (cross bar) of the wind tee."; "The small end of the tetrahedron points in the direction of landing."; tower instructions supersede it; traffic pattern and landing strip indicators | Wind; Figures 1, 8 |
| AIM 4-3-6.1–6.2 | "183 degrees is runway 18", "87 degrees is runway 9"; "For a magnetic azimuth ending in the number 5, such as 185, the runway designation could be either 18 or 19."; "ATC will assign the runway/s most nearly aligned with the wind when 5 knots or more"; calm wind runway below 5 knots | Numbers; wind; Figure 8 |
| AIM 4-3-14 | Departing: contact the tower "on the appropriate ground control/clearance delivery frequency prior to starting engines"; remain on it during taxi and runup, "then change to local control frequency when ready to request takeoff clearance"; turbine aircraft considered ready on reaching the runway or warm-up block; "A pilot who has just landed should not change from the tower frequency to the ground control frequency until directed to do so by the controller." | Talking; Figure 11 |
| AIM 4-3-15 | Gate hold procedures "whenever departure delays exceed or are anticipated to exceed 15 minutes"; contact ground control or clearance delivery before starting engines | Talking; Figure 11 |
| AIM 4-3-13 | Light signals for aircraft and vehicles "not equipped with radio" or "if radio contact cannot be established"; "only approval or disapproval of a pilot's anticipated actions may be transmitted"; the signal table as tabulated in that paragraph | Ground; Figure 12 |
| AIM 4-3-18 | Approval before moving onto the movement area; clearance for runway taxi, takeoff, landing and crossings; "ATC will issue an explicit clearance for all runway crossings"; taxi to the departure runway does not authorize entering or crossing it; progressive taxi; jet blast; "Always state your position on the airport when calling the tower for taxi instructions."; ATC must obtain a readback of all runway hold short instructions; read back taxi instructions | Ground; Talking; Figure 11 |
| AIM 4-3-21 | Exit at the first available taxiway or as instructed; clear when all parts have crossed the holding position marking; "the pilot must hold unless further instructions have been issued by ATC"; change to ground when advised | Holding; Figure 4 |
| P/CG, Overhead maneuver | "A series of predetermined maneuvers prescribed for aircraft (often in formation)"; not an IFR approach; IFR plan cancelled at the "initial point"; "An initial approach 3 to 5 miles in length."; "An elliptical pattern consisting of two 180 degree turns."; break point; "Altitude (at least 500 feet above the conventional pattern)."; roll-out "not less than 1/4 mile from the landing threshold and not less than 300 feet above the ground" | Overhead; Figure 10 |
| P/CG, Threshold; Traffic pattern; Tetrahedron | "The beginning of that portion of the runway usable for landing."; leg definitions; tetrahedron small end points in the direction of landing | Terms; pattern |
| AFH pp. 8-1–8-4 | Rectangle, left turns unless marked; "usually 1,000 feet above the elevation of the airport surface"; "normally entered at a 45° angle to the downwind leg"; downwind "approximately 1/2 to 1 mile out"; base turn "approximately 45° from the approach end"; upwind-side entry: "cross over midfield at least 500 feet above pattern altitude", descend to pattern altitude about 2 miles out, turn to a 45° entry; "the aircraft at the lower altitude has the right-of-way"; "continue straight out or exit with a 45° turn" | Pattern; Figure 9 |
| AC 90-66C ¶9.11.1, 11.3, 11.8 | "The FAA discourages VFR straight-in approaches"; "Entry to the downwind leg should be at a 45-degree angle abeam the midpoint of the runway to be used for landing."; departure straight out or 45° turn beyond the departure end after reaching pattern altitude | Pattern; Figure 9 |
| AC 90-66C ¶6.3, 9.3, 9.6 | CTAF: "A frequency designed for the purpose of carrying out airport advisory practices"; UNICOM may provide weather and wind on request, "UNICOM operators are not required to communicate with pilots"; MULTICOM 122.9 where no tower, CTAF or UNICOM is depicted | Talking; Figure 11 |
| AC 90-66C ¶9.5, 9.8, 9.8.1 | All traffic "should, at a minimum, monitor the CTAF"; arrivals broadcast intentions a minimum of 10 miles out, departures "a minimum of 10 minutes prior to taxi"; departure release is not takeoff authorization; self-announce call sign, position, altitude and intended activity; closed or part-time towers: CTAF within 10 miles; include aircraft type; runway number, not "Active Runway"; airport name at beginning and end; "ANY TRAFFIC IN THE AREA, PLEASE ADVISE" not recognized; traffic should reply unprompted | Talking; Figure 11 |
| AC 90-66C ¶9.11.1–9.11.2 | Straight-in self-announce between 8 and about 10 miles; position reports "Entering left/right downwind for runway [XX]", base, final | Talking; Figure 11 |
| AC 90-66C ¶10.1, 10.3 | Correct published airport name, not the town; name at start and end; do not broadcast an assumed landing sequence; "avoid using the words 'to' and 'for' whenever possible" | Talking; Figure 11 |
| AC 90-66C ¶10.4.1–10.4.3, App. B | Arriving: "Approximately 10 miles from the destination airport, monitor the CTAF" and self-announce position, altitude and intention; departing: monitor/communicate "from startup, during taxi, and after departure", back-taxi discouraged; IFR departure communicates "prior to entering the runway environment", announces runway and direction, monitors "until they are in contact with ATC"; App. B example "is clear of the Runway" | Talking; Figure 11 |
| JO 7110.65 ¶3-10-12 | Overhead patterns developed where aircraft have an operational need; "BREAK AT (specified point)" when nonstandard; standard overhead pattern does not preclude rectangular patterns | Overhead |

## Unverified or illustrative items, flagged on the page

- IFLOLS: the 3.5° default lens setting is an example (the manual gives no
  angle); the ball's proportional movement, a lens span of 3/4° below as well as
  above, and the red bottom cell as the lowest fifth are the module's assumptions.
- "The 180" is named but not described in 14342A; the module reads it, with the
  Hollywood landing call, as the final 180° turn, takes the 180 position as the
  start of that turn and the 90 as its midpoint, and says so.
- The Navy field calls are the Hollywood Script's formats moved to the made-up
  "Cedar" field with runway 27 and a left break; replies are typical wording.
  "Gear" and "stop" are read in context (gear down, full stop), as the Radio
  Procedures module also says.
- The arresting gear cable in Figure 3 is drawn 1,800 ft past the threshold for
  illustration; the disk count is the most that fit at 30 ft centers.

- PAPI indication angles (3.5°, 3.2°, 3.0°, 2.8°, 2.5°) appear only in AIM FIG 2-1-5,
  an image; the unit transition angles (2°30′, 2°50′, 3°10′, 3°30′) and the light
  order are the module's assumption. The caption says so.
- Runways within 5° of north numbered 36 rather than 0: convention, stated on
  the page as not in the AIM paragraph.
- Touchdown zone bar counts per group (3, aiming point, 2, 2, 1, 1, the usual FAA
  layout, not in the AIM text), stripe lengths, centerline dash/gap,
  sign proportions and the midfield-crossing track are illustrative, as captioned.
- Figure 11's calls are examples written in the formats the AIM and AC give
  (call sign Navy 405, a made-up airfield "Cedar"); the controller and UNICOM
  replies are typical wording, not quoted from a source, as the caption says.
  The ATIS steps are cross-referenced to the Radio Procedures module rather than
  cited here.
- Overhead break speeds, bank angles and the linear descent are not sourced; the
  caption says to use aircraft and field numbers.

## Models and independent reference cases

- IFLOLS ball: position = (angle − glide slope) ÷ 0.75°; visible while |position| ≤ 1;
  red below −0.6. 3.875° on a 3.5° slope: 0.5 (half way up); 4.26°: off the top;
  3.0°: −0.667, red; 3.2°: −0.4, not red.
- Arresting gear disks: n = floor((W − 10) ÷ 30) + 1, centred. 150 ft: 5 disks at
  0, ±30, ±60 ft; 200 ft: 7.

`src/lessons/airfield-ops/lesson-model.mjs`, tested in
`tests/lessons/airfield-ops-lesson.test.mjs` with hand-derived values:

- Designator: round(azimuth ÷ 10), 0 → 36. 183° → 18 and 087° → 9 (AIM examples);
  004° → 36; 355° → 36; 354° → 35.
- Wind: θ = wind − runway; headwind V cos θ, crosswind V sin θ (+ from the right).
  120° at 20 kt on 090°: 17.32 kt head, 10 kt from the right.
- Glide path height: d tan θ. 1 NM (6,076.12 ft) at 3°: 318.43 ft.
- Level turn by bank: r = V² ÷ (g tan φ). 300 kt (154.333 m/s), 60°:
  154.333² ÷ (9.80665 × 1.73205) = 1,402.3 m = 4,600.7 ft; 6.306°/s; 2 G.
- Overhead: two semicircles plus the downwind; with r = 4,600.7 ft, break 2,500 ft
  past the threshold and the downwind 2,000 ft past it, the path is
  2π × 4,600.7 + 4,500 = 33,407 ft, 65.98 s at 506.34 ft/s; roll-out 2,000 ft out
  (≥ 1,320 ft).
- Runway lights: 8,000 ft runway, 1,500 ft remaining → yellow edge, alternating
  centerline; 3,000 ft runway caution zone 1,500 ft.
