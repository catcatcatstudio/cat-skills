---
name: memento
status: published
description: >
  Context handoff for fresh sessions. Saves unsaved session knowledge to notebook, then
  produces a short orientation block to paste into a new chat. Use when user says
  '/memento', 'hand off context', 'prepare for fresh chat', 'save and brief', or before
  clearing context. NOT for: recovering context (use /notebook recover) or saving a single
  note.
user_invocable: true
trigger: /memento
argument-hint: "[auto [on|off]]"
---

# Memento

Save what matters, then produce a handoff for the next chat.

## Commands

| Command | Action |
|---------|--------|
| `/memento` | Notebook triage + generate handoff |
| `/memento auto` | Show whether auto-compaction safety net is on or off |
| `/memento auto on` | Enable auto mode (preserves context across compaction) |
| `/memento auto off` | Disable auto mode |

### /memento auto

The auto-compaction safety net is controlled by a flag file at `~/.claude/.memento-auto`.

- **`/memento auto`** — check if `~/.claude/.memento-auto` exists. Report: `Memento auto: on` or `Memento auto: off`. One line, nothing else.
- **`/memento auto on`** — create `~/.claude/.memento-auto` (touch). Report: `Memento auto: on`. If hooks aren't configured yet, show the setup block from the Auto-Compaction section below.
- **`/memento auto off`** — remove `~/.claude/.memento-auto`. Report: `Memento auto: off`.

## What this does

Two things, in order:

1. **Persist** — scan the conversation for unsaved decisions, learnings, constraints, or failures. Save each one via /notebook save. This is the durable part — it survives regardless of whether the user pastes anything.

2. **Orient** — produce a short text block that gives a blank chat enough context to pick up where this one left off. This is the ephemeral part — it captures working state that's too in-the-moment for a notebook note.

## Execution

### Phase 1: Notebook Triage

Before generating the handoff, assess whether this session has unsaved knowledge.

**Check signals:**
- Have any /notebook save calls happened this session? How recently?
- Have decisions been made, constraints discovered, bugs hit, or approaches changed since the last save (or since session start if no saves)?
- Is there a _notebook/ at all? If not, the entire session is unsaved.

**Decision:**
- **Session is well-persisted** (recent notebook saves cover the important stuff) → skip to Phase 2. Say: `Notebook is current — skipping to handoff.`
- **Session has unsaved knowledge** → save each unsaved decision, constraint, learning, or failure via `/notebook save` (delegate fully — follow notebook's save protocol for type inference, note format, index and lessons updates). If no notebook exists yet, initialize it first.
- **Session was trivial** (no meaningful decisions or learnings, just exploration or small edits) → skip saves. Don't manufacture notes.

Report what you saved:
```
Saved 3 notes before handoff:
- 0008 decision: switched from REST to WebSocket for live updates
- 0009 constraint: Supabase RLS doesn't support cross-schema joins
- 0010 learning: canvas XOR needs globalAlpha:1 on offscreen canvas
```

### Phase 2: Generate Orientation

Read available context to ground the orientation:
- `_notebook/_index.md` (if exists)
- `PROJECT_STATE.md` (if exists)
- Recent git log (`git log --oneline -5`)
- `git diff --stat` and `git status` for uncommitted work
- Your own knowledge of what's happening in this conversation

Then produce a short orientation block. This should be:
- **Short** — 10-20 lines. The next chat has a full context window; don't waste it on briefing.
- **Present-tense** — describe what IS, not what happened.
- **Actionable** — end with what to do next.
- **Honest** — if something is uncertain or incomplete, say so.

Format:

```
---

We're working on [what] in [location].

[2-4 sentences: current state — what's built, what works, what's in progress.
Include the current approach/strategy if it's non-obvious.]

[1-2 sentences: any uncommitted work or in-flight changes the next session should know about.]

Next: [the literal next step]

For full context: read `_notebook/_index.md` and `_notebook/lessons.md`, or run `/notebook recover`.

---
```

That's it. Don't add headers, tiers, or ceremony. Just a clean block of text.

### Output

Print the orientation block directly. Then one line — dry, brief, Memento-flavored. Examples:

- `Don't trust your memory. Paste this.`
- `You won't remember any of this. Copy it.`
- `The next you starts from zero. This is what you left yourself.`

Pick one or riff on the tone. No explanation, no instructions beyond the line.

## Auto-Compaction Safety Net

Memento includes hook scripts that automatically preserve context when auto-compaction fires — no manual /memento needed.

**How it works:**
1. `PreCompact` → `scripts/pre-compact.sh` reads the transcript, extracts last 5 user messages + last assistant response, writes to `.memento-handoff`
2. Compaction runs (most context lost)
3. `SessionStart(compact)` → `scripts/post-compact.sh` reads `.memento-handoff`, injects it into the post-compaction context with a recovery directive

**Setup** — add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreCompact": [
      {
        "matcher": "auto",
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

Toggle with `/memento auto on` and `/memento auto off`. The hooks stay in settings permanently — the flag file controls whether they do anything.

Add `.memento-handoff` to your global gitignore (`~/.gitignore_global`) — it's a temp file that gets cleaned up after injection.

## Rules

1. **Notebook save is the real work.** The orientation block is a nice-to-have. Even if the user never pastes it, the notebook saves ensure nothing is lost.
2. **Don't duplicate notebook content in the orientation.** The next session can /notebook recover. The orientation just bridges the gap between "blank chat" and "recovered context" — it's the 30-second version.
3. **Don't repeat CLAUDE.md.** Project conventions load automatically. Don't waste orientation space on them.
4. **Be concrete.** File paths, function names, error messages > vague descriptions.
5. **If there's uncommitted work, say so.** The next session needs to know what's in the working tree.
