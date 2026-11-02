# Editorial audit — Carrier and Amphibious Ship Operations

- Source: `src/pages/manual/naval-operations/[module].astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 89,287 characters including implementation code and SVG; this is not a prose word count. The outline has 19 narrative sections: In this module; Purpose and learning objectives; The ships and who controls the air; The carrier flight deck; Who wears which jersey; The catapult launch; Case I, II and III; The Case I recovery; The lens and the ball; LSO calls and grades; Arrestment, bolter, waveoff and Delta; Tanking and bingo; Amphibious assault ships; Helicopters aboard ship; Army deck landing qualification; STOVL: the AV-8B aboard ship; ….

This combines flight deck organisation, launch, multiple recovery cases, LSO outcomes, and amphibious/rotary-wing operations. A core fixed-wing path plus clearly labelled ship/aircraft branches would reduce cognitive load.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

## 2. Imagery and interactivity

Deck plan, Case I pattern, glideslope and LSO activities already exist. Improve figure-to-prose cross-reference and summary, not extra controls.

Source contains approximately 5 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

## 3. Learning outcomes

Identify deck control roles; describe launch flow, distinguish Case I/II/III, interpret lens and LSO indications, and recognise bolter/waveoff outcomes and amphibious differences.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

## 4. Important omissions or opportunities

Avoid duplicating the dedicated Case III module; make it a concise overview and direct readers there. Confirm aircraft- and ship-specific procedures remain clearly bounded.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.

## 5. Flight-simulator relevance and differences

Identify the applicable DCS/BMS modules, which relevant real-world concepts they model, which they simplify or omit, and how a reader can practise the relevant learning outcomes. Check aircraft/version-specific behaviour rather than treating simulator systems as universally accurate.

**Follow-up verification required:** Distinguish real-world facts, simulator-implemented behaviour, known simplifications/omissions and unknowns. Cite a specific simulator/module/version and test or source before asserting fidelity or absence. Present verified sim-only information in the existing visually distinct sim-specific panel convention where applicable. Do not conflate Oversweep's educational models with DCS or BMS.
