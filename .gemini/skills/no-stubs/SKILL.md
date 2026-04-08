---
name: no-stubs
status: published
description: >
  Scan a codebase for stub implementations, fake code, and dead wiring — then fix or remove them.
  Stubs are functions that pretend to work (hardcoded returns, TODO placeholders, unconnected modules,
  auth that always passes, endpoints that do nothing). This skill hunts them, triages by blast radius,
  and either implements the real thing or cleanly removes the dead code. Use when: (1) user says
  "/no-stubs", "find stubs", "audit for fake code", "check for placeholder implementations",
  (2) codebase was built with AI assistance and may contain silent stub failures, (3) user wants
  to verify every function does what its name implies, (4) preparing for production and needs to
  ensure nothing is faked. NOT for: writing new tests (that's /fortify), cleaning up CLAUDE.md
  (that's /cleanse), or general code review.
user_invocable: true
trigger: /no-stubs
argument-hint: "[scan | fix | full] — default: full"
arguments:
  - name: mode
    description: >
      "scan" = detect and report only, no changes.
      "fix" = assume scan is done, start fixing from the report.
      "full" or omitted = scan + triage + fix + verify.
    required: false
---

# /no-stubs — Kill Fake Code

Scan a codebase for stub implementations, triage by severity, and replace them with real code or remove them cleanly. Every function should do what its name says — right now, not eventually.

## What counts as a stub

A stub is code that **pretends to work but doesn't**. Context matters — not every `pass` or `return {}` is a stub. Apply judgment.

**Definitely stubs:**
- Functions returning hardcoded/fake values in production paths (`return {"status": "ok"}` that doesn't actually save anything)
- Async functions that `await sleep()` and return fake output
- Routes/handlers that exist but perform no real operation
- Auth/validation/security layers that always pass without checking
- `# TODO: implement this` inside code paths that are actively called
- Config or manifests referencing skills, tools, or services that don't exist
- Modules that are implemented but never imported or wired up anywhere
- Functions that accept configuration/parameters but ignore them entirely (a `connect()` that flips a boolean without using any connection string, a rate limiter constructor that takes `max_requests` but never enforces it)
- Lifecycle/initialization methods that are no-ops (`startup` hooks with only `pass`, `connect` methods that don't connect to anything, `disconnect` that doesn't clean up)

**Not stubs (don't flag these):**
- Abstract methods, protocol definitions, interface contracts (`pass` in an ABC is correct)
- Test mocks and fixtures (stubs in tests are fine — that's their job)
- Intentional no-ops with clear documentation (e.g., null object pattern)
- Feature flags that deliberately disable code paths
- Type stubs (`.pyi` files, `declare module`)
- Genuinely empty handlers that are supposed to be empty (health checks that return 200)

## When NOT to use this skill

- Codebase is a prototype or spike explicitly meant to have placeholders → ask first
- User just wants to write tests → `/fortify`
- User wants to clean config files → `/cleanse`
- File is a test file or test fixture → test stubs are fine

---

## Phase 1: Scan

### 1a. Detect Language and Framework

Read the project root. Identify:
- Language(s), framework(s), runtime
- Project structure (monorepo, single app, library)
- Entry points (where does execution start?)

This determines what stub patterns to look for and how to distinguish stubs from legitimate patterns.

### 1b. Pattern Scan

Search the entire codebase for stub indicators. Adapt patterns to the detected language.

**Universal indicators** (search across all languages):
- `TODO`, `FIXME`, `HACK`, `XXX`, `PLACEHOLDER` in non-test files
- Functions whose body is only a return of a literal value (string, number, empty object/array)
- Empty function bodies (`pass`, `return`, `return undefined`, `return nil`, `{}`)
- Commented-out logic with no replacement
- Constructor/init that accepts config params but stores none or ignores them
- `connect`/`initialize`/`setup` methods that don't establish real connections
- Dependencies listed in package manifest but never imported (signals planned-but-unbuilt features)

**Language-specific indicators:**

| Language | Stub patterns |
|----------|--------------|
| Python | `pass` in non-abstract methods, `raise NotImplementedError` in concrete classes, `async` functions with only `await asyncio.sleep`, bare `return None` in functions that should return data |
| TypeScript/JS | `return undefined`, `return null`, `return {}`, `return []`, `() => {}` assigned to handlers, `console.log` as the only operation in a handler, `as any` casts hiding incomplete types |
| Go | `return nil, nil` in functions that should return data+error, empty struct methods, `panic("not implemented")` |
| Rust | `todo!()`, `unimplemented!()`, `panic!("not implemented")` in non-prototype code |
| Ruby | `raise NotImplementedError` in concrete classes, empty method bodies |
| Swift | `fatalError("not implemented")`, empty closure bodies |

**Structural indicators** (require reading call graphs):
- Imports that reference non-existent modules or files
- Functions defined but never called (dead code that was supposed to be wired up)
- Config/manifest entries pointing to non-existent resources
- Middleware or decorators that are defined but not applied
- Event handlers registered but with empty callbacks
- API routes defined but pointing to stub controllers

### 1c. Contextual Filtering

For each candidate stub, determine if it's actually fake:

1. **Is it in a production code path?** Trace from entry points. A stub in dead code is just dead code (still flag it, lower priority). A stub in an active request path is dangerous.
2. **Is there a real implementation elsewhere?** Search the codebase. Sometimes the real code exists but the wrong version is imported.
3. **Is it intentionally empty?** Check for comments explaining why, check if it implements an interface that allows empty implementations, check if it's a hook/callback that's optional.
4. **Does the function name promise something the body doesn't deliver?** `saveUser` that doesn't touch a database. `validateToken` that returns `true`. `sendEmail` that logs and returns. Name-body mismatch is the strongest stub signal.
5. **Does it accept parameters it never uses?** A `connect(url)` that ignores `url`. A `RateLimiter(max_requests=100)` that never counts requests. Config-that-does-nothing is a strong stub signal — it creates the illusion of configurability.

### 1d. Produce the Scan Report

Group findings by severity. Be specific — show the file, line, function name, and what's wrong.

```
## Stub Scan Report

### Summary
- Files scanned: [N]
- Stubs found: [N] (P0: [n], P1: [n], P2: [n], P3: [n])
- Dead wiring: [N] (defined but unconnected modules)
- Dead references: [N] (config/imports pointing to nothing)

### P0 — Critical (security, auth, data integrity)
Stubs that could cause real damage in production.

| File:Line | Function | Issue |
|-----------|----------|-------|
| src/middleware/auth.ts:24 | `validateToken` | Returns `true` without checking token |
| src/routes/settings.ts:15 | `saveSettings` | Returns `{"status": "ok"}` without persisting |

### P1 — High (core business logic)
Stubs in active code paths that affect core functionality.

[table]

### P2 — Medium (secondary features, utilities)
Stubs in less-critical paths.

[table]

### P3 — Low (dead code, TODOs in non-critical paths)
Stubs that aren't actively harmful but add noise.

[table]

### Dead Wiring
Modules implemented but not connected anywhere.

[table]

### Dead References
Config, imports, or manifests pointing to non-existent things.

[table]
```

**Stop here if mode is `scan`.** Show the report, then ask: "Want me to fix these?"

**For `full` mode:** Show the report, then immediately proceed to Phase 2. Don't wait for confirmation — the user invoked `full` because they want it handled. If any stubs require user input (external service decisions, missing credentials), batch those questions and ask them all at once before starting fixes.

---

## Phase 2: Plan the Fix

Before touching code, understand the project and plan the remediation order.

### 2a. Understand the Project

Read the project's README, CLAUDE.md, package manifest, and any config files. Understand:
- What does this project do? Who is it for?
- What infrastructure is already in place? (database ORM, auth library, email provider, etc.)
- What dependencies are installed but unused? (These hint at intended-but-unbuilt features.)

This context determines HOW to fix stubs. If Prisma is set up, database stubs should use Prisma. If `stripe` is in deps, payment stubs should use the Stripe SDK. Don't introduce new dependencies when the intended one is already declared.

### 2b. Map the Dependency Graph

Stubs often form chains: fake auth → every route that depends on auth is also fake. Fix in dependency order:
1. Foundation stubs first (database connections, auth middleware, config loaders)
2. Service stubs next (the things routes/components call)
3. Route/handler stubs last (these often resolve automatically once services are real)

### 2c. Assign Fix Strategy

For each stub, determine the remediation:

1. **Implement** — Write the real code. Intent is clear, dependencies are available.
2. **Wire** — Real implementation exists elsewhere in the codebase. Connect it.
3. **Remove** — Stub serves no purpose. Remove it AND all references (callers, imports, config, route registrations).
4. **Ask** — Can't determine correct implementation without user input. Batch these questions.

---

## Phase 3: Fix

Work in dependency order within priority tiers: all P0 first, then P1, P2, P3. Within each tier, fix foundation → services → routes.

### Fix Rules

1. **Implement the real thing.** When replacing a stub, write the actual working code. If you don't know what service to call or what DB to hit, ask — do not write another stub.

2. **Match signatures exactly.** When wiring up existing implementations, verify the function signature matches every call site. Fix mismatches everywhere, not just at the definition.

3. **Remove cleanly.** When removing a stub, also remove:
   - All imports of the stubbed function/module
   - All call sites (replace with the real thing or remove the calling code)
   - Config entries, route registrations, manifest references
   - Test files that only test the stub (unless the tests are good and should test the real implementation)

4. **Don't create new stubs while fixing old ones.** If implementing a real function requires a dependency that doesn't exist yet, stop and ask. Never write `// TODO: implement later` while killing other TODOs.

5. **Preserve the contract.** The fix must honor the function's existing signature, return type, and expected behavior. Callers shouldn't need to change unless the stub's signature was itself wrong.

6. **Batch by dependency.** Fix related stubs together — a stubbed service and the route that calls it should be fixed in the same batch.

### Fix Process (per batch)

1. Read the stub and all its callers
2. Search for existing real implementations in the codebase
3. Implement or wire up the fix
4. Verify the fix compiles / has no syntax errors
5. If tests exist, run them
6. Move to next batch

### When to Ask Instead of Fix

Stop and ask the user when:
- The stub wraps an external service and you don't know which one (payment provider, email service, etc.)
- The stub involves credentials, API keys, or secrets you don't have
- The correct behavior is ambiguous — the function name could mean multiple things
- Fixing the stub requires a design decision (database schema, API contract, state management approach)
- The stub is in a shared library used by multiple services

Frame the question specifically:
```
Can't auto-fix: `sendNotification` in src/services/notify.ts
This calls an external notification service but I can't determine which one.
Options: (1) Email via SendGrid/SES, (2) Push via FCM/APNs, (3) SMS via Twilio, (4) Remove entirely
Which approach?
```

---

## Phase 4: Verify (full mode only)

After all fixes are applied:

### 4a. Re-scan

Run the same scan from Phase 1. The report should show zero P0/P1 stubs. Any remaining stubs should be P3 or explicitly approved by the user.

### 4b. Run Tests

If the project has tests, run them. All tests should pass. If a test fails:
- The test was testing stub behavior (expected fake data) → update the test
- The fix broke real functionality → revert and investigate

### 4c. Final Report

```
## No-Stubs Complete

### Fixed
- P0: [N] stubs resolved ([list])
- P1: [N] stubs resolved ([list])
- P2: [N] stubs resolved ([list])
- P3: [N] stubs resolved ([list])

### Actions Taken
- Implemented: [N] (wrote real code)
- Wired: [N] (connected existing implementations)
- Removed: [N] (deleted dead code + references)
- Skipped: [N] (user decision needed — listed below)

### Needs User Input
[List any stubs that couldn't be auto-fixed with specific questions]

### Remaining
[Any intentionally kept stubs with justification]

### Prevention
To keep stubs from coming back:
- Every function must do what its name says
- Never create a function without implementing it in the same session
- If you can't implement it, don't create it — ask instead
```

---

## Prevention Mode

During and after the fix session, enforce these rules in all code written:

1. **No function without implementation.** Don't create it unless you're implementing it now.
2. **No fake returns.** Every return value must be real data from a real operation.
3. **No unconnected modules.** If you write a module, wire it into its caller.
4. **No silent auth bypasses.** Every auth/validation check must actually check.
5. **Every reference must resolve.** Config entries, imports, manifests — all must point to real things.
6. **Signature consistency.** Call sites must match function signatures. Always verify before calling.
7. **When unsure, ask.** "I don't know how to implement X. Options: [list]. Which?" is always better than a stub.

---

## Behavioral Rules

1. **Judgment over grep.** Pattern matching finds candidates. Context determines if they're actually stubs. A `return {}` in a health check endpoint is fine. A `return {}` in `getUserProfile` is a stub.

2. **P0 always gets fixed.** Even if the user says "just scan", flag P0 stubs with an explicit warning. Auth and security stubs are too dangerous to leave.

3. **Don't break things to fix things.** If removing a stub would cascade into breaking half the app, fix incrementally. Wire up a real implementation rather than ripping out the stub and leaving a hole.

4. **Stubs in AI-generated code are the norm, not the exception.** Expect them. AI agents routinely generate stub implementations to "complete" tasks. This is the primary use case — auditing AI-generated codebases before production.

5. **Dead code is a separate problem from stubs.** A stub pretends to work. Dead code just sits there. Both are bad, but stubs are worse because they create false confidence. Prioritize stubs over dead code.

6. **One pass is not enough for large codebases.** If the project has >50 source files, work in layers: entry points first, then services, then utilities. Stubs in entry points (routes, handlers, main) are most dangerous.
