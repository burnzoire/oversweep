import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCarrierProfiles, carrierClassRoute } from '../../src/data/carrier-profile-model.mjs';

const registry = [{ slug: 'ship-one', class: 'Test class' }, { slug: 'ship-two', class: 'Other class' }];
const source = () => ({ id: 'archive', title: 'History', publisher: 'Naval archive', url: 'https://example.org/history', accessed: '2026-10-29' });
const fixture = () => ({ classes: [{ slug: 'test-class', name: 'Test class', registryClass: 'Test class', summary: 'Class history.', summaryCites: ['archive'], asOf: '2026-10-29', facts: [{ label: 'Role', value: 'Aircraft carrier', cites: ['archive'] }], sections: [{ title: 'Design', text: 'Class design.', cites: ['archive'] }], sources: [source()] }], ships: [{ carrier: 'ship-one', overview: { text: 'Ship history.', cites: ['archive'] }, milestones: [{ date: '1950', text: 'Commissioned.', cites: ['archive'] }], sources: [source()] }] });
const errors = (data) => validateCarrierProfiles(data, registry).join('\n');

test('separate class and hull source scopes accept the same source id', () => {
  assert.deepEqual(validateCarrierProfiles(fixture(), registry), []);
  assert.equal(carrierClassRoute(fixture().classes[0]), 'encyclopedia/carriers/classes/test-class/');
  assert.deepEqual(validateCarrierProfiles({ classes: [], ships: [] }, registry), []);
});

test('profile references and uniqueness preserve registry identities', () => {
  for (const [collection, expected] of [['classes', /duplicate class slug/], ['ships', /duplicate ship profile/]]) {
    const data = fixture(); data[collection].push(structuredClone(data[collection][0])); assert.match(errors(data), expected);
  }
  const duplicate = fixture(); duplicate.classes.push({ ...structuredClone(duplicate.classes[0]), slug: 'another-class' });
  assert.match(errors(duplicate), /duplicate registry class/);
  for (const carrier of ['unknown', 'ship-two']) {
    const data = fixture(); data.ships[0].carrier = carrier; assert.match(errors(data), /exact/);
  }
  const data = fixture(); data.classes[0].registryClass = 'test class'; assert.match(errors(data), /does not match/);
});

test('every summary, fact, section, overview and milestone requires local evidence', () => {
  for (const mutate of [
    (data) => data.classes[0].summaryCites = [],
    (data) => data.classes[0].facts[0].cites = [],
    (data) => data.classes[0].sections[0].cites = ['missing'],
    (data) => data.ships[0].overview.cites = [],
    (data) => data.ships[0].milestones[0].cites = ['missing'],
  ]) { const data = fixture(); mutate(data); assert.match(errors(data), /requires citations|unknown source/); }
  const data = fixture(); data.ships[0].sources[0].id = 'ship-only'; assert.match(errors(data), /unknown source archive/);
});

test('empty content, invalid evidence and duplicate source IDs are rejected', () => {
  for (const mutate of [
    (data) => data.classes[0].facts = [],
    (data) => data.classes[0].sections = [],
    (data) => data.ships[0].milestones = [],
    (data) => data.ships[0].overview.text = '',
    (data) => data.classes[0].sources = [],
    (data) => data.classes[0].sources[0].url = 'javascript:alert(1)',
    (data) => data.classes[0].sources.push(source()),
    (data) => data.classes[0].facts = [null],
    (data) => data.classes[0].sources[0].id = 12,
  ]) { const data = fixture(); mutate(data); assert.notEqual(errors(data), ''); }
  assert.notEqual(errors(null), '');
});

test('snapshot, access and event dates reject impossible and future dates, retaining year precision', () => {
  for (const date of ['2026-02-30', '2026-10-30', 'invalid']) {
    const data = fixture(); data.classes[0].asOf = date; assert.match(errors(data), /asOf/);
  }
  for (const date of ['2026-02-30', '2026-10-30', '2027', '0000', 1950]) {
    const data = fixture(); data.ships[0].milestones[0].date = date; assert.match(errors(data), /milestone date/);
  }
  const data = fixture(); data.classes[0].asOf = '2026-10-28'; assert.match(errors(data), /accessed after profile snapshot/);
  const leap = fixture(); leap.ships[0].milestones[0].date = '2000-02-29'; assert.equal(errors(leap), '');
});

test('generated profile checks catch missing history, member links and citation anchors', async () => {
  const { mkdtemp, mkdir, writeFile, rm } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const path = await import('node:path');
  const { checkCarrierProfiles } = await import('../../scripts/check_carrier_profiles.mjs');
  const dist = await mkdtemp(path.join(tmpdir(), 'carrier-profiles-'));
  const data = fixture();
  const common = '<p>Drafted — not technically validated</p><section data-class-profile="test-class"><a href="#class-source-archive">[1]</a><li id="class-source-archive">Class source</li></section><a href="/review/manual/naval-operations/ship-operations/">Naval Operations</a>';
  const classPage = `${common}<a href="/review/encyclopedia/carriers/ship-one/">Ship One</a>`;
  const hullPage = `${common}<section data-ship-profile="ship-one"><a href="#history-source-archive">[1]</a><li id="history-source-archive">History source</li></section><a href="/review/encyclopedia/carriers/classes/test-class/">Test class</a><h2 id="carrier-sources">Identity sources</h2>`;
  const put = async (route, html) => { const folder = path.join(dist, route); await mkdir(folder, { recursive: true }); await writeFile(path.join(folder, 'index.html'), html); };
  const run = () => checkCarrierProfiles({ dist, profiles: data, carriers: registry, base: '/review' });
  try {
    await put('encyclopedia/carriers', '<a href="/review/encyclopedia/carriers/classes/test-class/">Test class</a>');
    await put('encyclopedia/carriers/classes/test-class', classPage);
    await put('encyclopedia/carriers/ship-one', hullPage);
    assert.deepEqual(await run(), []);
    await put('encyclopedia/carriers/ship-one', hullPage.replace('id="history-source-archive"', 'id="missing"'));
    assert.match((await run()).join('\n'), /unresolved citation #history-source-archive/);
    await put('encyclopedia/carriers/ship-one', `${hullPage}<p id="carrier-sources">duplicate</p>`);
    assert.match((await run()).join('\n'), /duplicate HTML ids/);
    await put('encyclopedia/carriers/classes/test-class', common);
    assert.match((await run()).join('\n'), /missing member link ship-one/);
    data.ships = [];
    assert.match((await run()).join('\n'), /ship history profile is missing/);
  } finally { await rm(dist, { recursive: true, force: true }); }
});
