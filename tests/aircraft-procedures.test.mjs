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
test('instrument artwork and procedural content remain separate', async () => {
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  const svg = await read('src/components/aircraft-procedures/EngineInstrument.astro');
  assert.match(page, /guide\.steps/);
  assert.match(page, /EngineInstrument/);
  assert.match(page, /prefers-reduced-motion/);
  assert.match(svg, /data-needle/);
  assert.doesNotMatch(svg, /<image\b|href="https?:/);
});

test('panel controls are native buttons with distinct locations', async () => {
  const svg = await read('src/components/aircraft-procedures/StartupPanels.astro');
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  for (const key of ['flcs-test','jfs-start2']) {
    assert.match(svg, new RegExp('data-control="' + key + '"'));
    assert.match(page, new RegExp("'" + key + "'"));
  }
  assert.match(svg,/<button type="button"[^>]*data-control=/);
  assert.match(page, /<div class="procedure-controls"[^>]*>[\s\S]*?<button type="button" data-control="throttle-idle"/);
  assert.match(page, /throttle: 'throttle-idle'/);
  assert.match(page,/advanceAfterControl/);
  assert.match(page,/completed.add\(id\)/);
});

test('panel redraw uses separate artwork and movable controls', async () => {
  const svg = await read('src/components/aircraft-procedures/StartupPanels.astro');
  for (const panel of ['elec','test','jfs'])
    assert.match(svg, new RegExp('data-panel="' + panel + '"'));
  for (const panel of ['test', 'jfs', 'caution', 'eyebrow']) {
    assert.ok(svg.includes(`f16-${panel}.webp`));
  }
  assert.match(svg, /data-jfs-lever/);
  assert.match(svg, /data-flcs-lever/);
  assert.match(svg, /<CockpitPanel spec=\{f16cElec\} class="elec-art"/);
});

test('ELEC panel is vector art drawn from its traced data', async () => {
  const spec = await read('src/data/cockpit-panels/f16c-elec.ts');
  const panel = await read('src/components/cockpit-panels/CockpitPanel.astro');
  const render = await read('src/data/cockpit-panels/render.ts');
  for (const lamp of ['flcs-pmg', 'flcs-rly', 'to-flcs', 'main-gen', 'epu-gen', 'epu-pmg'])
    assert.ok(spec.includes(`lamp: '${lamp}'`));
  assert.match(spec, /stateAttr: 'main-state'/);
  assert.match(spec, /DCS F-16C Viper Early Access Guide[^']*p\. 64/);
  assert.match(panel, /class="toggle-up"/);
  assert.match(panel, /class="toggle-down"/);
  assert.match(render, /data-lamp=/);
  assert.doesNotMatch(spec + panel + render, /<image\b|\.webp/);
});

test('raster panels expose independent annunciators and control overlays', async () => {
  const panels = await read('src/components/aircraft-procedures/StartupPanels.astro');
  const instruments = await read('src/components/aircraft-procedures/EngineInstrument.astro');
  for (const lamp of ['jfs-run', 'warn-sec', 'warn-engine']) {
    assert.ok(panels.includes(`data-lamp="${lamp}"`));
  }
  for (const channel of ['A', 'B', 'C', 'D']) {
    assert.ok(panels.includes(`data-flcs-channel="${channel}"`));
  }
  assert.match(instruments, /f16-engine\.webp/);
});
