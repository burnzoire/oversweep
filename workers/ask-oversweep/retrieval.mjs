// Search the server-owned corpus: browser Pagefind IDs are hints, never content.
const stop = new Set('a an and are as at be can could do does for from has have how i in is it its me of on or please tell that the them there these they this those to was what when where which who why will with would you available listed about one many'.split(' '));
const titleNoise = new Set(['airport', 'international', 'airbase', 'air', 'base']);
export function terms(text = '') {
  return (text.toLowerCase().replace(/([a-z])[–—-](?=[a-z])/g, '$1 ').replace(/\b([a-z]{1,4})[-–]?(\d{1,4})[a-z]?\b/g, '$1-$2')
    .match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) ?? [])
    .filter(t => !stop.has(t)).map(t => t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);
}
export function createRetriever(corpus) {
  const rows = Object.entries(corpus).map(([id, value]) => {
    const tokens = terms(value.title + ' ' + value.text);
    const counts = new Map();
    for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
    return { id, ...value, counts, length: tokens.length, words: new Set(tokens) };
  });
  const averageLength = rows.reduce((sum, row) => sum + row.length, 0) / (rows.length || 1);
  const frequency = new Map();
  for (const row of rows) for (const word of row.words) frequency.set(word, (frequency.get(word) ?? 0) + 1);
  const weight = t => Math.log(1 + rows.length / (1 + (frequency.get(t) ?? 0)));
  const roots = rows.filter(row => !row.id.includes('#') || row.id.startsWith('/encyclopedia/terminology/#'));
  const named = question => {
    const query = new Set(terms(question));
    return roots.map(row => {
      const labels = [row.title];
      if (row.id.startsWith('/encyclopedia/terminology/#')) {
        const lead = row.text.split(/[.!?]/)[0];
        if (terms(lead).length <= 6) labels.push(lead);
      }
      const score = Math.max(...labels.map(label => {
        const title = [...new Set(terms(label))].filter(t => !titleNoise.has(t));
        const matched = title.filter(t => query.has(t));
        const coverage = matched.length / title.length;
        const phrase = terms(question).join(' ').includes(title.join(' '));
        const entity = /\/encyclopedia\/(aircraft|locations|ordnance|radar-sensors)\//.test(row.id);
        const strong = entity
          ? coverage >= .6 || matched.some(t => /\d/.test(t)) || (row.id.includes('/locations/') && matched.some(t => weight(t) > 3))
          : coverage === 1 && phrase;
        return strong ? matched.reduce((n, t) => n + weight(t), 0) * coverage * (entity ? 2 : 1) : 0;
      }));
      return { row, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id))[0]?.row;
  };
  return function retrieve(question, { history = [], previous = '', ids = [] } = {}) {
    let explicit = named(question);
    const referential = /\b(it|its|they|their|them|that|those|this|same|which one)\b/i.test(question);
    if (referential && explicit?.id.startsWith('/encyclopedia/terminology/#')) explicit = undefined;
    const definition = /^(?:what(?:’s|'s| is| are) (?!the |its |their |that |this )|define |explain )/i.test(question);
    const priorQuestions = history.filter(turn => turn.role === 'user').map(turn => turn.content);
    const prior = [...(previous ? [previous] : []), ...priorQuestions].reverse().map(named).find(row => row && !row.id.startsWith('/encyclopedia/terminology/#'));
    if (prior && explicit?.id.startsWith('/encyclopedia/terminology/#') && !definition) explicit = undefined;
    const subject = explicit ?? (definition ? undefined : prior);
    const query = [...new Set(terms(question))];
    const previousTerms = referential ? terms(priorQuestions.at(-1) ?? previous) : [];
    const score = row => [...new Set([...query, ...previousTerms])].reduce((n, t) => {
      const tf = row.counts.get(t) ?? 0;
      return n + weight(t) * (query.includes(t) ? 1 : .3) * (tf * 2.2 / (tf + 1.2 * (.25 + .75 * row.length / averageLength)) + (terms(row.title).includes(t) ? 1 : 0));
    }, 0);
    const subjectRoot = subject?.id.split('#')[0];
    const candidates = rows.filter(row => !/#(?:sources(?:-title)?|terms-title|contents-title|[^#]*fig-title)$/.test(row.id));
    let ranked;
    if (subject) {
      // Re-search every section of the subject on each turn, not just old citations.
      ranked = candidates.filter(row => row.id === subject.id || (!subject.id.includes('#') && row.id.split('#')[0] === subjectRoot))
        .map(row => ({ row, score: score(row) + (row.id.endsWith('#sims-title') ? 3 : 0) + (row.id === subject.id ? 1 : 0) }))
        .sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
    } else {
      ranked = candidates.filter(row => !definition || /^(?:\/manual\/|\/encyclopedia\/terminology\/#)/.test(row.id)).map(row => ({ row, score: score(row) + (ids.includes(row.id) ? 1 : 0) }))
        .filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
    }
    const selected = ranked.slice(0, 4).map(x => x.row);
    // General explanatory sources may connect the requested concept to a record's
    // terminology. They supplement, rather than replace, the named subject.
    if (subject && query.length) {
      const subjectTerms = new Set(terms(subject.title));
      const concepts = [...new Set([...query, ...previousTerms])].filter(t => !subjectTerms.has(t) && weight(t) > 1);
      const acronyms = new Set(terms(selected.map(row => row.text).join(' ').match(/\b[A-Z][A-Z0-9]{1,7}\b/g)?.join(' ') ?? ''));
      const acronymQuestion = roots.some(row => row.id.startsWith('/encyclopedia/terminology/#') && row.title === row.title.toUpperCase() && terms(row.title).some(t => query.includes(t)));
      const helperScore = row => score(row) + (acronymQuestion ? [...acronyms].reduce((n, t) => n + (row.words.has(t) ? weight(t) : 0), 0) : 0);
      const related = candidates.filter(row => /^(?:\/manual\/.+#|\/encyclopedia\/terminology\/#)/.test(row.id) && row.id.split('#')[0] !== subjectRoot && concepts.length && concepts.some(t => row.words.has(t)))
        .sort((a, b) => helperScore(b) - helperScore(a) || a.text.length - b.text.length);
      const glossary = related.find(row => row.id.startsWith('/encyclopedia/terminology/#'));
      const explanation = related.find(row => row.id.startsWith('/manual/') && row.text.length > 300);
      for (const row of [glossary, explanation]) if (row) selected.push(row);
    }
    let remaining = 14000;
    return { subject: subject?.title, passages: selected.map(row => {
      const text = row.text.slice(0, Math.min(3500, remaining)); remaining -= text.length;
      return { id: row.id, title: row.title, text };
    }).filter(row => row.text) };
  };
}
