import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { validatePurchases } from '../../src/data/purchase.mjs';

// Aircraft records and sim map records carry a Purchase row.
const read = (category) => {
  const dir = fileURLToPath(new URL(`../../content/encyclopedia/${category}/`, import.meta.url));
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => ({
    slug: f.replace(/\.md$/, ''),
    data: parse(readFileSync(dir + f, 'utf8').split('---\n')[1]),
  }));
};
const aircraft = read('aircraft');
const maps = read('theatres').filter((e) => e.data.kind === 'map');

test('every aircraft and sim map has a valid purchase list', () => {
  for (const { slug, data } of [...aircraft, ...maps]) {
    assert.ok(data.purchase?.length, `${slug} has no purchase entries`);
    assert.deepEqual(validatePurchases(data.purchase, slug), []);
  }
});

test('a sim map is sold for its own sim', () => {
  for (const { slug, data } of maps) assert.ok(data.purchase.some((p) => p.sim === data.sim), slug);
});

test('the developer store comes before the DCS Store', () => {
  const dcs = { store: 'DCS Store', url: 'https://www.digitalcombatsimulator.com/en/shop/modules/tomcat/' };
  const dev = { store: 'Heatblur Store', url: 'https://store.heatblur.com/products/dcs-f-14-tomcat' };
  const entry = (links) => [{ sim: 'dcs', product: 'DCS: F-14 Tomcat', by: 'Heatblur Simulations', links }];
  assert.deepEqual(validatePurchases(entry([dev, dcs]), 'x'), []);
  assert.equal(validatePurchases(entry([dcs, dev]), 'x').length, 1);
});

test('an entry is sold, free or not on sale', () => {
  const base = { sim: 'dcs', product: 'P', by: 'B' };
  assert.equal(validatePurchases([base], 'x').length, 1);
  assert.deepEqual(validatePurchases([{ ...base, unavailable: 'Not on sale' }], 'x'), []);
  assert.equal(validatePurchases([{ ...base, unavailable: 'Gone', links: [{ store: 'S', url: 'https://example.org' }] }], 'x').length, 1);
  assert.equal(validatePurchases([{ ...base, sim: 'xplane', unavailable: 'Gone' }], 'x').length, 1);
  assert.equal(validatePurchases([{ ...base, links: [{ store: 'S', url: 'http://example.org' }] }], 'x').length, 1);
});
