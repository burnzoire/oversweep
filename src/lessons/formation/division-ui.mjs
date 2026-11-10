// Four-Ship and Display Formations module figures: the close configurations
// (Figure 1), the tactical formations (Figure 2), the division wall turns
// (Figure 3), the formation quiz and the terms quiz. Data and geometry are
// in division-model.mjs.
import { ADMIN, PICKS, PICK_OPTIONS, RADIUS, SPREAD, TACTICAL, TAC_WING, admin, adminPositions, tacticalPositions, turnEnd, wallTurn } from './division-model.mjs';
import { el } from '../shared/hsi.mjs';
import { quickQuiz, shuffle, termQuiz } from '../shared/quick-quiz.mjs';

const D = Math.PI / 180;
const W = 700, H = 420;

// A swept-wing jet from above at (x, y), heading h degrees (0 = up the
// page), s pixels from wingtip to wingtip.
function jet(x, y, s, h = 0, cls = '', label = '', dx = 0) {
  const k = s / 2;
  const g = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${h.toFixed(1)})`, class: `acft ${cls}` });
  g.append(el('path', { d: `M0 ${-1.1 * k} L${0.12 * k} ${-0.5 * k} L${k} ${0.25 * k} L${k} ${0.4 * k} L${0.14 * k} ${0.2 * k} L${0.14 * k} ${0.7 * k} L${0.45 * k} ${0.95 * k} L${0.45 * k} ${1.05 * k} L0 ${0.95 * k} L-${0.45 * k} ${1.05 * k} L-${0.45 * k} ${0.95 * k} L-${0.14 * k} ${0.7 * k} L-${0.14 * k} ${0.2 * k} L-${k} ${0.4 * k} L-${k} ${0.25 * k} L-${0.12 * k} ${-0.5 * k} Z` }));
  const out = [g];
  if (label) out.push(el('text', { x: x + (dx || k + 4), y: y + 4, class: 'tag', 'text-anchor': dx < 0 ? 'end' : 'start' }, label));
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
const para = (text) => Object.assign(document.createElement('p'), { textContent: text });

// Fit a set of points (model units) into the view.
function fit(pts, pad, maxPx) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const px = Math.min((W - 2 * pad) / Math.max(x1 - x0, 1e-6), (H - 2 * pad - 30) / Math.max(y1 - y0, 1e-6), maxPx);
  return { px, P: (x, y) => [W / 2 + px * (x - (x0 + x1) / 2), H / 2 - 12 + px * (y - (y0 + y1) / 2)] };
}

/* ---------- Figure 1: close configurations ---------- */
function setupAdmin(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const rows = { form: root.querySelector('[data-forms]'), side: root.querySelector('[data-side]') };
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const state = { form: 'fingertip', side: 1 };
  const draw = () => {
    const f = admin(state.form), pts = adminPositions(f.id, state.side);
    const { px, P } = fit(pts.flatMap((p) => [[p.x - 1, p.y - 1], [p.x + 1, p.y + 1]]), 70, 110);
    svg.replaceChildren(el('rect', { x: 0, y: 0, width: W, height: H, class: 'view' }));
    for (const p of pts.slice(1)) {
      const r = pts[p.ref - 1];
      const [x1, y1] = P(r.x, r.y), [x2, y2] = P(p.x, p.y);
      svg.append(el('line', { x1, y1, x2, y2, class: 'bearing' }));
    }
    for (const p of pts) {
      const [x, y] = P(p.x, p.y);
      svg.append(...jet(x, y, px, 0, p.n === 1 ? 'lead' : '', p.n === 1 ? '#1 lead' : `#${p.n}`, p.x < 0 ? -(px / 2 + 4) : 0));
    }
    svg.append(el('line', { x1: 20, y1: H - 18, x2: 20 + px, y2: H - 18, class: 'scale' }), el('text', { x: 20, y: H - 26, class: 'dark small' }, 'One wingspan'));
    svg.append(el('text', { x: W - 20, y: H - 14, class: 'dark small', 'text-anchor': 'end' }, 'Dashed: the bearing line each wingman flies on. Spacing schematic.'));
    svg.setAttribute('aria-label', `${f.name}, seen from above. ${f.where}`);
    out.replaceChildren(para(`${f.name}. ${f.where} [4, ${/[–,]/.test(f.cite) ? 'pp.' : 'p.'} ${f.cite}]`), para(`Used for: ${f.use}`));
    press(rows.form, 'id', f.id); press(rows.side, 'side', state.side);
  };
  for (const f of ADMIN) button(rows.form, f.name, { id: f.id }, () => { state.form = f.id; draw(); });
  button(rows.side, 'Left', { side: -1 }, () => { state.side = -1; draw(); });
  button(rows.side, 'Right', { side: 1 }, () => { state.side = 1; draw(); });
  draw();
}

/* ---------- Figure 2: tactical formations ---------- */
const ALT = { 1: '11', 2: '12', 3: '13', 4: '14' };
function setupTactical(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const row = root.querySelector('[data-forms]');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  let id = 'wall';
  const draw = () => {
    const f = TACTICAL.find((x) => x.id === id), pts = tacticalPositions(id, 1);
    const { px, P } = fit(pts.flatMap((p) => [[p.x - 0.2, p.y - 0.15], [p.x + 0.2, p.y + 0.3]]), 80, 260);
    const size = Math.max(22, Math.min(34, px * 0.12));
    svg.replaceChildren(el('rect', { x: 0, y: 0, width: W, height: H, class: 'view' }));
    if (id === 'fluid') {
      // Tac wing area: from the drawn cruise bearing line aft, 0.2-0.6 nm.
      for (const [lead, s] of [[pts[0], -1], [pts[2], 1]]) {
        const poly = [];
        for (let a = TAC_WING.aft; a <= 90.01; a += 3) poly.push([lead.x + s * TAC_WING.max * Math.cos(a * D), lead.y + TAC_WING.max * Math.sin(a * D)]);
        for (let a = 90; a >= TAC_WING.aft - 0.01; a -= 3) poly.push([lead.x + s * TAC_WING.min * Math.cos(a * D), lead.y + TAC_WING.min * Math.sin(a * D)]);
        svg.append(el('polygon', { points: poly.map(([x, y]) => P(x, y).map((v) => v.toFixed(1)).join(',')).join(' '), class: 'zone' }));
      }
    }
    for (const p of pts.slice(1)) {
      const r = pts[p.ref - 1];
      const [x1, y1] = P(r.x, r.y), [x2, y2] = P(p.x, p.y);
      svg.append(el('line', { x1, y1, x2, y2, class: 'bearing' }));
    }
    if (id !== 'cruise') {
      const [ax, ay] = P(0, -0.12), [bx] = P(SPREAD, -0.12);
      svg.append(el('line', { x1: ax, y1: ay, x2: bx, y2: ay, class: 'thin' }), el('text', { x: (ax + bx) / 2, y: ay - 6, class: 'dark small', 'text-anchor': 'middle' }, '0.8–1.0 nm'));
    } else {
      const [ax, ay] = P(0, 0), [, by] = P(0, 0.5);
      svg.append(el('line', { x1: ax, y1: ay, x2: ax, y2: by + 40, class: 'thin' }), el('text', { x: ax + 6, y: (ay + by) / 2, class: 'dark small' }, '0.5 nm'));
    }
    for (const p of pts) {
      const [x, y] = P(p.x, p.y);
      const label = `−${p.n}${id === 'wall' ? `, ${ALT[p.n]}` : ''}${p.n === 1 ? ' lead' : ''}`;
      svg.append(...jet(x, y, size, 0, p.n === 1 ? 'lead' : ''), el('text', { x, y: y + size * 0.6 + 14, class: 'tag', 'text-anchor': 'middle' }, label));
    }
    svg.append(el('text', { x: 20, y: H - 14, class: 'dark small' }, id === 'wall'
      ? 'Numbers after the dash: each jet’s altitude in the FTI’s example game plan. Jets not to scale.'
      : id === 'fluid' ? 'Shaded: tac wing, 0.2–0.6 nm, drawn from 45° aft (illustrative). Jets not to scale.'
        : 'Laid out after the VT-35 slide; only the 0.5 nm interval is given. Jets not to scale.'));
    svg.setAttribute('aria-label', `${f.name}, seen from above. ${f.where}`);
    out.replaceChildren(para(`${f.name}. ${f.where} ${f.cite}`), para(`Used for: ${f.use}`));
    press(row, 'id', id);
  };
  for (const f of TACTICAL) button(row, f.name, { id: f.id }, () => { id = f.id; draw(); });
  draw();
}

/* ---------- Figure 3: division wall turns ---------- */
const TURN_SAY = {
  tac: 'Tac turn, 90°: the jet on the outside of the called turn turns first; each next jet turns as the preceding jet’s intakes come round toward it. They roll out line abreast on the new heading, in a new order. The animation uses the ideal timing, which here comes a little after that cue. [1, pp. 5-7, 7-4]',
  inplace: 'In-place turn, 180°: all four turn together and roll out line abreast on the reciprocal, each now on the other side of its section lead. [1, pp. 5-8, 7-5]',
};
function setupTurns(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const kinds = root.querySelector('[data-kind]'), dirs = root.querySelector('[data-dir]');
  const play = root.querySelector('[data-play]'), slider = root.querySelector('[data-time]');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const state = { kind: 'tac', dir: -1, t: 0 };
  let timer = null;
  const stop = () => { if (timer) cancelAnimationFrame(timer); timer = null; play.textContent = 'Play'; };
  const draw = () => {
    const end = turnEnd(state.kind) + 6;
    slider.max = String(Math.round(end));
    state.t = Math.min(state.t, end);
    slider.value = String(state.t);
    // Fit the whole manoeuvre: sample the tracks.
    const samples = [];
    for (let t = 0; t <= end; t += 0.5) samples.push(wallTurn(state.kind, state.dir, t));
    const all = samples.flat().map((p) => [p.x, -p.y]);
    const { px, P } = fit([...all, ...all.map(([x, y]) => [x, y - 0.2])], 50, 400);
    svg.replaceChildren(el('rect', { x: 0, y: 0, width: W, height: H, class: 'view' }));
    for (let i = 0; i < 4; i++) {
      const d = samples.filter((s, k) => k * 0.5 <= state.t).map((s, k) => `${k ? 'L' : 'M'}${P(s[i].x, -s[i].y).map((v) => v.toFixed(1)).join(' ')}`).join(' ');
      const full = samples.map((s, k) => `${k ? 'L' : 'M'}${P(s[i].x, -s[i].y).map((v) => v.toFixed(1)).join(' ')}`).join(' ');
      svg.append(el('path', { d: full, class: 'thin' }), el('path', { d, class: 'wake-track' }));
    }
    const now = wallTurn(state.kind, state.dir, state.t);
    for (const p of now) {
      const [x, y] = P(p.x, -p.y);
      const turning = state.t > p.start && state.t < p.end;
      svg.append(...jet(x, y, 26, p.h, `${p.n === 1 ? 'lead' : ''} ${turning ? 'turning' : ''}`, `−${p.n}`));
    }
    svg.append(el('text', { x: 20, y: 26, class: 'dark' }, `${state.kind === 'tac' ? 'Tac' : 'In-place'} turn ${state.dir < 0 ? 'left' : 'right'} · ${Math.round(state.t)} s`));
    svg.append(el('text', { x: W - 20, y: H - 14, class: 'dark small', 'text-anchor': 'end' }, `Ground tracks at about 300 kt, no wind; ${SPREAD} nm spacing; ${RADIUS} nm turn radius (illustrative). Red: turning.`));
    const turning = now.filter((p) => state.t > p.start && state.t < p.end).map((p) => `−${p.n}`);
    out.textContent = `${TURN_SAY[state.kind]} ${turning.length ? `Turning now: ${turning.join(', ')}.` : ''}`;
    svg.setAttribute('aria-label', `Division wall ${state.kind === 'tac' ? 'tac' : 'in-place'} turn ${state.dir < 0 ? 'left' : 'right'}, ${Math.round(state.t)} seconds in.`);
    press(kinds, 'kind', state.kind); press(dirs, 'dir', state.dir);
  };
  button(kinds, 'Tac turn (90°)', { kind: 'tac' }, () => { stop(); state.kind = 'tac'; state.t = 0; draw(); });
  button(kinds, 'In-place turn (180°)', { kind: 'inplace' }, () => { stop(); state.kind = 'inplace'; state.t = 0; draw(); });
  button(dirs, 'Left', { dir: -1 }, () => { stop(); state.dir = -1; state.t = 0; draw(); });
  button(dirs, 'Right', { dir: 1 }, () => { stop(); state.dir = 1; state.t = 0; draw(); });
  slider.addEventListener('input', () => { stop(); state.t = Number(slider.value); draw(); });
  play.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (state.t >= Number(slider.max)) state.t = 0;
    play.textContent = 'Pause';
    let last = performance.now();
    const tick = (now) => {
      state.t += ((now - last) / 1000) * 4; // four times real time
      last = now;
      if (state.t >= Number(slider.max)) { state.t = Number(slider.max); draw(); stop(); return; }
      draw();
      timer = requestAnimationFrame(tick);
    };
    timer = requestAnimationFrame(tick);
  });
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

const blocks = { admin: setupAdmin, tactical: setupTactical, turns: setupTurns, picks: setupPicks, terms: (r) => termQuiz(r, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  if (!blocks[root.dataset.lesson]) continue;
  blocks[root.dataset.lesson](root);
  root.classList.add('ready');
}
