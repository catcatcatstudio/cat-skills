---
name: eat
status: published
description: >
  Extract knowledge, frameworks, and methodologies from a URL, file, video, article, or
  podcast. Use when user says '/eat', 'eat this', 'eat from', shares a URL/file for
  insights, or wants to learn from a video/article without reading the whole thing. NOT
  for summarization or news digests. Requires yt-dlp, whisper or GROQ_API_KEY, ffmpeg.
user_invocable: true
trigger: /eat
arguments:
  - name: source
    description: URL (YouTube, article, X/Twitter thread, podcast) or file path to extract from
    required: true
---

# /eat — Knowledge Extraction Skill

## Quick Reference

| Source | Method |
|--------|--------|
| YouTube | yt-dlp subtitles → Groq audio fallback → local Whisper fallback |
| Instagram / TikTok / X video | yt-dlp (cookie-authenticated) → local Whisper → frame extraction |
| Podcast / direct audio | yt-dlp download → Groq transcription → local Whisper fallback |
| X/Twitter thread | X API v2 (X_BEARER_TOKEN required) |
| Web article | defuddle (preferred) or WebFetch |
| Local file / PDF | Read tool |
| Paywalled content | Extract what's accessible, note the wall |

Output always starts with **Source:** [title] — [URL] then knowledge by category.

### Auth & Tools

- **yt-dlp cookies:** Global config at `~/.config/yt-dlp/config` points to Brave browser cookies. Authenticated access to Instagram, X, TikTok — no extra flags needed.
- **Local Whisper:** `whisper` CLI (openai-whisper). Use as fallback when Groq is unavailable or for quick local transcription. Base model is fast enough for most content.
- **defuddle:** `defuddle parse <url> --md` — cleaner article extraction than WebFetch, strips nav/ads/clutter.

---

## Workflow

### Step 1: Identify source type and fetch content

**YouTube video** (youtube.com or youtu.be):

Run `scripts/fetch_youtube.sh <url>` — tries subtitle extraction first, falls back to Groq audio transcription. Outputs transcript to stdout.

If it fails: tell the user exactly what failed and stop.

---

**Instagram / TikTok / X video** (instagram.com, tiktok.com, x.com with video):

yt-dlp is configured with Brave cookies — authenticated access, no extra flags needed.

```bash
# 1. Metadata first (always start here)
yt-dlp --print title --print description --print duration --print uploader --skip-download "<url>"

# 2. Download to tmp
yt-dlp -o "/tmp/extract-%(id)s.%(ext)s" "<url>"

# 3. Transcribe audio with local Whisper
ffmpeg -i /tmp/extract-<id>.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 /tmp/extract-<id>-audio.wav
whisper /tmp/extract-<id>-audio.wav --model base --language en --output_format txt --output_dir /tmp/

# 4. Extract key frames (one every ~10 seconds)
mkdir -p /tmp/extract-frames
ffmpeg -i /tmp/extract-<id>.mp4 -vf "fps=1/10" -q:v 2 /tmp/extract-frames/<id>-%02d.jpg

# 5. Read frames visually — look for on-screen text, diagrams, handwritten notes, visual content
# 6. Synthesize: transcript + visuals + caption
# 7. Trash all temp files when done
```

For visual content (cinematography, design, art): frame extraction is critical — the visuals ARE the knowledge. For talking-head content: transcript carries most of the value, frames are supplementary.

---

**Podcast / direct audio** (MP3/M4A URL, SoundCloud, podcast episode):

yt-dlp handles most audio URLs natively. Use Groq transcription (requires GROQ_API_KEY) or local Whisper as fallback. For RSS feeds: extract the episode `<enclosure>` URL first, then treat as direct audio.

---

**X/Twitter** (x.com or twitter.com):

**The X API bearer token costs money per call. Do not use it unless free methods fail.** Free methods cover ~95% of X content. Try them in order:

### DEFAULT: Free methods (no auth, no cost)

**Step 1 — Syndication API for any tweet URL.** Unauthenticated, free, returns full tweet JSON.

```bash
# Extract tweet ID — the last numeric segment of the URL
curl -s "https://cdn.syndication.twimg.com/tweet-result?id=<TWEET_ID>&token=a"
```

Read from the JSON:
- `text` — tweet body
- `entities.urls[].expanded_url` — any linked URLs (article URLs, external links)
- `article` block (present iff the tweet IS or LINKS an X Article) — has `rest_id`, `title`, `preview_text`

If the tweet is just a short post or link-share, you're done. Extract from `text` + follow the linked URL with the appropriate method (defuddle for articles, /eat recursively for X Articles, etc).

**Step 2 — Browser for X Article bodies.** Syndication gives article metadata only, not the body. yt-dlp 404s. defuddle 404s. Curl returns JS shell. The only working path is the browser tool:

```
tabs_context_mcp (createIfEmpty:true) →
navigate to https://x.com/i/article/<ARTICLE_ID> →
wait ~3s for React hydration (setTimeout 3000 inside javascript_tool) →
javascript_tool: document.body.innerText
```

`javascript_tool` truncates around ~12K chars per result. For long articles, get the length first then slice in chunks:
```js
document.body.innerText.length            // get total length
document.body.innerText.slice(0, 11000)
document.body.innerText.slice(11000, 22000)
// ...
```

Strip X chrome from each chunk: "To view keyboard shortcuts…", author handle line, follow button, reply/repost/like counts.

**Step 3 — Browser for multi-tweet threads** (when syndication only gives the root and you need replies). Navigate the browser to the tweet URL, wait for hydration, then JS-extract the thread DOM. Same chunking pattern as articles.

### LAST RESORT: Paid X API v2 (costs credits)

Only if free methods fail (rare — usually a private/protected account or a deleted tweet that's still cached elsewhere). `scripts/fetch_twitter.sh` uses the paid API. Requires `X_BEARER_TOKEN` in the parent shell env — the `secret-guard.sh` hook blocks sourcing `~/.env.keys` from a Bash subshell, so this only works if the token is already exported. Also limited to threads < 7 days old (search API window).

**Before falling back to the API, tell the user you're about to spend credits and confirm.**

### LAST LAST RESORT
Ask the user to paste the thread text. Reconstruct as sequential blockquotes before extracting.

---

**Web article** (any HTTP/HTTPS URL, not YouTube, X, or social):
Prefer defuddle: `defuddle parse <url> --md` — strips clutter, returns clean markdown.

Fallback to WebFetch if defuddle fails or isn't installed.

If both return garbage (login wall, JS-only rendering): ask the user to paste the article text.

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

---

## Setup & Dependencies

### Required

| Tool | Install | What it does |
|------|---------|-------------|
| yt-dlp | `pip install yt-dlp` or `brew install yt-dlp` | Downloads video/audio from YouTube, Instagram, TikTok, X, and 1000+ sites |
| ffmpeg | `brew install ffmpeg` or [ffmpeg.org](https://ffmpeg.org) | Extracts audio tracks and video frames |

### Transcription (at least one required for video/audio)

| Tool | Install | What it does |
|------|---------|-------------|
| whisper | `pip install openai-whisper` | Local audio transcription — free, no API key, runs on CPU |
| GROQ_API_KEY | [console.groq.com](https://console.groq.com) | Cloud transcription via Groq — faster for long content |

Whisper `base` model is fast and good enough for most content. Use `small` or `medium` for noisy audio or accents. Groq is tried first when available, Whisper is the local fallback.

### Optional

| Tool | Install | What it does |
|------|---------|-------------|
| defuddle | `npm install -g defuddle` | Cleaner article extraction — strips nav, ads, clutter. Falls back to WebFetch |
| X_BEARER_TOKEN | [developer.x.com](https://developer.x.com) | X/Twitter thread fetching via API (pay-per-use) |

### Social media video access (Instagram, TikTok, X)

These platforms block anonymous downloads. To access them, yt-dlp needs cookies from a browser where you're logged in.

**One-time setup:**

```bash
# 1. Create config directory
mkdir -p ~/.config/yt-dlp

# 2. Export cookies from your browser (replace 'brave' with chrome, firefox, etc.)
yt-dlp --cookies-from-browser brave --cookies ~/.config/yt-dlp/cookies.txt --skip-download "https://www.instagram.com/reel/ANYTHING/"

# 3. Set global config so yt-dlp always uses the cookies
echo "--cookies $HOME/.config/yt-dlp/cookies.txt" > ~/.config/yt-dlp/config
```

Supported browsers: `brave`, `chrome`, `firefox`, `edge`, `safari`, `opera`, `vivaldi`.

You must be logged into the platforms you want to access in that browser. Cookies expire — if downloads start failing after a few weeks/months, re-run step 2.

**Without cookies:** YouTube, podcasts, articles, PDFs, and public content all work fine. Only authenticated platform videos (Instagram reels, TikTok, X videos) require cookies.
