# Editorial audit — Weapons Delivery

- Source: `src/pages/manual/air-to-ground-operations/[module].astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 45,615 characters including implementation code and SVG; this is not a prose word count. The outline has 15 narrative sections: In this module; Purpose and learning objectives; Types of delivery; The bombing triangle and the sight; Bombing tables and the Z diagram; Roll-in, tracking and recovery; Release parameters and errors; Correcting in the dive; Computed and manual sights; The offset pop-up attack; Low and high drag, fuzes and fragmentation; In the sim; Terms; Check your understanding; Sources and applicability.

Avoid a continuous explanation that moves from delivery geometries to tables, aiming, error corrections and pop-up planning without a simple orienting sequence. Retain limitations and safety framing.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

**Applied (revision 2):** the orienting sequence is now the core: a worked 30° run, delivery types, the bombing triangle, roll-in to recovery, errors and corrections, Key points. Reference holds the delivery tables and Z diagram, sights, the pop-up, ordnance, In the sim, terms, questions and sources. Limitations and the minimum-release-altitude framing stay. The overview became a lede and a numbered outcomes list, and long paragraphs were split. Nothing sourced was cut.

## 2. Imagery and interactivity

The dive-delivery figure, impact error quiz and pop-up diagram are already substantial. Prioritise reader instructions and summary rather than more mini-games.

Source contains approximately 3 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

**Applied (revision 2):** no new figures or games. The delivery types became a side-by-side table, as section 4 asked.

## 3. Learning outcomes

Distinguish level, dive, loft and pop-up geometries; identify release-parameter errors; explain sight/tables concepts, fuze/drag differences, and recovery geometry at a conceptual level.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

**Applied (revision 2):** five numbered outcomes; every question is tagged to one, with new questions for outcomes 1 (choosing an attack type) and 2 (the angles in the sight depression).

## 4. Important omissions or opportunities

Keep illustrative training data and DCS-specific modes separate from real aircraft release limits. A side-by-side delivery-method overview would clarify scope.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

**Applied (revision 2):** the worked example labels the T-45 numbers as practice-bomb training data, not release limits. The DCS F-14 computed-release description moved out of the sights section into the "In the sim" panel, so DCS-specific modes are kept apart from the real-world material.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.

## 5. Flight-simulator relevance and differences

Identify the applicable DCS/BMS modules, which relevant real-world concepts they model, which they simplify or omit, and how a reader can practise the relevant learning outcomes. Check aircraft/version-specific behaviour rather than treating simulator systems as universally accurate.

**Follow-up verification required:** Distinguish real-world facts, simulator-implemented behaviour, known simplifications/omissions and unknowns. Cite a specific simulator/module/version and test or source before asserting fidelity or absence. Present verified sim-only information in the existing visually distinct sim-specific panel convention where applicable. Do not conflate Oversweep's educational models with DCS or BMS.

**Applied (revision 2):** the existing sim section (DCS F-14 and F-4E manuals) is now a visually distinct "In the sim" panel, with the CCRP description moved into it and a "Not checked" line. Other DCS and Falcon BMS aircraft were not read.
