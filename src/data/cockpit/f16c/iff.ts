import type { ControlDef, PanelSpec, Pt } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C IFF control panel (left console), DCS.
 *
 * Reference: the guide's p. 67 "IFF Control Panel" image (447 x 285 JPEG,
 * extracted with `pdfimages -j -f 67 -l 67`, image 013), rectified on its four
 * DZUS fasteners (see `source.rectify`). Values below are rectified reference
 * pixels, converted to mm by `tracer`.
 */
const PX = 3.3;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 67–68';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

/** Pivots (rectified px): knobs on their leaders' centre, toggles between their position legends. */
const MASTER: Pt = [98.5, 79], CI: Pt = [363, 79], M4: Pt = [232, 77], ENABLE: Pt = [74, 213], REPLY: Pt = [313.5, 214], MONITOR: Pt = [384, 214];
/** MODE 1 and MODE 3 code wheels: windows evenly 33.8 px apart, thumb tabs 42 px below. */
const WHEELS = ['mode-1-1', 'mode-1-2', 'mode-3-1', 'mode-3-2'] as const;
const wheelX = (k: number) => 149 + 33.8 * k, WHEEL_Y = 189;
const SHOWN = ['0', '0', '4', '0'];
/** Octal code digits, top to bottom as they pass under the thumb (rolling the tab up counts up). */
// Wheel steps carry a nominal angle (45° a digit); only their order is drawn.
const digits = Array.from({ length: 8 }, (_, i) => String(7 - i)).map((d, i) => ({ id: d, label: d, hold: 'stable' as const, angle: i * 45 }));
const wheel = (id: string, k: number): ControlDef => ({
  id, name: `${k < 2 ? 'MODE 1' : 'MODE 3'} code wheel, digit ${(k % 2) + 1}`, type: 'rotary', travel: 'vertical', cyclic: true,
  positions: digits, initial: SHOWN[k],
  description: k < 2
    ? 'Sets one digit of the Mode 1 code when the C & I knob is at BACK UP. (Not implemented in DCS.)'
    : 'Sets one of the first two digits of the Mode 3 code when the C & I knob is at BACK UP; the third and fourth digits are set to zero inside the set, so only codes ending in 00 can be entered here. (Not implemented in DCS.)',
  source: src,
});

export const iff: PanelSpec = {
  id: 'iff',
  title: 'IFF panel',
  canvas: [mm(456), mm(285)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 67,
    image: 'p. 67 "IFF Control Panel" image, 447 x 285 px',
    rectify: 'python3 -I scripts/panel-trace.py <p67-013.png> <scratch> 17,35 431.5,37.5 17,244 439.5,247.5 456 285',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s heads measure 28 px across, giving 3.3 px/mm.',
    shown: { master: 'norm', 'm4-code': 'ab', 'c-and-i': 'ufc', enable: 'm1-m3', 'mode-1-1': '0', 'mode-1-2': '0', 'mode-3-1': '4', 'mode-3-2': '0', reply: 'a', monitor: 'audio' },
    unresolved: [
      'C & I is the shared round knob of the AUDIO 1 MSL knob (same 10 mm size; Nathan, 2026-11-20).',
      'The MASTER detents are taken from where the legend leaders meet the knob (OFF −20°, STBY 20°, LOW 55°, NORM 90°, EMER 125°); the C & I detents the same way (±18°).',
      'Toggle positions shown are read from the levers\' lean through the camera\'s perspective: ENABLE leans to M1/M3, MONITOR to AUDIO, M-4 CODE and REPLY stand near the middle (A/B and A).',
      'M-4 CODE and REPLY are drawn as lever-lock switches with domed caps (lock slot seen in the M-4 CODE bushing); the REPLY bushing is hidden under its cap. MONITOR and ENABLE are plain toggles in red grommets.',
      'The code wheels are drawn with octal digits 0–7 and wrap round; the guide does not list their range, and whether rolling a tab up counts up or down is not shown.',
      'The cut-out edges round the DZUS fasteners measure 15–17 px from the fastener centres (x 32 and 418) and are drawn as the shared corner notch, mirrored; the top and bottom edges of the notches are under the fasteners\' shading.',
      'The image is cropped at the top and left: the plate\'s top edge is drawn at the crop and its left edge mirrored from the right edge (x 446.5).',
      'The MODE 1/MODE 3 housing is drawn as an outline on the plate; its height above the plate is not shown.',
      'The IFF functions on this panel, other than C & I, are not implemented in DCS (N/I in the guide).',
    ],
  },
  plate: [
    { d: path('M5.5 0H446.5V279.5H5.5Z') },
  ],
  engraving: [
    // MASTER.
    L([95.5, 14], 'MASTER', 11, 45),
    L([62, 33], 'OFF', 10, 20), L([134.5, 33], 'STBY', 10, 29), L([157.5, 52], 'LOW', 10, 25), L([161, 78], 'NORM', 10, 30), L([161.5, 105], 'EMER', 10, 29),
    { kind: 'path', pen: 'medium', d: path('M73 33H81L86 46M120 33H114L109 46M144 52H137L128 58M145 78H131M146 105H137L128 98') },
    // M-4 CODE.
    L([235, 14], 'M-4 CODE', 11, 54),
    L([232, 43], 'ZERO', 10, 30), L([276, 77], 'A/B', 10, 21), L([234, 111], 'HOLD', 10, 29),
    { kind: 'path', pen: 'fine', d: path('M283 110H291M287 106V114') },
    // C & I.
    L([358, 14], 'C & I', 11, 29),
    L([321.5, 32], 'BACK', 9.5, 29), L([314.5, 44], 'UP', 9.5, 15), L([393, 32], 'UFC', 10, 22),
    { kind: 'path', pen: 'medium', d: path('M339 32H345L350 45M381 32H375L372 38V46') },
    // Vertical IFF.
    L([17.5, 113], 'I', 19, 3), L([17.5, 137], 'F', 19, 11), L([17.5, 160], 'F', 19, 11),
    // ENABLE.
    L([73.5, 158], 'ENABLE', 11, 46),
    L([73.5, 181], 'M3/MS', 9.5, 33), L([108.5, 211], 'OFF', 10, 17), L([74.5, 247], 'M1/M3', 9.5, 29),
    // MODE 1 / MODE 3 brackets and the code wheel housing.
    L([163, 141], 'MODE 1', 11, 36), L([235, 141], 'MODE 3', 11, 42),
    { kind: 'path', pen: 'medium', d: path('M131 152V141H141M186 141H196V152M200.5 152V141H209M261 141H270V152') },
    { kind: 'path', pen: 'heavy', d: path('M132 151H269Q275 151 275 157V246Q275 252 269 252H132Q126 252 126 246V157Q126 151 132 151Z') },
    { kind: 'path', pen: 'fine', d: path('M134 155H267Q271 155 271 159V244Q271 248 267 248H134Q130 248 130 244V159Q130 155 134 155Z') },
    // MODE 4.
    L([352, 141], 'MODE 4', 11, 44),
    { kind: 'path', pen: 'medium', d: path('M290 152V141H327M377 141H411V152') },
    L([312.5, 163], 'REPLY', 11, 37), L([382, 163], 'MONITOR', 11, 49),
    L([314, 179.5], 'B', 9.5), L([344, 211], 'A', 9.5), L([313, 249], 'OUT', 10, 21),
    L([384, 179.5], 'AUDIO', 9.5, 32), L([384, 249], 'OUT', 10, 21),
  ],
  placements: [
    { component: 'dzus', at: pt(17, 35), cut: 'up-left' },
    { component: 'dzus', at: pt(435, 35), cut: 'up-right' },
    { component: 'dzus', at: pt(17, 244), cut: 'down-left' },
    { component: 'dzus', at: pt(435, 244), cut: 'down-right' },
    { component: 'screw', at: pt(171, 19) },
    { component: 'screw', at: pt(61, 132) },
    { component: 'screw', at: pt(395, 118) },
    { component: 'screw', at: pt(343, 253) },
    { component: 'rotary-bar-broad', control: 'master', at: pt(...MASTER) },
    { component: 'knob-round', control: 'c-and-i', at: pt(...CI) },
    { component: 'toggle-large-lock', control: 'm4-code', at: pt(...M4) },
    { component: 'toggle-large', control: 'enable', at: pt(...ENABLE) },
    { component: 'toggle-large-lock', control: 'reply', at: pt(...REPLY) },
    { component: 'toggle-large', control: 'monitor', at: pt(...MONITOR) },
    ...WHEELS.map((id, k) => ({ component: 'code-wheel' as const, control: id, at: pt(wheelX(k), WHEEL_Y), window: [mm(18), mm(25)] as [number, number], cap: mm(11.5), width: mm(8), tab: { at: pt(0, 42), size: [mm(17.5), mm(12.5)] as [number, number] } })),
  ],
  controls: [
    {
      id: 'master', name: 'MASTER knob', type: 'rotary',
      positions: [
        { id: 'off', label: 'OFF', angle: -20, hold: 'stable' },
        { id: 'stby', label: 'STBY', angle: 20, hold: 'stable' },
        { id: 'low', label: 'LOW', angle: 55, hold: 'stable' },
        { id: 'norm', label: 'NORM', angle: 90, hold: 'stable' },
        { id: 'emer', label: 'EMER', angle: 125, hold: 'stable' },
      ],
      initial: 'norm',
      description: 'Selects how the APX-113 AIFF operates, whatever the C & I knob is set to. OFF: transponder and interrogator off. STBY: transponder replies inhibited, interrogator works. LOW/NORM: transponder and interrogator working. EMER: the transponder replies with the emergency code. (Not implemented in DCS.)',
      source: src,
    },
    {
      id: 'm4-code', name: 'M-4 CODE switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'zero', label: 'ZERO', hold: 'momentary', spring: 'ab' },
        { id: 'ab', label: 'A/B', hold: 'stable' },
        { id: 'hold', label: 'HOLD', hold: 'momentary', spring: 'ab' },
      ],
      initial: 'ab',
      protections: [{ kind: 'latch', verified: false, note: 'Drawn as a lever-lock switch (lock slot in the bushing). It moves with a plain click; the lock is not simulated.' }],
      description: 'Looks after the Mode 4 crypto codes. A/B (spring-loaded here): normal Mode 4 replies. ZERO (momentary): erases the codes. HOLD (momentary), before MASTER goes to OFF: keeps the codes, which are otherwise erased at power-off. (Not implemented in DCS.)',
      source: src,
    },
    {
      id: 'c-and-i', name: 'C & I knob', type: 'rotary',
      positions: [
        { id: 'backup', label: 'BACK UP', angle: -18, hold: 'stable' },
        { id: 'ufc', label: 'UFC', angle: 18, hold: 'stable' },
      ],
      initial: 'ufc',
      description: 'Sets how the pilot controls the IFF and UHF radio. UFC: primary IFF functions and the UHF radio from the upfront controls (ICP and DED). BACK UP: all IFF functions from this panel, and the UHF radio from the UHF backup panel.',
      source: src,
    },
    {
      id: 'enable', name: 'ENABLE switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'm3-ms', label: 'M3/MS', hold: 'stable' },
        { id: 'off', label: 'OFF', hold: 'stable' },
        { id: 'm1-m3', label: 'M1/M3', hold: 'stable' },
      ],
      initial: 'm1-m3',
      description: 'With C & I at BACK UP, picks the modes enabled. M3/MS: Mode 3/A and Mode S. OFF: Modes 1, 3/A, 4 and S off. M1/M3: Modes 1 and 3/A. (Not implemented in DCS.)',
      source: src,
    },
    ...WHEELS.map((id, k) => wheel(id, k)),
    {
      id: 'reply', name: 'MODE 4 REPLY switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [
        { id: 'b', label: 'B', hold: 'stable' },
        { id: 'a', label: 'A', hold: 'stable' },
        { id: 'out', label: 'OUT', hold: 'stable' },
      ],
      initial: 'a',
      protections: [{ kind: 'latch', verified: false, note: 'Drawn as a lever-lock switch like M-4 CODE (same domed cap). It moves with a plain click; the lock is not simulated.' }],
      description: 'With C & I at BACK UP, sets how Mode 4 interrogations are answered. A: with the first code. B: with the second code. OUT: no Mode 4 replies. (Not implemented in DCS.)',
      source: src,
    },
    {
      id: 'monitor', name: 'MODE 4 MONITOR switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'audio', label: 'AUDIO', hold: 'stable' },
        { id: 'out', label: 'OUT', hold: 'stable' },
      ],
      initial: 'audio',
      description: 'With C & I at BACK UP, AUDIO sounds a tone whenever the transponder sends a Mode 4 reply; OUT silences it. (Not implemented in DCS.)',
      source: src,
    },
  ],
  indicators: [],
};
