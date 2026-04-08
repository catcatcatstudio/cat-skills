# Loop State Schema

This defines the `## Loop State` section in PROJECT_STATE.md. The skill reads and writes this section every iteration.

---

## Template

Add these sections to PROJECT_STATE.md. If PROJECT_STATE.md doesn't exist, create it with the project header + both sections.

The Execution Protocol section comes FIRST — it's the bootstrap sector the LLM reads before anything else.

```markdown
## Execution Protocol

> Context recovery — read this if you don't remember the loop.

**You are liquid-cat-physics**, an autonomous deep-work loop. Each iteration:
1. **ORIENT** — Read this file + `_notebook/lessons.md` + `_notebook/_index.md` + git state
2. **THINK** — Spawn a subagent (pass it inline state + file paths). Decide ONE action.
3. **GATE** — GREEN (verified, established, reversible) → ACT. YELLOW → resolve to GREEN or RED. RED → document + skip.
4. **ACT** — Execute one task. Verify with tools (tests/build/lint/browser). One commit.
5. **PERSIST** — Update Loop State below. Save to notebook ONLY on failures/decisions/learnings.

**Hard rules:** One task per iteration. External verification only. RED when in doubt. Subagents for research, main context for implementation. Two failed attempts = escalate to RED.

**Reference files** (re-read when uncertain): `references/confidence-gate.md` | `references/anti-thrashing.md` | `references/elevate-lens.md` | `references/browser-verification.md`

**Skill source:** `[path to SKILL.md]` — read this for full protocol if the above is insufficient.

---

## Loop State

status: active
iteration: 1
cron_id: [8-char ID from CronCreate]
interval: 10m
checkpoint_interval: 10
last_checkpoint_at: 0
started_at: YYYY-MM-DDTHH:MM:SSZ
last_run_at: YYYY-MM-DDTHH:MM:SSZ
project_goals: |
  [2-5 line summary of project goals, cached from CLAUDE.md/README during
  Phase 0 or first ORIENT. Updated only when current_focus changes and
  CLAUDE.md is re-read.]
verification_baseline: |
  [Output from running tests/build/lint during Phase 0. "No infra yet" for
  greenfield. Used as reference point for regression checks.]

### Current Focus
[One sentence: what the skill is working toward right now]

### Last Action
- **What:** [description of action taken]
- **Result:** pass | fail | partial
- **Reflection:** [one sentence — what happened, what to do differently]
- **Verification:** [what check was run and its output summary]

### Completed
- [x] [description] (iteration N)
- [x] [description] (iteration N)

### Up Next (ranked by priority)
1. [task] — confidence: GREEN
2. [task] — confidence: YELLOW (needs: [what research])
3. [task] — confidence: RED (needs: [what human input])

### Blocked / Needs Human
[Empty if nothing blocked. Otherwise, list items with references to decision docs in notebook.]

### Failure Log
[Empty if no failures. Otherwise, track per-task attempt history:]
- [task-key]: attempt 1 (iter N) — [what happened]. attempt 2 (iter N) — [what happened]. ESCALATED.

### Momentum
[Last 5 iteration outcomes. Used for pattern detection in ORIENT.]
- iter N: GREEN — [task summary]
- iter N: RED — [reason]
- iter N: partial — [what was incomplete]

### Working Memory
[LLM's accumulated understanding of the codebase. Survives context compaction.
Updated when new structural insights are discovered. Read every iteration.]

**File map:**
- [path] — [what it does / why it matters]

**Architecture notes:**
- [pattern or coupling: "changing X affects Y because..."]

**Environment:**
- Dev server: [command] → [URL]
- Test command: [command]
- Build command: [command]

**Current state:**
- [what's built, what's broken, what's half-done]
```

---

## Section Definitions

### Execution Protocol (bootstrap sector)
Compact recovery instructions at the top of PROJECT_STATE.md. Read FIRST every iteration. Purpose: after context compaction erodes the original SKILL.md from the LLM's memory, this section reconstructs correct operational behavior from disk alone.

Generated once during Phase 0 initialization. The `[path to SKILL.md]` placeholder is filled with the actual path. Never modified by the loop — it's a static reference.

---

## Field Definitions

### status
- `active` — loop is running, work to do
- `paused` — loop stopped by user (`/liquid-cat-physics stop`), cron cancelled
- `complete` — all project goals met, cron auto-cancelled
- `blocked` — everything remaining requires human input, cron gets one more iteration to check then auto-cancels
- `blocked-stopped` — blocked AND cron cancelled. Run `/liquid-cat-physics` to restart after unblocking.
- `checkpoint` — loop paused for periodic human review. Cron cancelled. Run `/liquid-cat-physics` to resume after reviewing the checkpoint report.
- `error` — something unexpected happened, needs investigation

### cron_id
The 8-character ID returned by CronCreate. Used to verify the cron is still active and to cancel it on stop. If the session restarts (cron lost), the skill detects this and creates a new one at the stored `interval`.

### interval
Human-readable interval (e.g., `10m`, `5m`, `1h`). Stored so the skill can recreate the cron at the same interval after a session restart.

### iteration
Integer, starts at 1, increments every cycle. Never resets unless user runs `/liquid-cat-physics reset`.

### checkpoint_interval
How many iterations between human checkpoints. Default: 10. Set during Phase 0. The loop pauses itself at each multiple and requires human confirmation to continue.

### last_checkpoint_at
Iteration number of the last checkpoint (or 0 if none yet). Used to calculate next checkpoint.

### verification_baseline
Snapshot of test/build/lint results from Phase 0. Captures the starting state so the anti-thrashing regression check knows which failures pre-date the loop. Format: one line per tool with pass/fail count. For greenfield: "No infra yet — bootstrap exception active."

### project_goals
Cached summary of project goals extracted from CLAUDE.md / README during Phase 0 pre-flight (or first ORIENT for resumed projects). Kept to 2-5 lines. Purpose: subsequent iterations can assess progress against goals without re-reading CLAUDE.md every time.

**When to update:** Only when `current_focus` changes — re-read CLAUDE.md at that point and refresh this summary if goals have evolved.

### Current Focus
One sentence describing the immediate strategic direction. Not a task — the THEME. Examples:
- "Setting up the core data layer and schema"
- "Implementing the authentication flow"
- "Getting the test suite to full coverage"

Updates when the skill shifts to a new area of work. When this changes, ORIENT re-reads CLAUDE.md and refreshes `project_goals`.

### Last Action
Always reflects the most recent iteration's work. The reflection field is mandatory — it's the Reflexion Rule in action.

### Completed
Rolling list of recent completions with iteration numbers. **Capped at 10 items.** When an 11th item is added, the oldest entry is moved to `_notebook/completed-log.md` (append-only archive). The skill reads this to avoid re-doing recent work. Routine GREEN completions go here — the notebook is NOT used for those.

### Up Next
Ranked queue of candidate actions. Each has a confidence rating. The skill picks the highest-ranked GREEN item. If no GREEN items exist, it attempts to promote YELLOW items through research. If everything is RED, it sets status to blocked.

**Maintenance:** Prune completed items, add new items as discovered. Keep to 5-10 items max — working queue, not a backlog.

### Blocked / Needs Human
Items that are RED and waiting for human input. Each should reference a decision doc in the notebook. Format:

```
- **[Title]** — [one-line summary]. See _notebook/NNNN-decision-short-title.md
  - To unblock: [literally what the human needs to do or decide]
```

### Failure Log
Per-task attempt tracking for the two-strike rule. Key format: short kebab-case task identifier. Tracks attempt number, iteration number, and what happened. When escalated, marked as ESCALATED.

### Momentum
Rolling window of the last 5 iteration outcomes. Each entry records: iteration number, gate result (GREEN/RED/partial), and a brief task summary. Older entries are pruned.

Used by ORIENT for pattern detection:
- 3+ consecutive REDs → trigger early checkpoint
- 2+ consecutive partials → next THINK reduces scope
- Same current_focus for 5+ iterations → THINK re-evaluates direction

This section is purely diagnostic — the skill reads it to detect systemic patterns that individual iterations can't see.

### Working Memory
The LLM's accumulated operational understanding of the codebase. This is the third persistence layer — between ephemeral conversation context (lost on compaction) and slow notebook (knowledge that compounds across sessions).

**What goes here:**
- **File map:** Key files and their roles, discovered incrementally as the LLM explores. Not an exhaustive listing — just the files that matter for current work.
- **Architecture notes:** Coupling points, patterns, dependencies. "Changing the auth module requires updating the user model because they share a session store."
- **Environment:** Dev server command and port, test/build/lint commands, URLs. Things the LLM discovers and shouldn't have to rediscover after compaction.
- **Current state:** What's built, what's broken, what's in-progress. A quick situational snapshot.

**When to update:** After any iteration where the LLM learned something structural about the codebase that isn't captured elsewhere. NOT on every iteration — only when genuine new understanding was gained.

**When to prune:** Remove entries about files that no longer exist, commands that changed, or architecture that was refactored. Keep it accurate and current.

---

## Reading Priority

When the skill reads PROJECT_STATE.md, it reads in this order:
1. `Execution Protocol` — context recovery (read first, always)
2. `status` — should I even run?
3. `Working Memory` — rebuild codebase understanding
4. `Blocked / Needs Human` — has anything been unblocked?
5. `Last Action` — what just happened?
6. `Up Next` — what's the candidate action?
7. `Failure Log` — has this been attempted before?
8. `Momentum` — any systemic patterns?
9. `project_goals` — what are we building toward?
10. `Completed` — what's already done?
11. `Current Focus` — am I still on track?

---

## Initialization

When creating PROJECT_STATE.md for the first time (after Phase 0 pre-flight passes):

1. Write `## Execution Protocol` section with the bootstrap sector template. Fill in `[path to SKILL.md]` with the actual skill path.
2. Write `## Loop State` section:
   a. Set `project_goals:` from the pre-flight assessment summary
   b. Set `verification_baseline:` from Phase 0 verification run
   c. Set `checkpoint_interval: 10` (or user-specified)
   d. Set `Current Focus` with the first strategic direction
   e. Populate `Up Next` with 3-5 initial tasks, each with a confidence rating
   f. Populate `### Working Memory` with initial codebase observations from Phase 0 deep-read
   g. Leave `Last Action`, `Completed`, `Blocked`, `Failure Log`, and `Momentum` empty
   h. Set `status: active`, `iteration: 1`, `last_checkpoint_at: 0`
