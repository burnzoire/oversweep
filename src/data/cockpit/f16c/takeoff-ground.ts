import plan from '../../airfield-plans/batumi.json' with { type: 'json' };

/**
 * The ground seen through the HUD on the takeoff roll: Batumi's runway 13, drawn in true angular scale from the
 * airfield's map data (OpenStreetMap, `airfield-plans/batumi.json`: runway, taxiways, apron, terminal), from the
 * pilot's eye on the runway. Everything is drawn in the HUD frame (mm about the boresight, 25.9 px a degree in the
 * guide figure's 3 px a mm) and redrawn for each frame of the roll: the eye moves up the runway and the horizon
 * tilts with the jet's pitch.
 *
 * Not in the map data, so drawn as assumptions: the runway's markings and lights (a generic pattern), the building
 * heights (the terminal 30 ft) and the support vehicles. The fields are scattered by a seeded generator and stand
 * for farmland, not mapped.
 */
const MM_DEG = 25.9 / 3;
const FT_LAT = 60 * 6076.12;
interface Feature { type: string; widthM?: number; line?: [number, number][]; rings?: [number, number][][] }
const features = plan.features as unknown as Feature[];
const of = (type: string) => features.filter(f => f.type === type);

const [RW0, RW1] = of('runway')[0].line!;
const LON_FT = FT_LAT * Math.cos((RW0[0] * Math.PI) / 180);
const east = (p: [number, number]) => (p[1] - RW0[1]) * LON_FT, north = (p: [number, number]) => (p[0] - RW0[0]) * FT_LAT;
const HEAD = Math.atan2(east(RW1), north(RW1));
/** Runway frame: u feet along runway 13 from its start, v feet to the right of the centreline. */
const rw = (p: [number, number]): [number, number] => [east(p) * Math.sin(HEAD) + north(p) * Math.cos(HEAD), east(p) * Math.cos(HEAD) - north(p) * Math.sin(HEAD)];
export const RUNWAY = { length: Math.hypot(east(RW1), north(RW1)), half: (of('runway')[0].widthM ?? 45) * 3.2808 / 2, heading: (HEAD * 180) / Math.PI };

type P3 = [number, number, number];
export interface View { u: number; eye: number; pitch: number }

const NEAR = 3;
function camera(view: View) {
  const th = (view.pitch * Math.PI) / 180, c = Math.cos(th), s = Math.sin(th);
  return ([u, v, z]: P3): P3 => {
    const dx = u - view.u, dz = view.eye - z;
    return [dx * c - dz * s, v, dx * s + dz * c];
  };
}
const n = (v: number) => +v.toFixed(2);
const toMm = ([pf, pr, pd]: P3) => `${n((Math.atan2(pr, pf) * 180 / Math.PI) * MM_DEG)} ${n((Math.atan2(pd, pf) * 180 / Math.PI) * MM_DEG)}`;

/** Clip a polygon (camera coordinates) to the near plane. */
function clip(pts: P3[]): P3[] {
  const out: P3[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], ain = a[0] >= NEAR, bin = b[0] >= NEAR;
    if (ain) out.push(a);
    if (ain !== bin) { const k = (NEAR - a[0]) / (b[0] - a[0]); out.push([NEAR, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]); }
  }
  return out;
}

export function takeoffGround(view: View, pitch = view.pitch) {
  const cam = camera(view);
  const poly = (pts: P3[], fill: string, extra = '') => {
    const q = clip(pts.map(cam));
    return q.length < 3 ? '' : `<path d="M${q.map(toMm).join('L')}Z" fill="${fill}"${extra}/>`;
  };
  const flat = (pts: [number, number][], fill: string, z = 0) => poly(pts.map(([u, v]) => [u, v, z] as P3), fill);
  const rect = (u0: number, u1: number, v0: number, v1: number, fill: string) => flat([[u0, v0], [u1, v0], [u1, v1], [u0, v1]], fill);
  /** A strip along a line of runway-frame points, `w` feet wide. */
  const strip = (line: [number, number][], w: number, fill: string) => line.slice(1).map((b, i) => {
    const a = line[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nu = -(b[1] - a[1]) / len * w / 2, nv = (b[0] - a[0]) / len * w / 2;
    return flat([[a[0] + nu, a[1] + nv], [b[0] + nu, b[1] + nv], [b[0] - nu, b[1] - nv], [a[0] - nu, a[1] - nv]], fill);
  }).join('');
  const horizon = n(view.pitch * MM_DEG);
  const L = RUNWAY.length, H = RUNWAY.half;
  const dist = (u: number, v = 0) => Math.hypot(u - view.u, v);
  const light = (u: number, v: number, fill: string, z = 1.5) => {
    const q = cam([u, v, z]);
    if (q[0] < NEAR * 3) return '';
    const [x, y] = toMm(q).split(' ').map(Number);
    return `<circle cx="${x}" cy="${y}" r="${n(Math.min(1.1, Math.max(0.3, 240 / dist(u, v))))}" fill="${fill}"/>`;
  };

  // Ground and haze, then distant hills.
  let out = `<g stroke="none"><path d="M-200 ${horizon}H200V140H-200Z" fill="#6f7347"/>`;
  out += [[0.8, 0.22], [1.6, 0.18], [2.6, 0.14], [3.8, 0.1], [5.2, 0.08], [7, 0.05]].map(([deg, op]) => `<rect x="-200" y="${horizon}" width="400" height="${n(deg * MM_DEG)}" fill="#c4c39a" fill-opacity="${op}"/>`).join('');
  out += FIELDS.map(([u, v, l, w, fill]) => rect(u, u + l, v, v + w, fill)).join('');
  // The airfield: grass inside the boundary, the apron, taxiways, runway.
  out += AERODROME.map(r => flat(r, '#7c8352')).join('') + APRON.map(r => flat(r, '#8d8a80')).join('');
  out += TAXIWAYS.map(t => strip(t.line, t.w, '#55524b') + strip(t.line, 1.2, '#b9a64a')).join('');
  out += rect(0, L, -H, H, '#413f3a');
  // Runway markings: edge lines, centreline, threshold bars, numbers and the aiming point.
  out += rect(0, L, -H + 3, -H + 4.6, '#d9d7ce') + rect(0, L, H - 4.6, H - 3, '#d9d7ce');
  for (let u = 260; u + 98 < L - 200; u += 164) out += rect(u, u + 98, -1.6, 1.6, '#d9d7ce');
  for (let i = 0; i < 14; i++) { const v = -H + 12 + i * ((2 * H - 24) / 13); out += rect(12, 112, v - 2.4, v + 2.4, '#d9d7ce'); }
  out += NUMBERS.map(r => rect(r[0], r[1], r[2], r[3], '#d9d7ce')).join('');
  out += rect(1000, 1150, -60, -27, '#d9d7ce') + rect(1000, 1150, 27, 60, '#d9d7ce');
  out += rect(L - 112, L - 12, -H + 8, H - 8, '#413f3a');
  // Lights: edge (white; yellow for the last 2,000 ft), threshold (green) and runway end (red), and the taxiway edges (blue).
  for (let u = 0; u <= L; u += 200) { const fill = u > L - 2000 ? '#e8d46a' : '#f2f0e4'; out += light(u, -H - 9, fill) + light(u, H + 9, fill); }
  for (let v = -H - 9; v <= H + 9; v += 12) out += light(L + 3, v, '#d94b3b');
  out += TAXI_LIGHTS.map(([u, v]) => light(u, v, '#6aa7e8', 1)).join('');
  // Buildings and vehicles, far to near.
  const solids: { d: number; svg: string }[] = [];
  for (const b of BUILDINGS) {
    b.ring.forEach((a, i) => {
      const c = b.ring[(i + 1) % b.ring.length];
      const shade = ['#b8b2a2', '#a39d8e', '#c4beae', '#968f80'][i % 4];
      solids.push({ d: dist((a[0] + c[0]) / 2, (a[1] + c[1]) / 2), svg: poly([[a[0], a[1], 0], [c[0], c[1], 0], [c[0], c[1], b.h], [a[0], a[1], b.h]], shade) });
    });
    const mid = b.ring.reduce((s, p) => [s[0] + p[0] / b.ring.length, s[1] + p[1] / b.ring.length], [0, 0]);
    solids.push({ d: dist(mid[0], mid[1]) - 1, svg: poly(b.ring.map(([u, v]) => [u, v, b.h] as P3), '#7d786d') });
  }
  for (const veh of VEHICLES) {
    for (const part of veh.parts) {
      const [u0, v0] = [veh.u + part.at[0], veh.v + part.at[1]], [l, w, h] = part.size, z0 = part.z ?? 0;
      const faces: { pts: P3[]; fill: string; mu: number; mv: number }[] = [
        { pts: [[u0, v0, z0 + h], [u0 + l, v0, z0 + h], [u0 + l, v0 + w, z0 + h], [u0, v0 + w, z0 + h]], fill: part.top, mu: u0 + l / 2, mv: v0 + w / 2 },
        { pts: [[u0, v0, z0], [u0 + l, v0, z0], [u0 + l, v0, z0 + h], [u0, v0, z0 + h]], fill: part.side, mu: u0 + l / 2, mv: v0 },
        { pts: [[u0, v0 + w, z0], [u0 + l, v0 + w, z0], [u0 + l, v0 + w, z0 + h], [u0, v0 + w, z0 + h]], fill: part.side, mu: u0 + l / 2, mv: v0 + w },
        { pts: [[u0, v0, z0], [u0, v0 + w, z0], [u0, v0 + w, z0 + h], [u0, v0, z0 + h]], fill: part.end, mu: u0, mv: v0 + w / 2 },
        { pts: [[u0 + l, v0, z0], [u0 + l, v0 + w, z0], [u0 + l, v0 + w, z0 + h], [u0 + l, v0, z0 + h]], fill: part.end, mu: u0 + l, mv: v0 + w / 2 },
      ];
      for (const f of faces) solids.push({ d: dist(f.mu, f.mv) + (f.pts[0][2] === z0 + h && f.pts[1][2] === z0 + h && f.pts[2][2] === z0 + h ? -0.5 : 0), svg: poly(f.pts, f.fill) });
    }
  }
  out += solids.sort((a, b) => b.d - a.d).map(s => s.svg).join('');
  return out + '</g>';
}

/** Farmland patches in the runway frame: [u, v, length, width, fill]. */
const FIELDS: [number, number, number, number, string][] = (() => {
  let s = 11;
  const rand = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const tones = ['#6c7348', '#807c52', '#5f6a43', '#8a8456', '#68703f', '#76744c'];
  const out: [number, number, number, number, string][] = [];
  for (let i = 0; i < 260; i++) {
    const u = -1200 + rand() * 12500, side = rand() < 0.5 ? -1 : 1, v = side * (320 + rand() ** 1.4 * 3400);
    out.push([u, side > 0 ? v : v - 60, 120 + rand() * 700, 60 + rand() * 420, tones[Math.floor(rand() * tones.length)]]);
  }
  return out;
})();

const ringsOf = (type: string) => of(type).flatMap(f => f.rings!.map(r => r.map(rw)));
const AERODROME = (plan.aerodrome.rings as unknown as [number, number][][]).map(r => r.map(rw));
const APRON = ringsOf('apron');
const TAXIWAYS = of('taxiway').map(f => ({ line: f.line!.map(rw), w: (f.widthM ?? 23) * 3.2808 }));
const TAXI_LIGHTS: [number, number][] = TAXIWAYS.flatMap(t => t.line.slice(1).flatMap((b, i) => {
  const a = t.line[i], len = Math.hypot(b[0] - a[0], b[1] - a[1]), nu = -(b[1] - a[1]) / (len || 1), nv = (b[0] - a[0]) / (len || 1), out: [number, number][] = [];
  for (let d = 0; d < len; d += 120) out.push([a[0] + (b[0] - a[0]) * d / len + nu * (t.w / 2 + 3), a[1] + (b[1] - a[1]) * d / len + nv * (t.w / 2 + 3)]);
  return out;
})).filter(([u, v]) => u > -100 && u < 6000 && Math.abs(v) < 900);
const BUILDINGS = ringsOf('terminal').map(ring => ({ ring, h: 30 }));

/** The runway number "13" painted at the start, upright to the pilot rolling along it: seven-segment rectangles [u0, u1, v0, v1]. */
const NUMBERS: [number, number, number, number][] = (() => {
  const t = 5, h = 60, w = 24, out: [number, number, number, number][] = [], u0 = 150;
  const seg = (dv: number, parts: string) => {
    const vl = dv, vr = dv + w, um = u0 + h / 2;
    if (parts.includes('a')) out.push([u0 + h - t, u0 + h, vl, vr]);
    if (parts.includes('g')) out.push([um - t / 2, um + t / 2, vl, vr]);
    if (parts.includes('d')) out.push([u0, u0 + t, vl, vr]);
    if (parts.includes('f')) out.push([um, u0 + h, vl, vl + t]);
    if (parts.includes('e')) out.push([u0, um, vl, vl + t]);
    if (parts.includes('b')) out.push([um, u0 + h, vr - t, vr]);
    if (parts.includes('c')) out.push([u0, um, vr - t, vr]);
  };
  seg(-34, 'bc');
  seg(8, 'abgcd');
  return out;
})();

/** Support vehicles: not in the map data, so illustrative. Boxes in the runway frame, `at` relative to the vehicle's origin. */
interface Part { at: [number, number]; size: [number, number, number]; z?: number; top: string; side: string; end: string }
const box = (at: [number, number], size: [number, number, number], c: [string, string, string], z = 0): Part => ({ at, size, z, top: c[0], side: c[1], end: c[2] });
const RED: [string, string, string] = ['#b8453a', '#9c372e', '#82302a'], WHITE: [string, string, string] = ['#e8e6dc', '#cfcdc2', '#b9b7ac'], YELLOW: [string, string, string] = ['#d9b83a', '#bf9f2e', '#a68a28'], DARK: [string, string, string] = ['#3a3f45', '#2e3238', '#25292e'];
const along = (u: number, v: number) => ({ u, v });
const VEHICLES: { u: number; v: number; parts: Part[] }[] = [
  // Beside the runway, clear of the edge lights: a fire truck, a runway inspection pickup and a fuel bowser.
  { ...along(1250, 128), parts: [box([0, 0], [30, 8.5, 6.5], RED), box([22, 0.5], [9, 7.5, 4], RED, 6.5), box([0, 1], [20, 6.5, 2], DARK, 6.5)] },
  { ...along(1900, -150), parts: [box([0, 0], [16, 6.5, 4.5], YELLOW), box([3, 0.5], [8, 5.5, 2.4], DARK, 4.5)] },
  { ...along(3000, 140), parts: [box([0, 0], [34, 8.5, 8], WHITE), box([27, 0.5], [7, 7.5, 3], WHITE, 8)] },
];
