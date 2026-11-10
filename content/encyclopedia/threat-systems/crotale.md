---
group: sam-western
nato: Crotale
short: Crotale
designation: Crotale (R440) and Crotale NG (VT-1)
role: French all-weather short-range surface-to-air missile system [1]
inService: "Developed for South Africa (as Cactus), delivered 1971–1973; then French air force and navy; Crotale NG in production from 1990 [1]"
guidance: "Automatic command to line of sight, with radar and infrared tracking of target and missile [1]"
seeker: radar
mobility: "Wheeled four-missile launch vehicles with a separate surveillance radar vehicle; Crotale NG puts launcher and radar on one vehicle [1]"
envelope:
  basis: "Crotale NG with the VT-1 missile: 11 km range and 6,000 m ceiling; later Mk3 tests reached 15 km [1]. The source gives no envelope for the original R440."
  minRangeKm: null
  maxRangeKm: 11
  minAltM: null
  maxAltM: 6000
  cite: [1]
radars:
  - { name: "Surveillance radar", role: "On a separate vehicle in the original system; 20 km" }
  - { name: "Fire direction (tracking) radar", role: "Between the launchers; tracks target and missile, 20 km; with a TV and infrared channel to 15 km" }
radarsCite: [1]
rwr: []
rwrNote: "The cited AN/ALR-67 threat table has no Crotale entry. It lists the Chinese HQ-7, a copy of the R440 Crotale, as 7 (track radar) and HQ (search radar); see the HQ-7 page."
photo:
  src: "encyclopedia/threat-systems/crotale.jpg"
  width: 1280
  height: 960
  alt: "A Crotale NG turret with a round tracking radar in the centre and four missile tubes on each side, a radar antenna on top."
  caption: "A Crotale NG launcher, 20 June 2007."
  author: "David Monniaux"
  date: "20 June 2007"
  licence: "CC BY-SA 3.0"
  licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Crotale_NG_P1220851.jpg"
  accessed: "2026-11-10"
sources:
  - n: 1
    title: "Crotale (missile)"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Crotale_(missile)"
    accessed: "2026-11-10"
  - n: 2
    title: "DCS: F-14 Tomcat manual, AN/ALR-67 radar warning receiver"
    publisher: "Heatblur Simulations"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-11-10"
---

## Overview

Crotale is a French all-weather short-range air defence system, built against aircraft, helicopters, drones and cruise or anti-ship missiles. It has land and naval versions. [[1]](#source-1) The original R440 system was developed for South Africa, where it was called Cactus, and France then bought it for its air force and navy. [[1]](#source-1) Saudi Arabia adopted a version on the AMX-30 tank chassis as Shahine. [[1]](#source-1) China reverse-engineered the R440 as the [HQ-7](record:hq-7). [[1]](#source-1)

## How it engages

A surveillance radar, on its own vehicle in the original system, can feed several launch vehicles. Each launch vehicle carries the missiles and a fire direction radar between them. [[1]](#source-1) Both radars reach 20 km, and a TV channel with normal and infrared cameras works to 15 km; the system can follow eight targets. [[1]](#source-1) The missile is steered onto the line of sight by commands from the launcher and is set off by an infrared [proximity fuze](term:proximity-fuze). The R440 reaches Mach 2.3 in two seconds. [[1]](#source-1)

The Crotale NG, in production from 1990, puts the search radar and launcher on one vehicle and fires the VT-1 missile: Mach 3.5, 35 g, 11 km range, 6,000 m ceiling and a 13 kg warhead with an 8 m kill zone. [[1]](#source-1)

## Envelope

Figure 1 draws the Crotale NG's VT-1: 11 km (5.9 NM) and 6,000 m (19,700 ft). [[1]](#source-1) In 2008 tests the Mk3 system intercepted drones at 8 km and 970 m, and at 15 km and 500 m. [[1]](#source-1) The source gives no envelope for the original R440 and no minimums, so those edges are dashed.

## On the radar warning receiver

The DCS [F-14](record:f-14)'s AN/ALR-67 table has no Crotale entry; it lists the Chinese copy, the HQ-7, as **7** for its track radar and **HQ** for its search radar. [[2]](#source-2) Whether a real warning receiver labels a Crotale like an HQ-7 depends on its threat library.

## Operators

The source lists combat use in the Chadian–Libyan conflict and the South African Border War, and Ukraine operates two batteries. [[1]](#source-1) Libya received Crotale from 1973. [[1]](#source-1)
