import { appendFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const workflowPath = ".github/workflows/aviation-sme-review.lock.yml";
const summaryTitle = "Oversweep Aviation SME advisory review";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function isSmeReviewRequired(files) {
  return files.some(({ filename, previous_filename }) =>
    [filename, previous_filename].some((file) =>
      file &&
      (file.startsWith("content/") ||
        file === "docs/aviation-sme-review.md" ||
        (file.startsWith("docs/content-") && file.endsWith(".md")) ||
        file.startsWith("docs/plans/") ||
        file.startsWith("docs/reviews/") ||
        file.startsWith("public/") ||
        file.startsWith("src/") ||
        file.startsWith("tests/") ||
        file === ".github/agents/aviation-sme-reviewer.agent.md" ||
        file === ".github/workflows/aviation-sme-review.md" ||
        file === workflowPath ||
        file === ".github/workflows/shared/aviation-sme-review.md"),
    ),
  );
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

  const reviewedHead = report.body.match(/^\*\*Reviewed head:\*\*\s*`?([a-f0-9]{40})`?\s*$/im)?.[1];
  if (reviewedHead !== run.head_sha) return fail("The PR summary does not identify this run's exact head SHA.");

  const readiness = report.body.match(/^\*\*Release readiness:\*\*\s*(BLOCKED|READY)\s*$/im)?.[1];
  const blockingFindings = Number(report.body.match(/^\*\*Blocking findings:\*\*\s*(\d+)\s*$/im)?.[1]);
  if (!readiness || !Number.isInteger(blockingFindings)) {
    return fail("The SME summary is missing its machine-readable release-readiness result.");
  }
  if (readiness !== "READY" || blockingFindings > 0) {
    return fail(`SME findings block release readiness (${blockingFindings} blocking finding${blockingFindings === 1 ? "" : "s"}).`);
  }
  return { ready: true, message: "The current-head SME review has no blocking findings." };
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

async function writeSummary(message, ready) {
  const text = `## Aviation SME review gate: ${ready ? "READY" : "BLOCKED"}\n\n${message}\n`;
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, text);
  console.log(text);
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
    await writeSummary("No aviation-content or trainer implementation files changed; no SME review is required.", true);
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
  await writeSummary(result.message, result.ready);
  if (!result.ready) process.exitCode = 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  main().catch(async (error) => {
    await writeSummary(error.message, false);
    process.exitCode = 1;
  });
}
