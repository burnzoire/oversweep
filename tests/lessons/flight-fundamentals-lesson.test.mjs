import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EXAMPLE, alphaFor, clMaxOf, dragPolar, energyHeight, levelTurn, lift, liftCoefficient, loadFactor,
  maneuveringSpeed, maxLoadFactor, requiredCl, speedAt, stabilityResponse, stallSpeed, stallSpeedAt, steadyPath,
} from '../../src/lessons/flight-fundamentals/lesson-model.mjs';

// Expected values are derived by hand, not by calling the model.
const near = (actual, expected, tolerance, label) =>
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} not within ${tolerance} of ${expected}`);

test('load factor in a level turn is 1 / cos(bank)', () => {
  near(loadFactor(0), 1, 1e-12, '0°');
  near(loadFactor(60), 2, 1e-12, '60°'); // AFH p. 5-9: a level 60° turn is 2 G
  near(loadFactor(45), Math.SQRT2, 1e-12, '45°');
  assert.equal(loadFactor(90), null);
  assert.equal(loadFactor(-5), null);
});

test('stall speed rises with the square root of load factor', () => {
  // AFH p. 5-9: at 2 G the stall speed is about 41 percent above the 1 G value.
  near(stallSpeedAt(50, 2) / 50, 1.41421, 1e-5, '2 G');
  near(stallSpeedAt(50, 4), 100, 1e-12, '4 G doubles it');
  assert.equal(stallSpeedAt(50, 0), null);
});

test('level turn radius and rate', () => {
  // 100 kt = 51.4444 m/s; tan 30° = 0.577350; a = g tan φ = 5.66189 m/s².
  // r = 2646.53 / 5.66189 = 467.43 m = 1,533.6 ft; ω = 0.110058 rad/s = 6.306°/s.
  const t = levelTurn({ speed: 100, bank: 30 });
  near(t.n, 1.1547, 1e-4, 'n');
  near(t.radius, 1533.6, 0.1, 'radius');
  near(t.rate, 6.306, 0.001, 'rate');
  near(t.fullTurn, 57.09, 0.01, 'time for 360°');
  // At a fixed bank, doubling speed doubles the radius twice over and halves the rate.
  const fast = levelTurn({ speed: 200, bank: 30 });
  near(fast.radius / t.radius, 4, 1e-9, 'radius ∝ V²');
  near(t.rate / fast.rate, 2, 1e-9, 'rate ∝ 1/V');
  assert.equal(levelTurn({ speed: 0, bank: 30 }), null);
});

test('example airplane: 1 G stall speed and lift equation', () => {
  // W = 2,300 lb = 10,230.9 N; S = 174 ft² = 16.1651 m²; CLmax 1.6; ρ 1.225.
  // Vs = √(2 × 10,230.9 / (1.225 × 16.1651 × 1.6)) = √645.85 = 25.413 m/s = 49.40 kt.
  near(stallSpeed(), 49.40, 0.01, 'Vs1');
  near(stallSpeed({ n: 2 }), 49.40 * Math.SQRT2, 0.02, 'Vs at 2 G');
  // At the stall speed, CLmax carries exactly the weight.
  near(lift({ speed: stallSpeed(), cl: EXAMPLE.clMax }), 2300, 1e-6, 'lift at Vs');
  // Halving speed needs four times the lift coefficient.
  near(requiredCl({ speed: 60 }) / requiredCl({ speed: 120 }), 4, 1e-9, 'CL ∝ 1/V²');
});

test('illustrative lift curve: linear, then a smooth peak at the critical angle', () => {
  near(liftCoefficient(-2), 0, 1e-12, 'zero lift');
  near(liftCoefficient(8), 1.0, 1e-12, 'linear range');
  near(liftCoefficient(12), 1.4, 1e-12, 'knee');
  // Parabola from the knee: 1.4 + 0.1x − 0.0125x²; at x = 4, 1.4 + 0.4 − 0.2 = 1.6.
  near(liftCoefficient(16), 1.6, 1e-12, 'CLmax at critical');
  near(clMaxOf(), 1.6, 1e-12, 'CLmax');
  near(liftCoefficient(14), 1.4 + 0.2 - 0.05, 1e-12, 'mid-blend');
  assert(liftCoefficient(20) < 1.6, 'lift falls past the critical angle');
  near(alphaFor(1.0), 8, 1e-6, 'inverse');
  assert.equal(alphaFor(1.7), null);
});

test('V-n stall boundary and maneuvering speed', () => {
  near(maxLoadFactor(100, 50), 4, 1e-12, 'twice Vs gives 4 G');
  // VA = Vs√n: 50 × √3.8 = 97.468.
  near(maneuveringSpeed(50, 3.8), 97.468, 0.001, 'VA');
});

test('drag curve: minimum where parasite equals induced, at L/Dmax', () => {
  // k = 1/(π × 0.75 × 7.4) = 0.0573531; L/Dmax = 1 / (2√(k × 0.031)) = 11.858.
  const polar = dragPolar();
  near(polar.k, 0.0573531, 1e-7, 'k');
  near(polar.ldMax, 11.858, 0.001, 'L/Dmax');
  near(polar.minDrag, 2300 / 11.858, 0.01, 'minimum drag');
  const vmd = polar.minDragSpeed();
  near(vmd, 72.87, 0.01, 'minimum-drag speed');
  const at = polar.at(vmd);
  near(at.parasite, at.induced, 1e-6, 'equal at the minimum');
  near(at.total, polar.minDrag, 1e-6, 'total at the minimum');
  assert(polar.at(vmd * 0.8).total > at.total && polar.at(vmd * 1.2).total > at.total, 'minimum');
  // Parasite ∝ V², induced ∝ 1/V².
  near(polar.at(140).parasite / polar.at(70).parasite, 4, 1e-9, 'parasite');
  near(polar.at(70).induced / polar.at(140).induced, 4, 1e-9, 'induced');
});

test('steady climb: thrust carries drag plus a weight component', () => {
  const level = steadyPath({ gamma: 0, drag: 200 });
  near(level.lift, 2300, 1e-9, 'level lift');
  near(level.thrust, 200, 1e-9, 'level thrust');
  // γ = 5°: sin 0.0871557, cos 0.9961947.
  const climb = steadyPath({ gamma: 5, drag: 200 });
  near(climb.thrust, 200 + 2300 * 0.0871557, 1e-4, 'climb thrust');
  near(climb.lift, 2300 * 0.9961947, 1e-4, 'climb lift');
});

test('energy height matches the Airplane Flying Handbook example', () => {
  // AFH p. 4-8: 100 kt at 6,000 ft and 240 kt at 4,000 ft both have about
  // 6,500 ft of energy height. 51.444² / (2 × 9.80665) = 134.94 m = 442.7 ft;
  // 123.467² / 19.6133 = 777.23 m = 2,550.0 ft.
  near(energyHeight(6000, 100), 6442.7, 0.1, '100 kt');
  near(energyHeight(4000, 240), 6550.0, 0.1, '240 kt');
  near(speedAt(energyHeight(4000, 240), 4000), 240, 1e-9, 'round trip');
  assert.equal(speedAt(6000, 7000), null);
});

test('stability responses', () => {
  near(stabilityResponse({ kind: 'static-neutral', t: 7 }), 1, 1e-12, 'neutral');
  assert(stabilityResponse({ kind: 'static-positive', t: 5 }) < 0.05);
  assert(stabilityResponse({ kind: 'static-negative', t: 5 }) > 5);
  near(stabilityResponse({ kind: 'dynamic-neutral', t: 8 }), 1, 1e-12, 'two full periods');
  assert(Math.abs(stabilityResponse({ kind: 'dynamic-positive', t: 8 })) < 0.2);
  assert(Math.abs(stabilityResponse({ kind: 'dynamic-negative', t: 8 })) > 2);
  assert.equal(stabilityResponse({ kind: 'x', t: 1 }), null);
});
