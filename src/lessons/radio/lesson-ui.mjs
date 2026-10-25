// Presentation for the Radio Communications module's interactive blocks. Rules
// and conversions come from lesson-model.mjs; this file reads inputs and draws.
import {
  ELEMENT_LABEL, LIGHT_SIGNALS, ROUTE_RULES, SPECIAL_CODES, altitude, callSign, checkCall, checkReadback,
  direction, frequency, lostCommsAltitudes, lostCommsRoute, mach, safeOrder, speed, spell, squawk, time, transmit,
} from './lesson-model.mjs';

const SVG = 'http://www.w3.org/2000/svg';
const r0 = (v) => Math.round(v).toLocaleString('en-US');
const reduceMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const shuffle = (xs) => [...xs].map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((p) => p[1]);

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  if (text !== undefined) node.textContent = text;
  return node;
}
function para(text, cls) {
  const p = document.createElement('p');
  p.textContent = text;
  if (cls) p.className = cls;
  return p;
}
function button(text, onClick) {
  const b = Object.assign(document.createElement('button'), { type: 'button', textContent: text });
  b.addEventListener('click', onClick);
  return b;
}
// Side-view jet, nose to +x.
const SIDE = 'M-14 -1 L8 -3 L15 0 L8 3 L-14 2 Z M-14 -1 L-17 -9 L-12 -9 L-8 -2 Z';
const side = (x, y, cls, scale = 1) => el('path', { d: SIDE, class: cls, transform: `translate(${x} ${y}) scale(${scale})` });

/* ---------- Figure 1: find a gap ---------- */
// Invented traffic on one approach frequency: [start s, end s, station, words].
const TRAFFIC = [
  [0, 3.6, 'APP', 'Navy 405, turn left heading 270'], [4.1, 6.6, '405', 'Left 270, Navy 405'],
  [10, 13.4, 'APP', 'Cessna 34A, descend and maintain 4,000'], [13.9, 16.6, '34A', 'Down to 4,000, Cessna 34A'],
  [21, 25, '55G', 'Approach, Bonanza 55G, request ILS'], [25.6, 28.6, 'APP', 'Bonanza 55G, expect vectors ILS'],
  [34, 37.4, 'APP', 'Navy 405, contact tower 120.1'], [37.9, 40, '405', 'Tower 120.1, Navy 405'],
];
const CALL = 3;
function setupGap(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const slider = root.querySelector('[name="t"]'), shown = root.querySelector('output[for="t"]');
  const play = root.querySelector('[data-play]');
  const busy = TRAFFIC.map(([a, b]) => [a, b]);
  const x = (t) => 40 + t * 14;
  let mine = [], timer = null, last = 0;
  function draw() {
    const t = +slider.value;
    shown.textContent = `${t.toFixed(1)} s`;
    svg.replaceChildren();
    svg.append(el('text', { x: 40, y: 24, class: 'lbl' }, 'FREQUENCY'), el('text', { x: 40, y: 154, class: 'lbl' }, 'YOU'));
    svg.append(el('line', { x1: 40, y1: 100, x2: 600, y2: 100, class: 'thin' }), el('line', { x1: 40, y1: 190, x2: 600, y2: 190, class: 'thin' }));
    for (let s = 0; s <= 40; s += 5) {
      svg.append(el('line', { x1: x(s), y1: 196, x2: x(s), y2: 202, class: 'thin' }), el('text', { x: x(s), y: 216, class: 'lbl small', 'text-anchor': 'middle' }, `${s}`));
    }
    svg.append(el('text', { x: 600, y: 236, class: 'lbl small', 'text-anchor': 'end' }, 'seconds'));
    TRAFFIC.forEach(([a, b, who, words], i) => {
      const y = i % 2 ? 62 : 36;
      svg.append(el('rect', { x: x(a), y: 70, width: x(b) - x(a), height: 30, class: `busy${who === 'APP' ? ' atc' : ''}` }));
      svg.append(el('text', { x: x(a) + 3, y: 90, class: 'lbl small' }, who));
      if (t >= a && t <= b) svg.append(el('text', { x: Math.min(x(a), 360), y, class: 'lbl' }, `“${words}”`));
    });
    for (const m of mine) {
      svg.append(el('rect', { x: x(m.t), y: 160, width: CALL * 14, height: 30, class: `mine${m.blocked ? ' bad' : ''}` }));
      svg.append(el('text', { x: x(m.t) + 3, y: 180, class: 'lbl small inv' }, m.blocked ? 'BLOCKED' : 'CLEAR'));
    }
    svg.append(el('line', { x1: x(t), y1: 44, x2: x(t), y2: 196, class: 'cursor' }));
  }
  function stop() { clearInterval(timer); timer = null; play.textContent = 'Play'; }
  play.addEventListener('click', () => {
    if (timer) return stop();
    if (+slider.value >= 40) slider.value = 0;
    play.textContent = 'Pause';
    last = performance.now();
    timer = setInterval(() => {
      const now = performance.now();
      const t = Math.min(40, +slider.value + (now - last) / 1000);
      last = now;
      slider.value = t;
      draw();
      if (t >= 40) stop();
    }, 100);
  });
  slider.addEventListener('input', draw);
  root.querySelector('[data-key]').addEventListener('click', () => {
    const t = +slider.value;
    if (t + CALL > 40) { out.replaceChildren(para('Too late in the window: rewind and try again.')); return; }
    const r = transmit(busy, t, CALL);
    mine.push({ t, blocked: r.blocked });
    const lines = [];
    if (r.blocked) lines.push(para(`Blocked: your call from ${t.toFixed(1)} s overlaps a transmission from ${r.with[0]} to ${r.with[1]} s. Both callers will have to repeat.`, 'bad'));
    else {
      lines.push(para(`Clear: your call from ${t.toFixed(1)} to ${(t + CALL).toFixed(1)} s fits a gap.`));
      const prev = TRAFFIC.filter(([, b]) => b <= t).at(-1);
      if (prev && prev[2] === 'APP' && t - prev[1] < 1.5)
        lines.push(para('But the controller has just called an aircraft. Its reply is due: leave room for it.'));
    }
    lines.push(para(`${mine.filter((m) => !m.blocked).length} clear, ${mine.filter((m) => m.blocked).length} blocked.`));
    out.replaceChildren(...lines);
    draw();
  });
  root.querySelector('[data-reset]').addEventListener('click', () => { mine = []; out.replaceChildren(); stop(); slider.value = 0; draw(); });
  draw();
}

/* ---------- Figure 2: bands ---------- */
const MARKS = {
  '121.5': { label: '121.5', band: 'VHF', text: '121.5 MHz: VHF emergency frequency, guarded by direction-finding stations; line of sight.' },
  '122.2': { label: '122.2', band: 'VHF', text: '122.2 MHz: common en route simplex frequency of most flight service stations.' },
  '243.0': { label: '243.0', band: 'UHF', text: '243.0 MHz: UHF emergency frequency, guarded by military aircraft; line of sight. It is exactly twice 121.5.' },
  '225': { label: '225', band: 'UHF', text: '225 MHz: the lowest edge of military UHF air–ground voice "in some instances"; the UHF band proper starts at 300 MHz.' },
};
function setupBands(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const x = (mhz) => 40 + (mhz - 100) * (560 / 300);
  function draw() {
    const pick = root.querySelector('[name="mark"]:checked').value;
    svg.replaceChildren();
    svg.append(el('rect', { x: x(100), y: 70, width: x(300) - x(100), height: 50, class: 'band' }));
    svg.append(el('rect', { x: x(300), y: 70, width: x(400) - x(300), height: 50, class: 'band uhf' }));
    svg.append(el('text', { x: x(200), y: 100, class: 'lbl big', 'text-anchor': 'middle' }, 'VHF  30–300 MHz'));
    svg.append(el('text', { x: x(350), y: 100, class: 'lbl big', 'text-anchor': 'middle' }, 'UHF  300–3,000 MHz'));
    // Military UHF voice bracket, from 225 MHz.
    svg.append(el('path', { d: `M${x(225)} 140 L${x(225)} 150 L${x(400)} 150`, class: 'ln dashed' }));
    svg.append(el('text', { x: x(232), y: 166, class: 'lbl small' }, 'MILITARY UHF VOICE: FROM 225 IN SOME INSTANCES'));
    for (let m = 100; m <= 400; m += 50) {
      svg.append(el('line', { x1: x(m), y1: 120, x2: x(m), y2: 128, class: 'thin' }), el('text', { x: x(m), y: 200, class: 'lbl small', 'text-anchor': 'middle' }, `${m}`));
    }
    svg.append(el('text', { x: 600, y: 218, class: 'lbl small', 'text-anchor': 'end' }, 'MHz'));
    // Label offsets keep 121.5 and 122.2 apart.
    const place = { '121.5': [-6, 'end'], '122.2': [6, 'start'], '243.0': [0, 'middle'], '225': [0, 'middle'] };
    Object.entries(MARKS).forEach(([k, m]) => {
      const on = k === pick, X = x(+k), [dx, anchor] = place[k];
      svg.append(el('line', { x1: X, y1: 42, x2: X, y2: 120, class: `ln${on ? ' heavy on' : ''}` }));
      svg.append(el('text', { x: X + dx, y: 34, class: `lbl${on ? ' big on' : ''}`, 'text-anchor': anchor }, m.label));
    });
    out.replaceChildren(para(MARKS[pick].text));
  }
  root.querySelectorAll('[name="mark"]').forEach((i) => i.addEventListener('change', draw));
  draw();
}

/* ---------- Figure 3: say it ---------- */
const SAY = {
  callsign: (v, type) => { const c = callSign(type || 'Cessna', v); return { spoken: c.full, pronounce: c.pronounce, alt: `Abbreviated, once ATC starts it: ${c.abbreviated}` }; },
  spell: (v) => spell(v),
  altitude: (v) => altitude(+v.replace(/,/g, '')),
  heading: (v) => direction(+v),
  wind: (v) => direction(+v, { kind: 'wind' }),
  speed: (v) => speed(+v),
  mach: (v) => mach(+v),
  frequency: (v) => ({ ...frequency(v), alt: `ICAO: ${frequency(v, { icao: true }).spoken}` }),
  time: (v) => time(v),
  squawk: (v) => squawk(v),
};
const EXAMPLE = { callsign: 'N2464A', spell: 'KJAX', altitude: '13500', heading: '090', wind: '220', speed: '250', mach: '0.64', frequency: '121.5', time: '0920', squawk: '7600' };
function setupSay(root) {
  const kind = root.querySelector('[name="kind"]'), text = root.querySelector('[name="text"]'), type = root.querySelector('[name="type"]');
  const typeLabel = root.querySelector('[data-for="callsign"]'), out = root.querySelector('[data-result]');
  function draw() {
    typeLabel.hidden = kind.value !== 'callsign';
    try {
      if (!text.value.trim()) throw new RangeError('Type a value.');
      const r = SAY[kind.value](text.value.trim(), type.value.trim());
      if (!Number.isFinite(+text.value) && ['altitude', 'heading', 'wind', 'speed', 'mach'].includes(kind.value) && !/^[\d,.]+$/.test(text.value.trim()))
        throw new RangeError('Type a number.');
      const lines = [para(`“${r.spoken}”`, 'words')];
      if (r.pronounce) lines.push(para(r.pronounce, 'pron'));
      if (r.alt) lines.push(para(r.alt, 'alt'));
      out.replaceChildren(...lines);
    } catch (e) {
      out.replaceChildren(para(e instanceof RangeError ? e.message : 'Cannot say that value.', 'alt'));
    }
  }
  kind.addEventListener('change', () => { text.value = EXAMPLE[kind.value]; draw(); });
  text.addEventListener('input', draw);
  type.addEventListener('input', draw);
  draw();
}

/* ---------- Figure 4: build the call ---------- */
const CALLS = [
  { prompt: 'You are on the south ramp at Columbia with an IFR flight plan to Memphis. Call ground control.',
    pieces: [['facility', 'Columbia Ground'], ['identification', 'Cessna Three One Six Zero Foxtrot'], ['position', 'south ramp'], ['request', 'I-F-R Memphis']],
    extra: [['Cessna Six Zero Foxtrot', 'Never abbreviate a call sign on initial contact.']] },
  { prompt: 'You are airborne and want to call New York flight service. Your message will follow once they answer.',
    pieces: [['facility', 'New York Radio'], ['identification', 'Mooney Three One One Echo']],
    extra: [['over the river', 'The position element is for aircraft on the airport surface; this first call only needs the station and your identification.']] },
  { prompt: 'You are on the north ramp at Gainesville, have ATIS information Bravo, and want to taxi for a VFR departure to the south.',
    pieces: [['facility', 'Gainesville Ground'], ['identification', 'Bonanza Six Five Five Golf'], ['position', 'north ramp'], ['request', 'taxi, VFR southbound, with information Bravo']],
    extra: [['Bonanza Five Five Golf', 'Never abbreviate a call sign on initial contact.']] },
];
function setupCall(root) {
  const prompt = root.querySelector('[data-prompt]'), choices = root.querySelector('[data-choices]');
  const built = root.querySelector('[data-built]'), out = root.querySelector('[data-result]');
  let n = 0, said = [];
  function render() {
    const s = CALLS[n];
    built.replaceChildren(...said.map((p) => Object.assign(document.createElement('li'), { textContent: p.text })));
    for (const b of choices.children) b.disabled = said.some((p) => p.text === b.textContent);
    if (!said.length) built.replaceChildren(Object.assign(document.createElement('li'), { textContent: '…' }));
    prompt.textContent = s.prompt;
  }
  function load() {
    const s = CALLS[n];
    said = [];
    out.replaceChildren();
    const all = [...s.pieces.map(([key, text]) => ({ key, text })), ...s.extra.map(([text, why]) => ({ key: null, text, why }))];
    choices.replaceChildren(...shuffle(all).map((p) => button(p.text, () => { said.push(p); render(); })));
    render();
  }
  root.querySelector('[data-undo]').addEventListener('click', () => { said.pop(); render(); });
  root.querySelector('[data-next]').addEventListener('click', () => { n = (n + 1) % CALLS.length; load(); });
  root.querySelector('[data-check]').addEventListener('click', () => {
    const s = CALLS[n];
    const wrong = said.find((p) => !p.key);
    if (wrong) return out.replaceChildren(para(`“${wrong.text}” doesn't belong: ${wrong.why}`, 'bad'));
    const missing = s.pieces.filter(([key]) => !said.some((p) => p.key === key));
    if (missing.length) return out.replaceChildren(para(`Missing: ${missing.map(([k]) => ELEMENT_LABEL[k].toLowerCase()).join('; ')}.`, 'bad'));
    const r = checkCall(said.map((p) => p.key));
    if (!r.ok) return out.replaceChildren(para(`Out of order: ${ELEMENT_LABEL[r.said].toLowerCase()} comes before ${ELEMENT_LABEL[r.after].toLowerCase()}.`, 'bad'));
    out.replaceChildren(para(`Good call: “${said.map((p) => p.text).join(', ')}.”`), para(s.pieces.map(([k]) => ELEMENT_LABEL[k]).join(' → ')));
  });
  load();
}

/* ---------- Words quiz ---------- */
const WORD_CASES = [
  ['Approach asks: “Can you accept a visual approach?” You can.', 'Affirmative'],
  ['Approach passes the weather at your destination. You heard all of it and have no question.', 'Roger'],
  ['Center: “Report passing the Lake intersection.” You will.', 'Wilco'],
  ['You are cleared to cross a fix at a lower altitude, but you cannot descend that fast.', 'Unable'],
  ['A squeal blocked the middle of your clearance.', 'Say again'],
  ['Ground asks for your fuel state while you are busy with a checklist. You need a few seconds.', 'Stand by'],
  ['Reception is so poor that you want the controller to say every phrase twice.', 'Words twice'],
  ['You want ATC to confirm the altitude they just assigned.', 'Verify'],
  ['ATC called traffic at your two o’clock. You cannot see it.', 'Negative contact'],
  ['Approach asks: “Are you on the ILS frequency?” You are not.', 'Negative'],
  ['You want the controller to talk more slowly.', 'Speak slower'],
];
const WORD_POOL = [...new Set(WORD_CASES.map(([, w]) => w)), 'Over', 'Out', 'Acknowledge'];
function setupWords(root) {
  const prompt = root.querySelector('[data-prompt]'), choices = root.querySelector('[data-choices]');
  const out = root.querySelector('[data-result]');
  let score = 0, asked = 0, order = shuffle(WORD_CASES), i = 0;
  function ask() {
    const [situation, answer] = order[i++ % order.length];
    prompt.textContent = situation;
    const pool = shuffle([answer, ...shuffle(WORD_POOL.filter((w) => w !== answer)).slice(0, 3)]);
    choices.replaceChildren(...pool.map((w) => button(w, () => {
      asked++;
      if (w === answer) score++;
      const roger = w === 'Roger' && answer !== 'Roger' ? ' Roger only says you received the transmission.' : '';
      out.textContent = `${w === answer ? 'Correct' : `Not quite: “${answer}”.${roger}`} ${score} of ${asked}.`;
      for (const c of choices.children) c.disabled = true;
    })));
  }
  root.querySelector('[data-new]').addEventListener('click', () => { out.textContent = ''; ask(); });
  ask();
}

/* ---------- Figure 5: readback ---------- */
const READBACKS = [
  { parts: [['id', 'identification', 'United Twelve'], ['alt', 'altitude', 'climb and maintain flight level three three zero']],
    readback: 'Climbing to flight level three three zero, United Twelve.' },
  { parts: [['id', 'identification', 'Navy Four Zero Five'], ['hdg', 'vector', 'turn right heading zero niner zero'], ['alt', 'altitude', 'descend and maintain three thousand'], ['set', 'altimeter', 'altimeter two niner niner two']],
    readback: 'Right heading zero niner zero, descend and maintain three thousand, Navy Four Zero Five.' },
  { parts: [['id', 'identification', 'November Five Charlie Tango'], ['wind', 'wind', 'wind two seven zero at one zero'], ['rwy', 'runway', 'runway nine left, cleared to land']],
    readback: 'November Five Charlie Tango, roger, cleared to land runway nine left.' },
  { parts: [['id', 'identification', 'Bonanza Six Five Five Golf'], ['tfc', 'traffic', 'traffic two o’clock, five miles, eastbound, altitude indicates three thousand five hundred']],
    readback: 'Bonanza Six Five Five Golf, looking for traffic (or “traffic in sight”, or “negative contact”).' },
];
function setupReadback(root) {
  const quote = root.querySelector('[data-clearance]'), box = root.querySelector('[data-parts]'), out = root.querySelector('[data-result]');
  let n = 0, picked = new Set();
  function load() {
    const s = READBACKS[n];
    picked = new Set();
    out.replaceChildren();
    quote.textContent = `“${s.parts.map(([, , t]) => t).join(', ')}.”`;
    box.replaceChildren(...s.parts.map(([id, , text]) => {
      const b = button(text, () => {
        picked.has(id) ? picked.delete(id) : picked.add(id);
        b.setAttribute('aria-pressed', String(picked.has(id)));
      });
      b.setAttribute('aria-pressed', 'false');
      return b;
    }));
  }
  root.querySelector('[data-check]').addEventListener('click', () => {
    const s = READBACKS[n];
    const clearance = s.parts.map(([id, kind]) => ({ id, kind }));
    const r = checkReadback(clearance, [...picked]);
    const text = (id) => s.parts.find((p) => p[0] === id)[2];
    const lines = [];
    if (r.ok) lines.push(para('Complete.'));
    else lines.push(para(`Missing: ${r.missing.map(text).join('; ')}.`, 'bad'));
    if (r.extra.length) lines.push(para(`Not required by AIM 4-4-7: ${r.extra.map(text).join('; ')}.`));
    lines.push(para(`A readback: “${s.readback}”`));
    out.replaceChildren(...lines);
  });
  root.querySelector('[data-next]').addEventListener('click', () => { n = (n + 1) % READBACKS.length; load(); });
  load();
}

/* ---------- Figure 6: flight check-in and push ---------- */
// tuned: [lead, wing] lane; talker: 'lead' | 'wing' | null.
const FLIGHT = [
  { tuned: ['VHF', 'VHF'], talker: 'lead', words: 'Angry, check Victor.', note: 'On the ground before taxi, on the briefed VHF tactical frequency, lead checks the flight in.' },
  { tuned: ['VHF', 'VHF'], talker: 'wing', words: 'Angry 1-2, with (ATIS code).', note: 'The wingman answers with its call sign and the ATIS code; if not ready, “Two, standby (X) mikes”, then it calls lead when ready.' },
  { tuned: ['VHF', 'VHF'], talker: 'lead', words: 'Angry, push UHF TAC.', note: 'Leaving the working area, lead directs the change on the current tactical frequency.' },
  { tuned: ['UHF', 'UHF'], talker: null, words: '', note: 'Both aircraft select UHF TAC. Nobody transmits during the switch.' },
  { tuned: ['UHF', 'UHF'], talker: 'lead', words: 'Angry.', note: 'Lead checks the flight in on the new frequency with the flight call sign alone.' },
  { tuned: ['UHF', 'UHF'], talker: 'wing', words: 'Angry 1-2.', note: 'The wingman answers with its position. The flight is together on the new frequency.' },
];
function setupFlight(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
  const lane = { VHF: 110, UHF: 230 }, who = { lead: 150, wing: 490 };
  let i = 0;
  function draw() {
    const s = FLIGHT[i];
    svg.replaceChildren();
    for (const [name, y] of Object.entries(lane)) {
      svg.append(el('line', { x1: 40, y1: y, x2: 600, y2: y, class: 'ln dashed' }), el('text', { x: 40, y: y - 8, class: 'lbl' }, `${name} TAC`));
    }
    ['lead', 'wing'].forEach((k, j) => {
      const X = who[k], y = lane[s.tuned[j]];
      svg.append(el('text', { x: X, y: 30, class: 'lbl', 'text-anchor': 'middle' }, k === 'lead' ? 'LEAD (ANGRY 1-1)' : 'WING (ANGRY 1-2)'));
      svg.append(side(X, 52, k === 'lead' ? 'acft' : 'acft other', 1.4));
      svg.append(el('line', { x1: X, y1: 62, x2: X, y2: y - 12, class: 'thin' }));
      svg.append(el('rect', { x: X - 34, y: y - 12, width: 68, height: 24, class: `box${s.talker === k ? ' on' : ''}` }));
      svg.append(el('text', { x: X, y: y + 4, class: `lbl${s.talker === k ? ' inv' : ''}`, 'text-anchor': 'middle' }, s.talker === k ? 'TRANSMIT' : 'LISTEN'));
    });
    if (s.talker) {
      const from = who[s.talker], to = who[s.talker === 'lead' ? 'wing' : 'lead'], y = lane[s.tuned[0]];
      const dir = Math.sign(to - from);
      svg.append(el('path', { d: `M${from + dir * 40} ${y} L${to - dir * 44} ${y} M${to - dir * 52} ${y - 6} L${to - dir * 44} ${y} L${to - dir * 52} ${y + 6}`, class: 'ln heavy on' }));
      svg.append(el('text', { x: 320, y: y - 20, class: 'lbl big on', 'text-anchor': 'middle' }, `“${s.words}”`));
    } else {
      svg.append(el('text', { x: 320, y: 172, class: 'lbl big', 'text-anchor': 'middle' }, 'SWITCHING ▼'));
    }
    svg.append(el('text', { x: 600, y: 286, class: 'lbl small', 'text-anchor': 'end' }, `CALL ${i + 1} OF ${FLIGHT.length}`));
    out.textContent = s.note;
    prev.disabled = i === 0;
    next.disabled = i === FLIGHT.length - 1;
  }
  prev.addEventListener('click', () => { i = Math.max(0, i - 1); draw(); });
  next.addEventListener('click', () => { i = Math.min(FLIGHT.length - 1, i + 1); draw(); });
  draw();
}

/* ---------- Figure 7: transponder ---------- */
const CHANGES = [['2700', '7200'], ['3600', '7300'], ['1700', '7100'], ['0700', '7000']];
function setupSquawk(root) {
  const prompt = root.querySelector('[data-prompt]'), knobs = root.querySelector('[data-knobs]');
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  let n = 0, code, sent;
  function draw() {
    const [from, to] = CHANGES[n];
    prompt.textContent = `ATC: “Squawk ${[...to].join(' ')}.” You are squawking ${from}.`;
    [...knobs.querySelectorAll('span')].forEach((s, i) => { s.textContent = code[i]; });
    svg.replaceChildren();
    svg.append(el('rect', { x: 40, y: 20, width: 150, height: 60, class: 'box' }), el('text', { x: 115, y: 61, class: 'lbl big mono', 'text-anchor': 'middle', style: 'font-size:30px' }, code.join('')));
    svg.append(el('text', { x: 40, y: 98, class: 'lbl small' }, 'CODE WINDOW'));
    svg.append(el('text', { x: 220, y: 24, class: 'lbl' }, 'CODES SENT'));
    sent.slice(-8).forEach((c, i) => {
      const bad = c in SPECIAL_CODES;
      svg.append(el('rect', { x: 220 + i * 47, y: 34, width: 43, height: 26, class: `box${bad ? ' on' : ''}`, style: bad ? 'fill:#a3000b;stroke:#a3000b' : '' }));
      svg.append(el('text', { x: 241 + i * 47, y: 52, class: `lbl mono${bad ? ' inv' : ''}`, 'text-anchor': 'middle' }, c));
    });
    svg.append(el('text', { x: 220, y: 84, class: 'lbl small' }, `TARGET ${to}`));
    const alarms = sent.filter((c) => c in SPECIAL_CODES && c !== to);
    const lines = [];
    const now = code.join('');
    if (now in SPECIAL_CODES && now !== to) lines.push(para(`You are sending ${now}, the ${SPECIAL_CODES[now]} code. Facilities watching your code may show an alert.`, 'bad'));
    if (now === to) lines.push(para(alarms.length ? `Code set, but on the way you sent ${[...new Set(alarms)].join(', ')}.` : `Code set without passing through 7500, 7600 or 7700.`, alarms.length ? 'bad' : ''));
    out.replaceChildren(...lines);
  }
  function load() {
    const [from] = CHANGES[n];
    code = [...from];
    sent = [from];
    draw();
  }
  knobs.replaceChildren(...[0, 1, 2, 3].map((i) => {
    const k = document.createElement('div');
    k.className = 'knob';
    const step = (d) => { code[i] = String((+code[i] + d + 8) % 8); sent.push(code.join('')); draw(); };
    const minus = button('−', () => step(-1)), plus = button('+', () => step(1));
    minus.setAttribute('aria-label', `Digit ${i + 1} down`);
    plus.setAttribute('aria-label', `Digit ${i + 1} up`);
    k.append(minus, document.createElement('span'), plus);
    return k;
  }));
  root.querySelector('[data-hint]').addEventListener('click', () => {
    const [from, to] = CHANGES[n];
    const s = safeOrder(from, to);
    out.replaceChildren(para(s ? `Set digit ${s.order.map((d) => d + 1).join(', then digit ')}: ${[from, ...s.path].join(' → ')}.` : 'No order avoids the special codes.'));
  });
  root.querySelector('[data-next]').addEventListener('click', () => { n = (n + 1) % CHANGES.length; load(); });
  load();
}

/* ---------- Figure 8: light gun ---------- */
function setupLight(root) {
  const svg = root.querySelector('svg'), prompt = root.querySelector('[data-prompt]');
  const choices = root.querySelector('[data-choices]'), out = root.querySelector('[data-result]');
  let signal = LIGHT_SIGNALS[1], score = 0, asked = 0;
  const where = () => root.querySelector('[name="where"]:checked').value;
  function draw() {
    const air = where() === 'flight';
    svg.replaceChildren();
    // Tower.
    svg.append(el('path', { d: 'M70 240 L80 120 L120 120 L130 240 Z', class: 'box' }), el('path', { d: 'M62 120 L138 120 L130 88 L70 88 Z', class: 'box' }));
    svg.append(el('path', { d: 'M66 88 L134 88 L124 76 L76 76 Z', class: 'fill' }), el('text', { x: 100, y: 256, class: 'lbl small', 'text-anchor': 'middle' }, 'TOWER'));
    svg.append(el('line', { x1: 20, y1: 240, x2: 620, y2: 240, class: 'ln' }));
    const target = air ? [470, 90] : [470, 228];
    if (air) svg.append(el('text', { x: 470, y: 60, class: 'lbl small', 'text-anchor': 'middle' }, 'IN THE PATTERN'));
    else svg.append(el('rect', { x: 380, y: 236, width: 180, height: 8, class: 'fill' }), el('text', { x: 470, y: 256, class: 'lbl small', 'text-anchor': 'middle' }, 'TAXIWAY'));
    svg.append(side(target[0], target[1], 'acft', 1.6));
    const lamp = [140, 104];
    signal.colors.forEach((c, j) => {
      const blink = signal.flash && !reduceMotion();
      const delay = signal.colors.length > 1 ? `animation-delay:${j * 0.45}s` : '';
      svg.append(el('path', { d: `M${lamp[0]} ${lamp[1] - 4} L${target[0] - 20} ${target[1] - 22} L${target[0] - 20} ${target[1] + 22} L${lamp[0]} ${lamp[1] + 4} Z`, class: `beam-${c}${blink ? ' blink' : ''}`, style: delay }));
      svg.append(el('circle', { cx: lamp[0] + j * 2, cy: lamp[1], r: 9, class: `lamp-${c}${blink ? ' blink' : ''}`, style: delay }));
    });
    if (signal.flash && reduceMotion()) {
      svg.append(el('circle', { cx: lamp[0], cy: lamp[1], r: 16, class: 'flash-ring' }), el('text', { x: lamp[0] + 22, y: lamp[1] - 14, class: 'lbl small' }, signal.colors.length > 1 ? 'ALTERNATING' : 'FLASHING'));
    }
  }
  function ask() {
    const key = where();
    const pool = LIGHT_SIGNALS.filter((s) => s[key] !== 'Not applicable');
    signal = pool[Math.floor(Math.random() * pool.length)];
    prompt.textContent = 'What does this signal mean for you?';
    const options = shuffle([signal[key], ...shuffle([...new Set(pool.map((s) => s[key]).filter((m) => m !== signal[key]))]).slice(0, 3)]);
    choices.replaceChildren(...options.map((m) => button(m, () => {
      asked++;
      if (m === signal[key]) score++;
      const name = `${signal.flash ? (signal.colors.length > 1 ? 'Alternating red and green' : `Flashing ${signal.colors[0]}`) : `Steady ${signal.colors[0]}`}`;
      out.textContent = `${m === signal[key] ? 'Correct' : `Not quite: ${signal[key]}`}. ${name}. ${score} of ${asked}.`;
      for (const c of choices.children) c.disabled = true;
    })));
    out.textContent = '';
    draw();
  }
  root.querySelector('[data-flash]').addEventListener('click', ask);
  root.querySelectorAll('[name="where"]').forEach((i) => i.addEventListener('change', ask));
  ask();
}

/* ---------- Figure 9: lost communications ---------- */
const SEGMENTS = [{ name: 'A', minimum: 3000 }, { name: 'B', minimum: 7000 }, { name: 'C', minimum: 4000 }, { name: 'D', minimum: 2000 }];
function setupLost(root) {
  const svg = root.querySelector('svg'), out = root.querySelector('[data-result]');
  const f = Object.fromEntries([...root.querySelectorAll('[name]')].map((i) => [i.name, i]));
  const y = (ft) => 340 - ft / 13000 * 190, sx = (i) => 60 + i * 135;
  function draw() {
    const assigned = +f.assignedAlt.value, expectedAlt = +f.expected.value;
    root.querySelector('output[for="assigned"]').textContent = `${r0(assigned)} ft`;
    root.querySelector('output[for="expected"]').textContent = expectedAlt ? `${r0(expectedAlt)} ft from C` : 'none';
    const route = lostCommsRoute({ vectored: f.vectored.checked, assigned: f.assigned.checked, expected: f.expectRoute.checked });
    svg.replaceChildren();
    svg.append(el('text', { x: 40, y: 20, class: 'lbl' }, 'ROUTE: FIRST THAT APPLIES'));
    ROUTE_RULES.forEach((r, i) => {
      const on = r.id === route, X = 40 + i * 145;
      svg.append(el('rect', { x: X, y: 30, width: 125, height: 34, class: `box${on ? ' on' : ''}` }));
      svg.append(el('text', { x: X + 62, y: 52, class: `lbl${on ? ' inv' : ''}`, 'text-anchor': 'middle' }, r.label.toUpperCase()));
      if (i < 3) svg.append(el('path', { d: `M${X + 127} 47 L${X + 143} 47`, class: 'thin' }));
    });
    const segs = lostCommsAltitudes({ segments: SEGMENTS, assigned, expected: expectedAlt ? { altitude: expectedAlt, fromSegment: 2 } : null });
    svg.append(el('text', { x: 40, y: 104, class: 'lbl' }, 'ALTITUDE: HIGHEST FOR EACH SEGMENT'));
    for (let ft = 0; ft <= 12000; ft += 2000) {
      svg.append(el('line', { x1: 60, y1: y(ft), x2: 600, y2: y(ft), class: 'grid' }), el('text', { x: 54, y: y(ft) + 4, class: 'lbl small', 'text-anchor': 'end' }, ft ? `${ft / 1000}k` : '0'));
    }
    let path = '';
    segs.forEach((s, i) => {
      const x1 = sx(i), x2 = sx(i + 1);
      svg.append(el('rect', { x: x1, y: y(s.minimum), width: x2 - x1, height: y(0) - y(s.minimum), class: 'terrain' }));
      svg.append(el('text', { x: (x1 + x2) / 2, y: y(s.minimum) + 14, class: 'lbl small', 'text-anchor': 'middle' }, `MIN ${r0(s.minimum)}`));
      svg.append(el('text', { x: (x1 + x2) / 2, y: 354, class: 'lbl', 'text-anchor': 'middle' }, `SEGMENT ${s.name}`));
      svg.append(el('text', { x: (x1 + x2) / 2, y: y(s.altitude) - 8, class: 'lbl on', 'text-anchor': 'middle' }, `${r0(s.altitude)} ${s.source.toUpperCase()}`));
      path += `${i ? 'L' : 'M'}${x1} ${y(s.altitude)} L${x2} ${y(s.altitude)} `;
      svg.append(el('line', { x1, y1: y(0), x2: x1, y2: 140, class: 'thin' }));
    });
    svg.append(el('line', { x1: sx(0), y1: y(assigned), x2: sx(4), y2: y(assigned), class: 'ln dashed' }), el('text', { x: 604, y: y(assigned) + 4, class: 'lbl small' }, 'ASGN'));
    if (expectedAlt) svg.append(el('line', { x1: sx(2), y1: y(expectedAlt), x2: sx(4), y2: y(expectedAlt), class: 'ln dashed on' }), el('text', { x: 604, y: y(expectedAlt) + 4, class: 'lbl small on' }, 'EXP'));
    svg.append(el('path', { d: path, class: 'flown' }));
    const rule = ROUTE_RULES.find((r) => r.id === route);
    out.replaceChildren(para(`Route: ${rule.text}`), para(`Altitudes: ${segs.map((s) => `${s.name} ${r0(s.altitude)} ft (${s.source})`).join(', ')}.`));
  }
  root.querySelectorAll('input').forEach((i) => i.addEventListener('input', draw));
  draw();
}

const blocks = { gap: setupGap, bands: setupBands, say: setupSay, call: setupCall, words: setupWords, readback: setupReadback, flight: setupFlight, squawk: setupSquawk, light: setupLight, lost: setupLost };
for (const root of document.querySelectorAll('[data-lesson]')) {
  blocks[root.dataset.lesson]?.(root);
  root.classList.add('ready');
}
