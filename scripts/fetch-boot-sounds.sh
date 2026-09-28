#!/usr/bin/env bash
# Mixkit.co free SFX (Mixkit License). Run once to populate public/sounds/boot/.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/sounds/boot"
BASE="https://assets.mixkit.co/active_storage/sfx"
mkdir -p "$OUT"
TMP="${TMPDIR:-/tmp}/portfolio-boot-sfx"
mkdir -p "$TMP"

# id:output-name:trim-seconds (trim optional)
CLIPS=(
  "2574:boot-complete:1.75"
  "2310:hello-reveal:7.0"
)

audio_filter_for() {
  local name="$1"
  case "$name" in
    hello-reveal)
      echo "loudnorm=I=-12:TP=-0.5:LRA=7,afade=t=in:st=0:d=0.15,afade=t=out:st=6.2:d=0.8"
      ;;
    *)
      echo "loudnorm=I=-12:TP=-1:LRA=7"
      ;;
  esac
}

for entry in "${CLIPS[@]}"; do
  IFS=: read -r id name trim <<<"$entry"
  src="$TMP/${id}.mp3"
  dest="$OUT/${name}.mp3"
  af=$(audio_filter_for "$name")
  echo "==> $name (Mixkit $id)"
  curl -fsSL "$BASE/${id}/${id}-preview.mp3" -o "$src"
  if [[ -n "${trim:-}" ]]; then
    ffmpeg -y -hide_banner -loglevel error -i "$src" -t "$trim" -af "$af" "$dest"
  else
    ffmpeg -y -hide_banner -loglevel error -i "$src" -af "$af" "$dest"
  fi
done

echo "Done. See public/sounds/boot/ATTRIBUTION.txt for credits."
