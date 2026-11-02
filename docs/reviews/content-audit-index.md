# Oversweep content audit — coverage and findings

Updated: 2026-11-02. Based on the published registries `src/data/modules.json`, nested `src/data/experiences.json[*].module` and `src/data/encyclopedia.json`.

**Progress: 71 / 240 individual reviews (29.3%).** All 11 manual modules are reviewed, and 60 of 229 encyclopedia articles. **169 encyclopedia records remain.** The Close Air Support audit was applied as a benchmark rewrite (revision 2); no other content pages have been rewritten.

To apply an audit to a page, follow the [module page playbook](content-audit-playbook.md), learned from the Close Air Support benchmark; new modules follow it too.

## Five review questions

1. **Length:** Is prose repetitive, longer than appropriate or missing enough explanation?
2. **Imagery/interactivity:** Do existing photos, diagrams and interactions help, and what specific additional aid would improve learning?
3. **Learning outcomes:** What should a reader be able to identify, explain or apply?
4. **Completeness:** What important distinctions, links, sources, time periods or limitations are missing?
5. **Flight simulation:** What matters in DCS, Falcon BMS or relevant sims, and what is **modelled**, **simplified**, **not modelled** or **unverified**? Require sim/module/version and credible evidence for a fidelity or absence claim.

Existing simulator-specific presentation: `.sim-panel` in `src/styles/encyclopedia.css`, used by `AirfieldRecordPage.astro`. Preserve real-world facts as the primary explanation, with visually distinct simulator-specific sections. Simulator terrain is not presumed to match real or historical geometry; modern OSM is not proof of a historical map state. Oversweep trainers are separate models and not equivalent to DCS/BMS.

Reviews are source-inspection editorial findings, **not** rendered-browser QA, external sourcing validation or aviation SME signoff. Simulator fidelity prompts are flagged pending verification. Technical changes must follow normal SME review.

## Modules — 11/11

- [BFM](content-audit-bfm.md)
- [Airfield operations](content-audit-airfield-basics.md)
- [Radio procedures](content-audit-radio-procedures.md)
- [Fixed-wing fundamentals](content-audit-principles-of-flight.md)
- [Rotor-wing fundamentals](content-audit-rotor-wing.md)
- [Navigation](content-audit-air-navigation.md)
- [Weapons delivery](content-audit-weapons-delivery.md)
- [Close air support](content-audit-close-air-support.md) — findings applied in module revision 2 as a benchmark
- [Ship operations](content-audit-ship-operations.md)
- [Case III](content-audit-case-iii.md)
- [Autorotation](content-audit-autorotation.md)

New modules are written to the playbook from the first draft and are not audited separately: Instrument flying (revision 1, PR for issue #97).

## Encyclopedia — 52/229

| Category | Reviewed | Pending |
| --- | ---: | ---: |
| Aircraft | 12 | 36 |
| Ordnance | 12 | 57 |
| Threat systems | 19 | 0 |
| Locations | 9 | 76 |
| Terminology | 8 | 0 |

### Reviewed records

**Aircraft (12/48):** [a-10](content-audit-a-10.md), [f-14](content-audit-aircraft-f-14.md), [fa-18c](content-audit-aircraft-fa-18c.md), [f-16](content-audit-aircraft-f-16.md), [ah-64d](content-audit-aircraft-ah-64d.md), [mig-21](content-audit-aircraft-mig-21.md), [f-4](content-audit-aircraft-f-4.md), [m-2000c](content-audit-aircraft-m-2000c.md), [av-8b](content-audit-aircraft-av-8b.md), [su-27](content-audit-aircraft-su-27.md), [p-51d](content-audit-aircraft-p-51d.md), [spitfire-ix](content-audit-aircraft-spitfire-ix.md).

**Ordnance (12/69):** [gau-8](content-audit-gau-8.md), [aim-54](content-audit-ordnance-aim-54.md), [agm-88](content-audit-ordnance-agm-88.md), [aim-120](content-audit-ordnance-aim-120.md), [agm-114](content-audit-ordnance-agm-114.md), [aim-9](content-audit-ordnance-aim-9.md), [aim-7](content-audit-ordnance-aim-7.md), [hydra-70](content-audit-ordnance-hydra-70.md), [gbu-12](content-audit-ordnance-gbu-12.md), [r-27](content-audit-ordnance-r-27.md), [jdam](content-audit-ordnance-jdam.md), [hvar](content-audit-ordnance-hvar.md).

**Threat systems (19/19):** [sa-1](content-audit-threat-systems-sa-1.md), [sa-2](content-audit-sa-2.md), [sa-3](content-audit-threat-systems-sa-3.md), [sa-4](content-audit-threat-systems-sa-4.md), [sa-5](content-audit-threat-systems-sa-5.md), [sa-6](content-audit-threat-systems-sa-6.md), [sa-7](content-audit-threat-systems-sa-7.md), [sa-8](content-audit-threat-systems-sa-8.md), [sa-9](content-audit-threat-systems-sa-9.md), [sa-10](content-audit-threat-systems-sa-10.md), [sa-11](content-audit-threat-systems-sa-11.md), [sa-12](content-audit-threat-systems-sa-12.md), [sa-13](content-audit-threat-systems-sa-13.md), [sa-14](content-audit-threat-systems-sa-14.md), [sa-15](content-audit-threat-systems-sa-15.md), [sa-16](content-audit-threat-systems-sa-16.md), [sa-17](content-audit-threat-systems-sa-17.md), [sa-18](content-audit-threat-systems-sa-18.md), [sa-19](content-audit-threat-systems-sa-19.md).

**Locations (9/85):** [incirlik](content-audit-locations-incirlik.md), [akrotiri](content-audit-locations-akrotiri.md), [saipan](content-audit-locations-saipan.md), [batumi](content-audit-locations-batumi.md), [fallon](content-audit-locations-fallon.md), [nellis](content-audit-locations-nellis.md), [dcs-syria](content-audit-locations-dcs-syria.md), [dcs-caucasus](content-audit-locations-dcs-caucasus.md), [bms-korea](content-audit-locations-bms-korea.md).

**Terminology (8/8):** [brevity](content-audit-terminology-brevity.md), [joint-terms](content-audit-terminology-joint-terms.md), [airfield-atc](content-audit-terminology-airfield-atc.md), [carrier](content-audit-terminology-carrier.md), [air-combat](content-audit-terminology-air-combat.md), [flight](content-audit-terminology-flight.md), [navigation](content-audit-terminology-navigation.md), [weapons](content-audit-terminology-weapons.md).

## Highest-value findings

- **Module structure (P1):** BFM, Case III, fundamentals and ship operations need a clearer first-pass progression before wholesale cutting of reference content.
- **Autorotation (P1):** shorten dense prose and use a clear conceptual sequence. Previously reverted diagrams mean visual QA is a prerequisite, not an optional polish step.
- **Simulator boundaries (P1):** current real-world descriptions must not imply every DCS/BMS version simulates the same system. Scope the claim to exact variants and implementations; unknown is not absent.
- **Featured aircraft (P1/P2):** some lead with historical anecdotes at the expense of design, systems, variants and sim applications; tighten opening narrative while preserving worthwhile history.
- **Weapons guidance (P2):** AIM-54, AIM-120, AGM-114, GBU-12 and R-27 would benefit from compact variant/guidance-phase comparisons rather than expanded prose or mini-games.
- **Threats (P2):** all 19 SA-series articles now have individual editorial reviews; preserve radar/seeker/envelope distinctions. Cross-article disputes (e.g. SA-14 versus SA-18 loss attribution) need independent sourcing.
- **Terminology (P2):** preserve formal definitions; improve alphabetical retrieval, cross-links, context and term disambiguation rather than reducing definition word counts.
- **Locations (P1/P2):** label temporary units and current data by date, and separate real facilities from DCS/BMS map-specific runway and navigation information. Avoid using present-day OSM as a historic simulator airfield diagram.
- **GAU-8 (P2):** retain flagship detail and featured placement, trim duplicate plate statistics and consider an installation schematic.

## Remaining work

Next: remaining featured-linked locations/airfields; the rest of aircraft and ordnance; then all other locations. All terminology sets and all SA-series threat profiles now have individual reviews. Each outstanding record requires an individual review grounded in its source and, when assessing actual visual quality, a rendered-page check. Do not create per-record placeholders or mark simulator implementation as verified without evidence.
