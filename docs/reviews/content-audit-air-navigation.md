# Editorial audit — Air Navigation

- Source: `src/pages/manual/navigation/[module].astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 68,277 characters including implementation code and SVG; this is not a prose word count. The outline has 22 narrative sections: In this module; Purpose and learning objectives; Reading the HSI; Setting up a course; Flying to and from a station; Intercepting a course; Using distance: ground speed and arcs; Point to point; Waypoints, offsets and direct-to; Cross-checking and degraded navigation; Background; Position on the earth; Writing a position; Direction: true, magnetic and compass; Dead reckoning and the wind triangle; Radio navigation aids; ….

The useful HSI/TACAN course work comes before long background on coordinates. Keep the operational learning path prominent and make reference-only geography/coordinate material secondary.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

## 2. Imagery and interactivity

Already has HSI, DME-arc, point-to-point and waypoint-route interactive figures and quizzes. Make each task actionable with a readout and interpretation, not additional diagrams.

Source contains approximately 8 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

## 3. Learning outcomes

Read HSI course and bearing cues; identify radial vs bearing; intercept and track a course; reason about DME arcs and point-to-point navigation; check position by independent means.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

## 4. Important omissions or opportunities

Look for a concise setup and cross-check workflow. Clearly state magnetic/true reference, wind correction, simulator instrument variations and point-to-point assumptions.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.
