import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { QUICK_ACTION_IDS, type QuickActionId } from '../quickActions/types'

const STORAGE_KEY = 'portfolio-quick-actions-done'

function readDone(): Set<QuickActionId> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed.filter((id): id is QuickActionId => QUICK_ACTION_IDS.includes(id as QuickActionId)))
  } catch {
    return new Set()
  }
}

function writeDone(done: Set<QuickActionId>) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...done]))
  } catch {
    /* ignore quota / private mode */
  }
}

type QuickActionsContextValue = {
  isDone: (id: QuickActionId) => boolean
  markDone: (id: QuickActionId) => void
}

const QuickActionsContext = createContext<QuickActionsContextValue | null>(null)

export function QuickActionsProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState<Set<QuickActionId>>(readDone)

  const markDone = useCallback((id: QuickActionId) => {
    setDone((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      writeDone(next)
      return next
    })
  }, [])

  const isDone = useCallback((id: QuickActionId) => done.has(id), [done])

  const value = useMemo(() => ({ isDone, markDone }), [isDone, markDone])

  return <QuickActionsContext.Provider value={value}>{children}</QuickActionsContext.Provider>
}

export function useQuickActions() {
  const ctx = useContext(QuickActionsContext)
  if (!ctx) throw new Error('useQuickActions must be used within QuickActionsProvider')
  return ctx
}
