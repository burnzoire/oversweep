import type { Part, PanelSpec } from './types';

/**
 * F-16C ENG & JET START control panel (F110), as modelled in DCS.
 * Units are pixels of the guide's p. 63 panel image (228 x 552), square-on,
 * used unwarped:
 *   python3 -I scripts/panel-trace.py <p63-image> <out> 0,0 228,0 0,552 228,552
 */
const letters = (x: number, cap: number, list: [string, number][]): Part[] =>
  list.map(([text, y]) => ({ kind: 'label', at: [x, y], text, size: cap }));

export const f16cJfs: PanelSpec = {
  id: 'f16c-jfs',
  title: 'F-16C ENG & JET START control panel',
  size: [228, 552],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 63, "ENG & JET START Control Panel" image',
    size: 'No dimensions in the guide. The image crops the left, top and bottom of the panel, so the plate is drawn to the crop.',
    checks: ['Same guide, p. 63 callouts 1-5 (JET FUEL RUN light, JFS switch, ENG CONT, AB RESET, MAX POWER)'],
    variant: 'DCS F-16C Block 50 (GE F110)',
  },
  plates: [{ d: 'M0 0H218Q222 0 222 4V548Q222 552 218 552H0Z' }],
  parts: [
    { kind: 'dzus', at: [17, 22], r: 13, slot: 0 },
    { kind: 'dzus', at: [212, 32], r: 13, slot: 0 },
    { kind: 'dzus', at: [15, 507], r: 13, slot: 0 },
    { kind: 'dzus', at: [208, 509], r: 13, slot: 0 },
    { kind: 'screw', at: [111, 107], r: 8 },
    { kind: 'screw', at: [175, 271], r: 8 },
    { kind: 'screw', at: [110, 419], r: 8 },

    ...letters(10, 11, [['E', 78], ['N', 94], ['G', 111], ['&', 150], ['J', 183], ['E', 200], ['T', 217], ['S', 255], ['T', 271], ['A', 288], ['R', 302], ['T', 316]]),
    ...letters(8, 8, [['F', 374], ['R', 390], ['I', 403], ['C', 416], ['T', 429], ['I', 443], ['O', 458], ['N', 473]]),
    { kind: 'path', d: 'M2 355H14M17 358V484M17 358L14 365M17 358L20 365M17 484L14 477M17 484L20 477' },

    { kind: 'label', at: [115, 13], text: 'JET FUEL', size: 9, width: 51 },
    { kind: 'path', d: 'M38 7L86 8M146 13L193 15' },
    { kind: 'label', at: [64, 31], text: 'RUN', size: 9, width: 22 },
    { kind: 'lamp', at: [63, 62], r: 18, lamp: 'jfs-run', colour: 'green' },
    { kind: 'label', at: [152, 35], text: 'START 1', size: 9, width: 43 },
    { kind: 'label', at: [187, 66], text: 'OFF', size: 9, width: 20 },
    { kind: 'label', at: [152, 94], text: 'START 2', size: 9, width: 44 },
    {
      kind: 'toggle', id: 'jfs', at: [152, 62], r: 13, reach: 1.5, initial: 'off', label: 'JFS switch', hitClass: 'raster-switch flcs-toggle jfs-toggle',
      hitAttrs: { 'data-jfs-lever': '' },
      positions: [{ id: 'start1', label: 'START 1' }, { id: 'off', label: 'OFF' }, { id: 'start2', label: 'START 2' }],
      inputs: [['jfs-start1', 'Select JFS START 1'], ['jfs-start2', 'Select JFS START 2']],
    },

    { kind: 'path', d: 'M38 125L190 131' },
    { kind: 'label', at: [115, 141], text: 'ENG CONT', size: 9, width: 53 },
    { kind: 'label', at: [112, 155], text: 'PRI', size: 9, width: 18 },
    { kind: 'label', at: [113, 258], text: 'SEC', size: 9, width: 20 },
    {
      kind: 'toggle', id: 'eng-cont', at: [106, 186], r: 9, reach: 2.3, face: 'paddle', initial: 'pri', label: 'ENG CONT', hitClass: 'raster-switch',
      positions: [{ id: 'pri', label: 'PRI' }, { id: 'sec', label: 'SEC' }],
      inputs: [['eng-cont-up', 'Select PRI'], ['eng-cont-down', 'Select SEC']], hit: 5,
    },
    { kind: 'path', fill: '#f3c9c4', width: 0.5, d: 'M82 166H95V180Q95 186 101 186H111Q117 186 117 180V166H133V243Q133 248 128 248H87Q82 248 82 243Z' },
    { kind: 'path', width: 0.3, d: 'M86 230H129M86 236H129M88 194V224M127 194V224' },

    { kind: 'label', at: [112, 316], text: 'AB RESET', size: 9, width: 54 },
    { kind: 'label', at: [149, 348], text: 'NORM', size: 9, width: 30 },
    { kind: 'label', at: [112, 376], text: 'ENG DATA', size: 9, width: 55 },
    {
      kind: 'toggle', id: 'ab-reset', at: [117, 345], r: 13, initial: 'norm', label: 'AB RESET', hitClass: 'raster-switch',
      positions: [{ id: 'reset', label: 'AB RESET' }, { id: 'norm', label: 'NORM' }, { id: 'data', label: 'ENG DATA' }],
      inputs: [['ab-reset-up', 'Select AB RESET'], ['ab-reset-down', 'Select ENG DATA']],
    },
    { kind: 'label', at: [166, 420], text: '+', size: 7 },

    { kind: 'label', at: [111, 466], text: 'MAX POWER', size: 9, width: 65 },
    { kind: 'label', at: [115, 526], text: 'OFF', size: 9, width: 20 },
    { kind: 'path', width: 0.9, d: 'M62 468Q55 496 62 524M150 468Q157 496 150 524' },
    {
      kind: 'toggle', id: 'max-power', at: [110, 486], r: 13, reach: 1.4, initial: 'off', label: 'MAX POWER', hitClass: 'raster-switch',
      positions: [{ id: 'max', label: 'MAX POWER' }, { id: 'off', label: 'OFF' }],
      inputs: [['max-power-up', 'Select MAX POWER'], ['max-power-down', 'Select OFF']],
    },
  ],
};
