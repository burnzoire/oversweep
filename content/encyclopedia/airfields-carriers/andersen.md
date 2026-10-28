---
kind: airfield
short: Andersen
name: Andersen Air Force Base
status: active
names:
  - { name: "North Field", former: true, from: "1944", ended: true, cite: "[1]" }
identifiers: { icao: PGUA, iata: UAM, faa: UAM }
country: guam
location: "Yigo, Guam [1] [2]"
coordinates: { lat: 13.5840, lon: 144.9300, cite: "[7]" }
elevationFt: 617
elevationCite: "[2]"
opened: { year: 1944, text: "3 December 1944, as North Field [1]" }
roles: [bomber, staging]
operators:
  - { name: "US Air Force", detail: "Pacific Air Forces", nation: us, branch: air-force, cite: "[1]" }
  - { name: "Joint Region Marianas", detail: "manages the base with Naval Base Guam", nation: us, branch: joint, cite: "[1]" }
units:
  - { name: "36th Wing, the host wing, which flies no aircraft of its own and supports deployed Air Force and visiting foreign units", nation: us, branch: air-force, basing: permanent, asOf: "2026-10", cite: "[1]" }
  - { name: "Continuous bomber presence: bomber squadrons taking turns on Guam", nation: us, branch: air-force, basing: rotational, aircraft: ["B-1B", "B-2", "B-52"], from: "2004", to: "2020-04", cite: "[1]" }
  - { name: "Bomber task force deployments, as needed", nation: us, branch: air-force, basing: deployed, aircraft: ["B-1B", "B-2", "B-52"], from: "2020-04", cite: "[1]" }
  - { name: "B-52 force for Operation Linebacker II, with U-Tapao in Thailand: more than 150 aircraft", nation: us, branch: air-force, basing: deployed, aircraft: ["B-52"], from: "1972-12", to: "1972-12", cite: "[1]" }
  - { name: "314th Bombardment Wing", nation: us, branch: air-force, basing: permanent, aircraft: ["B-29"], asOf: "1945", ended: true, cite: "[1]" }
facilities:
  asOf: "2026-10"
  runways:
    - { id: "06L/24R", lengthFt: 10528, widthFt: 200, surface: "asphalt and concrete", cite: "[2]" }
    - { id: "06R/24L", lengthFt: 11200, widthFt: 200, surface: "asphalt and concrete", cite: "[2]" }
  arresting:
    - "BAK-12 near each end of both runways [3]; the approach-end cables on 06L and 06R need 30 minutes' notice [2]"
  navaids:
    - "[TACAN](term:) UAM, on the field [2]"
    - "ILS runways 06R, 24L and 24R [2]"
  other:
    - "Northwest Field, a historic airfield beside the base, now used for training [1]"
theatres: [east-asia-pacific]
maps:
  - map: dcs-marianas
    status: represented
    inSimName: "Andersen AFB"
    checked: "2026-10-27"
    cite: "[4] [5]"
    facts:
      - "The map's main airbase [4]"
      - "Runways 06L/24R and 06R/24L [5]"
      - "Tower 126.2 MHz VHF and 250.1 MHz UHF [5]; the FAA lists the tower on 126.2 MHz [2]"
    differences:
      - { topic: "ILS", text: "DCS's airfield data gives Andersen no ILS on any runway [5]; the FAA lists ILS approaches to runways 06R, 24L and 24R. [2]" }
  - map: dcs-marianas-1944
    status: unchecked
    checked: "2026-10-27"
    note: "The map shows Guam under Japanese control in the summer of 1944 [6], before North Field was built. [1]"
    cite: "[1] [6]"
charts:
  - src: "encyclopedia/airfields-carriers/andersen-diagram.png"
    alt: "FAA airport diagram of Andersen AFB: two long parallel runways running south-west to north-east, with numbered north and south ramps along them and arresting gear marked near each end"
    caption: "Parallel runways 06L/24R and 06R/24L with the north, centre and south ramps between and beside them, and BAK-12 cables near each end."
    chart: "FAA Airport Diagram, Andersen AFB (PGUA), d-TPP Pacific cycle, effective 3 September–29 October 2026"
    publisher: "Federal Aviation Administration"
    sourceUrl: "https://aeronav.faa.gov/d-tpp/2610/02147AD.PDF"
    accessed: "2026-10-27"
photos:
  - src: "encyclopedia/airfields-carriers/andersen.jpg"
    alt: "Aerial photograph, partly behind cloud, of an old airfield and red-earth construction sites cut into green forest on a plateau above the sea"
    caption: "Northwest Field at Andersen, a historic airfield now used for training, set in the largest limestone forest on Guam, 24 September 2009."
    author: "Tech. Sgt. Mike Andriacco, US Air Force"
    licence: "Public domain"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Andersen_AFB.jpg"
    accessed: "2026-10-27"
  - src: "encyclopedia/airfields-carriers/andersen-2.jpg"
    alt: "Black-and-white aerial photograph of long rows of B-52 bombers parked wingtip to wingtip on the ramps beside a runway"
    caption: "About 150 B-52s at Andersen in the autumn of 1972, just before the Linebacker II offensive."
    author: "US Air Force"
    licence: "Public domain"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Andersen_AFB_with_150_B-52s_1972.jpg"
    accessed: "2026-10-27"
  - src: "encyclopedia/airfields-carriers/andersen-3.jpg"
    alt: "Black-and-white oblique aerial photograph of a wartime airfield: dozens of four-engined B-29 bombers parked on hardstands along taxiways beside two parallel runways, with the sea beyond"
    caption: "B-29s of the 29th Bombardment Group at North Field, Guam, now Andersen, on 1 August 1945."
    author: "US Navy (photo 80-G-331916)"
    licence: "Public domain"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Aerial_view_of_North_Field,_Guam,_on_1_August_1945_(80-G-331916).jpg"
    accessed: "2026-10-27"
sources:
  - n: 1
    title: "Andersen Air Force Base"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Andersen_Air_Force_Base"
    accessed: "2026-10-27"
  - n: 2
    title: "Airport data: UAM (PGUA), Andersen AFB"
    publisher: "Federal Aviation Administration, Aeronautical Information Services"
    date: "data effective 1–29 October 2026"
    url: "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=UAM"
    accessed: "2026-10-27"
  - n: 3
    title: "Airport Diagram, Andersen AFB (PGUA)"
    publisher: "Federal Aviation Administration, digital Terminal Procedures Publication"
    date: "Pacific, 3 September–29 October 2026"
    url: "https://aeronav.faa.gov/d-tpp/2610/02147AD.PDF"
    accessed: "2026-10-27"
  - n: 4
    title: "DCS: Marianas Map"
    publisher: "Eagle Dynamics (product page)"
    url: "https://www.digitalcombatsimulator.com/en/shop/terrains/marianas_terrain/"
    accessed: "2026-10-27"
  - n: 5
    title: "pydcs terrain data: Mariana Islands airports (airports.py)"
    publisher: "pydcs, an open-source Python library for building DCS World missions"
    url: "https://github.com/pydcs/dcs/blob/5ddcc63a2dcd661e16b14f7aa43219b93044855d/dcs/terrain/marianaislands/airports.py"
    accessed: "2026-10-27"
    note: "Andersen AFB entry: ATC radios, and runways 06L/24R and 06R/24L, each approach with an empty list of runway beacons."
  - n: 6
    title: "DCS: Marianas WWII Map"
    publisher: "Eagle Dynamics (product page)"
    url: "https://www.digitalcombatsimulator.com/en/shop/terrains/marianas_wwii_terrain/"
    accessed: "2026-10-27"
  - n: 7
    title: "Airport data, PGUA"
    publisher: "OurAirports open data (public domain, community-maintained)"
    url: "https://davidmegginson.github.io/ourairports-data/airports.csv"
    accessed: "2026-10-28"
    note: "Row for PGUA: latitude, longitude and identifiers."
---

## Role today

Andersen is the most important US air base west of Hawaii. [[1]](#source-1) It is one of the Air Force's four forward operating locations for bombers and the only base in the Western Pacific that can permanently support the heavy bombers, the B-1B, B-2 and B-52. [[1]](#source-1) Guam's almost unrestricted airspace and the bombing range on Farallon de Medinilla, an island 184 miles north, make it a good place to train. [[1]](#source-1) Its host, the 36th Wing, flies no aircraft of its own; it supports the Air Force and foreign units that deploy there. [[1]](#source-1)

## History

The base began as North Field, the first airfield built on Guam after its liberation in 1944. [[1]](#source-1) With Northwest Field it had four main runways and revetments for more than 200 B-29s, and from early 1945 the 314th Bombardment Wing flew its raids on Japan from here. [[1]](#source-1) It was named for Brigadier General James Roy Andersen, lost in the crash of a B-24 between Kwajalein and Johnston Island in February 1945. [[1]](#source-1)

In the Vietnam War Andersen launched the B-52 raids of Operation Arc Light from 1965, and in the eleven days of Linebacker II in December 1972 more than 150 B-52s flew 729 sorties against North Vietnam from Andersen and U-Tapao in Thailand. [[1]](#source-1) The 54th Weather Reconnaissance Squadron flew WC-130s from Andersen into typhoons from the 1960s to 1987. [[1]](#source-1) From 2004 to April 2020, B-1Bs, B-2s and B-52s took turns to keep a continuous bomber presence on Guam; bombers still deploy there as needed. [[1]](#source-1)
