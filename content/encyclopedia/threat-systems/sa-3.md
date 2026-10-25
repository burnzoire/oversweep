---
nato: SA-3 Goa
designation: S-125 Neva/Pechora
role: Short-range SAM system [1]
inService: "1961 [1]"
guidance: Radio command guidance, like the S-75 [1]
seeker: radar
mobility: "Fixed turrets; missiles can also be carried ready to fire in pairs on trucks [1]"
envelope:
  basis: "V-601 (5V27) missile, figures the S-125 article attributes to other sources: 2.5–22 km range, 20 m–14 km altitude [1]."
  minRangeKm: 2.5
  maxRangeKm: 22
  minAltM: 20
  maxAltM: 14000
  cite: [1]
radars:
  - { name: "SNR-125", nato: "Low Blow", role: "Tracking, fire control and guidance; 40 km, 80 km in a second mode", band: "I/D" }
  - { name: "P-15", nato: "Flat Face", role: "Target acquisition, 250 km", band: "C" }
  - { name: "P-15M(2)", nato: "Squat Eye", role: "Target acquisition (P-15 variant)", band: "C" }
  - { name: "PRV-11", nato: "Side Net", role: "Height finder" }
radarsCite: [1]
battery:
  cite: [1]
  pattern: group
  items:
    - { kind: radar, label: "SNR-125 Low Blow", count: 1 }
    - { kind: launcher, label: "two-missile turret", count: 1, missiles: 2 }
    - { kind: launcher, label: "four-missile turret", count: 1, missiles: 4 }
rwr:
  - { symbol: "3", emitter: "SA-3 Goa Low Blow track radar (S-125)" }
  - { symbol: "FF", emitter: "SA-2, SA-3 and SA-5 Flat Face search radar (S-125 P-19)" }
sources:
  - n: 1
    title: "S-125 Neva/Pechora"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/S-125_Neva/Pechora"
    accessed: "2026-10-25"
  - n: 2
    title: "DCS: F-14 Tomcat manual, AN/ALR-67 radar warning receiver"
    publisher: "Heatblur Simulations"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-10-25"
---

## Overview

The S-125 Neva/Pechora, NATO reporting name **SA-3 Goa**, is a Soviet SAM system in service since 1961. [[1]](#source-1)

## The site

Missiles are typically deployed on fixed turrets holding two or four, but can also be carried ready to fire in pairs on ZIL trucks. [[1]](#source-1) Figure 3 shows both turret types; the cited text does not give the number of launchers per battery. The SNR-125 **Low Blow** radar tracks the target and guides the missiles: a 250 kW I/D-band radar with a 40 km range, or 80 km in a second mode. Targets are acquired by the 380 kW C-band P-15 **Flat Face** (250 km) or its P-15M(2) **Squat Eye** variant, with a PRV-11 **Side Net** height finder. [[1]](#source-1)

## How it engages

Like the S-75, the S-125 uses radio command guidance. [[1]](#source-1) The first missile, the V-600 (5V24), reaches about Mach 3 to 3.5, has a range of about 15 km and carries a 60 kg high-explosive warhead. The later V-601 (5V27) carries a 70 kg warhead. [[1]](#source-1)

## Envelope

Published V-601 figures vary. The S-125 article gives intercept altitudes of 100 m to 18 km and a range of 3.5 to 35 km with the Pechora-2A upgrade, and notes that other sources give 2.5 to 22 km and 20 m to 14 km. [[1]](#source-1) Figure 1 uses the second, smaller set: 1.3–11.9 NM and 70 to 45,900 ft.

## On the radar warning receiver

In the DCS F-14, the AN/ALR-67 shows the Low Blow track radar as **3** and the Flat Face search radar as **FF**; the table identifies that radar as the P-19 used with the S-125. [[2]](#source-2) A Flat Face alone does not tell you which of the SA-2, SA-3 or SA-5 it is working with.

## History

An S-125 shot down a USAF F-16 south of Baghdad on 19 January 1991. On 27 March 1999, during the Kosovo War, a Yugoslav S-125 battery shot down an F-117 Nighthawk, the only recorded downing of a stealth aircraft. [[1]](#source-1)
