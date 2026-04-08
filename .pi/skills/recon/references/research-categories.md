# Research Categories

Adapt per project type. Not every category applies — a CLI tool doesn't need UX pattern research, a static site doesn't need scaling analysis. Pick what's relevant.

**Priority order by cost-of-being-wrong:** Categories 2 and 4 first (hardest to fix later), then 1 and 3 (adjustable), then 5 and 6 (supplementary).

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
