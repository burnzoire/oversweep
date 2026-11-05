# Editorial audit — Basic Fighter Maneuvers

- Source: `src/pages/manual/air-combat/[module].astro` (BFM route)
- Reviewed: 2026-11-02
- Type: Editorial / learning design, not a technical SME validation

## 1. Is it too long?

**Yes, for a single learning pass.** The page contains fourteen top-level navigation entries and extensive discussion of geometry, pursuit, performance, the vertical, 1-circle/2-circle flow, overshoots and guns. Preserve technical depth as reference material, but make the first-pass path explicit: geometry → pursuit/closure → turn performance → fight flow. Condense repeated caveats and figures' prose into consistent captions, without omitting model assumptions.

**Applied (revision 3):** the contents are split into a core sequence (worked engagement, geometry, pursuit, turn performance, flow, overshoots, Key points) and Reference (training frame, the vertical, the deck, three-dimensional maneuvers, guns, sim, terms, questions). Nothing sourced was cut. Paragraphs over about 120 words were split. Core path about 2,400 of 5,400 rendered words.

## 2. Imagery / interactivity

**Already strong.** The code has interactive geometry and pursuit figures and references additional flow/overshoot components. Do not request a generic new trainer or redundant graphics. Focus on whether each figure has a one-sentence question ('What changes when…?') and a short interpretation of its result, with accessible static fallback. Verify rendered accessibility separately.

**Applied (revision 3):** no new figures. The pursuit list and the one-/two-circle comparison became tables. Figure prompts were already in place.

## 3. Learning outcomes

Reader should be able to determine positional advantage from 3/9-line/aspect geometry, differentiate lead/pure/lag pursuit, explain corner speed and load-versus-lift-limited turns, distinguish 1-circle/2-circle outcomes, understand vertical energy trade-offs, and recognise overshoots and gun-employment geometry. The explicit objectives already cover these skills; they may be too numerous for a single module and deserve a short 'core' versus 'advanced' distinction.

**Applied (revision 3):** six numbered outcomes, with core and advanced split by the contents groups; each question is tagged to one, and a snap-shot question was added for outcome 6.

## 4. Missing important content

- A compact recap/checklist tying the figures together into a BFM decision sequence, without prescribing aircraft-specific tactics.
- Stronger separation between source-specific T-45 training-rule numbers and general BFM concepts.
- Make defensive/high-aspect/section BFM exclusions conspicuous as scope rather than implying comprehensive BFM instruction.
- Check the existing 'Check your understanding' questions against each core outcome before adding more interaction.

**Applied (revision 3):** a worked engagement ties the figures into one decision sequence, with a Key point after each core section and a recap. T-45 numbers are labelled as examples throughout, following the owner's 2 November 2026 rule to teach generic procedures. The scope exclusions stay in the status panel.

## Priority

**P1 — structure and reading path; no new interactive components.**

## 5. Flight simulator relevance and differences

DCS/BMS energy and pursuit behaviour depend on aircraft flight models and mission setups; real-world T-45 performance numbers and training rules are not generic sim limits.

**Review action:** establish what is modelled, simplified, absent or unverified, citing the specific simulator, module, version and source/test. Keep real-world facts primary and put simulator-only behaviour in the established visually distinct sim-specific treatment where applicable. **Fidelity verification pending; no unsupported feature-absence claim is made here.**

**Applied (revision 3):** an "In the sim" panel from the Falcon BMS 4.38.1 Training Manual (pp. 316–323) compares its BFM primer with this module and flags two simplifications (one-circle "reduce speed", two-circle "increase speed"). DCS modules were not checked.
