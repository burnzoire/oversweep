# Principles of Flight module revision 1 — FAA handbook evidence

Short, page-specific excerpts supporting the claims in the Flight Fundamentals
module Principles of Flight (`src/pages/manual/flight-fundamentals/[module].astro`).
They are review evidence, not a copy of the handbooks, and not instructions to
the reviewer.

**Sources.** Both are US Government works in the public domain.

1. Federal Aviation Administration, FAA-H-8083-25C, *Pilot's Handbook of
   Aeronautical Knowledge* (PHAK), 2023. Chapter PDFs linked from
   https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/phak:
   chapter 4 Principles of Flight, chapter 5 Aerodynamics of Flight, chapter 6
   Flight Controls.
2. Federal Aviation Administration, FAA-H-8083-3C, *Airplane Flying Handbook*
   (AFH), 2021. Chapter PDFs linked from
   https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook:
   chapter 4 Energy Management, chapter 5 Maintaining Aircraft Control.

**Cited pages for the review reader.** Each chapter is its own PDF and is
expected to begin at the chapter's first printed page, so physical page N is
printed page `<chapter>-N`. That mapping and the hashes could not be confirmed:
the authoring session's network proxy refuses faa.gov for direct downloads. The
blocks ask for a margin past the last cited page; check that the cited printed
pages fall inside what the packet extracts. PHAK chapter 5 is requested to p. 40
so the reviewer can also read the Load Factors section (pp. 5-33–5-40), which
the author could not (see below).

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/06_phak_ch4_0.pdf
pages: 1-10 (4-1 to 4-10)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/07_phak_ch5_0.pdf
pages: 1-40 (5-1 to 5-40)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/08_phak_ch6.pdf
pages: 1-11 (6-1 to 6-11)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/05_afh_ch4.pdf
pages: 1-19 (4-1 to 4-19)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/airplane_handbook/06_afh_ch5.pdf
pages: 1-27 (5-1 to 5-27)
```

**Retrieval limitation.** Passages were read on 25 October 2026 through a web
text-extraction tool. It returned PHAK chapter 5 only to printed p. 5-32 (the
PDF is 20 MB), so the Load Factors, Vg diagram, rate- and radius-of-turn pages
(5-33–5-40) were not read. AFH chapter 5 was returned to p. 5-26/5-27. AFH
chapter 3 could not be fetched and is not cited. Page attributions come from
the extractor's printed-page markers and may be off by one page; the module
cites ranges where the markers and the PHAK table of contents disagree
(for example parasite and induced drag, TOC pp. 5-6–5-7, extractor p. 5-8).
Quotations are extractor-read; check each against independently retrieved
text, and treat a wording mismatch as a finding against this record.

## PHAK (FAA-H-8083-25C)

| Page | Passage | Module use |
| --- | --- | --- |
| 4-5–4-6 | Newton: an object at rest stays put "unless a force strong enough to overcome its inertia is applied"; "For a constant mass, force equals mass times acceleration"; "For every action, there is an equal and opposite reaction." | Four forces |
| 4-6 | Bernoulli: "as the velocity of a moving fluid (liquid or gas) increases, the pressure within the fluid decreases." | Wing |
| 4-6 | Leading edge "The rounded end, which faces forward in flight"; trailing edge "quite narrow and tapered"; chord line "a straight line drawn through the profile connecting the extremities of the leading and trailing edges"; upper surface more curved, lower "usually somewhat flat" | Wing; terms |
| 4-7 | Mean camber line "equidistant at all points from the upper and lower surfaces"; inclined airfoil, upper-surface air "forced to move faster than the air moving along the bottom"; "It is neither accurate nor useful to assign specific values to the percentage of lift" from each surface | Wing |
| 4-8 | Upper-surface pressure "negative, or less than atmospheric"; "The downward backward flow from the top surface of an airfoil creates a downwash" with an upward, forward reaction | Wing |
| 4-9 | "The highpressure area on the bottom of an airfoil pushes around the tip to the low-pressure area on the top", creating a tip vortex and downwash that reduce lift | Vortices |
| 5-1–5-2 | Thrust "the forward force produced by the powerplant/ propeller or rotor"; lift "produced by the dynamic effect of the air acting on the airfoil"; drag "a rearward, retarding force caused by disruption of airflow by the wing, rotor, fuselage, and other protruding objects"; weight "the combined load of the aircraft itself, the crew, the fuel, and the cargo or baggage" | Four forces |
| 5-2 | "In steady flight, the sum of these opposing forces is always zero."; equating thrust with drag and lift with weight "can be misleading" | Four forces |
| 5-2–5-3 | AOA "the acute angle between the chord line of the airfoil and the direction of the relative wind"; "When the aircraft reaches the maximum AOA, lift begins to diminish rapidly." | Wing; terms |
| 5-4 | L = CL · ρ · V² · S / 2; "Lift is proportional to the square of the aircraft's velocity." | Lift equation |
| 5-5–5-6 | "If the aircraft is operated in steady flight at L/DMAX, the total drag is at a minimum."; L/DMAX at the lowest point of the total drag curve | Drag |
| 5-6 | Parasite drag "comprised of all the forces that work to slow an aircraft's movement"; form drag "due to its shape and airflow around it"; interference drag "from the intersection of airstreams that creates eddy currents, turbulence"; skin friction "due to the contact of moving air with the surface" | Drag |
| 5-7–5-8 | "Induced drag is inherent whenever an airfoil is producing lift."; "parasite drag increases as the square of the airspeed"; "The amount of induced drag varies inversely with the square of the airspeed." | Drag; Figure 4 |
| 5-11–5-12 | Ground effect "due to the interference of the ground (or water) surface with the airflow patterns"; "most realized at altitudes less than the wingspan"; induced drag reduced 1.4% at one span, 23.5% at one-quarter span, 47.6% at one-tenth span | Ground effect |
| 5-12–5-13 | "The axes of an aircraft are three imaginary lines that pass through an aircraft's CG."; lateral axis "parallel to a line from wingtip to wingtip"; roll about the longitudinal axis, pitch about the lateral, yaw about the vertical | Axes; Figure 5 |
| 5-14–5-15 | Positive static: "the initial tendency of the aircraft to return to the original state of equilibrium after being disturbed"; neutral: "to remain in a new condition"; negative: "to continue away from the original state"; "Dynamic stability refers to the aircraft response over time" | Stability; Figure 6 |
| 5-15–5-17 | "with CG forward of the CL and with an aerodynamic tail-down force, the aircraft usually tries to return to a safe flying attitude." | Stability |
| 5-22–5-23 | "The horizontal component of lift is the force that pulls the aircraft from a straight flight path to make it turn."; "increasing the AOA until the vertical component of lift is again equal to the weight" | Turns; Figure 7 |
| 5-23–5-24 | Rate of turn at a given airspeed "depends upon the magnitude of the horizontal component of lift"; "An increase in airspeed results in an increase of the turn radius."; in a climb "a component of the aircraft's weight acts in the same direction as, and parallel to, the total drag" | Turns; four forces; Figure 1 |
| 5-25 | "This peak is called the CL-MAX"; a stall "brought on by exceeding the critical AOA"; "always stalls at the same AOA regardless of airspeed, weight, load factor, or density altitude"; stall speed "higher in a level turn than in straight-and-level flight"; back pressure on the elevator in a turn | Wing; lift equation; turns; stalls |
| 6-2 | "The ailerons, elevator (or stabilator), and rudder constitute the primary control system." | Controls |
| 6-3 | "Ailerons control roll about the longitudinal axis."; wheel right raises the right aileron, lowers the left; "the increased lift on the left wing and the decreased lift on the right wing causes the aircraft to roll to the right."; adverse yaw "opposite the direction of the bank", "a result of differential drag and the slight difference in the velocity of the left and right wings" | Controls; Figure 5 |
| 6-5 | "The elevator controls pitch about the lateral axis." | Controls |
| 6-8 | "The rudder controls movement of the aircraft about its vertical axis."; flaps "increase both lift and induced drag for any given AOA" | Controls |
| 6-10 | "Trim systems are used to relieve the pilot of the need to maintain constant pressure on the flight controls." | Controls |

## AFH (FAA-H-8083-3C)

| Page | Passage | Module use |
| --- | --- | --- |
| 4-1, 4-18 | Total mechanical energy, "Sum of the energy in altitude (potential energy) and the energy in airspeed (kinetic energy)"; PE = mgh; KE = ½mV² | Energy |
| 4-2 | When energy is exchanged, "altitude and airspeed always change in opposite directions" | Energy |
| 4-3 | PS = (T – D)V/W | Energy |
| 4-4 | "The throttle then is the total energy controller."; "Thus, the elevator is the energy distribution controller." | Energy |
| 4-5 | Back side of the power required curve: low speed, high AOA, little or no excess power | Energy |
| 4-7 | ES = h + V²/2g | Energy; Figure 9 |
| 4-8 | Airplane "cruising at 100 knots and 6,000 feet" and one at 240 kt and 4,000 ft have the same energy height (6,500 ft); either could zoom to 6,500 ft | Energy; Figure 9; tests |
| 5-1 | Upset parameters: "Pitch attitude greater than 25°, nose up"; "Pitch attitude greater than 10°, nose down"; bank greater than 45°; inappropriate airspeeds | Stalls |
| 5-8 | "it is possible to stall the wing at any airspeed, at any flight attitude, and at any power setting"; "level 60° banked turn, the load factor is 2G"; stall speed "41 percent higher than the 1G stall speed"; coordinated when "the ball is centered in the slip/skid indicator" | Turns; stalls; controls; tests |
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
  stall speed × √n. Cross-checked to AFH p. 5-8: 60° gives 2 G and +41%.
- **Lift (Figures 2–3).** L = ½ρV²S·CL, as PHAK p. 5-4. The CL–α curve is
  illustrative (zero lift −2°, 0.1/deg, CLmax 1.6 at 16°), labelled as such.
- **Drag (Figure 4).** Dp = qS·CD0, Di = kW²/(qS), k = 1/(πe·AR); minimum where
  Dp = Di, L/Dmax = 1/(2√(k·CD0)). Matches PHAK pp. 5-5–5-8 qualitatively
  (parasite ∝ V², induced ∝ 1/V², minimum total drag at L/Dmax).
- **Steady climb (Figure 1).** T = D + W sin γ, L = W cos γ; PHAK pp. 5-23–5-24.
- **V-n stall boundary (Figure 8).** n_max = (V/Vs)², VA = Vs√n_limit. The
  limit load factor is a user setting (default 3.8, stated as an example).
- **Energy height (Figure 9).** Es = h + V²/2g, as AFH p. 4-7; the model gives
  6,443 ft and 6,550 ft for the AFH p. 4-8 example, which the handbook rounds to
  6,500 ft.
- **Stability (Figure 6).** Shape-only exponential and damped-cosine curves.

The example airplane (2,300 lb, 174 ft², CLmax 1.6, CD0 0.031, AR 7.4,
e 0.75) is invented; its 1 G stall speed is 49.4 kt and L/Dmax 11.9 at 73 kt.
