# Oversweep — The Interactive Flight Reference

A subject-centric, NATOPS-inspired aviation reference for understanding concepts,
learning procedures and practising practical knowledge. Intended domain: oversweep.com.

**Phase: application foundation.** A local Astro application and source-gated
development exercise are implemented. The Case III prototype has not been
audited, and the synthetic preview is not a Case III trainer or approved
operational aviation guidance. No hosting or deployment is configured.

## Start here

1. [Agent instructions](AGENTS.md)
2. [Vision](docs/vision.md), [content catalogue](docs/content-catalogue.md) and
   [content/experience contracts](docs/content-contracts.md)
3. [Solo development workflow](docs/development.md) — assign a scoped issue; agents handle routine decisions and status
4. [Architecture proposal](docs/architecture.md) and [decisions](docs/decisions/README.md)
5. [Content standards](docs/content-standards.md) and [provisional design](docs/design-system.md)
6. [Roadmap](docs/plans/00-roadmap.md) and [tracking setup](docs/progress.md)
7. [Copilot role profiles and handoffs](docs/copilot-agents.md)

First vertical slice: the existing [Case III carrier trainer](https://case-three-tomcat.burnzoire.chatgpt.site/).
Deployment planning: GitHub Actions and a private Windows 11 Docker server;
see [delivery proposal](docs/deployment.md).

## Run and verify the application

Use Node.js 22.23.4 or newer in the 22.x line and npm 10.

```sh
npm ci
npm run dev
```

The local development site exposes a synthetic arithmetic exercise from both
Naval Operations and the Training Library. It is not a reproduction of the
inaccessible prototype and does not simulate or assess Case III procedures.
Production builds fail closed: records without resolved evidence, current
qualified validation, rights, accessibility review, and publication approval
are omitted.

```sh
npm run check
npx playwright install chromium
npm run test:browser
python3 scripts/check_docs.py
```

`npm run check` runs Astro diagnostics, TypeScript, schema/registry and model
tests, and a static production build. The browser suite uses local Chromium;
CI installs its system dependencies and runs the same checks.

The implementation still needs the owner-authorised prototype export and its
provenance (creator/source, revision/export date, assets, dependencies, included
third-party material, and reuse permissions), lawful access to applicable
primary publications for exact edition/section/page mapping, and a qualified
technical reviewer. Do not upload restricted manuals or assets without rights.

## Documentation foundation check

Run `python3 scripts/check_docs.py` using Python 3.11 or newer; no third-party
dependencies are required. CI runs the same check. It checks repository structure,
local Markdown file links, whitespace and required templates, not aviation truth.

Existing MIT licence is retained. Third-party manuals, imagery and excerpts need
their own permission and attribution; repository licensing does not grant those rights.
