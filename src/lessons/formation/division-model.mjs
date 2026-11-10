// Four-Ship and Display Formations module: data and geometry. Sources:
// [1] CNATRA P-1288 (Rev. 01-23), T-45 Tactical Formation FTI, by printed
// page; [2] VT-35 Tiltrotor Formation and Aerial Refueling Procedures, by
// slide title; [4] FAST Formation Pilots' Knowledge Guide v3.0, by printed
// page. Display rules ([3] RA 2335) are on the page, not here.

const D = Math.PI / 180;

// Close (administrative) four-ship configurations, drawn in units of one
// wingspan. The wingman's bearing line is 30-45° aft of lead [4, p. 9]; the
// figure draws 35°, with 1.5 spans between neighbours, as an illustration.
export const BEARING = 35;
export const STEP = 1.5;
const bx = STEP * Math.cos(BEARING * D), by = STEP * Math.sin(BEARING * D);

export const ADMIN = [
  { id: 'fingertip', name: 'Fingertip', count: 4, cite: '8–9',
    where: '#2 on lead’s bearing line on one side; #3 on the other side with #4 on #3’s bearing line, outboard. “Strong right” puts the second element on the right, like the fingertips of a right hand.',
    use: 'The standard close configuration, and the one every configuration change starts from.' },
  { id: 'echelon', name: 'Echelon', count: 4, cite: '10',
    where: 'Every wingman on the same side, each on the bearing line of the aircraft ahead.',
    use: 'The traffic pattern and setting up a pitchout. Lead can turn only away from the flight.' },
  { id: 'trail', name: 'Close trail', count: 4, cite: '10',
    where: 'Each wingman behind the aircraft ahead, slightly low. Extended trail is the same configuration at greater spacing.',
    use: 'Wingwork; extended trail when more maneuverability is wanted.' },
  { id: 'diamond', name: 'Diamond', count: 4, cite: '11, 29',
    where: '#4 in the slot, directly behind lead, on the fingertip bearing line of both #2 and #3.',
    use: 'A compact, symmetrical and maneuverable four-ship, and the building block of mass display formations.' },
  { id: 'vic', name: 'Vic (three)', count: 3, cite: '9, 13',
    where: '#2 and #3 on lead’s bearing line, one each side. The flight usually flies it as a four-ship with a phantom #4.',
    use: 'A flight of three.' },
  { id: 'vic5', name: 'Vic (five)', count: 5, cite: '9',
    where: 'The vic extended outboard: #4 behind #3 and #5 behind #2, each on the bearing line.',
    use: 'A larger flight, for example in a flypast.' },
];

export const admin = (id) => ADMIN.find((f) => f.id === id);

// Positions from above: x to the right, y aft, in wingspans; lead at 0,0.
// side 1 = the element (or echelon) on the right.
export function adminPositions(id, side = 1) {
  const s = side;
  const at = (n, x, y, ref) => ({ n, x, y, ref });
  switch (id) {
    case 'fingertip': return [at(1, 0, 0, 1), at(2, -s * bx, by, 1), at(3, s * bx, by, 1), at(4, 2 * s * bx, 2 * by, 3)];
    case 'echelon': return [1, 2, 3, 4].map((n) => at(n, s * bx * (n - 1), by * (n - 1), Math.max(n - 1, 1)));
    case 'trail': return [1, 2, 3, 4].map((n) => at(n, 0, STEP * (n - 1), Math.max(n - 1, 1)));
    case 'diamond': return [at(1, 0, 0, 1), at(2, -s * bx, by, 1), at(3, s * bx, by, 1), at(4, 0, 2 * by, 1)];
    case 'vic': return [at(1, 0, 0, 1), at(2, -s * bx, by, 1), at(3, s * bx, by, 1)];
    case 'vic5': return [at(1, 0, 0, 1), at(2, -s * bx, by, 1), at(3, s * bx, by, 1), at(4, 2 * s * bx, 2 * by, 3), at(5, -2 * s * bx, 2 * by, 2)];
    default: throw new Error(`unknown configuration ${id}`);
  }
}

// Tactical four-ship formations, in nautical miles; x right, y aft.
export const SPREAD = 0.9; // -1 to -3, 0.8-1.0 nm abeam [1, p. 7-1]
export const TAC_WING = { min: 0.2, max: 0.6, drawn: 0.4, aft: 45 }; // [1, p. 6-9]; 45° aft is illustrative

export const TACTICAL = [
  { id: 'wall', name: 'Division wall', cite: '[1, p. 7-1]',
    where: 'All four line abreast in combat spread: −1 and −3 in the centre, 0.8–1.0 nm apart; −2 and −4 outside, the same distance from their section leads. Each jet flies its own briefed altitude.',
    use: 'Simultaneous attacks on air threats or surface targets with the most visual mutual support.' },
  { id: 'fluid', name: 'Fluid four', cite: '[1, pp. 6-9, 7-2]',
    where: '−1 and −3 in combat spread; −2 and −4 in tac wing on their section leads: on the cruise bearing line or aft of it, 0.2–0.6 nm away, no lower than 1,000 ft below.',
    use: 'Transits, holding and quick changes of direction: the section leads keep mutual support while the wingmen get time for cockpit tasks. A step between fingertip and wall.' },
  { id: 'cruise', name: 'Division combat cruise', cite: '[2, “Division Combat Cruise”]',
    where: 'Both sections in combat cruise: −3 sets the interval about 0.5 nm behind lead, on one side; −2 balances the flight on the other side; −4 flies on −3, “heavy” to −3’s side.',
    use: 'A division of slower aircraft, shown here as the Navy tiltrotor brief draws it.' },
];

export function tacticalPositions(id, side = 1) {
  const s = side, a = TAC_WING.aft * D, w = TAC_WING.drawn;
  const wx = w * Math.cos(a), wy = w * Math.sin(a);
  switch (id) {
    // Figure 7-1 order, left to right: -2, -1, -3, -4 (side 1).
    case 'wall': return [{ n: 1, x: 0, y: 0, ref: 1 }, { n: 2, x: -s * SPREAD, y: 0, ref: 1 }, { n: 3, x: s * SPREAD, y: 0, ref: 1 }, { n: 4, x: 2 * s * SPREAD, y: 0, ref: 3 }];
    case 'fluid': return [{ n: 1, x: 0, y: 0, ref: 1 }, { n: 2, x: -s * wx, y: wy, ref: 1 }, { n: 3, x: s * SPREAD, y: 0, ref: 1 }, { n: 4, x: s * (SPREAD + wx), y: wy, ref: 3 }];
    case 'cruise': {
      const c = 0.5, x3 = -s * c * Math.tan(30 * D);
      return [{ n: 1, x: 0, y: 0, ref: 1 }, { n: 2, x: s * c * Math.sin(45 * D), y: c * Math.cos(45 * D), ref: 1 },
        { n: 3, x: x3, y: c, ref: 1 }, { n: 4, x: x3 - s * c * Math.sin(45 * D), y: c + c * Math.cos(45 * D), ref: 3 }];
    }
    default: throw new Error(`unknown formation ${id}`);
  }
}

// Division wall turns [1, pp. 5-7, 5-8, 7-4, 7-5]: 300 KIAS. The turn
// radius is illustrative (the FTI gives 14 units AOA, not a radius).
export const SPEED = 300 / 3600; // nm per second
export const RADIUS = 0.3; // nm, illustrative

// Positions at time t (s) for a wall turn. dir -1 = left, 1 = right.
// Ground frame: x east, y north, flight initially heading north from y = 0.
// Tac turn: the aircraft on the outside of the turn turns first; each next
// one turns as the preceding aircraft's nose comes round to it, modelled as
// the delay that brings all four out line abreast on the new heading.
// In-place turn: all four turn 180° together.
export function wallTurn(kind, dir, t, side = 1) {
  const pts = tacticalPositions('wall', side);
  const xs = pts.map((p) => p.x);
  const outside = dir < 0 ? Math.max(...xs) : Math.min(...xs);
  const turn = kind === 'tac' ? 90 : 180;
  const T = (turn * D * RADIUS) / SPEED;
  return pts.map((p) => {
    const start = kind === 'tac' ? Math.abs(outside - p.x) / SPEED : 0;
    const cy = SPEED * start;
    let x, y, h;
    if (t <= start) { x = p.x; y = SPEED * t; h = 0; }
    else {
      const tau = t - start, th = Math.min(SPEED * tau / RADIUS, turn * D);
      x = p.x + dir * RADIUS - dir * RADIUS * Math.cos(th);
      y = cy + RADIUS * Math.sin(th);
      h = dir * th / D;
      if (tau > T) {
        const run = SPEED * (tau - T);
        if (kind === 'tac') x += dir * run; else y -= run;
      }
    }
    return { n: p.n, x, y, h, start, end: start + T };
  });
}

export const turnEnd = (kind, side = 1) => Math.max(...wallTurn(kind, -1, 0, side).map((p) => p.end));

// Pick-the-formation quiz.
export const PICKS = [
  { ask: 'Lead wants the flight set up for a pitchout to land.', answer: 'Echelon', why: 'Echelon is used in the traffic pattern and to set up pitchouts. [4, p. 10]' },
  { ask: 'The division has a long transit. −1 and −3 must keep mutual support, but the wingmen need time for cockpit tasks.', answer: 'Fluid four', why: 'Fluid four gives the section leads mutual support and the wingmen in tac wing cross-check time on long transits. [1, p. 7-2]' },
  { ask: 'Four fighters will attack surface targets at the same time with the most visual mutual support.', answer: 'Division wall', why: 'Division wall puts all four line abreast in combat spread for simultaneous attacks. [1, p. 7-1]' },
  { ask: 'A frequency change is coming and every wingman will be heads down for a moment.', answer: 'Route', why: 'In route the wingmen loosen to at least two to four ship widths, out to no more than 500 ft, for frequency changes and in-flight checks. [4, p. 12]' },
  { ask: 'A display team wants a compact, symmetrical four-ship to build a larger formation from.', answer: 'Diamond', why: 'The diamond is compact and maneuverable, and is often the building block of mass formations. [4, p. 11]' },
  { ask: 'Lead is about to change the flight from echelon to diamond.', answer: 'Fingertip', why: 'Configuration changes are made from fingertip: lead regroups the flight into fingertip first. [4, p. 9]' },
  { ask: 'Only three aircraft made it, but lead wants the signals and positions of a four-ship.', answer: 'Vic', why: 'A three-ship vic normally uses a phantom #4, so everyone flies as in a four-ship. [4, pp. 9, 13]' },
  { ask: 'The wingmen should follow lead with room to maneuver, for example in practice.', answer: 'Extended trail', why: 'Extended trail is used where greater maneuverability is wanted. [4, p. 10]' },
];
export const PICK_OPTIONS = ['Fingertip', 'Echelon', 'Extended trail', 'Diamond', 'Vic', 'Route', 'Division wall', 'Fluid four'];
