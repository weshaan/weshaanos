import type { PointerEvent } from 'react'
import './WindowBottomDragHandle.css'

export type WindowDragHandleProps = {
  onPointerDown: (event: PointerEvent<HTMLElement>) => void
}

type Props = {
  dragHandleProps: WindowDragHandleProps
}

export function WindowBottomDragHandle({ dragHandleProps }: Props) {
  return (
    <div
      className="window-bottom-drag"
      {...dragHandleProps}
      style={{ touchAction: 'none', cursor: 'grab' }}
      aria-hidden
    />
  )
}
