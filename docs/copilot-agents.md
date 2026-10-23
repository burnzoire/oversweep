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
| [UX reviewer](../.github/agents/ux-reviewer.agent.md) | Browser-based review of the exact PR experience; reports findings without editing | Read/search and Playwright browser tools; model invocation allowed; no edit, shell or GitHub tools |
| [Aviation SME reviewer](../.github/agents/aviation-sme-reviewer.agent.md) | Advisory, claim-level review of aviation evidence, applicability, instruction and models | Read/search, web where supported and GitHub reads; model invocation allowed; no edits or approval |

## Start a feature

1. Choose the repository and current branch containing the profiles in a supported
   Copilot agent UI and select `oversweep-implementer`. GitHub documents discovery
   after default-branch merge/refresh; use a local IDE checkout for pre-merge checks.
   New tasks should use the updated instructions; existing PR sessions can retain
   the profile revision they started with.
2. Assign one issue with the outcome, scope and acceptance criteria. The initial
   Case III port is delivered in [#28 / PR #29](https://github.com/burnzoire/oversweep/pull/29);
   use a new assigned issue for follow-on work. Historical split plans/audits provide
   reusable evidence, not separate owner-managed stages.
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

### Discovery troubleshooting

If a profile is missing, first confirm the selected repository and branch. Verify
that the file is on the repository's default branch at
`.github/agents/<role>.agent.md`, and that its name, supported frontmatter fields
and tool configuration match this repository's profile conventions. Run
`python3 scripts/check_docs.py`, then refresh/reopen the agent picker or start a new
session so it loads the default-branch revision. The check validates only the
repository's supported frontmatter subset; it cannot test GitHub discovery. Record
the UI/runtime and branch/revision actually checked. Live picker discovery remains
unverified until observed in a supported runtime.

### PR-triggered specialist workflows

The UX profile was delivered by [#30 / PR #32](https://github.com/burnzoire/oversweep/pull/32),
but #30 is closed and PR #32 explicitly excluded automated review posting. Do not
treat it as an active workflow implementation. #30's issue description did require
automated review posting and a demonstration, so its closure leaves an unresolved
scope discrepancy; no open UX-specific issue for that remaining scope is verified.
Issue [#31](https://github.com/burnzoire/oversweep/issues/31) remains open for
SME/profile and shared workflow setup; its draft PR #33 coordinates with #30 but
does not establish that the UX workflow is owned or running. The owner must decide
whether to track the #30 gap; this documentation change does not duplicate or
reassign it. Check the active implementation PR for engine support, permissions,
required secrets and account limitations before relying on automation. Do not
assume the required setup is complete. Keep credentials in GitHub Actions settings,
never in Git. Specialist comments remain advisory and must not approve, merge,
deploy, publish or advance content maturity.

Run `python3 scripts/check_docs.py` for local links and the supported frontmatter
subset: single-line JSON values (valid YAML), expected fields, role tool lists and
invocation settings. These checks are not GitHub's parser or live runtime testing.
After merging, start a new delivery task to verify profile discovery and whether
its runtime exposes delegation. Report absent delegation without inventing review.
No live Copilot delegation test is claimed by this workflow-only change.

## Aviation SME review

Use `oversweep-aviation-sme-reviewer` directly in a supported custom-agent UI,
or ask `oversweep-implementer` to delegate a fresh-context review where named
agent delegation is available. Example:

> Aviation-SME review PR #29 for issue #28 at head
> `2c16d437fd1264d69f9340b4442a452707baab42`. Review changed claims and relevant
> surrounding sources, trainer assumptions, and independent model cases. Follow
> `docs/aviation-sme-review.md`; return source locators, applicability, severity,
> suggested corrections, and unverified/untested areas. Do not edit or approve.

The [documentation entry point](aviation-sme-review.md) links to the one
canonical review standard used by the profile and imported by the
[automated workflow](../.github/workflows/aviation-sme-review.md).
The GitHub Agentic Workflow uses the Copilot engine with
`engine.agent: aviation-sme-reviewer`, a supported custom-agent invocation, and
imports the same review standard. It enables the framework's actual `web-fetch`
tool in Copilot SDK mode; the profile's cloud-agent `web` alias is not used as
the workflow's source-retrieval mechanism. The agent has only read-only GitHub
toolsets, no shell/edit access, and no checkout of the PR branch. The firewall
allows cited-source retrieval from `faa.gov`, `digitalcombatsimulator.com`,
`heatblur.se`, and `navsup.navy.mil`, plus the framework's `github` alias. In
the compiled lock, that alias expands to
`*.githubusercontent.com`, `codeload.github.com`, `docs.github.com`,
`github-cloud.githubusercontent.com`, `github-cloud.s3.amazonaws.com`,
`github.blog`, `github.com`, `github.githubassets.com`, `lfs.github.com`,
`objects.githubusercontent.com`, `patch-diff.githubusercontent.com`,
`patchdiff.githubusercontent.com`, and `raw.githubusercontent.com`. The broad
`defaults` network alias is not enabled. The workflow does not provide general
web search; absent or inaccessible evidence remains unverified. In GH-AW
v0.93.0, the Copilot SDK mode is documented as stable, native `engine.agent`
selection is supported, and `web-fetch` is available in SDK mode; this workflow
does not enable experimental dynamic workflows or web search.

The workflow runs for opened, reopened, ready-for-review and synchronized PRs
with relevant aviation/source/model paths changed; drafts are skipped. Use
**Actions → Aviation SME PR review → Run workflow** with a PR number for a
manual rerun. It reads PR files through GitHub tools without checking out or
executing the branch, uses read-only agent permissions, and writes only one
updatable summary through the restricted safe output. New PR events cancel
older in-progress reviews; every result identifies its reviewed SHA and must
re-check freshness before comment output. As the head check and comment write
cannot be atomic, a narrow race remains possible if a new commit arrives between
them; no live rapid-head test has been performed. Safe outputs are restricted
to one replaceable comment on the selected PR; issue creation, failure issues,
and missing-data/tool issue outputs are disabled. The framework's generated
activation gate skips automatic reviews of fork PRs; manually dispatch from the
Actions page to review a fork PR after the workflow is on the default branch.

The workflow definition is in `.github/workflows/aviation-sme-review.md`; its
compiled `.lock.yml` is committed beside it. The source uses
[GitHub Agentic Workflows](https://github.com/github/gh-aw) v0.93.0, installed
with `gh extension install github/gh-aw@v0.93.0` and compiled with
`gh aw compile`. There is no added provider, search API, MCP server, or repository
dependency. Each run uses GitHub Actions minutes and Copilot inference under the
repository's Copilot entitlement; actual inference charges depend on the model,
usage, and account policy.

The implementation follows the versioned framework references for [Copilot
custom agents and SDK](https://github.github.com/gh-aw/reference/engines/copilot/),
[web retrieval](https://github.github.com/gh-aw/reference/tools/#web-tools),
[safe outputs](https://github.github.com/gh-aw/reference/safe-outputs/),
[concurrency](https://github.github.com/gh-aw/reference/concurrency/), and
[authentication](https://github.github.com/gh-aw/reference/auth/).

This workflow uses personal-token authentication: live inference requires the
repository Actions secret `COPILOT_GITHUB_TOKEN`, a fine-grained user PAT with
Copilot Requests: Read and an active Copilot entitlement. The alternative
organization-billed mode uses `copilot-requests: write` instead of that secret;
do not enable both, because the permission makes the framework ignore the PAT.
Do not commit tokens. The profile and compiled workflow are not evidence of a
live review; record run URLs, reviewed SHAs, comment output, and any
credentials/runtime blocker separately. Any corrections require review again
at the new head. Independent source-backed SME review can satisfy technical
validation under the content standards; no human aviation reviewer is required.
The delivery agent owns fixes and records maturity only after all evidence gates
are met. The read-only review comment itself does not change maturity or authorize
publication.

## UX review

Invoke `oversweep-ux-reviewer` directly from a supported custom-agent UI, or ask
`oversweep-implementer` to delegate a fresh-context review when its runtime exposes
the `agent` tool. Example handoff:

> UX-review PR #29 for issue #28 at base `c5524f9ffa16bee96e013a3d9ad27f4bf904aa3c`,
> head `2c16d437fd1264d69f9340b4442a452707baab42`. Use the local site from that exact
> checkout, started with `npm ci` and `npm run dev -- --host 127.0.0.1`. Inspect Manual →
> Naval Operations → Case III, Training Library, and the embedded and full-window
> trainer. Report checked, failed and untested areas with the required evidence.

The delivery agent must check out or otherwise run the exact PR head, identify the
changed routes/journeys, and provide the diff, instructions and base/head SHAs to the
reviewer; the UX profile has no GitHub tools. On this Astro site, `npm ci` followed by
`npm run dev -- --host 127.0.0.1` serves the local review experience at
`http://127.0.0.1:4321`; port selection can change if occupied. From the exact PR
checkout, verify `git rev-parse HEAD` matches the supplied head SHA before starting
and confirm the served page in Playwright. The trainer is available in development;
production output excludes draft trainer content.
Never substitute the production site or an unverified preview for a PR-head build.
Keep the server loopback-only; if the browser runtime cannot reach it, report that
limitation instead of binding to all network interfaces.

The reviewer uses Playwright browser tools to inspect routes and interact at desktop
(1440 × 900), tablet (768 × 1024) and phone (390 × 844), including keyboard/focus
checks. Its report records the exact revision and URL, routes, journeys, dimensions,
checks performed, observed defects with severity/reproduction/impact/fix, separate
optional design suggestions, and failed or untested areas. Screenshots are included
when useful. The delivery agent owns fixes and requests re-review of affected
journeys; the reviewer must not modify or post to the PR.

Playwright is an opt-in browser capability: the profile grants `playwright/*`, while
actual tool availability depends on the selected Copilot product/runtime. This
repository does not install Playwright or configure an MCP server. The supported
Copilot cloud workflow documents localhost Playwright, but this does not guarantee
that a particular UI or delegation runtime exposes it. If unavailable, inaccessible,
or unable to reach the local server, the reviewer records that limitation and does
not claim browser verification. A source-only review is not a UX/browser review.

## Official references

Checked 22 October 2026. Recheck supported properties/tools when changing profiles.

- [Configuration: agent tool alias, invocation and profile versioning](https://docs.github.com/en/copilot/reference/custom-agents-configuration)
- [Create/select repository agents](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/create-custom-agents)
- [Copilot code review](https://docs.github.com/en/copilot/how-tos/use-copilot-agents/use-code-review)
