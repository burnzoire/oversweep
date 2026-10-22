# Oversweep — The Interactive Flight Reference

A subject-centric, NATOPS-inspired aviation reference for understanding concepts,
learning procedures and practising practical knowledge. Intended domain: oversweep.com.

**Phase: planning and foundation.** No website, trainers or hosting exist here yet.
Nothing in this repository is approved operational aviation guidance.

## Start here

1. [Agent instructions](AGENTS.md)
2. [Vision](docs/vision.md) and [content catalogue](docs/content-catalogue.md)
3. [Development workflow](docs/development.md)
4. [Architecture proposal](docs/architecture.md) and [decisions](docs/decisions/README.md)
5. [Content standards](docs/content-standards.md) and [provisional design](docs/design-system.md)
6. [Roadmap](docs/plans/00-roadmap.md) and [tracking setup](docs/progress.md)

## Check this foundation

Run `python3 scripts/check_docs.py` using Python 3.11 or newer; no third-party
dependencies are required. CI runs the same check. It checks repository structure,
local Markdown file links, whitespace and required templates, not aviation truth.

Existing MIT licence is retained. Third-party manuals, imagery and excerpts need
their own permission and attribution; repository licensing does not grant those rights.
