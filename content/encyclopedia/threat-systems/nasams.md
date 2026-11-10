---
group: sam-western
nato: NASAMS
short: NASAMS
designation: National Advanced Surface-to-Air Missile System
role: Networked short-to-medium-range surface-to-air missile system [1]
inService: "Initial capability 1994–1995; fully fielded 1998; NASAMS 2 operational 2007, NASAMS 3 deployed 2019 [1]"
guidance: "AIM-120 AMRAAM: inertial mid-course, then active radar homing; NASAMS 3 adds the infrared AIM-9X [1]"
seeker: radar
mobility: "Towed six-round launchers; trailer-mounted radar; a HMMWV-based launcher is also used [1]"
envelope:
  basis: "NASAMS 2 with AMRAAM: 40 km range and 21 km altitude in the source's infobox; the body gives the standard AMRAAM up to 25 km horizontally [1]. NASAMS 3 with AMRAAM-ER reaches 60 km [1]."
  minRangeKm: null
  maxRangeKm: 40
  minAltM: null
  maxAltM: 21000
  cite: [1]
radars:
  - { name: "AN/MPQ-64F1 Improved Sentinel", role: "3D search and track radar; 120 km track range (NASAMS 2)", band: "X" }
  - { name: "MSP500 electro-optical sensor", role: "Laser rangefinder, TV and thermal camera; lets missiles be fired passively" }
radarsCite: [1]
rwr:
  - { symbol: "NS", emitter: "NASAMS AN/MPQ-64 Sentinel search radar" }
battery:
  cite: [1]
  pattern: group
  items:
    - { kind: command, label: "Fire Distribution Center", count: 1 }
    - { kind: radar, label: "AN/MPQ-64F1 Improved Sentinel radar", count: 1 }
    - { kind: radar, label: "MSP500 electro-optical sensor vehicle", count: 1 }
    - { kind: launcher, label: "Launchers, six AMRAAMs each", count: 3, missiles: 6 }
photo:
  src: "encyclopedia/threat-systems/nasams.jpg"
  width: 1280
  height: 852
  alt: "A boxy six-canister missile launcher raised on a trailer in deep snow, with two soldiers standing beside it."
  caption: "A Norwegian NASAMS launcher in winter, 22 April 2010."
  author: "Soldatnytt (Norwegian Armed Forces magazine)"
  date: "22 April 2010"
  licence: "CC BY 2.0"
  licenceUrl: "https://creativecommons.org/licenses/by/2.0"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Norwegian_Advanced_Surface_to_Air_Missile_System.jpg"
  accessed: "2026-11-10"
sources:
  - n: 1
    title: "NASAMS"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/NASAMS"
    accessed: "2026-11-10"
  - n: 2
    title: "DCS: F-14 Tomcat manual, AN/ALR-67 radar warning receiver"
    publisher: "Heatblur Simulations"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-11-10"
  - n: 3
    title: "DCS: F-16C Viper Early Access Guide (English)"
    publisher: "Eagle Dynamics"
    url: "https://www.digitalcombatsimulator.com/en/downloads/documentation/"
    accessed: "2026-11-05"
    note: "Appendix C, HAD threat classes, pp. 753–754, as tabulated on the F-16 HARM threat tables record. A sim manual: it describes the DCS F-16C, not the real aircraft."
---

## Overview

NASAMS was developed by Kongsberg of Norway and RTX of the United States, and was the first system to launch the [AIM-120 AMRAAM](record:aim-120) air-to-air missile from the ground. [[1]](#source-1) It replaced the Hawk missile in Norway's earlier system with AMRAAM and a rotating AN/MPQ-64 Sentinel radar, reaching initial capability in 1994–1995. [[1]](#source-1) NASAMS 2 added Link 16 in 2007; NASAMS 3, deployed in 2019, also fires the AIM-9X Sidewinder and the extended-range AMRAAM-ER. [[1]](#source-1) It defends against drones, helicopters, cruise missiles and aircraft. [[1]](#source-1)

## The fire unit

A NASAMS 2 battery has up to four firing units. Each has three launchers with six AMRAAMs, one Improved Sentinel radar, one Fire Distribution Center and one electro-optical sensor vehicle; Figure 3 shows one firing unit. [[1]](#source-1) Fire Distribution Centers network with each other and with distributed sensors to build a shared air picture, and can detach from the radars to be harder to find. [[1]](#source-1) The electro-optical sensor lets the system fire without radiating. [[1]](#source-1)

## How it engages

An AMRAAM fired from the ground flies on inertial guidance with updates, then homes on its own active radar, the same as when fired from a fighter. [[1]](#source-1) Because the launchers, radar and sensors are spread out and linked, the radar a warning receiver detects may not be where the missile comes from.

## Envelope

The source's infobox gives NASAMS 2 with AMRAAM 40 km (22 NM) and 21 km (69,000 ft), and NASAMS 3 with AMRAAM-ER 60 km; its text gives the standard AMRAAM up to 25 km horizontally, or “over 15 km”. [[1]](#source-1) Figure 1 draws the infobox's NASAMS 2 figures; no minimums are given, so those edges are dashed.

## On the radar warning receiver

In the DCS [F-14](record:f-14), the AN/ALR-67 shows the Sentinel radar as **NS**. [[2]](#source-2) In the DCS F-16C, the HARM targeting pod shows NASAMS 2 as **NS** in threat class 6. [[3]](#source-3) See the [F-16 HARM threat tables](record:f-16-harm-threat-tables).

## History

NASAMS has guarded the airspace around Washington, D.C., including the White House area. [[1]](#source-1) Ukraine received its first batteries in November 2022; the Pentagon said they had a 100% success rate against Russian missiles on 15 November 2022. [[1]](#source-1) Norway and the United States have since sent more. [[1]](#source-1)
