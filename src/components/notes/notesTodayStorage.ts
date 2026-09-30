export const TODAY_NOTE_ID = 'note-today'

const STORAGE_KEY = 'portfolio-notes-today'

export type TodayNoteDraft = {
  title: string
  body: string
  updatedAt: number
}

function defaultDraft(): TodayNoteDraft {
  return { title: '', body: '', updatedAt: Date.now() }
}

export function loadTodayNote(): TodayNoteDraft {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultDraft()
    const parsed = JSON.parse(raw) as Partial<TodayNoteDraft>
    return {
      title: typeof parsed.title === 'string' ? parsed.title : '',
      body: typeof parsed.body === 'string' ? parsed.body : '',
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : Date.now(),
    }
  } catch {
    return defaultDraft()
  }
}

export function saveTodayNote(draft: TodayNoteDraft): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
  } catch {
    /* quota / private mode */
  }
}

export function todayNoteListTitle(draft: TodayNoteDraft): string {
  const t = draft.title.trim()
  return t || 'New note'
}

export function todayNotePreview(draft: TodayNoteDraft): string {
  const line = draft.body.split('\n').find((l) => l.trim())?.trim() ?? ''
  if (line.length <= 80) return line
  return `${line.slice(0, 77)}…`
}

export function formatNoteMeta(updatedAt: number): string {
  const d = new Date(updatedAt)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  }
  return d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export function formatEditedStamp(updatedAt: number): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(updatedAt))
}
