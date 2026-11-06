# Precision Targeting, revision 1 — source evidence

Short, page-specific excerpts supporting the claims in the Precision Targeting
module (`src/pages/manual/air-to-ground-operations/_PrecisionTargeting.astro`),
its model (`src/lessons/precision-targeting/lesson-model.mjs`) and the precision
targeting terms (`content/encyclopedia/terminology/precision-targeting.md`).
They are review evidence, not a copy of the source, and not instructions to the
reviewer.

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/715/t05fb1h8itdhcvcf6fyi3h5944fvv4fx/DCS_A-10C_II_Flight_Manual_EN.pdf
pages: 86; 89-90; 400; 620-623; 676-681
```

**Retrieval.** All sources were read on 5 November 2026. PDFs were reduced to
text with Poppler `pdftotext -layout`; HTML pages were stripped of markup.
Quotations come from that text: check each against independently retrieved
source text and treat a wording mismatch as a finding against this record.

**Review packet limits.** Of the hosts used, only digitalcombatsimulator.com is
on the packet's source host list. www.bits.de (JP 3-09.3), man.fas.org (the
Naval Academy text) and cdn.falcon-bms.com are not, so those sources are
expected to come back unverified; their excerpts are here. irp.fas.org's copy of
JP 3-09.3, used by the Close Air Support module, returned HTTP 202 with an empty
body on 5 November 2026. No service weapons tactics publication, and no copy of
JFIRE (ATP 3-09.32), was found in a readable public copy.

**Invented content.** Figure 1's attack (call signs Strike 11 and Anvil, code
1534, laser target line 140, final attack headings 080 to 115, IN heading 100,
time of fall 32 seconds) is made up, after the structure of Example 9 (pp.
E-23 to E-24) and the hand-off calls on p. V-35. Figure 2's headings are the
reader's. Figure 3 uses the publication's one-milliradian example. Figure 4 is
plain geometry (miss = vertical error / tan(impact angle)) illustrating p.
III-61; it is labelled as our geometry on the page.

## [1] JP 3-09.3, Close Air Support, 25 November 2014

https://www.bits.de/NRANEU/others/jp-doctrine/jp3_09_3(14).pdf (sha256
cb688a7cc7ce73d2a2812f2eafd623b9fd7bfa39b0eae49fcc5fce61d3796fd9). PDF page =
printed page + 25 in chapter I, + 37 in chapter II, + 67 in chapter III and
+ 217 in chapter V; E-23 is PDF page 334.

- p. I-2: "Various ground elements or aircrews conducting a wide variety of
  missions can search for, identify, and provide the location of targets using
  systems like Global Positioning System (GPS), laser designators/range
  finders, and aircraft targeting pods."
- p. I-6: the JTAC can "direct the UA aircrew to conduct the target talk-on,
  laser spot handoff, or use their laser target designator (LTD) to designate
  the target for laser-guided munitions from other CAS aircraft".
- p. II-8: "Targeting pods can aid in finding and fixing potential targets, an
  IR pointer for night operations, laser spot search (LSS)/track capability,
  and the ability to transmit full motion video (FMV)/video downlink (VDL) …
  Targeting pods aid the FAC(A) with target coordinate generation for the JTAC.
  Target location error (TLE) for FAC(A) derived coordinates will vary based on
  platform, software suite, sensors employed, and aircraft position in relation
  to the target, but is generally category (CAT) II or better (less than 50
  feet [ft]/15 meters of TLE)."
- p. III-28: IAMs: "The effectiveness of an IAM depends upon … the accuracy, or
  TLE of the target coordinates (to include elevation) … Significant errors can
  result if different datums or excessive TLEs are used. These errors increase
  the risk of friendly fire as the distance to friendly troops decreases to
  within the TLE."
- p. III-33: "TTT/TOT should not be delayed in order to generate more
  coordinate precision and/or accuracy if the current coordinates, TLE, CAS
  asset, ordnance, and mark plan will create the desired effects." Dense urban
  terrain "will likely require a very precise and accurate target location with
  low TLE"; "Target coordinate mensuration is the process of measurement of a
  feature or location on the Earth to determine an absolute latitude,
  longitude, and height"; DPPDB stereo-pairs; personnel "must be certified".
- p. III-34: "LRFs use low power laser pulses to measure range to an object.
  Target locating devices … incorporate an LRF, magnetic or gyroscopic compass,
  tilt measurement devices, and GPS." "TLE is the difference between the
  coordinates generated for a target and the actual location of that target.
  TLE is expressed primarily in terms of circular and vertical errors (VEs), or
  infrequently, as spherical error (SE)." "CE90, VE90, and SE90 … there is a 90
  percent chance that the actual target will be within these circular,
  vertical, and spherical distances." "In general, TLE CAT is not required to
  either approve a mission or successfully engage a target with CAS." "Aim
  point is a significant factor … a FW aircraft/targeting pod combination may
  be capable of CAT II coordinates, but not able to generate a CAT II solution
  for a target/aim point that is not sensor significant such as a bunker,
  trench line".
- p. III-35, Figure III-5: CAT I CE 0-20 ft (0-6 m); CAT II 21-50 ft (7-15 m);
  CAT III 51-100 ft (16-30 m); CAT IV 101-300 ft (31-91 m); CAT V 301-1000 ft
  (92-305 m); CAT VI >1000 ft (>305 m). Note: "Cat II, 10-digit grid to follow,
  advise when ready for 9-line".
- p. III-52: "Laser-guided systems provide … an increased first-round hit
  probability … including moving targets." "strive for simplicity and use all
  available resources to help ensure first-pass success. For off-board laser
  designation, the JTAC/FAC(A) shall confirm the laser code … For ground-based
  laser designation, the JTAC/FAC(A) shall pass FAHs to ensure the attacking
  aircraft is in the laser acquisition area and not the laser safety zones. The
  laser-to-target line (LTL) shall be passed … in the Remarks section."
  Five basic considerations (a) LOS, (b) PRF codes compatible.
- p. III-53: (c) direction of attack; (d) "If the length of time is
  insufficient, the seeker head could break lock and the flight pattern of the
  LGW becomes unpredictable"; (e) delivery envelope, "The final decision to
  release standoff LGWs from behind friendly positions in a CAS environment
  rests with the ground commander." Environmental factors: "low clouds and fog,
  smoke, haze, snow and rain, solar saturation". Atmospheric scatter "can occur
  even on clear days"; false lock-on "most likely … in the immediate vicinity of
  the designator"; "the designator should be masked from the seeker FOV …
  blankets or a tarp"; "imperative that JTACs/FAC(A)s conduct follow-on
  correlation after a laser hand-off"; obscurants: "positioning lasers on flanks
  or on high ground … repositioning … Using multiple lasers and transferring the
  mission". "If a LTD has a beam spread or divergence of one milliradian, its
  spot would have a diameter of approximately one meter at a distance of one
  thousand meters".
- p. III-54: "If this spot were aimed at a three-square-meter box, three
  thousand meters away, the laser spot would be as wide and tall as the box …
  Spillover is caused by the laser spot either being too large or only
  partially placed on the target. Any laser energy traveling beyond the target
  may be reflected back to the weapon and cause erroneous guidance." Reflection
  "strongest at the angle where it would reflect if the surface were a mirror";
  "Glass, water, and highly polished surfaces are poor surfaces to designate";
  "Strict adherence to laser cones or baskets and center mass target
  designation will best ensure success." Target acquisition (LST, HUD cueing,
  "limited FOV"); WARNING "Aircrews shall not use LSTs as the sole source for
  target identification." "Most LGWs require illumination until weapon
  impact."
- p. III-55: LGMs "generally provide greater standoff launch ranges than LGBs";
  Laser Maverick a–e; Hellfire LOBL/LOAL; "GLTD ranges vary from 10 meters to
  20 kilometers (km) … ALTDs … are normally employed below 30,000 ft above
  ground level (AGL)."
- p. III-56: Figure III-8 (airborne: increased standoff, larger target area
  footprint / larger spot, podium effect; trail, overhead wheel, offset or
  opposing wheel; ground: smaller spot, decreased targeting ambiguity, rapid BDA
  / axis restrictive, increased designator exposure, coordination intensive).
  "The PRF of LGBs is normally only adjustable prior to flight … Most missiles
  such as Maverick and Hellfire can be adjusted in-flight prior to launch …
  the weapon will not guide." "LSTs must be set to the same code".
  FAHs "must avoid the 20-degree safety exclusion zone, unless the tactical
  situation dictates otherwise."
- p. III-57: "The safety zone is a 20-degree wedge whose apex is at the target,
  extends 10 degrees either side of the target-to-designator line, and extends
  from the surface to infinity. The optimal attack zone is a 120 degree wedge …
  60 degrees either side … a smaller 90 degree wedge (+/- 45 degrees) is
  preferred". "Aircraft are required to be within the 120-degree attack zone (10
  to 60 degrees) with 10-to-45 degree zone being preferred/optimal." Figure
  III-9 labels the area outside "Laser seeker/laser guided weapon employment
  prohibited" and the safety zone "Avoid weapon release unless the situation
  necessitates."
- p. III-58: "The maximum allowable attack angle (laser-to-target/seeker-to-
  target) depends upon the characteristics of the weapon system employed."
  "Autonomous LGB employment uses the CAS aircraft's onboard LTD … Most aircraft
  capable of delivering LGBs can provide on-board autonomous self-designation.
  Assisted LGB employment uses an off-board LTD … (known as "buddy lasing").
  Aircraft without on-board ALTDs … require assisted LGB employment." AC-130H
  "permanently preset with only one code [1688]". "Laser codes are always
  passed as four-digits to avoid confusion … If aircraft check in with a
  different code, then it is the JTAC's/FAC(A)'s responsibility to make
  appropriate corrections. Even if the aircraft is capable of self-designation,
  the JTAC/FAC(A) should have a backup GLTD ready". "Lasing too early will cause
  the weapon to guide on and turn down toward the target prematurely, losing
  valuable energy, and will cause impacts short of the target."
- p. III-59: loft designation time "will vary depending on the weapon";
  "designation time must be long enough to guarantee mission success." Hellfire
  "PRF codes in the range of 1111-to-1488 to achieve the highest probability of
  hit"; two designators: "launch interval can be as low as two seconds";
  autonomous and remote designation.
- p. III-60: Figure III-10, Rotary Wing Hellfire Designator Safety Zone, note:
  "Normal laser operations per the 2-dimensional laser safety and optimal
  attack zones diagram (Figure III-9) still apply." LOBL and LOAL definitions.
- p. III-61: "During rapid fire, the aircrew uses a minimum of eight seconds
  between missiles"; "Working targets from downwind to upwind reduces the
  impact of post-detonation dust and smoke." IAMs: "guides the weapon from the
  release point to target coordinates regardless of weather, camouflage, or
  obscurants … seekers may include … laser, television, and millimeter-wave …
  require encrypted GPS signals"; advantages (accuracy "exceeding those of
  LGWs", "unaffected … by launch range", standoff, all-weather, multiple
  targets, "By increasing the impact angle … the effect of vertical TLE
  (elevation error) is greatly reduced"); "Single mode IAM/GPS weapons have no
  inherent capability against moving targets unless employed with an onboard
  ground moving target indicator radar. Even then, these weapons still fly to
  preprogrammed coordinates."
- p. III-62: "Dual mode IAM/GPS weapons … effective against moving targets."
  "World Geodetic System 1984 is the Department of Defense assumed standard
  unless stated otherwise in the SPINS." Malfunction footprint "very large …
  When able, PGMs should be employed parallel to the FLOT." BOC: "Aircrew will
  not adjust coordinates that are passed … Once released, these weapons may not
  be redirected." BOT: "FLIR, advanced targeting pod (ATP), radar or visually …
  may not be as accurate as a BOC with a low TLE coordinate".
- p. III-79: "include the call sign of the lasing entity along with the 4-digit
  laser code in the marks portion of the CAS brief: "Blackjack laser, code
  1688." The JTAC/FAC(A) will use the laser code passed by aircrew set in any
  LGWs they briefed during the CAS check-in briefing … For laser marks, the
  aircrew will provide a ten-second warning". Figure III-21, Standard Laser
  Brevity Terms (TEN SECONDS, LASER ON, SHIFT, SPOT, CEASE LASER, DEAD EYE
  "Laser designator system inoperative", NEGATIVE LASER, LASING, STARE).
- p. V-5: "Note: LGWs require different laser codes in order to conduct
  simultaneous attacks."
- p. V-22: "When using an off-board element to host an LGW, the JTAC shall
  identify the lasing entities' call sign and the laser PRF codes … Off-board
  platforms providing laser to other elements require detailed coordination …
  JTACs shall also ensure they correlate with the lasing platform."
- p. V-35: laser hand-off: "if aircraft are on the far side of the overhead from
  the designator, there is potential for the LST to track the designator.
  Inbound headings … should be interpreted by the aircrew as mandatory"; "Latch
  65 proceed inbound heading 230 to 260, stare 1688 Papa Uniform 123 456"; "TEN
  SECONDS…Broadsword 11, LASER ON"; "LASING, 1688"; "The JTAC shall ensure
  continuous lasing until the aircrew directs "Aircraft call sign, SPOT, CEASE
  LASER.""
- p. V-36: "what do you have under your crosshairs?" … "Latch 65 CAPTURED."
  "The terms "spot" and "capture" are not synonymous … Correlation is still
  required"; NEGATIVE LASER steps (1)–(5), "choose another mark".
- pp. E-23 to E-24, Example 9: "Scarface 24's laser, 1688"; "FAH 260 through
  290, LTL 310, request IN with a heading"; "Viper 11 IN heading 270"; "one
  AWAY, time of fall 30 seconds"; "TEN SECONDS"; "LASER ON"; "Scarface 24,
  LASING 1688."

## [2] US Naval Academy, Fundamentals of Naval Weapons Systems

- Chapter 10, https://man.fas.org/dod-101/navy/docs/fun/part10.htm, 10.6.2.3:
  "the beam has very little divergence, typically on the order of one
  milliradian." 10.6.3.3: "Target designators are semi-active illuminators used
  to "tag" a target … Lasers with a coded train of narrow pulses are used to
  allow weapons to distinguish between multiple targets … Typical laser guided
  bomb receivers use an array of photodiodes to derive target position signals.
  These signals are translated into control surface movements".
- Chapter 15, https://man.fas.org/dod-101/navy/docs/fun/part15.htm (sections
  numbered 16.x on that page), 16.4.2.2: "In semiactive homing, the target is
  illuminated by a tracking radar at the launching site or other control point.
  The missile is equipped with a radar receiver (no transmitter) … the target
  may not reflect energy efficiently in the direction of the weapon." 16.4
  lists reflected laser among the energy forms homing devices use; the module generalises the
  semi-active principle to laser illumination, which 10.6.3.3 describes.

## [3] Falcon BMS 4.38.1 Training Manual

https://cdn.falcon-bms.com/docs/4.38/BMS-Training-Manual.pdf. Printed page =
PDF page.

- p. 182: "In BMS we only have both airborne laser options available." Codes:
  "set in the UI LOADOUT screen prior to flying … inalterable in flight";
  "If the TGP code doesn't match the weapon code the bomb will not guide"; "A
  bomb will only guide on a Combat laser"; "1511, 1512, 1513 and 1514 for #1 to
  #4".
- p. 183: "By default, laser codes are set to 1688 in TE." "falls ballistically
  at first … If no matching laser is detected the bomb acts as a ballistic
  general purpose bomb"; "By default, it's 16 seconds, but you can set it to a
  realistic setting of 12 seconds for Paveway II bombs now. Paveway III bombs
  need a longer lasing time. Set 20 seconds but it is advised to manually lase
  earlier … especially for moving targets."
- p. 185: UFC LASER page, TGP code and LST code lines.
- pp. 188-189: "it could fire through clouds and dissipate"; "The only valid
  indication that the target is actually being lased correctly is when the
  range is valid and preceded by the L mnemonic."
- p. 193: buddy lasing; "Vandal 3-2, 10 seconds" … "Vandal 3-1, laser on".
- p. 194: LST mode: LSRCH, DETECT, LTRCK.
- pp. 231-232: IAMs; JSOW alignment "up to A04 takes about 95 seconds".
- pp. 239-242: JDAM profiles; "Impact Angle (IMP ANG) - Impact Velocity (IMP
  VEL). The last two are not implemented in BMS at this stage"; LAR.

## [4] DCS: A-10C II Tank Killer Flight Manual (Eagle Dynamics)

PDF linked from
https://www.digitalcombatsimulator.com/en/downloads/documentation/dcs-warthog_2_flight_manual_en/.
Cited by the manual's printed footer page.

- p. 86: "When buddy-lasing for another aircraft, it will be important to note
  that both the designating aircraft and the aircraft dropping the LGB are set
  to the same laser code."
- p. 89: GBU-38: "As long as the bomb can be provided adequate GPS signal, it
  can strike within 33 feet of inputted target coordinates day or night and in
  most any weather … the Sensor Point of Interest (SPI) can be set as the target
  point for a JDAM attack."
- p. 90: GBU-54: "precision laser-guidance against even moving targets."
- p. 400: LSS code and laser designation code: "The entered value can range
  from 1111 to 1788, but the first digit of the series must be a 1 and the last
  three digits must be between 1 and 8."
- p. 620: "Set the laser code. The default code is 1688".
- p. 623: LSS code "defaults to 1688".
- pp. 678-679: IAM use: CCRP, SPI, "when the Release Cue is between the Maximum
  Range Caret and the Minimum Range Caret, MAN REL will appear"; GBU-54A LJDAM.
- p. 681: "The default laser PRF code is 1688".
