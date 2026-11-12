import assert from "node:assert/strict";
import { test } from "node:test";
import { pageEntries, textOf } from "../scripts/search-index.mjs";
import { normalize, prepareIndex, search } from "../src/scripts/site-search.mjs";

const index = prepareIndex([
  { u: "/encyclopedia/threat-systems/sa-10/", t: "SA-10 Grumble", s: "Encyclopedia › Threat Systems", d: "SA-10 Grumble (S-300P family): a long-range SAM." },
  { u: "/encyclopedia/aircraft/fa-18c/", t: "F/A-18 Hornet", s: "Encyclopedia › Aircraft", d: "Carrier multirole fighter." },
  { u: "/manual/air-combat/bvr-intercepts/", t: "Beyond-Visual-Range Intercepts", s: "Manual › Air Combat", d: "Fly the fight before the merge.", h: [["shot", "The shot: launch zones, crank and decide"]] },
  { u: "/encyclopedia/terminology/#crank", t: "CRANK", s: "Glossary › Beyond-visual-range terms", d: "Turn to the edge of the radar.", g: 1 },
  { u: "/encyclopedia/terminology/#laser", t: "Laser safety zone", s: "Glossary", d: "Keep out 10 km.", g: 1 },
]);
const titles = (query) => search(index, query).map((result) => result.entry.t);

test("designators match with or without their punctuation", () => {
  assert.equal(normalize("F/A-18E"), "fa18e");
  for (const query of ["sa10", "SA-10", "sa 10", "s-300"]) assert.deepEqual(titles(query), ["SA-10 Grumble"], query);
  assert.deepEqual(titles("fa18"), ["F/A-18 Hornet"]);
});

test("titles rank above headings, and matching headings come back as deep links", () => {
  const results = search(index, "crank");
  assert.deepEqual(results.map((result) => result.entry.t), ["CRANK", "Beyond-Visual-Range Intercepts"]);
  assert.deepEqual(results[1].headings.map((heading) => heading.id), ["shot"]);
});

test("every query word must match; short words do not match inside prose", () => {
  assert.deepEqual(titles("hornet merge"), []);
  assert.deepEqual(titles(""), []);
});

test("the index takes titles, breadcrumbs, headings and glossary terms from built pages", () => {
  const html = `<head><meta name="description" content="All the terms &amp; words"></head><main>
    <nav class="breadcrumbs"><ol><li><a>Encyclopedia</a></li><li><span>Terminology</span></li></ol></nav>
    <h1>Terminology</h1><h2 id="sources-title">Sources</h2><h2 id="intro">Words <span class="term-ref"><a>BRAA</a><span class="term-tip"><span>tip</span> text</span></span> first</h2>
    <div class="term" id="crank"><dt><span class="term-word">CRANK</span></dt><dd><p class="term-set"><a>BVR terms</a></p><p class="term-def">Turn away.</p></dd></div></main>`;
  assert.equal(textOf('a <span class="term-tip">hidden <span>x</span></span> b'), "a b");
  const [page, term] = pageEntries(html, "/encyclopedia/terminology/", { glossary: true });
  assert.deepEqual(page, { u: "/encyclopedia/terminology/", t: "Terminology", s: "Encyclopedia", d: "All the terms & words", h: [["intro", "Words BRAA first"]] });
  assert.deepEqual(term, { u: "/encyclopedia/terminology/#crank", t: "CRANK", s: "Glossary › BVR terms", d: "Turn away.", g: 1 });
  assert.equal(pageEntries(html, "/encyclopedia/terminology/brevity/").length, 1);
});
