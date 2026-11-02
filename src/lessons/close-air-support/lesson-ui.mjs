// Presentation for the Close Air Support module's figure and quizzes. The
// brief, its rules and the questions come from lesson-model.mjs; this file
// reads inputs and draws.
import { CONTROL_QUESTIONS, EXAMPLE, NINE_LINE, attackSteps, briefGeometry, lineQuestions, readback } from './lesson-model.mjs';
import { quickQuiz, termQuiz, withDistractors } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const D = Math.PI / 180;

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
function para(text, cls) {
  const p = document.createElement('p');
  p.textContent = text;
  if (cls) p.className = cls;
  return p;
}
const ui = (root) => ({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') });

// Figure 1: the invented 9-line drawn on a plan view, north up, to scale.
function setupBrief(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const chips = root.querySelector('[data-steps]');
  const g = briefGeometry();
  const K = 50, TX = 175, TY = 200;
  const P = ([x, y]) => [TX + x * K, TY - y * K];
  const anvil = [0, 2.9];
  const steps = [...NINE_LINE.map((l) => ({ ...l, label: l.line ? `Line ${l.line}` : 'Remarks' })), { id: 'readback', label: 'Readback' }];
  let current = 0;
  const buttons = steps.map((s, i) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: s.label });
    b.addEventListener('click', () => { current = i; draw(); });
    chips.append(b);
    return b;
  });
  function draw() {
    const s = steps[current];
    const on = (...ids) => ids.includes(s.id) || s.id === 'readback' && ids.some((id) => NINE_LINE.find((l) => l.id === id)?.readback);
    const cls = (base, ...ids) => `${base}${on(...ids) ? ' on' : ''}`;
    const [tx, ty] = P(g.target), [ix, iy] = P(g.ip), [fx, fy] = P(g.friendlies), [ax, ay] = P(anvil);
    const [ox, oy] = g.offsetSide;
    // The offset side: a band beside the IP-to-target line.
    const band = [[ix, iy], [tx, ty], [tx + ox * 60, ty - oy * 60], [ix + ox * 60, iy - oy * 60]];
    // The final attack heading window: aircraft headings 240 to 300 arrive
    // from bearings 060 to 120 of the target.
    const wedge = (r) => EXAMPLE.fah.map((h) => [tx + Math.sin((h + 180) * D) * r, ty - Math.cos((h + 180) * D) * r]);
    const [w1, w2] = wedge(2.6 * K);
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 338 }),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, NORTH UP, TO SCALE'),
      el('line', { class: 'thin', x1: 612, y1: 46, x2: 612, y2: 20 }), el('path', { class: 'fill', d: 'M612 16 l-5 10 h10 z' }),
      el('text', { class: 'lbl small', x: 612, y: 60, 'text-anchor': 'middle' }, 'N'),
      el('polygon', { class: on('heading') ? 'mine shade' : 'shade', points: band.map((p) => p.join(',')).join(' ') }),
      el('text', { class: 'lbl small', x: (ix + tx) / 2, y: (iy + ty) / 2 - 34, 'text-anchor': 'middle' }, `Offset ${EXAMPLE.offset}: maneuver on this side`),
      el('path', { class: on('remarks') ? 'mine shade' : 'shade', d: `M${tx} ${ty} L${w1[0].toFixed(1)} ${w1[1].toFixed(1)} A${2.6 * K} ${2.6 * K} 0 0 1 ${w2[0].toFixed(1)} ${w2[1].toFixed(1)} Z` }),
      el('text', { class: 'lbl small', x: tx + 2.7 * K, y: ty + 52 }, `Final attack headings ${EXAMPLE.fah[0]}–${EXAMPLE.fah[1]}`),
      el('line', { class: cls('ln heavy', 'heading', 'distance'), x1: ix, y1: iy, x2: tx + 8, y2: ty }),
      el('path', { class: 'fill', d: `M${tx + 10} ${ty} l12 -6 v12 z` }),
      el('text', { class: 'lbl small', x: (ix + tx) / 2, y: ty + 18, 'text-anchor': 'middle' }, `${String(EXAMPLE.heading).padStart(3, '0')}° magnetic, ${EXAMPLE.distanceNm} NM`),
      el('circle', { class: on('ip') ? 'mine' : 'fill', cx: ix, cy: iy, r: 6 }),
      el('text', { class: 'lbl', x: ix, y: iy - 12, 'text-anchor': 'middle' }, `IP ${EXAMPLE.ip}`),
      el('path', { class: on('elevation', 'description', 'location') ? 'mine' : 'fill', d: `M${tx} ${ty - 8} l8 8 l-8 8 l-8 -8 z` }),
      el('text', { class: 'lbl', x: tx - 10, y: ty - 14, 'text-anchor': 'end' }, 'Target'),
      el('text', { class: 'lbl small', x: tx - 10, y: ty - 30, 'text-anchor': 'end' }, `${EXAMPLE.elevationFt} ft, ${EXAMPLE.location}`),
      el('circle', { class: on('mark') ? 'mine' : 'thin', cx: tx + 6, cy: ty - 10, r: 9, 'stroke-dasharray': '3 2' }),
      el('text', { class: 'lbl small', x: tx + 18, y: ty - 18 }, 'Smoke'),
      el('line', { class: cls('thin dotted', 'friendlies'), x1: tx, y1: ty, x2: fx, y2: fy }),
      el('rect', { class: on('friendlies') ? 'mine' : 'fill', x: fx - 7, y: fy - 4, width: 14, height: 9 }),
      el('text', { class: 'lbl small', x: fx + 12, y: fy + 4 }, `Friendlies, ${EXAMPLE.friendlies.dir} ${EXAMPLE.friendlies.meters} m`),
      el('polyline', { class: cls('ln dashed', 'egress'), points: `${tx},${ty} ${tx + 18},${ty - 40} ${ax},${ay + 10}` }),
      el('circle', { class: on('egress') ? 'mine' : 'fill', cx: ax, cy: ay, r: 5 }),
      el('text', { class: 'lbl', x: ax + 12, y: ay + 4 }, `${EXAMPLE.egress.to} (egress)`),
      ...[0, 1, 2].map((n) => el('line', { class: 'thin', x1: 420 + n * K, y1: 316, x2: 420 + n * K, y2: 324 })),
      el('line', { class: 'thin', x1: 420, y1: 320, x2: 420 + 2 * K, y2: 320 }),
      el('text', { class: 'lbl small', x: 420 + 2 * K + 8, y: 324 }, '2 NM'),
    );
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
    if (s.id === 'readback') {
      out.replaceChildren(
        para(`${EXAMPLE.aircraft} reads back: "${readback()}."`),
        para('Lines 4 and 6 and every restriction are mandatory readback. The JTAC answers "readback correct", or restates the wrong part. (JP 3-09.3 p. V-33)', 'derived'),
      );
      return;
    }
    out.replaceChildren(
      para(`${s.label}: ${s.title}. ${EXAMPLE.jtac} says ${s.says}.${s.readback ? ' Mandatory readback.' : ''}`),
      para(`${s.unit}. ${s.means} (JP 3-09.3 p. ${s.page})`, 'derived'),
    );
  }
  draw();
}

// Figure 1: the opening example played out on a plan view, north up, to scale.
function setupPlay(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const types = root.querySelector('[data-types]');
  const [back, next] = root.querySelectorAll('[data-back], [data-next]');
  const count = root.querySelector('[data-count]');
  const g = briefGeometry();
  const K = 30, TX = 40, TY = 140;
  const P = ([x, y]) => [TX + x * K, TY - y * K];
  const northing = -780 / 1852; // the 56 northing, 780 m south of NV 1234 5678
  let type = 1, current = 0, steps = attackSteps(type);
  const typeButtons = [1, 3].map((t) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: `Type ${t}` });
    b.addEventListener('click', () => { type = t; steps = attackSteps(t); current = Math.min(current, steps.length - 1); draw(); });
    types.append(b);
    return [t, b];
  });
  back.addEventListener('click', () => { current = Math.max(0, current - 1); draw(); });
  next.addEventListener('click', () => { current = Math.min(steps.length - 1, current + 1); draw(); });
  const jet = (pos, hdg, label, cls) => {
    const [x, y] = P(pos);
    const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` });
    g.append(el('path', { class: cls, d: 'M0 -9 L6 7 L0 3 L-6 7 Z', transform: `rotate(${hdg})` }), el('text', { class: 'lbl small', x: 9, y: -6 }, label));
    return g;
  };
  const trail = (key) => el('polyline', { class: 'thin dotted', points: steps.slice(0, current + 1).map((s) => P(s[key].pos).map((v) => v.toFixed(1)).join(',')).join(' ') });
  function draw() {
    const s = steps[current];
    const has = (k) => s.show.includes(k);
    const [tx, ty] = P(g.target), [ix, iy] = P(g.ip), [fx, fy] = P(g.friendlies), [ax, ay] = P([0, 2.9]);
    const [, ny] = P([0, northing]);
    const wedge = EXAMPLE.fah.map((h) => [tx + Math.sin((h + 180) * D) * 2.4 * K, ty - Math.cos((h + 180) * D) * 2.4 * K]);
    const items = [
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 208 }),
      el('line', { class: 'thin', x1: 520, y1: 196, x2: 520 + 2 * K, y2: 196 }), el('text', { class: 'lbl small', x: 520 + 2 * K + 8, y: 200 }, '2 NM'),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, NORTH UP, TO SCALE'),
      el('line', { class: 'thin', x1: 612, y1: 46, x2: 612, y2: 20 }), el('path', { class: 'fill', d: 'M612 16 l-5 10 h10 z' }),
      el('text', { class: 'lbl small', x: 612, y: 60, 'text-anchor': 'middle' }, 'N'),
      el('circle', { class: 'fill', cx: ix, cy: iy, r: 4 }),
      el('text', { class: 'lbl', x: ix, y: iy + 22, 'text-anchor': 'middle' }, `IP ${EXAMPLE.ip}`),
      el('path', { class: has('target') ? 'mine' : 'fill', d: `M${tx} ${ty - 6} l6 6 l-6 6 l-6 -6 z` }),
      el('text', { class: 'lbl small', x: tx, y: ty - 14, 'text-anchor': 'middle' }, 'Target'),
    ];
    if (has('northing')) items.push(
      el('line', { class: 'thin', x1: 14, y1: ny, x2: 626, y2: ny, 'stroke-dasharray': '6 3' }),
      el('text', { class: 'lbl small', x: 380, y: ny + 14 }, 'Friendlies south of the 56 northing'),
    );
    if (has('friendlies') || has('brief')) items.push(
      el('rect', { class: has('friendlies') ? 'mine' : 'fill', x: fx - 5, y: fy + 1, width: 10, height: 6 }),
      el('text', { class: 'lbl small', x: tx + 12, y: fy + 26 }, 'Friendlies, S 800 m'),
    );
    if (has('brief')) items.unshift(
      el('path', { class: current === steps.findIndex((x) => x.show.includes('brief')) ? 'mine shade' : 'shade', d: `M${tx} ${ty} L${wedge[0][0].toFixed(1)} ${wedge[0][1].toFixed(1)} A${2.4 * K} ${2.4 * K} 0 0 1 ${wedge[1][0].toFixed(1)} ${wedge[1][1].toFixed(1)} Z` }),
    ), items.push(
      el('line', { class: 'thin', x1: ix, y1: iy, x2: tx, y2: ty }),
      el('text', { class: 'lbl small', x: (ix + tx) / 2 + 30, y: ty - 30, 'text-anchor': 'middle' }, `Run-in 270°, ${EXAMPLE.distanceNm} NM`),
      el('circle', { class: 'fill', cx: ax, cy: ay, r: 4 }),
      el('text', { class: 'lbl small', x: ax + 10, y: ay + 4 }, `${EXAMPLE.egress.to}, egress block ${EXAMPLE.egress.block}`),
    );
    if (has('egress')) items.push(el('line', { class: 'ln dashed on', x1: tx, y1: ty, x2: ax, y2: ay + 6 }));
    if (has('mark')) items.push(el('circle', { class: 'mine', cx: tx + 3, cy: ty - 4, r: 5, opacity: 0.6 }), el('text', { class: 'lbl small', x: tx + 22, y: ty - 14 }, 'Smoke'));
    for (const [k, dx] of [['hits1', -3], ['hits2', 3]]) if (has(k)) items.push(el('path', { class: 'mine', d: `M${tx + dx} ${ty - 7} l2 5 l5 -1 l-3 4 l3 4 l-5 -1 l-2 5 l-2 -5 l-5 1 l3 -4 l-3 -4 l5 1 z` }));
    items.push(trail('a'), trail('b'), jet(s.a.pos, s.a.hdg, EXAMPLE.aircraft.split(' ')[1], s.who === EXAMPLE.aircraft ? 'mine' : 'fill'), jet(s.b.pos, s.b.hdg, String(+EXAMPLE.aircraft.split(' ')[1] + 1), s.who.endsWith(String(+EXAMPLE.aircraft.split(' ')[1] + 1)) ? 'mine' : 'fill'));
    if (s.call) items.push(el('text', { class: 'lbl call', x: 14, y: 198 }, s.call));
    svg.replaceChildren(...items);
    typeButtons.forEach(([t, b]) => b.setAttribute('aria-pressed', String(t === type)));
    back.disabled = current === 0;
    next.disabled = current === steps.length - 1;
    count.textContent = `Step ${current + 1} of ${steps.length}: ${s.phase}`;
    const who = para('', ''), link = Object.assign(document.createElement('a'), { href: s.href, textContent: 'Read more' });
    who.append(Object.assign(document.createElement('strong'), { textContent: `${s.who}: ` }), document.createTextNode(s.says));
    const note = para(s.note ? `${s.note} ` : '', 'derived');
    note.append(link);
    out.replaceChildren(who, note);
  }
  draw();
}

function setupLineQuiz(root) {
  const qs = lineQuestions();
  const answers = qs.map((q) => q.answer);
  quickQuiz(ui(root), {
    items: qs,
    show: (q, prompt) => { prompt.textContent = `In the brief, the JTAC says ${q.says}. Which part of the 9-line is that?`; },
    options: (q) => withDistractors(q.answer, answers, 4),
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : `Not quite: ${q.answer.toLowerCase()}.`}${q.item.readback ? ' It is read back.' : ''}`,
  });
}

function setupControlQuiz(root) {
  quickQuiz(ui(root), {
    items: CONTROL_QUESTIONS,
    show: (q, prompt) => { prompt.textContent = q.ask; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

function setupTerms(root) { termQuiz(root, { hideTerm: true }); }

const blocks = { play: setupPlay, brief: setupBrief, lines: setupLineQuiz, control: setupControlQuiz, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
