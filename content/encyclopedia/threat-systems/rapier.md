---
group: sam-western
nato: Rapier
short: Rapier
designation: Rapier (BAC / MBDA)
role: British short-range surface-to-air missile system [1]
inService: "1971; Blindfire radar in British service from 1979; Rapier 2000 (FSC) from 1996; replaced by Sky Sabre in British service in 2021 [1]"
guidance: "Semi-automatic command to line of sight: the operator, or later the Blindfire radar, tracks the target and the missile is steered onto the line of sight [1]"
seeker: radar
mobility: "Towed launcher with Land Rovers; a tracked version served 1983 to the early 1990s [1]"
envelope:
  basis: "400–8,200 m range [1]; ceiling 3,000 m for the Mk 1 missile and 5,000 m for the Mk 2, a figure the source marks as possibly unreliable [1]."
  minRangeKm: 0.4
  maxRangeKm: 8.2
  minAltM: null
  maxAltM: 3000
  cite: [1]
radars:
  - { name: "Launcher search radar", role: "Pulse-Doppler, about 15 km, on top of the original launcher" }
  - { name: "DN 181 Blindfire", role: "Narrow-beam tracking radar that tracks target and missile, giving all-weather capability (FSA onward)" }
  - { name: "Dagger", role: "Separate 3D pulse-Doppler search radar with IFF (Rapier 2000 / FSC)" }
radarsCite: [1]
rwr:
  - { symbol: "BF", emitter: "Rapier Blindfire track radar" }
  - { symbol: "RP", emitter: "Rapier Dagger search radar" }
photo:
  src: "encyclopedia/threat-systems/rapier.jpg"
  width: 1280
  height: 960
  alt: "A Rapier launcher under camouflage netting on an airfield apron, with missiles on arms on each side of its central unit."
  caption: "A Swiss Air Force Rapier launcher at Payerne Air Base, 21 April 2008."
  author: "Nirazul"
  date: "21 April 2008"
  licence: "CC BY-SA 2.0 DE"
  licenceUrl: "https://creativecommons.org/licenses/by-sa/2.0/de"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Swiss_rapier_missile.jpg"
  accessed: "2026-11-10"
sources:
  - n: 1
    title: "Rapier (missile)"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Rapier_(missile)"
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

Rapier is a British short-range surface-to-air missile system that entered service in 1971 and eventually replaced all other anti-aircraft weapons in the British Army, both Bofors guns and the Thunderbird missile, and the RAF Regiment's guns and Tigercat. [[1]](#source-1) It was built for fast reaction against low-flying attack aircraft. [[1]](#source-1) It sold widely abroad, and in 2021 Sky Sabre replaced it as one of the UK's main air defence weapons. [[1]](#source-1)

## How it engages

On the original Rapier, a search radar on the launcher detects moving targets out to about 15 km and lights a lamp showing their bearing. The operator slews an optical tracker onto the target, holds it in the sight with a joystick and fires; the system then steers the missile onto the line of sight automatically. [[1]](#source-1) The missile has a small 1.4 kg warhead with a contact [fuze](term:fuze), so it has to hit; it flies at about Mach 2 and takes about 13 seconds to reach its maximum range. [[1]](#source-1) Reaction time from detection to launch is about six seconds. [[1]](#source-1)

The Blindfire radar, sold from 1973 and in British service from 1979 with Rapier “Field Standard A”, added all-weather fire by tracking both target and missile with a narrow pencil beam. [[1]](#source-1) Rapier 2000 (Field Standard C), in service from 1996, moved the search radar to a separate Dagger 3D radar with [IFF](term:iff), added a new optical tracker that can also search for infrared sources, and carried eight missiles per launcher. [[1]](#source-1)

## Envelope

The source gives 400–8,200 m (0.2–4.4 NM), and a ceiling of 3,000 m (9,800 ft) for the Mk 1 missile and 5,000 m for the Mk 2, flagging the ceilings as coming from a possibly unreliable site. [[1]](#source-1) Figure 1 uses the Mk 1 ceiling; no minimum altitude is given, so that edge is dashed.

## On the radar warning receiver

In the DCS [F-14](record:f-14), the AN/ALR-67 shows the Blindfire track radar as **BF** and the Dagger search radar as **RP**. [[2]](#source-2) In the DCS F-16C, the HARM targeting pod shows the Rapier FSA's Blindfire as **RP** and the Rapier FSA itself as **RT**, both in threat class 7. [[3]](#source-3) See the [F-16 HARM threat tables](record:f-16-harm-threat-tables). The original, optically tracked Rapier fires without a tracking radar.

## History

Rapier's first known combat use was in December 1974, when an Iranian Rapier inside Iraq shot down an Iraqi Il-76, a claim the source marks as needing a citation; Iran's Rapiers are reported to have downed more aircraft in the Iran–Iraq War. [[1]](#source-1) In the 1982 Falklands War, British Rapier units at San Carlos and later Stanley were hampered by fragile launchers and the loss of spare missiles, and their confirmed kills were limited. [[1]](#source-1)
