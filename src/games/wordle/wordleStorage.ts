import type { LetterResult } from './wordleEvaluate'

const GAME_KEY = 'fivefold-game-v2'
const STATS_KEY = 'fivefold-stats-v1'
const ROUND_KEY = 'fivefold-round-v1'

export type WordleGameStatus = 'playing' | 'won' | 'lost'

export type WordleSavedGame = {
  roundNumber: number
  answer: string
  guesses: string[]
  evaluations: LetterResult[][]
  status: WordleGameStatus
}

export type WordleStats = {
  played: number
  wins: number
  currentStreak: number
  maxStreak: number
  /** guess count → win count */
  distribution: number[]
}

function emptyStats(): WordleStats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: [0, 0, 0, 0, 0, 0],
  }
}

export function loadWordleStats(): WordleStats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (!raw) return emptyStats()
    const parsed = JSON.parse(raw) as WordleStats
    if (!Array.isArray(parsed.distribution) || parsed.distribution.length !== 6) {
      return { ...emptyStats(), ...parsed, distribution: [0, 0, 0, 0, 0, 0] }
    }
    return parsed
  } catch {
    return emptyStats()
  }
}

function saveStats(stats: WordleStats) {
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

export function loadWordleGame(): WordleSavedGame | null {
  try {
    const raw = localStorage.getItem(GAME_KEY)
    if (!raw) return null
    return JSON.parse(raw) as WordleSavedGame
  } catch {
    return null
  }
}

export function saveWordleGame(game: WordleSavedGame) {
  localStorage.setItem(GAME_KEY, JSON.stringify(game))
}

export function clearWordleGame() {
  localStorage.removeItem(GAME_KEY)
}

export function nextWordleRoundNumber(): number {
  try {
    const raw = localStorage.getItem(ROUND_KEY)
    const prev = raw ? Number.parseInt(raw, 10) : 0
    const next = Number.isFinite(prev) ? prev + 1 : 1
    localStorage.setItem(ROUND_KEY, String(next))
    return next
  } catch {
    return 1
  }
}

export function recordWordleResult(guessCount: number, won: boolean) {
  const stats = loadWordleStats()
  stats.played += 1
  if (won) {
    stats.wins += 1
    stats.currentStreak += 1
    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
    const idx = Math.min(5, Math.max(0, guessCount - 1))
    stats.distribution[idx] += 1
  } else {
    stats.currentStreak = 0
  }
  saveStats(stats)
}
