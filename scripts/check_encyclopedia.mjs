import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Generated-output checks for every registered encyclopedia record. Published
// records must ship their page and category listing with visible maturity and
// revision, list their sources, credit any photo, and have a content file; excluded records must
// not leak into normal builds. `--review` treats every entry as included.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function loadRecords() {
  return JSON.parse(await readFile(path.join(root, "src/data/encyclopedia.json"), "utf8"));
}

const route = (r) => `encyclopedia/${r.category}/${r.slug}/`;
export const contentFile = (r) => `content/encyclopedia/${r.category}/${r.slug}.md`;

// The <section> element carrying a record's marker, so one card cannot mask another.
export function recordSection(html, id) {
  const at = html.indexOf(`data-record-id="${id}"`);
  if (at < 0) return null;
  const start = html.lastIndexOf("<section", at);
  const end = html.indexOf("</section>", at);
  if (start < 0 || end < 0) return null;
  return { tag: html.slice(start, html.indexOf(">", at) + 1), body: html.slice(start, end) };
}

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  }));
  return nested.flat();
}

export async function checkRecords({ dist, records, review = false, base = "", contentRoot = root }) {
  const read = (file) => readFile(path.join(dist, file), "utf8").catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  const problems = [];
  const seen = new Set();
  const excluded = records.filter((r) => r.publication !== "published" && !review);
  for (const r of records) {
    if (seen.has(r.id)) problems.push(`${r.id}: duplicate id.`);
    seen.add(r.id);
    if (!["published", "excluded"].includes(r.publication)) problems.push(`${r.id}: unknown publication "${r.publication}".`);
    if (await access(path.join(contentRoot, contentFile(r))).then(() => false, () => true))
      problems.push(`${r.id}: ${contentFile(r)} is missing.`);
    if (excluded.includes(r)) {
      if (await read(`${route(r)}index.html`) !== null) problems.push(`${r.id} is excluded but ${route(r)}index.html was emitted.`);
      continue;
    }
    const revision = `data-record-revision="${r.revision}"`;
    const pages = { page: await read(`${route(r)}index.html`), "category index": await read(`encyclopedia/${r.category}/index.html`) };
    const sections = {};
    for (const [name, html] of Object.entries(pages)) {
      if (html === null) { problems.push(`${r.id}: ${name} is missing.`); continue; }
      const section = sections[name] = recordSection(html, r.id);
      if (!section || !section.tag.includes(revision))
        problems.push(`${r.id}: ${name} lacks the registered id or revision ${r.revision}.`);
      if (!section?.body.includes(r.maturity)) problems.push(`${r.id}: ${name} does not show maturity "${r.maturity}".`);
    }
    if (pages["category index"] && !sections["category index"]?.body.includes(`href="${base}/${route(r)}"`))
      problems.push(`${r.id}: category index does not link to ${base}/${route(r)}.`);
    // Aircraft cards carry their era so the list's era filter can show or hide them.
    if (r.category === "aircraft" && pages["category index"] && !sections["category index"]?.tag.includes(`data-era="${r.era}"`))
      problems.push(`${r.id}: category index card has no data-era="${r.era}".`);
    // Every record shows where its facts come from, and every citation resolves.
    if (pages.page) {
      const anchors = new Set([...pages.page.matchAll(/\bid="(source-\d+)"/g)].map((m) => m[1]));
      if (!anchors.size) problems.push(`${r.id}: page lists no sources.`);
      for (const [, target] of pages.page.matchAll(/href="#(source-\d+)"/g))
        if (!anchors.has(target)) problems.push(`${r.id}: citation #${target} has no source entry.`);
      // A bare "[n]" outside a link is a citation the reader cannot follow.
      const text = pages.page.replace(/<a\b[^>]*>[\s\S]*?<\/a>/g, "").replace(/<(script|style)\b[\s\S]*?<\/\1>/g, "");
      for (const [marker] of text.matchAll(/\[\d+\]/g)) problems.push(`${r.id}: citation ${marker} is not linked to its source.`);
      if (!/class="record-body"[^>]*>\s*<[a-z]/.test(pages.page)) problems.push(`${r.id}: page has no record text.`);
      // Aircraft and ordnance records lead with a credited photograph (check_site checks the file ships).
      if (["aircraft", "ordnance"].includes(r.category) && !/<figure class="photo lead\b[^"]*"[\s\S]*?class="credit"/.test(pages.page)) problems.push(`${r.id}: page has no credited lead photo.`);
      // A photo must be self-hosted, described for screen readers and credited.
      for (const [figure] of pages.page.matchAll(/<figure class="record-photo"[\s\S]*?<\/figure>/g)) {
        const src = figure.match(/<img\b[^>]*\bsrc="([^"]*)"/)?.[1] ?? "";
        if (!src.startsWith(`${base}/`) || await access(path.join(dist, decodeURI(src.slice(base.length)))).then(() => false, () => true))
          problems.push(`${r.id}: photo ${src || "(no src)"} is not a file in the site.`);
        if (!/<img\b[^>]*\balt="[^"]+"/.test(figure)) problems.push(`${r.id}: photo has no alt text.`);
        if (!/class="credit"[\s\S]*Credit:[\s\S]*<a href="https:\/\//.test(figure)) problems.push(`${r.id}: photo is not credited to its source page.`);
      }
    }
  }
  // The landing page is a grid of categories; records are listed only on their category's page.
  const landing = await read("encyclopedia/index.html");
  if (landing?.includes("data-record-id=")) problems.push("encyclopedia/index.html lists records; it should only show categories.");
  // Module pages link words to the Terminology glossary; every link must land on an entry.
  const glossary = await read("encyclopedia/terminology/index.html");
  if (glossary !== null) {
    const ids = new Set([...glossary.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
    const link = new RegExp(`href="${escape(base)}/encyclopedia/terminology/#([^"]+)"`, "g");
    for (const file of (await filesIn(dist)).filter((f) => f.endsWith(".html"))) {
      for (const [, id] of (await readFile(file, "utf8")).matchAll(link))
        if (!ids.has(id)) problems.push(`${path.relative(dist, file)} links to glossary entry #${id}, which does not exist.`);
    }
  }
  if (excluded.length) {
    for (const file of await filesIn(dist)) {
      const text = await readFile(file, "utf8");
      for (const r of excluded) {
        const link = new RegExp(`(?:href|src)="[^"]*/${escape(route(r))}(?:index\\.html)?"`);
        if (text.includes(`data-record-id="${r.id}"`) || link.test(text))
          problems.push(`${r.id} is excluded but referenced in ${path.relative(dist, file)}.`);
      }
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const review = process.argv.includes("--review");
  const base = (process.argv.find((a) => a.startsWith("--base="))?.slice(7) ?? "").replace(/\/+$/, "");
  const records = await loadRecords();
  const problems = await checkRecords({ dist: path.join(root, "dist"), records, review, base });
  if (problems.length) {
    console.error(problems.map((p) => `- ${p}`).join("\n"));
    process.exit(1);
  }
  const shipped = records.filter((r) => review || r.publication === "published").map((r) => r.slug);
  console.log(`Encyclopedia output checks passed (${review ? "review" : "production"}, base ${base || "/"}): ${shipped.join(", ") || "none included"}`);
}
