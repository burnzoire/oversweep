---
nato: SA-6 Gainful
designation: 2K12 Kub
role: Mobile army air defence battery [1]
inService: "Accepted 23 January 1967 [1]"
guidance: "Command guidance with terminal semi-active radar homing [1]"
seeker: radar
mobility: "Tracked launchers and radar vehicle [1]"
envelope:
  basis: "Missile effective range 4–24 km and altitude 50 m–14 km [1]; the 1998 Army handout gives 24 km and a 50 m minimum [2]."
  minRangeKm: 4
  maxRangeKm: 24
  minAltM: 50
  maxAltM: 14000
  cite: [1, 2]
radars:
  - { name: "1S91", nato: "Straight Flush", role: "Acquisition (75 km), tracking, continuous-wave illumination and guidance (from 28 km), IFF; optical sight", band: "G/H" }
rwr:
  - { symbol: "6", emitter: "SA-6 Gainful Straight Flush track radar (Kub)" }
battery:
  pattern: group
  items:
    - { kind: radar, label: "1S91 Straight Flush vehicle", count: 1 }
    - { kind: launcher, label: "tracked launchers (TEL)", count: 4, missiles: 3 }
    - { kind: reload, label: "reload trucks with crane", count: 4, missiles: 3 }
sources:
  - n: 1
    title: "2K12 Kub"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/2K12_Kub"
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

The 2K12 Kub, NATO reporting name **SA-6 Gainful**, was accepted into Soviet service on 23 January 1967. [[1]](#source-1)

## The battery

A battery has one 1S91 radar vehicle, four tracked transporter-erector-launchers (TELs) on the GM-578 chassis, each carrying three missiles, and four trucks each carrying three spare missiles and a crane. [[1]](#source-1) The 1998 Army handout lists four launch vehicles, one **Straight Flush** radar vehicle and two reload vehicles per battery. [[2]](#source-2)

The 1S91 **Straight Flush** is a 25 kW G/H-band radar. It acquires targets at 75 km, begins illumination and guidance at 28 km, performs identification friend or foe (IFF) and includes an optical sight. [[1]](#source-1)

## How it engages

The missile flies on command guidance, then homes semi-actively on the target lit by the 1S91's continuous-wave illuminator. [[1]](#source-1) The Army handout describes its guidance as semi-active radar. [[2]](#source-2) Propulsion is an integral rocket-ramjet: once the solid rocket motor burns out, its empty casing becomes the ramjet's combustion chamber. The warhead weighs 56 kg and top speed is about Mach 2.8. [[1]](#source-1)

## Envelope

The missile's effective range is 4–24 km (2.2–13 NM) and its effective altitude 50 m to 14 km (160 to 46,000 ft); the original Kub is listed at 6–22 km and 100 m–7 km. [[1]](#source-1) The 1998 Army handout gives a 24 km range and a 50 m minimum engagement altitude. [[2]](#source-2) Figure 1 uses 4–24 km and 50 m–14 km.

## On the radar warning receiver

In the DCS F-14, the AN/ALR-67 shows the Straight Flush as **6**. [[3]](#source-3)

## History

In the 1973 Yom Kippur War, Egyptian and Syrian Kub batteries surprised the Israeli Air Force; the system caused the most Israeli losses of any Egyptian anti-aircraft missile, many of them A-4 Skyhawks and F-4 Phantoms. In 1995, Bosnian Serb forces using modified Kub systems shot down Scott O'Grady's F-16 over Bosnia. [[1]](#source-1)
