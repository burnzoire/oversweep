// Presentation for the Air-to-Air Refuelling Procedures figures and quizzes.
// Facts, positions and geometry come from lesson-model.mjs; this file reads
// inputs and draws.
import {
  BOOM, CALLS, CALL_OPTIONS, FLOWS, HOSE, SIGNALS, SIGNAL_OPTIONS,
  boomCall, boomStep, directorLights, hoseState, inEnvelope, rvDelta, spotOf,
} from './lesson-model.mjs';
import { el, jet } from '../shared/hsi.mjs';
import { quickQuiz, termQuiz, withDistractors } from '../shared/quick-quiz.mjs';

const ui = (root) => ({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') });
const press = (row, id) => { for (const b of row.children) b.setAttribute('aria-pressed', String(b.dataset.id === id)); };
const button = (label, id, onClick) => {
  const b = Object.assign(document.createElement('button'), { type: 'button', textContent: label });
  b.dataset.id = id;
  b.addEventListener('click', onClick);
  return b;
};

/* ---------- Figure 1: around the tanker ---------- */
const OX = 320, OY = 78;
const P = ([x, y]) => [OX + x, OY + y];

// A plan-view tanker, nose up, wing root at the origin.
function tankerPlan(kind) {
  const g = el('g', { class: 'tanker' });
  g.append(
    el('path', { class: 'body', d: `M${OX} ${OY - 72} q8 4 9 18 v108 l-4 10 h-10 l-4 -10 v-108 q1 -14 9 -18 z` }),
    el('path', { class: 'body', d: `M${OX - 8} ${OY - 14} L${OX - 108} ${OY + 24} L${OX - 108} ${OY + 31} L${OX - 8} ${OY + 12} Z M${OX + 8} ${OY - 14} L${OX + 108} ${OY + 24} L${OX + 108} ${OY + 31} L${OX + 8} ${OY + 12} Z` }),
    el('path', { class: 'body', d: `M${OX - 6} ${OY + 50} L${OX - 40} ${OY + 66} L${OX - 40} ${OY + 71} L${OX - 5} ${OY + 64} Z M${OX + 6} ${OY + 50} L${OX + 40} ${OY + 66} L${OX + 40} ${OY + 71} L${OX + 5} ${OY + 64} Z` }),
    el('line', { class: 'wingline', x1: OX - 230, y1: OY + 2, x2: OX + 230, y2: OY + 2 }),
    el('text', { class: 'lbl small', x: OX + 226, y: OY - 4, 'text-anchor': 'end' }, 'Wingline'),
  );
  if (kind === 'boom') g.append(el('line', { class: 'gear', x1: OX, y1: OY + 66, x2: OX, y2: OY + 102 }));
  if (kind === 'centre') g.append(el('line', { class: 'hose', x1: OX, y1: OY + 66, x2: OX, y2: OY + 114 }), el('circle', { class: 'drogue', cx: OX, cy: OY + 116, r: 5 }));
  if (kind === 'wing') for (const s of [-1, 1]) {
    g.append(el('rect', { class: 'gear', x: OX + s * 62 - 3, y: OY + 10, width: 6, height: 12 }));
    g.append(el('line', { class: 'hose', x1: OX + s * 62, y1: OY + 22, x2: OX + s * 62, y2: OY + 84 }), el('circle', { class: 'drogue', cx: OX + s * 62, cy: OY + 86, r: 5 }));
  }
  return g;
}

function setupFlow(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), row = root.querySelector('[data-choices]');
  const calls = root.querySelector('[data-calls]'), count = root.querySelector('[data-count]');
  const [back, next] = [root.querySelector('[data-back]'), root.querySelector('[data-next]')];
  svg.setAttribute('viewBox', '0 0 640 300');
  let kind = 'boom', step = 0;
  const draw = () => {
    const flow = FLOWS[kind], s = flow.steps[step];
    svg.replaceChildren(el('rect', { class: 'view', x: 0, y: 0, width: 640, height: 300 }), tankerPlan(kind));
    for (const [text, x, y, anchor] of [['ECHELON LEFT', -160, 112, 'middle'], ['ECHELON RIGHT', 160, 112, 'middle'], ['ASTERN', 0, 196, 'middle']]) {
      svg.append(el('text', { class: 'lbl small zone', x: OX + x, y: OY + y, 'text-anchor': anchor }, text));
    }
    for (const [who, spot] of Object.entries(s.at)) {
      const [x, y] = P(spotOf(spot));
      svg.append(jet(x, y, 0, 'acft rx', 1.5), el('text', { class: 'tag', x: x + 18, y: y + 4 }, who === 'A' ? 'Hawk 1' : 'Hawk 2'));
    }
    svg.append(el('text', { class: 'lbl small', x: 12, y: 290 }, 'Not to scale: the order of the flow, not distances.'));
    svg.setAttribute('aria-label', `${flow.name}, step ${step + 1}: ${s.title}. ${s.text}`);
    out.textContent = `${step + 1}. ${s.title}. ${s.text}`;
    calls.replaceChildren(...s.calls.map(([who, said]) => {
      const li = document.createElement('li');
      li.append(Object.assign(document.createElement('span'), { className: 'who', textContent: who }), ' ', Object.assign(document.createElement('span'), { className: 'said', textContent: said }));
      return li;
    }));
    count.textContent = `Step ${step + 1} of ${flow.steps.length} · ${flow.note}`;
    back.disabled = step === 0;
    next.disabled = step === flow.steps.length - 1;
    press(row, kind);
  };
  for (const [id, f] of Object.entries(FLOWS)) row.append(button(f.name, id, () => { kind = id; step = 0; draw(); }));
  back.addEventListener('click', () => { step = Math.max(0, step - 1); draw(); });
  next.addEventListener('click', () => { step = Math.min(FLOWS[kind].steps.length - 1, step + 1); draw(); });
  draw();
}

/* ---------- Side-view shapes ---------- */
// Both receivers are traced from NASA orthographic three-view drawings
// (public domain), nose left: the outline, the canopy glazing and the
// drawing's panel lines. Each is scaled to its figure and placed by its
// refuelling point.

// F-16: side view of NASA TP-1538 (1979), Figure 2, scaled to 49.5 ft at
// 4.2 px a foot. (0, 0) is the boom receptacle on the spine behind the
// canopy; its station is estimated, as the drawing does not mark it.
const F16_BODY = 'M109.6 -33.7 C109.6 -33.7 109.3 -34.0 109.3 -34.0 C109.3 -34.0 92.8 -33.6 92.8 -33.6 C92.8 -33.6 70.7 -11.4 62.0 -5.6 C53.4 0.1 44.9 -0.4 41.1 0.7 C37.3 1.8 41.2 1.0 39.4 1.1 C37.5 1.2 33.5 1.5 30.1 1.6 C26.7 1.7 21.4 1.7 19.1 1.7 C16.8 1.7 17.7 1.8 16.1 1.6 C14.5 1.4 12.3 0.9 9.8 0.6 C7.2 0.4 3.5 0.4 0.7 0.1 C-2.1 -0.1 -5.5 -0.7 -7.0 -0.9 C-8.6 -1.0 -7.6 -0.7 -8.6 -0.8 C-9.6 -0.9 -11.3 -1.2 -12.9 -1.5 C-14.5 -1.8 -15.7 -2.2 -18.2 -2.7 C-20.7 -3.1 -24.9 -3.8 -27.7 -4.1 C-30.5 -4.3 -32.9 -4.4 -35.1 -4.2 C-37.3 -4.1 -39.2 -3.5 -40.9 -2.9 C-42.7 -2.4 -44.1 -1.9 -45.7 -1.1 C-47.3 -0.2 -49.1 1.2 -50.6 2.1 C-52.1 3.1 -50.8 3.1 -54.8 4.4 C-58.7 5.6 -69.6 8.4 -74.3 9.7 C-79.1 11.1 -80.8 11.7 -83.1 12.5 C-85.3 13.3 -86.2 14.0 -88.0 14.4 C-89.7 14.7 -92.6 14.5 -93.6 14.6 C-94.6 14.7 -94.0 14.9 -94.0 14.9 C-94.0 14.9 -94.2 15.4 -94.2 15.4 C-94.2 15.4 -93.9 15.8 -93.8 15.9 C-93.6 16.1 -94.3 16.1 -93.1 16.2 C-92.0 16.2 -89.3 15.9 -86.9 16.0 C-84.6 16.1 -81.8 16.6 -79.2 16.8 C-76.5 16.9 -78.5 17.2 -71.0 16.9 C-63.5 16.7 -34.1 15.1 -34.1 15.1 C-34.1 15.1 -33.5 16.2 -33.5 16.2 C-33.5 16.2 -32.4 16.1 -32.1 16.2 C-31.7 16.3 -31.2 16.7 -31.2 16.7 C-31.2 16.7 -30.9 17.0 -30.8 17.9 C-30.7 18.8 -30.7 21.3 -30.6 22.0 C-30.5 22.8 -30.4 22.3 -30.3 22.4 C-30.2 22.5 -43.2 22.8 -29.8 22.5 C-16.3 22.1 36.9 20.6 50.4 20.3 C63.9 20.0 50.2 19.7 51.3 20.7 C52.4 21.7 55.8 25.2 56.9 26.2 C58.1 27.1 56.4 26.7 58.3 26.3 C60.2 25.8 68.4 23.2 68.4 23.2 C68.4 23.2 68.7 23.2 68.8 22.7 C68.8 22.1 68.8 19.9 68.8 19.9 C68.8 19.9 64.7 20.2 69.2 19.6 C73.8 19.0 90.2 17.4 96.2 16.3 C102.1 15.2 104.8 12.9 104.8 12.9 C104.8 12.9 105.2 13.1 105.2 11.7 C105.2 10.3 104.8 4.5 104.8 4.5 C104.8 4.5 96.8 1.9 95.0 1.4 C93.2 0.9 93.9 1.4 93.9 1.4 C93.9 1.4 93.6 1.0 93.6 1.0 C93.6 1.0 94.7 0.6 95.1 0.3 C95.5 -0.0 95.8 0.3 96.0 -0.8 C96.2 -1.9 95.8 -4.7 96.2 -6.4 C96.7 -8.1 98.1 -10.0 98.7 -11.1 C99.2 -12.2 98.5 -11.0 99.5 -13.2 C100.6 -15.5 103.3 -21.3 105.0 -24.7 C106.7 -28.1 109.6 -33.7 109.6 -33.7 Z';
const F16_CANOPY = 'M-50.7 3.4 C-51.4 4.1 -50.0 3.7 -48.2 3.8 C-46.4 3.8 -45.9 4.4 -40.1 3.7 C-34.3 2.9 -17.5 0.2 -13.5 -0.6 C-9.5 -1.5 -14.6 -1.1 -16.1 -1.5 C-17.7 -1.8 -20.4 -2.2 -22.9 -2.6 C-25.3 -2.9 -28.5 -3.3 -30.7 -3.4 C-32.9 -3.5 -34.6 -3.3 -36.1 -3.1 C-37.6 -3.0 -38.4 -2.8 -39.7 -2.4 C-41.1 -2.0 -42.3 -1.7 -44.1 -0.7 C-45.9 0.3 -50.0 2.6 -50.7 3.4 Z';
const F16_DETAIL = 'M57.4 26.3 L57.8 26.3 L57.6 26.1 L57.9 25.7 L58.4 25.7 L57.7 25.9 L57.3 25.6 L57.7 25.9 Z M-25.8 21.9 L-27.5 22.0 Z M-25.2 21.9 L-21.7 21.8 Z M-21.1 21.7 L-16.9 21.6 Z M-11.1 21.5 L-15.6 21.5 Z M-8.0 21.3 L-6.2 21.3 Z M-30.1 20.7 L-30.1 21.9 L-29.7 21.9 L-30.1 21.9 Z M68.7 19.1 L68.4 18.9 L68.3 18.0 L50.1 18.3 L49.6 18.5 L49.2 18.4 L49.7 18.6 L49.8 19.0 L50.4 19.6 L51.1 19.9 L50.5 19.6 L49.8 18.9 L49.8 18.4 L68.3 18.0 L68.1 22.7 L68.2 19.2 L68.4 18.9 Z M-30.7 16.2 L-30.2 17.4 L-30.1 19.2 L-30.2 17.4 Z M-89.5 15.4 L-88.1 15.2 L-87.1 15.4 L-88.1 15.2 Z M99.7 14.4 L98.1 15.0 Z M-25.2 14.1 L-25.2 14.6 L-25.6 14.8 L-29.9 15.0 L-30.2 14.7 L-29.8 14.3 Z M-25.2 14.2 L-24.3 13.9 L-23.0 13.9 L-22.9 14.6 L-25.1 14.7 Z M-23.3 12.9 L-21.8 12.8 L-21.7 13.5 L-22.8 13.8 Z M18.2 10.7 L18.1 11.3 L16.8 11.2 L16.6 11.0 L16.9 10.6 Z M52.9 9.7 L53.7 9.4 L59.1 9.3 L59.3 10.7 L54.4 11.1 Z M76.6 9.5 L76.8 9.2 L86.0 8.7 L93.2 8.7 L101.8 9.3 L102.0 11.9 L101.8 12.5 L92.4 12.7 L90.7 12.4 L90.5 12.1 L88.4 12.0 L85.9 11.4 L76.8 9.9 Z M5.0 10.5 L5.5 9.8 L7.1 9.5 L15.5 8.6 L33.7 8.4 L37.5 8.6 L37.8 8.8 L37.6 9.2 L24.1 10.5 L18.2 10.7 L17.8 10.5 L15.8 11.0 L14.8 10.8 L9.7 10.6 L5.2 10.7 Z M-20.9 8.3 L-21.0 9.2 L-24.4 9.3 L-25.4 9.0 L-25.1 8.5 L-21.5 8.2 Z M-20.9 9.1 L-20.9 8.2 L-20.6 8.1 L-15.3 8.1 L-15.4 8.8 Z M-15.3 8.6 L-15.1 7.9 L-14.2 7.9 L-13.8 8.2 L-14.2 8.6 Z M-11.3 8.2 L-13.8 8.2 L-14.2 7.9 L-20.6 8.1 L-25.1 8.5 L-25.8 9.0 L-27.5 8.9 L-25.5 8.9 L-25.2 9.3 L-23.7 9.3 L-15.4 8.8 L-14.1 8.6 L-13.8 8.2 Z M59.2 7.4 L59.1 9.3 L53.7 9.4 L52.9 9.7 L52.0 9.5 L47.1 10.0 L33.0 10.6 L23.5 11.2 L23.1 11.5 L18.2 11.3 L18.3 10.6 L24.1 10.5 L37.6 9.2 L37.9 8.8 L51.7 7.8 L52.6 7.4 Z M59.1 5.9 L59.0 7.3 L54.4 7.5 L52.6 7.4 L52.8 6.9 L53.9 5.9 Z M59.1 5.9 L56.8 5.7 L53.9 5.9 L52.8 6.9 L52.5 7.4 L50.9 7.9 L39.5 8.8 L33.7 8.4 L15.5 8.6 L7.1 9.5 L5.5 9.8 L4.7 10.5 L4.1 10.4 L1.0 10.9 L-6.2 11.5 L-12.3 11.6 L-12.5 11.3 L-12.5 11.6 L-34.7 12.0 L-37.3 11.8 L-39.9 11.9 L-40.3 12.2 L-53.0 11.9 L-40.3 12.2 L-39.8 12.7 L-37.7 12.8 L-24.9 12.7 L-23.3 12.9 L-23.6 13.9 L-25.2 14.1 L-29.8 14.3 L-30.2 14.7 L-32.8 14.8 L-33.4 14.4 L-38.1 14.6 L-33.4 14.4 L-32.8 14.8 L-33.2 15.2 L-33.2 15.8 L-33.2 15.3 L-32.7 14.8 L-30.2 14.7 L-29.9 15.0 L-13.0 14.1 L-12.6 14.0 L-22.2 14.6 L-22.3 13.8 L-21.0 13.6 L-20.6 13.1 L-18.4 13.4 L-12.6 12.7 L-19.1 13.4 L-19.5 13.1 L-20.7 13.1 L-20.9 12.8 L-24.9 12.7 L-39.8 12.7 L-40.2 12.2 L-39.9 11.9 L-37.3 11.8 L-24.4 11.9 L-8.1 11.6 L-1.4 11.2 L4.1 10.4 L5.0 10.5 L5.2 10.7 L14.8 10.8 L18.8 11.5 L23.1 11.5 L23.5 11.2 L47.1 10.0 L52.0 9.5 L52.8 9.7 L53.1 10.1 L54.4 11.1 L59.2 10.8 Z M104.4 4.9 L104.5 12.0 Z M102.0 11.9 L101.9 7.4 L95.4 6.9 L95.2 3.1 L94.8 1.9 L95.2 3.1 L95.2 6.9 L88.2 6.7 L94.4 6.7 L96.2 7.0 L101.7 7.3 L102.0 7.6 L101.8 9.3 L93.2 8.7 L82.2 8.9 L76.8 9.2 L76.5 9.5 L73.0 9.3 L76.4 9.4 L76.8 9.9 L85.9 11.4 L88.4 12.0 L90.5 12.1 L90.7 12.4 L92.4 12.7 L95.4 12.7 L95.6 15.5 L95.2 15.8 L97.3 15.4 L95.9 15.8 L95.6 15.6 L95.6 12.7 L101.8 12.5 Z M2.1 0.7 L10.8 1.4 Z M93.1 0.4 L91.7 0.2 L87.8 0.8 L85.0 0.6 L43.2 1.1 L43.0 0.7 L43.0 1.1 L40.2 1.4 L42.1 1.1 L79.2 0.9 L85.0 0.6 L89.0 0.7 L89.4 1.1 L92.8 1.4 L89.4 1.1 L89.1 0.8 L89.6 0.4 L92.2 0.2 L92.8 0.5 Z M-19.4 -2.3 L-17.3 -1.9 Z M-54.2 4.8 L-51.8 4.0 L-49.1 4.3 L-39.6 4.0 L-23.5 1.4 L-22.4 1.4 L-20.7 0.9 L-14.2 0.2 L-11.9 -0.4 L-7.7 -0.2 L-2.7 0.3 L-7.7 -0.2 L-11.9 -0.4 L-12.3 -0.9 L-15.3 -1.5 L-12.3 -0.9 L-12.0 -0.4 L-14.2 0.2 L-20.7 0.9 L-22.4 1.4 L-23.5 1.4 L-39.6 4.0 L-49.1 4.3 L-51.7 4.0 L-51.5 3.3 L-46.2 -0.1 L-43.9 -1.2 L-40.0 -2.6 L-45.9 -0.2 L-51.5 3.3 L-51.9 4.1 Z M-30.3 -3.6 L-24.9 -3.0 Z M-35.7 -3.5 L-33.6 -3.7 L-30.8 -3.6 L-33.6 -3.7 Z M98.9 -13.1 L97.1 -9.5 Z M107.9 -31.5 L107.7 -31.2 L102.9 -31.2 L102.3 -30.9 L95.5 -20.5 L93.2 -17.3 L91.9 -15.0 L91.3 -14.7 L90.1 -12.4 L89.4 -11.7 L88.2 -9.7 L87.6 -9.1 L86.5 -7.1 L86.3 -6.3 L84.4 -6.0 L67.0 -5.8 L84.4 -6.0 L90.1 -6.3 L95.4 -6.3 L95.7 -3.9 L95.5 -1.1 L95.7 -3.9 L95.5 -6.4 L96.2 -7.4 L95.4 -6.3 L86.5 -6.3 L86.5 -7.1 L87.6 -9.1 L88.2 -9.7 L89.4 -11.7 L90.0 -12.2 L91.3 -14.7 L91.9 -15.0 L93.2 -17.3 L95.5 -20.5 L102.3 -30.9 L102.9 -31.2 L107.5 -31.2 L107.6 -30.7 L107.2 -30.1 Z M100.6 -33.3 L102.3 -33.3 Z';
function boomReceiver(x, y) {
  const g = el('g', { transform: `translate(${x} ${y})` });
  g.append(el('path', { class: 'acft rx', d: F16_BODY }), el('path', { class: 'detail', d: F16_DETAIL }), el('path', { class: 'canopy', d: F16_CANOPY }));
  g.append(el('circle', { class: 'receptacle', cx: 0, cy: 0, r: 2.5 }));
  return g;
}

// F/A-18: side view of the F-18 HARV spin-model three-view in NASA
// CR-201687 (1997), Figure 1, scaled to 17.07 m at 12 px a metre. The
// drawing has no probe, so the extended probe is drawn in an approximate
// position, ahead of the windscreen. (0, 0) is the probe tip.
const FA18_BODY = 'M186.1 12.1 C186.1 12.1 185.9 11.8 185.9 11.8 C185.9 11.8 180.7 11.1 180.7 11.1 C180.7 11.1 180.5 11.3 180.5 10.7 C180.4 10.1 180.4 7.5 180.4 7.5 C180.4 7.5 179.9 7.1 179.3 6.8 C178.7 6.5 177.7 6.1 176.9 5.9 C176.0 5.7 175.9 5.6 174.4 5.4 C172.9 5.2 170.7 4.8 167.8 4.7 C165.0 4.5 157.3 4.3 157.3 4.3 C157.3 4.3 156.6 7.6 157.3 4.0 C157.9 0.5 160.7 -12.9 161.5 -17.2 C162.3 -21.5 162.3 -21.8 162.3 -21.8 C162.3 -21.8 164.0 -22.1 161.6 -22.1 C159.3 -22.2 150.7 -22.1 148.4 -22.1 C146.0 -22.1 149.3 -23.5 147.6 -21.9 C145.9 -20.3 141.0 -15.1 138.3 -12.3 C135.7 -9.5 133.8 -7.2 131.8 -5.0 C129.7 -2.9 126.2 0.7 126.2 0.7 C126.2 0.7 116.8 -0.4 112.3 -0.8 C107.8 -1.1 107.6 -1.3 99.4 -1.6 C91.3 -1.9 70.6 -2.2 63.3 -2.7 C56.1 -3.2 58.6 -3.9 56.2 -4.3 C53.8 -4.8 51.0 -5.2 49.0 -5.4 C47.1 -5.7 46.4 -5.7 44.6 -5.8 C42.9 -5.9 39.8 -5.9 38.5 -5.8 C37.1 -5.7 37.3 -5.6 36.4 -5.4 C35.6 -5.1 36.0 -5.5 33.3 -4.3 C30.7 -3.1 26.1 0.1 20.4 1.8 C14.6 3.5 3.5 5.2 -1.0 6.1 C-5.4 7.1 -4.5 6.9 -6.3 7.5 C-8.2 8.0 -10.3 8.7 -11.9 9.2 C-13.5 9.8 -15.0 10.4 -16.0 10.9 C-17.0 11.3 -17.7 11.6 -18.1 11.9 C-18.5 12.2 -18.6 12.8 -18.6 12.8 C-18.6 12.8 -18.5 13.3 -18.3 13.6 C-18.0 13.9 -17.8 14.2 -17.2 14.4 C-16.7 14.7 -15.9 14.9 -14.9 15.1 C-14.0 15.4 -13.0 15.6 -11.3 15.9 C-9.6 16.2 -7.2 16.5 -4.6 16.8 C-2.0 17.1 1.0 17.5 4.5 17.7 C8.0 17.9 9.5 18.0 16.6 18.1 C23.7 18.1 39.2 17.9 47.1 17.9 C54.9 17.9 58.2 18.0 63.6 18.1 C69.1 18.2 75.7 18.4 79.9 18.5 C84.0 18.7 86.8 18.8 88.5 19.1 C90.2 19.3 89.3 19.7 89.9 20.0 C90.6 20.4 91.7 20.9 92.5 21.2 C93.3 21.5 93.8 21.6 94.6 21.8 C95.3 21.9 94.6 22.0 97.2 22.0 C99.8 22.1 102.0 22.4 110.1 22.0 C118.2 21.6 135.8 20.4 145.8 19.6 C155.9 18.8 165.9 17.6 170.5 17.1 C175.0 16.6 172.1 16.9 173.1 16.7 C174.2 16.5 175.6 16.2 176.7 15.9 C177.9 15.5 179.5 14.9 180.1 14.7 C180.7 14.4 180.4 14.3 180.4 14.3 C180.4 14.3 180.4 13.0 180.5 12.7 C180.5 12.4 180.6 12.5 180.6 12.5 C180.6 12.5 184.7 12.5 185.6 12.5 C186.5 12.5 186.0 12.4 186.0 12.4 C186.0 12.4 186.1 12.1 186.1 12.1 Z';
const FA18_CANOPY = 'M22.6 1.8 C22.0 2.7 27.3 2.2 29.1 2.3 C31.0 2.4 30.3 2.6 33.9 2.1 C37.5 1.7 46.3 0.5 50.9 -0.3 C55.5 -1.0 60.9 -1.7 61.6 -2.3 C62.4 -2.8 57.4 -3.3 55.5 -3.6 C53.6 -4.0 52.0 -4.2 50.3 -4.4 C48.6 -4.6 47.3 -4.8 45.3 -4.8 C43.3 -4.9 40.1 -5.0 38.5 -4.9 C37.0 -4.8 36.9 -4.6 36.0 -4.3 C35.1 -4.0 35.2 -4.2 33.0 -3.2 C30.8 -2.2 23.2 0.9 22.6 1.8 Z';
const FA18_DETAIL = 'M179.9 12.3 L179.8 14.2 L175.5 15.6 L172.8 16.2 L172.4 16.1 L172.4 12.2 L179.1 12.1 Z M150.8 11.1 L151.1 10.8 L152.0 10.7 L161.1 10.5 L178.0 11.1 L179.9 11.3 L180.2 11.5 L179.7 12.2 L164.5 12.2 L151.1 11.6 Z M92.6 10.4 L92.7 9.6 L94.6 9.9 L94.4 10.5 Z M78.6 17.9 L78.6 9.1 L84.6 9.3 L87.6 9.2 L87.8 9.5 L92.7 9.7 L92.7 10.2 L92.5 10.5 L89.6 10.6 L88.4 10.9 L88.2 11.1 L88.2 16.3 L88.6 18.2 L88.4 18.5 L79.0 18.1 Z M104.6 8.7 L105.1 8.6 L106.5 8.8 L112.1 10.1 L112.7 10.1 L113.1 10.7 L112.9 11.0 L105.7 11.0 L105.6 10.0 L104.9 9.3 Z M121.5 7.7 L122.0 7.5 L126.7 8.0 L128.3 8.0 L132.2 8.3 L132.4 8.5 L131.7 9.7 L130.6 10.7 L125.9 10.8 L125.5 10.7 L125.2 10.1 L121.9 8.4 Z M100.7 7.7 L101.0 7.3 L114.7 7.2 L120.2 7.4 L121.5 7.7 L121.9 8.4 L125.2 10.1 L125.5 10.7 L125.0 10.9 L114.4 10.9 L113.2 10.7 L112.8 10.1 L112.1 10.1 L106.5 8.8 L103.3 8.6 L103.5 8.1 L103.2 8.6 L102.9 8.3 L101.0 8.1 Z M172.2 5.8 L173.5 5.8 L176.2 6.3 L177.9 6.7 L179.9 7.9 L179.9 11.2 L179.0 11.3 L172.3 10.9 Z M12.8 4.0 L12.9 16.6 L12.7 17.4 L4.7 17.1 L-8.7 15.8 L-14.6 14.7 L-16.8 14.0 L-17.7 13.4 L-18.1 12.9 L-18.1 12.7 L-17.6 12.2 L-11.6 9.6 L-6.1 7.9 L0.8 6.3 L2.6 6.0 L11.5 4.1 Z M172.4 16.1 L171.6 16.4 L165.4 17.1 L139.6 19.6 L133.5 19.8 L132.1 20.0 L128.2 20.2 L111.1 21.4 L97.2 21.5 L94.7 21.3 L92.9 20.8 L91.8 20.3 L91.4 19.9 L90.9 19.9 L90.2 19.6 L88.6 18.4 L88.2 16.3 L88.2 11.1 L88.4 10.9 L89.6 10.6 L94.5 10.5 L94.6 9.8 L99.8 10.2 L100.4 9.9 L99.8 10.2 L93.7 9.6 L87.8 9.5 L87.6 9.1 L87.9 8.7 L92.8 7.7 L95.2 7.5 L100.7 7.7 L101.0 8.1 L102.9 8.3 L103.1 8.5 L102.8 8.9 L102.0 9.0 L102.8 8.9 L103.2 8.6 L104.7 8.9 L105.6 10.4 L105.7 11.5 L105.4 12.8 L105.7 11.0 L112.9 11.0 L113.2 10.7 L114.4 10.9 L130.6 10.7 L131.7 9.7 L132.2 9.0 L132.3 8.4 L132.5 8.3 L130.9 8.3 L118.2 7.3 L102.8 7.2 L100.9 7.3 L100.7 7.7 L95.2 7.5 L92.8 7.7 L88.4 8.6 L87.3 9.2 L84.6 9.3 L68.9 8.7 L43.9 6.7 L29.4 6.0 L29.1 5.7 L29.4 5.3 L41.0 4.8 L52.7 4.6 L63.6 4.8 L67.5 5.0 L81.8 5.0 L112.5 4.4 L119.7 4.0 L123.7 3.6 L123.8 4.4 L122.8 4.6 L123.8 4.5 L127.7 4.8 L137.8 5.0 L156.5 4.8 L157.0 4.9 L165.4 5.1 L171.6 5.5 L172.3 5.8 L172.2 10.9 L156.3 10.5 L151.0 10.8 L150.7 11.1 L148.1 11.3 L150.8 11.1 L151.1 11.6 L160.9 12.1 L172.2 12.2 Z M25.4 2.8 L25.7 2.6 L26.6 2.6 L26.9 3.0 L26.5 3.4 L26.0 3.4 Z M44.7 1.9 L43.4 2.0 L43.1 1.7 L43.6 1.2 L44.4 1.2 Z M62.3 -1.6 L61.8 -1.0 L57.9 0.9 L48.0 1.6 L45.7 1.9 L44.8 1.9 L44.4 1.2 L57.2 -0.8 L61.4 -1.8 L62.0 -1.8 L62.1 -1.7 L61.9 -1.6 L61.9 -1.4 Z M12.8 17.3 L12.8 4.0 L13.3 3.7 L19.8 2.4 L21.6 2.2 L25.4 2.8 L25.8 3.3 L26.5 3.4 L27.0 2.9 L32.6 2.8 L43.1 1.7 L43.4 2.0 L44.4 2.0 L48.0 1.6 L57.9 0.9 L61.8 -1.0 L62.7 -1.9 L64.1 -2.1 L83.3 -1.7 L105.7 -0.7 L121.5 0.6 L125.8 1.2 L126.1 1.3 L126.0 1.6 L124.3 3.4 L123.8 3.7 L122.9 3.6 L119.7 4.0 L104.5 4.6 L81.8 5.0 L67.5 5.0 L63.6 4.8 L52.7 4.6 L41.0 4.8 L29.4 5.3 L29.0 5.7 L23.4 5.8 L29.1 5.7 L29.4 6.0 L42.0 6.6 L63.5 8.4 L73.3 9.0 L78.5 9.1 L78.6 17.8 L78.4 18.0 L70.3 17.6 L57.2 17.4 L16.6 17.5 Z M21.6 2.2 L21.9 1.6 L32.8 -3.5 L35.2 -4.4 L38.2 -5.3 L48.1 -5.0 L52.9 -4.4 L62.1 -2.5 L62.6 -1.9 L62.3 -1.7 L61.4 -1.8 L57.2 -0.8 L51.4 0.1 L43.5 1.2 L43.1 1.7 L35.5 2.5 L27.8 3.0 L26.9 2.9 L26.6 2.6 L25.6 2.6 L25.2 2.8 Z M159.9 -13.3 L160.1 -12.6 L159.7 -11.6 L158.0 -2.6 L157.8 -2.1 L156.7 4.6 L155.9 4.9 L150.2 4.9 L150.4 3.3 L150.6 3.0 L151.8 -1.1 L155.9 -13.1 L156.3 -13.3 Z M185.5 12.2 L180.6 11.9 L179.9 11.3 L179.9 7.9 L178.8 7.1 L176.7 6.4 L173.5 5.8 L169.3 5.3 L165.4 5.1 L157.0 4.9 L156.5 4.8 L159.7 -11.6 L160.1 -12.6 L159.9 -13.3 L160.2 -13.6 L161.8 -21.6 L160.1 -13.5 L159.8 -13.3 L156.3 -13.3 L155.9 -13.0 L155.1 -10.3 L154.8 -9.8 L154.3 -8.0 L151.5 -0.2 L150.6 3.0 L150.4 3.3 L150.0 4.9 L137.8 5.0 L123.8 4.5 L123.8 3.7 L124.3 3.4 L126.1 1.3 L126.9 0.9 L140.3 -13.6 L148.2 -21.7 L148.0 -21.7 L138.7 -11.9 L126.8 1.0 L126.2 1.3 L121.5 0.6 L101.3 -0.9 L65.4 -2.1 L62.6 -1.9 L62.3 -2.5 L52.9 -4.4 L48.1 -5.0 L38.2 -5.3 L36.7 -4.9 L32.8 -3.5 L21.9 1.6 L21.5 2.2 L19.8 2.4 L13.3 3.7 L12.8 4.0 L11.5 4.1 L2.6 6.0 L0.8 6.3 L-6.3 8.0 L-11.6 9.6 L-14.6 10.8 L-17.8 12.3 L-18.1 12.9 L-17.8 13.4 L-16.8 14.0 L-11.1 15.4 L-4.0 16.4 L4.7 17.1 L16.6 17.5 L57.2 17.4 L70.3 17.6 L77.5 18.0 L78.6 17.9 L79.0 18.1 L84.6 18.2 L87.8 18.5 L88.8 18.4 L89.9 19.4 L90.9 19.9 L91.4 19.9 L92.0 20.4 L93.3 20.9 L94.7 21.3 L99.9 21.5 L113.8 21.2 L128.2 20.2 L132.1 20.0 L133.5 19.8 L139.6 19.6 L165.4 17.1 L173.8 16.0 L178.2 14.9 L179.9 14.1 L179.8 12.2 L180.6 11.9 Z';
function probeReceiver(x, y) {
  const g = el('g', { transform: `translate(${x} ${y})` });
  g.append(el('path', { class: 'acft rx', d: FA18_BODY }), el('path', { class: 'detail', d: FA18_DETAIL }), el('path', { class: 'canopy', d: FA18_CANOPY }));
  g.append(el('line', { class: 'probe', x1: 20, y1: 3, x2: 0, y2: 0 }));
  return g;
}

/* ---------- Figure 2: boom, astern to contact ---------- */
const PX = 4.2; // pixels per foot
const NOZZLE = [318, 128]; // the contact point on screen

function pdlArray(x, label, top, bottom, ax, lit) {
  const g = el('g');
  g.append(el('text', { class: 'lbl small light', x: x + 9, y: 194, 'text-anchor': 'middle' }, label));
  g.append(el('text', { class: 'lbl small light', x: x + 9, y: 208, 'text-anchor': 'middle' }, top));
  // Five segments: large and small correction one way, on the spot, small
  // and large the other way.
  const order = [[top, 2], [top, 1], [null, 0], [bottom, 1], [bottom, 2]];
  order.forEach(([cmd, size], i) => {
    const on = lit && ax.cmd === cmd && ax.size === size;
    g.append(el('rect', { class: `seg${on ? ' on' : ''}${cmd === null ? ' mid' : ''}`, x, y: 214 + i * 13, width: 18, height: 10 }));
  });
  g.append(el('text', { class: 'lbl small light', x: x + 9, y: 292, 'text-anchor': 'middle' }, bottom));
  return g;
}

function setupBoom(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), said = root.querySelector('[data-said]');
  svg.setAttribute('viewBox', '0 0 640 300');
  let pos, cleared, contact, fuel, breakaway, timer;
  const reset = () => { pos = { ...BOOM.astern }; cleared = contact = false; fuel = 0; breakaway = false; };
  reset();
  const draw = (msg, call) => {
    const lights = directorLights(pos);
    const rx = NOZZLE[0] + pos.x * PX, ry = NOZZLE[1] + pos.z * PX;
    svg.replaceChildren(el('rect', { class: 'sky', x: 0, y: 0, width: 640, height: 300 }));
    // Tanker belly and tail, nose to the left, off the top edge.
    svg.append(el('path', { class: 'body', d: 'M0 0 H260 l20 30 h-40 q-120 18 -240 18 z' }));
    svg.append(el('line', { class: 'stripe', x1: 0, y1: 44, x2: 230, y2: 32 }));
    // Pilot director lights under the forward fuselage, drawn as one bar.
    svg.append(el('rect', { class: `pdl${cleared ? ' on' : ''}${breakaway ? ' flash' : ''}`, x: 70, y: 40, width: 60, height: 6 }));
    svg.append(el('text', { class: 'lbl small', x: 100, y: 62, 'text-anchor': 'middle' }, 'Pilot director lights'));
    // The boom: from the tail, telescoped to the receptacle in contact.
    const end = contact ? [rx, ry] : [NOZZLE[0] - 14, NOZZLE[1] - 8];
    svg.append(el('line', { class: 'boom', x1: 248, y1: 34, x2: end[0], y2: end[1] }), el('circle', { class: 'nozzle', cx: end[0], cy: end[1], r: 3 }));
    svg.append(boomReceiver(rx, ry));
    // Envelope and astern marks (invented sizes).
    svg.append(el('rect', { class: 'envelope', x: NOZZLE[0] - BOOM.envelope.x * PX, y: NOZZLE[1] - BOOM.envelope.z * PX, width: 2 * BOOM.envelope.x * PX, height: 2 * BOOM.envelope.z * PX }));
    svg.append(el('circle', { class: 'astern', cx: NOZZLE[0] + BOOM.astern.x * PX, cy: NOZZLE[1] + BOOM.astern.z * PX, r: 6 }));
    svg.append(el('text', { class: 'lbl small', x: NOZZLE[0] + BOOM.astern.x * PX, y: NOZZLE[1] + BOOM.astern.z * PX - 12, 'text-anchor': 'middle' }, 'Astern'));
    svg.append(el('text', { class: 'lbl small', x: NOZZLE[0], y: NOZZLE[1] - BOOM.envelope.z * PX - 6, 'text-anchor': 'middle' }, 'Contact'));
    svg.append(el('circle', { class: 'receptacle', cx: rx, cy: ry, r: 2.5 }));
    // The lights as the receiver reads them, in an inset.
    svg.append(el('rect', { class: 'inset', x: 10, y: 180, width: 110, height: 116 }));
    svg.append(pdlArray(24, 'Elevation', 'UP', 'DOWN', lights.elevation, cleared && !breakaway));
    svg.append(pdlArray(78, 'Fore–aft', 'FWD', 'AFT', lights.fore, cleared && !breakaway));
    svg.append(el('text', { class: 'lbl small', x: 630, y: 290, 'text-anchor': 'end' }, `${Math.round(pos.x)} ft aft, ${Math.round(pos.z)} ft below the contact position${fuel ? ` · fuel ${fuel} lb` : ''}`));
    said.textContent = call ?? '';
    out.textContent = msg;
    svg.setAttribute('aria-label', `Boom refuelling, side view. ${msg}`);
  };
  const status = () => {
    if (breakaway) return ['Breakaway: disconnect, move back and descend clear of the tanker and the boom. Flashing director lights are the silent breakaway signal.', '“Shell 6, breakaway, breakaway, breakaway.”'];
    if (contact) return [`In contact${fuel ? ', fuel flowing' : ''}. Hold the picture on the tanker itself; the director lights confirm it.`, null];
    if (!cleared) {
      const atAstern = Math.abs(pos.x - BOOM.astern.x) <= 2 && Math.abs(pos.z - BOOM.astern.z) <= 2;
      return [atAstern ? 'Stabilized astern with zero closure. Ask to be cleared.' : 'Fly back to the astern position and stabilize.', null];
    }
    const call = boomCall(pos);
    return [`Cleared to contact: the director lights now show your error, as in the sims. ${call ? '' : 'On the spot: hold it while the boom operator flies the boom in.'}`, call ? `Boom operator: “${call}.”` : null];
  };
  const move = (dx, dz) => {
    if (breakaway) return;
    const step = boomStep(pos);
    pos = { x: pos.x + dx * step, z: pos.z + dz * step };
    if (!cleared && pos.x < BOOM.astern.x - 5) { pos = { ...BOOM.astern }; return draw('Not cleared yet: you moved forward of astern. Return to astern and stabilize first.', 'Boom operator: “Return to astern.”'); }
    if (pos.x < BOOM.inner) {
      breakaway = true;
      const [m, c] = status();
      draw(`Too far forward, past the inner limit. ${m}`, c);
      clearTimeout(timer);
      timer = setTimeout(() => { reset(); draw(...status()); }, 3000);
      return;
    }
    if (contact && !inEnvelope(pos)) { contact = false; fuel = 0; return draw('Outside the envelope: the boom disconnects. Fly back to the contact position, or drop back astern.', 'Boom operator: “Disconnect.”'); }
    if (cleared && !contact && Math.abs(pos.x) <= BOOM.onSpot && Math.abs(pos.z) <= BOOM.onSpot) { contact = true; fuel = 1000; return draw(...status(), 'Boom operator: “Shell 6, contact.”'); }
    if (contact) fuel += 500;
    draw(...status());
  };
  const bind = (sel, fn) => root.querySelector(sel).addEventListener('click', fn);
  bind('[data-move="forward"]', () => move(-1, 0));
  bind('[data-move="aft"]', () => move(1, 0));
  bind('[data-move="up"]', () => move(0, -1));
  bind('[data-move="down"]', () => move(0, 1));
  bind('[data-clear]', () => {
    if (breakaway || cleared) return;
    const atAstern = Math.abs(pos.x - BOOM.astern.x) <= 2 && Math.abs(pos.z - BOOM.astern.z) <= 2;
    if (!atAstern) return draw('Only from a stable astern position. Fly back to astern first.', null);
    cleared = true;
    const [m] = status();
    draw(m, 'Tanker: “Hawk 1, clear contact.”');
  });
  bind('[data-disconnect]', () => { clearTimeout(timer); reset(); draw('Disconnected and back to astern; the boom retracts.', contact ? 'Hawk 1: “Disconnect.”' : null); });
  draw(...status());
}

/* ---------- Figure 3: probe and drogue ---------- */
const MPX = 12; // pixels per metre of hose travel
const TRAIL = [420, 150]; // the drogue at full trail

function setupDrogue(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  svg.setAttribute('viewBox', '0 0 640 260');
  let push = 0, engaged = false, whip = false, red = false, timer;
  const draw = (extra) => {
    const st = hoseState(push, engaged), light = red ? 'red' : st.light;
    const dx = TRAIL[0] - push * MPX;
    svg.replaceChildren(el('rect', { class: 'sky', x: 0, y: 0, width: 640, height: 260 }));
    svg.append(el('path', { class: 'body', d: 'M0 0 H200 q20 10 0 18 H0 z' }));
    // The pod or hose unit, with its three signal lights.
    svg.append(el('rect', { class: 'pod', x: 120, y: 36, width: 60, height: 18, rx: 8 }));
    ['red', 'amber', 'green'].forEach((c, i) => svg.append(el('circle', { class: `sig ${c}${light === c ? ' on' : ''}`, cx: 134 + i * 14, cy: 45, r: 4 })));
    // The hose, wavy if whipping.
    const mid = [(180 + dx) / 2, whip ? 150 : 100];
    const d = whip ? `M180 50 Q${mid[0] - 40} 170 ${mid[0]} ${mid[1] - 40} T${dx} ${TRAIL[1]}` : `M180 50 Q${mid[0]} ${mid[1] + 20} ${dx} ${TRAIL[1]}`;
    svg.append(el('path', { class: 'hose', d }));
    // The drogue: a cone opening aft.
    svg.append(el('path', { class: 'drogue', d: `M${dx} ${TRAIL[1] - 3} l22 -12 v30 l-22 -12 z` }));
    // The receiver: probe tip in the coupling when engaged, else ~5 ft aft.
    const tip = engaged ? [dx + 2, TRAIL[1]] : [dx + 2 + 1.5 * MPX, TRAIL[1] + 2];
    svg.append(probeReceiver(tip[0], tip[1]));
    svg.append(el('text', { class: 'lbl small', x: 140, y: 74, 'text-anchor': 'middle' }, 'Signal lights'));
    svg.append(el('text', { class: 'lbl small', x: 630, y: 250, 'text-anchor': 'end' }, `Hose pushed in ${push} m${st.fuel && !red ? ' · fuel flowing' : ''}`));
    out.textContent = extra ?? st.text;
    svg.setAttribute('aria-label', `Probe and drogue, side view. ${out.textContent}`);
  };
  const bind = (sel, fn) => root.querySelector(sel).addEventListener('click', () => { if (!red) fn(); });
  bind('[data-slow]', () => {
    whip = false;
    if (engaged) return draw('Already in contact: push forward to open the fuel valve.');
    engaged = true; draw();
  });
  bind('[data-fast]', () => {
    if (engaged) return draw('Already in contact.');
    whip = true;
    draw('Too fast. The hose drum’s response system absorbs the contact and damps whip only if excessive closure is avoided; a hard contact can break the probe nozzle or damage the drogue’s spokes. Drop back astern and close again slowly.');
  });
  bind('[data-in]', () => { if (!engaged) return draw('Make contact first.'); push += HOSE.step; draw(); });
  bind('[data-out]', () => {
    if (!engaged) return draw('Astern already.');
    push = Math.max(0, push - HOSE.step);
    if (push === 0) { engaged = false; return draw('Back at full trail: the fuel valves close, then the coupling latches release the probe. You are astern again.'); }
    draw();
  });
  root.querySelector('[data-break]').addEventListener('click', () => {
    red = true; whip = false; engaged = false; push = 0;
    draw('Breakaway. Red light. Drop back quickly: the equipment senses the fast hose movement and brakes the drum, for a swift, positive disconnect well before full trail. Then move to a safe position, clear of the area behind the tanker and outboard of its wing.');
    clearTimeout(timer);
    timer = setTimeout(() => { red = false; draw(); }, 3500);
  });
  draw();
}

/* ---------- Figure 4: the point-parallel rendezvous ---------- */
function setupRv(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), row = root.querySelector('[data-choices]');
  const play = root.querySelector('[data-play]'), slider = root.querySelector('input[type="range"]');
  svg.setAttribute('viewBox', '0 0 640 260');
  const speeds = [300, 380, 450];
  let tanker = 380, rv, t, raf, last;
  const K = () => 560 / (rv.offsetNm + Math.abs(rv.at(0).receiver[1]) + 6);
  // Receiver flies left to right along the bottom track; north is to the right.
  const S = ([x, y]) => { const k = K(), y0 = rv.at(0).receiver[1] - 1; return [40 + (y - y0) * k, 200 - x * k]; };
  const draw = () => {
    const tStart = -2 / 60, tEnd = rv.turnH + 1.5 / 60;
    const now = rv.at(t);
    svg.replaceChildren(el('rect', { class: 'view', x: 0, y: 0, width: 640, height: 260 }));
    // Tracks: the receiver's, the tanker's reciprocal, and the turn.
    const pts = []; for (let s = tStart; s <= tEnd; s += (tEnd - tStart) / 120) pts.push(S(rv.at(s).tanker));
    svg.append(el('polyline', { class: 'track', points: pts.map((p) => p.join(',')).join(' ') }));
    const [r0, r1] = [S([0, rv.at(tStart).receiver[1]]), S([0, rv.at(tEnd).tanker[1] + 1])];
    svg.append(el('line', { class: 'track rx', x1: r0[0], y1: r0[1], x2: r1[0], y2: r1[1] }));
    // Range line at the turn.
    const [a, b] = [S(rv.at(0).tanker), S(rv.at(0).receiver)];
    svg.append(el('line', { class: 'range', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }));
    // Label a third of the way along from the left end, above the line, clear of the turn.
    const [l, r] = a[0] <= b[0] ? [a, b] : [b, a];
    svg.append(el('text', { class: 'lbl small', x: l[0] + (r[0] - l[0]) * 0.3 - 4, y: l[1] + (r[1] - l[1]) * 0.3 - 6, 'text-anchor': 'end' }, `Turn range ${rv.turnRangeNm.toFixed(1)} NM`));
    const [tx, ty] = S(now.tanker), [rx, ry] = S(now.receiver);
    // Headings: north (+y in the model) is to the right on screen.
    svg.append(jet(tx, ty, 90 - now.tankerHdg, 'acft tk', 1.4), el('text', { class: 'tag', x: tx + 12, y: ty - 10 }, 'Tanker'));
    svg.append(jet(rx, ry, 90, 'acft rx', 1.2), el('text', { class: 'tag', x: rx - 10, y: ry + 22 }, 'Receiver'));
    const gap = Math.hypot(now.tanker[0] - now.receiver[0], now.tanker[1] - now.receiver[1]);
    svg.append(el('text', { class: 'lbl small', x: 12, y: 18 }, `Tanker ${tanker} kt, receiver ${tanker + 20} kt true airspeed, 25° bank, no wind`));
    svg.append(el('text', { class: 'lbl small', x: 12, y: 250 }, `${t < 0 ? `${(-t * 60).toFixed(1)} min before the turn` : t < rv.turnH ? `In the turn, ${(t * 60).toFixed(1)} min` : 'Rolled out'} · ${gap.toFixed(1)} NM apart`));
    out.textContent = `Turn radius ${rv.radiusNm.toFixed(1)} NM, so with no wind the offset between the tracks is ${rv.offsetNm.toFixed(1)} NM. The tanker starts its turn with the receiver ${rv.turnRangeNm.toFixed(1)} NM away; the turn takes ${rv.turnMin.toFixed(1)} min and the tanker rolls out 1 NM ahead.`;
    svg.setAttribute('aria-label', `Point-parallel rendezvous seen from above. ${out.textContent}`);
    slider.value = String(Math.round(((t - tStart) / (tEnd - tStart)) * 1000));
  };
  const setup = () => { rv = rvDelta({ tankerKt: tanker, receiverKt: tanker + 20 }); t = -2 / 60; press(row, String(tanker)); draw(); };
  const span = () => [-2 / 60, rv.turnH + 1.5 / 60];
  const stop = () => { cancelAnimationFrame(raf); raf = null; play.textContent = 'Play'; };
  const frame = (ts) => {
    const [, e] = span();
    if (last) t += ((ts - last) / 1000) * (20 / 3600); // 20 s of flight per second
    last = ts;
    if (t >= e) { t = e; draw(); return stop(); }
    draw();
    raf = requestAnimationFrame(frame);
  };
  play.addEventListener('click', () => {
    if (raf) return stop();
    const [s, e] = span();
    if (t >= e) t = s;
    last = null; play.textContent = 'Pause'; raf = requestAnimationFrame(frame);
  });
  slider.addEventListener('input', () => { stop(); const [s, e] = span(); t = s + (Number(slider.value) / 1000) * (e - s); draw(); });
  for (const v of speeds) row.append(button(`Tanker ${v} kt`, String(v), () => { stop(); tanker = v; setup(); }));
  setup();
}

/* ---------- Quizzes ---------- */
const listQuiz = (items, options, verb) => (root) => quickQuiz(ui(root), {
  items,
  show: (q, prompt) => { prompt.textContent = q.q; },
  options: (q) => withDistractors(q.answer, options),
  isRight: (q, o) => o === q.answer,
  feedback: (q, o, right) => `${right ? 'Correct' : `Not quite: ${verb} ${q.answer}`}. ${q.why}`,
});

const blocks = {
  flow: setupFlow, boom: setupBoom, drogue: setupDrogue, rv: setupRv,
  calls: listQuiz(CALLS, CALL_OPTIONS, 'the call is'), signals: listQuiz(SIGNALS, SIGNAL_OPTIONS, 'it means'),
  terms: (r) => termQuiz(r, { hideTerm: true }),
};
for (const root of document.querySelectorAll('[data-lesson]')) {
  if (!blocks[root.dataset.lesson]) continue;
  blocks[root.dataset.lesson](root);
  root.classList.add('ready');
}
