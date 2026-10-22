# Repository Copilot agents

Three manually selected profiles implement the roles in the existing
[workflow](development.md). [AGENTS.md](../AGENTS.md) remains the shared authority
for all coding tools. Profiles reference it rather than maintaining parallel rules.

| Profile | Use | Enabled tools |
| --- | --- | --- |
| [Planner](../.github/agents/planner.agent.md) | Scope one issue and edit plans | Read/search/edit, web where supported, repository GitHub reads |
| [Implementer](../.github/agents/implementer.agent.md) | Deliver an explicitly authorised task and checks | Read/search/edit/execute, web where supported, GitHub reads, local Playwright where available |
| [Reviewer](../.github/agents/reviewer.agent.md) | Fresh independent review; return findings | Read/search, web where supported, repository GitHub reads; no edit, shell or delegation |

Profiles inherit the selected/default model. No target restriction, new MCP server,
secret, setup workflow or account setting is added. Automatic model invocation is
disabled; select a role explicitly. These are reusable role instructions, not an
automatic planning/implementation/review pipeline. Tool filters do not replace the
repository's permissions or human approval gates.

## Use and handoff

1. In GitHub's agent task UI, choose the repository and select `oversweep-planner`,
   `oversweep-implementer` or `oversweep-reviewer` from the custom-agent selection.
   In a supported IDE, select the repository profile in its agent picker. Confirm
   the selected branch contains the profile. GitHub's documented discovery path
   requires merging profiles into the default branch and refreshing its picker;
   use a local IDE checkout for pre-merge checks, not an assumed GitHub listing.
2. Give the planner the issue and desired outcome. It returns scoped criteria,
   dependencies, evidence and a plan. Routine choices are recorded in the issue/PR.
   Owner assignment supplies scope authorisation; a planner cannot expand it.
3. Assign the issue with its intended scope and checks. No manual Ready transition
   or ADR acceptance is needed. Planning tasks stay
   documentation-only. Application work needs an explicit implementation task.
4. For substantive changes, start a separate reviewer context with the issue, base/head SHA, full diff and
   check evidence. Record findings and disposition in the PR. After fixes, review
   the changed scope on the new head. A profile name alone proves no independence.
5. Record actual work status in the issue. Human approval and authorised merge
   remain the completion gate; aviation maturity is tracked separately.

Suggested task briefs:

- Planner: “Plan issue #N. Inspect dependencies and sources; return acceptance
  criteria, exclusions, checks and decisions. No application implementation.”
- Implementer: “Deliver the authorised scope of #N from current main. Follow
  AGENTS.md, run checks, request independent review and prepare a PR. Do not merge.”
- Reviewer: “Review #N at base SHA / head SHA in a fresh context. Inspect the full
  diff and evidence; return findings and limitations without changing files.”

Copilot's built-in code review is a separate PR review feature. It is not activated
by `reviewer.agent.md`; request it separately if desired. Record the reviewer and
revision actually used. No automatic review rule or repository setting is changed.

## Tool availability and verification

The GitHub cloud environment documents read-only `github/*` tools and localhost
Playwright. Its `web` alias is currently unsupported. Planner/reviewer research
that needs inaccessible external documentation must report a blocker and use a
separate authorised research session. GitHub write operations such as issue status
updates may need the owner or a write-capable session; never report them as done
without evidence. The implementer's shell can run repository checks and prepare
Git changes; its instructions continue to restrict scope and release actions.

Run `python3 scripts/check_docs.py`. It checks local links and a deliberately narrow
profile frontmatter format: single-line JSON values (valid YAML), expected fields,
role tools, manual invocation and Markdown body title. It is not GitHub's parser
and does not prove agent discovery, tool availability, behaviour or account access.

Owner runtime check: use a local IDE checkout before merge, or GitHub's picker
after an authorised merge. Confirm all three profiles appear, then run a read-only reviewer task
against a known diff and verify it returns the head and limitations without edits.
No live Copilot session has been executed as part of this change. Rendered Markdown
inspection was not performed for the original profiles. Record applicable CI/review
evidence in the linked PR; that historical limitation is not a workflow blocker.

## Official references

Checked 22 October 2026 (Australia/Melbourne). Recheck before changing supported
properties or tools; this is an assessment date, not a compatibility guarantee.

- [Profile configuration and tool aliases](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Create and select repository agents](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)
- [Copilot code review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review)
