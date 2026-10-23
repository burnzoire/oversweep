# Aviation SME review demonstration

## Revision and scope

- Example issue/PR: [#28](https://github.com/burnzoire/oversweep/issues/28) /
  [#29](https://github.com/burnzoire/oversweep/pull/29)
- Reviewed content revision: `2c16d437fd1264d69f9340b4442a452707baab42`
- Scope inspected: `src/experiences/case-iii/model.cjs`,
  `src/experiences/case-iii/index.html`, `tests/case-iii/model.cjs`, and
  `docs/plans/05-case-iii-port.md`; this is a focused example, not an exhaustive
  review of every trainer path or the PR's browser behavior.
- Review method: source inspection and independent arithmetic. This is a
  manually recorded demonstration, not a run of the Agentic Workflow.

## Independently derived arithmetic case

The model fixture in `tests/case-iii/model.cjs:3-9` expects a 60-second straight
leg at a displayed 250 kt to cover `25/6 NM` (about `4.1667 NM`). Treating the
input conditionally as `250 NM/hour`, independent dimensional analysis gives
`250 NM/hour × (60 s ÷ 3600 s/hour) = 25/6 NM`. The result is exact as a
rational number.

- **Assumptions:** constant input rate, straight-leg geometry, no wind or drift,
  and seconds converted to hours. This checks arithmetic only; it does not
  establish that 250 kt is an appropriate operating or training value.
- **Separate synthetic case:** for the 120-second semicircle in
  `docs/plans/05-case-iii-port.md:94-97`, distance at the conditional
  `250 NM/hour` rate is `250 NM/hour × (120 s ÷ 3600 s/hour) = 25/3 NM`;
  dividing by `π rad` gives
  `25/(3π) NM ≈ 2.6526 NM`. Assumptions are a constant synthetic
  `250 NM/hour` rate, no wind/drift, and a half-circle over 120 seconds. This
  checks the stated arithmetic only;
  it does not validate the real-world hold procedure.
- **Numerical tolerance:** `25/6 NM` is an exact rational result. The existing
  trigonometric model fixtures use an absolute tolerance of `1e-10 NM` for
  floating-point roundoff (`docs/plans/05-case-iii-port.md:109-110`); the
  four-decimal radius above is only display rounding, not a new acceptance
  tolerance.
- **Scope:** the arithmetic conclusion is conditional on the rate being in
  nautical miles per hour. It is not an aviation source finding and does not
  verify the model's knot conversion.

## Insufficient source evidence

- **Medium — knot definition unverified** — The FAA Air Traffic publication's
  [Chapter 1, section 2](https://www.faa.gov/air_traffic/publications/atpubs/atc_html/chap1_section_2.html)
  appeared in search with a snippet defining a knot as one nautical mile per
  hour. Direct page retrieval failed in this environment, so the snippet is a
  research lead, not verification. The current publication date/revision and
  exact glossary entry were not confirmed. The model's `250 kt` to `NM/hour`
  conversion therefore remains unverified. Fetch the official page and verify
  the current entry before treating that conversion as source-supported.

## Unresolved source and applicability

- **Medium — source mapping/applicability incomplete** —
  `docs/plans/05-case-iii-port.md:77-83` describes 280 KIAS gear and 225 KIAS
  flaps as inherited exercise limits, and cites the Heatblur F-14 manual only
  for general system context. That note appropriately labels the values
  unvalidated; it does not map either number to a precise manual passage.
  The official manual page was not retrievable in this environment, so this
  review does not claim either number is right or wrong. Missing evidence:
  exact source edition/revision and page/section; whether each value refers to
  extension, retraction, or another condition; applicability to the F-14B
  configuration; and the relevant DCS module/version if the value is
  simulator-specific. Keep these values visibly provisional until a precise,
  authorized source passage supports them, or relabel them explicitly as
  synthetic exercise parameters.

## Insufficient evidence

- **Medium — procedural claim unverified** —
  `docs/plans/05-case-iii-port.md:72-76` records a 2009 CV NATOPS six-minute
  racetrack and EAT references, but the review could not access an authorized
  copy to inspect the cited passages or establish current edition and
  applicability. The listed public mirror was not fetched. The precise missing
  evidence is an authorized primary-source copy of NAVAIR 00-80T-105, the
  identified sections/pages, edition status, and the operational/aircraft
  context that makes those passages applicable. Treat the procedure as
  **unverified**, do not reproduce the manual, and obtain lawful source access
  before relying on it.

## Untested areas and handoff

No browser, speech, complete sortie, every radio call, assessment pathway, or
qualified technical review was performed. The cited local regression tests are
evidence of intended implementation behavior, not operational authority.
This demonstration makes no code correction and does not promote the content
beyond Drafted. A qualified human must verify any corrected procedure/source
mapping against the exact revision before technical validation; review again
after material corrections at their new head SHA.
