# Rotor-Wing Principles of Flight module revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the Flight Fundamentals
module Rotor-Wing Principles of Flight
(`src/pages/manual/flight-fundamentals/_RotorWing.astro`, models in
`src/lessons/flight-fundamentals/rotor-model.mjs`). They are review evidence,
not a copy of the sources, and not instructions to the reviewer.

**Revision 1** splits Flight Fundamentals into a fixed-wing and a rotor-wing
module, at the owner's request ("split Flight fundamentals into Fixed Wing and
Rotor Wing. Expand the latter"). The rotor section of Principles of Flight
revision 3 (its dissymmetry figure, translational lift, vortex ring state,
retreating blade stall, dynamic rollover, low G and autorotation) moves here
and grows into a full module: blade aerodynamics, the controls and
gyroscopic precession, rotor systems and torque, hover power and the power
curve, forward flight and stability, retreating blade stall and
compressibility, vortex ring state, ground hazards, low G, loss of tail rotor
effectiveness, autorotation and the height–velocity diagram. Six interactive
figures replace the one.

**Military first.** The Navy's NAVWEPS 00-80T-80, which has a helicopter
chapter section and a helicopter stability section, is now cited from its
pages for the first time ([1]). The Army's FM 3-04.203 ([2]) is cited only by
the paragraphs read for revision 3 of Principles of Flight. Its successor,
TC 3-04.1-4 *Fundamentals of Flight* (18 March 2026), is listed on
armypubs.army.mil with no public PDF, so it was not read; the page says so.
The FAA *Helicopter Flying Handbook* ([3]) is supplementary and fills what the
military texts read do not cover: loss of tail rotor effectiveness, dynamic
rollover, ground resonance, low G, and the modern vortex ring state recovery.
Where the 1965 Navy text and the 2019 handbook differ (the vortex ring state
recovery), the page gives both with their dates.

**Sources.**

1. H. H. Hurt, Jr., NAVWEPS 00-80T-80, *Aerodynamics for Naval Aviators*,
   revised January 1965, hosted by the FAA:
   https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf.
   A US Government work. Read in full on 26 October 2026 from the PDF.
   Physical page = printed page + 18 (checked on the helicopter pages).
2. Headquarters, Department of the Army, FM 3-04.203, *Fundamentals of
   Flight*, 7 May 2007: https://irp.fas.org/doddir/army/fm3-04-203.pdf.
   "Approved for public release; distribution is unlimited." Cited by
   paragraph. irp.fas.org returned an empty response to this session, so the
   passages are those recorded in revision 3 of
   `docs/reviews/flight-fundamentals-faa-evidence.md`, read on 25 October 2026
   only to ¶1-89. It carries no declaration and is expected to stay
   unverified by the packet.
3. Federal Aviation Administration, FAA-H-8083-21B, *Helicopter Flying
   Handbook* (HFH), 2019. Chapter PDFs on faa.gov, each starting at its
   chapter's printed page 1, so physical page N is printed page
   `<chapter>-N`: chapter 1 Introduction to the Helicopter, 2 Aerodynamics of
   Flight, 3 Helicopter Flight Controls, 4 Helicopter Components, Sections,
   and Systems, 7 Helicopter Performance, 11 Helicopter Emergencies and
   Hazards. Read in full on 26 October 2026 from the PDFs.

**Packet budget.** The review packet fetches at most eight sources and the
reviewer's prompt is capped at 128k tokens. Seven sources are declared below,
each for the cited pages only (about 65 pages). If the packet still runs
over, the HFH chapter 2 and 11 blocks are the ones to narrow first.

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf
pages: 337-342 (printed 319-324); 418-429 (printed 400-411)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch01.pdf
pages: 3-5 (1-3 to 1-5)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch02.pdf
pages: 5-9 (2-5 to 2-9); 12-17 (2-12 to 2-17); 19-26 (2-19 to 2-26)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch03.pdf
pages: 1-5 (3-1 to 3-5)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch04.pdf
pages: 2-6 (4-2 to 4-6)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch07.pdf
pages: 2-5 (7-2 to 7-5)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch11.pdf
pages: 2-3 (11-2 to 11-3); 9-16 (11-9 to 11-16); 18-21 (11-18 to 11-21)
```

Quotations are extractor-read (pdftotext); check each against independently
retrieved text, and treat a wording mismatch as a finding against this
record.

## NAVWEPS 00-80T-80 (Aerodynamics for Naval Aviators)

Printed pages; physical page is 18 more.

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 319, 323–324 | Helicopter flying qualities: "Flying qualities that would be considered totally unsatisfactory by fixed-wing standards" are normal for helicopters; a "divergent phugoid mode would make instrument flight impractical"; the phugoid "is unstable in the majority of" helicopters; rotor unstable with angle of attack, with speed stability | Forward flight, stability |
| 320–321 | Cyclic tilts the rotor; the control moment depends on rotor tilt, thrust and hub height above the c.g. | Controls, precession |
| 321 | "the cyclic stick is analogous to the control stick of an airplane, and the collective stick is analogous to the throttle of an airplane" | Controls; Collective and Cyclic terms |
| 321–322 | "the maximum demands of the tail rotor occur at conditions when engine power is also in great demand. The most critical condition is while hovering at maximum gross weight." | Torque |
| 322 | The helicopter must "have sufficient directional control to fly sideways up to 30 knots, an important requirement for plane guard duties." | Overview |
| 321–323 | "Directional control of a tandem-rotor helicopter is accomplished by differential cyclic"; longitudinal control by tilting both rotors or "by a differential collective pitch change" | Configurations |
| 400 | "the rotor is subject to the same physical laws of aerodynamics and motion that govern flight of the fixed-wing airplane ... much more complicated due to the complex flow conditions"; lift results "from the rotor accelerating a mass of air downward in the same way that the jet engine develops thrust by accelerating a mass of air out the tailpipe"; "Hovering in a 20 knot wind is aerodynamically equivalent to flying at an airspeed of 20 knots in a no-wind condition"; rotor thrust "proportional to the air density, a nondimensional thrust coefficient, and the square of the tip speed" | Overview; blade; hover |
| 400–401 | Blade element theory: rotational velocity and induced flow combine into the element's resultant velocity | Blade; Figure 1 |
| 402 | Dissymmetry "created great difficulty during many early helicopter and autogiro projects. Juan De La Cierva ... solved the problem by mounting his autogiro blades individually on flapping hinges"; teetering and rigid rotors correct it by hub tilt and cyclic | Rotor systems; dissymmetry |
| 402–403 | Angle of attack distribution in forward flight: reverse flow near the hub on the retreating side, negative stall, negative and positive lift, tip near stall; varying drag adds vibration | Forward flight |
| 402–404 | Stall "progressing in toward the hub from the tip of the retreating blade. When approximately 15 percent of the rotor disc is stalled, control of the helicopter will be impossible"; control marginal and stall severe when the outer quarter of the retreating blade is stalled | Retreating blade stall |
| 404 | Vibration "with three beats per rotor revolution" (three-bladed rotor); pitch-up; conditions: high airspeed, low rotor rpm, high gross weight, high density altitude, high load factor, turbulence, abrupt control; recovery: reduce pitch, reduce speed, "Increase rotor RPM", "Decrease severity of accelerated maneuver"; "forward cyclic to attempt to control pitch-up is ineffective and may aggravate the stall"; warning good in slow approach, poor with rapid pitch increase | Retreating blade stall |
| 404–405 | "When the Mach number of the tip section of the advancing blade exceeds the critical Mach number for the rotor blade section, compressibility effects result"; power rise, roughness, blade twisting; causes; opposite rpm correction to retreating blade stall | Compressibility |
| 405–406 | Autorotation force diagram: net drag near the tip, net forward force near mid-span | Autorotation; Figure 6 |
| 407–408 | Minimum rate of descent speed; "a straight line from the origin tangent to the curve will define the point for maximum autorotative glide distance" | Autorotation |
| 408–409 | Rotor kinetic energy cushions the landing when collective is raised; low-inertia rotors lose rpm quickly | Autorotation |
| 409 | "In the case of most small helicopters, at least 300 feet of altitude is necessary for an average pilot to set up a steady autorotation ... This minimum becomes 500 to 600 feet for the larger helicopters" | Height–velocity diagram |
| 408–410 | "True 'power settling' occurs only when the helicopter rotor is operating in a rotary flow condition called the 'vortex ring state.'" Flow "upward near the center" of the disk; recovery: "If the condition is encountered with low power, rapid application of full power may increase the downwash sufficiently"; otherwise "increasing airspeed by diving will result in recovery with minimum loss of altitude"; "diving out of the power settling condition provides the most favorable means of recovery" | Vortex ring state (1965 recovery, dated on the page) |
| 410–411 | Many conditions called power settling are "normal" flight with "merely insufficient power" to stop a descent, typical of high gross weight or high density altitude; the vortex ring state can bring a "high rate of descent (as high as 3,000 fpm)"; the diving recovery | Vortex ring state |

## FM 3-04.203 (Army, Fundamentals of Flight)

As recorded for Principles of Flight revision 3; not re-read.

| Para (page) | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 1-24 (1-10) | Forward airspeed reduces induced flow; the same pitch setting gives "an improved efficiency (additional lift)": translational lift | Forward flight; Translational lift term |
| 1-28 (1-12) | "If AOA is increased beyond a critical angle, flow across the top of the airfoil will be disrupted"; stall | Overview |
| 1-29 (1-12) | "lift varies as the square of the velocity" | Overview; Figure 4 model |
| 1-32 (1-13) | "Cyclic feathering creates a differential lift in the rotor system." | Dissymmetry |
| 1-33 (1-13) | "Flapping is the primary means of compensating for dissymmetry of lift." | Dissymmetry; Flapping term |
| 1-77 (1-30–1-31) | Blades "begin to rise from the static position because of centrifugal force"; "Excessive coning can occur if RPM is too low, gross weight is too high"; it "can cause undesirable stresses on the components and a decrease in lift" | Coning |
| 1-78 (1-31) | "Torque must be counteracted to maintain control of the aircraft; the antitorque rotor does this"; in tandem and coaxial designs "the two rotor systems turn in opposite directions, effectively canceling the torque effect"; "Most American-built single-rotor helicopters turn the main rotor in a counterclockwise direction" | Torque; figure orientation |
| 1-79 (1-32) | "Applying less pedal than needed causes the helicopter to turn in the direction of torque" | Torque |
| 1-88–1-89 (1-35–1-36) | Induced flow "is the primary cause of high power requirements for hovering"; "Rotor-tip vortices are part of the induced flow and increase induced drag" | Hover; Induced flow term |

## HFH (FAA-H-8083-21B), supplementary

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 1-3–1-5 | Single main rotor with tail rotor most common; "Tandem rotor ... helicopters have two large horizontal rotor assemblies"; "Coaxial rotors are a pair of rotors turning in opposite directions, but mounted on a mast, with the same axis of rotation ... a noted feature of helicopters produced by the Russian Kamov helicopter design bureau"; intermeshing rotors (HH-43, used by the USAF for firefighting) | Configurations |
| 2-2–2-3, 2-5–2-7 | Weight, load factor in turns, thrust and drag on the rotor | Forces; turn load table |
| 2-8 | Most light helicopters use symmetrical airfoils; "Induced flow—the downward flow of air through the rotor disk"; "Angle of incidence (AOI)—the angle between the chord line of a blade and rotor hub. It is usually referred to as blade pitch angle" | Blade; terms |
| 2-9 | Rotational relative wind parallel to the plane of rotation, greatest at the tip, decreasing uniformly to zero at the axis | Blade; Figure 1 |
| 2-12–2-13 | Blade twist; induced flow lowers angle of attack; ground effect to about one rotor diameter | Blade; hover |
| 2-14 | "Flapping is the up and down movement of rotor blades about a hinge on a fully articulated rotor system"; cyclic feathering controls "rearward tilt of the rotor (blowback)" | Flapping |
| 2-15–2-16 | "During hovering flight, a single main rotor helicopter tends to move in the direction of tail rotor thrust. This lateral (or sideward) movement is called translating tendency." Countering it by mast tilt, rigging, and hanging slightly low on one side | Torque; terms |
| 2-16–2-17 | Coning: centrifugal force gives the blades rigidity; low rpm increases the coning angle; Coriolis effect | Coning |
| 2-17 | "Gyroscopic precession is the resultant action or deflection of a spinning object when a force is applied to this object. This action occurs approximately 90° in the direction of rotation" | Controls; Figure 2 |
| 2-19–2-20 | "Dissymmetry of lift is the differential (unequal) lift between advancing and retreating halves of the rotor disk"; "Blade flapping compensates for dissymmetry of lift"; blowback: "translational lift becomes more effective and causes the nose to rise or pitch up (sometimes referred to as blowback)" | Dissymmetry; blowback |
| 2-21 | "Improved rotor efficiency resulting from directional flight is called translational lift." | Forward flight |
| 2-22–2-23 | ETL between 16 and 24 knots; "induced flow drops to near zero at the forward disk area and increases at the aft disk area. These differences in lift between the fore and aft portions of the rotor disk are called transverse flow effect"; vibration "around 12 to 15 knots"; roll right "through approximately 20 knots" | Forward flight; Figure 5 ETL band |
| 2-24–2-25 | Sideward and rearward flight; turning flight load | Forward flight |
| 2-26 | Autorotation regions: driven region "about 30 percent of the radius"; driving region "between 25 to 70 percent of the blade radius"; inner 25 percent stall region; collective sets the balance | Autorotation; Figure 6 |
| 3-1–3-2 | Three major controls; "The collective pitch control ... is located on the left side of the pilot's seat"; changes the pitch of all main rotor blades "simultaneously, or collectively"; governor/correlator | Controls |
| 3-3–3-4 | "The purpose of the cyclic pitch control is to tilt the tip-path plane in the direction of the desired horizontal direction"; "The rotor disk tilts in the same direction the cyclic pitch control is moved"; pitch change 90° ahead | Controls; Figure 2 |
| 3-4–3-5 | "The thrust of the tail rotor depends on the pitch angle of the tail rotor blades"; pedals in tandem, coaxial and intermeshing helicopters | Controls |
| 4-2 | Semirigid: "usually composed of two blades that are rigidly mounted to the main rotor hub", teetering hinge, "flap together as a unit", feathering, no drag hinge | Rotor systems |
| 4-3 | "Mast bumping is the result of excessive rotor flapping"; semirigid rotors "vulnerable to a condition known as mast bumping which can cause the rotor flap stops to shear the mast" | Rotor systems; low G |
| 4-3–4-4 | Rigid rotor "very responsive and is usually not susceptible to mast bumping"; vibrations felt in the cabin; bearingless rotors | Rotor systems |
| 4-4–4-5 | Fully articulated: each blade can "lead/lag ... flap ... independent of the other blades, and feather"; "found on helicopters with more than two main rotor blades" | Rotor systems |
| 4-6 | Tandem rotors: all engine power for lift; coaxial "eliminates the need for a tail rotor" and avoids dissymmetry | Configurations |
| 7-2–7-3 | "The height/velocity (H/V) diagram shows the combinations of airspeed and height above the ground, which will allow an average pilot to successfully complete a landing after an engine failure" | Height–velocity diagram |
| 7-3–7-5 | Hover performance falls with density altitude and weight; IGE and OGE hover charts; maximum-range autorotation speed "usually about 25 percent" faster than minimum-descent speed (7-4) | Power; autorotation |
| 11-2–11-3 | Autorotation "a power-off maneuver in which the engine is disengaged from the main rotor disk"; lower the collective immediately; minimum descent at about 50–60 knots in a typical helicopter; flight manual gives airspeed and rpm | Autorotation |
| 11-9–11-10 | Vortex ring state, "formerly referred to as settling with power"; "A vertical or nearly vertical descent of at least 300 fpm"; rotor "using some of the available engine power (20–100 percent)"; "horizontal velocity must be slower than effective translational lift"; descent "may approach 6,000 feet per minute"; recovery "by increasing airspeed, and/or partially lowering collective"; Vuichard recovery; practice recoveries by 1,000 feet AGL | Vortex ring state; Figure 5 |
| 11-11 | Retreating blade stall factors "High weight, low rotor rpm, high density altitude, turbulence and/or steep, abrupt turns"; "a low frequency vibration, pitching up of the nose, and a roll in the direction of the retreating blade"; "the first step in a proper recovery is usually to reduce collective"; aft cyclic worsens it. Ground resonance: "a destructive vibration phenomenon that occurs at certain rotor speeds when the helicopter is on the ground"; "can cause a helicopter to self-destruct in a matter of seconds"; recovery by rpm | Retreating blade stall; ground resonance |
| 11-12–11-13 | Dynamic rollover: rolling moment, "A pivot point other than the helicopter's normal CG", thrust greater than weight; critical angle "(5–8°)"; "Quickly reducing collective pitch is the most effective way to stop dynamic rollover from developing"; slope operations | Dynamic rollover |
| 11-14–11-15 | "Helicopters rely on positive G to provide much or all of their response to pilot control inputs"; mast bumping; "Recover from a low-G situation by first gently applying aft cyclic to restore normal G before attempting to correct any roll" | Low G |
| 11-15–11-16 | "If the rotor rpm continues to fall, the rotor will eventually stall. Rotor stall should not be confused with retreating blade stall"; the retreating blade stalls first and the helicopter rolls | Rotor stall |
| 11-18 | "Loss of tail rotor effectiveness (LTE) ... an uncommanded, rapid yaw towards the advancing blade which does not subside of its own accord"; "caused by an aerodynamic interaction between the main rotor and tail rotor and not caused from a mechanical failure" | LTE |
| 11-19–11-21 | LTE wind regions for a counterclockwise rotor: main rotor disk vortex interference (285–315°, 10–30 kt), weathercock stability (120–240°), tail rotor vortex ring state (210–330°); combinations to avoid (low and slow flight out of ground effect, tailwinds below 30 knots, large power changes at low airspeed); recovery actions | LTE |

HFH errors the page avoids: chapter 1's "Kaman Ka-31" caption, the 80° bank
figure in chapter 2, and IGE/OGE figure numbers that appear swapped in
chapter 7.

## Models

Pure functions in `src/lessons/flight-fundamentals/rotor-model.mjs`, tested in
`tests/lessons/rotor-wing-lesson.test.mjs` against hand-worked values. The
example utility helicopter (27 ft radius, 260 rpm, four 1.75 ft blades, 8°
twist, Cd0 0.010, induced factor 1.15, 25 ft² flat-plate area, 16,000 lb,
2,000 shp at sea level falling with density) is invented and labelled so on
the page. Standard rotor theory, not taken from the handbooks:

- **Blade element (Figure 1).** Ω·r rotational wind, induced flow down,
  inflow angle φ = atan(v/Ω·r), angle of attack = pitch − φ; critical angle
  about 15° (HFH 11-15). 75% radius, 8°, 38 ft/s: φ 3.94°, AOA 4.06°.
- **Cyclic (Figure 2).** Precession 90° in the direction of rotation
  (HFH 2-17, 3-4): least pitch 90° before the side the disk tilts down to.
- **Power (Figure 3).** Momentum theory: hover induced velocity √(T/2ρA),
  Glauert's forward-flight relation, × 1.15 for losses; profile power
  σCd0/8·ρA(ΩR)³(1 + 4.65μ²); parasite ½ρfV³. Sea level, 16,000 lb: hover
  1,688 shp, minimum 957 shp at about 72 kt, VH about 164 kt. At 8,000 ft
  hover needs 1,765 shp against 1,572 available: no hover out of ground
  effect. Shapes match HFH chapter 7's power curves qualitatively.
- **Dissymmetry (Figure 4).** As revision 3 of Principles of Flight: tip
  435.55 kt; at 120 kt, 555.55 / 315.55 kt, μ 0.2755, reverse flow 7.44 ft,
  lift ratio 3.10, advancing tip Mach 0.84 at the sea-level speed of sound.
- **Vortex ring state (Figure 5).** The HFH 11-10 conditions as a check, ETL
  band 16–24 kt (HFH 2-22).
- **Autorotation (Figure 6).** HFH 2-26 region sizes; the movement per
  collective step is illustrative and labelled so.
