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

## How console panels are built (reason from this, don't guess shapes)

Side-console and instrument panels in US military jets follow a few public
standards. Knowing the build tells you what a shape in a perspective photo
must be.

- **Console rails.** Panels drop into a console between two rails and are held
  by quarter-turn DZUS-type fasteners (MIL-F-25173, "Dzus-type control panel
  fastener") along the left and right edges only. Console panel outlines
  follow MS25212 ("Control panel, console type, aircraft equipment, basic
  dimensions"); 5.75 in is the common width between DZUS rails. So: all
  panels on one console share a width, DZUS sit in columns near the side
  edges at matching heights, and there are none on the top and bottom edges.
  A fastener that looks off its column in the photo is perspective; put it
  back on the column.
- **Lighted plate on a mounting plate.** The face you see is an integrally
  illuminated information panel (MIL-DTL-7788, formerly MIL-P-7788): one
  sheet of acrylic about 0.23 in (5.8 mm) thick, finished opaque black
  (Class 1) or gray (Class 2), with the legends left clear so the lamps
  embedded inside light them from within. It is about 0.05 in (1.2 mm)
  smaller each way than the metal mounting plate under it and is held to it
  by 6-32 screws in grommets (MS3498), at least two, about one per 8 sq in,
  spaced symmetrically. That is the "layered" step seen on ELEC: the lighted
  plate sits proud of a slightly larger base. Where it must clear a DZUS
  head, the lighted plate is notched or slotted; the base plate is not.
  Immediate-action legends get yellow (or, for NVIS, yellow/black/white)
  stripes. Small round screw heads inside the plate area are usually these
  6-32 hold-down screws,
  not DZUS: don't give them cut-outs.
- **Controls pass through the plate.** Every switch, knob and lamp is mounted
  to the structure behind and pokes through a hole in the plate, so its
  centre is fixed by the hole: the bushing (toggle), shaft (rotary) or bezel
  (lamp) is the centre, never where a lever tip or knob top appears. Panel
  legends are engraved in the plate around those holes and never move.
- **Toggle switches** are environmentally sealed (MIL-DTL-3950). The lever
  pivots inside the bushing, so the shaft base is centred on the bushing and
  the lever leans about 17 degrees each way. A lever-lock switch (e.g.
  MS24658, Honeywell TL series "pull-to-unlock") has a slotted lock insert in
  the bushing; the lever must be pulled out of a detent before it can move,
  so a thrown lever-lock sits off-centre toward its throw (our `shift`).
  Lever tops vary by part (flat-top mushroom, domed cap, square paddle):
  pick the component by the bushing and cap, see §3a.
- **Rotary knobs** are standard military knobs (MS91528 / NASM91528): round,
  round skirted, skirted pointer, unskirted pointer, bar, and bar with a dial
  skirt. A skirt is a wider flat disc at the knob's base carrying the index
  mark; the mark lines up with legends or ticks printed on the plate, so a
  pointer's line starts at the centre and points straight at a legend. A bar
  knob's grip crosses the centre. Concentric knobs stack a small knob on a
  larger skirted one on the same shaft.
- **Use it to check a drawing.** If a shape in the guide image cannot be
  explained by a rail, a plate layer, a fastener, a hole with a part through
  it, or a printed legend, look again before drawing it.

Sources: MIL-P-7788F (ibiblio.org/apollo/Documents/assist.dla.mil/MIL_P_7788F.pdf,
§1.2, 3.4.2, 3.4.5, 3.7.2); MS25212C, MIL-F-25173A, MS24658, MIL-DTL-3950,
MS91528 titles and scopes (everyspec.com listings); Honeywell TL datasheet.

## 1. Reference: official sim manual only

Use the official guide of the simulator variant (DCS: Eagle Dynamics guide;
F-16C link in project memory). Never xFlight, Chuck's Guides or community art.
This holds for procedures too: step `evidence`, page Sources and review docs cite
only the official guide (or official/military publications). Never cite or link
Chuck's Guides or other community guides, never take steps from them, and never
copy their wording, structure or images (Nathan 2026-11-18: citing them puts a target on
the site).
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
- Gauges: see "Pointer dials" below.

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
    stadium with the far end's near edge showing just inside the near end, "(( )"
    with the pivot on the left,
    with a little less throw than the flat-top); square
    paddle on a trapezoid lever = `toggle-large-square` (AIR REFUEL).
    The lock slot has square ends so it never reads as part of the lever.
    Flat-top lever-locks (`toggle-large-cylinder`) translate as a whole toward
    the throw (`shift`), so they look pivoted off-centre like the guide; don't
    lengthen the lever instead (Nathan, 2026-11-17).
  - When the bushing is hidden, say so in `source.unresolved`.
- **DZUS fasteners and cut-outs:** see "DZUS cut-outs" below; check every
  panel for them.
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
- **Warning colours (Nathan, 2026-11-17).** The style is black on white, with
  colour only where the guide shows a part painted to warn: red guards
  (`paint: 'red'` on `guard-flip`), yellow caution caps and levers
  (`paint: 'yellow'`; a painted pushbutton is painted whole, skirt included),
  and hazard stripes as yellow and white bands between the black lines (an
  engraving `fill` under the stripe lines, clipped to the striped area).
  Paints approximate FED-STD-595 insignia red 11136 and insignia yellow 33538
  (`PAINTS` in components.ts). Grey or black parts stay uncoloured; lamps stay
  unlit.
- **Unlit displays** show faint outlines of their segment digits (UHF uses
  10-segment LEDs: seven bars with a split middle and two diagonals); use a
  `faint` engraving path.
- Real-part datasheets (e.g. Honeywell TL series) are fine for a component's
  shape; panel layout still traces from the sim guide only.

## 3b. Pointer dials (gauges)

A dial is one `gauge` placement (`Dial` in types.ts) with an `indicator` of
type `gauge` (`unit`, cold-and-dark `rest`). Ticks, numerals and the needle
are measured, never laid out from the guide's prose. Worked example: F-16C
`engine-instruments.ts` (OIL, NOZ POS, RPM, FTIT).

1. `scripts/gauge-dial.py blobs` on each dial; read the numbered
   `-blobs.png` and write the blob → value map (keep it in `docs/cockpit/`).
2. `scripts/gauge-dial.py fit`: one affine for every dial on the image, each
   centre fitted to the tick **inner** ends (outer ends hide under the bezel
   lip, so a circle through them gives the wrong centre). Its per-tick
   residuals show whether a scale is linear: a smooth trend that no centre
   removes means the printed scale is non-linear (F-16C RPM above 65 %).
3. `polar` unwraps a dial; `ticks` gives each tick's angle, radii and width,
   `needle` the needle width against radius, `glyphs` the numeral boxes. Check
   glyph boxes for missed letters (the S of NOZ POS was missed) and for
   numerals merged with the needle; measure those on a zoom.
4. The scale is `(value, angle)` knots: two for a linear scale, a knot every
   major step from a local fit where spacing varies. Painted bands are `fills`.
5. Needles share one component (`NEEDLE` in components.ts) when their width
   profiles match; only the length differs.
6. Tick widths come from a blurred image: take about 80 % of the
   half-brightness width.

## 3c. Displays and upfront controls

Worked examples: F-16C `ded.ts`, `ehsi.ts`, `icp.ts`.

- **Character displays** (`text-display`): fit the cell grid to the lit
  characters (pitch, first cell, line pitch) and type each page as fixed-width
  lines; `{…}` is inverse, `^` the up/down field arrow. The indicator is type
  `display` with `pages` and `restPage: 'off'` (cold and dark is blank).
  Procedures switch pages with `cockpit:indicate` `pages`.
- **Electronic HSI** (`hsi`): measure the centre from the lubber lines, tick and
  label radii along rays, pointer radii from the pointer colour; record the
  readings the image shows in `source.shown` so the overlay registers.
  Readings are needles (turn), `shift` (deviation), `digits` (readouts) and
  `page` (screen, mode, to-from).
- **Head-up display** (`hud`, F-16C `hud.ts`): symbology square-on in mm from the
  boresight cross, angular scale from the attitude bars (px a degree). Attitude
  symbols are nested shifts (marker azimuth/elevation; bars by pitch from the
  boresight, caged to the marker in azimuth)
  turned by `roll` about the marker; tapes (`tape` readings) move ticks and
  labels inside fixed windows under a paper-filled readout box; data fields are
  `number` readings printed with a `ReadoutFormat` (`readout.ts`, shared with the
  page script) or `pages`. Measure the lettering pitch on a fixed-width line.
- **Thumbwheels** are rotaries with `travel: 'vertical'` (rolled up and down);
  **rockers** are three-position toggles, momentary to the centre; a four-way
  switch is one `hat` placement with two controls (`control` up/down,
  `cross` left/right).
- Displays are drawn black on white like everything else; the sim's colours
  go in `source.unresolved`.

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

### DZUS cut-outs (measure, never guess)

Nathan rejected guessed DZUS cuts over and over (EXT LIGHTING, ECM, UHF), and
AIR COND first shipped with none at all. Every panel gets this check, even when
the cut-outs look obvious or absent.

1. **Find them.** For each DZUS head (8.5 mm), zoom:
   `python3 -I scripts/panel-zoom.py <rect.png> x0 y0 x1 y1 6 out.png`
   (contrast-stretched crop with a 5 px grid beside its edge map). Decide the
   shape from what is visible. Shapes seen so far:
   - corner notch, two straight edges and a quarter round about the fastener
     (EXT LIGHTING, AIR COND); set `cut` to the plate corner it opens toward
     (`up-left` …);
   - side slot with a half-round end centred on the DZUS (ECM);
   - long DZUS strip down the side plus a corner notch (UHF; its preset card
     sits on the face, not in a well);
   - none: the DZUS sits on the plate (say so in a comment).
2. **Measure each straight edge** with `python3 -I scripts/panel-edge.py
   <rect.png> row|col ...`, scanning rows or columns where nothing else
   (fastener rims, legends, knobs) crosses, and take the position most lines
   agree on. Read corner and end radii off the zoom where they are visible.
3. **Make them symmetric.** The guide photos are skewed, so measured left and
   right cut-outs never match. Draw left and right cut-outs (and their DZUS)
   mirrored about the panel centre, at the mean of the measured heights, all
   the same width. Only the area round the DZUS is cut. Inner radii are
   generous (8–14 px, never about 7). The DZUS is centred in its slot or notch.
4. **Write the numbers** into the plate path with a comment giving them.
   Where an edge is hidden (under a rim, a legend), say so in the comment and in
   `unresolved` rather than inventing it. Cuts belong to the top plate layer
   (the last `plate` entry); lower layers keep their outline.
5. **Check** with `python3 -I scripts/panel-cut-sheet.py <rect.png> <out>-overlay.png
   sheet.png "TL:x0,y0,x1,y1" ...` (source crop beside the overlay for each
   cut-out), and show that sheet in the PR.

**Legend clearance.** Legends stay where the guide prints them; never move one
to clear a lever. A thrown lever or cap may cover a legend, because the control
moves (Nathan, 2026-11-17). `scripts/cockpit-overlaps.mjs` (add `--all` for every
lever position) still lists what a bushing or lever tip covers, as information.

**Reference images.** `pdfimages -j` gives JPEGs; convert them to PNG before
`cockpit-review.mjs` (a JPEG reference renders blank).

## 5. Ship

- `src/data/cockpit/<aircraft>/index.ts`: attach the spec to its catalogue entry.
- `node --test tests/cockpit.test.mjs`, `npm run check`.
- **Tracker.** Each aircraft's cockpit has a tracker issue with one sub-issue
  per catalogue panel (F-16C: #290, sub-issues #291–#355). Every panel PR body
  says `Closes #N` for each panel sub-issue it completes, so merging closes
  them and the tracker count updates itself. A PR that only revises an
  already-closed panel says `Refs #N` instead. Add a sub-issue (under the
  tracker) for a panel or part that has none before opening its PR.
- Drive the page in Playwright: every control both ways, guards, momentary
  release, state kept after moving to another panel and back, no page errors.
- Required in every panel PR (Nathan 2026-11-16, he reviews from these): for
  each new or changed panel, the final `-side.png` (guide source image next to
  the drawing) at the top of its section in the PR description, then the
  overlay, then desktop and phone page screenshots. Re-render them from the
  final commit and push them to the pr-screenshots branch (`pr-<N>/side-<panel>.png`).
  Add the `preview` label.
- Ask Nathan to confirm in-sim behaviour the guide does not state.
