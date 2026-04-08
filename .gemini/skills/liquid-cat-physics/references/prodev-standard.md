# Prodev Standard — Engineering Discipline for Every Iteration

This is /prodev's field manual embedded into the loop. During THINK, it shapes what action you choose. During ACT, it governs how you execute. Before committing, it gates quality.

---

## Before Choosing an Action (THINK phase)

### Layer Discipline

Know what layer the problem lives in. Solve it there.

- Data problem → fix the model/schema
- Display problem → fix the view
- Race condition → fix the architecture, not the timing
- Auth problem → fix at the boundary, not in every handler
- Validation problem → fix at the entry point, not scattered through business logic

If the candidate action solves a problem at the wrong layer, reject it and pick the action that fixes the right layer. Don't touch the file you happen to have open — touch the file where the fix belongs.

### Blast Radius Check

Before committing to any action, answer:

1. What calls this code?
2. What does this code call?
3. What breaks if this changes?
4. What tests cover this?

If you can't answer all four, your THINK phase isn't done. Read the callers, read the tests, trace the data flow. Understanding comes before action.

A one-line change in the wrong place breaks 40 things. A 200-line change in a well-understood place breaks nothing. Size of diff is not risk — understanding is.

### Research Protocol

When the candidate action touches an external library, API, or framework:

1. Check the version in the project's lockfile/manifest
2. Look up docs for THAT version — use context7, official docs, or source code
3. Verify the specific functions, options, and patterns you plan to use actually exist

Do not skip this because it feels slow. Do not rely on training data for API signatures. If you're reaching for a call from memory rather than a verified source, stop and verify.

Skip this for: language fundamentals, standard library features, APIs you already verified in a previous iteration (check working memory).

---

## During Execution (ACT phase)

### Ownership Mentality

Every line you write, someone maintains. Every abstraction you add, someone navigates. Every name you choose, someone reads at 2am debugging production. If you had to debug this code with no context at 2am, would it help you or fight you?

### Current-Generation Patterns

Use the current best approach for the ecosystem, not the one from 2 years ago with more blog posts. Claude's training data skews toward older patterns.

Before writing code:
- What does the project already use? Match existing patterns and versions.
- What's the current recommended approach? Not the previous major version's way.
- Has the framework introduced a better primitive since the old pattern was written?

When uncertain, check the docs. "Seen this in training data" is not "this is correct in 2025+."

### Boring Is Good

Most code should be obvious, predictable, unremarkable. The best code reads like it was inevitable. Novel solutions are a liability — they require the next person to understand your cleverness before modifying anything.

If you find yourself writing something clever, ask: is this clever because the problem requires it, or because I'm pattern-matching to something interesting from training data?

### Know When to Stop

- Don't add error handling for states that can't exist
- Don't validate internal data already validated upstream
- Don't add configurability nobody asked for
- Don't wrap a third-party lib "in case we switch"
- Don't add types for data shapes used once

The minimum complexity for the current requirement is the right amount. Three similar lines > a premature abstraction.

### No Stubs, No Placeholders

If you're implementing something, implement it. `// TODO`, hardcoded returns, and fake implementations are never acceptable. Can't build the real thing? That's a RED — escalate, don't stub.

---

## Before Committing (self-review gate)

Run this checklist silently before every commit. Every answer must be "yes" or "not applicable."

1. Does it handle the error paths that actually exist?
2. Did I check what the callers expect?
3. Would I understand this code if I saw it cold?
4. Is there a simpler way I skipped over?
5. Did I leave any assumptions unverified?
6. Did I actually run/test it? (Not "I think it works" — "I verified it works.")
7. Did I solve the problem at the right layer?
8. Am I using current-gen patterns for this ecosystem?
9. Is every new line earning its place, or am I adding defensive complexity?

If ANY answer is "no" — fix it before committing. Don't record a GREEN that isn't one.

---

## The Escape Valve

Sometimes a patch IS the right call. Shipping is blocked, the real fix is a bigger refactor, the deadline is real.

The rule: say it in the commit message and the notebook. "Temporary patch because [reason]. Real fix is [X]." Never silently pass off a hack as a proper solution. Log it so a future iteration can address it.
