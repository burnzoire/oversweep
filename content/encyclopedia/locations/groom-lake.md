---
kind: airfield
short: Groom Lake
name: Homey Airport (Groom Lake, Area 51)
status: active
names:
  - { name: "Area 51", from: "1960", cite: "[1]" }
  - { name: "Paradise Ranch", former: true, from: "1955", ended: true, cite: "[1]" }
  - { name: "Indian Springs Air Force Auxiliary Field", former: true, from: "1942", ended: true, cite: "[1]" }
identifiers: { icao: KXTA }
country: us
location: "Beside Groom Lake, a salt flat inside the Nevada Test and Training Range, north-north-west of Las Vegas, Nevada [1]"
coordinates: { lat: 37.2350, lon: -115.8110, cite: "[2]" }
elevationFt: 4494
elevationCite: "[1]"
opened: { year: 1942, text: "1942, as Indian Springs Air Force Auxiliary Field with two unpaved 5,000 ft runways; the CIA established the test facility in April 1955 [1]" }
roles: [test]
operators:
  - { name: "US Air Force", detail: "a remote detachment administered by Edwards Air Force Base", nation: us, branch: air-force, cite: "[1]" }
  - { name: "Central Intelligence Agency", detail: "established the test facility for the U-2 and ran the A-12 OXCART programme here", nation: us, branch: government, from: "1955", ended: true, cite: "[1]" }
units:
  - { name: "4450th Tactical Group, the first F-117A unit, before its move to Tonopah", nation: us, branch: air-force, basing: permanent, aircraft: ["F-117A", "A-7D"], from: "1979-10", to: "1983", cite: "[1]" }
facilities:
  runways:
    - { id: "14L/32R", lengthFt: 11998, surface: "asphalt", cite: "[1]" }
    - { id: "12/30", lengthFt: 5420, surface: "paved", note: "part of a taxiway, usable as a runway when announced by NOTAM; OurAirports marks it closed", cite: "[1] [2]" }
    - { id: "09L/27R and 09R/27L", lengthFt: 11385, surface: "dry lake bed", unpaved: true, cite: "[1]" }
    - { id: "03L/21R and 03R/21L", lengthFt: 10000, surface: "dry lake bed", unpaved: true, cite: "[1]" }
  other:
    - "The surrounding airspace is restricted area R-4808N, and Dreamland is the approach control callsign for the area [1]"
theatres: [north-america]
maps:
  - map: dcs-nevada
    status: represented
    inSimName: "Groom Lake"
    checked: "2026-11-01"
    cite: "[3] [4]"
    facts:
      - "Runway 14/32 [3]"
      - "Ground, tower and approach callsign Dreamland [3]"
      - "Radios on 118.0 MHz VHF and 250.05 MHz UHF [4]"
      - "TACAN GRL on channel 18, and an ILS (GLRI, 109.3 MHz) to runway 32 [4]"
photos: []
sources:
  - n: 1
    title: "Area 51"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Area_51"
    accessed: "2026-11-01"
    note: "Infobox runways, the Groom Lake geography and the U-2, OXCART and Have Blue/F-117 history sections."
  - n: 2
    title: "Airport and runway data, KXTA"
    publisher: "OurAirports open data (public domain, community-maintained)"
    url: "https://davidmegginson.github.io/ourairports-data/airports.csv"
    accessed: "2026-11-01"
    note: "Rows for KXTA in airports.csv and runways.csv: position and runway 12/30. The FAA's airport database has no entry for XTA."
  - n: 3
    title: "dcs-world-schema reference data: Nevada airbases (Groom Lake.json)"
    publisher: "dcs-world-schema, open-source data extracted by running DCS World 2.9.30.28536"
    url: "https://github.com/YoloWingPixie/dcs-world-schema/blob/c3091e6c08fb8167e26145d0e33c10e4140c6fe7/dcs-world-reference/latest/airbases/Nevada/Groom%20Lake.json"
    accessed: "2026-11-01"
    note: "Runway and radio callsign; this file gives no radio frequencies."
  - n: 4
    title: "pydcs terrain data: Nevada airports (airports.py)"
    publisher: "pydcs, an open-source Python library for building DCS World missions, whose terrain data mirrors the game's"
    url: "https://github.com/pydcs/dcs/blob/5ddcc63a2dcd661e16b14f7aa43219b93044855d/dcs/terrain/nevada/airports.py"
    accessed: "2026-11-01"
    note: "Groom Lake entry: radio frequencies, TACAN and ILS, as tabled on the DCS: Nevada map page."
---

## Role today

Groom Lake is a highly classified US Air Force facility, a remote detachment of Edwards Air Force Base, officially called Homey Airport and better known as Area 51. [[1]](#source-1) Its operations are not made public; the Air Force calls it an open training range, and it is commonly thought to support the development and testing of experimental aircraft and weapons. [[1]](#source-1) The CIA acknowledged the base publicly in June 2013. [[1]](#source-1) Its identifier KXTA appeared in a commercial navigation database in December 2007, and the Aircraft Owners and Pilots Association advised that student pilots be warned never to use it as a waypoint or destination. [[1]](#source-1)

## History

The first airfield here opened in 1942, as an auxiliary field of Indian Springs with two unpaved runways. [[1]](#source-1) The CIA set up the Groom Lake test facility in April 1955 for Project AQUATONE, the development of the Lockheed U-2. [[1]](#source-1) For the A-12 OXCART from 1960, contractors built a 10,000 ft runway, 14/32, diagonally across the south-west corner of the lake bed and marked two unpaved crosswind strips on the lake itself. [[1]](#source-1)

The Have Blue stealth demonstrator first flew here in December 1977, and the first full-scale YF-117A flew on 18 June 1981. [[1]](#source-1) The 4450th Tactical Group was formed in October 1979 to bring the F-117A into service and was based here at first, flying A-7Ds as stand-in trainers, before moving to [Tonopah Test Range](record:tonopah-test-range) from 1982. [[1]](#source-1) Since then the base and its runways have been expanded further, and in 1995 the government closed the nearby mountains that had given the only public view of it. [[1]](#source-1)

## The airfield

The paved main runway, 14L/32R, is 3,657 m (about 12,000 ft) long. [[1]](#source-1) Two pairs of runways marked on the dry lake bed, 09/27 and 03/21, are about 11,400 and 10,000 ft long. [[1]](#source-1)
