# Editorial audit — Air Navigation

- Source: `src/pages/manual/navigation/[module].astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 68,277 characters including implementation code and SVG; this is not a prose word count. The outline has 22 narrative sections: In this module; Purpose and learning objectives; Reading the HSI; Setting up a course; Flying to and from a station; Intercepting a course; Using distance: ground speed and arcs; Point to point; Waypoints, offsets and direct-to; Cross-checking and degraded navigation; Background; Position on the earth; Writing a position; Direction: true, magnetic and compass; Dead reckoning and the wind triangle; Radio navigation aids; ….

The useful HSI/TACAN course work comes before long background on coordinates. Keep the operational learning path prominent and make reference-only geography/coordinate material secondary.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

**Applied (revision 3):** the operational path is now the core sequence (worked example, HSI, setup, tracking, intercepts, DME and arcs, point to point, waypoints, cross-checking, Key points), and Reference holds air-to-air TACAN, position, coordinates, direction, wind, the aids, GPS, INS, In the sim, terms, questions and sources. The "Background" divider went. The overview became a lede and a numbered outcomes list, and paragraphs over about 120 words were split. Nothing sourced was cut.

## 2. Imagery and interactivity

Already has HSI, DME-arc, point-to-point and waypoint-route interactive figures and quizzes. Make each task actionable with a readout and interpretation, not additional diagrams.

Source contains approximately 8 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

**Applied (revision 3):** no new figures. Air-to-air TACAN (old Figure 3) moved to Reference, so the figures are renumbered (old 1, 2, 4, 5, 3 become 1–5; 6–8 unchanged).

## 3. Learning outcomes

Read HSI course and bearing cues; identify radial vs bearing; intercept and track a course; reason about DME arcs and point-to-point navigation; check position by independent means.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

**Applied (revision 3):** five numbered outcomes; every question is tagged to one, with a new question for outcome 3 (the 30° intercept method).

## 4. Important omissions or opportunities

Look for a concise setup and cross-check workflow. Clearly state magnetic/true reference, wind correction, simulator instrument variations and point-to-point assumptions.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

**Applied (revision 3):** the worked example is the setup and cross-check workflow the audit asked for, end to end on one invented DME arc, with a key point after each core section and a recap. True and magnetic reference and wind correction stay in their sections. The T-45C display details remain, labelled as that aircraft's; making them generic is a content change left for a later revision.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.

## 5. Flight-simulator relevance and differences

Identify the applicable DCS/BMS modules, which relevant real-world concepts they model, which they simplify or omit, and how a reader can practise the relevant learning outcomes. Check aircraft/version-specific behaviour rather than treating simulator systems as universally accurate.

**Follow-up verification required:** Distinguish real-world facts, simulator-implemented behaviour, known simplifications/omissions and unknowns. Cite a specific simulator/module/version and test or source before asserting fidelity or absence. Present verified sim-only information in the existing visually distinct sim-specific panel convention where applicable. Do not conflate Oversweep's educational models with DCS or BMS.

**Applied (revision 3):** a module-level "In the sim" panel from the Falcon BMS 4.38.1 Training Manual (pp. 68–71): steerpoints and the HUD steering cue, the HSI's TCN and NAV modes, and the INS cross-check against the approach chart over the initial approach fix. The existing air-to-air TACAN panel (DCS F-16C, DCS F/A-18C, BMS) stays. DCS navigation beyond air-to-air TACAN was not checked.
