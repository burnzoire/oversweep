import type { ControlDef, PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C HUD control panel (right console), DCS.
 *
 * Reference: the guide's p. 94 "HUD Control Panel" cockpit image (439 x 196
 * JPEG, `pdfimages -j -f 94 -l 94`, image 002), rectified on the four DZUS
 * fasteners. Values below are rectified reference pixels.
 *
 * Eight toggles in two rows of four, on columns mirrored about the panel
 * centre (x 219.4, midway between the DZUS columns): 86, 176, 263, 353
 * (bushing centres measured 86/87, 176, 263, 353); rows y 49 and 154.
 */
const PX = 3.0;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 94–97';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
const COL = [86, 176, 263, 353] as const;
const ROW = [49, 154] as const;
const DZUS = { l: 19.85, r: 418.9, t: 43, b: 152.2 };

/**
 * Corner notches round the DZUS (panel-edge, rectified px): the inner side edges measured 33.5–35.5 (left) and
 * 398.5–402.5 (right), drawn mirrored about the centre at x 36.9 and 401.9; the notch floors measured 58.5–59.5 (top)
 * and 134.5–135.5 (bottom), drawn 16.6 px from their DZUS rows at y 59.6 and 135.6. Inner radius 10 px.
 */
const NX = [36.9, 401.9], NY = [59.6, 135.6], R = 10;
const OUT = { x0: 1, x1: 438, y0: 1, y1: 195 };
const FACE = `M${NX[0]} ${OUT.y0}H${NX[1]}V${NY[0] - R}Q${NX[1]} ${NY[0]} ${NX[1] + R} ${NY[0]}H${OUT.x1}V${NY[1]}H${NX[1] + R}Q${NX[1]} ${NY[1]} ${NX[1]} ${NY[1] + R}V${OUT.y1}` +
  `H${NX[0]}V${NY[1] + R}Q${NX[0]} ${NY[1]} ${NX[0] - R} ${NY[1]}H${OUT.x0}V${NY[0]}H${NX[0] - R}Q${NX[0]} ${NY[0]} ${NX[0]} ${NY[0] - R}Z`;

const three = (ids: [string, string, string], labels: [string, string, string]) =>
  ids.map((id, i) => ({ id, label: labels[i], hold: 'stable' as const }));
const toggle = (id: string, name: string, positions: ReturnType<typeof three>, initial: string, description: string, extra: Partial<ControlDef> = {}): ControlDef =>
  ({ id, name, type: 'toggle', travel: 'vertical', positions, initial, description, source: src, ...extra });
const lock = { latched: true, protections: [{ kind: 'latch' as const, verified: false, note: 'A lever-lock slot in the bushing marks it as a lever-lock toggle, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }] };

export const hudControl: PanelSpec = {
  id: 'hud-control',
  title: 'HUD control panel',
  canvas: [mm(439), mm(196)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 94,
    image: 'p. 94 "HUD Control Panel" cockpit image, 439 x 196 px',
    rectify: 'python3 -I scripts/panel-trace.py p94-002.jpg <scratch> 20,45.5 419.2,40.5 19.7,153.7 418.6,150.8 (DZUS centres)',
    pxPerMm: PX,
    scale: 'DZUS heads (about 25 px across) match the shared 8.5 mm head at 3.0 px/mm; the DZUS columns are then 133 mm apart, as on AIR COND, and the plate 5.75 in wide.',
    shown: { scales: 'off', fpm: 'off', 'ded-data': 'off', 'depr-ret': 'off', velocity: 'cas', alt: 'auto', brt: 'auto-brt', test: 'off' },
    unresolved: [
      'The plate\'s top, bottom and left edges are at or past the crop; they are drawn at the image edges (5.75 x 2.6 in).',
      'The DEPR RET OFF legend is hidden under the lever cap in the image; it is drawn under the switch on the line of the other OFF legends.',
      'The guide marks the Altitude switch and the Test switch as not implemented (N/I) and does not say whether TEST STEP is momentary, so all three positions are drawn as stable.',
      'The VV/VAH and ATT/FPM levers are the square-paddle lever-lock (as AIR REFUEL); DEPR RET is the domed lever-lock; the other five are plain ball toggles. Levers are drawn square-on.',
      'The two Phillips screws are drawn as the shared small screw.',
    ],
  },
  plate: [
    { d: path(`M${OUT.x0 + 4} ${OUT.y0}H${OUT.x1 - 4}Q${OUT.x1} ${OUT.y0} ${OUT.x1} ${OUT.y0 + 4}V${OUT.y1 - 4}Q${OUT.x1} ${OUT.y1} ${OUT.x1 - 4} ${OUT.y1}H${OUT.x0 + 4}Q${OUT.x0} ${OUT.y1} ${OUT.x0} ${OUT.y1 - 4}V${OUT.y0 + 4}Q${OUT.x0} ${OUT.y0} ${OUT.x0 + 4} ${OUT.y0}Z`) },
    { d: path(FACE), raised: true },
  ],
  engraving: [
    // Vertical HUD title.
    L([13.5, 80], 'H', 14, 10), L([13.5, 100], 'U', 14, 10), L([13.5, 120], 'D', 14, 10),
    // Top row.
    L([COL[0], 15], 'VV/VAH', 10, 42), L([121.5, 51.7], 'VAH', 10, 23), L([COL[0], 81.7], 'OFF', 10, 21),
    L([COL[1], 15], 'ATT/FPM', 10, 50), L([213, 51.7], 'FPM', 10, 23), L([COL[1], 81.7], 'OFF', 10, 21),
    L([267.5, 15], 'DED DATA', 10, 55), L([306, 60], 'PFL', 10, 22), L([COL[2] + 3, 81.7], 'OFF', 10, 21),
    L([351, 15], 'DEPR RET', 10, 48), L([389, 26.7], 'STBY', 10, 22), L([386.7, 50], 'PRI', 10, 17), L([COL[3], 81.7], 'OFF', 10, 21),
    // Bottom row.
    L([87.5, 120], 'CAS', 10, 21), L([121.5, 153.3], 'TAS', 10, 23), L([86.7, 181.7], 'GND SPD', 10, 47),
    L([COL[1], 107.3], 'ALT', 10, 22), L([COL[1], 121.7], 'RADAR', 10, 38), L([215, 153.3], 'BARO', 10, 30), L([COL[1], 181.7], 'AUTO', 10, 30),
    L([266, 121.7], 'DAY', 10, 22), L([306, 146.7], 'AUTO', 10, 28), L([305, 159.3], 'BRT', 10, 20), L([264, 181.7], 'NIGHT', 10, 32),
    L([355, 107.3], 'TEST', 10, 26), L([356, 121.7], 'STEP', 10, 28), L([386.7, 153.3], 'ON', 10, 13), L([355, 181.7], 'OFF', 10, 24),
    // Printed cross between the rows.
    { kind: 'path', pen: 'fine', d: path('M218 98.3H225.4M221.7 94.6V102') },
  ],
  placements: [
    { component: 'dzus', at: pt(DZUS.l, DZUS.t) }, { component: 'dzus', at: pt(DZUS.r, DZUS.t) },
    { component: 'dzus', at: pt(DZUS.l, DZUS.b) }, { component: 'dzus', at: pt(DZUS.r, DZUS.b) },
    { component: 'screw-small', at: pt(310, 31.7) }, { component: 'screw-small', at: pt(133.3, 131.7) },
    { component: 'toggle-large-square', control: 'scales', at: pt(COL[0], ROW[0]) },
    { component: 'toggle-large-square', control: 'fpm', at: pt(COL[1], ROW[0]) },
    { component: 'toggle-large', control: 'ded-data', at: pt(COL[2], ROW[0]) },
    { component: 'toggle-large-lock', control: 'depr-ret', at: pt(COL[3], ROW[0]) },
    { component: 'toggle-large', control: 'velocity', at: pt(COL[0], ROW[1]) },
    { component: 'toggle-large', control: 'alt', at: pt(COL[1], ROW[1]) },
    { component: 'toggle-large', control: 'brt', at: pt(COL[2], ROW[1]) },
    { component: 'toggle-large', control: 'test', at: pt(COL[3], ROW[1]) },
  ],
  controls: [
    toggle('scales', 'Scales switch', three(['vv-vah', 'vah', 'off'], ['VV/VAH', 'VAH', 'OFF']), 'off',
      'Shows or removes the analog scales. VV/VAH: vertical velocity, velocity, altitude and heading scales; with the flight path marker shown, the bank angle indicator replaces the roll indicator. VAH: velocity, altitude and heading scales. OFF: no scales, only the digital readouts.', lock),
    toggle('fpm', 'Flight path marker switch', three(['att-fpm', 'fpm', 'off'], ['ATT/FPM', 'FPM', 'OFF']), 'off',
      'ATT/FPM: attitude bars, flight path marker and steering cue. FPM: flight path marker and steering cue, no attitude bars. OFF: none of them.', lock),
    toggle('ded-data', 'DED/PFLD switch', three(['ded-data', 'pfl', 'off'], ['DED DATA', 'PFL', 'OFF']), 'off',
      'DED DATA: removes the roll indicator and repeats the DED in the lower HUD. PFL: removes the roll indicator and repeats the pilot fault list. OFF: shows the roll indicator.'),
    toggle('depr-ret', 'Depressible reticle switch', three(['stby', 'pri', 'off'], ['STBY', 'PRI', 'OFF']), 'off',
      'STBY: the standby reticle and its depression setting, all other HUD symbols removed. PRI: the primary reticle and its depression setting, other symbols kept. OFF: no reticle.', lock),
    toggle('velocity', 'Velocity switch', three(['cas', 'tas', 'gnd-spd'], ['CAS', 'TAS', 'GND SPD']), 'cas',
      'Selects the velocity scale: calibrated (C), true (T) or ground speed (G). In ground speed the heading scale shows ground track. The HUD reverts to CAS in dogfight mode or with the gear down.'),
    toggle('alt', 'Altitude switch', three(['radar', 'baro', 'auto'], ['ALT RADAR', 'BARO', 'AUTO']), 'auto',
      'Selects the HUD altitude source: radar, barometric or automatic. Not implemented in DCS.'),
    toggle('brt', 'Brightness control switch', three(['day', 'auto-brt', 'night'], ['DAY', 'AUTO BRT', 'NIGHT']), 'auto-brt',
      'DAY: day brightness. AUTO BRT: brightness set from ambient light (not implemented in DCS). NIGHT: night brightness.'),
    toggle('test', 'Test switch', three(['step', 'on', 'off'], ['TEST STEP', 'ON', 'OFF']), 'off',
      'HUD test. Not implemented in DCS.'),
  ],
  indicators: [],
};
