# Editorial audit — Rotor-Wing Principles of Flight

- Source: `src/pages/manual/flight-fundamentals/_RotorWing.astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 62,503 characters including implementation code and SVG; this is not a prose word count. The outline has 17 narrative sections: In this module; Purpose and learning objectives; The blade and its relative wind; Forces, hover and turns; Controls and gyroscopic precession; Rotor systems, torque and configurations; Hover, ground effect and power; Forward flight and dissymmetry of lift; Retreating blade stall and compressibility; Vortex ring state; Dynamic rollover and ground resonance; Low G, mast bumping and low rotor rpm; Loss of tail rotor effectiveness; Autorotation; Terms; Check your understanding; ….

Rotary-wing fundamentals plus multiple hazard categories make a dense single module. Distinguish normal rotor aerodynamics from emergency/hazard recognition and move extended caveats into the relevant sections.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

**Applied (revision 2):** normal rotor aerodynamics and hazard recognition are now separate. The core sequence is the worked example, the blade, forces, controls, hover power, forward flight, a new "hazards at a glance" table and Key points; Reference holds rotor systems, each hazard's full section, autorotation, In the sim, terms, questions and sources. The overview became a lede and a numbered outcomes list, and paragraphs over about 120 words were split. Nothing sourced was cut.

## 2. Imagery and interactivity

Existing blade, cyclic, power, dissymmetry and VRS figures already cover central concepts. Test whether their captions answer a specific learning question before adding more.

Source contains approximately 6 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

**Applied (revision 2):** no new figures; the figure order is unchanged. Two tables added: the hazards (conditions, signs, first action, with links to each section) and the sim comparison.

## 3. Learning outcomes

Explain blade relative wind, controls, induced flow, dissymmetry of lift, hover power and the mechanisms underlying VRS, retreating-blade stall and low-rotor-RPM hazards.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

**Applied (revision 2):** five numbered outcomes; every question is tagged to one, with a new question for outcome 1 (a gust changes angle of attack without a pitch change).

## 4. Important omissions or opportunities

Check differences between teetering, articulated and rigid rotor systems; avoid turning helicopter-specific hazard descriptions into universal operational procedures.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

**Applied (revision 2):** the rotor-system differences stay in their own reference section. The hazard table is captioned as the sources' general guidance, not a checklist, with the flight manual governing, so hazard descriptions do not read as universal procedures.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.

## 5. Flight-simulator relevance and differences

Identify the applicable DCS/BMS modules, which relevant real-world concepts they model, which they simplify or omit, and how a reader can practise the relevant learning outcomes. Check aircraft/version-specific behaviour rather than treating simulator systems as universally accurate.

**Follow-up verification required:** Distinguish real-world facts, simulator-implemented behaviour, known simplifications/omissions and unknowns. Cite a specific simulator/module/version and test or source before asserting fidelity or absence. Present verified sim-only information in the existing visually distinct sim-specific panel convention where applicable. Do not conflate Oversweep's educational models with DCS or BMS.

**Applied (revision 2):** an "In the sim" panel from the DCS UH-1H flight manual's aerodynamics chapter (printed pp. 27–34), comparing what it says about translational lift (about 18 kt), ground effect (about half a rotor diameter, where the FAA says one), vortex ring state (excess power early, then less collective and forward cyclic) and retreating blade stall with this module. It makes no claim about how the DCS flight model behaves, and other sim helicopters were not checked.
