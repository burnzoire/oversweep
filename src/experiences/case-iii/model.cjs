/* Pure, deterministic geometry. Degrees clockwise from magnetic north;
 * carrier frame: x starboard, y astern; distances NM, time seconds.
 * Fixed synthetic path rate: 250 NM/hour, independent of displayed KIAS.
 * No wind, drift or acceleration. Half-rate 180° turns (120 s), 60 s legs.
 * Synthetic training geometry, not aircraft performance or validated guidance.
 */
(function (root) {
  'use strict';
  function holdPosition(seconds, brc = 0) {
    if (!Number.isFinite(seconds) || seconds < 0 || !Number.isFinite(brc)) {
      throw new RangeError('Hold time must be finite and non-negative; BRC must be finite.');
    }
    const t = seconds % 360, distanceRate = 250 / 3600, radius = distanceRate * 120 / Math.PI;
    const norm = a => (a % 360 + 360) % 360;
    let x, y, heading;
    if (t < 120) {
      const angle = t * Math.PI / 120;
      x = radius * (Math.cos(angle) - 1);
      y = 21 - radius * Math.sin(angle);
      heading = -t * 1.5;
    } else if (t < 180) {
      x = -2 * radius; y = 21 + distanceRate * (t - 120); heading = 180;
    } else if (t < 300) {
      const angle = (t - 180) * Math.PI / 120;
      x = -radius * (1 + Math.cos(angle));
      y = 21 + distanceRate * 60 + radius * Math.sin(angle);
      heading = 180 - (t - 180) * 1.5;
    } else {
      x = 0; y = 21 + distanceRate * (360 - t); heading = 0;
    }
    return { x, y, h: norm(brc + heading) };
  }
  const api = Object.freeze({ holdPosition });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CaseIIIModel = api;
})(globalThis);
