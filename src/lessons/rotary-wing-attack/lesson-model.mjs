/* Pure, deterministic models for the Rotary-Wing Attack module.
 * Facts are from JP 3-09.3, Close Air Support (25 November 2014), by printed
 * page: rotary-wing considerations pp. I-5 to I-8, rotary-wing CAS tactics
 * pp. III-89 to III-94, the 9-line for helicopters p. V-26 and Appendix E,
 * Example 7 (pp. E-17 to E-19). The attack in Figure 1, the terrain in
 * Figure 2 and every position and number in the figures are invented for
 * illustration.
 */

/** Rotary-wing operating altitudes (p. III-90): high above 3,000 ft AGL,
 * medium 500 to 3,000 ft, low below 500 ft. */
export function rwAltitudeBand(ftAgl) {
  if (!(ftAgl >= 0)) throw new RangeError('Height must be zero or more');
  if (ftAgl < 500) return 'low';
  if (ftAgl <= 3000) return 'medium';
  return 'high';
}

/* The three terrain flight profiles (p. III-91). NOE has no fixed height:
 * as close to the surface as vegetation and obstacles permit. */
export const PROFILES = [
  { id: 'low-level', name: 'Low level', height: 'Constant altitude, normally 100–200 ft AGL', speed: 'Constant', use: 'Reduces or avoids enemy detection or observation', minFt: 100, maxFt: 200 },
  { id: 'contour', name: 'Contour', height: 'Follows the contour of the earth or vegetation, normally 50–100 ft AGL', speed: 'As the terrain allows', use: 'Conceals the aircraft from observation or detection, until reaching a higher threat area', minFt: 50, maxFt: 100 },
  { id: 'noe', name: 'Nap of the earth (NOE)', height: 'As close to the surface as vegetation and obstacles permit, following its contours', speed: 'Varies with the terrain, weather, ambient light and enemy', use: 'Terrain and vegetation give cover and concealment', minFt: null, maxFt: null },
];

/* Techniques of movement, JP 3-09.3 Figure III-25 (p. III-92). */
export const MOVEMENT = [
  { id: 'traveling', name: 'Traveling', contact: 'Remote', profile: 'Low level or contour', how: 'The flight moves together at a constant speed, as steadily as the terrain allows: rapid movement in relatively secure areas.' },
  { id: 'traveling-overwatch', name: 'Traveling overwatch', contact: 'Possible', profile: 'Contour or NOE', how: 'The main element keeps moving; the overwatch element moves to cover it, with weapons on the terrain the enemy might fire from. Caution is justified but speed is desirable.' },
  { id: 'bounding-overwatch', name: 'Bounding overwatch', contact: 'Imminent', profile: 'NOE', how: 'One element bounds while the other overwatches from a covered, concealed position with observation and fields of fire. Movement is deliberate; speed is not essential.' },
];
export const movementFor = (contact) => MOVEMENT.find((m) => m.contact.toLowerCase() === String(contact).toLowerCase());

/* Hovering, running and diving fire (pp. III-93 to III-94). */
export const FIRE_MODES = [
  { id: 'hover', name: 'Hovering fire', flight: 'Stationary, or little forward motion', when: 'After unmasking from a defilade position, or standing off in a safe area', gains: 'The most effective profile for precision guided munitions; indirect hovering fire can stay hidden by terrain', costs: 'Held only for short periods, then remask or displace; can reduce the accuracy of rockets and guns, because a hovering aircraft can be less stable' },
  { id: 'running', name: 'Running fire', flight: 'Level, forward flight', when: 'Direct fire with an unobstructed view of the target, or indirect fire without one', gains: 'Forward flight may add stability and improve unguided accuracy; a moving aircraft with a smaller signature, less dust and debris, than a hover may be harder for air defenses', costs: 'It gives up the hover\'s advantage for precision guided munitions; the publication lists no other drawback' },
  { id: 'diving', name: 'Diving fire', flight: 'From altitude, in descending forward flight', when: 'Often from an overhead position, for example over an urban area', gains: 'May give the most accurate unguided results; stays above or outside the threat envelope; high situational awareness and a constant weapons solution from the overhead', costs: 'The overhead leaves the aircraft continuously exposed; its altitude reduces the small-arms and RPG threat but increases tracking time and reduces background clutter for an infrared SAM shot' },
];

// ---- Figure 1: the invented attack, after JP 3-09.3 Example 7 (pp. E-17 to E-19) ----

/** Point at `bearing` degrees (true, north up) and `dist` from [x, y], in plan units with y down. */
export function offset([x, y], bearing, dist) {
  const b = (bearing * Math.PI) / 180;
  return [x + dist * Math.sin(b), y - dist * Math.cos(b)];
}
/** Bearing from a to b, degrees 0–359, north up with y down. */
export function bearingTo([ax, ay], [bx, by]) {
  return ((Math.atan2(bx - ax, -(by - ay)) * 180) / Math.PI + 360) % 360;
}

// Plan units: 1 unit = 10 m. Invented positions.
export const EXAMPLE = {
  ha: 'Rose', bp: 'Oak', lead: 'Saber 21', wing: 'Saber 22', controller: 'Hammer 11',
  heading: 60, distanceM: 3400, // line 2 and line 3, BP centre to target
  places: { ha: [120, 470], rp: [250, 400], bp: [330, 300] },
  route: [[120, 470], [250, 400], [270, 360], [300, 345], [315, 320], [330, 300]],
  fps: [[-28, -8], [0, 18], [26, -12]], // firing points, offsets from the BP centre
  hellfires: 4, rockets: 'rockets and guns',
};
EXAMPLE.target = offset(EXAMPLE.places.bp, EXAMPLE.heading, EXAMPLE.distanceM / 10);
/** Distance from the BP centre to the target, rounded to the nearest 100 m as line 3 gives it (p. V-26). */
export const line3 = (m) => Math.round(m / 100) * 100;

export const ATTACK_STEPS = [
  { who: 'Saber 21', said: '"Hammer 11, Saber 21, established holding area Rose, two attack helicopters, four Hellfire, rockets and guns, one hour playtime." The holding area is where helicopters wait for a mission, an informal airspace coordination area while in use. [1, pp. III-91, E-17]', href: '#positions', at: 'ha', show: [] },
  { who: 'Hammer 11', said: '"Saber 21, Type 3 control, bomb on target. Hellfire from battle position Oak on the vehicles; expect approval forward of Oak for rockets and guns." The game plan comes first, as in every CAS brief. [1, p. E-17]', href: '#who', at: 'ha', show: [] },
  { who: 'Hammer 11', said: '"Oak, 060, 3400…" For helicopters, line 1 is the battle position, line 2 the heading from its center to the target and line 3 the distance in meters, to the nearest 100. Restrictions and the time follow, and are read back. [1, pp. V-26, E-17–E-18]', href: '#positions', at: 'ha', show: ['line'] },
  { who: 'Saber 21', said: 'From the release point the section moves by NOE flight in bounding overwatch, because contact is now imminent: one aircraft bounds while the other covers it. The net is quiet; communication may not be desirable during ingress. [1, pp. III-91–III-93]', href: '#movement', at: 'rp', show: ['line', 'route'] },
  { who: 'Saber 21', said: 'At Oak, each aircraft picks its own firing point and stays masked behind the terrain until the time or the order to attack. [1, p. III-93]', href: '#positions', at: 'bp', show: ['line', 'route', 'fps'] },
  { who: 'Hammer 11', said: '"Saber 21 flight, CLEARED TO ENGAGE." Each aircraft unmasks and fires Hellfire in hovering fire, the most effective profile for guided missiles, while the wingman can suppress with rockets and guns. [1, pp. III-93–III-94, E-18]', href: '#firing', at: 'bp', show: ['line', 'fps', 'hover'] },
  { who: 'Saber 21', said: 'After each shot the aircraft remasks or moves to another firing point, so the enemy cannot target the spot it fired from. [1, p. III-94]', href: '#firing', at: 'bp', show: ['line', 'fps', 'displace'] },
  { who: 'Hammer 11', said: '"Approved forward of Oak for rockets and guns." The section leaves the battle position and attacks in running fire, where forward flight steadies the aircraft for unguided weapons. [1, pp. III-94, E-19]', href: '#firing', at: 'bp', show: ['line', 'running'] },
  { who: 'Saber 21', said: '"ENGAGEMENT COMPLETE." The section egresses as briefed, by the same tactics as the ingress, back to Rose; it can rearm at a FARP and passes BDA and a mission report. [1, pp. III-94, E-19]', href: '#egress', at: 'ha', show: ['egress'] },
];

// ---- Figure 2: terrain flight profiles over invented terrain ----

/* Invented rolling ground, x in metres 0 to 6,000, height in feet. Relief is
 * kept under 100 ft so that a constant-altitude low-level line stays within
 * the publication's normal 100 to 200 ft AGL. An enemy observer stands on
 * the last rise. */
export const TERRAIN = { lengthM: 6000, stepM: 50, observer: { xM: 5900, eyeFt: 6 } };
export function groundFt(xM) {
  const k = xM / 1000;
  return 40 + 28 * Math.sin(k * 1.9) + 18 * Math.sin(k * 4.3 + 1) + 6 * Math.sin(k * 9.7) + 24 * Math.max(0, k - 4.6);
}
/** Trees: invented patches, 40 ft tall, where NOE flight must stay above or around them. */
export function treeFt(xM) {
  const k = xM / 1000;
  return (k > 0.6 && k < 1.3) || (k > 2.4 && k < 3.1) || (k > 4.0 && k < 4.5) ? 40 : 0;
}
const xs = () => { const out = []; for (let x = 0; x <= TERRAIN.lengthM - 600; x += TERRAIN.stepM) out.push(x); return out; };
export function reliefFt() {
  const hs = xs().map(groundFt);
  return Math.max(...hs) - Math.min(...hs);
}

/** The flight path for a profile: [{ xM, ft }] in feet above the datum. */
export function profilePath(id) {
  const pts = xs();
  if (id === 'low-level') {
    const top = Math.max(...pts.map(groundFt));
    return pts.map((xM) => ({ xM, ft: top + 100 }));
  }
  if (id === 'contour') return pts.map((xM) => ({ xM, ft: groundFt(xM) + 75 }));
  if (id === 'noe') {
    // Our illustration: about 15 ft above whatever is highest, ground or trees.
    return pts.map((xM) => ({ xM, ft: groundFt(xM) + treeFt(xM) + 15 }));
  }
  throw new RangeError(`Unknown profile ${id}`);
}
export const aglFt = (p) => p.ft - groundFt(p.xM);

/** Can the observer see a point? Terrain only (trees ignored), straight line of sight. */
export function visible({ xM, ft }) {
  const o = TERRAIN.observer, oFt = groundFt(o.xM) + o.eyeFt;
  const step = 25;
  for (let x = xM + step; x < o.xM; x += step) {
    const losFt = ft + ((oFt - ft) * (x - xM)) / (o.xM - xM);
    if (groundFt(x) > losFt) return false;
  }
  return true;
}
/** Fraction of a profile's path the observer can see. */
export function exposure(id) {
  const path = profilePath(id);
  return path.filter(visible).length / path.length;
}

// ---- Questions, tagged with the outcomes on the page ----

const MODE_OPTIONS = ['Hovering fire', 'Running fire', 'Diving fire'];
export const QUESTIONS = [
  { outcome: 1, ask: 'A JTAC is working an Army attack helicopter team for the first time. What should the JTAC expect?', answer: 'Close combat attack procedures, not CAS, without prior coordination', options: ['Close combat attack procedures, not CAS, without prior coordination', 'Full CAS procedures in every case', 'No contact until weapons impact'], why: 'Army attack aviation uses CCA as its standard method; JTACs should not expect CAS procedures without further coordination and training. (JP 3-09.3, p. I-5)' },
  { outcome: 1, ask: 'Why do helicopter sections often mix aircraft types, such as an attack and a utility helicopter?', answer: 'For the most flexible mix of sensors, radios, firepower and mutual support', options: ['For the most flexible mix of sensors, radios, firepower and mutual support', 'Because attack helicopters cannot navigate alone', 'To share fuel in flight'], why: 'Mixed flights give the most flexible mix of sensors, communications, maneuverability, firepower and mutual support. (JP 3-09.3, pp. I-5, III-90)' },
  { outcome: 2, ask: 'Enemy contact is imminent. Which movement technique and profile?', answer: 'Bounding overwatch, NOE', options: ['Traveling, low level', 'Traveling overwatch, contour', 'Bounding overwatch, NOE'], why: 'Imminent contact calls for bounding overwatch at nap of the earth. (JP 3-09.3, Figure III-25)' },
  { outcome: 2, ask: 'Enemy contact is remote and you need to move quickly. Which technique?', answer: 'Traveling', options: ['Traveling', 'Traveling overwatch', 'Bounding overwatch'], why: 'Traveling, at low level or contour, allows rapid movement in relatively secure areas. (JP 3-09.3, p. III-92)' },
  { outcome: 2, ask: 'Small arms and RPGs are the main threat on the route. Where do attack helicopters normally go?', answer: 'Up, usually to medium altitude, out of their effective range', options: ['Up, usually to medium altitude, out of their effective range', 'Down to NOE', 'Into the overhead at high altitude'], why: 'Where small arms and RPGs predominate, aircrews normally elevate, usually to medium altitude (500 to 3,000 ft AGL). (JP 3-09.3, p. III-91)' },
  { outcome: 2, ask: 'You are at 1,800 ft AGL. Which rotary-wing altitude band is that?', answer: 'Medium', options: ['Low', 'Medium', 'High'], why: 'Medium is 500 to 3,000 ft AGL; low is below 500 ft and high above 3,000 ft. (JP 3-09.3, p. III-90)' },
  { outcome: 3, ask: 'What is a battle position, for an attack helicopter?', answer: 'A maneuvering area containing firing points, from which attacks are commenced', options: ['A maneuvering area containing firing points, from which attacks are commenced', 'The point where the flight leaves the ingress route', 'The target\'s location'], why: 'BPs are maneuvering areas with firing points; for helicopters the BP is where attacks on the target are commenced. (JP 3-09.3, pp. III-92, V-26)' },
  { outcome: 3, ask: 'In a 9-line for helicopters, how is line 3 given?', answer: 'Meters from the BP center to the target, to the nearest 100', options: ['Meters from the BP center to the target, to the nearest 100', 'Nautical miles to a tenth from the IP', 'Feet above sea level'], why: 'For attack helicopters line 3 is in meters from the center of the BP, accurate to the nearest 100 meters. (JP 3-09.3, p. V-26)' },
  { outcome: 4, ask: 'You are firing Hellfire from behind a ridge. Which profile is most effective?', answer: 'Hovering fire', options: MODE_OPTIONS, why: 'Hovering fire is the most effective profile for precision guided munitions. (JP 3-09.3, p. III-94)' },
  { outcome: 4, ask: 'You want the most accurate rocket attack while staying above the small-arms threat. Which profile?', answer: 'Diving fire', options: MODE_OPTIONS, why: 'Diving fire may produce the most accurate unguided results and lets the aircrew remain above or outside the threat envelope. (JP 3-09.3, p. III-94)' },
  { outcome: 4, ask: 'Dust is billowing at the firing point and you are about to fire rockets. Which profile reduces the signature?', answer: 'Running fire', options: MODE_OPTIONS, why: 'Running fire produces a smaller signature than a hover, with less dust and debris, and forward flight may improve unguided accuracy. (JP 3-09.3, p. III-94)' },
  { outcome: 4, ask: 'What is the main hazard of the overhead position?', answer: 'Continuous exposure, and an easier infrared SAM shot', options: ['Continuous exposure, and an easier infrared SAM shot', 'Poor view of urban targets', 'An unstable weapons solution'], why: 'The overhead leaves attack helicopters continuously exposed; its altitude cuts the small-arms threat but increases tracking time and reduces clutter for an IR SAM. (JP 3-09.3, p. III-94)' },
  { outcome: 5, ask: 'In running fire you cannot see the target. What is the fire called?', answer: 'Indirect fire', options: ['Indirect fire', 'Direct fire', 'Diving fire'], why: 'Direct fire needs an unobstructed view of the target; without one it is indirect fire. (JP 3-09.3, p. III-94)' },
  { outcome: 5, ask: 'How can a helicopter launch Hellfire without exposing itself to the target?', answer: 'Lock-on after launch, with a remote designator', options: ['Lock-on after launch, with a remote designator', 'Lock-on before launch, self-designating', 'Only from the overhead'], why: 'LOAL lets the aircrew launch without line of sight, and remote designation lets it fire from a masked position with longer standoff. (JP 3-09.3, pp. III-59–III-60)' },
  { outcome: 6, ask: 'You have just fired from a firing point. What next?', answer: 'Remask or displace', options: ['Remask or displace', 'Hold the hover to watch the impact', 'Climb to the overhead'], why: 'Hovering fire positions are held only briefly; after firing, aircrews remask or displace. (JP 3-09.3, pp. III-93–III-94)' },
  { outcome: 6, ask: 'On egress, how do airspeed, altitude and formation compare with the ingress?', answer: 'The same considerations as the inbound en route phase', options: ['The same considerations as the inbound en route phase', 'Always climb to high altitude', 'Always fly direct, at maximum speed'], why: 'Egress tactics in airspeed, altitude, formation and TTP are the same as for the inbound en route phase. (JP 3-09.3, p. III-94)' },
];
