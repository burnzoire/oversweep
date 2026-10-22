# Oversweep — The Interactive Flight Reference

A subject-centric, NATOPS-inspired aviation reference for understanding concepts,
learning procedures and practising practical knowledge. Intended domain: oversweep.com.

**Phase: site skeleton.** The responsive static shell and navigation are in
development; trainer experiences and validated aviation guidance are not included.

## Start here

1. [Agent instructions](AGENTS.md)
2. [Vision](docs/vision.md), [content catalogue](docs/content-catalogue.md) and
   [content/experience contracts](docs/content-contracts.md)
3. [Solo development workflow](docs/development.md) — assign a scoped issue; agents handle routine decisions and status
4. [Architecture proposal](docs/architecture.md) and [decisions](docs/decisions/README.md)
5. [Content standards](docs/content-standards.md) and [provisional design](docs/design-system.md)
6. [Roadmap](docs/plans/00-roadmap.md) and [tracking setup](docs/progress.md)
7. [One-assignment feature delivery](docs/copilot-agents.md) — use `oversweep-implementer`

First slice delivery task: [#20](https://github.com/burnzoire/oversweep/issues/20)
combines research, audit, planning, implementation, tests and review in one issue.

First vertical slice: the existing [Case III carrier trainer](https://case-three-tomcat.burnzoire.chatgpt.site/).
Deployment: static GitHub Pages via a manually triggered GitHub Actions workflow;
see [setup and release instructions](docs/deployment.md). The site has not yet been
published.

## Run the site

Use Node.js 22.23.4 or newer within major version 22:

```sh
npm ci
npm run dev
npm run check
```

The Manual, Encyclopedia and Training Library are navigation shells with Coming
soon placeholders; no Case III trainer or aviation guidance is published.

## Check this foundation

Run `python3 scripts/check_docs.py` using Python 3.11 or newer; no third-party
dependencies are required. CI runs the same check. It checks repository structure,
local Markdown file links, whitespace and required templates, not aviation truth.

Existing MIT licence is retained. Third-party manuals, imagery and excerpts need
their own permission and attribution; repository licensing does not grant those rights.
