// Presentation for the Air-to-Air Refuelling Procedures figures and quizzes.
// Facts, positions and geometry come from lesson-model.mjs; this file reads
// inputs and draws.
import {
  BOOM, CALLS, CALL_OPTIONS, FLOWS, HOSE, SIGNALS, SIGNAL_OPTIONS,
  boomCall, boomStep, directorLights, hoseState, inEnvelope, rvDelta, spotOf,
} from './lesson-model.mjs';
import { el, jet } from '../shared/hsi.mjs';
import { quickQuiz, termQuiz, withDistractors } from '../shared/quick-quiz.mjs';

const ui = (root) => ({ prompt: root.querySelector('[data-prompt]'), choices: root.querySelector('[data-choices]'), result: root.querySelector('[data-result]'), next: root.querySelector('[data-new]') });
const press = (row, id) => { for (const b of row.children) b.setAttribute('aria-pressed', String(b.dataset.id === id)); };
const button = (label, id, onClick) => {
  const b = Object.assign(document.createElement('button'), { type: 'button', textContent: label });
  b.dataset.id = id;
  b.addEventListener('click', onClick);
  return b;
};

/* ---------- Figure 1: around the tanker ---------- */
const OX = 320, OY = 78;
const P = ([x, y]) => [OX + x, OY + y];

// A plan-view tanker, nose up, wing root at the origin.
function tankerPlan(kind) {
  const g = el('g', { class: 'tanker' });
  g.append(
    el('path', { class: 'body', d: `M${OX} ${OY - 72} q8 4 9 18 v108 l-4 10 h-10 l-4 -10 v-108 q1 -14 9 -18 z` }),
    el('path', { class: 'body', d: `M${OX - 8} ${OY - 14} L${OX - 108} ${OY + 24} L${OX - 108} ${OY + 31} L${OX - 8} ${OY + 12} Z M${OX + 8} ${OY - 14} L${OX + 108} ${OY + 24} L${OX + 108} ${OY + 31} L${OX + 8} ${OY + 12} Z` }),
    el('path', { class: 'body', d: `M${OX - 6} ${OY + 50} L${OX - 40} ${OY + 66} L${OX - 40} ${OY + 71} L${OX - 5} ${OY + 64} Z M${OX + 6} ${OY + 50} L${OX + 40} ${OY + 66} L${OX + 40} ${OY + 71} L${OX + 5} ${OY + 64} Z` }),
    el('line', { class: 'wingline', x1: OX - 230, y1: OY + 2, x2: OX + 230, y2: OY + 2 }),
    el('text', { class: 'lbl small', x: OX + 226, y: OY - 4, 'text-anchor': 'end' }, 'Wingline'),
  );
  if (kind === 'boom') g.append(el('line', { class: 'gear', x1: OX, y1: OY + 66, x2: OX, y2: OY + 102 }));
  if (kind === 'centre') g.append(el('line', { class: 'hose', x1: OX, y1: OY + 66, x2: OX, y2: OY + 114 }), el('circle', { class: 'drogue', cx: OX, cy: OY + 116, r: 5 }));
  if (kind === 'wing') for (const s of [-1, 1]) {
    g.append(el('rect', { class: 'gear', x: OX + s * 62 - 3, y: OY + 10, width: 6, height: 12 }));
    g.append(el('line', { class: 'hose', x1: OX + s * 62, y1: OY + 22, x2: OX + s * 62, y2: OY + 84 }), el('circle', { class: 'drogue', cx: OX + s * 62, cy: OY + 86, r: 5 }));
  }
  return g;
}

function setupFlow(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), row = root.querySelector('[data-choices]');
  const calls = root.querySelector('[data-calls]'), count = root.querySelector('[data-count]');
  const [back, next] = [root.querySelector('[data-back]'), root.querySelector('[data-next]')];
  svg.setAttribute('viewBox', '0 0 640 300');
  let kind = 'boom', step = 0;
  const draw = () => {
    const flow = FLOWS[kind], s = flow.steps[step];
    svg.replaceChildren(el('rect', { class: 'view', x: 0, y: 0, width: 640, height: 300 }), tankerPlan(kind));
    for (const [text, x, y, anchor] of [['ECHELON LEFT', -160, 112, 'middle'], ['ECHELON RIGHT', 160, 112, 'middle'], ['ASTERN', 0, 196, 'middle']]) {
      svg.append(el('text', { class: 'lbl small zone', x: OX + x, y: OY + y, 'text-anchor': anchor }, text));
    }
    for (const [who, spot] of Object.entries(s.at)) {
      const [x, y] = P(spotOf(spot));
      svg.append(jet(x, y, 0, 'acft rx', 1.5), el('text', { class: 'tag', x: x + 18, y: y + 4 }, who === 'A' ? 'Hawk 1' : 'Hawk 2'));
    }
    svg.append(el('text', { class: 'lbl small', x: 12, y: 290 }, 'Not to scale: the order of the flow, not distances.'));
    svg.setAttribute('aria-label', `${flow.name}, step ${step + 1}: ${s.title}. ${s.text}`);
    out.textContent = `${step + 1}. ${s.title}. ${s.text}`;
    calls.replaceChildren(...s.calls.map(([who, said]) => {
      const li = document.createElement('li');
      li.append(Object.assign(document.createElement('span'), { className: 'who', textContent: who }), ' ', Object.assign(document.createElement('span'), { className: 'said', textContent: said }));
      return li;
    }));
    count.textContent = `Step ${step + 1} of ${flow.steps.length} · ${flow.note}`;
    back.disabled = step === 0;
    next.disabled = step === flow.steps.length - 1;
    press(row, kind);
  };
  for (const [id, f] of Object.entries(FLOWS)) row.append(button(f.name, id, () => { kind = id; step = 0; draw(); }));
  back.addEventListener('click', () => { step = Math.max(0, step - 1); draw(); });
  next.addEventListener('click', () => { step = Math.min(FLOWS[kind].steps.length - 1, step + 1); draw(); });
  draw();
}

/* ---------- Side-view shapes ---------- */
// A generic fighter in side view, nose left; (0, 0) is the point that
// matters (receptacle or probe tip), passed as `ref`.
function fighterSide(x, y, ref) {
  const shape = 'M0 0 l18 -6 h30 l10 -6 h22 l6 -14 h10 l-2 14 h6 v8 h-10 l-8 6 h-60 z M24 -6 q8 -9 20 -4 z';
  const [rx, ry] = ref;
  return el('path', { class: 'acft rx', d: shape, transform: `translate(${x - rx} ${y - ry})` });
}

/* ---------- Figure 2: boom, astern to contact ---------- */
const PX = 4.2; // pixels per foot
const NOZZLE = [318, 128]; // the contact point on screen

function pdlArray(x, label, top, bottom, ax, lit) {
  const g = el('g');
  g.append(el('text', { class: 'lbl small light', x: x + 9, y: 194, 'text-anchor': 'middle' }, label));
  g.append(el('text', { class: 'lbl small light', x: x + 9, y: 208, 'text-anchor': 'middle' }, top));
  // Five segments: large and small correction one way, on the spot, small
  // and large the other way.
  const order = [[top, 2], [top, 1], [null, 0], [bottom, 1], [bottom, 2]];
  order.forEach(([cmd, size], i) => {
    const on = lit && ax.cmd === cmd && ax.size === size;
    g.append(el('rect', { class: `seg${on ? ' on' : ''}${cmd === null ? ' mid' : ''}`, x, y: 214 + i * 13, width: 18, height: 10 }));
  });
  g.append(el('text', { class: 'lbl small light', x: x + 9, y: 292, 'text-anchor': 'middle' }, bottom));
  return g;
}

function setupBoom(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), said = root.querySelector('[data-said]');
  svg.setAttribute('viewBox', '0 0 640 300');
  let pos, cleared, contact, fuel, breakaway, timer;
  const reset = () => { pos = { ...BOOM.astern }; cleared = contact = false; fuel = 0; breakaway = false; };
  reset();
  const draw = (msg, call) => {
    const lights = directorLights(pos);
    const rx = NOZZLE[0] + pos.x * PX, ry = NOZZLE[1] + pos.z * PX;
    svg.replaceChildren(el('rect', { class: 'sky', x: 0, y: 0, width: 640, height: 300 }));
    // Tanker belly and tail, nose to the left, off the top edge.
    svg.append(el('path', { class: 'body', d: 'M0 0 H260 l20 30 h-40 q-120 18 -240 18 z' }));
    svg.append(el('line', { class: 'stripe', x1: 0, y1: 44, x2: 230, y2: 32 }));
    // Pilot director lights under the forward fuselage, drawn as one bar.
    svg.append(el('rect', { class: `pdl${cleared ? ' on' : ''}${breakaway ? ' flash' : ''}`, x: 70, y: 40, width: 60, height: 6 }));
    svg.append(el('text', { class: 'lbl small', x: 100, y: 62, 'text-anchor': 'middle' }, 'Pilot director lights'));
    // The boom: from the tail, telescoped to the receptacle in contact.
    const end = contact ? [rx, ry] : [NOZZLE[0] - 14, NOZZLE[1] - 8];
    svg.append(el('line', { class: 'boom', x1: 248, y1: 34, x2: end[0], y2: end[1] }), el('circle', { class: 'nozzle', cx: end[0], cy: end[1], r: 3 }));
    // Envelope and astern marks (invented sizes).
    svg.append(el('rect', { class: 'envelope', x: NOZZLE[0] - BOOM.envelope.x * PX, y: NOZZLE[1] - BOOM.envelope.z * PX, width: 2 * BOOM.envelope.x * PX, height: 2 * BOOM.envelope.z * PX }));
    svg.append(el('circle', { class: 'astern', cx: NOZZLE[0] + BOOM.astern.x * PX, cy: NOZZLE[1] + BOOM.astern.z * PX, r: 6 }));
    svg.append(el('text', { class: 'lbl small', x: NOZZLE[0] + BOOM.astern.x * PX, y: NOZZLE[1] + BOOM.astern.z * PX + 22, 'text-anchor': 'middle' }, 'Astern'));
    svg.append(el('text', { class: 'lbl small', x: NOZZLE[0], y: NOZZLE[1] - BOOM.envelope.z * PX - 6, 'text-anchor': 'middle' }, 'Contact'));
    svg.append(fighterSide(rx, ry, [42, -10]));
    svg.append(el('circle', { class: 'receptacle', cx: rx, cy: ry, r: 2.5 }));
    // The lights as the receiver reads them, in an inset.
    svg.append(el('rect', { class: 'inset', x: 10, y: 180, width: 110, height: 116 }));
    svg.append(pdlArray(24, 'Elevation', 'UP', 'DOWN', lights.elevation, cleared && !breakaway));
    svg.append(pdlArray(78, 'Fore–aft', 'FWD', 'AFT', lights.fore, cleared && !breakaway));
    svg.append(el('text', { class: 'lbl small', x: 630, y: 290, 'text-anchor': 'end' }, `${Math.round(pos.x)} ft aft, ${Math.round(pos.z)} ft below the contact position${fuel ? ` · fuel ${fuel} lb` : ''}`));
    said.textContent = call ?? '';
    out.textContent = msg;
    svg.setAttribute('aria-label', `Boom refuelling, side view. ${msg}`);
  };
  const status = () => {
    if (breakaway) return ['Breakaway: disconnect, move back and descend clear of the tanker and the boom. Flashing director lights are the silent breakaway signal.', '“Shell 6, breakaway, breakaway, breakaway.”'];
    if (contact) return [`In contact${fuel ? ', fuel flowing' : ''}. Hold the picture on the tanker itself; the director lights confirm it.`, null];
    if (!cleared) {
      const atAstern = Math.abs(pos.x - BOOM.astern.x) <= 2 && Math.abs(pos.z - BOOM.astern.z) <= 2;
      return [atAstern ? 'Stabilized astern with zero closure. Ask to be cleared.' : 'Fly back to the astern position and stabilize.', null];
    }
    const call = boomCall(pos);
    return [`Cleared to contact: the director lights now show your error, as in the sims. ${call ? '' : 'On the spot: hold it while the boom operator flies the boom in.'}`, call ? `Boom operator: “${call}.”` : null];
  };
  const move = (dx, dz) => {
    if (breakaway) return;
    const step = boomStep(pos);
    pos = { x: pos.x + dx * step, z: pos.z + dz * step };
    if (!cleared && pos.x < BOOM.astern.x - 5) { pos = { ...BOOM.astern }; return draw('Not cleared yet: you moved forward of astern. Return to astern and stabilize first.', 'Boom operator: “Return to astern.”'); }
    if (pos.x < BOOM.inner) {
      breakaway = true;
      const [m, c] = status();
      draw(`Too far forward, past the inner limit. ${m}`, c);
      clearTimeout(timer);
      timer = setTimeout(() => { reset(); draw(...status()); }, 3000);
      return;
    }
    if (contact && !inEnvelope(pos)) { contact = false; fuel = 0; return draw('Outside the envelope: the boom disconnects. Fly back to the contact position, or drop back astern.', 'Boom operator: “Disconnect.”'); }
    if (cleared && !contact && Math.abs(pos.x) <= BOOM.onSpot && Math.abs(pos.z) <= BOOM.onSpot) { contact = true; fuel = 1000; return draw(...status(), 'Boom operator: “Shell 6, contact.”'); }
    if (contact) fuel += 500;
    draw(...status());
  };
  const bind = (sel, fn) => root.querySelector(sel).addEventListener('click', fn);
  bind('[data-move="forward"]', () => move(-1, 0));
  bind('[data-move="aft"]', () => move(1, 0));
  bind('[data-move="up"]', () => move(0, -1));
  bind('[data-move="down"]', () => move(0, 1));
  bind('[data-clear]', () => {
    if (breakaway || cleared) return;
    const atAstern = Math.abs(pos.x - BOOM.astern.x) <= 2 && Math.abs(pos.z - BOOM.astern.z) <= 2;
    if (!atAstern) return draw('Only from a stable astern position. Fly back to astern first.', null);
    cleared = true;
    const [m] = status();
    draw(m, 'Tanker: “Hawk 1, clear contact.”');
  });
  bind('[data-disconnect]', () => { clearTimeout(timer); reset(); draw('Disconnected and back to astern; the boom retracts.', contact ? 'Hawk 1: “Disconnect.”' : null); });
  draw(...status());
}

/* ---------- Figure 3: probe and drogue ---------- */
const MPX = 12; // pixels per metre of hose travel
const TRAIL = [440, 150]; // the drogue at full trail

function setupDrogue(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  svg.setAttribute('viewBox', '0 0 640 260');
  let push = 0, engaged = false, whip = false, red = false, timer;
  const draw = (extra) => {
    const st = hoseState(push, engaged), light = red ? 'red' : st.light;
    const dx = TRAIL[0] - push * MPX;
    svg.replaceChildren(el('rect', { class: 'sky', x: 0, y: 0, width: 640, height: 260 }));
    svg.append(el('path', { class: 'body', d: 'M0 0 H200 q20 10 0 18 H0 z' }));
    // The pod or hose unit, with its three signal lights.
    svg.append(el('rect', { class: 'pod', x: 120, y: 36, width: 60, height: 18, rx: 8 }));
    ['red', 'amber', 'green'].forEach((c, i) => svg.append(el('circle', { class: `sig ${c}${light === c ? ' on' : ''}`, cx: 134 + i * 14, cy: 45, r: 4 })));
    // The hose, wavy if whipping.
    const mid = [(180 + dx) / 2, whip ? 150 : 100];
    const d = whip ? `M180 50 Q${mid[0] - 40} 170 ${mid[0]} ${mid[1] - 40} T${dx} ${TRAIL[1]}` : `M180 50 Q${mid[0]} ${mid[1] + 20} ${dx} ${TRAIL[1]}`;
    svg.append(el('path', { class: 'hose', d }));
    // The drogue: a cone opening aft.
    svg.append(el('path', { class: 'drogue', d: `M${dx} ${TRAIL[1] - 3} l22 -12 v30 l-22 -12 z` }));
    // The receiver: probe tip in the coupling when engaged, else ~5 ft aft.
    const tip = engaged ? [dx + 2, TRAIL[1]] : [dx + 2 + 1.5 * MPX + 20, TRAIL[1] + 4];
    svg.append(fighterSide(tip[0], tip[1] + 14, [-6, -14]));
    svg.append(el('line', { class: 'probe', x1: tip[0], y1: tip[1], x2: tip[0] + 26, y2: tip[1] + 10 }));
    svg.append(el('text', { class: 'lbl small', x: 140, y: 74, 'text-anchor': 'middle' }, 'Signal lights'));
    svg.append(el('text', { class: 'lbl small', x: 630, y: 250, 'text-anchor': 'end' }, `Hose pushed in ${push} m${st.fuel && !red ? ' · fuel flowing' : ''}`));
    out.textContent = extra ?? st.text;
    svg.setAttribute('aria-label', `Probe and drogue, side view. ${out.textContent}`);
  };
  const bind = (sel, fn) => root.querySelector(sel).addEventListener('click', () => { if (!red) fn(); });
  bind('[data-slow]', () => {
    whip = false;
    if (engaged) return draw('Already in contact: push forward to open the fuel valve.');
    engaged = true; draw();
  });
  bind('[data-fast]', () => {
    if (engaged) return draw('Already in contact.');
    whip = true;
    draw('Too fast. The hose drum’s response system absorbs the contact and damps whip only if excessive closure is avoided; a hard contact can break the probe nozzle or damage the drogue’s spokes. Drop back astern and close again slowly.');
  });
  bind('[data-in]', () => { if (!engaged) return draw('Make contact first.'); push += HOSE.step; draw(); });
  bind('[data-out]', () => {
    if (!engaged) return draw('Astern already.');
    push = Math.max(0, push - HOSE.step);
    if (push === 0) { engaged = false; return draw('Back at full trail: the fuel valves close, then the coupling latches release the probe. You are astern again.'); }
    draw();
  });
  root.querySelector('[data-break]').addEventListener('click', () => {
    red = true; whip = false; engaged = false; push = 0;
    draw('Breakaway. Red light. Drop back quickly: the equipment senses the fast hose movement and brakes the drum, for a swift, positive disconnect well before full trail. Then move to a safe position, clear of the area behind the tanker and outboard of its wing.');
    clearTimeout(timer);
    timer = setTimeout(() => { red = false; draw(); }, 3500);
  });
  draw();
}

/* ---------- Figure 4: the point-parallel rendezvous ---------- */
function setupRv(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]'), row = root.querySelector('[data-choices]');
  const play = root.querySelector('[data-play]'), slider = root.querySelector('input[type="range"]');
  svg.setAttribute('viewBox', '0 0 640 260');
  const speeds = [300, 380, 450];
  let tanker = 380, rv, t, raf, last;
  const K = () => 560 / (rv.offsetNm + Math.abs(rv.at(0).receiver[1]) + 6);
  // Receiver flies left to right along the bottom track; north is to the right.
  const S = ([x, y]) => { const k = K(), y0 = rv.at(0).receiver[1] - 1; return [40 + (y - y0) * k, 200 - x * k]; };
  const draw = () => {
    const tStart = -2 / 60, tEnd = rv.turnH + 1.5 / 60;
    const now = rv.at(t);
    svg.replaceChildren(el('rect', { class: 'view', x: 0, y: 0, width: 640, height: 260 }));
    // Tracks: the receiver's, the tanker's reciprocal, and the turn.
    const pts = []; for (let s = tStart; s <= tEnd; s += (tEnd - tStart) / 120) pts.push(S(rv.at(s).tanker));
    svg.append(el('polyline', { class: 'track', points: pts.map((p) => p.join(',')).join(' ') }));
    const [r0, r1] = [S([0, rv.at(tStart).receiver[1]]), S([0, rv.at(tEnd).tanker[1] + 1])];
    svg.append(el('line', { class: 'track rx', x1: r0[0], y1: r0[1], x2: r1[0], y2: r1[1] }));
    // Range line at the turn.
    const [a, b] = [S(rv.at(0).tanker), S(rv.at(0).receiver)];
    svg.append(el('line', { class: 'range', x1: a[0], y1: a[1], x2: b[0], y2: b[1] }));
    // Label a third of the way along from the left end, above the line, clear of the turn.
    const [l, r] = a[0] <= b[0] ? [a, b] : [b, a];
    svg.append(el('text', { class: 'lbl small', x: l[0] + (r[0] - l[0]) * 0.3 - 4, y: l[1] + (r[1] - l[1]) * 0.3 - 6, 'text-anchor': 'end' }, `Turn range ${rv.turnRangeNm.toFixed(1)} NM`));
    const [tx, ty] = S(now.tanker), [rx, ry] = S(now.receiver);
    // Headings: north (+y in the model) is to the right on screen.
    svg.append(jet(tx, ty, 90 - now.tankerHdg, 'acft tk', 1.4), el('text', { class: 'tag', x: tx + 12, y: ty - 10 }, 'Tanker'));
    svg.append(jet(rx, ry, 90, 'acft rx', 1.2), el('text', { class: 'tag', x: rx - 10, y: ry + 22 }, 'Receiver'));
    const gap = Math.hypot(now.tanker[0] - now.receiver[0], now.tanker[1] - now.receiver[1]);
    svg.append(el('text', { class: 'lbl small', x: 12, y: 18 }, `Tanker ${tanker} kt, receiver ${tanker + 20} kt true airspeed, 25° bank, no wind`));
    svg.append(el('text', { class: 'lbl small', x: 12, y: 250 }, `${t < 0 ? `${(-t * 60).toFixed(1)} min before the turn` : t < rv.turnH ? `In the turn, ${(t * 60).toFixed(1)} min` : 'Rolled out'} · ${gap.toFixed(1)} NM apart`));
    out.textContent = `Turn radius ${rv.radiusNm.toFixed(1)} NM, so with no wind the offset between the tracks is ${rv.offsetNm.toFixed(1)} NM. The tanker starts its turn with the receiver ${rv.turnRangeNm.toFixed(1)} NM away; the turn takes ${rv.turnMin.toFixed(1)} min and the tanker rolls out 1 NM ahead.`;
    svg.setAttribute('aria-label', `Point-parallel rendezvous seen from above. ${out.textContent}`);
    slider.value = String(Math.round(((t - tStart) / (tEnd - tStart)) * 1000));
  };
  const setup = () => { rv = rvDelta({ tankerKt: tanker, receiverKt: tanker + 20 }); t = -2 / 60; press(row, String(tanker)); draw(); };
  const span = () => [-2 / 60, rv.turnH + 1.5 / 60];
  const stop = () => { cancelAnimationFrame(raf); raf = null; play.textContent = 'Play'; };
  const frame = (ts) => {
    const [, e] = span();
    if (last) t += ((ts - last) / 1000) * (20 / 3600); // 20 s of flight per second
    last = ts;
    if (t >= e) { t = e; draw(); return stop(); }
    draw();
    raf = requestAnimationFrame(frame);
  };
  play.addEventListener('click', () => {
    if (raf) return stop();
    const [s, e] = span();
    if (t >= e) t = s;
    last = null; play.textContent = 'Pause'; raf = requestAnimationFrame(frame);
  });
  slider.addEventListener('input', () => { stop(); const [s, e] = span(); t = s + (Number(slider.value) / 1000) * (e - s); draw(); });
  for (const v of speeds) row.append(button(`Tanker ${v} kt`, String(v), () => { stop(); tanker = v; setup(); }));
  setup();
}

/* ---------- Quizzes ---------- */
const listQuiz = (items, options, verb) => (root) => quickQuiz(ui(root), {
  items,
  show: (q, prompt) => { prompt.textContent = q.q; },
  options: (q) => withDistractors(q.answer, options),
  isRight: (q, o) => o === q.answer,
  feedback: (q, o, right) => `${right ? 'Correct' : `Not quite: ${verb} ${q.answer}`}. ${q.why}`,
});

const blocks = {
  flow: setupFlow, boom: setupBoom, drogue: setupDrogue, rv: setupRv,
  calls: listQuiz(CALLS, CALL_OPTIONS, 'the call is'), signals: listQuiz(SIGNALS, SIGNAL_OPTIONS, 'it means'),
  terms: (r) => termQuiz(r, { hideTerm: true }),
};
for (const root of document.querySelectorAll('[data-lesson]')) {
  if (!blocks[root.dataset.lesson]) continue;
  blocks[root.dataset.lesson](root);
  root.classList.add('ready');
}
