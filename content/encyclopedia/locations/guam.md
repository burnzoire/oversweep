---
kind: airfield
short: Guam Intl
name: Antonio B. Won Pat International Airport
status: active
names:
  - { name: "Guam International Airport", cite: "[1]" }
  - { name: "Naval Air Station Agana", former: true, from: "1947", to: "1995-04", cite: "[1]" }
  - { name: "Agana Airfield", former: true, from: "1944", to: "1947", cite: "[1]" }
  - { name: "Guamu Dai Ni (Guam No. 2)", former: true, from: "1943", to: "1944", cite: "[1]" }
identifiers: { icao: PGUM, iata: GUM, faa: GUM }
country: guam
location: "Tamuning and Barrigada, Guam, 3 miles north-east of Tamuning and east of the capital, Hagåtña [1] [2]"
coordinates: { lat: 13.4840, lon: 144.7971, cite: "[2]" }
elevationFt: 305
elevationCite: "[2]"
opened: { year: 1943, text: "about 1943, built by the Imperial Japanese Navy as Guamu Dai Ni [1]" }
roles: [civil-airport]
operators:
  - { name: "A.B. Won Pat International Airport Authority, Guam", detail: "an agency of the Government of Guam", nation: guam, branch: civil, cite: "[1] [2]" }
  - { name: "US Navy", detail: "Naval Air Station Agana, closed by the 1993 Base Realignment and Closure round", nation: us, branch: navy, from: "1947", to: "1995-04", cite: "[1]" }
  - { name: "US Army Air Forces", nation: us, branch: air-force, from: "1944", to: "1947", cite: "[1]" }
  - { name: "Imperial Japanese Navy", nation: japan, branch: navy, from: "1943", to: "1944", cite: "[1]" }
units:
  - { name: "11th Bombardment Group, Seventh Air Force", nation: us, branch: air-force, basing: permanent, aircraft: ["B-24 Liberator"], from: "1944-10", to: "1945-07", cite: "[1]" }
  - { name: "41st Photographic Reconnaissance Squadron", nation: us, branch: air-force, basing: permanent, aircraft: ["F-5 Lightning"], from: "1945-07", to: "1946-01", cite: "[1]" }
  - { name: "21st Fighter Group and 549th Night Fighter Squadron, for the air defence of the Marianas", nation: us, branch: air-force, basing: permanent, to: "1947", cite: "[1]" }
facilities:
  asOf: "2026-10"
  runways:
    - { id: "06L/24R", lengthFt: 12014, widthFt: 150, surface: "asphalt and concrete", note: "runway 06L has a 1,000 ft displaced threshold, a MALSR approach light system and a PAPI", cite: "[2]" }
    - { id: "06R/24L", lengthFt: 10014, widthFt: 150, surface: "asphalt and concrete", cite: "[2]" }
  navaids:
    - "ILS/DME on runways 06L (I-GUM, 110.3 MHz) and 06R (I-AWD, 110.9 MHz) [2]"
    - "VORTAC UNZ (Nimitz), 115.8 MHz, 4.1 nm from the field [2]"
  other:
    - "Agana Tower 118.1 and 340.2 MHz, Ground 121.9 and 336.4 MHz, ATIS 119.0 MHz; approach and departure service from Guam CERAP [2]"
    - "A lighted tower 780 ft tall 1.3 nm east-north-east of the runway 24L threshold [2]"
theatres: [east-asia-pacific]
maps:
  - map: dcs-marianas
    status: represented
    inSimName: "Antonio B. Won Pat Intl"
    checked: "2026-11-01"
    cite: "[3]"
    facts:
      - "Runways 06L/24R (9,359 ft) and 06R/24L (8,135 ft) [3]"
      - "Tower 118.1 MHz VHF and 340.2 MHz UHF [3], the frequencies the FAA lists for Agana Tower [2]"
      - "ILS approaches IGUM (110.3 MHz) and IAWD (110.9 MHz), both listed for runway 06L [3]"
    differences:
      - { topic: "Runway lengths", text: "The game's runways are 9,359 and 8,135 ft long [3]; the FAA lists 12,014 and 10,014 ft. [2]" }
      - { topic: "ILS runways", text: "The game lists both ILS approaches for runway 06L [3]; the FAA has I-AWD on runway 06R. [2]" }
photos: []
sources:
  - n: 1
    title: "Antonio B. Won Pat International Airport"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Antonio_B._Won_Pat_International_Airport"
    accessed: "2026-11-01"
  - n: 2
    title: "Airport data: GUM (PGUM), Guam Intl"
    publisher: "Federal Aviation Administration, Aeronautical Information Services"
    date: "data effective 29 October – 26 November 2026"
    url: "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=GUM"
    accessed: "2026-11-01"
  - n: 3
    title: "dcs-world-schema reference data: Mariana Islands airbases (Antonio B. Won Pat Intl.json)"
    publisher: "dcs-world-schema, open-source data extracted by running DCS World 2.9.30.28536"
    url: "https://github.com/YoloWingPixie/dcs-world-schema/blob/c3091e6c08fb8167e26145d0e33c10e4140c6fe7/dcs-world-reference/latest/airbases/MarianaIslands/Antonio%20B.%20Won%20Pat%20Intl.json"
    accessed: "2026-11-01"
    note: "With its beacon files, as tabled on the DCS: Marianas map page."
---

## Role today

Antonio B. Won Pat International, also called Guam International Airport, is the only international airport in the territory, a hub for United Airlines and the main cargo hub of Asia Pacific Airlines. [[1]](#source-1) It is run by an agency of the Government of Guam and named for Antonio Borja Won Pat, Guam's first delegate to the US House of Representatives. [[1]](#source-1) It occupies the site of the former Naval Air Station Agana. [[1]](#source-1) The island's other main airfield is [Andersen Air Force Base](record:andersen).

## History

The Imperial Japanese Navy built the airfield in about 1943 as Guamu Dai Ni, Guam No. 2, for the defence of the Marianas. [[1]](#source-1) After US forces retook Guam in 1944 it became Agana Airfield; Seabees repaired it in October 1944, and B-24s of the 11th Bombardment Group flew from it until July 1945, followed by F-5 Lightning [reconnaissance](term:reconnaissance) aircraft and then fighters defending the islands. [[1]](#source-1) The US Navy took over in 1947 and ran Naval Air Station Agana, absorbing the facilities of the closing Harmon Air Force Base in 1949. [[1]](#source-1)

Civil travel to Guam needed a security clearance until 1962, and the first International Air Terminal opened in March 1967. [[1]](#source-1) NAS Agana was closed in April 1995 under the 1993 base closure round, and the airport authority took over the whole field. [[1]](#source-1)

## The airfield

Two parallel runways, 06L/24R, 12,014 ft long, and 06R/24L, 10,014 ft, both with ILS approaches from the south-west. [[2]](#source-2) The FAA lists runway gradients of up to 0.8%, and terrain rises close to the runway 24L threshold. [[2]](#source-2)
