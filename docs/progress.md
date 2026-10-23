# Progress tracking

GitHub Issues are the work record. PRs and checks supply implementation evidence.
Owner assignment authorises the issue scope. Agents start after checking actual
dependencies; they update status themselves or include a proposed update in the PR.
Never block on a missing Ready field, Project, milestone object or ADR acceptance.
A private Project and milestone objects are optional conveniences for this solo repo.
No Projects or milestone mutation capability is exposed by the current connector;
board creation, actual milestone objects and repository rules remain manual setup.
The roadmap's milestone names are proposals until those objects are created.

## Work status

| Status | Meaning and transition |
| --- | --- |
| Backlog | Not started; owner assignment allows work once actual dependencies are checked |
| Ready | Optional indication that scope/dependencies are clear; no owner transition required |
| In Progress | An agent/human has started the selected scope |
| In Review | Reviewable PR exists; checks/review can still be pending |
| Blocked | Named dependency prevents next required action; record owner and next step |
| Complete | Acceptance and required review/checks met, human-approved merge confirmed |

Use a Work status field on the Project; until configured, the issue body contains
an explicit Work status and updates link evidence. Open/closed state is not enough.
Do not auto-close work through a PR unless the issue's whole scope is delivered.
Content maturity is separate and per content revision: Outlined, Researched,
Drafted, Technically Validated, Published. Engineering issues use N/A, never
Published. Definitions and validation regression rules are in content standards.

## Optional tracking and repository controls

Tracking items 1–5 are optional conveniences, not prerequisites for work. Repository
controls in 6–7 can be configured where useful and supported. An agent cannot treat
unconfigured board fields or milestone objects as a dependency.

1. If wanted, the repository owner creates a **private** Project named Oversweep, links this
   repository and restricts access to the intended collaborators.
2. Add single-select Work status with the six values above. Add Content maturity
   with the five values above; leave blank for engineering and track mixed content
   in separate items. Add Milestone, linked PR and blocked-by references as needed.
3. Add the initial issues listed below. Create M0–M3 milestones using the roadmap
   descriptions and assign issues. No artificial due dates.
4. Configure views: board by Work status, roadmap by milestone, content table by
   maturity; include blocked reasons. Optionally auto-add repository issues.
5. Automation may set In Review on linked PR creation, but must not infer technical
   validation, publication or Complete from issue closure alone.
6. Configure a main ruleset: PR required, no force pushes/deletion, required
   Foundation checks / documentation status after its first successful run,
   review required where the account/plan supports it, dismiss stale approvals.
   In a solo repository retain explicit human review evidence if self-approval is
   unavailable. Never enable auto-merge or deployment.
7. Confirm Actions can run in the private repository. CI needs contents: read
   only and no secrets. Preview hosting/access policy is a future decision.

## Feature delivery

Use one feature issue and one assigned delivery agent through research, brief plan,
implementation, tests, review and fixes. Case III is [#20](https://github.com/burnzoire/oversweep/issues/20).
Old #5–#7/PR #19 are inputs, not phase approvals or a requirement to create another
implementation ticket. Existing work remains available; this workflow change does
not close it as delivered or execute the feature.

## Initial issue register

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

Foundation PR #9 was merged by the owner on 22 October 2026. The initial statuses
above are historical; live issues are authoritative. Issue #2 is selected next
following the owner's instruction. Its [architecture assessment](plans/02-architecture-assessment.md)
now supplies the working architecture; formal ADR acceptance is no longer required.
Tracking/control setup #8 remains separate; its outstanding settings do not prevent
this documentation assessment. No application or deployment work is authorised.

## Copilot profile follow-up

[#12](https://github.com/burnzoire/oversweep/issues/12) tracks the owner's authorised
planner/implementer/reviewer scaffolding. See [profile usage](copilot-agents.md).
Profiles do not automate issue transitions or complete repository controls #8.
Review, CI and owner runtime discovery evidence are tracked in the issue/PR;
adding files does not establish live Copilot availability.

## GitHub Pages hosting change

22 October 2026: owner requested GitHub Pages instead of the Windows Docker host.
The [deployment configuration](deployment.md) replaces the mechanism assessed by
historical issue #10. A manual main-only Pages workflow is prepared; app integration
(PR #21), account entitlement, repository Pages settings, first release and DNS
remain pending. No deployment or issue completion is claimed.

## Current prototype source port

[#28](https://github.com/burnzoire/oversweep/issues/28) ports the owner-authorised
current source into one local-review experience under Naval Operations and the
Training Library. See [port evidence](plans/05-case-iii-port.md). Source access is
now available; historical #5–#7/#20 notes remain inputs, not aviation approval.
Work status and linked implementation PR are tracked in #28. Content: Drafted,
not technically validated. Normal production excludes the trainer and assets.
No merge, deployment, technical validation or publication is claimed.

## Aviation SME profile and workflow

Issue #31 implementation is in progress through the draft
[PR #33](https://github.com/burnzoire/oversweep/pull/33). Its issue still says
Backlog; issue-write access was unavailable, so the proposed status update is
In Progress. The change adds a read-only profile, one shared review standard, a
claim-level Case III demonstration, and the versioned PR workflow plus its
compiled lock file. The demonstration is scoped to PR #29 at head
`2c16d437fd1264d69f9340b4442a452707baab42`; it records the FAA search snippet
as an unverified lead, the F-14 applicability gap, inaccessible NATOPS
evidence, and independently derived conditional arithmetic. No primary-source
aviation claim is verified by this demonstration. It is not a live Agentic
Workflow run.

No `Aviation SME PR review` workflow run or summary comment has been observed.
PR #33 is draft, and the workflow is not on the default branch;
automatic draft reviews are intentionally skipped. No updated-head/comment cycle
or live source-fetch run is claimed. After the workflow is available on the
default branch, live inference needs the owner to configure `COPILOT_GITHUB_TOKEN`
as an Actions secret (fine-grained PAT with Copilot Requests: Read and active
Copilot entitlement). Organization-billed inference is an alternative requiring
the `copilot-requests: write` workflow permission instead of the PAT; this
workflow is configured for the secret path. This session cannot configure
secrets, change PR readiness, merge, or dispatch the workflow.

Checks run on this revision:

- `python3 scripts/check_docs.py` — passed (38 text files; local links checked).
- GH-AW v0.93.0 strict compile/validation and `gh-aw validate --strict` — passed
  with zero warnings; the compiled actions are pinned to
  `8df88b66116c3ead88419803ef9ced0c1a253510`.
- `npm run test:case-iii` — passed.
- `git diff --check` — passed.

The independent reviewer identified issues with default issue-producing safe
outputs, the search snippet's initial classification, and broad network defaults.
They were corrected by restricting outputs to one fixed-PR comment, removing the
`defaults` network alias, and marking the inaccessible FAA source unverified; a
fresh re-review is pending. Direct FAA, BIPM, and NIST page retrieval failed DNS
in this session, and the browser tool was unavailable. The demonstration makes
no primary-source aviation verification claim. Neither compilation nor the
manual demonstration changes content maturity or supplies qualified human
validation.
