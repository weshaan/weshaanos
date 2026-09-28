import type { FinderGridEntry } from './finderLocations'
import { getEntryKind, getEntryModifiedMs } from './finderItemMeta'

export type FinderSortBy = 'name' | 'kind' | 'date'
export type FinderViewMode = 'icons' | 'list'

export function sortFinderEntries(entries: FinderGridEntry[], sortBy: FinderSortBy): FinderGridEntry[] {
  const copy = [...entries]
  switch (sortBy) {
    case 'name':
      copy.sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }))
      break
    case 'kind':
      copy.sort((a, b) => {
        const byKind = getEntryKind(a).localeCompare(getEntryKind(b))
        return byKind !== 0 ? byKind : a.label.localeCompare(b.label)
      })
      break
    case 'date':
      copy.sort((a, b) => getEntryModifiedMs(b) - getEntryModifiedMs(a))
      break
  }
  return copy
}
