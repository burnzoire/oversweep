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

test('steerpoint entry procedure is sourced to the official guide and runs its own script', async () => {
  const data = await read('src/data/aircraft-procedures.ts');
  const script = await read('src/scripts/procedure-steerpoint.ts');
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  for (const id of ['current', 'stpt-open', 'select', 'lat', 'lon', 'elev', 'rtn', 'hud', 'course', 'verify'])
    assert.match(data, new RegExp("id:'" + id + "'"));
  for (const target of ["icp.key-4',to:'in'", "icp.dcs-ud',to:'down'", "icp.dcs-lr',to:'rtn'", "ehsi.crs',to:190"]) assert.ok(data.includes(target), target);
  assert.doesNotMatch(data, /chuck/i);
  assert.match(script, /prefers-reduced-motion/);
  for (const ev of ['cockpit:change', 'cockpit:indicate', 'cockpit:set']) assert.match(script, new RegExp(ev));
  assert.match(page, /steerpoint-entry/);
});

test('steerpoint entry types the digits the steps give, on DED pages that exist', async () => {
  if (!(process.features?.typescript || process.execArgv.includes('--experimental-strip-types'))) return;
  const data = await read('src/data/aircraft-procedures.ts');
  const { f16cCockpit, builtPanels } = await import('../src/data/cockpit/f16c/index.ts');
  const panels = builtPanels(f16cCockpit);
  const pages = new Set(panels.find(({ spec }) => spec.id === 'ded').spec.indicators[0].pages.map(x => x.id));
  for (const id of ['cni-5', 'stpt-4', 'stpt-5-edit', 'stpt-5-empty', 'stpt-lat-0', 'stpt-lat-8', 'stpt-lat-done', 'stpt-lon-0', 'stpt-lon-9', 'stpt-lon-done', 'stpt-elev-0', 'stpt-elev-3', 'stpt-elev-done'])
    assert.ok(pages.has(id), id);
  for (const [field, digits] of [['lat', '23635822'], ['lon', '603635014'], ['elev', '892']])
    assert.ok(data.includes(`type:typing('${field}','${digits}')`), field);
  const keys = new Set(panels.find(({ spec }) => spec.id === 'icp').spec.controls.map(c => c.id));
  for (let d = 0; d <= 9; d++) assert.ok(keys.has(`key-${d}`));
  assert.ok(keys.has('entr') && keys.has('dcs-ud') && keys.has('dcs-lr'));
});

test('before-taxi procedure is sourced to the official guide, its moves exist and its DED pages exist', async () => {
  const data = await read('src/data/aircraft-procedures.ts');
  const script = await read('src/scripts/procedure-before-taxi.ts');
  const page = await read('src/pages/manual/aircraft-procedures/[airframe]/[procedure].astro');
  assert.doesNotMatch(data, /chuck/i);
  assert.match(script, /prefers-reduced-motion/);
  for (const ev of ['cockpit:change', 'cockpit:indicate', 'cockpit:set']) assert.match(script, new RegExp(ev));
  assert.match(page, /before-taxi/);
  if (!(process.features?.typescript || process.execArgv.includes('--experimental-strip-types'))) return;
  const { f16cCockpit, builtPanels } = await import('../src/data/cockpit/f16c/index.ts');
  const panels = builtPanels(f16cCockpit);
  const ded = new Set(panels.find(({ spec }) => spec.id === 'ded').spec.indicators[0].pages.map(x => x.id));
  for (const id of ['ins-0', 'ins-1', 'ins-2', 'ins-3', 'ins-4', 'ins-4-off', 'ins-nav']) assert.ok(ded.has(id), id);
  assert.ok(script.includes("'ins-nav'") && script.includes("'hud.align'"));
  // Every control a step moves exists on its panel with that position.
  const block = data.slice(data.indexOf('const beforeTaxi'));
  for (const m of block.matchAll(/(?:do:|\{)\{?control:'([\w-]+)\.([\w-]+)',to:'([\w-]+)'/g)) {
    const spec = panels.find(({ spec }) => spec.id === m[1])?.spec;
    assert.ok(spec, m[1]);
    const c = spec.controls.find(x => x.id === m[2]);
    assert.ok(c && c.positions.some(p => p.id === m[3]), m[0]);
  }
});

test('HTS familiarization uses HAD and SEAD pages that exist and HOTAS controls that are built', async () => {
  if (!(process.features?.typescript || process.execArgv.includes('--experimental-strip-types'))) return;
  const data = await read('src/data/aircraft-procedures.ts');
  const script = await read('src/scripts/procedure-hts.ts');
  const { f16cCockpit, builtPanels } = await import('../src/data/cockpit/f16c/index.ts');
  const panels = builtPanels(f16cCockpit);
  const pagesOf = id => new Set(panels.find(({ spec }) => spec.id === id).spec.indicators.find(i => i.id === 'display').pages.map(x => x.id));
  const mfd = pagesOf('right-mfd');
  for (const m of script.matchAll(/'(had[a-z0-9-]*|menu-blank)'/g)) assert.ok(mfd.has(m[1]), m[1]);
  assert.ok(pagesOf('ded').has('sead'));
  for (const [panel, control] of [['snsr-pwr', 'left-hdpt'], ['stick', 'dms-ud'], ['stick', 'tms-ud'], ['stick', 'tms-lr'], ['stick', 'expand-fov'], ['throttle', 'cursor-ud'], ['throttle', 'cursor-lr'], ['right-mfd', 'osb-4']]) {
    assert.ok(panels.find(({ spec }) => spec.id === panel).spec.controls.some(c => c.id === control), `${panel}.${control}`);
    assert.ok(data.includes(`${panel}.${control}`) || script.includes(`${panel}.${control}`), `${panel}.${control} used`);
  }
  // The cursor is slewed by hand: the RDR CURSOR pad works as a joystick.
  assert.ok(panels.find(({ spec }) => spec.id === 'throttle').spec.pads.find(p => p.id === 'cursor').analog);
  assert.doesNotMatch(data, /chuck/i);
});
