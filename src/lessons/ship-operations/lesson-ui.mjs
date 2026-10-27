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

// Figure 1: a Nimitz-class flight deck in plan, bow to the right and port at
// the top. Coordinates are in feet: x forward from the round-down, y to port
// of the centerline. The class is 1,092 ft long and 252 ft wide overall with
// the landing area angled 9° to port; the places of the elevators, lens and
// LSO platform are approximate. Each part is a group the callouts highlight.
const DK = 0.52, DX = 34, DY = 158;
const dp = ([x, y]) => [DX + x * DK, DY - y * DK];
// Along the landing area: d ft up the angled centerline from the ramp, off ft
// to port of it.
const la = (d, off = 0) => {
  const c = Math.cos(9 * Math.PI / 180), s = Math.sin(9 * Math.PI / 180);
  return [d * c - off * s, -12 + d * s + off * c];
};
const DECK = [
  [0, -78], [0, 42], [60, 48], [200, 60], [290, 72], [360, 126], [790, 150], [850, 108],
  [1000, 82], [1070, 58], [1092, 30], [1092, -26], [1060, -60], [960, -86], [880, -102],
  [120, -102], [40, -92],
];
const ELEVATORS = [
  { n: 1, pts: [[880, -102], [950, -102], [950, -126], [880, -126]] },
  { n: 2, pts: [[750, -102], [820, -102], [820, -126], [750, -126]] },
  { n: 3, pts: [[500, -102], [570, -102], [570, -126], [500, -126]] },
  { n: 4, pts: [[205, 61], [275, 69], [272, 94], [202, 86]] },
];
function deckParts() {
  const seg = (p, q, cls = 'part') => { const [a, b] = [dp(p), dp(q)]; return el('line', { class: cls, x1: a[0], y1: a[1], x2: b[0], y2: b[1] }); };
  const label = (p, s, anchor = 'middle', dy = 0) => { const [x, y] = dp(p); return el('text', { class: 'lbl small', x, y: y + dy, 'text-anchor': anchor }, s); };
  const box = (cls, corners) => el('polygon', { class: cls, points: pts(corners.map(dp)) });
  const cat = (p, q, n, at) => [seg(p, q), label(at, `Cat ${n}`, 'middle', 3)];
  return {
    angle: [seg(la(0), la(760)), label(la(380, -20), 'Landing area, 9°', 'middle', 4)],
    wires: [150, 190, 230, 270].map((d) => seg(la(d, -36), la(d, 36))).concat(label(la(210, -52), 'Wires 1–4', 'middle', 4)),
    foul: [seg(la(0, 36), la(760, 36), 'part dashed'), seg(la(0, -40), la(760, -40), 'part dashed'), label(la(600, -54), 'Foul line', 'middle', 4)],
    ramp: [seg([0, -78], [0, 42], 'part heavy'), label([-6, 50], 'Ramp', 'start', -6)],
    lens: [box('partfill', [[388, 127], [410, 128], [410, 138], [388, 137]]), label([399, 142], 'Lens', 'middle', -4)],
    lso: [box('partfill', [[70, 47], [105, 50], [105, 60], [70, 57]]), label([87, 64], 'LSO', 'middle', -4)],
    cats: [
      ...cat([800, -34], [1080, -40], 1, [940, -52]),
      ...cat([800, 4], [1075, 16], 2, [940, 24]),
      ...cat(la(480, -14), la(745, -14), 3, la(612, -27)),
      ...cat(la(470, 18), la(740, 18), 4, la(605, 30)),
    ],
    jbd: [
      seg([780, -46], [780, -22], 'part heavy'), seg([780, -8], [780, 16], 'part heavy'),
      seg(la(462, -26), la(462, -2), 'part heavy'), seg(la(452, 6), la(452, 30), 'part heavy'),
    ],
    island: [box('partfill', [[600, -84], [730, -84], [730, -102], [600, -102]]), label([665, -112], 'Island (PriFly)', 'middle', 6)],
  };
}
function setupDeck(root) {
  const svg = root.querySelector('svg');
  const items = [...root.querySelectorAll('li[data-part]')];
  const parts = deckParts();
  const groups = {};
  const bar = [dp([0, -170]), dp([200, -170])];
  svg.replaceChildren(
    el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 298 }),
    el('polygon', { class: 'deck', points: pts(DECK.map(dp)) }),
    ...ELEVATORS.flatMap((e) => {
      const c = e.pts.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]);
      const [x, y] = dp(c);
      return [el('polygon', { class: 'deck', points: pts(e.pts.map(dp)) }), el('text', { class: 'lbl small', x, y: y + 4, 'text-anchor': 'middle' }, String(e.n))];
    }),
    el('line', { class: 'thin dotted', x1: dp([0, 0])[0], y1: dp([0, 0])[1], x2: dp([1092, 0])[0], y2: dp([1092, 0])[1] }),
    el('text', { class: 'lbl small', x: 630, y: 22, 'text-anchor': 'end' }, 'Bow →'),
    el('text', { class: 'lbl small', x: 12, y: 22 }, 'NIMITZ CLASS: 1,092 ft long, 252 ft wide · port side at the top'),
    el('text', { class: 'lbl small', x: dp([1000, -150])[0], y: dp([1000, -150])[1], 'text-anchor': 'middle' }, 'Elevators 1–4'),
    el('line', { class: 'ln', x1: bar[0][0], y1: bar[0][1], x2: bar[1][0], y2: bar[1][1] }),
    ...[0, 100, 200].map((f) => el('line', { class: 'thin', x1: dp([f, 0])[0], y1: bar[0][1] - 4, x2: dp([f, 0])[0], y2: bar[0][1] + 4 })),
    el('text', { class: 'lbl small', x: bar[1][0] + 6, y: bar[0][1] + 4 }, '200 ft'),
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

// Figure 2: the pattern stepper, drawn as an oblique view in the manner of
// the training instruction's pattern figure: the flight path as a ribbon,
// its track on the water below it, and each position called out. Positions
// are in NM (x ahead along the BRC, y to port) and heights in ft.
function smooth(points) {
  // Catmull-Rom through screen points, as cubic Béziers.
  if (points.length < 3) return `M${points.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L')}`;
  let d = `M${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(points.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((v) => v.toFixed(1)).join(' ')} ${c2.map((v) => v.toFixed(1)).join(' ')} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const joined = (path) => path.flatMap((seg, i) => (i ? seg.pts.slice(1) : seg.pts));
// A ship's deck outline in its own units (fraction of length ahead of the
// stern, fraction of length to port), drawn exaggerated in size.
const CARRIER_SHAPE = DECK.map(([x, y]) => [x / 1092, y / 1092]);
const ISLAND_SHAPE = [[600, -84], [730, -84], [730, -102], [600, -102]].map(([x, y]) => [x / 1092, y / 1092]);
const AMPHIB_SHAPE = [[0, -0.06], [0, 0.06], [0.88, 0.06], [1, 0.02], [1, -0.02], [0.88, -0.06], [0.62, -0.06], [0.62, -0.085], [0.42, -0.085], [0.42, -0.06]];

const VIEWS = {
  case1: {
    path: CASE_I,
    // The initial is drawn from 2.2 NM astern to keep the figure compact.
    drawn: CASE_I.map((seg) => (seg.id === 'initial' ? { ...seg, pts: [[-2.2, -0.25, 800], [0, -0.2, 800]] } : seg)),
    // Oblique view from above the ship's starboard quarter, as in the training
    // instruction's figure: ahead runs right, port away up the page, height up.
    P: ([x, y, h = 0]) => [380 + x * 90 - y * 50, 300 - x * 30 - y * 130 - h * 0.06],
    ship: { shape: CARRIER_SHAPE, island: ISLAND_SHAPE, at: [-0.04, 0], len: 0.8 },
    title: 'CASE I CARRIER PATTERN (T-45)',
    note: 'Heights exaggerated; ship drawn larger than scale; the ship sails ahead during the pattern.',
    callouts: {
      initial: { at: [-1.4, -0.24, 800], dx: -40, dy: 20, lines: ['INITIAL', '3 NM astern, 800 ft', '250–300 KIAS'] },
      break: { at: [1.45, 0.1, 800], dx: 30, dy: -100, lines: ['BREAK', 'Over or past the bow', '70–80° AOB, 15 s apart'] },
      downwind: { at: [0.6, 1.0, 600], dx: 10, dy: -46, lines: ['DOWNWIND', '600 ft, on speed', 'Landing checks'] },
      abeam: { at: [0, 1.0, 600], dx: -80, dy: -40, lines: ['ABEAM (180)', '0.9–1.1 NM abeam', '27–30° AOB, 200–300 fpm'] },
      ninety: { at: [-0.62, 0.6, 450], dx: -90, dy: -20, lines: ['90', '450 ft', '500 fpm'] },
      fortyfive: { at: [-0.82, 0.25, 340], dx: -90, dy: 4, lines: ['45', '325–375 ft', 'Acquire the ball'] },
      groove: { at: [-0.45, 0.08, 180], dx: 10, dy: 50, lines: ['GROOVE', '15–18 s, ball call'] },
      touchdown: { at: [0, 0, 0], dx: 110, dy: 36, lines: ['TOUCHDOWN', 'Full power'] },
    },
  },
  charlie: {
    path: CHARLIE.map((seg) => ({ ...seg, pts: seg.pts.map(([x, y]) => [x, y, 0]) })),
    P: ([x, y, h = 0]) => [330 + x * 140 - y * 50, 190 - x * 40 - y * 110 - h * 0.06],
    ship: { shape: AMPHIB_SHAPE, at: [-0.3, 0], len: 0.45 },
    title: 'HELICOPTER CHARLIE PATTERN, PORT SPOT (AMPHIBIOUS SHIP)',
    note: 'Track over the water only: the Army manual gives no pattern heights. Ship drawn larger than scale.',
    callouts: {
      delta: { at: [0.75, -1], dx: 40, dy: 40, lines: ['STARBOARD DELTA', '1 NM to starboard, 300 ft', 'Right-hand racetrack'] },
      upwind: { at: [0.3, 0.15], dx: 90, dy: -50, lines: ['UPWIND', 'Port side, parallel to the BRC'] },
      downwind: { at: [0.3, 0.6], dx: 40, dy: -40, lines: ['DOWNWIND', 'Back toward the stern'] },
      turn: { at: [-0.3, 0.42], dx: -60, dy: -30, lines: ['TURN IN', 'No later than abeam the spot'] },
      fortyfive: { at: [-0.15, 0.15], dx: -70, dy: 40, lines: ['45° LINE', 'LSE picks you up'] },
      spot: { at: [0, 0], dx: -60, dy: 90, lines: ['SPOT', "Hover, land on the LSE's signals"] },
    },
  },
};
VIEWS.charlie.drawn = VIEWS.charlie.path;

function drawShip(s) {
  const { shape, at, len } = s.ship;
  const deck = shape.map(([u, v]) => s.P([at[0] + u * len, at[1] + v * len]));
  const stern = s.P([at[0], at[1]]);
  const wake = [[-0.9, -0.05], [-0.9, 0.05]].map(([u, v]) => s.P([at[0] + u * len * 2, at[1] + v * len * 3]));
  return [
    el('path', { class: 'wake', d: `M${stern[0]} ${stern[1]} L${wake[0][0]} ${wake[0][1]} M${stern[0]} ${stern[1]} L${wake[1][0]} ${wake[1][1]}` }),
    el('polygon', { class: 'deck', points: pts(deck) }),
    ...(s.ship.island ? [el('polygon', { class: 'fill', points: pts(s.ship.island.map(([u, v]) => s.P([at[0] + u * len, at[1] + v * len]))) })] : []),
  ];
}
function callout(s, c, on) {
  const [ax, ay] = s.P(c.at);
  const ty = ay + c.dy;
  const right = c.dx < 0;
  const anchor = right ? 'end' : 'start';
  const w = Math.max(...c.lines.map((l) => l.length)) * 5.6;
  const tx = right ? Math.max(ax + c.dx, w + 10) : Math.min(ax + c.dx, 630 - w);
  const g = el('g', { class: on ? 'callout on' : 'callout' });
  g.append(
    el('line', { class: 'thin', x1: ax, y1: ay, x2: tx, y2: ty }),
    el('line', { class: on ? 'ln on' : 'ln', x1: tx, y1: ty, x2: right ? tx - w : tx + w, y2: ty }),
    ...c.lines.map((line, i) => el('text', { class: i ? 'lbl small' : 'lbl', x: right ? tx - 2 : tx + 2, y: i ? ty + 4 + i * 12 : ty - 4, 'text-anchor': anchor }, line)),
  );
  return g;
}
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
    const s = VIEWS[mode];
    const list = steps();
    const id = list[current].dataset.step;
    const at = s.path.findIndex((seg) => seg.id === id);
    const route = mode === 'charlie' ? s.drawn.slice(1) : s.drawn;
    const track = (segs) => smooth(joined(segs).map(([x, y]) => s.P([x, y, 0])));
    const ribbon = (segs) => smooth(joined(segs).map((p) => s.P(p)));
    const body = [];
    // Track on the water, and drop lines from the path at each position.
    body.push(el('path', { class: 'thin dotted', d: track(route) }));
    if (mode === 'charlie') body.push(el('path', { class: 'thin dotted', d: track([s.drawn[0]]) }));
    if (mode === 'case1') {
      for (const seg of s.drawn) {
        const p = seg.pts[seg.pts.length - 1];
        const [x1, y1] = s.P(p), [x2, y2] = s.P([p[0], p[1], 0]);
        body.push(el('line', { class: 'thin dotted', x1, y1, x2, y2 }));
      }
    }
    body.push(...drawShip(s));
    // The ribbon: a wide dark stroke under a narrower white one; flown
    // segments solid, the current one in colour.
    const draws = mode === 'charlie' ? [[s.drawn[0]], route] : [route];
    for (const segs of draws) {
      body.push(el('path', { class: 'ribbon-edge', d: ribbon(segs) }), el('path', { class: 'ribbon', d: ribbon(segs) }));
    }
    if (at >= 0) body.push(el('path', { class: 'ribbon-on', d: ribbon([s.drawn[at]]) }));
    const seg = s.drawn[at];
    const [ex, ey] = s.P(seg.pts[seg.pts.length - 1]);
    body.push(el('circle', { class: 'mine', cx: ex, cy: ey, r: 5 }));
    for (const [key, c] of Object.entries(s.callouts)) body.push(callout(s, c, key === id));
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 378 }),
      el('text', { class: 'lbl', x: 12, y: 20 }, s.title),
      el('line', { class: 'ln', x1: 12, y1: 25, x2: 12 + s.title.length * 7.2, y2: 25 }),
      ...windArrow(),
      ...body,
      el('text', { class: 'lbl small', x: 12, y: 42 }, s.note),
    );
    list.forEach((li, i) => li.classList.toggle('on', i === current));
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
    out.replaceChildren(para(`Step ${current + 1} of ${list.length}: ${text(list[current].querySelector('strong')).replace(/[.,]$/, '')}. The step is highlighted in the list.`));
  }
  // An arrow along the BRC, the ship's heading, in the figure's top right.
  function windArrow() {
    const s = VIEWS[mode];
    const [ax, ay] = s.P([0, 0]), [bx, by] = s.P([1, 0]);
    const n = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / n, uy = (by - ay) / n;
    const x0 = 560, y0 = 262, x1 = x0 + ux * 44, y1 = y0 + uy * 44;
    return [
      el('line', { class: 'ln heavy', x1: x0, y1: y0, x2: x1, y2: y1 }),
      el('path', { class: 'fill', d: `M${x1 + ux * 8} ${y1 + uy * 8} L${x1 - uy * 6} ${y1 + ux * 6} L${x1 + uy * 6} ${y1 - ux * 6} Z` }),
      el('text', { class: 'lbl small', x: x0, y: y0 + 18, 'text-anchor': 'middle' }, 'BRC'),
    ];
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
