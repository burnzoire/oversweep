# Case III prototype integration plan — issue #6

Historical planning input. Its separate plan approval/follow-on issue sequence is
superseded by [delivery issue #20](https://github.com/burnzoire/oversweep/issues/20)
and the [one-task workflow](../development.md). Reuse the technical findings and
checks within that delivery task; no additional implementation issue is required.
This note does not claim source audit, technical validation or tests are complete.

Status: planning proposal; no application implementation or prototype import is
authorised by this document. Snapshot: 22 October 2026. The selected subject
remains the owner's Case III Tomcat trainer; this plan does not establish
prototype behavior, source rights, procedural accuracy or technical validation.

## Inputs and readiness

Issue #2 is closed and the working content-first architecture is documented.
Issue #3 is closed and its content/experience contract is available. Issue #4 is
closed; its design system is a provisional implementation baseline, not evidence
of browser or accessibility testing. Issue #5 is closed with a partial research
record, but the trainer source/export, provenance, behavior, rights and precise
primary-source references remain unverified. Issue #7, the source and behavior
audit, is still open.

The unresolved items are implementation gates, not reasons to replace the
owner-selected subject or invent missing behavior. Before importing or reusing
anything, obtain an owner-authorised export and provenance (revision, creator,
dependencies, assets and third-party material) and establish reuse rights for
each component. Complete the audit in #7 against that revision. Obtain authorised
primary publications and map procedural claims to exact editions and
sections/pages. Identify a qualified human reviewer before content or models
can be marked Technically Validated. A public URL or an issue marked closed
does not substitute for this evidence.

## Reuse and refactoring boundary

Treat the prototype as an object of audit, not as a trusted specification.
Record its revision and map observed screens, inputs, states, outputs, feedback
and reset/replay behavior to learning objectives and sourced claims.

- Do not copy source, text, diagrams, media or dependencies until provenance
  and permission to reuse them are established. If reuse is not permitted or
  cannot be established, implement only independently authored behavior from
  verified requirements; do not reproduce protected expression.
- Reuse a component or asset only when its origin, licence/permission,
  dependencies and compatibility are recorded and reviewed. Otherwise replace
  it with an independently implemented component. Do not preserve unexplained
  discrepancies merely to match the prototype.
- Keep one complete trainer in one React root, including controls, scenario
  display and debrief. Put deterministic scenario/model and assessment rules
  in framework-independent modules; keep DOM, rendering, timers and optional
  persistence in presentation/adapters.
- Keep source-backed prose and claims in content records, not duplicated in UI
  logic. The browser experience must not be a second source of procedural facts
  or scoring rules.

These are proposed boundaries for a separately authorised implementation.
Candidate `src/` paths in the architecture are not created by this planning task.

## Manual and Training Library integration

Create one canonical experience registration and reference it from the Naval
Operations manual entry and the Training Library index. The latter is an index
of the same experience ID, not a second scenario, assessment, or implementation.
The contract's registry-wide validator will need to confirm both-direction
manual/experience links and exclude ineligible records from routes, search,
manifests and emitted assets.

Use the existing contract fields: stable IDs; objective; prerequisites;
applicability; revision and experience/model versions; input schema; claim and
source links; maturity and review/publication evidence. A likely starting
relationship is `subject.naval-operations` → a `manual.*` entry with a trainer
block → one `experience.*` record. These are ID-shape examples, not reserved IDs
or content records.

The entry should explain the experience objective, applicability, assumptions,
limitations and relevant references before its controls. Keep the reference
explanation useful without JavaScript; present results and debrief after the
scenario. Until the source and research gaps are resolved, new Case III claims
remain unresolved or Drafted, and the experience and its assets remain excluded
from publication.

## Scenario and assessment contracts

Before implementation, inventory the exported revision and turn that observed
behavior into a versioned, serializable scenario contract. Confirm intended
learner, objective, prerequisites, applicability (aircraft variant/configuration
and simulator/module/version where relevant), scenario phases, learner inputs,
state transitions, cues, timing and end conditions. Label teaching
simplifications and keep them distinct from procedures. No phase, radio call,
timing value or procedural rule is specified here because none has been verified.

The pure model should accept validated configuration and explicit seed, elapsed
time and learner input; return serializable state transitions, validation
errors and assessment results. Document units, coordinate/heading references,
sign conventions, assumptions, valid domain, singularities, precision and
failure behavior. It must not read the clock or random source, access browser
APIs, or depend on UI/framework, network or storage. Inject timing and other
platform capabilities at the presentation boundary.

Specify assessment independently of rendering: the observable response or
decision being assessed, deterministic scoring/criteria, feedback rationale,
attempt/reset semantics and debrief fields. Every result must be reproducible
from the recorded run inputs and assessment/model versions. Map each criterion
to a learning objective and evidence; do not encode unsupported procedural
judgments or make color the sole indication of result.

## Numerical fixtures and regression evidence

Use independently derived reference cases, not expected values obtained from
the implementation. Each case needs inputs, a worked derivation, units,
applicability/source location where factual, expected output and justified
absolute/relative tolerance. A reviewer should check calculations using a
separate method. Cover valid boundaries, invalid/non-finite inputs, dimensional
consistency, determinism and failure behavior.

The four `angle / rate` examples in [issue #5 research](03-case-iii-research.md)
are synthetic arithmetic only. Reuse them only if inspection confirms that
constant-rate turn-time model and its assumptions; they do not validate a hold,
marshal timeline, aircraft performance or Case III procedure. Derive replacement
fixtures independently if the actual model differs. Source-derived procedural
cases require the applicable authorised primary source and exact location.

Treat hold-turn timing and debrief/log scrolling as regression candidates, not
known defects. First record repeatable inputs, outputs and scrolling behavior on
the audited prototype revision. Compare the replacement against that baseline,
then resolve discrepancies against the learning objective and applicable
sources. Do not preserve an unsupported result just because it matches the
prototype. Verify that debrief entries remain available, in order, readable and
keyboard-accessible after long runs and at narrow viewports.

## Implementation and verification gates

The separately authorised implementation issue should include these deliverable
gates:

1. **Before reuse:** record export revision, provenance, dependency/asset
   inventory, rights dispositions and the completed #7 behavior audit.
2. **Before factual content/model implementation:** map claims to authorised
   primary sources and precise locations; settle applicability and assumptions;
   independently derive and review model fixtures. Leave unresolved claims
   visibly unresolved and out of validated guidance.
3. **Automated checks:** validate record schemas and registry references,
   including that the manual and Training Library resolve to the same experience;
   test deterministic model/assessment behavior, reference fixtures, boundaries
   and errors; test fail-closed publication exclusion for generated routes,
   search records, manifests and assets.
4. **Browser checks:** run the built site through the complete scenario, result
   and debrief flow. Cover start, pause/reset or replay where supported, input
   errors, empty/long debriefs, keyboard-only operation, focus order and
   announcements. Inspect narrow mobile (including 320 CSS px), tablet and
   desktop; check zoom/reflow, scrolling, labelled diagrams, reduced motion and
   no-JavaScript reference content. Record browser/version, viewport,
   implementation revision and observed evidence. A model test does not establish
   browser or accessibility success.
5. **Qualified technical review:** a named human with relevant Case III/NATOPS
   competence reviews the exact content and model revisions, source
   applicability, derivations, assumptions and findings. Record qualification/
   context, date, revision and disposition. Resolve findings and repeat review
   after material changes. An agent or passing CI cannot certify aviation
   accuracy.
6. **Publication:** default to excluded. Inclusion requires resolved claims,
   cleared source and asset rights, valid links, accessibility review of the
   current revision, matching qualified technical validation, explicit
   publication approval and an actual release record. Missing evidence or
   validator errors must keep all outputs excluded. Publishing is a separately
   authorised action, not an implementation default.

## Follow-on authorization and remaining decisions

After this plan is reviewed and approved, open a separate implementation issue;
do not implement under #6. It should authorize only the selected Case III slice
and use the gates above as acceptance criteria. Do not merge, deploy, publish or
configure hosting without the applicable explicit approval.

The owner/source holder must still provide the export and provenance/rights
information. Issue #7 must complete the audit; primary-source editions and
locations, applicability and a qualified reviewer remain unidentified in the
available records. The audit may change the component reuse decision, scenario
schema and model fixtures. Resolve those decisions in the implementation issue
before coding affected behavior.

## Validation and review record

- Manual self-review against issue #6 and the architecture, content contract,
  design, research and roadmap: references and scope align; this document does
  not claim source inspection, behavior observation, rights clearance, aviation
  accuracy, implementation, accessibility testing or publication.
- Documentation checker: pending; this session has no shell/command execution
  tool to run `python3 scripts/check_docs.py`.
- Whitespace check: pending; this session has no shell/command execution tool to
  run `git diff --check`.
- Independent review: not recorded. No independent reviewer is available
  through the current session tools; request fresh-context review or record
  owner review before treating the plan as approved.
- Source and technical evidence: pending the owner-authorised export, completion
  of issue #7, authorised primary-source access and qualified human review.
