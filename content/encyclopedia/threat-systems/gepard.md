---
group: aaa
nato: Gepard
designation: Flakpanzer Gepard (35 mm)
role: "All-weather self-propelled anti-aircraft gun [1]"
inService: "West Germany from 1976; retired by Germany in 2010; in service with Brazil, Romania and Ukraine [1]"
guidance: "Radar: own search and tracking radars on the turret, with stabilised periscopes as an optical back-up; laser rangefinder on later vehicles [1]"
mobility: "Tracked, on a Leopard 1 tank hull [1]"
envelope:
  basis: "Effective range 5.5 km with FAPDS ammunition [1]. No effective altitude is given, so Figure 1 draws the range only."
  minRangeKm: null
  maxRangeKm: 5.5
  minAltM: null
  maxAltM: null
  cite: [1]
radars:
  - { name: "Search radar (German vehicles)", role: "Siemens MPDR 12 on a swing arm at the rear of the turret; 15 km all-round detection, with an integrated IFF interrogator", band: "S" }
  - { name: "Tracking radar (German vehicles)", role: "At the front of the turret, between the guns; 15 km", band: "Ku" }
  - { name: "Dutch CA1 Cheetah radars", role: "Search radar 15 km, tracking radar 13 km", band: "X and X/Ka" }
radarsCite: [1]
rwr:
  - { symbol: "A", emitter: "Gepard, M163 Vulcan, and ZSU-23-4 Shilka track radars" }
photo:
  src: "encyclopedia/threat-systems/gepard.jpg"
  width: 1280
  height: 1038
  alt: "A tracked anti-aircraft gun tank with a large turret and radar firing a tracer on a desert range, beside a parked military truck."
  caption: "A 35 mm Oerlikon Flakpanzer fires a tracer during a support test at the Fort Bliss range, Texas; date not recorded."
  author: "US Army (photographer unknown)"
  licence: "Public domain, work of the US federal government"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:Flakpanzer_Gepard_Test_Firing_at_Fort_Bliss_Range.jpg"
  accessed: "2026-11-09"
sources:
  - n: 1
    title: "Flakpanzer Gepard"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/Flakpanzer_Gepard"
    accessed: "2026-11-09"
  - n: 2
    title: "DCS: F-14 Tomcat manual, AN/ALR-67 radar warning receiver"
    publisher: "Heatblur Simulations"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-11-09"
  - n: 3
    title: "DCS: F-16C Viper Early Access Guide (English)"
    publisher: "Eagle Dynamics"
    url: "https://www.digitalcombatsimulator.com/en/downloads/documentation/"
    accessed: "2026-11-05"
    note: "Appendix B, ALIC codes, pp. 749–751, and Appendix C, HAD and WPN threat tables, pp. 753–754, as tabulated on the F-16 HARM threat tables record. A sim manual: it describes the DCS F-16C, not the real aircraft."
---

## Overview

The Gepard is a West German all-weather self-propelled anti-aircraft gun on the hull of the Leopard 1 tank, with two 35 mm Oerlikon cannon. [[1]](#source-1) It was designed by Oerlikon-Bührle and built under licence by Krauss-Maffei; production was ordered in 1973 and it entered service in 1976. [[1]](#source-1) The Netherlands bought its own version, the CA1 Cheetah, with different radars. [[1]](#source-1)

## How it engages

The search radar at the back of the turret gives 15 km of all-round detection and has an [IFF](term:iff) interrogator built in; the tracking radar between the guns also reaches 15 km. [[1]](#source-1) The gunner and commander each have a stabilised periscope that the tracking radar can slew onto the target, and these serve as an optical back-up. [[1]](#source-1) The two guns fire 550 rounds a minute each, 1,100 together, normally in bursts of 24 or 48 rounds per gun. [[1]](#source-1)

## Envelope

The effective range with FAPDS ammunition, at a muzzle velocity of 1,440 m/s, is 5.5 km. [[1]](#source-1) The source gives no effective altitude, so Figure 1 draws the range only.

## On the radar warning receiver

In the DCS F-14, the AN/ALR-67 shows the Gepard's track radar as **A**, the same symbol as the [ZSU-23-4](record:zsu-23-4) and [M163](record:m163). [[2]](#source-2) In the DCS F-16C, the HARM targeting pod shows it as **A** in threat class 8, among the American and western European radars. [[3]](#source-3) See the [F-16 HARM threat tables](record:f-16-harm-threat-tables).

## History

West Germany fielded 420, six batteries to each of its eleven mechanized divisions' anti-aircraft regiments in the 1980s; Germany retired its last in 2010. [[1]](#source-1) From July 2022 Germany sent Gepards to Ukraine, where they have been used against Shahed-136 loitering munitions and probably shot down a Kh-101 cruise missile in October 2022. [[1]](#source-1) Brazil, Romania and Ukraine use it today; Belgium, Chile, Germany, Jordan, the Netherlands and Qatar have also operated it. [[1]](#source-1)
