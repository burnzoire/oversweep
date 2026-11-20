import type { ControlDef, PanelSpec, Rect } from '../types';
import { ANT_ELEV, ART, HITS, MAN_RNG } from './throttle-grip-art.ts';

/**
 * F-16C throttle grip (left sidewall), DCS: the hands-on switches. The throttle's travel (OFF, IDLE, MIL,
 * MAX AB) is on the Sidewall controls page, where the procedures move it.
 *
 * Drawn from the flight-manual line figure "Throttle Grip" (seen from inboard, forward to the right), traced
 * by hand at 1 px = 1 mm in scripts/hotas/throttle.py; the switches' names and functions are the DCS guide's
 * (pp. 86–87, 89).
 */
const src = 'DCS F-16C guide p. 86';
const three = (id: string, name: string, travel: 'vertical' | 'horizontal', pos: [string, string][], description: string, source = src): ControlDef => ({
  id, name, type: 'toggle', travel,
  positions: pos.map(([p, label]) => p === 'center' ? { id: p, label, hold: 'stable' as const } : { id: p, label, hold: 'momentary' as const, spring: 'center' }),
  initial: 'center', description, source,
});
const push = (id: string, name: string, description: string, source = src): ControlDef => ({
  id, name, type: 'pushbutton',
  positions: [{ id: 'out', label: 'Out', hold: 'stable' }, { id: 'in', label: 'Pressed', hold: 'momentary', spring: 'out' }],
  initial: 'out', description, source,
});
const svg = (shapes: Record<string, string>) => Object.fromEntries(Object.entries(shapes).map(([k, v]) => [k, { d: '', svg: v }]));
const hit = (k: keyof typeof HITS) => [...HITS[k]] as Rect;
const elevId = (v: number) => v > 0 ? `u${v}` : v < 0 ? `d${-v}` : 'center';
const CURSOR = 'Radar cursor/enable control. Pushed in any direction it slews the cursor on the FCR, HSD and HAD formats, the targeting pod or the Maverick seeker, or the HUD TD box and mark cue. Pressed (enable), it swaps the AIM-9 between BORE and SLAVE while held, or steps the Maverick through PRE, VIS and BORE.';
const COMM = 'Four-way transmit switch. Forward transmits on the VHF radio, aft on the UHF radio, for as long as it is held. Left (IFF OUT) toggles datalink information on the FCR. Right (IFF IN) cycles the FCR datalink filters (short) or sends the steerpoint, SPI or SEAD target over the datalink (long).';

export const throttleGrip: PanelSpec = {
  id: 'throttle',
  title: 'Throttle',
  canvas: [300, 215],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026), switch names and functions; drawing from the flight-manual figure "Throttle Grip"',
    page: 86,
    image: 'Flight-manual figure "Throttle Grip", seen from inboard, 497 x 317 px (Wikimedia Commons, F-16_Throttle.jpg)',
    rectify: 'python3 -I scripts/hotas/throttle.py (hand-traced outlines in figure pixels; the figure is a line drawing)',
    pxPerMm: 1,
    scale: 'The figure prints no dimension. One figure pixel is drawn as 1 mm, the scale of the side stick drawing, which makes the grip about 200 mm long.',
    shown: { 'comm-ud': 'center', dogfight: 'center', 'spd-brk': 'off' },
    unresolved: [
      'The guide (p. 86) shows the grip only as a shaded render; the drawing follows the flight-manual figure, which names the same switches.',
      'The figure does not show the SPD BRK switch ("not shown": it is behind the grip from this side). It is drawn dashed where the figure points to it, sliding forward and aft.',
      'The black-out switch the figure shows dashed on the outboard side is not described in the DCS guide; it is drawn but not modelled.',
      'The throttle cutoff release (DCS guide p. 86) is not in the figure; the throttle is rolled outboard past the cutoff on the Sidewall controls page.',
      'MAN RNG and ANT ELEV have no printed scale, so they read in percent of travel; the knurl slides round as they turn. ANT ELEV has a centre detent.',
      'Which way DOG FIGHT slides on the drawing (up for DOGFIGHT, down for MISSILE OVERRIDE) follows the guide\'s table (UP (OUT), DOWN (IN)).',
    ],
    credits: [{ what: 'Throttle grip drawing (traced)', author: 'F-16 flight-manual figure via falcon4.wikidot.com, Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:F-16_Throttle.jpg', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' }],
  },
  plate: [],
  engraving: [{ kind: 'svg', markup: ART.static }],
  placements: [
    { component: 'traced', control: 'spd-brk', at: [280, 98], hit: hit('spdBrk'), shapes: svg(ART.spdBrk) },
    { component: 'traced', control: 'comm-ud', at: [217, 28], hit: hit('commUd'), shapes: svg(ART.commUd) },
    { component: 'traced', control: 'comm-lr', at: [217, 28], hit: hit('commLr'), shapes: svg(ART.commLr) },
    { component: 'traced', control: 'man-rng', at: [258, 20], hit: hit('manRng'), shapes: svg(ART.manRng) },
    { component: 'traced', control: 'uncage', at: [258, 20], hit: hit('uncage'), shapes: svg(ART.uncage) },
    { component: 'traced', control: 'ant-elev', at: [286, 55], hit: hit('antElev'), shapes: svg(ART.antElev) },
    { component: 'traced', control: 'dogfight', at: [284, 79], hit: hit('dogfight'), shapes: svg(ART.dogfight) },
    { component: 'traced', control: 'cursor-ud', at: [262, 123], hit: hit('cursorUd'), shapes: svg(ART.cursorUd) },
    { component: 'traced', control: 'cursor-lr', at: [262, 123], hit: hit('cursorLr'), shapes: svg(ART.cursorLr) },
    { component: 'traced', control: 'enable', at: [262, 123], hit: hit('enable'), shapes: svg(ART.enable) },
  ],
  controls: [
    three('comm-ud', 'Transmit switch, VHF/UHF', 'vertical', [['fwd', 'VHF (forward)'], ['center', 'Center'], ['aft', 'UHF (aft)']], COMM),
    three('comm-lr', 'Transmit switch, IFF OUT/IN', 'horizontal', [['left', 'IFF OUT (outboard)'], ['center', 'Center'], ['right', 'IFF IN (inboard)']], COMM),
    {
      id: 'man-rng', name: 'MAN RNG/UNCAGE knob, turn', type: 'rotary', travel: 'horizontal',
      positions: MAN_RNG.map(v => ({ id: `p${v}`, label: `${v} % of travel`, hold: 'stable' as const, value: v, angle: -135 + 2.7 * v })),
      initial: 'p0',
      description: 'Turned, the MAN RNG knob sets the targeting pod\'s manual zoom.',
      source: 'DCS F-16C guide pp. 86, 89',
    },
    push('uncage', 'MAN RNG/UNCAGE knob, press (UNCAGE)', 'Pressed briefly: uncages the AIM-9 seeker, toggles targeting pod laser spot track, or, with the gear down in NAV, declutters the ILS bars and roll indicator from the HUD. Held over a second in A-G: toggles gun strafe mode.', 'DCS F-16C guide p. 86'),
    {
      id: 'ant-elev', name: 'ANT ELEV knob', type: 'rotary', travel: 'vertical',
      positions: ANT_ELEV.map(v => ({ id: elevId(v), label: v === 0 ? 'Center (detent)' : `${v > 0 ? 'Up' : 'Down'} ${Math.abs(v)} % of travel`, hold: 'stable' as const, value: v, angle: 1.35 * v })),
      initial: 'center',
      description: 'Thumbwheel that sets the radar antenna\'s elevation by hand, with a detent at the centre.',
      source: 'DCS F-16C guide p. 87',
    },
    {
      id: 'dogfight', name: 'DOG FIGHT switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'dogfight', label: 'DOGFIGHT (outboard)', hold: 'stable' },
        { id: 'center', label: 'Center', hold: 'stable' },
        { id: 'msl-ovrd', label: 'MISSILE OVERRIDE (inboard)', hold: 'stable' },
      ],
      initial: 'center',
      description: 'Overrides any master mode except emergency jettison. DOGFIGHT: ACM radar (in standby until told to transmit) and gun and missile HUD symbology. MISSILE OVERRIDE: RWS radar and air-to-air missile symbology, gun not available. Center returns to the last master mode.',
      source: 'DCS F-16C guide p. 87',
    },
    three('cursor-ud', 'RDR CURSOR, up/down', 'vertical', [['up', 'Up'], ['center', 'Center'], ['down', 'Down']], CURSOR, 'DCS F-16C guide p. 87'),
    three('cursor-lr', 'RDR CURSOR, aft/forward', 'horizontal', [['aft', 'Aft'], ['center', 'Center'], ['fwd', 'Forward']], CURSOR, 'DCS F-16C guide p. 87'),
    push('enable', 'RDR CURSOR, press (ENABLE)', CURSOR, 'DCS F-16C guide p. 87'),
    {
      id: 'spd-brk', name: 'SPD BRK switch', type: 'toggle', travel: 'horizontal',
      positions: [
        { id: 'aft', label: 'Aft (extend)', hold: 'momentary', spring: 'off' },
        { id: 'off', label: 'Center', hold: 'stable' },
        { id: 'fwd', label: 'Forward (retract)', hold: 'stable' },
      ],
      initial: 'off',
      description: 'Speed brakes: aft extends them, forward retracts them, and they move only while the switch is held there; centre holds them where they are. The switch springs back from aft. With the right main gear down and locked they open only to 43° unless the switch is held aft; otherwise to 60°.',
      source: 'DCS F-16C guide p. 87',
    },
  ],
  indicators: [],
};
