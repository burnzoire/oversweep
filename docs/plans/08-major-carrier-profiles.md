# Major carrier profiles

## Delivered scope

The user requested more information for the major Nimitz and Gerald R. Ford classes. Two shared class profiles add 22 characteristics and eight explanatory sections; 11 ship profiles add individual overviews and 46 dated milestones. The class baseline is stored once in `src/data/carrier-profiles.json`, linked from the carrier index and rendered on the class and matching hull pages. Identity records, the 92-hull catalogue, category thumbnail and Naval Operations links are preserved.

Canonical class routes are `/encyclopedia/carriers/classes/nimitz/` and `/encyclopedia/carriers/classes/gerald-r-ford/`. Every new summary, characteristic, explanatory section, ship overview and milestone has local source references. Class and ship-history sources have separate HTML anchor namespaces. The model and generated-output checks reject missing classes, unknown source IDs, duplicate profiles, invalid dates, missing member histories and broken profile/source/module links.

All new profiles remain **Drafted — not technically validated**. Source notes distinguish full primary-document retrieval from official indexed passages. Dimensions are rounded conversions with the original source units retained. Published complement and air-wing figures are qualified reference values. The content does not infer current fleet status, a current aircraft complement, operational limits or simulator representation. Radar fit is differentiated between the Ford lead ship and later hulls.

## Research and claim mapping

Per-claim citations and source notes live with the dataset; the following notes record inspected passages, conversions and exclusions.


### Nimitz class and early ship profiles — research notes

Research/access date: 2026-10-29. All supplied profiles are **Drafted**, not independently technically validated. Research files are intermediate handoff artifacts; no repository files were edited.

## Coverage

- `/tmp/nimitz-class-profile.json`: shared Nimitz-class reference, ten facts, four aviation sections, five sources, summary-level and block-level source IDs.
- `/tmp/nimitz-early-ship-profiles.json`: exactly the registry slugs for Nimitz, Dwight D. Eisenhower, Carl Vinson, Theodore Roosevelt and Abraham Lincoln. Each has an individual overview and three or four historical milestones with source IDs.
- Read repository AGENTS.md plus content standards, architecture and catalogue for applicability and maturity rules.

## Inspected evidence

Full pages/text successfully inspected:

1. NAVAIR **Advanced Arresting Gear (AAG)**, Description paragraphs 1–2: identifies Nimitz Mk-7 Mod 3/Mod 4, contrasted in that source with Ford AAG. Used only for the Nimitz system identity.
2. **FRCSW Almanac**, June 2012, Volume 5 Issue 6, printed pp. 4–5 / PDF pp. 4–5: four steam catapults and cylinder/piston/shuttle operation; paraphrased only at mechanism level.
3. NAS Pensacola **VF-84 in Desert Storm: Letters From Home**, 6 May 2022, full DVIDS printable report: Theodore Roosevelt entered the Persian Gulf and launched first combat strike 19 January 1991. Date supported by the report’s quoted command-history account. No quoted recollections reproduced.
4. HII **Newport News Shipbuilding Redelivers … Theodore Roosevelt**, 29 August 2013, main release paras. 1–5: redelivery after trials and refueling/modernization of reactors, propulsion, combat and aviation support systems.

Official indexed source passages inspected through web search; direct page/PDF fetch attempts failed (403, 502 or timeout):

5. AIRPAC **Important Links and Info**, class characteristics: 1,092 ft length, 134 ft hull beam, 252 ft flight-deck width, two reactors, four shafts, 30+ kn. Indexed table includes stale homeports and inconsistent displacement-unit presentation; those were excluded.
6. NAVSEA SNA 2020 Capt. Philip Malone briefing, p. 4 **Gerald R. Ford Class — More Capable**: class comparison explicitly gives Nimitz four steam catapults, four aircraft elevators, 4.5-acre flight deck and three hangar bays. No sortie-rate, aircraft-capacity, elevator-load or crew accommodation comparison adopted.
7. OPNAVINST 3501.316C (2017), air-wing organization d(1)–(4): strike fighter, early-warning, electronic warfare and helicopter role categories. No exact squadron/aircraft allocation presented as 2026 fact. Indexed text contains all role categories used.
8. Nimitz AIRPAC history: October 1988 North Arabian Sea/Earnest Will. Navy’s 2018 **50 Years of Teamwork and Tradition** report: keel 22 June 1968 and commissioning 3 May 1975. DON CIO CHIPS 4 November 2014 report: F-35C’s first arrested carrier landing aboard Nimitz on 3 November 2014. Source scope carefully preserves F-35C, rather than implying all F-35 variants or an operational deployment.
9. Eisenhower AIRLANT Command History: commissioned 18 October 1977; 1990 Red Sea operations/interception; September 1994 Army 10th Mountain Division embarkation for Haiti; RCOH began 24 May 2001 and return Norfolk 25 January 2005. Complete indexed multi-paragraph history inspected. No disputed blanket statement on women’s first combatant deployment adopted.
10. Vinson Navy 15 March 2022 anniversary report: third Nimitz-class carrier, commissioned 13 March 1982. The report erroneously calls namesake Carl Vinson a senator; that claim was excluded. NHHC humanitarian history supports Haiti 2010 Unified Response. U.S. 3rd Fleet/Pacific Fleet 2 August 2021 release supports that day’s departure and first CSG deployment with F-35C and CMV-22B.
11. Theodore Roosevelt 1987 command-history narrative on NHHC: first captain Parcells and commissioning 25 October 1986. This is a separate source from full-read combat and overhaul evidence.
12. Lincoln AIRPAC History, complete indexed multi-paragraph text: commissioning 11 November 1989; 1991 Pinatubo/Fiery Vigil; tsunami diversion to Unified Assistance after December 2004, return March 2005; RCOH 28 March 2013–15 August 2017. No questionable casualty/people-saved estimates, evacuation totals or stale “currently operating” location adopted.

Each indexed-only source is explicitly identified in its JSON source note. These are actually retrieved official source excerpts, not guessed URLs or unsupported remembered facts. However, blocked original fetches are a material evidence limitation for independent validation; a reviewer should retrieve originals before advancing affected claims beyond Drafted.

## Conversions and qualification

- 1,092 ft × 0.3048 = 332.8416 m, rounded approximately 333 m.
- 134 ft × 0.3048 = 40.8432 m, approximately 40.8 m.
- 252 ft × 0.3048 = 76.8096 m, approximately 76.8 m.
- 4.5 international acres × 4,046.8564224 = 18,210.8539008 m², approximately 18,200 m².
- 30 kn × 1.852 = 55.56 km/h, approximate reference threshold 56 km/h. Knots retained as primary speed unit.
- All figures are approximate official class-reference figures; no assumption that every refit/year/hull has identical dimensions or facilities details. NAVSEA facilities figures explicitly dated 2020.
- No universal aircraft count, current status, homeport, current embarked wing, wire count or deck-angle value. No current 2026 readiness inferred from historical reports.
- No flight procedures, launch settings or recovery technique taught. Four sections address facilities, steam launch mechanism, arresting system identity and air-wing role categories only.
- Concise original paraphrase throughout. Under 200 derived words from any single cited source across both JSON files; no source text copied verbatim as a passage.

## Checks and remaining work

JSON parsing and citation-ID resolution passed for class and all five ships. Parent delivery agent owns schema integration, site checks and any independent technical review. No independent review was performed by this author, and no claim is marked Technically Validated.


### Nimitz late-ship research notes

All proposed content remains Drafted. Research-only output; no repository edits. Accessed 2026-10-29. Exact slugs checked against src/data/carriers.json. Existing commissioning values were read and left unchanged: CVN-73 1992-07-04, CVN-74 1995-12-09, CVN-75 1998-07-25, CVN-76 2003-07-12, CVN-77 2009-01-10. No commissioning conflict established by this research.

## Retrieval and limitations

The web search tool returned official Navy article/history text at the cited primary-source URLs. Many direct opens returned HTTP 403, so their source notes explicitly identify reliance on retrieved search-index text. This is not a claim of successful direct-page access. NAVAIR 20401 and 20426 and the unusual indexed Truman Command-History/www.safehelpline.org/ URL opened successfully. If the delivery acceptance requires direct opens for every source, treat the other sources as access-limited and retain Drafted maturity.

No current homeport, assigned air wing, readiness or active-deployment claim is made. Future completion predictions in the Stennis 2024 article and the Washington 2022 retrospective were omitted. Dates shown as a year intentionally retain month precision only in prose. Reagan March 2011 is not assigned an inferred exact day.

## Claim mapping

### uss-george-washington

Overview: gw-30-years, gw-rcoh-completed.

- 2001: gw-30-years.
- 2008: gw-30-years.
- 2017-08-04: gw-rcoh-completed.
- 2023-05-25: gw-rcoh-completed.

- gw-30-years: turn57search0; direct open turn59view4 failed 403. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 69.
- gw-rcoh-completed: turn69search2; direct open turn70view1 failed 403 (entry date corroborated by turn57search1). Derived profile prose word count (conservative, counting multi-cited overview fully against each): 57.

### uss-john-c-stennis

Overview: stennis-past, stennis-vfa146, stennis-rcoh-start, stennis-undock.

- 1998-02-26: stennis-past.
- 2001-11-12: stennis-vfa146.
- 2021-05-06: stennis-rcoh-start.
- 2024-04-08: stennis-undock.

- stennis-past: turn61search0; direct open turn59view0 failed 403. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 55.
- stennis-vfa146: turn61search6. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 68.
- stennis-rcoh-start: turn57search5. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 59.
- stennis-undock: turn69search0; direct open turn70view0 failed 403; date also builder turn69search3. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 64.

### uss-harry-s-truman

Overview: truman-command-history.

- 2000-11-28: truman-command-history.
- 2003-03-19: truman-command-history.
- 2005: truman-command-history.
- 2011: truman-command-history.

- truman-command-history: turn57search6; successful direct open turn70view4. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 105.

### uss-ronald-reagan

Overview: reagan-history.

- 2004-05-27: reagan-history.
- 2006-01-04: reagan-history.
- 2011: reagan-history.
- 2015-08-31: reagan-history.

- reagan-history: turn57search7 and turn66search0; direct open turn70view5 failed 403. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 109.

### uss-george-h-w-bush

Overview: bush-command-history, bush-ucas-timeline, bush-x47-landing.

- 2011-05-11: bush-command-history.
- 2012-07-25: bush-command-history.
- 2013-05-14: bush-ucas-timeline.
- 2013-07-10: bush-x47-landing.

- bush-command-history: turn63search0; direct open turn59view1 failed 403. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 69.
- bush-ucas-timeline: turn63search3; successful direct open turn70view3 lines 122-123. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 52.
- bush-x47-landing: turn63search1; successful direct open turn70view2 lines 87 and 97-106. Derived profile prose word count (conservative, counting multi-cited overview fully against each): 57.

## Exclusions

The Washington 2022 retrospective appears to conflate the 2015 transfer voyage with Hurricane Matthew relief (2016); that passage was excluded. The Reagan history contains a suspect 1988 keel-laying statement; construction chronology was excluded. No content derived from these questionable passages. All included profile prose is concise paraphrase, with no source exceeding 200 derived words.

Validation: JSON parsed; five expected slugs; four milestones each; all citation IDs resolve within each profile; no duplicate source IDs.


### Ford profile research — 29 October 2026

All new text is paraphrased. NAVAIR EMALS and AAG product descriptions and HII 15 August 2013 elevator release were fully opened and inspected. The official Navy/AIRLANT/NAVSEA narrative passages for other rows were available as indexed primary text, while direct web opens returned HTTP 403. Source notes disclose that limitation. Content remains Drafted; no operational limitations or procedures are specified.

Class dimensions are deliberately CVN-78 command-history figures: length1,106ft, deck width256ft,100,000longtons full load. Older generic Navy sheets list1,092ft; that conflict is disclosed in the source note. Independent unit conversions for review:1,106×0.3048=337.1088m → about337m;256×0.3048=78.0288m → about78m;100,000×1.0160469088=101,604.69088 metrictonnes → approximately101,600tonnes. Figures are approximate by source, not tolerances. No beam value is adopted from the command page's apparent “Height:134feet” label.

Complement4,539 and aircraft75+ come from the undated Ford media kit and are labelled published reference figures, not live observed staffing, a fixed maximum or a current embarked air wing. No 65+ vs75+ reconciliation is invented. Source age and variation remain visible.

Full NAVAIR descriptions support EMALS stored kinetic energy/electrical conversion and AAG energy absorbers/power conditioning/digital control. Claimed reliability and expanded aircraft envelopes are treated as design intent; no certified envelope or sortie rate is asserted. The HII release explicitly compares three Ford aircraft elevators with four Nimitz elevators. NAVSEA's23December2021 narrative dates final11th AWE turnover to22December; that event is not conflated with2017commissioning.

Ford's DBR is not generalized to later hulls. Navy3November2020 article states EASR forCVN79; its obsolete delivery forecast is not adopted. The2022 airwing example is a historical workup configuration, not a current assignment or evidence that CVN78can fly every aircraft planned for future Fordhulls. Fixedwing firstlaunch/recovery28July2017, FSST completion8August2021, firstdeployment4October2022 and return26November2022 are mapped to separate official source passages.

CVN79remains outside the92completed-hull registry: official Navy PAE29September2026 preliminaryacceptance report states finalsystems testing remains and formal deliverySpring2027. No newcataloguehull or statusupdate is made here. The cited current2026scopecheck was independently retrieved earlier byroot; the new profile does not add a currentCVN79 claim.


## Independent review

### Independent major-carrier profile review

Reviewer: fresh-context GPT-6 Codex agent `/root/ford_details/independent_review`; 2026-10-29. Base HEAD `25d18bbaae2ede7add3f66caa584e66c947c96ad`; uncommitted implementation reviewed. Profile JSON SHA-256 at first review: `8b8345e8e7a7c6049e74f0eedf40075bea7e30c7c5460be2187d06c25b90a5d0`; pure model SHA-256 `d039d3a4ac4a829501510ad1847676e8d3cb845d07bf0a2f843ad3fc531fe5c3`.

## Findings

1. **Material content correction (resolved): Abraham Lincoln RCOH completion.** Existing milestone 2017-08-15 follows retrospective command-history wording, but contemporaneous Navy and builder releases explicitly establish redelivery and RCOH completion 12 May 2017. Replace date/text with 2017-05-12 redelivery after sea trials and cite contemporaneous release. Record the rejected August date as a source conflict in the source note. Sources independently retrieved: https://www.navy.mil/Press-Office/Press-Releases/display-pressreleases/Article/2252045/lincoln-achieves-redelivery/ and https://www.hii.com/news/video-release-huntington-ingalls-industries-redelivers-aircraft-carrier-uss-abraham-lincoln-to-u-s-navy . NAVSEA-authored 2023 GW RCOH release corroborates May 2017.
2. **Minor editorial correction (resolved): undefined abbreviations.** Ford class prose and hull milestones use CVW-8 and VX-23 without first-use definitions. Expand Carrier Air Wing 8 and Air Test and Evaluation Squadron 23 respectively, per content standards.

## Code and evidence review

Read AGENTS.md, content standards, project context documents, new JSON/type/pure validator/components/class route/checker/tests and modifications to catalogue index and hull pages. Class and hull citation namespaces stay separate; component source anchors match citations; links consistently pass routes through sitePath; original 92 registry records remain untouched. Class pages obtain an h1 from SiteLayout. Model validates unknown references, duplicate identities, claim citations, snapshot/access/event dates and nonempty content. No implementation blocker found. Ran `node --test tests/encyclopedia/carrier-profiles.test.mjs`: 6/6 passed.

Two class records, eleven hull records and 46 milestones inspected. Independent conversions: 1092 ft × .3048 = 332.8416 m; 134 ft = 40.8432 m; 252 ft = 76.8096 m; 4.5 acres × 4046.8564224 = 18210.8539008 m²; 30 kn × 1.852 = 55.56 km/h; 1106 ft = 337.1088 m; 256 ft = 78.0288 m; 100000 long tons × 2240 lb/long ton × .45359237 kg/lb ÷ 1000 = 101604.69088 tonnes. Displayed rounding is sound. Speed remains a published lower bound.

Independent official indexed passages support Nimitz dimensions/two reactors/four shafts/30+ kn; four steam catapults/four aircraft elevators/three hangar bays/4.5 acres; Mk-7 Mod 3/4 applicability; EMALS stored kinetic energy/electrical conversion; AAG absorber/power-conditioning/digital controls; Ford lead-ship dimensions/full-load long tons/propulsion/builder; media-kit 4539 crew and 75+ aircraft; eleven AWEs handed over 22 December 2021; CVN78 DBR versus CVN79 EASR; 8 August 2021 third/final shock trial; 4 October departure and 26 November 2022 return. Profile correctly separates class baseline, lead-ship figures, historical air-wing example and current status.

History samples independently supported: Nimitz keel/commission dates; Eisenhower commission, Haiti 1994 and 2001–05 RCOH; Vinson 2 August 2021 first strike-group deployment with F-35C and CMV-22B; Lincoln commission, Fiery Vigil and Unified Assistance; Stennis 6 May 2021 transit to begin RCOH; GW 4 August 2017 RCOH entry and 25 May 2023 redelivery; Bush X-47B first carrier catapult launch 14 May 2013 and arrested landing 10 July 2013. Lincoln retrospective August completion conflicts with these contemporaneous sources as finding 1.

## Independently inspected sources

Most inspection was official indexed passages, sometimes lengthy complete narratives, rather than successful direct page retrieval. Do not represent this review as complete source/document inspection or Technically Validated. Other hull milestones and all source links were structurally read, but not every substantive history claim independently re-established. Keep all profiles Drafted. Parent owns browser/full build checks.

- https://www.airpac.navy.mil/Organization/Distinguished-Visitor-Info/Important-Links-and-Info/ — Nimitz characteristics; stale surrounding current/forecast wording excluded.
- https://www.navsea.navy.mil/Portals/103/Documents/Exhibits/SNA2020/SNA2020-CVN79-80-81-CaptPhilipMalone.pdf?ver=2020-01-17-113410-113 — indexed page 4 comparison table.
- https://www.navair.navy.mil/product/advanced-arresting-gear-aag — description and specifications.
- https://www.navair.navy.mil/product/Electromagnetic-Aircraft-Launch-System-EMALS — description.
- https://www.airlant.usff.navy.mil/Organization/Aircraft-Carriers/USS-Gerald-R-Ford-CVN-78/Command-History/ — command facts, construction dates.
- https://www.history.navy.mil/content/dam/nhhc/news-and-events/multimedia%20gallery/New%20Infographics/Ford%20Media%20Kit-2.pdf — indexed quick facts; differing 1092-ft generic length is not adopted.
- https://www.navy.mil/Press-Office/Press-Releases/display-pressreleases/Article/2403821/navy-continues-to-enhance-combat-capability-on-second-ford-class-carrier-uss-jo/ — 3 November 2020 radar applicability; forecast excluded.
- https://www.navsea.navy.mil/Media/News/Article/2883053/advanced-weapons-elevators-completed-aboard-uss-gerald-r-ford-cvn-78/ — 23 December release, 22 December handover.
- https://www.dvidshub.net/video/809581/full-ship-shock-trials — Navy 8 August 2021 footage caption.
- https://navalaviationnews.navy.mil/editorial-staff-tools/article-submission/article-display/article/3238492/ford-executes-first-deployment/ — 21 December 2022 release, October/November deployment events.
- https://www.navy.mil/Press-Office/Press-Releases/display-pressreleases/Article/2248168/nimitz-50-years-of-teamwork-and-tradition/ — keel and commission.
- https://www.airlant.usff.navy.mil/Organization/Aircraft-Carriers/USS-Dwight-D-Eisenhower-CVN-69/Command-History/ — sampled historical passages; erroneous unrelated 1985/1993 paragraph not adopted.
- https://www.cpf.navy.mil/Newsroom/News/Article/2726615/carl-vinson-carrier-strike-group-departs-on-deployment/ — 2021 deployment and aircraft first.
- https://www.airpac.navy.mil/Organization/USS-Abraham-Lincoln-CVN-72/About-Us/History/ — historical samples and conflicted RCOH end date.
- https://www.navy.mil/Press-Office/News-Stories/display-news/Article/2605550/uss-john-c-stennis-departed-norfolk-for-newport-news-to-begin-rcoh/ — 13 May publication versus 6 May transit.
- https://www.usff.navy.mil/Press-Room/News-Stories/Article/3409783/refueling-complex-overhaul-completed-on-uss-george-washington-cvn-73/ — NAVSEA-author 26 May 2023 release, 25 May event, Lincoln May 2017 corroboration.
- https://www.navair.navy.mil/node/20401 — X-47B 10 July 2013 event.
- https://www.navair.navy.mil/node/20426 — X-47B 14 May / 10 July 2013 timeline.

## Re-review disposition

Re-read final profile revision SHA-256 `4cefe6d2447b94e7865eecdfd2ebb6149c32370d2ffe396d9638e90c0cd15964`. Lincoln milestone is now 2017-05-12 and cites both HII contemporary redelivery and Navy contemporary completion; the Navy source directly supports March 2013 start. Its source note rejects the later command-history August date. CVW-8 and VX-23 are expanded; NAVAIR and Mk-7 also expanded. Ford prose simplification retains correct class/lead-ship applicability and system design-intent boundaries. Both findings resolved. No remaining implementation blocker identified within reviewed scope. Content remains Drafted, not Technically Validated.

Additional independent indexed inspections: OPNAVINST 3501.316C (10 November 2017), enclosure (1), 1d(1)-(4), explicitly confirms fighter/AEW/EW/helicopter categories and SAR/logistics/SUW/ASW roles. Truman command-history indexed February 2011 E-2D first carrier takeoff and Reagan history indexed March 2011 helicopter refueling match. A congressional hearing containing primary Navy testimony independently corroborates steam/piston/shuttle explanation; FRCSW PDF located but full text not independently retrieved. These do not remove the previously stated completeness limitations.

- https://www.secnav.navy.mil/doni/Directives/03000%20Naval%20Operations%20and%20Readiness/03-500%20Training%20and%20Readiness%20Services/3501.316C.pdf
- https://www.airlant.usff.navy.mil/Organization/Aircraft-Carriers/USS-Harry-S-Truman-CVN-75/Command-History/www.safehelpline.org/
- https://www.airpac.navy.mil/Organization/USS-Ronald-Reagan-CVN-76/About-Us/History/quot/
- https://www.govinfo.gov/content/pkg/CHRG-111hhrg52945/html/CHRG-111hhrg52945.htm



## Verification

- `npm run check`: 220 tests, zero Astro errors, TypeScript, production build and output checks passed with the populated dataset.
- Browser verification at 1280, 768 and 390 px: both class pages and representative Nimitz/Ford ship pages have no page overflow. All eleven histories, 46 milestones, claim citation targets, unique IDs, class navigation, existing module links and category thumbnail passed. The corrected Lincoln event is dated 12 May 2017.
- Full original registry and thumbnail bytes remain unchanged.
- `npm run check:review` at `/oversweep`: passed, including both class pages and all eleven enriched hull pages.
- `npm run check:dev`: all four existing experience HTTP-route cases passed.
- Ordinary production output restored: 518 pages.
- `python3 scripts/check_docs.py`: passed 281 text files; `git diff --check`: passed.

The independent review found and resolved a material date conflict: a retrospective Lincoln command history used an August 2017 overhaul completion date, while contemporary Navy and builder releases establish redelivery/completion on 12 May 2017. The final milestone cites the contemporary sources and records why the conflicting date was not adopted. Acronym definitions were also corrected. No factual maturity promotion, merge or deployment is performed by this change.
