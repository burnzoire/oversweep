# Editorial audit — The Airfield and the Traffic Pattern

- Source: `src/pages/manual/airfield-operations/[module].astro`
- Reviewed: 2026-11-02
- Method: Inspected module source and declared sections/figures; **editorial**, not technical SME validation or rendered-browser QA

## 1. Is it too long?

**Candidate for structural tightening, not indiscriminate deletion.** Page source spans approximately 95,795 characters including implementation code and SVG; this is not a prose word count. The outline has 17 narrative sections: In this module; Purpose and learning objectives; The aerodrome at a glance; Runway numbers; Runway markings; Taxiways and holding positions; Airport signs; Airfield lighting; Visual glide slope indicators; Wind and the runway in use; The traffic pattern; The overhead maneuver; Talking to the airfield; Moving on the ground; Airfield terms; Check your understanding; ….

Split the long sequence of runway identification, signs, lighting and traffic patterns into a core arrival/departure path and reference sections. Avoid repeating definition text in every figure.

**Suggested action:** Edit the first-pass path and duplicated introductory material before shortening technically necessary reference explanations. Track actual rendered prose reading length separately.

**Applied (revision 3):** the contents are split into a core sequence that follows one sortie (worked example, aerodrome, wind and runway in use, ground movement, holding positions, signs, pattern, overhead, talking to the airfield, Key points) and Reference (runway numbers, markings, lighting, glide slope indicators, sim, terms, questions). Figures were renumbered to match the new order; nothing sourced was cut. Paragraphs over about 110 words were split; the longest prose paragraph is now 117 words, down from 144.

## 2. Imagery and interactivity

Existing interactive runway-number, marking, holding-position, sign, lighting and wind figures are substantial. Prefer targeted caption and mobile accessibility improvements, not more widgets.

Source contains approximately 13 figure-title markers; this count is only a structural indicator and **not** a browser-rendered inventory. Verify the actual rendered diagrams and mobile fallbacks before recommending additional components.

**Applied (revision 3):** no new figures. Signs and lighting lists became tables; an overhead table compares the Navy and Air Force terms, with the detail moved into a "More on" block; a table compares who you talk to at military, civil towered and non-towered fields.

## 3. Learning outcomes

Identify runway and hold-short markings; interpret runway selection, lighting and approach aids; describe overhead and conventional patterns; recognise ground-movement and radio safety requirements.

**Check:** The overview and end-of-module questions should both cover these outcomes; split broad objectives into observable questions where necessary.

**Applied (revision 3):** six numbered outcomes, and every one of the 23 questions is tagged to one.

## 4. Important omissions or opportunities

Check that users can follow an end-to-end ground-to-airfield departure/arrival flow, with military versus civil applicability clearly separated.

Also check cross-links to relevant encyclopedia terms, aircraft and ordnance where they improve comprehension, and distinguish general principles from T-45/FAA/service-specific examples.

**Applied (revision 3):** the end-to-end departure and arrival flow is the worked example at the top, with a key point after each core section and a recap. Military and civil applicability stays labelled in each section; the T-6A script and Columbus AFB material are labelled as examples.

## Priority

**P1 editorial restructuring** for a clearer first-pass learning path; retain useful reference depth. Any substantive procedure edits require separate SME validation.

## 5. Flight simulator relevance and differences

Compare markings, lighting, ATC, runway procedures and arresting gear with their actual DCS/BMS implementations; absence or partial simulation may affect practice value.

**Review action:** establish what is modelled, simplified, absent or unverified, citing the specific simulator, module, version and source/test. Keep real-world facts primary and put simulator-only behaviour in the established visually distinct sim-specific treatment where applicable. **Fidelity verification pending; no unsupported feature-absence claim is made here.**

**Applied (revision 3):** an "In the sim" panel from the Falcon BMS 4.38.1 Training Manual (Missions 1 and 3: taxi, wind, takeoff, PAPI, overhead), including one difference: BMS's single-ship break cue is the far threshold disappearing under the nose, where the Navy break point is normally over the landing threshold. DCS airfields and ATC were not checked.
