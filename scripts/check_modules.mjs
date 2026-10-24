import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Generated-output checks for every registered trainer-less module. Published
// modules must ship their page and subject listing with visible maturity and
// revision, and carry no trainer; excluded modules must not leak into normal
// builds. `--review` treats every entry as included.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function loadModules() {
  return JSON.parse(await readFile(path.join(root, "src/data/modules.json"), "utf8"));
}

const route = (m) => `manual/${m.subject}/${m.slug}/`;

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  }));
  return nested.flat();
}

export async function checkModules({ dist, modules, review = false, base = "" }) {
  const read = (file) => readFile(path.join(dist, file), "utf8").catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
  });
  const problems = [];
  const excluded = modules.filter((m) => m.publication !== "published" && !review);
  for (const m of modules) {
    if (!["published", "excluded"].includes(m.publication)) problems.push(`${m.id}: unknown publication "${m.publication}".`);
    if (excluded.includes(m)) {
      if (await read(`${route(m)}index.html`) !== null) problems.push(`${m.id} is excluded but ${route(m)}index.html was emitted.`);
      continue;
    }
    const marker = `data-module-id="${m.id}"`;
    const revision = `data-module-revision="${m.revision}"`;
    const pages = { page: await read(`${route(m)}index.html`), "subject index": await read(`manual/${m.subject}/index.html`) };
    for (const [name, html] of Object.entries(pages)) {
      if (html === null) { problems.push(`${m.id}: ${name} is missing.`); continue; }
      if (!html.includes(marker) || !html.includes(revision))
        problems.push(`${m.id}: ${name} lacks the registered id or revision ${m.revision}.`);
      if (!html.includes(m.maturity)) problems.push(`${m.id}: ${name} does not show maturity "${m.maturity}".`);
    }
    if (pages["subject index"] && !pages["subject index"].includes(`href="${base}/${route(m)}"`))
      problems.push(`${m.id}: subject index does not link to ${base}/${route(m)}.`);
    // A module without a trainer must not frame or launch one.
    if (pages.page && (/<iframe\b/.test(pages.page) || pages.page.includes("data-experience-launch")))
      problems.push(`${m.id}: page embeds or launches a trainer.`);
  }
  if (excluded.length) {
    for (const file of await filesIn(dist)) {
      const text = await readFile(file, "utf8");
      for (const m of excluded)
        if (text.includes(`data-module-id="${m.id}"`)) problems.push(`${m.id} is excluded but referenced in ${path.relative(dist, file)}.`);
    }
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const review = process.argv.includes("--review");
  const base = (process.argv.find((a) => a.startsWith("--base="))?.slice(7) ?? "").replace(/\/+$/, "");
  const modules = await loadModules();
  const problems = await checkModules({ dist: path.join(root, "dist"), modules, review, base });
  if (problems.length) {
    console.error(problems.map((p) => `- ${p}`).join("\n"));
    process.exit(1);
  }
  const shipped = modules.filter((m) => review || m.publication === "published").map((m) => m.slug);
  console.log(`Module output checks passed (${review ? "review" : "production"}, base ${base || "/"}): ${shipped.join(", ") || "none included"}`);
}
