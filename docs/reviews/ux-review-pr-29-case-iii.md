# UX review: Case III trainer PR #29

## Revision and setup

- Issue: [#28](https://github.com/burnzoire/oversweep/issues/28)
- PR: [#29](https://github.com/burnzoire/oversweep/pull/29)
- Base: `c5524f9ffa16bee96e013a3d9ad27f4bf904aa3c`
- Reviewed PR head: `2c16d437fd1264d69f9340b4442a452707baab42`
- Served checkout: exact PR head above, verified with `git rev-parse HEAD`
- Local URL: `http://127.0.0.1:4321` (Astro development server; not production or a remote preview)
- Runtime: Node.js 22.23.4, Chromium 155, Playwright 1.64.1

The PR-head checkout was started with `npm ci` and
`npm run dev -- --host 0.0.0.0`. Playwright ran against the local server using the
system Chromium binary; it was installed ephemerally for this review and is not a
repository dependency. The configured Playwright MCP browser tool could not be
authenticated in this session (`Browser-based OAuth required`), so this demonstrates
local browser interaction, not live availability of that Copilot MCP tool or profile
discovery.

## Routes, journeys, and checks

Reviewed `/`, `/manual/`, `/manual/naval-operations/`,
`/manual/naval-operations/case-iii/` (embedded trainer),
`/review/case-iii/` (full-window trainer), and `/training/`.

At desktop (1440 × 900), tablet (768 × 1024), and phone (390 × 844), the keyboard
journey from Home through Manual and Naval Operations to the embedded trainer
worked. The first Tab focused the visible skip link with a solid outline; Enter
followed it. Enter on **Start Exercise** closed the briefing dialog and changed the
transport control to **Pause**. Enter on **Open trainer in a full window** opened
the full-window route. The Training Library showed its trainer card.

For all three viewport sizes, the home, Training Library, embedded page, embedded
frame, and full-window page had no document-level horizontal overflow. The draft
status was visible in both the manual scope panel and trainer frame. No uncaught
page errors were observed. Screenshots were captured locally at all three sizes;
layout and overflow measurements were checked at each size.

## Observed defects

- **Low — Expanded subject navigation delays the Case III content.** Reproduction:
  open `/manual/naval-operations/case-iii/` at the top of the page. The 13-link
  **Manual subjects** disclosure is open and rendered full-width before the article.
  Its measured height is 645 px; the Drafted status panel starts at y=1005 px at
  1440 × 900 and 390 × 844, and y=990 px at 768 × 1024. At desktop and phone sizes,
  users must scroll past the entire subject list before reaching the scope notes;
  at tablet size, the status panel starts just below the initial viewport. This
  delays the purpose and limitations of the embedded experience. Consider keeping
  the subject links in a compact rail on wide screens and initially collapsing the
  disclosure on this deep route, while retaining its keyboard-operable toggle.

## Optional design suggestions

None separate from the observed finding.

## Untested areas and limits

This was a targeted Chromium review, not an exhaustive accessibility or device
audit. Screen-reader behavior, zoom/reflow beyond the tested widths, native touch,
reduced motion, speech output, other browsers, and the trainer's full command,
feedback, and recovery flow were not tested. The current Copilot Playwright MCP
browser tool required OAuth unavailable in this session; future reviewers must
report that or any other missing browser access rather than claim verification.
This review does not validate aviation procedures or technical content.
