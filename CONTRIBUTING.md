English | [日本語](CONTRIBUTING.ja.md)

# Contributing to cat-skills

Thanks for your interest in contributing to cat-skills.

## How to Contribute

### Reporting Bugs

Open an issue using the bug report template. Include:

- Which skill is affected
- Steps to reproduce
- Expected vs actual behavior
- Your agent (Claude Code, Cursor, Codex, etc.) and version

### Suggesting Features

Open an issue using the feature request template. Describe:

- The problem you're trying to solve
- Your proposed solution
- Which skill it applies to (or if it's a new skill idea)

### Submitting Code

1. Fork the repo
2. Create a branch (`git checkout -b feat/your-feature`)
3. Make your changes
4. Test the skill manually in your agent
5. Commit using [conventional commits](https://www.conventionalcommits.org/):
   - `feat:` new features or new skills
   - `fix:` bug fixes
   - `docs:` documentation
   - `chore:` maintenance
   - `refactor:` restructuring
6. Push and open a PR

### Writing a New Skill

Each skill lives in `skills/<name>/` and must have:

- `SKILL.md` — the skill definition with YAML frontmatter (`name`, `status`, `description`, `trigger`)
- `.claude-plugin/plugin.json` — marketplace metadata

Set `status: dev` in frontmatter while developing. Add `skills/<name>/` to `.gitignore` until ready to publish. Promote to `status: published` and remove the gitignore entry when shipping.

See any existing skill directory for the expected structure.

### PR Guidelines

- Keep PRs focused — one skill or one fix per PR
- Update README.md if adding or renaming a skill
- Update AGENTS.md with the new skill entry
- Update `.claude-plugin/marketplace.json` if the skill is published
- Fill out the PR template

## Code Style

Skills are markdown instruction sets, not code. The quality bar is:

- **Clarity over cleverness.** A skill should be unambiguous to an LLM reading it cold.
- **No stubs.** Every workflow described must be complete and actionable.
- **Test it.** Run the skill in at least one agent before submitting.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
