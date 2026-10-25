import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EXAMPLE, ROTOR, alphaFor, clMaxOf, dragPolar, energyHeight, levelTurn, lift, liftCoefficient, loadFactor,
  maneuveringSpeed, maxLoadFactor, requiredCl, rotorSpeeds, speedAt, stabilityResponse, stallSpeed, stallSpeedAt, steadyPath,
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

test('example jet trainer: 1 G stall speed and lift equation', () => {
  // W = 12,000 lb = 53,378.66 N; S = 180 ft² = 16.72255 m²; CLmax 1.2; ρ 1.225.
  // Vs = √(2 × 53,378.66 / (1.225 × 16.72255 × 1.2)) = √4,342.96 = 65.901 m/s = 128.10 kt.
  near(stallSpeed(), 128.10, 0.01, 'Vs1');
  near(stallSpeed({ n: 2 }), 128.10 * Math.SQRT2, 0.02, 'Vs at 2 G');
  // At the stall speed, CLmax carries exactly the weight.
  near(lift({ speed: stallSpeed(), cl: EXAMPLE.clMax }), 12000, 1e-6, 'lift at Vs');
  // Halving speed needs four times the lift coefficient.
  near(requiredCl({ speed: 150 }) / requiredCl({ speed: 300 }), 4, 1e-9, 'CL ∝ 1/V²');
  // Weight up 2% raises stall speed about 1% (00-80T-80 rule of thumb): √1.02 = 1.00995.
  near(stallSpeed({ plane: { ...EXAMPLE, weight: 12240 } }) / stallSpeed(), 1.00995, 1e-5, 'Vs ∝ √W');
});

test('illustrative lift curve: linear, then a smooth peak at the critical angle', () => {
  near(liftCoefficient(-1), 0, 1e-12, 'zero lift');
  near(liftCoefficient(9), 0.8, 1e-12, 'linear range');
  near(liftCoefficient(12), 1.04, 1e-12, 'knee');
  // Parabola from the knee: 1.04 + 0.08x − 0.01x²; at x = 4, 1.04 + 0.32 − 0.16 = 1.2.
  near(liftCoefficient(16), 1.2, 1e-12, 'CLmax at critical');
  near(clMaxOf(), 1.2, 1e-12, 'CLmax');
  near(clMaxOf(), EXAMPLE.clMax, 1e-12, 'curve matches the example');
  near(liftCoefficient(14), 1.04 + 0.16 - 0.04, 1e-12, 'mid-blend');
  assert(liftCoefficient(20) < 1.2, 'lift falls past the critical angle');
  near(alphaFor(0.8), 9, 1e-6, 'inverse');
  assert.equal(alphaFor(1.3), null);
});

test('V-n stall boundary and maneuvering speed', () => {
  near(maxLoadFactor(100, 50), 4, 1e-12, 'twice Vs gives 4 G');
  // VA = Vs√n: 50 × √3.8 = 97.468.
  near(maneuveringSpeed(50, 3.8), 97.468, 0.001, 'VA');
  // Example jet trainer at a 7.5 G limit: 128.10 × √7.5 = 128.10 × 2.738613 = 350.82 kt.
  near(maneuveringSpeed(stallSpeed(), 7.5), 350.82, 0.02, 'corner speed of the example');
});

test('drag curve: minimum where parasite equals induced, at L/Dmax', () => {
  // k = 1/(π × 0.8 × 5) = 0.0795775; L/Dmax = 1 / (2√(k × 0.02)) = 12.5331.
  // Vmd = √(2W/(ρS) × √(k/CD0)) = √(5,211.45 × 1.994712) = 101.958 m/s = 198.19 kt.
  const polar = dragPolar();
  near(polar.k, 0.0795775, 1e-7, 'k');
  near(polar.ldMax, 12.5331, 0.0001, 'L/Dmax');
  near(polar.minDrag, 12000 / 12.5331, 0.01, 'minimum drag');
  const vmd = polar.minDragSpeed();
  near(vmd, 198.19, 0.01, 'minimum-drag speed');
  const at = polar.at(vmd);
  near(at.parasite, at.induced, 1e-6, 'equal at the minimum');
  near(at.total, polar.minDrag, 1e-6, 'total at the minimum');
  assert(polar.at(vmd * 0.8).total > at.total && polar.at(vmd * 1.2).total > at.total, 'minimum');
  // Parasite ∝ V², induced ∝ 1/V².
  near(polar.at(400).parasite / polar.at(200).parasite, 4, 1e-9, 'parasite');
  near(polar.at(200).induced / polar.at(400).induced, 4, 1e-9, 'induced');
});

test('steady climb: thrust carries drag plus a weight component', () => {
  const level = steadyPath({ gamma: 0, drag: 1000 });
  near(level.lift, 12000, 1e-9, 'level lift');
  near(level.thrust, 1000, 1e-9, 'level thrust');
  // γ = 5°: sin 0.0871557, cos 0.9961947; 1,000 + 1,045.87 = 2,045.87 lb.
  const climb = steadyPath({ gamma: 5, drag: 1000 });
  near(climb.thrust, 2045.87, 0.01, 'climb thrust');
  near(climb.lift, 11954.34, 0.01, 'climb lift');
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

test('rotor speeds: tip speed, dissymmetry and reverse flow', () => {
  // 260 rpm = 27.227 rad/s; × 27 ft = 735.1 ft/s = 435.55 kt.
  assert.deepEqual(ROTOR, { radius: 27, rpm: 260 });
  const hover = rotorSpeeds({ speed: 0 });
  near(hover.tip, 435.55, 0.01, 'tip speed');
  near(hover.tipLiftRatio, 1, 1e-12, 'hover: even lift');
  near(hover.reverseRadius, 0, 1e-12, 'hover: no reverse flow');
  const s = rotorSpeeds({ speed: 120 });
  near(s.advancing, 555.55, 0.01, 'advancing tip');
  near(s.retreating, 315.55, 0.01, 'retreating tip');
  near(s.mu, 0.2755, 0.0001, 'advance ratio 120 / 435.55');
  near(s.reverseRadius, 7.44, 0.01, 'reverse flow radius 202.5 ft/s / 27.23 rad/s');
  near(s.tipLiftRatio, 3.10, 0.01, '(555.55 / 315.55)²');
  const past = rotorSpeeds({ speed: 500 });
  assert.equal(past.tipLiftRatio, null);
  assert.equal(past.reverseRadius, 27);
  assert.equal(rotorSpeeds({ speed: -1 }), null);
});
