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
  for (const id of ['battery','flcs-test','jfs','sec','throttle','generator','idle-jfs','idle-fuel-flow','idle-hyd'])
    assert.match(data, new RegExp("id:'" + id + "'"));
  assert.match(data, /at least 20%/);
  assert.match(data, /evidence:'p\. 135/);
});
test('procedure runs on the shared cockpit panels', async () => {
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  const script = await read('src/scripts/procedure-engine-start.ts');
  const data = await read('src/data/aircraft-procedures.ts');
  assert.match(page, /guide\.steps/);
  assert.match(page, /<CockpitPanel [^>]*scope=\{scope\}/);
  assert.doesNotMatch(page, /StartupPanels|EngineInstrument|\.webp/);
  assert.match(script, /prefers-reduced-motion/);
  for (const ev of ['cockpit:change', 'cockpit:indicate', 'cockpit:set']) assert.match(script, new RegExp(ev));
  // Every step names its panels; actions name a shared control and position.
  assert.equal((data.match(/\bpanels:\[/g) ?? []).length, (data.match(/\{id:'/g) ?? []).length);
  for (const target of ["elec.main-pwr',to:'batt'", "test.flcs-pwr-test',to:'test'", "eng-jet-start.jfs',to:'start-2'", "sidewall-controls.throttle',to:'idle'", "left-eyebrow.master-caution',to:'in'"])
    assert.ok(data.includes(target), target);
});

test('cockpit panels report moves and take lamps from the host page', async () => {
  const panel = await read('src/components/cockpit/CockpitPanel.astro');
  assert.match(panel, /new CustomEvent\('cockpit:change'/);
  assert.match(panel, /addEventListener\('cockpit:indicate'/);
  assert.match(panel, /addEventListener\('cockpit:set'/);
  assert.match(panel, /\.lit\[data-colour="amber"\]/);
});

test('TACAN recovery procedure is sourced to the official guide and runs its own script', async () => {
  const data = await read('src/data/aircraft-procedures.ts');
  const script = await read('src/scripts/procedure-tacan.ts');
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  for (const id of ['lookup', 'mids', 'tils', 'chan-enter', 'ident', 'ehsi-mode-2', 'course', 'cross-check'])
    assert.match(data, new RegExp("id:'" + id + "'"));
  for (const target of ["avionics-power.mids',to:'on'", "icp.dcs-lr',to:'seq'", "icp.entr',to:'in'", "ehsi.mode',to:'in'"]) assert.ok(data.includes(target), target);
  assert.doesNotMatch(data, /chuck/i);
  assert.match(data, /slug:'incirlik'/);
  assert.match(script, /prefers-reduced-motion/);
  for (const ev of ['cockpit:change', 'cockpit:indicate', 'cockpit:set']) assert.match(script, new RegExp(ev));
  assert.match(page, /tacan-recovery/);
});
