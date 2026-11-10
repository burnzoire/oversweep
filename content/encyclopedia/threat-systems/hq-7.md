---
group: sam-chinese
nato: CH-SA-4
short: HQ-7
designation: HQ-7 (Hongqi-7), export FM-80 and FM-90
role: Chinese short-range surface-to-air missile system, reverse-engineered from the French Crotale [1]
inService: "Early 1980s [1]"
guidance: "Command guidance (HQ-7A); the source lists infrared homing for a later version [1]"
seeker: radar
mobility: "Transporter-erector-launchers with four or eight missiles; naval HHQ-7 on ships [1]"
envelope:
  basis: "8 km slant range against a fast target, 15 km against a slow one [1]. No altitude limits are given, so only the range is drawn."
  minRangeKm: null
  maxRangeKm: 15
  minAltM: null
  maxAltM: null
  cite: [1]
radars:
  - { name: "Short-range radar", role: "One per battery, serving three launchers" }
radarsCite: [1]
rwr:
  - { symbol: "7", emitter: "HQ-7 track radar" }
  - { symbol: "HQ", emitter: "HQ-7 search radar" }
battery:
  cite: [1]
  pattern: group
  items:
    - { kind: radar, label: "Short-range radar", count: 1 }
    - { kind: launcher, label: "Launchers, four or eight missiles each", count: 3, missiles: 4 }
photo:
  src: "encyclopedia/threat-systems/hq-7.jpg"
  width: 1280
  height: 809
  alt: "A six-wheeled armoured vehicle with a turret carrying a round radar dish between two pairs of missile tubes, on parade."
  caption: "A Bangladesh Air Force FM-90, the export HQ-7B, on parade, 15 December 2016."
  author: "Shadman Samee"
  date: "15 December 2016"
  licence: "CC BY-SA 2.0"
  licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Bangladesh_Air_Force_FM-90_Crotale_SAM_(31545368571).jpg"
  accessed: "2026-11-10"
sources:
  - n: 1
    title: "HQ-7"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/HQ-7"
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

The HQ-7 (Hongqi-7, “Red Banner-7”) is a Chinese short-range surface-to-air missile, with the reporting name **CH-SA-4**. [[1]](#source-1) It was reverse-engineered from the French R440 [Crotale](record:crotale) and entered service in the early 1980s. [[1]](#source-1) The original command-guided version is the HQ-7A and the improved one the HQ-7B; they are exported as the FM-80 and FM-90, and the HHQ-7 is the naval version. [[1]](#source-1)

## How it engages

A ground battery has one short-range radar and three launchers, each with four or eight missiles; Figure 3 shows a battery with four-missile launchers. [[1]](#source-1) As with the Crotale, the missile is steered by commands from the ground. [[1]](#source-1) The source gives no further detail of its radars.

## Envelope

The source gives a slant range of 8 km (4.3 NM) against a fast target and 15 km (8.1 NM) against a slow one. [[1]](#source-1) It gives no altitude limits, so Figure 1 draws the 15 km range only; against a fast jet, expect the shorter figure.

## On the radar warning receiver

In the DCS [F-14](record:f-14), the AN/ALR-67 shows the HQ-7's track radar as **7** and its search radar as **HQ**. [[2]](#source-2) In the DCS F-16C, the HARM targeting pod shows the HQ-7 Type 345 radar as **7** and the ACU as **HQ**, both in threat class 1. [[3]](#source-3) See the [F-16 HARM threat tables](record:f-16-harm-threat-tables).

## Operators

China operates the HQ-7A, HQ-7B and HHQ-7. Exports include Algeria, Bangladesh, Pakistan and Turkmenistan (FM-90) and Iran (FM-80), which also makes a mobile version and an unlicensed copy. [[1]](#source-1)
