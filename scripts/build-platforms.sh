#!/usr/bin/env bash
# Build platform-specific skill distributions from source skills.
# Each platform gets the same content: skills/<name>/SKILL.md + references/
#
# Usage: ./scripts/build-platforms.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE="$REPO_ROOT/skills"

# Platforms and their directory names
PLATFORMS=(.claude .cursor .codex .gemini .opencode .pi .trae .trae-cn .kiro .agents)

# Only copy published skills (status: published in SKILL.md frontmatter)
get_published_skills() {
  for skill_dir in "$SOURCE"/*/; do
    [ -f "$skill_dir/SKILL.md" ] || continue
    local name
    name="$(basename "$skill_dir")"
    # Skip internal dirs
    [[ "$name" == _* ]] && continue
    # Check status
    if grep -q "^status: published" "$skill_dir/SKILL.md"; then
      echo "$name"
    fi
  done
}

# Clean existing platform dirs
for platform in "${PLATFORMS[@]}"; do
  rm -rf "$REPO_ROOT/$platform"
done

# Build
published=$(get_published_skills)
count=0

for platform in "${PLATFORMS[@]}"; do
  for skill in $published; do
    dest="$REPO_ROOT/$platform/skills/$skill"
    mkdir -p "$dest"

    # Copy SKILL.md
    cp "$SOURCE/$skill/SKILL.md" "$dest/"

    # Copy references/ if it exists
    if [ -d "$SOURCE/$skill/references" ]; then
      cp -r "$SOURCE/$skill/references" "$dest/"
    fi
  done
  count=$(echo "$published" | wc -l | tr -d ' ')
done

echo "Built $count skills for ${#PLATFORMS[@]} platforms:"
printf '  %s\n' "${PLATFORMS[@]}"
