import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkRecords, contentFile, loadRecords } from '../../scripts/check_encyclopedia.mjs';

const root = fileURLToPath(new URL('../..', import.meta.url));

const record = {
  id: 'encyclopedia.example.thing', slug: 'thing', category: 'example', revision: 2,
  maturity: 'Drafted — not technically validated', publication: 'published',
};
const tag = `data-record-id="${record.id}" data-record-revision="2"`;
const complete = {
  'encyclopedia/example/thing/index.html': `<section ${tag}>${record.maturity}</section><dd>12 km <a href="#source-1">[1]</a></dd><div class="record-body"><h2>Overview</h2></div><li id="source-1">Source</li>`,
  'encyclopedia/example/index.html': `<section ${tag}><span>${record.maturity}</span><a href="/encyclopedia/example/thing/">Open</a></section>`,
};

async function checkAll(files, records, { review = false, content = true } = {}) {
  const dir = await mkdtemp(path.join(tmpdir(), 'oversweep-records-'));
  const dist = path.join(dir, 'dist');
  try {
    for (const [file, text] of Object.entries(files)) {
      await mkdir(path.dirname(path.join(dist, file)), { recursive: true });
      await writeFile(path.join(dist, file), text);
    }
    if (content) for (const r of records) {
      await mkdir(path.dirname(path.join(dir, contentFile(r))), { recursive: true });
      await writeFile(path.join(dir, contentFile(r)), '---\n---\n');
    }
    return await checkRecords({ dist, records, review, contentRoot: dir });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const check = (files, options = {}) => checkAll(files, [{ ...record, ...options.record }], options);

test('a complete published record passes', async () => {
  assert.deepEqual(await check(complete), []);
});

test('a published record must ship its page, category listing and content file', async () => {
  const problems = await check({ 'encyclopedia/example/index.html': '<p>Empty</p>' }, { content: false });
  assert(problems.some(p => p.includes('page is missing')));
  assert(problems.some(p => p.includes('category index lacks')));
  assert(problems.some(p => p.includes('does not link')));
  assert(problems.some(p => p.includes('example/thing.md is missing')));
});

test('published pages must show the registered maturity and revision', async () => {
  const problems = await check(complete, { record: { maturity: 'Technically Validated', revision: 3 } });
  assert(problems.some(p => p.includes('does not show maturity')));
  assert(problems.some(p => p.includes('revision 3')));
});

test('a record page must list sources and resolve every citation', async () => {
  const page = 'encyclopedia/example/thing/index.html';
  let problems = await check({ ...complete, [page]: `<section ${tag}>${record.maturity}</section>` });
  assert(problems.some(p => p.includes('lists no sources')));
  problems = await check({ ...complete, [page]: complete[page] + '<a href="#source-4">[4]</a>' });
  assert(problems.some(p => p.includes('#source-4 has no source entry')));
  // A data-plate value cited as plain text, as frontmatter strings were rendered before.
  problems = await check({ ...complete, [page]: complete[page] + '<dd>Command guidance [1]</dd>' });
  assert(problems.some(p => p.includes('[1] is not linked')));
});

test('a record page must render its text', async () => {
  const page = 'encyclopedia/example/thing/index.html';
  const problems = await check({ ...complete, [page]: complete[page].replace('<h2>Overview</h2>', '') });
  assert(problems.some(p => p.includes('has no record text')));
});

test('a record photo must be a site file with alt text and a credit', async () => {
  const page = 'encyclopedia/example/thing/index.html';
  const photo = (img, credit = '<span class="credit">Credit: US Air Force. Public domain. <a href="https://commons.wikimedia.org/wiki/File:X.jpg">Source page</a></span>') =>
    ({ ...complete, [page]: complete[page] + `<figure class="record-photo">${img}<figcaption>A site. ${credit}</figcaption></figure>` });
  const good = photo('<img src="/encyclopedia/example/thing.jpg" alt="A missile site">');
  assert.deepEqual(await check({ ...good, 'encyclopedia/example/thing.jpg': 'jpeg' }), []);
  let problems = await check(good);
  assert(problems.some(p => p.includes('is not a file in the site')));
  problems = await check({ ...photo('<img src="https://upload.wikimedia.org/x.jpg" alt="A missile site">') });
  assert(problems.some(p => p.includes('is not a file in the site')));
  problems = await check({ ...photo('<img src="/encyclopedia/example/thing.jpg" alt="">', ''), 'encyclopedia/example/thing.jpg': 'jpeg' });
  assert(problems.some(p => p.includes('no alt text')));
  assert(problems.some(p => p.includes('not credited')));
});

test('an excluded record must not appear anywhere in normal output', async () => {
  const problems = await check({ 'index.html': `<a ${tag}></a>` }, { record: { publication: 'excluded' } });
  assert(problems.some(p => p.includes('referenced in index.html')));
  assert.deepEqual(await check({ 'index.html': '<p>Home</p>' }, { record: { publication: 'excluded' } }), []);
});

test('review builds require excluded records to be complete', async () => {
  const problems = await check({ 'index.html': '<p>Home</p>' }, { record: { publication: 'excluded' }, review: true });
  assert(problems.some(p => p.includes('page is missing')));
  assert.deepEqual(await check(complete, { record: { publication: 'excluded' }, review: true }), []);
});

test('unknown publication values and duplicate ids are rejected', async () => {
  let problems = await check(complete, { record: { publication: 'draft' } });
  assert(problems.some(p => p.includes('unknown publication')));
  problems = await checkAll(complete, [record, record]);
  assert(problems.some(p => p.includes('duplicate id')));
});

test('every registered record has a content file in the repository', async () => {
  const records = await loadRecords();
  assert(records.length > 0);
  for (const r of records) await import('node:fs/promises').then(fs => fs.access(path.join(root, contentFile(r))));
});

test('the encyclopedia landing shows categories, not records', async () => {
  const problems = await check({ ...complete, 'encyclopedia/index.html': `<section ${tag}>${record.maturity}</section>` });
  assert(problems.some(p => p.includes('encyclopedia/index.html lists records')));
  assert.deepEqual(await check({ ...complete, 'encyclopedia/index.html': '<ul class="category-grid"></ul>' }), []);
});
