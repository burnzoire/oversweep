// Formation module figures: where the wingman flies (Figure 1), the lead's
// lights at night (Figure 3), the calls quiz and the terms quiz. The parade
// sight picture (Figure 2) is sight-ui.mjs.
import { CALLS, CALL_OPTIONS, FORMATIONS } from './lesson-model.mjs';
import { AIRFRAMES, sightPicture } from './sight-model.mjs';
import { el, jet } from '../shared/hsi.mjs';
import { quickQuiz, shuffle, termQuiz } from '../shared/quick-quiz.mjs';

const D = Math.PI / 180;
const fmt = (v) => v.map((n) => n.toFixed(1)).join(',');

/* ---------- Figure 1: formations from above ---------- */
// Lead at (350, 70) heading down the page is awkward; heading up reads
// better: lead at the top centre, positions fan out behind.
const CX = 350, CY = 90, R = 250;

// Screen point for a bearing (° aft of the right wingline; negative is
// forward of abeam) and a range as a fraction of the drawn radius, on the
// right (side = 1) or left (side = -1).
const at = (bearing, frac, side) => [CX + side * R * frac * Math.cos(bearing * D), CY + R * frac * Math.sin(bearing * D)];

function wedge(b0, b1, r0, r1, side, cls) {
  const pts = [];
  for (let b = b0; b <= b1 + 1e-6; b += (b1 - b0) / 16 || 1) pts.push(at(b, r1, side));
  for (let b = b1; b >= b0 - 1e-6; b -= (b1 - b0) / 16 || 1) pts.push(at(b, r0, side));
  return el('polygon', { points: pts.map(fmt).join(' '), class: cls });
}

function drawFormation(svg, f) {
  svg.replaceChildren();
  svg.append(el('rect', { x: 0, y: 0, width: 700, height: 380, class: 'view' }));
  const frac = (nm) => nm / f.scale;
  // Wingline and trail.
  svg.append(el('line', { x1: CX - R, y1: CY, x2: CX + R, y2: CY, class: 'thin' }));
  svg.append(el('line', { x1: CX, y1: CY, x2: CX, y2: CY + R + 10, class: 'thin' }));
  svg.append(el('text', { x: CX + R - 4, y: CY - 6, class: 'dark small', 'text-anchor': 'end' }, 'Wingline (3/9 line)'));
  for (const side of [1, -1]) {
    if (f.range[1] === 0) {
      // A fixed point: parade.
      const [x, y] = at(f.bearing[0], 0.55, side);
      svg.append(el('line', { x1: CX, y1: CY, x2: x, y2: y, class: 'bearing' }), jet(x, y, 0, 'acft wing', 2));
      svg.append(el('text', { x: x + side * 22, y: y + 4, class: 'dark small', 'text-anchor': side > 0 ? 'start' : 'end' }, `${f.bearing[0]}° bearing (not to scale)`));
      continue;
    }
    svg.append(wedge(f.bearing[0], f.bearing[1], frac(f.range[0]), frac(f.range[1]), side, 'zone'));
    if (f.prefer) svg.append(wedge(f.prefer[0], f.prefer[1], frac(f.range[0]), frac(f.range[1]), side, 'zone prefer'));
    if (f.avoid) svg.append(wedge(f.avoid[0], f.avoid[1], frac(f.range[0]), frac(f.range[1]), side, 'zone avoid'));
    const mid = f.prefer ?? f.bearing, [x, y] = at((mid[0] + mid[1]) / 2, frac((f.range[0] + f.range[1]) / 2), side);
    svg.append(jet(x, y, 0, 'acft wing', 1.6));
  }
  svg.append(jet(CX, CY, 0, 'acft lead', 2));
  svg.append(el('text', { x: CX, y: CY - 28, class: 'dark small', 'text-anchor': 'middle' }, 'LEAD'));
  // Scale bar.
  if (f.range[1] > 0) {
    const nm = f.scale >= 1 ? 1 : 0.1, px = R * (nm / f.scale);
    svg.append(el('line', { x1: 20, y1: 360, x2: 20 + px, y2: 360, class: 'scale' }));
    svg.append(el('text', { x: 20, y: 352, class: 'dark small' }, `${nm} NM`));
  }
  if (f.prefer) svg.append(el('text', { x: 680, y: 352, class: 'dark small', 'text-anchor': 'end' }, 'Darker: preferred · Red: avoid (transit only)'));
  svg.setAttribute('aria-label', `${f.name}, seen from above. ${f.note}`);
}

function setupPositions(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), row = root.querySelector('[data-choices]');
  svg.setAttribute('viewBox', '0 0 700 380');
  const show = (f) => {
    drawFormation(svg, f);
    out.textContent = `${f.name}: ${f.use} ${f.note} [${f.cite[0]}, ${f.cite[1]}]`;
    for (const b of row.children) b.setAttribute('aria-pressed', String(b.dataset.id === f.id));
  };
  for (const f of FORMATIONS) {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = f.name; b.dataset.id = f.id;
    b.addEventListener('click', () => show(f));
    row.append(b);
  }
  show(FORMATIONS[0]);
}

/* ---------- Figure 3: the lead's lights at night ---------- */
const NIGHT_EYE = [-7.5, 13.5, -1.2];

function setupLights(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const frame = AIRFRAMES['fa-18c'];
  svg.setAttribute('viewBox', '0 0 700 360');
  const get = (n) => root.querySelector(`[name="${n}"]:checked`)?.value ?? root.querySelector(`[name="${n}"]`)?.checked;
  const render = () => {
    const level = { position: get('position'), formation: get('formation'), strobe: get('strobe') ? 'on' : 'off' };
    svg.replaceChildren(el('rect', { x: 0, y: 0, width: 700, height: 360, class: 'night' }));
    const g = el('g', { transform: 'translate(350 180)' });
    const { panels, lights } = sightPicture(frame, NIGHT_EYE, { f: 420 });
    for (const p of panels) g.append(el('polygon', { points: p.pts.map(fmt).join(' '), class: `panel night ${p.cls}` }));
    for (const l of lights) {
      const kind = l.type.startsWith('position') ? 'position' : l.type;
      const lv = level[kind];
      if (lv === 'off') continue;
      const cls = `lamp ${l.type} ${lv}`;
      if (l.strip) g.append(el('line', { x1: l.strip[0][0], y1: l.strip[0][1], x2: l.strip[1][0], y2: l.strip[1][1], class: cls }));
      else g.append(el('circle', { cx: l.at[0], cy: l.at[1], r: kind === 'strobe' ? 5 : 3.5, class: cls }));
    }
    svg.append(g);
    const on = Object.entries(level).filter(([, v]) => v !== 'off').map(([k, v]) => `${k} ${v}`);
    out.textContent = on.length ? `Lit: ${on.join(', ')}.` : 'Everything off: a lead with no lights is a black shape against a dark sky.';
    svg.setAttribute('aria-label', `F/A-18C seen from the wing position at night. ${out.textContent}`);
  };
  for (const i of root.querySelectorAll('input')) i.addEventListener('change', render);
  render();
}

/* ---------- Quizzes ---------- */
function setupCalls(root) {
  quickQuiz({
    prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'),
    result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]'),
  }, {
    items: CALLS,
    show: (q, prompt) => { prompt.textContent = q.q; },
    options: (q) => shuffle([q.answer, ...shuffle(CALL_OPTIONS.filter((o) => o !== q.answer)).slice(0, 3)]),
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct' : `Not quite: ${q.answer}`}. ${q.why}`,
  });
}

const blocks = { positions: setupPositions, lights: setupLights, calls: setupCalls, terms: (r) => termQuiz(r, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  if (!blocks[root.dataset.lesson]) continue;
  blocks[root.dataset.lesson](root);
  root.classList.add('ready');
}
