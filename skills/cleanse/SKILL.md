---
name: cleanse
status: published
description: >
  Analyze and optimize CLAUDE.md, memory files, and agent config for signal-to-noise.
  Use when: "cleanse", "clean my claude md", "optimize my config", "audit my setup",
  "trim my claude md", "my claude md is bloated".
  NOT for: deleting project code, restructuring codebases, or modifying non-config files.
argument-hint: "[target] — global, project, memory, or a file path. Default: auto-detect"
---

# Cleanse

Systematic analysis and optimization of agent config files. Every surviving line must earn its place by actually changing model behavior.

## When NOT to use this skill

- Target is source code, scripts, or project files → only process config files
- Target is a skill file or reference doc intentionally verbose by design → say so and stop
- File is already under 20 lines → likely already focused, do a light-touch check only
- User wants to restructure a codebase or project → different problem, different skill

---

## Quick Reference

| Command | Target |
|---------|--------|
| `/cleanse` | Auto-detect (project CLAUDE.md if in project, else global) |
| `/cleanse global` | `~/.claude/CLAUDE.md` |
| `/cleanse project` | CLAUDE.md at current project root |
| `/cleanse memory` | Auto-memory file (`~/.claude/projects/*/memory/MEMORY.md`) |
| `/cleanse [path]` | Specific file |

**Two approval gates:** Report shown first → user approves → draft shown → user approves → files written.

---

## Principles

Apply these to every line:

1. **Attention is zero-sum.** Fewer high-impact lines beats many diluted ones.
2. **Primacy bias.** Models weight content near the top more heavily. Highest-stakes instructions go first.
3. **Positive framing.** "Do Y instead" is one clean association. "Never do X" forces two operations: represent X then suppress it. Use positive framing unless the prohibited action is dangerous and non-obvious.
4. **Discoverable = waste.** If the model finds it via tool calls (package.json, file listings, --help, standard tool behavior), it belongs in tool calls, not config.
5. **Inert instructions do nothing.** Default model behavior ("be thorough", "think step by step") or vague aspirations ("high quality", "professional") add noise without changing output.
6. **Repetition dilutes.** Same idea stated N times = 1× weight + (N-1)× wasted context.
7. **Instructions vs reference.** Behavioral instructions belong in CLAUDE.md. Reference material (templates, format specs, lookup tables) belongs in separate files, loaded on demand.

---

## Invocation Targets

Process only CLAUDE.md, MEMORY.md, ECOSYSTEM.md, or similar agent config files. For any other file type: tell the user this skill processes config files only, and stop.

---

## Execution

### Phase 1: Analysis

#### Step 1: Read and Inventory

Read the target completely. Record: total lines, total sections (by ## headers or --- separators).

For files over 200 lines: note this upfront. The report will likely show significant extractable reference material.

#### Step 2: Categorize Every Section

Assign each section ONE primary category. Split analysis by individual instructions when a section mixes categories.

| Category | Means | Action |
|----------|-------|--------|
| **critical** | Security, identity, auth, data protection, deployment safety. Mistake = real damage. | Keep always. Tighten wording if verbose. |
| **override** | Specific, actionable instruction that changes model behavior from default. | Keep. |
| **workflow** | Methodology unique to this user/project. | Keep if non-obvious. Remove if it describes standard practices. |
| **reference** | Paths, API key names, routing tables. | Keep if not discoverable via tool calls. |
| **negative** | "Never X", "Don't Y", "NEVER Z". | Reframe to positive equivalent. Exception: dangerous + non-obvious (e.g., "never force-push to main"). |
| **inert** | Default model behavior or vague aspiration. | Remove. |
| **duplicate** | Same idea stated elsewhere. | Consolidate. Keep the clearest version. |
| **stale** | References files, tools, or systems that no longer exist. | Remove after verification. |
| **template** | Detailed format specs, multi-line examples, schemas. | Extract to separate file, replace with one-line pointer. |

**Key test for override vs inert:** Imagine deleting this line and running 10 diverse tasks. Would any produce noticeably different output? Yes → override. Can't identify a concrete scenario → inert.

#### Step 3: Structural Analysis

Check and flag:
- **Priority inversion:** Low-stakes content above high-stakes content. Correct order: critical → workflow → reference → preferences.
- **Section bloat:** Any section over ~25 lines likely contains extractable reference material.
- **Negative density:** More than 3-4 NEVER/DON'T/NOT instructions signals systemic negative framing.
- **Auto-generated content:** Large blocks of generic project description or file tree documentation — almost always discoverable and removable.

#### Step 4: Verify References

For every path, file, env var, tool, or command mentioned:
- **Paths:** Check existence. Flag any that don't exist.
- **Env vars:** Verify if actually set (don't display values).
- **Tools/commands:** Verify the binary exists if non-standard.
- **Pointers to other docs:** Read first few lines to confirm not stale or empty.

Mark dead references as **stale**.

#### Step 5: Generate Report

```
## Cleanse Report: [filename]

**Current:** [N] lines | **Estimated after:** [M] lines | **Reduction:** ~[X]%

### Section Breakdown

| # | Section | Lines | Category | Verdict |
|---|---------|-------|----------|---------|
| 1 | [name]  | [n]   | [cat]    | keep / reframe / consolidate / extract / remove |

### Key Findings
[For each non-keep section: what's wrong and which principle applies.]

### Reframes
[For each negative instruction worth keeping:]
- ~~"Never rm -rf"~~ → "Use trash for deletions"

### Structural Issues
[Priority inversions, bloat, negative density, staleness — if any.]

### Stale References
[Dead paths, missing env vars, broken pointers — if any.]
```

After the report, ask: "Want me to draft the rewrite? Or adjust any recommendations first?"

Wait for an affirmative response ("yes", "do it", "go ahead", or any approval) before proceeding to Phase 2.

### Phase 2: Rewrite

#### Step 6: Draft

Apply all approved recommendations. Every line in the output must pass: "Does this concretely change model behavior in at least one realistic scenario?"

Rules:
1. **Behavior-change test.** Every line must pass it.
2. **Priority ordering.** Critical/security → workflow/methodology → references/routing → preferences/style.
3. **Positive framing.** All instructions framed as what TO do, except dangerous non-obvious prohibitions.
4. **No elaboration without purpose.** One clear sentence beats two vague ones. Two clear sentences beat one ambiguous one.
5. **Preserve voice.** Keep the user's terminology, tone, and formatting conventions.
6. **Extracted files get sensible paths.** Templates → `~/.claude/templates/`. Reference docs → alongside config or in a logical project location.

#### Step 7: Present

Show the complete rewritten file. State final line count and reduction.

If files were extracted, show them with suggested paths.

If the rewrite removes >50% of content, note: "Large reduction — original recoverable via undo or git history."

Wait for explicit approval before writing any files.

#### Step 8: Apply

Write the file(s). Confirm:
```
Applied: [file] ([old] → [new] lines)
[Extracted: path (N lines)]
```

---

## Edge Cases

- **Already clean.** If ≤2 actionable items and estimated reduction <15%: "This file is already tight. [minor suggestions if any]."
- **Very short files** (<20 lines): Light-touch analysis — flag issues if they exist but don't manufacture changes.
- **Auto-generated files**: Recommend replacing with only the user's actual rules. "This looks auto-generated. Most of it duplicates what the model discovers on its own."
- **Mixed critical + noise:** Categorize at the instruction level within sections. Keep the 3 critical rules, cut the 2 redundant warnings.

---

## Safety

1. **Critical content survives every cleanse.** Security, identity, auth, and deployment rules stay. When uncertain, keep it and flag it as "kept — possibly critical."
2. **Two approval gates.** Report → draft → apply. Files written only after explicit approval of the draft.
3. **Preserve intent.** The goal is saying the same things more efficiently — not changing what the user wants. When purpose is unclear, ask.
4. **Flag uncertainty.** Any section you can't confidently categorize: "unclear — kept by default."
5. **Know when to stop.** A focused 40-line CLAUDE.md with real instructions is the goal state.
