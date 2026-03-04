---
name: extract
description: >
  Extract knowledge, frameworks, and methodologies from any URL or content.
  Use when: (1) user says "/extract", "extract this", "extract from",
  (2) user shares a URL or file and wants the key insights pulled out,
  (3) user wants to learn from a video, article, or podcast without reading/watching the whole thing.
  NOT for: summarization, news digests, or content that doesn't contain transferable knowledge.
  Requires: yt-dlp (for YouTube). X_BEARER_TOKEN (for X/Twitter threads).
user_invocable: true
trigger: /extract
arguments:
  - name: source
    description: URL (YouTube, article, X/Twitter thread) or file path to extract from
    required: true
---

# /extract — Knowledge Extraction Skill

## When NOT to use this skill

- User wants a summary, digest, or TL;DR → use summarize instead
- Content is news, announcements, or product launches with no methodology → decline and explain
- User wants real-time data, prices, or live information → use web_search instead
- Content is purely promotional/marketing with no transferable insight → say so, don't extract

---

## Quick Reference

| Source | Method |
|--------|--------|
| YouTube | yt-dlp subtitles → Groq audio fallback |
| X/Twitter thread | X API v2 (X_BEARER_TOKEN required) |
| Web article | WebFetch tool |
| Local file / PDF | Read tool |
| Paywalled content | Extract what's accessible, note the wall |

Output always starts with **Source:** [title] — [URL] then knowledge by category.

---

## Workflow

### Step 1: Identify source type and fetch content

**YouTube video** (youtube.com or youtu.be):

```bash
# Step 1: try subtitle extraction
VIDEO_ID=$(echo "<url>" | grep -oE '[?&]v=([^&]+)' | cut -d= -f2)
yt-dlp --write-auto-sub --sub-lang "en" --skip-download --sub-format vtt -o "/tmp/yt-${VIDEO_ID}" "<url>" 2>/dev/null
TRANSCRIPT=$(cat /tmp/yt-${VIDEO_ID}*.vtt 2>/dev/null | grep -v "^WEBVTT" | grep -v "^[0-9]" | grep -v "^$" | tr '\n' ' ')

# Step 2: if no subtitles, transcribe via Groq
if [ -z "$TRANSCRIPT" ]; then
  if [ -z "$GROQ_API_KEY" ]; then
    echo "ERROR: No subtitles found and GROQ_API_KEY is not set. Cannot transcribe. Stop here."
    exit 1
  fi
  yt-dlp -x --audio-format mp3 -o "/tmp/yt-${VIDEO_ID}.%(ext)s" "<url>" 2>/dev/null
  TRANSCRIPT=$(curl -s https://api.groq.com/openai/v1/audio/transcriptions \
    -H "Authorization: Bearer $GROQ_API_KEY" \
    -F "file=@/tmp/yt-${VIDEO_ID}.mp3" \
    -F "model=whisper-large-v3-turbo" | jq -r '.text')
fi
rm -f /tmp/yt-${VIDEO_ID}* 2>/dev/null
```

If both paths fail: tell the user exactly what failed and stop.

---

**X/Twitter thread** (x.com or twitter.com):

Requires X_BEARER_TOKEN in environment. If not set, tell the user and stop.

```bash
# Check for X_BEARER_TOKEN first
if [ -z "$X_BEARER_TOKEN" ]; then
  echo "ERROR: X_BEARER_TOKEN is not set. Cannot fetch X/Twitter threads. Stop here."
  exit 1
fi

TWEET_ID=$(echo "<url>" | grep -oE '[0-9]{15,}' | tail -1)

TWEET_DATA=$(curl -s "https://api.twitter.com/2/tweets/${TWEET_ID}?tweet.fields=conversation_id,author_id,text,created_at&expansions=author_id&user.fields=name,username" \
  -H "Authorization: Bearer $X_BEARER_TOKEN")

CONV_ID=$(echo "$TWEET_DATA" | jq -r '.data.conversation_id')
AUTHOR_ID=$(echo "$TWEET_DATA" | jq -r '.data.author_id')

# Fetch thread (works for threads within last 7 days)
THREAD=$(curl -s "https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${CONV_ID}&tweet.fields=text,created_at,author_id&max_results=100&sort_order=recency" \
  -H "Authorization: Bearer $X_BEARER_TOKEN")

# Filter to author only, reverse to chronological
THREAD_TWEETS=$(echo "$THREAD" | jq -r --arg aid "$AUTHOR_ID" \
  '[.data[] | select(.author_id == $aid)] | reverse | .[].text')
```

If thread is older than 7 days (search returns nothing), fall back to the single tweet and note the limitation.

Reconstruct thread as sequential blockquotes before extracting.

---

**Web article** (any HTTP/HTTPS URL, not YouTube or X):
Use WebFetch: "Return the complete text content of this page. Preserve all details, quotes, examples, and structure. Do not summarize."

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

**Target depth by content length:**
- Under 30 min / short article: 800–1,500 words
- 30–60 min / long article: 1,500–3,000 words
- 1–2 hours: 3,000–5,000 words
- 2+ hours: 4,000–7,000 words

These are floors. Dense content warrants more. Below the floor = you're under-extracting.

---

## Extraction Framework

Use whichever categories are present. Skip empty ones.

### Mental Models & Frameworks
Ways of thinking. Decision heuristics. How experts frame situations differently.

### Systematic Methods & Processes
Step-by-step techniques. Playbooks. Include sequence and reasoning behind each step.

### Use Cases & Applications
Concrete examples — situation, action, result. Include vivid anecdotes even if specific to one person.

### Key Numbers & Benchmarks
Every specific statistic, threshold, ratio, percentage, timeframe, quantity. Never omit or round.

### Predictions & Future Signals
Forward-looking bets, timeline estimates, emerging trends. Preserve the reasoning chain.

### Principles & Heuristics
Underlying truths. Rules of thumb. "Always X, never Y" guidance.

### Contrarian & Non-Obvious Insights
Challenges conventional wisdom. Only include if genuinely non-obvious.

**Include practitioner honesty:** when the speaker admits their practice contradicts their advice, or acknowledges failure.

### Tools & Resources
Named tools, books, people, communities with organic use-case context. Strip affiliate/sponsored mentions.

### Specific Techniques & Tactics
Named techniques, scripts, templates, prompt structures. Concrete and immediately applicable.

---

## Filtering Rules

**Always strip:** sponsored segments, ad reads, CTAs, self-promotion, filler intros/outros.

**Strip time-sensitive noise:** "[Tool] just launched" (unless the build methodology is the insight), pricing, availability dates, capability comparisons that will expire.

**Always preserve:** reasoning behind tool choices, prediction reasoning chains, historical context, every specific number, practitioner admissions, vivid examples, organic tool recommendations with context.

---

## Output Format

**Source:** [title] — [URL]

Then categories as markdown headers (###). Bullet points for discrete insights, numbered lists for processes, blockquotes for sharp direct quotes.

---

## Edge Cases

- **Multiple topics**: Extract all. Separate with ---.
- **Interview format**: Extract from ALL participants. Attribute when it matters.
- **Tutorial/how-to**: Full process. Do not skip steps.
- **Non-English**: Extract in English. Keep original terms in parentheses when needed.
- **2hr+ content**: Do not compress. Below 3,000 words for 2hr+ = under-extracting.
