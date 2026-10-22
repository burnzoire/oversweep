# Initial roadmap

Milestones are proposed outcomes, not dates or completion estimates.
Live issue links are maintained in [progress](../progress.md).
This roadmap is context, not task authorisation. The assigned issue defines scope;
[#20](https://github.com/burnzoire/oversweep/issues/20) explicitly covers Case III
research through implementation. This workflow change does not implement it.

| Milestone | Exit evidence | Initial work |
| --- | --- | --- |
| M0 — Foundation | Documentation/CI reviewed and merged by human; tracking configured or gaps explicit | Bootstrap and repository controls |
| M1 — Architecture and design | Working architecture, content contract, reviewed responsive design and deployment proposals | Architecture assessment, content schema, design, Windows Docker delivery plan |
| M2 — Case III carrier trainer vertical slice | Existing prototype integrated into one sourced manual/trainer slice; technical review, model tests and browser evidence complete | One delivery issue: research, audit, plan, implement, test and review |
| M3 — Reuse and expansion | Reusable experience contract proven from Case III; next subject selected using findings | Extract reusable components and prioritise subsequent subjects |

## Selected first slice

The product owner selected the existing
[Case III Tomcat carrier trainer](https://case-three-tomcat.burnzoire.chatgpt.site/).
Integrate it within Naval Operations and index the same experience in the Training
Library. Do not replace this choice with a Bullseye or turn-geometry starter.

[#20 — Deliver the Case III first vertical slice](https://github.com/burnzoire/oversweep/issues/20)
is the single assignment. Research, source/provenance audit, a brief integration
plan, scaffolding, implementation, tests, independent review and fixes are phases
inside that task, not separately approved prerequisites. Reuse #5–#7 and PR #19
findings where useful. An old planning-only exclusion does not override #20's
explicit implementation scope; preserve the historical records without inventing
completed audits or tests.

The [research record](03-case-iii-research.md) documents source/primary-reference
access gaps. Obtain the actual source/export and provenance before reuse. If a
required input is unavailable, identify it precisely and continue independent
work; do not fabricate behaviour, rights or procedural facts. Investigate reported
hold timing and debrief scrolling as regression candidates. Keep unvalidated
content excluded from publication and record qualified technical review when it
occurs. M2 completion still needs actual delivered behaviour and check evidence;
a plan or source import alone does not complete it. Merge/release approval remains
explicit and separate from feature implementation.

## Deployment sequencing

GitHub Actions and the owner's private Windows 11 Docker server are the planned
build/delivery setting. [Deployment proposal](../deployment.md) compares image
delivery mechanisms and approval boundaries. Complete delivery assessment in M1;
create a separate implementation issue after mechanism approval. Publishing images,
installing a runner, configuring ingress and deploying remain separately authorised
actions. A private server does not decide whether oversweep.com will be publicly
accessible or whether previews are private.

For an assigned implementation issue, record a brief plan in the issue or PR: scope,
acceptance criteria, checks and relevant source/model evidence. A separate numbered
plan is optional when complexity warrants it. Keep deployment rollback planning
where applicable. No manual Ready transition, artificial dates or percentages.
