#!/usr/bin/env bash
# Adds PR previews to the live build in dist/ before the Pages deploy: the latest
# successful `PR preview` build (pr-preview.yml) of each open PR in this
# repository labelled `preview`, newest first, at most MAX_PREVIEWS of them. Each
# is served at /preview/<sha>/, and /preview/index.json lists them for the
# ?sha= and ?pr= loader (src/components/PreviewSwitch.astro). Needs GH_TOKEN
# with actions:read and pull-requests:read, and GITHUB_REPOSITORY.
set -euo pipefail
repo="$GITHUB_REPOSITORY"
max="${MAX_PREVIEWS:-4}"
out="dist/preview"
mkdir -p "$out"
index="[]"
prs=$(gh api "repos/$repo/pulls?state=open&per_page=100" --jq \
  "[.[] | select(.head.repo.full_name == \"$repo\") | select(any(.labels[]; .name == \"preview\"))
   | {pr: .number, sha: .head.sha, title: .title}] | .[]" )
count=0
while IFS= read -r entry; do
  [ -n "$entry" ] || continue
  [ "$count" -lt "$max" ] || { echo "Preview limit ($max) reached; skipping the rest."; break; }
  sha=$(jq -r .sha <<<"$entry")
  pr=$(jq -r .pr <<<"$entry")
  [[ "$sha" =~ ^[0-9a-f]{40}$ ]] || continue
  found=""
  for run in $(gh api "repos/$repo/actions/workflows/pr-preview.yml/runs?head_sha=$sha&status=success&per_page=20" --jq '.workflow_runs[].id'); do
    if gh api "repos/$repo/actions/runs/$run/artifacts" --jq '.artifacts[] | select(.name == "preview-site" and (.expired | not)) | .id' | grep -q .; then
      gh run download "$run" --repo "$repo" --name preview-site --dir "$out/$sha"
      found="$run"
      break
    fi
  done
  if [ -z "$found" ]; then
    echo "PR #$pr: no finished preview build for $sha yet."
    continue
  fi
  echo "PR #$pr: preview $sha from run $found."
  index=$(jq -c --argjson entry "$entry" '. + [$entry]' <<<"$index")
  count=$((count + 1))
done <<<"$prs"
jq . <<<"$index" > "$out/index.json"
echo "Published $count preview(s)."
