import { useCallback, useRef, useState } from 'react'
import { clampWindowPoint, estimateWindowSize } from '../desktop/windowPositionBounds'
import type { WindowPoint } from './useDraggableWindow'

export type DesktopWindowId = string

const BASE_Z = 60

function centerWindow(width: number, height: number): WindowPoint {
  if (typeof window === 'undefined') return { x: 80, y: 72 }
  const menu = 28
  const dock = 72
  const x = Math.max(16, (window.innerWidth - width) / 2)
  const y = Math.max(menu + 12, (window.innerHeight - height - dock) / 2)
  return { x, y }
}

const defaultPositions: Record<string, () => WindowPoint> = {
  resume: () => centerWindow(720, 640),
  finder: () => centerWindow(860, 515),
  weather: () => centerWindow(960, 620),
  calculator: () => centerWindow(228, 430),
  calendar: () => centerWindow(400, 520),
  games: () => centerWindow(720, 520),
  clock: () => centerWindow(620, 420),
  musicapp: () => centerWindow(311, 548),
  brave: () => centerWindow(1060, 660),
  notes: () => centerWindow(920, 580),
  profile: () => {
    const p = centerWindow(440, 320)
    return { x: p.x, y: p.y + 25 }
  },
}

function defaultPositionFor(id: DesktopWindowId): WindowPoint {
  return defaultPositions[id]?.() ?? centerWindow(440, 360)
}

export function useDesktopWindowStack() {
  const [openIds, setOpenIds] = useState<DesktopWindowId[]>([])
  const [positions, setPositions] = useState<Record<string, WindowPoint>>({})
  const [zById, setZById] = useState<Record<string, number>>({})
  const zCounterRef = useRef(BASE_Z)

  const focusWindow = useCallback((id: DesktopWindowId) => {
    zCounterRef.current += 1
    setZById((prev) => ({ ...prev, [id]: zCounterRef.current }))
  }, [])

  const openWindow = useCallback(
    (id: DesktopWindowId) => {
      setOpenIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      setPositions((prev) => (prev[id] ? prev : { ...prev, [id]: defaultPositionFor(id) }))
      focusWindow(id)
    },
    [focusWindow],
  )

  const closeWindow = useCallback((id: DesktopWindowId) => {
    setOpenIds((prev) => prev.filter((w) => w !== id))
  }, [])

  const setWindowPosition = useCallback((id: DesktopWindowId, point: WindowPoint) => {
    const clamped = clampWindowPoint(point, estimateWindowSize(id))
    setPositions((prev) => ({ ...prev, [id]: clamped }))
  }, [])

  const isOpen = useCallback((id: DesktopWindowId) => openIds.includes(id), [openIds])

  return {
    openIds,
    isOpen,
    openWindow,
    closeWindow,
    focusWindow,
    positions,
    setWindowPosition,
    zById,
  }
}
