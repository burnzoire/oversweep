import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';

/**
 * F-16C FUEL QTY SEL panel (instrument panel, left of the fuel quantity indicator), DCS.
 *
 * Reference: the guide's p. 54 "FUEL QTY SEL Panel" cockpit image (220 x 436
 * JPEG, extracted with `pdfimages -j -f 54 -l 54`, image 002). The image is
 * square-on (both hold-down screws and the legend rows are level), so it is
 * used unwarped:
 *   python3 -I scripts/panel-trace.py <p54-002.png> <out> 0,0 219,0 0,435 219,435
 * Measurements below are in reference pixels and stored in mm.
 */
const PX = 3.66;
const { pt, mm, path } = tracer(PX);
const src = 'DCS F-16C guide p. 54';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

/**
 * Selector detents, evenly 48.4° apart from TEST to EXT CTR: the legend centres
 * lie at 327, 37, 74, 109, 152 and 209° about the knob (the spread of 242° over
 * five steps); the index in the image, at NORM, reads 21°.
 */
const KNOB: [number, number] = [124.5, 147];
const detent = (k: number) => +((327.5 + 48.3 * k) % 360).toFixed(1);

export const fuelQtySel: PanelSpec = {
  id: 'fuel-qty-sel',
  title: 'FUEL QTY SEL panel',
  canvas: [mm(214), mm(431)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 54,
    image: 'p. 54 "FUEL QTY SEL Panel" cockpit image, 220 x 436 px',
    rectify: 'python3 -I scripts/panel-trace.py <p54-002.png> <out> 0,0 219,0 0,435 219,435 (no warp: the image is square-on)',
    pxPerMm: PX,
    scale: 'The panel has no DZUS fasteners. The scale is set so the EXT FUEL TRANS bushing (about 38 px across) measures the shared large lever-lock radius (5.2 mm); the two hold-down screw heads (about 25 px) then match the shared 3.4 mm screw and the legends come out at the usual 2.7 to 3.4 mm cap height.',
    shown: { 'fuel-qty-sel': 'norm', 'ext-fuel-trans': 'norm' },
    unresolved: [
      'The FUEL QTY SEL legends sit unevenly round the knob (327, 37, 74, 109, 152, 209°); the detents are drawn evenly spaced across that span and the legends are left where the guide prints them.',
      'The knob is a round dome with a rectangular tail grip opposite the index (its own component, `knob-round-tail`). The tail stands proud, so the camera shows it shifted down; it is drawn square-on.',
      'The EXT FUEL TRANS bushing shows a lock-insert slot, so it is drawn as a lever-lock toggle. The guide text does not say.',
      'The round socket above the panel\'s left side is on the instrument panel, not on this panel, and is not drawn.',
    ],
  },
  plate: [
    // Outline by brightness gradient (px): top 5.5, right 209.5 down to y 300, then a chamfer to (183, 410);
    // bottom 426.5; lower-left foot from x 4.5 below y 317.5; left edge 46.5 from y 67.5; upper tab from x 108.5.
    { d: path('M116.5 5.5H201.5Q209.5 5.5 209.5 13.5V300L183.5 410Q179.5 426.5 171 426.5H12.5Q4.5 426.5 4.5 418.5V325.5Q4.5 317.5 12.5 317.5H38.5Q46.5 317.5 46.5 309.5V75.5Q46.5 67.5 54.5 67.5H100.5Q108.5 67.5 108.5 59.5V13.5Q108.5 5.5 116.5 5.5Z') },
  ],
  engraving: [
    // Vertical panel name down the left edge.
    ...([['F', 92], ['U', 117], ['E', 140], ['L', 162], ['Q', 207], ['T', 229], ['Y', 254], ['S', 293], ['E', 316], ['L', 338]] as const)
      .map(([t, y]) => L([53.5, y], t, 19, 11)),
    L([92.5, 97], 'TEST', 11, 31),
    L([162.5, 97], 'NORM', 11, 35),
    L([188.5, 129], 'RSVR', 11, 33),
    L([183, 161], 'INT', 11, 20),
    L([187, 176], 'WING', 11, 30),
    L([157, 201], 'EXT', 11, 23),
    L([157, 214], 'WING', 11, 30),
    L([91, 201], 'EXT', 11, 23),
    L([91, 214], 'CTR', 11, 24),
    L([125, 244], 'EXT', 12.5, 23),
    L([124.5, 262], 'FUEL TRANS', 12.5, 85),
    L([124, 279], 'NORM', 11, 34),
    L([123.5, 361], 'WING FIRST', 11, 73),
    L([41, 382], '+', 7),
  ],
  placements: [
    { component: 'screw', at: pt(153, 48) },
    { component: 'screw', at: pt(123, 404) },
    { component: 'knob-round-tail', control: 'fuel-qty-sel', at: pt(...KNOB) },
    { component: 'toggle-large-lock', control: 'ext-fuel-trans', at: pt(124.5, 320) },
  ],
  controls: [
    {
      id: 'fuel-qty-sel', name: 'FUEL QTY SEL knob', type: 'rotary',
      positions: [
        { id: 'test', label: 'TEST', hold: 'stable', angle: detent(0) },
        { id: 'norm', label: 'NORM', hold: 'stable', angle: detent(1) },
        { id: 'rsvr', label: 'RSVR', hold: 'stable', angle: detent(2) },
        { id: 'int-wing', label: 'INT WING', hold: 'stable', angle: detent(3) },
        { id: 'ext-wing', label: 'EXT WING', hold: 'stable', angle: detent(4) },
        { id: 'ext-ctr', label: 'EXT CTR', hold: 'stable', angle: detent(5) },
      ],
      initial: 'norm',
      description: 'Chooses which tanks the two pointers of the fuel quantity indicator show. TEST: both pointers go to 2,000 lb, the totalizer shows 6,000 lb and the FWD FUEL LOW and AFT FUEL LOW caution lights come on. NORM: AL shows the aft reservoir plus the A-1 fuselage tank, FR the forward reservoir plus the F-1 and F-2 fuselage tanks; bingo fuel is worked out from total fuselage fuel. RSVR: AL the aft reservoir only, FR the forward reservoir only. INT WING: AL the left internal wing tank, FR the right. EXT WING: AL the left external wing tank, FR the right. EXT CTR: FR the external centreline tank, AL reads 0.',
      source: src,
    },
    {
      id: 'ext-fuel-trans', name: 'EXT FUEL TRANS switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'norm', label: 'NORM', hold: 'stable' }, { id: 'wing-first', label: 'WING FIRST', hold: 'stable' }],
      initial: 'norm',
      protections: [{ kind: 'latch', verified: false, note: 'A lever-lock slot in the bushing marks it as a lever-lock toggle, so it is drawn as latched. It moves with a plain click; the lock is not simulated.' }],
      description: 'Sets the order fuel is taken from the external tanks. NORM: the centreline tank first, then the wing tanks. WING FIRST: the wing tanks first, then the centreline tank.',
      source: src,
    },
  ],
  indicators: [],
};
