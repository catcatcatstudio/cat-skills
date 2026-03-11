#!/usr/bin/env bash
# SessionStart hook (compact matcher): inject preserved context after auto-compaction.
# Reads .memento-handoff and prints to stdout (gets injected into Claude's context).

set -euo pipefail

INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

HANDOFF_FILE="${CWD:-.}/.memento-handoff"

if [[ ! -f "$HANDOFF_FILE" ]]; then
  # No handoff file — just nudge recovery
  echo "Context was auto-compacted. Check _notebook/ and git status to restore context."
  exit 0
fi

echo "=== Pre-compaction context (recent messages) ==="
echo ""
cat "$HANDOFF_FILE"
echo ""
echo "=== End pre-compaction context ==="
echo ""
echo "You were auto-compacted. The above are the last messages before compaction. State what you understand the current task to be before proceeding."

# Clean up — one-shot use
rm -f "$HANDOFF_FILE"
