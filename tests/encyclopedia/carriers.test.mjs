import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { carrierDate, carrierEntryDate, carrierSearchText, validateCarriers } from '../../src/data/carrier-model.mjs';

const fixture = () => ({ slug: 'ship-one', name: 'Ship One', hull: 'R 1', class: 'Test class', origin: 'Country', commissioned: '1950-01-01', operators: ['First Navy', 'Second Navy'], aliases: ['Ship Two'], summary: 'A test hull, renamed after transfer.', sources: [{ title: 'History', publisher: 'Naval archive', url: 'https://example.org/ship', accessed: '2026-10-29' }] });

test('one hull can have several names and navies; search finds all identities', () => {
  const entry = fixture();
  assert.deepEqual(validateCarriers([entry]), []);
  for (const term of ['ship one', 'r 1', 'ship two', 'second navy']) assert.ok(carrierSearchText(entry).includes(term));
});

test('carrier search accepts names without their diacritics', () => {
  const search = carrierSearchText({ ...fixture(), name: 'São Paulo', aliases: ['Hyūga'] });
  for (const name of ['sao paulo', 'hyuga', 'são paulo', 'hyūga']) assert.ok(search.includes(name), name);
});

test('commissioning boundary excludes wartime ships and rejects impossible dates', () => {
  for (const value of ['1945-09-02', '1945', '1945-09-31', '2027-01-01']) {
    assert.ok(validateCarriers([{ ...fixture(), commissioned: value }]).length, value);
  }
  assert.deepEqual(validateCarriers([{ ...fixture(), commissioned: '1945-09-03' }]), []);
  assert.deepEqual(validateCarriers([{ ...fixture(), commissioned: '1950' }]), []);
});

test('completed but never commissioned hulls use their documented completion', () => {
  const entry = { ...fixture(), completed: '1946-08-30', commissioned: null, operators: [] };
  assert.deepEqual(validateCarriers([entry]), []);
  assert.equal(carrierEntryDate(entry), '1946-08-30');
  assert.ok(validateCarriers([{ ...entry, completed: undefined }]).length);
  assert.match(validateCarriers([{ ...fixture(), operators: [] }]).join('\n'), /operators must/);
  assert.match(validateCarriers([{ ...entry, commissioned: '1944-01-01' }]).join('\n'), /commissioned is outside/);
  assert.match(validateCarriers([{ ...fixture(), completed: '2027-01-01' }]).join('\n'), /completed is outside/);
});

test('duplicate hull identities, missing names and missing evidence fail validation', () => {
  assert.match(validateCarriers([fixture(), { ...fixture(), slug: 'another-slug' }]).join('\n'), /duplicate origin, class and hull/);
  assert.deepEqual(validateCarriers([fixture(), { ...fixture(), slug: 'later-ship', class: 'Later class' }]), []);
  assert.match(validateCarriers([{ ...fixture(), name: '', sources: [] }]).join('\n'), /name is missing/);
  assert.match(validateCarriers([{ ...fixture(), sources: [{}] }]).join('\n'), /each source needs/);
});

test('dates retain the precision provided by sources', () => {
  assert.equal(carrierDate('1950'), '1950');
  assert.equal(carrierDate('1950-01-01'), '1 Jan 1950');
});

test('the real carrier registry passes the same boundary and source checks', () => {
  const entries = JSON.parse(readFileSync(new URL('../../src/data/carriers.json', import.meta.url), 'utf8'));
  assert.deepEqual(validateCarriers(entries), []);
});
