// Presentation for the Instrument Flying module: Figure 1 (holding entries)
// and the quizzes. Rules and geometry come from lesson-model.mjs.
import { ENTRIES, arrivalSectors, diff, entryQuestion, entryTrack, holdingPattern, seventyMethod, three } from './lesson-model.mjs';
import { quickQuiz, termQuiz } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const D = Math.PI / 180;
function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
const ui = (root) => ({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') });
const side = (turn) => (turn === 'left' ? 'left' : 'right');

// Plan view, north up, fix in the middle. Model units are seconds of flight.
const CX = 320, CY = 162, K = 1.15;
const P = ([x, y]) => [CX + x * K, CY - y * K];
const path = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${P(p).map((v) => v.toFixed(1)).join(' ')}`).join(' ');
const ray = (bearing, r) => [Math.sin(bearing * D) * r, Math.cos(bearing * D) * r];

function wedge(from, to, r) {
  const span = ((to - from) + 360) % 360 || 360;
  const [x1, y1] = P(ray(from, r)), [x2, y2] = P(ray(to, r));
  return `M${CX} ${CY} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r * K} ${r * K} 0 ${span > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`;
}

function arrow(heading, at, cls) {
  const [x, y] = P(at);
  return el('path', { class: cls, d: 'M0 -9 L6 7 L0 3 L-6 7 Z', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${heading})` });
}

function drawHold(svg, inbound, heading, turn) {
  const sectors = arrivalSectors(inbound, turn);
  const { entry, points } = entryTrack(inbound, heading, turn);
  const from = (heading + 180) % 360;
  const start = ray(from, 75);
  const lineAcross = (b) => { const [a1, a2] = [P(ray(b, 112)), P(ray(b + 180, 112))]; return { x1: a1[0], y1: a1[1], x2: a2[0], y2: a2[1] }; };
  const s = turn === 'left' ? -1 : 1;
  const label = (b, r, text, cls = 'lbl small') => { const [x, y] = P(ray(b, r)); return el('text', { class: cls, x: x.toFixed(1), y: y.toFixed(1), 'text-anchor': 'middle' }, text); };
  const mid = (pair) => (pair[0] + (((pair[1] - pair[0]) + 360) % 360 || 360) / 2) % 360;
  svg.replaceChildren(
    el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 348 }),
    el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, NORTH UP, NO WIND'),
    el('line', { class: 'thin', x1: 612, y1: 46, x2: 612, y2: 20 }), el('path', { class: 'fill', d: 'M612 16 l-5 10 h10 z' }),
    el('text', { class: 'lbl small', x: 612, y: 60, 'text-anchor': 'middle' }, 'N'),
    ...ENTRIES.map((e) => el('path', { class: e === entry ? 'mine shade' : 'shade', d: wedge(...sectors[e], 110), opacity: e === entry ? 1 : 0.55 })),
    ...ENTRIES.map((e) => label(mid(sectors[e]), 88, e.toUpperCase(), 'lbl')),
    el('line', { class: 'thin', ...lineAcross(inbound) }),
    el('line', { class: 'thin dotted', ...lineAcross(inbound - s * 70) }),
    label(inbound - s * 70, 120, '70° line'),
    label(inbound + 180, 120, 'Holding course'),
    el('path', { class: 'ln dashed', d: path(holdingPattern(inbound, turn)) }),
    el('line', { class: 'ln', x1: P(start)[0], y1: P(start)[1], x2: CX, y2: CY }),
    arrow(heading, ray(from, 40), 'fill'),
    el('path', { class: 'ln on', d: path(points) }),
    el('circle', { class: 'fill', cx: CX, cy: CY, r: 5 }),
    el('text', { class: 'lbl', x: CX + 8, y: CY - 8 }, 'FIX'),
    el('text', { class: 'lbl small', x: 14, y: 318 }, `Inbound course ${three(inbound)}, ${side(turn)} turns. Arriving on heading ${three(heading)}.`),
    el('text', { class: 'lbl small', x: 14, y: 334 }, 'Dashed: the holding pattern. Blue: the entry. Shaded: the sector the aircraft arrives from.'),
  );
  return entry;
}

function setupHold(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const inboundSel = root.querySelector('[name="inbound"]');
  const headingIn = root.querySelector('[name="heading"]');
  const headingOut = root.querySelector('[data-heading]');
  const why = {
    Direct: 'Cross the fix and turn the holding direction to follow the pattern.',
    Teardrop: 'At the fix, turn to a heading 30° off the outbound course on the holding side for one minute, then turn the holding direction to intercept the inbound course.',
    Parallel: 'At the fix, turn to parallel the holding course outbound on the non-holding side for one minute, then turn toward the holding side and return to the fix or intercept the inbound course.',
  };
  function draw() {
    const inbound = Number(inboundSel.value), heading = Number(headingIn.value) || 360;
    const turn = root.querySelector('[name="turn"]:checked').value;
    headingOut.textContent = three(heading);
    const entry = drawHold(svg, inbound, heading, turn);
    const seventy = seventyMethod(inbound, heading);
    const off = Math.abs(diff(inbound, heading));
    out.replaceChildren(
      Object.assign(document.createElement('p'), { textContent: `AIM method: ${entry.toLowerCase()} entry. ${why[entry]}` }),
      Object.assign(document.createElement('p'), {
        className: 'derived',
        textContent: seventy === 'Direct'
          ? `70 degree method: the inbound course is ${off}° from your heading, within 70°, so a direct entry.`
          : `70 degree method: the inbound course is ${off}° from your heading, more than 70°, so turn outbound the shorter way to parallel the holding course, then turn toward the holding side.`,
      }),
    );
  }
  root.querySelector('[data-random]').addEventListener('click', () => {
    const q = entryQuestion();
    inboundSel.value = String(q.inbound);
    headingIn.value = String(q.heading);
    root.querySelector(`[name="turn"][value="${q.turn}"]`).checked = true;
    draw();
  });
  for (const c of root.querySelectorAll('input, select')) c.addEventListener('input', draw);
  draw();
}

function setupEntryQuiz(root) {
  const svg = root.querySelector('svg');
  const items = Array.from({ length: 12 }, () => entryQuestion());
  quickQuiz(ui(root), {
    items,
    show: (q, prompt) => {
      drawHold(svg, q.inbound, q.heading, q.turn);
      // Hide the answer: no entry track, no highlighted sector.
      svg.querySelectorAll('.ln.on').forEach((n) => n.remove());
      svg.querySelectorAll('.mine').forEach((n) => n.setAttribute('class', 'shade'));
      svg.querySelectorAll('.shade').forEach((n) => n.setAttribute('opacity', '0.55'));
      prompt.textContent = `Hold on the ${three(q.inbound)} inbound course, ${side(q.turn)} turns. You reach the fix heading ${three(q.heading)}. Which entry does the AIM method give?`;
    },
    options: () => ENTRIES,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct' : 'Not quite'}: ${q.answer.toLowerCase()}. Your heading is ${Math.abs(diff(q.inbound, q.heading))}° from the inbound course.`,
  });
}

function setupTerms(root) { termQuiz(root, { hideTerm: true }); }

const blocks = { hold: setupHold, entries: setupEntryQuiz, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}

