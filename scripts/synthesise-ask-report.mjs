import { createRetriever } from '../workers/ask-oversweep/retrieval.mjs';

const publicCorpusId = /^\/(?:manual|encyclopedia|training|experiences)\/[a-z0-9/_-]+(?:#[a-z0-9_-]+)?$/i;

// Whole-question patterns prevent a known public subject from qualifying an
// otherwise unclassified message for verbatim publication.
const publicQuestionForms = [
  /^(?:what (?:is|are) (?:an? |the )?|what does oversweep say about |tell me about |explain |define )(.+)$/i,
  /^how does (.+) work$/i,
  /^what does (.+) mean$/i,
  /^(?:(?:what (?:is|are)|which) (?:the )?)?(?:(?:tower|ground|approach|departure|atis|radio) (?:frequenc(?:y|ies)|freq)|(?:TACAN|VORTAC|navigation beacon)(?: channel)?|runways?|runway headings?) (?:at|for|in|of) (.+)$/i,
  /^which runways? (?:at|in) (.+) (?:runs?|is aligned) (?:roughly )?(?:east[ -]west|west[ -]east|north[ -]south|south[ -]north)$/i,
];

export function createPublicQuestionSelector(corpus) {
  const normalise = value => value.trim().replace(/ +/g, ' ').toLowerCase();
  const subjects = new Map();
  const airfields = new Set(Object.entries(corpus).filter(([id]) => id.includes('#af-')).map(([, entry]) => entry.record));
  for (const [id, entry] of Object.entries(corpus)) {
    if (!publicCorpusId.test(id) || (id.includes('#') && !id.includes('#af-') && !id.startsWith('/encyclopedia/terminology/'))) continue;
    const airfieldSlug = airfields.has(id) && id.match(/^\/encyclopedia\/locations\/([a-z0-9-]+)\/$/i)?.[1];
    for (const name of [entry.title, entry.name, airfieldSlug ? airfieldSlug.replaceAll('-', ' ') : undefined]) {
      if (typeof name !== 'string' || !name.trim()) continue;
      const key = normalise(name);
      // A name can be public in several simulators. Avoid choosing a scope
      // the visitor did not specify when linking back to the corpus.
      subjects.set(key, subjects.has(key) && subjects.get(key) !== id ? null : id);
    }
  }

  return function selectPublicQuestion(report) {
    const { publicQuestionNotice, question } = report;
    if (publicQuestionNotice !== 1 || typeof question !== 'string' || question.length > 180 ||
        /[^A-Za-z0-9 .,'’()&/·–?-]/u.test(question)) return undefined;
    const candidate = normalise(question).replace(/\?$/, '').trimEnd();
    for (const form of publicQuestionForms) {
      const match = form.exec(candidate);
      if (match && subjects.has(match[1])) {
        return { question, subjectId: subjects.get(match[1]), verbatim: true };
      }
    }
  };
}

// Synthetic cases use fixed text and keep simulator scope in public titles.
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
    .filter(id => typeof id === 'string' && Object.hasOwn(corpus, id) && publicCorpusId.test(id));

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
