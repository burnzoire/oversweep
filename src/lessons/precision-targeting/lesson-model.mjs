/* Pure, deterministic models for the Precision Targeting module.
 * Laser geometry, codes, lasing time and coordinate-weapon facts are from
 * JP 3-09.3, Close Air Support (25 November 2014), by printed page. Beam
 * divergence is the one-milliradian example on p. III-53. The impact-angle
 * figure is plain geometry illustrating p. III-61. The attack in Figure 1 and
 * every number in the figures are invented for illustration.
 */

/** Smallest angle between two bearings, in degrees (0 to 180). */
export function offDeg(a, b) {
  const d = (((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

export const norm360 = (deg) => (((Math.round(deg) % 360) + 360) % 360);

/* The laser zones of JP 3-09.3 Figure III-9 (p. III-57). Both wedges have
 * their apex at the target and are centred on the target-to-designator line,
 * so an aircraft attacking on heading H sits at the bearing H + 180 from the
 * target; the designator sits at LTL + 180. Their difference is |H - LTL|.
 *  - inside 10 degrees: the 20-degree safety zone; avoid unless the tactical
 *    situation dictates, because the seeker may guide on the designator;
 *  - 10 to 45 degrees: preferred, best seeker acquisition;
 *  - 45 to 60 degrees: inside the 120-degree optimal attack zone;
 *  - beyond 60 degrees: outside the attack zone, where the figure marks
 *    laser seeker and weapon employment prohibited. */
export const ZONES = { safetyHalfDeg: 10, preferredHalfDeg: 45, attackHalfDeg: 60 };

export function laserZone(attackHeading, laserTargetLine) {
  const off = offDeg(attackHeading, laserTargetLine);
  if (off < ZONES.safetyHalfDeg) return { off, zone: 'safety', ok: false, label: 'In the 20° safety zone: avoid, the seeker may guide on the designator' };
  if (off <= ZONES.preferredHalfDeg) return { off, zone: 'preferred', ok: true, label: 'Preferred: 10° to 45° off the laser target line, best seeker acquisition' };
  if (off <= ZONES.attackHalfDeg) return { off, zone: 'attack', ok: true, label: 'Inside the 120° attack zone, outside the preferred 90°' };
  return { off, zone: 'outside', ok: false, label: 'Outside the attack zone: laser weapon employment prohibited' };
}

/** Do all headings from `from` to `to` (clockwise) lie inside the attack zone? */
export function headingsInZone(from, to, laserTargetLine, zone = 'attack') {
  const span = norm360(to - from);
  for (let i = 0; i <= span; i++) {
    const z = laserZone(from + i, laserTargetLine).zone;
    if (z === 'safety' || z === 'outside' || (zone === 'preferred' && z !== 'preferred')) return false;
  }
  return true;
}

/* Beam divergence (p. III-53): a one-milliradian beam makes a spot about one
 * metre across at 1,000 m; aimed at a three-metre box 3,000 m away, the spot
 * is as wide as the box. Small-angle approximation, metres. */
export function spotDiameterM(rangeM, divergenceMrad = 1) {
  if (!(rangeM >= 0)) throw new RangeError('Range must be zero or more');
  return (divergenceMrad / 1000) * rangeM;
}
/** Fraction of a round spot that spills past a square target `targetM` wide, aimed at its centre (geometry only). */
export function spillFraction(spotM, targetM) {
  if (spotM <= targetM) return 0;
  // Area of the circle outside the inscribed square region: approximate by
  // sampling the disc on a grid.
  const r = spotM / 2, h = targetM / 2, n = 120;
  let inside = 0, total = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = -r + ((i + 0.5) * spotM) / n, y = -r + ((j + 0.5) * spotM) / n;
    if (x * x + y * y > r * r) continue;
    total++;
    if (Math.abs(x) <= h && Math.abs(y) <= h) inside++;
  }
  return 1 - inside / total;
}

/* Vertical error and impact angle (p. III-61: increasing the impact angle
 * greatly reduces the effect of vertical TLE). A weapon guiding to a point
 * `veFt` above (positive) or below (negative) the real target, on a straight
 * final path `impactDeg` below the horizontal, meets the ground VE / tan(angle)
 * beyond the target (positive, long) or before it (negative, short). Plain
 * geometry, our illustration. */
export function groundMissFt(veFt, impactDeg) {
  if (!(impactDeg > 0 && impactDeg <= 90)) throw new RangeError('Impact angle must be above 0 and at most 90 degrees');
  if (impactDeg === 90) return 0;
  return veFt / Math.tan((impactDeg * Math.PI) / 180);
}

/* Target location error categories, JP 3-09.3 Figure III-5 (p. III-35),
 * by circular error (CE90), feet. */
export const TLE_CATS = [
  { cat: 'I', maxFt: 20, m: '0–6 m' },
  { cat: 'II', maxFt: 50, m: '7–15 m' },
  { cat: 'III', maxFt: 100, m: '16–30 m' },
  { cat: 'IV', maxFt: 300, m: '31–91 m' },
  { cat: 'V', maxFt: 1000, m: '92–305 m' },
  { cat: 'VI', maxFt: Infinity, m: 'over 305 m' },
];
export function tleCat(ceFt) {
  if (!(ceFt >= 0)) throw new RangeError('Error must be zero or more');
  return TLE_CATS.find((c) => ceFt <= c.maxFt).cat;
}

/* Laser codes (pp. III-56, III-58): passed as four digits; the designator
 * and the weapon (and any spot tracker) must be on the same code. A
 * laser-guided bomb's code is set before flight; missiles and trackers can
 * change in flight. */
export function codesMatch({ designator, weapon, tracker }) {
  const four = (c) => typeof c === 'string' && /^\d{4}$/.test(c);
  const used = [designator, weapon, tracker].filter((c) => c !== undefined);
  if (!used.every(four)) return { ok: false, why: 'Laser codes are always passed as four digits.' };
  if (weapon !== undefined && weapon !== designator) return { ok: false, why: 'The weapon will not guide: its code does not match the designator.' };
  if (tracker !== undefined && tracker !== designator) return { ok: false, why: 'The spot tracker will not see the spot: its code does not match the designator.' };
  return { ok: true, why: 'Codes match.' };
}

/* Figure 1's invented attack, after the structure of JP 3-09.3 Appendix E,
 * Example 9 (pp. E-23 to E-24) and the laser calls of p. V-35: an aircraft
 * drops a laser-guided bomb while a ground team lases the target. Call
 * signs, codes, headings and times are invented. */
export const EXAMPLE = { laserTargetLine: 140, fah: [80, 115], inHeading: 100, code: '1534', timeOfFall: 32 };

export const ATTACK_STEPS = [
  { who: 'Before flight', said: 'Strike 11\'s bombs are coded 1534 and Strike 12\'s 1535. A laser-guided bomb\'s code is set on the ground and cannot be changed airborne. [1, pp. III-56, III-58]', href: '#codes', heading: null, laser: false },
  { who: 'Strike 11', said: '"…two-ship, GBU-12, codes 1534 and 1535…" The controller will brief the codes the aircrew pass at check-in. [1, p. III-79]', href: '#codes', heading: null, laser: false },
  { who: 'Controller', said: '"…Anvil laser, code 1534…" The lasing team\'s call sign and the four-digit code go in the marks line. [1, p. III-79]', href: '#who', heading: null, laser: false },
  { who: 'Controller', said: '"Final attack headings 080 to 115, laser target line 140." Every heading in that window is 25° to 60° off the laser target line, inside the attack zone and clear of the safety zone. [1, pp. III-52, III-56–III-57]', href: '#geometry', heading: null, laser: false },
  { who: 'Strike 11', said: '"IN heading 100." 40° off the line: in the preferred zone. [1, p. III-57]', href: '#geometry', heading: 100, laser: false },
  { who: 'Controller', said: '"Strike 11, CLEARED HOT." No weapon comes off without a clearance to release; the control types and clearance calls are in Close Air Support. [1, p. E-24]', href: '#example', heading: 100, laser: false },
  { who: 'Strike 11', said: '"One AWAY, time of fall 32 seconds." The time of fall lets the laser be timed to the impact. [1, pp. III-58, E-23–E-24]', href: '#timing', heading: 100, laser: false },
  { who: 'Strike 11', said: '"TEN SECONDS." Lasing too early makes the bomb turn down early, lose energy and fall short. [1, pp. III-58, III-79]', href: '#timing', heading: 100, laser: false },
  { who: 'Strike 11', said: '"LASER ON."', href: '#timing', heading: 100, laser: false },
  { who: 'Controller', said: '"Strike 11, LASING, 1534." Most laser-guided weapons need the spot until impact. [1, pp. III-54, V-35]', href: '#timing', heading: 100, laser: true },
];

export const GEO_QUESTIONS = [
  { outcome: 2, ask: 'Laser target line 200. You are offered an attack heading of 205. Good?', answer: 'No: inside the safety zone', options: ['Yes: preferred', 'Yes: inside the attack zone', 'No: inside the safety zone', 'No: outside the attack zone'], why: '5° off the line is inside the 20° safety wedge, where the seeker may guide on the designator. (JP 3-09.3, p. III-57)' },
  { outcome: 2, ask: 'Laser target line 200. Attack heading 240?', answer: 'Yes: preferred', options: ['Yes: preferred', 'Yes: inside the attack zone', 'No: inside the safety zone', 'No: outside the attack zone'], why: '40° off the line is within the preferred 10° to 45°. (JP 3-09.3, p. III-57)' },
  { outcome: 2, ask: 'Laser target line 200. Attack heading 145?', answer: 'Yes: inside the attack zone', options: ['Yes: preferred', 'Yes: inside the attack zone', 'No: inside the safety zone', 'No: outside the attack zone'], why: '55° off: inside the 120° attack zone, but outside the preferred 90°. (JP 3-09.3, p. III-57)' },
  { outcome: 2, ask: 'Laser target line 200. Attack heading 020?', answer: 'No: outside the attack zone', options: ['Yes: preferred', 'Yes: inside the attack zone', 'No: inside the safety zone', 'No: outside the attack zone'], why: '180° off: you would be attacking towards the designator, from the side the reflection is weakest. (JP 3-09.3, pp. III-54, III-57)' },
  { outcome: 3, ask: 'Your GBU-12s were coded 1688 on the ground. The designator is briefed on 1511. What happens?', answer: 'The bombs will not guide unless the designator changes to 1688', options: ['The bombs will not guide unless the designator changes to 1688', 'You re-code the bombs in flight', 'The bombs guide on any code'], why: 'An LGB\'s code is normally only adjustable before flight; the designator must match the weapon or it will not guide. Designators can change code airborne. (JP 3-09.3, pp. III-56, III-58)' },
  { outcome: 3, ask: 'Two flights attack two targets at the same moment with laser-guided bombs. What must differ?', answer: 'Their laser codes', options: ['Their laser codes', 'Nothing', 'Their attack altitudes only'], why: 'LGWs need different laser codes for simultaneous attacks. (JP 3-09.3, p. V-5)' },
  { outcome: 4, ask: 'The designator turns on the laser as the bomb leaves the jet, 30 seconds early. What is the risk?', answer: 'The bomb guides early, loses energy and falls short', options: ['The bomb guides early, loses energy and falls short', 'None: earlier is always better', 'The bomb goes long'], why: 'Lasing too early makes the weapon turn down toward the target prematurely. (JP 3-09.3, p. III-58)' },
  { outcome: 1, ask: 'Thick cloud over the target. Which weapon is the better choice, if you have accurate coordinates?', answer: 'A GPS-aided weapon on the coordinates', options: ['A laser-guided bomb', 'A GPS-aided weapon on the coordinates'], why: 'IAMs guide to coordinates regardless of weather; a laser needs line of sight through the cloud. (JP 3-09.3, pp. III-52, III-61)' },
  { outcome: 5, ask: 'A GPS weapon was released on a truck\'s coordinates; the truck drives off. What happens?', answer: 'It misses: it still flies to the coordinates', options: ['It misses: it still flies to the coordinates', 'It follows the truck', 'It aborts'], why: 'Single-mode IAMs fly to preprogrammed coordinates; dual-mode weapons can take laser guidance against moving targets. (JP 3-09.3, pp. III-61 to III-62)' },
  { outcome: 6, ask: 'Coordinates with a circular error of 40 ft. Which TLE category?', answer: 'CAT II', options: ['CAT I', 'CAT II', 'CAT III', 'CAT IV'], why: 'CAT II is 21 to 50 ft (7 to 15 m) CE90. (JP 3-09.3, Figure III-5)' },
  { outcome: 6, ask: 'Your coordinates have a large vertical error. What weapon setting reduces its effect?', answer: 'A steeper impact angle', options: ['A steeper impact angle', 'A lower release altitude', 'A longer time of fall'], why: 'Increasing the impact angle greatly reduces the effect of vertical TLE. (JP 3-09.3, p. III-61; Figure 4)' },
];
