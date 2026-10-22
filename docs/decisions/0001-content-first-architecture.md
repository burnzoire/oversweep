# ADR 0001: Content-first static architecture

Status: Proposed

Documentation assessment: [issue #2 report](../plans/02-architecture-assessment.md),
22 October 2026. Recommend retaining this proposal with one React root per trainer.
The report supplies a provisional contract, maintenance/test strategy and scoped
spike plan. No spike has run; human acceptance or replacement is still required.

## Context

Oversweep needs searchable reference content, structured facts and reusable
interactive experiences without accounts as an access prerequisite. The foundation
contains no application; server-side features have not been justified.

## Alternatives

Astro with selective React interactions; Next.js with React; Vite React SPA.
See the comparison in [architecture](../architecture.md).

## Proposal

Validate Astro + TypeScript, structured Markdown/MDX and schema-validated data;
use pure model functions and reusable experience contracts independent of renderer.
Do not install dependencies or configure hosting in this task. Deployment planning
uses GitHub Actions and the owner's private Windows 11 Docker server; delivery
mechanism and ingress remain proposals in [deployment](../deployment.md).

## Consequences

A static-first approach may reduce runtime needs but cross-island state, search,
MDX trust and build-time validation require deliberate design. A richer application
may warrant another option; revisit with evidence rather than preserving a preference.

## Acceptance evidence required

Scoped spike plan, official documentation checks for supported integrations,
one proposed content/experience contract, test and accessibility strategy,
dependency/maintenance assessment and human stack approval. No prototype
implementation is authorised by this ADR alone.

The first slice is selected: the owner's Case III Tomcat carrier trainer.
Open: stack acceptance, package versions, search library, delivery mechanism and ingress.
