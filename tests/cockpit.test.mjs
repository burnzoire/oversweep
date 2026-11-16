// Shared cockpit model: catalogue ids, panel assembly and movement rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const canImportTs = process.features?.typescript || process.execArgv.includes('--experimental-strip-types');
const load = async () => ({
  ...(await import('../src/data/cockpit/f16c/index.ts')),
  ...(await import('../src/data/cockpit/render.ts')),
});

test('catalogue lists every area and panel with unique stable ids', { skip: !canImportTs }, async () => {
  const { f16cCockpit } = await load();
  const ids = f16cCockpit.areas.flatMap(a => a.panels.map(p => p.id));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes('elec') && ids.includes('fuel'));
  for (const id of ids) assert.match(id, /^[a-z0-9-]+$/);
});

test('every built panel models each placed control and lamp once', { skip: !canImportTs }, async () => {
  const { f16cCockpit, builtPanels, renderPanel, hitZones } = await load();
  for (const { spec } of builtPanels(f16cCockpit)) {
    const placed = spec.placements.filter(p => 'control' in p).map(p => p.control);
    assert.deepEqual([...placed].sort(), spec.controls.map(c => c.id).sort(), `${spec.id}: placements and controls differ`);
    const lamps = spec.placements.flatMap(p => p.component === 'lamp-module' ? p.lamps.map(l => l.indicator) : p.component === 'lamp-round' ? [p.indicator] : []);
    assert.deepEqual([...lamps].sort(), spec.indicators.map(i => i.id).sort(), `${spec.id}: lamp cells and indicators differ`);
    for (const c of spec.controls) {
      assert.ok(c.positions.some(p => p.id === c.initial), `${spec.id}.${c.id}: initial position`);
      for (const p of c.positions) if (p.hold === 'momentary') assert.ok(c.positions.some(q => q.id === p.spring), `${spec.id}.${c.id}: spring target`);
      if (c.type === 'rotary') for (const p of c.positions) assert.equal(typeof p.angle, 'number');
      for (const pr of c.protections ?? []) if (pr.kind === 'guard') assert.ok(spec.controls.some(g => g.id === pr.guard));
    }
    const svg = renderPanel(spec);
    for (const c of spec.controls) assert.equal((svg.match(new RegExp(`data-move="${c.id}"`, 'g')) ?? []).length, 1, `${spec.id}.${c.id}: one moving part`);
    assert.doesNotMatch(svg, /<image\b/);
    const zones = hitZones(spec);
    for (const z of zones) for (const v of z.box) assert.ok(Number.isFinite(v));
    for (const [w, h] of [spec.canvas]) for (const z of zones) {
      assert.ok(z.box[0] >= -1 && z.box[1] >= -1 && z.box[0] + z.box[2] <= w + 1 && z.box[1] + z.box[3] <= h + 1, `${spec.id}.${z.id} hit zone off the plate`);
    }
  }
});

test('shared components keep fixed sizes across panels (same art id, same size)', async () => {
  const comps = await read('src/data/cockpit/components.ts');
  assert.match(comps, /'toggle-large': \{ r: 5\.2/);
  const elec = await read('src/data/cockpit/f16c/elec.ts');
  const fuel = await read('src/data/cockpit/f16c/fuel.ts');
  for (const spec of [elec, fuel]) {
    assert.doesNotMatch(spec, /\br: \d/, 'panels place components by pivot and never size them');
    assert.match(spec, /rectify: 'python3 -I scripts\/panel-trace\.py/);
  }
});

test('panel page script is generic: no panel or control names in the engine', async () => {
  const comp = await read('src/components/cockpit/CockpitPanel.astro');
  const script = comp.split('<script>')[1];
  for (const name of ['elec', 'fuel', 'main-pwr', 'eng-feed', 'fuel-master']) assert.doesNotMatch(script, new RegExp(`['"]${name}['"]`));
  assert.match(script, /sessionStorage/);
});
