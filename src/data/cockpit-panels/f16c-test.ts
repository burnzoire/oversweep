import type { Annunciator, PanelSpec } from './types';

/**
 * F-16C TEST switch panel, as modelled in DCS.
 * Units are pixels of the guide's p. 72 TEST panel image (237 x 323), square-on,
 * used unwarped:
 *   python3 -I scripts/panel-trace.py <p72-image> <out> 0,0 237,0 0,323 237,323
 */
const channel = (letter: string, at: [number, number]): Annunciator => ({
  kind: 'annunciator', at, size: [22, 24], inset: 0, cap: 9, colour: 'green',
  cells: [{ text: letter, attrs: { 'data-flcs-channel': letter } }],
});

export const f16cTest: PanelSpec = {
  id: 'f16c-test',
  title: 'F-16C TEST switch panel',
  size: [237, 323],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 72, "TEST Panel" image',
    size: 'No dimensions in the guide. The image crops the panel on every side, so the plate is drawn to the crop and the top fasteners are cut.',
    checks: ['Same guide, pp. 72-73 callouts 1-7 (TEST panel controls)'],
    variant: 'DCS F-16C Block 50',
  },
  plates: [{ d: 'M2 0H235V323H2Z' }],
  parts: [
    { kind: 'dzus', at: [60, 4], r: 12, slot: 0 },
    { kind: 'dzus', at: [199, 7], r: 12, slot: 0 },
    { kind: 'screw', at: [40, 127], r: 7 },
    { kind: 'screw', at: [160, 130], r: 7 },
    { kind: 'screw', at: [204, 311], r: 7 },

    { kind: 'label', at: [25, 77], text: 'T', size: 12 },
    { kind: 'label', at: [25, 93], text: 'E', size: 12 },
    { kind: 'label', at: [25, 110], text: 'S', size: 12 },
    { kind: 'label', at: [25, 125], text: 'T', size: 12 },

    { kind: 'label', at: [63, 40], text: 'FIRE &', size: 9, width: 27 },
    { kind: 'label', at: [63, 53], text: 'OHEAT DETECT', size: 9, width: 80 },
    { kind: 'pushbutton', id: 'fire-test', at: [59, 80], r: 18, label: 'FIRE & OHEAT DETECT', hitAttrs: { 'data-control': 'fire-test' } },

    { kind: 'label', at: [129, 40], text: 'OBOGS', size: 9, width: 35 },
    { kind: 'label', at: [125, 53], text: 'BIT', size: 9, width: 17 },
    { kind: 'label', at: [125, 111], text: 'OFF', size: 9, width: 20 },
    {
      kind: 'toggle', id: 'obogs', at: [127, 82], r: 14, initial: 'off', label: 'OBOGS TEST', hitClass: 'raster-switch',
      positions: [{ id: 'bit', label: 'BIT' }, { id: 'off', label: 'OFF' }],
      inputs: [['obogs-test-up', 'Select BIT'], ['obogs-test-down', 'Select OFF']],
    },

    { kind: 'label', at: [194, 40], text: 'MAL &', size: 9, width: 30 },
    { kind: 'label', at: [194, 53], text: 'IND LTS', size: 9, width: 39 },
    { kind: 'pushbutton', id: 'mal-test', at: [194, 82], r: 17, label: 'MAL & IND LTS', hitAttrs: { 'data-control': 'mal-test' } },

    { kind: 'label', at: [37, 146], text: 'PROBE', size: 9, width: 34 },
    { kind: 'label', at: [37, 161], text: 'HEAT', size: 9, width: 26 },
    { kind: 'label', at: [73, 194], text: 'OFF', size: 9, width: 20 },
    { kind: 'label', at: [34, 226], text: 'TEST', size: 9, width: 26 },
    {
      kind: 'toggle', id: 'probe-heat', at: [38, 192], r: 14, initial: 'off', label: 'PROBE HEAT', hitClass: 'raster-switch',
      positions: [{ id: 'heat', label: 'PROBE HEAT' }, { id: 'off', label: 'OFF' }, { id: 'test', label: 'TEST' }],
      inputs: [['probe-heat-up', 'Select PROBE HEAT'], ['probe-heat-down', 'Select TEST']],
    },

    { kind: 'label', at: [116, 162], text: 'EPU/GEN', size: 9, width: 50 },
    { kind: 'label', at: [113, 227], text: 'OFF', size: 9, width: 20 },
    {
      kind: 'toggle', id: 'epu-gen', at: [115, 200], r: 14, initial: 'off', label: 'EPU GEN', hitClass: 'raster-switch',
      positions: [{ id: 'on', label: 'EPU/GEN' }, { id: 'off', label: 'OFF' }],
      inputs: [['epu-gen-up', 'Select EPU/GEN'], ['epu-gen-down', 'Select OFF']],
    },

    { kind: 'label', at: [191, 123], text: 'FLCS', size: 9, width: 28 },
    { kind: 'label', at: [191, 137], text: 'PWR', size: 9, width: 22 },
    { kind: 'label', at: [177, 152], text: 'L', size: 9 },
    { kind: 'label', at: [202, 152], text: 'R', size: 9 },
    { kind: 'rule', from: [190, 146], to: [190, 158] },
    { kind: 'rule', from: [218, 118], to: [218, 158] },
    { kind: 'label', at: [226, 123], text: 'C', size: 8 },
    { kind: 'label', at: [226, 135], text: 'H', size: 8 },
    { kind: 'label', at: [226, 147], text: 'A', size: 8 },
    { kind: 'label', at: [226, 160], text: 'N', size: 8 },
    { kind: 'path', fill: '#fff', d: 'M162 162H212Q214 162 214 164V211Q214 213 212 213H162Q160 213 160 211V164Q160 162 162 162Z' },
    channel('C', [162, 164]), channel('A', [186, 164]), channel('D', [162, 189]), channel('B', [186, 189]),
    { kind: 'label', at: [225, 176], text: '1', size: 9 },
    { kind: 'rule', from: [219, 187], to: [232, 187] },
    { kind: 'label', at: [225, 200], text: '2', size: 9 },

    { kind: 'path', d: 'M152 137L140 312' },
    { kind: 'label', at: [176, 245], text: 'TEST', size: 9, width: 25 },
    { kind: 'label', at: [210, 277], text: 'NORM', size: 9, width: 34 },
    { kind: 'label', at: [170, 306], text: 'MAINT', size: 9, width: 34 },
    {
      kind: 'toggle', id: 'flcs-pwr-test', at: [171, 277], r: 15, reach: 1.6, initial: 'norm', label: 'FLCS PWR TEST', hitClass: 'raster-switch flcs-toggle',
      hitAttrs: { 'data-flcs-lever': '' },
      positions: [{ id: 'test', label: 'TEST' }, { id: 'norm', label: 'NORM' }, { id: 'maint', label: 'MAINT' }],
      inputs: [['flcs-test', 'Select TEST'], ['flcs-norm', 'Return to NORM']],
    },
  ],
};
