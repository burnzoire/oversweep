// Browser Pagefind IDs are hints. Only server-owned text reaches the model.
const stop = new Set('a an and are as at be can could do does for from has have how i in is it its me of on or please tell that the them there these they this those to was what when where which who why will with would you available listed about one many affect again'.split(' '));
const titleNoise = new Set(['airport', 'international', 'airbase', 'air', 'base']);
export function terms(text = '') {
  return (text.toLowerCase().replace(/([a-z])[–—-](?=[a-z])/g, '$1 ').replace(/\b([a-z]{1,4})[-–]?(\d{1,4})[a-z]?\b/g, '$1-$2')
    .match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) ?? [])
    .filter(t => !stop.has(t)).map(t => t.length > 3 && t.endsWith('s') ? t.slice(0, -1) : t);
}
const glossary = id => id.startsWith('/encyclopedia/terminology/#');
const entity = id => /\/encyclopedia\/(aircraft|locations|ordnance|radar-sensors)\//.test(id);
const root = id => id.split('#')[0];
export function createRetriever(corpus) {
  const rows = Object.entries(corpus).map(([id, value]) => {
    const tokens = terms(value.title + ' ' + value.text);
    const counts = new Map();
    for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
    const labels = [value.title];
    if (id.startsWith('/encyclopedia/aircraft/')) labels.push(value.title.replace(/\b[A-Z]{1,4}[-–]?\d+[A-Z0-9/-]*\b/g, '').trim());
    const lead = value.text.split(/[.!?]/)[0];
    if (glossary(id) && terms(lead).length <= 6) labels.push(lead);
    return { id, ...value, counts, length: tokens.length, titleWords: new Set(terms(value.title)), mapName: /\/locations\/(?:dcs-|bms-|falcon4-)/.test(id) ? value.title.replace(/^(?:DCS|Falcon BMS|Falcon 4\.0):?\s*/i, "").toLowerCase() : undefined, labels: labels.map(label => [...new Set(terms(label))].filter(t => !titleNoise.has(t))) };
  });
  const byId = new Map(rows.map(row => [row.id, row]));
  const averageLength = rows.reduce((sum, row) => sum + row.length, 0) / (rows.length || 1);
  const frequency = new Map();
  for (const row of rows) for (const word of row.counts.keys()) frequency.set(word, (frequency.get(word) ?? 0) + 1);
  const weights = new Map([...frequency].map(([t, count]) => [t, Math.log(1 + rows.length / (1 + count))]));
  const weight = t => weights.get(t) ?? Math.log(1 + rows.length);
  const roots = rows.filter(row => !row.id.includes('#') || glossary(row.id));
  const candidates = rows.filter(row => !/#(?:sources(?:-title)?|terms-title|contents-title|[^#]*fig-title)$/.test(row.id));
  const acronymTerms = new Set(roots.filter(row => glossary(row.id) && row.title === row.title.toUpperCase()).flatMap(row => [...row.titleWords]));
  function named(question) {
    const query = new Set(terms(question));
    const phrase = [...query].join(' ');
    const matches = roots.map(row => {
      let evidence = '';
      const score = Math.max(0, ...row.labels.filter(title => title.length).map(title => {
        const matched = title.filter(t => query.has(t));
        const coverage = matched.length / title.length;
        const strong = row.mapName ? question.toLowerCase().includes(row.mapName) : entity(row.id)
          ? coverage >= .6 || matched.some(t => /\d/.test(t)) || (row.id.includes('/locations/') && matched.some(t => weight(t) > 3))
          : coverage === 1 && phrase.includes(title.join(' '));
        if (strong) evidence = matched.join(' ');
        return strong ? matched.reduce((n, t) => n + weight(t), 0) * coverage * (entity(row.id) ? 2 : 1) : 0;
      }));
      return { row, score, evidence };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
    if (!matches.length) return [];
    const first = matches[0];
    const seen = new Set();
    return matches.filter(item => {
      if (item !== first && (!entity(first.row.id) || !entity(item.row.id))) return false;
      if (seen.has(item.evidence)) return false;
      seen.add(item.evidence); return true;
    }).slice(0, 3).map(item => item.row);
  }
  return function retrieve(question, { history = [], previous = '', ids = [], topic } = {}) {
    const query = [...new Set(terms(question))];
    const referential = /\b(it|its|they|their|them|that|those|this|same|which one)\b/i.test(question);
    const definition = /^(?:what(?:’s|'s| is| are) (?!the |its |their |that |this )|define |explain |tell me about )/i.test(question);
    const independent = !referential && (definition || /^how (?:do|does)\b/i.test(question));
    const followUp = !independent && (referential || /^(?:and|what about|how about|also)\b/i.test(question) || query.length <= 2);
    const priorQuestions = history.filter(turn => turn.role === 'user').map(turn => turn.content);
    const prior = topic === undefined
      ? [...(previous ? [previous] : []), ...priorQuestions].reverse().map(named).find(matches => matches.some(row => entity(row.id))) ?? []
      : topic.map(id => byId.get(id)).filter(Boolean);
    let subjects = named(question);
    if (prior.length && !independent && subjects.every(row => glossary(row.id))) subjects = [];
    if (!subjects.length && followUp) subjects = prior;
    const subjectRoots = new Set(subjects.filter(row => !glossary(row.id)).map(row => root(row.id)));
    const subjectIds = new Set(subjects.map(row => row.id));
    const previousTerms = referential ? terms(priorQuestions.at(-1) ?? previous) : [];
    const queryTerms = [...new Set([...query, ...previousTerms])];
    const scores = new Map();
    const score = row => {
      if (!scores.has(row.id)) scores.set(row.id, queryTerms.reduce((n, t) => {
        const tf = row.counts.get(t) ?? 0;
        return n + weight(t) * (query.includes(t) ? 1 : .3) * (tf * 2.2 / (tf + 1.2 * (.25 + .75 * row.length / averageLength)) + (row.titleWords.has(t) ? 1 : 0));
      }, 2 * query.filter(t => row.counts.has(t)).length ** 2));
      return scores.get(row.id);
    };
    const onSubject = row => subjectIds.has(row.id) || subjectRoots.has(root(row.id));
    const ranked = candidates.filter(row => subjects.length ? onSubject(row) : !definition || row.id.startsWith('/manual/') || glossary(row.id))
      .map(row => ({ row, score: score(row) + (subjects.length && row.id.endsWith('#sims-title') ? 3 : 0) + (subjectIds.has(row.id) ? 1 : 0) + (!subjects.length && ids.includes(row.id) ? 1 : 0) }))
      .filter(x => subjects.length || x.score > 0).sort((a, b) => b.score - a.score || a.row.id.localeCompare(b.row.id));
    // Reserve a relevant section for EACH explicitly named record in a comparison.
    const selected = [];
    for (const subject of subjects) {
      const best = ranked.find(x => x.row.id === subject.id || (!glossary(subject.id) && root(x.row.id) === root(subject.id)))?.row;
      for (const row of [subject, best]) if (row && !selected.includes(row)) selected.push(row);
    }
    for (const { row } of ranked) if (selected.length < 4 && !selected.includes(row)) selected.push(row);
    if (subjects.length && query.length) {
      const subjectTerms = new Set(subjects.flatMap(row => [...row.titleWords]));
      const concepts = queryTerms.filter(t => !subjectTerms.has(t) && weight(t) > 1);
      const acronyms = new Set(terms(selected.map(row => row.text).join(' ').match(/\b[A-Z][A-Z0-9]{1,7}\b/g)?.join(' ') ?? ''));
      const acronymQuestion = query.some(t => acronymTerms.has(t));
      const helperScore = row => score(row) + (acronymQuestion ? [...acronyms].reduce((n, t) => n + (row.counts.has(t) ? weight(t) : 0), 0) : 0);
      const related = candidates.filter(row => (row.id.startsWith('/manual/') && row.id.includes('#') || glossary(row.id)) && !onSubject(row) && concepts.some(t => row.counts.has(t)))
        .map(row => ({ row, score: helperScore(row) })).sort((a, b) => b.score - a.score || a.row.text.length - b.row.text.length);
      const definition = subjects.every(row => glossary(row.id)) ? undefined : related.find(x => glossary(x.row.id) && [...x.row.titleWords].some(t => query.includes(t)))?.row;
      const explanation = related.find(x => x.row.id.startsWith('/manual/') && x.row.text.length > 300)?.row;
      for (const row of [definition, explanation]) if (row) selected.push(row);
    }
    let remaining = 14000;
    return { subject: subjects.map(row => row.title).join(' and ') || undefined, topic: subjects.map(row => row.id), passages: selected.map(row => {
      const text = row.text.slice(0, Math.min(3500, remaining)); remaining -= text.length;
      return { id: row.id, title: row.title, text };
    }).filter(row => row.text) };
  };
}
