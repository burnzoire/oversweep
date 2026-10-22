# Initial roadmap

Milestones are proposed outcomes, not dates or completion estimates.
Live issue links are maintained in [progress](../progress.md).
No application implementation is authorised by this bootstrap PR.

| Milestone | Exit evidence | Initial work |
| --- | --- | --- |
| M0 — Foundation | Documentation/CI reviewed and merged by human; tracking configured or gaps explicit | Bootstrap and repository controls |
| M1 — Architecture and design | Accepted stack ADR, content contract, reviewed responsive design proposal | Architecture assessment, content schema, design |
| M2 — First vertical slice | One selected subject end-to-end, sourced and technically reviewed; tests and browser evidence | Slice/source selection, then separate implementation authorisation |
| M3 — Reuse and integration | Shared experience contract proven; prototype audit and integration plan accepted | Case III prototype assessment after M2 learning |

## Sequencing

M0 review can proceed now. M1 planning depends on accepted foundation; keep issues
Backlog until dependencies and scope are confirmed. Select a narrow first slice
using source availability, reviewer availability and educational value. Bullseye
or turn geometry are candidates, not decisions. Do not default to implementing
all six flagship subjects.

For each implementation issue, write an individual numbered plan only when the
work is Ready. Include acceptance criteria, source/rights risks, model reference
cases where relevant, exclusions, test/browser plan and rollback considerations.

After the first-slice plan is approved, create a separate, explicitly authorised
implementation issue using that plan's acceptance criteria. Issue #6 delivers
the plan only; M2 cannot exit until the follow-up implementation, technical review,
automated checks and browser verification are complete. No implementation issue
is pre-authorised by the bootstrap backlog.
