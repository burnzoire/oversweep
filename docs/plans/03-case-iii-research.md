# Case III trainer research and scope — issue #5

Current policy: [content standards](../content-standards.md) supersede historical human aviation review requirements below.
Independent source-backed SME agent review can satisfy technical validation;
no human aviation reviewer is required. Historical review results and unresolved
source/browser evidence remain unchanged. This policy update does not validate
or publish the trainer.

Research snapshot: 22 October 2026. Status: partial; source/export and behaviour
remain unverified. This is a planning record, not trainer implementation, aviation
guidance, technical validation or publication approval. The owner-selected
[Case III Tomcat trainer](https://case-three-tomcat.burnzoire.chatgpt.site/) remains
the subject; no replacement is proposed.

This is a pre-port snapshot. The source/export and provenance blocker was later
resolved for the port in [issue #28 / PR #29](https://github.com/burnzoire/oversweep/pull/29);
that does not resolve aviation validation or qualify the content for publication.

## Outcome and dependency check

Issue #3 is closed and its
[content and experience contracts](../content-contracts.md) are available. Issue #7
is still open; its required source/export and provenance are also required inputs to
complete this research. The hosted URL alone does not establish source, behaviour or
accuracy. The source access blocker is therefore real, not a reason to delay the
independent scoping work below.

On 22 October 2026, a direct request to the trainer failed DNS resolution in this
environment. Direct requests to the candidate Internet Archive metadata endpoints
also failed DNS resolution. Search returned candidate catalogue links but did not
provide source-file inspection or section/page evidence. No site interaction,
screenshots, code, export, test, creator identity or version was obtained. Do not
interpret this access failure as evidence that the owner cannot provide an export or
that the site is unavailable to its intended users.

**Next input at this snapshot:** obtain an owner-authorised source/export and
provenance record, including creator/source, export date and revision, included
assets and dependencies, applicable third-party material, and permission/rights for
reuse. This source-access blocker was resolved for the #28 port; do not treat this
historical note as a current blocker or as proof of aviation validation.

## Evidence register and source gaps

| Record | Evidence available | Unresolved before researched content |
| --- | --- | --- |
| Prototype source and provenance | Only the owner-selected URL and issue/roadmap identification | Export, creator, version/history, dependencies, asset origins, completeness and lawful reuse permission |
| Trainer behaviour | No reachable page or export; no observed controls, scenario flow, outputs or feedback | Inventory every view/input/state transition, reset/pause behavior, timing, scoring and debrief against the obtained revision |
| Intended objective | Proposed objective: practise understanding the modeled Case III carrier-recovery sequence and interpreting scenario timing/feedback | Confirm the actual scenario scope, intended learner, prerequisites, assessment and feedback from the source and owner; map every observed behavior to an objective |
| Aircraft/simulator applicability | The selected subject is a Tomcat trainer | Identify aircraft variant/configuration, simulator/module and version from the export; distinguish simulator behavior from general concepts |
| NATOPS procedure | Search surfaced candidate records for `NAVAIR 01-F14A-1` and `NAVAIR 01-F14AAP-1`; candidate catalogue records: [F-14A](https://archive.org/details/navair-01-f-14-a-1-natops-flight-manual-f-14-a) and [F-14B](https://archive.org/details/navair-01-f-14-aap-1-natops-flight-manual-f-14-b) | Candidate applicability, exact title/edition/revision/date, governing carrier-level publication, applicable sections and printed pages are unverified. No NATOPS procedure or page is cited as established evidence. Inspect authorised primary copies and map each claim to its exact location. |
| Source rights | Public search results and a public URL are not a rights grant | Confirm rights for the trainer/export and each included third-party/manual-derived item; public accessibility is not permission to reproduce |
| Technical reviewer | No qualified reviewer has been identified in the available issue or repository record | Name a human with relevant Case III/NATOPS competence and record qualification/context, reviewed revision and findings before technical validation |

OpenAI’s [ChatGPT Sites help page](https://help.openai.com/en/articles/20001339-creating-and-using-chatgpt-sites),
[responsibilities guidance](https://help.openai.com/en/articles/20001337-understanding-responsibilities-for-your-chatgpt-sites)
and [data-export guidance](https://help.openai.com/en/articles/7260999-exporting-your-chatgpt-history-and-data)
are general platform references only. They do not establish this site’s creator,
available export, contents or permissions. Search-result details and candidate
archive records were not independently verified against the underlying manual.

## Behaviour-to-objective mapping

This is a verification matrix, not an assertion that the inaccessible trainer
currently has these features.

| Objective candidate | Behavior to inventory once source is available | Acceptance evidence |
| --- | --- | --- |
| Understand the sequence represented by the selected Case III scenario | Identify each scenario phase, learner input, transition and displayed cue | Source-backed behavior inventory; each retained interaction maps to an objective and sourced claim, or is explicitly labeled as a non-procedural teaching simplification |
| Interpret scenario timing and modeled turn behavior | Record timing inputs, units, coordinate/heading conventions, outputs and edge behavior | Pure-model contract, independent numerical reference cases, boundary/error cases, and comparison with applicable primary source where a procedural claim is made |
| Use feedback to review a run | Inventory scoring, feedback, debrief data and reset/replay behavior | Assessment rules are deterministic and explainable; debrief preserves an accurate, readable account of the run |
| Find the same experience in both collections | Map the manual entry under Naval Operations to one stable experience record | A Naval Operations entry and Training Library index reference the same experience ID, objective, applicability, prerequisites and revision; neither duplicates model or assessment rules |

Do not mark an objective as met merely because a similarly named control or
display exists. Record observed behavior, learner action and feedback on the
specific exported revision.

## Model evidence and independent numerical cases

No prototype model or formula has been inspected. The following are **synthetic
arithmetic fixtures**, not NATOPS timing, aircraft performance, a Case III
procedure, or claims about the prototype. They provide an independent oracle only
if source inspection confirms a constant-angular-rate turn-time calculation. If
the prototype uses a different model, derive replacement cases independently from
that model and its applicable source before implementation; do not retrofit these
fixtures to unexplained behavior.

For a positive constant angular rate, elapsed time is
`time = swept angle / angular rate`. Degrees divided by degrees per second gives
seconds. The expected values below are calculated directly from that equation,
not from an implementation:

| Synthetic swept angle | Synthetic rate | Independently calculated elapsed time |
| ---: | ---: | ---: |
| 0° | 3°/s | 0 s |
| 90° | 3°/s | 30 s |
| 180° | 3°/s | 60 s |
| 360° | 3°/s | 120 s |

If this model is confirmed, require finite inputs, reject a zero or negative rate
and non-finite values as explicit validation errors, and preserve exact zero-angle
behavior. Compare the four expected values within 0.001 s for these exact
synthetic inputs. Test that repeated identical inputs produce identical results.
Add source-derived cases for any procedure-specific timing only after the
applicable edition, exact page/section, units, assumptions and reviewer are
recorded. A generic turn-clock fixture cannot validate a hold, marshal timeline,
aircraft performance or operational procedure.

## Regression and integration acceptance criteria

Hold-turn timing and debrief/log scrolling are **regression candidates**, not
known defects. First observe and record each behavior on the obtained prototype
revision, with repeatable inputs and expected results. Preserve behavior only
where it is supported by the reviewed objective and source; do not institutionalise
an unexplained discrepancy.

For a separately authorised implementation, the scoped slice is acceptable when:

1. The exported revision and provenance/rights disposition are recorded, and
   observed behavior is mapped to objectives and applicability.
2. Every procedural claim names its applicable primary publication edition and
   exact section/page, with units and applicability; unresolved or conflicting
   claims remain visibly unresolved and out of validated/published guidance.
3. The same stable experience record is embedded in Naval Operations and indexed
   in the Training Library, consistent with the existing
   [content contract](../content-contracts.md).
4. Model logic is deterministic and renderer-independent. Its independently
   derived expected values, worked derivations, tolerances, valid domain,
   boundaries and error behavior are reviewed separately from its implementation.
5. The hold-turn timing regression case compares repeatable prototype and
   replacement inputs/outputs, without assuming either is correct before source
   review. The debrief/log check verifies the agreed scroll behavior, keyboard
   access and that entries are not unintentionally lost, duplicated or obscured.
6. Browser evidence covers the complete scenario and debrief at representative
   viewport sizes, keyboard use, reset/replay and relevant error states. Record
   actual observations; do not infer browser or accessibility success from model
   tests.
7. A qualified human reviewer records the exact content/model revision, findings
   and disposition. No agent self-certifies aviation accuracy.

These are planning criteria, not authorization to implement, host or publish.
Reuse/refactor decisions, exact procedures, test inputs tied to operational
procedures, and final model acceptance remain open until source, provenance,
primary references and qualified review are available.

## Validation and remaining work

- Documentation check: `python3 scripts/check_docs.py` passed (26 text files;
  local file links checked).
- Whitespace check: `git diff --check` passed.
- Synthetic arithmetic: an independent Python calculation reproduced all four
  listed `angle / rate` expected values exactly.
- Scope self-review: confirmed this plan makes no claim to have observed the
  trainer or verified manual pages, rights, behavior or aviation correctness.
- Independent review: not recorded. The available session has no independent
  reviewer; issue #5's independent-review criterion remains pending for owner PR
  review or a separately documented fresh-context review.
- Blocking next step: request the owner-authorised source/export and provenance;
  then complete issue #7's audit and resolve the source, behavior, rights,
  applicability and reviewer gaps above.
- No application, trainer code, content publication, deployment or hosting change
  is included.
