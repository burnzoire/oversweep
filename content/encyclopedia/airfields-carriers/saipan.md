---
kind: airfield
short: Saipan
name: Saipan International Airport
status: active
names:
  - { name: "Francisco C. Ada / Saipan International Airport", from: "2005", cite: "[1]" }
  - { name: "Aslito Field", former: true, from: "1941", to: "1944-06", cite: "[1]" }
  - { name: "Isely Field", former: true, from: "1944-06", ended: true, cite: "[1]" }
identifiers: { icao: PGSN, iata: SPN, faa: GSN }
country: northern-mariana-islands
location: "Southern Saipan, Northern Mariana Islands, 4 miles south-west of the island's main town [2]"
coordinates: { lat: 15.1194, lon: 145.7288, cite: "[6]" }
elevationFt: 214
elevationCite: "[2]"
opened: { year: 1933, text: "1933, as a temporary landing field built by the Imperial Japanese Navy Air Service on a sugarcane field [1]" }
roles: [civil-airport]
operators:
  - { name: "Commonwealth Ports Authority", detail: "owner of the public airport", nation: northern-mariana-islands, branch: civil, cite: "[1] [2]" }
  - { name: "Imperial Japanese Navy Air Service", nation: japan, branch: navy, from: "1933", to: "1944-06-18", cite: "[1]" }
  - { name: "US Navy and US Army Air Forces", detail: "Naval Advance Base Saipan, and Twentieth Air Force B-29 operations", nation: us, branch: joint, from: "1944-06-18", to: "1945-12", cite: "[1]" }
units:
  - { name: "73rd Bombardment Wing: the 497th, 498th, 499th and 500th Bombardment Groups, under XXI Bomber Command", nation: us, branch: air-force, basing: permanent, aircraft: ["B-29 Superfortress"], from: "1944-10-12", to: "1945-12", cite: "[1]" }
  - { name: "19th Fighter Squadron, the first US aircraft to arrive", nation: us, branch: air-force, aircraft: ["P-47"], asOf: "1944-06", ended: true, cite: "[1]" }
facilities:
  asOf: "2026-10"
  runways:
    - { id: "07/25", lengthFt: 8699, widthFt: 200, surface: "grooved asphalt", cite: "[2]" }
    - { id: "06/24", lengthFt: 7001, widthFt: 100, surface: "asphalt", cite: "[2]" }
  navaids:
    - "ILS/DME runway 07 (I-GSN, 109.9 MHz, channel 36X) [2]"
  other:
    - "Saipan Tower on 125.7 and 256.9 MHz; approach and departure service from Guam CERAP [2]"
    - "Surviving Second World War facilities form the Isely Field Historic District, part of a National Historic Landmark District [1]"
theatres: [east-asia-pacific]
maps:
  - map: dcs-marianas
    status: represented
    inSimName: "Saipan Intl"
    checked: "2026-10-27"
    cite: "[3] [5]"
    facts:
      - "One of the large airfields on the map's main islands [3]"
      - "Tower 125.7 MHz VHF and 256.9 MHz UHF [5], the frequencies the FAA lists for Saipan Tower [2]"
    differences:
      - { topic: "Runway 06/24", text: "DCS's airfield data has only runway 07-25 [5]; the real airport also has the narrower parallel runway 06/24. [2]" }
      - { topic: "ILS", text: "DCS lists no runway beacons for either end of runway 07-25 [5]; the FAA lists an ILS/DME on runway 07. [2]" }
  - map: dcs-marianas-1944
    status: represented
    inSimName: "Aslito"
    checked: "2026-10-28"
    cite: "[4]"
    facts:
      - "Shown as a Japanese airfield in early 1944, with wooden revetments, sandbagged searchlights and minimal radio aids; navigation is by compass and coastal landmarks [4]"
      - "The map's period, 15 June to 10 August 1944, spans the field's capture on 18 June and its first weeks as Isely Field [1] [4]"
photos:
  - src: "encyclopedia/airfields-carriers/saipan.jpg"
    alt: "Black-and-white photograph of a large crowd of servicemen around a polished four-engined B-29 bomber parked on a coral airfield, with trucks in the foreground"
    caption: "A B-29 Superfortress of the 498th Bombardment Group at Isely Field, Saipan, between September 1944 and April 1945."
    author: "US Marine Corps"
    licence: "Public domain"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Boeing_B-29_Superfortress_of_the_498th_at_Isely_Field,_Saipan,_circa_in_late_1944_(74237464).jpg"
    accessed: "2026-10-28"
  - src: "encyclopedia/airfields-carriers/saipan-2.jpg"
    alt: "An airport terminal with red pagoda-style roofs and jet bridges beyond a wide concrete apron, seen past the wingtip of a small aircraft"
    caption: "The terminal at Saipan International Airport from the apron, 21 November 2016."
    author: "Edward Russell"
    licence: "CC BY 2.0"
    licenceUrl: "https://creativecommons.org/licenses/by/2.0/"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Saipan_International_airport_(31037379131).jpg"
    accessed: "2026-10-28"
sources:
  - n: 1
    title: "Saipan International Airport"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Saipan_International_Airport"
    accessed: "2026-10-27"
  - n: 2
    title: "Airport data: GSN (PGSN), Francisco C Ada/Saipan Intl"
    publisher: "Federal Aviation Administration, Aeronautical Information Services"
    date: "data effective 1–29 October 2026"
    url: "https://nfdc.faa.gov/nfdcApps/services/ajv5/airportDisplay.jsp?airportId=GSN"
    accessed: "2026-10-28"
  - n: 3
    title: "DCS: Marianas Map"
    publisher: "Eagle Dynamics (product page)"
    url: "https://www.digitalcombatsimulator.com/en/shop/terrains/marianas_terrain/"
    accessed: "2026-10-27"
  - n: 4
    title: "DCS: Marianas WWII Map"
    publisher: "Eagle Dynamics (product page)"
    url: "https://www.digitalcombatsimulator.com/en/shop/terrains/marianas_wwii_terrain/"
    accessed: "2026-10-28"
  - n: 5
    title: "pydcs terrain data: Mariana Islands airports (airports.py)"
    publisher: "pydcs, an open-source Python library for building DCS World missions, whose terrain data mirrors the game's"
    url: "https://github.com/pydcs/dcs/blob/5ddcc63a2dcd661e16b14f7aa43219b93044855d/dcs/terrain/marianaislands/airports.py"
    accessed: "2026-10-27"
    note: "Saipan Intl entry: ATC radios, and runway 07-25 with an empty list of runway beacons at each end."
  - n: 6
    title: "Airport data, PGSN"
    publisher: "OurAirports open data (public domain, community-maintained)"
    url: "https://davidmegginson.github.io/ourairports-data/airports.csv"
    accessed: "2026-10-28"
    note: "Row for PGSN: latitude, longitude and identifiers."
---

## Role today

Saipan International Airport is the public airport of the Northern Mariana Islands, owned by the Commonwealth Ports Authority. [[1]](#source-1) [[2]](#source-2) Most of its traffic is air taxi and general aviation, including the short hops to Tinian and Rota; military flights are under 1% of its operations. [[1]](#source-1) For a mission set in the present it is a civil field with a tower, an ILS and two runways. [[2]](#source-2)

## History

The Imperial Japanese Navy Air Service laid out a landing field on a sugarcane field here in 1933 and from 1937 built it up for full military use, although the League of Nations mandate under which Japan held the islands banned military works. [[1]](#source-1) After the attack on the United States in 1941 it was named Aslito Field, from the Chamorro name of the area. [[1]](#source-1)

The US Army's 27th Infantry Division captured the airfield on 18 June 1944, during the Battle of Saipan. [[1]](#source-1) It was renamed Isely Field for Commander Robert H. Isely, a US Navy pilot killed strafing it on 13 June, and Seabees repaired and enlarged it as Naval Advance Base Saipan; P-47s of the 19th Fighter Squadron were the first US aircraft to arrive. [[1]](#source-1) The first B-29 landed on 12 October 1944, and by late November more than 100 were there, flying with the 73rd Bombardment Wing first in high-altitude daylight raids on Japan's aircraft industry and then in the low-level night incendiary raids on Tokyo, Nagoya and Osaka. [[1]](#source-1) Most Japanese air attacks on the Marianas between November 1944 and January 1945 were aimed at Isely Field. [[1]](#source-1)

The 73rd Bombardment Wing left for the United States in December 1945, and the airfield returned to civil use. [[1]](#source-1) Its surviving wartime facilities were listed on the National Register of Historic Places in 1981 as the Isely Field Historic District. [[1]](#source-1) The airport was renamed for Francisco C. Ada, a former lieutenant governor of the Northern Mariana Islands, in 2005. [[1]](#source-1)
