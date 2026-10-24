import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const basePath = (process.argv[2] ?? "/").replace(/\/+$/, "");
const base = `${basePath}/`;

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  }));
  return nested.flat();
}

function pageFile(route) {
  const relative = route.replace(/^\/+|\/+$/g, "");
  return path.join(output, relative, "index.html");
}

const requiredRoutes = [
  "",
  "manual",
  ...[
    "flight-fundamentals",
    "airfield-operations",
    "radio-communications",
    "navigation",
    "instrument-flight",
    "flight-planning",
    "formation-flying",
    "air-to-air-refuelling",
    "naval-operations",
    "air-combat",
    "sensors-situational-awareness",
    "air-to-ground-operations",
    "abnormal-operations",
  ].map((slug) => `manual/${slug}`),
  "encyclopedia",
  ...[
    "aircraft",
    "ordnance",
    "threat-systems",
    "radar-sensors",
    "airfields-carriers",
    "terminology",
    "reference-data",
  ].map((slug) => `encyclopedia/${slug}`),
  "training",
];

for (const route of requiredRoutes) {
  const filename = pageFile(route);
  await stat(filename);
  const html = await readFile(filename, "utf8");
  if (route) {
    assert.match(html, /Coming soon/i, `${route} should be marked Coming soon`);
  }
}
await stat(path.join(output, "404.html"));

const htmlFiles = (await filesIn(output)).filter((filename) => filename.endsWith(".html"));
assert.ok(htmlFiles.length >= requiredRoutes.length, "all catalogue routes should be emitted");

for (const filename of htmlFiles) {
  const html = await readFile(filename, "utf8");
  const primaryNav = html.match(/<nav class="primary-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
  const currentPrimaryLinks = [...primaryNav.matchAll(/aria-current="page"/g)].length;
  const relativePage = path.relative(output, filename).split(path.sep).join("/");
  const isSectionIndex = /^(manual|encyclopedia|training)\/index\.html$/.test(relativePage);
  assert.equal(currentPrimaryLinks, Number(isSectionIndex), `${relativePage} should mark only its exact primary destination current`);
  assert.equal(/<a class="brand"[^>]*aria-current="page"/.test(html), relativePage === "index.html", `${relativePage} should mark only the home destination current`);

  // Resolve relative links like a browser: against <base href> when present, else the page URL.
  const pageURL = new URL(relativePage.replace(/index\.html$/, ""), `https://oversweep.test${base}`);
  const documentBase = html.match(/<base href="([^"]+)"/)?.[1];
  const resolveFrom = documentBase ? new URL(documentBase, pageURL) : pageURL;
  const attributes = html.replace(/<base [^>]*>/, "").matchAll(/\b(?:href|src|poster)="([^"]+)"/g);
  for (const [, value] of attributes) {
    if (value.startsWith("#") || value.startsWith("mailto:") || value.startsWith("tel:")) continue;
    const url = new URL(value, resolveFrom);
    if (url.origin !== "https://oversweep.test") continue;
    assert.ok(url.pathname.startsWith(base), `internal URL must respect the base path: ${value}`);
    const relative = decodeURIComponent(url.pathname.slice(base.length));
    const destination = path.join(output, relative);
    const candidate = relative && path.extname(relative)
      ? destination
      : path.join(destination, "index.html");
    await stat(candidate);
  }
}

console.log(`Generated-site checks passed: ${htmlFiles.length} pages, base ${base}`);
