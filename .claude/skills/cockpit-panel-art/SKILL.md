---
name: cockpit-panel-art
description: Draw or redraw an Oversweep cockpit panel (switches, lamps, knobs) as vector art from a traced data spec, for aircraft procedure modules. Use for any new or raster cockpit panel.
---

# Cockpit panel art (vector, from data)

Panels for aircraft procedures are drawn as SVG from a data file, never as raster
images. The face, every control, every lamp and every hit zone come from the same
coordinates, so states line up and details stay fixed. The ELEC panel of the
F-16C Engine Start module is the worked example:
`src/data/cockpit-panels/f16c-elec.ts`.

## 1. Get the reference (official sim manual only)

- Use the official manual of the simulator the procedure is for (for DCS, the
  Eagle Dynamics guide). Not xFlight, not community art, not Chuck's Guides.
- DCS guides: find the PDF link on the module's documentation page
  (`digitalcombatsimulator.com/en/downloads/documentation/...`); older upload
  links 404. Find the page with `pdftotext` and grep for the panel name, then
  extract the panel image losslessly with `pdfimages -j -f <p> -l <p>` and pick
  the largest JPEG. Do not trace a page render.
- Record the guide edition, page and image in `source`.

## 2. Rectify it

Cockpit screenshots are slightly oblique. Pick four features that form a
rectangle on the real panel (normally the corner DZUS fasteners) and run:

```
python3 -I scripts/panel-trace.py <image.jpg> <scratch-dir> x,y x,y x,y x,y [W H]
```

Points go TL TR BL BR. Use `x,y=X,Y` to pin targets, and write the exact command
into the spec's header comment so the trace can be reproduced. The script prints
detected circles (fasteners, screws, knobs, buttons) as `x y r`; use them
directly. Read every other position off `grid.png` (3x, 10 px grid).

## 3. Write the spec

Copy the ELEC spec. Types are in `src/data/cockpit-panels/types.ts`.

- Units are rectified-image pixels (or mm if the manual gives dimensions). Set
  `unit` to about px per mm so line weights scale (4 for a ~330 px panel).
- `plates`: panel outline and raised plates as path data. Where the reference is
  cropped, draw to the crop and say so in `source.size`.
- `parts`: `dzus`, `screw`, `label` (centre, cap height, measured `width` so the
  text is locked to the reference width; `\n` for two lines), `rule`, `path`
  (guards, scale arcs, odd shapes), `hatch` (warning stripes), `toggle`
  (faces bat/paddle/square/rocker), `rotary` (pointer or round knob, detent
  angles), `pushbutton` (round/square, or `bare` hit zone only), `handle`
  (sliding grip such as the gear handle), `annunciator` (one cell per legend,
  each with its `lamp` id or `attrs`), `lamp` (round light), `dial` (gauge whose
  value-to-angle `stops` drive a live needle via `data-stops`).
- Angles are degrees clockwise from 12 o'clock. Take knob detents and dial stops
  from the printed tick marks and numerals, not from the knob or needle: tall
  controls are offset by the camera angle.
- Labels: copy the legend exactly as printed on the panel, including odd marks
  (the `+` beside CAUTION RESET).
- Controls: `toggle.positions` top to bottom with the page's state ids;
  `stateAttr` names the root attribute the page script sets; `hitClass` /
  `hitAttrs` keep any hooks the page script already queries.
- Need a control kind that is not there yet (rotary, guarded switch, wheel)?
  Add it to `types.ts` and `render.ts` once, so every later panel can use it.

## 4. Check by overlay, then fix, until it registers

```
node --experimental-strip-types --no-warnings scripts/panel-overlay.mjs <spec.ts> <exportName> <scratch-dir>/rect.png <scratch-dir>/v1
```

The reference is drawn at its own pixel size and cropped to the spec's `size`,
so a spec smaller than the image (a panel cut out of a wider photo) still lines
up. Look at `v1-overlay.png` (red drawing over the reference, 3x) in halves. Every
fastener, bezel, lens edge and legend should sit on the reference within a
couple of pixels. Move what doesn't, and run again. Then look at `v1-side.png`.

## 5. Use it on the page

```astro
<CockpitPanel spec={f16cElec} class="elec-art" />
```

The page script drives state the same way for every panel: set the toggle's
root attribute (`data-main-state="batt"`), toggle `lit` on `[data-lamp="..."]`,
and add `pulse` to a pushbutton's hit zone to press its cap. Delete the old
WebP and its hand-placed percentage overlays.

## 6. Verify and ship

- Build, then drive the whole procedure in Playwright: click each step's
  control (hold where the step needs it), wait for timed steps, confirm, and
  check every step advances with no page errors. Read `data-*` and `.lamp.lit`
  as you go, and screenshot each step.
- Make a three-way comparison image: reference | old art | new art.
- Update `docs/reviews/aircraft-procedures-<airframe>-<task>.md` with the panel,
  its source page and anything still unverified.
- PR with screenshots on the `pr-screenshots` branch and the `preview` label.

## Awkward references

- **Oblique strip** (eyebrow lights): rectify on the strip's outer corners with
  `x,y=X,Y` targets. If the far end is still foreshortened, draw identical
  modules at equal width and say so in the spec.
- **Not a flat panel** (canopy handle): there is no square-on view to rectify.
  Draw it as seen in the guide image, label the parts, and mark the spec "not
  orthographic" so nobody mistakes it for a survey.
- **Cropped reference**: draw the plate to the crop and say which edges are
  cropped in `source.size`.

## Limits to be honest about

- The art is old-flight-manual line drawing: bezels, rings, plate edges and
  fastener heads are drawn with `cased()` in `render.ts` (heavy outline with a
  thin white core) so they read as double-line engraving, and raised plates get
  an offset lip. Keep new control kinds in that style. There is no shading, and
  a toggle lever is shown schematically from above.
- The guide image fixes proportions, not real-world size. If the reference crops
  an edge, the drawn edge is a guess and must be marked as one.
- Text uses a condensed system font stretched to the measured width; the glyphs
  are not the panel's own typeface.
