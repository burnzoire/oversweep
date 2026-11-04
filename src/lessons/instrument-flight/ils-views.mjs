// Plan and profile views of an ILS, both with the threshold at x = TX, in a
// 444 × 452 box: the Flying the ILS figure and the instrument trainer's
// replay. Geometry comes from ils-model.mjs. The plan view's sideways scale
// and the profile's height scale are stretched; both say so.
import { ILS, FT_PER_NM } from './ils-model.mjs';
import { el } from '../shared/hsi.mjs';

const D = Math.PI / 180;
export const PLAN = Object.freeze({ y: 20, h: 190, mid: 115, ftPx: 55 / 2500 });
export const PROF = Object.freeze({ y: 236, h: 214, base: 430, ftPx: 180 / 3400 });
const X0 = 16, TX = 380;

/**
 * Returns `views(svg, pos, trail, extra)`, which appends both views. `maxNm`
 * is the range at the left edge; `far` the range the glide slope beam is
 * drawn out to; `labelNm` where the beam captions sit; `ticks` the range
 * marks; `daLabel` the DA line's caption. `extra.marks` adds labelled points
 * on the trail ({ range, right, height, text }).
 */
export function ilsViews({ maxNm = 10.5, far = 8.5, labelNm = [5, 4.2], ticks = [2, 4, 6, 8, 10], daLabel = 'DA 200 ft (example)', daFrom = 1.2 } = {}) {
  const PX_NM = (TX - X0) / maxNm;
  const sx = (range) => TX - range * PX_NM; // range in NM before the threshold
  const RWY_PX = (ILS.runway / FT_PER_NM) * PX_NM;
  const hy = (h) => PROF.base - h * PROF.ftPx;
  const py = (right) => PLAN.mid + right * PLAN.ftPx;
  return function views(svg, pos, trail, { marks = [] } = {}) {
    const g = el('g');
    // Plan view.
    g.append(el('rect', { x: 2, y: PLAN.y, width: 440, height: PLAN.h, class: 'view' }));
    g.append(el('text', { x: 10, y: PLAN.y + 16, class: 'dark' }, 'PLAN VIEW'));
    g.append(el('text', { x: 436, y: PLAN.y + 16, class: 'dark small', 'text-anchor': 'end' }, 'Sideways scale stretched'));
    const locX = TX + RWY_PX + (ILS.locBeyond / FT_PER_NM) * PX_NM;
    const half = (range) => Math.tan(ILS.locFullScale * D) * (range * FT_PER_NM + ILS.runway + ILS.locBeyond) * PLAN.ftPx;
    g.append(el('path', { class: 'beam', d: `M${locX} ${PLAN.mid} L${sx(maxNm)} ${PLAN.mid - half(maxNm)} L${sx(maxNm)} ${PLAN.mid + half(maxNm)} Z` }));
    g.append(el('line', { x1: sx(maxNm), y1: PLAN.mid, x2: locX, y2: PLAN.mid, class: 'cl' }));
    g.append(el('rect', { x: TX, y: PLAN.mid - 4, width: RWY_PX, height: 8, class: 'rwy' }));
    g.append(el('circle', { cx: locX, cy: PLAN.mid, r: 3, class: 'me' }));
    g.append(el('text', { x: locX - 4, y: PLAN.mid - 10, class: 'dark small', 'text-anchor': 'end' }, 'LOCALIZER'));
    g.append(el('text', { x: sx(labelNm[0]), y: PLAN.mid + half(labelNm[0]) + 14, class: 'dark small', 'text-anchor': 'middle' }, 'Localizer full scale: 2.5° each side'));
    // Profile view.
    g.append(el('rect', { x: 2, y: PROF.y, width: 440, height: PROF.h, class: 'view' }));
    g.append(el('text', { x: 10, y: PROF.y + 16, class: 'dark' }, 'PROFILE'));
    g.append(el('text', { x: 436, y: PROF.y + 16, class: 'dark small', 'text-anchor': 'end' }, 'Height scale stretched'));
    const gsX = TX + (ILS.gsAbeam / FT_PER_NM) * PX_NM;
    const edge = (range, ang) => hy(Math.tan(ang * D) * (range * FT_PER_NM + ILS.gsAbeam));
    g.append(el('path', { class: 'beam gs', d: `M${gsX} ${PROF.base} L${sx(far)} ${edge(far, ILS.glideSlope + ILS.gsFullScale)} L${sx(far)} ${edge(far, ILS.glideSlope - ILS.gsFullScale)} Z` }));
    g.append(el('line', { x1: gsX, y1: PROF.base, x2: sx(far), y2: edge(far, ILS.glideSlope), class: 'cl' }));
    g.append(el('line', { x1: 2, y1: PROF.base, x2: 442, y2: PROF.base, class: 'cl' }));
    g.append(el('rect', { x: TX, y: PROF.base - 1, width: RWY_PX, height: 4, class: 'rwy' }));
    g.append(el('text', { x: sx(labelNm[1]), y: edge(labelNm[1], ILS.glideSlope - ILS.gsFullScale) + 22, class: 'dark small' }, '3° glide slope, full scale 0.7° each side'));
    // DA line.
    g.append(el('line', { x1: sx(daFrom), y1: hy(ILS.daHeight), x2: TX + 20, y2: hy(ILS.daHeight), class: 'cl' }));
    g.append(el('text', { x: sx(daFrom) - 4, y: hy(ILS.daHeight) + 4, class: 'dark small', 'text-anchor': 'end' }, daLabel));
    for (const nm of ticks) {
      g.append(el('line', { x1: sx(nm), y1: PROF.base, x2: sx(nm), y2: PROF.base + 5, class: 'cl' }));
      g.append(el('text', { x: sx(nm), y: PROF.base + 16, class: 'dark small', 'text-anchor': 'middle' }, `${nm} NM`));
    }
    // Trail and aircraft.
    if (trail?.length > 1) {
      g.append(el('path', { class: 'track', d: trail.map((p, i) => `${i ? 'L' : 'M'}${sx(p.range).toFixed(1)} ${py(p.right).toFixed(1)}`).join(' ') }));
      g.append(el('path', { class: 'track', d: trail.map((p, i) => `${i ? 'L' : 'M'}${sx(p.range).toFixed(1)} ${hy(p.height).toFixed(1)}`).join(' ') }));
    }
    for (const m of marks) {
      for (const y of [py(m.right), hy(m.height)]) {
        g.append(el('circle', { cx: sx(m.range), cy: y, r: 4, class: 'mark' }));
        g.append(el('text', { x: sx(m.range), y: y - 8, class: 'dark small', 'text-anchor': 'middle' }, m.text));
      }
    }
    g.append(el('circle', { cx: sx(pos.range), cy: py(pos.right), r: 6, class: 'me' }));
    g.append(el('circle', { cx: sx(pos.range), cy: hy(pos.height), r: 6, class: 'me' }));
    svg.append(g);
  };
}
