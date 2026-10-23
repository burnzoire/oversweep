import assert from "node:assert/strict";
import test from "node:test";
import { evaluateSmeResult, isSmeReviewRequired } from "../../scripts/sme-review-gate.mjs";

const sha = "02662989f721c9733379c24b1a31e9bfddb9cd4d";
const run = { id: 123, head_sha: sha, status: "completed", conclusion: "success" };
const readySummary = `# Oversweep Aviation SME advisory review

**Reviewed head:** \`${sha}\`
**Release readiness:** READY
**Blocking findings:** 0
**Actions run:** https://github.com/burnzoire/oversweep/actions/runs/123
`;
const review = (body) => evaluateSmeResult({
  run,
  jobs: [{ name: "agent", conclusion: "success" }],
  pullRequest: { head: { sha } },
  comments: [{ user: { login: "github-actions[bot]" }, body }],
});

test("requires review for trainer, content, and source changes", () => {
  assert.equal(isSmeReviewRequired([{ filename: "src/experiences/case-iii/index.html" }]), true);
  assert.equal(isSmeReviewRequired([{ filename: "docs/content-standards.md" }]), true);
  assert.equal(isSmeReviewRequired([{ filename: "README.md" }]), false);
});

test("accepts only a successful exact-head agent report", () => {
  assert.deepEqual(review(readySummary), {
    ready: true,
    message: "The current-head SME review has no blocking findings.",
  });
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
