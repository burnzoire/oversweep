// Presentation for the Precision Targeting module's figures and quizzes.
// Facts, geometry and questions come from lesson-model.mjs; this file reads
// inputs and draws.
import { ATTACK_STEPS, EXAMPLE, GEO_QUESTIONS, ZONES, groundMissFt, laserZone, norm360, spillFraction, spotDiameterM } from './lesson-model.mjs';
import { quickQuiz, termQuiz } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
const para = (text, cls) => Object.assign(document.createElement('p'), { textContent: text, className: cls ?? '' });
const ui = (root) => ({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') });
const pad3 = (n) => String(norm360(n)).padStart(3, '0');

// Plan view of the laser zones of JP 3-09.3 Figure III-9, north up, centred on the target.
// The target sits a little away from the designator side, so the wedges and
// labels fill the frame whatever the laser target line.
const W = 760, H = 620, R = 180, SHIFT = 40;
let CX = W / 2, CY = H / 2;
const at = (bearing, r) => { const b = (bearing * Math.PI) / 180; return [CX + r * Math.sin(b), CY - r * Math.cos(b)]; };
function wedge(centre, half, r, cls) {
  const [x1, y1] = at(centre - half, r), [x2, y2] = at(centre + half, r);
  return el('path', { class: cls, d: `M${CX} ${CY} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${2 * half > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z` });
}
function arc(from, to, r, cls) {
  const span = norm360(to - from);
  const [x1, y1] = at(from, r), [x2, y2] = at(from + span, r);
  return el('path', { class: cls, d: `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${span > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}` });
}
// A label at bearing `b`, radius `r`, anchored away from the centre.
function label(b, r, text, centred = false) {
  const [x, y] = at(b, r);
  const s = Math.sin((b * Math.PI) / 180);
  return el('text', { class: 'lbl small', x: x.toFixed(1), y: (y + 4).toFixed(1), 'text-anchor': centred ? 'middle' : s > 0.3 ? 'start' : s < -0.3 ? 'end' : 'middle' }, text);
}
function drawZones(svg, { ltl, heading = null, fah = null, laser = false, title, who = 'Attacker' }) {
  const des = ltl + 180;
  const d = (des * Math.PI) / 180;
  CX = W / 2 - SHIFT * Math.sin(d); CY = H / 2 + SHIFT * Math.cos(d);
  const [dx, dy] = at(des, 110);
  const items = [
    el('rect', { class: 'frame', x: 1, y: 1, width: W - 2, height: H - 2 }),
    el('text', { class: 'lbl', x: 14, y: 22 }, title),
    el('text', { class: 'lbl small', x: W - 14, y: 22, 'text-anchor': 'end' }, 'N ↑'),
    wedge(des, ZONES.attackHalfDeg, R, 'zone-attack'),
    wedge(des, ZONES.preferredHalfDeg, R, 'zone-pref'),
    wedge(des, ZONES.safetyHalfDeg, R, 'zone-safety'),
    el('line', { class: laser ? 'ln on' : 'thin dotted', x1: dx, y1: dy, x2: CX, y2: CY }),
    el('rect', { class: 'fill', x: dx - 5, y: dy - 5, width: 10, height: 10 }),
    label(des, R + 8, `Designator, laser target line ${pad3(ltl)}`),
    label(des, R + 22, '20° safety zone'),
    label(des + 28, 150, 'Preferred', true), label(des - 28, 150, 'Preferred', true),
    label(des + 53, 150, '±60°', true), label(des - 53, 150, '±60°', true),
    el('path', { class: 'fill', d: `M${CX} ${CY - 7} l7 7 l-7 7 l-7 -7 z` }),
    label(ltl, 14, 'Target'),
  ];
  if (fah) {
    items.push(arc(fah[0] + 180, fah[1] + 180, R + 30, 'ln heavy on'));
    items.push(label(fah[0] + 180, R + 44, `Attack headings ${pad3(fah[0])}–${pad3(fah[1])}`));
  }
  if (heading !== null) {
    const pos = heading + 180;
    const [jx, jy] = at(pos, 240), [kx, ky] = at(pos, 195);
    const z = laserZone(heading, ltl);
    items.push(el('line', { class: z.ok ? 'ln on' : 'ln dashed', x1: jx, y1: jy, x2: kx, y2: ky }));
    items.push(el('path', { class: z.ok ? 'mine' : 'fill', d: 'M0 -10 L7 8 L0 4 L-7 8 Z', transform: `translate(${jx.toFixed(1)} ${jy.toFixed(1)}) rotate(${heading})` }));
    const up = Math.cos((pos * Math.PI) / 180) > 0.3;
    items.push(el('text', { class: 'lbl small', x: jx.toFixed(1), y: (jy + (up ? -16 : 24)).toFixed(1), 'text-anchor': 'middle' }, `${who}, heading ${pad3(heading)}`));
  }
  svg.replaceChildren(...items);
}

// Figure 1: the invented attack, stepped.
function setupAttack(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const [back, next] = [root.querySelector('[data-back]'), root.querySelector('[data-next]')];
  const count = root.querySelector('[data-count]');
  let i = 0;
  function draw() {
    const s = ATTACK_STEPS[i];
    drawZones(svg, { ltl: EXAMPLE.laserTargetLine, heading: s.heading, fah: i >= 3 ? EXAMPLE.fah : null, laser: s.laser, title: 'PLAN VIEW, NOT TO SCALE, INVENTED ATTACK', who: 'Strike 11' });
    count.textContent = `Step ${i + 1} of ${ATTACK_STEPS.length}`;
    back.disabled = i === 0; next.disabled = i === ATTACK_STEPS.length - 1;
    const lines = [para(`${s.who}: ${s.said}`)];
    if (s.heading !== null && i > 3) lines.push(para(laserZone(s.heading, EXAMPLE.laserTargetLine).label, 'derived'));
    out.replaceChildren(...lines);
  }
  back.addEventListener('click', () => { if (i > 0) { i--; draw(); } });
  next.addEventListener('click', () => { if (i < ATTACK_STEPS.length - 1) { i++; draw(); } });
  draw();
}

// Figure 2: try an attack heading against a laser target line.
function setupZones(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const ltlIn = root.querySelector('[data-ltl]'), hdgIn = root.querySelector('[data-heading]');
  function draw() {
    const ltl = Number(ltlIn.value), hdg = Number(hdgIn.value);
    root.querySelector('[data-ltl-out]').textContent = pad3(ltl);
    root.querySelector('[data-heading-out]').textContent = pad3(hdg);
    drawZones(svg, { ltl, heading: hdg, title: 'PLAN VIEW, NOT TO SCALE' });
    const z = laserZone(hdg, ltl);
    out.replaceChildren(para(`${Math.round(z.off)}° off the laser target line. ${z.label}.`));
  }
  ltlIn.addEventListener('input', draw); hdgIn.addEventListener('input', draw);
  draw();
}

// Figure 3: laser spot size against a three-metre target.
function setupSpot(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const rangeIn = root.querySelector('[data-range]');
  const TARGET_M = 3, PX = 30, X = 320, Y = 150;
  function draw() {
    const range = Number(rangeIn.value);
    root.querySelector('[data-range-out]').textContent = `${(range / 1000).toFixed(1)} km`;
    const d = spotDiameterM(range), spill = spillFraction(d, TARGET_M);
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 298 }),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'FACING THE TARGET, TO SCALE: 1 MRAD BEAM'),
      el('rect', { class: 'shade', x: X - (TARGET_M * PX) / 2, y: Y - (TARGET_M * PX) / 2, width: TARGET_M * PX, height: TARGET_M * PX }),
      el('rect', { class: 'thin', x: X - (TARGET_M * PX) / 2, y: Y - (TARGET_M * PX) / 2, width: TARGET_M * PX, height: TARGET_M * PX }),
      el('circle', { class: 'ln on', cx: X, cy: Y, r: (d * PX) / 2 }),
      el('text', { class: 'lbl small', x: X, y: Y + (TARGET_M * PX) / 2 + 16, 'text-anchor': 'middle' }, '3 m target'),
      el('text', { class: 'lbl small', x: 14, y: 284 }, `Spot ${d.toFixed(1)} m across`),
    );
    out.replaceChildren(
      para(`At ${(range / 1000).toFixed(1)} km the spot is about ${d.toFixed(1)} m across.`),
      para(spill > 0 ? `About ${Math.round(spill * 100)}% of the spot misses the target: spillover, which can reflect back to the weapon and mislead it.` : 'All of the spot falls on the target, if it is aimed at the centre.', 'derived'),
    );
  }
  rangeIn.addEventListener('input', draw);
  draw();
}

// Figure 4: what a vertical error does at different impact angles.
function setupImpact(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const veIn = root.querySelector('[data-ve]'), angIn = root.querySelector('[data-angle]');
  const S = 2.2, TX = 330, GY = 200;
  function draw() {
    const ve = Number(veIn.value), ang = Number(angIn.value);
    root.querySelector('[data-ve-out]').textContent = `${ve > 0 ? '+' : ''}${ve} ft`;
    root.querySelector('[data-angle-out]').textContent = `${ang}°`;
    const miss = groundMissFt(ve, ang);
    const hitX = TX + miss * S, aimY = GY - ve * S;
    const t = Math.tan((ang * Math.PI) / 180);
    const startX = Math.min(hitX, TX) - 140, startY = GY - (hitX - startX) * t;
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 278 }),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'SIDE VIEW, TO SCALE, GEOMETRY ONLY'),
      el('line', { class: 'ln heavy', x1: 10, y1: GY, x2: 630, y2: GY }),
      el('path', { class: 'fill', d: `M${TX - 8} ${GY} h16 v-8 h-16 z` }),
      el('text', { class: 'lbl small', x: TX, y: GY + 18, 'text-anchor': 'middle' }, 'Target'),
      el('circle', { class: 'mine', cx: TX, cy: aimY, r: 4 }),
      el('text', { class: 'lbl small', x: TX + 8, y: aimY - 6 }, ve === 0 ? 'Coordinate' : `Coordinate, ${Math.abs(ve)} ft ${ve > 0 ? 'high' : 'low'}`),
      el('line', { class: 'ln on', x1: startX, y1: startY, x2: hitX, y2: GY }),
      el('circle', { class: 'fill', cx: hitX, cy: GY, r: 4 }),
      el('text', { class: 'lbl small', x: hitX, y: GY + 34, 'text-anchor': 'middle' }, 'Impact'),
    );
    out.replaceChildren(
      para(ve === 0 ? 'No vertical error: the weapon hits the coordinate.' : `The weapon hits about ${Math.abs(miss).toFixed(0)} ft ${miss > 0 ? 'beyond' : 'short of'} the target.`),
      para('A steeper impact angle shrinks the miss from the same vertical error.', 'derived'),
    );
  }
  veIn.addEventListener('input', draw); angIn.addEventListener('input', draw);
  draw();
}

function setupCheck(root) {
  quickQuiz(ui(root), {
    items: GEO_QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

const blocks = { attack: setupAttack, zones: setupZones, spot: setupSpot, impact: setupImpact, check: setupCheck, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
