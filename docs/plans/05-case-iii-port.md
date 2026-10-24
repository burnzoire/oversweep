# Case III source port — issue #28

Current policy: [content standards](../content-standards.md) supersede historical human aviation review requirements below.
Independent source-backed SME agent review can satisfy technical validation;
no human aviation reviewer is required. Historical review results and unresolved
source/browser evidence remain unchanged. This policy update does not validate
or publish the trainer.

Work status: tracked in issue #28. Content maturity: Drafted, not technically validated.
Owner request: port the current trainer and open an implementation PR. No merge,
release, deployment or hosting changes are included.

## Provenance and inventory

The owner commissioned and iteratively directed this prototype in the same Work
conversation. The request to port it authorises reuse of that authored code and
prose. Source: `/workspace/sites/case-three-tomcat`, commit
`bb811577fd0d260e4ba002ef325bed3063c33b2d` (22 October 2026), the revision
published at <https://case-three-tomcat.burnzoire.chatgpt.site/> at handover.
The port copies the authored HTML, CSS, JavaScript and Node VM regression tests;
no hosting credential, hosting manifest, source history or runtime data is copied.

| Component | Disposition |
| --- | --- |
| Trainer code, prose and SVG geometry | Owner-authorised source port; existing repository MIT licence applies to the contributed code |
| Images, fonts, audio files, third-party JS | None; system fonts, authored SVG and browser speech only |
| Manual/reference publications | Links and brief paraphrases only; no manual PDF, scans, tables or other source dumps imported; external publications retain their own rights |
| Browser voices | Platform-provided; availability, names and audio output vary; no voice files downloaded or bundled |
| Astro/framework dependencies | Existing locked project dependencies retained; Node types added for build-time asset endpoint |

Prior plans #5–#7/#20 were written without source access. Their source-export
blocker is resolved for this port, not their aviation-validation requirements.
This note supplements those historical findings; it does not retroactively claim
those audits or content gates complete.

## Port boundary

One registration, `experience.case-iii-tomcat`, owns the Manual route
`manual/naval-operations/case-iii/` and Training Library card. The experience is
local to this repository: no iframe or runtime request to the original Site.
The iframe loads the repository's own static trainer and isolates its legacy
IDs/global styles. Relative assets work with GitHub Pages project base paths.
The parent validates message origin/source before applying height updates; the
child reports content height in embedded mode, while the direct view retains
its original responsive layout. Radio history is a named keyboard-focusable log.

Preserving the working DOM simulator avoids a high-risk React rewrite during the
port. This is an explicit migration tradeoff against the proposed single React
root: Astro shell and one isolated vanilla trainer are used instead. Further
separation of scenario state, assessment and declarative claims is future work,
not a claim that this legacy source fully implements the proposed contracts.

The deterministic hold model is extracted into `model.cjs`, usable both by the
browser and Node. It receives explicit elapsed seconds and magnetic BRC. Carrier
frame: x starboard, y astern in NM; headings clockwise from magnetic north. Its
fixed synthetic path rate is 250 NM/hour, separate from the displayed KIAS command;
it is not an aircraft-groundspeed or hold-performance model. There is no wind or
drift. Negative/nonfinite time or nonfinite BRC throws RangeError; positive time
wraps at 360 seconds. This is synthetic geometry.
Outside the hold, the simulated KIAS value is also used as NM/hour for position;
that is not groundspeed. The status labels now state this simplification.
The rest of the simulation retains random inputs, browser timing and scoring;
full deterministic replay/state contracts are not delivered by this port.

## Behaviour inventory retained

| Area | Preserved behaviour and regression evidence |
| --- | --- |
| Brief/reset | Popup at load/new sortie, Start Exercise before hints; voice on by default; no brief in log/audio; confirmation for active reset |
| Pilot controls | Heading/speed/target altitude/vertical-rate commands, drag/step/type, immediate available gear/flaps/hook/DLC/on-speed, fuel readout |
| Navigation | Random BRC/arrival, representative TACAN, optional point-to-point sketch/reveal, rotated tactical/profile/final deck views |
| Procedure flow | Marshal/read back/fix/hold/EAT/commencing/penetration/platform/final/ball/trap or waveoff; 1× default and auto-resume; decision pauses |
| Instructor off | No coach speech, hints, action borders or procedural overlays; physical progress independent of coaching happy path |
| Audio | Display/spoken phrase variants; Google role preferences and excluded novelty voices; animated actual-speaking card |
| Recovery/review | Centreline capture/LSO deviation calls, simulated three-wire arrestment/rollout, stable debrief DOM and radio-log scroll position |

The VM suite checks state transitions and SVG strings, not rendered browser
layout, actual speech output or real-world aviation correctness.

## Aviation evidence and unresolved claims

- CV NATOPS, NAVAIR 00-80T-105, 31 July 2009, §§6.4.1.1 p. 6-6 and 6.4.4
  p. 6-8 are historical source leads for the six-minute racetrack/EAT claims.
  [Historical copy](https://info.publicintelligence.net/CV-NATOPS-JUL09.pdf).
  The cited passages, current edition/applicability and claim mapping have not
  been verified for this release-readiness review. No source file is redistributed.
- [Eagle Dynamics Supercarrier Operations Guide](https://www.digitalcombatsimulator.com/upload/iblock/e1b/430ooc582lpb0npynbsewan6omd5ohvs/DCS_Supercarrier_Operations_Guide_EN.pdf),
  pp. 75–81 are a possible DCS-specific dialogue/sequence lead; the pages,
  edition and exact simulator-version mapping have not been verified.
- [Heatblur F-14 manual](https://f14.manuals.heatblur.se/): the revision-3
  review inspected the [Airspeed/AoA indicator passages](https://github.com/Heatblur-Simulations/f-14-manual/blob/49bbd9a144c32033bd3b3d98f04b113c58f22fa0/src/f14bu/cockpit/pilot/left_instrument_panel.md),
  [CASE I landing section](https://github.com/Heatblur-Simulations/f-14-manual/blob/49bbd9a144c32033bd3b3d98f04b113c58f22fa0/src/f14bu/procedures/landing_procedures.md)
  and [flap caution table](https://github.com/Heatblur-Simulations/f-14-manual/blob/49bbd9a144c32033bd3b3d98f04b113c58f22fa0/src/f14bu/cockpit/pilot/right_console.md)
  at repository commit `49bbd9a144c32033bd3b3d98f04b113c58f22fa0`. These provide
  limited DCS F-14 system and CASE I context, not Case III procedure or validation
  of the 135 KIAS, 280 KIAS gear, or 225 KIAS flap exercise gates. The 225-knot
  caution is not an extension limit; module-version mapping remains unverified.
  Source-backed technical validation remains incomplete.

Prototype source access date: 22 October 2026. The original port did not claim a
primary-source audit. This remains a partial source register, not a complete
claim registry. All inherited procedural/scoring claims remain unvalidated.
Synthetic dynamics, AoA/fuel/arrestment and LSO thresholds are not performance
models. Automatic hold entry, fixed circuit, amended EATs and procedural gate
tolerances are teaching simplifications. No F/A-18C is added.

## Independent numerical cases

At the fixed synthetic rate of 250 NM/hour, a 60-second straight leg is
250 × 60/3600 = 25/6 NM. A 120-second semicircle travels
250 × 120/3600 = 25/3 NM, so its radius is
(25/3)/pi = 25/(3pi) NM. Each 60 seconds in a turn sweeps 90°.
With R = 25/(3pi), L = 25/6 and BRC 000°:

| Seconds | x (NM) | y (NM) | Magnetic heading |
| ---: | ---: | ---: | ---: |
| 0 | 0 | 21 | 000° |
| 60 | -R | 21-R | 270° |
| 120 | -2R | 21 | 180° |
| 180 | -2R | 21+L | 180° |
| 240 | -R | 21+L+R | 090° |
| 300 | 0 | 21+L | 000° |
| 360 | 0 | 21 | 000° |

Tests use these separately expressed expectations, absolute tolerance 1e-10 NM
for trigonometric roundoff, exact headings, BRC rotation, period wrapping and
invalid-input rejection. They verify implemented geometry, not a validated
carrier procedure. Independent coding reviewer checked the arithmetic/formulas.

## Publication and local review

Normal `npm run build` excludes the trainer route, index cards and every trainer
asset. Source lives outside `public/`. Development mode includes it for local
review; `OVERSWEEP_REVIEW_TRAINERS=1 npm run check:review` generates an explicit
review-only build at `/oversweep/`. Never deploy that output as validated content.
The ordinary Pages workflow does not set the flag; Pages deployment workflow and hosting settings
are unchanged. Technical validation, accessibility review and explicit owner
release approval remain required before changing production eligibility.

## Verification record

Validation on Node.js 22.23.4:

- `npm run check`: model and inherited sortie regressions, Astro/type checks,
  production build and generated-site checks passed.
- `OVERSWEEP_REVIEW_TRAINERS=1 npm run check:review`: explicit draft route/assets,
  canonical Manual/Library links and `/oversweep/` base-path checks passed.
- `python3 scripts/check_docs.py`: passed (30 text files).
- Independent fresh-context coding review: model derivation/source comparison
  and regression tests passed; findings corrected (standalone draft notice,
  output-exclusion assertions). Re-review reported no
  remaining actionable code defects. This does not certify aviation accuracy.
- Follow-up development-route regression: reproduced the iframe 404 missed by
  generated-output checks. The trainer HTML is now an Astro page; script/style
  endpoints have explicit file extensions. `npm run check:dev` starts Astro via
  its API and requests the real wrapper/frame/four assets at `/` and `/oversweep/`,
  checks HTTP status and MIME types, and rejects unknown assets. This passes;
  it is HTTP integration coverage, not browser execution or visual QA.
- Application CI adds development HTTP and review-build checks. No Pages
  deployment change.
 Browser/speech/keyboard/viewport checks had not been run in the original port
 session. Source and VM checks are not substitutes for visual/accessibility or
 qualified aviation review. A future release must obtain those checks, not infer
 them from CI.

## Issue #35 independent audit

The `oversweep-aviation-sme-reviewer` was invoked against baseline HEAD
`c0fc75bb8778ca739be4c7f69c70ce416ae19d36` (base
`91025066e3598826062a2af092583526440dbb28`; session
`case3-sme-audit`; 23 October 2026). The review covered this note, the wrapper,
trainer/model, metadata and tests. The reviewer independently checked the
synthetic hold arithmetic, but verified no real-world procedure, aircraft limit,
radio call or scoring criterion against an accessible applicable primary-source
passage.

The review identified unresolved evidence/applicability gaps in Case III
procedure and dialogue; F-14B gear/flap and on-speed statements; assessment and
gate tolerances; KIAS versus synthetic path-rate units; and FAA/DCS source
applicability for spoken radio formatting. No factual contradiction was
established. This follow-up identifies the 280/225 KIAS values as trainer gates,
states that exercise checks are not a proficiency score, separates the synthetic
250 NM/hour path rate from displayed KIAS, and classifies dialogue/TTS as
unverified exercise content. These edits do not supply the missing source
passages or advance content maturity.

Independent code review session `case3-code-review` on HEAD
`e0af1e7b964ae2cf08c6ca533094eb9bf16ba7fe` found a P2 ambiguity: the live
speed readout was called AIRSPEED although its numeric value also drives the
synthetic position rate. The follow-up labels it `SIM SPEED` / `KIAS*` and
explains the outside-hold KIAS-to-NM/hour approximation. The scenario math and
values are unchanged. Per [content revision rules](../content-contracts.md), the
experience metadata advances from revision 1 to revision 2.

Fresh code review of the full diff at
`b78867cd9d86e0f68b34a41df25d031eb104fde8` found no actionable code findings;
tests were not run by that reviewer. A fresh aviation SME review of revision 2
at the same HEAD independently checked the synthetic hold geometry and confirmed
that no operational claim was verified against an accessible applicable
primary-source passage. It found no factual contradiction, but noted that the
command still said `AIRSPEED / KIAS` while telemetry said `SIM SPEED / KIAS*`,
and asked for a readily visible explanation of the asterisk. The command label
and nearby note are now aligned; the content revision advances to 3, so review
evidence for revision 2 does not validate revision 3. The trainer remains
Drafted.

Fresh aviation SME review of revision 3 at HEAD
`ad315f712e2b7d615c009a5863e4d3c939a3fd1c` independently checked the synthetic
hold math and found no factual contradiction. It inspected exact Heatblur manual
passages at commit `49bbd9a144c32033bd3b3d98f04b113c58f22fa0`: the
Airspeed/AoA indicator pages, CASE I landing section and flap caution table.
Those passages support only limited simulator-specific context; the flap caution
does not establish an extension limit. The review reported medium unresolved
procedure/numeric-gate and phraseology/assessment evidence findings, plus a low
terminology finding for “airspeed” and unstarred “KIAS” in the Manual and
instructor prompts. No operational claim was verified against an applicable
Navy or DCS passage. The Manual introduction and coached copy now use simulated
speed terminology; revision 4 supersedes revision 3, and revision-3 review
evidence does not validate revision 4.

Fresh code review at revision 3 found no actionable code findings and did not
run tests. Foundation run `39896936496` and Application run `39896936533`
passed at that SHA (attempt 2); the revision-3 aviation SME workflow run
`39896936359` ended `action_required` with zero jobs. The parallel validation
tool could not start its review model and CodeQL analysis in this environment.

Direct retrieval of the cited CV NATOPS and DCS Supercarrier Guide failed DNS in
this session; exact applicable passages and edition/module mappings remain
unverified. The custom UX reviewer could not access its browser MCP at revision
3 (`MCPOAuthBrowserRequiredError`); local Chromium checks are not independent UX
approval. A prior revision-2 SME workflow run `39895597649` also ended
`action_required`; run `39891533760` failed with HTTP 401 / `catalog_unavailable`.
Neither source retrieval nor browser failure proves those resources are
unavailable elsewhere. Source-backed validation and independent browser review
remain outstanding; revision 4 remains Drafted and excluded from production.

### Issue #35 fresh aviation SME review

The `oversweep-aviation-sme-reviewer` reviewed revision 4 at HEAD
`8f2c457a0195cead9f5e0f22f0445fbf30b8edfa` (base
`975714384117a179db40c0e7291d5aaaf089f1f9`; fresh session
`case3-sme-audit`; 23 October 2026). It inspected the trainer, wrapper, model,
tests, metadata and this plan. The reviewer independently reproduced the
synthetic hold calculations, but verified no operational procedure, aircraft
limit, radio call or assessment criterion against an accessible applicable
primary-source passage. CV NATOPS §§6.4.1.1/6.4.4, DCS Supercarrier Operations
Guide pp. 75–81 and the cited Heatblur manual files were not retrievable in that
review; their edition, passage and applicability evidence remain unresolved.

Findings: medium unresolved evidence/applicability for procedure/dialogue and
numeric gates/aircraft applicability/assessment; low clarity issue because
“NIGHT RECOVERY” implied unmodeled night conditions; no factual defect was
established. The low finding is corrected in revision 5 by labeling this
“NIGHT THEME ONLY”, stating that night effects are not modeled in the trainer,
and stating in the Manual that date, lighting and visibility conditions are not
modeled. The medium findings remain unresolved; revision 4 does not validate
revision 5, and the content remains Drafted and excluded from production.

The review did not run code or tests and did not perform browser, audio,
accessibility or visual checks. Its arithmetic result establishes only the
stated synthetic geometry, not a carrier procedure or training parameter.

### Issue #35 final review and release checklist

The fresh `oversweep-aviation-sme-reviewer` re-reviewed the complete revision-5
trainer at HEAD `02662989f721c9733379c24b1a31e9bfddb9cd4d` (base
`975714384117a179db40c0e7291d5aaaf089f1f9`; 23 October 2026). The only later
change, at `3fbc19695c650cf47670b1755017d615ef042b1c`, adds a regression assertion
for ordinary Manual navigation and does not change trainer content. The reviewer
resolved the low night-theme finding and found no factual defect; the two medium
source/applicability findings remain open.

The reviewer inspected Heatblur’s F-14B manual at commit
`49bbd9a144c32033bd3b3d98f04b113c58f22fa0`: the IAS/AoA instrument passages,
CASE I landing procedures and flap-caution table. These provide limited DCS
F-14B context only. In particular, neither the AoA reference nor flap caution
validates the trainer’s synthetic 135 KIAS or 225 KIAS gates; the cited caution
is not an extension limit. The manual’s installed-module version mapping is
unverified. The reviewer located the official Eagle Dynamics Supercarrier guide
listing but did not inspect pp. 75–81. CV NATOPS §§6.4.1.1/6.4.4 and their
current applicability were not verified. No primary passage was established for
the Case III sequence, phraseology, gates or assessment criteria.

The independent arithmetic review reproduced the synthetic hold values:
250 NM/hour gives 25/6 NM for a 60-second leg, 25/3 NM over a 120-second
semicircle, radius 25/(3π) NM, and 1.5°/s turn rate. Checks of radial reciprocal,
the expressly artificial KIAS-number-to-NM/hour position rule, and the
trainer’s 3.5° glidepath were limited to internal mathematical consistency.
They establish no operational procedure, aircraft performance or training
standard. The reviewer did not execute code, tests or browser/audio checks.

Independent code review compared base `975714384117a179db40c0e7291d5aaaf089f1f9`
with HEAD `3fbc19695c650cf47670b1755017d615ef042b1c`. It found that the first
review-build test covered the Case III collapsed disclosure but did not assert
the default on other Manual pages. That finding was fixed by asserting the
ordinary Manual index retains `<details open>` in both build modes. Fresh
re-review at `3fbc19695c650cf47670b1755017d615ef042b1c` found no remaining
actionable code findings.

The exact-head UX reviewer was invoked for PR #40 at `02662989f721c9733379c24b1a31e9bfddb9cd4d`, but its browser tool failed with
`MCP request failed: Transport closed`. A direct local Playwright browser attempt
also failed because browser OAuth was required. Thus the requested desktop and
phone journeys—embedded/full-window recovery and waveoff, instructor-off,
reset, radio history, and debrief—were not independently browser-checked. HTTP
development-route checks and VM regressions are not substitutes for that review.

The automated SME workflow did execute successfully on an earlier revision:
run [39900150651](https://github.com/burnzoire/oversweep/actions/runs/39900150651),
attempt 3, reviewed head `7097a38b70c30b5d3421ecb5ef6451412c327262`; the agent,
safe-output and conclusion jobs succeeded. It does not review this PR head.
Current PR #40 runs at `02662989f721c9733379c24b1a31e9bfddb9cd4d` and
`3fbc19695c650cf47670b1755017d615ef042b1c` concluded `action_required` with zero
jobs. The workflow therefore did not review the current revision. The run did
not expose whether a credential is missing or which approval/runtime condition
prevented job execution; no credential status is claimed.

Checks run on the final code head `3fbc19695c650cf47670b1755017d615ef042b1c`
with Node 22.23.4:

- `python3 scripts/check_docs.py` — passed.
- `npm run check` — passed model/sortie tests, Astro checks, TypeScript, normal
  production build and generated-site checks.
- `npm run check:dev` — passed HTTP routes at `/` and `/oversweep/`.
- `OVERSWEEP_REVIEW_TRAINERS=1 npm run check:review` — passed review-only
  navigation, revision, asset and `/oversweep/` checks.
- `npm ci` reported zero package vulnerabilities. CodeQL was not available in
  this session; no CodeQL result is claimed.
- `git diff --check` — passed.

Release checklist:

- [x] Revision 5 identifies itself as Drafted and distinguishes trainer
  setpoints from verified procedure, aircraft limitations and proficiency.
- [x] Normal production output excludes the trainer route, library/manual
  listing and trainer assets; only the explicit local review build includes
  them. Regression checks cover both modes and the Manual navigation behavior.
- [x] Review evidence, findings, limitations and exact reviewed revisions are
  recorded above.
- [ ] Obtain applicable, lawful primary passages and complete claim-to-source
  mapping for Case III procedure, radio dialogue, numeric gates and assessment,
  or remove/bound those unsupported claims.
- [ ] Complete independent browser UX review on desktop and phone after browser
  access is available.
- [ ] Obtain a current-head automated SME workflow result; current draft-PR
  runs have no jobs.
- [ ] Owner approval for merge/publication; this task does not merge, deploy or
  publish.

**Disposition:** the two medium aviation evidence findings and the missing
browser review are release blockers. Revision 5 remains **Drafted**, excluded
from production; this PR is not a release authorization.

## Release-gate pilot — revision 6

The follow-up restores the control, telemetry, briefing and instructor wording
to `AIRSPEED` / `KIAS`, with no asterisk. The adjacent motion-model explanation
states that the airspeed number drives map movement without IAS-to-TAS conversion
or wind. Model equations, numeric gates, hold timing, dialogue and scoring are
unchanged. This addresses the owner's terminology feedback; it does not resolve
the two medium evidence findings or establish aircraft limitations.

Revision 6 requires fresh SME review. It remains Drafted and excluded until
validation is complete. The new production-inclusion check must therefore fail
on this PR, rather than allow an all-green result based on safe draft exclusion.
The PR is a non-draft review of the unfinished release, not a publication bypass.
The production-inclusion check described here was superseded in revision 7.

Local verification on Node 22.23.4: `npm run check`, `npm run check:dev`,
`OVERSWEEP_REVIEW_TRAINERS=1 npm run check:review`, ten gate unit tests,
`python3 scripts/check_docs.py` and `git diff --check` passed. The production
release command exited 1 with missing route, frame, index and asset blockers;
the review-flag command also exited 1 as required. Independent code review
identified and corrected omitted listing paths and two-dot PR comparison;
the latter has a divergent-history regression. Browser smoke verification was
attempted but Chromium was absent and the installation returned invalid ZIP
downloads. No browser, visual, speech or independent UX approval is claimed.

## Owner-approved publication — revision 7

On 2026-10-24 the owner asked for the Case III trainer to be live on the
production site. Revision 7 sets its registry entry to `published` while keeping
maturity **Drafted — not technically validated**, shown on the Manual page,
subject listing and Training Library card. This is a publication decision, not a
validation: no source locator or SME finding was resolved by it.

The revision-6 SME review blocked on `AIRSPEED` / `KIAS` labels reading as
verified values. Revision 7 keeps the owner's wording and adds the bounding the
review asked for: the always-visible note under the speed control and the sortie
brief state that every airspeed, altitude, vertical rate, DME fix and gate is a
trainer setpoint rather than a verified procedure or aircraft value, and the
scope notes name the 250 KIAS / 6,000 ft / 21 DME marshal, 4,000 then 2,000 ft/min
descent and 10 / 8 DME configuration setpoints explicitly. The gate notice now
reads KIAS, matching the other labels. Model equations and numeric values are
unchanged.

The Case III-specific release-readiness workflow and output assertions were
replaced by registry-driven checks; see
[experience publication](../development.md#experience-publication). The trainer
frame and assets moved from `/review/case-iii/` to `/experiences/case-iii/`.

## Learning module and window-only launch — issue #44

Revision 8 turns the Manual page into a guide to the trainer's Case III
exercise that covers each phase: the Marshal clearance, point-to-point TACAN navigation,
holding entries, making EAT, the penetration and platform, configuration, final
and the ball, a five-question self-check, scope and sources. Three interactive
blocks (point-to-point heading, holding-entry sector and hold planner) read
`src/lessons/case-iii/lesson-model.mjs`, a pure model with independently
derived cases in `tests/lessons/case-iii-lesson.test.mjs`. Worked examples keep
each block useful without JavaScript.

The owner asked that the trainer never be framed in its current form. The
registry entry sets `launch: "window"`: the Manual page links to the trainer in a
new window and the output checks fail on any `<iframe>`. `embed.js` and the
parent height listener are removed. `frame-guard.js` stops `app.js` starting
inside any frame and shows a link to open it in its own window instead.

New sources, accessed 24 October 2026: FAA AIM ¶5-3-8 j.3 and j.8 (holding entry
definitions and ±5° heading tolerance; the entry figure's sector sizes not inspected),
¶1-1-7 (DME is slant range) and the Pilot/Controller Glossary definition of
radial. These are FAA civil instrument-flying sources applied as general
concepts; they do not establish Case III marshal procedure. The CV NATOPS leads
remain unverified, every trainer value remains an exercise setpoint, and the
module stays **Drafted — not technically validated**.

After four SME review rounds the page is framed as a guide to the trainer's own
exercise rather than a lesson in Case III procedure, and is titled "Case III
trainer guide". It teaches what the trainer expects and three general
instrument skills; it makes no claim about real Case III procedure. The
author's unverified mapping of trainer setpoints onto the DCS Supercarrier guide
was removed: the SME workflow could not retrieve the PDF, so the guide is cited
only as an unverified DCS lead, as on `main`. The AIM text gives no entry-sector
widths, so the 110°/180°/290° boundaries the entry practice checks against are
labelled the guide's own unverified construction, and readers are pointed to the
AIM figure for the real boundaries. The hold planner and quiz Q4 are labelled a
trainer-only arithmetic model whose stretched legs exceed the FAA civil 1-minute
inbound leg. The trainer's values are unchanged. The holding-entry model has a
test built from the side of the hold the aircraft arrives from.
