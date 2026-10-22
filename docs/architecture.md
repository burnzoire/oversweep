# Working technical architecture

Status: working default; the first Astro + TypeScript + React application
foundation is now implemented with locked dependencies. The Case III experience
remains source-gated and excluded from production output.
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

Use Astro with structured content, schema-validated data records and TypeScript
model packages. The implementation records locked package versions in
`package.json`/`package-lock.json`; a separate architecture spike is optional.
No backend or account system is justified yet.

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

Current boundaries: `src/content`, `src/models`, `src/components`, `src/pages`
and `src/platform`. The initial implementation uses a single React root for the
local synthetic exercise and pure model/storage modules.
See the [proposed content and experience contract](content-contracts.md) and its
example schema/records. Content metadata covers the fields in content standards,
stable IDs, cross-references, block dependencies and validation revision. Keep
facts in a single record rather than copying values into model code and prose.

## Future infrastructure

Generate search from eligible content; assess Pagefind-style static indexing versus
an in-browser index for corpus size, filters, accessibility and update behaviour.
A search backend is deferred until evidence warrants it.
Optional local progress needs schema versions, reset/export behaviour and graceful
handling of unavailable storage; no sign-in gate or cross-device guarantee.

The initial implementation locks dependencies and supplies Astro/type/schema,
model and registry tests, a static production build, and Playwright browser flows.
The project has no configured formatter/linter yet. Browser checks cover keyboard,
reduced motion, and representative desktop/tablet/mobile layouts. Assess bundle
size and render performance against measured budgets before setting thresholds.

Private PR previews require explicit access-control and hosting decisions. Treat
private repository visibility as distinct from preview visibility. Until approved,
use local verification; never enable public previews or deployment by default.

Deployment target: GitHub Actions delivering to the owner's private Windows 11
Docker server. See the [deployment proposal](deployment.md) for delivery options,
Linux-container assumptions, approval and rollback. No deployment is configured.

## Decision gates

No formal ADR acceptance is required to start an assigned task. Establish content
contracts before bulk authoring. Retain source, qualified review and numerical
evidence before validating aviation content. The first slice is the owner's Case III Tomcat prototype;
complete its audit and integration plan before importing it.

## Assessment sources

Initial documentation check: 22 October 2026. These support capability assessment,
not a measured performance claim. Recheck when framework capabilities or package
versions change.

- [Astro islands](https://docs.astro.build/en/concepts/islands/): selective interactive components.
- [Astro content collections](https://docs.astro.build/en/guides/content-collections/): structured content.
- [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports): static output and server-feature limitations.
- [Vite production build](https://vite.dev/guide/build): static application build.
