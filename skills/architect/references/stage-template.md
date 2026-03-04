# Stage Document Template

Use this exact structure for every stage document in `build_plan/`.

---

```markdown
# Stage N: [Name]

## Overview

[2-3 sentences: what this stage does and why it matters.]

**Dependencies:** Stage X, Stage Y
**Key outcomes:**
- [What exists after this stage is complete]
- [What exists after this stage is complete]
- [What exists after this stage is complete]

---

## 1. Architecture

[ASCII diagram showing how this stage's components connect to each other and to prior stages.]

```
[diagram here]
```

[Brief explanation of the diagram — data flow, key interfaces, what talks to what.]

---

## 2. Directory Structure

[Exact file tree showing every file this stage creates or modifies.]

```
project/
├── src/
│   └── [module]/
│       ├── new_file.py          # [What this file does]
│       └── modified_file.py     # [What changed]
├── tests/
│   ├── unit/
│   │   └── test_new_module.py   # [What this tests]
│   └── integration/
│       └── test_stage_N.py      # [Integration scope]
└── [any other files]
```

---

## 3. Implementation

[Full code for every file listed above. Actual runnable code, not pseudocode.]

### 3.1 [filename] (`path/to/file`)

```[language]
[Full implementation with:
- Module docstring
- Type hints
- Error handling
- Comments where logic isn't obvious]
```

### 3.2 [filename] (`path/to/file`)

```[language]
[...]
```

[Repeat for every file.]

---

## 4. Configuration Changes

[Any changes to project config: new dependencies, new env vars, config file changes.]

### Dependencies

```
[package manager format — e.g., pyproject.toml additions, package.json additions]
```

### Environment Variables

```
[New env vars with descriptions and example values]
```

---

## 5. Test Strategy & Implementation

### 5a. Test Research

[What was researched about testing this stage's technology:]
- Testing frameworks evaluated
- Known gotchas and edge cases for this domain
- Patterns used by professional projects

### 5b. Test Architecture

- Test directory structure for this stage
- Fixtures and helpers
- Mock/stub strategy
- Test data strategy

### 5c. Test Implementation

[Full test code for every test file.]

#### Unit Tests (`tests/unit/test_[module].py`)

```[language]
[Full test implementation]
```

#### Integration Tests (`tests/integration/test_stage_N.py`)

```[language]
[Full test implementation]
```

### 5d. Test Verification

- [ ] All tests pass
- [ ] Coverage report shows no blind spots in this stage's code
- [ ] Tests run in < [N] seconds

---

## 6. Verification Checklist

[Concrete, checkable items. Specific commands with expected outputs.]

- [ ] `[command]` → [expected output/behavior]
- [ ] `[command]` → [expected output/behavior]
- [ ] `[command]` → [expected output/behavior]
- [ ] All tests pass: `[test command]`
- [ ] Linting passes: `[lint command]`
- [ ] Type checking passes: `[typecheck command]`

---

## 7. Debugging Playbook

[Most likely failure modes for this stage, ranked by probability.]

### Problem 1: [Description]
- **Symptoms:** [What you'll see]
- **Root cause check:** `[diagnostic command or code]`
- **Fix:** [How to resolve]

### Problem 2: [Description]
- **Symptoms:** [What you'll see]
- **Root cause check:** `[diagnostic command or code]`
- **Fix:** [How to resolve]

### Problem 3: [Description]
- **Symptoms:** [What you'll see]
- **Root cause check:** `[diagnostic command or code]`
- **Fix:** [How to resolve]

---

## 8. Acceptance Criteria

[What "done" means for this stage. Be specific.]

- [ ] [Demonstrable behavior — can you show this working?]
- [ ] [User-visible result — what exists now that didn't before?]
- [ ] [Smoke test — one command that proves it's solid]
- [ ] All tests green, no skipped tests, no warnings
- [ ] Code committed with passing CI

---

## Next Stage Preview

[One paragraph: what Stage N+1 will add, how it builds on this stage, what interfaces it will use from this stage.]
```

---

## Guidelines for Writing Stage Documents

1. **Self-contained.** The agent executes this stage with ONLY this document. No external references needed.

2. **Full code.** Every file listed in the directory structure has complete implementation code in section 3. No "implement this similarly to..." or "see the pattern in stage N."

3. **Explicit stubs.** When creating interfaces that later stages fill in, include the stub with its contract (type signatures, docstrings, return types). Later stages know exactly what they're coding against.

4. **Verification before proceeding.** Section 6 checklist must be green before starting the next stage. No exceptions.

5. **Tests match the code.** Section 5 tests specifically test what section 3 implements. Not generic tests — specific assertions about specific behavior.

6. **Debugging is preemptive.** Section 7 lists what's likely to go wrong based on the technology and patterns used. Research common failure modes for the specific libraries and approaches in this stage.

7. **Acceptance is demonstrable.** Section 8 criteria can be verified by running commands or observing behavior. Not "it should work" — "run this command, see this output."
