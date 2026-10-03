export function wordleRandomIndex(length: number): number {
  if (length <= 0) return 0
  if (length === 1) return 0
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] % length
}

/** Uniform random answer; tries not to repeat `exclude` when possible. */
export function wordleRandomAnswer(words: readonly string[], exclude?: string): string {
  if (words.length === 0) return ''
  if (!exclude || words.length === 1) {
    return words[wordleRandomIndex(words.length)] ?? words[0]
  }
  for (let attempt = 0; attempt < 12; attempt++) {
    const pick = words[wordleRandomIndex(words.length)]
    if (pick !== exclude) return pick
  }
  const filtered = words.filter((w) => w !== exclude)
  if (filtered.length === 0) return words[0]
  return filtered[wordleRandomIndex(filtered.length)]
}
