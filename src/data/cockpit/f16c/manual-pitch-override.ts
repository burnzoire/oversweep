import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C MANUAL PITCH override (MPO) switch (left console), DCS.
 *
 * Reference: the guide's p. 62 "Manual Pitch Override Switch" cockpit image
 * (160 x 139 JPEG, extracted with `pdfimages -j -f 62 -l 62`, image 005). The
 * image is square-on (screws and legends level), so it is used unwarped:
 *   python3 -I scripts/panel-trace.py <p62-005.png> <out> 0,0 159,0 0,138 159,138
 * Measurements below are in reference pixels and stored in mm.
 */
const PX = 3.3;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 62';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

export const manualPitchOverride: PanelSpec = {
  id: 'manual-pitch-override',
  title: 'Manual pitch override switch',
  canvas: [mm(160), mm(139)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 62,
    image: 'p. 62 "Manual Pitch Override Switch" cockpit image, 160 x 139 px',
    rectify: 'python3 -I scripts/panel-trace.py <p62-005.png> <out> 0,0 159,0 0,138 159,138 (no warp: the image is square-on)',
    pxPerMm: PX,
    scale: 'No DZUS fasteners show. The scale is set so the switch grommet (about 17 px radius) measures the shared large plain toggle (5.2 mm); the hold-down screws (about 9 px radius) then match the shared 2.8 mm screw and the legends come out at about 3 mm cap height.',
    shown: { mpo: 'norm' },
    unresolved: [
      'The guide image is a close crop of the switch; the plate edges do not show, so the plate is drawn to the crop.',
      'The switch shows the orange-red grommet of a plain toggle.',
      'The two wire bails above and below the switch are drawn as fixed bars seen from the front, equidistant from the switch (the camera shifts them slightly left).',
    ],
  },
  plate: [{ d: path('M6 2H154Q158 2 158 6V133Q158 137 154 137H6Q2 137 2 133V6Q2 2 6 2Z') }],
  engraving: [
    L([81.5, 14], 'MANUAL PITCH', 10, 79),
    L([41, 78], 'OVRD', 10, 28),
    L([125, 78], 'NORM', 10, 30),
    // Wire bails above and below the switch (guards for a grip when hanging upside down in the straps).
    { kind: 'path', pen: 'heavy', d: path('M47 29H119Q122.5 29 122.5 32.5Q122.5 36 119 36H47Q43.5 36 43.5 32.5Q43.5 29 47 29ZM47 117H119Q122.5 117 122.5 120.5Q122.5 124 119 124H47Q43.5 124 43.5 120.5Q43.5 117 47 117Z') },
  ],
  placements: [
    { component: 'screw-medium', at: pt(17.5, 97) },
    { component: 'screw-medium', at: pt(148.5, 97) },
    { component: 'toggle-large', control: 'mpo', at: pt(83, 77) },
  ],
  controls: [
    {
      id: 'mpo', name: 'MANUAL PITCH override switch', type: 'toggle', travel: 'horizontal',
      positions: [{ id: 'ovrd', label: 'OVRD', hold: 'momentary', spring: 'norm' }, { id: 'norm', label: 'NORM', hold: 'stable' }],
      initial: 'norm',
      description: 'For recovery from a deep stall. Held at OVRD, it gives the horizontal stabilators more authority so the pilot can pump the pitch oscillations up until there is enough pitch rate to recover. Roll and yaw commands from the side stick are cut off while it is held, but the rudder pedals keep yaw authority. Spring-loaded to NORM. The bails either side give the hand something to grip when hanging in the straps in an inverted departure.',
      source: src,
    },
  ],
  indicators: [],
};
