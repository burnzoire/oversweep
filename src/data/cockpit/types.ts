/**
 * Shared cockpit model.
 *
 * An aircraft catalogue lists cockpit areas and their panels in navigation
 * order. A panel is assembled from shared components placed by pivot on a
 * fixed orthographic plate. Every drawing dimension is in one common drawing
 * unit, the millimetre (`mm`), so a large toggle is the same size on every
 * panel; the assembled panel is then scaled as a whole for display.
 *
 * Components are catalogued twice, on purpose:
 * - artwork (`components.ts`): what a toggle, knob or lamp module looks like,
 *   with its fixed dimensions;
 * - movement (`ControlDef` below): the ordered positions a control can take,
 *   how each position behaves and which transitions are protected.
 * Procedures refer to controls and indicators by their stable ids
 * (`<panel>.<control>`), never by artwork.
 */
export type Pt = [x: number, y: number];
/** x, y, width, height in mm, panel coordinates. */
export type Rect = [x: number, y: number, w: number, h: number];

/* ------------------------------------------------------------------ movement */

/**
 * How a position holds:
 * - `stable`: stays where it is put;
 * - `momentary`: springs back to `spring` when released;
 * - `magnetic`: held by a solenoid while `holdWhile` is true, then drops to
 *   `releasesTo` (physical-actuation release only models the drop on demand).
 */
export interface ControlPosition {
  id: string;
  /** Legend as engraved on the panel. */
  label: string;
  hold?: 'stable' | 'momentary' | 'magnetic';
  /** Momentary: position it springs back to on release. */
  spring?: string;
  /** Magnetic: position it drops to, and the condition that holds it. */
  releasesTo?: string;
  holdWhile?: string;
  /** Rotary only: detent angle, degrees clockwise from 12 o'clock. */
  angle?: number;
  /** A drawn key pose the control moves through, not a stop: single steps skip it. */
  pass?: boolean;
  /** The simulator's value at this position (e.g. the DCS cockpit argument), for procedures. */
  value?: number;
}

/**
 * A protected transition. `latch`: the lever is mechanically latched and must
 * be released (for example pulled out) to leave `from`. `guard`: the move is
 * blocked while the named guard control is closed.
 */
export interface Protection {
  kind: 'latch' | 'guard';
  /** Positions the protection applies to; omitted = every position. */
  from?: string[];
  to?: string[];
  /** Guard: control id of the guard and the position that blocks. */
  guard?: string;
  blockedWhen?: string;
  /** The release gesture, only when it has been verified in the simulator. */
  gesture?: string;
  /** Verification status of the gesture/behaviour in the simulator. */
  verified: boolean;
  note: string;
}

export type ControlType = 'toggle' | 'rotary' | 'pushbutton' | 'guard';

export interface ControlDef {
  /** Stable id, unique on the panel. Global id is `<panel id>.<id>`. */
  id: string;
  name: string;
  type: ControlType;
  /**
   * Toggle travel. Positions are listed in travel order: top to bottom for
   * vertical, left to right for horizontal, anticlockwise to clockwise for a
   * rotary, out to in for a pushbutton, closed to open for a guard.
   */
  travel?: 'vertical' | 'horizontal';
  /** Rotary with no end stops: turning past the last position wraps to the first (UHF digit and CHAN knobs). */
  cyclic?: boolean;
  positions: ControlPosition[];
  initial: string;
  /** Mechanically latched (lever-lock) switch; see `protections`. */
  latched?: boolean;
  protections?: Protection[];
  /** Closing this guard drives the guarded control back to this position. */
  guards?: { control: string; closesTo: string };
  description: string;
  /** Manual page or other evidence for the behaviour. */
  source: string;
}

export interface IndicatorDef {
  id: string;
  name: string;
  /** `lamp`: a light (cold jet: off). `gauge`: a pointer instrument (cold jet: needle at `rest`). `counter`: a drum counter (shows `rest`). */
  type: 'lamp' | 'gauge' | 'counter';
  /** Lamps only. */
  colour?: 'amber' | 'green' | 'red';
  /** Gauges only: unit of the scale, and the value the needle shows cold and dark. */
  unit?: string;
  rest?: number;
  /** Gauges and counters: the range a reader can try on the page (defaults to the dial's scale). */
  range?: [min: number, max: number, step: number];
  /** Gauges and counters: what the cold-and-dark line says, when it is not a needle at its stop. */
  restNote?: string;
  description: string;
  source: string;
}

/* ------------------------------------------------------------------ assembly */

export interface PanelSource {
  /** Simulator variant and manual edition the panel represents. */
  variant: string;
  manual: string;
  page: number;
  /** The reference image and how it was rectified (reproducible command). */
  image: string;
  rectify: string;
  /** Reference pixels per mm, and how the scale was fixed. */
  pxPerMm: number;
  scale: string;
  /** Control positions shown in the reference image (used by the overlay review). */
  shown: Record<string, string>;
  /** Details the reference cannot resolve. */
  unresolved: string[];
  /** Third-party art the drawing is derived from, credited on the page as its licence requires. */
  credits?: { what: string; author: string; url: string; license: string; licenseUrl: string }[];
}

/** A shared component placed on the plate. `at` is the component's pivot in mm. */
export type Placement =
  | { component: ToggleArt; control: string; at: Pt; paint?: Paint }
  | { component: RotaryArt; control: string; at: Pt }
  | { component: KnobArt; control: string; at: Pt }
  /** `legend` lines are printed on the cap, placed by their centre `y` (mm from the centre); `marks` is extra cap printing (mm path, centre origin). */
  | { component: PushArt; control: string; at: Pt; paint?: Paint; legend?: { text: string; cap: number; y: number; width?: number }[]; marks?: string }
  /** Landing gear handle: a slot centred on `at`, `travel` mm between the knob's end positions, knob `size` in mm. */
  | { component: 'gear-handle'; control: string; at: Pt; travel: number; size: [w: number, h: number]; /** The light in the knob. */ indicator?: string }
  /**
   * One-off part traced from the reference, one outline per position (F-16C
   * canopy handle). Paths are absolute panel mm (`M`/`L`/`Q`/`Z` with x y pairs);
   * `lines` are fine detail lines on the part. `at` is the part's hinge or pivot.
   */
  | { component: 'traced'; control: string; at: Pt; shapes: Record<string, { d: string; /** Solid parts drawn over d in order, each filled and outlined. */ parts?: string[]; lines?: string; /** Printed legends on top, in mm. */ legend?: { at: Pt; text: string; cap: number; width?: number }[]; /** Pre-drawn line art in mm drawn after the rest (CAD projections); `d` may be empty when this is the whole part. */ svg?: string }>; paint?: Paint; /** Click area in mm when the outlines' bounds would cover other controls. */ hit?: Rect;
      /** Click area per position for a part that moves (throttle): box in mm before `rotate`, turned (degrees clockwise) about its centre; split down the middle into its two directions. */
      hits?: Record<string, { box: Rect; rotate: number }>;
      /** Animate between neighbouring positions (all shapes share one path structure); `drag` lets the pointer move it continuously along an axis, from position `from` on. */
      tween?: { drag?: { axis: 'x' | 'y'; from?: string } } }
  /** Lever in a straight slot (F-16C DEFOG): slot centred on `at`, turned by `rotate`; the lever root moves `travel` mm between its first and last positions, along the slot. */
  | { component: 'slot-lever'; control: string; at: Pt; travel: number; rotate?: number }
  /** Flip guard hinged at `at` (the middle of its hinge edge); `size` is the closed footprint. `rotate`: degrees clockwise about the hinge (180 = hinged along the top). */
  | { component: 'guard-flip'; control: string; at: Pt; size: [w: number, h: number]; rotate?: number; paint?: Paint }
  /** Square pushbutton, centred on `at`; `legend` lines are placed by their centre `y` (mm from the centre). With `indicator`, the legend face is that lamp's lens. */
  | { component: 'push-square'; control: string; at: Pt; size: [w: number, h: number]; legend: { text: string; cap: number; y: number; width?: number }[]; indicator?: string; /** Turn (degrees clockwise) about the centre, for buttons on an angled mount. */ rotate?: number }
  | { component: LampModuleArt; at: Pt; size: [w: number, h: number]; lamps: LampCell[]; /** Unused module: a dash across the blank lens. */ blank?: boolean; /** Turn (degrees clockwise) about the module centre, for modules on an angled mount. */ rotate?: number }
  | { component: LampRoundArt; indicator: string; at: Pt }
  /** Pointer instrument centred on `at`; everything inside `dial` is relative to the dial centre. */
  | { component: 'gauge'; /** The needle's indicator; omitted when the dial has `pointers`. */ indicator?: string; at: Pt; dial: Dial }
  /** Drum counter on its own (F-16C FUEL FLOW): the counter is relative to `at`. */
  | { component: 'counter'; at: Pt; counter: DrumCounter }
  | { component: 'dzus'; at: Pt; cut?: Cut }
  | { component: 'screw' | 'screw-medium' | 'screw-small'; at: Pt };

/**
 * A round pointer dial, drawn square-on. Radii in mm from the dial centre,
 * angles in degrees clockwise from 12 o'clock. The scale is a table of
 * (value, angle) knots measured off the printed ticks, linear between knots,
 * so a scale whose spacing varies is described by more knots.
 */
export interface Dial {
  /** Outer edge of the bezel ring, and the edge of the dial face inside it. */
  bezel: number;
  face: number;
  /** Pointer hub (cap over the needle root). */
  hub: number;
  /** (value, angle) knots in increasing value; angles increase clockwise and may run past 360. */
  scale: [value: number, angle: number][];
  /** Tick runs: one tick every `step` from `from` to `to`, skipping values on `skip` multiples (drawn by another run). */
  ticks: { from: number; to: number; step: number; skip?: number; r: [inner: number, outer: number]; width: number }[];
  /** Solid painted sectors between two values (RPM's 60–65 % band). */
  fills?: { from: number; to: number; r: [inner: number, outer: number] }[];
  /** Numerals and dial legends, upright, by their centre relative to the dial centre; `width` locks the measured width. */
  legends: { text: string; at: Pt; cap: number; width?: number }[];
  /** Needle tip radius (the shared needle's shank stretches to it); single-needle dials only. */
  needle?: number;
  /**
   * Dials with more than one pointer (F-16C fuel AL and FR): each pointer is
   * its own gauge indicator, drawn back to front, as the shared `art` with its
   * two tank letters printed along it (outer letter first).
   */
  pointers?: { indicator: string; art: 'paddle'; legend: [outer: string, inner: string] }[];
  /** A drum counter (totalizer) behind a window in the face. */
  counter?: DrumCounter;
}

/**
 * Odometer-style drum counter, relative to the dial centre. Drums sit `pitch`
 * apart, centred on `at`; digits are printed `roll` apart round each drum and
 * show through a `window` (w, h) centred on `at`. The lowest rolling drum
 * counts in `unit`s; the last `fixed` drums carry only zeros.
 */
export interface DrumCounter {
  indicator: string;
  at: Pt;
  drums: number;
  fixed: number;
  unit: number;
  pitch: number;
  roll: number;
  window: [w: number, h: number];
  /** Digit cap height and width. */
  cap: number;
  width: number;
  /** Draw the shared stroked digits (traced instrument lettering) instead of type, so every viewer sees the same shapes. */
  stroked?: boolean;
  /** Leading drums that show a blank instead of 0 (F-16C FUEL FLOW ten-thousands drum). */
  blank?: number;
  /** The `fixed` zero drums stay still instead of rolling with the lowest rolling drum. */
  still?: boolean;
  /** Drums seen through a taller slot than `window` (height `h`, centred on `at`), e.g. a rolling drum showing its neighbours. */
  slots?: { drum: number; h: number }[];
}

/** The plate corner toward which the face plate is cut away around a DZUS. */
export type Cut = 'up-left' | 'up-right' | 'down-left' | 'down-right';

export type ToggleArt = 'toggle-large' | 'toggle-medium' | 'toggle-small' | 'toggle-large-cylinder' | 'toggle-large-square' | 'toggle-large-lock' | 'toggle-paddle-wide' | 'toggle-hook' | 'toggle-mini-hex';
export type RotaryArt = 'rotary-pointer' | 'rotary-pointer-large' | 'rotary-pointer-medium';
export type KnobArt = 'knob-fine-knurl-small' | 'knob-knurled-small' | 'knob-knurled' | 'knob-knurled-edge' | 'knob-knurled-skirt' | 'knob-bar' | 'knob-lobed' | 'knob-bar-medium' | 'knob-knurled-mini' | 'knob-radio-large' | 'knob-bar-thick' | 'knob-spindle' | 'knob-knurled-large' | 'knob-knurled-small-edge' | 'knob-round' | 'knob-round-small' | 'knob-cross' | 'knob-cross-small';
export type PushArt = 'push-round-small' | 'push-round-medium' | 'push-round-large' | 'push-round-xl' | 'push-round-xxl' | 'push-round-bezel';
export type LampModuleArt = 'lamp-module';
/** A single round press-to-test style indicator lens in a bezel (JFS RUN). */
export type LampRoundArt = 'lamp-round';

/** One independently lit legend or bulb, rect relative to the module's top-left. */
export interface LampCell {
  indicator: string;
  legend: string;
  rect: Rect;
  /** Measured legend width (mm), to lock the lettering to the reference; one per line for a multi-line legend. */
  width?: number | number[];
  /** Legend cap height (mm); default 2.3. */
  cap?: number;
  /** One lamp behind a split lens: the two legend lines sit in the top and bottom halves (HYD/OIL over PRESS). */
  halves?: boolean;
}

/** Fixed engraving on the plate: legends, rules, tick marks. */
export type Engraving =
  | { kind: 'text'; at: Pt; text: string; cap: number; width?: number; anchor?: 'start' | 'middle' | 'end'; /** Degrees clockwise about `at` (legends set along a dial, e.g. INS ALIGN). */ rotate?: number }
  | { kind: 'path'; d: string; pen?: Pen; /** Drawn pale: unlit display segments. */ faint?: boolean }
  /**
   * Painted area under the engraving: `d` (closed shapes) filled with `paint`,
   * clipped to `clip` (even-odd, so a hole is a second shape inside the first).
   * Hazard stripes are the alternate bands of a striped box.
   */
  | { kind: 'fill'; d: string; paint: Paint; clip?: string }
  /** Pre-drawn line art in mm (CAD projections, hand-built scenes), inserted as is. */
  | { kind: 'svg'; markup: string };

/**
 * Warning colours, used only where the real cockpit paints a part to warn
 * (the guide shows it coloured): red guards, yellow hazard stripes and
 * caution-yellow caps. Everything else stays black on white.
 */
export type Paint = 'red' | 'yellow';

export type Pen = 'fine' | 'medium' | 'heavy';

export interface PanelSpec {
  /** Stable id, e.g. `elec`. */
  id: string;
  title: string;
  /** Canvas in mm; the plate is drawn inside it. */
  canvas: [w: number, h: number];
  source: PanelSource;
  /** Plate outlines (mm path data), back to front. `raised` gets an offset lip. Paths fill even-odd, so a second subpath cuts a hole. Empty: instruments drawn without a plate (the guide image does not show one). */
  plate: { d: string; raised?: boolean }[];
  engraving: Engraving[];
  placements: Placement[];
  controls: ControlDef[];
  indicators: IndicatorDef[];
}

/* ----------------------------------------------------------------- catalogue */

export interface CatalogueEntry {
  id: string;
  title: string;
  /** Manual page where the panel is described. */
  page: number;
  spec?: PanelSpec;
}

export interface CockpitArea {
  id: string;
  title: string;
  panels: CatalogueEntry[];
}

export interface AircraftCockpit {
  id: string;
  /** Airframe slug used in routes. */
  airframe: string;
  title: string;
  variant: string;
  manual: { title: string; url: string; edition: string };
  areas: CockpitArea[];
}
