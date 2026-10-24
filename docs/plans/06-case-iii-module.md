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
| Optical landing cue (ball) | §102 p. 1-11 |
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

## Source-access remediation after live SME review

The live reviewer reached P-816 after the allowlist correction, but its fetcher
returned compressed PDF streams. Selected readable source passages, original
locators, PDF identity/hash and extraction provenance are now in
[the P-816 evidence record](../reviews/case-iii-p816-evidence.md). This is a
small review packet, not redistribution of the manual. The reviewer must assess
the passages independently; a successful download is not passage verification.

The general Navy controller-training source NAVEDTRA 14342A, chapter 11,
p. 11-32, supports clearance fields, aircraft-type-dependent marshal fixes and
final-bearing definition. See [general source evidence](../reviews/case-iii-general-source.md).
The page retains its aircraft-agnostic conceptual structure while explicitly
attributing the Air Boss statement and bolter/waveoff handling example to their
historical training context. It does not claim a T-45C checklist applies to all
aircraft. These changes address live-review findings U1/U2 without removing the
reference module or weakening the release gate.

The source packet now includes the specific p. 2-19 fix, p. 2-25
bolter/waveoff sequence, p. 2-26 pre-platform handoff and p. 2-27 reports/ball
call passages requested by the live reviewer. General NAVEDTRA excerpts are
consolidated in that same packet for complete review coverage. The optical
cue citation is narrowed to p. 1-11 and the weather conflict to pp. 2-4/2-22.

## Revision 2 — visual and interactive module

Owner request (project thread, 24 October 2026): the module was detailed but
dry, with only the point-to-point TACAN tool. Add marshal entry techniques,
timed turns on the turn needle with an aircraft toggle, an overview with
callouts, a profile, the channels and handoffs, radio jargon, in NATOPS-style art.

Delivered as module revision 2, still Drafted:

- Figure 1, a plan-view recovery overview with twelve selectable callouts.
- A clearance decoder on the P-816 example, Figure 2 marshal stack side view
  (angels 6–14, angels + 15 DME) and a final-bearing correction calculator.
- Figure 3, BRC versus final bearing on the angled deck.
- The hold-entry practice is back (`entryPath`, AIM 5-3-8 j 3), framed as a
  general instrument technique beside P-816's join conditions (level by 10 NM
  from the stack, at the fix on 250 kt at EAT ± 10 s). It still does not assign
  entry sectors, for the reason recorded in commit 838726b.
- Timed-turn practice with a turn-and-slip indicator and heading card. Only the
  F-14 is offered (Heatblur manual: one needle width = 360° in 4 min). No F/A-18
  source was readable within the review's host and size limits; adding an
  aircraft is one `<option data-one-width>` once a source is on file.
- Figure 4, the CV-1 example profile with a position scrubber, from a new pure
  model (`approachProfile`, `profileAltitude`) with hand-derived tests.
- Figure 5, the optical landing system with ball, datum, cut, red-lens and
  waveoff states from P-816 pp. 1-11–1-13.
- A communications ladder (Red Crown → Strike → Marshal → Approach → LSO) and a
  step-through of the P-816 pp. 2-26–2-27 dialogue; radio-terms cards and quiz.

Sources added: FAA AIM 5-3-8 (entries, turn rate) and the Heatblur F-14 manual
turn-and-slip passage. New page-specific passages are in
[the revision 2 evidence record](../reviews/case-iii-visual-module-evidence.md).
Figures are original line art. Wide figures scroll sideways under 40rem rather
than shrinking below legibility.

Validation: `npm run check` and `python3 scripts/check_docs.py` pass on Node
22.23.4. A Playwright pass at 1280 px and 360 px checked layout, no page-level
horizontal scroll, no console errors, a timed turn and the profile playback.
No independent review or accessibility audit is claimed.

### Revision 2.1: entries join the inbound course

Owner feedback (24 October 2026): the entry plots ended well off the inbound
course, where a pilot expects to roll out lined up inbound, ready to start the
racetrack. The AIM text says the teardrop and parallel turns back "intercept
the inbound course", and the old model homed on the fix instead. It also flew
the entry turns at P-816's two-minute rate, twice the radius the AIM's
one-minute legs suit.

The owner asked for no deliberate simplifications: prefer a stated source,
even one the review packet cannot yet verify, over a convenient model change.
So `entryPath` now:

- flies entry turns at the AIM 5-3-8 j 8 holding rate (3°/s or 30° bank,
  whichever needs less bank; 2.52°/s at 250 kt via g·tan 30° ÷ speed), keeps
  the one-minute legs, and keeps P-816's two-minute turns for the racetrack;
- joins a course instead of homing: it turns in the hold's direction until a
  same-rate turn would roll out on the course, cutting at no more than 45°
  (the AIM gives no intercept angle; the page says 45° is the model's choice);
- lets a turn back that is too wide cross the course and correct, and reports
  by how much;
- when the entry is not lined up by the fix, flies one racetrack circuit and
  is established inbound on the next pass, as in any hold;
- for the direct entry, cuts onto the racetrack's outbound leg, because the
  entry turn is tighter than the racetrack turn.

An earlier draft of this revision lengthened the legs instead; it was
dropped at the owner's request.
