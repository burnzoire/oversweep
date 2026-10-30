---
kind: map
mapView:
  bounds: [[29, 33], [37, 39]]
sim: bms
short: Israel
name: "Falcon BMS: Israel"
publisher: "ITO team (released by vAiCon), as an official add-on theatre"
setting: { era: modern, text: "No period is stated; its forces are modern, including the Israeli Air Force's F-35I Adir [1]" }
area: "Israel and its neighbours, including Egypt, Syria and Cyprus, on a new map shifted about 200 km north of earlier Israeli theatres, with 131 airbases and airstrips [1]"
theatres: [middle-east]
differences:
  - { topic: "Objectives and airbases", text: "The release gives Israel and Egypt dedicated objectives but places the rest by hand and only semi-accurately, and says only around 70 of its 131 airbases and airstrips were accurately placed with the available models. [1]" }
  - { topic: "ATC frequencies", text: "All airbase ATC frequencies are UHF only, to avoid splitting every frequency between VHF and UHF; towers keep an old VHF placeholder that pilots are told to ignore, and only the ATIS is on VHF. [3]" }
  - { topic: "Approach and departure", text: "Approach and departure share one frequency at every airbase, although the ATC menu has separate pages for each. [3]" }
  - { topic: "Read-back", text: "There is no mandatory read-back of instructions; AI controllers often give the next instruction straight away, so a read-back is likely to be stepped on. [3]" }
  - { topic: "Navaids", text: "BMS models only TACANs and ILS. Real civil VOR-DMEs appear as TACANs, and unlike in real life no ILS has its own DME: distance in TCN/ILS mode is to the TACAN, which can be 1 or 2 nm or more from the runway threshold. [3]" }
purchase:
  - sim: bms
    product: "Falcon BMS, with this add-on theatre"
    by: "Benchmark Sims and the theatre team"
    free: "Free, but Falcon BMS only installs over a bought copy of Falcon 4.0; the theatre is a free add-on"
    links:
      - { store: "Falcon BMS", url: "https://www.falcon-bms.com/" }
      - { store: "Falcon 4.0 on Steam", url: "https://store.steampowered.com/app/429530/" }
      - { store: "Falcon Collection on GOG", url: "https://www.gog.com/en/game/falcon_collection" }
sources:
  - n: 1
    title: "Israel Theater Of Operations v1.08.1.1"
    publisher: "Falcon BMS forum (release announcement)"
    url: "https://forum.falcon-bms.com/topic/30861"
    accessed: "2026-10-28"
  - n: 2
    title: "BMS 4.38 Theater List"
    publisher: "Falcon BMS forum (official list of add-on theatres)"
    url: "https://forum.falcon-bms.com/topic/30687"
    accessed: "2026-10-28"
  - n: 3
    title: "BMS Comms & Nav Book 4.38.1"
    publisher: "Benchmark Sims (official documentation)"
    url: "https://cdn.falcon-bms.com/docs/4.38/BMS-Comms-Nav-Book.pdf"
    accessed: "2026-10-28"
    note: "Sections 1.1 (Airbase comm plan) and 1.3.5 (Departure), the read-back rules, and the navigation chapters on tacans and ILS."
---

## Coverage

Israel Theater of Operations (ITO) is one of the official Falcon BMS theatres, installed separately from the base game. [[2]](#source-2) Its new terrain moved the map about 200 km north of earlier Israeli theatres and added 131 airbases and airstrips. Versions 1.08.1 and 1.08.1.1, for BMS 4.38.1, improved the hardened aircraft shelters at Israeli bases such as Ramat David and Hatzerim and added a dedicated F-35I Adir. Its objectives include Israeli ports, naval bases, refineries and power plants, and Syrian power plants. Six campaigns were converted from earlier versions. [[1]](#source-1)
