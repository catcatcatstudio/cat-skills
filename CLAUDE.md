# cat-skills

AI agent skills by catcatcat. Each skill is a self-contained instruction set in `skills/`.

## Skill Directory

| Skill | Path | Description |
|-------|------|-------------|
| notebook | `skills/notebook/SKILL.md` | Project notes — decisions, failures, lessons, context recovery |
| architect | `skills/architect/SKILL.md` | Staged build methodology for software projects |
| extract | `skills/extract/SKILL.md` | Knowledge extraction from URLs and content |
| cleanse | `skills/cleanse/SKILL.md` | Agent config analysis and optimization |

## Reference Files

| File | Path |
|------|------|
| Build methodology | `skills/architect/references/methodology.md` |
| Testing obligations | `skills/architect/references/testing.md` |
| Stage template | `skills/architect/references/stage-template.md` |
| Notebook standalone instructions | `skills/notebook/INSTRUCTIONS.md` |

## Local Setup

Skills are symlinked from `~/.claude/skills/` into this monorepo:

```
~/.claude/skills/notebook  → studio/skills/cat-skills/skills/notebook
~/.claude/skills/architect → studio/skills/cat-skills/skills/architect
~/.claude/skills/extract   → studio/skills/cat-skills/skills/extract
~/.claude/skills/cleanse   → studio/skills/cat-skills/skills/cleanse
```

## Platform Paths

Verified as of March 2026. Update here AND in the README if a path changes.

| Tool | Path | Notes |
|------|------|-------|
| Claude Code | `~/.claude/skills/<name>/SKILL.md` | Personal. `.claude/skills/` for project-specific. |
| Cursor | `.cursor/rules/<name>.mdc` | Must be `.mdc`, not `.md`. |
| Windsurf | `.windsurf/rules/<name>.md` | `.windsurfrules` is deprecated. |
| Copilot | `.github/copilot-instructions.md` | Single file. Also `.github/instructions/*.instructions.md`. |
| Gemini CLI | `GEMINI.md` | At project root. |
| Codex | `AGENTS.md` | At project root. Also `~/.codex/AGENTS.md` for global. |
| OpenCode | `AGENTS.md` | Falls back to `CLAUDE.md`. |
| Aider | Any filename via `--read` | No auto-discovery. |
| Cline | `.clinerules/<name>.md` | Directory-based. |
| Roo Code | `.roo/rules/<name>.md` | Separate from Cline. |
| Amazon Q | `.amazonq/rules/<name>.md` | Project-level only. |

## Repo

- GitHub: `catcatcatai/cat-skills`
- SSH host: `github-catcatcat`
- Branch: `main`
- Commits as: `wwwcolorcolor`
