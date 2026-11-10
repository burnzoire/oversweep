// Helicopter Formation module figures: the formations from above
// (Figure 1), vertical separation (Figure 2), the inadvertent IMC breakup
// (Figure 3), the lead change (Figure 4), the formation quiz and the
// terms quiz. Data and geometry are in helo-model.mjs.
import { FORMATIONS, LEAD_CHANGE, PICKS, PICK_OPTIONS, SPACING, centreDistance, formation, iimcBreakup, positions } from './helo-model.mjs';
import { el } from '../shared/hsi.mjs';
import { quickQuiz, shuffle, termQuiz } from '../shared/quick-quiz.mjs';

const D = Math.PI / 180;
const W = 700, H = 420;

// A helicopter from above at (x, y), heading h degrees (0 = up the page),
// with its rotor disk drawn to scale: r is the disk radius in pixels.
function heli(x, y, r, h = 0, cls = '', label = '') {
  const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${h})`, class: `heli ${cls}` });
  const k = Math.max(r, 7);
  g.append(
    el('circle', { cx: 0, cy: 0, r, class: 'disk' }),
    el('path', { class: 'body', d: `M0 ${-0.55 * k} q${0.22 * k} 0 ${0.22 * k} ${0.35 * k} v${0.5 * k} l-${0.12 * k} ${0.2 * k} v${0.75 * k} h-${0.2 * k} v-${0.75 * k} l-${0.12 * k} -${0.2 * k} v-${0.5 * k} q0 -${0.35 * k} ${0.22 * k} -${0.35 * k} z` }),
  );
  const out = [g];
  if (label) out.push(el('text', { x: x + r + 4, y: y + 4, class: 'tag' }, label));
  return out;
}

const button = (row, text, data, on) => {
  const b = Object.assign(document.createElement('button'), { type: 'button', textContent: text });
  Object.assign(b.dataset, data);
  b.addEventListener('click', on);
  row.append(b);
  return b;
};
const press = (row, key, value) => { for (const b of row.children) b.setAttribute('aria-pressed', String(b.dataset[key] === String(value))); };

/* ---------- Figure 1: the formations from above ---------- */
function setupFormations(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const rows = { form: root.querySelector('[data-forms]'), count: root.querySelector('[data-count]'), gap: root.querySelector('[data-gap]'), side: root.querySelector('[data-side]') };
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const state = { form: 'staggered', count: 4, gap: 'close', side: 1 };

  const draw = () => {
    const f = formation(state.form), sp = SPACING.find((s) => s.id === state.gap);
    const pts = positions(f.id, state.count, sp.gap, state.side);
    const d = centreDistance(sp.gap);
    // Manoeuvre arcs, in rotor disks: each wingman's area around the
    // aircraft it flies on.
    const zones = [];
    if (f.zone) {
      for (const p of pts.slice(1)) {
        const ref = pts[p.ref - 1];
        const [a0, a1] = state.count > 2 && f.flightZone ? f.flightZone : f.zone;
        const r0 = Math.max(d * 0.55, 1.2), r1 = d * 1.35, poly = [];
        for (let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 24) poly.push([ref.x + p.side * r1 * Math.sin(a * D), ref.y + r1 * Math.cos(a * D)]);
        for (let a = a1; a >= a0 - 1e-6; a -= (a1 - a0) / 24) poly.push([ref.x + p.side * r0 * Math.sin(a * D), ref.y + r0 * Math.cos(a * D)]);
        zones.push(poly);
      }
    }
    // Fit everything into the view, at no more than 60 px per disk.
    const all = [...pts.flatMap((p) => [[p.x - 0.6, p.y - 0.6], [p.x + 0.6, p.y + 0.6]]), ...zones.flat()];
    const xs = all.map((q) => q[0]), ys = all.map((q) => q[1]);
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const px = Math.min((W - 160) / Math.max(x1 - x0, 1), (H - 90) / Math.max(y1 - y0, 1), 60);
    const cx = W / 2 - px * (x0 + x1) / 2, cy = 40 - px * y0;
    const P = (x, y) => [cx + px * x, cy + px * y];
    svg.replaceChildren(el('rect', { x: 0, y: 0, width: W, height: H, class: 'view' }));
    for (const poly of zones) svg.append(el('polygon', { points: poly.map(([x, y]) => P(x, y).map((v) => v.toFixed(1)).join(',')).join(' '), class: 'zone' }));
    // Reference lines from each wingman to the aircraft it flies on.
    for (const p of pts.slice(1)) {
      const [x1, y1] = P(pts[p.ref - 1].x, pts[p.ref - 1].y), [x2, y2] = P(p.x, p.y);
      svg.append(el('line', { x1, y1, x2, y2, class: 'bearing' }));
    }
    // 6 o'clock line behind lead.
    const [lx, ly] = P(0, 0);
    svg.append(el('line', { x1: lx, y1: ly, x2: lx, y2: H - 40, class: 'thin' }));
    for (const p of pts) {
      const [x, y] = P(p.x, p.y);
      svg.append(...heli(x, y, px / 2, 0, p.chalk === 1 ? 'lead' : '', p.chalk === 1 ? 'Chalk 1 (lead)' : `Chalk ${p.chalk}`));
    }
    // Scale bar: one rotor disk.
    svg.append(el('line', { x1: 20, y1: H - 18, x2: 20 + px, y2: H - 18, class: 'scale' }), el('text', { x: 20, y: H - 26, class: 'dark small' }, '1 rotor disk'));
    if (f.zone) svg.append(el('text', { x: W - 20, y: H - 14, class: 'dark small', 'text-anchor': 'end' }, 'Shaded: where each wingman may maneuver'));
    svg.setAttribute('aria-label', `${f.name} formation, ${pts.length} aircraft, ${sp.name.toLowerCase()} spacing, seen from above. ${f.where}`);
    const fixedNote = f.fixedCount && f.fixedCount !== state.count ? ` Drawn with ${f.fixedCount} aircraft, the size the source describes.` : '';
    out.replaceChildren(
      Object.assign(document.createElement('p'), { textContent: `${f.name} (${f.kind === 'fixed' ? 'fixed' : 'maneuvering'} formation). ${f.where}${fixedNote} [1, ${f.cite.includes('–') ? 'pp.' : 'p.'} ${f.cite}]` }),
      Object.assign(document.createElement('p'), { textContent: `Spacing: ${sp.name.toLowerCase()}, ${sp.band}, edge to edge. Used for: ${f.use}` }),
    );
    press(rows.form, 'id', f.id); press(rows.count, 'n', state.count); press(rows.gap, 'gap', state.gap); press(rows.side, 'side', state.side);
  };
  for (const f of FORMATIONS) button(rows.form, f.name, { id: f.id }, () => { state.form = f.id; draw(); });
  for (const n of [2, 3, 4, 5]) button(rows.count, `${n} aircraft`, { n }, () => { state.count = n; draw(); });
  for (const s of SPACING) button(rows.gap, s.name, { gap: s.id }, () => { state.gap = s.id; draw(); });
  button(rows.side, 'Left', { side: -1 }, () => { state.side = -1; draw(); });
  button(rows.side, 'Right', { side: 1 }, () => { state.side = 1; draw(); });
  draw();
}

/* ---------- Figure 2: vertical separation ---------- */
const VERTICAL = {
  flat: { name: 'Flat', step: 0, say: 'Flat: every aircraft at the same altitude.' },
  up: { name: 'Stepped-up', step: -1, say: 'Stepped-up: each aircraft 1 to 10 ft higher than the one ahead, from lead to chalk 2 and on down the flight. Trailing aircraft stay out of the wake behind and below the aircraft ahead.' },
  down: { name: 'Stepped-down', step: 1, say: 'Stepped-down: each aircraft 1 to 10 ft lower than the one ahead. Trailing aircraft may meet wake turbulence, must adjust position to avoid it, and need more power.' },
};
function sideHeli(x, y) {
  const g = el('g', { transform: `translate(${x} ${y})`, class: 'heli-side' });
  g.append(
    el('path', { class: 'body', d: 'M-40 0 q0 -12 14 -12 h30 q14 0 14 12 q0 8 -12 8 h-34 q-12 0 -12 -8 z M-2 -4 h-70 v-5 h70 z M-74 -16 l6 12 h-6 z' }),
    el('line', { class: 'rotor', x1: -58, y1: -17, x2: 42, y2: -17 }),
    el('line', { class: 'thin', x1: -8, y1: -17, x2: -8, y2: -12 }),
  );
  return g;
}
function setupVertical(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), row = root.querySelector('[data-choices]');
  svg.setAttribute('viewBox', '0 0 700 200');
  const draw = (id) => {
    const v = VERTICAL[id];
    svg.replaceChildren(el('rect', { x: 0, y: 0, width: 700, height: 200, class: 'sky' }));
    // Flight from right (lead) to left; step drawn exaggerated, 18 px per step.
    const xs = [590, 360, 130];
    xs.forEach((x, i) => {
      const y = 100 + v.step * 18 * i;
      svg.append(sideHeli(x, y), el('text', { x: x - 20, y: y + 30, class: 'dark small', 'text-anchor': 'middle' }, i ? `Chalk ${i + 1}` : 'Chalk 1 (lead)'));
      if (i) svg.append(el('line', { x1: xs[i - 1] - 58, y1: 83 + v.step * 18 * (i - 1), x2: x + 42, y2: 83 + v.step * 18 * (i - 1), class: 'thin' }));
    });
    if (id === 'down') svg.append(el('path', { d: 'M520 115 q-60 25 -130 10', class: 'wake' }), el('text', { x: 470, y: 150, class: 'dark small', 'text-anchor': 'middle' }, 'wake'));
    svg.append(el('text', { x: 690, y: 190, class: 'dark small', 'text-anchor': 'end' }, 'Not to scale: the 1–10 ft steps are exaggerated. Direction of flight →'));
    out.textContent = `${v.say} [1, ${id === 'up' ? 'pp. 215, 217' : 'p. 215'}]`;
    svg.setAttribute('aria-label', `${v.name} vertical separation, side view of a flight of three. ${v.say}`);
    press(row, 'id', id);
  };
  for (const [id, v] of Object.entries(VERTICAL)) button(row, v.name, { id }, () => draw(id));
  draw('up');
}

/* ---------- Figure 3: inadvertent IMC breakup ---------- */
function setupIimc(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const rows = { count: root.querySelector('[data-count]'), side: root.querySelector('[data-side]') };
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const IH = 480;
  svg.setAttribute('viewBox', `0 0 ${W} ${IH}`);
  const state = { count: 5, side: 'left' };
  const draw = () => {
    const plan = iimcBreakup(state.count, state.side), s = state.side === 'left' ? -1 : 1;
    const pts = positions('staggered', state.count, 4, s), px = 36;
    svg.replaceChildren(el('rect', { x: 0, y: 0, width: W, height: IH, class: 'view' }));
    const cx = W / 2, cy = 120;
    plan.forEach((p, i) => {
      const [x, y] = [cx + pts[i].x * px, cy + pts[i].y * px * 0.55];
      const turn = p.dir === 'left' ? -p.turn : p.turn, len = 95;
      const ex = x + len * Math.sin(turn * D), ey = y - len * Math.cos(turn * D);
      svg.append(el('line', { x1: x, y1: y, x2: ex, y2: ey, class: 'track' }), el('circle', { cx: ex, cy: ey, r: 3, class: 'track-end' }));
      svg.append(...heli(x, y, 11, turn, i ? '' : 'lead'));
      const text = i ? `Chalk ${p.chalk}: ${p.dir} ${p.turn}°, +${p.climb} ft` : 'Chalk 1: straight ahead, climbs and reports';
      const right = x >= cx;
      svg.append(el('text', { x: x + (right ? 16 : -16), y: y + 18, class: 'tag', 'text-anchor': right ? 'start' : 'end' }, text));
    });
    svg.append(el('text', { x: W - 20, y: IH - 12, class: 'dark small', 'text-anchor': 'end' }, 'Heights are above lead’s altitude. Not to scale.'));
    const call = '“Lead is IMC, executing breakup procedure, heading 090.”';
    out.textContent = `Staggered ${state.side}, ${state.count} aircraft. Example call ${call} Each chalk turns 10° times its chalk number away from the flight (in staggered ${state.side}, even chalks turn ${state.side}, odd chalks the other way), climbs 500 ft above the chalk ahead, and holds heading and altitude for at least 30 seconds, all at standard rate. [1, pp. 220–221]`;
    svg.setAttribute('aria-label', `Inadvertent IMC breakup from staggered ${state.side}. ${plan.map((p) => p.chalk === 1 ? 'Chalk 1 straight ahead' : `chalk ${p.chalk} turns ${p.dir} ${p.turn} degrees and climbs ${p.climb} feet`).join('; ')}.`);
    press(rows.count, 'n', state.count); press(rows.side, 'side', state.side);
  };
  for (const n of [2, 3, 4, 5]) button(rows.count, `${n} aircraft`, { n }, () => { state.count = n; draw(); });
  for (const side of ['left', 'right']) button(rows.side, `Staggered ${side}`, { side }, () => { state.side = side; draw(); });
  draw();
}

/* ---------- Figure 4: lead change ---------- */
function setupLeadChange(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
  svg.setAttribute('viewBox', '0 0 700 420');
  let i = 0;
  const px = 26, cx = 430, cy = 70;
  const draw = () => {
    const step = LEAD_CHANGE[i];
    svg.replaceChildren(el('rect', { x: 0, y: 0, width: 700, height: 420, class: 'view' }));
    // Ghosts of the starting positions.
    for (const [x, y] of LEAD_CHANGE[0].at) svg.append(el('circle', { cx: cx + x * px, cy: cy + y * px, r: px / 2, class: 'ghost' }));
    step.at.forEach(([x, y, h], k) => {
      const chalk = k + 1, isLead = step.lead === chalk;
      const last = i === LEAD_CHANGE.length - 1;
      const name = chalk === 1 ? (step.lead === 1 ? 'Lead' : last ? 'Former lead, now chalk 3' : 'Former lead') : chalk === 2 && step.lead === 2 ? 'Old chalk 2, new lead' : step.lead === 2 ? 'Old chalk 3, now chalk 2' : `Chalk ${chalk}`;
      svg.append(...heli(cx + x * px, cy + y * px, px / 2, h, `${isLead ? 'lead' : ''} ${chalk === 1 ? 'moving' : ''}`, name));
    });
    svg.append(el('text', { x: 20, y: 30, class: 'dark' }, `Step ${i + 1} of ${LEAD_CHANGE.length}`));
    svg.append(el('text', { x: 690, y: 408, class: 'dark small', 'text-anchor': 'end' }, 'Drawn relative to the formation, which keeps flying up the page. Rings: starting positions.'));
    out.textContent = `${step.say} [1, p. 218]`;
    svg.setAttribute('aria-label', `Lead change, step ${i + 1}: ${step.say}`);
    prev.disabled = i === 0; next.disabled = i === LEAD_CHANGE.length - 1;
  };
  prev.addEventListener('click', () => { i = Math.max(0, i - 1); draw(); });
  next.addEventListener('click', () => { i = Math.min(LEAD_CHANGE.length - 1, i + 1); draw(); });
  draw();
}

/* ---------- Quizzes ---------- */
function setupPicks(root) {
  quickQuiz({
    prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'),
    result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]'),
  }, {
    items: PICKS,
    show: (q, prompt) => { prompt.textContent = q.ask; },
    options: (q) => shuffle([q.answer, ...shuffle(PICK_OPTIONS.filter((o) => o !== q.answer)).slice(0, 3)]),
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct' : `Not quite: ${q.answer}`}. ${q.why}`,
  });
}

const blocks = { formations: setupFormations, vertical: setupVertical, iimc: setupIimc, lead: setupLeadChange, picks: setupPicks, terms: (r) => termQuiz(r, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  if (!blocks[root.dataset.lesson]) continue;
  blocks[root.dataset.lesson](root);
  root.classList.add('ready');
}
