// Presentation for the BFM module's interactive blocks. All numbers come from
// lesson-model.mjs; this file only reads inputs and draws results.
import { BANDS, T45, geometry, levelTurn, maxNoseLow, norm, pursuit, radialG, speedBand } from './lesson-model.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const rad = (d) => d * Math.PI / 180;
const r0 = (v) => Math.round(v).toLocaleString('en-US');
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}

// Top-view aircraft outline, nose up, about 26 units long; rotated to heading.
const JET = 'M0 -13 L2 -6 L2 -2 L11 4 L11 6 L2 4 L2 9 L5 12 L5 13 L0 12 L-5 13 L-5 12 L-2 9 L-2 4 L-11 6 L-11 4 L-2 -2 L-2 -6 Z';
// Side-view outline, nose to +x, fin up; rotated to pitch.
const SIDE = 'M-14 -1 L8 -3 L15 0 L8 3 L-14 2 Z M-14 -1 L-17 -9 L-12 -9 L-8 -2 Z';
const side = (x, y, pitch, cls) => el('path', { d: SIDE, class: cls, transform: `translate(${x} ${y}) rotate(${-pitch})` });
const jet = (x, y, heading, cls) => el('path', { d: JET, class: cls, transform: `translate(${x} ${y}) rotate(${heading})` });

// Plan-view world (ft, x east, y north) to screen.
const view = (cx, cy, scale, ox = 0, oy = 0) => (x, y) => [cx + (x - ox) * scale, cy - (y - oy) * scale];

function arc(cx, cy, r, from, to) {
  // Clockwise screen arc between two compass directions.
  let sweep = norm(to - from);
  if (sweep > 180) [from, sweep] = [to, 360 - sweep];
  const p = (d) => [cx + r * Math.sin(rad(d)), cy - r * Math.cos(rad(d))];
  const [x1, y1] = p(from), [x2, y2] = p(from + sweep);
  return `M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`;
}

function sector(cx, cy, r1, r2, centre, half) {
  const p = (r, d) => [cx + r * Math.sin(rad(d)), cy - r * Math.cos(rad(d))];
  const [a, b, c, d] = [p(r1, centre - half), p(r2, centre - half), p(r2, centre + half), p(r1, centre + half)];
  return `M${a} L${b} A${r2} ${r2} 0 0 1 ${c} L${d} A${r1} ${r1} 0 0 0 ${a}Z`;
}

/* ---------- Geometry explorer ---------- */
function setupGeometry(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  function draw() {
    const range = Number(f.range.value), off = Number(f.off.value), rel = Number(f.rel.value);
    for (const [name, text] of [['range', `${r0(range)} ft`], ['off', `${Math.abs(off)}° ${off < 0 ? 'left' : off > 0 ? 'right' : ''}`], ['rel', `${Math.abs(rel)}° ${rel < 0 ? 'left' : rel > 0 ? 'right' : ''}`]])
      root.querySelector(`output[for="${name}"]`).textContent = text;
    const fighter = { x: 0, y: 0, heading: 0 };
    const bandit = { x: range * Math.sin(rad(off)), y: range * Math.cos(rad(off)), heading: norm(rel) };
    const g = geometry(fighter, bandit);
    const at = view(320, 220, 0.026, bandit.x / 2, bandit.y / 2);
    const s = 0.026;
    svg.replaceChildren();
    svg.append(el('rect', { x: 1, y: 1, width: 638, height: 438, class: 'frame' }));
    const [bx, by] = at(bandit.x, bandit.y), [fx, fy] = at(0, 0);
    // Control zone band behind the bandit (width illustrative).
    svg.append(el('path', { d: sector(bx, by, T45.controlZone[0] * s, T45.controlZone[1] * s, bandit.heading + 180, 30), class: 'zone' }));
    for (const c of g.centres) { const [x, y] = at(c.x, c.y); svg.append(el('circle', { cx: x, cy: y, r: T45.bubbleRadius * s, class: 'ln dashed' })); }
    // 3/9 line through the bandit's wingtips.
    const w = rad(bandit.heading + 90);
    svg.append(el('line', { x1: bx - 600 * Math.sin(w), y1: by + 600 * Math.cos(w), x2: bx + 600 * Math.sin(w), y2: by - 600 * Math.cos(w), class: 'ln centreline' }));
    svg.append(el('line', { x1: fx, y1: fy, x2: bx, y2: by, class: 'los' }));
    svg.append(el('line', { x1: fx, y1: fy, x2: fx, y2: fy - 70, class: 'ln' }));
    svg.append(el('path', { d: arc(fx, fy, 34, 0, g.los), class: 'angle' }));
    svg.append(el('line', { x1: bx, y1: by, x2: bx + 60 * Math.sin(rad(bandit.heading)), y2: by - 60 * Math.cos(rad(bandit.heading)), class: 'ln' }));
    svg.append(el('path', { d: arc(bx, by, 26, bandit.heading, g.los + 180), class: 'angle bandit' }));
    svg.append(jet(fx, fy, 0, 'own'), jet(bx, by, bandit.heading, 'bandit'));
    svg.append(el('text', { x: fx + 16, y: fy + 18, class: 'lbl' }, 'YOU'));
    svg.append(el('text', { x: bx + 16, y: by + 18, class: 'lbl' }, 'BANDIT'));
    svg.append(el('text', { x: 12, y: 22, class: 'lbl small' }, '- - BANDIT BUBBLE (3,000 FT TURN CIRCLES)   — · — BANDIT 3/9 LINE   ▒ CONTROL ZONE BAND'));
    out.replaceChildren(
      ...[
        `Range ${r0(g.range)} ft · angle off your nose ${Math.round(g.aon)}° · target aspect ${Math.round(g.aspect)}° · you are ${Math.round(g.aot)}° off the bandit's tail.`,
        g.behindLine ? 'You are behind the bandit’s 3/9 line: a positional advantage.' : 'You are ahead of the bandit’s 3/9 line: no positional advantage.',
        g.inBubble ? 'You are inside the bandit’s bubble: it cannot turn inside its own turn circle, so for now it cannot bring its nose to bear on you.' : 'You are outside the bandit’s bubble: it has the turning room to bring its nose toward you.',
        g.inControlRange ? 'You are in the control zone’s 2,000–4,000 ft range band behind the bandit.' : 'You are not in the control zone’s range band behind the bandit.',
      ].map((t) => Object.assign(document.createElement('p'), { textContent: t })),
    );
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Pursuit curves ---------- */
function setupPursuit(root) {
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  let frame = 0;
  function run() {
    cancelAnimationFrame(frame);
    const mode = root.querySelector('input[name="mode"]:checked').value;
    const track = pursuit({ mode });
    const xs = track.flatMap((p) => [p.fighter.x, p.bandit.x]), ys = track.flatMap((p) => [p.fighter.y, p.bandit.y]);
    const ox = (Math.min(...xs) + Math.max(...xs)) / 2, oy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const scale = Math.min(600 / (Math.max(...xs) - Math.min(...xs)), 340 / (Math.max(...ys) - Math.min(...ys)));
    const at = view(320, 200, scale, ox, oy);
    const line = (key, n) => track.slice(0, n + 1).map((p, i) => `${i ? 'L' : 'M'}${at(p[key].x, p[key].y)}`).join(' ');
    const minimum = track.reduce((m, p) => (p.range < m.range ? p : m));
    const draw = (n) => {
      const p = track[n];
      const [fx, fy] = at(p.fighter.x, p.fighter.y), [bx, by] = at(p.bandit.x, p.bandit.y);
      svg.replaceChildren(
        el('rect', { x: 1, y: 1, width: 638, height: 398, class: 'frame' }),
        el('path', { d: line('bandit', n), class: 'ln dashed' }),
        el('path', { d: line('fighter', n), class: 'track' }),
        el('line', { x1: fx, y1: fy, x2: bx, y2: by, class: 'los' }),
        jet(bx, by, p.bandit.h * 180 / Math.PI, 'bandit'),
        jet(fx, fy, p.fighter.h * 180 / Math.PI, 'own'),
        el('text', { x: 12, y: 22, class: 'lbl small' }, `${mode.toUpperCase()} PURSUIT · T + ${p.t.toFixed(1)} S · RANGE ${r0(p.range)} FT`),
        el('text', { x: 12, y: 388, class: 'lbl small' }, '— FIGHTER TRACK   - - BANDIT TRACK (3,000 FT TURN CIRCLE)'),
      );
    };
    const finish = () => {
      draw(track.length - 1);
      out.textContent = `${mode[0].toUpperCase()}${mode.slice(1)} pursuit: closest approach ${r0(minimum.range)} ft at ${minimum.t.toFixed(1)} s; range after ${track.at(-1).t.toFixed(0)} s is ${r0(track.at(-1).range)} ft.`;
    };
    if (reduceMotion()) return finish();
    out.textContent = '';
    const start = performance.now();
    const tick = (now) => {
      const n = Math.min(track.length - 1, Math.floor((now - start) / 1000 / 0.1 * 1.5));
      draw(n);
      if (n < track.length - 1) frame = requestAnimationFrame(tick); else finish();
    };
    frame = requestAnimationFrame(tick);
  }
  root.querySelector('[data-run]').addEventListener('click', run);
  root.addEventListener('change', run);
  run();
}

/* ---------- Turn performance ---------- */
function setupTurn(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  const tapeY = (k) => 400 - (k - 100) * 0.9; // 100–500 KIAS over 360 px
  function draw() {
    const speed = Number(f.speed.value), g = Number(f.g.value);
    root.querySelector('output[for="speed"]').textContent = `${speed} KIAS`;
    root.querySelector('output[for="g"]').textContent = `${g.toFixed(2)} G`;
    const turn = levelTurn({ speed, g }), band = speedBand(speed);
    svg.replaceChildren(el('rect', { x: 1, y: 1, width: 638, height: 438, class: 'frame' }));
    // Speed tape.
    svg.append(el('line', { x1: 90, y1: tapeY(100), x2: 90, y2: tapeY(500), class: 'ln heavy' }));
    for (let k = 100; k <= 500; k += 20) {
      svg.append(el('line', { x1: k % 100 ? 82 : 76, y1: tapeY(k), x2: 90, y2: tapeY(k), class: 'thin' }));
      if (k % 100 === 0) svg.append(el('text', { x: 70, y: tapeY(k) + 4, 'text-anchor': 'end', class: 'lbl small' }, k));
    }
    for (const b of BANDS) {
      const on = band.bands.includes(b.id);
      const x = 98;
      if (b.lo === b.hi) svg.append(el('line', { x1: 90, y1: tapeY(b.lo), x2: 120, y2: tapeY(b.lo), class: on ? 'mark-line on' : 'mark-line' }));
      else svg.append(el('rect', { x, y: tapeY(b.hi), width: 18, height: tapeY(b.lo) - tapeY(b.hi), class: on ? 'band on' : 'band' }));
      // The sustained band contains the 300 KIAS mark, so label it lower down.
      const y = b.id === 'sustained' ? tapeY(255) : (tapeY(b.lo) + tapeY(b.hi)) / 2;
      svg.append(el('text', { x: 124, y: y + 4, class: on ? 'lbl small on' : 'lbl small' }, `${b.label.toUpperCase()} ${b.lo === b.hi ? b.lo : `${b.lo}–${b.hi}`}`));
    }
    svg.append(el('path', { d: `M60 ${tapeY(speed)} l-14 -8 v16 z`, class: 'pointer' }));
    svg.append(el('text', { x: 50, y: 28, 'text-anchor': 'middle', class: 'lbl small' }, 'KIAS'));
    // Turn circle to the same scale as the 3,000 ft bubble.
    const cx = 470, cy = 230, s = 0.05;
    svg.append(el('circle', { cx, cy, r: T45.bubbleRadius * s, class: 'ln dashed' }));
    svg.append(el('text', { x: cx, y: cy - T45.bubbleRadius * s - 6, 'text-anchor': 'middle', class: 'lbl small' }, '3,000 FT BUBBLE'));
    const rr = Math.min(turn.radius * s, 200);
    svg.append(el('circle', { cx, cy, r: rr, class: 'ln heavy circle' }));
    svg.append(el('line', { x1: cx, y1: cy, x2: cx + rr, y2: cy, class: 'thin' }));
    svg.append(jet(cx + rr, cy, 180, 'own'));
    svg.append(el('text', { x: cx, y: cy + 16, 'text-anchor': 'middle', class: 'lbl small' }, turn.radius * s > 200 ? `R ${r0(turn.radius)} FT (OFF SCALE)` : `R ${r0(turn.radius)} FT`));
    const pull = band.pull === 'load'
      ? `Above corner: the maximum-performance pull is load-limited, ${T45.loadLimit} G above 5,000 ft.`
      : band.pull === 'lift'
        ? 'Below corner: the maximum-performance pull is lift-limited, 19–21 units AOA (rumble of buffet). The calculator does not know that limit and will compute any G you set.'
        : `At corner: best instantaneous turn, and the highest bleed rate, about ${T45.cornerBleed} kt per second in a maximum-performance pull.`;
    out.replaceChildren(
      ...[
        `Level turn at ${speed} kt and ${g.toFixed(2)} G: bank ${turn.bank.toFixed(1)}°, radius ${r0(turn.radius)} ft, rate ${turn.rate.toFixed(1)}° per second.`,
        pull,
        band.belowVertical ? 'Below the 300 KIAS minimum vertical airspeed.' : '',
      ].filter(Boolean).map((t) => Object.assign(document.createElement('p'), { textContent: t })),
    );
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Radial G in the vertical ---------- */
function setupLoop(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  function draw() {
    const theta = Number(f.theta.value), n = Number(f.n.value);
    root.querySelector('output[for="theta"]').textContent = `${theta}°`;
    root.querySelector('output[for="n"]').textContent = `${n.toFixed(1)} G`;
    const rg = radialG(n, theta);
    const cx = 240, cy = 210, R = 150;
    const x = cx + R * Math.sin(rad(theta)), y = cy + R * Math.cos(rad(theta));
    const k = 14; // px per G
    const toC = [(cx - x) / R, (cy - y) / R];
    svg.replaceChildren(
      el('rect', { x: 1, y: 1, width: 638, height: 438, class: 'frame' }),
      el('line', { x1: 40, y1: cy + R + 40, x2: 440, y2: cy + R + 40, class: 'thin' }),
      el('circle', { cx, cy, r: R, class: 'ln dashed' }),
      el('line', { x1: x, y1: y, x2: x + toC[0] * n * k, y2: y + toC[1] * n * k, class: 'vec lift', 'marker-end': 'url(#bfm-arrow)' }),
      el('line', { x1: x, y1: y, x2: x, y2: y + k, class: 'vec gravity', 'marker-end': 'url(#bfm-arrow)' }),
      side(x, y, theta, 'own'),
      el('text', { x: 440, y: 60, class: 'lbl' }, `PITCH AROUND LOOP ${theta}°`),
      el('text', { x: 440, y: 84, class: 'lbl' }, `LOAD FACTOR ${n.toFixed(1)}`),
      el('text', { x: 440, y: 108, class: 'lbl' }, `GRAVITY (RADIAL) ${(-Math.cos(rad(theta))).toFixed(2)}`),
      el('text', { x: 440, y: 140, class: 'lbl big' }, `RADIAL G ${rg.toFixed(2)}`),
      el('text', { x: 440, y: 380, class: 'lbl small' }, 'BLUE: LOAD FACTOR, TO CENTRE'),
      el('text', { x: 440, y: 398, class: 'lbl small' }, 'BLACK: GRAVITY, 1 G DOWN'),
    );
    const defs = el('defs');
    const m = el('marker', { id: 'bfm-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: 'auto-start-reverse' });
    m.append(el('path', { d: 'M0 0 L10 5 L0 10 z', fill: 'currentColor' }));
    defs.append(m);
    svg.prepend(defs);
    const help = Math.cos(rad(theta));
    out.textContent = `Radial G ${rg.toFixed(2)} = load factor ${n.toFixed(1)} − cos ${theta}°. ` + (Math.abs(help) < 0.05
      ? 'Gravity acts along the flight path here: it changes speed, not the turn.'
      : help > 0 ? 'Gravity is working against the turn: it is wider and slower than the load factor alone suggests.'
        : 'Gravity is adding to the turn: it is tighter and faster than the load factor alone suggests.');
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- The 10% rule ---------- */
function setupDeck(root) {
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const svg = root.querySelector('svg');
  const out = root.querySelector('[data-result]');
  function draw() {
    const alt = Number(f.alt.value);
    root.querySelector('output[for="alt"]').textContent = `${r0(alt)} ft`;
    const nose = maxNoseLow(alt);
    const deckY = 360, s = 0.03, x = 140, y = deckY - alt * s;
    const len = 150;
    svg.replaceChildren(
      el('rect', { x: 1, y: 1, width: 638, height: 438, class: 'frame' }),
      el('line', { x1: 20, y1: deckY, x2: 620, y2: deckY, class: 'ln heavy' }),
      el('text', { x: 620, y: deckY + 18, 'text-anchor': 'end', class: 'lbl small' }, 'HARD DECK'),
      el('line', { x1: 60, y1: deckY, x2: 60, y2: y, class: 'dim' }),
      el('text', { x: 66, y: (deckY + y) / 2, class: 'lbl small' }, `${r0(alt)} FT`),
      el('line', { x1: x, y1: y, x2: x + len, y2: y, class: 'thin' }),
      el('line', { x1: x, y1: y, x2: x + len * Math.cos(rad(nose)), y2: y + len * Math.sin(rad(nose)), class: 'ln heavy nose' }),
      el('path', { d: `M${x + 60} ${y} A60 60 0 0 1 ${x + 60 * Math.cos(rad(nose))} ${y + 60 * Math.sin(rad(nose))}`, class: 'angle' }),
      el('text', { x: x + 70, y: y + 24, class: 'lbl' }, `${Math.round(nose)}° NOSE LOW MAX`),
      side(x, y, -nose, 'own'),
    );
    out.textContent = `${r0(alt)} ft above the deck: no more than about ${Math.round(nose)}° nose low.` +
      (alt > 5000 ? ' The source’s table stops at 5,000 ft; above that this is the same 10% rule extended.' : '') +
      (alt < 1000 ? ' The source’s table starts at 1,000 ft.' : '') +
      (alt >= 6000 ? ' The source estimates 6,000–6,500 ft for a T-45 pure nose-low maneuver at 19–21 units.' : '');
  }
  root.addEventListener('input', draw);
  draw();
}

/* ---------- Figure callouts ---------- */
function setupFlow(root) {
  const items = [...root.querySelectorAll('[data-flow]')];
  const parts = [...root.querySelectorAll('svg [data-part]')];
  for (const button of root.querySelectorAll('button[data-show]')) {
    button.addEventListener('click', () => {
      const show = button.dataset.show;
      for (const b of root.querySelectorAll('button[data-show]')) b.setAttribute('aria-pressed', String(b === button));
      for (const p of parts) p.classList.toggle('active', p.dataset.part === show);
      for (const i of items) i.classList.toggle('active', i.dataset.flow === show);
    });
  }
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

const blocks = { geometry: setupGeometry, pursuit: setupPursuit, turn: setupTurn, loop: setupLoop, deck: setupDeck, flow: setupFlow, overshoot: setupFlow, terms: setupTerms };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
