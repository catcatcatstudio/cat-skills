# Notebook — AI Project Notes System

You are an AI coding assistant with a project notes system. This system prevents context loss and reasoning loops by maintaining a trail of decisions, failures, and lessons learned.

**Add these instructions to your AI tool's system prompt, rules file, or custom instructions.**

---

## Overview

You maintain a `notebook/` directory at the project root with three key files:

```
notebook/
├── _index.md      # Rich index of all notes — primary context recovery doc
├── lessons.md     # Distilled failures and gotchas — the anti-loop cheat sheet
└── NNNN-type-*.md # Individual notes (append-only)
```

---

## Starting a New Project

When beginning work on a project, check if `notebook/` exists at the project root.

**If it doesn't exist**, create it:

```markdown
<!-- notebook/_index.md -->
# Notes Index

Project trail — read this first on context recovery.
```

```markdown
<!-- notebook/lessons.md -->
# Lessons

What not to do. Read this every session.
```

**After creating the notebook**, scan the current conversation for any decisions, failures, constraints, or learnings that have already occurred. Save each one as a note immediately. If the notebook is being initialized mid-session, there is almost certainly unsaved context. Do not wait to be asked.

**If it already exists**, read `_index.md` and `lessons.md` before doing anything else. This is how you recover context from previous sessions.

---

## Saving Notes

When something noteworthy happens during a session — a decision, a failure, a discovery, a constraint — save a note. Do this proactively, not just when asked.

### When to save

- A constraint or limitation is discovered
- Something was tried and failed (these are the most valuable notes)
- An architectural or technology decision is made
- A non-obvious workaround is used
- Direction changes from a previous approach
- After extended work (~20+ interactions without saving)

### How to save

**1. Determine the next note number.** Read `_index.md`, find the highest number, increment by 1. Start at `0001` if no notes exist.

**2. Classify the note type:**

| Type | When |
|------|------|
| `decision` | Chose between options, committed to an approach |
| `learning` | Non-obvious gotcha or unexpected behavior |
| `constraint` | Hard limitation (library, API, platform) |
| `pivot` | Changing direction from a previous approach |
| `investigation` | Research findings, benchmarks, comparisons |
| `failure` | Tried something, it didn't work — and why |
| `resolved` | A previous lesson/constraint no longer applies |

Default to `learning` if unclear.

**3. Write the note file** at `notebook/NNNN-type-short-title.md`:

```markdown
# NNNN: Short Descriptive Title

**Type:** type | **Date:** YYYY-MM-DD

Content. 1-5 lines. Be specific — include library names, error messages,
version numbers. What happened and what it means going forward.
```

For major architectural decisions with meaningful alternatives considered, use a fuller format:

```markdown
# NNNN: Short Descriptive Title

**Type:** decision | **Date:** YYYY-MM-DD
**Status:** accepted

## Context
What prompted this? (1-3 sentences)

## Decision
What was decided. Be specific.

## Rationale
Why this over alternatives.

## Alternatives Considered
- **Alternative A:** Rejected because X

## Consequences
What this means going forward.
```

**4. Update `_index.md`** — append a rich one-line summary:

```
- NNNN type: Detailed one-liner with enough context to be useful standalone
```

For critical notes that every future session must read, add the flag:

```
- NNNN ⚑ constraint: Critical thing every session must know
```

**5. Update `lessons.md`** — if the note type is `failure`, `learning`, or `constraint`, append a distilled one-liner:

```
- What not to do and why, or what to do instead.
```

Lessons are pure signal. One line. No metadata. A reader should be able to scan the entire file in seconds.

---

## Resolving Lessons

When a previous lesson no longer applies (library upgrade, workaround found, etc.), save a note with type `resolved` and strike the matching lesson in `lessons.md`:

```
- ~~Old lesson text~~ → Resolved in NNNN
```

Strikethrough preserves history while making it clear the lesson is no longer active.

---

## Context Recovery

When starting a new session on an existing project, read files in this order:

1. **`notebook/_index.md`** — understand what the project is and what happened
2. **`notebook/lessons.md`** — understand what not to do
3. **Any ⚑-flagged notes** — read the full notes for critical items
4. **The last 3 notes** — get recent context
5. **`PROJECT_STATE.md`** (if it exists) — understand current state

Then summarize your understanding and ask the user what has changed.

---

## Rules

1. **Save proactively.** Don't wait to be asked. Save when something noteworthy happens.
2. **Quick format by default.** The full decision format is rare.
3. **Rich index entries.** The index alone should be enough for context recovery.
4. **Be specific.** Library names, error messages, version numbers — not vague descriptions.
5. **Failures are gold.** "Tried X, failed because Y" prevents reasoning loops.
6. **One note per save.** Don't batch multiple insights into one note.
7. **Flag sparingly.** Use ⚑ only for things every future session must read.
8. **Notes are append-only.** New moment = new note. Never delete, only mark superseded.
9. **Lessons are distilled.** One line, pure signal. Open the note for full context.

---

## Platform-Specific Setup

Copy the contents of this file into the path for your tool:

| Tool | File |
|------|------|
| Cursor | `.cursor/rules/notebook.mdc` |
| Windsurf | `.windsurf/rules/notebook.md` |
| Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` (project root) |
| Codex / OpenCode | `AGENTS.md` |
| Aider | `CONVENTIONS.md` (load with `aider --read CONVENTIONS.md`) |
| Cline | `.clinerules/notebook.md` |
| Roo Code | `.roo/rules/notebook.md` |
| Amazon Q | `.amazonq/rules/notebook.md` |

**Any other tool** — include in the system prompt or paste at the start of a conversation
