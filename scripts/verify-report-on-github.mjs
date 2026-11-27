
import assert from 'node:assert/strict';
import { collectReports } from './collect-ask-reports.mjs';
const question = 'Oversweep release verification: Does the report collector preserve this exact test question?';
const fetcher = async (url, options) => {
  const response = await fetch(url, options);
  if (new URL(url).hostname !== 'api.cloudflare.com' || !response.ok) return response;
  const data = await response.json();
  const events = data.result?.events?.events;
  assert.ok(Array.isArray(events));
  data.result.events.events = events.filter(event => event.source?.question === question ||
    (typeof event.source === 'string' && event.source.includes(question)));
  return Response.json(data);
};
const result = await collectReports({ ...process.env, PUBLISH: 'true' }, fetcher);
assert.equal(result.reports, 1);
assert.equal(result.created, 1);
assert.equal(result.quoted, 1);
const number = result.issueNumbers[0];
assert.ok(Number.isSafeInteger(number));
const url = 'https://api.github.com/repos/burnzoire/oversweep/issues/' + number;
const headers = { Authorization: 'Bearer ' + process.env.GH_TOKEN, Accept: 'application/vnd.github+json', 'content-type': 'application/json' };
const read = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
assert.ok(read.ok);
const issue = await read.json();
assert.ok(issue.body.includes('**Reported question (verbatim)**') && issue.body.includes('\n' + question + '\n'));
assert.ok(!issue.body.includes('Controlled release verification.'));
console.log('Exact question verified on GitHub issue #' + number);
const closed = await fetch(url, { method:'PATCH', headers, body: JSON.stringify({ state:'closed' }), signal: AbortSignal.timeout(15000) });
assert.ok(closed.ok);
assert.equal((await closed.json()).state, 'closed');
console.log('Closed the verification issue.');
