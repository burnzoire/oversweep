# Aviation SME review standard

The shared claim-review checklist and required report format are maintained in
the [canonical workflow-shared instructions](../.github/workflows/shared/aviation-sme-review.md).
The SME profile and automated PR workflow use those same instructions. This
document is the documentation entry point; it does not duplicate the checklist.

Reviews are advisory. The standard preserves source rights, distinguishes
unverified evidence from factual defects, requires independent model derivations,
and supplies evidence for revision-specific technical validation by the delivery
agent under the content standards. No human aviation reviewer is required.

## Declaring cited source pages

The review's source reader extracts only the PDF pages an evidence file says it
relies on, so a manual of any length costs just its cited pages. In each
`docs/reviews/*.md` evidence file, add one block per cited source:

````markdown
```review-sources
source: https://www.cnatra.navy.mil/local/docs/pat-pubs/P-1289.pdf
sha256: <SHA-256 of the PDF you read>
pages: 52-59 (4-1 to 4-8); 60-83 (5-1 to 5-24)
```
````

- Page numbers are physical PDF pages (the viewer's page index), not printed
  folios. The bracketed printed labels are optional and appear in the packet
  beside each extracted page.
- `sha256` is optional. When it is given and the download differs, no pages
  are extracted and the review reports the mismatch, because the pages may not
  be the edition you cited.
- Ranges are read in records of up to ten pages, at most 12 ranges and 80
  pages per source. A PDF may be up to 64 MB and must download within 90
  seconds. A cited PDF without a block is read from page 1 to page 15 only.
- Blocks in unchanged evidence files still apply, so a later page-only change
  is checked against the same cited pages and hash.
- Pages with no extractable text (scans, images) are listed as not read.
- Sources must be on an approved host. A block may list several `source:`
  entries, each followed by its own `sha256` and `pages` lines.

Long module prose can live in per-section files under `content/<module>/*.md`,
which the reader includes before the evidence files. CSS `<style>` blocks in
`.astro` pages are left out of the packet. Each changed file, cited page range
and other source has its own budget. The packet starts with a coverage list,
and the review copies any cut, failed or omitted record into its
`## Source coverage` section, which the gate shows on the PR.
