# Editorial audit — Rotor-Wing Principles of Flight

- Source: `src/pages/manual/flight-fundamentals/_RotorWing.astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 62,503 characters including implementation code and SVG; this is not a prose word count. The outline has 17 narrative sections: In this module; Purpose and learning objectives; The blade and its relative wind; Forces, hover and turns; Controls and gyroscopic precession; Rotor systems, torque and configurations; Hover, ground effect and power; Forward flight and dissymmetry of lift; Retreating blade stall and compressibility; Vortex ring state; Dynamic rollover and ground resonance; Low G, mast bumping and low rotor rpm; Loss of tail rotor effectiveness; Autorotation; Terms; Check your understanding; ….

Rotary-wing fundamentals plus multiple hazard categories make a dense single module. Distinguish normal rotor aerodynamics from emergency/hazard recognition and move extended caveats into the relevant sections.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

## 2. Imagery and interactivity

Existing blade, cyclic, power, dissymmetry and VRS figures already cover central concepts. Test whether their captions answer a specific learning question before adding more.

Source contains approximately 6 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

## 3. Learning outcomes

Explain blade relative wind, controls, induced flow, dissymmetry of lift, hover power and the mechanisms underlying VRS, retreating-blade stall and low-rotor-RPM hazards.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

## 4. Important omissions or opportunities

Check differences between teetering, articulated and rigid rotor systems; avoid turning helicopter-specific hazard descriptions into universal operational procedures.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.
