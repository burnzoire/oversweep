// Data and geometry for the Helicopter Formation module, without the DOM.
// Source: Army TC 3-04.1-4, Fundamentals of Flight (March 2026), chapter 6,
// cited by printed page as [1, p. n]. Distances are in rotor disks (one
// rotor diameter of the type being flown), the unit the source uses.

const D = Math.PI / 180;

// Horizontal distance between tip-path planes: from the rear edge of the
// leading aircraft's disk to the front edge of the trailing one [1, p. 214–215].
// `gap` is the value drawn; the band is the source's.
export const SPACING = [
  { id: 'tight', name: 'Tight', gap: 2, band: 'about 2 rotor disks' },
  { id: 'close', name: 'Close', gap: 4, band: '3 to 5 rotor disks' },
  { id: 'loose', name: 'Loose', gap: 8, band: '6 to 10 rotor disks' },
  { id: 'extended', name: 'Extended', gap: 12, band: 'more than 10 rotor disks, as tactics require' },
];

// Centre-to-centre distance for a disk-edge gap: one diameter more, since
// the gap is measured edge to edge.
export const centreDistance = (gap) => gap + 1;

// The formations. `angle` is degrees off the 6 o'clock of the aircraft the
// wingman flies on (0 = directly behind, 90 = abeam) [1, p. 214]. `ref`
// says which aircraft each wingman references: 'previous' (the one ahead
// of it) or 'lead'. `sides` gives each wingman's side relative to the
// flight's chosen side (1 = same, -1 = opposite), repeating. `zone` is the
// manoeuvre arc for a manoeuvring formation, [from, to] in signed degrees
// (negative = the opposite side). `fixedCount` forces a flight size.
export const FORMATIONS = [
  {
    id: 'staggered', name: 'Staggered', kind: 'fixed', angle: 45, ref: 'previous', sides: [1, -1],
    where: 'Each aircraft about 45° astern of the one ahead of it, alternating sides; chalk 2 sets the side, so chalk 3 and the other odd chalks fly in trail behind lead.',
    use: 'Congested airspace, large formations in a low-threat area, air assault approaches and takeoffs, narrow canyons.',
    gains: 'Fixes the wingmen; lead can manoeuvre; loads are easy to preposition; troops deploy for all-round security.',
    costs: 'Hard work to hold position when tight or close; needs a long, wide landing area; some limit on door gunners’ fire.',
    cite: '224–225',
  },
  {
    id: 'echelon', name: 'Echelon', kind: 'fixed', angle: 45, ref: 'previous', sides: [1],
    where: 'Every wingman on the same side, at about 30° to 45° off the 6 o’clock (drawn at 45°), at the briefed horizontal and vertical distances.',
    use: 'Dust, sand and snow takeoffs and landings; a flank deployment of troops.',
    gains: 'The whole formation is easy to see; troops deploy to the flank; door gunners fire almost unrestricted; good in dust, sand and snow.',
    costs: 'Severely limits the flight’s manoeuvring, so more vulnerable in a threat engagement; needs a long, wide landing area; loads are harder to preposition.',
    cite: '225',
  },
  {
    id: 'trail', name: 'Trail', kind: 'fixed', angle: 0, ref: 'previous', sides: [1],
    where: 'Each wingman directly behind the aircraft ahead, following its movement within 10°. The hardest fixed formation to fly.',
    use: 'Landings and takeoffs, and as a transition between formations; not for long periods.',
    gains: 'Loads are easy to preposition; door gunners fire almost unrestricted; troops deploy to the flanks.',
    costs: 'Spacing and closure are hard to judge, worst at night; a poor choice in dust, sand and snow, where a following aircraft can be engulfed; needs a long landing area; the aircraft ahead struggles to see wingmen at its 6 o’clock.',
    cite: '226',
  },
  {
    id: 'v', name: 'V', kind: 'fixed', angle: 45, ref: 'lead', sides: [1, -1], fixedCount: 3,
    where: 'A leader and two wingmen, each in echelon, one left and one right, about 45° astern of the leader.',
    use: 'A small landing area; with light winds, small V formations for dust, sand and snow.',
    gains: 'Troops deploy for all-round security; needs a relatively small landing area; increased disk separation keeps aircraft out of the cloud ahead.',
    costs: 'Inboard door gunners’ fire is restricted, and the pilots must scan for both other aircraft.',
    cite: '226–227',
  },
  {
    id: 'combat-cruise', name: 'Combat cruise', kind: 'manoeuvring', angle: 45, ref: 'previous', sides: [1, -1], zone: [-90, 90], flightZone: [-45, 45],
    where: 'A team’s wingman may fly anywhere from about lead’s 3 o’clock round the back to 9 o’clock, best at 45°, and tells lead on changing sides if lead needs it. In larger flights each aircraft flies off the one ahead, here within 45°.',
    use: 'The basic team formation: maximum flexibility with adequate mutual support, while crews concentrate on navigation, terrain masking and the enemy.',
    gains: 'Lead manoeuvres and engages freely; the wingman covers lead and is ready to fire; no fixed position to hold.',
    costs: 'Long periods at lead’s 6 o’clock are not recommended, and the wingman must avoid presenting a linear target in break turns.',
    cite: '227–228',
  },
  {
    id: 'combat-cruise-side', name: 'Combat cruise left/right', kind: 'manoeuvring', angle: 45, ref: 'previous', sides: [1], zone: [0, 90],
    where: 'A modified staggered formation: each wingman stays in an arc from directly behind to abeam on one side, best at 45°, and changes sides only when lead briefs it.',
    use: 'When lead wants to limit the wingmen’s manoeuvring yet keep tactical spacing and some predictability.',
    gains: 'Manoeuvring room and spacing, yet lead knows which side every wingman is on.',
    costs: 'Lead has less freedom than in combat cruise.',
    cite: '229',
  },
  {
    id: 'combat-trail', name: 'Combat trail', kind: 'manoeuvring', angle: 0, ref: 'previous', sides: [1], zone: [-30, 30],
    where: 'Each wingman within 30° either side of the aircraft ahead’s 6 o’clock.',
    use: 'Narrow terrain and narrow LZs, when lead needs more control than combat cruise gives.',
    gains: 'More control for lead, and a narrow footprint.',
    costs: 'Not for long periods or at night: closure on the aircraft ahead is hard to judge.',
    cite: '229–230',
  },
  {
    id: 'combat-spread', name: 'Combat spread', kind: 'manoeuvring', angle: 90, ref: 'lead', sides: [1], fixedCount: 2,
    where: 'Lead calls it with a side; the wingman moves toward the abeam position at lead’s 3 or 9 o’clock.',
    use: 'Maximum observation to the front, or the shortest exposure crossing open areas.',
    gains: 'Both crews look forward with overlapping fields of view.',
    costs: 'A rapid scan is needed to keep the other aircraft and the terrain ahead in sight, more so at night.',
    cite: '230',
  },
];

export const formation = (id) => FORMATIONS.find((f) => f.id === id);

// Positions in rotor disks: x right, y aft (down the page), lead at the
// origin heading up. `side` is 1 (right) or -1 (left): staggered right
// puts chalk 2 on the right. Returns [{ chalk, x, y, ref, side }].
export function positions(id, count, gap, side = 1) {
  const f = formation(id), n = f.fixedCount ?? count, d = centreDistance(gap);
  const out = [{ chalk: 1, x: 0, y: 0, ref: null, side: 0 }];
  for (let k = 2; k <= n; k++) {
    const s = side * f.sides[(k - 2) % f.sides.length];
    const ref = f.ref === 'lead' ? out[0] : out[k - 2];
    out.push({ chalk: k, x: ref.x + s * d * Math.sin(f.angle * D), y: ref.y + d * Math.cos(f.angle * D), ref: ref.chalk, side: s });
  }
  return out;
}

// Inadvertent IMC breakup from a staggered formation [1, pp. 220–221]:
// lead straight ahead, each chalk turns 10° × its chalk number away from
// the flight and climbs 500 ft above the chalk ahead. In staggered left,
// even chalks turn left and odd chalks right; staggered right mirrors it.
export function iimcBreakup(count, staggerSide = 'left') {
  const even = staggerSide === 'left' ? 'left' : 'right', odd = even === 'left' ? 'right' : 'left';
  return Array.from({ length: count }, (_, i) => {
    const chalk = i + 1;
    if (chalk === 1) return { chalk, turn: 0, dir: 'straight', climb: 0 };
    return { chalk, turn: 10 * chalk, dir: chalk % 2 === 0 ? even : odd, climb: 500 * (chalk - 1) };
  });
}

// The en route lead change, step by step [1, p. 218], for a flight of
// three in staggered right at close spacing (gap 4, centre distance 5),
// drawn relative to the formation (so a slowing aircraft drifts aft).
// Lead departs to the left, the side away from chalk 2. `lead` marks who
// leads at that step; h is heading in degrees (0 = the flight's heading).
const S = 5 * Math.SQRT1_2;
export const LEAD_CHANGE = [
  { say: 'Lead gives the prearranged signal; the flight acknowledges, starting with chalk 2. Only lead may start a lead change, and never by a wingman accelerating past.',
    at: [[0, 0, 0], [S, S, 0], [0, 2 * S, 0]], lead: 1 },
  { say: 'Lead turns 30° to 90° away to the briefed side, to leave the formation and make room.',
    at: [[-3, -1.5, -60], [S, S, 0], [0, 2 * S, 0]], lead: 1 },
  { say: 'Lead moves at least eight rotor disks to the announced side and turns to parallel the formation.',
    at: [[-9, 0, 0], [S, S, 0], [0, 2 * S, 0]], lead: 1 },
  { say: 'Chalk 2, the new lead, confirms the former lead is clear of the flight and announces it.',
    at: [[-9, 0, 0], [S, S, 0], [0, 2 * S, 0]], lead: 2 },
  { say: 'The former lead slows to 10 KIAS below the en route airspeed and confirms each aircraft by sight as it passes, so as not to rejoin early.',
    at: [[-9, 6, 0], [S, S, 0], [0, 2 * S, 0]], lead: 2 },
  { say: 'After the last aircraft has passed, the former lead rejoins as trail and takes on the trail aircraft’s lighting; the old trail aircraft changes its lighting to match the rest.',
    at: [[S, 3 * S, 0], [S, S, 0], [0, 2 * S, 0]], lead: 2 },
];

// Sample lighting conditions, Table 6-1 [1, p. 216]. A sample only: AR 95-1,
// AR 95-2, aircraft limits, local rules and SOPs govern.
export const LITECON = [
  { n: 1, name: 'FAA day', anticollision: 'White', nav: 'Off', formation: 'Off', covert: 'Off' },
  { n: 2, name: 'FAA night', anticollision: 'Red', nav: 'Bright', formation: 'Bright', covert: 'On' },
  { n: 3, name: 'Night form', anticollision: 'Off', nav: 'Dim', formation: 'Bright', covert: 'On' },
  { n: 4, name: 'Covert', anticollision: 'Off/IR', nav: 'Off', formation: 'Covert', covert: 'On' },
  { n: 5, name: 'Total blackout', anticollision: 'Off', nav: 'Off', formation: 'Off', covert: 'Off' },
];

// Quiz: pick the formation. Every answer is a sourced use, advantage or
// limit from the formation's own paragraph [1, pp. 223–230] or the
// environmental chapter [1, pp. 103–105, 137].
export const PICKS = [
  { outcome: 1, ask: 'A flight of four lands in a dusty LZ with the wind allowing it. Which fixed formation gives the least chance of landing in another aircraft’s cloud?', answer: 'Echelon',
    why: 'Echelon is the source’s formation for dust, sand and snow takeoffs and landings, and in snow it lowers the chance of being engulfed in another aircraft’s cloud. Trail is a poor choice. [1, pp. 105, 225–226]' },
  { outcome: 1, ask: 'A large flight transits congested airspace in a low-threat area and then makes an air assault approach. Which is the common fixed formation for that?', answer: 'Staggered',
    why: 'Staggered is one of the most common Army formations, used through congested airspace, for large formations in low threat and for air assault approaches and takeoffs. [1, p. 224]' },
  { outcome: 1, ask: 'A team of two flies contour in hostile terrain and wants maximum flexibility with mutual support. Which formation?', answer: 'Combat cruise',
    why: 'Combat cruise is the basic team formation: the wingman may fly anywhere from 3 to 9 o’clock, best at 45°, so crews can concentrate on navigation, masking and the enemy. [1, p. 228]' },
  { outcome: 1, ask: 'The team is about to cross a wide open area and wants the most observation to the front for the least exposure. Which formation does lead call?', answer: 'Combat spread',
    why: 'Combat spread puts the wingman toward lead’s 3 or 9 o’clock for maximum observation to the front or to limit exposure over open areas. [1, p. 230]' },
  { outcome: 1, ask: 'A narrow valley leads to a narrow LZ and lead wants more control of the flight than combat cruise gives. Which formation?', answer: 'Combat trail',
    why: 'Combat trail holds wingmen within 30° of the 6 o’clock of the aircraft ahead, for narrow terrain and narrow LZs, but not for long or at night. [1, pp. 229–230]' },
  { outcome: 1, ask: 'The flight is changing from staggered to echelon. Which formation can it pass through on the way, as a technique?', answer: 'Trail',
    why: 'Trail can be used as a transitional formation before the next briefed formation, and for takeoffs and landings, but not for long periods. [1, pp. 217, 226]' },
  { outcome: 1, ask: 'Three aircraft must land in a small landing area with light winds and some dust, and the troops need all-round security. Which formation?', answer: 'V',
    why: 'The V needs a relatively small landing area, deploys troops for all-round security and, with light winds, suits dust, sand and snow. [1, pp. 226–227]' },
];
export const PICK_OPTIONS = ['Staggered', 'Echelon', 'Trail', 'V', 'Combat cruise', 'Combat trail', 'Combat spread'];
