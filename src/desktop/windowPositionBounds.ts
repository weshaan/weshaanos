import type { WindowPoint } from '../hooks/useDraggableWindow'

export type WindowSize = { width: number; height: number }

const WINDOW_SIZES: Record<string, WindowSize> = {
  resume: { width: 720, height: 820 },
  finder: { width: 860, height: 515 },
  weather: { width: 960, height: 620 },
  calculator: { width: 228, height: 440 },
  calendar: { width: 400, height: 520 },
  games: { width: 720, height: 520 },
  clock: { width: 620, height: 420 },
  musicapp: { width: 311, height: 548 },
  browser: { width: 1060, height: 660 },
  notes: { width: 920, height: 580 },
  profile: { width: 440, height: 360 },
  mail: { width: 440, height: 220 },
  settings: { width: 440, height: 420 },
  terminal: { width: 440, height: 300 },
  projects: { width: 440, height: 260 },
  images: { width: 440, height: 260 },
  misc: { width: 440, height: 260 },
  localhost: { width: 440, height: 260 },
}

/** Short panels (MacWindow) — clamp must not assume taller than this. */
const PANEL_MAX_CLAMP_HEIGHT = 520

const FALLBACK_SIZE: WindowSize = { width: 440, height: 260 }

const MENU_BAR = 28
const MIN_ON_SCREEN = 72

function viewportSize(): { width: number; height: number } {
  if (typeof window === 'undefined') return { width: 1280, height: 800 }
  return { width: window.innerWidth, height: window.innerHeight }
}

export function estimateWindowSize(windowId: string): WindowSize {
  const { width: vw, height: vh } = viewportSize()

  if (windowId === 'resume') {
    return {
      width: Math.min(720, vw * 0.94),
      height: Math.min(820, vh * 0.78),
    }
  }

  if (windowId === 'browser') {
    const base = WINDOW_SIZES.browser
    return {
      width: Math.min(base.width, vw * 0.96),
      height: Math.min(base.height, vh * 0.9),
    }
  }

  if (windowId === 'games') {
    return {
      width: Math.min(720, vw * 0.96),
      height: Math.min(760, vh * 0.96),
    }
  }

  const base = WINDOW_SIZES[windowId] ?? FALLBACK_SIZE
  const height = Math.min(base.height, vh * 0.9, PANEL_MAX_CLAMP_HEIGHT)
  return {
    width: Math.min(base.width, vw * 0.96),
    height,
  }
}

/** Keep at least MIN_ON_SCREEN px of the window inside the viewport on every side. */
export function clampWindowPoint(point: WindowPoint, size: WindowSize): WindowPoint {
  const { width: vw, height: vh } = viewportSize()
  const { width, height } = size

  const minX = MIN_ON_SCREEN - width
  const maxX = vw - MIN_ON_SCREEN
  const minY = MENU_BAR + MIN_ON_SCREEN - height
  const maxY = vh - MIN_ON_SCREEN

  return {
    x: Math.min(Math.max(point.x, minX), maxX),
    y: Math.min(Math.max(point.y, minY), maxY),
  }
}
