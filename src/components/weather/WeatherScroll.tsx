import { useCallback, useEffect, useRef, useState } from 'react'
import './WeatherScroll.css'

type Props = {
  className?: string
  children: React.ReactNode
}

type ThumbState = { size: number; offset: number; show: boolean }

type ScrollMetrics = {
  thumbSize: number
  maxThumbOffset: number
  scrollRange: number
}

function getScrollMetrics(viewport: HTMLDivElement, trackEl: HTMLDivElement | null): ScrollMetrics {
  const { scrollHeight, clientHeight } = viewport
  const trackHeight = trackEl?.clientHeight ?? clientHeight
  const ratio = scrollHeight > 0 ? clientHeight / scrollHeight : 1
  const thumbSize = Math.min(trackHeight, Math.max(28, ratio * trackHeight))
  const maxThumbOffset = Math.max(0, trackHeight - thumbSize)
  const scrollRange = Math.max(0, scrollHeight - clientHeight)
  return { thumbSize, maxThumbOffset, scrollRange }
}

function scrollTopForThumbOffset(offset: number, metrics: ScrollMetrics): number {
  if (metrics.maxThumbOffset <= 0) return 0
  return (offset / metrics.maxThumbOffset) * metrics.scrollRange
}

export function WeatherScroll({ className, children }: Props) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [thumb, setThumb] = useState<ThumbState>({ size: 0, offset: 0, show: false })

  const update = useCallback(() => {
    if (draggingRef.current) return
    const el = viewportRef.current
    const track = trackRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollHeight <= clientHeight + 2) {
      setThumb({ size: 0, offset: 0, show: false })
      return
    }
    const metrics = getScrollMetrics(el, track)
    const offset =
      metrics.scrollRange > 0 ? (scrollTop / metrics.scrollRange) * metrics.maxThumbOffset : 0
    setThumb({ size: metrics.thumbSize, offset, show: true })
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    for (const child of el.children) ro.observe(child)
    if (trackRef.current) ro.observe(trackRef.current)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [update, children])

  const scrollToThumbCenter = useCallback((clientY: number, smooth: boolean) => {
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    const rect = track.getBoundingClientRect()
    const y = clientY - rect.top
    const metrics = getScrollMetrics(viewport, track)
    const thumbOffset = Math.max(0, Math.min(metrics.maxThumbOffset, y - metrics.thumbSize / 2))
    const top = scrollTopForThumbOffset(thumbOffset, metrics)

    if (smooth) {
      viewport.scrollTo({ top, behavior: 'smooth' })
    } else {
      viewport.scrollTop = top
    }
  }, [])

  const onTrackPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).classList.contains('weather-scroll__thumb')) return
      scrollToThumbCenter(e.clientY, true)
    },
    [scrollToThumbCenter],
  )

  const onThumbPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const viewport = viewportRef.current
    const track = trackRef.current
    if (!viewport || !track) return

    draggingRef.current = true

    const onMove = (ev: PointerEvent) => {
      const metrics = getScrollMetrics(viewport, track)
      const rect = track.getBoundingClientRect()
      const y = ev.clientY - rect.top
      const thumbOffset = Math.max(0, Math.min(metrics.maxThumbOffset, y - metrics.thumbSize / 2))
      viewport.scrollTop = scrollTopForThumbOffset(thumbOffset, metrics)
      setThumb({ size: metrics.thumbSize, offset: thumbOffset, show: true })
    }

    const onUp = () => {
      draggingRef.current = false
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }

    onMove(e.nativeEvent)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }, [])

  return (
    <div className={`weather-scroll${className ? ` ${className}` : ''}`}>
      <div ref={viewportRef} className="weather-scroll__viewport">
        {children}
      </div>
      {thumb.show ? (
        <div
          ref={trackRef}
          className="weather-scroll__track"
          onPointerDown={onTrackPointerDown}
          aria-hidden
        >
          <div
            className="weather-scroll__thumb"
            style={{ height: thumb.size, transform: `translateY(${thumb.offset}px)` }}
            onPointerDown={onThumbPointerDown}
          />
        </div>
      ) : null}
    </div>
  )
}
