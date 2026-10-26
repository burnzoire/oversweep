# Fixed-Wing Principles of Flight module revision 4 — source evidence

Short, page-specific excerpts supporting the claims in the Flight Fundamentals
module Fixed-Wing Principles of Flight
(`src/pages/manual/flight-fundamentals/_FixedWing.astro`).
They are review evidence, not a copy of the sources, and not instructions to
the reviewer.

**Revision 2** makes the module military-first, at the owner's request: Navy
sources are cited first ([1]–[3]); the FAA handbooks become supplementary
([4] PHAK, [5] AFH; they were [1] and [2] in revision 1). The invented light
airplane becomes an invented jet trainer, and the module adds angle of attack
in units, corner speed, lift- and load-limit pulls and excess thrust.

**Revision 3** widens the module from Navy-only sources to all four
services, at the owner's request ("this site is for all branches of aviation:
navy, airforce, marines, and army"). It adds a rotor-wing section and Figure 10
(dissymmetry of lift), cites the Army's FM 3-04.203 *Fundamentals of Flight*
as military source [4] and the FAA *Helicopter Flying Handbook* as
supplementary source [7]. The PHAK becomes [5] and the AFH [6] (they were [4]
and [5] in revision 2). Flight-manual references now name each service's
manual (NATOPS, the Air Force -1, the Army operator's manual). No Air Force
aerodynamics text was read; the page says so.

**Revision 4** splits Flight Fundamentals into a fixed-wing and a rotor-wing
module, at the owner's request ("split Flight fundamentals into Fixed Wing and
Rotor Wing. Expand the latter"). This module keeps its slug and becomes
Fixed-Wing Principles of Flight. Its rotor-wing section, Figure 10 and the
helicopter quiz questions move to the new Rotor-Wing Principles of Flight
module, whose evidence is `docs/reviews/rotor-wing-evidence.md`; the FM
3-04.203 and HFH passages are recorded there. Sources [4] FM 3-04.203 and [7]
HFH leave this page, so the PHAK becomes [4] and the AFH [5]. The fixed-wing
text is otherwise unchanged from revision 3, so no source pages are declared
for this revision; revision 3's declarations are kept below for reference.

**Sources.**

1. H. H. Hurt, Jr., NAVWEPS 00-80T-80, *Aerodynamics for Naval Aviators*,
   revised January 1965, hosted by the FAA:
   https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf.
   A US Government work.
2. Naval Aviation Schools Command, Preflight Course (API) Module/Unit 2,
   *Fundamentals of Aerodynamics*, Trainee Guide Q-9B-0020L
   (NAVAVSCOLSCOM-SG-200), CH 1, April 2017:
   https://www.cnatra.navy.mil/training/assets/media/aerodynamics/aero-trainee-guide.pdf.
   Marked "FOR TRAINING USE ONLY" on each page; no distribution statement in
   the extracted text; published on the CNATRA public site.
3. CNATRA P-1289 (Rev. 01-16, CH-1), BFM/SEM Flight Training Instruction,
   T-45: https://www.cnatra.navy.mil/local/docs/pat-pubs/P-1289.pdf. The
   passages used are already recorded in `docs/reviews/bfm-p1289-evidence.md`.
4. Headquarters, Department of the Army, FM 3-04.203, *Fundamentals of
   Flight*, 7 May 2007: https://irp.fas.org/doddir/army/fm3-04-203.pdf.
   "Approved for public release; distribution is unlimited." Cited by
   paragraph. irp.fas.org is not on the review packet's allow-list, so it
   carries no declaration and is expected to stay unverified by the packet.
5. Federal Aviation Administration, FAA-H-8083-25C, *Pilot's Handbook of
   Aeronautical Knowledge* (PHAK), 2023. Chapter PDFs linked from
   https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak:
   chapter 4 Principles of Flight, chapter 5 Aerodynamics of Flight, chapter 6
   Flight Controls.
6. Federal Aviation Administration, FAA-H-8083-3C, *Airplane Flying Handbook*
   (AFH), 2021. Chapter PDFs linked from
   https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook:
   chapter 4 Energy Management, chapter 5 Maintaining Aircraft Control.
7. Federal Aviation Administration, FAA-H-8083-21B, *Helicopter Flying
   Handbook* (HFH), 2019. Chapter PDFs on faa.gov: chapter 2 Aerodynamics of
   Flight, chapter 11 Helicopter Emergencies and Hazards.

**Cited pages for the review reader.** Each FAA chapter is its own PDF and
begins at the chapter's first printed page, so physical page N is printed page
`<chapter>-N` (confirmed by the revision 1 packet). NAVWEPS 00-80T-80 has
about 18–20 physical pages of front matter (cover, notices, preface iii–iv,
contents v–xvi) before printed page 1; the extractor could not fix the exact
offset, so its block declares printed page + 18 to + 21 for each cited range.
Check that the cited printed pages fall inside what the packet extracts.
cnatra.navy.mil reset connections from GitHub-hosted runners in earlier
reviews, so [2] and [3] carry no new declaration and are expected to stay
unverified by the packet. Hashes are not declared: the authoring session's
network proxy refuses direct downloads from these hosts.

**Packet budget for revision 3.** The review packet fetches at most eight
sources, declared ones first; an undeclared PDF is read from its start to
40,000 characters. The reviewer's prompt is capped at 128k tokens, and the
first revision 3 run went over (138k) because the undeclared fixed-wing PDFs
were each read in full. Revision 3 changes the helicopter material and a few
wording lines, so the two HFH chapters are declared in full, and the
unchanged fixed-wing sources are declared only for the pages behind lines
this revision touches (the overview, stalls and spin wording, and the
ground-effect and tip-vortex terms). The other fixed-wing claims and pages are unchanged
from revision 2, which the SME gate passed; their revision 2 declarations
were:

- https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf
  pages 25-28 (about printed 7); 37-46 (about printed 19-26); 52-59 (about printed 34-39)
- https://www.faa.gov/sites/faa.gov/files/06_phak_ch4_0.pdf
  pages 6-9 (4-6 to 4-9)
- https://www.faa.gov/sites/faa.gov/files/07_phak_ch5_0.pdf
  pages 2-4 (5-2 to 5-4); 7-8 (5-7 to 5-8); 11-17 (5-11 to 5-17); 22-24 (5-22 to 5-24)
- https://www.faa.gov/sites/faa.gov/files/08_phak_ch6.pdf
  pages 3 (6-3)
- https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/05_afh_ch4.pdf
  pages 1-8 (4-1 to 4-8); 18 (4-18)
- https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/06_afh_ch5.pdf
  pages 1 (5-1); 8-9 (5-8 to 5-9); 12 (5-12); 15 (5-15); 19-24 (5-19 to 5-24)

```text
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf
pages: 52-54 (about printed 34-35); 57-59 (about printed 39)
```

```text
source: https://www.faa.gov/sites/faa.gov/files/06_phak_ch4_0.pdf
pages: 9 (4-9)
```

```text
source: https://www.faa.gov/sites/faa.gov/files/07_phak_ch5_0.pdf
pages: 11-12 (5-11 to 5-12)
```

```text
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/06_afh_ch5.pdf
pages: 9 (5-9); 12 (5-12); 15 (5-15); 21-24 (5-21 to 5-24)
```

```text
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch02.pdf
pages: 12 (2-12); 15-16 (2-15 to 2-16); 20-27 (2-20 to 2-27)
```

```text
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch11.pdf
pages: 2-5 (11-2 to 11-5); 10-15 (11-10 to 11-15)
```

**Retrieval limitation.** Passages were read on 25 October 2026 through a web
text-extraction tool. It returned NAVWEPS 00-80T-80 only to printed p. 48
(about 117,000 characters; chapter 1), so chapters 2–6 (maneuvering
performance, stability, the V-n diagram, carrier approach) were not read and
are not cited; its OCR page markers are noisy, so page attributions there may
be off by one. It returned the API guide to printed p. 76 (the start of the
stalls unit). It returned PHAK chapter 5 only to printed p. 5-32 (the
PDF is 20 MB), so the Load Factors, Vg diagram, rate- and radius-of-turn pages
(5-33–5-40) were not read. AFH chapter 5 was returned to p. 5-26/5-27. AFH
chapter 3 could not be fetched and is not cited. Page attributions come from
the extractor's printed-page markers and may be off by one page; the module
cites ranges where the markers and the PHAK table of contents disagree
(for example parasite and induced drag, TOC pp. 5-6–5-7, extractor p. 5-8).
The SME review of 052daaa moved the AFH 60° bank / 41% passage from p. 5-8 to
p. 5-9 (it sits between the 5-8 and 5-9 footers).
Quotations are extractor-read; check each against independently retrieved
text, and treat a wording mismatch as a finding against this record.

## NAVWEPS 00-80T-80 (Aerodynamics for Naval Aviators)

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 7 | Dynamic pressure, "given the name "dynamic pressure"", q = ½ρV²; "This equation is the Bernoulli equation for incompressible flow." | Wing; lift equation |
| 19 | The pressure distribution on the airfoil "now provides a net force perpendicular to the airstream-lift." | Wing |
| 22 | "The angle of attack is the angle between the chord line and the relative wind." | Wing; terms |
| 23 | L = CL q S; "The lift coefficient used in this equation is the ratio of the lift pressure and dynamic pressure"; "as angle of attack is increased beyond the maximum lift angle, the airflow is unable to adhere to the upper surface." | Wing; lift equation |
| 24 | The airfoil "stalls at the same angle of attack regardless of weight, dynamic pressure, bank angle, etc."; stall speed Vs = 17.2√(W/(CLmax σ S)) | Lift equation |
| 26 | "The mirror landing system coupled with an angle of attack indicator is an obvious refinement." | AOA in units |
| 34 | "Safe operation in carrier aviation demands precision control of the airplane at high lift conditions." | Overview |
| 34–35 | "a 2 percent change in weight causes a 1 percent change in stall speed." | Lift equation; tests |
| 36–37 | "The primary purpose of high lift devices (flaps, slots, slats, etc.) is to increase the CLmax of the airplane and reduce the stall speed." (OCR page markers inconsistent here) | Controls |
| 37 | "The stall speed in a turn can be determined by" Vs = Vs(1 G)·√n; "Above 45° of bank the increase in load factor and stall speed is quite rapid." | Turns |
| 39 | Stall occurs at a particular angle of attack; weight, bank angle, load factor, density altitude and airspeed "have no direct effect on the stall angle of attack"; "Since stall is precipitated by an excessive angle of attack, the angle of attack must be decreased."; "At any particular altitude, the indicated stall speed is a function of weight and load factor."; altitude effects "usually significant only above altitudes of 20,000 ft." | Lift equation; stalls |

## NASC Preflight (API) Fundamentals of Aerodynamics trainee guide

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 22 | "A body at rest tends to remain at rest..."; potential energy "the ability of a body to do work because of its position or state of being"; kinetic energy "...because of its motion"; TE = PE + KE | Four forces; energy |
| 23 | "An unbalanced force (F) acting on a body produces an acceleration (a) in the direction of the force"; "Equilibrium flight exists when the sum of all forces and the sum of all moments ... are equal to zero."; "Equilibrium is the absence of acceleration, either linear or angular." | Four forces |
| 24 | "For every action, there is an equal and opposite reaction" | Four forces |
| 33 | Chord line "an infinitely long, straight line which passes through its leading and trailing edges"; camber "the maximum distance between the mean camber line and the chord line"; "The most forward and rearward points of the mean camber line are the leading edges and trailing edges" | Wing |
| 36 | "Relative wind is the airflow the airplane experiences as it moves through the air."; "Angle of attack (α) is the angle between the relative wind and the chord line of an airfoil."; longitudinal axis "passes from the nose to the tail"; "Movement around the lateral axis is called pitch."; "Movement of the longitudinal axis around the vertical axis is called yaw." | Wing; axes |
| 46–47 | Thrust "the force produced by a jet engine or engine/propeller combination"; drag "the force that primarily acts against thrust and retards aircraft motion"; weight "the force of the Earth's gravity acting on the mass of the aircraft"; lift "the component of the aerodynamic force acting perpendicular to the relative wind"; L = qSCL | Four forces; lift equation |
| 50 | "As angle of attack increases, the coefficient of lift increases up to a maximum value (CLmax)."; "The AOA at which CLmax is reached is called CLmax AOA" | Wing |
| 52–54 | Parasite drag "drag that is not associated with the production of lift"; "composed of form drag, friction drag and interference drag"; "Parasite drag varies directly with velocity squared" | Drag |
| 55–56 | Induced drag "that portion of total drag associated with the production of lift"; "In level flight where lift is constant, induced drag varies inversely with velocity, and directly with angle of attack." The module takes the exact law (inverse square) from PHAK p. 5-8 | Drag |
| 57–58 | "Parasite and Induced drag can be added together to create a total drag curve."; "L/DMAX AOA produces the minimum total drag."; "L/DMAX is located at the bottom of the total drag curve." | Drag |
| 60–63 | Thrust required, thrust available, power required; "A positive TE causes a climb, acceleration, or both, depending on angle of attack."; excess power "will also produce a climb, acceleration, or both." | Energy; terms |
| 68 | Ailerons "attached to the outboard trailing edges of the wings, and produce a rolling moment"; elevator "attached to the trailing edge of the horizontal stabilizer, and controls the pitching moment"; rudder "...produces a yawing moment"; stabilator "used on the F-15 and F/A-18"; "The primary purpose of trim tabs is to trim." | Controls; terms |
| 69 | "For trimming, trim tabs must always be moved in the opposite direction as the control surface."; "T-6B trim settings are changed by adjusting the trim switches on the control stick" | Controls |

## CNATRA P-1289 (T-45 BFM)

Passages as recorded in `docs/reviews/bfm-p1289-evidence.md`: pp. 4-1–4-2
(CL "is a function of Angle of Attack (AOA)"; "CLMAX occurs at 21 units AOA";
heavy buffet at the lift limit), 4-2 (E-M diagram), 4-3 (load-limit pull
7.33 G above 5,000 ft above corner airspeed; lift-limit pull 19–21 units below
it), 4-4 (corner airspeed 410 KIAS, best instantaneous turn, highest bleed
rate, 8 kt/s; best sustained turn rate 240–330 KIAS where Ps = 0), 4-5, 5-7
("An energy excursion is the conscious sacrifice of airspeed for angles.").

## FM 3-04.203 and HFH

Moved to `docs/reviews/rotor-wing-evidence.md` with the rotor-wing material.

## PHAK (FAA-H-8083-25C), supplementary

| Page | Passage | Module use |
| --- | --- | --- |
| 4-6 | Bernoulli: "as the velocity of a moving fluid (liquid or gas) increases, the pressure within the fluid decreases." | Wing |
| 4-6 | Leading edge "The rounded end, which faces forward in flight"; trailing edge "quite narrow and tapered"; chord line "a straight line drawn through the profile connecting the extremities of the leading and trailing edges"; upper surface more curved, lower "usually somewhat flat" | Wing; terms |
| 4-7 | Mean camber line "equidistant at all points from the upper and lower surfaces"; inclined airfoil, upper-surface air "forced to move faster than the air moving along the bottom"; "It is neither accurate nor useful to assign specific values to the percentage of lift" from each surface | Wing |
| 4-8 | Upper-surface pressure "negative, or less than atmospheric"; "The downward backward flow from the top surface of an airfoil creates a downwash" with an upward, forward reaction | Wing |
| 4-9 | "The highpressure area on the bottom of an airfoil pushes around the tip to the low-pressure area on the top", creating a tip vortex and downwash that reduce lift | Vortices |
| 5-2 | "In steady flight, the sum of these opposing forces is always zero."; equating thrust with drag and lift with weight "can be misleading" | Four forces |
| 5-2–5-3 | AOA "the acute angle between the chord line of the airfoil and the direction of the relative wind"; "When the aircraft reaches the maximum AOA, lift begins to diminish rapidly." | Wing; terms |
| 5-4 | L = CL · ρ · V² · S / 2; "Lift is proportional to the square of the aircraft's velocity." | Lift equation |
| 5-7–5-8 | "Induced drag is inherent whenever an airfoil is producing lift."; "parasite drag increases as the square of the airspeed"; "The amount of induced drag varies inversely with the square of the airspeed." | Drag; Figure 4 |
| 5-11–5-12 | Ground effect "due to the interference of the ground (or water) surface with the airflow patterns"; "most realized at altitudes less than the wingspan"; induced drag reduced 1.4% at one span, 23.5% at one-quarter span, 47.6% at one-tenth span | Ground effect |
| 5-12–5-13 | "The axes of an aircraft are three imaginary lines that pass through an aircraft's CG."; lateral axis "parallel to a line from wingtip to wingtip"; roll about the longitudinal axis, pitch about the lateral, yaw about the vertical | Axes; Figure 5 |
| 5-14–5-15 | Positive static: "the initial tendency of the aircraft to return to the original state of equilibrium after being disturbed"; neutral: "to remain in a new condition"; negative: "to continue away from the original state"; "Dynamic stability refers to the aircraft response over time" | Stability; Figure 6 |
| 5-15–5-17 | "with CG forward of the CL and with an aerodynamic tail-down force, the aircraft usually tries to return to a safe flying attitude." | Stability |
| 5-22–5-23 | "The horizontal component of lift is the force that pulls the aircraft from a straight flight path to make it turn."; "increasing the AOA until the vertical component of lift is again equal to the weight" | Turns; Figure 7 |
| 5-23–5-24 | Rate of turn at a given airspeed "depends upon the magnitude of the horizontal component of lift"; "An increase in airspeed results in an increase of the turn radius."; in a climb "a component of the aircraft's weight acts in the same direction as, and parallel to, the total drag" | Turns; four forces; Figure 1 |
| 6-3 | "Ailerons control roll about the longitudinal axis."; wheel right raises the right aileron, lowers the left; "the increased lift on the left wing and the decreased lift on the right wing causes the aircraft to roll to the right."; adverse yaw "opposite the direction of the bank", "a result of differential drag and the slight difference in the velocity of the left and right wings" | Controls; Figure 5 |

## AFH (FAA-H-8083-3C), supplementary

| Page | Passage | Module use |
| --- | --- | --- |
| 4-1, 4-18 | Total mechanical energy, "Sum of the energy in altitude (potential energy) and the energy in airspeed (kinetic energy)"; PE = mgh; KE = ½mV² | Energy |
| 4-2 | When energy is exchanged, "altitude and airspeed always change in opposite directions" | Energy |
| 4-3 | PS = (T – D)V/W | Energy |
| 4-4 | "The throttle then is the total energy controller."; "Thus, the elevator is the energy distribution controller." | Energy |
| 4-5 | Back side of the power required curve: low speed, high AOA, little or no excess power | Energy |
| 4-7 | ES = h + V²/2g | Energy; Figure 9 |
| 4-8 | Airplane "cruising at 100 knots and 6,000 feet" and one at 240 kt and 4,000 ft have the same energy height (6,500 ft); either could zoom to 6,500 ft | Energy; Figure 9; tests |
| 5-1 | An upset is an event that unintentionally exceeds normal flight parameters: "Pitch attitude greater than 25°, nose up"; "Pitch attitude greater than 10°, nose down"; bank greater than 45°; inappropriate airspeeds | Stalls |
| 5-8 | Coordinated when "the ball is centered in the slip/skid indicator" | Controls |
| 5-9 | "it is possible to stall the wing at any airspeed, at any flight attitude, and at any power setting"; "level 60° banked turn, the load factor is 2G"; stall speed "41 percent higher than the 1G stall speed" | Turns; stalls; tests |
| 5-12 | "It is possible to exceed the critical AOA at any airspeed, at any attitude, and at any power setting" | Stalls |
| 5-15 | "the most important action to an impending stall or a full stall is to reduce the AOA" | Stalls |
| 5-19 | "Stalls encountered any time the G-load exceeds +1G are called" accelerated stalls; demonstrated in steep turns at about 45°; not above VA or VO; "VA is the maximum speed at which the positive design load limit can be imposed" | Stalls; envelope; terms |
| 5-20 | Cross-control stall: "the critical AOA is exceeded with aileron pressure applied in one direction" and rudder in the other; often a skidding base-to-final turn; can lead to a spin | Stalls |
| 5-21 | Common errors include trying to level the wings or add power before reducing AOA | Stalls |
| 5-22–5-24 | "A spin is an aggravated stall condition that may result after a stall occurs"; "In all spins at least one of the wings is stalled"; Figure 5-15 "Spin—an aggravated stall and autorotation"; phases entry, incipient, developed, recovery | Stalls |

## Models

Pure functions in `src/lessons/flight-fundamentals/lesson-model.mjs`, tested in
`tests/lessons/flight-fundamentals-lesson.test.mjs` against hand-worked values.
Standard flight mechanics, not taken from the handbooks:

- **Level turn (Figure 7).** n = 1/cos φ; r = V²/(g tan φ); ω = g tan φ/V;
  stall speed × √n. Cross-checked to AFH p. 5-9: 60° gives 2 G and +41%.
- **Lift (Figures 2–3).** L = CL·q·S, q = ½ρV², as 00-80T-80 pp. 7, 23 and
  PHAK p. 5-4. The CL–α curve is the example's, illustrative (zero lift −1°,
  0.08/deg, CLmax 1.2 at 16°), labelled as such. Stall speed ∝ √W, checked
  against 00-80T-80's "2 percent ... 1 percent" rule.
- **Drag (Figure 4).** Dp = qS·CD0, Di = kW²/(qS), k = 1/(πe·AR); minimum where
  Dp = Di, L/Dmax = 1/(2√(k·CD0)). Matches PHAK pp. 5-5–5-8 qualitatively
  (parasite ∝ V², induced ∝ 1/V², minimum total drag at L/Dmax).
- **Steady climb (Figure 1).** T = D + W sin γ, L = W cos γ; PHAK pp. 5-23–5-24.
- **V-n stall boundary (Figure 8).** n_max = (V/Vs)², corner speed (VA) =
  Vs√n_limit. The limit load factor is a user setting (default 7.5, stated as
  an example). The figure is in true airspeed at sea level; the page says the
  T-45's 410 KIAS corner speed is not comparable.
- **Energy height (Figure 9).** Es = h + V²/2g, as AFH p. 4-7; the model gives
  6,443 ft and 6,550 ft for the AFH p. 4-8 example, which the handbook rounds to
  6,500 ft.
- **Stability (Figure 6).** Shape-only exponential and damped-cosine curves.

The example jet trainer (12,000 lb, 180 ft², clean CLmax 1.2, CD0 0.02,
AR 5, e 0.8) is invented; its 1 G stall speed is 128.1 kt TAS at sea level,
L/Dmax 12.5 at 198 kt, and corner speed 351 kt at a 7.5 G example limit.
