/**
 * Cockpit panel drawings as data.
 *
 * Coordinates are in the units of a rectified (perspective-corrected) reference
 * image, origin top-left (see `source`), or in mm when the panel's size is known.
 * The renderer draws the face, the controls and the hit zones from the same
 * numbers, so a switch can never drift away from its artwork.
 */
export type Pt = [x: number, y: number];
export type Attrs = Record<string, string>;
/** A hit-zone button: [data-control value, accessible label]. */
export type Input = [control: string, label: string, disabled?: boolean];

export interface PanelSource {
  /** What the geometry was traced from, with its page or URL. */
  trace: string;
  /** Known overall size and where it came from. */
  size: string;
  /** Other material used to check labels and control shapes. */
  checks: string[];
  /** Simulator or aircraft variant the drawing represents. */
  variant: string;
}

/** Shared by every control that has a hit zone. */
interface Interactive {
  id: string;
  /** Extra classes and attributes on the hit-zone element (keeps page hooks). */
  hitClass?: string;
  hitAttrs?: Attrs;
  /** Accessible name of the control group. */
  label?: string;
}

/**
 * Lever switch seen from above. The lever leans toward the selected position:
 * `k` -1 is fully up, 0 straight out at the viewer, 1 fully down.
 * State: the root attribute `data-<stateAttr>` when set, otherwise the
 * `data-position` of the hit-zone element (set by the page script).
 */
export interface ToggleSwitch extends Interactive {
  kind: 'toggle';
  at: Pt;
  /** Bushing / bezel radius. */
  r: number;
  positions: { id: string; label?: string; k?: number }[];
  initial: string;
  stateAttr?: string;
  /** bat: round tip; paddle: flat wide lever; square: square lens cap; rocker: wide three-bump cap. */
  face?: 'bat' | 'paddle' | 'square' | 'rocker';
  /** Lever length as a multiple of r (default 1.05). */
  reach?: number;
  /** Hit-zone buttons top to bottom; default "move up" / "move down" (.toggle-up/.toggle-down). */
  inputs?: Input[];
  /** Hit-zone size as a multiple of r (default 2.4). */
  hit?: number;
}

/** Rotary selector: knob skirt plus a pointer bar. Angles are degrees clockwise from 12 o'clock. */
export interface Rotary extends Interactive {
  kind: 'rotary';
  at: Pt;
  r: number;
  positions: { id: string; angle: number }[];
  initial: string;
  /** pointer: wing-shaped selector; round: fluted round knob with a line. */
  knob?: 'pointer' | 'round';
  inputs?: Input[];
  hit?: number;
}

export interface PushButton extends Interactive {
  kind: 'pushbutton';
  at: Pt;
  r: number;
  label: string;
  shape?: 'round' | 'square';
  /** Hit zone only, for controls already drawn by other parts. */
  bare?: boolean;
}

/** Two-position handle that slides between offsets (gear handle, canopy handle). */
export interface Handle extends Interactive {
  kind: 'handle';
  at: Pt;
  /** Path data of the handle drawn around (0,0). */
  d: string;
  positions: { id: string; dy?: number; dx?: number }[];
  initial: string;
  inputs?: Input[];
  /** Instead of its own hit zone, follow a pushbutton: the second position shows while that button is aria-pressed. */
  pressedBy?: string;
  hitSize: [w: number, h: number];
  /** Hit-zone centre relative to `at` (default 0,0). */
  hitOffset?: Pt;
}

export interface Annunciator {
  kind: 'annunciator';
  /** Top-left corner and size of the module. */
  at: Pt;
  size: [w: number, h: number];
  /** One legend per lamp cell, top to bottom. `text: ''` draws a blank bar. Use \n for two lines. */
  cells: { text: string; lamp?: string; attrs?: Attrs; width?: number }[];
  /** Legend cap height. */
  cap?: number;
  colour?: 'amber' | 'green' | 'red';
  /** false when the cells are one lamp with a legend split over two rows. */
  divider?: boolean;
  /** Bezel inset; 0 for lenses set straight into the panel. */
  inset?: number;
}

/** Round indicator light. */
export interface Lamp {
  kind: 'lamp';
  at: Pt;
  r: number;
  lamp?: string;
  attrs?: Attrs;
  colour?: 'amber' | 'green' | 'red';
}

/** Round gauge with a live needle. Angles are degrees clockwise from 12 o'clock. */
export interface Dial {
  kind: 'dial';
  at: Pt;
  r: number;
  /** data-needle name the page script drives. */
  needle: string;
  /** Value-to-angle stops [value, angle], also emitted as data-stops for the page. */
  stops: [value: number, angle: number][];
  initial: number;
  needleLength: number;
  /** Tick marks: every `step` in value from `from` to `to`, length `len`. */
  ticks: { from: number; to: number; step: number; len: number; width?: number }[];
  numerals: { text: string; value: number; size: number; radius: number }[];
  labels?: { text: string; at: Pt; size: number; width?: number }[];
  /** Arc of the scale ring as [startAngle, endAngle]; omitted = full ring. */
  ring?: [number, number];
}

export type Part =
  | ToggleSwitch
  | Rotary
  | PushButton
  | Handle
  | Annunciator
  | Lamp
  | Dial
  | { kind: 'dzus'; at: Pt; r: number; slot?: number }
  | { kind: 'screw'; at: Pt; r: number }
  | { kind: 'label'; at: Pt; text: string; size: number; width?: number; anchor?: 'start' | 'middle' | 'end'; rotate?: number; weight?: number }
  | { kind: 'rule'; from: Pt; to: Pt; width?: number }
  /** Free outline: guards, scale arcs, odd shapes. */
  | { kind: 'path'; d: string; fill?: string; width?: number; dash?: string }
  /** Rectangle filled with diagonal warning stripes. */
  | { kind: 'hatch'; at: Pt; size: [w: number, h: number]; gap?: number; rx?: number };

export interface PanelSpec {
  id: string;
  title: string;
  size: [w: number, h: number];
  /** Reference units per millimetre-equivalent, used to scale line weights (1 when the spec is in mm). */
  unit?: number;
  source: PanelSource;
  /** Plate outlines as SVG path data, back to front. */
  plates: { d: string; raised?: boolean; fill?: string }[];
  parts: Part[];
}
