/**
 * Cockpit panel drawings as data.
 *
 * Coordinates are in the units of a rectified (perspective-corrected) reference
 * image, origin top-left (see `source`), or in mm when the panel's size is known. The renderer draws the
 * face, the controls and the hit zones from the same numbers, so a switch can
 * never drift away from its artwork.
 */
export type Pt = [x: number, y: number];

export interface PanelSource {
  /** What the geometry was traced from, with its page or URL. */
  trace: string;
  /** Known overall size and where it came from. */
  size: string;
  /** Photos used to check labels and control shapes. */
  checks: string[];
  /** Simulator or aircraft variant the drawing represents. */
  variant: string;
}

export interface ToggleSwitch {
  kind: 'toggle';
  id: string;
  at: Pt;
  /** Bezel radius. */
  r: number;
  /** Positions from top to bottom; two or three. */
  positions: { id: string; label: string }[];
  initial: string;
  /** Attribute on the panel root that holds the position id (without `data-`). */
  stateAttr?: string;
  /** Extra classes on the hit-zone wrapper (used to keep existing page hooks). */
  hitClass?: string;
}

export interface PushButton {
  kind: 'pushbutton';
  id: string;
  at: Pt;
  r: number;
  label: string;
  hitClass?: string;
  hitAttrs?: Record<string, string>;
}

export interface Annunciator {
  kind: 'annunciator';
  /** Top-left corner and size of the lens. */
  at: Pt;
  size: [w: number, h: number];
  /** One legend per lamp cell, top to bottom. `text: ''` draws a blank bar. */
  cells: { text: string; lamp?: string; width?: number }[];
  /** Legend cap height. */
  cap?: number;
  colour?: 'amber' | 'green' | 'red';
}

export type Part =
  | ToggleSwitch
  | PushButton
  | Annunciator
  | { kind: 'dzus'; at: Pt; r: number; slot?: number }
  | { kind: 'screw'; at: Pt; r: number }
  | { kind: 'label'; at: Pt; text: string; size: number; width?: number; anchor?: 'start' | 'middle' | 'end'; vertical?: boolean }
  | { kind: 'rule'; from: Pt; to: Pt };

export interface PanelSpec {
  id: string;
  title: string;
  size: [w: number, h: number];
  /** Reference units per millimetre-equivalent, used to scale line weights (1 when the spec is in mm). */
  unit?: number;
  source: PanelSource;
  /** Plate outlines as SVG path data in mm, back to front. */
  plates: { d: string; raised?: boolean }[];
  parts: Part[];
}
