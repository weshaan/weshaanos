import { todayNoteListTitle, type TodayNoteDraft } from './notesTodayStorage'

export function notePlainText(title: string, body: string): string {
  const t = title.trim()
  const b = body.trim()
  if (t && b) return `${t}\n\n${b}`
  return t || b
}

export function noteTitleAndBody(
  isToday: boolean,
  today: TodayNoteDraft,
  archived: { title: string; body: string },
): { title: string; body: string } {
  if (isToday) {
    return { title: todayNoteListTitle(today), body: today.body }
  }
  return { title: archived.title, body: archived.body }
}

export function noteDownloadFileName(title: string): string {
  const base = title.trim() || 'note'
  const safe =
    base
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60) || 'note'
  return `${safe}.txt`
}

export function downloadNoteAsTxt(title: string, body: string): void {
  const blob = new Blob([notePlainText(title, body)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = noteDownloadFileName(title)
  a.rel = 'noopener'
  document.body.append(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export type BodyHighlightPart = {
  text: string
  matchIndex: number | null
}

export function bodyHighlightParts(text: string, query: string): BodyHighlightPart[] {
  const q = query.trim()
  if (!q) return [{ text, matchIndex: null }]
  const lower = text.toLowerCase()
  const lq = q.toLowerCase()
  const parts: BodyHighlightPart[] = []
  let i = 0
  let matchNum = 0
  while (i < text.length) {
    const idx = lower.indexOf(lq, i)
    if (idx === -1) {
      parts.push({ text: text.slice(i), matchIndex: null })
      break
    }
    if (idx > i) parts.push({ text: text.slice(i, idx), matchIndex: null })
    parts.push({ text: text.slice(idx, idx + q.length), matchIndex: matchNum })
    matchNum += 1
    i = idx + q.length
  }
  return parts.length ? parts : [{ text, matchIndex: null }]
}

export function findMatchIndices(text: string, query: string): number[] {
  const q = query.trim()
  if (!q) return []
  const lower = text.toLowerCase()
  const lq = q.toLowerCase()
  const indices: number[] = []
  let i = 0
  while (i < lower.length) {
    const idx = lower.indexOf(lq, i)
    if (idx === -1) break
    indices.push(idx)
    i = idx + lq.length
  }
  return indices
}
