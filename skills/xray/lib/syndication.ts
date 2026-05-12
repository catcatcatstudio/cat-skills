/**
 * Free path for fetching individual tweets — uses the public syndication
 * endpoint (cdn.syndication.twimg.com). No auth, no cost.
 *
 * Limitations vs the paid API:
 *  - Single tweet only. No conversation_id search → no replies, no thread fan-out.
 *  - No impression / bookmark / quote counts (zeroed in the returned Tweet).
 *  - Sometimes 404s on protected, deleted, or very fresh (< ~minute) tweets.
 *
 * Use this first. Fall back to api.getTweet only when this returns null.
 */

import type { Tweet } from "./api";

const SYNDICATION_BASE = "https://cdn.syndication.twimg.com/tweet-result";

interface SyndicationUser {
  id_str?: string;
  screen_name?: string;
  name?: string;
  followers_count?: number;
}

interface SyndicationEntities {
  urls?: Array<{ expanded_url?: string }>;
  user_mentions?: Array<{ screen_name?: string }>;
  hashtags?: Array<{ text?: string }>;
}

interface SyndicationTweet {
  id_str?: string;
  text?: string;
  full_text?: string;
  created_at?: string;
  conversation_id_str?: string;
  user?: SyndicationUser;
  entities?: SyndicationEntities;
  favorite_count?: number;
  conversation_count?: number;
  retweet_count?: number;
  __typename?: string;
}

/**
 * Extract a tweet ID from a URL or accept a bare ID.
 * Supports x.com, twitter.com, with or without /i/web/status, with query strings.
 */
export function extractTweetId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d{5,25}$/.test(trimmed)) return trimmed;
  const m = trimmed.match(/(?:x|twitter)\.com\/[^/]+\/status(?:es)?\/(\d+)/i);
  return m ? m[1] : null;
}

function mapToTweet(s: SyndicationTweet): Tweet | null {
  const id = s.id_str;
  if (!id) return null;

  const username = s.user?.screen_name || "?";
  const text = s.text || s.full_text || "";

  return {
    id,
    text,
    author_id: s.user?.id_str || "",
    username,
    name: s.user?.name || "?",
    created_at: s.created_at || "",
    conversation_id: s.conversation_id_str || id,
    metrics: {
      likes: s.favorite_count || 0,
      retweets: s.retweet_count || 0,
      replies: s.conversation_count || 0,
      quotes: 0,
      impressions: 0,
      bookmarks: 0,
    },
    urls: (s.entities?.urls || [])
      .map((u) => u.expanded_url)
      .filter((u): u is string => Boolean(u)),
    mentions: (s.entities?.user_mentions || [])
      .map((m) => m.screen_name)
      .filter((m): m is string => Boolean(m)),
    hashtags: (s.entities?.hashtags || [])
      .map((h) => h.text)
      .filter((h): h is string => Boolean(h)),
    tweet_url: `https://x.com/${username}/status/${id}`,
    author_followers: s.user?.followers_count,
  };
}

/**
 * Fetch a single tweet via the free syndication endpoint.
 * Returns null on 404, network failure, or unparseable response.
 */
export async function getTweet(tweetId: string): Promise<Tweet | null> {
  const url = `${SYNDICATION_BASE}?id=${encodeURIComponent(tweetId)}&token=a`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: {
        // Some edge nodes 403 without a UA.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  let data: SyndicationTweet;
  try {
    data = (await res.json()) as SyndicationTweet;
  } catch {
    return null;
  }

  if (!data || (data as any).__typename === "TweetTombstone") return null;
  return mapToTweet(data);
}
