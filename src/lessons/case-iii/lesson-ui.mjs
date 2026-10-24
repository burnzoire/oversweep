// Presentation for the Case III module's interactive blocks. All numbers come
// from lesson-model.mjs; this file only reads inputs and draws results.
import { eatPlan, entryPath, norm, pointToPoint, reciprocal, timeEnroute } from './lesson-model.mjs';

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
      + `At the trainer’s fixed 250 NM/hour map rate (no wind) that takes ${clock(timeEnroute(answer.distance, 250))}.`;
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

const blocks = { navigation: setupNavigation, entry: setupEntry, eat: setupEat, quiz: setupQuiz };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
