import type { IndicatorDef, LampCell, PanelSpec, Placement } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C right eyebrow warning lights (glareshield, right of the HUD), DCS.
 *
 * Reference: the guide's p. 46 cockpit image (440 x 461 JPEG, extracted with
 * `pdfimages -j -f 46 -l 46`), turned 38° so the legends read level, then
 * rectified on the outer corners of the row of five light modules:
 *   python3 -I scripts/panel-trace.py <p46 turned 38°> <out> 72.5,225 587.5,300 65,325 582.5,392.5
 * and cropped at (55, 230). Measurements below are in that crop's pixels and stored in mm.
 */
const PX = 4.04;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 46–47';

const W = mm(96), H = mm(107), I = 1.3;
const lens = (half?: 'top' | 'bottom'): LampCell['rect'] => {
  const h = +(H - 2 * I).toFixed(2), w = +(W - 2 * I).toFixed(2);
  return half === 'top' ? [I, I, w, +(h / 2 - 0.3).toFixed(2)] : half === 'bottom' ? [I, +(I + h / 2 + 0.3).toFixed(2), w, +(h / 2 - 0.3).toFixed(2)] : [I, I, w, h];
};
const CAP = 4.4;
/** Each module: a split lens, either two lamps (top, bottom) or one lamp behind both halves. */
type Lamp = [id: string, legend: string, width: number, description: string];
const MODULES: (Lamp[] | [id: string, legend: string, widths: [number, number], description: string])[] = [
  [
    ['eng-fire', 'ENG FIRE', 76, 'Fire is detected in the engine compartment.'],
    ['engine', 'ENGINE', 65, 'Engine RPM and FTIT signals show an overtemperature, flameout or stagnation: RPM below 60%, or FTIT above 1,100 °C for 2 seconds or more. Goes out when the condition clears.'],
  ],
  ['hyd-oil-press', 'HYD/OIL\nPRESS', [77, 52], 'Engine oil pressure has been below 10 psi for more than 30 seconds (goes out above 20 psi), or hydraulic system A or B is below 1,000 psi (goes out when both are above 1,000 psi).'],
  [
    ['flcs', 'FLCS', 48, 'A malfunction is detected in the FLCS processors, power supplies, input commands or sensors, or the angle of attack or air data inputs; the FLCS built-in test has failed; or the leading-edge flaps are locked.'],
    ['dbu-on', 'DBU ON', 72, 'The FLCS has switched to digital backup (DBU) by itself, or DBU was selected on the FLT CONTROL panel.'],
  ],
  ['to-ldg-config', 'TO/LDG\nCONFIG', [79, 73], 'Below 10,000 feet and 190 knots, descending faster than 250 feet per minute (or with weight on wheels), with the landing gear not down and locked or the trailing-edge flaps not fully down. The landing gear warning horn sounds intermittently with it.'],
  [
    ['canopy', 'CANOPY', 78, 'The canopy is not down and locked.'],
    ['oxy-low', 'OXY LOW', 82, 'The backup oxygen system is depleted (below 5 psi). Also lights for 10 seconds during an OBOGS BIT, and stays on if the BIT finds a fault.'],
  ],
];

const placements: Placement[] = [];
const indicators: IndicatorDef[] = [];
const light = (id: string, legend: string, description: string) =>
  indicators.push({ id, name: `${legend.replace('\n', ' ')} warning light`, type: 'lamp', colour: 'red', description, source: src });
MODULES.forEach((m, i) => {
  const at = pt(15 + 102.5 * i, 30);
  if (typeof m[0] === 'string') {
    const [id, legend, widths, description] = m as [string, string, [number, number], string];
    placements.push({ component: 'lamp-module', at, size: [W, H], lamps: [{ indicator: id, legend, rect: lens(), cap: CAP, halves: true, width: widths.map(mm) }] });
    light(id, legend, description);
  } else {
    const [top, bottom] = m as Lamp[];
    placements.push({ component: 'lamp-module', at, size: [W, H], lamps: [
      { indicator: top[0], legend: top[1], rect: lens('top'), cap: CAP, width: mm(top[2]) },
      { indicator: bottom[0], legend: bottom[1], rect: lens('bottom'), cap: CAP, width: mm(bottom[2]) },
    ] });
    light(top[0], top[1], top[3]);
    light(bottom[0], bottom[1], bottom[3]);
  }
});

export const rightEyebrow: PanelSpec = {
  id: 'right-eyebrow',
  title: 'Right eyebrow warning lights',
  canvas: [mm(545), mm(150)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 46,
    image: 'p. 46 "Right Eyebrow Lights" cockpit image, 440 x 461 px',
    rectify: 'turn 38°, then python3 -I scripts/panel-trace.py <turned> <out> 72.5,225 587.5,300 65,325 582.5,392.5; crop at (55, 230)',
    pxPerMm: PX,
    scale: 'No fasteners are visible, so the scale is assumed: a module pitch of 1 in (102.5 px).',
    shown: {},
    unresolved: [
      'The strip is seen steeply from below and to the left, so module height and the gap between modules are estimated after rectifying.',
      'The scale is assumed, not measured.',
      'The housing outline is simplified to a plain strip.',
      'HYD/OIL PRESS and TO/LDG CONFIG are each one warning across both halves of the lens, as the guide describes them.',
    ],
  },
  plate: [{ d: path('M6 2H539Q543 2 543 6V144Q543 148 539 148H6Q2 148 2 144V6Q2 2 6 2Z') }],
  engraving: [],
  placements,
  controls: [],
  indicators,
};
