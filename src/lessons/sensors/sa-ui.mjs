// Presentation for the Situational Awareness and the Sensor Picture module.
// Sectors, the invented picture and questions come from sa-model.mjs.
import { LOADS, SA_QUESTIONS, SECTORS, SOURCES, TRACKS, bearingTo, crossCheck, known, rangeTo } from './sa-model.mjs';
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
const jet = (x, y, h, cls = 'fill', s = 1) => el('path', { class: cls, d: `M0 -${9 * s} L${6 * s} ${7 * s} L0 ${3 * s} L-${6 * s} ${7 * s} Z`, transform: `translate(${x} ${y}) rotate(${h})` });

// Figure 1: lookout sectors round a two-ship, schematic, after the handbook's
// time-share plan. You are the wingman on lead's right.
function setupLookout(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const loadSel = root.querySelector('select[name="load"]'), posSel = root.querySelector('select[name="position"]');
  const LX = 300, LY = 190, WX = 360, WY = 200;
  const shapes = {
    '1': `M${WX - 40} ${WY - 30} L${WX + 40} ${WY - 30} L${WX + 25} ${WY - 95} L${WX - 25} ${WY - 95} Z`,
    '1A': `M${WX - 25} ${WY - 95} L${WX + 25} ${WY - 95} L${WX + 40} ${WY - 170} L${WX - 40} ${WY - 170} Z`,
    '2': `M${LX - 40} ${LY + 15} L${WX + 15} ${WY + 15} L${WX + 5} ${WY + 110} L${LX - 30} ${LY + 110} Z`,
    '3': `M${LX - 60} ${LY - 20} L${LX + 2} ${LY - 20} L${LX + 2} ${LY - 160} L${LX - 60} ${LY - 160} Z`,
    '4': `M30 30 L210 30 L210 330 L30 330 Z M470 30 L610 30 L610 330 L470 330 Z`,
  };
  const anchor = { '1': [WX, WY - 60], '1A': [WX, WY - 135], '2': [LX + 25, LY + 70], '3': [LX - 29, LY - 90], '4': [120, 180], '4b': [540, 180] };
  function draw() {
    const order = crossCheck(posSel.value, loadSel.value);
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 358 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, SCHEMATIC SECTORS')];
    for (const s of SECTORS) {
      const on = order.includes(s.id);
      items.push(el('path', { class: on ? 'zone on' : 'zone', d: shapes[s.id], 'fill-rule': 'evenodd' }));
      for (const key of s.id === '4' ? ['4', '4b'] : [s.id]) {
        const [x, y] = anchor[key];
        items.push(el('text', { class: 'lbl', x, y, 'text-anchor': 'middle' }, `${s.id}`));
        if (on) items.push(el('text', { class: 'lbl small', x, y: y + 14, 'text-anchor': 'middle' }, `#${order.indexOf(s.id) + 1}`));
      }
    }
    items.push(el('line', { class: 'thin dashed', x1: 220, y1: LY + 8, x2: 460, y2: LY + 8 }), el('text', { class: 'lbl small', x: 462, y: LY + 12 }, '3/9 line'));
    items.push(jet(LX, LY, 0, 'fill'), jet(WX, WY, 0, 'mine'), el('text', { class: 'lbl small', x: LX - 12, y: LY + 6, 'text-anchor': 'end' }, 'Lead'), el('text', { class: 'lbl small', x: WX + 12, y: WY + 6 }, posSel.value === 'lead' ? 'Wing' : 'You'));
    svg.replaceChildren(...items);
    const named = order.map((id) => (id === 'Radar' ? 'radar' : `${id} ${SECTORS.find((s) => s.id === id).name.toLowerCase()}`));
    const dropped = SECTORS.filter((s) => !order.includes(s.id)).map((s) => s.id);
    out.replaceChildren(
      para(`Cross-check order: ${named.join(', then ')}.`),
      para(dropped.length ? `Dropped under this load: sector ${dropped.join(', ')}${order.includes('Radar') ? '' : ' and the radar'}. Bring them back one at a time as the load eases.` : 'Full 360° lookout.', 'derived'),
    );
  }
  loadSel.replaceChildren(...LOADS.map((l) => Object.assign(document.createElement('option'), { value: l.id, textContent: l.label })));
  loadSel.addEventListener('change', draw);
  posSel.addEventListener('change', draw);
  draw();
}

// Figure 2: the picture each source gives; switch sources on and off.
function setupPicture(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const boxes = root.querySelector('[data-sources]');
  boxes.replaceChildren(...SOURCES.map((s) => {
    const label = document.createElement('label');
    const box = Object.assign(document.createElement('input'), { type: 'checkbox', name: s.id, checked: true });
    label.append(box, ` ${s.label}`);
    box.addEventListener('change', draw);
    return label;
  }));
  const K = 5.6, X0 = 250, Y0 = 268;
  const P = ({ x, y }) => [X0 + x * K, Y0 - y * K];
  function draw() {
    const on = [...boxes.querySelectorAll('input:checked')].map((b) => b.name);
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 358 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, INVENTED PICTURE')];
    for (const r of [10, 20, 30, 40]) items.push(el('circle', { class: 'thin dotted', cx: X0, cy: Y0, r: r * K }));
    items.push(jet(X0, Y0, 0, 'mine'), el('text', { class: 'lbl small', x: X0 - 12, y: Y0 + 6, 'text-anchor': 'end' }, 'You'));
    const lines = [];
    for (const t of TRACKS) {
      const k = known(t, on);
      if (!k.by.length) continue;
      const [x, y] = P(t);
      if (k.bearingOnly) {
        const b = (bearingTo(t) * Math.PI) / 180;
        items.push(el('line', { class: 'ln dashed', x1: X0, y1: Y0, x2: X0 + 240 * Math.sin(b), y2: Y0 - 240 * Math.cos(b) }));
        items.push(el('text', { class: 'lbl small', x: X0 + 200 * Math.sin(b) + 6, y: Y0 - 200 * Math.cos(b) }, 'Bearing only'));
      } else {
        const cls = t.kind === 'hostile' && k.identity ? 'mine' : 'fill';
        items.push(t.kind === 'surface' ? el('rect', { class: cls, x: x - 6, y: y - 6, width: 12, height: 12 }) : jet(x, y, t.kind === 'friend' ? 0 : 200, cls));
        const below = t.id === 'wing';
        items.push(el('text', { class: 'lbl small', x: x + 10, y: below ? y + 18 : y - 8 }, `${t.label}${k.identity ? '' : ', ID unknown'}`));
        if (t.id !== 'wing') items.push(el('text', { class: 'lbl small', x: x + 10, y: y + 6 }, `${Math.round(bearingTo(t)).toString().padStart(3, '0')}° ${Math.round(rangeTo(t))} NM`));
      }
      const silent = k.noReply ? ` Interrogated: ${t.seen.iff}.` : '';
      lines.push(`${t.label}. ${k.by.map((s) => `${SOURCES.find((x) => x.id === s).label}: ${t.seen[s]}`).join('. ')}.${silent}${k.correlated ? ' Several sources agree: correlated.' : ' One source only.'}`);
    }
    svg.replaceChildren(...items);
    out.replaceChildren(...(lines.length ? lines.map((l) => para(l, 'derived')) : [para('No sources on: you know only what you briefed.')]));
  }
  draw();
}

function setupQuestions(root) {
  quickQuiz(ui(root), {
    items: SA_QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

const blocks = { lookout: setupLookout, picture: setupPicture, questions: setupQuestions, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
