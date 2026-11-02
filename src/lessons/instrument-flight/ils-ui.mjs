// Flying the ILS figure: plan and profile views of the approach beside an
// HSI and an attitude indicator whose needles are driven by the aircraft's
// position. Geometry comes from ils-model.mjs.
import { ILS, FT_PER_NM, feetPerDot, glideSlopeHeight, ilsLimits, needles, scriptedApproach } from './ils-model.mjs';
import { adi, isNarrow } from '../shared/instruments.mjs';
import { drawHsi, el } from '../shared/hsi.mjs';

const D = Math.PI / 180;
const r0 = (v) => Math.round(v).toLocaleString('en-US');
const dots = (v) => `${Math.abs(v).toFixed(1)} dot${Math.abs(v).toFixed(1) === '1.0' ? '' : 's'}`;
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Views: plan above profile, both with the threshold at x = TX.
const X0 = 16, TX = 380, MAXNM = 10.5, PX_NM = (TX - X0) / MAXNM;
const sx = (range) => TX - range * PX_NM; // range in NM before the threshold
const RWY_PX = (ILS.runway / FT_PER_NM) * PX_NM;
const PLAN = { y: 20, h: 190, mid: 115, ftPx: 55 / 2500 };
const PROF = { y: 236, h: 214, base: 430, ftPx: 180 / 3400 };

function views(svg, pos, trail) {
  const g = el('g');
  // Plan view.
  g.append(el('rect', { x: 2, y: PLAN.y, width: 440, height: PLAN.h, class: 'view' }));
  g.append(el('text', { x: 10, y: PLAN.y + 16, class: 'dark' }, 'PLAN VIEW'));
  g.append(el('text', { x: 436, y: PLAN.y + 16, class: 'dark small', 'text-anchor': 'end' }, 'Sideways scale stretched'));
  const locX = TX + RWY_PX + (ILS.locBeyond / FT_PER_NM) * PX_NM;
  const half = (range) => Math.tan(ILS.locFullScale * D) * (range * FT_PER_NM + ILS.runway + ILS.locBeyond) * PLAN.ftPx;
  g.append(el('path', { class: 'beam', d: `M${locX} ${PLAN.mid} L${sx(MAXNM)} ${PLAN.mid - half(MAXNM)} L${sx(MAXNM)} ${PLAN.mid + half(MAXNM)} Z` }));
  g.append(el('line', { x1: sx(MAXNM), y1: PLAN.mid, x2: locX, y2: PLAN.mid, class: 'cl' }));
  g.append(el('rect', { x: TX, y: PLAN.mid - 4, width: RWY_PX, height: 8, class: 'rwy' }));
  g.append(el('circle', { cx: locX, cy: PLAN.mid, r: 3, class: 'me' }));
  g.append(el('text', { x: locX - 4, y: PLAN.mid - 10, class: 'dark small', 'text-anchor': 'end' }, 'LOCALIZER'));
  g.append(el('text', { x: sx(5), y: PLAN.mid + half(5) + 14, class: 'dark small', 'text-anchor': 'middle' }, 'Localizer full scale: 2.5° each side'));
  // Profile view.
  g.append(el('rect', { x: 2, y: PROF.y, width: 440, height: PROF.h, class: 'view' }));
  g.append(el('text', { x: 10, y: PROF.y + 16, class: 'dark' }, 'PROFILE'));
  g.append(el('text', { x: 436, y: PROF.y + 16, class: 'dark small', 'text-anchor': 'end' }, 'Height scale stretched'));
  const gsX = TX + (ILS.gsAbeam / FT_PER_NM) * PX_NM;
  const hy = (h) => PROF.base - h * PROF.ftPx;
  const edge = (range, ang) => hy(Math.tan(ang * D) * (range * FT_PER_NM + ILS.gsAbeam));
  const far = 8.5;
  g.append(el('path', { class: 'beam gs', d: `M${gsX} ${PROF.base} L${sx(far)} ${edge(far, ILS.glideSlope + ILS.gsFullScale)} L${sx(far)} ${edge(far, ILS.glideSlope - ILS.gsFullScale)} Z` }));
  g.append(el('line', { x1: gsX, y1: PROF.base, x2: sx(far), y2: edge(far, ILS.glideSlope), class: 'cl' }));
  g.append(el('line', { x1: 2, y1: PROF.base, x2: 442, y2: PROF.base, class: 'cl' }));
  g.append(el('rect', { x: TX, y: PROF.base - 1, width: RWY_PX, height: 4, class: 'rwy' }));
  g.append(el('text', { x: sx(4.2), y: edge(4.2, ILS.glideSlope - ILS.gsFullScale) + 22, class: 'dark small' }, '3° glide slope, full scale 0.7° each side'));
  // DA line, an invented example.
  g.append(el('line', { x1: sx(1.2), y1: hy(ILS.daHeight), x2: TX + 20, y2: hy(ILS.daHeight), class: 'cl' }));
  g.append(el('text', { x: sx(1.2) - 4, y: hy(ILS.daHeight) + 4, class: 'dark small', 'text-anchor': 'end' }, 'DA 200 ft (example)'));
  for (const nm of [2, 4, 6, 8, 10]) {
    g.append(el('line', { x1: sx(nm), y1: PROF.base, x2: sx(nm), y2: PROF.base + 5, class: 'cl' }));
    g.append(el('text', { x: sx(nm), y: PROF.base + 16, class: 'dark small', 'text-anchor': 'middle' }, `${nm} NM`));
  }
  // Trail and aircraft.
  if (trail?.length > 1) {
    g.append(el('path', { class: 'track', d: trail.map((p, i) => `${i ? 'L' : 'M'}${sx(p.range).toFixed(1)} ${(PLAN.mid + p.right * PLAN.ftPx).toFixed(1)}`).join(' ') }));
    g.append(el('path', { class: 'track', d: trail.map((p, i) => `${i ? 'L' : 'M'}${sx(p.range).toFixed(1)} ${hy(p.height).toFixed(1)}`).join(' ') }));
  }
  g.append(el('circle', { cx: sx(pos.range), cy: PLAN.mid + pos.right * PLAN.ftPx, r: 6, class: 'me' }));
  g.append(el('circle', { cx: sx(pos.range), cy: hy(pos.height), r: 6, class: 'me' }));
  svg.append(g);
}

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
