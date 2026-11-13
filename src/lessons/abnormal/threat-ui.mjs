// Threat Avoidance module: Figure 1 (aimed AAA and the jink) and the quizzes.
import { jinkPicture } from './aaa-jink.mjs';
import { quickQuiz, termQuiz } from '../shared/quick-quiz.mjs';

const ft = (n) => `${Math.round(n).toLocaleString('en-US')} ft`;

function setupJink(root) {
  const inputs = Object.fromEntries([...root.querySelectorAll('input')].map((i) => [i.name, i]));
  const outs = Object.fromEntries([...root.querySelectorAll('output')].map((o) => [o.htmlFor.value, o]));
  const svg = root.querySelector('svg');
  const result = root.querySelector('[data-result]');
  const update = () => {
    const v = { speedKt: Number(inputs.speed.value), tofS: Number(inputs.tof.value), loadG: Number(inputs.g.value) };
    outs['jink-speed'].textContent = `${v.speedKt} kt`;
    outs['jink-tof'].textContent = `${v.tofS} s`;
    outs['jink-g'].textContent = v.loadG === 1 ? '1 g (no turn)' : `${v.loadG} g`;
    const g = jinkPicture(v);
    svg.querySelector('[data-track]').setAttribute('d', g.track);
    svg.querySelector('[data-predicted]').setAttribute('d', `M${g.X0} ${g.Y0} L${g.px} ${g.py}`);
    const aim = svg.querySelector('[data-aim]'), jet = svg.querySelector('[data-jet]');
    aim.setAttribute('cx', g.px); aim.setAttribute('cy', g.py);
    jet.setAttribute('cx', g.ax); jet.setAttribute('cy', g.ay);
    svg.querySelector('[data-offset]').setAttribute('d', `M${g.px} ${g.py} L${g.ax} ${g.ay}`);
    const verdict = g.r.offsetFt === 0
      ? 'Holding heading, height and speed, you arrive exactly where the gun aimed.'
      : `When the rounds arrive you are ${ft(g.r.offsetFt)} from the point the gun aimed at, having turned ${Math.round(g.r.headingChangeDeg)}°.`;
    result.textContent = `In ${v.tofS} s at ${v.speedKt} kt you fly ${ft(g.r.predictedFt)}. ${verdict}`;
  };
  Object.values(inputs).forEach((el) => el.addEventListener('input', update));
  update();
}

// Each question is tagged with the outcome it checks.
export const QUESTIONS = [
  { outcome: 1, ask: 'The major threat on your route is light AAA and MANPADS. Which altitude band does the F-16 handbook suggest?', options: ['Medium altitude', 'As low as possible', 'Exactly the threat ceiling'], answer: 'Medium altitude', why: 'Medium altitude avoids light AAA and MANPADS; low altitude puts you in the heart of the AAA engagement zones.' },
  { outcome: 1, ask: 'A ridge stands between you and the radar. What is that called?', options: ['Direct terrain masking', 'Indirect terrain masking', 'The Doppler notch'], answer: 'Direct terrain masking', why: 'The terrain blocks the line of sight. Indirect masking hides you in the return from terrain the beam also lights up.' },
  { outcome: 2, ask: 'Why does a command-guided SAM have a minimum range?', options: ['Its beacon is masked until booster separation, so it flies unguided for the first 2–3 seconds', 'Its seeker needs time to cool', 'Its warhead arms late'], answer: 'Its beacon is masked until booster separation, so it flies unguided for the first 2–3 seconds', why: 'The ground radar cannot capture and steer the missile until the beacon is uncovered.' },
  { outcome: 2, ask: 'A semi-active missile loses its Doppler lock. What usually follows?', options: ['It cannot regain the track and complete the intercept', 'It switches to infrared', 'It homes on the illuminator'], answer: 'It cannot regain the track and complete the intercept', why: 'A CW homing missile normally cannot regain target track after a break-lock.' },
  { outcome: 3, ask: 'Your warning receiver shows a SAM launch indication. What is the brevity word?', options: ['SINGER', 'MUD', 'DIRT', 'NAKED'], answer: 'SINGER', why: 'DIRT is search mode, MUD a ground threat with no launch indication or in track, NAKED no indications.' },
  { outcome: 3, ask: 'You start maneuvering against a SAM. What does the flight hear from you?', options: ['DEFENDING, your heading and your bullseye position', 'Nothing until it is over', 'BREAK'], answer: 'DEFENDING, your heading and your bullseye position', why: 'The reacting pilot tells the flight the heading and the type of reaction, because no one can watch the others during it.' },
  { outcome: 4, ask: 'Against a Doppler tracking radar, when does self-protection chaff work best?', options: ['With the threat on the beam', 'With the threat on the nose', 'With the threat on the tail'], answer: 'With the threat on the beam', why: 'Chaff stops dead in the air; a Doppler radar only loses you in it if your own speed toward it is also near zero, on the beam.' },
  { outcome: 4, ask: 'A SAM is confirmed guiding on you and you can see it. What is the last-ditch maneuver?', options: ['Put it at 3 or 9 o\'clock, then pull hard out of plane, perpendicular to its axis, until it overshoots', 'Roll wings level and run', 'Climb straight up'], answer: 'Put it at 3 or 9 o\'clock, then pull hard out of plane, perpendicular to its axis, until it overshoots', why: 'The F-16 basic employment manual trains a maneuver like it, the orthogonal break.' },
  { outcome: 5, ask: 'An infrared missile is launched at you. What does the electronic warfare text give as one tactic?', options: ['Dispense a flare at once and turn to put the missile on the beam', 'Select afterburner and climb', 'Hold heading and dispense chaff'], answer: 'Dispense a flare at once and turn to put the missile on the beam', why: 'The beam raises the missile\'s line-of-sight rate and separates you from the flare; afterburner makes the flare\'s job harder.' },
  { outcome: 5, ask: 'Why are infrared missiles hard to defeat in the first place?', options: ['They are passive, so there may be no warning at all', 'They are faster than radar missiles', 'They ignore flares'], answer: 'They are passive, so there may be no warning at all', why: 'The warning receiver sees nothing unless radar was used to acquire you; only a missile warning system or your eyes can tell you.' },
  { outcome: 6, ask: 'What does aimed AAA fire control assume about you?', options: ['Same heading, altitude and airspeed during the time of flight', 'That you will turn toward it', 'Nothing: it fires at random'], answer: 'Same heading, altitude and airspeed during the time of flight', why: 'Change any of them while the rounds are in the air and they arrive where you would have been.' },
  { outcome: 6, ask: 'Why does a curvilinear approach help in a gun-defended target area?', options: ['It keeps the final tracking solution short', 'It keeps you higher', 'It hides you from radar'], answer: 'It keeps the final tracking solution short', why: 'Heading, altitude, airspeed and G change until you roll out on final, so you track the target only briefly.' },
  { outcome: 7, ask: 'After the attack, what are the general egress priorities?', options: ['Leave the target area, get away from the threat envelope, regain mutual support', 'Rejoin first, then leave', 'Assess damage, then leave'], answer: 'Leave the target area, get away from the threat envelope, regain mutual support', why: 'In that order; a separated pilot follows the egress plan to the briefed rendezvous.' },
  { outcome: 7, ask: 'A helicopter crew sees tracers at 3 o\'clock. What are the three parts of its reaction?', options: ['Indication, evasive maneuver with countermeasures, actions on contact', 'Climb, call, continue', 'Hover, mask, fire'], answer: 'Indication, evasive maneuver with countermeasures, actions on contact', why: 'Mask behind terrain if it is right there; if not, maneuver and expend countermeasures, then decide to continue or abort.' },
];

function setupQuestions(root) {
  quickQuiz({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') }, {
    items: QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

const blocks = { jink: setupJink, questions: setupQuestions, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
