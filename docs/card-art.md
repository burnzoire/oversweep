# Card illustrations and subject glyphs

Manual and Training Library cards (`src/components/EntryCard.astro`) can carry a
small technical illustration of the concept the module teaches, plus a subject
glyph beside the subject name. Both are optional: a card without art keeps the
plain text layout.

## Adding an illustration

1. Draw it as an Astro component in `src/components/card-art/`, one SVG per
   module. Register it by entry id (`module.<id>` or `experience.<id>`) in
   `src/components/card-art/CardArt.astro`.
2. Draw the concept itself, not a generic icon: a plan view, profile or
   sequence a pilot would recognise from the module. Reuse the geometry of an
   existing module figure where there is one, and cite that figure in a
   comment at the top of the component.
3. Keep to the shared frame so cards stay consistent:
   - `viewBox="0 0 320 180"` with `<rect class="frame" x="0.5" y="0.5" width="319" height="179" />`.
   - A `tag` caption top left, `FIG nn · PLAN|PROFILE|SEQUENCE`; add `NOT TO SCALE` bottom right when it is not.
   - Classes from `.card-art` in `src/styles/global.css` only: `ln` (with
     `heavy`, `thin`, `dashed`, `muted`), `jet` / `jet muted` (own / other
     aircraft, the BFM figure's jet path), `fix`, `ship`, `lbl`, `lbl small`, `tag`.
     Colours come from `currentColor` and the theme tokens, never hard-coded hues.
   - No more than about eight labels; at card size, 9-unit text is the floor.
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
