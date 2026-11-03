// Planning a Sortie: the invented sortie, the wind triangle, the nav log, the
// fuel ladder, JOKER and BINGO, the equal time point and the 60-to-1 rules of
// thumb. Pure functions, no DOM; lesson-ui draws from these.
//
// Sources (as cited on the page):
//   PHAK = FAA Pilot's Handbook of Aeronautical Knowledge, FAA-H-8083-25B,
//          ch. 16: TC ± WCA = TH ± V = MH ± D = CH and the worked log (pp. 16-19 to 16-20).
//   217  = AFMAN 11-217 Vol 3 (2009): nm/min, TAS from IAS (3.5.1), descent
//          gradient and descent point (3.7.1), ETP formula (Figure 13.3).
// Everything else here (the route, the jet, its fuel flows, the reserve and
// the joker margin) is invented for the example and labelled so on the page.

const RAD = Math.PI / 180;
export const norm360 = (deg) => ((deg % 360) + 360) % 360;
const round = (x, step = 1) => Math.round(x / step) * step;

// Wind triangle. Wind is given the way forecasts give it: the TRUE direction
// it blows FROM, and its speed. Returns the wind correction angle (positive
// = correct right), true heading and ground speed. Throws if the crosswind
// exceeds TAS (no heading holds the course).
export function windTriangle({ tc, tas, windFrom, windKt }) {
  if (!(tas > 0)) throw new RangeError('TAS must be positive');
  const rel = (windFrom - tc) * RAD;
  const cross = windKt * Math.sin(rel); // + = wind from the right of the course
  if (Math.abs(cross) >= tas) throw new RangeError('Crosswind exceeds true airspeed');
  const wca = Math.asin(cross / tas) / RAD;
  const gs = tas * Math.cos(wca * RAD) - windKt * Math.cos(rel);
  return { wca, th: norm360(tc + wca), gs, headwind: windKt * Math.cos(rel), crosswind: cross };
}

// Variation: east is least (subtract), west is best (add). varE positive = east.
export const magnetic = (trueDeg, varE) => norm360(trueDeg - varE);

// The invented sortie. Positions are NM east/north of HOME; courses are true.
export const SORTIE = {
  varE: 4, // invented magnetic variation, 4° E
  tas: 360, // KTAS in cruise: 6 NM a minute (AFMAN 11-217V3 3.5.1)
  points: {
    HOME: { short: 'Home', name: 'Home field', pos: [0, 0] },
    ALPHA: { short: 'Alpha', name: 'Turn point Alpha', pos: [48, 64] },
    AREA: { short: 'Area', name: 'Working area entry', pos: [126, 70] },
    ALT: { short: 'Alternate', name: 'Alternate field', pos: [-42, -56] },
  },
  route: ['HOME', 'ALPHA', 'AREA', 'HOME'],
  alternate: 'ALT',
  fuel: {
    start: 6800, // lb at engine start
    taxiTakeoff: 400, // lb start, taxi and takeoff
    climbExtra: 150, // lb more than cruise on the first leg for the climb
    cruiseFlow: 45, // lb/min at 360 KTAS
    areaFlow: 75, // lb/min working in the area
    approach: 250, // lb for an approach and landing, each field
    reserve: 800, // the example's reserve on landing, an invented unit rule
    jokerMargin: 500, // lead's chosen margin above BINGO
  },
};

export function legGeometry(from, to) {
  const [x1, y1] = SORTIE.points[from].pos, [x2, y2] = SORTIE.points[to].pos;
  const dx = x2 - x1, dy = y2 - y1;
  return { dist: Math.hypot(dx, dy), tc: norm360(Math.atan2(dx, dy) / RAD) };
}

// One nav log line per leg, rounded the way a log is written.
export function navLeg(from, to, wind, tas = SORTIE.tas) {
  const { dist, tc } = legGeometry(from, to);
  const w = windTriangle({ tc, tas, windFrom: wind.from, windKt: wind.kt });
  const minutes = (dist / w.gs) * 60;
  return { from, to, dist, tc, ...w, mh: magnetic(w.th, SORTIE.varE), minutes };
}

// The whole plan: nav log, fuel ladder, BINGO and JOKER, and how long the
// fuel lets the flight stay in the area.
export function planSortie(wind, tas = SORTIE.tas) {
  const f = SORTIE.fuel;
  const [l1, l2, l3] = [navLeg('HOME', 'ALPHA', wind, tas), navLeg('ALPHA', 'AREA', wind, tas), navLeg('AREA', 'HOME', wind, tas)];
  const altLeg = navLeg('HOME', 'ALT', wind, tas);
  const burn = (leg) => leg.minutes * f.cruiseFlow;
  // BINGO at the area: fly home, shoot an approach, divert to the alternate,
  // shoot another and land there with the reserve.
  const bingo = burn(l3) + f.approach + burn(altLeg) + f.approach + f.reserve;
  const joker = bingo + f.jokerMargin;
  const atArea = f.start - f.taxiTakeoff - burn(l1) - f.climbExtra - burn(l2);
  // The flight works in the area until JOKER; BINGO is the latest it can leave.
  const toJoker = Math.max(0, (atArea - joker) / f.areaFlow);
  const toBingo = Math.max(0, (atArea - bingo) / f.areaFlow);
  const areaMin = toJoker;
  const leaveArea = atArea - areaMin * f.areaFlow;
  const landHome = leaveArea - burn(l3) - f.approach;
  const t1 = l1.minutes, t2 = t1 + l2.minutes, t3 = t2 + areaMin, t4 = t3 + l3.minutes;
  const ladder = [
    { at: 'Takeoff', min: 0, fuel: f.start - f.taxiTakeoff },
    { at: 'Alpha', min: t1, fuel: f.start - f.taxiTakeoff - burn(l1) - f.climbExtra },
    { at: 'Area entry', min: t2, fuel: atArea },
    { at: 'Leave area', min: t3, fuel: leaveArea },
    { at: 'Home, on deck', min: t4, fuel: landHome },
  ];
  return { legs: [l1, l2, l3], altLeg, bingo, joker, atArea, toJoker, toBingo, areaMin, landHome, ladder, enoughForArea: atArea >= joker };
}

// Equal time point (AFMAN 11-217V3 Figure 13.3), measured from the field
// behind the aircraft: ETP = TD × GSreturn / (GSreturn + GScontinue).
export function equalTimePoint({ distance, gsReturn, gsContinue }) {
  if (!(gsReturn > 0 && gsContinue > 0)) throw new RangeError('Ground speeds must be positive');
  return (distance * gsReturn) / (gsReturn + gsContinue);
}

// AFMAN 11-217V3 3.5.1: nm/min = TAS / 60; TMN × 10 ≈ nm/min; TAS ≈ IAS +
// 2% per 1,000 ft, or IAS + FL/2.
export const nmPerMin = (tas) => tas / 60;
export const tasFromIas2pct = (ias, altFt) => ias + ias * 0.02 * (altFt / 1000);
export const tasFromIasFl = (ias, altFt) => ias + altFt / 100 / 2;
// 3.7.1: descent distance = altitude to lose ÷ gradient (300 ft/NM ≈ 3°).
export const descentDistance = (loseFt, gradient = 300) => loseFt / gradient;
// 3.5.2: VVI = nm/min × gradient (ft/NM).
export const vvi = (gs, gradient) => nmPerMin(gs) * gradient;

export const fmtHdg = (deg) => String(round(norm360(deg)) % 360 || 360).padStart(3, '0');
export const fmtMin = (min) => { const m = Math.round(min); return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`; };

// Quiz: one question per outcome, answers from the sources on the page.
export const PLAN_QUESTIONS = [
  { outcome: 1, ask: 'In a joint operation, where do aircrew find the airspace control instructions and the special instructions for their mission?', options: ['The ATO, with its SPINS and the ACO', 'The METAR', 'The aircraft flight manual', 'The NOTAM search'], answer: 'The ATO, with its SPINS and the ACO', why: 'JP 3-30: forces follow the ROE, airspace control order and the special instructions located in the air tasking order.' },
  { outcome: 2, ask: 'True course 031°, wind from 360° at 10 kt, TAS 115 kt. Which way is the wind correction?', options: ['About 3° left', 'About 3° right', 'None: it is a headwind', 'About 10° left'], answer: 'About 3° left', why: 'The wind is from the left of the course, so you point left of it: the PHAK worked log gets 3° left and a 106 kt ground speed.' },
  { outcome: 2, ask: 'True heading 028°, variation 7° E. What is the magnetic heading?', options: ['021°', '035°', '028°', '014°'], answer: '021°', why: 'East variation is subtracted: 028 − 7 = 021, as in the PHAK worked log.' },
  { outcome: 3, ask: 'You hold 250 KIAS at 10,000 ft. About what is your TAS?', options: ['300 kt', '250 kt', '270 kt', '350 kt'], answer: '300 kt', why: 'Add 2% per 1,000 ft (250 + 50), or add half the flight level (250 + 100 ÷ 2): about 300 KTAS.' },
  { outcome: 3, ask: 'At FL 300 you want to be at 6,000 ft over the field on a 300 ft/NM descent. Where do you start down?', options: ['80 NM out', '30 NM out', '100 NM out', '60 NM out'], answer: '80 NM out', why: '24,000 ft to lose ÷ 300 ft per NM = 80 NM, the AFMAN 11-217 example.' },
  { outcome: 4, ask: 'The lead calls JOKER. What does that mean?', options: ['Fuel is down to the state set above BINGO where separation or ending the event should begin', 'Fuel is down to the state needed to recover', 'The flight is out of weapons', 'Minimum fuel: an emergency is near'], answer: 'Fuel is down to the state set above BINGO where separation or ending the event should begin', why: 'JOKER is the fuel state above BINGO where separation, bugout or event termination should begin; BINGO is the state needed for recovery.' },
  { outcome: 4, ask: 'With a strong headwind on the way home, what happens to the equal time point?', options: ['It moves toward home', 'It moves away from home', 'It stays at the midpoint', 'It depends only on distance'], answer: 'It moves toward home', why: 'Turning back into the wind is slower, so you reach the point where returning and continuing take equal time sooner: ETP = distance × GS return ÷ (GS return + GS continue).' },
  { outcome: 5, ask: 'A US military IFR flight will leave US controlled airspace. Which flight plan form?', options: ['DD 1801 (or FAA 7233-4)', 'DD 175', 'Either; it makes no difference', 'None is needed'], answer: 'DD 1801 (or FAA 7233-4)', why: 'The AIM makes the international form mandatory for military flights departing US controlled airspace; DD 175 matches the domestic FAA 7233-1.' },
  { outcome: 5, ask: 'Who issues military NOTAMs?', options: ['The US Air Force, Army, Marine Corps or Navy, for their navaids and airports in the NAS', 'Only the FAA', 'The weather service', 'The tower, on the frequency'], answer: 'The US Air Force, Army, Marine Corps or Navy, for their navaids and airports in the NAS', why: 'AIM 5-1-3: military NOTAMs are originated by the services for military or joint-use navaids and airports, in the international NOTAM format.' },
];
