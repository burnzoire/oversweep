# Post-WWII carrier catalogue

Delivery branch: `codex/carrier-catalogue`. One physical hull per record in `src/data/carriers.json`; generated under Locations / Carriers. The index links the existing Carrier and Amphibious Ship Operations module and sits beside a dedicated Theatres browse page. Carrier records also participate in shared Locations search.

## Inventory and evidence

92 hulls: 47 US-built, 21 British-built, 24 other construction/conversions. Research date: 29 October 2026. This is the coverage target within the explicit ship-type boundary, not a claim of independently validated global completeness. All content remains Drafted — not technically validated. Source notes are visible on each record. No performance, operational status, simulator representation or procedural values are inferred.

Completion after 2 September 1945 controls eligibility. First carrier commissioning is the proxy when completion is not separately documented. New conversions qualify; later refits and transfers of already completed carriers do not. Rabaul is completed but never commissioned. For Cavour and Eagle, completion rather than commissioning is displayed. Stable project-and-ship identifiers avoid treating changing Soviet pennants as immutable or shared class project numbers as unique hulls.

General amphibious assault ships are excluded, including Juan Carlos I, Trieste, Anadolu and Wasp-class ships. Dedicated helicopter types Ocean and Iwo Jima are included, as are full-length flight-deck DDHs and the dedicated Moskva-class and Jeanne d’Arc aviation ships. Smaller helicopter/missile cruisers Andrea Doria, Caio Duilio and Vittorio Veneto are explicit exclusions. This classification boundary is visible on the browse page.

## Regional research records


### US-built carrier inventory audit

Research cutoff: 29 October 2026. JSON: `/tmp/carriers-us.json`.

## Scope and inventory

47 physical hulls:

- 7 Essex-family fleet carriers first commissioned after 2 September 1945: Leyte, Kearsarge, Oriskany, Princeton, Tarawa, Valley Forge, Philippine Sea.
- 3 Midway-class fleet carriers: Midway, Franklin D. Roosevelt, Coral Sea.
- 2 Saipan-class light carriers: Saipan, Wright.
- 8 Commencement Bay-class escort carriers: Rendova, Badoeng Strait, Saidor, Sicily, Point Cruz, Mindoro, Rabaul, Palau.
- 20 hulls from CV-59 through CVN-78, inclusive: 4 Forrestal; 3 Kitty Hawk; 1 Enterprise; 1 John F. Kennedy; 10 Nimitz; 1 Gerald R. Ford.
- 7 purpose-built Iwo Jima-class helicopter assault carriers: Iwo Jima, Okinawa, Guadalcanal, Guam, Tripoli, New Orleans, Inchon.

Every date and ship identity was checked in indexed official NHHC/Navy text via web search. Some Navy live pages refuse direct web opening (403); indexed official text remains available. Sources per record identify the checked official article or history. No photographs or technical specifications were added.

## Boundary decisions

- **Rabaul is included despite never commissioning.** The ship was completed and delivered on 30 August 1946, accepted into the reserve fleet, and never entered active service. `commissioned: null`, `completed: '1946-08-30'`; the name does not carry USS. Source: https://www.history.navy.mil/research/histories/ship-histories/danfs/r/rabaul.html . Confirmed by NHHC photo NH 85461: https://www.history.navy.mil/our-collections/photography/numerical-list-of-images/nhhc-series/nh-series/NH-85000/NH-85461.html .
- **Saidor qualifies at 4 September 1945**, two days after the cutoff.
- **Badoeng Strait qualifies at 14 November 1945.** Bairoko, commissioned 16 July 1945, does not.
- **Salerno Bay and Kula Gulf are excluded**: 19 May and 12 May 1945, respectively. Do not use later reactivation dates as production dates. Official carrier table: https://www.history.navy.mil/content/dam/nhhc/research/histories/naval-aviation/dictionary-of-american-naval-aviation-squadrons-volume-1/pdfs/app2.pdf .
- **CVN-79 is excluded as unfinished**: official Navy statement dated 29 September 2026 records preliminary acceptance and formal delivery scheduled for spring 2027, with construction/testing remaining. https://www.paemaritime.navy.mil/press-release/navy-conducts-preliminary-acceptance-of-future-USS-JohnF-Kennedy-CVN79 . CVN-80 onward are likewise not completed.
- **Iwo Jima LPHs are included** as purpose-built helicopter carriers (parent scope direction), despite their amphibious role. Tarawa/Wasp/America LHA/LHD general amphibious ships remain excluded under the announced scope. WWII-built aircraft carriers converted to LPH are not new postwar production; Princeton and Valley Forge are already counted once from their postwar first commissioning, whereas Boxer and Thetis Bay are not added.
- **Uncompleted ships are excluded**: Reprisal CV-35, Iwo Jima CV-46, United States CVA-58; also cancelled Midway-class hulls.
- **WWII-built carriers modernised or recommissioned after WWII are excluded**. This includes Lake Champlain, Boxer, Antietam, Shangri-La, and the other pre-cutoff Essex, Independence, Casablanca, Bogue and Sangamon hulls, even if subsequently used by foreign navies. A transfer is not a new hull.

## Source limitations and conflicts avoided

The date is first commissioning, a completion proxy, unless explicitly labelled completed (Rabaul). No current active/reserve/scrapped statuses are inferred from historical pages. US-built records all have United States Navy as historical operator; Rabaul has no operational operator because it never commissioned.

DANFS sometimes calls long-hull Essex ships Ticonderoga class. The National Museum of the US Navy explicitly identifies Ticonderoga as the Essex long-hull class; records are grouped under Essex, not duplicated. https://www.history.navy.mil/content/history/museums/nmusn/explore/photography/ships-us/ships-usn-l/uss-leyte-cv-32-avt-10.html .

A legacy NHHC 1997 carrier chart prints Enterprise commissioning as 24 Nov 1961; current NHHC ship history and DANFS both state 25 November 1961. JSON uses 25 November. No old chart status or suspect construction chronology was copied.

Aliases record relevant later identity changes Saipan → Arlington, Wright → CC-2, and Princeton/Valley Forge → LPH. Proposed building names are not treated as later operating ships.

All records remain Drafted until independent source review. This is a bounded identity/class/first-date inventory, not a technical carrier performance reference.


### British-built carrier inventory — 29 October 2026

21 physical hulls: Colossus 4 (including aircraft-maintenance carrier Perseus), Majestic 5, Audacious 2, Centaur 4, Invincible 3, Ocean 1, Queen Elizabeth 2.

Scope is first completed carrier commission after 2 September 1945, not postwar service. Renamed/exported ships have one record per hull. Export orders count under British origin because the hulls were built in British yards, even where they never commissioned into the Royal Navy. HMS Ocean (L12) is included as a dedicated helicopter carrier per delivery-agent clarification; general well-deck assault ships are excluded.

Boundary exclusions:
- HMS Colossus / Arromanches: first commissioned 16 December 1944.
- HMS Glory: 2 April 1945.
- HMS Ocean (R68): 8 August 1945.
- HMS Venerable / Karel Doorman / ARA Veinticinco de Mayo: 17 January 1945.
- HMS Vengeance / HMAS Vengeance / Minas Gerais: 15 January 1945.
- HMS Pioneer: aircraft-maintenance carrier commissioned 8 February 1945.
- HMS Unicorn, wartime escort carriers, Illustrious and Implacable classes: first commissioned before the boundary, even when subsequently modernised or recommissioned.
- HMS Leviathan: incomplete hull, never entered carrier service.
- Incomplete/cancelled later Centaur-class hulls, additional Audacious hulls, Malta and CVA-01 projects: not completed.

Inventory cross-check: Royal Navy carrier list, Colossus/Majestic/Audacious/Centaur/Invincible/Queen Elizabeth sections, retrieved through web tool; https://en.wikipedia.org/wiki/List_of_aircraft_carriers_of_the_Royal_Navy. This is a secondary completeness cross-check, not the default source of row claims. Ocean is added from Royal Navy and Brazilian Navy histories.

Evidence qualifications:
- The JSON supplies a source register for every row. Primary government/navy histories support exports and modern British ships; several older British hulls require explicitly labelled secondary historical sources (Theseus, Centaur/Albion/Bulwark and Perseus) pending deeper original archive review.
- Commissioning is a proxy for completed production; original laid-down dates are intentionally not part of this minimum record schema.
- Year precision deliberately avoids conflicting exact-day dates for Warrior, Theseus, Triumph, Centaur, Albion, Bulwark and Eagle. The data do not choose arbitrarily between completion/acceptance/first-commission dates.
- RAN Sea Power Centre Sydney introduction incorrectly conflicts with its own specification table (1949 versus 1948). The separate official RAN Fleet Air Arm history confirms 16 December 1948 and is used for the date.
- Bonaventure: official Canadian Navy history and government naval history say 17 January 1957; an older CFB museum article says 21 January. Official RCN history is used.
- HMS Magnificent was loaned to Canada and later returned to Royal Navy custody; no subsequent RN operational commission is implied. Operators therefore lists Canada only.
- HMS Perseus was explicitly completed as an aircraft-maintenance carrier without a normal flying role, although it later conducted steam-catapult trials. The field classification makes this exception visible.
- No current in-service status or technical performance is inferred. No source passages are copied verbatim into summaries.

Review remains Drafted until independent source-backed review of the delivery revision. This research pass is not an independent aviation validation of authored content.


### World carrier inventory research — 29 October 2026

24 physical hulls outside the US/UK construction groups:

- France: Clemenceau, Foch/São Paulo, Charles de Gaulle, Jeanne d’Arc (4).
- Italy: Giuseppe Garibaldi/Sriwijaya, Cavour (2).
- Spain: Príncipe de Asturias, Thailand’s Chakri Naruebet (2).
- Soviet designs/build: Moskva, Leningrad, Kiev, Minsk, Novorossiysk, Baku/Gorshkov/Vikramaditya, Kuznetsov, unfinished Varyag completed as Liaoning (8).
- China new construction: Shandong, Fujian (2).
- India new construction: Vikrant (1).
- Japan full-length aviation-deck DDH: Hyūga, Ise, Izumo, Kaga (4).
- Iran completed conversion: Shahid Bahman Bagheri (1).

## Important identity and date decisions

Fujian commissioned 5 November 2025, confirmed by official Chinese Ministry of National Defense reporting. Include it; do not leave it under construction.

Giuseppe Garibaldi entered Indonesian Navy service as KRI Sriwijaya-100 on 24 September 2026. This is verified in Indonesia’s Ministry of Defence report, with the former Italian identity explicit. Both navies/aliases are in one record.

Cavour: builder and Italian Navy distinguish March 2008 delivery from 10 June 2009 battle-ensign ceremony. The delivered record uses `completed: 2008`, with commissioning left unspecified. Summary explicitly says delivery. Do not silently label it a 2009-built ship or claim the battle-ensign ceremony was physical completion.

Kuznetsov: acceptance (December 1990) and commissioning (January 1991 in the contemporary US Navy ONI source) differ. Listed year1991 follows the contemporary ONI statement; summary preserves distinction. Full ONI PDF was rejected by web tool for size; only indexed extract inspected. Its identity/aliases are supported by an explicitly secondary reference. Not independently technically validated.

Novorossiysk: secondary references disagree between August acceptance/flag raising and September commissioning; use year1982, with disagreement explicit. Leningrad also has distinct flag raising, acceptance and service dates; record follows specialist RussianShips.info service date2 June1969. Never describe all these milestones as interchangeable.

Chakri Naruebet: Royal Thai Navy primary source and Thai government history both say20 March1997 (2540 Buddhist Era). Use that; some English secondary sources say27 March. Government page names builder Bazán in Spain and hull911.

No duplicated physical hulls for Foch/São Paulo, Baku/Gorshkov/Vikramaditya, Varyag/Liaoning, Garibaldi/Sriwijaya.

## Scope exclusions

General amphibious assault ships are excluded per root’s scope decision, even when they can operate fixed-wing aircraft: Juan Carlos I, Trieste, Anadolu; Dokdo/Marado, Mistral, Canberra/Adelaide, China’s Type075 and Type076, and comparable aviation-capable amphibious vessels. They need a separate amphibious-ship inventory rather than silently presenting this as all helicopter-capable warships.

Italian helicopter/missile cruisers Andrea Doria, Caio Duilio, Vittorio Veneto are excluded by root’s scope decision. Sources found: official Italian Navy historical pages identify them as missile cruisers with helicopter facilities. Japanese Haruna/Hiei/Shirane/Kurama similarly excluded; conventional destroyers with helicopter facilities rather than the full-length aviation deck of Hyūga/Izumo. Moskva/Leningrad and Jeanne d’Arc remain included as dedicated helicopter aviation ships, official cruiser terminology retained.

France’s WWII-built Arromanches, La Fayette, Bois Belleau and Dixmude are excluded here; US/UK research owns hulls from those countries. The first Indian Vikrant and Viraat are UK-built; not in this file. Spain’s Dédalo is the WWII USS Cabot hull; not new postwar construction.

Ulyanovsk and other cancelled/incomplete hulls are excluded. Liaoning qualifies because its previously unfinished hull was completed in China and actually commissioned.

Dedicated commercial research drone-motherships and ships with drone launch pads are excluded; Iranian Bagheri is an actually commissioned dedicated fixed-wing drone carrier conversion.

## Evidence limitations

Most western/Asian records have official operator or builder primary sources. The Soviet historical original-date records rely partly on labelled secondary specialist sites (RussianShips.info, MaritimeQuest, Navypedia), because usable official original ship histories were not retrieved. These rows are Drafted, not independently technically validated. Only minimal historical identity/date facts are included; no displacement, airgroup count, weapons, range, speed, arresting/catapult procedures, claimed endurance, or simulator compatibility is inferred.

Iranian commissioning is documented by Janes and Naval News reporting the actual induction ceremony. No unsupported official performance claims are adopted. Its original merchant-hull origin is not used to imply Iran constructed the original merchant ship; `origin: Iran` describes the completed aviation conversion.

Russianships’ hull pennant histories vary by year, so Soviet carrier `hull` fields use stable project identifiers rather than pretending changing pennants are immutable. The UI should label this field ‘Hull / project’ or ‘Identifier’, not ‘Hull number’.


## Independent review

### Independent carrier catalogue review

Reviewer: fresh-context Codex agent /root/carrier_review, independent of implementation and research authors. Review session 28 October 2026 UTC; catalogue uses 29 October 2026 snapshot. Base HEAD 79b5030736144db33d0b7723d30653690ca5d0f9 with uncommitted working tree changes. This report does not establish whole-catalogue technical validation.

## Inspected scope and files

Read AGENTS.md, README.md, docs/vision.md, docs/content-catalogue.md, docs/content-standards.md, docs/architecture.md, docs/development.md, docs/progress.md; inspected src/data/carrier-model.mjs, src/data/carriers.ts, src/data/carriers.json (92 assembled records), src/pages/encyclopedia/locations/carriers/index.astro, src/pages/encyclopedia/locations/carriers/[slug].astro, src/pages/encyclopedia/locations/theatres/index.astro, src/components/encyclopedia/CarrierModuleLink.astro, src/scripts/carrier-filter.mjs, src/pages/encyclopedia/[slug].astro, src/pages/encyclopedia/index.astro, scripts/check_site.mjs, scripts/check_encyclopedia.mjs, tests/encyclopedia/carriers.test.mjs, and all three research JSON files and notes in /tmp. UI agent was still editing shared Locations filters; no implementation edits made by reviewer.

## Findings and resolution

1. Initial model validated only completed-or-commissioned precedence, permitting a wartime commissioned carrier with later completed date. Reported to delivery agent; final reread confirms each supplied date is checked against cutoff independently. Resolved in inspected working tree.
2. Cavour delivery2008 and HMS Eagle completion1951 were stored as commissioned, causing wrong Carrier commission labels. Primary source distinction independently checked below. Both now use completed and nullcommission. Resolved in inspected92 records.
3. origin was displayed as Built in even for Bagheri, whose Iran origin denotes conversion location. Reported to delivery/UI agent; promised Built/converted in label must be checked in final UI revision.
4. BLOCKER at last test run: Leningrad and Minsk share project identifiers with Moskva and Kiev respectively; validateCarriers reports duplicate origin/class/hull. Six focused tests: five passed, real-registry test failed with these two errors. Delivery agent informed. Need separate unambiguous identity from shared class/project display identifier, then rerun.
5. Scope wording must explain why dedicated helicopter carriers Moskva/Leningrad/Jeanne and full-flightdeck DDHs are included while Doria/Caio/Veneto, Haruna/Shirane and general well-deck amphibious ships are excluded. Delivery agent explicitly chose this boundary and promised named exclusions. Italian naval sources actually call Doria/Caio/Veneto helicopter cruisers, so merely saying all helicopter cruisers would be inaccurate. This is a declared editorial boundary, not a claim of a universally accepted carrier taxonomy.

## Independent source inspections

Primary pages fully opened:

- https://www.kemhan.go.id/2026/09/24/kri-sriwijaya-100-resmi-memperkuat-kekuatan-pertahanan-maritim-indonesia.html — Indonesia Ministry of Defence,24 September2026, lines117–120. Confirms Sriwijaya100 commissioned24Sep2026; formerly Italian Giuseppe Garibaldi, Fincantieri Italy construction. One-hull identity/transfer decision supported. No aircraft-performance claims adopted.
- https://www.paemaritime.navy.mil/press-release/navy-conducts-preliminary-acceptance-of-future-USS-JohnF-Kennedy-CVN79 — US Navy,29September2026, lines9–13. Preliminary acceptance while ship99%complete; final systems testing still under way, formal delivery Spring2027. CVN79 exclusion as unfinished is justified despite acceptance trials.
- https://www.ihi.co.jp/all_news/2008/other/1188399_1776.html — IHI shipbuilder,18March2009, lines90–99. Hyuga DDH delivery/flag ceremony18March2009; specifically first full-flightdeck DDH and successor to Haruna. Supports date and distinction from conventional helicopter-equipped destroyer.
- https://www.ihi.co.jp/all_news/2010/other/1190129_1746.html — IHI shipbuilder,16March2011, lines90–99. Ise delivery/flag ceremony16March2011, second Hyuga-class hull; Japanese construction.
- https://www.rmg.co.uk/collections/objects/rmgc-object-67566 — Royal Museums Greenwich, Admiralty commissioned model SLR1607. Open returned page; indexed substantive collection text inspected: plaque states completedOctober1951, Audacious-class identity, Belfast construction. It supports completion, not a precise commission day.

Primary indexed passages inspected; independent direct opens failed or not attempted (these are limited evidence, not fully fetched source verification):

- https://www.history.navy.mil/research/histories/ship-histories/danfs/r/rabaul.html — NHHC DANFS complete indexed narrative: laid down2Jan1945, completed Commercial Iron Works and delivered30Aug1946, accepted by reserve fleet, no active service. Direct open502. https://www.history.navy.mil/content/dam/nhhc/research/histories/naval-aviation/pdf/APP03.PDF indexed table explicitly says never commissioned; inactivated after trials30Aug1946. Supports special completed-but-never-commissioned case without inventing commission.
- https://www.history.navy.mil/research/histories/ship-histories/danfs/s/saidor.html — NHHC DANFS complete indexed opening gives commission4Sep1945. Direct open502. Confirms narrowly post-cutoff inclusion.
- https://www.history.navy.mil/research/histories/ship-histories/danfs/p/point-cruz.html — NHHC indexed DANFS gives commission16Oct1945; distinguishes recommission26July1951. Catalogue uses first commission correctly.
- https://eng.mod.gov.cn/2025xb/D/V/16420460.html — China Ministry of National Defense,7Nov2025, indexed report explicitly commissions Fujian5Nov2025. Direct open timed out. Separate government article https://english.www.gov.cn/news/202511/07/content_WS690d990cc6d00ca5f9a0764d.html corroborates dated ceremony and hull18. Inclusion supported at indexed-primary level.
- https://www.marina.difesa.it/noi-siamo-la-marina/pilastro-operativo/mezzi/forze-navali/Documents/-CAVOUR-20150506.pdf — Italian Navy, indexed Generalita paragraph gives March2008 delivery and10June2009 battle ensign/entry into squadron; supports resolved distinction.
- https://archives.defense.gouv.fr/content/download/156662/1589944/version/1/file/PH%2BJeanne%2Bd/%27Arc%2B-%2BJournaux%2Bde%2Bbord%2B%EF%80%A2%2BMarine%2Bnationale%2B-%2BPage1.pdf — Marine Nationale ship journal presentation: Jeanne dArc R97, service16July1964, helicopter carrier/training role. Indexed primary passage only.
- https://www.royalnavy.mod.uk/news/2016/december/07/161207-pride-on-new-carrier-as-illustrious-leaves-portsmouth — indexed Royal Navy article expressly dates at-sea commissioning20June1982. Separate MOD recycling report https://assets.publishing.service.gov.uk/media/5ae70682ed915d42f7c6bc01/DSA_Ship_recycling_report_Illustrious_Digital.pdf says formally commissioned20March1983 on return; distinction is ceremony/formality, not evidence to discard first1982 service. The recorded1982 date follows the cited RN article.
- https://www.marina.difesa.it/noi-siamo-la-marina/pilastro-operativo/mezzi/mezzi-storici/Pagine/ABCD/andrea_doria_incrociatore.aspx — Italian Navy indexed history identifies helicopter/missile cruiser, completed1964, twinCaioDuilio. https://www.marina.difesa.it/media-cultura/editoria/notiziario/Documents/2021/giugno/Notiziario_della_Marina_giugno_2021.pdf gives VittorioVeneto delivery12July1969, service31Oct1969. These support naming the exclusions accurately rather than declaring they lack helicopter-cruiser designation.

## Inventory, identity and remaining limitations

47US-built +21UK-built +24other=92 hulls. Reviewed class rosters and boundary exclusions; no additional fixed-wing/escort hull omission identified within the chosen completed-after2Sep1945 scope. This is a sample-based completeness assessment, not proof of exhaustive global coverage. Wartime carriers transferred postwar are correctly not recounted merely for transfer; Liaoning previously unfinished Varyag is distinct from a completed wartime carrier; Garibaldi/Sriwijaya, Foch/SaoPaulo and Baku/Gorshkov/Vikramaditya remain one record each.

Soviet original dates rely substantially on secondary sites; Kuznetsov ONI source only indexed excerpt, no full PDF read. Iran Bagheri uses secondary Janes/NavalNews commissioning reports and original merchant-hull construction is not verified. British Centaur and several original dates are year-only with secondary support. Not every listed reference was independently retrieved and no whole-catalogue TechnicallyValidated status is justified. Drafted—not technically validated is the correct visible status. No operational calculations, limitations or procedures reviewed or added.

Final build, base-path, browser accessibility/visual verification and resolution of duplicate project identities remain delivery-agent responsibilities. Re-review material fixes required before closing this report.

## Final correction re-review

Rechecked92-record registry after delivery-agent fix: repeated project identifiers now append sourced ship names (e.g. Project1123 — Leningrad; Project1143 — Kiev/Minsk), preserving duplicate detection without inventing pennants. Focused node --test tests/encyclopedia/carriers.test.mjs now passes6/6 including the populated registry. UI files now display Identifier and Built / converted in. Cavour and Eagle completed fields remain correct; every supplied date receives cutoff validation. No remaining implementation blocker identified in the reviewed code. Requested named helicopter-type exclusions were still being authored at reread; final text and browser/build checks remain delivery-agent verification.

Exact re-reviewed file SHA256: src/data/carriers.json d918414541e02349da3b114bc65539fb942dfc8f8bc6213302cee1e4dbb7e259; src/data/carrier-model.mjs e4c480e808d51a00784a689d8b2a1fd083167dc50552cb1e1141196bbc88ebde; tests/encyclopedia/carriers.test.mjs7e3eb7b277d66dbebf0588321438b5bb39fe0c2b80e9ce79f9215db64824f636. All sample-based factual/source limitations above continue to apply; content remains Drafted.

## Delivery verification

- `npm run check`: 214 tests passed; Astro zero errors; production build423 pages; output checks passed.
- `npm run check:review`: passed at `/oversweep`, including all92 carrier routes.
- `npm run check:dev`: all four development HTTP-route checks passed.
- `python3 scripts/check_docs.py`: passed280 text files; `git diff --check` passed.
- Chromium browser verification at1280,768 and390px: no page overflow on index and representative records; all92 rows; class/name/alias/diacritic search; British-origin21 filter; date sorting and query reload; keyboard focus; Rabaul/Cavour/Eagle/transferred-hull pages; module links; shared Locations type filter and Theatres sibling links passed. The separate index uses a horizontally scrollable table on narrow screens.
- Independent review is sample-based. Findings for date-validation bypass, duplicate Soviet project identifiers and completion/commission labels were resolved. The final source and evidence limitations above remain applicable.

No merge, deployment or change to existing content maturity is performed by this delivery.

## Final independent code re-review

The fresh-context reviewer rechecked Unicode search normalization, the named ship-type disclosure, the populated92-record registry and the combined-date boundary regression. All seven focused tests and independent search checks passed; no remaining code blocker was identified. The reviewer did not independently rerun the full214-test/build/browser evidence and did not promote factual maturity. Core final file hashes: registry `d918414541e02349da3b114bc65539fb942dfc8f8bc6213302cee1e4dbb7e259`; model `b664211e49247fc1c8a2746cb251093481ad22873be4cd02afd2cd89b5749a2d`; carrier index `bd4720e7b7864018218093a88d9cfe622c75d783af656ade2e2ee3c332c4e4a9`.
