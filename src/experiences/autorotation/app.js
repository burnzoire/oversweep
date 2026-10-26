/* Autorotation exercise: setup, controls, the side-view scene, the
 * instruments, instructor cues and the debrief. The flight model is in
 * model.cjs; every number here that is not from it is display or input tuning.
 */
(function () {
  'use strict';
  if (window.oversweepFramed) return;
  const M = window.AutorotationModel;
  const $ = id => document.getElementById(id);
  const DEG = Math.PI / 180;
  const COLLECTIVE_RATE = 0.9, CYCLIC_RATE = 0.6;  // full travel per second from the keys
  const AUTO_SPEED = 55;                           // kt, this invented helicopter's autorotation speed
  const STORE = 'oversweep.autorotation.';

  const read = (key, fallback) => { try { const v = localStorage.getItem(STORE + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(STORE + key, JSON.stringify(value)); } catch {} };

  const settings = Object.assign({ fuel: 60, alt: 1000, speed: 90, surprise: false }, read('settings', {}));
  let bindings = read('bindings', {});
  let state, phase = 'setup', failAt = 3, paused = false, trail = [], stats = {}, lastFrame = 0, camH = 60;
  let binding = null, lastAxes = {}, audio = null, horn = null;
  const input = { collective: 0.5, cyclic: 0 };
  const keys = new Set();

  /* ---------- runs ---------- */

  function begin() {
    state = M.newState({ altitudeFt: settings.alt, speedKt: settings.speed, fuel: settings.fuel / 100 });
    input.collective = state.collective; input.cyclic = state.cyclic;
    failAt = settings.surprise ? 2 + Math.random() * 8 : 3;
    trail = []; stats = {}; paused = false; camH = Math.max(40, state.h * 1.35 + 20);
    phase = 'countdown';
    $('caution').hidden = true;
    startAudio();
  }

  function failEngine() {
    M.failEngine(state);
    stats.failTime = state.t;
    stats.trimCollective = state.trimCollective;
    phase = 'flying';
    $('caution').hidden = false;
  }

  function finish() {
    phase = 'done';
    setHorn(false);
    const td = state.touchdown;
    const verdict = M.grade(td, state);
    const words = { ok: 'Safe landing', marginal: 'Landed, with problems', failed: 'Not survivable as flown' };
    $('debriefResult').textContent = words[verdict.result];
    $('debriefResult').className = 'result ' + verdict.result;
    $('debriefItems').replaceChildren(...verdict.items.map(([level, text]) => {
      const li = document.createElement('li'); li.className = level; li.textContent = text; return li;
    }));
    const rows = [
      ['Engine failure', `${settings.alt.toLocaleString()} ft, ${settings.speed} kt, ${settings.fuel}% fuel`],
      ['Collective halfway down after', stats.react === undefined ? 'never' : `${stats.react.toFixed(1)} s`],
      ['Lowest rotor rpm', `${Math.round(state.minRpm ?? 100)}%`],
      ['Highest rotor rpm', `${Math.round(state.maxRpm ?? 100)}%`],
      ['Airspeed passing 200 ft', stats.at200 === undefined ? '—' : `${Math.round(stats.at200)} kt`],
      ['Flare began at', stats.flare === undefined ? 'no flare' : `${Math.round(stats.flare)} ft`],
      ['Time from failure to touchdown', `${(td.t - (stats.failTime ?? 0)).toFixed(1)} s`],
    ];
    $('debriefStats').replaceChildren(...rows.flatMap(([k, v]) => {
      const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; return [dt, dd];
    }));
    setTimeout(() => { if (phase === 'done' && !$('debrief').open) $('debrief').showModal(); }, 900);
  }

  /* ---------- inputs ---------- */

  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const KEYMAP = { Shift: 'up', w: 'up', Control: 'down', s: 'down', ArrowUp: 'fwd', ArrowDown: 'aft' };
  const keyName = e => e.key.length === 1 ? e.key.toLowerCase() : e.key;

  addEventListener('keydown', e => {
    if (document.querySelector('dialog[open]')) {
      if (e.key === 'Enter' && $('setup').open && e.target.tagName !== 'BUTTON') { e.preventDefault(); $('start').click(); }
      else if (e.key === 'Enter' && $('debrief').open && e.target.tagName !== 'BUTTON') { e.preventDefault(); $('again').click(); }
      return;
    }
    const k = keyName(e);
    if (KEYMAP[k]) { keys.add(KEYMAP[k]); if (k.startsWith('Arrow') || (e.ctrlKey && k.length === 1)) e.preventDefault(); }
    else if (k === ' ' || k === 'p') { e.preventDefault(); if (phase === 'countdown' || phase === 'flying') paused = !paused; }
    else if (k === 'Enter' && (phase === 'setup' || phase === 'done')) openSetup();
  });
  addEventListener('keyup', e => { const k = KEYMAP[keyName(e)]; if (k) keys.delete(k); if (e.key === 'Shift' || e.key === 'Control') { keys.delete('up'); keys.delete('down'); } });
  addEventListener('blur', () => { keys.clear(); if (phase === 'countdown' || phase === 'flying') paused = true; });

  function applyKeys(dt) {
    if (keys.has('up')) input.collective += COLLECTIVE_RATE * dt;
    if (keys.has('down')) input.collective -= COLLECTIVE_RATE * dt;
    if (keys.has('fwd')) input.cyclic += CYCLIC_RATE * dt;
    if (keys.has('aft')) input.cyclic -= CYCLIC_RATE * dt;
    input.collective = clamp(input.collective, 0, 1);
    input.cyclic = clamp(input.cyclic, -1, 1);
  }

  // Levers: the top of the track is collective up and cyclic forward.
  function lever(track, control) {
    const set = e => {
      const r = track.getBoundingClientRect(), pad = 14;
      const f = clamp(1 - (e.clientY - r.top - pad) / (r.height - 2 * pad), 0, 1);
      input[control] = control === 'collective' ? f : f * 2 - 1;
    };
    track.addEventListener('pointerdown', e => { if (!controlsLive()) return; track.setPointerCapture(e.pointerId); set(e); e.preventDefault(); });
    track.addEventListener('pointermove', e => { if (controlsLive() && track.hasPointerCapture(e.pointerId)) set(e); });
  }
  lever($('collectiveTrack'), 'collective');
  lever($('cyclicTrack'), 'cyclic');
  const controlsLive = () => phase === 'flying' && !paused;

  // Joystick axes set positions directly, and only when they move, so the
  // keys and levers still work with a controller connected.
  function pollGamepads() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    $('gamepadStatus').textContent = pads.length ? `Connected: ${pads.map(p => p.id).join(', ')}` : 'Connect a controller and press any of its buttons.';
    if (binding) {
      // A controller first seen after Set was pressed (browsers reveal each
      // one on its first input) takes its resting axes as its baseline.
      for (const p of pads) {
        const base = binding.base[p.index] ??= [...p.axes];
        const axis = p.axes.findIndex((v, i) => Math.abs(v - (base[i] ?? v)) > 0.5);
        if (axis < 0) continue;
        bindings[binding.control] = { pad: p.index, axis, invert: $(binding.control === 'collective' ? 'invertCollective' : 'invertCyclic').checked };
        delete lastAxes[binding.control];
        write('bindings', bindings); binding = null; showBindings();
        break;
      }
      return;
    }
    for (const control of ['collective', 'cyclic']) {
      const b = bindings[control]; if (!b) continue;
      const pad = pads.find(p => p.index === b.pad); if (!pad || pad.axes[b.axis] === undefined) continue;
      const v = pad.axes[b.axis], key = control;
      if (lastAxes[key] !== undefined && Math.abs(v - lastAxes[key]) < 0.01) continue;
      lastAxes[key] = v;
      if (!controlsLive()) continue;
      const s = b.invert ? v : -v;   // pushed forward or up reads -1 on most devices
      input[control] = control === 'collective' ? (1 + s) / 2 : s;
    }
  }
  function startBinding(control) {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    binding = { control, base: Object.fromEntries(pads.map(p => [p.index, [...p.axes]])) };
    $(control + 'Binding').textContent = 'Move it now…';
  }
  function showBindings() {
    for (const control of ['collective', 'cyclic']) {
      const b = bindings[control];
      $(control + 'Binding').textContent = b ? `Controller ${b.pad + 1}, axis ${b.axis + 1}` : 'Not set';
      $(control === 'collective' ? 'invertCollective' : 'invertCyclic').checked = Boolean(b?.invert);
    }
  }

  /* ---------- the loop ---------- */

  function frame(now) {
    // Schedule the next frame first, so one bad frame cannot stop the loop.
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - (lastFrame || now)) / 1000);
    lastFrame = now;
    pollGamepads();
    if (state && !paused && (phase === 'countdown' || phase === 'flying')) {
      if (phase === 'countdown') {
        input.collective = state.trimCollective; input.cyclic = state.cyclic;
        if (state.t >= failAt) failEngine();
      } else applyKeys(dt);
      M.step(state, input, dt);
      record();
      if (state.onGround && phase !== 'done') finish();
    }
    drawScene(dt);
    drawDials();
    showControls();
    showPrompt();
  }

  function record() {
    const ft = state.h / M.FT, kt = state.u / M.KT;
    if (!trail.length || state.t - trail[trail.length - 1].t > 0.1) trail.push({ t: state.t, x: state.x, h: state.h });
    if (trail.length > 3000) trail.shift();
    if (phase !== 'flying') return;
    const trimC = stats.trimCollective;
    if (stats.react === undefined && state.collective <= trimC / 2) stats.react = state.t - stats.failTime;
    if (stats.at200 === undefined && ft < 200 && settings.alt > 200) stats.at200 = kt;
    if (stats.flare === undefined && ft < 300 && state.pitch > 8) stats.flare = ft;
    setHorn(state.rpm < 95 && !state.onGround);
  }

  /* ---------- instructor ---------- */

  function cue() {
    if (!state) return '';
    if (paused) return 'Paused. Press Space to continue.';
    if (phase === 'countdown') return settings.surprise ? 'Fly on. The engine will fail some time soon.' : '';
    if (phase !== 'flying' || !$('instructor').checked) return '';
    const ft = state.h / M.FT, kt = state.u / M.KT, since = state.t - stats.failTime;
    if (state.rotorLost) return 'Rotor rpm lost. The blades have stalled.';
    if (since < 6 && state.collective > stats.trimCollective * 0.4) return 'Engine failure! Lower the collective, now.';
    if (ft < 8) return 'Cushion: raise the collective to slow the descent.';
    if (ft < M.LIMITS.levelHeight && state.pitch > 4) return 'Level the skids: forward cyclic.';
    if (ft < M.LIMITS.levelHeight) return 'Hold the skids level.';
    if (ft < M.LIMITS.flareHeight) return 'Flare: aft cyclic to slow down and cut the descent.';
    if (state.rpm < M.LIMITS.rpmGreenLow) return state.collective > 0.05 ? 'Rotor rpm low: collective down.' : 'Rotor rpm low: aft cyclic helps rebuild it.';
    if (state.rpm > M.LIMITS.rpmGreenHigh) return 'Rotor rpm high: raise the collective slightly.';
    if (since < 4 && settings.speed >= 70 && state.pitch < -8) return 'Aft cyclic: stop the nose dropping.';
    if (kt < AUTO_SPEED - 15 && ft > 100) return `Lower the nose to build airspeed toward ${AUTO_SPEED} kt.`;
    if (kt > AUTO_SPEED + 20) return `Aft cyclic to slow toward ${AUTO_SPEED} kt.`;
    return `Hold about ${AUTO_SPEED} kt and rotor rpm in the green.`;
  }
  function showPrompt() {
    const p = $('prompt'), text = cue();
    if (p.textContent !== text) p.textContent = text;
    const c = $('countdown');
    const n = phase === 'countdown' && !settings.surprise ? Math.ceil(failAt - state.t) : 0;
    const label = n > 0 ? `Engine failure in ${n}` : '';
    if (c.textContent !== label) c.textContent = label;
  }

  /* ---------- sound ---------- */

  function startAudio() {
    if (audio || !$('sound').checked) return;
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      horn = audio.createGain(); horn.gain.value = 0; horn.connect(audio.destination);
      const osc = audio.createOscillator(); osc.type = 'square'; osc.frequency.value = 620; osc.connect(horn); osc.start();
    } catch { audio = null; }
  }
  function setHorn(on) {
    if (!horn) return;
    const level = on && $('sound').checked && !paused ? 0.05 : 0;
    if (horn.gain.value !== level) horn.gain.setTargetAtTime(level, audio.currentTime, 0.02);
  }

  /* ---------- drawing ---------- */

  // Before a run the scene shows the helicopter trimmed at the chosen start.
  let previewKey = '', previewed = null;
  function preview() {
    const key = `${settings.alt},${settings.speed},${settings.fuel}`;
    if (key !== previewKey) { previewKey = key; previewed = M.newState({ altitudeFt: settings.alt, speedKt: settings.speed, fuel: settings.fuel / 100 }); }
    return previewed;
  }

  function fit(canvas) {
    const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(r.width * dpr)), h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  }

  function drawScene(dt) {
    const { ctx, w, h } = fit($('scene'));
    const s = state || preview();
    const groundY = h * 0.84;
    const target = Math.max(40, s.h * 1.35 + 20);
    camH += (target - camH) * Math.min(1, dt * 2 || 1);
    const scale = (groundY - 30) / camH;          // px per metre
    const camX = s.x - (w * 0.42) / scale;
    const sx = x => (x - camX) * scale, sy = z => groundY - z * scale;

    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#cfe0ea'); sky.addColorStop(1, '#f4f2ea');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, groundY);
    ctx.fillStyle = '#b9b48f'; ctx.fillRect(0, groundY, w, h - groundY);
    ctx.fillStyle = '#8d8a66'; ctx.fillRect(0, groundY, w, 3);

    // Ground posts for a sense of speed, labelled in metres along the ground.
    const step = scale > 6 ? 10 : scale > 1.5 ? 50 : 200;
    ctx.font = '10px monospace'; ctx.fillStyle = '#5c5a44'; ctx.strokeStyle = '#6f6c50'; ctx.lineWidth = 1;
    for (let x = Math.floor(camX / step) * step; x < camX + w / scale; x += step) {
      const px = sx(x), big = x % (step * 5) === 0;
      ctx.beginPath(); ctx.moveTo(px, groundY); ctx.lineTo(px, groundY + (big ? 12 : 6)); ctx.stroke();
      if (big) ctx.fillText(`${Math.round(x)} m`, px + 3, groundY + 22);
      if (step === 10 && Math.abs(Math.sin(x * 12.9898) * 43758.5453 % 1) < 0.3) bush(ctx, px, groundY, scale);
    }

    // Height ladder in feet on the left edge.
    const ftScale = scale * M.FT;
    const ladder = [10, 50, 100, 250, 500, 1000].find(v => v * ftScale > 28) || 1000;
    ctx.fillStyle = 'rgba(32,34,31,.7)'; ctx.strokeStyle = 'rgba(32,34,31,.35)';
    for (let f = ladder; sy(f * M.FT) > 10; f += ladder) {
      const y = sy(f * M.FT);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(10, y); ctx.stroke();
      ctx.fillText(`${f} ft`, 13, y + 3);
    }

    if (trail.length > 1) {
      ctx.strokeStyle = 'rgba(32,34,31,.35)'; ctx.setLineDash([4, 4]); ctx.beginPath();
      trail.forEach((p, i) => { const X = sx(p.x), Y = sy(p.h + M.HELI.mastHeight / 2); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      ctx.stroke(); ctx.setLineDash([]);
    }

    const size = Math.max(scale, 70 / 13);       // keep the helicopter visible when high
    helicopter(ctx, sx(s.x), sy(s.h), size, s.pitch, s.rpm);
    if (size > scale * 1.05) {
      ctx.fillStyle = 'rgba(32,34,31,.6)';
      ctx.fillText('not to scale', sx(s.x) - 30, sy(s.h) + 18);
    }
  }

  function bush(ctx, x, y, scale) {
    ctx.fillStyle = '#7f8a5a';
    ctx.beginPath(); ctx.ellipse(x + 3 * scale, y, 1.6 * scale, 1.1 * scale, 0, Math.PI, 0); ctx.fill();
  }

  // Side view, nose to the right, origin at the middle of the skids, units metres.
  function helicopter(ctx, x, y, k, pitch, rpm) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(k, -k); ctx.rotate(pitch * DEG);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.strokeStyle = '#2b2e2a'; ctx.lineWidth = 0.12;
    // skids and struts
    ctx.beginPath(); ctx.moveTo(-1.7, 0); ctx.lineTo(1.5, 0); ctx.quadraticCurveTo(1.9, 0, 1.95, 0.3);
    ctx.moveTo(-0.9, 0); ctx.lineTo(-0.7, 0.6); ctx.moveTo(0.9, 0); ctx.lineTo(0.8, 0.6); ctx.stroke();
    // tail boom and fin
    ctx.fillStyle = '#56604a';
    ctx.beginPath(); ctx.moveTo(-1.0, 1.45); ctx.lineTo(-6.6, 1.85); ctx.lineTo(-6.6, 2.0); ctx.lineTo(-1.0, 2.05); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6.0, 1.9); ctx.lineTo(-6.75, 2.9); ctx.lineTo(-6.95, 2.9); ctx.lineTo(-6.7, 1.3); ctx.lineTo(-6.45, 1.3); ctx.closePath(); ctx.fill();
    // cabin
    ctx.beginPath(); ctx.moveTo(-1.3, 0.6); ctx.lineTo(1.0, 0.6); ctx.quadraticCurveTo(2.1, 0.7, 2.0, 1.6);
    ctx.quadraticCurveTo(1.7, 2.35, 0.6, 2.4); ctx.lineTo(-1.3, 2.4); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a9c1c9';
    ctx.beginPath(); ctx.moveTo(0.35, 1.25); ctx.lineTo(1.75, 1.25); ctx.quadraticCurveTo(1.65, 2.1, 0.6, 2.2); ctx.lineTo(0.35, 2.2); ctx.closePath(); ctx.fill();
    // engine deck and mast
    ctx.fillStyle = '#454c3b'; ctx.fillRect(-1.4, 2.35, 1.8, 0.3);
    ctx.fillRect(-0.08, 2.6, 0.16, 0.25);
    // main rotor: a blurred disk whose strength follows rotor rpm
    const a = Math.min(1, rpm / 100);
    ctx.fillStyle = `rgba(40,42,38,${0.18 + 0.25 * a})`;
    ctx.beginPath(); ctx.ellipse(0, 2.9, 5, 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2b2e2a'; ctx.fillRect(-0.25, 2.82, 0.5, 0.16);
    // tail rotor
    ctx.strokeStyle = `rgba(40,42,38,${0.25 + 0.35 * a})`; ctx.lineWidth = 0.08;
    ctx.beginPath(); ctx.arc(-6.6, 2.25, 0.7, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  function dial(ctx, cx, cy, r, title) {
    ctx.fillStyle = '#16181a'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#c9c9c1'; ctx.font = `${Math.max(8, r * 0.13)}px monospace`; ctx.textAlign = 'center';
    ctx.fillText(title, cx, cy - r * 0.26);
  }
  // Angles in degrees clockwise from 12 o'clock.
  function ticks(ctx, cx, cy, r, from, to, values, label, minor = []) {
    ctx.strokeStyle = '#f2f2ec'; ctx.fillStyle = '#f2f2ec'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `${Math.max(8, r * 0.15)}px monospace`;
    for (const [v, ang] of values) {
      const t = (ang - 90) * DEG;
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(t) * r * 0.78, cy + Math.sin(t) * r * 0.78); ctx.lineTo(cx + Math.cos(t) * r * 0.95, cy + Math.sin(t) * r * 0.95); ctx.stroke();
      if (label) ctx.fillText(label(v), cx + Math.cos(t) * r * 0.6, cy + Math.sin(t) * r * 0.6);
    }
    for (const ang of minor) {
      const t = (ang - 90) * DEG;
      ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx + Math.cos(t) * r * 0.86, cy + Math.sin(t) * r * 0.86); ctx.lineTo(cx + Math.cos(t) * r * 0.95, cy + Math.sin(t) * r * 0.95); ctx.stroke();
    }
    ctx.textBaseline = 'alphabetic';
  }
  function needle(ctx, cx, cy, r, ang, color = '#fff', len = 0.85, width = 3) {
    const t = (ang - 90) * DEG;
    ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - Math.cos(t) * r * 0.12, cy - Math.sin(t) * r * 0.12); ctx.lineTo(cx + Math.cos(t) * r * len, cy + Math.sin(t) * r * len); ctx.stroke();
    ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.07, 0, Math.PI * 2); ctx.fill();
  }
  function arc(ctx, cx, cy, r, a0, a1, color) {
    ctx.strokeStyle = color; ctx.lineWidth = r * 0.08; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.9, (a0 - 90) * DEG, (a1 - 90) * DEG); ctx.stroke();
  }

  function drawDials() {
    const { ctx, w, h } = fit($('dials'));
    ctx.clearRect(0, 0, w, h);
    const s = state || preview();
    const o = M.readout(s);
    // Four across on a wide panel, two by two on a narrow one.
    const cols = w / h > 2.6 ? 4 : 2, rows = 4 / cols, cw = w / cols, ch = h / rows;
    const r = Math.min(ch / 2 - 4, cw / 2 - 6);
    const at = i => [cw * (i % cols) + cw / 2, ch * Math.floor(i / cols) + ch / 2];
    let [cx, cy] = at(0);
    // Airspeed: 0-140 kt over 300 degrees.
    const asi = v => clamp(v, 0, 140) / 140 * 320;
    dial(ctx, cx, cy, r, 'KNOTS');
    arc(ctx, cx, cy, r, asi(AUTO_SPEED - 5), asi(AUTO_SPEED + 5), '#2f9e4f');
    ticks(ctx, cx, cy, r, 0, 0, [0, 20, 40, 60, 80, 100, 120].map(v => [v, asi(v)]), v => v, [10, 30, 50, 70, 90, 110, 130].map(asi));
    needle(ctx, cx, cy, r, asi(o.airspeed));
    // Vertical speed: +-4,000 fpm, zero at 9 o'clock, climb up.
    const vsi = v => -90 + clamp(v, -4000, 4000) / 4000 * 170;
    [cx, cy] = at(1);
    dial(ctx, cx, cy, r, 'FPM ×1000');
    ticks(ctx, cx, cy, r, 0, 0, [-4000, -3000, -2000, -1000, 0, 1000, 2000, 3000, 4000].map(v => [v, vsi(v)]), v => Math.abs(v / 1000), [-500, -1500, 500, 1500].map(vsi));
    needle(ctx, cx, cy, r, vsi(o.vsi));
    // Height above the ground: one turn per 1,000 ft, with a counter.
    [cx, cy] = at(2);
    dial(ctx, cx, cy, r, 'FT AGL');
    ticks(ctx, cx, cy, r, 0, 0, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(v => [v, v * 36]), v => v, [18, 54, 90, 126, 162, 198, 234, 270, 306, 342]);
    ctx.fillStyle = '#000'; ctx.fillRect(cx - r * 0.38, cy + r * 0.12, r * 0.76, r * 0.24);
    ctx.fillStyle = '#f2f2ec'; ctx.font = `${Math.max(9, r * 0.18)}px monospace`; ctx.textAlign = 'center';
    ctx.fillText(Math.round(o.altitude).toString().padStart(4, ' '), cx, cy + r * 0.3);
    needle(ctx, cx, cy, r, (o.altitude % 1000) / 1000 * 360);
    // Dual tachometer: rotor (white) and engine (amber), 0-120% over 270 degrees.
    const tach = v => -135 + clamp(v, 0, 120) / 120 * 270;
    [cx, cy] = at(3);
    dial(ctx, cx, cy, r, 'RPM %');
    arc(ctx, cx, cy, r, tach(M.LIMITS.rpmGreenLow), tach(M.LIMITS.rpmGreenHigh), '#2f9e4f');
    arc(ctx, cx, cy, r, tach(M.LIMITS.rpmOverspeed - 0.8), tach(M.LIMITS.rpmOverspeed + 0.8), '#c63b2b');
    arc(ctx, cx, cy, r, tach(M.LIMITS.rpmUnrecoverable - 0.8), tach(M.LIMITS.rpmUnrecoverable + 0.8), '#c63b2b');
    ticks(ctx, cx, cy, r, 0, 0, [0, 20, 40, 60, 80, 100, 120].map(v => [v, tach(v)]), v => v, [10, 30, 50, 70, 90, 110].map(tach));
    ctx.fillStyle = '#e0a63a'; ctx.font = `${Math.max(7, r * 0.12)}px monospace`; ctx.fillText('E', cx - r * 0.25, cy + r * 0.62);
    ctx.fillStyle = '#fff'; ctx.fillText('R', cx + r * 0.25, cy + r * 0.62);
    needle(ctx, cx, cy, r, tach(o.engineRpm), '#e0a63a', 0.7, 2);
    needle(ctx, cx, cy, r, tach(o.rpm));
    $('readout').textContent = `IAS ${Math.round(o.airspeed)} kt · VSI ${Math.round(o.vsi).toLocaleString()} fpm · ${Math.round(o.altitude).toLocaleString()} ft · Rotor ${Math.round(o.rpm)}% · Engine ${Math.round(o.engineRpm)}% · Pitch ${o.pitch.toFixed(0)}°`;
  }

  function showControls() {
    const c = state ? state.collective : input.collective, y = state ? state.cyclic : input.cyclic;
    const place = (track, f) => { const handle = track.firstElementChild; handle.style.top = `calc(14px + ${(1 - f)} * (100% - 28px))`; };
    place($('collectiveTrack'), c);
    place($('cyclicTrack'), (y + 1) / 2);
    $('collectiveTrack').setAttribute('aria-valuenow', Math.round(c * 100));
    $('cyclicTrack').setAttribute('aria-valuenow', Math.round(y * 100));
  }

  /* ---------- dialogs ---------- */

  function syncSettings() {
    $('fuel').value = settings.fuel; $('alt').value = settings.alt; $('speed').value = settings.speed; $('surprise').checked = settings.surprise;
    $('fuelOut').textContent = `${settings.fuel}%`;
    $('altOut').textContent = `${Number(settings.alt).toLocaleString()} ft`;
    $('speedOut').textContent = `${settings.speed} kt`;
  }
  function openSetup() {
    phase = 'setup'; setHorn(false); state = null; trail = [];
    $('caution').hidden = true;
    if ($('debrief').open) $('debrief').close();
    syncSettings(); $('setup').showModal();
  }
  for (const id of ['fuel', 'alt', 'speed']) $(id).addEventListener('input', () => { settings[id] = Number($(id).value); syncSettings(); });
  $('surprise').addEventListener('change', () => { settings.surprise = $('surprise').checked; });
  document.querySelectorAll('[data-preset]').forEach(b => b.addEventListener('click', () => {
    const [alt, speed, fuel] = b.dataset.preset.split(',').map(Number);
    Object.assign(settings, { alt, speed, fuel }); syncSettings();
  }));
  $('start').onclick = () => { write('settings', settings); $('setup').close(); begin(); };
  $('again').onclick = () => { $('debrief').close(); begin(); };
  $('changeSettings').onclick = openSetup;
  $('newRun').onclick = openSetup;
  $('controlsHelp').onclick = () => { if (phase === 'flying' || phase === 'countdown') paused = true; $('controls').showModal(); };
  $('showControls').onclick = () => $('controls').showModal();
  $('closeControls').onclick = () => $('controls').close();
  $('gamepadSetup').onclick = () => { if (phase === 'flying' || phase === 'countdown') paused = true; showBindings(); $('gamepad').showModal(); };
  $('closeGamepad').onclick = () => { binding = null; showBindings(); $('gamepad').close(); };
  $('bindCollective').onclick = () => startBinding('collective');
  $('bindCyclic').onclick = () => startBinding('cyclic');
  for (const [id, control] of [['invertCollective', 'collective'], ['invertCyclic', 'cyclic']])
    $(id).addEventListener('change', () => { if (bindings[control]) { bindings[control].invert = $(id).checked; write('bindings', bindings); } });
  $('clearBindings').onclick = () => { bindings = {}; write('bindings', bindings); showBindings(); };
  $('sound').addEventListener('change', () => { if ($('sound').checked) startAudio(); else setHorn(false); });
  $('setup').addEventListener('cancel', e => { if (!state) e.preventDefault(); });

  syncSettings();
  $('setup').showModal();
  requestAnimationFrame(frame);
})();
