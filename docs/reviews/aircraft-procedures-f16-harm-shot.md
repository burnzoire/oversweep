# Aircraft Procedures — F-16C AGM-88 HARM shot from an HTS designation

## Scope
One guided procedure on the shared cockpit panels, the follow-up to the two HTS procedures: A-G and MASTER ARM (MISC panel), SMS power-up, the WPN format in HAS, designating a radar on the HAD so the HTS hands it to the missile (POS, EOM), the engagement zone, the HUD launch cues and weapon release. It sits at Manual → Aircraft → F-16C → Weapons and tactics → SEAD → AGM-88 HARM → HTS handoff shot. New panels and states: the MISC panel, the SMS (AG88) and WPN (HAS, POS) MFD pages, the HUD HARM launch cues, and the HAD's handed-off (red) box, POS word and engagement zone.

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026). No community guide is cited or followed.

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/e78/33zl8132hi71d3tv0194vvkzpzl3mrr6/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf
sha256: b26f89b715cd130f82798a2e8973a1b7dd52b4366007feb4c7a29677f248e7c5
pages: 47; 90-91; 99; 526; 528; 532-533; 539-540; 657-670
```

## Illustrative, not sourced
- The scenario: the SA-11's range and bearing, the jet's turn back toward it, the 12 NM standoff, times to impact and impact time, steerpoint 4 as the handed-off steerpoint.
- The engagement zone is an approximation (Nathan, 2026-11-23: draw it as well as understood and say so): one EOM example (p. 532, drawn at the 60 NM scale) traced vertex by vertex (round front, two aft lobes meeting at the jet) and scaled with the range scale; its real shape follows the profile and the jet's attitude, altitude and speed. The dashed outline when it runs off the display is not drawn.
- HUD launch cues: the symbols are traced from p. 663 (a target about 45 NM away on the 80 NM scale). This scenario closes to 12 NM, so the upper scale reads 40 NM (p. 664) with the caret at 12 NM; the staple's ends and the AMZ/MMZ separator are illustrative (below the caret in the AMZ, above it once in the MMZ). The HUD's distance and slant range follow steerpoint 4 (44 NM at designation, 12 NM closing). The A prefix and the flashing FOV box in the MMZ follow image 003 (a PB figure). The FOV box is centred on the steerpoint diamond.
- SMS power-up is instant here (it takes time in the jet); a PWR OFF page shows no RDY (assumed).
- The HAS page's dashed red video frame and outlined station box are drawn as in the figure; the guide does not say why they differ from the filled boxes elsewhere. The small range symbol at the lower right of the POS page is drawn as it appears on p. 662, its meaning is not stated.
- The POS page boxes station 3 until the shot and station 7 after it, with the next missile's data still shown (p. 662); the HAS page shows TBL1 and its threats (p. 657) so the scenario stays consistent; p. 662 itself shows station 7 for its own example. The unit of the release altitude is not stated in the guide.
- MISC panel: lever types, hold behaviour of the autopilot PITCH switch and the unlabelled cross; see its spec's `unresolved` list.

## Reviews
- 2026-11-23, Aviation SME agent review of head 4c29b3d: BLOCKED on three panel mismatches (HUD launch scale vs the scenario's range, HAS page TBL1 with TBL3 threats, POS page after the shot), fixed in the next push with the low findings (A-G sets the HUD mode word, 12 NM standoff, AG88 selected in the intro, unsourced turn-away advice dropped, PITCH hold cited to p. 131). Re-review pending.
