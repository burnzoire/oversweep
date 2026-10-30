# Theatre overview maps — Syria first

Owner request: embed an interactive OpenStreetMap map on DCS: Syria, with airfield
links, and retain the approved static prototype as a fallback. Remaining simulator
maps belong in subsequent focused PRs.

## Implementation

The optional overview field enables `TheatreMap.astro` for Syria only. Leaflet
1.9.4 is bundled locally through npm; the browser requests OSM standard tiles only
when the reader reaches the map. Native browser caching and Referer are retained;
there is no tile prefetching, proxy, archive or offline feature. Visible attribution
links to OSM's copyright/ODbL page. The muted tile treatment leaves overlays intact.

Markers use finite WGS84 coordinates from the same versioned data as the existing
Syria table, not airport coordinates from OSM. Only runway airfields are included.
Each popup displays the table's coordinates, elevation, runways, tower radios,
navaids and ILS using the same formatters. Its name links to the full encyclopedia
entry only where the catalogue explicitly associates one with that in-sim name;
otherwise the name is plain text. There is no popup link to the table. Magnetic
heading, assumed-band and radio-fallback notes accompany the relevant data.
The native airfield selector provides an alternative to finding a marker. Controls
support pan/zoom and reset; scroll-wheel zoom is disabled to preserve page scroll.

The static map is visible without JavaScript and collapses after initialization.
It remains expandable and reopens if tile loading fails. Initialization errors hide
the failed canvas and leave the static overview and airfield table available.
The map height adapts to the viewport; markers are keyboard-focusable and popup
text is constructed with DOM nodes rather than interpolated HTML.

## Sources and limitations

The interactive overlay uses `src/data/map-airfields/dcs-syria.json`, which cites
DCS World 2.9.30.28536 and the pinned dcs-world-schema extraction. The on-page source
link points to that same record's source. OSM supplies modern geography, not
historical simulator geography or political control. The viewport fits the
positioned runway fields and does not claim an exact DCS terrain boundary.
Existing content maturity remains unchanged.

- https://leafletjs.com/examples/quick-start/
- https://www.openstreetmap.org/copyright
- https://operations.osmfoundation.org/policies/tiles/

Static fallback: `public/encyclopedia/maps/dcs-syria-overview.png` (1800 × 1639),
created for and visually approved by the owner on 30 October 2026. Its muted OSM
standard tiles were fetched for the single requested viewport at zoom 7 (24 tiles).
OSM data is ODbL; standard cartography tiles are CC BY-SA 2.0. The adapted static
image retains attribution; repository MIT licensing does not supersede it.
Static prototype airfield positions came from the pydcs Syria airport/projection
master snapshot available during creation, not a pinned DCS release, and may
differ from the interactive overlay/table. That limitation is visible beside it.

- https://creativecommons.org/licenses/by-sa/2.0/
- https://github.com/pydcs/dcs/tree/master/dcs/terrain/syria

## Subsequent PRs

Apply this interactive approach to remaining simulator maps in separate PRs,
checking each map's coordinates, sources, extent and era. Do not reuse Syria's
bounds or imply modern OSM features existed in historical settings.

## Verification

- `npm run check`: 220 tests passed; Astro zero errors/warnings; TypeScript,
  production build (518 pages) and output checks passed.
- `npm run check:review`: passed under `/oversweep`.
- Generated HTML inspection checks marker coordinates and table anchors, existing
  record destinations, Syria-only activation and base-prefixed fallback links.
- `python3 scripts/check_docs.py` and `git diff --check`: passed.
- Independent fresh-context agent `review_syria` reviewed the interactive diff,
  source data flow, popup safety, fallback, OSM usage and accessibility hooks;
  no blocking findings. No independent aviation validation is claimed.
- Local checks use available Node 24.22.1, outside the supported Node 22 range;
  configured CI remains necessary.
- Connected-browser setup timed out; the fallback browser could not reach the
  running local preview server (connection refused). Rendered desktop/tablet/mobile,
  live tile loading, keyboard and popup interactions remain unverified in-browser.

## Popup and alignment follow-up

After the initial PR merged, the owner supplied a screenshot showing icon and
control alignment problems and requested the table data inside each popup.
The marker now uses a fixed-size centred SVG instead of a font-dependent aircraft
glyph. The dropdown and reset button share explicit heights, line heights, border
and padding rules. Popups use linked names and compact definition lists, with a
scrollable height limit for dense records. The data region is keyboard-focusable;
scroll keys retain native scrolling without moving the map. Text is still built with safe DOM nodes.
No source data, navigation values or content maturity were changed.

Follow-up verification: all 220 tests and production checks pass. Generated-page
inspection confirms all 80 payloads match the displayed table text, Akrotiri links
to its real entry, and no table URLs remain in marker payloads. The review build
passes at `/oversweep`; independent implementation review and whitespace/docs
checks cover this follow-up. Browser rendering remains unverified because the
available browser could not reach the local server during the original session.
