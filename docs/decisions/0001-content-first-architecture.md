# Decision note 0001: Content-first static architecture

Status: Working default; no separate acceptance required.

## Current choice

Use Astro + TypeScript with static output, structured Markdown/MDX and validated
data records. Use one React root per complete trainer and pure deterministic model
functions independent of UI. The [assessment](../plans/02-architecture-assessment.md)
records the rationale, alternatives and useful future validation cases.

This is the assessed working recommendation, not a claim of owner stack approval,
measured performance, installed package compatibility or a successful spike.

## Why and when to revisit

The site is a reference with embedded experiences, so static content and selective
interactivity fit its current scope. Next.js and a Vite React SPA were considered.
Revisit in the implementing PR if source audit, shared state or server requirements
show a concrete problem. Record routine adjustments and their checks in that PR;
no additional ADR ceremony is required.

## Validation and boundaries

Select and lock compatible versions when an implementation task needs them. Test
content shape, publication exclusion, hydration, deterministic model behaviour,
accessibility and production output within that task. A separate approved spike
is not a prerequisite for contracts, design, audit or implementation.

Existing issues remain planning tasks unless the owner assigns implementation.
Case III remains the first slice; its source audit, evidence and integration scope
still matter. Delivery details remain in [deployment](../deployment.md); no server,
registry, hosting or deployment changes are authorised by this note.

## History

The original proposal and assessment required separate candidate/spike/final-stack
approvals. On 22 October 2026 the sole owner requested a lighter process. Those
procedural gates are superseded by the [solo workflow](../development.md).
No spike has been run and aviation validation requirements have not changed.
