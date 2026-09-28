import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  DEFAULT_CLOCK_TIME_FORMAT,
  isClockTimeFormat,
  type ClockTimeFormat,
} from '../clock/clockFormat'
import { DEFAULT_CLOCK_FACE, isClockFaceId, type ClockFaceId } from '../clock/clockFaces'

const FACE_STORAGE_KEY = 'portfolio-clock-face'
const FORMAT_STORAGE_KEY = 'portfolio-clock-format'
const SECONDS_STORAGE_KEY = 'portfolio-clock-seconds'

function readFace(): ClockFaceId {
  if (typeof window === 'undefined') return DEFAULT_CLOCK_FACE
  try {
    const raw = localStorage.getItem(FACE_STORAGE_KEY)
    if (raw && isClockFaceId(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_CLOCK_FACE
}

function writeFace(id: ClockFaceId) {
  try {
    localStorage.setItem(FACE_STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
}

function readTimeFormat(): ClockTimeFormat {
  if (typeof window === 'undefined') return DEFAULT_CLOCK_TIME_FORMAT
  try {
    const raw = localStorage.getItem(FORMAT_STORAGE_KEY)
    if (raw && isClockTimeFormat(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_CLOCK_TIME_FORMAT
}

function writeTimeFormat(format: ClockTimeFormat) {
  try {
    localStorage.setItem(FORMAT_STORAGE_KEY, format)
  } catch {
    /* ignore */
  }
}

function readShowSeconds(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = localStorage.getItem(SECONDS_STORAGE_KEY)
    if (raw === '0' || raw === 'false') return false
    if (raw === '1' || raw === 'true') return true
  } catch {
    /* ignore */
  }
  return true
}

function writeShowSeconds(show: boolean) {
  try {
    localStorage.setItem(SECONDS_STORAGE_KEY, show ? '1' : '0')
  } catch {
    /* ignore */
  }
}

type ClockWidgetContextValue = {
  faceId: ClockFaceId
  setFaceId: (id: ClockFaceId) => void
  timeFormat: ClockTimeFormat
  setTimeFormat: (format: ClockTimeFormat) => void
  showSeconds: boolean
  setShowSeconds: (show: boolean) => void
}

const ClockWidgetContext = createContext<ClockWidgetContextValue | null>(null)

export function ClockWidgetProvider({ children }: { children: ReactNode }) {
  const [faceId, setFaceIdState] = useState<ClockFaceId>(readFace)
  const [timeFormat, setTimeFormatState] = useState<ClockTimeFormat>(readTimeFormat)
  const [showSeconds, setShowSecondsState] = useState<boolean>(readShowSeconds)

  const setFaceId = useCallback((id: ClockFaceId) => {
    setFaceIdState(id)
    writeFace(id)
  }, [])

  const setTimeFormat = useCallback((format: ClockTimeFormat) => {
    setTimeFormatState(format)
    writeTimeFormat(format)
  }, [])

  const setShowSeconds = useCallback((show: boolean) => {
    setShowSecondsState(show)
    writeShowSeconds(show)
  }, [])

  const value = useMemo(
    () => ({ faceId, setFaceId, timeFormat, setTimeFormat, showSeconds, setShowSeconds }),
    [faceId, setFaceId, timeFormat, setTimeFormat, showSeconds, setShowSeconds],
  )

  return <ClockWidgetContext.Provider value={value}>{children}</ClockWidgetContext.Provider>
}

export function useClockWidget() {
  const ctx = useContext(ClockWidgetContext)
  if (!ctx) throw new Error('useClockWidget must be used within ClockWidgetProvider')
  return ctx
}
