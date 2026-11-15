import type { Part, PanelSpec } from './types';

/**
 * F-16C landing gear control panel (left auxiliary console), as modelled in DCS.
 * Units are pixels of the guide's p. 55 panel image (468 x 541); the CMDS panel
 * below y 425 is left out. The image is close to square-on and is used unwarped:
 *   python3 -I scripts/panel-trace.py <p55-image> <out> 0,0 468,0 0,541 468,541
 * The gear handle stands well proud of the panel, so its drawn outline is the
 * knob's footprint at the DN position, not a traced silhouette.
 */
const wheels: Part[] = ['W', 'H', 'E', 'E', 'L', 'S'].map((text, i) => ({ kind: 'label', at: [320, 98 + i * 13.4], text, size: 7 }));

export const f16cGear: PanelSpec = {
  id: 'f16c-gear',
  title: 'F-16C landing gear control panel',
  size: [465, 430],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 55, "Landing Gear Panel" image',
    size: 'No dimensions in the guide. The left edge of the panel is hidden in the reference and is drawn as a straight edge.',
    checks: ['Same guide, pp. 55-57 callouts 1-12 (landing gear panel controls)'],
    variant: 'DCS F-16C Block 50',
  },
  plates: [
    { d: 'M140 45H385V8Q385 4 389 4H456Q460 4 460 8V421Q460 425 456 425H4Q0 425 0 421V214L28 200L136 148V49Q136 45 140 45Z' },
    { d: 'M402 182H452V352H402Z', fill: '#f2f2f2' },
  ],
  parts: [
    { kind: 'screw', at: [145, 65], r: 8 },
    { kind: 'screw', at: [272, 50], r: 7 },
    { kind: 'screw', at: [447, 20], r: 7 },
    { kind: 'screw', at: [45, 288], r: 6 },
    { kind: 'screw', at: [140, 398], r: 7 },
    { kind: 'screw', at: [346, 398], r: 7 },
    { kind: 'dzus', at: [430, 398], r: 11, slot: 0 },

    { kind: 'label', at: [205, 62], text: 'EMER STORES', size: 9, width: 60 },
    { kind: 'label', at: [202, 76], text: 'JETTISON', size: 9, width: 47 },
    { kind: 'hatch', at: [158, 85], size: [88, 87], gap: 7 },
    { kind: 'pushbutton', id: 'emergency-stores', at: [202, 128], r: 34, label: 'EMER STORES JETTISON', hitAttrs: { 'data-control': 'emergency-stores' } },

    { kind: 'path', width: 0.5, d: 'M320 30L309 68V98L257 129V139H305V160L282 181V188H358V181L335 160V139H383V129L331 98V68Z' },
    { kind: 'lamp', at: [320, 53], r: 15, lamp: 'gear-nose', colour: 'green' },
    { kind: 'lamp', at: [286, 99], r: 15, lamp: 'gear-left', colour: 'green' },
    { kind: 'lamp', at: [352, 102], r: 15, lamp: 'gear-right', colour: 'green' },
    ...wheels,

    { kind: 'hatch', at: [390, 30], size: [52, 34], gap: 6 },
    { kind: 'label', at: [440, 70], text: 'UP', size: 8, width: 13 },
    { kind: 'label', at: [440, 107], text: 'DN', size: 8, width: 14 },
    {
      kind: 'toggle', id: 'hook', at: [418, 86], r: 10, reach: 3, face: 'paddle', initial: 'up', label: 'Hook', hitClass: 'raster-switch',
      positions: [{ id: 'up', label: 'HOOK UP' }, { id: 'down', label: 'HOOK DN' }],
      inputs: [['hook-up', 'Select HOOK UP'], ['hook-down', 'Select HOOK DN']],
    },

    { kind: 'label', at: [101, 200], text: 'GND JETT', size: 9, width: 44 },
    { kind: 'label', at: [100, 213], text: 'ENABLE', size: 8, width: 38 },
    { kind: 'label', at: [99, 270], text: 'OFF', size: 8, width: 18 },
    {
      kind: 'toggle', id: 'ground-jettison', at: [101, 240], r: 13, initial: 'off', label: 'Ground jettison enable', hitClass: 'raster-switch',
      positions: [{ id: 'enable', label: 'ENABLE' }, { id: 'off', label: 'OFF' }],
      inputs: [['ground-jettison-up', 'Select GND JETT ENABLE'], ['ground-jettison-down', 'Select GND JETT OFF']],
    },
    { kind: 'label', at: [166, 200], text: 'BRAKES', size: 9, width: 38 },
    { kind: 'label', at: [166, 213], text: 'CHAN 1', size: 8, width: 33 },
    { kind: 'label', at: [164, 270], text: 'CHAN 2', size: 8, width: 30 },
    {
      kind: 'toggle', id: 'brakes-channel', at: [166, 240], r: 12, initial: 'chan1', label: 'Brakes channel', hitClass: 'raster-switch',
      positions: [{ id: 'chan1', label: 'CHAN 1' }, { id: 'chan2', label: 'CHAN 2' }],
      inputs: [['brakes-channel-up', 'Select BRAKES CHAN 1'], ['brakes-channel-down', 'Select BRAKES CHAN 2']],
    },
    { kind: 'label', at: [233, 195], text: 'PARKING', size: 9, width: 42 },
    { kind: 'label', at: [233, 210], text: 'BRAKE', size: 9, width: 32 },
    { kind: 'label', at: [280, 241], text: 'ANTI-SKID', size: 9, width: 47 },
    { kind: 'label', at: [234, 270], text: 'OFF', size: 8, width: 18 },
    {
      kind: 'toggle', id: 'parking-brake', at: [232, 240], r: 13, initial: 'centre', label: 'Parking brake and anti-skid',
      hitClass: 'raster-switch prestart-control primary', hitAttrs: { 'data-prestart-position': 'parking-brake' },
      positions: [{ id: 'up', label: 'PARKING BRAKE' }, { id: 'centre', label: 'ANTI-SKID' }, { id: 'down', label: 'OFF' }],
      inputs: [['parking-brake-up', 'Select PARKING BRAKE'], ['parking-brake-down', 'Move parking brake switch down']],
    },

    { kind: 'label', at: [208, 316], text: '+', size: 7 },
    { kind: 'label', at: [67, 325], text: 'STORES CONFIG', size: 9, width: 75 },
    { kind: 'label', at: [68, 339], text: 'CAT I', size: 8, width: 24 },
    { kind: 'label', at: [65, 396], text: 'CAT III', size: 8, width: 32 },
    {
      kind: 'toggle', id: 'stores-config', at: [68, 368], r: 12, initial: 'cat3', label: 'Stores configuration', hitClass: 'raster-switch',
      positions: [{ id: 'cat1', label: 'CAT I' }, { id: 'cat3', label: 'CAT III' }],
      inputs: [['stores-config-up', 'Select CAT I'], ['stores-config-down', 'Select CAT III']],
    },
    { kind: 'label', at: [168, 323], text: 'HORN', size: 9, width: 26 },
    { kind: 'label', at: [168, 338], text: 'SILENCER', size: 9, width: 46 },
    { kind: 'pushbutton', id: 'horn-silencer', at: [167, 368], r: 13, label: 'HORN SILENCER', hitAttrs: { 'data-control': 'horn-silencer' } },
    { kind: 'label', at: [250, 323], text: 'LIGHTS', size: 9, width: 36 },
    { kind: 'label', at: [250, 338], text: 'LANDING', size: 9, width: 41 },
    { kind: 'label', at: [303, 369], text: 'OFF', size: 8, width: 18 },
    { kind: 'label', at: [258, 396], text: 'TAXI', size: 8, width: 22 },
    {
      kind: 'toggle', id: 'landing-lights', at: [250, 368], r: 12, face: 'rocker', reach: 0.6, initial: 'off', label: 'Landing and taxi lights', hitClass: 'raster-switch', hit: 4.4,
      positions: [{ id: 'landing', label: 'LANDING' }, { id: 'off', label: 'OFF' }, { id: 'taxi', label: 'TAXI' }],
      inputs: [['landing-lights-up', 'Move LIGHTS switch up'], ['landing-lights-down', 'Move LIGHTS switch down']],
    },

    { kind: 'label', at: [345, 270], text: 'DN LOCK', size: 9, width: 48 },
    { kind: 'label', at: [348, 283], text: 'REL', size: 8, width: 20 },
    { kind: 'hatch', at: [315, 290], size: [72, 82], gap: 7 },
    { kind: 'pushbutton', id: 'down-lock-release', at: [349, 330], r: 22, label: 'DN LOCK REL', hitAttrs: { 'data-control': 'down-lock-release' } },

    { kind: 'label', at: [409, 172], text: 'UP', size: 9, width: 14 },
    { kind: 'label', at: [418, 372], text: 'DN', size: 9, width: 15 },
    { kind: 'path', width: 0.5, d: 'M421 186V346' },
    {
      kind: 'handle', id: 'landing-gear', at: [421, 195], initial: 'down', label: 'Landing gear handle', hitClass: 'raster-switch', hitSize: [80, 110], hitOffset: [-50, 0],
      d: 'M-4 -8H4V8H-4ZM-92 -46Q-92 -56 -82 -56H-32Q-22 -56 -22 -46V40Q-22 50 -32 50H-82Q-92 50 -92 40ZM-86 -40H-28M-86 -28H-28M-86 -16H-28M-86 -4H-28M-86 8H-28M-86 20H-28M-86 32H-28M-22 -4H-4',
      positions: [{ id: 'up', dy: -80 }, { id: 'down', dy: 0 }],
      inputs: [['landing-gear-up', 'Move landing gear handle to UP'], ['landing-gear-down', 'Move landing gear handle to DN']],
    },
  ],
};
