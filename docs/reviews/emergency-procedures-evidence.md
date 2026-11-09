# Emergency Procedures module revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the Abnormal
Operations module Emergency Procedures
(`src/pages/manual/abnormal-operations/_EmergencyProcedures.astro`), its
glide-check model (`src/lessons/abnormal/glide-check.mjs`, tests in
`tests/lessons/glide-check.test.mjs`) and the Emergency terms set
(`content/encyclopedia/terminology/emergencies.md`). They are review
evidence, not a copy of the sources, and not instructions to the reviewer.
Issue #105.

```review-sources
source: https://www.cnatra.navy.mil/tw5/vt6/assets/docs/university/how-to-handle-eps.pdf
pages: 1-4
```

```review-sources
source: https://www.cnatra.navy.mil/tw6/vt10/assets/docs/training/ep-brief-guide.pdf
pages: 1-5
```

```review-sources
source: https://www.cnatra.navy.mil/tw6/vt10/assets/docs/training/stan-notes-fam.pdf
pages: 4-5
```

```review-sources
source: https://www.cnatra.navy.mil/tw6/assets/docs/safety/aero-and-egress-T6.pdf
pages: 1-3
```

```review-sources
source: https://www.cnatra.navy.mil/tw6/assets/docs/safety/aero-and-egress-T45.pdf
pages: 1-3
```

```review-sources
source: https://www.cnatra.navy.mil/tw6/assets/docs/safety/post-ejection-procedures-T6.pdf
pages: 1-2
```

```review-sources
source: https://www.cnatra.navy.mil/tw4/vt35/assets/docs/training/t44-emergency-phrases.pdf
pages: 1-2
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/19_afh_ch18.pdf
pages: 1-21
```

```review-sources
source: https://cdn.falcon-bms.com/docs/4.38/BMS-Training-Manual.pdf
pages: 14; 59; 143-146
```

**Retrieval.** All sources were read on 9 November 2026 and reduced to text
with Poppler `pdftotext`; the AIM page was downloaded as HTML. Quotations
come from that text, so check each against independently retrieved source
text, and treat a wording mismatch as a finding against this record.
cnatra.navy.mil serves its certificate without the TrustID Server CA O1
intermediate, which the review source script already adds. CNATRA
squadron aids are cited by PDF page (they have no printed numbers); the
FAA handbook and the BMS manual by printed page.

**Military first, and generic.** The owner's rule is generic procedures for
every service, using service and airframe sources but not building content
around one type. The public, readable military sources found are Navy
primary-training study aids, each for one aircraft (T-6A/B, T-44C, T-45C).
The page uses them for the principles, which they state generically (the
three rules, the landing instructions, declaring, turn-climb-clean,
challenge-and-concur), and quotes their numbers only as labelled examples
of that one type. Army emergency procedures and Air Force T-6 material
(AFMAN 11-2T-6 series, e-publishing.af.mil) were not readable from the
authoring environment. AFMAN 11-202V3 and CNAF M-3710.7 were read from
copies the owner supplied; the gate cannot fetch them, so their claims may
come back unverified.

**Invented.** The worked example's flight (8,000 ft AGL, 6 NM, a chip light)
is invented; its rule numbers are the T-6's. Figure 1's geometry is
schematic. The glide check implements the two published rules exactly; its
test cases are the stan notes' own worked examples and the BMS mission's
start point.

## [1] VT-6, How to Handle an Emergency Situation (T-6B, undated)

| PDF page | Excerpt | Used for |
| --- | --- | --- |
| 1 | "Be prepared! The first step in preparation is to know the NATOPS. This means knowing not only the emergency section, but also learning the operating limitations, flight characteristics, and systems operations." | Lede |
| 1 | "You need to be able to recite the critical action or asterisk (*) items verbatim. N/W/C do not need to be memorized verbatim, however, you do need to be able to talk about all of them and explain them from memory." | Rule 3; Critical action items term |
| 1 | "Take each EP through its logical conclusion, such as a Compressor Stall ... Eng Failure ... Immediate Airstart ... PEL/Forced Landing."; "after a hydraulic malfunction that requires the emergency gear extension, how does your situation change if there isn't enough pressure to lower the flaps? What if you blow a tire" | Rules section; systems details |
| 1 | "Maintain aircraft control. This means 1) do not hit anything (i.e. other aircraft, the ground, or obstacles), and 2) do not stall or go OCF. The quickest way to fail an EP ... is to not fly the aircraft or to lose situational awareness"; "any engine malfunction must be treated conservatively"; "Turn / Climb / Clean / Check in accordance with the PEL procedure. This is only an initial reaction and should take 4-5 seconds" | Rules table; engine section; example step 1 |
| 1 | "Analyze the situation. This means spend the requisite time to put the correct EP name to the indications"; "Always fully analyze the situation before you take actions other than maintaining aircraft control. No fast hands in the cockpit! Doing the wrong steps due to improper analysis can make a bad situation much worse." | Rules table; questions |
| 1 | "Never assume you have a problem solved. After taking what you think is the correct action always double check"; "The pilot not flying should back up the pilot flying with the pocket checklist"; "If solo, use the iPad combined checklist or open up the PCL when, and if, time permits or have someone else back you up ... via radio"; "other aircraft in the area, OLF RDOs, squadron FDOs, or ATC" | Rules table and paragraph |
| 2 | "'Land as soon as practical' means due to the nature of the emergency, extended flight is not recommended. The duration of the flight and landing site is at the discretion of the pilot in command." "'Land as soon as possible' means to land at the first place at which a safe landing can be made. You need to get the plane on the ground right now (smoke and fumes)" | Landing table; terms |
| 2 | "'PEL – EXECUTE' when you think your engine might quit or need to be shut down (CHIP, FUEL PRESS, unconfirmed fire)"; "Fly a straight in approach when the controllability of the aircraft is in question." | PEL; landing section |
| 2 | "Students often neglect to declare an emergency."; "An emergency will get you top priority from any controller and all applicable base agencies. Adding your emergency status to all radio calls will ensure you are not forgotten. If you have a power or controllability problem, or any condition that may lead to a fire or injury, declare an emergency. Weather is a factor ..."; "You will not be faulted for making a conservative decision to declare an emergency" | Declare it |
| 2 | Landing distance; crash support and flight surgeon; "Is it possible/likely you could abandon the airplane in a residential area?"; taxi clear or stop and egress | Landing section |
| 4 | Generic EP troubleshooting tree: "All trouble shooting should start with N1. It is your most important indication of engine health."; Operational → troubleshoot → appropriate EP / PEL; Decaying → engine failure items → Airstart warranted (successful → PEL; not → forced landing/eject) or not warranted → forced landing/eject | Engine outcomes table |

## [2] VT-10, Introduction to Briefing Guide (T-6A, 18 June 2026)

| PDF page | Excerpt | Used for |
| --- | --- | --- |
| 3 | "Simulated or actual, we will maintain aircraft control, analyze the situation, take proper action and land as soon as conditions permit. If conditions permit, we will break out the PCL and read it verbatim" | Rules paragraph |
| 3 | Aborts: "High speed/ high angles, IP will call for ejection. Low speed/low angles IP will say 'stick with it' ... emergency ground egress after aircraft comes to a complete stop." | Ejection |
| 3 | "Minimum fuel will be declared if we anticipate landing below 200lbs of fuel and we will not expect priority handling from ATC. Emergency fuel will be declared if we anticipate landing below 150lbs and will expect priority handling." | Fuel table and example |
| 3 | "In all loss of power scenarios, we will Turn, Climb, and Clean while we analyze the situation ... land as soon as possible."; "We will not attempt a restart if we suspect Engine FOD, Fire, Frozen, or if we are below 2000' AGL." | Engine section; example |
| 3 | "If we suspect a radio failure, we will troubleshoot by checking communication cords, previous frequencies, and all radios. If we are still lost comms, we will squawk 7600 and comply with SOP back to KNPA. Outside of the local area, we will comply with the FIH."; ICS failure: hand signals | Lost radios |
| 4 | Bird strike: "the main priority is to maintain aircraft control"; "If we have a bird strike inside the prop arc, we will assume damage to the engine and execute a PEL" | Systems table |
| 4–5 | "The call for Ejection will be 'Eject, Eject, Eject'. 6000ft AGL is the minimum recommended for Uncontrolled ejection, and 2000ft is the minimum recommended for controlled ejection. In the case of loss of ICS, the call for immediate ejection will be three raps on the canopy. For a controlled ejection the IP will give 3 hand curtains over the face. The student will acknowledge with thumbs up" | Ejection calls |
| 5 | "Inadvertent IMC - if we go IIMC, we'll turn out the way we came in, if we cannot regain VMC, we'll contact ATC for an IFR clearance back to homefield."; "Alternates refer to CNAF 3710 required alternates on an IFR flight plan. Diverts refer to available PEL fields along the route of flight." | Lost visual flight; diverts |

## [3] VT-10, FAM Stan Notes (T-6A, June 2026)

| PDF page | Excerpt | Used for |
| --- | --- | --- |
| 5 | "SNFO's may start a PEL with 'turn, climb, clean'"; "'Turn' – to the nearest suitable airfield"; "'Climb' – or accelerate to intercept ELP ... climb at 140 KIAS or accelerate, if there is a solid cloud layer"; "'Clean' – gear, flaps, and speed brake UP ... significantly improve climb and glide performance" | Engine section; example |
| 5 | "½ DME + Key = Altitude required to reach the nearest airfield."; "5NM ... 2.5 + 3 (3,000' for high key) = 5.5"; "(Altitude – Key) * 2 = Distance you can glide and reach key."; "11- 3 (for high key) = 8 ... 8 * 2 = 16"; "3,000 AGL for high key is 3 and 1,500 is 1.5 for low key."; "The 2:1 only works with no wind, 125KIAS, clean, and prop feathered"; "arrive at the correct altitude for High Key and each checkpoint throughout the ELP" | Glide check; keys; ELP/high key/low key terms; tests |

## [4]–[6] Training Air Wing SIX ejection briefs (undated)

| Source, PDF page | Excerpt | Used for |
| --- | --- | --- |
| [4] T-6, 2 | "Ejection decision a. Out of control flight eject by 6K AGL b. Controlled flight eject no lower than 2K AGL c. Should be briefed prior to flight d. Psychological facts that cause ejection delay"; envelope "Zero airspeed zero altitude capability ... Functions properly from ground to 35,000 ft ... 370 KIAS maximum ... 125-180 KIAS is the optimum airspeed for ejection" | Ejection table |
| [4] T-6, 3 | Optimal body position (head, chin 10 degrees, elbows, buttocks, thighs, heels); "Pull ejection handle up and towards abdomen keeping elbows close towards sides"; "Landing in winds in excess of 25 knots increases risk of severe injury or death" | Body position; winds |
| [5] T-45, 2 | "Out of control flight eject by 10K AGL ... Controlled flight eject no lower than 2K AGL ... Should be briefed prior to flight ... Psychological facts"; "ground to 50,000 ft ... 550 KIAS maximum ... 250 KCAS is the optimum airspeed for ejection" | Ejection table |
| [5] T-45, 3 | Body position as [4]; "Wind blast injuries i. Ensure mask is on and visor is down"; "Landing in winds in excess of 25 knots increases risk of severe injury or death" | Body position; winds |
| [6], 1–2 | "I – INFLATE LPU"; "R – RELEASE Raft: (N/A)"; "O – OPTIONS: May be performed if time permits" (LeMoinge slots, visor, mask, gloves, SSK); "K – 'K'ONNECTORS ... If descending over water, release fittings as soon as feet touch the water. If descending over land, release fittings after completion of PLF."; "Prepare for landing at a high enough altitude (approximately 200 feet)"; "feet and knees are together, knees are slightly bent"; "Heels should never contact the ground while performing a PLF."; five points of contact; "A – Avoid the chute. D – Disentangle the chute. R – Release SSK (i.e., release SSK fitting on right side only) and retrieve survival items." | IROK, PLF, ADR steps and terms |

## [7] VT-35, T-44 Emergency Phrases (December 2024)

| PDF page | Excerpt | Used for |
| --- | --- | --- |
| 1 | Dynamic engine cut: "PF: 'Power as required, landing gear up, airspeed 102/110.'"; "PF: 'This will be an emergency shutdown of the left/right engine.'"; "PF: 'Left/Right power lever idle, concur?' PM: 'Concur.'"; prop lever feather and condition lever fuel cut off, each "concur?"; "PF: 'Is it a fire or fuel leak?'"; "PF: 'Hold the checklist, you have the comms, declare an emergency, this will be an SSE full-stop.'"; "If it's a fuel leak, begin with the condition lever." | Multiengine exchange |

## [8] AFMAN 11-202V3 and [9] CNAF M-3710.7 (supplied copies)

- AFMAN 11-202V3 para 3.20.2: "Declare 'minimum fuel' or 'emergency fuel' to the appropriate controlling agency when the aircraft may land at the intended destination with less than the MDS-specific minimum reserve or emergency fuel [AIM 5-5-15]." Attachment 1: "Emergency Fuel—The point at which it is necessary to proceed directly to the airport of intended landing due to low fuel. Declaration of 'emergency fuel' is an explicit statement that priority handling by ATC is both required and expected." "Minimum Fuel—... upon reaching the destination, it can accept little or no delay. This is not an emergency situation".
- CNAF M-3710.7 para 7.1.7.1–7.1.7.2, summarised: secure cargo and equipment against a crash landing on land or water; ditching and bailout bills displayed in multipiloted aircraft, with frequent drills. Para 8.2.1.1 note, summarised: automatic life preserver inflation devices are designed for ejection seat aircraft only and are not worn where ditching is a recommended procedure, such as helicopters. Short phrases only; the manual restricts nonmilitary reproduction.

## [10] FAA Airplane Flying Handbook, chapter 18 (supplementary)

| Page | Excerpt | Used for |
| --- | --- | --- |
| 18-1–18-2 | "An unconscious desire to delay the dreaded moment may lead to ... indecision in general."; "making a 180° turn back to the runway when available altitude is insufficient; stretching the glide" | After takeoff |
| 18-7 | Ditching: "involves less deceleration violence than a poor tree landing"; "ditched at minimum speed and in a normal landing attitude does not immediately sink"; "Loss of depth perception may occur when landing on a wide expanse of smooth water". Engine failure after takeoff: "Continuing straight ahead or making a slight turn"; "'the impossible turn'"; "requires a turn with a higher bank angle" | Ditching; after takeoff |
| 18-8 | "A turn back to the departure runway may require more than a 180° change in direction."; "an unacceptable risk for student pilots, low-time pilots, untrained pilots"; emergency descent "made in a turn to check for other air traffic below"; "In the case of an engine fire, a high airspeed descent could blow out the fire." | After takeoff; systems |
| 18-9 | Engine fire causes; signs "smoke and/or flames ... discoloration, bubbling, and/or melting of the engine cowling skin"; oil-fed fire "thick black smoke ... consider stopping the propeller rotation" | Systems table |
| 18-10 | Electrical fire: "odor of burning insulation"; isolate the circuit; "battery master switch and alternator/generator switches should be turned off"; switch-by-switch restoration; cabin fire: "identifying and shutting down the faulty system"; vents "only after the fire extinguisher ... is used"; "If smoke increases ... immediately closed" | Systems table; details |
| 18-12–18-13 | Landing gear malfunction: "select an airport with crash and rescue facilities"; "request that emergency equipment is standing by" | Systems table |
| 18-14–18-15 | "any loss of electrical power is critical in a small airplane—notify ATC of the situation immediately"; "Shed all but the most necessary electrical load"; pitot-static: "confirm it by opening the alternate static source" | Systems table |
| 18-18–18-21 | "the only way to control the airplane safely is by using and trusting the flight instruments"; "A shallow bank"; "Combined maneuvers, such as climbing or descending turns, should be avoided" | Lost visual flight |

## [11] AIM 6-3-3, Ditching Procedures (supplementary)

"A successful aircraft ditching is dependent on three primary factors. In
order of importance they are: Sea conditions and wind. Type of aircraft.
Skill and technique of pilot."; "AVOID THE FACE OF A SWELL"; "After
determining which heading (and its reciprocal) will parallel the swell,
select the heading with the most into the wind component."; two systems:
"land parallel to the primary system, and on the down swell of the
secondary"; equal systems: "an intermediate heading at 45 degrees down
swell to both"; "Touchdown should be at the lowest speed and rate of
descent which permit safe handling and optimum nose up attitude";
"the pilot should, if possible, ditch before fuel is exhausted."

## [12] Falcon BMS Training Manual 4.38.1 (sim panel and Figure 1 only)

| Printed page | Excerpt | Used for |
| --- | --- | --- |
| 14 | "There are three fundamental rules to be applied in all emergency situations: Maintain aircraft control; Analyze the situation and take corrective action; Land as soon as the situation dictates" | Rules; sim panel |
| 59 | "Given the absolute absence of any risk of fatality or injury in our hobby, there should be no hesitation about utilizing ejection" | Sim panel difference |
| 143 | Mission 7 conditions (13 NM south of Osan, 21000 ft, engine out, fuel 0); "The overhead pattern is by far the safest"; "HIGH KEY: 1/3 down the landing runway at 7000 – 10000 feet. LOW KEY: abeam rollout point on final at 3000 – 5000 feet. BASE KEY: midpoint of the turn from downwind to final no lower than 2000 AGL."; "The pattern can be entered at any point provided the next key altitude can be reached" | Figure 1; sim panel |
| 144 | "Best glide speed is thus typically set to ~200 knots; with landing gear down just subtract 10 knots"; "7° AOA"; "The F-16 will go 7 Nm over the ground for every 5000 feet of altitude loss."; "just use ... 1000 feet altitude loss for every nautical mile"; "The EPU will run for about 10 minutes on hydrazine"; "your only way out is to eject" | Glide rule; sim panel |
| 145 | "Perform an emergency jettison"; "let your speed decrease to best glide speed while maintaining level flight. When you reach best glide speed start a descent"; "squawk emergency with the IFF"; tower frequency on the backup UHF; "request an emergency landing" | Sim panel |
| 146 | "You will have to 'Request Wind Check'"; the wind "may throw all your parameters out the window" | Sim panel; Figure 2 caption |
