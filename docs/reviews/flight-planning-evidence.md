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
AFMAN 11-202V3, AFH 11-203V2, CNAF M-3710.7 and FLIP General Planning
could not be fetched (e-publishing.af.mil 403, secnav rejected, cnatra
503/TLS), so they were read from PDFs the site owner supplied on 3 November
2026 and are not on the packet's host list; their excerpts are below
([10] to [13]). Releasability: both Air Force publications state "no
releasability restrictions"; General Planning states "No copyright claimed
under Title 17 U.S.C."; CNAF M-3710.7 says reproduction for nonmilitary use
needs CNO approval, so the pages only summarise it in their own words and
these excerpts are kept to short phrases.

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

## [10] AFMAN 11-202 Volume 3, Flight Operations, 10 January 2022, incorporating Change 1, 25 June 2026

Site page reference [9] in Planning a Sortie. Printed pages 62-65.

- 4.16.1-4.16.2: file an alternate when "A compatible instrument approach procedure is not available at the destination airfield" or forecasts "from 1 hour before to 1 hour after the estimated time of arrival ... including TEMPO conditions" are below "A ceiling of 2,000 feet above the airfield elevation and a visibility of 3 statute miles"; helicopters "1,000 feet (or 400 feet above the lowest compatible approach minimums, whichever is higher) and a visibility of 2 statute miles"; "Forecast crosswinds are outside aircraft limitations."
- 4.16.4.1: alternate forecast at or above "A ceiling of 1000 feet, or 500 feet above the lowest compatible approach minimums, whichever is higher; and a visibility of 2 statute miles or 1 statute mile above the lowest compatible approach minimums, whichever is higher"; TEMPO counts "except those caused by thunderstorms, rain showers, or snow showers".
- 4.16.5: not an alternate if "All compatible approaches require an unmonitored NAVAID", "The airfield does not report weather observations", or alternate is not authorised on all compatible approaches.
- 4.20.1-4.20.2: fuel "To a final landing, either at the destination airport or alternate airport (if required), plus fuel reserves"; with an alternate, "fuel required for an approach and missed approach at the intended destination must be included ... if visibility-only weather criteria is used".
- 4.20.3: "increase the total planned flight time between refueling points by 10 percent (up to a maximum of 45 minutes for fixed-wing or 30 minutes for helicopters) or 20 minutes, whichever is greater"; "For turbine-powered aircraft use fuel consumption rates that provide best endurance at 10,000 feet MSL" unless MAJCOM-defined rates.
- 4.20.4: multi-engine aircraft without in-flight refuelling over "large bodies of water or desolate land areas will calculate an Equal Time Point (ETP)".

## [11] CNAF M-3710.7, NATOPS General Flight and Operating Instructions Manual, 5 May 2016

Site reference [10] in Planning a Sortie and [6] in Weather and Performance. Printed pages 4-8 to 4-12. Short phrases only (reproduction restricted).

- 4.8.3: with any part of the route forecast under IMC, obtain "a flight route weather brief from a DoD-qualified forecaster or approved forecasting service".
- 4.8.4.2 and Figure 4-1: may file to a destination below minimums if the alternate is forecast "at least 3,000-foot ceiling and 3-statute- mile visibility"; otherwise alternate at published minimums plus 300-1 (non-precision) or plus 200-1/2 (precision).
- 4.8.4.3: alternate required when the destination is forecast "less than 3,000-foot ceiling and 3-statute-mile visibility" from 1 hour before to 1 hour after ETA.
- 4.8.5.1: fuel to destination, or to the destination's approach fix and then the alternate, "plus a reserve of 10 percent of planned fuel requirements"; reserve after final landing never less than "20 minutes of flight"; turbine fixed-wing at "maximum endurance operation at 10,000 feet"; type minimums in the NATOPS manual.
- 4.8.5.3: "Any known or expected traffic delays shall be considered time en route".

## [12] DoD FLIP General Planning, effective 2 January 2020 (NGA)

Site reference [11] in Planning a Sortie. Page 4-1.

- DD 175 "may be used for flights within the conterminous United States; and within Honolulu, Alaskan, and San Juan Domestic Control Areas"; "Flight plans desiring automatic assignment of RNAV SIDs, STARs, and desiring to fly RNAV routes must file using DD FORM 1801."
- DD 1801 "is recommended for domestic IFR flights and is mandatory for all IFR flights that will depart U.S. domestic airspace"; also for flights transiting Canadian airspace, "flown over international waters", which "penetrate a coastal Air Defense Identification Zone", or "any oceanic airspace ... or any other foreign airspace".
- ICAO form "may be used when the DD 1801 is not available"; FAA forms "in lieu of DD 175 [or DD 1801] when departing United States Installations not having a Military Base Operations facility."

## [13] AFH 11-203 Volume 2 / TC 3-04.14-2, Weather for Aircrews, 13 August 2015, Change 5, 13 December 2022

Site reference [5] in Weather and Performance. Printed pages 8-10.

- 1.6.1 and Table 1.1: home installation weather flight first, then the regional OWS, then other DoD, MAJCOM-approved, other US Government, and foreign services only when others are unavailable.
- 1.6.1.2: "The DD Form 175-1 is the standard briefing form"; a "mission execution forecast or weather flimsy ... may substitute for an individual weather brief".
- 1.6.1.3: "OWSs need a minimum of 2-hours notification"; Table 1.2 lists name (identify as a crew member), aircraft type/call sign, en route plan, altitude, departure/return times, destination, ETA, alternates, contact information.

