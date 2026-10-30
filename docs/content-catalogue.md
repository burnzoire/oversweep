# Proposed content catalogue

All entries below are **Outlined**, not researched or technically validated.
Examples describe future inventory, not authorised trainer implementation.
Types are composable blocks: Reference (guidance/diagrams/tables), Interactive
(adjustable visualisation), Exploratory (guided experimentation), Trainer
(scenario, feedback and assessment), Encyclopedia (structured facts).

## Manual

| Subject | Description and illustrative entries | Proposed content types |
| --- | --- | --- |
| Flight Fundamentals | Fixed wing: lift, drag, energy, turns; rate and radius relationships. Rotor wing: blade aerodynamics, controls, hover power, forward flight, rotor hazards, autorotation | Reference, Interactive, Exploratory |
| Airfield Operations | Aerodrome geometry, traffic patterns, ground procedures | Reference, Interactive, Trainer |
| Radio Communications | Phraseology, clearances and procedural exchanges | Reference, Exploratory, Trainer |
| Navigation | Position, bearings, dead reckoning and Bullseye spatial orientation | Reference, Interactive, Trainer |
| Instrument Flight | Instrument interpretation, approaches and navigation procedures | Reference, Exploratory, Trainer |
| Flight Planning | Routes, fuel ladders, performance and contingencies | Reference, Interactive, Exploratory |
| Formation Flying | Station keeping, geometry, joins and departures | Reference, Interactive, Trainer |
| Air-to-Air Refuelling | Rendezvous, geometry and procedural coordination | Reference, Interactive, Trainer |
| Naval Operations | Carrier environment; Case I/II/III; Case III timing and recovery | Reference, Interactive, Trainer |
| Air Combat | BFM rate/radius, one-circle/two-circle and energy geometry | Reference, Interactive, Exploratory, Trainer |
| Sensors & Situational Awareness | Radar scan volumes, search concepts and target interpretation | Reference, Interactive, Exploratory, Trainer |
| Air-to-Ground Operations | Delivery concepts, geometry and coordination | Reference, Interactive, Exploratory |
| Abnormal Operations | Recognition, decision making and applicable procedural references | Reference, Exploratory |

## Encyclopedia

| Category | Description | Type |
| --- | --- | --- |
| Aircraft | Variant-specific characteristics and links to relevant subjects | Encyclopedia |
| Ordnance | Weapons, roles, limitations and applicable platforms | Encyclopedia |
| Threat Systems | Identification, capabilities and documented limitations | Encyclopedia |
| Radar & Sensors | Sensor terminology, system records and concept links | Encyclopedia |
| Locations | Theatres, simulator maps and airfields, with facilities, history and simulator coverage | Encyclopedia |
| Carriers | Aircraft carrier hulls, classes, names and operator histories | Encyclopedia |
| Terminology | Acronyms and precise definitions linked from lessons | Encyclopedia |
| Reference Data | Sourced tables, units and reusable constants | Encyclopedia |

## Training Library

| Index facet | Purpose | Content |
| --- | --- | --- |
| Subject | Find experiences by the thirteen manual subjects | References canonical embedded experience IDs |
| Experience type | Distinguish explanation, guided exploration and assessed practice | Interactive, Exploratory, Trainer |
| Applicability | Expose aircraft/variant/simulator scope and prerequisites | Metadata, not separate copies |
| Learning objective | Explain what the experience teaches and how feedback works | Objective, limitations, assessment description |

Use stable IDs and cross-links: for example Naval Operations links to carrier and
aircraft records; Radar links to sensor records; Bullseye belongs to Navigation
and is discoverable from Radio Communications. Avoid duplicating a procedure in
multiple subjects. URL slugs and detailed information architecture remain provisional.

## Carrier inventory

Carriers is an Encyclopedia category alongside Aircraft, Ordnance and Locations,
at `/encyclopedia/carriers/`. Theatres and airfields remain under Locations.
Carrier records live once per physical hull in `src/data/carriers.json`; transfers
and renamings are aliases and operators on that record. Each hull has its own
page, dated source list and visible Drafted status, and links to the existing
Naval Operations ship module. Former Locations carrier URLs redirect to the
canonical category and records while retaining query parameters and fragments.

The post-war boundary is completion after 2 September 1945. First carrier
commission is the proxy where separate completion is not documented; a carrier
completed but never commissioned can record completion without a commission.
Conversions are counted when they first become carriers, not when an existing
carrier is refitted. Cancelled or unfinished ships and general amphibious assault
ships are outside this inventory. A recorded year preserves the source's limited
date precision rather than inventing a day. `carrier-model.mjs` validates records
at build time; source accuracy and inventory completeness still require review.


The Nimitz and Gerald R. Ford classes also have shared, cited class profiles and
individual histories for all eleven completed hulls in those classes. This
enrichment lives in `src/data/carrier-profiles.json`; it does not duplicate hull
identities or alter their inventory. See [profile scope and review evidence](plans/08-major-carrier-profiles.md).
