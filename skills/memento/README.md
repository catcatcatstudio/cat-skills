# Memento

Context handoff for Claude Code sessions. Because the next you starts from zero.

---

## The Problem

You're 45 minutes into a deep session. Claude knows your architecture, your constraints, what you tried and why it failed. Then the context window fills up, auto-compaction fires, and all of that is gone. The post-compaction Claude is a stranger who has to re-learn everything from scratch — or worse, asks you to repeat yourself.

Memento fixes this at two levels:

1. **Manual handoff** (`/memento`) — saves unsaved knowledge to notebook, then generates a compact orientation block you paste into a fresh chat
2. **Auto-compaction safety net** — hooks into Claude Code's lifecycle to automatically preserve and re-inject conversation context when compaction fires

## Install

```bash
npx skills add catcatcatstudio/cat-skills --skill memento
```

Or as a Claude Code plugin:

```
/plugin install memento@catcatcat
```

## Usage

### Manual Handoff

```
/memento
```

That's it. Memento scans the current conversation for unsaved decisions, learnings, and constraints. Saves each one to your project notebook. Then generates a 10-20 line orientation block — a baton pass, not a recap: the intent behind uncommitted work, dead ends not to retry, decisions waiting on you, and the next step. What happened lives in the notebook; the block carries only what changes what the next session does.

Copy the block. Start a new chat. Paste it. You're back.

### Auto Mode

```
/memento auto on     # enable
/memento auto off    # disable
/memento auto        # check status
```

Auto mode is the real magic. When enabled, two hooks fire during auto-compaction:

1. **Before compaction** — a `PreCompact` hook reads the conversation transcript from disk (the JSONL file Claude Code writes regardless of context state), extracts the last ~10 exchanges with full tool action context, and writes a compressed trace to `.memento-handoff`
2. **After compaction** — a `SessionStart` hook reads that trace, injects it into the post-compaction context, and tells the new Claude exactly what was happening

The post-compaction Claude sees something like:

```
=== MEMENTO: Pre-compaction conversation trace ===
USER: can you fix the auth middleware to handle expired tokens
CLAUDE: Looking at the middleware. [Read: middleware/auth.js] [Grep: token.*expir]
CLAUDE: Found the issue — the refresh logic never fires because... [Edit: middleware/auth.js]
USER: yes, and also add a test for that case
CLAUDE: [Write: tests/auth.test.js] [Bash: npm test]
=== End conversation trace ===
```

It states what it understands the task to be, what it was doing, and continues. No "what were we working on?" No repeating yourself.

### Hook Setup

Auto mode requires two hooks in `~/.claude/settings.json`. The paths should point to wherever your memento skill is installed:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/skills/memento/scripts/pre-compact.sh"
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/skills/memento/scripts/post-compact.sh"
          }
        ]
      }
    ]
  }
}
```

Add `.memento-handoff` to your global gitignore — it's a transient file that gets cleaned up after injection, but just in case:

```bash
echo '.memento-handoff' >> ~/.gitignore_global
```

## How It Actually Works

The key insight: Claude Code's hooks are OS-level shell processes, not in-context. They read and write files on disk. Compaction can't touch them.

Claude Code also writes the full conversation transcript to a `.jsonl` file on disk — every message, every tool call, every response — independent of the context window. This file exists whether you know about it or not.

So when compaction fires:

```
PreCompact hook (shell process)
  → reads transcript.jsonl from disk
  → jq extracts last 30 messages
  → compresses to USER/CLAUDE one-liners with [ToolName: target] annotations
  → writes .memento-handoff

[compaction happens — context window wiped]

SessionStart(compact) hook (shell process)
  → reads .memento-handoff
  → prints to stdout (injected into post-compaction context)
  → deletes .memento-handoff
```

The flag file `~/.claude/.memento-auto` controls whether the PreCompact hook does anything. The hooks themselves stay permanently in settings — the flag is the toggle.

## Pairs Well With

- **[notebook](../notebook/)** — memento saves to notebook format natively. If you've been using `/notebook save` throughout the session, memento's triage phase recognizes that and skips redundant saves.
- **[liquid-cat-physics](../liquid-cat-physics/)** — LCP enables memento auto by default during its pre-flight. An autonomous loop that can survive compaction and keep working. Together they're a perpetual agent.

## License

MIT
