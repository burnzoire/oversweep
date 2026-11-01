# Editorial audit — Weapons Delivery

- Source: `src/pages/manual/air-to-ground-operations/[module].astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 45,615 characters including implementation code and SVG; this is not a prose word count. The outline has 15 narrative sections: In this module; Purpose and learning objectives; Types of delivery; The bombing triangle and the sight; Bombing tables and the Z diagram; Roll-in, tracking and recovery; Release parameters and errors; Correcting in the dive; Computed and manual sights; The offset pop-up attack; Low and high drag, fuzes and fragmentation; In the sim; Terms; Check your understanding; Sources and applicability.

Avoid a continuous explanation that moves from delivery geometries to tables, aiming, error corrections and pop-up planning without a simple orienting sequence. Retain limitations and safety framing.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

## 2. Imagery and interactivity

The dive-delivery figure, impact error quiz and pop-up diagram are already substantial. Prioritise reader instructions and summary rather than more mini-games.

Source contains approximately 3 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

## 3. Learning outcomes

Distinguish level, dive, loft and pop-up geometries; identify release-parameter errors; explain sight/tables concepts, fuze/drag differences, and recovery geometry at a conceptual level.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

## 4. Important omissions or opportunities

Keep illustrative training data and DCS-specific modes separate from real aircraft release limits. A side-by-side delivery-method overview would clarify scope.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.
