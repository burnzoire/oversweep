import assert from 'node:assert/strict';
import test from 'node:test';
import { ATTACK_STEPS, EXAMPLE, FIRE_MODES, MOVEMENT, PROFILES, QUESTIONS, aglFt, bearingTo, exposure, line3, movementFor, profilePath, reliefFt, rwAltitudeBand } from '../../src/lessons/rotary-wing-attack/lesson-model.mjs';

test('rotary-wing altitude bands follow JP 3-09.3 p. III-90', () => {
  assert.equal(rwAltitudeBand(0), 'low');
  assert.equal(rwAltitudeBand(499), 'low');
  assert.equal(rwAltitudeBand(500), 'medium');
  assert.equal(rwAltitudeBand(3000), 'medium');
  assert.equal(rwAltitudeBand(3001), 'high');
  assert.throws(() => rwAltitudeBand(-1), RangeError);
});

test('movement techniques follow Figure III-25', () => {
  assert.deepEqual(MOVEMENT.map((m) => [m.name, m.contact, m.profile]), [
    ['Traveling', 'Remote', 'Low level or contour'],
    ['Traveling overwatch', 'Possible', 'Contour or NOE'],
    ['Bounding overwatch', 'Imminent', 'NOE'],
  ]);
  assert.equal(movementFor('imminent').name, 'Bounding overwatch');
});

test('three profiles and three firing techniques', () => {
  assert.deepEqual(PROFILES.map((p) => p.id), ['low-level', 'contour', 'noe']);
  assert.deepEqual(FIRE_MODES.map((m) => m.id), ['hover', 'running', 'diving']);
});

test('Figure 2: each profile stays inside its published height band, and lower is less exposed', () => {
  assert.ok(reliefFt() < 100, 'relief under 100 ft keeps a constant-altitude path within 100–200 ft AGL');
  const ll = profilePath('low-level').map(aglFt);
  assert.ok(Math.min(...ll) >= 100 && Math.max(...ll) <= 200);
  assert.equal(new Set(profilePath('low-level').map((p) => p.ft)).size, 1, 'low level is a constant altitude');
  const ct = profilePath('contour').map(aglFt);
  assert.ok(Math.min(...ct) >= 50 && Math.max(...ct) <= 100);
  const noe = profilePath('noe').map(aglFt);
  assert.ok(Math.max(...noe) < Math.min(...ct), 'NOE is below contour everywhere');
  assert.ok(exposure('noe') < exposure('contour') && exposure('contour') <= exposure('low-level'));
  assert.throws(() => profilePath('high'), RangeError);
});

test('Figure 1: the brief matches the drawing', () => {
  assert.equal(Math.round(bearingTo(EXAMPLE.places.bp, EXAMPLE.target)), EXAMPLE.heading);
  assert.equal(line3(3449), 3400);
  assert.equal(line3(3450), 3500);
  const said = ATTACK_STEPS.map((s) => s.said).join(' ');
  assert.match(said, new RegExp(`${EXAMPLE.bp}, ${String(EXAMPLE.heading).padStart(3, '0')}, ${line3(EXAMPLE.distanceM)}`));
  assert.match(said, new RegExp(`holding area ${EXAMPLE.ha}`));
  assert.match(said, /bounding overwatch/);
  for (const s of ATTACK_STEPS) assert.ok(['ha', 'rp', 'bp'].includes(s.at), s.said);
});

test('every question has its answer among the options and an outcome 1–6, and every outcome has a question', () => {
  for (const q of QUESTIONS) {
    assert.ok(q.options.includes(q.answer), q.ask);
    assert.ok(q.outcome >= 1 && q.outcome <= 6);
  }
  assert.deepEqual([...new Set(QUESTIONS.map((q) => q.outcome))].sort(), [1, 2, 3, 4, 5, 6]);
  assert.equal(QUESTIONS.find((q) => q.ask.includes('1,800 ft')).answer, 'Medium');
  assert.equal(rwAltitudeBand(1800), 'medium');
});
