import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('aircraft procedures are review-only and do not publish by default', async () => {
  const source = await read('src/data/aircraft-procedures.ts');
  assert.match(source, /visibleProcedures = reviewTrainers \? procedures : \[\]/);
  assert.match(source, /status: 'review-only'/);
  assert.match(source, /simVersion: 'DCS build not yet verified'/);
});
test('engine start guide contains actions, expected indications and source mapping', async () => {
  const data = await read('src/data/aircraft-procedures.ts');
  for (const id of ['battery','flcs-test','jfs','sec','throttle','generator','idle-check'])
    assert.match(data, new RegExp("id:'" + id + "'"));
  assert.match(data, /at least 20%/);
  assert.match(data, /evidence:'p\. 135/);
});
test('instrument artwork and procedural content remain separate', async () => {
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  const svg = await read('src/components/aircraft-procedures/EngineInstrument.astro');
  assert.match(page, /guide\.steps/);
  assert.match(page, /EngineInstrument/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(svg, /data-needle/);
  assert.doesNotMatch(svg, /<image\b|href="https?:/);
});
