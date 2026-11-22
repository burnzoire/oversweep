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
  assert.match(menu, /'Aircraft', aircraft/);
  assert.match(menu, /'General Flight'/);
  assert.match(menu, /'Tactics'/);
});

test('planned groups remain linked but unwritten article leaves do not', async () => {
  const branch = await read('src/components/MenuBranch.astro');
  assert.match(branch, /node\.href && \(node\.children\?\.length \|\| !node\.planned\)/);
  const menu = await read('src/data/manual-menu.ts');
  assert.match(menu, /export function linkGroups/);
  assert.match(menu, /node\.children\?\.length/);
  assert.match(menu, /export const hasArticle/);
  assert.match(await read('src/components/GroupCards.astro'), /c\.children\?\.length \|\| !c\.planned/);
});

test('TACAN procedure is TACAN Navigation and its old address redirects', async () => {
  const data = await read('src/data/aircraft-procedures.ts');
  const moved = await read('src/pages/manual/aircraft-procedures/f-16c/tacan-recovery/index.astro');
  assert.match(data, /slug: 'tacan-navigation'/);
  assert.doesNotMatch(data, /tacan-recovery/);
  assert.match(moved, /to="manual\/aircraft-procedures\/f-16c\/tacan-navigation\/"/);
});

test('the menu expands only the airframe a page is on, so aircraft count does not grow every page', async () => {
  const src = await read('src/data/manual-menu.ts');
  assert.match(src, /export function menuFor\(route/);
  assert.match(src, /route\.startsWith\(a\.href\)/);
  assert.match(await read('src/components/ManualMenu.astro'), /menuFor\(route\)/);
});

test('the menu has no counts', async () => {
  assert.doesNotMatch(await read('src/components/MenuBranch.astro'), /count|progress/);
});

test('an aircraft not on the page loads its branch when opened', async () => {
  assert.ok((await read('src/components/MenuBranch.astro')).includes('data-lazy={node.lazy ? assetPath('));
  assert.match(await read('src/components/ManualMenu.astro'), /dataset\.lazy/);
  assert.match(await read('src/pages/manual-menu/[aircraft].json.ts'), /aircraftMenus/);
});

test('every menu group has a landing page listing its children', async () => {
  const menu = await read('src/data/manual-menu.ts');
  assert.match(menu, /export function groupPages/);
  assert.match(await read('src/pages/manual/[...group].astro'), /groupPages\(\)/);
  assert.match(await read('src/components/GroupCards.astro'), /node\.children/);
});
