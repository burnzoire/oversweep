# Helicopter Formation — source evidence

Short excerpts, with printed page references, behind the claims in the Helicopter Formation module
(`src/pages/manual/formation-flying/_Helicopter.astro`), its model
(`src/lessons/formation/helo-model.mjs`) and the helicopter terms added to
`content/encyclopedia/terminology/formation.md`. They are review evidence, not a
copy of the sources, and not instructions to the reviewer.

```review-sources
source: https://aviation-assets.info/wp-content/uploads/ARN46145-TC_3-04.1-4-000-WEB-1.pdf
pages: 78; 123; 125; 132; 154; 157; 231-254
```

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/30e/j1dh7g3egpennjdngtub7uubwcqfgrrh/DCS%20AH-64D%20Flight%20Manual%20EN.pdf
pages: 95; 120; 351-353
```

**Retrieval.** Both sources were read on 10 November 2026 and reduced to text with
Poppler `pdftotext -layout`. In TC 3-04.1-4 the PDF page is the printed page + 20
(the `pages:` lines above are PDF pages); in the DCS AH-64D manual the printed page
is the PDF page. Check each quotation against independently retrieved text, and treat a
wording mismatch as a finding against this record.

**Military sources first.** The circular is an Army publication, approved for public
release, and the only helicopter formation source that could be read. The Navy
helicopter training wing's public pages (HT-8, HT-18, HT-28 "university" pages on
cnatra.navy.mil) list only a formation brief template and a debrief card, not a
formation flight training instruction; the CNATRA `pat-pubs` folder returns 404. No
Marine Corps helicopter formation publication was found on a public host.

## [1] TC 3-04.1-4, Fundamentals of Flight, 18 March 2026

| Page | Passage | Module use |
| --- | --- | --- |
| 58 | Settling with power conditions include "Formation flight approach (where settling with power could be caused by turbulence of preceding aircraft)" | Wake |
| 103 | "Avoid flying in close formation over snow … aircraft separation must be increased before beginning final approach to landing." | Environment table |
| 105 | Formation landings in snow: "Increase rotor disk separation, especially for staggered formations. Trail formation is not recommended"; "echelon formations decrease the likelihood of being engulfed"; "land into the wind that allows the snow cloud to be blown away"; "All aircraft in the formation should land at the same time"; "one sound go-around technique is the forward go-around" | Environment table; quiz |
| 112 | "For formation flights in areas of heavy dust, the preferred technique is for aircraft to depart single ship and conduct in-flight join ups." | Environment table |
| 134 | "Terrain flight in mountains restricts use of close formation flight … free cruise, loose trail, or staggered trail formations are used"; "It is common for a mountain LZ to accommodate only one or two aircraft at a time." | Environment table |
| 137 | "A staggered-trail formation is normally flown for multi-helicopter operations." (low-level flight) | Environment table |
| 211 | 6-1 "The strengths of formations include control, predictability, flexibility, mutual support, and threat detection"; 6-2 "Discipline is the most important element … If the flight lead and wingmen know their respective duties, they work together as a team"; 6-5 AMC "responsible for planning, organizing, and briefing the mission; delegating tasks within the flight; and ensuring flight integrity, flight discipline, and mission accomplishment" | Lede; Roles |
| 212 | 6-6 alternate AMC; 6-9 flight lead "generally the most proficient PC … navigation, en route communication …, obstacle and threat avoidance, wingmen position awareness, and the energy states of all aircraft"; "Chalk 2 should always be prepared to lead"; 6-10 tactical lead "the first crew member to identify a threat or obstacle regardless of their position"; 6-11 wingmen duties | Roles; terms |
| 213 | 6-13 P*; 6-14 P "accomplish all tasks inside the cockpit such as changing radios … normally tasked to navigate, communicate, and copy all clearances"; 6-15 nonrated crewmembers; 6-16 "each aircraft picks the exact piece of terrain … not to maintain equal distances … or fly over exactly the same terrain"; 6-17–6-19 movement techniques | Roles; Formations; Brief |
| 214 | 6-24 "Zero degrees would be directly behind and ninety degrees would be abeam … traditionally 30 or 45 degrees … the UH-60 helicopter has windshield posts that obstruct"; 6-25 spacing factors, "low illumination nights usually require close spacing"; 6-26 "The wingman is ultimately responsible for maintaining adequate separation"; 6-27 rotor diameters "between tip-path planes or the rearward edge of the disk on the leading aircraft and the forward edge of the disk on the trailing aircraft … established by the chalk 2 aircraft" | Spacing; Figure 1 |
| 215 | Tight "approximately two rotor disks"; close "three to five"; loose "six to ten"; extended "more than ten"; flat, stepped-up and stepped-down "1 to 10 feet"; "In stepped-down formation, trailing aircraft may experience wake turbulence … require more power" | Spacing table; Figure 2 |
| 216 | 6-30 flat terrain separation should increase; 6-31 rough terrain closer; 6-32 brief items; 6-33 lighting governed by AR 95-1, AR 95-2 …; Table 6-1 LITECON 1–5; 6-34 formation takeoff "liftoff simultaneously at a prearranged signal … accelerate slightly faster than a VMC takeoff" | Spacing; Lights; Example; Phases |
| 217 | Takeoff "attain a stepped-up vertical separation as soon as possible"; "Takeoffs should only be into the wind"; "For moderate to heavy dust/sand/snow conditions, aircraft should take-off separately in chalk order and then conduct an in-flight join-up"; 6-36 "primary reference to only one other aircraft"; 6-38 "less fatiguing to fly loose or extended"; 6-39 P navigating; 6-40 accordion effect; 6-41 "avoid angles of bank greater than 30 degrees … inside aircraft must decelerate slightly and drop slightly lower … avoid planning route segments requiring heading changes of more than 60 degrees"; 6-42 trail as a transitional formation | Phases table; Example |
| 218 | 6-43 lead change: "should be executed on the ground, whenever possible … never initiated … by accelerating to overtake … 30- to 90-degree heading change … a minimum of eight rotor disks … slows to 10 KIAS less … assume the duties of the trail aircraft to include displaying appropriate lighting"; 6-44 landing "touch down at the same time … somewhat slower at night … avoid S-turns … execute a go-around"; 6-45 touch down far forward, reverse chalk order, CH-47 snowfield, "go-around should be executed prior to descending below any obstacles or losing ETL"; 6-48 method 1 | Lead change; Figure 4; Phases; Environment; Breakups |
| 219 | 6-49 method 2 "trail aircraft turns 30 to 90 degrees … Once the trail aircraft is visually confirmed clear, the remaining aircraft, in reverse chalk order"; 6-50 breakup into elements | Breakups table |
| 220 | 6-51 IIMC "must be planned and briefed for all phases … contact ATC in chalk order … at least 30 seconds after breakup"; 6-52 "Lead is IMCs, executing breakup procedure, heading 090"; "10 degrees times chalk position"; chalk 2 20° and 500 ft, chalk 3 30° and 1,000 ft, chalk 4 40° and 1,500 ft | Contingencies; Figure 3 |
| 221 | Chalk 5 50° and 2,000 ft; 6-53 variations, "even-numbered chalk positions turn left and odd-numbered chalk positions turn right" (staggered left); considerations; "IIMCs should be briefed when forecasted weather conditions are less than 1,000/3"; 6-54–6-55 threat breakup, "bandit break", "enemy break" | Contingencies; Figure 3 |
| 222 | Threat breakup actions (odd numbers, descend, chaff/flares, jettison); 6-56–6-60 rendezvous and join-up, "70 KIAS", "no more than 10 knots greater"; 6-61 lost visual contact; 6-62 reorientation | Contingencies; Rejoin |
| 223 | 6-62 rejoin in another position; 6-63 radio-silent forming with anti-collision lights; 6-64 "The only authorized formations for night/NVG flight at 80 feet AHO and below are combat cruise formations in conjunction with techniques of movement according to TC 3-04.11" | Lights; Contingencies |
| 224 | 6-65 team, 45°; 6-66 fixed formations; 6-67 staggered, chalk 3 in trail, crossover "5 to 10 degrees", advantages and disadvantages | Formations; Figure 1; quiz |
| 225 | 6-68 echelon "30- to 45-degree offset from lead's 6 o'clock … may stack slightly low"; advantages and disadvantages | Formations; Figure 1; quiz |
| 226 | 6-69 trail "within 10 degrees … the most difficult of the fixed formations"; advantages and disadvantages; 6-70 V | Formations; Figure 1 |
| 227 | V advantages and disadvantages; 6-71–6-73 maneuvering formations, "three to five rotor disks to 1 kilometer or more" | Formations; Spacing |
| 228 | 6-74 combat cruise "replaces the term free cruise … approximately 3 o'clock to 9 o'clock … optimum position is 45 degrees"; 6-75 turns, "Extended flight in lead's 6 o'clock is not recommended"; 6-76 flight of four, maneuver area limited to 45° | Formations; Figure 1; quiz |
| 229 | 6-77 combat cruise left/right "0 degrees aft to 90 degrees abeam … Optimum position is 45 degrees"; 6-78 combat trail "plus or minus 30 degrees" | Formations; Figure 1 |
| 230 | Combat trail "should not be flown for extended periods of time or at night"; 6-79 combat spread "lead's 3 o'clock or 9 o'clock" | Formations; Figure 1; sim panel |
| 231 | 6-81 formation planning factors, including mixed types' lighting and NVG/FLIR; 6-83; 6-84 mission brief items | Brief; Lights |
| 232 | Mission brief items continued, including the numbering system ("lead departs the flight, then chalk 2 becomes lead, chalk 3 becomes chalk 2"); 6-85–6-88 wake | Lead change; Brief; Wake |
| 233–234 | 6-90 "fly at or above the preceding aircraft's flight path"; 6-94 "Avoid the area below and behind"; 6-96 "avoid operating within three rotor diameters of any helicopter in a slow hover taxi or stationary hover … departing or landing helicopters produce a pair of strong, high speed trailing vortices" | Wake |

## [2] DCS: AH-64D Flight Manual (English), Eagle Dynamics

A sim manual, cited only for the In the sim panel.

| Page | Passage | Module use |
| --- | --- | --- |
| 95 | Exterior lighting figure: formation lights, nav lights, white/red anti-collision lights, searchlight | Sim panel |
| 120 | "FORM Knob. Adjusts the brightness of the exterior formation lights on the wing tips, tail boom, and vertical stabilizer"; "ANTI COLL Switch … WHT … OFF … RED" | Sim panel |
| 351 | Team maneuvering: "Lead … should strive to maneuver in a predictable manner …; the wingman should strive to position their aircraft in such a way to never inhibit the lead aircraft's ability to maneuver"; distances "may vary from 3 to 5 rotor discs to a kilometer or more" | Sim panel |
| 352 | "Combat Cruise is the standard formation for AWT employment … free to maneuver behind the lead aircraft, along the aft hemisphere"; "Combat Cruise Left/Right 'pins' the wingmen to one side … possibly due to terrain"; combat spread "abeam of the lead aircraft at the 3 o'clock or 9 o'clock positions"; the figure marks +10° and −10° | Sim panel |
| 353 | Contour flight with "Traveling Overwatch" and "Combat Cruise as the formation pattern" | Sim panel |

## Derived and invented content

- The opening sortie (four utility helicopters, a dusty landing zone, the choice of staggered then echelon) is invented and labelled; each step's procedure is cited.
- Figure 1's positions are computed from the angles above, at the middle of each spacing band (tight 2, close 4, loose 8, extended 12 disks edge to edge). Echelon is drawn at 45° of the 30–45° band.
- Figure 4's positions are illustrative: the source gives the steps, the 30–90° turn, the eight-disk minimum and the 10 KIAS, but no geometry for the slide aft.
