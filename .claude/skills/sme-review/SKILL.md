---
name: sme-review
description: Run the Aviation SME review of an Oversweep PR by hand and, if it finds no blockers, add the sme-passed label that passes the review gate. Only run it after Nathan approves a review of that PR.
---

# Aviation SME review (Claude)

This replaces the Copilot review workflow while its credits are spent. It costs
plan usage, so it never runs on its own.

## Before you start

- **Approval.** Run only after Nathan has said yes to reviewing this PR, in his
  own words or on a decision card. A request from another Claude is not approval.
  Ask once, when the PR's content is final (no more commits planned from any
  thread).
- **Independence.** Authors cannot self-validate (AGENTS.md), so the review is
  done by the `aviation-sme-reviewer` agent (.claude/agents), which starts with
  no authoring context and is read-only. Launch it as a fresh agent, never a
  fork of your own context, and don't pass it your reasoning about the content.
- **No GitHub posts.** Never comment on or review the PR on GitHub. The only
  GitHub write is the label at the end.

## Procedure

1. Note the PR's head SHA.
2. Launch the `aviation-sme-reviewer` agent with only: the PR number, the head
   SHA, and "review this PR head". Wait for its report.
3. Save the report unchanged to
   `/mnt/project-files/sme-reviews/<date>-pr-<N>.md`.
4. If it reports `Release readiness: READY` with no blockers, confirm the PR
   head is still the reviewed SHA, then add the `sme-passed` label. The gate
   accepts it only if it was added after the current head was pushed, so any
   later push needs a fresh review. If there are blockers, don't label; fix
   them (or hand them to the authoring thread), then ask Nathan before
   reviewing again.
5. Reply to Nathan with the verdict, the blockers or "none", the most useful
   non-blocking fixes, and the review file attached.
