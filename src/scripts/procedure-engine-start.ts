/**
 * F-16C engine start on the shared cockpit panels.
 *
 * The panels (CockpitPanel) move their own controls and report each move as a
 * `cockpit:change` event. This script owns the procedure: which step is
 * current, which panels it shows, whether a move completes the step, and a
 * small illustrative engine model that decides which lamps light and where
 * RPM and FTIT read (sent back with `cockpit:indicate`). Wrong moves are put
 * back with `cockpit:set`.
 */

interface StepDo { control: string; to: string; on?: 'press' | 'release'; hold?: number }
interface Step { id: string; panels: string[]; do?: StepDo; confirm?: string }
interface Config { aircraft: string; initial: Record<string, string>; labels: Record<string, string>; names: Record<string, string>; orders: Record<string, string[]>; steps: Step[] }
interface Engine { rpm: number; ftit: number; jfsStarted: boolean; jfsRun: boolean; secCleared: boolean; pressure: boolean; mainGen: boolean; caution: boolean; idle: boolean }

const cold = (): Engine => ({ rpm: 0, ftit: 0, jfsStarted: false, jfsRun: false, secCleared: false, pressure: false, mainGen: false, caution: false, idle: false });

export function startEngineModel(root: HTMLElement, cfg: Config) {
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

  // Start cold: the scope's stored positions are replaced by the start state.
  try { sessionStorage.removeItem(`oversweep:cockpit:${cfg.aircraft}`); } catch { /* storage unavailable */ }
  let pos: Record<string, string> = { ...cfg.initial };
  let eng = cold();
  let step = 0;
  let finished = false;
  let done = false; // current step's action has been made
  const history: { pos: Record<string, string>; eng: Engine }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let frame = 0;
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let holding = false;

  const later = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, reduced.matches ? Math.min(ms, 50) : ms)); };
  // Step timers stop on every step change; the engine keeps spooling across steps until stepped back.
  const clearTimers = () => { timers.splice(0).forEach(clearTimeout); clearTimeout(holdTimer); holding = false; };
  const stopEngine = () => cancelAnimationFrame(frame);
  const setPositions = (p: Record<string, string>) => dispatchEvent(new CustomEvent('cockpit:set', { detail: { positions: p } }));
  const say = (t: string, retry = false) => { feedback.textContent = t; feedback.classList.toggle('retry', retry); };
  const label = (control: string, to: string) => cfg.labels[`${control}.${to}`] ?? `${cfg.names[control] ?? control} to ${to}`;
  const name = (control: string) => cfg.names[control] ?? control;
  /** The instruction for a step's action. */
  const instruction = (w: StepDo) => w.on === 'release' ? `release the ${name(w.control)}` : w.hold ? `hold the ${label(w.control, w.to).replace(' to ', ' at ')}` : `set the ${label(w.control, w.to)}`;
  const cap = (t: string) => t[0].toUpperCase() + t.slice(1);

  /** Lamps and readings from the control positions and the engine model. */
  function indicate() {
    const main = pos['elec.main-pwr'];
    const powered = main === 'batt' || main === 'main-pwr';
    const onMain = main === 'main-pwr';
    const flcsTest = pos['test.flcs-pwr-test'] === 'test';
    // On a battery start only RPM and FTIT work until the standby generator comes on at about 60% RPM
    // (guide p. 135, step 3 note). Then the other instruments settle towards illustrative idle readings
    // inside the guide's limits: fuel flow 700–1,700 PPH, oil ≥15 psi, nozzle >94%, hydraulics 2,850–3,250 psi.
    const standby = eng.rpm >= 60;
    const k = standby ? Math.min(1, (eng.rpm - 60) / 10) : 0;
    const fuelFlow = standby ? Math.round((1600 - 500 * k) / 100) * 100 : 0;
    const oil = standby ? 10 + 20 * k : 0;
    const noz = standby ? 80 + 18 * k : 0;
    const hyd = standby ? 2000 + 1000 * k : 0;
    const lit = new Set<string>();
    const on = (id: string, v: boolean) => { if (v) lit.add(id); };
    on('elec.flcs-rly', powered && !flcsTest && !eng.jfsStarted);
    on('elec.flcs-pmg', powered && (flcsTest || eng.jfsStarted));
    on('elec.to-flcs', powered && (flcsTest || eng.jfsStarted));
    for (const ch of ['a', 'b', 'c', 'd']) on(`test.flcs-pwr-${ch}`, powered && flcsTest);
    on('right-eyebrow.engine', onMain && eng.rpm < 60);
    on('right-eyebrow.hyd-oil-press', onMain && !eng.pressure);
    on('right-eyebrow.canopy', onMain && pos['sidewall-controls.canopy-handle'] !== 'locked');
    on('left-eyebrow.master-caution', onMain && eng.caution);
    on('caution.sec', onMain && !eng.secCleared);
    on('caution.elec-sys', onMain && !eng.mainGen);
    on('caution.seat-not-armed', pos['sidewall-controls.throttle'] === 'idle' && eng.rpm >= 60);
    on('eng-jet-start.jfs-run', eng.jfsRun && eng.rpm < 55);
    dispatchEvent(new CustomEvent('cockpit:indicate', { detail: { lit: [...lit], readings: {
      'engine-instruments.rpm': eng.rpm, 'engine-instruments.ftit': eng.ftit, 'engine-instruments.oil': oil, 'engine-instruments.noz-pos': noz,
      'fuel-flow.fuel-flow': fuelFlow, 'hyd-pressure.hyd-a': hyd, 'hyd-pressure.hyd-b': hyd,
    } } }));
    const id = stepId();
    const wait = id === 'sec' ? eng.rpm < 20 || !eng.secCleared : id === 'generator' ? eng.rpm < 60 : id.startsWith('idle-') ? !eng.idle : false;
    if (!confirm.hidden && confirm.disabled !== wait) {
      confirm.disabled = wait;
      if (id === 'generator') say(wait ? 'Watch RPM rise; ENGINE goes out at about 60%.' : 'Check the indications, then confirm.');
      else if (id.startsWith('idle-')) say(wait ? 'Wait for RPM to settle at idle.' : 'Check the indication, then confirm.');
    }
  }

  /** Spool RPM and FTIT to a target over `ms`, then call `then`. */
  function spool(rpm: number, ftit: number, ms: number, then?: () => void, during?: (k: number) => void) {
    cancelAnimationFrame(frame);
    const r0 = eng.rpm, t0 = eng.ftit, start = performance.now(), dur = reduced.matches ? 1 : ms;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur), e = k * k * (3 - 2 * k);
      eng.rpm = r0 + (rpm - r0) * e; eng.ftit = t0 + (ftit - t0) * e;
      during?.(k);
      indicate();
      if (k < 1) frame = requestAnimationFrame(tick); else then?.();
    };
    frame = requestAnimationFrame(tick);
  }

  /**
   * Fuel in: the engine accelerates to idle across the following steps. Once lit (about 25%) the procedure
   * moves on; ENGINE goes out and SEAT NOT ARMED comes on at about 60%, the main generator follows, and at
   * idle the JFS drops out. Resumes from the current RPM after stepping back.
   */
  function runUp() {
    const from = eng.rpm;
    spool(70, 620, Math.max(1, 30000 * (70 - from) / 50), () => {
      pos['eng-jet-start.jfs'] = 'off'; setPositions({ 'eng-jet-start.jfs': 'off' });
      eng.idle = true;
      indicate();
    }, () => {
      if (eng.rpm >= 25 && stepId() === 'throttle' && done && !timers.length) next(0);
      if (eng.rpm >= 60 && from < 60) eng.caution = true;
      if (eng.rpm >= 66) eng.mainGen = true;
      if (eng.rpm >= 68) eng.pressure = true;
    });
  }

  const stepId = () => cfg.steps[step]?.id ?? '';

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
    confirm.hidden = finished || !s.confirm;
    restart.hidden = !finished;
    confirm.textContent = s.confirm ?? 'Confirm';
    confirm.disabled = false;
    const shown = new Set(s.panels);
    for (const p of panels) {
      p.hidden = !shown.has(p.dataset.procPanel!);
      p.classList.toggle('acting', p.dataset.procPanel === s.panels[0]);
      // Keep the step's panels in its order.
      p.style.order = String(s.panels.indexOf(p.dataset.procPanel!));
    }
    if (finished) say('');
    else if (s.do) say(`${cap(instruction(s.do))}.`);
    else say(s.panels.length ? 'Check the indications, then confirm.' : 'Confirm when the area is clear.');
    // Panels with pop-out pads (HOTAS) open the pad for the step's control, the wanted position ringed.
    dispatchEvent(new CustomEvent('cockpit:pad', { detail: { control: finished ? '' : s.do?.control ?? '', to: s.do?.to } }));
    indicate();
  }

  function next(delay = 900) {
    const at = step;
    later(window.matchMedia('(max-width: 48rem)').matches ? delay + 600 : delay, () => {
      if (step !== at || finished) return;
      // Move focus to the new step only from the step text; a control being held keeps it (blur would release it).
      const moveFocus = root.contains(document.activeElement) && !visual.contains(document.activeElement);
      go(step + 1);
      if (moveFocus) stepEls[step]?.querySelector('h2')?.focus({ preventScroll: true });
    });
  }
  function go(to: number) {
    clearTimers();
    if (to >= cfg.steps.length) { finished = true; render(); complete.focus(); return; }
    history[to] = { pos: { ...pos }, eng: { ...eng } };
    step = to; done = false;
    render();
  }

  /** What happens after the step's action is made. */
  function acted() {
    done = true;
    const id = stepId();
    if (id === 'jfs') {
      eng.jfsStarted = true; eng.jfsRun = false; eng.secCleared = false;
      indicate();
      say('Wait for the green RUN light; it should come on within 30 seconds.');
      // Illustrative delay within the documented 30-second RUN limit.
      later(12000, () => {
        eng.jfsRun = true;
        say('RUN light on. Engine RPM rising.');
        spool(20, 0, 8000, () => next(), k => { if (k >= 0.75) eng.secCleared = true; });
      });
      return;
    }
    if (id === 'throttle') {
      say('Fuel in. Combustion within a few seconds; RPM and FTIT rise.');
      runUp();
      return;
    }
    if (id === 'master-caution') { eng.caution = false; indicate(); later(1000, () => go(cfg.steps.length)); return; }
    indicate();
    next();
  }

  addEventListener('cockpit:change', e => {
    const d = (e as CustomEvent<{ aircraft: string; panel: string; control: string; position: string; phase: 'press' | 'release' }>).detail;
    if (d.aircraft !== cfg.aircraft || finished) return;
    const key = `${d.panel}.${d.control}`;
    const before = pos[key];
    pos[key] = d.position;
    const s = cfg.steps[step], want = s.do;
    const matches = want && !done && want.control === key && want.to === d.position && (want.on ?? 'press') === d.phase;
    if (matches && want.hold) {
      // Must be held: completes after `hold` ms unless released first.
      holding = true;
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => { holding = false; acted(); }, reduced.matches ? 0 : want.hold);
      say('Keep holding…');
      indicate();
      return;
    }
    if (holding && want?.control === key && d.phase === 'release') {
      clearTimeout(holdTimer); holding = false;
      say(`Try again: ${instruction(want)} a little longer.`, true);
      indicate();
      return;
    }
    if (matches) { acted(); return; }
    // Released before the next step showed (hold, then release): that completes the next step.
    const nextDo = cfg.steps[step + 1]?.do;
    if (done && nextDo && nextDo.control === key && nextDo.to === d.position && (nextDo.on ?? 'press') === d.phase) {
      go(step + 1); acted(); return;
    }
    // Springing back from a momentary position, or a move that completes nothing.
    if (d.phase === 'release') { indicate(); return; }
    // The right control on its way to the right position (throttle through the cutoff roll, rotaries).
    const order = cfg.orders[key] ?? [], gap = (p: string) => Math.abs(order.indexOf(p) - order.indexOf(want?.to ?? ''));
    if (want && !done && want.control === key && gap(d.position) < gap(before)) { say(`Keep going: ${instruction(want)}.`); indicate(); return; }
    // A wrong move: put the control back.
    pos[key] = before;
    setPositions({ [key]: before });
    say(want && !done ? `Try again: ${instruction(want)}.` : 'Not needed for this step.', true);
    indicate();
  });

  confirm.addEventListener('click', () => {
    if (confirm.disabled || confirm.hidden) return;
    go(step + 1);
  });
  previous.addEventListener('click', () => {
    clearTimers(); stopEngine();
    const to = finished ? cfg.steps.length - 1 : Math.max(0, step - 1);
    finished = false;
    const h = history[to];
    if (h) { pos = { ...h.pos }; eng = { ...h.eng }; setPositions(pos); }
    step = to; done = false;
    render();
    if (pos['sidewall-controls.throttle'] === 'idle' && !eng.idle && stepId() !== 'throttle') runUp();
  });

  restart.addEventListener('click', () => {
    clearTimers(); stopEngine();
    pos = { ...cfg.initial }; eng = cold(); history.length = 0; finished = false;
    setPositions(pos);
    go(0);
    stepEls[0]?.querySelector('h2')?.focus();
  });

  setPositions(pos);
  go(0);
}
