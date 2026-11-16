// Lists legends that a toggle's bushing, or its lever tip in the drawn (shown) position, covers.
// Pass --all to check the tip in every position.
// node --experimental-strip-types --no-warnings scripts/cockpit-overlaps.mjs
import { TOGGLES, toggleLeans } from '../src/data/cockpit/components.ts';
import { cockpits } from '../src/data/cockpit/f16c/index.ts';

const specs = [];
const walk = o => {
  if (!o || typeof o !== 'object') return;
  if (o.plate && o.placements && o.controls) { specs.push(o); return; }
  for (const v of Object.values(o)) walk(v);
};
walk(cockpits);

const MARGIN = 0.4;
let found = 0;
for (const s of specs) {
  const texts = s.engraving.filter(e => e.kind === 'text').map(e => {
    const w = e.width ?? e.cap * 0.62 * e.text.length;
    return { t: e.text, x0: e.at[0] - w / 2, x1: e.at[0] + w / 2, y0: e.at[1] - e.cap / 2, y1: e.at[1] + e.cap / 2 };
  });
  for (const p of s.placements) {
    const t = TOGGLES[p.component];
    // Hook paddles and wide paddles are not round tips; skip them.
    if (!t || !p.control || t.cap === 'hook' || t.cap === 'wide') continue;
    const c = s.controls.find(c => c.id === p.control);
    const n = c?.positions.length ?? 2;
    const horiz = c?.travel === 'horizontal';
    const circles = [{ x: 0, y: 0, r: t.r, what: 'bushing' }];
    const shown = s.source?.shown?.[p.control] ?? c?.initial;
    for (const [i, k] of toggleLeans(n).entries()) {
      if (!process.argv.includes('--all') && c?.positions[i]?.id !== shown) continue;
      const L = t.reach * k + (t.shift && k ? Math.sign(k) * t.shift : 0);
      circles.push({ x: horiz ? L : 0, y: horiz ? 0 : L, r: t.ball, what: `tip@${c?.positions[i]?.id}` });
    }
    for (const cc of circles) {
      const cx = p.at[0] + cc.x, cy = p.at[1] + cc.y, r = cc.r + MARGIN;
      for (const tx of texts) {
        const nx = Math.max(tx.x0, Math.min(cx, tx.x1)), ny = Math.max(tx.y0, Math.min(cy, tx.y1));
        if (Math.hypot(nx - cx, ny - cy) < r) {
          found++;
          console.log(`${s.id}: ${p.control} ${cc.what} covers "${tx.t}" (by ${(r - Math.hypot(nx - cx, ny - cy)).toFixed(2)} mm)`);
        }
      }
    }
  }
}
console.log(found ? `${found} overlaps` : 'no overlaps');
