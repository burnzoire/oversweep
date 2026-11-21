import type { PanelSpec } from '../types';
import { tracer } from '../trace.ts';
import { speedBrakeParts } from './speed-brake.ts';

/**
 * F-16C landing gear panel (left auxiliary console), DCS.
 *
 * Reference: the guide's p. 55 cockpit image (468 x 541 JPEG, extracted with
 * `pdfimages -j -f 55 -l 55`), rectified on the two top DZUS fasteners, the bottom-left
 * panel screw and the bottom-right DZUS:
 *   python3 -I scripts/panel-trace.py <p55.jpg> <out> 140,70 439,19 140,401 428,401
 * Measurements below are in rectified pixels and stored in mm, shifted right by
 * `OX` so the SPEED BRAKE indicator, which hangs below the panel's lower-left
 * corner, fits on the canvas.
 *
 * SPEED BRAKE indicator: placed from the guide's p. 55 wide shot (1152 x 680
 * px, image 002), registered onto the rectified p. 55 image by SIFT feature
 * matching (gear panel screws land within 8 px of their traced places). Its
 * legend centre maps to x 2, y 462. The indicator's face is a separate, tilted
 * plane, so that mapping stretches it 1.38 times top to bottom (legend line
 * spacing and housing height both agree); its offset below the panel's lower
 * edge (y 422) is divided by 1.38. That puts the indicator's own drawing
 * (speed-brake.ts) with its top-left corner at x -22.75, y 432.
 */
const PX = 3.06, OX = 26;
const { pt, mm, path } = tracer(PX, [OX, 0]);
const speedBrake = speedBrakeParts([mm(-22.75 + OX), mm(432)]);
const src = 'DCS F-16C guide pp. 55–57';
const L = (at: [number, number], text: string, cap: number, width?: number) =>
  ({ kind: 'text' as const, at: pt(...at), text, cap: mm(cap), ...(width ? { width: mm(width) } : {}) });

/**
 * Yellow-and-black hazard stripes (drawn as heavy "/" bands) filling the box
 * [x0, y0]-[x1, y1] in reference px, every `step` px, leaving out an optional label `hole`.
 */
const stripes = (x0: number, y0: number, x1: number, y1: number, step = 9, hole?: [number, number, number, number]) => {
  let d = `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
  for (let c = x0 + y0 + step; c < x1 + y1; c += step) {
    // The line x + y = c, clipped to the box.
    const ax = Math.max(x0, c - y1), bx = Math.min(x1, c - y0);
    if (bx <= ax) continue;
    const seg = (p: number, q: number) => { if (q > p) d += `M${p.toFixed(1)} ${(c - p).toFixed(1)}L${q.toFixed(1)} ${(c - q).toFixed(1)}`; };
    if (!hole) { seg(ax, bx); continue; }
    const [hx0, hy0, hx1, hy1] = hole;
    // Part of the segment inside the hole, cut out.
    const ix = Math.max(ax, hx0, c - hy1), jx = Math.min(bx, hx1, c - hy0);
    if (jx <= ix) seg(ax, bx); else { seg(ax, ix); seg(jx, bx); }
  }
  return path(d);
};
/**
 * Hazard stripes in the box, stopped at an arbitrary cut-out (`inside` is true
 * in the cut), with the box `border` path given separately so it can leave the
 * cut open.
 */
const stripesCut = (x0: number, y0: number, x1: number, y1: number, inside: (x: number, y: number) => boolean, border: string, step = 9) => {
  let d = border;
  for (let c = x0 + y0 + step; c < x1 + y1; c += step) {
    const ax = Math.max(x0, c - y1), bx = Math.min(x1, c - y0);
    let start: number | null = null;
    for (let x = ax; x <= bx + 0.01; x += 0.25) {
      const out = x <= bx && !inside(x, c - x);
      if (out && start === null) start = x;
      if (!out && start !== null) { if (x - start > 0.5) d += `M${start.toFixed(1)} ${(c - start).toFixed(1)}L${(x - 0.25).toFixed(1)} ${(c - x + 0.25).toFixed(1)}`; start = null; }
    }
    if (start !== null && bx - start > 0.5) d += `M${start.toFixed(1)} ${(c - start).toFixed(1)}L${bx.toFixed(1)} ${(c - bx).toFixed(1)}`;
  }
  return path(d);
};
/**
 * The yellow bands of the hazard stripes drawn by `stripes`/`stripesCut` over the
 * same box: every other band between the "/" lines, starting at the top-left
 * corner (the guide's stripes run yellow, black, white, black). Clip them to
 * the striped area with the fill's `clip`.
 */
const yellowBands = (x0: number, y0: number, x1: number, y1: number, step = 9) => {
  let d = '';
  for (let c = x0 + y0; c < x1 + y1; c += 2 * step) {
    const e = c + step;
    d += `M${c - y0} ${y0}L${e - y0} ${y0}L${e - y1} ${y1}L${c - y1} ${y1}Z`;
  }
  return path(d);
};
const box = (x0: number, y0: number, x1: number, y1: number) => `M${x0} ${y0}H${x1}V${y1}H${x0}Z`;
// DN LOCK REL recess: a channel off the gear slot whose left end is a half-round concentric with the button.
const DNL = { cx: 365, cy: 332.5, r: 31.5, x1: 397 };
const inDnLockCut = (x: number, y: number) =>
  (x >= DNL.cx && x <= DNL.x1 + 1 && y >= DNL.cy - DNL.r && y <= DNL.cy + DNL.r) || Math.hypot(x - DNL.cx, y - DNL.cy) <= DNL.r;
const pushed = [
  { id: 'out', label: 'Released', hold: 'stable' as const },
  { id: 'in', label: 'Pressed', hold: 'momentary' as const, spring: 'out' },
];
const W = 327;                                   // WHEELS aircraft outline centre line

export const landingGear: PanelSpec = {
  id: 'landing-gear',
  title: 'Landing gear panel',
  canvas: [mm(458 + OX), mm(534)],
  source: {
    variant: 'DCS F-16C Viper (Block 50)',
    manual: 'Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 Aug 2026)',
    page: 55,
    image: 'p. 55 "Landing Gear Panel" cockpit image, 468 x 541 px; SPEED BRAKE indicator placed from the p. 55 wide shot (1152 x 680 px) and drawn from the p. 57 close-ups',
    rectify: 'python3 -I scripts/panel-trace.py <p55.jpg> <out> 140,70 439,19 140,401 428,401',
    pxPerMm: PX,
    scale: 'DZUS stud heads are drawn at one size (8.5 mm) on every panel; this panel\'s scale is set so its fastener heads (about 26 px) match.',
    shown: { 'lg-handle': 'up', hook: 'up', 'gnd-jett': 'off', brakes: 'chan-1', 'anti-skid': 'anti-skid', 'stores-config': 'cat-3', lights: 'off', 'speed-brake': 'closed' },
    unresolved: [
      'The panel has no fourth DZUS in view, so it is rectified on three fasteners and the bottom-left panel screw, taken as a rectangle.',
      'The gear handle hides its slot. The slot is placed under the UP and DN legends, where the handle\'s shaft enters the panel; the knob is drawn square-on over it, at UP as shown and at DN at the bottom of the slot. Its DN position overlaps the edge of the DN LOCK REL stripes.',
      'The gear handle wheel is drawn on its tread, square-on, with the whole tyre as the red warning light lens.',
      'The LIGHTS switch is drawn as a wide flat paddle, from its end-on look in the image (three round bosses along a long pill).',
      'GND JETT and ANTI-SKID are large lever-locks; BRAKES and STORES CONFIG show no lever-lock slot in the image, so they are drawn as plain toggles. The HOOK lever is a one-off, traced from the image: a flat vertical paddle with a semicircular end toward the bushing, overhanging well past it toward the selected position (over the HOOK plate at UP).',
      'The SPEED BRAKE position indicator (item 12) sits on the strip below this panel, outside the rectified image, on a face tilted away from the panel. Its place comes from the p. 55 wide shot, with the vertical offset corrected for that tilt (see the note at the top of the spec); about ±2 mm. The strip it is mounted on is not drawn, only its legend plate and housing.',
      ...speedBrake.unresolved,
      'EMER STORES JETTISON has a light circle-and-square mark at the centre of its cap; what it is (a lens, a latch or a guard insert) is not stated in the guide, so it is drawn as an outline only.',
      'The upper-left corner of the panel is hidden behind the canopy frame in the image; the plate outline steps in there as the visible edge suggests, and its left edge slopes in above GND JETT ENABLE, traced from the strip of side wall visible beside it.',
    ],
  },
  plate: [
    { d: path('M139 23L449 13Q453 12.9 453 17V418Q453 422 449 422H9Q5 422 5 418V246L40 152Q41 150 43 150H135V27Q135 23 139 23Z') },
    ...speedBrake.plate,
    // Top layer, cut away for the gear handle's channel and, to its lower left, a padded recess round the DN LOCK REL button; the cut edge runs through the striped border, so the stripes stop at it; its left end is a half-round concentric with the button.
    { d: path('M139 23L449 13Q453 12.9 453 17V418Q453 422 449 422H9Q5 422 5 418V246L40 152Q41 150 43 150H135V27Q135 23 139 23ZM397 190H447V364H365') + `A${mm(DNL.r)} ${mm(DNL.r)} 0 0 1 ${pt(DNL.cx, DNL.cy - DNL.r).join(' ')}` + path('H397Z'), raised: true },
  ],
  engraving: [
    // EMER STORES JETTISON: legend, and the hazard-striped square around the button.
    L([210, 50], 'EMER STORES', 9, 73),
    L([207, 62], 'JETTISON', 9, 48),
    { kind: 'fill', paint: 'yellow', d: yellowBands(160, 72, 257, 165), clip: path(box(160, 72, 257, 165)) },
    { kind: 'path', pen: 'heavy', d: stripes(160, 72, 257, 165) },
    // WHEELS: aircraft outline with the three gear lights.
    // Traced as the guide draws it: the fuselage sides run unbroken from the
    // nose past the wings, which close on them; the tailplanes join the
    // fuselage with no separating line, and the engine nozzle is its own outline.
    { kind: 'path', d: path([
      `M${W - 16} 157V88L${W} 40L${W + 16} 88V157`,
      `M${W - 16} 99L${W - 63} 129V137H${W - 16}M${W + 16} 99L${W + 63} 129V137H${W + 16}`,
      `M${W - 16} 157L${W - 37} 172V178H${W - 16}M${W + 16} 157L${W + 37} 172V178H${W + 16}`,
      `M${W - 16} 178L${W - 9} 188H${W + 9}L${W + 16} 178`,
    ].join('')) },
    ...([['W', 100], ['H', 113.5], ['E', 127], ['E', 140.5], ['L', 154], ['S', 167.5]] as const).map(([t, y]) => L([W, y], t, 8.5, 7)),
    // HOOK: striped plate with its legend, and the switch positions.
    { kind: 'fill', paint: 'yellow', d: yellowBands(392, 50, 443, 83), clip: path(box(392, 50, 443, 83) + box(400, 59, 435, 75)) },
    { kind: 'path', pen: 'heavy', d: stripes(392, 50, 443, 83, 9, [400, 59, 435, 75]) },
    L([417, 67], 'HOOK', 8.5, 26),
    L([440, 92], 'UP', 8.5, 11),
    L([442, 125], 'DN', 8.5, 12),
    // LG handle slot legends.
    L([410, 183], 'UP', 8.5, 13),
    L([417, 382], 'DN', 8.5, 13),
    // Switch legends.
    L([92, 180], 'GND JETT', 8.5, 55),
    L([90, 192], 'ENABLE', 8.5, 47),
    L([87, 262], 'OFF', 8.5, 17),
    L([170, 185], 'BRAKES', 8.5, 43),
    L([167, 197], 'CHAN 1', 8.5, 35),
    L([170, 257], 'CHAN 2', 8.5, 40),
    L([242, 187], 'PARKING', 8.5, 45),
    L([242, 200], 'BRAKE', 8.5, 35),
    L([292, 237], 'ANTI-SKID', 8.5, 48),
    L([245, 262], 'OFF', 8.5, 20),
    L([53, 315], 'STORES CONFIG', 8.5, 78),
    L([52, 330], 'CAT I', 8.5, 31),
    L([50, 397], 'CAT III', 8.5, 33),
    L([172, 315], 'HORN', 8.5, 31),
    L([172, 332], 'SILENCER', 8.5, 52),
    L([270, 320], 'LIGHTS', 8.5, 39),
    L([270, 335], 'LANDING', 8.5, 45),
    L([313, 367], 'OFF', 8.5, 16),
    L([272, 395], 'TAXI', 8.5, 24),
    // DN LOCK REL: legend and the hazard-striped box around the button.
    L([362, 266], 'DN LOCK', 8.5, 41),
    L([362, 279], 'REL', 8.5, 20),
    { kind: 'fill', paint: 'yellow', d: yellowBands(328, 289, 397, 370),
      clip: path(box(328, 289, 397, 370) + `M${DNL.cx} ${DNL.cy - DNL.r}H${DNL.x1}V${DNL.cy + DNL.r}H${DNL.cx}`) + `A${mm(DNL.r)} ${mm(DNL.r)} 0 0 1 ${pt(DNL.cx, DNL.cy - DNL.r).join(" ")}Z` },
    { kind: 'path', pen: 'heavy', d: stripesCut(328, 289, 397, 370, inDnLockCut, 'M397 301V289H328V370H397V364') },
    L([217, 310], '+', 7),
    ...speedBrake.engraving,
  ],
  placements: [
    { component: 'dzus', at: pt(147, 43), cut: 'up-left' },
    { component: 'dzus', at: pt(438, 32), cut: 'up-right' },
    { component: 'dzus', at: pt(437, 402), cut: 'down-right' },
    { component: 'screw-medium', at: pt(280, 48) },
    { component: 'screw-medium', at: pt(22, 270) },
    { component: 'screw-medium', at: pt(142, 397) },
    { component: 'screw-medium', at: pt(365, 397) },
    { component: 'push-round-xxl', control: 'emer-jett', at: pt(210, 114) },
    { component: 'lamp-round', indicator: 'wheels-nose', at: pt(W, 60) },
    { component: 'lamp-round', indicator: 'wheels-left', at: pt(W - 32, 107) },
    { component: 'lamp-round', indicator: 'wheels-right', at: pt(W + 32, 107) },
    { component: 'toggle-hook', control: 'hook', at: pt(413, 106), paint: 'yellow' },
    { component: 'toggle-large-lock', control: 'gnd-jett', at: pt(90, 223) },
    { component: 'toggle-medium', control: 'brakes', at: pt(169, 226) },
    { component: 'toggle-large-lock', control: 'anti-skid', at: pt(244, 234) },
    { component: 'toggle-medium', control: 'stores-config', at: pt(51, 363) },
    { component: 'push-round-large', control: 'horn-silencer', at: pt(172, 362) },
    { component: 'toggle-paddle-wide', control: 'lights', at: pt(271, 364) },
    { component: 'push-round-xl', control: 'dn-lock-rel', at: pt(365, 332), paint: 'yellow' },
    { component: 'gear-handle', control: 'lg-handle', at: pt(421, 272.5), travel: mm(145), size: [mm(54), mm(100)], indicator: 'gear-handle-light' },
    ...speedBrake.placements,
  ],
  controls: [
    {
      id: 'emer-jett', name: 'EMER STORES JETTISON button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Held for one full second, powers the stores management system and jettisons all external fuel tanks, carted suspension racks and free-fall ordnance on stations 3 to 7. Air-to-air missiles and their launchers stay on. The jet need not be armed. On the ground with weight on wheels it works only with GND JETT at ENABLE.',
      source: src,
    },
    {
      id: 'hook', name: 'HOOK switch', type: 'toggle', travel: 'vertical', latched: true,
      positions: [{ id: 'up', label: 'UP', hold: 'stable' }, { id: 'dn', label: 'DN', hold: 'stable' }],
      initial: 'up',
      protections: [{ kind: 'latch', verified: false, note: 'Drawn as its one-off paddle lever. It moves with a plain click; any lock is not simulated.' }],
      description: 'Lowers the arresting hook for an emergency arrestment on a runway cable. DN releases the hook and holds it fully down with pneumatic pressure. UP only releases that pressure, so the hook can ride up over cables to taxi clear; once down, it cannot be fully raised from the cockpit.',
      source: src,
    },
    {
      id: 'gnd-jett', name: 'GND JETT ENABLE switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'enable', label: 'ENABLE', hold: 'stable' }, { id: 'off', label: 'OFF', hold: 'stable' }],
      initial: 'off',
      description: 'For maintenance checks of the armament systems. ENABLE permits all arming and release, whatever the landing gear or weight-on-wheels state. OFF: with the gear down and weight on wheels, emergency jettison, selective jettison and normal release are inhibited; with the gear down, selective jettison and normal release are inhibited.',
      source: src,
    },
    {
      id: 'brakes', name: 'BRAKES channel switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'chan-1', label: 'CHAN 1', hold: 'stable' }, { id: 'chan-2', label: 'CHAN 2', hold: 'stable' }],
      initial: 'chan-1',
      description: 'Selects the brake channel (1 or 2) through which the toe brakes work the main wheel brakes. Normally left at CHAN 1.',
      source: src,
    },
    {
      id: 'anti-skid', name: 'ANTI-SKID switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'parking-brake', label: 'PARKING BRAKE', hold: 'magnetic', releasesTo: 'anti-skid' },
        { id: 'anti-skid', label: 'ANTI-SKID', hold: 'stable' },
        { id: 'off', label: 'OFF', hold: 'stable' },
      ],
      initial: 'anti-skid',
      description: 'PARKING BRAKE applies full brake pressure to both main wheels with weight on wheels and the throttle at OFF or IDLE; advancing the throttle about 1 inch past IDLE drops the switch to ANTI-SKID and releases the parking brake. It can serve as an emergency brake if the toe brakes fail. ANTI-SKID gives skid control whenever the toe brakes are powered (deceleration control below 85% pedal, maximum-performance control at 85% or more). OFF disables anti-skid and the parking brake.',
      source: src,
    },
    {
      id: 'stores-config', name: 'STORES CONFIG switch', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'cat-1', label: 'CAT I', hold: 'stable' }, { id: 'cat-3', label: 'CAT III', hold: 'stable' }],
      initial: 'cat-3',
      description: 'Tells the flight controls the stores loading. CAT III limits angle of attack and onset rates for departure resistance: any air-to-ground load, wing tanks with a centreline tank, wing tanks with six air-to-air missiles including an AIM-120, or three air-to-air missiles on one wing including an AIM-120. CAT I is for other air-to-air loads. No effect while the gains are in takeoff and landing mode (gear down or refuelling door open). A wrong setting lights STORES CONFIG on the caution light panel.',
      source: src,
    },
    {
      id: 'horn-silencer', name: 'HORN SILENCER button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Silences the landing gear warning or low-speed warning tone.',
      source: src,
    },
    {
      id: 'lights', name: 'LANDING TAXI LIGHTS switch', type: 'toggle', travel: 'vertical',
      positions: [
        { id: 'landing', label: 'LANDING', hold: 'stable' },
        { id: 'off', label: 'OFF', hold: 'stable' },
        { id: 'taxi', label: 'TAXI', hold: 'stable' },
      ],
      initial: 'off',
      description: 'Controls the lights on the nose landing gear: LANDING turns on the landing light, TAXI the taxi light, OFF both off. Both go off automatically when the gear handle is raised.',
      source: src,
    },
    {
      id: 'dn-lock-rel', name: 'DN LOCK REL button', type: 'pushbutton', positions: pushed, initial: 'out',
      description: 'Mechanically releases the spring lock that holds the gear handle down, if its electrical solenoid fails or has no power. It also overrides the weight-on-wheels signal, so the gear will retract on the ground if the handle is raised.',
      source: src,
    },
    {
      id: 'lg-handle', name: 'LG handle', type: 'toggle', travel: 'vertical',
      positions: [{ id: 'up', label: 'UP', hold: 'stable' }, { id: 'dn', label: 'DN', hold: 'stable' }],
      initial: 'dn',
      description: 'Raises or lowers the landing gear through electrical switches. A red light in the handle comes on while the gear or doors are moving, if they fail to lock where commanded, or with the TO/LDG CONFIG warning on the right eyebrow.',
      source: src,
    },
  ],
  indicators: [
    { id: 'gear-handle-light', name: 'LG handle warning light', type: 'lamp', colour: 'red', description: 'The red light in the gear handle wheel. It comes on while the gear or doors are in transit, if the gear fails to lock in the commanded position, or with the TO/LDG CONFIG warning light on the right eyebrow.', source: src },
    { id: 'wheels-nose', name: 'Nose gear WHEELS light', type: 'lamp', colour: 'green', description: 'Green when the nose gear is down and locked.', source: src },
    { id: 'wheels-left', name: 'Left main gear WHEELS light', type: 'lamp', colour: 'green', description: 'Green when the left main gear is down and locked.', source: src },
    { id: 'wheels-right', name: 'Right main gear WHEELS light', type: 'lamp', colour: 'green', description: 'Green when the right main gear is down and locked.', source: src },
    speedBrake.indicator,
  ],
};
