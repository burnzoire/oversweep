import plan from '../../airfield-plans/abu-al-duhur.json' with { type: 'json' };

/**
 * The ground seen through the HUD in the markpoint procedures: Abu al-Duhur air base 4 NM ahead, drawn in true
 * angular scale from the airfield's map data (OpenStreetMap, `airfield-plans/abu-al-duhur.json`: runways, taxiways,
 * aprons, hangars), under the HUD's own symbology.
 *
 * Scene: the jet is level at 3,000 ft above the ground, heading 267° (the line of the runway), 4 NM east of the
 * midpoint of the southern runway. The HUD frame (boresight at 575, 52.4 in the p. 90 figure's pixels, 25.9 px a
 * degree, 3.0 px a mm) is the one `hud.ts` uses; the horizon is `PITCH` degrees below the boresight, where the
 * flight path marker sits in level flight. Texture fields are scattered by a seeded generator: they stand for
 * farmland and are not mapped.
 */
export const GROUND = { pitch: 3.74, heading: 267, agl: 3000, range: 4 } as const;
const B: [number, number] = [575, 52.4], DEG = 25.9, PX = 3;
const FT = 1 / 6076.12;
const mm = (px: number) => +(px / PX).toFixed(2);
/** HUD pixels (the figure's) to the HUD frame's mm about the boresight. */
const pt = ([x, y]: [number, number]) => `${mm(x - B[0])} ${mm(y - B[1])}`;
const poly = (pts: [number, number][]) => 'M' + pts.map(pt).join('L') + 'Z';

const H = (GROUND.heading * Math.PI) / 180;
const FWD: [number, number] = [Math.sin(H), Math.cos(H)];
const RIGHT: [number, number] = [Math.cos(H), -Math.sin(H)];
export const [LAT0, LON0] = [(35.732934 + 35.731725) / 2, (37.087827 + 37.120655) / 2];
export const NM_LAT = 60, NM_LON = 60 * Math.cos((LAT0 * Math.PI) / 180);
/** A point's east and north offset in NM from the southern runway's midpoint. */
const en = ([lat, lon]: [number, number]): [number, number] => [(lon - LON0) * NM_LON, (lat - LAT0) * NM_LAT];
const JET: [number, number] = [-GROUND.range * FWD[0], -GROUND.range * FWD[1]];

/** Where a ground point (east, north NM from the runway midpoint) is in the HUD, in the figure's pixels; undefined behind or beside the jet. */
export function groundPoint([e, n]: [number, number]): [number, number] | undefined {
  const dx = e - JET[0], dy = n - JET[1];
  const f = dx * FWD[0] + dy * FWD[1], r = dx * RIGHT[0] + dy * RIGHT[1];
  if (f < 0.25) return undefined;
  const az = (Math.atan2(r, f) * 180) / Math.PI;
  const down = (Math.atan((GROUND.agl * FT) / Math.hypot(f, r)) * 180) / Math.PI;
  return [B[0] + az * DEG, B[1] + (GROUND.pitch + down) * DEG];
}
/** The runway midpoint (the markpoint's landmark), in the figure's pixels. */
export const MIDPOINT = groundPoint([0, 0])!;
/** Where the flight path marker sits in the level flight of the scene (on the horizon). */
export const FPM_AT: [number, number] = [B[0], B[1] + GROUND.pitch * DEG];

const clamp = (pts: ([number, number] | undefined)[]) => (pts.every(Boolean) ? (pts as [number, number][]) : undefined);
/** A line of map points as a strip `width` ft wide, drawn as a quadrilateral run in the ground plane. */
function strip(line: [number, number][], widthFt: number) {
  const out: string[] = [];
  const w = (widthFt * FT) / 2;
  for (let i = 0; i + 1 < line.length; i++) {
    const [a, b] = [en(line[i]), en(line[i + 1])];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / len, ny = (b[0] - a[0]) / len;
    const q = clamp([[a[0] + nx * w, a[1] + ny * w], [b[0] + nx * w, b[1] + ny * w], [b[0] - nx * w, b[1] - ny * w], [a[0] - nx * w, a[1] - ny * w]].map(p => groundPoint(p as [number, number])));
    if (q) out.push(poly(q));
  }
  return out.join('');
}
/** A line of map points as a projected polyline, for strips too narrow to draw as quadrilaterals (taxiways: 75 ft is under 5 px at 4 NM). */
const track = (line: [number, number][]) => {
  let d = '', open = false;
  for (const p of line) {
    const q = groundPoint(en(p));
    if (!q) { open = false; continue; }
    d += `${open ? 'L' : 'M'}${pt(q)}`; open = true;
  }
  return d;
};
const area = (rings: [number, number][][]) => rings.map(ring => { const q = clamp(ring.map(p => groundPoint(en(p)))); return q ? poly(q) : ''; }).join('');

interface Feature { type: string; line?: [number, number][]; rings?: [number, number][][] }
const features = plan.features as unknown as Feature[];
const of = (type: string) => features.filter(f => f.type === type);

/** A small seeded generator, so the fields are the same on every build. */
function rng(seed: number) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

function fields() {
  const rand = rng(7);
  const tones = ['#85704d', '#9a8458', '#6d6342', '#a08c60', '#66603f', '#7d7550'];
  let out = '';
  for (let i = 0; i < 70; i++) {
    const f = 0.7 + rand() ** 1.6 * 9, r = (rand() - 0.5) * 2 * (0.35 * f + 0.4);
    const len = 0.12 + rand() * 0.5, wid = 0.08 + rand() * 0.3, tall = rand() < 0.5;
    const [dE, dN] = tall ? [wid, len] : [len, wid];
    const c: [number, number] = [JET[0] + f * FWD[0] + r * RIGHT[0], JET[1] + f * FWD[1] + r * RIGHT[1]];
    const q = clamp([[c[0], c[1]], [c[0] + dE, c[1]], [c[0] + dE, c[1] + dN], [c[0], c[1] + dN]].map(p => groundPoint(p as [number, number])));
    if (q) out += `<path d="${poly(q)}" fill="${tones[Math.floor(rand() * tones.length)]}" fill-opacity="0.85"/>`;
  }
  return out;
}

/** The scene as SVG in the HUD frame (mm about the boresight), to sit under the symbology. */
export function airfieldGround() {
  const horizon = mm(GROUND.pitch * DEG);
  // Haze: paler toward the horizon, in a few bands.
  const haze = [[0.8, 0.22], [1.6, 0.18], [2.6, 0.14], [3.8, 0.1], [5.2, 0.08], [7, 0.05]].map(([deg, op]) => `<rect x="-200" y="${horizon}" width="400" height="${mm(deg * DEG)}" fill="#c4b690" fill-opacity="${op}"/>`).join('');
  return (
    `<g stroke="none">` +
    `<path d="M-200 ${horizon}H200V140H-200Z" fill="#7b6a4b"/>` +
    fields() + haze +
    `<path d="${area(plan.aerodrome.rings as unknown as [number, number][][])}" fill="#867556" fill-opacity="0.8"/>` +
    `<path d="${area(of('apron').flatMap(f => f.rings!))}" fill="#8f8a7e"/>` +
    `<path d="${of('taxiway').map(f => track(f.line!)).join('')}" fill="none" stroke="#625d52" stroke-width="${mm(2.6)}" stroke-linejoin="round" stroke-linecap="round"/>` +
    `<path d="${of('runway').map(f => strip(f.line!, 150)).join('')}" fill="#3c3a36"/>` +
    `<path d="${area(of('hangar').flatMap(f => f.rings!))}" fill="#6b655a"/>` +
    `</g>`
  );
}
