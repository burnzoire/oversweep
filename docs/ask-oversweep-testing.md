# Ask Oversweep conversation testing

Engineering test record, 18 November 2026. Related work: issue #363.
This records retrieval and conversational behaviour against published site content;
it does not validate the aviation content itself.

## Scope and method

The owner authorised approximately ten change/deploy/test iterations (eleven were attempted) against the
existing Worker, using the feature branch. GitHub's connector cannot dispatch
workflows, so a temporary push trigger targeted only
`codex/ask-conversation-iterations`. That trigger is removed in the final PR.
The production Pages frontend was not deployed from this branch.

The baseline exercised the existing browser Pagefind retriever and actual Worker.
It reproduced Sochi tower retrieving history/operators sections and angle of
attack retrieving rotary-wing attack material. The F-14B engine question already
worked when given its aircraft record.

The evolving regression suite is [conversations.json](../tests/ask/conversations.json):
12 conversations, 34 turns. It includes aircraft variants/nicknames, pronouns,
elliptical questions, subject switches, comparisons, five-turn airfield context,
missing information, airfields available only in theatre tables, and simulator
scope. Expected values were read from the existing published corpus.

[scripts/test-ask-live.mjs](../scripts/test-ask-live.mjs) makes real requests to
Cloudflare Workers AI through the Worker. It records exact replies, source IDs,
HTTP status, deployed revision and elapsed time. The final run deliberately sends
a MiG-15 article ID as every search hint, testing recovery independently of
Pagefind. A separate run without hints checks the same separation. Model replies
are not mocked or replaced in these live runs or screenshots.

Keyword checks flag omissions and obvious wrong-subject answers; they are not a
semantic proof. Inspect the recorded replies and their cited content as well.
The test set expanded between iterations, so scores are not directly comparable.
The early `candidateIds` field records locally proposed retrieval; `requestedIds`
records the three IDs actually sent. Repeated history text was removed from older
logs because it can be reconstructed from each conversation's ordered replies.

## Changes

- The Worker re-searches its canonical corpus, treating browser IDs as hints.
  Each turn retrieves fresh sections of the subject rather than only old citations.
- Build extraction preserves complete sections and glossary definitions. Theatre
  airfield rows have individual existing `#af-…` anchors, names and repeated column
  labels. There are 4,006 corpus entries, including 552 simulator airfield rows;
  rows across maps can describe the same physical airfield.
- Exact simulator scope resolves duplicate airfield names before deduplication.
  Explicit scope can select a theatre row even when a standalone article exists.
- Up to six history messages and three canonical topic IDs preserve context.
  Failed user turns remain in history; trailing unanswered questions replay in
  order. New chat clears both, aborting pending inference.
- General explanatory material can connect a record's terminology to the requested
  concept, such as TACAN/VORTAC, or explain a calculation from listed facts.
  These relationships come from site material, not airfield-specific prompts.
- Inputs to inference remain bounded: at most six passages, 3,500 characters each
  and 14,000 in aggregate; output has a 400-token limit. History is context, not
  factual evidence. Citation IDs must resolve to supplied canonical sources.
- Lexical metadata is prepared during the build. Corpus and metadata are loaded
  as Text modules to avoid compiling multi-megabyte JavaScript object literals.
- The browser waits up to 30 seconds and can use the Worker even if Pagefind fails.
  Temporary capacity gets one 500 ms retry with `rejectIfBusy`, then a `503 busy`
  response with `Retry-After: 2`. Daily quota remains `429 daily_quota` and the
  requested Ghostrider message. Model failures no longer display a raw search
  excerpt as though it answered the question.

Capacity code 3040 and quota code 3036 are distinct in
[Cloudflare's error documentation](https://developers.cloudflare.com/workers-ai/platform/errors/).
The third binding argument for queue rejection follows
[the binding documentation](https://developers.cloudflare.com/workers-ai/features/reject-if-busy/).
Text module configuration follows
[Wrangler's module rules](https://developers.cloudflare.com/workers/wrangler/configuration/#bundling).

## Iteration record

See [deployment records](../tests/ask/results/deployments.json) for exact commits,
workflow URLs and outcomes. All changes were built from the feature branch.

| Iteration | Observation | Result |
| --- | --- | --- |
| Baseline | Existing Pagefind selection missed relevant sections and concepts | [7 replies](../tests/ask/results/baseline.json) |
| 1 | Canonical retrieval exposed glossary topic stealing and word-order confusion | [10/16 keyword checks](../tests/ask/results/iteration-01.json) |
| 2 | Subject continuity and concept matching corrected | [16/16](../tests/ask/results/iteration-02.json) |
| 3 | Expanded cases exposed omitted exact engine designation, flaps retrieval and theatre-name ambiguity | [22/26](../tests/ask/results/iteration-03.json) |
| 4 | Improved query coverage; two flags were acceptable wording/number formatting, one was a real abstention | [23/26](../tests/ask/results/iteration-04.json) |
| 5 | Airfield rows and complete sections added; timeouts/502s and failure-context problems appeared | [20/30](../tests/ask/results/iteration-05.json) |
| 6 | Deployment rejected for startup CPU; iteration 5 stayed live | [deployment failure](../tests/ask/results/deployment-06.json) |
| 7 | Build-prepared metadata deployed; no HTTP errors, one generic reply for unlisted Sochi TACAN | [32/33](../tests/ask/results/iteration-07.json) |
| 8 | Repeated failure recovery and explicit scope corrected; one 3040 capacity error and one abstention | [32/34](../tests/ask/results/iteration-08.json) |
| 9 | Capacity retry/UI behaviour implemented; startup CPU rejected deployment, leaving iteration 8 live | [deployment failure](../tests/ask/results/deployment-09.json) |
| 10 | Text modules deployed; 33/34 keyword checks. Browser review exposed example bearings applied to the airfield | [33/34](../tests/ask/results/iteration-10.json) |
| 11 | Existing article hyperlinks join measured simulator rows to narrative records; numeric-example distinction added | Final remote validation below |

A run started during the iteration-3-to-4 rollout correctly flagged revision
mismatches. [Its record](../tests/ask/results/deployment-transition.json) is excluded
from answer-quality scores. Revision preflight now prevents starting inference
against the wrong deployment. Iteration 5 also revealed that the original live
runner omitted failed user turns; the runner now preserves them like the UI.

## Review and verification

Independent engineering review found and retested topic switches, multi-subject
retrieval, lost failure context, duplicate-name scope, internal noise words in
names, repeated failures, and scoped rows suppressed by standalone articles.
Those findings were fixed. Serialized metadata was checked against direct
retrieval, and passage budgets were checked across the real corpus cases.
No remaining blocker was found in that review's scope. No aviation SME review
was run because no published aviation content was changed.

- `npm run check`: 426 tests passed; Astro/TypeScript reported zero errors and
  warnings; production build and site/experience/module/encyclopedia checks passed.
- `node --test tests/ask/*.test.mjs`: 24 targeted tests passed, including validation,
  prepared-index round-trip, corpus extraction, scope and failure recovery.
- `python3 scripts/check_docs.py` and `git diff --check`: passed.
- Wrangler 4.59.1 dry run: 21 KiB JavaScript entry point plus two Text modules;
  total gzip upload approximately 1.8 MiB.

## Final evidence and limitations

The final Worker revision is `16ce32407976faa1f21d7ac3c205a6ce19be891c`.
There were eleven deployment attempts; iterations 6 and 9 failed startup validation.
The extra correction followed manual review finding illustrative 087°/267° values
assigned to Ramat David instead of its published simulator 082°/262° values.
No additional Worker changes were made after iteration 11.

After the local environment disconnected, final validation ran in
[GitHub Actions](https://github.com/burnzoire/oversweep/actions/runs/44234379288).
The temporary validation workflow and evidence publisher were removed afterward.
The permanent deployment workflow remains manual-only.

- 426 automated tests and production/type/content checks passed.
- All 34 scripted live turns passed keyword checks with a deliberately incorrect
  MiG-15 hint on every request. Nine further turns passed with no hints.
- Real browser checks exercised Sochi tower → ILS, new-chat clearing, Tomcat
  engines, mobile layout, the closed launcher, and Ramat David follow-ups.
- The browser captured one genuine `502 invalid_answer / response_truncated`
  on the initial Ramat David question. Subsequent questions recovered its subject.
  This was a model-output truncation, not a successful answer or a capacity error.
- The remote browser's final orientation answer correctly used 082°/262°.
  Earlier local runs of the same final revision were overly literal about
  “east–west” and asserted unsupported BMS runway availability. Those observations
  remain limitations; a passing keyword check is not a factual guarantee.
- No model replies were mocked in the live suites or screenshots. Static branch
  assets were served under the allowed site origin; inference reached the real
  deployed Cloudflare Worker. The Pages frontend was not published from this branch.

[Evidence manifest](https://github.com/burnzoire/oversweep/blob/3ee4ad984e9e3ee6391b0934614568828a20e220/docs/screenshots/ask-oversweep/16ce32407976faa1f21d7ac3c205a6ce19be891c/validation.json)
records source/deployment revisions, workflow outcomes, screenshot blob hashes and
file sizes. The same directory contains `live.json`, `no-hints.json`, `browser.json`
and the complete check logs. Screenshots in the PR use this immutable evidence commit.

These are improvements to retrieval and conversational reliability, not a claim
that every generated response is accurate. Remaining work concerns model grounding,
conciseness, scope discipline and occasional output truncation. Frontend history,
reset and error-message changes require the PR's normal Pages release after merge.

To repeat the live suite after a production build:

```sh
ASK_LIVE=1 ASK_REVISION=<deployed-sha> ASK_HINTS=wrong node scripts/test-ask-live.mjs results.json
```

The optional browser harness is `scripts/test-ask-browser-live.mjs`; it requires
Playwright installed under `/tmp/ask-browser` and writes an `evidence/` directory.
It intercepts branch static assets only, never the inference endpoint.
