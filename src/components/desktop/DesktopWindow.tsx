import type { ReactNode } from 'react'
import { useDraggableWindow, type WindowPoint } from '../../hooks/useDraggableWindow'
import { WindowBottomDragHandle } from './WindowBottomDragHandle'
import './DesktopWindow.css'

export type DesktopWindowVariant = 'panel' | 'preview'

type Props = {
  windowId: string
  title: string
  subtitle?: string
  variant?: DesktopWindowVariant
  zIndex: number
  position: WindowPoint
  onPositionChange: (point: WindowPoint) => void
  onFocus: () => void
  onClose: () => void
  toolbarEnd?: ReactNode
  children: ReactNode
  className?: string
}

export function DesktopWindow({
  windowId,
  title,
  subtitle,
  variant = 'panel',
  zIndex,
  position,
  onPositionChange,
  onFocus,
  onClose,
  toolbarEnd,
  children,
  className = '',
}: Props) {
  const { titleBarProps, dragHandleProps } = useDraggableWindow(position, onPositionChange)

  const shellClass = [
    'desktop-window',
    variant === 'preview' ? 'desktop-window--preview' : 'desktop-window--panel',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const titlebarClass =
    variant === 'preview'
      ? 'desktop-window__titlebar desktop-window__titlebar--preview'
      : 'desktop-window__titlebar desktop-window__titlebar--panel'

  return (
    <div
      className={shellClass}
      style={{ left: position.x, top: position.y, zIndex }}
      role="dialog"
      aria-label={title}
      data-window-id={windowId}
      onPointerDown={onFocus}
    >
      <header
        className={titlebarClass}
        {...titleBarProps}
        style={{ touchAction: 'none', cursor: 'grab' }}
      >
        <button type="button" className="desktop-window__traffic" onClick={onClose} aria-label="Close">
          <span className="desktop-window__dot desktop-window__dot--close" aria-hidden />
          <span className="desktop-window__dot desktop-window__dot--min" aria-hidden />
          <span className="desktop-window__dot desktop-window__dot--max" aria-hidden />
        </button>
        <div className="desktop-window__title-block">
          <span className="desktop-window__title">{title}</span>
          {subtitle ? <span className="desktop-window__subtitle">{subtitle}</span> : null}
        </div>
        {variant === 'preview' ? (
          toolbarEnd ? (
            <div className="desktop-window__toolbar-end">{toolbarEnd}</div>
          ) : (
            <span className="desktop-window__toolbar-spacer" aria-hidden />
          )
        ) : null}
      </header>
      <div className="desktop-window__body">{children}</div>
      <WindowBottomDragHandle dragHandleProps={dragHandleProps} />
    </div>
  )
}
