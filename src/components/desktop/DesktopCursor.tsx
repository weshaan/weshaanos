import { useEffect, useRef } from 'react'
import {
  DESKTOP_CURSOR_EMBED_EVENT,
  isPointerOverBraveEmbed,
  type DesktopCursorEmbedDetail,
} from './desktopCursorEmbed'
import './DesktopCursor.css'

const HTML_CLASS = 'desktop-cursor--active'
const HTML_EMBED_CLASS = 'desktop-cursor--embed-captive'
const DOCK_GUARD_PX = 148
const DOCK_RING_FADE_PX = 112
const EXIT_TRAVEL = 34

type Props = {
  enabled: boolean
}

function inDockGuardZone(clientY: number): boolean {
  return clientY >= window.innerHeight - DOCK_GUARD_PX
}

function dockRingOpacity(clientY: number): number {
  const guardTop = window.innerHeight - DOCK_GUARD_PX
  const fadeStart = guardTop - DOCK_RING_FADE_PX
  if (clientY < fadeStart) return 1
  if (clientY >= guardTop) return 0
  const t = (clientY - fadeStart) / DOCK_RING_FADE_PX
  const c = Math.max(0, Math.min(1, t))
  const smooth = c * c * (3 - 2 * c)
  return 1 - smooth
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false
  return Boolean(
    target.closest(
      'a, button, input, textarea, select, label, [role="button"], [role="tab"], .desktop-icons__item, .dock__btn',
    ),
  )
}

function ringTransform(x: number, y: number): string {
  return `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
}

export function DesktopCursor({ enabled }: Props) {
  const rootRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLSpanElement>(null)
  const posRef = useRef({ x: -100, y: -100 })
  const prevPosRef = useRef({ x: -100, y: -100 })
  const lastVelRef = useRef({ vx: 0, vy: -4 })
  const visibleRef = useRef(false)
  const pressedRef = useRef(false)
  const pointerishRef = useRef(false)
  const dockNearRef = useRef(false)
  const exitingRef = useRef(false)
  const embedCaptiveRef = useRef(false)
  const exitTimerRef = useRef(0)

  const syncClasses = () => {
    const root = rootRef.current
    if (!root) return
    root.classList.toggle('desktop-cursor--down', pressedRef.current)
    root.classList.toggle('desktop-cursor--pointer', pointerishRef.current)
    root.classList.toggle('desktop-cursor--hidden', !visibleRef.current)
    root.classList.toggle('desktop-cursor--dot-out', exitingRef.current)
    root.classList.toggle('desktop-cursor--dock-near', dockNearRef.current)
    root.classList.toggle('desktop-cursor--exiting', exitingRef.current)
    root.classList.toggle('desktop-cursor--embed', embedCaptiveRef.current)
    document.documentElement.classList.toggle(HTML_EMBED_CLASS, embedCaptiveRef.current)
  }

  const paintDot = (x: number, y: number) => {
    const dot = dotRef.current
    if (!dot) return
    const scale = pressedRef.current ? 0.8 : pointerishRef.current ? 1.28 : 1
    dot.style.transform = `${ringTransform(x, y)} scale(${scale})`
  }

  const paintRing = (x: number, y: number, clientY: number) => {
    const root = rootRef.current
    const ring = ringRef.current
    if (!root || !ring) return

    const dockOp = dockRingOpacity(clientY)
    const inGuard = inDockGuardZone(clientY)
    root.classList.toggle('desktop-cursor--dock-fade', dockOp < 0.995 && !inGuard)
    root.style.setProperty('--ring-opacity', String(dockOp))
    root.style.setProperty('--ring-move-ms', inGuard || dockOp < 0.45 ? '130' : '240')

    ring.style.transform = ringTransform(x, y)
  }

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const active = enabled && finePointer && !reduceMotion

    if (active) document.documentElement.classList.add(HTML_CLASS)
    else document.documentElement.classList.remove(HTML_CLASS)

    if (!active) return () => document.documentElement.classList.remove(HTML_CLASS)

    const dot = dotRef.current
    const ring = ringRef.current
    const root = rootRef.current
    if (!dot || !ring || !root) return () => document.documentElement.classList.remove(HTML_CLASS)

    const clearExitTimer = () => {
      window.clearTimeout(exitTimerRef.current)
      exitTimerRef.current = 0
    }

    const finishExit = () => {
      clearExitTimer()
      exitingRef.current = false
      visibleRef.current = false
      syncClasses()
    }

    const enterEmbedCapture = () => {
      if (embedCaptiveRef.current) return
      clearExitTimer()
      exitingRef.current = false
      embedCaptiveRef.current = true
      ring.classList.add('desktop-cursor__ring--no-transition')
      syncClasses()
    }

    const onMove = (e: PointerEvent) => {
      const { clientX, clientY } = e
      const overEmbed = isPointerOverBraveEmbed(clientX, clientY)

      if (overEmbed) {
        enterEmbedCapture()
        return
      }

      if (embedCaptiveRef.current) {
        embedCaptiveRef.current = false
        document.documentElement.classList.remove(HTML_EMBED_CLASS)
        syncClasses()
      }

      if (exitingRef.current) {
        exitingRef.current = false
        clearExitTimer()
        ring.classList.remove('desktop-cursor__ring--no-transition')
        syncClasses()
      }

      const prev = prevPosRef.current
      lastVelRef.current = { vx: clientX - prev.x, vy: clientY - prev.y }
      posRef.current = { x: clientX, y: clientY }
      prevPosRef.current = { x: clientX, y: clientY }

      if (!visibleRef.current) {
        visibleRef.current = true
        lastVelRef.current = { vx: 0, vy: 0 }
        ring.classList.add('desktop-cursor__ring--no-transition')
        ring.style.transform = ringTransform(clientX, clientY)
        void ring.offsetWidth
        ring.classList.remove('desktop-cursor__ring--no-transition')
        syncClasses()
      }

      const pointerish = isInteractiveTarget(e.target)
      if (pointerish !== pointerishRef.current) {
        pointerishRef.current = pointerish
        syncClasses()
      }

      const inGuard = inDockGuardZone(clientY)
      if (inGuard !== dockNearRef.current) {
        dockNearRef.current = inGuard
        syncClasses()
      }

      paintDot(clientX, clientY)
      paintRing(clientX, clientY, clientY)
    }

    const onEmbedCapture = (e: Event) => {
      const { active, clientX, clientY } = (e as CustomEvent<DesktopCursorEmbedDetail>).detail
      if (active) {
        enterEmbedCapture()
        return
      }

      if (!embedCaptiveRef.current) return

      embedCaptiveRef.current = false
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        posRef.current = { x: clientX, y: clientY }
        prevPosRef.current = { x: clientX, y: clientY }
        lastVelRef.current = { vx: 0, vy: 0 }
        visibleRef.current = true
        ring.classList.add('desktop-cursor__ring--no-transition')
        paintDot(clientX, clientY)
        paintRing(clientX, clientY, clientY)
        requestAnimationFrame(() => {
          ring.classList.remove('desktop-cursor__ring--no-transition')
        })
      }
      syncClasses()
    }

    const onLeave = (e: MouseEvent) => {
      if (embedCaptiveRef.current || !visibleRef.current || exitingRef.current) return

      const { x, y } = posRef.current
      let dx = lastVelRef.current.vx
      let dy = lastVelRef.current.vy
      const speed = Math.hypot(dx, dy)
      if (speed < 0.5) {
        const pad = 6
        const cx = e.clientX
        const cy = e.clientY
        if (cy <= pad) dy = -5
        else if (cy >= window.innerHeight - pad) dy = 5
        if (cx <= pad) dx = -5
        else if (cx >= window.innerWidth - pad) dx = 5
        if (dx === 0 && dy === 0) dy = -4
      } else {
        const scale = EXIT_TRAVEL / speed
        dx *= scale
        dy *= scale
      }

      exitingRef.current = true
      syncClasses()

      root.style.setProperty('--ring-opacity', '0')
      root.style.setProperty('--ring-move-ms', '420')
      ring.style.transform = ringTransform(x + dx, y + dy)

      clearExitTimer()
      exitTimerRef.current = window.setTimeout(finishExit, 480)
    }

    const onDown = () => {
      pressedRef.current = true
      syncClasses()
      paintDot(posRef.current.x, posRef.current.y)
    }

    const onUp = () => {
      pressedRef.current = false
      syncClasses()
      paintDot(posRef.current.x, posRef.current.y)
    }

    syncClasses()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener(DESKTOP_CURSOR_EMBED_EVENT, onEmbedCapture)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      clearExitTimer()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener(DESKTOP_CURSOR_EMBED_EVENT, onEmbedCapture)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.classList.remove(HTML_CLASS)
      document.documentElement.classList.remove(HTML_EMBED_CLASS)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={rootRef} className="desktop-cursor desktop-cursor--hidden" aria-hidden>
      <span ref={ringRef} className="desktop-cursor__ring" />
      <span ref={dotRef} className="desktop-cursor__dot" />
    </div>
  )
}
