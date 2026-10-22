# Repository Copilot agents

Assign one feature issue to **`oversweep-implementer`**, the end-to-end delivery role.
It researches, plans briefly, implements, tests, obtains independent review and
fixes findings, then delivers one PR. [AGENTS.md](../AGENTS.md) and the
[solo workflow](development.md) remain the shared rules. No phase-by-phase owner
assignments or intermediate plan approvals are required.

| Profile | Purpose | Tools and invocation |
| --- | --- | --- |
| [Feature delivery / implementer](../.github/agents/implementer.agent.md) | Own the full feature cycle; retain existing profile name | Read/search/edit/execute, agent delegation, web where supported, GitHub reads and local Playwright; manually selected |
| [Planner](../.github/agents/planner.agent.md) | Optional bounded research/planning subtask or explicit planning-only request | Read/search/edit, web where supported and GitHub reads; model invocation allowed |
| [Reviewer](../.github/agents/reviewer.agent.md) | Optional specialist for fresh independent review | Read/search, web where supported and GitHub reads; model invocation allowed; no edit, shell or delegation |

## Start a feature

1. Choose the repository and current branch containing the profiles in a supported
   Copilot agent UI and select `oversweep-implementer`. GitHub documents discovery
   after default-branch merge/refresh; use a local IDE checkout for pre-merge checks.
   New tasks should use the updated instructions; existing PR sessions can retain
   the profile revision they started with.
2. Assign one issue with the outcome, scope and acceptance criteria. For the first
   slice use [#20](https://github.com/burnzoire/oversweep/issues/20). Historical split
   plans/audits provide reusable evidence, not separate owner-managed stages.
3. Let the delivery agent run the phases and invoke specialists where supported.
   Review the resulting PR. A genuine missing source/input may require your help;
   routine choices and readiness fields do not.

Suggested brief: “Deliver this feature end to end: research what is necessary,
plan briefly, implement, test and independently review it. Resolve routine choices,
fix findings and open one PR with evidence. Do not merge or deploy.”

The `agent` tool alias enables delegation where the runtime exposes it. Specialist
profiles allow model invocation; this enables their use without requiring a separate
owner assignment. It does not guarantee runtime support for named subagents,
force a sequence or install an orchestration service. No VS Code-only `handoffs`
property is used. If delegation is unavailable, the delivery agent supplies a review
brief and discloses the limitation for owner PR review while continuing useful work.
Self-review must never be labelled independent. No new MCP server or secret is added.

## Checks and access limits

The delivery agent passes a reviewer the issue, base/head, full diff and check
results in a fresh context, resolves findings and records their disposition. Optional
planner/reviewer profiles do not broaden feature scope. Copilot's built-in PR code
review is a separate feature; this configuration does not activate it automatically.

GitHub's cloud documentation describes read-only `github/*`, localhost Playwright,
and no cloud mapping for `web`. Missing tools/access must be reported accurately;
external-source research can need another available authorised tool or the owner's
specific missing input. Never claim those reads or issue/PR updates happened without
evidence. The delivery role has shell access for checks; specialists do not.
Profiles inherit the selected/default model. Tool filters supplement permissions;
no profile authorises merge, deployment or publication.

Run `python3 scripts/check_docs.py` for local links and the supported frontmatter
subset: single-line JSON values (valid YAML), expected fields, role tool lists and
invocation settings. These checks are not GitHub's parser or live runtime testing.
After merging, start a new delivery task to verify profile discovery and whether
its runtime exposes delegation. Report absent delegation without inventing review.
No live Copilot delegation test is claimed by this workflow-only change.

## Official references

Checked 22 October 2026. Recheck supported properties/tools when changing profiles.

- [Configuration: agent tool alias, invocation and profile versioning](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Create/select repository agents](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)
- [Copilot code review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review)
