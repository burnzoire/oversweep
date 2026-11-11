---
group: sam-western
nato: Roland
short: Roland
designation: Roland (Euromissile)
role: Franco-German mobile short-range surface-to-air missile system [1]
inService: "Roland 1 entered service in 1976; missile production from 1977; Roland 3 missile from 1988 [1]"
guidance: "Command to line of sight: the missile is tracked optically (Roland 1) or by radar (Roland 2), and steered onto the line of sight [1]"
seeker: radar
mobility: "Tracked (AMX-30, Marder; the US XM975 reached only a prototype) or in a shelter on a truck or fixed site; two ready missiles and eight reloads [1]"
envelope:
  basis: "Roland 1 and 2: 500–6,300 m range and 20–5,500 m altitude [1]. The Roland 3 missile reaches 8.5 km and 6,000 m [1]."
  minRangeKm: 0.5
  maxRangeKm: 6.3
  minAltM: 20
  maxAltM: 5500
  cite: [1]
radars:
  - { name: "Search radar", role: "Pulse-Doppler, 15–18 km" }
  - { name: "Tracking radar (Roland 2)", role: "Tracks target and missile; the optical tracker is the alternative" }
radarsCite: [1]
rwr:
  - { symbol: "RO", emitter: "Roland MPDR-16 search radar and Domino 30 track radar" }
  - { symbol: "GR", emitter: "Roland MPDR-3002 S search radar" }
photo:
  src: "encyclopedia/threat-systems/roland.jpg"
  width: 1280
  height: 946
  alt: "Black-and-white head-on view of a tracked vehicle with a round radar dish and a missile tube on each side of its turret."
  caption: "A German Roland fire unit on a modified Marder chassis, 1976."
  author: "SysM Rol"
  date: "1976"
  licence: "CC BY-SA 3.0"
  licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:FlaRakpanzer_Roland_auf_Marder-Fahrgestell_FRP_760001.jpg"
  accessed: "2026-11-10"
sources:
  - n: 1
    title: "Roland (missile)"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Roland_(missile)"
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

Roland is a Franco-German mobile short-range surface-to-air missile system, built by Euromissile to defend field formations and fixed sites such as airfields against low-level attack. [[1]](#source-1) The fair-weather Roland 1 entered French and Spanish service in 1976; the all-weather Roland 2 went on AMX-30 and Marder tracked vehicles and in shelters on trucks or fixed sites. [[1]](#source-1) The US Army bought it as American Roland, one of very few foreign SAMs it has adopted. [[1]](#source-1) Exports included Argentina and Iraq. [[1]](#source-1)

## How it engages

A pulse-Doppler search radar finds targets at 15–18 km. The fire unit then tracks the target with its tracking radar or an optical tracker and can switch between them during an engagement; the optical channel is normally used in daylight against very low targets or under heavy jamming. [[1]](#source-1) The missile is guided by command to line of sight: Roland 2 missiles carry a beacon so the radar can track them automatically. [[1]](#source-1) The 6.5 kg warhead has 65 shaped-charge projectiles and is set off by impact or [proximity fuze](term:proximity-fuze). [[1]](#source-1) Each launcher holds two ready missiles, with eight more reloaded automatically in 10 seconds. [[1]](#source-1)

## Envelope

Roland 1 and 2 engage targets flying up to Mach 1.3 at 500–6,300 m (0.3–3.4 NM) and 20–5,500 m (66–18,000 ft). [[1]](#source-1) The Roland 3 missile, from 1988, reaches 8.5 km and 6,000 m. [[1]](#source-1) Figure 1 draws the Roland 1 and 2 limits.

## On the radar warning receiver

In the DCS [F-14](record:f-14), the AN/ALR-67 shows the Roland MPDR-16 search radar and Domino 30 track radar as **RO**, and the MPDR-3002 S search radar as **GR**. [[2]](#source-2) In the DCS F-16C, the HARM targeting pod shows the Roland as **RO** in threat class 7. [[3]](#source-3) See the [F-16 HARM threat tables](record:f-16-harm-threat-tables).

## History

On 1 June 1982 an Argentine Army Roland shot down a Royal Navy Sea Harrier south of Stanley in the Falklands. [[1]](#source-1) In the 1991 Gulf War, Iraqi Rolands shot down a US Navy A-6E near H-3 airfield on 17 January; its crew reported that the missile did not set off their warning receivers. [[1]](#source-1) On 19 January a Roland destroyed an RAF Tornado on a [SEAD](term:sead) mission against Tallil, and the Pentagon later attributed the loss of at least one [A-10](record:a-10) to a Roland. [[1]](#source-1)
