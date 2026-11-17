const collections = ["manual/", "encyclopedia/", "training/", "experiences/"];
const ignoredWords = new Set("a an are can could does do explain for how i in is it me of on please should tell the to was what when where which who why will with would you".split(" "));

function allowedUrl(value, base, origin) {
  const url = new URL(value, origin);
  return url.origin === origin && collections.some((collection) => url.pathname.startsWith(base + collection));
}

export async function findPassages(pagefind, question, base, origin) {
  const words = [...new Set(question.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])]
    .filter((word) => !ignoredWords.has(word));
  if (!words.length) return [];

  // Shorter phrases recover matches when the full question is too specific.
  const concise = words.filter(word => word !== "freq" && word !== "frequency");
  const queries = [...new Set([concise.join(" "), words.join(" "), words.slice(0, 3).join(" "), words.slice(-3).join(" "), words.slice(0, 2).join(" "), words.slice(-2).join(" ")])];
  for (const query of queries.filter(Boolean)) {
    const terms = query.split(" ");
    const score = (part) => terms.filter(term => part.plain_excerpt.toLowerCase().includes(term)).length;
    const { results } = await pagefind.search(query);
    const pages = await Promise.all(results.slice(0, 12).map((result) => result.data()));
    const passages = pages.filter((page) => allowedUrl(page.url, base, origin)).flatMap((page) => {
      const section = page.sub_results
        ?.filter(part => part.url.startsWith(page.url + "#") && part.plain_excerpt && !/#(?:sources(?:-title)?|[^#]*fig-title)$/.test(part.url))
        .sort((a, b) => score(b) - score(a))[0];
      const url = section?.url ?? page.url;
      const title = [page.meta?.title, section?.title].filter(Boolean);
      const excerpt = section?.plain_excerpt ?? page.plain_excerpt;
      return excerpt ? [{ url, title: [...new Set(title)].join(" · ") || url, excerpt }] : [];
    }).slice(0, 3);
    if (passages.length) return passages;
  }
  return [];
}
