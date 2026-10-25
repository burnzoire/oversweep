// Pure models for the Radio Communications module. No DOM access.
//
// Spoken forms follow the FAA Aeronautical Information Manual (AIM) chapter 4,
// section 2; emergency and failure logic follows AIM chapters 4 and 6. Each
// function cites the paragraph it implements.

// AIM TBL 4-2-7: telephony word and pronunciation for each character.
export const PHONETIC = [
  ['A', 'Alfa', 'AL-FAH', '.-'], ['B', 'Bravo', 'BRAH-VOH', '-...'], ['C', 'Charlie', 'CHAR-LEE or SHAR-LEE', '-.-.'],
  ['D', 'Delta', 'DELL-TAH', '-..'], ['E', 'Echo', 'ECK-OH', '.'], ['F', 'Foxtrot', 'FOKS-TROT', '..-.'],
  ['G', 'Golf', 'GOLF', '--.'], ['H', 'Hotel', 'HOH-TEL', '....'], ['I', 'India', 'IN-DEE-AH', '..'],
  ['J', 'Juliett', 'JEW-LEE-ETT', '.---'], ['K', 'Kilo', 'KEY-LOH', '-.-'], ['L', 'Lima', 'LEE-MAH', '.-..'],
  ['M', 'Mike', 'MIKE', '--'], ['N', 'November', 'NO-VEM-BER', '-.'], ['O', 'Oscar', 'OSS-CAH', '---'],
  ['P', 'Papa', 'PAH-PAH', '.--.'], ['Q', 'Quebec', 'KEH-BECK', '--.-'], ['R', 'Romeo', 'ROW-ME-OH', '.-.'],
  ['S', 'Sierra', 'SEE-AIR-RAH', '...'], ['T', 'Tango', 'TANG-GO', '-'], ['U', 'Uniform', 'YOU-NEE-FORM or OO-NEE-FORM', '..-'],
  ['V', 'Victor', 'VIK-TAH', '...-'], ['W', 'Whiskey', 'WISS-KEY', '.--'], ['X', 'Xray', 'ECKS-RAY', '-..-'],
  ['Y', 'Yankee', 'YANG-KEY', '-.--'], ['Z', 'Zulu', 'ZOO-LOO', '--..'],
  ['1', 'One', 'WUN', '.----'], ['2', 'Two', 'TOO', '..---'], ['3', 'Three', 'TREE', '...--'],
  ['4', 'Four', 'FOW-ER', '....-'], ['5', 'Five', 'FIFE', '.....'], ['6', 'Six', 'SIX', '-....'],
  ['7', 'Seven', 'SEV-EN', '--...'], ['8', 'Eight', 'AIT', '---..'], ['9', 'Nine', 'NIN-ER', '----.'],
  ['0', 'Zero', 'ZEE-RO', '-----'],
].map(([char, word, say, morse]) => ({ char, word, say, morse }));

const BY_CHAR = new Map(PHONETIC.map((p) => [p.char, p]));
// The AIM's spoken examples say "niner" for 9 (4-2-9, 4-2-11, 4-2-12).
const DIGIT_WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'niner'];

const words = (list) => list.join(' ');
const pron = (chars) => chars.map((c) => BY_CHAR.get(c)?.say).filter(Boolean).join(' · ');
const result = (spoken, chars = []) => ({ spoken, pronounce: pron(chars) });

// Every digit spoken on its own (4-2-8 "all other numbers").
export function digits(text) {
  return [...String(text)].filter((c) => /\d/.test(c)).map((d) => DIGIT_WORD[d]);
}

// Letters and digits spelled with the phonetic alphabet (4-2-7).
export function spell(text) {
  const chars = [...String(text).toUpperCase()].filter((c) => BY_CHAR.has(c));
  return result(words(chars.map((c) => (/\d/.test(c) ? DIGIT_WORD[c] : BY_CHAR.get(c).word))), chars);
}

// Altitudes in feet (4-2-8, 4-2-9). Below 18,000 ft MSL: round hundreds and
// thousands as words up to 9,900, digits before "thousand" above it. At and above
// 18,000 ft: "flight level" and three digits. Inputs are whole hundreds of feet.
export function altitude(feet) {
  const ft = feet;
  if (!Number.isInteger(ft) || ft % 100 || ft < 100) throw new RangeError('Altitude must be a whole hundred feet, 100 or more.');
  if (ft >= 18000) {
    const fl = String(ft / 100).padStart(3, '0');
    return result(`flight level ${words(digits(fl))}`, [...fl]);
  }
  const thousands = Math.floor(ft / 1000), hundreds = (ft % 1000) / 100;
  const parts = [];
  if (thousands) parts.push(thousands > 9 ? `${words(digits(thousands))} thousand` : `${DIGIT_WORD[thousands]} thousand`);
  if (hundreds) parts.push(`${DIGIT_WORD[hundreds]} hundred`);
  return result(words(parts), [...String(thousands || ''), ...(hundreds ? [String(hundreds)] : [])]);
}

// Headings, courses and wind directions: three digits, magnetic unless "true"
// is added (4-2-10).
export function direction(deg, { kind = 'heading', isTrue = false } = {}) {
  const d = Math.round(deg);
  if (!Number.isFinite(d) || d < 1 || d > 360) throw new RangeError('Direction must be 1–360°.');
  const three = String(d).padStart(3, '0');
  const lead = kind === 'heading' ? 'heading ' : kind === 'wind' ? 'wind ' : '';
  return result(`${lead}${words(digits(three))}${isTrue ? ' true' : ''}`, [...three]);
}

// Speeds digit by digit followed by "knots"; Mach numbers as "Mach" and the
// digits with "point" (4-2-11).
export function speed(knots) {
  if (!Number.isFinite(knots) || knots <= 0) throw new RangeError('Speed must be a positive number of knots.');
  const k = String(Math.round(knots));
  return result(`${words(digits(k))} knots`, [...k]);
}
export function mach(m) {
  if (!Number.isFinite(m) || m <= 0) throw new RangeError('Mach number must be positive.');
  const [whole, frac = ''] = Number(m).toFixed(2).replace(/0$/, '').split('.');
  const lead = whole === '0' ? [] : digits(whole);
  return result(`Mach ${words([...lead, 'point', ...digits(frac)])}`, [...(whole === '0' ? '' : whole), ...frac]);
}

// Frequencies: digits with "point" for the decimal point; ICAO uses "decimal"
// (4-2-8).
export function frequency(text, { icao = false } = {}) {
  const t = String(text).trim();
  if (!/^\d{2,3}(\.\d{1,3})?$/.test(t)) throw new RangeError('Frequency must look like 121.5 or 243.0.');
  const [whole, frac] = t.split('.');
  const spoken = [...digits(whole), ...(frac ? [icao ? 'decimal' : 'point', ...digits(frac)] : [])];
  return result(words(spoken), [...whole, ...(frac ?? '')]);
}

// UTC time on the 24-hour clock, digit by digit; "Zulu" may denote UTC (4-2-12).
export function time(hhmm) {
  const t = String(hhmm).replace(':', '').padStart(4, '0');
  if (!/^\d{4}$/.test(t) || +t.slice(0, 2) > 23 || +t.slice(2) > 59) throw new RangeError('Time must be 0000–2359.');
  return result(`${words(digits(t))} Zulu`, [...t]);
}

// Transponder codes are spoken digit by digit, e.g. "squawk one two zero zero".
export function squawk(code) {
  const c = String(code);
  if (!/^[0-7]{4}$/.test(c)) throw new RangeError('A code is four digits, each 0–7.');
  return result(`squawk ${words(digits(c))}`, [...c]);
}

// Civil call signs (4-2-4): type or manufacturer, then the registration
// characters with the "N" dropped. An abbreviation, used only after ATC starts
// it, is the prefix and the last three characters.
export function callSign(type, registration) {
  const reg = String(registration).toUpperCase().replace(/^N/, '').replace(/[^A-Z0-9]/g, '');
  const say = (s) => [...s].map((c) => (/\d/.test(c) ? DIGIT_WORD[c] : BY_CHAR.get(c).word));
  const cap = (w) => w[0].toUpperCase() + w.slice(1);
  return {
    full: [type, ...say(reg).map(cap)].join(' '),
    abbreviated: [type, ...say(reg.slice(-3)).map(cap)].join(' '),
    pronounce: pron([...reg]),
  };
}

/* ---------- Contact procedure (4-2-3) ---------- */
export const INITIAL_CALL = ['facility', 'identification', 'position', 'request', 'over'];
export const ELEMENT_LABEL = {
  facility: 'Facility being called', identification: 'Your full aircraft identification',
  position: 'Your position (on the airport surface)', request: 'Request, or the type of message to follow',
  over: '"Over", if required',
};

// Checks the order of a pilot's initial call against 4-2-3a. `parts` lists the
// element keys as said; elements the scenario does not need may be absent.
export function checkCall(parts) {
  const ranks = parts.map((p) => INITIAL_CALL.indexOf(p));
  if (ranks.includes(-1)) throw new RangeError('Unknown element.');
  const first = ranks.findIndex((r, i) => i > 0 && r < ranks[i - 1]);
  return first < 0
    ? { ok: true }
    : { ok: false, at: first, said: parts[first], after: parts[first - 1] };
}

/* ---------- Readback (4-4-7) ---------- */
// Parts of an instruction that 4-4-7 says to read back: altitude assignments
// and restrictions, vectors and runway assignments, always with the aircraft
// identification. Other parts are acknowledged but not required.
export const READBACK_REQUIRED = new Set(['identification', 'altitude', 'vector', 'runway']);
export function checkReadback(clearance, picked) {
  const need = clearance.filter((p) => READBACK_REQUIRED.has(p.kind)).map((p) => p.id);
  const set = new Set(picked);
  return {
    missing: need.filter((id) => !set.has(id)),
    extra: [...set].filter((id) => !need.includes(id)),
    ok: need.every((id) => set.has(id)),
  };
}

/* ---------- Transponder code changes (4-1-20) ---------- */
export const SPECIAL_CODES = { '7500': 'hijack', '7600': 'radio failure', '7700': 'emergency' };

// The codes a transponder shows when the changed digits are set in `order`
// (digit positions 0–3). Returns each intermediate and final code.
export function codePath(from, to, order) {
  const cur = [...from];
  return order.filter((i) => from[i] !== to[i]).map((i) => { cur[i] = to[i]; return cur.join(''); });
}

// 4-1-20 asks pilots not to pass through 7500, 7600 or 7700 on a routine
// change (e.g. 2700 → 7200: select 2200 first). Returns the first changing order,
// left digit first, whose intermediate codes avoid the special ones.
export function safeOrder(from, to) {
  const changed = [0, 1, 2, 3].filter((i) => from[i] !== to[i]);
  const perms = (xs) => (xs.length < 2 ? [xs] : xs.flatMap((x, i) => perms([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p])));
  for (const order of perms(changed)) {
    const path = codePath(from, to, order);
    if (!path.slice(0, -1).some((c) => c in SPECIAL_CODES)) return { order, path };
  }
  return null;
}

/* ---------- Light-gun signals (AIM TBL 4-3-13) ---------- */
export const LIGHT_SIGNALS = [
  { id: 'steady-green', colors: ['green'], flash: false, ground: 'Cleared for takeoff', flight: 'Cleared to land' },
  { id: 'flashing-green', colors: ['green'], flash: true, ground: 'Cleared for taxi', flight: 'Return for landing (to be followed by steady green at the proper time)' },
  { id: 'steady-red', colors: ['red'], flash: false, ground: 'STOP', flight: 'Give way to other aircraft and continue circling' },
  { id: 'flashing-red', colors: ['red'], flash: true, ground: 'Taxi clear of the runway in use', flight: 'Airport unsafe, do not land' },
  { id: 'flashing-white', colors: ['white'], flash: true, ground: 'Return to starting point on airport', flight: 'Not applicable' },
  { id: 'alternating', colors: ['red', 'green'], flash: true, ground: 'Exercise extreme caution', flight: 'Exercise extreme caution' },
];

/* ---------- IFR two-way radio failure (AIM 6-4-1c) ---------- */
// Route: the first that applies of assigned, vectored (direct from the point
// of failure to the fix, route or airway in the vector clearance), expected and
// filed.
export const ROUTE_RULES = [
  { id: 'assigned', label: 'Assigned', text: 'The route assigned in the last ATC clearance received.' },
  { id: 'vectored', label: 'Vectored', text: 'If being radar vectored: direct from the point of radio failure to the fix, route or airway specified in the vector clearance.' },
  { id: 'expected', label: 'Expected', text: 'Without an assigned route: the route ATC has advised may be expected in a further clearance.' },
  { id: 'filed', label: 'Filed', text: 'Without an assigned or expected route: the route filed in the flight plan.' },
];
export function lostCommsRoute({ vectored = false, assigned = true, expected = false } = {}) {
  if (vectored) return 'vectored';
  if (assigned) return 'assigned';
  if (expected) return 'expected';
  return 'filed';
}

// Altitude: for each route segment, the highest of the last assigned altitude,
// the segment's IFR minimum altitude, and an expected altitude once it applies.
// `expected` is { altitude, fromSegment } or null.
export function lostCommsAltitudes({ segments, assigned, expected = null }) {
  return segments.map((seg, i) => {
    const options = [
      { source: 'assigned', altitude: assigned },
      { source: 'minimum', altitude: seg.minimum },
    ];
    if (expected && i >= expected.fromSegment) options.push({ source: 'expected', altitude: expected.altitude });
    const top = options.reduce((a, b) => (b.altitude > a.altitude ? b : a));
    return { ...seg, altitude: top.altitude, source: top.source, options };
  });
}

/* ---------- Distress and urgency message (AIM 6-3-2) ---------- */
export const DISTRESS_ORDER = [
  'MAYDAY, MAYDAY, MAYDAY (or PAN-PAN ×3 for urgency)', 'Name of station addressed', 'Aircraft identification and type',
  'Nature of distress or urgency', 'Weather', 'Pilot’s intentions and request',
  'Present position and heading (or, if lost, last known position, time and heading since)', 'Altitude or flight level',
  'Fuel remaining in minutes', 'Number of people on board', 'Any other useful information',
];

/* ---------- Transmission timing (AIM 4-2-2) ---------- */
// A shared frequency as a list of [start, end] busy intervals, seconds. A key
// press at `t` held for `length` collides if it overlaps any busy interval.
export function transmit(busy, t, length) {
  const end = t + length;
  const hit = busy.find(([a, b]) => t < b && end > a);
  return hit ? { blocked: true, with: hit } : { blocked: false };
}

/* ---------- A Navy training sortie (VT-10 "Hollywood Script", May 2022) ---------- */
// One sortie's calls in order, as the script gives them. radio: the band and
// preset channel named in the script; station: who is called; call: the
// pilot's transmission; reply: the controller's answer; readback: the pilot's
// readback, where the script gives one. page: the script page.
export const SORTIE = [
  { phase: 'ATIS', radio: 'UHF 1', station: 'Sherman ATIS', call: null, reply: null, readback: null, page: '19',
    note: 'Copy the ATIS first: every later call can then quote its letter.' },
  { phase: 'Clearance', radio: 'UHF 2', station: 'Sherman Clearance', call: 'Sherman Clearance, KATT 11, IFR, NPA 630, on request, ready to copy.',
    reply: 'KATT 11, readback correct.', readback: null, page: '20', note: 'The IFR clearance is copied and read back; Clearance confirms the readback.' },
  { phase: 'Base', radio: 'UHF 19', station: 'KATT Base', call: 'KATT Base, KATT 11 taxi outbound, side number 000.',
    reply: 'KATT 11, side number 000, base has you outbound.', readback: null, page: '20', note: 'The squadron’s own base frequency: tell the squadron which jet you have and that you are taxiing.' },
  { phase: 'Ground', radio: 'UHF 3', station: 'Sherman Ground', call: 'Sherman Ground, KATT 11, taxi, information (ATIS letter).',
    reply: 'KATT 11, Runway 7 right, taxi via Foxtrot – Delta – Alpha, cross Runway 19.', readback: null, page: '21', note: 'Station, call sign, request, and the ATIS letter.' },
  { phase: 'Base', radio: 'UHF 19', station: 'KATT Base', call: 'KATT Base, KATT 11 going flying.', reply: 'KATT 11, roger.', readback: null, page: '25',
    note: 'A last call to the squadron before takeoff.' },
  { phase: 'Tower', radio: 'UHF 4', station: 'Sherman Tower', call: 'Sherman Tower, KATT 11, takeoff IFR.',
    reply: 'KATT 11, wind 060 at 8, Runway 7 right, cleared for takeoff, switch to Departure.', readback: 'KATT 11, cleared for takeoff Runway 7 right, switching.', page: '25',
    note: 'The readback carries the runway; “switching” acknowledges the frequency change.' },
  { phase: 'Departure', radio: 'UHF 6', station: 'Pensacola Departure', call: 'Pensacola Departure, KATT 11, passing (altitude) for 3000.',
    reply: 'KATT 11, radar contact, climb and maintain 10,000.', readback: 'KATT 11, continuing to 10,000.', page: '27', note: 'Check in climbing: the altitude you are passing and the altitude you are climbing to.' },
  { phase: 'Area', radio: 'UHF 6', station: 'Pensacola Departure', call: null,
    reply: 'KATT 11, fly heading 310, climb and maintain 11,000, Gator 3 Bravo, frequency change approved.', readback: 'KATT 11, continuing to 11,000, Gator 3 Bravo, switching.', page: '28',
    note: 'Cleared into the working area. Then UHF 16, MOA Common: a safety-of-flight frequency used by Departure, so there is no check-in.' },
  { phase: 'Cancel', radio: 'VHF 5', station: 'Pensacola Approach', call: 'Pensacola Approach, KATT 11, complete in the MOA, cancel IFR.',
    reply: 'KATT 11, cancellation received, squawk VFR, frequency change approved.', readback: 'KATT 11, switching.', page: '30', note: 'Done in the area: cancel IFR on VHF 5 (120.05) and squawk VFR.' },
  { phase: 'Approach', radio: 'UHF 6', station: 'Pensacola Approach', call: 'Pensacola Approach, KATT 11, 3500, information Bravo, request course rules.',
    reply: 'KATT 11, squawk 0134.', readback: 'KATT 11, squawk 0134.', page: '31', note: 'Coming home: altitude, ATIS letter and the request to fly the published course rules.' },
  { phase: 'Approach', radio: 'UHF 6', station: 'Pensacola Approach', call: 'Pensacola Approach, KATT 11, Point Golf in sight.',
    reply: 'KATT 11, contact Sherman Tower Button 4.', readback: null, page: '32', note: '“Button 4” is preset channel 4, Sherman Tower.' },
  { phase: 'Tower', radio: 'UHF 4', station: 'Sherman Tower', call: 'Sherman Tower, KATT 11, Point Golf for the break.',
    reply: 'KATT 11, report the numbers Runway 7 right.', readback: 'KATT 11, 7 right, wilco.', page: '32', note: 'Inbound for the overhead break.' },
  { phase: 'Break', radio: 'UHF 4', station: 'Sherman Tower', call: 'Sherman Tower, KATT 11, numbers 7 right.',
    reply: 'KATT 11, right break approved.', readback: null, page: '32', note: 'Over the runway numbers, tower approves the break.' },
  { phase: 'Landing', radio: 'UHF 4', station: 'Sherman Tower', call: 'Sherman Tower, KATT 11, (abeam, 180, 90 or final), gear, stop.',
    reply: 'KATT 11, wind 080 at 8, Runway 7 Right, cleared to land.', readback: 'KATT 11, cleared to land 7 Right.', page: '33–34', note: 'Your position in the pattern, then “gear” and “stop”. The script does not define them; read in context, the gear is down and the landing is a full stop.' },
  { phase: 'Rollout', radio: 'UHF 4', station: 'Sherman Tower', call: null,
    reply: 'KATT 11, turn right next taxiway, contact ground when clear.', readback: 'KATT 11, wilco.', page: '34', note: 'Stay with tower until clear of the runway.' },
  { phase: 'Ground', radio: 'UHF 3', station: 'Sherman Ground', call: 'Sherman Ground, KATT 11, clear of the active, taxi to my line.',
    reply: 'KATT 11, taxi to your line via Alpha, Alpha 4.', readback: 'KATT 11, taxi via Alpha, Alpha 4.', page: '34', note: 'Taxi back to the squadron line.' },
  { phase: 'Base', radio: 'UHF 19', station: 'KATT Base', call: 'KATT Base, KATT 11 in and up.', reply: 'KATT 11, welcome back.', readback: null, page: '35',
    note: 'The last call: tell the squadron you are back.' },
];

/* ---------- Training-rule calls (CNATRA P-1289) ---------- */
// Calls that stop, start or deconflict training engagements. page: P-1289 page.
export const TRAINING_CALLS = [
  { call: 'Knock it off', meaning: 'Stop the engagement. Anyone may call it; every player echoes it. An aircraft rocking its wings means the same.', page: '3-3' },
  { call: 'Terminate', meaning: 'Temporarily stop the training for administrative reasons; lead restarts it.', page: '5-11' },
  { call: 'Fight’s on', meaning: 'The engagement starts. Lead counts “3, 2, 1, fight’s on” and the wingman echoes it.', page: '5-14' },
  { call: 'Blind', meaning: 'I cannot see my wingman anywhere. Said with your call sign, then turn away from the predicted collision bearing.', page: '3-3' },
  { call: 'No joy', meaning: 'I cannot see the threat aircraft my wingman described.', page: '3-3' },
];
