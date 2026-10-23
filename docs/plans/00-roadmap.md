# Initial roadmap

Milestones are proposed outcomes, not dates or completion estimates.
Live issue links are maintained in [progress](../progress.md).
This roadmap is context, not task authorisation. The former issue #20 consolidated
Case III research through implementation, but it is now deleted; issue #28 / PR #29
records the delivered port. This roadmap does not authorize follow-on work.

| Milestone | Exit evidence | Initial work |
| --- | --- | --- |
| M0 — Foundation | Documentation/CI reviewed and merged by human; tracking configured or gaps explicit | Bootstrap and repository controls |
| M1 — Architecture and design | Working architecture, content contract, reviewed responsive design and delivery proposals | Architecture assessment, content schema, design, GitHub Pages delivery |
| M2 — Case III carrier trainer vertical slice | Existing prototype integrated into one sourced manual/trainer slice; technical review, model tests and browser evidence complete | One delivery issue: research, audit, plan, implement, test and review |
| M3 — Reuse and expansion | Reusable experience contract proven from Case III; next subject selected using findings | Extract reusable components and prioritise subsequent subjects |

## Selected first slice

The product owner selected the existing
[Case III Tomcat carrier trainer](https://case-three-tomcat.burnzoire.chatgpt.site/).
It was integrated within Naval Operations and indexed in the Training Library by
[#28 / PR #29](https://github.com/burnzoire/oversweep/pull/29). Its content remains
Drafted, not technically validated.

The former #20 assignment combined research, source/provenance audit, a brief
integration plan, scaffolding, implementation, tests, independent review and fixes
as internal phases; it is no longer a live issue. Reuse #5–#7 and PR #19 findings,
including the [integration plan](04-case-iii-integration-plan.md), as historical
inputs rather than approval gates. The delivered port is recorded in #28/PR #29;
do not infer aviation validation from that delivery.

The [research record](03-case-iii-research.md) predates source access; the source
export/provenance blocker was resolved for the port, as recorded in the
[port evidence](05-case-iii-port.md). Preserve unresolved procedures, limitations
and regression candidates from those records without treating them as current
source-access blockers. M2 still requires its stated technical evidence; the port
alone does not complete aviation validation. The owner merge remains the delivery
decision.

## Deployment sequencing

The original private Windows Docker proposal is historical and was superseded by
the owner's GitHub Pages request and merged PR #27. The current Pages workflow
deploys on pushes to main and supports manual dispatch; see
[deployment](../deployment.md) and the
[verified workflow evidence](../progress.md). This roadmap does not authorise
changes to hosting settings, DNS or publication.

For an assigned implementation issue, record a brief plan in the issue or PR: scope,
acceptance criteria, checks and relevant source/model evidence. A separate numbered
plan is optional when complexity warrants it. Keep deployment rollback planning
where applicable. No manual Ready transition, artificial dates or percentages.
