import type { Annunciator, PanelSpec } from './types';

/**
 * F-16C right eyebrow warning lights, as modelled in DCS.
 * The guide's p. 46 image views the strip at about 45 degrees. It was rectified on
 * the strip's four outer corners:
 *   python3 -I scripts/panel-trace.py <p46-image> <out> 75,15=10,10 430,350=498,10 20,78=10,94 370,450=498,94 510 104
 * The far end stays foreshortened after the warp, so the five identical lamp
 * modules are drawn at equal width; legends and their split follow the image.
 */
const modules: [string, string | null, string | undefined, string | undefined, number, number?][] = [
  // [upper legend, lower legend (null = one lamp), upper lamp, lower lamp, upper width, lower width]
  ['ENG FIRE', 'ENGINE', undefined, 'warn-engine', 78, 66],
  ['HYD/OIL\nPRESS', null, 'warn-hyd', undefined, 66],
  ['FLCS', 'DBU ON', undefined, undefined, 40, 62],
  ['TO/LDG\nCONFIG', null, undefined, undefined, 60],
  ['CANOPY', 'OXY LOW', 'warn-canopy', undefined, 62, 64],
];
const W = 97.6;

export const f16cEyebrow: PanelSpec = {
  id: 'f16c-eyebrow',
  title: 'F-16C right eyebrow warning lights',
  size: [510, 104],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 46, "Right Eyebrow Lights" image, rectified on the strip corners',
    size: 'No dimensions in the guide. The strip is shown obliquely, so module widths are equalised after rectification.',
    checks: ['Same guide, p. 46 light list 1-8 (ENG FIRE, ENGINE, HYD/OIL PRESS, FLCS, DBU ON, TO/LDG CONFIG, CANOPY, OXY LOW)'],
    variant: 'DCS F-16C Block 50',
  },
  plates: [{ d: 'M6 2H504Q508 2 508 6V98Q508 102 504 102H6Q2 102 2 98V6Q2 2 6 2Z' }],
  parts: modules.map(([upper, lower, lu, ll, wu, wl], i): Annunciator => ({
    kind: 'annunciator', at: [10 + i * W, 10], size: [W - 3, 84], cap: 13, colour: 'red', inset: 3,
    divider: lower !== null,
    cells: lower === null
      ? upper.split('\n').map(text => ({ text, lamp: lu, width: (wu * text.length) / Math.max(...upper.split('\n').map(l => l.length)) }))
      : [{ text: upper, lamp: lu, width: wu }, { text: lower, lamp: ll, width: wl }],
  })),
};
