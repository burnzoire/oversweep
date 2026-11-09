// Presentation for the Radar, Warning Receivers and Countermeasures module.
// Numbers, steps and questions come from radar-model.mjs; this file reads
// inputs and draws.
import {
  BAR_DEG, RADAR_QUESTIONS, RWR_STEPS, clock, closureKt, elevationExact, elevationRule, frameSeconds, inNotch, inVolume,
  notchHalfWidth, ownRadialKt, rel, scanCoverage,
} from './radar-model.mjs';
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
const thou = (ft) => `${Math.round(ft / 100) / 10}K`;
const jet = (x, y, h, cls = 'fill', s = 1) => el('path', { class: cls, d: `M0 -${9 * s} L${6 * s} ${7 * s} L0 ${3 * s} L-${6 * s} ${7 * s} Z`, transform: `translate(${x} ${y}) rotate(${h})` });
function readInputs(root) {
  const inputs = Object.fromEntries([...root.querySelectorAll('input')].map((i) => [i.name, i]));
  const outs = Object.fromEntries([...root.querySelectorAll('output')].map((o) => [o.htmlFor.value, o]));
  return { inputs, outs };
}

// Figure 1: side view of the scan volume against a called altitude.
function setupScan(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const { inputs, outs } = readInputs(root);
  const OWN = 20000, W = 640, H = 320, X0 = 50, Y0 = 250, KX = 520 / 40, KY = 200 / 40000;
  const X = (nm) => X0 + nm * KX, Y = (ft) => Y0 - (ft - 10000) * KY;
  function draw() {
    const v = Object.fromEntries(Object.entries(inputs).map(([k, i]) => [k, Number(i.value)]));
    const tgtAlt = OWN + v.dalt;
    const cov = scanCoverage({ ownAltFt: OWN, antElevDeg: v.elev, bars: v.bars, rangeNm: v.range });
    outs['scan-elev'].textContent = `${v.elev > 0 ? '+' : ''}${v.elev}°`;
    outs['scan-bars'].textContent = `${v.bars} bar${v.bars > 1 ? 's' : ''}`;
    outs['scan-dalt'].textContent = `${v.dalt >= 0 ? '+' : '−'}${Math.abs(v.dalt).toLocaleString('en-US')} ft`;
    outs['scan-range'].textContent = `${v.range} NM`;
    // The volume as a wedge from your jet, using the 100-ft-per-degree-per-NM rule, clipped to the plot.
    const far = 40, clip = el('clipPath', { id: 'scan-clip' });
    clip.append(el('rect', { x: X0, y: 34, width: X(far) - X0, height: Y0 + 16 - 34 }));
    const vol = el('g', { 'clip-path': 'url(#scan-clip)' });
    vol.append(el('path', { class: 'shade', d: `M${X(0)} ${Y(OWN)} L${X(far)} ${Y(OWN + cov.highDeg * far * 100)} L${X(far)} ${Y(OWN + cov.lowDeg * far * 100)} Z` }));
    for (let b = 0; b <= v.bars; b++) {
      const e = cov.lowDeg + b * BAR_DEG;
      vol.append(el('line', { class: 'thin', x1: X(0), y1: Y(OWN), x2: X(far), y2: Y(OWN + e * far * 100) }));
    }
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: W - 2, height: H - 2 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'SIDE VIEW, ILLUSTRATIVE BAR WIDTH'), el('defs', {}), vol];
    items[2].append(clip);
    for (const ft of [10000, 20000, 30000, 40000, 50000]) items.push(el('line', { class: 'thin dotted', x1: X0, y1: Y(ft), x2: X(40), y2: Y(ft) }), el('text', { class: 'lbl small', x: X0 - 6, y: Y(ft) + 4, 'text-anchor': 'end' }, `${ft / 1000}K`));
    for (const nm of [10, 20, 30, 40]) items.push(el('text', { class: 'lbl small', x: X(nm), y: Y0 + 34, 'text-anchor': 'middle' }, `${nm} NM`));
    const hit = inVolume(cov, tgtAlt);
    items.push(jet(X(0), Y(OWN), 90), el('text', { class: 'lbl small', x: X(0) + 4, y: Y(OWN) + 22 }, 'You, 20,000 ft'));
    items.push(jet(X(v.range), Y(tgtAlt), 270, hit ? 'mine' : 'fill'), el('text', { class: 'lbl small', x: X(v.range) + 10, y: Y(tgtAlt) - 8 }, `Called group ${thou(tgtAlt)}`));
    items.push(el('line', { class: 'ln dashed', x1: X(v.range), y1: Y(cov.lowFt), x2: X(v.range), y2: Y(cov.highFt) }));
    svg.replaceChildren(...items);
    const need = elevationRule(v.dalt, v.range);
    out.replaceChildren(
      para(hit ? 'The called group is inside the scan volume.' : 'The called group is outside the scan volume: move the elevation, then wait a full frame.'),
      para(`At ${v.range} NM the volume covers ${thou(cov.lowFt)} to ${thou(cov.highFt)}. The rule: ${v.dalt.toLocaleString('en-US')} ft ÷ (${v.range} × 100) = ${need.toFixed(1)}° (exact ${elevationExact(v.dalt, v.range).toFixed(1)}°). Frame at 140° wide: about ${Math.round(frameSeconds(v.bars, 140))} s.`, 'derived'),
    );
  }
  for (const i of Object.values(inputs)) i.addEventListener('input', draw);
  draw();
}

// Figure 2: plan view of a target crossing the line of sight; the gate shades the notch.
function setupNotch(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const { inputs, outs } = readInputs(root);
  const FIGHTER = 450, W = 640, H = 340;
  function draw() {
    const ta = Number(inputs.ta.value), gate = Number(inputs.gate.value), tgt = Number(inputs.speed.value);
    outs['notch-ta'].textContent = `${ta}°`;
    outs['notch-gate'].textContent = `${gate} kt`;
    outs['notch-speed'].textContent = `${tgt} kt`;
    const notched = inNotch(tgt, ta, gate);
    const fx = 120, fy = 170, tx = 470, ty = 170;
    // The target's heading: TA measured from its nose to the fighter, here to its left (west).
    const h = 270 - ta;
    const half = Math.min(89, notchHalfWidth(tgt, gate));
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: W - 2, height: H - 2 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'PLAN VIEW, ILLUSTRATIVE SPEED GATE')];
    // Notch sector drawn round the target: headings within ±half of the beam.
    const arc = (a0, a1, r) => {
      const p = (a) => [tx + r * Math.sin((a * Math.PI) / 180), ty - r * Math.cos((a * Math.PI) / 180)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `M${tx} ${ty} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z`;
    };
    for (const c of [0, 180]) items.push(el('path', { class: 'shade', d: arc(c - half, c + half, 120) }));
    items.push(el('text', { class: 'lbl small', x: tx, y: ty - 128, 'text-anchor': 'middle' }, 'Headings in the notch'));
    items.push(el('line', { class: 'thin dashed', x1: fx, y1: fy, x2: tx, y2: ty }), el('text', { class: 'lbl small', x: (fx + tx) / 2, y: fy + 16, 'text-anchor': 'middle' }, 'Line of sight'));
    const vx = Math.sin((h * Math.PI) / 180), vy = -Math.cos((h * Math.PI) / 180);
    items.push(el('line', { class: notched ? 'ln' : 'ln on', x1: tx, y1: ty, x2: tx + vx * 90, y2: ty + vy * 90 }));
    const rad = ownRadialKt(tgt, ta);
    items.push(el('line', { class: 'ln dashed on', x1: tx, y1: ty, x2: tx - (rad / tgt) * 90, y2: ty }));
    items.push(jet(fx, fy, 90, 'mine', 1.4), el('text', { class: 'lbl small', x: fx, y: fy + 26, 'text-anchor': 'middle' }, `Radar, ${FIGHTER} kt`));
    items.push(el('circle', { class: notched ? 'fill' : 'mine', cx: tx, cy: ty, r: 6 }), jet(tx + vx * 90, ty + vy * 90, h, notched ? 'fill' : 'mine', 1.1), el('text', { class: 'lbl small', x: tx + 18, y: ty + 40 }, notched ? 'Filtered as clutter' : 'Displayed'));
    items.push(el('text', { class: 'lbl small', x: tx + vx * 104, y: ty + vy * 104 + 4, 'text-anchor': vx < 0 ? 'end' : 'start' }, `Target ${tgt} kt`));
    svg.replaceChildren(...items);
    out.replaceChildren(
      para(notched ? 'In the notch: the target moves almost straight across the line of sight, so its Doppler looks like the ground\'s and the radar cancels it.' : 'Outside the notch: the target\'s own motion along the line of sight is above the gate, so the radar keeps it.'),
      para(`Target's own speed along the line of sight ${Math.round(rad)} kt (gate ${gate} kt); closure ${Math.round(closureKt(FIGHTER, tgt, ta))} kt, against ${FIGHTER} kt for the ground ahead. Notch: ${Math.round(90 - half)}° to ${Math.round(90 + half)}° target aspect.`, 'derived'),
    );
  }
  for (const i of Object.values(inputs)) i.addEventListener('input', draw);
  draw();
}

// Figure 3: a generic warning-receiver scope, stepped through the scenario.
function setupRwr(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const [back, next] = root.querySelectorAll('[data-back], [data-next]');
  const count = root.querySelector('[data-count]');
  let current = 0;
  const C = 170, R = 120;
  function draw() {
    const s = RWR_STEPS[current];
    const items = [el('rect', { class: 'frame', x: 1, y: 1, width: 638, height: 338 }), el('text', { class: 'lbl', x: 14, y: 22 }, 'GENERIC WARNING RECEIVER SCOPE')];
    items.push(el('circle', { class: 'thin', cx: C, cy: C, r: R }), el('circle', { class: 'thin dotted', cx: C, cy: C, r: R / 2 }));
    for (let a = 0; a < 360; a += 30) {
      const x = C + R * Math.sin((a * Math.PI) / 180), y = C - R * Math.cos((a * Math.PI) / 180);
      items.push(el('line', { class: 'thin', x1: C + (R - 8) * Math.sin((a * Math.PI) / 180), y1: C - (R - 8) * Math.cos((a * Math.PI) / 180), x2: x, y2: y }));
    }
    items.push(el('text', { class: 'lbl small', x: C, y: C - R - 8, 'text-anchor': 'middle' }, 'NOSE'), jet(C, C, 0, 'fill', 0.8));
    for (const t of s.threats) {
      const r = rel(t.bearing, s.heading), d = R * 0.78;
      const x = C + d * Math.sin((r * Math.PI) / 180), y = C - d * Math.cos((r * Math.PI) / 180);
      if (t.mode === 'track') items.push(el('rect', { class: 'ln on', x: x - 14, y: y - 12, width: 28, height: 22 }));
      if (t.mode === 'launch') items.push(el('circle', { class: 'ln on', cx: x, cy: y - 1, r: 17 }));
      if (t.kind === 'air') items.push(el('path', { class: 'ln', d: `M${x - 9} ${y - 14} L${x} ${y - 20} L${x + 9} ${y - 14}` }));
      items.push(el('text', { class: 'lbl', x, y: y + 4, 'text-anchor': 'middle' }, t.id));
    }
    // Plan-view inset: your heading and the threats' true bearings.
    const PX = 470, PY = 170;
    items.push(el('text', { class: 'lbl small', x: PX, y: 46, 'text-anchor': 'middle' }, 'PLAN VIEW, NORTH UP'), jet(PX, PY, s.heading, 'mine'));
    for (const t of s.threats) {
      const x = PX + 110 * Math.sin((t.bearing * Math.PI) / 180), y = PY - 110 * Math.cos((t.bearing * Math.PI) / 180);
      items.push(el('line', { class: 'thin dotted', x1: PX, y1: PY, x2: x, y2: y }), el('text', { class: 'lbl small', x, y: y - 6, 'text-anchor': 'middle' }, `${t.id} ${t.mode}`));
    }
    items.push(el('text', { class: 'lbl small', x: PX, y: 318, 'text-anchor': 'middle' }, `Heading ${String(s.heading).padStart(3, '0')}`));
    svg.replaceChildren(...items);
    const where = s.threats.map((t) => `${t.id} at ${clock(rel(t.bearing, s.heading))} o'clock, ${t.mode}`).join('; ');
    out.replaceChildren(para(`${s.phase}. ${s.text}`), para(where || 'No symbols.', 'derived'));
    back.disabled = current === 0;
    next.disabled = current === RWR_STEPS.length - 1;
    count.textContent = `Step ${current + 1} of ${RWR_STEPS.length}`;
  }
  back.addEventListener('click', () => { current = Math.max(0, current - 1); draw(); });
  next.addEventListener('click', () => { current = Math.min(RWR_STEPS.length - 1, current + 1); draw(); });
  draw();
}

function setupQuestions(root) {
  quickQuiz(ui(root), {
    items: RADAR_QUESTIONS,
    show: (q, prompt) => { prompt.textContent = `Outcome ${q.outcome}. ${q.ask}`; },
    options: (q) => q.options,
    label: (o) => o,
    isRight: (q, o) => o === q.answer,
    feedback: (q, o, right) => `${right ? 'Correct.' : 'Not quite.'} ${q.why}`,
  });
}

const blocks = { scan: setupScan, notch: setupNotch, rwr: setupRwr, questions: setupQuestions, terms: (root) => termQuiz(root, { hideTerm: true }) };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
