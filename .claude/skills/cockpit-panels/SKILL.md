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

## 3a. Drawing rules (Nathan's corrections; get these right first time)

The guide's cockpit images are perspective shots from an off-axis camera.
Measure what lies flat on the plate (legends, rules, fasteners) and correct
everything that stands proud of it.

- **Panels are often layered.** Look for a step in the plate: a raised face
  plate (top layer) sitting on a base plate, often wrapping one group of
  controls and jutting around a legend (ELEC's top layer goes around MAIN
  PWR and juts around ACFT BATT). Trace each layer as its own `plate` entry,
  back to front, with `raised: true` on the upper ones. Fasteners, legends
  and controls belong to the layer they sit on; cut-outs and notches belong
  to the top layer only.
- **Pivots sit on their legends' centre line.** A toggle's pivot is centred
  between its position legends (e.g. START 1 / START 2), not where the
  bushing or lever tip appears. Fixed parts placed around a control (wire
  bails, guards) are symmetric about its pivot.
- **Levers are drawn square-on** at their real lean (about 17° from the
  panel normal), short, never with the camera's exaggerated length.
- **Shaft base:** the lever's lowest circle is centred on the pivot. Do not
  draw that circle as a separate line (it spoils the 3D read). Lever-locks
  shift their base 0.7 mm toward the lean (lift and shift into the detent).
- **Pick the toggle by the bushing:**
  - plain toggle (`toggle-medium` etc.): round orange-red water-resistant
    grommet, no hex nut, teardrop lever to a ball. Guarded switches are plain
    toggles so the guard can shut them.
  - lever-lock (lock insert and slot visible in the bushing): flat-topped
    mushroom cap = `toggle-large-cylinder` (MAIN PWR); tapered shaft to a domed
    cap = `toggle-large-lock` (JFS, MAX POWER, AB RESET, TANK INERTING, AVIONICS
    POWER MFD; the cap is a sphere drawn out along the lever, square-on a short
    stadium with the near end's far edge showing inside the far end, "(( )",
    with a little less throw than the flat-top); square
    paddle on a trapezoid lever = `toggle-large-square` (AIR REFUEL).
    The lock slot has square ends so it never reads as part of the lever.
    Flat-top lever-locks (`toggle-large-cylinder`) translate as a whole toward
    the throw (`shift`), so they look pivoted off-centre like the guide; don't
    lengthen the lever instead (Nathan, 2026-11-17).
  - When the bushing is hidden, say so in `source.unresolved`.
- **DZUS cut-outs:** only where the guide shows one, the top plate layer (last `plate` entry) is notched around a corner DZUS; lower layers keep their outline. Set
  `cut` to the plate corner the notch opens toward (`up-left` …); it is drawn
  as two straight edges with a quarter round about the fastener.
- **Engraving stays clear** of fastener cut-outs and the plate edge; tighten
  letter spacing rather than overlap.
- **Square controls up with their legends.** The camera's perspective shifts
  knobs, switches and legends off their shared lines. Put a control and its
  legends on common centre lines (a toggle between its position legends, a
  row of knobs on one y, a knob centred under its title), and point each
  rotary detent straight at its legend. Space detents evenly where the
  legends only look uneven through perspective, and put the legends on their
  detent lines.
- **Knob indicator lines start at the centre** and run out to the pointing
  end; only a bar knob's grip (CHAN, frequency knobs) crosses the centre.
- **Trace one-off knob grips** (three-armed AERIAL REFUELING grip, MASTER's
  broad band, the UHF radio selector's lever) as their own components.
- **Unlit displays** show faint outlines of their segment digits (UHF uses
  10-segment LEDs: seven bars with a split middle and two diagonals); use a
  `faint` engraving path.
- Real-part datasheets (e.g. Honeywell TL series) are fine for a component's
  shape; panel layout still traces from the sim guide only.

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

**Self-correct before reporting (Nathan, 2026-11-16).** Never send a panel
for review straight off the first render. For every panel, open the overlay
and walk it control by control: body outline, centre, indicator, grip shape
and lever type against the source; legends against the drawing. List each
mismatch, fix it, re-render, and repeat until the only differences left are
deliberate ones (square-on levers, controls squared with legends) or are
recorded in `source.unresolved`. Zoom (`g.py`-style crops at 4x) on anything
you cannot judge at full size, especially knob grips and bushings.

**Measure plate steps and cut-outs; never guess them (Nathan, 2026-11-16).**
For every DZUS, slot, strip, well and layer step:
1. Zoom each one: `python3 -I scripts/panel-zoom.py <rect.png> x0 y0 x1 y1 6 out.png`
   (contrast-stretched crop with a 5 px grid beside its edge map). Decide the
   shape from what is visible: corner notch, side slot with a half-round end,
   long strip, well.
2. Measure each straight edge with `python3 -I scripts/panel-edge.py <rect.png>
   row|col ...`, scanning rows or columns where nothing else (fastener rims,
   legends, knobs) crosses, and take the position most lines agree on. Read
   corner and end radii off the zoom where they are visible.
3. Write the measured numbers into the plate path, with a comment giving them.
   Where an edge is hidden (under a rim, a legend), say so in the comment and in
   `unresolved` rather than inventing it.
4. Check with `python3 -I scripts/panel-cut-sheet.py <rect.png> <out>-overlay.png
   sheet.png "TL:x0,y0,x1,y1" ...` (source crop beside the overlay for each
   cut-out), and show that sheet in the PR.

Shapes seen so far: EXT LIGHTING and AIR COND have corner notches; ECM has
side slots with a half-round end centred on each DZUS; UHF has long DZUS
strips plus a top-left corner notch (the preset card sits on the face, not in
a well). Nathan's rules (2026-11-16): only the area round the DZUS is cut;
draw left and right cut-outs (and their DZUS) mirrored about the panel centre
at the mean measured heights, all the same width; inner radii generous
(8–14 px, never ~7); DZUS centred in its slot or notch.

**Legend clearance.** Legends stay where the guide prints them; never move one
to clear a lever. A thrown lever or cap may cover a legend, because the control
moves (Nathan, 2026-11-17). `scripts/cockpit-overlaps.mjs` (add `--all` for every
lever position) still lists what a bushing or lever tip covers, as information.

**Reference images.** `pdfimages -j` gives JPEGs; convert them to PNG before
`cockpit-review.mjs` (a JPEG reference renders blank).

## 5. Ship

- `src/data/cockpit/<aircraft>/index.ts`: attach the spec to its catalogue entry.
- `node --test tests/cockpit.test.mjs`, `npm run check`.
- Drive the page in Playwright: every control both ways, guards, momentary
  release, state kept after moving to another panel and back, no page errors.
- Required in every panel PR (Nathan 2026-11-16, he reviews from these): for
  each new or changed panel, the final `-side.png` (guide source image next to
  the drawing) at the top of its section in the PR description, then the
  overlay, then desktop and phone page screenshots. Re-render them from the
  final commit and push them to the pr-screenshots branch (`pr-<N>/side-<panel>.png`).
  Add the `preview` label.
- Ask Nathan to confirm in-sim behaviour the guide does not state.
