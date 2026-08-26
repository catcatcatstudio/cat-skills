---
name: notebook
status: published
description: >
  Project notes system to prevent AI context loss and reasoning loops. Init notes, save
  mid-flow, recover context, migrate messy notes, resolve lessons. Subcommands: /notebook,
  /notebook save, /notebook recover, /notebook migrate.
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
- User wants to summarize or extract knowledge from content — use `/eat` instead
- Notes already exist and user just wants to read them — read directly with Read tool, skip the skill

---

## Quick Reference

> **Proactive save rule:** Save after every significant decision, failure, or constraint discovered — without being asked. Every ~20 tool calls without a save is too long. If you would say "I should remember this," write it now.

| Command | Action |
|---------|--------|
| `/notebook` | Init (new project) or status (existing) |
| `/notebook save` | Sweep the WHOLE conversation and write every unsaved insight, each as its own note — never prompts, just writes |
| `/notebook save resolved: <desc>` | Save a note and resolve the matching lesson |
| `/notebook recover` | Read index + lessons + flagged notes, summarize state |
| `/notebook migrate [path]` | Convert messy notes into notebook format |

---

## Scope: which notebook?

Projects nest. A parent repo can contain sub-projects; a monorepo contains packages; a studio contains builds. Each can have its own `_notebook/`. Before saving, decide where the note belongs.

**Rule: save the note in the smallest notebook whose scope contains the insight.**

- Note about the sub-project only (its bug, its API, its decision) → sub-project's `_notebook/`
- Note about shared infra, parent architecture, cross-cutting constraints, or anything that affects siblings → parent's `_notebook/`
- When unsure, prefer the narrower scope — notes are easier to promote up later than to demote down

**How to locate candidates:** walking up from cwd, collect every directory with a project marker (`PROJECT_STATE.md`, `CLAUDE.md`, `.git/`, `package.json` / `Cargo.toml` / `pyproject.toml` / `go.mod`). The nearest is the default. If higher candidates exist and the note's scope clearly belongs to one of them, save there instead.

If the chosen parent notebook doesn't exist yet, initialize it first (see [Initializing _notebook/](#initializing-_notebook)) before writing.

---

## Author Identity

Notebooks are shared. Every note records who wrote it, so a future session can tell whose context it's reading and who to ask.

**Resolving the handle** — first match wins, resolve once per session and reuse:

1. `git config user.email` → take the local-part (before `@`) → `jon@studio.dev` becomes `jon`
2. No email configured → `git config user.name` → first whitespace-separated token
3. Neither available → `unknown`

**Run these from the project root you chose in Step 1, not from cwd.** Git identity is frequently path-scoped — an `includeIf "gitdir:..."` rule in `~/.gitconfig` assigns different identities to different directory trees, and many people set no global identity at all so that a misconfigured repo fails loudly instead of committing under the wrong name. A `git config` call made outside the repo silently misses those rules and returns the wrong handle or nothing.

Slugify the result: lowercase, non-alphanumeric characters to `-`. Write it as `@handle` in prose and index lines, bare `handle` in filenames.

Never fall back to `$USER`, `whoami`, or the hostname. Those are machine identity, not project identity, and they leak local usernames into notes that may be committed.

**Never prompt for identity.** If resolution lands on `unknown`, write the note anyway and stamp it `@unknown` — a note that exists beats a note that blocked on a question.

**Always stamp, including solo projects.** An unstamped line is ambiguous forever — it could mean "solo" or "identity unresolved" — and the moment a solo project gains a second person, its whole history becomes unattributable. Stamping costs a few characters.

Notes written before this convention stay as they are. Notes are append-only; don't rename or backfill existing files.

---

## Initializing _notebook/

Shared procedure used by both `/notebook` init and `/notebook save` (when no notebook exists at the chosen scope).

1. Create the directory and three files:
   ```
   _notebook/
   ├── README.md
   ├── _index.md
   └── lessons.md
   ```
2. `README.md`:
   ```markdown
   # Project Notebook

   This directory contains project memory for AI agents.
   Read `_index.md` first for full project context, then `lessons.md` for known pitfalls.
   ```
3. `_index.md`:
   ```markdown
   # Notes Index

   Project trail — read this first on context recovery.

   Format: `- NNNN @author type: summary` — ⚑ marks notes every session must read.
   ```
4. `lessons.md`:
   ```markdown
   # Lessons

   What not to do. Read this every session.
   ```
5. **Gitignore based on repo visibility:** run `gh repo view --json visibility -q '.visibility'` from the project root.
   - `PUBLIC` → add `_notebook/` to `.gitignore`
   - `PRIVATE` or `INTERNAL` → do not gitignore (notes are safe to track)
   - Command fails (no remote, no `gh`, not a GitHub repo) → gitignore (safe default — assume public until proven private)

---

## /notebook — Init & Status

### If _notebook/ doesn't exist (new project):

1. Locate project root (see [Scope](#scope-which-notebook) for nested-project handling). If no project root found, tell the user "No project root detected — create a project first."
2. Run [Initializing _notebook/](#initializing-_notebook) at the chosen root.
3. Confirm:
   - If gitignored: `Notebook initialized at {project_root}/_notebook/ — gitignored (public repo).`
   - If tracked: `Notebook initialized at {project_root}/_notebook/ — tracked in git (private repo).`
4. **Retroactive save** — scan the current conversation for any decisions, failures, constraints, or learnings that have already occurred. Save each one as a note immediately. If the notebook is being initialized mid-session, there is almost certainly unsaved context. Do not wait to be asked.

### If _notebook/ already exists (status):

1. Read `_index.md`
2. Read `lessons.md`
3. Report: number of notes, number of lessons, last note date, count of ⚑-flagged notes, and — when the index holds more than one handle — the note count per author
4. Show the last 5 index entries
5. **Visibility check:** if `_notebook/` is gitignored but repo is private (or vice versa), mention it once — e.g. `_notebook/ is gitignored but this is a private repo — you can remove it from .gitignore to track notes in git.` Don't modify `.gitignore` automatically for existing projects.

---

## /notebook save — Write a Note

**Never prompt. Never ask questions. Just write.**

### Step 1: Locate Project Root & Choose Scope

Find candidate project roots walking up from cwd (see [Scope](#scope-which-notebook)). Pick the notebook scope that matches the note: nearest root by default, parent only if the note's scope clearly belongs higher.

No root found → "No project root detected. Run `/notebook` from within a project first."

### Step 2: Ensure Infrastructure

If `_notebook/` doesn't exist at the chosen scope, run [Initializing _notebook/](#initializing-_notebook) silently.

### Step 3: Next Note Number

Read `_index.md`, find highest note number, increment. Start at `0001` if empty.

**Duplicate numbers are legal and expected.** Two people working on separate branches will both take the next number — the author handle in the filename keeps the files distinct, so both survive a merge and neither `_index.md` line collides. The number means "roughly when," the handle means "who."

Never renumber to remove a duplicate. Numbers are referenced by other notes and by resolved lessons; renumbering silently breaks those links. When numbers repeat, cite them as `0047-jon` to disambiguate.

### Step 4: Infer Content — ALWAYS a full-conversation sweep

**A save is never just one note.** Every `/notebook save` scans the ENTIRE conversation so
far for every decision, failure, constraint, pivot, and learning not yet in the notebook,
and writes EACH ONE as its own note. Check `_index.md` for what is already recorded; save
everything relevant that isn't.

Priority order for the sweep's focus:
1. **Explicit argument** — `/notebook save constraint: RLS can't do cross-schema joins`
   writes that note FIRST, then still sweeps the rest of the chat for unsaved insights
2. **Bare `/notebook save`** — pure sweep: the whole chat, every unsaved insight
3. Never skip an insight because it feels minor — accidents, wrong turns, and corrections
   are exactly what future sessions need

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

File: `_notebook/NNNN-handle-type-short-title.md`

The author handle sits between the number and the type (see [Author Identity](#author-identity)) — `0047-jon-constraint-rls-cross-schema.md`.

**Quick format (default):**

```markdown
# NNNN: Short Descriptive Title

**Type:** type | **Date:** YYYY-MM-DD | **By:** @handle

Content. 1-5 lines. Be specific — library names, error messages, version numbers.
What happened, what it means going forward.
```

**Full format (major architectural decisions only):**

```markdown
# NNNN: Short Descriptive Title

**Type:** decision | **Date:** YYYY-MM-DD | **By:** @handle
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
- NNNN @handle type: Detailed one-liner useful standalone
```

⚑ flag for critical constraints, breaking discoveries, architectural decisions:
```
- NNNN @handle ⚑ constraint: Critical thing every session must know
```

The handle holds a fixed position — always after the number, always before the ⚑ and type. Attribution is scanned as a column, so it must not drift to a ragged offset. Keeping it fixed also makes `grep '@ocean' _index.md` return exactly that person's trail.

### Step 8: Update Lessons (conditional)

**For types `failure`, `learning`, `constraint`:** append a distilled one-liner to `lessons.md`.

Format — pure signal, no metadata:
```
- Concise lesson. What not to do and why, or what to do instead.
```

The full note has context and details. The lesson is the takeaway — one line a model can scan in a second.

**For type `resolved`:** write the note as usual, then strike the matching lesson. See [Resolving Lessons](#resolving-lessons) for matching rules and format.

### Step 9: Update PROJECT_STATE.md (conditional)

Only if the note materially changes project state (blocking constraint, architecture change, pivot). If no `PROJECT_STATE.md` exists, skip.

### Output

One confirmation line per note saved:
```
Saved: _notebook/NNNN-handle-type-short-title.md
Saved: _notebook/NNNN-handle-type-other-title.md
```

Nothing else.

---

## /notebook recover

1. Read full `_notebook/_index.md`
2. Read full `_notebook/lessons.md`
3. Open all ⚑-flagged notes in `_notebook/`
4. Open the last 3 notes in `_notebook/`
5. Read `PROJECT_STATE.md` if it exists
6. Summarize: what the project is, key decisions, active constraints, known pitfalls, current state
7. If the index carries more than one author handle, add one line naming who has been working here and who wrote the most recent notes — it tells the user whose context they're missing and who to ask
8. Ask: "What's changed since this was last updated?"

---

## /notebook migrate

Convert existing messy notes into notebook format. One-time onboarding for projects with pre-existing notes.

1. Ensure `_notebook/` infrastructure exists at the chosen scope (see [Initializing _notebook/](#initializing-_notebook))
2. Scan the target folder (cwd or specified path) for markdown and text files
3. Read each file
4. Classify each: decision, learning, constraint, failure, investigation, or pivot
5. Attribute each — see [Migrated authorship](#migrated-authorship) below
6. Write each as a properly numbered notebook note in `_notebook/`
7. Build `_index.md` from scratch with rich one-line summaries
8. Extract lessons from anything that looks like a failure, constraint, or learning → populate `lessons.md`
9. Leave originals untouched. User deletes them when satisfied.

If `_notebook/` already has notes, continue numbering from the highest existing. Migrate never overwrites existing notes.

After migration, report: how many files found, how many converted, how many lessons extracted, and how many landed as `@unknown`. Show the generated index.

### Migrated authorship

**Never stamp yourself as the author of migrated notes.** Migration is a bulk mechanical action over someone else's thinking, and the stamp is permanent — a wrong one is worse than no attribution, because it reads as fact to every future session.

Determine the author per source file, first match wins:

1. An explicit byline in the file itself (`by: ocean`, a signature, an author field)
2. `git log --format='%ae' -- <source-file>` → most frequent email → local-part. Pre-existing notes are usually tracked, unlike `_notebook/` itself, so this often works
3. Otherwise `unknown`

Add a provenance line to the body of every migrated note so the thin attribution is visible rather than implied:

```markdown
*Migrated from `docs/scratch/auth-notes.md` on YYYY-MM-DD.*
```

---

## Resolving Lessons

To mark a lesson as resolved use: `/notebook save resolved: <exact phrase or lesson number>`

**Matching rules:**
- Prefer exact phrase match from lessons.md
- Otherwise match on key terms (library names, error descriptions, the constraint being resolved)
- If multiple lessons could match, resolve the best one and state which lesson was resolved in the output
- If no match at all, write the note but warn: `Note saved but no matching lesson found to resolve.`

**Strike the lesson** in `lessons.md` and reference the note that resolved it, by number *and* author handle:
```markdown
~~Prisma doesn't work with edge runtime~~ *(resolved: fixed in Prisma 6.0 — see 0047-jon)*
```

Strikethrough preserves history — a future model sees what *used to be* a problem and knows to skip it. The note reference lets anyone find the resolution details, and the handle survives the case where two branches both produced an `0047`.

**Lessons themselves stay unstamped.** They are one line of pure signal read every session; author metadata on the takeaway invites blame-reading and buys nothing the resolving note reference doesn't already give you.

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
6. **One insight per note; every insight per save.** A save sweeps the whole conversation
   and writes every unsaved insight as its own file — it is never just one note. Granular
   files keep lessons greppable; the sweep keeps the record complete (Ocean, 26 Aug 2026).
7. **⚑ sparingly.** Only for things every future session must read.
8. **Notes are append-only.** New moment = new note. Update existing only to mark superseded.
9. **Lessons are distilled.** One line, pure signal. If you need context, open the note.
10. **Every note is stamped.** Author handle in the filename, the `**By:**` field, and the index line — always, solo projects included. Resolve it from git, never prompt for it, never guess.
11. **Check your notes when stuck.** Before attempting a workaround or debugging an unexpected failure, read `_notebook/lessons.md` first. The answer may already be there. This is the reflex that prevents loops.
