English | [日本語](README.ja.md)

# cat-skills

[![Stars](https://img.shields.io/github/stars/catcatcatstudio/cat-skills)](https://github.com/catcatcatstudio/cat-skills/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-13-8B5CF6)](https://skills.sh/catcatcatstudio/cat-skills)

AI agent skills for Claude Code, Cursor, Codex, and 40+ coding agents.

Skills are self-contained instruction sets that give AI agents specialized capabilities — knowledge extraction, staged builds, autonomous work loops, testing infrastructure, and more. Each skill works independently. No dependencies between them.

Built by [catcatcat](https://catcatcat.ai).

## Quick Start

1. Install all skills:
   ```bash
   npx skills add catcatcatstudio/cat-skills
   ```
2. Use any skill by typing its command (e.g. `/notebook`, `/architect`, `/eat`)

**Or install individually via Claude Code plugin:**

```
/plugin marketplace add catcatcatstudio/cat-skills
/plugin install notebook@catcatcat
```

## What's Inside

| Skill | Command | What it does |
|-------|---------|-------------|
| [Eat](#eat--knowledge-extraction) | `/eat` | Extract knowledge from any URL — YouTube, articles, podcasts, X threads |
| [Notebook](#notebook--project-notes) | `/notebook` | Project notes — prevents context loss and reasoning loops |
| [Architect](#architect--staged-build) | `/architect` | Staged build lifecycle — spike, design, plan, build |
| [Recon](#recon--pre-build-intelligence) | `/recon` | Pre-build research — best practices, pitfalls, architecture |
| [Xray](#xray--xtwitter-content-intelligence) | `/xray` | X/Twitter intelligence — scout, pulse, track, mirror, prospect |
| [Elevate](#elevate--expert-elevation) | `/elevate` | Shift the model from executor to critical expert advisor |
| [Prodev](#prodev--engineering-standard) | `/prodev` | Engineering standard enforcement — ownership, blast radius, anti-sycophancy |
| [Adversary](#adversary--structured-dissent) | `/adversary` | Pressure-test decisions — steel-mans alternatives, produces a verdict |
| [Eye](#eye--design-judgment) | `/eye` | Design judgment with taste — from a single element to a full app review |
| [Memento](#memento--context-handoff) | `/memento` | Save session knowledge, produce handoff for fresh chats |
| [Fortify](#fortify--testing-infrastructure) | `/fortify` | Detect stack, install tests, audit coverage, mutation testing |
| [No-Stubs](#no-stubs--stub-detection--removal) | `/no-stubs` | Scan for stub implementations and dead wiring, then fix |
| [Liquid Cat Physics](#liquid-cat-physics--autonomous-deep-work-loop) | `/liquid-cat-physics` | Autonomous deep-work loop with expert lens, engineering standard, and confidence gating |

---

## Skills

### Eat — Knowledge Extraction

Pulls transferable knowledge from any URL or content — YouTube, Instagram, TikTok, X videos, podcasts, articles, X threads, PDFs.

Full pipeline: download → transcribe (Whisper/Groq) → frame extraction → visual assessment → knowledge synthesis.

Strips noise (ads, filler, self-promotion). Preserves signal (frameworks, methods, specific numbers, practitioner honesty).

| Source | Method |
|--------|--------|
| YouTube | Subtitles → Groq → local Whisper |
| Instagram / TikTok / X video | yt-dlp + cookies → Whisper → frame extraction |
| Podcast / audio | yt-dlp → Groq / Whisper |
| X/Twitter thread | X API v2 |
| Web article | defuddle → WebFetch fallback |
| Local file / PDF | Direct read |

**Requires:** yt-dlp, ffmpeg. **Transcription:** whisper (local) or GROQ_API_KEY. **Optional:** defuddle, X_BEARER_TOKEN, browser cookies for social platforms. See [setup instructions](./skills/eat/SKILL.md#setup--dependencies).

**Source:** [`skills/eat/SKILL.md`](./skills/eat/SKILL.md)

### Notebook — Project Notes

Prevents context loss and reasoning loops. Maintains a trail of decisions, failures, and lessons learned.

| Command | What it does |
|---------|-------------|
| `/notebook` | Initialize or show status |
| `/notebook save` | Write a note immediately — infers type and content |
| `/notebook recover` | Rebuild context from existing notes |
| `/notebook migrate` | Convert messy notes into notebook format |

**Source:** [`skills/notebook/SKILL.md`](./skills/notebook/SKILL.md)

### Architect — Staged Build

Drives software projects through a structured lifecycle: spike, design, plan, build. Prevents the #1 AI coding failure — losing context on a big plan and missing pieces.

| Phase | What happens |
|-------|-------------|
| 0 | Technical spike — validate riskiest constraint |
| 1 | Design notes — one per domain, no code |
| 1.5 | Build order — dependency graph, stage sequence |
| 2+ | Write stages, build, verify, repeat |

**Source:** [`skills/architect/SKILL.md`](./skills/architect/SKILL.md)

### Recon — Pre-Build Intelligence

Surveys the landscape before you write any code. Adopts an expert consultant mindset — not "I googled best practices" but "here are the 5 decisions that will make or break this project, ranked by how hard they are to fix later."

| Mode | What happens |
|------|-------------|
| `/recon` | Full landscape survey — generates `_docs/` with summary, pitfalls, architecture notes, feature expectations, security concerns |
| `/recon [specific question]` | Focused research on one area |

Generates expert questions before searching, uses parallel research agents, prioritizes primary sources (engineering blogs, postmortems, issue trackers) over listicles. Outputs an opinionated summary with the top decisions, what surprised the expert, and the biggest unknown.

**Source:** [`skills/recon/SKILL.md`](./skills/recon/SKILL.md)

### Xray — X/Twitter Content Intelligence

Graph-based X intelligence. Build a social graph of accounts you engage with, track, and study — then scout for reply opportunities, pulse-check topic lanes, track competitors, mirror your own performance, and prospect for clients.

| Command | What it does |
|---------|-------------|
| `scout` | Reply opportunities scored by recency, engagement, and competition |
| `pulse <lane>` | What's hot in a topic lane right now |
| `track` | Top posts from accounts you study |
| `mirror` | Your own accounts' performance |
| `prospect` | Founders who just launched (client opportunities) |

Includes setup interview, 8 lane presets, full-archive search, and cost tracking.

**Source:** [`skills/xray/`](./skills/xray/) · [README](./skills/xray/README.md)

### Elevate — Expert Elevation

Shifts the model from compliant executor to critical expert advisor. Auto-detects the domain, adopts the mindset of a top-tier practitioner (not generic "senior engineer" — specific, like "someone who's built Figma, Linear, and Notion"), and produces ranked proposals.

| Step | What happens |
|------|-------------|
| Adopt lens | Identifies the domain, states the expert role |
| Understand purpose | Why this work exists, not just what the task is |
| Research if needed | Checks current best practices before recommending |
| Ranked proposals | Up to 3, ranked by impact-to-effort. Each tagged Quality (polish) or Ambition (rethink). |

Will push back if the work is already strong — proposing zero changes is a valid output. Works across all domains: UI/UX, code, copywriting, architecture, strategy, branding.

**Source:** [`skills/elevate/SKILL.md`](./skills/elevate/SKILL.md)

### Prodev — Engineering Standard

Loads a full field manual that changes how the model evaluates every decision, every line, every assumption. Not "try harder" — a concrete behavioral shift for the rest of the session.

| Principle | What it prevents |
|-----------|-----------------|
| Ownership mentality | Writing code for the diff instead of the codebase 6 months from now |
| Layer discipline | Fixing display problems in the data layer because that's the file you have open |
| Research protocol | Using stale API knowledge from training data instead of checking current docs |
| Current-gen patterns | Using the approach with more blog posts instead of the one senior engineers actually use |
| Blast radius thinking | Changing code without knowing what calls it, what it calls, or what breaks |
| Anti-sycophancy | Agreeing with bad approaches instead of pushing back with evidence |
| Self-review gate | Committing without verifying the change actually works |

Includes a self-review checklist that runs before every commit. If any answer is "no," the code doesn't ship.

**Source:** [`skills/prodev/SKILL.md`](./skills/prodev/SKILL.md)

### Adversary — Structured Dissent

Pressure-tests decisions through adversarial analysis. Auto-detects the domain (architecture, strategy, marketing, design), builds the strongest case FOR the current approach, then spawns an adversary subagent to steel-man a concrete alternative at full strength.

Produces a decision brief with load-bearing assumptions, the strongest counter-argument, the single question that resolves the disagreement, and a mandatory verdict (Hold / Adjust / Reconsider / Uncertain). Short-circuits when there's no credible alternative — doesn't manufacture doubt.

| Lens | Adversary focuses on |
|------|---------------------|
| Architecture | Simpler alternatives, scaling traps, over-engineering |
| Strategy | Market assumptions, opportunity cost, timing risk |
| Marketing | Who it doesn't land with, stronger positioning |
| Design | Whether aesthetic serves function, edge cases |

**Source:** [`skills/adversary/SKILL.md`](./skills/adversary/SKILL.md)

### Eye — Design Judgment

Design critique through the lens of a design director with taste — not checklists, not scores, not rubrics. Scales from micro-reviews (a single element) to full design crits (an entire app).

| Scope | What happens |
|-------|-------------|
| `/eye this button` | Micro — quick opinion in a few sentences |
| `/eye the hero section` | Focused — intent, judgment on relevant dimensions, direction |
| `/eye` | Full — gut read, dimensional judgment, AI slop check, persona stress test, prioritized findings |

Includes a design knowledge base that calibrates LLM blind spots: confusing competence with quality, rule-following without context, AI aesthetic bias, describing instead of judging, spacing blindness, and confusing minimalism with emptiness.

**Source:** [`skills/eye/`](./skills/eye/) · [README](./skills/eye/README.md)

### Memento — Context Handoff

Saves unsaved session knowledge to notebook, then produces a compact orientation block for fresh chats. Also includes an auto-compaction safety net — hooks that preserve and re-inject conversation context when Claude Code's context window fills up.

| Command | What it does |
|---------|-------------|
| `/memento` | Notebook triage + generate handoff |
| `/memento auto on` | Enable auto-compaction safety net |
| `/memento auto off` | Disable auto mode |

**Source:** [`skills/memento/`](./skills/memento/) · [README](./skills/memento/README.md)

### Fortify — Testing Infrastructure

Detects your stack, installs the complete testing ecosystem, audits code for untested critical paths, writes thorough tests weighted toward error paths, then runs them and verifies they catch real bugs through mutation testing.

| Command | What it does |
|---------|-------------|
| `/fortify setup` | Install testing infra only |
| `/fortify check` | Audit coverage, find gaps |
| `/fortify` | Full setup + write + verify |

**Source:** [`skills/fortify/SKILL.md`](./skills/fortify/SKILL.md)

### No-Stubs — Stub Detection & Removal

Scans a codebase for stub implementations, fake code, and dead wiring — functions that pretend to work (hardcoded returns, TODO placeholders, unconnected modules, auth that always passes). Triages by blast radius, then implements the real thing or cleanly removes the dead code.

| Command | What it does |
|---------|-------------|
| `/no-stubs scan` | Detect and report only |
| `/no-stubs fix` | Fix all found stubs |
| `/no-stubs` | Full scan + fix |

**Source:** [`skills/no-stubs/SKILL.md`](./skills/no-stubs/SKILL.md)

### Liquid Cat Physics — Autonomous Deep-Work Loop

Turns Claude into its own project manager. Reads project state, applies an expert lens to decide what to work on, enforces senior-engineer execution standards on every line of code, gates every action through a confidence check, and persists everything. Loops every 10 minutes.

| Command | What it does |
|---------|-------------|
| `/liquid-cat-physics` | Start the loop (default 10m interval) |
| `/liquid-cat-physics status` | Show current state |
| `/liquid-cat-physics stop` | Pause the loop |

Two embedded lenses drive quality: the **elevate lens** picks the smartest next move (not just the next TODO), and the **prodev standard** ensures it's built right — correct layer, verified APIs, understood blast radius, no stubs, self-reviewed before every commit. Includes a three-tier confidence gate (GREEN/YELLOW/RED), two-strike anti-thrashing, automatic checkpoints with coverage assessment, and memento auto for context survival.

**Source:** [`skills/liquid-cat-physics/`](./skills/liquid-cat-physics/) · [README](./skills/liquid-cat-physics/README.md)

---

## Recommended Pairings

**`architect` + `notebook`** — Architect writes to notebook format natively. Notebook adds proactive saves, context recovery, and lesson tracking on top. They share the same storage format but work independently.

**`liquid-cat-physics` + `memento`** — LCP handles persistence across sessions (PROJECT_STATE.md, notebook). Memento handles persistence across compactions (conversation trace). Together: a perpetual autonomous loop with no context loss at any boundary.

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) © catcatcat
