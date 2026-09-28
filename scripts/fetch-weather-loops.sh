#!/usr/bin/env bash
# Mixkit.co free stock videos (Mixkit License). Run once to populate public/weather/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/weather"
TMP="$ROOT/.tmp-weather-src"
mkdir -p "$OUT" "$TMP"

# name:id  (Mixkit asset IDs)
CLIPS=(
  clear:26108
  partly:4366
  rain:20260
  storm:27704
  night:39770
)

encode_night_hd() {
  local id="$1"
  local src="$TMP/night-src.mp4"
  curl -fsSL "https://assets.mixkit.co/videos/${id}/${id}-1080.mp4" -o "$src"
  ffmpeg -y -hide_banner -loglevel error -i "$src" -t 15 \
    -vf "scale=1280:-2:force_original_aspect_ratio=increase,crop=1280:720" \
    -an -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 \
    "$OUT/night.webm"
  ffmpeg -y -hide_banner -loglevel error -i "$src" -t 15 \
    -vf "scale=1280:-2:force_original_aspect_ratio=increase,crop=1280:720" \
    -an -c:v libx264 -crf 23 -preset slow -movflags +faststart \
    "$OUT/night.mp4"
  rm -f "$src"
}

for entry in "${CLIPS[@]}"; do
  name="${entry%%:*}"
  id="${entry##*:}"
  echo "==> $name (Mixkit $id)"
  if [[ "$name" == "night" ]]; then
    encode_night_hd "$id"
    continue
  fi
  src="$TMP/${name}.mp4"
  curl -fsSL "https://assets.mixkit.co/videos/${id}/${id}-720.mp4" -o "$src"
  ffmpeg -y -hide_banner -loglevel error -i "$src" -t 12 \
    -vf "scale=960:-2:force_original_aspect_ratio=increase,crop=960:540" \
    -an -c:v libvpx-vp9 -crf 34 -b:v 0 -row-mt 1 \
    "$OUT/${name}.webm"
  ffmpeg -y -hide_banner -loglevel error -i "$src" -t 12 \
    -vf "scale=960:-2:force_original_aspect_ratio=increase,crop=960:540" \
    -an -c:v libx264 -crf 28 -preset slow -movflags +faststart \
    "$OUT/${name}.mp4"
done

rm -rf "$TMP"
ls -lh "$OUT"/*.webm "$OUT"/*.mp4
