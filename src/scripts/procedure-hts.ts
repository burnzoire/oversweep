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
import { MAV_D_SLEW3, MAV_D_SLEW7, MAV_SLEW } from '../data/cockpit/f16c/mfd-maverick';
import { TGP_SLEW_B, TGP_SLEW_T } from '../data/cockpit/f16c/mfd-tgp';
import { AIM_SLEW, FCR_SLEW, aimFcr } from '../data/cockpit/f16c/mfd-fcr';
import { TWO_SLEW } from '../data/cockpit/f16c/mfd-fcr-two';
import { SCENE_MOTIONS, sampleScene, sceneFrame, type SceneFrame, type SceneMotion } from '../data/cockpit/f16c/aim120-scene';
import { aimCue, hudFont } from '../data/cockpit/f16c/hud';
import { mfdDisplay } from '../data/cockpit/f16c/mfd';
import { renderHudCue, renderMfdPage } from '../data/cockpit/render';

interface StepDo { control: string; to: string; on?: 'press' | 'release'; /** Presses it takes (each short of the last shows `after['<step>-<n>']`). */ times?: number }
interface Typing { keys: string[]; pages: string[] }
interface Step { id: string; panels: string[]; hints?: string[]; do?: StepDo; also?: StepDo[]; type?: Typing; confirm?: string }
interface Config { aircraft: string; model: string; initial: Record<string, string>; labels: Record<string, string>; names: Record<string, string>; steps: Step[] }
/** `pod`: ms of pod warm-up left (-1 off); `cur`: the HAD cursor while it is slewed by hand (page units); the rest name pages. */
interface State { pod: number; /** The running warm-up (index into the scenario's). */ wk: number; mfd: string; left: string; ded: string; cur: [number, number]; /** Pages of other panels' indicators (`hud.master-arm`), by indicator. */ x: Record<string, string>; /** Other panels' number readings (`hud.slant-range`), by indicator. */ r?: Record<string, number>; scene?: SceneFrame }
type Pages = Partial<Pick<State, 'mfd' | 'left' | 'ded' | 'x' | 'r' | 'scene'>>;

/**
 * What each procedure's steps do to the displays. `after`: the pages once a step's moves are made; `slew`: the step
 * whose cursor is steered by hand (from page `on`, drawn as `free`, ending on `done` once on `target`); `scans`: a
 * step that plays pages in turn, one per HTS scan, before its button is offered.
 */
interface Scenario {
  initial: Pages; after: Record<string, Pages>;
  /** `display`: the MFD the cursor is on (the right one unless named); `what`: the prompt's name for the thing steered onto. */
  slew: Slew | Slew[];
  /**
   * A warm-up the step that starts it waits out (the HTS pod's 30 s by default): its button counts down the jet's
   * `secs`, compressed to `ms`; `busy` and `ready` are the prompts; `after` the pages once it is over.
   */
  warm?: Warm | Warm[];
  /**
   * A step with timed pages or interpolated scene frames. The timeline is in seconds; `ms` is real
   * milliseconds per interval for pages, or the full playback duration for a scene.
   */
  scans?: Scan | Scan[];
  /** Pages a step shows as it opens (a look step that adds a teaching overlay). */
  enter?: Record<string, Pages>;
  /**
   * A knob turned by hand to a setting (ANT ELEV): each position shows `page` with `{pos}` replaced by the position id,
   * on the `display` MFD; the step is done while the knob is at one of `ok`. Later steps' pages may name `{dial}`,
   * the position it was left at. `near`: the prompt when the knob is off `ok`.
   */
  dial?: Dial | Dial[];
}
interface Dial { step: string; control: string; page: string; ok: string[]; /** Positions where the thing looked for shows, but off `ok`. */ seen: string[]; display: 'left' | 'right'; prompt: string; near: string; done: string }
/** A slew: from page `on` (drawn as `free` while slewed), ending on `done` once the cursor is within `reach` of `target`. Several may run, one per step. */
interface Slew { /** Whether the thing steered is a cursor (the FCR's, on the left MFD) rather than crosshairs. */ cursor?: boolean; step: string; on: string; free: string; done: string; target: [number, number]; start: [number, number]; reach: number; speed: number; box: [number, number, number, number]; display?: 'left' | 'right'; what?: string; along?: [number, number]; freeOnMove?: boolean }
interface ScanTiming { step: string; secs: number[]; ms: number; caption: string; display?: 'left' | 'right'; prompt?: string }
type Scan = ScanTiming & ({ pages: (string | Pages)[]; motion?: never } | { motion: SceneMotion; pages?: never });
interface Warm { step: string; secs: number; ms: number; busy: string; ready: string; label: string; after?: Pages }

const aimScan = (step: keyof typeof SCENE_MOTIONS, caption: string, prompt: string): Scan => {
  const motion = SCENE_MOTIONS[step];
  return { step, motion, secs: motion.keyframes.map(key => key.seconds), ms: motion.ms, caption, prompt };
};

// The flight path stays on the horizon in this level-flight scene.
const levelHud = (pitch: number) => ({ 'hud.pitch': pitch, 'hud.fpm-elevation': -pitch });

const HUD_CAP = { 'hud.altitude': 28000, 'hud.velocity': 370, 'hud.mach': 0.92, 'hud.heading': 360, 'hud.pitch': 0, 'hud.roll': 0, 'hud.fpm-azimuth': 0, 'hud.fpm-elevation': 0, 'hud.steerpoint-azimuth': 0, 'hud.steerpoint-elevation': -24.7, 'hud.steering-cue': 0, 'hud.slant-range': 11, 'hud.steerpoint-distance': 10, 'hud.steerpoint': 1, 'hud.ttg': 65, 'hud.radar-alt': 27000 };
const SCENARIOS: Record<string, Scenario> = {
  // F-16C air-to-air radar (mfd-fcr.ts): the FCR on the left MFD; a CAP at 28,000 ft heading 360°, the CAP point 10 NM ahead.
  'fcr-tws': {
    initial: { left: 'tw-rws', mfd: 'menu-blank', ded: 'cni' },
    after: {
      'mode-1': { left: 'tw-vsr' }, mode: { left: 'tw-search' },
      'sys-lead': { left: 'tw-lead-sys' }, 'sys-wing': { left: 'tw-two-sys' }, bug: { left: 'tw-bug-lead' }, step: { left: 'tw-bug-wing' },
      'back-1': { left: 'tw-two-sys' }, 'back-2': { left: 'tw-down' }, 'back-3': { left: 'tw-purged' }, back: { left: 'tw-rws-end' },
    },
    // The tracks have formed by the time the step opens.
    enter: { tracks: { left: 'tw-tracks' } },
    slew: [
      { step: 'slew-lead', on: 'tw-tracks', free: 'tw-cur-free', done: 'tw-cur-lead', display: 'left', cursor: true, what: 'lead’s track', ...TWO_SLEW.lead },
      { step: 'slew-wing', on: 'tw-lead-sys', free: 'tw-wing-free', done: 'tw-cur-wing', display: 'left', cursor: true, what: 'wingman’s track', ...TWO_SLEW.wing },
    ],
  },
  'fcr-two': {
    initial: { left: 'dt-start', mfd: 'menu-blank', ded: 'cni' },
    after: { bug: { left: 'dt-sam' }, second: { left: 'dt-dtsam' }, swap: { left: 'dt-swap' }, stt: { left: 'dt-stt' } },
    // Two and a half minutes on, inside 10 NM of the lead: the radar has gone to DTT.
    enter: { close: { left: 'dt-dtt' } },
    slew: { step: 'slew', on: 'dt-sam', free: 'dt-free', done: 'dt-wing', display: 'left', cursor: true, what: 'wingman', ...TWO_SLEW.wing },
  },
  'fcr-rws': {
    initial: { left: 'fcr-not-soi', mfd: 'menu-blank', ded: 'cni' },
    after: { soi: { left: 'fcr-40' }, 'range-up': { left: 'fcr-80' }, a3: { left: 'fcr-80-a3-center' }, bars: { left: 'fcr-80-a3-low-2b' } },
    dial: {
      step: 'tilt', control: 'throttle.ant-elev', page: 'fcr-80-a3-{pos}', ok: ['d5'], seen: ['d10', 'd15', 'd20', 'd25', 'd30'], display: 'left',
      prompt: 'Press and drag down on the ANT ELEV knob to tilt the volume down, watching 10° left, 25 NM out.',
      near: 'Too far down: the floor of the volume is now well below the ground. Drag back up until the caret is one notch under level.',
      done: 'The single shows, and the group is still in the volume.',
    },
    slew: { step: 'slew', on: 'fcr-80-a3-d5', free: 'fcr-80-a3-low-free', done: 'fcr-80-a3-low', display: 'left', cursor: true, what: 'low single', ...FCR_SLEW.low },
  },
  'fcr-vsr': {
    initial: { left: 'fcr-80', mfd: 'menu-blank', ded: 'cni' },
    after: { vsr: { left: 'fcr-vsr' }, stt: { left: 'fcr-vsr-stt' }, drop: { left: 'fcr-vsr-far' } },
    slew: { step: 'slew', on: 'fcr-vsr', free: 'fcr-vsr-free', done: 'fcr-vsr-far', display: 'left', cursor: true, what: 'far contact', ...FCR_SLEW.far },
  },
  aim120: {
    // The radar procedures' CAP: the FCR (not SOI) on the left MFD, the SMS on the right; NAV, master arm off.
    initial: { left: 'fcr-not-soi', mfd: 'sms-msl', ded: 'cni', x: { 'hud.screen': 'on', 'hud.master-arm': 'none', 'hud.master-mode': 'nav', 'hud.harm-cues': 'none', 'hud.slant-range-source': 'b' }, r: { ...HUD_CAP, ...levelHud(sceneFrame('bugged').aircraft.pitch) } },
    after: {
      msl: { left: 'fcr-msl', x: { 'hud.master-mode': 'mrm4', 'hud.harm-cues': 'mrm-bore' } },
      arm: { left: 'fcr-msl-rdy', mfd: 'sms-msl-rdy', x: { 'hud.master-arm': 'arm' } },
      soi: { left: 'fcr-msl-soi' }, range: { left: 'fcr-msl-80' },
      bug: { scene: sceneFrame('bugged'), x: { 'hud.slant-range-source': 'f' } },
      shoot: { scene: sceneFrame('launched'), mfd: 'sms-msl-3', x: { 'hud.master-mode': 'mrm3' } },
    },
    slew: { step: 'slew', on: 'fcr-msl-80', free: 'fcr-msl-80-free', done: 'fcr-msl-80-lead', display: 'left', cursor: true, what: 'lead contact', ...AIM_SLEW },
    scans: [
      aimScan('turn', 'of playback', 'Watch the turn on the HUD and radar. Replay it or drag through it below.'),
      aimScan('close', 'after the turn', 'Watch the missile scale on the FCR and the HUD as the range closes. Replay it or drag through it below.'),
      aimScan('away', 'of playback', 'Watch the smoke trail grow toward the target. Replay it or drag through it below.'),
      aimScan('crank', 'of playback', 'Watch the HUD and radar through the turn. Replay it or drag through it below.'),
      aimScan('support', 'after the launch', 'Watch the timer count down under the missile scale. Replay it or drag through it below.'),
    ],
  },
  'aim120-bore': {
    // The CAP, a bandit in sight 5° right: the SMS on the right MFD; NAV, master arm off; the radar not tracking.
    initial: { mfd: 'sms-aam', ded: 'cni', x: { 'hud.screen': 'on', 'hud.master-arm': 'none', 'hud.master-mode': 'nav', 'hud.harm-cues': 'scene-bandit', 'hud.slant-range-source': 'b' }, r: HUD_CAP },
    after: {
      'a-a': { x: { 'hud.master-mode': 'mrm4', 'hud.harm-cues': 'mrm-bore-bandit' } },
      bore: { mfd: 'sms-aam-bore' },
      arm: { mfd: 'sms-aam-bore-rdy', x: { 'hud.master-arm': 'arm' } },
      shoot: { mfd: 'sms-aam-bore-3', x: { 'hud.master-mode': 'mrm3' } },
    },
    enter: { aim: { x: { 'hud.harm-cues': 'mrm-bore-on' }, r: { 'hud.heading': 5, 'hud.pitch': 6, 'hud.fpm-elevation': -2 } } },
    slew: [],
  },
  'fcr-bug': {
    initial: { left: 'fcr-80-a3-lead', mfd: 'menu-blank', ded: 'cni', x: { 'hud.screen': 'on', 'hud.master-arm': 'none', 'hud.master-mode': 'nav', 'hud.harm-cues': 'none', 'hud.slant-range-source': 'b' }, r: { 'hud.altitude': 28000, 'hud.velocity': 370, 'hud.mach': 0.92, 'hud.heading': 360, 'hud.pitch': 0, 'hud.roll': 0, 'hud.fpm-azimuth': 0, 'hud.fpm-elevation': 0, 'hud.steerpoint-azimuth': 0, 'hud.steerpoint-elevation': -24.7, 'hud.steering-cue': 0, 'hud.slant-range': 11, 'hud.steerpoint-distance': 10, 'hud.steerpoint': 1, 'hud.ttg': 65, 'hud.radar-alt': 27000 } },
    after: {
      bug: { left: 'fcr-sam', x: { 'hud.harm-cues': 'aa-tll', 'hud.slant-range-source': 'f' }, r: { 'hud.slant-range': 45 } },
      stt: { left: 'fcr-stt' }, back: { left: 'fcr-sam-turned' },
      reject: { left: 'fcr-rws-turned', x: { 'hud.harm-cues': 'none', 'hud.slant-range-source': 'b' }, r: { 'hud.slant-range': 11 } },
    },
    // The turn onto the collision course: the picture as the step opens.
    enter: { turn: { left: 'fcr-sam-turned', x: { 'hud.harm-cues': 'aa-td' }, r: { 'hud.heading': 347, 'hud.steerpoint-azimuth': 13 } } },
    slew: [],
  },
  markpoints: {
    // The right MFD shows the HSD (60 NM, depressed), steerpoint 3 selected; the DED the CNI page.
    initial: { mfd: 'hsd-start', ded: 'cni-3' },
    after: {
      mark: { ded: 'mark-hud' }, ofly: { ded: 'mark-ofly' }, store: { ded: 'mark-26', mfd: 'hsd-marked' },
      select: { ded: 'mark-26-stpt', mfd: 'hsd-mark-sel' }, rtn: { ded: 'cni-26' }, range: { mfd: 'hsd-mark-30' },
    },
    // Flying on: the picture moves as each step opens.
    enter: { overfly: { mfd: 'hsd-over' }, 'fly-on': { mfd: 'hsd-on' } },
    slew: [],
  },
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
  'maverick-pre': {
    // The left MFD shows the SMS format, AG65 selected; the HUD is on, in NAV, master arm off.
    initial: { left: 'sms-ag65-off', ded: 'cni', x: { 'hud.screen': 'on', 'hud.master-arm': 'none', 'hud.master-mode': 'nav' } },
    after: {
      'a-g': { x: { 'hud.master-mode': 'bore' } },
      'master-arm': { x: { 'hud.master-arm': 'arm' } },
      power: { left: 'sms-ag65-on' }, wpn: { left: 'wpn-mav-bore' },
      pre: { left: 'wpn-mav-pre-notsoi', x: { 'hud.master-mode': 'pre' } }, soi: { left: 'wpn-mav-pre' },
      fov: { left: 'wpn-mav-narrow' }, lock: { left: 'wpn-mav-track' }, release: { left: 'wpn-mav-7' },
    },
    // The seeker is slewed by hand: the picture moves under the crosshairs until the lead tank is there.
    slew: { step: 'slew', on: 'wpn-mav-pre', free: 'wpn-mav-pre', done: 'wpn-mav-pre', display: 'left', what: 'tank', ...MAV_SLEW },
    // The 3-minute warm-up (guide p. 675), compressed.
    warm: { step: 'power', secs: 180, ms: 6000, label: 'Warming up…', busy: 'The Mavericks are warming up: 3 minutes in the jet, a few seconds here.', ready: 'The 3 minutes are up: the Mavericks are in standby, ready to use. Continue.', after: { left: 'sms-ag65' } },
  },
  'maverick-handoff': {
    // The pod is on the right MFD, slaved to steerpoint 3; the left MFD shows the SMS format, AG65 (D) selected; NAV, master arm off.
    initial: { mfd: 'tgp-b', left: 'sms-d-off', ded: 'cni', x: { 'hud.screen': 'on', 'hud.master-arm': 'none', 'hud.master-mode': 'nav' } },
    after: {
      'a-g': { x: { 'hud.master-mode': 'bore' } }, 'master-sim': { x: { 'hud.master-arm': 'sim' } },
      power: { left: 'sms-d-on' }, pre: { left: 'sms-d-pre', x: { 'hud.master-mode': 'pre' } }, wpn: { left: 'wpn-d-b-wide' }, fov: { left: 'wpn-d-b-narrow' },
      'tgp-soi': { mfd: 'tgp-b-soi' }, 'wpn-soi': { mfd: 'tgp-b-on', left: 'wpn-d-b' },
      lock: { left: 'wpn-d-b-track' }, break: { left: 'wpn-d-b-slaved' },
      step: { left: 'wpn-d-b7', mfd: 'tgp-b-on7' }, lock7: { left: 'wpn-d-b7-track' }, break7: { left: 'wpn-d-b7-slaved' },
      'cz-soi': { mfd: 'tgp-b-on7-soi', left: 'wpn-d-b7-notsoi' }, cz: { mfd: 'tgp-b-cz', left: 'wpn-d-b7-cz' }, sms: { left: 'sms-d-pre7' }, 'power-off': { left: 'sms-d-pre-off' }, reset: { x: { 'hud.master-arm': 'none', 'hud.master-mode': 'nav' } },
      rearm: { x: { 'hud.master-arm': 'arm', 'hud.master-mode': 'pre' } }, 'power-on': { left: 'sms-d-pre-on' },
      wpn2: { left: 'wpn-d-t-wide' }, fov2: { left: 'wpn-d-t' }, 'tgp-soi2': { mfd: 'tgp-t-soi' },
      release: { left: 'wpn-d-t-3', mfd: 'tgp-t-3' },
    },
    // Steerpoint 5 selected on the way to the target: the pod slews to it.
    enter: { rearm: { mfd: 'tgp-t' } },
    slew: [
      { step: 'tgp-slew', on: 'tgp-b-soi', free: 'tgp-b-soi-cz', done: 'tgp-b-soi-cz', freeOnMove: true, ...TGP_SLEW_B },
      { step: 'mav-slew', on: 'wpn-d-b', free: 'wpn-d-b', done: 'wpn-d-b', display: 'left', ...MAV_D_SLEW3 },
      { step: 'slew7', on: 'wpn-d-b7', free: 'wpn-d-b7', done: 'wpn-d-b7', display: 'left', ...MAV_D_SLEW7 },
      { step: 'tgp-slew2', on: 'tgp-t-soi', free: 'tgp-t-soi-cz', done: 'tgp-t-soi-cz', freeOnMove: true, ...TGP_SLEW_T },
    ],
    // The 3-minute warm-up (guide p. 675), compressed, once to boresight and again before the shot.
    warm: [
      { step: 'power', secs: 180, ms: 6000, label: 'Warming up…', busy: 'The Mavericks are warming up: 3 minutes in the jet, a few seconds here.', ready: 'The 3 minutes are up: the Mavericks are in standby. Continue.', after: { left: 'sms-d' } },
      { step: 'power-on', secs: 180, ms: 6000, label: 'Warming up…', busy: 'The Mavericks are warming up again: 3 minutes in the jet, a few seconds here.', ready: 'The 3 minutes are up: the Mavericks are ready. Continue.', after: { left: 'sms-d-pre-rdy' } },
    ],
    // The correlator's handoff, letter by letter (the guide gives no timings; illustrative).
    scans: {
      step: 'handoff', secs: [0, 1, 3, 4], ms: 1400, caption: 'after the pod stops', prompt: 'Watch the letter over station 7 on either format. Replay it or drag through it below.',
      pages: [{ left: 'wpn-d-t-1', mfd: 'tgp-t-1' }, { left: 'wpn-d-t-2', mfd: 'tgp-t-2' }, { left: 'wpn-d-t-T', mfd: 'tgp-t-T' }, { left: 'wpn-d-t-C', mfd: 'tgp-t-C' }],
    },
  },
};

const NO_SLEW: Slew = { step: '', on: '', free: '', done: '', target: [0, 0], start: [0, 0], reach: 0, speed: 0, box: [0, 0, 0, 0] };

// The pod takes about 30 s to initialize (guide p. 525); compressed here.
const POD_MS = 5000;
const POD_WARM = { step: 'pod-power', secs: 30, ms: POD_MS, busy: 'Pod initializing: about 30 seconds in the jet, a few seconds here.', ready: 'The 30 seconds are up: the pod has initialized. Continue.', label: 'Initializing…' };

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
  const scanList = ([] as Scan[]).concat(sc.scans ?? []);
  const scanOf = () => scanList.find(x => x.step === stepId());
  // A scenario with nothing to slew gets a slew no step or page matches.
  const slews = ([] as Slew[]).concat(sc.slew);
  if (!slews.length) slews.push(NO_SLEW);
  const warms = ([] as Warm[]).concat(sc.warm ?? POD_WARM);
  const initialState = (): State => ({ pod: -1, wk: 0, mfd: 'off', left: 'off', ded: 'off', ...sc.initial, x: { ...sc.initial.x }, r: { ...sc.initial.r }, cur: [...slews[0].start] } as State);
  const copy = (s: State): State => ({ ...s, cur: [...s.cur], x: { ...s.x }, r: { ...s.r } });
  /** Apply a step's page changes; `x` adds to the other panels' pages rather than replacing them. */
  /** The dial's position as it was left (`{dial}` in later pages). */
  const dials = ([] as Dial[]).concat(sc.dial ?? []);
  const dialNow = () => dials.find(d => d.step === stepId());
  const dialAt = () => (dials[0] && pos[dials[0].control]) || 'center';
  const fill = (v: string) => v.replace('{dial}', dialAt());
  const apply = (p: Pages) => { const { x, r, ...rest } = p; for (const k of ['mfd', 'left', 'ded'] as const) if (rest[k]) rest[k] = fill(rest[k]!); Object.assign(st, rest); if (x) st.x = { ...st.x, ...x }; if (r) st.r = { ...st.r, ...r }; };
  try { sessionStorage.removeItem(`oversweep:cockpit:${cfg.aircraft}`); } catch { /* storage unavailable */ }
  let pos: Record<string, string> = { ...cfg.initial };
  let st = initialState();
  let step = 0;
  let finished = false;
  let made = new Set<string>();
  /** A long press under way (held, not yet 0.5 s). */
  let longPress: { control: string; timer: ReturnType<typeof setTimeout> } | null = null;
  /** Presses made so far of a repeated move (`times`). */
  let presses: Record<string, number> = {};
  let typed = 0;
  let scanning = false;
  const history: { pos: Record<string, string>; st: State }[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];

  const later = (ms: number, fn: () => void) => { timers.push(setTimeout(fn, reduced.matches ? Math.min(ms, 50) : ms)); };
  const setPositions = (p: Record<string, string>) => dispatchEvent(new CustomEvent('cockpit:set', { detail: { positions: p } }));
  const say = (t: string, retry = false) => { feedback.textContent = t; feedback.classList.toggle('retry', retry); };
  const name = (control: string) => cfg.names[control] ?? control;
  const label = (control: string, to: string) => cfg.labels[`${control}.${to}`] ?? `${name(control)} to ${to}`;
  const instruction = (w: StepDo) => (w.on === 'release' ? `release the ${name(w.control)}` : w.to === 'in' ? `press ${name(w.control)}` : `set the ${label(w.control, w.to)}`);
  const cap = (t: string) => t[0].toUpperCase() + t.slice(1);
  const mk = (w: StepDo) => `${w.control}=${w.to}${w.on === 'release' ? ':release' : ''}`;
  const moves = (s: Step) => [...(s.do ? [s.do] : []), ...(s.also ?? [])];
  const pending = (s: Step) => moves(s).filter(w => !made.has(mk(w)));
  const stepId = () => cfg.steps[step]?.id ?? '';

  /** Slewing: the cursor (or a sensor's picture) moves by hand until it is on the target. The slew in play is this step's, else the last one before it. */
  const stepOf = (id: string) => cfg.steps.findIndex(x => x.id === id);
  const sl = () => slews.find(x => x.step === stepId()) ?? [...slews].reverse().find(x => stepOf(x.step) < step) ?? slews[0];
  const slewLeft = () => sl().display === 'left';
  const dialing = () => !!dialNow() && !finished;
  const slewing = () => stepId() === sl().step && !finished && (slewLeft() ? st.left : st.mfd) === sl().on;
  function indicate() {
    // `freeOnMove`: the `on` page stays until the cursor first leaves its start (e.g. the TGP's CZ appears only once slewed).
    const s = sl(), free = s.freeOnMove && st.cur[0] === s.start[0] && st.cur[1] === s.start[1] ? s.on : s.free;
    const frame = st.scene;
    const right = slewing() && !slewLeft() ? free : st.mfd;
    const left = frame ? `fcr-aim-${frame.id}` : slewing() && slewLeft() ? free : st.left;
    // The hand-slewed position goes only to a page of that slew; other pages carry their own.
    const shown = slewLeft() ? left : right;
    const cursors = [s.on, s.free, s.done].includes(shown) ? { [`${slewLeft() ? 'left' : 'right'}-mfd.display`]: st.cur } : {};
    const pages: Record<string, string> = { 'right-mfd.display': right, 'left-mfd.display': left, 'ded.display': st.ded, ...st.x };
    const readings = { ...st.r };
    const artwork: Record<string, string> = {};
    if (frame) {
      const cue = aimCue(frame);
      const { heading, bank, pitch, range } = frame.aircraft;
      pages['hud.harm-cues'] = cue.id;
      readings['hud.heading'] = ((heading % 360) + 360) % 360 || 360;
      readings['hud.roll'] = bank;
      Object.assign(readings, levelHud(pitch));
      readings['hud.slant-range'] = range;
      artwork['hud.harm-cues'] = renderHudCue(hudFont, cue);
      artwork['left-mfd.display'] = renderMfdPage(mfdDisplay, 'display', aimFcr(frame));
    }
    dispatchEvent(new CustomEvent('cockpit:indicate', { detail: { pages, readings, cursors, artwork } }));
  }
  const keyText = (k: string) => name(k).replace(/ (key|button)$/, '').replace(/ \/.*$/, '');

  /*
   * The RDR CURSOR switch is force-sensing: the cursor moves while it is held, faster the harder it is pushed.
   * `defl` is its deflection (x right/forward, y up, -1..1) from the on-screen joystick (`cockpit:analog`) or, from
   * the keyboard, full deflection on each arm held.
   */
  const defl = { x: 0, y: 0 };
  let raf = 0, last = 0;
  /** Distance from the target, or from the segment target → `along` when the slew accepts a line of targets. */
  function offTarget([x, y]: [number, number]) {
    const [ax, ay] = sl().target, [bx, by] = sl().along ?? sl().target;
    const l2 = (bx - ax) ** 2 + (by - ay) ** 2, t = l2 ? Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / l2)) : 0;
    return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay));
  }
  const stopSlew = () => { cancelAnimationFrame(raf); raf = 0; defl.x = defl.y = 0; };
  function slew(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!slewing() || (!defl.x && !defl.y)) { raf = 0; return; }
    const speed = (d: number) => Math.sign(d) * Math.abs(d) ** 1.5 * sl().speed;
    const [x0, y0, x1, y1] = sl().box;
    st.cur = [Math.min(x1, Math.max(x0, st.cur[0] + speed(defl.x) * dt)), Math.min(y1, Math.max(y0, st.cur[1] - speed(defl.y) * dt))];
    if (offTarget(st.cur) < sl().reach) {
      st.cur = [...sl().target];
      if (slewLeft()) st.left = sl().done; else st.mfd = sl().done;
      stopSlew();
      indicate();
      done(`The ${!sl().cursor && (sl().display === 'left' || sl().on.startsWith('tgp')) ? 'crosshairs are' : 'cursor is'} on the ${sl().what ?? 'radar'}.`);
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
    confirm.hidden = finished || !s.confirm || moves(s).length > 0 || !!s.type || slewing() || scanning || (dialing() && !dialNow()!.ok.includes(dialAt()));
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
    else if (slewing()) say(`Steer the ${!sl().cursor && (sl().display === 'left' || sl().on.startsWith('tgp')) ? 'crosshairs' : 'cursor'} onto the ${sl().what ?? 'radar'}: press and drag on the RDR CURSOR switch.`);
    else if (dialing()) say(dialNow()!.ok.includes(dialAt()) ? `${dialNow()!.done} Check the indications, then continue.` : dialNow()!.prompt);
    else if (scanning) say(scanOf()?.prompt ?? 'Watch the HAD: each scan refines the position. Replay it or drag through it below.');
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
      const at = step, next = cfg.steps[step + 1]?.do, held = cfg.steps[step].do;
      // A press whose next step is letting go of the same switch moves on at once, so the release is not missed.
      if (next?.on === 'release' && held && next.control === held.control && next.to === held.to) { go(step + 1); return; }
      later(matchMedia('(max-width: 48rem)').matches ? 1400 : 800, () => { if (step === at && !finished) go(step + 1); });
      return;
    }
    confirm.textContent = cfg.steps[step].confirm!;
    confirm.disabled = false;
    confirm.hidden = false;
    say(`${text} Check the indications, then continue.`);
  }
  function go(to: number) {
    // A replay or scrub is a preview. Carry the completed scene forward.
    const motion = scanOf()?.motion;
    if (motion && !player.hidden) st.scene = motion.keyframes[motion.keyframes.length - 1].frame;
    timers.splice(0).forEach(clearTimeout);
    stopSlew(); stopPlayer();
    if (to >= cfg.steps.length) { finished = true; render(); complete.focus(); return; }
    history[to] = { pos: { ...pos }, st: copy(st) };
    step = to; made = new Set(); presses = {}; typed = 0;
    enterStep();
    render();
    if (st.pod > 0) warmUp();
    if (scanOf()) playScans();
  }

  function enterStep() {
    const e = sc.enter?.[stepId()];
    if (e) { apply(e); indicate(); }
    // A slew starts from its own place.
    const s = slews.find(x => x.step === stepId());
    if (s) st.cur = [...s.start];
  }

  /* ---------------------------------------------------------------- player */
  const player = one<HTMLElement>('[data-player]');
  const playBtn = one<HTMLButtonElement>('[data-play]');
  const scrub = one<HTMLInputElement>('[data-scrub]');
  const clock = one<HTMLElement>('[data-clock]');
  let t = 0, frame = 0, lastFrame = 0;
  let sceneStart: SceneFrame | undefined;
  const mmss = (v: number) => `${Math.floor(v / 60)}:${String(Math.floor(v % 60)).padStart(2, '0')}`;
  function seek(v: number) {
    const scan = scanOf()!;
    const { secs, caption } = scan, end = secs[secs.length - 1];
    t = Math.max(+scrub.min, Math.min(end, v));
    if (scan.motion) {
      st.scene = sampleScene(scan.motion, t, sceneStart);
      indicate();
    } else {
      let k = 0;
      secs.forEach((x, i) => { if (x <= t) k = i; });
      const page = scan.pages[k], display = scan.display === 'left' ? 'left' : 'mfd';
      if (typeof page !== 'string') { apply(page); indicate(); }
      else if (st[display] !== page) { st[display] = page; indicate(); }
    }
    scrub.value = String(t);
    clock.textContent = `${mmss(t)} / ${mmss(end)} ${caption}`;
    scrub.setAttribute('aria-valuetext', `${mmss(t)} ${caption}`);
  }
  function setPlaying(on: boolean) {
    cancelAnimationFrame(frame);
    playBtn.dataset.state = on ? 'pause' : t >= +scrub.max ? 'replay' : 'play';
    playBtn.setAttribute('aria-label', on ? 'Pause' : t >= +scrub.max ? 'Replay' : 'Play');
    if (!on) return;
    const { secs, ms, motion } = scanOf()!;
    const duration = motion ? ms : (secs.length - 1) * ms;
    const rate = (+scrub.max - +scrub.min) / duration;
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
    const { secs, motion } = scanOf()!;
    sceneStart = st.scene;
    scrub.min = String(motion ? secs[0] : 0);
    scrub.max = String(secs[secs.length - 1]);
    scrub.step = motion ? '0.01' : '1';
    player.hidden = false;
    scanning = true; render();
    seek(+scrub.min);
    if (reduced.matches) { seek(+scrub.max); scanning = false; setPlaying(false); render(); return; }
    setPlaying(true);
  }
  playBtn.addEventListener('click', () => {
    if (player.hidden) return;
    if (playBtn.dataset.state === 'pause') { setPlaying(false); return; }
    if (t >= +scrub.max) seek(+scrub.min);
    setPlaying(true);
  });
  scrub.addEventListener('input', () => {
    if (player.hidden) return;
    cancelAnimationFrame(frame); seek(+scrub.value); setPlaying(false);
    if (scanning && t >= +scrub.max) { scanning = false; render(); }
  });

  /** The pod's warm-up: the step that powers it counts the wait down on its button, then lets the reader on. */
  function warmUp() {
    const warm = warms[st.wk];
    const wait = stepId() === warm.step;
    if (wait) { confirm.hidden = false; confirm.disabled = true; say(warm.busy); }
    const tick = () => {
      // Shown in the jet's seconds, counted down in the compressed time.
      const left = Math.ceil((st.pod / warm.ms) * warm.secs);
      if (wait) confirm.textContent = `${warm.label} ${warm.secs >= 60 ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : `${left} s`}`;
      if (st.pod <= 0) {
        if (warm.after) { apply(warm.after); indicate(); }
        if (wait) { confirm.disabled = false; confirm.textContent = cfg.steps[step].confirm ?? 'Continue'; say(warm.ready); }
        return;
      }
      const step5 = warm.ms / 6;
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
    const wi = warms.findIndex(w => w.step === id);
    if (wi >= 0) { st.wk = wi; st.pod = warms[wi].ms; warmUp(); return; }
    done();
  }

  addEventListener('cockpit:change', e => {
    const d = (e as CustomEvent<{ aircraft: string; panel: string; control: string; position: string; phase: 'press' | 'release' }>).detail;
    if (d.aircraft !== cfg.aircraft || finished) return;
    const key = `${d.panel}.${d.control}`;
    // The dial step's knob: every position shows its page; the step is done while it is in the wanted band.
    if (dialing() && key === dialNow()!.control) {
      if (d.phase === 'release') return;
      pos[key] = d.position;
      const page = dialNow()!.page.replace('{pos}', d.position);
      if (dialNow()!.display === 'left') st.left = page; else st.mfd = page;
      indicate();
      const ok = dialNow()!.ok.includes(d.position), near = !ok && dialNow()!.seen.includes(d.position);
      confirm.hidden = !ok;
      if (ok) { confirm.textContent = cfg.steps[step].confirm ?? 'Confirm'; confirm.disabled = false; }
      say(ok ? `${dialNow()!.done} Check the indications, then continue.` : near ? dialNow()!.near : dialNow()!.prompt, near);
      return;
    }
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
    // Let go before a long press counted (TMS forward for a spotlight): in the jet that was a short press.
    if (longPress && d.phase === 'release' && key === longPress.control) {
      clearTimeout(longPress.timer); longPress = null;
      say('That was a short press: in the jet it bugs the contact in SAM. Hold TMS forward for the spotlight, then let go on the contact.', true);
      indicate();
      return;
    }
    // A release reports the position the switch springs back to; a release step means letting go from `to`.
    const want = pending(s).find(w => w.control === key && (w.on ?? 'press') === d.phase && (d.phase === 'release' ? before === w.to : w.to === d.position));
    if (want) {
      const need = want.times ?? 1;
      if (need > 1) {
        const n = (presses[mk(want)] = (presses[mk(want)] ?? 0) + 1);
        if (n < need) {
          apply(sc.after[`${stepId()}-${n}`] ?? {});
          indicate();
          say(`Pressed ${n} of ${need}: ${instruction(want)} again.`);
          return;
        }
      }
      // A press whose next step lets go of the same switch is a long press (over 0.5 s, p. 84): it counts once held.
      const next = cfg.steps[step + 1]?.do;
      if (d.phase === 'press' && next?.on === 'release' && next.control === want.control && next.to === want.to) {
        const at = step;
        longPress = { control: key, timer: setTimeout(() => { longPress = null; if (step === at && !finished && pos[key] === want.to) acted(want); }, 500) };
        indicate();
        return;
      }
      acted(want);
      return;
    }
    // Springing back from a momentary press, or a press that completes nothing.
    if (d.phase === 'release') { indicate(); return; }
    // Pressed again on a step done by letting go (the earlier press was a short click): hold it, then let go.
    const hold = pending(s).find(w => w.on === 'release' && w.control === key && w.to === d.position);
    if (hold) { indicate(); say(`Now ${instruction(hold)}.`); return; }
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
    step = to; made = new Set(); presses = {}; typed = 0; scanning = false;
    enterStep();
    render();
    if (scanOf()) playScans();
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
