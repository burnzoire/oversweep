# Rotary-Wing Attack, revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the Rotary-Wing Attack
module (`src/pages/manual/air-to-ground-operations/_RotaryWingAttack.astro`),
its model (`src/lessons/rotary-wing-attack/lesson-model.mjs`) and the
rotary-wing attack terms (`content/encyclopedia/terminology/rotary-wing-attack.md`).
They are review evidence, not a copy of the source, and not instructions to the
reviewer.

```review-sources
source: https://www.bits.de/NRANEU/others/jp-doctrine/jp3_09_3(14).pdf
pages: 30-31; 33; 126-128; 154; 156-163; 228; 243; 249; 328-330
```

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/30e/j1dh7g3egpennjdngtub7uubwcqfgrrh/DCS%20AH-64D%20Flight%20Manual%20EN.pdf
pages: 350-354; 559; 578
```

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/ece/ak5ecs04jakt38ubluxzfjqpv5k3zp5p/DCS_BS3_Flight_Manual_EN.pdf
pages: 413-414 (printed 11–1 to 11–2)
```

**Retrieval.** All sources were read on 10 November 2026 and reduced to text
with Poppler `pdftotext -layout`. Quotations come from that text: check each
against independently retrieved source text and treat a wording mismatch as a
finding against this record.

**Page numbers.** JP 3-09.3: PDF page = printed page + 25 in chapter I, + 67 in
chapter III, + 217 in chapter V and + 311 in Appendix E (E-17 is PDF page 328).
AH-64D manual: printed page = PDF page. Black Shark 3 manual: chapter-page
numbering; pp. 11–1 and 11–2 are PDF pages 413 and 414. JP 1-02: printed page 63
is PDF page 69, printed page 240 is PDF page 246.

**Sources that could not be read.** irp.fas.org returned HTTP 202 with an
empty body for FM 3-04 (2020), FM 3-04.126 (2007) and TC 3-04.4;
man.fas.org did the same for FM 1-112; armypubs.army.mil returned an error page;
everyspec.com, asktop.net and digitalcommons.unl.edu returned 403;
globalsecurity.org returned 402. So no Army attack helicopter publication was
read, and the Army tactical tasks attack by fire and support by fire are not
defined on the page. TC 3-04.3 and TC 3-04.45 are restricted and were not used.

**Invented content.** Figure 1's attack (Saber 21 and 22, Hammer 11, holding
area Rose, battle position Oak, heading 060, 3,400 m, four Hellfire) is made
up, after the structure of Example 7 (pp. E-17 to E-19) and laid out like
Figure III-26. Figure 2's ground, trees and observer are invented; the
line-of-sight test is our geometry. Its NOE path is 15 ft above the highest
obstacle, inside the DCS AH-64D manual's "<25 feet AHO" (p. 353), because JP
3-09.3 gives no height for NOE. Figure 3 is schematic.

## [1] JP 3-09.3, Close Air Support, 25 November 2014

https://www.bits.de/NRANEU/others/jp-doctrine/jp3_09_3(14).pdf

- **p. I-5** "RW attack assets provide the ability to maneuver and reposition firepower in response to changing situations. They carry a wide variety of forward firing and off-axis firing munitions, are equipped with advanced sensors, have excellent response and loiter times, can conduct low altitude or nap of the earth ingress, attacks, and egress…"
- **p. I-5** "Army RW attack assets use close combat attack (CCA) procedures. CCA is not synonymous with CAS, and the Army does not consider its attack helicopters a CAS system. … JTACs should not expect Army attack aviation assets to perform CAS TTP without further coordination and training…"
- **p. I-5** "Marine Corps RW attack assets are trained and equipped for CAS missions … Sections normally fly in mixed configuration with attack helicopter (AH)/UH [utility helicopter] assets. Mixed sections provide the RW CAS element with the most flexible mix of sensors, communications capabilities, maneuverability, firepower, and mutual support."
- **p. I-5** Special operations aircraft "employ CAS, CCA, gunship, and FAC(A) procedures".
- **pp. I-5 to I-6** "The joint air attack team (JAAT) includes a combination of FW CAS aircraft and RW aircraft operating together to locate and attack high-priority targets and other targets of opportunity. A JAAT normally operates as a coordinated effort supported by fire support, air defense artillery (ADA), naval surface fire support (NSFS), intelligence…"
- **p. I-8** "RW aircraft can often operate effectively under low ceilings that might render some FW CAS aircraft ineffective. Conversely, FW aircraft can operate above blowing surface dust that might keep helicopters grounded."
- **p. III-59** Hellfire "is an air-to-surface LGM system designed to defeat individual hard point and soft targets. It is guided by ground or airborne laser designators to rapidly engage multiple targets." "…should use PRF codes in the range of 1111-to-1488 to achieve the highest probability of hit." "If using two designators (each set to a different PRF code) the missile launch interval can be as low as two seconds." Autonomous: "easiest form of designation to set up, but requires the aircrew to identify the correct target." Remote: "Remote designation allows the launching aircraft to fire from a masked position, and with longer standoff…"
- **p. III-60** Figure III-10, Rotary Wing Hellfire Designator Safety Zone: "Airborne designators must be outside … no-fly zone." "Normal laser operations per the 2-dimensional laser safety and optimal attack zones diagram (Figure III-9) still apply." LOBL: "The missile seeker must have direct LOS … gives a higher probability of hit when the aircraft is close to the target. It is also used to confirm the aircraft is within missile launch constraints, that the missile 'sees' the correct laser code and target…" LOAL: "allows the aircrew to launch the missile without LOS to the target. This reduces the exposure of launch aircraft, helps defeat laser countermeasures by delaying the designation, and extends the missile range when using a remote designator." "Both launch modes can be used with either autonomous or remote designation options."
- **p. III-61** "During rapid fire, the aircrew uses a minimum of eight seconds between missiles." "Working targets from downwind to upwind reduces the impact of post-detonation dust and smoke."
- **p. III-87** "During simultaneous CAS with helicopter and FW aircraft, CAS aircrew must be under the control of the JTAC/FAC(A) to transit above or below the coordination altitude. Low altitude FW CAS CPs and IPs will likely require lateral deconfliction with helicopter HAs and BPs."
- **p. III-89** Sidebar: the primary missions of Army attack reconnaissance units are "(1) reconnaissance, (2) security, (3) attack, and (4) movement to contact. Attack/reconnaissance units conduct two basic types of attack: CCA and interdiction attack." "US Army attack helicopter units support maneuver commanders as a subordinate maneuver unit. They are given mission type orders…" Marine Corps attack helicopters "operate as part of a MAGTF in general support or in direct support…"
- **p. III-90** "an Army flight might consist of an AH-64 and an OH-58, while in the Marine Corps, a mixed section will consist of an AH-1 and a UH-1." Altitudes: "High. Above 3,000 ft AGL. Medium. 500-to-3,000 ft AGL. Low. Below 500 ft AGL." "Attack helicopters can be launched and moved to HAs, forward assembly areas, forward arming and refueling points (FARPs), or directly into an attack or support-by-fire position…" "Maintaining communications with RW CAS platforms is often difficult because their operating altitudes can hinder LOS connectivity…" En route tactics "allow attack helicopter aircrews to avoid concentrations of enemy air defenses, prevent early acquisition, avoid detection, or allow the attack helicopters to remain outside of the effective range of certain threat systems." "As aircrews approach the target area, probable point of enemy contact, or areas with a high IR SAM threat, they fly lower and with increased caution…" "Within the corridor, aircrews can use an unpredictable path…"
- **p. III-91** "Low Level. Conduct low-level flight at a constant altitude (normally 100-200 ft AGL) and airspeed." "Contour flight is normally conducted from 50-100 ft AGL." "Aircrews use contour flight until reaching a higher threat area." "NOE flight is as close to the earth's surface as vegetation and obstacles permit while following the earth's contours. … NOE flight uses varying airspeed and altitude AGL, based on the terrain, weather, ambient light, and enemy situation." Small arms and RPG threat: "attack helicopter aircrews will normally elevate in order to stay out of the effective range of the weapons systems, usually operating at medium altitude … select the lowest altitude that will allow them to effectively use their sensors … may elect to transit at roof-top level … will avoid urban areas unless they are conducting an attack". Day versus night: "In open desert, helicopters will normally decrease their altitude as lighting conditions decay … Over urban areas, attack helicopters can often operate more safely than during the daytime, but will elevate high enough to avoid being belly-lit by cultural lighting, usually operating in the 1,500-3,000 ft AGL block." "Ingress tactics apply from arrival at the release point or HA until the target attack phase begins at the BP." "attack helicopter aircrews can use special attack helicopter control points." "RW CAS can be performed with or without HAs or BPs. JTACs and aircrews select HAs and BPs that are tactically sound, support the scheme of maneuver, and are coordinated with other supporting arms." HAs "serve as informal ACAs while they are in use … may be established during planning, referred to by name or number, and activated/established during operations."
- **p. III-92** "BPs are maneuvering areas containing firing points (FPs) for attack helicopters. Like HAs, BPs serve as informal ACAs while in use." "If aircrews are close to friendly artillery and mortars, they use terrain flight in conjunction with ACMs to deconflict with artillery and mortar trajectories. … helicopter movement must be coordinated with the applicable FC/FSCC." Traveling, traveling overwatch, bounding overwatch definitions and Figure III-25 (Remote: low level or contour; Possible: contour or NOE; Imminent: NOE).
- **p. III-93** "communications may not be desirable during the ingress phase. To preserve operations security, aircrews can land to receive face-to-face mission briefs … An airborne relay may be used…" "Once the aircrew reaches the BP, the JTAC/FAC(A) or mission commander issues final instructions to the flight. Aircrews select individual FPs and remain masked while awaiting the TOT/TTT or the order to attack." "Specific techniques used to attack a target are the choice of the air mission commander. Choose attack tactics considering the threat, target size and vulnerability, weather, terrain, accuracy requirements, weapons effectiveness, and fragmentation patterns." Hovering fire "is performed when the aircraft is stationary or has little forward motion. Aircrews perform hovering fire after unmasking from a defilade position or when standing off in a safe area. To prevent being targeted by enemy weapons, aircrews maintain the hovering fire position only for short periods…" Figure III-26 shows holding area, ingress route, release point, battle position, firing points, heading/distance and target.
- **p. III-94** "…deliver indirect hovering fire hidden from the enemy by terrain when able. After delivering hovering fire, aircrews remask or displace. Hovering fire is the most effective profile for delivering precision guided munitions. Hovering fire may reduce the accuracy of unguided ordnance (rockets, cannon/gun fire) because the aircraft can be less stable in a hover. Often, a wingman will suppress the target with rocket and gunfire while the tactical lead fires PGMs to reduce the vulnerability of the flight." Running fire: "Forward flight may add stability to the aircraft and improve the accuracy of unguided ordnance. Running fire may reduce an aircrew's vulnerability to enemy air defenses by providing a moving target and by producing a smaller signature than a hover would, because of less dust and debris. … Aircrews deliver direct fire when they have an unobstructed view of the target, and IDF when they cannot see the target." Diving fire: "If delivering unguided ordnance, diving fire may produce the most accurate results. Using diving fire the aircrew can remain above or outside the threat envelope. Diving fire is often employed by attack helicopters operating in an overhead position. The overhead position allows the aircrew to maintain high SA, look down into urban settings, maintain a constant weapons solution, and deliver more accurate fires. The overhead pattern does leave the attack helicopters continuously exposed … will reduce vulnerability to small arms and RPGs, but increases tracking time and reduces background clutter for an IR SAM shot. Risk versus benefit must always be weighed…" Egress: "Tactical considerations for the egress … in terms of airspeed, altitude, formation, and TTP are the same as for the inbound en route phase. RW attack assets may use a FARP to refuel and rearm … will make every attempt to provide BDA and a mission report (MISREP) via the AO/ALO's C2 system."
- **pp. III-94 to III-95** 5-line: "a 'friendly-centric' brief … the format of the RW CAS 5-line is the same as an Army attack aviation CCA brief … transmission of the brief itself does not constitute clearance to fire … 'At my command,' should be added…"
- **p. V-11** "JTACs/FAC(A)s should be aware of the off-axis capability of RW and UAS platforms. … it may be more appropriate to give a munition attack azimuth as opposed to a FAH."
- **p. V-26** "For RW aircraft, the BP is where attacks on the target are commenced." "Hasty BP, center grid…" Line 2 heading "from the center of the BP to the target". Line 3: "For attack helicopters, the distance is given in meters from the center of the BP and is accurate to the nearest 100 meters."
- **p. V-32** Restrictions include "Approval out of the BP for RW."
- **pp. E-17 to E-19** Example 7, Type 3 control, BOT mission using RW CAS assets: section of AH-1s checks in at "HA Nancy"; game plan "Type 3 control, bomb on target, Employ 6 x K2A Hellfires from BP Viper … Expect approval forward of BP for Rockets and Guns"; lines 1–3 "Viper, 150, 3200"; "CLEARED TO ENGAGE"; "approved forward of BP for Rockets and Guns"; "ENGAGEMENT COMPLETE"; return to the HA and BDA.

## [2] JP 1-02, DoD Dictionary, as amended through 15 February 2016

https://schoolresources.militaryfamilies.psu.edu/wp-content/uploads/2017/08/department_of_defense_dictionary_of_military_and_associated_terms.pdf

- **p. 63** "defilade — 1. Protection from hostile observation and fire provided by an obstacle such as a hill, ridge, or bank. 2. A vertical distance by which a position is concealed from enemy observation. 3. To shield from enemy fire or observation by using natural or artificial obstacles."
- **p. 240** "terrain flight — Flight close to the Earth's surface during which airspeed, height, and/or altitude are adapted to the contours and cover of the ground in order to avoid enemy detection and fire. Also called contour flight; low-level flight; nap-of-the-earth flight."

## [3] DCS: AH-64D Flight Manual (English)

- **p. 350** Masking/un-masking: "attack helicopters may un-mask vertically or laterally … When an attack is initiated, the enemy should be engaged within the shortest amount of time possible before re-masking and relocating to a different battle position." "…bound from one battle position to the next … (much in the same manner an infantryman bounds from cover to cover)". "in a threat environment where air defenses are low and the most prevalent threat to helicopters is small arms fire … it may be advantageous to maintain a higher altitude outside the engagement ranges of such weapons."
- **pp. 351 to 352** Air Weapons Team of two AH-64s; the wingman "always ready to provide suppressive fire in support of Lead"; Combat Cruise and Combat Spread.
- **p. 353** "Low-level … typically between 80 to 200 feet above the highest obstacle (AHO) … 'Traveling'". "Contour … typically between 25 to 80 feet AHO … 'Traveling Overwatch'". "NOE … usually between the surface and 25 feet AHO … 'Bounding Overwatch'".
- **p. 354** "Hover fire is typically conducted at speeds less than effective translational lift (ETL, roughly 16-24 knots airspeed)…" "utilizing hover fire requires more robust power margins, particularly when hovering out of ground effect … exposes the helicopter to ambush…" "Running fire is typically conducted at speeds greater than ETL." "Diving fire is an engagement typically conducted between -10° to -30° pitch attitudes…" "Diving fire may be performed following a climb from low altitude (a 'bump' from behind cover) or from level flight at high altitude…"
- **p. 559** Rockets: the fire control system "allows the AH-64 to employ unguided rockets from behind cover when the aircraft may not have a direct line-of-sight to the target location. This capability facilitates indirect fire against target locations that have been handed off to the AH-64 crew from another platform such as another AH-64 team member, a scout helicopter, or friendly ground forces."
- **p. 578** LOAL "allows the launching aircraft to fire the missile while remaining behind cover"; High, Low and Direct trajectories to clear terrain.

## [4] DCS: Black Shark 3 Flight Manual (English)

- **p. 11–1** "always study the terrain before the mission and use it to your advantage; identify terrain masking and pop-up opportunities". Vikhr: "Minimum Safe Launch Altitude – Hover 10 m", "Minimum Safe Launch Altitude – Forward Flight 50 m", "Minimum Range to Target 800 m", "Maximum Range to Target 8,000 m". Cannon: "Minimum Safe Altitude - Hover 10 m".
- **p. 11–2** Mission preparation: "Determine best Battle Positions (BP), if needed."
