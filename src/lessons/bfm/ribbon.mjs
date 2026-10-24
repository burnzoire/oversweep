// Wide ribbon-arrow drawings of 3D flight paths, projected to fixed views.
// Pure geometry: returns shapes in screen units for lesson-ui.mjs to draw.
//
// Each aircraft's path is a band as wide as a wingspan drawn to scale with the
// figure, lying in the aircraft's wing plane, so it twists as the aircraft
// rolls. Where the viewer sees the canopy side of the band it is drawn light;
// where the viewer sees the underside it is drawn dark. The band ends in an
// arrowhead, and numbered cross-bars mark equal times on every aircraft.
import { cross, dot, len, liftAxis, unit } from './maneuvers.mjs';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

// Fixed views. `look` is the direction the viewer faces; `up` is the world
// direction that appears up the page. `perspective` is the viewing distance as
// a multiple of the scene's size (0 for an orthographic view).
export const VIEWS = {
  perspective: (yaw = 35, elevation = 25) => {
    const y = yaw * Math.PI / 180, e = elevation * Math.PI / 180;
    // Looking from behind-right and above, toward heading `yaw`.
    return { id: 'perspective', label: 'PERSPECTIVE', look: [Math.sin(y) * Math.cos(e), Math.cos(y) * Math.cos(e), -Math.sin(e)], up: [0, 0, 1], perspective: 2.6 };
  },
  top: () => ({ id: 'top', label: 'TOP (PLAN) VIEW', look: [0, 0, -1], up: [0, 1, 0], perspective: 0 }),
  // Side view looking east: north to the left of the page.
  sideEast: () => ({ id: 'side', label: 'SIDE VIEW (LOOKING EAST)', look: [1, 0, 0], up: [0, 0, 1], perspective: 0 }),
  // Side view looking west: north to the right.
  sideWest: () => ({ id: 'side', label: 'SIDE VIEW (LOOKING WEST)', look: [-1, 0, 0], up: [0, 0, 1], perspective: 0 }),
  // From behind, looking north along the direction of travel.
  rear: () => ({ id: 'rear', label: 'FROM BEHIND (LOOKING DOWNRANGE)', look: [0, 1, 0], up: [0, 0, 1], perspective: 0 }),
};

// Drop labels that would sit on top of one already placed (names first).
function declutter(marks, gap = 13) {
  const kept = [];
  for (const m of [...marks].sort((a, b) => b.first - a.first || a.t - b.t)) {
    if (kept.every((k) => Math.hypot(k.pt[0] - m.pt[0], k.pt[1] - m.pt[1]) >= gap)) kept.push(m);
  }
  return kept;
}

function basis(view) {
  const c = unit(view.look);
  const r = unit(cross(c, view.up));
  return { c, r, u: cross(r, c) };
}

// Nice round grid spacing for a span in feet.
export function gridStep(span) {
  for (const s of [500, 1000, 2000, 5000, 10000]) if (span / s <= 8) return s;
  return 20000;
}

// aircraft: [{ id, label, track, ghost? }] from maneuvers.mjs.
// box: [x, y, w, h] in screen units. Options: step (s between bands), every
// (s between numbered marks), width (ribbon width as a fraction of the scene).
export function render(aircraft, view, box, { step = 0.25, every = 2, width = 0.045 } = {}) {
  const solid = aircraft.filter((a) => !a.ghost);
  const all = aircraft.flatMap((a) => a.track.map((s) => s.p));
  const lo = [0, 1, 2].map((k) => Math.min(...all.map((p) => p[k])));
  const hi = [0, 1, 2].map((k) => Math.max(...all.map((p) => p[k])));
  const centre = mul(add(lo, hi), 0.5);
  const size = Math.max(1, len(sub(hi, lo)));
  const W = size * width;
  const { c, r, u } = basis(view);
  const dist = view.perspective * size;
  const eye = sub(centre, mul(c, dist));
  const raw = (p) => {
    if (!dist) { const q = sub(p, centre); return [dot(q, r), dot(q, u), dot(q, c)]; }
    const q = sub(p, eye), z = dot(q, c);
    return [dot(q, r) * dist / z, dot(q, u) * dist / z, z];
  };
  const toViewer = (p) => (dist ? unit(sub(eye, p)) : mul(c, -1));

  // Bands, arrowheads and marks for each aircraft, in world coordinates.
  const items = [];
  const marks = [];
  const groundZ = lo[2] - size * 0.08;
  const ground = view.id === 'perspective' ? [] : null;
  for (const a of solid) {
    const dt = a.track[1].t - a.track[0].t;
    const k = Math.max(1, Math.round(step / dt));
    const pts = a.track.filter((_, i) => i % k === 0 || i === a.track.length - 1);
    const frames = pts.map((s) => {
      const f = unit(s.v), up = liftAxis(s), w = unit(cross(f, up));
      return { t: s.t, p: s.p, f, up, L: sub(s.p, mul(w, W / 2)), R: add(s.p, mul(w, W / 2)), w };
    });
    for (let i = 0; i < frames.length - 1; i++) {
      const A = frames[i], B = frames[i + 1];
      const mid = mul(add(A.p, B.p), 0.5);
      const up = unit(add(A.up, B.up));
      const tick = Math.abs(A.t / every - Math.round(A.t / every)) < 1e-6 && A.t > 0;
      items.push({ id: a.id, kind: 'band', world: [A.L, B.L, B.R, A.R], face: dot(up, toViewer(mid)) >= 0 ? 'top' : 'under', mid, tick, edges: true });
      // Times beside the band; the aircraft's name just behind its start.
      if (tick || i === 0) marks.push({ id: a.id, t: A.t, at: i ? add(A.p, mul(A.w, -W * 1.15)) : sub(A.p, mul(A.f, W * 2.2)), first: i === 0, label: a.label, p: A.p });
    }
    // Arrowhead: wider than the band, in the wing plane of the last sample.
    const E = frames.at(-1);
    const tip = add(E.p, mul(E.f, W * 1.6));
    const hl = sub(E.p, mul(E.w, W * 0.95)), hr = add(E.p, mul(E.w, W * 0.95));
    items.push({ id: a.id, kind: 'head', world: [hl, tip, hr], face: dot(E.up, toViewer(E.p)) >= 0 ? 'top' : 'under', mid: E.p, edges: true });
    if (ground) for (const m of marks.filter((m) => m.id === a.id)) ground.push({ kind: 'drop', world: [m.p, [m.p[0], m.p[1], groundZ]] });
  }

  // Ground grid for the perspective view; a start-altitude line for side views.
  const refs = [];
  if (ground) {
    const g = gridStep(Math.max(hi[0] - lo[0], hi[1] - lo[1]));
    const x0 = Math.floor(lo[0] / g) * g, x1 = Math.ceil(hi[0] / g) * g;
    const y0 = Math.floor(lo[1] / g) * g, y1 = Math.ceil(hi[1] / g) * g;
    for (let x = x0; x <= x1 + 1e-6; x += g) refs.push({ kind: 'grid', world: [[x, y0, groundZ], [x, y1, groundZ]] });
    for (let y = y0; y <= y1 + 1e-6; y += g) refs.push({ kind: 'grid', world: [[x0, y, groundZ], [x1, y, groundZ]] });
    refs.push(...ground);
    refs.grid = g;
  } else if (Math.abs(c[2]) < 0.5) {
    const z0 = solid[0].track[0].p[2];
    const span = 0.5 * size * 1.2;
    refs.push({ kind: 'datum', world: [sub([centre[0], centre[1], z0], mul(r, span)), add([centre[0], centre[1], z0], mul(r, span))] });
  }
  const ghosts = aircraft.filter((a) => a.ghost).map((a) => ({ id: a.id, kind: 'ghost', world: a.track.filter((_, i) => i % 5 === 0).map((s) => s.p) }));

  // Fit everything into the box, y up the page.
  const shapes = [...items, ...refs, ...ghosts];
  const flat = shapes.flatMap((s) => s.world.map(raw)).concat(marks.map((m) => raw(m.at)));
  const xs = flat.map((p) => p[0]), ys = flat.map((p) => p[1]);
  const [bx, by, bw, bh] = box;
  const pad = 18;
  const scale = Math.min((bw - 2 * pad) / Math.max(1e-6, Math.max(...xs) - Math.min(...xs)), (bh - 2 * pad) / Math.max(1e-6, Math.max(...ys) - Math.min(...ys)));
  const ox = bx + bw / 2 - scale * (Math.max(...xs) + Math.min(...xs)) / 2;
  const oy = by + bh / 2 + scale * (Math.max(...ys) + Math.min(...ys)) / 2;
  const screen = (p) => { const q = raw(p); return [ox + q[0] * scale, oy - q[1] * scale, q[2]]; };

  // Painter's order: farthest first.
  const drawn = items.map((s) => ({ ...s, pts: s.world.map(screen), depth: raw(s.mid)[2] })).sort((a, b) => b.depth - a.depth);
  return {
    view, scale,
    refs: refs.map((s) => ({ ...s, pts: s.world.map(screen) })),
    grid: refs.grid ?? null,
    ghosts: ghosts.map((s) => ({ ...s, pts: s.world.map(screen) })),
    shapes: drawn,
    marks: declutter(marks.map((m) => ({ ...m, pt: screen(m.at) }))),
    // Feet per screen unit for an orthographic scale bar (null in perspective).
    feetPerUnit: dist ? null : 1 / scale,
  };
}
