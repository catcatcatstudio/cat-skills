---
name: fortify
status: published
description: >
  Testing infrastructure, coverage, and verified test quality for any project. Detects
  stack, installs testing ecosystem, audits untested critical paths, writes thorough tests
  weighted toward error paths, runs them, verifies via mutation testing. Use when user
  says '/fortify', 'add tests', 'set up testing', 'I need tests', 'test this', or wants to
  audit coverage. NOT for: running existing tests directly or improving prompt quality.
user_invocable: true
trigger: /fortify
argument-hint: "[setup | check | full]"
arguments:
  - name: mode
    description: >
      "setup" = install testing infra only.
      "check" = audit gaps and report, don't write tests.
      "full" or omitted = setup + audit + write + run + verify.
    required: false
---

# /fortify — Testing That Proves Your Code Works

Drop into any project, detect its stack, install the professional testing ecosystem, write thorough tests, run them until green, and verify they catch real bugs. The output isn't test files — it's proof your code works.

## When NOT to use this skill

- Project has comprehensive, verified test coverage already → run the tests, don't re-fortify
- You just need to run existing tests → `npm test` / `pytest` / whatever directly
- You want to review build plans or design docs → `/architect`
- You want to optimize a skill's prompt quality → that's eval optimization, different thing

---

## Quick Reference

| Mode | What happens |
|------|-------------|
| `/fortify` or `/fortify full` | Detect → Install → Audit → Write → **Run → Verify** → Report |
| `/fortify setup` | Detect → Install → Done |
| `/fortify check` | Detect → Audit → Report gaps → Done (no installs, no test writing) |

The difference from just asking Claude to "add tests": Phases 6 and 7. Tests that aren't run are fiction. Tests that don't catch bugs are theater.

---

## Phase 1: Detect

Read the project root. Identify everything about the stack.

### 1a. Package Manifests

Read all of these that exist:
- `package.json`, `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb`
- `pyproject.toml`, `setup.py`, `setup.cfg`, `Pipfile`, `requirements.txt`
- `Cargo.toml`, `go.mod`, `Gemfile`, `composer.json`
- `build.gradle`, `pom.xml`, `Package.swift`, `mix.exs`, `pubspec.yaml`

### 1b. Framework Detection

From the manifest and source files, identify:
- **Language(s):** TypeScript, Python, Rust, Go, Swift, etc.
- **Framework(s):** Next.js, React, Vue, Svelte, Express, FastAPI, Django, Rails, etc.
- **Runtime:** Node, Bun, Deno, CPython, etc.
- **Package manager:** npm, pnpm, yarn, bun, pip, poetry, cargo, etc.
- **Existing test setup:** Check for test config files, test directories, test scripts

### 1c. Domain Detection

Scan the codebase to identify what types of code exist:

| Signal | Domain |
|--------|--------|
| Route handlers, controllers, API files | API endpoints |
| ORM models, migrations, schema files | Database layer |
| Fetch calls, SDK clients, webhook handlers | External API integrations |
| React/Vue/Svelte components | UI components |
| CLI entry points, arg parsing | CLI tools |
| WebSocket handlers, SSE, real-time | Real-time |
| Queue workers, cron jobs, async tasks | Background jobs |
| Auth middleware, session handling, token logic | Auth/security |
| State machines, workflow engines | State machines |
| File upload/download, media processing | File I/O |
| Cache layers, memoization | Caching |
| Config loaders, env parsing, feature flags | Configuration |

### 1d. Common Bug Research

Before moving on, research what commonly goes wrong for this specific stack. This isn't generic — it's targeted:
- What bugs do [framework] apps commonly ship?
- What are the known gotchas for [ORM/DB layer]?
- What are the "works in dev, breaks in production" patterns for this stack?

If `_docs/pitfalls.md` exists (from `/recon`), read it — it contains pre-researched intelligence about this project's domain.

Use these findings to inform what to test for in Phase 5 — test for bugs that commonly appear in projects like this, even if the code doesn't obviously have them yet.

### 1e. Report Detection Results

State clearly:

```
Stack: [language] + [framework] on [runtime]
Package manager: [manager]
Domains found: [list]
Existing test setup: [what exists, or "none"]
Common pitfalls for this stack: [top 3-5 from research]
```

If existing test setup is found, read the config and understand what's already configured before changing anything.

---

## Phase 2: Install

### 2a. Determine the Testing Ecosystem

For the detected stack, identify the complete professional testing toolchain:

- **Test runner:** vitest, jest, pytest, go test, cargo test, etc.
- **Assertion library:** built-in or chai, should, etc.
- **Component testing** (if UI): @testing-library/react, Vue Test Utils, etc.
- **API testing:** supertest, httpx, net/http/httptest, etc.
- **Mock/stub tools:** built-in mocking, MSW, nock, responses, etc.
- **HTTP mocking** (if external APIs): MSW, nock, responses, httpmock, etc.
- **Coverage:** v8, istanbul, coverage.py, tarpaulin, etc.
- **Testing-specific lint rules:** eslint-plugin-testing-library, ruff PT rules, etc.

If a `references/` file exists for this stack in the skill directory, use it. Otherwise, use context7 to check current best practices for the framework's recommended testing approach.

### 2b. Present Before Installing

Show the user what you plan to install:

```
## Testing Ecosystem for [stack]

### Test Runner: [tool] — [why]
### Libraries: [list with purposes]
### Mocking: [list with what each mocks]
### Coverage: [tool and config approach]
```

Ask: "This is what I want to install. Anything to add or skip?"

Wait for confirmation.

### 2c. Install Dependencies

Add all testing dependencies as dev dependencies:
- Group logically (runner, libraries, mocks, coverage)
- Use compatible version ranges
- Respect existing lockfiles

### 2d. Configure

**Test runner config:**
- Test file patterns, module resolution (aliases, paths)
- Setup files if needed (global mocks, env vars, polyfills)
- Coverage config (thresholds starting at 60-70%, reporters)
- Environment settings (jsdom for React, node for APIs)

**Test scripts** in package manifest:
- `test` — run all tests
- `test:watch` — watch mode
- `test:coverage` — with coverage report

**Test directory structure** — follow existing conventions. If project has `__tests__/`, use it. If co-located tests, match that. Don't impose a structure.

### 2e. Verify Setup

Run the test command to verify:
- Runner starts and exits cleanly
- Config is valid
- No dependency conflicts

Fix anything that fails before moving on.

**Stop here if mode is `setup`.**

---

## Phase 3: Audit

Scan the entire codebase and identify what needs tests.

### 3a. Map All Code

For every source file, classify:
- **What it does** (route handler, component, utility, model, service, hook, middleware)
- **Blast radius** — if this breaks, what's the user impact? (P0: auth, payments, data mutation / P1: core features / P2: standard CRUD / P3: cosmetic, logging)
- **Complexity** — branching logic, async flows, state management
- **Has tests?** — check for corresponding test files
- **Known pitfall?** — cross-reference against common bugs from Phase 1d

### 3b. Produce the Audit with Priority Labels

Every item gets an explicit priority label:

```
## Test Coverage Audit

### P0 — Critical (test immediately)
- src/routes/auth.ts — handles login/register, high blast radius
- src/middleware/auth.ts — JWT verification, every request depends on this
- src/lib/validations.ts — data integrity boundary

### P1 — Important (test soon)
- src/components/PaymentForm.tsx — complex state, user-facing
- src/services/pricing.ts — business logic with edge cases

### P2 — Standard (test when possible)
- src/routes/users.ts — standard CRUD
- src/components/UserCard.tsx — simple display component

### P3 — Low priority
- src/utils/format.ts — formatting helpers

### Summary
[X] files, [Y] have tests, [Z]% coverage estimate
[N] P0 items need immediate testing
[M] known stack pitfalls to test for: [list]
```

**Stop here if mode is `check`.**

---

## Phase 4: Write Tests

Work through the priority list: all P0, then P1, then P2. Stop at P2 unless user asks for P3.

### The Error Path Rule

**For every function tested, error/edge-case tests must outnumber happy-path tests.** This is the single most important testing principle. Happy paths work because you test them by hand while developing. Bugs live in:
- What happens with empty/null/undefined input?
- What happens when a dependency is down?
- What happens with malformed data?
- What happens at boundary values?
- What happens with concurrent access?
- What happens when the user does something unexpected?

If you write 2 happy-path tests for a function, write at least 3 error-path tests. This ratio is enforced, not aspirational.

### Testing Standards

**Unit tests:**
- Every public function/method has at least one test
- Happy path + at least TWO unhappy paths per function
- Boundary values (empty string, zero, negative, null/undefined, max values)
- Type edge cases (unexpected types, missing fields)

**Integration tests:**
- Components work together correctly
- Data flows end-to-end through the pipeline
- Prior integrations still work (regression)

**Error path tests:**
- Dependencies unavailable (DB down, API unreachable, file missing)
- Malformed input (wrong types, missing fields, extra fields)
- Resource constraints (timeout, rate limit, large payload)
- Error messages are useful, not generic
- Security boundaries (unauthorized access, token expiry, privilege escalation)

**For each test file:**
1. Import the module under test
2. Set up fixtures/mocks at the top
3. Group tests by function or behavior (describe blocks)
4. Name tests as sentences: "returns 401 when token is expired"
5. Follow AAA pattern: Arrange → Act → Assert
6. Clean up after each test

### Domain-Specific Patterns

**API endpoints:** Test every status code the endpoint can return. Not just 200 — test 400, 401, 403, 404, 409, 422, 429, 500. Each is a different failure mode.

**Database:** Test CRUD, constraints, edge queries, concurrent access. Use transaction rollback or test containers for isolation.

**UI components:** Test rendering, interaction, accessibility. Query by role, not test ID.

**External APIs:** Test response handling, retry logic, timeouts, rate limits. Mock the HTTP layer.

**Auth:** Test EVERY auth path — valid credentials, invalid credentials, expired tokens, missing tokens, malformed tokens, insufficient permissions, role boundaries.

### Batching

Work in batches of 2-3 related files:
1. Write tests for the batch
2. Run them immediately (see Phase 5)
3. Fix any failures
4. Move to next batch

Do NOT write all tests then run them at the end. That's how you end up with 50 broken test files.

---

## Phase 5: Run Until Green

**This phase is mandatory. Tests that aren't run are fiction.**

After each batch from Phase 4:

1. **Run the test suite.** Execute the actual test command (`npm test`, `pytest`, etc.)
2. **If tests fail:** Read the error output. Fix the test (not the code — the test is wrong if the code works). Re-run.
3. **Loop until all tests pass with exit code 0.**
4. **Run coverage.** Check the coverage report. If critical paths (P0) have gaps, write more tests.

If dependencies aren't installed and you can't run tests, tell the user:
```
Tests written but I can't verify them — dependencies need to be installed first.
Run: [install command]
Then: [test command]
```

This is the fallback, not the default. Always try to run tests.

---

## Phase 6: Verify — Mutation Testing

**This phase is what separates real tests from test theater.**

After all tests are green, verify they actually catch bugs:

### 6a. Select Mutation Targets

Pick 3-5 P0 functions — the most critical code. For each:

### 6b. Break the Code

Make one small, realistic mutation:
- Comment out a validation check
- Swap `===` to `!==` or `>` to `<`
- Remove an error handler
- Change a return value
- Remove an auth check
- Swap the order of operations

These aren't random — they simulate real bugs. Pick mutations that would cause real user impact.

### 6c. Run Tests Again

Run the test suite. **The tests MUST fail.** If they don't, the tests are theater — they pass regardless of whether the code is correct.

### 6d. Fix or Add Tests

For each mutation that tests didn't catch:
1. The code has an untested critical behavior
2. Write a test that specifically catches this mutation
3. Revert the mutation
4. Run tests again — should be green
5. Re-apply the mutation — should be red
6. Revert the mutation (leave the code correct)

### 6e. Report Mutations

```
## Mutation Testing Results

### Mutations tested: [N]
### Caught by tests: [M] / [N]

| Code | Mutation | Caught? | Test that caught it |
|------|----------|---------|---------------------|
| auth.ts:24 | Removed token expiry check | Yes | "returns 401 when token is expired" |
| products.ts:55 | Changed price > 0 to price >= 0 | No → FIXED | Added "rejects product with price of 0" |
| ...
```

---

## Phase 7: Report

```
## Fortify Complete

### Installed
- [list of testing tools]

### Tests Written
- [X] test files, [Y] total test cases
- P0: [N] files tested ([list])
- P1: [N] files tested ([list])
- P2: [N] files tested ([list])
- Error path tests: [N] / Happy path tests: [M] (ratio: [N/M])

### Verification
- All tests passing: Yes/No
- Coverage: [X]% overall, [Y]% on P0 code
- Mutations tested: [N], caught: [M]/[N]

### Remaining Gaps
- [anything not tested and why]
- [any mutations that revealed weak test coverage — now fixed]

### How to Run
- `[test command]` — run all tests
- `[coverage command]` — run with coverage
- `[watch command]` — run in watch mode
```

---

## Behavioral Rules

1. **Don't duplicate existing setup.** If vitest is configured, don't install jest. If `__tests__/` exists, use it. The goal is testing, not reformatting.

2. **Test YOUR code, not dependencies.** Don't test that Prisma can insert a row. Test that your service method handles the result correctly.

3. **No test theater.** Every test must be capable of failing for the right reason. If you're unsure, break the code and check (that's Phase 6).

4. **Error paths > happy paths.** This ratio is enforced. If a function has 2 happy-path tests, it needs at least 3 error-path tests. Happy paths work because you tested them by hand. Bugs live in the sad paths.

5. **Run the tests.** Tests that aren't executed are fiction. Phase 5 is not optional. If you can't run them (missing deps), say so explicitly and tell the user exactly what to run.

6. **Mutations prove quality.** Phase 6 is what makes this skill worth invoking. Anyone can write test files. Proving they catch real bugs is the value.

7. **P0 first, always.** If you run out of context, the user has verified tests on the code that matters most.

8. **Coverage thresholds start low.** 60-70% on day one. Going from 0% to 65% is a massive win. Don't set 90% and create pressure to write garbage tests.

9. **Present before installing.** Show the user what you plan to install. They may have constraints you don't know about.

10. **Respect existing conventions.** Co-located tests? Keep co-locating. camelCase names? Match them. The goal is coverage, not your preferred structure.

11. **Check for recon.** If `_docs/pitfalls.md` or `_docs/security-notes.md` exist, read them. They contain pre-researched intelligence about common problems for this type of project. Use them to inform what to test for.
