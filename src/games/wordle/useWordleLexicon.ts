import { useEffect, useState } from 'react'

export type WordleLexicon = {
  answers: string[]
  allowed: Set<string>
}

let cached: WordleLexicon | null = null
let loadPromise: Promise<WordleLexicon> | null = null

function parseWordLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length === 5 && /^[a-z]+$/.test(w))
}

async function fetchLexicon(): Promise<WordleLexicon> {
  if (cached) return cached
  if (loadPromise) return loadPromise

  loadPromise = Promise.all([
    fetch('/games/wordle-answers.txt'),
    fetch('/games/wordle-words.txt'),
  ])
    .then(async ([answersRes, guessesRes]) => {
      if (!answersRes.ok || !guessesRes.ok) throw new Error('Failed to load word lists')
      const [answersText, guessesText] = await Promise.all([answersRes.text(), guessesRes.text()])
      const answers = [...new Set(parseWordLines(answersText))].sort()
      const guessWords = parseWordLines(guessesText)
      const allowed = new Set<string>([...answers, ...guessWords])
      if (answers.length === 0) throw new Error('Empty answer list')
      cached = { answers, allowed }
      return cached
    })

  return loadPromise
}

export function useWordleLexicon(): {
  lexicon: WordleLexicon | null
  error: string | null
  loading: boolean
} {
  const [lexicon, setLexicon] = useState<WordleLexicon | null>(cached)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    if (cached) return
    fetchLexicon()
      .then((lx) => {
        setLexicon(lx)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load dictionary.')
        setLoading(false)
      })
  }, [])

  return { lexicon, error, loading }
}
