---
name: notebook
status: published
description: >
  Project notes system for preventing AI context loss and reasoning loops.
  Initialize notes, save notes mid-flow, recover context, migrate messy notes,
  and resolve lessons. Subcommands: /notebook, /notebook save, /notebook recover,
  /notebook migrate.
argument-hint: "[save [content] | recover | migrate [path] | save resolved: description]"
---

# Notebook

Project trail system. Initialize, save, recover, migrate, and manage project notes.

## Why this exists

You are stateless. Every conversation ends and your context dies. The next agent that opens this project starts from zero — re-reads code, re-discovers constraints, re-makes mistakes you already made. The human becomes a context shuttle between amnesiac agents.

Notebook makes the *project* remember so you don't have to. When you save a note, you're not journaling — you're leaving a breadcrumb for a future version of yourself that has no idea what happened here. Every failure you record is a loop you prevent. Every constraint you document is a dead end the next session skips. Every decision you capture is an argument that never gets re-litigated.

The index and lessons files are designed to be fast to scan — a future agent can recover full project context in seconds instead of minutes of re-exploration. This is the difference between an agent that compounds knowledge across sessions and one that starts over every time.

**Save aggressively.** The cost of a note you didn't need is near zero. The cost of a note you didn't write is another wasted session.

## When NOT to use this skill

- No active project context (no git repo, no project root) — say so, don't create a floating notebook
- User wants to summarize or extract knowledge from content — use `/extract` instead
- Notes already exist and user just wants to read them — read directly with Read tool, skip the skill

---

## Quick Reference

> **Proactive save rule:** Save after every significant decision, failure, or constraint discovered — without being asked. Every ~20 tool calls without a save is too long. If you would say "I should remember this," write it now.

| Command | Action |
|---------|--------|
| `/notebook` | Init (new project) or status (existing) |
| `/notebook save` | Write a note immediately — never prompts, just writes |
| `/notebook save resolved: <desc>` | Save a note and resolve the matching lesson |
| `/notebook recover` | Read index + lessons + flagged notes, summarize state |
| `/notebook migrate [path]` | Convert messy notes into notebook format |

---

## /notebook — Init & Status

### If _notebook/ doesn't exist (new project):

1. Locate project root — walk up from cwd looking for: `PROJECT_STATE.md`, `CLAUDE.md`, `.git/`, `package.json` / `Cargo.toml` / `pyproject.toml` / `go.mod`
2. If no project root found: tell the user "No project root detected — create a project first."
3. Create:
   ```
   _notebook/
   ├── README.md
   ├── _index.md
   └── lessons.md
   ```
4. Initialize `README.md`:
   ```markdown
   # Project Notebook

   This directory contains project memory for AI agents.
   Read `_index.md` first for full project context, then `lessons.md` for known pitfalls.
   ```
5. Initialize `_index.md`:
   ```markdown
   # Notes Index

   Project trail — read this first on context recovery.
   ```
6. Initialize `lessons.md`:
   ```markdown
   # Lessons

   What not to do. Read this every session.
   ```
7. Add `_notebook/` to `.gitignore` (process notes are AI working memory, not public docs)
8. Confirm:
   ```
   Notebook initialized at {project_root}/_notebook/
   _notebook/ added to .gitignore — remove to track in git.
   ```
9. **Retroactive save** — scan the current conversation for any decisions, failures, constraints, or learnings that have already occurred. Save each one as a note immediately. If the notebook is being initialized mid-session, there is almost certainly unsaved context. Do not wait to be asked.

### If _notebook/ already exists (status):

1. Read `_index.md`
2. Read `lessons.md`
3. Report: number of notes, number of lessons, last note date, count of ⚑-flagged notes
4. Show the last 5 index entries

---

## /notebook save — Write a Note

**Never prompt. Never ask questions. Just write.**

### Step 1: Locate Project Root

Walk up from cwd: `PROJECT_STATE.md` → `CLAUDE.md` → `.git/` → `package.json` / `Cargo.toml` / `pyproject.toml` / `go.mod`

No root found → "No project root detected. Run `/notebook` from within a project first."

### Step 2: Ensure Infrastructure

If `_notebook/` doesn't exist, create it with `README.md`, `_index.md`, and `lessons.md` silently.

Initialize `README.md`:
```markdown
# Project Notebook

This directory contains project memory for AI agents.
Read `_index.md` first for full project context, then `lessons.md` for known pitfalls.
```

Initialize `_index.md`:
```markdown
# Notes Index

Project trail — read this first on context recovery.
```

Initialize `lessons.md`:
```markdown
# Lessons

What not to do. Read this every session.
```

Add `_notebook/` to `.gitignore` if not already present.

### Step 3: Next Note Number

Read `_index.md`, find highest note number, increment. Start at `0001` if empty.

### Step 4: Infer Content

Priority order:
1. **Explicit argument** — `/notebook save constraint: RLS can't do cross-schema joins`
2. **Conversation context** — if bare `/notebook save`, synthesize from recent exchanges
3. **Both** — user hint + contextual expansion

### Step 5: Classify Type

Infer from content. Never ask.

| Type | Signal |
|------|--------|
| `decision` | Chose between options, committed to approach |
| `learning` | Non-obvious gotcha, unexpected behavior |
| `constraint` | Hard limitation (library, API, platform) |
| `pivot` | Changing direction from previous approach |
| `investigation` | Research findings, benchmarks, comparisons |
| `failure` | Tried something, didn't work — and why |
| `resolved` | A previous lesson/constraint no longer applies |

Default: `learning`.

### Step 6: Write the Note

File: `_notebook/NNNN-type-short-title.md`

**Quick format (default):**

```markdown
# NNNN: Short Descriptive Title

**Type:** type | **Date:** YYYY-MM-DD

Content. 1-5 lines. Be specific — library names, error messages, version numbers.
What happened, what it means going forward.
```

**Full format (major architectural decisions only):**

```markdown
# NNNN: Short Descriptive Title

**Type:** decision | **Date:** YYYY-MM-DD
**Status:** accepted

## Context
What prompted this? (1-3 sentences)

## Decision
What we decided. Be specific.

## Rationale
Why this over alternatives.

## Alternatives Considered
- **Alternative A:** Rejected because X

## Consequences
What this means going forward.
```

Threshold: meaningful alternatives considered AND hard to reverse → full format. Everything else → quick.

### Step 7: Update Index

Append a **rich one-line summary** to `_index.md`:

```
- NNNN type: Detailed one-liner useful standalone
```

⚑ flag for critical constraints, breaking discoveries, architectural decisions:
```
- NNNN ⚑ constraint: Critical thing every session must know
```

### Step 8: Update Lessons (conditional)

**For types `failure`, `learning`, `constraint`:** append a distilled one-liner to `lessons.md`.

Format — pure signal, no metadata:
```
- Concise lesson. What not to do and why, or what to do instead.
```

The full note has context and details. The lesson is the takeaway — one line a model can scan in a second.

**For type `resolved`:** write the note as usual, then find the matching lesson in `lessons.md` and strike it:

```
- ~~Prisma doesn't work with edge runtime~~ → Resolved in 0047
```

How to match: use the content of the `/notebook save resolved:` argument to find the most relevant lesson line. Match on key terms (library names, error descriptions, the constraint being resolved). If no clear match is found, write the note but warn: `Note saved but no matching lesson found to resolve.`

Strikethrough preserves history — a model sees what *used to be* a problem and knows to skip it. The note reference lets anyone find the resolution details.

### Step 9: Update PROJECT_STATE.md (conditional)

Only if the note materially changes project state (blocking constraint, architecture change, pivot). If no `PROJECT_STATE.md` exists, skip.

### Output

Single line confirmation:
```
Saved: _notebook/NNNN-type-short-title.md
```

Nothing else.

---

## /notebook recover

1. Read full `_index.md`
2. Read full `lessons.md`
3. Open all ⚑-flagged notes
4. Open the last 3 notes
5. Read `PROJECT_STATE.md` if it exists
6. Summarize: what the project is, key decisions, active constraints, known pitfalls, current state
7. Ask: "What's changed since this was last updated?"

---

## /notebook migrate

Convert existing messy notes into notebook format. One-time onboarding for projects with pre-existing notes.

1. Scan the target folder (cwd or specified path) for markdown and text files
2. Read each file
3. Classify each: decision, learning, constraint, failure, investigation, or pivot
4. Write each as a properly numbered notebook note in `_notebook/`
5. Build `_index.md` from scratch with rich one-line summaries
6. Extract lessons from anything that looks like a failure, constraint, or learning → populate `lessons.md`
7. Leave originals untouched. User deletes them when satisfied.

If `_notebook/` already has notes, continue numbering from the highest existing. Migrate never overwrites existing notes.

After migration, report: how many files found, how many converted, how many lessons extracted. Show the generated index.

---

## Resolving Lessons

To mark a lesson as resolved use: `/notebook save resolved: <exact phrase or lesson number>`

**Matching rules:**
- Prefer exact phrase match from lessons.md
- If ambiguous or no match found, list the open lessons and ask the user to confirm which one
- Never silently skip — always confirm what was resolved

Mark resolved lessons with strikethrough in `lessons.md`:
```markdown
~~Lesson text here~~ *(resolved: [date or brief reason])*
```

**Archiving:** When `lessons.md` exceeds 50 resolved (struck-through) entries, move all resolved lessons to `lessons-archive-YYYY-MM.md` and remove them from the active file. Keep only open lessons in the active file.

---

## Stale Lesson Detection

When reading `lessons.md` during context recovery, check if any lessons are outdated — library upgrades, removed constraints, resolved workarounds. Flag to the user: "Lesson [X] may be stale — [reason]. Want me to resolve it?"

---

## Context Recovery Priority

On any new session or `/notebook recover`, read in this order:

1. `_notebook/_index.md` — what is this project, what happened
2. `_notebook/lessons.md` — what not to do
3. ⚑-flagged notes — critical details the index can't capture
4. Last 3 notes — recent context
5. `PROJECT_STATE.md` — current snapshot (if exists)

---

## Rules

1. **Never prompt on /notebook save.** Infer everything from context and arguments.
2. **Quick format by default.** Full format is rare — major architectural decisions only.
3. **Rich index entries.** The index alone should be sufficient for context recovery.
4. **Be specific.** Library names, error messages, versions > vague descriptions.
5. **Failures are gold.** "Tried X, failed because Y" prevents loops. Always save these.
6. **One note per save.** Don't batch multiple insights.
7. **⚑ sparingly.** Only for things every future session must read.
8. **Notes are append-only.** New moment = new note. Update existing only to mark superseded.
9. **Lessons are distilled.** One line, pure signal. If you need context, open the note.
10. **Check your notes when stuck.** When you hit a failure, unexpected behavior, or a "didn't we try this before?" moment — read `_notebook/lessons.md` before debugging from scratch. This is the reflex that prevents loops.
