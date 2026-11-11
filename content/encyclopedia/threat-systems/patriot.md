---
group: sam-western
nato: Patriot
short: Patriot
designation: "MIM-104, PAC-2 and PAC-3"
role: Mobile long-range surface-to-air and anti-ballistic missile system; the US Army's primary high-to-medium air defence system [1]
inService: "Began replacing Nike Hercules in 1984; PAC-2 missile with units from 1990 [1]"
guidance: "PAC-2: track-via-missile, a semi-active seeker relaying to the ground radar; PAC-3: active radar homing, hit-to-kill [1]"
seeker: radar
mobility: "Trailer-mounted launchers: four PAC-2 or sixteen PAC-3 missiles each [1]"
envelope:
  basis: "PAC-2 GEM family: 160 km range and 32 km ceiling, both marked as estimates in the source's missile table; the same source elsewhere gives PAC-2 intercepts up to 20 km altitude [1]. No minimums are given."
  minRangeKm: null
  maxRangeKm: 160
  minAltM: null
  maxAltM: 32000
  cite: [1]
radars:
  - { name: "AN/MPQ-53", role: "Passive phased-array radar for search, track, IFF and track-via-missile guidance (PAC-2 units)" }
  - { name: "AN/MPQ-65 / -65A", role: "Adds a second travelling-wave tube for PAC-3; the -65A is an AESA with rear arrays for 360° coverage" }
radarsCite: [1]
rwr:
  - { symbol: "PT", emitter: "Patriot AN/MPQ-53 search radar" }
photo:
  src: "encyclopedia/threat-systems/patriot.jpg"
  width: 1280
  height: 1620
  alt: "A Patriot missile climbing away from its launcher in a burst of exhaust, with another launcher in the foreground."
  caption: "A Patriot missile launch; US Army photograph, date not recorded."
  author: "US Army"
  licence: "Public domain, work of the US federal government"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Patriot_missile_launch_b.jpg"
  accessed: "2026-11-10"
sources:
  - n: 1
    title: "MIM-104 Patriot"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/MIM-104_Patriot"
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
    note: "Appendix C, HAD and WPN threat tables, pp. 753–754, as tabulated on the F-16 HARM threat tables record. A sim manual: it describes the DCS F-16C, not the real aircraft."
---

## Overview

The MIM-104 Patriot is the US Army's primary high-to-medium air defence system and has been widely exported. [[1]](#source-1) Its name comes from its radar, the AN/MPQ-53 “Phased Array Tracking Radar to Intercept on Target”. [[1]](#source-1) It began replacing the Nike Hercules in 1984. The first missile, the MIM-104A, was built against aircraft and reached about 70 km; later versions turned it into an anti-ballistic missile system. [[1]](#source-1)

For allied aircrew, Patriot is as likely to be a friendly system to deconflict with as a threat. Patriot batteries have shot down friendly aircraft (see History), so, as general guidance, follow the airspace control measures and keep [IFF](term:iff) working.

## The battery

A battery's fire control section is the radar set, the engagement control station, an antenna mast group and a power plant. Launchers carry four PAC-2 missiles or sixteen PAC-3 missiles, and the M903 launcher can mix them. [[1]](#source-1) The radar is a passive phased array of more than 5,000 elements with [IFF](term:iff), counter-countermeasures and track-via-missile guidance. [[1]](#source-1) The AN/MPQ-65A, from 2017, is an active array with two smaller rear arrays that let it see behind and to the sides. [[1]](#source-1)

## The missiles

- **MIM-104A (Standard)**: anti-aircraft, about 70 km, over Mach 2. [[1]](#source-1)
- **MIM-104C PAC-2** and **MIM-104D/E GEM**: optimised against ballistic missiles with a heavier-fragment warhead and faster fuze; track-via-missile guidance; up to 160 km. PAC-2 reached Army units in 1990. [[1]](#source-1)
- **PAC-3 and PAC-3 MSE**: a smaller hit-to-kill interceptor with a Ka-band active radar seeker, four to a canister. [[1]](#source-1)

## Envelope

Figure 1 draws the PAC-2 GEM family: 160 km (86 NM) and an estimated 32 km (105,000 ft) ceiling. [[1]](#source-1) The source's missile table marks both figures as estimates, and its PAC-3 section gives the PAC-2 an intercept altitude of up to 20 km (66,000 ft), so treat the ceiling as uncertain. [[1]](#source-1) No minimum range or altitude is given, so those edges are dashed.

## On the radar warning receiver

In the DCS [F-14](record:f-14), the AN/ALR-67 shows the AN/MPQ-53 as **PT**. [[2]](#source-2) In the DCS F-16C, the HARM targeting pod shows the Patriot PAC-2 radar as **P** in threat class 6. [[3]](#source-3) See the [F-16 HARM threat tables](record:f-16-harm-threat-tables).

## History

Patriot deployed in the 1991 Gulf War and made successful intercepts in the 2003 Iraq War. [[1]](#source-1) In 2003 Patriot batteries were involved in three friendly-fire incidents: an RAF Tornado was shot down on 23 March, killing both crew; on 24 March an [F-16](record:f-16)CJ fired a HARM at a battery whose radar had locked on to it; and on 2 April PAC-3 missiles shot down a US Navy [F/A-18](record:fa-18c), killing the pilot. [[1]](#source-1) Israeli Patriots shot down a Syrian Su-24 in 2014 and a Su-22 in 2018. [[1]](#source-1) In Ukraine since 2023, Patriot has intercepted Russian missiles and aircraft; on 13 May 2023 a battery is reported to have downed a Su-34, a Su-35 and two Mi-8 helicopters over Bryansk. [[1]](#source-1)
