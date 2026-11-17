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
  const { f16cCockpit, builtPanels, renderPanel, hitZones, dialIndicators } = await load();
  for (const { spec } of builtPanels(f16cCockpit)) {
    const placed = spec.placements.filter(p => 'control' in p).map(p => p.control);
    assert.deepEqual([...placed].sort(), spec.controls.map(c => c.id).sort(), `${spec.id}: placements and controls differ`);
    const lamps = spec.placements.flatMap(p => p.component === 'lamp-module' ? p.lamps.map(l => l.indicator) : p.component === 'lamp-round' ? [p.indicator] : (p.component === 'push-square' || p.component === 'gear-handle') && p.indicator ? [p.indicator] : p.component === 'gauge' ? dialIndicators(p) : []);
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

test('gauge scales increase and every tick and needle lands on the dial', { skip: !canImportTs }, async () => {
  const { f16cCockpit, builtPanels, dialAngle, tickValues, renderPanel } = await load();
  const gauges = builtPanels(f16cCockpit).flatMap(({ spec }) => spec.placements.filter(p => p.component === 'gauge').map(p => ({ spec, p })));
  assert.ok(gauges.length >= 4);
  for (const { spec, p } of gauges) {
    const { dial } = p, id = `${spec.id}.${p.indicator}`;
    for (let i = 1; i < dial.scale.length; i++) {
      assert.ok(dial.scale[i][0] > dial.scale[i - 1][0] && dial.scale[i][1] > dial.scale[i - 1][1], `${id}: scale knots increase`);
    }
    assert.ok(dial.scale.at(-1)[1] - dial.scale[0][1] < 360, `${id}: scale under one turn`);
    for (const t of dial.ticks) {
      assert.ok(t.r[0] < t.r[1] && t.r[1] < dial.face, `${id}: ticks inside the face`);
      for (const v of tickValues(t)) assert.ok(v >= dial.scale[0][0] && v <= dial.scale.at(-1)[0], `${id}: tick ${v} on the scale`);
    }
    assert.ok(p.indicator ? dial.needle && dial.hub < dial.needle && dial.needle < dial.face : dial.pointers?.length, `${id}: a needle between hub and face, or pointers`);
    const svg = renderPanel(spec);
    for (const ind of [p.indicator, ...(dial.pointers ?? []).map(q => q.indicator)].filter(Boolean)) {
      assert.equal(spec.indicators.find(i => i.id === ind)?.type, 'gauge', `${spec.id}.${ind}: gauge indicator`);
      assert.match(svg, new RegExp(`data-needle="${ind}"`));
    }
    if (dial.counter) {
      assert.equal(spec.indicators.find(i => i.id === dial.counter.indicator)?.type, 'counter');
      assert.equal((svg.match(new RegExp(`data-drum="${dial.counter.indicator}"`, 'g')) ?? []).length, dial.counter.drums);
    }
    assert.equal(dialAngle(dial, dial.scale[0][0] - 50), dial.scale[0][1], `${id}: needle stops at the bottom of the scale`);
  }
});

test('drum counters roll like an odometer', { skip: !canImportTs }, async () => {
  const { drumPositions } = await load();
  assert.deepEqual(drumPositions(7100, 5, 2, 100).map(v => +v.toFixed(3)), [0, 7, 1, 0, 0]);
  assert.deepEqual(drumPositions(7150, 5, 2, 100).map(v => +v.toFixed(3)), [0, 7, 1.5, 0.5, 0.5]);
  // The thousands drum turns only while the hundreds drum rolls from 9 to 0.
  assert.deepEqual(drumPositions(7950, 5, 2, 100).map(v => +v.toFixed(3)), [0, 7.5, 9.5, 0.5, 0.5]);
  assert.deepEqual(drumPositions(9950, 5, 2, 100).map(v => +v.toFixed(3)), [0.5, 9.5, 9.5, 0.5, 0.5]);
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
