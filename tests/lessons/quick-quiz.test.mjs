import assert from 'node:assert/strict';
import test from 'node:test';
import { questionPool, scoreLine, withDistractors } from '../../src/lessons/shared/quick-quiz.mjs';

// A seeded generator so each run asks the same sequence.
function seeded(seed = 1) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

test('a question answered correctly is not asked again in the round (#69)', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];
  const pool = questionPool(items, seeded(7));
  const right = new Set();
  for (let n = 0; n < 50 && pool.remaining; n++) {
    const q = pool.next();
    assert.ok(!right.has(q), `${q} came back after a correct answer`);
    // Miss every other question so wrong answers stay in the pool.
    const correct = n % 2 === 0;
    pool.answer(q, correct);
    if (correct) right.add(q);
  }
  assert.equal(pool.remaining, 0);
  assert.deepEqual([...right].sort(), items);
  assert.equal(pool.next(), undefined);
});

test('a missed question stays in the round and is not asked twice in a row', () => {
  const pool = questionPool(['a', 'b', 'c'], seeded(3));
  let last;
  const seen = new Set();
  for (let n = 0; n < 30; n++) {
    const q = pool.next();
    assert.notEqual(q, last);
    seen.add(q);
    pool.answer(q, false);
    last = q;
  }
  assert.equal(pool.remaining, 3);
  assert.equal(seen.size, 3);
});

test('the last question left is asked again until it is answered', () => {
  const pool = questionPool(['a', 'b']);
  const first = pool.next();
  pool.answer(first, true);
  const other = pool.next();
  assert.notEqual(other, first);
  assert.equal(pool.next(), other);
  pool.answer(other, true);
  assert.equal(pool.remaining, 0);
});

test('reset puts every question back', () => {
  const pool = questionPool(['a', 'b']);
  pool.answer(pool.next(), true);
  pool.reset();
  assert.equal(pool.remaining, 2);
  assert.equal(pool.size, 2);
});

test('distractors include the answer once, with distinct others', () => {
  const random = seeded(11);
  for (let n = 0; n < 20; n++) {
    const options = withDistractors('c', ['a', 'b', 'c', 'd', 'e', 'f'], 4, random);
    assert.equal(options.length, 4);
    assert.equal(options.filter((o) => o === 'c').length, 1);
    assert.equal(new Set(options).size, 4);
  }
  assert.deepEqual(withDistractors('a', ['a', 'b'], 4).sort(), ['a', 'b']);
});

test('score line says how many are left', () => {
  assert.equal(scoreLine(2, 3, 4), '2 of 3. 4 left.');
  assert.equal(scoreLine(5, 7, 0), '5 of 7. All answered correctly.');
});
