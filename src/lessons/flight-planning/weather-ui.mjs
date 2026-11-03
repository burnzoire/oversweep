// Presentation for Weather and Performance: the METAR decoder (Figure 1), the
// TAF timeline (Figure 2), density altitude (Figure 3), weight and balance
// (Figure 4) and the quizzes. Facts come from weather-model.mjs.
import { LOADING, METARS, TAF_EXAMPLE, WX_QUESTIONS, altimeterCorrection, balance, decodeMetar, decodeTaf, densityAltitude, pressureAltitude, standardTemp } from './weather-model.mjs';
import { quickQuiz, termQuiz } from '../shared/quick-quiz.mjs';

const SVG = 'http://www.w3.org/2000/svg';
function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
const html = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
const para = (text, cls) => html('p', { textContent: text, className: cls ?? '' });
const ui = (root) => ({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') });
const ft = (x) => `${Math.round(x).toLocaleString('en-US')} ft`;
const visText = (d) => (d.vis === null ? 'not given' : `${d.visQ ? `${d.visQ} than ` : ''}${Number(d.vis.toFixed(2))} SM`);
const ceilText = (c, none) => (c === undefined ? 'unknown (a layer height not reported)' : c === null ? none : ft(c));

function bindRanges(root, onChange) {
  const inputs = [...root.querySelectorAll('input[type="range"]')];
  const show = () => inputs.forEach((i) => { const o = root.querySelector(`output[for="${i.id}"]`); if (o) o.textContent = `${i.dataset.fmt === 'alt' ? Number(i.value).toFixed(2) : Number(i.value).toLocaleString('en-US')} ${i.dataset.unit ?? ''}`.trim(); });
  inputs.forEach((i) => i.addEventListener('input', () => { show(); onChange(); }));
  show();
  return (id) => Number(root.querySelector(`#${id}`).value);
}

// Figure 1: decode a METAR, group by group.
function setupMetar(root) {
  const input = root.querySelector('input[type="text"]');
  const chips = root.querySelector('[data-examples]');
  const tbody = root.querySelector('tbody');
  const out = root.querySelector('[data-result]');
  const buttons = METARS.map((m) => {
    const b = html('button', { type: 'button', textContent: m.label });
    b.addEventListener('click', () => { input.value = m.text; draw(); });
    chips.append(b);
    return [m, b];
  });
  function draw() {
    const d = decodeMetar(input.value);
    buttons.forEach(([m, b]) => b.setAttribute('aria-pressed', String(m.text === input.value.trim().toUpperCase())));
    tbody.replaceChildren(...d.parts.map((p) => html('tr', { className: `k-${p.kind}` }, html('th', { scope: 'row', textContent: p.tok }), html('td', { textContent: p.kind }), html('td', { textContent: p.text }))));
    out.replaceChildren(para(d.parts.length ? `Ceiling: ${ceilText(d.ceiling, 'none (no broken or overcast layer)')}. Visibility: ${visText(d)}.` : 'Type or choose a report.'));
  }
  input.addEventListener('input', draw);
  input.value = METARS[0].text;
  draw();
}

// Figure 2: the TAF on a timeline, and what it forecasts at your ETA.
function setupTaf(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const taf = decodeTaf(TAF_EXAMPLE);
  const get = bindRanges(root, draw);
  const X0 = 40, X1 = 610, start = Number(taf.groups.length && TAF_EXAMPLE.match(/(\d{2})(\d{2})\/\d{4}/)[2]);
  const xOf = (h) => X0 + (h / taf.hours) * (X1 - X0);
  const label = (g) => `${g.ceiling === null ? 'no ceiling' : g.ceiling === undefined ? 'ceiling unknown' : `ceiling ${g.ceiling.toLocaleString('en-US')}`}, ${visText(g)}`;
  function draw() {
    const eta = get('taf-eta');
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 238 }), el('text', { class: 'lbl', x: 14, y: 22 }, `${taf.station} TAF, VALID ${taf.hours} HOURS`)];
    for (let h = 0; h <= taf.hours; h += 2) items.push(el('line', { class: 'thin dotted', x1: xOf(h), y1: 40, x2: xOf(h), y2: 190 }), el('text', { class: 'lbl small', x: xOf(h), y: 206, 'text-anchor': 'middle' }, `${String((start + h) % 24).padStart(2, '0')}Z`));
    items.push(el('text', { class: 'lbl small', x: X0, y: 48 }, 'PREVAILING (BASE AND FM)'), el('text', { class: 'lbl small', x: X0, y: 128 }, 'TEMPO AND PROB30'));
    for (const g of taf.groups) {
      const prevailing = g.type === 'BASE' || g.type === 'FM';
      const y = prevailing ? 56 : 136, low = g.ceiling !== null && g.ceiling !== undefined && g.ceiling < 3000 || (g.vis !== null && g.vis < 5);
      items.push(el('rect', { class: low ? 'mine' : 'shade', x: xOf(g.start) + 1, y, width: Math.max(4, xOf(g.end) - xOf(g.start) - 2), height: 46, stroke: 'currentColor', 'stroke-width': 1 }));
      const cls = low ? 'lbl small inv' : 'lbl small';
      items.push(el('text', { class: cls, x: xOf(g.start) + 5, y: y + 18 }, g.type === 'BASE' ? 'Base' : g.type));
      const w = xOf(g.end) - xOf(g.start);
      if (w > 60) items.push(el('text', { class: cls, x: xOf(g.start) + 5, y: y + 34 }, w > 150 ? label(g) : `${g.ceiling == null ? '—' : g.ceiling.toLocaleString('en-US')} / ${visText(g)}`));
    }
    items.push(el('line', { class: 'ln on', x1: xOf(eta), y1: 34, x2: xOf(eta), y2: 196 }), el('text', { class: 'lbl call', x: xOf(eta), y: 226, 'text-anchor': 'middle' }, `ETA ${String((start + eta) % 24).padStart(2, '0')}00Z`));
    svg.replaceChildren(...items);
    const at = taf.groups.filter((g) => eta >= g.start && eta < g.end);
    out.replaceChildren(...at.map((g) => para(`${g.type === 'BASE' ? 'Base forecast' : g.type === 'FM' ? 'From group' : g.type === 'TEMPO' ? 'Temporarily (under an hour at a time)' : '30% chance'}: ${g.parts.map((p) => p.text).join('; ')}.`, g.type === 'BASE' || g.type === 'FM' ? '' : 'derived')));
  }
  draw();
}

// Figure 3: pressure and density altitude.
function setupDensity(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const get = bindRanges(root, draw);
  function draw() {
    const elev = get('da-elev'), set = get('da-alt'), oat = get('da-oat');
    const pa = pressureAltitude(elev, set), da = densityAltitude(pa, oat), std = standardTemp(pa);
    const Y0 = 220, Y1 = 40, MAX = 14000, yOf = (f) => Y0 - (Math.max(-1000, Math.min(MAX, f)) / MAX) * (Y0 - Y1);
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 238 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'THREE ALTITUDES FOR ONE AIRFIELD'), el('line', { class: 'thin', x1: 120, y1: Y0, x2: 120, y2: Y1 })];
    for (let f = 0; f <= MAX; f += 2000) items.push(el('line', { class: 'thin', x1: 114, y1: yOf(f), x2: 120, y2: yOf(f) }), el('text', { class: 'lbl small', x: 108, y: yOf(f) + 4, 'text-anchor': 'end' }, f.toLocaleString('en-US')));
    for (const [v, name, cls, x] of [[elev, 'Field elevation', 'ln', 140], [pa, 'Pressure altitude', 'ln dashed', 300], [da, 'Density altitude', 'ln on heavy', 450]]) {
      items.push(el('line', { class: cls, x1: 124, y1: yOf(v), x2: 620, y2: yOf(v) }), el('text', { class: 'lbl small', x, y: yOf(v) - 6 }, `${name} ${ft(v)}`));
    }
    items.push(el('path', { class: 'fill', d: `M124 ${yOf(elev)} h90 v6 h-90 z` }));
    svg.replaceChildren(...items);
    const corr = altimeterCorrection(set);
    out.replaceChildren(
      para(`Pressure altitude ${ft(pa)}; standard temperature there is ${std.toFixed(0)} °C, and it is ${oat.toFixed(0)} °C, so the density altitude is ${ft(da)}.`),
      para(`Pressure altitude = field elevation ${corr >= 0 ? '+' : '−'} ${Math.abs(Math.round(corr))} ft for an altimeter setting of ${set.toFixed(2)}. ${oat > std ? 'Warmer than standard: density altitude is above pressure altitude.' : oat < std ? 'Colder than standard: density altitude is below pressure altitude.' : 'Standard temperature: they are equal.'}`, 'derived'),
    );
  }
  draw();
}

// Figure 4: weight and balance on an invented trainer.
function setupBalance(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const get = bindRanges(root, draw);
  const { fwd, aft, maxWeight } = LOADING.limits;
  const X0 = 40, X1 = 600, A0 = 0, A1 = 260, xOf = (arm) => X0 + ((arm - A0) / (A1 - A0)) * (X1 - X0);
  function draw() {
    const loads = Object.fromEntries(LOADING.items.map((it) => [it.id, get(`wb-${it.id}`)]));
    const b = balance(loads);
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 238 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'SIDE VIEW, ARMS IN INCHES AFT OF THE DATUM, INVENTED TRAINER')];
    items.push(el('path', { class: 'thin', d: `M${xOf(10)} 130 Q${xOf(40)} 100 ${xOf(110)} 98 L${xOf(240)} 104 L${xOf(255)} 70 L${xOf(258)} 120 Q${xOf(150)} 150 ${xOf(10)} 130 z` }));
    items.push(el('line', { class: 'ln dashed', x1: xOf(0), y1: 50, x2: xOf(0), y2: 200 }), el('text', { class: 'lbl small', x: xOf(0) + 4, y: 60 }, 'Datum'));
    items.push(el('rect', { class: b.tooFwd || b.tooAft ? 'shade' : 'shade', x: xOf(fwd), y: 160, width: xOf(aft) - xOf(fwd), height: 22 }), el('text', { class: 'lbl small', x: xOf(fwd) - 6, y: 176, 'text-anchor': 'end' }, `CG limits ${fwd} to ${aft} in`));
    for (const r of b.rows) {
      if (!r.weight) continue;
      const x = xOf(r.arm), h = 6 + Math.sqrt(r.weight) * 0.25;
      items.push(el('line', { class: 'thin', x1: x, y1: 116, x2: x, y2: 116 + h }), el('circle', { class: 'fill', cx: x, cy: 116, r: 3 }));
      items.push(el('text', { class: 'lbl small', x, y: r.label === 'Empty aircraft' ? 90 : r.label === 'Fuel' ? 80 : 150, 'text-anchor': 'middle' }, `${r.label.split(' ')[0]} ${r.weight}`));
    }
    const cgx = xOf(b.cg);
    items.push(el('line', { class: 'ln on heavy', x1: cgx, y1: 150, x2: cgx, y2: 190 }), el('path', { class: 'mine', d: `M${cgx} 150 l-7 -12 h14 z` }), el('text', { class: 'lbl call', x: cgx, y: 226, 'text-anchor': 'middle' }, `CG ${b.cg.toFixed(1)} in`));
    svg.replaceChildren(...items);
    const verdict = b.tooHeavy ? `Too heavy: ${b.weight.toLocaleString('en-US')} lb is over the ${maxWeight.toLocaleString('en-US')} lb limit.` : b.tooAft ? 'Out of limits: the CG is aft of the aft limit.' : b.tooFwd ? 'Out of limits: the CG is forward of the forward limit.' : 'Within limits.';
    out.replaceChildren(para(`${b.weight.toLocaleString('en-US')} lb, CG ${b.cg.toFixed(1)} in. ${verdict}`), para(`CG = total moment ${Math.round(b.moment).toLocaleString('en-US')} in-lb ÷ total weight ${b.weight.toLocaleString('en-US')} lb.`, 'derived'));
  }
  draw();
}

function setupWxQuiz(root) {
  quickQuiz(ui(root), {
    items: WX_QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

const blocks = { metar: setupMetar, taf: setupTaf, density: setupDensity, balance: setupBalance, wx: setupWxQuiz, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
