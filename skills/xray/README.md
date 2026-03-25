# xray

X/Twitter content intelligence for [Claude Code](https://claude.ai/code). Build a social graph, scout for reply opportunities, pulse-check your topic lanes, track competitors, and find clients — all from the terminal.

## What it does

Most X tools treat Twitter as a firehose. xray treats it as a graph. You tell it who matters to you (accounts you engage with, accounts you study, topics you care about), and every command operates on that graph. Targeted intelligence, not noise.

| Command | What it does |
|---------|-------------|
| **scout** | Reply opportunities from your engage list — scored by recency, engagement sweet spot, and reply competition |
| **pulse** | What's hot in a topic lane right now — curated queries, deduped, ranked |
| **track** | Top posts from accounts you study — competitive intel, weekly patterns |
| **mirror** | Your own accounts' performance — engagement metrics, what worked |
| **prospect** | Founders who just launched — find potential clients |
| **search** | General X search with full-archive support, language filters, and cost tracking |

Plus: `thread`, `profile`, `tweet`, `graph` management, and `setup`.

## Install

```bash
# Claude Code
cd ~/.claude/skills
git clone https://github.com/catcatcatstudio/cat-skills.git
# Skill is at cat-skills/skills/xray/
```

Or copy the `xray/` directory into your own skills folder.

## Setup

You need two things:

1. **Bun** — https://bun.sh
2. **X API token** — https://developer.x.com (pay-per-use, no subscription needed)

Set your token:
```bash
export X_BEARER_TOKEN=your_token_here
# Or add to ~/.env.keys: X_BEARER_TOKEN=your_token_here
```

Then run setup to build your social graph:

```bash
bun run xray.ts setup
```

Or in Claude Code, just say "set up xray for me."

Setup asks four things: your X handle(s), what topics you care about, who you engage with, and who you study. Two minutes, then you're running.

## Usage

```bash
# Daily: find reply opportunities (last 3 hours)
bun run xray.ts scout

# Daily: what's hot in your lane
bun run xray.ts pulse design
bun run xray.ts pulse ai

# Weekly: what worked for competitors
bun run xray.ts track

# Weekly: how did your posts do
bun run xray.ts mirror

# Ad-hoc: find clients
bun run xray.ts prospect

# Ad-hoc: search anything
bun run xray.ts search "your topic" --sort likes
bun run xray.ts search "topic" --archive --since 30d
```

In Claude Code, use natural language: "scout for reply opportunities", "pulse the design lane", "what did my competitors post this week."

## The Social Graph

Your graph has three tiers:

- **own** — Your accounts. Powers `mirror`.
- **engage** — Bigger accounts you reply to. Powers `scout`.
- **track** — Accounts you study. Powers `track`.

```bash
bun run xray.ts graph                          # Show your graph
bun run xray.ts graph add engage shadcn "UI"   # Add to engage tier
bun run xray.ts graph add track levelsio       # Add to track tier
bun run xray.ts graph remove someuser          # Remove from any tier
```

The graph grows as you discover people worth following. It IS the strategy.

## Lanes

Lanes are topic clusters that power `pulse`. Presets included:

`design` `ai` `dev` `startup` `creative` `crypto` `marketing` `studio`

Pick during setup, or add custom lanes in `config.json`. Each lane has curated search queries — edit them to match your niche.

```bash
bun run xray.ts lanes    # Show all configured lanes
```

## Cost

X API is pay-per-use: $0.005 per tweet read. Every command shows its cost.

| Command | Typical cost |
|---------|-------------|
| scout | ~$0.50-1.50 |
| pulse | ~$1.00-2.00 |
| track | ~$1.00-2.50 |
| mirror | ~$1.50 |
| search (1 page) | ~$0.50 |

Cost-saving: 15-min cache, 1hr cache in quick mode, batch API calls, graph-first (targeted queries, not broad sweeps).

## License

MIT
