# Theatre overview maps — Syria first

Owner request: apply the approved OpenStreetMap Syria prototype now; other maps
belong in subsequent focused PRs. Interactive overlays are outside this change.

## Plan and implementation

Add an optional typed overview to simulator map records, render it above the
airfield table, and supply the approved Syria PNG. Preserve the entire image on
small screens and link to its full resolution. Other records render unchanged.
The image has 22 labelled runway airfields and dots for other runway airfields.

## Provenance and limitations

Asset: `public/encyclopedia/maps/dcs-syria-overview.png` (1800 × 1639).
Created for and visually approved by the owner on 30 October 2026.
The muted basemap uses OpenStreetMap standard raster tiles fetched for the single
requested viewport at zoom 7 (24 tiles), with visible attribution embedded in the
image. No tile archive or offline map feature is included. OSM data is ODbL;
standard cartography tiles are CC BY-SA 2.0. The resulting adapted map image retains
CC BY-SA 2.0 attribution; repository MIT licensing does not supersede these rights.

- https://www.openstreetmap.org/copyright
- https://operations.osmfoundation.org/policies/tiles/
- https://creativecommons.org/licenses/by-sa/2.0/
- https://github.com/pydcs/dcs/tree/master/dcs/terrain/syria

Airfield positions were read from the pydcs Syria airport export and converted
from its transverse Mercator projection to WGS84. The prototype used the upstream
master snapshot available during creation, not a pinned DCS release. It is a
visual overview, not a navigation chart or independently validated terrain map.
The current page's airfield table remains authoritative for its own cited version.
The geographic viewport is illustrative, not the verified DCS terrain boundary.
The basemap is modern; no historical accuracy or current political control is
asserted. These limits are stated beside the image. Existing content maturity
is unchanged.

## Later PRs

Apply this approach to remaining simulator maps in subsequent PRs, checking each
map's coordinates, extent, version and era before adding its overview. Do not
reuse Syria's bounds or imply modern OSM features existed in historical settings.
Keep simulator airfield positions separate from the geographic basemap so future
clickable overlays can link existing encyclopedia records.

## Verification

- `npm run check`: 220 tests passed, Astro zero errors/warnings, TypeScript and
  production build/output checks passed (518 pages).
- `npm run check:review`: passed at `/oversweep`; inspected emitted Syria HTML
  to verify the prefixed image and full-size links. Restored production output.
- `python3 scripts/check_docs.py`: passed; `git diff --check`: passed.
- The approved image was visually inspected. Independent fresh-context agent
  `review_syria` inspected the complete implementation and PNG: no blockers;
  base paths, dimensions, alt text, responsive rules and attribution checked.
  This was implementation review, not aviation validation or legal advice.
- Local checks ran on available Node 24.22.1, outside the repository's supported
  Node 22 range; CI on the configured version remains necessary.
- Connected-browser setup did not respond during this session. Rendered page
  desktop/tablet/mobile and keyboard interaction checks were not completed.
  Responsive styling preserves the full image and the full-size link is a native
  focusable anchor, but these are code observations, not browser-test results.
