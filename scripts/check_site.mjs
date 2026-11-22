import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const basePath = (process.argv[2] ?? "/").replace(/\/+$/, "");
const base = `${basePath}/`;
const carrierRegistry = JSON.parse(await readFile(path.join(root, 'src/data/carriers.json'), 'utf8'));

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

const encyclopediaCategories = [
  "aircraft", "ordnance", "threat-systems", "radar-sensors",
  "carriers", "locations", "terminology", "reference-data",
].map((slug) => `encyclopedia/${slug}/`);

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
  "encyclopedia/locations/carriers",
  "encyclopedia/locations/theatres",
  ...carrierRegistry.flatMap((entry) => [`encyclopedia/carriers/${entry.slug}`, `encyclopedia/locations/carriers/${entry.slug}`]),
  ...encyclopediaCategories,
  "training",
];

for (const route of requiredRoutes) await stat(pageFile(route));
await stat(path.join(output, "404.html"));

const htmlFiles = (await filesIn(output)).filter((filename) => filename.endsWith(".html"));
assert.ok(htmlFiles.length >= requiredRoutes.length, "all catalogue routes should be emitted");

// Catalogue destinations with nothing published still build, so their URLs stay
// stable, but carry `data-empty` and stay linked for Manual groups and Encyclopedia categories.
const pages = new Map(await Promise.all(htmlFiles.map(async (filename) => [filename, await readFile(filename, "utf8")])));
const isEmpty = (html) => /<main\b[^>]*\bdata-empty\b/.test(html);
const emptyPages = new Set([...pages].filter(([, html]) => isEmpty(html)).map(([filename]) => filename));

const canLinkEmpty = (route) => route.startsWith("manual/") || encyclopediaCategories.includes(route);

for (const [filename, html] of pages) {
  const relativePage = path.relative(output, filename).split(path.sep).join("/");
  if (!(emptyPages.has(filename) && canLinkEmpty(relativePage.replace(/index\.html$/, ""))))
    assert.doesNotMatch(html, /coming soon/i, `${relativePage} should not label unavailable destinations Coming soon`);
  if (emptyPages.has(filename))
    assert.doesNotMatch(html, /data-(?:module|experience|record)-id=/, `${relativePage} lists content but is marked empty`);
}

for (const [filename, html] of pages) {
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
    assert.ok(!emptyPages.has(candidate) || canLinkEmpty(relative), `${relativePage} links to ${relative || "/"}, which has nothing published`);
  }
}

// The compact index links every category. Only the current category is inlined
// on a destination page; the other category trees are fetched on expansion.
const encyclopediaMenu = (html) => html?.match(/<nav aria-label="Encyclopedia menu">([\s\S]*?)<\/nav>/)?.[1];
const links = (html) => [...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1]);
const indexMenu = encyclopediaMenu(pages.get(pageFile("encyclopedia")));
assert.ok(indexMenu, "the Encyclopedia index should have a menu");
assert.deepEqual(links(indexMenu), encyclopediaCategories.map((route) => base + route));

for (const category of encyclopediaCategories) {
  const filename = pageFile(category);
  const slug = category.split("/")[1];
  const fragmentPath = `encyclopedia-menu/${slug}.json`;
  assert.ok(links(encyclopediaMenu(pages.get(filename))).includes(base + category));
  if (emptyPages.has(filename)) {
    assert.ok(!indexMenu.includes(`data-lazy="${base}${fragmentPath}"`), `${category} has no records to load`);
    continue;
  }

  assert.ok(indexMenu.includes(`data-lazy="${base}${fragmentPath}"`), `${category} should load its records on demand`);
  const { html } = JSON.parse(await readFile(path.join(output, fragmentPath), "utf8"));
  const destinations = links(html);
  const inlineLinks = links(encyclopediaMenu(pages.get(filename))).filter((href) => href.startsWith(base + category) && href !== base + category);
  assert.deepEqual(destinations, inlineLinks, `${category} should list the same records when loaded on demand`);
  const expectedLinks = [...pages].flatMap(([file, page]) => {
    const route = path.relative(output, file).split(path.sep).join("/").replace(/index\.html$/, "");
    return route !== category && route.startsWith(category) && /<nav class="primary-nav"/.test(page)
      ? [base + route]
      : [];
  });
  const locationLinks = slug === "locations";
  const pageLinks = locationLinks ? [...new Set(destinations.filter((href) => !href.includes("#")))] : destinations;
  assert.deepEqual([...pageLinks].sort(), expectedLinks.sort(), `${category} should list every page in the category`);
  if (locationLinks) {
    for (const href of destinations.filter((destination) => destination.includes("#"))) {
      const [route, anchor] = href.slice(base.length).split("#");
      assert.ok(pages.get(pageFile(route))?.includes(`id="${anchor}"`), `${href} should link to an airfield row`);
    }
  }
  for (const href of [base + category, ...pageLinks]) {
    const page = pages.get(pageFile(href.slice(base.length)));
    const menu = encyclopediaMenu(page);
    assert.ok(menu, `${href} should have an Encyclopedia menu`);
    const current = [...menu.matchAll(/<a\b[^>]*\baria-current="page"[^>]*>/g)].map((match) => match[0]);
    assert.deepEqual(links(current.join("")), [href], `${href} should be the only current menu link`);
    assert.doesNotMatch(page, /<nav class="record-nav"/, `${href} should use breadcrumbs for record navigation`);
    const breadcrumbs = page.match(/<nav class="breadcrumbs"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
    assert.ok(breadcrumbs, `${href} should have breadcrumbs`);
    const parents = href === base + category ? [`${base}encyclopedia/`] : [`${base}encyclopedia/`, base + category];
    assert.deepEqual(links(breadcrumbs).slice(0, parents.length), parents, `${href} should link to its Encyclopedia parents`);
    assert.match(breadcrumbs, /<span aria-current="page">/, `${href} should mark the current breadcrumb`);
  }
}

// The Syria page opens its parent theatre in the sidebar and lists its airfields beneath it.
const syriaMenu = encyclopediaMenu(pages.get(pageFile("encyclopedia/locations/dcs-syria/")));
if (syriaMenu) {
  const openBranches = [...syriaMenu.matchAll(/<details\b[^>]*\bopen(?=\s|>)[^>]*>\s*<summary>([\s\S]*?)<\/summary>/g)];
  const parentLinks = ["", "theatres/", "middle-east/", "dcs-syria/"].map((route) => `${base}encyclopedia/locations/${route}`);
  assert.deepEqual(openBranches.flatMap((match) => links(match[1])), parentLinks);
  const syria = syriaMenu.slice(openBranches.at(-1).index).split("</details>")[0];
  assert.ok(links(syria).includes(`${base}encyclopedia/locations/ramat-david/`), "Ramat David should be nested under Syria");
}

// These pages have URLs that skip a level or use an older subject name.
const manualPaths = [
  ["abnormal-operations/threat-avoidance/", ["tactics/", "tactics/threat-avoidance/"]],
  ["aircraft-procedures/f-16c/engine-start/", ["aircraft-procedures/", "aircraft-procedures/f-16c/", "aircraft-procedures/f-16c/ground/"]],
];
for (const [route, parents] of manualPaths) {
  const page = pages.get(pageFile(`manual/${route}`));
  const breadcrumbs = page.match(/<nav class="breadcrumbs"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(breadcrumbs, `manual/${route} should have breadcrumbs`);
  assert.deepEqual(links(breadcrumbs), [`${base}manual/`, ...parents.map((parent) => `${base}manual/${parent}`)]);
}

const locations = pages.get(pageFile("encyclopedia/locations/"));
const simTable = locations.match(/<table class="airfield-table sim-airfield-table">([\s\S]*?)<\/table>/)?.[1];
assert.ok(simTable, "Locations should have a simulator airfield table");
const simRows = [...simTable.matchAll(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/g)].filter(([, attrs]) => attrs.includes("data-filter-item"));
assert.ok(simRows.length > 0, "the simulator airfield table should contain filterable rows");
for (const [, attrs, row] of simRows) {
  const map = attrs.match(/data-facet-map="([^" ]+)"/)?.[1];
  assert.ok(map, "each simulator airfield row should match just one map");
  assert.ok(links(row).some((href) => href.startsWith(`${base}encyclopedia/locations/${map}/#af-`)), "the row link must use its own map");
  assert.match(row, /<th scope="row">/, "a filtered row should have its own airfield name");
}

console.log(`Generated-site checks passed: ${htmlFiles.length} pages, base ${base}`);
