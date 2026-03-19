---
name: Japanese transcreation feedback
description: Ongoing feedback on JP translation quality — for improving the japanese-transcreation skill
type: feedback
---

Previous feedback (from SeenThis session 2026-03-17) has been folded into skill v2 (published 2026-03-17). The v2 rewrite addressed all 5 items:

1. Staccato fragments → solved by abstraction step breaking English rhythm anchoring
2. English indirectness in titles → headings tier: "ask what this actually means in plain terms"
3. Skipping process steps → simplified to 4 steps, harder to skip
4. Technical terms staying English → English mixing section
5. Context-aware tone / ください misuse → block function analysis in Step 1

## New feedback from v2 development session (2026-03-17)

- **Don't overthink.** A simple prompt (生徒にわかりやすいように日本語に訳して) produced better output than a heavy analytical process. The abstraction step is important for prose but over-analysis kills naturalness.
- **"Professional audience" ≠ "professional tone."** Understanding the audience is tech professionals does NOT mean writing like a corporate robot. Write like a human.
- **になります is a red flag.** Lazy filler verb. If a deliverable or label reaches for になります, it probably needs to be a noun phrase instead.
- **The abstraction step must actually be done.** On volume/routine work, the tendency is to skip it and translate directly. That's when English structure leaks through.
- **ChatGPT one-shotted better output with a simple prompt.** The skill's value is in the abstraction step for prose — don't let the process add overhead that makes output worse.

## Feedback from catcatcat site transcreation (2026-03-19)

- **Terse ≠ confident in Japanese.** English uses short punchy fragments ("Not a logo. A system.") to signal confidence. In Japanese, that same brevity reads as curt or inconsiderate (配慮がない). Japanese warmth requires a bit more words — add enough to show care without being verbose. 親切にわかりやすく means *actually being kind*, not just being brief.
- **"System" needs context-aware translation.** catcatcat uses "system" heavily but it means different things depending on context. Don't default to 仕組み. The nuance map from Japanese design industry research:
  - **デザインシステム** — UI/product design system (loanword, industry standard, keep as-is)
  - **仕組み** — a working mechanism, something practical you built and maintain (warm, hands-on)
  - **体系** — an organized body/framework, brand architecture, how things relate hierarchically (formal, structural)
  - **システム** (katakana) — when referencing the English concept directly, or in compounds; can feel hollow/technical if used alone
  - **設計** — the act of designing a system; intentional, craftsperson's nuance
  - **ブランドシステム / ブランド体系** — brand system; agencies often decompose into BI + VI + ガイドライン rather than bundling
  - In catcatcat's tagline context ("designing systems for the future"), "systems" means creative/brand systems — closer to 体系 or システム than 仕組み. Always ask: is this a mechanism (仕組み), a framework (体系), or a labeled concept (システム)?
- **Avoid だ endings for client-facing copy.** だ is blunt, declarative, masculine-leaning — reads like a manifesto or personal blog, not a studio inviting clients. Better endings: 〜を。(invitational), 〜する。(action-oriented), or noun phrases with no copula (clean, professional). Confirmed on catcatcat site teasers.
- **Don't over-dramatize.** "How it feels matters" → 感覚が、すべてを決める is too dramatic ("feeling decides everything"). Match the energy of the English — if it's soft, keep the JP soft. 感覚を大切にしたものづくり landed better.
