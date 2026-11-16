import type { IndicatorDef, PanelSpec, Placement } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C caution light panel (right auxiliary console), DCS.
 *
 * Reference: the guide's p. 59 cockpit image (485 x 372 JPEG, extracted with
 * `pdfimages -j -f 59 -l 59`). It is near square-on, so it is traced unrectified.
 * The gaps between modules were found from the image's row and column brightness:
 * columns every 114 px from x = 18, rows every 42.75 px from y = 15.
 */
const PX = 3.15;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide pp. 59–60';

const X0 = 18, DX = 114, Y0 = 15, DY = 42.75, GAP = 3;
const W = mm(DX - 2 * GAP), H = mm(DY - 2 * GAP);
const lens: [number, number, number, number] = [1.3, 1.3, +(W - 2.6).toFixed(2), +(H - 2.6).toFixed(2)];

/** The grid, row by row: [id, legend (\n splits lines), description], or null for an unused module. */
const GRID: ([string, string, string] | null)[][] = [
  [
    ['flcs-fault', 'FLCS\nFAULT', 'A dual malfunction has occurred in the flight control computer (FLCC) electronics, the leading-edge flaps are locked, or the FLCS BIT has failed.'],
    ['engine-fault', 'ENGINE\nFAULT', 'An engine-related fault has been detected. Goes out when the fault is acknowledged.'],
    ['avionics-fault', 'AVIONICS\nFAULT', 'An avionics-related fault has been detected, or the multiplex bus (MUX) has lost communication with the engine or the FLCC.'],
    ['seat-not-armed', 'SEAT NOT\nARMED', 'The ejection seat arming lever is in the disarmed (up) position.'],
  ],
  [
    ['elec-sys', 'ELEC SYS', 'An electrical fault has been detected, and a matching light is lit on the ELEC control panel.'],
    ['sec', 'SEC', 'The engine is running in secondary (SEC) control mode.'],
    ['equip-hot', 'EQUIP\nHOT', 'Cooling air temperature or pressure to the avionics bay is too low. Power to the fire control radar is cut automatically.'],
    ['nws-fail', 'NWS\nFAIL', 'The nose wheel steering system has failed.'],
  ],
  [
    ['probe-heat', 'PROBE HEAT', 'Air flow to the pitot, fuselage air data or AoA probes has dropped to a level that may mean icing, or a probe heater or its monitor has failed.'],
    ['fuel-oil-hot', 'FUEL/OIL\nHOT', 'Fuel supplied to the engine, or the engine oil, has become too hot.'],
    ['radar-alt', 'RADAR\nALT', 'The radar altimeter has malfunctioned.'],
    ['anti-skid', 'ANTI\nSKID', 'The ANTI-SKID switch is OFF, or a brake system malfunction has been detected above 5 knots ground speed.'],
  ],
  [
    ['cadc', 'CADC', 'A central air data computer (CADC) malfunction has been detected.'],
    ['inlet-icing', 'INLET\nICING', 'The engine inlet ice detector has sensed ice, or the detector has failed.'],
    ['iff', 'IFF', 'The IFF has received a Mode 4 interrogation but cannot reply: Mode 4 replies are inhibited (by the RF switch or the MODE 4 REPLY switch), or Mode 4 is zeroized.'],
    ['hook', 'HOOK', 'The emergency arresting hook is not up and locked.'],
  ],
  [
    ['stores-config', 'STORES\nCONFIG', 'The STORES CONFIG switch is in the wrong position.'],
    ['overheat', 'OVERHEAT', 'An overheat has been detected in the engine compartment, main landing gear wheel wells, ECS bay or EPU bay.'],
    ['nuclear', 'NUCLEAR', 'Not implemented in DCS.'],
    ['obogs', 'OBOGS', 'ECS air pressure to the oxygen generating system (OBOGS) is below 10 psi.'],
  ],
  [
    ['atf-not-engaged', 'ATF NOT\nENGAGED', 'No function in DCS.'],
    ['eec', 'EEC', 'No function in DCS.'],
    null,
    ['cabin-press', 'CABIN\nPRESS', 'Cockpit pressure altitude is above 27,000 feet.'],
  ],
  [
    ['fwd-fuel-low', 'FWD\nFUEL LOW', 'Forward reservoir fuel is below 400 lb.'],
    ['buc', 'BUC', 'No function in DCS.'],
    null,
    null,
  ],
  [
    ['aft-fuel-low', 'AFT\nFUEL LOW', 'Aft reservoir fuel is below 250 lb.'],
    null,
    null,
    null,
  ],
];

const placements: Placement[] = [];
const indicators: IndicatorDef[] = [];
GRID.forEach((row, r) => row.forEach((cell, c) => {
  const at = pt(X0 + c * DX + GAP, Y0 + r * DY + GAP);
  if (!cell) { placements.push({ component: 'lamp-module', at, size: [W, H], lamps: [], blank: true }); return; }
  const [id, legend, description] = cell;
  placements.push({ component: 'lamp-module', at, size: [W, H], lamps: [{ indicator: id, legend, rect: lens, cap: 2.8 }] });
  indicators.push({ id, name: `${legend.replace('\n', ' ')} light`, type: 'lamp', colour: 'amber', description, source: src });
}));

export const caution: PanelSpec = {
  id: 'caution',
  title: 'Caution light panel',
  canvas: [mm(486), mm(373)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 59,
    image: 'p. 59 "Caution Light Panel" cockpit image, 485 x 372 px',
    rectify: 'none: the image is near square-on and has no fasteners to rectify on',
    pxPerMm: PX,
    scale: 'No fasteners or plate edges are visible, so the scale is assumed: the four columns are taken to span a standard 5.75 in console panel width (460 px).',
    shown: {},
    unresolved: [
      'The image is cropped to the lamp grid, so the plate outline and its fasteners are not shown; a plain plate around the grid is drawn.',
      'The scale is assumed from the standard console panel width, not measured.',
      'Unused modules show a dash on a blank lens; they have no lamp.',
      'The camera sits a little left of and above the panel, so the legends appear shifted; they are centred on their lenses.',
    ],
  },
  plate: [{ d: path('M4 2H482Q484 2 484 4V369Q484 371 482 371H4Q2 371 2 369V4Q2 2 4 2Z') }],
  engraving: [],
  placements,
  controls: [],
  indicators,
};
