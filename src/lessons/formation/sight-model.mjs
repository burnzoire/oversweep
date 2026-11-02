// Pilot's-eye sight pictures for the formation module. A lead aircraft is a
// set of 3D panels, marked features and lights in its own body frame
// (metres: x forward, y right, z up, origin at the wing root). The wingman's
// eye is a point in that frame; looking at the lead from it gives the sight
// picture.
//
// The airframes are simplified outlines scaled to published overall
// dimensions, not survey drawings, so feature positions are approximate.
// Where the parade checkpoints come from a source, the reference eye is
// solved from them: the point where every checkpoint pair lines up as
// closely as the outline allows.

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((c) => c / l); };
const D = Math.PI / 180;
const mirror = (pts) => pts.map(([x, y, z]) => [x, -y, z]);
const pair = (pts, cls) => [{ pts, cls }, { pts: mirror(pts), cls }];
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

/** Panels lofted through fuselage stations of [x, halfWidth, top, bottom]. */
export function loft(stations, cls = 'fuse', sides = 8) {
  const ring = ([x, w, top, bot]) => Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * 2 * Math.PI;
    return [x, w * Math.sin(a), (top + bot) / 2 + ((top - bot) / 2) * Math.cos(a)];
  });
  const rings = stations.map(ring), panels = [];
  for (let s = 0; s < rings.length - 1; s++) for (let i = 0; i < sides; i++) {
    const j = (i + 1) % sides;
    panels.push({ pts: [rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i]], cls });
  }
  return panels;
}

// A disc in the y–z plane (a propeller arc), as a closed polyline.
const disc = (c, r, n = 32) => Array.from({ length: n }, (_, i) => [c[0], c[1] + r * Math.cos((i / n) * 2 * Math.PI), c[2] + r * Math.sin((i / n) * 2 * Math.PI)]);

// T-6B Texan II: length 10.2 m, span 10.2 m. Features for the VT-6 parade
// checkpoints (Formation Supplement, p. 8). Their positions on the outline
// are estimates from general-arrangement photographs, not from a drawing.
const T6_RW = { le: [[0.6, 0.55, -0.45], [-0.35, 5.09, 0]], te: [[-1.75, 0.55, -0.45], [-1.15, 5.09, 0]] };
const T6_CUTOUT = lerp(T6_RW.te[0], T6_RW.te[1], (3.0 - 0.55) / 4.54);
const T6 = {
  name: 'T-6B Texan II',
  center: [0.5, 0, 0],
  panels: [
    ...loft([[4.6, 0.05, 0.3, 0.2], [4.3, 0.4, 0.55, -0.1], [3.6, 0.5, 0.75, -0.35], [2.4, 0.55, 0.8, -0.45], [0.5, 0.55, 0.75, -0.5], [-2, 0.45, 0.6, -0.4], [-4.5, 0.25, 0.4, -0.1], [-5.55, 0.1, 0.35, 0.15]]),
    ...loft([[1.9, 0.05, 0.85, 0.8], [1.3, 0.4, 1.3, 0.7], [-0.8, 0.42, 1.35, 0.7], [-2.0, 0.05, 0.75, 0.7]], 'canopy', 6),
    ...pair([T6_RW.le[0], T6_RW.le[1], T6_RW.te[1], T6_RW.te[0]], 'wing'),
    ...pair([[-4.0, 0.25, 0.25], [-4.6, 2.3, 0.25], [-5.3, 2.3, 0.25], [-5.4, 0.2, 0.25]], 'wing'),
    { pts: [[-3.6, 0, 0.45], [-5.0, 0, 2.3], [-5.6, 0, 2.3], [-5.55, 0, 0.35]], cls: 'fin' },
    { pts: disc([4.5, 0, 0.25], 1.2), cls: 'prop' },
  ],
  features: {
    stack: { at: [3.35, 0.56, 0.12], label: 'Stack', dx: -12, dy: 16, anchor: 'end' },
    antenna: { at: [-2.4, 0, -0.78], from: [-2.4, 0, -0.5], label: 'UHF antenna', dx: 8, dy: 16 },
    cutout: { at: [T6_CUTOUT[0], -T6_CUTOUT[1], T6_CUTOUT[2]], label: 'Aileron cutout', dx: 8, dy: -8 },
    pitot: { at: [0.35, 4.3, -0.08], from: [-0.2, 4.3, -0.08], label: 'Pitot', dx: 8, dy: -10 },
  },
  // Each checkpoint: a feature that should sit on another feature, on a
  // line (the near wing's leading edge) or on the edge of the prop arc.
  checkpoints: [
    { id: 'altitude', word: 'Altitude', text: "Step-down: lead's inboard exhaust stack fully visible and tangent to the bottom leading edge of the wing", a: 'stack', line: T6_RW.le },
    // "Over": the antenna directly above or below the cutout in the view,
    // so only the sideways offset counts.
    { id: 'bearing', word: 'Bearing', text: 'Bearing line: lower UHF antenna over the inboard aileron cutout on the opposite wing', a: 'antenna', b: 'cutout', over: true },
    { id: 'closure', word: 'Closure', text: "Separation: on the bearing line, with the edge of lead's prop arc on the pitot tube", a: 'pitot', ring: disc([4.5, 0, 0.25], 1.2, 72) },
  ],
  lights: [],
};

// F/A-18C Hornet: length 17.1 m, span 12.3 m. Lights placed as the DCS
// F/A-18C guide describes them (Exterior Lighting Panel, p. 61): formation
// lights two per wingtip (drawn as one strip each), on the outboard side of
// each fin, on the aft fuselage below the fins and on the forward fuselage
// just ahead of the LEX; red strobes on the outboard fins; the white
// position light just below the tip of the right fin. The guide gives three
// red and three green position lights per side without placing them; only
// the wingtip ones are drawn.
const HORNET = {
  name: 'F/A-18C Hornet',
  center: [0, 0, 0],
  panels: [
    ...loft([[8.6, 0.05, 0.35, 0.25], [7, 0.4, 0.75, -0.35], [5.2, 0.55, 1.0, -0.55], [3, 0.95, 1.0, -0.75], [0, 1.35, 0.8, -0.85], [-3, 1.35, 0.7, -0.8], [-6, 1.05, 0.55, -0.6], [-8.4, 0.8, 0.45, -0.45]]),
    ...pair([[5.8, 0.5, 0.05], [1.2, 1.35, 0], [-0.4, 1.35, 0], [3.5, 0.9, 0.05]], 'wing'),
    ...pair([[1.2, 1.35, 0], [-1.7, 6.15, 0], [-2.9, 6.15, 0], [-3.6, 1.35, 0]], 'wing'),
    ...pair([[-5.6, 1.0, -0.1], [-7.7, 3.4, -0.15], [-8.6, 3.4, -0.15], [-8.3, 1.0, -0.1]], 'wing'),
    ...pair([[-4.2, 1.15, 0.6], [-6.9, 2.15, 3.3], [-8.0, 2.15, 3.3], [-7.6, 1.15, 0.6]], 'fin'),
    ...loft([[6.3, 0.05, 0.95, 0.9], [5.2, 0.42, 1.45, 0.75], [3.6, 0.45, 1.5, 0.8], [2.4, 0.05, 1.05, 1.0]], 'canopy', 6),
  ],
  features: {},
  checkpoints: [],
  lights: [
    { type: 'formation', strip: [[-1.75, 6.1, 0.02], [-2.6, 6.1, 0.02]] },
    { type: 'formation', strip: [[-1.75, -6.1, 0.02], [-2.6, -6.1, 0.02]] },
    { type: 'formation', strip: [[-5.6, 1.75, 1.6], [-6.4, 1.95, 2.6]] },
    { type: 'formation', strip: [[-5.6, -1.75, 1.6], [-6.4, -1.95, 2.6]] },
    { type: 'formation', strip: [[-6.6, 1.0, 0.1], [-7.4, 0.95, 0.1]] },
    { type: 'formation', strip: [[-6.6, -1.0, 0.1], [-7.4, -0.95, 0.1]] },
    { type: 'formation', strip: [[6.2, 0.5, 0.0], [5.4, 0.62, 0.0]] },
    { type: 'formation', strip: [[6.2, -0.5, 0.0], [5.4, -0.62, 0.0]] },
    { type: 'strobe', at: [-7.2, 2.0, 2.9] },
    { type: 'strobe', at: [-7.2, -2.0, 2.9] },
    { type: 'position-green', at: [-1.9, 6.2, 0] },
    { type: 'position-red', at: [-1.9, -6.2, 0] },
    { type: 'position-white', at: [-7.9, 2.1, 3.1] },
  ],
};

export const AIRFRAMES = { 't-6b': T6, 'fa-18c': HORNET };

/**
 * Camera at `eye` looking at `target` (both in the lead's frame), with the
 * wingman's horizon level. Projects to pixels around (0, 0) for focal
 * length `f`.
 */
export function camera(eye, target, f) {
  const fwd = norm(sub(target, eye));
  // The frame (x forward, y right, z up) is left-handed, so right = up × fwd.
  const right = norm(cross([0, 0, 1], fwd));
  const up = cross(fwd, right);
  return {
    depth: (p) => dot(sub(p, eye), fwd),
    project: (p) => {
      const d = sub(p, eye), z = dot(d, fwd);
      if (z <= 0.05) return null;
      return [(f * dot(d, right)) / z, (-f * dot(d, up)) / z];
    },
  };
}

/**
 * The sight picture: panels as 2D polygons, farthest first, plus features
 * and lights. `eye` is the wingman's eye in the lead's frame.
 */
export function sightPicture(frame, eye, { f = 430 } = {}) {
  const cam = camera(eye, frame.center, f);
  const panels = [];
  for (const p of frame.panels) {
    const pts = p.pts.map(cam.project);
    if (pts.some((q) => !q)) continue;
    panels.push({ pts, cls: p.cls, depth: p.pts.reduce((s, q) => s + cam.depth(q), 0) / p.pts.length });
  }
  panels.sort((a, b) => b.depth - a.depth);
  const features = Object.entries(frame.features).map(([id, ft]) => ({ id, ...ft, at: cam.project(ft.at), from: ft.from && cam.project(ft.from) }));
  // Lights on the far side of the fuselage and fins are hidden from the
  // wingman; only the far wingtip, out beyond the fuselage, can show.
  const hidden = (p) => Math.sign(p[1]) !== Math.sign(eye[1]) && Math.abs(p[1]) < 3.5;
  const lights = frame.lights.filter((l) => !hidden(l.at ?? l.strip[0]))
    .map((l) => ({ ...l, at: l.at && cam.project(l.at), strip: l.strip?.map(cam.project) }))
    .filter((l) => (l.at ?? l.strip.every(Boolean)) && (!l.strip || l.strip.every(Boolean)));
  return { panels, features, lights };
}

// Distance from point p to segment ab in 2D.
function toSegment(p, a, b) {
  const ab = [b[0] - a[0], b[1] - a[1]], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1)));
  return Math.hypot(p[0] - a[0] - t * ab[0], p[1] - a[1] - t * ab[1]);
}

/**
 * How far each checkpoint is from lining up, as an angle in degrees seen
 * from `eye` (f = 1 radian per unit, so screen distance ≈ angle).
 */
export function checkpointErrors(frame, eye) {
  const cam = camera(eye, frame.center, 1);
  const P = (id) => cam.project(frame.features[id].at);
  return Object.fromEntries(frame.checkpoints.map((c) => {
    // A point behind the eye cannot be seen, so the pair cannot line up.
    const a = P(c.a), b = c.b && P(c.b);
    const line = c.line?.map(cam.project), ring = c.ring?.map(cam.project);
    if (!a || (c.b && !b) || line?.some((q) => !q) || ring?.some((q) => !q)) return [c.id, Infinity];
    let e;
    if (b) e = c.over ? Math.abs(a[0] - b[0]) : Math.hypot(a[0] - b[0], a[1] - b[1]);
    else if (line) e = toSegment(a, line[0], line[1]);
    else e = Math.min(...ring.map((q, i) => toSegment(a, q, ring[(i + 1) % ring.length])));
    return [c.id, e / D];
  }));
}

/**
 * The reference eye: the point (right side of the lead) where the
 * checkpoints line up best, found by a coordinate search from `start`.
 */
export function solveReference(frame, start = [-3, 11, -1.5]) {
  // Angles shrink as the eye moves away, so weight each by the range:
  // the error becomes a size at the lead (metres), not an angle.
  const cost = (e) => {
    const r = Math.hypot(...sub(e, frame.center));
    return Object.values(checkpointErrors(frame, e)).reduce((s, v) => s + (v * D * r) ** 2, 0);
  };
  let eye = start.slice(), best = cost(eye), guard = 5000;
  for (let step = 2; step > 0.005; step /= 2) {
    let improved = true;
    while (improved && guard-- > 0) {
      improved = false;
      for (let i = 0; i < 3; i++) for (const s of [step, -step]) {
        const t = eye.slice(); t[i] += s;
        const c = cost(t);
        if (c < best) { best = c; eye = t; improved = true; }
      }
    }
  }
  return eye;
}

/**
 * Where an eye sits relative to the reference eye: acute (ahead of the
 * bearing line through the lead's centre) or sucked, wide or close along
 * it, high or low. Metres; `tol` is the tolerance for "on" in each axis.
 */
export function offsets(eye, ref, frame, tol = 0.3) {
  const c = frame.center;
  const b = Math.atan2(-(ref[0] - c[0]), ref[1] - c[1]); // bearing aft of the wingline
  const along = [-Math.sin(b), Math.cos(b)], ahead = [Math.cos(b), Math.sin(b)];
  const rel = [eye[0] - ref[0], eye[1] - ref[1]];
  const s = rel[0] * along[0] + rel[1] * along[1];
  const a = rel[0] * ahead[0] + rel[1] * ahead[1];
  const v = ref[2] - eye[2];
  const word = (val, pos, neg) => (Math.abs(val) <= tol ? null : val > 0 ? pos : neg);
  return { bearing: b / D, wide: s, acute: a, low: v, words: [word(v, 'low', 'high'), word(a, 'acute', 'sucked'), word(s, 'wide', 'close')].filter(Boolean) };
}
