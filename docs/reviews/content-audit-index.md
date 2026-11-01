# Oversweep editorial content audit — register

Date: 2026-11-02  
Status: **20 individual reviews completed; 219 encyclopedia records remain**.

## Method

Each reviewed page was read from repository source. Assessments address:
1. Length and the difference between valuable reference depth and repetition.
2. Existing imagery/interactivity and *specific* missing learning aids.
3. Observable learning outcomes.
4. Material omissions, applicability and useful cross-links.
5. **Flight simulator relevance:** what this subject means in DCS, Falcon BMS and other applicable sims; what is implemented, simplified, missing or unknown, grounded in specific module and version evidence.

The reviews are editorial, **not** independent aviation SME validation, and source-level inspection is **not** a rendered browser test. Proposed diagrams must be checked for visual quality and lawful source rights. Existing `docs/reviews/*-evidence.md` are separate technical evidence reviews.

## Simulator fidelity and presentation standard

Each review must assess simulator relevance even when the article is primarily real-world reference material. Distinguish: **real-world fact/procedure**; **simulator-implemented behaviour** (name the sim, module, version and verification basis); **known simplification or omission**; and **unknown/unverified** (do not present as unsupported absence). Where a sim lacks a real procedure or system, make that distinction useful to a reader trying to practise it. Do not assume that DCS or BMS implements a real-world feature just because an aircraft or weapon is present. Do not conflate the separate Oversweep trainers' models with any simulator's flight model.

**Existing presentation:** the encyclopedia already has a `.sim-panel` treatment in `src/styles/encyclopedia.css`, used by `src/components/encyclopedia/AirfieldRecordPage.astro`. Prefer reusing this visual distinction instead of introducing new promotional blocks or another component style. Check the rendered output before prescribing its use on manual pages, where the existing styling may differ. Simulator-specific callouts should supplement, not interrupt, the primary real-world explanation.

**Review status:** this fifth criterion was added after the first editorial pass. Earlier reviews remain editorially complete for criteria 1–4 but simulator fidelity must be assessed and marked separately before they are considered five-criterion complete. In particular, existing sim references are not proof of simulation fidelity.

## Modules — 10 of 10 reviewed

| Module | Review |
| --- | --- |
| BFM | [Review](content-audit-bfm.md) |
| The Airfield and the Traffic Pattern | [Review](content-audit-airfield-basics.md) |
| Radio Procedures | [Review](content-audit-radio-procedures.md) |
| Fixed-Wing Principles of Flight | [Review](content-audit-principles-of-flight.md) |
| Rotor-Wing Principles of Flight | [Review](content-audit-rotor-wing.md) |
| Air Navigation | [Review](content-audit-air-navigation.md) |
| Weapons Delivery | [Review](content-audit-weapons-delivery.md) |
| Carrier and Amphibious Ship Operations | [Review](content-audit-ship-operations.md) |
| Case III Recoveries | [Review](content-audit-case-iii.md) |
| Autorotation Practice | [Review](content-audit-autorotation.md) |

## Encyclopedia — 10 of 229 reviewed

| Category | Completed |
| --- | --- |
| Aircraft (1) | [A-10](content-audit-a-10.md) |
| Ordnance (1) | [GAU-8](content-audit-gau-8.md) |
| Threat systems (8) | [SA-1](content-audit-threat-systems-sa-1.md), [SA-2](content-audit-sa-2.md), [SA-3](content-audit-threat-systems-sa-3.md), [SA-4](content-audit-threat-systems-sa-4.md), [SA-5](content-audit-threat-systems-sa-5.md), [SA-6](content-audit-threat-systems-sa-6.md), [SA-7](content-audit-threat-systems-sa-7.md), [SA-8](content-audit-threat-systems-sa-8.md) |

**219 encyclopedia records remain unreviewed:** 47 aircraft, 68 ordnance, 11 threat systems, 8 terminology sets and 85 locations. The large Locations category includes records with historically sensitive simulator/real-world distinctions.

## Main findings so far

- **P1:** Rework the *learning path* for long-form modules rather than deleting necessary technical depth. In particular: BFM, Case III, rotor/fixed-wing fundamentals, and ship operations contain broad topic spans.
- **P1:** Autorotation prose needs a more scannable phase summary; any new illustration needs substantially better visual QA than the reverted attempt.
- **P1:** Check dated claims and variant distinctions in the A-10 article.
- **P2:** GAU-8 is already strong. Keep it featured; reduce repeated specification figures and prefer one installation schematic.
- **P2:** Threat profiles are generally reference material; shorten only repetitious sections, retaining source-bounded envelopes and emitter descriptions.

## Remaining work

Do not create placeholder per-record 'reviews' from catalogue metadata alone. Read the content Markdown (and rendered page when assessing imagery), then write a review containing decisions grounded in that page. Prioritise featured articles and other high-traffic records, but eventually cover every published encyclopedia record. Review documents should be indexed here.
