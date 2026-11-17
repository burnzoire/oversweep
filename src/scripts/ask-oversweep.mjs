const collections = ["manual/", "encyclopedia/", "training/", "experiences/"];
const ignoredWords = new Set("a an are can could does do explain for have how i in is it me of on please should tell the to was what when where which who why will with would you".split(" "));
const titleNoise = new Set(["airport", "airbase", "international", "the", "and", "of"]);

function allowedUrl(value, base, origin) {
  const url = new URL(value, origin);
  return url.origin === origin && collections.some(collection => url.pathname.startsWith(base + collection));
}

function tokens(text = "") {
  return text.toLowerCase()
    .replace(/\b([a-z]{1,4})[-–]?(\d{1,4})[a-z]?\b/g, "$1-$2")
    .match(/[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*/gu) ?? [];
}

const indexes = new Map();
async function records(base, origin) {
  const url = new URL(base + "search-index.json", origin).href;
  if (!indexes.has(url)) {
    indexes.set(url, fetch(url).then(response => {
      if (!response.ok) throw new Error("Search index unavailable");
      return response.json();
    }).catch(() => {
      indexes.delete(url);
      return [];
    }));
  }
  return indexes.get(url);
}

export async function findPassages(pagefind, question, base, origin) {
  const words = [...new Set(tokens(question))].filter(word => !ignoredWords.has(word));
  if (!words.length) return [];
  const queryWords = new Set(words);
  const titleTerms = entry => [...new Set(tokens(entry.t))].filter(word => !titleNoise.has(word));
  const named = (await records(base, origin))
    .filter(entry => !entry.u.includes("#") && allowedUrl(entry.u, base, origin))
    .map(entry => {
      const terms = titleTerms(entry);
      const matches = terms.filter(term => queryWords.has(term));
      const score = matches.reduce((total, term) => total + (/\d/.test(term) ? 4 : 1), 0);
      return { entry, matches, score: terms.length ? score / terms.length : 0 };
    })
    .filter(item => item.score)
    .sort((a, b) => b.score - a.score)[0];
  const concise = words.filter(word => word !== "freq" && word !== "frequency");
  const queries = [...new Set([concise.join(" "), named?.matches.join(" "), words.slice(0, 2).join(" "), words.slice(-2).join(" ")].filter(Boolean))];
  const pages = new Map();
  await Promise.all(queries.map(async query => {
    const { results } = await pagefind.search(query);
    await Promise.all(results.slice(0, 8).map(async result => {
      const page = await result.data();
      if (allowedUrl(page.url, base, origin) && !pages.has(page.url)) pages.set(page.url, page);
    }));
  }));
  const scoreText = text => [...new Set(tokens(text))].filter(word => queryWords.has(word)).length;
  const candidates = [];
  for (const page of pages.values()) {
    const title = page.meta?.title ?? page.url;
    const record = page.url === named?.entry.u;
    const bonus = record ? 5 : 0;
    if (page.plain_excerpt) {
      candidates.push({ url: page.url, title, excerpt: page.plain_excerpt, score: scoreText(page.plain_excerpt) + bonus + (record ? 1 : 0) });
    }
    for (const section of page.sub_results ?? []) {
      if (!section.url.startsWith(page.url + "#") || !section.plain_excerpt || /#(?:sources(?:-title)?|[^#]*fig-title)$/.test(section.url)) continue;
      candidates.push({ url: section.url, title: [...new Set([title, section.title].filter(Boolean))].join(" · "), excerpt: section.plain_excerpt, score: scoreText(section.plain_excerpt) + bonus });
    }
  }
  if (named && !pages.has(named.entry.u) && named.entry.d) {
    candidates.push({ url: named.entry.u, title: named.entry.t, excerpt: named.entry.d, score: 5 });
  }
  const selected = new Map();
  candidates.sort((a, b) => b.score - a.score || a.url.localeCompare(b.url));
  for (const { score, ...passage } of candidates) {
    if (score > 0 && !selected.has(passage.url)) selected.set(passage.url, passage);
    if (selected.size === 3) break;
  }
  return [...selected.values()];
}
