# Decision Document Template

When an action is gated RED, write a decision document. This is the handoff to the human. A good decision doc means the human unblocks you in 30 seconds. A bad one means they spend 30 minutes re-deriving context.

---

## Format

Save as a notebook note with type `decision` using full format:

```markdown
# NNNN: [Title — what needs deciding]

**Type:** decision | **Date:** YYYY-MM-DD
**Status:** needs-human

## Context
What were you trying to do? What iteration? What's the current project state relevant to this decision? (2-4 sentences max)

## Why This Is RED
Which RED criteria triggered? Be specific:
- [ ] Taste/preference decision
- [ ] Irreversible consequences
- [ ] Missing access/credentials
- [ ] Research didn't resolve uncertainty
- [ ] Ambiguous spec — two engineers would build different things
- [ ] Two-strike rule — failed twice
- [ ] Architectural decision with long-term consequences
- [ ] Guessing at user preference

## Options
### A) [Option name]
[What this means. 1-2 sentences.]
- **Pros:** [concrete benefits]
- **Cons:** [concrete drawbacks]
- **Effort:** [quick/moderate/significant]

### B) [Option name]
[What this means. 1-2 sentences.]
- **Pros:** [concrete benefits]
- **Cons:** [concrete drawbacks]
- **Effort:** [quick/moderate/significant]

### C) [Option name] (if applicable)
[Same format]

## Recommendation
If I had to choose, I'd go with **[letter]** because [one sentence rationale]. But this is genuinely your call — [why it depends on preference/strategy].

## To Unblock
[Literally what the human needs to do. Be specific:]
- "Reply with A, B, or C"
- "Provide the API key for [service]"
- "Decide whether the landing page should be single-page or multi-page"
- "Review the mockup options in _notebook/NNNN and pick one"

## If Not Unblocked
[What the skill will do in the meantime. Usually: "Skipping this and working on [next GREEN item]" or "All remaining work depends on this — loop will idle until resolved."]
```

---

## Quality Checklist

Before saving the decision doc, verify:

- [ ] A human who hasn't seen the project in a week could understand this in 60 seconds
- [ ] Options are concrete (not "option A: do it one way, option B: do it another way")
- [ ] Recommendation includes rationale AND acknowledges why it's a human call
- [ ] "To Unblock" is a specific action, not "let me know what you think"
- [ ] The doc doesn't assume the human remembers recent conversation context

---

## After the Human Decides

When the human unblocks a decision:
1. Update the notebook note status from `needs-human` to `accepted`
2. Add the decision and rationale to the note
3. Remove the item from PROJECT_STATE.md `Blocked / Needs Human`
4. If the decision resolves the current focus area, re-rate affected `Up Next` items
5. The next iteration will pick it up naturally through the normal ORIENT phase
