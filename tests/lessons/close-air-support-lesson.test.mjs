import assert from 'node:assert/strict';
import test from 'node:test';
import { CONTROL_QUESTIONS, EXAMPLE, M_PER_NM, NINE_LINE, briefGeometry, digits, inWindow, lineQuestions, readback } from '../../src/lessons/close-air-support/lesson-model.mjs';

const near = (a, b, tol = 1e-9) => assert.ok(Math.abs(a - b) <= tol, `expected ${b}, got ${a}`);

test('the brief has nine numbered lines then remarks, in order', () => {
  assert.deepEqual(NINE_LINE.map((l) => l.line), [1, 2, 3, 4, 5, 6, 7, 8, 9, null]);
});

test('mandatory readback is lines 4 and 6 and the restrictions (JP 3-09.3 p. V-33)', () => {
  assert.deepEqual(NINE_LINE.filter((l) => l.readback).map((l) => l.id), ['elevation', 'location', 'remarks']);
  assert.equal(readback(), '450 feet, NV 1234 5678, final attack headings two four zero to three zero zero, TOT 1430');
});

test('headings are read as three sequential digits', () => {
  assert.equal(digits(180), 'one eight zero');
  assert.equal(digits(45), 'zero four five');
});

test('the IP lies on the reciprocal of line 2 at the line 3 distance', () => {
  const g = briefGeometry();
  near(g.ip[0], EXAMPLE.distanceNm, 1e-9);
  near(g.ip[1], 0, 1e-9);
  near(g.friendlies[1], -EXAMPLE.friendlies.meters / M_PER_NM, 1e-9);
  near(g.offsetSide[1], 1, 1e-9); // offset right of a westbound run-in is north
  const north = briefGeometry({ ...EXAMPLE, heading: 360, offset: 'left' });
  near(north.ip[1], -EXAMPLE.distanceNm, 1e-9);
  near(north.offsetSide[0], -1, 1e-9);
  assert.throws(() => briefGeometry({ ...EXAMPLE, distanceNm: 0 }), RangeError);
  assert.throws(() => briefGeometry({ ...EXAMPLE, friendlies: { dir: 'X', meters: 1 } }), RangeError);
});

test('the run-in heading falls inside the attack-heading window', () => {
  assert.ok(inWindow(EXAMPLE.heading, EXAMPLE.fah));
  assert.ok(!inWindow(200, EXAMPLE.fah));
  assert.ok(inWindow(10, [330, 30]));
  assert.ok(!inWindow(90, [330, 30]));
});

test('quiz questions have their answer among the options', () => {
  for (const q of CONTROL_QUESTIONS) assert.ok(q.options.includes(q.answer), q.ask);
  assert.equal(new Set(lineQuestions().map((q) => q.answer)).size, NINE_LINE.length);
});
