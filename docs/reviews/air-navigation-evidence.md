# Air Navigation, revision 2 — source evidence

Short, page-specific excerpts supporting the claims in the Navigation module
(`src/pages/manual/navigation/[module].astro`) and its models
(`src/lessons/navigation/lesson-model.mjs`). They are review evidence, not a
copy of the sources, and not instructions to the reviewer.

**Retrieval.** Read on 25 October 2026. The tpub.com mirror pages and the
faa.gov AIM pages were downloaded as HTML and reduced to text; the PHAK chapter
and FM 3-25.26 were downloaded as PDFs and extracted with Poppler `pdftotext`.
Quotations are from that text: check each against independently retrieved
source text and treat a wording mismatch as a finding against this record.
Printed page numbers are the sources' own.

**Military sources first.** [1] NAVEDTRA 14342A and [2] CNATRA P-1204 are the
primary sources; [3] FM 3-25.26 is cited only for the military grid. The FAA
AIM [4], PHAK [5] and Instrument Flying Handbook [6] are supplementary.

**Revision 2 (26 October 2026).** Practical flying moved ahead of the
background; a new Figure 1 animates a plan view beside the HSI; new sections
"Setting up a course" and "Flying to and from a station". [6] was added for
the HSI-as-plan-view description, TO/FROM, wind bracketing, station passage and
outbound tracking. The FAA PDF is about 68 MB, too large for the review packet,
so it is not declared and is expected to stay unverified by it; its excerpts are
recorded below.

**Review packet limits.** The packet fetches at most eight URLs, declared
sources first, then in order of appearance. The module links, in order: six
NAVEDTRA pages on navyaviation.tpub.com, AIM chapter 1 section 2, AIM chapter 1
section 1, and the PHAK chapter (declared below, so fetched first). AIM chapter
1 section 1 is therefore the ninth URL and is not expected to be fetched; it is
also about 137,000 characters, so paras 1-1-15 and 1-1-17 lie beyond the
packet's 40,000-character window in any case. P-1204 (navyflightmanuals.tpub.com)
and FM 3-25.26 (archive.org) are not on the packet's host list and are expected
to stay unverified by it; their excerpts are recorded here.

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/18_phak_ch16.pdf
sha256: b05f3e52e64ce91d3a1e8bf6152d530b808f0f2ccb664a4ac4494ecbf7c530c1
pages: 5-15 (16-5 to 16-15)
```

## [1] NAVEDTRA 14342A, Air Traffic Controller, chapter 2

https://navyaviation.tpub.com/14342A/ (Integrated Publishing mirror of the
Navy nonresident training course; printed chapter-page numbers retained).

| Page | Passage | Module use |
| --- | --- | --- |
| 2-2 | "Of the three problems facing every navigator, determining position is the most important. Unless the aircraft s position is known, the movements of the aircraft cannot be directed with accuracy." The three problems include "How to determine the direction in which to proceed" and "How to determine distance and the related factors of time and speed" | Overview |
| 2-3 | "The diameter at the equator equals approximately 6,888 nautical miles (nm). The polar diameter is approximately 6,865 nm"; "For the purposes of navigation, we assume that we are working with a perfect sphere." | Position on the earth |
| 2-4 | Latitude "from the equator (0 L) to the poles (90 L). The suffix "north" or "south" is an essential part"; longitude "measured in degrees of arc, from 0 to 180 east or west from the prime meridian"; great circle definition | Position on the earth |
| 2-5 | "The numerical system divides the horizon into 360 degrees, starting with north as 000 degrees and continuing clockwise" | Direction |
| 2-6 | True, magnetic and compass heading; "The angle between magnetic north and true north is termed variation"; "Deviation varies as an aircraft changes headings"; "deviation is determined for each heading that differs by approximately 15 degrees" | Direction |
| 2-7 | "The sum of variation and deviation is termed compass error."; "the international nm, 6,076 feet"; "1 minute of arc on the equator is equal to 1 nm, and 1 minute of arc on a meridian (1 minute of latitude ) is equal to 1 nm" | Position; Figure 1 resolution |
| 2-10 | "a fix is an accurate position"; "each fix is established by two or more LOPs" | Fixes |
| 2-11 to 2-13 | "RB is the angle measured from the longitudinal axis of the aircraft clockwise to a line passing through an object"; "if an object was directly behind an aircraft, its relative bearing would be 180 regardless of the aircraft's heading"; Figure 2-6 relationship between TH, RB and TB | Direction; Figure 2 |
| 2-14 | "TACAN provides bearing and distance information"; radar fix by "relative bearing and the aircraft s distance from known landmarks" | Fixes |
| 2-24 | "the FAA has the statutory authority to establish, operate, and maintain a common system of air navigational facilities" | Radio navigation aids |
| 2-26 | NDBs "normally operate in the frequency band of 190 to 535 kHz"; "UHF NDBs operate in the frequency band of 275 to 287 MHz" | Navaid table |
| 2-27 | ADF "senses and indicates the direction to an NDB"; NDB limitations: "signal fade and static during stormy weather"; "homing normally results in a curved course being flown"; VOR "not affected by weather or other factors common to ADF" | Navaid table |
| 2-28 | "VORs operate on frequencies between 108.0 and 117.95 MHz"; "Regardless of heading, an aircraft on the 090 radial is physically located due east of the station. When an aircraft flies to the station on this radial, its magnetic course is 270."; accuracy "generally 1"; TACAN "provides continuous slant range distance"; "126 two-way channels"; frequencies 1025–1150, 962–1024 and 1151–1213 MHz; "identifies itself aurally through Morse code every 35 seconds"; "limited to 120 simultaneous replies for distance information"; ground equipment "compact and relatively easy to transport" | Navaid table; Radials |
| 2-29 | VORTAC services: VOR azimuth, TACAN azimuth, TACAN distance; paired channels; DME "up to 199 nm at line-of-sight altitude with an accuracy of better than 1/2 mile or 3 percent of the distance, whichever is greater"; "Aircraft equipped with TACAN equipment will receive distance information from a VORTAC automatically" | Navaid table |
| 2-30 | "It is now routine for a pilot to maneuver from one radial/DME fix to another."; reduced separation and tighter holding with DME; omniranges spaced for reception at minimum en route altitude | Fixes; Radio aids |
| 2-33 | GPS "maintained by the United States Air Force and is made up of 24 32 satellites located within the earth s medium orbit"; "use of at least three satellites"; "exact timing is required"; outages and NOTAMs; WAAS "to provide precision approaches with a tolerance of 25 feet, both laterally and" vertically (continues on 2-34) | Satellite navigation |

The text on 2-14 also states that the TACAN was developed because VOR/DME was
"considered unsuitable due to specific military or naval operations (like
unusual site conditions, pitch and roll of naval vessels, etc.)"; AIM 1-1-5
says the same.

## [2] CNATRA P-1204, Flight Training Instruction, Instrument Flight, T-45C (TS, ADV and IUT), (4-01) Original

https://navyflightmanuals.tpub.com/P-1204/ (Integrated Publishing mirror;
printed page numbers retained in each page's text). An older revision of the
T-45C instrument FTI.

| Page | Passage | Module use |
| --- | --- | --- |
| 1 | Basic Instruments, Radio Instruments ("identifying your aircraft's position in relation to radio navigational aids on the ground"), Airways Navigation; "Remember the rule: "Aviate, Navigate, Communicate."" | Overview |
| 12 | HSI with "Global Positioning/Inertial Navigation Assembly (GINA)"; "The aircraft symbol is fixed in the center of the display, heading up. Ground speed, and wind direction and speed are below the aircraft symbol."; ground-track marker; "The head and tail of the TACAN bearing pointer are located on the outer edge of the compass rose. The head and tail of the VOR or waypoint bearing pointer are located on the inner edge" | HSI; Figure 4; INS |
| 13 | "If TACAN or VOR is the selected steering, each dot represents 5 degrees of course deviation. For waypoint or waypoint offset steering ... With the landing gear up, full scale deflection of the inner CDI bar represents a +/- 4.0-nm cross track deviation. With the landing gear down, a full scale deflection represents a +/- 0.3-nm"; planimetric course line; scales "10, 20, 40, 80, or 160 nautical miles"; "Digital bearing, slant range distance, and time-to-go"; "A sequential steering string of two or more waypoints can also be displayed as a dashed line" | HSI; Figure 4; Waypoints; Figure 8 |
| 64 | "There are two ways to fly to a NAVAID—by homing and by proceeding direct"; "in the presence of a crosswind, a homing aircraft will fly an arcing route"; tune and identify, turn the shorter direction, centre the course, ground track marker under the lubber line | Intercepts |
| 65 | VOR station passage "when the bearing pointer falls past the 90 degrees reference benchmark"; "TACAN station passage, due to increased size of the cone of confusion associated with TACAN stations, is noted when minimum DME is reached"; "The difference between the lubber line and the ground track marker is your "crab angle.""; intercept angle "normally greater than the number of degrees you are from your desired course, but it must not exceed 90 degrees"; "Lead point for course intercepts is calculated as 1 percent of your ground speed for an intercept angle of 90 degrees" | HSI; Wind; Intercepts |
| 66 | "a 45-degree intercept would require one-third as much lead as a 90-degree intercept"; "The CDI course line starts to move once you are within 10 degrees of that course. When you are 60 nm from the station, the radials are 1 nm apart and at 30 nm, they are 1/2 nm apart."; 30-degree method: "look from the desired course on the compass card to the head of the bearing pointer used and 30 degrees beyond"; double angle off the bow "could be as little as 1 or 2 degrees or as much as 45 degrees"; weigh distance, radial spread and wind | HSI; Intercepts; Figure 5 |
| 68 | Double angle off the bow: "an equal number of degrees beyond ... (max 45 degrees)" | Intercepts; Figure 5 |
| 69 | After station passage: "turn parallel to your desired course"; "look from the tail of the bearing pointer used to the desired course and an equal number of degrees beyond, but not more than 45 degrees" | Intercepts; Figure 5 |
| 70 | 45-degree method: "look from the tail of the bearing pointer used to the desired course and 45 degrees beyond" | Intercepts; Figure 5 |
| 71 | Ground speed check: "your DME from the station must be greater than or equal to your altitude in thousands of feet"; "flying either directly to or directly from a station"; "12 nm/2 min = 6 X 60 = 360 kts"; "12 nm in 3 minutes = 4 nm/min = 240 kts"; "The GINA also calculates ground speed"; TACAN time-to-go "only valid if the DME from the station is greater than or equal to your altitude in thousands of feet"; "The time-to-go in the waypoint data block is not based on slant range" | DME; INS |
| 72 | Radial-to-arc: "use 1 percent of your ground speed ... at a ground speed of 250 kts, your lead point will be 2.5 DME prior"; "When inbound to the arc, add the 1 percent to the arc DME and when outbound, subtract"; "1/2 SRT turn"; "For turns of approximately 45 degrees, use 1/3 ... approximately 60 degrees, use 2/3 ... Turns of 30 degrees or less require very little lead"; Figure 21 "1% GS = Radius of Turn" | DME arcs; Figures 5 and 6 |
| 73 | "the chord method is generally more practical when you're flying a distant arc (usually more than 12 DME ...), while the angle of bank method usually works better ... (12 DME or less)"; bearing pointer "5-10 degrees ahead of the 90-degree benchmark" and "5-10 degrees behind"; Figure 22 "Correct 5-10 degrees for each 1/2 mile deviation from arc" | DME arcs; Figure 6 |
| 74 | Angle of bank method; "The closer you are to a station, the greater your bank angle will be"; "Radials diverge ... and are 1 nm apart at 60 DME" | DME arcs |
| 75 | "Divide the arc DME into 60, then multiply the quotient by 1 percent of the ground speed. For example, if you are on a 15 DME arc at 250 kts ground speed, your lead point will be 10 radials"; "Do not exceed 30 degrees AOB"; correction for arcs less than 10 DME | DME arcs; Figure 6 |
| 76 | Correction factor formula; table "Approximate Lead Radials for 250 KGS": 20 DME 7.5; 15 DME 10; 10 DME 15, 18, 13; 7 DME 21, 27, 16; 5 DME 30, 40, 20; "When cleared direct to a fix, you will have to use radar vectors, traditional point-to-point navigation, or waypoint offset navigation" | DME table; Point to point |
| 77–78 | Traditional point-to-point: "The aircraft HSI display will function as a plotting board"; fix with the greater distance at the edge of the rose; aircraft on the tail of the bearing pointer; "Move the line to the center of the HSI display, paralleling the original imaginary line, and read the course"; "Repeat the point-to-point procedure periodically en route" | Point to point; Figure 7 |
| 79 | Waypoint offset: select the waypoint for the NAVAID, enter bearing and range; "Range is limited to 0.0-99.9 nm"; "Bearing is 000-359.9 degrees"; "Changing the position of the waypoint after entering offset data automatically sets offset data for that waypoint to zero"; Mission Data Loader "200 waypoints" | Point to point; Waypoints |
| 80 | "Verification of a successful transfer of waypoint information is accomplished by comparing the two waypoint data blocks"; manual entry: "LAT ( latitude ), LONG (longitude), ELEV (elevation), or MVAR (magnetic variation)" | Writing a position; Waypoints |

Modelling choices, recorded here so they can be checked:

- Figure 5 draws the turn onto the course with a radius of 1% of ground speed,
  from the FTI's Figure 21 note for a half-standard-rate turn. The FTI's 2/3
  and 1/3 lead ratios for 60° and 45° are rules of thumb; the drawn turn's
  geometric start can differ slightly, and the caption says so.
- The FTI gives ratios only for about 90°, 60°, 45° and 30° or less;
  `leadNm` uses the nearest of those for other angles.
- The FTI's correction formula for arcs inside 10 DME does not reproduce its
  own table at 7 and 5 DME (for example 21.4 + 3.1 ≈ 24.5 against the table's
  27 inbound at 7 DME). The module shows the table and the 90° formula, not
  the correction formula.
- The HSI figure shows two dots each side of the CDI at 5° a dot, consistent
  with "each dot represents 5 degrees" and the CDI starting to move "within 10
  degrees". The number of dots is not stated in the text read.

## [3] FM 3-25.26, Map Reading and Land Navigation, 20 July 2001

https://archive.org/download/MManuals/Fm3-25.26MapReadingAndLandNavigation.pdf
(245 pages; "DISTRIBUTION RESTRICTION: Approved for public release;
distribution is unlimited.").

| Page | Passage | Module use |
| --- | --- | --- |
| 3-3 | Horizontal datum note: "Map readers should habitually check the horizontal datum note on every map or chart"; "UTM coordinates from the same point computed on different data may differ as much as 900 meters." | Datum |
| 4-12 | MGRS "reduces the length of written coordinates by substituting single letters for several numbers"; "60 N-S zones, each 6° wide ... numbered from west to east, 1 through 60, starting at the 180° meridian"; "20 east-west rows in which 19 are 8° high and 1 row at the extreme north is 12° high ... lettered, from south to north, C through X (I and O were omitted)"; "the number is always written before the letter" | Writing a position; Figure 1 |
| 4-13 | UPS letters A, B, Y, Z for the polar areas; 100,000-metre squares "identified by the combination of two alphabetical letters ... unique within the area covered by the grid zone designation. The first letter is the column designation; the second letter is the row designation" | Writing a position |
| 4-21 | "Coordinates are written as one continuous number without spaces ... they must always contain an even number of digits"; "It is a military requirement that the 100,000-meter square identification letters be included"; "Normally, grid coordinates are determined to the nearest 100 meters (six digits) for reporting locations"; targets "to the nearest 10 meters (eight digits)"; "always read to the RIGHT and then UP" | Writing a position |
| 4-22 to 4-23 | 10,000-metre and 1,000-metre squares; "16SGL0182 ... gives the location of the southwest corner of grid square 0182" | Writing a position; Figure 1 truncation |
| J-2 | GPS formats: "Degrees, Minutes, Seconds (DMS)", "Degrees, Minutes (DM)", "Universal Traverse Mercator (UTM)", "Military Grid Reference System (MGRS)"; "GPS makes determining a 4-, 6-, 8-, and 10-digit grid coordinate ... easy" | Writing a position |

The MGRS conversion in the model uses the standard WGS 84 UTM projection and
NGA lettering (column sets by zone modulo 3, row letters offset by five in even
zones). Its unit tests compare against references computed with PROJ and the
`mgrs` package (GeoTrans lettering); the FM describes the system but does not
give the lettering algorithm.

## [4] FAA Aeronautical Information Manual

| Para | Passage | Module use |
| --- | --- | --- |
| 1-1-1 | "Pilots should disregard any navigation indication, regardless of its apparent validity, if the particular transmitter was identified by NOTAM or otherwise as unusable or inoperative." | Radio aids; Cross-checking |
| 1-1-2 | NDB "190 to 535 kilohertz"; "ADF receivers do not have a "flag" ... the pilot should continuously monitor the NDB's identification" | Navaid table; Cross-checking |
| 1-1-3 | VOR "108.0 to 117.95 MHz", line of sight; "The only positive method of identifying a VOR is by its Morse Code identification or by the recorded automatic voice identification"; T-E-S-T code during maintenance; accuracy "plus or minus 1 degree"; VOR MON; "Pilots flying GPS- or WAAS-equipped aircraft that also have VOR/ILS avionics should be diligent to maintain proficiency in VOR and ILS approaches" | Navaid table; Cross-checking |
| 1-1-5 | TACAN developed for "unusual siting conditions, the pitching and rolling of a naval vessel"; "the end result, as far as the navigating pilot is concerned, is the same"; "Its use requires TACAN airborne equipment and does not operate through conventional VOR equipment" | Radio aids |
| 1-1-6 | VORTAC: "VOR azimuth, TACAN azimuth and TACAN distance (DME) at one site"; paired channels | Navaid table |
| 1-1-7 | DME to "199 NM at line-of-sight altitude with an accuracy of better than 1 / 2 mile or 3 percent"; "Distance information received from DME equipment is SLANT RANGE distance and not actual horizontal distance." | Navaid table; HSI |
| 1-1-8 | Standard service volumes; "A conical area directly above the NAVAID is generally not usable for navigation." | Radio aids |
| 1-1-15 | IRUs "comprised of gyros and accelerometers"; "Once aligned with a known position, IRUs continuously calculate position and velocity. IRU position accuracy decays with time. This degradation is known as "drift.""; "INSs combine the components of an IRU with an internal navigation computer. By programming a series of waypoints, these systems will navigate along a predetermined track." | Inertial navigation |
| 1-1-17 | "The Department of Defense (DoD) is responsible for operating the GPS satellite constellation and monitors the GPS satellites to ensure proper operation" (the site uses this over 2-33's "maintained by the United States Air Force"); "The 24 satellite constellation is designed to ensure at least five satellites are always visible"; "A minimum of four satellites is necessary for receivers to establish an accurate three-dimensional position"; RAIM "requires a minimum of 5 satellites, or 4 satellites and barometric altimeter input"; "Without RAIM capability, the pilot has no assurance of the GPS position integrity"; database currency and in-flight waypoint checks; "Manual entry of waypoints using latitude/longitude or place/bearing is not permitted for approach procedures." | Satellite navigation; Waypoints |
| 1-2-1 | RNAV definition; "A waypoint is a predetermined geographical position that is defined in terms of latitude/longitude coordinates"; fly-by ("turn anticipation") and fly-over; TF ("sometimes called point-to-point legs"), DF ("turn right direct BRAVO WP"), CF, RF and heading legs; inertial systems "often coupled with other types of navigation inputs, e.g., DME/DME or GPS" | Waypoints; INS; Fixes; Figure 8 |
| 1-2-3 | "a named fix defined by a VOR radial, TACAN course, NDB bearing, or compass locator bearing intersecting a VOR or localizer course" | Fixes |
| 1-2-4 | GPS "vulnerable to intentional and unintentional interference"; jamming and spoofing impacts including "Inability to use hybrid GPS inertial systems for navigation", "Inaccurate aircraft position on navigation display", "Erroneous wind and ground speed indications"; government GPS test events by NOTAM; "Routine checks of position against VOR or DME information ... could help detect a compromised GPS signal"; pre-flight and in-flight recommendations; "promptly inform Air Traffic Control (ATC) of any apparent GPS degradation" | Satellite navigation; Cross-checking |

## [5] FAA Pilot's Handbook of Aeronautical Knowledge, FAA-H-8083-25C, chapter 16

Declared above; physical page = printed page (16-n is physical page n).

| Page | Passage | Module use |
| --- | --- | --- |
| 16-5 | UTC "is the time at the 0° line of longitude which passes through Greenwich"; "Because meridians converge toward the poles, course measurement should be taken at a meridian near the midpoint of the course" | Position on the earth |
| 16-6 to 16-7 | Variation; isogonic and agonic lines; "If the variation is shown as "9° E," ... If a TC of 360° is to be flown, 9° must be subtracted from 360°, which results in a magnetic heading of 351°" | Direction; Figure 2; tests |
| 16-8 | ""east is least (subtract) and west is best (add)""; deviation card; "swinging the compass" | Direction |
| 16-9 | "an aircraft flying eastward at an airspeed of 120 knots in still air ... If the mass of air is moving eastward at 20 knots ... GS of 140 knots"; heading, track, drift angle, WCA; "TH ± variation (V) = magnetic heading (MH) ± deviation (D) = compass heading (CH)" | Direction; Wind |
| 16-10 | Definitions of course, heading, track, drift angle, WCA, airspeed, GS | Direction; Terms |
| 16-13 | "Dead reckoning is navigation solely by means of computations based on time, airspeed, distance, and direction." | Wind |
| 16-14 to 16-15 | Example: TC 090°, wind "40 knots from the northeast (045°)", TAS 120 kt; "the WCA is 14° and the wind is from the left; therefore, subtract 14° from TC of 090°, making the TH 076°"; "(88 NMPH or 88 knots)"; "220 NM, divide by the GS of 88 knots, which gives 2.5 hours" | Wind; Figure 3; tests |

## [6] FAA Instrument Flying Handbook, FAA-H-8083-15B

Downloaded 26 October 2026 from
https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/FAA-H-8083-15B.pdf
and extracted with `pdftotext`. Printed page 5-23 is PDF page 118 and 9-14 is
PDF page 257.

| Page | Passage | Module use |
| --- | --- | --- |
| 5-23 | "This gives the pilot a pictorial presentation: the fixed aircraft symbol and course deviation bar display the aircraft relative to the selected course, as though the pilot were above the aircraft looking down."; "When the indicator points to the head of the course arrow, it shows that the course selected, if properly intercepted and flown, takes the aircraft to the selected facility." | Reading the HSI; Setting up a course |
| 9-14 | "If the CDI moves off center to the left, follow the needle by correcting course to the left, beginning with a 20° correction."; "a left deflection of the needle indicates a crosswind component from the left. If the amount of correction brings the needle back to center, decrease the left course correction by half." | Flying to and from a station (wind) |
| 9-14 | "If the movement is rapid or fluctuating, this is an indication of impending station passage"; "If the VOR is set to the reciprocal of the intended course, the CDI reflects reverse sensing ... To avoid this reverse sensing situation, set the VOR to agree with the intended course." | Station passage; Setting up a course |
| 9-14 | "The track is intercepted by either flying over the station or establishing an intercept heading. The magnetic course of the desired radial is entered under the index using the OBS and the intercept heading held until the CDI centers."; course interception: "Hold this heading constant until the CDI center ... (With practice in judging the varying rates of closure with the course centerline, pilots learn to lead the turn to prevent overshooting the course.)" | Outbound; Intercepts |

