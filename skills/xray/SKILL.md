---
name: xray
status: published
description: >
  X/Twitter content intelligence with a social graph. Scout reply opportunities, pulse-
  check topic lanes, track competitors, mirror your accounts, prospect clients. Graph-
  first — built around accounts and topics YOU care about, not generic search. Use when
  user says 'xray', 'x research', 'search x', 'scout', 'pulse', 'track', 'mirror',
  'prospect', '/xray', or needs real-time X discourse / engagement opportunities. NOT for:
  posting tweets or analytics dashboards.
user_invocable: true
trigger: /xray
argument-hint: "[scout|pulse <lane>|track|mirror|prospect|search <query>|setup]"
---

# xray — X/Twitter Content Intelligence

Graph-based X intelligence. Every command operates on your social graph first, broad search second. Money stays focused on accounts and topics that matter to you.

## First Run

If xray isn't configured, run setup:

```bash
bun run xray.ts setup
```

Or in a Claude Code session, say "set up xray for me" — the agent will walk you through it conversationally.

Setup builds your `config.json` through an interview:
- **Your accounts** — what you post from (powers `mirror`)
- **Your lanes** — topics you care about (powers `pulse`)
- **Engage accounts** — bigger accounts you reply to (powers `scout`)
- **Track accounts** — accounts you study (powers `track`)

Everything saves to `config.json`. Edit it anytime. Your graph grows as you discover people worth following.

### Agent-Driven Setup

When running inside Claude Code and the user asks to set up xray, DON'T just run the CLI interview. Instead, conduct the setup conversationally:

1. Ask what their X handle is
2. Ask what topics they post about — suggest lane presets that match
3. Ask who they engage with regularly (bigger accounts in their space)
4. Ask who they study/compete with
5. Build config.json from the answers using the Write tool

This feels more natural than a CLI form. Use the lane presets from xray.ts as options — they cover: design, ai, dev, startup, creative, crypto, marketing, studio.

## Requirements

- **Bun** (runtime): https://bun.sh
- **X_BEARER_TOKEN** (X API): Get at https://developer.x.com (pay-per-use, no subscription)
  - Add to your env: `export X_BEARER_TOKEN=your_token`
  - Or add to `~/.env.keys`: `X_BEARER_TOKEN=your_token`

## Quick Reference

| Command | What it does | Cost | When |
|---------|-------------|------|------|
| `scout` | Reply opportunities from your graph | ~$0.50-1.50 | Daily, before posting |
| `pulse <lane>` | What's hot in a topic lane | ~$1.00-2.00 | Daily, content ideas |
| `track` | Top posts from tracked accounts | ~$1.00-2.50 | Weekly, competitive intel |
| `mirror` | Your own accounts' performance | ~$1.50 | Weekly review |
| `prospect` | Founders who just launched | ~$1.00-2.00 | Finding clients |
| `search <query>` | General search (recent or archive) | ~$0.50/page | Ad-hoc research |
| `setup` | Build your config interactively | free | First run |

## The Social Graph

Your graph lives in `config.json`. Three tiers:

- **own** — Your accounts. Used by `mirror`.
- **engage** — Accounts you reply to daily. Bigger accounts in your lane. Used by `scout`.
- **track** — Accounts you study for competitive intel. Used by `track`.

Manage with:
```bash
bun run xray.ts graph                           # Show full graph
bun run xray.ts graph add engage <user> [note]  # Add to engage tier
bun run xray.ts graph add track <user> [note]   # Add to track tier
bun run xray.ts graph remove <user>              # Remove from any tier
```

The graph IS the strategy — it encodes who matters and why.

## Commands

### scout — Reply opportunities

```bash
bun run xray.ts scout                    # From engage accounts, last 3h
bun run xray.ts scout --since 1h         # More recent only
bun run xray.ts scout design             # Also search a lane
```

Fetches recent posts from your engage tier. Scores by opportunity value:
- Recency (newer = better, first 60 minutes matter most)
- Engagement sweet spot (5-500 likes = noticed but not viral)
- Low reply count (less competition for your reply)
- Author follower count (bigger = more reach)

**Why this matters:** On X, a reply that gets the author to reply back is worth 75x a like in algorithmic weight. Scout finds the tweets where your reply has the highest chance of being seen and replied to.

### pulse — What's hot in a lane

```bash
bun run xray.ts pulse design             # Design engineering
bun run xray.ts pulse ai                 # AI/agents
bun run xray.ts pulse crypto             # Crypto
bun run xray.ts pulse                    # List all available lanes
bun run xray.ts pulse design --since 6h  # Shorter window
bun run xray.ts pulse ai --quality       # Min 10 likes
bun run xray.ts pulse design --save      # Save to file
```

Each lane has curated search queries. `pulse` runs them all, dedupes, ranks by engagement.

**Use for content ideation.** What's the conversation right now? What takes are getting traction? What questions are being asked?

### track — Competitive intelligence

```bash
bun run xray.ts track                    # All tracked accounts, last 7d
bun run xray.ts track --since 3d         # Shorter window
bun run xray.ts track --save             # Save report
```

Batch-fetches top posts from your track tier. Shows what formats and topics work for them.

**Use weekly.** Which formats get the most engagement? What topics are trending? Who's growing and why?

### mirror — Your own performance

```bash
bun run xray.ts mirror                   # All your accounts
bun run xray.ts mirror --count 20        # More posts per account
```

Shows your recent posts with engagement metrics. Compare to competitors (track).

### prospect — Find potential clients

```bash
bun run xray.ts prospect                 # Founders who just launched, last 24h
bun run xray.ts prospect --since 12h
bun run xray.ts prospect --quality       # Higher engagement only
bun run xray.ts prospect --save
```

Searches for people who just launched products/websites. Quote-tweet their launch with a rapid redesign or insight, tag them. When people ask "can you do mine?" — that's the lead.

### search — General purpose

```bash
bun run xray.ts search "your topic" --sort likes --limit 10
bun run xray.ts search "some tool" --from someuser --quick
bun run xray.ts search "topic" --lang ja              # Japanese results
bun run xray.ts search "topic" --archive --since 30d  # Full history
bun run xray.ts search "topic" --quality --save --markdown
```

Options:
- `--sort likes|impressions|retweets|recent` (default: likes)
- `--since 1h|3h|12h|1d|7d|30d` (or ISO timestamp)
- `--archive` — full-archive search (all time, back to 2006)
- `--lang <code>` — language filter (e.g., `ja`, `en`)
- `--from <username>` — shorthand for `from:username`
- `--min-likes N` / `--min-impressions N`
- `--pages N` (1-5)
- `--limit N` (display limit)
- `--quick` — 1 page, max 10, noise filters, 1hr cache
- `--quality` — min 10 likes
- `--no-replies`
- `--save` — save to research path
- `--json` / `--markdown`

### thread / profile / tweet

```bash
bun run xray.ts tweet <tweet_id_or_url>           # Single tweet (FREE via syndication)
bun run xray.ts thread <tweet_id_or_url>          # Root only, FREE
bun run xray.ts thread <tweet_id_or_url> --replies  # Fetch replies (paid API)
bun run xray.ts profile <username>                # Recent posts + bio (paid API)
```

**`tweet` and `thread` default to the free path.** They hit `cdn.syndication.twimg.com` first — no auth, no cost, accepts a tweet URL or bare ID. Only fall back to the paid X API if syndication 404s (deleted/protected tweets), or you pass `--paid` to force it. `thread --replies` still costs API credits because reply fan-out requires `conversation_id` search, which syndication can't do.

`profile` still uses the paid API — there's no free way to list a user's recent posts.

## Deep Research Loop

When doing deep research (not just a quick command):

1. **Decompose** — Turn the question into 3-5 queries using X operators (`from:`, `has:links`, `-is:reply`, `url:github.com`, etc.)
2. **Search and refine** — Run each query. Assess signal vs noise. Tighten operators.
3. **Follow threads** — High-engagement tweets → `thread <id>`. Linked resources → `web_fetch`.
4. **Synthesize** — Group by theme, not by query. Quote key voices with engagement context.
5. **Save** — `--save` flag or manual save to research path.

## Lane Configuration

Lanes live in `config.json`. Each lane has curated queries and noise filters.

```bash
bun run xray.ts lanes                    # Show all configured lanes
```

Lane presets available during setup: design, ai, dev, startup, creative, crypto, marketing, studio. You can also create custom lanes with your own search queries.

Edit `config.json` directly to add, modify, or remove lanes.

## Cost

X API is pay-per-use: $0.005/tweet read, $0.010/user lookup. Every command shows its cost.

Cost-saving features:
- 15-min cache (1hr in quick mode) — repeat queries are free
- 24-hour API dedup — same tweet twice in a day = 1 charge
- `batchProfiles()` — groups user queries to minimize API calls
- Graph-first design — targeted fetches over broad sweeps

## File Structure

```
xray/
├── SKILL.md              # This file (agent instructions)
├── config.json           # Your social graph + lanes (gitignored, personal)
├── config.template.json  # Empty template for new users
├── xray.ts               # CLI entry point
├── lib/
│   ├── api.ts            # X API wrapper (recent + full-archive)
│   ├── cache.ts          # File-based cache, configurable TTL
│   └── format.ts         # Terminal + markdown formatters
├── data/
│   └── cache/            # Auto-managed
└── references/
    └── x-api.md          # X API endpoint reference
```
