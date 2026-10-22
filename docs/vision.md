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

Three connected collections: Manual, Encyclopedia and Training Library.
Reference, Interactive, Exploratory, Trainer and Encyclopedia blocks compose
pages within one content system. The Training Library indexes embedded experiences;
it does not duplicate their content or define a second application.

Initial subjects and examples are proposals in the catalogue, not promised releases.
The first vertical slice is the existing [Case III Tomcat carrier trainer](https://case-three-tomcat.burnzoire.chatgpt.site/),
selected by the product owner. Assess and integrate it under Naval Operations,
with a linked Training Library entry. Its source, procedures and models still need
review; this foundation has not imported or certified the prototype.

## Boundaries and open questions

No real-world operational authority is claimed. Do not replace current approved
manuals or instructor judgement with agent-generated content.
No accounts, backend service, paid access, telemetry, multiplayer features,
public hosting or custom agent coordinator are required by this foundation.

Deployment planning uses GitHub Actions and the owner's private Windows 11 Docker
server; delivery and access-control details remain proposed in [deployment](deployment.md).

Decisions still needed: authoritative source editions
and reuse rights, qualified reviewers, search approach, preview
access control and eventual progress persistence. Resolve through scoped issues
and ADRs rather than adding implied requirements.
