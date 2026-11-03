# Air-to-Air Refuelling Procedures — source evidence

Short excerpts, with paragraph and page references, behind the claims in the
Air-to-Air Refuelling Procedures module
(`src/pages/manual/air-to-air-refuelling/_Procedures.astro`), its model
(`src/lessons/aar/lesson-model.mjs`) and the AAR terms
(`content/encyclopedia/terminology/aar.md`). They are review evidence, not a
copy of the sources, and not instructions to the reviewer.

```review-sources
source: https://bloximages.chicago2.vip.townnews.com/militarynews.com/content/tncms/assets/v3/editorial/5/ca/5ca69442-c74c-11e8-97a8-fff1004e63f5/5bb528e613e83.pdf.pdf
pages: 24-42; 49-78; 93-105; 137; 179-184; 192; 198-209; 211-222; 223-226; 232; 235
```

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/e78/33zl8132hi71d3tv0194vvkzpzl3mrr6/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf
pages: 160-165
```

```review-sources
source: https://cdn.falcon-bms.com/docs/4.38/BMS-Training-Manual.pdf
pages: 118-129
```

**Retrieval.** All sources were read on 3 November 2026 and reduced to text
with Poppler `pdftotext -layout`. Quotations come from that text, so check
each against independently retrieved source text, and treat a wording
mismatch as a finding against this record. Page lists above are PDF pages.

**The ATP copy.** NATO ATP-3.3.4.2 (ATP-56) Edition C Version 1, November
2013, 355 pages, is hosted publicly by militarynews.com. It carries no
classification marking; its promulgation letter limits reproduction, so the
module summarises it and quotes only short phrases, with a citation. Page
numbers restart in each chapter and annex, so the module cites paragraphs and
annexes (¶2.32, Annex 2P) instead. PDF 49–54 are printed 1-11 to 1-16; PDF
55–78 are 2-1 to 2-20 and Annex 2A; PDF 93–96 Annex 2D; PDF 179–209 Sections
IV and V of Chapter 2; PDF 211–222 Annexes 2O, 2P and 2Q; PDF 223 onward
Chapter 3 (helicopters).

**Military sources first.** The ATP is the alliance's multinational
procedure, written for every service of every member nation, with national
differences left to each nation's own documents (its "SRD" annexes, which
were not read). USAF T.O. 1-1C-1, the US Navy's NATOPS air refuelling
manual and UK AP documents were not found on readable hosts; DTIC returned
403 and the UK RA 3033 now points back to the ATP. The two sim manuals are
cited only for the In the sim panel.

## [1] NATO ATP-3.3.4.2 (ATP-56), Edition C Version 1

- ¶1.14.e (PDF 51–52), drogue signal lights: "(c) Green Light. A green light
  signifies fuel is flowing." Red is breakaway or no contact, amber clear
  contact, in the paragraphs above it.
- ¶1.14.a(5)–(6) (PDF 50–51), hose travel: the fuel valve opens after
  typically about 2 m (6 ft) and "a range of movement from the valve open
  position to 7 m (20 ft) forward of this, is typical." Used for `HOSE`.
- ¶1.18 (PDF 54), tanker reference markings: "Boom tankers have a fluorescent yellow
  stripe on the bottom" of the fuselage, the azimuth reference the director
  lights do not give.
- ¶2.2 (PDF 55–58), rendezvous: 1,000 ft separation until visual and within
  1 NM; ¶2.2.f takes 25° of bank as the planning figure, flown "whenever
  possible". Annex 2A ¶2.A.2.c(1) (PDF 75): the receiver is "established at
  1,000 ft below the assigned base air refuelling" altitude; PDF 137 (another
  annex): tankers "are not to exceed 25° AOB".
- ¶2.11 (PDF 72) and Annex 2D (PDF 93–96): the rendezvous types and the
  point-parallel (RV Delta) tables, columns "Offset (nm)", "25° AOB" and
  "Turn Range (nm)". The figure's no-wind turn range is computed, not taken
  from the tables; the tables add drift.
- Annex 1A (PDF 32), Echelon Left Position: aft of the tanker wingline and
  one receiver wingspan outboard when the tanker has a rearward observer.
- Annex 1A, Astern Position: for the boom, "approximately 50 ft" behind and
  slightly below the nozzle.
- ¶2.28.f (PDF 182): "Damaged Spokes. A receiver pilot damaging the spokes
  is to call 'spokes'."
- ¶2.32–2.33 (PDF 198–201): breakaway, and lost visual contact: "Simultaneously
  slow down 10 kts". The ¶2.30 table (PDF 192): "Maintains this turn for 15 sec".
- ¶2.8.f(4) (PDF 67): the director lights come on when the aircraft are in
  contact; the page notes that both sims light them from clearance to contact.
- ¶2.45.d (PDF 205): air-to-air TACAN, the "two designated channels will be
  63 channels apart".
- ¶2.46 (PDF 206): boom talk-on, "“FORWARD 50”, “UP 4”, “BACK 2”", called at
  "approximately 50 ft from the contact position". Used for `boomCall`.
- Annexes 2O–2Q (PDF 211–222): emission control options 1 to 4, the radio
  call table, and the silent signals used in both quizzes.
- ¶3.2.c (PDF 223), helicopters: "normal HAAR airspeed will be 110-115 KIAS."
  ¶3.7 (PDF 232) and ¶3.10 (PDF 235) for the join and the disconnect.

## [2] DCS: F-16C Viper Early Access Guide

- pp. 160–165, air-to-air refuelling: the AR door and "AR Status Light –
  Verify RDY" checklist, and the receiver "reaching the Pre-contact
  position" before contact.

## [3] Falcon BMS 4.38.1 Training Manual, Mission 4D

- p. 121: "You'll need to be 50 feet below at 30° down from the" boom for
  pre-contact.
- p. 123: the tanker "will bank exactly 30° for a 180° turn" on its
  racetrack; "Stay in position and match its attitude."
- Basket refuelling: "Don't chase the basket".

## Modelling choices

- Figure 2's 6 ft astern depth, the ±4 ft envelope and the director-light
  steps are invented: each tanker's real envelope is in its national
  document, which was not read.
- Figure 1's spot spacing shows the order of the flow, not distances.
- Figure 4 is a no-wind point-parallel at 25° bank with a 1 NM rollout.
- Call signs (Hawk, Shell 6) and the channel are invented.

## Not covered

National boom envelopes and disconnect limits; night lighting by type;
tanker-side procedures beyond what the receiver hears; cell and multi-tanker
formations beyond a mention; fuel planning for tanker offload.

## Encyclopedia tanker records

The eight tanker records (KC-135, KC-10, KC-46, A330 MRTT, KC-130J, Il-78,
S-3B, MQ-25) each cite their Wikipedia article only, as secondary sources;
photos are from Wikimedia Commons with the licence on each record.
