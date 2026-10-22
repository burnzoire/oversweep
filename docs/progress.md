# Progress tracking

GitHub Issues are the work record. PRs and checks supply implementation evidence.
No Projects or milestone mutation capability is exposed by the current connector;
board creation, actual milestone objects and repository rules remain manual setup.
The roadmap's milestone names are proposals until those objects are created.

## Work status

| Status | Meaning and transition |
| --- | --- |
| Backlog | Proposed; dependencies, priority or decisions outstanding |
| Ready | Scoped acceptance criteria, dependencies and verification plan agreed |
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

## Remaining GitHub setup

1. Repository owner creates a **private** Project named Oversweep, links this
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
retains ADR 0001 as Proposed pending independent review and human stack decision.
Tracking/control setup #8 remains separate; its outstanding settings do not prevent
this documentation assessment. No application or deployment work is authorised.
