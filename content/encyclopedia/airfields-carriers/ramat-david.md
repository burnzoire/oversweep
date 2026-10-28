---
kind: airfield
short: Ramat David
name: Ramat David Airbase
status: active
names:
  - { name: "RAF Ramat David", former: true, from: "1942", to: "1948", cite: "[1]" }
identifiers: { icao: LLRD }
country: israel
location: "20 km south-east of Haifa in the Jezreel Valley, Northern District of Israel, beside kibbutz Ramat David [1]"
coordinates: { lat: 32.6651, lon: 35.1795, cite: "[2]" }
elevationFt: 185
elevationCite: "[1] [2]"
opened: { year: 1942, text: "as RAF Ramat David, a Royal Air Force airfield under the British Mandate, after a rolled-earth emergency strip had been used there in 1941 [1]" }
roles: [fighter, reconnaissance]
operators:
  - { name: "Royal Air Force", nation: uk, branch: air-force, from: "1942", to: "1948", cite: "[1]" }
  - { name: "Israeli Air Force", nation: israel, branch: air-force, from: "1948", asOf: "2026-10", cite: "[1]" }
units:
  - { name: "101 Squadron \"First Fighter\"", nation: israel, branch: air-force, basing: permanent, aircraft: ["F-16C Barak"], from: "2021", asOf: "2026-10", cite: "[1]" }
  - { name: "105 Squadron \"Scorpion\"", nation: israel, branch: air-force, basing: permanent, aircraft: ["F-16D Barak"], from: "2021", asOf: "2026-10", cite: "[1]" }
  - { name: "109 Squadron \"The Valley\"", nation: israel, branch: air-force, basing: permanent, aircraft: ["Mystère IVA", "A-4 Skyhawk", "Kfir C.7", "F-16D Barak"], from: "1956", asOf: "2026-10", cite: "[1]" }
  - { name: "157 Squadron \"In The Valley\", electronic warfare", nation: israel, branch: air-force, basing: permanent, aircraft: ["classified UAVs"], asOf: "2026-10", cite: "[1]" }
  - { name: "160 Squadron \"Shadow Hunter\", reopened 2018", nation: israel, branch: air-force, basing: permanent, aircraft: ["classified UAVs"], from: "2018", asOf: "2026-10", cite: "[1]" }
  - { name: "117 Squadron \"First Jet\", the air force's first jet squadron", nation: israel, branch: air-force, basing: permanent, aircraft: ["Meteor F.8", "Mirage IIICJ", "F-16A/B Netz", "F-16C/D Barak"], from: "1953-06", to: "2020-10", cite: "[1]" }
  - { name: "110 Squadron \"Knights Of The North\"", nation: israel, branch: air-force, basing: permanent, aircraft: ["Vautour II", "Meteor F.8", "A-4 Skyhawk", "F-16A/B Netz", "F-16C/D Barak"], from: "1957", to: "2017", cite: "[1]" }
  - { name: "193 Squadron \"Defenders Of The West\", maritime helicopters for the navy's corvettes", nation: israel, branch: air-force, basing: permanent, aircraft: ["AS565 Panther (Atalef)"], from: "1996", to: "2025-08-31", cite: "[1]" }
facilities:
  runways:
    - { id: "09/27", lengthFt: 8550, widthFt: 145, surface: "asphalt", note: "2,606 m", cite: "[1] [2]" }
    - { id: "11/29", lengthFt: 7975, widthFt: 115, surface: "asphalt", note: "2,431 m", cite: "[1] [2]" }
    - { id: "15/33", lengthFt: 7895, widthFt: 150, surface: "asphalt", note: "2,406 m", cite: "[1] [2]" }
  other:
    - "Underground hangars and shelters, with several entrances and exits, into which the fighters taxi after landing [1]"
    - "A heliport [1]"
theatres: [middle-east]
maps:
  - map: dcs-syria
    status: represented
    inSimName: "Ramat David"
    checked: "2026-10-28"
    cite: "[3]"
    facts:
      - "Runways 09/27 (7,443 ft), 11/29 (7,533 ft) and 15/33 (7,613 ft) [3]"
      - "Tower 118.6 MHz VHF and 251.3 MHz UHF [3]"
      - "VORTAC RMD, channel 84X and 113.7 MHz, an NDB (RMD) and an ILS on runway 33, 111.1 MHz [3]"
    differences:
      - { topic: "Runway lengths", text: "The game's three runways are 7,443 to 7,613 ft long [3]; the real ones are 7,895 to 8,550 ft. [2]" }
  - map: dcs-sinai
    status: represented
    inSimName: "Ramat David"
    checked: "2026-10-28"
    cite: "[4]"
    facts:
      - "Runways 09/27 (6,877 ft), 11/29 (7,318 ft) and 15/33 (7,385 ft) [4]"
      - "Tower 118.0 MHz VHF and 251.1 MHz UHF [4]"
      - "VORTAC RMD, channel 84X and 113.7 MHz [4]"
    differences:
      - { topic: "Runway lengths", text: "The Sinai map's runways are shorter again than on the Syria map, 6,877 to 7,385 ft [4]; the real ones are 7,895 to 8,550 ft. [2]" }
  - map: bms-israel
    status: represented
    inSimName: "Ramat David"
    checked: "2026-10-28"
    cite: "[5]"
    facts:
      - "Its hardened aircraft shelters were given improved models in the theatre's version 1.08.1 [5]"
photos: []
sources:
  - n: 1
    title: "Ramat David Airbase"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Ramat_David_Airbase"
    accessed: "2026-10-28"
    note: "History, the RAF units, the squadrons since 1948 and the 2026 airport decision."
  - n: 2
    title: "Airport and runway data, LLRD"
    publisher: "OurAirports open data (public domain, community-maintained)"
    url: "https://davidmegginson.github.io/ourairports-data/airports.csv"
    accessed: "2026-10-28"
    note: "Rows for LLRD in airports.csv and runways.csv: position, elevation and the three runways."
  - n: 3
    title: "dcs-world-schema reference data: Syria airbases (Ramat David.json)"
    publisher: "dcs-world-schema, open-source data extracted by running DCS World 2.9.30.28536"
    url: "https://github.com/YoloWingPixie/dcs-world-schema/blob/c3091e6c08fb8167e26145d0e33c10e4140c6fe7/dcs-world-reference/latest/airbases/Syria/Ramat%20David.json"
    accessed: "2026-10-28"
    note: "With its beacon and navaid files, as tabled on the DCS: Syria map page."
  - n: 4
    title: "dcs-world-schema reference data: Sinai airbases (Ramat David.json)"
    publisher: "dcs-world-schema, open-source data extracted by running DCS World 2.9.30.28536"
    url: "https://github.com/YoloWingPixie/dcs-world-schema/blob/c3091e6c08fb8167e26145d0e33c10e4140c6fe7/dcs-world-reference/latest/airbases/SinaiMap/Ramat%20David.json"
    accessed: "2026-10-28"
    note: "With its beacon and navaid files, as tabled on the DCS: Sinai map page."
  - n: 5
    title: "Israel Theater Of Operations v1.08.1.1"
    publisher: "Falcon BMS forum (release announcement)"
    url: "https://forum.falcon-bms.com/topic/30861"
    accessed: "2026-10-28"
---

## Role today

Ramat David is the Israeli Air Force's northernmost base with fighters and UAVs, 20 km south-east of Haifa in the Jezreel Valley. [[1]](#source-1) Since 2021 it has held all of the air force's remaining F-16C/D *Barak* squadrons: 101 and 105 Squadrons moved in from Hatzor to join 109 Squadron, which has been there since 1956. [[1]](#source-1) Two squadrons of classified UAVs, 157 and 160, are also based there. [[1]](#source-1)

Syria and Lebanon are only 50 to 60 km away, and the fighters live in underground hangars and shelters with several entrances, which they taxi into after each landing. [[1]](#source-1) Hezbollah fired rockets at the base on 22 August and 22 September 2024 with no serious hit reported, and an Iron Dome battery is stationed there. [[1]](#source-1) In the Iran war of June 2026 the IDF confirmed a missile hit on the base, which damaged a hangar reportedly used for vehicle maintenance. [[1]](#source-1)

The base may not stay military. In February 2026 the Israeli government approved building international airports at Ramat David and at Ziklag near Beersheba, and the closure of 193 Squadron in August 2025 has been read as a sign that the air force is preparing to leave. [[1]](#source-1)

## History

Roald Dahl landed his RAF Hurricane on a strip of rolled earth in a sweet-corn field here in June 1941, an emergency field in case RAF Haifa was bombed. [[1]](#source-1) The RAF made it a proper airfield, RAF Ramat David, in 1942, and fighter, bomber and transport squadrons took turns there until 1948; Jewish paratroopers also trained there during the war to drop behind German lines. [[1]](#source-1) On 22 May 1948, a week after Israel declared independence, the Royal Egyptian Air Force attacked the still-British base in the belief that Israel held it, destroying aircraft and a hangar and killing four British airmen; five of the Egyptian fighters were shot down. [[1]](#source-1) The Israel Defense Forces took it over shortly after. [[1]](#source-1)

It grew into the main base for Israeli air operations north into Syria and Lebanon. [[1]](#source-1) 117 Squadron formed there on 17 June 1953 as the air force's first jet squadron, with Meteors, and flew Mirage IIICJs in the Six-Day, Attrition and Yom Kippur wars. [[1]](#source-1) In 1980 it and 110 Squadron received Israel's first F-16A/Bs, and four of 117 Squadron's jets flew in Operation Opera, the destruction of Iraq's Osirak reactor, in June 1981. [[1]](#source-1) In the 1973 war it was the only Israeli air base where rockets hit and caused casualties. [[1]](#source-1) 110 Squadron closed in 2017 and 117 Squadron in October 2020, reopening on F-35Is at Nevatim in 2021. [[1]](#source-1)

## The airfield

Three asphalt runways in a triangle, each about 2.4 to 2.6 km long, and a heliport. [[1]](#source-1) [[2]](#source-2)
