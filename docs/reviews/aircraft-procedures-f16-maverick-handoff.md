# Aircraft Procedures — F-16C AGM-65D boresight and TGP handoff shot

## Scope
The second Maverick procedure, a child of the AGM-65 Maverick article: boresighting two AGM-65Ds (infrared) to the targeting pod in the air on the way in (A-G, MASTER ARM SIMULATE, power and warm-up, PRE, WPN, narrow field of view, pod and seeker slewed onto one point, TMS forward, BSGT, TMS aft, missile step and the same for station 7, the TGP SOI again in Slave, cursor zero, power off and reset), then the TGP handoff shot (A-G and ARM, power and warm-up again, WPN, the pod as SOI slewed onto a tank, the correlator's letters 1, 2, T, C, launch checks and release). 32 steps.

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026). No community guide is cited or followed.

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/e78/33zl8132hi71d3tv0194vvkzpzl3mrr6/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf
sha256: b26f89b715cd130f82798a2e8973a1b7dd52b4366007feb4c7a29677f248e7c5
pages: 36; 47; 55-56; 83-87; 91; 99; 330-331; 340-341; 490; 492; 495-499; 671-687
```

## Illustrative, not sourced
- Fields of view: the guide gives no angles. Maverick wide 5° and narrow 2.5° (as the PRE shot); pod NARO 1° (the p. 679 image shows NARO; the angle is assumed). The pod's meterstick in NARO is taken as a quarter of WIDE's.
- The scenario: steerpoint 3 a brickworks by a road junction 10 NM ahead at 8,000 ft (the chimney the boresight point), steerpoint 5 two T-72Bs and a BMP-2 by a tree line, 5 NM, in a shallow dive. Seeker angles (9.6° and 8.3° down), ranges, the 31 s time to impact and the launch range scale's ends are illustrative.
- Each seeker's misalignment before boresighting (about 0.1 to 0.2°) is illustrative; the guide says only that boresighting improves the handoff.
- The guide shows no indication when BSGT is pressed, so the procedure shows none: the step moves on by itself.
- FOV narrowed on the WPN format's OSB 3 (p. 674) before slewing; the guide's boresight procedure does not mention it. Narrowed again after the power cycle (assumed the format comes back wide).
- Station 7 fires first in the shot because the missile step during boresighting left it next; the guide does not say whether a power cycle resets the station.
- The correlator's letters (p. 673) shown in turn S, 1, 2, T, C over about 4 s; the guide gives no timings. HANDOFF IN PROGRESS is placed under NOT SOI on the WPN format; the guide has no image of it.
- The station block on the TGP format (letter over the next station, 3 and 7, next one boxed) is placed from the p. 679 image by its SWAP and TGP labels. The TGP top row keeps the p. 495 trace (PTR) with NARO in place of WIDE; the p. 679 image reads MAN there.
- After the power cycle the missiles are assumed to keep PRE (the HUD shows PRE at rearm); the guide does not say.
- CZ is drawn on the TGP format only once the pod has been slewed off the steerpoint, and goes out after cursor zero (p. 341); while slewing it is shown from the start of the slew.
- GND JETT ENABLE is not set: the boresight is done in the air (p. 678 asks for it only on the ground). It is named in a caution.
- The SOI starts on the HUD; DMS aft is taken to land on the TGP format first (a caution covers the other MFD).
- Seeker and pod pictures are generated art (ChatGPT, from Nathan) over to-scale placeholders (`scripts/maverick-d-placeholders.py`, prompts in docs/art/maverick-d-seeker-prompts.md), cropped round the steerpoint and the aim point; each picture's span (k, 1.6 to 3.9 glasses) is set so both can be slewed to, so the drawn sizes are not to scale.

## Reviews
- 2026-11-23, Aviation SME (Claude, independent agent) on 1eb9b89: BLOCKED. B1, the pod's slew onto the chimney was never zeroed and would carry to steerpoint 5: fixed with a cursor zero step (CZ, pp. 340-341) before the power-off. Non-blocking fixes applied: station 7's error direction (up and to the right), GND JETT ENABLE back to OFF (p. 680), parallax "a few metres", p. 681 evidence, "8,000 ft above the targets", the TGP prompt's 2.5 times, PRE kept after the power cycle marked as assumed.
- 2026-11-24, follow-up from the re-review (READY on 94597c3): a step makes the TGP the SOI and checks Slave before CZ (CZ zeroes only the cursor being controlled; TMS aft needs SOI and Slave, p. 341); the CZ caution narrowed to the navigation cursor.
