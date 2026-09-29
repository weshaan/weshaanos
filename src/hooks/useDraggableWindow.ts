import { useCallback, useRef, type PointerEvent as ReactPointerEvent } from 'react'

export type WindowPoint = { x: number; y: number }

type DragState = {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
}

export function useDraggableWindow(position: WindowPoint, onPositionChange: (point: WindowPoint) => void) {
  const dragRef = useRef<DragState | null>(null)
  const positionRef = useRef(position)
  const onPositionChangeRef = useRef(onPositionChange)
  positionRef.current = position
  onPositionChangeRef.current = onPositionChange

  const onDragPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest('button, a, input, textarea, select')) return

    event.preventDefault()

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: positionRef.current.x,
      originY: positionRef.current.y,
    }

    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      if ((e.buttons & 1) === 0) {
        dragRef.current = null
        cleanup()
        return
      }
      onPositionChangeRef.current({
        x: drag.originX + e.clientX - drag.startX,
        y: drag.originY + e.clientY - drag.startY,
      })
    }

    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || drag.pointerId !== e.pointerId) return
      dragRef.current = null
      cleanup()
    }

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }, [])

  const dragHandleProps = {
    onPointerDown: onDragPointerDown,
  }

  return {
    titleBarProps: dragHandleProps,
    dragHandleProps,
  }
}
