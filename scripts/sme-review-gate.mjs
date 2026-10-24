import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workflowPath = ".github/workflows/aviation-sme-review.lock.yml";
const summaryTitle = "Oversweep Aviation SME advisory review";
export const overrideLabel = "sme-override";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep in sync with `on.pull_request.paths` in .github/workflows/aviation-sme-review.md;
// a test checks the two lists match. Code, test, style and registry changes are not
// aviation claims, so they no longer wait on an SME review.
export const smeReviewPaths = [
  "content/**",
  "src/pages/**",
  "src/lessons/**",
  "src/experiences/**",
  "docs/reviews/**",
  "docs/aviation-sme-review.md",
  "scripts/prepare_review_sources.py",
  ".github/agents/aviation-sme-reviewer.agent.md",
  ".github/workflows/aviation-sme-review.md",
  workflowPath,
  ".github/workflows/shared/aviation-sme-review.md",
];

const matchesPath = (file, pattern) =>
  pattern.endsWith("/**") ? file.startsWith(pattern.slice(0, -2)) : file === pattern;

export function isSmeReviewRequired(files) {
  return files.some(({ filename, previous_filename }) =>
    [filename, previous_filename].some((file) => file && smeReviewPaths.some((pattern) => matchesPath(file, pattern))),
  );
}

// Blocking findings are listed one per line under "## Blocking findings" as
// "- **B1** · <severity> · `<file>` · <claim and fix>"; the file is optional.
export function parseBlockingFindings(body) {
  const section = body.match(/^##\s+Blocking findings\s*$([\s\S]*?)(?=^##\s|^<details|(?![\s\S]))/im)?.[1] ?? "";
  return section
    .split("\n")
    .map((line) => line.match(/^\s*[-*]\s+\*\*(B\d+)\*\*\s*·\s*([^·]+?)\s*·\s*(?:`([^`]+)`\s*·\s*)?(.+)$/))
    .filter(Boolean)
    .map(([, id, severity, file, detail]) => ({ id, severity, file, detail: detail.trim() }));
}

// The review copies the preprocessor's coverage list into "## Source coverage" so the
// gate can show which files and cited pages were cut, failed or never read.
export function parseSourceCoverage(body) {
  const section = body.match(/^##\s+Source coverage\s*$([\s\S]*?)(?=^##\s|^<details|(?![\s\S]))/im)?.[1]?.trim();
  if (!section) return { complete: false, text: "The review did not report source coverage; read the full review before relying on it." };
  const complete = /^all\b.*\bcomplete\.?$/i.test(section) && !/^\s*[-*]\s/m.test(section);
  return { complete, text: section };
}

// An override counts only if the repository owner applied the label most recently.
export function evaluateOverride({ labels, events, owner }) {
  if (!labels?.some((label) => label.name === overrideLabel)) return null;
  const applied = events
    ?.filter((event) => event.event === "labeled" && event.label?.name === overrideLabel)
    .at(-1);
  if (!applied || applied.actor?.login !== owner) {
    return { ready: false, ignored: true, message: `The \`${overrideLabel}\` label was not applied by @${owner}, so it is ignored.` };
  }
  return {
    ready: true,
    message: `@${owner} overrode the SME review with the \`${overrideLabel}\` label at ${applied.created_at}. Remove the label to re-apply the review result.`,
  };
}

export function evaluateSmeResult({ run, jobs, pullRequest, comments }) {
  const fail = (message) => ({ ready: false, message });
  if (!run) return fail("No SME workflow run was found for this PR head.");
  if (run.status !== "completed" || run.conclusion !== "success") {
    return fail(`SME workflow did not succeed (status: ${run.status}, conclusion: ${run.conclusion ?? "none"}).`);
  }
  if (!jobs.length) return fail("The SME workflow completed with zero jobs.");
  if (!jobs.some((job) => job.name === "agent" && job.conclusion === "success")) {
    return fail("The SME agent job is missing, skipped, or unsuccessful.");
  }
  if (!pullRequest || pullRequest.head.sha !== run.head_sha) {
    return fail("The SME run is not for the PR's current head SHA.");
  }

  const report = comments.find((comment) =>
    comment.user?.login === "github-actions[bot]" &&
    comment.body?.includes(`# ${summaryTitle}`) &&
    comment.body.includes(`/actions/runs/${run.id}`),
  );
  if (!report) return fail("The current SME run has no visible PR review summary.");
  const reportUrl = report.html_url;

  const reviewedHead = report.body.match(/^\*\*Reviewed head:\*\*\s*`?([a-f0-9]{40})`?\s*$/im)?.[1];
  if (reviewedHead !== run.head_sha) return fail("The PR summary does not identify this run's exact head SHA.");

  const readiness = report.body.match(/^\*\*Release readiness:\*\*\s*(BLOCKED|READY)\s*$/im)?.[1];
  const blockingFindings = Number(report.body.match(/^\*\*Blocking findings:\*\*\s*(\d+)\s*$/im)?.[1]);
  if (!readiness || !Number.isInteger(blockingFindings)) {
    return fail("The SME summary is missing its machine-readable release-readiness result.");
  }
  // A listed blocker fails the gate even if the header lines disagree with it.
  const blockers = parseBlockingFindings(report.body);
  const coverage = parseSourceCoverage(report.body);
  const coverageText = `**Source coverage**\n\n${coverage.text}`;
  if (readiness !== "READY" || blockingFindings > 0 || blockers.length > 0) {
    const count = Math.max(blockingFindings, blockers.length);
    const list = blockers.map(({ id, severity, file, detail }) => `- **${id}** (${severity}${file ? `, \`${file}\`` : ""}): ${detail}`).join("\n");
    return {
      ready: false,
      blockers,
      coverage,
      reportUrl,
      message: [
        `The SME review found ${count} blocking finding${count === 1 ? "" : "s"}.`,
        list || "The review did not list its blockers in the expected format; read the full review.",
        coverageText,
        reportUrl ? `Full review: ${reportUrl}` : "",
      ].filter(Boolean).join("\n\n"),
    };
  }
  return {
    ready: true,
    coverage,
    reportUrl,
    message: ["The current-head SME review has no blocking findings.", coverageText, reportUrl ? `Full review: ${reportUrl}` : ""]
      .filter(Boolean).join("\n\n"),
  };
}

async function request(apiUrl, token, path) {
  const response = await fetch(new URL(path, apiUrl), {
    headers: {
      accept: "application/vnd.github+json",
      authorization: "Bearer " + token,
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!response.ok) throw new Error(`GitHub API ${path}: ${response.status} ${response.statusText}`);
  return response.json();
}

async function pagedRequest(apiUrl, token, path) {
  const items = [];
  for (let page = 1; ; page += 1) {
    const result = await request(apiUrl, token, `${path}${path.includes("?") ? "&" : "?"}per_page=100&page=${page}`);
    const pageItems = result.jobs ?? result;
    items.push(...pageItems);
    if (pageItems.length < 100) return items;
  }
}

const escapeData = (text) => text.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
const escapeProperty = (text) => escapeData(text).replace(/:/g, "%3A").replace(/,/g, "%2C");

async function writeSummary(message, ready, blockers = [], coverage = null) {
  const text = `## Aviation SME review gate: ${ready ? "READY" : "BLOCKED"}\n\n${message}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, text);
  console.log(text);
  // Annotations show each blocker on the PR's checks list and against the file.
  for (const { id, severity, file, detail } of blockers) {
    const location = file ? `file=${escapeProperty(file)},` : "";
    console.log(`::error ${location}title=${escapeProperty(`SME blocker ${id} (${severity})`)}::${escapeData(detail)}`);
  }
  // Incomplete reading never blocks by itself, but it must be visible on the checks list.
  if (coverage && !coverage.complete) {
    console.log(`::warning title=SME review source coverage incomplete::${escapeData(coverage.text)}`);
  }
  if (!ready && !blockers.length) console.log(`::error title=Aviation SME review gate::${escapeData(message)}`);
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const apiUrl = process.env.GITHUB_API_URL ?? "https://api.github.com";
  const repository = process.env.GITHUB_REPOSITORY;
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
  const pullNumber = event.pull_request?.number;
  const headSha = event.pull_request?.head?.sha;
  if (!token || !repository || !pullNumber || !headSha) {
    throw new Error("This gate requires a pull_request_target event and read-only GitHub API access.");
  }

  const [owner, repo] = repository.split("/");
  const pullPath = `/repos/${owner}/${repo}/pulls/${pullNumber}`;
  const pullRequest = await request(apiUrl, token, pullPath);
  if (pullRequest.head.sha !== headSha) throw new Error("PR head changed before the SME gate started.");
  const files = await pagedRequest(apiUrl, token, `${pullPath}/files`);
  if (!isSmeReviewRequired(files)) {
    await writeSummary("No aviation content, lesson or trainer files changed; no SME review is required.", true);
    return;
  }

  const override = evaluateOverride({
    labels: pullRequest.labels,
    events: await pagedRequest(apiUrl, token, `/repos/${owner}/${repo}/issues/${pullNumber}/events`),
    owner: event.repository?.owner?.login ?? owner,
  });
  if (override?.ready) {
    await writeSummary(override.message, true);
    return;
  }

  const workflows = await request(apiUrl, token, `/repos/${owner}/${repo}/actions/workflows?per_page=100`);
  const workflow = workflows.workflows?.find((entry) => entry.path === workflowPath);
  if (!workflow) throw new Error(`Could not find the SME workflow at ${workflowPath}.`);
  const runsPath = `/repos/${owner}/${repo}/actions/workflows/${workflow.id}/runs?head_sha=${headSha}&event=pull_request`;
  const deadline = Date.now() + 20 * 60 * 1000;
  let run;
  while (Date.now() < deadline) {
    const result = await request(apiUrl, token, runsPath);
    run = result.workflow_runs
      ?.filter((candidate) =>
        candidate.path === workflowPath &&
        candidate.head_sha === headSha &&
        candidate.event === "pull_request",
      )
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))[0];
    if (run?.status === "completed") break;
    await sleep(15_000);
  }
  if (!run || run.status !== "completed") {
    await writeSummary("No completed SME review for this PR head appeared within 20 minutes.", false);
    process.exitCode = 1;
    return;
  }

  const jobs = await pagedRequest(apiUrl, token, run.jobs_url);
  const comments = await pagedRequest(apiUrl, token, `/repos/${owner}/${repo}/issues/${pullNumber}/comments`);
  const currentPullRequest = await request(apiUrl, token, pullPath);
  const result = evaluateSmeResult({
    run,
    jobs,
    pullRequest: currentPullRequest,
    comments,
  });
  const message = override?.ignored ? `${result.message}\n\n${override.message}` : result.message;
  await writeSummary(message, result.ready, result.blockers, result.coverage);
  if (!result.ready) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch(async (error) => {
    await writeSummary(error.message, false);
    process.exitCode = 1;
  });
}
