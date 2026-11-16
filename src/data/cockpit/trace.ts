/**
 * Helpers for writing a panel spec straight from measurements on the rectified
 * reference: values are typed in reference pixels (so they can be checked
 * against the trace grid) and stored in mm.
 */
import type { Pt } from './types';

export function tracer(pxPerMm: number) {
  const mm = (v: number) => +(v / pxPerMm).toFixed(3);
  return {
    mm,
    pt: (x: number, y: number): Pt => [mm(x), mm(y)],
    /** Scale every number in an absolute-command SVG path (M L H V Q C Z). */
    path: (d: string) => d.replace(/-?\d*\.?\d+/g, v => String(mm(+v))),
  };
}
