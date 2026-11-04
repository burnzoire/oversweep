/* Instrument trainer, exercise 1: the hand-flown ILS. Inputs, the frame
 * loop, the panel, the decision at the DA and the debrief with its replay.
 * The run (start, wind, flight, limits and score) is in
 * lessons/instrument-flight/ils-trainer-model.mjs; the panel and the views
 * are the instrument flight pages' own. Rates here are input tuning only.
 */
import { RUN, advance, autoPower, decide, driftCorrection, goMissed, grade, newRun, windComponents } from './lessons/instrument-flight/ils-trainer-model.mjs';
import { ilsViews } from './lessons/instrument-flight/ils-views.mjs';
import { drawPanel } from './lessons/shared/instruments.mjs';
import { createAxisBindings } from './lessons/shared/axis-bindings.mjs';

if (!window.oversweepFramed) {
  const $ = (id) => document.getElementById(id);
  const STORE = 'oversweep.instrument-trainer.';
  const read = (key, fallback) => { try { const v = localStorage.getItem(STORE + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(STORE + key, JSON.stringify(value)); } catch { /* private window */ } };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const deg3 = (v) => String(Math.round(((v % 360) + 360) % 360) % 360 || 360).padStart(3, '0');
  const PITCH_RATE = 2, BANK_RATE = 15, POWER_RATE = 20, MAX_BANK = 30; // per second, input tuning
  const STEP = 0.02;
  const views = ilsViews({ maxNm: 4.6, far: 4.3, labelNm: [3, 3.7], ticks: [1, 2, 3, 4], daFrom: 0.9, daLabel: `DA ${RUN.tdze + RUN.da} (${RUN.da})` });

  let run, phase = 'brief', paused = false, last = 0, drawn = 0, decisionLeft = 0, graded;
  const keys = new Set();
  const held = new Set();
  const target = { pitch: 0, bank: 0, power: 0 };
  let pad = { active: false, buttons: [] };
  for (const id of ['invert', 'autoPower']) {
    $(id).checked = read(id, false);
    $(id).addEventListener('change', () => write(id, $(id).checked));
  }

  /* ---------- runs ---------- */

  function setup() {
    run = newRun(Date.now());
    Object.assign(target, run.input);
    phase = 'ready'; paused = false; keys.clear(); held.clear();
    $('decision').hidden = true;
    const rwy = String(Math.round(run.course / 10)).padStart(2, '0');
    $('card').textContent = `ILS RWY ${rwy} · FINAL COURSE ${deg3(run.course)} · DA ${RUN.tdze + RUN.da} (${RUN.da}) · LOC MINS ${RUN.tdze + RUN.locMins} (${RUN.locMins}) · TDZE ${RUN.tdze} · ${RUN.speed} KIAS · WIND UNKNOWN`;
    prompt('');
    draw();
  }
  function begin() {
    if (phase !== 'ready') setup();
    phase = 'flying';
    for (const d of ['brief', 'debrief']) if ($(d).open) $(d).close();
    prompt(`Intercept the localizer, course ${deg3(run.course)}.`);
    setTimeout(() => { if (phase === 'flying' && run.t > 3) prompt(''); }, 4000);
  }
  function atDecision() {
    phase = 'decision';
    decisionLeft = RUN.decisionSeconds;
    $('decisionText').textContent = run.visual ? 'DA: approach lights in sight.' : 'DA: no visual references, still in cloud.';
    $('decision').hidden = false;
    prompt('');
  }
  function choose(choice) {
    if (phase === 'flying' && choice === 'missed') goMissed(run);
    else if (phase === 'decision') decide(run, choice);
    else return;
    finish();
  }
  function finish() {
    phase = 'done';
    $('decision').hidden = true;
    graded = grade(run);
    const words = { ok: 'Good approach', marginal: 'Right call, rough flying', failed: 'Wrong call' };
    $('debriefResult').textContent = words[graded.result];
    $('debriefResult').className = 'result ' + graded.result;
    $('debriefItems').replaceChildren(...graded.items.map(([level, text]) => {
      const li = document.createElement('li'); li.className = level; li.textContent = text; return li;
    }));
    const w = windComponents(run), corr = driftCorrection(run);
    const at = graded.at, s0 = run.samples[0];
    const side = (ft) => `${Math.round(Math.abs(ft)).toLocaleString('en-US')} ft ${ft >= 0 ? 'right' : 'left'}`;
    const dots = (v) => `${Math.abs(v).toFixed(1)} ${v > 0.05 ? 'low' : v < -0.05 ? 'high' : ''}`.trim();
    const rows = [
      ['Wind', `${deg3(run.windFrom)}° at ${run.windKt} kt: ${Math.abs(w.cross).toFixed(0)} kt crosswind from the ${w.cross >= 0 ? 'right' : 'left'}, ${Math.abs(w.head).toFixed(0)} kt ${w.head >= 0 ? 'headwind' : 'tailwind'}`],
      ['Heading to hold the course', `${deg3(run.course + corr)}° (${Math.abs(corr).toFixed(0)}° ${corr >= 0 ? 'right' : 'left'} of the course)`],
      ['Start', `${s0.range.toFixed(1)} NM, ${side(s0.right)}, ${dots(s0.gs)} dots on the glide slope`],
      ['Both needles within one dot from', graded.captured === undefined ? 'never' : `${graded.captured.toFixed(0)} s`],
      ['Time within one dot after that', graded.captured === undefined ? '—' : `${Math.round(graded.pct)}%`],
      ['Worst localizer', `${graded.worst.loc.toFixed(1)} dots`],
      ['Worst glide slope', `${graded.worst.low.toFixed(1)} low, ${graded.worst.high.toFixed(1)} high`],
      [run.decision === 'early-missed' ? 'When you went missed' : 'At the DA', `${at.range.toFixed(2)} NM, localizer ${Math.abs(at.loc).toFixed(1)}, glide slope ${dots(at.gs)} dots`],
      ['Airspeed', `${Math.round(run.speedRange[0])}–${Math.round(run.speedRange[1])} kt (target ${RUN.speed})`],
      ['Runway environment at the DA', run.visual ? 'in sight' : 'not in sight'],
      ['Auto power', run.autoUsed ? 'used' : 'not used'],
    ];
    $('debriefStats').replaceChildren(...rows.flatMap(([k, v]) => {
      const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = k; dd.textContent = v; return [dt, dd];
    }));
    const scrub = $('replayTime');
    scrub.max = String(run.samples.length - 1);
    scrub.value = scrub.max;
    replay(+scrub.value);
    setTimeout(() => { if (phase === 'done' && !$('debrief').open) $('debrief').showModal(); }, 600);
  }

  /* ---------- replay ---------- */

  let replayTimer;
  function replay(i) {
    const samples = run.samples, p = samples[clamp(i, 0, samples.length - 1)];
    const svg = $('replayViews');
    svg.setAttribute('viewBox', '0 0 444 452');
    svg.replaceChildren();
    const marks = run.busts.map((b) => ({ ...b, text: '!' }));
    if (graded.captured !== undefined) {
      const c = samples.find((q) => q.t >= graded.captured) ?? p;
      marks.push({ ...c, text: 'capture' });
    }
    views(svg, p, samples.slice(0, i + 1), { marks });
    drawPanel($('replayPanel'), p, { groups: false, ils: { loc: p.loc, gs: p.gs }, course: run.course, dme: p.range });
    $('replayOut').textContent = `${p.t.toFixed(0)} s`;
  }
  function stopReplay() { clearInterval(replayTimer); replayTimer = undefined; $('replayPlay').textContent = 'Play'; }
  $('replayTime').addEventListener('input', (e) => { stopReplay(); replay(+e.target.value); });
  $('replayPlay').addEventListener('click', () => {
    if (replayTimer) return stopReplay();
    const scrub = $('replayTime');
    if (+scrub.value >= +scrub.max) scrub.value = '0';
    $('replayPlay').textContent = 'Stop';
    replayTimer = setInterval(() => {
      const i = Math.min(+scrub.max, +scrub.value + 2);
      scrub.value = String(i);
      replay(i);
      if (i >= +scrub.max) stopReplay();
    }, 50);
  });

  /* ---------- inputs ---------- */

  const KEYMAP = { ArrowUp: 'nose-down', ArrowDown: 'nose-up', ArrowLeft: 'left', ArrowRight: 'right', w: 'power-up', s: 'power-down' };
  const keyName = (e) => e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const action = (name) => {
    if ($('invert').checked && name === 'nose-down') return 'nose-up';
    if ($('invert').checked && name === 'nose-up') return 'nose-down';
    return name;
  };
  addEventListener('keydown', (e) => {
    const k = keyName(e);
    if (document.querySelector('dialog[open]')) {
      if (k === 'Enter' && e.target.tagName !== 'BUTTON') {
        if ($('brief').open) { e.preventDefault(); begin(); }
        else if ($('debrief').open) { e.preventDefault(); setup(); begin(); }
      }
      return;
    }
    if (KEYMAP[k]) { e.preventDefault(); keys.add(action(KEYMAP[k])); return; }
    if (k === 'g') choose('missed');
    else if (k === 'l') choose('land');
    else if (k === ' ' || k === 'p') { e.preventDefault(); togglePause(); }
    else if (k === 'Enter' && phase === 'ready') begin();
  });
  addEventListener('keyup', (e) => { const k = keyName(e); if (KEYMAP[k]) { keys.delete(KEYMAP[k]); keys.delete(action(KEYMAP[k])); } });
  addEventListener('blur', () => { keys.clear(); held.clear(); });

  for (const b of document.querySelectorAll('[data-hold]')) {
    const on = (e) => { e.preventDefault(); held.add(b.dataset.hold); b.classList.add('held'); b.setPointerCapture?.(e.pointerId); };
    const off = () => { held.delete(b.dataset.hold); b.classList.remove('held'); };
    b.addEventListener('pointerdown', on);
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) b.addEventListener(ev, off);
    b.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Bound axes (joystick, HOTAS, game controller): the stick commands roll
  // and pitch rates, so centred holds the attitude; the throttle sets power.
  const axes = createAxisBindings({
    controls: [
      { id: 'pitch', label: 'Stick, fore and aft' },
      { id: 'roll', label: 'Stick, left and right', raw: true },
      { id: 'power', label: 'Throttle' },
    ],
    rows: $('bindRows'), status: $('gamepadStatus'), storeKey: STORE + 'bindings',
  });
  const stick = { pitch: 0, roll: 0, power: undefined };
  const STICK_DZ = 0.06;
  const dz = (v) => Math.abs(v) < STICK_DZ ? 0 : (v - Math.sign(v) * STICK_DZ) / (1 - STICK_DZ);

  // An unbound standard-layout game controller keeps its default mapping;
  // any other device (a HOTAS, say) does nothing until its axes are set.
  function readPad() {
    const gp = [...(navigator.getGamepads?.() ?? [])].find((p) => p && p.mapping === 'standard');
    if (!gp) return null;
    const dz = (v) => Math.abs(v) < 0.12 ? 0 : (v - Math.sign(v) * 0.12) / 0.88;
    const pressed = gp.buttons.map((b) => b.pressed);
    const edge = (i) => pressed[i] && !pad.buttons[i];
    const x = dz(gp.axes[0] ?? 0), y = dz(gp.axes[1] ?? 0);
    if (x || y || pressed.some(Boolean)) pad.active = true;
    const out = { x, y, power: (gp.buttons[7]?.value ?? 0) - (gp.buttons[6]?.value ?? 0), a: edge(0), b: edge(1), start: edge(9) };
    pad.buttons = pressed;
    return out;
  }

  function steer(dt) {
    const on = (name) => keys.has(name) || held.has(name);
    const moved = axes.poll();
    for (const id of ['pitch', 'roll']) if (moved[id] !== undefined) stick[id] = dz(moved[id]);
    if (moved.power !== undefined) stick.power = (1 + moved.power) / 2 * 100;
    const anyBound = ['pitch', 'roll', 'power'].some(axes.bound);
    const g = readPad(); // its buttons always work; its sticks only when nothing is bound
    if (g?.a) { if (phase === 'decision') choose('land'); else if ($('brief').open || $('debrief').open) { setup(); begin(); } }
    if (g?.b) choose('missed');
    if (g?.start) togglePause();
    if (phase !== 'flying' || paused) return;
    target.pitch += ((on('nose-up') ? 1 : 0) - (on('nose-down') ? 1 : 0)) * PITCH_RATE * dt;
    target.bank += ((on('right') ? 1 : 0) - (on('left') ? 1 : 0)) * BANK_RATE * dt;
    target.power += ((on('power-up') ? 1 : 0) - (on('power-down') ? 1 : 0)) * POWER_RATE * dt;
    if (g && pad.active && !anyBound) {
      target.pitch += g.y * PITCH_RATE * 1.5 * dt;
      // The stick commands bank directly: centred, wings level.
      if (!on('left') && !on('right')) target.bank = g.x * MAX_BANK;
      target.power += g.power * POWER_RATE * dt;
    }
    if (axes.bound('pitch')) target.pitch -= stick.pitch * PITCH_RATE * 1.5 * dt; // forward: nose down
    if (axes.bound('roll')) target.bank += stick.roll * BANK_RATE * 1.5 * dt;
    if (axes.bound('power') && moved.power !== undefined) target.power = stick.power;
    target.pitch = clamp(target.pitch, -15, 25);
    target.bank = clamp(target.bank, -MAX_BANK, MAX_BANK);
    target.power = clamp(target.power, 0, 100);
    if ($('autoPower').checked) { target.power = autoPower(run, dt); run.autoUsed = true; }
  }

  function togglePause() {
    if (phase !== 'flying') return;
    paused = !paused;
    $('pause').textContent = paused ? 'Resume' : 'Pause';
    prompt(paused ? 'Paused. Space or P to resume.' : '');
  }

  /* ---------- the loop ---------- */

  function prompt(text) { $('prompt').textContent = text; }
  function draw() {
    if (!run) return;
    drawPanel($('panel'), run.s, { groups: false, ils: run.needles, course: run.course, dme: run.pos.range });
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    steer(dt);
    if (phase === 'flying' && !paused) {
      for (let t = 0; t < dt - 1e-9; t += STEP) advance(run, target, Math.min(STEP, dt - t));
      if (run.phase === 'decision') atDecision();
      else if (run.phase === 'done') finish();
    } else if (phase === 'decision') {
      decisionLeft -= dt;
      if (decisionLeft <= 0) { decide(run, 'late'); finish(); }
    }
    if (now - drawn > 33 && run) { drawn = now; draw(); }
  }

  $('start').addEventListener('click', begin);
  $('again').addEventListener('click', () => { setup(); begin(); });
  $('newRun').addEventListener('click', () => { stopReplay(); setup(); if (!$('brief').open) $('brief').showModal(); });
  $('pause').addEventListener('click', togglePause);
  $('land').addEventListener('click', () => choose('land'));
  $('missed').addEventListener('click', () => choose('missed'));
  $('goAround').addEventListener('click', () => choose('missed'));
  $('controlsHelp').addEventListener('click', () => $('controls').showModal());
  $('gamepadSetup').addEventListener('click', () => { if (phase === 'flying' && !paused) togglePause(); axes.render(); $('gamepad').showModal(); });
  $('closeGamepad').addEventListener('click', () => { axes.cancel(); $('gamepad').close(); });
  $('clearBindings').addEventListener('click', () => axes.clear());
  $('showControls').addEventListener('click', () => $('controls').showModal());
  $('closeControls').addEventListener('click', () => $('controls').close());
  $('debrief').addEventListener('close', stopReplay);
  addEventListener('resize', draw);

  setup();
  $('brief').showModal();
  requestAnimationFrame(frame);
}
