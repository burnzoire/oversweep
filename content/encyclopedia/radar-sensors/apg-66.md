---
group: fighter-radar
short: "APG-66"
name: "AN/APG-66 fire-control radar"
type: "Solid-state, medium-range pulse-Doppler planar-array radar [1]"
origin: "United States"
manufacturer: "Westinghouse, now Northrop Grumman [1]"
inService: "Fitted to every domestic and export F-16A/B throughout production [1]"
band: "X band, with four operating frequencies [1]"
weight: "98 to 135 kg, depending on configuration [1]"
dimensions: "Antenna 29 in wide by 19 in high [1]"
modes: "Ten air-to-air and air-to-surface modes; ground mapping, Doppler beam sharpening, beacon and sea modes for surface work [1]. Low PRF in uplook for targets in low clutter; medium PRF in downlook for targets in heavy clutter [1]"
range: "Up to 80 NM, in Wikipedia's figure, which does not give the target size [1]"
display: "In ground map the radar puts surface returns on the display for the pilot to track with the cursors. Expand magnifies the area four times, and Doppler beam sharpening sharpens returns more than 15 degrees off course; in both the cursors stay centred, so it is easy to think the aircraft is pointing straight at the steerpoint [2]"
carriers:
  - "[F-16A/B](record:f-16), all versions [1]"
  - "Patrol and training aircraft: US Navy P-3 Orion, US Customs and Border Protection Cessna Citations, and the US Navy T-39N that trains student naval flight officers [1]"
  - "BAe Hawk 200 (APG-66H) and New Zealand's upgraded A-4 Skyhawks (APG-66NZ) [1]"
variants:
  - "APG-66(V)2: for the F-16A/B Mid-Life Update, with better performance in clutter and jamming [1]"
  - "APG-66(V)2A: a new processor with seven times the speed and 20 times the memory, and four times the ground-map resolution, for European F-16A/Bs in the mid-1990s [1]"
  - "APG-66(V)3: (V)2 with continuous-wave illumination, for Taiwan [1]"
photos:
  - src: "encyclopedia/radar-sensors/apg-66.jpg"
    alt: "A US Navy F-16A in grey camouflage parked on a ramp with its canopy open, seen from the front, with a control tower behind"
    caption: "A US Navy F-16A, which carries the APG-66 in its nose, at Naval Air Station Fallon."
    author: "US Navy"
    licence: "Public domain"
    sourceUrl: "https://commons.wikimedia.org/wiki/File:F-16A_NSAWC_at_NAS_Fallon_fron_view.jpg"
    accessed: "2026-10-27"
quick: { introduced: null, band: "X band" }
sources:
  - n: 1
    title: "AN/APG-66"
    publisher: "Wikipedia (secondary source)"
    url: "https://en.wikipedia.org/wiki/AN/APG-66"
    accessed: "2026-11-09"
  - n: 2
    title: "MCH 11-F16 Volume 5, F-16 Combat Aircraft Fundamentals"
    publisher: "US Air Force, Air Combat Command"
    date: "10 May 1996"
    url: "https://falcon.blu3wolf.com/Docs/F-16%20COMBAT%20AIRCRAFT%20FUNDAMENTALS%20-%20Multi-Command%20Handbook%2011-F16%20Vol5.pdf"
    accessed: "2026-11-09"
    note: "A multi-command handbook, read on a public copy; by printed page. Superseded; used here for what it says about the F-16A and F-16C radars. APG-66: para 5.11.10, pp. 154–155."
---

## Built for a lightweight fighter

Westinghouse designed the APG-66 for the early [F-16](record:f-16), to work with the [AIM-7 Sparrow](record:aim-7) and [AIM-9 Sidewinder](record:aim-9); a later version added the [AIM-120](record:aim-120). [[1]](#source-1) It has six line-replaceable units: a mechanically scanned slotted planar antenna, transmitter, low-power RF unit, digital signal processor, radar computer and control panel. [[1]](#source-1)

## Looking up and looking down

The radar changes its [pulse repetition frequency](term:pulse-repetition-frequency) with the geometry. Looking up at medium and high altitude, where there is little clutter, it uses low PRF; looking down into heavy clutter, it uses medium PRF. [[1]](#source-1) Frequency agility makes it harder to jam. [[1]](#source-1)

## Finding a point on the ground

For radar navigation and bombing, the pilot uses ground map to find a known point. The fire control computer places the cursors where the inertial system thinks the steerpoint is, and the pilot moves them onto the right return. [[2]](#source-2) The handbook warns that in expand and DBS the cursors stay in the centre of the display, so the picture can mislead a pilot about where the aircraft is pointing. [[2]](#source-2)
