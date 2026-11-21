---
short: F-16C avionics
usage: "Pilots of the F-16C, real or simulated, working its sensors, displays and the HARM Targeting System"
terms:
  - term: SOI
    expansion: Sensor of interest
    definition: "The one sensor or display the hand controls are working at a time. The cursor and target management switches act on the SOI, which is marked by a frame round its display; the display management switch moves it between displays."
    cite: [{ n: 1, page: "330–331" }]
  - term: SPI
    expansion: System point of interest
    definition: "The single point on the ground the whole system is working on, which every sensor in Slave mode looks at. It starts as the selected steerpoint; designating a target with a sensor, or tracking one with the targeting pod, makes that sensor own it."
    cite: [{ n: 1, page: "489, 526" }]
  - term: HOTAS
    expansion: Hands on throttle and stick
    definition: "Controls on the throttle grip and side stick that let the pilot work the sensors, displays and weapons without taking a hand off either."
    cite: [{ n: 1, page: "83–87" }]
  - term: MFD
    expansion: Multifunction display
    definition: "A square cockpit screen ringed by push buttons whose labels change with the page shown, so one screen can show radar, targeting pod, stores or other formats in turn."
    cite: [{ n: 1, page: "122" }]
  - term: OSB
    expansion: Option select button
    definition: "One of the push buttons round a multifunction display. What it does is shown by the label beside it on the screen."
    cite: [{ n: 1, page: "122" }]
  - term: DED
    expansion: Data entry display
    definition: "The small text display below the head-up display where navigation, communication and system pages are read and changed, using the integrated control panel's keypad."
    cite: [{ n: 1, page: "98–101" }]
  - term: ICP
    expansion: Integrated control panel
    definition: "The keypad and switches below the head-up display used to call up and change the pages on the data entry display."
    cite: [{ n: 1, page: "98–99" }]
  - term: TMS
    expansion: Target management switch
    definition: "A four-way switch on the side stick. On the sensor of interest it designates (forward), rejects (aft) and steps or selects modes (left and right), with a different meaning for a short press and a long hold."
    cite: [{ n: 1, page: "84, 547" }]
  - term: DMS
    expansion: Display management switch
    definition: "A four-way switch on the side stick that chooses formats and, aft, moves the sensor of interest between displays."
    cite: [{ n: 1, page: "84, 545" }]
  - term: HTS
    expansion: HARM Targeting System
    definition: "The AN/ASQ-213 pod that passively detects and locates enemy air defence radars from their emissions, across the forward 180° of the aircraft, and cues the AGM-88 HARM and other sensors to them."
    cite: [{ n: 1, page: "525–527" }]
  - term: HAD
    expansion: HARM attack display
    definition: "The HTS format on a multifunction display: a plan view of the radars the pod has found, coloured by what each is doing, with its cursor, range scale and the data on the radar under the cursor."
    cite: [{ n: 1, page: "530–532" }]
  - term: TGP
    expansion: Targeting pod
    definition: "An electro-optical and infrared camera pod, on the F-16C the AN/AAQ-33 Sniper, used to find, identify, track and laser-designate targets, and to measure their position."
    cite: [{ n: 1, page: "486, 489" }]
  - term: Slave mode
    definition: "A targeting pod mode in which the pod looks wherever the system point of interest is, rather than being steered or tracking. It is shown by large crosshairs."
    cite: [{ n: 1, page: "489, 497" }]
  - term: Point track
    definition: "A targeting pod mode that locks onto a well-defined object at the centre of the picture by its edges, and follows it if it moves. The pod then owns the system point of interest."
    cite: [{ n: 1, page: "491" }]
  - term: Area track
    definition: "A targeting pod mode that holds a patch of ground steady rather than one object. The pod falls back to it when there is nothing well defined to track."
    cite: [{ n: 1, page: "491" }]
  - term: Error ellipse
    definition: "The area within which a passively located radar probably lies. It is long along the line of sight when every bearing comes from nearly the same direction, and shrinks as bearings from different angles cross."
    cite: [{ n: 1, page: "528" }]
  - term: PGM level
    definition: "The HTS's grade for how well it has located a radar, from PGM 5 (largest error ellipse) to PGM 1 (smallest). PGM 2 is usually close enough for a short targeting pod search to find the site; PGM 1 needs TDOA ranging."
    cite: [{ n: 1, page: "528" }]
  - term: Angle-of-arrival ranging
    definition: "Locating a radar by measuring the direction its signal arrives from on scan after scan, from different points along the aircraft's path, and crossing those bearings. It needs the radar well off the nose and reaches PGM 2 at best."
    cite: [{ n: 1, page: "527–528, 541" }]
  - term: TDOA ranging
    expansion: Time-difference-of-arrival ranging
    definition: "Locating a radar from the differences in when its signal reaches three HTS-equipped aircraft sharing their measurements by datalink. Faster and more precise than angle-of-arrival ranging, reaching PGM 1."
    cite: [{ n: 1, page: "529, 545–546" }]
  - term: ALIC code
    definition: "A three-digit number that identifies a radar type to the HTS and the HARM, for example 108 for the SA-6's Straight Flush radar. It is typed in to add a radar to a manual threat class or a HARM table."
    cite: [{ n: 1, page: "538, 749" }]
  - term: SEAD target
    definition: "The radar designated on the HAD. It is boxed, owns the system point of interest, and is the radar the HARM and slaved sensors are cued to."
    cite: [{ n: 1, page: "539" }]
  - term: Field of regard
    definition: "The whole region a sensor can look into without the aircraft turning. For the HTS it is the forward 180° of the aircraft."
    cite: [{ n: 1, page: "527, 541" }]
sources:
  - n: 1
    title: "DCS: F-16C Viper Early Access Guide (English)"
    publisher: Eagle Dynamics
    date: "16 August 2026"
    url: https://www.digitalcombatsimulator.com/en/downloads/documentation/
    accessed: "2026-11-21"
    note: "By printed page. A sim manual: it describes the DCS F-16C, which models the real aircraft's avionics in simplified form."
---
## The words of the F-16C's avionics

These are the words for how an F-16C pilot works the jet's sensors and displays: the sensor of interest and system point of interest that tie them together, the hand controls and screens, and the HARM Targeting System and targeting pod used to find and target enemy air defence radars. They come from the DCS F-16C guide [[1]](#source-1), so they describe the aircraft as that simulation models it.
