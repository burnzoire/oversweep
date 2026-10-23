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
- [Heatblur manual](https://f14.manuals.heatblur.se/): inherited F-14B system
  context. No precise numeric-limit passage was identified or verified; a
  complete claim/source audit remains pending;
  280 KIAS gear / 225 KIAS flaps remain prototype exercise limits, not validated
  guidance. No qualified human review has been recorded.

Source access date for prototype research: 22 October 2026. This port does not
claim a new primary-source research audit. These are a partial source register,
not a complete claim registry. All inherited procedural/scoring claims remain
unvalidated. Synthetic dynamics, AoA/fuel/arrestment and LSO thresholds are not
performance models. Automatic hold entry, fixed circuit, amended EATs and
procedural gate tolerances are teaching simplifications. No F/A-18C is added.

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

Direct retrieval of the cited CV NATOPS, DCS Supercarrier Guide and Heatblur
manual failed DNS in this session. The custom UX reviewer could not access its
browser MCP because it returned `MCPOAuthBrowserRequiredError`. Neither failure
is evidence that the sources or browser experience are unavailable elsewhere.
Source-backed aviation review and specialist browser review remain outstanding;
the trainer remains Drafted and excluded from production output.
