import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { checkExperiences } from '../../scripts/check_experiences.mjs';

const experience = {
  id: 'experience.example', slug: 'example', subject: 'navigation', revision: 2,
  maturity: 'Drafted — not technically validated', publication: 'published', assets: ['app.js'],
};
const tag = `data-experience-id="${experience.id}" data-experience-revision="2"`;
const listing = `<section ${tag}><strong>${experience.maturity}</strong><a href="/manual/navigation/example/">Open</a></section>`;
const complete = {
  'manual/navigation/example/index.html': `<section ${tag}>${experience.maturity}</section><iframe src="/experiences/example/"></iframe>`,
  'experiences/example/index.html': `<body ${tag}><script src="app.js"></script></body>`,
  'experiences/example/app.js': 'run();',
  'manual/navigation/index.html': listing,
  'training/index.html': listing,
};

async function check(files, options = {}) {
  const dist = await mkdtemp(path.join(tmpdir(), 'oversweep-experiences-'));
  try {
    for (const [file, text] of Object.entries(files)) {
      await mkdir(path.dirname(path.join(dist, file)), { recursive: true });
      await writeFile(path.join(dist, file), text);
    }
    return await checkExperiences({ dist, experiences: [{ ...experience, ...options.experience }], review: options.review });
  } finally {
    await rm(dist, { recursive: true, force: true });
  }
}

test('a complete published experience passes', async () => {
  assert.deepEqual(await check(complete), []);
});

test('a published experience must ship every route, listing and asset', async () => {
  const { 'training/index.html': _library, 'experiences/example/app.js': _asset, ...partial } = complete;
  const problems = await check(partial);
  assert(problems.some(p => p.includes('Training Library page is missing')));
  assert(problems.some(p => p.includes('asset app.js is missing')));
});

test('published pages must show the registered maturity and revision', async () => {
  const problems = await check(complete, { experience: { maturity: 'Technically Validated', revision: 3 } });
  assert(problems.some(p => p.includes('does not show maturity')));
  assert(problems.some(p => p.includes('revision 3')));
});

test('an excluded experience must not appear anywhere in normal output', async () => {
  const problems = await check({ 'index.html': `<a ${tag}></a>` }, { experience: { publication: 'excluded' } });
  assert(problems.some(p => p.includes('referenced in index.html')));
  assert.deepEqual(await check({ 'index.html': '<p>Home</p>' }, { experience: { publication: 'excluded' } }), []);
});

test('review builds require excluded experiences to be complete', async () => {
  const problems = await check({ 'index.html': '<p>Home</p>' }, { experience: { publication: 'excluded' }, review: true });
  assert(problems.some(p => p.includes('wrapper page is missing')));
});
