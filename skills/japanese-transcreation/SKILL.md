---
name: japanese-transcreation
status: published
description: >
  This skill should be used when translating or localizing English content into Japanese,
  especially for web pages, landing pages, proposals, marketing copy, or UI text.
  Triggers on: "translate to Japanese", "Japanese version", "JP copy", "localize to Japanese",
  "日本語", or when working with data-jp attributes or bilingual HTML files.
  Enforces natural Japanese writing patterns and prevents common LLM translation failures.
---

# Japanese Transcreation

Translate English content into natural, native-quality Japanese. This is transcreation (翻訳 + 創作), not translation. The English source is a brief — not a script. The goal is to write Japanese that reads as if it were originally written in Japanese.

## Core Problem

LLMs produce Japanese that native speakers immediately identify as translated. The root cause: the model stays anchored to the English source — preserving its sentence boundaries, information order, and rhetorical patterns — then dresses that structure in Japanese grammar. The result is grammatically correct but sounds like a translation.

The fix is not more rules. It's a different process: understand the intent, discard the English, then write Japanese from scratch.

## Why Japanese Works Differently

These aren't style tips — they're structural features of the language that make English-anchored translation fail.

**Clause chaining, not sentences.** Japanese builds meaning through chains of subordinate clauses connected by forms like 〜て、〜し、〜ので、〜ながら、〜が. Where English uses 3 short sentences with periods, Japanese uses 1-2 sentences with clause connectors. If your output has more periods than the source has paragraphs, you've preserved English rhythm.

**Topic-comment, not subject-verb.** Japanese organizes around a topic (marked by は), not a grammatical subject. Once established, the topic drops away. Restating subjects — あなた, 私たち, チーム — every sentence is a hallmark of translated Japanese. Natural Japanese drops the subject in roughly 74% of clauses where English requires one.

**Reader-responsible prose.** English spells out logical connections (however, therefore, as a result). Japanese trusts the reader to infer relationships between ideas. Over-connectorizing sounds like a textbook.

**Register shifts are intentional.** Native Japanese documents shift register based on what each section is doing — confident plain form for taglines, polite form for descriptions, humble forms for contact sections. One register throughout is a sign of translation.

## When to Apply What

Not all content needs the same treatment. The full process exists to break free from English sentence structure — short functional text doesn't have that problem.

| Content type | Approach |
|---|---|
| **Prose** (paragraphs, descriptions, body copy) | Full process: understand → abstract → generate → verify |
| **Headings** (h2s, h3s, section titles) | Think about it: ask "what does this actually mean?" and find the direct Japanese expression. English headings are often abstract or evocative ("What's Possible", "Build Real Things"). Japanese headings should describe what the section is actually about (AIを体験する, 実際の業務で作ってみる). Don't translate the words — translate the meaning. |
| **Short text** (CTAs, UI labels, buttons, nav) | Translate directly. Keep it natural and short. |

Be consistent within groups. If session titles are translated, translate all of them. If kept in English, keep all of them.

---

## The Full Process (for prose)

### Step 1: Understand

Read the content as a whole before touching any individual piece.

- **What is this page/document trying to do?** A pitch? A product description? Internal documentation? Onboarding? The answer frames every decision downstream.
- **What is each content block doing?** Each block has a job:

| Function | What it does | Example |
|----------|-------------|---------|
| **Evoking** | Creates a feeling or aspiration | Hero taglines |
| **Scene-setting** | Establishes context, builds urgency | Bridge paragraphs |
| **Presenting** | Describes what exists or happens | Feature descriptions, session breakdowns |
| **Inviting** | Opens a door for the reader | CTAs, contact sections |
| **Instructing** | Tells the reader what to do | Onboarding copy, form labels |

Knowing the block function prevents register mistakes. ください is appropriate for instructing. It's wrong for presenting or scene-setting. A pitch paragraph presents — it doesn't command.

### Step 2: Abstract

For each prose block, strip the English away entirely and write down what it *means* — the key facts, the intent, the emotional job.

This is a semantic brief, not a translation. Write it in plain language. The point is to sever the connection to the English source's sentence structure, word choices, and rhetorical patterns.

**Example:**

English source: "Most people have tried AI. Some gave up. Some ask it simple things. The speed of technology is only moving faster. Becoming more powerful, more intelligent. This workshop is so you can catch up, and get ahead."

Abstract: "Many people have tried AI but aren't using it well. Technology keeps accelerating. This workshop helps you keep up and get ahead."

The English has 6 punchy fragments with a lyrical rhythm. The abstract has 3 plain statements of meaning. The Japanese will be written from the abstract, not from the fragments.

**Do not skip this step.** Without it, the English sentence structure stays in working memory and leaks into the Japanese output. This is the single most important step in the process.

### Step 3: Generate

Write Japanese from the abstraction. The English source is gone at this point.

**Fixed tone:** Write with a balance of clarity (生徒にわかりやすいように) and startup-relevance (スタートアップ向け). Not stiff corporate. Not slangy casual. Just clear, natural, human Japanese.

Guidelines:
- **Write from intent, not from words.** You're a Japanese copywriter who was briefed on what to say, not shown an English draft.
- **Be concrete.** Where English marketing loves abstractions (transform your workflow, unlock productivity), Japanese prefers what actually happens (仕事が変わる, 時間が短縮できる).
- **It's OK to add information** that isn't in the English when the Japanese reader needs it for clarity or concreteness.
- **It's OK to change the meaning** when the same effect requires a different approach in Japanese. Bold claims can become observations. Confrontational framings can become empowering ones. Fidelity is to the purpose, not the words.

### Step 4: Verify

Read the full output as a whole. Check for:

- **Fragment rhythm** — if it reads like short punchy English sentences translated into Japanese, merge them with clause connectors
- **Em dashes (—)** — Japanese doesn't use them. Restructure the sentence.
- **Register consistency** — don't mix です/ます and だ/である within the same section
- **Pronoun density** — too many 私/あなた/彼ら where natural Japanese would drop them
- **Terms that don't communicate** — if a word only makes sense to people who already know the product, consider rewriting it

## English Mixing

By default, translate everything. English mixing (keeping some text in English in JP mode) is opt-in — only when the user requests it.

When English mixing is requested, keep it consistent within groups. Either all session titles are English or all are Japanese. Either all nav labels are English or all are translated.

Things that typically stay in English regardless:
- Brand and product names (Claude, SeenThis, catcatcat)
- Industry-standard technical terms (API, AI, ROI)

## Reference

- **[references/linguistics.md](references/linguistics.md)** — Deep linguistic foundations: contrastive rhetoric, discourse cohesion, register in commercial copy, translationese markers
- **[references/process.md](references/process.md)** — Detailed workflow with examples
