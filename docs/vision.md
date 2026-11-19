# Product vision

Oversweep — The Interactive Flight Reference combines the accessibility of
Chuck's Guides, the organisation and precision of technical flight manuals and
the interactive learning approach of Brilliant.org. These are inspirations,
not affiliations or sources of automatic permission to reuse material.

Help simulator pilots understand concepts, learn procedures and develop practical
knowledge without repeatedly switching between simulator and reference material.
The intended website is oversweep.com.

## Principles

- Organise around subjects; aircraft are applicability filters and cross-links.
- Teach simulator-independent concepts where appropriate without claiming universal fidelity.
- State aircraft variant and DCS implementation differences where necessary.
- Use minimal, responsive white pages, black typography and precise technical diagrams.
- Add interaction only when it improves understanding.
- Make sources, assumptions, limitations and validation visible.
- Educational content requires no sign-in. Local-only progress is a possible first step.

## Scope

Oversweep has three reader-facing pillars. **Learn** opens the Manual & Training
Library for explanation and guided procedures. **Practice** surfaces standalone
exercises with feedback. **Explore** opens the Encyclopedia for lookup and discovery.
The [content catalogue](content-catalogue.md#content-taxonomy) defines where each
kind of content belongs and how the pillars link to it.

Initial subjects and examples are proposals in the catalogue, not promised releases.
The first vertical slice is the existing [Case III Tomcat carrier trainer](https://case-three-tomcat.burnzoire.chatgpt.site/),
selected by the product owner. It is integrated under Naval Operations with a
linked Training Library entry in [issue #28 / PR #29](https://github.com/burnzoire/oversweep/pull/29).
Its content remains Drafted: source claims, procedures and models still need
independent source-backed SME agent review; the port is not certified.

## Boundaries and open questions

No real-world operational authority is claimed. Do not replace current approved
manuals or instructor judgement with agent-generated content.
No accounts, backend service, paid access, telemetry, multiplayer features,
public hosting or custom agent coordinator are required by this foundation.

Deployment uses static GitHub Pages via GitHub Actions, replacing the private
Windows Docker server proposal. See [deployment](deployment.md) for setup and release.
This authorises hosting configuration; content publication remains separately reviewed.

Decisions still needed: authoritative source editions
and reuse rights, independent SME agent review, search approach, preview
access control and eventual progress persistence. Resolve through scoped issues
and ADRs rather than adding implied requirements.
