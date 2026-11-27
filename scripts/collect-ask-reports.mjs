import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createReportSynthesiser } from './synthesise-ask-report.mjs';

const eventName = 'ask_oversweep_report';
const worker = 'ask-oversweep';
const targetRepository = 'burnzoire/oversweep';
const label = 'ask-oversweep-report';
const pageSize = 100;
const hour = 3_600_000;
const stages = new Set(['answered', 'no_passages', 'no_supported_answer', 'response_sources']);

function parseJson(value) {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function reportPayload(source) {
  const parsed = parseJson(source);
  const message = parsed?.message ?? parsed ?? source;
  if (Array.isArray(message) && message[0] === eventName) return parseJson(message[1]);
  if (typeof message === 'string' && message.startsWith(eventName)) {
    return parsed?.question ? parsed : parseJson(message.slice(eventName.length).trimStart());
  }
}

const observability = 'https://dash.cloudflare.com/?to=/:account/workers-and-pages/observability';

function createIssue(event, report, sample) {
  const id = createHash('sha256').update(event.$metadata.id).digest('hex');
  const marker = `<!-- ask-oversweep-report:${id} -->`;
  const time = `${new Date(event.timestamp).toISOString().slice(0, 16)}Z`;
  const blocks = [
    marker,
    `**Reported stage** \`${report.stage}\``,
    `**Synthetic test question**\n\n    ${sample.question}`,
    `**Offline retrieval check** ${sample.lead ? `The synthetic question and the reported question selected the same first [passage](https://www.oversweep.com${sample.lead}).` : 'Neither question retrieved a passage.'}`,
    `**Public reference** <https://www.oversweep.com${sample.subjectId}>`,
    `**Original report** Open [Cloudflare Workers Observability](${observability}), select \`${worker}\`, then filter for \`${eventName}\` around \`${time}\` (UTC).`,
    'Replay the synthetic question to verify answer generation. The collector checked retrieval only.',
  ];
  if (/^[a-z0-9_-]{8,128}$/i.test(event.$metadata.id)) {
    blocks.splice(-1, 0, `**Event filter** \`$metadata.id\` equals \`${event.$metadata.id}\`.`);
  }
  return { marker, timestamp: event.timestamp, title: `Ask Oversweep report · ${report.stage}`, body: blocks.join('\n\n') };
}

async function request(fetcher, url, { token, service, body, allow404 = false }) {
  let response;
  try {
    response = await fetcher(url, {
      method: body ? 'POST' : 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: 'application/json',
        ...(body && { 'Content-Type': 'application/json' }),
      },
      body: body && JSON.stringify(body),
      signal: AbortSignal.timeout(20_000),
      redirect: 'error',
    });
  } catch {
    throw new Error(`${service} request failed before receiving a response.`);
  }
  if (allow404 && response.status === 404) return undefined;
  if (!response.ok) throw new Error(`${service} returned HTTP ${response.status}.`);
  try {
    return await response.json();
  } catch {
    throw new Error(`${service} returned invalid JSON.`);
  }
}

async function readReports(fetcher, { account, token, now, backfill, synthesise }) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${account}/workers/observability/telemetry/query`;
  const reports = new Map();
  const cursors = new Set();
  let unparsed = 0;
  let unsupported = 0;
  let decoded = 0;
  let offset;
  for (let page = 0; page < 50; page++) {
    const data = await request(fetcher, url, {
      token,
      service: 'Cloudflare telemetry query',
      body: {
        queryId: 'ask-oversweep-reports',
        timeframe: { from: now - (backfill ? 72 : 48) * hour, to: now },
        view: 'events',
        dry: true,
        limit: pageSize,
        ...(offset && { offset, offsetDirection: 'next' }),
        parameters: {
          filters: [
            { key: '$metadata.service', operation: 'eq', type: 'string', value: worker },
            { key: '$metadata.message', operation: 'starts_with', type: 'string', value: eventName },
          ],
        },
      },
    });
    const rows = data?.result?.events?.events;
    if (data?.success !== true || !Array.isArray(rows)) throw new Error('Cloudflare telemetry query returned an unexpected event page.');
    for (const row of rows) {
      if (row?.$metadata?.service !== worker || typeof row.$metadata.id !== 'string' ||
          !Number.isFinite(row.timestamp) || !Number.isFinite(new Date(row.timestamp).getTime())) {
        throw new Error('Cloudflare returned an event with unexpected metadata.');
      }
      const report = reportPayload(row.source);
      if (!stages.has(report?.stage) || typeof report.question !== 'string') {
        unparsed++;
        continue;
      }
      decoded++;
      const sample = synthesise(report);
      if (!sample) {
        unsupported++;
        continue;
      }
      const issue = createIssue(row, report, sample);
      reports.set(issue.marker, issue);
    }
    if (rows.length < pageSize) return { reports, unparsed, unsupported, decoded };
    offset = rows.at(-1).$metadata.id;
    if (cursors.has(offset)) throw new Error('Cloudflare repeated a telemetry pagination cursor.');
    cursors.add(offset);
  }
  throw new Error('Cloudflare telemetry pagination exceeded the per-run limit.');
}

export async function collectReports(env, fetcher = fetch, now = Date.now()) {
  const { CLOUDFLARE_ACCOUNT_ID: account, CLOUDFLARE_REPORTS_API_TOKEN: token,
    GITHUB_REPOSITORY: repository, GH_TOKEN: githubToken } = env;
  if (!/^[a-f0-9]{32}$/i.test(account ?? '') || !token) {
    throw new Error('Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_REPORTS_API_TOKEN in Actions settings.');
  }
  if (repository !== targetRepository || !githubToken) {
    throw new Error('GitHub repository name or workflow token is missing.');
  }
  const github = (path = '', options = {}) => request(fetcher, `https://api.github.com/repos/${repository}${path}`, {
    token: githubToken,
    service: 'GitHub',
    ...options,
  });
  const publish = env.PUBLISH === 'true';
  const corpus = await request(fetcher, 'https://www.oversweep.com/ask-corpus.txt', {
    service: 'Published Ask Oversweep corpus',
  });
  if (!corpus || typeof corpus !== 'object' || Array.isArray(corpus)) {
    throw new Error('The published Ask Oversweep corpus returned an unexpected format.');
  }
  const synthesise = createReportSynthesiser(corpus);
  const { reports, unparsed, unsupported, decoded } = await readReports(fetcher, {
    account, token, now, backfill: env.BACKFILL === 'true', synthesise,
  });
  let created = 0;
  let deferred = 0;
  if (publish && reports.size) {
    if (!await github(`/labels/${label}`, { allow404: true })) {
      await github('/labels', { body: { name: label, color: '1d76db' } });
    }
    const pending = new Map(reports);
    for (let page = 1; pending.size; page++) {
      const issues = await github(`/issues?state=all&labels=${label}&per_page=100&page=${page}`);
      if (!Array.isArray(issues)) throw new Error('GitHub returned an unexpected issue page.');
      for (const issue of issues) {
        if (issue.pull_request) continue;
        const marker = issue.body?.match(/^<!-- ask-oversweep-report:[a-f0-9]{64} -->$/m)?.[0];
        if (marker) pending.delete(marker);
      }
      if (issues.length < 100) break;
    }
    const oldestFirst = [...pending.values()].sort((a, b) => a.timestamp - b.timestamp);
    for (const { title, body } of oldestFirst.slice(0, 20)) {
      await github('/issues', { body: { title, body, labels: [label] } });
      created++;
    }
    deferred = pending.size - created;
  }
  return { decoded, synthetic: reports.size, unsupported, unparsed, created, deferred };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { decoded, synthetic, unsupported, unparsed, created, deferred } = await collectReports(process.env);
    console.log(`Reports decoded: ${decoded}. Synthetic cases: ${synthetic}. Needs manual review: ${unsupported}. Issues created: ${created}. Deferred: ${deferred}. Unrecognised events: ${unparsed}.`);
    if (unparsed || deferred) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
