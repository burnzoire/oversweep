# Aircraft Procedures — F-16C AGM-65 Maverick article and PRE shot

## Scope
The AGM-65 Maverick article (Manual → Aircraft → F-16C → Weapons and tactics → Air-to-ground weapons → AGM-65 Maverick), the parent of the Maverick procedures, and its first procedure, the PRE shot with an AGM-65H: A-G and MASTER ARM, SMS power-up and the 3-minute warm-up, the WPN format and seeker video, PRE with the seeker slaved to the steerpoint, slewing the seeker onto a tank, narrow field of view, lock-on, the launch checks and release. New MFD pages: SMS (AG65) and WPN (Maverick: BORE, PRE, narrow, tracking, after the shot). The seeker video is a to-scale placeholder (boxes) for generated art; prompts in `docs/art/maverick-seeker-prompts.md`. Eight F-16C avionics terms added (WPN format, pointer cross, PRE/VIS/BORE mode, MBC, video polarity, force correlate).

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026). No community guide is cited or followed.

```review-sources
source: https://www.digitalcombatsimulator.com/upload/iblock/e78/33zl8132hi71d3tv0194vvkzpzl3mrr6/DCS%20F-16C%20Early%20Access%20Guide%20EN.pdf
sha256: b26f89b715cd130f82798a2e8973a1b7dd52b4366007feb4c7a29677f248e7c5
pages: 36; 47; 83-87; 91; 99; 330; 671-691
```

## Illustrative, not sourced
- Seeker fields of view: the guide gives no angles. Wide 5° and narrow 2.5° are assumed (the WPN brackets outline half the picture, so narrow is half of wide). Secondary sources (forum quotes of manuals) give 2.5° for the AGM-65B; none was found for the D, G, H or K.
- The scenario: the crossroads as steerpoint 5, the column (three T-72B, a BMP-2, a Ural-4320, 40 m apart), the jet at 8,000 ft and 4 NM, the shallow dive that puts the seeker 8.5° below the boresight, the 4 NM range and 24 s time to impact.
- The launch range scale's ends (maximum 8 NM, minimum 1 NM) are illustrative; the guide shows the staple but gives no values. The digit under the staple in the p. 673 image (a 7) is not drawn: the guide does not say what it is.
- Before lock the crosshairs are drawn open, stopping 36 px either side of the centre (from the sim; the p. 673 image shows them unbroken, gap size assumed).
- The tracking gate is drawn as the crosshairs closing right in (4 px gap) and jiggling about 1.5 px, from the sim; the guide says only that the crosshairs "expand to indicate the boundaries of the target".
- WPN station: after the shot, station 7 is drawn at the right of the station row; the guide's images show only station 3. NOT SOI is placed from the p. 681 image. The SOI frame breaks round the WPN page's own words.
- SMS: RDY is drawn only once the warm-up is over, a simplification (RDY means armed and ready, p. 674; the p. 672 image shows it with PWR OFF). The procedure teaches NOT TIMED OUT going out as the warm-up cue (p. 679). RP is not explained: p. 672 limits it to the D and G, p. 687 does not. The warm-up is 3 minutes in the jet, a few seconds here. The sub-mode starts at BORE, and OSB 2 steps BORE → PRE.
- WPN starting state (OPER, NOT SOI on first opening in BORE), station 3 firing before 7, and station 7's picture after the shot are illustrative.
- HUD: only the master mode word (BORE, PRE) and ARM change; the PRE (CCRP-style) HUD symbology is not drawn and the procedure does not ask the reader to look at it.
- The seeker video is generated art (ChatGPT, from Nathan) painted over to-scale placeholders (`scripts/maverick-placeholders.py`); it draws the vehicles about 2.5 to 3 times their true size at 4 NM.

## Reviews
- 2026-11-23, Claude SME review of cbec052: READY, 0 blockers. Fixed after: RDY cue (now NOT TIMED OUT), RP dropped for the H, video polarity reworded, DMS aft caution, forced correlation at the end, "at least" 3 minutes, G force correlate in the table, close air support only.
