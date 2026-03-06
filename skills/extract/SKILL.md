---
name: extract
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

```bash
TMPDIR=$(mktemp -d)

# Step 1: try subtitle extraction — use SRT conversion to handle auto-caption dedup
yt-dlp --write-auto-sub --sub-lang "en" --skip-download --convert-subs srt -o "${TMPDIR}/sub" "<url>" 2>/dev/null
TRANSCRIPT=$(cat ${TMPDIR}/sub*.srt 2>/dev/null | grep -v "^[0-9]" | grep -v "^\-\->" | grep -v "^$" | sed 's/<[^>]*>//g' | tr '\n' ' ')

# Step 2: if no subtitles, transcribe via Groq
if [ -z "$TRANSCRIPT" ]; then
  if [ -z "$GROQ_API_KEY" ]; then
    echo "ERROR: No subtitles found and GROQ_API_KEY is not set. Cannot transcribe."
    rm -rf "$TMPDIR"
    exit 1
  fi
  yt-dlp -x --audio-format mp3 --audio-quality 9 -o "${TMPDIR}/audio.%(ext)s" "<url>" 2>/dev/null

  # Check file size — Groq limit: 25MB free tier, 100MB dev tier
  FILESIZE=$(stat -f%z "${TMPDIR}/audio.mp3" 2>/dev/null || stat -c%s "${TMPDIR}/audio.mp3" 2>/dev/null)
  if [ "$FILESIZE" -gt 100000000 ]; then
    echo "ERROR: Audio too large for Groq ($(($FILESIZE/1048576))MB, limit 100MB). Try a shorter video."
    rm -rf "$TMPDIR"
    exit 1
  fi

  TRANSCRIPT=$(curl -s https://api.groq.com/openai/v1/audio/transcriptions \
    -H "Authorization: Bearer $GROQ_API_KEY" \
    -F "file=@${TMPDIR}/audio.mp3" \
    -F "model=whisper-large-v3-turbo" | jq -r '.text')
fi
rm -rf "$TMPDIR"
```

If both paths fail: tell the user exactly what failed and stop.

---

**Podcast / direct audio** (MP3/M4A URL, SoundCloud, podcast episode):

yt-dlp handles most audio URLs natively. Use the same Groq transcription path as the YouTube fallback (requires GROQ_API_KEY). For RSS feeds: extract the episode `<enclosure>` URL first, then treat as direct audio.

---

**X/Twitter thread** (x.com or twitter.com):

X blocks all unauthenticated access. Requires X_BEARER_TOKEN in environment.
X API uses pay-per-use credits — each call costs credits from your balance.

If X_BEARER_TOKEN is not set: ask the user to paste the thread text directly.
"X requires a paid API for access. Paste the thread text and I'll extract from that."

```bash
if [ -z "$X_BEARER_TOKEN" ]; then
  echo "X_BEARER_TOKEN is not set. Ask user to paste thread text."
  exit 1
fi

TWEET_ID=$(echo "<url>" | grep -oE '[0-9]{15,}' | tail -1)

# Fetch root tweet with conversation context
TWEET_DATA=$(curl -s "https://api.twitter.com/2/tweets/${TWEET_ID}?tweet.fields=conversation_id,author_id,text,created_at&expansions=author_id&user.fields=name,username" \
  -H "Authorization: Bearer $X_BEARER_TOKEN")

CONV_ID=$(echo "$TWEET_DATA" | jq -r '.data.conversation_id')
AUTHOR_ID=$(echo "$TWEET_DATA" | jq -r '.data.author_id')

# Fetch thread (search/recent — last 7 days only)
THREAD=$(curl -s "https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${CONV_ID}&tweet.fields=text,created_at,author_id&max_results=100&sort_order=recency" \
  -H "Authorization: Bearer $X_BEARER_TOKEN")

# Filter to author only, reverse to chronological
THREAD_TWEETS=$(echo "$THREAD" | jq -r --arg aid "$AUTHOR_ID" \
  '[.data[] | select(.author_id == $aid)] | reverse | .[].text')
```

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

If the user says "save this" or "write this", write to:
`~/brain/extractions/YYYY-MM-DD-<slugified-title>.md`

---

## Edge Cases

- **Multiple topics**: Extract all. Separate with ---.
- **Interview format**: Extract from ALL participants. Attribute when it matters.
- **Tutorial/how-to**: Full process. Do not skip steps.
- **Non-English**: Extract in English. Keep original terms in parentheses when needed.
- **2hr+ content**: Do not compress. Match depth to density tier.
