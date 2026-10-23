# Progress tracking

Current policy: [content standards](content-standards.md) supersede historical human aviation review requirements below.
Independent source-backed SME agent review can satisfy technical validation;
no human aviation reviewer is required. Historical review results and unresolved
source/browser evidence remain unchanged. This policy update does not validate
or publish the trainer.

GitHub Issues are the work record; linked PRs, checks and review reports are
delivery evidence. Projects and milestones are optional views, not prerequisites.
Do not mirror status across an issue body, labels and a Project field.

## Work status

Use issue and PR events as the status record. New issue templates do not add a
separate status field that can go stale.

| Status | Evidence and transition |
| --- | --- |
| Backlog | Open issue with no work started |
| In Progress | Open issue with work started; an open draft PR remains In Progress |
| In Review | Open, non-draft linked PR is ready for review; checks/reviews may still be pending |
| Blocked | Open issue's latest progress comment names the blocking dependency and next action |
| Complete | All issue scope and acceptance criteria are delivered, applicable checks/reviews are complete, and the owner-authorised merge is recorded |

`Ready` may remain for compatibility but is optional and never a gate. A merged
PR closes an issue only when it delivers that issue's whole scope; otherwise keep
the issue open and link the partial PR. Do not close an issue as Complete merely
because a PR was opened or merged. A cancelled/not-planned issue is not Complete.
When work is blocked, record the dependency and next action in the issue so work
can resume without a separate status field. Treat legacy `Work status` text as a
dated note, not as more authoritative than newer issue/PR events.

Content maturity is independent and per content revision: Outlined, Researched,
Drafted, Technically Validated, Published. Engineering work is N/A. CI, agent
review, issue closure, merge and deployment never establish aviation validation
or publication. See [content standards](content-standards.md).

## Verified repository state — 23 October 2026

Audit base: `main` at `72ad6cb3663110dfa6c62d6385d053c4c204a9b8`.

- The site skeleton and Case III trainer are present. Issue [#28](https://github.com/burnzoire/oversweep/issues/28) is closed and PR [#29](https://github.com/burnzoire/oversweep/pull/29) is merged; the trainer remains Drafted and is excluded from normal production output. The issue's old `In Review` body text illustrates why issue/PR events, not copied status text, are authoritative.
- The planner, implementer, reviewer and UX reviewer profile files are on main. File presence and frontmatter checks do not establish that a live Copilot picker/runtime discovers or can invoke them.
- The former Case III issue #20 now returns HTTP 410 and is not a live work item. Issue #28 / PR #29 is the current delivery evidence; old #20 references are historical only.
- Issue [#8](https://github.com/burnzoire/oversweep/issues/8) is open with a draft PR [#34](https://github.com/burnzoire/oversweep/pull/34); this is In Progress, not In Review. Its existing `Backlog` body line is stale. PR [#33](https://github.com/burnzoire/oversweep/pull/33) is open for issue [#31](https://github.com/burnzoire/oversweep/issues/31); live PR events now show it ready for review. UX profile PR [#32](https://github.com/burnzoire/oversweep/pull/32) is merged.
- Issue #30 is closed with UX profile PR #32, whose description says automated review posting was excluded, although #30's issue description required a PR-triggered workflow and demonstration. This is an unresolved closure/scope discrepancy; closure alone does not prove that acceptance was met. No open UX-specific issue for that remaining workflow scope is verified. Issue #31 remains open with PR #33 for SME work and shared setup. Do not treat #30 as active work, move its UX scope into #31, duplicate either implementation, or claim authentication/setup is complete. The owner must decide whether the #30 gap needs a follow-up.

### Checks and deployment evidence

The repository has broad PR and main-push checks without path filters:

| Workflow/job check context | Triggers | Observed evidence |
| --- | --- | --- |
| `Foundation checks / documentation` | PRs and pushes to main | Passed on main SHA `72ad6cb` ([run 39877896606](https://github.com/burnzoire/oversweep/actions/runs/39877896606)) |
| `Application checks / verify` | PRs and pushes to main | Passed on main SHA `72ad6cb` ([run 39877896768](https://github.com/burnzoire/oversweep/actions/runs/39877896768)) |
| `Deploy GitHub Pages / build`, `Deploy GitHub Pages / deploy` | Pushes to main and manual dispatch | Both jobs succeeded on main SHA `72ad6cb` ([run 39877896558](https://github.com/burnzoire/oversweep/actions/runs/39877896558)); this is not a live-site smoke test or content-validation result |

PR #34's initial check attempts required action, then attempt 2 passed on its
initial head `9c8cca4` (`Foundation checks / documentation`, [run 39878299370](https://github.com/burnzoire/oversweep/actions/runs/39878299370);
`Application checks / verify`, [run 39878299381](https://github.com/burnzoire/oversweep/actions/runs/39878299381)).
Those runs do not validate later commits to this PR. Specialist reviews remain
advisory; do not make a conditional/path-filtered review a required check unless it
reports a stable result for every PR, including inapplicable/skipped reviews. Do
not require the Pages deployment context on PRs: that workflow does not run on PR
events.

## Repository controls and owner verification

The available GitHub connector exposes issues, PRs and Actions, but not repository
rulesets/branch protection, Project configuration, Pages settings, or account
entitlement. Their current values are **unverified**. Workflow definitions alone
do not prove that a ruleset or required-check policy is enabled.

If the owner wants a main ruleset, verify and configure it in repository settings:

- [ ] Require PRs to update `main`.
- [ ] Require successful `Foundation checks / documentation` and
      `Application checks / verify` contexts, after confirming those exact
      contexts appear in the ruleset UI for PRs.
- [ ] Block force pushes and branch deletion where the repository plan supports it.
- [ ] Do not require an unattainable second human approval in this solo repository;
      retain the owner's human merge decision. AI review comments are advisory,
      not approval or qualified aviation review.
- [ ] Do not require Pages deployment checks or specialist checks until their
      trigger, skip and stable-status behaviour is verified.
- [ ] Verify Pages source, eligibility, environment policy and the deployed URL
      in Settings/Actions. A successful run confirms the workflow completed, not
      public reachability or successful application smoke tests.
- [ ] When #30/#31's workflow setup is ready, follow those issues/PRs for engine,
      authentication, permissions and any required Actions secrets. Keep secrets
      in GitHub settings, never in Git. Do not configure or claim unverified
      credentials, account access or workflow runs.

No Project, six-column board, custom status field or M0–M3 milestone objects are
required. Roadmap milestone names are proposals; do not create tracking objects
just to satisfy the historical foundation checklist.

## Feature delivery

Use one feature issue and one delivery agent through research, brief planning,
implementation, tests, independent review and fixes. Planning is an internal
phase, not an owner approval gate. See the [solo workflow](development.md).

## Historical issue register

The following is the foundation-era initial snapshot, not current status or a
setup checklist. Live issue/PR state and evidence above take precedence.

| Issue | Proposed milestone | Initial status |
| --- | --- | --- |
| [#1 — Bootstrap product and agent development foundation](https://github.com/burnzoire/oversweep/issues/1) | M0 | In Review |
| [#2 — Assess and approve the application architecture](https://github.com/burnzoire/oversweep/issues/2) | M1 | Backlog |
| [#3 — Define the content and experience contracts](https://github.com/burnzoire/oversweep/issues/3) | M1 | Backlog |
| [#4 — Review responsive manual design direction](https://github.com/burnzoire/oversweep/issues/4) | M1 | Backlog |
| [#5 — Research and scope the Case III carrier trainer slice](https://github.com/burnzoire/oversweep/issues/5) | M2 | Backlog |
| [#6 — Plan Case III prototype integration](https://github.com/burnzoire/oversweep/issues/6) | M2 | Backlog |
| [#7 — Audit the Case III prototype for the first vertical slice](https://github.com/burnzoire/oversweep/issues/7) | M2 | Backlog |
| [#8 — Configure private tracking and repository review controls](https://github.com/burnzoire/oversweep/issues/8) | M0 | Backlog |
| [#10 — Assess GHA delivery to the Windows 11 Docker server](https://github.com/burnzoire/oversweep/issues/10) | M1 | Backlog |

Foundation PR #9 merged on 22 October 2026. The initial statuses above are
historical. The private-Project/manual-deployment setup sequence is superseded.
Issue #8 now records the evidence-based workflow reconciliation described here.

## Agent profiles and discovery

Issue [#12](https://github.com/burnzoire/oversweep/issues/12) introduced the
planner/implementer/reviewer profiles. UX profile work is in #30/PR #32; SME and
agentic workflow work is tracked in #31/PR #33. See
[profile usage and discovery troubleshooting](copilot-agents.md). Merging profile
files does not establish live agent-picker discovery or workflow authentication.

## GitHub Pages and content maturity

The owner replaced the Windows Docker proposal with GitHub Pages. PR #27 merged
the push-to-main deployment trigger; `pages.yml` also supports manual dispatch.
The latest observed main deployment succeeded at SHA `72ad6cb` (run linked above).
Settings, account eligibility, deployed URL reachability and live smoke testing
remain unverified by this audit. See [deployment guidance](deployment.md).

## Current prototype source port

[#28](https://github.com/burnzoire/oversweep/issues/28) ports the owner-authorised
current source into one local-review experience under Naval Operations and the
Training Library. See [port evidence](plans/05-case-iii-port.md). Source access is
now available; historical #5–#7/#20 notes remain inputs, not aviation approval.
Work status and linked implementation PR are tracked in #28. Content: Drafted,
not technically validated. Normal production excludes the trainer and assets.
No merge, deployment, technical validation or publication is claimed.

## Aviation SME profile and workflow

Issue [#31](https://github.com/burnzoire/oversweep/issues/31) is In Review through
[PR #33](https://github.com/burnzoire/oversweep/pull/33), which is open and
non-draft. Its existing `Backlog` body text is stale; live issue/PR events are
authoritative. The change adds a read-only profile, shared review standard,
claim-level Case III demonstration, and versioned PR workflow and lock. The
demonstration is scoped to PR #29 at head
`2c16d437fd1264d69f9340b4442a452707baab42`; it records the FAA search snippet
as an unverified lead, the F-14 applicability gap, inaccessible NATOPS
evidence, and independently derived conditional arithmetic. No primary-source
aviation claim is verified by this demonstration. It is not a live Agentic
Workflow run.

No `Aviation SME PR review` workflow run or summary comment has been observed.
The workflow is not yet on the default branch, and this session has not verified
that the configured Copilot token enables live inference. No updated-head/comment
cycle or live source-fetch run is claimed. The current independent re-review
identified two remaining gaps: manual dispatch does not deterministically gate
draft PRs, and the example has no primary-source-verified supported claim.

Checks run on this revision:

- `python3 scripts/check_docs.py` — passed (38 text files; local links checked).
- GH-AW v0.93.0 strict compile/validation and `gh-aw validate --strict` — passed
  with zero warnings; the compiled actions are pinned to
  `8df88b66116c3ead88419803ef9ced0c1a253510`.
- `npm run test:case-iii` — passed.
- `git diff --check` — passed.

PR #29 delivered the Case III port and merged; its source/content remains Drafted,
not technically validated. Normal production excludes the draft trainer. The
successful Pages deployment does not change that maturity or authorize its
publication. No aviation validation or publication is claimed.

The initial independent-review findings about issue-producing safe outputs,
search-snippet classification, and broad network defaults were corrected:
outputs are restricted to one fixed-PR comment, the `defaults` network alias is
removed, and the FAA source remains explicitly unverified. Direct FAA, BIPM, and
NIST page retrieval failed DNS in this session; the browser tool was unavailable.
Neither the demonstration nor the workflow advances content maturity or supplies
qualified human validation.
