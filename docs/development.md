# Development and review workflow

Use existing agent sessions, fresh-context reviewers, Issues, PRs and Actions.
No custom coordinator or unattended merge loop is needed.

| Stage | Required action and evidence |
| --- | --- |
| Planning | Read AGENTS.md/context; select Ready issue; record scope, dependencies, acceptance criteria, checks and exclusions |
| Implementation | Fresh branch from main; small focused changes; source records and docs updated alongside work |
| Self-review | Inspect complete diff; trace each acceptance criterion; remove scope drift; check sources, security and failure states |
| Independent review | Fresh agent context or separate reviewer reads brief, diff and evidence; record revision, findings and disposition |
| Automated validation | Run relevant required checks on reviewed revision; repair failures, rerun affected checks and final full suite |
| Visual verification | Inspect rendered output when applicable; record viewports, interaction checks, screenshots and revision |
| Pull request | Open with issue links, completed checklist, evidence, limitations and pending decisions |
| Human approval | Human assesses scope, evidence and review; only explicit approval authorises merge or publication |

Reviewers must not simply repeat implementer conclusions. Give them the brief,
repository instructions, diff/revision and test commands, not an expected verdict.
They should examine omissions, incorrect assumptions, numerical cases, accessibility
and whether claims outrun evidence. Record even a no-findings review with its scope
and limitations. Fresh review can run before PR creation and its record goes in
the PR; later changes require review of the affected scope.

## Applicable checks

Now: Python documentation checks, complete-file consistency review and manual
inspection of tables and templates. Browser checks of application flows are N/A
because there is no application. Do not invent screenshots or say UX passed.
If a Markdown rendering/browser surface is available, inspect rendered documents;
otherwise record that rendering inspection is pending rather than imply it ran.

Later: lint/type/schema checks, model/reference-case and assessment tests, component
and end-to-end tests, production build and browser verification. Add commands to
README and CI in the same PR that introduces the corresponding implementation.
Assess content truth through the separate technical review gate.
UI work must exercise desktop/tablet/mobile, keyboard and relevant error states.
Model work must validate dimensional consistency, boundaries and independent cases.

## Failures and blockers

Do not suppress a check or loosen tolerances to obtain green results without
documented justification and review. Record reproducible failure, cause, fix and
rerun result. Infrastructure retries do not count as fixing a deterministic failure.
If blocked, set Blocked, identify dependency/decision, evidence, owner needed and
smallest next action. Continue independent authorised work; avoid routine questions.
Material scope, architecture or security decisions go to a human with a concrete
proposal and alternatives.

## Definition of done

Acceptance criteria met; scoped diff reviewed by implementer and independent context;
required automated and applicable visual checks passed on final revision; sources
and qualified technical review complete where required; docs/tracking updated;
no unresolved blocking findings; human approval and authorised merge confirmed.
A draft/review PR may legitimately have pending gates, but must name them. Published
content additionally needs explicit publication approval and actual release.

Progress updates state completed work, evidence, remaining work and blockers.
Issue/PR links and check results are the record; never invent completion percentages.
