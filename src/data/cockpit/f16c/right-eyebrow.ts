import type { IndicatorDef, LampCell, PanelSpec, Placement } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C right eyebrow warning lights (glareshield, right of the HUD), DCS.
 *
 * Reference: the guide's p. 46 cockpit image (440 x 461 JPEG, extracted with
 * `pdfimages -j -f 46 -l 46`), traced unrectified. The five modules run down and
 * right along the glareshield; each is placed at its centre in the image and turned
 * 45° with the strip, drawn square-on at full size. Module size and legend widths
 * were measured with the image turned 38° and rectified on the row's outer corners
 * (python3 -I scripts/panel-trace.py <p46 turned 38°> <out> 72.5,225 587.5,300 65,325 582.5,392.5).
 */
const PX = 4.04;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 46–47';

const W = mm(96), H = mm(107), I = 1.3;
const SLOPE = 45;                // strip angle, degrees clockwise
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

/** Rectangle w x h (px) centred on (x, y), turned `deg` clockwise; an SVG path in reference px. */
const box = (x: number, y: number, w: number, h: number, deg = 0) => {
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return 'M' + [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
    .map(([u, v]) => `${(x + u * c - v * s).toFixed(1)} ${(y + u * s + v * c).toFixed(1)}`).join('L') + 'Z';
};

const placements: Placement[] = [];
const indicators: IndicatorDef[] = [];
const light = (id: string, legend: string, description: string) =>
  indicators.push({ id, name: `${legend.replace('\n', ' ')} warning light`, type: 'lamp', colour: 'red', description, source: src });
MODULES.forEach((m, i) => {
  // Module centres step 71.25, 75.75 px from the ENG FIRE module at (84, 82).
  const at = pt(84 + 71.25 * i - 48, 82 + 75.75 * i - 53.5);
  if (typeof m[0] === 'string') {
    const [id, legend, widths, description] = m as [string, string, [number, number], string];
    placements.push({ component: 'lamp-module', at, rotate: SLOPE, size: [W, H], lamps: [{ indicator: id, legend, rect: lens(), cap: CAP, halves: true, width: widths.map(mm) }] });
    light(id, legend, description);
  } else {
    const [top, bottom] = m as Lamp[];
    placements.push({ component: 'lamp-module', at, rotate: SLOPE, size: [W, H], lamps: [
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
  canvas: [mm(446), mm(461)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 46,
    image: 'p. 46 "Right Eyebrow Lights" cockpit image, 440 x 461 px',
    rectify: 'none: traced on the image as extracted; modules placed by their centres (sizes measured after turning 38° and rectifying on the row corners)',
    pxPerMm: PX,
    scale: 'No fasteners are visible, so the scale is assumed: a module pitch of 1 in (102.5 px).',
    shown: {},
    unresolved: [
      'The strip is seen steeply from below and to the left, so module height is estimated after rectifying; modules are drawn square-on at their image centres.',
      'The scale is assumed, not measured.',
      'HYD/OIL PRESS and TO/LDG CONFIG are each one warning across both halves of the lens, as the guide describes them.',
    ],
  },
  // The housing that holds the five modules, traced as its
  // front face: 8 px clear of the modules all round, along the line of module centres.
  plate: [
    { raised: true, d: path(box(226.5, 233.5, 528, 123, 46.75)) },
  ],
  engraving: [],
  placements,
  controls: [],
  indicators,
};
