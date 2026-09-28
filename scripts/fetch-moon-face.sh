#!/usr/bin/env bash
# Lunar surface texture from Solar System Scope (CC BY 4.0). Run once for public/weather/moon-face.jpg.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/weather"
TMP="${TMPDIR:-/tmp}/portfolio-moon-src.jpg"
mkdir -p "$OUT"
echo "==> Downloading 2K lunar texture"
curl -fsSL "https://www.solarsystemscope.com/textures/download/2k_moon.jpg" -o "$TMP"
echo "==> Cropping square face (1024×1024)"
ffmpeg -y -hide_banner -loglevel error -i "$TMP" \
  -vf "crop=1024:1024:(iw-1024)/2:(ih-1024)/2" -q:v 2 "$OUT/moon-face.jpg"
rm -f "$TMP"
echo "Done → $OUT/moon-face.jpg"
