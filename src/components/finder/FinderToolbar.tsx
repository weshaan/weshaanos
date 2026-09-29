import { useEffect, useRef, useState } from 'react'
import type { FinderSortBy, FinderViewMode } from './finderSort'

type Props = {
  sortBy: FinderSortBy
  onSortByChange: (value: FinderSortBy) => void
  viewMode: FinderViewMode
  onViewModeChange: (value: FinderViewMode) => void
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  searchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  onAirDrop: () => void
  onFocusWindow?: () => void
}

export function FinderToolbar({
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  searchOpen,
  onSearchOpenChange,
  onAirDrop,
  onFocusWindow,
}: Props) {
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const viewRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!searchOpen) return
    searchInputRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (viewMenuOpen && viewRef.current && !viewRef.current.contains(t)) setViewMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [viewMenuOpen])

  return (
    <div className="finder-toolbar">
      <button type="button" className="browser-window__tb-btn finder-toolbar__airdrop-btn" aria-label="AirDrop" onClick={onAirDrop}>
        <AirDropIcon />
      </button>

      <div className="finder-toolbar__menu-wrap" ref={viewRef}>
        <button
          type="button"
          className={`browser-window__tb-btn browser-window__tb-btn--menu${viewMenuOpen ? ' browser-window__tb-btn--active' : ''}`}
          aria-label="View"
          aria-expanded={viewMenuOpen}
          onClick={() => {
            onFocusWindow?.()
            setViewMenuOpen((o) => !o)
          }}
        >
          <GridViewIcon />
          <ChevronDownTiny />
        </button>
        {viewMenuOpen ? (
          <div className="finder-toolbar__menu" role="menu">
            <p className="finder-toolbar__menu-label">View as</p>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={viewMode === 'icons'}
              className="finder-toolbar__menu-item"
              onClick={() => onViewModeChange('icons')}
            >
              Icons {viewMode === 'icons' ? '✓' : ''}
            </button>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={viewMode === 'list'}
              className="finder-toolbar__menu-item"
              onClick={() => onViewModeChange('list')}
            >
              List {viewMode === 'list' ? '✓' : ''}
            </button>
            <p className="finder-toolbar__menu-label">Sort by</p>
            {(
              [
                ['name', 'Name'],
                ['kind', 'Kind'],
                ['date', 'Date Modified'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="menuitemradio"
                aria-checked={sortBy === id}
                className="finder-toolbar__menu-item"
                onClick={() => onSortByChange(id)}
              >
                {label} {sortBy === id ? '✓' : ''}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        className={`browser-window__tb-btn${searchOpen ? ' browser-window__tb-btn--active' : ''}`}
        aria-label="Search"
        aria-pressed={searchOpen}
        onClick={() => onSearchOpenChange(!searchOpen)}
      >
        <SearchIcon />
      </button>

      {searchOpen ? (
        <input
          ref={searchInputRef}
          type="search"
          className="finder-toolbar__search"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          aria-label="Search all folders"
        />
      ) : null}
    </div>
  )
}

function ChevronDownTiny() {
  return (
    <svg viewBox="0 0 8 5" width="8" height="5" aria-hidden className="browser-window__chevron-down">
      <path d="M1 1l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function AirDropIcon() {
  return (
    <svg viewBox="0 0 18 18" width="21" height="21" aria-hidden>
      <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="9" cy="9" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="9" cy="4.5" r="0.95" fill="currentColor" />
    </svg>
  )
}

function GridViewIcon() {
  return (
    <svg viewBox="0 0 18 18" width="21" height="21" aria-hidden>
      <rect x="2.25" y="2.25" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9.75" y="2.25" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="2.25" y="9.75" width="6" height="6" rx="1" fill="currentColor" />
      <rect x="9.75" y="9.75" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 18 18" width="21" height="21" aria-hidden>
      <circle cx="8" cy="8" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11.2 11.2 14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
