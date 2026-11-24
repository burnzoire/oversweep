# Aircraft Procedures — F-16C stores management and delivery modes (concept article)

## Scope
One short concept article ahead of the F-16C weapon articles: Manual → Aircraft → F-16C Viper → Weapons and tactics → Stores management and delivery modes (`weapons-and-tactics/stores-management/`). It covers master modes, arming, the SMS page and inventory, choosing a weapon, and how the weapon articles divide by delivery mode or cue. It replaces the planned "Fire control and SMS" placeholder under Systems. Self-protection (RWR, chaff, flares, ECM) and jettison are left to their own articles by design.

## New glossary terms (f16c-avionics)
Master mode, Master arm, CCRP, DTOS, LADD (the last two defined from their names and the guide's category lists; no guide page describes them in detail).

## Sources
- Eagle Dynamics, DCS F-16C Viper Early Access Guide (EN, 16 August 2026): MISC panel p. 47; side stick pp. 83–84; master modes pp. 326–329; delivery sub-modes pp. 335, 343; SMS pp. 366–368; AIM-9 cueing pp. 570–571; SMS AAM page pp. 599–600; A-G SMS pp. 618–619. No community guide is cited or followed.

## Assumptions
- LADD and DTOS are defined by name and the guide's category lists only. The guide's OSB numbers are used where stated (OSB 1, 4, 6, 7); SLAVE/BORE has no OSB number in the article because the guide gives two (18 and 19).

## SME review
2026-11-24 at f712a55: READY, 0 blockers (report in project files sme-reviews/2026-11-24-pr-543.md). Wording fixes for the 8 non-blocking findings applied afterwards; not re-reviewed (Nathan's standing rule for minor fixes).

## Checks
- `node --test tests/manual-menu.test.mjs tests/aircraft-procedures.test.mjs`: pass.
- `astro build`, `scripts/check_site.mjs`, `scripts/check_encyclopedia.mjs`, `scripts/check_docs.py`: pass.
