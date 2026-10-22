"""Dependency-free structural checks; not a factual or full Markdown validator."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
REQUIRED = (
    "README.md", "AGENTS.md", "docs/vision.md", "docs/content-catalogue.md",
    "docs/content-standards.md", "docs/architecture.md", "docs/design-system.md",
    "docs/development.md", "docs/progress.md", "docs/plans/00-roadmap.md",
    "docs/decisions/README.md", "docs/decisions/0001-content-first-architecture.md",
    ".github/pull_request_template.md", ".github/ISSUE_TEMPLATE/work.md",
    ".github/ISSUE_TEMPLATE/content.md", ".github/workflows/foundation.yml",
)
errors = []
for name in REQUIRED:
    if not (ROOT / name).is_file():
        errors.append(f"Missing required file: {name}")
files = sorted(
    p for p in ROOT.rglob("*")
    if p.is_file() and ".git" not in p.relative_to(ROOT).parts
    and p.suffix in {".md", ".py", ".yml"}
)
for path in files:
    rel = path.relative_to(ROOT)
    body = path.read_text(encoding="utf-8")
    if not body.endswith("\n"):
        errors.append(f"{rel}: missing final newline")
    for number, line in enumerate(body.splitlines(), 1):
        if line.rstrip() != line:
            errors.append(f"{rel}:{number}: trailing whitespace")
    if path.suffix != ".md":
        continue
    if not body.startswith("# ") and path.parent.name != "ISSUE_TEMPLATE":
        errors.append(f"{rel}: missing document title")
    if "ISSUE_REGISTER_PLACEHOLDER" in body:
        errors.append(f"{rel}: unresolved issue register")
    # Inline file links only; remote URLs and heading anchors are intentionally
    # not validated. Keep documentation links in this supported form.
    for target in re.findall(r"\]\(([^\s)]+)\)", body):
        parsed = urlsplit(target)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        dest = (path.parent / unquote(parsed.path)).resolve()
        if not dest.is_relative_to(ROOT) or not dest.exists():
            errors.append(f"{rel}: broken or escaping local link: {target}")
if errors:
    print("\n".join(errors), file=sys.stderr)
    sys.exit(1)
print(f"Foundation checks passed: {len(files)} text files; local file links checked.")
