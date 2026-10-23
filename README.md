# Oversweep — The Interactive Flight Reference

A subject-centric, NATOPS-inspired aviation reference for understanding concepts,
learning procedures and practising practical knowledge. Intended domain: oversweep.com.

**Phase: site skeleton plus draft Case III port.** The responsive static shell
and navigation include a local-review trainer. Normal production builds exclude
unvalidated trainer routes and assets; no aviation validation is claimed.

## Start here

1. [Agent instructions](AGENTS.md)
2. [Vision](docs/vision.md), [content catalogue](docs/content-catalogue.md) and
   [content/experience contracts](docs/content-contracts.md)
3. [Solo development workflow](docs/development.md) — assign a scoped issue; agents handle routine decisions and status
4. [Architecture proposal](docs/architecture.md) and [decisions](docs/decisions/README.md)
5. [Content standards](docs/content-standards.md) and [provisional design](docs/design-system.md)
6. [Roadmap](docs/plans/00-roadmap.md) and [progress evidence](docs/progress.md)
7. [One-assignment feature delivery](docs/copilot-agents.md) — use `oversweep-implementer`

The initial Case III port was delivered in
[#28 / PR #29](https://github.com/burnzoire/oversweep/pull/29); it remains Drafted,
not technically validated.

First vertical slice: the existing [Case III carrier trainer](https://case-three-tomcat.burnzoire.chatgpt.site/).
Deployment: GitHub Pages via GitHub Actions on pushes to main, with manual dispatch
available. The latest observed main deployment succeeded; live URL reachability has
not been checked. See [setup and release instructions](docs/deployment.md).

## Run the site

Use Node.js 22.23.4 or newer within major version 22:

```sh
npm ci
npm run dev
npm run check
```

The Manual and Training Library expose the same Case III Tomcat trainer during
`npm run dev`, under Naval Operations. Start Exercise in its briefing popup begins
the simulation; instructor mode is optional. The remaining catalogue is Coming soon.
The port is Drafted, not technically validated. It is absent from normal production
output, including direct asset paths.

```sh
npm run test:case-iii
OVERSWEEP_REVIEW_TRAINERS=1 npm run check:review
npm run build  # restore ordinary production output after local review
```

The explicit review build uses `/oversweep/` to verify GitHub Pages base paths.
Do not deploy review output. See [port/provenance and limitations](docs/plans/05-case-iii-port.md).
This PR changes no hosting or deployment settings.

## Check this foundation

Run `python3 scripts/check_docs.py` using Python 3.11 or newer; no third-party
dependencies are required. CI runs the same check. It checks repository structure,
local Markdown file links, whitespace and required templates, not aviation truth.

Existing MIT licence is retained. Third-party manuals, imagery and excerpts need
their own permission and attribution; repository licensing does not grant those rights.
