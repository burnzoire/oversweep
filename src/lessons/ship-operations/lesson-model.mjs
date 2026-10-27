/* Pure, deterministic models for the Carrier and Amphibious Ship Operations
 * module. Lens numbers are the T-45 Carrier Qualification FTI's (CNATRA
 * P-1211, (7-01), pp. 3 and 6); pattern positions are its Case I carrier
 * pattern (pp. 30-33) and the Army's helicopter Charlie pattern (FM 1-564,
 * 1997, pp. 5-15-5-18); deck landing currency rules are FM 1-564's
 * (pp. 1-11-1-13), which follow the 1988 Army-Air Force-Navy agreement.
 * Educational models, not validated procedure.
 */

const D = Math.PI / 180;
export const FT_PER_NM = 6076;

function finite(name, value) {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be a finite number.`);
}

// P-1211 pp. 3 and 6: the FLOLS has five cells over 1.5° of vertical
// coverage, the IFLOLS twelve over 1.7°. The bottom cell shows red.
export const LENSES = {
  FLOLS: { cells: 5, coverage: 1.5, rangeNm: 0.75 },
  IFLOLS: { cells: 12, coverage: 1.7, rangeNm: 1.5 },
};

/** Thickness of the lens's beam, in ft, at a range in ft from the lens. */
export function lensThickness(rangeFt, lens = LENSES.FLOLS) {
  finite('rangeFt', rangeFt);
  return 2 * rangeFt * Math.tan(lens.coverage / 2 * D);
}

/**
 * What the pilot sees for a height error (ft above the glideslope, negative
 * below) at a range (ft from the lens): the angle off the glideslope, the
 * ball's place on the lens (+1 top, −1 bottom, 0 level with the datum
 * lights), the lit cell counted from the top, whether it is the red bottom
 * cell, and whether the ball is on the lens at all.
 */
export function ballPicture(heightFt, rangeFt, lens = LENSES.FLOLS) {
  finite('heightFt', heightFt); finite('rangeFt', rangeFt);
  if (rangeFt <= 0) throw new RangeError('rangeFt must be positive.');
  const deg = Math.atan2(heightFt, rangeFt) / D;
  const half = lens.coverage / 2;
  const visible = Math.abs(deg) <= half;
  const position = Math.max(-1, Math.min(1, deg / half));
  const cell = Math.min(lens.cells, Math.max(1, Math.floor((half - deg) / lens.coverage * lens.cells) + 1));
  return { deg, position, cell, red: cell === lens.cells, visible };
}

// Figure 2: the T-45 Case I carrier pattern (P-1211 Figure 19 and pp. 30-33)
// as waypoints, x along the BRC in NM (positive ahead of the landing spot), y
// in NM to port, height in ft: initial 3 NM astern at 800 ft, break over or
// past the bow, 600 ft downwind 0.9-1.1 NM abeam, 450 ft at the 90, 325-375
// ft at the 45, then the groove to touchdown. Positions between those the
// FTI gives are interpolated. The ship moves; the figure does not.
export const CASE_I = [
  { id: 'initial', pts: [[-3, -0.22, 800], [-1.5, -0.22, 800], [0, -0.2, 800], [1.0, -0.18, 800]] },
  { id: 'break', pts: [[1.0, -0.18, 800], [1.42, 0, 795], [1.6, 0.41, 770], [1.42, 0.82, 720], [1.0, 1.0, 680]] },
  { id: 'downwind', pts: [[1.0, 1.0, 680], [0.5, 1.0, 620], [0, 1.0, 600]] },
  { id: 'abeam', pts: [[0, 1.0, 600], [-0.32, 0.92, 530], [-0.6, 0.62, 450]] },
  { id: 'ninety', pts: [[-0.6, 0.62, 450], [-0.8, 0.42, 390], [-0.86, 0.28, 350]] },
  { id: 'fortyfive', pts: [[-0.86, 0.28, 350], [-0.85, 0.13, 305], [-0.75, 0.04, 270]] },
  { id: 'groove', pts: [[-0.75, 0.04, 270], [-0.4, 0.02, 145], [-0.04, 0.002, 15]] },
  { id: 'touchdown', pts: [[-0.04, 0.002, 15], [0, 0, 0], [0.1, 0, 0]] },
];

// A racetrack centred on the BRC at y, straights from −half to +half NM,
// ends of radius r, as points.
function racetrack(half, y, r) {
  const arc = (cx, from) => Array.from({ length: 7 }, (_, i) => {
    const a = from + i * Math.PI / 6;
    return [+(cx + r * Math.sin(a)).toFixed(3), +(y - r * Math.cos(a)).toFixed(3)];
  });
  return [...arc(half, 0), ...arc(-half, Math.PI), [half, +(y - r).toFixed(3)]];
}

// The Army helicopter Charlie pattern to a port spot on an amphibious
// assault ship (FM 1-564 pp. 5-15-5-18): a left-hand racetrack on the port
// side, upwind parallel to the BRC, the turn in starting no later than abeam
// the spot, the 45° line met at the 90 position, then straight in. Same
// axes; heights are left out because the manual gives none.
export const CHARLIE = [
  { id: 'delta', pts: racetrack(0.6, -1, 0.15) },
  { id: 'upwind', pts: [[-0.8, 0.15], [0.5, 0.15], [0.72, 0.25], [0.78, 0.42], [0.6, 0.6]] },
  { id: 'downwind', pts: [[0.6, 0.6], [0.3, 0.6], [0, 0.6]] },
  { id: 'turn', pts: [[0, 0.6], [-0.2, 0.55], [-0.3, 0.42], [-0.3, 0.3]] },
  { id: 'fortyfive', pts: [[-0.3, 0.3], [-0.15, 0.15], [-0.02, 0.02]] },
  { id: 'spot', pts: [[-0.02, 0.02], [0, 0]] },
];

/** A path's points with one coordinate dropped, for drawing plan or profile. */
export const planOf = (path) => path.flatMap((seg) => seg.pts.map(([x, y]) => [x, y]));

// FM 1-564 para 1-11, the deck landing qualification rules for Army
// aviators (1997, after the 1988 agreement). Counts are shipboard landings.
export const DLQ_RULES = {
  single: { current: { landings: 4, days: 90 }, refresher: { landings: 4, days: 180 }, initial: { field: 6, ship: 6, withinDays: 10 }, refresherSteps: { field: 4, ship: 6, withinDays: 10 } },
  multiDay: { current: { landings: 4, months: 9 }, initial: { field: 5, ship: 5, withinDays: 10 } },
  multiNight: { current: { landings: 6, days: 90 }, initial: { field: 6, ship: 6, withinDays: 10 }, refreshHours: 72, dayLandingWithinHours: 24 },
};

/**
 * Deck landing status under FM 1-564 para 1-11 for an Army pilot.
 *   deck: 'single' (single- or dual-spot ship) or 'multi' (LPH, LHA, CV)
 *   mode: 'day' or 'night' (night is answered for multispot decks only)
 *   in90, in180, in9mo: shipboard landings (on that kind of deck) in the
 *     last 90 days, 180 days and nine months; night90: night shipboard
 *     landings in the last 90 days
 *   hoursSinceNight: hours since the last night shipboard landing
 *   dayLandingIn24h: a day shipboard landing in the last 24 hours
 * Returns { status: 'current' | 'refresher' | 'initial' | 'not-covered',
 *   needs: [what to do before landing on the ship unsupervised] }.
 */
export function dlqStatus({ deck, mode = 'day', in90 = 0, in180 = 0, in9mo = 0, night90 = 0, hoursSinceNight = Infinity, dayLandingIn24h = false }) {
  for (const [k, v] of Object.entries({ in90, in180, in9mo, night90 })) {
    finite(k, v);
    if (v < 0) throw new RangeError(`${k} cannot be negative.`);
  }
  if (deck === 'single') {
    const r = DLQ_RULES.single;
    if (mode === 'night') return { status: 'not-covered', needs: ['Night single-spot operations need more training and equipment; the Navy and the Army arrange them case by case.'] };
    if (in90 >= r.current.landings) return { status: 'current', needs: [] };
    if (in180 >= r.refresher.landings) {
      const s = r.refresherSteps;
      return { status: 'refresher', needs: [`Train with a current DLQ pilot in command or instructor pilot.`, `${s.field} field deck landings, then ${s.ship} shipboard landings, all within ${s.withinDays} consecutive days.`] };
    }
    const s = r.initial;
    return { status: 'initial', needs: ['Ground school.', `${s.field} field deck landings, then ${s.ship} single-spot shipboard landings, all within ${s.withinDays} consecutive days.`] };
  }
  if (deck !== 'multi') throw new RangeError(`Unknown deck "${deck}".`);
  const day = DLQ_RULES.multiDay;
  const dayCurrent = in9mo >= day.current.landings;
  if (mode === 'day') {
    if (dayCurrent) return { status: 'current', needs: [] };
    return { status: 'initial', needs: ['Ground school.', `${day.initial.field} day field deck landings, then ${day.initial.ship} day shipboard landings, all within ${day.initial.withinDays} consecutive days.`] };
  }
  if (mode !== 'night') throw new RangeError(`Unknown mode "${mode}".`);
  const n = DLQ_RULES.multiNight;
  if (!dayCurrent) return { status: 'initial', needs: ['Requalify by day first: night qualification needs day qualification and currency.'] };
  if (night90 < n.current.landings) {
    return { status: 'initial', needs: ['The manual gives no shorter night refresher, only the initial night qualification:', 'Ground school.', `${n.initial.field} night field deck landings, then ${n.initial.ship} night shipboard landings, all within ${n.initial.withinDays} consecutive days.`] };
  }
  if (hoursSinceNight > n.refreshHours && !dayLandingIn24h) {
    return { status: 'refresher', needs: [`More than ${n.refreshHours} hours since your last night shipboard landing: make one day shipboard landing within the ${n.dayLandingWithinHours} hours before the next night landing.`] };
  }
  return { status: 'current', needs: [] };
}
