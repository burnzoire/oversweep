# Card illustrations and subject glyphs

Manual cards (`src/components/EntryCard.astro`) can carry a
small technical illustration of the concept the module teaches, plus a subject
glyph beside the subject name. Both are optional: a card without art keeps the
plain text layout. Training Library cards carry no art; they will show the
trainer itself.

## Adding an illustration

1. Draw it as an Astro component in `src/components/card-art/`, one SVG per
   module. Register it by entry id (`module.<id>` or `experience.<id>`) in
   `src/components/card-art/CardArt.astro`.
2. Draw one element of the concept, close up, not a whole diagram: the
   marshal hold, the two turn circles, one call and readback. A pilot should
   recognise it from the module's figures at a glance. Reuse the geometry of an
   existing module figure where there is one, and cite that figure in a
   comment at the top of the component.
3. Keep to the shared frame so cards stay consistent:
   - `viewBox="0 0 320 180"` with `<rect class="frame" x="0.5" y="0.5" width="319" height="179" />`.
   - Classes from `.card-art` in `src/styles/global.css` only: `ln` (with
     `heavy`, `thin`, `dashed`, `muted`, `needle`), `jet` / `jet muted` (own /
     other aircraft, the BFM figure's jet path), `heli` (with `disc`, `body`,
     `rotor`), `a10`, `tanker`, `fix`, `fixfill`, `lamp` (white fill), `ship`,
     `ground`, `screen`, `screen-dark`, `dots`, `bombs`, `tower`, `caution`.
     Colours come from `currentColor` and the theme tokens, never hard-coded hues.
   - No labels: the card's title and summary carry the words. Text that is
     part of the object drawn (a radio's display, a button legend, a compass
     card) is fine.
   - No animation.
4. Accessibility: the SVG has `role="img"` and a `<title>` that says what the
   figure shows, with a unique id referenced by `aria-labelledby`.
5. Accuracy: depictions follow the module text and its sources. Avoid
   type-specific numbers (they belong to a training example, not to the
   generic procedure). New illustrations go through the SME review with the
   module PR.

## Adding a subject glyph

Glyphs live in `src/components/SubjectGlyph.astro`, keyed by subject slug: one
16 × 16 stroked path, drawn as a pictogram of the subject (a carrier plan, two
turn circles). They are decorative (`aria-hidden`) because the subject name
always sits next to them.


## Visual direction revision — approved concept 2 (2026-11-12)

The previous full-sheet SVG attempt is **not approved for production**. Its layout
and component registration can be retained, but the artwork should be treated
as wireframes. The reference is the **second, flatter Oversweep concept board**
shared in the design discussion (not the first, more dimensional board).

Required production standard:

- Flat, vector-first aviation technical illustration with carefully managed
  hierarchy and negative space; avoid clip-art silhouettes, primitive stick
  figures, line-only placeholders, generic icons and faux-realistic gradients.
- Ink/charcoal, restrained grey fills and *one selective amber highlight*,
  reserved for the key teaching concept (lift, active course, selected radio
  mode, target, turn flow or warning). Don't colour everything.
- Treat a radio or cockpit instrument as a finished faceplate: correct
  proportions, ticks, bezel, screw locations and legible labels. For a
  procedure, use concise but meaningful geometry with accurate symbols.
- Consistent 320 × 180 composition with common optical scale and centring.
  The scene should have a clear focal point and deliberate balance at card size.
- Keep the existing `CardArt`/EntryCard mechanism, accessibility and responsive
  behaviour. The shared CSS can supply accent and faceplate primitives.
- Replace the old artwork module by module. A change to border colour or
  stroke width alone **does not** count as a finished redesign.
- SME must revalidate any schematic implying correct trajectories, aircraft
  arrangement or operating procedure; do not copy visually appealing but
  incorrect geometry from a concept render. Particularly review BFM,
  marshal pattern, AAR positions, weapons delivery and ship operations.
- Non-technical/decorative touches should not obscure the information;
  prefer fidelity of aircraft and instruments over visual flourish.

### Replacement status

**First implementation pass:** `FixedWingAoa`, `RadioHead`,
`CaseIiiMarshal`, and `BfmCircles` have been replaced with a more polished
SVG structure and shared visual primitives. These are **prototypes**, pending
visual and SME review, not proof the entire suite is ready.

**Second pass (revision 5, 2026-11-12):** the other 24 components were redrawn
in the same flat style. Shared classes added to `global.css` for this set:
grey fills `g1`–`g4`; ink faces `face`/`ink` with white markings (`line-w`,
`dots-w`, `ring-w`, `w`, `text.face-label`); outlined `ring-ink`/`ring-g`;
`wp` waypoints; `sky`/`earth` for attitude; `disc`, `disc-lg`, `blade`, `hub`,
`rotor-side` and `ghost` for helicopters; `scan`, `grid`, `road`, `revet`,
`launcher`, `deck`, `sign`, `papi-red`, `button-top`, `tanker2` and `a10b`.
Each component's header comment says what it depicts. All 28 are pending
final SME review of the geometry before merge.


## Bespoke redraw pass — 12 November 2026

The 24 card-art components beyond the first four prototypes have now been
**rewritten with new SVG composition and geometry**, not merely recoloured.
Eight instruments/aviation fundamentals, eight formations/flight-operations
subjects and eight threat/ship/emergency subjects have custom editorial
technical plates. The components keep the same 320×180 registration and
accessibility contract.

The redraw is a **design proposal**, not aviation SME approval. Confirm visual
quality at actual card size and validate all depicted operational geometry:
marshalling and approaches, PAPI / holding-position markings, ILS / HSI
indications, formation positioning, two-point refuelling, weapons delivery,
SAM site, carrier deck, BFM and intercept geometry. Some designs use simplified
or symbolic rather than aircraft-type-accurate equipment, and illustrations
must not be presented as procedural reference without verification.

Do not interpret passing build checks as design or aviation sign-off. Retain
this PR in draft until design screenshots and SME review are completed.
