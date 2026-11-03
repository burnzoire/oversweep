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
- **Independence.** Authors cannot self-validate (AGENTS.md). Run this in a thread
  that did not write the PR's content. The authoring thread asks for a review
  thread instead of reviewing its own work.
- **No GitHub posts.** Never comment on or review the PR on GitHub. The only
  GitHub write is the label at the end.

## Procedure

1. Note the PR's head SHA. Fetch it: `git fetch origin main pull/N/head:prN`.
2. Read the added lines (`git diff origin/main...prN`), not the whole site.
   For a new or rewritten module, also read its lesson model and UI code, key
   every quiz and "Check your understanding" answer yourself, and derive every
   number in a worked example independently.
3. Check each changed aviation claim against its cited source at the cited
   page or paragraph, using the checklist and severity rules in
   `.github/workflows/shared/aviation-sme-review.md` ("Review procedure",
   "Finding severity", "What blocks release readiness"). Sources:
   - PDFs Nathan uploaded are in `/mnt/project-files/uploads/hearth/` (no
     extensions; `file` and `pdftotext -l 3` identify them).
   - The evidence file's `review-sources` block lists the cited physical pages.
     `scripts/prepare_review_sources.py` builds the same packet the gate model
     read, if you need it.
   - Host quirks (faa.gov User-Agent, Wikipedia raw pages, unreachable hosts)
     are in project memory under the SME hand-review notes.
   Mark a claim unverified, not wrong, when its source can't be read.
4. Write the review to `/mnt/project-files/sme-reviews/<date>-pr-<N>.md`:
   reviewed head SHA, `Release readiness: READY|BLOCKED`, blocking findings
   (B1..) with file and source location, non-blocking findings, source coverage
   (what you read and what you could not), and untested areas (the rendered page
   can't be checked from the cloud container).
5. If there are no blockers, confirm the PR head is still the SHA you reviewed,
   then add the `sme-passed` label. The gate accepts it only if it was added
   after the current head was pushed, so any later push needs a fresh review.
   If there are blockers, do not label; give them to the authoring thread.
6. Reply to Nathan with the verdict, the blockers or "none", the most useful
   non-blocking fixes, and the review file attached.
