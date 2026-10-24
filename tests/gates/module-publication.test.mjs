import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkModules } from '../../scripts/check_modules.mjs';

const module = {
  id: 'module.example', slug: 'example', subject: 'navigation', revision: 2,
  maturity: 'Drafted — not technically validated', publication: 'published',
};
const tag = `data-module-id="${module.id}" data-module-revision="2"`;
const complete = {
  'manual/navigation/example/index.html': `<section ${tag}>${module.maturity}</section>`,
  'manual/navigation/index.html': `<section ${tag}><strong>${module.maturity}</strong><a href="/manual/navigation/example/">Open</a></section>`,
};

async function check(files, options = {}) {
  const dist = await mkdtemp(path.join(tmpdir(), 'oversweep-modules-'));
  try {
    for (const [file, text] of Object.entries(files)) {
      await mkdir(path.dirname(path.join(dist, file)), { recursive: true });
      await writeFile(path.join(dist, file), text);
    }
    return await checkModules({ dist, modules: [{ ...module, ...options.module }], review: options.review });
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
}

test('a complete published module passes', async () => {
  assert.deepEqual(await check(complete), []);
});

test('a published module must ship its page and subject listing', async () => {
  const problems = await check({ 'manual/navigation/index.html': '<p>Coming soon</p>' });
  assert(problems.some(p => p.includes('page is missing')));
  assert(problems.some(p => p.includes('subject index lacks')));
  assert(problems.some(p => p.includes('does not link')));
});

test('published pages must show the registered maturity and revision', async () => {
  const problems = await check(complete, { module: { maturity: 'Technically Validated', revision: 3 } });
  assert(problems.some(p => p.includes('does not show maturity')));
  assert(problems.some(p => p.includes('revision 3')));
});

test('a trainer-less module must not frame or launch a trainer', async () => {
  const page = 'manual/navigation/example/index.html';
  let problems = await check({ ...complete, [page]: complete[page] + '<iframe src="/experiences/x/"></iframe>' });
  assert(problems.some(p => p.includes('embeds or launches')));
  problems = await check({ ...complete, [page]: complete[page] + '<a data-experience-launch href="/x/">Go</a>' });
  assert(problems.some(p => p.includes('embeds or launches')));
});

test('an excluded module must not appear anywhere in normal output', async () => {
  const problems = await check({ 'index.html': `<a ${tag}></a>` }, { module: { publication: 'excluded' } });
  assert(problems.some(p => p.includes('referenced in index.html')));
  assert.deepEqual(await check({ 'index.html': '<p>Home</p>' }, { module: { publication: 'excluded' } }), []);
});

test('review builds require excluded modules to be complete', async () => {
  const problems = await check({ 'index.html': '<p>Home</p>' }, { module: { publication: 'excluded' }, review: true });
  assert(problems.some(p => p.includes('page is missing')));
  assert.deepEqual(await check(complete, { module: { publication: 'excluded' }, review: true }), []);
});

test('unknown publication values are rejected', async () => {
  const problems = await check(complete, { module: { publication: 'draft' } });
  assert(problems.some(p => p.includes('unknown publication')));
});
