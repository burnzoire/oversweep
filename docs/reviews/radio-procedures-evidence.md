# Radio Procedures and Phraseology, revision 1 — source evidence

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

**Fetch limits.** The review packet fetches at most eight URLs and 40,000
characters of each HTML page. The module lists its AIM sections first, then
the VT-6 supplement, then the Glossary letter pages, so the later Glossary
pages may not be fetched. AIM chapter 4, sections 1 and 3 are long pages:
paras 4-1-13, 4-1-20 and 4-3-13 may lie beyond the 40,000-character window.

## [1] FAA Aeronautical Information Manual

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

## [2] FAA Pilot/Controller Glossary

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

## [3] VT-6 Formation Supplement (June 2022)

https://www.cnatra.navy.mil/tw5/vt6/assets/docs/university/formsup.pdf. No
distribution statement appeared in the extracted text; the file is published on
the CNATRA public site. Pages are the supplement's printed numbers (expected to
match the physical pages).

```review-sources
source: https://www.cnatra.navy.mil/tw5/vt6/assets/docs/university/formsup.pdf
pages: 1-11
```

| Page | Passage (extractor-read) | Module use |
| --- | --- | --- |
| 2 | "Lead will conduct an initial radio check-in with Wing on the briefed tactical frequency on the ground"; "neither aircraft shall switch off that frequency at any time or for any reason"; radio changes: "(1) pre-briefed Auto-Switches, (2) ATC directed radio changes, and (3) Lead directed radio changes"; switches and check-ins "should never be conducted over ATC/Area Common/CTAF/etc."; plain and concise language on the tactical frequency to "get well"; flight tactical call sign (e.g. ANGRY) | Flight check-ins |
| 3 | Lead: "Angry, Check Victor." Wing: "(Angry 1-2), with (ATIS Code)" or "2, standby (X) mikes" | Flight check-ins; Figure 6 |
| 6 | NORDO wingman signals "can't talk" or "can't hear" by "patting the oxygen mask or the ear of the helmet followed by a "thumbs down" hand signal" | Flight check-ins |
| 10 | Lead (on VHF TAC): "Angry, push UHF TAC"; Lead (on UHF TAC): "Angry"; Wing: "Angry 1-2"; then "Angry, push VHF (122.8/123.0)" with "no check-in on VHF as it is the new working frequency" | Flight check-ins; Figure 6 |
