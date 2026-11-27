import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { createPublicQuestionSelector } from './screen-ask-report-question.mjs';

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

function disclosedQuestion(report, screenLegacyQuestion) {
  if (report?.publicQuestionNotice === 1) return screenLegacyQuestion(report);
  if (report?.publicQuestionNotice !== 2) return undefined;
  const { question } = report;
  if (typeof question !== 'string' || !question.trim() || question.length > 300 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(question)) return undefined;
  return { question };
}

function createIssue(event, quote) {
  const stage = stages.has(event.report?.stage) ? event.report.stage : undefined;
  const time = `${new Date(event.timestamp).toISOString().slice(0, 16)}Z`;
  const blocks = [event.marker, `**Reported** ${time} (UTC)`];
  if (stage) blocks.push(`**Response stage** \`${stage}\``);
  if (quote) {
    const fenceLength = Math.max(3, ...(quote.question.match(/`+/g) ?? []).map(run => run.length + 1));
    const fence = '`'.repeat(fenceLength);
    blocks.push(`**Reported question (verbatim)**\n\n${fence}\n${quote.question}\n${fence}`);
  }
  if (quote?.subjectId) blocks.push(`**Public reference** <https://www.oversweep.com${quote.subjectId}>`);
  const lookup = /^[a-z0-9_-]{8,128}$/i.test(event.id)
    ? `Filter by \`$metadata.id\` = \`${event.id}\`.`
    : `Filter for \`${eventName}\` around the report time above.`;
  blocks.push(`**Original report** Open [Cloudflare Workers Observability](${observability}) and select \`${worker}\`. ${lookup} Open the matching event to inspect the report.`);
  return { title: stage ? `Ask Oversweep report · ${stage}` : 'Ask Oversweep report', body: blocks.join('\n\n') };
}

async function request(fetcher, url, { token, service, body, allow404 = false, timeout = 20_000 }) {
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
      signal: AbortSignal.timeout(timeout),
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

async function reportQuoteSelector(fetcher) {
  try {
    const corpus = await request(fetcher, 'https://www.oversweep.com/ask-corpus.txt', {
      service: 'Published Ask Oversweep corpus',
      timeout: 5_000,
    });
    return createPublicQuestionSelector(corpus);
  } catch {
    // A report can be filed using Cloudflare metadata alone.
    return () => undefined;
  }
}

async function readReports(fetcher, { account, token, now, backfill }) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${account}/workers/observability/telemetry/query`;
  const reports = new Map();
  const cursors = new Set();
  let invalidMetadata = 0;
  let offset;
  try {
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
        const id = row?.$metadata?.id;
        if (row?.$metadata?.service !== worker || typeof id !== 'string' || !id ||
            !Number.isFinite(row.timestamp) || !Number.isFinite(new Date(row.timestamp).getTime())) {
          invalidMetadata++;
          continue;
        }
        const marker = `<!-- ask-oversweep-report:${createHash('sha256').update(id).digest('hex')} -->`;
        reports.set(marker, { id, marker, timestamp: row.timestamp, report: reportPayload(row.source) });
      }
      if (rows.length < pageSize) return { reports, invalidMetadata, incomplete: false };
      offset = rows.at(-1)?.$metadata?.id;
      if (typeof offset !== 'string' || !offset || cursors.has(offset)) {
        throw new Error('Cloudflare returned an invalid or repeated telemetry pagination cursor.');
      }
      cursors.add(offset);
    }
    throw new Error('Cloudflare telemetry pagination exceeded the per-run limit.');
  } catch (error) {
    // Preserve reports from pages already read if a later page fails.
    if (!reports.size) throw error;
    return { reports, invalidMetadata, incomplete: true };
  }
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
  const { reports, invalidMetadata, incomplete } = await readReports(fetcher, {
    account, token, now, backfill: env.BACKFILL === 'true',
  });
  let quoted = 0;
  let created = 0;
  let alreadyFiled = 0;
  let publishError;
  const issueNumbers = [];
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
        const marker = issue.body?.match(/^<!-- ask-oversweep-report:[a-f0-9]{64} -->(?=\r?\n|$)/)?.[0];
        if (marker) pending.delete(marker);
      }
      if (issues.length < 100) break;
    }
    alreadyFiled = reports.size - pending.size;
    const oldestFirst = [...pending.values()].sort((a, b) => a.timestamp - b.timestamp);
    const screenLegacyQuestion = oldestFirst.some(event => event.report?.publicQuestionNotice === 1)
      ? await reportQuoteSelector(fetcher)
      : () => undefined;
    for (const event of oldestFirst) {
      const quote = disclosedQuestion(event.report, screenLegacyQuestion);
      const issue = createIssue(event, quote);
      try {
        const result = await github('/issues', { body: { ...issue, labels: [label] } });
        if (Number.isSafeInteger(result?.number) && result.number > 0) issueNumbers.push(result.number);
      } catch (error) {
        // A timed-out POST may have created an issue. Let the next run check
        // the event marker before attempting another write.
        publishError = error.message;
        break;
      }
      if (quote) quoted++;
      created++;
    }
  }
  return { reports: reports.size, alreadyFiled, created, quoted, invalidMetadata, incomplete, issueNumbers, ...(publishError && { publishError }) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { reports, alreadyFiled, created, quoted, invalidMetadata, incomplete, issueNumbers, publishError } = await collectReports(process.env);
    console.log(`Reports found: ${reports}. Already filed: ${alreadyFiled}. Issues created: ${created}. Questions quoted: ${quoted}. Events missing valid metadata: ${invalidMetadata}.`);
    for (const number of issueNumbers) console.log(`https://github.com/${targetRepository}/issues/${number}`);
    if (incomplete) console.error('Cloudflare did not return every page. Retry to collect the remaining reports.');
    if (publishError) console.error(`${publishError} Retry to file the remaining reports.`);
    if (invalidMetadata || incomplete || publishError) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
