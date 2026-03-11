#!/usr/bin/env bash
# PreCompact hook: extract recent conversation context before compaction.
# Reads transcript_path from stdin (JSON), writes .memento-handoff to project root.
# Produces a compressed but complete picture of recent exchanges:
#   USER messages (text only, not tool_results)
#   CLAUDE messages (text + tool actions like [Edit: file.js] [Bash: npm test])

set -euo pipefail

INPUT=$(cat)
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Check if memento auto mode is enabled
MEMENTO_CONFIG="${HOME}/.claude/.memento-auto"
if [[ ! -f "$MEMENTO_CONFIG" ]]; then
  exit 0
fi

if [[ -z "$TRANSCRIPT" || ! -f "$TRANSCRIPT" ]]; then
  exit 0
fi

HANDOFF_FILE="${CWD:-.}/.memento-handoff"

# Extract last 30 user+assistant messages, then compress into readable exchanges.
# Assistant messages in the transcript are split (text in one, tool_use in another),
# so we collect all messages and reconstruct the conversation flow.
jq -rs '
  # Filter to user and assistant messages only
  [.[] | select(.type == "user" or .type == "assistant")] |

  # Take last 30 raw messages (covers ~8-10 real exchanges given tool result interleaving)
  .[-30:] |

  # Transform each message into a one-line summary
  map(
    if .type == "user" then
      if (.message.content | type) == "string" then
        # Real user message — strip XML tags for readability, truncate
        "USER: " + (.message.content | gsub("<[^>]+>"; "") | gsub("\\s+"; " ") | .[:200])
      else
        # tool_result — skip (noise)
        null
      end
    elif .type == "assistant" then
      if (.message.content | type) == "array" then
        (
          # Extract text blocks (truncated)
          [.message.content[] | select(.type == "text") | .text | gsub("\\s+"; " ") | .[:150]] |
          if length > 0 then . else [] end
        ) as $texts |
        (
          # Extract tool actions as compact summaries
          [.message.content[] | select(.type == "tool_use") |
            "[" + .name + ": " + (
              if .name == "Read" then (.input.file_path | split("/") | .[-2:] | join("/"))
              elif .name == "Edit" then (.input.file_path | split("/") | .[-2:] | join("/"))
              elif .name == "Write" then (.input.file_path | split("/") | .[-2:] | join("/"))
              elif .name == "Bash" then (.input.command | gsub("\\s+"; " ") | .[:80])
              elif .name == "Glob" then .input.pattern
              elif .name == "Grep" then .input.pattern
              elif .name == "Agent" then (.input.description // "agent")
              elif .name == "Skill" then (.input.skill // "skill")
              else (.input | keys | join(","))
              end
            ) + "]"
          ]
        ) as $tools |
        # Combine: text first, then tools
        if ($texts | length) > 0 or ($tools | length) > 0 then
          "CLAUDE: " + ([$texts[], $tools[]] | join(" "))
        else
          null
        end
      else
        null
      end
    else
      null
    end
  ) |

  # Remove nulls (tool_results, empty messages)
  map(select(. != null)) |

  # Deduplicate consecutive CLAUDE lines that are just tool chains
  # (keep all — they show the sequence of actions)
  join("\n")
' "$TRANSCRIPT" > "$HANDOFF_FILE.tmp"

# Only write if we got something
if [[ -s "$HANDOFF_FILE.tmp" ]]; then
  mv "$HANDOFF_FILE.tmp" "$HANDOFF_FILE"
else
  rm -f "$HANDOFF_FILE.tmp"
fi
