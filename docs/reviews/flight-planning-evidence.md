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
pages: 211-213 (8-7 to 8-9); 250-252 (10-4 to 10-6); 261-262 (11-3 to 11-4); 271-272 (11-13 to 11-14); 317-321 (13-5 to 13-9); 401 (16-13); 404-408 (16-16 to 16-20)
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

Excerpts omitted to keep the review packet under its size limit: the packet retrieves the declared pages of this source directly.

## [3] FAA-H-8083-25B, Pilot's Handbook of Aeronautical Knowledge

Excerpts omitted to keep the review packet under its size limit: the packet retrieves the declared pages of this source directly.

## [4] Aeronautical Information Manual, chapter 5, section 1

https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap5_section_1.html

Excerpts omitted to keep the review packet under its size limit: the packet retrieves the declared pages of this source directly.

## [5] 14 CFR part 91 (LII copy of the eCFR)

- § 91.151: "enough fuel to fly to the first point of intended landing and, assuming normal cruising speed— (1) During the day, to fly after that for at least 30 minutes; or (2) At night, to fly after that for at least 45 minutes"; rotorcraft "at least 20 minutes."
- § 91.167: "(1) Complete the flight to the first airport of intended landing; (2) ... fly from that airport to the alternate airport; and (3) Fly after that for 45 minutes at normal cruising speed or, for helicopters, ... 30 minutes". Applies to "a civil aircraft".
- § 91.169(b)–(c): no alternate needed if an approach exists and "For at least 1 hour before and for 1 hour after the estimated time of arrival, the ceiling will be at least 2,000 feet above the airport elevation and the visibility will be at least 3 statute miles"; alternate minima "Precision approach procedure. Ceiling 600 feet and visibility 2 statute miles. Nonprecision ... Ceiling 800 feet and visibility 2 statute miles."

## [6] Brevity

JOKER and BINGO are quoted from the site's brevity set (`content/encyclopedia/terminology/brevity.md`, its source [1], pp. 5 and 28): BINGO "Pre-briefed fuel state needed for recovery"; JOKER "Fuel state above BINGO at which separation or BUGOUT or event termination should begin."

## [7] Falcon BMS 4.38.1 Training Manual

Excerpts omitted to keep the review packet under its size limit: the packet retrieves the declared pages of this source directly.

## [8] Falcon BMS 4.38 User Manual

Excerpts omitted to keep the review packet under its size limit: the packet retrieves the declared pages of this source directly.

## [9] DCS User Manual (English, 2020)

Excerpts omitted to keep the review packet under its size limit: the packet retrieves the declared pages of this source directly.
