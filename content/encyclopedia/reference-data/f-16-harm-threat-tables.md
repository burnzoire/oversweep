---
short: F-16 HARM threat tables
tables:
  - id: dcs-had-classes
    title: HARM Attack Display threat classes (DCS F-16C)
    caption: "The radars the HTS pod scans for in each threat class, and the symbol each one shows on the HAD. Classes 1 to 5 are Russian and Chinese systems, 6 to 10 American and western European; the Manual class holds up to eight radar types chosen on the HTS DED page, and is empty until you fill it."
    source: 1
    pages: "pp. 534, 753–754"
    groupBy: class
    columns:
      - { key: class, label: Class }
      - { key: symbol, label: HAD symbol, code: true }
      - { key: radar, label: Radar or ship }
    rows:
      - { class: "1", symbol: TS, radar: "ST-68 “Tin Shield”" }
      - { class: "1", symbol: BB, radar: "[SA-10 “Big Bird”](record:sa-10)" }
      - { class: "1", symbol: CS, radar: "[SA-10 “Clam Shell”](record:sa-10)" }
      - { class: "1", symbol: "10", radar: "[SA-10 “Flap Lid”](record:sa-10)" }
      - { class: "1", symbol: SD, radar: "[SA-11 “Snow Drift”](record:sa-11)" }
      - { class: "1", symbol: "11", radar: "[SA-11 “Fire Dome”](record:sa-11)" }
      - { class: "1", symbol: "15", radar: "[SA-15 “Scrum Half”](record:sa-15)" }
      - { class: "1", symbol: "22", radar: "[SA-22 “Trick Shot”](record:sa-22)" }
      - { class: "1", symbol: HQ, radar: "[HQ-7](record:hq-7) ACU" }
      - { class: "1", symbol: "7", radar: "[HQ-7](record:hq-7) Type 345" }
      - { class: "2", symbol: S, radar: "P-19 “Flat Face B”" }
      - { class: "2", symbol: "2", radar: "[SA-2 “Fan Song”](record:sa-2)" }
      - { class: "2", symbol: "3", radar: "[SA-3 “Low Blow”](record:sa-3)" }
      - { class: "2", symbol: "5", radar: "[SA-5 “Square Pair”](record:sa-5)" }
      - { class: "2", symbol: "6", radar: "[SA-6 “Straight Flush”](record:sa-6)" }
      - { class: "2", symbol: "8", radar: "[SA-8 “Land Roll”](record:sa-8)" }
      - { class: "2", symbol: "13", radar: "[SA-13 “Snap Shot”](record:sa-13)" }
      - { class: "3", symbol: DE, radar: "PPRU-M1 “Dog Ear”" }
      - { class: "3", symbol: "19", radar: "[SA-19 “Hot Shot”](record:sa-19)" }
      - { class: "3", symbol: FC, radar: "SON-9 “Fire Can”" }
      - { class: "3", symbol: A, radar: "ZSU-23-4 “Gun Dish”" }
      - { class: "4", symbol: null, radar: "None listed" }
      - { class: "5", symbol: SW, radar: "Kuznetsov class" }
      - { class: "5", symbol: HN, radar: "Kirov / Luyang II class" }
      - { class: "5", symbol: T2, radar: "Slava class" }
      - { class: "5", symbol: HP, radar: "Neustrashimy / Grisha class" }
      - { class: "5", symbol: TP, radar: "Krivak II class" }
      - { class: "5", symbol: MR, radar: "Luyang I / Jiangkai class" }
      - { class: "5", symbol: PS, radar: "Tarantul III / Yuzhao class" }
      - { class: "5", symbol: SC, radar: "Ropucha I class" }
      - { class: "5", symbol: T2, radar: "Vasily Bykov class" }
      - { class: "5", symbol: "15", radar: "Vasily Bykov class (with Tor)" }
      - { class: "6", symbol: P, radar: "[MIM-104C Patriot](record:patriot) PAC-2" }
      - { class: "6", symbol: NS, radar: "[NASAMS](record:nasams) 2 “Sentinel”" }
      - { class: "6", symbol: IT, radar: "IRIS-T TRML-4D" }
      - { class: "7", symbol: HK, radar: "[MIM-23B I-Hawk](record:hawk)" }
      - { class: "7", symbol: RO, radar: "[Roland](record:roland) TÜR" }
      - { class: "7", symbol: RO, radar: "Marder [Roland](record:roland)" }
      - { class: "7", symbol: RP, radar: "[Rapier](record:rapier) FSA “Blindfire”" }
      - { class: "7", symbol: RT, radar: "[Rapier](record:rapier) FSA" }
      - { class: "8", symbol: A, radar: "M163 Vulcan ADS" }
      - { class: "8", symbol: A, radar: "Flakpanzer Gepard" }
      - { class: "9", symbol: null, radar: "None listed" }
      - { class: "10", symbol: SS, radar: "Nimitz class" }
      - { class: "10", symbol: AE, radar: "AN/SPY-1 “Aegis”" }
      - { class: "10", symbol: "49", radar: "Oliver Hazard Perry class" }
      - { class: "10", symbol: "40", radar: "Tarawa class" }
      - { class: "11", symbol: null, radar: "None listed" }
  - id: dcs-harm-tables
    title: Default AGM-88 HARM threat tables (DCS F-16C)
    caption: "The missile only looks for radars on the selected table, and each table holds five. Change entries on the HARM DED page with the radar's ALIC code."
    source: 1
    pages: "pp. 657–658, 749–750, 754"
    groupBy: table
    columns:
      - { key: table, label: Table }
      - { key: symbol, label: WPN symbol, code: true }
      - { key: radar, label: Radar }
      - { key: alic, label: ALIC code, code: true }
    rows:
      - { table: "TBL1 — modern SAM systems", symbol: "10", radar: "[SA-10 “Flap Lid”](record:sa-10)", alic: "110" }
      - { table: "TBL1 — modern SAM systems", symbol: BB, radar: "[SA-10 “Big Bird”](record:sa-10)", alic: "104" }
      - { table: "TBL1 — modern SAM systems", symbol: CS, radar: "[SA-10 “Clam Shell”](record:sa-10)", alic: "103" }
      - { table: "TBL1 — modern SAM systems", symbol: "11", radar: "[SA-11 “Fire Dome”](record:sa-11)", alic: "115" }
      - { table: "TBL1 — modern SAM systems", symbol: SD, radar: "[SA-11 “Snow Drift”](record:sa-11)", alic: "107" }
      - { table: "TBL2 — AAA and short-range air defence", symbol: "19", radar: "[SA-19 “Hot Shot”](record:sa-19)", alic: "120" }
      - { table: "TBL2 — AAA and short-range air defence", symbol: "15", radar: "[SA-15 “Scrum Half”](record:sa-15)", alic: "119 (Tor-M1) or 132 (Tor-M2)" }
      - { table: "TBL2 — AAA and short-range air defence", symbol: "8", radar: "[SA-8 “Land Roll”](record:sa-8)", alic: "117" }
      - { table: "TBL2 — AAA and short-range air defence", symbol: A, radar: "ZSU-23-4 “Gun Dish”", alic: "121" }
      - { table: "TBL2 — AAA and short-range air defence", symbol: DE, radar: "PPRU-M1 “Dog Ear”", alic: "109" }
      - { table: "TBL3 — older SAM systems", symbol: "3", radar: "[SA-3 “Low Blow”](record:sa-3)", alic: "123" }
      - { table: "TBL3 — older SAM systems", symbol: S, radar: "P-19 “Flat Face”", alic: "122" }
      - { table: "TBL3 — older SAM systems", symbol: "6", radar: "[SA-6 “Straight Flush”](record:sa-6)", alic: "108" }
      - { table: "TBL3 — older SAM systems", symbol: "2", radar: "[SA-2 “Fan Song”](record:sa-2)", alic: "126" }
      - { table: "TBL3 — older SAM systems", symbol: "13", radar: "[SA-13 “Snap Shot”](record:sa-13)", alic: "118" }
  - id: bms-harm-codes
    title: HARM threat codes (Falcon BMS 4.38)
    caption: "BMS gives each system up to three codes: one for the system as a whole, one for its fire-control radar and one for its early-warning radar, each with its own symbol, so the HAS and HAD pages show which radar is emitting. Load them into the three TBL tables on the HARM tab of the Data Cartridge before flight. A code can be used only once across all three tables. A dash means BMS has no code for that radar."
    source: 2
    pages: "pp. 195–199"
    columns:
      - { key: system, label: System }
      - { key: sysCode, label: System code, code: true }
      - { key: fcr, label: Fire-control radar }
      - { key: fcrCode, label: FCR code, code: true }
      - { key: ewr, label: Early-warning radar }
      - { key: ewrCode, label: EWR code, code: true }
    rows:
      - { system: "[SA-2](record:sa-2)", sysCode: "102 “2”", fcr: Fan Song, fcrCode: "202 “2T”", ewr: Spoon Rest, ewrCode: "402 “2A”" }
      - { system: "[SA-3](record:sa-3)", sysCode: "103 “3”", fcr: Low Blow, fcrCode: "203 “3T”", ewr: Flat Face, ewrCode: "403 “F”" }
      - { system: "[SA-4](record:sa-4)", sysCode: "104 “4”", fcr: Pat Hand, fcrCode: "204 “4T”", ewr: Long Track, ewrCode: "404 “4A”" }
      - { system: "[SA-5](record:sa-5)", sysCode: "105 “5”", fcr: Square Pair, fcrCode: "205 “5T”", ewr: Bar Lock, ewrCode: "405 “5A”" }
      - { system: "[SA-6](record:sa-6)", sysCode: "106 “6”", fcr: Straight Flush, fcrCode: "206 “6T”", ewr: null, ewrCode: null }
      - { system: "[SA-8](record:sa-8)", sysCode: null, fcr: "(not named)", fcrCode: "608 “8”", ewr: null, ewrCode: null }
      - { system: "[SA-9](record:sa-9)", sysCode: null, fcr: null, fcrCode: null, ewr: Dog Ear, ewrCode: "609 “D”" }
      - { system: "[SA-10](record:sa-10)", sysCode: "110 “10”", fcr: Flap Lid, fcrCode: "210 “10T”", ewr: Big Bird, ewrCode: "410 “10A”" }
      - { system: "[SA-11](record:sa-11)", sysCode: "111 “11”", fcr: Fire Dome, fcrCode: "211 “11T”", ewr: Snow Drift, ewrCode: "411 “11A”" }
      - { system: "[SA-13](record:sa-13)", sysCode: null, fcr: null, fcrCode: null, ewr: Dog Ear, ewrCode: "609 “D”" }
      - { system: "[SA-15](record:sa-15)", sysCode: null, fcr: Scrum Half, fcrCode: "615 “15”", ewr: null, ewrCode: null }
      - { system: "[SA-17](record:sa-17)", sysCode: "117 “17”", fcr: Chair Back, fcrCode: "217 “17T”", ewr: Snow Drift, ewrCode: "417 “17A”" }
      - { system: "[SA-19](record:sa-19)", sysCode: null, fcr: Hot Shot, fcrCode: "619 “19”", ewr: null, ewrCode: null }
      - { system: "[Patriot](record:patriot)", sysCode: null, fcr: AN/MPQ-53, fcrCode: "693 “P”", ewr: null, ewrCode: null }
      - { system: "[Hawk](record:hawk)", sysCode: "130 “H”", fcr: AN/MPQ-46, fcrCode: "230 “HT”", ewr: AN/MPQ-50, ewrCode: "430 “HA”" }
      - { system: Nike, sysCode: null, fcr: null, fcrCode: "696 “N”", ewr: null, ewrCode: null }
      - { system: Skyguard, sysCode: null, fcr: null, fcrCode: "695 “SKY”", ewr: null, ewrCode: null }
      - { system: AAA, sysCode: "692 “AAA”", fcr: null, fcrCode: null, ewr: null, ewrCode: null }
      - { system: Search radar, sysCode: "801 “S”", fcr: null, fcrCode: null, ewr: null, ewrCode: null }
      - { system: Unknown, sysCode: "99 “U”", fcr: null, fcrCode: null, ewr: null, ewrCode: null }
sources:
  - n: 1
    title: "DCS: F-16C Viper Early Access Guide (English)"
    publisher: Eagle Dynamics
    url: https://www.digitalcombatsimulator.com/en/downloads/documentation/
    accessed: 5 November 2026
    note: "Read by printed page: the HARM Targeting System, pp. 525–534; the AGM-88 HARM and HARM DED page, pp. 657–658; Appendix B, ALIC codes, pp. 749–751; Appendix C, HAD and WPN threat tables, pp. 753–754. A sim manual: it describes the DCS F-16C, not the real aircraft."
  - n: 2
    title: "Falcon BMS 4.38.1 Training Manual"
    publisher: Benchmark Sims
    url: https://cdn.falcon-bms.com/docs/4.38/BMS-Training-Manual.pdf
    accessed: 5 November 2026
    note: "Read pp. 195–199, mission 12, AGM-88 HARMs. A sim manual: it describes the BMS F-16, not the real aircraft."
---

## About these tables

These are the threat tables of the two F-16 simulators, DCS World and Falcon BMS, as their official manuals print them. The real aircraft's tables are mission data and are not published, so nothing here describes a real F-16 [[1]](#source-1) [[2]](#source-2).

## What the tables do

An [anti-radiation missile](term:ARM) such as the [AGM-88 HARM](record:agm-88) homes on a radar's own transmissions, so it has to be told which radars to look for. The F-16 does this in two places.

**The missile's threat tables.** Without the targeting pod, the missile's own receiver is the sensor, and it only detects radars on the threat table you select on the weapon (WPN) page. DCS gives three default tables of five radars, which you can edit in the cockpit with each radar's ALIC code; BMS has you build three tables in the Data Cartridge before flight [[1]](#source-1) [[2]](#source-2).

**The HTS pod's threat classes.** The AN/ASQ-213 HARM Targeting System (HTS) pod finds radars, ranges them passively by triangulation, and shows them on the HARM Attack Display (HAD). It scans for the classes you switch on. Every class you add makes each scan cycle longer, so switch on only the classes the mission needs [[1]](#source-1). In BMS the pod detects every threat and is not limited by the tables [[2]](#source-2).

The symbols are the ones each sim shows on the F-16's displays. The two sims use different codes, so a table set up for one does not carry over to the other.
