/**
 * F-16C HARM Targeting System (HTS) familiarization on the shared cockpit panels.
 *
 * The panels move their own controls and report each move as `cockpit:change`;
 * this script owns the procedure. The MFD and DED only report presses, so what
 * a press does to them lives here: the right MFD's HAD page (one tactical
 * picture in the states the steps pass through, see `mfd-had.ts`) and the DED
 * page, sent back with `cockpit:indicate`. Every step changes a display, so
 * each waits for the reader to confirm what it shows.
 */

interface StepDo { control: string; to: string; on?: 'press' | 'release' }
interface Step { id: string; panels: string[]; hints?: string[]; do?: StepDo; also?: StepDo[]; confirm?: string }
interface Config { aircraft: string; initial: Record<string, string>; labels: Record<string, string>; names: Record<string, string>; steps: Step[] }
/** `pod`: seconds of pod warm-up left (-1 off); `up`/`left`: the cursor slews made; the rest name pages. */
interface State { pod: number; mfd: string; ded: string; up: boolean; left: boolean }

// The pod takes about 30 s to initialize (guide p. 525); compressed here.
const POD_MS = 5000;
const initialState = (): State => ({ pod: -1, mfd: 'menu-blank', ded: 'cni', up: false, left: false });
/** The right MFD page once each step's action is made. */
const MFD_AFTER: Record<string, string> = {
  'select-had': 'had-not-soi', soi: 'had', thrt: 'had-thrt', 'thrt-back': 'had', designate: 'had-designated',
  'sead-ded': 'had-designated', reject: 'had-hover', exp1: 'had-exp1', exp2: 'had-exp2', norm: 'had-hover',
};

export function startHtsModel(root: HTMLElement, cfg: Config) {
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
  let made = new Set<string>();
  const history: { pos: Record<string, string>; st: State }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  const later = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, reduced.matches ? Math.min(ms, 50) : ms)); };
  const setPositions = (p: Record<string, string>) => dispatchEvent(new CustomEvent('cockpit:set', { detail: { positions: p } }));
  const say = (t: string, retry = false) => { feedback.textContent = t; feedback.classList.toggle('retry', retry); };
  const name = (control: string) => cfg.names[control] ?? control;
  const label = (control: string, to: string) => cfg.labels[`${control}.${to}`] ?? `${name(control)} to ${to}`;
  const instruction = (w: StepDo) => (w.to === 'in' ? `press ${name(w.control)}` : `set the ${label(w.control, w.to)}`);
  const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
  const mk = (w: StepDo) => `${w.control}=${w.to}`;
  const moves = (s: Step) => [...(s.do ? [s.do] : []), ...(s.also ?? [])];
  const pending = (s: Step) => moves(s).filter(w => !made.has(mk(w)));
  const stepId = () => cfg.steps[step]?.id ?? '';

  function indicate() {
    // The HAD cursor part of the way to the SA-6 while it is being slewed.
    const mfd = stepId() === 'slew' && !made.size ? 'had' : st.mfd;
    const page = mfd === 'had' && (st.up || st.left) ? (st.up && st.left ? 'had-hover' : st.up ? 'had-up' : 'had-left') : mfd;
    dispatchEvent(new CustomEvent('cockpit:indicate', { detail: { pages: { 'right-mfd.display': page, 'left-mfd.display': 'menu', 'ded.display': st.ded } } }));
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
    // The button names what the reader checks; it shows once the step's moves are made.
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
    else if (moves(s).length === 1) say(`${cap(instruction(moves(s)[0]))}.`);
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

  /** Every move is made: show the result and wait for the reader to confirm it. */
  function done(text = 'Done.') {
    confirm.textContent = cfg.steps[step].confirm ?? 'Continue';
    confirm.disabled = false;
    confirm.hidden = false;
    say(`${text} Check the indications, then continue.`);
  }
  function go(to: number) {
    timers.splice(0).forEach(clearTimeout);
    if (to >= cfg.steps.length) { finished = true; render(); complete.focus(); return; }
    history[to] = { pos: { ...pos }, st: { ...st } };
    step = to; made = new Set();
    render();
    if (st.pod > 0) warmUp();
  }

  /** The pod's warm-up: the step that powers it counts the wait down on its button, then lets the reader on. */
  function warmUp() {
    const wait = stepId() === 'pod-power';
    if (wait) { confirm.hidden = false; confirm.disabled = true; say('Pod initializing: about 30 seconds in the jet, a few seconds here.'); }
    const tick = () => {
      // Shown in the jet's seconds (30), counted down in the compressed time.
      if (wait) confirm.textContent = `Initializing… ${Math.ceil((st.pod / POD_MS) * 30)} s`;
      if (st.pod <= 0) {
        if (wait) { confirm.disabled = false; confirm.textContent = cfg.steps[step].confirm ?? 'Continue'; say('The 30 seconds are up: the pod has initialized. Continue.'); }
        return;
      }
      const step5 = POD_MS / 6;
      later(Math.min(step5, st.pod), () => { st.pod = Math.max(0, st.pod - step5); tick(); });
    };
    tick();
  }

  function acted(w: StepDo) {
    made.add(mk(w));
    const id = stepId();
    if (id === 'slew') { if (w.control === 'throttle.cursor-ud') st.up = true; else st.left = true; }
    const left = pending(cfg.steps[step]);
    if (left.length) { say(`Done. Still to do: ${left.map(instruction).join('; ')}.`); showPad(); indicate(); return; }
    if (MFD_AFTER[id]) st.mfd = MFD_AFTER[id];
    if (id === 'slew') st.mfd = 'had-hover';
    if (id === 'sead-ded') st.ded = 'sead';
    if (id === 'reject') st.ded = 'cni';
    indicate();
    if (id === 'pod-power') { st.pod = POD_MS; warmUp(); return; }
    done(id === 'slew' ? 'The cursor is on the SA-6.' : 'Done.');
  }

  addEventListener('cockpit:change', e => {
    const d = (e as CustomEvent<{ aircraft: string; panel: string; control: string; position: string; phase: 'press' | 'release' }>).detail;
    if (d.aircraft !== cfg.aircraft || finished) return;
    const key = `${d.panel}.${d.control}`;
    const before = pos[key];
    pos[key] = d.position;
    const s = cfg.steps[step];
    const want = pending(s).find(w => w.control === key && w.to === d.position && (w.on ?? 'press') === d.phase);
    if (want) { acted(want); return; }
    // Springing back from a momentary press, or a press that completes nothing.
    if (d.phase === 'release') { indicate(); return; }
    // A control that is not part of this step: put it back.
    pos[key] = before;
    setPositions({ [key]: before });
    const next = pending(s)[0];
    say(next ? `Try again: ${instruction(next)}.` : 'Not needed for this step.', true);
    indicate();
  });

  confirm.addEventListener('click', () => {
    if (confirm.disabled || confirm.hidden) return;
    go(step + 1);
    stepEls[step]?.querySelector('h2')?.focus({ preventScroll: true });
  });
  previous.addEventListener('click', () => {
    timers.splice(0).forEach(clearTimeout);
    const to = finished ? cfg.steps.length - 1 : Math.max(0, step - 1);
    finished = false;
    const h = history[to];
    if (h) { pos = { ...h.pos }; st = { ...h.st }; setPositions(pos); }
    step = to; made = new Set();
    render();
  });
  restart.addEventListener('click', () => {
    timers.splice(0).forEach(clearTimeout);
    pos = { ...cfg.initial }; st = initialState(); history.length = 0; finished = false;
    setPositions(pos);
    go(0);
    stepEls[0]?.querySelector('h2')?.focus();
  });

  setPositions(pos);
  go(0);
}
