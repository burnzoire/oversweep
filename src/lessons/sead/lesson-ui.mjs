// Presentation for the SEAD and DEAD module's figures and quizzes. Facts,
// geometry and questions come from lesson-model.mjs; this file reads inputs
// and draws.
import { JAMMERS, METHOD_QUESTIONS, PACKAGE_STEPS, SCENE, burnthroughNm, echo, horizonNm, insideWez, jamming, lineOfSight, lowestVisibleFt } from './lesson-model.mjs';
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
const SOURCES = { jp: '#source-jp', usna: '#source-usna', wiki: '#source-wiki' };
const LABEL = { jp: 'JP 3-01', usna: 'USNA', wiki: 'Wikipedia' };

// Figure 1: the invented package, plan view, to scale.
function setupPackage(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const [back, next] = root.querySelectorAll('[data-back], [data-next]');
  const count = root.querySelector('[data-count]');
  const K = 7.4, TX = 426, TY = 198;
  const P = ([x, y]) => [TX + x * K, TY - y * K];
  let current = 0;
  const jet = (pos, label, cls = 'fill') => {
    if (!pos) return [];
    const [x, y] = P(pos);
    return [el('path', { class: cls, d: `M${x + 9} ${y} l-14 -6 l3 6 l-3 6 z` }), el('text', { class: 'lbl small', x, y: y - 10, 'text-anchor': 'middle' }, label)];
  };
  const dot = (pos, cls) => { const [x, y] = P(pos); return el('circle', { class: cls, cx: x, cy: y, r: 3 }); };
  function draw() {
    const s = PACKAGE_STEPS[current];
    const [sx, sy] = P(SCENE.sam.pos), [ex, ey] = P(SCENE.ewr.pos), [tx, ty] = P(SCENE.target);
    const samCls = s.samRadar === 'on' ? 'mine' : 'fill';
    const items = [
      el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 318 }),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, TO SCALE, INVENTED POSITIONS'),
      el('circle', { class: s.samRadar === 'destroyed' ? 'thin dotted' : 'shade', cx: sx, cy: sy, r: SCENE.sam.wezNm * K }),
      el('text', { class: 'lbl small', x: sx, y: sy + SCENE.sam.wezNm * K - 6, 'text-anchor': 'middle' }, `Engagement zone, ${SCENE.sam.wezNm} NM (invented)`),
      el('rect', { class: samCls, x: sx - 5, y: sy - 5, width: 10, height: 10 }),
      el('text', { class: 'lbl small', x: sx + 10, y: sy + 4 }, s.samRadar === 'destroyed' ? 'SAM battery: destroyed' : `SAM battery: radar ${s.samRadar === 'on' ? 'ON' : 'silent'}`),
      el('path', { class: s.ewr === 'jammed' ? 'thin' : 'fill', d: `M${ex} ${ey - 7} l7 12 h-14 z` }),
      el('text', { class: 'lbl small', x: ex + 10, y: ey + 20, 'text-anchor': 'end' }, s.ewr === 'jammed' ? 'Early-warning radar: jammed' : 'Early-warning radar'),
      el('path', { class: 'fill', d: `M${tx} ${ty - 6} l6 6 l-6 6 l-6 -6 z` }),
      el('text', { class: 'lbl small', x: tx, y: ty + 20, 'text-anchor': 'middle' }, 'Target'),
    ];
    if (s.soj) {
      const [jx, jy] = P(s.soj);
      items.push(el('ellipse', { class: 'thin dotted', cx: jx, cy: jy, rx: 26, ry: 10 }));
      if (s.ewr === 'jammed') items.push(el('line', { class: 'thin dotted on', x1: jx, y1: jy, x2: ex, y2: ey }), el('line', { class: 'thin dotted on', x1: jx, y1: jy, x2: sx, y2: sy }));
      items.push(...jet(s.soj, 'Stand-off jammer'));
    }
    for (const d of s.decoys) items.push(dot(d, 'mine'));
    if (s.decoys.length) { const [dx, dy] = P(s.decoys[0]); items.push(el('text', { class: 'lbl small', x: dx + 2, y: dy + 26 }, 'Decoys')); }
    for (const a of s.arms) { const [ax, ay] = P(a); items.push(el('line', { class: 'ln on', x1: ax - 10, y1: ay, x2: ax + 6, y2: ay }), el('text', { class: 'lbl small', x: ax - 2, y: ay - 8, 'text-anchor': 'end' }, 'ARMs')); }
    for (const w of s.standoff ?? []) { const [wx, wy] = P(w); items.push(el('line', { class: 'ln on', x1: wx - 8, y1: wy + 4, x2: wx + 6, y2: wy - 3 }), el('text', { class: 'lbl small', x: wx + 8, y: wy + 14 }, 'Stand-off weapon')); }
    items.push(...jet(s.strike, 'Strikers', s.strike && insideWez(s.strike) ? 'mine' : 'fill'), ...jet(s.sead, 'SEAD flight'), ...jet(s.escort, 'Escort'), ...jet(s.dead, 'DEAD flight'));
    if (s.call) items.push(el('text', { class: 'lbl call', x: 14, y: 306 }, s.call));
    for (const n of [0, 1, 2]) items.push(el('line', { class: 'thin', x1: 520 + n * 5 * K, y1: 296, x2: 520 + n * 5 * K, y2: 304 }));
    items.push(el('line', { class: 'thin', x1: 520, y1: 300, x2: 520 + 10 * K, y2: 300 }), el('text', { class: 'lbl small', x: 520 + 10 * K + 8, y: 304 }, '10 NM'));
    svg.replaceChildren(...items);
    back.disabled = current === 0;
    next.disabled = current === PACKAGE_STEPS.length - 1;
    count.textContent = `Step ${current + 1} of ${PACKAGE_STEPS.length}: ${s.phase}`;
    const text = para(`${s.text} `);
    text.append(Object.assign(document.createElement('a'), { href: SOURCES[s.cite], textContent: `[${LABEL[s.cite]}, ${s.page}]` }));
    const more = para('', 'derived');
    more.append(Object.assign(document.createElement('a'), { href: s.href, textContent: 'Read more' }));
    out.replaceChildren(text, more);
  }
  back.addEventListener('click', () => { current = Math.max(0, current - 1); draw(); });
  next.addEventListener('click', () => { current = Math.min(PACKAGE_STEPS.length - 1, current + 1); draw(); });
  draw();
}

// Figure 2: who can see whom. Side view of a radar, a ridge and an aircraft.
function setupHorizon(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const inputs = Object.fromEntries([...root.querySelectorAll('input')].map((i) => [i.name, i]));
  const showOut = (name, v) => { const o = root.querySelector(`output[for="${inputs[name].id}"]`); if (o) o.textContent = v; };
  const W = 640, H = 260, X0 = 30, MAXNM = 60;
  const PX = W - 60;
  const xOf = (nm) => X0 + (nm / MAXNM) * (PX - X0);
  // Heights are exaggerated and rescale to fit. The ground is drawn as the
  // earth's bulge above the straight line joining the radar's foot to the
  // ground 60 NM away: x(L - x) / 2R, the same geometry as the model's.
  let FT_PER_PX = 1;
  const GROUND = 225;
  const R = 6.371e6 * 4 / 3;
  const bulge = (nm) => ((nm * 1852) * ((MAXNM - nm) * 1852) / (2 * R)) / 0.3048;
  const yOf = (nm, ft) => GROUND - (bulge(nm) + ft) / FT_PER_PX;
  function draw() {
    const radarFt = +inputs.mast.value, targetFt = +inputs.alt.value, rangeNm = +inputs.range.value;
    const ridge = inputs.ridge.checked ? { atNm: 12, ft: 1200 } : null;
    FT_PER_PX = Math.max(bulge(MAXNM / 2) * 1.6, radarFt * 1.2, (bulge(rangeNm) + targetFt) * 1.1, ridge ? (bulge(ridge.atNm) + ridge.ft) * 1.2 : 0) / 190;
    showOut('mast', `${radarFt} ft`); showOut('alt', `${targetFt} ft`); showOut('range', `${rangeNm} NM`);
    const los = lineOfSight({ radarFt, targetFt, rangeNm, ridge });
    const surface = Array.from({ length: 61 }, (_, i) => `${xOf(i).toFixed(1)},${yOf(i, 0).toFixed(1)}`).join(' ');
    const items = [
      el('rect', { class: 'frame', x: 1, y: 1, width: W - 2, height: H - 2 }),
      el('text', { class: 'lbl', x: 14, y: 22 }, 'SIDE VIEW, HEIGHTS EXAGGERATED'),
      el('polyline', { class: 'ln heavy', points: surface }),
    ];
    if (ridge) {
      const a = ridge.atNm - 2.5, b = ridge.atNm + 2.5;
      items.push(el('path', { class: 'shade', d: `M${xOf(a)} ${yOf(a, 0)} Q${xOf(ridge.atNm)} ${yOf(ridge.atNm, ridge.ft * 2 - 0)} ${xOf(b)} ${yOf(b, 0)} Z` }), el('text', { class: 'lbl small', x: xOf(ridge.atNm), y: yOf(ridge.atNm, ridge.ft) - 10, 'text-anchor': 'middle' }, `Ridge ${ridge.ft} ft`));
    }
    const [rx, ry] = [xOf(0), yOf(0, radarFt)], [ax, ay] = [xOf(rangeNm), yOf(rangeNm, targetFt)];
    items.push(
      el('line', { class: 'thin', x1: rx, y1: yOf(0, 0), x2: rx, y2: ry }),
      el('path', { class: 'fill', d: `M${rx - 6} ${ry - 4} h12 l-6 8 z` }),
      el('text', { class: 'lbl small', x: rx, y: yOf(0, 0) + 20, 'text-anchor': 'middle' }, 'Radar'),
      el('line', { class: los.visible ? 'ln on' : 'ln dashed', x1: rx, y1: ry, x2: ax, y2: ay }),
      el('path', { class: los.visible ? 'mine' : 'fill', d: `M${ax + 9} ${ay} l-14 -5 l3 5 l-3 5 z` }),
      el('text', { class: 'lbl small', x: ax, y: ay - 12, 'text-anchor': 'middle' }, `${targetFt} ft`),
    );
    const hz = horizonNm(radarFt);
    if (hz < MAXNM) items.push(el('line', { class: 'thin dotted', x1: xOf(hz), y1: yOf(hz, 0) - 6, x2: xOf(hz), y2: yOf(hz, 0) + 6 }), el('text', { class: 'lbl small', x: xOf(hz), y: yOf(hz, 0) + 22, 'text-anchor': 'start' }, `Radar horizon ${hz.toFixed(0)} NM`));
    items.push(el('text', { class: 'lbl small', x: W - 14, y: 22, 'text-anchor': 'end' }, `${MAXNM} NM`));
    svg.replaceChildren(...items);
    const verdict = los.visible ? 'The radar can see you.' : los.blockedBy === 'ridge' ? 'Masked: the ridge blocks the radar.' : 'Hidden: you are below the radar horizon.';
    const floor = lowestVisibleFt(radarFt, rangeNm);
    out.replaceChildren(
      para(verdict),
      para(`Radar horizon ${hz.toFixed(1)} NM; yours at ${targetFt} ft is ${horizonNm(targetFt).toFixed(1)} NM. Over smooth ground it can see an aircraft at ${rangeNm} NM only above about ${Math.round(floor / 10) * 10} ft.`, 'derived'),
    );
  }
  for (const i of Object.values(inputs)) i.addEventListener('input', draw);
  draw();
}

// Figure 3: burnthrough. Relative echo and jamming against range, log scale.
function setupBurn(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const chips = root.querySelector('[data-jammers]');
  const W = 640, H = 260, X0 = 60, X1 = 600, Y0 = 30, Y1 = 220, MAXNM = 50;
  const xOf = (nm) => X0 + (nm / MAXNM) * (X1 - X0);
  const yOf = (p) => { const l = Math.log10(p); return Y1 - ((Math.max(-4, Math.min(4, l)) + 4) / 8) * (Y1 - Y0); };
  let pick = JAMMERS[0];
  const buttons = JAMMERS.map((j) => {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: j.label });
    b.addEventListener('click', () => { pick = j; draw(); });
    chips.append(b);
    return [j, b];
  });
  function draw() {
    const R = Array.from({ length: 99 }, (_, i) => 1 + (i * (MAXNM - 1)) / 98);
    const jam = (r) => jamming(pick.jammerNm ?? r);
    const bt = burnthroughNm(pick.id, pick.jammerNm);
    const line = (f) => R.map((r) => `${xOf(r).toFixed(1)},${yOf(f(r)).toFixed(1)}`).join(' ');
    const items = [
      el('rect', { class: 'frame', x: 1, y: 1, width: W - 2, height: H - 2 }),
      el('text', { class: 'lbl', x: 14, y: 20 }, 'POWER AT THE RADAR (RELATIVE, LOG SCALE) AGAINST RANGE'),
      el('line', { class: 'thin', x1: X0, y1: Y1, x2: X1, y2: Y1 }),
      el('line', { class: 'thin', x1: X0, y1: Y0, x2: X0, y2: Y1 }),
      ...[0, 10, 20, 30, 40, 50].map((n) => el('text', { class: 'lbl small', x: xOf(n), y: Y1 + 16, 'text-anchor': 'middle' }, `${n}`)),
      el('text', { class: 'lbl small', x: X1, y: Y1 + 32, 'text-anchor': 'end' }, 'Attacker\'s range from the radar, NM'),
      el('rect', { class: 'shade', x: X0, y: Y0, width: xOf(bt) - X0, height: Y1 - Y0 }),
      el('text', { class: 'lbl small', x: X0 + 8, y: Y1 - 26 }, 'Echo wins: target seen'),
      el('polyline', { class: 'ln heavy', points: line(echo) }),
      el('text', { class: 'lbl small', x: xOf(4), y: yOf(echo(4)) - 8 }, 'Echo, 1/R⁴'),
      el('polyline', { class: 'ln on', points: line(jam) }),
      el('text', { class: 'lbl small', x: xOf(40), y: yOf(jam(40)) - 8, 'text-anchor': 'middle' }, pick.id === 'self' ? 'Jamming, 1/R²' : `Jamming from ${pick.jammerNm} NM`),
      el('line', { class: 'thin dotted', x1: xOf(bt), y1: Y0, x2: xOf(bt), y2: Y1 }),
      el('text', { class: 'lbl', x: xOf(bt) + 6, y: Y1 - 8 }, `Burnthrough ${bt.toFixed(0)} NM`),
    ];
    svg.replaceChildren(...items);
    buttons.forEach(([j, b]) => b.setAttribute('aria-pressed', String(j === pick)));
    out.replaceChildren(para(`${pick.label}: the radar sees the attacker from ${bt.toFixed(0)} NM in.`), para(pick.note, 'derived'));
  }
  draw();
}

function setupMethods(root) {
  quickQuiz(ui(root), {
    items: METHOD_QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

const blocks = { package: setupPackage, horizon: setupHorizon, burn: setupBurn, methods: setupMethods, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
