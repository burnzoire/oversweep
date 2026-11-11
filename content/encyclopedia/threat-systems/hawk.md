---
group: sam-western
nato: Hawk
short: Hawk
designation: "MIM-23, Basic and Improved Hawk"
role: Mobile medium-range surface-to-air missile system [1]
inService: "US Army 1959, US Marine Corps 1960; Improved Hawk from 1972; out of US service by 2002, still used abroad [1]"
guidance: "Semi-active radar homing on continuous-wave illumination from the battery's illuminator radar [1]"
seeker: radar
mobility: "Towed launchers (three missiles each), radars and control units on trailers [1]"
envelope:
  basis: "MIM-23B to M (Improved Hawk): 1.5–35 km range [1] and up to 18 km altitude [1]. The source gives a 60 m minimum altitude for both the original MIM-23A and the Improved Hawk [1]. The source also gives 1.5–40 km at high altitude and 45–50 km elsewhere [1]."
  minRangeKm: 1.5
  maxRangeKm: 35
  minAltM: 60
  maxAltM: 18000
  cite: [1]
radars:
  - { name: "AN/MPQ-50", role: "Pulse acquisition radar (PAR), the battery's search radar" }
  - { name: "AN/MPQ-48 / -55 / -62", role: "Continuous-wave acquisition radar (CWAR) for low-level targets" }
  - { name: "AN/MPQ-46 / -57 / -61", role: "High-power illuminator (HPI or HPIR): tracks the target and illuminates it for the missile" }
  - { name: "AN/MPQ-51", role: "Range-only radar, for use under jamming" }
radarsCite: [1]
rwr:
  - { symbol: "HA", emitter: "Hawk AN/MPQ-50 and AN/MPQ-55 search radars" }
  - { symbol: "HK", emitter: "Hawk AN/MPQ-46 track radar" }
battery:
  cite: [1]
  pattern: group
  items:
    - { kind: command, label: "Assault fire command console (one firing section)", count: 1 }
    - { kind: radar, label: "Continuous-wave acquisition radar", count: 1 }
    - { kind: radar, label: "High-power illuminator", count: 1 }
    - { kind: launcher, label: "M192 launchers, three missiles each", count: 3, missiles: 3 }
photo:
  src: "encyclopedia/threat-systems/hawk.jpg"
  width: 1280
  height: 966
  alt: "A towed launcher holding three white Hawk missiles on a grassy field, with radar trailers behind."
  caption: "Romanian MIM-23 Hawk missiles on display, 23 August 2006."
  author: "Lt Col Dragoş Anghelache"
  date: "23 August 2006"
  licence: "CC BY-SA 3.0"
  licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Romanian_MIM-23_Hawk.jpg"
  accessed: "2026-11-10"
sources:
  - n: 1
    title: "MIM-23 Hawk"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/MIM-23_Hawk"
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
    note: "Appendix B, ALIC codes, and Appendix C, HAD and WPN threat tables, pp. 749–754, as tabulated on the F-16 HARM threat tables record. A sim manual: it describes the DCS F-16C, not the real aircraft."
---

## Overview

The MIM-23 Hawk (“Homing All the Way Killer”) is an American medium-range surface-to-air missile, designed as a much more mobile counterpart to the Nike Hercules. [[1]](#source-1) New radars and continuous-wave semi-active homing gave it far better low-level performance than Nike. [[1]](#source-1) It entered US Army service in 1959; the Patriot replaced it in the Army by 1994 and the Marines retired theirs in 2002. [[1]](#source-1) About 40,000 missiles were built, and it was also made in Western Europe, Japan and Iran. [[1]](#source-1) The US never fired it in combat, but other nations have, many times. [[1]](#source-1)

## The battery

A Hawk battery finds targets with a pulse acquisition radar (PAR) for medium altitude and a continuous-wave acquisition radar (CWAR) for low level. [[1]](#source-1) The high-power illuminator (HPI) locks on and floods the target with continuous-wave energy; the missile homes on the reflection, while the illuminator compares the returns with a reference signal sent to the missile. [[1]](#source-1) An assault fire command console can run one firing section: one CWAR, one illuminator and three launchers with nine missiles. [[1]](#source-1) Figure 3 shows that firing section. Product improvements added an electro-optical tracker for heavy jamming and, in Phase III, the ability to engage several low-level targets at once. [[1]](#source-1)

## Envelope

The original MIM-23A engaged at 2–25 km and 60 m–11 km. The MIM-23B and later missiles reach 1.5–35 km (0.8–19 NM) and up to 18 km (59,000 ft). [[1]](#source-1) The source gives the Improved Hawk the same 60 m (200 ft) minimum altitude, and Figure 1 draws it. [[1]](#source-1) The source is not consistent on maximum range: the same section gives 1.5–40 km at high altitude, its infobox gives 45–50 km and the MIM-23K is listed at 45 km. [[1]](#source-1) Figure 1 uses the 35 km figure. Israel modified its Hawks to engage at up to 24 km. [[1]](#source-1)

## On the radar warning receiver

In the DCS [F-14](record:f-14), the AN/ALR-67 shows the Hawk search radars (AN/MPQ-50 and -55) as **HA** and the AN/MPQ-46 illuminator as **HK**. [[2]](#source-2) In the DCS F-16C, the HARM targeting pod shows the I-Hawk as **HK** in threat class 7, and the HARM's own tables list the system as code 130 “H”, the AN/MPQ-46 as 230 “HT” and the AN/MPQ-50 as 430 “HA”. [[3]](#source-3) See the [F-16 HARM threat tables](record:f-16-harm-threat-tables).

## History

Israel scored the first Hawk kill on 5 June 1967, against a damaged Israeli Ouragan heading for the Dimona nuclear site, and its Hawks shot down 8 to 12 Egyptian aircraft in the War of Attrition. [[1]](#source-1) Iran's Hawks destroyed at least 40 Iraqi aircraft in the Iran–Iraq War, but also shot down three Iranian [F-14s](record:f-14) and an F-5. [[1]](#source-1) A French battery in Chad shot down a Libyan Tu-22 in 1987, and Kuwaiti Hawks engaged Iraqi aircraft in August 1990 until an Iraqi Su-22 fired an anti-radiation missile at a battery. [[1]](#source-1) Ukraine has used Hawk since December 2022. [[1]](#source-1)
