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

cat << 'HEADER'
=== MEMENTO: Pre-compaction conversation trace ===
The following is a compressed log of the conversation immediately before auto-compaction.
USER lines = what the user said. CLAUDE lines = what you said or did.
[ToolName: target] = tool calls you made. Use these to understand what you were working on.

HEADER
cat "$HANDOFF_FILE"
cat << 'FOOTER'

=== End conversation trace ===

IMPORTANT: You were just auto-compacted. The above trace shows what was happening.
1. State what you understand the current task to be (one sentence).
2. State what you were in the middle of doing (one sentence).
3. Then continue the work — do not ask the user to repeat themselves.
If _notebook/_index.md exists, read it silently for additional context.
FOOTER

# Clean up — one-shot use
rm -f "$HANDOFF_FILE"
