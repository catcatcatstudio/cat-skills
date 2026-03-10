#!/usr/bin/env bash
# Fetch YouTube transcript via subtitles or Groq audio transcription fallback.
# Usage: fetch_youtube.sh <youtube-url>
# Outputs transcript text to stdout. Exits non-zero on failure.

set -euo pipefail

URL="$1"
TMPDIR=$(mktemp -d)
cleanup() { if command -v trash &>/dev/null; then trash "$TMPDIR"; else rm -rf "$TMPDIR"; fi; }
trap cleanup EXIT

# Step 1: try subtitle extraction — SRT conversion, then dedup rolling auto-captions
# Auto-captions use rolling 2-line cues: line 1 = previous phrase (carryover), line 2 = new phrase.
# Even cues are spacers. We extract only the last text line of each cue to avoid duplication.
yt-dlp --write-auto-sub --sub-lang "en" --skip-download --convert-subs srt -o "${TMPDIR}/sub" "$URL" >/dev/null 2>&1 || true
TRANSCRIPT=$(cat ${TMPDIR}/sub*.srt 2>/dev/null \
  | sed 's/<[^>]*>//g' \
  | awk '
    /^[0-9]+$/ { cue_num++; lines=""; next }
    /^[0-9][0-9]:/ { next }
    /^[[:space:]]*$/ { if (lines != "") print lines; lines=""; next }
    { lines = $0 }
    END { if (lines != "") print lines }
  ' \
  | awk 'NF && !seen[$0]++' \
  | tr '\n' ' ' || true)

if [ -n "$TRANSCRIPT" ]; then
  echo "$TRANSCRIPT"
  exit 0
fi

# Step 2: no subtitles — transcribe via Groq
if [ -z "${GROQ_API_KEY:-}" ]; then
  echo "ERROR: No subtitles found and GROQ_API_KEY is not set. Cannot transcribe." >&2
  exit 1
fi

yt-dlp -x --audio-format mp3 --audio-quality 9 -o "${TMPDIR}/audio.%(ext)s" "$URL" >/dev/null 2>&1

# Check file size — Groq limit: 25MB free tier, 100MB dev tier
FILESIZE=$(stat -f%z "${TMPDIR}/audio.mp3" 2>/dev/null || stat -c%s "${TMPDIR}/audio.mp3" 2>/dev/null)
if [ "$FILESIZE" -gt 100000000 ]; then
  echo "ERROR: Audio too large for Groq ($(($FILESIZE/1048576))MB, limit 100MB). Try a shorter video." >&2
  exit 1
fi

curl -s https://api.groq.com/openai/v1/audio/transcriptions \
  -H "Authorization: Bearer $GROQ_API_KEY" \
  -F "file=@${TMPDIR}/audio.mp3" \
  -F "model=whisper-large-v3-turbo" | jq -r '.text'
