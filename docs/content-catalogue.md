# Content catalogue

This guide describes where content belongs. Examples include existing pages and
possible future pages.

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

## Examples by pillar

| Pillar | Content type | Example |
| --- | --- | --- |
| Learn | Subject Learning Module | Case III Carrier Recovery explains the recovery flow with diagrams and guided examples. |
| Learn | Aircraft Procedure | F-16C Engine Start walks through a defined sequence using interactive cockpit panels. |
| Learn | Aircraft Procedure | F-16C Steerpoint Entry uses the ICP and DED for the entry and the HUD for verification. |
| Learn | Aircraft Procedure | F-16C Takeoff and Landing can each be a written guide with annotated instruments. |
| Learn | Cockpit Familiarisation | F-16C Cockpit Familiarisation lets readers browse by cockpit area and explore individual panels. |
| Learn | Aircraft Systems Learning Module | F-16C HTS Display Familiarisation uses preset states to explain display modes and indications, with links to Encyclopedia definitions. |
| Practice | Standalone trainer | The Case III trainer gives readers a recovery scenario to fly with feedback. |
| Explore | Encyclopedia entry | A TACAN definition explains the navigation aid. An airfield entry provides simulator-specific beacon and runway data. |

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
