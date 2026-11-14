# F-16C panel geometry discrepancy audit — PR #262
Updated 2026-11-14. **This is a measured-reference task, not an illustration-quality judgement.**

## Inspection sources and variant caveat

- [Eagle Dynamics, DCS F-16C Block 50 guide, 23 March 2026](https://www.digitalcombatsimulator.ru/upload/iblock/6f7/joywm66pwdgg4iacljy8zolons4dz8dh/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf): primary DCS variant and cockpit indications.
- [xFlight, Block 40/42 current and Block 50/52 ELEC panel](https://www.xflight.de/pe_org_par_lfc_elec.htm): indicator stack, main power switch, reset, lamp windows and fasteners. Its single photograph of a replica is **not** a guarantee of DCS panel identity.
- [xFlight single-seat TEST panel, front view](https://www.xflight.de/original/parts/left_console/test/test.gif) and [photograph](https://www.xflight.de/original/parts/left_console/test/test_03.jpg): labelled controls, lamp arrangement, fasteners. Older hardware may use OXY QTY while DCS uses **OBOGS BIT**; use the DCS label.
- [xFlight GE F110 engine-start panel details](https://www.xflight.de/pe_org_par_lfc_engstart.htm) and [photograph](https://www.xflight.de/original/parts/left_console/engstart/engstart_03.jpg).
- [DCS F-16C caution panel](https://cypher1778.github.io/DCS_Wiki/f-16c/images/ss17-caution_panel.jpg), [right eyebrow](https://wiki.hoggitworld.com/images/8/88/VBLs.jpg), [engine instruments](https://wiki.hoggitworld.com/images/1/10/ENG_Instruments.jpg).

## Defects observed in the previous implementation

| Element | Earlier incorrect implementation | Evidence / corrected requirement | State |
| --- | --- | --- | --- |
| ELEC indicator stack | Five separate full-width lenses | Actual housing consists of FLCS PMG / MAIN GEN paired, STBY GEN with unused companion space, then EPU GEN / EPU PMG; plus a distinct ACFT BATT two-by-one assembly | **Rebuilt** |
| ELEC caution reset | Reset button vertically displaced, labelled independently of actual panel | Reference has CAUTION RESET under and left of status block, adjacent to MAIN PWR | **Improved; survey pending** |
| TEST upper row | Only FIRE/OHEAT and MAL/IND, with OBOGS on lower row | FIRE/OHEAT, OBOGS BIT (older: OXY QTY), MAL/IND all on one row | **Rebuilt** |
| TEST mid row | PROBE HEAT on right, EPU/GEN left lower | PROBE HEAT left, EPU/GEN centre, FLCS PWR indicator right | **Rebuilt** |
| TEST FLCS lamps | Four unrelated horizontal indicator blocks | Single rectangular FLCS indicator with C/A top and D/B bottom as seen in the front-on image | **Rebuilt** |
| TEST switch | Oversized general illustration and wrong placement | Lower right, TEST/NORM/MAINT about one actual toggle pivot | **Rebuilt and event pivot corrected** |
| ENG & JET START | Generic rectangle without real family details | GE F110 panel only: RUN, JFS START1/OFF/START2, guarded ENG CONT PRI/SEC, AB RESET/NORM/ENG DATA, MAX POWER/OFF | **Partial; fasteners and exact guards pending** |
| Engine instruments | Two equal generic dials | OIL, NOZ POS, RPM, FTIT as a vertical stack; oil/nozzle/rpm/FTIT faces differ in size and markings | **Stack order fixed; faces still wrong** |
| DZUS mounting | Fabricated four-corner hole pattern | Must match **every visible mounting point** from front-on DCS reference, including intermediate fasteners and adjacent panel cut-outs | **BLOCKER** |
| Throttle | Cartoon rectangular slider | Actual F-16C cutoff-to-idle gate and throttle quadrant profile | **BLOCKER** |
| Caution and eyebrow | Generic panel-shaped rectangles | Must match exact F-16C annunciator contours, lamps, labels and mounting locations | **Partial; source-overlay signoff pending** |

## What counts as done

A panel is not accepted merely because the correct controls are present. The acceptance sheet requires:

1. A high-resolution **DCS Block 50** cockpit reference (not another block), with a URL/capture ID and date.
2. Orthographic or perspective-corrected source orientation, annotated with a panel-local measurement scale.
3. Independent outer perimeter + every notch, DZUS hole, recessed screw, control centre, guard, lamp-window edge and printed marking.
4. A same-scale 50%-opacity overlay from SVG against DCS reference plus side-by-side rendering. Record *each discrepancy* with a correction or justification.
5. Click hitboxes anchored to the drawn controls; validate mouse and keyboard paths without moving real switches for usability.
6. An aviation SME geometry signoff **separate** from a successful browser build.

**No accepted panel satisfies these criteria yet.** Source dimensions are not fastener coordinates. The current PR remains draft and review-only.

## Evidence-based correction pass and actual browser inspection

The CI screenshots were downloaded and inspected at their own pixel resolution (not just trusting automated green checks). This exposed three concrete bugs:

1. FLCS TEST toggle appeared visually detached from its bezel during CSS transform transition. **Corrected by removing transition and keeping transform about the actual switch pivot.**
2. Dashed highlight rectangles covered large areas of the TEST and JFS panels, falsely suggesting physical cutouts. **Corrected by using invisible hit areas and a switch-local focus ring.**
3. Four identical engine faces, with digital numbers in the analogue dial area. **Corrected to staggered faces with relative sizes informed by the DCS photo, and moved synthetic numbers outside the panel.**

Further corrections were made to ELEC (real paired annunciator housing and unused STBY lens) and TEST (top-row positions and 2×2 FLCS A/B/C/D indicator, with its lower-right test switch). Check the [latest close-up captures](https://github.com/burnzoire/oversweep/tree/review/pr-262-browser-captures/review-screenshots) on the separate temporary branch.

**Remaining visual blockers are deliberately NOT marked complete.** A plausible line drawing with a correct legend is not an exact reproduction of panel contour/DZUS coordinates. The source reference must be perspective-rectified and all control/hole coordinates independently measured before the final redraw is accepted. No new files reproduce third-party photographic pixels.


## Selected drawing language — user reference, 14 November 2026

Visual style reference: [VRChat forum: Blueprints of the F-16 for AVPs](https://ask.vrchat.com/t/blueprints-of-the-f-16-for-avps-avatar-vehicle-plane/27199) (multiple F-16 blueprint/technical sheets published by the forum user).

**Desired presentation:** blueprint/engineering-drawing linework, orthographic and detailed. A cockpit panel drawing should be a complete technical depiction of the *part*, not a schematic block of the switches relevant to the current step. Include boundaries, bends/notches, fasteners/DZUS, panel recesses, switch bodies, guarded controls, label lettering and instrument mountings where visible, with faithful spatial arrangement. Use precise consistent stroke weights, unfilled backgrounds, restrained leader lines and no decorative housings or invented graphics. Highlight active controls separately as an interaction overlay; it must not change the source geometry.

**Important distinction:** the VRChat post contains F-16 avatar/vehicle blueprint illustrations, including F-16A/B material. It is an **aesthetic/detail-density reference only**. It is not evidence for the geometry or labels of the **DCS F-16C Block 50 cockpit**. All cockpit details must come from separately verified DCS-specific visual references, and the blueprint artwork must not be directly copied or traced without permission.

Acceptance for next revision: for each startup panel, publish a *full-panel* drawing alongside a matching-perspective source capture and a side-by-side overlay. A detailed-looking but unsurveyed redraw remains unaccepted, even if mouse/keyboard interaction tests pass.

## Front-view source-coordinate redraw (14 November 2026)

This pass moved beyond guessed layouts. Original frontal reference diagrams were retrieved temporarily for analysis, rendered to normalized dimensions, and visually compared with browser-captured SVG closeups. **Images are not committed to the implementation branch.**

| Panel | Original reference | SVG drawing frame | DZUS centres (SVG units) | Control centres |
| --- | --- | --- | --- | --- |
| ELEC | xFlight Block 50/52 ELEC diagram, 210 × 262 px, scaled 3× | 630 × 786 | (47,106), (582,106), (49,676), (581,676) | MAIN PWR (187,145); CAUTION RESET (242,445) |
| TEST | xFlight Model C (left half), 442 × 420 px two-panel image, single-seat panel cropped/scaled to 607 × 1162 | 607 × 1162 | (103,45), (481,45), (104,1118), (481,1118) | OBOGS (305,247); PROBE HEAT (86,565); EPU/GEN (290,565); FLCS PWR TEST (450,779) |
| ENG & JET START | xFlight GE F110 plate, 551 × 210 px sideways, rotated and scaled 2× | 420 × 1100 | (31,79), (391,80), (31,1020), (390,1020) | JFS (277,154); RUN (119,157); ENG CONT (209,393); AB RESET (208,703); MAX POWER (209,996) |

Additional small fastener centres are in `StartupPanels.astro` (`captive-screw`). Coordinates approximate visible feature centres from source bitmaps; source image resolution and perspective limit subpixel accuracy. These are **source-relative measurements**, not physical aircraft millimetres or proof of exact DCS cockpit correspondence.

During browser review, the first source-coordinate redraw produced oversized panel lettering and JFS labels colliding with the switch sweep. The line-art text was reduced to 16 px (principal legends) and 12 px (minor legends), preserving the vector shapes and interaction pivots.

Outstanding before exact-DCS signoff:
- Compare current DCS Block 50 screenshots at high resolution, including early/late cockpit differences, **not just historical Block 50/52 hardware**.
- Check entire sheet perimeter against DCS, including segment seams and countersunk/DZUS mount cuts. The xFlight raster is a reference, not a measured CAD drawing.
- Validate ELEC annunciator grouping and real JFS guard colour/mechanical behaviour in the actual sim.
- Replace conceptual throttle and verify engine-dial faces and warning placements.
- Confirm copyright provenance for any direct reuse; current SVG is independently drawn and only original drawings are committed.
