import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { completeReports, fetchReports, gitStore, key, queryEvents, QueryError } from "../../scripts/ask-reports.mjs";

const accountId = "a".repeat(32), HOUR = 3600_000;
const event = id => ({ $metadata: { id }, timestamp: 1, source: { message: "ask_oversweep_report", question: "q", answer: "a" } });
const reply = events => () => ({ status: 200, text: JSON.stringify({ success: true, result: { events: { count: events.length, events } } }) });
const remote = () => { const dir = mkdtempSync(join(tmpdir(), "remote-")); execFileSync("git", ["init", "-q", "--bare", dir]); return dir; };

test("failures are never reported as zero reports", () => {
  for (const post of [() => ({ status: 403, text: '{"success":false,"errors":[{"code":10000}]}' }),
    () => ({ status: 200, text: "<html>" }), () => ({ status: 200, text: '{"success":true,"result":{}}' })]) {
    assert.throws(() => queryEvents({ accountId, from: 0, to: 1, post }), QueryError);
  }
  assert.throws(() => queryEvents({ accountId: "", from: 0, to: 1, post: reply([]) }), QueryError);
  assert.deepEqual(queryEvents({ accountId, from: 0, to: 1, post: reply([]) }), []);
});

test("pagination follows the last event ID", () => {
  const all = Array.from({ length: 150 }, (_, i) => event(`e${i}`));
  const post = (_url, body) => reply(body.offset ? all.slice(100) : all.slice(0, 100))();
  assert.equal(queryEvents({ accountId, from: 0, to: 1, post }).length, 150);
});

test("claims block overlaps, expire for retries, and completion is permanent", () => {
  const store = gitStore(remote()), post = reply([event("one")]), now = 1_000 * HOUR;
  const go = (run, at, extra) => fetchReports({ store, accountId, post, run, now: at, ...extra });
  assert.equal(go("dry", now, { dryRun: true }).summary.new, 1);
  assert.deepEqual(store.read().events, {});
  const a = go("a", now);
  assert.equal(a.summary.window, "backlog");
  assert.equal(a.reports[0].report.question, "q");
  assert.equal(go("b", now + 1).summary.claimedElsewhere, 1);
  assert.equal(go("c", now + 4 * HOUR).summary.new, 1);
  assert.throws(() => completeReports({ store, run: "a", keys: [key("one")], now }));
  assert.equal(completeReports({ store, run: "c", keys: [key("one")], now: now + 4 * HOUR }).initialised, true);
  const later = go("d", now + 24 * HOUR);
  assert.deepEqual([later.summary.window, later.summary.new, later.summary.alreadyProcessed], ["48h", 0, 1]);
  assert.doesNotMatch(JSON.stringify(store.read()), /question|"one"/);
});

test("a failed query leaves the first-run backlog pending", () => {
  const store = gitStore(remote());
  assert.throws(() => fetchReports({ store, accountId, post: () => ({ status: 401, text: "{}" }) }), QueryError);
  assert.equal(store.read().initialisedAt, null);
});
