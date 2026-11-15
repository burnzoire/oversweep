import type { Dial, PanelSpec } from './types';

/**
 * F-16C engine instrument stack (OIL, NOZ POS, RPM, FTIT), as modelled in DCS.
 * Units are pixels of the guide's p. 50 "Engine Instruments" image (220 x 588),
 * used unwarped:
 *   python3 -I scripts/panel-trace.py <p50-image> <out> 0,0 220,0 0,588 220,588
 * Each dial's value-to-angle stops are measured from its printed numerals and
 * drive the live needles (the page reads them from data-stops).
 */
const n = (from: number, to: number, step: number) => Array.from({ length: Math.round((to - from) / step) + 1 }, (_, i) => from + i * step);

const oil: Dial = {
  kind: 'dial', at: [55, 60], r: 32, needle: 'oil', initial: 0, needleLength: 28,
  stops: [[0, 108], [20, 180], [40, 246], [60, 304], [80, 360], [100, 421]],
  ticks: [{ from: 0, to: 100, step: 10, len: 4 }, { from: 0, to: 100, step: 20, len: 7, width: 0.6 }],
  numerals: n(0, 100, 20).map(v => ({ text: String(v), value: v, size: 6, radius: 22 })),
  labels: [{ text: 'OIL', at: [55, 70], size: 5 }],
};
const noz: Dial = {
  kind: 'dial', at: [76, 172], r: 47, needle: 'noz', initial: 0, needleLength: 40,
  stops: [[0, 63], [20, 113], [40, 154], [60, 206], [80, 248], [100, 293]],
  ticks: [{ from: 0, to: 100, step: 10, len: 7, width: 0.6 }],
  numerals: n(0, 100, 20).map(v => ({ text: String(v), value: v, size: 8, radius: 33 })),
  labels: [{ text: 'NOZ POS', at: [74, 134], size: 8, width: 50 }, { text: '% OPEN', at: [73, 146], size: 6, width: 34 }],
};
const rpm: Dial = {
  kind: 'dial', at: [88, 326], r: 66, needle: 'rpm', initial: 0, needleLength: 60,
  stops: [[0, -10], [20, 26], [40, 66], [60, 111], [70, 145], [80, 180], [90, 224], [100, 275], [110, 312]],
  ticks: [{ from: 0, to: 110, step: 2, len: 5 }, { from: 0, to: 110, step: 10, len: 11, width: 0.7 }],
  numerals: [0, 20, 40, 60, 70, 80, 90, 100, 110].map(v => ({ text: String(v), value: v, size: 9, radius: 46 })),
  labels: [{ text: 'RPM', at: [88, 296], size: 6, width: 22 }, { text: 'PERCENT', at: [87, 307], size: 5.5, width: 36 }],
};
const ftit: Dial = {
  kind: 'dial', at: [126, 493], r: 66, needle: 'ftit', initial: 200, needleLength: 60,
  stops: [[200, 110], [300, 131], [400, 153], [500, 172], [600, 193], [700, 215], [800, 270], [900, 327], [1000, 381], [1100, 401], [1200, 423]],
  ticks: [{ from: 200, to: 1200, step: 20, len: 5 }, { from: 200, to: 1200, step: 100, len: 11, width: 0.7 }],
  numerals: n(200, 1200, 100).map(v => ({ text: String(v / 100), value: v, size: 9, radius: 50 })),
  labels: [{ text: 'FTIT', at: [120, 459], size: 9, width: 30 }, { text: '°C×100', at: [120, 472], size: 6, width: 30 }],
};

export const f16cEngine: PanelSpec = {
  id: 'f16c-engine',
  title: 'F-16C engine instruments',
  size: [220, 588],
  unit: 3,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 50, "Engine Instruments" image',
    size: 'No dimensions in the guide. The panel cut-out around the stack is drawn from the same image; its right edge is shadowed and approximate.',
    checks: ['Same guide, p. 50 callouts 1-4 (OIL, NOZ POS, RPM, FTIT scales)'],
    variant: 'DCS F-16C Block 50 (GE F110)',
  },
  plates: [{ d: 'M2 0H140Q148 110 172 240Q205 330 207 420V588H2Z' }],
  parts: [oil, noz, rpm, ftit],
};
