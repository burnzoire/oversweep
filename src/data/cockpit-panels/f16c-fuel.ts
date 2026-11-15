import type { PanelSpec } from './types';

/**
 * F-16C FUEL control panel, as modelled in DCS.
 * Units are pixels of the guide's p. 67 FUEL panel image (445 x 177), which is
 * close to square-on, so it is used unwarped:
 *   python3 -I scripts/panel-trace.py <p67-image> <out> 0,0 445,0 0,177 445,177
 * The ENG FEED centre and detents come from its printed tick marks, not from the
 * knob, which stands proud of the panel and is offset by the camera angle.
 */
export const f16cFuel: PanelSpec = {
  id: 'f16c-fuel',
  title: 'F-16C FUEL control panel',
  size: [445, 177],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 67, "FUEL Control Panel" image',
    size: 'No dimensions in the guide; proportions are those of the DCS cockpit model.',
    checks: ['Same guide, p. 67 callouts 1-4 (FUEL MASTER, TANK INERTING, ENG FEED, AIR REFUEL)'],
    variant: 'DCS F-16C Block 50',
  },
  plates: [{ d: 'M8 3H432Q437 3 437 8V165Q437 170 432 170H8Q3 170 3 165V8Q3 3 8 3Z' }],
  parts: [
    { kind: 'dzus', at: [17, 43], r: 13, slot: 0 },
    { kind: 'dzus', at: [427, 43], r: 13, slot: 0 },
    { kind: 'dzus', at: [17, 128], r: 13, slot: 0 },
    { kind: 'dzus', at: [427, 131], r: 13, slot: 0 },
    { kind: 'screw', at: [165, 25], r: 8 },
    { kind: 'screw', at: [342, 147], r: 8 },

    { kind: 'label', at: [45, 61], text: 'F', size: 12 },
    { kind: 'label', at: [45, 80.5], text: 'U', size: 12 },
    { kind: 'label', at: [45, 100], text: 'E', size: 12 },
    { kind: 'label', at: [45, 119.5], text: 'L', size: 12 },

    { kind: 'label', at: [81, 21], text: 'MASTER', size: 9, width: 43 },
    { kind: 'label', at: [82, 133], text: 'OFF', size: 9, width: 21 },
    {
      kind: 'toggle', id: 'fuel-master', at: [83, 48], r: 10, reach: 2, face: 'paddle', initial: 'master', hit: 2.6,
      label: 'Fuel master', hitClass: 'raster-switch',
      positions: [{ id: 'master', label: 'MASTER' }, { id: 'off', label: 'OFF' }],
      inputs: [['fuel-master-up', 'Move FUEL MASTER up', true], ['fuel-master-down', 'Move FUEL MASTER down', true]],
    },
    // Red guard, closed over the switch; the lever shows through its top notch.
    { kind: 'path', fill: '#f3c9c4', width: 0.5, d: 'M60 30H73V44Q73 50 79 50H88Q94 50 94 44V30H107V113Q107 117 103 117H64Q60 117 60 113Z' },
    { kind: 'path', width: 0.3, d: 'M64 100H103M64 106H103M66 60V96M101 60V96' },
    { kind: 'pushbutton', id: 'fuel-master-guard', at: [83.5, 88], r: 22, shape: 'square', bare: true, label: 'FUEL MASTER switch guard', hitAttrs: { 'data-control': 'fuel-master-guard', class: 'fuel-master-guard' } },

    { kind: 'label', at: [165, 54], text: 'TANK', size: 9, width: 21 },
    { kind: 'label', at: [165, 68], text: 'INERTING', size: 9, width: 38 },
    { kind: 'label', at: [162, 138], text: 'OFF', size: 9, width: 21 },
    {
      kind: 'toggle', id: 'tank-inerting', at: [167, 103], r: 15, initial: 'off', label: 'Tank inerting', hitClass: 'raster-switch',
      positions: [{ id: 'on', label: 'TANK INERTING' }, { id: 'off', label: 'OFF' }],
      inputs: [['tank-inerting-up', 'Select TANK INERTING'], ['tank-inerting-down', 'Select TANK INERTING OFF']],
    },

    { kind: 'label', at: [268, 24], text: 'ENG FEED', size: 9, width: 52 },
    { kind: 'label', at: [205, 49], text: '+', size: 7 },
    { kind: 'label', at: [268, 44], text: 'AFT', size: 9, width: 16 },
    { kind: 'label', at: [214, 64], text: 'NORM', size: 9, width: 30 },
    { kind: 'label', at: [317, 64], text: 'FWD', size: 9, width: 23 },
    { kind: 'label', at: [207, 102], text: 'OFF', size: 9, width: 20 },
    { kind: 'path', d: 'M268 52V60M237 69L243 74M306 72L300 76M221 103H229' },
    {
      kind: 'rotary', id: 'fuel-feed', at: [268, 100], r: 30, initial: 'off', label: 'Engine feed',
      hitClass: 'rotary-control prestart-control primary', hitAttrs: { 'data-prestart-position': 'fuel-feed' },
      positions: [{ id: 'off', angle: -90 }, { id: 'norm', angle: -45 }, { id: 'aft', angle: 0 }, { id: 'fwd', angle: 45 }],
      inputs: [['fuel-feed-ccw', 'Turn ENG FEED anticlockwise'], ['fuel-feed-cw', 'Turn ENG FEED clockwise']],
    },

    { kind: 'label', at: [368, 24], text: 'AIR REFUEL', size: 9, width: 62 },
    { kind: 'label', at: [368, 43], text: 'OPEN', size: 9, width: 28 },
    { kind: 'label', at: [370, 108], text: 'CLOSE', size: 9, width: 35 },
    {
      kind: 'toggle', id: 'air-refuel', at: [369, 74], r: 12, reach: 1.4, face: 'square', initial: 'close', label: 'Air refuel', hitClass: 'raster-switch',
      positions: [{ id: 'open', label: 'OPEN' }, { id: 'close', label: 'CLOSE' }],
      inputs: [['air-refuel-up', 'Select AIR REFUEL OPEN'], ['air-refuel-down', 'Select AIR REFUEL CLOSE']],
    },
  ],
};
