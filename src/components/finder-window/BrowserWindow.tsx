import type { ReactNode } from 'react'
import { WindowBottomDragHandle } from '../desktop/WindowBottomDragHandle'
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
  toolbarActions?: ReactNode
  statusMeta?: string
  iconScale?: number
  onIconScaleChange?: (value: number) => void
  iconScaleDisabled?: boolean
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
  toolbarActions,
  statusMeta,
  iconScale,
  onIconScaleChange,
  iconScaleDisabled = false,
  children,
  className = '',
  canGoBack = false,
  canGoForward = false,
  onBack,
  onForward,
}: Props) {
  const { titleBarProps, dragHandleProps } = useDraggableWindow(position, onPositionChange)
  const itemLabel = itemCount === 1 ? '1 item' : `${itemCount} items`
  const statusLine = statusMeta ?? `${itemLabel}, ${storageAvailable}`
  const showIconSlider = iconScale !== undefined && onIconScaleChange !== undefined
  const rangePct = showIconSlider ? `${((iconScale - 64) / (128 - 64)) * 100}%` : '50%'

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
              {toolbarActions}
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
              <p className="browser-window__status-meta">{statusLine}</p>
              {showIconSlider ? (
                <label
                  className={`browser-window__icon-slider${iconScaleDisabled ? ' browser-window__icon-slider--disabled' : ''}`}
                >
                  <span className="visually-hidden">Icon size</span>
                  <input
                    type="range"
                    min={64}
                    max={128}
                    step={4}
                    value={iconScale}
                    disabled={iconScaleDisabled}
                    style={{ ['--range-pct' as string]: rangePct }}
                    onChange={(e) => onIconScaleChange(Number(e.target.value))}
                  />
                </label>
              ) : null}
            </div>
          </footer>
          <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
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

