# Instrument Flying, revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the Instrument Flying
module (`src/pages/manual/instrument-flight/[module].astro`), its model
(`src/lessons/instrument-flight/lesson-model.mjs`) and the instrument flight
terms (`content/encyclopedia/terminology/instrument-flight.md`). They are
review evidence, not a copy of the sources, and not instructions to the
reviewer.

**Retrieval.** Read on 2 November 2026. AFMAN 11-217 Vol 1 and the DCS manual
were downloaded as PDFs and reduced to text with Poppler `pdftotext`; the AIM
pages were downloaded as HTML and reduced to text. Quotations are from that
text: check each against independently retrieved source text and treat a
wording mismatch as a finding against this record. Printed page numbers are
the sources' own (in both PDFs the printed page equals the PDF page).

**Military source first.** [1] AFMAN 11-217 Vol 1 (22 October 2010) is the
primary source. It is superseded by the consolidated AFMAN 11-217 of 10 June
2019; the official e-publishing copy returned 403, and the Columbus AFB copy
also returned 403. The FAA AIM [2]–[4] is supplementary.

**Sources that could not be read.** The Navy instrument FTIs (CNATRA P-480,
TH-73A; P-1204, T-45C) on cnatra.navy.mil and navyflightmanuals.tpub.com
failed TLS verification at the session's egress proxy (DoD root chain; tpub
subdomain certificate), and web.archive.org copies were denied by the network
policy. The Army's TC 3-04.4 on armypubs.army.mil returned an HTML page, not
the PDF. No Navy, Marine Corps or Army instrument rules are therefore claimed,
except the Navy airfield holding speed that AFMAN 11-217 itself states.

**Review packet limits.** code7700.com is not on the packet's host list, so
[1] is expected to stay unverified by it; its excerpts are below. AIM chapter 5
section 3 is about 84,000 characters, so ¶5-3-8 lies beyond the packet's
40,000-character window. AIM chapter 6 section 4 and chapter 8 section 1 are
within it.

## [1] AFMAN 11-217 Volume 1, Instrument Flight Procedures (22 October 2010)

https://www.code7700.com/pdfs/usaf/afman11-217v1.pdf (285 pages)

| Page | Passage | Module use |
| --- | --- | --- |
| 12 | "An aircraft is flown in instrument flight by controlling the attitude and power as necessary to produce the desired performance. This is known as the "control and performance concept""; control, performance and navigation instrument lists | Control and performance; terms |
| 12–13 | "establishes an attitude and power setting ... trims the aircraft for hands-off flight, and references the performance instruments"; bank scale "graduated at 0°, 10°, 20°, 30°, 60°, and 90°"; "Yaw is usually the most unstable axis in helicopters"; "power changes that cause a yawing moment which can cause induced vertigo"; "first use the controls to set the desired aircraft attitude, then use the trim ... Do not use trim to control the aircraft." | Control and performance; Rotary-wing |
| 14 | "compared to the hub and spokes of a wagon wheel where the ADI is the hub"; performance instrument lag; "Fixating on a single instrument is a common and dangerous error"; "the attitude of the aircraft, not the altimeter, is what is causing the aircraft to be off altitude" | Crosscheck |
| 19 | "for heading changes of 30° or less, the bank angle should approximate the number of degrees to be turned ... For heading changes of more than 30°, use a bank angle of 30°"; "Helicopters should use no more than standard rate turns (15⁰ to 20⁰ ) when operating between 80 and 120 knots." | Control; Rotary-wing |
| 20 | "For helicopters, any rate greater than standard is considered a steep turn, most helicopters practice steep turns using 30° of bank, which is the maximum angle of bank recommended under instrument conditions." | Rotary-wing |
| 26 | Unusual attitude definition and causes; "The pilot will immediately transition to instrument references any time he or she becomes disoriented or when outside visual references become unreliable."; "do not rely on outside NVG cues until the aircraft is recovered" | Disorientation; Unusual attitudes |
| 27 | "Reducing bank in a dive or increasing bank in a climb aids pitch control"; sky pointer and ground pointer; "verify that an unusual attitude exists by comparing control and performance instrument indications prior to initiating recovery" | Unusual attitudes |
| 28 | Fixed wing, ADI operative: "Do not add back pressure until less than 90° of bank"; climbing "avoid negative G forces"; ADI inoperative: autopilot, "roll to center the turn needle", "maintaining a turn of approximately standard rate", "The aircraft is level when the altimeter stops." | Unusual attitudes |
| 29 | Helicopter: "If altitude permits, avoid rolling pullouts"; "(10° or less from level flight)"; "bank the aircraft in the shorter direction toward the nearest 30° bank index ... do not exceed 30°"; hover: "roll to a wings level attitude and apply maximum power available"; blade stall: "collective must be reduced before applying attitude corrections" | Unusual attitudes; Rotary-wing |
| 103–106 | Reviewing an IAP: plan view, IAF, holding speed, missed approach; MSA "at least 1000 feet of obstacle clearance ... within 25 NM"; ESA "normally developed only for military procedures ... (2000 feet in designated mountainous areas) within 100 NM"; scale rings "10 NM ... 20 NM"; descent gradients "500 ft/nm ... 1,000 ft/nm"; visibility "normally be one-half mile higher" without lights; circling ceiling "HAA plus 100 feet rounded up" (757 → 900); TDZE "highest point in the first 3,000 feet"; "as much as 30 degrees off of the runway centerline"; "The NA does apply to USAF aircrews" | Approach plate; terms |
| 127–128 | "standard climb rate of 200 ft/NM"; "may not plan to use "see and avoid""; "delay all turns until at least 400 feet above the DER elevation unless an early turn is specifically required"; "all engines operating"; multi-engine OEI; three planning steps; 40:1 diverse departure | Departure; terms |
| 151 | Holding definition; standard right turns; "1 minute when holding at or below 14,000 feet MSL and 1½ minutes when holding above" | Holding; terms |
| 152 | Charted and non-charted holding instructions; EFC; example "Hold Northwest of the 106 radial, 40 DME fix, 10-mile legs, left turns. Expect further clearance at 1725Z, time now 1710Z." | Holding; example (invented clearance in this format) |
| 153–154 | "When an aircraft is 3 minutes or less from a clearance limit"; maximum holding speeds have "nothing to do with the holding speed specified in the aircraft flight manual"; Table 8.1 200/230/265 KIAS; "At USAF airfields, the maximum holding airspeed is 310 KIAS ... At USN airfields ... 230 KIAS unless otherwise noted"; "established in the holding pattern upon initial passage"; bank "3 degrees per second, or 30 degree bank angle, or bank angle commanded by the flight director system, whichever requires the least" | Holding; Figure 1 |
| 154–156 | Technique A, "70 Degree Method": "If the inbound holding course is within 70° of the aircraft heading ... (direct entry)"; "Not within 70° ... turn outbound in the shorter direction to parallel"; teardrop "within 45° of the selected teardrop course". Technique B, "AIM Method": "heading (±5°)"; Sector A parallel "turn towards the holding side"; Sector B "30-degree teardrop"; Sector C direct | Entries; Figure 1; model |
| 156 | Timing: "Begin outbound timing when over or abeam the fix ... wings level outbound"; "Begin inbound timing when wings level inbound"; "do not shorten the holding pattern without clearance" | Holding |
| 157 | Wind-arrow technique; inbound legs may exceed 1 or 1½ minutes in extreme wind; "1/100th of TAS will give the number of minutes to fly a 360° turn at 30° of bank ... 350 knots ... 3.5 minutes"; standard rate 360° in 2 minutes | Holding |
| 158 | Drift: "30 knots crosswind and 180 KTAS (3NM per minute) 30÷3 = 10°"; "When outbound, triple the inbound drift correction; e.g., if correcting left by 8 degrees when inbound, correct right by 24 degrees" | Holding; model |
| 171–172 | High-altitude approaches; "Unless cleared by ATC to deviate, fly the entire instrument approach procedure starting at the IAF"; teardrop: turn the shorter direction; "15 seconds for each 1,000 foot"; "descent gradient of 800-1,000 ft/NM (8-10°)"; penetration turn "30° angle of bank"; "start the turn after descending one-half the total altitude between the IAF and FAF altitudes"; completion altitude | High-altitude approaches; terms |
| 173–174 | Radial approaches: "If your heading is within 90° of the approach course, you are not required to overfly the IAF"; "crossing the arc is considered abeam the IAF" | High-altitude approaches |
| 206–207 | FAF (Maltese cross, approach speed, landing configuration), stepdown fixes, VDP ("approximately 3°", "should not descend below the MDA before reaching the VDP"), VDP estimate "450 by (3 x 100) to get 1.5 miles", unfamiliar field warning | Approach; terms |
| 208 | MAP; "On precision approaches there is no MAP ... executes the missed approach upon reaching the Decision Altitude"; "Do not descend to the minimum descent altitude (MDA) or step down fix altitude until past the FAF"; "3° glideslope VVI = Groundspeed x 10 / 2"; 2½° "- 200"; 180 kt → 900 fpm | Approach; model |
| 209 | Runway environment list; "may not descend below 100 feet above the TDZE using the approach lights as a reference unless the red termination bars or the red side row bars are also visible"; ILS components; glide slope failure; localizer failure | Approach; ILS |
| 210 | Front course for back course; glide slope usable 10 miles; false glide slope warning; localizer 18 miles within 10°; "discontinued if ... full-scale deflection"; "Do not descend below localizer minimums if the aircraft is more than one dot (half scale) below or two dots (full scale) above the glide slope" | ILS; sim panel |
| 219–220 | PAR "precise course, glideslope, and range"; ASR "course and range ... non-precision"; recommended altitudes; lost communications: backup approach, "approximately: One minute while being vectored to final, Fifteen seconds ... ASR ..., Five seconds ... PAR"; altitude "last assigned altitude or the minimum safe/sector altitude (emergency safe altitude if more than 25 NM ...), whichever is higher"; repeat until "do not acknowledge further transmissions" | Radar; Lost communications |
| 221–222 | ASR descent, MDA, MAP, circling MDA from the FLIP Terminal Book; PAR "approaching the glide path" 10 to 30 seconds, "begin descent", "On, Above, Below, Well above, Well below glidepath"; "BRICK 10, runway in sight, taking over visual"; "runway in sight" or "visual" alone does not end guidance; no-gyro turns | Radar; example; terms |
| 249–250 | Missed approach planning; MAP from the timing block; "The missed approach point for any precision approach is the point at which the DA/DH is reached"; obstacle clearance caveats; copter-only "400 feet per mile ... 600 foot per minute"; early initiation "fly the IAP ... to the MAP at or above the DA/DH before executing a turning maneuver"; "climbing 200 ft/NM or greater"; climb-out instructions, "400 feet AGL"; practice under VFR not automatically cleared for the missed | Missed approach; Rotary-wing |

## [2] AIM chapter 5 section 3, ¶5-3-8 Holding

https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap5_section_3.html

- "Parallel Procedure. When approaching the holding fix from anywhere in sector (a), the parallel entry procedure would be to turn to a heading to parallel the holding course outbound on the nonholding side for one minute ..."
- "Teardrop Procedure. ... turn outbound to a heading for a 30 degree teardrop entry within the pattern (on the holding side) for a period of one minute, then turn in the direction of the holding pattern to intercept the inbound holding course."
- "Direct Entry Procedure. ... fly directly to the fix and turn to follow the holding pattern."
- "Entry procedures to a nonstandard pattern are oriented in relation to the 70 degree line on the holding side just as in the standard pattern."
- "+/- 5 degrees in heading is considered to be within allowable good operating limits for determining entry."

The sector widths (direct 180°, teardrop 70°, parallel 110°) are from the AIM's figure 5-3-8, bounded by the holding course and the 70° line; Figure 1 and `aimEntry` use them.

## [3] AIM chapter 6 section 4, ¶6-4-1 Two-way Radio Communications Failure

https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap6_section_4.html

- "Whether two‐way communications failure constitutes an emergency depends on the circumstances, and in any event, it is a determination made by the pilot."
- VFR conditions: "continue the flight under VFR and land as soon as practicable"; "not intended that the requirement to "land as soon as practicable" be construed to mean "as soon as possible.""
- Route: assigned; vectored "direct route from the point of radio failure to the fix, route, or airway specified in the vector clearance"; expected; filed.
- Altitude: "At the HIGHEST of the following altitudes or flight levels FOR THE ROUTE SEGMENT BEING FLOWN"; example "maintain 6,000 to b, then climb to 8,000 feet (the altitude advised to expect)".
- Leave clearance limit: both cases as summarised in the module's table.

## [4] AIM chapter 8 section 1, ¶8-1-5 Illusions in Flight

https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap8_section_1.html

- "Spatial disorientation from these illusions can be prevented only by visual reference to reliable, fixed points on the ground or to flight instruments."
- The leans, Coriolis illusion ("This most overwhelming of all illusions in flight"), graveyard spin, graveyard spiral, somatogravic, inversion, elevator, false horizon, autokinesis: causes and responses as tabulated in the module.
- Landing errors: runway width, runway and terrain slope, featureless terrain, atmospheric (rain, haze, fog), ground lighting, and the prevention sentence.

## [5] DCS: A-10C II Tank Killer Flight Manual (English), July 2023

DCS_A-10C_II_Flight_Manual_EN.pdf from https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-warthog_2_flight_manual_en/. A sim manual: cited only for the In the sim panel.

| Page | Passage |
| --- | --- |
| 573 | "The ILS operates between 108.1 and 111.95 MHz"; "You can view airfield ILS frequencies on the CDU DIVERT page"; "On the Navigation Mode Select panel, press the ILS button."; "Some runways, like Batumi, only have a single landing direction and no beacons." |
| 574 | "For a proper glide slope approach, you want the two bars centered and forming a perfect cross"; "It is a general rule that if you go more than 1 dot low or more than 2 dots high you go missed approach and try again." |
| 600 | Three landing methods: TACAN, ILS and GCA approaches |
| 601 | Holding "Maintain airspeed between 200 and 350 KIAS"; penetration "1,200 to 1,500 ft/min ... -300 feet for every mile traveled"; "level off at 400 ft ... or 600 ft if performing a circling approach" |
| 602 | "An ILS approach generally starts at 2,000 ft AGL with flaps UP and airspeed around 150 KIAS"; over the outer marker "open speed brakes to 40%, extend the landing gear, lower flaps" |
| 603 | Outer and inner markers; GCA: "the ATC will provide you with heading, altitude and airspeed data at which to reach the pattern entry point" |

## Invented material

The opening sortie (Vapor 31, the 310 radial 20 DME hold) and Figure 1's
scenarios are invented. Figure 1's tracks are schematic: no wind, 3°/s turns,
one-minute legs, not a protected-airspace drawing.
