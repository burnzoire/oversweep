// Presentation for the Weapons Delivery module's figures and quizzes. Numbers
// and rules come from lesson-model.mjs; this file reads inputs and draws.
import { PATTERNS, POP_STEPS, belowMinimum, bombMiss, describeMiss, missQuestion, vacuumFall, vacuumPath } from './lesson-model.mjs';
import { quickQuiz, termQuiz, withDistractors } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const D = Math.PI / 180;
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

// Figure 1: side view of the bombing triangle, with the hit the FTI's error
// table gives for the chosen errors on a strip below.
function setupDive(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  function draw() {
    const dive = +checked(root, 'dive');
    const p = PATTERNS[dive];
    const errors = { diveError: +field(root, 'ddive').value, speedError: +field(root, 'dspeed').value, altError: +field(root, 'dalt').value };
    show(root, 'ddive', signed(errors.diveError, '°'));
    show(root, 'dspeed', signed(errors.speedError, ' kt'));
    show(root, 'dalt', signed(errors.altError, ' ft'));
    const alt = p.release + errors.altError;
    const gam = dive + errors.diveError;
    const miss = bombMiss(dive, errors);
    const low = belowMinimum(dive, errors.altError);
    // The sight is set for the planned delivery, so the line of sight sits
    // the planned drop below the actual flight path; the bomb lands the
    // table's miss beyond or short of where it looks.
    const planned = vacuumFall(p.release, dive, p.releaseKtas);
    const toTarget = alt / Math.tan((gam + planned.drop) * D);
    const sketch = vacuumPath(alt, gam, p.releaseKtas + errors.speedError);
    const stretch = (toTarget + miss.total) / sketch[sketch.length - 1][0];

    // Side view, to scale: target fixed at the right, ground along the bottom.
    const W = 640, X0 = 40, Y0 = 250, tx = 540;
    const k = Math.min((tx - X0) / Math.max(toTarget + 1.6 * alt / Math.tan(gam * D), 6000), 190 / Math.max(alt * 1.45, 3200));
    const rx = tx - toTarget * k, ry = Y0 - alt * k;
    const back = Math.min(1.45 * alt, (rx - X0) / k * Math.tan(gam * D));
    const sx = rx - back / Math.tan(gam * D) * k, sy = ry - back * k;
    const hitX = tx + miss.total * k;
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: W - 2, height: 378 }),
      el('line', { class: 'ln heavy', x1: 10, y1: Y0, x2: W - 10, y2: Y0 }),
      el('text', { class: 'lbl small', x: 14, y: Y0 + 16 }, 'Ground (target elevation)'),
      el('line', { class: 'ln dashed', x1: rx, y1: ry, x2: rx + alt / Math.tan(gam * D) * k, y2: Y0 }),
      el('line', { class: 'ln on', x1: sx, y1: sy, x2: rx, y2: ry }),
      el('polyline', { class: 'ln', points: pts(sketch.map(([x, y]) => [rx + x * stretch * k, Y0 - y * k])) }),
      el('line', { class: 'thin dotted', x1: rx, y1: ry, x2: tx, y2: Y0 }),
      el('line', { class: 'thin dotted', x1: rx, y1: ry, x2: rx, y2: Y0 }),
      el('circle', { class: 'mine', cx: rx, cy: ry, r: 5 }),
      el('text', { class: 'lbl', x: rx - 8, y: ry - 12, 'text-anchor': 'end' }, `Release ${r0(alt)} ft AGL`),
      el('text', { class: 'lbl small', x: rx - 6, y: (ry + Y0) / 2, 'text-anchor': 'end' }, 'Release altitude'),
      el('text', { class: 'lbl small', x: (sx + rx) / 2 - 6, y: (sy + ry) / 2 - 8, 'text-anchor': 'end' }, `Line of flight, ${gam}° dive`),
      el('text', { class: 'lbl small', x: rx + 8, y: ry + 40 }, 'Sight line to the target (slant range)'),
      el('text', { class: 'lbl small', x: rx + (tx - rx) * 0.75 + 10, y: ry + (Y0 - ry) * 0.45 }, 'Bomb'),
      el('text', { class: 'lbl small', x: (rx + tx) / 2, y: Y0 + 16, 'text-anchor': 'middle' }, 'Down-range travel'),
      el('path', { class: 'fill', d: `M${tx} ${Y0 - 2} l-7 -12 h14 z` }),
      el('text', { class: 'lbl', x: tx, y: Y0 + 30, 'text-anchor': 'middle' }, 'Target'),
      el('circle', { class: low ? 'mine bad' : 'mine', cx: hitX, cy: Y0, r: 4 }),
    );
    // Impact strip: the hit along the run-in line, ±400 ft.
    const S0 = 330, sk = 0.7, cx = 320, hx = cx + Math.max(-420, Math.min(420, miss.total)) * sk;
    svg.append(
      el('line', { class: 'ln', x1: cx - 400 * sk, y1: S0, x2: cx + 400 * sk, y2: S0 }),
      ...[-400, -200, 0, 200, 400].flatMap((f) => [
        el('line', { class: 'thin', x1: cx + f * sk, y1: S0 - 5, x2: cx + f * sk, y2: S0 + 5 }),
        el('text', { class: 'lbl small', x: cx + f * sk, y: S0 + 20, 'text-anchor': 'middle' }, f === 0 ? 'Aimpoint' : `${r0(Math.abs(f))} ft ${f < 0 ? 'short' : 'long'}`),
      ]),
      el('text', { class: 'lbl', x: 14, y: S0 - 22 }, 'Hit along the run-in line (from the FTI error table)'),
      el('circle', { class: low ? 'mine bad' : 'mine', cx: hx, cy: S0, r: 7 }),
    );
    out.replaceChildren(
      para(`${describeMiss(miss.total)}. Dive ${describeMiss(miss.dive).toLowerCase()}, airspeed ${describeMiss(miss.speed).toLowerCase()}, release altitude ${describeMiss(miss.alt).toLowerCase()}.`),
      para(`Planned: ${dive}° dive, release ${r0(p.release)} ft AGL at ${p.releaseKtas} KTAS, ${p.mils} mils; minimum release ${r0(p.minRelease)} ft AGL.`, 'derived'),
      ...(low ? [para(`Below the ${r0(p.minRelease)} ft minimum release altitude. Never release below it to correct an error.`, 'bad')] : []),
    );
  }
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  root.querySelector('[data-reset]').addEventListener('click', () => {
    for (const n of ['ddive', 'dspeed', 'dalt']) field(root, n).value = 0;
    draw();
  });
  draw();
}

// Figure 2: the T-45 pop-up pattern attack, profile above plan, as a
// schematic built from the FTI's numbers. Distances in NM from the target.
const POP_PATH = [
  { step: 'ingress', pts: [[4.6, 0, 850], [4.0, 0, 850], [2.5, 0, 850]] },
  { step: 'pop', pts: [[2.5, 0, 850], [2.38, 0.02, 1000], [2.28, 0.06, 1250]] },
  { step: 'climb', pts: [[2.28, 0.06, 1250], [2.12, 0.15, 1750], [2.04, 0.2, 2000]] },
  { step: 'rollin', pts: [[2.04, 0.2, 2000], [1.92, 0.22, 2130], [1.8, 0.14, 2110], [1.66, 0.03, 2030], [1.6, 0, 1980]] },
  { step: 'track', pts: [[1.6, 0, 1980], [1.1, 0, 1450], [0.6, 0, 1000]] },
  { step: 'release', pts: [[0.6, 0, 1000], [0.56, 0, 960]] },
  { step: 'recover', pts: [[0.56, 0, 960], [0.45, 0, 900], [0.3, 0, 930], [0, 0, 1000], [-0.4, 0, 1000]] },
];
function setupPop(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const chips = root.querySelector('[data-steps]');
  const play = root.querySelector('[data-play]');
  const X = (nm) => 600 - (nm + 0.4) * 110, PY = (ft) => 175 - ft * 0.06, LY = (nm) => 290 - nm * 220;
  let current = 0, timer = null;
  const buttons = POP_STEPS.map((s, i) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: `${i + 1}. ${s.title}` });
    b.addEventListener('click', () => { stop(); current = i; draw(); });
    chips.append(b);
    return b;
  });
  function draw() {
    const step = POP_STEPS[current];
    const cls = (i) => (i === current ? 'ln heavy on' : i < current ? 'ln' : 'ln dashed');
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 358 }),
      el('text', { class: 'lbl', x: 12, y: 20 }, 'PROFILE (height exaggerated)'),
      el('line', { class: 'ln heavy', x1: 10, y1: PY(0), x2: 630, y2: PY(0) }),
      ...[1000, 2000].flatMap((ft) => [
        el('line', { class: 'grid', x1: 10, y1: PY(ft), x2: 630, y2: PY(ft) }),
        el('text', { class: 'lbl small', x: 14, y: PY(ft) - 4 }, `${r0(ft)} ft AGL`),
      ]),
      el('text', { class: 'lbl', x: 12, y: 212 }, 'PLAN'),
      el('line', { class: 'thin dotted', x1: X(4.6), y1: LY(0), x2: X(-0.4), y2: LY(0) }),
      el('text', { class: 'lbl small', x: X(4.5), y: LY(0) + 16 }, 'Run-in line'),
      ...[4, 3, 2, 1].map((nm) => el('text', { class: 'lbl small', x: X(nm), y: 352, 'text-anchor': 'middle' }, `${nm} NM`)),
      el('path', { class: 'fill', d: `M${X(0)} ${PY(0) - 2} l-7 -12 h14 z` }),
      el('path', { class: 'fill', d: `M${X(0)} ${LY(0) - 7} l7 7 l-7 7 l-7 -7 z` }),
      el('text', { class: 'lbl', x: X(0), y: LY(0) + 26, 'text-anchor': 'middle' }, 'Target'),
      ...POP_PATH.flatMap((seg) => {
        const i = POP_STEPS.findIndex((s) => s.id === seg.step);
        return [
          el('polyline', { class: cls(i), points: pts(seg.pts.map(([x, , h]) => [X(x), PY(h)])) }),
          el('polyline', { class: cls(i), points: pts(seg.pts.map(([x, y]) => [X(x), LY(y)])) }),
        ];
      }),
    );
    const seg = POP_PATH.find((s) => s.step === step.id);
    const [x, y, h] = seg.pts[seg.pts.length - 1];
    svg.append(
      el('circle', { class: 'mine', cx: X(x), cy: PY(h), r: 6 }),
      el('circle', { class: 'mine', cx: X(x), cy: LY(y), r: 6 }),
    );
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === current)));
    out.replaceChildren(para(`${current + 1}. ${step.title}. ${step.text}`));
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = 'Play'; }
  play.addEventListener('click', () => {
    if (timer) { stop(); return; }
    if (current === POP_STEPS.length - 1) current = 0;
    play.textContent = 'Pause';
    draw();
    timer = setInterval(() => {
      if (current >= POP_STEPS.length - 1) { stop(); return; }
      current += 1; draw();
    }, reduceMotion() ? 4000 : 2600);
  });
  draw();
}

function setupMissQuiz(root) {
  const words = { diveError: (v) => `${Math.abs(v)}° ${v > 0 ? 'steep' : 'shallow'}`, speedError: (v) => `${Math.abs(v)} kt ${v > 0 ? 'fast' : 'slow'}`, altError: (v) => `${r0(Math.abs(v))} ft ${v > 0 ? 'high' : 'low'}` };
  const pool = Array.from({ length: 12 }, () => missQuestion());
  quickQuiz({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') }, {
    items: pool,
    show: (q, prompt) => {
      const errs = Object.entries(q.errors).filter(([, v]) => v).map(([k, v]) => words[k](v));
      prompt.textContent = `${q.dive}° bomb run in the T-45, pipper on the aimpoint at release, wings level, correct g: you release ${errs.join(' and ')}, everything else as planned. Where does the bomb hit?`;
    },
    options: (q) => {
      const step = q.dive === 10 ? 80 : 50;
      const near = [q.total, -q.total, q.total + step, q.total - step, 0].filter((v, i, a) => a.indexOf(v) === i);
      return withDistractors(describeMiss(q.total), near.map(describeMiss), 4);
    },
    label: (o) => o,
    isRight: (q, o) => o === describeMiss(q.total),
    feedback: (q, o, right) => (right ? 'Correct.' : `Not quite: ${describeMiss(q.total).toLowerCase()}.`),
  });
}

function setupTerms(root) { termQuiz(root, { hideTerm: true }); }

const blocks = { dive: setupDive, pop: setupPop, miss: setupMissQuiz, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
