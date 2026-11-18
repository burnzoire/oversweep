// Opt-in integration test: REAL Workers AI calls consume the account's allocation.
// Build first. No model mocks, saved replies, or network interception are used.
// ASK_LIVE=1 node scripts/test-ask-live.mjs <output.json> [case-id,...]
import fs from 'node:fs/promises';
import { createRetriever } from '../workers/ask-oversweep/retrieval.mjs';
if (process.env.ASK_LIVE !== '1') throw new Error('Set ASK_LIVE=1 to authorize live inference');
const endpoint = process.env.ASK_ENDPOINT ?? 'https://ask-oversweep.burnzoire.workers.dev/ask';
const cases = JSON.parse(await fs.readFile(new URL('../tests/ask/conversations.json', import.meta.url)));
const retrieve = createRetriever(JSON.parse(await fs.readFile(new URL('../dist/ask-corpus.txt', import.meta.url))));
if (process.env.ASK_REVISION) {
  const deployed = await fetch(endpoint, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
  if (deployed.headers.get('x-ask-revision') !== process.env.ASK_REVISION) throw new Error('Expected branch revision is not deployed; no inference tests were started');
}
const selected = process.argv[3]?.split(',');
const results = [];
for (const conversation of cases.filter(c => !selected || selected.includes(c.id))) {
  let history = [];
  let topic;
  for (const turn of conversation.turns) {
    const candidates = retrieve(turn.question, { history, topic }).passages.map(p => p.id);
    const ids = process.env.ASK_HINTS === 'wrong' ? ['/encyclopedia/aircraft/mig-15/'] : process.env.ASK_HINTS === 'none' ? [] : candidates.slice(0, 3);
    const started = Date.now();
    const row = { conversation: conversation.id, question: turn.question, requestedIds: ids, topic };
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: turn.question, history, topic, ids }), signal: AbortSignal.timeout(40000) });
      Object.assign(row, { status: response.status, revision: response.headers.get('x-ask-revision'), reply: await response.json() });
      const answer = row.reply.answer?.toLowerCase() ?? '';
      row.passed = response.ok && (!process.env.ASK_REVISION || row.revision === process.env.ASK_REVISION) && (turn.all ?? []).every(s => answer.includes(s.toLowerCase())) && (!turn.any || turn.any.some(s => answer.includes(s.toLowerCase()))) && (turn.none ?? []).every(s => !answer.includes(s.toLowerCase()));
      if (row.reply.topic) topic = row.reply.topic;
      history = [...history, {role: 'user', content: turn.question}, ...(row.reply.answer ? [{role: 'assistant', content: row.reply.answer.slice(0,1200)}] : [])].slice(-6);
    } catch (error) { row.error = error.message; row.passed = false; history = [...history, {role:'user',content:turn.question}].slice(-6); }
    row.ms = Date.now() - started;
    results.push(row);
    console.log(JSON.stringify({ conversation: row.conversation, question: row.question, reply: row.reply, ms: row.ms, passed: row.passed, revision: row.revision }));
    await fs.writeFile(process.argv[2] ?? 'tests/ask/results/live.json', JSON.stringify({ endpoint, at: new Date().toISOString(), results }, null, 2) + '\n');
  }
}
console.log(`${results.filter(r => r.passed).length}/${results.length} passed; inspect replies as well as keyword checks.`);
process.exitCode = results.some(r => !r.passed) ? 1 : 0;
