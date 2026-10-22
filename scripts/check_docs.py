"""Dependency-free structural checks; not a factual or full Markdown validator."""
from pathlib import Path
import json
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
IGNORED_DIRS = {
    ".git",
    "node_modules",
    "dist",
    ".astro",
    "playwright-report",
    "test-results",
}
REQUIRED = (
    "README.md", "AGENTS.md", "docs/vision.md", "docs/content-catalogue.md",
    "docs/content-standards.md", "docs/architecture.md", "docs/design-system.md",
    "docs/development.md", "docs/progress.md", "docs/plans/00-roadmap.md",
    "docs/decisions/README.md", "docs/decisions/0001-content-first-architecture.md",
    ".github/pull_request_template.md", ".github/ISSUE_TEMPLATE/work.md",
    ".github/ISSUE_TEMPLATE/content.md", ".github/workflows/foundation.yml",
)
errors = []
AGENT_TOOLS = {
    "planner": ["read", "search", "edit", "web", "github/*"],
    "implementer": ["read", "search", "edit", "execute", "agent", "web", "github/*", "playwright/*"],
    "reviewer": ["read", "search", "web", "github/*"],
}
for role in AGENT_TOOLS:
    if not (ROOT / ".github/agents" / f"{role}.agent.md").is_file():
        errors.append(f"Missing required agent: {role}")
for name in REQUIRED:
    if not (ROOT / name).is_file():
        errors.append(f"Missing required file: {name}")
files = sorted(
    p for p in ROOT.rglob("*")
    if p.is_file() and not IGNORED_DIRS.intersection(p.relative_to(ROOT).parts)
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
    markdown_body = body
    if path.parent == ROOT / ".github/agents":
        # Repository convention: JSON values on one line are a YAML subset.
        # Fail closed on other YAML syntax; this is not a general YAML parser.
        try:
            if not body.startswith("---\n"):
                raise ValueError("frontmatter must start at first line")
            header, markdown_body = body[4:].split("\n---\n", 1)
            fields = {}
            for line in header.splitlines():
                key, value = line.split(":", 1)
                if key in fields:
                    raise ValueError(f"duplicate field: {key}")
                fields[key] = json.loads(value.strip())
            role = path.name.removesuffix(".agent.md")
            if role not in AGENT_TOOLS or path.name != f"{role}.agent.md":
                raise ValueError("unknown profile filename")
            if set(fields) != {"name", "description", "tools", "disable-model-invocation"}:
                raise ValueError("unexpected or missing profile fields")
            if fields["name"] != f"oversweep-{role}":
                raise ValueError("name does not match role")
            if not isinstance(fields["description"], str) or not fields["description"].strip():
                raise ValueError("description must be a nonempty string")
            if fields["disable-model-invocation"] is not (role == "implementer"):
                raise ValueError("delivery is manually selected; specialists allow invocation")
            if fields["tools"] != AGENT_TOOLS.get(role):
                raise ValueError("unexpected role or tool permissions")
            markdown_body = markdown_body.lstrip("\n")
            if len(markdown_body) > 30000:
                raise ValueError("agent prompt exceeds limit")
        except (ValueError, KeyError) as exc:
            errors.append(f"{rel}: invalid agent profile: {exc}")
    if not markdown_body.startswith("# ") and path.parent.name != "ISSUE_TEMPLATE":
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
