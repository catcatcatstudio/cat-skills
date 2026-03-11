# Liquid Cat Physics

Autonomous deep-work engine for Claude Code. One command to start, then walk away.

---

## The Problem

AI coding agents are great at executing one task at a time. But real projects aren't one task — they're fifty tasks with dependencies, decisions, failures, and context that compounds. You end up being the loop: read the output, decide what's next, type the instruction, babysit the execution, repeat.

Liquid Cat Physics turns Claude into its own project manager. It reads the project state, decides what to do next through an expert lens, gates every action through a confidence check, executes one focused unit of work, persists everything to disk, and loops. Every 10 minutes, automatically.

You come back to committed code, documented decisions, and a clear trail of what happened and why.

## Install

```bash
npx skills add catcatcatstudio/cat-skills --skill liquid-cat-physics
```

Or as a Claude Code plugin:

```
/plugin install liquid-cat-physics@catcatcat
```

## Usage

```
/liquid-cat-physics              # start the loop (default 10m)
/liquid-cat-physics 5m           # custom interval
/liquid-cat-physics status       # what's happening
/liquid-cat-physics stop         # pause the loop
/liquid-cat-physics reset        # clear iteration count, keep history
```

### What Happens When You Start

**First run** — interactive pre-flight. LCP deep-reads your project, assesses readiness across six dimensions (goals clarity, codebase understanding, verification infrastructure, scope, blockers, dependencies), and asks you targeted questions about actual gaps. This is the only interactive phase. Front-load the friction so the loop runs autonomously after.

Pre-flight also enables [memento](../memento/) auto mode — so if the context window fills up mid-session, compaction recovery is automatic.

**Every iteration after that:**

```
ORIENT  → Read PROJECT_STATE.md, git status, notebook, lessons
THINK   → Subagent applies expert lens, decides ONE action
GATE    → GREEN / YELLOW / RED confidence check
ACT     → Execute the one thing, verify it works
PERSIST → Update state, notebook, commit
```

Then it waits for the cron to fire again. Repeat until the project is done or it hits something that needs your input.

## The Confidence Gate

Every action passes through a three-tier gate. This is what makes LCP not just autonomous, but *safe*.

| Tier | Meaning | What Happens |
|------|---------|-------------|
| **GREEN** | Clear approach, automated verification exists, reversible | Execute it |
| **YELLOW** | Uncertainty exists — needs research first | Research in THINK, then promote to GREEN or demote to RED. Never acts on YELLOW. |
| **RED** | Needs human judgment, irreversible, or failed twice | Stop. Write a decision doc. Move on. |

The meta-rule: **when in doubt, RED.** One skipped iteration costs 10 minutes. One wrong autonomous action costs hours.

### The Two-Strike Rule

If a task fails once, LCP tries a different approach. If it fails twice, it escalates to RED — writes a decision doc explaining what was tried, why each attempt failed, and what human input would help. It never attempts the same task a third time.

This prevents the most common autonomous agent failure: thrashing on the same problem for 30 minutes while burning tokens and context.

## State Lives on Disk

LCP doesn't rely on conversation memory. Everything lives in files:

- **`PROJECT_STATE.md`** — the source of truth. Loop state, current focus, up-next queue, failure log, working memory, completed items, momentum tracking. Every iteration reads and updates this.
- **`_notebook/`** — decisions, investigations, constraints, lessons learned. The knowledge that compounds across iterations. Routine completions go in PROJECT_STATE.md; notebook is for things worth remembering.
- **Git commits** — one atomic commit per iteration. Code changes + state updates in the same commit. The git log is a complete record of what happened.

Context compaction can't erase what's on disk. Session restarts can't erase it. LCP picks up where it left off by reading its own state files — not by remembering the conversation.

## Checkpoints

Every 10 iterations (configurable), LCP pauses and produces a checkpoint report:

- What's been completed since the last checkpoint
- Whether the trajectory still aligns with project goals
- Any items that have been stuck for 3+ iterations
- Momentum summary (consecutive outcomes)

It then stops the loop and asks: **continue, adjust focus, or stop?** You decide.

Emergency checkpoints trigger automatically if 3+ consecutive tasks fail or if the same focus hasn't changed in 5 iterations. LCP knows when it's stuck.

## The Expert Lens

The THINK phase isn't just "pick the next TODO." A subagent adopts the mindset of a senior practitioner in whatever domain the project covers — full-stack engineer for web apps, systems engineer for APIs, creative technologist for generative art.

It asks: *"What would a top practitioner do right now — not the obvious next item, but the smartest move?"*

Sometimes the smartest move is the obvious one. Sometimes it's "your test suite has no integration tests and everything passes but nothing works together — fix that before adding features." The lens catches drift early.

## Pairs Well With

- **[memento](../memento/)** — LCP enables memento auto during pre-flight. Together: LCP handles inter-session persistence (PROJECT_STATE.md, notebook), memento handles intra-session compaction survival (conversation trace). The loop runs perpetually without context loss at any boundary.
- **[notebook](../notebook/)** — LCP writes to notebook format natively. Decisions, failures, constraints, and investigations get persisted as notebook entries.
- **[elevate](../elevate/)** — the elevate lens is embedded directly into LCP's THINK phase. Every iteration gets expert-level critical thinking, not just task execution.

## License

MIT
