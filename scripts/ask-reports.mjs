// Fetch Ask Oversweep reports from Workers Observability and track processed events.
// No token is read here: the cloud environment's network secret adds Authorization.
// Report text is written only to --out (outside the repo) and never to stdout or the ledger.
import { execFileSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const HOUR = 3600_000, DAY = 24 * HOUR;
export const LEDGER_BRANCH = "claude/ask-report-ledger";
const LEASE = 3 * HOUR, KEEP = 9 * DAY, PAGE = 100;
export class QueryError extends Error {}
export const key = id => createHash("sha256").update(id).digest("hex");

export function curlPost(url, body) {
  let out;
  try {
    out = execFileSync("curl", ["-sS", "--max-time", "60", "-H", "Content-Type: application/json",
      "--data-binary", "@-", "-w", "\n%{http_code}", url],
    { input: JSON.stringify(body), encoding: "utf8", maxBuffer: 64e6, stdio: ["pipe", "pipe", "pipe"] });
  } catch (error) {
    throw new QueryError(`network error (curl exit ${error.status}); check access to api.cloudflare.com`);
  }
  const cut = out.lastIndexOf("\n");
  return { status: Number(out.slice(cut + 1)), text: out.slice(0, cut) };
}

export function queryEvents({ accountId, from, to, post = curlPost }) {
  if (!/^[a-f0-9]{32}$/.test(accountId ?? "")) throw new QueryError("CLOUDFLARE_ACCOUNT_ID is missing or malformed");
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/observability/telemetry/query`;
  const found = new Map();
  let offset;
  for (let page = 0; page < 100; page++) {
    const { status, text } = post(url, {
      queryId: "ask-oversweep-report-review", timeframe: { from, to }, view: "events", dry: true, limit: PAGE,
      ...(offset ? { offset, offsetDirection: "next" } : {}),
      parameters: {
        datasets: ["cloudflare-workers"], filterCombination: "and",
        filters: [{ key: "$workers.scriptName", operation: "eq", type: "string", value: "ask-oversweep" }],
        needle: { value: "ask_oversweep_report" },
      },
    });
    let data;
    try { data = JSON.parse(text); } catch { throw new QueryError(`HTTP ${status}: response was not JSON`); }
    if (status !== 200 || data?.success !== true) {
      const codes = (data?.errors ?? []).map(e => Number(e?.code)).filter(Number.isFinite).join(",");
      throw new QueryError(`HTTP ${status}${codes ? ` (Cloudflare code ${codes})` : ""}`);
    }
    const block = data.result?.events;
    const events = block?.events ?? (block?.count === 0 ? [] : undefined);
    if (!Array.isArray(events)) throw new QueryError("unexpected response shape: result.events.events is missing");
    const before = found.size;
    for (const event of events) {
      const id = event?.$metadata?.id;
      if (typeof id !== "string" || !id) throw new QueryError("unexpected response shape: event has no $metadata.id");
      found.set(id, event);
    }
    if (events.length < PAGE) return [...found.values()];
    if (found.size === before) throw new QueryError("pagination made no progress; results are incomplete");
    offset = events.at(-1).$metadata.id;
  }
  throw new QueryError("page limit reached; results are incomplete");
}

// The ledger lives on its own branch. A rejected non-fast-forward push is the lock.
export function gitStore(remote) {
  return {
    update(change) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const dir = mkdtempSync(join(tmpdir(), "ask-ledger-"));
        const git = (...args) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
        try {
          git("init", "-q");
          const exists = git("ls-remote", remote, `refs/heads/${LEDGER_BRANCH}`).trim() !== "";
          let ledger = { initialisedAt: null, lastQueryAt: null, events: {} };
          if (exists) {
            git("fetch", "-q", "--depth=1", remote, LEDGER_BRANCH);
            git("checkout", "-q", "--detach", "FETCH_HEAD");
            ledger = JSON.parse(git("show", "HEAD:ledger.json"));
          }
          const result = change(ledger);
          writeFileSync(join(dir, "ledger.json"), JSON.stringify(ledger, null, 2) + "\n");
          git("add", "ledger.json");
          git("-c", "user.name=ask-report-review", "-c", "user.email=noreply@anthropic.com",
            "commit", "-q", "--allow-empty", "-m", "Update Ask report ledger");
          try { git("push", "-q", remote, `HEAD:refs/heads/${LEDGER_BRANCH}`); }
          catch (error) {
            if (/rejected|non-fast-forward|fetch first|cannot lock ref/i.test(String(error.stderr))) continue;
            throw error;
          }
          return result;
        } finally { rmSync(dir, { recursive: true, force: true }); }
      }
      throw new Error("ledger push kept conflicting");
    },
    read() {
      const dir = mkdtempSync(join(tmpdir(), "ask-ledger-"));
      const git = (...args) => execFileSync("git", ["-C", dir, ...args], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
      try {
        git("init", "-q");
        if (!git("ls-remote", remote, `refs/heads/${LEDGER_BRANCH}`).trim()) return { initialisedAt: null, lastQueryAt: null, events: {} };
        git("fetch", "-q", "--depth=1", remote, LEDGER_BRANCH);
        return JSON.parse(git("show", "FETCH_HEAD:ledger.json"));
      } finally { rmSync(dir, { recursive: true, force: true }); }
    },
  };
}

// Returns the report payload if it is structured; otherwise the agent reads `source`.
function payload(value, depth = 0) {
  if (depth > 4) return null;
  if (typeof value === "string") {
    const start = value.indexOf("{");
    if (start < 0) return null;
    try { return payload(JSON.parse(value.slice(start)), depth + 1); } catch { return null; }
  }
  if (!value || typeof value !== "object") return null;
  if (typeof value.question === "string" && typeof value.answer === "string") return value;
  for (const child of Object.values(value)) { const hit = payload(child, depth + 1); if (hit) return hit; }
  return null;
}

export function fetchReports({ store, accountId, post, now = Date.now(), dryRun = false, run = randomUUID() }) {
  const ledger = store.read();
  const first = !ledger.initialisedAt;
  // 7 days is the longest Workers Logs retention; Cloudflare returns what the plan still holds.
  const from = now - (first ? 7 * DAY : 48 * HOUR);
  const events = queryEvents({ accountId, from, to: now, post });
  const gap = !first && ledger.lastQueryAt !== null && ledger.lastQueryAt < from;
  const claim = state => {
    const fresh = [];
    let busy = 0, done = 0;
    for (const event of events) {
      const k = key(event.$metadata.id), entry = state.events[k];
      if (entry?.done) done++;
      else if (entry && entry.run !== run && entry.until > now) busy++;
      else { fresh.push(event); if (!dryRun) state.events[k] = { run, until: now + LEASE, seen: now }; }
    }
    if (!dryRun) {
      state.lastQueryAt = now;
      for (const [k, e] of Object.entries(state.events)) if (now - (e.done ?? e.seen) > KEEP) delete state.events[k];
      if (first && !fresh.length && !busy) state.initialisedAt = now;
    }
    return { fresh, busy, done };
  };
  const { fresh, busy, done } = dryRun ? claim(ledger) : store.update(claim);
  return {
    summary: { status: "ok", run, window: first ? "backlog" : "48h", dryRun, matched: events.length,
      new: fresh.length, alreadyProcessed: done, claimedElsewhere: busy, coverageGap: gap },
    reports: fresh.map(event => ({ key: key(event.$metadata.id), timestamp: event.timestamp,
      report: payload(event.source), source: event.source })),
  };
}

export function completeReports({ store, run, keys, now = Date.now() }) {
  return store.update(state => {
    for (const k of keys) {
      if (state.events[k]?.run !== run) throw new Error("an event is not claimed by this run");
      state.events[k] = { ...state.events[k], done: now };
    }
    // The backlog counts as reviewed once nothing seen is left unfinished.
    if (!state.initialisedAt && Object.values(state.events).every(e => e.done)) state.initialisedAt = now;
    return { status: "ok", completed: keys.length, initialised: Boolean(state.initialisedAt) };
  });
}

function main([command, ...args]) {
  const flag = name => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
  const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
  const store = gitStore(git("remote", "get-url", "origin"));
  if (command === "fetch") {
    const out = resolve(flag("--out") ?? "");
    const repo = git("rev-parse", "--show-toplevel");
    if (!flag("--out") || out === repo || out.startsWith(repo + sep)) throw new Error("--out must be a directory outside the repository");
    const { summary, reports } = fetchReports({ store, accountId: process.env.CLOUDFLARE_ACCOUNT_ID, dryRun: args.includes("--dry-run") });
    mkdirSync(out, { recursive: true, mode: 0o700 });
    writeFileSync(join(out, "reports.json"), JSON.stringify(reports, null, 2), { mode: 0o600 });
    console.log(JSON.stringify(summary));
  } else if (command === "complete") {
    const keys = args.slice(args.indexOf("--keys") + 1);
    if (!flag("--run") || !args.includes("--keys") || !keys.length) throw new Error("usage: complete --run RUN --keys KEY...");
    console.log(JSON.stringify(completeReports({ store, run: flag("--run"), keys })));
  } else throw new Error("usage: fetch --out DIR [--dry-run] | complete --run RUN --keys KEY...");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try { main(process.argv.slice(2)); }
  catch (error) {
    const query = error instanceof QueryError;
    console.log(JSON.stringify({ status: query ? "query_failed" : "error", reason: query || !error.stderr ? error.message : "git command failed" }));
    process.exit(query ? 2 : 1);
  }
}
