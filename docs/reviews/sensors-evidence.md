# Sensors & Situational Awareness, revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the two Sensors &
Situational Awareness modules, Radar, Warning Receivers and Countermeasures
(`src/pages/manual/sensors-situational-awareness/_RadarAndWarning.astro`) and
Situational Awareness and the Sensor Picture (`_SituationalAwareness.astro`
beside it), their models (`src/lessons/sensors/`) and the sensors terms
(`content/encyclopedia/terminology/sensors.md`). They are review evidence, not
a copy of the source, and not instructions to the reviewer.

```review-sources
source: https://falcon.blu3wolf.com/Docs/Electronic-Warfare-Fundamentals.pdf
pages: 43 (3-2); 75-80 (5-12 to 5-17); 131-134 (7-20 to 7-23); 152-154 (9-1 to 9-3); 212-219 (13-1 to 13-8); 246-252 (15-1 to 15-7); 264-276 (17-1 to 17-13)
```

```review-sources
source: https://falcon.blu3wolf.com/Docs/P-825.pdf
sha256: d61b2be4c25e560d7234bfb967af6c7ae6b6fcc46bb973da8104a2cca0632086
pages: 169 (5-1); 173 (5-5); 175-179 (5-7 to 5-11); 194-195 (7-6 to 7-7); 205 (8-5); 207 (8-7); 235 (10-3); 268 (13-2); 284-287 (14-4 to 14-7); 302 (16-4); 310-311 (16-12 to 16-13)
```

```review-sources
source: https://falcon.blu3wolf.com/Docs/F-16%20COMBAT%20AIRCRAFT%20FUNDAMENTALS%20-%20Multi-Command%20Handbook%2011-F16%20Vol5.pdf
pages: 8-11; 19-24; 284
```

```review-sources
source: https://www.bits.de/NRANEU/others/jp-doctrine/jp3_01(12).pdf
sha256: 51b4c6c360a9ed3d14cac684314d64bb8dd4af5b35d4f9c226d5a46facaeab14
pages: 45 (II-12); 59 (II-26); 76 (III-15); 138 (A-1); 142 (A-5)
```

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/e78/33zl8132hi71d3tv0194vvkzpzl3mrr6/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf
sha256: b26f89b715cd130f82798a2e8973a1b7dd52b4366007feb4c7a29677f248e7c5
pages: 380; 382; 386; 388-391; 393; 452-453; 487; 693-694
```

```review-sources
source: https://cdn.falcon-bms.com/docs/4.38/BMS-Training-Manual.pdf
sha256: f748bc8229780e269018420ddde25a342d5bb8f6a35c054bd3814ac8820ad6b4
pages: 136; 277; 296; 379
```

**Retrieval.** All sources were read on 9 November 2026 with curl and reduced
to text with Poppler `pdftotext` (with and without `-layout`; the layout mode
drops some lines that overlap figures in Electronic Warfare Fundamentals, so
quotations from it were checked in both). The two web sources were read as
HTML (the Naval Academy text) and as wikitext (Wikipedia). Quotations come
from that text: check each against independently retrieved source text and
treat a wording mismatch as a finding against this record. Physical PDF pages
are in the blocks above; the pages cite printed pages. For the MCH, the DCS
guide and the BMS manual the printed page is the PDF page.

**About the sources.** [EWF] *Electronic Warfare Fundamentals* (November
2000) is a student text by Det 8, ACC Training Support Squadron (preface:
"a student supplementary text and reference book that provides the
foundation for understanding the basic concepts underlying electronic warfare
(EW)"), read on the same public mirror as P-825. [P-825] is described in
`bvr-intercepts-evidence.md`. [MCH] MCH 11-F16 Volume 5, *F-16 Combat
Aircraft Fundamentals*, 10 May 1996 (ACC), superseded; the modules use only
principles it states for every pilot. [USNA] *Fundamentals of Naval Weapons
Systems*, US Naval Academy, on man.fas.org (chapters 6, 10 and 20, HTML; no
page numbers, cited by section). [JP 3-01] as in the BVR evidence.
[Wikipedia] *Link 16* and *Night-vision device*, read 9 November 2026.

**Not readable.** Army TC 3-04.1-6 (Aeromedical Training for Flight
Personnel, the goggle chapter) and TC 3-04.11 (aircrew coordination) are
listed on armypubs.army.mil with no public download; Air Force
e-publishing (AFI 11-290 crew resource management) returned 403; DTIC
returned 403; the NAWCWD EW handbook URL returned 404. The pages say so in
their applicability notes.

**Invented content.** The worked engagement and Figure 1 of the radar module
(bearings, headings, the spike dropping at the end), Figure 2's bar width
(2.2° a bar) and its frame-time scaling in proportion to bars and width
(only the 13 s anchor is sourced), Figure 3's speed gate and speeds, and the
generic warning-receiver symbology (EW and AI, a box for track, a circle for
launch, a chevron for airborne) are made up and labelled so. In the
situational awareness module, the worked picture and Figure 1's tracks,
positions and calls, and Figure 2's sector shapes and how many sectors each
workload level keeps, are invented; the sector order and the radar's place
are sourced.

## [EWF] Electronic Warfare Fundamentals

- p. 3-2: "PRF is the rate at which pulses or pulse groups are transmitted"; "do not confuse the operating frequency of the radar, which is measured in Hz, with the pulse repetition frequency"; "Pulse radar systems can employ PRF stagger or PRF jitter as an electronic protection (EP) technique against repeater or synchronous jammers."
- p. 5-14: "two, or more, aircraft flying a trail formation closer than 492 feet would be displayed as a single target ... the shorter the pulse width, the better the range resolution ... The narrower the horizontal beamwidth, the better the azimuth resolution".
- pp. 5-16 to 5-17: "The radar cannot process frequencies cancelled by these filters. The filters create "blind speeds" for the radar. The closer together the spectral lines, the more "blind speeds" the radar will have." "The higher the PRF, the wider the spacing of the spectral lines and the fewer blind speeds ... However, a high PRF increases the problem of range ambiguities. Most modern pulse Doppler radars employ a medium and high PRF mode." "the radar cancels out all returns with no frequency shift, which equates to canceling all returns with no movement relative to the radar."
- p. 7-20: "Pulse Doppler radars combine the advantages of both pulse and Doppler radar systems ... can also compute overtake, or rate of closure ... an MTI uses Doppler frequency shifts only to reject clutter while a pulse Doppler radar uses Doppler frequency shifts to reject clutter and to track targets in velocity."
- p. 7-21: "Low PRF tracking in velocity is extremely difficult ... Low PRF gives accurate range and azimuth as well as long, unambiguous range. Medium PRF tracking in range, azimuth, and velocity is easy for the radar to handle. High PRF provides excellent velocity resolution, but range ambiguities become a problem."
- p. 7-22: "The primary operator exploitable weakness of a pulse Doppler radar takes advantage of the pulse Doppler radar's biggest strength ... a filter is designed in the radar to eliminate all targets with a low velocity relative to the radar. The key to breaking track of a pulse Doppler radar is to place the aircraft in a speed less than the speed gate relative to the radar ... commonly referred to as the Doppler notch." "Range ambiguity occurs primarily with long-range targets when the return comes back to the radar after another pulse has already been transmitted".
- p. 7-23: "Range eclipsing occurs when a target return comes back to the radar antenna while a pulse is being transmitted ... Since the radar cannot receive while transmitting, the return will not be displayed." "By changing the PRF slightly, these range problems can be resolved ... The computer logic needs to be extremely advanced".
- p. 9-1: "There are two types of radar jamming: noise and deception. a. Noise jamming ... relies on high power levels to saturate the radar receiver and deny range".
- p. 9-2: deception jamming "alters the signal to provide false range, azimuth, or velocity information ... must match not only the victim radar's operating frequency, but all the other operating characteristics, including pulse repetition frequency (PRF), pulse repetition interval (PRI), pulse width, and scan rate."
- p. 9-3: "two primary employment options ... (1) support jamming, and (2) self-protection jamming. Support jamming can be broken down further into standoff jamming (SOJ), and escort jamming." "From an orbit area outside the surface-to-air missile (SAM) engagement zone, SOJ aircraft employ specialized jamming techniques".
- p. 13-1: chaff "is especially true when chaff is employed with self-protection jamming and aircraft maneuvers."
- p. 13-2: "Chaff screening and self-protection are the two basic chaff employment tactics. Chaff screening tactics, including area saturation and chaff corridor employment, are designed to confuse and deny acquisition information to the early warning, GCI, and acquisition radars ... Self-protection tactics are designed to counter acquisition and target tracking radars (TTRs). When used with jamming and maneuvers, chaff can cause TTRs to break lock or generate survivable miss distances".
- pp. 13-6 to 13-7: "For self-protection chaff to cause a radar to transfer tracking to the chaff, the chaff must bloom within the radar resolution cell."
- p. 13-8: "Against Doppler radars, self-protection chaff is most effective when dispensed at or near the beam ... it slows to the velocity of the surrounding air mass almost instantly ... radar systems employing Doppler processing and tracking will not display the chaff. Doppler processing radars will continue to track the aircraft unless it also has a relative velocity of zero. This occurs when the aircraft is abeam the radar. Chaff corridor and area saturation tactics against Doppler tracking radars will have limited effectiveness."
- pp. 15-1 to 15-3: "To decoy an IR missile seeker, the flare must create a heat source more attractive than the aircraft, within the missile field of view. The most important flare characteristics ... are IR wavelength matching, flare rise time, and flare burn time." "some advanced IR missiles now look for a rapid rise in IR energy as a trigger"; "Flare rise time varies dramatically with altitude"; kinematic flares "negating or delaying the missile's flare rejection trigger".
- pp. 15-4 to 15-5: "It is important to perform maneuvers along with flare employment ... one tactic is to immediately dispense a flare and maneuver to put the missile on the beam. This increases the line-of-sight rate ... and gives maximum separation between the aircraft and the flare." "Classified tactics manuals provide aircraft specific maneuvers and flare dispensing programs".
- pp. 15-5 to 15-6: "reduce the intensity of the heat signature of the aircraft by reducing the power setting ... Use of afterburner should be minimized ... The pilot should not reduce the power setting below the minimum required to maintain sufficient maneuvering airspeed." "Maneuvering into the sun masks the aircraft's IR signature"; "Clouds or smoke can also confuse IR threat systems".
- pp. 15-6 to 15-7: "Since IR threat systems are generally passive, the radar warning receiver (RWR) will provide no attack warning unless the threat uses some detectable radar energy for acquisition prior to launching an IR missile." "The two primary requirements for MAWS are timeliness and reliability"; "the sun, flares, or the wingman's aircraft have been known to cause false alarms"; "The active MAWS use a pulse Doppler radar"; "The passive MAWS operate in either the ultraviolet, or the infrared frequency spectrum."
- p. 17-1: "Radar surveillance and radar-directed weapons represent the biggest threat to aircraft survival on the modern battlefield. The first step in countering these threat systems is to provide the pilot or crew with timely information on the signal environment." "The RWR system is an example of an electronic warfare support (ES) system." "Precise position determination is not possible with most RWRs."
- pp. 17-2 to 17-5: sensitivity; cross-polarization "could be delayed until the aircraft is within the lethal range of a threat system"; CVR "can be saturated in a dense signal environment"; superheterodyne "limited capability to receive signals from threat systems employing scanning antenna patterns."
- pp. 17-6 to 17-8: the processor "identify, among the thousands of similar signals, those generated by lethal threat systems"; characteristics "radio frequency, pulse width, pulse repetition frequency"; "The EID table ... is created from information gathered from electronic warfare support (ES) assets and intelligence sources ... can be changed and updated".
- pp. 17-8 to 17-9: "each threat system has its own unique symbol ... an audio tone is generated ... symbols and audio associated with specific threat system actions, including search, track, and missile launch. The position of the threat symbol on the RWR scope always represents the relative position of the threat in relation to the aircraft which is the center of the RWR scope."
- pp. 17-9 to 17-10: ""new guy" alert audio"; constant audio "can be either "real" or synthetic"; "a launch warning audio when the signal characteristics of the threat indicate a missile launch condition exists"; the ICU "selecting appropriate priority lists based on ingress and egress tactics, controlling threat audio presentation, and determining the number and types of threats displayed ... an additional visual indication of missile launch."
- pp. 17-10 to 17-13: "The most important limitations include ambiguities, impact of maneuvering, and electromagnetic interference"; "RWR ambiguities may occur from both enemy and friendly radar systems"; "If aircraft maneuvering exceeds these limits, RWR threat positioning data becomes unreliable ... inaccurate threat azimuth and multiple threat symbols"; "Symbol age-out is the time ... that the RWR will continue to display a threat symbol after the signal processor has determined that the threat is no longer transmitting ... set for each threat in the EID tables."

## [P-825] CNATRA P-825 (07-14)

- p. 5-1: AIC radars "usually rotate through 360 degrees in their scan pattern at a low rate ... AIC is not able to provide close control to fighters at long range using only their available radars."
- p. 5-5: "In fleet operations, this information can be combined with information from data link systems to provide an enormous amount of information to controllers including fuel state, weapon load and even radar status."
- pp. 5-7 to 5-9: broadcast and tactical control, bullseye and BRAA, declarations (quoted in `bvr-intercepts-evidence.md`).
- p. 5-11: "Effective intercepts require that the fighter and AIC controller work as a team to establish a common understanding of the situation, also called the air "picture."" "When the fighter requests a picture from AIC, AIC will respond with the location of all known hostile, bandit, or bogey groups. If the fighter has contact with a group that is not identified by AIC, then the fighter should identify that group ... and request a declaration."
- pp. 7-6 to 7-7: the trainer's EW display "provides an indication of the direction of arrival of detected threats ... Direction of arrival may not be accurate enough for defense"; "Different tones indicate the threat has locked the fighter and employed weapons."
- p. 8-5: "With 90 TA, VC will be equal to the fighter's speed (300 KGS + 0 KGS component to downrange travel) and the bandit will be hidden by the radar's clutter notch."
- p. 8-7: "vertical displacement (feet) = Elevation X SR X 100"; "if the fighter is at 20,000 feet and AIC calls bandit altitude at 30,000 feet at 20 miles, the fighter should ensure that the scan volume indicates that the bars are covering an elevation angle of at least 5 degree high".
- p. 10-3: "place the acquisition cursor ... at the location of the BRA called by AIC, and then adjust the elevation of the scan volume to bracket AICs called altitude ... If AIC does not pass altitude information, the fighter should manually adjust the scan volume only after two complete frames ... If in a 6-bar scan, the radar operator should ensure that any elevation adjustments made occur after sanitization of the complete frame". "Lead SNFO (PRI) "SABRE, Hammer-11, contact BRA 177, 28, 22 thousand, declare""; "AIC will repeat the call to correlate the group and provide the declaration."
- p. 13-2: "the fighter should be patient as a RWS/140 degrees/6B frame takes approximately 13 seconds to complete."
- p. 14-4: the AIM-7 needs the fighter to "provide radar illumination, via STT, until weapon impact."
- p. 14-7: "the strike fighter is not required to illuminate the target with a radar lock because the AMRAAM can guide via a Track While Scan system ... multi-target capability".
- p. 16-4: "The initial radar setup ... RWS; 6 Bar; 140 Azimuth; 80 NM scale; Acquisition cursor at 25 NM; Centered on own aircraft altitude".
- pp. 16-12 to 16-13: "If the fighter is behind timeline and spiked, assume that the bandit has employed a missile ... a. Place the bandit in the beam, turning in the shortest direction using a hard as possible, level turn. b. Dispense chaff while turning. c. Hold the bandit in the beam for at least 5 seconds or until spike goes away." "This beam maneuver will defeat the threat radar lock by exploiting the Doppler notch."

## [MCH] MCH 11-F16 Vol 5

- p. 8: "Some basic top priority tasks are: Maintain aircraft control. Never hit the ground (or anything attached to it). Never hit anything in the air (i.e., your lead/wingman). Never run out of fuel. Never let anything shot from the ground or air hit your airplane." "Your list of have-to-do tasks should be established long before you get near an airplane."
- p. 9: "Lower priority tasks range from answering fuel checks on the radio to calling METRO with a PIREP"; "at 20,000' in close formation in the weather, avoiding collision with members of your flight is a bigger concern than hitting the ground"; "Many of the revisions in this manual are the result of accidents that occurred because of mispriortization."
- pp. 10 to 11: objectives "tailored to the lowest common denominator"; "Each member of the team must mentally fly the mission before he straps on his jet (chair fly)"; "Fighter pilots aren't born with it; SA must be developed and kept "current."" "Get the "big picture"; strive for "no surprises."" "SA is your perception and understanding of what is actually occurring in the aerial arena. It is gained through assimilating information obtained through: On board radar. RWR. Flight members. GCI/AWACS. Support assets. Visual acquisition. Mutual support." Wingmen "help the leader plan ... have visual lookout and radar responsibilities, perform back-up navigation tasks".
- p. 19: "A vital subset of situational awareness is mutual support (MS). Mutual support is a contract within a flight of two or more aircraft"; "Flight leads must carefully assess the experience/proficiency level of their flight members"; "Position awareness of other flight members. Early position awareness of the threat and the attack axis. Communication of offensive and defensive information to the flight. Targeting and weapons employment prior to threat attack. The ability to prosecute the attack and/or disengage."
- p. 20: "Visual lookout is a priority task for all flight members, flight leads as well as wingmen. Historically, 90% of all air-to-air kills were achieved due to undetected attacks." "The amount of time you spend maintaining visual contact or the formation position influences your ability to detect a threat visually or by other means (radar, GCI, etc.)."
- p. 22: formation responsibilities, Numbers One to Four (as tabulated); "start with the basic NEAR ROCKS, FAR ROCKS, CHECK SIX pattern and build up the visual search arena as allowed by task saturation ... drop the lowest priority sectors in order."
- p. 23: "There will be times, such as hard turns, when only NEAR ROCKS can be cross-checked. The key is to quickly re-establish the cross-check one sector at a time"; "he can only perform one task at a time"; Sectors 1 (NEAR ROCKS, "the next 10 to 15 seconds"), 1A (FAR ROCKS), 2 ("inside the flight's six o'clock"), 3 ("inside the flight ahead of the 3/9 line ... bandits in a conversion, as well as SAMs"), 4 ("outside the flight, ahead/behind the 3/9 line ... the lowest priority").
- p. 24: "As lead or three, it should be part of Sector 3. As two or four, the radar should be after Sector 4." "When switch changes are required, substitute them for a cross-check sector search."
- p. 284: "You can use the FLIR display in the HUD to give you another horizon reference ... keep track of where the cloud decks or cells are. Be careful not to turn the intensity too high or you won't be able to see the normal HUD symbology ... could cause a green reflection on the canopy"; "If you're a wingman rejoining ... you should be concentrating on flying a good rejoin and not looking in the TGP display for weather."

## [USNA] Fundamentals of Naval Weapons Systems

- Ch. 6: "The concept of TWS is to maintain target tracks in a computer with periodic information updates from a scanning radar"; "target data is not continuously available for each target."
- §10.5: Johnson's levels "1. Detection (an object is present) 2. Orientation (longitudinal axis can be sensed) 3. Recognition (class discerned) 4. Identification (types in class can be determined)"; "Which is "better" -- low-light-level systems or Forward Looking Infrared (FLIR) systems?" The answer is neither."
- §10.5.3: "Light gains of 1000 to 10,000 are readily available"; "a considerable degree of detail degradation"; "no LLLTV systems can "see" in complete darkness -- some visible spectrum illumination is required from stars, moon, sky, etc."; FLIR "no visible illumination of the scene is required. Unfortunately, FLIR's are not "all weather". Clouds, rain, humidity, or other moisture absorbs and scatters infrared energy, thus reducing FLIR range compared to that of radar ... FLIR can more readily penetrate light fog and haze"; thermal and angular resolution "cannot be achieved with one system"; "they work better at night when warm bodies stand out more clearly against the cooler ambient temperature background."
- §20.4.4: "Link 11 is a two-way, real-time encrypted data transmission ... can relay secure tactical sensor information in addition to weapon deployment and engagement status"; Link 4/4A "used to exchange information with and control specially configured fighter aircraft ... data on target location and identity can be transferred from the fighter to the controlling unit"; "Link 16 will provide similar but expanded capabilities."

## [JP 3-01] Countering Air and Missile Threats (2012)

- p. II-12: "A tactical data link (TDL) such as Link 16 enables sharing of the CTP between Service systems and RADCs/SADCs."
- p. II-26: "An accurate CTP requires proper track management ... Track information from the components is consolidated in the CTP utilizing data link interfaces."
- p. III-15: "Formation tracking is the use of a single data link air track (with a strength field indicating the number or estimated number of aerial vehicles comprising the formation) ... Formation tracking reduces operator workload ... and reduces the number of transmitted tracks".
- p. A-1: "ID information may be obtained from onboard or external surface-, air-, and space-based systems ... An effective C2 system (including reliable voice and data networks) is required to gather, assimilate, assess, and distribute this information".
- p. A-5: identification matrix note "2. ID friend by voice/data link verification".

## [Wikipedia]

- *Link 16*: "Link 16 is a TDMA-based secure, jam-resistant, high-speed digital data link that operates in the radio frequency band 960–1,215 MHz"; "Link 16 information is primarily coded in J-series messages"; "PPLI, or Precise Participant Location and Identification".
- *Night-vision device*: "the commonly used AN/PVS-14 has a FoV of 40°, less than the 95° monocular horizontal FoV and humans' 190° binocular horizontal FoV. This forces users to turn their heads".

## Sim sources

- DCS F-16C p. 380: in STT "the antenna will be pointed directly toward the target so the radar beam can dwell on the target itself". p. 382: "Increasing the number of bars within the scan pattern increases the volume of airspace that is scanned by FCR, at the expense of increasing the time needed"; ANT ELEV "directs the entire FCR search volume upwards or downwards"; cursor altitude limits. p. 386: staggered PRI "allowing the radar to filter range-ambiguous returns". p. 388: "radar emissions can highlight the presence of the ownship to other aircraft equipped with radar warning receivers well beyond the operational range of the radar itself." pp. 389-391: HPRF/MPRF/LPRF trade-offs; RWS "utilizes MPRF waveforms only"; VSR HPRF/MPRF; the MTR example ("slow-moving aircraft or aircraft flying perpendicular to the F-16 may also be rejected as ground clutter"). p. 393: "by actively emitting radio signals, a radar jammer also highlights the presence of the emitting aircraft". pp. 452-453: MIDS LVT, TNDL "collectively maintain a common tactical picture"; "A maximum of 8 aircraft ... to include the ownship"; "a maximum of 4" donors; C2 platforms "using a dedicated Mission channel". p. 487: FLIR "Wide and Narrow"; TV "daylight hours only"; picture-in-picture. p. 693: "Antenna coverage of the ALR-56M is 360° in azimuth but only ±45° in elevation ... radar lock and missile launch warnings will be lost"; "the RWR only indicates the presence of radar signals; it does not indicate when a radar has detected the aircraft, nor does it indicate whether a radar is actually tracking the ownship or another aircraft along the same general bearing." p. 694: "Radar symbols that represent more lethal threats to the aircraft are shown closer to the center of the display."
- BMS p. 136: "In BMS, NVGs limit the pilot's field of view, aiming to simulate a tunnel vision experience." p. 277: mission 17C "is all about basic IDM and Link 16 features ... how to use Link 16 information to enhance your SA". p. 296: banzai "separate element for opposite direction to notch against adversary (for ex: if adversary is at 360 then notch to 270 and 90). Keep notching for pre-briefed time (commonly 15 seconds) ... If spiked, then abort". p. 379: "use your eyeball or the RWR to determine the direction from which the missile is coming."
