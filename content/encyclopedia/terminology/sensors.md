---
short: Sensors
usage: "Aircrew of every service using radar, warning receivers, countermeasures, electro-optical and infrared sensors, night vision, datalinks and IFF, and building situational awareness from them"
terms:
  - term: Pulse repetition frequency
    expansion: PRF
    definition: "The rate at which a radar transmits its pulses, in hertz; not the radar's operating frequency. Its inverse is the pulse repetition interval (PRI)."
    note: "Low PRF gives long unambiguous range but poor velocity measurement; high PRF gives good velocity measurement and few blind speeds but ambiguous range; medium PRF sits between. [1]"
    cite: [{ n: 1, page: "3-2, 5-17, 7-21" }]
  - term: Pulse-Doppler radar
    definition: "A pulsed radar that also measures the Doppler shift of each return, so it finds range and angle like a pulse radar and closure from the frequency shift. It uses the shift both to reject clutter and to track targets in velocity."
    cite: [{ n: 1, page: "7-20" }]
  - term: Doppler notch
    definition: "The band of relative velocity a pulse-Doppler radar filters out with the ground clutter. A target flying across the radar's line of sight, near 90 degrees target aspect, closes only at the radar aircraft's own speed, like the ground, and is cancelled."
    note: "Turning to put a threat radar on the beam is a defense that uses it. [1] [2]"
    cite: [{ n: 1, page: "7-22" }, { n: 2, page: "8-5" }]
  - term: Clutter
    definition: "Unwanted radar returns, such as from the ground, sea or weather. A pulse-Doppler radar cancels returns with no motion relative to it to remove ground clutter."
    cite: [{ n: 1, page: "5-17, 7-22" }]
  - term: Blind speed
    definition: "A target velocity a pulse-Doppler radar cannot see, because its clutter filters sit at the harmonic frequencies of the PRF. The closer the spectral lines, the more blind speeds; changing PRF moves them."
    cite: [{ n: 1, page: "5-16 to 5-17" }]
  - term: Range ambiguity
    definition: "A wrong range from a return that arrives after the next pulse has been transmitted, so the radar times it from the wrong pulse. High PRF makes it worse; radars switch PRFs to resolve it."
    cite: [{ n: 1, page: "7-22 to 7-23" }]
  - term: Resolution cell
    definition: "The volume set by a radar's pulse width and its horizontal and vertical beamwidths within which two targets show as one. It grows with range, so a close formation can look like a single contact."
    cite: [{ n: 1, page: "5-12 to 5-14" }]
  - term: Scan volume
    definition: "The block of airspace a fighter radar searches: an azimuth width, a number of elevation bars and a range scale, pointed with the cursor and the antenna elevation. More bars cover more height but take longer per frame."
    note: "To place it on a called altitude: vertical displacement in feet = elevation in degrees × range in NM × 100. [2]"
    cite: [{ n: 2, page: "8-7, 10-3, 16-4" }]
  - term: Frame
    definition: "One complete pass of a radar's scan pattern through its search volume. Wait for complete frames before moving the volume, so the airspace already covered is known to be clear; a 6-bar, 140-degree frame takes about 13 seconds in the Navy's training radar."
    cite: [{ n: 2, page: "10-3, 13-2" }]
  - term: Range while search
    expansion: RWS
    definition: "A fighter radar search mode that shows contacts with range and angle while the antenna keeps scanning; the Navy's training radar starts every intercept in it."
    cite: [{ n: 2, page: "16-4" }]
  - term: Track-while-scan
    expansion: TWS
    definition: "Keeping track files on several targets in a computer, updated each time the scanning beam passes them, rather than holding the antenna on one. Target data is not continuous, so the tracks are predicted between updates."
    note: "An active radar missile such as AMRAAM can be guided from it, giving multi-target shots. [2] [4]"
    cite: [{ n: 4, page: "Ch. 6" }, { n: 2, page: "14-7" }]
  - term: Single-target track
    expansion: STT
    definition: "A radar lock: the antenna points at one target and dwells on it, giving continuous, accurate track data. A semi-active missile needs it to illuminate the target until impact."
    cite: [{ n: 2, page: "14-4" }]
  - term: Break lock
    definition: "Make a tracking radar lose its target. Against a pulse-Doppler radar the key is putting the aircraft in the Doppler notch; chaff with jamming and maneuver can also make tracking radars break lock."
    cite: [{ n: 1, page: "7-22, 13-2" }]
  - term: Radar warning receiver
    expansion: RWR
    definition: "An electronic warfare support system that detects radar signals, identifies them against its emitter table and shows each as a symbol at its rough relative bearing, with tones for a new threat, track and missile launch."
    note: "Precise position is not possible; ambiguities, hard maneuvering and interference all degrade it. It gives no warning of a passive infrared missile. [1]"
    cite: [{ n: 1, page: "17-1, 17-8 to 17-13, 15-6" }]
  - term: Emitter identification table
    expansion: EID
    definition: "The table of known radar characteristics in a warning receiver's processor, built from intelligence and electronic warfare support data and reprogrammed for each theater, against which received signals are matched."
    cite: [{ n: 1, page: "17-8" }]
  - term: Symbol age-out
    definition: "How long a warning receiver keeps showing a threat symbol after the signal stops, set for each threat in the emitter table."
    cite: [{ n: 1, page: "17-13" }]
  - term: Self-protection jamming
    definition: "Jamming carried by the aircraft it protects, against the acquisition and tracking radars engaging it; contrasted with support jamming from stand-off or escort jammers against the wider air defense system."
    cite: [{ n: 1, page: "9-3" }]
  - term: Missile approach warning system
    expansion: MAWS
    definition: "A sensor that warns of an approaching missile: actively with a pulse-Doppler radar, or passively from the missile motor's ultraviolet or infrared signature. It answers a heat-seeker the warning receiver cannot see."
    note: "False alarms from the sun, flares or a wingman matter most when it fires the dispenser automatically. [1]"
    cite: [{ n: 1, page: "15-6 to 15-7" }]
  - term: Flare rise time
    definition: "The time a decoy flare takes to reach peak intensity after ejection. It must be short to catch a narrow-field seeker, but some seekers treat a sudden rise as the sign of a flare; it lengthens at high altitude."
    cite: [{ n: 1, page: "15-2" }]
  - term: Situational awareness
    expansion: SA
    definition: "Your perception and understanding of what is actually occurring around you, assimilated from the radar, warning receiver, flight members, controllers, support assets, visual acquisition and mutual support."
    cite: [{ n: 3, page: "11" }]
  - term: Mutual support
    definition: "A contract within a flight of two or more aircraft that supports its objectives: position awareness of each other and the threat, communication, targeting before the threat attacks, and the ability to press or disengage."
    cite: [{ n: 3, page: "19" }]
  - term: Time-sharing
    definition: "Dividing the airspace into lookout sectors by priority and cross-checking them in turn, dropping the lowest first when busy and rebuilding one sector at a time. Near rocks, far rocks and check six are the basic cross-check at low level."
    cite: [{ n: 3, page: "22 to 24" }]
  - term: Radar correlation
    definition: "Matching your own radar contact to the group a controller has called, by placing the cursor and scan volume at the called bearing, range and altitude, before declaring or locking it. Not the close air support sense of correlation."
    cite: [{ n: 2, page: "10-3, 10-14" }]
  - term: Forward-looking infrared
    expansion: FLIR
    definition: "An imaging sensor that builds a TV-like picture from heat, so it needs no visible light. It works best when warm objects stand out against a cool background; cloud and rain cut its range, though it sees through light haze better than the eye."
    cite: [{ n: 4, page: "§10.5.3" }]
  - term: Image intensifier
    definition: "A device that amplifies faint visible light, by a factor of 1,000 to 10,000, onto a phosphor the eye views; night vision goggles are built on it. It needs some light from stars, moon or sky and loses detail."
    cite: [{ n: 4, page: "§10.5.3" }]
  - term: Johnson criteria
    definition: "Levels of what an imaging sensor lets you tell about a target: detection (something is there), orientation (its long axis), recognition (its class) and identification (its type within the class)."
    cite: [{ n: 4, page: "§10.5" }]
  - term: Tactical data link
    expansion: TDL
    definition: "A standardized digital radio link that exchanges tracks and other tactical data between aircraft, ships, ground units and command and control. Link 16 shares the common tactical picture between the services' systems."
    cite: [{ n: 5, page: "II-12, II-26" }]
  - term: Link 16
    definition: "The secure, jam-resistant, time-division tactical data link used by US and allied forces, on 960 to 1,215 MHz, carrying J-series messages such as precise participant location and identification (PPLI)."
    cite: [{ n: 6, page: "Link 16" }, { n: 5, page: "II-12" }]
  - term: Common tactical picture
    expansion: CTP
    definition: "The shared display of tracks across a joint force, consolidated from each component's sensors over data link interfaces under assigned track managers."
    cite: [{ n: 5, page: "II-12, II-26" }]
  - term: Interrogator
    definition: "The part of an IFF system that transmits coded challenges and evaluates the coded replies, to identify the aircraft that answer. Fighters, controllers' radars and surface defenses carry them."
    cite: [{ n: 1, page: "A-23" }]
  - term: Transponder
    definition: "A transmitter-receiver that accepts an interrogator's challenge and automatically transmits the reply set for it; the airborne half of IFF and of air traffic control's secondary radar."
    note: "In brevity the IFF transponder is PARROT. [2]"
    cite: [{ n: 1, page: "A-45" }, { n: 2, page: "A-7" }]
  - term: Selective identification feature
    expansion: SIF
    definition: "The capability added to basic IFF that lets a transponder send, and an interrogator receive and display, selected coded replies, such as a mission code, a unit code or an air traffic control code."
    cite: [{ n: 1, page: "A-39" }]
  - term: IFF mode
    definition: "One type of IFF challenge and reply. Modes 1 (mission) and 2 (unit or airframe) are military; Mode 3/A is the four-digit code shared with air traffic control, and Mode C adds pressure altitude; Modes 4 and 5 are encrypted military modes, Mode 5 adding the aircraft's position."
    note: "The modes and codes in use are set for each operation in the air tasking order and special instructions. A correct Mode 4 reply is one route to a positive friendly identification; a valid Mode 1 or 2 only starts the procedural checks. [5]"
    cite: [{ n: 7, page: "Modes" }, { n: 5, page: "A-3, A-5" }]
sources:
  - n: 1
    title: "Electronic Warfare Fundamentals"
    publisher: "US Air Force, Air Combat Command Training Support Squadron, Det 8"
    date: "November 2000"
    url: "https://falcon.blu3wolf.com/Docs/Electronic-Warfare-Fundamentals.pdf"
    accessed: "2026-11-09"
    note: "A student text for Air Force electronic warfare training, read on a public copy; by printed page."
  - n: 2
    title: "CNATRA P-825 (07-14), Flight Training Instruction, Basic Fighter Maneuvering (BFM) and All Weather Intercept (AWI), Advanced UMFO T-45C/VMTS"
    publisher: "US Navy, Chief of Naval Air Training"
    date: "1 July 2014"
    url: "https://falcon.blu3wolf.com/Docs/P-825.pdf"
    accessed: "2026-11-09"
    note: "A public copy of the training instruction; by printed page. Its radar is a training simulation of a fighter radar."
  - n: 3
    title: "MCH 11-F16 Volume 5, F-16 Combat Aircraft Fundamentals"
    publisher: "US Air Force, Air Combat Command"
    date: "10 May 1996"
    url: "https://falcon.blu3wolf.com/Docs/F-16%20COMBAT%20AIRCRAFT%20FUNDAMENTALS%20-%20Multi-Command%20Handbook%2011-F16%20Vol5.pdf"
    accessed: "2026-11-09"
    note: "A multi-command handbook, read on a public copy; by printed page. Superseded; used only for principles it states generally."
  - n: 4
    title: "Fundamentals of Naval Weapons Systems"
    publisher: "US Naval Academy, Weapons and Systems Engineering Department"
    date: "Undated web edition"
    url: "https://man.fas.org/dod-101/navy/docs/fun/"
    accessed: "2026-11-09"
    note: "Read on the Federation of American Scientists' copy; by chapter and section."
  - n: 5
    title: "JP 3-01, Countering Air and Missile Threats"
    publisher: "US Joint Chiefs of Staff"
    date: "23 March 2012"
    url: "https://www.bits.de/NRANEU/others/jp-doctrine/jp3_01(12).pdf"
    accessed: "2026-11-09"
    note: "The joint publication for all four services; by printed page."
  - n: 6
    title: "Link 16"
    publisher: "Wikipedia"
    date: "Read 9 November 2026"
    url: "https://en.wikipedia.org/wiki/Link_16"
    accessed: "2026-11-09"
    note: "A secondary source, used only for the public facts no military source read here gives."
  - n: 7
    title: "Identification friend or foe"
    publisher: "Wikipedia"
    date: "Read 9 November 2026"
    url: "https://en.wikipedia.org/wiki/Identification_friend_or_foe"
    accessed: "2026-11-09"
    note: "A secondary source, used only for what each IFF mode carries, which no military source read here lists."
---
## The words of sensors and situational awareness

These are the words for what a military aircraft's sensors see and how crews turn that into a picture: how a fighter radar searches, measures and locks, why it cannot see a target crossing its line of sight, what a radar warning receiver can and cannot tell you, how chaff, flares and jamming work, and the imaging sensors, night vision, datalinks and IFF that complete the picture. The radar and electronic warfare terms come from the Air Force's electronic warfare training text [[1]](#source-1) and the Navy's intercept training instruction [[2]](#source-2); the situational awareness terms from an Air Force fighter handbook [[3]](#source-3); the imaging terms from the Naval Academy's weapons text [[4]](#source-4); and the datalink and identification terms from joint doctrine [[5]](#source-5) and the electronic warfare text [[1]](#source-1).
