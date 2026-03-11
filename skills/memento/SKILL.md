---
name: memento
status: published
description: >
  Context handoff for fresh sessions. Saves unsaved session knowledge to notebook,
  then produces a short orientation block to paste into a new chat. Use when:
  user says "/memento", "hand off context", "prepare for fresh chat", "save and brief",
  or before clearing context. NOT for: recovering context (use /notebook recover),
  saving a single note (use /notebook save), or replacing notebook.
user_invocable: true
trigger: /memento
---

# Memento

Save what matters, then produce a handoff for the next chat.

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

## Rules

1. **Notebook save is the real work.** The orientation block is a nice-to-have. Even if the user never pastes it, the notebook saves ensure nothing is lost.
2. **Don't duplicate notebook content in the orientation.** The next session can /notebook recover. The orientation just bridges the gap between "blank chat" and "recovered context" — it's the 30-second version.
3. **Don't repeat CLAUDE.md.** Project conventions load automatically. Don't waste orientation space on them.
4. **Be concrete.** File paths, function names, error messages > vague descriptions.
5. **If there's uncommitted work, say so.** The next session needs to know what's in the working tree.
