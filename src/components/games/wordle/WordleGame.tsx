import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { wordleRowRevealDurationMs } from '../../../games/wordle/wordleAnimation'
import { wordleAnswerPool } from '../../../games/wordle/wordleAnswerPool'
import { wordleRandomAnswer } from '../../../games/wordle/wordleRandom'
import {
  emojiForResult,
  evaluateGuess,
  mergeKeyState,
  type KeyState,
  type LetterResult,
} from '../../../games/wordle/wordleEvaluate'
import {
  clearWordleGame,
  loadWordleGame,
  loadWordleStats,
  nextWordleRoundNumber,
  recordWordleResult,
  saveWordleGame,
  type WordleGameStatus,
} from '../../../games/wordle/wordleStorage'
import { useWordleLexicon } from '../../../games/wordle/useWordleLexicon'
import type { WordleLexicon } from '../../../games/wordle/useWordleLexicon'
import './WordleGame.css'

const ROWS = 6
const COLS = 5

const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'] as const

type Props = {
  onBack: () => void
}

type Screen = 'landing' | 'playing'

type RoundState = {
  roundNumber: number
  answer: string
  guesses: string[]
  evaluations: LetterResult[][]
  status: WordleGameStatus
}

function freshRound(lexicon: WordleLexicon, exclude?: string): RoundState {
  const pool = wordleAnswerPool(lexicon.answers)
  return {
    roundNumber: nextWordleRoundNumber(),
    answer: wordleRandomAnswer(pool, exclude),
    guesses: [],
    evaluations: [],
    status: 'playing',
  }
}

export function WordleGame({ onBack }: Props) {
  const { lexicon, loading, error } = useWordleLexicon()

  const [screen, setScreen] = useState<Screen>('landing')
  const [round, setRound] = useState<RoundState | null>(null)
  const [current, setCurrent] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [shakeRow, setShakeRow] = useState(false)
  const [statsRecorded, setStatsRecorded] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState(loadWordleStats)
  const endRevealTimerRef = useRef(0)

  useEffect(() => {
    return () => window.clearTimeout(endRevealTimerRef.current)
  }, [])

  const scheduleEndModal = useCallback(() => {
    window.clearTimeout(endRevealTimerRef.current)
    endRevealTimerRef.current = window.setTimeout(() => {
      setShowEnd(true)
    }, wordleRowRevealDurationMs(COLS) + 60)
  }, [])

  useEffect(() => {
    if (!lexicon) return
    const saved = loadWordleGame()
    if (saved && saved.status === 'playing') {
      setRound({
        roundNumber: saved.roundNumber,
        answer: saved.answer,
        guesses: saved.guesses,
        evaluations: saved.evaluations,
        status: saved.status,
      })
      setScreen('playing')
      setStatsRecorded(false)
      setShowEnd(false)
    } else {
      clearWordleGame()
      setRound(null)
      setScreen('landing')
      setStatsRecorded(false)
      setShowEnd(false)
    }
  }, [lexicon])

  const startGame = useCallback(() => {
    if (!lexicon) return
    setRound(freshRound(lexicon))
    setScreen('playing')
    setCurrent('')
    setMessage(null)
    setStatsRecorded(false)
    setShowEnd(false)
    setCopied(false)
  }, [lexicon])

  const goToLanding = useCallback(() => {
    window.clearTimeout(endRevealTimerRef.current)
    clearWordleGame()
    setRound(null)
    setScreen('landing')
    setCurrent('')
    setMessage(null)
    setShakeRow(false)
    setShowEnd(false)
    setCopied(false)
    setStatsRecorded(false)
  }, [])

  const answer = round?.answer ?? ''
  const guesses = round?.guesses ?? []
  const evaluations = round?.evaluations ?? []
  const status = round?.status ?? 'playing'
  const roundNumber = round?.roundNumber ?? 1

  const keyStates = useMemo(() => {
    const map = new Map<string, KeyState>()
    for (let r = 0; r < guesses.length; r++) {
      const word = guesses[r]
      const ev = evaluations[r]
      if (!ev) continue
      for (let i = 0; i < 5; i++) {
        const ch = word[i]
        const prev = map.get(ch) ?? 'unused'
        map.set(ch, mergeKeyState(prev, ev[i]))
      }
    }
    return map
  }, [guesses, evaluations])

  const persistRound = useCallback((next: RoundState) => {
    saveWordleGame({
      roundNumber: next.roundNumber,
      answer: next.answer,
      guesses: next.guesses,
      evaluations: next.evaluations,
      status: next.status,
    })
  }, [])

  const finishGame = useCallback(
    (nextGuesses: string[], nextStatus: WordleGameStatus) => {
      if (nextStatus === 'playing' || statsRecorded) return
      const won = nextStatus === 'won'
      recordWordleResult(won ? nextGuesses.length : 0, won)
      setStats(loadWordleStats())
      setStatsRecorded(true)
      clearWordleGame()
    },
    [statsRecorded],
  )

  const playAgain = useCallback(() => {
    if (!lexicon || !round) return
    window.clearTimeout(endRevealTimerRef.current)
    setRound(freshRound(lexicon, round.answer))
    setCurrent('')
    setMessage(null)
    setStatsRecorded(false)
    setShowEnd(false)
    setCopied(false)
  }, [lexicon, round])

  const submitGuess = useCallback(() => {
    if (!lexicon || !round || status !== 'playing') return
    const word = current.toLowerCase()
    if (word.length < COLS) {
      setMessage('Not enough letters')
      return
    }
    if (!lexicon.allowed.has(word)) {
      setMessage('Not in word list')
      setShakeRow(true)
      window.setTimeout(() => setShakeRow(false), 500)
      return
    }

    const ev = evaluateGuess(word, answer)
    const nextGuesses = [...guesses, word]
    const nextEvals = [...evaluations, ev]
    let nextStatus: WordleGameStatus = 'playing'
    if (word === answer) nextStatus = 'won'
    else if (nextGuesses.length >= ROWS) nextStatus = 'lost'

    const nextRound: RoundState = {
      ...round,
      guesses: nextGuesses,
      evaluations: nextEvals,
      status: nextStatus,
    }
    setRound(nextRound)
    setCurrent('')
    setMessage(null)

    if (nextStatus !== 'playing') {
      scheduleEndModal()
      finishGame(nextGuesses, nextStatus)
    } else {
      persistRound(nextRound)
    }
  }, [lexicon, round, status, current, guesses, evaluations, answer, persistRound, finishGame, scheduleEndModal])

  const onKey = useCallback(
    (key: string) => {
      if (status !== 'playing') return
      if (key === 'Enter') {
        submitGuess()
        return
      }
      if (key === 'Backspace') {
        setCurrent((c) => c.slice(0, -1))
        setMessage(null)
        return
      }
      if (key.length === 1 && /^[a-z]$/i.test(key)) {
        if (current.length >= COLS) return
        setCurrent((c) => (c + key).toLowerCase())
        setMessage(null)
      }
    },
    [status, current, submitGuess],
  )

  useEffect(() => {
    if (screen !== 'playing') return
    const onDocKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'Enter') {
        e.preventDefault()
        onKey('Enter')
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        onKey('Backspace')
      } else if (e.key.length === 1 && /^[a-z]$/i.test(e.key)) {
        e.preventDefault()
        onKey(e.key)
      }
    }
    window.addEventListener('keydown', onDocKey)
    return () => window.removeEventListener('keydown', onDocKey)
  }, [onKey, screen])

  const shareText = useMemo(() => {
    const header = `Fivefold #${roundNumber} ${status === 'won' ? guesses.length : 'X'}/${ROWS}`
    const grid = evaluations.map((row) => row.map(emojiForResult).join('')).join('\n')
    return `${header}\n${grid}`
  }, [roundNumber, status, guesses.length, evaluations])

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setMessage('Could not copy')
    }
  }

  const activeRow = guesses.length

  if (loading) {
    return (
      <div className="wordle-game wordle-game--landing">
        <p className="wordle-game__loading">Loading dictionary…</p>
      </div>
    )
  }

  if (error || !lexicon) {
    return (
      <div className="wordle-game wordle-game--landing">
        <p className="wordle-game__loading">{error ?? 'Dictionary unavailable'}</p>
        <button type="button" className="wordle-game__text-btn" onClick={onBack}>Back</button>
      </div>
    )
  }

  if (screen === 'landing') {
    const landingStats = loadWordleStats()
    const winPct = landingStats.played
      ? Math.round((100 * landingStats.wins) / landingStats.played)
      : 0
    return (
      <div className="wordle-game wordle-game--landing">
        <div className="wordle-landing__scene" aria-hidden>
          <span className="wordle-landing__shape wordle-landing__shape--g1" />
          <span className="wordle-landing__shape wordle-landing__shape--g2" />
          <span className="wordle-landing__shape wordle-landing__shape--y1" />
          <span className="wordle-landing__shape wordle-landing__shape--a1" />
          <span className="wordle-landing__shape wordle-landing__shape--a2" />
          <span className="wordle-landing__ring" />
        </div>
        <header className="wordle-game__top wordle-game__top--landing">
          <button type="button" className="wordle-game__back wordle-game__back--landing" onClick={onBack} aria-label="Back to games">
            ‹ Games
          </button>
        </header>
        <div className="wordle-landing">
          <div className="wordle-landing__main">
            <p className="wordle-landing__eyebrow">Featured · Word puzzle</p>
            <h1 className="wordle-landing__title">Fivefold</h1>
            <div className="wordle-landing__demo" aria-hidden>
              <span className="wordle-landing__demo-tile wordle-landing__demo-tile--correct">W</span>
              <span className="wordle-landing__demo-tile wordle-landing__demo-tile--present">O</span>
              <span className="wordle-landing__demo-tile wordle-landing__demo-tile--absent">R</span>
              <span className="wordle-landing__demo-tile wordle-landing__demo-tile--absent">D</span>
              <span className="wordle-landing__demo-tile wordle-landing__demo-tile--correct">S</span>
            </div>
            <p className="wordle-landing__tagline">Six guesses. One five-letter word. New round every time.</p>
            <ul className="wordle-landing__legend">
              <li>
                <span className="wordle-landing__legend-dot wordle-landing__legend-dot--correct" aria-hidden />
                Correct spot
              </li>
              <li>
                <span className="wordle-landing__legend-dot wordle-landing__legend-dot--present" aria-hidden />
                Wrong spot
              </li>
              <li>
                <span className="wordle-landing__legend-dot wordle-landing__legend-dot--absent" aria-hidden />
                Not in word
              </li>
            </ul>
            {landingStats.played > 0 ? (
              <dl className="wordle-landing__stats">
                <div>
                  <dt>Played</dt>
                  <dd>{landingStats.played}</dd>
                </div>
                <div>
                  <dt>Win %</dt>
                  <dd>{winPct}</dd>
                </div>
                <div>
                  <dt>Streak</dt>
                  <dd>{landingStats.currentStreak}</dd>
                </div>
              </dl>
            ) : null}
            <button type="button" className="wordle-landing__play" onClick={startGame}>
              Play
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!round) {
    return (
      <div className="wordle-game">
        <p className="wordle-game__loading">Starting…</p>
      </div>
    )
  }

  return (
    <div className="wordle-game">
      <header className="wordle-game__top">
        <button type="button" className="wordle-game__back" onClick={goToLanding} aria-label="Back to Fivefold home">
          ‹ Back
        </button>
        <h2 className="wordle-game__name">Fivefold</h2>
        <span className="wordle-game__puzzle">#{roundNumber}</span>
      </header>

      <div className="wordle-game__board-wrap">
        <div
          className={`wordle-game__board${shakeRow ? ' wordle-game__board--shake' : ''}`}
          role="grid"
          aria-label="Guesses"
        >
          {Array.from({ length: ROWS }, (_, row) => {
            const isCurrent = row === activeRow && status === 'playing'
            const word = row < guesses.length ? guesses[row] : isCurrent ? current : ''
            const ev = evaluations[row]
            const pad = word.padEnd(COLS, ' ')
            return (
              <div key={row} className="wordle-game__row" role="row">
                {Array.from({ length: COLS }, (_, col) => {
                  const letter = pad[col] === ' ' ? '' : pad[col]
                  const state =
                    ev?.[col] ??
                    (letter && isCurrent ? 'tbd' : 'empty')
                  const reveal = row < guesses.length
                  return (
                    <div
                      key={col}
                      className={`wordle-game__tile wordle-game__tile--${state}${reveal ? ' wordle-game__tile--reveal' : ''}`}
                      role="gridcell"
                      style={{ ['--tile-delay' as string]: `${col * 55}ms` }}
                    >
                      {letter}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
        {message ? (
          <p className="wordle-game__toast" role="status">{message}</p>
        ) : null}
      </div>

      <div className="wordle-game__keyboard" aria-label="Keyboard">
        {KEYBOARD_ROWS.map((row) => (
          <div key={row} className="wordle-game__kb-row">
            {row === 'zxcvbnm' ? (
              <button
                type="button"
                className="wordle-game__key wordle-game__key--wide"
                onClick={() => onKey('Enter')}
                disabled={status !== 'playing'}
              >
                Enter
              </button>
            ) : null}
            {row.split('').map((ch) => (
              <button
                key={ch}
                type="button"
                className={`wordle-game__key wordle-game__key--${keyStates.get(ch) ?? 'unused'}`}
                onClick={() => onKey(ch)}
                disabled={status !== 'playing'}
              >
                {ch.toUpperCase()}
              </button>
            ))}
            {row === 'zxcvbnm' ? (
              <button
                type="button"
                className="wordle-game__key wordle-game__key--wide"
                onClick={() => onKey('Backspace')}
                disabled={status !== 'playing'}
                aria-label="Backspace"
              >
                ⌫
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {showEnd && status !== 'playing' ? (
        <div className="wordle-game__overlay" role="dialog" aria-modal="true" aria-labelledby="wordle-end-title">
          <div className="wordle-game__modal">
            <h3 id="wordle-end-title" className="wordle-game__modal-title">
              {status === 'won' ? 'Nice!' : 'Out of guesses'}
            </h3>
            <p className="wordle-game__modal-sub">
              {status === 'won'
                ? `You got it in ${guesses.length} ${guesses.length === 1 ? 'try' : 'tries'}.`
                : `The word was ${answer.toUpperCase()}.`}
            </p>
            <dl className="wordle-game__stats">
              <div>
                <dt>Played</dt>
                <dd>{stats.played}</dd>
              </div>
              <div>
                <dt>Win %</dt>
                <dd>{stats.played ? Math.round((100 * stats.wins) / stats.played) : 0}</dd>
              </div>
              <div>
                <dt>Streak</dt>
                <dd>{stats.currentStreak}</dd>
              </div>
              <div>
                <dt>Best</dt>
                <dd>{stats.maxStreak}</dd>
              </div>
            </dl>
            <div className="wordle-game__modal-actions">
              <button type="button" className="wordle-game__primary" onClick={playAgain}>
                Play again
              </button>
              <button type="button" className="wordle-game__secondary" onClick={onShare}>
                {copied ? 'Copied!' : 'Share'}
              </button>
              <button type="button" className="wordle-game__secondary" onClick={goToLanding}>
                Back to home
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
