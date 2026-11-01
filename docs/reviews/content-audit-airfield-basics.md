# Editorial audit — The Airfield and the Traffic Pattern

- Source: `src/pages/manual/airfield-operations/[module].astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 95,795 characters including implementation code and SVG; this is not a prose word count. The outline has 17 narrative sections: In this module; Purpose and learning objectives; The aerodrome at a glance; Runway numbers; Runway markings; Taxiways and holding positions; Airport signs; Airfield lighting; Visual glide slope indicators; Wind and the runway in use; The traffic pattern; The overhead maneuver; Talking to the airfield; Moving on the ground; Airfield terms; Check your understanding; ….

Split the long sequence of runway identification, signs, lighting and traffic patterns into a core arrival/departure path and reference sections. Avoid repeating definition text in every figure.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

## 2. Imagery and interactivity

Existing interactive runway-number, marking, holding-position, sign, lighting and wind figures are substantial. Prefer targeted caption and mobile accessibility improvements, not more widgets.

Source contains approximately 13 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

## 3. Learning outcomes

Identify runway and hold-short markings; interpret runway selection, lighting and approach aids; describe overhead and conventional patterns; recognise ground-movement and radio safety requirements.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

## 4. Important omissions or opportunities

Check that users can follow an end-to-end ground-to-airfield departure/arrival flow, with military versus civil applicability clearly separated.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.
