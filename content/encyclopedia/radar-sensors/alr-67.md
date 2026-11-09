---
group: rwr
short: "ALR-67"
name: "AN/ALR-67 radar warning receiver"
type: "Radar warning receiver and countermeasures control system [1]"
origin: "United States"
manufacturer: "Litton Industries; later versions Northrop Grumman and Raytheon [1]"
inService: "On the A-6, AV-8B, F/A-18 and F-14A by 1990; the (V)3 reached initial operating capability in 2003 [1]"
band: "Originally 1 to 16 GHz; now 0.5 to 20 GHz after upgrades [1]. The (V)3 collects high-band pulse and continuous-wave signals, low-band pulse and millimetre-wave signals [2]"
weight: "45 kg [1]"
sensors: "Four antennas, each with about a 180-degree conical field of view [1]; on the F-14B, four spiral high-band antennas, four quadrant receivers, a low-band array and a narrow-band superheterodyne receiver [3]"
display: "A circular display with concentric rings. Each threat is an alphanumeric symbol placed at its bearing, and the rings show threat priority, not distance [1]. Wikipedia describes the greatest threats nearest the centre [1]; the order of the bands has changed at least once, and the early version in Heatblur's F-14 manual puts the critical band outermost [3]. On the F-14, offset mode separates overlapping symbols and limit mode shows only the six highest-priority threats [3]"
carriers:
  - "[F/A-18 Hornet](record:fa-18c) and F/A-18E/F Super Hornet [1] [2]"
  - "[F-14 Tomcat](record:f-14), replacing the [ALR-45 and ALR-50](record:alr-45) [1] [3]"
  - "[AV-8B Harrier II Plus](record:av-8b), A-6E Intruder and EA-6B Prowler [1]"
  - "Australia, Canada, Kuwait and Finland through foreign military sales of the (V)3 [1]"
variants:
  - "ALR-67(V)2 (ECP-510): more sensitivity and pulse processing [1] [2]"
  - "ALR-67(V)3 Advanced Special Receiver: an order of magnitude more processing; works with HARM, the dispensers and the jammer over the aircraft's EW bus [2]"
photos:
  - src: "encyclopedia/radar-sensors/alr-67.jpg"
    alt: "A grey F/A-18C Hornet in flight over wooded land and lakes"
    caption: "An F/A-18C of VFA-136, 1992. The Hornet carries the ALR-67."
    author: "Cmdr. John Leenhouts, US Navy"
    licence: "Public domain"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:F-18C_Hornet_of_VFA-136_in_flight_1992.JPEG"
    accessed: "2026-10-25"
quick: { introduced: null, band: "0.5–20 GHz (originally 1–16)" }
sources:
  - n: 1
    title: "AN/ALR-67 radar warning receiver"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/AN/ALR-67_radar_warning_receiver"
    accessed: "2026-11-09"
  - n: 2
    title: "AN/ALR-67(V)3 Advanced Special Receiver"
    publisher: "Federation of American Scientists, Military Analysis Network"
    date: "9 January 1999"
    url: "https://man.fas.org/dod-101/sys/ac/equip/an-alr-67.htm"
    accessed: "2026-11-09"
  - n: 3
    title: "AN/ALR-67 RWR"
    publisher: "Heatblur Simulations, F-14 Tomcat manual"
    url: "https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html"
    accessed: "2026-11-09"
    note: "Simulator documentation; describes the F-14B installation."
---

## Threat warning for naval aircraft

The ALR-67 is a [radar warning receiver](term:radar-warning-receiver): it warns the crew of hostile radars and gives each one's identity and bearing. [[1]](#source-1) The Navy wanted it in the early 1970s for the EA-6B and awarded development to Litton in 1975; it went on to replace the ALR-45 across Navy tactical aircraft. [[1]](#source-1)

## Reading the display

Threat symbols sit on a circular display at their bearing from the aircraft. The rings do not show range: the receiver ranks each threat and places it in a band by priority. [[1]](#source-1) Which band holds the most dangerous threats has changed at least once over the receiver's life, so learn the version you fly. [[3]](#source-3) What the receiver can name depends on its threat library, a software file the Navy can reprogram as threats change. [[2]](#source-2)

## Part of a system

The ALR-67 began as a stand-alone receiver and now works with the fire-control radar, datalinks, jammers and missile warning systems. [[1]](#source-1) In the F-14 it passes threat data to the ALQ-126 jammer and can trigger countermeasure programs in the ALE-39 dispenser. [[3]](#source-3)
