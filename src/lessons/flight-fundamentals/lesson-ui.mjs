// Presentation for the Flight Fundamentals module's interactive figures. All
// numbers come from lesson-model.mjs; this file only reads inputs and draws.
import {
  AIRFOIL, EXAMPLE, alphaFor, clMaxOf, dragPolar, energyHeight, levelTurn, liftCoefficient, maneuveringSpeed,
  maxLoadFactor, requiredCl, speedAt, stabilityResponse, stallSpeed, stallSpeedAt, steadyPath,
} from './lesson-model.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const rad = (d) => d * Math.PI / 180;
const r0 = (v) => Math.round(v).toLocaleString('en-US');
const f1 = (v) => v.toFixed(1);
const f2 = (v) => v.toFixed(2);

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
const frame = (w, h) => el('rect', { x: 1, y: 1, width: w - 2, height: h - 2, class: 'frame' });
const label = (x, y, text, cls = 'lbl', extra = {}) => el('text', { x, y, class: cls, ...extra }, text);
const fields = (root) => Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
const setOut = (root, name, text) => { const o = root.querySelector(`output[for="${name}"]`); if (o) o.textContent = text; };
const say = (out, lines) => out.replaceChildren(...lines.map((t) => Object.assign(document.createElement('p'), { textContent: t })));

// Arrow from (x1, y1) to (x2, y2) with a filled head; nothing for a zero vector.
function arrow(x1, y1, x2, y2, cls) {
  const g = el('g', { class: `vec ${cls}` });
  const len = Math.hypot(x2 - x1, y2 - y1);
  if (len < 1) return g;
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len, h = Math.min(10, len * 0.5);
  g.append(
    el('line', { x1, y1, x2: x2 - ux * h * 0.8, y2: y2 - uy * h * 0.8 }),
    el('path', { d: `M${x2} ${y2} L${x2 - ux * h - uy * h * 0.45} ${y2 - uy * h + ux * h * 0.45} L${x2 - ux * h + uy * h * 0.45} ${y2 - uy * h - ux * h * 0.45}Z`, class: 'head' }),
  );
  return g;
}

// A plotting box: maps data to screen and draws the axes, grid and labels.
function plot(svg, { x, y, w, h, xr, yr, xticks, yticks, xlabel, ylabel, xfmt = r0, yfmt = r0 }) {
  const X = (v) => x + (v - xr[0]) / (xr[1] - xr[0]) * w;
  const Y = (v) => y + h - (v - yr[0]) / (yr[1] - yr[0]) * h;
  for (const t of xticks) {
    svg.append(el('line', { x1: X(t), y1: y, x2: X(t), y2: y + h, class: 'grid' }));
    svg.append(label(X(t), y + h + 15, xfmt(t), 'lbl small', { 'text-anchor': 'middle' }));
  }
  for (const t of yticks) {
    svg.append(el('line', { x1: x, y1: Y(t), x2: x + w, y2: Y(t), class: 'grid' }));
    svg.append(label(x - 6, Y(t) + 4, yfmt(t), 'lbl small', { 'text-anchor': 'end' }));
  }
  svg.append(el('rect', { x, y, width: w, height: h, class: 'thin' }));
  svg.append(label(x + w / 2, y + h + 32, xlabel, 'lbl small', { 'text-anchor': 'middle' }));
  svg.append(label(x - 44, y + h / 2, ylabel, 'lbl small', { 'text-anchor': 'middle', transform: `rotate(-90 ${x - 44} ${y + h / 2})` }));
  const path = (fn, from, to, n = 120) => {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const v = from + (to - from) * i / n, r = fn(v);
      if (r === null || !Number.isFinite(r)) continue;
      d += `${d ? 'L' : 'M'}${X(v).toFixed(1)} ${Y(Math.max(yr[0], Math.min(yr[1], r))).toFixed(1)}`;
    }
    return d;
  };
  return { X, Y, path };
}
const range = (a, b, step) => Array.from({ length: Math.floor((b - a) / step + 1e-9) + 1 }, (_, i) => a + i * step);

// Side-view outline, nose to +x, fin up, about 60 units long; rotated to pitch.
const SIDE = 'M30 0 L22 -4 L8 -6 L-24 -3 L-30 -16 L-24 -16 L-14 -4 L-14 3 L22 4 Z M2 -1 L-10 -1 L-12 2 L4 2 Z';
const side = (x, y, pitch, cls, scale = 1) => el('path', { d: SIDE, class: cls, transform: `translate(${x} ${y}) rotate(${-pitch}) scale(${scale})` });

/* ---------- Figure 1: the four forces ---------- */
function setupForces(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const polar = dragPolar();
  function draw() {
    const speed = Number(f.speed.value), gamma = Number(f.gamma.value);
    setOut(root, 'speed', `${speed} kt`); setOut(root, 'gamma', `${gamma > 0 ? '+' : ''}${gamma}°`);
    const drag = polar.at(speed).total;
    const s = steadyPath({ gamma, drag });
    const cx = 330, cy = 210, k = 0.06, kt = 0.3; // px per lb: lift/weight, thrust/drag (×5)
    const u = [Math.cos(rad(gamma)), -Math.sin(rad(gamma))]; // along the path, screen coordinates
    const nn = [-Math.sin(rad(gamma)), -Math.cos(rad(gamma))]; // perpendicular to the path, upward
    svg.replaceChildren(frame(660, 420));
    // Flight path and horizon.
    svg.append(el('line', { x1: 20, y1: cy, x2: 640, y2: cy, class: 'ln dashed' }), label(24, cy + 16, 'HORIZON', 'lbl small'));
    svg.append(el('line', { x1: cx - 300 * u[0], y1: cy - 300 * u[1], x2: cx + 300 * u[0], y2: cy + 300 * u[1], class: 'ln centreline' }));
    svg.append(label(cx + 230 * u[0], cy + 230 * u[1] - 10, 'FLIGHT PATH', 'lbl small'));
    svg.append(side(cx, cy, gamma, 'own', 2.2));
    svg.append(
      arrow(cx, cy, cx + nn[0] * s.lift * k, cy + nn[1] * s.lift * k, 'lift'),
      arrow(cx, cy, cx, cy + s.weight * k, 'weight'),
      arrow(cx, cy, cx + u[0] * Math.max(0, s.thrust) * kt, cy + u[1] * Math.max(0, s.thrust) * kt, 'thrust'),
      arrow(cx, cy, cx - u[0] * s.drag * kt, cy - u[1] * s.drag * kt, 'drag'),
    );
    if (gamma !== 0) {
      // Weight resolved along and across the path.
      const wa = s.weight * Math.sin(rad(gamma)), wn = s.weight * Math.cos(rad(gamma));
      svg.append(arrow(cx, cy, cx - u[0] * wa * kt, cy - u[1] * wa * kt, 'component'));
      svg.append(arrow(cx, cy, cx - nn[0] * wn * k, cy - nn[1] * wn * k, 'component'));
    }
    svg.append(label(cx + nn[0] * s.lift * k + 8, cy + nn[1] * s.lift * k, `LIFT ${r0(s.lift)} LB`, 'lbl on'));
    svg.append(label(cx + 8, cy + s.weight * k + 4, `WEIGHT ${r0(s.weight)} LB`));
    svg.append(label(cx + u[0] * Math.max(0, s.thrust) * kt + 6, cy + u[1] * Math.max(0, s.thrust) * kt - 8, `THRUST ${r0(Math.max(0, s.thrust))}`, 'lbl on'));
    svg.append(label(cx - u[0] * s.drag * kt - 90, cy - u[1] * s.drag * kt - 8, `DRAG ${r0(s.drag)}`));
    svg.append(label(14, 22, 'STEADY FLIGHT: FORCES ALONG AND ACROSS THE PATH CANCEL', 'lbl small'));
    svg.append(label(14, 404, 'THRUST, DRAG AND THE WEIGHT COMPONENT ALONG THE PATH DRAWN ×5   - - WEIGHT COMPONENTS', 'lbl small'));
    const ld = s.lift / drag;
    say(out, [
      `At ${speed} kt the example airplane's drag is ${r0(drag)} lb, so lift is ${f1(ld)} times drag.`,
      gamma === 0
        ? `Level: lift equals the ${r0(s.weight)} lb weight and thrust equals drag.`
        : gamma > 0
          ? `Climbing at ${gamma}°: ${r0(s.weight * Math.sin(rad(gamma)))} lb of the weight acts rearward along the path, so thrust must be ${r0(s.thrust)} lb, and lift drops to ${r0(s.lift)} lb.`
          : `Descending at ${-gamma}°: ${r0(-s.weight * Math.sin(rad(gamma)))} lb of the weight acts forward along the path, so only ${r0(Math.max(0, s.thrust))} lb of thrust is needed${s.thrust < 0 ? ' (negative: this path needs more drag than the airplane has, or a steeper glide)' : ''}.`,
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 2: airfoil and angle of attack ---------- */
// NACA 2412 section (2% camber at 40% chord, 12% thick) as a representative shape.
function naca2412(n = 40) {
  const m = 0.02, p = 0.4, t = 0.12, upper = [], lower = [];
  for (let i = 0; i <= n; i++) {
    const x = (1 - Math.cos(Math.PI * i / n)) / 2;
    const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4);
    const yc = x < p ? m / (p * p) * (2 * p * x - x * x) : m / ((1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x * x);
    const dy = x < p ? 2 * m / (p * p) * (p - x) : 2 * m / ((1 - p) ** 2) * (p - x);
    const th = Math.atan(dy);
    upper.push([x - yt * Math.sin(th), yc + yt * Math.cos(th)]);
    lower.push([x + yt * Math.sin(th), yc - yt * Math.cos(th)]);
  }
  return { upper, lower, camber: upper.map((u, i) => [(u[0] + lower[i][0]) / 2, (u[1] + lower[i][1]) / 2]) };
}
const SECTION = naca2412();

function setupAirfoil(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const alpha = Number(f.alpha.value);
    setOut(root, 'alpha', `${alpha}°`);
    const cl = liftCoefficient(alpha), stalled = alpha > AIRFOIL.critical;
    svg.replaceChildren(frame(660, 380));
    // Section drawn with the relative wind horizontal (left to right) and the
    // chord pitched up by α about the quarter chord.
    const ox = 80, oy = 200, c = 280, qx = 0.25;
    const pt = ([x, y]) => {
      const dx = (x - qx) * c, dy = y * c, a = rad(alpha);
      return [ox + qx * c + dx * Math.cos(a) + dy * Math.sin(a), oy - (-dx * Math.sin(a) + dy * Math.cos(a))];
    };
    const outline = [...SECTION.upper, ...[...SECTION.lower].reverse()].map(pt);
    // Streamlines, a sketch: each line keeps a clearance from the section that
    // shrinks with distance from it, and lines above are drawn down behind the
    // trailing edge (downwash) in proportion to lift. Past the critical angle
    // the line nearest the upper surface leaves it near the leading edge and a
    // turbulent wake fills the gap.
    const surface = (x) => {
      let top = Infinity, bottom = -Infinity;
      for (let i = 0; i < outline.length; i++) {
        const [x1, y1] = outline[i], [x2, y2] = outline[(i + 1) % outline.length];
        if ((x - x1) * (x - x2) > 0 || x1 === x2) continue;
        const y = y1 + (y2 - y1) * (x - x1) / (x2 - x1);
        top = Math.min(top, y); bottom = Math.max(bottom, y);
      }
      return top === Infinity ? null : [top, bottom];
    };
    const [tx0, ty0] = pt([1, 0]);
    const xs = range(20, 465, 5), xq = pt([qx, 0])[0];
    const smooth = (ys, n = 6) => ys.map((_, i) => { const w = ys.slice(Math.max(0, i - n), i + n + 1); return w.reduce((a, b) => a + b, 0) / w.length; });
    const down = Math.max(0, Math.min(cl, clMaxOf()));
    const separation = pt([0.12, 0.08])[0];
    for (const off of [-110, -78, -50, -24, 24, 50, 78, 110]) {
      const above = off < 0, gap = Math.abs(off) - 14;
      const near = above && off === -24 && stalled;
      const ys = xs.map((x) => {
        const s = surface(x);
        // Behind the trailing edge the flow follows it down, then along a
        // downwash slope; the effect fades with distance from the section.
        const t = Math.max(0, Math.min(1, (x - xq) / (tx0 - xq)));
        let y = oy + off + ((ty0 - oy) * t + Math.max(0, x - tx0) * down * 0.12) * Math.max(0, 1 - Math.abs(off) / 140);
        if (s) y = above ? Math.min(y, s[0] - gap * 0.55 - 6) : Math.max(y, s[1] + gap * 0.55 + 6);
        if (near && x > separation) y = Math.min(y, surface(separation)[0] - 8);
        return y;
      });
      const sm = smooth(ys, 8);
      svg.append(el('path', { d: xs.map((x, i) => `${i ? 'L' : 'M'}${x} ${sm[i].toFixed(1)}`).join(' '), class: 'stream' }));
    }
    if (stalled) {
      const [sx, sy] = pt([0.2, 0.09]);
      for (const [dy, amp] of [[6, 7], [20, 10]]) {
        let d = `M${sx} ${sy - dy}`;
        for (let i = 1; i <= 9; i++) d += ` q 9 ${i % 2 ? -amp : amp} 18 ${i % 2 ? -2 : 2}`;
        svg.append(el('path', { d, class: 'stream turbulent' }));
      }
      svg.append(label(sx + 20, sy - 44, 'SEPARATED, TURBULENT FLOW', 'lbl small'));
    }
    svg.append(el('path', { d: `M${outline.map((p) => p.join(' ')).join(' L')}Z`, class: 'section' }));
    const [lx, ly] = pt([0, 0]), [tx, ty] = [tx0, ty0];
    svg.append(el('line', { x1: lx - 30 * Math.cos(rad(alpha)), y1: ly + 30 * Math.sin(rad(alpha)), x2: tx + 40 * Math.cos(rad(alpha)), y2: ty - 40 * Math.sin(rad(alpha)), class: 'ln centreline' }));
    svg.append(el('path', { d: `M${SECTION.camber.map(pt).map((p) => p.join(' ')).join(' L')}`, class: 'ln dashed' }));
    svg.append(label(tx + 48 * Math.cos(rad(alpha)) - 20, ty - 48 * Math.sin(rad(alpha)) - 10, 'CHORD LINE', 'lbl small'));
    svg.append(label(lx - 40, ly + 30, 'LEADING EDGE', 'lbl small'));
    svg.append(label(tx - 20, ty + 34, 'TRAILING EDGE', 'lbl small'));
    // Relative wind and the AOA arc at the trailing edge.
    svg.append(arrow(20, 330, 150, 330, 'wind'), label(20, 350, 'RELATIVE WIND', 'lbl small'));
    svg.append(el('line', { x1: tx, y1: ty, x2: tx + 70, y2: ty, class: 'thin' }));
    if (alpha !== 0) {
      const r = 56, a = rad(alpha);
      svg.append(el('path', { d: `M${tx + r} ${ty} A${r} ${r} 0 0 ${alpha > 0 ? 0 : 1} ${tx + r * Math.cos(a)} ${ty - r * Math.sin(a)}`, class: 'angle' }));
    }
    svg.append(label(tx + 62, ty + 16, `α ${alpha}°`, 'lbl on'));
    // Lift at the quarter chord, perpendicular to the relative wind.
    const [qxp, qyp] = pt([0.25, 0.04]);
    svg.append(arrow(qxp, qyp, qxp, qyp - Math.max(0, cl) * 80, 'lift'));
    svg.append(label(qxp + 8, qyp - Math.max(0, cl) * 80 + 4, `LIFT (CL ${f2(cl)})`, 'lbl on'));
    // Inset lift curve.
    const box = plot(svg, { x: 500, y: 40, w: 140, h: 140, xr: [-4, 24], yr: [0, 1.8], xticks: [0, 8, 16, 24], yticks: [0, 0.5, 1, 1.5], xlabel: 'ANGLE OF ATTACK (°)', ylabel: 'CL', yfmt: (v) => v.toFixed(1) });
    svg.append(el('path', { d: box.path(liftCoefficient, -4, 24), class: 'track' }));
    svg.append(el('line', { x1: box.X(AIRFOIL.critical), y1: 40, x2: box.X(AIRFOIL.critical), y2: 180, class: 'mark-line' }));
    svg.append(label(box.X(AIRFOIL.critical) - 3, 52, 'CRITICAL', 'lbl small', { 'text-anchor': 'end' }));
    svg.append(el('circle', { cx: box.X(alpha), cy: box.Y(cl), r: 5, class: 'pointer' }));
    say(out, [
      `Angle of attack ${alpha}°: lift coefficient ${f2(cl)}.`,
      alpha < AIRFOIL.zeroLift ? 'Below the zero-lift angle the section makes downward lift.'
        : stalled ? `Past the ${AIRFOIL.critical}° critical angle the flow separates from the upper surface and lift falls: the wing is stalled. The way out is to reduce the angle of attack.`
          : alpha >= AIRFOIL.knee ? 'Near the critical angle: each extra degree adds less lift. Further increase stalls the wing.'
            : 'Below the critical angle, lift rises steadily with angle of attack.',
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 3: lift equation — speed versus angle of attack ---------- */
function setupLiftSpeed(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const vs = stallSpeed();
  function draw() {
    const speed = Number(f.speed.value);
    setOut(root, 'speed', `${speed} kt`);
    const cl = requiredCl({ speed }), alpha = alphaFor(cl);
    svg.replaceChildren(frame(660, 380));
    const box = plot(svg, { x: 80, y: 40, w: 540, h: 270, xr: [40, 160], yr: [0, 2], xticks: range(40, 160, 20), yticks: [0, 0.5, 1, 1.5, 2], xlabel: 'TRUE AIRSPEED (KT), SEA LEVEL', ylabel: 'LIFT COEFFICIENT NEEDED', yfmt: (v) => v.toFixed(1) });
    svg.append(el('rect', { x: box.X(40), y: box.Y(2), width: box.X(vs) - box.X(40), height: box.Y(0) - box.Y(2), class: 'zone' }));
    svg.append(label(box.X(vs) + 6, box.Y(1.9), 'BELOW STALL SPEED: CL MAX', 'lbl small'), label(box.X(vs) + 6, box.Y(1.8), 'CANNOT CARRY 1 G', 'lbl small'));
    svg.append(el('line', { x1: box.X(40), y1: box.Y(clMaxOf()), x2: box.X(160), y2: box.Y(clMaxOf()), class: 'mark-line' }));
    svg.append(label(box.X(158), box.Y(clMaxOf()) - 6, `CL MAX ${clMaxOf().toFixed(1)}`, 'lbl small', { 'text-anchor': 'end' }));
    svg.append(el('path', { d: box.path((v) => requiredCl({ speed: v }), vs * Math.sqrt(clMaxOf() / 2), 160), class: 'track' }));
    svg.append(el('line', { x1: box.X(speed), y1: box.Y(0), x2: box.X(speed), y2: box.Y(Math.min(2, cl)), class: 'mark-line on' }));
    svg.append(el('circle', { cx: box.X(speed), cy: box.Y(Math.min(2, cl)), r: 6, class: 'pointer' }));
    svg.append(label(box.X(vs) + 4, box.Y(0.1), `STALL ${r0(vs)} KT`, 'lbl small'));
    svg.append(label(14, 22, `L = ½ ρ V² S CL — EXAMPLE AIRPLANE ${r0(EXAMPLE.weight)} LB, ${EXAMPLE.wingArea} FT², 1 G`, 'lbl small'));
    say(out, [
      `At ${speed} kt the wing needs a lift coefficient of ${f2(cl)} to carry ${r0(EXAMPLE.weight)} lb.`,
      alpha === null
        ? `That is more than CLmax: below about ${r0(vs)} kt no angle of attack can hold level flight, and pulling harder only stalls the wing.`
        : `On the illustrative lift curve that is about ${f1(alpha)}° angle of attack. Halve the speed and the wing needs four times the lift coefficient.`,
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 4: the drag curve ---------- */
function setupDrag(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const polar = dragPolar(), vmd = polar.minDragSpeed(), vs = stallSpeed();
  function draw() {
    const speed = Number(f.speed.value);
    setOut(root, 'speed', `${speed} kt`);
    const d = polar.at(speed);
    svg.replaceChildren(frame(660, 380));
    const box = plot(svg, { x: 80, y: 40, w: 540, h: 270, xr: [40, 160], yr: [0, 600], xticks: range(40, 160, 20), yticks: range(0, 600, 100), xlabel: 'TRUE AIRSPEED (KT), SEA LEVEL', ylabel: 'DRAG (LB)' });
    svg.append(el('rect', { x: box.X(40), y: box.Y(600), width: box.X(vs) - box.X(40), height: box.Y(0) - box.Y(600), class: 'zone' }));
    svg.append(label(box.X(42), box.Y(570), 'BELOW STALL', 'lbl small'));
    svg.append(el('path', { d: box.path((v) => polar.at(v).parasite, vs, 160), class: 'ln dashed' }));
    svg.append(el('path', { d: box.path((v) => polar.at(v).induced, vs, 160), class: 'ln centreline' }));
    svg.append(el('path', { d: box.path((v) => polar.at(v).total, vs, 160), class: 'track' }));
    svg.append(label(box.X(150), box.Y(polar.at(150).parasite) + 18, 'PARASITE', 'lbl small'));
    svg.append(label(box.X(vs) + 6, box.Y(polar.at(vs).induced) + 16, 'INDUCED', 'lbl small'));
    svg.append(label(box.X(148), box.Y(polar.at(148).total) - 10, 'TOTAL', 'lbl on', { 'text-anchor': 'end' }));
    svg.append(el('line', { x1: box.X(vmd), y1: box.Y(0), x2: box.X(vmd), y2: box.Y(polar.minDrag), class: 'mark-line' }));
    svg.append(label(box.X(vmd) + 4, box.Y(14), `L/D MAX ${f1(polar.ldMax)} AT ${r0(vmd)} KT`, 'lbl small'));
    if (speed >= vs) {
      for (const [v, cls] of [[d.total, 'pointer'], [d.parasite, 'dot'], [d.induced, 'dot']]) svg.append(el('circle', { cx: box.X(speed), cy: box.Y(Math.min(600, v)), r: cls === 'pointer' ? 6 : 4, class: cls }));
    }
    say(out, speed < vs ? [`Below the example airplane's ${r0(vs)} kt stall speed there is no level flight to draw.`] : [
      `At ${speed} kt: parasite drag ${r0(d.parasite)} lb, induced drag ${r0(d.induced)} lb, total ${r0(d.total)} lb, so lift is ${f1(EXAMPLE.weight / d.total)} times drag.`,
      Math.abs(speed - vmd) < 3 ? 'You are at the bottom of the curve: least total drag, at L/Dmax, where parasite and induced drag are equal.'
        : speed < vmd ? 'Slower than L/Dmax, induced drag dominates: slowing down further increases total drag.'
          : 'Faster than L/Dmax, parasite drag dominates and grows with the square of airspeed.',
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 5: axes and primary flight controls ---------- */
// Body axes: x forward, y right, z up. Polygons are flat plates; control
// surfaces hinge about their leading edge.
const BODY = {
  fuselageTop: [[16, 0], [12, 2.2], [2, 2.4], [-20, 0.9], [-26, 0.5], [-26, -0.5], [-20, -0.9], [2, -2.4], [12, -2.2]].map(([x, y]) => [x, y, 0]),
  fuselageSide: [[16, -0.4], [12, 2.6], [4, 3.2], [-26, 1], [-26, -0.6], [-20, -1.2], [4, -2.6], [12, -2.2]].map(([x, z]) => [x, 0, z]),
  wingL: [[2.5, -1.8], [1.5, -18], [-2.6, -18], [-3.4, -1.8]].map(([x, y]) => [x, y, 0.3]),
  wingR: [[2.5, 1.8], [1.5, 18], [-2.6, 18], [-3.4, 1.8]].map(([x, y]) => [x, y, 0.3]),
  tail: [[-19, -6.2], [-19, 6.2], [-21.6, 6.2], [-21.6, -6.2]].map(([x, y]) => [x, y, 0.6]),
  fin: [[-18.5, 1], [-23, 6.4], [-24.8, 6.4], [-24.8, 1]].map(([x, z]) => [x, 0, z]),
};
// Hinged surfaces, each point carrying its hinge x. A positive deflection
// moves the trailing edge up (ailerons, elevator) or right (rudder).
function surfaces(ail, ele, rud) {
  const hinge = (pts, axis, angle) => pts.map(([x, y, z, hx]) => {
    const d = x - hx, a = rad(angle);
    return axis === 'z' ? [hx + d * Math.cos(a), y, z - d * Math.sin(a)] : [hx + d * Math.cos(a), y - d * Math.sin(a), z];
  });
  return {
    aileronL: hinge([[-2.2, -10, 0.3, -2.2], [-2.6, -17, 0.3, -2.6], [-4.4, -17, 0.3, -2.6], [-4.4, -10, 0.3, -2.2]], 'z', -ail),
    aileronR: hinge([[-2.2, 10, 0.3, -2.2], [-2.6, 17, 0.3, -2.6], [-4.4, 17, 0.3, -2.6], [-4.4, 10, 0.3, -2.2]], 'z', ail),
    elevator: hinge([[-21.6, -6.2, 0.6, -21.6], [-21.6, 6.2, 0.6, -21.6], [-24, 6.2, 0.6, -21.6], [-24, -6.2, 0.6, -21.6]], 'z', ele),
    rudder: hinge([[-24.8, 0, 1, -24.8], [-24.8, 0, 6.4, -24.8], [-26.6, 0, 6.4, -24.8], [-26.6, 0, 1, -24.8]], 'y', rud),
  };
}
function rotate([x, y, z], axis, a) {
  const c = Math.cos(rad(a)), s = Math.sin(rad(a));
  if (axis === 'roll') return [x, y * c + z * s, -y * s + z * c];
  if (axis === 'pitch') return [x * c - z * s, y, x * s + z * c];
  return [x * c - y * s, x * s + y * c, z];
}
const CONTROLS = {
  roll: { axis: 'LONGITUDINAL AXIS', motion: 'ROLL', control: 'AILERONS', parts: ['aileronL', 'aileronR'], line: [[24, 0, 0], [-34, 0, 0]] },
  pitch: { axis: 'LATERAL AXIS', motion: 'PITCH', control: 'ELEVATOR', parts: ['elevator'], line: [[0, -24, 0], [0, 24, 0]] },
  yaw: { axis: 'VERTICAL AXIS', motion: 'YAW', control: 'RUDDER', parts: ['rudder'], line: [[0, 0, 14], [0, 0, -12]] },
};

function setupAxes(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const A = rad(32), E = rad(22), S = 8.2, cx = 330, cy = 200;
  const project = ([x, y, z]) => {
    const x1 = x * Math.cos(A) - y * Math.sin(A), y1 = x * Math.sin(A) + y * Math.cos(A);
    return { sx: cx + y1 * S, sy: cy - (x1 * Math.sin(E) + z * Math.cos(E)) * S, depth: x1 * Math.cos(E) - z * Math.sin(E) };
  };
  function draw() {
    const mode = root.querySelector('input[name="axis"]:checked').value;
    const input = Number(f.input.value);
    setOut(root, 'input', input === 0 ? 'neutral' : `${Math.abs(input)}% ${input > 0 ? (mode === 'pitch' ? 'aft (back)' : 'right') : (mode === 'pitch' ? 'forward' : 'left')}`);
    const c = CONTROLS[mode], defl = input * 0.25; // up to 25° of surface travel
    const turn = input * 0.3; // up to 30° of attitude change, illustrative
    const surf = surfaces(mode === 'roll' ? defl : 0, mode === 'pitch' ? defl : 0, mode === 'yaw' ? defl : 0);
    const polys = [
      ...Object.entries(BODY).map(([name, pts]) => ({ name, pts, cls: 'plate' })),
      ...Object.entries(surf).map(([name, pts]) => ({ name, pts, cls: c.parts.includes(name) ? 'plate active' : 'plate' })),
    ].map((p) => {
      const pr = p.pts.map((q) => project(rotate(q, mode, turn)));
      return { ...p, pr, depth: pr.reduce((s, q) => s + q.depth, 0) / pr.length };
    }).sort((a, b) => b.depth - a.depth);
    svg.replaceChildren(frame(660, 400));
    const [a, b] = c.line.map((q) => project(q));
    svg.append(el('line', { x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, class: 'ln centreline axis-line' }));
    for (const p of polys) svg.append(el('path', { d: `M${p.pr.map((q) => `${q.sx.toFixed(1)} ${q.sy.toFixed(1)}`).join(' L')}Z`, class: p.cls }));
    svg.append(el('circle', { cx: project([0, 0, 0]).sx, cy: project([0, 0, 0]).sy, r: 4, class: 'fixmark' }));
    svg.append(label(a.sx + 8, a.sy - 6, c.axis, 'lbl on'));
    svg.append(label(14, 22, `${c.motion} ABOUT THE ${c.axis} — CONTROLLED BY THE ${c.control}`, 'lbl small'));
    svg.append(label(14, 384, 'ALL THREE AXES PASS THROUGH THE CENTRE OF GRAVITY (●). SURFACE AND ATTITUDE ANGLES ILLUSTRATIVE.', 'lbl small'));
    const dir = input > 0 ? 'right' : 'left';
    say(out, [
      input === 0 ? `Select a control input to see the ${c.control.toLowerCase()} move and the airplane ${c.motion.toLowerCase()}.`
        : mode === 'roll' ? `Wheel or stick ${dir}: the ${dir} aileron rises and the other lowers. The lowered aileron's wing gains lift, the raised one loses it, and the airplane rolls ${dir} about its longitudinal axis.`
          : mode === 'pitch' ? (input > 0 ? 'Back pressure: the elevator trailing edge rises, the tail is pushed down and the nose pitches up about the lateral axis.' : 'Forward pressure: the elevator trailing edge lowers, the tail rises and the nose pitches down about the lateral axis.')
            : `${input > 0 ? 'Right' : 'Left'} rudder pedal: the rudder deflects ${dir}, the tail moves the other way and the nose yaws ${dir} about the vertical axis.`,
      mode === 'roll' && input !== 0 ? `The lowered aileron also makes more drag, so the nose tends to yaw ${input > 0 ? 'left' : 'right'}, away from the roll: adverse yaw, corrected with coordinated rudder.` : '',
    ].filter(Boolean));
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 6: static and dynamic stability ---------- */
const STABILITY_TEXT = {
  'static-positive': 'Positive static stability: after the disturbance the airplane initially tends back toward where it was.',
  'static-neutral': 'Neutral static stability: it tends to stay in the new condition.',
  'static-negative': 'Negative static stability: it tends to keep moving away from where it was.',
  'dynamic-positive': 'Positive dynamic stability: it overshoots but each swing is smaller, settling back over time.',
  'dynamic-neutral': 'Neutral dynamic stability: it keeps swinging with the same amplitude.',
  'dynamic-negative': 'Negative dynamic stability: each swing is larger than the last, even though it initially heads back (positive static stability).',
};
function setupStability(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const kind = root.querySelector('input[name="kind"]:checked').value;
    svg.replaceChildren(frame(660, 320));
    const box = plot(svg, { x: 80, y: 30, w: 540, h: 220, xr: [0, 12], yr: [-3, 3], xticks: range(0, 12, 2), yticks: [-3, -2, -1, 0, 1, 2, 3], xlabel: 'TIME AFTER THE DISTURBANCE (ILLUSTRATIVE)', ylabel: 'DISPLACEMENT', xfmt: (v) => `${v} s`, yfmt: (v) => (v === 0 ? 'TRIM' : '') });
    svg.append(el('line', { x1: box.X(0), y1: box.Y(0), x2: box.X(12), y2: box.Y(0), class: 'ln' }));
    for (const k of Object.keys(STABILITY_TEXT)) if (k !== kind && k.split('-')[0] === kind.split('-')[0]) svg.append(el('path', { d: box.path((t) => stabilityResponse({ kind: k, t }), 0, 12, 240), class: 'ghost' }));
    svg.append(el('path', { d: box.path((t) => stabilityResponse({ kind, t }), 0, 12, 240), class: 'track' }));
    svg.append(el('circle', { cx: box.X(0), cy: box.Y(1), r: 5, class: 'pointer' }), label(box.X(0) + 8, box.Y(1) - 8, 'DISTURBED', 'lbl small'));
    say(out, [STABILITY_TEXT[kind]]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 7: turns and load factor ---------- */
function setupTurn(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const vs1 = stallSpeed();
  function draw() {
    const bank = Number(f.bank.value), speed = Number(f.speed.value);
    setOut(root, 'bank', `${bank}°`); setOut(root, 'speed', `${speed} kt`);
    const t = levelTurn({ speed, bank }), vsTurn = stallSpeedAt(vs1, t.n);
    svg.replaceChildren(frame(660, 400));
    // Rear view: banked airplane, lift tilted with it, components.
    const cx = 170, cy = 250, a = rad(bank);
    svg.append(label(14, 22, 'REAR VIEW (LEVEL, COORDINATED TURN)', 'lbl small'));
    const wing = (s) => [cx + s * 80 * Math.cos(a), cy + s * 80 * Math.sin(a)];
    const [lx, ly] = wing(-1), [rx, ry] = wing(1);
    svg.append(el('line', { x1: lx, y1: ly, x2: rx, y2: ry, class: 'ln heavy' }));
    svg.append(el('circle', { cx, cy, r: 9, class: 'own' }));
    svg.append(el('line', { x1: cx, y1: cy, x2: cx + 26 * Math.sin(a), y2: cy - 26 * Math.cos(a), class: 'ln heavy' }));
    const k = Math.min(90, 170 / t.n), L = t.n * k, W = k; // lift drawn at most 170 px
    const tipX = cx + L * Math.sin(a), tipY = cy - L * Math.cos(a);
    svg.append(arrow(cx, cy, tipX, tipY, 'lift'));
    svg.append(arrow(cx, cy, cx, cy - L * Math.cos(a), 'component'));
    svg.append(arrow(cx, cy, cx + L * Math.sin(a), cy, 'component'));
    svg.append(el('line', { x1: tipX, y1: tipY, x2: tipX, y2: cy, class: 'thin dotted' }), el('line', { x1: tipX, y1: tipY, x2: cx, y2: tipY, class: 'thin dotted' }));
    svg.append(arrow(cx, cy, cx, cy + W, 'weight'));
    svg.append(label(Math.min(250, tipX - 30), tipY - 12, `LIFT ${f2(t.n)} W`, 'lbl on'));
    svg.append(label(cx + 6, cy + W + 14, 'WEIGHT W', 'lbl small'));
    svg.append(label(14, 368, '- - COMPONENTS OF LIFT: VERTICAL BALANCES WEIGHT,', 'lbl small'), label(14, 384, '      HORIZONTAL PULLS THE AIRPLANE ROUND THE TURN', 'lbl small'));
    if (bank > 0) {
      svg.append(label(cx + 4, cy - 46, `${bank}°`, 'lbl on'));
      const r = 40;
      svg.append(el('path', { d: `M${cx} ${cy - r} A${r} ${r} 0 0 1 ${cx + r * Math.sin(a)} ${cy - r * Math.cos(a)}`, class: 'angle' }));
    }
    // Plan view of the turn circle, scale chosen to fit.
    const px = 490, py = 210;
    svg.append(label(350, 22, 'PLAN VIEW: TURN CIRCLE', 'lbl small'));
    if (bank > 0) {
      const scale = Math.min(140 / t.radius, 0.08), rr = t.radius * scale;
      svg.append(el('circle', { cx: px, cy: py, r: rr, class: 'ln dashed' }));
      svg.append(el('line', { x1: px, y1: py, x2: px + rr, y2: py, class: 'dim' }));
      svg.append(label(px + rr / 2, py - 6, `R ${r0(t.radius)} FT`, 'lbl small', { 'text-anchor': 'middle' }));
      svg.append(el('circle', { cx: px, cy: py, r: 3, class: 'fixmark' }));
      svg.append(el('path', { d: `M${px + rr - 8} ${py + 12} L${px + rr} ${py - 4} L${px + rr + 8} ${py + 12}Z`, class: 'own' }));
      svg.append(el('line', { x1: 430, y1: 362, x2: 430 + 1000 * scale, y2: 362, class: 'ln heavy' }), label(430, 354, '1,000 FT', 'lbl small'));
      svg.append(label(430, 384, `${f1(t.rate)}°/S · 360° IN ${r0(t.fullTurn)} S`, 'lbl small'));
    } else {
      svg.append(el('line', { x1: px, y1: py + 120, x2: px, y2: py - 140, class: 'ln dashed' }), label(px + 8, py, 'STRAIGHT', 'lbl small'));
    }
    say(out, [
      `${bank}° of bank in a level turn needs ${f2(t.n)} G: the wing must make ${f2(t.n)} times the airplane's weight in lift, so that the vertical part still equals the weight.`,
      bank > 0 ? `At ${speed} kt: radius ${r0(t.radius)} ft, rate ${f1(t.rate)}° per second, a full circle in ${r0(t.fullTurn)} s.` : 'Wings level: lift is all vertical and there is no turn.',
      `The example airplane's stall speed rises from ${r0(vs1)} kt to ${r0(vsTurn)} kt (×√${f2(t.n)} = ${f2(Math.sqrt(t.n))}).${speed < vsTurn ? ' At this speed it would stall before it could hold this bank level.' : ''}`,
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 8: the stall boundary (V-n) ---------- */
function setupEnvelope(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const vs1 = stallSpeed();
  function draw() {
    const speed = Number(f.speed.value), g = Number(f.g.value), limit = Number(f.limit.value);
    setOut(root, 'speed', `${speed} kt`); setOut(root, 'g', `${f1(g)} G`); setOut(root, 'limit', `${f1(limit)} G`);
    const va = maneuveringSpeed(vs1, limit), nMax = maxLoadFactor(speed, vs1);
    svg.replaceChildren(frame(660, 380));
    const box = plot(svg, { x: 80, y: 30, w: 540, h: 280, xr: [0, 180], yr: [0, 8], xticks: range(0, 180, 20), yticks: range(0, 8, 1), xlabel: 'AIRSPEED (KT), EXAMPLE AIRPLANE AT SEA LEVEL', ylabel: 'LOAD FACTOR (G)' });
    // Stalled region above the boundary, overstress region above the limit.
    let stall = `M${box.X(0)} ${box.Y(0)}`;
    for (let v = 0; v <= va; v += 1) stall += ` L${box.X(v)} ${box.Y(Math.min(8, maxLoadFactor(v, vs1)))}`;
    stall += ` L${box.X(va)} ${box.Y(8)} L${box.X(0)} ${box.Y(8)}Z`;
    svg.append(el('path', { d: stall, class: 'zone' }));
    svg.append(el('rect', { x: box.X(va), y: box.Y(8), width: box.X(180) - box.X(va), height: box.Y(limit) - box.Y(8), class: 'zone hatch' }));
    svg.append(el('path', { d: box.path((v) => maxLoadFactor(v, vs1), 0, va), class: 'track' }));
    svg.append(el('line', { x1: box.X(va), y1: box.Y(limit), x2: box.X(180), y2: box.Y(limit), class: 'track' }));
    svg.append(el('line', { x1: box.X(va), y1: box.Y(0), x2: box.X(va), y2: box.Y(limit), class: 'mark-line' }));
    svg.append(label(box.X(va) + 4, box.Y(0.3), `VA ${r0(va)} KT`, 'lbl small'));
    svg.append(label(box.X(vs1) + 4, box.Y(1) + 14, `VS ${r0(vs1)}`, 'lbl small'));
    svg.append(el('line', { x1: box.X(vs1), y1: box.Y(0), x2: box.X(vs1), y2: box.Y(1), class: 'thin' }));
    svg.append(label(box.X(12), box.Y(6), 'STALL: CL MAX CANNOT', 'lbl small'), label(box.X(12), box.Y(5.6), 'MAKE THIS MUCH LIFT', 'lbl small'));
    svg.append(label(box.X(176), box.Y(Math.min(7.7, limit + 0.4)), 'ABOVE LIMIT LOAD', 'lbl small', { 'text-anchor': 'end' }));
    svg.append(el('circle', { cx: box.X(speed), cy: box.Y(Math.min(8, g)), r: 7, class: 'pointer' }));
    const stalled = g > nMax, over = g > limit;
    say(out, [
      `At ${speed} kt the wing can make at most ${f1(Math.min(nMax, 99))} G before it stalls (${r0(vs1)} kt × √n).`,
      stalled && over ? 'This point is beyond both the stall boundary and the limit load.'
        : stalled ? `Asking for ${f1(g)} G here exceeds the critical angle of attack: an accelerated stall, at a speed well above the 1 G stall speed.`
          : over ? `${f1(g)} G is above the ${f1(limit)} G limit load: the wing can make it, and the structure may be damaged.`
            : `${f1(g)} G is inside the envelope.`,
      `Maneuvering speed VA, where the stall boundary meets the ${f1(limit)} G limit, is ${r0(va)} kt for this weight: below it, the wing stalls before it can overstress the airplane.`,
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 9: energy height ---------- */
function setupEnergy(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const alt = Number(f.alt.value), speed = Number(f.speed.value);
    setOut(root, 'alt', `${r0(alt)} ft`); setOut(root, 'speed', `${speed} kt`);
    const es = energyHeight(alt, speed);
    svg.replaceChildren(frame(660, 380));
    const box = plot(svg, { x: 80, y: 30, w: 540, h: 280, xr: [0, 300], yr: [0, 10000], xticks: range(0, 300, 50), yticks: range(0, 10000, 2000), xlabel: 'TRUE AIRSPEED (KT)', ylabel: 'ALTITUDE (FT)' });
    for (const e of range(2000, 14000, 2000)) {
      svg.append(el('path', { d: box.path((v) => e - energyHeight(0, v), 0, 300), class: 'ghost' }));
      if (e < 10000) svg.append(label(box.X(3), box.Y(e) + 12, `ES ${r0(e)}`, 'lbl small ghost-label'));
    }
    svg.append(el('path', { d: box.path((v) => es - energyHeight(0, v), 0, 300), class: 'track' }));
    // The Airplane Flying Handbook example points.
    for (const [v, h] of [[100, 6000], [240, 4000]]) {
      svg.append(el('circle', { cx: box.X(v), cy: box.Y(h), r: 4, class: 'dot' }));
      svg.append(label(box.X(v) + 4, box.Y(h) + 20, `${v} KT / ${r0(h)} FT`, 'lbl small'));
    }
    svg.append(el('circle', { cx: box.X(speed), cy: box.Y(alt), r: 7, class: 'pointer' }));
    const zoom = Math.min(es, 10000);
    svg.append(label(box.X(2), box.Y(zoom) - 6, `ZOOM LIMIT ${r0(es)} FT`, 'lbl small'));
    svg.append(label(14, 18, 'CURVES OF CONSTANT ENERGY HEIGHT ES = H + V²/2G (ZERO DRAG, THRUST = DRAG)', 'lbl small'));
    const dive = speedAt(es, Math.max(0, alt - 1000));
    say(out, [
      `${speed} kt at ${r0(alt)} ft is an energy height of ${r0(es)} ft: ${r0(alt)} ft of altitude plus ${r0(es - alt)} ft stored in airspeed.`,
      `Trading all of that speed with the elevator would, ideally, zoom the airplane to ${r0(es)} ft; diving 1,000 ft instead would, ideally, give ${r0(dive)} kt. Real airplanes lose some energy to drag along the way.`,
      'Moving along a curve is an energy exchange (elevator). Moving to a different curve needs a change in thrust or drag (throttle).',
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

const SETUP = {
  forces: setupForces, airfoil: setupAirfoil, 'lift-speed': setupLiftSpeed, drag: setupDrag, axes: setupAxes,
  stability: setupStability, turn: setupTurn, envelope: setupEnvelope, energy: setupEnergy,
};
for (const root of document.querySelectorAll('[data-lesson]')) {
  const setup = SETUP[root.dataset.lesson];
  if (!setup) continue;
  try { setup(root); root.classList.add('ready'); } catch (error) { console.error(error); }
}
