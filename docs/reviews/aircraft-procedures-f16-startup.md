# Aircraft Procedures — F-16C vertical slice (issue #261)

## Editorial and visual standard
- Organise by **Manual → Aircraft Procedures → airframe → task**; retain variant and simulator applicability.
- State the exact control/action, prerequisites, expected indication, threshold and any relevant exception.
- Draw **original schematic/NATOPS-inspired line art**, not realistic cockpit facsimiles. Use monochrome except for meaningful operational cues. Artwork should be as simple as the instructional objective permits.
- Separate procedural facts from the SVG renderer. Animate only signals whose behaviour is evidenced. Show full textual steps without JavaScript, respect reduced motion and never imply the animation is live DCS telemetry.
- Source facts to specific sections of official simulator documentation. Community guides (including Chuck's Guides) can prompt questions and be linked, but do not copy their wording, structure, diagrams or imagery.
- Do not include screenshots or extracted simulator assets without resolved rights.

## Status and omissions
This first slice is **review-only** (the same local/review flag used by excluded experiences). The guide covers the pre-start checks and engine start through stable idle; **it is not a complete cold-start-to-taxi sequence**. Before publishing, extend it with the verified after-start checklist, INS alignment and aircraft setup.

The source for this draft is the Eagle Dynamics *DCS F-16C Early Access Guide*, 23 March 2026, pp. 134–135 (Before Engine Start / Engine Start). **No running DCS build was available for validation.** Data names and caution/warning indications, any source-edition differences, and engine response timing require a current simulator test.

The schematic RPM and FTIT dials are instructional abstractions. Their physical layout, needle characteristics, animation duration and readouts are not intended to reproduce the exact cockpit presentation. Any future higher-fidelity state machine must be verified with recorded DCS data before marking it technically validated.

## Local verification checklist
1. Start a cold-and-dark F-16C in the chosen DCS build; record build number and cockpit variant.
2. Verify power, FLCS test, caution-light changes, JFS START 2, SEC light and 20% RPM throttle handoff step by step.
3. Record RPM/FTIT observations and the standby/main generator transition; compare with the visual model and correct or label illustrations as conceptual.
4. Check idle indications against guide limits, including fuel flow, nozzle position, oil and hydraulic pressure.
5. Verify after-start avionics and INS procedure; add required cockpit actions, source ranges and exception paths.
6. Complete technical SME, copyright, accessibility and publication reviews under existing site rules.

## Acceptance gate
Only switch this procedure into public listings when it is complete and the technical and rights checks above pass. A review build flag is for review, **not** an approval.
