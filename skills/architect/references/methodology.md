# Staged Build Methodology — Full Reference

## Why This Exists

The #1 failure mode when building software with AI agents: the agent gets a big plan, loses context partway through, and misses pieces. The code compiles but is incomplete. Features are half-implemented. Interfaces don't match. Tests are afterthoughts.

This methodology fixes that by atomizing the plan into stages small enough that the agent can hold one entirely in context, execute it without missing anything, and validate it before moving on.

## The Phases

```
Phase 0    Spike hardest constraint          → Validated YES/NO
Phase 1    Design notes (one per domain)     → Complete mental model
Phase 1.5  Spec-to-plan translation          → Sequenced build order
Phase 2+E  Write stages + build incrementally → Verify → commit → next
```

Phase 2 and Execute are interleaved, not sequential. Write 2-3 stage docs, build them, write the next batch. Never write all stage docs upfront — later docs based on unvalidated assumptions will be wrong.

## Phase 0: Technical Spike

Validate the hardest constraint with the smallest possible test.

**Process:**
1. Identify the riskiest technical assumption
2. Build the smallest possible test (< 50 lines) that gives a YES/NO answer
3. YES → proceed to Phase 1
4. NO → pivot or kill the idea before wasting time

**Examples:**
- "Can SurrealDB do vector search at the dimensions we need?" → 20-line script, test it
- "Can we get sub-100ms response from this API?" → Hit the endpoint, measure
- "Does this library work with our target runtime?" → Import it, call one function

**Gate:** PROJECT_STATE.md exists with validated constraint. No proceeding without this.

## Phase 1: Design Notes

Think through every domain of the project before writing any production code.

### Conversation Protocol

Each note is a collaborative artifact, not a monologue:

1. **Draft** a first-pass note based on what you know
2. **Present** key decisions and architecture to the user, flag uncertainties
3. **Ask** "What am I missing? What's wrong? What would you change?"
4. **Revise** based on feedback
5. **Confirm** "This note covers [domain]. Ready for [next domain]?"

### Domain Discovery

**Always required:**
- Data model / storage
- Core logic
- Interface (API, CLI, UI)
- Configuration

**Usually needed:**
- Authentication / authorization
- External service integrations
- Error handling strategy
- Deployment / infrastructure

**Sometimes needed:**
- Background jobs / queues
- Caching strategy
- Real-time / WebSocket layer
- Search
- File storage / media handling

### Note Structure

```
notebook/
├── 00-project-overview.md          # Vision, what we're building, why
├── 01-component-structure.md       # How the pieces connect
├── 02-[domain-a].md                # Deep dive on domain A
├── ...
├── NN-tech-stack.md                # Languages, frameworks, libraries (justified)
└── NN-project-status.md            # What's specced, what's remaining
```

### What Makes a Good Note

- **One topic per note.** "Memory System" is a note. "Memory System + Security + API" is three.
- **Architecture diagrams.** ASCII art is fine. Show data flows, connections.
- **Decisions with rationale.** Not just what we chose, but why, and what we rejected.
- **Open questions surfaced.** Every unknown identified now is a problem avoided mid-build.
- **Progressive depth.** Start high-level (vision, overview), go deeper into subsystems.

### Gate Check

All of these must be true:
1. `notebook/_index.md` exists listing all notes
2. At least one note per identified domain
3. Tech stack note with justified choices
4. No unresolved open questions that would block build planning
5. User confirms notes are complete

## Phase 1.5: Spec-to-Plan Translation

Convert design notes into a sequenced build order.

### Build Order Principles

- **Foundation first.** Project structure, config, health checks, basic plumbing.
- **Data layer before logic.** Can't build features without state storage.
- **Core abstractions before implementations.** Build the router before the routes.
- **Each stage independently testable.** If you can't verify without the next stage, the boundary is wrong.
- **Stubs establish contracts.** Early stages create stub interfaces for later stages.

### Deliverable Format

```
Stage 1:  Foundation & Setup         → Depends on: nothing
Stage 2:  Data Layer                 → Depends on: Stage 1
Stage 3:  Core Service Abstraction   → Depends on: Stage 1
Stage 4:  [Feature A]               → Depends on: Stage 2, 3
Stage 5:  [Feature B]               → Depends on: Stage 2, 3
Stage 6:  Integration & Polish       → Depends on: Stage 4, 5
```

### Gate Check

`build_plan/_build-order.md` exists with numbered stages, dependencies, and key outcomes. User has reviewed and approved.

## Phase 2 + Execute: Incremental Write-Build Loop

### Why Incremental

Writing all stage docs upfront means later docs are based on assumptions about earlier stages. Those assumptions will be wrong — APIs don't behave as expected, libraries have limitations, the data model evolves. Writing 2-3 stages ahead and then building keeps the docs grounded in reality.

### The Loop

```
1. Write stage docs for next 2-3 stages
2. Build those stages (verify, test, commit each)
3. Assess: does the build order still make sense?
   - YES → write next 2-3 stage docs
   - NO  → update _build-order.md, adjust remaining stages
4. Repeat until done
```

### What Makes Stage Documents Work

**Self-contained.** Executable with ONLY this document. No flipping between files.

**Full code, not pseudocode.** The agent types this code into files and verifies — not interpreting vague descriptions.

**Explicit stubs.** Interfaces that later stages implement are stubbed with contracts.

**Verification is mandatory.** Green checklist before next stage.

**Tests are first-class.** See `testing.md` for full obligations.

### When Things Break

**Test failure in current stage:** Fix before moving on. Never carry broken tests.

**Plan is wrong:** Stop. Update stage doc. Re-execute. Don't improvise.

**Prior stage bug:**
1. Stop current stage
2. Fix the broken stage, re-verify
3. Check if fix changes interfaces later stages depend on
4. Update affected stage docs if yes
5. Resume current stage

**Scope creep:** Not in the stage doc? It goes in a future stage or gets discarded.

## Anti-Patterns

| Anti-Pattern | Why It Fails | Instead |
|-------------|-------------|---------|
| Skipping Phase 0 | Discover infeasibility mid-build | Spike first, always |
| One giant plan document | Agent loses context, misses pieces | Atomize into stages |
| Writing all stage docs upfront | Later docs based on wrong assumptions | Write 2-3 ahead, build, repeat |
| Stages that depend on unbuilt stages | Can't verify, can't test | Each stage independently testable |
| Pseudocode in stage docs | Agent interprets wrong | Full runnable code |
| Skipping verification | Broken foundation carries forward | Green checklist before next stage |
| "We'll test later" | Bugs compound, debugging hell | Tests per stage, always |
| Improvising during build | Drift from plan, miss pieces | Build what the doc says |
| Not updating plans when reality changes | Plan diverges from code | Stop, update, re-execute |
| Fixing code without updating stage doc | Stage doc is now wrong, resume breaks | Always keep doc and code in sync |

## Scaling Tiers

| Tier | Signal | Phases | Notes |
|------|--------|--------|-------|
| **Light** | 1-2 components, < 500 lines | Phase 0 (quick) → 1-2 stage docs → Execute | Skip formal design notes |
| **Standard** | 3-8 stages, multi-component | All phases | Full methodology |
| **Heavy** | 8+ stages, multiple subsystems | All phases + milestones | Group stages into milestones of 3-4. Review plan at milestone boundaries. |
