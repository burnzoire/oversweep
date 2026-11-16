---
name: cockpit-panels
description: Build or revise a Cockpit Familiarization panel (assembled from shared components on a traced plate) for an Oversweep aircraft, and review it by onion-skin overlay against the official sim manual.
---

# Cockpit panels (shared cockpit model)

Cockpit Familiarization is the foundation for aircraft procedures. Each aircraft
has a catalogue (`src/data/cockpit/<aircraft>/index.ts`) of cockpit areas and
panels in the order the official guide describes them. A built panel has a
spec (`src/data/cockpit/<aircraft>/<panel>.ts`); the page, the artwork, the hit
zones and the movement all come from it. No panel-specific rendering or page
code: if a panel needs something new, add a shared component or behaviour.

Worked examples: F-16C `elec.ts` (toggle, pushbutton, lamp modules) and
`fuel.ts` (guarded toggle, rotary, square-cap toggle).

## Model

- **Common drawing unit is mm.** Components own their fixed dimensions in
  `components.ts` (a `toggle-large` is the same size on every panel). Panels
  place components by pivot (`at`) and never size them. The page scales the
  whole assembled panel.
- **Artwork vs movement.** `components.ts` draws a component's static base and
  one moving part per position. `ControlDef` (types.ts) holds ordered
  positions, per-position hold (`stable`, `momentary` + `spring`, `magnetic` +
  `releasesTo`), `travel` (vertical/horizontal), `latched`, `protections`
  (latch, guard) and `guards` (closing a guard drives its switch back).
- **Lamps.** One `lamp-module` placement per lens module, with a separate
  `rect` for each independently lit legend or bulb.
- **Every control on a completed panel is modelled**, including ones the
  current procedures do not use.
- **Stable ids**: panel ids in the catalogue, control/indicator ids in the
  spec. Procedures will refer to `<panel>.<control>`; never rename one.
- **Cold jet, physical actuation only.** No systems logic; lamps stay off and
  selecting one shows its meaning. Controls move one detent per click on the
  upper/lower (left/right) half; no pull/latch gesture is simulated (Nathan).

## 1. Reference: official sim manual only

Use the official guide of the simulator variant (DCS: Eagle Dynamics guide;
F-16C link in project memory). Never xFlight, Chuck's Guides or community art.
Find the page with `pdftotext`, extract the panel image losslessly
(`pdfimages -j -f <p> -l <p>`, take the largest JPEG). Put the controls'
descriptions in the spec from the guide's text with the page as `source`.

## 2. Rectify and measure

```
python3 -I scripts/panel-trace.py <image.jpg> <scratch> x,y x,y x,y x,y [W H]
```
Points TL TR BL BR on four features that form a rectangle (DZUS fasteners).
Read positions off `grid.png` (3x, 10 px grid). Write the command into
`source.rectify`.

## 3. Write the spec in reference pixels

`tracer(pxPerMm)` converts what you type (rectified pixels) to mm, so values
can be checked against the grid. Fix `pxPerMm` from a shared component: DZUS
heads are 8.5 mm (the F-16C FUEL panel's full width was taken as a standard
5.75 in console panel). Record how in `source.scale`. Record the positions the
reference image shows in `source.shown`, and everything the image cannot
resolve in `source.unresolved`.

- Rotary detents: take angles from the printed ticks, not the knob (tall
  knobs are offset by the camera). Record measured angles where spacing varies.
- Gauges (when added): repeating tick patterns where they fit, explicit
  angles where spacing varies, needle separate, raster and vector from the
  same geometry.

## 4. Review by onion skin, adjust, repeat

```
node --experimental-strip-types --no-warnings scripts/cockpit-review.mjs src/data/cockpit/<a>/<panel>.ts <export> <scratch>/rect.png <scratch>/v1 [px-per-mm]
```
Writes `-overlay.png` (every component in red over the greyed reference),
`-side.png` (reference | drawing) and `-guide.png` (placement guide: pivots,
ids, lamp rectangles). Check fasteners, bezels, pivots, lamp rectangles, tick
counts/spacing/lengths, label positions and widths, needle silhouette. Move
what does not register and run again. If a shared component's size does not
fit, check it on the other panels before changing it.

## 5. Ship

- `src/data/cockpit/<aircraft>/index.ts`: attach the spec to its catalogue entry.
- `node --test tests/cockpit.test.mjs`, `npm run check`.
- Drive the page in Playwright: every control both ways, guards, momentary
  release, state kept after moving to another panel and back, no page errors.
- Add the overlay and side-by-side images to the PR (pr-screenshots branch)
  with desktop and phone screenshots, and the `preview` label.
- Ask Nathan to confirm in-sim behaviour the guide does not state.
