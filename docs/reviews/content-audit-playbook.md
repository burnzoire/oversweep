# Module page playbook

How to write a manual module page, whether it is a **new module** or a rewrite of an existing one driven by an editorial audit in `docs/reviews/content-audit-*.md`. It is learned from the Close Air Support benchmark ([audit](content-audit-close-air-support.md), PR #166), which the owner accepted as the model for the other modules. Use it with [content-audit-index.md](content-audit-index.md) and `docs/content-standards.md`.

## Goal

Make the page easy to read the first time, not a reorganised NATOPS or joint publication. Keep every sourced fact; **do not cut technical depth**, move it. "Too long" in an audit usually means "no first-pass path", not "delete content".

## Steps

1. **For a rewrite, write the module's audit first** if one does not exist (a new module skips this step but still follows every other step from its first draft), in the five-question format (concision, visual learning, learning outcomes, completeness, simulator relevance). Each finding ends with an **Applied:** line saying what changed, or why it was not.
2. **For a rewrite, measure before you change anything.** Build the page and record its rendered words, longest paragraph, table count and section count (see *Measuring* below). Do not estimate them from the source file.
3. **Open with the whole thing in one go.** Give a short lede on what the topic is really about, then one worked example of the whole procedure, start to finish. In CAS this was a radio exchange from check-in to battle damage assessment. Each step links to the section that explains it. Invented examples must reuse an existing figure's example where there is one, and be labelled as invented.
4. **Split the contents into "The core sequence" and "Reference".** The core is what a first-time reader needs, in the order it happens, ending in a **Key points** recap. Reference is everything else: depth, edge cases, service differences, secondary briefs and the sim.
5. **Turn comparisons into tables.** Roles, either/or choices (BOT/BOC), call meanings, checklists with examples, and option trade-offs (gains/costs) all become tables. CAS went from 2 tables to 10.
6. **Write call or step sequences as exchanges** (`ol.exchange` with `.who` / `.said`), not as a chain inside one paragraph.
7. **Don't explain the same thing twice.** When a table already gives the facts, move the per-item detail into a `<details class="more">` "More on each…" block.
8. **End each core section with one `.key` line.** It must be true in every case the section covers (see *Review lessons*).
9. **Number the learning outcomes as a list**, then tag each "Check your understanding" question with its outcome. Make sure every outcome has at least one question, quiz or figure.
10. **Cut verbal tics** such as "the publication says…" or "the publication's examples", because the citation already does that job. Keep paragraphs under about 100 words.
11. **Add an "In the sim" panel** (`section.sim-panel`), but only from a source you have actually read. Use an official module manual (Eagle Dynamics, Heatblur and the like), cite it by printed page, and add excerpts to the evidence file. It should cover:
    - how to run the procedure in the sim;
    - where the sim differs from the real-world source (name both and cite both);
    - what the manual does not say, which is claimed neither way;
    - which sims or modules were not checked.
12. **Bump the module revision**: in `src/data/modules.json` for a reference-only module, or in `src/data/experiences.json[*].module.revision` for a trainer-backed one such as Case III or Autorotation (see `docs/development.md`). Then update the evidence record, and mark the module in the audit index as applied.
13. **Show before and after** for a rewrite, or the new page's key sections for a new module. Take screenshots of both builds at the same scroll targets (desktop 1280 px, mobile 390 px) on the `pr-screenshots` branch. Put the measured numbers in the PR body.

## Review lessons (what the reviewers caught on PR #166)

- **Key points and recaps must not overgeneralise from the worked example.** "Every attack is IN, CLEARED HOT, off" was true only for Type 1/2. Scope each takeaway to the cases it covers, or name the exceptions (Type 3, BOC).
- **Summaries must not tighten a definition.** "Both sides see the same target" made visual acquisition sound mandatory for correlation, which contradicted the BOC rule a line below. When compressing a sourced rule, check it against the detailed text on the same page.
- **Keep a rule's end point.** "After IN the net is silent" lost "until cleared or aborted", which then forbade calls the section requires.
- **Never wrap `<Term>` in another link.** `Term` already renders an anchor, and nested anchors send the click to the glossary. Use plain text inside a section link.
- **Invented examples get checked for internal consistency.** For example, a routing block and an egress block that differ need a reason, or should match.
- **The SME packet cannot fetch some sources.** irp.fas.org and PDF downloads behind a landing page are among them, so those claims come back "unverified" (not blocking). Record exact excerpts in the evidence file, and prefer hosts the packet can read where one exists.

## Measuring

Serve the built `dist/` and use Playwright on `main`:

- rendered words: `innerText`, so closed `<details>` don't count
- words before the first Reference section: the core path
- longest `p`
- number of `table` elements

CAS revision 1 → 2 measured as follows:

| Measure | Rev 1 | Rev 2 |
| --- | --- | --- |
| Total words | about 8,100 | about 8,100 |
| Core-path words | — | about 4,100 |
| Tables | 2 | 10 |
| Longest prose paragraph | about 170 words | about 105 words |

The total stayed the same because nothing was cut and the example and sim panel were added.
