# Remaining simulator map rollout

Owner request: continue the approved Syria/Caucasus interactive map treatment for
all remaining simulator maps. Keep simulator airfield records distinct from the
modern OSM geographic basemap. No inferred simulator coordinates or modern-airport
substitutions.

## PR 1 — existing simulator coordinate data

Enable the shared component on eleven further DCS map pages: Afghanistan, Kola,
South Atlantic, Normandy, Marianas 1944, Marianas, Iraq, Cold War Germany, Persian
Gulf, Nevada and Sinai. Their existing pinned tables supply all 439 runway markers,
reference data, notes and known encyclopedia links. No airfield source data changes.
Caucasus remains in its existing PR #147; Syria is already on main.

The `interactiveMap` flag allows a record to opt in without a separately generated
PNG. Existing Syria and Caucasus static overviews remain supported. New pages keep
their complete server-rendered reference tables if JavaScript or tiles fail. No
batch tile downloads or new offline images are needed. The minimum zoom is lowered
to 2 to allow fitting geographically broad datasets on narrow screens.

The historical-setting maps use simulator coordinates for markers, with an explicit
note that OSM shows modern geography, not historical surroundings. No simulator
terrain boundary or current operational status is inferred. The same OSM attribution,
viewport-only tile requests and browser caching behavior apply.

## PR 2 — maps without simulator coordinate tables

The Channel has a runway table without coordinates. BMS/Falcon maps and several
regional DCS editions have no matching simulator table in the current catalogue.
Provide labelled geographic overview views where the region is known, with no
invented airfield overlay. Keep absent simulator coordinates visible as a data
limitation. Geographical viewports are presentation choices, not exact simulator
coverage claims. Add full overlays later when versioned simulator data is available.

## Verification

Final commands and independent implementation review results are recorded in the
PRs. Existing content maturity remains unchanged; no independent aviation/geographic
validation, merge or deployment is implied by passing implementation checks.

PR 1 evidence: `npm run check` passed all 220 tests, Astro/TypeScript and production
output checks; `npm run check:review` passed at `/oversweep`. Generated-page checks
matched all 439 marker coordinates exactly to their existing tables and verified
entry destinations across all eleven new pages. Independent fresh-context review
found no blockers, including optional-fallback paths and coordinate range checks.
Documentation/whitespace checks passed. Browser rendering remains unverified after
the preceding browser connection failures. Local checks use Node 24 rather than
supported Node 22; configured CI remains necessary.

PR 2 implementation: `mapView.bounds` sets an illustrative initial geographic
viewport for BMS Korea/Balkans/Hellenic/Israel/Falklands, Falcon 4.0 Korea/Balkans,
The Channel, East Afghanistan, Southwest Afghanistan and Iraq North. These
latitude/longitude view rectangles are chosen to frame the regions named in each
record, not sourced simulator boundary polygons. No table is aliased from a wider
or different simulator edition. Every page without positioned fields displays
"Geographic overview only" and the missing-coordinate limitation; it has pan/zoom,
reset and an OSM link, with no empty selector or fabricated airfield marker.
On pages with coordinates, markers and popups retain their source data and behavior.
All pages retain visible OSM attribution and current-geography limitations.

PR 2 verification: `npm run check` passed all 220 tests, Astro/TypeScript and
production output checks. Generated-page inspection confirmed eleven valid ordered
view rectangles, zero invented marker payloads, visible limitation notes, no empty
selectors and external OSM fallback links; Syria retains its 80 markers. The
`/oversweep` review build, documentation/whitespace checks and independent review
cover this revision. Browser verification remains unavailable; Node 24 versus
supported Node 22 remains the same CI limitation. No geographic or aviation
validation, merge or deployment is claimed.
