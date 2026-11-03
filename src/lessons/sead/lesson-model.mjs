/* Pure, deterministic models for the SEAD and DEAD module.
 * Definitions, categories and package roles are from JP 3-01 (23 March 2012),
 * by printed page; jamming geometry and burnthrough from the US Naval Academy's
 * Fundamentals of Naval Weapons Systems, chapter 11; the radar horizon from
 * the effective-earth (4/3 radius) approximation. The package in Figure 1 and
 * every number in Figures 2 and 3 are invented for illustration.
 */

export const M_PER_NM = 1852;
export const M_PER_FT = 0.3048;
// Earth radius, and the 4/3 effective radius that allows for normal
// atmospheric refraction of a radar beam (about 8,500 km).
export const EARTH_RADIUS_M = 6.371e6;
export const EFFECTIVE_RADIUS_M = (4 / 3) * EARTH_RADIUS_M;

/** Distance to the radar horizon, in NM, for an antenna or aircraft `ft` above the surface. */
export function horizonNm(ft, radius = EFFECTIVE_RADIUS_M) {
  if (!(ft >= 0)) throw new RangeError('Height must be zero or more');
  const h = ft * M_PER_FT;
  return Math.sqrt(2 * h * radius + h * h) / M_PER_NM;
}

/**
 * Can a radar `radarFt` above flat ground see an aircraft `targetFt` above
 * the ground at `rangeNm`, over a smooth earth with an optional ridge
 * (`ridge.atNm` from the radar, `ridge.ft` high)? Heights are above the
 * surface. The sight line is straight; the earth bulges under it by
 * x(D - x) / 2R at distance x along a path of length D.
 * Returns { visible, blockedBy: null | 'horizon' | 'ridge', marginFt }.
 */
export function lineOfSight({ radarFt, targetFt, rangeNm, ridge = null, radius = EFFECTIVE_RADIUS_M }) {
  if (!(rangeNm > 0)) throw new RangeError('Range must be positive');
  const D = rangeNm * M_PER_NM, hr = radarFt * M_PER_FT, ht = targetFt * M_PER_FT;
  const clearance = (x) => hr + (ht - hr) * (x / D) - (x * (D - x)) / (2 * radius);
  // Lowest point of the sight line above the curved surface, between the ends.
  let low = Infinity;
  for (let i = 1; i < 400; i++) low = Math.min(low, clearance((D * i) / 400));
  if (low < 0) return { visible: false, blockedBy: 'horizon', marginFt: low / M_PER_FT };
  if (ridge && ridge.atNm > 0 && ridge.atNm < rangeNm) {
    const over = clearance(ridge.atNm * M_PER_NM) - ridge.ft * M_PER_FT;
    if (over < 0) return { visible: false, blockedBy: 'ridge', marginFt: over / M_PER_FT };
    return { visible: true, blockedBy: null, marginFt: Math.min(low, over) / M_PER_FT };
  }
  return { visible: true, blockedBy: null, marginFt: low / M_PER_FT };
}

/** The lowest height (ft) an aircraft at `rangeNm` can fly and still be seen, with no ridge. */
export function lowestVisibleFt(radarFt, rangeNm, radius = EFFECTIVE_RADIUS_M) {
  const beyond = rangeNm - horizonNm(radarFt, radius);
  if (beyond <= 0) return 0;
  const d = beyond * M_PER_NM;
  return (d * d) / (2 * radius) / M_PER_FT;
}

/* Burnthrough, after the Naval Academy text (eq. 11-1 and 11-2): the echo
 * reaching the radar falls as 1/R^4 (out and back), the jamming as 1/Rj^2
 * (one way). Burnthrough is where the echo first equals the jamming. Units
 * here are relative: one invented radar, target and jammer, with the same
 * jammer antenna gain toward the radar in every case. */
export const BURN = { ssjNm: 8 };

/** Relative echo power from a target at `rangeNm`, scaled so it is 1 at the self-screening burnthrough range. */
export const echo = (rangeNm) => (BURN.ssjNm / rangeNm) ** 4;
/** Relative jamming power from a jammer at `jammerNm`, on the same scale. */
export const jamming = (jammerNm) => (BURN.ssjNm / jammerNm) ** 2;

/**
 * Burnthrough range for a target the jammer is protecting.
 * 'self' carries the jammer (jammer range = target range);
 * 'standoff' and 'forward' hold the jammer at a fixed `jammerNm` from the radar.
 */
export function burnthroughNm(geometry, jammerNm) {
  if (geometry === 'self') return BURN.ssjNm;
  if (!(jammerNm > 0)) throw new RangeError('A stand-off or stand-forward jammer needs a range');
  // echo(R) = jamming(Rj)  =>  (k/R)^4 = (k/Rj)^2  =>  R = sqrt(k * Rj)
  return Math.sqrt(BURN.ssjNm * jammerNm);
}

export const JAMMERS = [
  { id: 'self', label: 'Self-screening', jammerNm: null, page: '11.2.2.7', note: 'Each aircraft carries its own jammer, so jammer, target and radar are always in line. It costs weight and space the aircraft could use for weapons, sensors or fuel.' },
  { id: 'standoff', label: 'Stand-off', jammerNm: 40, page: '11.2.2.7', note: 'The jammer stays just outside the enemy\'s weapons and is safe from home-on-jam missiles, but burnthrough comes earlier on the attackers, who close to short range while the jammer stays far away.' },
  { id: 'forward', label: 'Stand-forward', jammerNm: 15, page: '11.2.2.7', note: 'The jammer flies between the radars and the attackers: the most efficient use of its power, and the most dangerous place to be, well inside home-on-jam and anti-radiation weapon reach.' },
];

/* Figure 1: an invented localized-suppression package, plan view, NM,
 * x east, y north, the strike target at the origin; the package runs in from the west. The SAM, its WEZ radius
 * and every position are made up; each step's facts carry their source. */
export const SCENE = {
  target: [0, 0],
  sam: { pos: [4, -4], wezNm: 12, label: 'SAM battery (invented)' },
  ewr: { pos: [20, 14], label: 'Early-warning radar' },
  soj: [-24, 18],
  ip: [-30, 0],
};

const at = (x, y) => [x, y];
export const PACKAGE_STEPS = [
  { id: 'plan', phase: 'Plan', text: 'The strike target lies inside a known SAM battery\'s engagement zone. The unit asking for the strike names the known and suspected air defences that threaten it, and localized suppression is planned to protect the strikers on this route, at this time.', cite: 'jp', page: 'IV-13 to IV-14', href: '#what',
    strike: at(-52, 2), sead: at(-50, -3), escort: at(-48, 4), soj: at(-46, 18), decoys: [], arms: [], samRadar: 'off', ewr: 'on' },
  { id: 'ingress', phase: 'Ingress', text: 'The package flies low on a route chosen for terrain and the radar horizon, which hide it from the early-warning radar. A longer route can be worth its fuel and time.', cite: 'usna', page: '11.2.3.4', href: '#avoid',
    strike: at(-40, 2), sead: at(-38, -3), escort: at(-35, 4), soj: SCENE.soj, decoys: [], arms: [], samRadar: 'off', ewr: 'on' },
  { id: 'jam', phase: 'Jamming', text: 'The stand-off jammer, orbiting outside the SAM\'s reach, jams the early-warning and intercept radars so the strikers can approach unseen, and so the SAM gets no early cue from the network.', cite: 'jp', page: 'IV-16', href: '#suppress',
    strike: at(-33, 2), sead: at(-30, -3), escort: at(-28, 4), soj: SCENE.soj, decoys: [], arms: [], samRadar: 'off', ewr: 'jammed' },
  { id: 'decoys', phase: 'Decoys', text: 'The suppression flight launches decoys toward the battery. To its radar they look like attacking aircraft, so it comes on to track them, and shows where it is.', cite: 'wiki', page: 'Gulf War', href: '#suppress',
    strike: at(-29, 2), sead: at(-24, -3), escort: at(-23, 4), soj: SCENE.soj, decoys: [at(-12, -3.5), at(-11, -5)], arms: [], samRadar: 'on', ewr: 'jammed' },
  { id: 'magnum', phase: 'MAGNUM', text: 'The suppression flight fires anti-radiation missiles at the radar now emitting, and calls MAGNUM on the radio.', cite: 'jp', page: 'IV-12', href: '#suppress', call: 'MAGNUM',
    strike: at(-24, 2), sead: at(-20, -3), escort: at(-19, 4), soj: SCENE.soj, decoys: [at(-5, -4), at(-4, -5.5)], arms: [at(-8, -3.6)], samRadar: 'on', ewr: 'jammed' },
  { id: 'suppressed', phase: 'Suppressed', text: 'The radar goes silent, either hit or switched off to save itself. Either way it is not guiding missiles while the strikers pass, which is the point of suppression.', cite: 'jp', page: 'IV-4', href: '#what',
    strike: at(-12, 1), sead: at(-14, -3), escort: at(-6, 3), soj: SCENE.soj, decoys: [], arms: [], samRadar: 'off', ewr: 'jammed' },
  { id: 'strike', phase: 'Strike', text: 'The strikers attack the target while the suppression flight holds nearby with the battery in reach of its missiles, ready to shoot again if a radar comes back up. Escort fighters cover them against enemy fighters.', cite: 'jp', page: 'IV-13, IV-17', href: '#package',
    strike: at(-1, 0), sead: at(-9, -4), escort: at(4, 3), soj: SCENE.soj, decoys: [], arms: [], samRadar: 'off', ewr: 'jammed' },
  { id: 'egress', phase: 'Egress', text: 'The strikers egress. Aircrew who saw a defence they could not attack pass it to the agency controlling their mission, for someone else to target.', cite: 'jp', page: 'IV-15', href: '#package',
    strike: at(-16, 8), sead: at(-18, 0), escort: at(-12, 6), soj: SCENE.soj, decoys: [], arms: [], samRadar: 'off', ewr: 'jammed' },
  { id: 'dead', phase: 'Destroy', text: 'Later, a separate flight is tasked to destroy the battery itself with a stand-off weapon released from outside its reach. Destroying it is the destructive means of SEAD, often called DEAD.', cite: 'jp', page: 'IV-12 to IV-13', href: '#what',
    strike: null, sead: null, escort: null, soj: null, dead: at(-22, -10), standoff: [at(-6, -7)], decoys: [], arms: [], samRadar: 'destroyed', ewr: 'on' },
];

/** Is a plan-view point inside the invented SAM's engagement zone? */
export function insideWez([x, y], sam = SCENE.sam) {
  return Math.hypot(x - sam.pos[0], y - sam.pos[1]) < sam.wezNm;
}

// Quiz questions, each with the outcome it tests and its source.
export const METHOD_QUESTIONS = [
  { outcome: 1, ask: 'Jamming a SAM\'s radar so it cannot track the strikers for twenty minutes. Destructive or disruptive SEAD?', answer: 'Disruptive', options: ['Destructive', 'Disruptive'], why: 'Disruptive means temporarily deny, degrade, deceive, delay or neutralize; jamming is an active disruptive means. (JP 3-01, p. IV-13)' },
  { outcome: 1, ask: 'An F-16 on a strike mission fires at a SAM that has just locked it up. Which category of SEAD?', answer: 'Opportune suppression', options: ['AOR/JOA-wide suppression', 'Localized suppression', 'Opportune suppression'], why: 'Opportune suppression is unplanned and includes aircrew self-defense. (JP 3-01, p. IV-14)' },
  { outcome: 1, ask: 'A campaign-long effort against the enemy\'s air defence command centres, to break up the whole network. Which category?', answer: 'AOR/JOA-wide suppression', options: ['AOR/JOA-wide suppression', 'Localized suppression', 'Opportune suppression'], why: 'Theater-wide suppression targets high-payoff air defence assets; destroying key command nodes usually disrupts an IADS most. (JP 3-01, p. IV-13)' },
  { outcome: 1, ask: 'Suppression flights protect one strike package on one route, at one time. Which category?', answer: 'Localized suppression', options: ['AOR/JOA-wide suppression', 'Localized suppression', 'Opportune suppression'], why: 'Localized suppression is confined to the areas of specific targets or transit routes for a specific time. (JP 3-01, p. IV-13)' },
  { outcome: 2, ask: 'Which of these is not one of the IADS components that SEAD targets?', answer: 'Friendly airborne early warning aircraft', options: ['Command and control nodes', 'Early-warning and fire-control radars', 'Air defence operators and maintainers', 'Friendly airborne early warning aircraft'], why: 'SEAD targets C2 nodes, SAM sites, AAA, early-warning, fire-control and GCI radars, SAM carriers and storage, and air defence personnel. (JP 3-01, p. IV-12)' },
  { outcome: 3, ask: 'You descend from 1,000 ft to 200 ft, 30 NM from a radar on a 50 ft mast over flat ground. What happens to the radar\'s view of you?', answer: 'You drop below its horizon', options: ['You drop below its horizon', 'Nothing: radar sees through the curve', 'You become easier to see'], why: 'At 30 NM the radar\'s horizon is about 9 NM and yours at 200 ft about 17 NM: their sum is less than 30, so the earth hides you. At 1,000 ft your horizon is about 39 NM, and it sees you. (Figure 2)' },
  { outcome: 4, ask: 'A radar operator switches off as soon as an anti-radiation missile is launched. Which weapon still has the best chance against the site?', answer: 'A missile that remembers the emitter\'s position', options: ['An older anti-radiation missile with no memory', 'A missile that remembers the emitter\'s position', 'More chaff'], why: 'Early ARMs could be defeated by switching off; later ones remember where the source was and keep flying to it. (Wikipedia, anti-radiation missiles)' },
  { outcome: 4, ask: 'Which method homes passively on radar transmissions?', answer: 'Anti-radiation missile', options: ['Anti-radiation missile', 'Laser-guided bomb on a known site', 'Stand-off GPS weapon on a known site'], why: 'An ARM homes passively on a radiation source, so it needs the radar to transmit at some point; later ARMs remember the position if it then switches off. (JP 3-01, p. GL-8; Wikipedia)' },
  { outcome: 4, ask: 'Chaff is least effective against which kind of radar?', answer: 'Pulse-Doppler or MTI radar', options: ['Pulse-Doppler or MTI radar', 'A simple pulse radar'], why: 'Chaff slows almost at once, so radars that reject clutter by its speed keep tracking a moving target inside the cloud. (USNA, 11.2.2.12)' },
  { outcome: 5, ask: 'Which jamming geometry leaves the jammer safest from home-on-jam missiles?', answer: 'Stand-off', options: ['Self-screening', 'Stand-off', 'Stand-forward'], why: 'The stand-off jammer stays outside the enemy\'s weapons. (USNA, 11.2.2.7)' },
  { outcome: 5, ask: 'Why does a radar always burn through a self-screening jammer at some range?', answer: 'The echo grows faster than the jamming as range closes', options: ['The echo grows faster than the jamming as range closes', 'The jammer overheats', 'The radar changes frequency'], why: 'The echo travels out and back (1/R⁴), the jamming only one way (1/R²), so the echo wins at short range. (USNA, 11.2.2.4)' },
  { outcome: 6, ask: 'During intense SEAD, why must every friendly emitter be identified to the SEAD aircrews?', answer: 'An unknown emitter may be engaged as hostile', options: ['An unknown emitter may be engaged as hostile', 'Friendly radars jam the HARM', 'It is only needed for airspace control'], why: 'Friendly emitters not identified to SEAD forces may be read as unknown or hostile and engaged; friendly forces have been attacked this way. (JP 3-01, pp. III-24, A-2)' },
  { outcome: 6, ask: 'Escorting fighters see a SAM site ahead that cannot be avoided. Per joint doctrine, what does the package need?', answer: 'SEAD support', options: ['SEAD support', 'Nothing: the escorts attack it', 'A fighter sweep'], why: 'Escorts and the aircraft they protect avoid surface air defences; if the SAM or AAA threat cannot be avoided, the mission requires SEAD support. (JP 3-01, p. IV-17)' },
];
