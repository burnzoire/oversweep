// Data for the formation figures and quizzes, without the DOM.

// Figure 1: where the wingman flies. Bearings are degrees aft of the
// lead's wingline (0 = abeam, 90 = in trail); separation in NM. From the
// VT-35 T-44C tactical formation instructions [3] and procedures brief
// [4]: training numbers for one type, shown as an example of the shape of
// each formation, not a standard for every aircraft.
export const FORMATIONS = [
  {
    id: 'parade', name: 'Parade', bearing: [45, 45], range: [0, 0], scale: 0.1,
    use: 'Airshows and coming in for the break: close, with little flexibility, the wingman flying checkpoints on the lead.',
    note: 'A fixed bearing and distance, set by sight-picture checkpoints rather than a number. The T-44C brief draws it on the 45° bearing.',
    cite: [4, 'Formation Types'],
  },
  {
    id: 'cruise', name: 'Cruise', bearing: [30, 45], range: [0, 0.2], scale: 0.3,
    use: 'An administrative formation for controlled airspace, keeping the flight tight and away from other aircraft while the wingman moves between bearings by radius of turn.',
    note: 'Between the 30° and 45° bearings on either side, 0 to 0.2 NM, moving by radius of turn.',
    cite: [4, 'Formation Types'],
  },
  {
    id: 'combat-cruise', name: 'Combat cruise', bearing: [-10, 90], prefer: [30, 45], avoid: [60, 90], range: [0.3, 1.0], scale: 1.2,
    use: 'Most flexibility for each aircraft: manoeuvre, lookout and terrain masking.',
    note: 'Anywhere aft of 10° forward of abeam, 30–45° preferred; not for long between the 30° bearing and trail (5 to 7 o’clock). 0.3–1.0 NM.',
    cite: [3, 'Combat Cruise'],
  },
  {
    id: 'combat-spread', name: 'Combat spread', bearing: [-10, 10], range: [0.3, 2.0], scale: 2.2,
    use: 'Open terrain and maximum lookout: each aircraft clears the other’s six. Tactical turns are flown from here.',
    note: 'Within 10° of abeam, 0.3–2.0 NM depending on conditions (0.7 NM ideal in the T-44C).',
    cite: [3, 'Combat Spread'],
  },
];

// Figure 4: the underrun recovery in order, from the T-44C procedures
// brief [4]: "Lower, level, idle, call."
export const UNDERRUN = [
  'Increase step-down',
  'Keep lead in sight',
  'Level the wings',
  'Reduce power to idle',
  'Transmit “underrunning”',
  'Join in the assigned position',
];

// Quiz: which call or signal? From the VT-6 supplement [1] and the T-44C
// procedures brief [4]. `answer` is the call; `also` lists none.
export const CALLS = [
  { q: 'You are wing in cloud and lose sight of lead. After going to instruments, what do you say?', answer: '“Angry 1-2, lost sight, (altitude)”', why: 'Instruments, call with altitude, and smoothly take off about 10% power, all nearly at once. [1, p. 7]' },
  { q: 'You are wing in clear air and cannot see lead. What do you say?', answer: '“Angry 1-2, blind, (altitude)”', why: 'Blind is the visual-conditions call; lead talks you on with the clock method, or deconflicts by altitude if both are blind. [1, p. 7]' },
  { q: 'Lead says “Angry, push UHF TAC”. What does the wing say on the new frequency?', answer: '“Angry 1-2”', why: 'Lead checks the flight in on the new frequency and each aircraft answers with its own call sign. [1, p. 10]' },
  { q: 'You are wing, passed lead and are sliding out ahead of lead’s turn. After stepping down, levelling and idling, what do you say?', answer: '“Underrunning”', why: 'Lower, level, idle, call, then join in the assigned position once relative motion is under control. [4, Safety procedures]' },
  { q: 'Lead directs a tactical turn: “Stingray 11, tac left, 090.” What do you answer?', answer: '“Two”', why: 'In tactical formation the maneuver starts when Dash-2 says “Two”. [4, Maneuver contracts]' },
  { q: 'Lead directs an ops check. Wing goes first. What does wing say?', answer: '“Angry 1-2, (fuel), good G’s”', why: 'Fuel rounded down to the nearest tenth, then G’s, wing first. [1, p. 4]' },
];
export const CALL_OPTIONS = CALLS.map((c) => c.answer);
