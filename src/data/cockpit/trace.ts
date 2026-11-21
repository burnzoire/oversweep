/**
 * Helpers for writing a panel spec straight from measurements on the rectified
 * reference: values are typed in reference pixels (so they can be checked
 * against the trace grid) and stored in mm.
 *
 * `origin` (reference px) moves the drawing on its canvas: positions (`pt`,
 * `path`) are shifted by it, sizes (`mm`) are not. Use it when a part sits
 * left of or above the rectified image's origin (F-16C landing gear panel's
 * SPEED BRAKE indicator).
 */
import type { Pt } from './types';

/** Numbers each absolute SVG path command takes, and which of them are x (0) or y (1) coordinates. */
const AXES: Record<string, (0 | 1 | null)[]> = {
  M: [0, 1], L: [0, 1], T: [0, 1], H: [0], V: [1], Q: [0, 1, 0, 1], S: [0, 1, 0, 1], C: [0, 1, 0, 1, 0, 1],
  A: [null, null, null, null, null, 0, 1], Z: [],
};

export function tracer(pxPerMm: number, origin: [x: number, y: number] = [0, 0]) {
  const mm = (v: number) => +(v / pxPerMm).toFixed(3);
  const [ox, oy] = origin;
  return {
    mm,
    pt: (x: number, y: number): Pt => [mm(x + ox), mm(y + oy)],
    /** Scale (and shift by `origin`) every number in an absolute-command SVG path (M L H V Q C S T A Z). */
    path: (d: string) => {
      if (!ox && !oy) return d.replace(/-?\d*\.?\d+/g, v => String(mm(+v)));
      return d.replace(/([MLHVQCSTAZ])([^MLHVQCSTAZ]*)/g, (_, cmd: string, args: string) => {
        const axes = AXES[cmd];
        let k = 0;
        return cmd + args.replace(/-?\d*\.?\d+/g, v => {
          const a = axes.length ? axes[k++ % axes.length] : null;
          return String(mm(+v + (a === 0 ? ox : a === 1 ? oy : 0)));
        });
      });
    },
  };
}
