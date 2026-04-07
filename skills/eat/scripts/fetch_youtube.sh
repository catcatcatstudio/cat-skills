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

# Step 2: no subtitles — transcribe via Groq, fall back to local Whisper
yt-dlp -x --audio-format mp3 --audio-quality 9 -o "${TMPDIR}/audio.%(ext)s" "$URL" >/dev/null 2>&1

if [ -n "${GROQ_API_KEY:-}" ]; then
  # Check file size — Groq limit: 25MB free tier, 100MB dev tier
  FILESIZE=$(stat -f%z "${TMPDIR}/audio.mp3" 2>/dev/null || stat -c%s "${TMPDIR}/audio.mp3" 2>/dev/null)
  if [ "$FILESIZE" -le 100000000 ]; then
    RESULT=$(curl -s https://api.groq.com/openai/v1/audio/transcriptions \
      -H "Authorization: Bearer $GROQ_API_KEY" \
      -F "file=@${TMPDIR}/audio.mp3" \
      -F "model=whisper-large-v3-turbo" | jq -r '.text')
    if [ -n "$RESULT" ] && [ "$RESULT" != "null" ]; then
      echo "$RESULT"
      exit 0
    fi
  fi
fi

# Step 3: Groq unavailable or failed — use local Whisper
if command -v whisper &>/dev/null; then
  ffmpeg -i "${TMPDIR}/audio.mp3" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${TMPDIR}/audio.wav" 2>/dev/null
  whisper "${TMPDIR}/audio.wav" --model base --language en --output_format txt --output_dir "${TMPDIR}" 2>/dev/null
  cat "${TMPDIR}/audio.txt" 2>/dev/null
  exit 0
fi

echo "ERROR: No subtitles found, GROQ_API_KEY not set, and local whisper not installed. Cannot transcribe." >&2
exit 1
