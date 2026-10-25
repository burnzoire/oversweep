import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkRecords, contentFile, loadRecords } from '../../scripts/check_encyclopedia.mjs';

const record = {
  id: 'encyclopedia.example.thing', slug: 'thing', category: 'example', revision: 2,
  maturity: 'Drafted — not technically validated', publication: 'published',
};
const tag = `data-record-id="${record.id}" data-record-revision="2"`;
const complete = {
  'encyclopedia/example/thing/index.html': `<section ${tag}>${record.maturity}</section><a href="#source-1">[1]</a><li id="source-1">Source</li>`,
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
  for (const r of records) await import('node:fs/promises').then(fs => fs.access(contentFile(r)));
});
