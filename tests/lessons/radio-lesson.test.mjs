import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PHONETIC, altitude, callSign, checkCall, checkReadback, codePath, direction, frequency, lostCommsAltitudes,
  lostCommsRoute, mach, safeOrder, speed, spell, squawk, time, transmit,
} from '../../src/lessons/radio/lesson-model.mjs';

// Expected strings are the AIM 4-2 examples, written out by hand.
test('phonetic table covers A–Z and 0–9 with AIM spellings', () => {
  assert.equal(PHONETIC.length, 36);
  const word = Object.fromEntries(PHONETIC.map((p) => [p.char, p.word]));
  assert.equal(word.A, 'Alfa');
  assert.equal(word.J, 'Juliett');
  assert.equal(word.X, 'Xray');
  assert.equal(PHONETIC.find((p) => p.char === '9').say, 'NIN-ER');
  assert.equal(PHONETIC.find((p) => p.char === '3').say, 'TREE');
});

test('figures and altitudes (4-2-8, 4-2-9)', () => {
  assert.equal(altitude(500).spoken, 'five hundred');
  assert.equal(altitude(4500).spoken, 'four thousand five hundred');
  assert.equal(altitude(10000).spoken, 'one zero thousand');
  assert.equal(altitude(12000).spoken, 'one two thousand');
  assert.equal(altitude(13500).spoken, 'one three thousand five hundred');
  assert.equal(altitude(17900).spoken, 'one seven thousand niner hundred');
  assert.equal(altitude(18000).spoken, 'flight level one eight zero');
  assert.equal(altitude(19000).spoken, 'flight level one niner zero');
  assert.equal(altitude(27500).spoken, 'flight level two seven five');
});

test('directions, speeds, Mach (4-2-10, 4-2-11)', () => {
  assert.equal(direction(100).spoken, 'heading one zero zero');
  assert.equal(direction(220, { kind: 'wind' }).spoken, 'wind two two zero');
  assert.equal(direction(50, { kind: 'course', isTrue: true }).spoken, 'zero five zero true');
  assert.equal(speed(250).spoken, 'two five zero knots');
  assert.equal(speed(190).spoken, 'one niner zero knots');
  assert.equal(mach(1.5).spoken, 'Mach one point five');
  assert.equal(mach(0.64).spoken, 'Mach point six four');
  assert.throws(() => direction(0));
});

test('frequencies, time, codes', () => {
  assert.equal(frequency('122.1').spoken, 'one two two point one');
  assert.equal(frequency('243.0', { icao: true }).spoken, 'two four three decimal zero');
  assert.equal(time('0920').spoken, 'zero niner two zero Zulu');
  assert.throws(() => time('2460'));
  assert.equal(squawk('7600').spoken, 'squawk seven six zero zero');
  assert.throws(() => squawk('1280'));
  assert.equal(spell('N5CT').spoken, 'November five Charlie Tango');
});

test('civil call signs drop the N; abbreviation keeps the last three (4-2-4)', () => {
  const c = callSign('Aztec', 'N2464A');
  assert.equal(c.full, 'Aztec Two Four Six Four Alfa');
  assert.equal(c.abbreviated, 'Aztec Six Four Alfa');
  assert.equal(callSign('Bonanza', '655G').full, 'Bonanza Six Five Five Golf');
});

test('initial call order (4-2-3a)', () => {
  assert.deepEqual(checkCall(['facility', 'identification', 'position', 'request']), { ok: true });
  assert.deepEqual(checkCall(['facility', 'identification', 'request']), { ok: true });
  const wrong = checkCall(['identification', 'facility', 'request']);
  assert.equal(wrong.ok, false);
  assert.equal(wrong.said, 'facility');
});

test('readback: altitude, vector, runway and identification (4-4-7)', () => {
  const clearance = [
    { id: 'id', kind: 'identification' }, { id: 'hdg', kind: 'vector' }, { id: 'alt', kind: 'altitude' },
    { id: 'alt-set', kind: 'altimeter' },
  ];
  assert.equal(checkReadback(clearance, ['id', 'hdg', 'alt']).ok, true);
  const r = checkReadback(clearance, ['hdg', 'alt-set']);
  assert.deepEqual(r.missing, ['id', 'alt']);
  assert.deepEqual(r.extra, ['alt-set']);
});

test('code change 2700 → 7200 avoids 7700 by changing the second digit first (4-1-20)', () => {
  assert.deepEqual(codePath('2700', '7200', [0, 1]), ['7700', '7200']);
  assert.deepEqual(safeOrder('2700', '7200'), { order: [1, 0], path: ['2200', '7200'] });
  assert.deepEqual(safeOrder('1200', '4521').path.at(-1), '4521');
});

test('lost comms route priority and highest altitude per segment (6-4-1c)', () => {
  assert.equal(lostCommsRoute({ vectored: true }), 'vectored');
  assert.equal(lostCommsRoute({ assigned: true }), 'assigned');
  assert.equal(lostCommsRoute({ assigned: false, expected: true }), 'expected');
  assert.equal(lostCommsRoute({ assigned: false }), 'filed');
  // Assigned 5,000; minimums 2,000 / 6,000 / 4,000; expect 8,000 from segment 2.
  const segs = lostCommsAltitudes({
    segments: [{ minimum: 2000 }, { minimum: 6000 }, { minimum: 4000 }], assigned: 5000,
    expected: { altitude: 8000, fromSegment: 2 },
  });
  assert.deepEqual(segs.map((s) => [s.altitude, s.source]), [[5000, 'assigned'], [6000, 'minimum'], [8000, 'expected']]);
});

test('transmission collides with a busy interval', () => {
  const busy = [[2, 5], [9, 12]];
  assert.equal(transmit(busy, 5.5, 3).blocked, false);
  assert.equal(transmit(busy, 7, 3).blocked, true);
});
