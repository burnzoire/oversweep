import assert from 'node:assert/strict';
import test from 'node:test';
import { collectReports } from '../../scripts/collect-ask-reports.mjs';
import { createPublicQuestionSelector } from '../../scripts/synthesise-ask-report.mjs';

const now = Date.UTC(2026, 10, 27);
const environment = {
  CLOUDFLARE_ACCOUNT_ID: '1'.repeat(32),
  CLOUDFLARE_REPORTS_API_TOKEN: 'fixture-cloudflare',
  GITHUB_REPOSITORY: 'burnzoire/oversweep',
  GH_TOKEN: 'fixture-github',
};
const report = {
  question: 'Tower frequency for Sochi? pilot@example.com',
  answer: 'Try the airfield page.',
  history: [{ role: 'user', content: 'Where is Sochi?' }],
  stage: 'answered',
  sources: ['/arbitrary/private-string', '/encyclopedia/locations/dcs-caucasus/#af-sochi', '/manual/a)>example.com'],
};
function event(id, source = { message: ['ask_oversweep_report', report] }) {
  return { $metadata: { id, service: 'ask-oversweep' }, timestamp: now - 60_000, source };
}
function simulate({ pages = [[event('event-1')]], issues = [], cloudflareStatus = 200 } = {}) {
  const queries = [];
  const writes = [];
  let issueRead = 0;
  const fetcher = async (url, options) => {
    const { hostname, pathname } = new URL(url);
    if (hostname === 'www.oversweep.com') {
      assert.equal(options.headers.Authorization, undefined);
      return Response.json({
        '/encyclopedia/locations/dcs-caucasus/#af-sochi': {
          name: 'Sochi', title: 'Sochi · DCS Caucasus', text: 'Tower frequency 127 MHz.',
        },
        '/manual/a)>example.com': { title: 'Unsafe fixture', text: 'Private path test.' },
      });
    }
    if (hostname === 'api.cloudflare.com') {
      queries.push(JSON.parse(options.body));
      return Response.json({ success: true, result: { events: { events: pages[queries.length - 1] } } }, { status: cloudflareStatus });
    }
    if (pathname.endsWith('/labels/ask-oversweep-report')) return new Response(null, { status: 404 });
    if (options.body) {
      writes.push({ pathname, ...JSON.parse(options.body) });
      return Response.json({});
    }
    if (pathname.endsWith('/issues')) {
      issueRead++;
      return Response.json(issues);
    }
    throw new Error('Unexpected endpoint');
  };
  return { queries, writes, fetcher, issueReads: () => issueRead };
}

test('dry run paginates stored log events and makes no GitHub writes', async () => {
  const first = Array.from({ length: 100 }, (_, i) => event(String(i)));
  const second = event('100', 'ask_oversweep_report ' + JSON.stringify(report));
  const run = simulate({ pages: [first, [second]] });
  assert.deepEqual(await collectReports({ ...environment, BACKFILL: 'true' }, run.fetcher, now), {
    decoded: 101, verbatim: 0, synthetic: 101, unsupported: 0, unparsed: 0, created: 0, deferred: 0,
  });
  assert.equal(run.queries[0].timeframe.from, now - 72 * 3_600_000);
  assert.equal(run.queries[1].offset, '99');
  assert.equal(run.queries[1].offsetDirection, 'next');
  assert.equal(run.queries[0].parameters.filters[0].value, 'ask-oversweep');
  assert.equal(run.issueReads(), 0);
  assert.deepEqual(run.writes, []);
});

test('creates labelled issues, publishes only canonical links, and skips closed duplicates', async () => {
  const run = simulate({ pages: [[event('unique-12345', { message: 'ask_oversweep_report', ...report, publicQuestionNotice: 1 })]] });
  const env = { ...environment, PUBLISH: 'true' };
  assert.equal((await collectReports(env, run.fetcher, now)).created, 1);
  const issue = run.writes.find(x => x.pathname.endsWith('/issues'));
  assert.deepEqual(issue.labels, ['ask-oversweep-report']);
  assert.match(issue.body, /oversweep\.com\/encyclopedia\/locations\/dcs-caucasus\/#af-sochi/);
  assert.match(issue.body, /What frequency should I use to contact the tower at Sochi · DCS Caucasus\?/);
  assert.match(issue.body, /2026-11-26T23:59Z/);
  assert.match(issue.body, /dash\.cloudflare\.com.*observability/);
  assert.match(issue.body, /unique-12345/);
  assert.doesNotMatch(issue.body, /Tower frequency for Sochi|Where is Sochi|example\.com|arbitrary\/private|airfield page/);
  const retry = simulate({ pages: [[event('unique-12345')]], issues: [{ body: issue.body, state: 'closed' }] });
  assert.equal((await collectReports(env, retry.fetcher, now)).created, 0);
});

test('rejects other repositories before reading reports', async () => {
  const run = simulate();
  await assert.rejects(collectReports({ ...environment, GITHUB_REPOSITORY: 'fixture/elsewhere' }, run.fetcher, now), /repository name/);
  assert.deepEqual(run.queries, []);
});

test('distinguishes empty results, undecodable events and failed queries', async () => {
  const empty = simulate({ pages: [[]] });
  assert.deepEqual(await collectReports(environment, empty.fetcher, now), {
    decoded: 0, verbatim: 0, synthetic: 0, unsupported: 0, unparsed: 0, created: 0, deferred: 0,
  });
  const unparsed = simulate({ pages: [[event('one', { message: 'ask_oversweep_report' })]] });
  assert.equal((await collectReports(environment, unparsed.fetcher, now)).unparsed, 1);
  const denied = simulate({ cloudflareStatus: 403 });
  await assert.rejects(collectReports(environment, denied.fetcher, now), /telemetry query returned HTTP 403/);
});

test('withholds issues when no synthetic replay can match the report', async () => {
  const unmatched = { ...report, question: 'private note about something unrelated' };
  const run = simulate({ pages: [[event('unmatched', { message: 'ask_oversweep_report', ...unmatched })]] });
  assert.deepEqual(await collectReports({ ...environment, PUBLISH: 'true' }, run.fetcher, now), {
    decoded: 1, verbatim: 0, synthetic: 0, unsupported: 1, unparsed: 0, created: 0, deferred: 0,
  });
  assert.deepEqual(run.writes, []);
});

test('keeps the requested navigation aid distinct from radio frequencies', async () => {
  const navigation = { ...report, question: 'What frequency is the TACAN at Sochi?' };
  const run = simulate({ pages: [[event('navigation', { message: 'ask_oversweep_report', ...navigation })]] });
  assert.equal((await collectReports({ ...environment, PUBLISH: 'true' }, run.fetcher, now)).created, 1);
  const issue = run.writes.find(x => x.pathname.endsWith('/issues'));
  assert.match(issue.body, /Which navigation beacon serves Sochi · DCS Caucasus\?/);
});

test('preserves the whole safe question and withholds the answer and prior turns', async () => {
  const question = 'What is the Tower freq for  Sochi?';
  const source = { message: 'ask_oversweep_report', ...report, question, publicQuestionNotice: 1 };
  const run = simulate({ pages: [[event('verbatim', source)]] });
  const result = await collectReports({ ...environment, PUBLISH: 'true' }, run.fetcher, now);
  assert.equal(result.verbatim, 1);
  assert.equal(result.synthetic, 0);
  assert.equal(result.created, 1);
  const issue = run.writes.find(x => x.pathname.endsWith('/issues'));
  assert.ok(issue.body.includes(`**Reported question (verbatim)**\n\n    ${question}`));
  assert.doesNotMatch(issue.body, /Where is Sochi|Try the airfield page|Offline retrieval check/);
});

test('recognises the published slug of a standalone airfield without guessing simulator scope', () => {
  const sochi = '/encyclopedia/locations/sochi/';
  const classify = createPublicQuestionSelector({
    [sochi]: { title: 'Sochi International Airport' },
    '/encyclopedia/locations/dcs-caucasus/#af-sochi-adler': { name: 'Sochi-Adler', record: sochi },
    '/encyclopedia/locations/dcs-syria/#af-ramat-david': { name: 'Ramat David' },
    '/encyclopedia/locations/dcs-sinai/#af-ramat-david': { name: 'Ramat David' },
  });
  const question = 'What is the tower freq for Sochi?';
  assert.deepEqual(classify({ question, publicQuestionNotice: 1 }), { question, subjectId: sochi, verbatim: true });
  const ambiguous = 'Which runway at Ramat David runs east-west?';
  assert.deepEqual(classify({ question: ambiguous, publicQuestionNotice: 1 }), { question: ambiguous, subjectId: null, verbatim: true });
});

test('uses synthetic cases for older reports and questions that fail screening', async () => {
  const question = 'What is the tower freq for Sochi?';
  const variants = [
    { question },
    { question, publicQuestionNotice: 2 },
    { question, publicQuestionNotice: '1' },
    ...[
      'What is the tower freq for Sochi, Alice Smith?',
      'What is the tower freq for Sochi 0412 345 678?',
      'What is the tower freq for Sochi https://example.com/private?',
      'What is the tower freq for Sochi?\n',
      'What is the tower freq for Sochi\u200b?',
      'What is the tower freq for `[Sochi]`?',
    ].map(question => ({ question, publicQuestionNotice: 1 })),
  ];
  const run = simulate({ pages: [variants.map((variant, index) => event(`variant-${index}`, {
    message: 'ask_oversweep_report', ...report, ...variant,
  }))] });
  const result = await collectReports({ ...environment, PUBLISH: 'true' }, run.fetcher, now);
  assert.equal(result.verbatim, 0);
  assert.equal(result.synthetic, variants.length);
  for (const issue of run.writes.filter(x => x.pathname.endsWith('/issues'))) {
    assert.match(issue.body, /Synthetic test question/);
    assert.doesNotMatch(issue.body, /Alice Smith|0412 345 678|example\.com|\u200b|\[Sochi\]/u);
  }
});
