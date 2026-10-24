# Case III recovery module — issue #46

## Plan and resulting scope

Replace the trainer-centred Manual page with an aircraft-agnostic fixed-wing
recovery module: sequence, clearance, geometry, marshal/timing, penetration,
final, communications and recovery outcomes. Keep the trainer standalone with
its own briefing and help. Its code, gates, scoring and revision are unchanged.
Retain the point-to-point interaction as an explicit educational geometry model.
Remove the synthetic hold-extension planner and exercise-specific quiz from the
reference page rather than teach their rules as recovery procedure.

The module has its own revision 1 and Drafted status; exercise revision 8 and
maturity remain separately visible at launch. Registry module metadata supplies
the Manual card. The Training Library still identifies the Tomcat exercise.

## Source register and claim map

Primary author: Naval Air Training Command. CNATRA P-816 (01-14),
*CV Procedures (UMFO), T-45C*, revision 28 January 2014, Change 1 dated
9 February 2018. Accessed 24 October 2026. The official CNATRA URL timed out;
full text was inspected through https://murphysys.com/dcs/P-816.pdf.
Historical training applicability, not current operational certification.
Original paraphrases and original geometry diagram only; no manual, extracted
page, figure or third-party media committed. Navy-authored government training
material; do not infer rights in third-party material from repository MIT licence.

| Module claims | Inspected passage |
| --- | --- |
| Purpose and recovery case selection | Weather criteria pp. 2-3–4; §204.3 pp. 2-22–25 |
| Clearance fields, reports and handoff | §204.3.d pp. 2-26–27 |
| Fix/hold, EAT and sequencing | §204.2.a pp. 2-19–20, incorporated by §204.3.a |
| Commence/profile, platform and final intercept | §204.3.b p. 2-23 |
| Optical landing cue (ball) | §102 pp. 1-10–1-13 |
| ACLS/ICLS comparison and ball transition | §204.3.b pp. 2-23–25 |
| Waveoff requirement and recovery outcomes | p. 2-17; §204.3.c pp. 2-25–26; glossary A-1 |
| BRC, final bearing | Glossary A-1 and A-3 |
| Fuel applicability | Glossary A-1, bingo fuel |
| Point-to-point plot | Original flat-plane vector calculation shown on page; no wind, horizontal range, fixed illustration map rate |

The source conflicts internally on Case III visibility minima (p. 2-4 and
glossary versus p. 2-22). Numeric weather minima remain unresolved and omitted.
Configuration and approach-speed instructions are type-specific and not
generalised. Source profile numbers are labelled as the historical example.
The source does not validate the inherited trainer dialogue, gates or scoring.

## Validation

- `npm run check`: passed, including existing tests, Astro/TypeScript, build,
  generated links and experience publication output checks.
- `python3 scripts/check_docs.py`: passed.
- `git diff --check`: passed.
- Build ran on Node 24.22.1; repository requests Node 22.23.4 within major 22.
  CI must confirm the supported runtime.
- Independent fresh-context source review checked the local primary-source text,
  profile, applicability, weather conflict and geometry. It found an incorrect
  glossary page reference; corrected BRC to A-1 and final bearing to A-3.
  It independently calculated the default track 235.0079798°, distance
  36.61966685 NM and illustrative time 527.3232 s; these agree with the UI.
  An unexpanded NATOPS acronym was replaced with plain language.
- This evidence does not advance maturity to Technically Validated. Source
  review and live PR SME gate remain distinct from engineering checks.

Browser verification was attempted with Playwright but Chromium was absent; both
browser installation attempts returned invalid download archives. No desktop,
tablet/mobile, keyboard runtime or visual browser pass is claimed. Static UX
review checked labels, section targets, no-JavaScript fallback and launch markup.
The base-path review build and checks also passed.
