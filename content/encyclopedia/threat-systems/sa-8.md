---
nato: SA-8 Gecko
designation: 9K33 Osa
role: Self-contained short-range SAM vehicle [1]
inService: "1971 (fielded 1972) [1]"
guidance: "Command guidance for the whole flight [1] [2]"
seeker: radar
mobility: "Six-wheeled, amphibious and air-transportable; 80 km/h on roads, 8 km/h swimming [1]"
envelope:
  basis: "9M33M2 missile (Osa-AK): 1.5–10 km range, 25–5,000 m altitude [1]."
  minRangeKm: 1.5
  maxRangeKm: 10
  minAltM: 25
  maxAltM: 5000
  cite: [1]
radars:
  - { name: "1S51M3", nato: "Land Roll", role: "On the launcher: acquisition (C band), tracking (H band) and two fire-control radars (J band)" }
  - { name: "P-40", nato: "Long Track", role: "Separate early-warning vehicle", band: "E" }
  - { name: "PRV-9 / PRV-16", nato: "Thin Skin", role: "Separate height finder", band: "E" }
rwr:
  - { symbol: "8", emitter: "SA-8 Gecko search and track radar (Osa)" }
battery:
  pattern: group
  items:
    - { kind: launcher, label: "TELARs with Land Roll radar (Osa-AK)", count: 4, missiles: 6 }
    - { kind: reload, label: "reload vehicles, 18 missiles between them", count: 2 }
sources:
  - n: 1
    title: "9K33 Osa"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/9K33_Osa"
    accessed: "2026-10-25"
  - n: 2
    title: "Heavy/Light Opposing Forces Organization and Equipment (student handout, file 4G 3017-6)"
    publisher: "US Army Aviation Center, Fort Rucker"
    date: "January 1998"
    url: "https://man.fas.org/dod-101/sys/land/row/avoac-opfor-sh.htm"
    accessed: "2026-10-25"
  - n: 3
    title: "DCS: F-14 Tomcat manual, AN/ALR-67 radar warning receiver"
    publisher: "Heatblur Simulations"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-10-25"
---

## Overview

The 9K33 Osa, NATO reporting name **SA-8 Gecko**, entered service in 1971 and was fielded in 1972; the naval version is the SA-N-4. [[1]](#source-1) Each vehicle carries its own radars and missiles, so a single vehicle can find, track and engage a target.

## The vehicle

The 9A33 transporter-erector-launcher-and-radar (TELAR) rides on a six-wheeled BAZ-5937 chassis that is fully amphibious and air-transportable. [[1]](#source-1) Its 1S51M3 **Land Roll** radar combines a C-band acquisition radar, an H-band tracking radar and two J-band fire-control radars. The original Osa carries four exposed missiles; the Osa-AK and Osa-AKM carry six in boxes. A battery has four TELARs and two reload vehicles carrying 18 missiles. [[1]](#source-1) The Army handout describes the SA-8a's missiles mounted in two pairs either side of the Land Roll pedestal, and the SA-8b's two sets of three launcher boxes. [[2]](#source-2)

## How it engages

The missile is command guided for its whole flight. [[1]](#source-1) [[2]](#source-2) From detection to launch takes about 26 seconds. The missile reaches about Mach 2.4, peaking near Mach 3; the 9M33 and 9M33M2 carry a 19 kg warhead. [[1]](#source-1)

## Envelope

| Missile | Range | Altitude |
| --- | --- | --- |
| Early versions | about 2–9 km (1.1–4.9 NM) | 50–5,000 m (160–16,400 ft) |
| 9M33M2 (Osa-AK) | 1.5–10 km (0.8–5.4 NM) | 25–5,000 m (80–16,400 ft) |
| 9M33M3 (Osa-AKM) | about 15 km (8.1 NM) | 10–12,000 m (30–39,400 ft) |

Source: [[1]](#source-1). The 1998 Army handout gives 12 km for the SA-8a and 15 km for the SA-8b, both with a 10 m minimum engagement altitude. [[2]](#source-2) Figure 1 uses the 9M33M2, the only version with all four limits in the cited source.

## On the radar warning receiver

In the DCS F-14, the AN/ALR-67 shows the Land Roll search and track radar as **8**. [[3]](#source-3)

## History

An SA-8 shot down an Israeli F-4 over Lebanon on 24 July 1982. On 3 October 1987, at the Battle of Cuito Cuanavale, a South African unit captured an intact Osa. Iraq fielded the system in the 1991 Gulf War. [[1]](#source-1)
