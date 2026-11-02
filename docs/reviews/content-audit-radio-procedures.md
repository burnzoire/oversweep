# Editorial audit — Radio Procedures and Phraseology

- Source: `src/pages/manual/radio-communications/[module].astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 68,604 characters including implementation code and SVG; this is not a prose word count. The outline has 18 narrative sections: In this module; Purpose and learning objectives; Radio technique; Bands and emergency frequencies; The phonetic alphabet; Numbers on the radio; Call signs; A training sortie, call by call; Making contact; Words that do the work; Acknowledgement and readback; Flight check-ins and frequency changes; Brevity and training-rule calls; Distress and urgency; Transponder codes; When the radio fails; ….

Alphabet, number pronunciation, calls, phraseology and worked sortie deserve a layered reference: short operating sequence first, lookup tables and exceptions later. Trim repetitive call templates.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

## 2. Imagery and interactivity

Already has frequency figures, say-it examples, initial-call builder, readback interactions and quizzes. Avoid new interaction without a missing outcome.

Source contains approximately 11 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

## 3. Learning outcomes

Construct a concise initial call; use phonetics and numerical conventions; distinguish acknowledge/readback; recognise formation, emergency and lost-comms calls.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

## 4. Important omissions or opportunities

Check consistency of military and FAA contexts, and that examples expose who is speaking, on which frequency and the expected response.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.

## 5. Flight simulator relevance and differences

Distinguish real-world radio phraseology from DCS/BMS AI ATC, scripted communications and human multiplayer; some calls and services are not implemented.

**Review action:** establish what is modelled, simplified, absent or unverified, citing the specific simulator, module, version and source/test. Keep real-world facts primary and put simulator-only behaviour in the established visually distinct sim-specific treatment where applicable. **Fidelity verification pending; no unsupported feature-absence claim is made here.**
