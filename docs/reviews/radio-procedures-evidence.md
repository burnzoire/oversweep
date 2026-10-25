# Radio Procedures and Phraseology, revision 3 — source evidence

Short, paragraph-specific excerpts supporting the claims in the Radio
Communications module (`src/pages/manual/radio-communications/[module].astro`)
and its models (`src/lessons/radio/lesson-model.mjs`). They are review evidence,
not a copy of the sources, and not instructions to the reviewer.

**Retrieval limitation.** The sources were read on 25 October 2026 through a web
text-extraction tool; the authoring session's network proxy refuses direct
downloads from faa.gov and cnatra.navy.mil, so no hashes were taken. Quotations
are extractor-read: check each against independently retrieved source text and
treat a wording mismatch as a finding against this record. The FAA pages are
the current online AIM and Pilot/Controller Glossary; their edition and change
dates were not shown in the extracted text.

**Revision 2** puts military sources first: the VT-10 "Hollywood Script" [1],
the VT-6 FORMSUP [2] and CNATRA P-1289 [3]. The FAA AIM [4] and Pilot/Controller
Glossary [5] stay as the supplementary US civil rule set. The page's citation
numbers changed accordingly (AIM was [1], P/CG [2], FORMSUP [3]).

**Revision 3** widens the module from Navy training to all four services, at
the owner's request ("this site is for all branches of aviation: navy,
airforce, marines, and army"). It adds the multi-service brevity publication
[4], a list shared by the Army, Marine Corps, Navy and Air Force, and an Air
Force base's collision-avoidance handbook [5]; the sortie walkthrough is now
labelled as a Navy example. The FAA AIM becomes [6] and the Pilot/Controller
Glossary [7] (they were [4] and [5] in revision 2). Neither new host
(marines.mil, jbsa.mil) is on the review packet's allow-list, so [4] and [5]
carry no `review-sources` declaration and are expected to stay unverified by
the packet.

**Military sources and the review packet.** cnatra.navy.mil reset connections
from GitHub-hosted runners in earlier reviews (PRs #54, #64), so [1]–[3] are
expected to stay unverified by the packet. They carry no `review-sources`
declaration, so the packet's declared-first ordering does not spend fetch
slots on them ahead of the faa.gov pages; the FORMSUP declaration of revision 1
was removed for the same reason.

**Fetch limits.** The review packet fetches at most eight URLs and 40,000
characters of each HTML page. The module lists its AIM sections first, then
the VT-6 supplement, then the Glossary letter pages, so the later Glossary
pages may not be fetched. AIM chapter 4, sections 1 and 3 are long pages:
paras 4-1-13, 4-1-20 and 4-3-13 may lie beyond the 40,000-character window.

## [1] VT-10 "Hollywood Script" (T-6A Checklist Study Guide, May 2022)

https://www.cnatra.navy.mil/tw6/vt10/assets/docs/training/hollywood-script.pdf.
Enclosure (1) to TRARONTENNOTE 3710, "MAY 22". No distribution statement
appeared in the extracted text; the file is published on the CNATRA public
site. Pages are the enclosure's page headers as read by the extractor.

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 1 | "TRARONTENNOTE 3710", "MAY 22", "Enclosure (1)", "T-6A CHECKLIST STUDY GUIDE", "“Hollywood Script”" | Source record |
| 19 | "Begin by listening to the ATIS for Sherman Field on UHF Channel 1."; "Switch to UHF Ch. 2 and contact Sherman Clearance Delivery" | Sortie; Figure 4 |
| 20 | "Sherman Clearance, KATT 11, IFR, NPA 630, on request, ready to copy."; "KATT 11, readback correct."; "switch to Ch. 19"; "KATT Base, KATT 11 taxi outbound, side number 000." / "KATT 11, side number 000, base has you outbound."; "USE A DIFFERENT CALL SIGN FOR EVERY PRACTICE AND SCHEDULE SIM EVENT" | Call signs; sortie; Figures 4, 5 |
| 21 | "Switch the UHF to Ch 3"; "Sherman Ground, KATT 11, taxi, information (ATIS letter)."; "KATT 11, Runway 7 right, taxi via Foxtrot – Delta – Alpha, cross Runway 19." | Making contact; sortie; Figures 4, 5 |
| 25 | "Now switch to UHF Ch. 19"; "KATT Base, KATT 11 going flying." / "KATT 11, roger."; "Sherman Tower on UHF Ch. 4"; "Sherman Tower, KATT 11, takeoff IFR."; "KATT 11, Wind 060 at 8, Runway 7 right, cleared for takeoff, switch to Departure."; "KATT 11, cleared for takeoff Runway 7 right, switching."; "Pensacola Departure on UHF Ch. 6" | Bands; sortie; Figures 4, 6 |
| 27 | "KATT 11, passing [altitude] for 3000." / "KATT 11, radar contact, climb and maintain 10,000." / "KATT 11, continuing to 10,000'." | Sortie; Figures 4, 6 |
| 28 | "KATT 11, fly heading 310, climb and maintain 11,000, Gator 3 Bravo, frequency change approved." / "KATT 11, continuing to 11,000, Gator 3 Bravo, switching." | Sortie; Figure 4 |
| 29 | "Switch to UHF Ch. 16 (MOA Common)."; "This is a MOA safety of flight frequency used by Pensacola Departure, so you do not need to check in." | Sortie; Figure 4 |
| 30 | "Pensacola Approach on 120.05 (VHF Ch. 5)"; "Pensacola Approach, KATT 11, complete in the MOA, cancel IFR." / "KATT 11, cancellation received, squawk VFR, frequency change approved." / "KATT 11, switching."; "switch the UHF to Ch. 15 (Wahoo Common)." | Bands; sortie; Figure 4 |
| 31 | "contact Pensacola Approach on UHF Ch. 6"; "Ch. 1 (UHF or VHF)"; ATIS "Information Bravo ... VFR landing Runway 7 right"; "Pensacola Approach, KATT 11, 3500, information Bravo, request course rules." / "KATT 11, squawk 0134." | Sortie; Figure 4 |
| 32 | "Pensacola Approach, KATT 11, Point Golf in sight." / "KATT 11, contact Sherman Tower Button 4."; "Switch to UHF Ch. 4"; "Sherman Tower, KATT 11, Point Golf for the break." / "KATT 11, report the numbers Runway 7 right." / "KATT 11, 7 right, wilco."; "Sherman Tower, KATT 11, numbers 7 right." / "KATT 11, right break approved." | Bands (preset channels); sortie; Figure 4 |
| 33–34 | "Sherman Tower, KATT 11, [abeam, 180, 90, final], gear, stop." / "KATT 11, wind 080 at 8, Runway 7 Right, cleared to land." / "KATT 11, cleared to land 7 Right." The script does not define "gear" or "stop"; the module says so and gives the contextual reading (gear down, full-stop landing). | Sortie; Figure 4 |
| 34 | "KATT 11, turn right next taxiway, contact ground when clear." / "KATT 11, wilco."; "switch to UHF Ch. 3 and contact Sherman Ground"; "Sherman Ground, KATT 11, clear of the active, taxi to my line." / "KATT 11, taxi to your line via Alpha, Alpha 4." / "KATT 11, taxi via Alpha, Alpha 4." | Readback order; sortie; Figure 4 |
| 35 | "contact KATT Base on UHF Ch. 19"; "KATT Base, KATT 11 in and up." / "KATT 11, welcome back." | Sortie; Figure 4 |

Modelling choice: the base-frequency call on p. 20 names no band ("Ch. 19");
pp. 25 and 35 say UHF Ch. 19, so the figure shows UHF 19 throughout.

## [3] CNATRA P-1289, BFM/SEM Flight Training Instruction, T-45

https://www.cnatra.navy.mil/local/docs/pat-pubs/P-1289.pdf (the same
publication as the BFM module, `docs/reviews/bfm-p1289-evidence.md`).

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 2-4 | "Knock-it-Off" called by the IP (dual) or bandit (solo) at the end of each set; both aircraft acknowledge | Training-rule calls |
| 3-1 | "The following Training Rules apply to all BFM and SEM training. They shall be strictly observed." | Training-rule calls |
| 3-2 | "500 feet separation between all aircraft at all times." | Training-rule calls |
| 3-3 | "'Knock-it-Off' is called by anyone, all players echo, or an aircraft is rocking its wings."; "If lost sight, transmit '(call sign) blind' and turn away from predicted collision bearing."; "'Blind' means you cannot see your wingman anywhere." "'No joy' means you can't see a threat aircraft described by your wingman."; knock-it-off conditions include bingo fuel | Training-rule calls; quiz |
| 3-4 | Pass calls "'high,' 'low,' 'right-to-right,' and 'left-to-left.'" | Training-rule calls |
| 5-11 | "'Terminate' is a call used to temporarily cease SSD training for administrative purposes."; lead restarts with "[Callsign] 11, in target/shooter" | Training-rule calls |
| 5-14 | Lead calls "3, 2, 1, fight's on," and wing echoes it | Training-rule calls |

## [6] FAA Aeronautical Information Manual

| Para | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 4-2-1 | Pilots "acknowledge each radio communication with ATC by using the appropriate aircraft call sign"; "Brevity is important, and contacts should be kept as brief as possible" | Overview |
| 4-2-2 | "Listen before you transmit"; transmitting over someone else's exchange jams receivers and forces repeats; pause and listen after changing frequency; "Think before keying your transmitter"; long messages written down first; hold the microphone close; "a slight pause may be necessary to be sure the first word is transmitted"; "Speak in a normal, conversational tone"; "wait a few seconds before calling again"; "sounds or the lack of sounds in your receiver"; "make sure that your microphone is not stuck"; "within the performance range of your radio equipment and the ground station equipment"; higher altitude extends VHF line of sight | Radio technique; Figure 1 |
| 4-2-3 | Initial contact: "Name of the facility being called"; "Your full aircraft identification as filed in the flight plan"; "When operating on an airport surface, state your position"; "The type of message to follow or your request if it is short"; "The word 'Over' if required". Examples "New York Radio, Mooney Three One One Echo" and "Columbia Ground, Cessna Three One Six Zero Foxtrot, south ramp, I-F-R Memphis". "You should acknowledge all callups or clearances unless the controller or FSS specialist advises otherwise"; acknowledge frequency changes, e.g. "United Two Twenty-Two on one three four point five"; "select the new frequency as soon as possible unless instructed to make the change at a specific time, fix, or altitude" | Making contact; Figure 4 |
| 4-2-4 | "Call signs should never be abbreviated on an initial contact" or with similar call signs on frequency; "ATC specialists may initiate abbreviated call signs"; "The pilot may use the abbreviated call sign in subsequent contacts"; ATC will not abbreviate air carrier or other authorized call signs; civil: type, model or manufacturer then registration, "N" dropped, e.g. "Aztec Two Four Six Four Alpha"; abbreviation is "the prefix and the last three digits/letters"; air carriers use group form with "Heavy" or "Super"; military call sign systems vary; student pilots may identify themselves | Call signs; Figure 3 |
| 4-2-6 | Tower, Ground, Clearance Delivery, Approach, Departure, "Radio" (FSS), "Center" (ARTCC), UNICOM | Ground station table |
| 4-2-7 | TBL 4-2-7 phonetic alphabet: telephony, pronunciation and Morse for A–Z and 0–9 (e.g. Alfa AL-FAH, Juliett JEW-LEE-ETT, Three TREE, Five FIFE, Nine NIN-ER, Zero ZEE-RO) | Alphabet table; Figure 3 |
| 4-2-8 | "500 five hundred"; "4,500 four thousand five hundred"; "10,000 one zero thousand"; "13,500 one three thousand five hundred"; other numbers digit by digit; "122.1 one two two point one"; ICAO "decimal" accepted | Numbers; Figure 3 |
| 4-2-9 | "12,000 one two thousand"; "12,500 one two thousand five hundred"; at and above 18,000 ft MSL (FL 180) "Flight Level One Niner Zero", "Flight Level Two Seven Five" | Numbers; Figure 3 |
| 4-2-10 | Three digits, magnetic; "heading one zero zero"; "wind two two zero"; "zero five zero true" | Numbers; Figure 3 |
| 4-2-11 | "two five zero knots"; "one niner zero knots"; "Mach one point five" | Numbers; Figure 3 |
| 4-2-12 | UTC, 24-hour clock; "0920 UTC zero niner two zero"; "Zulu" may denote UTC | Numbers; Figure 3 |
| 4-2-13 | Receiver inoperative: remain outside or above the Class D surface area "until the direction and flow of traffic has been determined"; advise tower of "your type aircraft, position, altitude, intention to land" and request light signals; 3 to 5 miles out, advise position and "join the airport traffic pattern"; watch for light signals. Transmitter inoperative: acknowledge "by rocking your wings" in daylight, "blinking the landing or navigation lights" at night | When the radio fails |
| 4-2-14 | "122.2 MHz is assigned to the majority of FSSs as a common en route simplex frequency" | Bands; Figure 2 |
| 4-1-13 | "Advise on initial contact you have information sierra" | Making contact |
| 4-1-20 | Code 1200 for VFR unless ATC assigns otherwise; "Only nondiscrete Code 7500 will be decoded as the hijack code"; 7600 and 7700 trigger special indicators in automated facilities; avoid passing through 7500/7600/7700 on routine changes: from 2700 to 7200, select 2200 first | Transponder codes; Figure 7 |
| 4-3-13 | TBL 4-3-13 light gun signals: steady green, flashing green, steady red, flashing red, flashing white, alternating red and green, for aircraft on the ground and in flight | Light gun table; Figure 8 |
| 4-4-7 | "make a written record of your clearance" (IFR); "read back those parts of ATC clearances and instructions containing altitude assignments, vectors, or runway assignments"; "Include the aircraft identification in all readbacks and acknowledgments"; same sequence; charted procedures not read back unless stated; runway in initial readback of taxi, departure or landing clearance; examples "Climbing to Flight Level three three zero, United Twelve", "November Five Charlie Tango, roger, cleared to land runway nine left" | Readback; Figure 5 |
| 6-3-1 | "Distress communications have absolute priority over all other communications"; MAYDAY "preferably repeated three times"; PAN-PAN "in the same manner for an urgency condition"; frequency in use preferable; "121.5 MHz and 243.0 MHz", line of sight; 121.5 guarded by direction-finding stations; 243.0 by military aircraft | Bands; Distress and urgency |
| 6-3-2 | Message items 1–11 "preferably in the order listed"; keep assigned code while in contact; if unable to contact immediately "squawk Mode A/3, Code 7700/Emergency and Mode C"; "Do not change frequency or change to another ground station unless absolutely necessary" | Distress and urgency |
| 6-4-1 | VFR conditions: "continue the flight under VFR and land as soon as practicable"; IFR route: assigned; vectored direct from the point of failure; expected; filed. Altitude: "the HIGHEST of the following altitudes or flight levels FOR THE ROUTE SEGMENT BEING FLOWN": assigned, minimum IFR altitude, expected. Leaving the clearance limit at or near the expect-further-clearance time or ETA | When the radio fails; Figure 9 |
| 6-4-2 | Squawk 7600; "the aircraft may not be in an area of radar coverage" | When the radio fails |

## [7] FAA Pilot/Controller Glossary

Roger: "I have received all of your last transmission. It should not be used to
answer a question requiring a yes or a no answer." Wilco: "I have received your
message, understand it, and will comply with it." Affirmative: "Yes." Negative:
"No," or "permission not granted," or "that is not correct." Unable, Say again,
I say again, Stand by, Read back, Verify, Acknowledge, Advise intentions,
Immediately, Negative contact, Words twice, Speak slower, Over and Out as quoted
in the module's term list. VHF: "The frequency band between 30 and 300MHz."
UHF: "The frequency band between 300 and 3,000MHz", the band used for military
air/ground voice, in some instances as low as 225 MHz (the last part
paraphrased by the extractor).

## [2] VT-6 Formation Supplement (June 2022)

https://www.cnatra.navy.mil/tw5/vt6/assets/docs/university/formsup.pdf. No
distribution statement appeared in the extracted text; the file is published on
the CNATRA public site. Pages are the supplement's printed numbers (expected to
match the physical pages).

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 2 | "Lead will conduct an initial radio check-in with Wing on the briefed tactical frequency on the ground"; "neither aircraft shall switch off that frequency at any time or for any reason"; radio changes: "(1) pre-briefed Auto-Switches, (2) ATC directed radio changes, and (3) Lead directed radio changes"; switches and check-ins "should never be conducted over ATC/Area Common/CTAF/etc."; plain and concise language on the tactical frequency to "get well"; flight tactical call sign (e.g. ANGRY) | Flight check-ins |
| 3 | Lead: "Angry, Check Victor." Wing: "(Angry 1-2), with (ATIS Code)" or "2, standby (X) mikes" | Flight check-ins; Figure 6 |
| 6 | NORDO wingman signals "can't talk" or "can't hear" by "patting the oxygen mask or the ear of the helmet followed by a "thumbs down" hand signal" | Flight check-ins |
| 10 | Lead (on VHF TAC): "Angry, push UHF TAC"; Lead (on UHF TAC): "Angry"; Wing: "Angry 1-2"; then "Angry, push VHF (122.8/123.0)" with "no check-in on VHF as it is the new working frequency" | Flight check-ins; Figure 6 |

## [4] Multi-Service Brevity Codes (25 April 2025)

ATP 1-02.1 / MCRP 3-30B.1 / NTTP 6-02.1 / AFTTP 3-2.5, *Brevity: Multi-Service
Tactics, Techniques, and Procedures for Multi-Service Brevity Codes*, 25 April
2025: https://www.marines.mil/Portals/1/Publications/MCRP%203-30B.1%20(SECURED).pdf.
Distribution statement A (approved for public release). Pages are the
publication's printed numbers as the extractor reported them; the module's
`BREVITY` list (`src/lessons/radio/lesson-model.mjs`) paraphrases each
definition.

| Page | Word | Definition (extractor-read, abridged) |
| --- | --- | --- |
| i | (front matter) | A multi-service publication of the Army, Marine Corps, Navy and Air Force |
| 2 | Abort | Cease action or attack; terminate the event or mission |
| 4 | Bandit | Positively identified as an enemy in accordance with theater identification criteria |
| 5 | Bingo | Prebriefed fuel state needed for recovery |
| 5 | Blind | No visual contact with a friendly aircraft, ship or ground position; opposite of visual |
| 6 | Bogey | A contact whose identity is unknown |
| 7 | Buster | Fly at maximum continuous speed |
| 18 | Fence in / fence out | Set cockpit switches as appropriate before entering or exiting the combat area |
| 25 | Joker | Fuel state above bingo at which separation, bugout or event termination should begin |
| 26 | Knock-it-off | Cease all air combat maneuvers, attacks or activities; training use |
| 31 | No joy | No visual contact with the target or bandit; opposite of tally |
| 32 | Padlocked | Cannot take eyes off an aircraft or surface position without risk of losing tally or visual |
| 33 | Pigeons | Magnetic bearing and range to home plate |
| 34 | Popeye | Flying in clouds or an area of reduced visibility |
| 35 | Push | Switch to the designated frequency; no acknowledgment required |

## [5] JBSA Midair Collision Avoidance (MACA) Handbook

https://www.jbsa.mil/Portals/102/Documents/Safety/JBSA-MACA_Pamphlet_2024.pdf,
an Air Force base's guide for civil pilots flying near its training traffic.

| Page | Passage (paraphrased) | Module use |
| --- | --- | --- |
| 2 | Military aircraft commonly talk to ATC on UHF, which civil VHF radios cannot receive, so a civil pilot may hear only the controller's side | Overview; bands |
