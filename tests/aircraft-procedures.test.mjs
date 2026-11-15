import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('public preview procedures are visible and review-only procedures remain gated', async () => {
  const source = await read('src/data/aircraft-procedures.ts');
  assert.match(source, /visibleProcedures = procedures\.filter\(p => p\.status === 'public-preview' \|\| reviewTrainers\)/);
  assert.match(source, /status: 'public-preview',/);
  assert.match(source, /simVersion: 'DCS build not yet verified'/);
});
test('engine start guide contains actions, expected indications and source mapping', async () => {
  const data = await read('src/data/aircraft-procedures.ts');
  for (const id of ['battery','flcs-test','jfs','sec','throttle','generator','idle-check'])
    assert.match(data, new RegExp("id:'" + id + "'"));
  assert.match(data, /at least 20%/);
  assert.match(data, /evidence:'p\. 135/);
});
const panelFiles = ['elec', 'test', 'jfs', 'gear', 'canopy', 'fuel', 'air', 'caution', 'eyebrow', 'engine'];
const specs = async () => (await Promise.all(panelFiles.map(f => read(`src/data/cockpit-panels/f16c-${f}.ts`)))).join('\n');

test('instrument artwork and procedural content remain separate', async () => {
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  const instruments = await read('src/components/aircraft-procedures/EngineInstrument.astro');
  const render = await read('src/data/cockpit-panels/render.ts');
  assert.match(page, /guide\.steps/);
  assert.match(page, /EngineInstrument/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(page, /JSON\.parse\(rpm\.dataset\.stops!\)/);
  assert.match(instruments, /<CockpitPanel spec=\{f16cEngine\}/);
  assert.match(render, /data-needle=/);
  assert.match(render, /data-stops=/);
});

test('panel controls are native buttons with distinct locations', async () => {
  const all = await specs();
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  const panel = await read('src/components/cockpit-panels/CockpitPanel.astro');
  for (const key of ['flcs-test', 'jfs-start2', 'parking-brake-up', 'canopy-down', 'canopy-lock', 'fuel-feed-cw', 'air-source-cw']) {
    assert.match(all, new RegExp("'" + key + "'"));
    assert.match(page, new RegExp("'" + key + "'"));
  }
  assert.match(panel, /<button type="button"[^>]*data-control=/);
  assert.match(page, /<div class="procedure-controls"[^>]*>[\s\S]*?<button type="button" data-control="throttle-idle"/);
  assert.match(page, /throttle: 'throttle-idle'/);
  assert.match(page, /advanceAfterControl/);
  assert.match(page, /completed.add\(id\)/);
});

test('every startup panel is vector art drawn from a traced spec', async () => {
  const panels = await read('src/components/aircraft-procedures/StartupPanels.astro');
  const all = await specs();
  for (const panel of ['elec', 'test', 'jfs', 'caution', 'eyebrow'])
    assert.match(panels, new RegExp('data-panel="' + panel + '"'));
  for (const id of ['parking-brake', 'canopy', 'fuel-feed', 'air-source'])
    assert.match(panels, new RegExp("id: '" + id + "'"));
  assert.doesNotMatch(panels + all, /\.webp|<img\b|<image\b/);
  for (const f of panelFiles) assert.match(await read(`src/data/cockpit-panels/f16c-${f}.ts`), /DCS F-16C Viper Early Access Guide[^']*p\. \d+/);
  for (const hook of ["'data-flcs-lever'", "'data-jfs-lever'", "stateAttr: 'main-state'", "'data-prestart-position': 'canopy'", "'data-prestart-position': 'parking-brake'"])
    assert.ok(all.includes(hook), hook);
});

test('panel specs expose the annunciators and channel lamps the procedure drives', async () => {
  const all = await specs();
  for (const lamp of ['flcs-pmg', 'flcs-rly', 'to-flcs', 'jfs-run', 'warn-sec', 'warn-elec', 'warn-seat', 'warn-engine', 'warn-hyd', 'warn-canopy'])
    assert.ok(all.includes(`'${lamp}'`), lamp);
  assert.match(all, /'data-flcs-channel': letter/);
  for (const needle of ['oil', 'noz', 'rpm', 'ftit']) assert.ok(all.includes(`needle: '${needle}'`), needle);
});
