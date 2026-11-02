// Sight picture figure: the lead as the wingman sees it, beside a top view
// and a view from behind, with buttons that move the wingman's aircraft.
// Geometry comes from sight-model.mjs; positions from POSITIONS.
import { AIRFRAMES, POSITIONS, offsets, onBearing, sightPicture } from './sight-model.mjs';
import { el } from '../shared/hsi.mjs';

const STEP = 0.6; // metres per button press
const W = 700, H = 420, VIEW = { w: 450, h: 420 }, SIDE = { x: 460, w: 240, h: 205 };

function pilotsEye(svg, frame, eye) {
  const g = el('g', { transform: `translate(${VIEW.w / 2} ${VIEW.h / 2})` });
  svg.append(el('rect', { x: 0, y: 0, width: VIEW.w, height: VIEW.h, class: 'sky' }), g);
  const { panels, lights } = sightPicture(frame, eye);
  for (const p of panels) g.append(el('polygon', { points: p.pts.map((q) => q.map((v) => v.toFixed(1)).join(',')).join(' '), class: `panel ${p.cls}` }));
  for (const l of lights) g.append(el('circle', { cx: l.at[0], cy: l.at[1], r: 3, class: `light ${l.cls}` }));
  svg.append(el('text', { x: 10, y: 18, class: 'dark' }, "WINGMAN'S VIEW"));
}

// Top view (y right, x up) and rear view (y right, z up), lead at the origin.
function side(svg, y0, title, frame, eye, ref, horiz, vert) {
  const k = 4.5, cx = SIDE.x + 70, cy = y0 + SIDE.h / 2 + (title === 'TOP VIEW' ? 20 : 0);
  svg.append(el('rect', { x: SIDE.x, y: y0, width: SIDE.w, height: SIDE.h, class: 'view' }));
  svg.append(el('text', { x: SIDE.x + 8, y: y0 + 16, class: 'dark small' }, title));
  const P = (p) => [cx + horiz(p) * k, cy - vert(p) * k];
  const g = el('g');
  for (const p of frame.panels.filter((q) => q.cls !== 'fuse' || title === 'TOP VIEW')) {
    g.append(el('polygon', { points: p.pts.map((q) => P(q).map((v) => v.toFixed(1)).join(',')).join(' '), class: `flat ${p.cls}` }));
  }
  svg.append(g);
  if (ref) {
    const r = onBearing(ref, frame), [ax, ay] = P(frame.eye), [bx, by] = P(r);
    if (title === 'TOP VIEW') svg.append(el('line', { x1: ax, y1: ay, x2: ax + (bx - ax) * 1.4, y2: ay + (by - ay) * 1.4, class: 'bearing' }));
    svg.append(el('circle', { cx: bx, cy: by, r: 5, class: 'ref' }));
  }
  const [ex, ey] = P(eye);
  svg.append(el('circle', { cx: ex, cy: ey, r: 4, class: 'me' }));
}

function init(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  let frame = AIRFRAMES[root.dataset.airframe ?? Object.keys(AIRFRAMES)[0]];
  let ref = POSITIONS[0], eye = onBearing(ref, frame);
  const render = () => {
    svg.replaceChildren();
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    pilotsEye(svg, frame, eye);
    side(svg, 0, 'TOP VIEW', frame, eye, ref, (p) => p[1], (p) => p[0]);
    side(svg, 215, 'FROM BEHIND', frame, eye, ref, (p) => p[1], (p) => p[2]);
    const o = offsets(eye, ref, frame);
    out.textContent = o.words.length ? `${ref.name}: you are ${o.words.join(', ')}.` : `${ref.name}: in position.`;
  };
  const nudge = { forward: [STEP, 0, 0], aft: [-STEP, 0, 0], in: [0, -STEP, 0], out: [0, STEP, 0], up: [0, 0, STEP], down: [0, 0, -STEP] };
  for (const b of root.querySelectorAll('[data-nudge]')) b.addEventListener('click', () => {
    const d = nudge[b.dataset.nudge];
    eye = eye.map((v, i) => v + d[i]);
    render();
  });
  const picks = root.querySelector('[data-positions]');
  for (const p of POSITIONS) {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.textContent = p.name;
    btn.addEventListener('click', () => { ref = p; eye = onBearing(p, frame); render(); });
    picks.append(btn);
  }
  for (const b of root.querySelectorAll('[data-airframe-pick]')) b.addEventListener('click', () => {
    frame = AIRFRAMES[b.dataset.airframePick]; eye = onBearing(ref, frame); render();
  });
  root.querySelector('[data-reset]')?.addEventListener('click', () => { eye = onBearing(ref, frame); render(); });
  render();
}

for (const root of document.querySelectorAll('[data-lesson="sight"]')) {
  init(root);
  root.classList.add('ready');
}
