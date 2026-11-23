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
- The tracking gate is drawn as the crosshairs stopping 10 px either side of the target; the guide says only that the crosshairs "expand to indicate the boundaries of the target".
- WPN station: after the shot, station 7 is drawn at the right of the station row; the guide's images show only station 3. NOT SOI is placed from the p. 681 image. The SOI frame breaks round the WPN page's own words.
- SMS: RDY appears only once the warm-up is over (the p. 672 image shows RDY with PWR OFF; not modelled). The warm-up is 3 minutes in the jet, a few seconds here. The sub-mode starts at BORE, and OSB 2 steps BORE → PRE.
- HUD: only the master mode word (BORE, PRE) and ARM change; the PRE (CCRP-style) HUD symbology is not drawn and the procedure does not ask the reader to look at it.
- The seeker video is a placeholder: units are boxes of their real size projected from the jet (`scripts/maverick-placeholders.py`).

## Reviews
- Not yet reviewed.
