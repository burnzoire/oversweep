// Presentation for the Rotary-Wing Attack module's figures and quizzes.
// Facts, geometry and questions come from lesson-model.mjs; this file reads
// inputs and draws.
import { ATTACK_STEPS, EXAMPLE, FIRE_MODES, PROFILES, QUESTIONS, TERRAIN, aglFt, exposure, groundFt, line3, offset, profilePath, treeFt, visible } from './lesson-model.mjs';
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
const pts = (list) => list.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
const heli = (x, y, heading, cls = 'mine') => el('path', { class: cls, d: 'M0 -9 L5 6 L0 3 L-5 6 Z', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${heading})` });
const txt = (x, y, s, anchor = 'start', cls = 'lbl small') => el('text', { class: cls, x: x.toFixed(1), y: y.toFixed(1), 'text-anchor': anchor }, s);

// Figure 1: plan view after JP 3-09.3 Figure III-26, with the invented attack stepped.
function drawPlan(svg, step) {
  const { places, route, fps, target } = EXAMPLE;
  const [bx, by] = places.bp;
  const show = new Set(step.show);
  const fpAbs = fps.map(([dx, dy]) => [bx + dx, by + dy]);
  const items = [
    el('rect', { class: 'frame', x: 1, y: 1, width: 758, height: 558 }),
    txt(14, 22, 'PLAN VIEW, NOT TO SCALE, INVENTED ATTACK', 'start', 'lbl'),
    txt(746, 22, 'N ↑', 'end'),
    // Terrain that masks the battle position from the target: a ridge line between them.
    el('path', { class: 'shade', d: `M${bx + 48} ${by - 80} q 40 30 20 70 q -10 40 30 70 l 30 -10 q -30 -40 -15 -70 q 15 -40 -25 -70 z` }),
    txt(bx + 80, by + 70, 'Ridge (mask)'),
    el('circle', { class: 'thin dotted', cx: places.ha[0], cy: places.ha[1], r: 40 }),
    txt(places.ha[0], places.ha[1] + 56, `Holding area ${EXAMPLE.ha}`, 'middle'),
    el('ellipse', { class: 'thin', cx: bx, cy: by, rx: 55, ry: 40 }),
    txt(bx - 60, by - 44, `Battle position ${EXAMPLE.bp}`, 'end'),
    el('path', { class: 'fill', d: `M${target[0]} ${target[1] - 8} l8 8 l-8 8 l-8 -8 z` }),
    txt(target[0] + 12, target[1] + 4, 'Target'),
    el('circle', { class: 'fill', cx: places.rp[0], cy: places.rp[1], r: 3 }),
    txt(places.rp[0] + 8, places.rp[1] + 14, 'Release point'),
  ];
  if (show.has('route') || show.has('egress')) items.push(el('polyline', { class: show.has('egress') ? 'ln dashed' : 'ln on', points: pts(route) }), txt(route[2][0] - 8, route[2][1] + 4, show.has('egress') ? 'Egress' : 'Ingress route, NOE', 'end'));
  if (show.has('line')) {
    items.push(el('line', { class: 'thin dotted', x1: bx, y1: by, x2: target[0], y2: target[1] }));
    const [mx, my] = offset(places.bp, EXAMPLE.heading, EXAMPLE.distanceM / 20);
    items.push(txt(mx - 6, my - 8, `${String(EXAMPLE.heading).padStart(3, '0')}°, ${line3(EXAMPLE.distanceM)} m`, 'end'));
  }
  if (show.has('fps') || show.has('hover') || show.has('displace')) {
    fpAbs.forEach(([x, y], i) => { items.push(el('circle', { class: 'thin', cx: x, cy: y, r: 6 }), txt(x, y + 20, `FP ${i + 1}`, 'middle')); });
  }
  if (show.has('hover')) {
    for (const [x, y] of [fpAbs[0], fpAbs[2]]) items.push(el('line', { class: 'ln on', x1: x, y1: y, x2: target[0], y2: target[1] }));
  }
  if (show.has('displace')) items.push(el('path', { class: 'ln on', d: `M${fpAbs[0][0]} ${fpAbs[0][1]} Q ${bx - 10} ${by + 30} ${fpAbs[1][0]} ${fpAbs[1][1]}` }));
  if (show.has('running')) {
    const a = offset(places.bp, EXAMPLE.heading - 25, 70), b = offset(places.bp, EXAMPLE.heading - 10, 200);
    items.push(el('path', { class: 'ln on', d: `M${bx} ${by} L${a[0]} ${a[1]} L${b[0]} ${b[1]}` }), txt(b[0] - 10, b[1] - 10, 'Running fire', 'end'));
    items.push(el('path', { class: 'ln dashed', d: `M${b[0]} ${b[1]} q -60 10 -110 60` }), txt(b[0] - 70, b[1] + 60, 'Break away', 'end'));
  }
  // The section's position for this step.
  const at = step.at === 'bp' ? (show.has('displace') ? fpAbs[1] : fpAbs[0]) : places[step.at];
  items.push(heli(at[0], at[1], step.at === 'ha' ? 45 : EXAMPLE.heading));
  svg.replaceChildren(...items);
}
function setupAttack(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const [back, next] = [root.querySelector('[data-back]'), root.querySelector('[data-next]')];
  const count = root.querySelector('[data-count]');
  let i = 0;
  function draw() {
    const s = ATTACK_STEPS[i];
    drawPlan(svg, s);
    count.textContent = `Step ${i + 1} of ${ATTACK_STEPS.length}`;
    back.disabled = i === 0; next.disabled = i === ATTACK_STEPS.length - 1;
    out.replaceChildren(para(`${s.who}: ${s.said}`));
  }
  back.addEventListener('click', () => { if (i > 0) { i--; draw(); } });
  next.addEventListener('click', () => { if (i < ATTACK_STEPS.length - 1) { i++; draw(); } });
  draw();
}

// Figure 2: the three terrain flight profiles over the invented terrain.
function setupTerrain(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const buttons = [...root.querySelectorAll('[data-profile]')];
  const L = 20, R = 740, BASE = 300, FT = 1.0; // 1 px per foot vertically
  const X = (xM) => L + ((R - L) * xM) / TERRAIN.lengthM;
  const Y = (ft) => BASE - ft * FT;
  function draw(id) {
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.profile === id));
    const ground = []; for (let x = 0; x <= TERRAIN.lengthM; x += 50) ground.push([X(x), Y(groundFt(x))]);
    const trees = []; for (let x = 0; x <= TERRAIN.lengthM; x += 50) if (treeFt(x)) trees.push(el('line', { class: 'thin', x1: X(x), y1: Y(groundFt(x)), x2: X(x), y2: Y(groundFt(x) + treeFt(x)) }));
    const path = profilePath(id);
    const segs = [];
    for (let k = 1; k < path.length; k++) {
      const a = path[k - 1], b = path[k];
      segs.push(el('line', { class: visible(b) ? 'ln dashed' : 'ln on', x1: X(a.xM), y1: Y(a.ft), x2: X(b.xM), y2: Y(b.ft) }));
    }
    const o = TERRAIN.observer, oy = Y(groundFt(o.xM) + o.eyeFt);
    svg.replaceChildren(
      el('rect', { class: 'frame', x: 1, y: 1, width: 758, height: 338 }),
      txt(14, 22, 'SIDE VIEW, INVENTED TERRAIN, HEIGHTS TO SCALE, DISTANCE COMPRESSED', 'start', 'lbl'),
      el('polygon', { class: 'shade', points: `${L},${BASE + 20} ${pts(ground)} ${R},${BASE + 20}` }),
      el('polyline', { class: 'ln heavy', points: pts(ground) }),
      ...trees,
      ...segs,
      el('circle', { class: 'fill', cx: X(o.xM), cy: oy, r: 4 }),
      txt(X(o.xM) - 6, oy - 10, 'Enemy observer', 'end'),
      el('line', { class: 'thin', x1: 30, y1: Y(0), x2: 30, y2: Y(200) }),
      txt(36, Y(200) + 4, '200 ft'), txt(36, Y(100) + 4, '100 ft'),
      el('line', { class: 'thin', x1: 26, y1: Y(100), x2: 34, y2: Y(100) }),
      txt(20, 330, `Solid: hidden from the observer by terrain. Dashed: in its line of sight. Distance about ${TERRAIN.lengthM / 1000} km.`),
    );
    const p = PROFILES.find((q) => q.id === id);
    const agl = path.map(aglFt);
    out.replaceChildren(
      para(`${p.name}: ${p.height}. Speed: ${p.speed}. ${p.use}.`),
      para(`On this invented ground the path is ${Math.round(Math.min(...agl))} to ${Math.round(Math.max(...agl))} ft above the ground, and in the observer's line of sight for about ${Math.round(exposure(id) * 100)}% of the way.`, 'derived'),
    );
  }
  for (const b of buttons) b.addEventListener('click', () => draw(b.dataset.profile));
  draw('low-level');
}

// Figure 3: the three ways to fire, side view.
function setupFire(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const buttons = [...root.querySelectorAll('[data-mode]')];
  const GY = 250, TX = 640;
  function draw(id) {
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.mode === id));
    const items = [
      el('rect', { class: 'frame', x: 1, y: 1, width: 758, height: 298 }),
      txt(14, 22, 'SIDE VIEW, NOT TO SCALE', 'start', 'lbl'),
      el('line', { class: 'ln heavy', x1: 10, y1: GY, x2: 750, y2: GY }),
      el('path', { class: 'fill', d: `M${TX - 10} ${GY} h20 v-10 h-20 z` }), txt(TX, GY + 18, 'Target', 'middle'),
    ];
    if (id === 'hover') {
      items.push(el('path', { class: 'shade', d: `M120 ${GY} q 60 -70 120 0 z` }), txt(180, GY + 18, 'Mask', 'middle'));
      items.push(el('line', { class: 'thin dotted', x1: 140, y1: GY - 20, x2: 140, y2: GY - 58 }));
      items.push(heliSide(140, GY - 20, 'thin'), heliSide(140, GY - 62, 'mine'));
      items.push(el('path', { class: 'ln on', d: `M150 ${GY - 62} Q 400 ${GY - 120} ${TX} ${GY - 10}` }));
      items.push(txt(140, GY - 82, 'Unmask, fire, remask', 'middle'));
    } else if (id === 'running') {
      items.push(el('line', { class: 'ln on', x1: 60, y1: GY - 60, x2: 420, y2: GY - 60 }));
      items.push(heliSide(300, GY - 60, 'mine'));
      items.push(el('line', { class: 'ln dashed', x1: 310, y1: GY - 58, x2: TX, y2: GY - 8 }));
      items.push(txt(180, GY - 72, 'Level, forward flight', 'middle'));
    } else {
      items.push(el('path', { class: 'thin dotted', d: `M${TX - 60} 60 a 110 30 0 1 1 120 0` }));
      items.push(el('line', { class: 'ln on', x1: 380, y1: 70, x2: 520, y2: 170 }));
      items.push(heliSide(500, 156, 'mine', 35));
      items.push(el('line', { class: 'ln dashed', x1: 510, y1: 164, x2: TX, y2: GY - 8 }));
      items.push(txt(370, 62, 'From the overhead, descending', 'middle'));
      items.push(el('line', { class: 'thin dotted', x1: 10, y1: 120, x2: 300, y2: 120 }), txt(14, 114, 'Small-arms reach (schematic)'));
    }
    svg.replaceChildren(...items);
    const m = FIRE_MODES.find((f) => f.id === id);
    out.replaceChildren(para(`${m.name}. Flight: ${m.flight}. When: ${m.when}.`), para(`Gains: ${m.gains}.`, 'derived'), para(`Costs: ${m.costs}.`, 'derived'));
  }
  for (const b of buttons) b.addEventListener('click', () => draw(b.dataset.mode));
  draw('hover');
}
function heliSide(x, y, cls, pitch = 0) {
  const g = el('g', { transform: `translate(${x} ${y}) rotate(${pitch})` });
  g.append(
    el('path', { class: cls === 'mine' ? 'mine' : 'thin', d: 'M-14 -3 h22 q6 0 6 4 q0 4 -6 4 h-22 z M-14 0 h-16 v-3 h16' }),
    el('line', { class: 'thin', x1: -16, y1: -9, x2: 22, y2: -9 }),
    el('line', { class: 'thin', x1: 0, y1: -9, x2: 0, y2: -3 }),
  );
  return g;
}

function setupCheck(root) {
  quickQuiz(ui(root), {
    items: QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

const blocks = { attack: setupAttack, terrain: setupTerrain, fire: setupFire, check: setupCheck, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
