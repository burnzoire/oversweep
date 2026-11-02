// Presentation for the Attitude Instrument Flying module: the flyable panel
// (Figure 1), the crosscheck (Figure 2), the unusual attitude pictures
// (Figure 3) and the terms quiz. The flight model is attitude-model.mjs.
import { RECOVERIES, UNUSUAL, hubAndSpoke, initialState, levelTrim, standardRateBank, step } from './attitude-model.mjs';
import { drawPanel } from '../shared/instruments.mjs';
import { quickQuiz, shuffle, termQuiz } from '../shared/quick-quiz.mjs';

const r0 = (v) => Math.round(v).toLocaleString('en-US');
const three = (v) => String(Math.round(((v % 360) + 360) % 360) || 360).padStart(3, '0');
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const para = (text, cls) => Object.assign(document.createElement('p'), { textContent: text, className: cls ?? '' });

// Run `tick(dt)` on animation frames while the figure is on screen.
function loop(root, tick) {
  let last, visible = true, id;
  const frame = (now) => {
    const dt = last === undefined ? 0 : Math.min(0.1, (now - last) / 1000);
    last = now;
    if (visible) tick(dt);
    id = requestAnimationFrame(frame);
  };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = undefined; }).observe(root);
  id = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(id);
}

/* ---------- Figure 1: control and performance ---------- */
function setupPanel(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const f = (name) => root.querySelector(`[name="${name}"]`);
  const show = (name, text) => { const o = root.querySelector(`output[for="${name}"]`); if (o) o.textContent = text; };
  let s = initialState();
  const set = (v) => { for (const [k, x] of Object.entries(v)) f(k).value = String(Math.round(x * 2) / 2); };
  set({ pitch: s.pitch, bank: 0, power: s.power });
  const presets = {
    level: () => { const t = levelTrim(250); set({ pitch: t.pitch, bank: 0, power: t.power }); },
    climb: () => set({ pitch: 10, bank: 0, power: 90 }),
    descend: () => set({ pitch: -3, bank: 0, power: 45 }),
    turn: () => set({ bank: Math.round(standardRateBank(s.speed)) }),
    reset: () => { s = initialState(); set({ pitch: s.pitch, bank: 0, power: s.power }); },
  };
  for (const b of root.querySelectorAll('[data-preset]')) b.addEventListener('click', () => presets[b.dataset.preset]());
  let shown = 0;
  loop(root, (dt) => {
    const input = { pitch: +f('pitch').value, bank: +f('bank').value, power: +f('power').value };
    s = step(s, input, dt);
    if (s.altitude < 1000) s.altitude = 1000;
    show('pitch', `${input.pitch > 0 ? '+' : ''}${input.pitch}°`);
    show('bank', `${Math.abs(input.bank)}° ${input.bank < 0 ? 'left' : input.bank > 0 ? 'right' : ''}`);
    show('power', `${input.power}%`);
    drawPanel(svg, s);
    shown += dt;
    if (shown < 0.25 && dt) return;
    shown = 0;
    const settled = Math.abs(s.vs - s.vsi) < 100;
    out.replaceChildren(
      para(`Attitude ${s.pitch >= 0 ? '+' : ''}${s.pitch.toFixed(1)}°, bank ${Math.abs(s.bank).toFixed(0)}°, power ${Math.round(s.power)}%: the control instruments show it at once.`),
      para(`${r0(s.speed)} KIAS, ${r0(s.altitude)} ft, heading ${three(s.heading)}, turning ${Math.abs(s.rate).toFixed(1)}°/s. Vertical speed ${r0(s.vs)} ft/min${settled ? '' : `, the VSI still catching up at ${r0(s.vsi)}`}.`, 'derived'),
    );
  });
}

/* ---------- Figure 2: the crosscheck ---------- */
function setupScan(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const buttons = [...root.querySelectorAll('[data-mode]')];
  // Fixation: the unnoticed bank lets the nose drop a little as well.
  const names = { adi: 'attitude indicator', alt: 'altimeter', hsi: 'heading', asi: 'airspeed', vsi: 'vertical speed', turn: 'turn and slip' };
  let mode = 'hub', s, k, held, order;
  function start(m) {
    mode = m;
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.mode === m));
    s = initialState({ heading: 90, bug: 90 });
    k = 0; held = 0; order = hubAndSpoke(1);
  }
  start('hub');
  for (const b of buttons) b.addEventListener('click', () => start(b.dataset.mode));
  const dwell = reduceMotion() ? 2 : 0.8;
  loop(root, (dt) => {
    held += dt;
    if (held >= dwell) { held = 0; k = (k + 1) % order.length; }
    // The hub-and-spoke pilot catches every drift at once. The fixated pilot
    // stares at the altimeter while a slow bank creeps in unnoticed.
    const fixated = mode === 'fix';
    const elapsed = s.t;
    const input = fixated
      ? { pitch: levelTrim(s.speed).pitch - Math.min(4, elapsed * 0.25), bank: Math.min(25, elapsed * 1.6), power: 70 }
      : { pitch: levelTrim(s.speed).pitch, bank: 0, power: 70 };
    s = step(s, input, dt);
    if (fixated && elapsed > 20) start('fix');
    const now = fixated ? 'alt' : order[k];
    drawPanel(svg, s, { highlight: now, groups: false });
    out.replaceChildren(fixated
      ? para(`Eyes on the altimeter for ${elapsed.toFixed(0)} s: bank has crept to ${s.bank.toFixed(0)}°, heading is ${three(s.heading)} against 090, and the altimeter is only now starting to unwind (${r0(s.altitude)} ft). The cause was on the attitude indicator all along.`)
      : para(`Now: the ${names[now]}. ${now === 'adi' ? 'Back to the hub: attitude first.' : 'Out to one spoke, then straight back to the attitude indicator.'} Heading ${three(s.heading)}, ${r0(s.altitude)} ft.`));
  });
}

/* ---------- Figure 3: unusual attitudes ---------- */
function setupUnusual(root) {
  const svg = root.querySelector('svg');
  const ui = { prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') };
  quickQuiz(ui, {
    items: UNUSUAL,
    show: (q, prompt) => {
      const st = initialState({ ...q.state, altitude: 8000, heading: 210 });
      if (!q.state.adiFailed) st.rate = (1091 * Math.tan(Math.max(-80, Math.min(80, q.state.bank)) * Math.PI / 180)) / q.state.speed;
      drawPanel(svg, st, { groups: false });
      prompt.textContent = 'You look up from the chart to this panel. What first?';
    },
    options: () => shuffle(RECOVERIES),
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct' : 'Not quite'}: ${q.label.toLowerCase()}. ${q.why}`,
  });
}

function setupTerms(root) { termQuiz(root, { hideTerm: true }); }

const blocks = { panel: setupPanel, scan: setupScan, unusual: setupUnusual, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
