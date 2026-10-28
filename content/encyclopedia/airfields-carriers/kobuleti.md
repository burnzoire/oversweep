---
kind: airfield
short: Kobuleti
name: Ozurgeti Air Base (Kobuleti)
status: closed
names:
  - { name: "Ozurgeti Air Base", cite: "[1]" }
identifiers: { others: ["GE-0007"] }
country: georgia
location: "Inland from Kobuleti on Georgia's Black Sea coast, in Adjara [1] [2]"
coordinates: { lat: 41.9291, lon: 41.8635, cite: "[1]" }
elevationFt: 79
elevationCite: "[3]"
opened: { text: "no opening date was found in the sources consulted" }
closed: { text: "disused: OpenStreetMap maps its runway as abandoned and unpaved [2]; no closing date was found" }
roles: []
operators: []
facilities:
  runways:
    - { id: "07/25", lengthFt: 7680, surface: "unpaved", note: "2,341 m as tagged in OpenStreetMap, which marks the runway abandoned", cite: "[2]" }
theatres: [caucasus]
maps:
  - map: dcs-caucasus
    status: represented
    inSimName: "Kobuleti"
    checked: "2026-10-28"
    cite: "[4]"
    facts:
      - "Runway 07/25, 7,407 ft [4]"
      - "Tower 133.0 MHz VHF and 262.0 MHz UHF [4]"
      - "TACAN 67X (KBL), NDBs KT and T, and an ILS on runway 07, 111.5 MHz (IKB) [4]"
    differences:
      - { topic: "Condition", text: "The game has an active airfield with a tower, TACAN and ILS [4]; OpenStreetMap maps the real runway as abandoned and unpaved. [2]" }
photos: []
sources:
  - n: 1
    title: "Airport data, GE-0007"
    publisher: "OurAirports open data (public domain, community-maintained)"
    url: "https://davidmegginson.github.io/ourairports-data/airports.csv"
    accessed: "2026-10-28"
    note: "Row for GE-0007 Ozurgeti Air Base, at the position of the game's Kobuleti: position only, with no elevation or runway rows. GE-0006, listed as Kobuleti Airfield, is a different, smaller strip to the south-west."
  - n: 2
    title: "OpenStreetMap way/74309078 (abandoned runway 07/25) and the apron beside it"
    publisher: "OpenStreetMap contributors (ODbL 1.0)"
    url: "https://www.openstreetmap.org/way/74309078"
    accessed: "2026-10-28"
    note: "Community-mapped. OSM no longer maps the site as an aerodrome."
  - n: 3
    title: "SRTM 30 m terrain height at the airfield's OurAirports position"
    publisher: "NASA Shuttle Radar Topography Mission data, via the OpenTopoData API"
    url: "https://api.opentopodata.org/v1/srtm30m?locations=41.9291,41.863499"
    accessed: "2026-10-28"
    note: "24 m. A satellite terrain survey from 2000, not a surveyed aerodrome elevation; used because no published elevation was found."
  - n: 4
    title: "dcs-world-schema reference data: Caucasus airbases (Kobuleti.json)"
    publisher: "dcs-world-schema, open-source data extracted by running DCS World 2.9.30.28536"
    url: "https://github.com/YoloWingPixie/dcs-world-schema/blob/c3091e6c08fb8167e26145d0e33c10e4140c6fe7/dcs-world-reference/latest/airbases/Caucasus/Kobuleti.json"
    accessed: "2026-10-28"
    note: "With its beacon and navaid files, as tabled on the DCS: Caucasus map page."
---

## Role today

The airfield the game calls Kobuleti is listed in open airport data as Ozurgeti Air Base, inland from Kobuleti on the Adjaran coast. [[1]](#source-1) Community mapping shows its single runway, 07/25, as abandoned and unpaved, with an apron beside it, and no longer maps the site as an aerodrome. [[2]](#source-2)

## History

No published history of this airfield was found in the sources consulted, including English and Russian Wikipedia. Its units and dates of use are not given here until a source for them is found.

## The airfield

One runway, 07/25, 2,341 m long and mapped as unpaved. [[2]](#source-2) The field's elevation here is satellite terrain data, not a surveyed figure. [[3]](#source-3)
