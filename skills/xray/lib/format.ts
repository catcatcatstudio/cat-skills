/**
 * Terminal-native and markdown formatters for X research output.
 */

import type { Tweet } from "./api";

export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function cleanText(text: string): string {
  return text.replace(/https:\/\/t\.co\/\S+/g, "").trim();
}

// --- Terminal output ---

export function formatTweet(
  t: Tweet,
  index?: number,
  opts?: { full?: boolean; showFollowers?: boolean }
): string {
  const prefix = index !== undefined ? `${index + 1}. ` : "";
  const likes = compactNumber(t.metrics.likes);
  const impressions = compactNumber(t.metrics.impressions);
  const replies = compactNumber(t.metrics.replies);
  const time = timeAgo(t.created_at);
  const followers =
    opts?.showFollowers && t.author_followers
      ? ` [${compactNumber(t.author_followers)} followers]`
      : "";

  const text =
    opts?.full || t.text.length <= 220
      ? cleanText(t.text)
      : cleanText(t.text).slice(0, 217) + "...";

  let out = `${prefix}@${t.username}${followers}  ${likes} likes / ${impressions} views / ${replies} replies  (${time})`;
  out += `\n   ${text.replace(/\n/g, "\n   ")}`;

  if (t.urls.length > 0) {
    out += `\n   ${t.urls[0]}`;
  }
  out += `\n   ${t.tweet_url}`;

  return out;
}

export function formatResults(
  tweets: Tweet[],
  opts: { query?: string; limit?: number; header?: string } = {}
): string {
  const limit = opts.limit || 15;
  const shown = tweets.slice(0, limit);

  let out = "";
  if (opts.header) {
    out += `${opts.header}\n${"─".repeat(Math.min(opts.header.length, 60))}\n\n`;
  } else if (opts.query) {
    out += `Search: "${opts.query}" — ${tweets.length} results\n${"─".repeat(50)}\n\n`;
  }

  out += shown.map((t, i) => formatTweet(t, i)).join("\n\n");

  if (tweets.length > limit) {
    out += `\n\n... +${tweets.length - limit} more`;
  }

  return out;
}

export function formatProfile(user: any, tweets: Tweet[]): string {
  const m = user.public_metrics || {};
  let out = `@${user.username} — ${user.name}\n`;
  out += `${compactNumber(m.followers_count || 0)} followers / ${compactNumber(m.tweet_count || 0)} tweets\n`;
  if (user.description) {
    out += `${user.description.slice(0, 160)}\n`;
  }
  out += `${"─".repeat(40)}\n\n`;
  out += tweets
    .slice(0, 10)
    .map((t, i) => formatTweet(t, i))
    .join("\n\n");

  return out;
}

// --- Scout output (engagement opportunities) ---

export function formatScoutResults(
  tweets: Tweet[],
  opts: { limit?: number } = {}
): string {
  const limit = opts.limit || 10;
  const shown = tweets.slice(0, limit);

  let out = `Scout — ${shown.length} reply opportunities\n${"─".repeat(40)}\n\n`;

  out += shown
    .map((t, i) => formatTweet(t, i, { showFollowers: true }))
    .join("\n\n");

  return out;
}

// --- Track output (competitive intel) ---

export function formatTrackResults(
  data: Map<string, Tweet[]>
): string {
  let out = `Track — competitive intel\n${"═".repeat(30)}\n`;

  for (const [username, tweets] of data) {
    out += `\n@${username}`;
    if (tweets.length === 0) {
      out += `  (no recent posts)\n`;
      continue;
    }

    // Show top post by likes
    const top = [...tweets].sort(
      (a, b) => b.metrics.likes - a.metrics.likes
    )[0];
    out += `  (top: ${compactNumber(top.metrics.likes)} likes)\n`;
    out += `${"─".repeat(30)}\n`;

    for (const t of tweets.slice(0, 5)) {
      const text = cleanText(t.text).slice(0, 120);
      out += `  ${compactNumber(t.metrics.likes)} likes / ${compactNumber(t.metrics.impressions)} views  (${timeAgo(t.created_at)})\n`;
      out += `  ${text.replace(/\n/g, " ")}\n`;
      out += `  ${t.tweet_url}\n\n`;
    }
  }

  return out;
}

// --- Mirror output (own account performance) ---

export function formatMirrorResults(
  data: { handle: string; label: string; user?: any; tweets: Tweet[] }[]
): string {
  let out = `Mirror — your accounts\n${"═".repeat(30)}\n`;

  for (const acct of data) {
    const m = acct.user?.public_metrics || {};
    out += `\n@${acct.handle} (${acct.label})`;
    if (m.followers_count) {
      out += `  ${compactNumber(m.followers_count)} followers`;
    }
    out += `\n${"─".repeat(30)}\n`;

    if (acct.tweets.length === 0) {
      out += `  No recent posts.\n`;
      continue;
    }

    for (const t of acct.tweets) {
      const text = cleanText(t.text).slice(0, 120);
      out += `  ${compactNumber(t.metrics.likes)} likes / ${compactNumber(t.metrics.impressions)} views / ${compactNumber(t.metrics.replies)} replies  (${timeAgo(t.created_at)})\n`;
      out += `  ${text.replace(/\n/g, " ")}\n`;
      out += `  ${t.tweet_url}\n\n`;
    }
  }

  return out;
}

// --- Markdown output (research docs) ---

export function formatTweetMarkdown(t: Tweet): string {
  const engagement = `${t.metrics.likes}L ${t.metrics.impressions}I`;
  const text = cleanText(t.text).replace(/\n/g, "\n  > ");

  let out = `- **@${t.username}** (${engagement}) [Tweet](${t.tweet_url})\n  > ${text}`;

  if (t.urls.length > 0) {
    out += `\n  Links: ${t.urls.map((u) => {
      try { return `[${new URL(u).hostname}](${u})`; } catch { return u; }
    }).join(", ")}`;
  }

  return out;
}

export function formatResearchMarkdown(
  query: string,
  tweets: Tweet[],
  opts: {
    themes?: { title: string; tweetIds: string[] }[];
    queries?: string[];
  } = {}
): string {
  const date = new Date().toISOString().split("T")[0];

  let out = `# X Research: ${query}\n\n`;
  out += `**Date:** ${date}\n`;
  out += `**Tweets found:** ${tweets.length}\n\n`;

  if (opts.themes && opts.themes.length > 0) {
    for (const theme of opts.themes) {
      out += `## ${theme.title}\n\n`;
      const themeTweets = theme.tweetIds
        .map((id) => tweets.find((t) => t.id === id))
        .filter(Boolean) as Tweet[];
      out += themeTweets.map(formatTweetMarkdown).join("\n\n");
      out += "\n\n";
    }
  } else {
    out += `## Top Results (by engagement)\n\n`;
    out += tweets.slice(0, 30).map(formatTweetMarkdown).join("\n\n");
    out += "\n\n";
  }

  out += `---\n\n## Metadata\n`;
  out += `- **Query:** ${query}\n`;
  out += `- **Date:** ${date}\n`;
  out += `- **Tweets scanned:** ${tweets.length}\n`;
  out += `- **Est. cost:** ~$${(tweets.length * 0.005).toFixed(2)}\n`;
  if (opts.queries) {
    out += `- **Queries used:**\n`;
    for (const q of opts.queries) {
      out += `  - \`${q}\`\n`;
    }
  }

  return out;
}

// --- Cost display ---

export function formatCost(tweetCount: number, label?: string): string {
  const cost = (tweetCount * 0.005).toFixed(2);
  const prefix = label || "API cost";
  return `${prefix}: ${tweetCount} tweets read (~$${cost})`;
}
