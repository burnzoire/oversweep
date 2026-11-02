// ILS needles from the aircraft's position, for the Flying the ILS figure.
// The needles are angular: full deflection is ±2.5° of azimuth for a 5°
// localizer course and ±0.7° of glide slope (CNATRA P-1204, p. 1-2), and full
// scale is two dots (AFMAN 11-217 Vol 1, p. 210: one dot is half scale). So
// the same error in feet moves the needles further the closer you are.
// The runway length and antenna positions are invented for the figure.

const D = Math.PI / 180;
export const FT_PER_NM = 6076;
export const ILS = Object.freeze({
  locFullScale: 2.5, // degrees of azimuth at full deflection (5° course)
  gsFullScale: 0.7, // degrees of glide slope at full deflection
  glideSlope: 3, // degrees
  runway: 8000, // ft, invented
  locBeyond: 1000, // ft past the far end of the runway, invented
  gsAbeam: 1000, // ft past the threshold, invented
  tch: 50, // ft: glide slope height over the threshold, from gsAbeam
  daHeight: 200, // ft above the touchdown zone: an invented example DA
});

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * Needle deflections in dots (±2 is full scale). `range` is NM from the
 * threshold, `right` ft right of the centerline, `height` ft above the
 * touchdown zone. Localizer dots are positive when the course is to the
 * right (you are left of it); glide slope dots are positive when the glide
 * slope is above you (you are low).
 */
export function needles({ range, right, height }) {
  const x = range * FT_PER_NM;
  const locAngle = Math.atan2(right, x + ILS.runway + ILS.locBeyond) / D;
  const gsAngle = Math.atan2(height, x + ILS.gsAbeam) / D;
  const locDev = -locAngle, gsDev = ILS.glideSlope - gsAngle;
  return {
    locAngle: locDev, gsAngle: gsDev,
    loc: clamp((locDev / ILS.locFullScale) * 2, -2, 2),
    gs: clamp((gsDev / ILS.gsFullScale) * 2, -2, 2),
    locFull: Math.abs(locDev) >= ILS.locFullScale,
    gsFull: Math.abs(gsDev) >= ILS.gsFullScale,
  };
}

// Height above the touchdown zone of the glide slope at a range.
export const glideSlopeHeight = (range) => Math.tan(ILS.glideSlope * D) * (range * FT_PER_NM + ILS.gsAbeam);

// Feet off the centerline (or glide slope) that one dot means at a range.
export const feetPerDot = (range) => ({
  loc: Math.tan((ILS.locFullScale / 2) * D) * (range * FT_PER_NM + ILS.runway + ILS.locBeyond),
  gs: Math.tan((ILS.gsFullScale / 2) * D) * (range * FT_PER_NM + ILS.gsAbeam),
});

/**
 * What the AFMAN's limits say about a needle picture (p. 210): discontinue
 * on full-scale localizer deflection; do not descend below localizer
 * minimums more than one dot low or two dots (full scale) high.
 */
export function ilsLimits({ loc, gs }) {
  if (Math.abs(loc) >= 2) return { ok: false, rule: 'Full-scale localizer: discontinue the approach.' };
  if (gs > 1) return { ok: false, rule: 'More than one dot low: do not descend below localizer minimums until back within limits.' };
  if (gs <= -2) return { ok: false, rule: 'Full scale (two dots) high: do not descend below localizer minimums until back within limits.' };
  return { ok: true, rule: 'Within limits: you may continue to the DA.' };
}

/**
 * A scripted approach from 10 NM for the "Fly it" button: starts right of the
 * centerline and low, and corrects the way the page says,
 * small heading and pitch changes. Returns positions every `dt` seconds.
 */
export function scriptedApproach({ dt = 0.5, groundSpeed = 140 } = {}) {
  const out = [];
  let range = 10, right = 1800, height = glideSlopeHeight(10) - 350, t = 0;
  const fps = groundSpeed * FT_PER_NM / 3600;
  const vs0 = Math.tan(ILS.glideSlope * D) * fps; // ft/s down the glide slope
  while (range > 0.05) {
    const { loc, gs } = needles({ range, right, height });
    out.push({ t, range, right, height, loc, gs });
    // Turn toward the course: a few degrees of heading per dot, limited.
    const correction = clamp(loc * 4, -8, 8); // degrees of heading
    right += Math.sin(correction * D) * fps * dt;
    // Glide slope: hold altitude while low until the needle centres, then descend.
    const descent = gs > 0.2 ? 0 : vs0 * (1 - clamp(gs, -1, 1) * 0.5);
    height = Math.max(0, height - descent * dt);
    range -= (groundSpeed / 3600) * dt;
    t += dt;
  }
  return out;
}
