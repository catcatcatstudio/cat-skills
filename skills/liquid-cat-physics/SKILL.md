---
name: liquid-cat-physics
status: published
description: >
  Autonomous deep-work agent loop for driving projects forward with strategic intelligence.
  Each invocation performs one intelligent iteration: reads project state, assesses what's needed,
  applies critical expert thinking, does research when uncertain, executes one focused unit of
  work, and persists everything to notebook + PROJECT_STATE.md. Automatically sets up a /loop
  cron on first run (default 10m). Includes a three-tier confidence gate (GREEN/YELLOW/RED) that
  prevents the agent from acting when it should pause for human input.
  Use ONLY when the user explicitly invokes the command: "/liquid-cat-physics" or "lcp".
  Do NOT trigger on general phrases like "autonomous build", "deep work loop", or "drive this
  project forward" — those are not invocations of this skill.
  NOT for: one-off tasks, quick fixes, tasks without a project structure, or projects without
  clear goals. If the task is small enough to build in one shot without planning, just build it
  directly — don't force the methodology.
argument-hint: "[<interval>] [status | stop | reset]"
---

# Liquid Cat Physics

Autonomous deep-work engine. One command to start, then walk away.

## How it works

Type `/liquid-cat-physics` and the skill runs a pre-flight readiness check (once), sets up a recurring cron loop, and keeps going autonomously every 10 minutes.

Each iteration cycle:

```
ORIENT  → Read state, know where you are           (fast read)
THINK   → Expert assessment, decide next action     (subagent)
GATE    → GREEN/YELLOW/RED confidence check         (decide)
ACT     → Execute ONE unit of work                  (main context)
PERSIST → Update PROJECT_STATE.md + selective notes  (always)
```

State lives on disk, not in conversation. Context compaction can't erase it.

Reference files (read on demand, NOT every iteration):
- `references/confidence-gate.md` — re-read when GATE decision is uncertain
- `references/anti-thrashing.md` — re-read when a failure occurs or failure_log is non-empty
- `references/elevate-lens.md` — re-read in THINK phase
- `references/browser-verification.md` — re-read when doing visual/UI work

---

## When NOT to use this skill

- No project structure (no git repo, no CLAUDE.md, no clear goals) — set those up first
- One-off task or quick fix — just do it directly
- Project requires continuous human design decisions — use /architect instead

---

## Invocation

| Input | Action |
|-------|--------|
| `/liquid-cat-physics` | Start the loop (default 10m interval) + run first iteration |
| `/liquid-cat-physics 5m` | Start with custom interval |
| `/liquid-cat-physics status` | Show current state: iteration, cron ID, blocked items, recent actions |
| `/liquid-cat-physics stop` | Cancel the cron loop + set status to paused |
| `/liquid-cat-physics reset` | Reset iteration count, clear failure log, keep notebook history |

---

## Startup Decision Tree

Every invocation enters here. One path, no ambiguity.

```
Read PROJECT_STATE.md → look for ## Loop State
│
├── No Loop State found → FIRST RUN
│   1. Run Phase 0: Pre-Flight (interactive)
│   2. Initialize Loop State + _notebook/
│   3. Create cron at requested interval
│   4. Proceed to ORIENT
│
├── Loop State exists, status: paused
│   1. Create new cron at stored interval
│   2. Set status: active
│   3. Proceed to ORIENT
│
├── Loop State exists, status: active
│   1. Check cron_id via CronList
│   ├── Cron alive → Proceed to ORIENT
│   └── Cron dead (session restart, expired)
│       1. Recreate cron at stored interval
│       2. Update cron_id
│       3. Proceed to ORIENT
│
├── Loop State exists, status: checkpoint
│   1. Human resumed after checkpoint — create new cron
│   2. Set status: active
│   3. Proceed to ORIENT
│
├── Loop State exists, status: complete → Exit. "Project complete."
│
└── Loop State exists, status: blocked-stopped
    1. Check if blocked items are now unblocked
    ├── Still blocked → Exit. Show blocked items.
    └── Something unblocked → Create cron, set active, ORIENT
```

### Stopping

`/liquid-cat-physics stop`:
1. Read `cron_id` from Loop State
2. CronDelete to cancel it
3. Set `status: paused`, clear `cron_id`
4. Output: "Loop stopped at iteration N. Run `/liquid-cat-physics` to resume."

---

## Phase 0: Pre-Flight Readiness Check

**Runs ONCE on first invocation. INTERACTIVE — asks user questions.**

This is the only interactive phase. Front-load all friction here so the loop runs autonomously after.

### Steps

1. **Deep-read the project.** CLAUDE.md, README, package.json, directory structure, existing code patterns, git history, any existing _notebook/ or PROJECT_STATE.md.

2. **Assess readiness across these dimensions:**

   | Dimension | What to check | Insufficient if... |
   |-----------|--------------|---------------------|
   | Goals clarity | Are goals specific and executable? | Vague ("make it good"), no success criteria |
   | Codebase understanding | Architecture, patterns, conventions | Can't explain the data flow or key abstractions |
   | Verification infrastructure | Tests, build, linter exist? | No automated feedback signal at all |
   | Scope definition | Work is narrow enough for autonomous execution? | Too broad, multi-week epic with no breakdown |
   | Blockers visible | Obvious RED items that would block immediately? | First 3 tasks are all RED |
   | Dependencies/access | API keys, services, credentials available? | Needs external resources the LLM can't access |

3. **If ANYTHING is insufficient:** Ask the user targeted questions. Not a generic checklist — specific questions about the actual gaps found. Don't proceed until every dimension is at least adequate.

4. **If verification infrastructure is missing:** That's OK for greenfield projects. Note that the first iterations should set it up (see bootstrap exception in `references/confidence-gate.md`). This is not a blocker — just flag it.

5. **Run verification baseline.** If any verification infrastructure exists (tests, build, lint), run it all NOW. Record the results in `verification_baseline:` in Loop State. This is the known-good (or known-bad) starting point — every future regression check measures against this. If 3 tests fail before the loop starts, the loop knows it didn't cause them.

6. **Set checkpoint interval.** Default: every 10 iterations. Store as `checkpoint_interval:` in Loop State. The loop will pause itself at this cadence for human review.

7. **Generate execution protocol.** Write the `## Execution Protocol` header into PROJECT_STATE.md (see `references/state-schema.md`). This is the bootstrap sector — compact recovery instructions that survive context compaction. The LLM reads this first every iteration.

8. **Initialize working memory.** Create `### Working Memory` in Loop State with initial codebase observations from the deep-read: key file map, architecture notes, dev server commands, environment details.

9. **Enable memento auto.** Run `touch ~/.claude/.memento-auto`. This ensures compaction recovery — when the context window fills and auto-compacts, the memento hook preserves recent conversation trace and re-injects it post-compaction. No toggle, no prompt. Autonomous loops need this unconditionally.

10. **Once ready:** Populate initial `project_goals:` summary in Loop State, set `current_focus`, populate `up_next` with 3-5 tasks and confidence ratings, then create the cron and proceed to ORIENT.

---

## Phase 1: ORIENT (every iteration)

### Step 1: Read state + exit early if terminal
1. `PROJECT_STATE.md` — start with `## Execution Protocol` (context recovery), then parse `## Loop State` for status, iteration, focus, failures, up_next, **working memory**
2. **Status checks (exit early):**
   - `status: complete` → CronDelete, clear cron_id. Output "Project complete." Exit.
   - `status: blocked` → Check if blocked items are now unblocked. Still blocked → CronDelete, set `status: blocked-stopped`, clear cron_id. Exit. Unblocked → set `status: active`, continue.

### Step 2: Read remaining context
3. `_notebook/lessons.md` — constraints and past failures
4. `_notebook/_index.md` — recent context
5. `git log --oneline -10` — recent commits
6. `git status` — working state
7. `CLAUDE.md` — **only on first iteration or when `current_focus` changes.** Cache goals as `project_goals:` in Loop State.

### Step 3: Orphaned changes recovery
If `git status` shows uncommitted changes, check whether the last iteration committed them:
- Compare dirty files against `last_action` and `git log --oneline -1`
- **If last iteration completed normally** (its commit exists in log) → changes are external (human or tooling). Leave them. Note in working memory.
- **If last iteration did NOT commit** (iteration count matches but no commit, or last_action shows fail/partial) → **orphaned changes from a failed or interrupted iteration.** Recover:
  1. Read the diff (`git diff`) to understand what was attempted
  2. Run verification (tests/build/lint/browser — whatever the project uses)
  3. **Passes** → commit as `recovery: [description of changes]`. Log in Completed. Increment iteration. Continue normally.
  4. **Fails** → `git checkout .` to revert. Log as interrupted attempt in failure_log. Counts toward two-strike rule. Continue normally.

### Step 4: Checkpoint trigger
If `iteration` is a multiple of `checkpoint_interval` (default 10): **pause the loop.**
1. Output a structured checkpoint report:
   - Completed items since last checkpoint
   - Current trajectory vs. project_goals — on track or drifting?
   - Any items that have been YELLOW for 3+ iterations without resolving
   - Momentum summary (see below)
   - Explicit ask: "Continue, adjust focus, or stop?"
2. Set `status: checkpoint`, CronDelete, clear cron_id
3. Exit. The human must invoke `/liquid-cat-physics` to resume.

### Step 5: Momentum detection
Read the last 3-5 iterations from `### Momentum` section. Detect patterns:

| Pattern | Detection | Response |
|---------|-----------|----------|
| 3+ consecutive task failures | 3+ REDs on DIFFERENT tasks (not escalation bookkeeping) | Trigger checkpoint NOW (don't wait for interval) |
| 2+ consecutive partials | Last 2-3 results are `partial` | Next THINK must deliberately reduce scope |
| Same focus 5+ iterations | `current_focus` unchanged for 5 cycles | THINK must re-evaluate: is focus genuinely large, or are we stuck? |

**Note:** A RED iteration that is purely procedural (escalating a two-strike failure, writing a decision doc) does NOT count toward the consecutive RED pattern. Only count iterations where actual work was attempted and failed. A two-strike escalation followed by a GREEN on the next task is healthy behavior, not a crisis.

If an early checkpoint triggers, note `early_checkpoint: true` and the reason in the checkpoint report.

---

## Phase 2: THINK (subagent — protect main context)

Spawn a **Plan or Explore subagent**. The subagent's verbose reasoning stays out of main context.

**Critical: pass the subagent explicit context.** Subagents run in isolated context windows — they haven't read anything. The subagent prompt MUST include:

1. **Inline state summary:** current_focus, project_goals, last_action (result + reflection), failure_log entries, up_next queue, momentum patterns (consecutive outcomes), verification_baseline
2. **Files to read:** Tell the subagent to read `references/elevate-lens.md` and any project files relevant to the candidate action. Only include `references/confidence-gate.md` if the gate decision is genuinely uncertain, and `references/anti-thrashing.md` if the failure_log is non-empty.
3. **Lessons:** Either inline the full lessons.md content or tell it to read `_notebook/lessons.md`

The subagent must:

1. **Assess current state.** What's done vs. project goals? What's the gap?
2. **Apply the expert lens.** Read `references/elevate-lens.md`. Ask: "What would a top practitioner do RIGHT NOW? Not the obvious TODO — the smartest move."
3. **Check lessons.** Is the candidate action something that's failed before? If yes, find a different approach or escalate.
4. **Research if needed.** Unfamiliar APIs, library choices, architecture patterns → research first. Use web search, context7, codebase exploration. Don't guess.
5. **Decide ONE action.** Not a list. ONE thing, scoped to 5-8 minutes of execution.
6. **State the verification plan.** What specific check confirms success? If you can't name one, it's not GREEN (see bootstrap exception for infra setup). **For visual/UI work:** specify browser verification per `references/browser-verification.md` — this is a valid GREEN check.

Return to main context: the decided action, its confidence tier, and the verification plan.

---

## Phase 3: GATE (confidence check)

Read `references/confidence-gate.md` for full criteria.

| Tier | Action |
|------|--------|
| **GREEN** | Proceed to ACT. Verification exists, approach is established, work is reversible. |
| **YELLOW** | Must resolve. Research happened in THINK → promote to GREEN or demote to RED. YELLOW never proceeds to ACT. |
| **RED** | Do NOT act. Write decision doc (`references/decision-doc-template.md`). Save to notebook. Update blocked items. Move to next candidate or exit. |

**The rule:** When in doubt, RED. One skipped iteration costs 10 minutes. One wrong action costs hours.

---

## Phase 4: ACT (focused execution)

Execute the ONE decided action:

1. **One thing only.** Notice something else? Note it for a future iteration.
2. **Follow the verification plan.** Run the check you committed to in THINK. For browser verification, follow the full protocol in `references/browser-verification.md`.
3. **Verification minimum bar.** Syntax checks alone (e.g. `node --check`) are NOT sufficient verification. At minimum: build/compile succeeds + the changed behavior actually works (run it, hit the endpoint, load the page). If no test suite exists, run the code and confirm the new behavior functions. If the work is visual, use browser verification.
4. **If verification fails:** Don't retry immediately. Record failure. Check `references/anti-thrashing.md` two-strike rule. Attempt 2 on same task → escalate to RED.
5. **If verification passes:** One atomic commit with all changes (code + state update). Never split an iteration across multiple commits.
6. **Don't refactor what you just wrote.** Build forward. Polish is for a dedicated iteration.

---

## Phase 5: PERSIST (every iteration)

### PROJECT_STATE.md (always)

Update `## Loop State`:
- Increment `iteration:`
- Update `current_focus:`, `last_action:`, `up_next:`, `blocked:`, `failure_log:` as needed
- Update `### Completed` — append this iteration. **Cap at 10 items.** Archive older entries to `_notebook/completed-log.md` (append-only).
- Update `### Momentum` — append this iteration's outcome (GREEN/RED/partial), prune to last 5
- Update `### Working Memory` — add any new codebase insights, file discoveries, architecture observations, environment details. Remove stale entries. This is the LLM's operational memory that survives compaction.
- See `references/state-schema.md` for full template

### Notebook (selective — NOT every iteration)

**ALWAYS save:** failures, decisions, constraints discovered, pivots, investigations, non-obvious learnings, significant milestones.

**NEVER save:** routine GREEN completions ("added button, tests pass"). The Completed list in PROJECT_STATE.md already tracks mechanical progress. Notebook is for knowledge that compounds.

### Completion check

After persisting, assess: is the project done?
- All items in project_goals addressed
- No remaining GREEN or YELLOW in up_next
- All automated checks pass

If complete → `status: complete`, CronDelete, clear cron_id, output summary.
If everything remaining is RED → `status: blocked`. Cron stays for one more iteration (ORIENT checks if anything unblocked, then auto-cancels if not).

---

## Behavioral Rules

1. **External feedback is the only real self-correction.** Tests, builds, linters. Your own judgment about correctness is unreliable. Always verify with tools.
2. **One task per iteration, always.** Resist scope creep.
3. **Persist before everything else.** Lost state means starting over.
4. **Read lessons.md before every action.** The answer may already be there.
5. **Subagents for exploration, main context for implementation.**
6. **When stuck, escalate — don't thrash.** Two failed attempts = RED.
7. **Exactly one commit per iteration.** Code changes AND PROJECT_STATE.md updates go in the same commit. Never split an iteration across multiple commits — stage everything, commit once.
8. **No placeholder implementations.** Can't build the real thing? Mark it RED.
9. **Context is finite. Act like it.** Lean tool output. Subagents for verbose exploration. On routine GREEN iterations, read only PROJECT_STATE.md + lessons.md + _index.md. Re-read reference files only when uncertain or handling failures — not every iteration.
10. **The project goals are sacred.** Don't add features that aren't in the goals.
