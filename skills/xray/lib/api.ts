/**
 * X API wrapper — search, threads, profiles, single tweets.
 * Supports both recent (7 days) and full-archive (all time) search.
 *
 * Bearer token from env: X_BEARER_TOKEN (sourced via ~/.env.keys)
 */

import { readFileSync } from "fs";

const BASE = "https://api.x.com/2";
const RATE_DELAY_MS = 350;

function getToken(): string {
  if (process.env.X_BEARER_TOKEN) return process.env.X_BEARER_TOKEN;

  // Fallback: read from env files
  const envPaths = [
    `${process.env.HOME}/.env.keys`,
    `${process.env.HOME}/.config/env/global.env`,
  ];
  for (const path of envPaths) {
    try {
      const envFile = readFileSync(path, "utf-8");
      const match = envFile.match(/X_BEARER_TOKEN=["']?([^"'\n]+)/);
      if (match) return match[1];
    } catch {}
  }

  throw new Error(
    "X_BEARER_TOKEN not found. Set it in your environment or ~/.env.keys"
  );
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export interface Tweet {
  id: string;
  text: string;
  author_id: string;
  username: string;
  name: string;
  created_at: string;
  conversation_id: string;
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
    impressions: number;
    bookmarks: number;
  };
  urls: string[];
  mentions: string[];
  hashtags: string[];
  tweet_url: string;
  author_followers?: number;
}

interface RawResponse {
  data?: any[];
  includes?: { users?: any[] };
  meta?: { next_token?: string; result_count?: number };
  errors?: any[];
  title?: string;
  detail?: string;
  status?: number;
}

function parseTweets(raw: RawResponse): Tweet[] {
  if (!raw.data) return [];
  const users: Record<string, any> = {};
  for (const u of raw.includes?.users || []) {
    users[u.id] = u;
  }

  return raw.data.map((t: any) => {
    const u = users[t.author_id] || {};
    const m = t.public_metrics || {};
    const um = u.public_metrics || {};
    return {
      id: t.id,
      text: t.text,
      author_id: t.author_id,
      username: u.username || "?",
      name: u.name || "?",
      created_at: t.created_at,
      conversation_id: t.conversation_id,
      metrics: {
        likes: m.like_count || 0,
        retweets: m.retweet_count || 0,
        replies: m.reply_count || 0,
        quotes: m.quote_count || 0,
        impressions: m.impression_count || 0,
        bookmarks: m.bookmark_count || 0,
      },
      urls: (t.entities?.urls || [])
        .map((u: any) => u.expanded_url)
        .filter(Boolean),
      mentions: (t.entities?.mentions || [])
        .map((m: any) => m.username)
        .filter(Boolean),
      hashtags: (t.entities?.hashtags || [])
        .map((h: any) => h.tag)
        .filter(Boolean),
      tweet_url: `https://x.com/${u.username || "?"}/status/${t.id}`,
      author_followers: um.followers_count,
    };
  });
}

const FIELDS =
  "tweet.fields=created_at,public_metrics,author_id,conversation_id,entities&expansions=author_id&user.fields=username,name,public_metrics";

/**
 * Parse a "since" shorthand into ISO 8601.
 * Accepts: "30m", "1h", "3h", "12h", "1d", "7d", "30d" or ISO string.
 */
function parseSince(since: string): string | null {
  const match = since.match(/^(\d+)(m|h|d)$/);
  if (match) {
    const num = parseInt(match[1]);
    const unit = match[2];
    const ms =
      unit === "m"
        ? num * 60_000
        : unit === "h"
          ? num * 3_600_000
          : num * 86_400_000;
    return new Date(Date.now() - ms).toISOString();
  }

  if (since.includes("T") || since.includes("-")) {
    try {
      return new Date(since).toISOString();
    } catch {
      return null;
    }
  }
  return null;
}

async function apiGet(url: string): Promise<RawResponse> {
  const token = getToken();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 429) {
    const reset = res.headers.get("x-rate-limit-reset");
    const waitSec = reset
      ? Math.max(parseInt(reset) - Math.floor(Date.now() / 1000), 1)
      : 60;
    throw new Error(`Rate limited. Resets in ${waitSec}s`);
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`X API ${res.status}: ${body.slice(0, 200)}`);
  }

  return res.json();
}

export interface SearchOpts {
  maxResults?: number;
  pages?: number;
  sortOrder?: "relevancy" | "recency";
  since?: string;
  archive?: boolean; // use full-archive endpoint (all time)
}

/**
 * Search tweets. Defaults to recent (7 days).
 * Set archive: true for full-archive (all time, back to March 2006).
 * Full-archive: max 500/request, 1024-char query.
 * Recent: max 100/request, 512-char query.
 */
export async function search(
  query: string,
  opts: SearchOpts = {}
): Promise<Tweet[]> {
  const endpoint = opts.archive ? "tweets/search/all" : "tweets/search/recent";
  const maxPerPage = opts.archive ? 500 : 100;
  const maxResults = Math.max(
    Math.min(opts.maxResults || maxPerPage, maxPerPage),
    10
  );
  const pages = opts.pages || 1;
  const sort = opts.sortOrder || "relevancy";
  const encoded = encodeURIComponent(query);

  let timeFilter = "";
  if (opts.since) {
    const startTime = parseSince(opts.since);
    if (startTime) timeFilter = `&start_time=${startTime}`;
  }

  let allTweets: Tweet[] = [];
  let nextToken: string | undefined;

  for (let page = 0; page < pages; page++) {
    const pagination = nextToken ? `&pagination_token=${nextToken}` : "";
    const url = `${BASE}/${endpoint}?query=${encoded}&max_results=${maxResults}&${FIELDS}&sort_order=${sort}${timeFilter}${pagination}`;

    const raw = await apiGet(url);
    const tweets = parseTweets(raw);
    allTweets.push(...tweets);

    nextToken = raw.meta?.next_token;
    if (!nextToken) break;
    if (page < pages - 1) await sleep(RATE_DELAY_MS);
  }

  return allTweets;
}

/**
 * Fetch a full conversation thread by root tweet ID.
 */
export async function thread(
  conversationId: string,
  opts: { pages?: number } = {}
): Promise<Tweet[]> {
  const query = `conversation_id:${conversationId}`;
  const tweets = await search(query, {
    pages: opts.pages || 2,
    sortOrder: "recency",
  });

  // Fetch the root tweet separately
  try {
    const root = await getTweet(conversationId);
    if (root) {
      // Add root at the beginning, avoid duplicate
      const ids = new Set(tweets.map((t) => t.id));
      if (!ids.has(root.id)) tweets.unshift(root);
    }
  } catch {
    // Root tweet might be deleted
  }

  return tweets;
}

/**
 * Get recent tweets from a specific user.
 */
export async function profile(
  username: string,
  opts: { count?: number; includeReplies?: boolean } = {}
): Promise<{ user: any; tweets: Tweet[] }> {
  const userUrl = `${BASE}/users/by/username/${username}?user.fields=public_metrics,description,created_at`;
  const userData = await apiGet(userUrl);

  if (!userData.data) {
    throw new Error(`User @${username} not found`);
  }

  const user = (userData as any).data;
  await sleep(RATE_DELAY_MS);

  const replyFilter = opts.includeReplies ? "" : " -is:reply";
  const query = `from:${username} -is:retweet${replyFilter}`;
  const tweets = await search(query, {
    maxResults: Math.min(opts.count || 20, 100),
    sortOrder: "recency",
  });

  return { user, tweets };
}

/**
 * Fetch a single tweet by ID.
 */
export async function getTweet(tweetId: string): Promise<Tweet | null> {
  const url = `${BASE}/tweets/${tweetId}?${FIELDS}`;
  const raw = await apiGet(url);

  if (raw.data && !Array.isArray(raw.data)) {
    const parsed = parseTweets({ ...raw, data: [raw.data] });
    return parsed[0] || null;
  }
  return null;
}

/**
 * Batch fetch recent tweets from multiple users.
 * Returns results keyed by username. More efficient than individual profile() calls
 * when you just need recent posts (uses search with OR, not per-user lookups).
 */
export async function batchProfiles(
  usernames: string[],
  opts: { count?: number; since?: string } = {}
): Promise<Map<string, Tweet[]>> {
  const results = new Map<string, Tweet[]>();
  const count = opts.count || 5;

  // Batch into groups of 5 (keep query length reasonable)
  const batches: string[][] = [];
  for (let i = 0; i < usernames.length; i += 5) {
    batches.push(usernames.slice(i, i + 5));
  }

  for (const batch of batches) {
    const fromClause = batch.map((u) => `from:${u}`).join(" OR ");
    const query = `(${fromClause}) -is:retweet -is:reply`;

    const tweets = await search(query, {
      maxResults: 100,
      sortOrder: "recency",
      since: opts.since,
    });

    // Distribute tweets to their authors
    for (const username of batch) {
      const userTweets = tweets
        .filter((t) => t.username.toLowerCase() === username.toLowerCase())
        .slice(0, count);
      results.set(username, userTweets);
    }

    if (batches.indexOf(batch) < batches.length - 1) await sleep(RATE_DELAY_MS);
  }

  return results;
}

export function sortBy(
  tweets: Tweet[],
  metric: "likes" | "impressions" | "retweets" | "replies" = "likes"
): Tweet[] {
  return [...tweets].sort((a, b) => b.metrics[metric] - a.metrics[metric]);
}

export function filterEngagement(
  tweets: Tweet[],
  opts: { minLikes?: number; minImpressions?: number }
): Tweet[] {
  return tweets.filter((t) => {
    if (opts.minLikes && t.metrics.likes < opts.minLikes) return false;
    if (opts.minImpressions && t.metrics.impressions < opts.minImpressions)
      return false;
    return true;
  });
}

export function dedupe(tweets: Tweet[]): Tweet[] {
  const seen = new Set<string>();
  return tweets.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });
}
