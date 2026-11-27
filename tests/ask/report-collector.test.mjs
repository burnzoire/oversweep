import assert from 'node:assert/strict';
import test from 'node:test';
import { collectReports } from '../../scripts/collect-ask-reports.mjs';
import { createPublicQuestionSelector } from '../../scripts/screen-ask-report-question.mjs';

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
function simulate({ pages = [[event('event-1')]], issues = [], cloudflareStatus = 200, corpusStatus = 200, failWrite = 0 } = {}) {
  const queries = [];
  const writes = [];
  let issueRead = 0;
  const fetcher = async (url, options) => {
    const { hostname, pathname } = new URL(url);
    if (hostname === 'www.oversweep.com') {
      assert.equal(options.headers.Authorization, undefined);
      if (corpusStatus !== 200) return new Response(null, { status: corpusStatus });
      return Response.json({
        '/encyclopedia/locations/dcs-caucasus/#af-sochi': {
          name: 'Sochi', title: 'Sochi · DCS Caucasus', text: 'Tower frequency 127 MHz.',
        },
        '/manual/a)>example.com': { title: 'Unsafe fixture', text: 'Private path test.' },
      });
    }
    if (hostname === 'api.cloudflare.com') {
      queries.push(JSON.parse(options.body));
      return Response.json({ success: true, result: { events: { events: pages[queries.length - 1] } } }, { status: Array.isArray(cloudflareStatus) ? cloudflareStatus[queries.length - 1] : cloudflareStatus });
    }
    if (pathname.endsWith('/labels/ask-oversweep-report')) return new Response(null, { status: 404 });
    if (options.body) {
      if (writes.length + 1 === failWrite) return new Response(null, { status: 503 });
      writes.push({ pathname, ...JSON.parse(options.body) });
      return Response.json(pathname.endsWith('/issues') ? { number: writes.length } : {});
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
    reports: 101, alreadyFiled: 0, created: 0, quoted: 0, invalidMetadata: 0, incomplete: false, issueNumbers: [],
  });
  assert.equal(run.queries[0].timeframe.from, now - 72 * 3_600_000);
  assert.equal(run.queries[1].offset, '99');
  assert.equal(run.queries[1].offsetDirection, 'next');
  assert.equal(run.queries[0].parameters.filters[0].value, 'ask-oversweep');
  assert.equal(run.issueReads(), 0);
  assert.deepEqual(run.writes, []);
});

test('files report metadata and skips closed duplicates', async () => {
  const run = simulate({ pages: [[event('unique-12345', { message: 'ask_oversweep_report', ...report, publicQuestionNotice: 1 })]] });
  const env = { ...environment, PUBLISH: 'true' };
  assert.equal((await collectReports(env, run.fetcher, now)).created, 1);
  const issue = run.writes.find(x => x.pathname.endsWith('/issues'));
  assert.deepEqual(issue.labels, ['ask-oversweep-report']);
  assert.match(issue.body, /Response stage.*answered/);
  assert.match(issue.body, /2026-11-26T23:59Z/);
  assert.match(issue.body, /dash\.cloudflare\.com.*observability/);
  assert.match(issue.body, /unique-12345/);
  assert.doesNotMatch(issue.body, /Tower frequency for Sochi|Where is Sochi|example\.com|arbitrary\/private|airfield page/);
  const retry = simulate({ pages: [[event('unique-12345')]], issues: [{ body: issue.body, state: 'closed' }] });
  const replay = await collectReports(env, retry.fetcher, now);
  assert.equal(replay.created, 0);
  assert.equal(replay.alreadyFiled, 1);
});

test('rejects other repositories before reading reports', async () => {
  const run = simulate();
  await assert.rejects(collectReports({ ...environment, GITHUB_REPOSITORY: 'fixture/elsewhere' }, run.fetcher, now), /repository name/);
  assert.deepEqual(run.queries, []);
});

test('files metadata even if the event payload format or published corpus is unavailable', async () => {
  const pages = [[
    event('unrecognised-event', { message: 'ask_oversweep_report unreadable' }),
    event('corpus-unavailable', {
      message: 'ask_oversweep_report', ...report,
      question: 'Tower frequency for Sochi?', publicQuestionNotice: 1,
    }),
  ]];
  const run = simulate({ pages, corpusStatus: 503 });
  const env = { ...environment, PUBLISH: 'true' };
  assert.deepEqual(await collectReports(env, run.fetcher, now), {
    reports: 2, alreadyFiled: 0, created: 2, quoted: 0, invalidMetadata: 0, incomplete: false, issueNumbers: [2, 3],
  });
  const written = run.writes.filter(x => x.pathname.endsWith('/issues'));
  assert.equal(written[0].title, 'Ask Oversweep report');
  assert.match(written[0].body, /unrecognised-event/);
  assert.match(written[1].body, /corpus-unavailable/);
  assert.doesNotMatch(written.map(issue => issue.body).join(' '), /unreadable|Tower frequency for Sochi|Try the airfield page/);
});

test('files valid events alongside bad metadata and counts terminal query failures', async () => {
  const empty = simulate({ pages: [[]] });
  assert.deepEqual(await collectReports(environment, empty.fetcher, now), {
    reports: 0, alreadyFiled: 0, created: 0, quoted: 0, invalidMetadata: 0, incomplete: false, issueNumbers: [],
  });
  const denied = simulate({ cloudflareStatus: 403 });
  await assert.rejects(collectReports(environment, denied.fetcher, now), /telemetry query returned HTTP 403/);

  const valid = event('valid-one');
  const run = simulate({ pages: [[{ ...valid, timestamp: null }, valid]] });
  const result = await collectReports({ ...environment, PUBLISH: 'true' }, run.fetcher, now);
  assert.equal(result.invalidMetadata, 1);
  assert.equal(result.created, 1);
});

test('files a successful Cloudflare page when a later page fails', async () => {
  const first = Array.from({ length: 100 }, (_, i) => event(`event-${i}`));
  const run = simulate({ pages: [first], cloudflareStatus: [200, 503] });
  const result = await collectReports({ ...environment, PUBLISH: 'true' }, run.fetcher, now);
  assert.equal(result.incomplete, true);
  assert.equal(result.created, 100);
});

test('reports successful writes and deduplicates them on retry after a GitHub failure', async () => {
  const env = { ...environment, PUBLISH: 'true' };
  const pages = [[event('first-event'), event('second-event')]];
  const failing = simulate({ pages, failWrite: 3 });
  const first = await collectReports(env, failing.fetcher, now);
  assert.deepEqual(first.issueNumbers, [2]);
  assert.equal(first.created, 1);
  assert.equal(first.publishError, 'GitHub returned HTTP 503.');

  const existing = failing.writes.find(x => x.pathname.endsWith('/issues'));
  const retry = simulate({ pages, issues: [existing] });
  const second = await collectReports(env, retry.fetcher, now);
  assert.equal(second.alreadyFiled, 1);
  assert.equal(second.created, 1);
  assert.match(retry.writes.find(x => x.pathname.endsWith('/issues')).body, /second-event/);
});

test('preserves the whole safe question and withholds the answer and prior turns', async () => {
  const question = 'What is the Tower freq for  Sochi?';
  const source = { message: 'ask_oversweep_report', ...report, question, publicQuestionNotice: 1 };
  const run = simulate({ pages: [[event('verbatim', source)]] });
  const result = await collectReports({ ...environment, PUBLISH: 'true' }, run.fetcher, now);
  assert.equal(result.quoted, 1);
  assert.equal(result.created, 1);
  const issue = run.writes.find(x => x.pathname.endsWith('/issues'));
  assert.ok(issue.body.includes('**Reported question (verbatim)**\n\n```\n' + question + '\n```'));
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
  assert.deepEqual(classify({ question, publicQuestionNotice: 1 }), { question, subjectId: sochi });
  const ambiguous = 'Which runway at Ramat David runs east-west?';
  assert.deepEqual(classify({ question: ambiguous, publicQuestionNotice: 1 }), { question: ambiguous, subjectId: null });
});

test('files older and unquotable reports without including the question', async () => {
  const question = 'What is the tower freq for Sochi?';
  const variants = [
    { question },
    { question, publicQuestionNotice: 3 },
    { question, publicQuestionNotice: '2' },
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
  assert.equal(result.quoted, 0);
  assert.equal(result.created, variants.length);
  for (const issue of run.writes.filter(x => x.pathname.endsWith('/issues'))) {
    assert.match(issue.body, /Original report/);
    assert.doesNotMatch(issue.body, /What is the tower freq|Synthetic test question/);
    assert.doesNotMatch(issue.body, /Alice Smith|0412 345 678|example\.com|\u200b|\[Sochi\]/u);
  }
});

test('quotes the exact disclosed question as literal text without fetching the corpus', async () => {
  const markerLikeText = `<!-- ask-oversweep-report:${'a'.repeat(64)} -->`;
  const question = ['Could Ask Oversweep answer this?', '````', '@example <b>text</b>', markerLikeText].join('\n');
  const source = { message: 'ask_oversweep_report', ...report, question, publicQuestionNotice: 2 };
  const run = simulate({ pages: [[event('direct-quote', source)]] });
  const fetcher = (url, options) => {
    assert.notEqual(new URL(url).hostname, 'www.oversweep.com');
    return run.fetcher(url, options);
  };
  const env = { ...environment, PUBLISH: 'true' };
  const result = await collectReports(env, fetcher, now);
  assert.equal(result.created, 1);
  assert.equal(result.quoted, 1);
  const issue = run.writes.find(x => x.pathname.endsWith('/issues'));
  assert.ok(issue.body.includes('\n\n`````\n' + question + '\n`````\n\n'));
  assert.doesNotMatch(issue.body, /Try the airfield page|Where is Sochi/);

  const realMarker = issue.body.split('\n')[0];
  const retry = simulate({ pages: [[event('direct-quote', source)]], issues: [{ body: 'Another issue\n' + realMarker }] });
  assert.equal((await collectReports(env, retry.fetcher, now)).created, 1);
});

test('files a report even when the disclosed question contains a transport control character', async () => {
  const source = { message: 'ask_oversweep_report', ...report, question: 'Bad\u0000question', publicQuestionNotice: 2 };
  const run = simulate({ pages: [[event('control-character', source)]] });
  const result = await collectReports({ ...environment, PUBLISH: 'true' }, run.fetcher, now);
  assert.equal(result.created, 1);
  assert.equal(result.quoted, 0);
  assert.doesNotMatch(run.writes.find(x => x.pathname.endsWith('/issues')).body, /Bad|\u0000/u);
});
