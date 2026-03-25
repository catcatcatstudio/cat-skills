---
name: recon
status: published
description: >
  Pre-build intelligence and domain research for any project. Surveys best-in-class examples,
  common pitfalls, architecture decisions, security concerns, and user expectations BEFORE you
  start building. Adopts an expert consultant mindset to research what matters — not generic
  googling, but the questions a senior engineer asks in week 1 before writing any code.
  Use when: (1) user says "/recon", "what should I watch out for building X", "research best
  practices for X", "what do good [X] projects do", "common mistakes with X", (2) user is about
  to start a new project and hasn't done research yet, (3) user describes a project idea and asks
  for advice before building, (4) user mentions a stack or category they haven't worked with before,
  (5) mid-build when hitting an area of genuine uncertainty about the domain.
  NOT for: debugging a specific bug (just debug it), researching a single library's API (just read docs),
  extracting knowledge from a specific URL (that's /extract), post-build optimization (that's /fortify).
---

# /recon — Pre-Build Intelligence

## Modes

| Mode | Trigger | Output |
|------|---------|--------|
| **Full** | `/recon` or `/recon [project description]` | All _docs/ files + summary |
| **Focused** | `/recon [specific question]` | Single focused doc + mini-summary |

Distinguish by intent: "building a task management app" = full. "auth patterns for multi-tenant SaaS" = focused.

---

## Phase 0: Orient

Determine what to research from the argument, conversation context, open files, and project state.

**If clear:** State the research target in one line and proceed.

**If ambiguous:** Ask ONE question to calibrate scope:
> "I see [X]. Are you looking for a full landscape survey, or focused research on a specific area like [Y] or [Z]?"

**Calibrate depth.** If the user signals domain expertise ("I've built 3 of these"), focus on what's changed recently and what's non-obvious. Skip basics. If the user is entering unfamiliar territory, cover fundamentals too.

---

## Phase 1: Adopt Expert Mindset

Before any research, identify the domain expert lens:

> **Thinking as:** [specific expert who's built 10 of these — not "senior engineer" but "someone who's built Asana, Linear, and Todoist" or "someone who's shipped 3 real-time collaborative editors"]

This is not decorative. It changes what you search for. A generic search for "task management app best practices" gives blog posts. An expert-framed search for "what data model decisions did Linear regret" or "recurring bugs in Todoist's issue tracker" gives intelligence.

---

## Phase 2: Generate Expert Questions

Before hitting any search tool, generate 5-10 questions the expert would ask. Not "what framework should I use" — the expert already knows that. More like:

- "What's the data model decision you'll regret in 6 months?"
- "What's the feature users expect on day 1 that you'll forget to build?"
- "What's the performance cliff at 1000 users that's invisible at 10?"
- "What's the security assumption that's wrong?"
- "What's the UX pattern that seems right but frustrates real users?"

Load `references/expert-questions.md` and adapt the relevant project type's questions. Add project-specific questions that aren't in the templates.

Print the questions to the conversation before researching. Then pause — don't start researching yet. The questions frame the investigation, and the user may redirect ("skip the UX stuff, I care about the data model") or add context ("we're using Postgres, not Mongo"). If the user says nothing or says "go" or "looks good," proceed to Phase 3. If the user adjusts the questions, adapt and proceed.

---

## Phase 3: Research

Use multiple sources. Every finding must be traceable to a source.

### Execution strategy

**Full mode:** Launch parallel research agents — one per 2-3 categories (e.g., pitfalls+architecture in one thread, best-examples+UX in another, security+anti-patterns in a third). Categories are independent enough that parallel research won't miss cross-category insights, and it keeps total research time reasonable.

**Focused mode:** Single sequential thread. Each query builds on the last — findings from one search inform how you frame the next.

### Research methods (use all that apply)

1. **Web search** — blog posts, postmortems, "lessons learned" articles, Stack Overflow. Frame searches around expert questions, not keyword soup. "What data model mistakes do task management apps make" beats "task management best practices."

2. **context7** — current framework documentation. Target gotchas sections, migration guides (they reveal what the old approach got wrong), and breaking changes.

3. **GitHub issues** — search issue trackers of popular projects in the same category. Recurring bugs = systemic problems. Search for labels like "bug", "wontfix", "breaking-change". Look at what gets reopened.

4. **X/Twitter** — real developer opinions. Use x-research skill if available. Devs post honest takes about what works and what doesn't, especially around new patterns or frameworks.

5. **Direct repo exploration** — if the user points to a reference project, read its source, CHANGELOG, and architectural decisions.

### Search strategy

Don't accept mediocre results. If a search returns generic listicles or shallow advice, reframe and try again:

- "best practices for X" → "postmortem X migration failure" or "X architecture regret"
- "how to build X" → "what I wish I knew before building X" or "mistakes building X"
- "[framework] tutorial" → "[framework] gotchas" or "[framework] breaking changes [version]"

**Source quality hierarchy** — prefer primary sources over secondary:
1. Engineering blogs from teams that built similar products (Figma, Linear, Notion engineering blogs)
2. Official postmortems and retrospectives
3. Conference talks from practitioners (not evangelists)
4. Issue trackers of popular similar projects
5. Stack Overflow answers with high votes and real-world context
6. Blog posts with concrete examples and code
7. Avoid: Medium listicles, "top 10" aggregators, marketing-adjacent "thought leadership"

If after 2-3 searches on a topic you're only finding category 7 sources, flag it — either the domain is too niche for web research, or the query framing needs rethinking.

### What to research

Load `references/research-categories.md` for the full category breakdown with sub-questions and search framing guidance. Select categories relevant to the project type.

**Priority:** Always research categories 2 (pitfalls) and 4 (architecture decisions) — highest cost-of-being-wrong. Then 1 (best examples) and 3 (UX expectations). Then 5 (security) and 6 (anti-patterns) if relevant.

**For focused mode:** Research only the specific area requested. Use the relevant category's sub-questions as the lens.

### Completion criteria

Research is done when:
- **Per category:** At least 3 sources consulted, at least 1 primary source (engineering blog, official docs, issue tracker). If a priority category (2 or 4) has fewer than 2 non-obvious findings, flag it.
- **Full mode:** At least 4 of the 6 categories researched. Both priority categories (pitfalls, architecture) always included.
- **Diminishing returns:** New searches are returning information already captured, or 3 consecutive queries produced nothing new. Move on.
- **Quality floor:** If you can't find at least 2 non-obvious findings per priority category, say so explicitly — either the domain is too niche or the search strategy needs rethinking. Ask the user if they have specific reference projects or prior art to point you at.

### Research discipline

- If a topic has limited prior art, say so honestly: "This is fairly niche — I found limited prior art. Here's what exists." Don't manufacture depth.
- Note when findings are time-sensitive: "Next.js App Router patterns are still evolving rapidly as of [date]."
- Track sources as you go — every claim needs a link or attribution.

---

## Phase 4: Write Docs

### Full mode output

Create `_docs/` directory in the project root:

```
_docs/
├── recon-summary.md
├── best-practices.md
├── pitfalls.md
├── feature-expectations.md
├── architecture-notes.md
├── security-notes.md        (if relevant)
└── sources/
    └── [topic].md            (raw research threads with links)
```

Skip files for categories that aren't relevant to this project type.

**Every file starts with:**
```
# [Title]
> Recon date: [YYYY-MM-DD] | Project: [description] | Expert lens: [role]
```

### File content guidelines

**recon-summary.md** — This is the product. Under 50 lines. Opinionated. Follow this structure:

```markdown
# Recon Summary: [Project]
> [YYYY-MM-DD] | Expert lens: [role]

## The 5 decisions that will make or break this project

### 1. [Decision] — Irreversibility: [High/Medium/Low]
[2-3 sentences: what the decision is, what most people get wrong, what to do instead]

### 2. ...
(repeat, ranked by how hard they are to fix later)

## What surprised me
[1-2 findings that contradicted initial assumptions or that an expert would find non-obvious]

## Biggest unknown
[The area where research was thinnest — what you'd want to investigate further before committing]
```

Not "here are some things to consider" but "here are the 5 decisions that will make or break this project." Each point: what the decision is, why it matters, what the expert recommendation is. The "what surprised me" section forces identification of non-obvious findings. The "biggest unknown" section forces honest gap acknowledgment.

**pitfalls.md** — Organized by severity. Each pitfall: what it is, why it happens, what it looks like when it bites you, how to prevent it. Specific to this project type, not generic.

**architecture-notes.md** — Focus on decisions that are expensive to reverse. Each decision: what the options are, what similar projects chose, what the tradeoffs are, what the recommendation is and why.

**best-practices.md** — What the best projects in this category do. Concrete patterns, not platitudes.

**feature-expectations.md** — Two sections: "Table stakes" (must have on day 1) and "Expected soon" (users will ask for within a month). Based on what similar products offer.

**security-notes.md** — Only if there are category-specific security concerns beyond generic web security. Domain-specific threats, compliance requirements, data handling pitfalls.

**sources/[topic].md** — Raw research threads. URL, what was found, relevance. These support the other files and preserve traceability.

### Focused mode output

Write a single file: `_docs/recon-[topic-slug].md`. Same header format. Structured findings with sources. End with a mini-summary (10-15 lines) of the key takeaways.

### Re-running recon

If `_docs/` already exists from a previous run:
- **Same project, new angle:** Keep existing docs. Add new findings to existing files or create new ones. Update `recon-summary.md` to reflect the combined intelligence.
- **Different project:** Ask before overwriting. The user may want to archive the old docs first.
- **Refreshing stale research:** Overwrite, but note the original research date alongside the new one so the user can see what changed.

### Gitignore check

After writing docs, check if `_docs/` is in `.gitignore`. If not, and this is a repo (especially a public one), note:

> `_docs/` contains internal research — add it to `.gitignore` if this is a public repo.

---

## Phase 5: Present and Invite

Print `recon-summary.md` to the conversation. Then:

> Anything here surprise you, or an area you want me to dig deeper on?

If the user wants to dig deeper on a point, research that specific area further and update the relevant doc. If the user is satisfied, the recon is done — the docs persist as reference for the build.

---

## Behavioral Rules

**Expert framing is non-negotiable.** Phase 1 and 2 happen before any search tool is called. The expert lens is what makes this different from "I googled some stuff." If you skip it, the research quality drops to generic.

**Opinionated > comprehensive.** The summary ranks decisions by cost-of-being-wrong. "It depends" is not a finding — identify what it depends ON and give guidance for common cases.

**Honest about gaps.** If research turns up little on a topic, say so. "I found 3 relevant sources" is better than padding with generic advice. Niche domains have less prior art — that's fine.

**Sources are mandatory.** Every claim in the detail files should be traceable. If you can't source it, label it as inference from the expert lens rather than discovered fact.

**Don't duplicate other skills.** This is landscape research, not knowledge extraction from a specific URL (/extract), not project architecture (/architect), not testing strategy (/fortify). Recon surveys the territory. Other skills work within it.

**Time-sensitivity awareness.** Include the research date in every file header. Flag findings that may have a short shelf life. Framework ecosystems move fast — a "best practice" from 18 months ago may be an anti-pattern now.

**Respect the user's time.** Don't present 6 detailed docs and expect the user to read them all. The summary is what they read. The detail files are reference material they consult when needed.

**Contextual triggering.** When the description's contextual triggers fire (user starting a new project, entering unfamiliar domain), don't silently launch into research. Instead, suggest it in one line:
> "This looks like new territory — want me to run /recon on [X] before you start building?"
Let the user accept or decline. Never auto-run the full skill uninvited.
