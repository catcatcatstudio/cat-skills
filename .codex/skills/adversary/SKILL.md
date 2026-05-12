---
name: adversary
status: published
description: >
  Adversarial pressure-test of a decision, plan, or piece of work. Articulates the case
  FOR the current approach, then spawns a subagent to steel-man the best alternative,
  returns a synthesis with mandatory verdict. Invoke ONLY via /adversary — do NOT trigger
  on 'what do you think' or 'any concerns'.
argument-hint: "[decision, plan, approach, or strategy to pressure-test — or nothing to pull from context]"
---

# /adversary — Structured Dissent

You pressure-test decisions by arguing against them at full strength. Not generic critique — a concrete alternative, argued honestly, with a verdict at the end.

---

## Step 1: Identify the Target

Determine what's being pressure-tested from the argument, conversation context, open files, and project state.

**Valid targets:** a decision, strategy, architecture choice, positioning, plan, approach, design direction, trade-off call — anything where a reasonable person could choose differently.

**Invalid targets:** bugs (just fix them), syntax questions, factual lookups. If the target isn't a judgment call, say so and stop.

**If clear:** State the target in 1-2 sentences. Proceed.

**If ambiguous:** Ask ONE question:
> "I see [X] and [Y] in play. Which decision should I pressure-test?"

---

## Step 2: Detect the Lens

Auto-detect from context. The lens shapes what the adversary attacks and what "better" means.

| Lens | When | Adversary focuses on |
|------|------|---------------------|
| **Architecture** | Code structure, tech stack, build vs buy, system design | Simpler alternatives, scaling traps, maintenance burden, over-engineering, hidden coupling |
| **Strategy** | Business decisions, prioritization, resource allocation, market positioning | Market assumptions, opportunity cost, resource reality, what competitors would exploit, timing risk |
| **Marketing** | Copy, positioning, messaging, content strategy, audience targeting | Who it *doesn't* land with, what it actually communicates vs intends, stronger positioning, channel mismatch |
| **Design** | UI/UX, visual direction, interaction patterns, information architecture | Whether aesthetic serves function, usability under real conditions, edge cases that break the concept, simpler alternatives that work harder |
| **General** | Anything that doesn't fit the above | What this decision commits you to downstream — second-order lock-in, options it kills, the thing you'll wish you'd considered in 6 months |

The user can override: `/adversary --lens strategy` forces the strategy lens regardless of context.

State the lens in one line before proceeding:
> **Lens:** [lens] — [why this one]

---

## Step 3: Triage — Is This Worth the Full Process?

Before committing to subagent analysis, spend 30 seconds assessing: is there a credible alternative?

- If you can't imagine a smart, informed person choosing differently → **short-circuit.** Tell the user: "I looked for a credible counter-argument and couldn't find one. [1-2 sentences on why this is straightforward.] Your approach is sound." Done.
- If there's real tension → proceed to Step 4.

The point: don't manufacture doubt. Some decisions are just right.

---

## Step 4: Build the Case FOR (Lead Agent — No Subagent)

You do this yourself. You have the full conversation context, project state, and codebase access — a subagent wouldn't.

**Before writing, gather context.** Read whatever is relevant:
- Files the decision touches or depends on
- Project state, memory, or notebook entries
- Conversation history that shaped the decision
- Market/competitive context if it's a strategy call

Then produce the advocate's case:

1. **The core bet** — what this decision assumes is true about the world (2-3 assumptions max, be precise)
2. **Why it's right** — strongest evidence and reasoning FOR (cite specific constraints, context, evidence — not generalities)
3. **What it gets you** — concrete outcomes if this plays out
4. **Known costs** — what you're consciously trading away

Keep it tight. This isn't the output — it's input for the adversary.

---

## Step 5: Run the Adversary

Spawn a subagent. Pass it the full advocate case AND the concrete context it needs — don't assume it can see the conversation.

**What to include in the prompt:**
- The decision being tested (specific, not abstract)
- The lens and what it means
- The full advocate case from Step 4
- Relevant context the adversary needs: project constraints, timeline, resources, market position, technical stack, team size — whatever is load-bearing for this decision. Be generous. The adversary is only as good as the context it receives.

**Adversary prompt structure:**

```
You've read the strongest case FOR a decision. Your job is to steel-man the best alternative —
not poke holes, but argue for a CONCRETE different approach at full strength.

## Decision
[The specific decision being tested — 2-3 sentences]

## Context
[Everything relevant: project state, constraints, resources, timeline, technical reality,
market position, team dynamics. Be specific. Include numbers, dates, names where they matter.
The adversary can't see the conversation — this is all it gets.]

## Lens: [lens]
Focus your attack on: [specific focus areas from the lens table]

## The Advocate's Case
[Full output from Step 4]

## Your Task

Produce:
1. **The alternative** — a specific, concrete different approach (not "don't do it" — what INSTEAD?)
2. **Why it's better** — argue on its own merits, not just against the current approach
3. **Where the advocate is weakest** — which assumption is most fragile? What are they not seeing?
4. **The failure mode** — if the current approach is wrong, how does it fail? What does the damage look like?
5. **The crux** — the single question or assumption that resolves the disagreement:
   "If [X] is true, the current approach wins. If [Y] is true, the alternative wins."

Rules:
- Propose a REAL alternative, not "consider other options"
- Don't be contrarian for sport — argue what you genuinely believe is stronger
- Attack the strongest part of the advocate's case, not the weakest
- If the current approach is actually right, say so — but name what would need to change
  for that to stop being true
- Scale your response to the decision's complexity — simple decisions get short answers
```

---

## Step 6: Synthesize the Decision Brief

Read the adversary's output against your own advocate case. Produce the brief. This is YOUR judgment as the lead agent — not a summary of what the agents said.

### /adversary — Decision Brief

**Target:** [1 sentence]
**Lens:** [lens]

#### The Bet
What the current approach assumes is true. 2-3 bullets max. These are load-bearing — if any one is wrong, the approach breaks.

#### The Counter
The strongest alternative, distilled. What's the core move and why might it win? 3-4 sentences. Not the adversary's full argument — the essence.

#### The Crux
The single question that decides this:
> If [X], stay the course. If [Y], switch.

#### Blind Spots
Things neither side addressed that you noticed. Skip this section entirely if there are none — never manufacture blind spots to fill a template.

#### Verdict
One of four options. Mandatory. No hedging.

- **Hold** — current approach is right, the counter doesn't land
- **Adjust** — right direction, but needs a specific modification (state it)
- **Reconsider** — the alternative is genuinely stronger (say why)
- **Uncertain** — the crux is unresolved and you can't call it (say what information is needed)

2-3 sentences. End with what to do next.

---

## Behavioral Rules

1. **Steel-man, don't strawman.** The alternative must be something a smart, informed person would actually choose. If you can't construct one, short-circuit — don't fake it.

2. **Specificity or nothing.** "Consider the trade-offs" is not dissent. "You're betting that your workshop pipeline converts to enterprise deals within 3 months, but your current lead list has zero enterprise contacts" is dissent.

3. **The crux is the whole point.** If you can't identify a single question that resolves the disagreement, the analysis failed. Try harder or tell the user the decision is straightforward.

4. **Short-circuit when warranted.** Some decisions are just right. "I ran the adversary and the best counter is weak. Here's what it was and why it doesn't hold." A 2-paragraph brief that says "you're right" beats a 2-page brief that manufactures doubt.

5. **Verdict is mandatory.** You must take a position. "It depends" is not a verdict. If genuinely uncertain, name the information that would resolve it.

6. **No re-litigation.** Once the brief is delivered, don't rehash. If the user wants to go deeper, drill into that specific point. If they want to act, execute.

7. **Respect the user's context.** The user knows things you don't — constraints, relationships, history. Surface what's non-obvious, not what they already considered.

8. **Feed the adversary.** The adversary subagent can't see the conversation. The quality of its output is capped by the quality of context you pass it. When in doubt, include more context rather than less. Specific facts > general descriptions.
