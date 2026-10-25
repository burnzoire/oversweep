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

/* ---------- Sharing a frequency (AIM 4-2-1, 4-2-2) ---------- */
// A frequency as a queue of transmissions, each { who, words, len, pause, due }:
// len is how long it lasts and pause the silence before it, both in seconds;
// due is true when a reply or readback is owed after it. The queue is not a
// recording: a station that has not keyed yet hears you and waits its turn.
// Only a station keying within REACTION of you cannot have heard you.
export const REACTION = 0.5;
export const YOU = 'YOU';
// Lays the queue out around your key presses (seconds). Returns the log of
// what went out, in order, and one result per key press:
//   clear     frequency quiet and no reply owed: the call is heard and answered
//   busy      someone was already talking: both calls are lost
//   doubled   someone keyed at the same instant: both lost, nobody's fault
//   stepped   you keyed as an owed reply started: both lost
//   cut-in    you keyed into the pause before an owed reply: heard, but you
//             interrupted an exchange and are told to stand by
//   too-soon  you called again before your own answer came
export function shareFrequency(script, keys, { call, answer, standBy }) {
  const queue = script.map((s) => ({ ...s }));
  const log = [], results = [];
  let cursor = 0;
  const place = (item) => {
    const start = cursor + item.pause;
    const tx = { ...item, start, end: start + item.len };
    log.push(tx);
    cursor = tx.end;
  };
  for (const t of [...keys].sort((a, b) => a - b)) {
    const mine = log.findLast((x) => x.who === YOU);
    if (mine && t < mine.end) continue;
    while (queue.length && cursor + queue[0].pause < t + REACTION) place(queue.shift());
    const hits = log.filter((x) => x.end > t);
    const last = log.findLast((x) => x.end <= t);
    let kind;
    if (hits.some((x) => x.start <= t)) kind = 'busy';
    else if (last?.who === YOU && !last.garbled) kind = 'too-soon';
    else if (last?.due) kind = hits.length ? 'stepped' : 'cut-in';
    else kind = hits.length ? 'doubled' : 'clear';
    const blocked = hits.length > 0;
    for (const x of hits) x.garbled = true;
    log.push({ who: YOU, words: call, len: 3, pause: 0, start: t, end: t + 3, due: !blocked, garbled: blocked });
    cursor = Math.max(t + 3, ...hits.map((x) => x.end));
    if (blocked) queue.unshift(...hits.map(({ start, end, garbled, ...x }) => ({ ...x, pause: 1, repeat: true })));
    else if (kind === 'clear') queue.unshift({ ...answer, pause: 0.8 });
    else if (kind === 'cut-in') queue.unshift({ ...standBy, pause: 0.6 });
    results.push({ t, kind, blocked, with: hits.map((x) => x.who) });
  }
  while (queue.length) place(queue.shift());
  return { log, results };
}

// Figure 1's approach frequency, as it runs if you never key: constructed
// traffic from three services. Approach owes nothing after a readback; after
// an instruction or a request a reply is owed (AIM 4-2-1: acknowledge each
// ATC communication). REACH 451 is slow to answer, so its silence is not clear.
export const BUSY_FREQUENCY = [
  { who: 'APP', words: 'Navy 405, turn left heading 270.', len: 3.4, pause: 0.4, due: true },
  { who: '405', words: 'Left 270, Navy 405.', len: 2.4, pause: 0.6, due: false },
  { who: '26019', words: 'Approach, Army 26019, request descent.', len: 3.8, pause: 3.2, due: true },
  { who: 'APP', words: 'Army 26019, descend and maintain 3,000.', len: 3.6, pause: 0.6, due: true },
  { who: '26019', words: 'Down to 3,000, Army 26019.', len: 2.6, pause: 0.7, due: false },
  { who: 'APP', words: 'REACH 451, turn right heading 090.', len: 3.4, pause: 4, due: true },
  { who: 'APP', words: 'REACH 451, Approach, how do you hear?', len: 3.2, pause: 3, due: true },
  { who: '451', words: 'Loud and clear, right 090, REACH 451.', len: 3, pause: 0.8, due: false },
  { who: 'APP', words: 'Navy 405, contact Tower, Button 4.', len: 3.6, pause: 4.5, due: true },
  { who: '405', words: 'Button 4, Navy 405.', len: 2.2, pause: 0.6, due: false },
];
export const YOUR_CALL = {
  call: 'Approach, KATT 31, level 6,000.',
  answer: { who: 'APP', words: 'KATT 31, Approach, roger.', len: 2.2, due: false },
  standBy: { who: 'APP', words: 'KATT 31, stand by.', len: 1.6, due: false },
};

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

// Multi-service brevity codes (ATP 1-02.1 / MCRP 3-30B.1 / NTTP 6-02.1 /
// AFTTP 3-2.5, 25 April 2025): one list shared by the Army, Marine Corps, Navy
// and Air Force. `page` is the page of the 2025 edition.
export const BREVITY = [
  { word: 'Knock-it-off', meaning: 'Cease all air combat maneuvers, attacks, activities or exercises (training use only).', page: '26' },
  { word: 'Abort', meaning: 'Cease action, or terminate the attack before weapons release, the event or the mission.', page: '2' },
  { word: 'Blind', meaning: 'No visual contact with a friendly aircraft, ship or ground position. Opposite of visual.', page: '5' },
  { word: 'No joy', meaning: 'Aircrew does not have visual contact with the target or bandit. Opposite of tally.', page: '31' },
  { word: 'Padlocked', meaning: 'Aircrew cannot take their eyes off an aircraft, ground target or surface position without risk of losing tally or visual.', page: '32' },
  { word: 'Joker', meaning: 'A fuel state above bingo at which separation, bugout or event termination should begin.', page: '25' },
  { word: 'Bingo', meaning: 'The prebriefed fuel state needed for recovery.', page: '5' },
  { word: 'Push', meaning: 'Switch to the designated frequency; no acknowledgment required.', page: '35' },
  { word: 'Fence in / fence out', meaning: 'Set cockpit switches as appropriate before entering or exiting the combat area.', page: '18' },
  { word: 'Buster', meaning: 'Fly at maximum continuous speed.', page: '7' },
  { word: 'Popeye', meaning: 'Flying in clouds or an area of reduced visibility.', page: '34' },
  { word: 'Pigeons', meaning: 'Bearing (magnetic) and range (nautical miles) to home plate.', page: '33' },
  { word: 'Bogey', meaning: 'A contact whose identity is unknown.', page: '6' },
  { word: 'Bandit', meaning: 'Positively identified as an enemy in accordance with theater ID criteria.', page: '4' },
];

