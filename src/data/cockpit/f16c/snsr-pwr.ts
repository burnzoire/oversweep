import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C SNSR PWR (sensor power) panel (right console), DCS.
 *
 * Reference: the guide's p. 75 "SNSR PWR Control Panel" cockpit image
 * (440 x 134 JPEG, extracted with `pdfimages -j -f 75 -l 75`, image 002). The
 * image shows only one fastener of the panel, so it is traced unrectified; the
 * camera is nearly square-on. Measurements below are in reference pixels and
 * stored in mm.
 */
const PX = 3.1;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 75';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });
/** Switch pivots on their legends' centre lines (x) and the bushing row (y). */
const SW: Record<string, [number, number]> = {
  'left-hdpt': [78, 70], 'right-hdpt': [164, 70], fcr: [250, 70], 'rdr-alt': [337, 70],
};
const latch = [{ kind: 'latch' as const, verified: false, note: 'The guide image shows a lever-lock slot in the bushing, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }];
const onOff = [{ id: 'on', label: 'On', hold: 'stable' as const }, { id: 'off', label: 'OFF', hold: 'stable' as const }];

export const snsrPwr: PanelSpec = {
  id: 'snsr-pwr',
  title: 'SNSR PWR panel',
  canvas: [mm(440), mm(134)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 75,
    image: 'p. 75 "SNSR PWR Control Panel" cockpit image, 440 x 134 px',
    rectify: 'not rectified: only one fastener of the panel is in the image, and the camera is nearly square-on',
    pxPerMm: PX,
    scale: 'Same scale as the AIR COND panel image (3.1 px/mm): the guide shoots the right-console panels at one width, and the lever-lock bushings (about 38 px across) match the shared 12.5 mm lever-lock bushing.',
    shown: { 'left-hdpt': 'off', 'right-hdpt': 'off', fcr: 'off', 'rdr-alt': 'off' },
    unresolved: [
      'The panel\'s top, bottom and left edges are cropped in the reference and its other fasteners are out of frame; the drawn plate edges sit just inside the crop and only the visible fastener is drawn.',
      'The ON (forward) positions of the switches carry no legend; the switch titles sit above them.',
      'The switches are drawn as lever-locks: the reference shows the lock slot in each bushing. Their levers are drawn square-on.',
    ],
  },
  plate: [
    { d: path('M6 4H434Q438 4 438 8V126Q438 130 434 130H6Q2 130 2 126V8Q2 4 6 4Z') },
    // Raised face, notched round the bottom-right DZUS. Notch edges measured by
    // brightness gradient (px): top 72.5 (cols 434-438), left 410.5 (rows 110-117,
    // below the fastener rim). Drawn at x 410, y 72 with a 12 px inner radius; the
    // notch runs to the plate's cropped bottom edge.
    { d: path('M6 4H434Q438 4 438 8V72H422Q410 72 410 84V130H6Q2 130 2 126V8Q2 4 6 4Z'), raised: true },
  ],
  engraving: [
    // Vertical title: SNSR beside PWR.
    ...([['S', 16], ['N', 36], ['S', 56], ['R', 75]] as const).map(([t, y]) => L([26, y], t, 14, 10)),
    ...([['P', 25], ['W', 46], ['R', 66]] as const).map(([t, y]) => L([43, y], t, 14, 12)),
    L([78, 14], 'LEFT', 10, 26), L([78, 30], 'HDPT', 10, 26), L([78, 109], 'OFF', 10, 21),
    L([164, 16], 'RIGHT', 10, 32), L([164, 32], 'HDPT', 10, 26), L([164, 109], 'OFF', 10, 21),
    L([250, 34], 'FCR', 10, 21), L([250, 109], 'OFF', 10, 21),
    L([337, 21], 'RDR', 10, 21), L([337, 37], 'ALT', 10, 21), L([337, 109], 'OFF', 10, 21),
    L([381, 75], 'STBY', 10, 26),
    // Printed cross above the screw.
    { kind: 'path', pen: 'fine', d: path('M388 39H396M392 35V43') },
  ],
  placements: [
    { component: 'screw', at: pt(28, 103) },
    { component: 'screw-medium', at: pt(389, 108) },
    { component: 'dzus', at: pt(425.5, 92.5) },
    ...Object.entries(SW).map(([id, at]) => ({ component: 'toggle-large-lock' as const, control: id, at: pt(...at) })),
  ],
  controls: [
    {
      id: 'left-hdpt', name: 'LEFT HDPT switch', type: 'toggle', travel: 'vertical', positions: onOff, initial: 'off', latched: true, protections: latch,
      description: 'Powers the sensor on the left chin hardpoint, normally the AN/ASQ-213 HARM targeting system pod.',
      source: src,
    },
    {
      id: 'right-hdpt', name: 'RIGHT HDPT switch', type: 'toggle', travel: 'vertical', positions: onOff, initial: 'off', latched: true, protections: latch,
      description: 'Powers the sensor on the right chin hardpoint, normally the AN/AAQ-33 advanced targeting pod.',
      source: src,
    },
    {
      id: 'fcr', name: 'FCR switch', type: 'toggle', travel: 'vertical', positions: onOff, initial: 'off', latched: true, protections: latch,
      description: 'Powers the AN/APG-68 fire control radar.',
      source: src,
    },
    {
      id: 'rdr-alt', name: 'RDR ALT switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'rdr-alt', label: 'RDR ALT', hold: 'stable' },
        { id: 'stby', label: 'STBY', hold: 'stable' },
        { id: 'off', label: 'OFF', hold: 'stable' },
      ],
      initial: 'off', latched: true, protections: latch,
      description: 'Powers the radar altimeter. RDR ALT: the altimeter transmits. STBY: powered but not transmitting. OFF: powered off.',
      source: src,
    },
  ],
  indicators: [],
};
