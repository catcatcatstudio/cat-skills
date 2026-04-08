# Confidence Gate — GREEN / YELLOW / RED

Every candidate action must pass through this gate before execution. No exceptions.

## GREEN — Act autonomously

ALL of these must be true:

1. **Automated verification exists.** You can name the specific command or check that will confirm success (test suite, build command, linter, type checker, curl request, browser verification per `browser-verification.md`).
2. **The approach is established.** There's precedent in this codebase or it's a well-known pattern. You're not inventing architecture.
3. **The work is reversible.** A `git revert` cleanly undoes it. No database migrations, no external API calls with side effects, no deleted files that can't be recovered.
4. **You're not choosing between approaches.** The path is clear. If you're weighing options, that's YELLOW.
5. **No taste or preference decisions.** The choice is engineering, not design. If two engineers would reasonably do it differently, that's YELLOW or RED.

### GREEN examples
- Fixing a failing test based on clear error output
- Implementing a function that follows an existing pattern in the codebase
- Adding a component that matches established conventions — verified by browser (page loads, elements present, no console errors)
- Updating a dependency to fix a known vulnerability
- Writing tests for existing untested code
- Fixing a linter error
- Setting up test/build/linter infrastructure for a greenfield project (see Bootstrap Exception below)
- Implementing a UI change with browser verification (structured checklist, screenshot evidence)

---

## YELLOW — Research first, then promote or demote

ANY of these triggers YELLOW:

1. **Multiple valid approaches exist** and you haven't researched which is best for this context
2. **Unfamiliar API or library** — you haven't used it in this project before
3. **Task is clear, implementation path has unknowns** — you know WHAT but not exactly HOW
4. **No automated verification** — you'd need to visually inspect or manually test, but you could potentially set up a check (note: browser verification IS automated verification for visual work — see `browser-verification.md`)
5. **Recent changes in the ecosystem** — the library/framework may have changed since your training data

### YELLOW resolution

YELLOW is a temporary state. After research in the THINK phase, it MUST resolve to either:

- **Promote to GREEN:** Research resolved the uncertainty. You now have a clear approach AND a verification plan. Proceed to ACT.
- **Demote to RED:** Research revealed it's more complex than expected, multiple valid approaches with significant tradeoffs, or the decision requires human judgment. Write a decision doc.

**YELLOW never proceeds to ACT.** It always resolves to GREEN or RED first.

### YELLOW examples
- Choosing between two state management approaches for a new feature
- Implementing an API integration you've read about but haven't used
- Setting up a build pipeline for a framework you're somewhat familiar with
- Writing code that depends on a library's behavior you're not 100% sure about

---

## RED — Stop. Document. Move on.

ANY of these triggers RED:

1. **Taste, preference, or strategy decision.** The choice depends on what the user WANTS, not what the code NEEDS.
2. **Irreversible consequences.** Database migrations, external API calls with side effects, deleted data, published packages, sent messages.
3. **Access requirements.** You need credentials, API keys, design files, or services you don't have.
4. **Research didn't resolve uncertainty.** You investigated and you're still not confident.
5. **Ambiguous enough that two engineers would build different things.** The spec is unclear and guessing wrong means rebuilding.
6. **Second attempt on same task.** Two-strike rule — if it failed twice, it needs human input.
7. **Architectural decision with long-term consequences.** Database schema design, framework choice, API contract design.
8. **You're guessing at what the user wants.** If you don't know, don't guess. Ask.

### RED action

1. Do NOT execute the work
2. Write a decision document (see `decision-doc-template.md`)
3. Save to notebook as type `decision` with full format
4. Update PROJECT_STATE.md `blocked:` section
5. Move to the next candidate action in `up_next:`, or exit if nothing else is GREEN

### RED examples
- "Should the dashboard use a sidebar or tab navigation?"
- "The API requires an OAuth token I don't have access to"
- "Three valid database schemas — each optimizes for different query patterns"
- "Tried JWT refresh tokens twice, both failed — need human to investigate the CORS issue"
- "The README says 'beautiful landing page' but doesn't specify layout or content"

---

## Bootstrap Exception (Greenfield Projects)

**Problem:** Iteration 1 of a new project has no tests, no build command, no linter. The standard GREEN criteria require automated verification, which creates a chicken-and-egg: you can't verify without infrastructure, but setting up infrastructure is itself unverified work.

**Rule:** Setting up verification infrastructure IS a valid GREEN action. Specifically:

- Installing and configuring a test runner → GREEN. Verified by: tests execute (even if there are zero test cases yet).
- Setting up a build/compile step → GREEN. Verified by: build command runs without errors.
- Adding a linter/formatter config → GREEN. Verified by: linter runs and reports results.
- Writing the first test for existing code → GREEN. Verified by: test passes.

**The verification for infra setup is: the infrastructure itself executes successfully.** You don't need tests to validate your test runner — you need the test runner to run.

**Scope limit:** This exception applies ONLY to setting up verification tooling. It does NOT extend to other "foundational" work like choosing a framework, designing a schema, or scaffolding the project. Those follow normal gate rules.

**After bootstrap:** Once verification infrastructure exists, all subsequent actions must pass the standard gate. The exception is consumed — you can't keep claiming "bootstrap" to bypass verification.

---

## Decision Tree (Quick Reference)

```
Can I verify with an automated check?
├── NO → Is it possible to SET UP a check?
│   ├── YES, and this IS the setup → GREEN (bootstrap exception)
│   ├── YES, setup is separate work → YELLOW (research how, then re-gate)
│   └── NO → RED
├── YES → Is the approach clear and established?
│   ├── NO → YELLOW (research first)
│   └── YES → Is it reversible?
│       ├── NO → RED
│       └── YES → Am I choosing between options?
│           ├── YES → YELLOW (research, then GREEN or RED)
│           └── NO → GREEN ✓
```

---

## The Meta-Rule

**When in doubt, RED.** The cost of one skipped iteration is 10 minutes of loop time. The cost of one wrong autonomous action is hours of cleanup, reverted commits, and broken trust. Err on the side of caution. The human can unblock you in seconds if the decision doc is good.
