# Content catalogue

The inventory tables include proposed entries. Use the content registries and
review records for the status of individual entries.

## Content taxonomy

| Pillar | Reader intent | Content |
| --- | --- | --- |
| Learn | Understand a subject or follow a guided task | Manual & Training Library, including Learning Modules and Procedures |
| Practice | Rehearse a task and get feedback on performance | Standalone trainers linked from the relevant Learn pages |
| Explore | Look up or discover a fact, term, system or place | Encyclopedia entries |

A **Procedure** is a task-oriented document. Its ordered actions and expected
indications take the reader from a defined starting state to a completed task.
Engine Start and Steerpoint Entry are examples. A Procedure can be a living
reference guide, as proposed for Takeoff and Landing, or include guided interaction.

A **Learning Module** is an interactive document organised around what the reader
needs to understand. Cockpit Familiarisation lets readers explore by area and
panel. An aircraft systems module can use preset display states to explain modes
and indications. Both live under the aircraft in Learn.

Group aircraft-specific content by airframe within Learn. Use **Aircraft
Procedures** for task sequences, **Cockpit Familiarisation** for panel-by-panel
orientation, and **Aircraft Systems** for system and display learning modules.
Link to the relevant Encyclopedia entry for reusable definitions and reference
data. Link standalone exercises from the relevant guide and from Practice. Give
each guide, exercise and reference entry one canonical home.

Reference, Interactive, Exploratory, Trainer and Encyclopedia are composable
block types. Panels and instruments can be shared across document types. See the
[content standards](content-standards.md#page-structure-for-procedures) for the
Procedure authoring template.

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

The Training Library provides discovery links to canonical experiences. Use the
pillars above to choose how readers find guided content and standalone practice.

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
