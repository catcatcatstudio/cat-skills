#!/bin/sh
# Install git hooks for cat-skills symlink automation
# Run once per machine: ./scripts/install-hooks.sh

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOKS_DIR="$REPO_DIR/.git/hooks"

cat > "$HOOKS_DIR/post-merge" << 'HOOK'
#!/bin/sh
# Auto-sync cat-skills symlinks after pull/checkout
# Links skills with status: published or status: dev
# Removes stale symlinks for deleted/demoted skills

SKILLS_DIR="$(git rev-parse --show-toplevel)/skills"
TARGET_DIR="$HOME/.claude/skills"

get_status() {
  skill_md="$1/SKILL.md"
  [ -f "$skill_md" ] || return 1
  sed -n '/^---$/,/^---$/p' "$skill_md" | grep -m1 '^status:' | sed 's/^status:[[:space:]]*//'
}

# Create missing symlinks for published or dev skills
for skill in "$SKILLS_DIR"/*/; do
  name=$(basename "$skill")
  status=$(get_status "$skill")
  if [ "$status" = "published" ] || [ "$status" = "dev" ]; then
    if [ ! -e "$TARGET_DIR/$name" ]; then
      ln -s "$skill" "$TARGET_DIR/$name"
      echo "cat-skills: symlinked $name ($status)"
    fi
  fi
done

# Remove stale symlinks pointing into cat-skills
for link in "$TARGET_DIR"/*; do
  [ -L "$link" ] || continue
  target=$(readlink "$link" 2>/dev/null)
  if echo "$target" | grep -q "cat-skills/skills/"; then
    name=$(basename "$link")
    status=$(get_status "$SKILLS_DIR/$name")
    if [ "$status" != "published" ] && [ "$status" != "dev" ]; then
      rm "$link"
      echo "cat-skills: removed stale symlink $name"
    fi
  fi
done
HOOK

chmod +x "$HOOKS_DIR/post-merge"
ln -sf post-merge "$HOOKS_DIR/post-checkout"

echo "Hooks installed. Running initial sync..."
cd "$REPO_DIR" && .git/hooks/post-merge
