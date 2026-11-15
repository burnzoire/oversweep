#!/usr/bin/env bash
# Adds PR previews to the live build in dist/ before the Pages deploy: the
# preview-site-<head sha> artifact (pr-preview.yml) of each open PR in this
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
  found=$(gh api "repos/$repo/actions/artifacts?name=preview-site-$sha&per_page=20" \
    --jq '[.artifacts[] | select(.expired | not)] | sort_by(.created_at) | last | .workflow_run.id // empty')
  if [ -n "$found" ] && ! gh run download "$found" --repo "$repo" --name "preview-site-$sha" --dir "$out/$sha"; then
    rm -rf "${out:?}/$sha"
    found=""
  fi
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
