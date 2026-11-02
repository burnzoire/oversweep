# Editorial audit — Case III Recoveries

- Source: `src/pages/manual/naval-operations/[trainer].astro`
- Reviewed: 2026-11-02
- Type: Editorial / learning design, not independent aviation SME validation

## 1. Is it too long?

**Yes for an uninterrupted read.** The module's eighteen navigation sections cover clearance, geometry, holding, timing, penetration, final and missed landing outcomes; much of the content belongs in reference detail. Lead with the complete recovery sequence in a compact overview, followed by four navigable phases: arrival/marshal; hold/commence; approach/final; outcomes. Keep the fine-grained radio and geometry material under those phases rather than deleting it. The source already contains an interactive overview, so improve its role as an anchor.

## 2. Imagery and interactivity

The module already imports RecoveryOverview, TurnIndicator and LensFigure and provides a standalone Tomcat exercise. **Do not add another trainer.** Evaluate whether the figures present a coherent progression and whether their interaction states remain understandable on narrow screens. A single high-quality, step-indexed profile should take precedence over multiple nearly redundant illustrations.

## 3. Intended learning outcomes

Readers should be able to:
1. Identify each Case III recovery phase and the responsible control handoff.
2. Distinguish TACAN radial, inbound course, BRC and final bearing.
3. Interpret a representative marshal clearance and explain altitude/DME/timing relationships within the source's stated limits.
4. Explain the transitions from commence to platform, approach and landing-area visual reference.
5. Distinguish trap, bolter and waveoff outcomes and appropriate procedural continuation at a conceptual level.

The page states learning objectives, and the exercise addresses selected skills; check assessment coverage for all five rather than equating a successful exercise with full mastery.

## 4. Is anything important missing?

- Separate the historical T-45 training example from the aircraft-agnostic conceptual sequence in every phase, not just the opening disclaimer.
- Ensure the difference between marshal stack geometry and approach geometry remains obvious in the figure and nearby prose.
- Keep carrier-specific weather/minima/approach-aid qualifications clearly labelled as procedure-dependent.
- Add a compact flight-crew-oriented overview of 'what happens next' at each control handoff.
- Prefer links to carrier terms and the ship-operations overview instead of duplicating their explanations.

## Priority

**P1 — readability and hierarchy.** Preserve the technically essential procedural detail. No model or procedural changes without independent SME review.

## 5. Flight-simulator relevance and differences

Identify the applicable DCS/BMS modules, which relevant real-world concepts they model, which they simplify or omit, and how a reader can practise the relevant learning outcomes. Check aircraft/version-specific behaviour rather than treating simulator systems as universally accurate.

**Follow-up verification required:** Distinguish real-world facts, simulator-implemented behaviour, known simplifications/omissions and unknowns. Cite a specific simulator/module/version and test or source before asserting fidelity or absence. Present verified sim-only information in the existing visually distinct sim-specific panel convention where applicable. Do not conflate Oversweep's educational models with DCS or BMS.
