// Presentation for Planning a Sortie: the route and nav log (Figure 1), the
// fuel ladder (Figure 2), the equal time point (Figure 3) and the quizzes.
// Numbers come from sortie-model.mjs; this file reads inputs and draws.
import { PLAN_QUESTIONS, SORTIE, equalTimePoint, fmtHdg, fmtMin, planSortie } from './sortie-model.mjs';
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
const lb = (x) => `${Math.round(x / 10) * 10} lb`;

function bindRanges(root, onChange) {
  const inputs = [...root.querySelectorAll('input[type="range"]')];
  const show = () => inputs.forEach((i) => { const o = root.querySelector(`output[for="${i.id}"]`); if (o) o.textContent = i.dataset.unit === 'deg' ? `${fmtHdg(Number(i.value))}°` : `${i.value} ${i.dataset.unit ?? ''}`.trim(); });
  inputs.forEach((i) => i.addEventListener('input', () => { show(); onChange(); }));
  show();
  return (id) => Number(root.querySelector(`#${id}`).value);
}

// Shared state: Figure 1 sets the wind and TAS; Figure 2 draws the same plan.
const listeners = [];
let current = null;
function publish(plan, wind) { current = { plan, wind }; listeners.forEach((f) => f()); }

// Figure 1: plan view of the route with the wind, and the nav log beside it.
function setupRoute(root) {
  const svg = root.querySelector('svg');
  const tbody = root.querySelector('tbody');
  const out = root.querySelector('[data-result]');
  const get = bindRanges(root, draw);
  const K = 2.0, OX = 150, OY = 190;
  const P = ([x, y]) => [OX + x * K, OY - y * K];
  function draw() {
    const wind = { from: get('rt-wfrom'), kt: get('rt-wkt') };
    const tas = get('rt-tas');
    let plan;
    try { plan = planSortie(wind, tas); } catch { out.replaceChildren(para('The crosswind is stronger than the true airspeed: no heading holds this course.')); return; }
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 318 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, TRUE NORTH UP, INVENTED ROUTE')];
    // North arrow and wind arrow (drawn blowing downwind, from the "from" side).
    items.push(el('path', { class: 'fill', d: 'M600 52 l6 14 h-12 z' }), el('text', { class: 'lbl small', x: 600, y: 44, 'text-anchor': 'middle' }, 'N'));
    if (wind.kt > 0) {
      const a = wind.from * Math.PI / 180, cx = 560, cy = 270, L = 16 + wind.kt * 0.35;
      const [x1, y1] = [cx + Math.sin(a) * L, cy - Math.cos(a) * L], [x2, y2] = [cx - Math.sin(a) * L, cy + Math.cos(a) * L];
      const hx = -Math.sin(a), hy = Math.cos(a);
      items.push(el('line', { class: 'ln on', x1, y1, x2, y2 }), el('path', { class: 'mine', d: `M${x2 + hx * 4} ${y2 + hy * 4} L${x2 - hx * 8 - hy * 6} ${y2 - hy * 8 + hx * 6} L${x2 - hx * 8 + hy * 6} ${y2 - hy * 8 - hx * 6} z` }), el('text', { class: 'lbl small', x: cx, y: 306, 'text-anchor': 'middle' }, `Wind ${fmtHdg(wind.from)}° / ${wind.kt} kt`));
    }
    // Route legs with heading arrows offset by the WCA.
    for (const leg of plan.legs) {
      const [x1, y1] = P(SORTIE.points[leg.from].pos), [x2, y2] = P(SORTIE.points[leg.to].pos);
      items.push(el('line', { class: 'ln heavy', x1, y1, x2, y2 }));
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, h = leg.th * Math.PI / 180;
      items.push(el('line', { class: 'ln on', x1: mx, y1: my, x2: mx + Math.sin(h) * 26, y2: my - Math.cos(h) * 26 }));
      // Label on the left of the direction of flight, clear of the line.
      const len = Math.hypot(x2 - x1, y2 - y1), nx = (y2 - y1) / len, ny = -(x2 - x1) / len;
      items.push(el('text', { class: 'lbl small', x: mx + nx * 16, y: my + ny * 16 + 4, 'text-anchor': nx > 0.3 ? 'start' : nx < -0.3 ? 'end' : 'middle' }, `${leg.dist.toFixed(0)} NM, MH ${fmtHdg(leg.mh)}`));
    }
    const [hx, hy] = P(SORTIE.points.HOME.pos), [ax, ay] = P(SORTIE.points.ALT.pos);
    items.push(el('line', { class: 'ln dashed', x1: hx, y1: hy, x2: ax, y2: ay }));
    for (const [id, p] of Object.entries(SORTIE.points)) {
      const [x, y] = P(p.pos);
      items.push(id === 'HOME' || id === 'ALT' ? el('circle', { class: 'thin', cx: x, cy: y, r: 7 }) : el('path', { class: 'fill', d: `M${x} ${y - 6} l6 10 h-12 z` }));
      const left = id === 'ALPHA';
      items.push(el('text', { class: 'lbl small', x: left ? x - 10 : x + 10, y: id === 'AREA' ? y + 18 : y - 8, 'text-anchor': left ? 'end' : 'start' }, p.name));
    }
    const [ex, ey] = P(SORTIE.points.AREA.pos);
    items.push(el('rect', { class: 'thin dotted', x: ex + 6, y: ey - 40, width: 110, height: 80 }), el('text', { class: 'lbl small', x: ex + 61, y: ey - 26, 'text-anchor': 'middle' }, 'Working area'));
    svg.replaceChildren(...items);
    const rows = [...plan.legs, plan.altLeg].map((l, i) => {
      const tr = document.createElement('tr');
      const cells = [`${SORTIE.points[l.from].short} → ${SORTIE.points[l.to].short}${i === 3 ? ' (divert)' : ''}`, `${fmtHdg(l.tc)}°`, `${l.wca >= 0 ? 'R' : 'L'} ${Math.abs(l.wca).toFixed(0)}°`, `${fmtHdg(l.th)}°`, `${fmtHdg(l.mh)}°`, l.dist.toFixed(0), l.gs.toFixed(0), fmtMin(l.minutes)];
      cells.forEach((c, j) => { const td = document.createElement(j ? 'td' : 'th'); if (!j) td.scope = 'row'; td.textContent = c; tr.append(td); });
      return tr;
    });
    tbody.replaceChildren(...rows);
    out.replaceChildren(
      para(`Out ${fmtMin(plan.legs[0].minutes + plan.legs[1].minutes)} to the area, home ${fmtMin(plan.legs[2].minutes)}. The wind changes every heading and ground speed, so it changes the fuel too: see Figure 2.`),
      para(`Read across one row: true course, correct for the wind (WCA) to get the true heading, apply the ${SORTIE.varE}° E variation to get the magnetic heading, then distance ÷ ground speed gives the time.`, 'derived'),
    );
    publish(plan, wind);
  }
  draw();
}

// Figure 2: the fuel ladder for Figure 1's plan, with JOKER and BINGO.
function setupLadder(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const X0 = 70, X1 = 600, Y0 = 270, Y1 = 40, FMAX = 7000;
  function draw() {
    if (!current) return;
    const { plan } = current;
    const tMax = Math.max(80, Math.ceil(plan.ladder.at(-1).min / 10) * 10 + 10);
    const xOf = (t) => X0 + (t / tMax) * (X1 - X0), yOf = (f) => Y0 - (f / FMAX) * (Y0 - Y1);
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 318 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'FUEL REMAINING AGAINST TIME, INVENTED JET'),
      el('line', { class: 'thin', x1: X0, y1: Y0, x2: X1, y2: Y0 }), el('line', { class: 'thin', x1: X0, y1: Y0, x2: X0, y2: Y1 })];
    for (let f = 0; f <= FMAX; f += 1000) items.push(el('text', { class: 'lbl small', x: X0 - 6, y: yOf(f) + 4, 'text-anchor': 'end' }, String(f)));
    for (let t = 0; t <= tMax; t += 10) items.push(el('text', { class: 'lbl small', x: xOf(t), y: Y0 + 16, 'text-anchor': 'middle' }, `${t}`));
    items.push(el('text', { class: 'lbl small', x: (X0 + X1) / 2, y: Y0 + 32, 'text-anchor': 'middle' }, 'Minutes after takeoff'), el('text', { class: 'lbl small', x: 18, y: Y1 - 8 }, 'lb'));
    for (const [v, name, cls] of [[plan.joker, 'JOKER', 'ln dashed'], [plan.bingo, 'BINGO', 'ln dashed on'], [SORTIE.fuel.reserve, 'Reserve', 'thin dotted']]) {
      items.push(el('line', { class: cls, x1: X0, y1: yOf(v), x2: X1, y2: yOf(v) }), el('text', { class: 'lbl small', x: X1 - 4, y: yOf(v) - 5, 'text-anchor': 'end' }, `${name} ${lb(v)}`));
    }
    const pts = plan.ladder.map((p) => [xOf(p.min), yOf(p.fuel)]);
    items.push(el('polyline', { class: 'ln heavy', points: pts.map((p) => p.join(',')).join(' ') }));
    plan.ladder.forEach((p, i) => { const [x, y] = pts[i]; items.push(el('circle', { class: 'fill', cx: x, cy: y, r: 3.5 }), el('text', { class: 'lbl small', x: x + 4, y: y - 8 - (i % 2) * 12 }, `${p.at} ${lb(p.fuel)}`)); });
    svg.replaceChildren(...items);
    out.replaceChildren(
      para(plan.enoughForArea ? `The flight reaches the area with ${lb(plan.atArea)}, works ${Math.floor(plan.toJoker)} minutes until JOKER (${lb(plan.joker)}), and lands home with about ${lb(plan.landHome)}.` : `The flight reaches the area below JOKER: there is no time to work. Change the plan.`),
      para(`BINGO ${lb(plan.bingo)} = fuel home from the area + an approach + the divert to the alternate + a second approach + the ${lb(SORTIE.fuel.reserve)} reserve. JOKER is the lead's ${lb(SORTIE.fuel.jokerMargin)} above it.`, 'derived'),
    );
  }
  listeners.push(draw);
  draw();
}

// Figure 3: the equal time point between two fields.
function setupEtp(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const get = bindRanges(root, draw);
  const D = 600, TAS = 420, X0 = 60, X1 = 580, Y = 130;
  function draw() {
    const w = get('etp-wind'); // + = tailwind going on
    const gsContinue = TAS + w, gsReturn = TAS - w;
    const etp = equalTimePoint({ distance: D, gsReturn, gsContinue });
    const xOf = (d) => X0 + (d / D) * (X1 - X0);
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 238 }), el('text', { class: 'lbl', x: 14, y: 22 }, `ONE ${D} NM LEG BETWEEN TWO SUITABLE FIELDS, ${TAS} KTAS`),
      el('line', { class: 'ln heavy', x1: X0, y1: Y, x2: X1, y2: Y }),
      el('circle', { class: 'thin', cx: X0, cy: Y, r: 8 }), el('text', { class: 'lbl small', x: X0, y: Y + 28, 'text-anchor': 'middle' }, 'Field behind'),
      el('circle', { class: 'thin', cx: X1, cy: Y, r: 8 }), el('text', { class: 'lbl small', x: X1, y: Y + 28, 'text-anchor': 'middle' }, 'Field ahead'),
      el('line', { class: 'thin dotted', x1: xOf(D / 2), y1: Y - 40, x2: xOf(D / 2), y2: Y + 40 }), el('text', { class: 'lbl small', x: xOf(D / 2), y: Y + 54, 'text-anchor': 'middle' }, 'Midpoint'),
      el('line', { class: 'ln on', x1: xOf(etp), y1: Y - 46, x2: xOf(etp), y2: Y + 12 }), el('text', { class: 'lbl call', x: xOf(etp), y: Y - 52, 'text-anchor': 'middle' }, `ETP ${etp.toFixed(0)} NM`)];
    if (w !== 0) {
      const dir = w > 0 ? 1 : -1, cx = 320, cy = 200;
      items.push(el('line', { class: 'ln on', x1: cx - dir * 40, y1: cy, x2: cx + dir * 40, y2: cy }), el('path', { class: 'mine', d: `M${cx + dir * 46} ${cy} l${-dir * 10} -5 v10 z` }), el('text', { class: 'lbl small', x: cx, y: cy + 22, 'text-anchor': 'middle' }, `Wind component ${Math.abs(w)} kt toward the ${w > 0 ? 'field ahead' : 'field behind'}`));
    }
    svg.replaceChildren(...items);
    const tBack = (etp / gsReturn) * 60, tOn = ((D - etp) / gsContinue) * 60;
    out.replaceChildren(para(`From the ETP, turning back takes ${tBack.toFixed(0)} min at ${gsReturn} kt and going on takes ${tOn.toFixed(0)} min at ${gsContinue} kt.`), para(`ETP = ${D} × ${gsReturn} ÷ (${gsReturn} + ${gsContinue}) = ${etp.toFixed(0)} NM from the field behind.`, 'derived'));
  }
  draw();
}

function setupPlanQuiz(root) {
  quickQuiz(ui(root), {
    items: PLAN_QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

const blocks = { route: setupRoute, ladder: setupLadder, etp: setupEtp, plan: setupPlanQuiz, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
