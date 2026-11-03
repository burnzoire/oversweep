// Data and geometry for the Air-to-Air Refuelling Procedures figures and
// quizzes, without the DOM. [1] is NATO ATP-3.3.4.2 (ATP-56) Edition C
// Version 1, cited by paragraph or annex table; [2] the DCS F-16C guide and
// [3] the Falcon BMS training manual, sim only.

const G = 9.80665, KT = 1852 / 3600;

/* ---------- Figure 1: the receiver flow around the tanker ---------- */
// Positions in the plan view, in drawing units with the tanker's nose up at
// (0, 0) and +y aft. They show the order of the flow, not distances: the
// ATP gives no fixed spacing for the wing positions, only "one receiver
// wingspan outboard" and aft of the wingline when the tanker has a rearward
// observer [1, Annex 1A, Echelon Left Position].
export const SPOTS = {
  'echelon-left': [[-118, 40], [-148, 58], [-178, 76]],
  'echelon-right': [[118, 40], [148, 58], [178, 76]],
  astern: { boom: [0, 150], centre: [0, 150], left: [-62, 120], right: [62, 120] },
  contact: { boom: [0, 108], centre: [0, 118], left: [-62, 88], right: [62, 88] },
  away: [[150, -40], [180, -22]],
};

// Each tanker type's flow, step by step. `at` maps each receiver (A, B) to
// a spot; `calls` are the Annex 2P radio calls for that step, said in full
// only in EMCON option 1 [1, Annex 2P note 4]. Receiver call sign "Hawk 1"
// and "Hawk 2" and tanker "Shell 6" are invented.
export const FLOWS = {
  boom: {
    name: 'Boom tanker',
    note: 'A boom refuels one receiver at a time. The standard flow for two or more receivers is left to right, except non-bomber heavy receivers, which flow right to left. [1, ¶2.8.e]',
    steps: [
      { title: 'Join', at: { A: ['astern', 'boom'], B: ['echelon-left', 0] },
        text: 'If the tanker clears it, the first receiver may join directly behind the boom, once it has seen that no refuelling is in progress and the boom is lowered. Everyone else forms up in Echelon Left, behind the tanker’s wingline. [1, ¶2.7.a]',
        calls: [['Tanker', '“Hawk 1, clear astern.”'], ['Hawk 1', '“Hawk 1, astern.”']] },
      { title: 'Astern radio check', at: { A: ['astern', 'boom'], B: ['echelon-left', 0] },
        text: 'Stabilized about 50 ft behind and slightly below the boom nozzle with zero closure. In EMCON option 2 the boom operator and receiver swap numbers only, such as “25, 57” and “25”; without that check, refuelling does not start unless a mission priority or fuel emergency is declared. [1, Annex 1A Astern Position; Table 2O-1]',
        calls: [['Boom operator', '“25, 57.”'], ['Hawk 1', '“25.”']] },
      { title: 'Contact', at: { A: ['contact', 'boom'], B: ['echelon-left', 0] },
        text: 'Cleared to contact, the receiver flies steady close formation while the boom operator flies the boom and extends it into the receptacle. The pilot director lights then show high or low, near or far. [1, ¶2.8.f]',
        calls: [['Tanker', '“Hawk 1, clear contact.”'], ['Boom operator', '“Shell 6, contact.”']] },
      { title: 'First receiver reforms right', at: { A: ['echelon-right', 0], B: ['astern', 'boom'] },
        text: 'Done, the receiver disconnects and is cleared to Echelon Right. Only when it is clear of the boom and moving right is the next receiver directed astern, and that receiver must see the first one going. [1, ¶2.8.f–i]',
        calls: [['Tanker', '“Hawk 1, go Echelon Right.”'], ['Tanker', '“Hawk 2, clear astern.”']] },
      { title: 'Second receiver refuels', at: { A: ['echelon-right', 0], B: ['contact', 'boom'] },
        text: 'The second receiver repeats the sequence. Only one aircraft changes position at a time; everyone else holds steady where the tanker put them. [1, ¶2.8.b]',
        calls: [['Tanker', '“Hawk 2, clear contact.”'], ['Boom operator', '“Shell 6, contact.”']] },
      { title: 'Leave', at: { A: ['away', 0], B: ['away', 1] },
        text: 'From Echelon Right the receivers leave level with the tanker or climbing, not descending: other receivers are likely to be joining from below. [1, ¶2.10.a]',
        calls: [['Tanker', '“Hawk, clear to leave.”']] },
    ],
  },
  wing: {
    name: 'Two wing hoses',
    note: 'With two wing hoses, two receivers can refuel at once, but the tanker can usually watch only one approach at a time. [1, ¶2.28.e]',
    steps: [
      { title: 'Join Echelon Left', at: { A: ['echelon-left', 0], B: ['echelon-left', 1] },
        text: 'Every probe receiver joins loose Echelon Left first and stabilizes with zero closure, never directly behind: distance and closure from behind are the hardest things to judge, especially at night. [1, ¶2.27.a]',
        calls: [['Hawk 1', '“Hawk 1, visual.”'], ['Tanker', '“Hawk, clear join.”'], ['Hawk 1', '“Hawk, Echelon Left.”']] },
      { title: 'Pair astern', at: { A: ['astern', 'right'], B: ['astern', 'left'] },
        text: 'Up to two receivers may move at once. With both hoses free, the first takes the right hose and the second the left; each stabilizes about 5 ft behind its drogue. [1, ¶2.6.c, ¶2.6.e; Annex 1A Astern Position]',
        calls: [['Tanker', '“Hawk, clear astern left and right.”'], ['Hawk 1', '“Hawk 1, astern right.”'], ['Hawk 2', '“Hawk 2, astern left.”']] },
      { title: 'Contacts one at a time', at: { A: ['contact', 'right'], B: ['astern', 'left'] },
        text: 'Receivers are cleared to contact one at a time; for simultaneous refuelling, the first is in contact, with fuel flowing if wet, before the second is cleared. [1, ¶2.6.g, ¶2.28.e]',
        calls: [['Tanker', '“Hawk 1, clear contact right.”']] },
      { title: 'Both in contact', at: { A: ['contact', 'right'], B: ['contact', 'left'] },
        text: 'Both stay in contact until the tanker clears them to disconnect, because one wing hose disconnecting can yaw the tanker slightly. [1, ¶2.6.g]',
        calls: [['Tanker', '“Hawk 2, clear contact left.”']] },
      { title: 'Disconnect and reform right', at: { A: ['echelon-right', 0], B: ['echelon-right', 1] },
        text: 'Normally both disconnect together, drop back to astern and are cleared to Echelon Right, the first receiver staying closest to the tanker’s wing. The tanker passes each the fuel transferred. [1, ¶2.6.h, ¶2.6.j, ¶2.10.a, ¶2.49]',
        calls: [['Tanker', '“Hawk, disconnect.”'], ['Tanker', '“Hawk, go Echelon Right.”']] },
      { title: 'Leave', at: { A: ['away', 0], B: ['away', 1] },
        text: 'Level or climbing, never descending without coordination, since others join from below. [1, ¶2.10.a]',
        calls: [['Tanker', '“Hawk, clear to leave.”']] },
    ],
  },
  centre: {
    name: 'Centreline hose',
    note: 'With one hose, receivers cycle through it one at a time. [1, ¶2.6.f]',
    steps: [
      { title: 'Join Echelon Left', at: { A: ['echelon-left', 0], B: ['echelon-left', 1] },
        text: 'Both receivers join loose Echelon Left and stabilize. On a tanker with no rearward observer, Echelon Left is co-altitude and well forward, so the tanker pilots can see you. [1, ¶2.5.a; Annex 1A Echelon Left Position]',
        calls: [['Tanker', '“Hawk, clear join.”'], ['Hawk 1', '“Hawk, Echelon Left.”']] },
      { title: 'First receiver astern', at: { A: ['astern', 'centre'], B: ['echelon-left', 0] },
        text: 'One receiver moves behind the hose and stabilizes; the other holds its position on the wing. [1, ¶2.6.f]',
        calls: [['Tanker', '“Hawk 1, clear astern centre.”'], ['Hawk 1', '“Hawk 1, astern centre.”']] },
      { title: 'Contact', at: { A: ['contact', 'centre'], B: ['echelon-left', 0] },
        text: 'Cleared, the receiver flies the probe into the drogue and pushes the hose in until fuel flows. [1, ¶1.14.a, Annex 2P]',
        calls: [['Tanker', '“Hawk 1, clear contact.”']] },
      { title: 'Swap', at: { A: ['echelon-right', 0], B: ['astern', 'centre'] },
        text: 'The first receiver goes to Echelon Right; the second moves astern only when cleared and when it has seen the first moving right. [1, ¶2.6.j–k]',
        calls: [['Tanker', '“Hawk 1, go Echelon Right.”'], ['Tanker', '“Hawk 2, clear astern centre.”']] },
      { title: 'Leave', at: { A: ['away', 0], B: ['away', 1] },
        text: 'Leave from Echelon Right, level or climbing. [1, ¶2.10.a]',
        calls: [['Tanker', '“Hawk, clear to leave.”']] },
    ],
  },
};

export function spotOf([kind, key]) {
  const s = SPOTS[kind];
  return Array.isArray(s) ? s[key] : s[key];
}

/* ---------- Figure 2: boom, astern to contact ---------- */
// Receiver position relative to the boom contact position, in feet: x aft
// (+) or forward (-), z below (+) or above (-). The astern position is
// "approximately 50 ft. behind and slightly below the tanker boom nozzle"
// [1, Annex 1A]; the 6 ft depth and the envelope below are invented for the
// figure, since each tanker's real limits are in its national document.
export const BOOM = { astern: { x: 50, z: 6 }, envelope: { x: 4, z: 4 }, inner: -5, onSpot: 1 };

export function boomStep(pos) {
  // Coarse steps far out, 1 ft steps inside 10 ft.
  return Math.abs(pos.x) > 10 ? 5 : 1;
}

// What the pilot director lights command: one array for up and down, one
// for fore and aft, none for azimuth [1, ¶1.15.a]. `size` is 0 on the spot,
// 1 for a small correction, 2 for a large one, on the invented envelope.
export function directorLights(pos) {
  const axis = (v, more, less) => {
    const a = Math.abs(v);
    return { cmd: a <= BOOM.onSpot ? null : v > 0 ? more : less, size: a <= BOOM.onSpot ? 0 : a <= BOOM.envelope.x ? 1 : 2 };
  };
  // Aft of the spot the light says forward; below it, up.
  return { elevation: axis(pos.z, 'UP', 'DOWN'), fore: axis(pos.x, 'FORWARD', 'AFT') };
}

// The boom operator's verbal correction: direction, then distance in feet,
// one axis at a time ("FORWARD 50", "UP 4", "BACK 2") [1, ¶2.46]. The larger
// error is called first; that order is the figure's, not the ATP's.
export function boomCall(pos) {
  const dx = Math.round(pos.x), dz = Math.round(pos.z);
  if (Math.abs(dx) <= BOOM.onSpot && Math.abs(dz) <= BOOM.onSpot) return null;
  if (Math.abs(dx) >= Math.abs(dz)) return dx > 0 ? `FORWARD ${dx}` : `BACK ${-dx}`;
  return dz > 0 ? `UP ${dz}` : `DOWN ${-dz}`;
}

export function inEnvelope(pos) {
  return Math.abs(pos.x) <= BOOM.envelope.x && Math.abs(pos.z) <= BOOM.envelope.z;
}

/* ---------- Figure 3: probe and drogue, contact and hose ---------- */
// Hose travel in metres pushed in from full trail. "Typically about 2 m
// (6 ft)" opens the fuel valve; "a range of movement from the valve open
// position to 7 m (20 ft) forward of this, is typical" [1, ¶1.14.a(5)–(6)].
export const HOSE = { valveOpen: 2, range: 7, step: 1 };

export function hoseState(push, engaged) {
  if (!engaged) return { light: 'amber', fuel: false, text: 'Astern, about 5 ft behind the drogue, zero closure. Amber: clear contact.' };
  if (push < HOSE.valveOpen) return { light: 'amber', fuel: false, text: `In contact, hose pushed in ${push} m. Keep moving forward: the fuel valve opens after about ${HOSE.valveOpen} m of travel.` };
  if (push <= HOSE.valveOpen + HOSE.range) return { light: 'green', fuel: true, text: `Hose pushed in ${push} m. Green: fuel is flowing. The coloured hose bands entering the tunnel or fairing mark the best refuelling position.` };
  return { light: 'amber', fuel: false, text: `Hose pushed in ${push} m: beyond the typical range. On some equipment the fuel valve closes if the hose is pushed in too far, and the figure stops the flow here to show it; ease back.` };
}

/* ---------- Figure 4: the point-parallel rendezvous (RV Delta) ---------- */
// Turn radius in NM for a true airspeed in knots and a bank angle in degrees,
// in a level, coordinated turn with no wind.
export function turnRadiusNm(tasKt, aobDeg) {
  const v = tasKt * KT;
  return (v * v) / (G * Math.tan((aobDeg * Math.PI) / 180)) / 1852;
}

// No-wind RV Delta: the receiver flies north along x = 0; the tanker flies
// the reciprocal track offset to the east and turns toward the receiver so
// it rolls out on the receiver's track `rolloutNm` ahead of it. With no
// wind, the offset is the tanker's turn diameter; the ATP's tables add drift
// and use the planning bank angle of 25° [1, ¶2.2.f; Annex 2D].
export function rvDelta({ tankerKt, receiverKt, aobDeg = 25, rolloutNm = 1 }) {
  const r = turnRadiusNm(tankerKt, aobDeg);
  const turnH = (Math.PI * r) / tankerKt;
  const receiverStartY = -rolloutNm - receiverKt * turnH;
  const offsetNm = 2 * r;
  const turnRangeNm = Math.hypot(offsetNm, receiverStartY);
  // Position of each aircraft t hours after the tanker starts its turn.
  const at = (t) => {
    const w = Math.PI / turnH;
    let tanker, tankerHdg;
    if (t <= 0) { tanker = [offsetNm, -tankerKt * t]; tankerHdg = 180; }
    else if (t < turnH) { tanker = [r + r * Math.cos(w * t), -r * Math.sin(w * t)]; tankerHdg = 180 + (w * t * 180) / Math.PI; }
    else { tanker = [0, tankerKt * (t - turnH)]; tankerHdg = 360; }
    return { tanker, tankerHdg: tankerHdg % 360, receiver: [0, receiverStartY + receiverKt * t] };
  };
  return { radiusNm: r, offsetNm, turnRangeNm, turnMin: turnH * 60, at, turnH };
}

/* ---------- Quizzes ---------- */
// What do you say? From Annex 2P [1] and ¶2.4, ¶2.28.f, ¶2.32–2.35, ¶2.46.
export const CALLS = [
  { q: 'You have the tanker on radar and are taking responsibility for closing to visual range. What do you say?', answer: '“(Call sign), Judy”', why: 'Judy: radar contact, receiver closing to visual range. [1, Annex 2P serial 3]' },
  { q: 'You are joining and can see the tanker. What do you say?', answer: '“(Call sign), visual”', why: 'Then wait for “clear join”. [1, Annex 2P serial 4–5]' },
  { q: 'You realise you are going to pass the tanker before its rendezvous turn is complete. After making sure you will pass at least 1,000 ft below, what do you say?', answer: '“(Tanker call sign), execute overrun”', why: 'Then decelerate, holding the refuelling heading and level; the tanker accelerates. [1, ¶2.4]' },
  { q: 'Your probe hits the drogue and you think you damaged its ribs or canopy. What do you say?', answer: '“Spokes”', why: 'If the probe went through the drogue, hold a stable in-contact position until the tanker orders the disconnect. [1, ¶2.28.f; Annex 2P serial 16]' },
  { q: 'You are the tanker. A receiver is closing too fast to stabilize astern and a collision looks possible. What do you call?', answer: '“(Tanker call sign), breakaway, breakaway, breakaway”', why: 'Prefaced by the tanker’s own call sign, so receivers on the same frequency know which tanker. The receiver disconnects and gets clear; separation is the receiver’s job. [1, ¶2.35; Annex 2P note 10]' },
  { q: 'You are the boom operator. The receiver, 50 ft out, needs to come forward 50 ft. Normally boom visual signals are used; if the receiver asks for talk-on, what do you say?', answer: '“Forward 50”', why: 'Direction first, then distance in feet, until the receiver reaches the contact position. [1, ¶2.46]' },
  { q: 'Tanker and receiver can no longer hear each other on the refuelling frequency or the secondary. Where do both go?', answer: '243.0 MHz (121.5 MHz for some receivers)', why: 'Then move routine traffic to another agreed frequency: the guard frequency is not for routine calls. [1, ¶2.50]' },
  { q: 'In cloud you lose sight of the tanker while in contact on a wing hose, the tanker flying straight and level. Besides the disconnect, what do you say?', answer: '“(Call sign), loss of visual contact”', why: 'Disconnect, transition to instruments, call and slow 10 kt, then the lost-wingman procedure for your hose. [1, ¶2.33]' },
];
export const CALL_OPTIONS = CALLS.map((c) => c.answer);

// What does this signal mean? NATO standard lights [1, ¶1.14.e] and the
// radio-silent boom signals [1, Table 2Q-3].
export const SIGNALS = [
  { q: 'The tanker’s refuelling equipment shows a steady red light.', answer: 'Breakaway, or do not make contact', why: 'The NATO standard: red is breakaway or no contact. [1, ¶1.14.e]' },
  { q: 'The refuelling equipment shows an amber light.', answer: 'Clear contact', why: 'The NATO standard: amber is clear contact. [1, ¶1.14.e]' },
  { q: 'The refuelling equipment shows a green light while you are in contact.', answer: 'Fuel is flowing', why: 'The NATO standard: green is fuel flowing. Nations may vary these. [1, ¶1.14.e]' },
  { q: 'Radio silent, on a boom tanker: the pilot director lights start flashing and the lower rotating beacon comes on.', answer: 'Breakaway', why: 'Flashing pilot director lights and the lower beacon are the silent breakaway signal. [1, Table 2Q-3 serial 8]' },
  { q: 'Radio silent, astern a boom tanker: the boom is fully retracted, in trail.', answer: 'Fuel offload complete', why: 'Boom in trail, fully retracted. [1, Table 2Q-3 serial 4]' },
  { q: 'Radio silent, astern a boom tanker: the boom is fully stowed.', answer: 'Tanker refuelling system inoperative', why: 'Boom stowed, fully retracted. [1, Table 2Q-3 serial 6]' },
  { q: 'Radio silent, in contact on a boom: the pilot director lights go out.', answer: 'Tanker asks you to disconnect and return astern', why: 'Lights off during contact. [1, Table 2Q-3 serial 9]' },
  { q: 'Radio silent: you join a probe-and-drogue tanker in Echelon Left and it trails its hose.', answer: 'Tanker has seen you and has fuel', why: 'A hose that stays stowed means no fuel: divert or find another tanker. [1, Table 2Q-1 serials 2–3]' },
];
export const SIGNAL_OPTIONS = SIGNALS.map((s) => s.answer);
