// Presentation for the Airfield Operations module's interactive blocks. All
// numbers come from lesson-model.mjs; this file only reads inputs and draws.
import {
  GEAR_DISK, LENS_HALF, LIGHT_SIGNALS, NM, RED_CELL, SM, TOUCHDOWN_GROUPS, baseBearing, ends, gearDisks, heightOnPath, markingsFor,
  meatball, norm, overhead, papi, parallelNames, pathAngle, pattern, radioCalls, runwayForWind, runwayLights, thresholdStripes,
  windComponents,
} from './lesson-model.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const rad = (d) => d * Math.PI / 180;
const r0 = (v) => Math.round(v).toLocaleString('en-US');
const r10 = (v) => r0(Math.round(v / 10) * 10);
const hdg = (d) => String(Math.round(norm(d))).padStart(3, '0');
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
const para = (lines) => lines.map((t) => Object.assign(document.createElement('p'), { textContent: t }));
const fields = (root) => Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
const checked = (root, name) => root.querySelector(`input[name="${name}"]:checked`)?.value;
const setOut = (root, name, text) => { const o = root.querySelector(`output[for="${name}"]`); if (o) o.textContent = text; };
const pathOf = (pts) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');

// Top-view light aircraft, nose up, about 22 units long; rotated to heading.
const PLANE = 'M0 -11 L1.6 -6 L1.6 -3 L11 -1 L11 1.5 L1.6 1.5 L1.2 7 L4.5 9 L4.5 10.5 L0 10 L-4.5 10.5 L-4.5 9 L-1.2 7 L-1.6 1.5 L-11 1.5 L-11 -1 L-1.6 -3 L-1.6 -6 Z';
const plane = (x, y, heading, cls = 'acft') => el('path', { d: PLANE, class: cls, transform: `translate(${x} ${y}) rotate(${heading})` });
const SIDE = 'M-12 -1 L7 -2.5 L12 0 L7 2.5 L-12 2 Z M-12 -1 L-15 -8 L-11 -8 L-7 -1.5 Z';

// Runway number painted for the approach to a given landing direction: the
// top of the figures points the way the aircraft lands.
const paintNumber = (x, y, landing, label, size = 18) =>
  el('text', { x: 0, y: 0, transform: `translate(${x} ${y}) rotate(${landing})`, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'rwy-num', 'font-size': size }, label);

/* ---------- Figure callouts (static figures) ---------- */
function setupCallouts(root) {
  const items = [...root.querySelectorAll('[data-callout]')];
  const parts = [...root.querySelectorAll('svg [data-part]')];
  for (const button of root.querySelectorAll('button[data-show]')) {
    button.addEventListener('click', () => {
      const show = button.dataset.show;
      for (const b of root.querySelectorAll('button[data-show]')) b.setAttribute('aria-pressed', String(b === button));
      for (const p of parts) p.classList.toggle('active', p.dataset.part === show);
      for (const i of items) i.classList.toggle('active', i.dataset.callout === show);
    });
  }
}

/* ---------- Figure 2: runway numbers ---------- */
function setupNumbers(root) {
  const f = fields(root);
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  function draw() {
    const az = Number(f.azimuth.value);
    const count = Number(checked(root, 'count'));
    setOut(root, 'azimuth', `${hdg(az)}° magnetic`);
    const [a, b] = ends(az);
    const names = parallelNames(az, count);
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 438, class: 'frame' }));
    const cx = 320, cy = 225, R = 190;
    // Compass ring, magnetic.
    svg.append(el('circle', { cx, cy, r: R, class: 'thin' }));
    for (let d = 0; d < 360; d += 10) {
      const long = d % 30 === 0;
      const s = Math.sin(rad(d)), c = -Math.cos(rad(d));
      svg.append(el('line', { x1: cx + R * s, y1: cy + R * c, x2: cx + (R - (long ? 12 : 6)) * s, y2: cy + (R - (long ? 12 : 6)) * c, class: 'thin' }));
      if (long) svg.append(el('text', { x: cx + (R - 24) * s, y: cy + (R - 24) * c + 4, 'text-anchor': 'middle', class: 'lbl small' }, { 0: 'N', 90: 'E', 180: 'S', 270: 'W' }[d] ?? String(d / 10)));
    }
    const dir = [Math.sin(rad(az)), -Math.cos(rad(az))];
    const right = [Math.cos(rad(az)), Math.sin(rad(az))];
    const half = 130, w = 22, gap = 34;
    names.forEach((n, i) => {
      const o = (i - (count - 1) / 2) * gap;
      const mx = cx + right[0] * o, my = cy + right[1] * o;
      const p = (along, across) => [mx + dir[0] * along + right[0] * across, my + dir[1] * along + right[1] * across];
      svg.append(el('path', { d: pathOf([p(-half, -w / 2), p(half, -w / 2), p(half, w / 2), p(-half, w / 2)]) + 'Z', class: 'rwy' }));
      svg.append(el('path', { d: pathOf([p(-half + 40, 0), p(half - 40, 0)]), class: 'rwy-cl' }));
      // Landing toward az, the threshold is at the −dir end; the reciprocal at +dir.
      const [nx, ny] = p(-half + 18, 0), [fx, fy] = p(half - 18, 0);
      svg.append(paintNumber(nx, ny, az, n.near, 13), paintNumber(fx, fy, az + 180, n.far, 13));
    });
    // Approach arrow toward runway a.
    const t = [cx - dir[0] * (half + 46), cy - dir[1] * (half + 46)];
    svg.append(el('path', { d: `M${t[0] - dir[0] * 30} ${t[1] - dir[1] * 30} L${t[0]} ${t[1]}`, class: 'ln heavy', 'marker-end': 'url(#ao-arrow)' }));
    svg.append(el('defs', {}), el('text', { x: 14, y: 24, class: 'lbl small' }, `LANDING ${hdg(az)}° = RUNWAY ${a} · OPPOSITE END ${hdg(az + 180)}° = RUNWAY ${b}`));
    svg.querySelector('defs').append(Object.assign(el('marker', { id: 'ao-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' }), {}));
    svg.querySelector('#ao-arrow').append(el('path', { d: 'M0 0 L10 5 L0 10 Z', class: 'fixmark' }));
    const tenth = norm(az) / 10;
    out.replaceChildren(...para([
      `Magnetic azimuth ${hdg(az)}°: one-tenth is ${tenth.toFixed(1)}, and the nearest whole number is ${Math.round(tenth)}${Math.round(tenth) === 0 ? ', written 36' : ''}: runway ${a}. The other end points ${hdg(az + 180)}°: runway ${b}.`,
      count > 1 ? `With ${count} parallel runways the letters run left to right as seen on the approach: ${names.map((n) => n.near).join(', ')}. From the other end the same strips are ${names.map((n) => n.far).reverse().join(', ')}, so the left runway from one end is the right runway from the other.` : 'A single runway has no letter.',
      Number.isInteger(tenth * 2) && !Number.isInteger(tenth) ? `An azimuth ending in 5 could be designated either way, ${Math.floor(tenth) || 36} or ${Math.ceil(tenth)} (AIM 4-3-6); this figure shows the higher number.` : '',
    ].filter(Boolean)));
  }
  root.addEventListener('input', draw);
  root.addEventListener('change', draw);
  draw();
}

/* ---------- Figure 3: runway markings ---------- */
function setupMarkings(root) {
  const f = fields(root);
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  function draw() {
    const type = checked(root, 'rtype');
    const width = Number(f.width.value);
    const displaced = f.displaced.checked, blast = f.blast.checked, gear = f.gear.checked;
    f.jet.closest('label').hidden = type !== 'visual';
    f.intl.closest('label').hidden = type !== 'visual';
    const marks = markingsFor(type, { international: f.intl.checked, jet4000: f.jet.checked });
    const has = (m) => marks.includes(m);
    // x: 0.15 px per ft along the runway; y: 0.6 px per ft across (4× exaggerated).
    const sx = 0.15, sy = 0.6, x0 = 70, cy = 140;
    const disp = displaced ? 600 : 0;
    const X = (ft) => x0 + ft * sx, Y = (ft) => cy + ft * sy;
    const hw = width / 2;
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 318, class: 'frame' }));
    svg.append(el('rect', { x: 2, y: 2, width: 636, height: 314, class: 'grass' }));
    if (blast) {
      svg.append(el('rect', { x: X(-300), y: Y(-hw), width: 300 * sx, height: width * sy, class: 'rwy' }));
      for (let i = 0; i < 3; i++) {
        const x = X(-260 + i * 80);
        svg.append(el('path', { d: `M${x} ${Y(-hw + 6)} L${x + 22} ${cy} L${x} ${Y(hw - 6)}`, class: 'paint-yellow-line' }));
      }
      svg.append(el('rect', { x: X(0) - 1.5, y: Y(-hw), width: 3, height: width * sy, class: 'paint-yellow' }));
    }
    svg.append(el('rect', { x: X(0), y: Y(-hw), width: 3600 * sx, height: width * sy, class: 'rwy' }));
    const T = disp; // landing threshold
    if (displaced) {
      // Arrows on the centreline before the displaced threshold, arrowheads at the bar, and the 10 ft bar.
      for (let ft = 60; ft < disp - 80; ft += 160) svg.append(el('path', { d: `M${X(ft)} ${cy} H${X(ft + 100)} M${X(ft + 100) - 6} ${cy - 4} L${X(ft + 100)} ${cy} L${X(ft + 100) - 6} ${cy + 4}`, class: 'paint-line' }));
      for (const off of [-hw * 0.5, 0, hw * 0.5]) svg.append(el('path', { d: `M${X(disp - 40)} ${Y(off) - 6} L${X(disp - 10)} ${Y(off)} L${X(disp - 40)} ${Y(off) + 6} Z`, class: 'paint' }));
      svg.append(el('rect', { x: X(disp), y: Y(-hw), width: 10 * sx + 1.5, height: width * sy, class: 'paint' }));
    }
    let along = T + 40;
    if (has('threshold')) {
      const n = thresholdStripes(width);
      const band = width - 6, slot = band / (n + 2); // stripes split either side of the centreline
      const stripes = [];
      for (let i = 0; i < n; i++) {
        const k = i < n / 2 ? i : i + 2; // leave a gap at the centreline
        stripes.push(-hw + 3 + slot * (k + 0.5));
      }
      for (const yft of stripes) svg.append(el('rect', { x: X(along), y: Y(yft - slot * 0.32), width: 150 * sx, height: slot * 0.64 * sy, class: 'paint' }));
      along += 150 + 40;
    }
    if (has('designation')) { svg.append(paintNumber(X(along + 30), cy, 90, '9', 22)); along += 100; }
    if (has('centerline')) for (let ft = along + 20; ft < 3560; ft += 200) svg.append(el('rect', { x: X(ft), y: cy - 1.2, width: 120 * sx, height: 2.4, class: 'paint' }));
    if (has('aiming')) for (const s of [-1, 1]) svg.append(el('rect', { x: X(T + 1000), y: Y(s * hw * 0.42) - (s < 0 ? width * 0.18 * sy : 0), width: 150 * sx, height: width * 0.18 * sy, class: 'paint' }));
    if (has('touchdown')) for (const g of TOUCHDOWN_GROUPS) {
      if (g.aiming) continue;
      for (const s of [-1, 1]) for (let i = 0; i < g.bars; i++) {
        const y = s * (hw * 0.18 + i * hw * 0.11);
        svg.append(el('rect', { x: X(T + g.at), y: Y(y) - 2, width: 75 * sx, height: 4, class: 'paint' }));
      }
    }
    if (has('sides')) for (const s of [-1, 1]) svg.append(el('rect', { x: X(T), y: Y(s * (hw - 2)) - 1.5, width: (3600 - T) * sx, height: 3, class: 'paint' }));
    // Arresting gear: a line of yellow disks across the runway at the pendant, and a sign each side.
    const gearAt = T + GEAR_AT;
    if (gear) {
      for (const yft of gearDisks(width)) svg.append(el('ellipse', { cx: X(gearAt), cy: Y(yft), rx: Math.max(1.5, GEAR_DISK / 2 * sx), ry: GEAR_DISK / 2 * sy, class: 'paint-yellow' }));
      svg.append(el('path', { d: `M${X(gearAt)} ${Y(-hw)} V${Y(hw)}`, class: 'thin' }));
      for (const s of [-1, 1]) {
        const y = s < 0 ? Y(-hw) - 26 : Y(hw) + 8;
        svg.append(el('rect', { x: X(gearAt) - 9, y, width: 18, height: 18, class: 'sign-black' }), el('circle', { cx: X(gearAt), cy: y + 9, r: 6, class: 'paint-yellow' }));
      }
      svg.append(el('text', { x: X(gearAt) + 14, y: Y(-hw) - 12, class: 'lbl small' }, 'ARRESTING GEAR PENDANT'));
    }
    // Distance scale from the landing threshold.
    for (let ft = 0; ft <= 3000; ft += 500) {
      svg.append(el('path', { d: `M${X(T + ft)} ${Y(hw) + 12} v8`, class: 'thin' }));
      svg.append(el('text', { x: X(T + ft), y: Y(hw) + 32, 'text-anchor': 'middle', class: 'lbl small' }, `${r0(ft)}`));
    }
    svg.append(el('text', { x: X(T), y: Y(hw) + 46, class: 'lbl small' }, 'FT FROM THE LANDING THRESHOLD'));
    if (!blast) svg.append(el('path', { d: `M24 ${cy} h34 M50 ${cy - 6} l8 6 l-8 6`, class: 'ln' }));
    svg.append(el('text', { x: 14, y: 24, class: 'lbl small' }, `${type.toUpperCase()} RUNWAY 9 · ${width} FT WIDE · LANDING TO THE RIGHT · WIDTH DRAWN 4× SCALE`));
    if (displaced) svg.append(el('text', { x: X(0), y: Y(-hw) - 10, class: 'lbl small' }, 'DISPLACED THRESHOLD AREA'));
    if (blast) svg.append(el('text', { x: X(-300), y: Y(hw) + 60, class: 'lbl small' }, 'BLAST PAD: YELLOW CHEVRONS'));
    const names = { designation: 'runway designation', centerline: 'centerline', threshold: `threshold stripes (${thresholdStripes(width)} for ${width} ft)`, aiming: 'aiming point (about 1,000 ft in)', touchdown: 'touchdown zone bars (500 ft coding)', sides: 'side stripes' };
    out.replaceChildren(...para([
      `${type[0].toUpperCase()}${type.slice(1)} runway: ${marks.map((m) => names[m]).join(', ')}.`,
      displaced ? 'Displaced threshold: white arrows lead along the centreline to a white threshold bar. The pavement behind it can be used to take off in either direction and to land from the opposite direction, but not to land over in this direction.' : '',
      gear ? `Arresting gear: a line of 10 ft yellow disks, ${gearDisks(width).length} across this ${width} ft runway at 30 ft centers, marks the pendant cable, with a yellow-circle-on-black sign each side. The cable sits on the runway here; most gear is in the overruns.` : '',
      blast ? 'Blast pad: yellow chevrons mark pavement aligned with the runway that cannot be used for landing, takeoff or taxiing; a yellow demarcation bar separates it from the runway.' : '',
    ].filter(Boolean)));
  }
  root.addEventListener('input', draw);
  root.addEventListener('change', draw);
  draw();
}

// Pendant position for the drawing only: each field publishes its own gear locations.
const GEAR_AT = 1800;

/* ---------- Figure 4: holding position ---------- */
function setupHold(root) {
  const f = fields(root);
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  function draw() {
    const way = checked(root, 'way');
    const pos = Number(f.pos.value); // ft of the aircraft's nose from the solid lines, + toward the runway
    // Entering, the solid lines come first; exiting, the aircraft reaches them last.
    const side = pos < 0 ? 'on the holding (solid-line) side' : 'on the runway side';
    setOut(root, 'pos', pos === 0 ? 'nose at the solid lines' : `nose ${r0(Math.abs(pos))} ft ${side} of the solid lines`);
    // Taxiway runs up the page into the runway. y screen = 300 − ft·0.9 (hold line at 300).
    const Yh = 300, s = 0.9, cx = 320;
    const Y = (ft) => Yh - ft * s;
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 438, class: 'frame' }), el('rect', { x: 2, y: 2, width: 636, height: 434, class: 'grass' }));
    svg.append(el('rect', { x: 2, y: Y(260), width: 636, height: 90, class: 'rwy' }));
    svg.append(el('path', { d: `M2 ${Y(215)} H638`, class: 'rwy-cl' }));
    svg.append(el('text', { x: 14, y: Y(245), class: 'lbl small rev' }, 'RUNWAY 9-27'));
    svg.append(el('rect', { x: cx - 40, y: Y(160), width: 80, height: 300, class: 'rwy' }));
    // Taxiway centreline with the enhanced dashes for 150 ft before the marking.
    svg.append(el('path', { d: `M${cx} ${Y(-170)} V${Y(160)}`, class: 'paint-yellow-line' }));
    for (let ft = -150; ft < -10; ft += 22) for (const dx of [-7, 7]) svg.append(el('path', { d: `M${cx + dx} ${Y(ft)} V${Y(ft + 12)}`, class: 'paint-yellow-line thin-paint' }));
    // Holding position marking: two solid lines on the holding side, two dashed toward the runway.
    for (const [k, dash] of [[0, false], [5, false], [10, true], [15, true]])
      svg.append(el('path', { d: `M${cx - 40} ${Y(k)} H${cx + 40}`, class: dash ? 'paint-yellow-line dashed-paint' : 'paint-yellow-line' }));
    // Signs: location (black/yellow) then runway holding position (red/white), left of the taxiway.
    svg.append(el('rect', { x: cx - 128, y: Y(10) - 9, width: 24, height: 20, class: 'sign-black' }), el('text', { x: cx - 116, y: Y(10) + 6, 'text-anchor': 'middle', class: 'sign-txt yellow', 'font-size': 13 }, 'A'));
    svg.append(el('rect', { x: cx - 102, y: Y(10) - 9, width: 50, height: 20, class: 'sign-red' }), el('text', { x: cx - 77, y: Y(10) + 6, 'text-anchor': 'middle', class: 'sign-txt white', 'font-size': 13 }, '9-27'));
    svg.append(el('text', { x: cx + 54, y: Y(8), class: 'lbl small' }, 'SOLID LINES: HOLDING SIDE'));
    svg.append(el('text', { x: cx + 54, y: Y(-60), class: 'lbl small' }, 'ENHANCED CENTERLINE DASHES'));
    svg.append(el('text', { x: cx + 54, y: Y(-74), class: 'lbl small' }, '(UP TO 150 FT BEFORE THE MARKING)'));
    // Aircraft: 30 ft from nose to tail, scaled. Heading up when entering, down when exiting.
    const len = 30;
    const nose = pos, tail = way === 'enter' ? pos - len : pos + len;
    const mid = (nose + tail) / 2;
    const ac = el('path', { d: PLANE, class: 'acft', transform: `translate(${cx} ${Y(mid)}) rotate(${way === 'enter' ? 0 : 180}) scale(${len * s / 22})` });
    svg.append(ac);
    svg.append(el('text', { x: 14, y: 24, class: 'lbl small' }, `RUNWAY HOLDING POSITION · ${way === 'enter' ? 'TAXIING TOWARD THE RUNWAY' : 'EXITING THE RUNWAY AFTER LANDING'} · NOT TO SCALE`));
    let lines;
    if (way === 'enter') {
      lines = nose < 0
        ? ['You are on the solid-line side: hold here. Do not cross onto the runway without a clearance to enter or cross it.']
        : ['Your nose is past the solid lines: you have entered the runway safety side of the marking. Without a clearance to enter or cross, this is where runway incursions begin.'];
    } else {
      const clear = Math.max(nose, tail) < 0;
      lines = clear
        ? ['Every part of the aircraft is beyond the solid lines: you are clear of the runway. Stop and hold unless ATC has issued further instructions, and change to ground control when the tower says so.']
        : ['Part of the aircraft is still on the runway side of the solid lines: keep taxiing until all of it has crossed the marking, even if that means stopping on the parallel taxiway.'];
    }
    out.replaceChildren(...para(lines));
  }
  root.addEventListener('input', draw);
  root.addEventListener('change', draw);
  draw();
}

/* ---------- Figure 5: airport signs ---------- */
const SIGNS = [
  { id: 'hold', kind: 'Mandatory instruction', bg: 'sign-red', fg: 'white', text: '9-27', meaning: 'Runway holding position sign: you are at the hold line for runway 9-27. Runway 9\'s threshold is to the left. Do not enter or cross without a clearance.' },
  { id: 'ils', kind: 'Mandatory instruction', bg: 'sign-red', fg: 'white', text: 'ILS', meaning: 'ILS critical area holding position sign: hold here when instructed, so the aircraft does not disturb the instrument landing system signal.' },
  { id: 'noentry', kind: 'Mandatory instruction', bg: 'sign-red', fg: 'white', text: '', symbol: 'noentry', meaning: 'No entry sign: aircraft may not enter this area, for example the wrong end of a one-way taxiway or a road that could be mistaken for a taxiway.' },
  { id: 'location', kind: 'Location', bg: 'sign-black', fg: 'yellow', border: true, text: 'B', meaning: 'Taxiway location sign: you are on taxiway B.' },
  { id: 'direction', kind: 'Direction', bg: 'sign-yellow', fg: 'black', text: '← A', meaning: 'Direction sign: taxiway A is to the left at the intersection ahead.' },
  { id: 'destination', kind: 'Destination', bg: 'sign-yellow', fg: 'black', text: 'RAMP →', meaning: 'Destination sign: the route to the ramp is to the right.' },
  { id: 'distance', kind: 'Runway distance remaining', bg: 'sign-black', fg: 'white', text: '3', meaning: 'Runway distance remaining sign: 3,000 ft of runway remain.' },
];
function signSvg(s, scale = 1) {
  const w = Math.max(56, 20 + s.text.length * 14) * scale, h = 34 * scale;
  const svg = el('svg', { viewBox: `0 0 ${w} ${h}`, width: w, height: h, 'aria-hidden': 'true', class: 'sign' });
  svg.append(el('rect', { x: 1, y: 1, width: w - 2, height: h - 2, class: s.bg }));
  if (s.border) svg.append(el('rect', { x: 4 * scale, y: 4 * scale, width: w - 8 * scale, height: h - 8 * scale, class: 'sign-border' }));
  if (s.symbol === 'noentry') {
    svg.append(el('circle', { cx: w / 2, cy: h / 2, r: 11 * scale, class: 'sign-ring' }));
    svg.append(el('path', { d: `M${w / 2 - 8 * scale} ${h / 2} H${w / 2 + 8 * scale}`, class: 'sign-ring bar' }));
  } else svg.append(el('text', { x: w / 2, y: h / 2 + 7 * scale, 'text-anchor': 'middle', class: `sign-txt ${s.fg}`, 'font-size': 20 * scale }, s.text));
  return svg;
}
function setupSigns(root) {
  const gallery = root.querySelector('[data-gallery]');
  const out = root.querySelector('[data-result]');
  for (const s of SIGNS) {
    const b = Object.assign(document.createElement('button'), { type: 'button', className: 'sign-button' });
    b.setAttribute('aria-pressed', 'false');
    b.append(signSvg(s), Object.assign(document.createElement('span'), { textContent: s.kind }));
    b.setAttribute('aria-label', `${s.kind} sign${s.text ? ` reading ${s.text}` : ''}`);
    b.addEventListener('click', () => {
      for (const c of gallery.children) c.setAttribute('aria-pressed', String(c === b));
      out.textContent = s.meaning;
    });
    gallery.append(b);
  }
  // Quiz: which kind of sign is this?
  const quiz = root.querySelector('[data-quiz]');
  const shown = quiz.querySelector('[data-sign]'), choices = quiz.querySelector('[data-choices]'), result = quiz.querySelector('[data-quiz-result]');
  const kinds = [...new Set(SIGNS.map((s) => s.kind))];
  let score = 0, asked = 0;
  function ask() {
    const s = SIGNS[Math.floor(Math.random() * SIGNS.length)];
    shown.replaceChildren(signSvg(s, 1.4));
    shown.setAttribute('aria-label', `Sign with ${s.bg.replace('sign-', '')} background${s.text ? `, reading ${s.text}` : ', with a circle and bar symbol'}`);
    result.textContent = '';
    choices.replaceChildren(...kinds.map((k) => {
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: k });
      b.addEventListener('click', () => {
        asked++;
        if (k === s.kind) score++;
        result.textContent = `${k === s.kind ? 'Correct' : `Not quite: it is a ${s.kind.toLowerCase()} sign`}. ${s.meaning} ${score} of ${asked}.`;
        for (const c of choices.children) c.disabled = true;
      });
      return b;
    }));
  }
  quiz.querySelector('[data-new]').addEventListener('click', ask);
  ask();
}

/* ---------- Figure 6: lighting at night ---------- */
function setupLighting(root) {
  const f = fields(root);
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const L = 8000;
  function draw() {
    const travelled = Number(f.travelled.value);
    const remaining = L - travelled;
    setOut(root, 'travelled', `${r0(travelled)} ft from the threshold · ${r0(remaining)} ft remaining`);
    const m = runwayLights({ length: L, remaining });
    const x0 = 40, sx = 560 / L, cy = 170, hw = 26;
    const X = (ft) => x0 + ft * sx;
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 318, class: 'night' }));
    svg.append(el('rect', { x: X(0), y: cy - hw, width: L * sx, height: hw * 2, class: 'rwy-night' }));
    const dot = (x, y, cls, r = 2.6) => svg.append(el('circle', { cx: x, cy: y, r, class: `lt ${cls}` }));
    for (let ft = 0; ft <= L; ft += 200) {
      const rem = L - ft;
      const edge = rem <= m.caution ? 'yellow' : 'white';
      dot(X(ft), cy - hw, edge); dot(X(ft), cy + hw, edge);
    }
    for (let ft = 50, i = 0; ft < L; ft += 50, i++) {
      const rem = L - ft;
      const c = rem <= 1000 ? 'red' : rem <= 3000 ? (i % 2 ? 'red' : 'white') : 'white';
      dot(X(ft), cy, c, 1.8);
    }
    // Touchdown zone lights: from 100 ft to 3,000 ft (or the midpoint).
    for (let ft = 100; ft <= Math.min(3000, L / 2); ft += 100) for (const o of [-12, -8, 8, 12]) dot(X(ft), cy + o, 'white', 1.3);
    // Threshold: green outward at the landing end; red toward the runway at the far end.
    for (let o = -hw; o <= hw; o += 6.5) { dot(X(0) - 4, cy + o, 'green', 2.4); dot(X(L) + 4, cy + o, 'red', 2.4); }
    // A taxiway connector with blue edges and a green centreline.
    const tx = X(5200);
    svg.append(el('rect', { x: tx - 12, y: cy + hw, width: 24, height: 80, class: 'rwy-night' }));
    for (let y = cy + hw + 10; y < cy + hw + 80; y += 12) { dot(tx - 12, y, 'blue', 2); dot(tx + 12, y, 'blue', 2); dot(tx, y, 'green', 1.6); }
    const [ax, ay] = [X(travelled), cy];
    svg.append(plane(ax, ay, 90, 'acft night-acft'));
    const label = (x, y, t, a = 'start') => svg.append(el('text', { x, y, 'text-anchor': a, class: 'lbl small rev' }, t));
    label(14, 24, 'INSTRUMENT RUNWAY AT NIGHT · 8,000 FT · LANDING TO THE RIGHT · NOT TO SCALE');
    label(X(0), cy - hw - 14, 'GREEN THRESHOLD');
    label(X(L), cy - hw - 14, 'RED RUNWAY END', 'end');
    label(X(L - m.caution), cy + hw + 18, 'YELLOW: CAUTION ZONE');
    label(X(L - 3000), cy - hw - 44, 'CENTERLINE: WHITE → RED/WHITE → RED (LAST 3,000 FT)');
    label(tx - 18, cy + hw + 60, 'TAXIWAY: BLUE EDGE, GREEN CENTERLINE', 'end');
    label(X(100), cy + hw + 36, 'TOUCHDOWN ZONE LIGHTS');
    const words = { white: 'white', yellow: 'yellow', red: 'red', 'red/white': 'alternating red and white' };
    out.replaceChildren(...para([
      `${r0(remaining)} ft of runway remaining: edge lights ahead of you are ${words[m.edge]}; centerline lights ${words[m.centerline]}.`,
      m.edge === 'yellow' ? 'Yellow edge lights mark the caution zone: the last 2,000 ft or half the runway length, whichever is less.' : 'Edge lights turn yellow for the last 2,000 ft (or half the runway, if less) on an instrument runway.',
    ]));
  }
  root.addEventListener('input', draw);
  draw();
  // Beacon: drawn as a static sequence; the lamp flashes only on request.
  const beacon = root.querySelector('[data-beacon]');
  const lamp = root.querySelector('[data-lamp]');
  const play = root.querySelector('[data-play]');
  const seq = { civil: ['green', 'white'], military: ['green', 'white', 'off', 'white'] };
  let timer = 0, i = 0;
  const kind = () => checked(root, 'beacon');
  function strip() {
    const s = seq[kind()];
    beacon.replaceChildren(...[...s, ...s, ...s].map((c, k) => el('rect', { x: 6 + k * 26, y: 8, width: 20, height: 20, class: `lt-box ${c}` })));
    beacon.append(el('text', { x: 6, y: 46, class: 'lbl small' }, kind() === 'civil' ? 'CIVIL LAND AIRPORT: WHITE AND GREEN, ALTERNATING' : 'MILITARY: TWO QUICK WHITE FLASHES BETWEEN GREENS'));
  }
  function stop() { clearInterval(timer); timer = 0; play.textContent = 'Flash the beacon'; lamp.setAttribute('class', 'lt-lamp off'); }
  play.addEventListener('click', () => {
    if (timer) return stop();
    if (reduceMotion()) { play.textContent = 'Reduced motion: read the sequence above'; return; }
    play.textContent = 'Stop';
    i = 0;
    timer = setInterval(() => { const s = seq[kind()]; lamp.setAttribute('class', `lt-lamp ${s[i++ % s.length]}`); }, 450);
  });
  root.addEventListener('change', (e) => { if (e.target.name === 'beacon') strip(); });
  strip();
}

/* ---------- Figure 7: PAPI ---------- */
function setupPapi(root) {
  const f = fields(root);
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  function draw() {
    const dist = Number(f.dist.value) * NM / 10; // tenths of a nautical mile
    const height = Number(f.height.value);
    const lens = checked(root, 'ind') === 'iflols';
    const gs = Number(f.gs.value) / 10;
    f.gs.closest('label').hidden = !lens;
    setOut(root, 'dist', `${(dist / NM).toFixed(1)} NM`);
    setOut(root, 'height', `${r0(height)} ft`);
    setOut(root, 'gs', `${gs.toFixed(1)}°`);
    const angle = pathAngle(height, dist);
    const p = papi(angle);
    const b = meatball(angle, gs);
    // Side view: distance 0–4 NM → 600 px; height 0–1,500 ft → 260 px (vertical exaggerated).
    const sx = 560 / (4 * NM), sy = 260 / 1500, gx = 600, gy = 330;
    const X = (ft) => gx - ft * sx, Y = (ft) => gy - ft * sy;
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 398, class: 'frame' }));
    svg.append(el('path', { d: `M20 ${gy} H630`, class: 'ln heavy' }));
    svg.append(el('rect', { x: gx - 4, y: gy - 3, width: 34, height: 3, class: 'fixmark' }));
    const lines = lens
      ? [[gs, 'ln', `${gs.toFixed(1)}° GLIDE SLOPE`], [gs + LENS_HALF, 'ln dashed', `+${LENS_HALF}°`], [gs - LENS_HALF, 'ln dashed', `−${LENS_HALF}°`]]
      : [[3, 'ln', '3.0° GLIDE PATH'], [3.5, 'ln dashed', '3.5°'], [2.5, 'ln dashed', '2.5°']];
    for (const [deg, cls, lbl] of lines) {
      const end = 4 * NM;
      svg.append(el('path', { d: `M${X(0)} ${Y(0)} L${X(end)} ${Y(heightOnPath(end, deg))}`, class: cls }));
      const at = 3.6 * NM; // labels inside the frame, clear of the title and the light box
      svg.append(el('text', { x: X(at), y: Y(heightOnPath(at, deg)) - 6, class: 'lbl small' }, lbl));
    }
    for (let nm = 1; nm <= 4; nm++) svg.append(el('path', { d: `M${X(nm * NM)} ${gy} v6`, class: 'thin' }), el('text', { x: X(nm * NM), y: gy + 20, 'text-anchor': 'middle', class: 'lbl small' }, `${nm} NM`));
    for (const ft of [500, 1000, 1500]) svg.append(el('path', { d: `M${X(0)} ${Y(ft)} h-6`, class: 'thin' }), el('text', { x: X(0) - 10, y: Y(ft) + 4, 'text-anchor': 'end', class: 'lbl small' }, `${r0(ft)} FT`));
    svg.append(el('path', { d: SIDE, class: 'acft', transform: `translate(${X(dist)} ${Y(height)}) rotate(${Math.min(12, angle ?? 0)}) scale(1.2)` }));
    svg.append(el('path', { d: `M${X(dist)} ${Y(height)} L${X(0)} ${Y(0)}`, class: 'los' }));
    if (lens) {
      // What the pilot sees: the lens box with the ball, green datum bars, red wave-off and green cut lights (both off).
      const box = el('g', { transform: 'translate(200 42)' });
      box.append(el('rect', { x: 0, y: 0, width: 230, height: 96, class: 'night' }));
      const cx = 115, top = 14, h = 60, cy = top + h / 2;
      box.append(el('rect', { x: cx - 14, y: top, width: 28, height: h, class: 'lt-box off' }));
      box.append(el('rect', { x: cx - 14, y: top + h * (1 - RED_CELL), width: 28, height: h * RED_CELL, class: 'thin' }));
      for (const sgn of [-1, 1]) {
        for (let i = 0; i < 5; i++) box.append(el('circle', { cx: cx + sgn * (30 + i * 12), cy, r: 4, class: 'lt green' }));
        for (const dy of [-12, 0, 12]) box.append(el('circle', { cx: cx + sgn * 24, cy: cy + dy - 14, r: 3, class: 'lt-lamp off' }));
      }
      for (const dx of [-8, 0, 8]) box.append(el('circle', { cx: cx + dx, cy: top - 7, r: 3, class: 'lt-lamp off' }));
      if (b.visible) box.append(el('circle', { cx, cy: cy - b.position * (h / 2 - 6), r: 6, class: `lt ${b.red ? 'red' : 'yellow'}` }));
      box.append(el('text', { x: cx, y: 90, 'text-anchor': 'middle', class: 'lbl small rev' }, b.label.toUpperCase()));
      svg.append(box, el('text', { x: 200, y: 37, class: 'lbl small' }, 'IFLOLS AS SEEN FROM THE COCKPIT'));
    } else {
      // What the pilot sees: four PAPI boxes.
      const box = el('g', { transform: 'translate(250 52)' });
      box.append(el('rect', { x: 0, y: 0, width: 190, height: 70, class: 'night' }));
      p.lights.forEach((c, i) => box.append(el('circle', { cx: 32 + i * 42, cy: 30, r: 13, class: `lt ${c}` })));
      box.append(el('text', { x: 95, y: 62, 'text-anchor': 'middle', class: 'lbl small rev' }, p.label.toUpperCase()));
      svg.append(box, el('text', { x: 250, y: 44, class: 'lbl small' }, 'PAPI AS SEEN FROM THE COCKPIT'));
    }
    svg.append(el('text', { x: 14, y: 24, class: 'lbl small' }, `SIDE VIEW · VERTICAL SCALE EXAGGERATED ABOUT ${Math.round(sy / sx)}×`));
    const ref = lens ? gs : 3;
    const onPath = heightOnPath(dist, ref);
    out.replaceChildren(...para([
      lens
        ? `You are ${angle.toFixed(2)}° above the lens, ${Math.abs(b.error).toFixed(2)}° ${b.error >= 0 ? 'above' : 'below'} the ${gs.toFixed(1)}° glide slope: ${b.label.toLowerCase()}.`
        : `You are ${angle.toFixed(2)}° above the PAPI: ${p.white} white and ${4 - p.white} red, "${p.label.toLowerCase()}".`,
      `On a ${ref.toFixed(1)}° path at ${(dist / NM).toFixed(1)} NM you would be about ${r10(onPath)} ft above the touchdown point (${height > onPath ? `${r10(height - onPath)} ft high` : height < onPath ? `${r10(onPath - height)} ft low` : 'on it'}).`,
    ]));
  }
  root.addEventListener('input', draw);
  root.addEventListener('change', draw);
  draw();
}

/* ---------- Figure 8: wind and the runway in use ---------- */
function setupWind(root) {
  const f = fields(root);
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const runways = [{ hdg: 90, n: 9 }, { hdg: 270, n: 27 }, { hdg: 180, n: 18 }, { hdg: 360, n: 36 }];
  function draw() {
    const wind = Number(f.wind.value), speed = Number(f.speed.value);
    setOut(root, 'wind', `${hdg(wind)}°`);
    setOut(root, 'speed', `${speed} kt`);
    const choice = runwayForWind({ wind, speed, runways: runways.map((r) => r.hdg), calm: 270 });
    const cx = 220, cy = 220;
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 438, class: 'frame' }), el('rect', { x: 2, y: 2, width: 636, height: 434, class: 'grass' }));
    svg.append(el('rect', { x: cx - 170, y: cy - 14, width: 340, height: 28, class: 'rwy' }), el('rect', { x: cx - 14, y: cy - 170, width: 28, height: 340, class: 'rwy' }));
    svg.append(paintNumber(cx - 150, cy, 90, '9', 14), paintNumber(cx + 150, cy, 270, '27', 14), paintNumber(cx, cy + 150, 0, '36', 14), paintNumber(cx, cy - 150, 180, '18', 14));
    // Highlight the landing direction: an arrow along the runway in use.
    const land = choice.runway;
    const d = [Math.sin(rad(land)), -Math.cos(rad(land))];
    svg.append(el('path', { d: `M${cx - d[0] * 205} ${cy - d[1] * 205} L${cx - d[0] * 176} ${cy - d[1] * 176}`, class: 'ln heavy on-path', 'marker-end': 'url(#ao-arrow2)' }));
    const defs = el('defs');
    const mk = el('marker', { id: 'ao-arrow2', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' });
    mk.append(el('path', { d: 'M0 0 L10 5 L0 10 Z', class: 'pointer' }));
    defs.append(mk); svg.append(defs);
    // Wind arrow, from where the wind blows toward the field.
    const w = [Math.sin(rad(wind)), -Math.cos(rad(wind))];
    if (speed > 0) {
      svg.append(el('path', { d: `M${cx + w[0] * 205} ${cy + w[1] * 205} L${cx + w[0] * 150} ${cy + w[1] * 150}`, class: 'ln heavy', 'marker-end': 'url(#ao-arrow2)' }));
      svg.append(el('text', { x: cx + w[0] * 205, y: cy + w[1] * 205 + (w[1] < 0 ? -8 : 16), 'text-anchor': 'middle', class: 'lbl small' }, 'WIND'));
    }
    // Indicators panel: wind cone (large end into wind), tetrahedron (small end into wind, the landing direction).
    const px = 500, py = 120;
    svg.append(el('circle', { cx: px, cy: py, r: 46, class: 'thin' }), el('text', { x: px, y: py + 66, 'text-anchor': 'middle', class: 'lbl small' }, 'WIND CONE'));
    // The cone streams downwind: its large end at the mast faces the wind.
    const down = wind + 180;
    const sd = [Math.sin(rad(down)), -Math.cos(rad(down))], sp = [-sd[1], sd[0]];
    const droop = speed < 3 ? 0.3 : 1;
    const tip = [px + sd[0] * 40 * droop, py + sd[1] * 40 * droop + (1 - droop) * 30];
    svg.append(el('path', { d: pathOf([[px + sp[0] * 7, py + sp[1] * 7], [tip[0] + sp[0] * 3, tip[1] + sp[1] * 3], [tip[0] - sp[0] * 3, tip[1] - sp[1] * 3], [px - sp[0] * 7, py - sp[1] * 7]]) + 'Z', class: 'sock' }));
    svg.append(el('circle', { cx: px, cy: py, r: 3, class: 'fixmark' }));
    const tx = 500, ty = 320;
    svg.append(el('circle', { cx: tx, cy: ty, r: 46, class: 'thin' }), el('text', { x: tx, y: ty + 66, 'text-anchor': 'middle', class: 'lbl small' }, 'TETRAHEDRON (SMALL END → LANDING)'));
    const ld = [Math.sin(rad(land)), -Math.cos(rad(land))], lp = [-ld[1], ld[0]];
    svg.append(el('path', { d: pathOf([[tx + ld[0] * 34, ty + ld[1] * 34], [tx - ld[0] * 26 + lp[0] * 20, ty - ld[1] * 26 + lp[1] * 20], [tx - ld[0] * 26 - lp[0] * 20, ty - ld[1] * 26 - lp[1] * 20]]) + 'Z', class: 'tetra' }));
    svg.append(el('text', { x: 14, y: 24, class: 'lbl small' }, `WIND ${hdg(wind)}° AT ${speed} KT · RUNWAYS 9-27 AND 18-36 · CALM-WIND RUNWAY 27`));
    const rows = runways.map((r) => ({ ...r, ...windComponents({ wind, speed, runway: r.hdg }) }));
    const table = root.querySelector('[data-table] tbody');
    table.replaceChildren(...rows.map((r) => {
      const tr = document.createElement('tr');
      if (r.hdg === land) tr.className = 'chosen';
      const cell = (t, th) => Object.assign(document.createElement(th ? 'th' : 'td'), { textContent: t, ...(th ? { scope: 'row' } : {}) });
      tr.append(
        cell(`Runway ${r.n}${r.hdg === land ? ' (in use)' : ''}`, true),
        cell(r.head >= 0 ? `${r.head.toFixed(0)} kt head` : `${(-r.head).toFixed(0)} kt tail`),
        cell(Math.abs(r.cross) < 0.5 ? '0 kt' : `${Math.abs(r.cross).toFixed(0)} kt from the ${r.cross > 0 ? 'right' : 'left'}`),
      );
      return tr;
    }));
    const n = runways.find((r) => r.hdg === land).n;
    out.replaceChildren(...para([
      choice.reason === 'calm' ? `Wind under 5 kt: the calm-wind runway, ${n}, is used unless another is operationally better.` : `Wind 5 kt or more: the runway most nearly aligned with the wind is used, runway ${n}.`,
    ]));
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 9: the traffic pattern ---------- */
function setupPattern(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const play = root.querySelector('[data-play]');
  const L = 5000, sc = 0.024, ox = 200;
  let oy = 330;
  const S = ([x, y]) => [ox + x * sc, oy + y * sc];
  let frame = 0, route = [], highlight = null;
  const legsText = {
    departure: 'Departure leg: straight ahead along the extended runway centerline after takeoff, until at least 1/2 mile beyond the runway end and within 300 ft of pattern altitude.',
    crosswind: 'Crosswind leg: at right angles to the runway off its takeoff end. Start the turn beyond the departure end, within 300 ft of pattern altitude.',
    downwind: 'Downwind leg: parallel to the runway, opposite to the landing direction, about 1/2 to 1 mile out. Enter it at 45° abeam the runway midpoint.',
    base: 'Base leg: at right angles to the runway off its approach end. Turn onto it at about 45° from the approach end, behind your shoulder.',
    final: 'Final approach: along the extended centerline to the runway. Complete the turn to final at least 1/4 mile from the runway.',
  };
  function build() {
    const side = checked(root, 'side'), entry = checked(root, 'entry'), exit = checked(root, 'exit'), type = checked(root, 'type');
    const alt = type === 'turbine' ? 1500 : 1000;
    const p = pattern({ length: L, offset: 0.75 * NM, side });
    const s = side === 'right' ? 1 : -1;
    // Keep the pattern side, which holds the entry, on the larger part of the frame.
    oy = side === 'right' ? 85 : 375;
    const y = p.legs.downwind[0][1];
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 458, class: 'frame' }), el('rect', { x: 2, y: 2, width: 636, height: 456, class: 'grass' }));
    const [rx0, ry0] = S([0, -75]), [rx1] = S([L, 0]);
    svg.append(el('rect', { x: rx0, y: ry0, width: rx1 - rx0, height: 150 * sc + 4, class: 'rwy' }));
    svg.append(paintNumber(rx0 + 9, oy, 90, '9', 10));
    const leg = (name, pts) => {
      const g = el('g', { class: `leg${highlight === name ? ' active' : ''}` });
      g.append(el('path', { d: pathOf(pts.map(S)), class: 'track' }));
      const [a, b] = pts.map(S);
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      g.append(el('path', { d: 'M-6 -5 L4 0 L-6 5', class: 'ln', transform: `translate(${m[0]} ${m[1]}) rotate(${ang})` }));
      const lx = m[0] + (name === 'base' || name === 'crosswind' ? (name === 'base' ? -14 : 14) : 0);
      const ly = m[1] + (name === 'downwind' ? s * 16 : name === 'final' || name === 'departure' ? 16 : 0);
      g.append(el('text', { x: lx, y: ly + 4, 'text-anchor': name === 'base' ? 'end' : name === 'crosswind' ? 'start' : 'middle', class: 'lbl small' }, name.toUpperCase()));
      svg.append(g);
    };
    for (const [name, pts] of Object.entries(p.legs)) if (exit === 'remain' || name !== 'crosswind') leg(name, pts);
    // Entries.
    let arrive;
    const downStart = [p.mid, y];
    if (entry === '45') {
      svg.append(el('path', { d: pathOf(p.entry.map(S)), class: 'ln dashed' }));
      const [ex, ey] = S(p.entry[0]);
      svg.append(el('text', { x: ex + 6, y: ey + (s < 0 ? -6 : 14), class: 'lbl small' }, `45° ENTRY AT ${r0(alt)} FT AGL`));
      arrive = [...p.entry, downStart];
    } else {
      // Midfield crossover from the non-pattern side, at least 500 ft above
      // pattern altitude; descend outside and turn back to a 45° entry.
      // A teardrop turn toward the departure end, ending on the 45° entry line.
      const out = y + s * 1.3 * NM;
      const pts = [[p.mid, -s * 0.4 * NM], [p.mid, out], [p.mid + 0.3 * NM, y + s * 1.6 * NM], [p.mid + 0.8 * NM, y + s * 1.5 * NM], p.entry[0], downStart];
      svg.append(el('path', { d: pathOf(pts.map(S)), class: 'ln dashed' }));
      const [ex, ey] = S([p.mid, -s * 0.25 * NM]);
      svg.append(el('text', { x: ex + 8, y: ey, class: 'lbl small' }, `CROSS MIDFIELD ≥ ${r0(alt + 500)} FT`));
      arrive = pts;
    }
    // Exits.
    if (exit !== 'remain') {
      const pts = p.exits[exit === 'straight' ? 'straight' : 'turn45'];
      svg.append(el('path', { d: pathOf(pts.map(S)), class: 'ln dashed' }));
      const [ex, ey] = S(pts.at(-1));
      svg.append(el('text', { x: ex - 4, y: ey + (exit === 'straight' ? -8 : s < 0 ? -8 : 16), 'text-anchor': 'end', class: 'lbl small' }, exit === 'straight' ? 'STRAIGHT OUT' : '45° EXIT'));
    }
    // Base-turn cue: approach end 45° behind abeam.
    const bb = baseBearing(p.offset, p.offset);
    const [bx, by] = S([p.baseAt, y]), [tx, ty] = S([0, 0]);
    svg.append(el('path', { d: `M${bx} ${by} L${tx} ${ty}`, class: 'los' }));
    svg.append(el('text', { x: (bx + tx) / 2 + 8, y: (by + ty) / 2 + 4, class: 'lbl small' }, `${Math.round(bb)}° TO THE APPROACH END`));
    // Scale bar and title.
    svg.append(el('path', { d: `M20 440 h${NM * sc} M20 436 v8 M${20 + NM * sc} 436 v8`, class: 'thin' }), el('text', { x: 26 + NM * sc, y: 444, class: 'lbl small' }, '1 NM'));
    svg.append(el('text', { x: 14, y: 24, class: 'lbl small' }, `${side.toUpperCase()} TRAFFIC · RUNWAY 9 · PATTERN ALTITUDE ${r0(alt)} FT AGL · DOWNWIND 3/4 NM OUT`));
    // Animated route: arrival, final, touch-and-go, departure.
    const touch = [[0, 0], [L * 0.6, 0]];
    const depart = exit === 'remain' ? [p.legs.departure[0], p.legs.departure[1], p.legs.crosswind[1], [p.mid, y]] : p.exits[exit === 'straight' ? 'straight' : 'turn45'];
    route = [...arrive, ...p.legs.downwind.slice(1), p.legs.base[1], ...touch, ...depart.slice(1)];
    out.replaceChildren(...para([
      highlight ? legsText[highlight] : `${side === 'left' ? 'Left' : 'Right'} traffic: every turn is to the ${side}. ${side === 'left' ? 'Turns are to the left unless the airport shows right traffic, for example with segmented circle traffic pattern indicators.' : 'Right traffic is used only where the airport shows it.'}`,
      `${type === 'turbine' ? 'Large and turbine-powered aircraft: not less than 1,500 ft AGL.' : 'Propeller-driven aircraft: 1,000 ft AGL.'} ${entry === '45' ? 'Enter at 45° to the downwind leg, abeam the runway midpoint, at pattern altitude.' : 'From the upwind side: cross midfield at least 500 ft above pattern altitude, descend to pattern altitude about 2 miles out, and turn back to a 45° entry.'}`,
      exit === 'remain' ? 'Staying in the pattern: after takeoff, turn crosswind beyond the departure end within 300 ft of pattern altitude.' : `Leaving the pattern: ${exit === 'straight' ? 'continue straight out' : 'exit with a 45° turn toward the pattern side'} beyond the departure end after reaching pattern altitude.`,
    ]));
  }
  function stop() { cancelAnimationFrame(frame); frame = 0; play.textContent = 'Fly the pattern'; svg.querySelector('.mover')?.remove(); }
  play.addEventListener('click', () => {
    if (frame) return stop();
    const seg = route.slice(1).map((b, i) => { const a = route[i]; return { a, b, len: Math.hypot(b[0] - a[0], b[1] - a[1]) }; }).filter((s) => s.len > 0);
    const total = seg.reduce((t, s) => t + s.len, 0);
    const at = (d) => {
      for (const s of seg) { if (d <= s.len) { const k = d / s.len; return { p: [s.a[0] + (s.b[0] - s.a[0]) * k, s.a[1] + (s.b[1] - s.a[1]) * k], h: Math.atan2(s.b[0] - s.a[0], -(s.b[1] - s.a[1])) * 180 / Math.PI + 90 }; } d -= s.len; }
      return { p: route.at(-1), h: 90 };
    };
    if (reduceMotion()) {
      // Show the aircraft at each turn instead of animating.
      for (const pt of route) { const [x, y] = S(pt); svg.append(el('circle', { cx: x, cy: y, r: 3, class: 'fixmark' })); }
      return;
    }
    play.textContent = 'Stop';
    let start = null;
    const mover = plane(0, 0, 0, 'acft mover');
    svg.append(mover);
    const tick = (now) => {
      start ??= now;
      // About 22 seconds for the whole circuit.
      const d = Math.min(total, (now - start) / 22000 * total);
      const { p, h } = at(d);
      const [x, y] = S(p);
      mover.setAttribute('transform', `translate(${x} ${y}) rotate(${h - 90})`);
      if (d < total) frame = requestAnimationFrame(tick); else stop();
    };
    frame = requestAnimationFrame(tick);
  });
  for (const b of root.querySelectorAll('button[data-leg]')) b.addEventListener('click', () => {
    stop();
    highlight = highlight === b.dataset.leg ? null : b.dataset.leg;
    for (const o of root.querySelectorAll('button[data-leg]')) o.setAttribute('aria-pressed', String(o.dataset.leg === highlight));
    build();
  });
  root.addEventListener('change', () => { stop(); build(); });
  build();
}

/* ---------- Figure 10: the overhead maneuver ---------- */
function setupOverhead(root) {
  const f = fields(root);
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const L = 8000;
  function draw() {
    const speed = Number(f.speed.value), bank = Number(f.bank.value), extend = Number(f.extend.value), initial = Number(f.initial.value) / 10 * NM;
    const where = checked(root, 'break');
    const breakAt = { approach: 0, midfield: L / 2, departure: L }[where];
    setOut(root, 'speed', `${speed} kt`);
    setOut(root, 'bank', `${bank}°`);
    setOut(root, 'extend', `${r0(extend)} ft`);
    setOut(root, 'initial', `${(initial / NM).toFixed(1)} NM`);
    const o = overhead({ speed, bank, breakAt, extend, initial });
    // Plan view (top): x along the runway, left traffic (downwind north of the runway, up the page).
    const oy = 150;
    // The initial runs `initial` up to the break; the final turn reaches −extend − r.
    const start = breakAt - initial;
    const minX = Math.min(start, -extend - o.radius), maxX = Math.max(L, breakAt + o.radius);
    const scale = Math.min(560 / (maxX - minX), 110 / (2 * o.radius + 600));
    const X = (x) => 40 + (x - minX) * scale, Y = (y) => oy + y * scale;
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 478, class: 'frame' }));
    svg.append(el('rect', { x: X(0), y: Y(-75) - 2, width: L * scale, height: 150 * scale + 4, class: 'rwy' }));
    const r = o.radius;
    const path = [
      `M${X(start)} ${Y(0)} L${X(breakAt)} ${Y(0)}`,
      `A${r * scale} ${r * scale} 0 0 0 ${X(breakAt)} ${Y(-2 * r)}`,
      `L${X(-extend)} ${Y(-2 * r)}`,
      `A${r * scale} ${r * scale} 0 0 0 ${X(-extend)} ${Y(0)}`,
      `L${X(0)} ${Y(0)}`,
    ].join(' ');
    svg.append(el('path', { d: path, class: 'track' }));
    const mark = (x, y, t, dy = -10, a = 'middle') => { svg.append(el('circle', { cx: X(x), cy: Y(y), r: 3.5, class: 'fixmark' })); svg.append(el('text', { x: X(x), y: Y(y) + dy, 'text-anchor': a, class: 'lbl small' }, t)); };
    mark(start, 0, 'INITIAL', 18, 'start');
    mark(breakAt, 0, 'BREAK', 18);
    mark(-extend, 0, 'ROLL-OUT', 18, 'end');
    mark(-extend, -2 * r, 'THE 180', 16, 'middle');
    mark(-extend - r, -r, 'THE 90', 4, 'end');
    svg.append(el('text', { x: Math.min(440, Math.max(200, X((breakAt - extend) / 2))), y: Math.max(40, Y(-2 * r) - 8), 'text-anchor': 'middle', class: 'lbl small' }, `DOWNWIND ${r10(o.spacing)} FT (2 × TURN RADIUS) FROM THE RUNWAY`));
    svg.append(el('text', { x: 14, y: 24, class: 'lbl small' }, `PLAN VIEW · LEFT BREAK OVER RUNWAY 9 · ${r0(L)} FT RUNWAY · NO WIND`));
    // Side view (bottom): height along the flown path, break to roll-out descending linearly.
    const sy0 = 440, hsc = 150 / 2000;
    const total = initial + o.pathLen + extend;
    const PX = (d) => 40 + d / total * 560, PY = (h) => sy0 - h * hsc;
    svg.append(el('path', { d: `M30 ${sy0} H620`, class: 'ln heavy' }));
    for (const h of [300, 1000, 1500]) {
      svg.append(el('path', { d: `M30 ${PY(h)} H620`, class: 'rb-datum' }));
      svg.append(el('text', { x: 34, y: PY(h) - 3, class: 'lbl small' }, h === 1000 ? '1,000 FT CONVENTIONAL PATTERN' : `${r0(h)} FT`));
    }
    const dBreak = initial, dRoll = dBreak + o.pathLen;
    svg.append(el('path', { d: `M${PX(0)} ${PY(o.breakAlt)} L${PX(dBreak)} ${PY(o.breakAlt)} L${PX(dRoll)} ${PY(o.rollHeight)} L${PX(dRoll + extend)} ${PY(0)}`, class: 'track' }));
    svg.append(el('text', { x: PX(dBreak), y: PY(o.breakAlt) - 8, 'text-anchor': 'middle', class: 'lbl small' }, 'BREAK'));
    svg.append(el('text', { x: PX(dRoll), y: PY(o.rollHeight) - 8, 'text-anchor': 'middle', class: 'lbl small' }, 'ROLL-OUT'));
    svg.append(el('text', { x: 14, y: 270, class: 'lbl small' }, 'SIDE VIEW ALONG THE FLOWN PATH · HEIGHT ABOVE THE GROUND'));
    const ok = (b) => (b ? '✓' : '✗');
    out.replaceChildren(...para([
      `Break turn: ${bank}° of bank at ${speed} kt is ${o.load.toFixed(1)} G, a ${r10(o.radius)} ft radius at ${o.rate.toFixed(1)}° per second; each 180° takes ${(180 / o.rate).toFixed(0)} s. Break to roll-out: ${(o.seconds).toFixed(0)} s.`,
      `${ok(o.initialOk)} Initial approach ${(initial / NM).toFixed(1)} NM to the break (NAVEDTRA 14342A and the glossary: 3 to 5 miles).`,
      `Initial flown at ${r0(o.breakAlt)} ft AGL, 500 ft above the 1,000 ft standard pattern used here.${where === 'approach' ? ' Break over the landing threshold, the normal Navy break point.' : ''}`,
      `${ok(o.rolloutOk)} Roll-out ${r0(o.rollout)} ft before the threshold (not less than 1/4 mile, ${r0(SM / 4)} ft).`,
      `Roll-out drawn at ${o.rollHeight} ft above the ground, the glossary's minimum.`,
    ]));
  }
  root.addEventListener('input', draw);
  root.addEventListener('change', draw);
  draw();
}

/* ---------- Figure 12: light gun signals ---------- */
function setupLightGun(root) {
  const lamp = root.querySelector('[data-gun]');
  const what = root.querySelector('[data-gun-label]');
  const choices = root.querySelector('[data-choices]');
  const out = root.querySelector('[data-result]');
  let timer = 0, current = null, score = 0, asked = 0;
  const who = () => checked(root, 'who');
  const pattern = {
    'steady-green': ['green'], 'flashing-green': ['green', 'off'], 'steady-red': ['red'], 'flashing-red': ['red', 'off'],
    'flashing-white': ['white', 'off'], alternating: ['red', 'green'],
  };
  function show(signal) {
    clearInterval(timer);
    const seq = pattern[signal.id];
    let i = 0;
    const step = () => lamp.setAttribute('class', `gun-lamp ${seq[i++ % seq.length]}`);
    step();
    if (seq.length > 1 && !reduceMotion()) timer = setInterval(step, 500);
    // The lamp is decorative; the signal's name is the accessible prompt.
    what.textContent = signal.colour;
  }
  function ask() {
    const role = who();
    const pool = LIGHT_SIGNALS.filter((s) => s[role] !== 'Not applicable');
    current = pool[Math.floor(Math.random() * pool.length)];
    show(current);
    out.textContent = '';
    const meanings = [...new Set(pool.map((s) => s[role]))];
    choices.replaceChildren(...meanings.map((m) => {
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: m });
      b.addEventListener('click', () => {
        asked++;
        const right = m === current[role];
        if (right) score++;
        out.textContent = `${right ? 'Correct' : 'Not quite'}: ${current.colour.toLowerCase()} means "${current[role]}" ${{ ground: 'to an aircraft on the ground', air: 'to an aircraft in flight', vehicle: 'to vehicles, equipment and personnel' }[role]}. ${score} of ${asked}.`;
        what.textContent = current.colour;
        for (const c of choices.children) c.disabled = true;
      });
      return b;
    }));
  }
  root.querySelector('[data-new]').addEventListener('click', ask);
  root.addEventListener('change', ask);
  ask();
}

/* ---------- Figure 11: radio calls in and out ---------- */
const SOURCE_NO = { nav: [1, 'source-navedtra'], hw: [2, 'source-hollywood'], aim4: [4, 'source-aim4'], ac: [7, 'source-ac'] };
function setupRadio(root) {
  const svg = root.querySelector('svg');
  const list = root.querySelector('[data-steps]');
  const panel = root.querySelector('[data-call]');
  const back = root.querySelector('[data-back]'), next = root.querySelector('[data-next]');
  let step = 0;
  // Distance strip: 20 NM at the left, the airfield at the right end.
  const sx = (nm) => 300 - nm * 14, SY = 110;
  // Airfield close-up: runway 27 lands west (to the left), left traffic to the south.
  const spots = {
    ramp: [455, 50, 90], hold: [600, 92, 180], entry: [452, 199, 45], downwind: [505, 180, 90],
    base: [610, 152, 0], final: [597, 120, 270], exit: [440, 120, 270], clear: [430, 88, 0],
    break: [588, 120, 270], abeam: [600, 164, 90],
  };
  const PLACES = { ramp: 'On the ramp', hold: 'Holding short', entry: 'Entering the pattern', downwind: 'Downwind', base: 'Base', final: 'Final', exit: 'Rolling out', clear: 'Clear of the runway', break: 'The break', abeam: 'The 180' };
  const place = (c) => c.label ?? (c.at.nm !== undefined ? `${c.at.nm} NM` : PLACES[c.at.spot]);
  const calls = () => radioCalls(checked(root, 'field'), checked(root, 'dir'));
  function draw() {
    const cs = calls(), c = cs[step];
    const field = checked(root, 'field'), navy = field === 'navy';
    const towered = field !== 'nontowered', outbound = checked(root, 'dir') === 'outbound';
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 223, class: 'frame' }));
    // Strip.
    svg.append(el('text', { x: 20, y: 40, class: 'lbl small' }, outbound ? 'DISTANCE OUT (NM)' : 'DISTANCE TO GO (NM)'));
    svg.append(el('path', { d: `M${sx(20)} ${SY} H320`, class: 'ln' }));
    for (const nm of [20, 15, 10, 5, 0]) {
      svg.append(el('path', { d: `M${sx(nm)} ${SY - 5} V${SY + 5}`, class: 'ln' }));
      svg.append(el('text', { x: sx(nm), y: SY + 20, 'text-anchor': 'middle', class: 'lbl small' }, nm));
    }
    const mark = navy ? [5, 'INITIAL: 3 TO 5 NM, TO THE BREAK'] : towered ? [15, 'TOWER: INITIAL CALL ~15 NM'] : [10, 'CTAF: SELF-ANNOUNCE ~10 NM'];
    svg.append(el('path', { d: `M${sx(mark[0])} ${SY - 24} V${SY + 5}`, class: 'ln dashed' }));
    svg.append(el('text', { x: 20, y: SY - 28, class: 'lbl small' }, mark[1]));
    // Airfield close-up.
    svg.append(el('rect', { x: 320, y: 12, width: 310, height: 202, class: 'grass' }));
    svg.append(el('rect', { x: 320, y: 12, width: 310, height: 202, class: 'thin' }));
    svg.append(el('text', { x: 326, y: 27, class: 'lbl small' }, navy ? 'NAVY FIELD (ENLARGED)' : towered ? 'TOWERED AIRFIELD (ENLARGED)' : 'NON-TOWERED AIRFIELD (ENLARGED)'));
    svg.append(el('path', { d: 'M430 62 V110 M510 50 H600 V120 H582', class: 'twy' }));
    svg.append(el('rect', { x: 400, y: 36, width: 110, height: 26, class: 'apron' }));
    svg.append(el('rect', { x: 360, y: 110, width: 222, height: 20, class: 'rwy' }));
    svg.append(paintNumber(570, 120, 270, '27', 11));
    if (towered) {
      svg.append(el('rect', { x: 343, y: 44, width: 14, height: 26, class: 'bldg' }), el('rect', { x: 338, y: 36, width: 24, height: 9, class: 'bldg' }));
      svg.append(el('text', { x: 350, y: 84, 'text-anchor': 'middle', class: 'lbl small' }, 'TWR'));
    }
    if (navy) {
      // Overhead: initial down the centerline, left break over the numbers, downwind, the 180 onto final.
      svg.append(el('path', { d: 'M628 120 H582 A22 22 0 0 0 582 164 H602 A22 22 0 0 0 602 120', class: 'rb-datum' }));
      svg.append(el('text', { x: 326, y: 207, class: 'lbl small' }, 'OVERHEAD, LEFT BREAK, RUNWAY 27'));
    } else {
      svg.append(el('path', { d: 'M345 180 H610 V120 H584', class: 'rb-datum' }));
      svg.append(el('text', { x: 326, y: 207, class: 'lbl small' }, 'LEFT TRAFFIC, RUNWAY 27'));
    }
    // Aircraft.
    let x, y, h;
    if (c.at.nm !== undefined) [x, y, h] = [sx(c.at.nm), SY, outbound ? 270 : 90];
    else [x, y, h] = spots[c.at.spot];
    svg.append(plane(x, y, h));
    // Step list and call panel.
    for (const [i, b] of [...list.children].entries()) b.setAttribute('aria-pressed', String(i === step));
    const lines = [];
    const add = (cls, who, text) => { const p = document.createElement('p'); p.className = cls; p.append(Object.assign(document.createElement('strong'), { textContent: `${who}: ` }), text); lines.push(p); };
    const head = document.createElement('p');
    head.className = 'call-head';
    head.textContent = `${step + 1} of ${cs.length} · ${place(c)}${c.at.nm !== undefined ? (outbound ? ' out, departing' : ' out, inbound') : ''} · ${c.station} on ${c.freq}`;
    lines.push(head);
    const them = c.station === 'ATIS' ? 'ATIS' : towered ? c.station : 'Heard';
    if (c.theyFirst && c.them) add('them', them, c.them);
    if (c.you) add('you', 'You', c.you);
    if (!c.theyFirst && c.them) add('them', c.you ? (towered ? c.station : 'Reply') : them, c.them);
    if (!c.you && !c.them) add('you', 'You', 'No call needed: keep listening.');
    const note = document.createElement('p');
    note.className = 'call-note';
    note.append(c.note);
    for (const [src, where] of c.cite) {
      const [n, id] = SOURCE_NO[src];
      note.append(' ', Object.assign(document.createElement('a'), { href: `#${id}`, textContent: `[${n}, ${where}]` }));
    }
    lines.push(note);
    panel.replaceChildren(...lines);
    back.disabled = step === 0;
    next.disabled = step === cs.length - 1;
  }
  function rebuild() {
    step = 0;
    list.replaceChildren(...calls().map((c, i) => {
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: `${i + 1}. ${place(c)}` });
      b.addEventListener('click', () => { step = i; draw(); });
      return b;
    }));
    draw();
  }
  back.addEventListener('click', () => { step = Math.max(0, step - 1); draw(); });
  next.addEventListener('click', () => { step = Math.min(calls().length - 1, step + 1); draw(); });
  root.addEventListener('change', rebuild);
  rebuild();
}

/* ---------- Term quiz ---------- */
function setupTerms(root) {
  const terms = [...document.querySelectorAll('dl.jargon > div')].map((d) => ({
    term: d.querySelector('dt').textContent.trim(), meaning: d.querySelector('dd').textContent.trim(),
  }));
  const prompt = root.querySelector('[data-prompt]'), choices = root.querySelector('[data-choices]');
  const out = root.querySelector('[data-result]');
  let score = 0, asked = 0;
  function ask() {
    const pool = [...terms].sort(() => Math.random() - 0.5).slice(0, 4);
    const answer = pool[Math.floor(Math.random() * pool.length)];
    prompt.textContent = answer.meaning;
    choices.replaceChildren(...pool.map((t) => {
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: t.term });
      b.addEventListener('click', () => {
        asked++;
        if (t === answer) score++;
        out.textContent = `${t === answer ? 'Correct' : `Not quite: that was ${answer.term}`}. ${score} of ${asked}.`;
        for (const c of choices.children) c.disabled = true;
      });
      return b;
    }));
  }
  root.querySelector('[data-new]').addEventListener('click', () => { out.textContent = ''; ask(); });
  ask();
}

const blocks = {
  aerodrome: setupCallouts, numbers: setupNumbers, markings: setupMarkings, hold: setupHold, signs: setupSigns,
  lighting: setupLighting, papi: setupPapi, wind: setupWind, pattern: setupPattern, overhead: setupOverhead,
  radio: setupRadio, lightgun: setupLightGun, terms: setupTerms,
};
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
