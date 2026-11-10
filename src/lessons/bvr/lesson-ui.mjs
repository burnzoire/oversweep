// Presentation for the Beyond-Visual-Range Intercepts module's figures and
// quizzes. Geometry, steps and questions come from lesson-model.mjs; this file
// reads inputs and draws.
import {
  ASPECT_ITEMS, CRANK_AO, LS_ITEMS, QUESTIONS, STEPS, TOF_SEC_PER_NM, ZONE, aspectWord, banditHeading, bearingRange, bullseyeProblem, cardinal, closure, collisionAo,
  cutAndHca, fromBull, norm180, shortcut, fighterHeading, fly, losRate, lsExact, lsRule, positions, rMax, rNe, rangeAt, shotZone, timeoutRange, tofSec,
} from './lesson-model.mjs';
import { quickQuiz, shuffle, termQuiz } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
const para = (text, cls) => Object.assign(document.createElement('p'), { textContent: text, className: cls ?? '' });
const ui = (root) => ({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') });
const side = (d) => (Math.abs(d) < 0.5 ? '0' : `${Math.round(Math.abs(d))} ${d < 0 ? 'L' : 'R'}`);
const kft = (ft) => `${Math.round(ft / 1000)}K`;
const hdg = (d) => String(Math.round(d) % 360).padStart(3, '0');
// A jet symbol at (x, y) pointing along heading h (degrees, 0 = up the page).
const jet = (x, y, h, cls = 'fill', s = 1) => el('path', { class: cls, d: `M0 -${9 * s} L${6 * s} ${7 * s} L0 ${3 * s} L-${6 * s} ${7 * s} Z`, transform: `translate(${x} ${y}) rotate(${h})` });

// Figure 1: the worked section intercept, plan view, to scale.
function setupExample(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const [back, next] = root.querySelectorAll('[data-back], [data-next]');
  const count = root.querySelector('[data-count]');
  const K = 5.6, X0 = 320, Y0 = 330;
  const P = ([x, y]) => [X0 + x * K, Y0 - y * K];
  let current = 0;
  function draw() {
    const s = STEPS[current], p = positions(current);
    const crankH = s.crank === 'out' ? 180 : s.crank ? 360 - CRANK_AO : 0;
    const items = [
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 358 }),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, TO SCALE, INVENTED EXAMPLE'),
    ];
    for (const r of [10, 20, 30]) {
      const [cx, cy] = P(p.lead);
      items.push(el('circle', { class: 'thin dotted', cx: cx + 1.5 * K, cy, r: r * K }), el('text', { class: 'lbl small', x: cx + 1.5 * K + r * K * 0.71 + 3, y: cy - r * K * 0.71 }, `${r} NM`));
    }
    for (const [i, from] of (p.launch ?? []).entries()) {
      const [ax, ay] = P(from), [bx, by] = P(p.missiles[i]);
      items.push(el('line', { class: 'ln dashed on', x1: ax, y1: ay, x2: bx, y2: by }), el('circle', { class: 'mine', cx: bx, cy: by, r: 3 }));
    }
    for (const g of p.group) { const [gx, gy] = P(g); items.push(jet(gx, gy, 180, current >= 2 ? 'mine' : 'fill')); }
    if (p.group.length) { const [gx, gy] = P(p.group[1]); items.push(el('text', { class: 'lbl small', x: gx + 12, y: gy + 4 }, current >= 2 ? 'Single group, hostile' : 'Single group')); }
    const [lx, ly] = P(p.lead), [wx, wy] = P(p.wing);
    items.push(jet(lx, ly, crankH), jet(wx, wy, crankH), el('text', { class: 'lbl small', x: lx - 12, y: ly + 18, 'text-anchor': 'end' }, 'Rage 11'), el('text', { class: 'lbl small', x: wx + 12, y: wy + 18 }, 'Rage 12'));
    if (current >= 3) {
      const [g0x, g0y] = P(p.group[0]), [g1x, g1y] = P(p.group[1]);
      items.push(el('line', { class: 'thin dotted', x1: lx, y1: ly, x2: g0x, y2: g0y }), el('line', { class: 'thin dotted', x1: wx, y1: wy, x2: g1x, y2: g1y }));
    }
    const range = rangeAt(current);
    items.push(el('text', { class: 'lbl', x: 626, y: 22, 'text-anchor': 'end' }, `Range ${range.toFixed(0)} NM · ${s.phase}`));
    svg.replaceChildren(...items);
    back.disabled = current === 0;
    next.disabled = current === STEPS.length - 1;
    count.textContent = `Step ${current + 1} of ${STEPS.length}: ${s.phase}`;
    const text = para(`${s.text} `);
    text.append(Object.assign(document.createElement('a'), { href: '#source-p825', textContent: `[1, ${/to|,/.test(s.page) ? 'pp.' : 'p.'} ${s.page}]` }));
    const calls = document.createElement('ol');
    calls.className = 'exchange';
    for (const [who, said] of s.calls) {
      const li = document.createElement('li');
      li.append(Object.assign(document.createElement('span'), { className: 'who', textContent: who }), Object.assign(document.createElement('span'), { className: 'said', textContent: `“${said}”` }));
      calls.append(li);
    }
    const more = para('', 'derived');
    more.append(Object.assign(document.createElement('a'), { href: s.href, textContent: 'Read more' }));
    out.replaceChildren(text, calls, more);
  }
  back.addEventListener('click', () => { current = Math.max(0, current - 1); draw(); });
  next.addEventListener('click', () => { current = Math.min(STEPS.length - 1, current + 1); draw(); });
  draw();
}

// Figure 2: the intercept triangle. The bandit is due north of the fighter.
function setupGeometry(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const inputs = Object.fromEntries([...root.querySelectorAll('input')].map((i) => [i.name, i]));
  const show = (name, v) => { const o = root.querySelector(`output[for="${inputs[name].id}"]`); if (o) o.textContent = v; };
  const W = 640, H = 360, FX = 320, FY = 320;
  let timer, t = 0;
  const state = () => ({ ta: +inputs.ta.value, sr: +inputs.sr.value, ao: +inputs.ao.value });
  function draw() {
    const { ta, sr, ao } = state();
    show('ta', side(ta)); show('sr', `${sr} NM`); show('ao', side(ao));
    const K = 270 / sr;
    const P = ([x, y]) => [FX + x * K, FY - y * K];
    const now = fly(ta, ao, sr, t);
    const fh = fighterHeading(ao), bh = banditHeading(ta);
    const items = [
      el('rect', { class: 'frame', x: 1, y: 1, width: W - 2, height: H - 2 }),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, CO-SPEED, NOT TO A FIXED SCALE'),
    ];
    // Flight paths, extended across the frame.
    const path = (from, h, cls) => {
      const [x, y] = P(from), r = (h * Math.PI) / 180;
      return el('line', { class: cls, x1: x - Math.sin(r) * 900, y1: y + Math.cos(r) * 900, x2: x + Math.sin(r) * 900, y2: y - Math.cos(r) * 900 });
    };
    items.push(path([0, sr], bh, 'thin dotted'), path([0, 0], fh, 'thin'));
    // Lateral separation: perpendicular from the fighter to the bandit's flight path.
    const br = (bh * Math.PI) / 180, ux = Math.sin(br), uy = Math.cos(br);
    const along = (0 - 0) * ux + (0 - sr) * uy;
    const foot = [0 + along * ux, sr + along * uy];
    const [fx0, fy0] = P([0, 0]), [px, py] = P(foot);
    items.push(el('line', { class: 'ln on', x1: fx0, y1: fy0, x2: px, y2: py }), el('text', { class: 'lbl small', x: (fx0 + px) / 2 + 6, y: (fy0 + py) / 2 + 14 }, `LS ${kft(lsExact(ta, sr))}`));
    // Traces since the start.
    if (t > 0) {
      const steps = Array.from({ length: 21 }, (_, i) => fly(ta, ao, sr, (t * i) / 20));
      items.push(el('polyline', { class: 'ln', points: steps.map((s) => P(s.f).join(',')).join(' ') }), el('polyline', { class: 'ln', points: steps.map((s) => P(s.b).join(',')).join(' ') }));
    }
    const [nfx, nfy] = P(now.f), [nbx, nby] = P(now.b);
    items.push(el('line', { class: 'thin dashed', x1: nfx, y1: nfy, x2: nbx, y2: nby }));
    items.push(jet(nfx, nfy, fh, 'mine'), jet(nbx, nby, bh));
    items.push(el('text', { class: 'lbl small', x: nfx + 12, y: nfy + 16 }, 'Fighter'), el('text', { class: 'lbl small', x: nbx + 12, y: nby - 8 }, 'Bandit'));
    svg.replaceChildren(...items);
    const g = cutAndHca(ta, ao), rate = losRate(now.ta, now.ao, now.sr);
    const coll = collisionAo(ta);
    const drift = Math.abs(rate) < 0.05 ? 'none: the contact holds its bearing, so you are on collision' : `${rate < 0 ? 'left' : 'right'} on the display, away from collision bearing`;
    const word = aspectWord(now.ta);
    out.replaceChildren(
      para(`Now: range ${now.sr.toFixed(1)} NM, TA ${side(now.ta)}${word ? ` (${word})` : ''}, AO ${side(now.ao)}, closure ${Math.round(closure(now.ta, now.ao))} kt. Drift: ${drift}.`),
      para(`Lateral separation at the start: ${kft(lsRule(ta, sr))} by the rule TA × SR × 100, ${kft(lsExact(ta, sr))} exactly. Cut ${Math.round(Math.abs(g.cut))}°, heading crossing angle ${Math.round(g.hca)}°. Fighter heading ${hdg(g.fh)}, bandit heading ${hdg(g.bh)}, bandit reciprocal ${hdg(g.br)}. Collision AO for this TA: ${side(coll)}.`, 'derived'),
    );
  }
  const stop = () => { clearInterval(timer); timer = undefined; };
  const restart = () => { stop(); t = 0; draw(); };
  for (const i of Object.values(inputs)) i.addEventListener('input', restart);
  root.querySelector('[data-collision]').addEventListener('click', () => { inputs.ao.value = Math.round(collisionAo(+inputs.ta.value)); restart(); });
  root.querySelector('[data-recip]').addEventListener('click', () => {
    // Fighter heading on the bandit reciprocal: AO equals TA, same side.
    inputs.ao.value = Math.max(-60, Math.min(60, +inputs.ta.value)); restart();
  });
  root.querySelector('[data-pure]').addEventListener('click', () => { inputs.ao.value = 0; restart(); });
  root.querySelector('[data-fly]').addEventListener('click', () => {
    stop(); t = 0;
    const end = Math.min(150, (+inputs.sr.value * 0.8 * 3600) / 600);
    timer = setInterval(() => { t = Math.min(end, t + 2); draw(); if (t >= end) stop(); }, 40);
  });
  draw();
}

// Figure 3: an illustrative launch zone around a bandit, and the time of flight.
function setupZone(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const inputs = Object.fromEntries([...root.querySelectorAll('input')].map((i) => [i.name, i]));
  const show = (name, v) => { const o = root.querySelector(`output[for="${inputs[name].id}"]`); if (o) o.textContent = v; };
  const W = 640, H = 340, CX = 230, CY = 182, R = 136;
  const contour = (f) => Array.from({ length: 73 }, (_, i) => {
    const a = (i * 5 * Math.PI) / 180, r = f(i * 5 > 180 ? 360 - i * 5 : i * 5) * R;
    return `${(CX + Math.sin(a) * r).toFixed(1)},${(CY - Math.cos(a) * r).toFixed(1)}`;
  }).join(' ');
  const WORDS = { inside: 'Inside minimum range: too close for the missile to guide and fuze.', rne: 'Inside the no-escape range: the missile has the energy to reach the bandit whatever it does.', lar: 'In the launch zone but outside the no-escape range: a valid shot, but a bandit that maneuvers can defeat it kinematically.', outside: 'Outside maximum range: no valid shot.' };
  function draw() {
    const ta = +inputs.ta.value, range = +inputs.range.value / 100, shot = +inputs.shot.value;
    show('ta', `${ta}°`); show('range', `${Math.round(range * 100)}% of head-on RMAX`); show('shot', `${shot} NM`);
    const a = (ta * Math.PI) / 180;
    const [fx, fy] = [CX + Math.sin(a) * range * R, CY - Math.cos(a) * range * R];
    const zone = shotZone(ta, range);
    const items = [
      el('rect', { class: 'frame', x: 1, y: 1, width: W - 2, height: H - 2 }),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'ILLUSTRATIVE ZONE, NOT ANY MISSILE\'S'),
      el('polygon', { class: 'shade', points: contour(rMax) }),
      el('polyline', { class: 'ln', points: contour(rMax) }),
      el('polyline', { class: 'ln dashed', points: contour(rNe) }),
      el('circle', { class: 'thin', cx: CX, cy: CY, r: ZONE.rmin * R }),
      el('text', { class: 'lbl small', x: CX, y: CY - R - 6, 'text-anchor': 'middle' }, 'RMAX, bandit hot'),
      el('text', { class: 'lbl small', x: CX, y: CY + rMax(180) * R + 14, 'text-anchor': 'middle' }, 'RMAX, rear quarter'),
      el('text', { class: 'lbl small', x: CX + rNe(90) * R + 4, y: CY - 4 }, 'RNE'),
      jet(CX, CY, 0),
      el('text', { class: 'lbl small', x: CX + 10, y: CY + 22 }, 'Bandit'),
      el('line', { class: 'thin dotted', x1: CX, y1: CY, x2: fx, y2: fy }),
      jet(fx, fy, (ta + 180) % 360, zone === 'outside' ? 'fill' : 'mine'),
    ];
    // Time of flight panel, right of the zone.
    const X = 420;
    items.push(el('text', { class: 'lbl', x: X, y: 52 }, `TIME OF FLIGHT, ${shot} NM SHOT`));
    for (const [i, q] of ['forward', 'beam', 'rear'].entries()) {
      const sec = tofSec(shot, q);
      items.push(el('rect', { class: 'mine', x: X, y: 66 + i * 34, width: sec * 1.4, height: 14 }), el('text', { class: 'lbl small', x: X, y: 92 + i * 34 }, `${q === 'forward' ? 'Forward quarter' : q === 'beam' ? 'Beam' : 'Rear quarter'}: ${sec} s (1 NM / ${TOF_SEC_PER_NM[q]} s)`));
    }
    items.push(el('text', { class: 'lbl', x: X, y: 200 }, 'RANGE AT TIMEOUT, HOT'));
    const plain = timeoutRange(shot, 0), cranked = timeoutRange(shot, CRANK_AO);
    items.push(el('text', { class: 'lbl small', x: X, y: 220 }, `Pressing straight on: ${plain.toFixed(1)} NM`), el('text', { class: 'lbl small', x: X, y: 238 }, `Cranked ${CRANK_AO}° after the shot: ${cranked.toFixed(1)} NM`));
    svg.replaceChildren(...items);
    out.replaceChildren(para(WORDS[zone]), para(`At ${shot} NM the crank keeps the section ${(cranked - plain).toFixed(1)} NM farther from the hot bandit at timeout, both aircraft at 300 knots; the bigger gain is that its velocity is now mostly across the bandit's line of sight.`, 'derived'));
  }
  for (const i of Object.values(inputs)) i.addEventListener('input', draw);
  draw();
}

// Quiz: aspect words and the LS rule (outcomes 1 and 2).
function setupAspect(root) {
  const items = [...ASPECT_ITEMS.map((q) => ({ ...q, kind: 'aspect' })), ...LS_ITEMS.map((q) => ({ ...q, kind: 'ls' }))];
  quickQuiz(ui(root), {
    items,
    show: (q, prompt) => {
      prompt.textContent = q.kind === 'aspect'
        ? `Outcome 1. Your radar shows ${q.ta} ${q.side} target aspect. What aspect does a controller call it?`
        : `Outcome 2. ${q.ta} TA at ${q.sr} NM. About how much lateral separation?`;
    },
    options: (q) => (q.kind === 'aspect' ? ['HOT', 'FLANK', 'BEAM', 'DRAG'] : shuffle([q.answer, q.answer / 2, q.answer * 1.5, q.answer + 20000].filter((v, i, a) => a.indexOf(v) === i))),
    label: (o) => (typeof o === 'number' ? `${o.toLocaleString('en-US')} ft` : o),
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => (q.kind === 'aspect'
      ? `${right ? 'Correct.' : 'Not quite.'} 0–30 TA is hot, 30–60 flank, 70–110 beam and over 110 drag. (P-825, p. 5-8)`
      : `${right ? 'Correct.' : 'Not quite.'} TA × SR × 100 = ${q.ta} × ${q.sr} × 100 = ${q.answer.toLocaleString('en-US')} ft. (P-825, p. 8-2)`),
  });
}

function setupQuestions(root) {
  quickQuiz(ui(root), {
    items: QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

// Figure 3: plot yourself and a called group on a bullseye card, north up.
function setupBullseye(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const task = root.querySelector('[data-prompt]');
  const reveal = root.querySelector('[data-reveal]');
  const again = root.querySelector('[data-new]');
  const CX = 190, CY = 180, K = 2; // 80 NM ring = 160 px
  const P = ([x, y]) => [CX + x * K, CY - y * K];
  const nm = (px, py) => [(px - CX) / K, (CY - py) / K];
  const fmt = (b) => (Math.round(b) % 360 ? hdg(b) : '360');
  let q, marks, shown;
  const cross = (x, y, cls) => el('path', { class: cls, d: `M${x - 6} ${y - 6} L${x + 6} ${y + 6} M${x - 6} ${y + 6} L${x + 6} ${y - 6}` });
  function card() {
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 358 }), el('text', { class: 'lbl', x: 400, y: 30 }, 'BULLSEYE CARD, NORTH UP'), el('text', { class: 'lbl small', x: 400, y: 48 }, 'Rings every 20 NM')];
    for (const r of [20, 40, 60, 80]) items.push(el('circle', { class: 'thin', cx: CX, cy: CY, r: r * K }), el('text', { class: 'lbl small', x: CX + 3, y: CY - r * K + 11 }, String(r)));
    for (let b = 0; b < 360; b += 45) {
      const [x, y] = P(fromBull(b, 80)), [lx, ly] = P(fromBull(b, 86));
      items.push(el('line', { class: 'thin dotted', x1: CX, y1: CY, x2: x, y2: y }), el('text', { class: 'lbl small', x: lx, y: ly + 4, 'text-anchor': 'middle' }, hdg(b)));
    }
    items.push(el('circle', { class: 'fill', cx: CX, cy: CY, r: 3 }), el('text', { class: 'lbl small', x: CX - 6, y: CY - 6, 'text-anchor': 'end' }, 'VEGAS'));
    return items;
  }
  function draw() {
    const items = card();
    const own = P(fromBull(q.own.brg, q.own.rng)), grp = P(fromBull(q.group.brg, q.group.rng));
    if (marks[0]) items.push(cross(...P(marks[0]), 'ln on'));
    if (marks[1]) items.push(cross(...P(marks[1]), 'ln'));
    if (shown) {
      items.push(el('line', { class: 'thin dashed', x1: CX, y1: CY, x2: own[0], y2: own[1] }), el('line', { class: 'thin dashed', x1: CX, y1: CY, x2: grp[0], y2: grp[1] }));
      items.push(el('line', { class: 'ln on', x1: own[0], y1: own[1], x2: grp[0], y2: grp[1] }));
      items.push(el('circle', { class: 'mine', cx: own[0], cy: own[1], r: 5 }), el('text', { class: 'lbl small', x: own[0] + 9, y: own[1] + 14 }, 'You'));
      items.push(jet(grp[0], grp[1], q.track), el('text', { class: 'lbl small', x: grp[0] + 11, y: grp[1] - 6 }, 'Group'));
    }
    const lines = shown ? [`From you: ${fmt(q.braa.brg)}°, ${Math.round(q.braa.rng)} NM`, `Group tracks ${cardinal(q.track)}`] : [marks.length ? 'Now click where the group is' : 'Click where you are'];
    lines.forEach((t, i) => items.push(el('text', { class: i ? 'lbl small' : 'lbl', x: 400, y: 90 + i * 20 }, t)));
    if (marks.length) {
      items.push(cross(406, 296, 'ln on'), el('text', { class: 'lbl small', x: 420, y: 300 }, 'Your mark for you'));
      if (marks[1]) items.push(cross(406, 320, 'ln'), el('text', { class: 'lbl small', x: 420, y: 324 }, 'Your mark for the group'));
    }
    svg.replaceChildren(...items);
  }
  function finish() {
    shown = true;
    draw();
    const own = fromBull(q.own.brg, q.own.rng), grp = fromBull(q.group.brg, q.group.rng);
    const miss = marks.map((m, i) => bearingRange(m, i ? grp : own).rng);
    const ta = Math.abs(norm180(q.track - bearingRange(grp, own).brg));
    const msgs = [];
    if (marks.length === 2) msgs.push(para(miss.every((d) => d <= 8) ? 'Good plot: both marks within 8 NM.' : `Your marks were ${Math.round(miss[0])} NM and ${Math.round(miss[1])} NM out. Check which way the bearing points.`));
    msgs.push(
      para(`You: the readout says bullseye is ${fmt(q.steer.brg)}° at ${q.steer.rng} NM from you, so you are on the reciprocal, Vegas ${fmt(q.own.brg)}, ${q.own.rng}.`, 'derived'),
      para(`Group: Vegas ${fmt(q.group.brg)}, ${q.group.rng}, plotted out from bullseye along ${fmt(q.group.brg)}°.`, 'derived'),
      para(`From you it is about ${fmt(q.braa.brg)}° at ${Math.round(q.braa.rng)} NM, ${q.alt},000 ft, ${(aspectWord(ta) ?? 'between flank and beam').toLowerCase()} to you (${Math.round(ta)}° target aspect).`, 'derived'),
    );
    const s = shortcut(q.own, q.group);
    if (s) msgs.push(para(s.kind === 'same' ? `Shortcut: you and the group are on almost the same bullseye bearing, so the ranges subtract: ${s.rng} NM.` : `Shortcut: you are on almost opposite bullseye bearings, so the ranges add: ${s.rng} NM.`, 'derived'));
    out.replaceChildren(...msgs);
    reveal.disabled = true;
  }
  function fresh() {
    q = bullseyeProblem(); marks = []; shown = false;
    task.textContent = `Your navigation display, steering to bullseye: ${fmt(q.steer.brg)}°, ${q.steer.rng} NM. The controller: “Rage 11, SABRE, group Vegas ${fmt(q.group.brg)}, ${q.group.rng}, ${q.alt} thousand, track ${cardinal(q.track)}.” Click where you are, then where the group is.`;
    out.replaceChildren();
    reveal.disabled = false;
    draw();
  }
  svg.addEventListener('click', (ev) => {
    if (shown) return;
    const pt = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(svg.getScreenCTM().inverse());
    marks.push(nm(pt.x, pt.y));
    if (marks.length === 2) finish(); else draw();
  });
  reveal.addEventListener('click', finish);
  again.addEventListener('click', fresh);
  fresh();
}

const blocks = { example: setupExample, geometry: setupGeometry, bullseye: setupBullseye, zone: setupZone, aspect: setupAspect, section: setupQuestions, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
