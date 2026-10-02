import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { BrowserWindow } from './finder-window/BrowserWindow'
import {
  FINDER_LOCATIONS,
  FINDER_SIDEBAR,
  finderEntryKey,
  isFinderDesktopFolderId,
  type FinderGridEntry,
  type FinderLaunchId,
  type FinderLocationId,
  type FinderSidebarEntry,
} from './finder/finderLocations'
import { FinderGridIcon } from './finder/FinderGridIcon'
import { getFinderItemIcon } from './finder/finderIconAssets'
import { finderItemsForLocation } from './finder/finderMusic'
import { getEntryKind, getEntryListSubtitle } from './finder/finderItemMeta'
import { playTrackFromFinder } from '../music/playbackBridge'
import { useMusicPlaylist } from '../hooks/useMusicPlaylist'
import { searchFinderAll } from './finder/finderSearch'
import { sortFinderEntries, type FinderSortBy, type FinderViewMode } from './finder/finderSort'
import { FinderToolbar } from './finder/FinderToolbar'
import { type FinderNavSnapshot, useFinderNavigation } from './finder/useFinderNavigation'
import type { WindowPoint } from '../hooks/useDraggableWindow'
import './FinderWindow.css'

const FINDER_DEFAULT_ICON_SCALE = 72

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
  onOpenItem?: (id: FinderLaunchId) => void
  pendingLocation?: FinderLocationId | null
  onPendingLocationHandled?: () => void
  onLocationChange?: (locationId: FinderLocationId) => void
}

export function FinderWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
  onOpenItem,
  pendingLocation = null,
  onPendingLocationHandled,
  onLocationChange,
}: Props) {
  const [iconScale, setIconScale] = useState(FINDER_DEFAULT_ICON_SCALE)
  const [sortBy, setSortBy] = useState<FinderSortBy>('name')
  const [viewMode, setViewMode] = useState<FinderViewMode>('icons')
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const lastOpenRef = useRef<{ key: string; time: number } | null>(null)
  const { tracks: musicTracks } = useMusicPlaylist()
  const {
    locationId,
    goTo,
    goBack,
    goForward,
    jumpTo,
    openDesktopFolder,
    getNavigationSnapshot,
    restoreNavigationSnapshot,
    canGoBack,
    canGoForward,
  } = useFinderNavigation('home')

  const preSearchNavRef = useRef<FinderNavSnapshot | null>(null)

  useEffect(() => {
    if (!pendingLocation) return
    if (isFinderDesktopFolderId(pendingLocation)) openDesktopFolder(pendingLocation)
    else jumpTo(pendingLocation)
    onPendingLocationHandled?.()
  }, [pendingLocation, jumpTo, openDesktopFolder, onPendingLocationHandled])

  useEffect(() => {
    setSelectedKey(null)
  }, [locationId])

  useEffect(() => {
    onLocationChange?.(locationId)
  }, [locationId, onLocationChange])

  const location = FINDER_LOCATIONS[locationId]
  const selectedSidebarId = location.sidebarId

  const searchActive = searchQuery.trim().length > 0
  const inSearchMode = searchOpen || searchActive
  const searchResults = useMemo(() => searchFinderAll(searchQuery, musicTracks), [searchQuery, musicTracks])

  useEffect(() => {
    if (inSearchMode && !preSearchNavRef.current) {
      preSearchNavRef.current = getNavigationSnapshot()
    }
    if (!inSearchMode) preSearchNavRef.current = null
  }, [inSearchMode, getNavigationSnapshot])

  const clearSearchUi = useCallback(() => {
    setSearchQuery('')
    setSearchOpen(false)
    setSelectedKey(null)
  }, [])

  const exitSearchRestoreFolder = useCallback(() => {
    const snap = preSearchNavRef.current
    if (snap) restoreNavigationSnapshot(snap)
    preSearchNavRef.current = null
    clearSearchUi()
  }, [clearSearchUi, restoreNavigationSnapshot])

  const commitSearchNavigation = useCallback(() => {
    preSearchNavRef.current = null
    clearSearchUi()
  }, [clearSearchUi])

  const locationItems = useMemo(
    () => finderItemsForLocation(locationId, musicTracks),
    [locationId, musicTracks],
  )

  const folderItems = useMemo(
    () => sortFinderEntries(locationItems, sortBy),
    [locationItems, sortBy],
  )

  const openEntry = useCallback(
    (entry: FinderGridEntry) => {
      if (entry.kind === 'place') goTo(entry.place)
      else if (entry.kind === 'music') playTrackFromFinder(entry.trackId)
      else onOpenItem?.(entry.launch)
    },
    [goTo, onOpenItem],
  )

  const openSearchResult = useCallback(
    (resultLocationId: FinderLocationId, entry: FinderGridEntry) => {
      if (entry.kind === 'music') {
        jumpTo('music-beats')
        playTrackFromFinder(entry.trackId)
      } else if (isFinderDesktopFolderId(resultLocationId)) openDesktopFolder(resultLocationId)
      else jumpTo(resultLocationId)
      setSelectedKey(finderEntryKey(entry))
      commitSearchNavigation()
    },
    [jumpTo, openDesktopFolder, commitSearchNavigation],
  )

  const runOpenOnce = useCallback((key: string, open: () => void) => {
    const now = Date.now()
    const last = lastOpenRef.current
    if (last && last.key === key && now - last.time < 400) return
    lastOpenRef.current = { key, time: now }
    open()
  }, [])

  const handleItemClick = useCallback(
    (key: string, open: () => void) => (e: MouseEvent<HTMLButtonElement>) => {
      if (e.detail > 1) {
        if (selectedKey !== key) setSelectedKey(key)
        runOpenOnce(key, open)
        return
      }
      if (selectedKey === key) runOpenOnce(key, open)
      else setSelectedKey(key)
    },
    [selectedKey, runOpenOnce],
  )

  const itemCount = searchActive ? searchResults.length : locationItems.length
  const statusMeta = searchActive
    ? `${itemCount === 1 ? '1 result' : `${itemCount} results`}, 358.81 GB available`
    : undefined

  const toolbarTitle = searchActive ? 'Searching' : location.title

  const handleContentPaneClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('.finder-grid__item, .finder-list__row')) return
      if (inSearchMode) exitSearchRestoreFolder()
      else setSelectedKey(null)
    },
    [exitSearchRestoreFolder, inSearchMode],
  )

  const sidebar = (
    <nav className="finder-sidebar" aria-label="Finder sidebar">
      {renderSidebarSection(undefined, FINDER_SIDEBAR.filter((i) => !i.section), selectedSidebarId, (id) => {
        if (inSearchMode) {
          preSearchNavRef.current = null
          clearSearchUi()
        }
        goTo(id)
      })}
      {renderSidebarSection(
        'Favourites',
        FINDER_SIDEBAR.filter((i) => i.section === 'favourites'),
        selectedSidebarId,
        (id) => {
          if (inSearchMode) {
            preSearchNavRef.current = null
            clearSearchUi()
          }
          goTo(id)
        },
      )}
      {renderSidebarSection(
        'Locations',
        FINDER_SIDEBAR.filter((i) => i.section === 'locations'),
        selectedSidebarId,
        (id) => {
          if (inSearchMode) {
            preSearchNavRef.current = null
            clearSearchUi()
          }
          goTo(id)
        },
      )}
    </nav>
  )

  return (
    <BrowserWindow
      windowId={windowId}
      title={toolbarTitle}
      zIndex={zIndex}
      position={position}
      onPositionChange={onPositionChange}
      onFocus={onFocus}
      onClose={onClose}
      sidebar={sidebar}
      pathSegments={location.path}
      itemCount={itemCount}
      statusMeta={statusMeta}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      onBack={goBack}
      onForward={goForward}
      className="finder-window"
      iconScale={iconScale}
      onIconScaleChange={setIconScale}
      iconScaleDisabled={viewMode === 'list' || searchActive}
      toolbarActions={
        <FinderToolbar
          sortBy={sortBy}
          onSortByChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchOpen={searchOpen}
          onSearchOpenChange={(open) => {
            if (!open && inSearchMode) exitSearchRestoreFolder()
            else setSearchOpen(open)
          }}
          onAirDrop={() => onOpenItem?.('mail')}
          onFocusWindow={onFocus}
        />
      }
    >
      <div
        className={`finder-content-pane${viewMode === 'list' && !searchActive ? ' finder-content-pane--list' : ''}`}
        onClick={handleContentPaneClick}
      >
        {searchActive ? (
          searchResults.length === 0 ? (
            <p className="finder-grid__empty">No results for “{searchQuery.trim()}”</p>
          ) : (
            <ul className="finder-list finder-list--search">
              {searchResults.map((result) => {
                const key = result.entryKey
                const selected = selectedKey === result.entryKey
                return (
                  <li key={key}>
                    <button
                      type="button"
                      className={`finder-list__row${selected ? ' finder-list__row--selected' : ''}`}
                      onClick={handleItemClick(result.entryKey, () =>
                        openSearchResult(result.locationId, result.entry),
                      )}
                    >
                      <FinderGridIcon
                        src={getFinderItemIcon(result.entry)}
                        size={28}
                        label={result.entry.label}
                      />
                      <span className="finder-list__name">{result.entry.label}</span>
                      <span className="finder-list__kind">{result.kind}</span>
                      <span className="finder-list__folder">{result.folderTitle}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )
        ) : folderItems.length === 0 ? (
          <p className="finder-grid__empty">{location.emptyMessage ?? 'No items'}</p>
        ) : viewMode === 'list' ? (
          <ul className="finder-list">
            {folderItems.map((entry) => {
              const key = finderEntryKey(entry)
              const selected = selectedKey === key
              return (
                <li key={key}>
                  <button
                    type="button"
                    className={`finder-list__row${selected ? ' finder-list__row--selected' : ''}`}
                    onClick={handleItemClick(key, () => openEntry(entry))}
                  >
                    <FinderGridIcon src={getFinderItemIcon(entry)} size={28} label={entry.label} />
                    <span className="finder-list__name">{entry.label}</span>
                    <span className="finder-list__kind">{getEntryKind(entry)}</span>
                    <span className="finder-list__date">{getEntryListSubtitle(entry)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <div
            className="finder-grid"
            style={{ ['--finder-icon-size' as string]: `${iconScale}px` }}
          >
            <ul className="finder-grid__list">
              {folderItems.map((entry) => {
                const key = finderEntryKey(entry)
                const selected = selectedKey === key
                return (
                  <li key={key}>
                    <button
                      type="button"
                      className={`finder-grid__item${selected ? ' finder-grid__item--selected' : ''}`}
                      onClick={handleItemClick(key, () => openEntry(entry))}
                    >
                      <FinderGridIcon src={getFinderItemIcon(entry)} size={iconScale} label={entry.label} />
                      <span className="finder-grid__label">{entry.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

      </div>
    </BrowserWindow>
  )
}

function renderSidebarSection(
  title: string | undefined,
  items: FinderSidebarEntry[],
  selectedId: FinderLocationId,
  onSelect: (id: FinderLocationId) => void,
) {
  if (items.length === 0) return null
  return (
    <div className="finder-sidebar__section">
      {title ? <p className="finder-sidebar__heading">{title}</p> : null}
      <ul className="finder-sidebar__list">
        {items.map((item) => {
          const selected = item.id === selectedId
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`finder-sidebar__row${selected ? ' finder-sidebar__row--selected' : ''}`}
                aria-current={selected ? 'location' : undefined}
                onClick={() => onSelect(item.id)}
              >
                <SidebarIcon kind={item.icon} />
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SidebarIcon({ kind }: { kind: FinderSidebarEntry['icon'] }) {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden className="finder-sidebar__icon">
      {kind === 'clock' && (
        <>
          <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </>
      )}
      {kind === 'shared' && (
        <>
          <path d="M3 6.5h7v6.5H3z" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M6 6.5V5.5h7v7.5H10" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="11.5" cy="9" r="1.2" fill="currentColor" />
        </>
      )}
      {kind === 'app' && (
        <path d="M8 3.5 12.5 12H3.5L8 3.5z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      )}
      {kind === 'monitor' && (
        <>
          <rect x="3" y="4" width="10" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M6 13h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </>
      )}
      {kind === 'document' && (
        <>
          <path d="M5 2.5h4l2.5 2.5V13H5V2.5z" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M9 2.5V5h2.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
        </>
      )}
      {kind === 'download' && (
        <>
          <circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M8 5.5v4M6 8.5l2 2 2-2" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </>
      )}
      {kind === 'photo' && (
        <>
          <rect x="3" y="4.5" width="10" height="7.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="6" cy="7" r="1" fill="currentColor" />
          <path d="M3 10.5l2.5-2 2 2 2-2 3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1" />
        </>
      )}
      {kind === 'music' && (
        <path d="M10.5 3v7a2 2 0 1 1-1-1.85V6H6v5a2 2 0 1 1-1-1.85V3h5.5z" fill="none" stroke="currentColor" strokeWidth="1.05" />
      )}
      {kind === 'film' && (
        <>
          <rect x="3.5" y="5" width="9" height="7" rx="1" fill="none" stroke="currentColor" strokeWidth="1.1" />
          <path d="M5.5 5v7M8 5v7M10.5 5v7" stroke="currentColor" strokeWidth="0.9" />
        </>
      )}
      {kind === 'home' && (
        <path d="M3.5 7.5 8 4l4.5 3.5V13H10v-3H6v3H3.5V7.5z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      )}
      {kind === 'trash' && (
        <>
          <path d="M5.5 5.5h5l-.5 7.5H6L5.5 5.5z" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinejoin="round" />
          <path d="M4 5.5h8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M6.5 5.5V4.5h3v1" fill="none" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
