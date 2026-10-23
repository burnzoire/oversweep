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
frame: x starboard, y astern in NM; headings clockwise from magnetic north. Speed
is fixed at 250 knots, no wind or drift. Negative/nonfinite time or nonfinite BRC
throws RangeError; positive time wraps at 360 seconds. This is synthetic geometry.
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

- CV NATOPS, NAVAIR 00-80T-105, 31 July 2009, §6.4.1.1 p. 6-6: six-minute
  left-hand racetrack; §6.4.4 p. 6-8: adjust pattern to depart at EAT.
  [Historical copy](https://info.publicintelligence.net/CV-NATOPS-JUL09.pdf).
  Prototype research inspected these sections; current edition/applicability and
  qualified review remain pending. No source file is redistributed.
- [Eagle Dynamics Supercarrier Operations Guide](https://www.digitalcombatsimulator.com/upload/iblock/e1b/430ooc582lpb0npynbsewan6omd5ohvs/DCS_Supercarrier_Operations_Guide_EN.pdf),
  detailed approach pp. 75–81: inherited dialogue/sequence inputs. Edition and
  exact simulator-version mapping pending.
- [Heatblur manual](https://f14.manuals.heatblur.se/): inherited F-14B system
  context. A complete numeric-limit and claim/source audit remains pending;
  280 KIAS gear / 225 KIAS flaps remain prototype exercise limits, not validated
  guidance. No qualified human review has been recorded.

Source access date for prototype research: 22 October 2026. This port does not
claim a new primary-source research audit. These are a partial source register,
not a complete claim registry. All inherited procedural/scoring claims remain
unvalidated. Synthetic dynamics, AoA/fuel/arrestment and LSO thresholds are not
performance models. Automatic hold entry, fixed circuit, amended EATs and
procedural gate tolerances are teaching simplifications. No F/A-18C is added.

## Independent numerical cases

At 250 kt, a 60-second straight leg is 250/60 = 25/6 NM. A 120-second
semicircle travels 250 × 120/3600 = 25/3 NM, so its radius is
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
 Browser/speech/keyboard/viewport checks have not been run
in this Work session: browser preview infrastructure is unavailable. Source and
VM checks are not substitutes for visual/accessibility or qualified aviation
review. A future release must obtain those checks, not infer them from CI.
