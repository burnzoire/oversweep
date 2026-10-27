// Presentation for the Carrier and Amphibious Ship Operations module's figures
// and quizzes. Numbers and rules come from lesson-model.mjs; this file reads
// inputs and draws.
import { CASE_I, CHARLIE, FT_PER_NM, LENSES, ballPicture, dlqStatus, lensThickness, readComment } from './lesson-model.mjs';
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
// the top, traced from an overhead photograph of USS Nimitz and scaled to the
// class's 1,092 ft length. Coordinates are in feet: x forward from the ramp,
// y to port of the centerline. Each part is a group the callouts highlight.
const DK = 0.52, DX = 34, DY = 162;
const dp = ([x, y]) => [DX + x * DK, DY - y * DK];
// The landing area's centerline, angled 9° to port from near the starboard
// side of the ramp. la(d, off): d ft up it, off ft to port of it.
const la = (d, off = 0) => {
  const c = Math.cos(9 * Math.PI / 180), s = Math.sin(9 * Math.PI / 180);
  return [d * c - off * s, -12 + d * s + off * c];
};
const DECK = [
  [0, 53], [121, 68], [150, 120], [720, 130], [814, 72], [1066, 52], [1086, 43], [1092, 38],
  [1092, -38], [1086, -42], [820, -57], [740, -109], [136, -109], [133, -83], [52, -77], [33, -53], [0, -53],
];
// Elevators: 1 and 2 on the starboard side forward of the island, 3 on the
// starboard side aft of it and 4 on the port side aft, each traced from its
// painted outline with the cut corner it has.
const ELEVATORS = [
  { n: 1, at: [592, -78], pts: [[553, -52], [628, -52], [629, -85], [642, -109], [553, -109]] },
  { n: 2, at: [431, -78], pts: [[398, -52], [458, -52], [460, -82], [474, -109], [398, -109]] },
  { n: 3, at: [177, -78], pts: [[142, -49], [205, -49], [213, -57], [213, -109], [142, -109]] },
  { n: 4, at: [184, 97], pts: [[152, 74], [212, 74], [228, 120], [152, 120]] },
];
const rect = ([x0, x1], [y0, y1]) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
function deckParts() {
  // Lines on the deck are clipped to its edge.
  const seg = (p, q, cls = 'part') => { const [a, b] = [dp(p), dp(q)]; return el('line', { class: cls, x1: a[0], y1: a[1], x2: b[0], y2: b[1], ...(cls.includes('heavy') ? {} : { 'clip-path': 'url(#deck-clip)' }) }); };
  const label = (p, s, anchor = 'middle', dy = 0, onDeck = true) => { const [x, y] = dp(p); return el('text', { class: onDeck ? 'lbl small halo' : 'lbl small', x, y: y + dy, 'text-anchor': anchor }, s); };
  const box = (cls, corners) => el('polygon', { class: cls, points: pts(corners.map(dp)) });
  return {
    angle: [seg(la(0), la(770)), label(la(380, 0), 'Angled deck centerline, 9°', 'start', 12)],
    wires: [167, 205, 242, 279].map((d) => seg(la(d, -34), la(d, 34))).concat(label(la(223, -46), 'Wires 1–4', 'middle', 6)),
    foul: [seg(la(0, 32), la(770, 32), 'part dashed'), seg(la(0, -32), la(770, -32), 'part dashed'), label(la(110, 32), 'Foul line', 'middle', -4)],
    ramp: [seg([0, 53], [0, -53], 'part heavy'), label([0, -53], 'Ramp', 'start', 12, false)],
    lens: [box('partfill', rect([328, 344], [138, 128])), label([336, 146], 'Lens', 'middle', -4, false)],
    lso: [box('partfill', rect([35, 55], [80, 66])), label([45, 88], 'LSO', 'middle', -4, false)],
    cats: [
      seg([700, -49], [1078, -26]), label([960, -32], 'Cat 1', 'middle', -4),
      seg([700, 23], [1061, 30]), label([1000, 33], 'Cat 2', 'middle', -4),
      seg([345, 67], [650, 96]), label([560, 87], 'Cat 3', 'middle', -3),
      seg([330, 110], [650, 112]), label([560, 131], 'Cat 4', 'middle', -4, false),
    ],
    jbd: [
      box('partfill', rect([628, 643], [37, 2])), box('partfill', rect([640, 657], [-37, -72])),
      box('partfill', rect([277, 293], [118, 94])), box('partfill', rect([328, 346], [84, 50])),
    ],
    island: [box('partfill', rect([250, 375], [-72, -109])), label([312, -120], 'Island (PriFly)', 'middle', 6, false)],
  };
}
function setupDeck(root) {
  const svg = root.querySelector('svg');
  const items = [...root.querySelectorAll('li[data-part]')];
  const parts = deckParts();
  const groups = {};
  const bar = [dp([0, -150]), dp([200, -150])];
  const clip = el('clipPath', { id: 'deck-clip' });
  clip.append(el('polygon', { points: pts(DECK.map(dp)) }));
  svg.replaceChildren(
    el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 298 }),
    el('polygon', { class: 'deck', points: pts(DECK.map(dp)) }),
    clip,
    ...ELEVATORS.flatMap((e) => {
      const [x, y] = dp(e.at);
      return [el('polygon', { class: 'elevator', points: pts(e.pts.map(dp)) }), el('text', { class: 'lbl small halo', x, y: y + 4, 'text-anchor': 'middle' }, `Elev. ${e.n}`)];
    }),
    el('line', { class: 'thin dotted', x1: dp([0, 0])[0], y1: dp([0, 0])[1], x2: dp([1092, 0])[0], y2: dp([1092, 0])[1] }),
    el('text', { class: 'lbl small', x: 630, y: 22, 'text-anchor': 'end' }, 'Bow →'),
    el('text', { class: 'lbl small', x: 12, y: 22 }, 'NIMITZ CLASS, 1,092 ft · port side at the top · dotted line: ship centerline'),
    el('line', { class: 'ln', x1: bar[0][0], y1: bar[0][1], x2: bar[1][0], y2: bar[1][1] }),
    ...[0, 100, 200].map((f) => el('line', { class: 'thin', x1: dp([f, 0])[0], y1: bar[0][1] - 4, x2: dp([f, 0])[0], y2: bar[0][1] + 4 })),
    el('text', { class: 'lbl small', x: bar[1][0] + 6, y: bar[0][1] + 4 }, '200 ft'),
  );
  // Labels go above every line, with a halo in the deck's colour, so no line
  // runs through a word.
  const labels = el('g');
  for (const [id, nodes] of Object.entries(parts)) {
    const g = el('g', { 'data-part': id });
    const words = el('g');
    g.append(...nodes.filter((n) => n.tagName !== 'text'));
    words.append(...nodes.filter((n) => n.tagName === 'text'));
    for (const n of [g, words]) n.addEventListener('click', () => select(id));
    groups[id] = g;
    svg.append(g);
    labels.append(words);
  }
  svg.append(labels);
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
// The LSO's lettered grading symbols, read from the tables on the page.
const codeRows = () => [...document.querySelectorAll('[data-codes] tr[data-code]')].map((tr) => ({ key: tr.dataset.code, kind: tr.dataset.kind, answer: text(tr.querySelector('[data-meaning]')) }));
function setupCodes(root) {
  tableQuiz(root, codeRows(), {
    ask: (q) => `What does the LSO's symbol ${q.key} mean?`,
    right: (q) => `Correct: ${q.key} is ${q.answer.toLowerCase()}.`,
    wrong: (q) => `Not quite. ${q.key}: ${q.answer}.`,
  });
}
function setupDecode(root) {
  const input = root.querySelector('[data-comment]');
  const out = root.querySelector('[data-result]');
  const codes = new Map(codeRows().map((r) => [r.key, r.answer]));
  const word = (t, i) => {
    const m = t.meaning.split(/[:,]/)[0];
    const s = i ? m.charAt(0).toLowerCase() + m.slice(1) : m;
    return t.slight ? `${i ? 'slightly' : 'Slightly'} ${s.charAt(0).toLowerCase()}${s.slice(1)}` : s;
  };
  function draw() {
    const readings = readComment(input.value, codes);
    if (!input.value.trim()) { out.replaceChildren(para('Type a comment.')); return; }
    if (!readings.length) { out.replaceChildren(para('That string does not split into the symbols in the tables. Drawn symbols and the square and circle marks cannot be typed.')); return; }
    out.replaceChildren(...readings.map((r, n) => {
      const p = document.createElement('p');
      const codesText = r.map((t) => (t.slight ? `(${t.code})` : t.code)).join(' · ');
      p.append(Object.assign(document.createElement('strong'), { textContent: `${readings.length > 1 ? `Reading ${n + 1}: ` : ''}${codesText}` }), ` — ${r.map(word).join(', ')}.`);
      return p;
    }));
  }
  input.addEventListener('input', draw);
  draw();
}
function setupCalls(root) {
  const rows = [...document.querySelectorAll('[data-calls] tr')].filter((tr) => tr.querySelector('[data-call]')).map((tr) => ({ key: text(tr.querySelector('[data-call]')), answer: text(tr.querySelector('[data-action]')) }));
  tableQuiz(root, rows, {
    ask: (q) => `In the groove the LSO says ${q.key} What do you do?`,
    right: () => 'Correct.',
    wrong: (q) => `Not quite: ${q.answer}`,
  });
}

// Figure 2: the pattern stepper, drawn as a low oblique view from the ship's
// starboard quarter so that height reads straight up the page: the flight
// path as a smooth ribbon, drop lines to its track on the water, and the
// training instruction's numbers at each position. Positions are in NM (x
// ahead along the BRC, y to port) and heights in ft.

// A Catmull-Rom spline through 3-D waypoints, sampled densely, each sample
// tagged with the index of the segment (pattern step) it belongs to.
function spline(path) {
  const way = [], tag = [];
  path.forEach((seg, i) => seg.pts.forEach((p, j) => { if (i && !j) return; way.push(p.length === 3 ? p : [...p, 0]); tag.push(j === 0 && i ? i - 1 : i); }));
  const out = [];
  for (let k = 0; k < way.length - 1; k += 1) {
    const p0 = way[Math.max(0, k - 1)], p1 = way[k], p2 = way[k + 1], p3 = way[Math.min(way.length - 1, k + 2)];
    for (let t = 0; t < 1; t += 0.1) {
      const t2 = t * t, t3 = t2 * t;
      const p = [0, 1, 2].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3));
      out.push({ p, seg: tag[k + 1] });
    }
  }
  out.push({ p: way[way.length - 1], seg: path.length - 1 });
  return out;
}
const line2d = (list) => `M${list.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L')}`;

const VIEWS = {
  case1: {
    path: CASE_I,
    drawn: CASE_I.map((seg) => (seg.id === 'initial' ? { ...seg, pts: [[-1.6, -0.22, 800], ...seg.pts.filter(([x]) => x > -1.6)] } : seg)),
    P: ([x, y, h = 0]) => [385 - y * 250 + x * 40, 305 - x * 38 - h * 0.24],
    title: 'CASE I CARRIER PATTERN (T-45)',
    note: 'Seen from astern. Heights exaggerated; ship drawn larger than scale; the ship sails ahead during the pattern.',
    marks: [
      { id: 'initial', at: [-1.2, -0.22, 800], h: '800 ft', lines: ['INITIAL', '3 NM astern', '250–300 KIAS'], dx: 110, dy: 6 },
      { id: 'break', at: [1.0, -0.18, 800], h: '800 ft', lines: ['BREAK', 'Over or past the bow', '70–80° AOB, 15 s apart'], dx: 70, dy: 4 },
      { id: 'downwind', at: [0.5, 1.0, 620], h: '', lines: ['DOWNWIND', 'On speed, landing checks'], dx: 50, dy: 10 },
      { id: 'abeam', at: [0, 1.0, 600], h: '600 ft', lines: ['ABEAM (180)', '0.9–1.1 NM abeam', '27–30° AOB'], dx: -24, dy: 26 },
      { id: 'ninety', at: [-0.6, 0.62, 450], h: '450 ft', lines: ['90', '500 fpm'], dx: -66, dy: 62 },
      { id: 'fortyfive', at: [-0.86, 0.28, 350], h: '325–375 ft', lines: ['45', 'Acquire the ball'], dx: -60, dy: 92 },
      { id: 'groove', at: [-0.6, 0.03, 220], h: '', lines: ['GROOVE', '15–18 s, ball call'], dx: 150, dy: 10 },
      { id: 'touchdown', at: [0, 0, 0], h: '', lines: ['TOUCHDOWN', 'Full power'], dx: 120, dy: 50 },
    ],
  },
  charlie: {
    path: CHARLIE,
    drawn: CHARLIE,
    P: ([x, y]) => [330 - y * 170 + x * 60, 250 - x * 110],
    title: 'HELICOPTER CHARLIE PATTERN, PORT SPOT (AMPHIBIOUS SHIP)',
    note: 'Seen from astern, over the water: the Army manual gives no pattern heights. Ship drawn larger than scale.',
    marks: [
      { id: 'delta', at: [0.75, -1], lines: ['STARBOARD DELTA', '1 NM to starboard, 300 ft'], dx: 30, dy: -40 },
      { id: 'upwind', at: [0.3, 0.15], lines: ['UPWIND', 'Parallel to the BRC'], dx: 30, dy: -120 },
      { id: 'downwind', at: [0.4, 0.6], lines: ['DOWNWIND', 'Back toward the stern'], dx: -40, dy: -40 },
      { id: 'turn', at: [-0.28, 0.48], lines: ['TURN IN', 'No later than abeam the spot'], dx: -40, dy: 40 },
      { id: 'fortyfive', at: [-0.15, 0.15], lines: ['45° LINE', 'LSE picks you up'], dx: 40, dy: 90 },
      { id: 'spot', at: [0, 0], lines: ['SPOT', 'Land on the', "LSE's signals"], dx: 26, dy: 40 },
    ],
  },
};

// The ship seen from astern: hull and deck on the water, the island standing
// up from the starboard edge.
function drawShip(s, mode) {
  const L = 0.6, W = 1.25;
  const outline = mode === 'case1' ? DECK : [[0, 53], [700, 53], [844, 15], [844, -15], [700, -53], [0, -53]];
  const at = ([x, y]) => s.P([-0.05 + x / 1092 * L, y / 1092 * L * W]);
  const deck = outline.map(at);
  const isl = mode === 'case1' ? [[250, -95], [375, -95]] : [[380, -45], [560, -45]];
  const [a, b] = isl.map(at);
  const stern = at([0, 0]), wake = s.P([-0.05 - L * 1.4, 0]);
  return [
    el('path', { class: 'wake', d: `M${stern[0] - 8} ${stern[1]} L${wake[0] - 14} ${wake[1]} M${stern[0] + 8} ${stern[1]} L${wake[0] + 14} ${wake[1]}` }),
    el('polygon', { class: 'hull', points: pts(deck.map(([x, y]) => [x, y + 6])) }),
    el('polygon', { class: 'deck', points: pts(deck) }),
    el('polygon', { class: 'fill', points: pts([a, b, [b[0], b[1] - 18], [a[0], a[1] - 22]]) }),
  ];
}
function callout(s, m, on) {
  const [ax, ay] = s.P(m.at);
  const right = m.dx < 0;
  const w = Math.max(...m.lines.map((l) => l.length)) * 5.8 + 4;
  const tx = right ? Math.max(ax + m.dx, w + 10) : Math.min(ax + m.dx, 630 - w);
  const ty = Math.max(54, Math.min(372 - m.lines.length * 12, ay + m.dy));
  const g = el('g', { class: on ? 'callout on' : 'callout' });
  g.append(
    el('line', { class: 'thin', x1: ax, y1: ay, x2: tx, y2: ty }),
    el('line', { class: on ? 'ln on' : 'ln', x1: tx, y1: ty, x2: right ? tx - w : tx + w, y2: ty }),
    ...m.lines.map((text, i) => el('text', { class: i ? 'lbl small' : 'lbl', x: right ? tx - 2 : tx + 2, y: i ? ty + 2 + i * 12 : ty - 4, 'text-anchor': right ? 'end' : 'start' }, text)),
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
    const at = s.drawn.findIndex((seg) => seg.id === id);
    // The Charlie pattern's Delta is a separate holding pattern.
    const parts = mode === 'charlie' ? [[0, s.drawn.slice(0, 1)], [1, s.drawn.slice(1)]] : [[0, s.drawn]];
    const body = [];
    const ribbons = [];
    for (const [offset, segs] of parts) {
      const samples = spline(segs).map((q) => ({ ...q, seg: q.seg + offset }));
      body.push(el('path', { class: 'track', d: line2d(samples.map((q) => s.P([q.p[0], q.p[1], 0]))) }));
      ribbons.push(el('path', { class: 'ribbon-edge', d: line2d(samples.map((q) => s.P(q.p))) }), el('path', { class: 'ribbon', d: line2d(samples.map((q) => s.P(q.p))) }));
      const mine = samples.filter((q, i) => q.seg === at || samples[i + 1]?.seg === at);
      if (mine.length > 1) ribbons.push(el('path', { class: 'ribbon-on', d: line2d(mine.map((q) => s.P(q.p))) }));
    }
    // Drop lines and height tags at each position.
    for (const m of s.marks) {
      if (!m.at[2]) continue;
      const [x1, y1] = s.P(m.at), [x2, y2] = s.P([m.at[0], m.at[1], 0]);
      body.push(el('line', { class: m.id === id ? 'drop on' : 'drop', x1, y1, x2, y2 }), el('circle', { class: 'fill', cx: x2, cy: y2, r: 1.8 }));
      if (m.h) body.push(el('text', { class: m.id === id ? 'lbl small hon' : 'lbl small', x: x2 + 4, y: (y1 + y2) / 2 + 4 }, m.h));
    }
    const mark = s.marks.find((m) => m.id === id);
    const [mx, my] = s.P(mark.at);
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 378 }),
      el('text', { class: 'lbl', x: 12, y: 20 }, s.title),
      el('line', { class: 'ln', x1: 12, y1: 25, x2: 12 + s.title.length * 7.3, y2: 25 }),
      el('text', { class: 'lbl small', x: 12, y: 40 }, s.note),
      ...brcLine(s),
      ...body,
      ...drawShip(s, mode),
      ...ribbons,
      el('circle', { class: 'mine', cx: mx, cy: my, r: 5 }),
      ...s.marks.map((m) => callout(s, m, m.id === id)),
    );
    list.forEach((li, i) => li.classList.toggle('on', i === current));
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
    out.replaceChildren(para(`Step ${current + 1} of ${list.length}: ${text(list[current].querySelector('strong')).replace(/[.,]$/, '')}. The step is highlighted in the list.`));
  }
  // The BRC drawn on the water through the ship, with an arrow ahead.
  function brcLine(s) {
    const [ax, ay] = s.P([mode === 'case1' ? -1.7 : -0.9, 0]), [bx, by] = s.P([mode === 'case1' ? 1.9 : 1.0, 0]);
    return [
      el('line', { class: 'thin dotted', x1: ax, y1: ay, x2: bx, y2: by }),
      el('path', { class: 'fill', d: `M${bx} ${by} l${(bx - ax) / Math.hypot(bx - ax, by - ay) * 10} ${(by - ay) / Math.hypot(bx - ax, by - ay) * 10} l-4 4 z` }),
      el('text', { class: 'lbl small', x: bx + 8, y: by + 4 }, 'BRC'),
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

const blocks = { deck: setupDeck, jerseys: setupJerseys, pattern: setupPattern, wedge: setupWedge, calls: setupCalls, codes: setupCodes, decode: setupDecode, dlq: setupDlq, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
