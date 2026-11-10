// Model for the Beyond-Visual-Range Intercepts module: intercept geometry, the
// invented worked section intercept, the illustrative launch zone and the
// quiz questions. Pure functions, no DOM, so tests can check them.
//
// Geometry conventions follow CNATRA P-825 (07-14), chapters 8 and 9:
//   TA, target aspect: angle at the bandit from its heading to the fighter,
//      L or R for the bandit's side the fighter is on (here negative = left).
//   AO, angle-off: angle at the fighter from its heading to the bandit,
//      L or R of the fighter's nose (here negative = left). The USAF calls it
//      antenna train angle (ATA).
//   AA, aspect angle = 180 - TA.
// The plan view puts the bandit due north of the fighter (bandit bearing 000)
// and x east, y north, in nautical miles.

export const KT = 300; // AWI training ground speed, both aircraft (P-825 p. 8-5)
export const FT_PER_NM = 6076.12;
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
export const norm180 = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
export const norm360 = (d) => ((d % 360) + 360) % 360;

// The P-825 rule of thumb: LS (feet) = TA x SR x 100 (p. 8-2), and the exact
// value it approximates, SR x sin(TA) (p. 9-2).
export const lsRule = (taDeg, srNm) => Math.abs(taDeg) * srNm * 100;
export const lsExact = (taDeg, srNm) => srNm * Math.sin(rad(Math.abs(taDeg))) * FT_PER_NM;

// Bandit heading from target aspect, with the bandit on bearing `bb` from the
// fighter. Right TA (positive) puts the fighter clockwise of the bandit's nose.
export const banditHeading = (taDeg, bb = 0) => norm360(bb + 180 - taDeg);
// Fighter heading from angle-off: right AO (positive) means the bandit is right
// of the fighter's nose.
export const fighterHeading = (aoDeg, bb = 0) => norm360(bb - aoDeg);

// Co-speed collision: AO equal to TA in size, opposite in direction (p. 9-2),
// so with these sign conventions the collision AO is -TA. With a speed ratio
// the cross-line-of-sight speeds must match: Vf sin AO = Vb sin TA.
export function collisionAo(taDeg, speedRatio = 1) {
  const s = Math.sin(rad(Math.abs(taDeg))) / speedRatio;
  if (s > 1) return undefined; // too slow to reach collision
  return -Math.sign(taDeg) * deg(Math.asin(s));
}

// Cut (FH to BR) and heading crossing angle, in degrees (p. 8-1, 9-20).
export function cutAndHca(taDeg, aoDeg) {
  const fh = fighterHeading(aoDeg), bh = banditHeading(taDeg);
  const br = norm360(bh + 180);
  const cut = norm180(br - fh);
  return { fh, bh, br, cut, hca: 180 - Math.abs(cut), cb: cut / 2 };
}

// Rate of closure (knots): the components of both velocities along the line of
// sight (p. 8-5).
export const closure = (taDeg, aoDeg, vf = KT, vb = KT) => vf * Math.cos(rad(aoDeg)) + vb * Math.cos(rad(taDeg));

// Line-of-sight rate in degrees per minute, positive clockwise. Zero on
// collision: the contact does not drift (p. 9-1, 9-2).
export function losRate(taDeg, aoDeg, srNm, vf = KT, vb = KT) {
  // Velocities in NM/min, x east, y north, bandit due north.
  const fh = rad(fighterHeading(aoDeg)), bh = rad(banditHeading(taDeg));
  const relX = (vb * Math.sin(bh) - vf * Math.sin(fh)) / 60;
  return deg(relX / srNm);
}

// Fly both aircraft straight for `sec` seconds from the start geometry and
// return where everything is, with the new TA, AO and range.
export function fly(taDeg, aoDeg, srNm, sec, vf = KT, vb = KT) {
  const fh = fighterHeading(aoDeg), bh = banditHeading(taDeg);
  const t = sec / 3600;
  const f = [vf * t * Math.sin(rad(fh)), vf * t * Math.cos(rad(fh))];
  const b = [vb * t * Math.sin(rad(bh)), srNm + vb * t * Math.cos(rad(bh))];
  const dx = b[0] - f[0], dy = b[1] - f[1];
  const sr = Math.hypot(dx, dy);
  const bb = norm360(deg(Math.atan2(dx, dy)));
  return { f, b, sr, bb, ao: norm180(bb - fh), ta: norm180(bh - norm360(bb + 180)) * -1 };
}

// P-825's aspect words for tactical control (p. 5-8): 0-30 hot, 30-60 flank,
// 70-110 beam, 110+ drag (Naval convention, by target aspect).
export function aspectWord(taDeg) {
  const ta = Math.abs(taDeg);
  if (ta <= 30) return 'HOT';
  if (ta <= 60) return 'FLANK';
  if (ta >= 70 && ta <= 110) return 'BEAM';
  if (ta > 110) return 'DRAG';
  return undefined; // 60-70 is not assigned a word in the source
}

// The MRM time-of-flight rule of thumb (p. 15-9): the missile closes 1 NM
// every 2 s fired in the forward quarter, 3 s from the beam, 4 s from the rear
// quarter against a co-speed bandit.
export const TOF_SEC_PER_NM = { forward: 2, beam: 3, rear: 4 };
export const tofSec = (rangeNm, quadrant) => rangeNm * TOF_SEC_PER_NM[quadrant];

// Range at missile timeout against a hot, co-speed bandit, with or without a
// crank that puts the bandit `crankAo` degrees off the nose after the shot.
export function timeoutRange(shotNm, crankAo = 0, v = KT) {
  const t = tofSec(shotNm, 'forward') / 3600;
  const bandit = v * t; // straight at the fighter's launch point
  const fx = v * t * Math.sin(rad(crankAo)), fy = v * t * Math.cos(rad(crankAo));
  return Math.hypot(fx, shotNm - bandit - fy);
}

// An illustrative launch zone, NOT any missile's: maximum range is longest
// against a hot (0 TA) bandit and shortest in the rear quarter (P-825
// p. 15-1; DCS F-16C guide p. 269); the no-escape range lies inside it and the
// minimum range is small. Units are fractions of the head-on maximum.
export const ZONE = { headOn: 1, tail: 0.35, rne: 0.45, rmin: 0.06 };
export const rMax = (taDeg) => ZONE.tail + (ZONE.headOn - ZONE.tail) * (1 + Math.cos(rad(taDeg))) / 2;
export const rNe = (taDeg) => ZONE.rne * rMax(taDeg);
export function shotZone(taDeg, range) {
  if (range < ZONE.rmin) return 'inside';
  if (range <= rNe(taDeg)) return 'rne';
  if (range <= rMax(taDeg)) return 'lar';
  return 'outside';
}

// Figure 1: an invented section (two-ship) intercept from a defensive combat
// air patrol, against a single group of two. Ranges are from the section to
// the group; every call is in the P-825 format, with invented call signs.
// Positions are plan view, NM, the section's start at the origin heading north.
export const GROUP = { alt: 25, strength: 2 };
const step = (o) => o;
export const STEPS = [
  step({ phase: 'Picture', range: 50, form: 'cap', crank: false, cite: 'p825', page: '5-9, 16-1', href: '#control',
    text: 'On CAP the section hears broadcast control in bullseye format: a group\'s position from the common point and its track direction, for everyone on the net.',
    calls: [['Controller', 'Rage 11, SABRE, single group Vegas 010, 70, 25 thousand, track south, hostile.']] }),
  step({ phase: 'Commit', range: 35, form: 'spread', crank: false, cite: 'p825', page: '16-5, 17-17', href: '#commit',
    text: 'The group meets the briefed commit criteria, here no closer than 35 NM with flank aspect or less. Lead commits, the section accelerates and the controller moves to tactical control for this flight.',
    calls: [['Lead', 'Rage 11, commit.'], ['Controller', 'SABRE copy commit.']] }),
  step({ phase: 'Declare and target', range: 30, form: 'spread', crank: false, cite: 'p825', page: '16-6, 17-20', href: '#roe',
    text: 'Lead correlates its radar contact with the controller\'s and asks for a declaration, then targets the group. A shot needs a hostile declaration.',
    calls: [['Lead', 'SABRE, Rage 11, contact BRAA 360, 30, 25 thousand, declare.'], ['Controller', 'Rage 11, SABRE, single group BRAA 360, 30, 25 thousand, hot, hostile.'], ['Lead', 'SABRE, Rage 11, target single group.']] }),
  step({ phase: 'Meld and sort', range: 25, form: 'spread', crank: false, cite: 'p825', page: '17-26 to 17-28', href: '#section',
    text: 'Both radars come into the group (meld) and each fighter takes its own contact (sort): with the briefed assumptions met, lead takes the left one and the wingman the right one, without a call.',
    calls: [['Lead', 'Rage, meld, single group, BRAA 360, 25, 25 thousand.']] }),
  step({ phase: 'Shoot and crank', range: 20, form: 'spread', crank: true, cite: 'p825', page: '16-11, 17-32 to 17-34', href: '#shoot',
    text: 'Each fighter shoots its sort contact from inside the launch zone, on timeline, then the section cranks: it turns to put its contacts 50 degrees off the nose on the cold side, slowing the closure while the radars support the missiles.',
    calls: [['Lead', 'Rage 11, Fox-3.'], ['Wing', 'Rage 12, Fox-3.'], ['Lead', 'Rage, crank left.']] }),
  step({ phase: 'Timeout and decide', range: null, form: 'spread', crank: true, cite: 'p825', page: '15-9, 16-12', href: '#shoot',
    text: 'By the rule of thumb a 20 NM forward-quarter shot times out in about 40 seconds. At timeout the section decides from its timeline and the bandits\' awareness: skate (launch and leave) or banzai (on to the merge).',
    calls: [['Lead', 'Rage 11, timeout.'], ['Wing', 'Rage 12, timeout.'], ['Lead', 'Rage, skate.']] }),
  step({ phase: 'Out', range: null, form: 'spread', crank: 'out', cite: 'p825', page: '16-12, A-7', href: '#shoot',
    text: 'Skating, the section turns out (a turn to a cold aspect) and leaves the group to the controller, ready to recommit if it comes back into the criteria.',
    calls: [['Lead', 'Rage, out south.']] }),
];

// Where everyone is at each step. The section flies north at KT until the shot
// and cranks 50 degrees left after it; the group flies south at KT toward the
// section's start line, its two contacts 2 NM apart in azimuth.
export const SHOT_NM = 20;
export const CRANK_AO = 50;
export function positions(i) {
  const s = STEPS[i];
  const nm = (sec) => (KT * sec) / 3600;
  if (s.range !== null) {
    // Before the shot: the section has flown (50 - range) / 2 NM, since both
    // aircraft fly at the same speed straight at each other.
    const flown = (STEPS[0].range - s.range) / 2;
    return { lead: [-1.5, flown], wing: [1.5, flown], group: [[-1, flown + s.range], [1, flown + s.range]], missiles: [] };
  }
  const shotY = (STEPS[0].range - SHOT_NM) / 2;
  const tof = tofSec(SHOT_NM, 'forward');
  const crank = rad(-CRANK_AO);
  const dt = s.crank === 'out' ? tof + 30 : tof;
  // After the crank the section holds its heading; on "out" it turns to 180,
  // putting the group behind it.
  const legX = nm(Math.min(dt, tof)) * Math.sin(crank), legY = nm(Math.min(dt, tof)) * Math.cos(crank);
  const outY = s.crank === 'out' ? -nm(dt - tof) : 0;
  const hit = shotY + SHOT_NM - nm(tof);
  const g = shotY + SHOT_NM - nm(dt);
  const lead = [-1.5 + legX, shotY + legY + outY];
  const wing = [1.5 + legX, shotY + legY + outY];
  return { lead, wing, group: [[-1, g], [1, g]], missiles: [[-1, hit], [1, hit]], launch: [[-1.5, shotY], [1.5, shotY]] };
}
export const rangeAt = (i) => {
  const p = positions(i);
  return Math.hypot(p.group[0][0] - p.lead[0], p.group[0][1] - p.lead[1]);
};

// Quiz: aspect words and lateral separation (outcome 1 and 2).
export const ASPECT_ITEMS = [5, 15, 25, 40, 50, 80, 95, 105, 130, 160].map((ta) => ({ ta, side: ta % 2 ? 'L' : 'R', answer: aspectWord(ta) }));
export const LS_ITEMS = [[15, 30], [20, 20], [30, 15], [10, 20], [40, 10], [20, 30]].map(([ta, sr]) => ({ ta, sr, answer: lsRule(ta, sr) }));

// Quiz: section, control and ROE (outcomes 3 to 6).
export const QUESTIONS = [
  { outcome: 3, ask: 'Your missile is in the launch zone but outside the no-escape range. What can the bandit still do?', answer: 'Maneuver to defeat it kinematically', options: ['Nothing: any shot in the zone is a kill', 'Maneuver to defeat it kinematically', 'Only jam your radar'], why: 'Inside RNE the missile can reach the bandit whatever it does; beyond it, a maneuvering bandit can make the missile run out of energy. (P-825, pp. 15-1 to 15-2, 15-8)' },
  { outcome: 3, ask: 'You fire at 16 NM from the beam. Roughly when does the missile time out?', answer: 'About 48 seconds', options: ['About 32 seconds', 'About 48 seconds', 'About 64 seconds'], why: 'The rule of thumb is 1 NM every 3 seconds from the beam: 16 × 3 = 48 s. (P-825, p. 15-9)' },
  { outcome: 4, ask: 'After the Fox-3 call, how far should the crank turn, at least?', answer: 'Until the bandit is 50° off the nose, cold side', options: ['Until the bandit is 20° off the nose', 'Until the bandit is 50° off the nose, cold side', 'Straight away from the bandit'], why: 'The crank must be at least 50° AO, so the velocity has more cross-range than down-range, without gimbaling the radar and trashing the shot. (P-825, p. 16-11)' },
  { outcome: 4, ask: 'Spiked and behind the timeline, you assume a missile is coming. What is the defense the training instruction teaches?', answer: 'Turn hard to put the bandit on the beam and dispense chaff', options: ['Climb and accelerate straight at the bandit', 'Turn hard to put the bandit on the beam and dispense chaff', 'Hold the crank and wait for timeout'], why: 'Beaming exploits the radar\'s Doppler notch; hold it at least 5 seconds or until the spike goes away. (P-825, pp. 16-12 to 16-13)' },
  { outcome: 5, ask: 'Two fighters meld on a group of two that is sortable in azimuth. Who takes the left contact?', answer: 'Lead', options: ['Lead', 'Wing', 'Whoever locks it first'], why: 'With the briefed assumptions met, lead sorts left, lead or high and the wingman right, trail or low, with no call. (P-825, p. 17-28)' },
  { outcome: 5, ask: 'The controller calls "two groups azimuth 20". What does the picture look like?', answer: 'Two groups side by side, 20 NM apart', options: ['Two groups side by side, 20 NM apart', 'Two groups one behind the other, 20 NM apart', 'Two groups 20 thousand feet apart in altitude'], why: 'Azimuth is two or more groups separated laterally in bearing; range is separation in range, stack in altitude. (P-825, pp. 17-20, A-1, A-8, A-10)' },
  { outcome: 6, ask: 'The controller declares a group "bandit". Can you shoot it?', answer: 'Not on that declaration alone', options: ['Yes, it is enemy', 'Not on that declaration alone', 'Only with a Fox-2'], why: 'A bandit is positively identified as enemy; the term does not by itself give direction or authority to engage. A shot needs a hostile declaration, and theater ROE normally also require an engagement order. (P-825, pp. 5-8, A-1, A-5; JP 3-01, p. III-16)' },
  { outcome: 6, ask: 'A track is flying outside the safe-passage corridor at the wrong altitude, with no other identification. What kind of ID is that?', answer: 'Procedural ID', options: ['Positive ID', 'Procedural ID', 'Combat identification complete'], why: 'Procedural ID rests on following airspace rules; positive ID comes from visual, electronic, IFF or other physics-based means and is normally what ROE require to shoot. (JP 3-01, p. III-13)' },
];

// Bullseye without a readout (Figure 3). Plan view, NM, bullseye at the origin,
// x east and y north; bearings in degrees as the card is drawn, north up. The
// conversions are plain navigation geometry, not a procedure from the sources.
// A point at a bearing and range from bullseye.
export const fromBull = (brg, rng) => [rng * Math.sin(rad(brg)), rng * Math.cos(rad(brg))];
// Bearing and range from a to b (both plan-view points).
export function bearingRange(a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  return { brg: norm360(deg(Math.atan2(dx, dy))), rng: Math.hypot(dx, dy) };
}
// A navigation display steering to bullseye shows bearing and range TO it; you
// are on the reciprocal bearing FROM it, at the same range.
export const ownFromSteer = (brgTo, rng) => ({ brg: norm360(brgTo + 180), rng });
// The quick cases, range only: on nearly the same bullseye bearing the ranges
// subtract; on nearly opposite bearings they add. Offered only when the result
// is within 2 NM of the true range: the same-bearing case degrades fast when
// the two ranges are close.
export function shortcut(own, group) {
  const d = Math.abs(norm180(group.brg - own.brg));
  const sc = d <= 30 ? { kind: 'same', rng: Math.abs(group.rng - own.rng) } : d >= 150 ? { kind: 'opposite', rng: group.rng + own.rng } : null;
  if (!sc) return null;
  const exact = bearingRange(fromBull(own.brg, own.rng), fromBull(group.brg, group.rng)).rng;
  return Math.abs(exact - sc.rng) <= 2 ? sc : null;
}
export const CARDINALS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];
export const cardinal = (h) => CARDINALS[Math.round(norm360(h) / 45) % 8];
// An invented problem: your steering readout to bullseye and a broadcast call.
// Bearings to 5 degrees and ranges to 5 NM, as a call would round them; the
// group is 15 to 70 NM from you and inside the card's 80 NM ring.
export function bullseyeProblem(rand = Math.random) {
  const pick = (lo, hi, by) => lo + by * Math.floor(rand() * ((hi - lo) / by + 1));
  for (;;) {
    const steer = { brg: pick(0, 355, 5), rng: pick(15, 60, 5) };
    const own = ownFromSteer(steer.brg, steer.rng);
    const group = { brg: pick(0, 355, 5), rng: pick(20, 75, 5) };
    const braa = bearingRange(fromBull(own.brg, own.rng), fromBull(group.brg, group.rng));
    if (braa.rng < 15 || braa.rng > 70) continue;
    const track = pick(0, 315, 45); // broadcast calls give a cardinal track
    return { steer, own, group, braa, track, alt: pick(15, 35, 1) };
  }
}
