import type { PanelSpec } from './types';

/**
 * F-16C AIR COND control panel, as modelled in DCS.
 * Units are pixels of the guide's p. 76 AIR COND panel image (440 x 176), close to
 * square-on, used unwarped:
 *   python3 -I scripts/panel-trace.py <p76-image> <out> 0,0 440,0 0,176 440,176
 * Knob centres and detents come from the printed scale and leader lines.
 */
const T: [number, number] = [153, 91];
/** Arc on the TEMP scale between two angles (clockwise from 12 o'clock). */
const arc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => `${(T[0] + r * Math.sin((a * Math.PI) / 180)).toFixed(1)} ${(T[1] - r * Math.cos((a * Math.PI) / 180)).toFixed(1)}`;
  return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
};

export const f16cAir: PanelSpec = {
  id: 'f16c-air',
  title: 'F-16C AIR COND control panel',
  size: [440, 176],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 76, "AIR COND Control Panel" image',
    size: 'No dimensions in the guide; proportions are those of the DCS cockpit model.',
    checks: ['Same guide, p. 76 callouts 1-2 (TEMP knob, AIR SOURCE knob)'],
    variant: 'DCS F-16C Block 50',
  },
  plates: [{ d: 'M8 3H432Q437 3 437 8V165Q437 170 432 170H8Q3 170 3 165V8Q3 3 8 3Z' }],
  parts: [
    { kind: 'dzus', at: [15, 47], r: 12, slot: 0 },
    { kind: 'dzus', at: [15, 135], r: 12, slot: 0 },
    { kind: 'dzus', at: [422, 43], r: 12, slot: 0 },
    { kind: 'dzus', at: [420, 128], r: 12, slot: 0 },
    { kind: 'screw', at: [253, 32], r: 8 },
    { kind: 'screw', at: [64, 146], r: 8 },

    { kind: 'label', at: [35, 78], text: 'A', size: 13 },
    { kind: 'label', at: [35, 95], text: 'I', size: 13 },
    { kind: 'label', at: [35, 112], text: 'R', size: 13 },
    { kind: 'label', at: [48, 68], text: 'C', size: 13 },
    { kind: 'label', at: [48, 85], text: 'O', size: 13 },
    { kind: 'label', at: [48, 102], text: 'N', size: 13 },
    { kind: 'label', at: [48, 120], text: 'D', size: 13 },

    { kind: 'label', at: [150, 16], text: 'TEMP', size: 9, width: 20 },
    { kind: 'label', at: [153, 36], text: 'AUTO', size: 9, width: 28 },
    { kind: 'label', at: [98, 60], text: 'COOL', size: 9, width: 27 },
    { kind: 'label', at: [208, 57], text: 'WARM', size: 9, width: 30 },
    { kind: 'label', at: [83, 91], text: 'TEMP\nOFF', size: 9, width: 27 },
    { kind: 'label', at: [98, 125], text: 'COOL', size: 9, width: 27 },
    { kind: 'label', at: [208, 122], text: 'WARM', size: 9, width: 30 },
    { kind: 'label', at: [153, 145], text: 'MAN', size: 9, width: 22 },
    { kind: 'path', d: `${arc(48, -55, -18)}${arc(48, 18, 52)}${arc(48, 128, 162)}${arc(48, 198, 232)}` },
    { kind: 'path', d: 'M101 74L107 79V86M101 108L107 103V96M205 74L199 79V86M205 108L199 103V96M100 84H107M100 98H107' },
    {
      kind: 'rotary', id: 'air-temp', at: T, r: 30, initial: 'auto', label: 'Temperature', hitClass: 'rotary-control prestart-control',
      hitAttrs: { 'data-prestart-position': 'air-temp' },
      positions: [{ id: 'auto', angle: -5 }],
      inputs: [['air-temp-ccw', 'Turn TEMP toward COOL'], ['air-temp-cw', 'Turn TEMP toward WARM']],
    },

    { kind: 'label', at: [336, 16], text: 'AIR SOURCE', size: 9, width: 61 },
    { kind: 'label', at: [290, 36], text: 'DUMP', size: 9, width: 30 },
    { kind: 'label', at: [379, 36], text: 'RAM', size: 9, width: 22 },
    { kind: 'label', at: [262, 70], text: 'NORM', size: 9, width: 30 },
    { kind: 'label', at: [265, 112], text: 'OFF', size: 9, width: 20 },
    { kind: 'path', d: 'M306 37H312L316 45M353 45L358 37H364M280 69L292 71M279 112Q288 112 293 107' },
    { kind: 'label', at: [252, 142], text: '+', size: 7 },
    {
      kind: 'rotary', id: 'air-source', at: [328, 88], r: 32, initial: 'off', label: 'Air source',
      hitClass: 'rotary-control prestart-control primary', hitAttrs: { 'data-prestart-position': 'air-source' },
      positions: [{ id: 'off', angle: -113 }, { id: 'norm', angle: -68 }, { id: 'dump', angle: -22 }, { id: 'ram', angle: 25 }],
      inputs: [['air-source-ccw', 'Turn AIR SOURCE anticlockwise'], ['air-source-cw', 'Turn AIR SOURCE clockwise']],
    },
  ],
};
