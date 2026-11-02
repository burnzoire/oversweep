// Figure: the parade sight picture. The lead T-6B as the wingman sees it,
// with the three VT-6 checkpoint pairs marked, a top view and a view from
// behind. Buttons move the wingman; the readout names the error the way the
// checkpoints show it. Geometry comes from sight-model.mjs.
import { AIRFRAMES, checkpointErrors, offsets, sightPicture, solveReference } from './sight-model.mjs';
import { el } from '../shared/hsi.mjs';

const STEP = 0.5; // metres per press
const W = 700, H = 420, VW = 450, SX = 460, SW = 240, SH = 205;
const LINED_UP = 1.5; // degrees: what the figure counts as "on" for a checkpoint
const fmt = (v) => v.map((n) => n.toFixed(1)).join(',');

function pilotsEye(svg, frame, eye, show) {
  const g = el('g', { transform: `translate(${VW / 2} ${H / 2})` });
  svg.append(el('rect', { x: 0, y: 0, width: VW, height: H, class: 'sky' }), g);
  const { panels, features } = sightPicture(frame, eye);
  for (const p of panels) g.append(el('polygon', { points: p.pts.map(fmt).join(' '), class: `panel ${p.cls}` }));
  if (show) {
    const errs = checkpointErrors(frame, eye);
    const byId = Object.fromEntries(features.map((f) => [f.id, f]));
    for (const c of frame.checkpoints) {
      const ok = errs[c.id] <= LINED_UP;
      for (const id of [c.a, c.b].filter(Boolean)) {
        const f = byId[id];
        if (!f?.at) continue;
        if (f.from) g.append(el('line', { x1: f.from[0], y1: f.from[1], x2: f.at[0], y2: f.at[1], class: `feature ${ok ? 'ok' : 'off'}` }));
        g.append(el('circle', { cx: f.at[0], cy: f.at[1], r: 5, class: `feature ${ok ? 'ok' : 'off'}` }));
        g.append(el('text', { x: f.at[0] + f.dx, y: f.at[1] + f.dy, class: 'tag', 'text-anchor': f.anchor ?? 'start' }, `${c.word[0]}: ${f.label}`));
      }
    }
  }
  svg.append(el('text', { x: 10, y: 18, class: 'dark' }, "WINGMAN'S VIEW"));
}

// Plan (y right, x up) or rear (y right, z up) view, lead at the centre.
function side(svg, y0, title, frame, eye, ref, h, v) {
  const k = 9, cx = SX + 70, cy = y0 + SH / 2 + 10;
  svg.append(el('rect', { x: SX, y: y0, width: SW, height: SH, class: 'view' }));
  svg.append(el('text', { x: SX + 8, y: y0 + 16, class: 'dark small' }, title));
  const P = (p) => [cx + h(p) * k, cy - v(p) * k];
  for (const p of frame.panels.filter((q) => q.cls !== 'prop')) svg.append(el('polygon', { points: p.pts.map((q) => fmt(P(q))).join(' '), class: `flat ${p.cls}` }));
  const [ax, ay] = P(frame.center), [rx, ry] = P(ref), [ex, ey] = P(eye);
  if (title === 'TOP VIEW') svg.append(el('line', { x1: ax, y1: ay, x2: ax + (rx - ax) * 1.5, y2: ay + (ry - ay) * 1.5, class: 'bearing' }));
  svg.append(el('circle', { cx: rx, cy: ry, r: 6, class: 'ref' }), el('circle', { cx: ex, cy: ey, r: 4, class: 'me' }));
}

function init(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), marks = root.querySelector('[name="marks"]');
  const frame = AIRFRAMES['t-6b'], ref = solveReference(frame);
  let eye = ref.slice();
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  const render = () => {
    svg.replaceChildren();
    pilotsEye(svg, frame, eye, marks.checked);
    side(svg, 0, 'TOP VIEW', frame, eye, ref, (p) => p[1], (p) => p[0]);
    side(svg, H - SH, 'FROM BEHIND', frame, eye, ref, (p) => p[1], (p) => p[2]);
    const errs = checkpointErrors(frame, eye), o = offsets(eye, ref, frame);
    const off = frame.checkpoints.filter((c) => errs[c.id] > LINED_UP).map((c) => c.word);
    out.textContent = o.words.length
      ? `Out of position: ${o.words.join(', ')}. Checkpoints not lined up: ${off.join(', ') || 'none'}.`
      : 'In parade: all three checkpoints lined up.';
  };
  const nudge = { forward: [STEP, 0, 0], aft: [-STEP, 0, 0], in: [0, -STEP, 0], out: [0, STEP, 0], up: [0, 0, STEP / 2], down: [0, 0, -STEP / 2] };
  for (const b of root.querySelectorAll('[data-nudge]')) b.addEventListener('click', () => {
    eye = eye.map((v, i) => v + nudge[b.dataset.nudge][i]);
    render();
  });
  root.querySelector('[data-reset]').addEventListener('click', () => { eye = ref.slice(); render(); });
  marks.addEventListener('change', render);
  render();
}

for (const root of document.querySelectorAll('[data-lesson="sight"]')) {
  init(root);
  root.classList.add('ready');
}
