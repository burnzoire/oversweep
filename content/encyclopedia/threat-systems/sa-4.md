---
nato: SA-4 Ganef
designation: 2K11 Krug
role: Tracked army SAM system [1]
inService: "1965 (early version); Krug-A 1967; Krug-M 1971 [1]"
guidance: "Radio command with terminal semi-active homing (unverified here; see text)"
seeker: radar
mobility: "Tracked launchers on the GM-123 chassis [1]"
envelope:
  basis: "Effective range 50–55 km depending on version (50 km drawn); engagement altitude 100 m–27 km [1]. No minimum range in the cited source."
  minRangeKm: null
  maxRangeKm: 50
  minAltM: 100
  maxAltM: 27000
  cite: [1]
radars:
  - { name: "1S32", nato: "Pat Hand (unverified here)", role: "Continuous-wave fire control and guidance, 128 km", band: "H" }
  - { name: "P-40 (1S12)", nato: "Long Track", role: "Early warning, 175 km; passes target data by radio datalink", band: "E" }
  - { name: "PRV-9", nato: "Thin Skin", role: "Height finder, 240 km", band: "E" }
radarsCite: [1]
rwr: []
rwrNote: "The cited F-14 AN/ALR-67 threat table [2] has no SA-4 or 1S32 entry, so this aircraft's RWR would not label it as an SA-4."
battery:
  cite: [1]
  pattern: group
  items:
    - { kind: launcher, label: "2P24 launcher on a tracked chassis", count: 1, missiles: 2 }
sources:
  - n: 1
    title: "2K11 Krug"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/2K11_Krug"
    accessed: "2026-10-25"
  - n: 2
    title: "DCS: F-14 Tomcat manual, AN/ALR-67 radar warning receiver"
    publisher: "Heatblur Simulations"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-10-25"
---

## Overview

The 2K11 Krug, NATO reporting name **SA-4 Ganef** (after a Yiddish word), is a Soviet tracked SAM system. An early version entered service in 1965, the first operational version, Krug-A, in 1967, and the Krug-M in 1971. [[1]](#source-1)

## The launcher and the unit

Each 2P24 launcher is a tracked vehicle on the GM-123 chassis carrying two missiles on a turntable that rotates through 360° and elevates to 70°. [[1]](#source-1) A SAM battalion has three batteries plus a command battery; a regiment has two battalions and a brigade three. [[1]](#source-1)

The 1S32 fire-control and guidance radar is an H-band continuous-wave radar with a range of 128 km. Early warning comes from the E-band P-40 **Long Track** (175 km), which passes target data to the Krug by radio datalink, and height finding from the E-band PRV-9 **Thin Skin** (240 km). [[1]](#source-1)

## How it engages

Solid-fuel boosters launch the missile, and a liquid-fuelled ramjet sustainer then takes over, for speeds up to Mach 4. It carries a 135 kg (300 lb) fragmentation warhead. The effective range is 50–55 km (27–30 NM), depending on version, and possible engagement altitudes run from 100 m to 27 km (330 to 88,600 ft). [[1]](#source-1) Optical tracking can be used for guidance in heavy electronic countermeasures (ECM), and in its three-point mode the Krug can home on a jamming target. [[1]](#source-1)

**Unverified here:** that the missile is radio-command guided with semi-active radar homing at the end, illuminated by the 1S32, and that NATO calls the 1S32 **Pat Hand**. Both are widely published, but neither is stated in the source text reviewed for this revision.

## On the radar warning receiver

The DCS F-14's AN/ALR-67 threat table has no SA-4 entry. [[2]](#source-2)
