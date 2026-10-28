---
kind: airfield
short: Nellis
name: Nellis Air Force Base
status: active
names:
  - { name: "Las Vegas Army Airfield", former: true, from: "1941-12-20", to: "1950-04-30", cite: "[1]" }
identifiers: { icao: KLSV, iata: LSV, faa: LSV }
country: us
location: "Las Vegas, Nevada [1] [2]"
coordinates: { lat: 36.2362, lon: -115.0340, cite: "[6]" }
elevationFt: 1869
elevationCite: "[2]"
opened: { year: 1941, text: "20 December 1941, as Las Vegas Army Airfield; named Nellis Air Force Base on 30 April 1950 [1]" }
roles: [fighter, weapons-school, test]
operators:
  - { name: "US Air Force", detail: "Air Combat Command", nation: us, branch: air-force, cite: "[1]" }
units:
  - { name: "US Air Force Warfare Center, with the 99th Air Base Wing as host", nation: us, branch: air-force, basing: permanent, asOf: "2026-10", cite: "[1]" }
  - { name: "57th Wing: the US Air Force Weapons School and the Thunderbirds demonstration squadron", nation: us, branch: air-force, basing: permanent, aircraft: ["F-16"], asOf: "2026-10", cite: "[1]" }
  - { name: "53rd Wing test and evaluation units, the 505th Command and Control Wing and the 926th Wing (Air Force Reserve)", nation: us, branch: air-force, basing: permanent, asOf: "2026-10", cite: "[1]" }
  - { name: "Red Flag and Green Flag-West exercise forces from the US services and allied air forces", nation: us, branch: joint, basing: deployed, cite: "[1]" }
facilities:
  asOf: "2026-10"
  runways:
    - { id: "03L/21R", lengthFt: 10120, widthFt: 200, surface: "concrete", cite: "[2]" }
    - { id: "03R/21L", lengthFt: 10051, widthFt: 150, surface: "concrete", note: "ALSF-1 approach lights at both ends", cite: "[2]" }
  arresting:
    - "BAK-12 cables near each end of both runways, with a BAK-12/14 at each end of 03R/21L [3]; the BAK-12s are kept raised, and the BAK-14s lowered for use on request in an emergency [2]"
  navaids:
    - "[TACAN](term:) LSV, on the field [2]"
    - "ILS runway 21L (I-DIQ) [2]"
    - "[PAPIs](term:PAPI) set for a 3° glide path at all four runway ends [2] [3]"
  other:
    - "Ramp space for up to 300 aircraft, for large exercise deployments [1]"
theatres: [north-america]
maps:
  - map: dcs-nevada
    status: represented
    inSimName: "Nellis"
    checked: "2026-10-27"
    cite: "[4] [5]"
    facts:
      - "One of the map's detailed airbases [4]"
      - "Runways 03L/21R and 03R/21L, with runway beacons listed only for the 21L approach [5], the end with the real ILS [2]"
      - "Tower 132.55 MHz VHF and 327.0 MHz UHF [5]; the FAA lists the tower on 132.55 MHz [2]"
charts:
  - src: "encyclopedia/airfields-carriers/nellis-diagram.png"
    alt: "FAA airport diagram of Nellis AFB: two parallel runways running from south-west to north-east, a long main apron with numbered ramp rows along the western runway, and arresting gear marked near each runway end"
    caption: "The two parallel runways, 03L/21R and 03R/21L, with the main apron and Red Flag ramp rows to the west and the arresting gear marked at each end."
    chart: "FAA Airport Diagram, Nellis AFB (KLSV), d-TPP cycle 2610, effective 1–29 October 2026"
    publisher: "Federal Aviation Administration"
    sourceUrl: "https://aeronav.faa.gov/d-tpp/2610/00227AD.PDF"
    accessed: "2026-10-27"
photos:
  - src: "encyclopedia/airfields-carriers/nellis.jpg"
    alt: "Aerial view over the desert of a large air base, with rows of aircraft shelters and hangars beside two long runways and mountains behind"
    caption: "Nellis Air Force Base from the air, May 2014."
    author: "Ken Lund"
    licence: "CC BY-SA 2.0"
    licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0/"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Nellis_Air_Force_Base,_Las_Vegas,_Nevada_(14017031619).jpg"
    accessed: "2026-10-27"
  - src: "encyclopedia/airfields-carriers/nellis-2.jpg"
    alt: "A grey F-15E Strike Eagle in flight against a clear blue sky, its landing gear retracted"
    caption: "An F-15E Strike Eagle of the 17th Weapons Squadron departs Nellis during a Red Flag exercise, July 2023."
    author: "Piemags Aviation"
    licence: "CC BY-SA 4.0"
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:McDonnell_Douglas_F-15E_Strike_Eagle_90-0261_departing_Nellis_Air_Force_Base,_July_2023.jpg"
    accessed: "2026-10-27"
sources:
  - n: 1
    title: "Nellis Air Force Base"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Nellis_Air_Force_Base"
    accessed: "2026-10-27"
  - n: 2
    title: "Airport data: LSV (KLSV), Nellis AFB"
    publisher: "Federal Aviation Administration, Aeronautical Information Services"
    date: "data effective 1–29 October 2026"
    url: "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=LSV"
    accessed: "2026-10-27"
  - n: 3
    title: "Airport Diagram, Nellis AFB (KLSV)"
    publisher: "Federal Aviation Administration, digital Terminal Procedures Publication"
    date: "cycle 2610, 1–29 October 2026"
    url: "https://aeronav.faa.gov/d-tpp/2610/00227AD.PDF"
    accessed: "2026-10-27"
  - n: 4
    title: "DCS: Nevada Test and Training Range Map"
    publisher: "Eagle Dynamics (product page)"
    url: "https://www.digitalcombatsimulator.com/en/shop/terrains/nttr_terrain/"
    accessed: "2026-10-27"
  - n: 5
    title: "pydcs terrain data: Nevada airports (airports.py)"
    publisher: "pydcs, an open-source Python library for building DCS World missions, whose terrain data mirrors the game's"
    url: "https://github.com/pydcs/dcs/blob/5ddcc63a2dcd661e16b14f7aa43219b93044855d/dcs/terrain/nevada/airports.py"
    accessed: "2026-10-27"
    note: "Nellis entry: ATC radios, runways and runway beacons."
  - n: 6
    title: "Airport data, KLSV"
    publisher: "OurAirports open data (public domain, community-maintained)"
    url: "https://davidmegginson.github.io/ourairports-data/airports.csv"
    accessed: "2026-10-28"
    note: "Row for KLSV: latitude, longitude and identifiers."
---

## Role today

Nellis calls itself the "Home of the Fighter Pilot" and is the Air Force's centre for advanced combat training. [[1]](#source-1) Its main unit, the US Air Force Warfare Center, runs exercises that bring strike packages from across the Air Force together with Army, Navy and Marine Corps units and allied air forces, chiefly Red Flag and Green Flag-West, flown over the Nevada Test and Training Range north of the base. [[1]](#source-1) Range traffic works with "Nellis Control" for the restricted areas and the Desert MOA. [[2]](#source-2)

## History

The field began as a Western Air Express mail strip that the City of Las Vegas bought in January 1941 and split between the Army and the city. [[1]](#source-1) Las Vegas Army Airfield opened on 20 December 1941 as a flexible gunnery school and trained more than 45,000 B-17 gunners in the Second World War. [[1]](#source-1) After a spell as a [P-51](record:p-51d) pilot training base it was named in 1950 for 1st Lt. William Harrell Nellis, killed in action in Europe in 1944, and the Fighter Weapons School formed there in 1954. [[1]](#source-1) The school struggled with its [F-86s](record:f-86) in the mid-1950s; under Tactical Air Command from 1958 it moved to graduate-level weapons training on the [F-100](record:f-100), F-105 and [F-4](record:f-4). [[1]](#source-1)

From the 1970s Nellis added the pieces of modern combat training: aggressor squadrons flying dissimilar aircraft, the 4477th "Red Eagles" flying MiGs from the Tonopah Test Range, and Red Flag itself, run by the 57th wing from 1979. [[1]](#source-1) The Weapons School now teaches instructors for most Air Force combat aircraft, from fighters to the B-1, B-52 and rescue helicopters, and the Thunderbirds have flown from Nellis since 1956. [[1]](#source-1)
