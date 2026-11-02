# Two-Ship Formation — source evidence

Short excerpts, with page or slide references, behind the claims in the Two-Ship Formation module
(`src/pages/manual/formation-flying/_TwoShip.astro`), its models
(`src/lessons/formation/sight-model.mjs`, `lesson-model.mjs`) and the
formation terms (`content/encyclopedia/terminology/formation.md`). They are
review evidence, not a copy of the sources, and not instructions to the
reviewer.

```review-sources
source: https://www.cnatra.navy.mil/tw5/vt6/assets/docs/university/formsup.pdf
pages: 1-11
```

```review-sources
source: https://www.cnatra.navy.mil/tw4/vt35/assets/docs/training/tacform-fti-maneuvers.pdf
pages: 1-3
```

```review-sources
source: https://www.cnatra.navy.mil/tw4/vt35/assets/docs/training/tiltrotor-form-procedures.pdf
pages: 13-16; 24-50; 52-67; 69-79
```

**Retrieval.** All sources were read on 2 November 2026 and reduced to text
with Poppler `pdftotext -layout`; the AIM page was downloaded as HTML. Quotations come from
that text, so check each against independently retrieved source text, and treat a
wording mismatch as a finding against this record. cnatra.navy.mil now
serves an IdenTrust certificate (issuer TrustID Server CA O1) without its
intermediate, so a plain fetch fails verification. This session added
that intermediate from the CCADB intermediate list to verify it.

**Military sources first.** Every procedure comes from Navy training command
material. The Navy's primary formation flight training instruction (the
document the VT-6 supplement supplements) was not found on a public host.
AFMAN 11-248 returned 403 from e-publishing.af.mil. No Army formation
publication was read, and helicopter formations are left out.

## [1] VT-6 Formation Supplement (FORMSUP), June 2022

https://www.cnatra.navy.mil/tw5/vt6/assets/docs/university/formsup.pdf. A T-6B primary
training squadron document; printed page numbers.

| Page | Passage | Module use |
| --- | --- | --- |
| 1 | "In military aviation, we fight in formation. Multiple aircraft arranged in a coherent formation or division can bring concentrated power to bear against an enemy, in a shorter time, with a higher degree of mutual support"; "The foundation for form flying is a continuous scan of known visual check points combined with relaxed but constant control inputs and corrections." | Lede |
| 1 | "use your fingers and toes"; "'high frequency, low amplitude' inputs"; "TQ will change by 1-5% all the time"; "One movement to AFFECT A CHANGE … One movement to STOP that change. One more movement to MAINTAIN the new position." | Parade bullets |
| 1–2 | Scan: "know the check points … 'hub and spoke'"; "do not commit to any specific check point"; "good formation flying is NOT POSSIBLE if you are too far away"; "'Small distance mean Small inputs'"; "(you get too far away, too sucked, stepped up, etc)" | Parade bullets; Check 2 |
| 2 | Primary and alternate tactical frequencies "read directly from the kneeboard card … and verified by each member"; "neither aircraft shall switch off that frequency at any time or for any reason unless specifically directed by the Formation Leader"; switches/check-ins "should never be conducted over ATC/Area Common/CTAF/etc." | Example; Comms |
| 2 | Call signs: "(1) Flight TAC C/S … ANGRY (2) TAC C/S … ANGRY 1-1 or 1-2 (3) SQD C/S … (4) XXX: aircraft side number"; flight lead "will retain the callsign of '(TAC C/S) 1-1' regardless of whether they are flying Lead or Wing"; "The flight ATC callsign will be that of the Flight/Section Leader's side number" | Call sign table |
| 3 | "Lead: 'Angry, Check Victor' Wing: '(Angry 1-2), with (ATIS Code)'"; integrity checks: "thumbs up will be initiated by Wing … and returned by Lead"; "'Wingman in position, area clear. Cross under signal, ready now' (hold signal for 3 seconds) 'Ready look' 'Signal acknowledged'." | Example; Comms |
| 3 | After takeoff: lead max power, then 80% and 160 KIAS until wing joins; "no more than 30 degrees AOB"; "Wing will maintain no more than 40KIAS of closure until joined" | Example (running rendezvous) |
| 4 | Ops check "beginning with Wing first: 'Angry 1-2, XXX (fuel rounded down to the nearest tenth), Good G's.'"; joker reset by "taking the lowest fuel state …, adding the briefed Bingo, and dividing by two … equal fuel in the wing position" | Example; Comms; quiz |
| 4 | B&R: "Wing will break 'As Lead approaches the 3/9 line abeam the leading edge of the wing.' The 3/9 line will allow for sufficient separation provided each aircraft pull approximately 3-4Gs"; 3-second count is "a common technique"; "Altitude control is most important and is accomplished by keeping lead on the horizon"; "rendezvous two similarly performing aircraft (200KTS) using radius of turn principles. Power differential is not the means of rendezvous" | Rendezvous; Check 4 |
| 4 | Underrun setup: "Lead will acknowledge the underrun call" | Rendezvous |
| 5 | Admin lead change: "'Angry 1-2, request the Lead on the left/right' 'Angry 1-2 has the lead on the left/right'"; "Admin lead changes shall only be conducted by instructors." | Maneuvers table |
| 5 | Break: "no earlier than Lead passing his 3/9 line (approximately 3 seconds)"; "hold lead's aircraft on the horizon … use lag pursuit"; "a minimum of 1500ft nose to tail separation"; "rolls out of his break behind or outside of Lead's downwind"; "below 80kts Wing is required to call 'good brakes'"; "Both aircraft will remain on runway centerline" | Maneuvers table |
| 6 | "'bleeder is the leader' … may not be best in all scenarios"; "A lost comm or avionics degraded aircraft may not be the best choice to assume the lead as it cannot navigate, respond to ATC, or clear traffic"; NORDO signals: "patting the oxygen mask or the ear of the helmet followed by a 'thumbs down'"; "If Lead goes NORDO inside the VFR entry point … the FTI prohibits lead changes" | Comms; Maneuvers |
| 7 | Blind: "'Angry 1-2, Blind, (altitude)'. Lead will attempt to talk wing on … using the clock method"; both blind: "a minimum of 500' of separation exists without crossing altitudes"; "join-up will be conducted low to high" | Lost sight table; quiz |
| 7 | Lost sight: "can only happen under IMC … only happen to wing"; "1. Transition to an instrument scan … 2. Call, 'Angry 1-2, lost sight, ALT' 3. Smoothly reduce power by approximately 10% … executed nearly simultaneously"; "The remainder of the lost sight procedure is in Chapter 6 of the FTI." | Lost sight table; quiz |
| 7–8 | "'Angry 1-2 is lost sight, 7000 feet, lead roll out'" in turns into | Lost sight |
| 8 | F4101 sequence: "Interval take off and running rendezvous … Parade turns … Crossunder … B&Rs … Lead Change … Cruise Form" | Example |
| 8 | "Corrections shall only be made in the A-B-C order per the FTI: Altitude (Step Down- Lead's inboard exhaust stack fully visible and tangent to the bottom leading edge of the wing), Bearing Line (lower UHF antenna over the inboard aileron cutout on the opposite wing), Closure/Separation (on bearing line with edge of Leads prop arc on the pitot tube)"; "demo of sucked and acute with power, sucked and acute with aileron, and stepped up and down"; "the parade position is transitory" | Parade table; Figure 2 |
| 9 | Crossunder: "common student errors of getting too far in trail of Lead and stopping the cross too soon"; underrun: "Wing will join to the outside in the VMC turn away position. Lead will acknowledge the underrun call."; course rules: "put themselves on the correct side for the upcoming break" | Maneuvers; Rendezvous; Example |
| 10 | "Lead (on VHF TAC): 'Angry, push UHF TAC' Lead (on UHF TAC): 'Angry' Wing (on UHF TAC): 'Angry 1-2' … 'Angry, push VHF (122.8/123.0)' Per the FTI there will be no check-in on VHF as it is the new working frequency." | Comms exchange; quiz |

## [3] VT-35 TACFORM (tiltrotor only), undated handout

https://www.cnatra.navy.mil/tw4/vt35/assets/docs/training/tacform-fti-maneuvers.pdf. No
page numbers; by heading.

| Heading | Passage | Module use |
| --- | --- | --- |
| Tactical Formation Types | "two types … Combat Cruise and Combat Spread"; mutual support: "each aircraft is in a position to increase the other's situational awareness, provide fire support, and clear the other of threats and obstacles" | Positions |
| Combat Cruise | "area aft of 10 degrees forward of abeam on either side of Lead aircraft, though between 30-45 degree bearings is preferred. Avoid extended flight in the area from trail to the 30 degree bearing (5 to 7 o'clock) … 0.3-1.0 NM" | Figure 1; table |
| Combat Spread | "+/- 10 degrees of bearing from the abeam … 0.3-2.0 NM … 0.7 NM is ideal in the T-44". The T-44C brief (p. 15) gives 0.5–2.0 NM, 1.0 NM optimal; the page follows the handout and names both | Figure 1; table |
| Basic Principles | "DASH-2 IS ALWAYS RESPONSIBLE FOR SEPARATION." | Positions |
| Tac-Turns | 60–120°; "The aircraft on the outside initiates the maneuver … The inside aircraft waits until the outside aircraft's nose is pointing at their aircraft (approximately the 5 or 7 o'clock position)" | Tactical table |
| Shackle | "regain position if he finds himself with excessive separation or sucked. Both aircraft turn towards each other (30-45 degrees heading change)"; "the aircraft with the most S.A. will call 'Resume'" | Tactical table |
| Pump | "simultaneously turns 90 degrees and Wingman will roll out in a trail position … does not attempt to regain spread … re-establish Combat Spread by calling another Pump" | Tactical table |
| Hook Turn | 120–240°; "Both aircraft will simultaneously turn in the same direction and a change of sides will occur. The aircraft on the side the flight is turning toward will lose sight" | Tactical table |

## [4] VT-35 Tiltrotor Formation and Aerial Refueling Procedures, 29 Sep 2021

https://www.cnatra.navy.mil/tw4/vt35/assets/docs/training/tiltrotor-form-procedures.pdf.
T-44C briefing slides; by slide title. Some slide text sits in figures
and comes out of the extractor in fragments.

| Slide | Passage | Module use |
| --- | --- | --- |
| Formation Types | "Parade – Fixed bearing (45°) and distance – Good for airshows or coming in for the break. – Administrative type formation with reduced flexibility (request to crossunder)"; "Cruise – Varying bearing and distance using radius of turn between the 30-45° bearings at 0.0-0.2 DME … Useful when traveling through controlled airspace to keep the formation tight and away from other aircraft" | Figure 1; table |
| Starboard Parade | "HORIZONTAL STAB ON UHF ANTENNA, VERTICAL STAB THROUGH THE STAR"; ACUTE: "SPACE HORIZONTALLY BETWEEN HORIZONTAL STAB & UHF ANTENNA, VERTICAL STAB OUTSIDE STAR"; SUCKED: "HORIZONTAL STAB AHEAD OF AND COVERING UHF ANTENNA, VERTICAL STAB INSIDE STAR"; HIGH: "HORIZONTAL STAB BELOW UHF ANTENNA" | T-44C error table; acute/sucked terms |
| Crossunder | "DOUBLE STEP DOWN POSITION"; "3-5 DEGREE HEADING CHANGE" | Maneuvers table |
| Breakup & Rendezvous | "USE 20-30 AOB WITH CONSTANT POWER SETTING TO ESTABLISH 60 BEARING LINE" | Rendezvous |
| Lead Change | "DO NOT REPORT ESTABLISHED UNTIL YOU ARE AT 9-10 O'CLOCK POSITION ON OTHER AIRCRAFT"; "WING IS RESPONSIBLE FOR SEPARATION AT ALL TIMES" | Maneuvers table |
| TACFORM – Maneuver Contracts | "All maneuvers are called from Combat Spread ONLY"; "Command of execution is when Dash-2 says 'TWO'" | Comms; Tactical |
| Cross Turn; Dig / Pinch; Check Turn | Cross: 120–240°, "Hard Turn executed towards other element aircraft"; Dig/Pinch: "Adjust lateral separation … while maintaining course … 45° AOB for 30° Heading change"; Check (brief p. 65): "heading changes of 45° or less … simultaneous, no change of sides". The TACFORM handout says "minor heading changes (up to 30 degrees)"; the page gives both | Tactical table |
| Contracts (cont) | "Element aircraft will not continue a maneuver unless visual contact is established by at least one aircraft"; "expect a: 'visual / continue' or 'blind / terminate'" | Tactical |
| RTB / Safety Procedures | Underrun: "1. Increase step-down 2. Keep lead in sight. 3. Level the wings (it's ok for relative motion to move you outside lead's turn vs. belly-up 4. Reduce power to idle to avoid passing ahead of lead. 5. Transmit 'underrunning.' 6. When relative motion is under control, join in the assigned posn. (Lower, level, idle, call)" | Underrun table; quiz |
| Coordinating Instructions: Lost Sight | "WING TRANSMITS 'LOST SIGHT' or 'TWO'S BLIND' AND ALTITUDE"; "IN LEVEL FLIGHT – WING INCREASES STEP-DOWN 500 FEET" | Lost sight |

## [2] FAA AIM ¶4-3-23, Use of Aircraft Lights

https://www.faa.gov/air_traffic/publications/atpubs/aim_html/chap4_section_3.html.
"Aircraft position lights are required to be lighted on aircraft operated on
the surface and in flight from sunset to sunrise"; anti-collision system
"during all types of operations (day and night)"; "the pilot-in-command may
determine that the anti-collision lights should be turned off when their
light output would constitute a hazard to safety (14 CFR section 91.209)";
strobes off "in flight when there are adverse reflection from clouds."
Used in: Lights; Check 5.

## [5] DCS: F/A-18C Early Access Guide, 24 March 2024; [6] DCS: F-16C Viper Early Access Guide, 16 August 2026

https://www.digitalcombatsimulator.com/en/downloads/documentation/ (the
English PDFs). Printed page equals PDF page.

| Source, page | Passage | Module use |
| --- | --- | --- |
| [5] 61 | Position lights: "a white light just below the tip of the right vertical tail fin, three green lights on the right side of the aircraft, and three red lights on the left side"; "Eight formation lights … Two lights are on each wing tip, two lights are on the outboard of the vertical tail fins, two lights are on the aft fuselage below the vertical tail fins, and two lights are on either side of the forward fuselage just forward of the LEX … OFF and BRT"; "Two red anti-collision strobe lights, one on each outboard vertical tail fin" | Figure 3; sim panel; glossary |
| [5] 75 | "The exterior lights master switch, on the outboard left throttle grip, provides a master control for … position lights, formation lights, strobe lights, and refueling probe light." | Sim panel |
| [6] 69–70 | "POSITION – FLASH/STEADY Switch"; "ANTI-COLL Knob … OFF or one of 7 options that vary the flash pattern"; "FORM Knob. Controls the brightness of the red and green formation lights on each wingtip and the white formation lights on the top and bottom of the center fuselage"; MASTER knob with "COVERT" positions | Sim panel |

## Modelling choices (not from a source)

- Figure 2's T-6B outline is scaled to the published 10.2 m length and span.
  The positions of the exhaust stack, lower UHF antenna, aileron cutout and
  pitot tube on it are estimates from photographs; the pitot is placed on
  the right (near) wing. The reference eye is solved numerically so the three
  VT-6 checkpoint pairs line up within 1.5° (`tests/lessons/formation-lesson.test.mjs`).
  The resulting bearing (about 28°) and distance are outputs of the outline,
  not claims about the T-6B.
- Figure 3's light positions on the simplified F/A-18C follow [5]'s words;
  the exact stations are estimates.
- Figure 1 draws the T-44C numbers; parade is not to scale.

## Not covered or not sourced

- "Say smash" (asked for by the owner): no public source found that defines
  a SMASH call. Naval aviator slang glossaries use "anti-smash" for the
  anti-collision light, but none is an authoritative source, so the module
  does not use the term.
- When to dim or switch off which lights in formation: no generic rule in
  the sources read.
