
import assert from 'node:assert/strict';
import { collectReports } from './collect-ask-reports.mjs';

const question = 'Oversweep release verification: Does the report collector preserve this exact test question?';
const endpoint = 'https://ask-oversweep.burnzoire.workers.dev/ask/report';
const submit = await fetch(endpoint, {
  method: 'POST',
  headers: { Origin: 'https://www.oversweep.com', 'content-type': 'application/json' },
  body: JSON.stringify({ question, history: [], answer: 'Controlled release verification.', stage: 'no_passages', sources: [], topic: [], publicQuestionNotice: 2 }),
  signal: AbortSignal.timeout(15000),
});
console.log('Production report response:', submit.status, 'revision:', submit.headers.get('x-ask-revision'));
assert.equal(submit.status, 204);
let observed = false;
let notice;
let rendered = false;
const fetcher = async (url, options) => {
  const endpoint = new URL(url);
  if (endpoint.hostname === 'api.github.com') {
    if (endpoint.pathname.includes('/labels/')) return Response.json({});
    if (options.method === 'GET') return Response.json([]);
    const body = JSON.parse(options.body).body;
    rendered = body.includes('**Reported question (verbatim)**') && body.includes('\n' + question + '\n');
    console.log('Exact question in simulated issue:', rendered);
    return Response.json({ number: 1 });
  }
  const response = await fetch(url, options);
  if (endpoint.hostname !== 'api.cloudflare.com' || !response.ok) return response;
  const data = await response.json();
  const events = data.result?.events?.events;
  assert.ok(Array.isArray(events));
  data.result.events.events = events.filter(event => {
    if (!JSON.stringify(event.source).includes(question)) return false;
    observed = true;
    const candidate = event.source?.publicQuestionNotice;
    notice = [1, 2, '1', '2'].includes(candidate) ? candidate : 'missing or nonstandard';
    console.log('Fixture event logged; notice:', JSON.stringify(notice));
    return true;
  });
  return Response.json(data);
};
for (let attempt = 0; attempt < 9; attempt++) {
  await collectReports({ ...process.env, PUBLISH: 'true' }, fetcher);
  if (observed) break;
  await new Promise(resolve => setTimeout(resolve, 7000));
}
assert.ok(observed, 'Fixture not visible in Cloudflare logs');
assert.ok(rendered, 'The released collector omitted the exact question');
