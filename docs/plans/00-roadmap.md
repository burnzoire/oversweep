# Initial roadmap

Milestones are proposed outcomes, not dates or completion estimates.
Live issue links are maintained in [progress](../progress.md).
No application implementation or deployment is authorised by this bootstrap PR.

| Milestone | Exit evidence | Initial work |
| --- | --- | --- |
| M0 — Foundation | Documentation/CI reviewed and merged by human; tracking configured or gaps explicit | Bootstrap and repository controls |
| M1 — Architecture and design | Working architecture, content contract, reviewed responsive design and deployment proposals | Architecture assessment, content schema, design, Windows Docker delivery plan |
| M2 — Case III carrier trainer vertical slice | Existing prototype integrated into one sourced manual/trainer slice; technical review, model tests and browser evidence complete | Prototype audit, integration plan, separately authorised implementation |
| M3 — Reuse and expansion | Reusable experience contract proven from Case III; next subject selected using findings | Extract reusable components and prioritise subsequent subjects |

## Selected first slice

The product owner selected the existing
[Case III Tomcat carrier trainer](https://case-three-tomcat.burnzoire.chatgpt.site/).
Integrate it within Naval Operations and index the same experience in the Training
Library. Do not replace this choice with a Bullseye or turn-geometry starter.

Issue #7 audits the prototype early, before #5 research/gap assessment and #6
integration planning conclude. Obtain the source/export and provenance; the hosted
URL is a reference, not a substitute for source code or proof of technical accuracy.
The [issue #5 research and scope record](03-case-iii-research.md) documents the
current access blocker, unverified source/behavior/NATOPS references, synthetic
model fixtures and remaining evidence needed. The site and candidate manual
metadata endpoints could not be retrieved from the research environment; current
behavior and exact procedure pages have not been verified.

Review applicable NATOPS editions, procedural/timing models, radio exchanges,
assessment feedback and usability. Check previously reported hold-turn timing
and debrief/log scrolling as regression candidates, not established defects in
the current prototype. Audit before deciding what to reuse or refactor.

After #6's integration plan is approved, create a separately authorised
implementation issue with its acceptance criteria. M2 requires completed
implementation, qualified technical review, automated checks and browser evidence;
planning or a source import alone does not complete it.

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
