import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BREVITY, PHONETIC, altitude, callSign, checkCall, checkReadback, codePath, direction, frequency, lostCommsAltitudes,
  lostCommsRoute, mach, safeOrder, speed, spell, squawk, time, shareFrequency, BUSY_FREQUENCY, YOUR_CALL,
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
  // Off-grid input is rejected, not rounded across the 18,000 ft boundary.
  assert.throws(() => altitude(17950));
  assert.throws(() => altitude(NaN));
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
  assert.throws(() => direction(NaN));
  assert.throws(() => direction(1000));
  assert.throws(() => speed(-190));
  assert.throws(() => mach(-0.64));
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

// Figure 1's traffic, untouched: Approach 0.4–3.8, Navy 405 4.4–6.8, Army
// 26019 10.0–13.8, ... REACH 451 owes a reply from 28.7 and answers at 35.7.
const run = (...keys) => shareFrequency(BUSY_FREQUENCY, keys, YOUR_CALL);
const kinds = (...keys) => run(...keys).results.map((r) => r.kind);

test('a call into a quiet frequency with no reply owed is clear, and later stations wait for it', () => {
  assert.deepEqual(kinds(7), ['clear']);
  const { log } = run(7);
  const army = log.find((x) => x.who === '26019');
  const answer = log.find((x) => x.words === YOUR_CALL.answer.words);
  // Army 26019 would have keyed at 10.0, inside your call; it heard you and went after the answer.
  assert.ok(answer.start >= 10 && army.start > answer.end);
  assert.ok(log.every((x) => !x.garbled));
});

test('keying over a transmission in progress loses both, and the other call is repeated', () => {
  assert.deepEqual(kinds(10.3), ['busy']);
  const { log } = run(10.3);
  assert.equal(log.filter((x) => x.who === '26019' && x.words.includes('request')).length, 2);
  assert.ok(log.find((x) => x.who === '26019').garbled);
});

test('a reply owed makes silence not clear', () => {
  assert.deepEqual(kinds(4), ['stepped']); // readback due at 4.4
  assert.deepEqual(kinds(30), ['cut-in']); // REACH 451 owes a reply
  assert.equal(run(30).log.find((x) => x.start > 30 && x.who === 'APP').words, YOUR_CALL.standBy.words);
});

test('only a station keying within the reaction time can double with you', () => {
  assert.deepEqual(kinds(9.8), ['doubled']); // Army keys 0.2 s later
  assert.deepEqual(kinds(9.4), ['clear']); // 0.6 s: it hears you and waits
});

test('calling again before your answer comes is too soon', () => {
  assert.deepEqual(kinds(7, 10.5), ['clear', 'too-soon']);
  assert.deepEqual(kinds(7, 13), ['clear', 'clear']);
});

// Navy sortie: expectations written by hand from the VT-10 script, pp. 19–35.
import { SORTIE, TRAINING_CALLS } from '../../src/lessons/radio/lesson-model.mjs';

test('Navy sortie runs ATIS, clearance, base, ground, tower, departure in that order', () => {
  const first = (phase) => SORTIE.findIndex((c) => c.phase === phase);
  assert.deepEqual(['ATIS', 'Clearance', 'Base', 'Ground', 'Tower', 'Departure'].map(first), [0, 1, 2, 3, 5, 6]);
  assert.equal(SORTIE.at(-1).station, 'KATT Base');
  assert.equal(SORTIE.length, 17);
});

test('every Navy initial call names the station first, then KATT 11', () => {
  for (const c of SORTIE.filter((x) => x.call)) {
    assert.ok(c.call.startsWith(`${c.station}, KATT 11`), c.call);
  }
});

test('every Navy readback starts with the call sign; takeoff and landing readbacks carry the runway', () => {
  for (const c of SORTIE.filter((x) => x.readback)) assert.ok(c.readback.startsWith('KATT 11, '), c.readback);
  const takeoff = SORTIE.find((c) => /cleared for takeoff/.test(c.reply));
  const landing = SORTIE.find((c) => /cleared to land/.test(c.reply));
  assert.match(takeoff.readback, /Runway 7 right/);
  assert.match(landing.readback, /7 Right/);
});

test('preset channels are consistent through the sortie', () => {
  const channels = (station) => new Set(SORTIE.filter((c) => c.station === station).map((c) => c.radio));
  assert.deepEqual([...channels('Sherman Tower')], ['UHF 4']);
  assert.deepEqual([...channels('Sherman Ground')], ['UHF 3']);
  assert.deepEqual([...channels('KATT Base')], ['UHF 19']);
  // IFR is cancelled with approach on VHF 5; the course-rules call is on UHF 6.
  assert.deepEqual([...channels('Pensacola Approach')].sort(), ['UHF 6', 'VHF 5']);
});

test('the Navy clearance and ground calls are in AIM 4-2-3 order', () => {
  assert.equal(checkCall(['facility', 'identification', 'request']).ok, true);
  assert.equal(checkCall(['identification', 'facility', 'request']).ok, false);
});

test('training-rule calls cover the P-1289 safety words', () => {
  assert.deepEqual(TRAINING_CALLS.map((t) => t.call), ['Knock it off', 'Terminate', 'Fight’s on', 'Blind', 'No joy']);
  assert.ok(TRAINING_CALLS.every((t) => /^\d-\d+$/.test(t.page)));
});

test('a Navy takeoff readback needs only the call sign and runway', () => {
  const clearance = [{ id: 'id', kind: 'identification' }, { id: 'wind', kind: 'wind' }, { id: 'rwy', kind: 'runway' }, { id: 'freq', kind: 'frequency' }];
  assert.equal(checkReadback(clearance, ['id', 'rwy']).ok, true);
  assert.deepEqual(checkReadback(clearance, ['id', 'rwy', 'freq']).extra, ['freq']);
  assert.deepEqual(checkReadback(clearance, ['rwy']).missing, ['id']);
});

test('brevity words are unique, defined and page-cited', () => {
  const words = BREVITY.map((b) => b.word);
  assert.equal(new Set(words).size, words.length);
  for (const b of BREVITY) {
    assert(b.meaning.length > 10, b.word);
    assert.match(b.page, /^\d+$/, b.word);
  }
  for (const w of ['Knock-it-off', 'Bingo', 'Joker', 'No joy', 'Popeye']) assert(words.includes(w), w);
});
