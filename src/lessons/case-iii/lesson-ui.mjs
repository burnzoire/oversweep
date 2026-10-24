// Presentation for the Case III module's interactive blocks. All numbers come
// from lesson-model.mjs; this file only reads inputs and draws results.
import {
  approachProfile, eatPlan, entryPath, finalCorrection, marshalFix, norm, pointToPoint, profileAltitude,
  reciprocal, timeEnroute, turnAmount, turnSeconds,
} from './lesson-model.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const C = 160; // SVG centre for 320 × 320 plots
const fmt = (a) => String(Math.round(norm(a)) % 360).padStart(3, '0');
const clock = (seconds) => { const s = Math.round(seconds); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
// Leg times can end in half a second; keep it so the legs sum to the circuit.
const legClock = (seconds) => Number.isInteger(seconds) ? clock(seconds) : `${clock(Math.floor(seconds))}.5`;
const pt = (bearing, r) => [C + r * Math.sin(bearing * Math.PI / 180), C - r * Math.cos(bearing * Math.PI / 180)];
const num = (input) => Number(input.value);
// Typed values bypass min/max, so enforce each field's own range before plotting.
function bounded(input) {
  const value = num(input);
  if (input.value.trim() === '' || !(value >= Number(input.min) && value <= Number(input.max))) {
    const name = input.closest('label')?.firstChild?.textContent.trim() ?? input.name;
    throw new RangeError(`${name} must be from ${input.min} to ${input.max}.`);
  }
  return value;
}
const randomInt = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

function arrowMarker(svg, id) {
  const defs = el('defs');
  const marker = el('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' });
  marker.append(el('path', { d: 'M0 0 L10 5 L0 10 z', fill: 'currentColor' }));
  defs.append(marker);
  svg.append(defs);
}

function compass(svg, outer) {
  svg.append(el('circle', { cx: C, cy: C, r: outer, class: 'ring' }));
  for (const [b, label] of [[0, 'N'], [90, 'E'], [180, 'S'], [270, 'W']]) {
    const [x, y] = pt(b, outer + 12);
    svg.append(el('text', { x, y: y + 4, class: 'compass', 'text-anchor': 'middle' }, label));
  }
}

/* ---------- Point-to-point TACAN navigation ---------- */
function setupNavigation(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const feedback = root.querySelector('[data-feedback]');
  let revealed = false;

  const problem = () => ({
    from: { radial: bounded(f.youRadial), dme: bounded(f.youDme) },
    to: { radial: reciprocal(bounded(f.brc)), dme: bounded(f.fixDme) },
  });

  function draw() {
    let from, to, answer;
    try { ({ from, to } = problem()); answer = pointToPoint(from, to); } catch (error) {
      out.textContent = error.message; svg.replaceChildren(); return;
    }
    const range = Math.max(5, Math.ceil(Math.max(from.dme, to.dme) / 5) * 5);
    const scale = 130 / range;
    root.querySelector('[data-fix-radial]').textContent = fmt(to.radial);
    svg.replaceChildren();
    arrowMarker(svg, 'nav-arrow');
    compass(svg, 130);
    const step = range > 30 ? 10 : 5;
    for (let r = step; r < range; r += step) {
      svg.append(el('circle', { cx: C, cy: C, r: r * scale, class: 'ring minor' }));
      svg.append(el('text', { x: C + 3, y: C - r * scale - 2, class: 'ring-label' }, `${r}`));
    }
    svg.append(el('text', { x: 4, y: 314, class: 'ring-label' }, `Rings every ${step} NM · edge ${range} NM`));
    const [yx, yy] = pt(from.radial, from.dme * scale);
    const [fx, fy] = pt(to.radial, to.dme * scale);
    svg.append(el('line', { x1: C, y1: C, x2: fx, y2: fy, class: 'radial' }));
    svg.append(el('rect', { x: C - 5, y: C - 5, width: 10, height: 10, class: 'station' }));
    svg.append(el('text', { x: C + 8, y: C + 16, class: 'label' }, 'MOTHER'));
    if (revealed && answer.course !== null) {
      svg.append(el('line', { x1: yx, y1: yy, x2: fx, y2: fy, class: 'track', 'marker-end': 'url(#nav-arrow)' }));
      const [px, py] = pt(answer.course, 118);
      svg.append(el('line', { x1: C, y1: C, x2: px, y2: py, class: 'parallel', 'marker-end': 'url(#nav-arrow)' }));
      const [lx, ly] = pt(answer.course, 100);
      svg.append(el('text', { x: lx, y: ly - 6, class: 'label strong', 'text-anchor': 'middle' }, `${fmt(answer.course)}°`));
    }
    svg.append(el('circle', { cx: yx, cy: yy, r: 6, class: 'you' }));
    svg.append(el('text', { x: yx > C ? yx - 9 : yx + 9, y: yy - 9, class: 'label', 'text-anchor': yx > C ? 'end' : 'start' }, 'YOU'));
    svg.append(el('path', { d: `M${fx} ${fy - 8} L${fx + 8} ${fy} L${fx} ${fy + 8} L${fx - 8} ${fy} Z`, class: 'fix' }));
    svg.append(el('text', { x: fx > C ? fx - 10 : fx + 10, y: fy + 16, class: 'label', 'text-anchor': fx > C ? 'end' : 'start' }, 'FIX'));
    svg.setAttribute('aria-label', `Compass plot centred on Mother. You: ${fmt(from.radial)} radial, ${from.dme} DME. Marshal fix: ${fmt(to.radial)} radial, ${to.dme} DME.`
      + (revealed && answer.course !== null ? ` Direct track ${fmt(answer.course)} degrees magnetic.` : ''));
    if (!revealed) out.textContent = 'Estimate the heading, then check it or reveal the solution.';
    else if (answer.course === null) out.textContent = 'You are already at the fix.';
    else out.textContent = `Direct track ${fmt(answer.course)}° magnetic, ${answer.distance.toFixed(1)} NM. `
      + `At this illustration’s fixed 250 NM/hour map rate (no wind) that takes ${clock(timeEnroute(answer.distance, 250))}.`;
  }

  root.addEventListener('input', () => { revealed = false; feedback.textContent = ''; draw(); });
  root.querySelector('[data-check]').addEventListener('click', () => {
    let course;
    try { const { from, to } = problem(); ({ course } = pointToPoint(from, to)); } catch (error) { feedback.textContent = error.message; return; }
    const guess = num(f.guess);
    if (course === null || !Number.isFinite(guess) || f.guess.value === '') {
      feedback.textContent = course === null ? 'You are already at the fix.' : 'Enter a heading from 000 to 359 first.';
      return;
    }
    const error = Math.abs(((guess - course + 540) % 360) - 180);
    revealed = true;
    draw();
    feedback.textContent = error <= 10
      ? `Good estimate: ${Math.round(error)}° from the direct track. Keep refining it as radial and DME change.`
      : `${Math.round(error)}° from the direct track. Compare the YOU → FIX line with the dashed line through Mother.`;
  });
  root.querySelector('[data-reveal]').addEventListener('click', () => { revealed = true; draw(); });
  root.querySelector('[data-new]').addEventListener('click', () => {
    f.brc.value = randomInt(0, 35) * 10;
    f.youRadial.value = randomInt(0, 359);
    f.youDme.value = randomInt(15, 45);
    f.guess.value = '';
    revealed = false; feedback.textContent = ''; draw();
  });
  draw();
}

/* ---------- Marshal fix entry ---------- */
const ENTRY_STEPS = {
  direct: (o, side) => `Direct: at the fix, turn ${side} (the hold’s direction) onto the outbound heading ${fmt(o)}° and follow the pattern.`,
  teardrop: (o, side) => `Teardrop: at the fix, turn to ${fmt(o)}°, 30° from the outbound course toward the holding side, fly one minute, then turn ${side} (the hold’s direction) to intercept the inbound course.`,
  parallel: (o, side) => `Parallel: at the fix, turn to ${fmt(o)}° to parallel the outbound course on the non-holding side for one minute, then turn ${side} (the hold’s direction) through more than 180° back to the fix.`,
};
const turnText = (t) => `${t.direction} ${Math.round(t.degrees)}°`;

function setupEntry(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const checked = (name) => root.querySelector(`[name="${name}"]:checked`).value;

  function draw() {
    const c = num(f.inbound), heading = num(f.heading), turns = checked('turns'), entry = checked('entry');
    root.querySelector('[data-heading-value]').textContent = `${fmt(heading)}°`;
    root.querySelector('[data-inbound-value]').textContent = `${fmt(c)}°`;
    let path;
    try { path = entryPath({ inboundCourse: c, heading, turns, entry }); } catch (error) { out.textContent = error.message; return; }
    const reach = Math.max(6, ...path.points.map((p) => Math.hypot(p.x, p.y)));
    const px = Math.min(16, 128 / reach);
    const xy = (x, y) => [C + px * x, C - px * y];
    // Hold-frame point: u NM to the right of the inbound direction, v NM behind the fix.
    const local = (u, v) => {
      const sn = Math.sin(c * Math.PI / 180), k = Math.cos(c * Math.PI / 180);
      return xy(u * k - v * sn, -u * sn - v * k);
    };
    svg.replaceChildren();
    arrowMarker(svg, 'entry-arrow');
    compass(svg, 140);
    // Racetrack: two 180° turns and two straight legs, from the trainer's geometry.
    const R = 25 / (3 * Math.PI), L = 25 / 6, side = turns === 'right' ? 1 : -1, track = [];
    for (let i = 0; i <= 24; i++) { const a = Math.PI * i / 24; track.push(local(R * side - R * side * Math.cos(a), -R * Math.sin(a))); }
    track.push(local(2 * R * side, L));
    for (let i = 0; i <= 24; i++) { const a = Math.PI * i / 24; track.push(local(R * side + R * side * Math.cos(a), L + R * Math.sin(a))); }
    track.push(local(0, 0));
    svg.append(el('polyline', { points: track.map((p) => p.join(',')).join(' '), class: 'racetrack' }));
    const [hx, hy] = local(R * side, L * 0.5);
    svg.append(el('text', { x: hx, y: hy, class: 'label', 'text-anchor': 'middle' }, 'holding side'));
    const [ix, iy] = local(0, L * 0.9);
    svg.append(el('line', { x1: ix, y1: iy, x2: C, y2: C, class: 'inbound', 'marker-end': 'url(#entry-arrow)' }));
    const [ax, ay] = pt(heading + 180, 132), [bx, by] = pt(heading + 180, 14);
    svg.append(el('line', { x1: ax, y1: ay, x2: bx, y2: by, class: 'arrival', 'marker-end': 'url(#entry-arrow)' }));
    svg.append(el('polyline', { points: path.points.map((p) => xy(p.x, p.y).join(',')).join(' '), class: 'flown' }));
    svg.append(el('path', { d: `M${C} ${C - 7} L${C + 7} ${C} L${C} ${C + 7} L${C - 7} ${C} Z`, class: 'fix' }));
    svg.setAttribute('aria-label', `Fix at centre, ${turns}-hand racetrack with inbound course ${fmt(c)} degrees, arrival heading ${fmt(heading)} degrees and the flown ${entry} entry.`);
    const outbound = norm(c + 180);
    const steps = ENTRY_STEPS[entry](path.legHeading ?? outbound, turns);
    const flown = entry === 'direct'
      ? `From this heading the turn onto the outbound leg is ${turnText(path.firstTurn)}.`
      : `From this heading the first turn is ${turnText(path.firstTurn)} and the turn back is ${turnText(path.secondTurn)}.`;
    const miss = path.miss > 0.5 ? ` The path returns no closer than ${path.miss.toFixed(1)} NM from the fix.` : '';
    out.textContent = `${steps} ${flown}${miss}`;
  }

  root.addEventListener('input', draw);
  root.addEventListener('change', draw);
  root.querySelector('[data-new]').addEventListener('click', () => {
    f.heading.value = randomInt(0, 359);
    draw();
  });
  draw();
}

/* ---------- Making EAT ---------- */
function seconds(text) {
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(text.trim());
  if (!m || +m[1] > 23 || +m[2] > 59 || +(m[3] ?? 0) > 59) return null;
  return +m[1] * 3600 + +m[2] * 60 + +(m[3] ?? 0);
}

function setupEat(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');

  function bar(segments, total) {
    svg.replaceChildren();
    let x = 0;
    for (const [length, label, kind] of segments) {
      const w = (length / total) * 300;
      svg.append(el('rect', { x: 10 + x, y: 14, width: Math.max(w - 2, 1), height: 26, class: `circuit ${kind}` }));
      if (w > 34) svg.append(el('text', { x: 10 + x + w / 2, y: 31, class: 'label', 'text-anchor': 'middle' }, label));
      x += w;
    }
    svg.append(el('text', { x: 10, y: 56, class: 'label' }, 'At fix'));
    svg.append(el('text', { x: 310, y: 56, class: 'label strong', 'text-anchor': 'end' }, 'EAT'));
  }

  function draw() {
    const arrive = seconds(f.arrive.value), eat = seconds(f.eat.value);
    if (arrive === null || eat === null) { out.replaceChildren('Enter times as HH:MM or HH:MM:SS.'); svg.replaceChildren(); return; }
    let available = eat - arrive;
    if (available < -12 * 3600) available += 24 * 3600; // EAT after midnight
    const plan = eatPlan({ secondsToEat: available });
    const lines = [`Time from the fix to EAT: ${clock(Math.max(available, 0))}. A standard circuit takes ${clock(plan.standard)}.`];
    if (plan.kind === 'late') {
      lines.push(`EAT passed ${clock(plan.lateBy)} ago. In the trainer, request an amended EAT on Marshal.`);
      svg.replaceChildren();
    } else if (plan.kind === 'short' && available === 0) {
      lines.push('You reach the fix exactly at EAT: no hold is needed, so call Commencing as you pass it inbound.');
      svg.replaceChildren();
    } else if (plan.kind === 'short') {
      lines.push(`Less than ${clock(plan.minimum)} remains, the time for the two turns alone, so no circuit fits. The trainer’s aircraft waits at the fix, which a real aircraft cannot do; in the trainer, request an amended EAT if you will miss it.`);
      bar([[available, clock(available), 'short']], available);
    } else if (plan.kind === 'exact') {
      lines.push(`Fly ${plan.circuits} standard circuit${plan.circuits === 1 ? '' : 's'}. You return to the fix inbound exactly at EAT.`);
      bar(Array.from({ length: plan.circuits }, () => [plan.standard, '6:00', 'standard']), available);
    } else {
      const option = (o, verb) => {
        const adjusted = `one circuit with ${legClock(o.legSeconds)} outbound and inbound legs (${clock(240 + 2 * o.legSeconds)} circuit)`;
        return o.circuits === 0 ? `${verb}: fly ${adjusted}.`
          : `${verb}: fly ${o.circuits} standard circuit${o.circuits === 1 ? '' : 's'}, then ${adjusted}.`;
      };
      const best = plan.extend ?? plan.shorten;
      if (plan.extend) lines.push(option(plan.extend, 'Extend'));
      if (plan.shorten) lines.push(option(plan.shorten, 'Shorten'));
      lines.push(plan.extend && plan.shorten ? 'Either option returns you to the fix inbound at EAT in this model.'
        : 'This returns you to the fix inbound at EAT in this model.');
      bar([...Array.from({ length: best.circuits }, () => [plan.standard, '6:00', 'standard']),
        [240 + 2 * best.legSeconds, clock(240 + 2 * best.legSeconds), 'adjusted']], available);
    }
    out.replaceChildren(...lines.map((text) => Object.assign(document.createElement('p'), { textContent: text })));
    svg.setAttribute('aria-label', lines.join(' '));
  }

  root.addEventListener('input', draw);
  draw();
}

/* ---------- Self-check ---------- */
function setupQuiz(root) {
  root.querySelector('[data-check]').addEventListener('click', () => {
    let score = 0;
    const questions = root.querySelectorAll('fieldset');
    for (const q of questions) {
      const choice = q.querySelector('input:checked');
      const right = choice?.value === q.dataset.answer;
      if (right) score++;
      const note = q.querySelector('[data-explanation]');
      note.hidden = false;
      note.firstElementChild.textContent = !choice ? 'Not answered. ' : right ? 'Correct. ' : 'Not quite. ';
    }
    root.querySelector('[data-score]').textContent = `${score} of ${questions.length} correct.`;
  });
}

/* ---------- Figure 1: recovery overview callouts ---------- */
// Selecting a callout, in the list or on the figure, highlights the parts of
// the figure it describes. The list text is the explanation; nothing is hidden.
function setupOverview(root) {
  const svg = root.querySelector('svg');
  const items = [...root.querySelectorAll('[data-callout-item]')];
  const select = (n) => {
    for (const part of svg.querySelectorAll('[data-part]'))
      part.classList.toggle('active', part.dataset.part.split(' ').includes(n));
    for (const item of items) {
      const on = item.dataset.calloutItem === n;
      item.classList.toggle('active', on);
      item.querySelector('button').setAttribute('aria-pressed', String(on));
    }
  };
  for (const item of items) {
    const button = item.querySelector('button');
    button.addEventListener('click', () => select(item.dataset.calloutItem));
  }
  for (const callout of svg.querySelectorAll('[data-callout]')) {
    callout.addEventListener('click', () => {
      const n = callout.dataset.callout;
      select(n);
      items.find((i) => i.dataset.calloutItem === n)?.querySelector('button').focus();
    });
  }
  select('1');
}

/* ---------- Figure 2: CV-1 example profile ---------- */
const feet = (ft) => `${Math.round(ft).toLocaleString('en-US')} ft`;
const nm = (d) => (d < 1 ? d.toFixed(2) : d.toFixed(1));

function setupProfile(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const rows = [...root.querySelectorAll('tr[data-dme]')];
  const play = root.querySelector('[data-play]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const H = 300, X0 = 60, X1 = 700, Y0 = 260, Y1 = 24, MAXNM = 30, MAXFT = 15000;
  const x = (d) => X1 - (d / MAXNM) * (X1 - X0);
  const y = (a) => Y0 - (a / MAXFT) * (Y0 - Y1);
  let timer = null;

  // Rows whose range depends on the marshal altitude carry a key, not a number.
  const rowDme = (row, p) => ({ fix: p.fix.dme, platform: p.platformDme, level: p.levelDme })[row.dataset.dme] ?? Number(row.dataset.dme);

  function draw() {
    const p = approachProfile({ angels: num(f.angels) });
    root.querySelector('[data-angels-value]').textContent = `Angels ${f.angels.value} · fix ${p.fix.dme} DME`;
    if (Number(f.pos.max) !== p.fix.dme) { f.pos.max = p.fix.dme; if (num(f.pos) > p.fix.dme) f.pos.value = p.fix.dme; }
    const pos = num(f.pos), alt = profileAltitude(p, pos);
    for (const row of rows) {
      const d = rowDme(row, p);
      const cells = row.querySelectorAll('[data-cell]');
      if (row.dataset.dme in { fix: 1, platform: 1, level: 1 }) cells[0].textContent = row.dataset.dme === 'fix' ? String(d) : `≈${nm(d)}`;
      if (row.dataset.dme === 'fix') cells[1].textContent = feet(p.fix.altitude);
      row.classList.toggle('passed', pos <= d + 1e-9);
    }
    const current = rows.filter((r) => pos <= rowDme(r, p) + 1e-9).at(-1);
    const next = rows.find((r) => rowDme(r, p) < pos - 1e-9);
    svg.replaceChildren();
    arrowMarker(svg, 'profile-arrow');
    for (let d = 0; d <= MAXNM; d += 5) {
      svg.append(el('line', { x1: x(d), y1: Y0, x2: x(d), y2: Y1, class: 'grid' }));
      svg.append(el('text', { x: x(d), y: Y0 + 16, class: 'label', 'text-anchor': 'middle' }, String(d)));
    }
    for (let a = 0; a <= MAXFT; a += 5000) {
      svg.append(el('line', { x1: X0, y1: y(a), x2: X1, y2: y(a), class: 'grid' }));
      svg.append(el('text', { x: X0 - 6, y: y(a) + 4, class: 'label', 'text-anchor': 'end' }, a ? `${a / 1000},000` : '0'));
    }
    svg.append(el('text', { x: (X0 + X1) / 2, y: H - 6, class: 'label strong', 'text-anchor': 'middle' }, 'RANGE FROM SHIP (NM)'));
    svg.append(el('text', { x: 12, y: 16, class: 'label strong' }, 'ALTITUDE (FT)'));
    svg.append(el('polyline', { points: p.points.map(([d, a]) => `${x(d)},${y(a)}`).join(' '), class: 'path' }));
    const marks = [
      [p.fix.dme, p.fix.altitude, 'FIX · COMMENCE', -12],
      [p.platformDme, 5000, 'PLATFORM', -12],
      [p.levelDme, 1200, 'LEVEL 1,200', -12],
      [3, 1200, '3 NM GCA', -12],
      [0.75, 300, '¾ BALL', -14],
    ];
    for (const [d, a, label, dy] of marks) {
      svg.append(el('circle', { cx: x(d), cy: y(a), r: 4, class: 'mark' }));
      svg.append(el('text', { x: x(d), y: y(a) + dy, class: 'label', 'text-anchor': 'middle' }, label));
    }
    svg.append(el('text', { x: x(p.fix.dme) - 18, y: y(p.fix.altitude) + 4, class: 'label', 'text-anchor': 'end' }, '4,000 FT/MIN'));
    svg.append(el('text', { x: x((p.platformDme + p.levelDme) / 2), y: y(3100) + 18, class: 'label', 'text-anchor': 'middle' }, '2,000 FT/MIN'));
    // Landing checks, gear and 150 kt points (10, 8 and 6 DME) as ticks; the table names them.
    for (const d of [10, 8, 6]) svg.append(el('line', { x1: x(d), y1: Y0, x2: x(d), y2: Y0 - 8, class: 'tick' }));
    svg.append(el('line', { x1: x(8), y1: Y0 - 48, x2: x(4), y2: Y0 - 48, class: 'dim', 'marker-start': 'url(#profile-arrow)', 'marker-end': 'url(#profile-arrow)' }));
    svg.append(el('text', { x: x(6), y: Y0 - 54, class: 'label', 'text-anchor': 'middle' }, 'ACLS LOCK-ON 8–4'));
    svg.append(el('path', { d: `M${x(0) - 14} ${Y0} L${x(0) + 6} ${Y0} L${x(0) + 10} ${Y0 - 6} L${x(0) - 14} ${Y0 - 6} Z`, class: 'station' }));
    // Aircraft symbol: a small side-view silhouette heading toward the ship.
    const [ax, ay] = [x(pos), y(alt)];
    svg.append(el('line', { x1: ax, y1: ay, x2: ax, y2: Y0, class: 'drop' }));
    svg.append(el('path', { d: `M${ax + 12} ${ay} L${ax - 8} ${ay - 3} L${ax - 12} ${ay - 9} L${ax - 14} ${ay - 9} L${ax - 13} ${ay + 1} L${ax - 8} ${ay + 3} Z`, class: 'acft' }));
    const readout = root.querySelector('[data-readout]');
    const phase = current?.querySelector('[data-cell="what"]')?.textContent ?? 'At the marshal fix.';
    const coming = next ? `Next, at ${nm(rowDme(next, p))} NM: ${next.querySelector('[data-cell="what"]').textContent}` : 'The approach ends at the ship.';
    readout.replaceChildren(
      ...[`${nm(pos)} NM from the ship · ${feet(alt)} in this model.`, `Last point passed: ${phase}`, coming]
        .map((t) => Object.assign(document.createElement('p'), { textContent: t })));
    svg.setAttribute('aria-label', `Profile from angels ${f.angels.value} at ${p.fix.dme} DME: platform at ${nm(p.platformDme)} NM, level 1,200 ft at ${nm(p.levelDme)} NM. Aircraft at ${nm(pos)} NM, ${feet(alt)}.`);
  }

  const stop = () => { clearInterval(timer); timer = null; play.textContent = 'Fly it'; play.setAttribute('aria-pressed', 'false'); };
  play.addEventListener('click', () => {
    if (timer) return stop();
    if (num(f.pos) <= 0.25) f.pos.value = f.pos.max;
    play.textContent = 'Pause'; play.setAttribute('aria-pressed', 'true');
    // 0.25 NM per tick; reduced motion jumps a whole NM less often.
    const step = reduced ? 1 : 0.25;
    timer = setInterval(() => {
      f.pos.value = Math.max(0, num(f.pos) - step);
      draw();
      if (num(f.pos) <= 0) stop();
    }, reduced ? 700 : 120);
  });
  root.addEventListener('input', (e) => { if (e.target === f.pos && timer) stop(); draw(); });
  draw();
}

/* ---------- Marshal stack and clearance decoder ---------- */
function setupStack(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const X1 = 690, PX = 16, Y0 = 268, PY = 0.0175;
  const x = (d) => X1 - d * PX, y = (a) => Y0 - a * PY;

  // Clearance decoder: turn each <dt> into a phrase button; its <dd> explains it.
  const dl = root.querySelector('dl.decode');
  const sentence = root.querySelector('[data-clearance]');
  const meaning = root.querySelector('[data-meaning]');
  const pairs = [...dl.querySelectorAll('dt')].map((dt) => [dt, dt.nextElementSibling]);
  for (const [dt, dd] of pairs) {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: dt.textContent, className: 'phrase' });
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      for (const other of sentence.querySelectorAll('button')) other.setAttribute('aria-pressed', String(other === b));
      meaning.textContent = dd.textContent;
      if (dt.dataset.angels) { f.angels.value = dt.dataset.angels; draw(); }
    });
    sentence.append(b, ' ');
  }
  dl.hidden = true;
  sentence.querySelector('button')?.click();

  function draw() {
    const angels = num(f.angels), fix = marshalFix(angels), p = approachProfile({ angels });
    root.querySelector('[data-stack-value]').textContent = `Angels ${angels}: ${fix.altitude.toLocaleString('en-US')} ft at ${fix.dme} DME`;
    svg.replaceChildren();
    arrowMarker(svg, 'stack-arrow');
    svg.append(el('line', { x1: 20, y1: Y0, x2: 712, y2: Y0, class: 'sea' }));
    for (let d = 0; d <= 35; d += 5) {
      svg.append(el('line', { x1: x(d), y1: Y0, x2: x(d), y2: Y0 + 6, class: 'tick' }));
      svg.append(el('text', { x: x(d), y: Y0 + 18, class: 'label', 'text-anchor': 'middle' }, String(d)));
    }
    svg.append(el('text', { x: 20, y: Y0 + 34, class: 'label strong' }, 'DME FROM SHIP (NM) · VERTICAL SCALE EXAGGERATED'));
    svg.append(el('path', { d: `M${x(0) - 16} ${Y0} L${x(0) + 8} ${Y0} L${x(0) + 12} ${Y0 - 7} L${x(0) - 16} ${Y0 - 7} Z`, class: 'station' }));
    svg.append(el('text', { x: x(0) - 4, y: Y0 - 12, class: 'label', 'text-anchor': 'middle' }, 'MOTHER'));
    for (let a = 6; a <= 14; a++) {
      const s = marshalFix(a), on = a === angels;
      svg.append(el('ellipse', { cx: x(s.dme), cy: y(s.altitude), rx: 9, ry: 4, class: on ? 'slot on' : 'slot' }));
      svg.append(el('text', { x: x(s.dme) + 13, y: y(s.altitude) + 4, class: on ? 'label strong' : 'label' }, on ? `ANGELS ${a} · ${s.dme} DME` : `${a}`));
    }
    svg.append(el('text', { x: x(29) - 12, y: y(14000) - 22, class: 'label' }, 'STACK · 1,000 FT APART'));
    // The source requires being level at the assigned altitude 10 NM from the stack.
    svg.append(el('line', { x1: x(fix.dme + 10), y1: y(fix.altitude), x2: x(fix.dme) - 12, y2: y(fix.altitude), class: 'arrival', 'marker-end': 'url(#stack-arrow)' }));
    svg.append(el('text', { x: x(fix.dme + 10), y: y(fix.altitude) + 16, class: 'label' }, 'LEVEL BY 10 NM FROM STACK'));
    svg.append(el('polyline', { points: p.points.map(([d, a]) => `${x(d)},${y(a)}`).join(' '), class: 'flown' }));
    svg.append(el('circle', { cx: x(p.platformDme), cy: y(5000), r: 3.5, class: 'mark' }));
    svg.append(el('text', { x: x(p.platformDme) + 8, y: y(5000) + 14, class: 'label' }, 'PLATFORM 5,000'));
    svg.setAttribute('aria-label', `Marshal stack side view. Angels 6 to 14 at 21 to 29 DME. Selected: angels ${angels} at ${fix.dme} DME, with the CV-1 example descent to the ship.`);

    // Final-bearing correction (P-816 p. 2-23).
    const out = root.querySelector('[data-correction]');
    let c;
    try { c = finalCorrection({ marshalRadial: bounded(f.radial), finalBearing: bounded(f.fb) }); } catch (error) { out.textContent = error.message; return; }
    const side = c.offset > 0 ? 'right' : 'left';
    // The final-bearing line runs aft of the ship, on the side opposite the offset.
    out.textContent = c.kind === 'none'
      ? `Inbound course ${fmt(c.inbound)}° already matches the final bearing: no correction.`
      : `Inbound course ${fmt(c.inbound)}°. Final bearing ${fmt(num(f.fb))}° is ${Math.abs(c.offset)}° ${side} of it, so the example procedure calls for ${c.kind === 'gradual' ? 'a gradual correction' : 'a 30° correction at 20 DME'}. The source gives no turn direction; geometrically the final-bearing line lies to your ${c.turn} astern of the ship, so this module's reading turns ${c.turn}${c.kind === 'thirty' ? `, for example to ${fmt(c.inbound + (c.turn === 'right' ? 30 : -30))}° if the 30° is taken as an intercept angle` : ''}.`;
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Timed turns on the turn needle ---------- */
function setupTurn(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const needle = root.querySelector('[data-needle]'), card = root.querySelector('[data-card]');
  const headingOut = root.querySelector('[data-heading-readout]');
  const out = root.querySelector('[data-result]'), task = root.querySelector('[data-task]'), clockOut = root.querySelector('[data-clock]');
  const start = root.querySelector('[data-start]'), rollout = root.querySelector('[data-rollout]');
  const WIDTH_DEG = 6.5; // needle rotation for one needle width in the drawing
  let turn = { from: 40, to: 310, direction: 'left' }, run = null, heading = turn.from;

  const rate = () => Number(f.aircraft.selectedOptions[0].dataset.oneWidth) * Number(root.querySelector('[name="widths"]:checked').value);
  const widths = () => Number(root.querySelector('[name="widths"]:checked').value);
  const show = (hdg, sign) => {
    heading = norm(hdg);
    card.setAttribute('transform', `rotate(${-heading})`);
    needle.setAttribute('transform', `rotate(${sign * widths() * WIDTH_DEG} 0 20)`);
    headingOut.textContent = `${fmt(heading)}°`;
  };
  function brief() {
    const degrees = turnAmount(turn.from, turn.to, turn.direction);
    const seconds = turnSeconds(degrees, rate());
    task.textContent = `Turn ${turn.direction} from ${fmt(turn.from)}° to ${fmt(turn.to)}°: ${degrees}°.`;
    out.textContent = `At ${widths()} needle width${widths() === 1 ? '' : 's'} (${rate()}°/s) this turn takes ${clock(seconds)}. A 180° turn takes ${clock(turnSeconds(180, rate()))}; 360° takes ${clock(turnSeconds(360, rate()))}.`;
    return { degrees, seconds };
  }
  function reset() {
    cancelAnimationFrame(run?.frame); run = null;
    start.disabled = false; rollout.disabled = true; f.speed.disabled = false;
    clockOut.textContent = '0:00';
    show(turn.from, 0);
    brief();
  }
  start.addEventListener('click', () => {
    const { degrees } = brief();
    const speed = Number(f.speed.value), sign = turn.direction === 'right' ? 1 : -1, r = rate();
    const t0 = performance.now();
    // Speed is read once per run, so lock it until roll-out.
    start.disabled = true; rollout.disabled = false; f.speed.disabled = true; rollout.focus();
    const tick = (now) => {
      const t = ((now - t0) / 1000) * speed;
      run.turned = Math.min(r * t, 720);
      clockOut.textContent = clock(t);
      show(turn.from + sign * run.turned, 1 * sign);
      if (run.turned < 720) run.frame = requestAnimationFrame(tick);
    };
    run = { turned: 0, degrees, frame: requestAnimationFrame(tick) };
  });
  rollout.addEventListener('click', () => {
    if (!run) return;
    cancelAnimationFrame(run.frame);
    const error = run.turned - run.degrees;
    show(heading, 0);
    out.textContent = Math.abs(error) <= 5
      ? `Rolled out on ${fmt(heading)}°, ${Math.abs(error).toFixed(0)}° from the target. Good timing.`
      : `Rolled out on ${fmt(heading)}°: ${Math.abs(error).toFixed(0)}° ${error > 0 ? 'past' : 'short of'} ${fmt(turn.to)}°. At ${rate()}°/s each second is ${rate()}°.`;
    run = null; start.disabled = false; rollout.disabled = true; f.speed.disabled = false;
  });
  root.querySelector('[data-new]').addEventListener('click', () => {
    const from = randomInt(0, 35) * 10, by = randomInt(3, 27) * 10, direction = Math.random() < 0.5 ? 'left' : 'right';
    turn = { from, to: norm(from + (direction === 'right' ? by : -by)), direction };
    reset();
  });
  root.querySelector('[data-reset]').addEventListener('click', reset);
  root.addEventListener('change', (e) => { if (e.target.name !== 'speed') reset(); });
  reset();
}

/* ---------- Optical landing system ---------- */
function setupLens(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg'), ball = svg.querySelector('[data-ball]');
  const out = root.querySelector('[data-result]'), waveoff = root.querySelector('[data-waveoff]');
  const says = [...root.querySelectorAll('[data-ball-state]')];
  function draw() {
    const k = num(f.glide); // lens cells above (+) or below (−) the datum
    ball.setAttribute('cy', String(119 - k * 15));
    const state = k <= -3 ? 'red' : k < 0 ? 'low' : k > 0 ? 'high' : 'on';
    ball.classList.toggle('red', state === 'red');
    const lines = [says.find((s) => s.dataset.ballState === state).textContent];
    const wo = waveoff.getAttribute('aria-pressed') === 'true';
    svg.classList.toggle('waveoff', wo);
    if (wo) lines.push(says.find((s) => s.dataset.ballState === 'waveoff').textContent);
    out.textContent = lines.join(' ');
  }
  waveoff.addEventListener('click', () => { waveoff.setAttribute('aria-pressed', String(waveoff.getAttribute('aria-pressed') !== 'true')); draw(); });
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Communications ladder and example dialogue ---------- */
function setupComms(root) {
  const steps = [...root.querySelectorAll('.dialogue > li')];
  const stations = [...root.querySelectorAll('[data-agency-station]')];
  const counter = root.querySelector('[data-step]');
  const all = root.querySelector('[data-all]');
  let at = 0;
  function show() {
    const showAll = all.getAttribute('aria-pressed') === 'true';
    steps.forEach((s, i) => { s.hidden = !showAll && i !== at; s.classList.toggle('current', i === at); });
    const agency = steps[at].dataset.agency;
    for (const st of stations) {
      st.classList.toggle('on', st.dataset.agencyStation === agency);
      st.querySelector('button').setAttribute('aria-pressed', String(st.dataset.agencyStation === agency));
    }
    counter.textContent = `Call ${at + 1} of ${steps.length}`;
  }
  root.querySelector('[data-prev]').addEventListener('click', () => { at = Math.max(0, at - 1); show(); });
  root.querySelector('[data-next]').addEventListener('click', () => { at = Math.min(steps.length - 1, at + 1); show(); });
  all.addEventListener('click', () => { all.setAttribute('aria-pressed', String(all.getAttribute('aria-pressed') !== 'true')); show(); });
  for (const st of stations) st.querySelector('button').addEventListener('click', () => {
    const i = steps.findIndex((s) => s.dataset.agency === st.dataset.agencyStation);
    if (i >= 0) { at = i; show(); }
  });
  show();
}

/* ---------- Radio terms quiz ---------- */
function setupJargon(root) {
  // The term list sits just before the quiz section.
  const terms = [...document.querySelectorAll('dl.jargon > div')].map((d) => ({
    term: d.querySelector('dt').textContent.trim(), meaning: d.querySelector('dd').textContent.trim(),
  }));
  const prompt = root.querySelector('[data-prompt]'), choices = root.querySelector('[data-choices]');
  const out = root.querySelector('[data-result]');
  let score = 0, asked = 0;
  function ask() {
    const pool = [...terms].sort(() => Math.random() - 0.5).slice(0, 4);
    const answer = pool[randomInt(0, pool.length - 1)];
    // Hide the term itself if a definition repeats it.
    prompt.textContent = answer.meaning.replace(new RegExp(answer.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '—');
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
  navigation: setupNavigation, entry: setupEntry, eat: setupEat, quiz: setupQuiz,
  overview: setupOverview, profile: setupProfile, stack: setupStack, turn: setupTurn,
  lens: setupLens, comms: setupComms, jargon: setupJargon,
};
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}

