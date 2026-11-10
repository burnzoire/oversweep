import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parse } from 'yaml';
import { PHONETIC, LIGHT_SIGNALS } from '../../src/lessons/radio/lesson-model.mjs';

// The Radio module's interactive figures keep their own copy of the phonetic
// alphabet and light gun signals; the tables the pages show come from the
// Reference Data record. These tests keep the two copies identical.
const record = (slug) => parse(readFileSync(new URL(`../../content/encyclopedia/reference-data/${slug}.md`, import.meta.url), 'utf8').split('---\n')[1]);
const table = (slug, id) => record(slug).tables.find((t) => t.id === id);
const signals = 'radio-and-visual-signals';

test('the phonetic alphabet matches the radio lesson model', () => {
  const morse = (m) => m.replaceAll('.', '·').replaceAll('-', '–');
  assert.deepEqual(table(signals, 'phonetic-alphabet').rows, PHONETIC.map((p) => ({ char: p.char, word: p.word, say: p.say, morse: morse(p.morse) })));
});

test('the light gun signals match the radio lesson model', () => {
  const rows = table(signals, 'light-gun-signals').rows;
  assert.equal(rows.length, LIGHT_SIGNALS.length);
  LIGHT_SIGNALS.forEach((s, i) => {
    assert.equal(rows[i].ground, s.ground);
    assert.equal(rows[i].flight, s.flight);
  });
});

test('every reference table row fills only its own columns', () => {
  for (const slug of [signals, 'units-and-conversions', 'standard-atmosphere', 'time-zones-and-date-time-groups', 'f-16-harm-threat-tables']) {
    for (const t of record(slug).tables) {
      const keys = new Set(t.columns.map((c) => c.key));
      for (const row of t.rows) for (const k of Object.keys(row)) assert.ok(keys.has(k), `${slug}/${t.id} row has unknown key ${k}`);
      for (const row of t.rows) for (const v of Object.values(row)) assert.ok(v === null || typeof v === 'string', `${slug}/${t.id} has a non-string cell ${v}`);
    }
  }
});
