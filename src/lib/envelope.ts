import type { Envelope } from '../data/encyclopedia';

// Side-view engagement region from published limits: every point whose height
// is between the minimum and maximum altitude and whose slant range from the
// launcher is between the minimum and maximum range. Real launch zones are
// smaller and depend on target speed, aspect and altitude; this only combines
// the published figures. Distances in km, heights in m.

export const KM_PER_NM = 1.852;
export const M_PER_FT = 0.3048;

export const kmToNm = (km: number) => km / KM_PER_NM;
export const mToFt = (m: number) => m / M_PER_FT;

export interface Scale {
  id: string;
  label: string;
  maxNm: number;
  maxKft: number;
  stepNm: number;
  stepKft: number;
}

export const scales: Scale[] = [
  { id: 'long', label: 'Long range (150 NM)', maxNm: 150, maxKft: 100, stepNm: 25, stepKft: 20 },
  { id: 'medium', label: 'Medium range (35 NM)', maxNm: 35, maxKft: 100, stepNm: 5, stepKft: 20 },
  { id: 'short', label: 'Short range (14 NM)', maxNm: 14, maxKft: 50, stepNm: 2, stepKft: 10 },
  { id: 'point', label: 'Point defence (5 NM)', maxNm: 5, maxKft: 10, stepNm: 1, stepKft: 2 },
];

// The smallest scale that shows the whole envelope.
export function fittingScale(e: Envelope): Scale {
  const fits = (s: Scale) => kmToNm(e.maxRangeKm) <= s.maxNm && mToFt(e.maxAltM ?? 0) / 1000 <= s.maxKft;
  return [...scales].reverse().find(fits) ?? scales[0];
}

export interface Region {
  // Boundary in (range km, height km), outer edge climbing then inner edge descending.
  outer: [number, number][];
  inner: [number, number][];
  floorKm: number;
  ceilingKm: number;
}

export function region(e: Envelope, steps = 48): Region | null {
  if (e.maxAltM === null) return null;
  const R = e.maxRangeKm;
  const r = e.minRangeKm ?? 0;
  const floor = (e.minAltM ?? 0) / 1000;
  const ceiling = Math.min(e.maxAltM / 1000, R);
  if (!(R > r) || !(ceiling > floor)) throw new Error(`Empty envelope: ${e.basis}`);
  const outer: [number, number][] = [];
  const inner: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const y = floor + ((ceiling - floor) * i) / steps;
    outer.push([Math.sqrt(R * R - y * y), y]);
    inner.push([Math.sqrt(Math.max(r * r - y * y, 0)), y]);
  }
  return { outer, inner: inner.reverse(), floorKm: floor, ceilingKm: ceiling };
}
