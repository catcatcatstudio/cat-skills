English | [日本語](README.ja.md)

# cat-skills

[![Stars](https://img.shields.io/github/stars/catcatcatstudio/cat-skills)](https://github.com/catcatcatstudio/cat-skills/stargazers)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-12-8B5CF6)](https://skills.sh/catcatcatstudio/cat-skills)

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
| [Notebook](#notebook--project-notes) | `/notebook` | Project notes — prevents context loss and reasoning loops |
| [Architect](#architect--staged-build) | `/architect` | Staged build lifecycle — spike, design, plan, build |
| [Eat](#eat--knowledge-extraction) | `/eat` | Extract knowledge from any URL — YouTube, articles, podcasts, X threads |
| [Fortify](#fortify--testing-infrastructure) | `/fortify` | Detect stack, install tests, audit coverage, mutation testing |
| [Cleanse](#cleanse--config-optimization) | `/cleanse` | Optimize CLAUDE.md and agent config for signal-to-noise |
| [Elevate](#elevate--expert-elevation) | `/elevate` | Shift the model from executor to critical expert advisor |
| [Memento](#memento--context-handoff) | `/memento` | Save session knowledge, produce handoff for fresh chats |
| [Liquid Cat Physics](#liquid-cat-physics--autonomous-deep-work-loop) | `/liquid-cat-physics` | Autonomous deep-work loop with confidence gating |
| [No-Stubs](#no-stubs--stub-detection--removal) | `/no-stubs` | Scan for stub implementations and dead wiring, then fix |
| [Recon](#recon--pre-build-intelligence) | `/recon` | Pre-build research — best practices, pitfalls, architecture |
| [JP Mode](#jp-mode--japanese-transcreation) | *(auto)* | Japanese transcreation — writes like a copywriter, not a translator |
| [Xray](#xray--xtwitter-content-intelligence) | `/xray` | X/Twitter intelligence — scout, pulse, track, mirror, prospect |

---

## Skills

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

### Fortify — Testing Infrastructure

Detects your stack, installs the complete testing ecosystem, audits code for untested critical paths, writes thorough tests weighted toward error paths, then runs them and verifies they catch real bugs through mutation testing.

| Command | What it does |
|---------|-------------|
| `/fortify setup` | Install testing infra only |
| `/fortify check` | Audit coverage, find gaps |
| `/fortify` | Full setup + write + verify |

**Source:** [`skills/fortify/SKILL.md`](./skills/fortify/SKILL.md)

### Cleanse — Config Optimization

Analyzes and optimizes CLAUDE.md, memory files, and agent config. Every surviving line must earn its place by actually changing model behavior.

Two approval gates: report, draft, apply.

**Source:** [`skills/cleanse/SKILL.md`](./skills/cleanse/SKILL.md)

### Elevate — Expert Elevation

Meta-cognitive skill that shifts the model from compliant executor to critical expert advisor. Identifies the domain, adopts a top-tier practitioner's perspective, and produces ranked proposals to elevate whatever you're working on.

Works across all domains: UI/UX, copywriting, architecture, code, strategy, branding.

**Source:** [`skills/elevate/SKILL.md`](./skills/elevate/SKILL.md)

### Memento — Context Handoff

Saves unsaved session knowledge to notebook, then produces a compact orientation block for fresh chats. Also includes an auto-compaction safety net — hooks that preserve and re-inject conversation context when Claude Code's context window fills up.

| Command | What it does |
|---------|-------------|
| `/memento` | Notebook triage + generate handoff |
| `/memento auto on` | Enable auto-compaction safety net |
| `/memento auto off` | Disable auto mode |

**Source:** [`skills/memento/`](./skills/memento/) · [README](./skills/memento/README.md)

### Liquid Cat Physics — Autonomous Deep-Work Loop

Turns Claude into its own project manager. Reads project state, decides what to do through an expert lens, gates every action through a confidence check, executes one focused unit of work, persists everything, and loops every 10 minutes.

| Command | What it does |
|---------|-------------|
| `/liquid-cat-physics` | Start the loop (default 10m interval) |
| `/liquid-cat-physics status` | Show current state |
| `/liquid-cat-physics stop` | Pause the loop |

Includes a three-tier confidence gate (GREEN/YELLOW/RED), a two-strike anti-thrashing rule, automatic checkpoints, and an embedded expert lens. Enables memento auto by default.

**Source:** [`skills/liquid-cat-physics/`](./skills/liquid-cat-physics/) · [README](./skills/liquid-cat-physics/README.md)

### No-Stubs — Stub Detection & Removal

Scans a codebase for stub implementations, fake code, and dead wiring — functions that pretend to work (hardcoded returns, TODO placeholders, unconnected modules, auth that always passes). Triages by blast radius, then implements the real thing or cleanly removes the dead code.

| Command | What it does |
|---------|-------------|
| `/no-stubs scan` | Detect and report only |
| `/no-stubs fix` | Fix all found stubs |
| `/no-stubs` | Full scan + fix |

**Source:** [`skills/no-stubs/SKILL.md`](./skills/no-stubs/SKILL.md)

### Recon — Pre-Build Intelligence

Surveys best-in-class examples, common pitfalls, architecture decisions, security concerns, and user expectations BEFORE you start building. The questions a senior engineer asks in week 1 before writing any code.

**Source:** [`skills/recon/SKILL.md`](./skills/recon/SKILL.md)

### JP Mode — Japanese Transcreation

Enforces natural Japanese writing patterns for web pages, landing pages, proposals, marketing copy, and UI text. Prevents common LLM translation failures — writes like a Japanese copywriter, not a translation engine.

Triggers automatically on: "translate to Japanese", "Japanese version", "JP copy", "localize to Japanese".

**Source:** [`skills/jp-mode/SKILL.md`](./skills/jp-mode/SKILL.md)

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

---

## Recommended Pairings

**`architect` + `notebook`** — Architect writes to notebook format natively. Notebook adds proactive saves, context recovery, and lesson tracking on top. They share the same storage format but work independently.

**`liquid-cat-physics` + `memento`** — LCP handles persistence across sessions (PROJECT_STATE.md, notebook). Memento handles persistence across compactions (conversation trace). Together: a perpetual autonomous loop with no context loss at any boundary.

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) © catcatcat
