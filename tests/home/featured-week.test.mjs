import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { featuredWeek } from '../../src/data/featured-week.mjs';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const schedule = read('../../src/data/featured-articles.json');
const records = read('../../src/data/encyclopedia.json');

test('52 distinct features resolve to published articles with local credited images', () => {
  assert.equal(schedule.length, 52);
  assert.equal(new Set(schedule).size, 52);
  for (const id of schedule) {
    const record = records.find(r => r.id === id);
    assert.equal(record?.publication, 'published', id);
    const text = readFileSync(new URL(`../../content/encyclopedia/${record.category}/${record.slug}.md`, import.meta.url), 'utf8');
    const src = text.match(/\bsrc: ['"]?([^\n'"]+)/)?.[1].trim();
    assert.ok(src && existsSync(new URL(`../../public/${src}`, import.meta.url)), `${id}: image exists`);
    assert.match(text, /sourceUrl:/);
    assert.match(text, /licence:/);
  }
});

test('Melbourne Monday boundary changes feature irrespective of viewer timezone', () => {
  assert.equal(featuredWeek(new Date('2026-10-25T12:59:59Z')), 43);
  assert.equal(featuredWeek(new Date('2026-10-25T13:00:00Z')), 44);
  // Winter: Melbourne is UTC+10, rather than UTC+11.
  assert.equal(featuredWeek(new Date('2026-06-28T13:59:59Z')), 26);
  assert.equal(featuredWeek(new Date('2026-06-28T14:00:00Z')), 27);
});

test('ISO year rollover and week 53 retain the last feature until week 1', () => {
  assert.equal(featuredWeek(new Date('2026-01-01T01:00:00Z')), 1);
  assert.equal(featuredWeek(new Date('2026-12-28T01:00:00Z')), 52);
  assert.equal(featuredWeek(new Date('2027-01-03T01:00:00Z')), 52);
  assert.equal(featuredWeek(new Date('2027-01-04T01:00:00Z')), 1);
});

// Execute the actual browser selector with a stale server-rendered DOM. Keep
// the clock controllable to exercise an open tab across a weekly boundary.
import vm from 'node:vm';
import ts from 'typescript';
test('browser selection replaces stale text, photo, links, credit and maturity together', () => {
  const source = readFileSync(new URL('../../src/components/FeaturedArticle.astro', import.meta.url), 'utf8');
  const script = source.match(/<script>\n([\s\S]*?)<\/script>/)[1].replace(/import .*?;\n/, '');
  const elements = new Map();
  const root = { querySelector(selector) {
    if (!elements.has(selector)) elements.set(selector, { textContent: 'stale', href: '/stale/', hidden: false, style: {}, removeAttribute(name) { delete this[name]; } });
    return elements.get(selector);
  } };
  const features = Array.from({ length: 52 }, (_, i) => ({
    title: `Article ${i + 1}`, summary: `Summary ${i + 1}`, category: 'Aircraft', maturity: 'Drafted — not technically validated',
    href: `/oversweep/encyclopedia/aircraft/article-${i + 1}/`,
    photo: { src: `/oversweep/photos/${i + 1}.jpg`, alt: `Photo ${i + 1}`, author: `Author ${i + 1}`, licence: i % 2 ? 'CC BY' : 'Public domain',
      licenceUrl: i % 2 ? 'https://creativecommons.org/licenses/by/4.0/' : undefined, sourceUrl: `https://example.org/photo-${i + 1}` },
  }));
  let week = 43, tick;
  const events = {};
  vm.runInNewContext(ts.transpile(script), {
    featuredWeek: () => week,
    document: { querySelector: () => root, getElementById: () => ({ textContent: JSON.stringify(features) }), addEventListener: (name, callback) => { events[name] = callback; }, hidden: false },
    setInterval: callback => { tick = callback; },
  });
  const verify = () => {
    const feature = features[week - 1];
    for (const key of ['title', 'summary', 'category', 'maturity']) assert.equal(elements.get(`[data-feature-${key}]`).textContent, feature[key]);
    for (const key of ['title', 'link']) assert.equal(elements.get(`[data-feature-${key}]`).href, feature.href);
    assert.equal(elements.get('[data-feature-image]').src, feature.photo.src);
    assert.equal(elements.get('[data-feature-image]').alt, feature.photo.alt);
    assert.equal(elements.get('[data-feature-credit]').href, feature.photo.sourceUrl);
    assert.equal(elements.get('[data-feature-author]').textContent, feature.photo.author);
    assert.equal(elements.get('[data-feature-licence]').hidden, !feature.photo.licenceUrl);
    assert.equal(elements.get('[data-feature-licence-text]').hidden, Boolean(feature.photo.licenceUrl));
    assert.equal(elements.get('[data-feature-licence]').href, feature.photo.licenceUrl);
  };
  verify(); // Fresh selection replaces an old static build.
  week = 44; tick(); verify(); // Timer crosses Monday; licence link appears.
  week = 45; events.visibilitychange(); verify(); // Returning tab; link removed.
});
