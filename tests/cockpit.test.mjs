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
  const { f16cCockpit, builtPanels, renderPanel, hitZones, placementIndicators } = await load();
  for (const { spec } of builtPanels(f16cCockpit)) {
    const placed = spec.placements.flatMap(p => 'control' in p ? [p.control, ...('cross' in p ? [p.cross] : [])] : []);
    assert.deepEqual([...placed].sort(), spec.controls.map(c => c.id).sort(), `${spec.id}: placements and controls differ`);
    const lamps = spec.placements.flatMap(placementIndicators);
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
  const { f16cCockpit, builtPanels, dialAngle, tickValues, renderPanel, readings } = await load();
  const gauges = builtPanels(f16cCockpit).flatMap(({ spec }) => spec.placements.filter(p => p.component === 'gauge').map(p => ({ spec, p })));
  assert.ok(gauges.length >= 4);
  for (const { spec, p } of gauges) {
    const { dial } = p, id = `${spec.id}.${p.indicator}`;
    for (let i = 1; i < dial.scale.length; i++) {
      assert.ok(dial.scale[i][0] > dial.scale[i - 1][0] && dial.scale[i][1] > dial.scale[i - 1][1], `${id}: scale knots increase`);
    }
    assert.ok(dial.turn ? dial.scale.at(-1)[1] - dial.scale[0][1] === 360 && dial.scale.at(-1)[0] - dial.scale[0][0] === dial.turn : dial.scale.at(-1)[1] - dial.scale[0][1] < 360, `${id}: scale under one turn (or exactly one for a needle that goes round)`);
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
      // A counter that shows the needle's own reading (altimeter) shares its gauge indicator.
      assert.equal(spec.indicators.find(i => i.id === dial.counter.indicator)?.type, dial.counter.indicator === p.indicator ? 'gauge' : 'counter');
      assert.equal((svg.match(new RegExp(`data-drum="${dial.counter.indicator}"`, 'g')) ?? []).length, dial.counter.drums);
    }
    if (dial.turn) {
      // A needle that goes round keeps turning: one turn further up the scale is 360° further round.
      assert.equal(dialAngle(dial, dial.scale[0][0] + 250 + dial.turn), dialAngle(dial, dial.scale[0][0] + 250) + 360, `${id}: needle goes round`);
      const r = readings(spec)[p.indicator];
      if (dial.counter?.indicator === p.indicator) assert.ok(r.kind === 'needle' && r.counter && r.turn === dial.turn, `${id}: one reading moves needle and drums`);
    } else assert.equal(dialAngle(dial, dial.scale[0][0] - 50), dial.scale[0][1], `${id}: needle stops at the bottom of the scale`);
  }
});

test('drum counters roll like an odometer', { skip: !canImportTs }, async () => {
  const { drumPositions } = await load();
  assert.deepEqual(drumPositions(7100, 5, 2, 100).map(v => +v.toFixed(3)), [0, 7, 1, 0, 0]);
  assert.deepEqual(drumPositions(7150, 5, 2, 100).map(v => +v.toFixed(3)), [0, 7, 1.5, 0.5, 0.5]);
  // The thousands drum turns only while the hundreds drum rolls from 9 to 0.
  assert.deepEqual(drumPositions(7950, 5, 2, 100).map(v => +v.toFixed(3)), [0, 7.5, 9.5, 0.5, 0.5]);
  assert.deepEqual(drumPositions(9950, 5, 2, 100).map(v => +v.toFixed(3)), [0.5, 9.5, 9.5, 0.5, 0.5]);
  // Decimal units (barometric window, 0.01 in Hg) land on whole digits.
  assert.deepEqual(drumPositions(29.92, 4, 0, 0.01), [2, 9, 9, 2]);
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

test('displays draw every page they list and readouts format like the page script', { skip: !canImportTs }, async () => {
  const { f16cCockpit, builtPanels, renderPanel, readings, readoutDigits } = await load();
  const shown = builtPanels(f16cCockpit).filter(({ spec }) => spec.indicators.some(i => i.type === 'display'));
  assert.ok(shown.some(({ spec }) => spec.id === 'ded') && shown.some(({ spec }) => spec.id === 'ehsi'));
  for (const { spec } of shown) {
    const svg = renderPanel(spec), r = readings(spec);
    for (const ind of spec.indicators.filter(i => i.pages)) {
      assert.equal(r[ind.id]?.kind, 'page', `${spec.id}.${ind.id}: page reading`);
      for (const pg of ind.pages) assert.match(svg, new RegExp(`data-page-of="${ind.id}" data-page="${pg.id}"`), `${spec.id}.${ind.id}: page ${pg.id} drawn`);
    }
  }
  const ded = shown.find(({ spec }) => spec.id === 'ded').spec;
  for (const pg of ded.placements[0].display.pages) for (const line of pg.lines) assert.ok(line.replace(/[{}]/g, '').length <= 24, `ded ${pg.id}: 24 characters a line`);
  assert.deepEqual(readoutDigits(15.94, 3, true), { whole: '015', tenth: '9' });
  assert.deepEqual(readoutDigits(65, 3, false), { whole: '065', tenth: '' });
});

test('HUD symbols each have a reading and print like the figure', { skip: !canImportTs }, async () => {
  const { f16cCockpit, builtPanels, renderPanel, readings, placementIndicators } = await load();
  const { formatReadout } = await import('../src/data/cockpit/readout.ts');
  const hud = builtPanels(f16cCockpit).find(({ spec }) => spec.id === 'hud').spec;
  const r = readings(hud), ids = hud.placements.flatMap(placementIndicators);
  for (const id of ids) {
    assert.ok(hud.indicators.some(i => i.id === id), `hud.${id}: indicator defined`);
    assert.ok(r[id], `hud.${id}: drivable`);
  }
  const svg = renderPanel(hud, { state: { screen: 'on' } });
  for (const s of ['8,360', '002:55', '019.5', '0.61', 'AL', 'NAV']) assert.ok(svg.includes(s), `hud shows ${s}`);
  assert.equal(formatReadout(8363, { comma: true, round: 10 }), '8,360');
  assert.equal(formatReadout(175, { clock: true, pad: 3 }), '002:55');
  assert.equal(formatReadout(19.5, { pad: 3, decimals: 1 }), '019.5');
  assert.equal(formatReadout(-1.04, { decimals: 1 }), '-1.0');
});
