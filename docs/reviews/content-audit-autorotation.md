# Editorial audit — Autorotation Practice

- Source: `src/pages/manual/flight-fundamentals/_Autorotation.astro`
- Reviewed: 2026-11-02
- Type: Editorial / learning design; not a technical SME review

## 1. Is it too long?

**Yes in places.** Strong technical content, but several paragraphs combine mechanism, warnings, control inputs and source qualifications into long blocks. Convert the entry alternatives (cruise, hover/low speed, low-and-fast) into a compact comparison, preserving citations and type-specific caveats. Lead with the immediate collective response and the phase sequence, then explain why.

## 2. Imagery / interactivity

The standalone autorotation exercise is already linked. Avoid turning explanation into mini-games. The page would benefit from one **high-quality static sequence diagram** (power loss → entry → steady descent → flare → level → cushion) and a clear airspeed-versus-descent-rate sketch if the current rendered page lacks them. The user previously reverted low-quality autorotation diagrams, so require visual quality review before reintroducing any.

## 3. Learning outcomes

Identify why rotor RPM falls after power loss; explain the immediate collective response; choose the *conceptual* cyclic direction for distinct initial airspeed regimes; understand rotor-RPM/airspeed management; describe flare, level and cushion; and recognise the height–velocity exposure. The stated objectives align.

## 4. Missing important content

- A highly scannable summary of entry differences and landing phases.
- A clear separation of general conceptual explanation from aircraft-type-specific emergency procedures.
- Map the practice exercise's feedback against each stated learning outcome, rather than just its success/failure outcome.
- If a diagram is proposed, verify both clarity and source-supported assumptions before implementing it.

## Priority

**P1 — shorten and restructure prose; P2 — carefully reviewed static figure.**

## 5. Flight simulator relevance and differences

Compare the separate Oversweep exercise model with the implemented rotor inertia, RPM decay, engine failure and touchdown behaviours of each relevant DCS helicopter module.

**Review action:** establish what is modelled, simplified, absent or unverified, citing the specific simulator, module, version and source/test. Keep real-world facts primary and put simulator-only behaviour in the established visually distinct sim-specific treatment where applicable. **Fidelity verification pending; no unsupported feature-absence claim is made here.**
