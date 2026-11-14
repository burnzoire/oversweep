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


## Visual-fidelity review: blocker (14 November 2026)

**Current artwork is not acceptable as a final procedure illustration.** The two invented RPM/FTIT dials are generic and do not reproduce the actual F-16C engine instrument cluster or physical panel locations. Retain only as a temporary animation prototype; remove/replace before approval. NATOPS-style means minimal black-line drafting with **exact panel geometry, real control spacing, functional positions, guards and labels**.

| Startup function | Exact drawing needed | Steps requiring it |
| --- | --- | --- |
| Main/battery power | Left console ELEC control panel | battery, main-power |
| FLCS test | Left console TEST panel and relevant annunciators | flcs-test, flcs-release |
| EPU status | EPU indication/control area | epu-check |
| Engine crank | Left console ENG & JET START control panel, including JFS positions and RUN light | jfs |
| Throttle | F-16C throttle cutoff/IDLE mechanism and relevant control stops | throttle |
| RPM, FTIT, oil, nozzle | Actual instrument-panel **Engine Instruments** cluster and separate FUEL FLOW indicator | sec, throttle, generator, idle-check |
| Warnings and gear indications | Actual warning/caution locations and wheel lights | main-power, sec, generator |
| Ground preparation | No instrument drawing required unless a cockpit control is mentioned | ground-ready |

For every panel asset: record the simulator/build/variant, independent image reference, lawful image-use status, drawing source and review status. Compare rendered SVG with source side-by-side for shape, relative component placement, correct lettering and switch travel. Do **not** render a generic panel and label it as an F-16 control.

The current official F-16C manual (23 March 2026) locates the panels under **Instrument Panel** (pp. 44–53) and **Left Console** (pp. 61–73). Engine Instruments are described around p. 48 and ENG & JET START around p. 62. Manual text alone does **not** establish enough geometric detail to author exact SVG paths: the actual images or independently captured DCS references must be visually examined. Verification of both artistic geometry and animation behaviour is outstanding.

**New visual acceptance gate:** No exact panel drawing → no completed illustrated procedure. This does not prevent a review-only implementation branch from remaining available for iteration.

## Interactive prototype pass (14 November 2026)

The following SVG control targets are wired to the procedure state machine and gate navigation until acted on:

- ELEC panel: MAIN PWR OFF → BATT → MAIN PWR (clickable positions and updating electrical annunciators);
- TEST panel: FLCS PWR TEST → TEST, held across the indication step, then release to NORM;
- EPU lamp group: acknowledge both EPU GEN/PMG indications as off;
- ENG & JET START: JFS START 2 with RUN lamp indication;
- throttle: cutoff → IDLE detent after the illustrated 20% RPM gate.

Keyboard Enter/Space is supported for SVG controls. The procedure still renders all text without JavaScript. A separate temporary-branch Chromium capture checks switch interactions and disabled Next-step gating.

**Fidelity qualification:** These are original line-art *working prototypes*. The photographic references establish basic panel relationships and labels, but the panel perimeter, coordinates, the detail of the FLCS TEST panel and the throttle geometry have **not** been independently checked against a current DCS screenshot at matching camera angle. **Exact-outline requirement remains open**; the visual signoff blocker above is **not lifted**. The EPU confirmation is a learning interaction, not a simulated EPU fault detector.

## Reference-derived redraw checkpoint (14 November 2026)

The prior side-by-side RPM/FTIT cartoon has been replaced with the correct four-instrument **OIL → NOZ POS → RPM → FTIT** vertical stack. The guide now includes distinct original SVGs for the ELEC, TEST and GE F110 ENG & JET START panels, with quarter-turn fastener outlines; a 4 × 8 caution-light panel; and the split right-eyebrow warning assembly. The switches remain clickable and warning lamps respond to the procedure state (educational only, not DCS telemetry). Reference basis:

- [xFlight Left Console panel dimensions](https://www.xflight.de/pe_org_par_lfc.htm) — ELEC exact 75.60 × 93.60 mm; TEST and ENG START estimated dimensions; source clearly distinguishes measured and estimated values.
- [xFlight Block 50/52 ELEC controls](https://www.xflight.de/pe_org_par_lfc_elec.htm) and [GE F110 engine-start controls](https://www.xflight.de/pe_org_par_lfc_engstart.htm).
- [DCS engine instrument stack photograph](https://wiki.hoggitworld.com/images/1/10/ENG_Instruments.jpg), [DCS right-eyebrow photograph](https://wiki.hoggitworld.com/images/8/88/VBLs.jpg), and [DCS caution matrix photo](https://cypher1778.github.io/DCS_Wiki/f-16c/images/ss17-caution_panel.jpg).
- [Eagle Dynamics F-16C Early Access Guide, 23 March 2026](https://www.digitalcombatsimulator.ru/upload/iblock/6f7/joywm66pwdgg4iacljy8zolons4dz8dh/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf), panel layout and startup sequence.

**Visual acceptance is still BLOCKED.** A source-derived panel outline is *not* an exact surveyed contour. No reliable, orthographic DCS screenshot overlay or verified per-fastener coordinate table has yet been produced; current individual DZUS positions, panel edge cuts and some labels are draft positions. The throttle remains conceptual. Production should not advertise the artwork as exact, and should not publish the procedure until geometric comparison and in-sim verification are complete. The new work provides a significantly more realistic panel review surface; it does not silently clear the exactness requirement.
