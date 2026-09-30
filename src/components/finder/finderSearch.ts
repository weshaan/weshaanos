import type { MusicTrack } from '../../music/types'
import {
  FINDER_LOCATIONS,
  finderEntryKey,
  finderEntryNavigateTo,
  type FinderGridEntry,
  type FinderLocationId,
} from './finderLocations'
import { finderItemsForLocation } from './finderMusic'
import { getEntryKind } from './finderItemMeta'

export type FinderSearchResult = {
  entry: FinderGridEntry
  entryKey: string
  /** Location to open when the user picks this result */
  locationId: FinderLocationId
  folderTitle: string
  kind: string
}

function entryMatchesQuery(entry: FinderGridEntry, q: string): boolean {
  if (entry.label.toLowerCase().includes(q)) return true
  if (entry.kind === 'music' && entry.artist?.toLowerCase().includes(q)) return true
  if (entry.kind === 'music' && entry.fileName.toLowerCase().includes(q)) return true
  return false
}

export function searchFinderAll(query: string, musicTracks: MusicTrack[] = []): FinderSearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const byKey = new Map<string, FinderSearchResult>()

  for (const [scanLocationId] of Object.entries(FINDER_LOCATIONS) as [
    FinderLocationId,
    (typeof FINDER_LOCATIONS)[FinderLocationId],
  ][]) {
    if (scanLocationId === 'bin') continue
    const items = finderItemsForLocation(scanLocationId, musicTracks)
    for (const entry of items) {
      if (!entryMatchesQuery(entry, q)) continue

      const entryKey = finderEntryKey(entry)
      if (byKey.has(entryKey)) continue

      const locationId = finderEntryNavigateTo(entry)
      byKey.set(entryKey, {
        entry,
        entryKey,
        locationId,
        folderTitle: FINDER_LOCATIONS[locationId].title,
        kind: getEntryKind(entry),
      })
    }
  }

  const results = [...byKey.values()]
  results.sort((a, b) => a.entry.label.localeCompare(b.entry.label, undefined, { sensitivity: 'base' }))
  return results
}
