import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('menu is an accordion: siblings share a details name so opening one closes the others', async () => {
  const branch = await read('src/components/MenuBranch.astro');
  assert.match(branch, /<details name=\{parent\}/);
  assert.match(branch, /parent=\{node\.id\}/);
  const menu = await read('src/components/ManualMenu.astro');
  assert.match(menu, /parent="manual-menu"/);
});

test('every Manual subject sits in General Flight, Tactics or Aircraft', async () => {
  const menu = await read('src/data/manual-menu.ts');
  const catalogue = await read('src/data/catalogue.ts');
  const subjects = [...catalogue.matchAll(/slug: "([a-z-]+)", title/g)].map(m => m[1]).slice(0, 14);
  for (const slug of subjects.filter(s => s !== 'aircraft-procedures')) assert.match(menu, new RegExp(`subject: '${slug}'`), slug);
  assert.match(menu, /'Aircraft', \[f16c\]/);
  assert.match(menu, /'General Flight'/);
  assert.match(menu, /'Tactics'/);
});

test('unwritten pages are listed but never linked', async () => {
  const branch = await read('src/components/MenuBranch.astro');
  assert.match(branch, /node\.href && !node\.planned \? sitePath/);
});

test('TACAN procedure is TACAN Navigation and its old address redirects', async () => {
  const data = await read('src/data/aircraft-procedures.ts');
  const config = await read('astro.config.mjs');
  assert.match(data, /slug: 'tacan-navigation'/);
  assert.doesNotMatch(data, /tacan-recovery/);
  assert.match(config, /"\/manual\/aircraft-procedures\/f-16c\/tacan-recovery\/": "\/manual\/aircraft-procedures\/f-16c\/tacan-navigation\/"/);
});
