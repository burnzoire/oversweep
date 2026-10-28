import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { currentUse, longestRunwayFt, periodText, searchTerms, validateCatalogue } from '../../src/data/airfield-model.mjs';

// Airfields live in one category; theatres and their sim maps in another.
const categories = ['airfields-carriers', 'theatres'];
const registry = JSON.parse(readFileSync(fileURLToPath(new URL('../../src/data/encyclopedia.json', import.meta.url)), 'utf8'));
const content = categories.flatMap((category) => {
  const dir = fileURLToPath(new URL(`../../content/encyclopedia/${category}/`, import.meta.url));
  return readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => ({
    category,
    slug: f.replace(/\.md$/, ''),
    data: parse(readFileSync(dir + f, 'utf8').split('---\n')[1]),
  }));
});
const bySlug = (slug) => content.find((e) => e.slug === slug).data;

// The smallest valid catalogue: one theatre, one map and one airfield.
const source = { n: 1, title: 'T', publisher: 'P', url: 'https://example.org', accessed: '2026-10-28' };
const photo = { src: 'a.jpg', alt: 'a', caption: 'c', author: 'x', licence: 'Public domain', sourceUrl: 'https://example.org', accessed: '2026-10-28' };
const fixture = () => [
  { slug: 'region', data: { kind: 'theatre', name: 'Region', region: 'Somewhere', countries: ['us'], photos: [photo], sources: [source] } },
  { slug: 'sim-map', data: { kind: 'map', sim: 'dcs', short: 'Map', name: 'DCS: Map', publisher: 'ED', setting: { era: 'modern', text: 'Today [1]' }, area: 'Big [1]', theatres: ['region'], sources: [source] } },
  { slug: 'field', data: {
    kind: 'airfield', name: 'Field', status: 'active', country: 'us', location: 'Here [1]',
    coordinates: { lat: 1, lon: 2, cite: '[1]' }, elevationFt: 10, elevationCite: '[1]',
    opened: { year: 1950, text: '1950 [1]' }, roles: ['fighter'],
    operators: [{ name: 'US Air Force', nation: 'us', branch: 'air-force', cite: '[1]' }],
    units: [{ name: 'Wing', nation: 'us', branch: 'air-force', basing: 'permanent', cite: '[1]' }],
    facilities: { runways: [{ id: '09/27', lengthFt: 9000, cite: '[1]' }] },
    theatres: ['region'],
    maps: [{ map: 'sim-map', status: 'represented', checked: '2026-10-28', cite: '[1]' }],
    photos: [photo], sources: [source],
  } },
];

test('the minimal fixture is valid', () => {
  assert.deepEqual(validateCatalogue(fixture()), []);
});

test('relationships must name existing theatres and maps', () => {
  const entries = fixture();
  entries[2].data.theatres = ['nowhere'];
  entries[2].data.maps[0].map = 'no-map';
  entries[1].data.theatres = ['elsewhere'];
  const problems = validateCatalogue(entries).join('\n');
  assert.match(problems, /unknown theatre "nowhere"/);
  assert.match(problems, /no map record "no-map"/);
  assert.match(problems, /map sim-map: names unknown theatre "elsewhere"/);
});

test('required fields, controlled values, dates and citations are checked', () => {
  const entries = fixture();
  const f = entries[2].data;
  delete f.location;
  f.country = 'atlantis';
  f.roles = ['sightseeing'];
  f.units[0].basing = 'forever';
  f.units[0].from = '1999';
  f.units[0].to = '1990';
  f.operators[0].cite = '[7]';
  f.facilities.runways[0].lengthFt = '9,000';
  const problems = validateCatalogue(entries).join('\n');
  for (const pattern of [/location is missing/, /country "atlantis"/, /unknown role "sightseeing"/, /basing "forever"/, /ends \(1990\) before it starts \(1999\)/, /cites \[7\], which is not in its sources/, /lengthFt must be a number/])
    assert.match(problems, pattern);
});

test('coverage claims need a source, and sim facts belong only to represented maps', () => {
  const entries = fixture();
  Object.assign(entries[2].data.maps[0], { status: 'absent', cite: undefined, facts: ['Tower 1 MHz [1]'] });
  const problems = validateCatalogue(entries).join('\n');
  assert.match(problems, /cite is missing/);
  assert.match(problems, /only a represented airfield can have sim facts/);
  const unchecked = fixture();
  Object.assign(unchecked[2].data.maps[0], { status: 'unchecked', cite: undefined });
  assert.match(validateCatalogue(unchecked).join('\n'), /needs a note/);
});

test('derived values: longest paved runway, current use, periods and search terms', () => {
  assert.equal(longestRunwayFt([{ lengthFt: 15024 }, { lengthFt: 29487, unpaved: true }, { lengthFt: null }]), 15024);
  assert.equal(longestRunwayFt([{ lengthFt: null }]), null);
  assert.equal(currentUse([{ branch: 'marines' }, { branch: 'civil' }]), 'joint');
  assert.equal(currentUse([{ branch: 'civil' }, { branch: 'navy', to: '1945' }, { branch: 'army', ended: true }]), 'civil');
  assert.equal(periodText({ from: '1957', to: '1969' }), '1957–1969');
  assert.equal(periodText({ from: '1975' }), 'since 1975');
  assert.equal(periodText({ asOf: '2026-03' }), 'as of Mar 2026');
  assert.equal(periodText({ from: '1944-10-12', to: '1945-12' }), '12 Oct 1944 – Dec 1945');
  assert.equal(periodText({ from: '1948-07', ended: true }), 'from Jul 1948, end not given');
  assert.equal(periodText({ asOf: '1945', ended: true }), 'as of 1945');
  assert.equal(periodText({}), null);
  const terms = searchTerms('saipan', bySlug('saipan'), ['Aslito']);
  for (const word of ['isely field', 'aslito', 'pgsn', 'spn', 'gsn']) assert.ok(terms.includes(word), word);
});

test('the real airfield, theatre and sim map content is valid and registered', () => {
  const plans = new Set(readdirSync(fileURLToPath(new URL('../../src/data/airfield-plans/', import.meta.url))).map((f) => f.replace(/\.json$/, '')));
  assert.deepEqual(validateCatalogue(content, { plans }), []);
  for (const category of categories) {
    const registered = registry.filter((r) => r.category === category).map((r) => r.slug).sort();
    assert.deepEqual(content.filter((e) => e.category === category).map((e) => e.slug).sort(), registered, category);
  }
  // Airfields sit in their category, theatres and maps in the other.
  for (const e of content) assert.equal(e.category === 'airfields-carriers', e.data.kind === 'airfield', e.slug);
  // Every sim map is listed under a theatre.
  for (const e of content.filter((x) => x.data.kind === 'map')) assert.ok(e.data.theatres?.length, e.slug);
});

test('representative cases: international, historical and multi-map', () => {
  // A UK base in a UK territory on Cyprus, with a US tenant unit.
  const akrotiri = bySlug('akrotiri');
  assert.equal(akrotiri.country, 'akrotiri-dhekelia');
  assert.ok(akrotiri.units.some((u) => u.nation === 'us'));
  // Historical names and operators with periods; two maps of two eras.
  const saipan = bySlug('saipan');
  assert.ok(saipan.names.some((n) => n.name === 'Isely Field' && n.former));
  assert.ok(saipan.operators.some((o) => o.nation === 'japan' && o.to));
  assert.deepEqual(saipan.maps.map((m) => [m.map, m.status]), [['dcs-marianas', 'represented'], ['dcs-marianas-1944', 'represented']]);
  // Joint military and civil use.
  assert.equal(currentUse(bySlug('yuma').operators), 'joint');
  // A base with no map checked is not claimed to be absent from any.
  assert.equal(bySlug('pensacola').maps, undefined);
});

test('generated DCS map tables belong to map records and contain every represented airfield', () => {
  const tableDir = fileURLToPath(new URL('../../src/data/map-airfields/', import.meta.url));
  for (const file of readdirSync(tableDir).filter((f) => f.endsWith('.json'))) {
    const table = JSON.parse(readFileSync(tableDir + file, 'utf8'));
    assert.equal(file, `${table.map}.json`);
    assert.equal(content.find((e) => e.slug === table.map)?.data.kind, 'map', table.map);
    assert.match(table.source.url, new RegExp(table.source.commit));
    const names = new Set(table.airfields.map((a) => a.name));
    for (const e of content.filter((x) => x.data.kind === 'airfield'))
      for (const m of (e.data.maps ?? []).filter((x) => x.map === table.map && x.status === 'represented'))
        assert.ok(names.has(m.inSimName), `${e.slug}: "${m.inSimName}" is not in ${file}`);
  }
});
