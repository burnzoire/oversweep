---
nato: SA-5 Gammon
designation: S-200
role: Long-range, high-altitude strategic air defence [1]
inService: "S-200A Angara 1967; S-200V Vega 1970 [1]"
guidance: "Square Pair radar tracks and illuminates the target; semi-active homing (unverified here; see text)"
seeker: radar
mobility: "Battalions of six launchers and a fire-control radar [1]"
envelope:
  basis: "S-200V Vega (SA-5b): range 250 km, ceiling 29.2 km [1]. No minimum range or altitude for this variant in the cited source."
  minRangeKm: null
  maxRangeKm: 250
  minAltM: null
  maxAltM: 29200
  cite: [1]
radars:
  - { name: "5N62", nato: "Square Pair", role: "Continuous-wave target tracking and illumination", band: "H" }
  - { name: "P-14 / 5N84A", nato: "Tall King C", role: "Early warning", band: "A" }
  - { name: "PRV-17", nato: "Odd Group", role: "Height finder" }
  - { name: "P-35", nato: "Bar Lock", role: "Associated search radar", band: "E/F" }
radarsCite: [1]
rwr:
  - { symbol: "5", emitter: "SA-5 Gammon Square Pair track radar" }
  - { symbol: "FF", emitter: "SA-2, SA-3 and SA-5 Flat Face search radar (S-125 P-19)" }
  - { symbol: "TS", emitter: "SA-5 Tin Shield search radar" }
battery:
  cite: [1]
  pattern: group
  items:
    - { kind: radar, label: "5N62 Square Pair", count: 1 }
    - { kind: launcher, label: "launchers", count: 6, missiles: 1 }
photo:
  src: "encyclopedia/threat-systems/sa-5.jpg"
  width: 1280
  height: 940
  alt: "Painting of an SA-5 missile raised on its trainable launcher on a concrete pad, with earth berms around it and smoke across the sky."
  caption: "A Defense Intelligence Agency painting, not a photograph, of an SA-5 on its launcher, from the DIA's 1980s series on Soviet arms supplied to Libya. No public-domain photo of an SA-5 site was found."
  author: "Ronald C. Wittmann, Defense Intelligence Agency"
  date: "1986"
  licence: "Public domain, work of the US federal government"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:SA-5s_in_Libya_(in_better_quality).jpg"
  accessed: "2026-10-25"
sources:
  - n: 1
    title: "S-200 (missile)"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/S-200_(missile)"
    accessed: "2026-10-25"
  - n: 2
    title: "DCS: F-14 Tomcat manual, AN/ALR-67 radar warning receiver"
    publisher: "Heatblur Simulations"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-10-25"
---

## Overview

The S-200, NATO reporting name **SA-5 Gammon** (first reported as "Tallinn"), is a long-range, high-altitude SAM system developed by the Soviet Union in the 1960s. The Soviets deployed it mainly at battalion level: six launchers and a fire-control radar. [[1]](#source-1)

## Variants and reach

| Variant | Introduced | Range | Ceiling |
| --- | --- | --- | --- |
| S-200A Angara (SA-5a) | 1967 | 160 km (86 NM) | 20.1 km (66,000 ft) |
| S-200V Vega (SA-5b) | 1970 | 250 km (135 NM) | 29.2 km (95,800 ft) |
| S-200V with V-870 missile | — | 280 km (151 NM) | 40 km (131,000 ft) |
| S-200M Vega-M | — | 300 km (162 NM) | 29 km (95,100 ft) |
| S-200D Dubna (SA-5c) | — | 300 km (162 NM) | 40 km (131,000 ft) |

Source: [[1]](#source-1). Figure 1 uses the S-200V. The export 5V28E missile carries a 217 kg high-explosive fragmentation warhead with 90 kg of explosive; the 5V28N and 5V28MN were the only nuclear-armed variants, the latter with a 5 kt yield. [[1]](#source-1)

## How it engages

The 5N62 **Square Pair** is an H-band continuous-wave radar that both tracks targets and illuminates them. [Early warning](term:early-warning) comes from the A-band P-14 **Tall King C**, height finding from the PRV-17 **Odd Group**, and the E/F-band P-35 **Bar Lock** is also associated with the system. [[1]](#source-1)

**Unverified here:** that the missile homes semi-actively on the Square Pair's illumination. It follows from the radar's role, but the source text reviewed for this revision does not state the guidance law.

## On the radar warning receiver

In the DCS F-14, the AN/ALR-67 shows the Square Pair track radar as **5**, and lists two search radars with the SA-5: the Flat Face (**FF**, also used with the [SA-2](record:sa-2) and [SA-3](record:sa-3)) and the Tin Shield (**TS**). [[2]](#source-2) Neither search radar is in the S-200 radar list above, which comes from [[1]](#source-1).

## History

Libya received S-200 systems from 1985 and later fired them at US aircraft without hitting them. On 4 October 2001, a Ukrainian S-200 destroyed Siberia Airlines Flight 1812, a Tu-154, over the Black Sea, killing all 78 people aboard. Syrian S-200s shot down an Israeli F-16I on 10 February 2018 and, on 17 September 2018, a Russian Il-20M, killing all 15 aboard. [[1]](#source-1)
