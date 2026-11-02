// Pilot's-eye sight pictures for the formation module. A lead aircraft is a
// set of 3D panels and lights in its own body frame (metres: x forward, y
// right, z up, origin near the wing root). The wingman's eye is a point in
// that frame; looking at the lead from it gives the sight picture.
//
// The airframes are simplified outlines scaled to published overall
// dimensions; they are not survey drawings. Where a light sits is marked on
// each airframe with the source that places it.

const norm = ([x, y, z]) => { const l = Math.hypot(x, y, z) || 1; return [x / l, y / l, z / l]; };
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const D = Math.PI / 180;

// Mirror a list of [x, y, z] points to the left side.
const mirror = (pts) => pts.map(([x, y, z]) => [x, -y, z]);

/**
 * Build panels from a fuselage loft (stations of [x, halfWidth, top, bottom])
 * and flat or canted surfaces. Each panel is { pts, cls }.
 */
export function loft(stations, cls = 'fuse', sides = 8) {
  const ring = ([x, w, top, bot]) => Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * 2 * Math.PI;
    const mid = (top + bot) / 2, h = (top - bot) / 2;
    return [x, w * Math.sin(a), mid + h * Math.cos(a)];
  });
  const rings = stations.map(ring), panels = [];
  for (let s = 0; s < rings.length - 1; s++) {
    for (let i = 0; i < sides; i++) {
      const j = (i + 1) % sides;
      panels.push({ pts: [rings[s][i], rings[s][j], rings[s + 1][j], rings[s + 1][i]], cls });
    }
  }
  return panels;
}

// A surface given for the right side, plus its mirror on the left.
const pair = (pts, cls) => [{ pts, cls }, { pts: mirror(pts), cls }];

// Simplified airframes. Dimensions in the comments are the published
// overall figures the outlines are scaled to.
export const AIRFRAMES = {
  // F/A-18C Hornet: length 17.1 m, span 12.3 m (with wingtip missiles),
  // height 4.7 m.
  'fa-18c': {
    name: 'F/A-18C Hornet',
    eye: [4.6, 0, 1.15], // pilot's eye, used as the lead's reference point
    panels: [
      ...loft([[8.6, 0.05, 0.35, 0.25], [7, 0.4, 0.75, -0.35], [5.2, 0.55, 1.0, -0.55], [3, 0.95, 1.0, -0.75], [0, 1.35, 0.8, -0.85], [-3, 1.35, 0.7, -0.8], [-6, 1.05, 0.55, -0.6], [-8.4, 0.8, 0.45, -0.45]]),
      ...pair([[5.8, 0.5, 0.05], [1.2, 1.35, 0], [-0.4, 1.35, 0], [3.5, 0.9, 0.05]], 'wing'), // LEX
      ...pair([[1.2, 1.35, 0], [-1.7, 6.15, 0], [-2.9, 6.15, 0], [-3.6, 1.35, 0]], 'wing'),
      ...pair([[-5.6, 1.0, -0.1], [-7.7, 3.4, -0.15], [-8.6, 3.4, -0.15], [-8.3, 1.0, -0.1]], 'wing'),
      ...pair([[-4.2, 1.15, 0.6], [-6.9, 2.15, 3.3], [-8.0, 2.15, 3.3], [-7.6, 1.15, 0.6]], 'fin'), // canted out
      ...loft([[6.3, 0.05, 0.95, 0.9], [5.2, 0.42, 1.45, 0.75], [3.6, 0.45, 1.5, 0.8], [2.4, 0.05, 1.05, 1.0]], 'canopy', 6),
    ],
    lights: [],
  },
  // T-45C Goshawk: length 12.0 m, span 9.4 m, height 4.1 m.
  't-45c': {
    name: 'T-45C Goshawk',
    eye: [3.0, 0, 1.25],
    panels: [
      ...loft([[6.0, 0.05, 0.2, 0.1], [4.6, 0.35, 0.7, -0.4], [3, 0.55, 0.9, -0.6], [1.2, 0.8, 0.85, -0.7], [-1.5, 0.75, 0.7, -0.65], [-4, 0.5, 0.55, -0.4], [-6.0, 0.3, 0.4, -0.15]]),
      ...pair([[1.6, 0.75, -0.3], [-0.9, 4.7, -0.1], [-1.9, 4.7, -0.1], [-2.3, 0.75, -0.3]], 'wing'),
      ...pair([[-4.0, 0.45, 0.3], [-5.2, 2.2, 0.35], [-5.9, 2.2, 0.35], [-5.7, 0.35, 0.3]], 'wing'),
      { pts: [[-2.8, 0, 0.6], [-5.0, 0, 3.0], [-5.9, 0, 3.0], [-5.9, 0, 0.4]], cls: 'fin' },
      ...loft([[4.6, 0.05, 0.8, 0.75], [3.6, 0.4, 1.45, 0.65], [1.6, 0.45, 1.55, 0.7], [0.4, 0.05, 1.0, 0.95]], 'canopy', 6),
    ],
    lights: [],
  },
};

/**
 * Camera at `eye` looking at `target` (both in the lead's frame), with the
 * wingman's horizon level. Returns a projector to screen pixels around (0, 0)
 * for a focal length `f`, and the depth of a point along the view.
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
 * The sight picture: panels as 2D polygons, farthest first, and lights as
 * points. `eye` is the wingman's eye in the lead's frame.
 */
export function sightPicture(airframe, eye, { f = 260 } = {}) {
  const cam = camera(eye, airframe.center ?? [0, 0, 0], f);
  const panels = [];
  for (const p of airframe.panels) {
    const pts = p.pts.map(cam.project);
    if (pts.some((q) => !q)) continue;
    const depth = p.pts.reduce((s, q) => s + cam.depth(q), 0) / p.pts.length;
    panels.push({ pts, cls: p.cls, depth });
  }
  panels.sort((a, b) => b.depth - a.depth);
  const lights = airframe.lights.map((l) => ({ ...l, at: cam.project(l.at), depth: cam.depth(l.at) })).filter((l) => l.at);
  return { panels, lights };
}

/**
 * A formation position on the right side of the lead, from a bearing line
 * through the lead's reference point (degrees aft of the lead's wingline),
 * a distance along that line, and a stepdown (metres below the lead's eye).
 * Returns the wingman's eye in the lead's frame.
 */
export function onBearing({ bearing, distance, stepdown }, airframe) {
  const [x0, , z0] = airframe.eye;
  return [x0 - distance * Math.sin(bearing * D), distance * Math.cos(bearing * D), z0 - stepdown];
}

/**
 * Where an eye sits relative to a reference position: along the bearing line
 * (close or wide), across it (acute: ahead of the line; sucked: behind it)
 * and vertically (high or low). Distances in metres; `tol` is the tolerance
 * for "on" in each axis.
 */
export function offsets(eye, ref, airframe, tol = 0.4) {
  const [x0, , z0] = airframe.eye;
  const b = ref.bearing * D;
  const along = [-Math.sin(b), Math.cos(b)], ahead = [Math.cos(b), Math.sin(b)];
  const rel = [eye[0] - x0, eye[1]];
  const s = rel[0] * along[0] + rel[1] * along[1];
  const a = rel[0] * ahead[0] + rel[1] * ahead[1];
  const v = (z0 - eye[2]) - ref.stepdown;
  const word = (val, pos, neg) => (Math.abs(val) <= tol ? null : val > 0 ? pos : neg);
  return {
    spacing: s - ref.distance, acute: a, low: v,
    words: [word(a, 'acute', 'sucked'), word(s - ref.distance, 'wide', 'close'), word(v, 'low', 'high')].filter(Boolean),
  };
}

// Reference positions on the right side. PLACEHOLDER geometry until the
// formation FTIs are read: bearing (° aft of the wingline), distance along
// the bearing line from the lead's reference point (m), stepdown (m).
export const POSITIONS = [
  { id: 'parade', name: 'Parade', bearing: 30, distance: 15, stepdown: 1.5 },
];
