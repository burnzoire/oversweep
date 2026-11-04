// Flying the ILS figure: plan and profile views of the approach beside an
// HSI and an attitude indicator whose needles are driven by the aircraft's
// position. Geometry comes from ils-model.mjs.
import { feetPerDot, glideSlopeHeight, ilsLimits, needles, scriptedApproach } from './ils-model.mjs';
import { adi, isNarrow } from '../shared/instruments.mjs';
import { drawHsi, el } from '../shared/hsi.mjs';
import { PLAN, PROF, ilsViews } from './ils-views.mjs';

const views = ilsViews();

const D = Math.PI / 180;
const r0 = (v) => Math.round(v).toLocaleString('en-US');
const dots = (v) => `${Math.abs(v).toFixed(1)} dot${Math.abs(v).toFixed(1) === '1.0' ? '' : 's'}`;
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function draw(svg, pos, trail) {
  const n = needles(pos);
  svg.replaceChildren();
  // Phones: instruments below the views, side by side.
  const narrow = isNarrow(svg);
  svg.setAttribute('viewBox', narrow ? '0 0 444 660' : '0 0 700 470');
  const [hx, hy, ax, ay] = narrow ? [100, 548, 330, 548] : [562, 128, 574, 340];
  views(svg, pos, trail);
  svg.append(narrow
    ? el('rect', { x: 2, y: 456, width: 440, height: 202, class: 'panel' })
    : el('rect', { x: 450, y: PLAN.y, width: 248, height: PROF.y + PROF.h - PLAN.y, class: 'panel' }));
  drawHsi(svg, hx, hy, narrow ? 70 : 78, { heading: 360, course: 360, toFrom: false, dots: n.loc, gs: n.gs });
  svg.append(el('text', { x: hx + 12, y: hy + (narrow ? 104 : 108), class: 'cap', 'text-anchor': 'middle' }, 'HSI'));
  adi(svg, ax, ay, narrow ? 72 : 78, { pitch: 0, bank: 0, ils: n });
  svg.append(el('text', { x: ax, y: ay + (narrow ? 96 : 104), class: 'cap', 'text-anchor': 'middle' }, 'ATTITUDE, ILS BARS'));
  return n;
}

function describe(out, pos, n) {
  const per = feetPerDot(pos.range);
  const side = pos.right > 0 ? 'right of' : 'left of';
  const toGs = pos.height - glideSlopeHeight(pos.range);
  const lim = ilsLimits(n);
  const p1 = document.createElement('p');
  p1.textContent = `${pos.range.toFixed(1)} NM out: ${Math.abs(pos.right) < 1 ? 'on the centerline' : `${r0(Math.abs(pos.right))} ft ${side} the centerline`} is ${dots(n.loc)} on the localizer; ${Math.abs(toGs) < 1 ? 'on the glide slope' : `${r0(Math.abs(toGs))} ft ${toGs > 0 ? 'above' : 'below'} the glide slope`} is ${dots(n.gs)}${n.gs > 0.05 ? ' low' : n.gs < -0.05 ? ' high' : ''}.`;
  const p2 = document.createElement('p');
  p2.className = 'derived';
  p2.textContent = `Here one dot is about ${r0(per.loc)} ft sideways and ${r0(per.gs)} ft up or down. ${lim.rule}`;
  out.replaceChildren(p1, p2);
}

function setupIls(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const f = (name) => root.querySelector(`[name="${name}"]`);
  const show = (name, text) => { const o = root.querySelector(`output[for="${name}"]`); if (o) o.textContent = text; };
  let timer, trail = [];
  const read = () => {
    const range = +f('range').value;
    return { range, right: +f('right').value, height: glideSlopeHeight(range) + +f('above').value };
  };
  function render(pos = read(), keepTrail = false) {
    if (!keepTrail) trail = [];
    show('range', `${pos.range.toFixed(1)} NM`);
    show('right', `${r0(Math.abs(+f('right').value))} ft ${+f('right').value >= 0 ? 'right' : 'left'}`);
    show('above', `${r0(Math.abs(+f('above').value))} ft ${+f('above').value >= 0 ? 'high' : 'low'}`);
    describe(out, pos, draw(svg, pos, trail));
  }
  function stop() { clearInterval(timer); timer = undefined; root.querySelector('[data-fly]').textContent = 'Fly the approach'; }
  root.querySelector('[data-fly]').addEventListener('click', (e) => {
    if (timer) return stop();
    const path = scriptedApproach();
    const stepEvery = reduceMotion() ? 8 : 1;
    let i = 0;
    trail = [];
    e.currentTarget.textContent = 'Stop';
    timer = setInterval(() => {
      const p = path[Math.min(i, path.length - 1)];
      trail.push(p);
      f('range').value = String(Math.max(0.5, p.range.toFixed(1)));
      f('right').value = String(Math.round(p.right / 10) * 10);
      f('above').value = String(Math.round((p.height - glideSlopeHeight(p.range)) / 10) * 10);
      render(p, true);
      i += stepEvery;
      if (i >= path.length || p.range <= 0.5) stop();
    }, 60);
  });
  root.querySelector('[data-centre]').addEventListener('click', () => { stop(); f('right').value = '0'; f('above').value = '0'; render(); });
  for (const c of root.querySelectorAll('input')) c.addEventListener('input', () => { stop(); render(); });
  render();
}

for (const root of document.querySelectorAll('[data-lesson="ils"]')) {
  setupIls(root);
  root.classList.add('ready');
}
