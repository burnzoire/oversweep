// Site search over search-index.json (written at build time by
// scripts/search-index.mjs). Matching is forgiving of designator punctuation,
// so "sa10", "SA 10" and "SA-10" all find the SA-10, and every query word must
// match somewhere (title, headings, where it sits, or description).

/** Lower case, accents dropped, punctuation inside a designator removed
 *  ("F/A-18E" → "fa18e"), everything else split into words. */
export function normalize(text) {
  return String(text)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/(?<=[a-z0-9])[-/.'’]+(?=[a-z0-9])/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// 3: a whole word; 2: the start of a word; 1: inside a word (3+ letters).
function fieldScore(text, token) {
  if (!text) return 0;
  const padded = ` ${text} `;
  if (padded.includes(` ${token} `)) return 3;
  if (padded.includes(` ${token}`)) return 2;
  return token.length >= 3 && text.includes(token) ? 1 : 0;
}

function prepare(entry) {
  return {
    entry,
    title: normalize(entry.t),
    section: normalize(entry.s ?? ""),
    description: normalize(entry.d ?? ""),
    headings: (entry.h ?? []).map(([id, text]) => ({ id, text, norm: normalize(text) })),
  };
}

export function prepareIndex(entries) {
  return entries.map(prepare);
}

function scoreTokens(doc, tokens) {
  let total = 0;
  for (const token of tokens) {
    const best = Math.max(
      fieldScore(doc.title, token) * 10,
      Math.max(0, ...doc.headings.map((heading) => fieldScore(heading.norm, token))) * 4,
      fieldScore(doc.section, token) * 2,
      // One- and two-letter words only count in names, not in prose.
      token.length > 2 ? fieldScore(doc.description, token) * 2 : 0,
    );
    if (!best) return 0;
    total += best;
  }
  return total;
}

/** Ranked results: [{ entry, score, headings: [{id, text}] }]. */
export function search(index, query, limit = 30) {
  const phrase = normalize(query);
  if (!phrase) return [];
  const tokens = phrase.split(" ");
  // "sa 10" should also find "SA-10", which normalises to one word.
  const joined = tokens.length > 1 ? [tokens.join("")] : null;
  const results = [];
  for (const doc of index) {
    let score = scoreTokens(doc, tokens);
    if (joined) score = Math.max(score, scoreTokens(doc, joined));
    if (!score) continue;
    if (doc.title === phrase || (joined && doc.title === joined[0])) score += 60;
    else if (doc.title.startsWith(phrase)) score += 25;
    if (doc.entry.g) score -= 1;
    const headings = doc.headings
      .filter((heading) => tokens.every((token) => fieldScore(heading.norm, token)) || (joined && fieldScore(heading.norm, joined[0])))
      .slice(0, 3);
    results.push({ entry: doc.entry, score, headings, length: doc.title.length });
  }
  results.sort((a, b) => b.score - a.score || a.length - b.length || a.entry.t.localeCompare(b.entry.t));
  return results.slice(0, limit);
}

// ---------------------------------------------------------------- interface

let indexPromise;
function loadIndex(url) {
  indexPromise ??= fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    })
    .then(prepareIndex)
    .catch((error) => {
      indexPromise = undefined;
      throw error;
    });
  return indexPromise;
}

let pagefindPromise;
function loadPagefind(url) {
  pagefindPromise ??= import(/* @vite-ignore */ url)
    .then(async (pagefind) => {
      await pagefind.options({ excerptLength: 22 });
      return pagefind;
    })
    .catch((error) => {
      pagefindPromise = undefined;
      throw error;
    });
  return pagefindPromise;
}

const escapeHtml = (text) => String(text).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function highlight(text, tokens) {
  const safe = escapeHtml(text);
  const words = tokens.filter((token) => token.length > 1).map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return safe;
  // Short words only highlight as whole words, so "sa" does not mark "SAM".
  const pattern = words.map((word) => (word.length > 2 ? word : `${word}\\b`)).join("|");
  return safe.replace(new RegExp(`\\b(${pattern})`, "gi"), "<mark>$1</mark>");
}

/** Wires one search box: an input, a results list and a status line. */
export function mountSearch(root) {
  const input = root.querySelector("[data-search-input]");
  const list = root.querySelector("[data-search-results]");
  const status = root.querySelector("[data-search-status]");
  const indexUrl = root.dataset.index;
  const pagefindUrl = root.dataset.pagefind;
  const limit = 30;
  let active = -1;
  let run = 0;

  const links = () => [...list.querySelectorAll("a.search-result-link")];
  const setActive = (next) => {
    const all = links();
    all.forEach((link) => link.classList.remove("is-active"));
    active = all.length ? (next + all.length) % all.length : -1;
    if (active < 0) return;
    all[active].classList.add("is-active");
    all[active].scrollIntoView({ block: "nearest" });
  };

  const renderName = ({ entry, headings }, tokens) => `
      <li class="search-result">
        <a class="search-result-link" href="${escapeHtml(entry.u)}">
          <span class="search-result-where">${escapeHtml(entry.s || "Oversweep")}</span>
          <span class="search-result-title">${highlight(entry.t, tokens)}</span>
          ${entry.d ? `<span class="search-result-text">${highlight(entry.d, tokens)}</span>` : ""}
        </a>
        ${headings.length ? `<ul class="search-result-sections">${headings.map((heading) =>
          `<li><a href="${escapeHtml(entry.u)}#${escapeHtml(heading.id)}"><span aria-hidden="true">§ </span>${highlight(heading.text, tokens)}</a></li>`).join("")}</ul>` : ""}
      </li>`;

  // A body-text match: Pagefind's excerpt is already escaped, with <mark>s.
  const renderText = ({ page, url, section, excerpt }) => `
      <li class="search-result search-result-fulltext">
        <a class="search-result-link" href="${escapeHtml(url)}">
          <span class="search-result-where">${escapeHtml(page.s || "Oversweep")}</span>
          <span class="search-result-title">${escapeHtml(page.t)}${section ? ` <span class="search-result-section">› ${escapeHtml(section)}</span>` : ""}</span>
          <span class="search-result-text">${excerpt}</span>
        </a>
      </li>`;

  const describe = (query, named, mentioned) => {
    if (!named && !mentioned) return `Nothing found for “${query}”. Try a shorter word or a designation such as SA-10.`;
    const parts = [];
    if (named) parts.push(`${named === limit ? `Top ${limit}` : named} ${named === 1 ? "result" : "results"} for “${query}”`);
    if (mentioned) parts.push(`${named ? "also mentioned on" : "Mentioned on"} ${mentioned} ${mentioned === 1 ? "page" : "pages"}`);
    return parts.join(", ");
  };

  async function update() {
    const query = input.value.trim();
    const current = ++run;
    root.dispatchEvent(new CustomEvent("search:query", { detail: query }));
    if (!query) {
      list.innerHTML = "";
      status.textContent = "";
      setActive(-1);
      return;
    }
    let index;
    try {
      index = await loadIndex(indexUrl);
    } catch {
      status.textContent = "Search is unavailable right now.";
      return;
    }
    if (current !== run) return;
    const results = search(index, query, limit);
    const tokens = normalize(query).split(" ");
    list.innerHTML = results.map((result) => renderName(result, tokens)).join("");
    status.textContent = results.length ? describe(query, results.length, 0) : "Searching page text…";
    setActive(results.length ? 0 : -1);

    // Then the words in the body text of pages not already listed.
    const mentioned = await fullTextSearch(query, index, new Set(results.map(({ entry }) => entry.u.split("#")[0])));
    if (current !== run || !mentioned) return;
    if (mentioned.length) {
      list.insertAdjacentHTML("beforeend", `<li class="search-group" aria-hidden="true">Mentioned in</li>${mentioned.map(renderText).join("")}`);
    }
    status.textContent = describe(query, results.length, mentioned.length);
    if (!results.length && mentioned.length) setActive(0);
  }

  async function fullTextSearch(query, index, listed) {
    if (!pagefindUrl) return [];
    let pagefind;
    try {
      pagefind = await loadPagefind(pagefindUrl);
    } catch {
      return [];
    }
    const found = await pagefind.debouncedSearch(query, {}, 200);
    if (!found) return null;
    const pages = new Map(index.filter((doc) => !doc.entry.g).map((doc) => [doc.entry.u, doc.entry]));
    const data = await Promise.all(found.results.slice(0, 12).map((result) => result.data()));
    return data
      .filter((item) => !listed.has(item.url) && pages.has(item.url))
      .slice(0, 10)
      .map((item) => {
        const sub = item.sub_results?.find((part) => part.url !== item.url) ?? item.sub_results?.[0];
        const page = pages.get(item.url);
        return {
          page,
          url: sub?.url ?? item.url,
          section: sub && sub.title !== page.t ? sub.title : "",
          excerpt: sub?.excerpt ?? item.excerpt,
        };
      });
  }

  input.addEventListener("input", update);
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive(active + (event.key === "ArrowDown" ? 1 : -1));
    } else if (event.key === "Enter") {
      const link = links()[active];
      if (link) {
        event.preventDefault();
        link.click();
      }
    }
  });
  return {
    update,
    warm: () => {
      loadIndex(indexUrl).catch(() => {});
      if (pagefindUrl) loadPagefind(pagefindUrl).catch(() => {});
    },
  };
}
