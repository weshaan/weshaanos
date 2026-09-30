import { useMemo, useState, type ReactNode } from 'react'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import { NOTE_SECTION_ORDER, SAMPLE_NOTES, notesBySection, type NoteItem } from './notesData'
import {
  NotesAttachIcon,
  NotesChecklistIcon,
  NotesComposeIcon,
  NotesMarkupIcon,
  NotesMoreIcon,
  NotesSearchIcon,
  NotesShareIcon,
  NotesSidebarMoreIcon,
  NotesTableIcon,
  NotesTextStyleIcon,
} from './NotesIcons'
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
  const [selectedId, setSelectedId] = useState(SAMPLE_NOTES[0]?.id ?? '')
  const notes = SAMPLE_NOTES
  const grouped = useMemo(() => notesBySection(notes), [notes])
  const selected = notes.find((n) => n.id === selectedId) ?? notes[0]

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
            <button type="button" className="notes-sidebar__menu" aria-label="Sidebar options">
              <NotesSidebarMoreIcon size={16} />
            </button>
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
            <div className="notes-toolbar__left">
              <ToolbarBtn label="New note">
                <NotesComposeIcon />
              </ToolbarBtn>
            </div>
            <div className="notes-toolbar__center">
              <ToolbarBtn label="Text style">
                <NotesTextStyleIcon />
              </ToolbarBtn>
              <ToolbarBtn label="Checklist">
                <NotesChecklistIcon />
              </ToolbarBtn>
              <ToolbarBtn label="Table">
                <NotesTableIcon />
              </ToolbarBtn>
              <ToolbarBtn label="Attach">
                <NotesAttachIcon />
              </ToolbarBtn>
              <ToolbarBtn label="Markup">
                <NotesMarkupIcon />
              </ToolbarBtn>
            </div>
            <div className="notes-toolbar__right">
              <ToolbarBtn label="Share">
                <NotesShareIcon />
              </ToolbarBtn>
              <ToolbarBtn label="More">
                <NotesMoreIcon />
              </ToolbarBtn>
              <ToolbarBtn label="Search">
                <NotesSearchIcon />
              </ToolbarBtn>
            </div>
          </div>

          {selected ? (
            <article className="notes-editor__article">
              <p className="notes-editor__stamp">{selected.editedAt}</p>
              <h2 className="notes-editor__title">{selected.title}</h2>
              <p
                className={`notes-editor__body${
                  selected.section === 'Today' ? ' notes-editor__body--caret' : ''
                }`}
              >
                {selected.body}
              </p>
            </article>
          ) : null}
        </main>
      </div>

      <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
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

function ToolbarBtn({ label, children }: { label: string; children: ReactNode }) {
  return (
    <button type="button" className="notes-toolbar__btn" aria-label={label}>
      {children}
    </button>
  )
}
