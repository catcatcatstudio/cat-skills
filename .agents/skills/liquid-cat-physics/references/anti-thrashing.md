# Anti-Thrashing Protocol

Three rules that prevent the most documented failure modes of autonomous agent loops.

---

## Rule 1: The Reflexion Rule

After every ACT phase, write a one-line reflection in PROJECT_STATE.md under `last_action:`.

Format:
```
**What:** [what you did]
**Result:** pass | fail | partial
**Reflection:** [one sentence — what happened, what you'd do differently]
```

This is not journaling. This is data for the next iteration. The Reflexion research (NeurIPS 2023) showed that verbal self-reflection pushed task completion from 80% to 91%. It costs almost nothing and gives the next iteration real signal about what just happened.

**Write the reflection even when things succeed.** "Worked as expected, approach confirmed" is valid. The absence of a reflection is a signal that the skill didn't complete properly.

---

## Rule 2: The Two-Strike Rule

Track attempt counts per task in the `failure_log:` section of PROJECT_STATE.md.

```
## Failure Log
- auth-token-refresh: attempt 1 (iter 5) — CORS error on token endpoint. attempt 2 (iter 8) — same CORS error with different approach. ESCALATED → RED.
- db-migration: attempt 1 (iter 12) — schema conflict with existing data. Researching alternatives.
```

### The rule

- **Attempt 1 fails:** Record it. Try a DIFFERENT approach next time (not the same thing again).
- **Attempt 2 fails:** STOP. Escalate to RED immediately. Write a decision document explaining:
  - What was tried (both attempts)
  - Why each failed
  - What you think the root cause is
  - What human input would help

**Never attempt the same task a third time.** If two different approaches both failed, the problem is either:
1. Harder than it appears (needs human investigation)
2. Missing information (needs human to provide context)
3. Blocked by something external (needs human to unblock)

All three require human input. More attempts just burn tokens and context.

### What counts as "the same task"?

Match on the core objective, not the implementation. "Fix auth token refresh" is one task whether you try JWT, cookies, or session tokens. "Set up the database" is one task whether you try Postgres, SQLite, or SurrealDB.

If the approach is fundamentally different enough that you'd describe it as a different task in the project plan, it's a different task and gets its own attempt counter.

---

## Rule 3: The Regression Check

Before committing any work, verify you haven't broken what was already working.

### Process

1. Run the **full** test suite, not just tests for your change
2. Run the **build** (if applicable) — a clean build, not incremental
3. Run the **linter** (if configured)
4. Check `git diff` — does the diff contain ONLY changes related to your decided action?

### If regression detected

1. **Do NOT commit.** Revert your changes.
2. Record the regression in the failure log: "Attempted [X], caused regression in [Y]"
3. This counts as a failed attempt for the two-strike rule
4. The next attempt must account for the regression — don't just try the same thing again

### If no test suite exists

- For code projects: this is itself a RED item. Note: "No test suite exists. Cannot verify work autonomously. Recommend setting up tests before continuing loop."
- For non-code projects (docs, config, design): use whatever verification is available — build succeeds, linter passes, file structure is valid.

### Why this matters

Ralph's most documented failure mode: "errors compound beyond context capacity for recovery." One bad commit that breaks existing functionality cascades into 10 iterations of thrashing. Catching regressions at the source prevents the cascade entirely.

---

## Rule 4: Orphaned Changes Recovery

If ORIENT detects uncommitted changes via `git status`, the previous iteration may have been interrupted mid-ACT (context compaction, session death, error).

### Detection

Compare the dirty working tree against the last completed iteration:
1. Check `git log --oneline -1` — does the most recent commit match `last_action`?
2. Check `iteration:` — did it increment since the last known PERSIST?

**If the last iteration completed normally** (commit exists, iteration incremented): the changes are external. A human edited files, or a build tool generated output. Leave them alone. Note their existence in Working Memory so THINK can account for them.

**If the last iteration did NOT complete** (no matching commit, iteration didn't increment): these are orphaned changes from a failed or interrupted ACT phase.

### Recovery

1. **Read the diff.** `git diff` + `git diff --cached` to understand what was attempted.
2. **Run verification.** Full test suite, build, lint — whatever the project uses. If the work is visual, run browser verification.
3. **If verification passes:** Commit with message `recovery: [brief description]`. Log in Completed as a recovered iteration. Increment iteration. Continue to THINK as normal.
4. **If verification fails:** Revert with `git checkout .` (and `git reset HEAD` if anything was staged). Log as an interrupted attempt in the failure log — this counts toward the two-strike rule for whatever task was being attempted. Continue to THINK as normal.

### Why not always revert?

Orphaned changes that pass verification are *completed work*. Throwing away good work because the iteration didn't finish its bookkeeping is wasteful. The recovery commit preserves the work and logs that it was recovered, so the human knows what happened at checkpoint time.

### Edge case: can't determine what task the changes belong to

If the diff is unclear and you can't map it to any item in `up_next` or `last_action`, revert. Unknown changes are not worth the risk of committing mystery code. Log it as "interrupted iteration — orphaned changes reverted, couldn't identify task."

---

## Anti-Pattern Table

| Pattern | How to detect | What to do instead |
|---------|--------------|-------------------|
| Same error, third attempt | Failure log shows 2 entries for same task | Escalate to RED |
| Fix-break cycle | Commit fixes X but breaks Y, next commit fixes Y but breaks X | Revert both, escalate to RED |
| Refactoring what you just built | `git log` shows build + refactor in consecutive iterations | Stop refactoring. Build forward. |
| Scope creep within iteration | `git diff` touches files unrelated to decided action | Revert unrelated changes, note them for future iteration |
| Context fishing | Reading 10+ files to understand the codebase | Use a subagent for exploration |
| Circular research | Searching for the same thing you searched last iteration | Check notebook — the answer should already be saved |
| Placeholder implementations | Writing stubs/mocks instead of real code | If you can't build the real thing, mark RED |
