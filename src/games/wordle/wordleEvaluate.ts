export type LetterResult = 'correct' | 'present' | 'absent'

export function evaluateGuess(guess: string, answer: string): LetterResult[] {
  const g = guess.toLowerCase()
  const a = answer.toLowerCase()
  const result: LetterResult[] = ['absent', 'absent', 'absent', 'absent', 'absent']
  const remaining = new Map<string, number>()

  for (const ch of a) {
    remaining.set(ch, (remaining.get(ch) ?? 0) + 1)
  }

  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct'
      remaining.set(g[i], (remaining.get(g[i]) ?? 1) - 1)
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] === 'correct') continue
    const ch = g[i]
    const left = remaining.get(ch) ?? 0
    if (left > 0) {
      result[i] = 'present'
      remaining.set(ch, left - 1)
    }
  }

  return result
}

export type KeyState = 'unused' | 'absent' | 'present' | 'correct'

const KEY_RANK: Record<KeyState, number> = {
  unused: 0,
  absent: 1,
  present: 2,
  correct: 3,
}

export function mergeKeyState(current: KeyState, next: LetterResult): KeyState {
  const mapped: KeyState =
    next === 'correct' ? 'correct' : next === 'present' ? 'present' : 'absent'
  return KEY_RANK[mapped] > KEY_RANK[current] ? mapped : current
}

export function emojiForResult(r: LetterResult): string {
  if (r === 'correct') return '🟩'
  if (r === 'present') return '🟨'
  return '⬛'
}
