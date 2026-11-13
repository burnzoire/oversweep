// Why a jink spoils aimed AAA, for the Threat Avoidance module, Figure 2.
// Aimed AAA fire control computes its aim point on the assumption that the
// target holds the same heading, altitude and airspeed for the projectile's
// time of flight (USAF Electronic Warfare Fundamentals, 2000, p. 8-13). This
// model measures how far a level turn, begun as the gun fires, moves the
// aircraft from that predicted point by the time the rounds arrive.
// Plain kinematics: constant speed, a level turn at load factor n, so the
// horizontal acceleration is g * sqrt(n^2 - 1). No gun, round, fuze or lethal
// radius is modelled: the result is a distance, not a hit or a miss.
// Units: knots, seconds, g; results in feet.

export const G_FT_S2 = 32.174;
export const FT_S_PER_KT = 6076.12 / 3600;

export function jinkOffset({ speedKt, tofS, loadG }) {
  if (!(speedKt > 0) || !(tofS >= 0)) throw new Error('speed must be positive and time of flight non-negative');
  if (!(loadG >= 1)) throw new Error('load factor must be at least 1 g');
  const v = speedKt * FT_S_PER_KT;
  const predictedFt = v * tofS;
  const accel = G_FT_S2 * Math.sqrt(loadG * loadG - 1);
  if (accel === 0) return { predictedFt, offsetFt: 0, headingChangeDeg: 0, turnRadiusFt: Infinity };
  const radius = (v * v) / accel;
  const theta = predictedFt / radius;
  const x = radius * Math.sin(theta), y = radius * (1 - Math.cos(theta));
  return {
    predictedFt,
    offsetFt: Math.hypot(predictedFt - x, y),
    headingChangeDeg: (theta * 180) / Math.PI,
    turnRadiusFt: radius,
  };
}

// Plan-view geometry for Figure 2, shared by the page's server render and
// its script: the turning track, the straight predicted track and both ends,
// scaled to fit the figure.
export function jinkPicture({ speedKt, tofS, loadG }, W = 640, H = 260) {
  const r = jinkOffset({ speedKt, tofS, loadG });
  const N = 48, pts = [];
  for (let i = 0; i <= N; i++) {
    const s = (r.predictedFt * i) / N;
    if (!Number.isFinite(r.turnRadiusFt)) pts.push([s, 0]);
    else {
      const th = s / r.turnRadiusFt;
      pts.push([r.turnRadiusFt * Math.sin(th), r.turnRadiusFt * (1 - Math.cos(th))]);
    }
  }
  const maxX = Math.max(r.predictedFt, ...pts.map((p) => p[0])), maxY = Math.max(1, ...pts.map((p) => p[1]));
  const X0 = 60, Y0 = H - 50, k = Math.min((W - 140) / maxX, (H - 110) / maxY);
  const P = (x, y) => [X0 + x * k, Y0 - y * k];
  const track = pts.map((p, i) => `${i ? 'L' : 'M'}${P(...p).map((v) => v.toFixed(1)).join(' ')}`).join(' ');
  const [px, py] = P(r.predictedFt, 0), [ax, ay] = P(...pts[N]);
  return { r, X0, Y0, px, py, ax, ay, track };
}
