// The view through the windscreen on the instrument trainer's final
// approach: cloud until the aircraft breaks out at the DA, then the
// approach lights and the runway in perspective from the aircraft's
// position and attitude. A generic approach light system (centreline bars
// to 2,400 ft with a crossbar at 1,000 ft), green threshold lights and white
// edge lights: an illustration, not any one installation's pattern.
import { el } from '../shared/hsi.mjs';

const D = Math.PI / 180;
const FT_PER_NM = 6076;
// The pilot looks over the nose: the view is centred `lookDown` degrees below
// it, where the runway is at the DA with the nose up on the approach.
export const SCREEN = Object.freeze({ width: 980, height: 140, eye: 50, fov: 50, lookDown: 8 });
const F = SCREEN.width / 2 / Math.tan((SCREEN.fov / 2) * D); // px per radian at the centre
const RUNWAY = { length: 8000, half: 75 }; // ft, invented

/**
 * Project a ground point to the screen. `at` is the aircraft: range (NM to
 * the threshold), right (ft right of the extended centreline), height (ft
 * above the touchdown zone), pitch, bank, heading (deg) and the final
 * course. The point is `f` ft past the threshold (negative on the approach
 * side) and `y` ft right of the centreline. Returns [x, y, distance], or
 * null when the point is behind the eye.
 */
export function project(at, f, y, z = 0) {
  const psi = (at.heading - at.course) * D, th = (at.pitch - SCREEN.lookDown) * D, ph = at.bank * D;
  const ax = at.range * FT_PER_NM + f, ay = y - at.right, az = z - at.height;
  const x1 = ax * Math.cos(psi) + ay * Math.sin(psi), y1 = -ax * Math.sin(psi) + ay * Math.cos(psi);
  const x2 = x1 * Math.cos(th) + az * Math.sin(th), z2 = -x1 * Math.sin(th) + az * Math.cos(th);
  const y3 = y1 * Math.cos(ph) - z2 * Math.sin(ph), z3 = y1 * Math.sin(ph) + z2 * Math.cos(ph);
  if (x2 < 1) return null;
  return [SCREEN.width / 2 + (F * y3) / x2, SCREEN.eye - (F * z3) / x2, Math.hypot(ax, ay, az)];
}

function lights() {
  const out = [];
  for (let f = -2400; f <= -100; f += 100) {
    for (let i = -2; i <= 2; i++) out.push([f, i * 3.5, 'als']);
    if (f === -1000) for (let y = -50; y <= 50; y += 5) if (Math.abs(y) > 7) out.push([f, y, 'als']);
  }
  for (let y = -RUNWAY.half - 20; y <= RUNWAY.half + 20; y += 10) out.push([0, y, 'thr']);
  for (let f = 200; f <= RUNWAY.length; f += 200) out.push([f, -RUNWAY.half, 'edge'], [f, RUNWAY.half, 'edge']);
  return out;
}
const LIGHTS = lights();

/**
 * Draw the windscreen. `visibility` is 0 in cloud and 1 fully broken out
 * underneath it; in between the scene shows through the cloud.
 */
export function drawWindscreen(svg, at, visibility) {
  const { width: w, height: h } = SCREEN;
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.replaceChildren();
  const v = Math.max(0, Math.min(1, visibility));
  if (v > 0) {
    const far = project({ ...at, height: 0 }, 1e7, at.right) ?? [w / 2, SCREEN.eye];
    svg.append(el('rect', { x: 0, y: 0, width: w, height: h, class: 'ws-sky' }));
    const g = el('g', { transform: `translate(${far[0].toFixed(1)} ${far[1].toFixed(1)}) rotate(${(-at.bank).toFixed(2)})` });
    g.append(el('rect', { x: -3 * w, y: 0, width: 6 * w, height: 4 * w, class: 'ws-ground' }));
    svg.append(g);
    const corners = [[0, -RUNWAY.half], [RUNWAY.length, -RUNWAY.half], [RUNWAY.length, RUNWAY.half], [0, RUNWAY.half]].map(([f, y]) => project(at, f, y));
    if (corners.every(Boolean)) svg.append(el('polygon', { points: corners.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' '), class: 'ws-runway' }));
    for (const [f, y, kind] of LIGHTS) {
      const p = project(at, f, y);
      if (!p || p[0] < -5 || p[0] > w + 5 || p[1] < -5 || p[1] > h + 5) continue;
      svg.append(el('circle', { cx: p[0].toFixed(1), cy: p[1].toFixed(1), r: Math.max(1.2, Math.min(3.5, 4000 / p[2])).toFixed(2), class: `ws-${kind}` }));
    }
  }
  svg.append(el('rect', { x: 0, y: 0, width: w, height: h, class: 'ws-cloud', opacity: (1 - 0.8 * v).toFixed(2) }));
}

/** How much of the scene shows: 0 in cloud, rising to 1 at the DA on a run that breaks out. */
export function visibilityAt(height, visual, da) {
  return visual ? Math.max(0, Math.min(1, (da + 80 - height) / 80)) : 0;
}
