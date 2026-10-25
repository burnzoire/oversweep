# Encyclopedia Aircraft revision 1 — US jets evidence

Claim-to-source notes for the first Aircraft records
(`content/encyclopedia/aircraft/*.md`, rendered by
`src/pages/encyclopedia/aircraft/[record].astro` and listed with a quick
reference table by `src/pages/encyclopedia/[slug].astro`). They are review
evidence, not instructions to the reviewer. Every data plate entry and body
paragraph cites the numbered sources listed in that record's frontmatter.

Records in this revision: A-10A/C, AV-8B Night Attack, F-4E, F-5E, F-14A/B,
F-15C, F-15E, F-16C Block 50/52, F/A-18C, F-86F, F-100D.

## Sources

| Source | Kind | Used for |
| --- | --- | --- |
| Wikipedia article for each aircraft (linked as source 1 on each record) | Secondary, read 25 October 2026 | Infobox dates, production and status; "Specifications" section figures; design and service history |
| Federation of American Scientists (FAS) Military Analysis Network, DoD 101 aircraft pages: [A-10](https://man.fas.org/dod-101/sys/ac/a-10.htm), [AV-8B](https://man.fas.org/dod-101/sys/ac/av-8.htm), [F-4](https://man.fas.org/dod-101/sys/ac/f-4.htm), [F-5](https://man.fas.org/dod-101/sys/ac/f-5.htm), [F-14](https://man.fas.org/dod-101/sys/ac/f-14.htm), [F-15](https://man.fas.org/dod-101/sys/ac/f-15.htm), [F-16](https://man.fas.org/dod-101/sys/ac/f-16.htm), [F/A-18](https://man.fas.org/dod-101/sys/ac/f-18.htm) | Reproduces US Air Force and Navy fact sheets and programme notes, about 1998–2003 | Service specifications (thrust, speed, ceiling, range, armament, weapon loads), mission descriptions |

The F-86F and F-100D records cite Wikipedia only: FAS has no page for them, and
the US Air Force museum fact sheets were not reachable from the authoring
session (HTTP 403).

Key figures as read (extractor-read; check against independently retrieved
text and treat any mismatch as a finding):

- F-16 (FAS): F100-PW-200/220/229 or F110-GE-100/129; 27,000 lb thrust; Mach 2
  at altitude; ceiling above 50,000 ft; M61A1 with 500 rounds. Wikipedia specs
  (Block 50/52+): Mach 2.05, 1,176 kn at 40,000 ft; 295 nmi combat range hi-lo-hi
  with 4 × 1,000 lb bombs; 2,277 nmi ferry; ceiling 50,000 ft; up to 17,000 lb.
- F-15 (FAS): 25,000 lb each engine (C/D); Mach 2.5-plus; ceiling 65,000 ft;
  3,000 nmi ferry with CFTs and three tanks; M61A1 with 940 rounds; four AIM-9
  and four AIM-7, or AIM-120 combinations.
- F-14 (FAS): TF30-P-414A 20,900 lb (F-14A); F110-GE-400 27,000 lb (F-14B/D);
  ceiling above 53,000 ft; max Mach 1.88; carrier approach 125 kt; mission radius
  500 nm hi-med-hi, 380 nm hi-lo-lo-hi; up to six AIM-54, six AIM-7, four AIM-9.
  Wikipedia specs (F110 engines): Mach 2.34, 1,544 mph at 40,000 ft.
- F/A-18 (FAS): F404-GE-402 18,000 lb class; Mach 1.7 at 36,089 ft; combat
  radius greater than 500 nm. Wikipedia: Mach 1.8, 1,034 kn at 40,000 ft;
  ceiling 50,000 ft; 400 nmi air-to-air combat radius.
- A-10 (FAS): TF34-GE-100 9,065 lb; 420 mph (Mach 0.56); ceiling 45,000 ft;
  695 nm; GAU-8/A; 16,000 lb on 11 stations. Wikipedia: 381 kn at sea level
  clean; 1,174 rounds.
- AV-8B (FAS): F402-RR-408A about 22,200 lb (Night Attack); 550 KCAS; combat
  radius greater than 142 nm high-speed low-level; 9,000 lb on seven stations.
  Wikipedia: Mach 0.9, 585 kn; USMC retirement 3 June 2026.
- F-4 (FAS): F-4E first delivered October 1967; slats, extra fuel tank, internal
  20 mm gun; TISEO and Pave Tack from 1973; F-4G retired after December 1995.
- F-5 (FAS): Skoshi Tiger 1965; IFA winner 20 November 1970; Navy adversary use
  at about a third of F/A-18 operating cost; F-5E ceiling 51,800 ft.

## Narrative text and photographs

- Record bodies are written as narrative history (revision 1 of each record
  was rewritten before merge). Every paragraph still ends with its citation,
  and anecdotes (first flights, notable sorties, records) come from the cited
  articles' development and operational-history sections.
- Each record leads with a public-domain photograph from Wikimedia Commons
  (US military photographs), and most add a second. The caption is written
  from the Commons file description; the credit names the photographer,
  licence and Commons page. Files are resized to 1,280 px wide and served
  from `public/encyclopedia/aircraft/`.

## Modelling choices

- **One variant per record**, named on the data plate. Where the cited sources
  give figures for another variant (F-14 speed for F110-engined aircraft), the
  plate says so beside the figure.
- **Conflicting figures are shown side by side** with both citations rather than
  reconciled (for example F-14 Mach 2.34 vs 1.88, A-10 381 kt vs 420 mph).
- **Quick reference table** uses each record's `quick` numbers: first flight
  year, maximum speed in knots (converted from mph or km/h where the source
  gives those: 1 kt = 1.15078 mph = 1.852 km/h), and ceiling in feet. F-5E
  Mach 1.63 at 36,000 ft is converted with the speed of sound at that height in
  the standard atmosphere (573.6 kt), giving about 935 kt. The AV-8B ceiling is
  not given in the cited sources and is shown as "not given".

## Known gaps

- FAS pages describe late-1990s configurations; later upgrades (AESA radars,
  helmet cueing, new pods) are cited from Wikipedia only.
- US Air Force, US Navy and National Museum of the USAF fact sheets returned
  HTTP 403 to the authoring session, so their current versions are not cited.

## Source access for review

The SME source reader allows a fixed host list and at most eight URLs. These
records cite twenty URLs on two hosts (en.wikipedia.org, man.fas.org), neither
of which is on the reader's list, so the review sees the record text but not
the sources. The same applies to the merged SAM records.
