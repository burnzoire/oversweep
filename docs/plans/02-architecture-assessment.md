# Architecture assessment — issue #2

Assessed: 22 October 2026 (Australia/Melbourne). Status: recommendation awaiting
independent review and human decision. Foundation PR #9 is merged. This report
does not install packages, run a framework spike or author aviation guidance.

## Recommendation and confidence

Retain ADR 0001's Astro + TypeScript proposal, with selective React islands and
static output. Use one React root for each complete trainer, including its controls,
display and debrief. Confidence: high in documented capability fit; unproven in
this repository until a separately authorised local spike passes. No benchmark,
compatibility matrix or package-version validation has been performed.

The product is primarily a reference with embedded experiences. This is the
reason for the recommendation; it is a project judgement, not a framework ranking.
If the prototype audit reveals unavoidable application-wide state or a server
requirement, revisit the decision before importing it.

## Comparison

| Concern | Astro + React | Next.js + React static export | Vite + React SPA |
| --- | --- | --- | --- |
| Reference content | Build-time collections with schema validation and references [S2]; Markdown/MDX composition | Route HTML at build time [S5]; choose and maintain content/schema integration separately | Static bundle [S6]; choose routing, content ingestion, validation and any prerendering separately |
| Interactivity | Explicit client directives; static components otherwise [S1]; React integration [S3] | Client Components within exported routes [S5] | React application owns interactive tree; Vite supplies build tooling |
| State | Local React state inside one trainer; external store only if separate islands must coordinate [S4] | React state/context within a shared client subtree; browser persistence needs client lifecycle [S5] | One React tree makes shared state straightforward; route persistence still needs explicit policy |
| Static limits | No request-time features in proposed build; browser APIs confined to mounted client adapters | Request-dependent features and Server Actions unavailable in export [S5] | No application server supplied by static build [S6] |
| Maintenance judgement | Two component syntaxes and hydration boundaries; first-party React integration, no extra UI frameworks | More rendering/export constraints to police for this scope; useful if server requirements emerge | Fewer framework boundaries, more project-owned content/routing decisions |
| Testing proposal | Pure model tests, React component tests, explicit Astro type check and built-site browser tests | Same model/component tests plus exported-route and server-feature exclusion checks | Same model/component tests plus routing/deep-link and prerender/content checks |

All three can deliver static assets. None makes content accurate, accessible or
eligible for publication automatically. Maintenance costs above are inferred from
the proposed boundaries, not measured development effort.

## Content, state and experience boundaries

Proposed contract example for #3 to refine, not a final schema:

| Record or boundary | Required responsibility |
| --- | --- |
| Manual entry | Stable ID, subject, objective, applicability, revision, maturity, claim/source IDs and experience IDs; reviewed Markdown, optional trusted MDX |
| Experience registration | Stable ID such as `naval.case-three`, model/scenario version, supported inputs, objective, prerequisites and owning manual entry |
| Training Library | Index the same registration; no copied trainer implementation or separate assessment logic |
| Trainer input | Serializable validated scenario/configuration; no callbacks crossing the Astro hydration boundary |
| Model/session | Framework-free deterministic state transition and assessment results; injected time/seed; explicit units and input errors |
| React root | Own controls, visualisation, pause/reset and debrief together; no cross-island clock or assessment state |
| Progress adapter | Optional versioned browser storage with reset/export and failure handling; reading remains available when storage fails |

Content collections validate record shape [S2]. Oversweep must additionally check
stable-ID uniqueness, cross-links and review revision. A single eligibility policy
must filter generated routes, search data, manifests and copied assets, so excluded
drafts cannot leak through direct URLs or bundles. Private previews are a separate
access-control decision. MDX is executable trusted repository content; contributions
need code review. Detailed contracts remain #3; prototype reuse remains #7/#5/#6.

Use `client:load` for a trainer that must be ready immediately and consider
`client:visible` for optional below-fold demonstrations [S1]. Hydration timing is
not the simulation clock. Render objective, applicability and a fallback description
without JavaScript. Mount speech, timers and storage only in browser lifecycle;
stop them on unmount. Do not make voice availability essential to completing a run.

## Maintenance and dependency policy

At authorised scaffolding, select compatible stable Astro, React integration,
React, TypeScript and Node versions from their then-current requirements. Commit
one lockfile and pin the runtime/toolchain; record versions and licences. This
assessment deliberately does not claim an exact version set works. Avoid extra
state, canvas or UI libraries until a demonstrated requirement justifies them.
Review security and upgrade notices regularly; use focused upgrade PRs with the
same build, schema, model and browser gates. First-party integration is evidence
of support [S3], not a promise of future compatibility or maintenance duration.

Static output fits the proposed container serving compiled assets; it does not
verify the Windows host's Linux-container backend or startup. Delivery, private
GHCR, ingress, approval and rollback remain issue #10 and [deployment](../deployment.md).

## Local spike plan — separate authorisation required

This plan is the scoped spike evidence requested by ADR 0001, not an executed spike.
Do not import the Case III prototype or claim procedural correctness in it.

1. After provisional human candidate approval, separately authorise a disposable local branch with pinned
   packages: one reference entry, one structured record and one neutral interactive
   block using synthetic data. Link the same block from a training index.
2. Prove static reference output without JavaScript and working React hydration.
   Prove invalid metadata, broken references and ineligible publication records fail
   or are excluded as intended, including direct URLs and emitted assets.
3. Exercise deterministic reset, invalid input, storage denied/corrupt, missing
   speech and lifecycle cleanup. Verify framework-free model import and that static
   reference pages do not include trainer code unnecessarily.
4. Run proposed gates: formatting/lint, `astro check`, TypeScript/model/component
   tests, production build and Playwright against that output. Astro's TypeScript
   guide distinguishes transpilation from type checking [S8]; a build alone is
   insufficient. Its testing guide supports a layered test approach [S7].
5. Inspect mobile/tablet/desktop, keyboard/focus, zoom, reduced motion, fallback
   text and debrief scrolling. Record actual bundle sizes and timings before setting
   budgets. Compare against the same acceptance criteria if a boundary fails.

Spike failure triggers an ADR revision or alternative assessment; success does
not authorise hosting or Case III implementation. The later trainer still requires
independently derived numerical cases and qualified aviation review.

## Acceptance and open decisions

Documentation comparison, boundary example, maintenance policy and verification
plan are delivered here. Independent review, rendered Markdown inspection and
the provisional candidate decision must be recorded in the PR. Provisional approval
selects the candidate for the separately authorised spike; it is not final ADR
acceptance. ADR remains Proposed until the spike evidence required by
[architecture](../architecture.md) is available and the owner records final
acceptance or replacement. Issue #2 remains open through that decision.
Package versions and spike results are deferred; final schemas (#3), design (#4),
prototype audit (#7) and delivery mechanism (#10) remain separate dependencies.

## Official source register

All successful links below were retrieved on the assessment date. They are rolling
documentation, not a frozen version specification. No secondary sources used.

| ID | Official documentation | Capability assessed |
| --- | --- | --- |
| S1 | [Astro islands](https://docs.astro.build/en/concepts/islands/) | Static default and explicit hydration directives |
| S2 | [Content collections](https://docs.astro.build/en/guides/content-collections/) | Schema, build-time loaders and references |
| S3 | [React integration](https://docs.astro.build/en/guides/integrations-guide/react/) | Supported React rendering/hydration integration |
| S4 | [Sharing island state](https://docs.astro.build/en/recipes/sharing-state-islands/) | External shared store recipe; separate island boundaries |
| S5 | [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports) | Build output, client APIs and unsupported server features |
| S6 | [Vite production build](https://vite.dev/guide/build) | Static bundle and deployment base path |
| S7 | [Astro testing](https://docs.astro.build/en/guides/testing/) | Unit and browser test guidance |
| S8 | [Astro TypeScript](https://docs.astro.build/en/guides/typescript/) | Separate type-checking requirement |

The attempted Astro upgrade guide URL was inaccessible through the research tool;
no release-support or upgrade-cadence claim is derived from it. Recheck exact
version requirements and migration guidance when scaffolding is authorised.
