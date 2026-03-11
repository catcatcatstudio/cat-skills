---
name: architect
status: published
description: >
  Staged build methodology for architecting and building software projects. Drives the full
  lifecycle: technical spike, design notes, build planning, and stage-by-stage execution with
  professional-grade testing. Use when: (1) user says "/architect", "architect this",
  "new project", "start a project", "build this from scratch", (2) user wants to plan and
  build a software project from scratch using a structured methodology, (3) user wants to
  resume an in-progress project that uses the staged build methodology, (4) user references
  the build methodology or staged build process. NOT for: quick scripts, one-off fixes, or
  tasks that don't warrant a full project structure. If the task is small enough to build
  in one shot without planning, just build it directly — don't force the methodology.
---

# Staged Build Methodology

Drive software projects through a structured lifecycle that prevents the #1 AI coding failure: losing context on a big plan and missing pieces.

## When NOT to use this skill

- Task is a quick script, one-off fix, or single-file change → just build it directly
- User wants to edit existing code, not plan a new project → edit directly
- Scope is entirely clear and fits in one session without a plan → skip the methodology
- User explicitly says "just do it" without wanting a plan → respect that

---

## Quick Reference

| Phase | What happens | Gate to pass |
|-------|-------------|--------------|
| 0 | Technical spike — validate riskiest constraint | PROJECT_STATE.md with validated constraint |
| 1 | Design notes — one per domain, no code | All domains covered, user confirms |
| 1.5 | Build order — dependency graph, stage sequence | _build-order.md reviewed + approved |
| 2+Execute | Write 2-3 stages → build → repeat | All tests green, stage committed |

Full methodology: `references/methodology.md` · Testing obligations: `references/testing.md` · Stage format: `references/stage-template.md`

---

**Core rule:** Never work from one giant plan. Atomize into stages small enough to hold entirely in context, execute correctly, and validate before moving on.

## Invocation

| Input | Action |
|-------|--------|
| Bare (`/architect`) | Ask: "New project or resuming an existing one?" |
| With project description | Assess scope (see Scaling Tiers), then start Phase 0 |
| `resume` or project name | Run Resume Protocol below |

## Scaling Tiers

| Tier | Signal | Phases Used | Notes |
|------|--------|-------------|-------|
| **Light** | Single feature, 1-2 files, < 500 lines | Phase 0 (quick) → Phase 2 (1-2 stages) → Execute | Skip formal design notes. |
| **Standard** | Multi-component system, 3-8 stages | All phases | Full methodology. |
| **Heavy** | 8+ stages, multiple subsystems, external integrations | All phases + milestones | Group stages into milestones of 3-4. Milestone gate check between each. See `references/methodology.md § Milestones`. |

If unsure: "This feels like a [tier] project — [X] major components. Does that match your sense of scope?"

**Tier escalation mid-project:** If scope expands beyond original estimate by >50%, stop before the next stage. Re-assess tier, update `_build-order.md`, and confirm with the user before continuing.

## Phase Sequence

```
Phase 0   → Technical Spike     → Validate hardest constraint
Phase 1   → Design Notes        → One note per domain, no code
Phase 1.5 → Build Order         → Dependency graph, stage sequence
Phase 2   → Stage Documents     → Write 2-3 stages ahead, not all upfront
Execute   → Build Stage by Stage → Verify, commit, next
```

Never skip phases. Never move forward until the current phase's gate check passes.

---

## Phase 0: Technical Spike

1. Ask: "What's the riskiest technical assumption in this project?"
2. If unsure, identify it yourself — state what you think the risk is and why
3. Design the smallest possible test (< 50 lines) that gives a YES/NO answer
4. Build and run the test
5. Result:
   - YES → Record the validated constraint, proceed to Phase 1
   - NO → Surface the problem, discuss alternatives, re-spike if needed. Do not proceed until a constraint is validated.

**Gate check:** `PROJECT_STATE.md` exists with a validated constraint under `## Core Constraints`.

**If gate fails:** Do not re-spike the same approach twice. If the spike produced a NO answer, the approach is blocked. Discuss alternatives with the user. If they still want to validate the same approach, ask what changed — something must have changed or the spike was invalid. Then proceed to re-spike or pivot. Do not move to Phase 1 without a validated constraint.

---

## Phase 1: Design Notes

**Mode:** Planning only. Write no production code.

### Conversation Protocol

For each domain:
1. Draft a first-pass note based on what you know
2. Present key decisions and architecture. Flag what you're uncertain about.
3. Ask: "What am I missing? What's wrong? What would you change?"
4. Revise based on feedback
5. Confirm: "This note covers [domain]. Ready to move to [next domain]?"

Do not dump 10 questions at once. Each note is a collaborative artifact.

### Domain Discovery

Start with `00-project-overview.md`, then identify domains:

**Always write:**
- Data model / storage
- Core logic
- Interface (API, CLI, UI)
- Configuration

**Write if applicable:**
- Authentication / authorization
- External service integrations
- Error handling strategy
- Deployment / infrastructure

**Write if relevant:**
- Background jobs / queues, caching, real-time, search, file storage

Finish with `NN-tech-stack.md` and `NN-project-status.md`.

### Gate Check

Before proceeding, ALL must be true:
1. `notebook/_index.md` lists all notes
2. At least `00-project-overview.md` + one note per domain exists
3. `NN-tech-stack.md` exists with justified choices
4. No unresolved `## Open Questions` that block build planning
5. User confirms: "Design notes look complete, ready to plan the build?"

**If any check fails:** Keep working on notes. Identify the specific missing item and address it before re-checking.

---

## Phase 1.5: Spec-to-Plan Translation

1. List every major component from the notes
2. Map dependencies (what needs what to exist first)
3. Sequence into stages: foundation first → data layer → core abstractions → implementations
4. Each stage must be independently testable
5. Write `build_plan/_build-order.md` with stage list and dependency graph
6. Present to user for review

**Gate check:** `_build-order.md` exists with numbered stages, dependencies, and key outcomes. User has reviewed and approved.

**If gate fails:** Return to the stage list, identify what's missing or unclear, revise before re-presenting.

---

## Phase 2 + Execute: Write and Build Incrementally

**The Loop:**
```
1. Write stage docs for next 2-3 stages
2. Build those stages
3. After building: does the build order still make sense?
   YES → write next 2-3 stage docs, continue
   NO  → update _build-order.md, adjust remaining stages, continue
4. Repeat until done
```

### Writing Stage Documents

Every stage document (`build_plan/`) must include:
1. Overview with explicit dependencies and key outcomes
2. Architecture diagram
3. Directory structure (every file created or modified)
4. Full implementation code (not pseudocode)
5. Configuration changes
6. Test strategy and full test code (see `references/testing.md`)
7. Verification checklist (specific commands and expected outputs)
8. Debugging playbook (ranked failure modes with diagnostics)
9. Acceptance criteria
10. Next stage preview

### Executing a Stage

1. Read the stage document fully before writing any code
2. Build exactly what it specifies
3. Run the verification checklist
4. Fix anything that fails
5. All tests green, no skipped tests
6. Update `PROJECT_STATE.md`
7. Commit
8. Move to next stage

### When Things Break

**Test failure in current stage:** Fix before moving on. Broken tests do not carry forward.

**Plan is wrong:** Stop. Update the stage document to match reality. Re-execute from the updated plan.

**Prior stage bug discovered:**
1. Stop current stage
2. Return to the broken stage and fix it
3. Re-run that stage's verification checklist — all green
4. Check if the fix changes interfaces later stages depend on. If yes: update affected stage docs.
5. Resume current stage

**Scope creep:** If adding something not in the stage doc, stop. Add it to a future stage or discard it.

**Capture lessons:** When a constraint, failure, or non-obvious gotcha is discovered, append to `notebook/lessons.md`. Use `/save` if notebook skill is installed.

---

## State Tracking

`PROJECT_STATE.md` is the single source of truth. Update after every phase transition and completed stage.

```markdown
# [Project Name]

## Current Phase
phase: [0 | 1 | 1.5 | 2 | execute]
current_stage: [N or null]
last_completed_stage: [N or null]
tier: [light | standard | heavy]

## Core Constraints
| Constraint | Validated? | Result |
|------------|-----------|--------|
| [description] | yes/no | [what we found] |

## Milestones (Heavy tier only)
- [x] M1: [name] — stages 1-3 — completed [date]
- [ ] M2: [name] — stages 4-6 — in progress
- [ ] M3: [name] — stages 7-9

## Completed
- [x] Phase 0: [constraint validated]
- [x] Stage 1: [name] — [date]
- [ ] Stage 2: [name] — in progress

## Current State
**What exists:** [one line]
**What works:** [bullet list]
**What's broken:** [bullet list or "nothing"]
**Blocked on:** [description or "nothing"]

## Next Action
[Single explicit next step — not a list of possibilities]

## Build Order Reference
[Stage list with completion status]
```

`## Next Action` always contains exactly one actionable step.

---

## Resume Protocol

1. Read `PROJECT_STATE.md` — parse current phase, current_stage, last_completed_stage
2. Read `notebook/_index.md` and `notebook/lessons.md`
3. Read `build_plan/_build-order.md`
4. If in execute phase, read the current stage document
5. Summarize: "You're in Phase [X], working on [description]. Last completed: [what]. Next action: [what]."
6. Ask: "Has anything changed since last session? Any new constraints or direction changes?"
7. Wait for confirmation, then continue from `## Next Action`

If `PROJECT_STATE.md` is missing, scan for artifacts (notebook/, build_plan/, src/) and reconstruct. Ask user to confirm before proceeding.

---

## Project Directory Structure

```
project/
├── PROJECT_STATE.md
├── notebook/
│   ├── _index.md
│   ├── lessons.md
│   ├── 00-project-overview.md
│   └── ...
├── build_plan/
│   ├── _build-order.md
│   ├── stage-01-foundation.md
│   └── ...
├── src/
└── tests/
```

## Identity Rules

Before creating any project directory or git repo, ask the user which identity context this project belongs to. Respect all identity separation rules from the global config.
