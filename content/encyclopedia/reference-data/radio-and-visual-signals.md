---
short: Radio and visual signals
photo:
  src: "encyclopedia/reference-data/light-gun.jpg"
  alt: "An airman looks through the sight of a tower light gun, its red lens filling the foreground"
  caption: "An Air Force air traffic controller aims a light gun in the control tower at Ali Base, Iraq, 8 March 2006. The gun signals aircraft and vehicles when radio contact is lost."
  author: "Staff Sgt. Bradley C. Church, US Air Force"
  licence: "Public domain"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:An_airman_aims_a_light_gun_as_he_works_in_the_control_tower_at_Ali_Base.jpg"
  accessed: "2026-11-10"
tables:
  - id: phonetic-alphabet
    title: Phonetic alphabet, digits and Morse code
    caption: "The ICAO phonetic alphabet with each letter's pronunciation, and the Morse code a navigation aid sends as its identifier. Listen to the identifier before you trust a navaid's needle."
    source: 1
    pages: "para. 4-2-7"
    columns:
      - { key: char, label: Character }
      - { key: word, label: Telephony }
      - { key: say, label: Pronunciation }
      - { key: morse, label: Morse code, code: true }
    rows:
      - { char: "A", word: Alfa, say: "AL-FAH", morse: "·–" }
      - { char: "B", word: Bravo, say: "BRAH-VOH", morse: "–···" }
      - { char: "C", word: Charlie, say: "CHAR-LEE or SHAR-LEE", morse: "–·–·" }
      - { char: "D", word: Delta, say: "DELL-TAH", morse: "–··" }
      - { char: "E", word: Echo, say: "ECK-OH", morse: "·" }
      - { char: "F", word: Foxtrot, say: "FOKS-TROT", morse: "··–·" }
      - { char: "G", word: Golf, say: "GOLF", morse: "––·" }
      - { char: "H", word: Hotel, say: "HOH-TEL", morse: "····" }
      - { char: "I", word: India, say: "IN-DEE-AH", morse: "··" }
      - { char: "J", word: Juliett, say: "JEW-LEE-ETT", morse: "·–––" }
      - { char: "K", word: Kilo, say: "KEY-LOH", morse: "–·–" }
      - { char: "L", word: Lima, say: "LEE-MAH", morse: "·–··" }
      - { char: "M", word: Mike, say: "MIKE", morse: "––" }
      - { char: "N", word: November, say: "NO-VEM-BER", morse: "–·" }
      - { char: "O", word: Oscar, say: "OSS-CAH", morse: "–––" }
      - { char: "P", word: Papa, say: "PAH-PAH", morse: "·––·" }
      - { char: "Q", word: Quebec, say: "KEH-BECK", morse: "––·–" }
      - { char: "R", word: Romeo, say: "ROW-ME-OH", morse: "·–·" }
      - { char: "S", word: Sierra, say: "SEE-AIR-RAH", morse: "···" }
      - { char: "T", word: Tango, say: "TANG-GO", morse: "–" }
      - { char: "U", word: Uniform, say: "YOU-NEE-FORM or OO-NEE-FORM", morse: "··–" }
      - { char: "V", word: Victor, say: "VIK-TAH", morse: "···–" }
      - { char: "W", word: Whiskey, say: "WISS-KEY", morse: "·––" }
      - { char: "X", word: Xray, say: "ECKS-RAY", morse: "–··–" }
      - { char: "Y", word: Yankee, say: "YANG-KEY", morse: "–·––" }
      - { char: "Z", word: Zulu, say: "ZOO-LOO", morse: "––··" }
      - { char: "1", word: One, say: "WUN", morse: "·––––" }
      - { char: "2", word: Two, say: "TOO", morse: "··–––" }
      - { char: "3", word: Three, say: "TREE", morse: "···––" }
      - { char: "4", word: Four, say: "FOW-ER", morse: "····–" }
      - { char: "5", word: Five, say: "FIFE", morse: "·····" }
      - { char: "6", word: Six, say: "SIX", morse: "–····" }
      - { char: "7", word: Seven, say: "SEV-EN", morse: "––···" }
      - { char: "8", word: Eight, say: "AIT", morse: "–––··" }
      - { char: "9", word: Nine, say: "NIN-ER", morse: "––––·" }
      - { char: "0", word: Zero, say: "ZEE-RO", morse: "–––––" }
  - id: light-gun-signals
    title: Tower light gun signals
    caption: "What the tower's light gun means to a vehicle or person on the airfield, an aircraft on the ground and an aircraft in flight. A light can only approve or refuse what you are expected to do. Acknowledge by day by moving the ailerons or rudder; at night, blink the landing or navigation lights."
    source: 1
    pages: "para. 4-3-13"
    columns:
      - { key: signal, label: Colour and type of signal }
      - { key: vehicles, label: "Vehicles, equipment and personnel" }
      - { key: ground, label: Aircraft on the ground }
      - { key: flight, label: Aircraft in flight }
    rows:
      - { signal: Steady green, vehicles: "Cleared to cross, proceed or go", ground: Cleared for takeoff, flight: Cleared to land }
      - { signal: Flashing green, vehicles: Not applicable, ground: Cleared for taxi, flight: "Return for landing (to be followed by steady green at the proper time)" }
      - { signal: Steady red, vehicles: STOP, ground: STOP, flight: Give way to other aircraft and continue circling }
      - { signal: Flashing red, vehicles: Clear the taxiway/runway, ground: Taxi clear of the runway in use, flight: "Airport unsafe, do not land" }
      - { signal: Flashing white, vehicles: Return to starting point on airport, ground: Return to starting point on airport, flight: Not applicable }
      - { signal: Alternating red and green, vehicles: Exercise extreme caution, ground: Exercise extreme caution, flight: Exercise extreme caution }
  - id: transponder-codes
    title: Transponder codes with a set meaning in US airspace
    caption: "Mode 3/A codes the AIM gives a fixed meaning. Any other code is the one ATC assigns. When changing code, turn the knobs in an order that never passes through 7500, 7600 or 7700: from 2700 to 7200, select 2200 first."
    source: 1
    pages: "paras. 4-1-20, 6-3-2, 6-4-2"
    groupBy: use
    columns:
      - { key: use, label: Use }
      - { key: code, label: Code, code: true }
      - { key: meaning, label: Meaning }
    rows:
      - { use: Emergency and special, code: "7500", meaning: "Hijack. Only this non-discrete code is decoded as the hijack code." }
      - { use: Emergency and special, code: "7600", meaning: "Two-way radio failure." }
      - { use: Emergency and special, code: "7700", meaning: "Emergency. On a military transponder, Mode 3 code 7700 with the emergency feature." }
      - { use: Emergency and special, code: "7777", meaning: "Reserved for military interceptor operations. Civil aircraft never use it." }
      - { use: Military, code: "4000", meaning: "Military aircraft, VFR or IFR, in restricted or warning areas, unless ATC assigns another code." }
      - { use: VFR, code: "1200", meaning: "VFR, at any altitude, unless ATC instructs otherwise." }
      - { use: VFR, code: "1202", meaning: "VFR gliders." }
      - { use: VFR, code: "1203", meaning: "Lead aircraft of a VFR standard formation not receiving ATC services; the others squawk standby." }
      - { use: VFR, code: "1255", meaning: "Firefighting aircraft not in contact with ATC, to, from and within the firefighting area." }
      - { use: VFR, code: "1277", meaning: "VFR aircraft on authorised Air Force or Coast Guard search and rescue missions, when advised." }
  - id: iff-modes
    title: IFF modes
    caption: "What each identification friend or foe (IFF) mode's reply carries. Civil Mode A is the same as military Mode 3. Which modes and codes are in use is set for each operation."
    source: 2
    columns:
      - { key: mode, label: Mode }
      - { key: users, label: Who uses it }
      - { key: reply, label: The reply carries }
    rows:
      - { mode: "1", users: Military, reply: "A two-digit mission code: the aircraft's type or mission" }
      - { mode: "2", users: Military, reply: "A four-digit unit code or tail number" }
      - { mode: "3/A", users: Military and civil, reply: "The four-digit code air traffic control assigns: the squawk" }
      - { mode: "C", users: Civil, reply: "Pressure altitude" }
      - { mode: "4", users: Military, reply: "An encrypted reply to an encrypted challenge" }
      - { mode: "5", users: Military, reply: "An encrypted reply that adds the aircraft's position; it is replacing Mode 4" }
sources:
  - n: 1
    title: "Aeronautical Information Manual (AIM)"
    publisher: Federal Aviation Administration
    url: https://www.faa.gov/air_traffic/publications/atpubs/aim_html/
    accessed: 10 November 2026
    note: "Current edition as published online. Read: chapter 4, section 1, para. 4-1-20 (transponder and ADS-B operation); chapter 4, section 2, para. 4-2-7 (phonetic alphabet and Morse code, TBL 4-2-2); chapter 4, section 3, para. 4-3-13 (traffic control light signals, TBL 4-3-1); chapter 6, para. 6-3-2 (emergency squawk) and para. 6-4-2 (radio failure squawk). US civil rules that military aircraft follow in US airspace."
  - n: 2
    title: "Identification friend or foe"
    publisher: Wikipedia
    url: https://en.wikipedia.org/wiki/Identification_friend_or_foe
    accessed: 9 November 2026
    note: "Used only for what each IFF mode carries, which no military source read here lists. The AIM, para. 4-1-20, gives the Mode A = Mode 3 equivalence."
---

## About these tables

Four tables a pilot of any service looks things up in on the radio and around the airfield. The letters, digits, light signals and transponder codes are the ones in the FAA's Aeronautical Information Manual, which military aircraft follow in US airspace [[1]](#source-1). The phonetic alphabet is the International Civil Aviation Organization (ICAO) alphabet used worldwide, and the Morse code column is how a navigation aid identifies itself [[1]](#source-1).

The IFF modes are military; the controller's radar and a fighter's interrogator both read them [[2]](#source-2). Which codes a mission uses come from the air tasking order and the brief, not from this table.
