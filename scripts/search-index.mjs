import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as pagefind from "pagefind";
import { htmlFiles, indexable } from "./seo-files.mjs";

// Writes search-index.json into the build output for the site search
// (src/scripts/site-search.mjs). It indexes the same pages the sitemap lists,
// from the built HTML, so new modules and records are found without any
// registry to keep: each page's title, where it sits (breadcrumbs), its
// description and its section headings, plus every A–Z glossary term as its
// own entry linking to its anchor. It also writes a Pagefind full-text index
// (dist/pagefind/) over the same pages, split into small chunks a search
// downloads only as it needs them, for words that are only in the body text.

const entities = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘", hellip: "…" };
export const decode = (text) => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
  if (code[0] === "#") return String.fromCodePoint(code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1)));
  return entities[code.toLowerCase()] ?? match;
});

// Visible text of an HTML fragment, leaving out term-link hover previews.
export function textOf(html) {
  let skip = 0;
  let out = "";
  for (const part of html.split(/(<[^>]+>)/)) {
    if (!part.startsWith("<")) {
      if (!skip) out += part;
      continue;
    }
    if (/^<span\b/.test(part)) {
      if (skip || /class="[^"]*\bterm-tip\b/.test(part)) skip += 1;
    } else if (/^<\/span>/.test(part) && skip) {
      skip -= 1;
    }
  }
  return decode(out).replace(/\s+/g, " ").trim();
}

const clip = (text, max = 220) => (text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text);
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

// Headings that are page furniture rather than topics.
const skipHeading = /^(sources(-title)?|contents-title|plate-title|terms(-title)?|related(-title)?)$/;
const maxHeadings = 40;

const sectionLabel = { manual: "Manual", encyclopedia: "Encyclopedia", training: "Training Library", experiences: "Training Library" };

export function pageEntries(html, url, { glossary = false } = {}) {
  const main = html.match(/<main\b[\s\S]*<\/main>/)?.[0] ?? html;
  const title = textOf(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "")
    || decode(html.match(/<title>([^<|]*)/)?.[1] ?? "").trim();
  if (!title) return [];
  const crumbs = [...(main.match(/<nav class="breadcrumbs"[\s\S]*?<\/nav>/)?.[0] ?? "").matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map((match) => textOf(match[1]));
  const top = url.split("/").filter(Boolean)[0];
  const section = crumbs.length > 1 ? crumbs.slice(0, -1).join(" › ") : (sectionLabel[top] && sectionLabel[top] !== title ? sectionLabel[top] : "");
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "");
  const headings = [];
  for (const match of main.matchAll(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/g)) {
    const id = attr(match[2], "id");
    if (!id || skipHeading.test(id) || /\bfig-title\b/.test(attr(match[2], "class") ?? "")) continue;
    const text = textOf(match[3]);
    if (text && text !== title && headings.length < maxHeadings) headings.push([id, text]);
  }
  const entries = [{ u: url, t: title, s: section, d: description, ...(headings.length ? { h: headings } : {}) }];
  // The A–Z glossary: one entry per term (term-set pages repeat them).
  if (glossary) for (const match of main.matchAll(/<div class="term" id="([^"]+)"[^>]*>([\s\S]*?)<\/dd>/g)) {
    const word = textOf(match[2].match(/<span class="term-word">([\s\S]*?)<\/span>/)?.[1] ?? "");
    const definition = textOf(match[2].match(/<p class="term-def">([\s\S]*?)<\/p>/)?.[1] ?? "");
    const sets = [...match[2].matchAll(/<p class="term-set">([\s\S]*?)<\/p>/g)].map((set) => textOf(set[1])).join(", ");
    if (word) entries.push({ u: `${url}#${match[1]}`, t: word, s: sets ? `Glossary › ${sets}` : "Glossary", d: clip(definition), g: 1 });
  }
  return entries;
}

export function searchIndex() {
  let base = "/";
  return {
    name: "oversweep-search-index",
    hooks: {
      "astro:config:done": ({ config }) => {
        base = config.base.endsWith("/") ? config.base : `${config.base}/`;
      },
      "astro:build:done": async ({ dir, logger }) => {
        const output = fileURLToPath(dir);
        const entries = [];
        const { index: fullText } = await pagefind.createIndex({
          rootSelector: "main",
          excludeSelectors: ["nav", ".subject-nav", ".term-tip", "script", "style", "svg"],
          forceLanguage: "en",
        });
        for (const file of (await htmlFiles(output)).sort()) {
          const html = await readFile(file, "utf8");
          if (!indexable(html)) continue;
          const route = path.relative(output, path.dirname(file)).split(path.sep).join("/");
          // The home page and search page are not results; 404 is not a page.
          if (route === "" || route === "404" || route === "search") continue;
          entries.push(...pageEntries(html, `${base}${route}/`, { glossary: route === "encyclopedia/terminology" }));
          await fullText.addHTMLFile({ url: `${base}${route}/`, content: html });
        }
        await fullText.writeFiles({ outputPath: path.join(output, "pagefind") });
        await pagefind.close();
        await writeFile(path.join(output, "search-index.json"), JSON.stringify(entries));
        logger.info(`search-index.json has ${entries.length} entries.`);
      },
    },
  };
}
