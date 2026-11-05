# Editorial audit — Case III Recoveries

- Source: `src/pages/manual/naval-operations/[trainer].astro`
- Reviewed: 2026-11-02
- Type: Editorial / learning design, not independent aviation SME validation

## 1. Is it too long?

**Yes for an uninterrupted read.** The module's eighteen navigation sections cover clearance, geometry, holding, timing, penetration, final and missed landing outcomes; much of the content belongs in reference detail. Lead with the complete recovery sequence in a compact overview, followed by four navigable phases: arrival/marshal; hold/commence; approach/final; outcomes. Keep the fine-grained radio and geometry material under those phases rather than deleting it. The source already contains an interactive overview, so improve its role as an anchor.

**Applied (revision 3):** the core sequence is the four phases (the Figure 1 overview, a phase-and-handoff table, clearance, bearings, marshal, commence and platform, the profile, final and the ball, the landing outcome, Key points), with a key point after each section. The navigation, holding-entry and turn-needle practice, communications and radio terms move to labelled reference sections. No detail was cut.

## 2. Imagery and interactivity

The module already imports RecoveryOverview, TurnIndicator and LensFigure and provides a standalone Tomcat exercise. **Do not add another trainer.** Evaluate whether the figures present a coherent progression and whether their interaction states remain understandable on narrow screens. A single high-quality, step-indexed profile should take precedence over multiple nearly redundant illustrations.

**Applied (revision 3):** no new trainer or figure. Figure 1 stays the step-indexed anchor; Figures 1–5 keep their order in the core sequence.

## 3. Intended learning outcomes

Readers should be able to:
1. Identify each Case III recovery phase and the responsible control handoff.
2. Distinguish TACAN radial, inbound course, BRC and final bearing.
3. Interpret a representative marshal clearance and explain altitude/DME/timing relationships within the source's stated limits.
4. Explain the transitions from commence to platform, approach and landing-area visual reference.
5. Distinguish trap, bolter and waveoff outcomes and appropriate procedural continuation at a conceptual level.

The page states learning objectives, and the exercise addresses selected skills; check assessment coverage for all five rather than equating a successful exercise with full mastery.

**Applied (revision 3):** these five outcomes are a numbered list; every question is tagged to one, with new questions for outcome 1 (who comes before Marshal), outcome 3 (the fix for angels 9) and outcome 5 (bolter versus waveoff).

## 4. Is anything important missing?

- Separate the historical T-45 training example from the aircraft-agnostic conceptual sequence in every phase, not just the opening disclaimer.
- Ensure the difference between marshal stack geometry and approach geometry remains obvious in the figure and nearby prose.
- Keep carrier-specific weather/minima/approach-aid qualifications clearly labelled as procedure-dependent.
- Add a compact flight-crew-oriented overview of 'what happens next' at each control handoff.
- Prefer links to carrier terms and the ship-operations overview instead of duplicating their explanations.

**Applied (revision 3):** the phase table has a "What happens next" column for each handoff and an "Example in [1]" column that keeps the T-45C values apart from the generic step; the key points are generic. The lede links to Ship Operations for the ship, deck and Case I pattern instead of repeating them. Weather minima stay unresolved and labelled as before.

## Priority

**P1 — readability and hierarchy.** Preserve the technically essential procedural detail. No model or procedural changes without independent SME review.

## 5. Flight-simulator relevance and differences

Identify the applicable DCS/BMS modules, which relevant real-world concepts they model, which they simplify or omit, and how a reader can practise the relevant learning outcomes. Check aircraft/version-specific behaviour rather than treating simulator systems as universally accurate.

**Follow-up verification required:** Distinguish real-world facts, simulator-implemented behaviour, known simplifications/omissions and unknowns. Cite a specific simulator/module/version and test or source before asserting fidelity or absence. Present verified sim-only information in the existing visually distinct sim-specific panel convention where applicable. Do not conflate Oversweep's educational models with DCS or BMS.

**Applied (revision 3):** an "In the sim" panel from the DCS Supercarrier Operations Guide (pp. 75–81), comparing its Case III recovery with [1]: the same phases and descent, but "established" within 20 NM of the stack, "fly bullseye" on intercepting the final bearing, and configure at 8 NM, on speed at 6 NM. The guide's own overview (p. 75) differs from its final section; the panel says so. Bolter re-entry, Case II and the LSO station were not checked.
