// Search the server-owned corpus: browser Pagefind IDs are hints, never content.
const stop = new Set('a an and are as at be can could do does for from has have how i in is it its me of on or please tell that the them there these they this those to was what when where which who why will with would you available listed about'.split(' '));
const titleNoise = new Set(['airport', 'international', 'airbase', 'air', 'base']);
export function terms(text = '') {
  return (text.toLowerCase().replace(/\b([a-z]{1,4})[-–]?(\d{1,4})[a-z]?\b/g, '$1-$2')
    .match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) ?? [])
    .filter(t => !stop.has(t)).map(t => t.length > 4 && t.endsWith('s') ? t.slice(0, -1) : t);
}
export function createRetriever(corpus) {
  const rows = Object.entries(corpus).map(([id, value]) => ({ id, ...value, words: new Set(terms(value.title + ' ' + value.text)) }));
  const frequency = new Map();
  for (const row of rows) for (const word of row.words) frequency.set(word, (frequency.get(word) ?? 0) + 1);
  const weight = t => Math.log(1 + rows.length / (1 + (frequency.get(t) ?? 0)));
  const roots = rows.filter(row => !row.id.includes('#') || row.id.startsWith('/encyclopedia/terminology/#'));
  const named = question => {
    const query = new Set(terms(question));
    return roots.map(row => {
      const title = [...new Set(terms(row.title))].filter(t => !titleNoise.has(t));
      const matched = title.filter(t => query.has(t));
      const coverage = matched.length / title.length;
      const strong = coverage >= .6 || matched.some(t => /\d/.test(t)) || (row.id.includes('/locations/') && matched.length && matched.some(t => weight(t) > 3));
      return { row, score: strong ? matched.reduce((n, t) => n + weight(t), 0) * coverage : 0 };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id))[0]?.row;
  };
  return function retrieve(question, { history = [], previous = '', ids = [] } = {}) {
    const explicit = named(question);
    const priorQuestions = history.filter(turn => turn.role === 'user').map(turn => turn.content);
    const subject = explicit ?? [...priorQuestions, previous].filter(Boolean).reverse().map(named).find(Boolean);
    const query = [...new Set(terms(question))];
    const score = row => query.reduce((n, t) => n + (row.words.has(t) ? weight(t) : 0), 0);
    const subjectRoot = subject?.id.split('#')[0];
    const candidates = rows.filter(row => !/#(?:sources(?:-title)?|terms-title|contents-title|[^#]*fig-title)$/.test(row.id));
    let ranked;
    if (subject) {
      // Re-search every section of the subject on each turn, not just old citations.
      ranked = candidates.filter(row => row.id === subject.id || (!subject.id.includes('#') && row.id.split('#')[0] === subjectRoot))
        .map(row => ({ row, score: score(row) + (row.id.endsWith('#sims-title') ? 3 : 0) + (row.id === subject.id ? 1 : 0) }))
        .sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
    } else {
      ranked = candidates.map(row => ({ row, score: score(row) + (ids.includes(row.id) ? 1 : 0) }))
        .filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
    }
    const selected = ranked.slice(0, 4).map(x => x.row);
    // General explanatory sources may connect the requested concept to a record's
    // terminology. They supplement, rather than replace, the named subject.
    if (subject && query.length) {
      const related = candidates.filter(row => row.id.split('#')[0] !== subjectRoot && query.every(t => row.words.has(t)))
        .sort((a, b) => score(b) - score(a) || a.text.length - b.text.length)[0];
      if (related) selected.push(related);
    }
    let remaining = 14000;
    return { subject: subject?.title, passages: selected.map(row => {
      const text = row.text.slice(0, Math.min(3500, remaining)); remaining -= text.length;
      return { id: row.id, title: row.title, text };
    }).filter(row => row.text) };
  };
}
