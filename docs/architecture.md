# Working technical architecture

Status: working default; the Astro/TypeScript site scaffold and Drafted Case III
port are implemented. See [README](../README.md) for current local commands.
See [ADR 0001](decisions/0001-content-first-architecture.md).
The [issue #2 assessment](plans/02-architecture-assessment.md) records the official
documentation comparison, state/content boundaries and unexecuted local spike plan.
Use this working recommendation within assigned scope; no separate stack approval is required.
The table evaluates fit, not benchmark results or guarantees about current releases.

| Option | Fit | Tradeoff |
| --- | --- | --- |
| Astro + TypeScript + selective React components | Recommended candidate for static reference pages and isolated interactive blocks | Boundary design and shared state across islands need care |
| Next.js + React | Candidate if server features or application-wide state become central | Static export is possible; server features introduce optional runtime complexity |
| Vite + React SPA | Simple cohesive interactive application | Requires separate decisions for prerendered content and search indexing |

Recommend validating Astro with structured Markdown/MDX lessons, schema-validated
data records and TypeScript model packages. Confirm against official framework
documentation and implementation checks when needed; no versions are selected
here. A separate architecture spike is optional. No backend or account system is justified yet.

## Separation and contracts

- Content: declarative metadata, sourced prose and structured encyclopedia records.
  MDX may compose trusted reviewed blocks; do not execute untrusted contributed MDX.
- Models: pure deterministic functions, explicit units/frames, no DOM, storage,
  framework or renderer dependencies. Own equations and independently derived fixtures.
- Presentation: accessible document layouts and reusable SVG diagrams; Canvas for
  dense/dynamic scenes, WebGL only after demonstrated need and device testing.
- Experience layer: shared scenario state, seeded inputs, assessment rules and
  feedback independent of rendering. Reference pages can embed the same experience
  that the Training Library indexes by ID.
- Platform adapters: search index, optional versioned local progress storage and
  future analytics; adapters must not become prerequisites for reading.

Proposed future paths: src/content, src/models, src/components, src/experiences
and src/platform. These are boundaries to validate, not directories to create now.
See the [proposed content and experience contract](content-contracts.md) and its
example schema/records. Content metadata covers the fields in content standards,
stable IDs, cross-references, block dependencies and validation revision. Keep
facts in a single record rather than copying values into model code and prose.

Cross-references follow the same rule. A module page links a key word or an
aircraft, weapon or threat system with `<Term>` (src/components/Term.astro): the
link and its hover preview are built from the glossary or encyclopedia record, so
a definition is written once. Link a word's first mention on a page only;
`check_encyclopedia` fails a page that links one entry twice or links a missing
entry, and the build fails on a `<Term>` id with no record. A module's terms list
is `<GlossaryList>` (src/components/GlossaryList.astro): each row's definition is
read from the glossary and its word links to the entry, so add a missing term to
the Terminology content rather than writing its meaning on the page.

## Future infrastructure

Generate search from eligible content; assess Pagefind-style static indexing versus
an in-browser index for corpus size, filters, accessibility and update behaviour.
A search backend is deferred until evidence warrants it.
Optional local progress needs schema versions, reset/export behaviour and graceful
handling of unavailable storage; no sign-in gate or cross-device guarantee.

The application now has locked dependencies, foundation/application checks and a
production build. Extend relevant checks with future content schemas, model
reference cases, component behavior and browser flows. Check keyboard, reduced
motion and representative desktop/tablet/mobile layouts. Assess bundle size and
render performance against measured budgets before setting numerical thresholds.

Private PR previews require explicit access-control and hosting decisions. Treat
private repository visibility as distinct from preview visibility. Until approved,
use local verification and do not enable public previews. Preserve the existing
owner-authorised production Pages deployment; do not create another deploy target
without explicit approval.

Deployment target: static GitHub Pages via GitHub Actions, replacing the private
Windows Docker server proposal. The workflow deploys production output on pushes to
main and supports manual dispatch; both application and documentation checks run
before deployment. The latest observed main deployment succeeded, but this does not
verify live-site reachability, settings, or aviation-content maturity. See
[deployment](deployment.md) for base paths, settings and rollback.

## Decision gates

No formal ADR acceptance is required to start an assigned task. Establish content
contracts before bulk authoring. Retain source, independent SME agent review and numerical
evidence before validating aviation content. The initial Case III port is recorded
in issue #28 / PR #29; its merge does not validate the Drafted content. Future
delivery follows the scope and evidence in its assigned issue; no separate phase
issues are required.

## Assessment sources

Initial documentation check: 22 October 2026. These support capability assessment,
not a selected version or measured performance claim. Recheck during implementation.

- [Astro islands](https://docs.astro.build/en/concepts/islands/): selective interactive components.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/): structured content.
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports): static output and server-feature limitations.
- [Vite production build](https://vite.dev/guide/build): static application build.
