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
  type: 'lamp';
  colour: 'amber' | 'green' | 'red';
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
}

/** A shared component placed on the plate. `at` is the component's pivot in mm. */
export type Placement =
  | { component: ToggleArt; control: string; at: Pt }
  | { component: RotaryArt; control: string; at: Pt }
  | { component: KnobArt; control: string; at: Pt }
  | { component: PushArt; control: string; at: Pt }
  /** Landing gear handle: a slot centred on `at`, `travel` mm between the knob's end positions, knob `size` in mm. */
  | { component: 'gear-handle'; control: string; at: Pt; travel: number; size: [w: number, h: number]; /** The light in the knob. */ indicator?: string }
  | { component: 'guard-flip'; control: string; at: Pt; size: [w: number, h: number] }
  /** Square pushbutton, centred on `at`; `legend` lines are placed by their centre `y` (mm from the centre). With `indicator`, the legend face is that lamp's lens. */
  | { component: 'push-square'; control: string; at: Pt; size: [w: number, h: number]; legend: { text: string; cap: number; y: number; width?: number }[]; indicator?: string; /** Turn (degrees clockwise) about the centre, for buttons on an angled mount. */ rotate?: number }
  | { component: LampModuleArt; at: Pt; size: [w: number, h: number]; lamps: LampCell[]; /** Unused module: a dash across the blank lens. */ blank?: boolean; /** Turn (degrees clockwise) about the module centre, for modules on an angled mount. */ rotate?: number }
  | { component: LampRoundArt; indicator: string; at: Pt }
  | { component: 'dzus'; at: Pt; cut?: Cut }
  | { component: 'screw' | 'screw-medium' | 'screw-small'; at: Pt };

/** The plate corner toward which the face plate is cut away around a DZUS. */
export type Cut = 'up-left' | 'up-right' | 'down-left' | 'down-right';

export type ToggleArt = 'toggle-large' | 'toggle-medium' | 'toggle-small' | 'toggle-large-cylinder' | 'toggle-large-square' | 'toggle-large-lock' | 'toggle-paddle-wide' | 'toggle-hook' | 'toggle-mini-hex';
export type RotaryArt = 'rotary-pointer' | 'rotary-pointer-large' | 'rotary-pointer-medium';
export type KnobArt = 'knob-fine-knurl-small' | 'knob-knurled-small' | 'knob-knurled' | 'knob-bar' | 'knob-lobed' | 'knob-bar-medium' | 'knob-knurled-mini' | 'knob-radio-large' | 'knob-bar-thick' | 'knob-spindle';
export type PushArt = 'push-round-small' | 'push-round-medium' | 'push-round-large' | 'push-round-xl' | 'push-round-xxl';
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
  | { kind: 'path'; d: string; pen?: Pen; /** Drawn pale: unlit display segments. */ faint?: boolean };

export type Pen = 'fine' | 'medium' | 'heavy';

export interface PanelSpec {
  /** Stable id, e.g. `elec`. */
  id: string;
  title: string;
  /** Canvas in mm; the plate is drawn inside it. */
  canvas: [w: number, h: number];
  source: PanelSource;
  /** Plate outlines (mm path data), back to front. `raised` gets an offset lip. Paths fill even-odd, so a second subpath cuts a hole. */
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
