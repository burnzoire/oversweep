/**
 * F-16C steerpoint entry on the shared cockpit panels.
 *
 * Like the TACAN script, the panels move their own controls and report each
 * move as `cockpit:change`; this script owns the procedure. The ICP only
 * reports presses, so what a press does to the DED lives here: a DED page per
 * step (and one per key for the fields that are typed), and an illustrative
 * HUD and EHSI picture for the selected steerpoint, sent back with
 * `cockpit:indicate`.
 */

interface StepDo { control: string; to: string; on?: 'press' | 'release' }
/** Keys pressed in order on one field; `pages[i]` is the DED page after key i. */
interface Typing { keys: string[]; pages: string[] }
interface Step { id: string; panels: string[]; do?: StepDo; type?: Typing; confirm?: string; turn?: { control: string; to: number; per: number } }
interface Config { aircraft: string; initial: Record<string, string>; labels: Record<string, string>; names: Record<string, string>; orders: Record<string, string[]>; steps: Step[] }
interface State { ded: string; selected: 4 | 5; course: number }

// The scenario (illustrative): heading 197°, 391 kt over the ground. Steerpoint 4 is 19 NM away on 195°; steerpoint 5,
// once entered, 31.4 NM on 200°. The HUD angles are what the diamond and steering cue show for those bearings.
const HEADING = 197;
interface Picture { bearing: number; range: number; ttg: number; diamond: [number, number]; cue: number; line: number }
const STEERPOINTS: Record<State['selected'], Picture> = {
  4: { bearing: 195, range: 19, ttg: 175, diamond: [-1.62, -7.63], cue: -1.24, line: -2 },
  5: { bearing: 200, range: 31.4, ttg: 289, diamond: [3, -5.98], cue: 3, line: 3 },
};
/** DED page once each step's action is made (steps with typed keys list their pages themselves). */
const DED_AFTER: Record<string, string> = { 'stpt-open': 'stpt-4', 'lat-field': 'stpt-lat-0', 'lon-field': 'stpt-lon-0', 'elev-field': 'stpt-elev-0', rtn: 'cni-5' };
const initialState = (): State => ({ ded: 'cni', selected: 4, course: 195 });
const turnOf = (d: number) => ((d % 360) + 360) % 360;

export function startSteerpointModel(root: HTMLElement, cfg: Config) {
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
  let typed = 0;
  let finished = false;
  let done = false;
  const history: { pos: Record<string, string>; st: State }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  const later = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, reduced.matches ? Math.min(ms, 50) : ms)); };
  const setPositions = (p: Record<string, string>) => dispatchEvent(new CustomEvent('cockpit:set', { detail: { positions: p } }));
  const say = (t: string, retry = false) => { feedback.textContent = t; feedback.classList.toggle('retry', retry); };
  const name = (control: string) => cfg.names[control] ?? control;
  const label = (control: string, to: string) => cfg.labels[`${control}.${to}`] ?? `${name(control)} to ${to}`;
  /** A keypad key as the reader names it: its digit, or ENTR. */
  const keyText = (control: string) => (control === 'icp.entr' ? 'ENTR' : control.replace('icp.key-', ''));
  const instruction = (w: StepDo) => `${w.control.startsWith('icp.key') || w.control.endsWith('entr') ? 'press' : 'set'} the ${label(w.control, w.to).replace(/ to PRESSED$/, '')}`;
  const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
  const stepId = () => cfg.steps[step]?.id ?? '';

  /** The HUD's and EHSI's picture of the selected steerpoint. */
  function indicate() {
    const p = STEERPOINTS[st.selected];
    const off = Math.max(-180, Math.min(180, turnOf(p.bearing - st.course + 180) - 180));
    const dev = Math.max(-2.5, Math.min(2.5, off / 5));
    dispatchEvent(new CustomEvent('cockpit:indicate', { detail: {
      readings: {
        'ehsi.heading': HEADING, 'ehsi.heading-set': HEADING, 'ehsi.course': st.course, 'ehsi.course-set': st.course,
        'ehsi.bearing': p.bearing, 'ehsi.range': p.range, 'ehsi.deviation': +dev.toFixed(2),
        'hud.heading': HEADING, 'hud.steerpoint': st.selected, 'hud.steerpoint-distance': Math.round(p.range), 'hud.slant-range': p.range,
        'hud.ttg': p.ttg, 'hud.steerpoint-azimuth': p.diamond[0], 'hud.steerpoint-elevation': p.diamond[1],
        'hud.steering-cue': p.cue, 'hud.steering': p.line,
      },
      pages: { 'ded.display': st.ded, 'ehsi.screen': 'on', 'ehsi.mode': 'nav', 'ehsi.to-from': 'none', 'ehsi.notice': 'none', 'hud.screen': 'on' },
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
    const shown = new Set(s.panels);
    for (const p of panels) {
      p.hidden = !shown.has(p.dataset.procPanel!);
      p.classList.toggle('acting', p.dataset.procPanel === s.panels[0]);
      p.style.order = String(s.panels.indexOf(p.dataset.procPanel!));
    }
    if (finished) say('');
    else if (s.type) say(`Press ${keyText(s.type.keys[0])} (key 1 of ${s.type.keys.length}).`);
    else if (s.do) say(`${cap(instruction(s.do))}.`);
    else if (s.turn) say(`Turn the ${name(s.turn.control)} until the course reads ${String(s.turn.to).padStart(3, '0')}°.`);
    else say(s.panels.length ? 'Check the indications, then confirm.' : 'Read the data, then confirm.');
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
    step = to; done = false; typed = 0;
    render();
  }

  /** The step's action has been made: show its effect, then move on. */
  function acted() {
    done = true;
    const id = stepId();
    if (DED_AFTER[id]) st.ded = DED_AFTER[id];
    if (id === 'select') st.selected = 5;
    indicate();
    next();
  }

  addEventListener('cockpit:change', e => {
    const d = (e as CustomEvent<{ aircraft: string; panel: string; control: string; position: string; phase: 'press' | 'release' }>).detail;
    if (d.aircraft !== cfg.aircraft || finished) return;
    const key = `${d.panel}.${d.control}`;
    const before = pos[key];
    pos[key] = d.position;
    const s = cfg.steps[step], want = s.do, t = s.type;
    if (want && !done && want.control === key && want.to === d.position && (want.on ?? 'press') === d.phase) { acted(); return; }
    // Keys typed in order: each right key advances the DED page; the last one (ENTR) finishes the step.
    if (t && !done && d.phase === 'press' && d.position === 'in' && t.keys[typed] === key) {
      st.ded = t.pages[typed];
      typed++;
      if (typed === t.keys.length) { say(keyText(key) === 'ENTR' ? 'Accepted.' : ''); acted(); return; }
      say(`Press ${keyText(t.keys[typed])} (key ${typed + 1} of ${t.keys.length}).`);
      indicate();
      return;
    }
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
    // A control that is not part of this step (or the wrong key): put it back.
    pos[key] = before;
    setPositions({ [key]: before });
    say(t && !done ? `Try again: press ${keyText(t.keys[typed])} (key ${typed + 1} of ${t.keys.length}).` : want && !done ? `Try again: ${instruction(want)}.` : 'Not needed for this step.', true);
    indicate();
  });

  confirm.addEventListener('click', () => { if (!confirm.disabled && !confirm.hidden) go(step + 1); });
  previous.addEventListener('click', () => {
    timers.splice(0).forEach(clearTimeout);
    const to = finished ? cfg.steps.length - 1 : Math.max(0, step - 1);
    finished = false;
    const h = history[to];
    if (h) { pos = { ...h.pos }; st = { ...h.st }; setPositions(pos); }
    step = to; done = false; typed = 0;
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
