#!/usr/bin/env bash
# PreCompact hook: extract recent messages from transcript before compaction.
# Reads transcript_path from stdin (JSON), writes .memento-handoff to project root.

set -euo pipefail

INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
TRIGGER=$(echo "$INPUT" | jq -r '.trigger // empty')

# Check if memento auto mode is enabled
MEMENTO_CONFIG="${HOME}/.claude/.memento-auto"
if [[ ! -f "$MEMENTO_CONFIG" ]]; then
  exit 0
fi

if [[ -z "$TRANSCRIPT" || ! -f "$TRANSCRIPT" ]]; then
  exit 0
fi

HANDOFF_FILE="${CWD:-.}/.memento-handoff"

# Extract last 5 user prompts (not tool results) and last assistant text response
jq -s '
  # Get user messages with plain text content (not tool_result arrays)
  [.[] | select(.type == "user" and (.message.content | type == "string"))] |
  .[-5:] |
  map("USER: " + .message.content) |
  join("\n\n")
' "$TRANSCRIPT" > "$HANDOFF_FILE.tmp"

# Append last assistant text blocks
jq -s '
  [.[] | select(.type == "assistant")] |
  last |
  .message.content // [] |
  map(select(.type == "text")) |
  map(.text) |
  join("\n")
' "$TRANSCRIPT" >> "$HANDOFF_FILE.tmp"

# Only write if we got something
if [[ -s "$HANDOFF_FILE.tmp" ]]; then
  mv "$HANDOFF_FILE.tmp" "$HANDOFF_FILE"
else
  rm -f "$HANDOFF_FILE.tmp"
fi
