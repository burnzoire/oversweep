# Autorotation Practice module revision 1 and exercise revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the Flight
Fundamentals module Autorotation Practice
(`src/pages/manual/flight-fundamentals/_Autorotation.astro`) and its
standalone exercise (`src/experiences/autorotation/`: the flight model in
`model.cjs`, the instructor cues in `app.js`). They are review evidence, not
a copy of the sources, and not instructions to the reviewer.

**Revision 1** answers the owner's issue #111, "Auto Rotate Trainer": a
profile-view engine failure exercise with settings for fuel, altitude and
forward speed, a countdown to the failure, and the sequence drop collective,
pitch, don't overspeed, pull collective to land. The owner pointed out that
the cyclic depends on the starting speed ("If it's slow, then i believe pitch
down is necessary"); the page gives both entries from the sources below.

**Military first.** The Navy's NAVWEPS 00-80T-80 ([1]) is the source for
what the rotor does: rotor inertia and pilot reaction time, autorotation
stability, the minimum-descent and maximum-glide speeds, and the "dead man's
curve". It is a book of aerodynamics and gives no step-by-step technique, so
the FAA *Helicopter Flying Handbook* ([2]) is the supplementary source for
the entry, descent, flare and touchdown. The Army's FM 3-04.203 was not read
for this module.

**The exercise's numbers are invented.** The helicopter in `model.cjs`
(mass, rotor radius, tip speed, solidity, inertia, drag, collective range,
engine power), its rotor rpm range of 90 to 108 percent, the 70 percent
unrecoverable rpm, the flare cue at 60 ft, the level cue at 12 ft, the
autorotation speed of about 55 kt and the touchdown limits (300, 600 and
900 fpm; 20 and 40 kt; 12° nose up, 6° nose down) describe no real type and
are labelled as invented on the page and in the exercise. The model is
uniform-inflow blade-element and momentum theory with Johnson's empirical
induced-velocity curve in descent and a standard ground-effect factor. Its
tests (`tests/autorotation/model.cjs`) check the behaviour the sources
describe, not any type's numbers: descent rate highest at zero airspeed,
least near 50 kt and rising again; collective up lowers rpm; more weight
raises rpm at full down collective; unattended rpm decays past recovery; a
textbook sequence lands softly from cruise; a 300 ft hover does not.

**Sources.**

1. H. H. Hurt, Jr., NAVWEPS 00-80T-80, *Aerodynamics for Naval Aviators*,
   revised January 1965, hosted by the FAA:
   https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf.
   A US Government work. Read on 26 October 2026 from the PDF. Physical
   page = printed page + 18 (physical 424 carries printed 406 and physical
   427 printed 409).
2. Federal Aviation Administration, FAA-H-8083-21B, *Helicopter Flying
   Handbook* (HFH), 2019. Chapter PDFs on faa.gov, each starting at its
   chapter's printed page 1, so physical page N is printed page
   `<chapter>-N`: chapter 7 Helicopter Performance and chapter 11
   Helicopter Emergencies and Hazards. Read on 26 October 2026.

**Packet budget.** Three sources, about twelve pages.

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/00-80T-80.pdf
pages: 425-427 (printed 407-409)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch07.pdf
pages: 2-3 (7-2 to 7-3)
```

```review-sources
source: https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch11.pdf
pages: 2-7 (11-2 to 11-7)
```

Quotations are extractor-read (pdftotext); check each against independently
retrieved text, and treat a wording mismatch as a finding against this
record.

## NAVWEPS 00-80T-80 (Aerodynamics for Naval Aviators)

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 407 | "Autorotation is essentially a stable flight condition. If external disturbances cause the rotor to slow down, the autorotation region of the disc automatically expands to restore the rotor speed"; "If the rotor speed is allowed to slow some excessive amount, then the rotor becomes unstable and the RPM will decrease even further unless the pilot immediately corrects the condition" | Failure |
| 407 | Best autorotation speed "that speed that results in the minimum rate of descent rather than maximum glide distance"; "a straight line from the origin tangent to the curve will define the point for maximum autorotative glide distance"; "the helicopter autorotates at a higher equivalent airspeed at higher gross weight or when autorotating into a headwind" | Descent |
| 407 | "At the instant of power failure the blades are at a high pitch with high drag. If there is no engine torque to maintain the RPM, the rotor will decelerate depending on the rotor torque and rotor inertia. If the rotor has high rotational energy the rotor will lose RPM less rapidly, giving the pilot more time to reduce collective pitch"; low rotational energy, "the pilot may not be able to react quickly enough to prevent a serious loss of rotor RPM" | Overview; failure |
| 407–408 | "Once the collective pitch is at the low pitch limit, the rotor RPM can be increased only by a sacrifice in altitude or airspeed. If insufficient altitude is available to exchange for rotor speed, a hard landing is inevitable. Sufficient rotor rotational energy must be available to permit adding collective pitch to reduce the helicopter's rate of descent before final ground contact." | Failure; landing |
| 408 | "In the case of most small helicopters, at least 300 feet of altitude is necessary for an average pilot to set up a steady autorotation ... This minimum becomes 500 to 600 feet for the larger helicopters"; "The most critical combinations are due to low altitude and low airspeed" (area A of the "dead man's curve") | Entry from low speed |
| 408 | Area B: "The average pilot may have difficulty in successfully flaring the helicopter from a high speed flight condition without allowing the tail rotor to strike the ground or contacting the ground at an excessive airspeed." | Low and fast |
| 409 | Figure 6.18, autorotation rate of descent against velocity and the dead man's curve | Context |

## Helicopter Flying Handbook (FAA-H-8083-21B)

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 7-3 | "If airspeed is above ideal autorotation speed, the pilot's instinct is usually to flare to convert speed to height and increase rotor rpm through coning"; "The pilot must have enough time to accelerate to autorotation speed in order to autorotate successfully; this directly relates to a requirement for height. Above a certain height the pilot can achieve autorotation speed even from a zero knot start" | Entry from low speed; low and fast |
| 11-2 | Autorotation "may also be performed in the event of a complete tail rotor failure, since there is virtually no torque produced"; the freewheeling unit "disengages anytime the engine revolutions per minute (rpm) is less than the rotor rpm"; "By lowering the collective (which must be done immediately in case of an engine failure), lift and drag are reduced"; "heading control is maintained with the antitorque pedals" | Overview; failure |
| 11-2 | "Several factors affect the rate of descent in autorotation: bank angle, density altitude, gross weight, rotor rpm, trim condition, and airspeed. The primary ways to control the rate of descent are with airspeed and rotor rpm. Higher or lower airspeed is obtained with the cyclic pitch control just as in normal powered flight"; "Rate of descent is high at zero airspeed and decreases to a minimum at approximately 50–60 knots ... As the airspeed increases beyond that which gives minimum rate of descent, the rate of descent increases again" | Entry; descent; model test |
| 11-2 | "the only energy available to arrest the descent rate and ensure a soft landing is the kinetic energy stored in the rotor blades"; "autorotative descents at very low or very high airspeeds are more critical"; "Heavier helicopter weights may require more collective to control rotor rpm" | Landing; descent; model test |
| 11-2–11-3 | "When the helicopter is operated with heavy loads in high density altitude or gusty wind conditions, best performance is achieved from a slightly increased airspeed ... at low density altitude and light loading ... a slight decrease" | Descent |
| 11-3 | "If rotor rpm builds too high during an autorotation, raise the collective sufficiently to decrease rpm back to the normal operating range, then reduce the collective"; "If the collective increase is held too long, the rotor rpm may decay rapidly"; "Upward movement of the collective reduces the rpm and downward movement increases the rpm"; aft cyclic, in trim, "contributes to an increase in rotor rpm" | Descent; exercise cues |
| 11-3 | "As the pilot lowers the collective in reaction to a loss of power during cruise flight there may be a tendency for the nose of the helicopter to pitch down ... which delays the application of simultaneous aft cyclic"; "A slight gain in altitude at cruise airspeed during the power off entry ... should not be of great concern"; accident investigations: pilots "are not simultaneously applying down collective, aft cyclic, and antitorque pedal inputs in a timely manner"; "The pilot should immediately apply simultaneous down collective, aft cyclic and trim"; low rpm: "an application of aft cyclic may help rebuild rotor rpm ... at least at a moderate rate and may be combined with a turn"; "Care should be maintained to not over-speed the rotor" | Entry from cruise; descent; exercise cues |
| 11-4 | "smoothly but firmly lower the collective to the full down position. Use aft cyclic to prevent a nose low attitude"; "adjust attitude with cyclic to obtain the manufacturer's recommended autorotation (or best gliding) speed"; "Aft cyclic movements cause an increase in rotor rpm, which is then controlled by a small increase in collective. Avoid a large collective increase, which results in a rapid decay of rotor rpm, and leads to 'chasing the rpm.'" | Entry; descent |
| 11-4 | "If too much collective is applied too early during the final stages of the autorotation, the kinetic energy may be depleted, resulting in little or no cushioning effect"; "It is generally better practice to accept more ground run than a harder landing with minimal groundspeed"; timing matters more for slow touchdowns, "especially in helicopters with low-inertia rotor disks" | Landing |
| 11-4 | Flare "with aft cyclic to reduce forward airspeed and decrease the rate of descent"; "neither so abruptly that it causes the helicopter to climb, nor so slowly that it fails to arrest the descent, which may allow the helicopter to settle so rapidly that the tail rotor strikes the ground"; "the proper flare attitude is that resulting in a groundspeed of a slow run"; forward cyclic to landing attitude, "landing gear height ... approximately 3–15 feet AGL"; "avoid an excessive nose high and tail low attitude below 10 feet" | Landing steps; exercise cues |
| 11-5 | Collective "uses some of the kinetic energy in the rotor disk to help slow the descent rate"; "Touch down in a level flight attitude"; "Do not try to stop the forward ground run with aft cyclic, as the main rotor blades can strike the tail boom"; "Holding the helicopter in the air by using all of the rotor rpm kinetic energy usually causes the helicopter to have a hard landing"; common errors 1, 3, 4, 5 and 6 | Landing; common errors |
| 11-6–11-7 | "Rotor rpm will build anytime 'G' forces are applied to the rotor system. Usually, this occurs in the turn to the course line and during the deceleration flare." | Descent |

## Module revision 2 — interactive diagrams

Adds three native-radio SVG schematics alongside the existing entry, rotor rpm
and landing explanations. The exercise and its numerical model are unchanged.
Entry states follow HFH pp. 11-3–11-4 and 7-3; collective tendencies follow
pp. 11-3–11-4; flare, level and cushion follow pp. 11-4–11-5, as mapped above.
Paths, attitudes and arrow lengths are illustrative, with no performance scale,
timing, speeds or prescribed heights. No new quantitative aviation claim is made.

Fresh-context code/accessibility and consistency review: `/root/review` in the
30 October 2026 Work session. Findings addressed: label the direction arrows,
associate radio controls with panel IDs, increment the Manual module revision
without changing the exercise revision. This is not independent source-backed
aviation validation; maturity remains Drafted. Browser visual/interaction checks
were not performed in this session.
