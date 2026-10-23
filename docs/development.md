# Solo development workflow

One owner, one scoped task, one reviewable PR. Use existing agent sessions,
[Copilot profiles](copilot-agents.md), Issues and Actions; no orchestration service.

## Start without a readiness ceremony

The owner's task assignment authorises the stated scope. An agent checks actual
inputs/dependencies, writes a short plan and starts. It can move Backlog straight
to In Progress; Ready is optional. Missing labels, Project fields, milestone objects
or a separate ADR acceptance are never blockers. If tracking write access is
unavailable, record the proposed update in the PR and continue useful work.

Planning issues remain planning-only. A task to implement a feature authorises that
implementation; a task to define contracts does not. Ask about missing information
only when it changes the work materially. Do not add serial approvals for plan,
stack, spike and implementation inside an already authorised task.

## One feature, one delivery owner

Research, plan, implement, test, independently review and fix are internal phases
of one feature assignment and one PR. The delivery agent handles each phase and
may invoke optional planner/reviewer specialists when the runtime provides that
capability. No separate research, planning or implementation issue is required.
A short issue/PR plan suffices; move from it into code within the assigned scope.

Use a separate research task only when explicitly requested or the unresolved
feasibility/input prevents implementation. Report the concrete blocker and keep
unaffected work moving. Do not manufacture phase dependencies from legacy tickets.
The initial Case III port was delivered through [#28 / PR #29](https://github.com/burnzoire/oversweep/pull/29).
Historical #5–#7, deleted issue #20 and PR #19 findings are inputs, not separate
approval stages or active prerequisites.

## Decisions and checks

Make routine reversible technical decisions within scope and record the choice,
reason and significant tradeoff in the issue or PR. Existing architecture notes
provide working defaults; ADR files are optional durable notes. Consult the owner
for product-scope changes, new costs/services or material access/security choices.
Local technical experiments can be part of an authorised implementation task;
there is no separate spike approval process.

Work on a fresh branch from current main. Self-review the diff and run relevant
checks on the final revision. For this phase use `python3 scripts/check_docs.py`.
Later implementation adds lint/type/schema, model/component, production-build and
browser checks as appropriate. Record what passed and any skipped checks/reasons.
UI changes need representative desktop/tablet/mobile and keyboard verification;
model changes need independent numerical cases and boundary/error tests.

Request fresh-context agent review for substantive code, models and workflow
changes. Give the reviewer the issue, diff/revision and evidence, not a desired
verdict. Resolve findings and review material fixes. Routine documentation does
not require a separate reviewer. If fresh review is unavailable, disclose it for
the owner's PR review; do not fabricate independence or halt routine progress.
Rendered Markdown inspection is useful for layout changes; plain text instructions
do not need a separate visual approval. Disclose checks not performed.

## One owner review at the PR

The PR explains outcome, issue, decision rationale, checks and genuine remaining
risks. Keep it draft for unfinished work or actual blockers, not merely because an
optional process field or document-rendering check is missing. The owner reviews
the concrete change and approves merge. An owner-approved merge to main triggers
the existing Pages workflow; do not merge, manually dispatch, change hosting
settings or publish content without the applicable explicit approval. Engineering
deployment does not itself authorize aviation-content publication.

Content standards require applicable primary sources, independently derived model
cases and independent fresh-context aviation SME agent review for validation.
No human aviation reviewer is required. The delivery agent owns source research,
SME/UX/code review, corrections and re-review through one release-ready PR.
Content without that evidence remains unvalidated and excluded from publication.

### Case III release acceptance

Case III implementation, registration, embedded-route and index-card changes run
`Release readiness / Production inclusion` on every PR, including draft PRs.
It builds ordinary production output without the review flag. Missing routes,
assets or Manual/Training Library links, and draft/unvalidated notices, fail the
check with explicit blockers. `npm run check` can still pass because it tests
safe draft exclusion; it is not a release-readiness result.

The current Case III revision remains Drafted. A PR changing it must remain
blocked until the evidence and independent SME/UX reviews are resolved and the
validated experience is included in normal output. Do not clear the check by
deploying a review build, deleting notices alone or removing the gate. A
non-draft PR exposes this unfinished release for review; it does not authorize
publication. Unrelated PRs report this inclusion check as not applicable.

Require the `Production inclusion` check from the `Release readiness` workflow
and the existing `verify` check from `Aviation SME review gate` in the `main`
ruleset, alongside application/foundation checks. Confirm these exact job names
in GitHub's ruleset picker after their first runs. This code change does not
configure branch protection, and a red check prevents merge only when required
and not bypassed. Independent browser UX automation is still missing; this
production-output check does not supply UX or aviation approval.

The optional [aviation SME reviewer](copilot-agents.md#aviation-sme-review)
reports evidence-backed findings and unresolved sources without editing or
approving content. Re-review material corrections at the new revision. Automated
review alone does not change maturity: the delivery agent records validation
only after the content-standard evidence and independent review gates are met.

Complete means delivered scope, applicable checks and review, and authorised merge.
No estimated percentages. Record actual blockers and the smallest next action;
continue unaffected work. Do not close an issue just because a PR was opened.
