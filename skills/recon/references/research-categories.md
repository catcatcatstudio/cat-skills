# Research Categories

Adapt per project type. Not every category applies — a CLI tool doesn't need UX pattern research, a static site doesn't need scaling analysis. Pick what's relevant to the project's **scope** (Phase 0 — scale, stakes, timeline).

**Priority by scope, not hardcoded:**

- **Prototype scope:** Best examples (1), Strategic edges (7), User expectations — table stakes only (3). Skip pitfalls-at-scale (2), security deep-dives (5), architecture-regret surveys (4), anti-patterns (6). Those are premature.
- **Production scope:** Pitfalls (2), Architecture (4), Strategic edges (7), Best examples (1), User expectations (3). Balanced — trap and edge categories get equal research effort.
- **Enterprise scope:** All categories including security (5) and anti-patterns (6).

**Balance rule:** trap-oriented categories (2, 4, 5, 6) and upside-oriented categories (1, 3, 7) get equal research effort. No "pitfalls first" default — scope determines what applies, and traps and edges research in parallel.

---

## 1. Best-in-Class Examples

Identify 3-5 projects that represent the state of the art.

Questions to research:
- What do they do that users love?
- What architectural decisions did they make and why?
- What's their tech stack and what can we learn from their choices?
- What features differentiate the best from the mediocre?
- What do their changelogs reveal about priorities?

Search framing: Don't search "best [X] apps" — search for specific product comparisons, architecture blog posts from the teams that built them, and conference talks from their engineers.

---

## 2. Common Pitfalls and Failure Modes

The highest-value category. What goes wrong repeatedly.

Questions to research:
- What bugs do projects in this category commonly ship?
- What are the known gotchas for this stack combination?
- What do people consistently get wrong on the first build?
- What are the "looks fine in dev, breaks in production" patterns?
- What do postmortems in this space commonly cite?
- What framework features have surprising footguns?

Search framing: Look for postmortems, "lessons learned" posts, "what I wish I knew before building [X]", and issue trackers of popular similar projects (recurring bugs = systemic problems).

---

## 3. User Expectations and UX Patterns

What users assume your product will do before you tell them.

Questions to research:
- What features do users of this type of product consider table stakes?
- What are the UX conventions users expect without being told?
- What's the "missing feature" that gets the most complaints in similar products?
- What accessibility requirements are commonly missed?
- What onboarding patterns work vs frustrate?

Search framing: Look at app store reviews, Product Hunt comments, Reddit threads comparing alternatives, and UX case studies for this product category.

---

## 4. Architecture and Data Model Decisions

Decisions that are expensive to reverse.

Questions to research:
- What data model decisions are hard to change later?
- What are the scaling inflection points (10 users → 100 → 1000 → 10000)?
- What integrations do similar projects wish they'd planned for from the start?
- What's the common "we should have used X instead of Y" regret?
- What's the caching/state management decision that bites you at scale?
- What API design choices lock you in?

Search framing: Look for architecture decision records (ADRs), "why we rewrote [X]" posts, migration guides (they reveal what the old architecture got wrong), and database schema evolution discussions.

---

## 5. Security and Edge Cases

Category-specific, not generic OWASP.

Questions to research:
- What are the domain-specific security concerns? (e.g., for a payments app: PCI compliance, tokenization; for a chat app: message encryption, abuse detection)
- What edge cases are unique to this domain?
- What compliance or legal considerations exist?
- What data handling mistakes do similar projects make?
- What auth/authz model does this type of project actually need?

Search framing: Search for security advisories in similar projects, compliance frameworks for this domain, and "security mistakes in [X]" discussions.

---

## 6. Anti-Patterns and Cautionary Tales

What to explicitly avoid.

Questions to research:
- What did similar projects try and abandon?
- What features seem like good ideas but aren't worth the complexity?
- What are the over-engineering traps for this type of project?
- What's the "V2 rewrite" trigger — what decision forces people to start over?
- What premature optimizations waste time in this domain?
- What third-party dependencies become regrets?

Search framing: Look for "why we removed [feature]" posts, framework migration stories, and retrospectives from failed projects in this space.

---

## 7. Strategic Edges and Outlier Moves

What could make this project a category outlier rather than a me-too. **Equal weight to pitfall research** — this is the offensive counterpart.

Questions to research:
- What do the top 1% in this category do differently? (Not just features — positioning, architecture, distribution, polish, pricing, community.)
- What assumptions does the category still share that are ripe to break?
- What capability just became cheap (new primitive, new model, new pattern, new API) that competitors haven't adopted?
- What cross-pollination from adjacent domains hasn't been applied here yet?
- Where is execution weak across the category (speed, polish, copy, onboarding, pricing, distribution, community, docs)?
- What's the "V2 of this category" — what just became possible that wasn't a year ago?
- What did category leaders ship first that seemed risky but paid off? (They took the shot others didn't — what was the shot?)
- What's the boring part everyone does the same way, where differentiation is actually possible?

Search framing: "how [leader] differentiated from [incumbents]", "what made [X] category-defining", "[category]'s unsolved problems", "[adjacent-domain] patterns applied to [target-domain]". Case studies of category leaders are gold — focus on how they positioned, what they built first, what they deferred, what they did that seemed unfashionable at the time.

Scope note: edge research ambition should match project scope. Weekend prototype → the edges are "what makes this version noticeably better than existing quick tools." Production → category-outlier positioning. Enterprise → platform-level differentiation.
