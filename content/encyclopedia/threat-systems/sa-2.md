---
nato: SA-2 Guideline
designation: S-75 Dvina (V-750 missile)
role: Area air defence, operated as a complete site [2]
inService: "1957 [1]; exported from 1960 [2]"
guidance: Radio command guidance [1]
seeker: radar
mobility: "Semi-fixed; a site can be packed up and moved in about four hours [2]"
envelope:
  basis: "US Air Force museum figures: minimum range 5 mi, maximum slant range 27 mi, ceiling about 60,000 ft [2]. Minimum altitude not given."
  minRangeKm: 8.05
  maxRangeKm: 43.45
  minAltM: null
  maxAltM: 18288
  cite: [2]
radars:
  - { name: "SNR-75", nato: "Fan Song", role: "Target tracking and missile guidance" }
  - { name: "P-12", nato: "Spoon Rest", role: "Early warning, about 275 km; hands targets to the sites" }
  - { name: "P-15", nato: "Flat Face", role: "Search radar at regimental level", band: "C" }
  - { name: "PRV-11", role: "Height finder" }
radarsCite: [1]
rwr:
  - { symbol: "2", emitter: "SA-2 Guideline Fan Song track radar (S-75)" }
  - { symbol: "FF", emitter: "SA-2, SA-3 and SA-5 Flat Face search radar (S-125 P-19)" }
battery:
  cite: [1, 2]
  pattern: ring
  spacing: "60–100 m apart"
  items:
    - { kind: radar, label: "SNR-75 Fan Song", count: 1 }
    - { kind: launcher, label: "single-rail launchers", count: 6, missiles: 1 }
photo:
  src: "encyclopedia/threat-systems/sa-2.jpg"
  width: 1280
  height: 885
  alt: "Aerial reconnaissance photo of a North Vietnamese SA-2 site: launch positions joined by a looping road, with the radar area labelled and an enlarged inset of a launcher."
  caption: "A North Vietnamese SA-2 site photographed by a US Air Force reconnaissance aircraft in August 1965. The labels are the Air Force's."
  author: "US Air Force (National Museum of the USAF photo 090605-F-1234P-001)"
  date: "August 1965"
  licence: "Public domain, work of the US federal government"
  sourceUrl: "https://commons.wikimedia.org/wiki/File:S-75_battery_in_NVietnam_1965.jpg"
  accessed: "2026-10-25"
sources:
  - n: 1
    title: "S-75 Dvina"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/S-75_Dvina"
    accessed: "2026-10-25"
  - n: 2
    title: "SA-2 Surface-to-Air Missile (fact sheet)"
    publisher: "National Museum of the United States Air Force"
    url: "https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/196037/"
    accessed: "2026-10-25"
  - n: 3
    title: "DCS: F-14 Tomcat manual, AN/ALR-67 radar warning receiver"
    publisher: "Heatblur Simulations"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-10-25"
---

## Overview

The S-75 Dvina, whose V-750 missile NATO calls the **SA-2 Guideline**, was developed in the mid-1950s and entered service in 1957. [[1]](#source-1) [[2]](#source-2) The Soviet Union began exporting it in 1960, and it was the SAM US crews met over North Vietnam. [[2]](#source-2)

## The site

The SA-2 "did not operate alone, but as part of a complete system." A typical site held six missiles on launchers, control and support vans, a long-range acquisition radar and a guidance radar. [[2]](#source-2) The six semi-fixed, single-rail launchers stand about 60 to 100 m apart in a hexagonal "flower" pattern with the radars and guidance vans in the centre, and about six more missiles wait on tractor-trailers nearby. [[1]](#source-1)

Each regiment has three battalions. The regimental headquarters holds the early-warning radars: the P-12 **Spoon Rest** (about 275 km) detects aircraft and hands them to the sites, with a P-15 search radar and a PRV-11 height finder alongside. [[1]](#source-1) At the site, the SNR-75 **Fan Song** tracks the target and guides the missiles. [[1]](#source-1)

A trained crew could pack up a site and move it in about four hours, which is why the Wild Weasels' job of striking active sites quickly mattered. [[2]](#source-2)

## How it engages

A solid-fuel booster launches the missile and drops away after about six seconds; a liquid-fuel sustainer then carries it while it is guided to the target. [[2]](#source-2) Guidance is by radio command: the site's computers steer each missile on one of three channels. A site tracks one target at a time but can guide three missiles at it. There are two guidance modes: one keeps the missile on the line of sight to the target, for short-range shots, and a lead mode flies up to 10° ahead of it. [[1]](#source-1)

## Envelope

The museum gives a minimum range of 5 miles, a maximum effective range of about 19 miles, a maximum slant range of 27 miles (about 4.3, 16.5 and 23.5 NM) and a ceiling of about 60,000 ft, with a speed of Mach 3.5 and a 288 lb blast-fragmentation warhead. [[2]](#source-2) Figure 1 uses those figures. Other published figures differ: the S-75 article gives 45 km (24 NM), a flight altitude of 25,000 m in its summary and about 20,000 m in its text, and a 195 kg warhead. [[1]](#source-1) Treat any single SA-2 number as variant-dependent.

## On the radar warning receiver

In the DCS F-14, the AN/ALR-67 shows the Fan Song track radar as **2** and the Flat Face search radar, used with the SA-2, SA-3 and SA-5, as **FF**. [[3]](#source-3)

## History

An S-75 shot down Francis Gary Powers' U-2 near Sverdlovsk on 1 May 1960, and another downed Maj. Rudolf Anderson's U-2 over Cuba on 27 October 1962. [[1]](#source-1) [[2]](#source-2) Over North Vietnam, an S-75 shot down a USAF F-4C on 24 July 1965, the first US aircraft lost to a SAM in that war. In eleven days of Operation Linebacker II in December 1972, 266 missiles were fired at B-52s and 15 B-52s were lost. [[1]](#source-1)
