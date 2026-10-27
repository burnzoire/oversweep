// Presentation for the Carrier and Amphibious Ship Operations module's figures
// and quizzes. Numbers and rules come from lesson-model.mjs; this file reads
// inputs and draws.
import { CASE_I, CHARLIE, FT_PER_NM, LENSES, ballPicture, dlqStatus, lensThickness } from './lesson-model.mjs';
import { quickQuiz, termQuiz, withDistractors } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const r0 = (v) => Math.round(v).toLocaleString('en-US');
const signed = (v, unit) => `${v > 0 ? '+' : v < 0 ? '−' : '±'}${r0(Math.abs(v))}${unit}`;
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

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
const field = (root, name) => root.querySelector(`[name="${name}"]`);
const checked = (root, name) => root.querySelector(`[name="${name}"]:checked`).value;
function show(root, name, text) {
  const o = root.querySelector(`output[for="${name}"]`);
  if (o) o.textContent = text;
}
const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
// A node's words, without the hover previews of any <Term> links in it.
function text(node) {
  const copy = node.cloneNode(true);
  copy.querySelectorAll('.term-tip').forEach((tip) => tip.remove());
  return copy.textContent.replace(/\s+/g, ' ').trim();
}

// Figure 1: a schematic plan of a carrier's flight deck, bow to the right and
// port at the top. Each part is a group the callouts below highlight.
const ANGLE = -10 * Math.PI / 180;
const along = (x0, y0, d, off = 0) => [x0 + d * Math.cos(ANGLE) - off * Math.sin(ANGLE), y0 + d * Math.sin(ANGLE) + off * Math.cos(ANGLE)];
function deckParts() {
  const A = [52, 182];
  const c = (d, off) => along(A[0], A[1], d, off);
  const line = (p, q, cls = 'part') => el('line', { class: cls, x1: p[0], y1: p[1], x2: q[0], y2: q[1] });
  return {
    angle: [line(c(0, 0), c(380, 0)), el('text', { class: 'lbl small', x: c(240, 44)[0], y: c(240, 44)[1], 'text-anchor': 'middle' }, 'Landing area centerline')],
    wires: [55, 80, 105, 130].map((d) => line(c(d, -20), c(d, 20))).concat(el('text', { class: 'lbl small', x: c(92, 34)[0], y: c(92, 34)[1] + 6, 'text-anchor': 'middle' }, 'Wires 1–4')),
    foul: [line(c(0, -26), c(380, -26), 'part dashed'), line(c(0, 26), c(380, 26), 'part dashed')],
    ramp: [el('path', { class: 'part', d: 'M44 132 Q36 165 44 206' }), el('text', { class: 'lbl small', x: 12, y: 126 }, 'Ramp')],
    lens: [el('rect', { class: 'partfill', x: 190, y: 92, width: 10, height: 14 }), el('text', { class: 'lbl small', x: 182, y: 84, 'text-anchor': 'end' }, 'Lens')],
    lso: [el('rect', { class: 'partfill', x: 78, y: 120, width: 16, height: 8 }), el('text', { class: 'lbl small', x: 70, y: 116, 'text-anchor': 'middle' }, 'LSO')],
    cats: [
      line([430, 152], [598, 152]), line([430, 182], [590, 182]),
      line(c(250, -8), c(370, -8)), line(c(260, 14), c(380, 14)),
      el('text', { class: 'lbl small', x: 520, y: 146, 'text-anchor': 'middle' }, 'Bow catapults'),
      el('text', { class: 'lbl small', x: c(300, -40)[0], y: c(300, -40)[1], 'text-anchor': 'middle' }, 'Waist catapults'),
    ],
    jbd: [line([424, 146], [424, 158], 'part heavy'), line([424, 176], [424, 188], 'part heavy'), line(c(244, -14), c(244, -2), 'part heavy'), line(c(254, 8), c(254, 20), 'part heavy')],
    island: [el('rect', { class: 'partfill', x: 360, y: 212, width: 60, height: 14 }), el('text', { class: 'lbl small', x: 390, y: 244, 'text-anchor': 'middle' }, 'Island')],
  };
}
function setupDeck(root) {
  const svg = root.querySelector('svg');
  const items = [...root.querySelectorAll('li[data-part]')];
  const parts = deckParts();
  const groups = {};
  svg.replaceChildren(
    el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 298 }),
    el('polygon', { class: 'deck', points: pts([[40, 128], [140, 116], [210, 72], [400, 52], [420, 70], [470, 120], [580, 132], [618, 162], [600, 194], [520, 222], [300, 230], [120, 226], [40, 210]]) }),
    el('text', { class: 'lbl small', x: 600, y: 24, 'text-anchor': 'end' }, 'Bow →'),
    el('text', { class: 'lbl small', x: 30, y: 24 }, 'Port side at the top'),
    el('text', { class: 'lbl small', x: 30, y: 286 }, 'Schematic, not to scale'),
  );
  for (const [id, nodes] of Object.entries(parts)) {
    const g = el('g', { 'data-part': id });
    g.append(...nodes);
    g.addEventListener('click', () => select(id));
    groups[id] = g;
    svg.append(g);
  }
  function select(id) {
    for (const li of items) {
      const on = li.dataset.part === id && !li.classList.contains('on');
      li.classList.toggle('on', on);
      li.querySelector('button').setAttribute('aria-pressed', String(on));
      groups[li.dataset.part]?.querySelectorAll('.part, .partfill').forEach((n) => n.classList.toggle('on', on));
    }
  }
  for (const li of items) li.querySelector('button').addEventListener('click', () => select(li.dataset.part));
}

// Quizzes built from a table on the page: the prompt column and the answer
// column of each row.
function tableQuiz(root, rows, { ask, right, wrong }) {
  quickQuiz({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') }, {
    items: rows,
    show: (q, prompt) => { prompt.textContent = ask(q); },
    options: (q) => withDistractors(q.answer, rows.map((r) => r.answer), 4),
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, ok) => (ok ? right(q) : wrong(q)),
  });
}
function setupJerseys(root) {
  const rows = [...document.querySelectorAll('[data-jerseys] tr[data-colour]')].map((tr) => ({ key: tr.dataset.colour, answer: text(tr.querySelector('[data-who]')) }));
  tableQuiz(root, rows, {
    ask: (q) => `Who wears a ${q.key.toLowerCase()} jersey on the flight deck?`,
    right: (q) => `Correct: ${q.key.toLowerCase()}.`,
    wrong: (q) => `Not quite. ${q.key}: ${q.answer}.`,
  });
}
function setupCalls(root) {
  const rows = [...document.querySelectorAll('[data-calls] tr')].filter((tr) => tr.querySelector('[data-call]')).map((tr) => ({ key: text(tr.querySelector('[data-call]')), answer: text(tr.querySelector('[data-action]')) }));
  tableQuiz(root, rows, {
    ask: (q) => `In the groove the LSO says ${q.key} What do you do?`,
    right: () => 'Correct.',
    wrong: (q) => `Not quite: ${q.answer}`,
  });
}

// Figure 2: the pattern stepper. The carrier pattern shows a plan above a
// profile; the Charlie pattern a plan only, since its source gives no heights.
const PATTERNS = {
  case1: {
    path: CASE_I,
    X: (x) => 40 + (x + 3.5) * 108, Y: (y) => 170 - y * 130, PY: (h) => 365 - h * 0.12,
    ship: [[-0.1, -0.035], [0.12, -0.035], [0.16, 0], [0.12, 0.035], [-0.1, 0.035]],
    grid: (s) => [
      el('text', { class: 'lbl', x: 12, y: 20 }, 'PLAN'),
      el('line', { class: 'thin dotted', x1: s.X(-3.5), y1: s.Y(0), x2: s.X(1.7), y2: s.Y(0) }),
      el('text', { class: 'lbl small', x: s.X(-3.4), y: s.Y(0) - 8 }, 'Base recovery course →'),
      ...[-3, -2, -1, 1].map((nm) => el('text', { class: 'lbl small', x: s.X(nm), y: 226, 'text-anchor': 'middle' }, `${Math.abs(nm)} NM ${nm < 0 ? 'astern' : 'ahead'}`)),
      el('text', { class: 'lbl', x: 12, y: 244 }, 'PROFILE (height exaggerated)'),
      el('line', { class: 'ln heavy', x1: 10, y1: s.PY(0), x2: 630, y2: s.PY(0) }),
      ...[400, 800].flatMap((ft) => [
        el('line', { class: 'grid', x1: 10, y1: s.PY(ft), x2: 630, y2: s.PY(ft) }),
        el('text', { class: 'lbl small', x: 14, y: s.PY(ft) - 4 }, `${ft} ft`),
      ]),
    ],
  },
  charlie: {
    path: CHARLIE,
    X: (x) => 320 + x * 300, Y: (y) => 130 - y * 165,
    ship: [[-0.28, -0.05], [0.18, -0.05], [0.26, 0], [0.18, 0.05], [-0.28, 0.05]],
    grid: (s) => [
      el('text', { class: 'lbl', x: 12, y: 20 }, 'PLAN'),
      el('line', { class: 'thin dotted', x1: s.X(-1), y1: s.Y(0), x2: s.X(1), y2: s.Y(0) }),
      el('text', { class: 'lbl small', x: s.X(1), y: s.Y(0) + 26, 'text-anchor': 'end' }, 'Base recovery course →'),
      el('text', { class: 'lbl small', x: 14, y: 36 }, 'Port side'),
      el('text', { class: 'lbl small', x: 14, y: 370 }, 'Starboard side'),
      el('text', { class: 'lbl small', x: s.X(0), y: s.Y(-1) + 4, 'text-anchor': 'middle' }, 'Starboard Delta (holding)'),
      el('text', { class: 'lbl small', x: s.X(-0.28), y: s.Y(0) + 22 }, 'Amphibious assault ship'),
    ],
  },
};
function setupPattern(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const chips = root.querySelector('[data-chips]');
  const play = root.querySelector('[data-play]');
  let mode = checked(root, 'pattern'), current = 0, timer = null, buttons = [];
  const lists = () => [...root.querySelectorAll('ol[data-steps]')];
  const steps = () => [...root.querySelectorAll(`ol[data-steps="${mode}"] li[data-step]`)];
  function build() {
    lists().forEach((ol) => { ol.hidden = ol.dataset.steps !== mode; });
    buttons = steps().map((li, i) => {
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: `${i + 1}. ${text(li.querySelector('strong')).replace(/[.,]$/, '')}` });
      b.addEventListener('click', () => { stop(); current = i; draw(); });
      return b;
    });
    chips.replaceChildren(...buttons);
  }
  function draw() {
    const s = PATTERNS[mode];
    const list = steps();
    const id = list[current].dataset.step;
    const at = s.path.findIndex((seg) => seg.id === id);
    const cls = (i) => (i === at ? 'ln heavy on' : i < at ? 'ln' : 'ln dashed');
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 378 }),
      ...s.grid(s),
      el('polygon', { class: 'deck', points: pts(s.ship.map(([x, y]) => [s.X(x), s.Y(y)])) }),
      ...s.path.flatMap((seg, i) => [
        el('polyline', { class: cls(i), points: pts(seg.pts.map(([x, y]) => [s.X(x), s.Y(y)])) }),
        ...(s.PY ? [el('polyline', { class: cls(i), points: pts(seg.pts.map(([x, , h]) => [s.X(x), s.PY(h)])) })] : []),
      ]),
    );
    const seg = s.path[at];
    const [x, y, h] = seg.pts[seg.pts.length - 1];
    svg.append(el('circle', { class: 'mine', cx: s.X(x), cy: s.Y(y), r: 6 }));
    if (s.PY) svg.append(el('circle', { class: 'mine', cx: s.X(x), cy: s.PY(h), r: 6 }));
    list.forEach((li, i) => li.classList.toggle('on', i === current));
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
    out.replaceChildren(para(`Step ${current + 1} of ${list.length}: ${text(list[current].querySelector('strong')).replace(/[.,]$/, '')}. The step is highlighted in the list.`));
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = 'Play'; }
  play.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (current === buttons.length - 1) current = 0;
    play.textContent = 'Pause';
    draw();
    timer = setInterval(() => {
      if (current >= buttons.length - 1) { stop(); return; }
      current += 1; draw();
    }, reduceMotion() ? 4000 : 2600);
  });
  root.querySelectorAll('[name="pattern"]').forEach((r) => r.addEventListener('change', () => {
    stop(); mode = checked(root, 'pattern'); current = 0; build(); draw();
  }));
  build();
  draw();
}

// Figure 3: the lens's wedge of light, drawn with the glideslope level and
// heights exaggerated, beside the lens face the pilot sees.
function setupWedge(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const LX = 430, CY = 130, K = 380 / 9000, V = 0.6;
  function draw() {
    const lens = LENSES[checked(root, 'lens')];
    const range = +field(root, 'range').value, height = +field(root, 'height').value;
    show(root, 'range', `${r0(range)} ft (${(range / FT_PER_NM).toFixed(2)} NM)`);
    show(root, 'height', signed(height, ' ft'));
    const b = ballPicture(height, range, lens);
    const half = lensThickness(9000, lens) / 2 * V;
    const ax = LX - range * K, ay = CY - Math.max(-115, Math.min(115, height * V));
    const cellLines = Array.from({ length: lens.cells - 1 }, (_, i) => {
      const f = 1 - 2 * (i + 1) / lens.cells;
      return el('line', { class: 'grid', x1: LX, y1: CY, x2: LX - 9000 * K, y2: CY - f * half });
    });
    // Lens face: cells stacked top to bottom, datum lights level with the
    // glideslope, the lit cell drawn as the ball.
    const FX = 520, FW = 40, FT = 30, FH = 200, ch = FH / lens.cells;
    const face = Array.from({ length: lens.cells }, (_, i) => el('rect', { class: 'dark', x: FX, y: FT + i * ch, width: FW, height: ch - 1 }));
    const datum = [-1, 1].flatMap((side) => Array.from({ length: 4 }, (_, i) => el('circle', { class: 'green', cx: side < 0 ? FX - 10 - i * 12 : FX + FW + 10 + i * 12, cy: FT + FH / 2, r: 4 })));
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 258 }),
      el('text', { class: 'lbl', x: 12, y: 20 }, 'SIDE VIEW (heights exaggerated)'),
      el('polygon', { class: 'deck', points: pts([[LX, CY], [LX - 9000 * K, CY - half], [LX - 9000 * K, CY + half]]) }),
      ...cellLines,
      el('line', { class: 'ln dashed', x1: LX, y1: CY, x2: 30, y2: CY }),
      el('text', { class: 'lbl small', x: 34, y: CY - 6 }, 'Glideslope'),
      el('rect', { class: 'fill', x: LX - 2, y: CY - 10, width: 6, height: 20 }),
      el('text', { class: 'lbl small', x: LX + 2, y: CY + 26, 'text-anchor': 'middle' }, 'Lens'),
      el('text', { class: 'lbl small', x: LX - 9000 * K, y: CY - half - 6 }, `Wedge ${r0(lensThickness(9000, lens))} ft thick at ${r0(9000)} ft`),
      el('line', { class: 'thin dotted', x1: ax, y1: CY, x2: ax, y2: ay }),
      el('circle', { class: b.visible ? 'mine' : 'mine bad', cx: ax, cy: ay, r: 6 }),
      el('text', { class: 'lbl small', x: ax, y: CY + 40, 'text-anchor': 'middle' }, `${r0(lensThickness(range, lens))} ft thick here`),
      el('text', { class: 'lbl', x: FX + FW / 2, y: 20, 'text-anchor': 'middle' }, 'LENS FACE'),
      ...face, ...datum,
    );
    if (b.visible) svg.append(el('circle', { class: b.red ? 'red' : 'amber', cx: FX + FW / 2, cy: FT + (b.cell - 0.5) * ch, r: Math.min(ch / 2 - 1, 9) }));
    const where = !b.visible
      ? (height > 0 ? 'Off the top of the lens: no ball. You are well high.' : 'Off the bottom of the lens: no ball. You are dangerously low.')
      : b.red ? 'Red ball: dangerously low. Add power now.'
        : Math.abs(b.deg) < lens.coverage / lens.cells / 2 ? 'Ball level with the datum lights: on the glideslope.'
          : `Ball ${b.deg > 0 ? 'above' : 'below'} the datum lights: ${b.deg > 0 ? 'high' : 'low'}.`;
    out.replaceChildren(
      para(where, b.visible && !b.red ? undefined : 'bad'),
      para(`${Math.abs(b.deg).toFixed(2)}° ${b.deg >= 0 ? 'above' : 'below'} the glideslope; the wedge is ${r0(lensThickness(range, lens))} ft thick at this range.${b.visible ? ` Lit cell ${b.cell} of ${lens.cells}, counted from the top.` : ''}`, 'derived'),
    );
  }
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
}

// Figure 4: deck landing currency under FM 1-564.
const STATUS = { current: 'Current', refresher: 'Refresher needed', initial: 'Initial qualification needed', 'not-covered': 'Not covered by the basic rules' };
function setupDlq(root) {
  const out = root.querySelector('[data-result]');
  function draw() {
    const v = (n) => +field(root, n).value;
    for (const n of ['in90', 'in180', 'in9mo', 'night90']) show(root, n, String(v(n)));
    show(root, 'hours', `${v('hours')} h`);
    const deck = checked(root, 'deck'), mode = checked(root, 'mode');
    const r = dlqStatus({ deck, mode, in90: v('in90'), in180: Math.max(v('in180'), v('in90')), in9mo: v('in9mo'), night90: v('night90'), hoursSinceNight: v('hours'), dayLandingIn24h: field(root, 'day24').checked });
    const list = document.createElement('ul');
    for (const n of r.needs) list.append(Object.assign(document.createElement('li'), { textContent: n }));
    out.replaceChildren(para(STATUS[r.status], r.status === 'current' ? undefined : 'bad'), ...(r.needs.length ? [list] : []));
  }
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
}

function setupTerms(root) { termQuiz(root, { hideTerm: true }); }

const blocks = { deck: setupDeck, jerseys: setupJerseys, pattern: setupPattern, wedge: setupWedge, calls: setupCalls, dlq: setupDlq, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
