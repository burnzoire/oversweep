# Content and experience contracts

Status: proposed, validator-independent contract for issue #3. The schema and
records in [the examples](examples/content-contract.example.json) are fixtures,
not authored aviation content. They make no aviation claims and are excluded
from publication.

## Record model

The [JSON Schema](schemas/content-contract.schema.json) describes the shape of
these record kinds:

| Record | Purpose |
| --- | --- |
| Subject | Canonical collection/category identifier used for navigation and filtering |
| Manual entry | Page metadata, ordered reusable blocks, claims, sources and embedded experiences |
| Claim | One traceable assertion, its evidence class, applicability and source links |
| Source | Bibliographic/provenance data, lawful access and rights, and affected claims |
| Experience | Canonical registration for an interactive, exploratory or trainer block and its Training Library entry |

Records live in one registry. IDs use a lowercase, namespaced form such as
`manual.case-three-overview`; the record kind is the namespace. IDs are immutable:
renaming a title or URL does not change an ID, and retired IDs are never reused.
Every record ID must be unique across the registry. Block IDs are stable and
unique within their owning entry. References use IDs, not copied records or
display labels.

The schema checks individual record shape. A future content validator must also
check registry-wide invariants: unique record and entry-local block IDs; every
subject, claim, source, prerequisite, manual-entry and experience reference
resolves; manual-entry and experience links agree in both directions; each
source's affected-claim list agrees with claims that cite it, with a precise
source location for each mapping; every claim used by a block is linked from its
containing entry; review and accessibility revisions equal the current revision;
and every eligible record satisfies the publication policy below.
These checks are not implemented by this documentation task.

## Applicability, evidence and revision

Every claim and content entry states applicability. `general` is an evidence
claim, not a fallback for unknown scope. Aircraft scope identifies aircraft
and variant (and configuration when relevant); simulator scope identifies the
simulator/module and version. Use `synthetic` only for fixtures. Never broaden
an item's applicability by copying it to another page.

Claims point to source records at the affected section/page or other precise
location. Source records carry publisher, edition/date, lawful access location,
access date, rights and a claim-to-location mapping for each affected claim.
Unknown or restricted rights do not grant permission to reproduce a source. An
unresolved claim remains visibly unresolved and cannot enter validated guidance.

Each mutable content record has a positive integer `revision`, starting at 1.
Increment it for any material change to claims, procedure, equations,
applicability, blocks or source mapping. Review evidence records the exact
revision reviewed. It is valid only when `reviewedRevision` equals the current
revision. A material change invalidates that evidence and returns the revision
to Drafted until it is reviewed again. IDs remain stable across revisions.

## Publication exclusion

Exclusion is fail-closed: a record with no publication approval, an
`excluded` status, unresolved claims, broken references, unknown/restricted
source rights, or stale/missing validation is omitted from every published
route, search index, manifest and copied asset. A URL or direct asset request
must not bypass that policy. The schema's `publication` object records
exclusion or the required approval evidence; it does not itself enforce
registry-wide eligibility.

A future publisher must derive eligibility from the whole registry. Inclusion
requires explicit approval, accessibility review of the current revision,
Technically Validated content with matching qualified review, resolved claims
with applicable sources and cleared rights, and valid links. Marking an item
Published additionally records its actual release. Missing checks or validator
errors mean exclusion, never a warning-only build. Private preview access is a
separate hosting/security decision.

## Blocks and experience interface

Blocks are ordered, typed composition units: `reference`, `interactive`,
`exploratory`, `trainer` or `encyclopedia`. Reference and encyclopedia blocks
contain reviewed content and claim links. Interactive, exploratory and trainer
blocks point to an experience ID; they do not contain a second implementation.
The Training Library indexes that same experience record rather than copying
its scenario or assessment rules.

An experience record declares its stable ID and version, owning manual entry,
learning objective, prerequisites, applicability, serializable input schema,
model version, claims and maturity/publication evidence. Its model boundary is
renderer-independent:

- Accept validated, serializable configuration and explicit seed/time/input.
- Return deterministic state transitions, validation errors and assessment
  results; document units, frames, assumptions, limits and failure behaviour.
- Do not access the DOM, framework, clock, random source, storage, network or
  presentation components. Keep model inputs and results serializable.
- Derive numerical expectations independently before any model is called
  Technically Validated; see [content standards](content-standards.md).

The following TypeScript shape is illustrative, not an implementation. The model
receives time and inputs explicitly so callers can reproduce a run; validation
failures are values rather than presentation-specific exceptions:

```ts
type ModelResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

interface ExperienceModel<Config, Input, State, Assessment> {
  initialize(config: Config, seed: number): ModelResult<State>;
  step(state: State, input: Input, elapsedMs: number): ModelResult<State>;
  assess(state: State): ModelResult<Assessment>;
}
```

The presentation boundary consumes that contract. A single trainer view owns
its controls, visualisation, pause/reset and debrief; accessible controls and a
useful no-JavaScript description remain presentation responsibilities. Browser
timers, persistence and other platform capabilities are injected adapters, not
model dependencies. UI state must not become a second source of factual or
assessment rules.

## Scope and checks

These examples define documentation contracts only. They do not select a
framework version, implement a schema validator, create application folders,
author bulk content, validate aviation claims, or approve publication. When
content tooling is authorised, validation must cover JSON Schema shape,
registry links and publication exclusion; tests must prove ineligible records
are absent from generated routes, search data, manifests and emitted assets.
