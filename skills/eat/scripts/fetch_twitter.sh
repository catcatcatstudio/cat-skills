#!/usr/bin/env bash
# Fetch an X/Twitter thread via the v2 API.
# Usage: fetch_twitter.sh <tweet-url>
# Outputs thread text to stdout. Exits non-zero on failure.
# Requires X_BEARER_TOKEN in environment.

set -euo pipefail

URL="$1"

if [ -z "${X_BEARER_TOKEN:-}" ]; then
  echo "ERROR: X_BEARER_TOKEN is not set. Ask user to paste thread text." >&2
  exit 1
fi

TWEET_ID=$(echo "$URL" | grep -oE '[0-9]{15,}' | tail -1)
if [ -z "$TWEET_ID" ]; then
  echo "ERROR: Could not extract tweet ID from URL: $URL" >&2
  exit 1
fi

# Fetch root tweet with conversation context
TWEET_DATA=$(curl -s "https://api.twitter.com/2/tweets/${TWEET_ID}?tweet.fields=conversation_id,author_id,text,created_at&expansions=author_id&user.fields=name,username" \
  -H "Authorization: Bearer $X_BEARER_TOKEN")

CONV_ID=$(echo "$TWEET_DATA" | jq -r '.data.conversation_id // empty')
AUTHOR_ID=$(echo "$TWEET_DATA" | jq -r '.data.author_id // empty')

if [ -z "$CONV_ID" ] || [ -z "$AUTHOR_ID" ]; then
  echo "ERROR: Could not fetch tweet. It may be deleted, protected, or older than 7 days." >&2
  exit 1
fi

# Fetch thread (search/recent — last 7 days only)
THREAD=$(curl -s "https://api.twitter.com/2/tweets/search/recent?query=conversation_id:${CONV_ID}&tweet.fields=text,created_at,author_id&max_results=100&sort_order=recency" \
  -H "Authorization: Bearer $X_BEARER_TOKEN")

# Filter to author only, reverse to chronological
RESULT=$(echo "$THREAD" | jq -r --arg aid "$AUTHOR_ID" \
  '[(.data // [])[] | select(.author_id == $aid)] | reverse | .[].text' 2>/dev/null)

if [ -z "$RESULT" ]; then
  echo "ERROR: No thread tweets found. Thread may be older than 7 days (X search API limit)." >&2
  exit 1
fi

echo "$RESULT"
