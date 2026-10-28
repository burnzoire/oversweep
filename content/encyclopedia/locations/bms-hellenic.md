---
kind: map
sim: bms
short: Hellenic
name: "Falcon BMS: Hellenic"
publisher: "HTO team (Malc, Manos and Mystic), as an official add-on theatre"
setting: { era: modern, text: "No period is stated; its forces are modern, such as Hellenic Air Force F-16C Block 30s that carry SPICE 1000 and 2000 guided bombs in the air-to-ground role [1]" }
area: "Greece, Turkey and the Aegean, with airfields from Souda and Kasteli on Crete to Çorlu and Balıkesir, and neighbouring fields such as Bezmer, Krumovo, Kukës, Kuçova and Ohrid [1]"
theatres: [europe]
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
    title: "[Released] Hellenic Theater Operations - HTO v1.0.3"
    publisher: "Falcon BMS forum (release announcement)"
    url: "https://forum.falcon-bms.com/topic/32506"
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

Hellenic Theater Operations (HTO) is one of the official Falcon BMS theatres, installed separately from the base game. [[2]](#source-2) Version 1.0.3, for BMS 4.38.1.1, lists work on Greek airfields such as Souda, Kasteli, Kozani, Kastoria and Almyros, Turkish ones such as Çorlu, Balıkesir, Uşak and Yenişehir, and fields in neighbouring countries such as Bezmer, Krumovo, Kukës, Kuçova and Ohrid. Some airbases are fully rendered with physically based materials, and it adds Greek liveries for the AH-64, OH-58 and P-3C. [[1]](#source-1)
