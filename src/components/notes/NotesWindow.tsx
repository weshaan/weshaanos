import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import { NOTE_SECTION_ORDER, SAMPLE_NOTES, notesBySection, type NoteItem } from './notesData'
import {
  downloadNoteAsTxt,
  bodyHighlightParts,
  findMatchIndices,
  notePlainText,
  noteTitleAndBody,
} from './notesNoteActions'
import { syncArmaanRevealFromNotesText } from '../../music/musicSecretPlaylists'
import {
  formatEditedStamp,
  formatNoteMeta,
  loadTodayNote,
  saveTodayNote,
  TODAY_NOTE_ID,
  todayNoteListTitle,
  todayNotePreview,
  type TodayNoteDraft,
} from './notesTodayStorage'
import {
  NotesChevronDownIcon,
  NotesChevronUpIcon,
  NotesClearIcon,
  NotesCopyIcon,
  NotesDownloadIcon,
  NotesSearchClearIcon,
  NotesSearchIcon,
  NotesSidebarMoreIcon,
} from './NotesIcons'
import '../finder-window/BrowserWindow.css'
import './NotesWindow.css'

type Props = {
  windowId: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
}

export function NotesWindow({
  windowId,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
}: Props) {
  const { titleBarProps, dragHandleProps } = useDraggableWindow(position, onPositionChange)
  const [selectedId, setSelectedId] = useState(TODAY_NOTE_ID)
  const [today, setToday] = useState<TodayNoteDraft>(loadTodayNote)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [matchCursor, setMatchCursor] = useState(0)
  const [status, setStatus] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const highlightLayerRef = useRef<HTMLDivElement>(null)
  const sidebarMenuRef = useRef<HTMLDivElement>(null)
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState(false)

  const notes = useMemo(() => {
    return SAMPLE_NOTES.map((note) => {
      if (note.id !== TODAY_NOTE_ID) return note
      return {
        ...note,
        title: todayNoteListTitle(today),
        preview: todayNotePreview(today),
        meta: formatNoteMeta(today.updatedAt),
      }
    })
  }, [today])

  const grouped = useMemo(() => notesBySection(notes), [notes])
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0]
  const isTodayNote = selected?.id === TODAY_NOTE_ID

  const { title: noteTitle, body: noteBody } = noteTitleAndBody(
    isTodayNote,
    today,
    selected ?? { title: '', body: '' },
  )

  const searchMatches = useMemo(
    () => findMatchIndices(noteBody, searchQuery),
    [noteBody, searchQuery],
  )

  useEffect(() => {
    setMatchCursor(0)
  }, [searchQuery, selectedId])

  useEffect(() => {
    if (!isTodayNote) {
      setSearchOpen(false)
      setSearchQuery('')
    }
  }, [isTodayNote])

  const showSearchHighlights = isTodayNote && searchOpen && Boolean(searchQuery.trim())

  useEffect(() => {
    if (!showSearchHighlights || !searchMatches.length) return
    const safe = Math.min(matchCursor, searchMatches.length - 1)
    const el = highlightLayerRef.current?.querySelector(`[data-match-index="${safe}"]`)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [matchCursor, showSearchHighlights, searchMatches.length])

  useEffect(() => {
    if (!status) return
    const t = window.setTimeout(() => setStatus(''), 2200)
    return () => window.clearTimeout(t)
  }, [status])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  useEffect(() => {
    if (!sidebarMenuOpen) return
    const onDocDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (sidebarMenuRef.current && !sidebarMenuRef.current.contains(t)) {
        setSidebarMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [sidebarMenuOpen])

  const updateToday = (patch: Partial<Pick<TodayNoteDraft, 'title' | 'body'>>) => {
    const next: TodayNoteDraft = {
      ...today,
      ...patch,
      updatedAt: Date.now(),
    }
    setToday(next)
    saveTodayNote(next)
  }

  useEffect(() => {
    syncArmaanRevealFromNotesText(`${today.title}\n${today.body}`)
  }, [today.title, today.body])

  const flash = (message: string) => setStatus(message)

  const onClear = () => {
    if (!isTodayNote) return
    if (!window.confirm('Clear this note? This cannot be undone.')) return
    updateToday({ title: '', body: '' })
    flash('Note cleared')
  }

  const onCopy = async () => {
    const text = notePlainText(noteTitle, noteBody)
    try {
      await navigator.clipboard.writeText(text)
      flash('Copied to clipboard')
    } catch {
      flash('Could not copy')
    }
  }

  const onDownload = () => {
    downloadNoteAsTxt(noteTitle, noteBody)
    flash('Download started')
  }

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setSearchQuery('')
      return !open
    })
  }

  const onNextMatch = () => {
    if (!searchMatches.length) return
    setMatchCursor((c) => (c + 1) % searchMatches.length)
    searchRef.current?.focus()
  }

  const onPrevMatch = () => {
    if (!searchMatches.length) return
    setMatchCursor((c) => (c - 1 + searchMatches.length) % searchMatches.length)
    searchRef.current?.focus()
  }

  return (
    <div
      className="notes-window"
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label="Notes"
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <header
        className="notes-window__titlebar"
        {...titleBarProps}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <button type="button" className="notes-window__traffic" onClick={onClose} aria-label="Close">
          <span className="notes-window__dot notes-window__dot--close" aria-hidden />
          <span className="notes-window__dot notes-window__dot--min" aria-hidden />
          <span className="notes-window__dot notes-window__dot--max" aria-hidden />
        </button>
      </header>

      <div className="notes-window__frame">
        <aside className="notes-sidebar" aria-label="Notes list">
          <div className="notes-sidebar__head">
            <div>
              <h1 className="notes-sidebar__title">Notes</h1>
              <p className="notes-sidebar__count">{notes.length} notes</p>
            </div>
            <div className="notes-sidebar__menu-wrap" ref={sidebarMenuRef}>
              <button
                type="button"
                className={`notes-sidebar__menu${sidebarMenuOpen ? ' notes-sidebar__menu--active' : ''}`}
                aria-label="Sidebar options"
                aria-expanded={sidebarMenuOpen}
                aria-haspopup="dialog"
                onClick={() => setSidebarMenuOpen((open) => !open)}
              >
                <NotesSidebarMoreIcon size={16} />
              </button>
              {sidebarMenuOpen ? (
                <div className="notes-sidebar__dropdown" role="dialog" aria-label="About your note">
                  <p className="notes-sidebar__dropdown-text">One note for you too, just one.</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="notes-sidebar__scroll">
            {NOTE_SECTION_ORDER.map((section) => {
              const items = grouped.get(section)
              if (!items?.length) return null
              return (
                <section key={section} className="notes-sidebar__section">
                  <h2 className="notes-sidebar__section-title">{section}</h2>
                  <ul className="notes-sidebar__list">
                    {items.map((note) => (
                      <NoteRow
                        key={note.id}
                        note={note}
                        selected={note.id === selectedId}
                        onSelect={() => setSelectedId(note.id)}
                      />
                    ))}
                  </ul>
                </section>
              )
            })}
          </div>
        </aside>

        <main className="notes-editor">
          <div className="notes-toolbar">
            <div className="notes-toolbar__tools">
              <div className="browser-window__tb-group">
                <ToolbarBtn label="Clear note" disabled={!isTodayNote} onClick={onClear}>
                  <NotesClearIcon />
                </ToolbarBtn>
                <ToolbarBtn label="Copy note" disabled={!isTodayNote} onClick={onCopy}>
                  <NotesCopyIcon />
                </ToolbarBtn>
                <ToolbarBtn label="Download note" disabled={!isTodayNote} onClick={onDownload}>
                  <NotesDownloadIcon />
                </ToolbarBtn>
                <ToolbarBtn
                  label={searchOpen ? 'Close search' : 'Search in note'}
                  disabled={!isTodayNote}
                  pressed={searchOpen}
                  onClick={toggleSearch}
                >
                  <NotesSearchIcon />
                </ToolbarBtn>
              </div>
              {searchOpen ? (
                <>
                  <div className="notes-toolbar__search-field">
                    <input
                      ref={searchRef}
                      type="text"
                      inputMode="search"
                      enterKeyHint="search"
                      className="notes-toolbar__search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchMatches.length) {
                          e.preventDefault()
                          onNextMatch()
                        }
                      }}
                      placeholder="Find in note"
                      aria-label="Find in note"
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        className="notes-toolbar__search-clear"
                        aria-label="Clear search"
                        onClick={() => {
                          setSearchQuery('')
                          searchRef.current?.focus()
                        }}
                      >
                        <NotesSearchClearIcon />
                      </button>
                    ) : null}
                  </div>
                  {searchQuery.trim() ? (
                    <span className="notes-toolbar__search-meta">
                      {searchMatches.length
                        ? `${matchCursor + 1} of ${searchMatches.length}`
                        : 'No matches'}
                    </span>
                  ) : null}
                  {isTodayNote && searchMatches.length > 1 ? (
                    <div className="browser-window__tb-group">
                      <button
                        type="button"
                        className="browser-window__tb-btn"
                        aria-label="Previous match"
                        onClick={onPrevMatch}
                      >
                        <NotesChevronUpIcon />
                      </button>
                      <button
                        type="button"
                        className="browser-window__tb-btn"
                        aria-label="Next match"
                        onClick={onNextMatch}
                      >
                        <NotesChevronDownIcon />
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
            <p className="notes-toolbar__status" role="status" aria-live="polite">
              {status}
            </p>
          </div>

          {selected ? (
            <article
              className="notes-editor__article"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <p className="notes-editor__stamp">
                {isTodayNote ? formatEditedStamp(today.updatedAt) : selected.editedAt}
              </p>
              {isTodayNote ? (
                <>
                  <input
                    type="text"
                    className="notes-editor__title-input"
                    value={today.title}
                    onChange={(e) => updateToday({ title: e.target.value })}
                    placeholder="New note"
                    aria-label="Note title"
                  />
                  <SearchableNoteBody
                    body={today.body}
                    onChange={(body) => updateToday({ body })}
                    showHighlights={showSearchHighlights}
                    searchQuery={searchQuery}
                    matchCursor={matchCursor}
                    highlightLayerRef={highlightLayerRef}
                  />
                </>
              ) : (
                <>
                  <h2 className="notes-editor__title">{selected.title}</h2>
                  <p className="notes-editor__body">{selected.body}</p>
                </>
              )}
            </article>
          ) : null}
        </main>
      </div>

      <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
    </div>
  )
}

function SearchableNoteBody({
  body,
  onChange,
  showHighlights,
  searchQuery,
  matchCursor,
  highlightLayerRef,
}: {
  body: string
  onChange: (body: string) => void
  showHighlights: boolean
  searchQuery: string
  matchCursor: number
  highlightLayerRef: RefObject<HTMLDivElement | null>
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const parts = useMemo(
    () => bodyHighlightParts(body, searchQuery),
    [body, searchQuery],
  )

  const syncScroll = () => {
    const layer = highlightLayerRef.current
    const field = textareaRef.current
    if (layer && field) layer.scrollTop = field.scrollTop
  }

  return (
    <div className="notes-editor__body-stack">
      {showHighlights ? (
        <div ref={highlightLayerRef} className="notes-editor__body-highlights" aria-hidden>
          {parts.map((part, i) =>
            part.matchIndex !== null ? (
              <mark
                key={i}
                data-match-index={part.matchIndex}
                className={
                  part.matchIndex === matchCursor
                    ? 'notes-search-hit notes-search-hit--current'
                    : 'notes-search-hit'
                }
              >
                {part.text}
              </mark>
            ) : (
              <span key={i}>{part.text}</span>
            ),
          )}
        </div>
      ) : null}
      <textarea
        ref={textareaRef}
        className={`notes-editor__body-input${
          showHighlights ? ' notes-editor__body-input--searching' : ''
        }`}
        value={body}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        placeholder="Start writing…"
        aria-label="Note body"
      />
    </div>
  )
}

function NoteRow({
  note,
  selected,
  onSelect,
}: {
  note: NoteItem
  selected: boolean
  onSelect: () => void
}) {
  return (
    <li>
      <button
        type="button"
        className={`notes-row${selected ? ' notes-row--selected' : ''}`}
        onClick={onSelect}
      >
        <div className="notes-row__text">
          <span className="notes-row__title">{note.title}</span>
          <span className="notes-row__meta">
            <span className="notes-row__time">{note.meta}</span>
            <span className="notes-row__preview">{note.preview}</span>
          </span>
        </div>
      </button>
    </li>
  )
}

function ToolbarBtn({
  label,
  children,
  onClick,
  disabled,
  pressed,
}: {
  label: string
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  pressed?: boolean
}) {
  return (
    <button
      type="button"
      className={`browser-window__tb-btn${pressed ? ' browser-window__tb-btn--active' : ''}`}
      aria-label={label}
      aria-pressed={pressed ?? false}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
