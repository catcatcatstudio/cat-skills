---
name: extract
status: published
description: >
  Extract knowledge, frameworks, and methodologies from any URL or content.
  Use when: (1) user says "/extract", "extract this", "extract from",
  (2) user shares a URL or file and wants the key insights pulled out,
  (3) user wants to learn from a video, article, or podcast without reading/watching the whole thing.
  NOT for: summarization, news digests, or content that doesn't contain transferable knowledge.
  Requires: yt-dlp (for YouTube/audio). GROQ_API_KEY (for audio transcription fallback). X_BEARER_TOKEN (for X/Twitter threads).
user_invocable: true
trigger: /extract
arguments:
  - name: source
    description: URL (YouTube, article, X/Twitter thread, podcast) or file path to extract from
    required: true
---

# /extract — Knowledge Extraction Skill

## Quick Reference

| Source | Method |
|--------|--------|
| YouTube | yt-dlp subtitles → Groq audio fallback |
| Podcast / direct audio | yt-dlp download → Groq transcription |
| X/Twitter thread | X API v2 (X_BEARER_TOKEN required) |
| Web article | WebFetch tool |
| Local file / PDF | Read tool |
| Paywalled content | Extract what's accessible, note the wall |

Output always starts with **Source:** [title] — [URL] then knowledge by category.

---

## Workflow

### Step 1: Identify source type and fetch content

**YouTube video** (youtube.com or youtu.be):

Run `scripts/fetch_youtube.sh <url>` — tries subtitle extraction first, falls back to Groq audio transcription. Outputs transcript to stdout.

If it fails: tell the user exactly what failed and stop.

---

**Podcast / direct audio** (MP3/M4A URL, SoundCloud, podcast episode):

yt-dlp handles most audio URLs natively. Use the same Groq transcription path as the YouTube fallback (requires GROQ_API_KEY). For RSS feeds: extract the episode `<enclosure>` URL first, then treat as direct audio.

---

**X/Twitter thread** (x.com or twitter.com):

X blocks all unauthenticated access. Requires X_BEARER_TOKEN in environment.
X API uses pay-per-use credits — each call costs credits from your balance.

Run `scripts/fetch_twitter.sh <url>` — fetches the thread via X API v2, filters to author tweets, outputs in chronological order.

If X_BEARER_TOKEN is not set: ask the user to paste the thread text directly.
"X requires a paid API for access. Paste the thread text and I'll extract from that."

If the thread is older than 7 days (search returns empty): ask the user to paste the thread text.
"This thread is older than 7 days — X's search API can't reach it. Paste the thread text and I'll extract from that."

Reconstruct thread as sequential blockquotes before extracting.

---

**Web article** (any HTTP/HTTPS URL, not YouTube or X):
Use WebFetch: "Return the complete text content of this page. Preserve all details, quotes, examples, and structure. Do not summarize."

If WebFetch returns garbage (login wall, JS-only rendering): ask the user to paste the article text.

**Paywalled content:** Note it clearly at the top:
> Warning: Paywalled — only the free preview was accessible. Extraction is based on partial content.

Then extract whatever is accessible. Do not fabricate beyond the paywall.

**Local file / PDF**: Use the Read tool directly.

---

### Step 2: Assess content quality

Before extracting, scan the raw content:
- **Shallow** (listicle, hype, no real methodology) — say so in 1-2 lines. Don't manufacture depth.
- **News/announcement-only** — extract only if real methodology is buried in it.
- **Substantial** — proceed.

### Step 3: Extract knowledge

**Target depth by insight density, not raw length.**

First, assess density:
- **High density** (every minute has new ideas): technical talks, dense essays, practitioner deep-dives
- **Medium density** (mixed signal/filler): most interviews, conference talks, long-form articles
- **Low density** (mostly filler, few real insights): casual podcasts, rambling discussions

| Content length | High density | Medium density | Low density |
|---------------|-------------|---------------|------------|
| Short (<30m / short article) | 1,000–1,500 | 800–1,200 | 500–800 |
| Medium (30–60m / long article) | 2,000–3,000 | 1,500–2,000 | 800–1,200 |
| Long (1–2hr) | 3,000–5,000 | 2,000–3,000 | 1,000–1,500 |
| Very long (2hr+) | 5,000–7,000 | 3,000–4,000 | 1,500–2,500 |

These are floors. Dense content warrants more. Below the floor = you're under-extracting.
Low density + short content may not be worth extracting at all — say so.

---

## Extraction Framework

Use whichever categories are present. Skip empty ones.

### Mental Models & Frameworks
Ways of thinking. Decision heuristics. How experts frame situations differently.

### Systematic Methods & Processes
Step-by-step techniques. Playbooks. Include sequence and reasoning behind each step.

### Specific Techniques & Tactics
Named techniques, scripts, templates, prompt structures. Concrete and immediately applicable.

### Key Numbers & Benchmarks
Every specific statistic, threshold, ratio, percentage, timeframe, quantity. Never omit or round.

### Use Cases & Applications
Concrete examples — situation, action, result. Include vivid anecdotes even if specific to one person.

### Principles & Heuristics
Underlying truths. Rules of thumb. "Always X, never Y" guidance.

### Contrarian & Non-Obvious Insights
Challenges conventional wisdom. Only include if genuinely non-obvious.

**Include practitioner honesty:** when the speaker admits their practice contradicts their advice, or acknowledges failure.

### Predictions & Future Signals
Forward-looking bets, timeline estimates, emerging trends. Preserve the reasoning chain.

### Tools & Resources
Named tools, books, people, communities with organic use-case context. Strip affiliate/sponsored mentions.

---

## Filtering Rules

**Always strip:** sponsored segments, ad reads, CTAs, self-promotion, filler intros/outros.

**Strip time-sensitive noise:** "[Tool] just launched" (unless the build methodology is the insight), pricing, availability dates, capability comparisons that will expire.

**Always preserve:** reasoning behind tool choices, prediction reasoning chains, historical context, every specific number, practitioner admissions, vivid examples, organic tool recommendations with context.

---

## Output Format

**Source:** [title] — [URL]

Then categories as markdown headers (###). Bullet points for discrete insights, numbered lists for processes, blockquotes for sharp direct quotes.

## Output Destination

By default, print the extraction to the conversation.

If the user says "save this" or "write this", ask where to save. Default to `./YYYY-MM-DD-<slugified-title>.md` in the current working directory.

---

## Edge Cases

- **Multiple topics**: Extract all. Separate with ---.
- **Interview format**: Extract from ALL participants. Attribute when it matters.
- **Tutorial/how-to**: Full process. Do not skip steps.
- **Non-English**: Extract in English. Keep original terms in parentheses when needed.
- **2hr+ content**: Do not compress. Match depth to density tier.
