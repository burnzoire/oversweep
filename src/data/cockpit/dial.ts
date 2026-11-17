/**
 * Dial and counter maths shared by the renderer and the page script (kept
 * free of artwork imports so the browser bundle stays small).
 */
type Knots = readonly (readonly [value: number, angle: number])[];

/** Needle angle (degrees clockwise from 12 o'clock) for `value`, linear between the scale knots, clamped at the ends. */
export function scaleAngle(k: Knots, value: number) {
  if (value <= k[0][0]) return k[0][1];
  for (let i = 1; i < k.length; i++) {
    const [v0, a0] = k[i - 1], [v1, a1] = k[i];
    if (value <= v1) return a0 + ((a1 - a0) * (value - v0)) / (v1 - v0);
  }
  return k[k.length - 1][1];
}

/**
 * Drum positions of an odometer-style counter, highest drum first. `unit` is
 * the value of one step of the lowest rolling drum; the last `fixed` drums
 * carry only zeros and roll with it. A position of 1.5 is half way from 1 to 2.
 * A drum turns only while every drum below it rolls from 9 to 0.
 */
export function drumPositions(value: number, drums: number, fixed: number, unit: number) {
  const u = Math.max(0, value) / unit, rolling = drums - fixed, out: number[] = [];
  let carry = u % 10;
  out.unshift(carry);
  for (let i = 1; i < rolling; i++) {
    const lower = carry;
    carry = (Math.floor(u / 10 ** i) % 10) + Math.max(0, lower - 9);
    out.unshift(carry);
  }
  for (let i = 0; i < fixed; i++) out.push(u % 1);
  return out;
}
