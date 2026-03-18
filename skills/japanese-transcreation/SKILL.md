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

This is transcreation (翻訳 + 創作), not translation. The English source is a brief — not a script. Write Japanese that reads as if it were originally written in Japanese.

## The One Thing to Get Right

The default failure mode: staying anchored to the English — preserving its sentence boundaries, information order, and rhetorical patterns, then dressing that structure in Japanese grammar. The result is grammatically correct but immediately identifiable as translated.

The fix is not rules about Japanese. It's breaking the anchor: understand the intent, discard the English, write Japanese from scratch.

## Know the Source Style

The English source is often written in a lyrical, staccato copywriting style — short punchy fragments, abstract evocative phrasing, sentences that hit and move on. Example: "Some gave up. Some ask it simple things. The speed of technology is only moving faster. Becoming more powerful, more intelligent."

This style is the hardest to translate because the instinct is to mirror it: short fragment → short fragment → short fragment. But Japanese doesn't work that way. Japanese builds meaning through clause chains (〜て、〜し、〜ながら、〜が) — where English uses 5 punchy sentences, natural Japanese uses 1-2 flowing sentences with connectors. If your output has as many periods as the English source, you've preserved English rhythm instead of writing Japanese.

The other trap: abstract English words. When the source says "no theory," it doesn't mean 理論 (academic theory) — it means "not a lecture, you'll be doing real work." When it says "real things," it doesn't mean 本物 — it means "actual work tasks, not exercises." Always ask what the English word *means in this context*, not what it translates to in a dictionary.

## Routing

Not all content needs the same treatment.

| Content type | Approach |
|---|---|
| **Prose** (paragraphs, descriptions, body copy) | Full process below |
| **Headings** (section titles) | Ask "what does this section actually do?" and write the Japanese for that. English headings are often abstract ("What's Possible"). Japanese headings describe the thing ("AIを体験する"). Translate meaning, not words. |
| **Short text** (CTAs, UI labels, buttons, nav) | Translate directly. Keep it natural and short. |

Be consistent within groups — all translated or all English, not mixed.

## The Process (for prose)

### 1. Understand the whole first

Read the entire page/document before touching any piece. Know what the page is trying to do (pitch? onboarding? product description?) and what job each content block performs — is it evoking a feeling, setting a scene, presenting information, inviting action, or instructing? This determines register: ください fits instructions, not scene-setting.

### 2. Abstract to job + key facts — and show it

For each prose block, forget the English. Write down the **job** of the block and the **key facts** it needs to convey. Not a simpler version of the English — the actual purpose.

**Output the abstraction visibly before writing any Japanese.** This is not an internal thinking step — show it to the user. If the abstraction contains English source words (e.g. "theory," "takeaways," "deliverables"), it's too literal — rewrite it in terms of what the block *does*, not what it *says*.

See `references/abstraction-example.md` for a concrete good/bad example.

### 3. Write Japanese from the abstraction only

The English source is gone. You're a Japanese copywriter who was briefed on what to say, not shown an English draft.

**Tone:** Clear and human (生徒にわかりやすいように) with startup relevance (スタートアップ向け). Not stiff corporate. Not slangy. Just natural.

- Be concrete — where English loves abstractions (transform your workflow), Japanese prefers what actually happens (仕事が変わる)
- Match the product's own vocabulary — if existing materials use コンテキスト, don't substitute 文脈
- Add or change information freely when the Japanese reader needs it or when the same effect requires a different approach. Fidelity is to the purpose, not the words.

### 4. Read as a native reader

Read the full output as a whole. Does it sound written or translated? Trust your judgment here — if something feels off, it probably is.

Never use em dashes (—) in Japanese output. They don't exist in Japanese typography. Restructure the sentence instead.

## English Mixing

By default, translate everything. English mixing is opt-in — only when the user requests it.

When requested, keep it consistent within groups. Brand names (Claude, catcatcat) and standard technical terms (API, AI) always stay in English.
