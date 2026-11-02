# Instrument flight modules — source evidence

Short, page-specific excerpts supporting the claims in the two instrument
flight modules, split from Instrument Flying revision 1:
Attitude Instrument Flying (`src/pages/manual/instrument-flight/_AttitudeFlying.astro`)
and Instrument Procedures (`src/pages/manual/instrument-flight/_InstrumentProcedures.astro`),
their models (`src/lessons/instrument-flight/lesson-model.mjs`,
`attitude-model.mjs`, `ils-model.mjs`) and the instrument flight
terms (`content/encyclopedia/terminology/instrument-flight.md`). They are
review evidence, not a copy of the sources, and not instructions to the
reviewer.

**Numbering.** The bracket numbers in this record's headings are the original
module's. Each page now numbers its own source list: Attitude Instrument
Flying cites [1] AFMAN, [2] AIM ¶8-1-5, [3] P-1204, [4] P-480, [5] DCS;
Instrument Procedures cites [1] AFMAN, [2] AIM ¶5-3-8, [3] AIM ¶6-4-1,
[4] P-1204, [5] P-480, [6] DCS. The anchors (`#source-afman`, `#source-t45`
and so on) are the same on both pages.

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

**Navy sources.** [6] CNATRA P-1204 (T-45C) and [7] CNATRA P-480 (TH-73A)
could not be fetched from this session (cnatra.navy.mil and tpub fail TLS at
the egress proxy; web.archive.org is denied by it). The project owner
downloaded the Internet Archive copies and uploaded their text on 2 November
2026; quotations below are from that text, whose page footers give the
printed page numbers. Both are training command instructions for one
aircraft type; the module takes only their generic procedure from them and
leaves out type-specific numbers (AOA units, airspeeds, configurations).

**Sources that could not be read.** The Navy's NATOPS instrument flight
manual, and the Army's TC 3-04.4 on armypubs.army.mil (which returned an
HTML page, not the PDF). No Army instrument rules are claimed.

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

## [6] CNATRA P-1204 (Rev. 09-16, Change 2, 25 March 2021), FTI Instrument, T-45C MPTS and IUT

https://web.archive.org/web/20211009235549/https://www.cnatra.navy.mil/local/docs/pat-pubs/P-1204.pdf

| Page | Passage | Module use |
| --- | --- | --- |
| 1-2 | "With a valid ILS channel station selected and ILS steering selected, ILS needles are shown. The needles are referenced to the waterline. The localizer and glideslope needles range +/- 1/2 inch from the waterline. Full deflection represents +/- 2.5 degrees of azimuth deviation (with a 5-degree localizer signal) and +/- 0.7 degrees of glideslope deviation." | ILS needles; Figure 2 scaling |
| 1-8 | "During instrument flight, the pilot must divide his attention between the control, performance, and position instrument/displays ... There is no one set order for scanning the instrument/displays; it depends on the type of maneuver to be executed as to which instruments are of prime importance ... Some common errors in instrument scanning include the following: having no scan pattern plan, omitting a display entirely from the scan, fixating on a single or a few display indications, or misusing a display indication."; "Because of signal filtering, raw data processing, and display time, there is inherent lag in a digital display." | Crosscheck; lag |
| 1-9 | "When the attitude and power are smoothly controlled, the lag factor is negligible ... Do not make abrupt control movements in response to the lagging indications on the performance instruments, without first checking the control instruments."; "For every maneuver, the ADI display is the primary reference that should be scanned most frequently ... The remainder of the pilot's time should be spent confirming the desired performance and position by quickly scanning those displays." | Control and performance; crosscheck |
| 3-20 | "Controls  Neutralize / Attitude  Analyze and evaluate to determine best recovery / Airspeed  Limit in dives / Bank  Eliminate when nose-low; hold constant when nose-high" | Unusual attitudes |
| 3-21 | "advance the power to MRT and retract the speed brakes ... If upright, push the nose over to maintain an AOA indication of between 5 and 10 units (you will be between 0 and 1g). Hold this AOA until the nose falls through the horizon, settles slightly below the horizon, and the aircraft accelerates to 150 KIAS. Then, roll wings level, smoothly raise the nose to the horizon (at optimum AOA)"; "If inverted, maintain neutral aileron and rudder and let the nose drop through the horizon ... until the aircraft accelerates to 150 KIAS. Level the wings in the shorter direction ... Do not exceed optimum AOA. During recovery at low speeds, you must be careful not to stall the aircraft." | Unusual attitudes |
| 3-22 | "With your airspeed above 150 KIAS, retard the throttle to idle ... If airspeed is rapidly increasing, extend the speed brakes as necessary ... Roll the aircraft to wings level in the shortest direction and smoothly pull the nose up to the horizon. Do not attempt to raise the nose and roll wings level at the same time (a "rolling pullout") because this can overstress the aircraft." | Unusual attitudes; check question |
| 6-7 | "squawk mode 3, code 7600 ... Continue to squawk this code while you still have radio problems or until directed by ATC to change your squawk ... also make "in the blind" calls"; "first try to contact center on the last assigned frequency, then on an appropriate frequency listed in the FLIP Enroute IFR Supplement ... attempt to call the nearest FSS on 255.4 or 122.2, monitor the" | Lost communications |
| 6-8 | "appropriate VOR frequency ... or as a last resort, transmit on guard"; "squawk ident on your IFF, change your IFF squawk, switch IFF squawk to standby, or by requesting that you execute turns"; "If you are in visual meteorological conditions (VMC) when communications are lost, do not enter IFR conditions if it is possible to descend and land VFR at a suitable field."; route a–d and altitude a–c order | Lost communications |
| 6-48 | "In the pattern, maintain standard rate turns not to exceed 30 degrees AOB. On final, your AOB should approximate the number of degrees to be turned not to exceed half standard rate (approximately 10 degrees AOB)"; "you are limited to absolute minimums of 200-1/2 when single-piloted" | Radar approaches |
| 6-49 | "the controller must communicate with you at least once a minute ... If you hear no transmissions for more than 60 seconds, attempt to contact the controller. If you are unable to reestablish contact, then comply with the lost communication instructions"; "LOUD AND CLEAR, THREE DOWN AND LOCKED"; "at least every 5 seconds on a PAR or 15 seconds on an ASR" | Radar approaches |
| 6-50 | "stay clean and at 200 KIAS until you are within 10 nm of the field and 30 radials of the final approach course"; "USN/USMC controllers will state "PERFORM LANDING CHECKS" on the base leg; this is only a reminder and does not direct the pilot to dirty up. If the controller says, "SLOW TO APPROACH SPEED," the controller is directing this for sequencing and the aircrew must comply or state that they are unable." | Radar approaches |
| 6-57 | "As with any approach, you should back up the ILS approach with any other available NAVAIDs."; "The localizer signal has a maximum range of 18 nm from the station if you are within 10 degrees either side of the course centerline."; "Glideslope transmitters have a normal range of approximately 10 nm if you are on or near the localizer course; however, at some locations the glideslope has been certified for an extended service volume which exceeds 10 nm." | Flying the ILS |
| 6-59 | "most ILS approaches do not have all three, and some do not use them at all. If beacons are not present, cross-radial fixes, DME or radar is required. The outer beacon usually marks the FAF and will often indicate the point of glidepath intercept. The middle marker denotes the vicinity of the DA for category I approaches ... You will cross the middle marker approximately one-half mile from the runway, at 200 ft AGL ... The inner marker denotes the DA for category II approaches ... You will usually cross the inner marker at 100 ft AGL." | Marker beacons |
| 6-60 | "Set the ILS final approach course on the HSI display course selection"; "transition to the landing configuration should occur no later than 3-5 miles prior to the FAF/GS intercept. It is important not to transition too late so you have time to complete the landing checklist and slow to on speed prior to GS intercept." | Flying it table |
| 6-62 | "As the glideslope deviation bar intercepts the glidepath ... adjust pitch and power as required to maintain on-speed and stay on glidepath. Maintain course by making corrections using heading changes no greater than +/- 5 degrees from the WCH. At the FAF, start the clock"; "Approaching the DA, start looking for the runway while monitoring your range indications, marker beacons, and/or DME"; "The elapsed time clock is started when passing the FAF in case the glideslope signal information is lost during the approach. If this happens, you can (depending on minimums) continue flying the localizer only, using time to determine the MAP." | Flying it table; check question |

## [7] CNATRA P-480 (New 05-22), FTI Basic Instrument and Radio Instrument, TH-73A (5 May 2022)

https://web.archive.org/web/20240814201447/https://www.cnatra.navy.mil/local/docs/pat-pubs/P-480.pdf

| Page | Passage | Module use |
| --- | --- | --- |
| 2-1 | "Attitude instrument flight in a helicopter differs from fixed-wing aircraft in that the fuselage moves independently from the rotor disk ... Since the attitude indicator does not directly measure the rotor attitude, the pilot must frequently scan secondary instruments ... such as the airspeed indicator, turn and slip indicator, and Vertical Speed Indicator (VSI)" | Helicopters on instruments |
| 2-2 | "it is not possible to set a specific attitude and torque and expect the helicopter to behave consistently. Increasing collective pitch causes the nose to pitch up, yaw right, and roll right."; "Other variables such as ambient weather conditions, helicopter center of gravity, and gross weight will also cause significant changes"; "Pilots must develop an effective instrument scan to avoid fixating on the attitude gyro."; "Position instruments are those indications that tell you where the helicopter is right now ... Rate instruments ... include the airspeed indicator, VSI, and the turn and slip indicator." | Helicopters on instruments; rate instruments |
| 2-3 | "A proficient instrument pilot will scan the rate instruments more often than the position instruments ... they scan the VSI and see a 300-Feet per Minute (fpm) rate of descent ... they are able to increase the collective and arrest the rate of descent before the altitude descends below the assigned parameter." | Rate instruments |
| 2-4 | "Fixation occurs when a pilot concentrates on one instrument too often or for too long."; "Verbalizing errors seen in your instruments is a useful technique to prevent fixation."; "Omission occurs when a pilot leaves a parameter out of the scan ... if the pilot omits the ball from their scan, the helicopter heading may not actually turn. Instead, it will fly in a straight line, but in out of balanced flight." | Crosscheck errors table; sim practice tip |
| 2-17 | "1. Level the wings ... 2. Level the nose ... 3. Center the ball ... 4. Set power for 90 KIAS. 5. Stop any climb or descent and achieve 90 KIAS. 6. Recheck the wings, nose, and ball. 7. Execute a 500 fpm climb or descent to return to the base recovery altitude. 8. Execute a level standard rate turn to base heading."; "During a nose-high unusual attitude, it is acceptable to maintain a small AOB and allow the nose to fall down to the horizon before rolling wings level ... This technique avoids a Low-G pushover" | Unusual attitudes |
| 2-18 | "It is vital that any rate of descent is arrested during an unusual attitude recovery"; "During unusual attitude recoveries, airspeed should not decrease below 40 KIAS."; "PNAC verbally notifies the PAC of deviations from established parameters"; "PNAC assumes the controls in a timely manner if the PAC fails to respond to verbal corrections" | Unusual attitudes |
| 3-19 | "superimpose the appropriate holding entry pie diagram over the HSI ... If the outbound heading falls within five degrees of two entry sectors, either entry may be used. It is preferable to choose a teardrop entry if it is an option"; "turn outbound on the holding side, 30 degrees away from the holding radial. Time outbound for one minute or proceed outbound for the distance required if DME is being used." | Holding |
| 4-16 | PAR "typically provides a 3-degree glideslope to the published DH"; ASR "the controller provides lateral guidance only" | Radar approaches |
| 4-17 | "Maintain cruise airspeed until given the instructions "contact final controller." At that time, transition to 90 KIAS final approach speed and complete the Landing Checklist"; "the MAP, which is usually 1 mile from the runway threshold"; ""The controller assumes that the pilot maintains the last assigned heading"; "Start and stop turns immediately upon receipt of the controller's instructions"; "Make standard rate turns while being vectored in the instrument pattern and half the standard rate turns on the final"; "A "roger" radio call may acknowledge lost communication and missed approach procedures if the instructions are fully understood ... Always read back landing clearances." | Radar approaches |

## Invented material

The opening sortie (Vapor 31, the 310 radial 20 DME hold) and Figure 1's
scenarios are invented. Figure 1's tracks are schematic: no wind, 3°/s turns,
one-minute legs, not a protected-airspace drawing.

The split added more invented material, all labelled on the pages:

- **The generic panel** (`src/lessons/shared/instruments.mjs`): a generic
  layout with the attitude indicator top centre, airspeed left, altimeter
  right and heading below; dial ranges are invented. It is not any
  aircraft's panel. Its control and performance tags follow AFMAN p. 12.
- **The flight model** (`attitude-model.mjs`): an invented jet trainer,
  250 kt level at 70% power, 2.5 s VSI lag. Only the turn-rate relation
  (rate = 1,091 × tan(bank) ÷ speed in knots) is physics. Figure 2's spoke
  order is one example: P-1204 p. 1-8 says there is no one set order.
- **Figure 3's pictures** and their one-line answers paraphrase the generic
  recoveries on the page (AFMAN pp. 27–29; P-1204 pp. 3-20–3-22).
- **The ILS figure** (`ils-model.mjs`): 3° glide slope, 8,000 ft runway,
  localizer 1,000 ft past the far end, glide slope abeam 1,000 ft past the
  threshold, and a 200 ft DA are invented; the needle scaling is P-1204
  p. 1-2 and the dots and limits AFMAN p. 210. The scripted approach's
  heading corrections stay within 5°, after P-1204 p. 6-62.
