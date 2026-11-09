// Lookout priorities and an invented tactical picture for the Situational
// Awareness and the Sensor Picture module. No DOM. Sources: [1] MCH 11-F16
// Vol 5 (1996), [2] CNATRA P-825 (07-14), [3] Electronic Warfare
// Fundamentals (2000), [4] JP 3-01 (2012), by printed page.

// [1] pp. 23-24: the time-share plan, highest priority first. Sectors 1, 1A
// and 2 are the basic cross-check; under load the lowest are dropped in order,
// and in a hard turn only Sector 1 may be left.
export const SECTORS = [
  { id: '1', name: 'Near rocks', where: 'Ahead, the ground that affects your flight path in the next 10 to 15 seconds' },
  { id: '1A', name: 'Far rocks', where: 'Farther ahead, the terrain that will affect your future maneuvering' },
  { id: '2', name: 'Check six', where: "Inside the flight, behind: your position, and lead's six o'clock" },
  { id: '3', name: 'Inside the flight, ahead', where: 'Inside the formation, ahead of the 3/9 line: bandits converting, forward-quarter SAMs' },
  { id: '4', name: 'Outside the flight', where: 'Outside the formation, ahead of and behind the 3/9 line: lowest priority' },
];
export const LOADS = [
  { id: 'light', label: 'Light', keep: 5 },
  { id: 'busy', label: 'Busy', keep: 3 },
  { id: 'saturated', label: 'Saturated', keep: 2 },
  { id: 'hard-turn', label: 'Hard turn', keep: 1 },
];
// [1] p. 24: lead and number three fold the radar into Sector 3; two and four
// look at it after Sector 4.
export function crossCheck(position, loadId) {
  const keep = LOADS.find((l) => l.id === loadId)?.keep ?? 5;
  const order = SECTORS.slice(0, keep).map((s) => s.id);
  const radarAfter = position === 'lead' ? '3' : '4';
  if (order.includes(radarAfter)) order.splice(order.indexOf(radarAfter) + 1, 0, 'Radar');
  return order;
}

// Figure 2: an invented picture, positions in NM east and north of you, you
// heading north. Each track lists which sources hold it and what each gives.
export const SOURCES = [
  { id: 'eyes', label: 'Eyes' },
  { id: 'radar', label: 'Radar' },
  { id: 'rwr', label: 'Warning receiver' },
  { id: 'control', label: 'Controller (voice)' },
  { id: 'link', label: 'Datalink' },
];
export const TRACKS = [
  { id: 'wing', label: 'Your wingman', x: 2, y: -0.5, kind: 'friend', seen: { eyes: 'In sight, line abreast', link: 'Own flight member: position and status' } },
  { id: 'north', label: 'Group north', x: -4, y: 38, kind: 'hostile', seen: {
    radar: 'Contact: bearing 354, 38 NM, 25,000 ft, hot',
    control: '"Single group, bullseye 350/60, 25 thousand, hostile"',
    link: 'Hostile air track from the control platform',
    rwr: 'Airborne radar, search, about 12 o\'clock: bearing only',
  } },
  { id: 'east', label: 'Track east', x: 26, y: 22, kind: 'unknown', seen: {
    link: 'Unknown air track from the control platform, 34 NM',
  } },
  { id: 'sam', label: 'SAM site', x: 30, y: -6, kind: 'surface', seen: {
    rwr: 'Surface radar, search, about 3 o\'clock: bearing only',
    link: 'Known surface threat, from the briefed order of battle',
  } },
];
export const bearingTo = ({ x, y }) => ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
export const rangeTo = ({ x, y }) => Math.hypot(x, y);
// What you know about a track from the sources switched on.
export function known(track, on) {
  const by = Object.keys(track.seen).filter((s) => on.includes(s));
  return {
    by,
    position: by.some((s) => ['eyes', 'radar', 'control', 'link'].includes(s)),
    bearingOnly: by.length > 0 && by.every((s) => s === 'rwr'),
    identity: by.some((s) => ['eyes', 'control', 'link'].includes(s)) && track.kind !== 'unknown',
    correlated: by.length > 1,
  };
}

export const SA_QUESTIONS = [
  { outcome: 1, ask: 'Which of these is at the top of the fighter handbook\'s have-to-do list?', answer: 'Maintain aircraft control', options: ['Maintain aircraft control', 'Answer the fuel check', 'Get the radar locked'], why: 'Control the aircraft, do not hit the ground or anything in the air, do not run out of fuel, do not let anything shot at you hit you; nice-to-do tasks come after. ([1] pp. 8-9)' },
  { outcome: 2, ask: 'You are number two and the formation turns hard at low level. What stays in your cross-check?', answer: 'Near rocks', options: ['Near rocks', 'Check six', 'The radar'], why: 'Drop the lowest priority sectors in order; in hard turns only near rocks may be checked. Rebuild the cross-check one sector at a time. ([1] pp. 22-23)' },
  { outcome: 2, ask: 'Why does the handbook treat visual lookout as a priority for every flight member?', answer: 'Most kills came from attacks the victim never saw', options: ['Most kills came from attacks the victim never saw', 'Radars cannot see aircraft', 'The wingman has nothing else to do'], why: 'It cites 90% of air-to-air kills as coming from undetected attacks. ([1] p. 20)' },
  { outcome: 3, ask: 'What is a mutual support contract for?', answer: 'Knowing where the flight and the threat are, and helping in time', options: ['Knowing where the flight and the threat are, and helping in time', 'Deciding who flies lead', 'Sharing fuel'], why: 'It provides position awareness of the flight and the threat, communication, targeting before the threat attacks, and the ability to press or disengage. ([1] p. 19)' },
  { outcome: 4, ask: 'It is an overcast moonless night over cool ground. Which sensor sees a warm vehicle?', answer: 'The FLIR', options: ['The FLIR', 'Image-intensifying goggles', 'Both equally'], why: 'Intensifiers need some visible light from stars, moon or sky; FLIR images heat and needs none, working best when warm objects stand out against a cool background. ([5] §10.5.3)' },
  { outcome: 4, ask: 'Why does a FLIR not replace the radar in cloud?', answer: 'Moisture absorbs and scatters infrared', options: ['Moisture absorbs and scatters infrared', 'It only works by day', 'It has no range readout'], why: 'Clouds, rain and humidity cut FLIR range below radar\'s, though it sees through light haze better than the eye. ([5] §10.5.3)' },
  { outcome: 5, ask: 'What does a tactical datalink add to your own sensors?', answer: 'Tracks others hold, in a common picture', options: ['Tracks others hold, in a common picture', 'A lock on every track', 'A guarantee every track is identified'], why: 'A link such as Link 16 shares the common tactical picture between units, so you see tracks your own sensors do not hold; their quality is only as good as the track management behind them. ([4] pp. II-12, II-26)' },
  { outcome: 6, ask: 'Your radar contact matches the controller\'s call in bearing, range and altitude. What do you call?', answer: 'Contact, with its position, and ask for a declaration', options: ['Contact, with its position, and ask for a declaration', 'Nothing until it is identified', 'Spiked'], why: 'Correlation: give the contact\'s BRAA and "declare"; the controller repeats the group with a declaration. ([2] p. 10-3)' },
];
