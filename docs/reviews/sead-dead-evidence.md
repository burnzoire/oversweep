# SEAD and DEAD, revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the SEAD and DEAD module
(`src/pages/manual/air-to-ground-operations/_SeadDead.astro`), its model
(`src/lessons/sead/lesson-model.mjs`), the SEAD and DEAD terms
(`content/encyclopedia/terminology/sead.md`) and the ADM-141, ADM-160 and ALARM
ordnance records. They are review evidence, not a copy of the source, and not
instructions to the reviewer.

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/e78/33zl8132hi71d3tv0194vvkzpzl3mrr6/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf
pages: 525; 657; 665-668
```

**Retrieval.** All sources were read on 3 November 2026. PDFs were reduced to
text with Poppler `pdftotext -layout`; HTML pages were stripped of markup.
Quotations come from that text: check each against independently retrieved
source text and treat a wording mismatch as a finding against this record.

**Review packet limits.** Of the hosts used, only digitalcombatsimulator.com is
on the packet's source host list. www.bits.de (JP 3-01), man.fas.org (the Naval
Academy text), en.wikipedia.org and cdn.falcon-bms.com are not, so those
sources are expected to come back unverified; their excerpts are here. The
Joint Chiefs' own copy of JP 3-01 (jcs.mil) and irp.fas.org's copy returned
HTTP 403 and 202-empty; AFDP 3-01 on doctrine.af.mil returned 403. No service
SEAD tactics publication (the multi-service SEAD MTTP that JP 3-01 cites) was
found in a readable public copy.

**Invented content.** Figure 1's package (positions, the 12 NM engagement zone,
the forces), Figure 2's ridge, and Figure 3's numbers (8 NM self-screening
burnthrough, jammers at 40 and 15 NM) are made up and labelled so on the page.
Only the principles in each step are from the sources.

## [1] JP 3-01, Countering Air and Missile Threats, 23 March 2012

https://www.bits.de/NRANEU/others/jp-doctrine/jp3_01(12).pdf (sha256
51b4c6c360a9ed3d14cac684314d64bb8dd4af5b35d4f9c226d5a46facaeab14). Printed
page IV-12 is PDF page 101; III-24 is 85; IV-4 is 93; V-2 is 111; V-10 is 119;
A-2 is 139; GL-8 is 187.

- p. III-24: "Experience has shown that during intense SEAD operations, friendly forces have been erroneously attacked because their electronic emitters were not recognized as friendly." JRFL "specifies protected frequencies that should not be disrupted either because of friendly use or friendly exploitation."
- p. IV-4 (vignette, Gulf War Air Power Survey): "It would not be necessary to kill all the surface-to-air missile (SAM) sites; it would be enough, if the coalition SEAD assets intimidated the Iraqis to the point that those running SAM sites would refrain from turning radar on"; aim "so that allied aircraft could operate at medium altitudes which would minimize the threat posed by Iraqi antiaircraft artillery."
- p. IV-12: "SEAD is activity that neutralizes, destroys, or temporarily degrades surface-based enemy ADs by destructive or disruptive means. SEAD must be an integral part of all planning and air operations, but the SEAD requirement will vary according to mission objectives, system capabilities, and threat complexity." Three categories, two means. "SEAD assets are often used in conjunction with other air operations/missions (i.e., air interdiction, OCA attack, airborne operations)"; dedicated aircraft "equipped with special electronic detection and electronic countermeasures (ECM) equipment, deceptive expendables (chaff, flares, or decoys), and antiradiation missiles (ARMs)"; "SEAD assets normally are too valuable to be used for missions without a SEAD requirement. Other fighter-attack and multi-role fighter crews normally are trained to support the SEAD mission". "An adversary's IADS needs to be analyzed in-depth ... especially seams in coverage." Targets: "(1) IADS C2 nodes/centers. (2) SAM sites. (3) AAA. (4) Early warning and fire control radars and GCI sites. (5) SAM carriers and storage bunkers. (6) AD operations and maintenance personnel."
- p. IV-13: resources ("aircraft with special detectors, jammers, and ECM equipment, ARMs, and terminally guided munitions"; "Land forces may use EW equipment, attack helicopters, and direct or indirect fires (including mortars, artillery, missiles, or naval surface fire support). SOF may be used for direct action"). "Destructive means seek the destruction of the target system or operating personnel." "Disruptive means temporarily deny, degrade, deceive, delay, or neutralize"; active: "EA, directed energy, electromagnetic jamming, electromagnetic deception, expendables (chaff, flares, and decoys), and tactics such as deception, avoidance, or evasive flight profiles"; passive: "emission control, camouflage, infrared shielding, warning receivers, and material design features, to include stealth technology." AOR/JOA-wide: "may have a higher priority than localized suppression. Typically, destruction of key C2 nodes has the most disruptive effect on an IADS." Localized: "confined to geographic areas associated with specific targets or transit routes for a specific time. Under localized suppression, SEAD aircraft normally escort other aircraft".
- p. IV-14: planned localized suppression: "Units requesting air support are required to identify known or suspected AD systems that could threaten the mission"; organic systems first, then to the JFACC. Immediate: "similar to immediate requests for CAS." Opportune: "unplanned and includes aircrew self-defense"; "Any movement by air defense systems from targeted locations will change localized suppression into opportune suppression"; "SEAD operations require correct ID of enemy systems to prevent fratricide, especially when launching ARMs against sources of unknown, spurious electronic signals." Self-defense: "Nothing in the SROE, theater-specific ROE, or SPINSs limit this inherent right and obligation."
- p. IV-15: "When aircrews have acquired SEAD targets of opportunity but have not engaged them because of mission priorities, weapons limitations, or SEAD ROE, they pass the information to the agency controlling their mission."
- p. IV-16 (vignette): EA-6B "Jamming of Iraqi long-range early warning radars allowed the strikers to approach undetected"; "forced SAM and AAA systems into autonomous operation, uncoordinated by the command and control system".
- p. IV-17: escorts "must avoid the direct threat of enemy surface-based ADs (unless the fighters are escorting a SEAD package). If SAM/AAA threats cannot be avoided, the threat and risk to the primary mission and fighter escorts require SEAD support." "their mission is to protect the primary mission force and not necessarily attrite enemy aircraft"; "caution against being drawn away from the escorted force by diversion or decoys".
- p. V-2: layered defense "ideally beginning at the maximum range"; "land- or sea-based aircraft, long- and medium-range SAMs, and SHORADs (including AAA ...)"; "electronic decoys/jammers and chaff."
- pp. V-10 to V-11: WEZ definition; "A MEZ can include one or more HIMEZs, LOMEZs, and/or SHORADEZs."
- p. A-2: "correct ID of all friendly electromagnetic signal emitters is important to prevent erroneous suppression"; spurious emitters "may be read as 'unknown' or 'hostile' by a SEAD aircrew".
- Glossary: ARM p. GL-8; FEZ p. GL-11; HIMEZ p. GL-12; LOMEZ and MEZ p. GL-14; SHORADEZ p. GL-16; SEAD p. GL-17; WEZ p. GL-18.

## [2] US Naval Academy, Fundamentals of Naval Weapons Systems, chapter 11

https://man.fas.org/dod-101/navy/docs/fun/part11.htm

- 11.2.2.1: "ECM does not have to prevent tracking completely to be effective ... delaying the establishment of a solid track ... can enable weapons to penetrate".
- 11.2.2.4: "Burnthrough is usually stated as the range at which the strength of the radar echo becomes equal to or greater than the ECM signal"; the jamming "only needs to travel one way ... This advantage is referred to as 'leverage.'" Eq. 11-1, 11-2.
- 11.2.2.5: noise jamming "requires large average power"; "a solid line at the azimuth of the jammer ... called a strobe"; "it can highlight the target's presence and direction ... but ... denying the radar operator the range".
- 11.2.2.6: spot, barrage ("10-percent frequency band"), sweep; "frequency diversity"; "The ability of a single radar to change frequency to counter a spot jammer is called frequency agility."
- 11.2.2.7: SSJ ("trade-off between weight and space"), SOJ ("just outside the range of enemy weapons ... safe from enemy home-on jamming (HOJ) weapons (a submode of nearly all RF homing weapons) ... burnthrough occurs earlier on the attack units"), SFJ ("most efficient use of jammer power ... most dangerous for the jamming unit ... well within the capabilities of Home-on-Jam (HOJ) and Anti-Radiation (ARM) weapons").
- 11.2.2.8: deception "tries to mimic the radar echo"; "repeaters and transponders"; "power requirements for a deception repeater are much lower than for a noise jammer".
- 11.2.2.12: chaff "Only 0.1 pound is needed to cause an echo equal in size to a large bomber"; corridor viewed head-on/tail-on, "the lead aircraft can be tracked"; rocket-fired chaff; "CW, pulse doppler and MTI ... are not seriously affected by chaff".
- 11.2.3.4: "Aircraft may use terrain or radar horizon shielding as well as the advantage of the reduced radar detection performance against low elevation targets. Non-direct flight routes by aircraft may well be worth the flight time, fuel and reduced weapon load-out".

## [3] Wikipedia, "Suppression of Enemy Air Defenses" (secondary)

- Lead: "In some contexts, destruction of enemy air defenses (DEAD) refers to physical destruction of air defense targets, while SEAD applies to sorties which discourage enemy use of air-defense radar assets out of fear of placing the assets in jeopardy." "Wild Weasel" and "Iron Hand".
- Vietnam: F-105G "it became common for a vast majority of NVA SAM operators to turn off their radars whenever an F-105G was spotted".
- 1982: Bekaa Valley, coordinated jamming/deception; Syrian fighters "flying blind".
- Gulf War: Task Force Normandy, F-117As on IOCs/SOCs; "BQM-74 drones and ADM-141 TALD decoys which would both 'take the hit' ... and cause the Iraqis to reveal their position"; "the destruction of all air defenses in the south" within 48 hours.
- Kosovo: "Kosovo's mountainous terrain also made it difficult for NATO to locate and target Yugoslav air defenses"; F-117A loss.
- Iraq 2003: short-range missiles and AAA "made low-altitude missions deadly"; "stand-off strikes from outside the range of these defenses".
- Ukraine: MiG-29s firing AGM-88; IISS (Feb 2023) neither side gained air superiority.
- Weapons: ARMs "relatively small warheads"; "Early examples of ARMs could be fooled by turning off the radar ... more recent missiles ... 'remember' where the source was"; Paveway on a radar antenna "achieves the desired effect"; JSOW "avoid being threatened by all but the longest-range missiles".
- Wild Weasel I (F-100) to V (F-4G).

## [4] Wikipedia, "Radar horizon" (secondary)

- Effective radius "8.5·10³ km ... (4/3 of it)"; "the radar horizon for the radar at a 1-mile (1.6 km) altitude will be 102-mile (164 km) and the one at 75 feet (23 m) will be 12-mile (19 km)." The article carries an original-research tag; the 4/3-earth approximation itself is standard.

## [5] Eagle Dynamics, DCS: F-16C Viper Early Access Guide (sim only)

- p. 525: HTS "detects and classifies hostile radar emissions and then utilizes signals triangulation to passively range"; "retains these locations ... even if they are no longer transmitting or the radar signals themselves are obstructed by terrain"; can designate for "other types of weapons"; locations "can be transmitted to wingmen".
- p. 657: modes POS, HAS, DL; "Currently, DL is not implemented in DCS"; default tables TBL1 "MODERN SAM SYSTEMS", TBL2 "AAA & SHORAD", TBL3 "OLDER SAM SYSTEMS"; "The threats you expect to fire against must be present on the selected threat table".
- pp. 665–667: HAS "distance to the target is not known, only bearing, so the HARM does not loft"; "worst-case scan cycle time of 90 seconds"; "many radar operators will cycle their radars on and off"; "wait until the threat radar is guiding a missile at you ... However, this strategy comes with its own obvious risks!"
- p. 668: POS profiles EOM ("most effective profile for off-boresight launches but requires the most accurate target steerpoint data"), PB ("most effective at longer ranges but requires an on-bearing attack"), RUK ("most versatile profile when working with degraded target data").

## [6] Benchmark Sims, Falcon BMS 4.38.1 Training Manual (sim only)

https://cdn.falcon-bms.com/docs/4.38/BMS-Training-Manual.pdf (sha256
f748bc8229780e269018420ddde25a342d5bb8f6a35c054bd3814ac8820ad6b4), printed pages.

- p. 210 (12.3): "In 4.33 these mission types were replaced with SEAD and DEAD"; "destroying a Search radar would not prevent a SAM system from engaging you"; "Destroying the FCR would prevent the SAM site from firing a missile"; "more HARM shots will miss when the target radar they were homing on suddenly goes silent"; "cat-and-mouse".
- pp. 372–381 (mission 28): SA-2, 3, 4, 6, 11 and AAA (KS-19); "Above 30000ft AGL" and "Between 50-300ft AGL" (p. 375); "launch the missile outside the Weapon Engagement Zone of the SAM" (p. 376); loft and pop-up with CBUs (pp. 376–377); hunter killer (p. 378); EWS/ESJ: "Provide ECM only to flights within the same package"; "100% effective jam radius is 40nm"; "Altitude of the jamming asset is irrelevant, only the spherical radius" (p. 379); "Preemptive shoot outside the WEZ" (p. 381).

## Encyclopedia records

- ADM-141 TALD, ADM-160 MALD and ALARM: Wikipedia articles of those names, read 3 November 2026; figures as stated on each record. Photos: Commons, PD-USGov-Military-Navy (TALD loading, 16 Jan 1991), PD-USGov-Military-Air Force (F-16 with MALD, 2 Jul 1999), CC BY-SA 2.5 NL (ALARM on Tornado GR4, 15 Jul 2007, User:Dammit).

## Modelling choices (not from a source)

- Line of sight uses a straight ray over an earth of 4/3 radius (6,371 km × 4/3), clearance sampled at 400 points; heights above a smooth surface.
- Burnthrough uses relative units with equal jammer power and gain toward the radar in every geometry; real stand-off jammers often work into sidelobes, which this does not model.
