import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ROTOR, autorotationRegions, bladeElement, cyclicPitch, densityAt, powerAvailable, powerCurve, powerRequired,
  rotorSpeeds, solidity, turnLoad, vortexRingCheck,
} from '../../src/lessons/flight-fundamentals/rotor-model.mjs';

// Expected values are derived by hand, not by calling the model.
const near = (actual, expected, tolerance, label) =>
  assert(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} not within ${tolerance} of ${expected}`);

test('rotor speeds: tip speed, dissymmetry and reverse flow', () => {
  // 260 rpm = 27.227 rad/s; × 27 ft = 735.1 ft/s = 435.55 kt.
  assert.equal(ROTOR.radius, 27);
  assert.equal(ROTOR.rpm, 260);
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
  near(s.advancingMach, 0.84, 0.005, '555.55 / 661.5');
  const past = rotorSpeeds({ speed: 500 });
  assert.equal(past.tipLiftRatio, null);
  assert.equal(past.reverseRadius, 27);
  assert.equal(rotorSpeeds({ speed: -1 }), null);
});

test('blade element: angle of attack is pitch less inflow angle', () => {
  // At 75% radius Ω·r = 27.227 × 20.25 = 551.35 ft/s; with 38 ft/s of induced
  // flow, φ = atan(38 / 551.35) = 3.94°, so 8° of pitch gives 4.06°.
  const b = bladeElement({ station: 0.75, pitch: 8, induced: 38 });
  near(b.pitch, 8, 1e-12, 'no twist correction at 75%');
  near(b.inflow, 3.94, 0.01, 'inflow angle');
  near(b.aoa, 4.06, 0.01, 'angle of attack');
  assert.equal(b.stalled, false);
  // The tip has 8° × 0.25 = 2° less pitch than the 75% station.
  near(bladeElement({ station: 1, pitch: 8, induced: 0 }).pitch, 6, 1e-12, 'washout at the tip');
  // No induced flow: angle of attack equals pitch.
  near(bladeElement({ station: 0.75, pitch: 8, induced: 0 }).aoa, 8, 1e-12, 'no inflow');
  assert.equal(bladeElement({ station: 0.75, pitch: 20, induced: 0 }).stalled, true);
  assert.equal(bladeElement({ station: 0, pitch: 8, induced: 0 }), null);
});

test('cyclic: least pitch 90° before the side the disk tilts to', () => {
  // Counterclockwise rotor: a blade passes nose, left, tail, right.
  assert.deepEqual(cyclicPitch('nose'), { tiltDown: 'nose', tiltUp: 'tail', leastPitch: 'right', mostPitch: 'left' });
  assert.deepEqual(cyclicPitch('left'), { tiltDown: 'left', tiltUp: 'right', leastPitch: 'nose', mostPitch: 'tail' });
  assert.equal(cyclicPitch('up'), null);
});

test('hover power: momentum theory plus blade profile drag', () => {
  // T = 16,000 lb = 71,172 N; A = π × 8.23² = 212.8 m²; vh = √(T / 2ρA) =
  // 11.68 m/s = 38.34 ft/s. Induced 1.15 × T × vh = 1,282 shp; profile
  // σCd0/8 × ρA(ΩR)³ with σ = 0.0825 = 406 shp; total 1,688 shp.
  near(solidity(), 0.0825, 0.0001, 'solidity 4 × 1.75 / (π × 27)');
  const p = powerRequired({ speed: 0 });
  near(p.hoverInducedVelocity, 38.34, 0.01, 'hover induced velocity');
  near(p.induced, 1282.5, 0.5, 'induced power');
  near(p.profile, 405.6, 0.5, 'profile power');
  near(p.parasite, 0, 1e-12, 'no parasite power in a hover');
  near(p.total, 1688.1, 0.5, 'hover power');
  // Forward flight brings induced power down; parasite rises with V³.
  const cruise = powerRequired({ speed: 100 });
  assert(cruise.induced < p.induced / 3);
  near(powerRequired({ speed: 120 }).parasite / powerRequired({ speed: 60 }).parasite, 8, 1e-9, 'parasite ∝ V³');
  assert.equal(powerRequired({ speed: -1 }), null);
});

test('power curve: minimum-power speed, hover ceiling and density', () => {
  // ISA at 4,000 ft: ρ = 1.225 × (1 − 6.8756e-6 × 4000)^4.2559 = 1.0879.
  near(densityAt(0), 1.225, 1e-12, 'sea level');
  near(densityAt(4000), 1.0879, 0.0001, '4,000 ft');
  near(powerAvailable(densityAt(4000)), 1776.2, 0.5, 'power available falls with density');
  const sl = powerCurve();
  assert(sl.vy > 60 && sl.vy < 85, `minimum-power speed ${sl.vy}`);
  assert(sl.minPower < sl.hover * 0.6);
  assert(sl.canHover);
  assert(sl.vh > sl.vy);
  // Hover power rises with altitude while power available falls.
  const high = powerCurve({ rho: densityAt(8000) });
  assert(high.hover > sl.hover);
  assert.equal(high.canHover, false);
  // A lighter helicopter needs less induced power, so its bucket moves slower.
  assert(powerCurve({ weight: 12000 }).vy < sl.vy);
});

test('vortex ring state: the FAA combination of conditions', () => {
  assert.equal(vortexRingCheck({ descent: 800, speed: 5, power: 50 }).likely, true);
  assert.equal(vortexRingCheck({ descent: 200, speed: 5, power: 50 }).likely, false);
  assert.equal(vortexRingCheck({ descent: 800, speed: 30, power: 50 }).likely, false);
  assert.equal(vortexRingCheck({ descent: 800, speed: 5, power: 10 }).likely, false);
  assert.equal(vortexRingCheck({ descent: 800, speed: 20, power: 50 }).atEtl, true);
  assert.equal(vortexRingCheck({ descent: Number.NaN, speed: 5, power: 50 }), null);
});

test('autorotation regions: the handbook sizes, and collective moves them', () => {
  const level = autorotationRegions(0);
  near(level.stall, 0.25, 1e-12, 'inner 25% stalled');
  near(level.driving, 0.45, 1e-12, 'driving 25 to 70%');
  near(level.driven, 0.30, 1e-12, 'outer 30% driven');
  assert.equal(level.rpm, 'steady');
  const up = autorotationRegions(2);
  assert(up.driving < level.driving && up.driven > level.driven && up.stall > level.stall);
  assert.equal(up.rpm, 'falling');
  assert.equal(autorotationRegions(-1).rpm, 'rising');
  assert.equal(autorotationRegions(4), null);
});

test('turn load: 1 / cos(bank)', () => {
  near(turnLoad(60), 2, 1e-12, '60° bank');
  near(turnLoad(30), 1.1547, 0.0001, '30° bank');
  assert.equal(turnLoad(90), null);
});
