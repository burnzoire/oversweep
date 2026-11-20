import type { ControlDef, PanelSpec } from '../types';
import { ART, CAPTIONS, HITS } from './stick-art.ts';
import { STICK_FACES } from './hotas-faces.ts';

/**
 * F-16C side stick controller (SSC), right console, DCS.
 *
 * Drawn from a clean redraw of the flight-manual line figure "Side Stick Controller (SSC)" (left side and rear
 * views), vectorised by scripts/hotas/clean.py; the switches' names and functions are the DCS guide's
 * (pp. 83–85, 88). The stick's own pitch and roll show as force arrows over the views.
 */
const src = 'DCS F-16C guide p. 83';
const fourWay = (id: string, name: string, axis: 'ud' | 'lr', labels: [string, string, string], description: string, source = src): ControlDef => ({
  id, name, type: 'toggle', travel: axis === 'ud' ? 'vertical' : 'horizontal',
  positions: (axis === 'ud' ? ['fwd', 'center', 'aft'] : ['left', 'center', 'right']).map((p, i) =>
    p === 'center' ? { id: p, label: labels[i], hold: 'stable' as const } : { id: p, label: labels[i], hold: 'momentary' as const, spring: 'center' }),
  initial: 'center', description, source,
});
const push = (id: string, name: string, pressed: string, description: string, source = src): ControlDef => ({
  id, name, type: 'pushbutton',
  positions: [{ id: 'out', label: 'Out', hold: 'stable' }, { id: 'in', label: pressed, hold: 'momentary', spring: 'out' }],
  initial: 'out', description, source,
});
const svg = (shapes: Record<string, string>) => Object.fromEntries(Object.entries(shapes).map(([k, v]) => [k, { d: '', svg: v }]));
const caption = (x: number, y: number, t: string) => ({ kind: 'svg' as const, markup: `<text x="${x}" y="${y}" font-size="5" font-weight="400" text-anchor="middle" fill="#161616" stroke="none">${t}</text>` });

const TMS = 'Target management switch (TMS). Designates and manages targets on the sensor of interest (SOI). Forward: designate (short) or, with the HUD as SOI, makes the HMCS the SOI (long). Left: FCR scan and NCTR/LOS interrogation. Right: target step, sighting point rotary or TWS toggle. Aft: target reject or return. A short press is under half a second, a long one over.';
const DMS = 'Display management switch (DMS). Selects the sensor of interest (SOI). Forward: SOI to the HUD. Left and right: next format on the left or right MFD. Aft: SOI to an MFD or swap the SOI between the MFDs (short), HMCS display on and off (long).';
const CMS = 'Countermeasures management switch (CMS), on the left side of the grip under the thumb. Forward: dispense one manual program 1–4 (as set on the CMDS PRGM knob). Left: dispense one manual program 6. Right: stop ECM emissions, or stop the automatic dispensing program. Aft: start ECM emissions or dispense the automatic program, by CMDS mode.';

export const stick: PanelSpec = {
  id: 'stick',
  title: 'Side stick controller',
  canvas: [238, 240],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026), switch names and functions; drawing from the flight-manual figure "Side Stick Controller (SSC)"',
    page: 83,
    image: 'Clean label-free redraw of the flight-manual figures "Side Stick Controller (SSC)" and "Throttle Grip" (docs/cockpit/hotas/clean-ref.png, 2172 x 724 px); side stick, left side and rear views',
    rectify: 'python3 -I scripts/hotas/clean.py docs/cockpit/hotas/clean-ref.png stick (potrace of the line drawing; each switch cut out by a region polygon and moved on its own)',
    pxPerMm: 1 / 0.375,
    scale: 'The figure prints no dimension. One drawing pixel is drawn as 0.375 mm, which makes the grip about 155 mm tall above its boot; both views and the throttle share that scale.',
    shown: { trigger: 'out', paddle: 'out', 'weapon-release': 'out' },
    unresolved: [
      'The guide (p. 83) shows the stick only as a shaded render from the front left; the drawing follows the flight-manual figure, which names the same switches.',
      'The stick barely moves (it senses force), so pushing, pulling or rolling it shows as an arrow over the grip rather than a tilt. Click the shaft: left half pushes, right half pulls (side view); left and right halves roll (rear view).',
      'The rudder pedals are not in the stick figure; they have their own card only, drawn from above (forward up the page), the pushed pedal moving forward and the other back.',
      'The four-way hats are drawn moving a little in the direction pushed; seen from behind, forward is up the page.',
      'The trigger is one switch with two detents; click its left half for the first detent and its right half for the second.',
      'The pinky button (EXPAND/FOV) shows as a small round button low on the left side, where the figure puts it.',
    ],
    credits: [{ what: 'Side stick drawing (vectorised from a redraw)', author: 'F-16 flight-manual figure via falcon4.wikidot.com, Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:F-16_Side_Stick_Controller.jpg', license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/' }],
  },
  plate: [],
  engraving: [
    { kind: 'svg', markup: ART.sideStatic },
    { kind: 'svg', markup: ART.rearStatic },
    caption(CAPTIONS.side, CAPTIONS.y, 'Left side'),
    caption(CAPTIONS.rear, CAPTIONS.y, 'From behind'),
    caption(17, CAPTIONS.y, 'Rudder pedals'),
  ],
  placements: [
    // Stick force: click the grip's shaft. Push/pull on the side view (forward is left), left/right on the rear view.
    { component: 'traced', control: 'pitch', at: [108, 136], hit: [...HITS.pitch] as [number, number, number, number], shapes: svg(ART.pitch) },
    // Rudder pedals: not in the figure; a small plan-view icon in the free corner opens their card.
    { component: 'traced', control: 'rudder', at: [17, 204], hit: [3, 191, 28, 30], shapes: svg(Object.fromEntries(Object.entries((STICK_FACES['pedals'].placements[0] as { shapes: Record<string, { svg: string }> }).shapes).map(([k, v]) => [k, `<g transform="translate(17 204) scale(0.5) translate(-25 -25)">${v.svg}</g>`]))) },
    { component: 'traced', control: 'roll', at: [219, 136], hit: [...HITS.roll] as [number, number, number, number], shapes: svg(ART.roll) },
    // Side view.
    { component: 'traced', control: 'trigger', at: [56, 74], hit: [...HITS.trigger] as [number, number, number, number], shapes: svg(ART.trigger) },
    { component: 'traced', control: 'paddle', at: [58, 184], hit: [...HITS.paddle] as [number, number, number, number], shapes: svg(ART.paddle) },
    { component: 'traced', control: 'expand-fov', at: [94.8, 153], hit: [...HITS.pinky] as [number, number, number, number], shapes: svg(ART.pinky) },
    // Rear view.
    { component: 'traced', control: 'weapon-release', at: [194.7, 24.6], hit: [...HITS.weaponRelease] as [number, number, number, number], shapes: svg(ART.weaponRelease) },
    { component: 'traced', control: 'msl-step', at: [243.6, 31], hit: [...HITS.mslStep] as [number, number, number, number], shapes: svg(ART.mslStep) },
    ...(['trim', 'tms', 'dms', 'cms'] as const).flatMap(h => [
      { component: 'traced' as const, control: `${h}-ud`, at: [0, 0] as [number, number], hit: [...HITS[`${h}Ud`]] as [number, number, number, number], shapes: svg(ART[`${h}Ud`]) },
      { component: 'traced' as const, control: `${h}-lr`, at: [0, 0] as [number, number], hit: [...HITS[`${h}Lr`]] as [number, number, number, number], shapes: svg(ART[`${h}Lr`]) },
    ]),
  ],
  controls: [
    {
      id: 'pitch', name: 'Stick, pitch', type: 'toggle', travel: 'horizontal',
      positions: [
        { id: 'fwd', label: 'Forward (nose down)', hold: 'momentary', spring: 'neutral' },
        { id: 'neutral', label: 'Neutral', hold: 'stable' },
        { id: 'aft', label: 'Aft (nose up)', hold: 'momentary', spring: 'neutral' },
      ],
      initial: 'neutral',
      description: 'Pushing or pulling the stick commands pitch: the flight control computer moves the horizontal tails. The stick senses force and barely moves; it centres when released.',
      source: src,
    },
    {
      id: 'roll', name: 'Stick, roll', type: 'toggle', travel: 'horizontal',
      positions: [
        { id: 'left', label: 'Left', hold: 'momentary', spring: 'neutral' },
        { id: 'neutral', label: 'Neutral', hold: 'stable' },
        { id: 'right', label: 'Right', hold: 'momentary', spring: 'neutral' },
      ],
      initial: 'neutral',
      description: 'Moving the stick left or right commands roll: the flaperons and the horizontal tails, and a little rudder. It centres when released.',
      source: src,
    },
    {
      id: 'trigger', name: 'Trigger', type: 'toggle', travel: 'horizontal',
      positions: [
        { id: 'first', label: 'First detent', hold: 'momentary', spring: 'out' },
        { id: 'out', label: 'Released', hold: 'stable' },
        { id: 'second', label: 'Second detent', hold: 'momentary', spring: 'out' },
      ],
      initial: 'out',
      description: 'Two-detent trigger. Held at the first detent it fires the targeting pod laser designator/ranger for ranging. The second detent fires the gun when it is selected and armed, or fires the laser for 30 seconds in CCIP.',
      source: src,
    },
    push('weapon-release', 'Weapon release button', 'Pressed', 'Press and hold to fire air-to-air missiles or release any air-to-ground weapon.'),
    fourWay('trim-ud', 'Trim switch, pitch', 'ud', ['Forward (nose down)', 'Center', 'Aft (nose up)'], 'Four-way trim switch. Forward trims nose down, aft trims nose up. Trim works only with the TRIM/AP DISC switch at NORM.'),
    fourWay('trim-lr', 'Trim switch, roll', 'lr', ['Left (left wing down)', 'Center', 'Right (right wing down)'], 'Four-way trim switch. Left trims left wing down, right trims right wing down.'),
    push('msl-step', 'Missile step / NWS / A/R DISC button', 'Pressed', 'On the ground, a press engages nosewheel steering through the rudder pedals and a second press disengages it (AR/NWS light). In flight with the AIR REFUEL switch at OPEN it disconnects the boom. Otherwise it steps missile stations (short) or missile types (long), or the air-to-ground delivery mode.'),
    fourWay('tms-ud', 'TMS, forward/aft', 'ud', ['Forward', 'Center', 'Aft'], TMS, 'DCS F-16C guide pp. 83–84'),
    fourWay('tms-lr', 'TMS, left/right', 'lr', ['Left', 'Center', 'Right'], TMS, 'DCS F-16C guide pp. 83–84'),
    fourWay('dms-ud', 'DMS, forward/aft', 'ud', ['Forward', 'Center', 'Aft'], DMS, 'DCS F-16C guide p. 84'),
    fourWay('dms-lr', 'DMS, left/right', 'lr', ['Left', 'Center', 'Right'], DMS, 'DCS F-16C guide p. 84'),
    fourWay('cms-ud', 'CMS, forward/aft', 'ud', ['Forward', 'Center', 'Aft'], CMS, 'DCS F-16C guide p. 85'),
    fourWay('cms-lr', 'CMS, left/right', 'lr', ['Left', 'Center', 'Right'], CMS, 'DCS F-16C guide p. 85'),
    push('paddle', 'Paddle switch', 'Held', 'Held against the grip, it disengages the autopilot for as long as it is held, so the pilot can fly by hand. On release the autopilot takes up new pitch, roll or altitude references, by the PITCH and ROLL switches on the MISC panel.', 'DCS F-16C guide p. 85'),
    {
      id: 'rudder', name: 'Rudder pedals', type: 'toggle', travel: 'horizontal',
      positions: [
        { id: 'left', label: 'Left pedal in', hold: 'momentary', spring: 'neutral' },
        { id: 'neutral', label: 'Neutral', hold: 'stable' },
        { id: 'right', label: 'Right pedal in', hold: 'momentary', spring: 'neutral' },
      ],
      initial: 'neutral',
      description: 'Rudder pedals, on the cockpit floor ahead of the seat. Pushing the left pedal yaws the nose left and the right pedal right; on the ground with nosewheel steering engaged they also steer the nosewheel. Toe brakes on the pedals work the wheel brakes (not modelled here).',
      source: 'DCS F-16C guide p. 138',
    },
    push('expand-fov', 'Expand/FOV (pinky) button', 'Pressed', 'Cycles the fields of view of the sensor of interest: FCR, HSD or HAD expand modes, the targeting pod field of view, or the selected Maverick or HARM seeker. Held, it gives HSD zoom.', 'DCS F-16C guide p. 85'),
  ],
  indicators: [],
  pads: [
    { id: 'stick', name: 'Stick (push, pull, roll)', cross: { up: ['pitch', 'fwd'], down: ['pitch', 'aft'], left: ['roll', 'left'], right: ['roll', 'right'] }, face: STICK_FACES['stick'] },
    { id: 'trigger', name: 'Trigger', controls: ['trigger'] },
    { id: 'weapon-release', name: 'Weapon release button', controls: ['weapon-release'], face: STICK_FACES['weapon-release'] },
    { id: 'trim', name: 'Trim switch', cross: { up: ['trim-ud', 'fwd'], down: ['trim-ud', 'aft'], left: ['trim-lr', 'left'], right: ['trim-lr', 'right'] }, face: STICK_FACES['trim'] },
    { id: 'tms', name: 'Target management switch (TMS)', cross: { up: ['tms-ud', 'fwd'], down: ['tms-ud', 'aft'], left: ['tms-lr', 'left'], right: ['tms-lr', 'right'] }, face: STICK_FACES['tms'] },
    { id: 'dms', name: 'Display management switch (DMS)', cross: { up: ['dms-ud', 'fwd'], down: ['dms-ud', 'aft'], left: ['dms-lr', 'left'], right: ['dms-lr', 'right'] }, face: STICK_FACES['dms'] },
    { id: 'cms', name: 'Countermeasures management switch (CMS)', cross: { up: ['cms-ud', 'fwd'], down: ['cms-ud', 'aft'], left: ['cms-lr', 'left'], right: ['cms-lr', 'right'] }, face: STICK_FACES['cms'] },
    { id: 'msl-step', name: 'Missile step / NWS / A/R DISC button', controls: ['msl-step'], face: STICK_FACES['msl-step'] },
    { id: 'paddle', name: 'Paddle switch', controls: ['paddle'] },
    { id: 'pedals', name: 'Rudder pedals', controls: ['rudder'], face: STICK_FACES['pedals'] },
    { id: 'expand-fov', name: 'Expand/FOV (pinky) button', controls: ['expand-fov'], face: STICK_FACES['expand-fov'] },
  ],
};
