# Oversweep content audit — coverage register

Date: 2026-11-02

This is an **editorial** review series, separate from existing aviation SME evidence reviews. No underlying content has been modified.

## Review criteria

Every completed review answers:
1. **Length and information density:** distinguish reference detail worth preserving from repetition; specify cuts.
2. **Imagery and interactivity:** assess what exists before recommending a visual; prefer an explanatory static figure over a gratuitous mini-game.
3. **Learning outcomes:** state measurable outcomes for manual modules; for encyclopedia records, state what a reader should understand or be able to identify.
4. **Important omissions:** identify substantive missing context, applicability, cross-links, and source caveats.

Priorities: P1 = material reader comprehension/coverage issue; P2 = useful targeted improvement; P3 = optional polish.

## Completed full-text reviews in this PR

| Type | Record | Review |
| --- | --- | --- |
| Module | Basic Fighter Maneuvers | [BFM](content-audit-bfm.md) |
| Module | Autorotation Practice | [Autorotation](content-audit-autorotation.md) |
| Encyclopedia | GAU-8/A | [GAU-8](content-audit-gau-8.md) |
| Encyclopedia | A-10 | [A-10](content-audit-a-10.md) |
| Encyclopedia | SA-2 | [SA-2](content-audit-sa-2.md) |

## Coverage status

**Incomplete — five full-text reviews.** The catalogue contains other manuals and encyclopedia records that have **not** received full-text editorial review. Do not interpret the absence of a finding as a pass. In particular, the other modules (including Case III Recoveries, Fixed-Wing Principles of Flight, Rotor-Wing Principles of Flight, Air Navigation, Radio Procedures, Weapons Delivery, Airfield Basics and Ship Operations) and the remaining encyclopedia records are still pending.

A complete follow-on audit should enumerate both `src/data/modules.json`, nested `src/data/experiences.json[*].module` and `src/data/encyclopedia.json`, then inspect the rendered/implemented page, associated source Markdown and imagery for every included record before writing its document. Avoid generating boilerplate 'reviews' from the registry alone.
