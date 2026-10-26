// Presentation for the Rotor-Wing Principles of Flight module's interactive
// figures. All numbers come from rotor-model.mjs; this file only reads inputs
// and draws.
import {
  CRITICAL_AOA, ETL, POSITIONS, ROTOR, autorotationRegions, bladeElement, cyclicPitch, densityAt, powerAvailable,
  powerCurve, powerRequired, rotorSpeeds, vortexRingCheck,
} from './rotor-model.mjs';
import { arrow, el, f1, f2, fields, frame, label, plot, r0, rad, range, say, setOut } from './figure-kit.mjs';

// Symmetrical NACA 0012 section, chord 1, leading edge at x = 0: most
// helicopter blades use symmetrical sections (FAA-H-8083-21B p. 2-8).
function naca0012(n = 36) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const x = (1 - Math.cos(Math.PI * i / n)) / 2;
    pts.push([x, 0.6 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1015 * x ** 4)]);
  }
  return [...pts, ...pts.slice(1, -1).reverse().map(([x, y]) => [x, -y])];
}
const SECTION = naca0012();

// Top view of a rotor disk: nose up, turning counterclockwise, with an arrow
// outside the disk showing the direction of rotation.
function disk(svg, cx, cy, R) {
  svg.append(el('circle', { cx, cy, r: R, class: 'thin' }));
  const ra = R + 14, a1 = rad(60), a2 = rad(115);
  svg.append(el('path', { d: `M${cx + ra * Math.cos(a1)} ${cy - ra * Math.sin(a1)} A${ra} ${ra} 0 0 0 ${cx + ra * Math.cos(a2)} ${cy - ra * Math.sin(a2)}`, class: 'thin' }));
  svg.append(arrow(cx + ra * Math.cos(rad(105)), cy - ra * Math.sin(rad(105)), cx + ra * Math.cos(a2), cy - ra * Math.sin(a2), 'component'));
}
// Screen direction of each named position on a nose-up top view.
const DIR = { nose: [0, -1], left: [-1, 0], tail: [0, 1], right: [1, 0] };
const NAME = { nose: 'OVER THE NOSE', left: 'LEFT SIDE', tail: 'OVER THE TAIL', right: 'RIGHT SIDE' };
const STICK = { nose: 'forward', left: 'left', tail: 'aft', right: 'right' };

/* ---------- Figure 1: the blade's relative wind ---------- */
function setupBlade(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const station = Number(f.station.value), pitch = Number(f.pitch.value), induced = Number(f.induced.value);
    setOut(root, 'station', `${Math.round(station * 100)}% of radius`);
    setOut(root, 'pitch', `${pitch}°`);
    setOut(root, 'induced', `${induced} ft/s`);
    const b = bladeElement({ station, pitch, induced });
    svg.replaceChildren(frame(660, 380));
    // Left: the disk from above with the blade and the chosen station.
    const cx = 120, cy = 190, R = 90;
    disk(svg, cx, cy, R);
    svg.append(el('line', { x1: cx, y1: cy, x2: cx + R, y2: cy, class: 'ln heavy' }));
    svg.append(el('circle', { cx: cx + station * R, cy, r: 5, class: 'pointer' }));
    svg.append(label(cx, 60, 'ROTOR FROM ABOVE', 'lbl small', { 'text-anchor': 'middle' }));
    svg.append(label(cx + station * R, cy + 22, 'SECTION', 'lbl small on', { 'text-anchor': 'middle' }));
    // Right: the section end-on, moving left, so the rotational relative wind
    // flows to the right; induced flow tilts the resultant down by φ.
    const ox = 300, oy = 200, c = 230, phi = rad(b.inflow), th = rad(b.pitch);
    const pt = ([x, y]) => {
      const dx = (x - 0.25) * c, dy = y * c;
      return [ox + 0.25 * c + dx * Math.cos(th) + dy * Math.sin(th), oy - (-dx * Math.sin(th) + dy * Math.cos(th))];
    };
    svg.append(el('line', { x1: 270, y1: oy, x2: 640, y2: oy, class: 'ln dashed' }));
    svg.append(label(560, oy - 6, 'PLANE OF ROTATION', 'lbl small', { 'text-anchor': 'middle' }));
    svg.append(el('path', { d: `M${SECTION.map(pt).map((p) => p.join(' ')).join(' L')}Z`, class: 'section' }));
    const [lx, ly] = pt([0, 0]), [tx, ty] = pt([1, 0]);
    svg.append(el('line', { x1: lx - 40 * Math.cos(th), y1: ly - 40 * Math.sin(th), x2: tx + 70 * Math.cos(th), y2: ty + 70 * Math.sin(th), class: 'ln centreline' }));
    svg.append(label(tx + 74 * Math.cos(th) - 40, ty + 74 * Math.sin(th) + 18, 'CHORD LINE', 'lbl small'));
    svg.append(arrow(ox + 0.5 * c, 110, ox + 0.1 * c, 110, 'thrust'), label(ox + 0.1 * c, 100, 'BLADE MOVES', 'lbl small'));
    // Velocity triangle ahead of the leading edge, drawn true to angle.
    const L = 200, ax = 290, ay = 300;
    svg.append(arrow(ax, ay, ax + L, ay, 'component'), label(ax, ay + L * Math.tan(phi) + 30, `ROTATIONAL RELATIVE WIND ${r0(b.rotational)} KT`, 'lbl small'));
    const drop = L * Math.tan(phi);
    svg.append(arrow(ax + L, ay, ax + L, ay + drop, 'component'));
    svg.append(arrow(ax, ay, ax + L, ay + drop, 'wind'), label(ax + L + 8, ay + Math.max(drop, 4) + 4, `INDUCED FLOW ${induced} FT/S`, 'lbl small'));
    svg.append(label(ax + 40, ay - 10, `RESULTANT RELATIVE WIND, φ ${f1(b.inflow)}° BELOW THE PLANE`, 'lbl small on'));
    // The same resultant at the section, and the angles.
    svg.append(arrow(lx - 120 * Math.cos(phi), ly - 120 * Math.sin(phi), lx - 12 * Math.cos(phi), ly - 12 * Math.sin(phi), 'wind'));
    svg.append(label(470, 40, `PITCH (INCIDENCE) ${f1(b.pitch)}°`, 'lbl small'));
    svg.append(label(470, 56, `INFLOW ANGLE φ ${f1(b.inflow)}°`, 'lbl small'));
    svg.append(label(470, 74, `ANGLE OF ATTACK ${f1(b.aoa)}°`, b.stalled ? 'lbl on' : 'lbl'));
    if (b.stalled) svg.append(label(470, 90, `PAST ABOUT ${CRITICAL_AOA}°: STALLED`, 'lbl small on'));
    svg.append(label(14, 370, `EXAMPLE ROTOR ${ROTOR.radius} FT, ${ROTOR.rpm} RPM, ${-ROTOR.twist}° TWIST (INVENTED). INDUCED FLOW TAKEN AS EVEN ACROSS THE DISK.`, 'lbl small'));
    say(out, [
      `At ${Math.round(station * 100)}% of the radius the blade meets the air at ${r0(b.rotational)} kt from its own rotation; the tip runs at ${r0(bladeElement({ station: 1, pitch, induced }).rotational)} kt.`,
      `Induced flow of ${induced} ft/s tilts the relative wind ${f1(b.inflow)}° downward, so a pitch of ${f1(b.pitch)}° gives an angle of attack of only ${f1(b.aoa)}°${b.stalled ? `, beyond the critical angle of about ${CRITICAL_AOA}°: this part of the blade is stalled` : ''}.`,
      induced === 0 ? 'With no induced flow, angle of attack and pitch are the same.' : 'Less induced flow, from forward speed or ground effect, raises the angle of attack for the same pitch.',
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 2: cyclic and gyroscopic precession ---------- */
function setupCyclic(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const direction = root.querySelector('input[name="stick"]:checked').value;
    const c = cyclicPitch(direction);
    svg.replaceChildren(frame(660, 360));
    const cx = 180, cy = 185, R = 120;
    disk(svg, cx, cy, R);
    svg.append(el('path', { d: `M${cx} ${cy - 26} L${cx - 10} ${cy - 6} L${cx - 6} ${cy + 30} L${cx + 6} ${cy + 30} L${cx + 10} ${cy - 6}Z`, class: 'own' }));
    svg.append(label(cx, 30, 'NOSE ↑   ROTOR TURNS COUNTERCLOCKWISE FROM ABOVE', 'lbl small', { 'text-anchor': 'middle' }));
    const at = (p, k = 1) => [cx + DIR[p][0] * R * k, cy + DIR[p][1] * R * k];
    for (const p of POSITIONS) svg.append(el('circle', { cx: at(p)[0], cy: at(p)[1], r: 5, class: 'dot' }));
    const tag = (p, text, cls) => {
      // Side labels sit above their dot so they stay inside the frame.
      const [x, y] = at(p, 1.0);
      const dy = DIR[p][1] === 0 ? -12 : DIR[p][1] * 16 + (DIR[p][1] > 0 ? 6 : 0);
      svg.append(label(x, y + dy, text, cls, { 'text-anchor': 'middle' }));
    };
    tag(c.leastPitch, 'LEAST PITCH', 'lbl small');
    tag(c.mostPitch, 'MOST PITCH', 'lbl small');
    // Each tilt label sits 90° on in rotation from the pitch change behind it.
    const [dx, dy] = at(c.tiltDown, 0.62), [ux, uy] = at(c.tiltUp, 0.62);
    svg.append(label(dx, dy + 4, 'LOWEST', 'lbl small on', { 'text-anchor': 'middle' }));
    svg.append(label(ux, uy + 4, 'HIGHEST', 'lbl small on', { 'text-anchor': 'middle' }));
    svg.append(arrow(cx, cy, cx + DIR[c.tiltDown][0] * 70, cy + DIR[c.tiltDown][1] * 70, 'thrust'));
    // Side or rear view of the tilted disk and its thrust.
    const sx = 500, sy = 210, half = 110, tilt = 10;
    const fore = c.tiltDown === 'nose' || c.tiltDown === 'tail';
    const sign = c.tiltDown === 'nose' || c.tiltDown === 'left' ? -1 : 1; // which end goes down on screen
    svg.append(label(sx, 280, fore ? 'SEEN FROM THE LEFT (NOSE ←)' : 'SEEN FROM BEHIND (LEFT ←)', 'lbl small', { 'text-anchor': 'middle' }));
    const a = rad(tilt) * (sign < 0 ? 1 : -1);
    svg.append(el('line', { x1: sx - half * Math.cos(a), y1: sy - 60 + half * Math.sin(a), x2: sx + half * Math.cos(a), y2: sy - 60 - half * Math.sin(a), class: 'ln heavy' }));
    svg.append(el('line', { x1: sx, y1: sy - 60, x2: sx, y2: sy + 10, class: 'ln' }));
    svg.append(el('rect', { x: sx - 40, y: sy + 10, width: 80, height: 34, rx: 10, class: 'plate' }));
    svg.append(arrow(sx, sy - 60, sx + 110 * Math.sin(-a), sy - 60 - 110 * Math.cos(a), 'lift'), label(sx + 110 * Math.sin(-a) + 6, sy - 170, 'ROTOR THRUST', 'lbl small on'));
    svg.append(label(sx, 300, 'DISK TILTS TOWARD THE STICK; THRUST TILTS WITH IT', 'lbl small', { 'text-anchor': 'middle' }));
    svg.append(label(14, 350, 'BLADE PITCH CHANGES AT THE DOTS; THE FLAPPING IT CAUSES PEAKS ABOUT 90° LATER IN ROTATION', 'lbl small'));
    say(out, [
      `Cyclic ${STICK[direction]}: the swashplate gives each blade its least pitch ${NAME[c.leastPitch].toLowerCase()} and its most ${NAME[c.mostPitch].toLowerCase()}.`,
      `A blade with less pitch makes less lift and flaps down, but the rotor acts like a gyroscope, so the lowest point comes about 90° later in rotation: ${NAME[c.tiltDown].toLowerCase()}. The disk tilts ${STICK[direction]}, the same way the stick moved, and its thrust tilts with it.`,
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 3: power required and power available ---------- */
function setupPower(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const speed = Number(f.speed.value), weight = Number(f.weight.value), alt = Number(f.alt.value);
    setOut(root, 'speed', `${speed} kt`); setOut(root, 'weight', `${r0(weight)} lb`); setOut(root, 'alt', `${r0(alt)} ft`);
    const rho = densityAt(alt), p = powerRequired({ speed, weight, rho }), c = powerCurve({ weight, rho });
    svg.replaceChildren(frame(660, 400));
    const box = plot(svg, { x: 80, y: 30, w: 540, h: 300, xr: [0, 180], yr: [0, 2600], xticks: range(0, 180, 20), yticks: range(0, 2600, 500), xlabel: 'TRUE AIRSPEED (KT)', ylabel: 'SHAFT HORSEPOWER' });
    const at = (key) => (s) => powerRequired({ speed: s, weight, rho })[key];
    svg.append(el('path', { d: box.path(at('induced'), 0, 180), class: 'ghost' }));
    svg.append(el('path', { d: box.path(at('parasite'), 0, 180), class: 'ghost' }));
    svg.append(el('path', { d: box.path(at('profile'), 0, 180), class: 'ghost' }));
    svg.append(el('path', { d: box.path(at('total'), 0, 180), class: 'track' }));
    const avail = powerAvailable(rho);
    svg.append(el('line', { x1: box.X(0), y1: box.Y(avail), x2: box.X(180), y2: box.Y(avail), class: 'mark-line on' }));
    svg.append(label(box.X(180) - 4, box.Y(avail) - 6, `POWER AVAILABLE ${r0(avail)} SHP`, 'lbl small on', { 'text-anchor': 'end' }));
    svg.append(label(box.X(150), box.Y(at('induced')(150)) - 6, 'INDUCED', 'lbl small'));
    svg.append(label(box.X(165), box.Y(at('parasite')(165)) - 6, 'PARASITE', 'lbl small', { 'text-anchor': 'end' }));
    svg.append(label(box.X(4), box.Y(at('profile')(0)) - 6, 'PROFILE', 'lbl small'));
    svg.append(el('line', { x1: box.X(c.vy), y1: box.Y(0), x2: box.X(c.vy), y2: box.Y(c.minPower), class: 'mark-line' }));
    svg.append(label(box.X(c.vy), box.Y(c.minPower) + 18, `MINIMUM POWER ${r0(c.vy)} KT`, 'lbl small', { 'text-anchor': 'middle' }));
    if (c.vh !== null && c.vh < 180) {
      svg.append(el('line', { x1: box.X(c.vh), y1: box.Y(0), x2: box.X(c.vh), y2: box.Y(avail), class: 'mark-line' }));
      svg.append(label(box.X(c.vh) - 4, box.Y(0) - 6, `TOP LEVEL SPEED ${r0(c.vh)} KT`, 'lbl small', { 'text-anchor': 'end' }));
    }
    svg.append(el('circle', { cx: box.X(speed), cy: box.Y(p.total), r: 6, class: 'pointer' }));
    svg.append(label(14, 392, 'INVENTED HELICOPTER, OUT OF GROUND EFFECT, STILL AIR. FAINT: THE PARTS OF POWER REQUIRED', 'lbl small'));
    const margin = avail - p.total;
    say(out, [
      `At ${speed} kt, ${r0(weight)} lb and ${r0(alt)} ft density altitude the rotor needs ${r0(p.total)} shp: ${r0(p.induced)} induced, ${r0(p.profile)} profile and ${r0(p.parasite)} parasite.`,
      margin >= 0 ? `${r0(margin)} shp is left over to climb or accelerate.` : `That is ${r0(-margin)} shp more than the engine can give here: this speed cannot be held level.`,
      c.canHover
        ? `Hovering out of ground effect takes ${r0(c.hover)} shp, the most of any speed; least is ${r0(c.minPower)} shp at ${r0(c.vy)} kt.`
        : `Hovering out of ground effect would take ${r0(c.hover)} shp, more than the ${r0(avail)} available: this weight is above the hover ceiling here, though it can still fly once moving${c.vh === null ? '' : ` between about ${r0(c.vy)} and ${r0(c.vh)} kt, where translational lift has cut the power needed`}.`,
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 4: dissymmetry of lift ---------- */
function setupRotor(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const cx = 170, cy = 200, R = 140, PX = 0.2; // disk centre and radius; arrow px per knot
  function draw() {
    const speed = Number(f.speed.value);
    setOut(root, 'speed', `${speed} kt`);
    const s = rotorSpeeds({ speed });
    svg.replaceChildren(frame(660, 380));
    // Top view: nose up, rotor turning counterclockwise, so the advancing blade is on the right.
    const rr = s.reverseRadius / ROTOR.radius * R;
    disk(svg, cx, cy, R);
    if (rr > 0.5) svg.append(el('circle', { cx: cx - rr / 2, cy, r: rr / 2, class: 'zone hatch' }));
    svg.append(el('line', { x1: cx - R, y1: cy, x2: cx + R, y2: cy, class: 'ln dashed' }));
    svg.append(label(cx, 24, 'FLIGHT DIRECTION ↑', 'lbl small', { 'text-anchor': 'middle' }));
    svg.append(label(cx + R, cy + R + 6, 'ADVANCING SIDE', 'lbl small', { 'text-anchor': 'end' }));
    svg.append(label(cx - R, cy + R + 6, 'RETREATING SIDE', 'lbl small'));
    // Blade airspeed at four stations on each side: forward on the right, aft on the left.
    const omega = s.tip / ROTOR.radius; // knots per foot of radius
    for (const k of [0.25, 0.5, 0.75, 1]) {
      const r = k * ROTOR.radius, x = k * R;
      const adv = omega * r + speed, ret = omega * r - speed;
      svg.append(arrow(cx + x, cy, cx + x, cy - adv * PX, 'lift'));
      svg.append(arrow(cx - x, cy, cx - x, cy + ret * PX, ret < 0 ? 'drag' : 'lift'));
    }
    if (rr > 0.5) svg.append(label(cx - R + 24, cy - 40, 'SHADED: REVERSE FLOW', 'lbl small'));
    // Spanwise airspeed: negative where the air meets the retreating blade from behind.
    const box = plot(svg, { x: 400, y: 40, w: 230, h: 270, xr: [-1, 1], yr: [-200, 700], xticks: [-1, -0.5, 0, 0.5, 1], yticks: range(-200, 700, 100), xlabel: 'SPAN: RETREATING TIP – HUB – ADVANCING TIP', ylabel: 'BLADE AIRSPEED (KT), < 0 REVERSE', xfmt: (v) => (v === 0 ? 'HUB' : `${Math.abs(v)} R`) });
    svg.append(el('line', { x1: box.X(-1), y1: box.Y(0), x2: box.X(1), y2: box.Y(0), class: 'mark-line' }));
    // Each half is a straight line: Ω r + V on the advancing side, Ω r − V on the retreating side.
    svg.append(el('path', { d: box.path((v) => omega * ROTOR.radius * -v - speed, -1, 0), class: 'track' }));
    svg.append(el('path', { d: box.path((v) => omega * ROTOR.radius * v + speed, 0, 1), class: 'track' }));
    svg.append(el('path', { d: box.path((v) => omega * ROTOR.radius * Math.abs(v), -1, 1), class: 'ghost' }));
    svg.append(el('circle', { cx: box.X(1), cy: box.Y(s.advancing), r: 5, class: 'pointer' }));
    svg.append(el('circle', { cx: box.X(-1), cy: box.Y(s.retreating), r: 5, class: 'pointer' }));
    svg.append(label(box.X(1) - 4, box.Y(s.advancing) - 10, `M ${f2(s.advancingMach)}`, 'lbl small on', { 'text-anchor': 'end' }));
    svg.append(label(14, 370, `EXAMPLE ROTOR ${ROTOR.radius} FT RADIUS, ${ROTOR.rpm} RPM (INVENTED). FAINT LINE: HOVER. M: ADVANCING TIP MACH, SEA LEVEL`, 'lbl small'));
    say(out, [
      speed === 0
        ? `In a hover both sides meet the air at the same speed: ${r0(s.tip)} kt at the tips. Lift is even across the disk.`
        : `At ${speed} kt the advancing tip meets the air at ${r0(s.advancing)} kt (Mach ${f2(s.advancingMach)} at sea level) and the retreating tip at ${r0(s.retreating)} kt.`,
      s.tipLiftRatio === null
        ? 'The whole retreating blade is in reverse flow: far outside any helicopter\'s envelope.'
        : speed === 0 ? 'Move the slider to fly forward.' : `At the same blade angle the advancing tip would make about ${f1(s.tipLiftRatio)} times the lift of the retreating tip. Flapping evens it out: the advancing blade flaps up, losing angle of attack, and the retreating blade flaps down, gaining it.`,
      speed === 0 ? '' : `Inboard of ${f1(s.reverseRadius)} ft on the retreating side the air meets the blade from its trailing edge (advance ratio ${f2(s.mu)}). The faster you fly, the more angle of attack the retreating blade needs, until it stalls.`,
    ].filter(Boolean));
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 5: vortex ring state ---------- */
function setupVortex(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  function draw() {
    const descent = Number(f.descent.value), speed = Number(f.speed.value), power = Number(f.power.value);
    setOut(root, 'descent', `${r0(descent)} fpm`); setOut(root, 'speed', `${speed} kt`); setOut(root, 'power', `${power}%`);
    const v = vortexRingCheck({ descent, speed, power });
    svg.replaceChildren(frame(660, 340));
    // Rotor seen from the side, descending; tip vortices grow into rings when all three conditions hold.
    const cx = 150, cy = 140, half = 100;
    svg.append(el('line', { x1: cx - half, y1: cy, x2: cx + half, y2: cy, class: 'ln heavy' }));
    svg.append(el('line', { x1: cx, y1: cy, x2: cx, y2: cy + 30, class: 'ln' }));
    svg.append(el('rect', { x: cx - 50, y: cy + 30, width: 100, height: 40, rx: 12, class: 'plate' }));
    const ring = v.likely ? 34 : v.descending && v.powered ? 20 : 10;
    for (const s of [-1, 1]) {
      svg.append(el('ellipse', { cx: cx + s * half, cy: cy + 4, rx: ring, ry: ring * 0.8, class: v.likely ? 'angle' : 'thin' }));
      svg.append(arrow(cx + s * (half - ring * 0.6), cy - ring * 0.5, cx + s * (half + ring * 0.2), cy - ring * 0.75, 'component'));
    }
    for (const x of [-60, -20, 20, 60]) svg.append(arrow(cx + x, cy + 80, cx + x, cy + 80 + 24, 'component'));
    const sink = Math.min(80, descent / 20);
    svg.append(arrow(cx + 165, cy - 10, cx + 165, cy - 10 + sink, 'weight'), label(cx + 165, cy + sink + 6, 'DESCENT', 'lbl small', { 'text-anchor': 'middle' }));
    if (speed > 0) svg.append(arrow(cx - 150, cy - 70, cx - 150 + Math.min(100, speed * 3), cy - 70, 'thrust'));
    svg.append(label(cx - 150, cy - 80, `${speed} KT`, 'lbl small'));
    // The three conditions.
    const rows = [
      [v.descending, 'VERTICAL OR NEAR-VERTICAL DESCENT ≥ 300 FPM'],
      [v.powered, 'ROTOR USING 20–100% OF AVAILABLE POWER'],
      [v.belowEtl, `SLOWER THAN ETL (ABOUT ${ETL[0]}–${ETL[1]} KT)`],
    ];
    rows.forEach(([ok, text], i) => {
      svg.append(el('rect', { x: 340, y: 60 + i * 50, width: 22, height: 22, class: ok ? 'plate active' : 'plate' }));
      svg.append(label(351, 76 + i * 50, ok ? '✓' : '–', 'lbl', { 'text-anchor': 'middle' }));
      svg.append(label(372, 76 + i * 50, text, ok ? 'lbl small on' : 'lbl small'));
    });
    svg.append(label(340, 230, v.likely ? 'ALL THREE: VORTEX RING STATE LIKELY' : 'NOT ALL THREE: VORTEX RING STATE UNLIKELY', v.likely ? 'lbl on' : 'lbl'));
    svg.append(label(14, 330, 'SCHEMATIC. CONDITIONS FROM THE FAA HELICOPTER FLYING HANDBOOK', 'lbl small'));
    say(out, [
      v.likely
        ? 'All three conditions hold: the rotor is settling into its own downwash. More collective would only enlarge the stalled area and the descent.'
        : `Not all three hold${v.atEtl ? `: at ${speed} kt the rotor is at the edge of ETL, so do not count on clean air yet` : ''}.`,
      v.likely
        ? 'Recover by gaining airspeed (forward cyclic) and/or partially lowering collective, or with lateral cyclic and more power (the Vuichard technique), as your flight manual directs.'
        : !v.descending ? 'Descending slower than about 300 fpm, the rotor stays ahead of its own downwash.' : !v.powered ? 'With little or no power the flow is up through the rotor, as in an autorotation.' : 'Moving faster than ETL, the rotor flies into clean air and leaves its vortices behind.',
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 6: autorotation regions ---------- */
function setupAuto(root) {
  const f = fields(root), svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const words = { '-3': 'well down', '-2': 'down', '-1': 'slightly down', 0: 'balanced', 1: 'slightly up', 2: 'up', 3: 'well up' };
  function draw() {
    const c = Number(f.collective.value);
    setOut(root, 'collective', words[c]);
    const r = autorotationRegions(c);
    svg.replaceChildren(frame(660, 340));
    // Top view: concentric regions, stall at the hub, driven at the tips.
    const cx = 150, cy = 170, R = 130;
    svg.append(el('circle', { cx, cy, r: R, class: 'plate' }));
    svg.append(el('circle', { cx, cy, r: R * r.drivenEdge, class: 'plate active' }));
    svg.append(el('circle', { cx, cy, r: R * r.stallEdge, class: 'zone hatch' }));
    svg.append(label(cx, cy + 4, 'STALL', 'lbl small', { 'text-anchor': 'middle' }));
    svg.append(label(cx, cy - R * (r.stallEdge + r.drivenEdge) / 2 + 4, 'DRIVING', 'lbl small on', { 'text-anchor': 'middle' }));
    svg.append(label(cx, cy - R * (r.drivenEdge + 1) / 2 + 4, 'DRIVEN', 'lbl small', { 'text-anchor': 'middle' }));
    svg.append(label(cx, 26, 'VERTICAL AUTOROTATION, ROTOR FROM ABOVE', 'lbl small', { 'text-anchor': 'middle' }));
    // One blade, hub to tip, as a bar.
    const bx = 330, by = 120, bw = 300, bh = 34;
    const seg = (from, to, cls, text) => {
      svg.append(el('rect', { x: bx + from * bw, y: by, width: (to - from) * bw, height: bh, class: cls }));
      svg.append(label(bx + (from + to) / 2 * bw, by + bh + 18, text, 'lbl small', { 'text-anchor': 'middle' }));
      svg.append(label(bx + (from + to) / 2 * bw, by + 22, `${Math.round((to - from) * 100)}%`, 'lbl small', { 'text-anchor': 'middle' }));
    };
    seg(0, r.stallEdge, 'zone hatch', 'STALL');
    seg(r.stallEdge, r.drivenEdge, 'plate active', 'DRIVING');
    seg(r.drivenEdge, 1, 'plate', 'DRIVEN');
    svg.append(label(bx, by - 10, 'HUB', 'lbl small'), label(bx + bw, by - 10, 'TIP', 'lbl small', { 'text-anchor': 'end' }));
    const trend = { falling: 'ROTOR RPM FALLING', rising: 'ROTOR RPM RISING', steady: 'ROTOR RPM STEADY' }[r.rpm];
    svg.append(label(bx, 230, trend, r.rpm === 'steady' ? 'lbl' : 'lbl on'));
    svg.append(label(14, 330, 'BALANCED SIZES FROM THE FAA HANDBOOK; THEIR MOVEMENT WITH COLLECTIVE IS ILLUSTRATIVE', 'lbl small'));
    say(out, [
      c === 0
        ? 'Balanced: the driving region\'s forward pull equals the drag of the driven and stall regions, so rotor rpm holds.'
        : c > 0
          ? 'Raising the collective adds pitch everywhere: the equilibrium points move inboard, the driven and stall regions grow, the driving region shrinks and rotor rpm falls.'
          : 'Lowering the collective takes pitch off: the driving region grows at the expense of the driven and stall regions, and rotor rpm rises.',
      `Stall ${Math.round(r.stall * 100)}%, driving ${Math.round(r.driving * 100)}%, driven ${Math.round(r.driven * 100)}% of the radius.`,
    ]);
  }
  root.addEventListener('input', draw);
  draw();
}

const SETUP = { blade: setupBlade, cyclic: setupCyclic, power: setupPower, rotor: setupRotor, vortex: setupVortex, auto: setupAuto };
for (const root of document.querySelectorAll('[data-lesson]')) {
  const setup = SETUP[root.dataset.lesson];
  if (!setup) continue;
  try { setup(root); root.classList.add('ready'); } catch (error) { console.error(error); }
}
