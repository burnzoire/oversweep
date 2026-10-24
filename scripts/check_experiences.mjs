import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Generated-output checks for every registered experience. Published entries
// must ship complete and visibly carry their maturity; excluded entries must not
// leak into normal builds. `--review` treats every entry as included.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function loadExperiences() {
  return JSON.parse(await readFile(path.join(root, "src/data/experiences.json"), "utf8"));
}

const route = (e) => `manual/${e.subject}/${e.slug}/`;
const frame = (e) => `experiences/${e.slug}/`;

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  }));
  return nested.flat();
}

export async function checkExperiences({ dist, experiences, review = false, base = "" }) {
  const read = (file) => readFile(path.join(dist, file), "utf8").catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  const problems = [];
  const excluded = experiences.filter((e) => e.publication !== "published" && !review);
  for (const e of experiences) {
    if (!["published", "excluded"].includes(e.publication)) problems.push(`${e.id}: unknown publication "${e.publication}".`);
    if (excluded.includes(e)) {
      for (const file of [`${route(e)}index.html`, `${frame(e)}index.html`, ...e.assets.map((a) => frame(e) + a)])
        if (await read(file) !== null) problems.push(`${e.id} is excluded but ${file} was emitted.`);
      continue;
    }
    const marker = `data-experience-id="${e.id}"`;
    const revision = `data-experience-revision="${e.revision}"`;
    const pages = {
      wrapper: await read(`${route(e)}index.html`),
      frame: await read(`${frame(e)}index.html`),
      "subject index": await read(`manual/${e.subject}/index.html`),
      "Training Library": await read("training/index.html"),
    };
    for (const [name, html] of Object.entries(pages)) {
      if (html === null) { problems.push(`${e.id}: ${name} page is missing.`); continue; }
      if (!html.includes(marker) || !html.includes(revision))
        problems.push(`${e.id}: ${name} lacks the registered id or revision ${e.revision}.`);
      if (name !== "frame" && !html.includes(e.maturity))
        problems.push(`${e.id}: ${name} does not show maturity "${e.maturity}".`);
    }
    const href = `href="${base}/${route(e)}"`;
    for (const name of ["subject index", "Training Library"])
      if (pages[name] && !pages[name].includes(href)) problems.push(`${e.id}: ${name} does not link to ${base}/${route(e)}.`);
    if (pages.wrapper && !new RegExp(`<iframe[^>]*src="${base}/${frame(e)}"`).test(pages.wrapper))
      problems.push(`${e.id}: wrapper does not embed ${base}/${frame(e)}.`);
    for (const asset of e.assets) {
      if (!(await read(frame(e) + asset))?.trim()) problems.push(`${e.id}: asset ${asset} is missing or empty.`);
      if (pages.frame && !pages.frame.includes(`"${asset}"`)) problems.push(`${e.id}: frame does not reference ${asset}.`);
    }
  }
  // Fail closed for excluded entries across every output file, not just known routes.
  if (excluded.length) {
    for (const file of await filesIn(dist)) {
      const text = await readFile(file, "utf8");
      for (const e of excluded)
        if (text.includes(`data-experience-id="${e.id}"`)) problems.push(`${e.id} is excluded but referenced in ${path.relative(dist, file)}.`);
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const review = process.argv.includes("--review");
  const base = (process.argv.find((a) => a.startsWith("--base="))?.slice(7) ?? "").replace(/\/+$/, "");
  const experiences = await loadExperiences();
  const problems = await checkExperiences({ dist: path.join(root, "dist"), experiences, review, base });
  if (problems.length) {
    console.error(problems.map((p) => `- ${p}`).join("\n"));
    process.exit(1);
  }
  const shipped = experiences.filter((e) => review || e.publication === "published").map((e) => e.slug);
  console.log(`Experience output checks passed (${review ? "review" : "production"}, base ${base || "/"}): ${shipped.join(", ") || "none included"}`);
}
