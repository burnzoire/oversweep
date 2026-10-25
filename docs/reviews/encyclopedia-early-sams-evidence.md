# Encyclopedia Threat Systems revision 1 — SA-1 to SA-9 evidence

Claim-to-source notes for the first encyclopedia records
(`content/encyclopedia/threat-systems/sa-1.md` to `sa-9.md`, rendered by
`src/pages/encyclopedia/[category]/[record].astro`). They are review evidence,
not instructions to the reviewer. Every record's frontmatter (data plate, radar
list, RWR symbols and the envelope drawn in Figure 1) and body cite numbered
sources listed in that file.

## Sources

| Source | Kind | Used for |
| --- | --- | --- |
| Wikipedia articles: [S-25 Berkut](https://en.wikipedia.org/wiki/S-25_Berkut), [S-75 Dvina](https://en.wikipedia.org/wiki/S-75_Dvina), [S-125 Neva/Pechora](https://en.wikipedia.org/wiki/S-125_Neva/Pechora), [2K11 Krug](https://en.wikipedia.org/wiki/2K11_Krug), [S-200](https://en.wikipedia.org/wiki/S-200_(missile)), [2K12 Kub](https://en.wikipedia.org/wiki/2K12_Kub), [9K32 Strela-2](https://en.wikipedia.org/wiki/9K32_Strela-2), [9K33 Osa](https://en.wikipedia.org/wiki/9K33_Osa), [9K31 Strela-1](https://en.wikipedia.org/wiki/9K31_Strela-1) | Secondary, read 25 October 2026 | Designations, dates, radars, guidance, envelopes, history for every record |
| [National Museum of the USAF, SA-2 fact sheet](https://www.nationalmuseum.af.mil/Visit/Museum-Exhibits/Fact-Sheets/Display/Article/196037/) | US Government | SA-2 site, flight profile, mobility, envelope drawn in Figure 1, history |
| [US Army Aviation Center, Heavy/Light OPFOR student handout (Jan 1998)](https://man.fas.org/dod-101/sys/land/row/avoac-opfor-sh.htm) | US Army training text, hosted by FAS | SA-6, SA-7, SA-8 and SA-9 range, minimum altitude, guidance and battery composition |
| [Heatblur DCS F-14 manual, AN/ALR-67](https://f14.manuals.heatblur.se/f14ab/systems/defensive_systems/rwr/alr_67.html) | Simulator documentation | RWR symbols 2, 3, 5, 6, 8 and FF; band meanings in Figure 2 |

Key passages as read (extractor-read through a web text tool; check against
independently retrieved text and treat any mismatch as a finding):

- Museum: minimum range 5 miles; maximum effective about 19 miles; maximum
  slant range 27 miles; ceiling about 60,000 ft; Mach 3.5; 288 lb
  blast-fragmentation warhead; booster drops away after about six seconds;
  site moved in about four hours; "The SA-2 did not operate alone, but as part
  of a complete system."
- OPFOR handout: SA-6 "Minimum Engagement Altitude (MEA): 50m", "Range: 24km",
  "Semi-Active Radar", four launch vehicles, one STRAIGHT FLUSH, two reload
  vehicles per battery; SA-7A/B MEA 15 m, range 3.6/5.5 km, passive IR, rear
  aspect; SA-8a/b MEA 10 m, range 12/15 km, command guided; SA-9 MEA 10 m,
  range 6.5 km, passive IR, rear aspect, four launcher boxes on a BRDM-2.
- ALR-67: "2" SA-2 Guideline Fan Song track radar (S-75); "3" SA-3 Goa Low Blow
  track radar (S-125); "5" SA-5 Gammon Square Pair track radar; "6" SA-6
  Gainful Straight Flush track radar (Kub); "8" SA-8 Gecko search and track
  radar (Osa); "FF" SA-2, SA-3 and SA-5 Flat Face search radar. Outer band:
  imminent threats; middle: within lethal range; inner: not capable of engaging.

## Modelling choices

- **Figure 1 envelopes** combine published minimum/maximum range (treated as
  slant range) with minimum/maximum altitude. This is a simplified educational
  model, labelled as such on every figure; it is not a launch zone. Tested in
  `tests/lessons/envelope.test.mjs` with hand-worked cases.
- **One variant per system** is drawn, chosen as the one with the most complete
  limits in the cited text: SA-2 museum figures; SA-3 V-601 "other sources"
  pair (2.5–22 km, 20 m–14 km) rather than the Pechora-2A upgrade; SA-5 S-200V;
  SA-6 missile effective figures; SA-7 Strela-2M; SA-8 9M33M2. Other published
  figures are tabled beside them on each page.
- **Missing limits are drawn dashed**, never invented: SA-1, SA-4, SA-5 minimum
  range; SA-1, SA-2, SA-5 minimum altitude; SA-9 ceiling (range drawn on the
  ground only).
- **RWR Figure 2** places search radars in the inner band and track radars in
  the middle band as an illustration of the band meanings; bearings arbitrary.

## Marked unverified

- SA-4: radio command guidance with terminal semi-active homing, and the NATO
  name "Pat Hand" for the 1S32. Widely published; not in the text read.
- SA-5: semi-active homing on the Square Pair's illumination. Follows from the
  radar's stated role; the guidance law is not in the text read.

## Known gaps

- Primary data sheets exist in the US Army *Worldwide Equipment Guide* (2011,
  vol. 2, approved for public release, apps.dtic.mil AD1117055, ch. 6), but the
  authoring session could only read its first chapters, so it is not cited.
- The SA-1 and SA-4 have no entry in the cited RWR table.

## Source access for review

The SME source reader allows a fixed host list and at most eight URLs. These
records cite twelve URLs on four hosts, three of them new (en.wikipedia.org,
www.nationalmuseum.af.mil, man.fas.org). See the PR for the reader change.

## Photos (record revision 1, issue #63)

Each record shows one photo, self-hosted under
`public/encyclopedia/threat-systems/<slug>.jpg` (resized to at most 1280 px
wide, metadata stripped) and stored in the record's `photo` frontmatter. The
licence was read on each file's Wikimedia Commons page on 25 October 2026. A
caption says only what the photo's own source description says; it is
illustration and credit, not a technical claim, and no data plate value or
figure relies on it. Active or wartime sites were preferred; where none was
found in the public domain, the caption says what the photo shows instead.

| Record | Commons file | Licence tag | What the source description says |
| --- | --- | --- | --- |
| SA-1 | [S-25 Berkut Kapustin Yar.JPG](https://commons.wikimedia.org/wiki/File:S-25_Berkut_Kapustin_Yar.JPG) | PD-self (photographer Kopwyh, 2007) | S-25 missile near site 30 of the Kapustin Yar range |
| SA-2 | [S-75 battery in NVietnam 1965.jpg](https://commons.wikimedia.org/wiki/File:S-75_battery_in_NVietnam_1965.jpg) | PD-USGov-Military-Air Force | USAF reconnaissance photo of a North Vietnamese SA-2 site, August 1965; NMUSAF photo 090605-F-1234P-001 |
| SA-3 | [Egyptian Missile Site - Flickr - The Central Intelligence Agency.jpg](https://commons.wikimedia.org/wiki/File:Egyptian_Missile_Site_-_Flickr_-_The_Central_Intelligence_Agency.jpg) | PD-USGov-CIA | Egyptian missile site captured by Israelis in the October 1973 war; from the CIA booklet on intelligence in that war. Commons files it under S-125; the launcher and twin-stage missile match the SA-3 |
| SA-4 | [SA-4 Ganef SAM.JPEG](https://commons.wikimedia.org/wiki/File:SA-4_Ganef_SAM.JPEG) | PD-USGov | SA-4 Ganef missiles on twin-round tracked launch vehicles; DoD still DF-ST-83-04925, 1 August 1982 |
| SA-5 | [SA-5s in Libya (in better quality).jpg](https://commons.wikimedia.org/wiki/File:SA-5s_in_Libya_(in_better_quality).jpg) | PD-USGov-Military-DIA | SA-5 missiles for Libya, 1986, Ronald C. Wittmann, DIA |
| SA-6 | [SA-6 Gainful SAM.JPEG](https://commons.wikimedia.org/wiki/File:SA-6_Gainful_SAM.JPEG) | PD-USGov-Military | Soviet tracked SA-6 Gainful launch vehicles; DoD photo dated 1977 |
| SA-7 | [SA-7 being used in Vietnam.jpg](https://commons.wikimedia.org/wiki/File:SA-7_being_used_in_Vietnam.jpg) | PD-USGov-Military-Air Force | North Vietnamese soldier preparing to fire an SA-7, 1970 to 1973; NMUSAF |
| SA-8 | [Soviet OSA SAM.JPEG](https://commons.wikimedia.org/wiki/File:Soviet_OSA_SAM.JPEG) | PD-USGov | Two SA-8 Gecko vehicles; DoD still DF-ST-83-04926, 1 August 1982 |
| SA-9 | [Soviet SA-9 Gaskin.jpg](https://commons.wikimedia.org/wiki/File:Soviet_SA-9_Gaskin.jpg) | PD-USGov | 9P31 launchers on BRDM-2 in Polish service; DoD still DF-ST-83-04921, about 1982 |

Commons is not on the SME source reader's host list, so these descriptions
are recorded here rather than fetched.
