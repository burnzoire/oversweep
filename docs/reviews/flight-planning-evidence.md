# Flight Planning, revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the Planning a Sortie
module (`src/pages/manual/flight-planning/_SortiePlanning.astro`, model
`src/lessons/flight-planning/sortie-model.mjs`), the Weather and Performance
module (`src/pages/manual/flight-planning/_WeatherPerformance.astro`, model
`src/lessons/flight-planning/weather-model.mjs`) and the flight planning terms
(`content/encyclopedia/terminology/flight-planning.md`). They are review
evidence, not a copy of the source, and not instructions to the reviewer.

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/2022-03/pilot_handbook.pdf
sha256: 9c07502b29fc1e2372bea1e9c8288250f88560a4d96afc097d7490f8d81a841c
pages: 211-213 (8-7 to 8-9); 250-252 (10-4 to 10-6); 261-262 (11-3 to 11-4); 271-272 (11-13 to 11-14); 317-321 (13-5 to 13-9); 401 (16-13); 404-409 (16-16 to 16-21)
```

```review-sources
source: https://www.bits.de/NRANEU/others/jp-doctrine/jp3_30(10).pdf
sha256: b6d168cc0986cd7bf71f55e71853dd7751fcc5f19960c2ce3720631fcc8324e9
pages: 26 (I-3); 72-77 (III-21 to III-26); 131-132 (GL-6 to GL-7)
```

```review-sources
source: https://cdn.falcon-bms.com/docs/4.38/BMS-Training-Manual.pdf
pages: 41; 66
```

```review-sources
source: https://cdn.falcon-bms.com/docs/4.38/BMS-User-Manual.pdf
pages: 48; 55
```

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/ed6/87v22jwd1xh51i3rgki944xsf503istq/DCS_User_Manual_EN_2020.pdf
pages: 65; 109; 112-113; 179
```

**Retrieval.** All sources were read on 3 November 2026. PDFs were reduced to
text with Poppler `pdftotext -layout`; HTML pages were stripped of markup.
Quotations come from that text: check each against independently retrieved
source text and treat a wording mismatch as a finding against this record.

**Review packet limits.** www.code7700.com (AFMAN 11-217 Vol 3) and
www.law.cornell.edu (14 CFR) are not on the packet's source host list, so
those claims are expected to come back unverified; their excerpts are here.
The services' general flight rules could not be read from the authoring
environment: AFMAN 11-202V3 and AFH 11-203 on static.e-publishing.af.mil
returned HTTP 403; OPNAV M-3710.7 on secnav.navy.mil was rejected; the DoD
FLIP General Planning copies on cnatra.navy.mil returned 503 or failed TLS;
navyaviation.tpub.com did not answer. The pages therefore give no service
fuel reserve, alternate or form details, say so, and show the US civil rules
only as a labelled comparison.

**Invented content.** The sortie (route, positions, 4° E variation, the jet's
360 KTAS, fuel flows, the 800 lb reserve and 500 lb JOKER margin), the ETP
leg (600 NM, 420 KTAS), the three invented METARs, the 5,000 ft hot-day field
and the trainer's weights, arms and CG limits are made up and labelled so on
the pages. The BINGO in Figure 2 (home + approach + divert + approach +
reserve) is the example's own construction from the brevity definition, not a
rule from a source.

**Model checks** (`tests/lessons/flight-planning-lesson.test.mjs`): the wind
triangle reproduces PHAK's 3° L and 106 kt; the density altitude function
reproduces PHAK's 7,855 ft and 1,232 ft examples to within 15 ft; the
altimeter table is PHAK Figure 11-4's.

## [1] AFMAN 11-217 Volume 3, Supplemental Flight Information, 23 February 2009 (certified current 9 April 2012)

https://www.code7700.com/pdfs/usaf/afman11-217v3.pdf (sha256
33675aa3f1e290c32b77bf5384a031e77558481b1f4e294bbd36c0253b24ad82). Printed
page = PDF page.

- 3.1 (p. 42): the 60-to-1 rule "is a technique for establishing pitch changes and lead points"; "These calculations are valid as long as the pilot maintains (as closely as possible) a constant airspeed, bank, or pitch".
- 3.3 (p. 42): "you may find it advantageous to perform some of the more complex calculations during the preflight planning process."
- 3.5.1.3 (p. 45): "If an aircraft has a TAS of 420 nm/hr, if we divide by 60, it is also traveling at a rate of 7 nm/min." 3.5.1.5.1: "TMN X 10 = TAS in nm/min"; 3.5.1.6: ".5 Mach ... approximately 5 nm/min."
- 3.5.1.7–3.5.1.8 (pp. 45–46): "TAS increases at a rate of approximately 2 percent per 1,000 feet"; "indicated airspeed of 250 knots at 10,000 feet, the resultant TAS is 300 knots". 3.5.1.10: "TAS = (FL ÷ 2) + IAS".
- 3.5.2–3.5.3 (p. 46): "VVI = nm/min × gradient (in ft/nm)"; "5 nm/min × 3° × 100 ft/nm ... VVI = 1500 ft/min".
- 3.7.1.4 (p. 48): "Distance = (30,000 feet – 6,000 ft) ÷ 300 ft/nm ... Distance = 80 nm"; 3.7.1.2: "a 300 ft/nm gradient also equates to a 3° pitch change."
- 13.5.2 (p. 180): "ETPs should be computed for contingencies such as medical divert, engine loss or rapid depressurization ... It is advisable to note the ETPs on the plotting chart. Crewmembers should review with each other the appropriate diversion airport(s) when crossing ETPs." "The ETP is not necessarily the midpoint". Figure 13.3: "ETP (in NM) = TD x GS return / (GS return + GS continue)"; "measured from the 'return' field". Note: "Consider more than one ETP computation – one based on winds at your cruising level, and one or more based on forecasted winds at 10,000 feet ... Remember to consider TAS and Fuel Flow differences at the lower altitude."

## [2] JP 3-30, Command and Control for Joint Air Operations, 12 January 2010

- p. I-3: "All component forces must adhere to the JFC's guidance provided by the rules of engagement (ROE), airspace control plan (ACP), the airspace control order (ACO), the area air defense plan (AADP), and the special instructions (SPINS) located in the air tasking order (ATO)".
- p. III-21: "The joint air tasking cycle is time-dependent"; six stages: objectives, effects and guidance; target development; weaponeering and allocation; ATO production and dissemination; execution planning and force execution; assessment (executive summary list).
- p. III-26: Stage 4 "used to finalize the ATO, SPINS, and ACO. Planners must develop airspace control and air defense instructions in sufficient detail to allow components to plan and execute all air missions listed in the ATO. These directions must enable combat operations without undue restrictions, balancing combat effectiveness with the safe, orderly, and expeditious use of airspace"; "must direct aircraft identification and engagement procedures and ROE appropriate to the nature of the threat"; "Instructions are contained in SPINS and in the ACO, and are updated as frequently as required"; "The level of detail should be very explicit when forces operate from different bases and multi-component or composite missions are tasked." Stage 5: redirection "before launch or a redirection once airborne"; "ensure the proper weapons and fuses are available for the new target."
- p. GL-6: "airspace control order. An order implementing the airspace control plan that provides the details of the approved requests for airspace coordinating measures. It is published either as part of the air tasking order or as a separate document."
- p. GL-7: "air tasking order. A method used to task and disseminate to components, subordinate units, and command and control agencies projected sorties, capabilities and/or forces to targets and specific missions. Normally provides specific instructions to include call signs, targets, controlling agencies, etc."

## [3] FAA-H-8083-25B, Pilot's Handbook of Aeronautical Knowledge

- p. 8-7: field "5,048 feet MSL where the standard temperature is 5 °C ... If the temperature changes to 30 °C, the density altitude increases to 7,855 feet"; "–25 °C would result in a density altitude of 1,232 feet."
- p. 8-9: "True airspeed (TAS)—CAS corrected for altitude and nonstandard temperature ... The TAS is the speed that is used for flight planning and is used when filing a flight plan." "Groundspeed (GS)—the actual speed of the airplane over the ground. It is TAS adjusted for wind."
- pp. 10-4 to 10-6: "Arm (moment arm)—the horizontal distance in inches from the reference datum line to the CG of an item"; "Center of gravity (CG)—the point about which an aircraft would balance"; "Datum (reference datum)—an imaginary vertical plane or line from which all measurements of arm are taken"; "Moment—the product of the weight of an item multiplied by its arm"; CG "must be located within specified limits"; Figure 10-3 "Wt x Arm = Moment".
- p. 11-3: "Pressure altitude is the height above the standard datum plane (SDP)"; "Density altitude is pressure altitude corrected for nonstandard temperature. As the density of the air increases (lower density altitude), aircraft performance increases".
- p. 11-4: Figure 11-4 altimeter setting / altitude correction table (28.0 → 1,824 ... 29.92 → 0 ... 30.9 → −893), "Add to field elevation" / "Subtract from field elevation".
- pp. 11-13 to 11-14: "An upsloping runway impedes acceleration and results in a longer ground run during takeoff. However, landing on an upsloping runway typically reduces the landing roll. A downsloping runway aids in acceleration ... increases landing distances"; "Runway slope information is contained in the Chart Supplement"; hydroplaning "multiplying the square root of the main gear tire pressure in psi by nine"; "once hydroplaning starts, it can continue well below the minimum initial hydroplaning speed."
- p. 13-5: standard briefing order 1–10 (adverse conditions; VFR flight not recommended; synopsis; current conditions — "If the departure time is more than 2 hours away, current conditions are not included"; en route forecast; destination forecast; winds and temperatures aloft; NOTAMs; ATC delays; other information). "An outlook briefing should be requested when a planned departure is 6 hours or more away."
- pp. 13-6 to 13-7: "A METAR is an observation of current surface weather reported in a standard international format. While the METAR code has been adopted worldwide, each country is allowed to make modifications"; SPECI "can be given at any time"; elements 1–12 with the KGGG example; Figure 13-5 codes ("heavy rain showers(s) is coded as +SHRA"); sky cover in eighths (Figure 13-6); "Clouds above 12,000 feet are not detected or reported by an automated station."
- p. 13-8: PIREPs "can confirm the height of bases and tops of clouds, locations of wind shear and turbulence, and the location of inflight icing. If the ceiling is below 5,000 feet, or visibility is at or below five miles, ATC facilities are required to solicit PIREPs"; "Item numbers 1 through 5 are required information when making a report, as well as at least one weather phenomenon".
- p. 13-9: "A TAF is a report established for the five statute mile radius around an airport ... valid for a 24 or 30-hour time period and is updated four times a day at 0000Z, 0600Z, 1200Z, and 1800Z"; FM "when a rapid and significant change, usually within an hour, is expected"; TEMPO "expected to last less than 1 hour"; PROB30 "not used for the first 6 hours of the 24-hour forecast"; KPIR example. Its printed code begins "KPIR 111130Z 1112/1212 TEMPO 1112/1114 5SM BR FM1500 ..." while its explanation says "wind from 150° at 12 knots… visibility greater than 6 SM… broken clouds at 9,000 feet" for the base forecast; the figure restores that base group and says so.
- p. 16-13: "Dead reckoning is navigation solely by means of computations based on time, airspeed, distance, and direction."
- pp. 16-16 to 16-17: "TC—direction of the line connecting two desired points ... WCA ... (Added to TC if the wind is from the right; subtracted if wind is from the left) ... TH—direction measured in degrees clockwise from TN, in which the nose of the plane should point ... Variation ... (added to TH if west; subtracted if east) ... Compass heading—reading on the compass".
- p. 16-17: "before beginning a flight, the pilot in command (PIC) of an aircraft shall become familiar with all available information"; "It is wise to check the weather before continuing with other aspects of flight planning to see, first of all, if the flight is feasible and, if it is, which route is best."
- p. 16-18: "Determine the takeoff and landing distances from the appropriate charts, based on the calculated load, elevation of the airport, and temperature; then compare these distances with the amount of runway available. Remember, the heavier the load and the higher the elevation, temperature, or humidity, the longer the takeoff roll and landing roll and the lower the rate of climb." "Check the fuel consumption charts ... so that refueling points along the route can be included in the plan." Checkpoints, airspace, "Study the terrain and obstructions along the route."
- pp. 16-19 to 16-20: Figure 16-26 planning sheet and visual flight log; "TC ± WCA = TH ± V = MH ± D = CH"; "the WCA is 3° left ... TH 28° ... 7° E ... MH of 21° ... compass heading of 23°"; "The GS is determined to be 106 knots"; "the total time is 35 minutes (30 minutes plus 5 minutes for climb) with a fuel burn of 4.7 gallons"; "As the trip progresses, the pilot can note headings and time and make adjustments in heading, GS, and time."

## [4] Aeronautical Information Manual, chapter 5, section 1

https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap5_section_1.html

- 5-1-1: "Prior to every flight, pilots should gather all information vital to the nature of the flight, assess whether the flight would be safe, and then file a flight plan." "Where the FAA specifies Form 7233-1, Flight Plan and FAA Form 7233-4, International Flight Plan, the DoD may substitute their Form DD 175, Military Flight Plan and Form DD-1801, DoD International Flight Plan". Briefers "do not provide FDC NOTAM information for special instrument approach procedures unless specifically asked"; "Pilots are urged to use only the latest issue of aeronautical charts ... Sectional Charts are updated every 56 days, IFR En Route Charts every 56 days".
- 5-1-3: ARTCC NOTAMs "should also review NOTAMs for the ARTCC area"; "NOTAM information is classified as Domestic NOTAMs (NOTAM D), Flight Data Center (FDC) NOTAMs, International NOTAMs, or Military NOTAMs"; NOTAM (D) "includes taxiway closures, personnel and equipment near or crossing runways, and airport lighting aids that do not affect instrument approach criteria"; "FDC NOTAMs are issued when it is necessary to disseminate regulatory information" including "Amendments to published IAPs and other current aeronautical charts" and TFRs; "International NOTAMs are published in ICAO format"; "Military NOTAMs are NOTAMs originated by the U.S. Air Force, Army, Marine, or Navy, and pertaining to military or joint-use navigational aids/airports that are part of the NAS. Military NOTAMs are published in the International NOTAM format".
- 5-1-6: "Military/DoD flights using FAA Form 7233-1, or DD Form 175, may not be eligible for assignment of RNAV SIDs or STARs"; "ATC issues clearances based on aircraft capabilities filed in Items 10 and 18"; "When filing a capability, ATC expects filers to use that capability"; "Pilots should file IFR flight plans at least 30 minutes prior to estimated time of departure".
- 5-1-7: "Within U.S. controlled airspace, FAA Form 7233-1 or DD Form 175 may be used by DoD aircraft. However, use of the DD Form 1801 by DoD aircraft is recommended for IFR flights and is mandatory for: Any flight that will depart U.S. controlled airspace. Any flight requesting routing that requires Performance Based Navigation. Any flight requesting services that require filing of capabilities only supported in the international flight plan." "The order of flight plan elements in DD Form 175 is equivalent to that of FAA Form 7233-1."

## [5] 14 CFR part 91 (LII copy of the eCFR)

- § 91.151: "enough fuel to fly to the first point of intended landing and, assuming normal cruising speed— (1) During the day, to fly after that for at least 30 minutes; or (2) At night, to fly after that for at least 45 minutes"; rotorcraft "at least 20 minutes."
- § 91.167: "(1) Complete the flight to the first airport of intended landing; (2) ... fly from that airport to the alternate airport; and (3) Fly after that for 45 minutes at normal cruising speed or, for helicopters, ... 30 minutes". Applies to "a civil aircraft".
- § 91.169(b)–(c): no alternate needed if an approach exists and "For at least 1 hour before and for 1 hour after the estimated time of arrival, the ceiling will be at least 2,000 feet above the airport elevation and the visibility will be at least 3 statute miles"; alternate minima "Precision approach procedure. Ceiling 600 feet and visibility 2 statute miles. Nonprecision ... Ceiling 800 feet and visibility 2 statute miles."

## [6] Brevity

JOKER and BINGO are quoted from the site's brevity set (`content/encyclopedia/terminology/brevity.md`, its source [1], pp. 5 and 28): BINGO "Pre-briefed fuel state needed for recovery"; JOKER "Fuel state above BINGO at which separation or BUGOUT or event termination should begin."

## [7] Falcon BMS 4.38.1 Training Manual

- p. 41: "For this flight set a Joker level of 3000 lbs of fuel. Hit the ICP LIST button followed by ICP key 2 to select the BINGO page ... That will ensure that Betty calls 'BINGO BINGO' when the totalizer reads 3000 lbs".
- p. 66: "When the flight plan (or single leg) turns red there is a problem somewhere. Possible causes may be not enough fuel on board for the flight plan distances, timing problems, or steerpoint problems ... ensure your flight plan is white before flying the mission"; the UI Ruler "also displays the corresponding headings for the leg"; "The alternate runway is displayed in the flight plan as the last INS steerpoint" (the alternate is steerpoint 9 after a route ending at steerpoint 8); "There is no indication of TACAN channels or airport information on the UI map ... that information is important and must be planned for the flight ... WDP and its data card"; required information: TACAN, runways, ILS, elevation, ATIS, ground, tower, departure and approach frequencies for home and the alternate, active MOAs.

## [8] Falcon BMS 4.38 User Manual

- p. 48: "There are four basic weather types available in BMS: Sunny, Fair, Poor and Inclement"; tabs for "atmosphere (temperature and pressure), turbulence, wind and clouds"; deterministic, probabilistic or map model.
- p. 55: "The briefing page now displays a weather report with predicted weather at take-off and over the target at TOT and at landing. Always check the VHF ATIS frequency as you are near your airbase".

## [9] DCS User Manual (English, 2020)

- p. 65: "MISSION PLANNER. Pressing the Mission Planner button will open the selected mission in the Mission Planner and allow you to view it in detail, edit route and weapons of your flight."
- p. 109: "you can put graphic files with mission-relevant content, such as briefings, start / stop procedures, take-off / landing, etc., on the [RShift + K] kneeboard. Custom cards will be displayed at the end of the standard list"; a "Kneeboard" folder with a folder per module.
- pp. 112–113: sea level temperature, "Note that air temperature will affect aircraft performance"; cloud "Density is according to a 0 to 10 scale. 0 defines no clouds; 1 through 8 defines scattered clouds ... 9 and 10 define a solid cloud layer deck (overcast)"; "QNH ... in reference to mmHg".
- p. 179: "When either value is locked by the user, the mission editor automatically calculates the other value based on the known range between consecutive waypoints."
