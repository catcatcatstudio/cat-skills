# Eye

Design judgment for Claude Code. Not a checklist runner — a design director with taste.

---

## The Problem

AI can audit designs (contrast ratios, WCAG compliance, performance metrics) and it can follow design systems (tokens, spacing scales, component libraries). What it can't do well is the thing that actually matters: **look at an interface and know whether it's good.**

Existing design skills either score against rubrics (critique), check implementation quality (audit), or follow established rules (frontend-design). None of them answer the question a design director answers in 5 seconds: "Does this work?"

Eye is that judgment layer.

## Install

```bash
npx skills add catcatcatstudio/cat-skills --skill eye
```

## Usage

```
/eye                    # review the current page/component
/eye checkout flow      # review a specific feature
/eye [URL]              # review a live page
```

## What It Does

Eye evaluates an interface through the lens of a design director — someone who's seen thousands of interfaces and knows when something works and when it doesn't, often before they can name the rule it violates.

The review:

1. **Reads the intent** — what is this trying to be?
2. **Gut reaction** — first impression before analysis kicks in
3. **Design judgment** — visual hierarchy, typography, color, interaction, information architecture, emotional design, craft. Weighted to what matters for THIS interface.
4. **AI slop check** — does this look like every other AI-generated interface?
5. **Persona pressure test** — specific failure modes through user archetypes
6. **The verdict** — what's working, what's not, and the single most important direction

No scores. No rubrics. No rating bands. Words, opinions, and direction.

## What It's Not

- **Not a fixer.** Eye gives the verdict. Other skills or you do the fixing.
- **Not a checklist.** Something can pass every heuristic and still be mediocre.
- **Not an auditor.** Accessibility scores and performance metrics are audit's job.
- **Not gentle.** Design directors don't hedge.

## Pairs Well With

- **[Frontend Design](../frontend-design/)** — Eye invokes frontend-design for context gathering and design principles. They share a knowledge base.
- **[Liquid Cat Physics](../liquid-cat-physics/)** — Future integration as a third lens alongside elevate (what to do) and prodev (how to build). Eye would be "does it look right" — gating visual work in the THINK phase.

## License

MIT
