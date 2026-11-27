import { createRetriever } from '../workers/ask-oversweep/retrieval.mjs';

// Report text can select a template and public corpus entries, but cannot supply
// any text for the public issue. Keep simulator scope in the published titles.
const intents = [
  [/\b(?:TACAN|VORTAC|navigation beacon)\b/i, subject => `Which navigation beacon serves ${subject}?`],
  [/\b(?:east[ -]west|west[ -]east)\b/i, subject => `Which runway at ${subject} is aligned roughly east to west?`],
  [/\b(?:north[ -]south|south[ -]north)\b/i, subject => `Which runway at ${subject} is aligned roughly north to south?`],
  [/\b(?:runway|runways|landing strip)\b/i, subject => `Which runways are listed for ${subject}?`],
  [/\btower\b/i, subject => `What frequency should I use to contact the tower at ${subject}?`],
  [/\b(?:frequency|frequencies|freq)\b/i, subject => `Which radio frequency is listed for ${subject}?`],
  [/\b(?:what (?:is|are|does)|explain|mean|meaning|define)\b/i, subject => `How does Oversweep explain ${subject}?`],
];

export function createReportSynthesiser(corpus) {
  const retrieve = createRetriever(corpus);
  const canonical = (ids, limit) => (Array.isArray(ids) ? ids : [])
    .slice(0, limit)
    .filter(id => typeof id === 'string' && Object.hasOwn(corpus, id) &&
      /^\/(?:manual|encyclopedia|training|experiences)\/[a-z0-9/_-]+(?:#[a-z0-9_-]+)?$/i.test(id));

  return function synthesise(report) {
    const original = typeof report?.question === 'string' ? report.question.slice(0, 300) : '';
    const intent = intents.find(([pattern]) => pattern.test(original));
    if (!intent) return undefined;
    const history = (Array.isArray(report.history) ? report.history : []).slice(-2)
      .filter(turn => ['user', 'assistant'].includes(turn?.role) && typeof turn.content === 'string')
      .map(turn => ({ role: turn.role, content: turn.content.slice(0, 1200) }));
    const topic = canonical(report.topic, 3);
    const originalReplay = retrieve(original, { history, topic });
    // Reported sources are the outcome of retrieval, not the browser's input hints.
    const reported = canonical(report.sources, 6);
    const originalLead = originalReplay.passages[0]?.id;
    if (reported.length && !reported.includes(originalLead)) return undefined;
    if ((report.stage === 'no_passages') !== !originalLead) return undefined;

    for (const id of canonical([...new Set([...topic, ...originalReplay.topic, ...reported])], 9)) {
      const { title, name } = corpus[id];
      // Airfield records use title for both name and simulator scope.
      const subject = (title || name || '').trim();
      if (!subject || subject.length > 180 || !/^[\p{L}\p{N} .,'’()&/·–-]+$/u.test(subject)) continue;
      const question = intent[1](subject);
      if (question.toLowerCase() === original.trim().toLowerCase()) continue;
      const replayLead = retrieve(question).passages[0]?.id;
      if (replayLead === originalLead) return { question, lead: canonical([replayLead], 1)[0], subjectId: id };
    }
  };
}
