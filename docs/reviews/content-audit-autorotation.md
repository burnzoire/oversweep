# Editorial audit — Autorotation Practice

- Source: `src/pages/manual/flight-fundamentals/_Autorotation.astro`
- Reviewed: 2026-11-02
- Type: Editorial / learning design; not a technical SME review

## 1. Is it too long?

**Yes in places.** Strong technical content, but several paragraphs combine mechanism, warnings, control inputs and source qualifications into long blocks. Convert the entry alternatives (cruise, hover/low speed, low-and-fast) into a compact comparison, preserving citations and type-specific caveats. Lead with the immediate collective response and the phase sequence, then explain why.

**Applied (revision 2):** the four entries are a table (cruise, hover with height, low and slow, low and fast), with the long explanation moved into a "More on each entry" block. The page opens with a worked engine failure in five steps, then explains each. Longest paragraph 173 → 112 words.

## 2. Imagery / interactivity

The standalone autorotation exercise is already linked. Avoid turning explanation into mini-games. The page would benefit from one **high-quality static sequence diagram** (power loss → entry → steady descent → flare → level → cushion) and a clear airspeed-versus-descent-rate sketch if the current rendered page lacks them. The user previously reverted low-quality autorotation diagrams, so require visual quality review before reintroducing any.

**Applied (revision 2):** three figures, all redrawn from the FAA handbook rather than invented: Figure 1, the straight-in autorotation, with the helicopter traced from HFH Figure 11-2 and a position-by-position control table; Figure 2, the R44 II height–velocity diagram read off HFH Figure 7-1; Figure 3, the S-300 autorotation curve digitised from HFH Figure 7-3, with the line from the origin to the best-glide point and an airspeed slider that reads out descent rate and glide ratio. The owner asked for new diagrams on 5 November 2026, after rejecting the earlier attempt (PR #159, reverted in #160).

## 3. Learning outcomes

Identify why rotor RPM falls after power loss; explain the immediate collective response; choose the *conceptual* cyclic direction for distinct initial airspeed regimes; understand rotor-RPM/airspeed management; describe flare, level and cushion; and recognise the height–velocity exposure. The stated objectives align.

**Applied (revision 2):** four numbered outcomes; every "Check your understanding" question is tagged to one, with new questions for outcomes 1 and 3. The exercise panel says which outcome each part of the exercise practises.

## 4. Missing important content

- A highly scannable summary of entry differences and landing phases.
- A clear separation of general conceptual explanation from aircraft-type-specific emergency procedures.
- Map the practice exercise's feedback against each stated learning outcome, rather than just its success/failure outcome.
- If a diagram is proposed, verify both clarity and source-supported assumptions before implementing it.

**Applied (revision 2):** scannable summaries are the position table, the entry table, an rpm-management table and a timing-errors table, plus a Key points recap. General technique and type-specific procedure are separated: every type number is either the exercise's invented one (labelled) or the DCS Huey's (in the sim panel).

## Priority

**P1 — shorten and restructure prose; P2 — carefully reviewed static figure.**

## 5. Flight simulator relevance and differences

Compare the separate Oversweep exercise model with the implemented rotor inertia, RPM decay, engine failure and touchdown behaviours of each relevant DCS helicopter module.

**Review action:** establish what is modelled, simplified, absent or unverified, citing the specific simulator, module, version and source/test. Keep real-world facts primary and put simulator-only behaviour in the established visually distinct sim-specific treatment where applicable. **Fidelity verification pending; no unsupported feature-absence claim is made here.**

**Applied (revision 2):** an "In the sim" panel from the DCS UH-1H flight manual, section 9.7 (pp. 127–131): the Huey's entry, rpm, descent, flare and cushion numbers, two differences from the FAA technique (a two-stage cushion starting at 100 to 80 feet; aft cyclic to stop the run-on) and the helicopters not checked. The Oversweep exercise is not compared with any DCS helicopter; that would need flight testing.
