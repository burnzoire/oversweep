# Homepage weekly features

A curated annual rotation, stored in `src/data/featured-articles.json`. IDs resolve
to existing published encyclopedia records; titles, summaries, review status and
credited photos come from those records. Editing the schedule does not publish
content or change its maturity. The build rejects missing, excluded, duplicate
or unillustrated selections.

The homepage uses ISO week numbers in Australia/Melbourne (Monday start).
Week 53 retains week 52; early January can belong to the preceding ISO year.
The same 52 entries repeat annually. A client-side selector updates the feature
on page load, once per minute and when returning to the tab, so GitHub Pages
needs no weekly rebuild or scheduled job. Without JavaScript the build-time
selection remains readable, with its original source credit and working links.

The other homepage changes shorten the introduction, provide direct category
links and show three existing modules, including a trainer-linked module. The
full Manual and Training Library remain accessible. No new aviation claims or
review-status changes are introduced.

## Annual schedule

| ISO week | Article | Category |
| --- | --- | --- |
| 1 | [F-14 Tomcat](../../content/encyclopedia/aircraft/f-14.md) | aircraft |
| 2 | [AIM-54 Phoenix](../../content/encyclopedia/ordnance/aim-54.md) | ordnance |
| 3 | [SA-2 Guideline](../../content/encyclopedia/threat-systems/sa-2.md) | threat-systems |
| 4 | [The Caucasus](../../content/encyclopedia/locations/caucasus.md) | locations |
| 5 | [F/A-18 Hornet](../../content/encyclopedia/aircraft/fa-18c.md) | aircraft |
| 6 | [AGM-88 HARM](../../content/encyclopedia/ordnance/agm-88.md) | ordnance |
| 7 | [SA-6 Gainful](../../content/encyclopedia/threat-systems/sa-6.md) | threat-systems |
| 8 | [Middle East](../../content/encyclopedia/locations/middle-east.md) | locations |
| 9 | [F-16 Fighting Falcon](../../content/encyclopedia/aircraft/f-16.md) | aircraft |
| 10 | [AIM-120 AMRAAM](../../content/encyclopedia/ordnance/aim-120.md) | ordnance |
| 11 | [SA-10 Grumble](../../content/encyclopedia/threat-systems/sa-10.md) | threat-systems |
| 12 | [East Asia and the Pacific](../../content/encyclopedia/locations/east-asia-pacific.md) | locations |
| 13 | [A-10 Thunderbolt II](../../content/encyclopedia/aircraft/a-10.md) | aircraft |
| 14 | [GAU-8 Avenger](../../content/encyclopedia/ordnance/gau-8.md) | ordnance |
| 15 | [SA-8 Gecko](../../content/encyclopedia/threat-systems/sa-8.md) | threat-systems |
| 16 | [Nellis Air Force Base](../../content/encyclopedia/locations/nellis.md) | locations |
| 17 | [AH-64D Apache Longbow](../../content/encyclopedia/aircraft/ah-64d.md) | aircraft |
| 18 | [AGM-114 Hellfire](../../content/encyclopedia/ordnance/agm-114.md) | ordnance |
| 19 | [SA-19 Grison](../../content/encyclopedia/threat-systems/sa-19.md) | threat-systems |
| 20 | [Central Asia](../../content/encyclopedia/locations/central-asia.md) | locations |
| 21 | [MiG-21](../../content/encyclopedia/aircraft/mig-21.md) | aircraft |
| 22 | [K-13 (R-3) "Atoll"](../../content/encyclopedia/ordnance/r-3.md) | ordnance |
| 23 | [SA-3 Goa](../../content/encyclopedia/threat-systems/sa-3.md) | threat-systems |
| 24 | [Europe](../../content/encyclopedia/locations/europe.md) | locations |
| 25 | [F-4 Phantom II](../../content/encyclopedia/aircraft/f-4.md) | aircraft |
| 26 | [AIM-7 Sparrow](../../content/encyclopedia/ordnance/aim-7.md) | ordnance |
| 27 | [SA-5 Gammon](../../content/encyclopedia/threat-systems/sa-5.md) | threat-systems |
| 28 | [Incirlik Air Base](../../content/encyclopedia/locations/incirlik.md) | locations |
| 29 | [Mirage 2000C](../../content/encyclopedia/aircraft/m-2000c.md) | aircraft |
| 30 | [R.550 Magic](../../content/encyclopedia/ordnance/magic-2.md) | ordnance |
| 31 | [SA-11 Gadfly](../../content/encyclopedia/threat-systems/sa-11.md) | threat-systems |
| 32 | [RAF Akrotiri](../../content/encyclopedia/locations/akrotiri.md) | locations |
| 33 | [AV-8B Harrier II](../../content/encyclopedia/aircraft/av-8b.md) | aircraft |
| 34 | [GBU-12 Paveway II laser-guided bomb](../../content/encyclopedia/ordnance/gbu-12.md) | ordnance |
| 35 | [SA-15 Gauntlet](../../content/encyclopedia/threat-systems/sa-15.md) | threat-systems |
| 36 | [The South Atlantic](../../content/encyclopedia/locations/south-atlantic.md) | locations |
| 37 | [Su-27 Flanker](../../content/encyclopedia/aircraft/su-27.md) | aircraft |
| 38 | [R-27 "Alamo"](../../content/encyclopedia/ordnance/r-27.md) | ordnance |
| 39 | [SA-13 Gopher](../../content/encyclopedia/threat-systems/sa-13.md) | threat-systems |
| 40 | [North America](../../content/encyclopedia/locations/north-america.md) | locations |
| 41 | [P-51D Mustang](../../content/encyclopedia/aircraft/p-51d.md) | aircraft |
| 42 | [High Velocity Aircraft Rocket (HVAR)](../../content/encyclopedia/ordnance/hvar.md) | ordnance |
| 43 | [Spitfire LF Mk IX](../../content/encyclopedia/aircraft/spitfire-ix.md) | aircraft |
| 44 | [Edwards Air Force Base](../../content/encyclopedia/locations/edwards.md) | locations |
| 45 | [Mi-24P Hind-F](../../content/encyclopedia/aircraft/mi-24p.md) | aircraft |
| 46 | [9K114 Shturm](../../content/encyclopedia/ordnance/9k114.md) | ordnance |
| 47 | [Ka-50 Black Shark](../../content/encyclopedia/aircraft/ka-50.md) | aircraft |
| 48 | [Batumi International Airport](../../content/encyclopedia/locations/batumi.md) | locations |
| 49 | [AJS 37 Viggen](../../content/encyclopedia/aircraft/ajs-37.md) | aircraft |
| 50 | [RBS 15 anti-ship missile](../../content/encyclopedia/ordnance/rbs-15.md) | ordnance |
| 51 | [F-15E Strike Eagle](../../content/encyclopedia/aircraft/f-15e.md) | aircraft |
| 52 | [Naval Air Station Fallon](../../content/encyclopedia/locations/fallon.md) | locations |

## Delivery evidence

- `npm run check`: passed, 224 tests, Astro/TypeScript checks, production build
  and generated-page checks.
- `npm run check:review`: passed with `/oversweep/` base paths.
- `python3 scripts/check_docs.py` and `git diff --check`: passed.
- Feature tests cover all 52 published selections and local images, Melbourne
  summer/winter Monday boundaries, ISO year rollover and week 53, plus the actual
  browser selector replacing a stale DOM and synchronising links, photo, credit
  and maturity on timer and visibility updates.
- Desktop browser preview: photograph, credit, article text and links render;
  Tab reaches the skip link. Mobile viewport and full keyboard audit were not
  performed. Local runtime is Node 24; Node 22 remains the supported CI runtime.
- Independent fresh-context implementation review found a missing licence link;
  initial and client-updated credits now retain it. Re-review of the final change
  and feature tests found no remaining blockers. No aviation content is authored
  or revalidated in this presentation change.
