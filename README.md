# cat-skills

AI agent skills for Claude Code, Cursor, Codex, and 40+ coding agents.

Built by [catcatcat](https://catcatcat.ai).

---

## Install

### Agent Skills (recommended)

```bash
npx skills add catcatcatai/cat-skills
```

Works with any agent that supports the [Agent Skills](https://github.com/anthropics/skills) format.

### Claude Code

```bash
# All projects (personal)
git clone https://github.com/catcatcatai/cat-skills ~/.claude/skills/cat-skills

# Single project
git clone https://github.com/catcatcatai/cat-skills .claude/skills/cat-skills
```

### Other tools

Copy the contents of any `SKILL.md` into your tool's rules file:

| Tool | Path |
|------|------|
| Cursor | `.cursor/rules/<skill>.mdc` |
| Windsurf | `.windsurf/rules/<skill>.md` |
| Copilot | `.github/copilot-instructions.md` |
| Gemini CLI | `GEMINI.md` |
| Codex / OpenCode | `AGENTS.md` |
| Aider | `CONVENTIONS.md` (load with `--read`) |
| Cline | `.clinerules/<skill>.md` |
| Roo Code | `.roo/rules/<skill>.md` |
| Amazon Q | `.amazonq/rules/<skill>.md` |

Notebook has a standalone [`INSTRUCTIONS.md`](./skills/notebook/INSTRUCTIONS.md) optimized for non-Claude tools.

---

## Skills

### `/notebook` — Project Notes

Prevents context loss and reasoning loops. Maintains a trail of decisions, failures, and lessons learned.

| Command | What it does |
|---------|-------------|
| `/notebook` | Initialize or show status |
| `/notebook save` | Write a note immediately — infers type and content |
| `/notebook recover` | Rebuild context from existing notes |
| `/notebook migrate` | Convert messy notes into notebook format |

**Source:** [`skills/notebook/SKILL.md`](./skills/notebook/SKILL.md)

### `/architect` — Staged Build

Drives software projects through a structured lifecycle: spike, design, plan, build. Prevents the #1 AI coding failure — losing context on a big plan and missing pieces.

| Phase | What happens |
|-------|-------------|
| 0 | Technical spike — validate riskiest constraint |
| 1 | Design notes — one per domain, no code |
| 1.5 | Build order — dependency graph, stage sequence |
| 2+ | Write stages, build, verify, repeat |

**Source:** [`skills/architect/SKILL.md`](./skills/architect/SKILL.md)

### `/extract` — Knowledge Extraction

Pulls transferable knowledge from any URL or content — YouTube videos, podcasts, articles, X threads, PDFs.

Strips noise (ads, filler, self-promotion). Preserves signal (frameworks, methods, specific numbers, practitioner honesty).

**Source:** [`skills/extract/SKILL.md`](./skills/extract/SKILL.md)

### `/cleanse` — Config Optimization

Analyzes and optimizes CLAUDE.md, memory files, and agent config. Every surviving line must earn its place by actually changing model behavior.

Two approval gates: report → draft → apply.

**Source:** [`skills/cleanse/SKILL.md`](./skills/cleanse/SKILL.md)

### `/elevate` — Expert Elevation

Meta-cognitive skill that shifts the model from compliant executor to critical expert advisor. Identifies the domain, adopts a top-tier practitioner's perspective, and produces ranked proposals to elevate whatever you're working on.

Works across all domains: UI/UX, copywriting, architecture, code, strategy, branding.

**Source:** [`skills/elevate/SKILL.md`](./skills/elevate/SKILL.md)

---

## Recommended pairings

**`architect` + `notebook`** — Architect writes to `notebook/` format natively. Notebook adds proactive saves, context recovery, and lesson tracking on top. They share the same storage format but work independently.

---

## License

MIT
