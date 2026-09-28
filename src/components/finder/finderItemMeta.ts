import type { FinderGridEntry } from './finderLocations'
import { finderEntryKey } from './finderLocations'

const MODIFIED_MS: Record<string, number> = {
  'place-desktop': Date.parse('2026-03-01'),
  'place-documents': Date.parse('2026-02-14'),
  'place-downloads': Date.parse('2026-01-08'),
  'place-movies-nav': Date.parse('2026-02-20'),
  'place-music': Date.parse('2025-12-01'),
  'place-pictures': Date.parse('2026-03-10'),
  'place-shared': Date.parse('2025-11-20'),
  'place-applications': Date.parse('2026-03-15'),
  'place-projects': Date.parse('2026-03-18'),
  'place-images': Date.parse('2026-03-12'),
  'place-misc': Date.parse('2026-02-28'),
  'place-localhost': Date.parse('2026-03-05'),
  'place-projects-marketplace': Date.parse('2026-03-16'),
  'place-projects-portfolio': Date.parse('2026-03-17'),
  'place-projects-experiments': Date.parse('2026-03-09'),
  'launch-resume': Date.parse('2026-03-01'),
  'launch-mail': Date.parse('2026-03-14'),
  'launch-terminal': Date.parse('2026-03-14'),
  'launch-settings': Date.parse('2026-03-14'),
  'launch-weather': Date.parse('2026-03-20'),
  'launch-calendar': Date.parse('2026-03-28'),
  'launch-calculator': Date.parse('2026-01-09'),
  'launch-pdfviewer': Date.parse('2026-03-01'),
}

export function getEntryKind(entry: FinderGridEntry): string {
  if (entry.kind === 'place') return 'Folder'
  if (entry.kind === 'music') return 'MP3 audio'
  if (entry.kind === 'launch' && entry.launch === 'resume') return 'PDF document'
  return 'Application'
}

export function getEntrySize(entry: FinderGridEntry): string {
  if (entry.kind === 'place') return '--'
  if (entry.kind === 'music') return '—'
  if (entry.kind === 'launch' && entry.launch === 'resume') return '2.4 MB'
  return '4.8 MB'
}

export function getEntryListSubtitle(entry: FinderGridEntry): string {
  if (entry.kind === 'music' && entry.artist) return entry.artist
  if (entry.kind === 'music') return getEntryKind(entry)
  return formatFinderDate(getEntryModifiedMs(entry))
}

export function getEntryModifiedMs(entry: FinderGridEntry): number {
  if (entry.kind === 'music') {
    return MODIFIED_MS[`music-${entry.trackId}`] ?? Date.parse('2026-03-01')
  }
  const key = finderEntryKey(entry)
  return MODIFIED_MS[key] ?? Date.parse('2026-01-01')
}

export function formatFinderDate(ms: number): string {
  return new Date(ms).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
