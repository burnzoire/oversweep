/**
 * Numeric readout formatting shared by the renderer and the page script
 * (no artwork imports, so the browser bundle stays small).
 */
import type { ReadoutFormat } from './types';

/** Prints `v` as the readout shows it (see `ReadoutFormat`). */
export function formatReadout(v: number, f: ReadoutFormat = {}): string {
  if (f.round) v = Math.round(v / f.round) * f.round;
  if (f.clock) {
    const s = Math.max(0, Math.round(v)), m = Math.floor(s / 60);
    return `${String(m).padStart(f.pad ?? 1, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  const d = f.decimals ?? 0, neg = v < 0 && Math.abs(v) >= 0.5 * 10 ** -d;
  const [whole, frac] = Math.abs(v).toFixed(d).split('.');
  let w = whole.padStart(f.pad ?? 1, '0');
  if (f.comma) w = w.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (neg ? '-' : '') + w + (frac ? `.${frac}` : '');
}
