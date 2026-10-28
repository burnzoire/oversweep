---
kind: map
sim: bms
short: Falklands
name: "Falcon BMS: Falklands"
publisher: "Falcon BMS community (released by Ranger822), as an official add-on theatre"
setting: { era: modern, text: "No period is stated; its aircraft range from the Canberra, Buccaneer and Super Étendard to F-16s in Argentine markings and a retro-version Eurofighter [1]" }
area: "East and West Falkland, including RAF Mount Pleasant [1]"
theatres: [south-atlantic]
differences:
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
    title: "Falklands Add-On"
    publisher: "Falcon BMS forum (release announcement)"
    url: "https://forum.falcon-bms.com/topic/33296"
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

The Falklands theatre, for Falcon BMS 4.38.1, is marked official on the BMS theatre list. [[2]](#source-2) It comes with 4K photographic terrain tiles, and a 16K set is available separately; with procedural vegetation turned off it gives the sparse cover of East and West Falkland most faithfully. A planned update is to improve the Canberra, Buccaneer and Argentine F-16, add a late-model Super Étendard in Argentine markings and fix the Harrier GR.9's flight model for ski-jump take-offs. [[1]](#source-1)
