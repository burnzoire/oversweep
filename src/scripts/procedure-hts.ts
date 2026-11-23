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

import { HAD_SLEW, HADH, HADX } from '../data/cockpit/f16c/mfd-had';

interface StepDo { control: string; to: string; on?: 'press' | 'release' }
interface Typing { keys: string[]; pages: string[] }
interface Step { id: string; panels: string[]; hints?: string[]; do?: StepDo; also?: StepDo[]; type?: Typing; confirm?: string }
interface Config { aircraft: string; model: string; initial: Record<string, string>; labels: Record<string, string>; names: Record<string, string>; steps: Step[] }
/** `pod`: ms of pod warm-up left (-1 off); `cur`: the HAD cursor while it is slewed by hand (page units); the rest name pages. */
interface State { pod: number; mfd: string; left: string; ded: string; cur: [number, number]; /** Pages of other panels' indicators (`hud.master-arm`), by indicator. */ x: Record<string, string>; /** Other panels' number readings (`hud.slant-range`), by indicator. */ r?: Record<string, number> }
type Pages = Partial<Pick<State, 'mfd' | 'left' | 'ded' | 'x' | 'r'>>;

/**
 * What each procedure's steps do to the displays. `after`: the pages once a step's moves are made; `slew`: the step
 * whose cursor is steered by hand (from page `on`, drawn as `free`, ending on `done` once on `target`); `scans`: a
 * step that plays pages in turn, one per HTS scan, before its button is offered.
 */
interface Scenario {
  initial: Pages; after: Record<string, Pages>;
  slew: { step: string; on: string; free: string; done: string; target: [number, number]; start: [number, number]; reach: number; speed: number; box: [number, number, number, number] };
  /**
   * A step that plays out over time (the HTS scans after a turn): one page per moment, at `secs` jet seconds from the
   * start, played back `ms` real milliseconds per page. The step panel gets a player (play, scrubber, elapsed time)
   * so the reader can replay it or drag through it; `caption` follows the time ("after the turn").
   */
  scans?: { step: string; pages: string[]; secs: number[]; ms: number; caption: string };
  /** Pages a step shows as it opens (a look step that adds a teaching overlay). */
  enter?: Record<string, Pages>;
}
const SCENARIOS: Record<string, Scenario> = {
  hts: {
    // The SOI starts on the left MFD, which shows the targeting pod (Slave, on the selected steerpoint).
    initial: { mfd: 'menu-blank', left: 'tgp-soi', ded: 'cni' },
    after: {
      'select-had': { mfd: 'had-not-soi' }, soi: { mfd: 'had', left: 'tgp' }, thrt: { mfd: 'had-thrt' }, 'thrt-back': { mfd: 'had' },
      designate: { mfd: 'had-designated', left: 'tgp-sa6' }, 'sead-ded': { ded: 'sead' }, reject: { mfd: 'had-hover', ded: 'cni', left: 'tgp' },
      exp1: { mfd: 'had-exp1' }, exp2: { mfd: 'had-exp2' }, norm: { mfd: 'had-hover' },
    },
    slew: { step: 'slew', on: 'had', free: 'had-free', done: 'had-hover', ...HAD_SLEW },
  },
  'hts-targeting': {
    initial: { mfd: 'hadx', left: 'tgp', ded: 'cni' },
    after: {
      list: { ded: 'list' }, misc: { ded: 'misc' }, 'hts-page': { ded: 'hts-1' }, 'next-entry': { ded: 'hts-2' }, 'ded-rtn': { ded: 'cni' },
      thrt: { mfd: 'had-thrt' }, 'class-1': { mfd: 'had-thrt-c1' }, 'class-2': { mfd: 'had-thrt-man' }, 'thrt-back': { mfd: 'hadx' },
      cntl: { mfd: 'hadx-cntl' }, nav2: { mfd: 'hadx-cntl-nav2' }, 'cntl-back': { mfd: 'hadx-n' },
      range: { mfd: 'hadx-60' }, cen: { mfd: 'hadx-cen' }, dep: { mfd: 'hadx-60' },
      designate: { mfd: 'hadx-des', left: 'tgp-sa11' }, 'step-6': { mfd: 'hadx-t-des6', left: 'tgp-sa6-near' }, 'step-11': { mfd: 'hadx-t11', left: 'tgp-sa11-near' },
      'tgp-soi': { mfd: 'hadx-t-notsoi', left: 'tgp-sa11-soi' },
      track: { mfd: 'hadx-t-tracked', left: 'tgp-sa11-track' },
    },
    slew: { step: 'slew', on: 'hadx-60', free: 'hadx-60-free', done: 'hadx-60-hover', ...HADX.slew },
    // One page per HTS scan as the radar moves off the nose (the scan cycle time with only MAN in the scan: 0:08, compressed).
    enter: { bearings: { mfd: 'hadx-des-aid' }, 'step-6': { mfd: 'hadx-t11' } },
    // The bearing lines are drawn 4 NM apart: about 29 s at 490 kt (the guide gives no timings; illustrative).
    scans: { step: 'turn', pages: ['hadx-t5', 'hadx-t4', 'hadx-t3', 'hadx-t2'], secs: [0, 29, 59, 88], ms: 2600, caption: 'after the turn' },
  },
  'harm-shot': {
    // The jet's HAD is SOI after the turn; the left MFD shows the SMS format; the HUD is on, master arm off, in NAV.
    initial: { mfd: 'hadh', left: 'sms-ag88-off', ded: 'cni', x: { 'hud.screen': 'on', 'hud.master-arm': 'none', 'hud.master-mode': 'nav', 'hud.harm-cues': 'none' }, r: { 'hud.steerpoint-distance': 19, 'hud.slant-range': 19.5 } },
    after: {
      'a-g': { x: { 'hud.master-mode': 'harm' } },
      'master-arm': { x: { 'hud.master-arm': 'arm' } },
      power: { left: 'sms-ag88' }, wpn: { left: 'wpn-has' },
      // Designating moves steerpoint 4 onto the radar (p. 539), about 44 NM away; the HUD's range fields follow it.
      designate: { mfd: 'hadh-des', left: 'wpn-pos-handoff', x: { 'hud.master-mode': 'harm' }, r: { 'hud.steerpoint-distance': 44, 'hud.slant-range': 44.1 } },
      release: { left: 'wpn-pos-flight', x: { 'hud.harm-cues': 'none' } },
    },
    slew: { step: 'slew', on: 'hadh', free: 'hadh-free', done: 'hadh-hover', ...HADH.slew },
    // Pages a step shows as it opens: closing on the radar, then the HUD cues as the jet climbs into the missile zone.
    enter: { fly: { mfd: 'hadh-close', x: { 'hud.harm-cues': 'amz' }, r: { 'hud.steerpoint-distance': 12, 'hud.slant-range': 12.1 } }, mmz: { x: { 'hud.harm-cues': 'mmz' } } },
  },
};

// The pod takes about 30 s to initialize (guide p. 525); compressed here.
const POD_MS = 5000;

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

  const sc = SCENARIOS[cfg.model] ?? SCENARIOS.hts;
  const initialState = (): State => ({ pod: -1, mfd: 'off', left: 'off', ded: 'off', ...sc.initial, x: { ...sc.initial.x }, r: { ...sc.initial.r }, cur: [...sc.slew.start] } as State);
  const copy = (s: State): State => ({ ...s, cur: [...s.cur], x: { ...s.x }, r: { ...s.r } });
  /** Apply a step's page changes; `x` adds to the other panels' pages rather than replacing them. */
  const apply = (p: Pages) => { const { x, r, ...rest } = p; Object.assign(st, rest); if (x) st.x = { ...st.x, ...x }; if (r) st.r = { ...st.r, ...r }; };
  try { sessionStorage.removeItem(`oversweep:cockpit:${cfg.aircraft}`); } catch { /* storage unavailable */ }
  let pos: Record<string, string> = { ...cfg.initial };
  let st = initialState();
  let step = 0;
  let finished = false;
  let made = new Set<string>();
  let typed = 0;
  let scanning = false;
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

  /** Slewing: the cursor moves by hand until it is on the SA-6. */
  const slewing = () => stepId() === sc.slew.step && !finished && st.mfd === sc.slew.on;
  function indicate() {
    const page = slewing() ? sc.slew.free : st.mfd;
    dispatchEvent(new CustomEvent('cockpit:indicate', { detail: { pages: { 'right-mfd.display': page, 'left-mfd.display': st.left, 'ded.display': st.ded, ...st.x }, readings: { ...st.r }, cursors: { 'right-mfd.display': st.cur } } }));
  }
  const keyText = (k: string) => name(k).replace(/ (key|button)$/, '').replace(/ \/.*$/, '');

  /*
   * The RDR CURSOR switch is force-sensing: the cursor moves while it is held, faster the harder it is pushed.
   * `defl` is its deflection (x right/forward, y up, -1..1) from the on-screen joystick (`cockpit:analog`) or, from
   * the keyboard, full deflection on each arm held.
   */
  const defl = { x: 0, y: 0 };
  let raf = 0, last = 0;
  const stopSlew = () => { cancelAnimationFrame(raf); raf = 0; defl.x = defl.y = 0; };
  function slew(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!slewing() || (!defl.x && !defl.y)) { raf = 0; return; }
    const speed = (d: number) => Math.sign(d) * Math.abs(d) ** 1.5 * sc.slew.speed;
    const [x0, y0, x1, y1] = sc.slew.box;
    st.cur = [Math.min(x1, Math.max(x0, st.cur[0] + speed(defl.x) * dt)), Math.min(y1, Math.max(y0, st.cur[1] - speed(defl.y) * dt))];
    if (Math.hypot(st.cur[0] - sc.slew.target[0], st.cur[1] - sc.slew.target[1]) < sc.slew.reach) {
      st.cur = [...sc.slew.target];
      st.mfd = sc.slew.done;
      stopSlew();
      indicate();
      done('The cursor is on the radar.');
      return;
    }
    indicate();
    raf = requestAnimationFrame(slew);
  }
  const push = (x: number, y: number) => {
    defl.x = x; defl.y = y;
    if (!raf && slewing() && (x || y)) { last = performance.now(); raf = requestAnimationFrame(slew); }
  };
  addEventListener('cockpit:analog', e => {
    const d = (e as CustomEvent<{ aircraft: string; panel: string; pad: string; x: number; y: number }>).detail;
    if (d.aircraft === cfg.aircraft && d.panel === 'throttle' && d.pad === 'cursor') push(d.x, d.y);
  });

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
    confirm.hidden = finished || !s.confirm || moves(s).length > 0 || !!s.type || slewing() || scanning;
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
    else if (s.type) say(`Press ${keyText(s.type.keys[0])} (key 1 of ${s.type.keys.length}).`);
    else if (slewing()) say('Steer the cursor onto the radar: press and drag on the RDR CURSOR switch.');
    else if (scanning) say('Watch the HAD: each scan refines the position. Replay it or drag through it below.');
    else say('Check the indications, then confirm.');
    showPad();
    indicate();
  }
  /** Open the switch card a step's next move needs, with the wanted position marked. */
  function showPad() {
    const s = cfg.steps[step], w = finished ? undefined : pending(s)[0];
    const key = !finished && s.type && typed < s.type.keys.length ? s.type.keys[typed] : undefined;
    dispatchEvent(new CustomEvent('cockpit:pad', { detail: key ? { control: key, to: 'in' } : { control: w?.control, to: w?.to } }));
  }

  /**
   * Every move is made. A step whose result is just the page it opened (no `confirm`) moves on by itself;
   * the others show the result and wait for the reader to confirm it.
   */
  function done(text = 'Done.') {
    if (!cfg.steps[step].confirm) {
      say(text);
      const at = step;
      later(matchMedia('(max-width: 48rem)').matches ? 1400 : 800, () => { if (step === at && !finished) go(step + 1); });
      return;
    }
    confirm.textContent = cfg.steps[step].confirm!;
    confirm.disabled = false;
    confirm.hidden = false;
    say(`${text} Check the indications, then continue.`);
  }
  function go(to: number) {
    timers.splice(0).forEach(clearTimeout);
    stopSlew(); stopPlayer();
    if (to >= cfg.steps.length) { finished = true; render(); complete.focus(); return; }
    history[to] = { pos: { ...pos }, st: copy(st) };
    step = to; made = new Set(); typed = 0;
    enterStep();
    render();
    if (st.pod > 0) warmUp();
    if (sc.scans && stepId() === sc.scans.step) playScans();
  }

  function enterStep() {
    const e = sc.enter?.[stepId()];
    if (e) { apply(e); indicate(); }
  }

  /* ---------------------------------------------------------------- player */
  const player = one<HTMLElement>('[data-player]');
  const playBtn = one<HTMLButtonElement>('[data-play]');
  const scrub = one<HTMLInputElement>('[data-scrub]');
  const clock = one<HTMLElement>('[data-clock]');
  let t = 0, frame = 0, lastFrame = 0;
  const mmss = (v: number) => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
  /** Show the moment `v` jet seconds in: the latest page at or before it, the scrubber and the clock. */
  function seek(v: number) {
    const { pages, secs, caption } = sc.scans!, end = secs[secs.length - 1];
    t = Math.max(0, Math.min(end, v));
    let k = 0;
    secs.forEach((x, i) => { if (x <= t) k = i; });
    if (st.mfd !== pages[k]) { st.mfd = pages[k]; indicate(); }
    scrub.value = String(t);
    clock.textContent = `${mmss(t)} / ${mmss(end)} ${caption}`;
    scrub.setAttribute('aria-valuetext', `${mmss(t)} ${caption}`);
  }
  function setPlaying(on: boolean) {
    cancelAnimationFrame(frame);
    playBtn.dataset.state = on ? 'pause' : t >= +scrub.max ? 'replay' : 'play';
    playBtn.setAttribute('aria-label', on ? 'Pause' : t >= +scrub.max ? 'Replay' : 'Play');
    if (!on) return;
    const { secs, ms } = sc.scans!, rate = (secs[secs.length - 1] / ((secs.length - 1) * ms));
    lastFrame = performance.now();
    const tick = (now: number) => {
      seek(t + (now - lastFrame) * rate); lastFrame = now;
      if (t >= +scrub.max) {
        setPlaying(false);
        // The step's button comes once the reader has seen the whole run.
        if (scanning) { scanning = false; render(); }
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }
  function stopPlayer() { cancelAnimationFrame(frame); player.hidden = true; }
  /** The HTS scans: the picture refines one page per moment; the step's button is offered once it has played through. */
  function playScans() {
    const { secs } = sc.scans!;
    scrub.min = '0'; scrub.max = String(secs[secs.length - 1]); scrub.step = '1';
    player.hidden = false;
    scanning = true; render();
    seek(0);
    if (reduced.matches) { seek(+scrub.max); scanning = false; setPlaying(false); render(); return; }
    setPlaying(true);
  }
  playBtn.addEventListener('click', () => {
    if (playBtn.dataset.state === 'pause') { setPlaying(false); return; }
    if (t >= +scrub.max) seek(0);
    setPlaying(true);
  });
  scrub.addEventListener('input', () => {
    cancelAnimationFrame(frame); seek(+scrub.value); setPlaying(false);
    if (scanning && t >= +scrub.max) { scanning = false; render(); }
  });

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
    const left = pending(cfg.steps[step]);
    if (left.length) { say(`Done. Still to do: ${left.map(instruction).join('; ')}.`); showPad(); indicate(); return; }
    apply(sc.after[id] ?? {});
    indicate();
    if (id === 'pod-power') { st.pod = POD_MS; warmUp(); return; }
    done();
  }

  addEventListener('cockpit:change', e => {
    const d = (e as CustomEvent<{ aircraft: string; panel: string; control: string; position: string; phase: 'press' | 'release' }>).detail;
    if (d.aircraft !== cfg.aircraft || finished) return;
    const key = `${d.panel}.${d.control}`;
    // The cursor switch while slewing: each arm held is full deflection that way (the joystick refines it).
    if (slewing() && (key === 'throttle.cursor-ud' || key === 'throttle.cursor-lr')) {
      const on = d.phase === 'press' ? 1 : 0;
      if (key === 'throttle.cursor-ud') push(defl.x, on * (d.position === 'up' ? 1 : d.position === 'down' ? -1 : 0));
      else push(on * (d.position === 'fwd' ? 1 : d.position === 'aft' ? -1 : 0), defl.y);
      return;
    }
    const s = cfg.steps[step], t = s.type;
    // Keys typed in order: each right key advances the DED page; the last one (ENTR) finishes the step.
    if (t && typed < t.keys.length && d.phase === 'press' && d.position === 'in' && t.keys[typed] === key) {
      st.ded = t.pages[typed++];
      indicate();
      if (typed === t.keys.length) { done('Accepted.'); return; }
      say(`Press ${keyText(t.keys[typed])} (key ${typed + 1} of ${t.keys.length}).`); showPad();
      return;
    }
    if (t && d.phase === 'release') { indicate(); return; }
    const before = pos[key];
    pos[key] = d.position;
    const want = pending(s).find(w => w.control === key && w.to === d.position && (w.on ?? 'press') === d.phase);
    if (want) { acted(want); return; }
    // Springing back from a momentary press, or a press that completes nothing.
    if (d.phase === 'release') { indicate(); return; }
    // A control that is not part of this step: put it back.
    pos[key] = before;
    setPositions({ [key]: before });
    const next = pending(s)[0];
    say(t && typed < t.keys.length ? `Try again: press ${keyText(t.keys[typed])} (key ${typed + 1} of ${t.keys.length}).` : next ? `Try again: ${instruction(next)}.` : 'Not needed for this step.', true);
    indicate();
  });

  confirm.addEventListener('click', () => {
    if (confirm.disabled || confirm.hidden) return;
    go(step + 1);
    stepEls[step]?.querySelector('h2')?.focus({ preventScroll: true });
  });
  previous.addEventListener('click', () => {
    timers.splice(0).forEach(clearTimeout);
    stopSlew(); stopPlayer();
    const to = finished ? cfg.steps.length - 1 : Math.max(0, step - 1);
    finished = false;
    const h = history[to];
    if (h) { pos = { ...h.pos }; st = copy(h.st); setPositions(pos); }
    step = to; made = new Set(); typed = 0; scanning = false;
    enterStep();
    render();
    if (sc.scans && stepId() === sc.scans.step) playScans();
  });
  restart.addEventListener('click', () => {
    timers.splice(0).forEach(clearTimeout);
    stopSlew(); stopPlayer(); scanning = false;
    pos = { ...cfg.initial }; st = initialState(); history.length = 0; finished = false;
    setPositions(pos);
    go(0);
    stepEls[0]?.querySelector('h2')?.focus();
  });

  setPositions(pos);
  go(0);
}
