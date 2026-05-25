---
name: scorched-earth
status: published
description: >
  Obsessively thorough analysis. Three modes: build (find every issue in a codebase),
  intake (extract everything from a URL or reference), research (exhaustive investigation
  of a topic). Use when surface-level isn't enough and you need certainty nothing was
  missed. Triggers: '/scorched-earth', 'go scorched earth', 'find everything', 'leave no
  stone unturned', 'I need to be thorough'.
user_invocable: true
trigger: /scorched-earth
argument-hint: "[build|intake|research] [target]"
arguments:
  - name: mode
    description: >
      Which mode to run — 'build' (find every issue in a codebase), 'intake'
      (extract everything from a URL or reference), or 'research' (exhaustive
      investigation of a topic). Omit to let the skill infer mode from the target.
    required: false
  - name: target
    description: >
      What to go scorched-earth on — a directory or file path, a URL, or a
      topic/question. Omit to use the current project or ask.
    required: false
---

# Scorched Earth

Unrelentingly, obsessively thorough analysis. This skill exists for one reason: to make absolutely certain nothing is missed. Not "pretty thorough." Not "good enough." Every file, every function, every claim, every detail — examined, verified, logged.

This is the skill you reach for when the cost of missing something is higher than the cost of being slow. It will take too long. It will find things you didn't ask about. It will be almost annoying in its thoroughness. That's the point.

---

## The Rules

These rules override every default behavior. They exist because LLMs are trained to be convenient, fast, and concise. This skill is none of those things.

### What you MUST do

1. **Enumerate before you examine.** List everything first — every file, every section, every source. Create a task for each. Then examine them one by one. Never start analyzing until you know the full surface area.

2. **Track your progress.** Use tasks. Every area to examine gets a task. Mark it in-progress when you start, completed when you finish. If the task list is empty and you haven't examined everything, something is wrong.

3. **Write findings to disk incrementally.** Never hold findings only in context. After examining each zone or source, append findings to the report file on disk immediately. Context can compact at any time — what's on disk survives.

4. **Be specific or be silent.** Every finding must name the exact file, the exact line, the exact function, the exact problem, and the exact fix. "This area could use improvement" is not a finding. "Line 47 of auth.ts: the JWT expiry check uses `<` instead of `<=`, which means tokens are rejected 1 second before they actually expire — change to `<=`" is a finding.

5. **Go until you're done, not until it feels like enough.** The completion gate for each mode is defined below. You are not done until every condition is met. If you've been running for an hour and there's still unchecked surface area, keep going.

### What you MUST NOT do

1. **Never summarize to save time.** Do not say "and similar issues exist in other files." Find them. List them. Every one.

2. **Never skip because something looks fine.** "This file looks straightforward" is not an examination. Read it. Trace the logic. Check the edge cases. Then you can say it's clean — and say what you checked. Exception: files that are **verifiable by inspection** (lock files, generated code, standard boilerplate config) can be confirmed clean with a one-line note explaining what you verified. That's still thorough. Reading 5000 lines of lock file is not thorough — it's theater.

3. **Never group findings to reduce length.** Each issue is its own entry with its own location, its own explanation, its own fix. Do not batch "several files have this problem" — name every file.

4. **Never say "and so on" or "etc."** If there are 15 instances, list 15 instances.

5. **Never stop because the report is getting long.** Length is not a reason to stop. Coverage is the only metric that matters.

6. **Never assume something works because it hasn't been reported as broken.** Verify it yourself.

---

## Mode Detection

The mode is determined by the argument:

| Input | Mode |
|-------|------|
| `/scorched-earth` (no argument) | **Build** — sweep the entire current project |
| `/scorched-earth [url]` | **Intake** — exhaustive extraction from the URL |
| `/scorched-earth research [topic]` | **Research** — exhaustive investigation of a topic |

---

## Build Mode

Sweep the entire project. Find every issue. Miss nothing.

### Phase 1: Surface Area Mapping

Before examining anything, map everything that exists.

**1. File inventory** — every file in the project, categorized:

| Category | Examples |
|----------|---------|
| Entry points | Main files, route handlers, API endpoints, CLI commands |
| Core logic | Business rules, data processing, algorithms |
| Auth & security | Auth middleware, permission checks, token handling |
| Data layer | Database queries, migrations, models, schemas |
| External integrations | API clients, webhooks, third-party SDKs |
| Infrastructure | Config, build, CI, deployment |
| Utilities and helpers | Shared functions, formatting, validation |
| Types and interfaces | Type definitions, shared contracts |
| Tests | Unit, integration, e2e |
| Documentation | README, docs, comments |
| Boilerplate & generated | Lock files, generated types, standard configs |

**2. Risk-priority ordering** — not all code carries equal risk. Rank zones by blast radius:

| Priority | What goes here | Why |
|----------|---------------|-----|
| P0 — examine first | Auth, payments, data mutations, external integrations, entry points | Bugs here cause security breaches, data loss, or money loss |
| P1 — examine second | Core business logic, state management, data layer | Bugs here cause incorrect behavior users will hit |
| P2 — examine third | Utilities, helpers, UI components, formatting | Bugs here cause annoyance, not damage |
| P3 — verify by inspection | Lock files, generated code, standard config, static assets | Confirm they're standard, mark clean, move on |

If context runs out before finishing, at least P0 and P1 were covered. That's the insurance policy.

**3. Zone the project** — group files into zones by directory or domain. Each zone is a self-contained examination unit. When a zone is complete, its findings are written to disk before moving to the next zone. This is how you survive context compaction — completed zones are already persisted.

**4. Create tasks** — one task per zone, ordered by priority. The task list IS your checklist.

Output the full map before proceeding. This is your contract for what "done" means.

### Phase 2: Systematic Sweep

Examine every zone from the task list, in priority order. For each file in the zone, do one thorough read with all five lenses active simultaneously:

**The Five Lenses** (applied in a single read, not five separate passes):

**Logic and correctness:**
- Does this code do what it claims to do?
- What inputs are possible? What happens at each boundary?
- What happens when the happy path doesn't happen?
- Off-by-one errors, null/undefined paths, type coercion traps
- Race conditions, timing dependencies
- State that can get out of sync

**Security and trust boundaries:**
- Where does user input enter? Is it validated?
- Auth checks — are they present everywhere they should be?
- Data exposure — can internal state leak?
- Injection vectors (SQL, XSS, command, path traversal)
- Secrets in code, logs, or error messages

**Error handling and failure modes:**
- What happens when external services are down?
- What happens when data is malformed?
- Are errors caught? Are they caught at the right level?
- Silent failures — operations that fail without anyone knowing
- Error messages — do they help debugging or hide the problem?

**Edge cases and assumptions:**
- What does this code assume about its environment, its callers, its data?
- Which of those assumptions are verified vs hoped?
- Empty arrays, null values, concurrent access, disk full, network timeout
- Timezone issues, locale issues, encoding issues
- What happens at scale? (1 item works — what about 100,000?)

**Code quality and maintainability:**
- Dead code, unreachable branches, unused exports
- Naming that misleads (function says "get" but it mutates)
- Abstraction mismatches (doing too much, doing too little)
- Duplicated logic that will drift
- Missing types where they'd prevent bugs
- Test coverage gaps — what's tested vs what isn't, and do the tests actually verify behavior or just run without asserting?

**After each zone:** Write that zone's findings to the report file on disk immediately. Mark the zone task as completed. Then move to the next zone.

### Phase 3: Cross-Cutting Concerns

After the zone-by-zone sweep, do a connecting pass across the entire codebase for concerns that span zones:

- **Data flow integrity** — trace data from entry to storage to output. Can it get corrupted, lost, or exposed at any point in the chain?
- **Auth/permission consistency** — is the same permission model enforced everywhere, or do some paths skip checks?
- **Error propagation** — do errors surface correctly up the call chain, or do they get swallowed somewhere?
- **Configuration** — are all config values validated? What happens with missing config? Are defaults safe?
- **Dependency health** — outdated packages, known vulnerabilities, abandoned dependencies
- **Consistency** — do similar operations across different zones handle things the same way, or are there divergent patterns that will confuse the next person?

Append cross-cutting findings to the report file on disk.

### Phase 4: Report

The report has been built incrementally on disk throughout Phases 2-3. Now finalize it.

**Report location:** `_docs/scorched-earth-build-[YYYY-MM-DD].md`

If `_docs/` doesn't exist, create it.

**Report structure:**

```markdown
# Scorched Earth — Build Report
## Project: [name]
## Date: [date]
## Surface area: [N files across K zones, M entry points]

---

### Critical (fix before shipping)
[numbered list — each with file:line, description, why it matters, fix]

### Serious (fix soon)
[numbered list — same format]

### Moderate (fix when touching this area)
[numbered list — same format]

### Minor (improve over time)
[numbered list — same format]

### Clean Areas (examined, no issues found)
[list of files/areas that were examined and verified clean — this proves coverage]

### Recommendations
[architectural or structural suggestions that aren't bugs but would prevent future ones]
```

The **Clean Areas** section is mandatory. It's proof of coverage. If a file doesn't appear in either the findings or the clean list, it wasn't examined — and that means you're not done.

**After the report:** Create tasks for every Critical and Serious finding so they can be knocked out systematically. Offer to pipe into `/architect` if the findings suggest structural changes that need a build plan.

### Completion Gate

You are not done until:
- [ ] Every zone in the task list is marked completed
- [ ] Findings for each zone are written to disk (not just in context)
- [ ] Every finding has a specific file, line, description, and fix
- [ ] The Clean Areas list accounts for every file not in the findings
- [ ] Cross-cutting concerns have been checked
- [ ] The report is finalized on disk
- [ ] Tasks are created for Critical and Serious findings

---

## Intake Mode

Exhaustive extraction from a URL or reference. Not a summary — everything.

### Variant Detection

Detect the type of source and adapt the extraction:

| Source type | Detected by | Adaptation |
|------------|-------------|------------|
| **Website / landing page** | URL to a live site | Full site teardown — see below |
| **Article / blog post** | URL to written content | Content extraction — all claims, techniques, specifics |
| **Video / podcast** | YouTube, social media URL | Transcript + visual extraction via `/eat` pipeline |
| **Repository** | GitHub/GitLab URL | README, docs, source, examples, architecture |
| **Documentation** | Docs site URL | Every page, every example, every API reference |

### Phase 1: Full Absorption

Fetch the content. Read all of it. If it's a multi-page site, read every page. If it's a video, get the full transcript. If it's a repo, read the README, docs, source, and examples. Do not skim. Do not sample.

**For website teardowns** (the most common intake use case — studying a site to clone or recreate):

| What to capture | Details |
|----------------|---------|
| **Section catalog** | Every distinct section, named and described, in page order |
| **Layout & structure** | Component hierarchy, grid/flex patterns, container widths, section heights |
| **Typography** | Font families, sizes, weights, line heights, letter spacing. Heading scale. Body vs display. |
| **Color palette** | Every color used — backgrounds, text, accents, borders, shadows. Extract exact values where possible. |
| **Spacing patterns** | Section padding, element gaps, consistent spacing units |
| **Responsive behavior** | Breakpoints, what changes at each, mobile vs desktop layout shifts |
| **Interactions** | Hover states, click behavior, scroll effects, animations, transitions, modals, dropdowns |
| **Navigation** | Nav structure, menu behavior, footer links, internal linking patterns |
| **Content structure** | Heading hierarchy, content blocks, media placement, CTA placement |
| **Tech stack** | Framework, libraries, fonts loaded, analytics, third-party scripts (visible in source) |
| **Assets** | Images, icons (icon library or custom), illustrations, video embeds |

Read the page source where possible, not just the rendered content.

### Phase 2: Multi-Pass Extraction

**Pass 1 — Concrete details:**
Every specific number, name, date, URL, technical term, tool name, version, measurement, claim, and quote. If it's specific, it gets pulled out.

**Pass 2 — Structure and patterns:**
How is the content organized? What's the information hierarchy? What design patterns, code patterns, or structural patterns are used? What's the system behind the surface?

**Pass 3 — Techniques and methods:**
Every technique, methodology, approach, or process described or demonstrated. Step-by-step where possible.

**Pass 4 — Gap analysis:**
What's NOT said? What would you expect to see that's missing? What does the author/builder take for granted? What questions does this content raise but not answer?

**Pass 5 — Contradictions and verification:**
Does anything conflict with itself? Does anything conflict with known facts? Are there claims that need independent verification?

### Phase 3: Output

Create a structured doc in the project's `_docs/` directory:

```
_docs/
  [source-name]/
    overview.md          — what this source is and why it was examined
    details.md           — the full extraction (passes 1-3)
    gaps.md              — what's missing, what to verify (passes 4-5)
    assets/              — screenshots, diagrams, saved references (if applicable)
```

**For website teardowns**, replace `details.md` with a more specific structure:

```
_docs/
  [site-name]/
    overview.md          — what the site is, tech stack, overall assessment
    sections.md          — every section cataloged with layout, content, interactions
    design-system.md     — typography, colors, spacing, component patterns
    interactions.md      — animations, transitions, hover states, scroll effects
    gaps.md              — what's missing, what to verify, what to improve on
    assets/              — screenshots, reference images
```

If `_docs/` doesn't exist, create it. The `[source-name]` should be descriptive and slugified — e.g., `stripe-checkout-docs`, `linear-landing-page`, `react-server-components-rfc`.

**After output:** Offer to create tasks from the findings if they imply work to be done (e.g., "recreate section X", "implement pattern Y"). Offer to pipe into `/architect` if the intake was for a build project.

### Completion Gate

You are not done until:
- [ ] Every page/section of the source has been read (not skimmed)
- [ ] Every concrete detail has been extracted
- [ ] Structural patterns have been identified
- [ ] Gaps and missing information have been documented
- [ ] The output files are written to `_docs/[source-name]/`
- [ ] For website teardowns: all 10 capture categories have been addressed

---

## Research Mode

Exhaustive investigation of a topic. Not "here's what I know" — go find out what's actually true, from multiple sources, cross-referenced.

### Phase 1: Scope Definition

Before researching, define what "done" looks like:
- What specific questions need answering?
- What decisions will this research inform?
- What's the domain? (so you know what kind of sources to trust)

### Phase 2: Multi-Source Investigation

Find and examine substantive sources until you stop finding new information. Not blog posts that rehash each other — primary sources: official docs, engineering blog posts, RFCs, source code, conference talks, postmortems, issue trackers.

**Minimum 3 sources. No maximum.** The signal to stop is diminishing returns — when a new source repeats what you've already found without adding anything, you're approaching coverage. If the first 3 sources all say different things, keep going. If 5 sources converge, you're probably done.

For each source:
- Run a mini intake extraction (concrete details, techniques, gaps)
- Note where sources agree (high confidence)
- Note where sources disagree (needs judgment)
- Note what only one source mentions (might be noise, might be gold)

Use web search, context7, docs sites, GitHub repos. Parallel research agents where possible to cover more ground.

### Phase 3: Synthesis

Don't just stack sources — synthesize them:

- **Consensus findings** — what every credible source agrees on
- **Contested findings** — where sources disagree, why they disagree, which interpretation is more credible and why
- **Unique findings** — things only one source covers that seem credible
- **Open questions** — things the research couldn't resolve
- **Recommended approach** — given everything found, what should you actually do? Be opinionated.

### Phase 4: Output

```
_docs/
  [topic-name]/
    overview.md          — research question, scope, sources used
    findings.md          — the full synthesis
    sources.md           — annotated list of every source examined
    open-questions.md    — what couldn't be resolved
```

**After output:** Offer to create tasks from the findings if they imply work. Offer to pipe into `/architect` if the research was prep for a build.

### Completion Gate

You are not done until:
- [ ] Sources have been examined until diminishing returns
- [ ] At least 3 substantive primary sources
- [ ] Sources have been cross-referenced
- [ ] Contradictions between sources have been addressed
- [ ] The synthesis answers the original research questions
- [ ] Open questions are documented honestly
- [ ] The output files are written to `_docs/[topic-name]/`

---

## Anti-Convenience Safeguards

These exist because LLM default behavior fights this skill's purpose at every turn.

**The context window problem:** Long examinations risk context compaction, which loses findings. This is the #1 threat to this skill working on real projects. Mitigate:
- Write findings to disk after every zone (build mode) or every pass (intake/research mode). Never hold findings only in context.
- If you feel context getting heavy, persist everything you have NOW before continuing.
- Use `/memento auto on` if available to survive compaction.
- The zone-based chunking in build mode exists specifically for this — each zone is self-contained and persisted before the next one starts.

**The "good enough" trap:** After examining 60% of the codebase, the model will feel like it has a representative picture and want to extrapolate. Do not extrapolate. Examine the remaining 40%. The bugs that matter most are the ones hiding in the parts you'd skip.

**The summarization reflex:** When output gets long, the model compresses. "Several files have this issue" replaces specific instances. Fight this actively. If you catch yourself generalizing, go back and enumerate.

**The false completion signal:** The model wants to report "done" and deliver a clean output. If the report feels tidy and complete after examining half the project, you're not done — you're halfway. Check the task list.

**The depth-vs-breadth trap:** The model may go deep on the first few files and shallow on the rest as context fills up. All files at the same priority level get the same depth. If you're going shallow, you're not scorching earth — you're mowing the lawn.

**The handoff gap:** After generating a report, don't just drop it. Create tasks for actionable findings. Offer to connect to other skills (`/architect` for structural changes, `/fortify` for test gaps found). The report is the beginning of the work, not the end.
