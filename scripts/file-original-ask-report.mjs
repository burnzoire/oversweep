
import assert from 'node:assert/strict';
import { collectReports } from './collect-ask-reports.mjs';

const target = '01M8E88V0C0000000000000003';
let question;
function parsePayload(source) {
  const parse = value => {
    try { return typeof value === 'string' ? JSON.parse(value) : value; }
    catch { return undefined; }
  };
  const parsed = parse(source);
  if (typeof parsed?.question === 'string') return parsed;
  const message = parsed?.message ?? parsed ?? source;
  if (Array.isArray(message) && message[0] === 'ask_oversweep_report') return parse(message[1]);
  if (typeof message === 'string' && message.startsWith('ask_oversweep_report')) {
    return parse(message.slice('ask_oversweep_report'.length).trimStart());
  }
}
const fetcher = async (url, options) => {
  if (new URL(url).hostname === 'api.github.com' && new URL(url).pathname.endsWith('/issues') && options.method === 'POST') {
    const body = JSON.parse(options.body).body;
    assert.ok(typeof question === 'string' && question.length > 0, 'Report question could not be identified.');
    assert.ok(body.includes('**Reported question (verbatim)**') && body.includes('\n' + question + '\n'), 'Collector did not prepare an exact quote.');
  }
  const response = await fetch(url, options);
  if (new URL(url).hostname !== 'api.cloudflare.com' || !response.ok) return response;
  const data = await response.json();
  const events = data.result?.events?.events;
  assert.ok(Array.isArray(events));
  data.result.events.events = events.filter(event => {
    if (event.$metadata?.id !== target) return false;
    question = parsePayload(event.source)?.question;
    return true;
  });
  return Response.json(data);
};
const result = await collectReports({ ...process.env, PUBLISH: 'true', BACKFILL: 'true' }, fetcher);
assert.equal(result.reports, 1, 'Target report was not present in Cloudflare.');
assert.equal(result.created, 1, 'No new issue was created for the target report.');
assert.equal(result.quoted, 1, 'No exact question was quoted.');
const number = result.issueNumbers[0];
assert.ok(Number.isSafeInteger(number));
const response = await fetch('https://api.github.com/repos/burnzoire/oversweep/issues/' + number, {
  headers: { Authorization: 'Bearer ' + process.env.GH_TOKEN, Accept: 'application/vnd.github+json' },
  signal: AbortSignal.timeout(15000),
});
assert.ok(response.ok);
const issue = await response.json();
assert.ok(issue.body.includes('\n' + question + '\n'), 'GitHub issue did not preserve the exact question.');
console.log('Exact reported question verified: https://github.com/burnzoire/oversweep/issues/' + number);
