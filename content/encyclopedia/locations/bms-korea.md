---
kind: map
mapView:
  bounds: [[33, 124], [43, 132]]
sim: bms
short: Korea
name: "Falcon BMS: Korea"
publisher: "Benchmark Sims"
setting: { era: modern, text: "A full-scale modern war on the Korean Peninsula; Falcon 4.0's campaign began with a North Korean invasion in the early 1990s [2], and BMS describes its setting as a 2000 warfare era [1]" }
area: "The Korean Peninsula, with an airbase in Japan [2]"
theatres: [east-asia-pacific]
differences:
  - { topic: "ATC frequencies", text: "All airbase ATC frequencies are UHF only, to avoid splitting every frequency between VHF and UHF; towers keep an old VHF placeholder that pilots are told to ignore, and only the ATIS is on VHF. [3]" }
  - { topic: "Approach and departure", text: "Approach and departure share one frequency at every airbase, although the ATC menu has separate pages for each. [3]" }
  - { topic: "Read-back", text: "There is no mandatory read-back of instructions; AI controllers often give the next instruction straight away, so a read-back is likely to be stepped on. [3]" }
  - { topic: "Navaids", text: "BMS models only TACANs and ILS. Real civil VOR-DMEs appear as TACANs, and unlike in real life no ILS has its own DME: distance in TCN/ILS mode is to the TACAN, which can be 1 or 2 nm or more from the runway threshold. [3]" }
  - { topic: "TACAN data", text: "BMS TACAN channels and ranges match real-world data, but the work began in the Falcon SP days, so stations changed since then may differ. [3]" }
purchase:
  - sim: bms
    product: "Falcon BMS"
    by: "Benchmark Sims"
    free: "Free, but Falcon BMS only installs over a bought copy of Falcon 4.0"
    links:
      - { store: "Falcon BMS", url: "https://www.falcon-bms.com/" }
      - { store: "Falcon 4.0 on Steam", url: "https://store.steampowered.com/app/429530/" }
      - { store: "Falcon Collection on GOG", url: "https://www.gog.com/en/game/falcon_collection" }
sources:
  - n: 1
    title: "Falcon BMS"
    publisher: "Benchmark Sims (project home page)"
    url: "https://www.falcon-bms.com/"
    accessed: "2026-10-28"
  - n: 2
    title: "Falcon 4.0"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Falcon_4.0"
    accessed: "2026-10-28"
  - n: 3
    title: "BMS Comms & Nav Book 4.38.1"
    publisher: "Benchmark Sims (official documentation)"
    url: "https://cdn.falcon-bms.com/docs/4.38/BMS-Comms-Nav-Book.pdf"
    accessed: "2026-10-28"
    note: "Sections 1.1 (Airbase comm plan) and 1.3.5 (Departure), the read-back rules, and the navigation chapters on tacans and ILS."
---

## Coverage

Falcon BMS is a free, standalone mod of Falcon 4.0, the 1998 F-16 simulation whose dynamic campaign is a full-scale war on the Korean Peninsula. [[1]](#source-1) [[2]](#source-2) In Falcon 4.0's story North Korea invades the South in the early 1990s and the United States reinforces the South; Japan has an airbase but plays no part in the war. [[2]](#source-2) BMS describes its F-16s, avionics and weapons as set in a 2000 warfare era. [[1]](#source-1)
