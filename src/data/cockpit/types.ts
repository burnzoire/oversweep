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
   * rotary, out to in for a pushbutton, closed to open for a guard. A rotary
   * with `vertical` travel is a thumbwheel rolled up and down (positions top
   * to bottom, as they pass under the thumb).
   */
  travel?: 'vertical' | 'horizontal';
  /** Rotary with no end stops: turning past the last position wraps to the first (UHF digit and CHAN knobs). */
  cyclic?: boolean;
  positions: ControlPosition[];
  initial: string;
  /** Mechanically latched (lever-lock) switch; see `protections`. */
  latched?: boolean;
  protections?: Protection[];
  /**
   * Closing this guard (moving it to `when`, default `closed`) drives the
   * guarded control back to `closesTo`.
   */
  guards?: { control: string; closesTo: string; when?: string };
  description: string;
  /** Manual page or other evidence for the behaviour. */
  source: string;
}

export interface IndicatorDef {
  id: string;
  name: string;
  /**
   * `lamp`: a light (cold jet: off). `gauge`: a pointer instrument (cold jet: needle at `rest`). `counter`: a drum counter (shows `rest`).
   * `display`: an electronic display or one of its symbols; `pages` lists what it can show and `restPage` what it shows cold and dark (blank).
   * Numeric display readings (HSI heading, range) use `rest`/`range` like a gauge.
   */
  type: 'lamp' | 'gauge' | 'counter' | 'display';
  /** Displays that switch between whole pictures (DED pages, HSI mode legend): the choices, in order. */
  pages?: { id: string; label: string }[];
  restPage?: string;
  /** Lamps only. */
  colour?: 'amber' | 'green' | 'red' | 'blue';
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
  | { component: 'traced'; control: string; at: Pt; shapes: Record<string, { d: string; /** Solid parts drawn over d in order, each filled and outlined. */ parts?: string[]; lines?: string; /** Printed legends on top, in mm. */ legend?: { at: Pt; text: string; cap: number; width?: number }[]; /** Pre-drawn line art in mm drawn after the rest (CAD projections); `d` may be empty when this is the whole part. */ svg?: string }>; paint?: Paint; /** Click area in mm when the outlines' bounds would cover other controls. */ hit?: Rect; /** Drawn behind the plate, for a part that comes out from behind the housing (F-16C AR/NWS dimming tab). */ under?: boolean;
      /** Click area per position for a part that moves (throttle): box in mm before `rotate`, turned (degrees clockwise) about its centre; split down the middle into its two directions. */
      hits?: Record<string, { box: Rect; rotate: number }>;
      /** Animate between neighbouring positions (all shapes share one path structure); `drag` lets the pointer move it continuously along an axis, from position `from` on. */
      tween?: { drag?: { axis: 'x' | 'y'; from?: string } } }
  /** Lever in a straight slot (F-16C DEFOG): slot centred on `at`, turned by `rotate`; the lever root moves `travel` mm between its first and last positions, along the slot. */
  | { component: 'slot-lever'; control: string; at: Pt; travel: number; rotate?: number }
  /** Flip guard hinged at `at` (the middle of its hinge edge); `size` is the closed footprint. `rotate`: degrees clockwise about the hinge (180 = hinged along the top). */
  | { component: 'guard-flip'; control: string; at: Pt; size: [w: number, h: number]; rotate?: number; paint?: Paint }
  /** Square pushbutton, centred on `at`; `legend` lines are placed by their centre `y` (mm from the centre). With `indicator`, the legend face is that lamp's lens. */
  | { component: 'push-square'; control: string; at: Pt; size: [w: number, h: number]; legend: { text: string; cap: number; y: number; width?: number; /** Off-centre legend (keypad direction letters). */ x?: number }[]; indicator?: string; /** Turn (degrees clockwise) about the centre, for buttons on an angled mount. */ rotate?: number; /** Moulded detail on the cap (mm path, centre origin), e.g. the F-16C MFD option button's raised square. */ marks?: string }
  | { component: LampModuleArt; at: Pt; size: [w: number, h: number]; lamps: LampCell[]; /** Unused module: a dash across the blank lens. */ blank?: boolean; /** Turn (degrees clockwise) about the module centre, for modules on an angled mount. */ rotate?: number }
  | { component: LampRoundArt; indicator: string; at: Pt }
  /** Pointer instrument centred on `at`; everything inside `dial` is relative to the dial centre. */
  | { component: 'gauge'; /** The needle's indicator; omitted when the dial has `pointers`. */ indicator?: string; at: Pt; dial: Dial }
  /** Drum counter on its own (F-16C FUEL FLOW): the counter is relative to `at`. */
  | { component: 'counter'; at: Pt; counter: DrumCounter }
  /**
   * Knurled thumbwheel set into the plate edge (F-16C ICP SYM, BRT, RET DEPR, CONT), seen square-on: the part of the
   * wheel that stands out of its slot, `size` (w, h) centred on `at`; its control is a rotary with vertical travel,
   * or horizontal travel for a wheel rolled left and right (F-16C PITCH TRIM).
   */
  | { component: 'thumbwheel'; control: string; at: Pt; size: [w: number, h: number] }
  /**
   * Code selector wheel (F-16C IFF MODE 1 / MODE 3): the digit the wheel is set to shows in a `window` (w, h) centred
   * on `at`, printed `cap` high; the wheel's thumb `tab` (centre and size, relative to `at`) stands out of a slot
   * below it. Its control is a rotary with vertical travel whose position labels are the digits.
   */
  | { component: 'code-wheel'; control: string; at: Pt; window: [w: number, h: number]; cap: number; width?: number; tab: { at: Pt; size: [w: number, h: number] } }
  /** Rocker switch with up and down arrows on its cap (F-16C ICP DED increment/decrement): housing `size` centred on `at`; vertical travel, middle position at rest. */
  | { component: 'rocker'; control: string; at: Pt; size: [w: number, h: number];
      /** Cap arrows: `arrow` (head and shaft, F-16C FLIR), `spike` (long narrow triangles, F-16C DED) or `legend` (F-16C MFD: a small up triangle over `legend`, a rule, then a down arrow). */
      arrows: 'arrow' | 'spike' | 'legend';
      /** Legend printed on the cap (`legend` arrows), centred `y` mm from the cap centre. */
      legend?: { text: string; cap: number; y: number; width?: number } }
  /**
   * Four-way momentary switch (F-16C ICP Data Control Switch): a lever in a round well of radius `r`; `control` moves
   * it up and down, `cross` left and right; `lever` is the lever top (w, h) and `throw` how far it moves off centre.
   */
  | { component: 'hat'; control: string; cross: string; at: Pt; r: number; lever: [w: number, h: number]; /** Stick length from its pivot and its lean when held (degrees). */ length: number; tilt: number }
  /** Character display (F-16C DED): a fixed grid of character cells behind a bezel; `indicator` is a `display` indicator whose pages the display draws. */
  | { component: 'text-display'; indicator: string; at: Pt; display: TextDisplay }
  /** Two-colour flow blinker (F-16C OXYGEN FLOW): a rounded window `size` centred on `at`; its `display` indicator shows `dark` (black) or any other page (white). */
  | { component: 'blinker'; indicator: string; at: Pt; size: [w: number, h: number]; dark: string }
  /** Format display (F-16C MFD): a screen whose pages are words set beside the option buttons; `indicator` is a `display` indicator whose pages it draws. */
  | { component: 'mfd-display'; indicator: string; at: Pt; display: MfdDisplay }
  /** Electronic HSI picture (F-16C EHSI), centred on `at` (the compass centre); every symbol is its own indicator, see `HsiDisplay`. */
  | { component: 'hsi'; at: Pt; hsi: HsiDisplay }
  /** Head-up display symbology (F-16C HUD), centred on `at` (the boresight cross); every symbol is its own indicator, see `HudDisplay`. */
  | { component: 'hud'; at: Pt; hud: HudDisplay }
  /** Standby attitude indicator (F-16C SAI), centred on `at` (the sphere window centre); see `AttitudeBall`. */
  | { component: 'attitude'; at: Pt; ball: AttitudeBall }
  /**
   * Pull-to-cage knob (F-16C SAI): a knurled knob of radius `r` with a face of radius `face` printed with `legend`
   * (centre-relative); `control` is the turn (a rotary, the printing turns with it), `pull` the pull (positions in
   * then pulled; pulled shows the knob's side as a second rim).
   */
  | { component: 'cage-knob'; control: string; pull: string; at: Pt; r: number; face: number;
      /** Face printing; with `arc` (mm, positive along the top, negative along the bottom) the letters are set round that radius, `width` along the arc. */
      legend: { text: string; at: Pt; cap: number; width?: number; arc?: number }[];
      /** Scale marks round the knob (path in mm about the knob centre), drawn over neighbouring instruments. */
      marks?: { d: string; pen: Pen; fill?: boolean }[];
      /** Pointer on the knob rim (r0 to r1, half width at r0), pointing at the position angle; the printing is turned by the angle less `rest`. */
      needle?: { r: [r0: number, r1: number]; half: number; rest: number } }
  | { component: 'dzus'; at: Pt; cut?: Cut }
  | { component: 'screw' | 'screw-medium' | 'screw-small' | 'screw-hex' | 'screw-tiny'; at: Pt };

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
  ticks: { from: number; to: number; step: number; skip?: number; r: [inner: number, outer: number]; width: number; /** Printed dots instead of lines: a dot `width` across midway between the radii. */ dot?: boolean }[];
  /** Solid painted sectors between two values (RPM's 60–65 % band). */
  fills?: { from: number; to: number; r: [inner: number, outer: number] }[];
  /** Numerals and dial legends, upright, by their centre relative to the dial centre; `width` locks the measured width. */
  legends: { text: string; at: Pt; cap: number; width?: number }[];
  /** Needle tip radius (the shared needle's shank stretches to it); single-needle dials only. */
  needle?: number;
  /** Needle shape: the shared thin `NEEDLE` (default), a straight-sided `wedge` (F-16C HYD PRESS), a thin shaft ending in a broad `blade` (F-16C altimeter), a `line` with a block tip (F-16C trim) or a broad shank `step`ped down to a narrow tip (F-16C EPU FUEL). */
  needleArt?: 'wedge' | 'blade' | 'line' | 'step';
  /** Wedge needle width at the centre, where it differs from the shared wedge (F-16C OXYGEN PSI). */
  needleBase?: number;
  /** Half-disc window instead of a round dial: the side the face bulges to, the flat edge running through the centre (F-16C trim indicators). */
  half?: 'left' | 'right' | 'up' | 'down';
  /**
   * The value of one full turn, for a needle that goes round more than once
   * (F-16C altimeter: 1,000 ft). The scale knots then cover one turn.
   */
  turn?: number;
  /**
   * Dials with more than one pointer (F-16C fuel AL and FR): each pointer is
   * its own gauge indicator, drawn back to front, as the shared `art` with its
   * two tank letters printed along it (outer letter first).
   */
  pointers?: { indicator: string; art: 'paddle'; legend: [outer: string, inner: string] }[];
  /**
   * A drum counter (totalizer) behind a window in the face. When its indicator
   * is the needle's (F-16C altimeter), needle and drums show the one reading.
   */
  counter?: DrumCounter;
  /**
   * Warning flags in windows in the face (F-16C altimeter PNEU): each is a
   * `display` indicator with pages `shown` and `hidden`; `size` is the flag
   * (w, h) centred on `at`, with its legend printed on it.
   */
  /** Fine line art printed on the face (window frames, index marks), an absolute-command path in mm relative to the dial centre. */
  marks?: string;
  flags?: { indicator: string; at: Pt; size: [w: number, h: number]; legend: string; cap: number; width?: number; paint?: Paint }[];
}

/**
 * Standby attitude indicator, square-on, in mm from the sphere window centre (y down). The sphere shows through a
 * round `window`; it moves down `deg` mm a degree of pitch (indicator `pitch`, nose up positive) and turns with bank
 * (indicator `roll`, right bank positive), the roll `pointer` on it turning too. The face round the window carries the
 * fixed bank scale (`ticks`, angles clockwise from 12 o'clock) and bank `index`; the aircraft symbol is fixed. The
 * OFF flag is indicator `off-flag` (pages `shown`, `hidden`).
 */
export interface AttitudeBall {
  bezel: number; face: number; window: number;
  deg: number;
  /** Pitch bars (degrees, climb positive) and their half length; `label` splits a word either side of a short bar. */
  bars: { pitch: number; half: number; label?: [left: string, right: string] }[];
  label: { cap: number; gap: number; widths: Record<string, number> };
  /** Roll pointer on the sphere at 6 o'clock: apex radius, base radius, half width. */
  pointer: [apex: number, base: number, half: number];
  /** Fixed bank index at 6 o'clock, pointing in: apex radius, base radius, half width. */
  index: [apex: number, base: number, half: number];
  ticks: { angle: number; r: [inner: number, outer: number]; width: number }[];
  /** Aircraft symbol outline paths (stroked) and its centre dot radius. */
  aircraft: { wings: string; w: string; dot: number };
  /** OFF flag: shown box, its legend, and the tip seen when hidden. */
  flag: { shown: Rect; hidden: Rect; cap: number };
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
  /** Drum centres (x, relative to `at`) where they are not evenly `pitch` apart (F-16C altimeter). */
  places?: number[];
  /** Leading drums that show diagonal hatching instead of 0 (F-16C altimeter ten-thousands drum below 10,000 ft). */
  hatch?: number;
}

/**
 * A character-cell display. Everything is relative to the placement's `at`
 * (the screen centre). Cells are `pitch` apart, the first cell's centre at
 * `origin`; characters are `cap` high. Each page is `rows` lines of up to
 * `cols` characters; `{…}` marks characters shown inverse (lit box, dark
 * character), `^` is the up/down arrow the display uses to mark a field
 * that the increment/decrement rocker can change.
 */
export interface TextDisplay {
  bezel: [w: number, h: number];
  screen: [w: number, h: number];
  cols: number;
  rows: number;
  pitch: [dx: number, dy: number];
  origin: Pt;
  cap: number;
  /** Character width (ink), mm. */
  width: number;
  pages: { id: string; lines: string[] }[];
}

/**
 * A format display (MFD). Everything is relative to the placement's `at` (the
 * screen centre). The screen is a rounded square opening (`opening`, corner
 * radius `r`) with the glass `inset` inside it. Words are fixed-pitch
 * characters `cap` high, `width` wide, `pitch` apart; each word is placed by
 * `at` with `a` saying which end of its ink that is (default the middle).
 * `inv` draws it inverse (lit box, dark letters); `marks` is extra symbology
 * (mm path, screen-centre origin).
 */
export interface MfdDisplay {
  opening: number;
  r: number;
  inset: number;
  cap: number;
  width: number;
  pitch: number;
  /** Inverse box padding round the ink (x, y). */
  pad: [x: number, y: number];
  pages: { id: string; words: { t: string; at: Pt; a?: 'start' | 'middle' | 'end'; inv?: boolean }[]; marks?: string }[];
}

/**
 * Electronic HSI symbology, square-on, in mm relative to the compass centre;
 * radii from the centre. The compass card turns with `heading` (indicator id);
 * the heading marker, course arrow (with its deviation bar and dots) and
 * bearing pointer turn with it, each by its own indicator. Indicator ids are
 * fixed: `screen` (page `on`/`off`), `heading`, `heading-set`, `course`,
 * `bearing`, `deviation` (dots), `range` (NM), `course-set` (the course
 * readout), `mode` (pages), `to-from` (pages `none`/`to`/`from`), `notice` (pages, `none`
 * blank).
 */
export interface HsiDisplay {
  /** Screen outline, absolute panel mm path (the screen hit area and clip). */
  screen: string;
  card: { r: number; major: number; minor: number; width: number; labelR: number; cap: number; labelWidth: number };
  lubbers: { cardinal: [r0: number, r1: number]; diagonal: [r0: number, r1: number]; width: number };
  /** Aircraft symbol path (centre origin, nose up). */
  aircraft: string;
  /** Heading marker: two solid squares, `w` overall with `gap` between them, from r0 to r1. */
  marker: { r: [r0: number, r1: number]; w: number; gap: number };
  course: { head: [r0: number, r1: number]; tail: [r0: number, r1: number]; arrow: [w: number, l: number]; width: number; cdi: number; dot: number; dotR: number; toFrom: number };
  bearing: { head: [r0: number, r1: number]; tail: [r0: number, r1: number]; arrow: [w: number, l: number]; width: number };
  /** Digit readouts by their centre: range (with its tenths digit boxed), course. */
  range: { at: Pt; cap: number; width: number };
  courseSet: { at: Pt; cap: number; width: number };
  mode: { at: Pt; cap: number };
  /** Brief notice in front of the aircraft symbol (new mode, BRT); indicator `notice`, page `none` blank. */
  notice: { at: Pt; cap: number; charWidth?: number };
  /** Fixed legends drawn on the screen while it is on (NM, CRS, HDG). */
  legends: { text: string; at: Pt; cap: number; width?: number }[];
}

/** How a numeric readout is printed: `pad` whole digits (zero-filled), `decimals`, thousands `comma`, or `clock` (seconds as m:ss, minutes zero-filled to `pad`). */
export interface ReadoutFormat { pad?: number; decimals?: number; comma?: boolean; clock?: boolean; /** Rounded to this step first (altitude: 10 ft). */ round?: number }

/** A tape scale (HUD velocity, altitude, heading): ticks every `minor`, long ones every `major`, labels every `label` units. */
export interface HudTape {
  /** Pointer (zero of the moving tape) relative to the boresight; tapes run along y (velocity, altitude) or x (heading). */
  at: Pt;
  axis: 'x' | 'y';
  /** mm per unit; the tape moves this far for each unit of its reading. */
  per: number;
  from: number; to: number;
  minor: number; major: number; label: number;
  /** Tick edge offset from the pointer line across the tape, and tick lengths (outward from that edge, signed). */
  edge: number; minorLength: number; majorLength: number;
  /** Label centre offset across the tape from the pointer line; label text = value / `labelDiv`, `labelPad` digits, with `labelSuffix`. */
  labelOffset: number; labelDiv: number; labelPad: number; labelSuffix?: string;
  /** Visible half-length of the tape window along its axis (ticks), and for labels when it differs. */
  window: number; labelWindow?: number;
  /** Labels whose centre is within this distance of the pointer are hidden (they would sit under the readout box). */
  labelGap?: number;
  /** Fixed index: a line across the tape at the pointer (from, to across), or a lubber line along it. */
  index: string;
  /** Readout box (closed path relative to the boresight), the readout's text anchor and alignment, and its format. */
  box: string; readout: { at: Pt; anchor: 'start' | 'middle' | 'end'; format: ReadoutFormat };
}

/** A data field on the HUD: a number readout or a word (pages), drawn left-aligned (`start`) or centred at `at` (relative to the boresight). */
export interface HudField { indicator: string; at: Pt; anchor?: 'start' | 'middle' | 'end'; format?: ReadoutFormat; /** Fixed text drawn before the field (AL, R). */ prefix?: { text: string; at: Pt } }

/**
 * Head-up display symbology, square-on, in mm relative to the boresight cross
 * (y down). Fixed indicator ids: `screen` (pages on/off), the attitude group
 * (`fpm-azimuth`, `fpm-elevation`: the flight path marker from the boresight,
 * degrees; `pitch`: the attitude bars against the boresight, caged to the marker in azimuth,
 * degrees; `roll`: degrees, right bank positive), `steering-cue` (degrees
 * left or right of the marker) and `steering` (relative bearing turning the
 * cue's line), `steerpoint-azimuth`/`steerpoint-elevation` (the diamond), the
 * tapes `velocity`, `altitude` and `heading`, `velocity-mode` (pages) and the
 * data fields listed in `fields`.
 */
export interface HudDisplay {
  /** Combiner glass outline relative to the boresight: the symbology is clipped to it. */
  glass: string;
  /** Character cap height and pitch (mm) of the HUD's fixed-width lettering. */
  font: { cap: number; pitch: number };
  /** mm per degree of the attitude bars (the HUD's angular scale). */
  deg: number;
  boresight: { arm: number };
  fpm: { r: number; wing: number; tail: number };
  ladder: { gap: number; length: number; tick: number; dash: [on: number, off: number]; labelInset: number; /** Label centre offset toward the horizon for climb and dive bars. */ labelDrop: [climb: number, dive: number]; horizon: number };
  steering: { r: number; line: number };
  /** Steerpoint diamond: half-diagonal. */
  diamond: number;
  velocity: HudTape; altitude: HudTape; heading: HudTape;
  /** Velocity mode letter (C/T/G) by the velocity pointer. */
  velocityMode: Pt;
  /** Roll indicator: arc centre, tick radii (inner, short, long), tick angles (long ones in `longAt`), caret (apex radius, base radius, width). */
  roll: { centre: Pt; r: [inner: number, short: number, long: number]; ticks: number[]; longAt: number[]; caret: [apex: number, base: number, width: number] };
  fields: HudField[];
  /** Boxes drawn round fields (radar altitude), relative to the boresight. */
  boxes: string[];
}

/** The plate corner toward which the face plate is cut away around a DZUS. */
export type Cut = 'up-left' | 'up-right' | 'down-left' | 'down-right';

export type ToggleArt = 'toggle-large' | 'toggle-medium' | 'toggle-small' | 'toggle-large-cylinder' | 'toggle-large-square' | 'toggle-large-lock' | 'toggle-paddle-wide' | 'toggle-hook' | 'toggle-mini-hex';
export type RotaryArt = 'rotary-pointer' | 'rotary-pointer-large' | 'rotary-pointer-medium' | 'rotary-bar-broad';
export type KnobArt = 'knob-fine-knurl-small' | 'knob-knurled-small' | 'knob-knurled' | 'knob-knurled-edge' | 'knob-knurled-skirt' | 'knob-bar' | 'knob-lobed' | 'knob-bar-medium' | 'knob-knurled-mini' | 'knob-radio-large' | 'knob-bar-thick' | 'knob-spindle' | 'knob-knurled-large' | 'knob-knurled-small-edge' | 'knob-round' | 'knob-round-small' | 'knob-cross' | 'knob-cross-small' | 'knob-plain' | 'knob-plain-small' | 'knob-plain-index' | 'knob-round-tail';
export type PushArt = 'push-round-small' | 'push-round-medium' | 'push-round-large' | 'push-round-xl' | 'push-round-flat' | 'push-round-xxl' | 'push-round-bezel' | 'push-round-wide' | 'push-round-plain';
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
