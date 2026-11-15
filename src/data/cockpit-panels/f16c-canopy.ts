import type { PanelSpec } from './types';

/**
 * F-16C canopy switch and canopy handle, as modelled in DCS.
 * Not a flat panel: the guide's only view (p. 73, 438 x 307) looks down on the
 * yellow assembly at an angle, so it is drawn as seen in that view, in that
 * image's pixels, with no warp. Treat proportions as indicative.
 */
const lever = 'M205 72L290 46L300 70L262 84L336 238L392 230L398 248L388 256L336 264L318 262L233 100L212 106Z' +
  'M318 172L384 160Q392 159 393 167L398 238Q398 246 390 248L330 258Z' +
  'M262 90L318 210';

export const f16cCanopy: PanelSpec = {
  id: 'f16c-canopy',
  title: 'F-16C canopy switch and canopy handle',
  size: [438, 307],
  unit: 4,
  source: {
    trace: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026 edition), p. 73, "Canopy Switch & Canopy Handle" image (callouts 1 and 2)',
    size: 'No dimensions and no square-on view in the guide. Drawn as seen in the guide image; not orthographic.',
    checks: ['Same guide, p. 73 text (switch Up / Center / Down, handle locked and unlocked)'],
    variant: 'DCS F-16C Block 50',
  },
  plates: [{ d: 'M8 4H430Q434 4 434 8V299Q434 303 430 303H8Q4 303 4 299V8Q4 4 8 4Z', fill: '#fbfbfb' }],
  parts: [
    // Y-shaped arm carrying the canopy switch paddle (upper left) and the foot (lower left).
    { kind: 'path', fill: '#fff', width: 0.45, d: 'M226 88L108 104L112 124L214 112L204 120L74 240L86 252L222 126Z' },
    { kind: 'path', fill: '#fff', width: 0.45, d: 'M34 252L80 238Q86 236 88 242L92 276Q93 284 86 286L44 294Q36 296 35 288Z' },
    { kind: 'screw', at: [160, 72], r: 9 },
    { kind: 'label', at: [66, 165], text: 'CANOPY SWITCH', size: 8, width: 78 },
    { kind: 'label', at: [345, 288], text: 'CANOPY HANDLE', size: 8, width: 78 },
    {
      kind: 'handle', id: 'canopy-switch', at: [76, 116], initial: 'centre', label: 'Canopy switch',
      hitClass: 'raster-switch prestart-control primary', hitAttrs: { 'data-prestart-position': 'canopy' }, hitSize: [80, 70],
      d: 'M-30 -16L18 -26Q24 -27 26 -21L33 1Q35 7 29 9L-18 26Q-26 28 -29 21L-34 -8Q-35 -15 -30 -16ZM-24 -8L22 -16',
      positions: [{ id: 'up', dy: -8 }, { id: 'centre', dy: 0 }, { id: 'down', dy: 8 }],
      inputs: [['canopy-up', 'Raise canopy'], ['canopy-down', 'Hold canopy switch down']],
    },
    {
      kind: 'handle', id: 'canopy-handle', at: [0, 0], initial: 'unlocked', label: 'Canopy handle', pressedBy: 'canopy-lock', hitSize: [0, 0], d: lever,
      positions: [{ id: 'unlocked' }, { id: 'locked', dx: -16, dy: 26 }],
    },
    { kind: 'pushbutton', id: 'canopy-lock', at: [330, 200], r: 52, shape: 'square', bare: true, label: 'Close canopy handle', hitAttrs: { 'data-control': 'canopy-lock', 'aria-pressed': 'false' } },
  ],
};
