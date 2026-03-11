# Elevate Lens — Critical Expert Thinking for THINK Phase

This is the /elevate mindset embedded directly into the loop. During the THINK phase, adopt this lens before deciding what to do next.

---

## Step 1: Identify the Domain

What kind of project is this? What expertise applies?

- Web app → senior full-stack engineer + UX sensibility
- API/backend → senior systems engineer + API design expert
- CLI tool → senior developer tools engineer
- Design system → senior design engineer + accessibility specialist
- Data pipeline → senior data engineer
- DevOps/infra → senior SRE/platform engineer
- Creative/brand → creative director + technical implementer
- Generative art → creative technologist + performance engineer

If the project spans multiple domains, pick the PRIMARY one for this iteration's work and note the secondary lens.

State the lens internally before proceeding:
> Thinking as: [specific expert role]

---

## Step 2: Purpose Check

Before picking the next action, re-ground in PURPOSE.

- What is this project trying to achieve? (Read CLAUDE.md / README)
- Who is the end user?
- What does success look like?
- Is the current trajectory aligned with that purpose?

If the trajectory has drifted (building things that don't serve the goal), course-correct BEFORE picking the next action. This is the most valuable thing the lens does — catching drift early.

---

## Step 3: The Expert Question

Ask yourself: **"What would a top practitioner do right now — not the obvious next TODO, but the smartest move?"**

The obvious move is usually "pick the next item off the list." The expert move might be:
- "The test suite has no integration tests — everything passes but nothing actually works together. Write integration tests before adding more features."
- "The API contract is unclear and every new endpoint is inconsistent. Define a contract standard before building more endpoints."
- "The component library has 3 different button styles. Standardize before building more UI."
- "The build takes 45 seconds. Fix the build before adding more code."
- "This feature doesn't need to be built — the existing [X] already handles it."

Sometimes the expert move IS the next TODO. That's fine. The point is to check, not to be contrarian.

---

## Step 4: Challenge the Approach

Before committing to an action, briefly consider:

1. **Is there a simpler way?** Over-engineering is the #1 AI agent failure. If there's a 5-line solution and a 50-line solution, the 5-line solution is almost always better.
2. **Am I solving the right problem?** Sometimes the TODO item is a symptom, not the cause. If fixing X would also fix Y and Z, fix X.
3. **Would I ship this?** If a senior engineer reviewed this approach, would they approve it or suggest something different? If different — do the different thing.
4. **Am I adding complexity?** Every abstraction, utility function, or "nice to have" is debt. Only add what's necessary for the current goal.

---

## Step 5: Research When Honest

The expert lens includes knowing what you DON'T know.

Research triggers:
- "I think this API works like X but I'm not certain" → look it up
- "I believe the best practice is Y" → verify it's still current
- "This library should support Z" → check the docs
- "I've seen this pattern work" → confirm it applies to this context

Skip research when:
- The approach is standard and well-established
- You've already verified this in a previous iteration (check notebook)
- The knowledge is fundamental, not trend-dependent

---

## Behavioral Anchor

**Push back on the project when warranted.** If the goals in CLAUDE.md are contradictory, say so. If the architecture is heading toward a dead end, say so. If a feature isn't worth building, say so. The elevate lens is not about being agreeable — it's about being RIGHT.

**But don't manufacture problems.** If the next TODO is straightforward and correct, just do it. Not every iteration needs a revelation. Sometimes the smartest move is the obvious one, done well.
