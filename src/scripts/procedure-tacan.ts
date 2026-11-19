/**
 * F-16C TACAN navigation and recovery on the shared cockpit panels.
 *
 * Like the engine-start script, the panels move their own controls and report
 * each move as `cockpit:change`; this script owns the procedure. The ICP only
 * reports presses, so what a press does to the DED lives here: a small table of
 * DED pages per step, and an illustrative EHSI model (heading, steerpoint and
 * station bearings, range, course deviation) sent back with `cockpit:indicate`.
 */

interface StepDo { control: string; to: string; on?: 'press' | 'release' }
interface Ask { question: string; options: string[]; answer: number; right: string; wrong: string }
interface Step { id: string; panels: string[]; do?: StepDo; confirm?: string; turn?: { control: string; to: number; per: number }; ask?: Ask }
interface Config { aircraft: string; initial: Record<string, string>; labels: Record<string, string>; names: Record<string, string>; orders: Record<string, string[]>; steps: Step[] }
interface State { ded: string; mode: 'nav' | 'nav-pls' | 'tcn'; course: number; notice: string }

// The scenario (illustrative): heading 060°, the steerpoint 100° at 54.3 NM, Incirlik's TACAN 075° at 38.4 NM.
const HEADING = 60, STEERPOINT = { bearing: 100, range: 54.3 }, STATION = { bearing: 75, range: 38.4 };
/** DED page once each step's action is made. */
const DED_AFTER: Record<string, string> = {
  mids: 'cni-1y', tils: 'tils-rec-1y', mode: 'tils-tr-1y', 'chan-field': 'tils-tr-1y-chan', 'chan-2': 'tils-tr-2-edit', 'chan-1': 'tils-tr-21-edit',
  'chan-enter': 'tils-tr-21y', 'band-zero': 'tils-tr-0-edit', 'band-enter': 'tils-tr-21x',
};
const MODE_AFTER: Record<string, State['mode']> = { 'ehsi-mode-1': 'nav-pls', 'ehsi-mode-2': 'tcn' };
const initialState = (): State => ({ ded: 'cni-blank', mode: 'nav', course: HEADING, notice: 'none' });
const turnOf = (d: number) => ((d % 360) + 360) % 360;

export function startTacanModel(root: HTMLElement, cfg: Config) {
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
  let st = initialState();
  let step = 0;
  let finished = false;
  let done = false;
  const history: { pos: Record<string, string>; st: State }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let noticeTimer: ReturnType<typeof setTimeout> | undefined;

  const later = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, reduced.matches ? Math.min(ms, 50) : ms)); };
  const setPositions = (p: Record<string, string>) => dispatchEvent(new CustomEvent('cockpit:set', { detail: { positions: p } }));
  const say = (t: string, retry = false) => { feedback.textContent = t; feedback.classList.toggle('retry', retry); };
  const name = (control: string) => cfg.names[control] ?? control;
  const label = (control: string, to: string) => cfg.labels[`${control}.${to}`] ?? `${name(control)} to ${to}`;
  const instruction = (w: StepDo) => `${w.control.startsWith('icp.key') || w.control.endsWith('entr') || w.control === 'ehsi.mode' ? 'press' : 'set'} the ${label(w.control, w.to).replace(/ to PRESSED$/, '')}`;
  const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
  const stepId = () => cfg.steps[step]?.id ?? '';

  /** The EHSI's picture from the mode and the course set. */
  function indicate() {
    const tcn = st.mode === 'tcn';
    const src = tcn ? STATION : STEERPOINT;
    const off = Math.max(-180, Math.min(180, turnOf(src.bearing - st.course + 180) - 180));
    const dev = Math.max(-2.5, Math.min(2.5, off / 5));
    dispatchEvent(new CustomEvent('cockpit:indicate', { detail: {
      readings: {
        'ehsi.heading': HEADING, 'ehsi.heading-set': HEADING, 'ehsi.course': st.course, 'ehsi.course-set': st.course,
        'ehsi.bearing': src.bearing, 'ehsi.range': src.range, 'ehsi.deviation': +dev.toFixed(2),
      },
      pages: {
        'ded.display': st.ded, 'ehsi.screen': 'on', 'ehsi.mode': st.mode,
        'ehsi.to-from': tcn ? (Math.abs(off) < 90 ? 'to' : 'from') : 'none', 'ehsi.notice': st.notice,
      },
    } }));
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
    confirm.hidden = finished || !s.confirm;
    restart.hidden = !finished;
    confirm.textContent = s.confirm ?? 'Confirm';
    confirm.disabled = false;
    stepEls[step]?.querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(b => { b.disabled = false; });
    const shown = new Set(s.panels);
    for (const p of panels) {
      p.hidden = !shown.has(p.dataset.procPanel!);
      p.classList.toggle('acting', p.dataset.procPanel === s.panels[0]);
      p.style.order = String(s.panels.indexOf(p.dataset.procPanel!));
    }
    if (finished) say('');
    else if (s.do) say(`${cap(instruction(s.do))}.`);
    else if (s.turn) say(`Turn the ${name(s.turn.control)} until the course reads ${String(s.turn.to).padStart(3, '0')}°.`);
    else if (s.ask) say('Pick the correct reading.');
    else say(s.panels.length ? 'Check the indications, then confirm.' : 'Look the beacon up, then confirm.');
    indicate();
  }

  function next(delay = 700) {
    const at = step;
    later(delay, () => {
      if (step !== at || finished) return;
      const moveFocus = root.contains(document.activeElement) && !visual.contains(document.activeElement);
      go(step + 1);
      if (moveFocus) stepEls[step]?.querySelector('h2')?.focus({ preventScroll: true });
    });
  }
  function go(to: number) {
    timers.splice(0).forEach(clearTimeout);
    if (to >= cfg.steps.length) { finished = true; render(); complete.focus(); return; }
    history[to] = { pos: { ...pos }, st: { ...st } };
    step = to; done = false;
    render();
  }

  /** The step's action has been made: show its effect, then move on. */
  function acted() {
    done = true;
    const id = stepId();
    if (DED_AFTER[id]) st.ded = DED_AFTER[id];
    if (MODE_AFTER[id]) {
      st.mode = MODE_AFTER[id];
      st.notice = st.mode;
      clearTimeout(noticeTimer);
      noticeTimer = setTimeout(() => { st.notice = 'none'; indicate(); }, reduced.matches ? 50 : 1000);
    }
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
    if (want && !done && want.control === key && want.to === d.position && (want.on ?? 'press') === d.phase) { acted(); return; }
    // Springing back from a momentary press, or a press that completes nothing.
    if (d.phase === 'release') { indicate(); return; }
    // The CRS knob: each click turns the course one step either way.
    if (s.turn && !done && s.turn.control === key) {
      const n = cfg.orders[key].length, delta = ((cfg.orders[key].indexOf(d.position) - cfg.orders[key].indexOf(before) + n + n / 2) % n) - n / 2;
      st.course = turnOf(st.course + delta * s.turn.per);
      indicate();
      if (st.course === s.turn.to) { say('Course set; the deviation bar is centred.'); acted(); }
      else say(`Course ${String(st.course).padStart(3, '0')}°. Keep turning to ${String(s.turn.to).padStart(3, '0')}°.`);
      return;
    }
    // A button that is not part of this step: put it back.
    pos[key] = before;
    setPositions({ [key]: before });
    say(want && !done ? `Try again: ${instruction(want)}.` : 'Not needed for this step.', true);
    indicate();
  });

  confirm.addEventListener('click', () => { if (!confirm.disabled && !confirm.hidden) go(step + 1); });
  root.addEventListener('click', e => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-answer]');
    const ask = cfg.steps[step]?.ask;
    if (!b || !ask || finished || !stepEls[step]?.contains(b)) return;
    if (Number(b.dataset.answer) === ask.answer) {
      say(ask.right);
      stepEls[step].querySelectorAll<HTMLButtonElement>('[data-answer]').forEach(x => { x.disabled = true; });
      later(2500, () => go(step + 1));
    } else say(ask.wrong, true);
  });
  previous.addEventListener('click', () => {
    timers.splice(0).forEach(clearTimeout); clearTimeout(noticeTimer);
    const to = finished ? cfg.steps.length - 1 : Math.max(0, step - 1);
    finished = false;
    const h = history[to];
    if (h) { pos = { ...h.pos }; st = { ...h.st }; st.notice = 'none'; setPositions(pos); }
    step = to; done = false;
    render();
  });
  restart.addEventListener('click', () => {
    timers.splice(0).forEach(clearTimeout); clearTimeout(noticeTimer);
    pos = { ...cfg.initial }; st = initialState(); history.length = 0; finished = false;
    setPositions(pos);
    go(0);
    stepEls[0]?.querySelector('h2')?.focus();
  });

  setPositions(pos);
  go(0);
}
