/**
 * F-16C after engine start and before taxi on the shared cockpit panels.
 *
 * The panels move their own controls and report each move as `cockpit:change`;
 * this script owns the procedure. The engine is already running at idle. It
 * reads the lamps (a lit lamp for each test the reader runs), the engine
 * instruments through the SEC check, the Stored Heading INS alignment that
 * runs on its own clock (DED INS page, HUD ALIGN cue), the FLCS BIT, the MFD
 * DTE page and the altimeter, and sends them back with `cockpit:indicate`.
 * Steps that only read an indication end with a confirm.
 *
 * The Before Takeoff procedure runs on the same model (`model: 'before-takeoff'`),
 * starting where Before Taxi ends: INS in NAV, altimeter set, trim centred.
 */

interface StepDo { control: string; to: string; on?: 'press' | 'release'; hold?: number }
interface Step { id: string; panels: string[]; do?: StepDo; also?: StepDo[]; confirm?: string; turn?: { control: string; to: number; per: number } }
interface Config { aircraft: string; model?: string; initial: Record<string, string>; labels: Record<string, string>; names: Record<string, string>; orders: Record<string, string[]>; lamps: string[]; steps: Step[] }
/** `ins`: the alignment stage (-1 not started, 0–4 up the INS DED pages); `flash`: the fine-alignment flash is in its off half; `bit`: the FLCS BIT is running; `dte`: the left MFD shows the DTE page; `pitch`/`roll`: the trim applied, in indicator dots (nose up, left wing down positive). */
interface State { /** Speedbrakes open at any angle (they stay where SPD BRK left them). */ sb: boolean; rpm: number; noz: number; ins: number; flash: boolean; baro: number; mode: 'pneu' | 'elec'; bit: boolean; dte: boolean; pitch: number; roll: number }

// Illustrative scenario: parked at Incirlik (field elevation 191 ft, from the airfield data), local altimeter setting 29.97.
const FIELD = 191, QNH = 29.97, PNEU_ERROR = 25;
const taxiStart = (): State => ({ sb: false, rpm: 68, noz: 98, ins: -1, flash: false, baro: 29.92, mode: 'pneu', bit: false, dte: false, pitch: 0, roll: 0 });
/** Before Takeoff starts aligned and in NAV, with the altimeter in ELEC at the local setting. */
const takeoffStart = (): State => ({ ...taxiStart(), ins: 4, baro: QNH, mode: 'elec', dte: true });
// The FLCS BIT runs about 45 s in the jet; compressed here.
const BIT_MS = 4000;
// The INS alignment is compressed: the guide gives about 90 s for a Stored Heading alignment.
const INS_STAGE_MS = [0, 4000, 8000, 12000, 17000];

export function startBeforeTaxiModel(root: HTMLElement, cfg: Config) {
  const all = <T extends Element>(sel: string) => [...root.querySelectorAll<T>(sel)];
  const one = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const stepEls = all<HTMLElement>('[data-step]');
  const previous = one<HTMLButtonElement>('[data-prev]');
  const confirm = one<HTMLButtonElement>('[data-confirm]');
  const restart = one<HTMLButtonElement>('[data-restart]');
  const progress = one<HTMLElement>('[data-progress]');
  const feedback = one<HTMLElement>('[data-feedback]');
  const visual = one<HTMLElement>('[data-visual]');
  const complete = one<HTMLElement>('[data-complete]');
  const panels = all<HTMLElement>('[data-proc-panel]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  try { sessionStorage.removeItem(`oversweep:cockpit:${cfg.aircraft}`); } catch { /* storage unavailable */ }
  let pos: Record<string, string> = { ...cfg.initial };
  const initialState = cfg.model === 'before-takeoff' ? takeoffStart : taxiStart;
  let st = initialState();
  let step = 0;
  let finished = false;
  let made = new Set<string>(); // this step's moves already made
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let holding = false;
  const history: { pos: Record<string, string>; st: State }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  const insTimers: ReturnType<typeof setTimeout>[] = [];
  let flashTimer: ReturnType<typeof setInterval> | undefined;

  const later = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, reduced.matches ? Math.min(ms, 50) : ms)); };
  const clearTimers = () => { timers.splice(0).forEach(clearTimeout); clearTimeout(holdTimer); holding = false; };
  const setPositions = (p: Record<string, string>) => dispatchEvent(new CustomEvent('cockpit:set', { detail: { positions: p } }));
  const say = (t: string, retry = false) => { feedback.textContent = t; feedback.classList.toggle('retry', retry); };
  const name = (control: string) => cfg.names[control] ?? control;
  const label = (control: string, to: string) => cfg.labels[`${control}.${to}`] ?? `${name(control)} to ${to}`;
  const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
  const instruction = (w: StepDo) => w.on === 'release' ? `release the ${name(w.control)}` : w.hold ? `hold the ${label(w.control, w.to).replace(' to ', ' at ')}` : (cfg.orders[w.control] ?? []).join() === 'out,in' ? `press ${name(w.control)}` : `set the ${label(w.control, w.to)}`;
  const stepId = () => cfg.steps[step]?.id ?? '';
  const moves = (s: Step) => [...(s.do ? [s.do] : []), ...(s.also ?? [])];
  const mk = (w: StepDo) => `${w.control}=${w.to}:${w.on ?? 'press'}`;
  const pending = (s: Step) => moves(s).filter(w => !made.has(mk(w)));

  /** The alignment stage the INS DED page shows, and its flashing from the fully aligned stage. */
  function runIns(from: number) {
    insTimers.splice(0).forEach(clearTimeout);
    clearInterval(flashTimer);
    st.ins = from;
    for (let k = from + 1; k < INS_STAGE_MS.length; k++) {
      insTimers.push(setTimeout(() => { st.ins = k; if (k === 4) startFlash(); indicate(); }, reduced.matches ? 50 * (k - from) : INS_STAGE_MS[k] - INS_STAGE_MS[from]));
    }
    if (from === 4) startFlash();
  }
  function startFlash() {
    clearInterval(flashTimer);
    st.flash = false;
    if (!reduced.matches) flashTimer = setInterval(() => { st.flash = !st.flash; indicate(); }, 500);
  }
  const aligning = () => st.ins >= 0 && (pos['avionics-power.ins'] === 'stor-hdg' || pos['avionics-power.ins'] === 'norm');

  /** Where the engine instruments are heading, from the SEC switch and the throttle. */
  function target() {
    const sec = pos['eng-jet-start.eng-cont'] === 'sec', thr = pos['sidewall-controls.throttle'], mil = thr === 'mil';
    return { rpm: mil ? 92 : sec ? 64 : thr === 'idle-10' ? 78 : 68, noz: sec ? 8 : mil ? 12 : 98 };
  }
  const settle = setInterval(() => {
    const t = target(), k = reduced.matches ? 1 : 0.12;
    if (Math.abs(t.rpm - st.rpm) < 0.2 && Math.abs(t.noz - st.noz) < 0.5) return;
    st.rpm += (t.rpm - st.rpm) * k; st.noz += (t.noz - st.noz) * k;
    indicate();
  }, 100);
  addEventListener('pagehide', () => { clearInterval(settle); clearInterval(flashTimer); });

  function indicate() {
    const on = (p: string) => pos[p] === 'in';
    const lit = new Set<string>();
    const set = (id: string, v: boolean) => { if (v) lit.add(id); };
    if (on('test.mal-ind-lts')) cfg.lamps.forEach(l => lit.add(l));
    set('caution.seat-not-armed', pos['seat-arming-lever.arming-lever'] !== 'armed');
    set('caution.probe-heat', pos['test.probe-heat'] === 'test');
    set('right-eyebrow.eng-fire', on('test.fire-oheat'));
    set('caution.sec', pos['eng-jet-start.eng-cont'] === 'sec');
    for (const l of ['nose', 'left', 'right']) set(`landing-gear.wheels-${l}`, true);
    const epuTest = pos['test.epu-gen'] === 'test';
    set('epu.air', epuTest); set('epu.epu-run', epuTest);
    for (const c of ['a', 'b', 'c', 'd']) set(`test.flcs-pwr-${c}`, epuTest);
    set('flt-control.flcs-run', st.bit);
    set('right-eyebrow.dbu-on', pos['flt-control.digital-backup'] === 'backup');
    set('ar-nws-indicator.rdy', pos['fuel.air-refuel'] === 'open');
    const qtyTest = pos['fuel-qty-sel.fuel-qty-sel'] === 'test';
    set('caution.fwd-fuel-low', qtyTest); set('caution.aft-fuel-low', qtyTest);
    // AL and FR pointers by FUEL QTY SEL position (no external tanks on this jet).
    const qty = ({ test: [2000, 2000], rsvr: [480, 480], 'int-wing': [550, 550], 'ext-wing': [0, 0], 'ext-ctr': [0, 0] } as Record<string, number[]>)[pos['fuel-qty-sel.fuel-qty-sel']] ?? [2810, 3250];
    const mfd = pos['avionics-power.mfd'] !== 'on' ? 'off' : st.dte ? 'dte' : 'menu';
    // The HUD: on once the SYM knob is up. ALIGN takes the maximum G readout's place while the INS is aligning.
    const hudOn = pos['icp.sym'] !== 'off';
    const alignCue = aligning() && st.ins >= 2 && !(st.ins === 4 && st.flash);
    const alt = Math.round(FIELD + (st.baro - QNH) * 1000 + (st.mode === 'pneu' ? PNEU_ERROR : 0));
    const dedOn = pos['avionics-power.ufc'] === 'on';
    const stage = ['ins-0', 'ins-1', 'ins-2', 'ins-3', st.flash ? 'ins-4-off' : 'ins-4'][Math.max(0, st.ins)];
    const ded = !dedOn ? 'off' : aligning() ? stage : pos['avionics-power.ins'] === 'nav' && st.ins >= 0 ? 'ins-nav' : 'cni';
    dispatchEvent(new CustomEvent('cockpit:indicate', { detail: {
      lit: [...lit],
      // PROBE HEAT at TEST flashes the caution 3–5 times a second (MAL & IND LTS lights it steady).
      flash: pos['test.probe-heat'] === 'test' && !on('test.mal-ind-lts') ? ['caution.probe-heat'] : [],
      readings: {
        'engine-instruments.rpm': st.rpm, 'engine-instruments.ftit': 570, 'engine-instruments.oil': 30, 'engine-instruments.noz-pos': st.noz,
        'fuel-flow.fuel-flow': 1100, 'hyd-pressure.hyd-a': 3000, 'hyd-pressure.hyd-b': 3000,
        'fuel-qty.al': qty[0], 'fuel-qty.fr': qty[1], 'fuel-qty.total': qtyTest ? 6000 : 6060,
        'altimeter.altitude': alt, 'altimeter.baro': +st.baro.toFixed(2),
        'hud.velocity': 0, 'hud.altitude': alt, 'hud.heading': 232, 'hud.g': 1, 'hud.mach': 0, 'hud.pitch': 0, 'hud.roll': 0,
        'hud.fpm-azimuth': 0, 'hud.fpm-elevation': 0, 'hud.radar-alt': 0, 'hud.max-g': aligning() && st.ins >= 2 ? NaN : 1,
        'hud.steerpoint': 1, 'hud.steerpoint-distance': 24, 'hud.slant-range': 24, 'hud.ttg': 0, 'hud.steering-cue': 0, 'hud.steering': 0,
        'hud.steerpoint-azimuth': 0, 'hud.steerpoint-elevation': -3,
        'manual-trim.pitch-trim-ind': st.pitch, 'manual-trim.roll-trim-ind': st.roll,
        'ehsi.heading': 232, 'ehsi.heading-set': 232, 'ehsi.course': 232, 'ehsi.course-set': 232, 'ehsi.bearing': 232, 'ehsi.range': 24, 'ehsi.deviation': 0,
      },
      pages: { 'landing-gear.speed-brake': st.sb ? 'open' : 'closed', 'left-mfd.display': mfd, 'right-mfd.display': mfd === 'off' ? 'off' : 'menu', 'sai.off-flag': pos['sai.cage'] === 'pulled' ? 'shown' : 'hidden', 'hud.master-arm': 'none', 'ded.display': ded, 'hud.screen': hudOn ? 'on' : 'off', 'hud.align': alignCue ? 'align' : 'none', 'altimeter.pneu': st.mode === 'pneu' ? 'shown' : 'hidden',
        // The EHSI comes on with the avionics and shows INU until the aligned INS is in NAV (ATT at the ATT knob position).
        // Backup UHF: lit once the function knob is off OFF; TEST DISPLAY lights every segment.
        'uhf.chan-display': pos['uhf.function'] === 'off' || pos['uhf.mode'] !== 'preset' ? 'off' : pos['uhf.test-display'] === 'in' ? 'test' : String(pos['uhf.chan'] ?? '1').padStart(2, '0'),
        'uhf.freq-display': pos['uhf.function'] === 'off' ? 'off' : pos['uhf.test-display'] === 'in' ? 'test' : '330.500',
        'ehsi.screen': pos['avionics-power.mmc'] === 'on' ? 'on' : 'off', 'ehsi.warning': pos['avionics-power.ins'] === 'att' ? 'att' : pos['avionics-power.ins'] === 'nav' && st.ins === 4 ? 'none' : 'inu' },
    } }));
    // HUD brightness follows the SYM wheel: the symbology fades from 1 (dimmest) to 5 (brightest).
    const sym = Number(pos['icp.sym']);
    for (const g of all<SVGGElement>('[data-proc-panel="hud"] [data-page-of="screen"][data-page="on"]')) g.style.opacity = String(Number.isFinite(sym) ? 0.15 + 0.85 * (sym - 1) / 4 : 1);
    const id = stepId();
    const wait = id === 'sec-check' ? st.noz > 10 : id === 'pri-check' ? st.noz < 94 : id === 'ins-ready' ? st.ins < 4 : false;
    if (!confirm.hidden && confirm.disabled !== wait) {
      confirm.disabled = wait;
      if (id === 'ins-ready') say(wait ? 'Alignment running (compressed to about 20 seconds). Wait for RDY to flash.' : 'RDY on the INS page and ALIGN on the HUD are flashing. Confirm.');
      else if (id === 'sec-check') say(wait ? 'Wait for the nozzle to close.' : 'Check the indications, then confirm.');
      else if (id === 'pri-check') say(wait ? 'Wait for the nozzle to open.' : 'Check the indications, then confirm.');
    }
  }

  function render() {
    const s = cfg.steps[step];
    stepEls.forEach((el, i) => { el.hidden = finished || i !== step; });
    complete.hidden = !finished;
    visual.hidden = finished;
    root.classList.toggle('procedure-finished', finished);
    progress.hidden = finished;
    progress.textContent = `Step ${step + 1} of ${cfg.steps.length}`;
    previous.disabled = step === 0 && !finished;
    one<HTMLElement>('[data-controls]').hidden = false;
    confirm.hidden = finished || !s.confirm || moves(s).length > 0;
    restart.hidden = !finished;
    confirm.textContent = s.confirm ?? 'Confirm';
    confirm.disabled = false;
    const shown = new Set(s.panels);
    for (const p of panels) {
      p.hidden = !shown.has(p.dataset.procPanel!);
      p.classList.toggle('acting', p.dataset.procPanel === s.panels[0]);
      p.style.order = String(s.panels.indexOf(p.dataset.procPanel!));
    }
    if (finished) say('');
    else if (s.turn) say(`Turn the ${name(s.turn.control)} until the setting reads ${s.turn.to.toFixed(2)}.`);
    else if (s.id === 'spd-brk' || moves(s).length === 1) say(`${cap(instruction(moves(s)[0]))}.`);
    else if (moves(s).length) say(`Make these moves, in any order: ${moves(s).map(instruction).join('; ')}.`);
    else say('Check the indications, then confirm.');
    showPad();
    indicate();
  }
  /** Open the switch card a step's next move needs, with the wanted position marked. */
  function showPad() {
    const w = finished ? undefined : pending(cfg.steps[step])[0];
    dispatchEvent(new CustomEvent('cockpit:pad', { detail: { control: w?.control, to: w?.to } }));
  }

  /** Every move is made. A step that shows indications to check waits for the reader; the others move on. */
  function done(text = 'Done.') {
    const s = cfg.steps[step];
    if (!s.confirm) { say(text); next(); return; }
    confirm.textContent = s.confirm;
    confirm.disabled = false;
    confirm.hidden = false;
    say(`${text} Check the indications, then continue.`);
  }
  function next(delay = 800) {
    const at = step;
    later(matchMedia('(max-width: 48rem)').matches ? delay + 600 : delay, () => {
      if (step !== at || finished) return;
      const moveFocus = root.contains(document.activeElement) && !visual.contains(document.activeElement);
      go(step + 1);
      if (moveFocus) stepEls[step]?.querySelector('h2')?.focus({ preventScroll: true });
    });
  }
  function go(to: number) {
    clearTimers();
    if (to >= cfg.steps.length) { finished = true; render(); complete.focus(); return; }
    history[to] = { pos: { ...pos }, st: { ...st } };
    step = to; made = new Set();
    render();
  }

  /** One of the step's moves has been made; the step is done when every move is. */
  function acted(w: StepDo) {
    made.add(mk(w));
    if (pos['avionics-power.ins'] === 'stor-hdg' && st.ins < 0) { runIns(0); say('Stored Heading alignment started. In this model it runs in about 20 seconds; the page shows its stages.'); }
    indicate();
    const left = pending(cfg.steps[step]);
    if (left.length) { say(`Done. Still to do: ${left.map(instruction).join('; ')}.`); showPad(); return; }
    done();
  }

  addEventListener('cockpit:change', e => {
    const d = (e as CustomEvent<{ aircraft: string; panel: string; control: string; position: string; phase: 'press' | 'release' }>).detail;
    if (d.aircraft !== cfg.aircraft || finished) return;
    const key = `${d.panel}.${d.control}`;
    const before = pos[key];
    pos[key] = d.position;
    const s = cfg.steps[step];
    // Stick trim moves the trim one dot a press, unless TRIM/AP DISC is at DISC. Only a press the step
    // wants counts, so stray presses never leave the pointers off centre; trimming back to centre takes
    // as many presses as it needs and ends when both pointers are centred.
    const trimKey = key === 'stick.trim-ud' || key === 'stick.trim-lr';
    if (trimKey && d.phase === 'press' && d.position !== 'center') {
      const centring = stepId() === 'trim-centre';
      // At DISC the trim does nothing; outside the DISC check that press does not count as trimming.
      if (pos['manual-trim.trim-ap-disc'] === 'disc' && stepId() !== 'trim-disc') {
        pos[key] = before; setPositions({ [key]: before });
        say('TRIM/AP DISC is at DISC, so the trim does nothing. Set it to NORM first.', true);
        return;
      }
      const wanted = centring || pending(cfg.steps[step]).some(w => w.control === key && w.to === d.position);
      if (wanted && pos['manual-trim.trim-ap-disc'] !== 'disc') {
        const clamp = (v: number) => Math.max(-3, Math.min(3, v));
        if (key === 'stick.trim-ud') st.pitch = clamp(st.pitch + (d.position === 'aft' ? 1 : -1));
        else st.roll = clamp(st.roll + (d.position === 'left' ? 1 : -1));
      }
      if (centring) {
        indicate();
        if (st.pitch === 0 && st.roll === 0) { for (const w of pending(cfg.steps[step])) made.add(mk(w)); done('Both trim pointers are centred.'); }
        else say(`Keep trimming: ${[st.pitch ? `pitch ${Math.abs(st.pitch)} dot${Math.abs(st.pitch) > 1 ? 's' : ''} ${st.pitch > 0 ? 'nose up' : 'nose down'}` : '', st.roll ? `roll ${Math.abs(st.roll)} dot${Math.abs(st.roll) > 1 ? 's' : ''} ${st.roll > 0 ? 'left wing down' : 'right wing down'}` : ''].filter(Boolean).join(', ')} to go.`);
        return;
      }
    }
    // The altimeter mode lever sets the mode while it is held (a step that wants it completes below).
    if (key === 'altimeter.mode' && d.phase === 'press' && (d.position === 'elec' || d.position === 'pneu')) st.mode = d.position;
    // The speedbrake check extends first, then retracts.
    const remaining = pending(s);
    const allowed = s.id === 'spd-brk' ? remaining.slice(0, 1) : remaining;
    const want = allowed.find(w => w.control === key && w.to === d.position && (w.on ?? 'press') === d.phase);
    if (want?.hold) {
      holding = true;
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => { holding = false; acted(want); }, reduced.matches ? 0 : want.hold);
      say('Keep holding…');
      indicate();
      return;
    }
    const held = moves(s).find(w => w.hold && w.control === key);
    if (holding && held && d.phase === 'release') {
      clearTimeout(holdTimer); holding = false;
      say(`Try again: ${instruction(held)} a little longer.`, true);
      indicate();
      return;
    }
    // Throttle back from MIL only once RPM has reached 85% (the throttle may pass the idle + 10% stop on the way to IDLE).
    if (stepId() === 'snap-idle' && key === 'sidewall-controls.throttle' && before === 'mil' && d.phase === 'press' && st.rpm < 85) {
      pos[key] = before; setPositions({ [key]: before });
      say('Wait: RPM has not reached 85% yet.', true);
      indicate();
      return;
    }
    if (want) {
      // Only an accepted SPD BRK move can change the indication.
      if (key === 'throttle.spd-brk') st.sb = want.to === 'aft';
      if (key === 'left-mfd.osb-8') st.dte = true;
      // The FLCS BIT: RUN lights while it runs; the switch drops back to OFF by itself when it is done.
      if (key === 'flt-control.flcs-bit') {
        st.bit = true; made.add(mk(want)); say('BIT running (compressed to a few seconds here). Watch the RUN light.'); indicate();
        later(BIT_MS, () => { st.bit = false; pos[key] = 'off'; setPositions({ [key]: 'off' }); indicate(); done('BIT complete: the switch is back at OFF, RUN is out and FAIL stayed off.'); });
        return;
      }
      acted(want); return;
    }
    // A hold finished and released on the next step's own move.
    if (d.phase === 'release') { indicate(); return; }
    // The altimeter setting knob: each click changes the setting by 0.01 inches either way.
    if (s.turn && s.turn.control === key && !made.size) {
      const order = cfg.orders[key], n = order.length;
      const delta = ((order.indexOf(d.position) - order.indexOf(before) + n + n / 2) % n) - n / 2;
      st.baro = Math.round((st.baro + delta * s.turn.per) * 100) / 100;
      indicate();
      if (Math.abs(st.baro - s.turn.to) < 0.001) { say('Set: the altimeter reads the field elevation.'); made.add('turn'); next(); }
      else say(`Setting ${st.baro.toFixed(2)}. Keep turning to ${s.turn.to.toFixed(2)}.`);
      return;
    }
    if (key === 'altimeter.mode') { indicate(); return; }
    // A rotary on its way to its position (the INS knob passes NORM on the way to NAV).
    const order = cfg.orders[key] ?? [], target = allowed.find(w => w.control === key);
    const gap = (p: string) => Math.abs(order.indexOf(p) - order.indexOf(target?.to ?? ''));
    if (target && gap(d.position) < gap(before)) { say(`Keep going: ${instruction(target)}.`); indicate(); return; }
    // A control that is not part of this step: put it back.
    pos[key] = before;
    setPositions({ [key]: before });
    say(target ? `Try again: ${instruction(target)}.` : 'Not needed for this step.', true);
    indicate();
  });

  confirm.addEventListener('click', () => { if (!confirm.disabled && !confirm.hidden) go(step + 1); });
  previous.addEventListener('click', () => {
    clearTimers();
    const to = finished ? cfg.steps.length - 1 : Math.max(0, step - 1);
    finished = false;
    const h = history[to];
    if (h) { pos = { ...h.pos }; st = { ...h.st, flash: false }; setPositions(pos); if (st.ins >= 0 && st.ins < 4) runIns(st.ins); else if (st.ins === 4) startFlash(); else runInsStop(); }
    step = to; made = new Set();
    render();
  });
  const runInsStop = () => { insTimers.splice(0).forEach(clearTimeout); clearInterval(flashTimer); };
  restart.addEventListener('click', () => {
    clearTimers(); runInsStop();
    pos = { ...cfg.initial }; st = initialState(); history.length = 0; finished = false;
    setPositions(pos);
    go(0);
    stepEls[0]?.querySelector('h2')?.focus();
  });

  setPositions(pos);
  go(0);
}
