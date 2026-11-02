// A deliberately simple flight model for the instrument panel figures: an
// invented generic jet trainer, not any real type. It exists to show the
// control and performance concept: attitude and power change at once on the
// control instruments, and the performance instruments follow. Every number
// here is invented for the figure, except the turn-rate relation, which is
// plain physics (rate = g·tan(bank) / speed).

const D = Math.PI / 180;
export const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
export const norm = (deg) => ((deg % 360) + 360) % 360;

// Invented trainer numbers.
export const TRAINER = Object.freeze({
  cruise: 250, // KIAS, level at CRUISE_POWER with CRUISE_PITCH
  cruisePower: 70, // percent
  aoaAtCruise: 3, // degrees of angle of attack at the cruise speed, level
  thrustAccel: 30, // kt/s of acceleration at 100 % power, before drag
  minSpeed: 100, // the figure's floor: the model is not a stall model
  maxSpeed: 450,
  pitchRate: 4, // deg/s the attitude follows the stick
  rollRate: 30,
  vsiLag: 2.5, // seconds: the VSI's time constant
});
const G_KT = 19.07; // g in knots per second
const FPM_PER_KT = 101.27; // 1 kt of vertical speed in ft/min
const drag = TRAINER.thrustAccel * (TRAINER.cruisePower / 100) / TRAINER.cruise ** 2;

// Angle of attack needed to hold 1 g at a speed: lift goes with speed squared.
export const aoaFor = (speed, bank = 0) =>
  TRAINER.aoaAtCruise * (TRAINER.cruise / speed) ** 2 / Math.max(0.2, Math.cos(bank * D));

// Rate of turn in degrees per second for a coordinated turn.
export const turnRate = (bank, speed) => (1091 * Math.tan(clamp(bank, -85, 85) * D)) / Math.max(speed, 1);
// Bank for a standard-rate turn (3°/s) at a speed.
export const standardRateBank = (speed) => Math.atan((3 * speed) / 1091) / D;

export function initialState(over = {}) {
  return {
    pitch: TRAINER.aoaAtCruise, bank: 0, power: TRAINER.cruisePower,
    speed: TRAINER.cruise, altitude: 5000, heading: 360, vs: 0, vsi: 0, rate: 0, slip: 0, t: 0,
    ...over,
  };
}

/**
 * One step of `dt` seconds. `input` holds the pilot's targets: pitch and bank
 * the attitude is moving to, and power in percent. Attitude follows at a fixed
 * rate (the control instruments move at once); speed, vertical speed, altitude
 * and heading follow from it (the performance instruments lag).
 */
export function step(s, input, dt) {
  const toward = (v, target, rate) => v + clamp(target - v, -rate * dt, rate * dt);
  const pitch = toward(s.pitch, clamp(input.pitch ?? s.pitch, -60, 60), TRAINER.pitchRate);
  const bank = toward(s.bank, clamp(input.bank ?? s.bank, -180, 180), TRAINER.rollRate);
  const power = clamp(input.power ?? s.power, 0, 100);
  // Flight path: pitch less the angle of attack the speed needs.
  const gamma = clamp(pitch - aoaFor(s.speed, bank), -90, 90);
  const accel = TRAINER.thrustAccel * (power / 100) - drag * s.speed ** 2 - G_KT * Math.sin(gamma * D);
  const speed = clamp(s.speed + accel * dt, TRAINER.minSpeed, TRAINER.maxSpeed);
  const vs = speed * FPM_PER_KT * Math.sin(gamma * D);
  const vsi = s.vsi + (vs - s.vsi) * Math.min(1, dt / TRAINER.vsiLag);
  const rate = turnRate(bank, speed) * Math.cos(clamp(pitch, -80, 80) * D);
  return {
    ...s, pitch, bank, power, speed, vs, vsi, rate,
    altitude: s.altitude + (vs * dt) / 60,
    heading: norm(s.heading + rate * dt),
    t: s.t + dt,
  };
}

// Power and pitch for level flight at a speed (power in percent).
export function levelTrim(speed) {
  return { pitch: aoaFor(speed), power: clamp((drag * speed ** 2 * 100) / TRAINER.thrustAccel, 0, 100) };
}

/* ---------- Unusual attitudes ---------- */
// Pictures for Figure 3's quiz. Attitude and performance agree, except where
// the attitude indicator has failed. The recoveries are the generic ones on
// the page (AFMAN 11-217 pp. 27–29; CNATRA P-1204 pp. 3-20–3-22; P-480
// pp. 2-17–2-18).
export const UNUSUAL = Object.freeze([
  {
    id: 'nose-high', label: 'Nose high, slow',
    state: { pitch: 25, bank: 20, speed: 140, vsi: 2500, power: 70 },
    answer: 'Power up, unload toward the horizon, roll level once there is flying speed',
    why: 'Nose high and slowing. Add power, unload so the nose falls toward the horizon without negative G, then roll wings level the shorter way once there is flying speed. A little bank while the nose falls keeps G positive.',
  },
  {
    id: 'nose-low', label: 'Nose low, fast',
    state: { pitch: -20, bank: 50, speed: 380, vsi: -6000, power: 70 },
    answer: 'Power back, roll wings level, then pull to the horizon',
    why: 'Nose low with airspeed building. Power back and drag out if needed, roll wings level, then pull to the horizon. Never roll and pull together.',
  },
  {
    id: 'inverted', label: 'Inverted dive',
    state: { pitch: -30, bank: 160, speed: 360, vsi: -7000, power: 70 },
    answer: 'Roll upright to wings level first, no back pressure until under 90° of bank',
    why: 'Diving and past 90° of bank. Roll toward the sky pointer to get upright and wings level; pulling now would steepen the dive. Then pull to level flight.',
  },
  {
    id: 'adi-failed', label: 'Attitude indicator failed',
    state: { pitch: -25, bank: 40, speed: 250, vsi: 0, power: 70, adiFailed: true },
    answer: 'Instruments disagree: verify on the standby, then fly partial panel',
    why: 'The attitude indicator shows a steep diving turn, but airspeed, altimeter, VSI and turn needle are steady. Verify against the standby before recovering, and if in doubt use the attitude-indicator-inoperative recovery.',
  },
]);
export const RECOVERIES = UNUSUAL.map((u) => u.answer);

/* ---------- The crosscheck ---------- */
// Hub and spoke: out from the attitude indicator to one instrument and back.
// The order of the spokes is an example; there is no single required order.
export const SPOKES = Object.freeze(['alt', 'hsi', 'asi', 'vsi', 'turn']);
export function hubAndSpoke(cycles = 1) {
  const order = [];
  for (let c = 0; c < cycles; c++) for (const s of SPOKES) order.push('adi', s);
  return order;
}
