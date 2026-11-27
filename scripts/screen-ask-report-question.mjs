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
        return { question, subjectId: subjects.get(match[1]) };
      }
    }
  };
}
