# F-16C Block 50 panel reference inventory — issue #261 / PR #262

Research date: 2026-11-14. Purpose: collect **external references** for accurate, original line drawings of startup panels, including switches, printed legends, guards, panel boundaries and DZUS/quarter-turn fastener positions. **None of these images is incorporated into the repository.**

## Priority references

1. **Eagle Dynamics, DCS F-16C Early Access Guide, updated 23 March 2026** — primary simulator-specific source:
   https://www.digitalcombatsimulator.ru/upload/iblock/6f7/joywm66pwdgg4iacljy8zolons4dz8dh/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf
   - Cockpit Overview (p. 43); Instrument Panel (pp. 44–53); Left Console (pp. 61–73); Throttle (p. 85 onward); Before Engine Start (p. 134); Engine Start (p. 135).
   - Left-console overview identifies TEST, ELEC, EPU and ENG & JET START panels separately. The manual's cockpit images must be viewed, not just its extracted text.
   - Primary target is **the DCS Block 50 cockpit**, not a generic USAF F-16A, older C block or Falcon BMS cockpit.

2. **DCS user-file cockpit screenshots — DerekSpeare, 2019**:
   https://www.digitalcombatsimulator.com/en/files/3307093/
   - Screenshots are explicitly stated to be *taken directly from DCS*, and the author permits freeware distribution **without modifying the document**. This is evidence for geometry; do not redistribute modified captures or embed page images without further rights assessment. Check changes in DCS after 2019.

3. **DCS F-16C cold-start screenshots, Flying Peregrine**:
   https://flying-peregrine.com/f-16c
   - Electrical power switch/console, with a labelled DCS startup image:
     https://flying-peregrine.com/img/modules/f-16c/coldstart/f-16c-coldstart-1.jpg
   - Good for locating MAIN PWR relative to adjacent panels and DZUS fasteners; the annotation overlays some geometry, so use other images for obscured details.

4. **Real F-16 panels, xFlight**:
   - ENG & JET START (including GE F110 examples):
     https://www.xflight.de/pe_org_par_lfc_engstart.htm
   - Detailed photographed panel with circular fasteners:
     https://www.xflight.de/original/parts/left_console/engstart/engstart_03.jpg
   - xFlight distinguishes F100 and F110 panel variants. DCS F-16C Block 50 represents a GE F110; use **GE F110 panel** as corroboration, never assume a photograph of another block exactly matches DCS.
   - Electrical panel photograph of a simulator:
     https://www.xflight.de/simulator/pictures/detail/sim_124.jpg
     This image reveals fastener placement and electrical lamp positions, but may not be a faithful match to current DCS.
   - Photographs are **third-party copyrighted imagery with no redistribution permission established**. Use as factual visual references, not copied artwork.

5. **QAF Falcon BMS Block 50/52 cockpit panel catalogue**:
   https://www.quebecairforce.com/Commun/Sim_BMS/Ref/Cockpit_Panel/F-16C-Block50/
   - Useful separately indexed panel families: 2.01 TEST, 2.08 EPU, 2.09 ELEC, 2.12 ENG & JET START and 2.19 THROTTLE QUADRANT.
   - **BMS, not DCS**; reference/secondary cross-check only.

## Asset-specific geometry work

| Required original SVG asset | DCS evidence | Supplemental evidence | Validation priority |
| --- | --- | --- | --- |
| Left console **ELEC** panel | ED manual pp. 61–73; DCS user-file and Flying Peregrine photographs | xFlight electrical photograph; QAF 2.09 | **First.** Correct panel perimeter, battery / MAIN PWR detents, ALL lamps, DZUS locations, and neighbouring panel seams |
| **TEST** panel FLCS PWR TEST | ED manual Left Console and Test Switch Panel description | QAF 2.01; DCS user-file screenshots | Correct shape of entire panel, text, test switch location, other visible switches/fasteners |
| **EPU** panel | ED left console and engine-start steps | QAF 2.08; DCS screenshot | Do not merge separate EPU and ELEC panel geometries |
| **ENG & JET START** panel | ED left console / engine-start | xFlight F110 photographs; QAF 2.12 | Correct RUN lens, JFS START 1/OFF/START 2, guarded ENG CONT, AB RESET if visible, fastener positions |
| **Throttle** detent / quadrant | ED HOTAS throttle / startup | QAF 2.19 and DCS screenshots | Distinguish accurate throttle geometry from conceptual cutoff/idle track |
| Engine instruments, caution panel | ED Instrument Panel pp. 44–53 | DCS screenshots only for definitive presentation | Replace invented circular RPM/FTIT prototype; do not fabricate face layout |

## Exact-outline acceptance process

- Capture or inspect full-resolution reference at a near-orthographic view, with oblique second view for switch travel and fastener depth. Use zoom/crops when the source image is legible enough.
- Create a separate **panel-local coordinate system** for the original SVG. Trace factual outline/placements from multiple independent images (do not copy image pixels or artwork), including every visible corner, notch, panel separation, screw/DZUS hole and legend. Preserve spacing and relative sizes.
- Register control hit areas independently from visible geometry; hit areas may be larger for touch, but visible controls **may not** be relocated for ease of use.
- Verify reference identity (DCS Block 50, manual edition / screenshot capture date). Aircraft upgrades and real-world engine variant photos can differ.
- Save measured reference-to-SVG comparison screenshots in the temporary review branch, never the merge branch. Require reviewer signoff on fasteners, labels and visible panel layout.
- Do not mark any currently drawn panels **exact**: the existing prototype has not passed this side-by-side check.

## Rights notes

Publicly available images are useful **references**, but online availability is not a blanket licence to reproduce images or trace copyrighted drawings. Draw original technical diagrams, cite sources, avoid copying a third-party guide's art and labels arrangement as an expressive illustration. Where required, seek permission for direct image reuse. Confirm rights separately before placing any photograph or game texture in published Oversweep.
