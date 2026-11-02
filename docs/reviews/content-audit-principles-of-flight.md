# Editorial audit — Fixed-Wing Principles of Flight

- Source: `src/pages/manual/flight-fundamentals/_FixedWing.astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 46,494 characters including implementation code and SVG; this is not a prose word count. The outline has 16 narrative sections: In this module; Purpose and learning objectives; The four forces; The wing and angle of attack; The lift equation; Drag; Wingtip vortices and ground effect; Axes and flight controls; Stability; Turns and load factor; Stalls; The stall boundary and maneuvering speed; Energy: altitude and airspeed; Terms; Check your understanding; Sources and applicability.

This is broad foundational material. Present an essential path (forces → AOA/lift → drag → load factor/stall) before stability, energy and performance extensions, rather than deleting fundamentals.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

## 2. Imagery and interactivity

Already uses multiple interactive force, airfoil, drag, stability and turn figures. A figure index with question/interpretation may help more than another diagram.

Source contains approximately 9 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

## 3. Learning outcomes

Explain how AOA and airspeed relate to lift; distinguish parasite and induced drag; reason about turns, stall, load factor, stability and energy.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

## 4. Important omissions or opportunities

Ensure each mathematical figure shows its assumptions and units; keep T-45 numbers distinct from universal aerodynamic relationships.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.

## 5. Flight simulator relevance and differences

Separate physical principles from aircraft-specific simulator flight models, instrument indications and unmodelled/approximate aerodynamic effects.

**Review action:** establish what is modelled, simplified, absent or unverified, citing the specific simulator, module, version and source/test. Keep real-world facts primary and put simulator-only behaviour in the established visually distinct sim-specific treatment where applicable. **Fidelity verification pending; no unsupported feature-absence claim is made here.**
