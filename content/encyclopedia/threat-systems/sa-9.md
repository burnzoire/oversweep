---
nato: SA-9 Gaskin
designation: 9K31 Strela-1
role: Mobile short-range, low-altitude infrared SAM [1]
inService: "9M31 accepted after 1968 trials; 9M31M (SA-9B) 1970 [1]"
guidance: "Passive infrared homing with a photocontrast seeker [1] [2]"
seeker: infrared
mobility: "BRDM-2 scout-car chassis; 100 km/h on roads, 10 km/h swimming [1]"
envelope:
  basis: "Range 800 m–6.5 km (Western sources) [1]; 6.5 km and a 10 m minimum altitude in the 1998 Army handout [2]. No ceiling in the cited sources."
  minRangeKm: 0.8
  maxRangeKm: 6.5
  minAltM: 10
  maxAltM: null
  cite: [1, 2]
radars:
  - { name: "9S16", nato: "Flat Box", role: "Passive detector: emits nothing, senses aircraft emissions in all directions (one vehicle per platoon)" }
radarsCite: [1]
rwr: []
rwrNote: "The missile homes on infrared and the Flat Box detector is passive, so nothing in the system transmits for a radar warning receiver to detect."
battery:
  cite: [1, 2]
  pattern: group
  items:
    - { kind: launcher, label: "BRDM-2-based launcher", count: 1, missiles: 4 }
sources:
  - n: 1
    title: "9K31 Strela-1"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/9K31_Strela-1"
    accessed: "2026-10-25"
  - n: 2
    title: "Heavy/Light Opposing Forces Organization and Equipment (student handout, file 4G 3017-6)"
    publisher: "US Army Aviation Center, Fort Rucker"
    date: "January 1998"
    url: "https://man.fas.org/dod-101/sys/land/row/avoac-opfor-sh.htm"
    accessed: "2026-10-25"
---

## Overview

The 9K31 Strela-1, NATO reporting name **SA-9 Gaskin**, is a highly mobile, short-range, low-altitude infrared-guided SAM on a BRDM-2 scout car. The 9M31 missile was accepted after state trials in 1968 and the 9M31M Strela-1M (SA-9B) entered service in 1970. [[1]](#source-1)

## The vehicle

The BRDM-2's turret is replaced by four launcher boxes [[2]](#source-2) holding four ready-to-fire missiles, and typical tactics fire two at each target. [[1]](#source-1) One launcher per platoon carries the 9S16 **Flat Box**: four passive sensors covering 360° that emit nothing and detect aircraft emissions, to warn the crew and help them find the target optically. [[1]](#source-1)

## How it engages

The seeker is an uncooled lead sulphide (PbS) detector using **photocontrast** homing: it tracks the shadow a target makes against the sky's background radiation. That only works against clear sky or solid overcast, at least 20° from the sun and at least 2° above the horizon. [[1]](#source-1) The Army handout lists passive infrared guidance and rear aspect. [[2]](#source-2) The missile can engage targets receding at up to 220 m/s or approaching at up to 310 m/s. Its warhead is primarily a direct-hit design with contact and magnetic fuzes and a backup optical proximity fuze; the 9M31M raised it from 2.6 to 3 kg. [[1]](#source-1)

## Envelope

Russian sources give a reliable kill zone of 900 m to 4.2 km for the original 9M31; Western and some Russian sources give 800 m to 6.5 km, and Western claims of up to 8 km for the 9M31M are probably too high. [[1]](#source-1) The 1998 Army handout gives 6.5 km and a 10 m minimum engagement altitude. [[2]](#source-2) Neither source gives a ceiling, so Figure 1 draws the SA-9's range along the ground only.

## On the radar warning receiver

Nothing. The missile is infrared-guided and the Flat Box only listens, so a radar warning receiver has nothing to detect. Your own emissions, though, are what the Flat Box listens for. [[1]](#source-1)
