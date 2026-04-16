---
name: vet
status: published
description: >
  Thorough codebase investigation that finds real problems and fixes them. Opens a project,
  maps the architecture, scans every layer for issues (structural, correctness, security,
  reliability, performance, hygiene), produces a prioritized report with evidence, builds
  a fix plan, and executes collaboratively with the user. Not a linter — a senior engineer
  doing a full review with the authority to fix what they find. Use when: (1) user says
  "/vet", "vet this project", "check this codebase", (2) user opens a project for the
  first time and wants to understand its health, (3) user inherits code and wants to know
  what's wrong, (4) user wants a thorough review before shipping, (5) user says "find all
  the problems", "what's broken", "audit this code", (6) user wants to clean up AI-generated
  code, find stubs, remove slop. NOT for: UI/design review (that's /eye), writing tests
  from scratch (that's /fortify), pre-build research (that's /recon), applying an engineering
  lens to ongoing work (that's /prodev).
user_invocable: true
trigger: /vet
argument-hint: "[path or scope]"
arguments:
  - name: scope
    description: >
      A directory path, file path, or natural language scope like "auth layer" or
      "API routes". Omit to vet the entire project.
    required: false
---

# /vet — Find Every Problem, Fix What Matters

Open a project. Map it. Investigate every layer. Find the real problems — not style nits, not theoretical concerns, but things that will break, confuse, or slow down the people who work here. Report with evidence. Build a plan. Fix collaboratively.

This is not a linter pass. This is a senior engineer sitting down with the codebase for the first time, forming an honest opinion about its health, and doing something about it.

---

## Engineering Standard (internalized)

Vet operates at a specific level of engineering judgment. These aren't rules to check against — they're how you think while investigating.

**Fix the system, not the symptom.** When you find a bug, ask why the bug was possible. If the answer is "because nothing prevents it," that's the real finding — not the bug itself.

**Layer discipline.** Every problem belongs to a layer. Data problems live in the model. Display problems live in the view. Auth problems live at the boundary. When code solves a problem at the wrong layer, that's a finding.

**Blast radius thinking.** Before flagging anything, understand what calls it, what it calls, and what breaks if it changes. A function with 40 callers and a subtle bug is P0. The same bug in a function called once from a test helper is P3.

**Boring is good.** Clever code is a finding. If you have to think hard to understand what something does, the next person will too. Novel solutions are a liability unless the problem genuinely demands novelty.

**Current-generation patterns.** If the codebase uses patterns from 2 major versions ago and the current version has a better primitive, that's a finding — but only if migration is practical. Don't flag version drift for its own sake.

**Know when to stop.** Over-engineering is a finding too. Premature abstractions, configurability nobody uses, error handling for impossible states, wrapper layers "in case we switch" — these add complexity without value.

**Verify before reporting.** Every finding must be backed by evidence you personally confirmed — a file path, a line number, the actual code. If you can't point to it, it's not a finding, it's a guess. Don't pattern-match from training data and assume the problem exists.

---

## Phase 1: Map

Before investigating anything, understand the whole system. You can't judge a part without knowing the whole.

### 1a. Project Orientation

Read in this order:
1. `README.md`, `CLAUDE.md`, `PROJECT_STATE.md`, `_notebook/_index.md` — whatever project docs exist
2. Package manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, etc.)
3. Project root directory structure
4. Entry points — where does execution start?
5. Config files — what's configured, what's the infrastructure?

From this, establish:
- **What this project is** — one sentence
- **Stack** — language, framework, runtime, key dependencies
- **Architecture pattern** — monolith, microservices, monorepo, library, CLI, etc.
- **Maturity signals** — tests exist? CI configured? Types strict? Linting? Documentation?
- **Scale signals** — how big is this codebase? How many contributors? How active?

### 1b. Architecture Map

Build a mental model of the system's layers and components:

- **Entry points** — routes, handlers, CLI commands, event listeners, cron jobs
- **Business logic** — services, models, domain logic
- **Data layer** — database, ORM, cache, file storage
- **External boundaries** — third-party APIs, webhooks, message queues
- **Shared infrastructure** — auth, logging, error handling, middleware, config
- **Key data flows** — trace 2-3 critical paths from entry to exit

Don't write this down as a document. Hold it as context for everything that follows. You need it to judge whether a problem is isolated or systemic.

### 1c. Scope Check

**Full project vet (no scope argument):** Proceed through all phases for the entire codebase. Prioritize the critical paths identified in 1b.

**Scoped vet (path or area specified):** Focus investigation on the specified area but still read enough of the surrounding system to understand the context. A scoped vet should still understand what calls into and out of the scoped area.

State what you're vetting in one line, then proceed. No preamble.

---

## Phase 2: Investigate

Two passes. The first pass covers ground. The second goes deep on what the first pass found.

### Pass 1: Survey

Scan the codebase across six categories. You're looking for signals, not writing the report yet. Move fast, flag things, keep going.

**Structural** — architecture and design
- Wrong-layer solutions (UI logic in the data layer, business rules in components, etc.)
- Circular dependencies or tightly coupled modules
- God objects/files — not just "this file is big" but specifically: files that own multiple unrelated concerns, files that everything imports, files where a change to one feature risks breaking another. When flagging, identify the distinct responsibilities the file is holding and what the natural boundaries would be.
- Premature or missing abstractions
- Inconsistent patterns (same problem solved 3 different ways)
- Dead modules — imported nowhere, wired to nothing
- Legacy/fallback code paths that should be singular — old and new implementations coexisting, migration shims that outlived the migration, feature flags nobody toggles, fallback chains where only one path is ever taken

**Correctness** — logic and behavior
- Edge cases that aren't handled (null, empty, zero, negative, boundary values)
- Race conditions or ordering assumptions
- State management bugs (stale state, missing updates, inconsistent state)
- Off-by-one errors, incorrect comparisons
- Assumptions about data shape that aren't validated
- Functions that don't do what their name says
- Stub implementations — functions that pretend to work but don't. Hardcoded returns in production paths, auth/validation that always passes, `connect()` that doesn't connect, handlers that log and return without doing anything. Name says save, body doesn't persist. Name says validate, body returns true. If the function's name promises something the body doesn't deliver, it's a stub.
- Config that does nothing — constructors that accept parameters but ignore them (`RateLimiter(max: 100)` that never counts), initialization methods that are no-ops, settings that aren't read

**Security** — attack surface and data safety
- Injection points (SQL, command, XSS, template)
- Auth/authz gaps (missing checks, privilege escalation paths)
- Sensitive data exposure (logs, error messages, API responses)
- Insecure defaults (permissive CORS, missing rate limits, debug mode in prod config)
- Dependency vulnerabilities (known CVEs in locked versions)
- Secrets in code or config committed to repo

**Reliability** — failure handling and resilience
- Swallowed errors (empty catch blocks, ignored promise rejections)
- Generic error handling that hides root cause
- Defensive programming that serves no purpose — try/catch around code that can't throw, error handling that catches and re-throws identically, fallback values that mask real failures. Defensive code is justified at boundaries (user input, external APIs, deserialization). Everywhere else, ask: what error is this actually catching? If the answer is "nothing specific," it's noise that hides real failures when they happen.
- Missing error paths in critical flows (what happens when the DB is down? when the API returns 500?)
- No retry/backoff on external calls that can fail
- Resource leaks (unclosed connections, uncleared intervals, missing cleanup)
- Missing timeouts on external calls

**Performance** — efficiency and scalability
- N+1 query patterns
- Unbounded operations (loading all records, no pagination)
- Unnecessary re-renders or recomputations
- Missing indexes (if schema is visible)
- Expensive operations in hot paths (serialization in a loop, regex compilation per call)
- Large bundle includes or heavy dependencies for simple tasks

**Hygiene** — code health and maintainability
- Dead code (unused functions, unreachable branches, commented-out blocks)
- Unused dependencies in the manifest
- Type safety gaps (any casts, missing types at boundaries, type assertions hiding problems)
- Scattered type definitions — the same data shape defined in multiple places, drifting over time. Types that should be shared from a single source but are instead reinvented per-file.
- Hardcoded values that should be configuration
- Copy-pasted code that should be shared (only if it's genuinely causing maintenance burden, not premature DRY)
- Outdated patterns when the framework has a better current approach
- AI-generated noise — comments that narrate the build process instead of explaining the code (`// replaced old auth with new system`, `// this handles the edge case we discussed`, `// improved version of the above`), TODO comments with no actionable content, comments that restate what the code already says. Remove or replace with comments that help a new reader understand why, not what happened during development.

### How to scan

Read files methodically. Don't skim — the bugs that matter are the ones that look fine on first glance.

**Let the architecture map drive the order.** Start with whatever is most critical in this specific codebase — the entry points and data flows you identified in Phase 1b. A web API, a utility library, a CLI tool, and a monorepo all have different shapes; follow the shape, don't impose a fixed sequence. The principle: start where breakage hurts the most, then work outward.

For a scoped vet: Start with the specified area, then trace one level out in each direction (callers and callees).

**For large codebases (100+ source files):** You can't read everything in one pass. Prioritize the critical paths from Phase 1b, scan shared infrastructure that everything depends on, then sample representative files from other areas. Be explicit in the report about what you covered thoroughly vs. what you sampled. A focused vet on the areas that matter beats a shallow skim of everything.

**Don't flag style issues.** Formatting, naming conventions, comment style — these are not findings unless they cause actual confusion or bugs. A variable named `x` in a 3-line utility is fine. A variable named `x` in a 200-line function processing financial data is a finding.

**Don't flag theoretical risks.** "This could be a problem if the project scales to 10M users" is not a finding unless the project is actually approaching that scale. Judge based on current reality, not hypothetical futures.

### Pass 2: Deep Investigation

Take every signal from pass 1 and verify it. This is where you separate real problems from false positives.

For each flagged signal:
1. **Read the surrounding code.** Maybe the edge case IS handled — three files over.
2. **Trace the callers.** Maybe the function is only called from one place with pre-validated data.
3. **Check the tests.** Maybe there's a test that covers this exact case.
4. **Check the git history** if needed. Maybe this was an intentional decision with context you're missing.
5. **Verify the fix is real.** If you can't articulate a concrete fix, the finding isn't ready.

Drop anything that doesn't survive verification. False positives in the report undermine trust in the real findings.

---

## Phase 3: Report

Present findings to the user. This is the most important output — it determines whether the user trusts the vet and acts on it.

### Structure

```
## Vet Report: [project name or scope]

### Summary
[2-3 sentences: overall health assessment. Honest, direct. Not diplomatic — accurate.]
[Total findings: N (P0: n, P1: n, P2: n, P3: n)]

### P0 — Will Break
[Things that are actively broken or will break under normal use]

### P1 — Will Bite
[Things that work now but will cause real problems soon — bugs waiting to surface, security gaps, reliability holes]

### P2 — Will Slow You Down
[Technical debt, maintainability issues, performance problems that aren't critical yet]

### P3 — Worth Knowing
[Minor issues, hygiene, nice-to-haves]
```

### Per-finding format

Every finding follows this structure:

```
**[Category] [Short description]**
`file/path.ts:42`

[1-2 sentences: what the problem is and why it matters]

'''
[actual code snippet showing the problem — keep it short, just enough to see the issue]
'''

**Fix:** [Concrete description of what to do. Not "consider improving" — what specifically to change.]
```

### If the project is healthy

Not every vet uncovers a list of problems. If investigation turns up only minor issues — a couple of P3 nits, nothing structural — say so directly. Short report, honest assessment, done. Don't inflate findings to justify the invocation. "This codebase is in good shape. Here are 2 minor things" is a valid vet result, and a valuable one — the user now has confidence, not just an empty report. Skip Phases 4-5 if there's nothing worth fixing.

### Report rules

**No vague findings.** "Error handling could be improved" is not a finding. "`src/api/users.ts:67` — catch block swallows the database connection error, returns 200 to the client. The user thinks their profile saved but it didn't." — that's a finding.

**No padding.** If you found 3 real problems, report 3. Don't inflate to 15 by flagging style nits. A short report with real findings beats a long report the user stops reading.

**No hedging on severity.** If you're not sure it's P0, it's not P0. Err toward lower severity — better to have the user escalate something than to cry wolf.

**Acknowledge what's good.** If the codebase handles something well — especially something that's commonly screwed up — say so briefly in the summary. This isn't flattery, it's calibration. The user needs to know you understand the codebase, not just that you can find fault.

**Be honest about coverage.** If you couldn't thoroughly investigate an area (too large, too complex, needed runtime testing), say so. "I scanned the API layer thoroughly but only did a surface pass on the worker jobs — those would benefit from a focused vet." Incomplete coverage honestly stated is more useful than false confidence.

---

## Phase 4: Plan

After presenting the report, build a fix plan. Don't wait for the user to ask — propose it immediately after the report.

### 4a. Group and Order

Fixes rarely map 1:1 to findings. Group related findings into fix batches:

- **Foundation fixes first.** If auth is broken, fix auth before fixing the routes that depend on auth.
- **Dependency order.** If finding A blocks finding B, A comes first.
- **Batch related changes.** If 3 findings are all in the same module, fix them together.
- **P0 before P1 before P2.** Within the same dependency level, severity wins.

### 4b. Research Where Needed

Some fixes require information you don't have:
- The current API for a library the project uses
- The correct pattern for the framework version installed
- Whether a dependency has a known fix for a vulnerability

When this happens, research before proposing the fix. Use context7, official docs, or web search. Don't guess at API signatures or framework patterns — look them up. State what you researched and what you found.

### 4c. Present the Plan

```
## Fix Plan

### Batch 1: [name — what this fixes]
- [ ] [specific change 1]
- [ ] [specific change 2]
- [ ] [specific change 3]
Affects: [files]
Risk: [low/medium/high — based on blast radius]

### Batch 2: [name]
...

### Deferred
[Findings that need user input, design decisions, or are too risky to fix without discussion]

### Out of Scope
[Things vet found that belong to other skills — "test coverage gaps → /fortify", "stub implementations → /no-stubs"]
```

### 4d. Get Alignment

The plan is a proposal, not a mandate. Present it and ask:

> "This is what I'd fix and in what order. Anything you want to reprioritize, skip, or add context to before I start?"

Wait for the user. **Expect the plan to change.** This is consistently where the most important context surfaces — "that file is getting replaced next week," "we're living with that because X," "actually the priority is Y." A finding you rated P1 might be P0 because of context you lack, or P3 because it's about to be deprecated.

When the user gives context that changes the plan, update it visibly. Don't just mentally adjust — restate what changed so both sides are working from the same plan. Then proceed.

This is the collaborative element. Vet brings the investigation and the expertise. The user brings the context and the final call.

---

## Phase 5: Execute

Work through the plan batch by batch. This is implementation, held to the same standard as the investigation.

### Execution rules

**One batch at a time.** Complete a batch, verify it, then move to the next. Don't scatter changes across the codebase and hope they all work together.

**Fix at the right layer.** If the finding is "validation is missing at the API boundary," fix it at the boundary — don't add defensive checks in every downstream function.

**Fix the system, not the instance.** If you find a null check missing in one handler, check if the same pattern exists in other handlers. Fix the pattern, not the single occurrence. But don't expand scope without telling the user — "I found this same issue in 4 other handlers, fixing all of them."

**Don't introduce new problems.** Every fix should be minimal and precise. Read the callers before changing a signature. Check what tests exist before changing behavior. A fix that breaks something else is not a fix.

**Research before writing.** If a fix involves a library API, framework pattern, or external service — verify the current approach before writing code. Check the version in the lockfile, read the docs for that version. Don't write code against an API from training data that may not match the installed version.

**Verify each batch.** After completing a batch:
1. Run the project's test suite if it has one
2. Run type checking if the project uses it
3. Check that the fix actually addresses the finding (re-read the code, trace the path)
4. If you can't verify programmatically, state what you checked manually and what the user should verify

### When to pause and check in

Stop and ask the user when:
- A fix is more complex than expected — the "simple fix" turned into a refactor
- You discover something new that changes the plan
- The fix requires a design decision (multiple valid approaches)
- You're about to change a public API or interface contract
- The blast radius is larger than anticipated

Frame it specifically: "Batch 2 is more involved than I expected — [why]. Options: [A] or [B]. Which direction?"

### Progress updates

After each batch, briefly state what was fixed and what's next. Don't over-narrate — the user can read the diffs. Just enough to track progress:

> "Batch 1 done — auth middleware now validates tokens properly, fixed the 3 routes that bypassed it. Moving to batch 2 (error handling in the API layer)."

---

## Phase 6: Verify

After all planned fixes are applied:

### 6a. Re-scan targeted areas

Re-read the code you changed. Verify each original finding is actually resolved — not just patched but properly fixed. If a fix introduced a new pattern, check that it's consistent with the rest of the codebase.

### 6b. Run the project's checks

Whatever the project has — tests, type checking, linting, build step — run it. Everything should pass. If something fails:
- Test was asserting old (broken) behavior → update the test
- Fix actually broke something → investigate and repair, don't just revert

### 6c. Closing summary

Brief. What was found, what was fixed, what remains.

```
## Vet Complete

**Found:** [N] issues ([breakdown by severity])
**Fixed:** [N] ([list the significant ones])
**Deferred:** [N] ([why — needs user decision, out of scope, etc.])
**Handed off:** [e.g., "Test coverage gaps identified — run /fortify to address"]

**Codebase health:** [one honest sentence — is this codebase in good shape now? what's the biggest remaining risk?]
```

---

## Behavioral Rules

1. **Thoroughness is the point.** Don't rush pass 1 to get to the report. Don't skip pass 2 verification to save time. The user invoked `/vet` because they want every real problem found. A fast, shallow vet is worthless.

2. **Evidence or it didn't happen.** Every finding has a file path, line number, and code snippet. Every fix recommendation is specific enough to implement. "The auth layer has issues" is not a finding. Show the code.

3. **Judgment over volume.** 5 real findings beat 30 that include style nits and theoretical concerns. The user's attention is finite. Spend it on things that matter.

4. **Don't fix what isn't broken.** If code is ugly but correct and well-tested, that's not a finding. Vet is about health, not aesthetics. Working code that's hard to read is a P3 at most.

5. **Collaborative, not authoritative.** The report and plan are proposals. The user has context you don't. Present your findings with confidence, but respect that some "findings" may be intentional decisions. When the user says "that's deliberate," accept it and move on.

6. **Route to specialists when appropriate.** Vet finds and fixes problems across the board — including stubs, fake code, and AI slop. But some findings are better served by dedicated skills: if the problem is "no tests" → note it, hand off to `/fortify`. If a finding needs pre-build research → use `/recon`. Vet handles everything else directly.

7. **Honest about uncertainty.** If you're not sure something is a problem, say so and explain why it might be. "This looks like it could race under concurrent requests, but I can't verify without runtime testing" is more useful than either silently skipping it or reporting it as confirmed.

8. **Proportional response.** A hobby project with 10 files doesn't need the same rigor as a production API handling payments. Read the maturity signals from Phase 1 and calibrate accordingly. Still be thorough — but don't P0 a missing rate limiter on a personal blog.

9. **Finish what you start.** If you report a finding, you should be prepared to fix it. Don't identify problems you can't solve. If a fix is beyond your capability (requires infrastructure changes, needs credentials, requires human judgment), say so explicitly in the plan rather than leaving it as an open finding.

10. **Remember you can be wrong.** The investigation is thorough, but you're working from static analysis and code reading. Runtime behavior, deployment context, and user intent can all invalidate your findings. Hold your conclusions firmly but not rigidly. When evidence contradicts your finding, update — don't defend.
