import type { ReactNode } from 'react'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import './BrowserWindow.css'

export type PathSegmentIcon = 'hd' | 'folder' | 'home'

export type PathSegment = {
  label: string
  icon: PathSegmentIcon
}

type Props = {
  windowId: string
  title: string
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
  sidebar: ReactNode
  toolbarEnd?: ReactNode
  pathSegments: PathSegment[]
  itemCount: number
  storageAvailable?: string
  iconScale: number
  onIconScaleChange: (value: number) => void
  children: ReactNode
  className?: string
  canGoBack?: boolean
  canGoForward?: boolean
  onBack?: () => void
  onForward?: () => void
}

export function BrowserWindow({
  windowId,
  title,
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
  sidebar,
  toolbarEnd,
  pathSegments,
  itemCount,
  storageAvailable = '358.81 GB available',
  iconScale,
  onIconScaleChange,
  children,
  className = '',
  canGoBack = false,
  canGoForward = false,
  onBack,
  onForward,
}: Props) {
  const { titleBarProps } = useDraggableWindow(position, onPositionChange)
  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`
  const rangePct = `${((iconScale - 64) / (128 - 64)) * 100}%`

  return (
    <div
      className={`browser-window ${className}`.trim()}
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label={title}
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <div className="browser-window__frame">
        <aside className="browser-window__sidebar">
          <div className="browser-window__sidebar-top">
            <button type="button" className="browser-window__traffic" onClick={onClose} aria-label="Close">
              <span className="browser-window__dot browser-window__dot--close" aria-hidden />
              <span className="browser-window__dot browser-window__dot--min" aria-hidden />
              <span className="browser-window__dot browser-window__dot--max" aria-hidden />
            </button>
          </div>
          <div className="browser-window__sidebar-scroll">{sidebar}</div>
        </aside>

        <div className="browser-window__main">
          <header
            className="browser-window__toolbar"
            {...titleBarProps}
            style={{ touchAction: 'none', cursor: 'grab' }}
          >
            <div className="browser-window__toolbar-nav">
              <button
                type="button"
                className="browser-window__tb-btn"
                disabled={!canGoBack}
                aria-label="Back"
                onClick={onBack}
              >
                <ChevronLeftIcon />
              </button>
              <button
                type="button"
                className="browser-window__tb-btn"
                disabled={!canGoForward}
                aria-label="Forward"
                onClick={onForward}
              >
                <ChevronRightIcon />
              </button>
            </div>
            <h1 className="browser-window__toolbar-title">{title}</h1>
            <div className="browser-window__toolbar-actions">
              <div className="browser-window__tb-group">
                <button type="button" className="browser-window__tb-btn" aria-label="AirDrop">
                  <AirDropIcon />
                </button>
                <button type="button" className="browser-window__tb-btn" aria-label="New folder">
                  <NewFolderIcon />
                </button>
                <button type="button" className="browser-window__tb-btn" aria-label="Delete">
                  <TrashIcon />
                </button>
              </div>
              <button type="button" className="browser-window__tb-btn browser-window__tb-btn--menu" aria-label="View">
                <GridViewIcon />
                <ChevronDownTiny />
              </button>
              <button type="button" className="browser-window__tb-btn" aria-label="Share">
                <ShareIcon />
              </button>
              <button type="button" className="browser-window__tb-btn" aria-label="More">
                <MoreIcon />
              </button>
              <button type="button" className="browser-window__tb-btn" aria-label="Search">
                <SearchIcon />
              </button>
              {toolbarEnd}
            </div>
          </header>

          <div className="browser-window__content">{children}</div>

          <footer className="browser-window__status">
            <div className="browser-window__path">
              {pathSegments.map((seg, i) => (
                <span key={`${seg.label}-${i}`} className="browser-window__path-segment">
                  {i > 0 ? <span className="browser-window__path-chevron" aria-hidden /> : null}
                  <span className={`browser-window__path-icon browser-window__path-icon--${seg.icon}`} aria-hidden />
                  <span className="browser-window__path-label">{seg.label}</span>
                </span>
              ))}
            </div>
            <div className="browser-window__status-row">
              <p className="browser-window__status-meta">
                {itemLabel}, {storageAvailable}
              </p>
              <label className="browser-window__icon-slider">
                <span className="visually-hidden">Icon size</span>
                <input
                  type="range"
                  min={64}
                  max={128}
                  step={4}
                  value={iconScale}
                  style={{ ['--range-pct' as string]: rangePct }}
                  onChange={(e) => onIconScaleChange(Number(e.target.value))}
                />
              </label>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
      <path d="M7.5 2.5 4 6l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
      <path d="M4.5 2.5 8 6l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <circle cx="9" cy="9" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="9" cy="9" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="9" cy="4.5" r="0.85" fill="currentColor" />
    </svg>
  )
}

function NewFolderIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <path
        d="M3 6.5c0-.8.65-1.5 1.5-1.5H8l1.2 1.8H14c.8 0 1.5.7 1.5 1.5V13c0 .8-.7 1.5-1.5 1.5H4.5c-.8 0-1.5-.7-1.5-1.5V6.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path d="M9 8.5v4M7 10.5h4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <path d="M6.5 4V3.5h5V4M4 4.5h10M5.5 4.5l.5 9.5h6l.5-9.5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GridViewIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <rect x="3.5" y="3.5" width="4.5" height="4.5" rx="0.8" fill="currentColor" />
      <rect x="10" y="3.5" width="4.5" height="4.5" rx="0.8" fill="currentColor" />
      <rect x="3.5" y="10" width="4.5" height="4.5" rx="0.8" fill="currentColor" />
      <rect x="10" y="10" width="4.5" height="4.5" rx="0.8" fill="currentColor" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <path d="M9 3.5v8M6 6.5 9 3.5l3 3" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="4" y="9.5" width="10" height="5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <circle cx="5" cy="9" r="1.1" fill="currentColor" />
      <circle cx="9" cy="9" r="1.1" fill="currentColor" />
      <circle cx="13" cy="9" r="1.1" fill="currentColor" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden>
      <circle cx="8" cy="8" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <path d="M11.2 11.2 14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}
