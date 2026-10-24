import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  evaluateOverride,
  evaluateSmeResult,
  isSmeReviewRequired,
  parseBlockingFindings,
  parseSourceCoverage,
  smeReviewPaths,
} from "../../scripts/sme-review-gate.mjs";

const sha = "02662989f721c9733379c24b1a31e9bfddb9cd4d";
const run = { id: 123, head_sha: sha, status: "completed", conclusion: "success" };
const readySummary = `# Oversweep Aviation SME advisory review

**Reviewed head:** \`${sha}\`
**Release readiness:** READY
**Blocking findings:** 0
**Actions run:** https://github.com/burnzoire/oversweep/actions/runs/123
`;
const commentUrl = "https://github.com/burnzoire/oversweep/pull/1#issuecomment-1";
const review = (body) => evaluateSmeResult({
  run,
  jobs: [{ name: "agent", conclusion: "success" }],
  pullRequest: { head: { sha } },
  comments: [{ user: { login: "github-actions[bot]" }, body, html_url: commentUrl }],
});
const blockedSummary = readySummary
  .replace("Release readiness:** READY", "Release readiness:** BLOCKED")
  .replace("Blocking findings:** 0", "Blocking findings:** 2") + `
## Blocking findings

- **B1** · Medium · \`src/pages/manual/case-iii.astro\` · Platform is called "not a DME fix". **Source:** P-816 p. A-5. **Fix:** describe it at 20 NM and 5,000 ft.
- **B2** · High · Unsourced 250 KIAS limit stated as fact. **Fix:** cite it or label it a trainer setpoint.

<details><summary>Full review</summary>

- **B9** · Low · \`x\` · not a blocker
</details>
`;

test("requires review for aviation content, lessons and trainers only", () => {
  assert.equal(isSmeReviewRequired([{ filename: "src/experiences/case-iii/index.html" }]), true);
  assert.equal(isSmeReviewRequired([{ filename: "src/pages/manual/naval-operations/[trainer].astro" }]), true);
  assert.equal(isSmeReviewRequired([{ filename: "src/lessons/case-iii/lesson-model.mjs" }]), true);
  assert.equal(isSmeReviewRequired([{ filename: "docs/reviews/evidence.md" }]), true);
  for (const filename of ["README.md", "tests/case-iii/model.cjs", "src/styles/global.css", "public/favicon.svg", "docs/content-standards.md"]) {
    assert.equal(isSmeReviewRequired([{ filename }]), false, filename);
  }
});

test("gate paths match the SME workflow trigger paths", async () => {
  const workflow = await readFile(new URL("../../.github/workflows/aviation-sme-review.md", import.meta.url), "utf8");
  const block = workflow.match(/^ {4}paths:\n((?: {6}- .+\n)+)/m)[1];
  const paths = [...block.matchAll(/- "(.+)"/g)].map((match) => match[1]);
  assert.deepEqual(paths, smeReviewPaths);
});

test("parses each listed blocker and ignores the collapsed full review", () => {
  assert.deepEqual(parseBlockingFindings(blockedSummary), [
    {
      id: "B1",
      severity: "Medium",
      file: "src/pages/manual/case-iii.astro",
      detail: 'Platform is called "not a DME fix". **Source:** P-816 p. A-5. **Fix:** describe it at 20 NM and 5,000 ft.',
    },
    { id: "B2", severity: "High", file: undefined, detail: "Unsourced 250 KIAS limit stated as fact. **Fix:** cite it or label it a trainer setpoint." },
  ]);
  assert.deepEqual(parseBlockingFindings(`${readySummary}\n## Blocking findings\n\nNone.\n`), []);
});

test("a blocked gate shows its blockers and links the full review", () => {
  const result = review(blockedSummary);
  assert.equal(result.ready, false);
  assert.equal(result.blockers.length, 2);
  assert.match(result.message, /2 blocking findings/);
  assert.match(result.message, /\*\*B1\*\* \(Medium, `src\/pages\/manual\/case-iii\.astro`\): Platform/);
  assert.match(result.message, /\*\*B2\*\* \(High\): Unsourced/);
  assert.ok(result.message.includes(commentUrl));
});

test("a listed blocker fails the gate even when the header says READY", () => {
  const inconsistent = `${readySummary}\n## Blocking findings\n\n- **B1** · High · \`src/pages/a.astro\` · Unsourced limit stated as fact.\n`;
  const result = review(inconsistent);
  assert.equal(result.ready, false);
  assert.equal(result.blockers.length, 1);
  assert.match(result.message, /1 blocking finding\./);
});

test("only the owner's sme-override label overrides the review", () => {
  const labels = [{ name: "sme-override" }];
  const labeled = (login) => ({ event: "labeled", label: { name: "sme-override" }, actor: { login }, created_at: "2026-10-24T09:00:00Z" });
  assert.equal(evaluateOverride({ labels: [], events: [labeled("burnzoire")], owner: "burnzoire" }), null);
  const owner = evaluateOverride({ labels, events: [labeled("burnzoire")], owner: "burnzoire" });
  assert.equal(owner.ready, true);
  assert.match(owner.message, /@burnzoire overrode/);
  const other = evaluateOverride({ labels, events: [labeled("burnzoire"), labeled("someone")], owner: "burnzoire" });
  assert.equal(other.ready, false);
  assert.equal(other.ignored, true);
});

test("accepts only a successful exact-head agent report", () => {
  const result = review(readySummary);
  assert.equal(result.ready, true);
  assert.equal(result.reportUrl, commentUrl);
  assert.match(result.message, /^The current-head SME review has no blocking findings\./);
});

test("the gate summary shows which records were cut, failed or never read", () => {
  const coverage = "\n## Source coverage\n\n- failed · SOURCE RETRIEVAL FAILURE: https://www.cnatra.navy.mil/a.pdf · URLError\n- cut at 40,000 of 52,000 characters · RETRIEVED SOURCE DATA: https://faa.gov/a.pdf physical pages 60-69\n\n<details><summary>Full review</summary>\n\nx\n</details>\n";
  const result = review(readySummary + coverage);
  assert.equal(result.ready, true, "incomplete reading is shown, not blocking by itself");
  assert.equal(result.coverage.complete, false);
  assert.match(result.message, /\*\*Source coverage\*\*/);
  assert.match(result.message, /SOURCE RETRIEVAL FAILURE: https:\/\/www\.cnatra\.navy\.mil\/a\.pdf/);
  assert.match(result.message, /physical pages 60-69/);
  assert.doesNotMatch(result.message, /Full review<\/summary>/);
  const blocked = review(blockedSummary + coverage);
  assert.match(blocked.message, /SOURCE RETRIEVAL FAILURE/);
});

test("source coverage is complete only when the review says so without listing records", () => {
  assert.equal(parseSourceCoverage("## Source coverage\n\nAll 6 records are complete.\n").complete, true);
  assert.equal(parseSourceCoverage("## Source coverage\n\nAll complete.\n- omitted: packet budget exhausted · x\n").complete, false);
  const missing = parseSourceCoverage("## Blocking findings\n\nNone.\n");
  assert.equal(missing.complete, false);
  assert.match(missing.text, /did not report source coverage/);
});

test("unresolved Case III evidence findings visibly block readiness", () => {
  const caseIIIReport = readySummary
    .replace("Release readiness:** READY", "Release readiness:** BLOCKED")
    .replace("Blocking findings:** 0", "Blocking findings:** 2")
    .replace("**Actions run:**", "Unresolved: Case III procedure and numeric-gate sources remain unverified.\n**Actions run:**");
  const result = review(caseIIIReport);
  assert.equal(result.ready, false);
  assert.match(result.message, /2 blocking findings/);
});

test("missing, skipped, stale, or failed reports never pass", () => {
  assert.equal(evaluateSmeResult({ run: null, jobs: [], pullRequest: null, comments: [] }).ready, false);
  assert.equal(evaluateSmeResult({
    run: { ...run, conclusion: "failure" },
    jobs: [],
    pullRequest: { head: { sha } },
    comments: [],
  }).ready, false);
  assert.equal(evaluateSmeResult({
    run,
    jobs: [{ name: "agent", conclusion: "skipped" }],
    pullRequest: { head: { sha } },
    comments: [{ user: { login: "github-actions[bot]" }, body: readySummary }],
  }).ready, false);
  assert.equal(evaluateSmeResult({
    run,
    jobs: [{ name: "agent", conclusion: "success" }],
    pullRequest: { head: { sha: "3fbc19695c650cf47670b1755017d615ef042b1c" } },
    comments: [{ user: { login: "github-actions[bot]" }, body: readySummary }],
  }).ready, false);
});
