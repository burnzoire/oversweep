/* Pure, deterministic models for the Close Air Support module.
 * The brief's line order, units, readback rules, the types of control and
 * the clearance calls are JP 3-09.3's (25 November 2014); page references are
 * its printed pages. The worked brief is an invented example written in the
 * publication's format: its call signs, places and numbers are made up.
 */

const D = Math.PI / 180;
export const M_PER_NM = 1852;

// The invented worked example, built to the format of JP 3-09.3 Figure V-9.
export const EXAMPLE = {
  jtac: 'Gunsmoke 22',
  aircraft: 'Viper 41',
  gamePlan: 'Type 1, bomb on target, two Mk 82 each aircraft, 30 seconds spacing',
  ip: 'Hammer',
  heading: 270,
  offset: 'right',
  distanceNm: 8.2,
  elevationFt: 450,
  description: 'two armored vehicles in a tree line',
  location: 'NV 1234 5678',
  mark: 'smoke',
  friendlies: { dir: 'S', meters: 800 },
  egress: { dir: 'north', to: 'Anvil', block: '14 to 16' },
  fah: [240, 300],
  tot: '1430',
};

const CARDINAL = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
const WORD = { N: 'north', NE: 'northeast', E: 'east', SE: 'southeast', S: 'south', SW: 'southwest', W: 'west', NW: 'northwest' };

/** Sequential digits, as the brief reads a heading: 270 is "two seven zero". */
export function digits(n, width = 3) {
  const names = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  return String(n).padStart(width, '0').split('').map((c) => names[+c]).join(' ');
}

// The nine lines and the remarks, in order (JP 3-09.3 Figure V-9, pp. V-25 to V-30).
// `says` is what the JTAC transmits in the invented example; line numbers are
// not transmitted. `readback` marks the mandatory readback items (p. V-33).
export const NINE_LINE = [
  { id: 'ip', line: 1, title: 'IP or BP', unit: 'By name', says: `"${EXAMPLE.ip}"`, means: 'The initial point, where the run-in to the target starts; for helicopters, the battle position from which attacks are commenced.', readback: false, page: 'V-26' },
  { id: 'heading', line: 2, title: 'Heading and offset', unit: 'Degrees magnetic, IP or BP to target; offset left or right when given', says: `"${digits(EXAMPLE.heading)}, offset ${EXAMPLE.offset}"`, means: 'The magnetic heading from the IP to the target, given as three digits. The offset is the side of the IP-to-target line the aircrew may maneuver on.', readback: false, page: 'V-26' },
  { id: 'distance', line: 3, title: 'Distance', unit: 'IP to target in nautical miles to a tenth; BP to target in meters to the nearest 100', says: `"${String(EXAMPLE.distanceNm).replace('.', ' point ')}"`, means: 'How far the target is from the IP: nautical miles for fixed-wing aircraft, meters from the center of the BP for attack helicopters.', readback: false, page: 'V-26' },
  { id: 'elevation', line: 4, title: 'Target elevation', unit: 'Feet above mean sea level', says: `"${EXAMPLE.elevationFt} feet"`, means: 'Read as digits, with the word "feet" to separate it from line 5. MSL is understood; any other datum must be said.', readback: true, page: 'V-26 to V-27' },
  { id: 'description', line: 5, title: 'Target description', unit: 'Plain language', says: `"${EXAMPLE.description}"`, means: 'Specific enough for the aircrew to recognize the target, accurate and concise.', readback: false, page: 'V-27' },
  { id: 'location', line: 6, title: 'Target location', unit: 'Grid with the 100,000 m square, latitude and longitude, or an offset from a known point', says: `"${EXAMPLE.location}"`, means: 'Where the target is. A grid must include the 100,000-meter square identifier, and the number of digits is its precision, not its accuracy.', readback: true, page: 'V-27 to V-28' },
  { id: 'mark', line: 7, title: 'Mark type or terminal guidance', unit: 'The mark; for a laser, the call sign of the lasing platform and its code', says: `"${EXAMPLE.mark}"`, means: 'How the target will be marked, such as smoke, laser or IR. With off-board lasing, the call sign of who lases, the word "laser" and the code.', readback: false, page: 'V-30' },
  { id: 'friendlies', line: 8, title: 'Friendlies', unit: 'Cardinal or sub-cardinal direction from the target and meters', says: `"${WORD[EXAMPLE.friendlies.dir]} ${EXAMPLE.friendlies.meters}"`, means: 'The direction and distance from the target to the closest friendly position, which may not be the JTAC.', readback: false, page: 'V-30' },
  { id: 'egress', line: 9, title: 'Egress', unit: 'Preceded by the word "egress"', says: `"Egress ${EXAMPLE.egress.dir} to ${EXAMPLE.egress.to}, block ${EXAMPLE.egress.block}"`, means: 'How the aircrew leaves the target area, by direction and control point, with the altitude given in numbers.', readback: false, page: 'V-30' },
  { id: 'remarks', line: null, title: 'Remarks and restrictions', unit: 'Remarks, then restrictions, with the TOT last', says: `"Final attack headings ${digits(EXAMPLE.fah[0])} to ${digits(EXAMPLE.fah[1])}, TOT ${EXAMPLE.tot}"`, means: 'Remarks such as the threat, the laser target line or calls requested; then the restrictions, every one of which is read back: final attack headings, ACAs, danger close with initials, and the TOT, which comes last.', readback: true, page: 'V-30 to V-32' },
];

/** The aircrew's mandatory readback for a brief: lines 4 and 6 and every restriction (p. V-33). */
export function readback(brief = NINE_LINE) {
  return brief.filter((l) => l.readback).map((l) => l.says.replace(/"/g, '').replace(/^Final/, 'final')).join(', ');
}

/**
 * The example's geometry in nautical miles, east (x) and north (y) of the
 * target. Line 2 is the heading from the IP to the target, so the IP lies
 * on the reciprocal; line 8 is measured from the target.
 */
export function briefGeometry(ex = EXAMPLE) {
  if (!Number.isFinite(ex.heading) || !Number.isFinite(ex.distanceNm) || ex.distanceNm <= 0) throw new RangeError('Heading and a positive distance are required.');
  const back = (ex.heading + 180) * D;
  const ip = [Math.sin(back) * ex.distanceNm, Math.cos(back) * ex.distanceNm];
  const fb = CARDINAL[ex.friendlies.dir];
  if (fb === undefined) throw new RangeError(`Unknown direction ${ex.friendlies.dir}`);
  const r = ex.friendlies.meters / M_PER_NM;
  const friendlies = [Math.sin(fb * D) * r, Math.cos(fb * D) * r];
  // The offset side is to the right or left of the IP-to-target track.
  const side = (ex.heading + (ex.offset === 'right' ? 90 : -90)) * D;
  return { target: [0, 0], ip, friendlies, offsetSide: [Math.sin(side), Math.cos(side)] };
}

/** True when a heading lies inside an attack-heading window, wrapping through north. */
export function inWindow(heading, [from, to]) {
  const norm = (v) => ((v % 360) + 360) % 360;
  if (to - from >= 360) return true;
  // Clockwise from `from` to `to`, both ends included: 360 and 0 are north.
  return norm(heading - from) <= norm(to - from);
}

// Types of control (JP 3-09.3 pp. I-2, III-42 to III-47) and the clearance each uses.
export const CONTROLS = [
  { id: 1, needs: 'Sees the target and the attacking aircraft for each attack, and assesses its geometry before clearing it', clearance: 'CLEARED HOT', attacks: 'Individual attacks' },
  { id: 2, needs: 'Sees the target or uses accurate real-time targeting data from another asset; need not see the aircraft at release', clearance: 'CLEARED HOT', attacks: 'Individual attacks' },
  { id: 3, needs: 'Sees the target or uses accurate real-time targeting data, and sets restrictions such as time, area, headings or targets', clearance: 'CLEARED TO ENGAGE', attacks: 'Multiple attacks within one engagement' },
];

// Scenario questions for the control quiz, each answered from JP 3-09.3.
export const CONTROL_QUESTIONS = [
  { ask: 'The JTAC needs to watch each aircraft roll in and judge its nose position before clearing it. Which type of control?', answer: 'Type 1', options: ['Type 1', 'Type 2', 'Type 3'], why: 'Type 1: the controller sees the aircraft and the target and assesses the geometry of each attack. (p. III-43)' },
  { ask: 'At night the JTAC can see the target through a sensor but will not see the aircraft at weapons release. Which type of control?', answer: 'Type 2', options: ['Type 1', 'Type 2', 'Type 3'], why: 'Type 2 is used when the controller cannot see the aircraft at release or cannot see the target; night is one of the publication\'s examples. (pp. III-44 to III-45)' },
  { ask: 'A JDAM is to be dropped on a coordinate. Which type of control should not be used?', answer: 'Type 1', options: ['Type 1', 'Type 2', 'Type 3'], why: 'GPS- or INS-guided weapons should not be controlled under Type 1: the aircraft\'s geometry does not show where the weapon will fly. (p. III-43)' },
  { ask: 'The JTAC wants a flight to make several attacks on a set of targets inside a boundary for ten minutes. Which type of control?', answer: 'Type 3', options: ['Type 1', 'Type 2', 'Type 3'], why: 'Type 3 clears multiple attacks within a single engagement, subject to restrictions. (p. III-46)' },
  { ask: 'Under Type 3, what does the JTAC say to authorize weapons release?', answer: 'CLEARED TO ENGAGE', options: ['CLEARED HOT', 'CLEARED TO ENGAGE', 'CONTINUE', 'CONTINUE DRY'], why: 'CLEARED TO ENGAGE is the Type 3 clearance; CLEARED HOT is for Types 1 and 2. (pp. III-40 to III-41)' },
  { ask: 'On a training pass the JTAC lets the aircraft complete its run without releasing. What is the call under Type 1 or 2?', answer: 'CONTINUE DRY', options: ['CLEARED HOT', 'CONTINUE', 'CONTINUE DRY', 'ABORT'], why: 'CONTINUE DRY approves the pass without ordnance; under Type 3 it is "Type 3, CONTINUE DRY". (p. III-41)' },
  { ask: 'The aircraft will never be required to be TALLY the target or CONTACT the mark. Which method of attack?', answer: 'Bomb on coordinate', options: ['Bomb on target', 'Bomb on coordinate'], why: 'If the aircraft is never required to acquire the target or the mark, it is a BOC attack. (p. III-48)' },
  { ask: 'Rockets and guns on a target the aircrew has positively identified. Which method of attack?', answer: 'Bomb on target', options: ['Bomb on target', 'Bomb on coordinate'], why: 'Rockets and guns on positively identified targets are one of the publication\'s BOT examples. (p. III-49)' },
  { ask: 'In a bomb-on-coordinate attack, who reads back lines 4 and 6?', answer: 'Every aircraft delivering ordnance, from its system', options: ['The lead aircraft only', 'Every aircraft delivering ordnance, from its system', 'No one: BOC needs no readback'], why: 'For BOC every aircraft delivering ordnance reads back lines 4, 6 and restrictions from its weapon or system; for BOT only the lead is required to. (p. V-33)' },
  { ask: 'A FAC(A) has been given control by the JTAC. Who still holds abort authority?', answer: 'The JTAC', options: ['The JTAC', 'The FAC(A) only', 'The flight lead'], why: 'The FAC(A) may give final release authority if delegated, but the JTAC retains abort authority. (p. V-58)' },
];

/** Questions for "which line?": a transmission from the example, answered by its line. */
export function lineQuestions(brief = NINE_LINE) {
  return brief.map((l) => ({ says: l.says, answer: l.line ? `Line ${l.line}, ${l.title.toLowerCase()}` : 'Remarks and restrictions', item: l }));
}

// The opening example played out for Figure 1, step by step. Each step is a
// call on the radio and where the two aircraft are at that moment, in
// nautical miles east (x) and north (y) of the target. The flow is JP 3-09.3's
// execution template (pp. V-14 to V-50); Type 3 swaps the per-pass IN and
// CLEARED HOT for one CLEARED TO ENGAGE and the engagement calls (p. III-46).
// Positions are illustrative: the second aircraft trails by its 30 seconds.
export const ATTACK_TYPES = [1, 3];
export function attackSteps(type = 1) {
  if (!ATTACK_TYPES.includes(type)) throw new RangeError(`No played example for Type ${type}`);
  const { jtac, aircraft: lead } = EXAMPLE;
  const wing = lead.replace(/\d$/, (d) => String(+d + 1));
  const ip = briefGeometry().ip;
  const at = (dx, dy = 0) => [ip[0] + dx, ip[1] + dy];
  const hold = { a: { pos: at(0.6, 0.5), hdg: 0 }, b: { pos: at(1.2, 1.1), hdg: 180 } };
  const gamePlan = type === 1 ? EXAMPLE.gamePlan : EXAMPLE.gamePlan.replace('Type 1', 'Type 3');
  const s = (phase, who, says, a, b, extra = {}) => ({ phase, who, says, a, b, show: [], ...extra });
  const before = [
    s('Routing', jtac, `"${lead}, ${jtac}, maintain ${EXAMPLE.ip}, block 15 to 17."`, { pos: at(10.1, 0.3), hdg: 270 }, { pos: at(10.6, 1.0), hdg: 270 }, { href: '#checkin', note: 'Routing and safety of flight first: at least a "maintain" instruction.' }),
    s('Check-in', lead, `"${jtac}, ${lead}, mission 4123, 2 by A-10C, 10 miles east of ${EXAMPLE.ip}, block 15 to 17, four Mk 82, playtime 40 minutes, targeting pods."`, { pos: at(9.4, 0.3), hdg: 270 }, { pos: at(9.9, 1.0), hdg: 270 }, { href: '#checkin', note: 'Given in order, when the controller asks for it.' }),
    s('Situation update', jtac, 'The threat, and "all friendlies are south of the 56 northing".', { pos: at(5, 0.3), hdg: 270 }, { pos: at(5.5, 1.0), hdg: 270 }, { show: ['northing', 'friendlies'], href: '#checkin', note: 'Cut to what this flight needs. Friendly grids are avoided.' }),
    s('Game plan', jtac, `"${lead}, ${gamePlan}; advise when ready for 9-line."`, hold.a, hold.b, { show: ['northing'], href: '#control', note: type === 1 ? 'Type 1: the JTAC will watch every aircraft and clear each attack on its own.' : 'Type 3: the JTAC will clear the flight once for several attacks inside the brief\'s restrictions.' }),
    s('9-line', jtac, 'The three transmissions of three lines, then "final attack headings two four zero to three zero zero, TOT 1430".', hold.a, hold.b, { show: ['northing', 'brief', 'friendlies'], href: '#nineline', note: 'Figure 2 takes the brief line by line.' }),
    s('Readback', lead, `"${readback()}." ${jtac}: "readback correct."`, hold.a, hold.b, { show: ['northing', 'brief'], href: '#readback', note: 'Elevation, location and every restriction are read back.' }),
    s('Correlation', lead, `"${lead}, CONTACT the mark."`, { pos: at(-2.5), hdg: 270 }, { pos: at(-0.2), hdg: 270 }, { show: ['northing', 'brief', 'mark'], href: '#correlation', note: 'The smoke lands 30 to 45 seconds before the TOT.' }),
    s('Correlation', jtac, `"${lead}, from the mark, east 50, the western vehicle is your target." ${lead}: "TALLY."`, { pos: at(-3.4), hdg: 270 }, { pos: at(-1.1), hdg: 270 }, { show: ['northing', 'brief', 'mark', 'target'], href: '#correlation', note: 'Bomb on target: the aircrew must see the target before it can be cleared.' }),
  ];
  const off = (who) => `"${who}, off, two away."`;
  const type1 = [
    s('Attack', lead, `"${lead}, IN heading 270."`, { pos: [4.2, 0], hdg: 270 }, { pos: [6.7, 0], hdg: 270 }, { show: ['northing', 'brief', 'mark', 'target'], call: 'IN', href: '#attack', note: 'Everyone else now holds their calls until the lead is cleared or aborted.' }),
    s('Clearance', jtac, `"${lead}, CLEARED HOT."`, { pos: [2.6, 0], hdg: 270 }, { pos: [5.1, 0], hdg: 270 }, { show: ['northing', 'brief', 'mark', 'target'], call: 'CLEARED HOT', href: '#clearance', note: 'Under Type 1 the JTAC sees the aircraft and judges its geometry before clearing it.' }),
    s('Release', lead, off(lead), { pos: [-0.6, 0.9], hdg: 330 }, { pos: [3.4, 0], hdg: 270 }, { show: ['northing', 'brief', 'target', 'hits1'], href: '#attack' }),
    s('Attack', wing, `"${wing}, IN heading 270." ${jtac}: "${wing}, CLEARED HOT."`, { pos: [-0.5, 2.2], hdg: 0 }, { pos: [2.6, 0], hdg: 270 }, { show: ['northing', 'brief', 'target', 'hits1'], call: 'CLEARED HOT', href: '#clearance', note: 'Here the second aircraft makes its own IN call and gets its own clearance; a controller can also clear the whole flight at once ("Viper 41, flight, CLEARED HOT").' }),
    s('Release', wing, off(wing), { pos: [-0.2, 2.8], hdg: 0 }, { pos: [-0.6, 0.9], hdg: 330 }, { show: ['northing', 'brief', 'target', 'hits1', 'hits2'], href: '#attack' }),
  ];
  const type3 = [
    s('Clearance', jtac, `"${lead}, CLEARED TO ENGAGE."`, { pos: [5.6, 0], hdg: 270 }, { pos: [8.1, 0], hdg: 270 }, { show: ['northing', 'brief', 'mark', 'target'], call: 'CLEARED TO ENGAGE', href: '#clearance', note: 'One clearance for several attacks, inside the brief\'s headings and time. The JTAC monitors and keeps abort authority.' }),
    s('Attack', lead, `"${lead}, COMMENCING ENGAGEMENT."`, { pos: [3.4, 0], hdg: 270 }, { pos: [5.9, 0], hdg: 270 }, { show: ['northing', 'brief', 'mark', 'target'], call: 'COMMENCING ENGAGEMENT', href: '#control', note: 'Called before the first release.' }),
    s('Release', lead, off(lead), { pos: [-0.6, 0.9], hdg: 330 }, { pos: [3.4, 0], hdg: 270 }, { show: ['northing', 'brief', 'target', 'hits1'], href: '#attack', note: 'No CLEARED HOT for each pass: the clearance already given covers it.' }),
    s('Release', wing, off(wing), { pos: [-0.2, 2.8], hdg: 0 }, { pos: [-0.6, 0.9], hdg: 330 }, { show: ['northing', 'brief', 'target', 'hits1', 'hits2'], href: '#attack', note: 'The second aircraft attacks under the same clearance. A reattack would need none either while it stands.' }),
    s('Engagement complete', lead, `"${lead}, ENGAGEMENT COMPLETE."`, { pos: [0.2, 3.3], hdg: 0 }, { pos: [-0.3, 2.0], hdg: 0 }, { show: ['northing', 'brief', 'target', 'hits1', 'hits2'], href: '#control' }),
  ];
  const assess = s('Assessment', jtac, 'Battle damage assessment for the flight as it egresses north to Anvil.', { pos: [0.5, 3.6], hdg: 0 }, { pos: [0, 3.2], hdg: 0 }, { show: ['northing', 'brief', 'target', 'hits1', 'hits2', 'egress'], href: '#attack', note: 'Passed for the flight, not for each aircraft.' });
  return [...before, ...(type === 1 ? type1 : type3), assess];
}
