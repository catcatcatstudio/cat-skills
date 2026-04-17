---
name: recon
status: published
description: >
  Pre-build decision intelligence for any project. Produces a single opinionated decision brief —
  the output a senior consultant would give in week 1 before scope, stack, or approach are locked.
  Surfaces the traps that will cost you AND the edges that will make this an outlier — both
  calibrated to the project's actual scope (prototype vs production vs enterprise). Not a
  research report. A ranked decision brief.
  Use when: (1) user says "/recon", "what should I watch out for building X", "research best
  practices for X", "where's the edge building X", "what do good [X] projects do", "common mistakes
  with X", (2) user is about to start a new project and hasn't done research yet, (3) user describes
  a project idea and asks for advice before building, (4) user mentions a stack or category they
  haven't worked with before, (5) mid-build when hitting an area of genuine uncertainty about the domain.
  NOT for: debugging a specific bug (just debug it), researching a single library's API (just read docs),
  extracting knowledge from a specific URL (that's /eat), post-build optimization (that's /fortify),
  architecture planning (that's /architect).
---

# /recon — Pre-Build Decision Intelligence

## What this skill produces

A **decision brief** — one opinionated document (~200 lines max) that reads like a 30-minute briefing from a senior consultant who's built 10 of these. Not a research report. Not a comprehensive survey. A ranked list of what actually matters for *this* project at *this* scope, with traps and edges treated as equal halves of the work.

The consultant's job has two sides:

- **Downside:** what costs you if you get it wrong (traps, irreversible decisions, failure modes)
- **Upside:** where the edge is that makes this an outlier (category-breaking moves, underused primitives, unfashionable advantages)

Recon does both, balanced. Pure worry is useless. Pure optimism is useless. **Calibrated judgment is the product.**

## Modes

| Mode | Trigger | Output |
|------|---------|--------|
| **Full** | `/recon` or `/recon [project description]` | Single decision brief + sources appendix |
| **Focused** | `/recon [specific question]` | Mini decision brief on that question |

Distinguish by intent: "building a task management app" = full. "auth patterns for multi-tenant SaaS" = focused.

---

## Phase 0: Orient and Calibrate Scope

Determine what to research from the argument, conversation context, open files, and project state.

**Scope calibration — mandatory.** Before any research, lock these down. This is what keeps recon from applying enterprise worries to prototypes (and enterprise aspirations to weekend hacks).

- **Scale:** Prototype (weekend / single user / validating idea) / Production (real users, uptime matters) / Enterprise (scale, compliance, SLA)
- **Stakes:** Reversible (can rebuild in a week) / Load-bearing (3-month rebuild cost) / Foundational (1+ year rebuild cost)
- **Timeline:** Days / weeks / months to first ship
- **Irreversibility budget:** How much "we'll figure it out later" can this project afford?

If any of these are unclear from context, ask ONE question to lock them:

> "I see you're building [X]. Is this a prototype to validate the idea, a production system with real users, or something bigger? And what's the timeline?"

Every finding downstream gets filtered against this scope. A "performance cliff at 10M rows" is not relevant to a 50-user internal tool — and recon won't mention it. A "category-defining distribution play" is not relevant to a personal weekend project — recon won't mention that either.

**Calibrate depth.** If the user signals domain expertise ("I've built 3 of these"), focus on what's changed recently and what's non-obvious. Skip basics. If the user is entering unfamiliar territory, cover fundamentals too.

---

## Phase 1: Adopt Mindset — Two Lenses, Equal Weight

Before any research, identify two lenses. Both are required. Neither dominates.

> **Domain lens:** [specific expert who's built 10 of these — "someone who's built Asana, Linear, and Todoist" or "someone who's shipped 3 real-time collaborative editors"]. Knows the category deeply: what's table stakes, what's actually hard, what most teams get wrong.
>
> **Strategist lens:** [someone who ships category-defining products — "a principal who's taken products from me-too to category leader in this space"]. Knows where the edge is: what's fashionable vs what actually works, what assumptions are ripe to break, what capabilities just became cheap that nobody's using yet.

The lenses are not decorative. They change what you search for.

- **Domain lens searches:** "what data model decisions did Linear regret", "recurring bugs in Todoist's issue tracker", "[framework] gotchas"
- **Strategist lens searches:** "how Linear differentiated from Jira", "what made Figma category-defining in a crowded market", "what assumptions do [category] products still share that are due for breaking"

Both lenses research in parallel, equal effort.

---

## Phase 2: Generate Questions — Traps and Edges, Balanced

Generate two question banks before hitting any search tool. Equal weight.

### Trap questions (downside)

From the domain lens. What breaks, what's irreversible, what's non-obvious about failure modes **at this project's scope** (Phase 0 filters aggressively — don't generate trap questions that only apply at enterprise scale for a prototype project).

Load `references/expert-questions.md` and adapt the relevant project type's trap templates. Add project-specific trap questions that aren't in the templates.

### Edge questions (upside)

From the strategist lens. Where the outlier move is for this specific project.

Load the **Strategist questions (all project types)** block at the top of `references/expert-questions.md`. Those apply universally. Add project-specific edge questions on top.

Examples of good edge questions:
- What do the top 1% in this category do that the rest don't?
- What assumption does everyone in this category still share that's ripe to break?
- What capability just became cheap (new primitive, new model, new pattern) that competitors haven't adopted?
- What's the cross-pollination from an adjacent domain that nobody has applied here yet?
- Where is everyone's execution weak in this category (speed, polish, copy, onboarding, pricing, distribution, community)?
- What's the "obvious" move in this category that's unfashionable or uncomfortable, so nobody makes it?

**Print both question banks to the conversation before researching.** Then pause — don't start searching yet. The questions frame the investigation, and the user may redirect ("skip the pricing stuff, focus on auth") or add context ("we're using Postgres, not Mongo"). If the user says "go" or stays quiet, proceed to Phase 3.

---

## Phase 3: Research

Use multiple sources. Every finding must be traceable to a source.

### Execution strategy

**Full mode:** Launch parallel research agents — **one thread for traps, one thread for edges, equal effort**. This is the core balance. Neither bank is "priority."

**Focused mode:** Single sequential thread. Each query builds on the last.

### Research methods

1. **Web search** — blog posts, postmortems, category-defining case studies. Frame searches around the expert questions, not keyword soup. "What data model mistakes do task management apps make" beats "task management best practices." "What made Linear's UX feel different from Jira's" beats "task management UX."

2. **context7** — current framework documentation. Target gotchas sections, migration guides, breaking changes, AND new primitives that enable things the old approach couldn't.

3. **GitHub issues** — issue trackers of popular projects in the same category. Recurring bugs = systemic problems. Reopened issues = structural problems. Also read CHANGELOGs of category leaders to see what they prioritized and when.

4. **X/Twitter** — real developer opinions. Use x-research / xray skill if available.

5. **Direct repo exploration** — if the user points to a reference project, read source, CHANGELOG, architectural decisions.

### Search strategy — bidirectional reframing

Don't accept mediocre results. If a search returns listicles or shallow advice, reframe:

**For traps:**
- "best practices for X" → "postmortem X migration failure" / "X architecture regret"
- "how to build X" → "what I wish I knew before building X"
- "[framework] tutorial" → "[framework] gotchas" / "[framework] breaking changes [version]"

**For edges:**
- "best practices for X" → "how X became category-defining" / "what made [leader] different"
- "how to build X" → "what the top [X] teams do differently" / "[category]'s unsolved problems"
- "[framework] tutorial" → "[framework]'s underused features" / "what [framework] enables that older approaches couldn't"

### Source quality hierarchy

Prefer primary sources over secondary:

1. Engineering blogs from teams that built similar products (Figma, Linear, Notion engineering blogs)
2. Official postmortems and retrospectives
3. Conference talks from practitioners (not evangelists)
4. Issue trackers of popular similar projects
5. Case studies of category leaders (how they positioned, what they built first, what they deferred)
6. Stack Overflow answers with high votes and real-world context
7. **Avoid:** Medium listicles, "top 10" aggregators, marketing-adjacent thought leadership

If after 2-3 searches on a topic you're only finding category 7 sources, flag it — either the domain is too niche for web research, or the query framing needs rethinking.

### What to research

Load `references/research-categories.md`. Select categories relevant to the project's **scope** (set in Phase 0).

**Priority by scope, not hardcoded:**

- **Prototype scope:** Best examples, Strategic edges, User expectations (table stakes only). Skip pitfalls-at-scale, security deep-dives, architecture-regret surveys. Those are premature.
- **Production scope:** Pitfalls, Architecture, Strategic edges, Best examples, User expectations. Balanced — traps and edges get equal effort.
- **Enterprise scope:** All categories including security, compliance, anti-patterns.

### Research discipline

- **Filter every finding against project scope.** A "10M-row performance cliff" is not a finding for a 50-user tool — drop it before it reaches the brief. An "enterprise distribution strategy" is not a finding for a weekend prototype — drop that too.
- **Inference is hypothesis, not finding.** Every claim in the brief needs a source. If you can't source it, label it `[Hypothesis]` — do not present it as discovered fact. This closes the "made-up worry" and "manufactured edge" failure modes.
- **Niche domains are allowed to be thin.** "I found 3 relevant sources" is better than padding with generic advice. Don't manufacture depth.
- **Time-sensitivity aware.** Flag findings that may have short shelf life. Framework ecosystems and strategic landscapes both move fast — a category edge from 18 months ago may be saturated now.

### Completion criteria

- **Both banks researched.** Trap questions AND edge questions — neither gets less effort than the other.
- **Non-obvious findings.** If either bank has fewer than 2 non-obvious findings, say so. Don't pad.
- **Diminishing returns.** If 3 consecutive queries produce nothing new, move on.

---

## Phase 4: Write the Brief

**Output is ONE file:** `_docs/recon.md` — the decision brief.

Plus `_docs/sources/[topic].md` — raw research threads with links (traceability only, not meant to be read end-to-end).

No `pitfalls.md`, `architecture-notes.md`, `best-practices.md`, `feature-expectations.md`, `security-notes.md`. Those were research-report scaffolding. **The brief is the product.**

### Brief structure (~200 lines max)

```markdown
# Recon: [Project]
> [YYYY-MM-DD] | Scope: [Prototype/Production/Enterprise] | Timeline: [X] | Stakes: [Reversible/Load-bearing/Foundational]
> Lenses: [Domain expert archetype] + [Strategist archetype]

## What this project is
[1 paragraph — what it does, what success looks like, what's in scope and what's out. Grounds every finding below against this target.]

## What matters (ranked)

### 1. [Decision] — [Trap / Edge / Both] — Irreversibility: [High/Medium/Low]
[2-3 sentences. Opinionated. What the decision is, what most people get wrong or miss, what the recommendation is. If Edge, why it's under-pressed. If Trap, why it bites.]

### 2. [Decision] — [Trap / Edge / Both] — Irreversibility: [High/Medium/Low]
[...]

(Include as many as genuinely matter for this project. Could be 2. Could be 8. No forced count. Rank by cost-of-being-wrong for traps and upside-of-getting-right for edges. Mix traps and edges freely in a single ranked list — a consultant doesn't split their advice into two separate reports.)

## What doesn't matter for this project
[Explicitly dismiss off-scope worries AND off-scope aspirations. Examples: "Don't waste cycles on multi-region deploy — you have 50 users." "Skip real-time collab — this is a solo tool." "Ignore category-defining distribution plays — this is an internal tool, not a product." This section is what makes the brief usable instead of overwhelming.]

## Biggest unknown
[The area where research was thinnest — what you'd want to investigate further before committing. Honest gap acknowledgment. If everything genuinely checked out, say so.]

## Sources
[Appendix. Links to `_docs/sources/` files and external URLs. Every claim in the brief above should be traceable here.]
```

### Content rules

- **Opinionated > comprehensive.** "It depends" is not a finding — identify what it depends on and give guidance for the common case.
- **Every item in the ranking is ranked.** Position is the ranking. Don't ship a list of unranked "considerations."
- **Trap / Edge / Both tagging is mandatory** on every item. This forces the balance to be visible.
- **Scope-tag findings when relevant.** "This bites at 10k+ users" — makes the finding actionable vs. aspirational.
- **Every claim sourced or labeled `[Hypothesis]`.** No invented worries, no manufactured edges.

### Focused mode output

Single file: `_docs/recon-[topic-slug].md`. Same structure, but the ranking is narrower. Still includes "What matters" ranked list, "What doesn't matter for this question," and sources.

### Re-running recon

- **Same project, new angle:** keep existing brief, amend with new findings. Reorder ranking if new intel changes priorities.
- **Different project:** ask before overwriting.
- **Refreshing stale research:** overwrite, note prior research date alongside new one.

### Gitignore check

After writing the brief, check if `_docs/` is in `.gitignore`. If not and this is a repo (especially public), note:

> `_docs/` contains internal research — add it to `.gitignore` if this is a public repo.

---

## Phase 5: Present and Invite

Print `_docs/recon.md` to the conversation. Then:

> Anything here surprise you, or an area you want me to dig deeper on? A trap or edge you think I'm wrong about?

If the user wants to dig deeper on a point, research that specific area further and update the brief. If the user is satisfied, recon is done — the brief persists as reference for the build.

---

## Behavioral Rules

**Two lenses, equal weight — non-negotiable.** Domain lens without strategist lens produces anxious research. Strategist lens without domain lens produces aspirational nonsense. Both balanced, produce judgment.

**Scope calibration up front — non-negotiable.** Without it, recon applies enterprise worries to prototypes and enterprise aspirations to weekend hacks. This is the single biggest source of "this isn't actually relevant to me" noise.

**Opinionated > comprehensive.** Rank. Dismiss. Choose. A consultant who hands you 47 unranked considerations isn't doing their job. Neither is recon.

**Honest about gaps.** If research turns up little, say so. Niche domains have less prior art — that's fine. Padding with generic advice is worse than admitting thinness.

**Inference is hypothesis.** Every claim needs a source or a `[Hypothesis]` label. No made-up worries, no invented edges. This closes the hallucination hole.

**The brief IS the product.** One file, ranked, opinionated. No multi-file research-report structure. Sources are appendix for traceability — not meant to be read end-to-end.

**Don't duplicate other skills.** Landscape decision intelligence, not knowledge extraction from a specific URL (/eat), not project architecture (/architect), not testing strategy (/fortify), not engineering standard enforcement (/prodev).

**Time-sensitivity awareness.** Include research date in the brief header. Flag findings that may have short shelf life. Both traps ("this was a problem in Next.js 12 but fixed in 14") and edges ("this was a differentiator in 2023 but now table stakes") decay.

**Respect the user's time.** The brief is ~200 lines max. If it's longer, something went wrong — consolidate or cut. The user reads the brief and decides. Don't expect them to wade through sources.

**Contextual triggering.** When contextual triggers fire (user starting a new project, entering unfamiliar domain), don't silently launch into research. Suggest it in one line:

> "This looks like new territory — want me to run /recon on [X] before you start building?"

Let the user accept or decline. Never auto-run the full skill uninvited.
